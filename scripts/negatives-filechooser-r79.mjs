#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-filechooser-r78.mjs (tabi round 79, routed defect
// 3a, seat R79Exec4). IMPORTS nothing from scripts/negatives-filechooser-r78.mjs; it reuses that
// battery's case harness shape (clone the real receipt, mutate, launder legShape from the counter's
// own re-derivation, run the counter BY PATH - the counter beside this file - and judge) and carries
// the r78 battery's 400 cases by INVOKING it for the base coverage: the r78 battery is staged beside
// the counter under test (in kill-power runs that is the mutant counter) and must exit 0 allOk.
// On top of the carried coverage this battery adds ONE witness case per semantic mutant that the
// round-78 mutation run left alive (.ufo/waves/round-78-seats/R78Mut1/semantic-mutants-cur.json,
// results[].outcome == "survived", 21 mutants). Each case drives the check the mutant weakens to a
// named finding id under the honest counter:
//   kill-typed-x-pointer-null-triple        sem-typed-x-integer-to-number        event-types
//   kill-errOk-message-type                 sem-errOk-message-key-only           leg-records
//   kill-legrec-interceptresult-unplanned   sem-legrec-interceptresult-null-dropped  leg-records
//   kill-legrec-openednode-unopened         sem-legrec-opened-node-null-dropped  leg-records
//   kill-legrec-set-eq-trigger              sem-legrec-set-before-trigger-strict leg-records
//   kill-node-binding-nonpositive           sem-node-positive-dropped            node-binding-law
//   kill-node-inputs-three                  sem-node-inputs-ge                   node-binding-law
//   kill-fixi-count-six                     sem-fixi-count-ge                    fixture-descriptors
//   kill-fixi-rect-right-edge               sem-fixi-rect-right-edge             fixture-descriptors
//   kill-gapmin-50.0-prior-need (accept)    sem-gapmin-strict                    (replay-event-timeline)
//   kill-selection-interceptoff-cancel-gone sem-selection-interceptoff-dropped   cancel-law
//   kill-failures-not-array                 sem-failures-array-dropped           failures-empty
//   kill-argv-profile-relative              sem-argv-profile-absolute-dropped    host-argv
//   kill-devtools-url-port                  sem-devtools-url-includes            devtools-port-binding
//   kill-trust-law-type-mousedown           sem-trust-type-dropped               trust-law
//   kill-read-law-ret-hex-00                sem-readlaw-sha-dropped              read-law
//   kill-walk-exempt-relative (accept)      sem-walk-exempt-lane-join-dropped    prior-set-complete
//   kill-legwindow-order-0.03               sem-legwindow-order-tolerance        event-leg-window
//   kill-server-root-status-404             sem-server-root-status-dropped       server-log-binding
//   kill-runwindow-600000-exact             sem-runwindow-upper-inclusive        run-window
//   kill-frame-tree-url                     sem-frame-tree-url-dropped           frame-tree
// The two accept cases pin the ONLY side on which those two mutants can be caught at all:
//  - sem-gapmin-strict (>= GAP_MIN -> >) shrinks the PRIOR-side gap denominator: a prior whose
//    timeline carries an added exactly-50.0 ms gap must be ACCEPTED (real gapNeed 10 of 13 gaps,
//    9 matched) and is refused by the mutant (its gapNeed drops to 9, 9 >= 9).
//  - sem-walk-exempt-lane-join-dropped resolves a RELATIVE --tree-exempt against the process cwd
//    instead of the lane: a mirror lane with one unlisted schema-bearing receipt exempted by that
//    relative path must be ACCEPTED and is refused by the mutant (prior-set-complete).
// Exit 0 = positive run clean, r78 base coverage allOk, and every case as expected; 1 = otherwise;
// 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-filechooser-r78.mjs');
const R78_BATTERY = 'negatives-filechooser-r78.mjs';
const R78_DRIVER = 'chrome-cdp-filechooser-round78.mjs';
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane'); const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work'); const expectNonce = opt('expect-nonce'); const priorSet = opt('prior-set');
const extraPriors = multi('prior');
if (!lane || !path.isAbsolute(lane) || !realPath || !pin || !work || !path.isAbsolute(work) || !expectNonce || !priorSet) usage('--lane, --real, --expect-driver-sha256, --expect-nonce, --prior-set and an absolute --work are required');
const LAUNDER_EXPECT = { 'page-stub': 'send-log-allowlist', 'eval-trigger': 'chooser-call-count', 'swap-files': 'chooser-call-params' };
const launderedPaths = multi('laundered');
const launderedKinds = launderedPaths.map((p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')).degenerate; } catch { return null; } });
if (launderedPaths.length !== 3 || Object.keys(LAUNDER_EXPECT).some((k) => !launderedKinds.includes(k))) usage('exactly three --laundered receipts are required, one per degenerate kind: ' + Object.keys(LAUNDER_EXPECT).join(', ') + ' (got ' + JSON.stringify(launderedKinds) + ')');
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
fs.mkdirSync(work, { recursive: true });

// ---- case harness (shape of the r78 battery, re-implemented) ----
const clone = (v) => JSON.parse(JSON.stringify(v));
const q = (v) => Math.round(v * 10) / 10;
const LEGS = ['start', 'intercept-on', 'pick-single', 'pick-multiple', 'pick-same', 'pick-first-only', 'pick-missing', 'pick-empty', 'dir-mode', 'accept-ignored', 'forward-click', 'script-click', 'not-file-input', 'intercept-cancel', 'intercept-off'];
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const evType = (r, leg, type, target) => r.events.find((e) => e.leg === leg && e.type === type && (target === undefined || e.target === target));
const legOf = (r, leg) => r.legs.find((l) => l.name === leg);
const markAt = (r, leg) => r.legMarks[LEGS.indexOf(leg) + 1].at;
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const openOf = (r, leg) => { const l = legOf(r, leg); return r.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened' && e.afterSendId === l.triggerSendId); };
const sendOf = (r, id) => r.cdpSendLog.find((c) => c.id === id);
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], launder = true, opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, launder, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], launder: true, accept: true, opts });

