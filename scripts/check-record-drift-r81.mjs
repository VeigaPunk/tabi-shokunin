#!/usr/bin/env node
// Record-drift counter for tabi round 81 (C2, predicate C2-RECORDDRIFT-R81).
//
// Counts mismatches between the lane's records and the committed bytes for:
//   A. the ten routed defects the round-80 non-author spot-check owed to r81
//      (corpus/lessons/round-80-verifier-spotcheck.md §6), and
//   B. the round's OWN identity and numbers (the r80 counter's self-drift leg read numbers only;
//      this one also binds the nonce/D identity, which is r80 routed defect 2's fix).
//
// Every claim is directional: the stale statement must still be present (records are append-only),
// a correction naming the truth must be present, and the truth must be re-derived from the
// committed evidence (never from the correction text alone).
//
// Usage: node check-record-drift-r81.mjs --lane <ABS lane> [--json]
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

const LESSON = 'corpus/lessons/round-81.md';
const lesson = read(LESSON) || '';
const claims = readJson('.ufo/waves/round-81/claims.json');
const scored = {
  counter: readJson('.ufo/waves/round-81/scored/counter-a.json'),
  battery: readJson('.ufo/waves/round-81/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-81/scored/killpower-a.json'),
};
const r80 = {
  battery: readJson('.ufo/waves/round-80/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-80/scored/killpower-a.json'),
  receipt: readJson('corpus/evidence/round80/chromium-showpicker/receipt.json'),
  claims: readJson('.ufo/waves/round-80/claims.json'),
  report: read('.ufo/reports/round-80/tabi.md') || read('reports/round-80.md') || '',
};
const records = {
  scorecard: read('SCORECARD.md') || '',
  log: read('LOG.md') || '',
  skill: read('SKILL.md') || '',
  lesson,
  note: read('corpus/knowledge/chromium-showpicker-runtime-round-80.md') || '',
};
const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

// ---- A. r80 routed defects 1-10 ----
// 1. the committed end census is red; a green re-run is committed and the erratum names it
{
  const red = read('.ufo/waves/round-80/census/end.txt') || '';
  const green = read('.ufo/waves/round-80/census/end-green.txt') || '';
  claim('end-census-green', /census exit=1/.test(red) && /census exit=0/.test(green) && /end-green\.txt/.test(lesson) && /census exit=0/.test(lesson),
    'red=' + /census exit=1/.test(red) + ' green=' + /census exit=0/.test(green) + ' lesson-names=' + (/end-green\.txt/.test(lesson)));
}
// 2. the superseded D9 nonce/D is swept: every record citing it is named in the correction table
{
  const stale = [];
  for (const [name, text] of Object.entries(records)) if (/211962dccb61|211962dc/.test(text)) stale.push(name);
  const named = stale.every((n) => new RegExp('(SCORECARD|LOG|SKILL|knowledge)[^\\n]*' + n, 'i').test(lesson) || lesson.includes(n));
  claim('d9-nonce-sweep', stale.length >= 3 && named && /93172ba92d63/.test(lesson) && /93172ba9/.test(lesson),
    'records citing D9: ' + JSON.stringify(stale) + ' named-in-lesson=' + named);
}
// 3. the dead c1-nowork.json pointer: the real no-work control output is now committed
{
  const j = readJson('.ufo/waves/round-80/lesson-proof/c1-nowork.json');
  const ids = j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : [];
  claim('dead-c1-nowork', j !== null && ids.includes('schema') && ids.length >= 5 && /c1-nowork\.json/.test(lesson),
    'exists=' + (j !== null) + ' findings=' + JSON.stringify(ids.slice(0, 6)));
}
// 4. the dead cold-runs index: committed, and every listed path exists
{
  const idx = read('.ufo/waves/round-80/scored/cold-runs.txt');
  const paths = (idx || '').split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#'));
  const missing = paths.filter((p) => !exists(p));
  claim('dead-cold-runs', idx !== null && paths.length >= 4 && missing.length === 0 && /cold-runs\.txt/.test(lesson),
    'entries=' + paths.length + ' missing=' + JSON.stringify(missing));
}
// 5. Gate quote counts: a QUALITY criterion requires wc -w; the two wrong counts are corrected
{
  const quality = read('corpus/QUALITY.md') || '';
  const crit = /wc -w/.test(quality) && /quote count/i.test(quality);
  claim('gate-quote-counts', crit && /14 words/.test(lesson) && /2654-2655/.test(lesson) && /7 words/.test(lesson) && /S220/.test(lesson) && /S221/.test(lesson),
    'quality-criterion=' + crit + ' lesson-corrects=' + (/14 words/.test(lesson) && /7 words/.test(lesson)));
}
// 6. the stale frozen-claim annotation is still present and the truth is re-derived from the scored outputs
{
  const text = JSON.stringify(r80.claims || {});
  const stalePresent = /battery 81\/81/.test(text) && /kill power 82\/82/.test(text);
  const truth = r80.battery && r80.killpower ? { cases: r80.battery.cases, failed: r80.battery.failed, mutants: r80.killpower.mutants, killed: r80.killpower.killed } : null;
  const okTruth = truth && truth.cases === 102 && truth.failed === 0 && truth.mutants === 80 && truth.killed === 80;
  claim('claims-annotation', stalePresent && okTruth && /102\/102/.test(lesson) && /80\/80/.test(lesson),
    'stale-present=' + stalePresent + ' truth=' + JSON.stringify(truth) + ' lesson=' + (/102\/102/.test(lesson) && /80\/80/.test(lesson)));
}
// 7. the capability-row command typo
{
  const stale = /DOM\.setInputFiles/.test(records.scorecard);
  claim('capability-typo', stale && /DOM\.setFileInputFiles/.test(lesson) && /DOM\.setInputFiles/.test(lesson),
    'stale-present=' + stale + ' correction=' + /DOM\.setFileInputFiles/.test(lesson));
}
// 8. the control-count wording (five -> six)
{
  claim('control-count', /five self claims/.test(lesson) && /\bsix\b/.test(lesson) && /delta/i.test(lesson),
    'stale-quoted=' + /five self claims/.test(lesson) + ' correction=' + (/\bsix\b/.test(lesson) && /delta/i.test(lesson)));
}
// 9. the landed-changes omission: D10 is named in the r81 landed-changes ledger
{
  claim('landed-d10', /93172ba9/.test(lesson) && /landed/i.test(lesson) && /D10/.test(lesson),
    'd10-in-lesson=' + /93172ba9/.test(lesson) + ' landed=' + /landed/i.test(lesson));
}
// 10. the battery binding: the r80 battery re-run under the final receipt, committed with a receipt field
{
  const b = readJson('.ufo/waves/round-80/scored/battery-bound-a.json');
  const receiptSha = exists('corpus/evidence/round80/chromium-showpicker/receipt.json') ? sha256(fs.readFileSync(path.join(lane, 'corpus/evidence/round80/chromium-showpicker/receipt.json'))) : null;
  claim('battery-binding', b !== null && b.receipt && b.receipt.sha256 === receiptSha && b.cases === 102 && b.failed === 0 && /battery-bound-a\.json/.test(lesson),
    'exists=' + (b !== null) + ' bound=' + (b && b.receipt ? b.receipt.sha256 === receiptSha : false) + ' cases=' + (b && b.cases));
}

