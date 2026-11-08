#!/usr/bin/env node
// Negatives for check-showpicker-proxy-round91.mjs (round-91 C1 leg (b)). Each case mutates ONE
// field of the scored receipt and asserts the counter refuses it with a named finding; the
// unmutated receipt is the positive control (exit 0).
//
// Usage:
//   node negatives-showpicker-proxy-round91.mjs --lane <ABS lane> --real <scored.json>
//     --expect-driver-sha256 <hex> --expect-nonce <tabi-r91-...>
//     --expect-parent-sha256 <hex> --expect-same-sha256 <hex> --expect-child-sha256 <hex>
//     --prior-set <file> --work <scratch> [--counter <path>] [--json]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
const realPath = opt('real');
const work = opt('work');
const counter = opt('counter') || path.join(path.dirname(SELF), 'check-showpicker-proxy-round91.mjs');
const pins = {
  driver: opt('expect-driver-sha256'), nonce: opt('expect-nonce'),
  parent: opt('expect-parent-sha256'), same: opt('expect-same-sha256'), child: opt('expect-child-sha256'),
};
const priorSet = opt('prior-set');
if (!lane || !realPath || !work || !priorSet) {
  process.stdout.write(JSON.stringify({ schema: 'tabi-r91-proxy-battery', verdict: 'usage', detail: '--lane --real --work --prior-set are required' }) + '\n');
  process.exit(2);
}
fs.mkdirSync(work, { recursive: true });
const real = JSON.parse(fs.readFileSync(realPath, 'utf8'));
const clone = () => JSON.parse(JSON.stringify(real));
const leg = (r, name) => (r.legs || []).find((l) => l && l.name === name);

