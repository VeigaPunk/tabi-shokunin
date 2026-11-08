#!/usr/bin/env node
// R90Mut1 independent mutation sweep harness.
// Scores each mutant against the frozen battery (counter mutants), a red drift fixture
// lane (record-drift mutants), or the instrument's own --selftest assertion probe
// (selftest mutants). Pristine and mutant bytes are both run; all outputs are recorded.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SCRATCH = HERE;
const SRC_COUNTER = path.join(HERE, 'bin', 'check-showpicker-round90.mjs');
const SRC_BATTERY = path.join(HERE, 'bin', 'negatives-showpicker-round90.mjs');
const SRC_DRIFT = path.join(HERE, 'bin', 'check-record-drift-round90.mjs');
const RECEIPT = path.join(LANE, 'corpus/evidence/round90/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-90/controls/c1/prior-set.txt');
const NONCE = 'tabi-r90-l1-e573334c78fa';
const PIN = 'ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d';
const FIX = '5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const pristineCounter = fs.readFileSync(SRC_COUNTER, 'utf8');
const pristineDrift = fs.readFileSync(SRC_DRIFT, 'utf8');
const pristineBattery = fs.readFileSync(SRC_BATTERY, 'utf8');
const shaOf = (t) => sha256(Buffer.from(t, 'utf8'));

// ---------- mutant definitions ----------
const counterMutants = [
  // A. the settle-call requirement (exactly one distinct window.__inputs(true) on domread legs)
  { id: 'm01-settle-count-two-ok', clause: 'settle-call count: exactly one', from: `if (settle.length !== 1) planBad.push(leg.name + ':settle-eval ' + settle.length);`, to: `if (settle.length < 1) planBad.push(leg.name + ':settle-eval ' + settle.length);` },
  { id: 'm02-settle-count-disabled', clause: 'settle-call count: exactly one', from: `if (settle.length !== 1) planBad.push(leg.name + ':settle-eval ' + settle.length);`, to: `if (settle.length < 0) planBad.push(leg.name + ':settle-eval ' + settle.length);` },
  { id: 'm03-settle-expr-prefix-match', clause: 'settle-call: distinct expression', from: `    const settle = log.filter((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)');\n    if (settle.length !== 1) planBad.push(leg.name + ':settle-eval ' + settle.length);`, to: `    const settle = log.filter((c) => c.method === 'Runtime.evaluate' && c.params && String(c.params.expression).startsWith('window.__inputs('));\n    if (settle.length !== 1) planBad.push(leg.name + ':settle-eval ' + settle.length);` },
  // B. the settle-order requirement (immediately after the settle __state() evaluate)
  { id: 'm04-settle-order-any-position', clause: 'settle-order: immediately after settle __state()', from: `if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, to: `if (!(settleIx >= 0)) planBad.push(leg.name + ':settle-order');` },
  { id: 'm05-settle-order-adjacent-either-side', clause: 'settle-order: immediately AFTER', from: `if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, to: `if (!(settleIx === stateIx + 1 || settleIx === stateIx - 1)) planBad.push(leg.name + ':settle-order');` },
  { id: 'm06-settle-order-any-later', clause: 'settle-order: immediately (adjacency)', from: `if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, to: `if (!(settleIx >= stateIx)) planBad.push(leg.name + ':settle-order');` },
  { id: 'm07-settle-order-flip-before', clause: 'settle-order: after, not before', from: `if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, to: `if (!(settleIx === stateIx - 1)) planBad.push(leg.name + ':settle-order');` },
  // C. the unexpected-settle rule (forbidden on every other leg)
  { id: 'm08-unexpected-settle-two-ok', clause: 'unexpected-settle: zero on non-domread legs', from: `if (settle.length !== 0) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);`, to: `if (settle.length > 1) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);` },
  { id: 'm09-unexpected-settle-disabled', clause: 'unexpected-settle: zero on non-domread legs', from: `if (settle.length !== 0) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);`, to: `if (settle.length < 0) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);` },
  { id: 'm10-unexpected-settle-flip', clause: 'unexpected-settle: forbidden', from: `if (settle.length !== 0) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);`, to: `if (settle.length === 0) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);` },
  // D. the wants-sequence
  { id: 'm11-wants-method-only', clause: 'wants-sequence: method+params equality', from: `if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`, to: `if (!same(got.map((c) => c.method), want.map((c) => c.method))) planBad.push(` },
  { id: 'm12-wants-order-dropped', clause: 'wants-sequence: ordered', from: `if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`, to: `if (!same(got.map((c) => JSON.stringify({ method: c.method, params: c.params })).sort(), want.map((c) => JSON.stringify({ method: c.method, params: c.params })).sort())) planBad.push(` },
  { id: 'm13-wants-flip', clause: 'wants-sequence: equality (flip)', from: `if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`, to: `if (same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(` },
  { id: 'm14-settle-sequence-entry-dropped', clause: 'wants-sequence: includes the settle call in order', from: `  if (p.kind === 'showpicker-domread') want.push({ method: 'Runtime.evaluate', params: { expression: 'window.__inputs(true)', returnByValue: true } });\n  if (p.intercept && opens.length > 0) want.push({ method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });\n  const got = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Input.dispatchMouseEvent' || c.method === 'DOM.setFileInputFiles' || (c.method === 'Runtime.evaluate' && (c.params.expression === wrapperFor(p.target) || (p.kind === 'showpicker-domread' && c.params.expression === 'window.__inputs(true)'))));`, to: `  if (p.intercept && opens.length > 0) want.push({ method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });\n  const got = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Input.dispatchMouseEvent' || c.method === 'DOM.setFileInputFiles' || (c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target)));` },
  // E. the domRead binding
  { id: 'm15-domread-raw-dropped', clause: 'domRead: raw accept string bound', from: `const toksOk = isObj(desc) && same(desc.acceptTokens, toks) && desc.accept === raw;`, to: `const toksOk = isObj(desc) && same(desc.acceptTokens, toks);` },
  { id: 'm16-domread-tokens-dropped', clause: 'domRead: parsed token list bound', from: `const toksOk = isObj(desc) && same(desc.acceptTokens, toks) && desc.accept === raw;`, to: `const toksOk = isObj(desc) && Array.isArray(desc.acceptTokens) && desc.accept === raw;` },
  { id: 'm17-domread-answer-dropped', clause: 'domRead: answer bytes bound', from: `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`, to: `  const ansOk = true;` },
  { id: 'm18-domread-state-dropped', clause: 'domRead: input state bound', from: `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`, to: `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;` },
  { id: 'm19-domread-readcount-loosened', clause: 'domRead: exactly one read event', from: `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`, to: `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length >= 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;` },
  { id: 'm20-domread-tokens-uppercase-flip', clause: 'domRead: ASCII-lowercased token list', from: `same(desc.acceptTokens, toks)`, to: `same(desc.acceptTokens.map((x) => String(x).toUpperCase()), toks)` },
];

