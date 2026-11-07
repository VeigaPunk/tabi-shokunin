#!/usr/bin/env node
// Round 74 post-freeze supplementary checks (frozen instruments run unchanged; nothing amended).
// (1) crossgen: every scored/seat receipt under the pinned counter with PRE PLUS the three committed
//     probe receipts as priors must stay clean (so none is a relabel of a probe), while R74Critic's
//     probe relabels and R74Review1's count-change replays are refused once their source receipt is
//     a prior.
// (2) kill-power attribution: the force-true mutants whose battery result was counted as a kill
//     with failedCases null in scored/c1-kill-power-a.json (R74Review2 F1) are re-run one at a time
//     on the scored receipt; a kill counts only if the battery exits 1 AND names a failing case
//     whose expected id is the mutated check.
// Usage: node postfreeze-checks.mjs --work <ABS scratch>   (writes postfreeze-checks.json beside it)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../..');
const R = path.join(LANE, '.ufo/waves/round-74');
const C1D = path.join(R, 'controls/c1');
const wi = process.argv.indexOf('--work');
const work = wi >= 0 ? process.argv[wi + 1] : null;
if (!work || !path.isAbsolute(work)) { console.error('usage: --work <ABS scratch>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const PIN = fs.readFileSync(path.join(R, 'freeze.txt'), 'utf8').split('\n').find((l) => l.endsWith('  scripts/chrome-cdp-imecompose-round74.mjs')).slice(0, 64);
const D12 = fs.readFileSync(path.join(R, 'scored/digests-commit.txt'), 'utf8').trim().slice(0, 12);
const NA = 'tabi-r74-l1-' + D12, NB = 'tabi-r74-exec1-' + D12;
const PRE = [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => path.join(C1D, `smoke${i}.receipt.json`)), ...['dispatch-key', 'exec-command', 'script-events'].map((k) => path.join(C1D, `degenerate-${k}.receipt.json`))];
const PROBES = ['p2', 'p3', 'p4'].map((p) => path.join(C1D, 'probe', p + '.receipt.json'));
const P = (list) => list.flatMap((p) => ['--prior', p]);
const scored = path.join(LANE, 'corpus/evidence/round74/chromium-ime-composition/receipt.json');
const W1 = path.join(R, 'w1');
const counter = (receipt, nonce, priors) => {
  const r = spawnSync(process.execPath, [path.join(LANE, 'scripts/check-imecompose-r74.mjs'), '--receipt', receipt, '--expect-driver-sha256', PIN, '--expect-nonce', nonce, ...P(priors), '--json'], { encoding: 'utf8', timeout: 120000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  return { exit: r.status, ids: j ? j.findings.map((f) => f.id) : null };
};
const nonceOf = (f) => JSON.parse(fs.readFileSync(f, 'utf8')).nonce;
const crossgen = [];
const addC = (name, receipt, nonce, priors, expectExit, expectIds) => {
  const o = counter(receipt, nonce, priors);
  crossgen.push({ name, receipt: path.relative(LANE, receipt), priors: priors.length, expectExit, expectIds, exit: o.exit, ids: o.ids, ok: o.exit === expectExit && Array.isArray(o.ids) && expectIds.every((i) => o.ids.includes(i)) && (expectExit !== 0 || o.ids.length === 0) });
};
addC('scored-a-pre-plus-probes', scored, NA, [...PRE, ...PROBES], 0, []);
addC('exec1-pre-plus-probes-plus-a', path.join(W1, 'R74Exec1/receipt.json'), NB, [...PRE, ...PROBES, scored], 0, []);
for (const d of ['d1', 'd2', 'd3']) { const f = path.join(W1, 'R74Exec2', d + '.receipt.json'); addC('exec2-' + d + '-pre-plus-probes-plus-a', f, nonceOf(f), [...PRE, ...PROBES, scored], 0, []); }
const REPLAY_ANY = ['replay-launch-token'];
addC('critic-p2-relabel-pre-only', path.join(W1, 'R74Critic/min-tabi-r74-l1-ca30e1a3b7b2.json'), NA, PRE, 0, []);
addC('critic-p2-relabel-pre-plus-probes', path.join(W1, 'R74Critic/min-tabi-r74-l1-ca30e1a3b7b2.json'), NA, [...PRE, ...PROBES], 1, REPLAY_ANY);
addC('critic-p3-relabel-pre-plus-probes', path.join(W1, 'R74Critic/min-tabi-r74-exec1-ca30e1a3b7b2.json'), NB, [...PRE, ...PROBES], 1, REPLAY_ANY);
for (const b of ['b4-smoke1-all-ids-plus-dup-focus.replay', 'b5-smoke1-all-ids-minus-focus.replay']) {
  const f = path.join(W1, 'R74Review1', b + '.json');
  if (fs.existsSync(f)) addC('review1-' + b.split('-')[0] + '-count-change-pre', f, nonceOf(f), PRE, 0, []);
}
// (2) kill-power attribution re-run
const kp = JSON.parse(fs.readFileSync(path.join(R, 'scored/c1-kill-power-a.json'), 'utf8'));
const nulls = kp.results.filter((m) => m.killed && m.failedCases === null).map((m) => ({ cls: m.cls, id: m.mutant }));
const counterSrc = fs.readFileSync(path.join(LANE, 'scripts/check-imecompose-r74.mjs'), 'utf8');
const HOOK = 'const check = (id, ok, detail) => { checks[id] = !!ok;';
const battery = JSON.parse(fs.readFileSync(path.join(R, 'scored/c1-negatives-a.json'), 'utf8'));
const expectOf = new Map(battery.results.map((x) => [x.case, x.expect]));
const reruns = nulls.map((m) => {
  if (m.cls !== 'force-true') return { ...m, note: 'not a force-true mutant; not re-run', ok: false };
  const d = path.join(work, 'kp-' + m.id); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, 'w'), { recursive: true });
  fs.writeFileSync(path.join(d, 'check-imecompose-r74.mjs'), counterSrc.replace(HOOK, `const check = (id, ok, detail) => { if (id === ${JSON.stringify(m.id)}) ok = true; checks[id] = !!ok;`));
  for (const f of ['negatives-imecompose-r74.mjs', 'chrome-cdp-imecompose-round74.mjs']) fs.copyFileSync(path.join(LANE, 'scripts', f), path.join(d, f));
  const r = spawnSync(process.execPath, [path.join(d, 'negatives-imecompose-r74.mjs'), '--real', scored, '--expect-driver-sha256', PIN, '--expect-nonce', NA, ...P(PRE), '--work', path.join(d, 'w'),
    ...['dispatch-key', 'exec-command', 'script-events'].flatMap((k) => ['--laundered', path.join(C1D, `degenerate-${k}.receipt.json`)]), '--json'], { encoding: 'utf8', timeout: 1800000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  fs.rmSync(d, { recursive: true, force: true });
  const failed = j ? j.failed : null;
  const attributed = Array.isArray(failed) && failed.some((c) => expectOf.get(c) === m.id);
  return { ...m, batteryExit: r.status, failedCases: failed, attributed, ok: r.status === 1 && attributed };
});
const out = { schema: 'tabi-r74-postfreeze-checks', pin: PIN, crossgen, killPowerNullRows: nulls.length, reruns,
  allOk: crossgen.every((c) => c.ok) && reruns.every((x) => x.ok) };
fs.writeFileSync(path.join(HERE, 'postfreeze-checks.json'), JSON.stringify(out, null, 1) + '\n');
console.log(crossgen.map((c) => `${c.ok ? 'ok  ' : 'FAIL'} ${c.name} exit=${c.exit} ids=${JSON.stringify(c.ids)}`).join('\n'));
console.log(reruns.map((x) => `${x.ok ? 'ok  ' : 'FAIL'} rerun ${x.cls}:${x.id} exit=${x.batteryExit} attributed=${x.attributed} failed=${JSON.stringify(x.failedCases)}`).join('\n'));
console.log('allOk=' + out.allOk);
process.exit(out.allOk ? 0 : 1);
