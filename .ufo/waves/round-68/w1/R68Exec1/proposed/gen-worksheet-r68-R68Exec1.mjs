#!/usr/bin/env node
// gen-worksheet-r68-R68Exec1.mjs — independent C1 worksheet generator, seat R68Exec1.
//
// NOT the round-68 counter (.ufo/waves/round-68/counters/build-worksheet-r68.mjs);
// written from scratch so the worksheet can be cross-validated independently.
// Differences from the counter: columns are resolved by HEADER NAME (quote =
// the column literally named "quote"), ledger lane-row head is cross-checked
// against the snapshot head per lane (hard failure on mismatch), and the
// r[5]-bug signature (quote cell '-' or empty) is a hard failure.
//
// usage: node gen-worksheet-r68-R68Exec1.mjs --ledger <tsv> --snapshot <tsv> --out <tsv>

import fs from 'node:fs';
import { createHash } from 'node:crypto';

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
  process.stderr.write('usage: node gen-worksheet-r68-R68Exec1.mjs --ledger <tsv> --snapshot <tsv> --out <tsv>\n');
  process.exit(2);
}

function fail(msg) {
  process.stderr.write('fatal: ' + msg + '\n');
  process.exit(1);
}

const ledgerLines = fs.readFileSync(args.ledger, 'utf8').split('\n').filter((l) => l.length > 0);
const snapLines = fs.readFileSync(args.snapshot, 'utf8').split('\n').filter((l) => l.length > 0);

const lhdr = ledgerLines[0].split('\t');
if (lhdr[0] !== 'type') fail('ledger header must start with "type"');
const L = {
  type: 0,
  lane: lhdr.indexOf('lane'),
  path: lhdr.indexOf('path'),
  quote: lhdr.indexOf('quote'),
  disposition: lhdr.indexOf('disposition'),
  head: lhdr.indexOf('head'),
};
for (const k of ['lane', 'path', 'quote', 'disposition', 'head']) {
  if (L[k] < 0) fail('ledger header lacks column ' + k);
}

const shdr = snapLines[0].split('\t');
if (shdr[0] !== 'lane' || shdr[1] !== 'head') fail('snapshot header must be lane<TAB>head');
const snapHeads = {};
for (let i = 1; i < snapLines.length; i++) {
  const c = snapLines[i].split('\t');
  if (c.length < 2) fail('snapshot row shape line ' + (i + 1));
  snapHeads[c[0]] = c[1];
}

const ledgerLaneHeads = {};
const outRows = ['lane\tpath\thead\tquote\tstatus\tadjudicator\tverdict\treason\tdate'];
let currentLane = null;
let contested = 0;
for (let i = 1; i < ledgerLines.length; i++) {
  const r = ledgerLines[i].split('\t');
  if (r.length !== lhdr.length) fail('ledger row shape line ' + (i + 1));
  if (r[L.type] === 'lane') {
    currentLane = r[L.lane];
    ledgerLaneHeads[currentLane] = r[L.head];
    continue;
  }
  if (r[L.type] !== 'line') fail('unknown ledger type ' + JSON.stringify(r[L.type]) + ' line ' + (i + 1));
  if (r[L.disposition] !== 'contested-open') continue;
  const lane = r[L.lane];
  const head = snapHeads[lane];
  if (!head) fail('no snapshot head for lane ' + lane);
  if (ledgerLaneHeads[lane] === undefined) fail('contested row before lane header row: line ' + (i + 1));
  if (ledgerLaneHeads[lane] !== head) fail('ledger/snapshot head mismatch for lane ' + lane);
  if (!/^[0-9a-f]{40}$/.test(head)) fail('snapshot head not hex40 for lane ' + lane);
  const quote = r[L.quote];
  if (quote === undefined || quote.length === 0 || quote === '-') {
    fail('quote cell empty or "-" (r[5]-bug signature) at line ' + (i + 1));
  }
  if (quote.includes('\t') || quote.includes('\n')) fail('quote contains tab/newline line ' + (i + 1));
  outRows.push([lane, r[L.path], head, quote, 'pending-non-author', '—', '—', '—', '—'].join('\t'));
  contested++;
}
if (contested === 0) fail('no contested-open rows found');
const text = outRows.join('\n') + '\n';
fs.writeFileSync(args.out, text);
process.stdout.write(JSON.stringify({
  ok: true,
  rows: contested,
  out: args.out,
  worksheetSha256: createHash('sha256').update(text).digest('hex'),
}) + '\n');
