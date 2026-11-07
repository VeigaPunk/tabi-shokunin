#!/usr/bin/env node
// R80Review1 forgery harness: mutate the committed scored receipt and run the counter.
// Every crafted receipt is written under this seat dir (never a walked tree).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SEAT = path.join(LANE, '.ufo/waves/round-80-seats/R80Review1');
const REAL = path.join(LANE, 'corpus/evidence/round80/chromium-showpicker/receipt.json');
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r80.mjs');
const PRIOR = path.join(LANE, '.ufo/waves/round-80/controls/c1/prior-set.txt');
const REAL_SHA = crypto.createHash('sha256').update(fs.readFileSync(REAL)).digest('hex');
const clone = (x) => JSON.parse(JSON.stringify(x));
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));

function run(name, mutate, opts = {}) {
  const r = clone(real);
  const extra = mutate(r) || [];
  const p = path.join(SEAT, 'attack-' + name + '.json');
  fs.writeFileSync(p, JSON.stringify(r, null, 1));
  const args = [COUNTER, '--lane', LANE, '--receipt', p,
    '--expect-driver-sha256', opts.driver || real.driverSha256,
    '--expect-nonce', opts.nonce || real.nonce,
    '--expect-fixture-sha256', opts.fixture || r.fixture.sha256,
    '--prior-set', PRIOR, '--tree-exempt-sha256', REAL_SHA, '--json', ...extra];
  const res = spawnSync(process.execPath, args, { encoding: 'utf8' });
  let j = null; try { j = JSON.parse(res.stdout); } catch { /* ignore */ }
  return { name, exit: res.status, verdict: j && j.verdict, checkCount: j && j.checkCount, ids: j && (j.findings || []).map((f) => f.id), detail: j && (j.findings || []).map((f) => f.id + ': ' + f.detail).slice(0, 3) };
}

const legs = (r, n) => r.legs.find((l) => l.name === n);
const opens = (l) => l.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened');
const out = [];

// A: relabel nonce to the frozen predicate nonce across every field the counter binds to it.
out.push(run('A-nonce-relabel', (r) => {
  const old = r.nonce, neu = 'tabi-r80-l1-f9ece6562c94';
  r.nonce = neu;
  for (const l of r.legs) {
    for (const s of [...(l.serverLog || []), ...(l.childServerLog || [])]) if (s.run === old) s.run = neu;
    for (const c of l.cdpSendLog || []) if (c.method === 'Page.navigate' && c.params && typeof c.params.url === 'string') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(neu));
    for (const e of l.cdpEventLog || []) if (e.method === 'Page.frameNavigated' && e.params && typeof e.params.url === 'string') e.params.url = e.params.url.replace(encodeURIComponent(old), encodeURIComponent(neu));
  }
  return [];
}, { nonce: 'tabi-r80-l1-f9ece6562c94' }));

// B: answer-law with a delivery path that does not exist (basename preserved).
out.push(run('B-answer-nonexistent-path', (r) => {
  legs(r, 'sp80-trigger-then-answer').answer.setParams.files = ['/nonexistent/xyz/tabi-r80-a.txt'];
  return [];
}));

// B2 (control): a wrong upload sha256 must be refused.
out.push(run('B2-upload-sha-wrong', (r) => {
  legs(r, 'sp80-trigger-then-answer').upload.sha256 = '0'.repeat(64);
  return [];
}));

// C: duplicate the first chooser event verbatim (one call recorded twice).
out.push(run('C-twice-duplicate-verbatim', (r) => {
  const l = legs(r, 'sp80-twice-gesture');
  const o = clone(opens(l)[0]);
  l.cdpEventLog.push(o);
  return [];
}));

// C2: duplicate it and relabel afterSendId to the second trigger's id.
out.push(run('C2-twice-duplicate-relabelled', (r) => {
  const l = legs(r, 'sp80-twice-gesture');
  const o = clone(opens(l)[0]);
  o.afterSendId = l.trigger2SendId;
  l.cdpEventLog.push(o);
  return [];
}));

// D: move the cross-origin chooser event to the main frame.
out.push(run('D-cross-frame-main', (r) => {
  const l = legs(r, 'sp80-cross-origin');
  opens(l)[0].params.frameId = l.frameTree.mainFrameId;
  return [];
}));

// D2: replace the child's window.__r read with another allowed child expression.
out.push(run('D2-cross-no-child-read', (r) => {
  const l = legs(r, 'sp80-cross-origin');
  const c = l.cdpSendLog.find((x) => x.method === 'Runtime.evaluate' && x.params.expression === 'window.__r');
  c.params.expression = 'window.__late';
  return [];
}));

// E: move the deferred leg's chooser before the click release.
out.push(run('E-deferred-before-click', (r) => {
  const l = legs(r, 'sp80-deferred-timer');
  opens(l)[0].afterSendId = l.priorReleaseId - 5;
  return [];
}));

// E2 (control): deferred result false.
out.push(run('E2-deferred-result-false', (r) => {
  legs(r, 'sp80-deferred-timer').deferredResult = { ok: false, name: 'NotAllowedError', message: 'x' };
  return [];
}));

// F: change the fixture hash and echo it as the expectation (the pin is self-referential).
out.push(run('F-fixture-echo', (r) => {
  r.fixture.sha256 = 'ab'.repeat(32);
  return [];
}, { fixture: 'ab'.repeat(32) }));

// I: one call recorded once, second result nulled.
out.push(run('I-twice-one-call', (r) => {
  const l = legs(r, 'sp80-twice-gesture');
  l.showPicker2 = null;
  l.cdpEventLog = l.cdpEventLog.filter((e) => !(e.method === 'Page.fileChooserOpened' && e.afterSendId === l.trigger2SendId));
  return [];
}));

// J (control): wrong delivered hex.
out.push(run('J-read-hex-wrong', (r) => {
  const l = legs(r, 'sp80-trigger-then-answer');
  l.pageEvents.find((e) => e.type === 'read').ret = 'hex:00';
  return [];
}));

fs.writeFileSync(path.join(SEAT, 'attacks-results.json'), JSON.stringify(out, null, 1));
for (const o of out) console.log(JSON.stringify(o));
