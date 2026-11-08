#!/usr/bin/env node
// Record-drift counter for tabi round 86 (instrument, predicate C2-RECORDDRIFT-R86).
//
// Verifies the round-85 non-author spot-check's routed defects against the round-86 records,
// plus the round-86 identity and numbers:
//
//   1. family-witnesses: the round-86 battery carries a refusal case for each of the six
//      cross-origin law conjuncts on the TEL leg (the r85 set) AND on the SEARCH and TEXT legs
//      (r85 spot-check routed defect 3, the tel-only witness gap) — 18 cases.
//   2. accept-grammar-measured: the three accept token forms (wildcard, mixed list, non-matching
//      MIME token) are carried by the driver's fixture and the counter's law table, and the note
//      states the limit (an acceptance law, not a dialog-filter law).
//   3. same-origin-contrast: the driver AND the counter carry the six r85 same-origin
//      tel/search/text legs plus the r86 same-origin colour arm, with their laws on the counter.
//   4. limit-constant-offset: the counter's `limit` sentence names the constant-offset escape and
//      the battery keeps the `accept-retimed` must-accept case.
//   5. r86-numbers: the scored counter/battery/kill-power numbers are the ones the records state
//      (checkCount 95 stated; battery case count and mutant count cross-checked against the
//      scored JSONs).
//   6. census-artifacts: `.ufo/waves/round-86/census/{start,end}.txt` carry pasteable output and
//      exit codes.
//   7. r86-identity: the records cite the final `tabi-r86-l1-<12 hex>` nonce and no other.
//   8. witness-instrument: the family witness runner declares the twelve families (six r85
//      controls plus six tel-only conjunct narrowings) and its after-state is recorded.
//
// Usage: node check-record-drift-r86.mjs --lane <ABS lane> [--json]
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

const lesson = read('corpus/lessons/round-86.md') || '';
const plan = read('plans/round-86.md') || '';
const claimRec = readJson('.ufo/waves/round-86/claims.json');
const scored = {
  counter: readJson('.ufo/waves/round-86/scored/counter-a.json'),
  battery: readJson('.ufo/waves/round-86/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-86/scored/killpower-a.json'),
  witness: readJson('.ufo/waves/round-86/scored/witness-a.json'),
};
const battery = read('scripts/negatives-showpicker-r86.mjs') || '';
const counterSrc = read('scripts/check-showpicker-r86.mjs') || '';
const driverSrc = read('scripts/chrome-cdp-showpicker-round86.mjs') || '';
const witnessSrc = read('scripts/witness-families-r86.mjs') || '';
const skill = read('SKILL.md') || '';
const scorecard = read('SCORECARD.md') || '';
const log = read('LOG.md') || '';
const records = { scorecard, log, skill, lesson, plan };
const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

const FAMILIES = ['cross-message-unpinned', 'cross-childlate-dropped', 'cross-access-dropped', 'cross-childseq-dropped', 'cross-childact-after-dropped', 'cross-childact-before-dropped',
  'narrow-tel-message', 'narrow-tel-childlate', 'narrow-tel-crossaccess', 'narrow-tel-childseq', 'narrow-tel-childact-after', 'narrow-tel-childact-before'];
// family -> the battery case that must refuse that weakening (the six conjuncts are witnessed on
// the tel leg by the r85 set and on the search/text legs by the r86 set)
const FAMILY_CASES = {
  'cross-message-unpinned': 'cross-tel-message-unpinned',
  'cross-childlate-dropped': 'cross-tel-childlate',
  'cross-access-dropped': 'cross-tel-crossaccess',
  'cross-childseq-dropped': 'cross-tel-childseq',
  'cross-childact-after-dropped': 'cross-tel-childact-after',
  'cross-childact-before-dropped': 'cross-tel-childact-before',
};
const LEG_FAMILIES = ['message-unpinned', 'childlate-dropped', 'crossaccess-dropped', 'childseq-dropped', 'childact-after-dropped', 'childact-before-dropped'];

