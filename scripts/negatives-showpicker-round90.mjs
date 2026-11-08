#!/usr/bin/env node
// Isolated --selftest for negatives-showpicker-round90.mjs. Asserts one named battery
// case is RED on an isolated fixture: the accept-grammar-law-r90-case case, whose mutation
// changes fixtureInputs `ac` accept to a non-matching value, must fail the battery (exit 1)
// with that case refused. Usage: node negatives-showpicker-round90.mjs --selftest [--json]
// Note: --selftest is a standalone mode; it runs the battery's OWN case list copied into a
// scratch dir (never the lane) against a minimal receipt whose only leg of interest is the
// case target, so the named case is RED and the battery exits 1.
const selftestArgv = process.argv.slice(2);
const selftestAsJson = selftestArgv.includes('--json');
if (selftestArgv.includes('--selftest')) {
  const fs = (await import('node:fs')).default;
  const path = (await import('node:path')).default;
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const self = fileURLToPath(import.meta.url);
  const HERE2 = path.dirname(self);
  const COUNTER2 = path.join(HERE2, 'check-showpicker-round90.mjs');
  const laneArg = selftestArgv.includes('--lane') ? selftestArgv[selftestArgv.indexOf('--lane') + 1] : null;
  const lane = laneArg && path.isAbsolute(laneArg) ? laneArg : '/home/vgpnk/Projects/shokunin/tabi-shokunin';
  const base = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
  const scratch = base + '/tabi-r90-battery-selftest-' + process.pid;
  fs.mkdirSync(scratch, { recursive: true });
  const receiptRel = 'corpus/evidence/round90/chromium-showpicker/receipt.json';
  let real;
  try { real = JSON.parse(fs.readFileSync(path.join(lane, receiptRel), 'utf8')); } catch (e) {
    const out = { schema: 'tabi-r90-battery-selftest', ok: false, reason: 'receipt-unreadable ' + e.message };
    process.stdout.write(JSON.stringify(out) + '\n'); process.exit(1);
  }
  const fixtureSha = real.fixture && real.fixture.sha256;
  const mutated = JSON.parse(JSON.stringify(real));
  const desc = (mutated.fixtureInputs || []).find((x) => x && x.id === 'ac');
  if (!desc) { process.stdout.write(JSON.stringify({ ok: false, reason: 'no-ac-descriptor' }) + '\n'); process.exit(1); }
  desc.accept = 'image/png'; // honest value is IMAGE/PNG: the grammar row must refuse
  const mutatedPath = path.join(scratch, 'mutated.json');
  fs.writeFileSync(mutatedPath, JSON.stringify(mutated));
  const ps = path.join(lane, '.ufo/waves/round-90/controls/c1/prior-set.txt');
  const realSha = (await import('node:crypto')).createHash('sha256').update(fs.readFileSync(path.join(lane, receiptRel))).digest('hex');
  const score = (receipt) => {
    const r = spawnSync(process.execPath, [COUNTER2, '--lane', lane, '--receipt', receipt,
      '--expect-driver-sha256', real.driverSha256, '--expect-nonce', real.nonce,
      '--expect-fixture-sha256', fixtureSha, '--prior-set', ps,
      '--tree-exempt-sha256', realSha, '--json'], { encoding: 'utf8', timeout: 300000 });
    let j = null; try { j = JSON.parse(r.stdout); } catch {}
    return { status: r.status, json: j, stderr: (r.stderr || '').slice(0, 200) };
  };
  const clean = score(path.join(lane, receiptRel));
  const bad = score(mutatedPath);
  const badIds = bad.json ? bad.json.findings.map((f) => f.id) : [];
  const ok = clean.status === 0 && bad.status === 1 && badIds.includes('accept-grammar-law');
  const out = { schema: 'tabi-r90-battery-selftest', ok, cleanExit: clean.status, mutatedExit: bad.status, mutatedIds: badIds.slice(0, 8) };
  process.stdout.write(JSON.stringify(out) + '\n');
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch {}
  process.exit(ok ? 0 : 1);
}
// Negative + must-accept battery for scripts/check-showpicker-round90.mjs (tabi round 83, C1).
//
// Usage:
//   node negatives-showpicker-round90.mjs --lane <ABS lane> --real <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <nonce> --expect-fixture-sha256 <hex>
//     --prior-set <file> [--prior <receipt.json> ...] --work <ABS scratch dir> [--json]
//     [--first-failure]
//
// Every case mutates the real receipt (or the invocation) and runs the counter BY PATH (the counter
// beside this file). A refusal case passes only when the counter exits 1, lists the expected id and
// lists no id except those the case names in `alsoAllowed`. A must-accept case passes only when the
// counter exits 0 with no finding. Coverage: every check id the counter declares must be the
// expected id of at least one refusal case — a new check without a case fails the battery.
//
// The prior-set walk cases run on a scratch MIRROR lane (`<work>/mirror/tabi-shokunin`, the real
// lane is never written): `--lane` names the mirror so the walk reads it; the receipt's own `lane`
// field still matches the basename.
//
// Exit 0 = every case as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-showpicker-round90.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const realPath = opt('real');
const pin = opt('expect-driver-sha256');
const expectNonce = opt('expect-nonce');
const expectFixture = opt('expect-fixture-sha256');
const priorSet = opt('prior-set');
const work = opt('work');
const asJson = argv.includes('--json');
const firstFailure = argv.includes('--first-failure');
const extraPriors = multi('prior');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!realPath || !pin || !expectNonce || !expectFixture || !priorSet) usage('--real, --expect-driver-sha256, --expect-nonce, --expect-fixture-sha256 and --prior-set are required');
if (!work || !path.isAbsolute(work)) usage('--work must be an absolute path');
fs.mkdirSync(work, { recursive: true });
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const clone = (v) => JSON.parse(JSON.stringify(v));
const realSha = sha256(fs.readFileSync(realPath));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const LEG_NAMES = arr(real.legs).map((l) => l.name);
const legOf = (r, n) => arr(r.legs).find((l) => l.name === n);
const evOf = (r, leg, pred = () => true) => arr(legOf(r, leg).pageEvents).filter(pred);
const openOf = (r, leg) => arr(legOf(r, leg).cdpEventLog).find((e) => e.method === 'Page.fileChooserOpened');
const openAll = (r, leg) => arr(legOf(r, leg).cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');

// ---- invocation ----
const runCounter = (receiptPath, laneArg, extraArgs = []) => {
  const args = [COUNTER, '--lane', laneArg, '--receipt', receiptPath, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce,
    '--expect-fixture-sha256', expectFixture, '--prior-set', path.resolve(priorSet),
    ...(laneArg === lane ? ['--tree-exempt-sha256', realSha] : []),
    ...extraPriors.flatMap((p) => ['--prior', path.resolve(p)]), '--json', ...extraArgs];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 20000 });
  let j = null;
  try { j = JSON.parse(r.stdout); } catch { j = null; }
  const timedOut = r.status === null && r.signal === 'SIGTERM';
  return { status: timedOut ? 1 : r.status, json: timedOut ? { verdict: 'timeout', findings: [{ id: 'counter-timeout' }] } : j, timedOut, stderr: (r.stderr || '').slice(0, 800), stdoutHead: (r.stdout || '').slice(0, 300) };
};
const writeCase = (name, r) => { const p = path.join(work, 'cases', name + '.json'); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(r, null, 1)); return p; };

