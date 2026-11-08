#!/usr/bin/env node
// Negative battery: tabi round 92, C1 (`C1-IFRAME-CHOOSER-R92`). Each case mutates a real receipt
// of scripts/chrome-cdp-iframe-chooser-round92.mjs (or substitutes the r91 receipt, the do-nothing
// control) and runs the frozen counter in --receipt mode; a case is killed when the counter exits 1
// AND reports the expected finding id. The `positive` case (unmodified receipt) must exit 0.
// Usage: node negatives-iframe-chooser-round92.mjs --lane <ABS> --receipt <path> --expect-nonce <n>
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
const r91 = path.join(lane, 'corpus/evidence/round91/chromium-showpicker-proxy/receipt.json');
const counter = path.join(lane, 'scripts/check-iframe-chooser-round92.mjs');
fs.mkdirSync(scratch, { recursive: true });
const clone = () => JSON.parse(JSON.stringify(base));
const leg = (r, id) => r.legs.find((l) => l.leg === id);
const cases = [
  ['positive', null, (r) => r],
  ['do-nothing-r91-receipt', 'schema', null],
  ['x-chooser-on-page', 'chooser-session', (r) => { leg(r, 'X-1').choosers[0].session = 'page'; return r; }],
  ['s-chooser-on-iframe', 'chooser-session', (r) => { leg(r, 'S-2').choosers[0].session = 'iframe'; return r; }],
  ['s-has-iframe-target', 'iframe-target-count', (r) => { const l = leg(r, 'S-1'); l.attached.push({ type: 'iframe', targetId: l.childFrameId }); l.iframeTargets.push({ targetId: l.childFrameId, url: l.childUrl, parentFrameId: null }); return r; }],
  ['x-no-iframe-target', 'iframe-target-count', (r) => { const l = leg(r, 'X-2'); l.attached = []; l.iframeTargets = []; return r; }],
  ['x-target-url-wrong', 'iframe-target-url', (r) => { leg(r, 'X-3').iframeTargets[0].url = 'about:blank'; return r; }],
  ['s-browser-iframe-target', 'browser-iframe-targets', (r) => { const l = leg(r, 'S-2'); l.browserIframeTargets = [{ targetId: l.childFrameId, url: l.childUrl }]; return r; }],
  ['x-browser-no-iframe-target', 'browser-iframe-targets', (r) => { leg(r, 'X-3').browserIframeTargets = []; return r; }],
  ['x-target-not-child-frame', 'iframe-target-frame', (r) => { leg(r, 'X-1').childFrameId = 'F'.repeat(32); leg(r, 'X-1').choosers[0].frameId = 'F'.repeat(32); return r; }],
  ['dup-chooser', 'chooser-count', (r) => { const l = leg(r, 'X-1'); l.choosers.push({ ...l.choosers[0], session: 'page' }); return r; }],
  ['no-chooser', 'chooser-count', (r) => { leg(r, 'S-3').choosers = []; return r; }],
  ['chooser-wrong-frame', 'chooser-frame', (r) => { leg(r, 'S-1').choosers[0].frameId = 'E'.repeat(32); return r; }],
  ['answer-error', 'answer-session', (r) => { leg(r, 'X-2').answer.error = 'Node is not a file input element'; return r; }],
  ['x-answer-on-page', 'answer-session', (r) => { leg(r, 'X-3').answer.session = 'page'; return r; }],
  ['empty-files', 'child-files', (r) => { leg(r, 'X-1').childFiles = []; return r; }],
  ['extra-file', 'child-files', (r) => { leg(r, 'S-2').childFiles.push(['other.txt', 1]); return r; }],
  ['wrong-size', 'child-files', (r) => { leg(r, 'S-3').childFiles[0][1] = 21; return r; }],
  ['click-untrusted', 'child-click', (r) => { leg(r, 'X-2').childClicks[0].isTrusted = false; return r; }],
  ['click-missed-child', 'child-click', (r) => { leg(r, 'S-1').childClicks = []; return r; }],
  ['drop-leg', 'leg-set', (r) => { r.legs = r.legs.filter((l) => l.leg !== 'S-3'); return r; }],
  ['dup-leg', 'leg-set', (r) => { r.legs.push(JSON.parse(JSON.stringify(leg(r, 'X-1')))); return r; }],
  ['wrong-nonce', 'nonce', (r) => { r.nonce = 'tabi-r92-forged'; return r; }],
  ['driver-sha-forged', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); return r; }],
  ['chromium-other', 'chromium', (r) => { r.chromium = 'Chromium 154.0.0.0'; return r; }],
  ['cross-host-same-site', 'cross-host', (r) => { r.crossHost = '127.0.0.1'; return r; }],
  ['x-child-host-same-site', 'child-host', (r) => { leg(r, 'X-1').childHost = '127.0.0.1'; return r; }],
  ['x-child-url-same-site', 'child-url', (r) => { const l = leg(r, 'X-2'); l.childUrl = l.childUrl.replace('localhost', '127.0.0.1'); l.iframeTargets[0].url = l.childUrl; return r; }],
  ['leg-error', 'leg-error', (r) => { leg(r, 'S-2').error = 'devtools endpoint never answered'; return r; }],
  ['failures-listed', 'failures', (r) => { r.failures = [{ leg: 'S-2', error: 'x' }]; return r; }],
  ['arm-relabel', 'leg-arm', (r) => { leg(r, 'S-1').arm = 'X'; return r; }],
];
const results = [];
for (const [name, expect, mut] of cases) {
  let file;
  if (mut === null) file = r91;
  else { file = path.join(scratch, name + '.json'); fs.writeFileSync(file, JSON.stringify(mut(clone()))); }
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--expect-driver-sha256', pin, '--receipt', file, '--expect-nonce', nonce], { encoding: 'utf8' });
  let ids = [];
  try { ids = [...new Set(JSON.parse(r.stdout).findings.map((f) => f.id))]; } catch {}
  const killed = expect === null ? r.status === 0 && ids.length === 0 : r.status === 1 && ids.includes(expect);
  results.push({ name, expect, rc: r.status, ids, ok: killed });
}
const fail = results.filter((x) => !x.ok);
const out = { battery: 'tabi-r92-iframe-chooser-negatives', receipt: rcpt, cases: results.length, ok: results.length - fail.length, failed: fail.map((x) => x.name), results };
console.log(argv.includes('--json') ? JSON.stringify(out, null, 2) : JSON.stringify({ cases: out.cases, ok: out.ok, failed: out.failed }));
process.exit(fail.length ? 1 : 0);