// ---- timeline replicas (exact rules of the counter: TOL 0.05, GAP_MIN 50, needs from the prior) ----
const pairsOf = (x) => x.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const absMatched = (a, b) => { const y = pairsOf(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairsOf(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < 0.05 && Math.abs(v[1] - e.at) < 0.05); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = pairsOf(x).map((e) => e.at).sort((p, q2) => p - q2); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= 50) g.push(at[i] - at[i - 1]); return g; };
const gapMatched = (a, b) => { const x = [...gapsOf(a)].sort((p, q2) => p - q2), y = [...gapsOf(b)].sort((p, q2) => p - q2); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < 0.05) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const needs = (p) => [Math.ceil(0.5 * pairsOf(p).length - 1e-9), Math.ceil(0.75 * gapsOf(p).length - 1e-9)];
const placed = (p, wantAbs, wantGap, under = real) => {
  const [aN, gN] = needs(p); const an = absMatched(under, p), gn = gapMatched(under, p);
  const absOk = wantAbs === 'need' ? an >= aN : wantAbs === null ? an < aN : an === wantAbs;
  const gapOk = wantGap === 'any' ? true : wantGap === null ? gn < gN : gn === wantGap;
  if (!absOk || !gapOk) throw new Error('bracket misplaced: abs ' + an + ' (need ' + aN + ') gap ' + gn + ' (need ' + gN + ')');
  return p;
};
const shiftTs = (x, d) => { x.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); };
const breakGaps = (p0, brk, wantGap, under = real) => {
  for (const d of [0.3, 1.7, 7.3, 13.1, 29.9]) {
    const p = clone(p0); shiftTs(p, 1.0);
    const order = p.events.map((e, i) => [e.at, i]).sort((a, b) => a[0] - b[0]);
    const bounds = []; for (let k = 1; k < order.length; k++) if (order[k][0] - order[k - 1][0] >= 50) bounds.push(k);
    for (const k of bounds.slice(0, brk)) for (let m = k; m < order.length; m++) { const e = p.events[order[m][1]]; e.at = q(e.at + d); e.ts = q(e.ts + d); }
    if (gapMatched(under, p) === wantGap) return p;
  }
  throw new Error('breakGaps: no shift in the list yields ' + wantGap + ' matched gaps');
};
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { const o = x.host.launchToken; const nt = o.slice(0, -1) + (o.endsWith('0') ? '1' : '0'); x.host.launchToken = nt; x.host.argv = x.host.argv.map((a) => a.split(o).join(nt)); };
const priorIds = (p) => { swapToken(p); swapUrl(p); return p; };

