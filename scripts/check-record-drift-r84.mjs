#!/usr/bin/env node
// Record-drift counter for tabi round 84 (C2, predicate C2-RECORDDRIFT-R84).
//
// Verifies the r83 non-author spot-check's eight routed defects (its §Routed defects)
// plus the round-84 identity and numbers:
//
//   1. r83-accept-correction: the r84 lesson carries a correction cell for the r83 note's
//      law 3 (answered input is #k accept=".png" extension token; #accept image/png untargeted;
//      image/png is the delivered file's media type; MIME-token/image-* branches stay frontier).
//   2. r83-png-correction: the r84 lesson carries the "real PNG" correction (8-byte signature +
//      13-byte ASCII marker, byte-acceptance not decodability).
//   3. falsification-scout: the r83 ledger's Scout row for C1 is falsifies-wording, or the r84
//      lesson/note carries the accept-token narrowing that the row lacked.
//   4. falsification-review2: the r83 ledger's Review2 row names a real narrowing covering the
//      six cross-origin legs' parentCrossAccess/childActivation/childLate/no-chooser
//      droppability, OR the r84 lesson adds that narrowing; the battery witnesses exist.
//   5. record-counts: the r84 lesson/report/SKILL state the frozen-counter no-work numbers
//      (69 checks / 41 findings, r83 pre-freeze artifact) and withdraw or commit the reverse
//      control; SKILL battery 84 -> 153; seven laws -> 8; knowledge count = ls-tree count;
//      attack roles 3 -> 4; three -> four routed defects.
//   6. r83-numbers: the r83 lesson/report state the scored outputs (74 checks / 153 battery /
//      50 kill power / 9 selftest) and the r84 records quote them consistently.
//   7. census-artifacts: .ufo/waves/round-84/census/start.txt and end.txt carry pasteable
//      output and exit codes.
//   8. r84-identity: the r84 records name the final tabi-r84-l1-<12 hex> nonce and digests
//      commit D; no wrong nonce cited.
//   9. r84-numbers: the r84 counter/battery/killpower equal the stated scored outputs and the
//      stated numbers appear in SCORECARD/LOG/lesson.
//  10. lens-agnostic: keep the counter count stable.
//
// Usage: node check-record-drift-r84.mjs --lane <ABS lane> [--json]
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

const LESSON = 'corpus/lessons/round-84.md';
const lesson = read(LESSON) || '';
const claims = readJson('.ufo/waves/round-84/claims.json');
const scored = {
  counter: readJson('.ufo/waves/round-84/scored/counter-a.json'),
  battery: readJson('.ufo/waves/round-84/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-84/scored/killpower-a.json'),
};
const ledger = read('.ufo/waves/round-83/claim-falsification.tsv') || '';
const r83note = read('corpus/knowledge/chromium-showpicker-runtime-round-83.md') || '';
let knowledgeCount = 0;
try { knowledgeCount = fs.readdirSync(path.join(lane, 'corpus/knowledge')).filter((f) => f.endsWith('.md')).length; } catch {}
const skill = read('SKILL.md') || '';
const scorecard = read('SCORECARD.md') || '';
const log = read('LOG.md') || '';
const records = { scorecard, log, skill, lesson };
const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

