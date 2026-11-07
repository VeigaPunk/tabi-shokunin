#!/usr/bin/env node
// Self-test for the round-74 gate (registry home: SKILL.md `## Round 74 gate registry`).
// Usage: node scripts/selftest-r74-gates.mjs --selftest
// Runs scripts/check-imecompose-r74.mjs on committed receipts and asserts exit AND finding ids:
//   check-ids          --list-checks declares 148 ids (exit 0)
//   scored-clean       the scored receipt, frozen pin, its nonce, the 12 PRE priors: exit 0, no finding
//   exec1-clean        R74Exec1's receipt, its nonce, PRE + the scored receipt as priors: exit 0, no finding
//   pin-mismatch       scored receipt with a wrong pin: exit 1, exactly driver-pin and fixture-hash (the
//                      counter reads the fixture template only from a driver file whose bytes match the pin)
//   nonce-mismatch     scored receipt with another expected nonce: exit 1, exactly nonce-expected
//   replay-of-scored   scored receipt with itself among the priors: exit 1, exactly the three replay ids
//   replay-of-smoke1   PRE smoke1 presented with the scored nonce: exit 1, nonce-expected + three replay ids
//   no-flags           no pin / nonce / priors: exit 2, usage
//   no-receipt         a missing receipt path: exit 2, receipt-unreadable
//   degenerate-*       the three PRE degenerate receipts: exit 1 incl. scored-run-not-degenerate and
//                      their control-specific id
// Exit 0 all cases as expected; 1 any case off; 2 usage. Writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--selftest')) { console.error('usage: node scripts/selftest-r74-gates.mjs --selftest'); process.exit(2); }
const C = path.join(LANE, 'scripts/check-imecompose-r74.mjs');
const W = path.join(LANE, '.ufo/waves/round-74');
const PIN = fs.readFileSync(path.join(W, 'freeze.txt'), 'utf8').split('\n').find((l) => l.endsWith('  scripts/chrome-cdp-imecompose-round74.mjs')).slice(0, 64);
const D12 = fs.readFileSync(path.join(W, 'scored/digests-commit.txt'), 'utf8').trim().slice(0, 12);
const NA = 'tabi-r74-l1-' + D12, NB = 'tabi-r74-exec1-' + D12;
const C1D = path.join(W, 'controls/c1');
const PRE = [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => path.join(C1D, `smoke${i}.receipt.json`)), ...['dispatch-key', 'exec-command', 'script-events'].map((k) => path.join(C1D, `degenerate-${k}.receipt.json`))];
const P = PRE.flatMap((p) => ['--prior', p]);
const scored = path.join(LANE, 'corpus/evidence/round74/chromium-ime-composition/receipt.json');
const run = (args) => { const r = spawnSync(process.execPath, [C, ...args, '--json'], { encoding: 'utf8', timeout: 60000 }); let j = null; try { j = JSON.parse(r.stdout); } catch {} return { exit: r.status, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null }; };
const results = [];
const expect = (name, got, exit, ids, exact = false) => results.push({ name, exit: got.exit, expectedExit: exit, expectedIds: ids, found: got.ids, ok: got.exit === exit && Array.isArray(got.ids) && ids.every((i) => got.ids.includes(i)) && (!exact || got.ids.length === ids.length) });
const l = spawnSync(process.execPath, [C, '--list-checks'], { encoding: 'utf8' });
let n = null; try { n = JSON.parse(l.stdout).length; } catch {}
results.push({ name: 'check-ids', exit: l.status, expectedExit: 0, ids: n, ok: l.status === 0 && n === 148 });
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
expect('scored-clean', run(['--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, ...P]), 0, [], true);
expect('exec1-clean', run(['--receipt', path.join(W, 'w1/R74Exec1/receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', NB, ...P, '--prior', scored]), 0, [], true);
expect('pin-mismatch', run(['--receipt', scored, '--expect-driver-sha256', '0'.repeat(64), '--expect-nonce', NA, ...P]), 1, ['driver-pin', 'fixture-hash'], true);
expect('nonce-mismatch', run(['--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', 'tabi-r74-other', ...P]), 1, ['nonce-expected'], true);
expect('replay-of-scored', run(['--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, ...P, '--prior', scored]), 1, REPLAY, true);
expect('replay-of-smoke1', run(['--receipt', PRE[0], '--expect-driver-sha256', PIN, '--expect-nonce', NA, ...P]), 1, ['nonce-expected', ...REPLAY], true);
expect('no-flags', run(['--receipt', scored]), 2, ['usage'], true);
expect('no-receipt', run(['--receipt', path.join(W, 'no-such-receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', NA, ...P]), 2, ['receipt-unreadable'], true);
const deg = (k) => path.join(C1D, 'degenerate-' + k + '.receipt.json');
const others = (k) => PRE.filter((p) => p !== deg(k)).flatMap((p) => ['--prior', p]);
const degNonce = (k) => JSON.parse(fs.readFileSync(deg(k), 'utf8')).nonce;
expect('degenerate-dispatch-key', run(['--receipt', deg('dispatch-key'), '--expect-driver-sha256', PIN, '--expect-nonce', degNonce('dispatch-key'), ...others('dispatch-key')]), 1, ['scored-run-not-degenerate', 'ime-call-count', 'send-log-allowlist']);
expect('degenerate-exec-command', run(['--receipt', deg('exec-command'), '--expect-driver-sha256', PIN, '--expect-nonce', degNonce('exec-command'), ...others('exec-command')]), 1, ['scored-run-not-degenerate', 'send-log-allowlist']);
expect('degenerate-script-events', run(['--receipt', deg('script-events'), '--expect-driver-sha256', PIN, '--expect-nonce', degNonce('script-events'), ...others('script-events')]), 1, ['scored-run-not-degenerate', 'send-log-allowlist', 'trust-law']);
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ schema: 'tabi-selftest-r74-gates', ok, results }, null, 1));
console.log(`clean=${ok} cases=${results.length} failed=${results.filter((r) => !r.ok).map((r) => r.name).join(',') || 'none'}`);
process.exit(ok ? 0 : 1);