// ---- mirror lane for the walk cases ----
const mirrorLane = path.join(work, 'mirror', 'tabi-shokunin');
const mirrorTrees = ['.ufo/waves/round-90', 'corpus/evidence/round90'];
const buildMirror = () => {
  fs.rmSync(mirrorLane, { recursive: true, force: true });
  for (const t of mirrorTrees) fs.mkdirSync(path.join(mirrorLane, t), { recursive: true });
  // only the prior-set's OWN files are mirrored: copying the whole controls/c1 tree would also
  // copy the receipt under test, which the walk would then report as an undeclared receipt
  for (const line of fs.readFileSync(path.resolve(priorSet), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const rel = path.isAbsolute(t) ? path.relative(lane, t) : t;
    if (rel.startsWith('..')) continue;
    const src = path.join(lane, rel), dst = path.join(mirrorLane, rel);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
  return mirrorLane;
};

// ---- cases ----
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], accept: true, opts });
const rewriteNonce = (r, to) => {
  const old = r.nonce;
  r.nonce = to;
  for (const l of arr(r.legs)) {
    for (const s of arr(l.serverLog)) if (s.run === old) s.run = to;
    for (const s of arr(l.childServerLog)) if (s.run === old) s.run = to;
    for (const c of arr(l.cdpSendLog)) {
      if (c.method === 'Page.navigate') c.params.url = c.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
      if (c.method === 'Runtime.evaluate' && typeof c.params.expression === 'string') c.params.expression = c.params.expression.split(JSON.stringify(old)).join(JSON.stringify(to));
    }
    for (const e of arr(l.cdpEventLog)) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split(encodeURIComponent(old)).join(encodeURIComponent(to));
  }
  return r;
};

// identity and run binding
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-showpicker-r80'; });
add('lane', 'lane', (r) => { r.lane = 'other-lane'; });
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r84-x'); }, ['nonce-expected']);
add('nonce-expected', 'nonce-expected', (r) => { rewriteNonce(r, 'tabi-r90-some-other-nonce'); });
add('receipt-fields', 'receipt-fields', (r) => { r.extra = 1; });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Chromium 154.0.0.0 Arch Linux'; });
add('host-node', 'host-node', (r) => { r.host.node = 'v22.1.0'; });
add('ports-declared', 'ports-declared', (r) => { r.ports.child = r.ports.http; }, ['fixture-hash', 'host-argv', 'devtools-port-binding', 'send-log-allowlist', 'cdp-event-log-closed', 'context-binding']);
add('frame-tree', 'frame-tree', (r) => { r.frameTree.mainFrameUrl = 'http://127.0.0.1:1/'; });

