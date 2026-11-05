// B10: does the gate tie head-shape fail to resolutions (leak probe) —
// construct a worksheet where row 1's head is 'HEAD' (fails HEX40 → continue)
// and the row would otherwise fail; do other rows still resolve; does a
// fully-'HEAD' worksheet crash or quietly exit 0?
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const SC = '/fast/scratch/hyaku/tabi-r68/R68Review1';
const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-adjacency-adjudication-r68.mjs';
const LEDGER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const SNAPSHOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const base = (ws) => ['--ledger', LEDGER, '--snapshot', SNAPSHOT, '--worksheet', ws, '--fleet', FLEET,
  '--expect-ledger-sha256', sha(LEDGER), '--expect-snapshot-sha256', sha(SNAPSHOT)];

const lines = fs.readFileSync(path.join(SC, 'ws-regen.tsv'), 'utf8').split('\n').filter((l) => l.length > 0);
const HDR = lines[0];
const data = lines.slice(1).map((l) => l.split('\t'));

// B10a: set row 1 head = 'HEAD' → head-shape; row continues past git. Check full findings.
const d1 = data.slice();
d1[0] = d1[0].slice(); d1[0][2] = 'HEAD';
fs.writeFileSync(path.join(SC, 'b10a-head.tsv'), [HDR, ...d1.map((r) => r.join('\t'))].join('\n') + '\n');
// B10b: set row 1 head = a 40-hex of a garbage commit OTHER than snapshot head, but same quote-> path.
// This should trip head-mismatch only (head differs from ledger laneHead) and path-unresolved.
const d2 = data.slice();
d2[0] = d2[0].slice(); d2[0][2] = 'f'.repeat(40);
fs.writeFileSync(path.join(SC, 'b10b-head.tsv'), [HDR, ...d2.map((r) => r.join('\t'))].join('\n') + '\n');
// B10c: two rows whose head==laneHead but file part changed to a noncontested existing file (same lane),
// e.g. tabi-corpus.md:1 if resolvable, keeping its contested quote → quote-unresolved expected.
const d3 = data.slice();
d3[0] = d3[0].slice(); d3[0][1] = 'corpus/adjacency.tsv:1';
fs.writeFileSync(path.join(SC, 'b10c-path.tsv'), [HDR, ...d3.map((r) => r.join('\t'))].join('\n') + '\n');

const probe = (name, p) => {
  let rc, out;
  try { out = execFileSync('/usr/bin/node', [GATE, ...base(p)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); rc = 0; }
  catch (e) { rc = e.status; out = e.stdout || ''; }
  const pa = JSON.parse(out || '{}');
  console.log(name, 'rc=' + rc, 'ok=' + pa.ok, 'findings=' + JSON.stringify(pa.findings).slice(0, 220));
};
probe('B10a-head-shape-HEAD', path.join(SC, 'b10a-head.tsv'));
probe('B10b-head-40f', path.join(SC, 'b10b-head.tsv'));
probe('B10c-wrong-path-same-lane', path.join(SC, 'b10c-path.tsv'));
