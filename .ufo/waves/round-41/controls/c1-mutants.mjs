#!/usr/bin/env node
// c1-mutants.mjs — counter self-test for c1-session-bound-v4.mjs.
// Builds a synthetic honest positive (receipt + witness + measure doc), then
// applies one isolated mutation per case and requires the counter to refuse
// with its named finding. Runs in a caller-supplied scratch dir.
// Usage: node .ufo/waves/round-41/controls/c1-mutants.mjs --scratch <dir>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(ROOT, '.ufo/waves/round-41/counters/c1-session-bound-v4.mjs');
const CLAIMS = path.join(ROOT, '.ufo/waves/round-41/claims.json');
const FF = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const NONCE = 'a'.repeat(64);

const argv = process.argv.slice(2);
let scratch = null;
for (let i = 0; i < argv.length; i++) if (argv[i] === '--scratch') scratch = argv[++i];
if (!scratch) { console.error('usage: --scratch <dir>'); process.exit(64); }
const S = fs.mkdtempSync(path.join(scratch, 'c1-mutants-'));

const mkSample = (i, base) => ({
  t: base + i * 100, tTicks: 1000 + i * 10,
  ss: { ticks: 1, lines: 1, nonLoopback: 0, ssObs: 1 },
  proc: { ticks: 1, inodes: 1, nonLoopback: 0, procObs: 1 },
  treePids: [
    { pid: 1000 + i, ppid: 999, startTicks: 999, exe: '/usr/bin/node', comm: 'node' },
    { pid: 12345, ppid: 1000 + i, startTicks: 1000, exe: FF, comm: 'firefox' },
  ],
});
const mkRun = (name, base) => {
  const samples = Array.from({ length: 13 }, (_, i) => mkSample(i, base));
  return {
    name, cmds: [], events: [], refused: false, runNonce: NONCE, samples,
    browserVersion: '157.0', firstShotSha256: 'b'.repeat(64), survivors: 0, survivorPids: [], portClosed: true,
    runStartTicks: 995, runEndTicks: 1150,
    finalSweep: { t: base + 1400, tTicks: 1150, ss: { ticks: 1, lines: 0, nonLoopback: 0, ssObs: 0 }, proc: { ticks: 1, inodes: 0, nonLoopback: 0, procObs: 0 }, treePids: [] },
    owned: { nodePid: 999, selfStartTicks: 10, roots: [{ pid: 12345, startTicks: 1000, exe: FF, comm: 'firefox' }], source: 'test' },
    sockets: { ss: { observations: 13, nonLoopback: 0 }, proc: { observations: 13, nonLoopback: 0 }, finalSweep: { ss: 0, proc: 0 } },
    egressNonLoopback: 0,
  };
};
const mkReceipt = () => ({
  schema: 'tabi-pw-firefox-egress-receipt-r41', driver: 'scripts/playwright-firefox-egress-round41.mjs',
  measuredAt: new Date().toISOString(), playwrightVersion: '1.64.0',
  fixture: { sha256: 'c'.repeat(64), bytes: 1 },
  envCheck: { procEnvironReadable: true, nameCount: 5, forbiddenNames: [], execArgv: [], execArgvClean: true, envNonceEcho: 'match' },
  runNonce: NONCE, runs: [mkRun('run1', 100000), mkRun('run2', 200000)], refused: false,
  binding: true, egressNonLoopback: 0, survivors: 0, browserVersion: '157.0',
});
const mkWitness = () => ({
  schema: 'tabi-r41-witness', rootPid: 1, nonce: NONCE, startedTicks: 990, endedTicks: 1200,
  environ: ['PATH', 'HOME', 'TABI_RUN_NONCE'],
  samples: Array.from({ length: 15 }, () => ({ t: 1, tTicks: 1, tree: [
    { pid: 1, ppid: 0, startTicks: 1, exe: '/x', comm: 'a' },
    { pid: 999, ppid: 1, startTicks: 10, exe: '/usr/bin/node', comm: 'node' },
    { pid: 12345, ppid: 999, startTicks: 1000, exe: FF, comm: 'firefox' },
  ] })),
});
const measureDoc = { elapsedMs: 8000, gate: { self: { forbiddenNames: [], execArgvClean: true }, child: { ok: true } } };

