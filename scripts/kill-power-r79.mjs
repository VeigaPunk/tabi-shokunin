#!/usr/bin/env node
// Kill power for scripts/check-showpicker-r79.mjs (tabi round 79, C1).
//
// Every mutant is a semantic edit of the counter's own source (a rule weakened, a comparison
// flipped, a binding dropped). A mutant is KILLED when the battery exits 1 (at least one case
// notices), SURVIVED when the battery still exits 0, and CRASHED when the mutant does not run at
// all (a kill by syntax, counted separately and never as coverage of a rule).
//
// Usage: node kill-power-r79.mjs --lane <ABS lane> --real <receipt> --expect-driver-sha256 <hex>
//   --expect-nonce <nonce> --expect-fixture-sha256 <hex> --prior-set <file> --work <ABS scratch>
//   [--json] [--only <name>]
// Exit 0: every mutant killed or crashed with no survivor. 1: survivors. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-showpicker-r79.mjs');
const BATTERY = path.join(HERE, 'negatives-showpicker-r79.mjs');
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
  ['nonce-shape-any', "/^tabi-r79-[a-z0-9-]{4,48}$/.test(r.nonce)", "typeof r.nonce === 'string'"],
  ['nonce-expected-any', "r.nonce === expectNonce", "typeof r.nonce === 'string'"],
  ['receipt-fields-open', "same(Object.keys(r).sort(), RECEIPT_KEYS)", "Object.keys(r).length >= 10"],
  ['driver-pin-any', "r.driverSha256 === pin", "/^[0-9a-f]{64}$/.test(r.driverSha256)"],
  ['fixture-hash-any', "r.fixture.sha256 === expectFixture", "/^[0-9a-f]{64}$/.test(r.fixture.sha256)"],
  ['host-chromium-any', "host.chromium === HOST.chromium", "typeof host.chromium === 'string'"],
  ['host-node-any', "Number(host.node.replace(/^v/, '').split('.')[0]) === HOST.nodeMajor", "Number(host.node.replace(/^v/, '').split('.')[0]) >= 20"],
  ['ports-equal-ok', "ports.http !== ports.cdp", "true"],
  ['frame-tree-url-any', "ftree.mainFrameUrl === 'about:blank'", "typeof ftree.mainFrameUrl === 'string'"],
  ['plan-frozen-any', "same(legs.map((l) => (isObj(l) ? { name: l.name, kind: l.kind, target: l.target, intercept: l.intercept, priorClick: l.priorClick, gesture: l.gesture } : null)), PLAN.map((p) => ({ name: p.name, kind: p.kind, target: p.target, intercept: p.intercept, priorClick: p.priorClick ?? null, gesture: p.gesture ?? null })))", "legs.length === PLAN.length"],
  ['leg-order-any', "same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER)", "legs.length === LEG_ORDER.length"],
  ['leg-records-keys-open', "isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name", "isObj(l) && Object.keys(l).length >= 40 && l.name === PLAN[i].name"],
  ['leg-records-errors-ignored', "arr(l.errors).length === 0", "true"],
  ['leg-marks-late-ignored', "l.lateAfterClose === 0", "num(l.lateAfterClose)"],
  ['send-method-any', "ALLOWED_METHODS.has(c.method)", "typeof c.method === 'string'"],
  ['send-expression-any', "evalAllowed(leg, c.params.expression)", "typeof c.params.expression === 'string'"],
  ['send-ids-unchecked', "c.id === i + 1", "Number.isInteger(c.id)"],
  ['plan-calls-any', "same(got.map((c) => ({ method: c.method, params: c.params })), want)", "got.length === want.length"],
  ['cdp-event-method-any', "!['Page.fileChooserOpened', 'Page.frameNavigated'].includes(e.method)", "false"],
  ['cdp-open-binding-dropped', "o.afterSendId !== leg.triggerSendId", "false"],
  ['cdp-open-id-positive-dropped', "o.params.backendNodeId <= 0", "false"],
  ['frame-binding-any', "e.params.frameId === l.frameTree.mainFrameId", "typeof e.params.frameId === 'string'"],
  ['event-keys-open', "same(Object.keys(e).sort(), EVENT_KEYS)", "Object.keys(e).length >= 10"],
  ['event-quantum-loose', "Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4", "Math.abs(v * 10 - Math.round(v * 10)) <= 0.5"],
  ['event-window-dropped', "e.at >= (pre ?? 0) && e.at <= (settle ?? l.closedAt)", "num(e.at)"],
  ['seq-monotonic-loose', "s.every((v, i) => v === i + 1)", "s.every((v) => Number.isInteger(v))"],
  ['leg-shape-seq-dropped', "if (!same(got[k], want[k])) bad.push(k + ' ' + JSON.stringify(got[k]));", "if (k === 'state' && !same(got[k], want[k])) bad.push(k);"],
  ['gesture-ok-only', "if (!isObj(got) || got.ok !== want.ok || (want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message)))", "if (!isObj(got) || got.ok !== want.ok)"],
  ['gesture-message-dropped', "got.name !== want.name || got.message !== want.message", "got.name !== want.name"],
  ['activation-before-dropped', "if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1]))", "if (!same(leg.activationAfter, want[1]))"],
  ['activation-after-dropped', "if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1]))", "if (!same(leg.activationBefore, want[0]))"],
  ['consumption-second-ok', "twice.showPicker2.ok === false", "true"],
  ['consumption-chooser-count-dropped', "arr(twice.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 1", "true"],
  ['immutable-message-dropped', "dis.showPicker.message === IMMUTABLE_ERR", "typeof dis.showPicker.message === 'string'"],
  ['immutable-activation-dropped', "same(dis.activationBefore, dis.activationAfter)", "true"],
  ['mode-law-any', "opens.some((e) => e.params.mode !== wantMode)", "false"],
  ['node-binding-positive-dropped', "Number.isInteger(opens[0].params.backendNodeId) && opens[0].params.backendNodeId > 0", "Number.isInteger(opens[0].params.backendNodeId)"],
  ['no-selection-empty-dropped', "['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(st[k]) && st[k].length === 0)", "['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(st[k]))"],
  ['no-selection-file-event-dropped', "e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel')", "false"],
  ['intercept-off-ok', "if (p.intercept === null && opens !== 0) intBad.push(leg.name + ':no-intercept-but-opened');", ""],
  ['intercept-refused-ok', "if (p.intercept !== null && SP_LAW[leg.name] && SP_LAW[leg.name].ok === false && opens !== 0) intBad.push(leg.name + ':refused-but-opened');", ""],
  ['cancel-law-any', "same(cancels, [['sp-intercept-off-click-then-show', 's'], ['sp-cancel-armed', 's']])", "cancels.length >= 1"],
  ['cancel-law-target-dropped', "same(cancels, [['sp-intercept-off-click-then-show', 's'], ['sp-cancel-armed', 's']])", "cancels.length === 2"],
  ['dismiss-law-any', "!(isObj(l.dismissResult) && same(l.dismissResult, {}) && l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))", "l.dismissError !== null"],
  ['trust-law-untrusted-ok', "events.every((e) => e.isTrusted === true)", "events.every((e) => typeof e.isTrusted === 'boolean')"],
  ['trust-law-pointer-dropped', "arr(l.pageEvents).every((e) => !PTR.has(e.type) || (e.leg !== 'show-picker' && e.leg !== 'show-picker-2'))", "true"],
  ['argv-any', "!same(a, want) || typeof tok !== 'string'", "!Array.isArray(a)"],
  ['argv-profile-dropped', "typeof profile !== 'string' || path.basename(profile) !== 'profile-' + tok", "typeof profile !== 'string'"],
  ['devtools-url-prefix-dropped', "!dl.url.startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/')", "typeof dl.url !== 'string'"],
  ['fixture-descriptors-any', "same(fixi, FIXTURE_INPUTS)", "fixi.length === FIXTURE_INPUTS.length"],
  ['server-log-run-dropped', "s.run === r.nonce && s.status === 200", "s.status === 200"],
  ['run-window-lower-dropped', "t1 - t0 >= 20000", "t1 - t0 >= 1"],
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
for (const [name, from, to] of MUTANTS) {
  if (only && name !== only) continue;
  const n = src.split(from).length - 1;
  if (n !== 1) { results.push({ mutant: name, outcome: 'unapplied', occurrences: n, detail: 'from-string occurs ' + n + ' times' }); crashed++; continue; }
  const dir = path.join(work, 'mutants', name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'check-showpicker-r79.mjs'), src.replace(from, to));
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r79.mjs'));
  const r = spawnSync(process.execPath, [path.join(dir, 'negatives-showpicker-r79.mjs'), '--lane', lane, '--real', real,
    '--expect-driver-sha256', pin, '--expect-nonce', nonce, '--expect-fixture-sha256', fixture, '--prior-set', priorSet,
    '--work', path.join(dir, 'work'), '--json'], { encoding: 'utf8', timeout: 600000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  if (r.status === 0) { survivors++; results.push({ mutant: name, outcome: 'survived', detail: 'the battery still exits 0' }); }
  else if (r.status === 1 && j) { killed++; results.push({ mutant: name, outcome: 'killed', failed: j.failed, first: (j.failures && j.failures[0] && j.failures[0].case) || null }); }
  else { crashed++; results.push({ mutant: name, outcome: 'crashed', status: r.status, stderr: (r.stderr || '').slice(0, 300) }); }
  fs.rmSync(dir, { recursive: true, force: true });
}
const summary = { schema: 'tabi-r79-kill-power', mutants: results.length, killed, survived: survivors, crashed, survivorsList: results.filter((r) => r.outcome === 'survived').map((r) => r.mutant), unapplied: results.filter((r) => r.outcome === 'unapplied').map((r) => r.mutant), results };
if (asJson) process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ mutants: summary.mutants, killed, survived: survivors, crashed, survivorsList: summary.survivorsList, unapplied: summary.unapplied }, null, 1) + '\n');
process.exitCode = survivors === 0 && crashed === 0 ? 0 : 1;