// ---- the 21 R78Mut1-survivor witnesses ----
add('kill-typed-x-pointer-null-triple', 'event-types', (r) => { const e = evType(r, 'pick-same', 'click'); e.x = null; e.y = null; e.buttons = null; }, ['leg-pick-same-xy']);
add('kill-errOk-message-type', 'leg-records', (r) => { legOf(r, 'not-file-input').setError.message = 42; }, ['leg-not-file-input-error', 'not-file-input-law']);
add('kill-legrec-interceptresult-unplanned', 'leg-records', (r) => { legOf(r, 'forward-click').interceptResult = {}; }, []);
add('kill-legrec-openednode-unopened', 'leg-records', (r) => { legOf(r, 'intercept-off').openedNode = 5; }, []);
add('kill-legrec-set-eq-trigger', 'leg-records', (r) => { const l = legOf(r, 'pick-single'); l.setSendId = l.triggerSendId; }, ['chooser-event-binding']);
add('kill-node-binding-nonpositive', 'node-binding-law', (r) => { const old = legOf(r, 'pick-single').openedNode;
  for (const lg of r.legs) if (lg.opened === true && lg.openedNode === old) { lg.openedNode = 0; if (lg.setParams) { lg.setParams.backendNodeId = 0; sendOf(r, lg.setSendId).params.backendNodeId = 0; } }
  for (const o of r.cdpEventLog) if (o.method === 'Page.fileChooserOpened' && o.params.backendNodeId === old) o.params.backendNodeId = 0; }, []);
add('kill-node-inputs-three', 'node-binding-law', (r) => { const l = legOf(r, 'dir-mode'); r.cdpEventLog = r.cdpEventLog.filter((e) => !(e.method === 'Page.fileChooserOpened' && e.afterSendId === l.triggerSendId)); l.opened = false; l.openedNode = null; }, ['leg-dir-mode-opened-mode', 'activation-law', 'cdp-event-log-closed', 'chooser-event-binding']);
add('kill-fixi-count-six', 'fixture-descriptors', (r) => { const d = clone(r.fixtureInputs.find((x) => x.id === 's')); d.id = 'zz'; r.fixtureInputs.push(d); }, []);
add('kill-fixi-rect-right-edge', 'fixture-descriptors', (r) => { const d = r.fixtureInputs.find((x) => x.id === 's'); d.rect.left = 160 - d.rect.width; }, []);
accept('kill-gapmin-50.0-prior-need', () => {}, { prior: (p) => { priorIds(p);
  // two added >= 50 ms gaps in the last leg, one of them EXACTLY 50.0 ms: the real counter counts it
  // (gapNeed ceil(0.75*13) = 10 > 9 matched -> accept); the mutant drops it from the prior's gaps
  // (gapNeed 9 <= 9 matched -> refuse). The accepting side is the only decisive side of this mutant.
  const es = evsOf(p, 'intercept-off'); const mu = es.find((e) => e.type === 'mouseup'), ck = es.find((e) => e.type === 'click'), cc = es.find((e) => e.type === 'cancel');
  ck.at = q(mu.at + 60); ck.ts = q(mu.ts + 60); cc.at = q(ck.at + 50); cc.ts = q(ck.ts + 50);
  if (cc.at > p.closedAt) throw new Error('no room before closedAt');
  const gp = gapsOf(p).length; const m = Math.ceil(0.75 * (gp - 1) - 1e-9);
  let placedP = null;
  for (let brk = 0; brk <= gp && !placedP; brk++) { try { const cand = breakGaps(p, brk, m); placed(cand, null, m); placedP = cand; } catch {} }
  if (!placedP) throw new Error('no brk reaches matched ' + m);
  return placedP; } });
