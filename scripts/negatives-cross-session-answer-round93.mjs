#!/usr/bin/env node
// Negative battery: tabi round 93, C1 (`C1-CROSS-SESSION-ANSWER-R93`). Each case mutates a real
// receipt of scripts/chrome-cdp-cross-session-answer-round93.mjs (or substitutes the r92 receipt,
// the do-nothing control) and runs the frozen counter in --receipt mode; a case is killed when the
// counter exits 1 AND reports the expected finding id. The `positive` case (unmodified receipt) must
// exit 0 with zero findings. Classes carried from the r92 routed queue (spot-check §8 item 7):
// two-iframe receipt, reps/answer/parent-url identity, leg order, non-object leg, per-leg
// browserVersion, fresh-browser identity; plus producer-polarity and duplicate/fabricated-label cases.
// Usage: node negatives-cross-session-answer-round93.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r92 = path.join(lane, 'corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json');
const counter = path.join(lane, 'scripts/check-cross-session-answer-round93.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const INPUT = { error: null, nodeName: 'INPUT', attributes: ['type', 'file', 'id', 's'], frameId: null };
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r92-receipt', 'schema', null],
  // the law itself, X arm
  ['x-page-describe-is-input', 'describe-page', (r) => { leg(r, 'X-1').describePage = { session: 'page', ...INPUT }; return r; }],
  ['x-page-describe-error', 'describe-page', (r) => { Object.assign(leg(r, 'X-2').describePage, { error: 'No node found for given backend id', nodeName: null, attributes: null }); return r; }],
  ['x-page-describe-html', 'describe-page', (r) => { leg(r, 'X-3').describePage.nodeName = 'HTML'; return r; }],
  ['x-pierce-sees-input', 'pierce-input', (r) => { leg(r, 'X-1').pagePierceInputS = 1; return r; }],
  ['x-pierce-null', 'pierce-input', (r) => { leg(r, 'X-2').pagePierceInputS = null; return r; }],
  ['x-cross-answer-ok', 'cross-answer', (r) => { leg(r, 'X-1').crossAnswer.error = null; return r; }],
  ['x-cross-answer-other-error', 'cross-answer', (r) => { leg(r, 'X-2').crossAnswer.error = 'No node found for given backend id'; return r; }],
  ['x-cross-answer-delivered', 'cross-answer', (r) => { leg(r, 'X-3').filesAfterCross = [['tabi-r93-answer.txt', 22]]; return r; }],
  ['x-cross-answer-missing', 'cross-answer', (r) => { const l = leg(r, 'X-1'); l.crossAnswer = null; l.filesAfterCross = null; return r; }],
  ['x-cross-answer-on-iframe', 'cross-answer', (r) => { leg(r, 'X-2').crossAnswer.session = 'iframe'; return r; }],
  // the contrast, S arm
  ['s-cross-answer-present', 'cross-answer', (r) => { const l = leg(r, 'S-1'); l.crossAnswer = { session: 'page', error: null }; l.filesAfterCross = []; return r; }],
  ['s-page-describe-document', 'describe-page', (r) => { Object.assign(leg(r, 'S-2').describePage, { nodeName: '#document', attributes: [] }); return r; }],
  ['s-pierce-zero', 'pierce-input', (r) => { leg(r, 'S-3').pagePierceInputS = 0; return r; }],
  ['s-pierce-two', 'pierce-input', (r) => { leg(r, 'S-1').pagePierceInputS = 2; return r; }],
  // chooser-session describe
  ['describe-chooser-div', 'describe-chooser', (r) => { leg(r, 'X-1').describeChooser.nodeName = 'DIV'; return r; }],
  ['describe-chooser-text-input', 'describe-chooser', (r) => { leg(r, 'S-1').describeChooser.attributes = ['type', 'text', 'id', 's']; return r; }],
  ['describe-chooser-other-id', 'describe-chooser', (r) => { leg(r, 'X-2').describeChooser.attributes = ['type', 'file', 'id', 't']; return r; }],
  ['describe-chooser-wrong-session', 'describe-chooser', (r) => { leg(r, 'X-3').describeChooser.session = 'page'; return r; }],
  ['describe-chooser-error', 'describe-chooser', (r) => { leg(r, 'S-2').describeChooser.error = 'x'; return r; }],
  // chooser event
  ['x-chooser-on-page', 'chooser', (r) => { leg(r, 'X-1').choosers[0].session = 'page'; return r; }],
  ['s-chooser-on-iframe', 'chooser', (r) => { leg(r, 'S-2').choosers[0].session = 'iframe'; return r; }],
  ['dup-chooser', 'chooser', (r) => { const l = leg(r, 'X-2'); l.choosers.push({ ...l.choosers[0] }); return r; }],
  ['no-chooser', 'chooser', (r) => { leg(r, 'S-3').choosers = []; return r; }],
  ['chooser-null-backend', 'chooser', (r) => { leg(r, 'X-3').choosers[0].backendNodeId = null; return r; }],
  ['chooser-wrong-frame', 'chooser', (r) => { leg(r, 'S-1').choosers[0].frameId = 'E'.repeat(32); return r; }],
  // target model
  ['s-has-iframe-target', 'iframe-targets', (r) => { const l = leg(r, 'S-1'); l.attached.push({ type: 'iframe', targetId: l.childFrameId }); return r; }],
  ['s-browser-iframe-target', 'iframe-targets', (r) => { const l = leg(r, 'S-2'); l.browserIframeTargets = [{ targetId: l.childFrameId, url: l.childUrl }]; return r; }],
  ['x-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'X-2').attached = []; return r; }],
  ['x-two-iframes', 'iframe-targets', (r) => { const l = leg(r, 'X-1'); l.attached.push({ type: 'iframe', targetId: 'D'.repeat(32) }); l.browserIframeTargets.push({ targetId: 'D'.repeat(32), url: l.childUrl }); return r; }],
  ['x-target-url-wrong', 'iframe-targets', (r) => { leg(r, 'X-3').browserIframeTargets[0].url = 'about:blank'; return r; }],
  ['x-target-not-child-frame', 'iframe-targets', (r) => { const l = leg(r, 'X-1'); l.childFrameId = 'F'.repeat(32); l.choosers[0].frameId = 'F'.repeat(32); return r; }],
  // answer on the chooser session and its effect
  ['answer-error', 'answer', (r) => { leg(r, 'X-2').answer.error = 'Node is not a file input element'; return r; }],
  ['x-answer-on-page', 'answer', (r) => { leg(r, 'X-3').answer.session = 'page'; return r; }],
  ['answer-missing', 'answer', (r) => { leg(r, 'S-2').answer = null; return r; }],
  ['empty-files', 'child-files', (r) => { leg(r, 'X-1').childFiles = []; return r; }],
  ['extra-file', 'child-files', (r) => { leg(r, 'S-2').childFiles.push(['other.txt', 1]); return r; }],
  ['wrong-size', 'child-files', (r) => { leg(r, 'S-3').childFiles[0][1] = 21; return r; }],
  ['click-untrusted', 'child-click', (r) => { leg(r, 'X-2').childClicks[0].isTrusted = false; return r; }],
  ['click-missed-child', 'child-click', (r) => { leg(r, 'S-1').childClicks = []; return r; }],
  // leg set, labels, order, shape
  ['drop-leg', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'S-3'); return r; }],
  ['dup-leg-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'X-1'))); d.crossAnswer.error = null; r.legs.push(d); return r; }],
  ['leg-order-swapped', 'leg-set', (r) => { const a = r.legs[0]; r.legs[0] = r.legs[1]; r.legs[1] = a; return r; }],
  ['fabricated-leg-label', 'leg-set', (r) => { leg(r, 'S-3').leg = 'S-4'; return r; }],
  ['non-object-leg', 'leg-shape', (r) => { r.legs[5] = 'S-3'; return r; }],
  ['arm-relabel', 'leg-arm', (r) => { leg(r, 'S-1').arm = 'X'; return r; }],
  ['rep-relabel', 'leg-arm', (r) => { leg(r, 'X-2').rep = 1; return r; }],
  // receipt identity
  ['wrong-nonce', 'nonce', (r) => { r.nonce = 'tabi-r93-forged'; return r; }],
  ['driver-sha-forged', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['chromium-other', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['cross-host-same-site', 'cross-host', (r) => { r.crossHost = '127.0.0.1'; return r; }],
  ['reps-identity', 'reps', (r) => { r.reps = 2; return r; }],
  ['answer-identity', 'answer', (r) => { r.answer = { name: 'other.txt', size: 22 }; return r; }],
  ['ports-collide', 'ports', (r) => { r.ports.child = r.ports.http; return r; }],
  ['parent-url-other-leg', 'parent-url', (r) => { const l = leg(r, 'X-1'); l.parentUrl = l.parentUrl.replace('leg=X-1', 'leg=X-2'); return r; }],
  ['child-url-userinfo', 'child-url', (r) => { const l = leg(r, 'X-2'); l.childUrl = l.childUrl.replace('http://', 'http://u:p@'); l.browserIframeTargets[0].url = l.childUrl; return r; }],
  ['child-url-https', 'child-url', (r) => { const l = leg(r, 'S-1'); l.childUrl = l.childUrl.replace('http://', 'https://'); return r; }],
  ['x-child-host-same-site', 'child-host', (r) => { leg(r, 'X-3').childHost = '127.0.0.1'; return r; }],
  ['browser-version-leg', 'browser-version', (r) => { leg(r, 'S-2').browserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'S-1').browserId = leg(r, 'X-1').browserId; return r; }],
  // producer polarity (failures list vs per-leg errors) and an ignored producer verdict
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'S-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'S-2').error = 'devtools endpoint never answered'; return r; }],
  ['leg-error', 'leg-error', (r) => { const l = leg(r, 'X-3'); l.error = 'x'; r.failures = [{ leg: 'X-3', error: 'x' }]; return r; }],
  ['producer-pass-ignored', 'cross-answer', (r) => { r.verdict = 'pass'; r.ok = true; leg(r, 'X-1').crossAnswer.error = null; return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r92;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r93-cross-session-answer-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
