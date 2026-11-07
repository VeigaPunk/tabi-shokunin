// Witness runner for seat R80Mut1: for each survivor, build a receipt/invocation that the PRISTINE
// counter accepts (exit 0, no findings) and the MUTANT counter refuses with the expected id. That
// turns a survivor from "the battery misses it" into "the battery misses it but a witness exists".
// Survivors with no witness are classified: subsumed (another check catches the same defect),
// equivalent (no observable difference), or unreachable (the frozen plan cannot produce the shape).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';

const ROOT = '/fast/scratch/hyaku/tabi-r80/R80Mut1';
const LANE = path.join(ROOT, 'lane/tabi-shokunin');
const RECEIPT = path.join(LANE, 'corpus/evidence/round80/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-80/controls/c1/prior-set.txt');
const PIN = 'cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc';
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : null; };
const COUNTER = arg('counter');
const LABEL = arg('label') || 'unlabeled';
const OUT = arg('out') || path.join(ROOT, 'witness-' + LABEL + '.json');
const src = fs.readFileSync(COUNTER, 'utf8');
const real = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
const NONCE = real.nonce, FIXTURE = real.fixture.sha256;
const WDIR = path.join(ROOT, 'witness-cases', LABEL);
fs.mkdirSync(WDIR, { recursive: true });
const realSha = crypto.createHash('sha256').update(fs.readFileSync(RECEIPT)).digest('hex');
const clone = (v) => JSON.parse(JSON.stringify(v));
const leg = (r, n) => r.legs.find((l) => l.name === n);
const openOf = (r, n) => r.legs.find((l) => l.name === n).cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
const evs = (r, n) => r.legs.find((l) => l.name === n).pageEvents;
const sendOf = (r, n, m, k = 0) => r.legs.find((l) => l.name === n).cdpSendLog.filter((c) => c.method === m)[k];

const counterFor = (m) => {
  const cands = m.fromVariants ? m.fromVariants : [[m.from, m.to]];
  for (const [f, t] of cands) if (src.split(f).length - 1 === 1) return src.replace(f, t);
  return null;
};
const MUT = new Map(MUTANTS.map((m) => [m.name, m]));
const mutatedCache = new Map();
const mutantCounterPath = (name) => {
  if (mutatedCache.has(name)) return mutatedCache.get(name);
  const m = MUT.get(name);
  const text = m ? counterFor(m) : null;
  if (!text) { mutatedCache.set(name, null); return null; }
  const p = path.join(WDIR, 'counter-' + name + '.mjs');
  fs.writeFileSync(p, text);
  mutatedCache.set(name, p);
  return p;
};

const run = (counterPath, receiptPath, extraArgs = [], noExempt = false) => {
  // extras come FIRST: the counter's opt() reads the first occurrence, so an override must precede
  // the standard argument of the same name
  const args = [counterPath, ...extraArgs, '--lane', LANE, '--receipt', receiptPath, '--expect-driver-sha256', PIN,
    '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET,
    ...(noExempt ? [] : ['--tree-exempt-sha256', realSha]), '--json'];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 30000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, verdict: j && j.verdict, ids: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null, stderr: (r.stderr || '').slice(0, 300) };
};

// ---- witness table: apply(r) mutates a clone of the receipt; extraArgs are invocation witnesses ----
const W = [];
const add = (id, mutant, expect, apply, extraArgs = []) => W.push({ id, mutant, expect, apply, extraArgs });

