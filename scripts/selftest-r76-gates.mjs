#!/usr/bin/env node
// Self-test for the round-76 gate (registry home: SKILL.md `## Round 76 gate registry`).
// Usage: node scripts/selftest-r76-gates.mjs --selftest
// Runs scripts/check-dialog-r76.mjs on committed receipts and asserts exit AND finding ids:
//   check-ids          --list-checks declares 131 ids (exit 0)
//   scored-clean       the scored receipt, frozen pin, its nonce, the committed prior set: exit 0, no
//                      finding, and the output records the prior-set file sha256 and its 17 receipts
//   exec1-clean        R76Exec1's receipt (w1/R76Exec1/receipt.txt), its nonce, the prior set + the
//                      scored receipt: exit 0, no finding
//   pin-mismatch       scored receipt with a wrong pin: exit 1, exactly driver-pin and fixture-hash
//   nonce-mismatch     scored receipt with another expected nonce: exit 1, exactly nonce-expected and
//                      prior-set-complete (the scored receipt is then a lane receipt outside the priors)
//   replay-of-scored   scored receipt with itself as an extra prior: exit 1, exactly the three replay ids
//   replay-of-smoke1   PRE smoke1 presented with the scored nonce: exit 1, nonce-expected + three replay ids
//   no-flags           no lane / pin / nonce / prior set: exit 2, usage
//   no-prior-set       everything but --prior-set: exit 2, usage (round-75 routed defect F6)
//   no-receipt         a missing receipt path: exit 2, receipt-unreadable
//   degenerate-*       the three PRE degenerate receipts: exit 1 incl. scored-run-not-degenerate and
//                      their control-specific id
// Exit 0 all cases as expected; 1 any case off; 2 usage. Writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--selftest')) { console.error('usage: node scripts/selftest-r76-gates.mjs --selftest'); process.exit(2); }
const C = path.join(LANE, 'scripts/check-dialog-r76.mjs');
const W = path.join(LANE, '.ufo/waves/round-76');
const PIN = fs.readFileSync(path.join(W, 'freeze.txt'), 'utf8').split('\n').find((l) => l.endsWith('  scripts/chrome-cdp-dialog-round76.mjs')).slice(0, 64);
const D12 = fs.readFileSync(path.join(W, 'scored/digests-commit.txt'), 'utf8').trim().slice(0, 12);
const NA = 'tabi-r76-l1-' + D12, NB = 'tabi-r76-exec1-' + D12;
const C1D = path.join(W, 'controls/c1');
const PS = path.join(C1D, 'prior-set.txt');
const PRE = fs.readFileSync(PS, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => path.join(LANE, l.trim()));
const BASE = ['--lane', LANE, '--prior-set', PS];
const scored = path.join(LANE, 'corpus/evidence/round76/chromium-js-dialog/receipt.json');
const run = (args) => { const r = spawnSync(process.execPath, [C, ...args, '--json'], { encoding: 'utf8', timeout: 60000 }); let j = null; try { j = JSON.parse(r.stdout); } catch {} return { exit: r.status, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null, j }; };
const results = [];
const expect = (name, got, exit, ids, exact = false, extra = true) => results.push({ name, exit: got.exit, expectedExit: exit, expectedIds: ids, found: got.ids, ok: extra && got.exit === exit && Array.isArray(got.ids) && ids.every((i) => got.ids.includes(i)) && (!exact || got.ids.length === ids.length) });
const l = spawnSync(process.execPath, [C, '--list-checks'], { encoding: 'utf8' });
let n = null; try { n = JSON.parse(l.stdout).length; } catch {}
results.push({ name: 'check-ids', exit: l.status, expectedExit: 0, ids: n, ok: l.status === 0 && n === 131 });
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const sc = run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA]);
const priorSetOk = !!sc.j && sc.j.priorSetFile && sc.j.priorSetFile.sha256 === sha(PS) && sc.j.priorSetFile.lines === PRE.length && Array.isArray(sc.j.priorSet) && sc.j.priorSet.length === PRE.length
  && sc.j.priorSet.every((p, i) => p.path === PRE[i] && p.sha256 === sha(PRE[i]) && p.schema === 'tabi-chrome-cdp-dialog-r76');
expect('scored-clean', sc, 0, [], true, priorSetOk);
expect('exec1-clean', run([...BASE, '--receipt', path.join(W, 'w1/R76Exec1/receipt.txt'), '--expect-driver-sha256', PIN, '--expect-nonce', NB, '--prior', scored]), 0, [], true);
expect('pin-mismatch', run([...BASE, '--receipt', scored, '--expect-driver-sha256', '0'.repeat(64), '--expect-nonce', NA]), 1, ['driver-pin', 'fixture-hash'], true);
expect('nonce-mismatch', run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', 'tabi-r76-other']), 1, ['nonce-expected', 'prior-set-complete'], true);
expect('replay-of-scored', run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, '--prior', scored]), 1, REPLAY, true);
const smoke1 = PRE.find((p) => p.endsWith('/smoke1.receipt.json'));
expect('replay-of-smoke1', run([...BASE, '--receipt', smoke1, '--expect-driver-sha256', PIN, '--expect-nonce', NA, '--prior', scored]), 1, ['nonce-expected', ...REPLAY], true);
expect('no-flags', run(['--receipt', scored]), 2, ['usage'], true);
expect('no-prior-set', run(['--lane', LANE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, '--prior', PRE[1]]), 2, ['usage'], true);
expect('no-receipt', run([...BASE, '--receipt', path.join(W, 'no-such-receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', NA]), 2, ['receipt-unreadable'], true);
const deg = (k) => path.join(C1D, 'degenerate-' + k + '.receipt.json');
const degRun = (k) => { const f = fs.readFileSync(PS, 'utf8').split('\n').filter((x) => !x.endsWith('/degenerate-' + k + '.receipt.json')).join('\n');
  const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'r76-selftest-')); const pf = path.join(tmp, 'ps.txt'); fs.writeFileSync(pf, f);
  const nonce = JSON.parse(fs.readFileSync(deg(k), 'utf8')).nonce;
  const r = run(['--lane', LANE, '--prior-set', pf, '--receipt', deg(k), '--expect-driver-sha256', PIN, '--expect-nonce', nonce, '--prior', scored]); fs.rmSync(tmp, { recursive: true, force: true }); return r; };
expect('degenerate-page-stub', degRun('page-stub'), 1, ['scored-run-not-degenerate', 'send-log-allowlist', 'producer-verdict']);
expect('degenerate-eval-trigger', degRun('eval-trigger'), 1, ['scored-run-not-degenerate', 'dialog-call-count', 'trust-law']);
expect('degenerate-swap-accept', degRun('swap-accept'), 1, ['scored-run-not-degenerate', 'dialog-call-params', 'leg-records']);
const ok = results.every((r) => r.ok);
console.log(JSON.stringify({ schema: 'tabi-selftest-r76-gates', ok, results }, null, 1));
console.log(`clean=${ok} cases=${results.length} failed=${results.filter((r) => !r.ok).map((r) => r.name).join(',') || 'none'}`);
process.exit(ok ? 0 : 1);
