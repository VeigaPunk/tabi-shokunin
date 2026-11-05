#!/usr/bin/env node
// Counter for tabi round 69 C1 (adjacency): the per-sibling boundary matrix in PROVINCE.md.
// Usage: node check-sibling-matrix-r69.mjs --province <PROVINCE.md> --snapshot <sibling-heads-r69.tsv>
//          --fleet <fleet root> [--json]
// Exit 0 = clean; 1 = findings; 2 = usage / unreadable input.
//
// The matrix is the table under the heading `## Adjacent — sibling matrix`:
//   | lane | relation | head | cite | quote | tabi side |
// Checks (all against the FROZEN snapshot of sibling heads, never live heads):
//   * the sibling set is the snapshot's lane column (20 lanes, tabi excluded); exactly one row
//     per sibling -- missing, duplicate and unknown-lane rows are findings;
//   * relation in {none, adjacent, contested};
//   * head equals the snapshot head for that lane (no older/newer pins);
//   * cite is <repo-relative path>:<line>; the quote (3..25 words) is a verbatim,
//     whitespace-normalised substring of that line of that file at that head;
//   * inbound reciprocity: when the sibling's PROVINCE.md at the head names tabi (word match),
//     the row must cite one of those PROVINCE.md lines, and when any of them says
//     "contested" the relation must be `contested`;
//   * outbound: every sibling lane named in tabi's own `**Refuses:**` paragraph must not be `none`;
//   * tabi side: a non-empty statement of tabi's side of the boundary (>= 4 words).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const emit = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} rows=${o.rows ?? 0} bound=${o.bound ?? 0}/${o.siblings ?? 0} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const provPath = opt('province'); const snapPath = opt('snapshot'); const fleet = opt('fleet');
if (!provPath || !snapPath || !fleet) emit({ verdict: 'usage', findings: [{ id: 'usage', detail: '--province, --snapshot, --fleet required' }] }, 2);
let prov, snapText;
try { prov = fs.readFileSync(provPath, 'utf8'); snapText = fs.readFileSync(snapPath, 'utf8'); } catch (e) { emit({ verdict: 'unreadable', findings: [{ id: 'input-unreadable', detail: e.message }] }, 2); }

const snapLines = snapText.split('\n').filter((l) => l.length);
if (snapLines[0] !== 'lane\tbranch\thead\tcaptured_at') emit({ verdict: 'unreadable', findings: [{ id: 'snapshot-header', detail: JSON.stringify(snapLines[0]) }] }, 2);
const snap = new Map(snapLines.slice(1).map((l) => { const [lane, branch, head] = l.split('\t'); return [lane, { branch, head }]; }));
if (snap.size !== 20 || snap.has('tabi') || [...snap.values()].some((s) => !/^[0-9a-f]{40}$/.test(s.head || ''))) emit({ verdict: 'unreadable', findings: [{ id: 'snapshot-shape', detail: 'expected 20 non-tabi lanes with 40-hex heads, got ' + snap.size }] }, 2);