// answer-law conjuncts
add('w-answer-files', 'answer-files-any', 'answer-law', (r) => { leg(r, 'sp80-trigger-then-answer').answer.files = ['other.txt']; });
add('w-answer-basename', 'answer-basename-any', 'answer-law', (r) => {
  const l = leg(r, 'sp80-trigger-then-answer');
  l.answer.setParams.files = ['/x/other.txt'];
  sendOf(r, 'sp80-trigger-then-answer', 'DOM.setFileInputFiles').params.files = ['/x/other.txt'];
});
add('w-answer-setparams-count', 'answer-setparams-count', 'answer-law', (r) => {
  const l = leg(r, 'sp80-trigger-then-answer');
  l.answer.setParams.files = ['/x/tabi-r80-a.txt', '/x/b.txt'];
  sendOf(r, 'sp80-trigger-then-answer', 'DOM.setFileInputFiles').params.files = ['/x/tabi-r80-a.txt', '/x/b.txt'];
});
add('w-answer-seterror', 'answer-seterror-dropped', 'answer-law', (r) => { leg(r, 'sp80-trigger-then-answer').answer.setError = { code: 1, message: 'x' }; });
add('w-answer-setresult', 'answer-setresult-any', 'answer-law', (r) => { leg(r, 'sp80-trigger-then-answer').answer.setResult = { x: 1 }; });
// identity
add('w-driver-pin-prefix', 'driver-pin-prefix', 'driver-pin', (r) => { r.driverSha256 = PIN.slice(0, 32) + '0'.repeat(32); });
add('w-fixture-hash-prefix', 'fixture-hash-prefix', 'fixture-hash', (r) => { r.fixture.sha256 = FIXTURE.slice(0, 8) + '0'.repeat(56); });
add('w-fixture-child-hash', 'fixture-child-hash-any', 'fixture-hash', (r) => { r.fixture.child.sha256 = 'zz'; });
add('w-fixture-keys', 'fixture-keys-open', 'fixture-hash', (r) => { r.fixture.extra = 1; });
add('w-fixture-viewport', 'fixture-viewport-any', 'fixture-hash', (r) => { r.fixture.viewport = { width: 1, height: 1 }; });
add('w-frame-tree-parent', 'frame-tree-parent-any', 'frame-tree', (r) => { r.frameTree.mainFrameParentId = 'X'; });
add('w-host-product', 'host-cdp-product-dropped', 'host-chromium', (r) => { r.host.cdpProduct = 'Chrome/999.0.0.0'; });
add('w-host-protocol', 'host-cdp-protocol-dropped', 'host-chromium', (r) => { r.host.cdpProtocolVersion = '9.9'; });
add('w-lane-prefix', 'lane-prefix-accepted', 'lane', (r) => { r.lane = 'tabi'; });
add('w-ports-floor', 'ports-floor-lowered', 'ports-declared', (r) => {
  r.ports.http = 80;
  r.fixture.origin = 'http://127.0.0.1:80';
  for (const l of r.legs) {
    const nav = l.cdpSendLog.find((c) => c.method === 'Page.navigate');
    nav.params.url = nav.params.url.replace(':' + real.ports.http + '/', ':80/');
    const fn = l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated');
    fn.params.url = fn.params.url.replace(':' + real.ports.http + '/', ':80/');
  }
});
add('w-ports-http-origin', 'ports-http-origin-dropped', 'ports-declared', (r) => { r.fixture.origin = 'http://127.0.0.1:1'; });
// leg records / marks
add('w-leg-wait', 'leg-records-wait-any', 'leg-records', (r) => { leg(r, 'sp80-accept-png').chooserWaitMs = 99999; });
add('w-leg-arm-error', 'leg-records-arm-error-dropped', 'leg-records', (r) => { leg(r, 'sp80-deferred-timer').armError = { code: 'x', message: 'y' }; });
add('w-leg-trigger2-error', 'leg-records-trigger2-error-dropped', 'leg-records', (r) => { leg(r, 'sp80-twice-gesture').trigger2Error = { code: 'x', message: 'y' }; });
add('w-leg-marks-grid', 'leg-marks-grid-dropped', 'leg-marks', (r) => { const m = leg(r, 'sp80-accept-png').marks; m[2].at = m[1].at + 1.25; });
add('w-leg-marks-order', 'leg-marks-monotonic-dropped', 'leg-marks', (r) => { const m = leg(r, 'sp80-accept-png').marks; m[3].at = m[1].at - 1; });
add('w-leg-marks-start', 'leg-marks-start-dropped', 'leg-marks', (r) => { leg(r, 'sp80-accept-png').marks[0].name = 'begin'; });
add('w-leg-closedat-inf', 'num-finite-dropped', 'leg-marks', (r) => { /* raw 1e999 written below */ });
// contexts
add('w-context-default', 'context-default-dropped', 'context-binding', (r) => {
  const l = leg(r, 'sp80-cross-origin');
  l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).isDefault = false;
});
add('w-context-mainframe', 'context-mainframe-dropped', 'context-binding', (r) => {
  const l = leg(r, 'sp80-cross-origin-disabled');
  l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child).frameId = l.frameTree.mainFrameId;
});
add('w-context-unexpected-id', 'context-unexpected-id-dropped', 'context-binding', (r) => { leg(r, 'sp80-accept-png').childContextId = 5; });
// CDP event log
add('w-cdp-aftersendid', 'cdp-aftersendid-any', 'cdp-event-log-closed', (r) => {
  const l = leg(r, 'sp80-cross-origin');
  const o = l.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
  o.afterSendId = l.priorReleaseId + 0.5;
});
add('w-cdp-nav-count', 'cdp-nav-count-lowered', 'cdp-event-log-closed', (r) => {
  const l = leg(r, 'sp80-accept-png');
  const nav = l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated');
  l.cdpEventLog.push(clone(nav));
});
add('w-cdp-open-keys', 'cdp-open-keys-open', 'cdp-event-log-closed', (r) => { openOf(r, 'sp80-accept-png').params.extra = 1; });
add('w-cdp-open-mode', 'cdp-open-mode-any', 'cdp-event-log-closed', (r) => { openOf(r, 'sp80-cross-origin').params.mode = 'weird'; });
// page events
add('w-event-window-order', 'event-window-order-dropped', 'event-leg-window', (r) => {
  const e = evs(r, 'sp80-accept-png');
  e[0].at = e[1].at + 5; e[0].ts = e[1].ts + 5;
});
add('w-event-start-leg', 'event-window-start-leg-dropped', 'event-leg-window', (r) => { evs(r, 'sp80-accept-png')[0].leg = 'start'; });
add('w-seq-offby-one', 'seq-monotonic-offby-one', 'seq-monotonic', (r) => { evs(r, 'sp80-accept-png')[0].seq = 2; });
add('w-leg-shape-opened', 'leg-shape-opened-dropped', 'leg-sp80-cross-origin', (r) => { openOf(r, 'sp80-cross-origin').params.mode = 'selectMultiple'; });
// laws
add('w-gesture-ret', 'gesture-ret-dropped', 'gesture-law', (r) => { leg(r, 'sp80-webkitdirectory').showPicker.ret = 'x'; });
add('w-activation-hasbeen', 'activation-hasbeen-dropped', 'activation-law', (r) => { leg(r, 'sp80-accept-png').activationBefore = { isActive: true, hasBeenActive: false }; });
add('w-deferred-ret', 'deferred-ret-dropped', 'deferred-law', (r) => { leg(r, 'sp80-deferred-timer').deferredResult.ret = 'x'; });
add('w-cross-shape', 'cross-shape-dropped', 'cross-origin-law', (r) => { leg(r, 'sp80-cross-origin').childEvents[2].type = 'mouseup'; });
add('w-cross-childlate', 'cross-childlate-dropped', 'cross-origin-law', (r) => { leg(r, 'sp80-cross-origin').childLate = 1; });
add('w-cod-childlate', 'cod-childlate-dropped', 'cross-origin-disabled-law', (r) => { leg(r, 'sp80-cross-origin-disabled').childLate = 1; });
add('w-no-selection-dismiss', 'no-selection-dismiss-state-dropped', 'no-selection-law', (r) => { leg(r, 'sp80-trigger-then-answer').stateAfterDismiss.s = []; });
// plan calls
add('w-plan-intercept-id', 'plan-intercept-id-dropped', 'plan-calls', (r) => { leg(r, 'sp80-accept-png').interceptSendId = 999; });
add('w-plan-dismiss-id', 'plan-dismiss-id-dropped', 'plan-calls', (r) => { leg(r, 'sp80-accept-png').dismissSendId = 999; });
add('w-plan-prior-ids', 'plan-prior-ids-dropped', 'plan-calls', (r) => { const l = leg(r, 'sp80-accept-png'); l.priorReleaseId = l.priorPressId; });
// send log
add('w-send-navigate', 'send-navigate-url-dropped', 'send-log-allowlist', (r) => {
  sendOf(r, 'sp80-accept-png', 'Page.navigate').params.url = 'http://127.0.0.1:1/';
});
add('w-send-once', 'send-once-dropped', 'send-log-allowlist', (r) => {
  const l = leg(r, 'sp80-accept-png');
  const bv = l.cdpSendLog.find((c) => c.method === 'Browser.getVersion');
  l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Browser.getVersion', params: clone(bv.params) });
});
add('w-send-prologue', 'send-prologue-dropped', 'send-log-allowlist', (r) => {
  const l = leg(r, 'sp80-accept-png');
  const a = l.cdpSendLog.find((c) => c.method === 'Page.enable');
  const b = l.cdpSendLog.find((c) => c.method === 'Runtime.enable');
  const ap = a.params, bp = b.params;
  a.params = bp; b.params = ap;
  const am = a.method, bm = b.method;
  a.method = bm; b.method = am;
});
add('w-send-params', 'send-params-any', 'send-log-allowlist', (r) => { sendOf(r, 'sp80-accept-png', 'Page.enable').params = null; });
// host / teardown / server
add('w-argv-browserid', 'argv-browserid-any', 'host-argv', (r) => { leg(r, 'sp80-accept-png').devtoolsListening.browserId = 'zz'; });
add('w-argv-stderr', 'argv-stderr-dropped', 'host-argv', (r) => { leg(r, 'sp80-accept-png').stderrHead = 'no devtools line here'; });
add('w-argv-token-shape', 'argv-token-shape-any', 'host-argv', (r) => {
  const l = leg(r, 'sp80-accept-png');
  l.launchToken = 'zzzzzzzzzzzz';
  const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir='));
  l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice(16)), 'profile-zzzzzzzzzzzz');
});
add('w-teardown-curl', 'teardown-curl-any', 'teardown-closure', (r) => { leg(r, 'sp80-accept-png').teardown.postKillCurl.devtools = 0; });
add('w-teardown-probes', 'teardown-probes-any', 'teardown-closure', (r) => { leg(r, 'sp80-accept-png').teardown.portProbes.devtools = 'open'; });
add('w-server-status', 'server-status-any', 'server-log-binding', (r) => { leg(r, 'sp80-accept-png').serverLog.find((s) => s.path === '/').status = 500; });
add('w-server-root-count', 'server-root-count-widened', 'server-log-binding', (r) => {
  const l = leg(r, 'sp80-accept-png');
  l.serverLog.push({ path: '/', run: r.nonce, status: 200 });
});
add('w-child-server-status', 'child-server-status-any', 'child-server-log-binding', (r) => { leg(r, 'sp80-accept-png').childServerLog.find((s) => s.path === '/child.html').status = 500; });
// replay
add('w-replay-token-shape', 'replay-token-shape-any', 'replay-launch-token', (r) => {
  const l = leg(r, 'sp80-accept-png');
  l.launchToken = 'zzzzzzzzzzzz';
  const i = l.argv.findIndex((a) => a.startsWith('--user-data-dir='));
  l.argv[i] = '--user-data-dir=' + path.join(path.dirname(l.argv[i].slice(16)), 'profile-zzzzzzzzzzzz');
});
add('w-replay-browser-unique', 'replay-browser-unique-any', 'replay-devtools-url', (r) => {
  const a = leg(r, 'sp80-accept-png'), b = leg(r, 'sp80-webkitdirectory');
  b.devtoolsListening = clone(a.devtoolsListening);
  b.stderrHead = 'DevTools listening on ' + b.devtoolsListening.url;
});
// helpers (shared helpers on errOk)
add('w-err-code', 'err-code-any', 'leg-records', (r) => { leg(r, 'sp80-accept-png').priorClickError = { code: 'x', message: 'y' }; });
add('w-err-keys', 'err-keys-open', 'leg-records', (r) => { leg(r, 'sp80-accept-png').priorClickError = { code: null, message: 'y', extra: 1 }; });
// invocation witnesses
add('w-cli-pin', 'cli-pin-hex-dropped', 'usage', null, ['--expect-driver-sha256', 'zz']);
add('w-cli-fixture', 'cli-fixture-hex-dropped', 'usage', null, ['--expect-fixture-sha256', 'zz']);
add('w-cli-exempt', 'cli-exempt-hex-dropped', 'usage', null, ['--tree-exempt-sha256', 'zz']);
add('w-cli-tree-exempt', 'cli-tree-exempt-path-accepted', 'usage', null, ['--tree-exempt', 'x']);
add('w-prior-empty', 'prior-set-empty-ok', 'prior-unreadable', null, ['--prior-set', path.join(WDIR, 'empty-prior-set.txt')]);
add('w-self-real', 'self-real-dropped', 'prior-set-complete', null, ['--self-real-mode']);
W[W.length - 1].noExempt = true;