const selftestMutants = [
  { id: 'm21-sft-first-status-only', clause: 'selftest: first case binds the schema id', from: `const firstOk = r.status === 1 && ids.includes('schema');`, to: `const firstOk = r.status === 1;`, probe: 'schema' },
  { id: 'm22-sft-second-status-only', clause: 'selftest: second case binds the plan-calls id', from: `secondOk = r2.status === 1 && secondIds.includes('plan-calls');`, to: `secondOk = r2.status === 1;`, probe: 'plan-calls' },
  { id: 'm23-sft-ok-true', clause: 'selftest: verdict is the conjunction', from: `const out = { schema: 'tabi-r90-counter-selftest', ok: !!(firstOk && secondOk), exit: secondOk ? 1 : r.status, ids: secondIds.length ? secondIds : ids };`, to: `const out = { schema: 'tabi-r90-counter-selftest', ok: true, exit: secondOk ? 1 : r.status, ids: secondIds.length ? secondIds : ids };`, probe: 'schema' },
  { id: 'm24-sft-exit-zero', clause: 'selftest: exit code follows the verdict', from: `  process.exit(out.ok ? 0 : 1);`, to: `  process.exit(0);`, probe: 'schema' },
];

const driftMutants = [
  { id: 'm25-drift-sweep-tapi-drop', clause: 'stmt1: correction names the tapi- glob', from: `const named = /replayConsistency/.test(correction) && /tapi-/.test(correction);`, to: `const named = /replayConsistency/.test(correction);`, fixture: 'f1b-sweep-tapi-missing', statement: 'r89-claim-sweep' },
  { id: 'm26-drift-sweep-replay-drop', clause: 'stmt1: correction names replayConsistency', from: `const named = /replayConsistency/.test(correction) && /tapi-/.test(correction);`, to: `const named = /tapi-/.test(correction);`, fixture: 'f1c-sweep-replay-missing', statement: 'r89-claim-sweep' },
  { id: 'm27-drift-narrowing-live-drop', clause: 'stmt2: no live citation of the nonexistent section', from: `claim('r89-narrowing-pointers', pointsReal && realSections && live.length === 0,`, to: `claim('r89-narrowing-pointers', pointsReal && realSections,`, fixture: 'f2a-narrowing-live', statement: 'r89-narrowing-pointers' },
  { id: 'm28-drift-narrowing-points-loose', clause: 'stmt2: two corrected rows point at a real section', from: `const pointsReal = corrected.length >= 2 && corrected.every((l) => /SCORECARD\\.md ## Round 89/.test(l));`, to: `const pointsReal = corrected.length >= 1;`, fixture: 'f2b-narrowing-one-row', statement: 'r89-narrowing-pointers' },
  { id: 'm29-drift-census-words-bound-drop', clause: 'stmt3: quote is <=25 words', from: `claim('r89-census-attribution', censusRows && says224 && r88attr && quote && words > 0 && words <= 25,`, to: `claim('r89-census-attribution', censusRows && says224 && r88attr && quote && words > 0,`, fixture: 'f3a-census-marker-missing', statement: 'r89-census-attribution' },
  { id: 'm30-drift-census-223-guard-drop', clause: 'stmt3: the 224 figure is not contradicted by 223', from: `const says224 = /224 rows/.test(correction) && !/223 rows/.test(correction.split('\\n').find((l) => /224 rows/.test(l)) || '');`, to: `const says224 = /224 rows/.test(correction);`, fixture: 'f3b-census-223-guard', statement: 'r89-census-attribution' },
  { id: 'm31-drift-leak-removes-drop', clause: 'stmt4: the fixture tree is removed', from: `claim('r89-leak-enforcement', removes && asserts && named,`, to: `claim('r89-leak-enforcement', asserts && named,`, fixture: 'f4a-leak-removes-missing', statement: 'r89-leak-enforcement' },
  { id: 'm32-drift-leak-asserts-drop', clause: 'stmt4: absence and decoy presence asserted', from: `const asserts = /fixtureAbsent/.test(driftSrc) && /decoyPresent/.test(driftSrc);`, to: `const asserts = /fixtureAbsent/.test(driftSrc);`, fixture: 'f4b-leak-decoy-missing', statement: 'r89-leak-enforcement' },
  { id: 'm33-drift-revision-predates-drop', clause: 'stmt5: the run predates the later writes', from: `const names = /10:13/.test(correction) && /worktree/.test(correction) && /predates/.test(correction);`, to: `const names = /10:13/.test(correction) && /worktree/.test(correction);`, fixture: 'f5a-revision-predates-missing', statement: 'r89-revision-naming' },
  { id: 'm34-drift-gate-kill-selftest-drop', clause: 'stmt6: kill power exposes --selftest', from: `const kst = /--selftest/.test(killSrc);`, to: `const kst = true;`, fixture: 'f6a-kill-selftest-missing', statement: 'gate-selftest' },
  { id: 'm35-drift-quality-cites-drop', clause: 'stmt7: QUALITY 161 cites the gate', from: `claim('quality161-sweep', cites && sweeps,`, to: `claim('quality161-sweep', sweeps,`, fixture: 'f7a-quality-cites-missing', statement: 'quality161-sweep' },
  { id: 'm36-drift-scorecard-stray-drop', clause: 'stmt8: no stray selftest 10/10', from: `claim('scorecard-tallies', bad.length === 0 && stray.length === 0,`, to: `claim('scorecard-tallies', bad.length === 0,`, fixture: 'f8b-scorecard-stray', statement: 'scorecard-tallies' },
  { id: 'm37-drift-scorecard-bad-drop', clause: 'stmt8: seven swept tallies hold 9/9', from: `claim('scorecard-tallies', bad.length === 0 && stray.length === 0,`, to: `claim('scorecard-tallies', stray.length === 0,`, fixture: 'f8a-scorecard-bad', statement: 'scorecard-tallies' },
  { id: 'm38-drift-selftest-okc-drop', clause: 'drift selftest: the fixture reds are causal (okC details)', from: `const okC = /amendment=missing/.test(detail('r89-claim-sweep')) && /live=\\["corpus\\/lessons\\/round-89.md"\\]/.test(detail('r89-narrowing-pointers')) && /round-44-has-10/.test(detail('scorecard-tallies'));`, to: `const okC = /amendment=missing/.test(detail('r89-claim-sweep'));`, fixture: 'selftest-probe', statement: null },
];

