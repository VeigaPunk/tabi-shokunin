#!/usr/bin/env node
// R79Review1 forgery harness: clone the honest scored receipt, mutate one axis, run the counter.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SEAT = path.join(LANE, '.ufo/waves/round-79-seats/R79Review1');
const REAL = path.join(LANE, 'corpus/evidence/round79/chromium-showpicker/receipt.json');
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r79.mjs');
const PIN = 'e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE = 'tabi-r79-l1-3a1209c0d624';
const PS = path.join(LANE, '.ufo/waves/round-79/controls/c1/prior-set.txt');
const GESTURE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.";
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const FIX = real.fixture.sha256;
const clone = (v) => JSON.parse(JSON.stringify(v));
const dir = path.join(SEAT, 'forgeries');
fs.mkdirSync(dir, { recursive: true });

const run = (receiptPath, expectFixture = FIX) => {
  const args = [COUNTER, '--lane', LANE, '--receipt', receiptPath, '--expect-driver-sha256', PIN,
    '--expect-nonce', NONCE, '--expect-fixture-sha256', expectFixture, '--prior-set', PS, '--tree-exempt-sha256', 'bda38512ece0d95a61fa54c2036ca1be3389aedb5e774c96852a9eff80dc30b7', '--json'];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { exit: r.status, verdict: j && j.verdict, checkCount: j && j.checkCount, findings: j ? j.findings.map((f) => f.id) : null, stderr: (r.stderr || '').slice(0, 300) };
};
const emit = (name, mutate, expectFixtureFromReceipt = false) => {
  const r = clone(real);
  mutate(r);
  const p = path.join(dir, name + '.json');
  fs.writeFileSync(p, JSON.stringify(r, null, 1));
  const res = run(p, expectFixtureFromReceipt ? r.fixture.sha256 : FIX);
  return { name, ...res };
};

const results = [];
// A: the r78 file-chooser receipt (did not run showPicker) under the r79 pins.
results.push({ name: 'A-r78-receipt', ...run(path.join(LANE, 'corpus/evidence/round78/chromium-file-chooser/receipt.json')) });
// B: gesture-law, wrong message only (class/ok intact).
results.push(emit('B-wrong-message', (r) => { r.legs[0].showPicker.message = 'requires a user gesture (forged)'; }));
// C: gesture-law, wrong class only (message intact).
results.push(emit('C-wrong-class', (r) => { r.legs[0].showPicker.name = 'SecurityError'; }));
// D: the trigger never ran on the wire: triggerResult null + a CDP-level triggerError, showPicker/activation untouched.
results.push(emit('D-trigger-never-ran', (r) => {
  for (const l of r.legs) if (l.kind === 'showpicker' || l.kind === 'showpicker-twice') {
    l.triggerResult = null; l.triggerError = { code: -32000, message: 'Execution was terminated (forged)' };
    if (l.kind === 'showpicker-twice') { l.trigger2Result = null; l.trigger2Error = { code: -32000, message: 'Execution was terminated (forged)' }; }
  }
}));
// E: wire result contradicts the parsed outcome on one leg.
results.push(emit('E-contradictory-wire', (r) => {
  r.legs[2].triggerResult = { value: { ok: false, name: 'NotAllowedError', message: GESTURE_ERR } };
}));
// F: the same trigger expression replayed as an extra send (new id, sequential).
results.push(emit('F-replayed-trigger-send', (r) => {
  const l = r.legs[2];
  const maxId = Math.max(...l.cdpSendLog.map((c) => c.id));
  l.cdpSendLog.push({ id: maxId + 1, method: 'Runtime.evaluate', params: { expression: l.cdpSendLog.find((c) => c.id === l.triggerSendId).params.expression, returnByValue: true } });
}));
// G: an observable selection in the page state.
results.push(emit('G-selected-file', (r) => { r.legs[2].stateAfter.s = ['picked.png']; }));
// H: a change event carrying a file.
results.push(emit('H-change-event', (r) => {
  const l = r.legs[2];
  const last = l.pageEvents[l.pageEvents.length - 1];
  l.pageEvents.push({ type: 'change', ts: last.ts, isTrusted: true, act: false, target: 's', x: null, y: null, buttons: null, files: ['picked.png'], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: last.at });
}));
// I: fixture sha and patch are self-supplied: change both, pass the new sha.
results.push(emit('I-fixture-self-supplied', (r) => {
  r.fixture.sha256 = 'f'.repeat(64);
  r.fixture.patch = { style: 'forged', body: 'forged', inputs: 'forged', state: 'forged' };
}, true));
// J: interceptResult unbound.
results.push(emit('J-intercept-result-null', (r) => { for (const l of r.legs) if (l.intercept) l.interceptResult = null; }));
// K: control: dismissResult is bound.
results.push(emit('K-dismiss-result', (r) => { for (const l of r.legs) if (l.dismissSendId !== null) l.dismissResult = { foo: 1 }; }));
// L: control: a showPicker leg with no trigger send at all (delete the send entry, renumber).
results.push(emit('L-no-trigger-send', (r) => {
  const l = r.legs[2];
  l.cdpSendLog = l.cdpSendLog.filter((c) => c.id !== l.triggerSendId).map((c, i) => ({ ...c, id: i + 1 }));
  l.triggerSendId = null;
}));

fs.writeFileSync(path.join(SEAT, 'forgeries-summary.json'), JSON.stringify(results, null, 1));
for (const x of results) console.log(x.name.padEnd(28), 'exit=' + x.exit, 'verdict=' + x.verdict, 'checks=' + x.checkCount, 'findings=' + JSON.stringify(x.findings));
