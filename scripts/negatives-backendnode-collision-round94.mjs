#!/usr/bin/env node
// Negative battery: tabi round 94, C1 (`C1-BACKENDNODE-COLLISION-R94`). Each case mutates a real
// receipt of scripts/chrome-cdp-backendnode-collision-round94.mjs (or substitutes the r93 receipt, the
// do-nothing control) and runs the frozen counter in --receipt mode; a case is killed when the counter
// exits 1 AND reports the expected finding id. The `positive` case (unmodified receipt) must exit 0
// with zero findings. Classes: the collision/miss law per arm (C/M swapped readings, B binding on
// describe/cross/answer, the parent root identity and documentURL, the minted-range relation), the
// S same-site contrast, the r93 routed R93Mut survivors (out-of-range port, S-arm filesAfterCross
// non-null, an ignored producer `verdict`), leg set/labels/order/shape and the producer polarity.
// Usage: node negatives-backendnode-collision-round94.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r93 = path.join(lane, 'corpus/evidence/round93/chromium-oopif-backendnode-scope/receipt.json');
const counter = path.join(lane, 'scripts/check-backendnode-collision-round94.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const NOT_FILE_INPUT = 'Node is not a file input element';
const NO_NODE = 'No node found for given backend id';
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r93-receipt', 'schema', null],
  // C arm: the collision reading
  ['c-page-describe-miss', 'describe-page', (r) => { Object.assign(leg(r, 'C-1').describePage, { error: NO_NODE, nodeName: null, attributes: null, backendNodeId: null, documentURL: null }); return r; }],
  ['c-page-describe-child-url', 'describe-page', (r) => { const l = leg(r, 'C-2'); l.describePage.documentURL = l.childUrl; return r; }],
  ['c-page-describe-other-id', 'describe-page', (r) => { leg(r, 'C-3').describePage.backendNodeId += 1; return r; }],
  ['c-page-describe-input', 'describe-page', (r) => { Object.assign(leg(r, 'C-1').describePage, { nodeName: 'INPUT', attributes: ['type', 'file', 'id', 's'], documentURL: null }); return r; }],
  ['c-page-describe-B-unbound', 'describe-page', (r) => { leg(r, 'C-2').describePage.B += 7; return r; }],
  ['c-root-not-B', 'page-root', (r) => { leg(r, 'C-1').pageRoot.backendNodeId += 1; return r; }],
  ['c-root-child-url', 'page-root', (r) => { const l = leg(r, 'C-2'); l.pageRoot.documentURL = l.childUrl; return r; }],
  ['c-root-error', 'page-root', (r) => { leg(r, 'C-3').pageRoot = { error: 'x' }; return r; }],
  ['c-pierce-below-B', 'page-pierce', (r) => { const l = leg(r, 'C-1'); l.pagePierce.maxBackendNodeId = l.choosers[0].backendNodeId - 1; return r; }],
  ['c-pierce-sees-input', 'page-pierce', (r) => { leg(r, 'C-2').pagePierce.inputS = 1; return r; }],
  ['c-cross-no-node', 'cross-answer', (r) => { leg(r, 'C-3').crossAnswer.error = NO_NODE; return r; }],
  ['c-cross-ok', 'cross-answer', (r) => { leg(r, 'C-1').crossAnswer.error = null; return r; }],
  ['c-cross-delivered', 'cross-answer', (r) => { leg(r, 'C-2').filesAfterCross = [['tabi-r94-answer.txt', 22]]; return r; }],
  ['c-cross-B-unbound', 'cross-answer', (r) => { leg(r, 'C-3').crossAnswer.B = 999; return r; }],
  // M arm: the miss reading
  ['m-page-describe-collides', 'describe-page', (r) => { const l = leg(r, 'M-1'); Object.assign(l.describePage, { error: null, nodeName: '#document', attributes: [], backendNodeId: l.describePage.B, documentURL: l.parentUrl }); return r; }],
  ['m-page-describe-other-error', 'describe-page', (r) => { leg(r, 'M-2').describePage.error = 'Could not find node with given id'; return r; }],
  ['m-page-describe-B-unbound', 'describe-page', (r) => { leg(r, 'M-3').describePage.B = 2; return r; }],
  ['m-root-is-B', 'page-root', (r) => { const l = leg(r, 'M-1'); l.pageRoot.backendNodeId = l.choosers[0].backendNodeId; return r; }],
  ['m-root-not-document', 'page-root', (r) => { leg(r, 'M-2').pageRoot.nodeName = 'HTML'; return r; }],
  ['m-pierce-reaches-B', 'page-pierce', (r) => { const l = leg(r, 'M-1'); l.pagePierce.maxBackendNodeId = l.choosers[0].backendNodeId; return r; }],
  ['m-pierce-error', 'page-pierce', (r) => { leg(r, 'M-2').pagePierce = { error: 'x' }; return r; }],
  ['m-pierce-sees-input', 'page-pierce', (r) => { leg(r, 'M-3').pagePierce.inputS = 1; return r; }],
  ['m-cross-not-file-input', 'cross-answer', (r) => { leg(r, 'M-1').crossAnswer.error = NOT_FILE_INPUT; return r; }],
  ['m-cross-delivered', 'cross-answer', (r) => { leg(r, 'M-2').filesAfterCross = [['tabi-r94-answer.txt', 22]]; return r; }],
  ['m-cross-missing', 'cross-answer', (r) => { const l = leg(r, 'M-3'); l.crossAnswer = null; l.filesAfterCross = null; return r; }],
  ['m-pad-zero', 'leg-pad', (r) => { leg(r, 'M-1').pad = 0; return r; }],
  ['m-child-url-pad0', 'child-url', (r) => { const l = leg(r, 'M-2'); l.childUrl = l.childUrl.replace('pad=300', 'pad=0'); l.browserIframeTargets[0].url = l.childUrl; return r; }],
  // S arm: the same-site contrast
  ['s-page-describe-document', 'describe-page', (r) => { Object.assign(leg(r, 'S-1').describePage, { nodeName: '#document', attributes: [] }); return r; }],
  ['s-page-describe-other-id', 'describe-page', (r) => { leg(r, 'S-2').describePage.backendNodeId += 1; return r; }],
  ['s-pierce-zero', 'page-pierce', (r) => { leg(r, 'S-3').pagePierce.inputS = 0; return r; }],
  ['s-pierce-below-B', 'page-pierce', (r) => { const l = leg(r, 'S-1'); l.pagePierce.maxBackendNodeId = 1; return r; }],
  ['s-cross-present', 'cross-answer', (r) => { const l = leg(r, 'S-2'); l.crossAnswer = { session: 'page', B: l.choosers[0].backendNodeId, error: null }; return r; }],
  ['s-files-after-cross-nonnull', 'cross-answer', (r) => { leg(r, 'S-3').filesAfterCross = []; return r; }],
  ['s-root-parent-url-wrong', 'page-root', (r) => { leg(r, 'S-1').pageRoot.documentURL = 'about:blank'; return r; }],
  // chooser-session describe and the chooser event
  ['describe-chooser-div', 'describe-chooser', (r) => { leg(r, 'C-1').describeChooser.nodeName = 'DIV'; return r; }],
  ['describe-chooser-other-id', 'describe-chooser', (r) => { leg(r, 'M-1').describeChooser.backendNodeId += 1; return r; }],
  ['describe-chooser-B-unbound', 'describe-chooser', (r) => { leg(r, 'S-1').describeChooser.B = 1; return r; }],
  ['describe-chooser-wrong-session', 'describe-chooser', (r) => { leg(r, 'M-2').describeChooser.session = 'page'; return r; }],
  ['c-chooser-on-page', 'chooser', (r) => { leg(r, 'C-1').choosers[0].session = 'page'; return r; }],
  ['s-chooser-on-iframe', 'chooser', (r) => { leg(r, 'S-2').choosers[0].session = 'iframe'; return r; }],
  ['dup-chooser', 'chooser', (r) => { const l = leg(r, 'M-3'); l.choosers.push({ ...l.choosers[0] }); return r; }],
  ['chooser-zero-backend', 'chooser', (r) => { leg(r, 'C-2').choosers[0].backendNodeId = 0; return r; }],
  ['chooser-wrong-frame', 'chooser', (r) => { leg(r, 'S-3').choosers[0].frameId = 'E'.repeat(32); return r; }],
  // target model
  ['s-has-iframe-target', 'iframe-targets', (r) => { const l = leg(r, 'S-1'); l.attached.push({ type: 'iframe', targetId: l.childFrameId }); return r; }],
  ['m-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'M-2').attached = []; return r; }],
  ['c-two-iframes', 'iframe-targets', (r) => { const l = leg(r, 'C-3'); l.attached.push({ type: 'iframe', targetId: 'D'.repeat(32) }); l.browserIframeTargets.push({ targetId: 'D'.repeat(32), url: l.childUrl }); return r; }],
  // answer on the chooser session and its effect
  ['answer-error', 'answer', (r) => { leg(r, 'M-1').answer.error = NO_NODE; return r; }],
  ['answer-B-unbound', 'answer', (r) => { leg(r, 'C-2').answer.B = 3; return r; }],
  ['m-answer-on-page', 'answer', (r) => { leg(r, 'M-3').answer.session = 'page'; return r; }],
  ['empty-files', 'child-files', (r) => { leg(r, 'M-2').childFiles = []; return r; }],
  ['click-untrusted', 'child-click', (r) => { leg(r, 'C-3').childClicks[0].isTrusted = false; return r; }],
  // leg set, labels, order, shape
  ['drop-leg', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'M-3'); return r; }],
  ['dup-leg-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'M-1'))); d.describePage.error = null; r.legs.push(d); return r; }],
  ['leg-order-swapped', 'leg-set', (r) => { const a = r.legs[0]; r.legs[0] = r.legs[1]; r.legs[1] = a; return r; }],
  ['fabricated-leg-label', 'leg-set', (r) => { leg(r, 'S-3').leg = 'S-4'; return r; }],
  ['arm-relabel-m-as-c', 'leg-set', (r) => { const l = leg(r, 'M-1'); l.leg = 'C-1'; l.arm = 'C'; return r; }],
  ['non-object-leg', 'leg-shape', (r) => { r.legs[4] = 'M-2'; return r; }],
  ['arm-field-relabel', 'leg-arm', (r) => { leg(r, 'S-1').arm = 'M'; return r; }],
  // receipt identity
  ['wrong-nonce', 'nonce', (r) => { r.nonce = 'tabi-r94-forged'; return r; }],
  ['driver-sha-forged', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['chromium-other', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['cross-host-same-site', 'cross-host', (r) => { r.crossHost = '127.0.0.1'; return r; }],
  ['reps-identity', 'reps', (r) => { r.reps = 2; return r; }],
  ['pad-identity', 'pad', (r) => { r.pad = 0; return r; }],
  ['answer-identity', 'answer', (r) => { r.answer = { name: 'other.txt', size: 22 }; return r; }],
  ['port-out-of-range', 'ports', (r) => { r.ports.cdp = 70000; return r; }],
  ['parent-url-other-leg', 'parent-url', (r) => { const l = leg(r, 'C-1'); l.parentUrl = l.parentUrl.replace('leg=C-1', 'leg=M-1'); return r; }],
  ['browser-version-leg', 'browser-version', (r) => { leg(r, 'S-2').browserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'M-1').browserId = leg(r, 'C-1').browserId; return r; }],
  // producer polarity and an ignored producer verdict
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'S-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'S-2').error = 'devtools endpoint never answered'; return r; }],
  ['producer-pass-ignored', 'describe-page', (r) => { r.verdict = 'clean'; r.ok = true; const l = leg(r, 'M-1'); l.describePage.error = null; return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r93;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r94-backendnode-collision-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
