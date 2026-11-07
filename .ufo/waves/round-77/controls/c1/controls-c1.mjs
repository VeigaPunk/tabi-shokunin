#!/usr/bin/env node
// Round 77 C1 pre-freeze do-nothing / forgery / positive / limit controls for scripts/check-filechooser-r77.mjs.
// Each control states its expected exit and finding ids BEFORE it runs (tabi r63 prerequisite;
// QUALITY 131: exit AND ids, evaluated mechanically). PRE is the committed prior-set.txt (QUALITY
// 140/141), passed by file (--prior-set), never as a hand-written list.
// Usage: node controls-c1.mjs --work <ABS scratch>   (writes controls-summary.json beside this file)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../../..');
const CTR = path.join(LANE, 'scripts/check-filechooser-r77.mjs');
const DRV = path.join(LANE, 'scripts/chrome-cdp-filechooser-round77.mjs');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const driverText = fs.readFileSync(DRV, 'utf8');
const PIN = sha(fs.readFileSync(DRV));
const wi = process.argv.indexOf('--work');
const work = wi >= 0 ? process.argv[wi + 1] : null;
if (!work || !path.isAbsolute(work)) { console.error('usage: --work <ABS scratch>'); process.exit(2); }
fs.mkdirSync(work, { recursive: true });
const PS = path.join(HERE, 'prior-set.txt');
const PRE = fs.readFileSync(PS, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => path.join(LANE, l.trim()));
if (PRE.length === 0) { console.error('empty prior-set.txt'); process.exit(2); }
const BASEARGS = ['--lane', LANE, '--prior-set', PS];
const POST = 'tabi-r77-l1-control0000';   // stands in for the post-freeze nonce the predicate derives
const smoke1Path = PRE.find((p) => p.endsWith('/smoke1.receipt.json'));
const probe1Path = PRE.find((p) => p.endsWith('/probe/p1.receipt.json'));
const smoke1 = JSON.parse(fs.readFileSync(smoke1Path, 'utf8'));
const tpl = /\/\*CHOOSER-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*CHOOSER-FIXTURE-END\*\//.exec(driverText);
const fixtureSha = (nonce) => sha(tpl[1].replaceAll('__NONCE__', nonce));
// control receipts are written as *.case in the scratch work dir (outside the walked trees)
const write = (name, obj) => { const f = path.join(work, name + '.case'); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const rewriteNonce = (r, to, fixToo) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { if (s.run === old) { s.run = to; s.query = 'run=' + encodeURIComponent(to); } });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to)); }
  for (const e of r.cdpEventLog) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.replace(encodeURIComponent(old), encodeURIComponent(to));
  if (fixToo) r.fixture.sha256 = fixtureSha(to);
};
const shiftStamps = (r) => { for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString(); };
const newIds = (r) => {
  const oldTok = r.host.launchToken; const tok = crypto.randomBytes(6).toString('hex'); r.host.launchToken = tok; r.host.argv = r.host.argv.map((a) => a.split(oldTok).join(tok));
  r.upload.dir = r.upload.dir.split(oldTok).join(tok);
  for (const l of r.legs) if (l.setParams) l.setParams.files = l.setParams.files.map((p) => p.split(oldTok).join(tok));
  for (const c of r.cdpSendLog) if (c.method === 'DOM.setFileInputFiles') c.params.files = c.params.files.map((p) => p.split(oldTok).join(tok));
  const oldId = r.host.devtoolsListening.url.split('/devtools/browser/')[1]; const newId = crypto.randomUUID();
  r.host.devtoolsListening.url = r.host.devtoolsListening.url.replace(oldId, newId);
  if (typeof r.host.devtoolsListening.browserId === 'string') r.host.devtoolsListening.browserId = newId;
  r.host.stderrHead = r.host.stderrHead.split(oldId).join(newId);
};
const q = (v) => Math.round(v * 10) / 10;
const shiftAll = (r, d) => { r.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); r.legMarks.forEach((m) => { m.at = q(m.at + d); }); r.closedAt = q(r.closedAt + d); };
// a full relabel: nonce (with fixture hash), stamps, launch token (argv, upload dir, set paths), browser id, driver pin field, producer verdict
const relabel = (src) => { const r = clone(src); rewriteNonce(r, POST, true); shiftStamps(r); newIds(r); r.driverSha256 = PIN; r.predicate = true; r.chooserHypothesis = 'CONFIRMED'; r.degenerate = null; r.failures = []; return r; };
const forgedFix = clone(smoke1); rewriteNonce(forgedFix, POST, true); shiftStamps(forgedFix);
const whole = relabel(smoke1); shiftAll(whole, 0.1);
const whole100 = relabel(smoke1); shiftAll(whole100, 100);
const probeRelabel = relabel(JSON.parse(fs.readFileSync(probe1Path, 'utf8')));
// R76Critic A2 escape re-run on this generation: a relabel that keeps every event of smoke1 but moves
// the two events of its last leg so that it ADDS two gaps (own gaps 13); against smoke1 the forgery
// still matches its 11 gaps -> refused by the prior-denominator rule
const gapsAdded = relabel(smoke1); { const es = gapsAdded.events.filter((e) => e.leg === 'intercept-off'); const mu = es.find((e) => e.type === 'mouseup'), ck = es.find((e) => e.type === 'click'), cc = es.find((e) => e.type === 'cancel'); ck.at = q(mu.at + 60); ck.ts = q(mu.ts + 60); cc.at = q(ck.at + 100); cc.ts = q(ck.ts + 100); }
// declared-limit witness: every event moved by a different multiple of 0.3 ms (monotone: order and windows hold)
const limit = relabel(smoke1); limit.events.forEach((e, i) => { const d = (i + 1) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); });
// host forgeries on an otherwise clean relabel-with-retime (only the forged field may fire)
const hostOld = clone(limit); hostOld.host.chromium = 'Chromium 154.0.8059.84 Arch Linux';
const hostHeadful = clone(limit); hostHeadful.host.argv[1] = '--no-sandbox';
const hostProduct = clone(limit); hostProduct.host.cdpProduct = 'HeadlessChrome/155.0.8059.84';
// error-code forgery: the not-a-file-input refusal with message kept, code -32602 (the producer's legShape edited too)
const errCode = clone(limit); errCode.legs.find((l) => l.name === 'not-file-input').setError.code = -32602; errCode.legShape['not-file-input'].error[2].code = -32602;
// belief forgeries, each written consistently into the producer's summary as a forger would
// (1) "a webkitdirectory input opens a selectMultiple chooser"
const dirMulti = clone(limit); dirMulti.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened' && e.afterSendId === dirMulti.legs.find((l) => l.name === 'dir-mode').triggerSendId).params.mode = 'selectMultiple'; dirMulti.legShape['dir-mode'].opened[0][0] = 'selectMultiple';
// (2) "setFileInputFiles with an empty list clears the selection"
const emptyClears = clone(limit); { const l = emptyClears.legs.find((x) => x.name === 'pick-empty'); l.stateAfter = { ...l.stateAfter, s: [], sValue: '' }; emptyClears.legShape['pick-empty'].stateAfter = l.stateAfter; }
// (3) "accept=.png filters a .txt file out" (no input/change/read on k, k stays empty)
const acceptFilters = clone(limit); { acceptFilters.events = acceptFilters.events.filter((e) => !(e.leg === 'accept-ignored' && ['input', 'change', 'read'].includes(e.type))); acceptFilters.events.forEach((e, i) => { e.seq = i + 1; });
  for (const nm of ['accept-ignored', 'forward-click', 'script-click', 'not-file-input', 'intercept-cancel', 'intercept-off']) { const l = acceptFilters.legs.find((x) => x.name === nm); l.stateAfter = { ...l.stateAfter, k: [] }; }
  const ls = acceptFilters.legShape['accept-ignored']; ls.seq = ls.seq.slice(0, 5); ls.trusted = ls.trusted.slice(0, 5); ls.act = ls.act.slice(0, 5); ls.xy = ls.xy.slice(0, 5); ls.files = []; ls.read = [];
  for (const nm of ['accept-ignored', 'forward-click', 'script-click', 'not-file-input', 'intercept-cancel', 'intercept-off']) acceptFilters.legShape[nm].stateAfter = acceptFilters.legs.find((x) => x.name === nm).stateAfter; }