// plan / legs
add('plan-frozen', 'plan-frozen', (r) => { legOf(r, 'sp84-accept-answer').gesture = true; }, ['plan-calls']);
add('leg-order', 'leg-order', (r) => { r.legs.reverse(); }, ['plan-frozen', 'leg-records', 'plan-calls', 'leg-marks', 'context-binding']);
add('leg-records', 'leg-records', (r) => { delete legOf(r, 'sp84-accept-answer').stderrHead; }, ['host-argv']);
add('leg-marks', 'leg-marks', (r) => { legOf(r, 'sp84-webkitdirectory-answer').lateAfterClose = 1; });
add('context-binding', 'context-binding', (r) => { legOf(r, 'sp84-cross-origin-nonfile').contexts = legOf(r, 'sp84-cross-origin-nonfile').contexts.filter((c) => c.origin !== 'http://127.0.0.1:' + r.ports.child); }, ['send-log-allowlist', 'cdp-event-log-closed']);
add('send-log-allowlist', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp84-accept-answer'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'DOM.getDocument', params: {} }); });
add('plan-calls', 'plan-calls', (r) => { legOf(r, 'sp84-accept-answer').cdpSendLog.find((c) => c.method === 'Page.setInterceptFileChooserDialog').params = { enabled: false }; });
add('plan-calls-settle-call', 'plan-calls', (r) => { const l = legOf(r, 'sp89-accept-domread-text'); const c = l.cdpSendLog.find((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)'); c.params.expression = 'window.__inputs()'; });
add('plan-calls-settle-order', 'plan-calls', (r) => { const l = legOf(r, 'sp89-accept-domread-png'); const i = l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)'); const j = l.cdpSendLog.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__state()'); const t = l.cdpSendLog[i]; l.cdpSendLog[i] = l.cdpSendLog[j]; l.cdpSendLog[j] = t; l.cdpSendLog.forEach((c, k) => { c.id = k + 1; }); }, ['leg-sp89-accept-domread-png']);
add('send-log-settle-on-plain-leg', 'send-log-allowlist', (r) => { const l = legOf(r, 'sp86-accept-wildcard-text'); l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.__inputs(true)', returnByValue: true } }); }, ['plan-calls']);
add('cdp-event-log-closed', 'cdp-event-log-closed', (r) => { openOf(r, 'sp84-accept-answer').afterSendId = legOf(r, 'sp84-accept-answer').triggerSendId + 5; });
add('frame-binding', 'frame-binding', (r) => { legOf(r, 'sp84-accept-answer').frameTree.mainFrameParentId = 'X'; });
add('event-types', 'event-types', (r) => { evOf(r, 'sp84-accept-answer')[0].extra = true; });
add('event-time-quantum', 'event-time-quantum', (r) => { evOf(r, 'sp84-accept-answer')[0].ts = 1.23456; });
add('event-leg-window', 'event-leg-window', (r) => { evOf(r, 'sp84-accept-answer')[4].at = 0.1; }, ['leg-sp84-accept-answer']);
add('seq-monotonic', 'seq-monotonic', (r) => { evOf(r, 'sp84-accept-answer')[0].seq = 99; });

// per-leg frozen shapes: one case per leg
const legMutators = {
  'sp84-cross-origin-nonfile': (r) => { legOf(r, 'sp84-cross-origin-nonfile').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-nonfile-disabled': (r) => { legOf(r, 'sp84-cross-origin-nonfile-disabled').stateAfter.sValue = 'x'; },
  'sp84-same-origin-nonfile-disabled': (r) => { evOf(r, 'sp84-same-origin-nonfile-disabled')[0].target = 's'; },
  'sp84-webkitdirectory-answer': (r) => { legOf(r, 'sp84-webkitdirectory-answer').stateAfter.d = []; },
  'sp84-accept-answer': (r) => { evOf(r, 'sp84-accept-answer')[5].files = [['a', 1, 'text/plain', '']]; },
  'sp84-click-while-open': (r) => { evOf(r, 'sp84-click-while-open')[7].buttons = 1; },
  'sp84-cross-origin-color': (r) => { legOf(r, 'sp84-cross-origin-color').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-month': (r) => { legOf(r, 'sp84-cross-origin-month').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-week': (r) => { legOf(r, 'sp84-cross-origin-week').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-time': (r) => { legOf(r, 'sp84-cross-origin-time').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-tel': (r) => { legOf(r, 'sp84-cross-origin-tel').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-search': (r) => { legOf(r, 'sp84-cross-origin-search').stateAfter.sValue = 'x'; },
  'sp84-cross-origin-text': (r) => { legOf(r, 'sp84-cross-origin-text').stateAfter.sValue = 'x'; },
  'sp86-accept-wildcard-text': (r) => { legOf(r, 'sp86-accept-wildcard-text').stateAfter.aw = []; },
  'sp86-accept-wildcard-png': (r) => { evOf(r, 'sp86-accept-wildcard-png')[5].files = [['a', 1, 'image/png', '']]; },
  'sp86-accept-mixed-text': (r) => { legOf(r, 'sp86-accept-mixed-text').stateAfter.am = []; },
  'sp86-accept-mixed-png': (r) => { legOf(r, 'sp86-accept-mixed-png').stateAfter.am = []; },
  'sp86-accept-pdf-token-png': (r) => { legOf(r, 'sp86-accept-pdf-token-png').stateAfter.ap = []; },
  'sp86-same-origin-color-activated': (r) => { legOf(r, 'sp86-same-origin-color-activated').stateAfter.cos = [['a', 1, 'text/plain', '']]; },
  'sp87-accept-audio-png': (r) => { evOf(r, 'sp87-accept-audio-png')[5].files = [['a', 1, 'image/png', '']]; },
  'sp87-accept-video-text': (r) => { evOf(r, 'sp87-accept-video-text')[5].files = [['a', 1, 'text/plain', '']]; },
  'sp87-accept-multimime-text': (r) => { evOf(r, 'sp87-accept-multimime-text')[5].files = [['a', 1, 'text/plain', '']]; },
  'sp87-accept-whitespace-png': (r) => { evOf(r, 'sp87-accept-whitespace-png')[5].files = [['a', 1, 'image/png', '']]; },
  'sp88-accept-case-png': (r) => { evOf(r, 'sp88-accept-case-png')[5].files = [['a', 1, 'image/png', '']]; },
  'sp88-accept-audiovideo-text': (r) => { evOf(r, 'sp88-accept-audiovideo-text')[5].files = [['a', 1, 'text/plain', '']]; },
  'sp88-accept-mimeparam-png': (r) => { evOf(r, 'sp88-accept-mimeparam-png')[5].files = [['a', 1, 'image/png', '']]; },
};
const LEG_ALSO = { 'sp85-same-origin-tel': ['no-selection-law'], 'sp85-same-origin-search': ['no-selection-law'], 'sp85-same-origin-text': ['no-selection-law'], 'sp85-same-origin-tel-activated': ['no-selection-law'], 'sp85-same-origin-search-activated': ['no-selection-law'], 'sp85-same-origin-text-activated': ['no-selection-law'], 'sp84-cross-origin-nonfile': ['no-selection-law'], 'sp84-cross-origin-nonfile-disabled': ['no-selection-law'], 'sp84-same-origin-nonfile-disabled': ['no-selection-law'], 'sp84-webkitdirectory-answer': ['no-selection-law', 'webkitdirectory-answer-law'], 'sp84-accept-answer': ['no-selection-law', 'accept-answer-law'], 'sp84-click-while-open': ['no-selection-law'], 'sp84-cross-origin-color': ['no-selection-law'], 'sp84-cross-origin-month': ['no-selection-law'], 'sp84-cross-origin-week': ['no-selection-law'], 'sp84-cross-origin-time': ['no-selection-law'], 'sp84-cross-origin-number': ['no-selection-law'], 'sp84-cross-origin-range': ['no-selection-law'], 'sp84-cross-origin-tel': ['no-selection-law'], 'sp84-cross-origin-search': ['no-selection-law'], 'sp84-cross-origin-text': ['no-selection-law'], 'sp84-multiple-mode': ['no-selection-law', 'multiple-mode-law'], 'sp84-accept-mime-answer': ['no-selection-law', 'accept-mime-answer-law'], 'sp84-second-chooser-answer': ['no-selection-law', 'second-chooser-answer-law'], 'sp86-accept-wildcard-text': ['no-selection-law', 'accept-grammar-law'], 'sp86-accept-wildcard-png': ['no-selection-law', 'accept-grammar-law'], 'sp86-accept-mixed-text': ['no-selection-law', 'accept-grammar-law'], 'sp86-accept-mixed-png': ['no-selection-law', 'accept-grammar-law'], 'sp86-accept-pdf-token-png': ['no-selection-law', 'accept-grammar-law'], 'sp86-same-origin-color-activated': ['no-selection-law', 'same-origin-color-law'] };
const DOMREAD_ALSO = { 'sp89-accept-domread-text': ['no-selection-law'], 'sp89-accept-domread-png': ['no-selection-law'], 'sp89-accept-domread-multimime': ['no-selection-law'], 'sp89-accept-domread-whitespace': ['no-selection-law'] };
for (const n of LEG_NAMES) add('leg-' + n, 'leg-' + n, legMutators[n] || ((r) => { legOf(r, n).stateAfter.sValue = 'x'; }), LEG_ALSO[n] || DOMREAD_ALSO[n] || []);

// law checks
add('gesture-law', 'gesture-law', (r) => { legOf(r, 'sp84-webkitdirectory-answer').showPicker = { ok: false, name: 'NotAllowedError', message: 'x' }; }, ['intercept-law']);
add('activation-law', 'activation-law', (r) => { legOf(r, 'sp84-accept-answer').activationAfter = { isActive: true, hasBeenActive: true }; });
add('mode-law', 'mode-law', (r) => { openOf(r, 'sp84-webkitdirectory-answer').params.mode = 'selectMultiple'; }, ['leg-sp84-webkitdirectory-answer']);
add('cross-origin-nonfile-law', 'cross-origin-nonfile-law', (r) => { legOf(r, 'sp84-cross-origin-nonfile').parentCrossAccess = { contentDocument: 'object', windowDocument: 'SecurityError' }; });
add('order-law', 'order-law', (r) => { legOf(r, 'sp84-same-origin-nonfile-disabled').showPicker = { ok: false, name: 'SecurityError', message: 'x' }; }, ['gesture-law']);
add('webkitdirectory-answer-law', 'webkitdirectory-answer-law', (r) => { legOf(r, 'sp84-webkitdirectory-answer').uploadDir.files[0].sha256 = '0'.repeat(64); });
add('accept-answer-law', 'accept-answer-law', (r) => { legOf(r, 'sp84-accept-answer').pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; });
add('click-while-open-law', 'click-while-open-law', (r) => { legOf(r, 'sp84-click-while-open').clickWhileOpenChoosersAfter = 1; });
add('multiple-mode-law', 'multiple-mode-law', (r) => { const l = legOf(r, 'sp84-multiple-mode'); l.answer.setParams.backendNodeId = 0; });
add('multiple-mode-law-state', 'multiple-mode-law', (r) => { legOf(r, 'sp84-multiple-mode').stateAfter.m = []; }, ['leg-sp84-multiple-mode', 'no-selection-law']);
add('accept-mime-answer-law', 'accept-mime-answer-law', (r) => { legOf(r, 'sp84-accept-mime-answer').stateAfter.k = []; }, ['leg-sp84-accept-mime-answer', 'no-selection-law']);
add('accept-mime-answer-law-bytes', 'accept-mime-answer-law', (r) => { const l = legOf(r, 'sp84-accept-mime-answer'); l.pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; });
add('second-chooser-answer-law', 'second-chooser-answer-law', (r) => { legOf(r, 'sp84-second-chooser-answer').clickWhileOpenChoosersAfter = 1; });
add('second-chooser-answer-law-bytes', 'second-chooser-answer-law', (r) => { const l = legOf(r, 'sp84-second-chooser-answer'); l.pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; });
add('second-chooser-answer-law-id', 'second-chooser-answer-law', (r) => { legOf(r, 'sp84-second-chooser-answer').secondChooserBackendNodeId = 999; });
add('cross-origin-number-law', 'sp84-cross-origin-number-law', (r) => { legOf(r, 'sp84-cross-origin-number').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law', 'leg-sp84-cross-origin-number']);
add('cross-origin-range-law', 'sp84-cross-origin-range-law', (r) => { legOf(r, 'sp84-cross-origin-range').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law', 'leg-sp84-cross-origin-range']);
add('cross-origin-tel-law', 'sp84-cross-origin-tel-law', (r) => { legOf(r, 'sp84-cross-origin-tel').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law', 'leg-sp84-cross-origin-tel']);
add('cross-origin-search-law', 'sp84-cross-origin-search-law', (r) => { legOf(r, 'sp84-cross-origin-search').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law', 'leg-sp84-cross-origin-search']);
add('cross-origin-text-law', 'sp84-cross-origin-text-law', (r) => { legOf(r, 'sp84-cross-origin-text').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law', 'leg-sp84-cross-origin-text']);
add('cross-origin-tel-message', 'sp84-cross-origin-tel-law', (r) => { legOf(r, 'sp84-cross-origin-tel').childResult.message = 'SecurityError'; }, ['leg-sp84-cross-origin-tel']);
add('cross-origin-search-activation', 'sp84-cross-origin-search-law', (r) => { legOf(r, 'sp84-cross-origin-search').childActivationAfter = { isActive: false, hasBeenActive: true }; }, ['activation-law', 'leg-sp84-cross-origin-search']);
add('cross-origin-text-late', 'sp84-cross-origin-text-law', (r) => { legOf(r, 'sp84-cross-origin-text').childLate = 1; }, ['leg-sp84-cross-origin-text']);

add('no-selection-law', 'no-selection-law', (r) => { legOf(r, 'sp84-cross-origin-nonfile').stateAfter.s = [['a', 1, 'text/plain', '']]; }, ['leg-sp84-cross-origin-nonfile']);
add('intercept-law', 'intercept-law', (r) => { const l = legOf(r, 'sp84-cross-origin-nonfile-disabled'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.priorReleaseId }); }, ['leg-sp84-cross-origin-nonfile-disabled', 'order-law', 'plan-calls']);
add('cancel-law', 'cancel-law', (r) => { const l = legOf(r, 'sp84-accept-answer'); l.pageEvents.push({ type: 'cancel', ts: 20, isTrusted: true, act: false, target: 'k', x: null, y: null, buttons: null, files: [['cancel', 'k', []]], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 }); }, ['leg-sp84-accept-answer', 'event-leg-window', 'dismiss-law']);
add('dismiss-law', 'dismiss-law', (r) => { legOf(r, 'sp84-accept-answer').dismissResult = { ok: 1 }; });
add('order-law-message', 'order-law', (r) => { legOf(r, 'sp84-same-origin-nonfile-disabled').showPicker = { ok: false, name: 'InvalidStateError', message: 'wrong message' }; }, ['gesture-law']);
add('activation-before', 'activation-law', (r) => { legOf(r, 'sp84-accept-answer').activationBefore = { isActive: false, hasBeenActive: false }; });
add('cross-nonfile-chooser', 'cross-origin-nonfile-law', (r) => { const l = legOf(r, 'sp84-cross-origin-nonfile'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId, mode: 'selectSingle', backendNodeId: 3 }, afterSendId: l.priorReleaseId }); }, ['intercept-law', 'leg-sp84-cross-origin-nonfile', 'plan-calls', 'cdp-event-log-closed']);
add('cross-nonfile-result', 'cross-origin-nonfile-law', (r) => { legOf(r, 'sp84-cross-origin-nonfile').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law']);
add('cross-color-law', 'sp84-cross-origin-color-law', (r) => { legOf(r, 'sp84-cross-origin-color').childResult = { ok: false, name: 'SecurityError', message: 'x' }; }, ['intercept-law']);
add('cross-month-law', 'sp84-cross-origin-month-law', (r) => { legOf(r, 'sp84-cross-origin-month').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law']);
add('cross-week-law', 'sp84-cross-origin-week-law', (r) => { legOf(r, 'sp84-cross-origin-week').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law']);
add('cross-time-law', 'sp84-cross-origin-time-law', (r) => { legOf(r, 'sp84-cross-origin-time').childResult = { ok: true, ret: 'undefined' }; }, ['intercept-law']);
add('trust-law', 'trust-law', (r) => { evOf(r, 'sp84-accept-answer')[0].isTrusted = false; }, ['leg-sp84-accept-answer']);

// host / fixture / server
add('host-argv', 'host-argv', (r) => { legOf(r, 'sp84-accept-answer').argv[7] = '--no-first-run-x'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { legOf(r, 'sp84-accept-answer').devtoolsListening.port = 1; }, ['host-argv']);
add('teardown-closure', 'teardown-closure', (r) => { legOf(r, 'sp84-accept-answer').teardown.survivors = [123]; }, ['host-argv']);
add('fixture-descriptors', 'fixture-descriptors', (r) => { r.fixtureInputs.find((d) => d.id === 's').rect.left = 101; });
add('server-log-binding', 'server-log-binding', (r) => { legOf(r, 'sp84-accept-answer').serverLog.find((s) => s.path === '/').run = 'other'; });
add('child-server-log-binding', 'child-server-log-binding', (r) => { legOf(r, 'sp84-accept-answer').childServerLog.find((s) => s.path === '/child.html').run = 'other'; });
add('run-window', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 10000).toISOString(); });

// replay
const freshPrior = (ctx, delta) => {
  const c = clone(ctx.real);
  for (const l of arr(c.legs)) {
    const tok = crypto.randomBytes(6).toString('hex');
    l.launchToken = tok;
    const i = arr(l.argv).findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    if (i >= 0) l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice('--user-data-dir='.length)), 'profile-' + tok);
    const bid = crypto.randomUUID();
    if (isObj(l.devtoolsListening)) { l.devtoolsListening = { url: 'ws://127.0.0.1:' + c.ports.cdp + '/devtools/browser/' + bid, port: c.ports.cdp, browserId: bid }; l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url; }
    for (const e of arr(l.pageEvents)) { e.ts = Math.round((e.ts + delta) * 10) / 10; e.at = Math.round((e.at + delta) * 10) / 10; }
  }
  const p = path.join(work, 'prior-' + delta + '.json');
  fs.writeFileSync(p, JSON.stringify(c));
  return p;
};
// the forgery: a copy of a PRIOR with the identity fields rewritten to the expected values
const forgery = (ctx) => {
  const c = clone(ctx.prior);
  c.nonce = expectNonce;
  c.driverSha256 = pin;
  c.fixture.sha256 = expectFixture;
  c.schema = ctx.real.schema; // the prior already carries this generation's schema
  rewriteNonce(c, expectNonce);
  for (const l of arr(c.legs)) {
    for (const s of arr(l.serverLog)) s.run = expectNonce;
    for (const s of arr(l.childServerLog)) s.run = expectNonce;
  }
  return c;
};
add('replay-event-timeline', 'replay-event-timeline', (r, ctx) => { Object.assign(r, forgery(ctx)); }, ['send-log-allowlist', 'cdp-event-log-closed', 'replay-launch-token', 'replay-devtools-url']);

add('replay-launch-token', 'replay-launch-token', (r, ctx) => { legOf(r, 'sp84-accept-answer').launchToken = arr(ctx.prior.legs)[0].launchToken; }, ['host-argv']);
add('replay-devtools-url', 'replay-devtools-url', (r, ctx) => { legOf(r, 'sp84-accept-answer').devtoolsListening = clone(arr(ctx.prior.legs)[0].devtoolsListening); }, ['host-argv', 'devtools-port-binding']);

// ---- generation r87: the r84 survivor families (one witness per weakened conjunct) ----
// Each case weakens ONE field of a cross-origin leg; the frozen counter must refuse it. A
// survivor here is exactly an r84Mut1 class the r84 battery could not see.
add('cross-tel-message-unpinned', 'sp84-cross-origin-tel-law', ((r) => { legOf(r, 'sp84-cross-origin-tel').childResult.message = 'SecurityError'; }));
add('cross-tel-childlate', 'sp84-cross-origin-tel-law', ((r) => { legOf(r, 'sp84-cross-origin-tel').childLate = 1; }));
add('cross-tel-crossaccess', 'sp84-cross-origin-tel-law', ((r) => { legOf(r, 'sp84-cross-origin-tel').parentCrossAccess = { contentDocument: 'object', windowDocument: 'SecurityError' }; }));
add('cross-tel-childseq', 'sp84-cross-origin-tel-law', ((r) => { const e = legOf(r, 'sp84-cross-origin-tel').childEvents; e[0].target = 'go13'; }));
add('cross-tel-childact-after', 'sp84-cross-origin-tel-law', ((r) => { legOf(r, 'sp84-cross-origin-tel').childActivationAfter = { isActive: false, hasBeenActive: true }; }));
add('cross-tel-childact-before', 'sp84-cross-origin-tel-law', ((r) => { legOf(r, 'sp84-cross-origin-tel').childActivationBefore = { isActive: true, hasBeenActive: true }; }));
add('same-origin-activated-opens-none', 'same-origin-no-picker-law', ((r) => { const l = legOf(r, 'sp85-same-origin-tel-activated'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 9 }, afterSendId: l.triggerSendId }); }), ['plan-calls', 'leg-sp85-same-origin-tel-activated', 'intercept-law']);

// ---- generation r87: the tel-only witness gap (R85Mut1's routed defect 3) ----
// The six r85 family cases each weaken a field of the TEL leg. A counter law narrowed to tel
// therefore survives the r85 battery. Each family is measured here on the SEARCH and TEXT legs
// too, so a law that ignores either leg is refused.
const FAMILY_MUT = {
  'message-unpinned': (l) => { l.childResult.message = 'SecurityError'; },
  'childlate-dropped': (l) => { l.childLate = 1; },
  'crossaccess-dropped': (l) => { l.parentCrossAccess = { contentDocument: 'object', windowDocument: 'SecurityError' }; },
  'childseq-dropped': (l) => { l.childEvents[0].target = 'go'; },
  'childact-after-dropped': (l) => { l.childActivationAfter = { isActive: false, hasBeenActive: true }; },
  'childact-before-dropped': (l) => { l.childActivationBefore = { isActive: true, hasBeenActive: true }; },
};
for (const legName of ['search', 'text']) {
  for (const [fam, mut] of Object.entries(FAMILY_MUT)) {
    add('cross-' + legName + '-' + fam, 'sp84-cross-origin-' + legName + '-law', ((r) => { mut(legOf(r, 'sp84-cross-origin-' + legName)); }), []);
  }
}

// ---- generation r87: the accept token grammar and the same-origin colour arm ----
add('accept-grammar-law', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'aw').accept = null; }, ['fixture-descriptors']);
add('accept-grammar-law-token', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'ap').accept = 'image/png'; }, ['fixture-descriptors']);
add('accept-grammar-law-bytes', 'accept-grammar-law', (r) => { legOf(r, 'sp86-accept-mixed-text').pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; }, ['leg-sp86-accept-mixed-text']);
add('same-origin-color-law', 'same-origin-color-law', (r) => { legOf(r, 'sp86-same-origin-color-activated').showPicker = { ok: false, name: 'NotAllowedError', message: 'x' }; }, ['gesture-law', 'intercept-law']);
add('accept-grammar-law-state', 'accept-grammar-law', (r) => { const l = legOf(r, 'sp86-accept-mixed-png'); l.stateAfter.am = [['x', 1, 'text/plain', '']]; }, ['leg-sp86-accept-mixed-png', 'no-selection-law']);
add('color-law-activation-after', 'same-origin-color-law', (r) => { legOf(r, 'sp86-same-origin-color-activated').activationAfter = { isActive: true, hasBeenActive: true }; }, ['activation-law', 'leg-sp86-same-origin-color-activated']);
add('color-law-input-event', 'same-origin-color-law', (r) => {
  const l = legOf(r, 'sp86-same-origin-color-activated');
  const last = l.pageEvents[l.pageEvents.length - 1];
  l.pageEvents.push({ ...JSON.parse(JSON.stringify(last)), type: 'input', target: 'cos', files: [['a', 'cos', []]], seq: l.pageEvents.length + 1 });
}, ['leg-sp86-same-origin-color-activated', 'no-selection-law', 'event-leg-window']);
add('accept-grammar-law-r87-audio', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'aa').accept = 'video/*'; }, ['fixture-descriptors']);
add('accept-grammar-law-r87-video', 'accept-grammar-law', (r) => { legOf(r, 'sp87-accept-video-text').stateAfter.av = []; }, ['leg-sp87-accept-video-text', 'no-selection-law']);
add('accept-grammar-law-r87-multimime', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'a2').accept = 'image/png, application/pdf'; }, ['fixture-descriptors']);
add('accept-grammar-law-r87-whitespace', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'aws').accept = 'image/png ,  .txt'; }, ['fixture-descriptors']);
add('accept-grammar-law-r89-case', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'ac').accept = 'image/png'; }, ['fixture-descriptors']);
add('accept-grammar-law-r89-audiovideo', 'accept-grammar-law', (r) => { legOf(r, 'sp88-accept-audiovideo-text').stateAfter.au = []; }, ['leg-sp88-accept-audiovideo-text', 'no-selection-law']);
add('accept-grammar-law-r89-mimeparam', 'accept-grammar-law', (r) => { r.fixtureInputs.find((d) => d.id === 'amc').accept = 'image/png'; }, ['fixture-descriptors']);
add('accept-domread-law', 'accept-domread-law', (r) => { legOf(r, 'sp89-accept-domread-text').domRead.find((d) => d.id === 'aw').acceptTokens = ['image/png']; });
add('accept-domread-law-raw', 'accept-domread-law', (r) => { legOf(r, 'sp89-accept-domread-text').domRead.find((d) => d.id === 'aw').accept = 'application/pdf'; });
add('accept-domread-law-bytes', 'accept-domread-law', (r) => { legOf(r, 'sp89-accept-domread-png').pageEvents.find((e) => e.type === 'read').ret = 'hex:00'; }, ['leg-sp89-accept-domread-png']);
add('accept-domread-law-state', 'accept-domread-law', (r) => { legOf(r, 'sp89-accept-domread-whitespace').stateAfter.aws = []; }, ['leg-sp89-accept-domread-whitespace', 'no-selection-law']);
add('same-origin-color-law-opens', 'same-origin-color-law', (r) => { const l = legOf(r, 'sp86-same-origin-color-activated'); l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { frameId: l.frameTree.mainFrameId, mode: 'selectSingle', backendNodeId: 9 }, afterSendId: l.triggerSendId }); }, ['plan-calls', 'leg-sp86-same-origin-color-activated', 'intercept-law', 'cdp-event-log-closed']);

// prior-set walk cases (invocation / mirror lane)
add('prior-set-unmatched-exempt', 'prior-set-unmatched-exempt', () => {}, []);
add('prior-set-complete', 'prior-set-complete', () => {}, []);
add('prior-set-unparsable', 'prior-set-unparsable', () => {}, []);

// must-accept: the real receipt, and a copy whose events are re-timed by a constant (the limit)
accept('accept-real', (r) => r);
accept('accept-retimed', (r, ctx) => { const c = clone(ctx.real); for (const l of arr(c.legs)) for (const e of arr(l.pageEvents)) { e.ts = Math.round((e.ts + 1) * 10) / 10; e.at = Math.round((e.at + 1) * 10) / 10; } Object.assign(r, c); });


// ---- imported R82Mut1 witnesses (spotcheck routed defect 2), each a receipt mutation with its expected id ----
// The helper names are the witness set's own (leg/evs/open/PTR_EV/renumber) bound to this battery's helpers.
const leg = (r, n) => legOf(r, n);
const evs = (r, n) => arr(leg(r, n).pageEvents);
const open = (r, n) => openOf(r, n);
const PTR_EV = (r, n, type) => evs(r, n).find((e) => e.type === type);
const renumber = (r, n) => {
  const l = leg(r, n);
  for (const c of l.cdpSendLog) c.id += 100;
  for (const k of ['interceptSendId', 'triggerSendId', 'trigger2SendId', 'dismissSendId', 'clickPressId', 'clickReleaseId', 'priorPressId', 'priorReleaseId', 'armSendId']) {
    if (typeof l[k] === 'number') l[k] += 100;
  }
  if (l.answer && l.answer.setSendId) l.answer.setSendId += 100;
  for (const e of l.cdpEventLog) if (typeof e.afterSendId === 'number') e.afterSendId += 100;
  return l;
};
add("w-accept-upload-any", "accept-answer-law", ((r) => { leg(r, 'sp84-accept-answer').upload.size = 999; }));
add("w-argv-browserid-any", "host-argv", ((r) => { leg(r, 'sp84-accept-answer').devtoolsListening.browserId = 'zzz'; }));
add("w-argv-devtools-url-any", "host-argv", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    l.devtoolsListening.url = 'ws://evil/x';
    l.stderrHead = 'DevTools listening on ws://evil/x';
  }));