add('kill-selection-interceptoff-cancel-gone', 'cancel-law', (r) => { const c = evType(r, 'intercept-off', 'cancel'); r.events.splice(r.events.indexOf(c), 1); renumber(r); }, ['intercept-law', 'leg-intercept-off-seq', 'leg-intercept-off-trusted', 'leg-intercept-off-act', 'leg-intercept-off-xy', 'leg-intercept-off-files']);
add('kill-failures-not-array', 'failures-empty', (r) => { r.failures = 'none'; }, []);
add('kill-argv-profile-relative', 'host-argv', (r) => { r.host.argv[4] = '--user-data-dir=profile-' + r.host.launchToken; }, ['upload-binding', 'chooser-call-params', 'leg-records']);
add('kill-devtools-url-port', 'devtools-port-binding', (r) => { const d = r.host.devtoolsListening; const nu = d.url.replace('ws://127.0.0.1:' + d.port + '/', 'ws://127.0.0.1:9/'); r.host.stderrHead = r.host.stderrHead.split(d.url).join(nu); d.url = nu; }, []);
add('kill-trust-law-type-mousedown', 'trust-law', (r) => { evType(r, 'script-click', 'click').type = 'mousedown'; }, ['leg-script-click-seq', 'activation-law']);
add('kill-read-law-ret-hex-00', 'read-law', (r) => { evType(r, 'pick-single', 'read').ret = 'hex:00'; }, ['leg-pick-single-read']);
accept('kill-walk-exempt-relative', () => {}, { mirror: (m) => { fs.writeFileSync(path.join(m, '.ufo/waves/round-78/rel-exempt.json'), JSON.stringify({ ...clone(real), nonce: 'tabi-r78-rel-exempt' })); }, treeExemptRel: '.ufo/waves/round-78/rel-exempt.json' });
add('kill-legwindow-order-0.03', 'event-leg-window', (r) => { for (let i = 1; i < r.events.length; i++) { const e = r.events[i], p = r.events[i - 1];
  if (e.leg === p.leg && e.at === p.at && e.type !== 'read' && p.type !== 'read' && p.at > markAt(r, e.leg) + 0.1) { e.at = e.at - 0.03; return; } }
  throw new Error('no interior same-at pair'); }, ['event-time-quantum']);
add('kill-server-root-status-404', 'server-log-binding', (r) => { r.serverLog.find((s) => s.path === '/').status = 404; }, []);
add('kill-runwindow-600000-exact', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 600000).toISOString(); }, []);
add('kill-frame-tree-url', 'frame-tree', (r) => { r.frameTree.mainFrameUrl = 'https://example.test/'; }, []);

// QUALITY 154 (carried): a refusal case without an expected finding id is a broken case, not a test
const noExpect = cases.find((c) => !c.accept && (typeof c.expect !== 'string' || c.expect === ''));
if (noExpect) usage('refuse case ' + noExpect.name + ' declares no expected finding id');

