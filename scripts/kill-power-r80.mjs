#!/usr/bin/env node
// Kill power for scripts/check-showpicker-r80.mjs (tabi round 80, C1).
//
// Every mutant is a semantic edit of the counter's own source (a rule weakened, a comparison
// flipped, a binding dropped). A mutant is KILLED when the battery exits 1 (at least one case
// notices), SURVIVED when the battery still exits 0, and CRASHED when the mutant does not run at
// all (a kill by syntax, counted separately and never as coverage of a rule).
//
// Usage: node kill-power-r80.mjs --lane <ABS lane> --real <receipt> --expect-driver-sha256 <hex>
//   --expect-nonce <nonce> --expect-fixture-sha256 <hex> --prior-set <file> --work <ABS scratch>
//   [--json] [--only <name>]
// Exit 0: every mutant killed or crashed with no survivor. 1: survivors. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-showpicker-r80.mjs');
const BATTERY = path.join(HERE, 'negatives-showpicker-r80.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const lane = opt('lane');
const real = opt('real');
const pin = opt('expect-driver-sha256');
const nonce = opt('expect-nonce');
const fixture = opt('expect-fixture-sha256');
const priorSet = opt('prior-set');
const work = opt('work');
const asJson = argv.includes('--json');
const only = opt('only');
if (!lane || !real || !pin || !nonce || !fixture || !priorSet || !work) usage('--lane, --real, --expect-driver-sha256, --expect-nonce, --expect-fixture-sha256, --prior-set and --work are required');
fs.mkdirSync(work, { recursive: true });
const src = fs.readFileSync(COUNTER, 'utf8');

// Semantic mutants: (name, from, to). `from` must occur exactly once in the counter source.
const MUTANTS = [
  ['schema-accepts-any', "r.schema === SCHEMA", "typeof r.schema === 'string'"],
  ['lane-any', "r.lane === path.basename(lane)", "typeof r.lane === 'string'"],
  ['nonce-shape-any', "/^tabi-r80-[a-z0-9-]{4,48}$/.test(r.nonce)", "typeof r.nonce === 'string'"],
  ['nonce-expected-any', "r.nonce === expectNonce", "typeof r.nonce === 'string'"],
  ['receipt-fields-open', "same(Object.keys(r).sort(), RECEIPT_KEYS)", "Object.keys(r).length >= 10"],
  ['driver-pin-any', "r.driverSha256 === pin", "/^[0-9a-f]{64}$/.test(r.driverSha256)"],
  ['fixture-hash-any', "r.fixture.sha256 === expectFixture", "/^[0-9a-f]{64}$/.test(r.fixture.sha256)"],
  ['fixture-child-dropped', "isObj(r.fixture.child) && same(Object.keys(r.fixture.child).sort(), ['origin', 'sha256'])", "true"],
  ['host-chromium-any', "host.chromium === HOST.chromium", "typeof host.chromium === 'string'"],
  ['host-node-any', "Number(host.node.replace(/^v/, '').split('.')[0]) === HOST.nodeMajor", "Number(host.node.replace(/^v/, '').split('.')[0]) >= 20"],
  ['ports-distinct-dropped', "new Set([ports.http, ports.cdp, ports.child]).size === 3", "true"],
  ['ports-child-origin-dropped', "r.fixture.child.origin === 'http://127.0.0.1:' + ports.child", "typeof r.fixture.child.origin === 'string'"],
  ['frame-tree-url-any', "ftree.mainFrameUrl === 'about:blank'", "typeof ftree.mainFrameUrl === 'string'"],
  ['plan-frozen-any', "same(legs.map((l) => (isObj(l) ? { name: l.name, kind: l.kind, target: l.target, intercept: l.intercept, priorClick: l.priorClick, gesture: l.gesture } : null)), PLAN.map((p) => ({ name: p.name, kind: p.kind, target: p.target, intercept: p.intercept, priorClick: p.priorClick ?? null, gesture: p.gesture ?? null })))", "legs.length === PLAN.length"],
  ['leg-order-any', "same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER)", "legs.length === LEG_ORDER.length"],
  ['leg-records-keys-open', "isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name", "isObj(l) && Object.keys(l).length >= 40 && l.name === PLAN[i].name"],
  ['leg-records-errors-ignored', "arr(l.errors).length === 0", "true"],
  ['leg-marks-late-ignored', "l.lateAfterClose === 0", "num(l.lateAfterClose)"],
  ['context-child-count-dropped', "if (child.length !== 1)", "if (child.length === 0)"],
  ['context-child-id-dropped', "if (CROSS.has(leg.name) && leg.childContextId !== child[0].id)", "if (false)"],
  ['send-method-any', "ALLOWED_METHODS.has(c.method)", "typeof c.method === 'string'"],
  ['send-expression-any', "evalAllowed(leg, c.params)", "typeof c.params.expression === 'string'"],
  ['send-context-dropped', "return CROSS.has(leg.name) && params.contextId === leg.childContextId && childExprs.has(params.expression);", "return childExprs.has(params.expression);"],
  ['send-ids-unchecked', "c.id === i + 1", "Number.isInteger(c.id)"],
  ['plan-calls-any', "same(got.map((c) => ({ method: c.method, params: c.params })), want)", "got.length === want.length"],
  ['plan-answer-id-dropped', "if (!set || !isObj(leg.answer) || leg.answer.setSendId !== set.id)", "if (!set)"],
  ['cdp-event-method-any', "!['Page.fileChooserOpened', 'Page.frameNavigated'].includes(e.method)", "false"],
  ['cdp-open-binding-dropped', "} else if (leg.triggerSendId === null || o.afterSendId !== leg.triggerSendId) evBad.push(leg.name + ':open-binding');", "}"],
  ['cdp-open-id-positive-dropped', "o.params.backendNodeId <= 0", "false"],
  ['cdp-open-frame-dropped', "if (!wantFrame || o.params.frameId !== wantFrame.frameId) evBad.push(leg.name + ':open-frame');", ""],
  ['frame-binding-any', "typeof l.frameTree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.frameTree.mainFrameId)", "typeof l.frameTree.mainFrameId === 'string'"],
  ['event-keys-open', "same(Object.keys(e).sort(), EVENT_KEYS)", "Object.keys(e).length >= 10"],
  ['event-quantum-loose', "Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4", "Math.abs(v * 10 - Math.round(v * 10)) <= 0.5"],
  ['event-window-dropped', "e.at >= (pre ?? 0) && e.at <= (settle ?? l.closedAt)", "num(e.at)"],
  ['seq-monotonic-loose', "s.every((v, i) => v === i + 1)", "s.every((v) => Number.isInteger(v))"],
  ['leg-shape-seq-dropped', "for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state']) if (!same(got[k], want[k])) bad.push(k + ' ' + JSON.stringify(got[k]));", "for (const k of ['state']) if (!same(got[k], want[k])) bad.push(k);"],
  ['gesture-ok-only', "if (!isObj(got) || got.ok !== want.ok || (want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message)))", "if (!isObj(got) || got.ok !== want.ok)"],
  ['gesture-message-dropped', "got.name !== want.name || got.message !== want.message", "got.name !== want.name"],
  ['activation-before-dropped', "if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1]))", "if (!same(leg.activationAfter, want[1]))"],
  ['activation-after-dropped', "if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1]))", "if (!same(leg.activationBefore, want[0]))"],
  ['twice-second-ok', "isObj(twice.showPicker2) && twice.showPicker2.ok === true && twice.showPicker2.ret === 'undefined'", "isObj(twice.showPicker2)"],
  ['twice-chooser-count-dropped', "arr(twice.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 2", "true"],
  ['deferred-result-ok', "isObj(def.deferredResult) && def.deferredResult.ok === true && def.deferredResult.ret === 'undefined'", "isObj(def.deferredResult)"],
  ['deferred-direct-law-dropped', "isObj(def.showPicker) && def.showPicker.ok === false && def.showPicker.name === 'InvalidStateError' && def.showPicker.message === IMMUTABLE_ERR", "isObj(def.showPicker)"],
  ['mode-law-any', "if (!d || opens.some((e) => e.params.mode !== wantMode)) modeBad.push", "if (false) modeBad.push"],
  ['cross-access-dropped', "same(co.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' })", "isObj(co.parentCrossAccess)"],
  ['cross-child-result-dropped', "isObj(co.childResult) && same(co.childResult, CHILD_RESULT_LAW['sp80-cross-origin'])", "isObj(co.childResult)"],
  ['cross-child-act-dropped', "same(co.childActivationBefore, CHILD_ACT_LAW['sp80-cross-origin'][0]) && same(co.childActivationAfter, CHILD_ACT_LAW['sp80-cross-origin'][1])", "true"],
  ['cross-events-trusted-dropped', "arr(co.childEvents).every((e) => e.isTrusted === true && e.act === true)", "arr(co.childEvents).length === 5"],
  ['cod-result-dropped', "isObj(cod.childResult) && same(cod.childResult, CHILD_RESULT_LAW['sp80-cross-origin-disabled'])", "isObj(cod.childResult)"],
  ['cod-no-chooser-dropped', "arr(cod.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0", "true"],
  ['cod-act-dropped', "same(cod.childActivationBefore, CHILD_ACT_LAW['sp80-cross-origin-disabled'][0]) && same(cod.childActivationAfter, CHILD_ACT_LAW['sp80-cross-origin-disabled'][1])", "true"],
  ['answer-bytes-dropped', "arr(ans.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + ANSWER.hex", "typeof arr(ans.pageEvents).find((e) => e.type === 'read').ret === 'string'"],
  ['answer-node-dropped', "ans.answer.setParams.backendNodeId === nodeReport[ANSWER_NAME][0]", "Number.isInteger(ans.answer.setParams.backendNodeId)"],
  ['answer-upload-dropped', "same(ans.upload, { name: ANSWER.name, size: ANSWER.size, sha256: ANSWER.sha256 })", "isObj(ans.upload)"],
  ['answer-state-dropped', "same(ans.stateAfter.s, [[ANSWER.name, ANSWER.size, ANSWER.type]])", "Array.isArray(ans.stateAfter.s)"],
  ['no-selection-empty-dropped', "['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(st[k]) && st[k].length === 0)", "['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(st[k]))"],
  ['no-selection-file-event-dropped', "e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel')", "false"],
  ['intercept-count-dropped', "if (opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-' + want);", ""],
  ['cancel-law-any', "same(cancels, [])", "cancels.length === 0"],
  ['dismiss-law-any', "!(isObj(l.dismissResult) && same(l.dismissResult, {}) && l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))", "l.dismissError !== null"],
  ['trust-law-untrusted-ok', "events.every((e) => e.isTrusted === true)", "events.every((e) => typeof e.isTrusted === 'boolean')"],
  ['trust-law-pointer-dropped', "arr(l.pageEvents).every((e) => !PTR.has(e.type) || (e.leg !== 'show-picker' && e.leg !== 'show-picker-2'))", "true"],
  ['argv-any', "!same(a, want) || typeof tok !== 'string'", "!Array.isArray(a)"],
  ['argv-profile-dropped', "typeof profile !== 'string' || path.basename(profile) !== 'profile-' + tok", "typeof profile !== 'string'"],
  ['devtools-url-prefix-dropped', "!dl.url.startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/')", "typeof dl.url !== 'string'"],
  ['teardown-survivors-dropped', "arr(l.teardown.survivors).length === 0", "Array.isArray(l.teardown.survivors)"],
  ['teardown-child-port-dropped', "same(Object.keys(l.teardown.portProbes).sort(), ['child', 'devtools', 'fixture'])", "isObj(l.teardown.portProbes)"],
  ['fixture-descriptors-any', "same(arr(r.fixtureInputs), FIXTURE_INPUTS)", "arr(r.fixtureInputs).length === FIXTURE_INPUTS.length"],
  ['server-log-run-dropped', "arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.run === r.nonce && s.status === 200)", "arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.status === 200)"],
  ['child-server-log-run-dropped', "arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').every((s) => s.run === r.nonce && s.status === 200)", "arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').every((s) => s.status === 200)"],
  ['run-window-lower-dropped', "t1 - t0 >= 15000", "t1 - t0 >= 1"],
  ['run-window-upper-dropped', "t1 - t0 < 600000", "true"],
  ['replay-threshold-loose', "absMatched >= absNeed", "absMatched >= absNeed + 5"],
  ['replay-gap-threshold-loose', "gapMatched >= gapNeed", "gapMatched >= gapNeed + 1"],
  ['replay-token-any', "priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken))", "true"],
  ['replay-token-duplicate-ok', "new Set(legs.map((l) => l.launchToken)).size === legs.length", "true"],
  ['replay-browser-any', "priors.every((p) => arr(p.legs).every((q) => !isObj(q) || !isObj(q.devtoolsListening) || q.devtoolsListening.browserId !== l.devtoolsListening.browserId))", "true"],
  ['exempt-unmatched-ok', "unmatched.length === 0", "true"],
  ['prior-set-outside-ok', "outside.length === 0", "true"],
  ['prior-set-unparsable-ok', "unparsable.length === 0", "true"],
  ['prior-set-schema-any', "isObj(j) && j.schema === SCHEMA", "isObj(j)"],
];

const results = [];
let survivors = 0, crashed = 0, killed = 0;
const CONCURRENCY = Number(opt('jobs') || 8);
const runOne = (name, from, to) => new Promise((resolve) => {
  const n = src.split(from).length - 1;
  if (n !== 1) { resolve({ mutant: name, outcome: 'unapplied', occurrences: n, detail: 'from-string occurs ' + n + ' times' }); return; }
  const dir = path.join(work, 'mutants', name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'check-showpicker-r80.mjs'), src.replace(from, to));
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r80.mjs'));
  const child = spawn(process.execPath, [path.join(dir, 'negatives-showpicker-r80.mjs'), '--lane', lane, '--real', real,
    '--expect-driver-sha256', pin, '--expect-nonce', nonce, '--expect-fixture-sha256', fixture, '--prior-set', priorSet,
    '--work', path.join(dir, 'work'), '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 900000);
  child.on('close', (code) => {
    clearTimeout(timer);
    let j = null; try { j = JSON.parse(out); } catch { j = null; }
    fs.rmSync(dir, { recursive: true, force: true });
    if (code === 0) resolve({ mutant: name, outcome: 'survived', detail: 'the battery still exits 0' });
    else if (code === 1 && j) resolve({ mutant: name, outcome: 'killed', failed: j.failed, first: (j.results && j.results.find((x) => !x.ok) && j.results.find((x) => !x.ok).name) || null });
    else resolve({ mutant: name, outcome: 'crashed', status: code, stderr: (err || out).slice(0, 300) });
  });
});
const queue = MUTANTS.filter(([name]) => !only || name === only);
const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
  while (queue.length) {
    const [name, from, to] = queue.shift();
    const r = await runOne(name, from, to);
    if (r.outcome === 'survived') survivors++;
    else if (r.outcome === 'killed') killed++;
    else crashed++;
    results.push(r);
  }
});
await Promise.all(workers);
const summary = { schema: 'tabi-r80-kill-power', mutants: results.length, killed, survived: survivors, crashed, survivorsList: results.filter((r) => r.outcome === 'survived').map((r) => r.mutant), unapplied: results.filter((r) => r.outcome === 'unapplied').map((r) => r.mutant), results };
if (asJson) process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ mutants: summary.mutants, killed, survived: survivors, crashed, survivorsList: summary.survivorsList, unapplied: summary.unapplied }, null, 1) + '\n');
process.exitCode = survivors === 0 && crashed === 0 ? 0 : 1;