add("w-argv-profile-dropped", "host-argv", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    const i = l.argv.findIndex((a) => typeof a === 'string' && a.startsWith('--user-data-dir='));
    l.argv[i] = '--user-data-dir=' + l.argv[i].replace(/profile-[0-9a-f]{12}$/, 'profile-zzzzzzzzzzzz');
  }));
add("w-argv-stderr-binding-dropped", "host-argv", ((r) => { leg(r, 'sp84-accept-answer').stderrHead = 'DevTools listening on ws://127.0.0.1:1/devtools/browser/other'; }));
add("w-cdp-aftersendid-any", "cdp-event-log-closed", ((r) => { leg(r, 'sp84-accept-answer').cdpEventLog.find((e) => e.method === 'Page.frameNavigated').afterSendId = 'x'; }));
add("w-cdp-nav-count-loosened", "cdp-event-log-closed", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    const nav = l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated');
    l.cdpEventLog.push(JSON.parse(JSON.stringify(nav)));
  }));
add("w-cdp-nav-url-dropped", "cdp-event-log-closed", ((r) => { leg(r, 'sp84-accept-answer').cdpEventLog.find((e) => e.method === 'Page.frameNavigated').params.url = 'http://127.0.0.1:1/'; }));
add("w-cdp-open-backendnode-nonpositive-ok", "cdp-event-log-closed", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    const o = open(r, 'sp84-accept-answer');
    o.params.backendNodeId = 0;
    l.answer.setParams.backendNodeId = 0;
    l.cdpSendLog.find((c) => c.method === 'DOM.setFileInputFiles').params.backendNodeId = 0;
  }));
