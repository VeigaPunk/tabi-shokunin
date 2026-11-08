#!/usr/bin/env node
// Record-drift counter for tabi round 87 (instrument, predicate C2-RECORDDRIFT-R87).
//
// Counts, over a fixed set of statements, where the lane's self-assessment records
// (SKILL.md, plans/, corpus/lessons/, corpus/SOURCES.md, corpus/QUALITY.md) disagree with the
// observed repo state. The five statements are exactly the lane-owned routed defects of the
// round-86 non-author spot-check (`corpus/lessons/round-86-verifier-spotcheck.md` §6):
//
//   1. accept-headline (defect 3): the `accept` narrowing swept every distilled copy —
//      SKILL.md and plans/round-86.md no longer say "never a validator"/"never a programmatic
//      answer"; both carry the programmatic-answer scope, and QUALITY.md carries the class
//      criterion (161).
//   2. mistake-evidence (defect 4): the lesson's two Mistakes rows no longer cite a run that is
//      not in the committed bytes; the pointer resolves to a committed note that states what is
//      retained, and the final runner's before=3 remains the fail-able proof.
//   3. sources-searchlog (defect 5): corpus/SOURCES.md `## Search log` carries the round-86
//      bounded re-opening with its identified/screened/included/excluded counts and date.
//   4. ledger-pointer (defect 7): the round-86 ledger's `falsifies-wording` Scribe row names
//      plans/round-86.md §Narrowings, and that section carries the headline narrowing item.
//   5. report-corrections (defects 1-2): the round-87 lesson records the round-86 report's
//      39→40 control count and S221/S222 carried-not-reopened wording.
//
// Usage: node check-record-drift-r87.mjs --lane <ABS lane> [--json]
// Exit 0: mismatches 0. 1: mismatches. 2: usage.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
const read = (rel) => { try { return fs.readFileSync(path.join(lane, rel), 'utf8'); } catch { return null; } };
const readJson = (rel) => { const t = read(rel); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } };

const skill = read('SKILL.md') || '';
const plan86 = read('plans/round-86.md') || '';
const lesson86 = read('corpus/lessons/round-86.md') || '';
const lesson87 = read('corpus/lessons/round-87.md') || '';
const sources = read('corpus/SOURCES.md') || '';
const quality = read('corpus/QUALITY.md') || '';
const ledger = read('.ufo/waves/round-86/claim-falsification.tsv') || '';
const proofNote = read('.ufo/waves/round-86/lesson-proof/README.md');
const witness = readJson('.ufo/waves/round-86/scored/witness-a.json');

const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

// 1. the accept-headline narrowing swept every distilled copy
{
  const stale = /never a validator|filters the dialog, never a programmatic answer/i;
  const wording = /not a validator on a programmatic answer/i;
  const skillOk = !stale.test(skill) && wording.test(skill);
  const planOk = !stale.test(plan86) && wording.test(plan86);
  const criterion = /^161\.\s/m.test(quality) && /narrowing|sweep/i.test((quality.match(/^161\.[\s\S]*?(?=\n\d+\.|\n##|$)/m) || [''])[0]);
  claim('accept-headline', skillOk && planOk && criterion, 'skill=' + skillOk + ' plan86=' + planOk + ' quality161=' + criterion);
}
// 2. the Mistakes evidence pointer resolves to committed bytes
{
  const rows = lesson86.split('\n').filter((l) => /witness-polarity|guard-inversion/.test(l));
  const stalePointer = rows.some((l) => /witness-a\.json.*first two runs/i.test(l));
  const repointed = rows.length === 2 && rows.every((l) => /lesson-proof\/README\.md/.test(l));
  const noteOk = !!proofNote && /not retained/i.test(proofNote) && /before/i.test(proofNote) && /3/.test(proofNote);
  const before = witness && witness.before && Array.isArray(witness.before.survivors) ? witness.before.survivors.length : null;
  claim('mistake-evidence', rows.length === 2 && !stalePointer && repointed && noteOk && before === 3, 'rows=' + rows.length + ' stalePointer=' + stalePointer + ' repointed=' + repointed + ' note=' + noteOk + ' beforeSurvivors=' + before);
}
// 3. the round-86 search-log entry
{
  const log = sources.slice(Math.max(0, sources.indexOf('## Search log')));
  const ok = /round-86/.test(log) && /identified 2/.test(log) && /screened 2/.test(log) && /included 0/.test(log) && /excluded 2/.test(log) && /2026-11-08/.test(log);
  claim('sources-searchlog', ok, 'round86-entry=' + ok);
}
// 4. the ledger pointer resolves inside plans/round-86.md §Narrowings
{
  const scribeRow = ledger.split('\n').find((l) => /Scribe/i.test(l) && /accept/i.test(l));
  const pointer = scribeRow ? /plans\/round-86\.md §Narrowings item 9/i.test(scribeRow) : false;
  const section = (plan86.match(/## Narrowings[\s\S]*?(?=\n## |\n# |$)/) || [''])[0];
  const item = /accept.headline|accept headline/i.test(section);
  claim('ledger-pointer', !!scribeRow && pointer && item, 'scribeRow=' + !!scribeRow + ' pointer=' + pointer + ' ledgerItem=' + item);
}
// 5. the round-86 report corrections are recorded
{
  const count = /says "39 findings"[^.]{0,120}committed control has\s+\*\*40\*\*/i.test(lesson87);
  const sourcesFix = /S221\/S222/.test(lesson87) && /carried|not re-opened/i.test(lesson87);
  claim('report-corrections', count && sourcesFix, 'count=' + count + ' sources=' + sourcesFix);
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r87-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
