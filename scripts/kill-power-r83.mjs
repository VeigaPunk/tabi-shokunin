#!/usr/bin/env node
// Kill power for scripts/check-showpicker-r83.mjs (tabi round 83, C1).
//
// Every mutant is a semantic edit of the counter's own source (a rule weakened, a comparison
// flipped, a binding dropped). A mutant is KILLED when the battery exits 1 (at least one case
// notices), SURVIVED when the battery still exits 0, and CRASHED when the mutant does not run at
// all (a kill by syntax, counted separately and never as coverage of a rule).
//
// Usage: node kill-power-r83.mjs --lane <ABS lane> --real <receipt> --expect-driver-sha256 <hex>
//   --expect-nonce <nonce> --expect-fixture-sha256 <hex> --prior-set <file> --work <ABS scratch>
//   [--json] [--only <name>]
// Exit 0: every mutant killed or crashed with no survivor. 1: survivors. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-showpicker-r83.mjs');
const BATTERY = path.join(HERE, 'negatives-showpicker-r83.mjs');
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
  ['nonce-shape-any', "/^tabi-r83-[a-z0-9-]{4,48}$/.test(r.nonce)", "typeof r.nonce === 'string'"],
  ['nonce-expected-any', "r.nonce === expectNonce", "typeof r.nonce === 'string'"],
  ['receipt-fields-open', "same(Object.keys(r).sort(), RECEIPT_KEYS)", "Object.keys(r).length >= 10"],
  ['driver-pin-any', "r.driverSha256 === pin", "/^[0-9a-f]{64}$/.test(r.driverSha256)"],
  ['fixture-hash-any', "r.fixture.sha256 === expectFixture", "/^[0-9a-f]{64}$/.test(r.fixture.sha256)"],
  ['host-chromium-any', "host.chromium === HOST.chromium", "typeof host.chromium === 'string'"],
  ['host-node-any', "Number(host.node.replace(/^v/, '').split('.')[0]) === HOST.nodeMajor", "Number(host.node.replace(/^v/, '').split('.')[0]) >= 20"],
  ['frame-tree-url-any', "ftree.mainFrameUrl === 'about:blank'", "typeof ftree.mainFrameUrl === 'string'"],
  ['plan-frozen-any', "same(legs.map((l) => (isObj(l) ? { name: l.name, kind: l.kind, target: l.target, intercept: l.intercept, priorClick: l.priorClick, gesture: l.gesture } : null)), PLAN.map((p) => ({ name: p.name, kind: p.kind, target: p.target, intercept: p.intercept, priorClick: p.priorClick ?? null, gesture: p.gesture ?? null })))", "legs.length === PLAN.length"],
  ['leg-order-any', "same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER)", "legs.length === LEG_ORDER.length"],
  ['leg-records-keys-open', "isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name", "isObj(l) && Object.keys(l).length >= 40 && l.name === PLAN[i].name"],
  ['leg-marks-late-ignored', "l.lateAfterClose === 0", "num(l.lateAfterClose)"],
  ['send-method-any', "ALLOWED_METHODS.has(c.method)", "typeof c.method === 'string'"],
  ['plan-calls-any', "same(got.map((c) => ({ method: c.method, params: c.params })), want)", "got.length === want.length"],
  ['cdp-open-binding-dropped', "} else if (leg.triggerSendId === null || o.afterSendId !== leg.triggerSendId) evBad.push(leg.name + ':open-binding');", "}"],
  ['event-keys-open', "same(Object.keys(e).sort(), EVENT_KEYS)", "Object.keys(e).length >= 10"],
  ['event-quantum-loose', "Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4", "Math.abs(v * 10 - Math.round(v * 10)) <= 0.5"],
  ['seq-monotonic-loose', "s.every((v, i) => v === i + 1)", "s.every((v) => Number.isInteger(v))"],
  ['leg-shape-seq-dropped', "for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state']) if (!same(got[k], want[k])) bad.push(k + ' ' + JSON.stringify(got[k]));", "for (const k of ['state']) if (!same(got[k], want[k])) bad.push(k);"],
  ['activation-before-dropped', "if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1]))", "if (!same(leg.activationAfter, want[1]))"],
  ['activation-after-dropped', "if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1]))", "if (!same(leg.activationBefore, want[0]))"],
  ['mode-law-any', "if (!d || opens.some((e) => e.params.mode !== wantMode)) modeBad.push", "if (false) modeBad.push"],
  ['cross-nonfile-result-dropped', "isObj(co.childResult) && same(co.childResult, CHILD_RESULT_LAW['sp83-cross-origin-nonfile'])", "isObj(co.childResult)"],
  ['cross-nonfile-nochooser-dropped', "arr(co.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0", "true"],
  ['cross-nonfile-access-dropped', "same(co.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' })", "isObj(co.parentCrossAccess)"],
  ['order-same-error-dropped', "isObj(sod.showPicker) && sod.showPicker.ok === false && sod.showPicker.name === 'InvalidStateError' && sod.showPicker.message === IMMUTABLE_ERR", "isObj(sod.showPicker)"],
  ['dir-answer-uploaddropped', "isObj(wa.uploadDir) && same(wa.uploadDir, { name: DIR.name, files: DIR.files.map((f) => ({ name: f.name, size: f.size, sha256: f.hex ? sha256(Buffer.from(f.hex, 'hex')) : null })) })", "isObj(wa.uploadDir)"],
  ['accept-answer-bytes-dropped', "arr(aa.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + ANSWER.hex", "typeof arr(aa.pageEvents).find((e) => e.type === 'read').ret === 'string'"],
  ['click-open-count-dropped', "cw.clickWhileOpenChoosersBefore === 1 && cw.clickWhileOpenChoosersAfter === 2", "typeof cw.clickWhileOpenChoosersAfter === 'number'"],
  ['no-selection-empty-dropped', "['s', 'm', 'd', 'k', 'dis', 'disd'].every((k) => Array.isArray(st[k]) && st[k].length === 0)", "['s', 'm', 'd', 'k', 'dis', 'disd'].every((k) => Array.isArray(st[k]))"],
  ['intercept-count-dropped', "if (opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-' + want);", ""],
  ['multiple-mode-bytes-dropped', "same(isObj(mm.stateAfter) ? mm.stateAfter.m : null, [[ANSWER.name, ANSWER.size, ANSWER.type, '']])", "isObj(mm.stateAfter)"],
  ['accept-mime-bytes-dropped', "arr(am.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + PNG.hex", "typeof arr(am.pageEvents).find((e) => e.type === 'read').ret === 'string'"],
  ['second-chooser-bytes-dropped', "arr(sc.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + SECOND.hex", "typeof arr(sc.pageEvents).find((e) => e.type === 'read').ret === 'string'"],
  ['cross-number-result-dropped', "same(co.childResult, CHILD_RESULT_LAW['sp83-cross-origin-nonfile'])", "isObj(co.childResult)"],
  ['dismiss-law-any', "!(isObj(l.dismissResult) && same(l.dismissResult, {}) && l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))", "l.dismissError !== null"],
  ['trust-law-untrusted-ok', "events.every((e) => e.isTrusted === true)", "events.every((e) => typeof e.isTrusted === 'boolean')"],
  ['argv-any', "!same(a, want) || typeof tok !== 'string'", "!Array.isArray(a)"],
  ['teardown-survivors-dropped', "arr(l.teardown.survivors).length === 0", "Array.isArray(l.teardown.survivors)"],
  ['fixture-descriptors-any', "same(arr(r.fixtureInputs), FIXTURE_INPUTS)", "arr(r.fixtureInputs).length === FIXTURE_INPUTS.length"],
  ['server-log-run-dropped', "arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.run === r.nonce && s.status === 200)", "arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.status === 200)"],
  ['child-server-log-run-dropped', "arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').every((s) => s.run === r.nonce && s.status === 200)", "arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').every((s) => s.status === 200)"],
  ['run-window-lower-dropped', "t1 - t0 >= 12000", "t1 - t0 >= 1"],
  ['replay-token-any', "priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken))", "true"],
  ['replay-browser-any', "priors.every((p) => arr(p.legs).every((q) => !isObj(q) || !isObj(q.devtoolsListening) || q.devtoolsListening.browserId !== l.devtoolsListening.browserId))", "true"],
  ['exempt-unmatched-ok', "unmatched.length === 0", "true"],
  ['prior-set-outside-ok', "outside.length === 0", "true"],
  ['prior-set-unparsable-ok', "unparsable.length === 0", "true"],
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
  fs.writeFileSync(path.join(dir, 'check-showpicker-r83.mjs'), src.replace(from, to));
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r83.mjs'));
  const child = spawn(process.execPath, [path.join(dir, 'negatives-showpicker-r83.mjs'), '--lane', lane, '--real', real,
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
const summary = { schema: 'tabi-r83-kill-power', mutants: results.length, killed, survived: survivors, crashed, survivorsList: results.filter((r) => r.outcome === 'survived').map((r) => r.mutant), unapplied: results.filter((r) => r.outcome === 'unapplied').map((r) => r.mutant), results };
if (asJson) process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ mutants: summary.mutants, killed, survived: survivors, crashed, survivorsList: summary.survivorsList, unapplied: summary.unapplied }, null, 1) + '\n');
process.exitCode = survivors === 0 && crashed === 0 && summary.unapplied.length === 0 ? 0 : 1;
