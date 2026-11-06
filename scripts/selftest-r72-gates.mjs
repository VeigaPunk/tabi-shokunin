#!/usr/bin/env node
// Self-test for the round-72 gate (registry home: SKILL.md `## Round 72 gate registry`).
// Usage: node scripts/selftest-r72-gates.mjs --selftest
// Runs scripts/check-synthpinch-r72.mjs on committed receipts and asserts exit AND finding ids:
//   check-ids        --list-checks declares 94 ids (exit 0)
//   scored-clean     the committed scored receipt with the frozen driver pin: exit 0, no finding
//   exec1-clean      R72Exec1's independent receipt with the frozen pin: exit 0, no finding
//   pin-mismatch     the scored receipt with a wrong pin: exit 1, driver-pin
//   no-receipt       a missing receipt path: exit 2, receipt-unreadable
//   degenerate-*     the three committed degenerate control receipts: exit 1 with their
//                    control-specific ids (dispatch-wheel: send-log-allowlist; set-scale:
//                    send-log-allowlist; skip-touch: leg-touch-seq) and scored-run-not-degenerate
// It does NOT run the negative battery: the r72 battery fails its own case `in-wheel-anchor-2px`
// on the scored receipt (round-72 lesson, Mistakes row 1), so a battery-based self-test would
// either be red or depend on choosing a receipt it passes on.
// Exit 0 all cases as expected; 1 any case off; 2 usage. Writes nothing.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--selftest')) { console.error('usage: node scripts/selftest-r72-gates.mjs --selftest'); process.exit(2); }
const C = path.join(LANE, 'scripts/check-synthpinch-r72.mjs');
const PIN = 'd007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877';
const W = path.join(LANE, '.ufo/waves/round-72');
const run = (args) => { const r = spawnSync(process.execPath, [C, ...args, '--json'], { encoding: 'utf8', timeout: 60000 }); let j = null; try { j = JSON.parse(r.stdout); } catch {} return { exit: r.status, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null }; };
const results = [];
const expect = (name, got, exit, ids, exact = false) => results.push({ name, exit: got.exit, expectedExit: exit, expectedIds: ids, found: got.ids, ok: got.exit === exit && Array.isArray(got.ids) && ids.every((i) => got.ids.includes(i)) && (!exact || got.ids.length === ids.length) });
const l = spawnSync(process.execPath, [C, '--list-checks'], { encoding: 'utf8' });
let n = null; try { n = JSON.parse(l.stdout).length; } catch {}
results.push({ name: 'check-ids', exit: l.status, expectedExit: 0, ids: n, ok: l.status === 0 && n === 94 });
const scored = path.join(LANE, 'corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json');
expect('scored-clean', run(['--receipt', scored, '--expect-driver-sha256', PIN]), 0, [], true);
expect('exec1-clean', run(['--receipt', path.join(W, 'w1/R72Exec1/receipt.json'), '--expect-driver-sha256', PIN]), 0, [], true);
expect('pin-mismatch', run(['--receipt', scored, '--expect-driver-sha256', '0'.repeat(64)]), 1, ['driver-pin'], true);
expect('no-receipt', run(['--receipt', path.join(W, 'no-such-receipt.json')]), 2, ['receipt-unreadable'], true);
const deg = (k) => path.join(W, 'controls/c1/degenerate-' + k + '.receipt.json');
expect('degenerate-dispatch-wheel', run(['--receipt', deg('dispatch-wheel'), '--expect-driver-sha256', PIN]), 1, ['scored-run-not-degenerate', 'send-log-allowlist']);
expect('degenerate-set-scale', run(['--receipt', deg('set-scale'), '--expect-driver-sha256', PIN]), 1, ['scored-run-not-degenerate', 'send-log-allowlist']);
expect('degenerate-skip-touch', run(['--receipt', deg('skip-touch'), '--expect-driver-sha256', PIN]), 1, ['scored-run-not-degenerate', 'leg-touch-seq']);
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ schema: 'tabi-selftest-r72-gates', ok, results }, null, 1));
console.log(`clean=${ok} cases=${results.length} failed=${results.filter((r) => !r.ok).map((r) => r.name).join(',') || 'none'}`);
process.exit(ok ? 0 : 1);
