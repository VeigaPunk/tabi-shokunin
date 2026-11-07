#!/usr/bin/env node
// Gate self-test for tabi round 79 (C1 `chromium-showpicker-linux`, C2 record drift).
//
// Runs every gate on the COMMITTED bytes in a fixed order and reports one verdict. Nothing is
// written into the walked trees: every scratch output goes under --work and is copied into the
// evidence tree only after the run (QUALITY 151).
//
// Usage: node selftest-r79-gates.mjs --lane <ABS lane> --work <ABS scratch> [--json] [--skip-killpower]
// Exit 0: every gate green. 1: a gate failed. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const skipKp = argv.includes('--skip-killpower');
const lane = opt('lane');
const work = opt('work');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
if (!work || !path.isAbsolute(work)) { console.error(JSON.stringify({ error: 'usage', detail: '--work must be an absolute path' })); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(path.join(lane, p), 'utf8')); } catch { return null; } };
const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(lane, 'scripts', script), ...args], { encoding: 'utf8', timeout: 1800000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, json: j, stderr: (r.stderr || '').slice(0, 500) };
};

const receipt = 'corpus/evidence/round79/chromium-showpicker/receipt.json';
const rec = readJson(receipt);
let pins = {};
try {
  const fz = fs.readFileSync(path.join(lane, '.ufo/waves/round-79/freeze.txt'), 'utf8');
  for (const m of fz.matchAll(/^([0-9a-f]{64})  (\S+)$/gm)) pins[m[2]] = m[1];
} catch { pins = {}; }
const driverPin = sha256(fs.readFileSync(path.join(lane, 'scripts/chrome-cdp-showpicker-round79.mjs')));
const counterPin = sha256(fs.readFileSync(path.join(lane, 'scripts/check-showpicker-r79.mjs')));
const batteryPin = sha256(fs.readFileSync(path.join(lane, 'scripts/negatives-showpicker-r79.mjs')));
const kpPin = sha256(fs.readFileSync(path.join(lane, 'scripts/kill-power-r79.mjs')));
const selftestPin = sha256(fs.readFileSync(path.join(lane, 'scripts/selftest-r79-gates.mjs')));
const driftPin = sha256(fs.readFileSync(path.join(lane, 'scripts/check-record-drift-r79.mjs')));
const expect = {
  driver: rec && rec.driverSha256,
  fixture: rec && rec.fixture && rec.fixture.sha256,
  nonce: rec && rec.nonce,
};
const gates = [];
const gate = (name, fn) => gates.push({ name, fn });