const findings = [];
const fail = (id, detail) => findings.push({ id, detail });
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const words = (s) => norm(s).split(' ').filter(Boolean).length;
const git = (lane, args) => spawnSync('git', ['-C', path.join(fleet, lane + '-shokunin'), ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
const showFile = (lane, head, p) => { const r = git(lane, ['show', head + ':' + p]); return r.status === 0 ? r.stdout : null; };

// outbound set from tabi's own Refuses paragraph
const refusesMatch = prov.match(/\*\*Refuses:\*\*([\s\S]*?)(\n\n|$)/);
const refusesText = refusesMatch ? refusesMatch[1] : '';
const outbound = [...snap.keys()].filter((lane) => new RegExp('\\b' + lane + '\\b').test(refusesText));
if (!refusesMatch) fail('refuses-paragraph-missing', 'no **Refuses:** paragraph in PROVINCE');

// parse matrix section
const secStart = prov.search(/^## Adjacent — sibling matrix\b.*$/m);
const rows = [];
if (secStart < 0) fail('matrix-missing', 'no "## Adjacent — sibling matrix" section');
else {
  const rest = prov.slice(secStart).split('\n').slice(1);
  const end = rest.findIndex((l) => /^## /.test(l));
  const body = end < 0 ? rest : rest.slice(0, end);
  const table = body.filter((l) => /^\|/.test(l));
  if (table.length < 2 || !/^\|\s*lane\s*\|\s*relation\s*\|\s*head\s*\|\s*cite\s*\|\s*quote\s*\|\s*tabi side\s*\|\s*$/.test(table[0]) || !/^\|[\s|:-]+\|\s*$/.test(table[1])) fail('matrix-header', 'table header must be | lane | relation | head | cite | quote | tabi side | plus a separator row');
  for (const line of table.slice(2)) {
    const cells = line.replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
    if (cells.length !== 6) { fail('row-shape', 'expected 6 cells: ' + line.slice(0, 120)); continue; }
    const [lane, relation, head, cite, quote, side] = cells.map((c) => c.replace(/^`|`$/g, '').replace(/\\\|/g, '|'));
    rows.push({ lane, relation, head, cite, quote, side });
  }
}

const seen = new Map();
let bound = 0;
const inbound = [];
for (const r of rows) {
  if (!snap.has(r.lane)) { fail('unknown-lane', r.lane); continue; }
  if (seen.has(r.lane)) { fail('duplicate-lane', r.lane + ' (relations ' + seen.get(r.lane) + ' / ' + r.relation + ')'); continue; }
  seen.set(r.lane, r.relation);
  let ok = true;
  const bad = (id, d) => { ok = false; fail(id, r.lane + ': ' + d); };
  if (!['none', 'adjacent', 'contested'].includes(r.relation)) bad('relation-vocab', r.relation);
  if (r.head !== snap.get(r.lane).head) bad('head-not-snapshot', r.head + ' != ' + snap.get(r.lane).head);
  const m = r.cite.match(/^([^:\s]+):(\d+)$/);
  let lineText = null;
  if (!m) bad('cite-shape', r.cite);
  else {
    const file = showFile(r.lane, snap.get(r.lane).head, m[1]);
    if (file === null) bad('cite-file-absent', m[1] + ' at snapshot head');
    else {
      lineText = file.split('\n')[Number(m[2]) - 1];
      if (lineText === undefined) bad('cite-line-absent', r.cite);
    }
  }
  const qw = words(r.quote);
  if (qw < 3 || qw > 25) bad('quote-length', qw + ' words');
  if (lineText !== null && lineText !== undefined && !norm(lineText.replace(/`/g, '')).includes(norm(r.quote.replace(/`/g, '')))) bad('quote-off-line', JSON.stringify(r.quote.slice(0, 60)) + ' not on ' + r.cite);
  if (words(r.side) < 4) bad('tabi-side-empty', JSON.stringify(r.side));
  // inbound reciprocity
  const sp = showFile(r.lane, snap.get(r.lane).head, 'PROVINCE.md');
  if (sp !== null) {
    const named = sp.split('\n').map((t, i) => ({ n: i + 1, t })).filter((x) => /\btabi\b/i.test(x.t));
    if (named.length) {
      inbound.push(r.lane);
      if (!(m && m[1] === 'PROVINCE.md' && named.some((x) => x.n === Number(m[2])))) bad('inbound-unanswered', 'sibling PROVINCE names tabi at lines ' + named.map((x) => x.n).join(',') + '; row cites ' + r.cite);
      if (named.some((x) => /contested/i.test(x.t)) && r.relation !== 'contested') bad('inbound-contested-unnamed', 'sibling declares contested scope naming tabi; relation ' + r.relation);
      if (r.relation === 'none') bad('inbound-relation-none', 'sibling names tabi; relation none');
    }
  }
  if (outbound.includes(r.lane) && r.relation === 'none') bad('outbound-relation-none', 'tabi refuses scope to this lane');
  if (ok) bound++;
}
for (const lane of snap.keys()) if (!seen.has(lane) && secStart >= 0) fail('lane-missing', lane);
emit({ verdict: findings.length ? 'red' : 'clean', siblings: snap.size, rows: rows.length, bound, inbound, outbound, findings }, findings.length ? 1 : 0);
