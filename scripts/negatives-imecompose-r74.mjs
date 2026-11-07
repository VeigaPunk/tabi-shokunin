#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-imecompose-r74.mjs (tabi round 74, C1).
// Usage: node negatives-imecompose-r74.mjs --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <the real receipt's expected nonce> --prior <receipt.json> [--prior ...]
//          --work <ABS scratch dir> [--laundered <degenerate receipt.json> ...] [--json]
// Structure carried from the round-73 pinch battery: every case mutates the real receipt and runs
// the counter BY PATH (the counter beside this file); unless the case targets
// legshape-consistency the producer's legShape is LAUNDERED (recomputed from the counter's own
// re-derivation) so the summary check cannot fire on the mutation's behalf. A refusal case passes
// only when the counter exits 1, lists the expected id and lists NO other id except those the
// case names in `alsoAllowed`. MUST-ACCEPT cases must exit 0 with no finding. Every result names
// the counter line of the check it expects (`counterLine`). Coverage: every check id the counter
// declares must be the expected id of >= 1 refusal case. Laundered degenerate receipts (control
// receipts relabelled as clean scored runs) must be refused for their expected id.
// New for r74: replay cases for the near-match timeline (a 1e-12 perturbation, R73Review1 1.4;
// a sub-quantum shift) and must-accept priors one quantum away.
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-imecompose-r74.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work'); const expectNonce = opt('expect-nonce');
const priorPaths = multi('prior');
if (!realPath || !pin || !work || !path.isAbsolute(work) || !expectNonce || priorPaths.length === 0) usage('--real, --expect-driver-sha256, --expect-nonce, >= 1 --prior and an absolute --work are required');
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
fs.mkdirSync(work, { recursive: true });
const counterSrc = fs.readFileSync(COUNTER, 'utf8').split('\n');
const lineOf = (id) => { const i = counterSrc.findIndex((l) => l.includes(`check('${id}'`) || (id.startsWith('leg-') && l.includes('check(`leg-${name}-' + id.split('-').slice(-1)[0] + '`'))); return i >= 0 ? i + 1 : null; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const LEGS = ['start', 'focus-f', 'compose-a', 'compose-b', 'commit', 'plain', 'select-f', 'compose-c', 'replace-half', 'cancel', 'focus-ce', 'ce-compose', 'ce-commit', 'blur', 'nofocus-compose', 'nofocus-insert'];
const FOCUS = new Set(['focusin', 'focusout']);
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && !FOCUS.has(e.type) && pred(e));
const legIdx = (r, leg) => r.legs.findIndex((l) => l.name === leg);
const markAt = (r, leg) => r.legMarks[LEGS.indexOf(leg) + 1].at;
const nextMarkAt = (r, leg) => { const i = LEGS.indexOf(leg) + 2; return i < r.legMarks.length ? r.legMarks[i].at : r.closedAt; };
const insertAt = (r, leg, ev) => {
  // insert after the last event at or before `leg`, inside that leg's page-time window, on the
  // 0.1 ms grid, with strict types, so only the per-leg checks the case names can fire
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  const prev = idx >= 0 ? r.events[idx] : null;
  const at = Math.round((Math.max(prev ? prev.at : 0, markAt(r, leg)) + 0.1) * 10) / 10;
  if (at > nextMarkAt(r, leg)) throw new Error('insertAt: no room in leg window ' + leg);
  r.events.splice(idx + 1, 0, { type: 'input', seq: 0, leg, ts: at, at, isTrusted: true, data: 'q', inputType: 'insertText', isComposing: false, key: null, target: 'f', value: 'q', selStart: 1, selEnd: 1, ...ev });
  return renumber(r);
};
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], launder = true, opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, launder, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], launder: true, accept: true, opts });
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };
const perLeg = (leg) => ['seq', 'trusted', 'data', 'composing', 'target'].map((k) => `leg-${leg}-${k}`);

