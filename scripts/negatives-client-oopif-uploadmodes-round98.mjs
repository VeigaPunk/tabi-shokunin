#!/usr/bin/env node
// Negative battery: tabi round 98, C1 (`C1-CLIENT-OOPIF-UPLOADMODES-R98`). Each case mutates a real receipt
// of scripts/client-oopif-uploadmodes-round98.mjs (or substitutes the r97 receipt, the do-nothing control)
// and runs the frozen counter in --receipt mode; a case is killed when the counter exits 1 AND reports the
// expected finding id. The `positive` case (unmodified receipt) must exit 0 with zero findings.
// Classes: the trust law (a trusted event claimed on a payload leg, an untrusted event on a path leg, an
// event dropped, doubled, reordered or a click added), the fill law (child empty, wrong file, wrong size,
// wrong type, two files, filled parent), the content law (read text changed, a payload leg reading the
// answer, a read error on a path leg), the missing-file law (PUR rejected / sized / readable, PLLM
// resolving / filling / other message / other path / a read), the mode law (launch and connect swapped,
// isLocal flipped, input swapped), isolation (iframe target absent, doubled, other URL; frames), identity
// (version, integrity, file sha, tree sha, tree file count, missing library, browser), receipt-level
// descriptors (answer, payload, missing, ports, reps), contradictory duplicate and fabricated leg labels,
// and producer polarity (failures without leg errors, leg errors without failures, an ignored producer
// verdict, a resolved leg carrying a stale error) — tabi r63 binding classes, plus the r97 R97Mut survivor
// classes M40 (`reps`), M42 (`missingExists: null`) and M66 (resolved leg with errName/errMessage set).
// Usage: node negatives-client-oopif-uploadmodes-round98.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r97 = path.join(lane, 'corpus/evidence/round97/client-oopif-uploadfile/receipt.json');
const counter = path.join(lane, 'scripts/check-client-oopif-uploadmodes-round98.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const ANS = () => [[base.answer.name, base.answer.size, 'text/plain']];
const PAY = () => [[base.payload.name, base.payload.size, base.payload.mimeType]];
const T = (t) => [t, true];
const U = (t) => [t, false];
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r97-receipt', 'schema', null],
  // trust law
  ['plab-trusted-claimed', 'child-events', (r) => { leg(r, 'PLAB-1').childEvents = [T('input'), T('change')]; return r; }],
  ['plb-trusted-claimed', 'child-events', (r) => { leg(r, 'PLB-2').childEvents = [T('input'), T('change')]; return r; }],
  ['pllb-trusted-claimed', 'child-events', (r) => { leg(r, 'PLLB-3').childEvents = [T('input'), T('change')]; return r; }],
  ['pla-untrusted', 'child-events', (r) => { leg(r, 'PLA-1').childEvents = [U('input'), U('change')]; return r; }],
  ['pua-change-untrusted', 'child-events', (r) => { leg(r, 'PUA-2').childEvents = [T('input'), U('change')]; return r; }],
  ['pll-untrusted', 'child-events', (r) => { leg(r, 'PLL-2').childEvents = [U('input'), U('change')]; return r; }],
  ['pua-input-dropped', 'child-events', (r) => { leg(r, 'PUA-3').childEvents = [T('change')]; return r; }],
  ['pla-events-doubled', 'child-events', (r) => { leg(r, 'PLA-3').childEvents = [T('input'), T('change'), T('input'), T('change')]; return r; }],
  ['plb-events-reordered', 'child-events', (r) => { leg(r, 'PLB-1').childEvents = [U('change'), U('input')]; return r; }],
  ['pllb-click-added', 'child-events', (r) => { leg(r, 'PLLB-1').childEvents = [T('click'), U('input'), U('change')]; return r; }],
  ['pur-events-null', 'child-events', (r) => { leg(r, 'PUR-1').childEvents = null; return r; }],
  ['pur-untrusted', 'child-events', (r) => { leg(r, 'PUR-2').childEvents = [U('input'), U('change')]; return r; }],
  // fill law
  ['pua-child-empty', 'child-files', (r) => { leg(r, 'PUA-1').childFiles = []; return r; }],
  ['plb-child-answer-instead', 'child-files', (r) => { leg(r, 'PLB-2').childFiles = ANS(); return r; }],
  ['pla-child-wrong-size', 'child-files', (r) => { leg(r, 'PLA-2').childFiles = [[base.answer.name, 0, 'text/plain']]; return r; }],
  ['plab-wrong-type', 'child-files', (r) => { leg(r, 'PLAB-2').childFiles = [[base.payload.name, base.payload.size, 'application/octet-stream']]; return r; }],
  ['pll-type-dropped', 'child-files', (r) => { leg(r, 'PLL-1').childFiles = [[base.answer.name, base.answer.size]]; return r; }],
  ['pllb-two-files', 'child-files', (r) => { leg(r, 'PLLB-2').childFiles = [...PAY(), ...PAY()]; return r; }],
  ['pua-parent-filled', 'parent-files', (r) => { leg(r, 'PUA-2').parentFiles = ANS(); return r; }],
  ['plab-parent-filled', 'parent-files', (r) => { leg(r, 'PLAB-1').parentFiles = PAY(); return r; }],
  // content law
  ['pla-read-changed', 'child-read', (r) => { leg(r, 'PLA-1').childRead = ['ok', 'tabi round 98 answer!\n']; return r; }],
  ['plb-read-answer', 'child-read', (r) => { leg(r, 'PLB-3').childRead = ['ok', base.answer.text]; return r; }],
  ['pll-read-error', 'child-read', (r) => { leg(r, 'PLL-3').childRead = ['err', 'NotReadableError', 'x']; return r; }],
  ['pua-read-null', 'child-read', (r) => { leg(r, 'PUA-1').childRead = null; return r; }],
  // missing-file law
  ['pur-rejected', 'outcome', (r) => { Object.assign(leg(r, 'PUR-1'), { outcome: 'error', errName: 'Error', errMessage: 'ENOENT' }); return r; }],
  ['pur-nonzero-size', 'child-files', (r) => { leg(r, 'PUR-2').childFiles = [['tabi-r98-missing.txt', 22, 'text/plain']]; return r; }],
  ['pur-empty', 'child-files', (r) => { leg(r, 'PUR-3').childFiles = []; return r; }],
  ['pur-readable', 'child-read', (r) => { leg(r, 'PUR-1').childRead = ['ok', '']; return r; }],
  ['pur-read-other-error', 'child-read', (r) => { leg(r, 'PUR-2').childRead = ['err', 'NotReadableError', 'The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.']; return r; }],
  ['pur-read-other-message', 'child-read', (r) => { leg(r, 'PUR-3').childRead = ['err', 'NotFoundError', 'not found']; return r; }],
  ['pllm-resolved', 'outcome', (r) => { Object.assign(leg(r, 'PLLM-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['pllm-phantom-filled', 'child-files', (r) => { leg(r, 'PLLM-2').childFiles = [['tabi-r98-missing.txt', 0, 'text/plain']]; return r; }],
  ['pllm-other-message', 'outcome', (r) => { leg(r, 'PLLM-3').errMessage = 'Error: file not found'; return r; }],
  ['pllm-other-path', 'outcome', (r) => { leg(r, 'PLLM-1').errMessage = "ENOENT: no such file or directory, stat '/tmp/tabi-r98-missing.txt'"; return r; }],
  ['pllm-other-errname', 'outcome', (r) => { leg(r, 'PLLM-2').errName = 'TypeError'; return r; }],
  ['pllm-events', 'child-events', (r) => { leg(r, 'PLLM-2').childEvents = [T('input'), T('change')]; return r; }],
  ['pllm-read', 'child-read', (r) => { leg(r, 'PLLM-3').childRead = ['ok', '']; return r; }],
  ['missing-exists', 'missing', (r) => { r.missingExists = true; return r; }],
  ['missing-exists-null', 'missing', (r) => { r.missingExists = null; return r; }],
  ['missing-other-name', 'missing', (r) => { r.missingPath = path.join(path.dirname(r.missingPath), 'other.txt'); return r; }],
  ['missing-relative', 'missing', (r) => { r.missingPath = 'tabi-r98-missing.txt'; return r; }],
  // mode law
  ['pua-mode-connect', 'leg-arm', (r) => { leg(r, 'PUA-1').mode = 'connect'; return r; }],
  ['plb-mode-launch', 'leg-arm', (r) => { leg(r, 'PLB-1').mode = 'launch'; return r; }],
  ['pllb-not-local', 'leg-arm', (r) => { leg(r, 'PLLB-2').isLocal = false; return r; }],
  ['plb-local', 'leg-arm', (r) => { leg(r, 'PLB-3').isLocal = true; return r; }],
  ['pla-islocal-set', 'leg-arm', (r) => { leg(r, 'PLA-2').isLocal = true; return r; }],
  ['plab-input-path', 'leg-arm', (r) => { leg(r, 'PLAB-3').input = 'path'; return r; }],
  ['pll-input-payload', 'leg-arm', (r) => { leg(r, 'PLL-1').input = 'payload'; return r; }],
  ['pur-lib-swapped', 'leg-arm', (r) => { leg(r, 'PUR-1').lib = 'playwright'; return r; }],
  ['pua-child-same-site', 'leg-arm', (r) => { const l = leg(r, 'PUA-1'); l.childUrl = l.childUrl.replace('localhost', '127.0.0.1'); return r; }],
  // isolation
  ['pua-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'PUA-3').iframeTargets = []; return r; }],
  ['pla-two-iframe-targets', 'iframe-targets', (r) => { const l = leg(r, 'PLA-3'); l.iframeTargets.push({ ...l.iframeTargets[0], targetId: 'B'.repeat(32) }); return r; }],
  ['plab-iframe-target-other-url', 'iframe-targets', (r) => { const l = leg(r, 'PLAB-2'); l.iframeTargets[0].url = l.childUrl.replace('leg=PLAB-2', 'leg=PLAB-1'); return r; }],
  ['pllb-iframe-targets-null', 'iframe-targets', (r) => { leg(r, 'PLLB-1').iframeTargets = null; return r; }],
  ['frames-extra', 'frames', (r) => { const l = leg(r, 'PLB-1'); l.frames = [...l.frames, 'about:blank']; return r; }],
  ['frames-child-swapped', 'frames', (r) => { const l = leg(r, 'PUA-1'); l.frames = [l.frames[0], leg(r, 'PLA-1').childUrl]; return r; }],
  // identity
  ['lib-pp-version', 'libs', (r) => { r.libs['puppeteer-core'].version = '25.15.0'; return r; }],
  ['lib-pw-integrity', 'libs', (r) => { r.libs['playwright-core'].integrity = 'sha512-AAAA'; return r; }],
  ['lib-pp-filesha', 'libs', (r) => { r.libs['puppeteer-core'].fileSha256 = '0'.repeat(64); return r; }],
  ['lib-pp-treesha', 'libs', (r) => { r.libs['puppeteer-core'].treeSha256 = '1'.repeat(64); return r; }],
  ['lib-pw-treefiles', 'libs', (r) => { r.libs['playwright-core'].treeFiles = 117; return r; }],
  ['lib-missing', 'libs', (r) => { delete r.libs['playwright-core']; return r; }],
  ['browser-version-leg', 'browser', (r) => { leg(r, 'PLA-2').browserVersion = 'HeadlessChrome/155.0.8059.84'; return r; }],
  ['client-version-leg', 'browser', (r) => { leg(r, 'PUA-2').clientBrowserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['chromium-string', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['nonce-other', 'nonce', (r) => { r.nonce = 'tabi-r98-other'; return r; }],
  ['driver-pin-other', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['answer-size', 'answer', (r) => { r.answer.size = 23; return r; }],
  ['answer-text', 'answer', (r) => { r.answer.text = 'x'; return r; }],
  ['payload-mime', 'payload', (r) => { r.payload.mimeType = 'application/octet-stream'; return r; }],
  ['payload-missing', 'payload', (r) => { delete r.payload; return r; }],
  ['reps-other', 'reps', (r) => { r.reps = 999; return r; }],
  // leg labels: contradictory duplicate, fabricated label, dropped/reordered leg
  ['leg-duplicate-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'PLB-1'))); d.childEvents = [T('input'), T('change')]; r.legs.splice(5, 0, d); return r; }],
  ['leg-fabricated-label', 'leg-label', (r) => { const l = leg(r, 'PLLB-3'); l.leg = 'PLZB-3'; l.arm = 'PLZB'; return r; }],
  ['leg-dropped', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'PLLM-2'); return r; }],
  ['leg-reordered', 'leg-set', (r) => { const [a, b] = [r.legs[0], r.legs[1]]; r.legs[0] = b; r.legs[1] = a; return r; }],
  ['leg-rep-mismatch', 'leg-label', (r) => { leg(r, 'PLA-2').rep = 1; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'PLA-2').browserId = leg(r, 'PLA-1').browserId; return r; }],
  ['browser-id-not-uuid', 'fresh-browser', (r) => { leg(r, 'PLB-2').browserId = '-'.repeat(36); return r; }],
  ['port-below-1024', 'ports', (r) => { r.ports.http = 80; return r; }],
  ['port-duplicate', 'ports', (r) => { r.ports.child = r.ports.http; return r; }],
  // producer polarity, an ignored producer verdict, a resolved leg carrying a stale error (R97Mut M66 class)
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'PLB-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'PLB-2').error = 'chromium never came up'; return r; }],
  ['producer-pass-ignored', 'child-events', (r) => { r.verdict = 'clean'; r.ok = true; leg(r, 'PLB-1').childEvents = [T('input'), T('change')]; return r; }],
  ['resolved-with-stale-error', 'outcome', (r) => { Object.assign(leg(r, 'PLA-1'), { errName: 'Error', errMessage: 'stale' }); return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r97;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r98-client-oopif-uploadmodes-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
