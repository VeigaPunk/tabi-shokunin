#!/usr/bin/env node
// build-worksheet-r68.mjs — generates corpus/adjacency-adjudication-r68.tsv,
// the per-row non-author adjudication worksheet for tabi round 68.
//
// Reads the round-66 adjudicated sibling-overlap ledger and the round-66 live
// snapshot, and emits one worksheet row per contested-open ledger row: the
// lane, path key, the snapshot-pinned sibling head, the ledger's quote, and
// status pending-non-author with clean adjudication cells. Deterministic;
// ledger order preserved. Exit 0 on success, 2 on usage, 1 on shape errors.

import fs from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) return null;
    const key = a.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) return null;
    args[key] = val;
    i++;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args || !args.ledger || !args.snapshot || !args.out) {
  process.stderr.write('usage: node build-worksheet-r68.mjs --ledger <tsv> --snapshot <tsv> --out <tsv>\n');
  process.exit(2);
}

const ledgerRows = fs.readFileSync(args.ledger, 'utf8').split('\n').filter((l) => l.length > 0).map((l) => l.split('\t'));
const snapRows = fs.readFileSync(args.snapshot, 'utf8').split('\n').filter((l) => l.length > 0).map((l) => l.split('\t'));
const heads = {};
for (let i = 0; i < snapRows.length; i++) {
  if (i === 0 && snapRows[i][0] === 'lane') continue;
  if (snapRows[i].length >= 2) heads[snapRows[i][0]] = snapRows[i][1];
}
let currentLane = null;
const out = ['lane\tpath\thead\tquote\tstatus\tadjudicator\tverdict\treason\tdate'];
let contested = 0;
for (let i = 0; i < ledgerRows.length; i++) {
  const r = ledgerRows[i];
  if (i === 0 && r[0] === 'type') continue;
  if (r[0] === 'lane') { currentLane = r[1]; continue; }
  if (r[0] === 'line' && r[7] === 'contested-open') {
    const lane = r[1];
    const head = heads[lane];
    if (!head) { process.stderr.write('no snapshot head for lane ' + lane + '\n'); process.exit(1); }
    out.push([lane, r[2], head, r[6], 'pending-non-author', '—', '—', '—', '—'].join('\t'));
    contested++;
  }
}
fs.writeFileSync(args.out, out.join('\n') + '\n');
process.stdout.write(JSON.stringify({ ok: true, rows: contested, out: args.out }) + '\n');
