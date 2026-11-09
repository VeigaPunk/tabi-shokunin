#!/usr/bin/env node
// Negative battery: tabi round 95, C1 (`C1-BACKENDNODE-MISDELIVERY-R95`). Each case mutates a real
// receipt of scripts/chrome-cdp-backendnode-misdelivery-round95.mjs (or substitutes the r94 receipt, the
// do-nothing control) and runs the frozen counter in --receipt mode; a case is killed when the counter
// exits 1 AND reports the expected finding id. The `positive` case (unmodified receipt) must exit 0 with
// zero findings. Legs are chosen by what the receipt shows (the first P leg whose snapshot node at B is
// a parent file input = misdelivery leg; the first P leg whose node at B is another parent node =
// collision leg), so the battery binds the law, not a leg label. Classes: the misdelivery law (wrong
// input filled, two inputs filled, error on a misdelivery, child filled by the cross answer), the
// identity law (describe vs snapshot node per field, a node absent from the snapshot), the miss law
// (Z legs), branch coverage, the S contrast, contradictory duplicate / fabricated leg labels, the
// r94 R94Mut gaps (ports < 1024, duplicate ports, non-UUID browser ids) and the producer polarity
// (failures without leg errors, leg errors without failures, an ignored producer verdict).
// Usage: node negatives-backendnode-misdelivery-round95.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r94 = path.join(lane, 'corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json');
const counter = path.join(lane, 'scripts/check-backendnode-misdelivery-round95.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const NOT_FILE_INPUT = 'Node is not a file input element';
const NO_NODE = 'No node found for given backend id';
const attr = (n, k) => { const a = n.attributes || []; for (let i = 0; i + 1 < a.length; i += 2) if (a[i] === k) return a[i + 1]; return undefined; };
const isPFile = (n) => n && n.nodeName === 'INPUT' && attr(n, 'type') === 'file' && /^p[0-9]+$/.test(attr(n, 'id') || '');
const pLegs = base.legs.filter((l) => l && String(l.leg).startsWith('P') && l.snapshot && Array.isArray(l.snapshot.atB));
const MIS = (pLegs.find((l) => isPFile(l.snapshot.atB[0])) || {}).leg;
const COL = (pLegs.find((l) => l.snapshot.atB.length === 1 && !isPFile(l.snapshot.atB[0])) || {}).leg;
if (!MIS || !COL) { console.error(JSON.stringify({ error: 'receipt lacks a misdelivery or a collision P leg', MIS, COL })); process.exit(2); }
const target = (l) => attr(l.snapshot.atB[0], 'id');
const other = (t) => (t === 'p0' ? 'p1' : 'p0');
const setFiles = (l, id, files) => { l.parentFilesAfterCross.find((x) => x[0] === id)[1] = files; };
const ANS = () => [[base.answer.name, base.answer.size]];
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r94-receipt', 'schema', null],
  // misdelivery law
  ['mis-wrong-input-filled', 'parent-files', (r) => { const l = leg(r, MIS); const t = target(l); setFiles(l, t, []); setFiles(l, other(t), ANS()); return r; }],
  ['mis-two-inputs-filled', 'parent-files', (r) => { const l = leg(r, MIS); setFiles(l, other(target(l)), ANS()); return r; }],
  ['mis-target-empty', 'parent-files', (r) => { const l = leg(r, MIS); setFiles(l, target(l), []); return r; }],
  ['mis-target-other-file', 'parent-files', (r) => { const l = leg(r, MIS); setFiles(l, target(l), [['other.txt', 22]]); return r; }],
  ['mis-cross-error', 'cross-answer', (r) => { leg(r, MIS).crossAnswer.error = NOT_FILE_INPUT; return r; }],
  ['mis-cross-B-unbound', 'cross-answer', (r) => { leg(r, MIS).crossAnswer.B += 4; return r; }],
  ['mis-child-filled-by-cross', 'child-files-after-cross', (r) => { leg(r, MIS).filesAfterCross = ANS(); return r; }],
  ['mis-parent-files-missing-input', 'parent-files', (r) => { const l = leg(r, MIS); l.parentFilesAfterCross = l.parentFilesAfterCross.slice(1); return r; }],
  ['mis-parent-files-reordered', 'parent-files', (r) => { const l = leg(r, MIS); l.parentFilesAfterCross.reverse(); return r; }],
  // collision law
  ['col-cross-no-error', 'cross-answer', (r) => { leg(r, COL).crossAnswer.error = null; return r; }],
  ['col-cross-no-node', 'cross-answer', (r) => { leg(r, COL).crossAnswer.error = NO_NODE; return r; }],
  ['col-parent-filled', 'parent-files', (r) => { setFiles(leg(r, COL), 'p2', ANS()); return r; }],
  ['col-relabel-as-file-input', 'parent-files', (r) => { const l = leg(r, COL); const n = { nodeName: 'INPUT', nodeType: 1, attributes: ['type', 'file', 'id', 'p4'], backendNodeId: l.snapshot.B, documentURL: null }; l.snapshot.atB = [n]; Object.assign(l.describePage, n); return r; }],
  // identity law: describe vs snapshot node
  ['id-describe-nodename', 'describe-page', (r) => { leg(r, COL).describePage.nodeName = '#comment'; return r; }],
  ['id-describe-nodetype', 'describe-page', (r) => { leg(r, COL).describePage.nodeType = 8; return r; }],
  ['id-describe-attributes', 'describe-page', (r) => { leg(r, MIS).describePage.attributes = ['type', 'file', 'id', 'p5']; return r; }],
  ['id-describe-other-id', 'describe-page', (r) => { leg(r, MIS).describePage.backendNodeId += 1; return r; }],
  ['id-describe-B-unbound', 'describe-page', (r) => { leg(r, COL).describePage.B += 1; return r; }],
  ['id-describe-miss-while-present', 'describe-page', (r) => { Object.assign(leg(r, COL).describePage, { error: NO_NODE, nodeName: null, nodeType: null, attributes: null, backendNodeId: null }); return r; }],
  ['id-snapshot-node-dropped', 'describe-page', (r) => { leg(r, COL).snapshot.atB = []; return r; }],
  ['id-snapshot-duplicate-node', 'snapshot', (r) => { const l = leg(r, MIS); l.snapshot.atB.push({ ...l.snapshot.atB[0] }); return r; }],
  ['id-snapshot-node-other-id', 'snapshot', (r) => { leg(r, COL).snapshot.atB[0].backendNodeId += 1; return r; }],
  ['id-snapshot-B-unbound', 'snapshot', (r) => { leg(r, MIS).snapshot.B += 1; return r; }],
  ['id-snapshot-root-child-url', 'snapshot', (r) => { const l = leg(r, MIS); l.snapshot.rootDocumentURL = l.childUrl; return r; }],
  ['id-snapshot-error', 'snapshot', (r) => { leg(r, COL).snapshot = { error: 'x' }; return r; }],
  ['id-snapshot-sees-input-s', 'snapshot', (r) => { leg(r, MIS).snapshot.inputS = 1; return r; }],
  ['id-parent-inputs-short', 'parent-inputs', (r) => { leg(r, MIS).snapshot.parentInputs.pop(); return r; }],
  ['id-parent-inputs-dup-id', 'parent-inputs', (r) => { const p = leg(r, MIS).snapshot.parentInputs; p[1][1] = p[0][1]; return r; }],
  // miss law (Z)
  ['z-node-present', 'z-miss', (r) => { const l = leg(r, 'Z-1'); const n = { nodeName: 'DIV', nodeType: 1, attributes: [], backendNodeId: l.snapshot.B, documentURL: null }; l.snapshot.atB = [n]; Object.assign(l.describePage, { error: null, ...n }); l.crossAnswer.error = NOT_FILE_INPUT; return r; }],
  ['z-max-reaches-B', 'z-miss', (r) => { const l = leg(r, 'Z-2'); l.snapshot.maxBackendNodeId = l.snapshot.B; return r; }],
  ['z-cross-not-file-input', 'cross-answer', (r) => { leg(r, 'Z-3').crossAnswer.error = NOT_FILE_INPUT; return r; }],
  ['z-describe-found', 'describe-page', (r) => { Object.assign(leg(r, 'Z-1').describePage, { error: null, nodeName: 'DIV', nodeType: 1, attributes: [], backendNodeId: leg(r, 'Z-1').snapshot.B }); return r; }],
  // branch coverage
  ['branch-no-misdelivery', 'branch-misdelivery', (r) => { for (const l of r.legs) if (String(l.leg).startsWith('P') && isPFile(l.snapshot.atB[0])) { const n = { nodeName: '#text', nodeType: 3, attributes: [], backendNodeId: l.snapshot.B, documentURL: null }; l.snapshot.atB = [n]; Object.assign(l.describePage, n); l.crossAnswer.error = NOT_FILE_INPUT; for (const x of l.parentFilesAfterCross) x[1] = []; } return r; }],
  ['branch-no-collision', 'branch-collision', (r) => { for (const l of r.legs) if (String(l.leg).startsWith('P') && !isPFile(l.snapshot.atB[0])) { l.snapshot.atB = []; Object.assign(l.describePage, { error: NO_NODE, nodeName: null, nodeType: null, attributes: null, backendNodeId: null, documentURL: null }); l.crossAnswer.error = NO_NODE; } return r; }],
  // S contrast
  ['s-cross-sent', 'same-site', (r) => { const l = leg(r, 'S-1'); l.crossAnswer = { session: 'page', B: l.choosers[0].backendNodeId, error: null }; return r; }],
  ['s-parent-files-present', 'same-site', (r) => { leg(r, 'S-2').parentFilesAfterCross = []; return r; }],
  ['s-describe-parent-input', 'same-site', (r) => { leg(r, 'S-3').describePage.attributes = ['type', 'file', 'id', 'p0']; return r; }],
  ['s-chooser-iframe', 'chooser', (r) => { leg(r, 'S-1').choosers[0].session = 'iframe'; return r; }],
  ['s-iframe-target', 'iframe-targets', (r) => { const l = leg(r, 'S-2'); l.attached.push({ type: 'iframe', targetId: 'x' }); return r; }],
  // every leg
  ['chooser-two', 'chooser', (r) => { const l = leg(r, MIS); l.choosers.push({ ...l.choosers[0] }); return r; }],
  ['chooser-page-session-cross', 'chooser', (r) => { leg(r, COL).choosers[0].session = 'page'; return r; }],
  ['chooser-other-frame', 'chooser', (r) => { leg(r, MIS).choosers[0].frameId = 'F'; return r; }],
  ['describe-chooser-not-s', 'describe-chooser', (r) => { leg(r, MIS).describeChooser.attributes = ['type', 'file', 'id', 'p3']; return r; }],
  ['answer-error', 'answer', (r) => { leg(r, COL).answer.error = NOT_FILE_INPUT; return r; }],
  ['answer-B-unbound', 'answer', (r) => { leg(r, MIS).answer.B += 1; return r; }],
  ['child-files-empty', 'child-files', (r) => { leg(r, MIS).childFiles = []; return r; }],
  ['child-click-untrusted', 'child-click', (r) => { leg(r, COL).childClicks = [{ target: 's', isTrusted: false }]; return r; }],
  ['iframe-target-missing', 'iframe-targets', (r) => { leg(r, MIS).browserIframeTargets = []; return r; }],
  // leg set: contradictory duplicates, fabricated labels, order
  ['dup-leg-contradictory', 'leg-set', (r) => { const l = JSON.parse(JSON.stringify(leg(r, MIS))); l.crossAnswer.error = NOT_FILE_INPUT; r.legs.push(l); return r; }],
  ['fabricated-label', 'leg-arm', (r) => { const l = leg(r, COL); l.leg = 'P290-' + l.rep; return r; }],
  ['label-arm-mismatch', 'leg-arm', (r) => { leg(r, MIS).q += 1; return r; }],
  ['leg-order-swapped', 'leg-set', (r) => { [r.legs[0], r.legs[1]] = [r.legs[1], r.legs[0]]; return r; }],
  ['leg-dropped', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'S-3'); return r; }],
  ['leg-non-object', 'leg-shape', (r) => { r.legs.push(7); return r; }],
  // receipt identity
  ['schema-r94', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-backendnode-collision-r94'; return r; }],
  ['nonce-other', 'nonce', (r) => { r.nonce = 'tabi-r95-other'; return r; }],
  ['driver-sha-forged', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['chromium-other', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['cross-host-same-site', 'cross-host', (r) => { r.crossHost = '127.0.0.1'; return r; }],
  ['reps-identity', 'reps', (r) => { r.reps = 2; return r; }],
  ['pad-identity', 'pad', (r) => { r.pad = 0; return r; }],
  ['fixture-qs', 'fixture', (r) => { r.qs = [286, 287, 288]; return r; }],
  ['fixture-k', 'fixture', (r) => { r.k = 5; return r; }],
  ['answer-identity', 'answer', (r) => { r.answer = { name: 'other.txt', size: 22 }; return r; }],
  ['port-out-of-range', 'ports', (r) => { r.ports.cdp = 70000; return r; }],
  ['port-below-1024', 'ports', (r) => { r.ports.http = 80; return r; }],
  ['port-duplicate', 'ports', (r) => { r.ports.child = r.ports.http; return r; }],
  ['parent-url-other-leg', 'parent-url', (r) => { const l = leg(r, MIS); l.parentUrl = l.parentUrl.replace('leg=' + MIS, 'leg=' + COL); return r; }],
  ['child-url-userinfo', 'child-url', (r) => { const l = leg(r, COL); l.childUrl = l.childUrl.replace('http://', 'http://u@'); return r; }],
  ['browser-version-leg', 'browser-version', (r) => { leg(r, 'S-2').browserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, COL).browserId = leg(r, MIS).browserId; return r; }],
  ['browser-id-not-uuid', 'fresh-browser', (r) => { leg(r, COL).browserId = '-'.repeat(36); return r; }],
  // producer polarity and an ignored producer verdict
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'S-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'S-2').error = 'devtools endpoint never answered'; return r; }],
  ['producer-pass-ignored', 'parent-files', (r) => { r.verdict = 'clean'; r.ok = true; const l = leg(r, MIS); setFiles(l, target(l), []); return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r94;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r95-backendnode-misdelivery-negatives', receipt: rcpt, misdeliveryLeg: MIS, collisionLeg: COL, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
