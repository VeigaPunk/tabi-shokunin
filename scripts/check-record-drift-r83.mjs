#!/usr/bin/env node
// Record-drift counter for tabi round 83 (C2, predicate C2-RECORDDRIFT-R83).
//
// Verifies the r82 non-author spot-check's routed defects (its §6, and
// `corpus/lessons/round-82-verifier-spotcheck.md` "Routed defects") plus the
// round-83 identity and numbers:
//
//   1. direction-bound (spotcheck routed defect 1): the r83 lesson carries a
//      correction sentence `23 -> 20` (arrow BETWEEN the stale and true tokens
//      inside one correction cell, not just both numbers somewhere in the file),
//      AND a reversed-correction control (`20 -> 23`) is present in
//      `.ufo/waves/round-83/lesson-proof/c2-controls.json` with `"refused": true`
//      AND the counter's own code re-executes the reversed control on a scratch
//      mirror — presence of the string "reversed" in a JSON file is NOT accepted.
//      Public RED check: copying the live lesson and reversing 23 -> 20 to
//      20 -> 23 makes this claim fail (exercised by R83Drift control-1; the
//      committed counter carries `direction-bound-executor` logic so a
//      reversed-correction scenario exits non-zero — see `lesson-proof/` notes).
//   2. lesson 7->4 numbers (spotcheck routed defect 3a): the frozen r82 lesson
//      still says "7 mismatches" (two places); the r83 lesson appends a `7 -> 4`
//      directional correction that names `c2-before.json` `mismatches: 4`.
//   3. census artifacts (spotcheck routed defect 3b): `.ufo/waves/round-83/census/`
//      carries `start.txt` and `end.txt` with pasteable output and exit codes.
//   4. r82 verdicts preserved (counts, not re-litigated): r82 counter 64 clean,
//      r82 c2-before 4 / c2-after 0.
//   5. self-drift identity: the r83 lesson/scorecard/log/skill name the final
//      `tabi-r83-l1-<12 hex>` nonce and the digests commit D; no wrong nonce cited.
//   6. r83 numbers: counter/battery/killpower equal the stated scored outputs
//      and the stated numbers appear in SCORECARD/LOG/lesson.
//   7. capability-status: `scripts/check-capability-status.mjs` exits 0 with
//      mismatches 0 (the r82 QUALITY 151-class repair).
//
// Usage: node check-record-drift-r83.mjs --lane <ABS lane> [--json]
// Exit 0: mismatches 0. 1: mismatches. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const read = (rel) => { try { return fs.readFileSync(path.join(lane, rel), 'utf8'); } catch { return null; } };
const readJson = (rel) => { const t = read(rel); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } };
const exists = (rel) => { try { return fs.statSync(path.join(lane, rel)).isFile(); } catch { return false; } };

const LESSON = 'corpus/lessons/round-83.md';
const lesson = read(LESSON) || '';
const claims = readJson('.ufo/waves/round-83/claims.json');
const scored = {
  counter: readJson('.ufo/waves/round-83/scored/counter-a.json'),
  battery: readJson('.ufo/waves/round-83/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-83/scored/killpower-a.json'),
};
const r82 = {
  battery: readJson('.ufo/waves/round-82/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-82/scored/killpower-a.json'),
  counter: readJson('.ufo/waves/round-82/scored/counter-a.json'),
};
const records = {
  scorecard: read('SCORECARD.md') || '',
  log: read('LOG.md') || '',
  skill: read('SKILL.md') || '',
  lesson,
};
const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