// ---- identity and run binding ----
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-imecompose-r73'; });
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { s.run = to; });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.replace(JSON.stringify(old), JSON.stringify(to)); }
};
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r74-x'); }, ['nonce-expected', 'fixture-hash']);
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r74-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'exec-command'; });
add('degenerate-field-absent', 'scored-run-not-degenerate', (r) => { delete r.degenerate; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { s.run = 'tabi-r74-other'; }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('fixture-hash-absent', 'fixture-hash', (r) => { delete r.fixture.sha256; });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Firefox 140.0'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
add('run-window-short', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 3000).toISOString(); });
add('run-window-long', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[2].params.text = 'x'; });
add('plan-frozen-dropped-leg', 'plan-frozen', (r) => { r.plan.splice(8, 1); });
add('leg-order', 'leg-order', (r) => { r.legs.push(clone(r.legs[1])); }, ['leg-params']);
add('leg-order-swap-empty', 'leg-order', (r) => { [r.legs[13].name, r.legs[14].name] = [r.legs[14].name, r.legs[13].name]; }, ['leg-params']);
add('leg-params', 'leg-params', (r) => { r.legs[2].params.text = 'q'; });
add('leg-params-cmd', 'leg-params', (r) => { r.legs[4].cmd = 'Input.imeSetComposition'; });
add('leg-params-elapsed-string', 'leg-params', (r) => { r.legs[2].elapsedMs = '300'; });
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 999; });
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; }, ['event-leg-window', 'focus-events-bound']);
add('event-leg-fabricated-label', 'event-leg-domain', (r) => { r.events.find((e) => e.type === 'focusin').leg = 'focus-f2'; }, ['event-leg-window']);
add('event-types-ts-string', 'event-types', (r) => { evsOf(r, 'plain')[0].ts = String(evsOf(r, 'plain')[0].ts); }, ['event-time-quantum']);
add('event-types-trusted-string', 'event-types', (r) => { evsOf(r, 'compose-b')[0].isTrusted = 'true'; }, ['leg-compose-b-trusted', 'trust-law']);
add('event-types-unknown-type', 'event-types', (r) => { evsOf(r, 'plain')[1].type = 'textinput'; }, ['leg-plain-seq']);
add('event-types-data-number', 'event-types', (r) => { evsOf(r, 'plain')[1].data = 7; }, ['leg-plain-data']);
add('event-types-sel-string', 'event-types', (r) => { evsOf(r, 'compose-b')[0].selStart = '0'; });
add('event-time-quantum', 'event-time-quantum', (r) => { evsOf(r, 'plain')[0].ts += 0.03; });
add('event-time-quantum-at', 'event-time-quantum', (r) => { evsOf(r, 'commit')[2].at += 0.03; });
add('leg-marks-late', 'leg-marks', (r) => { r.lateAfterClose = 1; }, ['event-leg-window']);
add('leg-marks-fabricated-name', 'leg-marks', (r) => { r.legMarks[3].name = 'compose-x'; }, ['event-leg-window']);
add('leg-marks-closed-early', 'leg-marks', (r) => { r.closedAt = r.legMarks[r.legMarks.length - 1].at - 1; }, ['event-leg-window']);
add('event-leg-window-late-label', 'event-leg-window', (r) => { const e = evsOf(r, 'compose-b'); e[e.length - 1].at = Math.round((markAt(r, 'commit') + 0.1) * 10) / 10; });
add('event-leg-window-order', 'event-leg-window', (r) => { const e = evsOf(r, 'commit'); e[3].at = Math.round((e[2].at - 0.1) * 10) / 10; });
// ---- producer: IME calls and the closed send-log allow-list ----
const imeIdx = (r) => r.cdpSendLog.map((c, i) => (/^Input\.(imeSetComposition|insertText)$/.test(c.method) ? i : -1)).filter((i) => i >= 0);
add('ime-call-count', 'ime-call-count', (r) => { r.cdpSendLog.splice(imeIdx(r)[3], 1); r.cdpSendLog.forEach((c, k) => { c.id = k + 1; }); }, ['ime-call-params']);
add('ime-call-duplicate', 'ime-call-count', (r) => { pushSend(r, 'Input.insertText', { text: 'ab' }); }, ['ime-call-params']);
add('ime-call-params', 'ime-call-params', (r) => { r.cdpSendLog[imeIdx(r)[0]].params.text = 'x'; });
add('ime-call-order', 'ime-call-params', (r) => { const [a, b] = imeIdx(r); const t = r.cdpSendLog[a]; r.cdpSendLog[a] = { ...r.cdpSendLog[b], id: t.id }; r.cdpSendLog[b] = { ...t, id: r.cdpSendLog[b].id }; });
add('ime-method-suffix', 'ime-call-count', (r) => { r.cdpSendLog[imeIdx(r)[2]].method = 'Input.insertTextX'; }, ['ime-call-params', 'send-log-allowlist']);
const LOOK = [
  ['dispatch-key-char', 'Input.dispatchKeyEvent', { type: 'char', text: 'a' }],
  ['dispatch-key-down', 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Process', windowsVirtualKeyCode: 229 }],
  ['case-variant', 'input.insertText', { text: 'a' }],
  ['commit-composition', 'Input.imeCommitComposition', {}],
  ['dom-focus', 'DOM.focus', { nodeId: 3 }],
  ['ignore-input', 'Input.setIgnoreInputEvents', { ignore: true }],
  ['focus-emulation', 'Emulation.setFocusEmulationEnabled', { enabled: true }],
  ['layout-metrics', 'Page.getLayoutMetrics', {}],
  ['exec-command', 'Runtime.evaluate', { expression: 'document.execCommand("insertText", false, "a")', returnByValue: true }],
  ['script-composition', 'Runtime.evaluate', { expression: 'document.activeElement.dispatchEvent(new CompositionEvent("compositionstart"))', returnByValue: true }],
  ['value-assign', 'Runtime.evaluate', { expression: 'document.getElementById("f").value = "x"', returnByValue: true }],
  ['events-push', 'Runtime.evaluate', { expression: 'window.__events.push({type:"input"})', returnByValue: true }],
  ['select-other', 'Runtime.evaluate', { expression: 'window.__select("f", 0, 4)', returnByValue: true }],
  ['call-function-on', 'Runtime.callFunctionOn', { functionDeclaration: 'function(){document.execCommand("insertText",false,"a")}' }],
];
for (const [n, m, p] of LOOK) add('lookalike-' + n, 'send-log-allowlist', (r) => { pushSend(r, m, p); });
add('allowlist-dmo-scale-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Emulation.setDeviceMetricsOverride').params.scale = 2; });
add('allowlist-eval-extra-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Runtime.evaluate').params.awaitPromise = true; });
add('allowlist-navigate-other-run', 'send-log-allowlist', (r) => { const c = r.cdpSendLog.find((x) => x.method === 'Page.navigate'); c.params.url = c.params.url.replace('?run=', '?run=x'); });
add('allowlist-navigate-twice', 'send-log-allowlist', (r) => { pushSend(r, 'Page.navigate', clone(r.cdpSendLog.find((x) => x.method === 'Page.navigate').params)); });
add('allowlist-id-gap', 'send-log-allowlist', (r) => { r.cdpSendLog[5].id += 100; });
add('allowlist-params-absent', 'send-log-allowlist', (r) => { delete r.cdpSendLog.find((x) => x.method === 'Page.enable').params; });
add('teardown-closure', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; });
add('teardown-sweep-count', 'teardown-closure', (r) => { r.teardown.postKillSweepCount = 1; });
add('teardown-port-open', 'teardown-closure', (r) => { r.teardown.portProbes.devtools = 'open'; });
add('failures-empty', 'failures-empty', (r) => { r.failures.push({ id: 'drive-error', detail: 'x' }); });
// ---- producer-verdict polarity (r62 M5): every non-(true, 'CONFIRMED') pair ----
const POL = [['false-CONFIRMED', false, 'CONFIRMED'], ['true-REFUTED', true, 'REFUTED'], ['false-REFUTED', false, 'REFUTED'], ['null-CONFIRMED', null, 'CONFIRMED'],
  ['string-true', 'true', 'CONFIRMED'], ['one', 1, 'CONFIRMED'], ['true-UNKNOWN', true, 'UNKNOWN'], ['true-lowercase', true, 'confirmed'], ['true-UNMEASURED', true, 'UNMEASURED'], ['true-null', true, null]];
