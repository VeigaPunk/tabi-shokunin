#!/usr/bin/env node
// Record-drift counter for tabi round 80 (C2, predicate C2-RECORDDRIFT-R80).
//
// Two legs:
//   * r79-drift — the round-79 non-author spot-check's routed defects 1–4: every stale statement is
//     still present (records are append-only), a DIRECTIONAL correction pair `<stale> → <truth>`
//     names it, and the truth is re-derived from the committed bytes.
//   * self-drift — the round's OWN records (SCORECARD, LOG, SKILL, the lesson, the filed report,
//     claims.json) state the numbers the committed scored outputs carry. This is the leg the r79
//     counter lacked (round-79 routed defect 8): it would have caught the `88/88`, `66 mutants`,
//     `KILLPOWERNUM` drift in r79's own records.
//
// Usage: node check-record-drift-r80.mjs --lane <ABS lane> [--json]
// Exit 0: mismatches 0. 1: mismatches. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
const FLEET = path.dirname(lane);   // the filed reports live on the fleet repo, not in the lane
const arr = (v) => (Array.isArray(v) ? v : []);
const read = (rel) => { try { return fs.readFileSync(path.join(lane, rel), 'utf8'); } catch { return null; } };
const readFleet = (rel) => { try { return fs.readFileSync(path.join(FLEET, rel), 'utf8'); } catch { return null; } };
const json = (rel) => { try { return JSON.parse(read(rel)); } catch { return null; } };
const has = (rel, s) => { const t = read(rel); return t !== null && t.includes(s); };
const hasFleet = (rel, s) => { const t = readFleet(rel); return t !== null && t.includes(s); };
const exists = (rel) => fs.existsSync(path.join(lane, rel));

const counter = json('.ufo/waves/round-80/scored/counter-a.json');
const battery = json('.ufo/waves/round-80/scored/battery-a.json');
const killpower = json('.ufo/waves/round-80/scored/killpower-a.json');
const r79neg = json('.ufo/waves/round-79/scored/c1-negatives-a.json');
const r79self = json('.ufo/waves/round-79/scored/selftest-r79-gates.out');
const r79kp = (() => {
  const out = r79self && Array.isArray(r79self.results) ? r79self.results.find((r) => r.gate === 'kill-power') : null;
  if (!out || typeof out.detail !== 'string') return null;
  try { return JSON.parse(out.detail.replace(/^exit \d+ /, '')); } catch { return null; }
})();
const numbers = {
  checks: counter && Number.isInteger(counter.checkCount) ? counter.checkCount : null,
  cases: battery && Number.isInteger(battery.cases) ? battery.cases : null,
  mutants: killpower && Number.isInteger(killpower.mutants) ? killpower.mutants : null,
  killed: killpower && Number.isInteger(killpower.killed) ? killpower.killed : null,
};
const r79 = {
  cases: r79neg && Number.isInteger(r79neg.cases) ? r79neg.cases : null,
  mutants: r79kp && Number.isInteger(r79kp.mutants) ? r79kp.mutants : null,
  killed: r79kp && Number.isInteger(r79kp.killed) ? r79kp.killed : null,
};

const claims = [];
const claim = (id, fn) => claims.push({ id, fn });
// every pair of the given shape in the file must name the TRUE value: a second, wrong correction
// beside the correct one is a mismatch (the kill rule's wrong-correction clause, enforced)
const pairsOf = (rel, re) => { const t = read(rel) || ''; const out = []; const r = new RegExp(re.source, 'g'); let m; while ((m = r.exec(t))) out.push(m); return out; };
const allPairsTrue = (rel, re, ok) => { const ps = pairsOf(rel, re); return { ok: ps.length > 0 && ps.every(ok), detail: rel + ' pairs ' + JSON.stringify(ps.map((m) => m.slice(1))) }; };