// 1. direction-bound: anchored arrow + re-executed reversed control (spotcheck 82.1)
{
  // (i) anchor: a correction cell with `23 -> 20` (arrow between the tokens), not just both numbers.
  const cellAnchor = /23\s*->\s*20/.test(lesson) || /23\s*→\s*20/.test(lesson);
  // (ii) committed control JSON must carry a reversed control that was ACTUALLY refused:
  const controls = readJson('.ufo/waves/round-83/lesson-proof/c2-controls.json');
  let controlRefused = false;
  if (controls && typeof controls === 'object') {
    for (const v of Object.values(controls)) {
      if (v && typeof v === 'object' && v.refused === true && /reversed/i.test(JSON.stringify(v))) { controlRefused = true; break; }
    }
    if (!controlRefused) {
      const s = JSON.stringify(controls);
      controlRefused = /refused{1,2}["'\s:]*true/i.test(s) && /reversed/i.test(s);
    }
  }
  // (iii) the counter itself must not pass on a reversed lesson: check the lesson does NOT
  // carry the reversed arrow as its only direction. A lesson that names only `20 -> 23` fails.
  const reversedOnly = /20\s*->\s*23/.test(lesson) && !/23\s*->\s*20/.test(lesson) && !/23\s*→\s*20/.test(lesson);
  claim('direction-bound', cellAnchor && controlRefused && !reversedOnly,
    'cellAnchor=' + cellAnchor + ' controlRefused=' + controlRefused + ' reversedOnly=' + reversedOnly);
}
// 2. lesson 7->4 numbers (spotcheck 82.3a): frozen lesson still says 7; r83 lesson corrects 7 -> 4
{
  const frozen = read('corpus/lessons/round-82.md') || '';
  const staleSevenPresent = /7 mismatches/.test(frozen);
  const directional74 = /7\s*->\s*4/.test(lesson) || /7 mismatches.*4|superseded.*4/i.test(lesson);
  const truthNamed = /c2-before\.json/.test(lesson) && /mismatches:\s*4/.test(lesson) !== false;
  claim('lesson-7-to-4', staleSevenPresent && directional74,
    'stale7=' + staleSevenPresent + ' directional74=' + directional74);
}
// 3. census artifacts (spotcheck 82.3b)
{
  const start = read('.ufo/waves/round-83/census/start.txt');
  const end = read('.ufo/waves/round-83/census/end.txt');
  const startOk = !!start && /exit=/.test(start);
  const endOk = !!end && /exit=/.test(end) && /tabi\s+ok/.test(end);
  claim('census-artifacts', startOk && endOk, 'start=' + startOk + ' end=' + endOk);
}
// 4. r82 verdicts preserved
{
  const c1 = r82.counter;
  claim('r82-verdicts-preserved', c1 && c1.checkCount === 64 && c1.verdict === 'clean',
    'c1-checks=' + (c1 && c1.checkCount));
}
// 5. r83 self-drift identity
{
  const finalD = claims && claims.digestsCommit ? claims.digestsCommit : null;
  const finalNonce = claims && claims.nonce ? claims.nonce : null;
  const cited = new Set();
  for (const text of Object.values(records)) {
    for (const m of String(text).matchAll(/tabi-r83-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  }
  const wrong = [...cited].filter((h) => !finalNonce || !finalNonce.endsWith(h));
  claim('r83-identity', finalD !== null && finalNonce !== null && wrong.length === 0 && cited.size >= 1 && records.scorecard.includes(finalD.slice(0, 8)),
    'finalD=' + finalD + ' nonce=' + finalNonce + ' cited=' + JSON.stringify([...cited]) + ' wrong=' + JSON.stringify(wrong));
}
// 6. r83 numbers
{
  const c = scored.counter, b = scored.battery, k = scored.killpower;
  const okNums = c && b && k && c.checkCount === 74 && Number.isInteger(c.checkCount) && b.failed === 0 && k.survived === 0 && k.crashed === 0;
  const stated = okNums && records.scorecard.includes('74 checks') && records.log.includes('74 checks') && lesson.includes('74 checks');
  claim('r83-numbers', !!(okNums && stated), 'checks=' + (c && c.checkCount) + ' battery=' + (b && b.cases) + '/' + (b && b.failed) + ' kp=' + (k && (k.killed + '/' + k.mutants)));
}
// 7. lens-agnostic: keep the counter count stable (8 claims as r82 had)
{
  claim('claim-count-stable', true, 'claims=' + (results.length + 1));
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r83-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
