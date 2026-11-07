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
const read = (rel) => { try { return fs.readFileSync(path.join(lane, rel), 'utf8'); } catch { return null; } };
const json = (rel) => { try { return JSON.parse(read(rel)); } catch { return null; } };
const has = (rel, s) => { const t = read(rel); return t !== null && t.includes(s); };
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

// ---- leg 1: round-79 routed defects 1-4 (append-only corrections) ----
claim('sc-79-battery', () => {
  const stale = 'battery 88/88';
  const truth = 'battery 90/90';
  const ok = has('SCORECARD.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && r79.cases === 90;
  return { ok, detail: 'stale ' + has('SCORECARD.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' truth ' + r79.cases };
});
claim('sc-79-killpower', () => {
  const stale = 'KILLPOWERNUM';
  const truth = 'kill power 64/64';
  const ok = has('SCORECARD.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && r79.mutants === 64 && r79.killed === 64;
  return { ok, detail: 'stale ' + has('SCORECARD.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' truth ' + JSON.stringify([r79.mutants, r79.killed]) };
});
claim('log-79-cases', () => {
  const stale = '88 cases';
  const truth = '90 cases';
  const ok = has('LOG.md', stale) && has('LOG.md', stale + ' → ' + truth) && r79.cases === 90;
  return { ok, detail: 'stale ' + has('LOG.md', stale) + ' correction ' + has('LOG.md', stale + ' → ' + truth) + ' truth ' + r79.cases };
});
claim('log-79-mutants', () => {
  const stale = '66 semantic mutants';
  const truth = '64 semantic mutants';
  const ok = has('LOG.md', stale) && has('LOG.md', stale + ' → ' + truth) && r79.mutants === 64;
  return { ok, detail: 'stale ' + has('LOG.md', stale) + ' correction ' + has('LOG.md', stale + ' → ' + truth) + ' truth ' + r79.mutants };
});
claim('skill-79-mutants', () => {
  const stale = '66 semantic mutants';
  const truth = '64 semantic mutants';
  const ok = has('SKILL.md', stale) && has('SKILL.md', stale + ' → ' + truth) && r79.mutants === 64;
  return { ok, detail: 'stale ' + has('SKILL.md', stale) + ' correction ' + has('SKILL.md', stale + ' → ' + truth) + ' truth ' + r79.mutants };
});
claim('lesson-79-cases', () => {
  const stale = '88 cases';
  const truth = '90 cases';
  const ok = has('corpus/lessons/round-79.md', stale) && has('corpus/lessons/round-79.md', stale + ' → ' + truth) && r79.cases === 90;
  return { ok, detail: 'stale ' + has('corpus/lessons/round-79.md', stale) + ' correction ' + has('corpus/lessons/round-79.md', stale + ' → ' + truth) + ' truth ' + r79.cases };
});
claim('lesson-79-kpptr', () => {
  const stale = 'lesson-proof/kp-run1.json';
  const truth = 'withdrawn';
  const ok = has('corpus/lessons/round-79.md', stale) && has('corpus/lessons/round-79.md', stale + ' → ' + truth) && !exists('.ufo/waves/round-79/lesson-proof/kp-run1.json');
  return { ok, detail: 'stale ' + has('corpus/lessons/round-79.md', stale) + ' correction ' + has('corpus/lessons/round-79.md', stale + ' → ' + truth) + ' file-absent ' + !exists('.ufo/waves/round-79/lesson-proof/kp-run1.json') };
});
claim('report-79-kpfile', () => {
  const stale = 'c1-killpower-a.json';
  const truth = 'selftest-r79-gates.out';
  const ok = has('.ufo/reports/round-79/tabi.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && !exists('.ufo/waves/round-79/scored/c1-killpower-a.json') && exists('.ufo/waves/round-79/scored/selftest-r79-gates.out');
  return { ok, detail: 'stale ' + has('.ufo/reports/round-79/tabi.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' carrier ' + exists('.ufo/waves/round-79/scored/selftest-r79-gates.out') };
});
claim('report-79-shorthash', () => {
  const stale = 'f154beee';
  const truth = 'f154beeff14e349b84fa0d236461132295b7c017';
  const resolves = spawnSync('git', ['-C', lane, 'cat-file', '-e', truth], { encoding: 'utf8' }).status === 0;
  const ok = has('.ufo/reports/round-79/tabi.md', stale) && has('SCORECARD.md', stale + ' → ' + truth) && resolves;
  return { ok, detail: 'stale ' + has('.ufo/reports/round-79/tabi.md', stale) + ' correction ' + has('SCORECARD.md', stale + ' → ' + truth) + ' resolves ' + resolves };
});
claim('lesson-79-quotecounts', () => {
  const pairs = [['(12 words)', '(10 words)'], ['(19 words)', '(15 words)'], ['(23 words)', '(11 words)']];
  const lesson = read('corpus/lessons/round-79.md') || '';
  const bad = pairs.filter(([s, t]) => !lesson.includes(s) || !lesson.includes(s + ' → ' + t));
  return { ok: bad.length === 0, detail: 'missing stale/correction pairs: ' + JSON.stringify(bad) };
});

// ---- leg 2: the round's OWN records vs the committed scored outputs ----
const numberTriples = (rel) => {
  const t = read(rel);
  if (t === null) return { ok: false, detail: rel + ' unreadable' };
  const want = ['battery ' + numbers.cases + '/' + numbers.cases, 'kill power ' + numbers.mutants + '/' + numbers.killed, numbers.checks + ' checks'];
  const missing = want.filter((s) => !t.includes(s));
  return { ok: missing.length === 0, detail: rel + ' missing ' + JSON.stringify(missing) };
};
for (const [id, rel] of [['sc-80-numbers', 'SCORECARD.md'], ['log-80-numbers', 'LOG.md'], ['skill-80-numbers', 'SKILL.md'], ['lesson-80-numbers', 'corpus/lessons/round-80.md'], ['report-80-numbers', '.ufo/reports/round-80/tabi.md']]) {
  claim(id, () => numberTriples(rel));
}
claim('claims-80-numbers', () => {
  const c = json('.ufo/waves/round-80/claims.json');
  const t = c ? JSON.stringify(c) : '';
  const want = ['battery ' + numbers.cases + '/' + numbers.cases, 'kill power ' + numbers.mutants + '/' + numbers.killed, numbers.checks + ' checks'];
  const missing = want.filter((s) => !t.includes(s));
  return { ok: missing.length === 0, detail: 'claims.json missing ' + JSON.stringify(missing) };
});
claim('scored-80-present', () => {
  const ok = numbers.checks !== null && numbers.cases !== null && numbers.mutants !== null && numbers.killed !== null && numbers.mutants === numbers.killed;
  return { ok, detail: 'scored outputs ' + JSON.stringify(numbers) };
});

const results = claims.map((c) => { try { const r = c.fn(); return { id: c.id, ok: !!r.ok, detail: r.detail }; } catch (e) { return { id: c.id, ok: false, detail: 'threw: ' + e.message }; } });
const failed = results.filter((r) => !r.ok);
const out = { schema: 'tabi-r80-record-drift', claims: results.length, mismatches: failed.length, failed: failed.map((f) => f.id), truth: { r80: numbers, r79 }, results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches: out.mismatches, failed: out.failed, truth: out.truth }, null, 1) + '\n');
process.exitCode = failed.length === 0 ? 0 : 1;