add("w-cdp-open-keys-open", "cdp-event-log-closed", ((r) => { open(r, 'sp84-accept-answer').params.extra = 1; }));
add("w-childserver-404-dropped", "child-server-log-binding", ((r) => { leg(r, 'sp84-accept-answer').childServerLog.push({ path: '/other', status: 200, run: r.nonce }); }));
add("w-childserver-min-dropped", "child-server-log-binding", ((r) => { leg(r, 'sp84-cross-origin-nonfile').childServerLog = []; }));
add("w-click-element-any", "click-while-open-law", ((r) => { leg(r, 'sp84-click-while-open').clickWhileOpenElement = 'q'; }));
add("w-cross-nonfile-child-act-dropped", "cross-origin-nonfile-law", ((r) => { leg(r, 'sp84-cross-origin-nonfile').childEvents[0].act = false; }));
add("w-cross-nonfile-childact-after-dropped", "cross-origin-nonfile-law", ((r) => { leg(r, 'sp84-cross-origin-nonfile').childActivationAfter = { isActive: false, hasBeenActive: false }; }));
add("w-cross-nonfile-childact-before-dropped", "cross-origin-nonfile-law", ((r) => { leg(r, 'sp84-cross-origin-nonfile').childActivationBefore = { isActive: true, hasBeenActive: true }; }));
add("w-cross-nonfile-childlate-dropped", "cross-origin-nonfile-law", ((r) => { leg(r, 'sp84-cross-origin-nonfile').childLate = 1; }));
add("w-ctx-childid-dropped", "context-binding", ((r) => {
    const l = leg(r, 'sp84-cross-origin-nonfile');
    l.childContextId = 'CTX-BOGUS';
    for (const c of l.cdpSendLog) if (c.method === 'Runtime.evaluate' && c.params.contextId !== undefined) c.params.contextId = 'CTX-BOGUS';
  }));