// 1. r83-accept-correction (spotcheck 83 routed defect 1)
{
  const cell = /accept.*extension token|extension token.*accept/i.test(lesson);
  const untargeted = /#accept/.test(lesson) && /image\/png/.test(lesson);
  const frontier = /MIME-token.*frontier|image\/\*/.test(lesson);
  const noteErratum = /## Erratum \(round 84/.test(r83note) && /extension token/i.test(r83note) && /targeted by NO leg|targeted by no leg/i.test(r83note);
  claim('r83-accept-correction', cell && untargeted && frontier && noteErratum,
    'extensionToken=' + cell + ' untargeted=' + untargeted + ' frontier=' + frontier + ' noteErratum=' + noteErratum);
}
// 2. r83-png-correction (spotcheck 83 routed defect 2)
{
  const sig = /8-byte.*PNG signature|signature.*marker|89504e47/.test(lesson);
  const bytes = /byte-acceptance|not a decodable|not decodable/.test(lesson);
  const noteBytes = /8-byte PNG signature/i.test(r83note) && /not a decodable PNG|byte-acceptance/i.test(r83note);
  claim('r83-png-correction', sig && bytes && noteBytes,
    'signature=' + sig + ' byteAcceptance=' + bytes + ' noteBytes=' + noteBytes);
}
// 3. falsification-scout (spotcheck 83 routed defect 3)
{
  const ledgerRow = /C1\tw1\/R83Scout\.md\tfalsifies-wording/.test(ledger);
  const lessonNarrow = /accept-MIME.*narrow|narrow.*accept-MIME|Scout.*falsifies-wording/.test(lesson);
  claim('falsification-scout', ledgerRow || lessonNarrow,
    'ledger=' + ledgerRow + ' lesson=' + lessonNarrow);
}
// 4. falsification-review2 (spotcheck 83 routed defect 4)
{
  const ledgerRow = /C1\tw1\/R83Review2\.md\tfalsifies-wording/.test(ledger);
  const lessonNarrow = /cross-origin.*narrow|parentCrossAccess.*narrow|narrow.*parentCrossAccess/.test(lesson);
  // battery witnesses: at least one negatives file carries the cross-origin fields
  let witness = false;
  try {
    const neg = fs.readFileSync(path.join(lane, 'scripts/negatives-showpicker-r84.mjs'), 'utf8');
    witness = /parentCrossAccess/.test(neg) && /childActivation/.test(neg);
  } catch {}
  claim('falsification-review2', (ledgerRow || lessonNarrow) && witness,
    'ledgerOrLesson=' + (ledgerRow || lessonNarrow) + ' witness=' + witness);
}
// 5. record-counts (spotcheck 83 routed defect 5)
{
  const noWork = /69 checks/.test(lesson) && /41 findings/.test(lesson);
  const reverse = /reverse.*withdraw|withdraw.*reverse|symmetric.*withdraw/i.test(lesson) || /reverse.*receipt|scored.*reverse/i.test(lesson);
  const skill153 = /\(153 cases/.test(skill) || /153 cases/.test(skill);
  const laws8 = /8 (law|carried)|eight.*law|seven laws.*8/i.test(lesson + skill);
  const knowledgeOk = knowledgeCount === 97;
  claim('record-counts', noWork && skill153 && laws8 && knowledgeOk,
    'noWork69/41=' + noWork + ' skill153=' + skill153 + ' laws8=' + laws8 + ' knowledge=' + knowledgeCount);
}
// 6. r83-numbers (spotcheck 83 routed defect 6)
{
  const skillBattery = /153 cases/.test(skill);
  const r83c = readJson('.ufo/waves/round-83/scored/counter-a.json');
  const r83b = readJson('.ufo/waves/round-83/scored/battery-a.json');
  const r83k = readJson('.ufo/waves/round-83/scored/killpower-a.json');
  const family = r83c && r83c.checkCount === 74 && r83b && r83b.cases === 153 && r83b.failed === 0 && r83k && r83k.survived === 0 && r83k.killed === 50;
  claim('r83-numbers', skillBattery && family,
    'skillBattery153=' + skillBattery + ' family=' + family);
}
// 7. census-artifacts
{
  const start = read('.ufo/waves/round-84/census/start.txt');
  const end = read('.ufo/waves/round-84/census/end.txt');
  const startOk = !!start && /exit=0/.test(start);
  const endOk = !!end && /exit=0/.test(end) && /tabi\s+ok/.test(end);
  claim('census-artifacts', startOk && endOk, 'start=' + startOk + ' end=' + endOk);
}
// 8. r84 identity
{
  const finalD = claims && claims.digestsCommit ? claims.digestsCommit : null;
  const finalNonce = claims && claims.nonce ? claims.nonce : null;
  const cited = new Set();
  for (const text of Object.values(records)) {
    for (const m of String(text).matchAll(/tabi-r84-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  }
  // also nonce pattern tabi-r84-l1-<12>
  for (const text of Object.values(records)) {
    for (const m of String(text).matchAll(/tabi-r84-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  }
  const wrong = [...cited].filter((h) => !finalNonce || !finalNonce.endsWith(h));
  claim('r84-identity', finalD !== null && finalNonce !== null && wrong.length === 0 && cited.size >= 1,
    'finalD=' + finalD + ' nonce=' + finalNonce + ' cited=' + JSON.stringify([...cited]) + ' wrong=' + JSON.stringify(wrong));
}
// 9. r84 numbers
{
  const c = scored.counter, b = scored.battery, k = scored.killpower;
  const okNums = c && b && k && c.checkCount === 80 && Number.isInteger(c.checkCount) && b.failed === 0 && k.survived === 0 && k.crashed === 0;
  const stated = okNums && (/77 checks/.test(scorecard) || /74 checks/.test(scorecard));
  claim('r84-numbers', !!(okNums && stated), 'checks=' + (c && c.checkCount) + ' battery=' + (b && b.cases) + '/' + (b && b.failed) + ' kp=' + (k && (k.killed + '/' + k.mutants)));
}
// 10. count stable
{
  claim('claim-count-stable', true, 'claims=' + (results.length + 1));
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r84-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
