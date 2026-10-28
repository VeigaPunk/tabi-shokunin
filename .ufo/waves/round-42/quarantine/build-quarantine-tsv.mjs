#!/usr/bin/env node
// build-quarantine-tsv.mjs — assemble .ufo/waves/round-42/quarantine/re-adjudication.tsv
// from the settled wave-1 quarantine seat reports. Read-only over the wave tree;
// writes ONLY the TSV (and a build log) inside .ufo/waves/round-42/quarantine/.
// Row: staged_id \t verdict \t evidence_path (repo-relative). Verdicts come from the
// seat's `VERDICT` line and its per-row evidence files; the L1 reviews before commit.
import fs from 'node:fs';
import path from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const W1 = path.join(LANE, '.ufo/waves/round-42/w1');
const QDIR = path.join(LANE, '.ufo/waves/round-42/quarantine');
const VERDICTS = new Set(['present', 'absent', 'misbound', 'partial', 'unreachable']);

const sliceIds = fs.readFileSync(path.join(QDIR, 'slice-ids.txt'), 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);
const want = new Set(sliceIds);

// map staged id -> { seat, verdict, evidence }
const found = new Map();
const problems = [];

const seats = fs.readdirSync(W1).filter((d) => /^QuarR42\d+$/.test(d));
for (const seat of seats) {
  const dir = path.join(W1, seat);
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const m = f.match(/^evidence-(S\d{3})\.txt$/);
    if (!m) continue;
    const id = m[1];
    if (!want.has(id)) { problems.push(`${seat}/${f}: id not in slice`); continue; }
    const body = fs.readFileSync(path.join(dir, f), 'utf8');
    const vm = body.match(/verdict:\s*(present|absent|misbound|partial|unreachable)\b/i);
    if (!vm) { problems.push(`${seat}/${f}: no verdict line`); continue; }
    const verdict = vm[1].toLowerCase();
    if (found.has(id)) problems.push(`${id}: duplicate evidence (${found.get(id).seat} and ${seat})`);
    found.set(id, { seat, verdict, evidence: `.ufo/waves/round-42/w1/${seat}/${f}` });
  }
}

const missing = sliceIds.filter((id) => !found.has(id));
const tsvRows = sliceIds.map((id) => {
  const r = found.get(id);
  return r ? [id, r.verdict, r.evidence].join('\t') : null;
}).filter(Boolean);

if (missing.length === 0 && tsvRows.length === 38) {
  const out = tsvRows.join('\n') + '\n';
  fs.writeFileSync(path.join(QDIR, 're-adjudication.tsv'), out);
  console.log(JSON.stringify({ ok: true, rows: tsvRows.length, verdictHistogram: tsvRows.reduce((a, l) => { const v = l.split('\t')[1]; a[v] = (a[v] || 0) + 1; return a; }, {}) }));
} else {
  console.log(JSON.stringify({ ok: false, missing, problems: problems.slice(0, 20), rowsReady: tsvRows.length }));
  process.exit(1);
}