fs.writeFileSync(path.join(WDIR, 'empty-prior-set.txt'), '# empty\n');

const results = [];
for (const w of W) {
  const m = MUT.get(w.mutant);
  if (!m) { results.push({ id: w.id, mutant: w.mutant, outcome: 'unknown-mutant' }); continue; }
  const mpath = mutantCounterPath(w.mutant);
  if (!mpath) { results.push({ id: w.id, mutant: w.mutant, outcome: 'unapplied' }); continue; }
  let receiptPath = RECEIPT;
  let extra = w.extraArgs.slice();
  if (w.apply) {
    const r = clone(real);
    w.apply(r);
    receiptPath = path.join(WDIR, w.id + '.json');
    if (w.id === 'w-leg-closedat-inf') {
      const txt = JSON.stringify(r).replace(/"closedAt":([0-9.]+)/, '"closedAt":1e999');
      fs.writeFileSync(receiptPath, txt);
    } else fs.writeFileSync(receiptPath, JSON.stringify(r));
    extra = [];  // witness receipts live outside the walked trees: no exemption needed
  }
  if (w.id === 'w-self-real') {
    // the receipt under test IS the walked file; the exemption is what the pristine run relies on
    receiptPath = RECEIPT;
    extra = [];
  }
  const p = run(COUNTER, receiptPath, extra, !!w.noExempt);
  const mm = run(mpath, receiptPath, extra, !!w.noExempt);
  // a witness is a battery case the battery lacks: the PRISTINE counter refuses it with the
  // expected id, and the MUTANT no longer lists that id (so the case would fail on the mutant)
  const wantStatus = (w.expect === 'usage' || w.expect === 'prior-unreadable') ? 2 : 1;
  const pristineRefuses = p.status === wantStatus && p.ids && p.ids.includes(w.expect);
  const mutantMisses = !(mm.ids && mm.ids.includes(w.expect));
  results.push({
    id: w.id, mutant: w.mutant, expect: w.expect,
    pristine: { status: p.status, verdict: p.verdict, ids: p.ids },
    mutantRun: { status: mm.status, verdict: mm.verdict, ids: mm.ids },
    outcome: pristineRefuses && mutantMisses ? 'witness' : (!pristineRefuses ? 'pristine-did-not-refuse' : 'mutant-still-refuses'),
  });
}
const ok = results.filter((r) => r.outcome === 'witness').length;
fs.writeFileSync(OUT, JSON.stringify({ label: LABEL, counter: COUNTER, witnesses: results.length, ok, results }, null, 1));
for (const r of results) if (r.outcome !== 'witness') process.stderr.write('NOT-WITNESS ' + r.id + ' ' + r.outcome + ' pristine=' + JSON.stringify(r.pristine) + ' mutant=' + JSON.stringify(r.mutantRun) + '\n');
process.stdout.write(JSON.stringify({ label: LABEL, witnesses: results.length, ok, failed: results.filter((r) => r.outcome !== 'witness').map((r) => r.id + ':' + r.outcome) }, null, 1) + '\n');
