#!/usr/bin/env node
// Re-score against the re-issued freeze (11:36): the counter mutants whose anchors survive,
// the retargeted versions of clauses the lane rewrote, and the drift mutants on new fixtures.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const HERE = '/fast/scratch/hyaku/tabi-r90/R90Mut1';
const REAL_LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const LANE = process.env.R90_LANE || REAL_LANE;
const ONLY = process.argv[2] || 'all';
const COUNTER = path.join(REAL_LANE, 'scripts/check-showpicker-round90.mjs');
const BATTERY = path.join(REAL_LANE, 'scripts/negatives-showpicker-round90.mjs');
const DRIFT = path.join(REAL_LANE, 'scripts/check-record-drift-round90.mjs');
const RECEIPT = path.join(LANE, 'corpus/evidence/round90/chromium-showpicker/receipt.json');
const PRIOR = path.join(REAL_LANE, '.ufo/waves/round-90/controls/c1/prior-set.txt');
const PIN = 'ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d';
const NONCE = 'tabi-r90-l1-e573334c78fa';
const FIX = '5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8';
const srcCounter = fs.readFileSync(COUNTER, 'utf8');
const srcBattery = fs.readFileSync(BATTERY, 'utf8');
const srcDrift = fs.readFileSync(DRIFT, 'utf8');
const sha = (t) => crypto.createHash('sha256').update(Buffer.from(t, 'utf8')).digest('hex');
const run = (args, opts = {}) => {
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: opts.timeout || 900000, env: { ...process.env, ...(opts.env || {}) } });
  let json = null; try { json = JSON.parse(r.stdout); } catch {}
  return { status: r.status, json, stderr: (r.stderr || '').slice(0, 500) };
};
const applyEdits = (src, edits) => {
  let out = src;
  for (const [from, to] of edits) {
    const n = out.split(from).length - 1;
    if (n !== 1) return { ok: false, n, from };
    out = out.replace(from, to);
  }
  return { ok: true, out };
};

