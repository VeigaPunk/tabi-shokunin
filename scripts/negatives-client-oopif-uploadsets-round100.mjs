#!/usr/bin/env node
// Negative battery: tabi round 100, C1 (`C1-CLIENT-OOPIF-UPLOADSETS-R100`). Each case mutates a real receipt
// of scripts/client-oopif-uploadsets-round100.mjs (or substitutes the r98 receipt, the do-nothing control)
// and runs the frozen counter in --receipt mode; a case is killed when the counter exits 1 AND reports the
// expected finding id. The `positive` case (unmodified receipt) must exit 0 with zero findings.
// Classes: the trust law (trusted claimed on a payload leg, untrusted on a path leg, an event on the other
// input, dropped/doubled/reordered/click), the fill law (a refused leg landing a file, a duplicate name
// deduped or renamed, files on the wrong input, order swapped, an empty file sized, a directory flattened),
// the content law (a read changed, a FileReader read diverging from arrayBuffer, a read on a refused leg),
// the refusal law (MIXED resolving / other message), the mode law (launch/connect, isLocal, input, target,
// library), isolation (iframe targets, frames, URLs incl. a parentUrl-only change: r98 R98Mut survivor),
// identity (libs, browser, chromium, nonce, pin), receipt-level descriptors (files, payloads, missing,
// tmpdirAtLoad, reps, ports incl. 1023, 65536 and a fractional port with URLs rewritten consistently:
// R98Mut survivors), contradictory duplicate and fabricated leg labels, and producer polarity (failures
// without leg errors, leg errors without failures, an ignored producer verdict, a resolved leg carrying a
// stale error) — tabi r63 binding classes. Plus the r99 R99Mut receipt-mode survivors: missingExists 0
// (loose ==), iframe-targetid empty, resolved legs with only errMessage or only errName set.
// Usage: node negatives-client-oopif-uploadsets-round100.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r98 = path.join(lane, 'corpus/evidence/round99/client-oopif-uploadsets/receipt.json');
const counter = path.join(lane, 'scripts/check-client-oopif-uploadsets-round100.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const E = (id, t, tr) => [id, t, tr];
const AB = () => [[base.fileA.name, base.fileA.size, 'text/plain', ''], [base.fileB.name, base.fileB.size, 'text/plain', '']];
// rewrite every URL of the receipt for a forged port, so only the port checks can see the forgery
const rePort = (r, key, to) => {
  const from = String(r.ports[key]);
  r.ports[key] = to;
  const s = JSON.stringify(r.legs).split(':' + from + '/').join(':' + String(to) + '/');
  r.legs = JSON.parse(s);
  return r;
};
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r99-receipt', 'schema', null],
  // trust law
  ['dup3-events-on-s', 'child-events', (r) => { leg(r, 'DUP3-1').events = [E('s', 'input', false), E('s', 'change', false)]; return r; }],
  ['dup3-trusted-claimed', 'child-events', (r) => { leg(r, 'DUP3-2').events = [E('m', 'input', true), E('m', 'change', true)]; return r; }],
  ['launch2-untrusted', 'child-events', (r) => { leg(r, 'LAUNCH2PL-1').events = [E('m', 'input', false), E('m', 'change', false)]; return r; }],
  ['launch2-change-untrusted', 'child-events', (r) => { leg(r, 'LAUNCH2PU-3').events = [E('m', 'input', true), E('m', 'change', false)]; return r; }],
  ['empty-events-on-s', 'child-events', (r) => { leg(r, 'EMPTY1-2').events = [E('s', 'input', false), E('s', 'change', false)]; return r; }],
  ['launch2-events-on-s', 'child-events', (r) => { leg(r, 'LAUNCH2PU-1').events = [E('s', 'input', true), E('s', 'change', true)]; return r; }],
  ['launch2-input-dropped', 'child-events', (r) => { leg(r, 'LAUNCH2PL-2').events = [E('m', 'change', true)]; return r; }],
  ['dup3-events-doubled', 'child-events', (r) => { const l = leg(r, 'DUP3-3'); l.events = [...l.events, ...l.events]; return r; }],
  ['launch2-events-reordered', 'child-events', (r) => { leg(r, 'LAUNCH2PL-3').events = [E('m', 'change', true), E('m', 'input', true)]; return r; }],
  ['dup3-click-added', 'child-events', (r) => { const l = leg(r, 'DUP3-2'); l.events = [E('m', 'click', false), ...l.events]; return r; }],
  ['mixed-events-fired', 'child-events', (r) => { leg(r, 'MIXED-1').events = [E('m', 'input', false), E('m', 'change', false)]; return r; }],
  ['dir-events-on-s', 'child-events', (r) => { leg(r, 'DIR-2').events = [E('s', 'input', true), E('s', 'change', true)]; return r; }],
  ['mixed-events-null', 'child-events', (r) => { leg(r, 'MIXED-1').events = null; return r; }],
  // fill law
  ['mixed-first-file-landed', 'child-files', (r) => { leg(r, 'MIXED-1').files.m = [[base.payload1.name, base.payload1.size, 'text/plain', '']]; return r; }],
  ['dir-first-file-on-s', 'child-files', (r) => { leg(r, 'DIR-3').files.s = [AB()[0]]; return r; }],
  ['launch2-one-file', 'child-files', (r) => { leg(r, 'LAUNCH2PU-2').files.m = [AB()[0]]; return r; }],
  ['launch2-order-swapped', 'child-files', (r) => { leg(r, 'LAUNCH2PL-1').files.m = [AB()[1], AB()[0]]; return r; }],
  ['launch2-files-on-s', 'child-files', (r) => { const l = leg(r, 'LAUNCH2PL-2'); l.files = { s: l.files.m, m: [], d: [] }; return r; }],
  ['empty-size', 'child-files', (r) => { leg(r, 'EMPTY1-1').files.m = [[base.empty.name, 1, 'text/plain', '']]; return r; }],
  ['dup3-order-swapped', 'child-files', (r) => { const l = leg(r, 'DUP3-2'); [l.files.m[0], l.files.m[1]] = [l.files.m[1], l.files.m[0]]; return r; }],
  ['dup3-p2-typed-empty', 'child-files', (r) => { leg(r, 'DUP3-1').files.m[1][2] = ''; return r; }],
  ['empty-type-empty', 'child-files', (r) => { leg(r, 'EMPTY1-2').files.m[0][2] = ''; return r; }],
  ['dup3-size', 'child-files', (r) => { leg(r, 'DUP3-2').files.m[0][1] = 20; return r; }],
  ['empty-sized', 'child-files', (r) => { leg(r, 'EMPTY1-1').files.m[0][1] = 1; return r; }],
  ['empty-absent', 'child-files', (r) => { leg(r, 'EMPTY1-3').files.m = []; return r; }],
  ['mixed-filled', 'child-files', (r) => { leg(r, 'MIXED-2').files.m = [['tabi-r100-missing.txt', 0, 'text/plain', '']]; return r; }],
  ['files-m-key-dropped', 'child-files', (r) => { delete leg(r, 'DUP3-1').files.m; return r; }],
  ['empty-parent-filled', 'parent-files', (r) => { leg(r, 'EMPTY1-2').parentFiles = [['tabi-r100-missing.txt', 0, 'text/plain', '']]; return r; }],
  ['launch2-parent-filled', 'parent-files', (r) => { leg(r, 'LAUNCH2PU-1').parentFiles = AB(); return r; }],
  // content law
  ['dup3-ab-sha-changed', 'child-reads', (r) => { leg(r, 'DUP3-1').reads[0][0][2] = '0'.repeat(64); return r; }],
  ['dup3-fr-diverges', 'child-reads', (r) => { leg(r, 'DUP3-2').reads[0][1] = ['ok', 20, '1'.repeat(64)]; return r; }],
  ['dup3-reads-swapped', 'child-reads', (r) => { const l = leg(r, 'DUP3-3'); l.reads = [l.reads[1], l.reads[0]]; return r; }],
  ['launch2-read-dropped', 'child-reads', (r) => { leg(r, 'LAUNCH2PL-1').reads.pop(); return r; }],
  ['launch2-read-error', 'child-reads', (r) => { leg(r, 'LAUNCH2PU-2').reads[1][0] = ['err', 'NotReadableError', 'x']; return r; }],
  ['empty-fr-scaled', 'child-reads', (r) => { leg(r, 'EMPTY1-1').reads[0][1] = ['ok', 1, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']; return r; }],
  ['empty-ab-error', 'child-reads', (r) => { leg(r, 'EMPTY1-2').reads[0][0] = ['err', 'NotReadableError', 'x']; return r; }],
  ['dir-reads-swapped', 'child-reads', (r) => { const l = leg(r, 'DIR-3'); l.reads = [l.reads[1], l.reads[0]]; return r; }],
  ['mixed-read-present', 'child-reads', (r) => { leg(r, 'MIXED-2').reads = [[['ok', 28, base.payload1.sha256], ['ok', 28, base.payload1.sha256]]]; return r; }],
  ['mixed-reads-null', 'child-reads', (r) => { leg(r, 'MIXED-3').reads = null; return r; }],
  // refusal law
  ['mixed-resolved2', 'outcome', (r) => { Object.assign(leg(r, 'MIXED-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['dir-error-outcome', 'outcome', (r) => { Object.assign(leg(r, 'DIR-1'), { outcome: 'error', errName: 'Error', errMessage: 'x' }); return r; }],
  ['mixed-other-message2', 'outcome', (r) => { leg(r, 'MIXED-2').errMessage = 'locator.setInputFiles: Error: Node is not an HTMLInputElement'; return r; }],
  ['dir-other-message-x', 'outcome', (r) => { leg(r, 'DIR-2').errMessage = 'x'; return r; }],
  ['dir-errname', 'outcome', (r) => { leg(r, 'DIR-3').errName = 'AssertionError'; return r; }],
  ['mixed-messages-swapped', 'outcome', (r) => { leg(r, 'MIXED-3').errMessage = 'x'; return r; }],
  // missing-file law
  ['mixed-resolved3', 'outcome', (r) => { Object.assign(leg(r, 'MIXED-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['mixed-other-path', 'outcome', (r) => { leg(r, 'MIXED-2').errMessage = "ENOENT: no such file or directory, stat '/tmp/tabi-r100-missing.txt'"; return r; }],
  ['mixed-other-errname', 'outcome', (r) => { leg(r, 'MIXED-3').errName = 'TypeError'; return r; }],
  ['empty-rejected', 'outcome', (r) => { Object.assign(leg(r, 'EMPTY1-1'), { outcome: 'error', errName: 'Error', errMessage: 'ENOENT' }); return r; }],
  ['missing-exists', 'missing', (r) => { r.missingExists = true; return r; }],
  ['missing-exists-zero', 'missing', (r) => { r.missingExists = 0; return r; }],
  ['missing-exists-null', 'missing', (r) => { r.missingExists = null; return r; }],
  ['missing-other-name', 'missing', (r) => { r.missingPath = path.join(path.dirname(r.missingPath), 'other.txt'); return r; }],
  ['missing-relative', 'missing', (r) => { r.missingPath = 'tabi-r100-missing.txt'; return r; }],
  // mode law
  ['empty-mode-launch', 'leg-arm', (r) => { leg(r, 'EMPTY1-1').mode = 'launch'; return r; }],
  ['dup3-mode-launch', 'leg-arm', (r) => { leg(r, 'DUP3-1').mode = 'launch'; return r; }],
  ['mixed-not-local', 'leg-arm', (r) => { leg(r, 'MIXED-2').isLocal = false; return r; }],
  ['dup3-local', 'leg-arm', (r) => { leg(r, 'DUP3-3').isLocal = true; return r; }],
  ['mixed-islocal-false', 'leg-arm', (r) => { leg(r, 'LAUNCH2PL-2').isLocal = false; return r; }],
  ['dup3-input-paths', 'leg-arm', (r) => { leg(r, 'DUP3-1').input = 'paths'; return r; }],
  ['dup3-input-dup3x', 'leg-arm', (r) => { leg(r, 'DUP3-3').input = 'empty'; return r; }],
  ['dir-target-m', 'leg-arm', (r) => { leg(r, 'DIR-1').target = 'm'; return r; }],
  ['dup3-target-s', 'leg-arm', (r) => { leg(r, 'DUP3-2').target = 's'; return r; }],
  ['launch2-lib-swapped', 'leg-arm', (r) => { leg(r, 'LAUNCH2PU-1').lib = 'playwright'; return r; }],
  // isolation
  ['empty-child-same-site', 'leg-urls', (r) => { const l = leg(r, 'EMPTY1-1'); l.childUrl = l.childUrl.replace('localhost', '127.0.0.1'); return r; }],
  ['dup3-parent-url-only', 'leg-urls', (r) => { const l = leg(r, 'DUP3-1'); l.parentUrl = l.parentUrl.replace('leg=DUP3-1', 'leg=DUP3-2'); return r; }],
  ['launch2-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'LAUNCH2PU-3').iframeTargets = []; return r; }],
  ['mixed-two-iframe-targets', 'iframe-targets', (r) => { const l = leg(r, 'MIXED-3'); l.iframeTargets.push({ ...l.iframeTargets[0], targetId: 'B'.repeat(32) }); return r; }],
  ['dup3-iframe-target-other-url', 'iframe-targets', (r) => { const l = leg(r, 'DUP3-2'); l.iframeTargets[0].url = l.childUrl.replace('leg=DUP3-2', 'leg=DUP3-1'); return r; }],
  ['launch2-iframe-targets-null', 'iframe-targets', (r) => { leg(r, 'LAUNCH2PL-1').iframeTargets = null; return r; }],
  ['frames-extra', 'frames', (r) => { const l = leg(r, 'MIXED-1'); l.frames = [...l.frames, 'about:blank']; return r; }],
  ['frames-child-swapped', 'frames', (r) => { const l = leg(r, 'DIR-1'); l.frames = [l.frames[0], leg(r, 'LAUNCH2PU-1').childUrl]; return r; }],
  // identity
  ['lib-pp-version', 'libs', (r) => { r.libs['puppeteer-core'].version = '25.15.0'; return r; }],
  ['lib-pw-integrity', 'libs', (r) => { r.libs['playwright-core'].integrity = 'sha512-AAAA'; return r; }],
  ['lib-pp-filesha', 'libs', (r) => { r.libs['puppeteer-core'].fileSha256 = '0'.repeat(64); return r; }],
  ['lib-pw-treesha', 'libs', (r) => { r.libs['playwright-core'].treeSha256 = '1'.repeat(64); return r; }],
  ['lib-pp-treefiles', 'libs', (r) => { r.libs['puppeteer-core'].treeFiles = 928; return r; }],
  ['lib-missing', 'libs', (r) => { delete r.libs['puppeteer-core']; return r; }],
  ['browser-version-leg', 'browser', (r) => { leg(r, 'DUP3-2').browserVersion = 'HeadlessChrome/155.0.8059.84'; return r; }],
  ['client-version-leg', 'browser', (r) => { leg(r, 'LAUNCH2PU-2').clientBrowserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['chromium-string', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['nonce-other', 'nonce', (r) => { r.nonce = 'tabi-r100-other'; return r; }],
  ['driver-pin-other', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  // receipt-level descriptors
  ['filea-size', 'files', (r) => { r.fileA.size = 22; return r; }],
  ['fileb-sha', 'files', (r) => { r.fileB.sha256 = '0'.repeat(64); return r; }],
  ['payload1-mime', 'payloads', (r) => { r.payload1.mimeType = 'application/octet-stream'; return r; }],
  ['dup2-sha', 'payloads', (r) => { r.dup2.sha256 = '0'.repeat(64); return r; }],
  ['empty-size', 'payloads', (r) => { r.empty.size = 1; return r; }],
  ['dirone-rel', 'payloads', (r) => { r.dirOne.webkitRelativePath = 'one.txt'; return r; }],
  ['tmpdir-relative', 'tmpdir', (r) => { r.tmpdirAtLoad = 't'; return r; }],
  ['tmpdir-system', 'tmpdir', (r) => { r.tmpdirAtLoad = '/tmp'; return r; }],
  ['reps-other', 'reps', (r) => { r.reps = 999; return r; }],
  ['port-1023', 'ports', (r) => rePort(r, 'http', 1023)],
  ['port-65536', 'ports', (r) => rePort(r, 'child', 65536)],
  ['port-fractional', 'ports', (r) => rePort(r, 'child', r.ports.child + 0.5)],
  ['port-duplicate', 'ports', (r) => { r.ports.cdp = r.ports.http; return r; }],
  // leg labels: contradictory duplicate, fabricated label, dropped/reordered leg
  ['leg-duplicate-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'MIXED-1'))); Object.assign(d, { outcome: 'resolved', errName: null, errMessage: null }); r.legs.splice(5, 0, d); return r; }],
  ['leg-fabricated-label', 'leg-label', (r) => { const l = leg(r, 'DUP3-3'); l.leg = 'ZZZZ-3'; l.arm = 'PLZM'; return r; }],
  ['leg-dropped', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'DIR-2'); return r; }],
  ['legs-empty', 'leg-set', (r) => { r.legs = []; return r; }],
  ['leg-reordered', 'leg-set', (r) => { const [a, b] = [r.legs[0], r.legs[1]]; r.legs[0] = b; r.legs[1] = a; return r; }],
  ['leg-rep-mismatch', 'leg-label', (r) => { leg(r, 'DUP3-2').rep = 1; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'DUP3-2').browserId = leg(r, 'DUP3-1').browserId; return r; }],
  ['browser-id-not-uuid', 'fresh-browser', (r) => { leg(r, 'LAUNCH2PU-2').browserId = '-'.repeat(36); return r; }],
  // producer polarity, an ignored producer verdict, a resolved leg carrying a stale error
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'DUP3-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'DUP3-2').error = 'chromium never came up'; return r; }],
  ['producer-pass-ignored', 'child-events', (r) => { r.verdict = 'clean'; r.ok = true; leg(r, 'DUP3-1').events = [E('m', 'input', true), E('m', 'change', true)]; return r; }],
  ['resolved-with-stale-error', 'outcome', (r) => { Object.assign(leg(r, 'LAUNCH2PL-1'), { errName: 'Error', errMessage: 'stale' }); return r; }],
  ['resolved-errmessage-only', 'outcome', (r) => { leg(r, 'LAUNCH2PL-1').errMessage = 'stale'; return r; }],
  ['resolved-errname-only', 'outcome', (r) => { leg(r, 'LAUNCH2PL-1').errName = 'Error'; return r; }],
  ['iframe-targetid-empty', 'iframe-targets', (r) => { leg(r, 'DIR-1').iframeTargets[0].targetId = ''; return r; }],
  ['files-d-key-dropped', 'child-files', (r) => { delete leg(r, 'DUP3-1').files.d; return r; }],
  ['dir-files-on-m', 'child-files', (r) => { const l = leg(r, 'DIR-1'); l.files = { s: [], m: l.files.d, d: [] }; return r; }],
  ['dup3-deduped', 'child-files', (r) => { const l = leg(r, 'DUP3-1'); l.files.m = [l.files.m[0], l.files.m[2]]; return r; }],
  ['mixed-resolved', 'outcome', (r) => { Object.assign(leg(r, 'MIXED-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['mixed-other-message', 'outcome', (r) => { leg(r, 'MIXED-1').errMessage = 'File paths cannot be mixed with buffers!'; return r; }],
  ['dir-events-on-m', 'child-events', (r) => { leg(r, 'DIR-1').events = [E('m', 'input', true), E('m', 'change', true)]; return r; }],
  ['dir-relative-flattened', 'child-files', (r) => { leg(r, 'DIR-1').files.d[1][3] = 'two.txt'; return r; }],
  ['empty-trusted-claimed', 'child-events', (r) => { leg(r, 'EMPTY1-1').events = [E('m', 'input', true), E('m', 'change', true)]; return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r98;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [], verdict = null;
  try { const o = JSON.parse(r.stdout); verdict = o.verdict; ids = [...new Set(o.findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && verdict === 'clean' && ids.length === 0 : r.status === 1 && verdict === 'findings' && ids.includes(expect);
  results.push({ name, expect, rc: r.status, verdict, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r100-client-oopif-uploadsets-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
