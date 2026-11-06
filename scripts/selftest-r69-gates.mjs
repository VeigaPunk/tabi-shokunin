#!/usr/bin/env node
// Self-test entry for the two round-69 gates (QUALITY 129 registry convention):
//   node scripts/selftest-r69-gates.mjs --selftest --scratch <ABS dir> [--gate sibling-matrix|synthscroll] [--json]
// sibling-matrix: the fixture battery of scripts/negatives-sibling-matrix-r69.mjs (20-lane fixture
//   fleet, positive clean + 19 forgeries refused for their expected finding ids).
// synthscroll: the battery of scripts/negatives-synthscroll-r69.mjs over the committed scored receipt
//   plus the three committed degenerate-driver receipts laundered green (positive + 44 negatives).
// Exit 0 = clean; 1 = failed (a battery failed); 2 = could-not-evaluate (usage / missing inputs).
// Writes only under --scratch (removed on exit) and nothing else.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = opt('scratch');
const only = opt('gate');
if (!argv.includes('--selftest') || !scratch || !path.isAbsolute(scratch) || (only && !['sibling-matrix', 'synthscroll'].includes(only))) {
  console.error('usage: --selftest --scratch <ABS dir> [--gate sibling-matrix|synthscroll] [--json]'); process.exit(2);
}
const W = path.join(LANE, '.ufo/waves/round-69');
const scored = path.join(LANE, 'corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json');
const degen = ['js-scroll', 'dispatch-wheel', 'skip-touch'].map((d) => path.join(W, 'controls/c2-degenerate', d + '-receipt.json'));
fs.mkdirSync(scratch, { recursive: true });
const work = fs.mkdtempSync(path.join(scratch, 'r69-selftest-'));
const results = {};
try {
  if (!only || only === 'sibling-matrix') {
    const p = spawnSync(process.execPath, [path.join(LANE, 'scripts/negatives-sibling-matrix-r69.mjs'), '--fixture', '--work', path.join(work, 'c1'), '--out', path.join(work, 'c1.json')], { encoding: 'utf8' });
    results['sibling-matrix'] = { exit: p.status, summary: p.stdout.trim() };
  }
  if (!only || only === 'synthscroll') {
    if (![scored, ...degen].every((f) => fs.existsSync(f))) { console.error('missing committed receipts'); process.exit(2); }
    const p = spawnSync(process.execPath, [path.join(LANE, 'scripts/negatives-synthscroll-r69.mjs'), '--real', scored, '--work', path.join(work, 'c2'), '--out', path.join(work, 'c2.json'), ...degen.flatMap((d) => ['--laundered', d])], { encoding: 'utf8' });
    results.synthscroll = { exit: p.status, summary: p.stdout.trim() };
  }
} finally { fs.rmSync(work, { recursive: true, force: true }); }
const ok = Object.values(results).every((r) => r.exit === 0);
const out = { verdict: ok ? 'clean' : 'failed', results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 1) : `${out.verdict} ` + Object.entries(results).map(([k, v]) => `${k}=${v.exit}`).join(' '));
process.exit(ok ? 0 : 1);
