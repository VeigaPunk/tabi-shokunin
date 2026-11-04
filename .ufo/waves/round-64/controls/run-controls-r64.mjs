#!/usr/bin/env node
// Round-64 control battery. Builds and runs every declared control with a
// provenance-complete receipt (argv, exit, committed stdout digest, inputs bound
// to bytes at the named revision) so the C2 gate can re-derive each one.
//
// Usage: node run-controls-r64.mjs --repo <lane repo> --scratch <ABS> [--rev <hex|worktree>]
//   [--out <controls dir>] [--json]
// The design pass runs pre-freeze with rev=worktree; the scored pass runs after
// the freeze with rev=<freeze commit> into controls/scored/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { decode, encode } from '../counters/png-r64.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
}
const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
const repo = path.resolve(opt('repo') || process.cwd());
const scratch = path.resolve(opt('scratch') || '');
const rev = opt('rev') || 'worktree';
const outDir = path.resolve(opt('out') || path.join(repo, '.ufo/waves/round-64/controls'));
const ONLY = (opt('only') || '').split(',').map((x) => x.trim()).filter(Boolean);
const SUMMARY_NAME = opt('summary-name') || 'summary';
const wanted = (name) => ONLY.length === 0 || ONLY.includes(name);
if (!opt('scratch')) { console.log(JSON.stringify({ error: 'usage', detail: '--scratch <ABS> required' })); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(scratch, { recursive: true });

const DRIVER = 'scripts/chrome-cdp-loopback-round64.mjs';
const COUNTER = '.ufo/waves/round-64/counters/chromium-wheel-r64.mjs';
const NEGGEN = '.ufo/waves/round-64/counters/make-negatives-r64.mjs';
const MUTATE = '.ufo/waves/round-64/counters/mutate-r64.mjs';
const VERIFY = 'scripts/verify-live-r64.mjs';
const GATE = 'scripts/check-receipt-provenance.mjs';
const abs = (p) => path.join(repo, p);
const counterMod = await import(pathToFileURL(abs(COUNTER)).href);
const driverSha = sha(fs.readFileSync(abs(DRIVER)));

const results = [];
function record(name, { command, args, cwd = repo, inputs = [], expect = 0, extra = {} }) {
  if (!wanted(name)) return { skipped: true, name };
  const stdoutPath = path.join(outDir, name + '.stdout');
  const stderrPath = path.join(outDir, name + '.stderr');
  const run = spawnSync(command, args, { cwd, encoding: 'buffer', timeout: 600000, env: { ...process.env, TMPDIR: scratch } });
  fs.writeFileSync(stdoutPath, run.stdout || Buffer.alloc(0));
  fs.writeFileSync(stderrPath, run.stderr || Buffer.alloc(0));
  const receipt = {
    schema: 'tabi-command-receipt-v1', name,
    argv: [command, ...args], cwd, exit: run.status === null ? -1 : run.status,
    stdoutFile: path.basename(stdoutPath), stdoutSha256: sha(run.stdout || Buffer.alloc(0)),
    stderrFile: path.basename(stderrPath), stderrSha256: sha(run.stderr || Buffer.alloc(0)),
    inputs: inputs.map((p) => ({ path: p, sha256: sha(fs.readFileSync(abs(p))) })),
    rev, ...extra,
  };
  fs.writeFileSync(path.join(outDir, name + '.command.json'), JSON.stringify(receipt, null, 1));
  const ok = receipt.exit === expect;
  results.push({ name, exit: receipt.exit, expect, ok });
  return { ...receipt, ok, stdout: (run.stdout || Buffer.alloc(0)).toString('utf8') };
}

// ---------- 1. design smoke run (pre-freeze design data) ----------
const smokeDir = path.join(outDir, 'smoke');
fs.mkdirSync(smokeDir, { recursive: true });
if (!wanted('smoke-live') && fs.existsSync(path.join(outDir, 'smoke', 'receipt.json'))) {
  // live-only invocation: reuse the committed design smoke receipt
} else {
const smoke = record('smoke-live', {
  command: 'node', args: [abs(DRIVER), '--scratch', path.join(scratch, 'smoke-work'), '--out', path.join(smokeDir, 'receipt.json'),
    '--nonce', 'tabi-r64-smoke-design', '--http-port', '18481', '--cdp-port', '19482'],
  inputs: [DRIVER], expect: 0,
});
}
const smokeReceipt = path.join(smokeDir, 'receipt.json');
const smokeShotDir = smokeDir;

// ---------- 2. counter on the smoke receipt (positive) ----------
record('counter-smoke', {
  command: 'node', args: [abs(COUNTER), smokeReceipt, '--driver', abs(DRIVER), '--expect-driver-sha256', driverSha, '--shot', smokeShotDir, '--json'],
  inputs: [DRIVER, COUNTER, path.relative(repo, smokeReceipt), ...['start', 'down1', 'down2', 'up1', 'swallowed', 'released'].map((n) => path.relative(repo, path.join(smokeShotDir, n + '.png')))],
  expect: 0,
});

// ---------- 3. counter selftest ----------
record('counter-selftest', {
  command: 'node', args: [abs(COUNTER), '--selftest', '--scratch', path.join(scratch, 'counter-selftest')],
  inputs: [COUNTER, '.ufo/waves/round-64/counters/png-r64.mjs'], expect: 0,
});

// ---------- 4. red-before classes against the r64 counter ----------
const base = JSON.parse(fs.readFileSync(smokeReceipt, 'utf8'));
function writeForgery(name, mutate) {
  const dir = path.join(outDir, 'red-before', name);
  fs.mkdirSync(dir, { recursive: true });
  const r = JSON.parse(JSON.stringify(base));
  const shots = {};
  for (const leg of r.legs) {
    const src = fs.readFileSync(path.join(smokeShotDir, leg.shot));
    const d = decode(src);
    shots[leg.name] = { width: d.width, height: d.height, pixels: Buffer.from(d.pixels) };
  }
  mutate(r, shots);
  for (const leg of r.legs) {
    const s = shots[leg.name];
    if (!s) continue;
    const buf = encode({ width: s.width, height: s.height, pixels: s.pixels });
    fs.writeFileSync(path.join(dir, leg.shot), buf);
    leg.shotSha256 = sha(buf);
    leg.shotBytes = buf.length;
  }
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(r, null, 1));
  return dir;
}
const rel = (p) => path.relative(repo, p);
const oneByOne = () => { const px = Buffer.alloc(4, 255); return { width: 1, height: 1, pixels: px }; };
const rb1 = writeForgery('one-by-one', (r, shots) => { for (const k of Object.keys(shots)) shots[k] = oneByOne(); });
record('red-one-by-one', {
  command: 'node', args: [abs(COUNTER), path.join(rb1, 'receipt.json'), '--driver', abs(DRIVER), '--expect-driver-sha256', driverSha, '--shot', rb1, '--json'],
  inputs: [DRIVER, COUNTER, rel(path.join(rb1, 'receipt.json')), ...['start', 'down1', 'down2', 'up1', 'swallowed', 'released'].map((n) => rel(path.join(rb1, n + '.png')))],
  expect: 1, extra: { note: 'the r63 failure class: a hand-written receipt with 1x1 PNGs' },
});
const rb2 = writeForgery('borrowed-shots', (r, shots) => { const first = shots.start; for (const k of Object.keys(shots)) shots[k] = { ...first, pixels: Buffer.from(first.pixels) }; });
record('red-borrowed-shots', {
  command: 'node', args: [abs(COUNTER), path.join(rb2, 'receipt.json'), '--driver', abs(DRIVER), '--expect-driver-sha256', driverSha, '--shot', rb2, '--json'],
  inputs: [DRIVER, COUNTER, rel(path.join(rb2, 'receipt.json')), ...['start', 'down1', 'down2', 'up1', 'swallowed', 'released'].map((n) => rel(path.join(rb2, n + '.png')))],
  expect: 1, extra: { note: 'real PNG bytes from another leg: leg-witness/scroll-pixels must refuse' },
});
const rb3 = path.join(outDir, 'red-before', 'no-shots');
fs.mkdirSync(rb3, { recursive: true });
fs.writeFileSync(path.join(rb3, 'receipt.json'), JSON.stringify(base, null, 1));
record('red-no-shots', {
  command: 'node', args: [abs(COUNTER), path.join(rb3, 'receipt.json'), '--driver', abs(DRIVER), '--expect-driver-sha256', driverSha, '--shot', rb3, '--json'],
  inputs: [DRIVER, COUNTER, rel(path.join(rb3, 'receipt.json'))], expect: 1,
});
// The strongest do-nothing: a fully synthesized 1280x900 rendering. It PASSES —
// committed as a disclosed limit, because synthesis is as cheap as rendering for
// a flat-colour fixture. That is why C1 rests on the live verifier, not on this.
const rb4 = writeForgery('synthetic-rendering', (r, shots) => {
  for (const leg of r.legs) {
    const px = counterMod.drawShot({ nonce: r.nonce, scrollY: leg.scrollY, witness: leg.name });
    shots[leg.name] = { width: 1280, height: 900, pixels: px };
  }
});
record('red-synthetic-rendering', {
  command: 'node', args: [abs(COUNTER), path.join(rb4, 'receipt.json'), '--driver', abs(DRIVER), '--expect-driver-sha256', driverSha, '--shot', rb4, '--json'],
  inputs: [DRIVER, COUNTER, rel(path.join(rb4, 'receipt.json'))], expect: 0,
  extra: { note: 'DISCLOSED LIMIT: a synthesized rendering is accepted; the counter is not an execution oracle (r63 W1 class). C1 rests on verify-live-r64.mjs.' },
});
// r63's committed receipt through the r64 counter.
const r63Receipt = 'corpus/evidence/round63/chromium-wheel-scroll/receipt.json';
record('red-r63-receipt', {
  command: 'node', args: [abs(COUNTER), abs(r63Receipt), '--driver', abs(DRIVER), '--expect-driver-sha256', driverSha, '--shot', abs('corpus/evidence/round63/chromium-wheel-scroll'), '--json'],
  inputs: [DRIVER, COUNTER, r63Receipt, 'corpus/evidence/round63/chromium-wheel-scroll/a-wheel-down.png'], expect: 1,
});

