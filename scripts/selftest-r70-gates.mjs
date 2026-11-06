#!/usr/bin/env node
// Self-test for the round-70 gates (registry home: SKILL.md `## Round 70 gate registry`).
// Usage: node scripts/selftest-r70-gates.mjs --selftest --scratch <ABS short dir> [--gate synthtap|live]
//   synthtap: runs scripts/negatives-synthtap-r70.mjs on the committed scored receipt and the
//             three committed degenerate receipts (positive clean, every case refused for its
//             expected id, no coverage gap).
//   live:     runs scripts/verify-live-r70.mjs through its Chromium-free paths and asserts exit
//             AND finding ids: --no-run (1, no-run), tampered driver (2, driver-pin), scratch
//             too long (2, scratch-path-too-long), replay forger (1, run-a-nonce), rewrite forger
//             (1, run-a-cdpPort + cross-run-identity), lying full-rewrite forger (1,
//             run-a-driverDigest). It never launches a browser; the live positive run is the
//             gate's entry command itself.
// Exit 0 all cases as expected; 1 any case off; 2 usage. Writes only under --scratch.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const scratch = opt('scratch'); const gate = opt('gate');
if (!argv.includes('--selftest') || !scratch || !path.isAbsolute(scratch) || (gate && !['synthtap', 'live'].includes(gate))) {
  console.error('usage: node scripts/selftest-r70-gates.mjs --selftest --scratch <ABS short dir> [--gate synthtap|live]'); process.exit(2);
}
fs.mkdirSync(scratch, { recursive: true });
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const node = (args, env = {}) => { const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 300000, env: { ...process.env, ...env } }); let j = null; try { j = JSON.parse(r.stdout); } catch {} return { exit: r.status, j }; };
const results = [];
const expect = (name, got, exit, ids) => {
  const found = got.j && Array.isArray(got.j.findings) ? got.j.findings.map((f) => (typeof f === 'string' ? f : f.id)) : [];
  results.push({ name, exit: got.exit, expectedExit: exit, expectedIds: ids, ok: got.exit === exit && ids.every((i) => found.includes(i)) });
};
const PIN = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
const R69 = '13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3';
if (!gate || gate === 'synthtap') {
  const deg = (k) => path.join(LANE, '.ufo/waves/round-70/controls/c1-receipts/degenerate-' + k + '.json');
  const r = node([path.join(LANE, 'scripts/negatives-synthtap-r70.mjs'), '--real', path.join(LANE, 'corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json'), '--expect-driver-sha256', PIN, '--work', path.join(scratch, 'neg'), '--laundered', deg('js-click'), '--laundered', deg('dispatch-mouse'), '--laundered', deg('skip-touch'), '--json']);
  results.push({ name: 'synthtap-battery', exit: r.exit, expectedExit: 0, ok: r.exit === 0 && r.j?.allOk === true && r.j.coverageGap.length === 0, cases: r.j?.cases ?? null });
}
if (!gate || gate === 'live') {
  const V = path.join(LANE, 'scripts/verify-live-r70.mjs');
  const F = path.join(LANE, '.ufo/waves/round-70/controls/forgers/forger.mjs'); const FS = sha(F);
  const E = path.join(LANE, 'corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json');
  const s = (n) => path.join(scratch, n);
  expect('no-run', node([V, '--profile', 'synthscroll-r69', '--scratch', s('nr'), '--no-run', '--json']), 1, ['no-run']);
  const tampered = s('tampered.mjs'); fs.writeFileSync(tampered, fs.readFileSync(path.join(LANE, 'scripts/chrome-cdp-synthscroll-round69.mjs')) + '\n// tampered\n');
  expect('tampered-driver', node([V, '--profile', 'synthscroll-r69', '--scratch', s('td'), '--driver', tampered, '--driver-sha256', R69, '--json']), 2, ['driver-pin']);
  expect('scratch-too-long', node([V, '--profile', 'synthscroll-r69', '--scratch', s('x'.repeat(80)), '--json']), 2, ['scratch-path-too-long']);
  expect('forger-replay', node([V, '--profile', 'synthscroll-r69', '--scratch', s('rp'), '--driver', F, '--driver-sha256', FS, '--json'], { FORGER_MODE: 'replay', FORGER_SOURCE: E }), 1, ['run-a-nonce']);
  expect('forger-rewrite', node([V, '--profile', 'synthscroll-r69', '--scratch', s('rw'), '--driver', F, '--driver-sha256', FS, '--json'], { FORGER_MODE: 'rewrite', FORGER_SOURCE: E }), 1, ['run-a-cdpPort', 'cross-run-identity']);
  expect('forger-rewrite-full-lying', node([V, '--profile', 'synthscroll-r69', '--scratch', s('rf'), '--driver', F, '--driver-sha256', FS, '--json'], { FORGER_MODE: 'rewrite-full', FORGER_CLAIM_SHA: R69, FORGER_SOURCE: E }), 1, ['run-a-driverDigest']);
}
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ schema: 'tabi-selftest-r70-gates', ok, results }, null, 1));
console.log(`clean=${ok} cases=${results.length} failed=${results.filter((r) => !r.ok).map((r) => r.name).join(',') || 'none'}`);
process.exit(ok ? 0 : 1);
