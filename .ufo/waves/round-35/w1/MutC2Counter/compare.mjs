#!/usr/bin/env node
// compare.mjs — MutC2Counter scratch tool: project control receipts to deterministic
// fields (session ids / context UUIDs / commit revs vary run to run) and diff a mutant
// run against the pristine reference.
// usage: node compare.mjs <refBaselineDir> <mutBaselineDir> <name>...
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const proj = (base, name) => {
  let j = {};
  try { j = JSON.parse(readFileSync(join(base, name + '.json'), 'utf8')); } catch (e) { return { parseError: String(e).slice(0, 140) }; }
  let exit = null;
  try { exit = Number(/exit=(-?\d+)/.exec(readFileSync(join(base, name + '.provenance'), 'utf8'))[1]); } catch {}
  let stderrHead = '';
  try { stderrHead = readFileSync(join(base, name + '.stderr'), 'utf8').split('\n').filter(Boolean)[0] ?? ''; } catch {}
  stderrHead = stderrHead.slice(0, 160);
  const out = { exit, predicate: j.predicate };
  if (name.startsWith('c2-')) {
    out.population = j.population;
    out.admitted = j.admitted;
    out.failing = j.failing;
    out.unmeasured = j.unmeasured;
    out.entry = j.entryFinding ?? null;
    out.receipt = j.receiptFinding ?? null;
    out.binding = j.binding ?? null;
    out.liveShot = j.live ? (j.live.firstShotSha256 ? String(j.live.firstShotSha256).slice(0, 8) : `LIVE_ERR:${String(j.live.error || '').slice(0, 60)}`) : null;
    out.liveCmds = j.live ? j.live.commands ?? null : null;
    out.liveEvents = j.live ? j.live.events ?? null : null;
    out.firstReason = (j.rows || []).map((r) => r.reason).find(Boolean) || null;
    out.reasons = (j.rows || []).map((r) => `${r.id}:${r.reason || (r.verdict === 'no' ? 'unmeasured' : 'admitted')}`).join(',');
  } else {
    out.candidates = j.candidates;
    out.mapped = j.mapped;
    out.screened = j.screened;
    out.unaccounted = j.unaccounted;
    out.newMapped = j.newMapped;
    out.adjacency = j.adjacency && j.adjacency.verdict;
    out.refusals = (j.newRowRefusals || []).map((x) => x.why).join(',');
    out.screenFindings = (j.screenFindings || []).length;
  }
  if (stderrHead) out.stderr = stderrHead;
  return out;
};
const ref = process.argv[2];
const mut = process.argv[3];
const names = process.argv.slice(4);
let changed = 0;
for (const n of names) {
  const a = proj(ref, n);
  const b = proj(mut, n);
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  const same = sa === sb;
  if (!same) changed += 1;
  console.log(`${n}\t${same ? 'SAME' : 'CHANGED'}\n  ref=${sa}\n  mut=${sb}`);
}
console.log(`CHANGED_COUNT=${changed}`);