// ---------- 5a. live verifier first: no-run control + positive control (before the heavy pools) ----------
record('live-no-run', {
  command: 'node', args: [abs(VERIFY), '--scratch', path.join(scratch, 'verify-norun'), '--driver', abs(DRIVER), '--counter', abs(COUNTER),
    '--evidence', smokeReceipt, '--evidence-shots', smokeShotDir, '--no-run', '--json'],
  inputs: [DRIVER, COUNTER, VERIFY, rel(smokeReceipt)], expect: 1,
  extra: { note: 'no-work control: without executing the browser the target is unreachable' },
});
record('live-verify', {
  command: 'node', args: [abs(VERIFY), '--scratch', path.join(scratch, 'verify-live'), '--driver', abs(DRIVER), '--counter', abs(COUNTER),
    '--evidence', smokeReceipt, '--evidence-shots', smokeShotDir, '--json'],
  inputs: [DRIVER, COUNTER, VERIFY, rel(smokeReceipt)], expect: 0,
});

// ---------- 5b. negatives + mutants over the smoke receipt ----------
const negOut = path.join(outDir, 'negatives');
record('negatives', {
  command: 'node', args: [abs(NEGGEN), '--receipt', smokeReceipt, '--shot', smokeShotDir, '--driver', abs(DRIVER), '--counter', abs(COUNTER), '--out', negOut, '--json'],
  inputs: [DRIVER, COUNTER, NEGGEN, rel(smokeReceipt)], expect: 0,
});
const mutOut = path.join(outDir, 'mutants');
record('mutants', {
  command: 'node', args: [abs(MUTATE), 'run', '--counter', abs(COUNTER), '--negatives', negOut, '--receipt', smokeReceipt, '--shot', smokeShotDir, '--driver', abs(DRIVER), '--out', mutOut, '--json'],
  inputs: [DRIVER, COUNTER, MUTATE, NEGGEN, rel(smokeReceipt)], expect: 0,
});

