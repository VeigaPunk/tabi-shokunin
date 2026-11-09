#!/usr/bin/env node
// Negative battery: tabi round 99, C1 (`C1-CLIENT-OOPIF-UPLOADSETS-R99`). Each case mutates a real receipt
// of scripts/client-oopif-uploadsets-round99.mjs (or substitutes the r98 receipt, the do-nothing control)
// and runs the frozen counter in --receipt mode; a case is killed when the counter exits 1 AND reports the
// expected finding id. The `positive` case (unmodified receipt) must exit 0 with zero findings.
// Classes: the trust law (trusted claimed on a payload leg, untrusted on a path leg, an event on the other
// input, dropped/doubled/reordered/click), the fill law (a refused second file landing, the multiple input
// holding one file, files on the wrong input, order swapped, the inferred type, the octet-stream fallback,
// the phantom sized), the content law (a read changed, a FileReader read diverging from arrayBuffer, a read
// on a refused leg, the phantom readable by one reader), the refusal law (PLBN/PUCN resolving, other
// message, other error name), the missing-file law (PLAM resolving / other path, PUAM rejected), the mode
// law (launch/connect, isLocal, input, target, library), isolation (iframe targets, frames, URLs incl. a
// parentUrl-only change: r98 R98Mut survivor), identity (libs, browser, chromium, nonce, pin),
// receipt-level descriptors (files, payloads, bin, missing, tmpdirAtLoad, reps, ports incl. 1023, 65536
// and a fractional port with URLs rewritten consistently: R98Mut survivors), contradictory duplicate and
// fabricated leg labels, and producer polarity (failures without leg errors, leg errors without failures,
// an ignored producer verdict, a resolved leg carrying a stale error) — tabi r63 binding classes.
// Usage: node negatives-client-oopif-uploadsets-round99.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r98 = path.join(lane, 'corpus/evidence/round98/client-oopif-uploadmodes/receipt.json');
const counter = path.join(lane, 'scripts/check-client-oopif-uploadsets-round99.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const E = (id, t, tr) => [id, t, tr];
const AB = () => [[base.fileA.name, base.fileA.size, 'text/plain'], [base.fileB.name, base.fileB.size, 'text/plain']];
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
  ['do-nothing-r98-receipt', 'schema', null],
  // trust law
  ['plbx-trusted-claimed', 'child-events', (r) => { leg(r, 'PLBX-1').events = [E('s', 'input', true), E('s', 'change', true)]; return r; }],
  ['plbm-trusted-claimed', 'child-events', (r) => { leg(r, 'PLBM-2').events = [E('m', 'input', true), E('m', 'change', true)]; return r; }],
  ['pllp-untrusted', 'child-events', (r) => { leg(r, 'PLLP-1').events = [E('m', 'input', false), E('m', 'change', false)]; return r; }],
  ['pucm-change-untrusted', 'child-events', (r) => { leg(r, 'PUCM-3').events = [E('m', 'input', true), E('m', 'change', false)]; return r; }],
  ['puam-untrusted', 'child-events', (r) => { leg(r, 'PUAM-2').events = [E('s', 'input', false), E('s', 'change', false)]; return r; }],
  ['pucm-events-on-s', 'child-events', (r) => { leg(r, 'PUCM-1').events = [E('s', 'input', true), E('s', 'change', true)]; return r; }],
  ['pllp-input-dropped', 'child-events', (r) => { leg(r, 'PLLP-2').events = [E('m', 'change', true)]; return r; }],
  ['plbm-events-doubled', 'child-events', (r) => { const l = leg(r, 'PLBM-3'); l.events = [...l.events, ...l.events]; return r; }],
  ['pllp-events-reordered', 'child-events', (r) => { leg(r, 'PLLP-3').events = [E('m', 'change', true), E('m', 'input', true)]; return r; }],
  ['plbx-click-added', 'child-events', (r) => { const l = leg(r, 'PLBX-2'); l.events = [E('s', 'click', true), ...l.events]; return r; }],
  ['plbn-events-fired', 'child-events', (r) => { leg(r, 'PLBN-1').events = [E('s', 'input', false), E('s', 'change', false)]; return r; }],
  ['pucn-events-fired', 'child-events', (r) => { leg(r, 'PUCN-2').events = [E('s', 'input', true), E('s', 'change', true)]; return r; }],
  ['plam-events-null', 'child-events', (r) => { leg(r, 'PLAM-1').events = null; return r; }],
  // fill law
  ['plbn-first-file-landed', 'child-files', (r) => { leg(r, 'PLBN-1').files.s = [[base.payload1.name, base.payload1.size, 'text/plain']]; return r; }],
  ['pucn-first-file-landed', 'child-files', (r) => { leg(r, 'PUCN-3').files.s = [AB()[0]]; return r; }],
  ['pucm-one-file', 'child-files', (r) => { leg(r, 'PUCM-2').files.m = [AB()[0]]; return r; }],
  ['pllp-order-swapped', 'child-files', (r) => { leg(r, 'PLLP-1').files.m = [AB()[1], AB()[0]]; return r; }],
  ['pllp-files-on-s', 'child-files', (r) => { const l = leg(r, 'PLLP-2'); l.files = { s: l.files.m, m: [] }; return r; }],
  ['plbx-type-octet', 'child-files', (r) => { leg(r, 'PLBX-1').files.s = [[base.bin.name, base.bin.size, 'application/octet-stream']]; return r; }],
  ['plbx-type-empty', 'child-files', (r) => { leg(r, 'PLBX-3').files.s = [[base.bin.name, base.bin.size, '']]; return r; }],
  ['plbm-p2-typed-text', 'child-files', (r) => { leg(r, 'PLBM-1').files.m[1][2] = 'text/plain'; return r; }],
  ['plbm-p2-type-empty', 'child-files', (r) => { leg(r, 'PLBM-2').files.m[1][2] = ''; return r; }],
  ['plbx-size', 'child-files', (r) => { leg(r, 'PLBX-2').files.s[0][1] = 255; return r; }],
  ['puam-phantom-sized', 'child-files', (r) => { leg(r, 'PUAM-1').files.s[0][1] = 22; return r; }],
  ['puam-phantom-absent', 'child-files', (r) => { leg(r, 'PUAM-3').files.s = []; return r; }],
  ['plam-phantom-filled', 'child-files', (r) => { leg(r, 'PLAM-2').files.s = [['tabi-r99-missing.txt', 0, 'text/plain']]; return r; }],
  ['files-m-key-dropped', 'child-files', (r) => { delete leg(r, 'PLBX-1').files.m; return r; }],
  ['puam-parent-filled', 'parent-files', (r) => { leg(r, 'PUAM-2').parentFiles = [['tabi-r99-missing.txt', 0, 'text/plain']]; return r; }],
  ['pucm-parent-filled', 'parent-files', (r) => { leg(r, 'PUCM-1').parentFiles = AB(); return r; }],
  // content law
  ['plbx-ab-sha-changed', 'child-reads', (r) => { leg(r, 'PLBX-1').reads[0][0][2] = '0'.repeat(64); return r; }],
  ['plbx-fr-diverges', 'child-reads', (r) => { leg(r, 'PLBX-2').reads[0][1] = ['ok', 255, '1'.repeat(64)]; return r; }],
  ['plbm-reads-swapped', 'child-reads', (r) => { const l = leg(r, 'PLBM-3'); l.reads = [l.reads[1], l.reads[0]]; return r; }],
  ['pllp-read-dropped', 'child-reads', (r) => { leg(r, 'PLLP-1').reads.pop(); return r; }],
  ['pucm-read-error', 'child-reads', (r) => { leg(r, 'PUCM-2').reads[1][0] = ['err', 'NotReadableError', 'x']; return r; }],
  ['puam-fr-readable', 'child-reads', (r) => { leg(r, 'PUAM-1').reads[0][1] = ['ok', 0, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855']; return r; }],
  ['puam-ab-other-error', 'child-reads', (r) => { leg(r, 'PUAM-2').reads[0][0] = ['err', 'NotReadableError', 'The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.']; return r; }],
  ['puam-other-message', 'child-reads', (r) => { leg(r, 'PUAM-3').reads[0][1] = ['err', 'NotFoundError', 'not found']; return r; }],
  ['plbn-read-present', 'child-reads', (r) => { leg(r, 'PLBN-2').reads = [[['ok', 27, base.payload1.sha256], ['ok', 27, base.payload1.sha256]]]; return r; }],
  ['plam-reads-null', 'child-reads', (r) => { leg(r, 'PLAM-3').reads = null; return r; }],
  // refusal law
  ['plbn-resolved', 'outcome', (r) => { Object.assign(leg(r, 'PLBN-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['pucn-resolved', 'outcome', (r) => { Object.assign(leg(r, 'PUCN-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['plbn-other-message', 'outcome', (r) => { leg(r, 'PLBN-2').errMessage = 'locator.setInputFiles: Error: Node is not an HTMLInputElement'; return r; }],
  ['pucn-other-message', 'outcome', (r) => { leg(r, 'PUCN-2').errMessage = 'Multiple file uploads only work with <input type=file multiple'; return r; }],
  ['pucn-errname', 'outcome', (r) => { leg(r, 'PUCN-3').errName = 'AssertionError'; return r; }],
  ['plbn-messages-swapped', 'outcome', (r) => { leg(r, 'PLBN-3').errMessage = leg(r, 'PUCN-3').errMessage; return r; }],
  // missing-file law
  ['plam-resolved', 'outcome', (r) => { Object.assign(leg(r, 'PLAM-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['plam-other-path', 'outcome', (r) => { leg(r, 'PLAM-2').errMessage = "ENOENT: no such file or directory, stat '/tmp/tabi-r99-missing.txt'"; return r; }],
  ['plam-other-errname', 'outcome', (r) => { leg(r, 'PLAM-3').errName = 'TypeError'; return r; }],
  ['puam-rejected', 'outcome', (r) => { Object.assign(leg(r, 'PUAM-1'), { outcome: 'error', errName: 'Error', errMessage: 'ENOENT' }); return r; }],
  ['missing-exists', 'missing', (r) => { r.missingExists = true; return r; }],
  ['missing-exists-null', 'missing', (r) => { r.missingExists = null; return r; }],
  ['missing-other-name', 'missing', (r) => { r.missingPath = path.join(path.dirname(r.missingPath), 'other.txt'); return r; }],
  ['missing-relative', 'missing', (r) => { r.missingPath = 'tabi-r99-missing.txt'; return r; }],
  // mode law
  ['puam-mode-connect', 'leg-arm', (r) => { leg(r, 'PUAM-1').mode = 'connect'; return r; }],
  ['plbx-mode-launch', 'leg-arm', (r) => { leg(r, 'PLBX-1').mode = 'launch'; return r; }],
  ['pllp-not-local', 'leg-arm', (r) => { leg(r, 'PLLP-2').isLocal = false; return r; }],
  ['plbm-local', 'leg-arm', (r) => { leg(r, 'PLBM-3').isLocal = true; return r; }],
  ['plam-islocal-set', 'leg-arm', (r) => { leg(r, 'PLAM-2').isLocal = true; return r; }],
  ['plbm-input-paths', 'leg-arm', (r) => { leg(r, 'PLBM-1').input = 'paths'; return r; }],
  ['plbx-input-payloads', 'leg-arm', (r) => { leg(r, 'PLBX-3').input = 'payloads'; return r; }],
  ['pucn-target-m', 'leg-arm', (r) => { leg(r, 'PUCN-1').target = 'm'; return r; }],
  ['plbm-target-s', 'leg-arm', (r) => { leg(r, 'PLBM-2').target = 's'; return r; }],
  ['pucm-lib-swapped', 'leg-arm', (r) => { leg(r, 'PUCM-1').lib = 'playwright'; return r; }],
  // isolation
  ['puam-child-same-site', 'leg-urls', (r) => { const l = leg(r, 'PUAM-1'); l.childUrl = l.childUrl.replace('localhost', '127.0.0.1'); return r; }],
  ['plbx-parent-url-only', 'leg-urls', (r) => { const l = leg(r, 'PLBX-1'); l.parentUrl = l.parentUrl.replace('leg=PLBX-1', 'leg=PLBX-2'); return r; }],
  ['pucm-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'PUCM-3').iframeTargets = []; return r; }],
  ['plam-two-iframe-targets', 'iframe-targets', (r) => { const l = leg(r, 'PLAM-3'); l.iframeTargets.push({ ...l.iframeTargets[0], targetId: 'B'.repeat(32) }); return r; }],
  ['plbm-iframe-target-other-url', 'iframe-targets', (r) => { const l = leg(r, 'PLBM-2'); l.iframeTargets[0].url = l.childUrl.replace('leg=PLBM-2', 'leg=PLBM-1'); return r; }],
  ['pllp-iframe-targets-null', 'iframe-targets', (r) => { leg(r, 'PLLP-1').iframeTargets = null; return r; }],
  ['frames-extra', 'frames', (r) => { const l = leg(r, 'PLBN-1'); l.frames = [...l.frames, 'about:blank']; return r; }],
  ['frames-child-swapped', 'frames', (r) => { const l = leg(r, 'PUCN-1'); l.frames = [l.frames[0], leg(r, 'PUCM-1').childUrl]; return r; }],
  // identity
  ['lib-pp-version', 'libs', (r) => { r.libs['puppeteer-core'].version = '25.15.0'; return r; }],
  ['lib-pw-integrity', 'libs', (r) => { r.libs['playwright-core'].integrity = 'sha512-AAAA'; return r; }],
  ['lib-pp-filesha', 'libs', (r) => { r.libs['puppeteer-core'].fileSha256 = '0'.repeat(64); return r; }],
  ['lib-pw-treesha', 'libs', (r) => { r.libs['playwright-core'].treeSha256 = '1'.repeat(64); return r; }],
  ['lib-pp-treefiles', 'libs', (r) => { r.libs['puppeteer-core'].treeFiles = 928; return r; }],
  ['lib-missing', 'libs', (r) => { delete r.libs['puppeteer-core']; return r; }],
  ['browser-version-leg', 'browser', (r) => { leg(r, 'PLBX-2').browserVersion = 'HeadlessChrome/155.0.8059.84'; return r; }],
  ['client-version-leg', 'browser', (r) => { leg(r, 'PUCM-2').clientBrowserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['chromium-string', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['nonce-other', 'nonce', (r) => { r.nonce = 'tabi-r99-other'; return r; }],
  ['driver-pin-other', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  // receipt-level descriptors
  ['filea-size', 'files', (r) => { r.fileA.size = 23; return r; }],
  ['fileb-sha', 'files', (r) => { r.fileB.sha256 = '0'.repeat(64); return r; }],
  ['payload1-mime', 'payloads', (r) => { r.payload1.mimeType = 'application/octet-stream'; return r; }],
  ['payload2-typed', 'payloads', (r) => { r.payload2.mimeType = 'text/plain'; return r; }],
  ['bin-typed', 'payloads', (r) => { r.bin.mimeType = 'image/png'; return r; }],
  ['bin-missing', 'payloads', (r) => { delete r.bin; return r; }],
  ['tmpdir-relative', 'tmpdir', (r) => { r.tmpdirAtLoad = 't'; return r; }],
  ['tmpdir-system', 'tmpdir', (r) => { r.tmpdirAtLoad = '/tmp'; return r; }],
  ['reps-other', 'reps', (r) => { r.reps = 999; return r; }],
  ['port-1023', 'ports', (r) => rePort(r, 'http', 1023)],
  ['port-65536', 'ports', (r) => rePort(r, 'child', 65536)],
  ['port-fractional', 'ports', (r) => rePort(r, 'child', r.ports.child + 0.5)],
  ['port-duplicate', 'ports', (r) => { r.ports.cdp = r.ports.http; return r; }],
  // leg labels: contradictory duplicate, fabricated label, dropped/reordered leg
  ['leg-duplicate-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'PLBN-1'))); Object.assign(d, { outcome: 'resolved', errName: null, errMessage: null }); r.legs.splice(5, 0, d); return r; }],
  ['leg-fabricated-label', 'leg-label', (r) => { const l = leg(r, 'PLBM-3'); l.leg = 'PLZM-3'; l.arm = 'PLZM'; return r; }],
  ['leg-dropped', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'PUCN-2'); return r; }],
  ['legs-empty', 'leg-set', (r) => { r.legs = []; return r; }],
  ['leg-reordered', 'leg-set', (r) => { const [a, b] = [r.legs[0], r.legs[1]]; r.legs[0] = b; r.legs[1] = a; return r; }],
  ['leg-rep-mismatch', 'leg-label', (r) => { leg(r, 'PLBX-2').rep = 1; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'PLBX-2').browserId = leg(r, 'PLBX-1').browserId; return r; }],
  ['browser-id-not-uuid', 'fresh-browser', (r) => { leg(r, 'PUCM-2').browserId = '-'.repeat(36); return r; }],
  // producer polarity, an ignored producer verdict, a resolved leg carrying a stale error
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'PLBX-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'PLBX-2').error = 'chromium never came up'; return r; }],
  ['producer-pass-ignored', 'child-events', (r) => { r.verdict = 'clean'; r.ok = true; leg(r, 'PLBM-1').events = [E('m', 'input', true), E('m', 'change', true)]; return r; }],
  ['resolved-with-stale-error', 'outcome', (r) => { Object.assign(leg(r, 'PLLP-1'), { errName: 'Error', errMessage: 'stale' }); return r; }],
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
const out = { battery: 'tabi-r99-client-oopif-uploadsets-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
