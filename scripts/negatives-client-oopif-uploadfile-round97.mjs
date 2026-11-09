#!/usr/bin/env node
// Negative battery: tabi round 97, C1 (`C1-CLIENT-OOPIF-UPLOADFILE-R97`). Each case mutates a real receipt
// of scripts/client-oopif-uploadfile-round97.mjs (or substitutes the r96 receipt, the do-nothing control)
// and runs the frozen counter in --receipt mode; a case is killed when the counter exits 1 AND reports the
// expected finding id. The `positive` case (unmodified receipt) must exit 0 with zero findings.
// Classes: the trust law (a trusted event claimed on a payload-injected Playwright leg, an untrusted event
// on a Puppeteer/isLocal leg, an event dropped, doubled, reordered or a click added), the fill law (child
// empty, wrong file, wrong size, two files, filled parent), the clear law (clear leg still holding the
// file, clear events claimed trusted), the missing-file law (phantom leg rejected/with size, ENOENT leg
// resolving or filling, other message, other path), the isolation law (iframe target present on a
// same-site leg / absent or doubled on a cross-site leg), identity (version, integrity, file sha, tree
// sha, tree file count, missing library, browser), the leg arm fields (isLocal/call/lib swapped),
// contradictory duplicate and fabricated leg labels, ports, and producer polarity (failures without leg
// errors, leg errors without failures, an ignored producer verdict) — tabi r63 binding classes.
// Usage: node negatives-client-oopif-uploadfile-round97.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r96 = path.join(lane, 'corpus/evidence/round96/client-oopif-filechooser/receipt.json');
const counter = path.join(lane, 'scripts/check-client-oopif-uploadfile-round97.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l && l.leg === id);
const ANS = () => [[base.answer.name, base.answer.size]];
const T = (t) => [t, true];
const U = (t) => [t, false];
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r96-receipt', 'schema', null],
  // trust law
  ['plx-trusted-claimed', 'child-events', (r) => { leg(r, 'PLX-1').childEvents = [T('input'), T('change')]; return r; }],
  ['pls-trusted-claimed', 'child-events', (r) => { leg(r, 'PLS-2').childEvents = [T('input'), T('change')]; return r; }],
  ['pux-untrusted', 'child-events', (r) => { leg(r, 'PUX-1').childEvents = [U('input'), U('change')]; return r; }],
  ['pus-change-untrusted', 'child-events', (r) => { leg(r, 'PUS-3').childEvents = [T('input'), U('change')]; return r; }],
  ['pll-untrusted', 'child-events', (r) => { leg(r, 'PLL-2').childEvents = [U('input'), U('change')]; return r; }],
  ['pux-input-dropped', 'child-events', (r) => { leg(r, 'PUX-2').childEvents = [T('change')]; return r; }],
  ['pux-events-doubled', 'child-events', (r) => { leg(r, 'PUX-3').childEvents = [T('input'), T('change'), T('input'), T('change')]; return r; }],
  ['pll-events-reordered', 'child-events', (r) => { leg(r, 'PLL-1').childEvents = [T('change'), T('input')]; return r; }],
  ['plx-click-added', 'child-events', (r) => { leg(r, 'PLX-3').childEvents = [T('click'), U('input'), U('change')]; return r; }],
  ['pux-events-null', 'child-events', (r) => { leg(r, 'PUX-1').childEvents = null; return r; }],
  // fill law
  ['pux-child-empty', 'child-files', (r) => { leg(r, 'PUX-1').childFiles = []; return r; }],
  ['plx-child-wrong-file', 'child-files', (r) => { leg(r, 'PLX-2').childFiles = [['other.txt', 22]]; return r; }],
  ['pll-child-wrong-size', 'child-files', (r) => { leg(r, 'PLL-3').childFiles = [[base.answer.name, 0]]; return r; }],
  ['pus-two-files', 'child-files', (r) => { leg(r, 'PUS-1').childFiles = [...ANS(), ...ANS()]; return r; }],
  ['pux-parent-filled', 'parent-files', (r) => { leg(r, 'PUX-2').parentFiles = ANS(); return r; }],
  ['plx-parent-filled', 'parent-files', (r) => { leg(r, 'PLX-1').parentFiles = ANS(); return r; }],
  // clear law
  ['puc-still-filled', 'child-files', (r) => { leg(r, 'PUC-1').childFiles = ANS(); return r; }],
  ['puc-clear-trusted', 'child-events', (r) => { leg(r, 'PUC-2').childEvents = [T('input'), T('change'), T('input'), T('change')]; return r; }],
  ['puc-clear-events-missing', 'child-events', (r) => { leg(r, 'PUC-3').childEvents = [T('input'), T('change')]; return r; }],
  // missing-file law
  ['pum-rejected', 'outcome', (r) => { Object.assign(leg(r, 'PUM-1'), { outcome: 'error', errName: 'Error', errMessage: 'ENOENT' }); return r; }],
  ['pum-nonzero-size', 'child-files', (r) => { leg(r, 'PUM-2').childFiles = [['tabi-r97-missing.txt', 22]]; return r; }],
  ['pum-empty', 'child-files', (r) => { leg(r, 'PUM-3').childFiles = []; return r; }],
  ['pum-no-events', 'child-events', (r) => { leg(r, 'PUM-1').childEvents = []; return r; }],
  ['plm-resolved', 'outcome', (r) => { Object.assign(leg(r, 'PLM-1'), { outcome: 'resolved', errName: null, errMessage: null }); return r; }],
  ['plm-phantom-filled', 'child-files', (r) => { leg(r, 'PLM-2').childFiles = [['tabi-r97-missing.txt', 0]]; return r; }],
  ['plm-other-message', 'outcome', (r) => { leg(r, 'PLM-3').errMessage = 'Error: file not found'; return r; }],
  ['plm-other-path', 'outcome', (r) => { leg(r, 'PLM-1').errMessage = "ENOENT: no such file or directory, stat '/tmp/tabi-r97-missing.txt'"; return r; }],
  ['plm-events', 'child-events', (r) => { leg(r, 'PLM-2').childEvents = [U('input'), U('change')]; return r; }],
  ['missing-exists', 'missing', (r) => { r.missingExists = true; return r; }],
  ['missing-other-name', 'missing', (r) => { r.missingPath = path.join(path.dirname(r.missingPath), 'other.txt'); return r; }],
  ['missing-relative', 'missing', (r) => { r.missingPath = 'tabi-r97-missing.txt'; return r; }],
  // isolation law
  ['pus-iframe-target', 'iframe-targets', (r) => { const l = leg(r, 'PUS-1'); l.iframeTargets = [{ targetId: 'A'.repeat(32), url: l.childUrl }]; return r; }],
  ['pux-no-iframe-target', 'iframe-targets', (r) => { leg(r, 'PUX-3').iframeTargets = []; return r; }],
  ['plx-two-iframe-targets', 'iframe-targets', (r) => { const l = leg(r, 'PLX-3'); l.iframeTargets.push({ ...l.iframeTargets[0], targetId: 'B'.repeat(32) }); return r; }],
  ['pll-iframe-target-other-url', 'iframe-targets', (r) => { const l = leg(r, 'PLL-2'); l.iframeTargets[0].url = l.childUrl.replace('leg=PLL-2', 'leg=PLL-1'); return r; }],
  ['frames-extra', 'frames', (r) => { const l = leg(r, 'PLS-1'); l.frames = [...l.frames, 'about:blank']; return r; }],
  ['frames-child-swapped', 'frames', (r) => { const l = leg(r, 'PUX-1'); l.frames = [l.frames[0], leg(r, 'PUS-1').childUrl]; return r; }],
  // identity
  ['lib-pp-version', 'libs', (r) => { r.libs['puppeteer-core'].version = '25.15.0'; return r; }],
  ['lib-pw-integrity', 'libs', (r) => { r.libs['playwright-core'].integrity = 'sha512-AAAA'; return r; }],
  ['lib-pp-filesha', 'libs', (r) => { r.libs['puppeteer-core'].fileSha256 = '0'.repeat(64); return r; }],
  ['lib-pp-treesha', 'libs', (r) => { r.libs['puppeteer-core'].treeSha256 = '1'.repeat(64); return r; }],
  ['lib-pw-treefiles', 'libs', (r) => { r.libs['playwright-core'].treeFiles = 117; return r; }],
  ['lib-missing', 'libs', (r) => { delete r.libs['playwright-core']; return r; }],
  ['browser-version-leg', 'browser', (r) => { leg(r, 'PLS-2').browserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['client-version-leg', 'browser', (r) => { leg(r, 'PUS-2').clientBrowserVersion = 'Chrome/154.0.0.0'; return r; }],
  ['chromium-string', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['cross-host-same', 'cross-host', (r) => { r.crossHost = '127.0.0.1'; return r; }],
  ['nonce-other', 'nonce', (r) => { r.nonce = 'tabi-r97-other'; return r; }],
  ['driver-pin-other', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['answer-size', 'answer', (r) => { r.answer.size = 23; return r; }],
  // arm fields
  ['leg-arm-islocal-flipped', 'leg-arm', (r) => { leg(r, 'PLX-1').isLocal = true; return r; }],
  ['leg-arm-pll-not-local', 'leg-arm', (r) => { leg(r, 'PLL-1').isLocal = false; return r; }],
  ['leg-arm-call-swapped', 'leg-arm', (r) => { leg(r, 'PUC-1').call = 'upload'; return r; }],
  ['leg-arm-lib-swapped', 'leg-arm', (r) => { leg(r, 'PLX-2').lib = 'puppeteer'; return r; }],
  ['leg-arm-cross-flag', 'leg-arm', (r) => { leg(r, 'PUS-1').cross = true; return r; }],
  ['leg-arm-child-host', 'leg-arm', (r) => { const l = leg(r, 'PUX-1'); l.childHost = '127.0.0.1'; l.childUrl = l.childUrl.replace('localhost', '127.0.0.1'); return r; }],
  // leg labels: contradictory duplicate, fabricated label, dropped/reordered leg
  ['leg-duplicate-contradictory', 'leg-set', (r) => { const d = JSON.parse(JSON.stringify(leg(r, 'PLX-1'))); d.childEvents = [T('input'), T('change')]; r.legs.splice(5, 0, d); return r; }],
  ['leg-fabricated-label', 'leg-label', (r) => { const l = leg(r, 'PLS-3'); l.leg = 'PLZ-3'; l.arm = 'PLZ'; return r; }],
  ['leg-dropped', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'PLM-2'); return r; }],
  ['leg-reordered', 'leg-set', (r) => { const [a, b] = [r.legs[0], r.legs[1]]; r.legs[0] = b; r.legs[1] = a; return r; }],
  ['leg-rep-mismatch', 'leg-label', (r) => { leg(r, 'PUS-2').rep = 1; return r; }],
  ['browser-reused', 'fresh-browser', (r) => { leg(r, 'PLX-2').browserId = leg(r, 'PLX-1').browserId; return r; }],
  ['browser-id-not-uuid', 'fresh-browser', (r) => { leg(r, 'PLX-2').browserId = '-'.repeat(36); return r; }],
  ['port-below-1024', 'ports', (r) => { r.ports.http = 80; return r; }],
  ['port-duplicate', 'ports', (r) => { r.ports.child = r.ports.http; return r; }],
  // producer polarity and an ignored producer verdict
  ['failures-listed-legs-clean', 'failures', (r) => { r.failures = [{ leg: 'PLS-2', error: 'x' }]; return r; }],
  ['leg-error-failures-empty', 'failures', (r) => { leg(r, 'PLS-2').error = 'devtools endpoint never answered'; return r; }],
  ['producer-pass-ignored', 'child-events', (r) => { r.verdict = 'clean'; r.ok = true; leg(r, 'PLX-1').childEvents = [T('input'), T('change')]; return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r96;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r97-client-oopif-uploadfile-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