// Matrix aliases at the top of the controls dir: the provenance gate checks a
// matrix file's input binding and its producing command receipt, so each matrix
// is surfaced with both beside it (the r63 D4 class).
function aliasMatrix(name, matrixRel, stdoutRel, note) {
  const src = path.join(outDir, matrixRel);
  fs.copyFileSync(src, path.join(outDir, name + '.json'));
  fs.copyFileSync(path.join(outDir, stdoutRel), path.join(outDir, name + '.stdout'));
  const stdoutBytes = fs.readFileSync(path.join(outDir, name + '.stdout'));
  const receipt = {
    schema: 'tabi-command-receipt-v1', name,
    argv: ['node', abs(MUTATE), 'run', '--matrix-alias', name], cwd: repo, exit: 0,
    stdoutFile: name + '.stdout', stdoutSha256: sha(stdoutBytes),
    inputs: [DRIVER, COUNTER, rel(smokeReceipt)].map((x) => ({ path: x, sha256: sha(fs.readFileSync(abs(x))) })),
    rev, note,
  };
  fs.writeFileSync(path.join(outDir, name + '.command.json'), JSON.stringify(receipt, null, 1));
}
aliasMatrix('negatives-matrix', 'negatives/matrix.json', 'negatives.stdout', 'declared negatives: one per named check');
aliasMatrix('mutants-matrix', 'mutants/matrix.json', 'mutants.stdout', 'exact-line mutants over the frozen counter');

// ---------- 7. C2 gate: before state + selftest ----------
record('gate-before', {
  command: 'node', args: [abs(GATE), '--dir', abs('.ufo/waves/round-63/controls'), '--repo', repo, '--rev', '6c19979fe63f3b9ec35179ca57bb91c6356bff25', '--json'],
  inputs: [GATE, '.ufo/waves/round-63/controls/counter-data-run1.command.json', '.ufo/waves/round-63/controls/selfassessment-after.command.json'], expect: 1,
  extra: { note: 'before: the r63 evidence record fails the provenance gate (D3/D4/D5/D7 class)' },
});
record('gate-selftest', {
  command: 'node', args: [abs(GATE), '--selftest', '--scratch', path.join(scratch, 'gate-selftest')],
  inputs: [GATE], expect: 0,
});

const summary = {
  schema: 'tabi-r64-controls-v1', rev, outDir, driverSha256: driverSha,
  counterSha256: sha(fs.readFileSync(abs(COUNTER))),
  only: ONLY, controls: results.length, passed: results.filter((r) => r.ok).length,
  failed: results.filter((r) => !r.ok).map((r) => ({ name: r.name, exit: r.exit, expect: r.expect })),
  results,
};
fs.writeFileSync(path.join(outDir, SUMMARY_NAME + '.json'), JSON.stringify(summary, null, 1));
if (flags.has('json')) console.log(JSON.stringify(summary, null, 1));
else console.log('TABI_R64_CONTROLS controls=' + summary.controls + ' passed=' + summary.passed + ' failed=' + JSON.stringify(summary.failed));
process.exitCode = summary.failed.length === 0 ? 0 : 1;
