// B12: run the real gate against the PRODUCTION worksheet and the r66 assertions.
// Demonstrates quote-mismatch x49 if production has '-' placeholder quotes.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const SNAPSHOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const PROD_WS = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-adjudication-r68.tsv';
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');

let rc, out;
try {
  out = execFileSync('/usr/bin/node', [GATE, '--ledger', LEDGER, '--snapshot', SNAPSHOT, '--worksheet', PROD_WS, '--fleet', FLEET,
    '--expect-ledger-sha256', sha(LEDGER), '--expect-snapshot-sha256', sha(SNAPSHOT)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  rc = 0;
} catch (e) { rc = e.status; out = e.stdout || ''; }
const pa = JSON.parse(out || '{}');
console.log('B12 production worksheet: rc=' + rc, 'ok=' + pa.ok, 'checked=' + pa.checked, 'pending=' + pa.pending,
  'byCheck=' + JSON.stringify(pa.byCheck));
