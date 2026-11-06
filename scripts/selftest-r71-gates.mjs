#!/usr/bin/env node
// Self-test for the round-71 gates (registry home: SKILL.md `## Round 71 gate registry`).
// Usage: node scripts/selftest-r71-gates.mjs --selftest --scratch <ABS short dir> [--gate synthpinch|live]
//   synthpinch: runs scripts/negatives-synthpinch-r71.mjs on the committed scored receipt and the
//             three committed degenerate receipts (positive clean, every case refused for its
//             expected id with no undeclared co-firing id, no coverage gap) and checks the counter
//             declares 87 check ids.
//   live:     runs scripts/verify-live-r71.mjs through its Chromium-free paths and asserts exit
//             AND finding ids: NODE_OPTIONS in the environment (2, env-injection), NODE_PATH in
//             the environment (2, env-injection), node execArgv on the verifier (2, exec-argv),
//             --no-run (1, no-run), tampered driver (2, driver-pin), scratch too long
//             (2, scratch-path-too-long). It never launches a browser; the live positive run is
//             the gate's entry command itself, and the attack classes are measured by
//             .ufo/waves/round-71/controls/c2/attack-harness.mjs.
// Exit 0 all cases as expected; 1 any case off; 2 usage. Writes only under --scratch.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const scratch = opt('scratch'); const gate = opt('gate');
if (!argv.includes('--selftest') || !scratch || !path.isAbsolute(scratch) || (gate && !['synthpinch', 'live'].includes(gate))) {
  console.error('usage: node scripts/selftest-r71-gates.mjs --selftest --scratch <ABS short dir> [--gate synthpinch|live]'); process.exit(2);
}
fs.mkdirSync(scratch, { recursive: true });
const clean = () => { const e = { ...process.env }; for (const k of Object.keys(e)) if (/^(NODE_OPTIONS|NODE_PATH|NODE_REPL_EXTERNAL_MODULE|LD_PRELOAD|LD_AUDIT|LD_LIBRARY_PATH|DYLD_)/.test(k)) delete e[k]; return e; };
const node = (args, env = {}, pre = []) => { const r = spawnSync(process.execPath, [...pre, ...args], { encoding: 'utf8', timeout: 600000, env: { ...clean(), ...env } }); let j = null; try { j = JSON.parse(r.stdout); } catch {} return { exit: r.status, j }; };
const results = [];
const expect = (name, got, exit, ids) => {
  const found = got.j && Array.isArray(got.j.findings) ? got.j.findings.map((f) => (typeof f === 'string' ? f : f.id)) : [];
  results.push({ name, exit: got.exit, expectedExit: exit, expectedIds: ids, found, ok: got.exit === exit && ids.every((i) => found.includes(i)) });
};
const PIN = '5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af';
const R70 = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
if (!gate || gate === 'synthpinch') {
  const deg = (k) => path.join(LANE, '.ufo/waves/round-71/controls/c1/degenerate-' + k + '.receipt.json');
  const r = node([path.join(LANE, 'scripts/negatives-synthpinch-r71.mjs'), '--real', path.join(LANE, 'corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json'), '--expect-driver-sha256', PIN, '--work', path.join(scratch, 'neg'), '--laundered', deg('dispatch-wheel'), '--laundered', deg('set-scale'), '--laundered', deg('skip-touch'), '--json']);
  results.push({ name: 'synthpinch-battery', exit: r.exit, expectedExit: 0, ok: r.exit === 0 && r.j?.allOk === true && r.j.coverageGap.length === 0, cases: r.j?.cases ?? null });
  const l = spawnSync(process.execPath, [path.join(LANE, 'scripts/check-synthpinch-r71.mjs'), '--list-checks'], { encoding: 'utf8' });
  let ids = null; try { ids = JSON.parse(l.stdout); } catch {}
  results.push({ name: 'synthpinch-check-ids', exit: l.status, expectedExit: 0, ok: l.status === 0 && Array.isArray(ids) && ids.length === 87, ids: ids ? ids.length : null });
}
if (!gate || gate === 'live') {
  const V = path.join(LANE, 'scripts/verify-live-r71.mjs');
  const s = (n) => path.join(scratch, n);
  expect('env-node-options', node([V, '--profile', 'synthtap-r70', '--scratch', s('e1'), '--json'], { NODE_OPTIONS: '--no-warnings' }), 2, ['env-injection']);
  expect('env-node-path', node([V, '--profile', 'synthtap-r70', '--scratch', s('e2'), '--json'], { NODE_PATH: s('nowhere') }), 2, ['env-injection']);
  expect('exec-argv', node([V, '--profile', 'synthtap-r70', '--scratch', s('e3'), '--json'], {}, ['--no-warnings']), 2, ['exec-argv']);
  expect('no-run', node([V, '--profile', 'synthscroll-r69', '--scratch', s('nr'), '--no-run', '--json']), 1, ['no-run']);
  const tampered = s('tampered.mjs'); fs.writeFileSync(tampered, fs.readFileSync(path.join(LANE, 'scripts/chrome-cdp-synthtap-round70.mjs')) + '\n// tampered\n');
  expect('tampered-driver', node([V, '--profile', 'synthtap-r70', '--scratch', s('td'), '--driver', tampered, '--driver-sha256', R70, '--json']), 2, ['driver-pin']);
  expect('scratch-too-long', node([V, '--profile', 'synthscroll-r69', '--scratch', s('x'.repeat(80)), '--json']), 2, ['scratch-path-too-long']);
}
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ schema: 'tabi-selftest-r71-gates', ok, results }, null, 1));
console.log(`clean=${ok} cases=${results.length} failed=${results.filter((r) => !r.ok).map((r) => r.name).join(',') || 'none'}`);
process.exit(ok ? 0 : 1);
