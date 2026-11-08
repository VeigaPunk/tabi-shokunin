#!/usr/bin/env node
// Score every mutant with the frozen r90 counter. Read-only over the lane.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [mutDirArg, scoreDirArg, exempt, counterArg, pinArg] = process.argv.slice(2);
const mutDir = path.resolve(mutDirArg), scoreDir = path.resolve(scoreDirArg);
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.resolve(counterArg || '/fast/scratch/hyaku/tabi-r90/R90Exec4/check-showpicker-round90.pinned.mjs');
const PINNED = pinArg || '1d3dfb0b3330f7334b9ea84df9cf7463fa28d61f411c65f9c03c9968d4b7be37';
const crypto = await import('node:crypto');
const counterSha = crypto.createHash('sha256').update(fs.readFileSync(COUNTER)).digest('hex');
if (counterSha !== PINNED) { console.error('COUNTER DRIFT: ' + counterSha + ' != ' + PINNED); process.exit(2); }
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-90/controls/c1/prior-set.txt');
const PINS = [
  '--expect-driver-sha256', 'ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d',
  '--expect-nonce', 'tabi-r90-l1-e573334c78fa',
  '--expect-fixture-sha256', '5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8',
];
fs.mkdirSync(scoreDir, { recursive: true });
const rows = [];
for (const f of fs.readdirSync(mutDir).filter((n) => /^m\d+.*\.json$/.test(n)).sort()) {
  const id = f.replace(/\.json$/, '');
  const receipt = path.join(mutDir, f);
  const args = [COUNTER, '--lane', LANE, '--receipt', receipt, ...PINS, '--prior-set', PRIOR_SET, '--tree-exempt-sha256', exempt, '--json'];
  const p = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let j = null;
  try { j = JSON.parse(p.stdout); } catch { /* unreadable */ }
  const failed = j && j.checks ? Object.keys(j.checks).filter((k) => !j.checks[k]) : ['<' + (j && j.verdict || 'no-json') + '>'];
  fs.writeFileSync(path.join(scoreDir, id + '.json'), JSON.stringify({ exit: p.status, counterSha, args, verdict: j && j.verdict, checkCount: j && j.checkCount, failed, findings: j && j.findings }, null, 1));
  rows.push({ id, exit: p.status, verdict: j && j.verdict, checkCount: j && j.checkCount, failed, findings: j ? j.findings : [{ id: 'stdout', detail: p.stdout.slice(0, 400) + ' ' + p.stderr.slice(0, 400) }] });
}
fs.writeFileSync(path.join(scoreDir, 'summary.json'), JSON.stringify({ counter: COUNTER, counterSha, rows }, null, 1));
for (const r of rows) {
  console.log('=== ' + r.id + ' exit=' + r.exit + ' verdict=' + r.verdict + ' failed=' + JSON.stringify(r.failed));
  for (const fd of r.findings) console.log('    ' + fd.id + ': ' + String(fd.detail).slice(0, 300));
}
