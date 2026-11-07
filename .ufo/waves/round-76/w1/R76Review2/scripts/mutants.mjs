#!/usr/bin/env node
// R76Review2 mutant harness: build a counter copy with ONE exact-string edit (count asserted 1),
// place the frozen battery + pinned driver beside it, run the battery with --first-failure, and
// record the outcome. Also accepts a battery edit (for the flake experiments).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const [S, L, specFile] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const run = (d, work, extra) => new Promise((resolve) => {
  fs.mkdirSync(work, { recursive: true });
  const p = spawn(process.execPath, [path.join(d, 'negatives-dialog-r76.mjs'), '--lane', L,
    '--real', path.join(L, 'corpus/evidence/round76/chromium-js-dialog/receipt.json'),
    '--expect-driver-sha256', '152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51',
    '--expect-nonce', 'tabi-r76-l1-97bf5d560d03',
    '--prior-set', path.join(L, '.ufo/waves/round-76/controls/c1/prior-set.txt'),
    '--laundered', path.join(L, '.ufo/waves/round-76/controls/c1/degenerate-page-stub.receipt.json'),
    '--laundered', path.join(L, '.ufo/waves/round-76/controls/c1/degenerate-eval-trigger.receipt.json'),
    '--laundered', path.join(L, '.ufo/waves/round-76/controls/c1/degenerate-swap-accept.receipt.json'),
    '--work', work, '--json', ...extra], { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (x) => { so += x; }); p.stderr.on('data', (x) => { se += x; });
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j, stderrTail: se.slice(-300) }); });
});

const results = [];
for (const m of spec) {
  const d = path.join(S, 'mut', m.name);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  let counter = fs.readFileSync(path.join(S, 'base/check-dialog-r76.mjs'), 'utf8');
  let battery = fs.readFileSync(path.join(S, 'base/negatives-dialog-r76.mjs'), 'utf8');
  for (const e of m.edits || []) {
    const f = e.file === 'battery' ? battery : counter;
    const n = f.split(e.from).length - 1;
    if (n !== 1) { results.push({ name: m.name, error: `edit ${e.id}: occurs ${n} times` }); continue; }
    const out = f.replace(e.from, e.to);
    if (e.file === 'battery') battery = out; else counter = out;
  }
  fs.writeFileSync(path.join(d, 'check-dialog-r76.mjs'), counter);
  fs.writeFileSync(path.join(d, 'negatives-dialog-r76.mjs'), battery);
  fs.writeFileSync(path.join(d, 'chrome-cdp-dialog-round76.mjs'), fs.readFileSync(path.join(S, 'base/chrome-cdp-dialog-round76.mjs')));
  const r = await run(d, path.join(S, 'work', m.name), m.firstFailure === false ? [] : ['--first-failure']);
  const j = r.j;
  results.push({
    name: m.name, expect: m.expect, note: m.note, code: r.code,
    positiveOk: j ? j.positiveOk : null, positive: j ? j.positive : null,
    stoppedEarly: j ? j.stoppedEarly : null, casesRun: j ? j.cases : null,
    failed: j ? j.failed : null, allOk: j ? j.allOk : null,
    coverageGap: j ? j.coverageGap : null,
    verdict: !j ? 'unparsable' : (r.code === 0 && j.allOk ? 'SURVIVED' : (j.failed.some((f) => !f.startsWith('(')) ? 'KILLED(case)' : (j.failed.includes('(positive)') ? 'KILLED-POSITIVE' : 'CRASHED'))),
    stderrTail: r.stderrTail,
  });
  fs.rmSync(d, { recursive: true, force: true });
}
console.log(JSON.stringify(results, null, 1));
