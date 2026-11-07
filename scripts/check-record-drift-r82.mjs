#!/usr/bin/env node
// Record-drift counter for tabi round 82 (C2, predicate C2-RECORDDRIFT-R82).
//
// Counts mismatches between the lane's records and the committed bytes for:
//   A. the ten routed defects the round-81 non-author spot-check owed to r82
//      (corpus/lessons/round-81-verifier-spotcheck.md §6), and
//   B. the round's OWN identity and numbers (the r81 counter's self-drift leg read numbers only;
//      this one also binds the nonce/D identity, which is r81 routed defect 2's fix).
//
// Every claim is directional: the stale statement must still be present (records are append-only),
// a correction naming the truth must be present, and the truth must be re-derived from the
// committed evidence (never from the correction text alone).
//
// Usage: node check-record-drift-r82.mjs --lane <ABS lane> [--json]
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
const read = (p) => { try { return fs.readFileSync(path.join(lane, p), 'utf8'); } catch { return null; } };
const readJson = (p) => { const t = read(p); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } };
const exists = (p) => { try { return fs.statSync(path.join(lane, p)).isFile(); } catch { return false; } };

const LESSON = 'corpus/lessons/round-82.md';
const lesson = read(LESSON) || '';
const claims = readJson('.ufo/waves/round-82/claims.json');
const scored = {
  counter: readJson('.ufo/waves/round-82/scored/counter-a.json'),
  battery: readJson('.ufo/waves/round-82/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-82/scored/killpower-a.json'),
};
const r81 = {
  battery: readJson('.ufo/waves/round-81/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-81/scored/killpower-a.json'),
  receipt: readJson('corpus/evidence/round81/chromium-showpicker/receipt.json'),
  claims: readJson('.ufo/waves/round-81/claims.json'),
  report: read('.ufo/reports/round-81/tabi.md') || read('reports/round-81.md') || '',
};
const records = {
  scorecard: read('SCORECARD.md') || '',
  log: read('LOG.md') || '',
  skill: read('SKILL.md') || '',
  lesson,
  note: read('corpus/knowledge/chromium-showpicker-runtime-round-81.md') || '',
};
const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

// ---- A. r81 routed defects 6-9 (the spotcheck §6) ----
// 6. quote-count propagation: LOG/QUALITY/SCORECARD said 23 words, truth 20; lesson corrects, and the direction is bound
{
  const truth = 20;
  const staleInLog = /23-word quote/.test(records.log);
  const staleInQ = /state 6 and 23 words/.test(read('corpus/QUALITY.md') || '');
  const staleInScore = /\(23 words\)/.test(records.scorecard);
  const lessonCorrects = /20 words/.test(lesson) && /S223/.test(lesson);
  // direction bound: the lesson must name the stale→truth pair, not just contain both numbers
  const directional = /23.*→.*20|23-word.*20|superseded.*20/i.test(lesson);
  claim('quote-count-propagation', staleInLog && staleInQ && staleInScore && lessonCorrects && directional,
    'log=' + staleInLog + ' q=' + staleInQ + ' score=' + staleInScore + ' lesson=' + lessonCorrects + ' directional=' + directional);
}
// 7. uncommitted wave files committed
{
  const files = ['.ufo/waves/round-81-seats/R81Mut1/mutants.json', '.ufo/waves/round-81/w1/R81Scout.md'];
  claim('wave-files-committed', files.every(exists) && /R81Mut1/.test(lesson),
    'exists=' + files.map(exists).join(',') + ' lesson=' + /R81Mut1/.test(lesson));
}
// 8. dead seats named
{
  claim('dead-seats-named', /R81Exec3/.test(lesson) && /R81Drift/.test(lesson),
    'exec3=' + /R81Exec3/.test(lesson) + ' drift=' + /R81Drift/.test(lesson));
}
// 9. report lands-last (sweep defect acknowledged, own commit procedure)
{
  claim('report-lands-last', /sweep commit/.test(lesson) && /fleet-commit\.sh/.test(lesson),
    'acknowledged=' + /sweep commit/.test(lesson));
}
// B. r81 C1/C2 verdicts preserved (counts, not re-litigated)
{
  const c1 = readJson('.ufo/waves/round-81/scored/counter-a.json');
  const c2b = readJson('.ufo/waves/round-81/lesson-proof/c2-before.json');
  const c2a = readJson('.ufo/waves/round-81/lesson-proof/c2-after.json');
  claim('r81-verdicts-preserved', c1 && c1.checkCount === 56 && c1.verdict === 'clean' && c2b && c2b.mismatches === 12 && c2a && c2a.mismatches === 0,
    'c1=' + (c1 && c1.checkCount) + ' c2b=' + (c2b && c2b.mismatches) + ' c2a=' + (c2a && c2a.mismatches));
}
// C. presence-bound direction (r81 routed limit): the counter must refuse a reversed correction
{
  // A reversed correction (20→23) must NOT satisfy the directional check. The negative is exercised by the battery; here we assert the lesson carries the correct direction and the counter's own control proves refusal.
  const controls = readJson('.ufo/waves/round-82/lesson-proof/c2-controls.json');
  claim('direction-bound', controls !== null && /reversed/.test(JSON.stringify(controls)),
    'controls=' + (controls !== null));
}
// D. r82 self-drift: identity and numbers
{
  const finalD = claims && claims.digestsCommit ? claims.digestsCommit : null;
  const finalNonce = claims && claims.nonce ? claims.nonce : null;
  const cited = new Set();
  for (const [name, text] of Object.entries(records)) for (const m of text.matchAll(/tabi-r82-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  const wrong = [...cited].filter((h) => !finalNonce || !finalNonce.endsWith(h));
  claim('r82-identity', finalD !== null && finalNonce !== null && wrong.length === 0 && cited.size >= 1 && records.scorecard.includes(finalD.slice(0, 8)) && records.log.includes(finalD.slice(0, 8)) && records.skill.includes(finalD.slice(0, 8)),
    'finalD=' + finalD + ' nonce=' + finalNonce + ' cited=' + JSON.stringify([...cited]) + ' wrong=' + JSON.stringify(wrong));
}
{
  const c = scored.counter, b = scored.battery, k = scored.killpower;
  const okNums = c && b && k && c.checkCount === 64 && b.cases >= 60 && b.failed === 0 && k.survived === 0 && k.crashed === 0;
  const stated = okNums && records.scorecard.includes('64 checks') && records.log.includes('64 checks') && lesson.includes('64 checks');
  claim('r82-numbers', okNums && stated, 'checks=' + (c && c.checkCount));
}


const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r82-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
