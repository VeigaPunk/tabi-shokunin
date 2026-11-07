#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { build } from './forge.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const C1 = LANE + '/.ufo/waves/round-75/controls/c1';
const PRIORS = ['degenerate-native-mouse', 'degenerate-no-intercept', 'degenerate-script-events',
  'probe/p1', 'probe/p2', 'probe/p3', 'probe/p4',
  'smoke1', 'smoke2', 'smoke3', 'smoke4', 'smoke5', 'smoke6', 'smoke7', 'smoke8', 'smoke9']
  .map((n) => C1 + '/' + n + '.receipt.json');
const PIN = 'd604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105';
const NONCE = 'tabi-r75-l1-57f28cf128e6';
const src = process.argv[2];
const out = process.argv[3];
const mutateJson = process.argv[4];
build(src, out, NONCE, mutateJson ? JSON.parse(mutateJson) : null);
const args = ['node', LANE + '/scripts/check-dragdrop-r75.mjs', '--receipt', out,
  '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--json'];
for (const p of PRIORS) args.push('--prior', p);
let code = 0;
let stdout = '';
try { stdout = execFileSync(args[0], args.slice(1), { encoding: 'utf8' }); } catch (e) { code = e.status; stdout = e.stdout; }
const j = JSON.parse(stdout);
console.log(JSON.stringify({ exit: code, verdict: j.verdict, findings: j.findings.map((f) => f.id), timeline: j.timeline, priorSetLen: j.priorSet.length, maxAbs: j.timeline.maxAbs, maxGap: j.timeline.maxGap, ownGaps: j.timeline.ownGaps }));
