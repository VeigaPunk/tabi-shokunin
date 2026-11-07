#!/usr/bin/env node
// Self-test for the round-78 gate (registry home: SKILL.md `## Round 78 gate registry`).
// Usage: node scripts/selftest-r78-gates.mjs --selftest
// Runs scripts/check-filechooser-r78.mjs on committed receipts and asserts exit AND finding ids:
//   check-ids          --list-checks declares 186 ids (exit 0)
//   scored-clean       the scored receipt, frozen pin, its nonce, the committed prior set: exit 0, no
//                      finding; the output records the prior-set file sha256 and its 10 receipts, and
//                      its limit block derives each prior's need from that PRIOR's own counts
//                      (absNeed = ceil(0.5 * priorEvents), gapNeed = ceil(0.75 * priorGaps)) -- the
//                      r77 defect that demanded 79/11 of every prior (3 of 10 are degenerate
//                      producers with 37 and 35 events) is closed by this derivation (r78 E4).
//   cold-clean         a cold run produced after the freeze (.ufo/waves/round-78/scored/cold1.receipt.json):
//                      exit 0, no finding, its own nonce
//   pin-mismatch       scored receipt with a wrong pin: exit 1, exactly driver-pin and fixture-hash
//   nonce-mismatch     scored receipt with another expected nonce: exit 1, exactly nonce-expected
//   nonce-shape        scored receipt with an upper-case nonce: exit 1, nonce-shape + nonce-expected
//   replay-of-scored   scored receipt with itself as an extra prior: exit 1, exactly the three replay ids
//   replay-of-smoke    PRE smoke with the scored nonce, the prior set as committed: exit 1,
//                      nonce-expected + the three replay ids (it is its own prior)
//   tree-exempt-absent a pre-freeze receipt with a prior set excluding it and NO --tree-exempt: exit 1,
//                      prior-set-complete (the exemption is a path, not a nonce)
//   no-flags           no lane / pin / nonce / prior set: exit 2, usage
//   no-prior-set       everything but --prior-set: exit 2, usage
//   no-receipt         a missing receipt path: exit 2, receipt-unreadable
//   degenerate-*       the three PRE degenerate receipts: exit 1 incl. scored-run-not-degenerate and
//                      their control-specific id
// Exit 0 all cases as expected; 1 any case off; 2 usage. Writes nothing in the lane.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const LANE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--selftest')) { console.error('usage: node scripts/selftest-r78-gates.mjs --selftest'); process.exit(2); }
const C = path.join(LANE, 'scripts/check-filechooser-r78.mjs');
const W = path.join(LANE, '.ufo/waves/round-78');
const PIN = fs.readFileSync(path.join(W, 'freeze.txt'), 'utf8').split('\n').find((l) => l.endsWith('  scripts/chrome-cdp-filechooser-round78.mjs')).slice(0, 64);
const D12 = fs.readFileSync(path.join(W, 'scored/digests-commit.txt'), 'utf8').trim().slice(0, 12);
const NA = 'tabi-r78-l1-' + D12, NB = 'tabi-r78-cold1-' + D12;
const C1D = path.join(W, 'controls/c1');
const PS = path.join(C1D, 'prior-set.txt');
const PRE = fs.readFileSync(PS, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => path.join(LANE, l.trim()));
const BASE = ['--lane', LANE, '--prior-set', PS];
const scored = path.join(LANE, 'corpus/evidence/round78/chromium-file-chooser/receipt.json');
const cold1 = path.join(LANE, '.ufo/waves/round-78-seats/L1-cold1/receipt.json');
const run = (args) => { const r = spawnSync(process.execPath, [C, ...args, '--json'], { encoding: 'utf8', timeout: 60000, maxBuffer: 1 << 26 }); let j = null; try { j = JSON.parse(r.stdout); } catch {} return { exit: r.status, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null, j }; };
const results = [];
const expect = (name, got, exit, ids, exact = false, extra = true) => results.push({ name, exit: got.exit, expectedExit: exit, expectedIds: ids, found: got.ids, ok: extra && got.exit === exit && Array.isArray(got.ids) && ids.every((i) => got.ids.includes(i)) && (!exact || got.ids.length === ids.length) });
const l = spawnSync(process.execPath, [C, '--list-checks'], { encoding: 'utf8' });
let n = null; try { n = JSON.parse(l.stdout).length; } catch {}
results.push({ name: 'check-ids', exit: l.status, expectedExit: 0, ids: n, ok: l.status === 0 && n === 186 });
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const sc = run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA]);
// E4: the per-prior needs are the counter's own arithmetic over each PRIOR's counts, not a fixed number.
const needsOk = !!sc.j && sc.j.priorSetFile && sc.j.priorSetFile.sha256 === sha(PS) && sc.j.priorSetFile.lines === PRE.length
  && Array.isArray(sc.j.priorSet) && sc.j.priorSet.length === PRE.length
  && sc.j.priorSet.every((p, i) => path.resolve(p.path) === path.resolve(PRE[i]) && p.sha256 === sha(PRE[i]) && (p.schema === 'tabi-chrome-cdp-filechooser-r78' || p.schema === 'tabi-chrome-cdp-filechooser-r77'))
  && sc.j.priorSet.filter((p) => p.schema === 'tabi-chrome-cdp-filechooser-r78').length === 10
  && Array.isArray(sc.j.limit) && sc.j.limit.length === PRE.length
  && sc.j.limit.every((s) => s.absNeed === Math.ceil(0.5 * s.priorEvents - 1e-9) && s.gapNeed === Math.ceil(0.75 * s.priorGaps - 1e-9) && s.refused === false)
  && sc.j.limit.some((s) => s.priorEvents !== sc.j.limit[0].priorEvents); // priors of different sizes are honestly different
