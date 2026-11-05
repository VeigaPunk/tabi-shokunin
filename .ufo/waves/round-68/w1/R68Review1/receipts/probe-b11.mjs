// B11: no-work enumeration — zero-contested ledgers, and empty lane-marker missing.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const SNAPSHOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const ledgerBuf = fs.readFileSync(LEDGER);

// B11a: same ledger with all contested-open → reviewed (flip disposition)
const ledgerA = ledgerBuf.toString('utf8').split('\n').map((l) => {
  const p = l.split('\t');
  if (p[0] === 'line' && p[7] === 'contested-open') p[7] = 'side-by-side-mixed';
  return p.join('\t');
}).join('\n');
fs.writeFileSync(path.join(SC, 'b11a-ledger.tsv'), ledgerA);
const wsEmpty = [ 'lane\tpath\thead\tquote\tstatus\tadjudicator\tverdict\treason\tdate' ].join('\n') + '\n';
fs.writeFileSync(path.join(SC, 'b11-ws-empty.tsv'), wsEmpty);

const run = (argsList) => {
  try { const o = execFileSync('/usr/bin/node', [GATE, ...argsList], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); return { rc: 0, out: o }; }
  catch (e) { return { rc: e.status, out: e.stdout || '' }; }
};
const ledgerASha = sha(Buffer.from(ledgerA));
const snapSha = sha(fs.readFileSync(SNAPSHOT));

// no-work ledger + empty worksheet: green?
let r = run(['--ledger', path.join(SC, 'b11a-ledger.tsv'), '--snapshot', SNAPSHOT, '--worksheet', path.join(SC, 'b11-ws-empty.tsv'), '--fleet', FLEET,
  '--expect-ledger-sha256', ledgerASha, '--expect-snapshot-sha256', snapSha]);
console.log('B11a zero-contested+empty-ws rc=' + r.rc + ' ' + r.out.trim());
// same + pending assertion: catches?
r = run(['--ledger', path.join(SC, 'b11a-ledger.tsv'), '--snapshot', SNAPSHOT, '--worksheet', path.join(SC, 'b11-ws-empty.tsv'), '--fleet', FLEET,
  '--expect-ledger-sha256', ledgerASha, '--expect-snapshot-sha256', snapSha, '--expect-pending', '49']);
console.log('B11a2 zero-contested+empty-ws+assert rc=' + r.rc + ' ' + r.out.trim());
// but a worksheet with rows -> all unknown-key
r = run(['--ledger', path.join(SC, 'b11a-ledger.tsv'), '--snapshot', SNAPSHOT, '--worksheet', path.join(SC, 'ws-regen.tsv'), '--fleet', FLEET,
  '--expect-ledger-sha256', ledgerASha, '--expect-snapshot-sha256', snapSha]);
let pa = JSON.parse(r.out || '{}');
console.log('B11a3 zero-contested+49-row-ws rc=' + r.rc + ' byCheck=' + JSON.stringify(pa.byCheck));

// B11b: ledger with lane header missing head column (8 fields on lane row)
const ledgerB = ledgerBuf.toString('utf8').split('\n').map((l) => {
  const p = l.split('\t');
  return p[0] === 'lane' ? p.slice(0, 8).join('\t') : l;
}).join('\n');
fs.writeFileSync(path.join(SC, 'b11b-ledger.tsv'), ledgerB);
r = run(['--ledger', path.join(SC, 'b11b-ledger.tsv'), '--snapshot', SNAPSHOT, '--worksheet', path.join(SC, 'ws-regen.tsv'), '--fleet', FLEET,
  '--expect-ledger-sha256', sha(Buffer.from(ledgerB)), '--expect-snapshot-sha256', snapSha]);
pa = JSON.parse(r.out || '{}');
console.log('B11b lane-head-missing rc=' + r.rc + ' byCheck=' + JSON.stringify(pa.byCheck).slice(0, 150));

// B11c: ledger line row whose head col carries a head (extra col count 10)
const ledgerC = ledgerBuf.toString('utf8').split('\n').map((l) => {
  const p = l.split('\t');
  if (p[0] === 'line' && p[7] === 'contested-open') p.push('extrahead');
  return p.join('\t');
}).join('\n');
fs.writeFileSync(path.join(SC, 'b11c-ledger.tsv'), ledgerC);
r = run(['--ledger', path.join(SC, 'b11c-ledger.tsv'), '--snapshot', SNAPSHOT, '--worksheet', path.join(SC, 'ws-regen.tsv'), '--fleet', FLEET,
  '--expect-ledger-sha256', sha(Buffer.from(ledgerC)), '--expect-snapshot-sha256', snapSha]);
pa = JSON.parse(r.out || '{}');
console.log('B11c line-extra-col rc=' + r.rc + ' byCheck=' + JSON.stringify(pa.byCheck).slice(0, 180));
