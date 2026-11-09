#!/usr/bin/env node
// Negative battery: tabi round 96, C1 (`C1-CLIENT-OOPIF-CHOOSER-R96`). Each case mutates a real receipt
// of scripts/client-oopif-chooser-round96.mjs (or substitutes the r95 receipt, the do-nothing control) and
// runs the frozen counter in --receipt mode; a case is killed when the counter exits 1 AND reports the
// expected finding id. The `positive` case (unmodified receipt) must exit 0 with zero findings.
// Classes: the Puppeteer cross-site law (chooser claimed seen, a different error, child filled), the
// witness law (no chooser opened, two choosers, wrong frame, wrong mode, B absent), the resolve law
// (Playwright/same-site timeout, child empty or wrong file, multiple, wrong element), the isolation law
// (iframe target present on a same-site leg / absent on a cross-site leg), the parent-misdelivery law,
// identity (library version, integrity, chooser-file sha, browser), contradictory duplicate and
// fabricated leg labels, ports, and the producer polarity (failures without leg errors, leg errors
// without failures, an ignored producer verdict).
// Usage: node negatives-client-oopif-chooser-round96.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
//          --expect-driver-sha256 <hex> --scratch <ABS dir> [--json]
// Exit 0: positive clean and every negative killed; 1: otherwise; 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane'); const rcpt = opt('receipt'); const nonce = opt('expect-nonce'); const pin = opt('expect-driver-sha256'); const scratch = opt('scratch');
if (![lane, scratch].every((p) => p && path.isAbsolute(p)) || !rcpt || !nonce || !pin) { console.error('usage'); process.exit(2); }
const base = JSON.parse(fs.readFileSync(path.resolve(lane, rcpt), 'utf8'));
const r95 = path.join(lane, 'corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json');
const counter = path.join(lane, 'scripts/check-client-oopif-chooser-round96.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const ANS = () => [[base.answer.name, base.answer.size]];
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r95-receipt', 'schema', null],
  // Puppeteer cross-site law
  ['ppx-chooser-claimed', 'pp-timeout', (r) => { const l = leg(r, 'PPX-1'); Object.assign(l, { outcome: 'chooser', errName: null, errMessage: null, chooserMultiple: false }); return r; }],
  ['ppx-chooser-and-filled', 'pp-timeout', (r) => { const l = leg(r, 'PPX-2'); Object.assign(l, { outcome: 'chooser', errName: null, errMessage: null, chooserMultiple: false, childFiles: ANS() }); return r; }],
  ['ppx-other-error', 'pp-timeout', (r) => { const l = leg(r, 'PPX-1'); Object.assign(l, { outcome: 'error', errName: 'Error', errMessage: 'Protocol error (Page.setInterceptFileChooserDialog): Target closed' }); return r; }],
  ['ppx-timeout-other-ms', 'pp-timeout', (r) => { leg(r, 'PPX-3').errMessage = 'Waiting for `FileChooser` failed: 30000ms exceeded'; return r; }],
  ['ppx-child-filled', 'child-files', (r) => { leg(r, 'PPX-1').childFiles = ANS(); return r; }],
  ['ppw-chooser-claimed', 'pp-timeout', (r) => { const l = leg(r, 'PPW-2'); Object.assign(l, { outcome: 'chooser', errName: null, errMessage: null, chooserMultiple: false }); return r; }],
  // witness law
  ['ppw-no-chooser-opened', 'witness', (r) => { leg(r, 'PPW-1').witnessEvents = []; return r; }],
  ['ppw-two-choosers', 'witness', (r) => { const l = leg(r, 'PPW-1'); l.witnessEvents = [l.witnessEvents[0], { ...l.witnessEvents[0] }]; return r; }],
  ['ppw-wrong-frame', 'witness', (r) => { leg(r, 'PPW-2').witnessEvents[0].frameId = 'F'.repeat(32); return r; }],
  ['ppw-mode-multiple', 'witness', (r) => { leg(r, 'PPW-2').witnessEvents[0].mode = 'selectMultiple'; return r; }],
  ['ppw-backend-absent', 'witness', (r) => { leg(r, 'PPW-3').witnessEvents[0].backendNodeId = 0; return r; }],
  ['ppw-intercept-other-target', 'witness', (r) => { leg(r, 'PPW-3').witnessIntercept.targetId = 'E'.repeat(32); return r; }],
  ['ppw-witness-dropped', 'witness', (r) => { const l = leg(r, 'PPW-1'); l.witnessIntercept = null; l.witnessEvents = null; return r; }],
  ['ppx-witness-added', 'no-witness', (r) => { const l = leg(r, 'PPX-2'); l.witnessIntercept = { targetId: l.iframeTargets[0].targetId }; l.witnessEvents = []; return r; }],
  // resolve law
  ['pwx-timeout', 'chooser', (r) => { const l = leg(r, 'PWX-1'); Object.assign(l, { outcome: 'timeout', errName: 'TimeoutError', errMessage: 'Timeout 3000ms exceeded while waiting for event "filechooser"', chooserMultiple: null, chooserElementId: null }); return r; }],
  ['pwx-child-empty', 'child-files', (r) => { leg(r, 'PWX-2').childFiles = []; return r; }],
  ['pwx-child-wrong-file', 'child-files', (r) => { leg(r, 'PWX-3').childFiles = [['other.txt', 22]]; return r; }],
  ['pwx-multiple', 'chooser', (r) => { leg(r, 'PWX-1').chooserMultiple = true; return r; }],
  ['pwx-element-other', 'chooser', (r) => { leg(r, 'PWX-1').chooserElementId = 'pp'; return r; }],
  ['pws-timeout', 'chooser', (r) => { const l = leg(r, 'PWS-2'); Object.assign(l, { outcome: 'timeout', errName: 'TimeoutError', errMessage: 'x', chooserMultiple: null, chooserElementId: null }); return r; }],
  ['pps-timeout', 'chooser', (r) => { const l = leg(r, 'PPS-1'); Object.assign(l, { outcome: 'timeout', errName: 'TimeoutError', errMessage: 'Waiting for `FileChooser` failed: 3000ms exceeded', chooserMultiple: null }); return r; }],
  ['pps-child-empty', 'child-files', (r) => { leg(r, 'PPS-3').childFiles = []; return r; }],
  ['pps-element-claimed', 'chooser', (r) => { leg(r, 'PPS-2').chooserElementId = 's'; return r; }],
  // isolation law
  ['pps-iframe-target', 'iframe-targets', (r) => { const l = leg(r, 'PPS-1'); l.iframeTargets = [{ targetId: 'A'.repeat(32), url: l.childUrl }]; return r; }],
  ['ppx-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'PPX-3').iframeTargets = []; return r; }],
  ['pwx-iframe-target-other-url', 'iframe-targets', (r) => { const l = leg(r, 'PWX-2'); l.iframeTargets[0].url = l.childUrl.replace('leg=PWX-2', 'leg=PWX-1'); return r; }],
  ['pwx-two-iframe-targets', 'iframe-targets', (r) => { const l = leg(r, 'PWX-3'); l.iframeTargets.push({ ...l.iframeTargets[0], targetId: 'B'.repeat(32) }); return r; }],
  // parent misdelivery and click
  ['ppx-parent-filled', 'parent-files', (r) => { leg(r, 'PPX-2').parentFiles = ANS(); return r; }],
  ['pwx-parent-filled', 'parent-files', (r) => { leg(r, 'PWX-1').parentFiles = ANS(); return r; }],
  ['click-untrusted', 'click', (r) => { leg(r, 'PPX-1').childClicks = [['s', false]]; return r; }],
  ['click-double', 'click', (r) => { leg(r, 'PWX-1').childClicks = [['s', true], ['s', true]]; return r; }],
  ['click-none', 'click', (r) => { leg(r, 'PPW-1').childClicks = []; return r; }],
  ['frames-extra', 'frames', (r) => { const l = leg(r, 'PWS-1'); l.frames = [...l.frames, 'about:blank']; return r; }],
  ['frames-child-swapped', 'frames', (r) => { const l = leg(r, 'PPX-1'); l.frames = [l.frames[0], leg(r, 'PPS-1').childUrl]; return r; }],
  // identity
  ['lib-pp-version', 'libs', (r) => { r.libs['puppeteer-core'].version = '25.3.0'; return r; }],
  ['lib-pw-integrity', 'libs', (r) => { r.libs['playwright-core'].integrity = 'sha512-AAAA'; return r; }],
  ['lib-pp-filesha', 'libs', (r) => { r.libs['puppeteer-core'].fileSha256 = '0'.repeat(64); return r; }],
  ['lib-missing', 'libs', (r) => { delete r.libs['playwright-core']; return r; }],
  ['browser-version-leg', 'browser', (r) => { leg(r, 'PWS-2').browserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['client-version-leg', 'browser', (r) => { leg(r, 'PPS-2').clientBrowserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['chromium-string', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['timeout-other', 'timeout', (r) => { r.timeoutMs = 30000; return r; }],
  ['cross-host-same', 'cross-host', (r) => { r.crossHost = '127.0.0.1'; return r; }],
  ['nonce-other', 'nonce', (r) => { r.nonce = 'tabi-r96-other'; return r; }],
  ['driver-pin-other', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['answer-size', 'answer', (r) => { r.answer.size = 23; return r; }],
  ['leg-arm-lib-swapped', 'leg-arm', (r) => { leg(r, 'PWX-1').lib = 'puppeteer'; return r; }],
  ['leg-arm-cross-flag', 'leg-arm', (r) => { leg(r, 'PPS-1').cross = true; return r; }],
  ['leg-arm-child-host', 'leg-arm', (r) => { const l = leg(r, 'PPX-1'); l.childHost = '127.0.0.1'; l.childUrl = l.childUrl.replace('localhost', '127.0.0.1'); return r; }],
  // leg labels: contradictory duplicate, fabricated label, dropped leg
  ['leg-duplicate-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'PPX-1'))); Object.assign(d, { outcome: 'chooser', errName: null, errMessage: null, chooserMultiple: false }); r.legs.splice(1, 0, d); return r; }],
  ['leg-fabricated-label', 'leg-label', (r) => { const l = leg(r, 'PWS-3'); l.leg = 'PWZ-3'; l.arm = 'PWZ'; return r; }],
  ['leg-dropped', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'PPW-2'); return r; }],
  ['leg-reordered', 'leg-set', (r) => { const [a, b] = [r.legs[0], r.legs[1]]; r.legs[0] = b; r.legs[1] = a; return r; }],
  ['leg-rep-mismatch', 'leg-label', (r) => { leg(r, 'PPS-2').rep = 1; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'PWX-2').browserId = leg(r, 'PWX-1').browserId; return r; }],
  ['browser-id-not-uuid', 'fresh-browser', (r) => { leg(r, 'PWX-2').browserId = '-'.repeat(36); return r; }],
  ['port-below-1024', 'ports', (r) => { r.ports.http = 80; return r; }],
  ['port-duplicate', 'ports', (r) => { r.ports.child = r.ports.http; return r; }],
  // producer polarity and an ignored producer verdict
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'PWS-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'PWS-2').error = 'devtools endpoint never answered'; return r; }],
  ['producer-pass-ignored', 'pp-timeout', (r) => { r.verdict = 'clean'; r.ok = true; const l = leg(r, 'PPX-1'); Object.assign(l, { outcome: 'chooser', errName: null, errMessage: null, chooserMultiple: false }); return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r95;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r96-client-oopif-chooser-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