expect('scored-clean', sc, 0, [], true, needsOk);
expect('cold-clean', run([...BASE, '--receipt', cold1, '--expect-driver-sha256', PIN, '--expect-nonce', NB, '--prior', scored]), 0, [], true);
expect('pin-mismatch', run([...BASE, '--receipt', scored, '--expect-driver-sha256', '0'.repeat(64), '--expect-nonce', NA]), 1, ['driver-pin', 'fixture-hash'], true);
expect('nonce-mismatch', run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', 'tabi-r78-other']), 1, ['nonce-expected'], true);
expect('nonce-expected-uppercase', run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', 'TABI-R78-X']), 2, ['usage'], true);
expect('replay-of-scored', run([...BASE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, '--prior', scored]), 1, REPLAY, true);
const smoke1 = PRE.find((p) => p.endsWith('/smoke/s1.receipt.json'));
expect('replay-of-smoke', run([...BASE, '--receipt', smoke1, '--expect-driver-sha256', PIN, '--expect-nonce', NA, '--prior', scored]), 1, ['nonce-expected', ...REPLAY], true);
// E2: the exemption is a path. This pre-freeze receipt is excluded from the given set and NOT passed
// as --tree-exempt, so the walk must refuse it as an unlisted schema receipt.
const psExemptAbsent = path.join(C1D, 'pf/ps-tree-exempt-absent.txt');
expect('tree-exempt-absent', run(['--lane', LANE, '--prior-set', psExemptAbsent, '--receipt', path.join(C1D, 'smoke/s2.receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', 'tabi-r78-s2']), 1, ['prior-set-complete'], true);
expect('no-flags', run(['--receipt', scored]), 2, ['usage'], true);
expect('no-prior-set', run(['--lane', LANE, '--receipt', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, '--prior', PRE[1]]), 2, ['usage'], true);
expect('no-receipt', run([...BASE, '--receipt', path.join(W, 'no-such-receipt.json'), '--expect-driver-sha256', PIN, '--expect-nonce', NA]), 2, ['receipt-unreadable'], true);
const deg = (k) => path.join(C1D, 'deg-' + k + '.receipt.json');
const degRun = (k) => run(['--lane', LANE, '--prior-set', path.join(C1D, 'pf/ps-deg-' + k + '.txt'), '--receipt', deg(k), '--expect-driver-sha256', PIN, '--expect-nonce', 'tabi-r78-deg-' + k]);
expect('degenerate-page-stub', degRun('page-stub'), 1, ['scored-run-not-degenerate', 'send-log-allowlist']);
expect('degenerate-eval-trigger', degRun('eval-trigger'), 1, ['scored-run-not-degenerate', 'chooser-call-count']);
expect('degenerate-swap-files', degRun('swap-files'), 1, ['scored-run-not-degenerate', 'chooser-call-params']);
const ok = results.every((r) => r.ok);
const emit = (s) => { const b = Buffer.from(s); let off = 0; while (off < b.length) { try { off += fs.writeSync(1, b, off); } catch (e) { if (e.code !== 'EAGAIN') throw e; } } };
emit(JSON.stringify({ schema: 'tabi-selftest-r78-gates', ok, results }, null, 1) + '\n');
emit(`clean=${ok} cases=${results.length} failed=${results.filter((r) => !r.ok).map((r) => r.name).join(',') || 'none'}\n`);
process.exitCode = ok ? 0 : 1;