gate('pins-match-freeze', () => {
  const want = { 'scripts/chrome-cdp-showpicker-round79.mjs': driverPin, 'scripts/check-showpicker-r79.mjs': counterPin, 'scripts/negatives-showpicker-r79.mjs': batteryPin, 'scripts/kill-power-r79.mjs': kpPin, 'scripts/selftest-r79-gates.mjs': selftestPin, 'scripts/check-record-drift-r79.mjs': driftPin };
  const bad = Object.entries(want).filter(([k, v]) => pins[k] !== v).map(([k]) => k);
  return { ok: bad.length === 0, detail: 'files whose sha256 differs from freeze.txt: ' + JSON.stringify(bad) };
});
gate('counter-clean', () => {
  const r = run('check-showpicker-r79.mjs', ['--lane', lane, '--receipt', receipt, '--expect-driver-sha256', expect.driver, '--expect-nonce', expect.nonce, '--expect-fixture-sha256', expect.fixture, '--prior-set', '.ufo/waves/round-79/controls/c1/prior-set.txt', '--json']);
  return { ok: r.status === 0 && r.json && r.json.verdict === 'clean' && r.json.checkCount === 56, detail: 'exit ' + r.status + ' ' + JSON.stringify(r.json ? { verdict: r.json.verdict, checks: r.json.checkCount, findings: r.json.findings.map((f) => f.id) } : r.stderr) };
});
gate('battery', () => {
  const r = run('negatives-showpicker-r79.mjs', ['--lane', lane, '--real', receipt, '--expect-driver-sha256', expect.driver, '--expect-nonce', expect.nonce, '--expect-fixture-sha256', expect.fixture, '--prior-set', '.ufo/waves/round-79/controls/c1/prior-set.txt', '--work', path.join(work, 'battery'), '--json']);
  return { ok: r.status === 0 && r.json && r.json.failed === 0 && r.json.coverage.uncovered.length === 0, detail: 'exit ' + r.status + ' ' + JSON.stringify(r.json ? { cases: r.json.cases, passed: r.json.passed, failed: r.json.failed, coverage: r.json.coverage } : r.stderr) };
});
if (!skipKp) gate('kill-power', () => {
  const r = run('kill-power-r79.mjs', ['--lane', lane, '--real', receipt, '--expect-driver-sha256', expect.driver, '--expect-nonce', expect.nonce, '--expect-fixture-sha256', expect.fixture, '--prior-set', '.ufo/waves/round-79/controls/c1/prior-set.txt', '--work', path.join(work, 'killpower'), '--json']);
  return { ok: r.status === 0 && r.json && r.json.survived === 0 && r.json.crashed === 0, detail: 'exit ' + r.status + ' ' + JSON.stringify(r.json ? { mutants: r.json.mutants, killed: r.json.killed, survived: r.json.survived, crashed: r.json.crashed, survivors: r.json.survivorsList } : r.stderr) };
});
gate('nowork-control', () => {
  const r = run('check-showpicker-r79.mjs', ['--lane', lane, '--receipt', 'corpus/evidence/round78/chromium-file-chooser/receipt.json', '--expect-driver-sha256', expect.driver, '--expect-nonce', expect.nonce, '--expect-fixture-sha256', expect.fixture, '--prior-set', '.ufo/waves/round-79/controls/c1/prior-set.txt', '--json']);
  const ids = r.json ? r.json.findings.map((f) => f.id) : [];
  return { ok: r.status === 1 && ids.includes('schema') && ids.length >= 5, detail: 'exit ' + r.status + ' findings ' + JSON.stringify(ids) };
});
gate('tree-exempt-path-refused', () => {
  const r = run('check-showpicker-r79.mjs', ['--lane', lane, '--receipt', receipt, '--expect-driver-sha256', expect.driver, '--expect-nonce', expect.nonce, '--expect-fixture-sha256', expect.fixture, '--prior-set', '.ufo/waves/round-79/controls/c1/prior-set.txt', '--tree-exempt', receipt, '--json']);
  return { ok: r.status === 2 && r.json && r.json.findings && r.json.findings[0] && String(r.json.findings[0].detail).includes('tree-exempt-path-refused'), detail: 'exit ' + r.status + ' ' + JSON.stringify(r.json) };
});
gate('tree-exempt-unmatched-refused', () => {
  const r = run('check-showpicker-r79.mjs', ['--lane', lane, '--receipt', receipt, '--expect-driver-sha256', expect.driver, '--expect-nonce', expect.nonce, '--expect-fixture-sha256', expect.fixture, '--prior-set', '.ufo/waves/round-79/controls/c1/prior-set.txt', '--tree-exempt-sha256', '1'.repeat(64), '--json']);
  const ids = r.json ? r.json.findings.map((f) => f.id) : [];
  return { ok: r.status === 1 && ids.includes('prior-set-unmatched-exempt'), detail: 'exit ' + r.status + ' findings ' + JSON.stringify(ids) };
});
gate('record-drift', () => {
  const r = run('check-record-drift-r79.mjs', ['--lane', lane, '--json']);
  return { ok: r.status === 0 && r.json && r.json.mismatches === 0, detail: 'exit ' + r.status + ' ' + JSON.stringify(r.json ? { claims: r.json.claims, mismatches: r.json.mismatches, failed: r.json.failed.map((f) => f.id) } : r.stderr) };
});
gate('capability-status', () => {
  const r = run('check-capability-status.mjs', ['--json']);
  return { ok: r.status === 0 && r.json && r.json.mismatches === 0 && r.json.provisional === 1, detail: 'exit ' + r.status + ' ' + JSON.stringify(r.json ? { rows: r.json.rows, claimed: r.json.claimed, provisional: r.json.provisional, mismatches: r.json.mismatches } : r.stderr) };
});

const results = [];
for (const g of gates) {
  let res;
  try { res = g.fn(); } catch (e) { res = { ok: false, detail: 'threw: ' + e.message }; }
  results.push({ gate: g.name, ok: !!res.ok, detail: res.detail });
}
const failed = results.filter((r) => !r.ok);
const out = { schema: 'tabi-r79-selftest', clean: failed.length === 0, cases: results.length, failed: failed.map((f) => f.gate), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ clean: out.clean, cases: out.cases, failed: out.failed, results }, null, 1) + '\n');
process.exitCode = out.clean ? 0 : 1;