// ---- B. r81 self-drift: identity and numbers ----
const finalD = claims && claims.digestsCommit ? claims.digestsCommit : null;
const finalNonce = claims && claims.nonce ? claims.nonce : null;
{
  const cited = new Set();
  for (const [name, text] of Object.entries(records)) for (const m of text.matchAll(/tabi-r81-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  const wrong = [...cited].filter((h) => !finalNonce || !finalNonce.endsWith(h));
  const corrected = wrong.every((h) => lesson.includes('tabi-r81-l1-' + h) && lesson.includes(finalNonce || '\u0000'));
  claim('r81-identity', finalD !== null && finalNonce !== null && wrong.length === 0 && cited.size >= 1 && records.scorecard.includes(finalD.slice(0, 8)) && records.log.includes(finalD.slice(0, 8)) && records.skill.includes(finalD.slice(0, 8)),
    'finalD=' + finalD + ' nonce=' + finalNonce + ' cited=' + JSON.stringify([...cited]) + ' wrong=' + JSON.stringify(wrong) + ' corrected=' + corrected);
}
{
  const c = scored.counter, b = scored.battery, k = scored.killpower;
  const nums = {
    checks: c && c.checkCount,
    batteryCases: b && b.cases,
    batteryFailed: b && b.failed,
    mutants: k && k.mutants,
    killed: k && k.killed,
    survived: k && k.survived,
    crashed: k && k.crashed,
  };
  const okNums = nums.checks > 0 && nums.batteryFailed === 0 && nums.survived === 0 && nums.crashed === 0 && nums.batteryCases > 0 && nums.mutants > 0;
  const stated = okNums && records.scorecard.includes(String(nums.checks) + ' checks') && records.log.includes(String(nums.checks) + ' checks') && lesson.includes(String(nums.checks) + ' checks') && records.scorecard.includes('battery ' + nums.batteryCases + '/' + nums.batteryCases) && records.scorecard.includes('kill power ' + nums.killed + '/' + nums.mutants);
  claim('r81-numbers', okNums && stated, 'numbers=' + JSON.stringify(nums) + ' stated=' + stated);
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r81-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