// ---- leg 1: round-79 routed defects 1-4 (append-only corrections) ----
claim('sc-79-battery', () => {
  const stale = 'battery 88/88';
  const truth = 'battery 90/90';
  const pairs = allPairsTrue('SCORECARD.md', /battery (\d+)\/(\d+) → battery (\d+)\/(\d+)/, (m) => m[3] === '90' && m[4] === '90');
  const ok = has('SCORECARD.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && pairs.ok && r79.cases === 90;
  return { ok, detail: 'stale ' + has('SCORECARD.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' truth ' + r79.cases + ' ' + pairs.detail };
});
claim('sc-79-killpower', () => {
  const stale = 'KILLPOWERNUM';
  const truth = 'kill power 64/64';
  const pairs = allPairsTrue('SCORECARD.md', /kill power (\S+) → kill power (\d+)\/(\d+)/, (m) => m[2] === '64' && m[3] === '64');
  const ok = has('SCORECARD.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && pairs.ok && r79.mutants === 64 && r79.killed === 64;
  return { ok, detail: 'stale ' + has('SCORECARD.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' truth ' + JSON.stringify([r79.mutants, r79.killed]) + ' ' + pairs.detail };
});
claim('log-79-cases', () => {
  const stale = '88 cases';
  const truth = '90 cases';
  const pairs = allPairsTrue('LOG.md', /(\d+) cases → (\d+) cases/, (m) => m[2] === '90');
  const ok = has('LOG.md', stale) && has('LOG.md', stale + ' → ' + truth) && pairs.ok && r79.cases === 90;
  return { ok, detail: 'stale ' + has('LOG.md', stale) + ' correction ' + has('LOG.md', stale + ' → ' + truth) + ' truth ' + r79.cases + ' ' + pairs.detail };
});
claim('log-79-mutants', () => {
  const stale = '66 semantic mutants';
  const truth = '64 semantic mutants';
  const pairs = allPairsTrue('LOG.md', /(\d+) semantic mutants → (\d+) semantic mutants/, (m) => m[2] === '64');
  const ok = has('LOG.md', stale) && has('LOG.md', stale + ' → ' + truth) && pairs.ok && r79.mutants === 64;
  return { ok, detail: 'stale ' + has('LOG.md', stale) + ' correction ' + has('LOG.md', stale + ' → ' + truth) + ' truth ' + r79.mutants + ' ' + pairs.detail };
});
claim('skill-79-mutants', () => {
  const stale = '66 semantic mutants';
  const truth = '64 semantic mutants';
  const pairs = allPairsTrue('SKILL.md', /(\d+) semantic mutants → (\d+) semantic mutants/, (m) => m[2] === '64');
  const ok = has('SKILL.md', stale) && has('SKILL.md', stale + ' → ' + truth) && pairs.ok && r79.mutants === 64;
  return { ok, detail: 'stale ' + has('SKILL.md', stale) + ' correction ' + has('SKILL.md', stale + ' → ' + truth) + ' truth ' + r79.mutants + ' ' + pairs.detail };
});
claim('lesson-79-cases', () => {
  const stale = '88 cases';
  const truth = '90 cases';
  const pairs = allPairsTrue('corpus/lessons/round-79.md', /(\d+) cases → (\d+) cases/, (m) => m[2] === '90');
  const ok = has('corpus/lessons/round-79.md', stale) && has('corpus/lessons/round-79.md', stale + ' → ' + truth) && pairs.ok && r79.cases === 90;
  return { ok, detail: 'stale ' + has('corpus/lessons/round-79.md', stale) + ' correction ' + has('corpus/lessons/round-79.md', stale + ' → ' + truth) + ' truth ' + r79.cases + ' ' + pairs.detail };
});
claim('lesson-79-kpptr', () => {
  const stale = 'lesson-proof/kp-run1.json';
  const truth = 'withdrawn';
  const pairs = allPairsTrue('corpus/lessons/round-79.md', /kp-run1\.json → (\S+)/, (m) => m[1].replace(/[.,;:]+$/, '') === 'withdrawn');
  const ok = has('corpus/lessons/round-79.md', stale) && has('corpus/lessons/round-79.md', stale + ' → ' + truth) && pairs.ok && !exists('.ufo/waves/round-79/lesson-proof/kp-run1.json');
  return { ok, detail: 'stale ' + has('corpus/lessons/round-79.md', stale) + ' correction ' + has('corpus/lessons/round-79.md', stale + ' → ' + truth) + ' file-absent ' + !exists('.ufo/waves/round-79/lesson-proof/kp-run1.json') };
});
claim('report-79-kpfile', () => {
  const stale = 'c1-killpower-a.json';
  const truth = 'selftest-r79-gates.out';
  const pairs = allPairsTrue('SCORECARD.md', /c1-killpower-a\.json → (\S+)/, (m) => m[1].replace(/[.,;:]+$/, '') === 'selftest-r79-gates.out');
  const ok = hasFleet('.ufo/reports/round-79/tabi.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && pairs.ok && !exists('.ufo/waves/round-79/scored/c1-killpower-a.json') && exists('.ufo/waves/round-79/scored/selftest-r79-gates.out');
  return { ok, detail: 'stale ' + hasFleet('.ufo/reports/round-79/tabi.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' carrier ' + exists('.ufo/waves/round-79/scored/selftest-r79-gates.out') };
});
claim('report-79-shorthash', () => {
  const stale = 'f154beee';
  const truth = 'f154beeff14e349b84fa0d236461132295b7c017';
  const resolves = spawnSync('git', ['-C', lane, 'cat-file', '-e', truth], { encoding: 'utf8' }).status === 0;
  const pairs = allPairsTrue('SCORECARD.md', /f154beee → ([0-9a-f]+)/, (m) => m[1] === truth);
  const ok = hasFleet('.ufo/reports/round-79/tabi.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && pairs.ok && resolves;
  return { ok, detail: 'stale ' + hasFleet('.ufo/reports/round-79/tabi.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' resolves ' + resolves };
});
claim('lesson-79-quotecounts', () => {
  const pairs = [['(12 words)', '(10 words)'], ['(19 words)', '(15 words)'], ['(23 words)', '(11 words)']];
  const lesson = read('corpus/lessons/round-79.md') || '';
  const bad = pairs.filter(([s, t]) => !lesson.includes(s) || !lesson.includes(s + ' → ' + t));
  const all = allPairsTrue('corpus/lessons/round-79.md', /\((\d+) words\) → \((\d+) words\)/, (m) => pairs.some(([s, t]) => m[1] + ' words' === s.slice(1, -1) && m[2] + ' words' === t.slice(1, -1)));
  return { ok: bad.length === 0 && all.ok, detail: 'missing stale/correction pairs: ' + JSON.stringify(bad) + ' ' + all.detail };
});

// ---- leg 2: the round's OWN records vs the committed scored outputs ----
const numberTriples = (rel) => {
  const t = read(rel);
  if (t === null) return { ok: false, detail: rel + ' unreadable' };
  const want = ['battery ' + numbers.cases + '/' + numbers.cases, 'kill power ' + numbers.mutants + '/' + numbers.killed, numbers.checks + ' checks'];
  const missing = want.filter((s) => !t.includes(s));
  return { ok: missing.length === 0, detail: rel + ' missing ' + JSON.stringify(missing) };
};
for (const [id, rel] of [['sc-80-numbers', 'SCORECARD.md'], ['log-80-numbers', 'LOG.md'], ['skill-80-numbers', 'SKILL.md'], ['lesson-80-numbers', 'corpus/lessons/round-80.md']]) {
  claim(id, () => numberTriples(rel));
}
claim('report-80-numbers', () => {
  const t = readFleet('.ufo/reports/round-80/tabi.md');
  if (t === null) return { ok: false, detail: 'the filed report is unreadable' };
  const want = ['battery ' + numbers.cases + '/' + numbers.cases, 'kill power ' + numbers.mutants + '/' + numbers.killed, numbers.checks + ' checks'];
  const missing = want.filter((s) => !t.includes(s));
  return { ok: missing.length === 0, detail: 'the filed report is missing ' + JSON.stringify(missing) };
});
claim('claims-80-numbers', () => {
  // claims.json is frozen before the scored run: it states the counts in its own frozen phrasing
  const c = json('.ufo/waves/round-80/claims.json');
  const t = c ? JSON.stringify(c) : '';
  const want = [numbers.cases + ' cases', numbers.mutants + ' mutants, ' + numbers.killed + ' killed', 'checkCount ' + numbers.checks];
  const missing = want.filter((s) => !t.includes(s));
  return { ok: missing.length === 0, detail: 'claims.json missing ' + JSON.stringify(missing) };
});
claim('scored-80-present', () => {
  // a red battery, a findings verdict or a surviving mutant is a mismatch: the self-drift leg reads
  // the scored VERDICTS, not only the counts (R80Critic finding 3)
  const ok = numbers.checks !== null && numbers.cases !== null && numbers.mutants !== null && numbers.killed !== null &&
    numbers.mutants === numbers.killed &&
    counter.verdict === 'clean' && battery.failed === 0 && arr(battery.coverage && battery.coverage.uncovered).length === 0 && arr(battery.coverage && battery.coverage.unknown).length === 0 &&
    killpower.survived === 0 && killpower.crashed === 0;
  return { ok, detail: 'scored outputs ' + JSON.stringify(numbers) + ' verdict ' + (counter && counter.verdict) + ' battery.failed ' + (battery && battery.failed) + ' kp ' + JSON.stringify({ survived: killpower && killpower.survived, crashed: killpower && killpower.crashed }) };
});
claim('prefreeze-80', () => {
  const p = json('.ufo/waves/round-80/controls/c1/prefreeze-summary.json');
  const ok = p && p.counter && p.counter.verdict === 'clean' && p.battery && p.battery.failed === 0 && p.killpower && p.killpower.survived === 0 && p.killpower.crashed === 0;
  return { ok, detail: 'prefreeze-summary.json ' + JSON.stringify(p ? { verdict: p.counter.verdict, batteryFailed: p.battery.failed, kp: p.killpower } : null) };
});
claim('controls-80', () => {
  const c = json('.ufo/waves/round-80/lesson-proof/c2-controls.json');
  const ok = c && c.reverse && arr(c.reverse.delta).includes('sc-79-battery') && c.remove && arr(c.remove.delta).includes('log-79-cases') && c.moveTruth && arr(c.moveTruth.delta).includes('sc-80-numbers');
  return { ok, detail: 'c2-controls.json ' + JSON.stringify(c ? { reverse: c.reverse.delta, remove: c.remove.delta, moveTruth: c.moveTruth.delta } : null) };
});

const results = claims.map((c) => { try { const r = c.fn(); return { id: c.id, ok: !!r.ok, detail: r.detail }; } catch (e) { return { id: c.id, ok: false, detail: 'threw: ' + e.message }; } });
const failed = results.filter((r) => !r.ok);
const out = { schema: 'tabi-r80-record-drift', claims: results.length, mismatches: failed.length, failed: failed.map((f) => f.id), truth: { r80: numbers, r79 }, results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches: out.mismatches, failed: out.failed, truth: out.truth }, null, 1) + '\n');
process.exitCode = failed.length === 0 ? 0 : 1;