// ---------- helpers ----------
const run = (args, opts = {}) => {
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: opts.timeout || 300000, cwd: opts.cwd || SCRATCH, env: { ...process.env, ...(opts.env || {}) } });
  let json = null; try { json = JSON.parse(r.stdout); } catch {}
  return { status: r.status, signal: r.signal, json, stderr: (r.stderr || '').slice(0, 600), stdoutHead: (r.stdout || '').slice(0, 300) };
};
const apply = (src, from, to) => {
  const n = src.split(from).length - 1;
  if (n !== 1) return { ok: false, n };
  return { ok: true, out: src.replace(from, to) };
};
const ensuredir = (p) => fs.mkdirSync(p, { recursive: true });

// counter mutant scoring: build <case>/check + <case>/negatives, run direct and battery
const scoreCounter = (m) => {
  const a = apply(pristineCounter, m.from, m.to);
  if (!a.ok) return { id: m.id, type: 'counter', clause: m.clause, outcome: 'unapplied', occurrences: a.n };
  const dir = path.join(SCRATCH, 'cases', m.id);
  ensuredir(dir);
  const mutPath = path.join(dir, 'check-showpicker-round90.mjs');
  fs.writeFileSync(mutPath, a.out);
  fs.writeFileSync(path.join(dir, 'negatives-showpicker-round90.mjs'), pristineBattery);
  const direct = run([mutPath, '--lane', LANE, '--receipt', RECEIPT, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIX, '--prior-set', PRIOR_SET, '--json'], { timeout: 120000 });
  const battery = run([path.join(dir, 'negatives-showpicker-round90.mjs'), '--lane', LANE, '--real', RECEIPT, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIX, '--prior-set', PRIOR_SET, '--work', path.join(SCRATCH, 'work', m.id), '--first-failure', '--json'], { timeout: 900000 });
  const crashed = !direct.json && /Error|error/.test(direct.stderr) && direct.status !== 0;
  const directFindings = direct.json && Array.isArray(direct.json.findings) ? direct.json.findings.map((f) => f.id) : null;
  const failedCases = battery.json && Array.isArray(battery.json.results) ? battery.json.results.map((x) => x.case) : [];
  let outcome;
  if (crashed) outcome = 'crashed';
  else if (battery.status === 0) outcome = 'survived';
  else outcome = 'killed';
  return {
    id: m.id, type: 'counter', clause: m.clause, outcome,
    mutantSha256: shaOf(a.out), pristineSha256: shaOf(pristineCounter),
    direct: { status: direct.status, verdict: direct.json ? direct.json.verdict : null, findings: directFindings, stderr: direct.stderr || null },
    battery: { status: battery.status, failedCases: failedCases, failed: battery.json ? battery.json.failed : null, casesRun: battery.json ? battery.json.cases : null, coverage: battery.json ? battery.json.coverage : null },
  };
};

