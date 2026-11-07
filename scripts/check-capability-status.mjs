#!/usr/bin/env node
// tabi round 78 C2 (calibration): does every SCORECARD capability row name a round whose recorded
// verdict actually worked? Usage: node scripts/check-capability-status.mjs [--scorecard <path>] [--json]
// Reads every `| Capability |` table in SCORECARD.md, takes each row's first cell (a backticked
// capability name) and its last cell (the first-working round: `round N`, `rN`, or `—` for planned),
// finds the `## Round N` section, and counts a MISMATCH when that section carries the lane's own
// negative verdict word `NOT VERIFIED` (or `honest stop`) while the row is not marked `provisional`.
// Rows with `—` (planned, never entered) are not claims and are skipped. Exit 0 = no mismatch,
// 1 = at least one, 2 = usage/unreadable. The count is the claim: a row that a later round repaired
// must say so (`provisional` dropped only when the repairing round verifies).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = opt('scorecard') || path.join(lane, 'SCORECARD.md');
let text;
try { text = fs.readFileSync(file, 'utf8'); } catch (e) { console.error(JSON.stringify({ error: 'unreadable', detail: e.message })); process.exit(2); }
const lines = text.split('\n');
// Section starts: `## Round N ...`
const sectionOfRound = new Map();
const starts = [];
lines.forEach((l, i) => { const m = /^## Round (\d+)\b/.exec(l); if (m) starts.push({ round: Number(m[1]), i }); });
starts.forEach((s, k) => { const end = k + 1 < starts.length ? starts[k + 1].i : lines.length; sectionOfRound.set(s.round, { head: lines[s.i], body: lines.slice(s.i, end).join('\n') }); });
const NEG = /NOT VERIFIED|honest stop/;
const rows = [], mismatches = [];
let inCap = false;
lines.forEach((l) => {
  if (/^\|\s*Capability\b/.test(l)) { inCap = true; return; }
  if (!inCap) return;
  if (!/^\|/.test(l)) { inCap = false; return; }
  if (/^\|\s*-{2,}/.test(l)) return;
  const cells = l.split('|').slice(1, -1).map((c) => c.trim());
  if (cells.length < 4) return;
  const name = /^`([^`]+)`$/.exec(cells[0]);
  if (!name) return;
  const last = cells[cells.length - 1];
  const roundCell = /(?:round\s*|r)?(\d+)/i.exec(last);
  const row = { capability: name[1], firstWorking: last, round: roundCell ? Number(roundCell[1]) : null, provisional: /provisional/i.test(last) };
  rows.push(row);
  // `—` is a planned, never-entered capability: not a claim. A row that says `provisional` IS a claim
  // and must still name the round whose verdict it inherits (otherwise the label hides the round).
  if (row.round === null && !row.provisional) return;
  if (row.round === null) { mismatches.push({ ...row, why: 'provisional row names no failed round' }); return; }
  const sec = sectionOfRound.get(row.round);
  if (!sec) { mismatches.push({ ...row, why: 'no SCORECARD section for round ' + row.round }); return; }
  if (NEG.test(sec.body) && !row.provisional) mismatches.push({ ...row, why: 'round ' + row.round + ' carries NOT VERIFIED/honest stop and the row is not provisional' });
});
const out = { schema: 'tabi-check-capability-status-r78', scorecard: file, rows: rows.length, claimed: rows.filter((r) => r.round !== null).length, provisional: rows.filter((r) => r.provisional).length, mismatches: mismatches.length, detail: mismatches };
const emit = (s) => { const b = Buffer.from(s); let off = 0; while (off < b.length) { try { off += fs.writeSync(1, b, off); } catch (e) { if (e.code !== 'EAGAIN') throw e; } } };
emit((asJson ? JSON.stringify(out, null, 1) : `capability-status mismatches=${out.mismatches} rows=${out.rows} claimed=${out.claimed}` + mismatches.map((m) => `\n  ${m.capability} (${m.firstWorking}): ${m.why}`).join('')) + '\n');
process.exitCode = mismatches.length === 0 ? 0 : 1;