const CASES = [
  { id: 'control-clean', expect: null },
  { id: 'schema', expect: 'schema', mutate: (r) => { r.schema = 'not-the-schema'; } },
  { id: 'lane', expect: 'lane', mutate: (r) => { r.lane = 'not-tabi'; } },
  { id: 'nonce-shape', expect: 'nonce-shape', mutate: (r) => { r.nonce = 'bad nonce'; } },
  { id: 'nonce-expected', expect: 'nonce-expected', mutate: (r) => { r.nonce = 'tabi-r91-other-0001'; } },
  { id: 'receipt-fields', expect: 'receipt-fields', mutate: (r) => { r.extra = true; } },
  { id: 'driver-pin', expect: 'driver-pin', mutate: (r) => { r.driverSha256 = 'b'.repeat(64); } },
  { id: 'fixture-parent-pin', expect: 'fixture-pins', mutate: (r) => { r.fixture.parent.sha256 = 'b'.repeat(64); } },
  { id: 'fixture-same-pin', expect: 'fixture-pins', mutate: (r) => { r.fixture.same.sha256 = 'b'.repeat(64); } },
  { id: 'fixture-origin', expect: 'ports-declared', mutate: (r) => { r.fixture.same.origin = 'http://127.0.0.1:1'; } },
  { id: 'host-chromium', expect: 'host-chromium', mutate: (r) => { r.host.chromium = 'Chromium 1'; } },
  { id: 'plan-drop', expect: 'plan-frozen', mutate: (r) => { r.legs.pop(); } },
  { id: 'plan-target', expect: 'plan-frozen', mutate: (r) => { leg(r, 'sp91-xo-proxy-file-childact').target = 'dt'; } },
  { id: 'plan-order', expect: 'leg-order', mutate: (r) => { const a = r.legs; [a[0], a[1]] = [a[1], a[0]]; } },
  { id: 'leg-keys', expect: 'leg-records', mutate: (r) => { leg(r, 'sp91-so-direct-noact').extra = 1; } },
  { id: 'leg-errors', expect: 'leg-records', mutate: (r) => { leg(r, 'sp91-so-direct-noact').errors = ['x']; } },
  { id: 'leg-marks', expect: 'leg-marks', mutate: (r) => { leg(r, 'sp91-so-direct-noact').lateAfterClose = 1; } },
  { id: 'leg-marks-order', expect: 'leg-marks', mutate: (r) => { leg(r, 'sp91-so-direct-noact').marks[0].name = 'wrong'; } },
  { id: 'frame-ids', expect: 'frame-tree', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.soFrameId = 'C'.repeat(32); } },
  { id: 'context-binding', expect: 'context-binding', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.childContextId = 9999; } },
  { id: 'same-element', expect: 'same-element-law', mutate: (r) => { r.elements.xo.elements[0].accept = 'image/png'; } },
  { id: 'same-element-leg', expect: 'same-element-law', mutate: (r) => { r.legs[0].elements.xo.elements[0].accept = 'image/png'; } },
  { id: 'send-log-expression', expect: 'send-log-allowlist', mutate: (r) => { leg(r, 'sp91-so-direct-noact').cdpSendLog.push({ id: leg(r, 'sp91-so-direct-noact').cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'document.cookie', returnByValue: true } }); } },
  { id: 'plan-calls-post', expect: 'plan-calls', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-childact'); l.cdpSendLog = l.cdpSendLog.filter((c) => !(c.method === 'Runtime.evaluate' && /postMessage/.test(c.params.expression || ''))); } },
  { id: 'chooser-frame', expect: 'chooser-event-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-childact'); l.choosers[0].params.frameId = l.soFrameId; } },
  { id: 'chooser-binding', expect: 'chooser-event-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-childact'); l.choosers[0].afterSendId = l.choosers[0].afterSendId + 10; } },
  { id: 'direct-law', expect: 'law', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.direct = { ok: false, name: 'SecurityError', message: 'x' }; } },
  { id: 'proxy-law', expect: 'proxy-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-noact'); l.proxy = { ...l.proxy, ok: true, ret: 'undefined' }; } },
  { id: 'law-proxy-message', expect: 'law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-noact'); l.proxy = { ...l.proxy, message: 'forged message' }; l.replies[0].data.result = l.proxy; } },
  { id: 'proxy-log-origin', expect: 'proxy-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-childact'); l.proxyLog[0].origin = 'http://127.0.0.1:1'; } },
  { id: 'activation-law', expect: 'activation-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-parentact'); l.childActivationAfter = { isActive: true, hasBeenActive: true }; } },
  { id: 'activation-parent', expect: 'activation-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-parentact'); l.activationAfter = { isActive: false, hasBeenActive: true }; } },
  { id: 'state-parent', expect: 'state-law', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.parentState = [['x', 1, 'text/plain']]; } },
  { id: 'state-answer', expect: 'state-law', mutate: (r) => { const l = leg(r, 'sp91-xo-proxy-file-answer'); l.childState = []; } },
  { id: 'state-child', expect: 'state-law', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.childState = [['x', 1, 'text/plain']]; } },
  { id: 'event-shape', expect: 'event-shape', mutate: (r) => { const l = leg(r, 'sp91-so-direct-parentact'); l.pageEvents.pop(); } },
  { id: 'event-untrusted', expect: 'event-shape', mutate: (r) => { const l = leg(r, 'sp91-so-direct-parentact'); l.pageEvents[0].isTrusted = false; } },
  { id: 'cross-access', expect: 'law', mutate: (r) => { const l = leg(r, 'sp91-xo-direct-access'); l.crossAccess.windowDocument = 'object'; } },
  { id: 'argv', expect: 'host-argv', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.argv = l.argv.slice(0, -1); } },
  { id: 'teardown', expect: 'teardown-closure', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.teardown.survivors = [1234]; } },
  { id: 'server-log', expect: 'host-argv', mutate: (r) => { const l = leg(r, 'sp91-so-direct-noact'); l.serverLog.find((s) => s.path === '/').run = 'other'; } },
  { id: 'run-window', expect: 'run-window', mutate: (r) => { r.finishedAt = r.startedAt; } },
  { id: 'prior-laws', expect: 'prior-set', mutate: (r) => { const l = leg(r, 'sp91-so-proxy-childact'); l.proxy = { ok: true, ret: 'undefined', target: 's', origin: 'http://127.0.0.1:19901' }; l.proxy.ok = true; l.childState = []; l.choosers = []; } },
  { id: 'replay-token', expect: 'replay-identity', mutate: (r) => { const pp = fs.readFileSync(priorSet, 'utf8').split('\n').filter((x) => x.trim() && !x.trim().startsWith('#'))[0]; const p = JSON.parse(fs.readFileSync(path.isAbsolute(pp) ? pp : path.join(lane, pp), 'utf8')); if (p && p.legs && p.legs[0]) leg(r, 'sp91-so-direct-noact').launchToken = p.legs[0].launchToken; } },
];

const results = [];
for (const c of CASES) {
  const receipt = clone();
  if (c.mutate) c.mutate(receipt);
  const p = path.join(work, 'case-' + c.id + '.json');
  fs.writeFileSync(p, JSON.stringify(receipt));
  const r = spawnSync(process.execPath, [counter, '--lane', lane, '--receipt', p,
    '--expect-driver-sha256', pins.driver, '--expect-nonce', pins.nonce,
    '--expect-parent-sha256', pins.parent, '--expect-same-sha256', pins.same, '--expect-child-sha256', pins.child,
    '--prior-set', priorSet, '--json'], { encoding: 'utf8', timeout: 180000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  const ids = j && j.findings ? j.findings.map((f) => f.id) : [];
  if (c.expect === null) {
    const ok = r.status === 0 && j && j.verdict === 'clean';
    results.push({ id: c.id, ok, exit: r.status, verdict: j && j.verdict, findings: ids, expect: 'clean' });
  } else {
    const ok = r.status === 1 && ids.includes(c.expect);
    results.push({ id: c.id, ok, exit: r.status, verdict: j && j.verdict, findings: ids, expect: c.expect });
  }
}
const failed = results.filter((x) => !x.ok);
const payload = { schema: 'tabi-r91-proxy-battery', cases: results.length, failed: failed.length, ok: failed.length === 0, results };
process.stdout.write(JSON.stringify(payload, null, asJson ? 1 : 0) + '\n');
process.exit(failed.length === 0 ? 0 : 1);