// selftest mutant scoring: lane-like dir + own selftest + id-rename probe
const scoreSelftest = (m) => {
  const a = apply(pristineCounter, m.from, m.to);
  if (!a.ok) return { id: m.id, type: 'selftest', clause: m.clause, outcome: 'unapplied', occurrences: a.n };
  const base = path.join(SCRATCH, 'cases', m.id);
  const laneLike = path.join(base, 'lane');
  ensuredir(path.join(laneLike, 'scripts'));
  ensuredir(path.join(laneLike, 'corpus/evidence/round90/chromium-showpicker'));
  const mutPath = path.join(laneLike, 'scripts/check-showpicker-round90.mjs');
  fs.writeFileSync(mutPath, a.out);
  fs.copyFileSync(RECEIPT, path.join(laneLike, 'corpus/evidence/round90/chromium-showpicker/receipt.json'));
  const env = { HYAKU_SCRATCH: path.join(base, 'selftest-scratch') };
  const self = run([mutPath, '--selftest', '--json'], { env, timeout: 180000 });
  // probe: rename the finding id the assertion claims to bind
  const rename = m.probe === 'schema' ? [`check('schema',`, `check('schema-r',`] : [`check('plan-calls',`, `check('plan-calls-r',`];
  const pro = apply(a.out, rename[0], rename[1]);
  const probePath = path.join(laneLike, 'scripts/probe-check-showpicker-round90.mjs');
  let probe = null, pristineProbe = null;
  if (pro.ok) {
    fs.writeFileSync(probePath, pro.out);
    probe = run([probePath, '--selftest', '--json'], { env, timeout: 180000 });
    const pa = apply(pristineCounter, rename[0], rename[1]);
    if (pa.ok) {
      const pristineProbePath = path.join(base, 'pristine-probe.mjs');
      // run the pristine probe from a lane-like location so ../corpus resolves
      const pp = path.join(laneLike, 'scripts/pristine-probe-check-showpicker-round90.mjs');
      fs.writeFileSync(pp, pa.out);
      pristineProbe = run([pp, '--selftest', '--json'], { env, timeout: 180000 });
    }
  }
  let outcome;
  if (!self.json) outcome = 'crashed';
  else if (self.status !== 0) outcome = 'self-red'; // mutant fails its own selftest
  else if (pristineProbe && pristineProbe.status === 1 && probe && probe.status === 0) outcome = 'killed';
  else if (pristineProbe && pristineProbe.status === 1 && probe && probe.status === 1) outcome = 'survived';
  else outcome = 'inconclusive';
  return {
    id: m.id, type: 'selftest', clause: m.clause, outcome,
    mutantSha256: shaOf(a.out), pristineSha256: shaOf(pristineCounter),
    ownSelftest: { status: self.status, json: self.json, stderr: self.stderr || null },
    probe: { idRenamed: rename[0], pristineStatus: pristineProbe ? pristineProbe.status : null, mutantStatus: probe ? probe.status : null, mutantJson: probe ? probe.json : null, pristineJson: pristineProbe ? pristineProbe.json : null },
  };
};