add("w-ctx-default-dropped", "context-binding", ((r) => {
    const l = leg(r, 'sp84-cross-origin-nonfile');
    const c = l.contexts.find((x) => x.origin === 'http://127.0.0.1:' + r.ports.child && x.isDefault === true);
    c.isDefault = false;
  }));
add("w-ctx-frameid-unique-dropped", "context-binding", ((r) => {
    const l = leg(r, 'sp84-cross-origin-nonfile');
    const c = l.contexts.find((x) => x.origin === 'http://127.0.0.1:' + r.ports.child && x.isDefault === true);
    c.frameId = l.frameTree.mainFrameId;
  }));
add("w-ctx-unexpected-dropped", "context-binding", ((r) => { leg(r, 'sp84-accept-answer').childContextId = 'CTX-EXTRA'; }));
add("w-dismiss-error-dropped", "dismiss-law", ((r) => { leg(r, 'sp84-accept-answer').dismissError = { code: 1, message: 'x' }; }));
add("w-event-ret-any", "event-types", ((r) => { PTR_EV(r, 'sp84-accept-answer', 'click').ret = 5; }));
add("w-event-window-lower-dropped", "event-leg-window", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    const pre = l.marks.find((m) => m.name === 'pre').at;
    evs(r, 'sp84-accept-answer')[0].at = Math.round((pre - 1) * 10) / 10;
  }));