// prior set omitting one committed receipt
const psShort = path.join(work, 'prior-set-short.txt'); fs.writeFileSync(psShort, fs.readFileSync(PS, 'utf8').split('\n').filter((l) => !l.endsWith('/probe/p2.receipt.json')).join('\n'));

const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const C = (rel) => ['--receipt', rel, '--expect-driver-sha256', PIN];
const r76 = path.join(LANE, 'corpus/evidence/round76/chromium-js-dialog/receipt.json');
const controls = [
  { name: 'donothing-no-receipt', args: [...BASEARGS, ...C(path.join(work, 'absent.json')), '--expect-nonce', POST], expectExit: 2, expectIds: ['receipt-unreadable'], exact: true,
    why: 'no work: no r77 file-chooser receipt exists' },
  { name: 'donothing-r76-dialog-receipt', args: [...BASEARGS, ...C(r76), '--expect-nonce', POST], expectExit: 1, expectIds: ['schema', 'nonce-shape', 'nonce-expected', 'driver-pin', 'chooser-call-count', 'cdp-event-log-closed', 'upload-binding'], exact: false,
    why: 'no work: re-present the lane\'s newest committed capability receipt (r76 dialog) as a file-chooser run' },
  { name: 'donothing-no-flags', args: ['--receipt', smoke1Path], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'call without lane, pin, nonce or prior set: refused as usage' },
  { name: 'donothing-no-prior-set', args: ['--lane', LANE, ...C(smoke1Path), '--expect-nonce', smoke1.nonce, '--prior', PRE[1]], expectExit: 2, expectIds: ['usage'], exact: true,
    why: 'a caller that omits the committed prior set is refused' },
  { name: 'prior-set-short', args: ['--lane', LANE, '--prior-set', psShort, ...C(smoke1Path), '--expect-nonce', smoke1.nonce], expectExit: 1, expectIds: [...REPLAY, 'prior-set-complete'], exact: true,
    why: 'a prior set missing one committed receipt (probe p2) is caught by the tree walk (smoke1 itself is also refused as a replay of its own copy in PRE)' },
  { name: 'replay-zeroedit-smoke1', args: [...BASEARGS, ...C(smoke1Path), '--expect-nonce', POST], expectExit: 1, expectIds: ['nonce-expected', ...REPLAY], exact: true,
    why: 'QUALITY 136 replay 1: byte-identical pre-freeze receipt presented as the post-freeze run' },
  { name: 'replay-forged-nonce-stamps-fixture', args: [...BASEARGS, ...C(write('forged-nonce-stamps-fixture', forgedFix)), '--expect-nonce', POST], expectExit: 1, expectIds: REPLAY, exact: true,
    why: 'nonce rewritten everywhere it is logged, fixture hash recomputed, stamps +1 h' },
  { name: 'replay-forged-whole-shift-0.1ms', args: [...BASEARGS, ...C(write('forged-whole-shift', whole)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'full relabel plus every event time moved by one 0.1 ms quantum: the shift-invariant gap test refuses it' },
  { name: 'replay-forged-whole-shift-100ms', args: [...BASEARGS, ...C(write('forged-whole-shift-100', whole100)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'same with a 100 ms whole-timeline shift' },
  { name: 'replay-probe-p1-relabel', args: [...BASEARGS, ...C(write('probe-p1-relabel', probeRelabel)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'a full relabel of a committed PROBE receipt is refused because the probes are in PRE' },
  { name: 'replay-gaps-added-r76-escape', args: [...BASEARGS, ...C(write('forged-gaps-added', gapsAdded)), '--expect-nonce', POST], expectExit: 1, expectIds: ['replay-event-timeline'], exact: true,
    why: 'round-76 routed defect 1 (R76Critic A2 class): a relabel that ADDS two own gaps is refused because the gap fraction divides by the prior\'s gaps' },
  { name: 'forge-host-chromium-154', args: [...BASEARGS, ...C(write('forge-host-154', hostOld)), '--expect-nonce', POST], expectExit: 1, expectIds: ['host-chromium'], exact: true,
    why: 'another Chromium build string (shape-valid) is refused by the exact pin' },
  { name: 'forge-host-headful-argv', args: [...BASEARGS, ...C(write('forge-host-headful', hostHeadful)), '--expect-nonce', POST], expectExit: 1, expectIds: ['host-argv'], exact: true,
    why: 'an argv without --headless=new is refused' },
  { name: 'forge-host-headless-product', args: [...BASEARGS, ...C(write('forge-host-product', hostProduct)), '--expect-nonce', POST], expectExit: 1, expectIds: ['host-chromium'], exact: true,
    why: 'the old-headless product string is refused by the exact pin' },
  { name: 'forge-error-code', args: [...BASEARGS, ...C(write('forge-error-code', errCode)), '--expect-nonce', POST], expectExit: 1, expectIds: ['leg-not-file-input-error', 'not-file-input-law'], exact: true,
    why: 'the not-a-file-input refusal with message kept and code -32602 is refused (code checked)' },
  { name: 'forge-belief-directory-multiple', args: [...BASEARGS, ...C(write('forge-dir-multiple', dirMulti)), '--expect-nonce', POST], expectExit: 1, expectIds: ['leg-dir-mode-opened', 'mode-law'], exact: true,
    why: 'the rejected belief "a webkitdirectory input opens a selectMultiple chooser" written into a receipt is refused' },
  // (first pass expected selection-law too, written from belief: pick-empty is owned by empty-list-law, not
  // selection-law; lesson-proof/controls-first-pass-empty-list-expectation.json)
  { name: 'forge-belief-empty-list-clears', args: [...BASEARGS, ...C(write('forge-empty-clears', emptyClears)), '--expect-nonce', POST], expectExit: 1, expectIds: ['leg-pick-empty-state', 'empty-list-law'], exact: true,
    why: 'the rejected belief "setFileInputFiles with an empty list clears the selection" written into a receipt is refused' },
  { name: 'forge-belief-accept-filters', args: [...BASEARGS, ...C(write('forge-accept-filters', acceptFilters)), '--expect-nonce', POST], expectExit: 1,
    expectIds: ['leg-accept-ignored-seq', 'leg-accept-ignored-trusted', 'leg-accept-ignored-act', 'leg-accept-ignored-xy', 'leg-accept-ignored-files', 'leg-accept-ignored-read', 'leg-accept-ignored-state', 'leg-forward-click-state', 'leg-script-click-state', 'leg-not-file-input-state', 'leg-intercept-cancel-state', 'leg-intercept-off-state', 'selection-law', 'read-law'], exact: false,
    why: 'the rejected belief "accept=.png keeps a .txt file out" written into a receipt is refused' },
  { name: 'limit-nonuniform-retime', args: [...BASEARGS, ...C(write('limit-nonuniform', limit)), '--expect-nonce', POST], expectExit: 0, expectIds: [], exact: true,
    why: 'DECLARED LIMIT witness, not a pass: a full relabel whose every event time is moved by a different multiple of 0.3 ms is not refused (the counter is not an execution oracle)' },
  { name: 'positive-smoke1-own-nonce-without-itself', args: ['--lane', LANE, '--prior-set', (() => { const f = path.join(work, 'ps-no-smoke1.txt'); fs.writeFileSync(f, fs.readFileSync(PS, 'utf8').split('\n').filter((l) => !l.endsWith('/smoke1.receipt.json')).join('\n')); return f; })(), ...C(smoke1Path), '--expect-nonce', smoke1.nonce], expectExit: 0, expectIds: [], exact: true,
    why: 'POSITIVE control (blanket refusal is not a gain): an honest pre-freeze receipt with every other committed receipt as prior is clean' },
];
const results = controls.map((c) => {
  const p = spawnSync(process.execPath, [CTR, ...c.args, '--json'], { encoding: 'utf8', timeout: 60000, maxBuffer: 1 << 26 });
  const rc = p.status;
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const ids = j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null;
  const ok = rc === c.expectExit && Array.isArray(ids) && c.expectIds.every((i) => ids.includes(i)) && (!c.exact || ids.length === c.expectIds.length);
  return { name: c.name, why: c.why, expectExit: c.expectExit, expectIds: c.expectIds, exact: c.exact, exit: rc, ids, ok, limit: c.name.startsWith('limit') || c.name.startsWith('replay-gaps') ? (j ? j.limit.reduce((a, s) => (s.gapMatched / Math.max(1, s.gapNeed) > a.gapMatched / Math.max(1, a.gapNeed) ? s : a), j.limit[0]) : null) : undefined };
});
const degenerates = ['page-stub', 'eval-trigger', 'swap-files'].map((k) => {
  const read = (f) => { try { return fs.readFileSync(path.join(HERE, f), 'utf8').trim(); } catch { return null; } };
  let r = null; try { r = JSON.parse(read(`degenerate-${k}.receipt.json`)); } catch {}
  const ok = read(`degenerate-${k}.driver.exit`) === '1' && r !== null && r.degenerate === k && r.chooserHypothesis === 'REFUTED' && r.predicate === false;
  return { name: 'degenerate-' + k, expect: 'driver exit 1, receipt.degenerate === name (QUALITY 133), hypothesis REFUTED', driverExit: read(`degenerate-${k}.driver.exit`), label: r ? r.degenerate : null, hypothesis: r ? r.chooserHypothesis : null, ok };
});
// before-state at the round's base commit (committed bytes, not the working tree)
const BASE = '1320d428f0c0957b46d6969b59c122fd69199331';
const baseScorecard = spawnSync('git', ['-C', LANE, 'show', BASE + ':SCORECARD.md'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout;
const rows = baseScorecard.split('\n').filter((l) => l.startsWith('| `chromium-file-chooser-linux` |')).length;
const notes = spawnSync('git', ['-C', LANE, 'grep', '-liE', 'file ?chooser|setFileInputFiles|fileChooserOpened|setInterceptFileChooserDialog|webkitdirectory|showPicker', BASE, '--', 'corpus/knowledge'], { encoding: 'utf8' });
const summary = { schema: 'tabi-r77-c1-controls', counterSha256: sha(fs.readFileSync(CTR)), driverSha256: PIN, priorSetSha256: sha(fs.readFileSync(PS)), priors: PRE.map((p) => path.relative(LANE, p)),
  capabilityRowCount: rows, notesCitingChooserSurface: notes.stdout.split('\n').filter(Boolean).length,
  allOk: results.every((r) => r.ok) && degenerates.every((d) => d.ok) && rows === 0, results, degenerates };
fs.writeFileSync(path.join(HERE, 'controls-summary.json'), JSON.stringify(summary, null, 1) + '\n');
console.log([...results, ...degenerates].map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.name} exit=${r.exit ?? r.driverExit} ids=${JSON.stringify(r.ids ?? r.label)}`).join('\n') + `\ncapabilityRowCount=${summary.capabilityRowCount} notes=${summary.notesCitingChooserSurface} allOk=${summary.allOk}`);
process.exit(summary.allOk ? 0 : 1);