// drift mutant scoring: mutant gate vs a red fixture lane (and green fixture / real lane controls)
const scoreDrift = (m) => {
  const a = apply(pristineDrift, m.from, m.to);
  if (!a.ok) return { id: m.id, type: 'drift', clause: m.clause, outcome: 'unapplied', occurrences: a.n };
  const dir = path.join(SCRATCH, 'cases', m.id);
  ensuredir(dir);
  const mutPath = path.join(dir, 'check-record-drift-round90.mjs');
  fs.writeFileSync(mutPath, a.out);
  const fixture = path.join(SCRATCH, 'fixtures', m.fixture);
  const onRed = run([mutPath, '--lane', fixture, '--json'], { timeout: 60000 });
  const pristineRed = run([SRC_DRIFT, '--lane', fixture, '--json'], { timeout: 60000 });
  const onGreen = run([mutPath, '--lane', path.join(SCRATCH, 'fixtures', 'green'), '--json'], { timeout: 60000 });
  const onLane = run([mutPath, '--lane', LANE, '--json'], { timeout: 60000 });
  const find = (j, id) => (j && Array.isArray(j.results) ? (j.results.find((x) => x.id === id) || {}).ok : null);
  const targetPristine = m.statement ? find(pristineRed.json, m.statement) : null;
  const targetMutant = m.statement ? find(onRed.json, m.statement) : null;
  let outcome;
  if (m.fixture === 'selftest-probe') {
    // drift --selftest assertion probe: pristine + perturbed fixture must be red, mutant green
    const base = path.join(dir, 'probe');
    ensuredir(base);
    const perturb = (src) => src.replace(`put('SKILL.md', '# fixture\\n');`, `put('SKILL.md', '# fixture\\nplans/round-89.md §Narrowings\\n');`);
    const p1 = perturb(pristineDrift), m1 = perturb(a.out);
    const pristineProbePath = path.join(base, 'pristine-drift.mjs');
    const mutantProbePath = path.join(base, 'mutant-drift.mjs');
    fs.writeFileSync(pristineProbePath, p1);
    fs.writeFileSync(mutantProbePath, m1);
    const pp = run([pristineProbePath, '--lane', LANE, '--selftest', '--json'], { env: { HYAKU_SCRATCH: path.join(base, 'scratch') }, timeout: 180000 });
    const mp = run([mutantProbePath, '--lane', LANE, '--selftest', '--json'], { env: { HYAKU_SCRATCH: path.join(base, 'scratch') }, timeout: 180000 });
    const own = run([mutPath, '--lane', LANE, '--selftest', '--json'], { env: { HYAKU_SCRATCH: path.join(base, 'scratch') }, timeout: 180000 });
    outcome = (pp.status === 1 && mp.status === 0) ? 'killed' : (pp.status === 1 && mp.status === 1 ? 'survived' : 'inconclusive');
    return { id: m.id, type: 'drift', clause: m.clause, outcome, mutantSha256: shaOf(a.out), pristineSha256: shaOf(pristineDrift),
      ownSelftest: { status: own.status, json: own.json }, probe: { pristineStatus: pp.status, mutantStatus: mp.status, pristineJson: pp.json, mutantJson: mp.json } };
  }
  outcome = (targetPristine === false && targetMutant === true) ? 'killed'
    : (targetPristine === false && targetMutant === false) ? 'survived'
    : 'inconclusive';
  const otherReds = (j) => (j && Array.isArray(j.results) ? j.results.filter((x) => !x.ok).map((x) => x.id) : []);
  return {
    id: m.id, type: 'drift', clause: m.clause, outcome,
    mutantSha256: shaOf(a.out), pristineSha256: shaOf(pristineDrift),
    fixture: m.fixture, statement: m.statement,
    redFixture: { pristine: { status: pristineRed.status, failed: otherReds(pristineRed.json), target: targetPristine }, mutant: { status: onRed.status, failed: otherReds(onRed.json), target: targetMutant } },
    greenFixture: { status: onGreen.status, mismatches: onGreen.json ? onGreen.json.mismatches : null, failed: otherReds(onGreen.json) },
    realLane: { status: onLane.status, mismatches: onLane.json ? onLane.json.mismatches : null, failed: otherReds(onLane.json) },
  };
};

// ---------- main ----------
const which = process.argv[2] || 'all';
const out = [];
if (which === 'all' || which === 'counter') for (const m of counterMutants) { const r = scoreCounter(m); out.push(r); console.error('COUNTER', r.id, r.outcome, r.battery ? JSON.stringify(r.battery.failedCases) : ''); }
if (which === 'all' || which === 'selftest') for (const m of selftestMutants) { const r = scoreSelftest(m); out.push(r); console.error('SELFTEST', r.id, r.outcome); }
if (which === 'all' || which === 'drift') for (const m of driftMutants) { const r = scoreDrift(m); out.push(r); console.error('DRIFT', r.id, r.outcome); }
fs.writeFileSync(path.join(SCRATCH, 'logs', 'mutants-' + which + '.json'), JSON.stringify({ pristine: { counter: shaOf(pristineCounter), drift: shaOf(pristineDrift), battery: shaOf(pristineBattery) }, mutants: out }, null, 1) + '\n');
const tally = (t) => out.filter((x) => x.type === t).reduce((a, x) => (a[x.outcome] = (a[x.outcome] || 0) + 1, a), {});
console.log(JSON.stringify({ total: out.length, counter: tally('counter'), selftest: tally('selftest'), drift: tally('drift') }, null, 1));
