#!/usr/bin/env node
// Kill power for check-showpicker-proxy-round91.mjs (round-91 C1 leg (b)). Each mutant weakens
// exactly one clause of the counter; the frozen battery must fail on that mutant (the case whose
// expected finding the mutant removed). A mutant the battery still accepts is a survivor.
//
// Usage:
//   node kill-power-proxy-round91.mjs --lane <ABS lane> --real <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <tabi-r91-...>
//     --expect-parent-sha256 <hex> --expect-same-sha256 <hex> --expect-child-sha256 <hex>
//     --prior-set <file> --work <scratch> [--json]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
const realPath = opt('real');
const work = opt('work');
const pins = {
  driver: opt('expect-driver-sha256'), nonce: opt('expect-nonce'),
  parent: opt('expect-parent-sha256'), same: opt('expect-same-sha256'), child: opt('expect-child-sha256'),
};
const priorSet = opt('prior-set');
if (!lane || !realPath || !work || !priorSet) {
  process.stdout.write(JSON.stringify({ schema: 'tabi-r91-proxy-killpower', verdict: 'usage', detail: '--lane --real --work --prior-set are required' }) + '\n');
  process.exit(2);
}
fs.mkdirSync(work, { recursive: true });
const counterPath = path.join(path.dirname(SELF), 'check-showpicker-proxy-round91.mjs');
const batteryPath = path.join(path.dirname(SELF), 'negatives-showpicker-proxy-round91.mjs');
const src = fs.readFileSync(counterPath, 'utf8');

const MUTANTS = [
  { name: 'schema-check-removed', from: "check('schema', r.schema === SCHEMA, 'schema ' + r.schema);", to: "check('schema', true, 'schema');" },
  { name: 'nonce-expected-removed', from: "check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);", to: "check('nonce-expected', true, 'nonce');" },
  { name: 'driver-pin-removed', from: "check('driver-pin', r.driverSha256 === pin, 'driver ' + r.driverSha256);", to: "check('driver-pin', true, 'driver');" },
  { name: 'fixture-pins-removed', from: "fx.parent.sha256 === expectParent && fx.same.sha256 === expectSame && fx.child.sha256 === expectChild", to: "fx.parent.sha256 === fx.parent.sha256 && fx.same.sha256 === fx.same.sha256 && fx.child.sha256 === fx.child.sha256" },
  { name: 'plan-frozen-removed', from: "check('plan-frozen', same(legs.map((l) => (isObj(l) ? { name: l.name, frame: l.frame, target: l.target, mode: l.mode, parentPad: l.parentPad, childPad: l.childPad, answer: l.answer && l.answer.name } : null)), PLAN.map((p) => ({ name: p.name, frame: p.frame, target: p.target, mode: p.mode, parentPad: p.parentPad, childPad: p.childPad, answer: p.answer }))),", to: "check('plan-frozen', true," },
  { name: 'leg-order-removed', from: "check('leg-order', same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER)", to: "check('leg-order', true" },
  { name: 'leg-records-removed', from: "check('leg-records', legs.length === PLAN.length && legs.every((l) => isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && arr(l.errors).length === 0", to: "check('leg-records', legs.length === PLAN.length && legs.every((l) => isObj(l) && arr(l.errors).length === 0" },
  { name: 'leg-marks-removed', from: "arr(l.marks).length >= 3 && arr(l.marks)[0].name === 'start'", to: "true" },
  { name: 'frame-tree-removed', from: "l.childFrameId === (l.frame === 'so' ? l.soFrameId : l.xoFrameId)", to: "true" },
  { name: 'context-binding-removed', from: "check('context-binding', ctxBad.length === 0,", to: "check('context-binding', true," },
  { name: 'same-element-removed', from: "&& legs.every((l) => isObj(l) && same(l.elements, el))", to: "" },
  { name: 'send-log-allowlist-removed', from: "check('send-log-allowlist', legs.length === PLAN.length && sendBad.length === 0,", to: "check('send-log-allowlist', true," },
  { name: 'plan-calls-removed', from: "check('plan-calls', planBad.length === 0,", to: "check('plan-calls', true," },
  { name: 'chooser-event-removed', from: "check('chooser-event-law', evBad.length === 0,", to: "check('chooser-event-law', true," },
  { name: 'chooser-frame-removed', from: "if (c.params.frameId !== l.childFrameId) evBad.push(l.name + ':frame');", to: "" },
  { name: 'law-removed', from: "check('law', spBad.length === 0,", to: "check('law', true," },
  { name: 'law-sp-removed', from: "if (w.sp !== undefined && !same(l.direct, w.sp))", to: "if (false && w.sp !== undefined && !same(l.direct, w.sp))" },
  { name: 'law-proxy-removed', from: "if (w.proxy !== undefined && !same(l.proxy, { ...w.proxy, target: l.target, origin: PARENT_ORIGIN }))", to: "if (false && w.proxy !== undefined && !same(l.proxy, { ...w.proxy, target: l.target, origin: PARENT_ORIGIN }))" },
  { name: 'activation-parent-removed', from: "if (!same(pa, w.pa)) actBad.push", to: "if (false && !same(pa, w.pa)) actBad.push" },
  { name: 'activation-child-removed', from: "if (!same(ca, w.ca)) actBad.push", to: "if (false && !same(ca, w.ca)) actBad.push" },
  { name: 'proxy-law-removed', from: "check('proxy-law', proxyBad.length === 0,", to: "check('proxy-law', true," },
  { name: 'proxy-log-removed', from: "if (log.length !== 1 || !isObj(log[0]) || log[0].origin !== PARENT_ORIGIN || log[0].cmd !== 'showpicker' || log[0].target !== l.target) proxyBad.push", to: "if (false) proxyBad.push" },
  { name: 'state-law-removed', from: "check('state-law', stateBad.length === 0,", to: "check('state-law', true," },
  { name: 'state-parent-removed', from: "if (!same(l.parentState, [])) stateBad.push", to: "if (false && !same(l.parentState, [])) stateBad.push" },
  { name: 'state-child-removed', from: "} else if (!same(l.childState, [])) stateBad.push", to: "} else if (false && !same(l.childState, [])) stateBad.push" },
  { name: 'event-shape-removed', from: "check('event-shape', evShapeBad.length === 0,", to: "check('event-shape', true," },
  { name: 'event-trust-removed', from: "if (arr(l.pageEvents).some((e) => ptr(e) && !(e.isTrusted === true && e.act === true))) evShapeBad.push", to: "if (false) evShapeBad.push" },
  { name: 'host-argv-removed', from: "check('host-argv', hostBad.length === 0,", to: "check('host-argv', true," },
  { name: 'teardown-removed', from: "check('teardown-closure', legs.every((l) => isObj(l) && isObj(l.teardown) && arr(l.teardown.survivors).length === 0", to: "check('teardown-closure', legs.every((l) => isObj(l) && isObj(l.teardown) && true" },
  { name: 'run-window-removed', from: "check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 30000", to: "check('run-window', true" },
  { name: 'prior-set-removed', from: "check('prior-set', priors.length >= 2 && priorBad.length === 0 && reproduced,", to: "check('prior-set', true," },
  { name: 'replay-identity-removed', from: "check('replay-identity', legs.every((l) => isObj(l) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken))", to: "check('replay-identity', legs.every((l) => isObj(l) && true" },
];

