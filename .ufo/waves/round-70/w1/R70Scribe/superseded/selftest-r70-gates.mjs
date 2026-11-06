#!/usr/bin/env node
// Self-test entry for the round-70 instruments (QUALITY 129 registry convention).
// PROPOSED by seat R70Scribe (round 70, w1) — not part of the lane at the freeze; L1 lands it or not.
//   node scripts/selftest-r70-gates.mjs --selftest --scratch <ABS dir> [--gate synthtap|live-verify] [--json]
// synthtap: the battery of scripts/negatives-synthtap-r70.mjs over the committed scored receipt
//   plus the three committed degenerate-driver receipts laundered green (positive clean + 95
//   negatives, one per declared counter check id, coverageGap empty).
// live-verify: the verifier's no-work refusals on both profiles — --no-run (exit 1, finding
//   no-run) and an over-long scratch path (exit 2, finding scratch-path-too-long). No browser is
//   launched and no live run is performed. --scratch must stay short enough for Chromium's
//   singleton socket (the verifier refuses a socket path over 107 bytes before any launch).
// Exit 0 = clean; 1 = failed (a leg's exit or expected finding id differs); 2 = could-not-evaluate
//   (usage / missing committed inputs).
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
if (!argv.includes('--selftest') || !scratch || !path.isAbsolute(scratch) || (only && !['synthtap', 'live-verify'].includes(only))) {
  console.error('usage: --selftest --scratch <ABS dir> [--gate synthtap|live-verify] [--json]'); process.exit(2);
}
const W = path.join(LANE, '.ufo/waves/round-70');
const scored = path.join(LANE, 'corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json');
const DRIVER_PIN = '704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577';
const degen = ['js-click', 'dispatch-mouse', 'skip-touch'].map((d) => path.join(W, 'controls/c1-receipts', 'degenerate-' + d + '.json'));
fs.mkdirSync(scratch, { recursive: true });
const work = fs.mkdtempSync(path.join(scratch, 'r70-selftest-'));
const run = (file, args) => {
  const p = spawnSync(process.execPath, [file, ...args], { encoding: 'utf8', timeout: 300000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, json: j, stdout: p.stdout.trim() };
};
const results = {};
try {
  if (!only || only === 'synthtap') {
    if (![scored, ...degen].every((f) => fs.existsSync(f))) { console.error('missing committed receipts'); process.exit(2); }
    const p = run(path.join(LANE, 'scripts/negatives-synthtap-r70.mjs'), [
      '--real', scored, '--expect-driver-sha256', DRIVER_PIN, '--work', path.join(work, 'c1'),
      ...degen.flatMap((d) => ['--laundered', d]), '--json',
    ]);
    results.synthtap = { exit: p.exit, cases: p.json?.cases ?? null, refused: p.json?.refusedForExpectedReason ?? null, coverageGap: p.json?.coverageGap ?? null, allOk: p.json?.allOk ?? null };
  }
  if (!only || only === 'live-verify') {
    const longScratch = path.join(scratch, 'x'.repeat(140));
    const lvScratch = path.join(scratch, 'lv');
    for (const profile of ['synthscroll-r69', 'synthtap-r70']) {
      fs.rmSync(lvScratch, { recursive: true, force: true });
      const noRun = run(path.join(LANE, 'scripts/verify-live-r70.mjs'), ['--profile', profile, '--scratch', lvScratch, '--no-run', '--json']);
      results['live-verify-' + profile + '-no-run'] = { exit: noRun.exit, findings: noRun.json?.findings ?? null, ok: noRun.exit === 1 && Array.isArray(noRun.json?.findings) && noRun.json.findings.includes('no-run') };
      const long = run(path.join(LANE, 'scripts/verify-live-r70.mjs'), ['--profile', profile, '--scratch', longScratch, '--json']);
      results['live-verify-' + profile + '-scratch-too-long'] = { exit: long.exit, findings: long.json?.findings ?? null, ok: long.exit === 2 && Array.isArray(long.json?.findings) && long.json.findings.includes('scratch-path-too-long') };
    }
  }
} finally { fs.rmSync(work, { recursive: true, force: true }); fs.rmSync(path.join(scratch, 'lv'), { recursive: true, force: true }); }
const ok = Object.values(results).every((r) => (r.ok !== undefined ? r.ok : r.exit === 0));
const out = { verdict: ok ? 'clean' : 'failed', results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 1) : `${out.verdict} ` + Object.entries(results).map(([k, v]) => `${k}=${v.exit}`).join(' '));
process.exit(ok ? 0 : 1);