for (const [n, p, h] of POL) add('producer-verdict-' + n, 'producer-verdict', (r) => { r.predicate = p; r.imeComposeHypothesis = h; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape.commit.data[0] = 'x'; }, [], false);
add('legshape-fabricated-leg', 'legshape-consistency', (r) => { r.legShape.extra = r.legShape.commit; }, [], false);
// ---- replay refusal (QUALITY 136/138; R73Review1 1.4) ----
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { x.host.launchToken = x.host.launchToken.slice(0, -1) + (x.host.launchToken.endsWith('0') ? '1' : '0'); };
const shiftTs = (x, d) => { x.events.forEach((e) => { e.ts = Math.round((e.ts + d) * 1e6) / 1e6; e.at = Math.round((e.at + d) * 1e6) / 1e6; }); };
add('nonce-expected', 'nonce-expected', () => {}, [], true, { nonce: 'tabi-r74-other' });
add('replay-byte-identical', 'replay-launch-token', () => {}, REPLAY, true, { priorReal: true });
add('replay-nonce-stamps-rewritten', 'replay-launch-token', (r) => {
  rewriteNonce(r, 'tabi-r74-replay-x');
  for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString();
}, [...REPLAY, 'fixture-hash'], true, { priorReal: true, nonce: 'tabi-r74-replay-x' });
add('replay-token-only-shared', 'replay-launch-token', () => {}, [], true, { prior: (p) => { swapUrl(p); shiftTs(p, 1); return p; } });
add('replay-url-only-shared', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); shiftTs(p, 1); return p; } });
add('replay-timeline-only-shared', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { swapToken(p); swapUrl(p); return p; } });
add('replay-timeline-1e-12', 'replay-event-timeline', (r) => { r.events[7].ts += 1e-12; }, [], true, { prior: (p) => { swapToken(p); swapUrl(p); return p; } });
add('replay-timeline-sub-quantum', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { swapToken(p); swapUrl(p); shiftTs(p, 0.04); return p; } });
add('replay-launch-token-shape', 'replay-launch-token', (r) => { r.host.launchToken = 'x'; });
// ---- cross-leg laws ----
add('chain-update-data', 'composition-data-chain', (r) => { evsOf(r, 'commit')[0].data = 'x'; }, ['leg-commit-data']);
add('chain-end-data', 'composition-data-chain', (r) => { const e = evsOf(r, 'ce-commit'); e[e.length - 1].data = 'x'; }, ['leg-ce-commit-data']);
add('chain-unclosed', 'composition-data-chain', (r) => { const e = evsOf(r, 'cancel'); r.events.splice(r.events.indexOf(e[e.length - 1]), 1); renumber(r); }, perLeg('cancel').filter((x) => !x.endsWith('target')).concat(['trust-law']));
add('chain-start-inside-session', 'composition-data-chain', (r) => { evsOf(r, 'compose-b')[0].type = 'compositionstart'; }, ['leg-compose-b-seq', 'compositionstart-selected-text']);
add('composing-by-input-type', 'composing-by-input-type', (r) => { evsOf(r, 'plain')[0].isComposing = true; }, ['leg-plain-composing']);
add('composing-other-input-type', 'composing-by-input-type', (r) => { evsOf(r, 'plain')[2].inputType = 'insertReplacementText'; }, ['leg-plain-seq']);
add('trust-law-update-untrusted', 'trust-law', (r) => { evsOf(r, 'ce-compose')[1].isTrusted = false; }, ['leg-ce-compose-trusted']);
add('trust-law-end-trusted', 'trust-law', (r) => { const e = evsOf(r, 'commit'); e[e.length - 1].isTrusted = true; }, ['leg-commit-trusted']);
add('trust-law-focus-untrusted', 'trust-law', (r) => { r.events.find((e) => e.type === 'focusout').isTrusted = false; });
add('compositionstart-selected-text', 'compositionstart-selected-text', (r) => { evsOf(r, 'compose-c')[0].selEnd = 3; });
add('compositionstart-data', 'compositionstart-selected-text', (r) => { evsOf(r, 'compose-c')[0].data = 'a'; }, ['leg-compose-c-data']);
add('compositionstart-all-empty', 'compositionstart-selected-text', (r) => { const s = evsOf(r, 'compose-c')[0]; s.data = ''; s.selEnd = s.selStart; }, ['leg-compose-c-data']);
add('chain-session-dropped', 'composition-data-chain', (r) => { r.events = r.events.filter((e) => !((e.leg === 'ce-compose' || e.leg === 'ce-commit') && !FOCUS.has(e.type))); renumber(r); }, [...perLeg('ce-compose'), ...perLeg('ce-commit'), 'compositionstart-selected-text']);
add('no-keyboard-events', 'no-keyboard-events', (r) => { insertAt(r, 'plain', { type: 'keydown', data: undefined, inputType: null, isComposing: false, key: 'a' }); }, perLeg('plain'));
add('focus-events-bound', 'focus-events-bound', (r) => { r.events.find((e) => e.type === 'focusout').target = 'BODY'; });
add('focus-events-leg', 'focus-events-bound', (r) => { const fo = r.events.filter((e) => e.type === 'focusout'); fo[fo.length - 1].leg = 'nofocus-compose'; }, ['event-leg-window']);
// ---- per-leg checks ----
for (const leg of LEGS) {
  const has = evsOf(real, leg).length > 0;
  if (has) {
    add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { const e = evsOf(r, leg); [e[0].type, e[1].type] = [e[1].type, e[0].type]; }, ['composition-data-chain', 'composing-by-input-type', 'compositionstart-selected-text', 'trust-law', `leg-${leg}-trusted`, `leg-${leg}-data`, `leg-${leg}-composing`]);
    add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { const e = evsOf(r, leg); e[0].isTrusted = !e[0].isTrusted; }, ['trust-law']);
    add(`${leg}-data`, `leg-${leg}-data`, (r) => { const e = evsOf(r, leg).filter((x) => x.type === 'input'); e[0].data = 'Q'; });
    add(`${leg}-composing`, `leg-${leg}-composing`, (r) => { const e = evsOf(r, leg).filter((x) => x.type === 'input'); e[0].isComposing = !e[0].isComposing; }, ['composing-by-input-type']);
    add(`${leg}-target`, `leg-${leg}-target`, (r) => { const e = evsOf(r, leg); e[e.length - 1].target = 'pad'; });
  } else {
    for (const k of ['seq', 'trusted', 'data', 'composing', 'target']) add(`${leg}-${k}`, `leg-${leg}-${k}`, (r) => { insertAt(r, leg, {}); }, perLeg(leg).filter((x) => x !== `leg-${leg}-${k}`));
  }
  add(`${leg}-state`, `leg-${leg}-state`, (r) => { r.legs[legIdx(r, leg)].stateAfter.f += 'Z'; });
  add(`${leg}-state-active`, `leg-${leg}-state`, (r) => { const s = r.legs[legIdx(r, leg)].stateAfter; s.active = s.active === 'f' ? 'ce' : 'f'; });
  add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = r.legs[legIdx(r, leg)]; l.cdpError = leg === 'replace-half' ? null : '{"code":-32000,"message":"x"}'; });
}
add('replace-half-error-other', 'leg-replace-half-error', (r) => { r.legs[legIdx(r, 'replace-half')].cdpError = '{"code":-32602,"message":"Invalid parameters"}'; });