const counterMutants = [
  { id: 'm04-settle-order-any-position', clause: 'settle-order: immediately after settle __state()', edits: [[`if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, `if (!(settleIx >= 0)) planBad.push(leg.name + ':settle-order');`]], witness: 'm06-settle-order-any-later/w06-settle-two-slots-after-state.json' },
  { id: 'm05-settle-order-adjacent-either-side', clause: 'settle-order: immediately AFTER', edits: [[`if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, `if (!(settleIx === stateIx + 1 || settleIx === stateIx - 1)) planBad.push(leg.name + ':settle-order');`]], witness: null },
  { id: 'm06-settle-order-any-later', clause: 'settle-order: immediate adjacency', edits: [[`if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, `if (!(settleIx >= stateIx)) planBad.push(leg.name + ':settle-order');`]], witness: 'm06-settle-order-any-later/w06-settle-two-slots-after-state.json' },
  { id: 'm07-settle-order-flip-before', clause: 'settle-order: after, not before', edits: [[`if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');`, `if (!(settleIx === stateIx - 1)) planBad.push(leg.name + ':settle-order');`]], witness: null },
  { id: 'm11-wants-method-only', clause: 'wants-sequence: method+params equality', edits: [[`if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`, `if (!same(got.map((c) => c.method), want.map((c) => c.method))) planBad.push(`]], witness: null },
  { id: 'm12-wants-order-dropped', clause: 'wants-sequence: ordered', edits: [[`if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`, `if (!same(got.map((c) => JSON.stringify({ method: c.method, params: c.params })).sort(), want.map((c) => JSON.stringify({ method: c.method, params: c.params })).sort())) planBad.push(`]], witness: 'm12-wants-order-dropped/w12-sequence-order-swapped.json' },
  { id: 'm13-wants-flip', clause: 'wants-sequence: equality (flip)', edits: [[`if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`, `if (same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(`]], witness: null },
  { id: 'n-c03-settle-sequence-params-drop', clause: 'wants-sequence: settle call in order with exact params', edits: [[`  if (p.kind === 'showpicker-domread') want.push({ method: 'Runtime.evaluate', params: { expression: 'window.__inputs(true)', returnByValue: true } });\n`, ``], [` || (p.kind === 'showpicker-domread' && c.params.expression === 'window.__inputs(true)')`, ``]], witness: 'm14-settle-sequence-entry-dropped/w14-settle-params-dropped.json' },
  { id: 'm15-domread-raw-dropped', clause: 'domRead: raw accept string bound', edits: [[`const toksOk = isObj(desc) && same(desc.acceptTokens, toks) && desc.accept === raw;`, `const toksOk = isObj(desc) && same(desc.acceptTokens, toks);`]], witness: null },
  { id: 'm16-domread-tokens-dropped', clause: 'domRead: parsed token list bound', edits: [[`const toksOk = isObj(desc) && same(desc.acceptTokens, toks) && desc.accept === raw;`, `const toksOk = isObj(desc) && Array.isArray(desc.acceptTokens) && desc.accept === raw;`]], witness: null },
  { id: 'm17-domread-answer-dropped', clause: 'domRead: answer bytes bound', edits: [[`  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`, `  const ansOk = true;`]], witness: null },
  { id: 'm18-domread-state-dropped', clause: 'domRead: input state bound', edits: [[`  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`, `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`]], witness: null },
  { id: 'm19-domread-readcount-loosened', clause: 'domRead: exactly one read event', edits: [[`  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`, `  const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length >= 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;`]], witness: 'm19-domread-readcount-loosened/w19-domread-read-duplicated.json' },
  { id: 'm20-domread-tokens-uppercase-flip', clause: 'domRead: ASCII-lowercased tokens', edits: [[`same(desc.acceptTokens, toks)`, `same(desc.acceptTokens.map((x) => String(x).toUpperCase()), toks)`]], witness: null },
  { id: 'n-c01-allowlist-settle-any-leg', clause: 'unexpected-settle (new implementation: send-log allowlist)', edits: [[`  if (params.expression === 'window.__inputs(true)') return p.kind === 'showpicker-domread';`, `  if (params.expression === 'window.__inputs(true)') return true;`]], witness: 'm08-unexpected-settle-two-ok/w08-unexpected-settle-one.json' },
  { id: 'n-c02-allowlist-settle-none', clause: 'unexpected-settle (flip: settle read refused everywhere)', edits: [[`  if (params.expression === 'window.__inputs(true)') return p.kind === 'showpicker-domread';`, `  if (params.expression === 'window.__inputs(true)') return false;`]], witness: null },
];

const driftMutants = [
  { id: 'm28-drift-narrowing-points-loose', clause: 'stmt2: two corrected rows point at a real section', edits: [[`const pointsReal = corrected.length >= 2 && corrected.every((l) => /SCORECARD\\.md ## Round 89/.test(l));`, `const pointsReal = corrected.length >= 1;`]], fixture: 'g2b-narrowing-one-row', statement: 'r89-narrowing-pointers' },
  { id: 'm30-drift-census-223-guard-drop', clause: 'stmt3: 224 not contradicted by 223', edits: [[`const says224 = /224 rows/.test(correction) && !/223 rows/.test(correction.split('\\n').find((l) => /224 rows/.test(l)) || '');`, `const says224 = /224 rows/.test(correction);`]], fixture: 'g3b-census-223-guard', statement: 'r89-census-attribution' },
  { id: 'm34-drift-gate-kill-selftest-drop', clause: 'stmt6: kill power exposes --selftest', edits: [[`const kst = /--selftest/.test(killSrc);`, `const kst = true;`]], fixture: 'g6a-kill-selftest-missing', statement: 'gate-selftest' },
  { id: 'm35-drift-quality-cites-drop', clause: 'stmt7: QUALITY 161 cites the gate', edits: [[`claim('quality161-sweep', cites && sweeps,`, `claim('quality161-sweep', sweeps,`]], fixture: 'g7a-quality-cites-missing', statement: 'quality161-sweep' },
  { id: 'm36-drift-scorecard-stray-drop', clause: 'stmt8: no stray selftest 10/10', edits: [[`claim('scorecard-tallies', bad.length === 0 && stray.length === 0,`, `claim('scorecard-tallies', bad.length === 0,`]], fixture: 'g8b-scorecard-stray', statement: 'scorecard-tallies' },
  { id: 'm37-drift-scorecard-bad-drop', clause: 'stmt8: seven swept tallies hold 9/9', edits: [[`claim('scorecard-tallies', bad.length === 0 && stray.length === 0,`, `claim('scorecard-tallies', stray.length === 0,`]], fixture: 'g8a-scorecard-bad', statement: 'scorecard-tallies' },
  { id: 'm38-drift-selftest-okc-drop', clause: 'drift selftest: fixture reds are causal', edits: [[`const okC = /amendment=missing/.test(detail('r89-claim-sweep')) && /live=\\["corpus\\/lessons\\/round-89.md"\\]/.test(detail('r89-narrowing-pointers')) && /round-44-has-10/.test(detail('scorecard-tallies'));`, `const okC = /amendment=missing/.test(detail('r89-claim-sweep'));`]], fixture: 'selftest-probe', statement: null },
  { id: 'n-d1-sweep-plans-conjunct', clause: 'stmt1: correction names the plan pointer', edits: [[`const named = /replayConsistency/.test(correction) && /tapi-/.test(correction) && /plans\\/round-89\\.md/.test(correction);`, `const named = /replayConsistency/.test(correction) && /tapi-/.test(correction);`]], fixture: 'g1d-sweep-plans-pointer-missing', statement: 'r89-claim-sweep' },
  { id: 'n-d2-narrowing-live-conjunct', clause: 'stmt2: no live citation outside the correction', edits: [[`claim('r89-narrowing-pointers', pointsReal && realSections && live.length === 0 && ledgerLive === 0 && missingFiles.length === 0,`, `claim('r89-narrowing-pointers', pointsReal && realSections && ledgerLive === 0 && missingFiles.length === 0,`]], fixture: 'g2a-narrowing-live', statement: 'r89-narrowing-pointers' },
  { id: 'n-d3-census-annot-conjunct', clause: 'stmt3: the annotation equals the measured count', edits: [[`claim('r89-census-attribution', sourceRows === 224 && censusRows && says224 && r88attr && quote && words === 17 && annotOk,`, `claim('r89-census-attribution', sourceRows === 224 && censusRows && says224 && r88attr && quote && words === 17,`]], fixture: 'g3c-annot-wrong', statement: 'r89-census-attribution' },
  { id: 'n-d4-leak-deadbranch-conjunct', clause: 'stmt4: dead-branch witness leaves the fixture present', edits: [[`      && witness.deadBranch && witness.deadBranch.exit === 1 && witness.deadBranch.fixtureAbsent === false`, `      && witness.deadBranch && witness.deadBranch.exit === 1`]], fixture: 'g4a-leak-deadbranch-open', statement: 'r89-leak-enforcement' },
  { id: 'n-d5-leak-pin-conjunct', clause: 'stmt4: witness pins the frozen drift bytes', edits: [[`      && witness.instrumentPins && witness.instrumentPins['scripts/check-record-drift-round90.mjs'] === selfPin;`, `      ;`]], fixture: 'g4b-leak-pin-mismatch', statement: 'r89-leak-enforcement' },
  { id: 'n-d6-leak-named-conjunct', clause: 'stmt4: correction names the witness', edits: [[`const named = /Leak enforcement/.test(correction) && /witness/.test(correction);`, `const named = /Leak enforcement/.test(correction);`]], fixture: 'g4c-leak-named-missing', statement: 'r89-leak-enforcement' },
  { id: 'n-d7-revision-time1-conjunct', clause: 'stmt5: SCORECARD.md (10:19:34) named', edits: [[`      && /SCORECARD\\.md\`? \\(10:19:34\\)/.test(correction) && /SKILL\\.md\`? \\(10:19:40\\)/.test(correction);`, `      && /SKILL\\.md\`? \\(10:19:40\\)/.test(correction);`]], fixture: 'g5b-revision-time1', statement: 'r89-revision-naming' },
  { id: 'n-d8-revision-time2-conjunct', clause: 'stmt5: SKILL.md (10:19:40) named', edits: [[`      && /SCORECARD\\.md\`? \\(10:19:34\\)/.test(correction) && /SKILL\\.md\`? \\(10:19:40\\)/.test(correction);`, `      && /SCORECARD\\.md\`? \\(10:19:34\\)/.test(correction);`]], fixture: 'g5c-revision-time2', statement: 'r89-revision-naming' },
];

const results = [];
if (ONLY === 'all' || ONLY === 'counter') {
const realSha = crypto.createHash('sha256').update(fs.readFileSync(RECEIPT)).digest('hex');
for (const m of counterMutants) {
  const a = applyEdits(srcCounter, m.edits);
  if (!a.ok) { results.push({ id: m.id, type: 'counter', clause: m.clause, outcome: 'unapplied', occurrences: a.n }); continue; }
  const dir = path.join(HERE, 'cases2', m.id);
  fs.mkdirSync(dir, { recursive: true });
  const mp = path.join(dir, 'check-showpicker-round90.mjs');
  fs.writeFileSync(mp, a.out);
  fs.writeFileSync(path.join(dir, 'negatives-showpicker-round90.mjs'), srcBattery);
  const direct = run([mp, '--lane', LANE, '--receipt', RECEIPT, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIX, '--prior-set', PRIOR, '--json'], { timeout: 120000 });
  const battery = run([path.join(dir, 'negatives-showpicker-round90.mjs'), '--lane', LANE, '--real', RECEIPT, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIX, '--prior-set', PRIOR, '--work', path.join(HERE, 'work2', m.id), '--first-failure', '--json'], { timeout: 900000 });
  const witnesses = [];
  if (m.witness) {
    const wp = path.join(HERE, 'cases', m.witness);
    for (const [tag, bin] of [['pristine', COUNTER], ['mutant', mp]]) {
      if (!fs.existsSync(wp)) { witnesses.push({ tag, missing: wp }); continue; }
      const w = run([bin, '--lane', LANE, '--receipt', wp, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIX, '--prior-set', PRIOR, '--tree-exempt-sha256', realSha, '--json'], { timeout: 120000 });
      witnesses.push({ tag, status: w.status, findings: w.json && w.json.findings ? w.json.findings.map((f) => f.id) : null });
    }
  }
  const outcome = !direct.json && direct.status !== 0 ? 'crashed' : (battery.status === 0 ? 'survived' : 'killed');
  results.push({ id: m.id, type: 'counter', clause: m.clause, outcome, mutantSha256: sha(a.out),
    direct: { status: direct.status, verdict: direct.json ? direct.json.verdict : null, findings: direct.json && direct.json.findings ? direct.json.findings.map((f) => f.id) : null, stderr: direct.stderr || null },
    battery: { status: battery.status, failedCases: battery.json && battery.json.results ? battery.json.results.map((x) => x.case) : null, failed: battery.json ? battery.json.failed : null, cases: battery.json ? battery.json.cases : null, coverage: battery.json ? battery.json.coverage : null },
    witnesses });
  console.error('COUNTER2', m.id, outcome, battery.json && battery.json.results ? JSON.stringify(battery.json.results.map((x) => x.case)) : '');
}
}
if (ONLY === 'all' || ONLY === 'drift') {
for (const m of driftMutants) {
  const a = applyEdits(srcDrift, m.edits);
  if (!a.ok) { results.push({ id: m.id, type: 'drift', clause: m.clause, outcome: 'unapplied', occurrences: a.n }); continue; }
  const dir = path.join(HERE, 'cases2', m.id);
  fs.mkdirSync(dir, { recursive: true });
  const mp = path.join(dir, 'check-record-drift-round90.mjs');
  fs.writeFileSync(mp, a.out);
  if (m.fixture === 'selftest-probe') {
    const base = path.join(dir, 'probe'); fs.mkdirSync(base, { recursive: true });
    const perturb = (s) => s.replace(`put('SKILL.md', '# fixture\\n');`, `put('SKILL.md', '# fixture\\nplans/round-89.md §Narrowings\\n');`);
    const pp = path.join(base, 'pristine-drift.mjs'), mm = path.join(base, 'mutant-drift.mjs');
    fs.writeFileSync(pp, perturb(srcDrift)); fs.writeFileSync(mm, perturb(a.out));
    const env = { HYAKU_SCRATCH: path.join(base, 'scratch') };
    const p1 = run([pp, '--lane', LANE, '--selftest', '--json'], { env, timeout: 180000 });
    const m1 = run([mm, '--lane', LANE, '--selftest', '--json'], { env, timeout: 180000 });
    const own = run([mp, '--lane', LANE, '--selftest', '--json'], { env, timeout: 180000 });
    const outcome = (p1.status === 1 && m1.status === 0) ? 'killed' : (p1.status === 1 && m1.status === 1 ? 'survived' : 'inconclusive');
    results.push({ id: m.id, type: 'drift', clause: m.clause, outcome, mutantSha256: sha(a.out), ownSelftest: { status: own.status, json: own.json }, probe: { pristineStatus: p1.status, mutantStatus: m1.status, pristineJson: p1.json, mutantJson: m1.json } });
    console.error('DRIFT2', m.id, outcome);
    continue;
  }
  const fx = path.join(HERE, 'fixtures', m.fixture);
  const find = (j, id) => (j && Array.isArray(j.results) ? (j.results.find((x) => x.id === id) || {}).ok : null);
  const pristine = run([DRIFT, '--lane', fx, '--json'], { timeout: 60000 });
  const mutant = run([mp, '--lane', fx, '--json'], { timeout: 60000 });
  const green = run([mp, '--lane', path.join(HERE, 'fixtures', 'green2'), '--json'], { timeout: 60000 });
  const laneRun = run([mp, '--lane', LANE, '--json'], { timeout: 60000 });
  const tp = find(pristine.json, m.statement), tm = find(mutant.json, m.statement);
  const outcome = (tp === false && tm === true) ? 'killed' : (tp === false && tm === false ? 'survived' : 'inconclusive');
  results.push({ id: m.id, type: 'drift', clause: m.clause, outcome, mutantSha256: sha(a.out), fixture: m.fixture, statement: m.statement,
    redFixture: { pristine: { status: pristine.status, target: tp }, mutant: { status: mutant.status, target: tm } },
    greenFixture: { status: green.status, mismatches: green.json ? green.json.mismatches : null },
    realLane: { status: laneRun.status, mismatches: laneRun.json ? laneRun.json.mismatches : null } });
  console.error('DRIFT2', m.id, outcome);
}
}
fs.writeFileSync(path.join(HERE, 'logs', 'mutants-reissued-' + ONLY + '.json'), JSON.stringify({ sources: { counter: sha(srcCounter), battery: sha(srcBattery), drift: sha(srcDrift) }, mutants: results }, null, 1) + '\n');
const tally = (t) => results.filter((x) => x.type === t).reduce((a, x) => (a[x.outcome] = (a[x.outcome] || 0) + 1, a), {});
console.log(JSON.stringify({ total: results.length, counter: tally('counter'), drift: tally('drift') }, null, 1));
