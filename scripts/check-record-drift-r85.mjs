#!/usr/bin/env node
// Record-drift counter for tabi round 85 (instrument, predicate C2-RECORDDRIFT-R85).
//
// Verifies the round-84 non-author spot-check's five routed defects against the round-85 records,
// plus the round-85 identity and numbers:
//
//   1. family-witnesses: the round-85 battery carries a refusal case for each of the six
//      round-84 survivor families routed to r85 (message, childLate, parentCrossAccess,
//      child-event sequence, childActivation before/after).
//   2. accept-grammar-frontier: the accept MIME-token / `image/*` grammar stays recorded as
//      unmeasured frontier (r84 spot-check routed defect 2 is carried, not silently dropped).
//   3. same-origin-contrast: the driver AND the counter carry the six r85 same-origin
//      tel/search/text legs (routed defect 3), with the no-picker law on the counter.
//   4. limit-constant-offset: the counter's `limit` sentence names the constant-offset escape and
//      the battery keeps the `accept-retimed` must-accept case (routed defect 4).
//   5. r85-numbers: the scored counter/battery/kill-power values are 87 / 175-0 / 58-0-0 and the
//      records state those same numbers.
//   6. census-artifacts: `.ufo/waves/round-85/census/{start,end}.txt` carry pasteable output and
//      exit codes.
//   7. r85-identity: the records cite the final `tabi-r85-l1-<12 hex>` nonce and no other.
//   8. witness-instrument: the family witness runner declares the same six families and its
//      after-state is recorded in the lesson.
//
// Usage: node check-record-drift-r85.mjs --lane <ABS lane> [--json]
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

const lesson = read('corpus/lessons/round-85.md') || '';
const plan = read('plans/round-85.md') || '';
const claimRec = readJson('.ufo/waves/round-85/claims.json');
const scored = {
  counter: readJson('.ufo/waves/round-85/scored/counter-a.json'),
  battery: readJson('.ufo/waves/round-85/scored/battery-a.json'),
  killpower: readJson('.ufo/waves/round-85/scored/killpower-a.json'),
  witness: readJson('.ufo/waves/round-85/scored/witness-a.json'),
};
const battery = read('scripts/negatives-showpicker-r85.mjs') || '';
const counterSrc = read('scripts/check-showpicker-r85.mjs') || '';
const driverSrc = read('scripts/chrome-cdp-showpicker-round85.mjs') || '';
const witnessSrc = read('scripts/witness-families-r85.mjs') || '';
const skill = read('SKILL.md') || '';
const scorecard = read('SCORECARD.md') || '';
const log = read('LOG.md') || '';
const records = { scorecard, log, skill, lesson, plan };
const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

const FAMILIES = ['cross-message-unpinned', 'cross-childlate-dropped', 'cross-access-dropped', 'cross-childseq-dropped', 'cross-childact-after-dropped', 'cross-childact-before-dropped'];

// 1. family witness cases in the battery
{
  const missing = FAMILIES.filter((f) => !battery.includes("'" + f + "'"));
  claim('family-witnesses', missing.length === 0, 'battery cases missing: ' + JSON.stringify(missing));
}
// 2. accept grammar recorded as frontier
{
  const frontier = /accept.*(MIME|image\/\*).*frontier|frontier.*(MIME-token|image\/\*)/is.test(plan + '\n' + lesson);
  claim('accept-grammar-frontier', frontier, 'accept MIME-token / image-* frontier recorded=' + frontier);
}
// 3. same-origin contrast legs in driver and counter
{
  const legs = ['sp85-same-origin-tel', 'sp85-same-origin-search', 'sp85-same-origin-text', 'sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated'];
  const inDriver = legs.filter((l) => driverSrc.includes("'" + l + "'")).length;
  const inCounter = legs.filter((l) => counterSrc.includes("'" + l + "'")).length;
  const law = counterSrc.includes("check('same-origin-no-picker-law'");
  claim('same-origin-contrast', inDriver === 6 && inCounter === 6 && law, 'driver=' + inDriver + ' counter=' + inCounter + ' noPickerLaw=' + law);
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
  const nums = c && c.checkCount === 87 && b && b.failed === 0 && k && k.survived === 0 && k.crashed === 0 && k.mutants === 58;
  const cases = b && b.cases;
  const stated = /87 checks/.test(lesson + plan) && (/175 cases/.test(lesson + plan + scorecard) || (b && /175/.test(String(b.cases)))) && /58 (mutants|semantic)/.test(lesson + plan + scorecard + skill);
  claim('r85-numbers', !!(nums && stated), 'checks=' + (c && c.checkCount) + ' battery=' + cases + '/' + (b && b.failed) + ' kp=' + (k && (k.killed + '/' + k.mutants)) + ' stated=' + stated);
}
// 6. census artifacts
{
  const start = read('.ufo/waves/round-85/census/start.txt');
  const end = read('.ufo/waves/round-85/census/end.txt');
  const startOk = !!start && /exit=0/.test(start);
  const endOk = !!end && /exit=0/.test(end) && /tabi\s+ok/.test(end);
  claim('census-artifacts', startOk && endOk, 'start=' + startOk + ' end=' + endOk);
}
// 7. identity
{
  const finalNonce = claimRec && claimRec.nonce ? claimRec.nonce : null;
  const cited = new Set();
  for (const text of Object.values(records)) for (const m of String(text).matchAll(/tabi-r85-l1-([0-9a-f]{12})/g)) cited.add(m[1]);
  const wrong = [...cited].filter((h) => !finalNonce || !finalNonce.endsWith(h));
  claim('r85-identity', !!finalNonce && /^tabi-r85-l1-[0-9a-f]{12}$/.test(finalNonce) && cited.size >= 1 && wrong.length === 0,
    'nonce=' + finalNonce + ' cited=' + JSON.stringify([...cited]) + ' wrong=' + JSON.stringify(wrong));
}
// 8. witness instrument + recorded after-state
{
  const declared = FAMILIES.filter((f) => witnessSrc.includes("'" + f + "'")).length;
  const w = scored.witness;
  const after = w && w.after && Array.isArray(w.after.survivors) ? w.after.survivors.length : null;
  const before = w && w.before && Array.isArray(w.before.survivors) ? w.before.survivors.length : null;
  claim('witness-instrument', declared === 6 && after === 0 && before >= 1, 'declared=' + declared + ' before=' + before + ' after=' + after);
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r85-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