// 1. family witness cases in the battery: 6 conjuncts x 3 legs
{
  const missing = Object.values(FAMILY_CASES).filter((c) => !battery.includes("'" + c + "'"));
  // the r86 conjunct witnesses are generated from FAMILY_MUT x ['search','text']; the generator
  // source and the scored battery's size+coverage are the checkable artifacts
  const gen = battery.includes('const FAMILY_MUT = {') && battery.includes("for (const legName of ['search', 'text'])") && LEG_FAMILIES.every((f) => battery.includes("'" + f + "':"));
  const sc = scored.battery;
  const size = sc && sc.cases >= 195 && sc.failed === 0 && sc.coverage && sc.coverage.declared === 95 && sc.coverage.covered === 95 && Array.isArray(sc.coverage.uncovered) && sc.coverage.uncovered.length === 0;
  claim('family-witnesses', missing.length === 0 && gen && size, 'tel cases missing: ' + JSON.stringify(missing) + ' r86 generator=' + gen + ' scoredBattery=' + JSON.stringify(sc ? { cases: sc.cases, failed: sc.failed, coverage: sc.coverage } : null));
}
// 2. accept grammar measured (three token forms), with its limit stated
{
  const forms = ['accept="image/*"', 'accept="image/png, .txt"', 'accept="application/pdf"'].every((t) => driverSrc.includes(t));
  const law = counterSrc.includes("check('accept-grammar-law'");
  const limit = /never a programmatic answer|not enforced on a programmatic answer/i.test(plan + '\n' + lesson);
  claim('accept-grammar-measured', forms && law && limit, 'tokenForms=' + forms + ' law=' + law + ' limitStated=' + limit);
}
// 3. same-origin contrast legs in driver and counter
{
  const legs = ['sp85-same-origin-tel', 'sp85-same-origin-search', 'sp85-same-origin-text', 'sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated', 'sp86-same-origin-color-activated'];
  const inDriver = legs.filter((l) => driverSrc.includes("'" + l + "'")).length;
  const inCounter = legs.filter((l) => counterSrc.includes("'" + l + "'")).length;
  const law = counterSrc.includes("check('same-origin-no-picker-law'") && counterSrc.includes("check('same-origin-color-law'");
  claim('same-origin-contrast', inDriver === 7 && inCounter === 7 && law, 'driver=' + inDriver + ' counter=' + inCounter + ' laws=' + law);
}
// 4. limit sentence + retimed must-accept case
{
  const sentence = /constant offset escapes this rule|shifts EVERY event by a constant offset/i.test(counterSrc);
  const retimed = battery.includes("accept('accept-retimed'");
  claim('limit-constant-offset', sentence && retimed, 'limitSentence=' + sentence + ' acceptRetimed=' + retimed);
}
// 5. numbers
{
  const c = scored.counter, b = scored.battery, k = scored.killpower;
  const nums = c && c.checkCount === 95 && b && b.failed === 0 && k && k.survived === 0 && k.crashed === 0;
  const cases = b && b.cases, muts = k && k.mutants;
  const txt = lesson + plan + scorecard + log + skill;
  const stated = /95 checks/.test(txt) && new RegExp('\\b' + cases + ' cases').test(txt) && new RegExp('\\b' + muts + ' mutants').test(txt);
  claim('r86-numbers', !!(nums && stated), 'checks=' + (c && c.checkCount) + ' battery=' + cases + '/' + (b && b.failed) + ' kp=' + (k && (k.killed + '/' + k.mutants)) + ' stated=' + stated);
}
// 6. census artifacts
{
  const start = read('.ufo/waves/round-86/census/start.txt');
  const end = read('.ufo/waves/round-86/census/end.txt');
  const startOk = !!start && /exit=0/.test(start);
  const endOk = !!end && /exit=0/.test(end) && /tabi\s+ok/.test(end);
  claim('census-artifacts', startOk && endOk, 'start=' + startOk + ' end=' + endOk);
}
// 7. identity
{
  const finalNonce = claimRec && claimRec.nonce ? claimRec.nonce : null;
  const cited = new Set();
  for (const text of Object.values(records)) for (const m of String(text).matchAll(/tabi-r86-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  const wrong = [...cited].filter((h) => !finalNonce || !finalNonce.endsWith(h));
  claim('r86-identity', !!finalNonce && /^tabi-r86-l1-[0-9a-f]{12}$/.test(finalNonce) && cited.size >= 1 && wrong.length === 0,
    'nonce=' + finalNonce + ' cited=' + JSON.stringify([...cited]) + ' wrong=' + JSON.stringify(wrong));
}
// 8. witness instrument + recorded after-state
{
  const declared = FAMILIES.filter((f) => witnessSrc.includes("'" + f + "'")).length;
  const w = scored.witness;
  const after = w && w.after && Array.isArray(w.after.survivors) ? w.after.survivors.length : null;
  const before = w && w.before && Array.isArray(w.before.survivors) ? w.before.survivors.length : null;
  const narrowings = ['narrow-tel-message', 'narrow-tel-childlate', 'narrow-tel-crossaccess', 'narrow-tel-childseq', 'narrow-tel-childact-after', 'narrow-tel-childact-before'].every((n) => witnessSrc.includes("'" + n + "'"));
  claim('witness-instrument', declared === 12 && narrowings && after === 0 && before === 3, 'declared=' + declared + ' narrowings=' + narrowings + ' before=' + before + ' after=' + after);
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r86-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