add("w-event-window-order-dropped", "event-leg-window", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    const pre = l.marks.find((m) => m.name === 'pre').at;
    const e = evs(r, 'sp84-accept-answer');
    const held = e[1].at;
    let back = Math.round((held - 0.1) * 10) / 10;
    if (back < pre) back = Math.round((pre + 0.1) * 10) / 10;
    if (back >= held) return;
    e[2].at = back;
  }));
add("w-event-window-start-leg-dropped", "event-leg-window", ((r) => { evs(r, 'sp84-accept-answer').filter((e) => e.type === 'input')[0].leg = 'start'; }));
add("w-extras-child-act-dropped", "sp84-cross-origin-month-law", ((r) => { leg(r, 'sp84-cross-origin-month').childEvents[0].act = false; }));
add("w-fixture-childkeys-open", "fixture-hash", ((r) => { r.fixture.child.extra = 1; }));
add("w-fixture-childsha-any", "fixture-hash", ((r) => { r.fixture.child.sha256 = 'zz'; }));
add("w-fixture-viewport-dropped", "fixture-hash", ((r) => { r.fixture.viewport = { width: 800, height: 600 }; }));
add("w-frame-binding-url-dropped", "frame-binding", ((r) => { leg(r, 'sp84-accept-answer').frameTree.mainFrameUrl = 'http://127.0.0.1:1/'; }));
add("w-frame-tree-id-any", "frame-tree", ((r) => { r.frameTree.mainFrameId = 'not-a-frame-id'; }));
add("w-frame-tree-keys-open", "frame-tree", ((r) => { r.frameTree.extra = 1; }));
add("w-gesture-ret-dropped", "gesture-law", ((r) => { leg(r, 'sp84-click-while-open').showPicker.ret = 'x'; }));
add("w-gesture-unexpected-dropped", "gesture-law", ((r) => { leg(r, 'sp84-cross-origin-nonfile').showPicker = { ok: true, ret: 'undefined' }; }));
add("w-host-product-dropped", "host-chromium", ((r) => { r.host.cdpProduct = 'Chrome/154.0.0.0'; }));
add("w-host-protocol-dropped", "host-chromium", ((r) => { r.host.cdpProtocolVersion = '1.2'; }));
add("w-intercept-error-dropped", "leg-records", ((r) => { leg(r, 'sp84-accept-answer').interceptError = { note: 1 }; }));
add("w-leg-errors-open", "leg-records", ((r) => { leg(r, 'sp84-accept-answer').errors.push('x'); }));
add("w-leg-wait-unbounded", "leg-records", ((r) => { leg(r, 'sp84-accept-answer').chooserWaitMs = 5000; }));
add("w-marks-closedat-dropped", "leg-marks", ((r) => { leg(r, 'sp84-accept-answer').closedAt = 'x'; }));
add("w-marks-grid-dropped", "leg-marks", ((r) => { leg(r, 'sp84-accept-answer').marks[0].at = 1.23456; }));
add("w-marks-monotonic-dropped", "leg-marks", ((r) => { const m = leg(r, 'sp84-accept-answer').marks; m[1].at = m[0].at - 5; }));
add("w-marks-name-type-dropped", "leg-marks", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    const at = l.marks[1].at + 0.1;
    l.marks.splice(2, 0, { name: 5, at });
  }));
add("w-marks-settle-dropped", "leg-marks", ((r) => { const m = leg(r, 'sp84-accept-answer').marks; m[m.length - 1].name = 'done'; }));
add("w-marks-start-labels-dropped", "leg-marks", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    l.marks[0].name = 'begin';
    l.marks[1].name = 'before';
  }));
add("w-no-selection-dismissstate-dropped", "no-selection-law", ((r) => {
    const l = leg(r, 'sp84-accept-answer');
    l.stateAfterDismiss = Object.assign({}, l.stateAfterDismiss, { k: [] });
  }));
add("w-order-cod-childlate-dropped", "order-law", ((r) => { leg(r, 'sp84-cross-origin-nonfile-disabled').childLate = 1; }));
add("w-ports-childorigin-dropped", "ports-declared", ((r) => { r.fixture.child.origin = 'http://127.0.0.1:1'; }));
add("w-ports-httporigin-dropped", "ports-declared", ((r) => { r.fixture.origin = 'http://127.0.0.1:1'; }));
add("w-ports-min-dropped", "ports-declared", ((r) => {
    const old = r.ports.http;
    r.ports.http = 80;
    r.fixture.origin = 'http://127.0.0.1:80';
    for (const l of r.legs) {
      for (const c of l.cdpSendLog) if (c.method === 'Page.navigate') c.params.url = c.params.url.split('127.0.0.1:' + old + '/').join('127.0.0.1:80/');
      for (const e of l.cdpEventLog) if (e.method === 'Page.frameNavigated') e.params.url = e.params.url.split('127.0.0.1:' + old + '/').join('127.0.0.1:80/');
    }
  }));
add("w-priorclick-error-dropped", "leg-records", ((r) => { leg(r, 'sp84-accept-answer').priorClickError = { note: 1 }; }));
add("w-replay-browser-unique-dropped", "replay-devtools-url", ((r) => {
    const a = leg(r, 'sp84-accept-answer'), b = leg(r, 'sp84-webkitdirectory-answer');
    b.devtoolsListening = JSON.parse(JSON.stringify(a.devtoolsListening));
    b.stderrHead = 'DevTools listening on ' + b.devtoolsListening.url;
  }));