// ---- MUST-ACCEPT (exit 0, no finding) ----
accept('accept-real-key-order', (r) => { const o = {}; for (const k of Object.keys(r).reverse()) o[k] = r[k]; for (const k of Object.keys(r)) delete r[k]; Object.assign(r, o); });
accept('accept-prior-all-identifiers-differ-one-quantum', () => {}, { prior: (p) => { swapToken(p); swapUrl(p); shiftTs(p, 0.1); return p; } });
accept('accept-prior-timeline-0.06', () => {}, { prior: (p) => { swapToken(p); swapUrl(p); shiftTs(p, 0.06); return p; } });
accept('accept-on-grid-exact-decimal', (r) => { r.events.forEach((e) => { e.ts = Math.round(e.ts * 10) / 10; e.at = Math.round(e.at * 10) / 10; }); });
accept('accept-mark-equal-event-at', (r) => { const e = evsOf(r, 'compose-b'); e[0].at = markAt(r, 'compose-b'); e[0].ts = e[0].at; });

const runCounter = (file, c = null) => {
  const o = (c && c.opts) || {};
  const extra = [];
  if (o.priorReal) extra.push('--prior', realPath);
  if (o.prior) { const pf = path.join(work, 'prior-' + c.name + '.json'); fs.writeFileSync(pf, JSON.stringify(o.prior(clone(real)))); extra.push('--prior', pf); }
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, '--expect-driver-sha256', pin, '--expect-nonce', o.nonce || expectNonce,
    ...priorPaths.flatMap((x) => ['--prior', x]), ...extra, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findingIds: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null };
};
const launderInto = (r, f) => {
  const pre = runCounter(f);
  if (pre.derived) { r.legShape = pre.derived; fs.writeFileSync(f, JSON.stringify(r)); }
};
const results = [];
const pos = runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
for (const c of cases) {
  const r = clone(real);
  try { c.mutate(r); } catch (e) { results.push({ case: c.name, class: c.accept ? 'must-accept' : 'refuse', expect: c.expect, error: 'mutation failed: ' + e.message, ok: false, isolated: false }); continue; }
  const f = path.join(work, (c.accept ? 'acc-' : 'neg-') + c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  if (c.launder) launderInto(r, f);
  const o = runCounter(f, c);
  const ids = Array.isArray(o.findingIds) ? o.findingIds : [];
  if (c.accept) { results.push({ case: c.name, class: 'must-accept', exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 0 && Array.isArray(o.findingIds) && ids.length === 0, extra: ids }); continue; }
  const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
  results.push({ case: c.name, class: 'refuse', expect: c.expect, counterLine: lineOf(c.expect), alsoAllowed: c.alsoAllowed, exit: o.exit, findingIds: o.findingIds, isolated: ids.length === 1 && ids[0] === c.expect, ok: o.exit === 1 && ids.includes(c.expect) && extra.length === 0, extra });
}
const LAUNDER_EXPECT = { 'dispatch-key': 'ime-call-count', 'exec-command': 'send-log-allowlist', 'script-events': 'send-log-allowlist' };
for (const lp of multi('laundered')) {
  let d; try { d = JSON.parse(fs.readFileSync(lp, 'utf8')); } catch (e) { usage('laundered receipt unreadable: ' + lp); }
  const kind = d.degenerate; const expect = LAUNDER_EXPECT[kind];
  if (!expect) usage('laundered receipt has no known degenerate kind: ' + lp);
  d.degenerate = null; d.predicate = true; d.imeComposeHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.json');
  fs.writeFileSync(f, JSON.stringify(d));
  launderInto(d, f);
  const o = runCounter(f, { name: 'laundered-' + kind, opts: { nonce: d.nonce } });
  results.push({ case: 'laundered-' + kind, class: 'laundered', expect, counterLine: lineOf(expect), alsoAllowed: ['*'], exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(expect), extra: [] });
}
const listed = JSON.parse(spawnSync(process.execPath, [COUNTER, '--list-checks'], { encoding: 'utf8' }).stdout);
const covered = new Set(cases.filter((c) => !c.accept).map((c) => c.expect));
const coverageGap = listed.filter((id) => !covered.has(id));
const isolatedIds = new Set(results.filter((x) => x.class === 'refuse' && x.ok && x.isolated).map((x) => x.expect));
const failed = results.filter((x) => !x.ok).map((x) => x.case);
const allOk = positiveOk && failed.length === 0 && coverageGap.length === 0;
const summary = { schema: 'tabi-negatives-imecompose-r74', real: realPath, positiveOk, cases: results.length,
  refuseCases: results.filter((x) => x.class === 'refuse').length, mustAcceptCases: results.filter((x) => x.class === 'must-accept').length, launderedCases: results.filter((x) => x.class === 'laundered').length,
  passed: results.filter((x) => x.ok).length, isolatedCases: results.filter((x) => x.isolated).length, idsWithIsolatedCase: isolatedIds.size,
  failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.passed}/${summary.cases} (refuse ${summary.refuseCases}, must-accept ${summary.mustAcceptCases}, laundered ${summary.launderedCases}) isolated=${summary.isolatedCases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
process.exit(allOk ? 0 : 1);
