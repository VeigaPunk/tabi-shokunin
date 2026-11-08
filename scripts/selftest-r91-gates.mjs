#!/usr/bin/env node
// Round-91 gate runner: runs the six instruments in order on the committed artifacts and writes
// the gate-run artifact the C2 counter reads (`.ufo/waves/round-91/scored/selftest.json`).
//
// Usage: node selftest-r91-gates.mjs --lane <ABS lane> --work <scratch> [--json]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
const work = opt('work') || path.join('/fast/scratch/hyaku', 'tabi-r91', 'selftest-' + process.pid);
if (!lane) { process.stdout.write(JSON.stringify({ error: 'usage', detail: '--lane required' }) + '\n'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const wave = path.join(lane, '.ufo', 'waves', 'round-91');
const expectationsPath = path.join(wave, 'expectations.json');
const scoredPath = path.join(lane, 'corpus', 'evidence', 'round91', 'chromium-showpicker-proxy', 'receipt.json');
const priorSet = path.join(wave, 'controls', 'c1', 'prior-set.txt');
const tools = (n) => path.join(lane, 'scripts', n);

const gates = [];
function run(name, cmd, args, timeout = 600000) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  gates.push({ name, exit: r.status, verdict: j && (j.verdict || (j.ok === true ? 'clean' : null)) || null, checkCount: j && (j.checkCount ?? j.cases ?? j.mutants) || null, stderr: r.stderr ? r.stderr.slice(0, 400) : '' });
  return r;
}
let exp = null;
try { exp = JSON.parse(fs.readFileSync(expectationsPath, 'utf8')); } catch {}
if (!exp) { process.stdout.write(JSON.stringify({ clean: false, error: 'expectations.json missing' }) + '\n'); process.exit(1); }
const pins = ['--expect-driver-sha256', exp.driverSha256, '--expect-nonce', exp.nonce, '--expect-parent-sha256', exp.parentSha256, '--expect-same-sha256', exp.sameSha256, '--expect-child-sha256', exp.childSha256];

run('counter-selftest', process.execPath, [tools('check-showpicker-proxy-round91.mjs'), '--selftest', '--json']);
run('counter', process.execPath, [tools('check-showpicker-proxy-round91.mjs'), '--lane', lane, '--receipt', scoredPath, ...pins, '--prior-set', priorSet, '--json']);
run('battery', process.execPath, [tools('negatives-showpicker-proxy-round91.mjs'), '--lane', lane, '--real', scoredPath, ...pins, '--prior-set', priorSet, '--work', path.join(work, 'battery'), '--json']);
run('killpower', process.execPath, [tools('kill-power-proxy-round91.mjs'), '--lane', lane, '--real', scoredPath, ...pins, '--prior-set', priorSet, '--work', path.join(work, 'killpower'), '--json']);
run('drift-selftest', process.execPath, [tools('check-record-drift-round91.mjs'), '--selftest', '--json']);

const clean = gates.every((g) => g.exit === 0);
const out = { schema: 'tabi-r91-gate-run', clean, lane, round: 91, revision: exp.revision || null, startedAt: new Date().toISOString(), gates };
const target = path.join(wave, 'scored', 'selftest.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(out, null, 1));
process.stdout.write(JSON.stringify(out, null, asJson ? 1 : 0) + '\n');
process.exit(clean ? 0 : 1);