const results = [];
for (const m of MUTANTS) {
  const n = src.split(m.from).length - 1;
  const mp = path.join(work, 'mutant-' + m.name + '.mjs');
  if (n !== 1) {
    results.push({ name: m.name, status: n === 0 ? 'unapplied' : 'crash', detail: 'from-string occurrences ' + n });
    continue;
  }
  fs.writeFileSync(mp, src.replace(m.from, m.to));
  const check = spawnSync(process.execPath, ['--check', mp], { encoding: 'utf8', timeout: 30000 });
  if (check.status !== 0) { results.push({ name: m.name, status: 'crash', detail: 'syntax ' + check.stderr.slice(0, 200) }); continue; }
  const r = spawnSync(process.execPath, [batteryPath, '--lane', lane, '--real', realPath,
    '--expect-driver-sha256', pins.driver, '--expect-nonce', pins.nonce,
    '--expect-parent-sha256', pins.parent, '--expect-same-sha256', pins.same, '--expect-child-sha256', pins.child,
    '--prior-set', priorSet, '--work', path.join(work, 'case-' + m.name), '--counter', mp, '--json'], { encoding: 'utf8', timeout: 300000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  if (r.status === 0 && j && j.ok === true) results.push({ name: m.name, status: 'survived', detail: 'battery accepted the mutant' });
  else results.push({ name: m.name, status: 'killed', detail: j ? 'battery failed ' + (j.failed ?? '?') + ' case(s)' : 'battery exit ' + r.status });
}
const killed = results.filter((x) => x.status === 'killed').length;
const survivors = results.filter((x) => x.status === 'survived');
const crashed = results.filter((x) => x.status === 'crash');
const unapplied = results.filter((x) => x.status === 'unapplied');
const payload = { schema: 'tabi-r91-proxy-killpower', mutants: results.length, killed, survived: survivors.length, crashed: crashed.length, unapplied: unapplied.length, results };
process.stdout.write(JSON.stringify(payload, null, asJson ? 1 : 0) + '\n');
process.exit(survivors.length === 0 && crashed.length === 0 && unapplied.length === 0 ? 0 : 1);
