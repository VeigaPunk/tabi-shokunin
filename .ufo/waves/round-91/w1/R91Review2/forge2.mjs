#!/usr/bin/env node
// Second wave of forgeries: chooser element identity and answer-node identity.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SCRATCH = '/fast/scratch/hyaku/tabi-r91/R91Review2';
const RECEIPT = path.join(LANE, 'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json');
const COUNTER = path.join(LANE, 'scripts/check-showpicker-proxy-round91.mjs');
const base = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, n) => r.legs.find((l) => l.name === n);

const muts = [
  ['M20 chooser mode flipped to selectMultiple on a single-file chooser (sp91-so-proxy-childact)',
    (r) => { leg(r, 'sp91-so-proxy-childact').choosers[0].params.mode = 'selectMultiple'; }],

  ['M21 chooser backendNodeId set to 999 on a non-answer leg (sp91-so-proxy-childact): chooser owned by no known element',
    (r) => { leg(r, 'sp91-so-proxy-childact').choosers[0].params.backendNodeId = 999; }],

  ['M22 answer leg: chooser, answerSet and DOM.setFileInputFiles all agree on backendNodeId 777 (no element identity binding)',
    (r) => {
      const l = leg(r, 'sp91-xo-proxy-file-answer');
      l.choosers[0].params.backendNodeId = 777;
      l.answerSet.backendNodeId = 777;
      l.cdpSendLog.find((c) => c.method === 'DOM.setFileInputFiles').params.backendNodeId = 777;
    }],

  ['M23 answer leg: chooser backendNodeId 777 while answerSet keeps 10 (cross-binding breaks)',
    (r) => { leg(r, 'sp91-xo-proxy-file-answer').choosers[0].params.backendNodeId = 777; }],
];

const pins = [
  '--lane', LANE, '--expect-driver-sha256', base.driverSha256, '--expect-nonce', base.nonce,
  '--expect-parent-sha256', base.fixture.parent.sha256, '--expect-same-sha256', base.fixture.same.sha256,
  '--expect-child-sha256', base.fixture.child.sha256,
  '--prior-set', '.ufo/waves/round-91/controls/c1/prior-set.txt', '--json',
];
const rows = [];
for (const [name, fn] of muts) {
  const r = clone(); fn(r);
  const file = path.join(SCRATCH, name.slice(0, 3) + '.json');
  fs.writeFileSync(file, JSON.stringify(r));
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, ...pins], { encoding: 'utf8', cwd: LANE, timeout: 120000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  rows.push({ id: name.slice(0, 3), name, exit: p.status, verdict: j && j.verdict, findings: j && j.findings ? j.findings.map((f) => f.id) : [String(p.stdout || p.stderr).slice(0, 300)] });
}
fs.writeFileSync(path.join(SCRATCH, 'results2.json'), JSON.stringify(rows, null, 1));
for (const x of rows) console.log(x.id, 'exit=' + x.exit, x.verdict, JSON.stringify(x.findings));