add("w-replay-token-unique-dropped", "replay-launch-token", ((r) => {
    const a = leg(r, 'sp84-accept-answer'), b = leg(r, 'sp84-webkitdirectory-answer');
    const tok = a.launchToken;
    b.launchToken = tok;
    const i = b.argv.findIndex((x) => typeof x === 'string' && x.startsWith('--user-data-dir='));
    b.argv[i] = b.argv[i].replace(/profile-[0-9a-f]{12}$/, 'profile-' + tok);
  }));
add("w-runwindow-upper-dropped", "run-window", ((r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); }));
add("w-sendid-order-dropped", "send-log-allowlist", ((r) => { renumber(r, 'sp84-accept-answer'); }));
add("w-sendlog-child-expr-any", "send-log-allowlist", ((r) => {
    const l = leg(r, 'sp84-cross-origin-nonfile');
    l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.__evil()', returnByValue: true, contextId: l.childContextId } });
  }));
add("w-sendlog-getframetree-once-dropped", "send-log-allowlist", ((r) => {
    const log = leg(r, 'sp84-accept-answer').cdpSendLog;
    const ft = log.find((c) => c.method === 'Page.getFrameTree');
    log.push({ id: log.length + 1, method: 'Page.getFrameTree', params: JSON.parse(JSON.stringify(ft.params)) });
  }));
add("w-sendlog-navigate-params-loosened", "send-log-allowlist", ((r) => { leg(r, 'sp84-accept-answer').cdpSendLog.find((c) => c.method === 'Page.navigate').params.url = 'http://127.0.0.1:1/?run=x'; }));
add("w-sendlog-parent-expr-any", "send-log-allowlist", ((r) => {
    const log = leg(r, 'sp84-accept-answer').cdpSendLog;
    log.push({ id: log.length + 1, method: 'Runtime.evaluate', params: { expression: 'window.__evil()', returnByValue: true } });
  }));
add("w-sendlog-prologue-loosened", "send-log-allowlist", ((r) => {
    const log = leg(r, 'sp84-accept-answer').cdpSendLog;
    const a = log[1].method, b = log[2].method;
    log[1].method = b; log[2].method = a;
    const pa = log[1].params, pb = log[2].params;
    log[1].params = pb; log[2].params = pa;
  }));
add("w-server-404-dropped", "server-log-binding", ((r) => { leg(r, 'sp84-accept-answer').serverLog.push({ path: '/other', status: 200, run: r.nonce }); }));
add("w-server-root-count-open", "server-log-binding", ((r) => { const l = leg(r, 'sp84-accept-answer'); l.serverLog.push({ path: '/', status: 200, run: r.nonce }); }));
add("w-teardown-closed-any", "teardown-closure", ((r) => { leg(r, 'sp84-accept-answer').teardown.portProbes.child = 'open'; }));
add("w-teardown-curl-any", "teardown-closure", ((r) => { leg(r, 'sp84-accept-answer').teardown.postKillCurl.child = 0; }));
add("w-teardown-probes-open", "teardown-closure", ((r) => { delete leg(r, 'sp84-accept-answer').teardown.portProbes.child; }));
add("w-trigger2-error-dropped", "leg-records", ((r) => { leg(r, 'sp84-accept-answer').trigger2Error = { note: 1 }; }));
add("w-trust-pointer-dropped", "trust-law", ((r) => { PTR_EV(r, 'sp84-accept-answer', 'click').leg = 'show-picker'; }));
add("w-webkitdir-answer-keys-open", "webkitdirectory-answer-law", ((r) => { leg(r, 'sp84-webkitdirectory-answer').answer.extra = 1; }));
// ---- run ----
const results = [];
let mirrorBuilt = false;
for (const c of cases) {
  const priorPaths = fs.readFileSync(path.resolve(priorSet), 'utf8').split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
  const priorFile = priorPaths.length ? (path.isAbsolute(priorPaths[0]) ? priorPaths[0] : path.join(lane, priorPaths[0])) : null;
  const ctx = { real: clone(real), prior: priorFile ? JSON.parse(fs.readFileSync(priorFile, 'utf8')) : null };
  const r = clone(real);
  let laneArg = lane;
  let extraArgs = [];
  let receiptPath = realPath;
  try {
    if (c.name === 'prior-set-unmatched-exempt') {
      extraArgs = ['--tree-exempt-sha256', '1'.repeat(64)];
    } else if (c.name === 'prior-set-complete') {
      if (!mirrorBuilt) { buildMirror(); mirrorBuilt = true; }
      laneArg = mirrorLane;
      const p = path.join(mirrorLane, '.ufo/waves/round-90/stray-receipt.json');
      fs.writeFileSync(p, JSON.stringify(real));
      receiptPath = path.resolve(realPath);
    } else if (c.name === 'prior-set-unparsable') {
      if (!mirrorBuilt) { buildMirror(); mirrorBuilt = true; }
      laneArg = mirrorLane;
      fs.rmSync(path.join(mirrorLane, '.ufo/waves/round-90/stray-receipt.json'), { force: true });
      fs.writeFileSync(path.join(mirrorLane, '.ufo/waves/round-90/stray-unparsable.json'), '{"schema": "tabi-chrome-cdp-showpicker-r90", broken');
      receiptPath = path.resolve(realPath);
    } else {
      c.mutate(r, ctx);
      receiptPath = writeCase(c.name, r);
    }
  } catch (e) {
    results.push({ case: c.name, ok: false, detail: 'mutation threw: ' + e.message });
    if (firstFailure) break;
    continue;
  }
  const res = runCounter(receiptPath, laneArg, extraArgs);
  const ids = res.json && Array.isArray(res.json.findings) ? res.json.findings.map((f) => f.id) : [];
  let ok, detail;
  if (c.accept) {
    ok = res.status === 0 && res.json && res.json.verdict === 'clean' && ids.length === 0;
    detail = 'exit ' + res.status + ' verdict ' + (res.json ? res.json.verdict : null) + ' findings ' + JSON.stringify(ids.slice(0, 8));
  } else {
    const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
    ok = res.status === 1 && ids.includes(c.expect) && extra.length === 0;
    detail = 'exit ' + res.status + ' expected ' + c.expect + ' got ' + JSON.stringify(ids.slice(0, 10)) + (extra.length ? ' extra ' + JSON.stringify(extra) : '');
  }
  results.push({ case: c.name, accept: c.accept, expect: c.expect, ok, detail });
  if (!ok && firstFailure) break;
}
const failed = results.filter((x) => !x.ok);
const covered = new Set(results.filter((x) => x.ok && !x.accept).map((x) => x.expect));
const declared = (() => { const res = runCounter(realPath, lane); return res.json && res.json.checks ? Object.keys(res.json.checks) : []; })();
const uncovered = declared.filter((id) => !covered.has(id));
const out = { schema: 'tabi-r90-battery', cases: results.length, failed: failed.length, coverage: { declared: declared.length, covered: covered.size, uncovered, unknown: [...covered].filter((c) => !declared.includes(c)) }, results: results.filter((x) => !x.ok) };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ cases: out.cases, failed: out.failed, coverage: out.coverage, failures: out.results }, null, 1) + '\n');
process.exitCode = out.failed === 0 && uncovered.length === 0 ? 0 : 1;