const cases = [
  ['honest-positive', (r) => r, []],
  ['short-span', (r) => { r.runs.forEach((run) => run.samples.forEach((s, i) => { s.t = run.samples[0].t + i * 50; })); return r; }, ['run1-sample-span', 'run2-sample-span']],
  ['unsorted-t', (r) => { const a = r.runs[0].samples[3].t; r.runs[0].samples[3].t = r.runs[0].samples[4].t; r.runs[0].samples[4].t = a; return r; }, ['run1-sample-order']],
  ['ss-unavailable', (r) => { r.runs[0].samples[2].ss = { ticks: 0, lines: 0, nonLoopback: 0, ssObs: 0, unavailable: true }; return r; }, ['run1-sample3-ss-unavailable']],
  ['nonloopback', (r) => { r.runs[0].samples[1].ss.nonLoopback = 1; r.runs[0].sockets.ss.nonLoopback = 1; r.runs[0].egressNonLoopback = 1; r.egressNonLoopback = 1; return r; }, ['run1-sample2-ss-egress']],
  ['zero-ss-obs', (r) => { r.runs.forEach((run) => { run.samples.forEach((s) => { s.ss.ssObs = 0; s.ss.lines = 0; }); run.sockets.ss.observations = 0; }); return r; }, ['run1-zero-ss-observation', 'run2-zero-ss-observation']],
  ['stale-pid', (r) => { r.runs[0].samples[0].treePids[1].startTicks = 5; return r; }, ['run1-sample1-pid-stale']],
  ['nonfirefox-root', (r) => { r.runs[0].owned.roots[0].exe = '/usr/bin/fake'; return r; }, ['run1-root-exe']],
  ['empty-tree', (r) => { r.runs[1].samples[4].treePids = []; return r; }, ['run2-sample5-tree-empty']],
  ['summary-ss-lie', (r) => { r.runs[0].sockets.ss.observations = 99; return r; }, ['run1-summary-ss-mismatch']],
  ['envcheck-tamper', (r) => { r.envCheck.forbiddenNames = ['NODE_OPTIONS']; return r; }, ['env-check-forbidden']],
  ['envcheck-nonce', (r) => { r.envCheck.envNonceEcho = 'absent'; return r; }, ['env-check-nonce']],
  ['survivor', (r) => { r.runs[0].survivors = 1; r.runs[0].survivorPids = [12345]; return r; }, ['run1-survivors']],
  ['port-open', (r) => { r.runs[0].portClosed = false; return r; }, ['run1-port-open']],
  ['shot-diff', (r) => { r.runs[1].firstShotSha256 = 'd'.repeat(64); r.binding = false; return r; }, ['shot-hash-diff', 'binding']],
  ['bad-version', (r) => { r.runs[0].browserVersion = null; return r; }, ['run1-version']],
  ['nonce-mismatch', (r) => { r.runs[0].runNonce = 'b'.repeat(64); return r; }, ['run-nonce-mismatch']],
];

const results = [];
for (const [name, mutate, expected] of cases) {
  const receipt = mutate(mkReceipt());
  const rPath = path.join(S, `${name}.json`);
  const wPath = path.join(S, `${name}.witness.json`);
  fs.writeFileSync(rPath, JSON.stringify(receipt, null, 1));
  fs.writeFileSync(wPath, JSON.stringify(mkWitness(), null, 0));
  const run = spawnSync('node', [COUNTER, rPath, '--nonce', NONCE, '--witness', wPath, '--pins', CLAIMS, '--measure', '-'], {
    encoding: 'utf8', input: JSON.stringify(measureDoc), maxBuffer: 8 << 20,
  });
  let out = null; try { out = JSON.parse(run.stdout); } catch { }
  const got = out ? out.findings : [`unparseable:${run.status}`];
  const missing = expected.filter((e) => !got.includes(e));
  const pass = name === 'honest-positive' ? (run.status === 0 && got.length === 0) : (run.status === 1 && missing.length === 0);
  results.push({ case: name, exit: run.status, expectedFindings: expected, gotFindings: got, pass });
}
// separate refusal probes: r39/r40 receipts verbatim
for (const old of ['corpus/evidence/round-39/playwright-egress/receipt.json', 'corpus/evidence/round40/playwright-egress/receipt.json']) {
  const p = path.join(ROOT, old);
  if (!fs.existsSync(p)) { results.push({ case: `replay-${path.basename(path.dirname(p))}`, pass: false, gotFindings: ['receipt-missing'] }); continue; }
  const run = spawnSync('node', [COUNTER, p, '--nonce', NONCE], { encoding: 'utf8', maxBuffer: 8 << 20 });
  let out = null; try { out = JSON.parse(run.stdout); } catch { }
  const got = out ? out.findings : [`unparseable:${run.status}`];
  results.push({ case: `replay-${path.basename(path.dirname(p))}`, exit: run.status, gotFindings: got, pass: run.status === 1 && got.includes('schema') && got.includes('run-nonce-mismatch') });
}
const out = { schema: 'tabi-r41-c1-mutants', cases: results, allPass: results.every((x) => x.pass) };
console.log(JSON.stringify(out));
fs.rmSync(S, { recursive: true, force: true });
process.exit(out.allPass ? 0 : 1);