const JOBS = Math.max(1, Number(opt('jobs') || 8));
const forceRm = (dir) => {
  const walk = (d) => { let st; try { st = fs.lstatSync(d); } catch { return; } if (!st.isDirectory()) return;
    try { fs.chmodSync(d, 0o700); } catch {}
    let es = []; try { es = fs.readdirSync(d); } catch {}
    for (const e of es) walk(path.join(d, e)); };
  walk(dir); try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
};
// a scratch mirror of the lane (the real lane is never written): scripts and every top-level entry of
// the two walked trees are symlinks to the real lane; cases add their own files to the mirror
const mkMirror = (name, fn) => {
  const m = path.join(work, 'mirror-' + name); forceRm(m);
  fs.mkdirSync(path.join(m, '.ufo/waves/round-78'), { recursive: true }); fs.mkdirSync(path.join(m, 'corpus/evidence'), { recursive: true });
  fs.symlinkSync(path.join(lane, 'scripts'), path.join(m, 'scripts'));
  for (const e of fs.readdirSync(path.join(lane, '.ufo/waves/round-78'))) fs.symlinkSync(path.join(lane, '.ufo/waves/round-78', e), path.join(m, '.ufo/waves/round-78', e));
  for (const t of ['round78', 'round77']) if (fs.existsSync(path.join(lane, 'corpus/evidence', t))) fs.symlinkSync(path.join(lane, 'corpus/evidence', t), path.join(m, 'corpus/evidence', t));
  fn(m, path.join(work, 'mirror-extra-' + name));
  return m;
};
const runCounter = (file, c = null) => new Promise((resolve) => {
  const o = (c && c.opts) || {};
  const extra = [];
  let ps = priorSet, ln = lane, cwd;
  if (o.priorReal) extra.push('--prior', realPath);
  if (o.prior) { let pj; try { pj = o.prior(clone(real)); } catch (e) { resolve({ exit: null, findingIds: null, derived: null, error: e.message }); return; } const pf = path.join(work, 'prior-' + c.name + '.json'); fs.writeFileSync(pf, JSON.stringify(pj)); extra.push('--prior', pf); }
  if (o.treeExemptRel) { cwd = path.join(work, 'cwd-' + (c ? c.name : 'x')); fs.mkdirSync(cwd, { recursive: true }); extra.push('--tree-exempt', o.treeExemptRel); }
  if (o.mirror) { try { ln = mkMirror(c.name, o.mirror); } catch (e) { resolve({ exit: null, findingIds: null, derived: null, error: 'mirror: ' + e.message }); return; } }
  const p = spawn(process.execPath, [COUNTER, '--lane', ln, '--receipt', file, '--expect-driver-sha256', pin, '--expect-nonce', o.nonce || expectNonce, '--prior-set', ps,
    ...extraPriors.flatMap((x) => ['--prior', x]), '--tree-exempt', realPath, ...extra, '--json'], { stdio: ['ignore', 'pipe', 'ignore'], ...(cwd ? { cwd } : {}) });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  const timer = setTimeout(() => p.kill('SIGKILL'), 60000);
  p.on('close', (code) => { clearTimeout(timer); let j = null; try { j = JSON.parse(so); } catch {} resolve({ exit: code, findingIds: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null }); });
});
// the r78 battery carries the base coverage: staged beside the counter under test (here: THIS dir's
// counter, i.e. the mutant in kill-power runs), pinned driver beside it, its own scratch below work
const runBase = () => new Promise((resolve) => {
  const stage = path.join(work, 'base-r78');
  forceRm(stage); fs.mkdirSync(path.join(stage, 'w'), { recursive: true });
  fs.writeFileSync(path.join(stage, 'check-filechooser-r78.mjs'), fs.readFileSync(COUNTER));
  fs.writeFileSync(path.join(stage, R78_BATTERY), fs.readFileSync(path.join(lane, 'scripts', R78_BATTERY)));
  fs.writeFileSync(path.join(stage, R78_DRIVER), fs.readFileSync(path.join(lane, 'scripts', R78_DRIVER)));
  const first = FIRST ? ['--first-failure'] : [];
  const p = spawn(process.execPath, [path.join(stage, R78_BATTERY), '--lane', lane, '--real', realPath, '--expect-driver-sha256', pin, '--expect-nonce', expectNonce, '--prior-set', priorSet,
    ...extraPriors.flatMap((x) => ['--prior', x]), ...launderedPaths.flatMap((x) => ['--laundered', x]), '--work', path.join(stage, 'w'), '--json', ...first], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  p.on('close', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ exit: code, j }); forceRm(stage); });
});
const launderInto = async (r, f) => {
  const pre = await runCounter(f);
  if (pre.derived) { r.legShape = pre.derived; fs.writeFileSync(f, JSON.stringify(r)); }
};
const pos = await runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
const FIRST = argv.includes('--first-failure');
let stopped = FIRST && !positiveOk;
let base = null, baseOk = false;
if (!stopped) {
  base = await runBase();
  baseOk = base.exit === 0 && !!base.j && base.j.allOk === true;
  if (FIRST && !baseOk) stopped = true;
}
const runCase = async (c) => {
  const r = clone(real);
  try { c.mutate(r); } catch (e) { return { case: c.name, class: c.accept ? 'must-accept' : 'refuse', expect: c.expect, error: 'mutation failed: ' + e.message, ok: false, isolated: false }; }
  // case receipts are written as *.case (never *.json) inside the scratch work dir
  const f = path.join(work, (c.accept ? 'acc-' : 'neg-') + c.name + '.case');
  fs.writeFileSync(f, JSON.stringify(r));
  if (c.launder) await launderInto(r, f);
  const o = await runCounter(f, c);
  if (o.error) return { case: c.name, class: c.accept ? 'must-accept' : 'refuse', expect: c.expect, error: o.error, ok: false, isolated: false };
  const ids = Array.isArray(o.findingIds) ? o.findingIds : [];
  if (c.accept) return { case: c.name, class: 'must-accept', exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 0 && Array.isArray(o.findingIds) && ids.length === 0, extra: ids };
  const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
  return { case: c.name, class: 'refuse', expect: c.expect, alsoAllowed: c.alsoAllowed, exit: o.exit, findingIds: o.findingIds, isolated: ids.length === 1 && ids[0] === c.expect, ok: o.exit === 1 && ids.includes(c.expect) && extra.length === 0, extra };
};
const caseResults = new Array(cases.length);
let nextCase = 0;
await Promise.all(Array.from({ length: JOBS }, async () => { while (nextCase < cases.length && !stopped) { const i = nextCase++; caseResults[i] = await runCase(cases[i]); if (FIRST && !caseResults[i].ok) stopped = true; } }));
const results = caseResults.filter(Boolean);
const failed = [...(positiveOk ? [] : ['(positive)']), ...(baseOk || stopped && base === null ? [] : ['(base-r78-battery)']), ...results.filter((x) => !x.ok).map((x) => x.case)];
const allOk = !stopped && positiveOk && baseOk && results.length === cases.length && failed.length === 0;
const summary = { schema: 'tabi-negatives-filechooser-r79', real: realPath, positiveOk, positive: { exit: pos.exit, findingIds: pos.findingIds },
  base: base ? { exit: base.exit, allOk: base.j ? base.j.allOk : null, cases: base.j ? base.j.cases : null, coverageGap: base.j ? base.j.coverageGap : null, failed: base.j ? base.j.failed : null } : { skipped: stopped },
  stoppedEarly: stopped, cases: results.length, refuseCases: results.filter((x) => x.class === 'refuse').length, mustAcceptCases: results.filter((x) => x.class === 'must-accept').length,
  brackets: (() => { try { return { events: pairsOf(real).length, gaps: gapsOf(real).length, absNeed: needs(real)[0], gapNeed: needs(real)[1] }; } catch { return null; } })(),
  passed: results.filter((x) => x.ok).length, failed, coverageGap: [], allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives-r79 ${summary.passed}/${summary.cases} (refuse ${summary.refuseCases}, must-accept ${summary.mustAcceptCases}) positiveOk=${positiveOk} baseOk=${baseOk} failed=${failed.join(',') || 'none'}`);
// exitCode, not process.exit(): the --json summary is written to a pipe when kill power runs the
// battery, and process.exit() can cut it at the 64 KiB pipe buffer (r78 lesson-proof)
process.exitCode = allOk ? 0 : 1;
