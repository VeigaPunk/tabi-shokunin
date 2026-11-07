#!/usr/bin/env node
// Record-drift counter (tabi round 79, C2, predicate C2-RECORDDRIFT-R79).
//
// Counts mismatches between the lane's SELF-ASSESSMENT records and the committed bytes they
// describe. The round-78 non-author spot-check routed six record drifts (`round-78-verifier-spotcheck.md`
// §6 item 1-2, item 6); this instrument states each one as a claim and checks three things:
//   (a) the stale statement is STILL PRESENT — records are append-only, a correction never rewrites;
//   (b) a correction entry NAMES the stale statement and states the corrected value;
//   (c) the corrected value EQUALS the committed truth (re-derived here from the bytes, never read
//       from the correction itself).
// A claim with any of (a)-(c) false is one mismatch. Exit 0 iff mismatches == 0.
//
// Usage: node check-record-drift-r79.mjs --lane <ABS lane> [--json]
// Exit 0: mismatches 0. 1: mismatches > 0 (each printed with its claim id). 2: usage/unreadable.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
// The filed round report lives on the fleet repo (the lane's parent), never in the lane repo.
const fleetReport = opt('fleet-report') || path.join(path.dirname(lane), '.ufo/reports/round-78/tabi.md');
const read = (p) => { try { return fs.readFileSync(path.join(lane, p), 'utf8'); } catch (e) { return null; } };
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(path.join(lane, p), 'utf8')); } catch { return null; } };

const claims = [];
const add = (id, fn) => claims.push({ id, fn });
const has = (text, needle) => typeof text === 'string' && text.includes(needle);
// a correction is DIRECTIONAL: it states "<stale> → <corrected>" as one pair. A reversed or
// reordered statement does not satisfy it (round-79 wave, R79Critic H1).
const pair = (text, stale, truth) => has(text, stale + ' → ' + truth);

// ---- committed truth (re-derived from the bytes) ----
const r78receipt = readJson('corpus/evidence/round78/chromium-file-chooser/receipt.json');
const r78battery = readJson('.ufo/waves/round-78/scored/c1-negatives-a.json');
const r78batterySrc = read('scripts/negatives-filechooser-r78.mjs') || '';
const r78lesson = read('corpus/lessons/round-78.md') || '';
const r78cold = read('.ufo/waves/round-78/scored/cold-runs.txt') || '';
const r78idpin = readJson('.ufo/waves/round-78/lesson-proof/driver-shape-id-pin.json');
const truth = {
  scoredNonce: r78receipt && r78receipt.nonce,
  batteryCases: r78battery && r78battery.cases,
  witnessCases: (r78batterySrc.match(/"witness-/g) || []).length,
  mistakesRows: (r78lesson.match(/^\| `/gm) || []).length,
  scoredNode: r78receipt && Array.isArray(r78receipt.legs) ? (r78receipt.legs.find((l) => l.name === 'pick-multiple') || {}).openedNode : null,
  cold1Node: r78idpin && r78idpin.per_leg_diff && Array.isArray(r78idpin.per_leg_diff.got) ? r78idpin.per_leg_diff.got[0][1] : null,
  coldPathsInSeats: r78cold.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).every((l) => l.includes('round-78-seats')),
  coldLines: r78cold.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length,
};
const SCORECARD = read('SCORECARD.md') || '';
const SKILL = read('SKILL.md') || '';
const LOG = read('LOG.md') || '';
let REPORT78 = '';
try { REPORT78 = fs.readFileSync(fleetReport, 'utf8'); } catch { REPORT78 = ''; }
const LESSON79 = read('corpus/lessons/round-79.md') || '';
const CLAIMS78 = read('.ufo/waves/round-78/claims.json') || '';

// ---- claims ----
// 1. SCORECARD r78 C1 row: the counting command cites a superseded nonce.
add('sc-78-nonce-stale-present', () => ({ ok: has(SCORECARD, 'tabi-r78-l1-d59ca0270c2a'), detail: 'the stale nonce is no longer in SCORECARD.md (records are append-only)' }));
add('sc-78-nonce-corrected', () => ({ ok: has(SCORECARD, 'Correction — round 78 record drift') && pair(SCORECARD, 'tabi-r78-l1-d59ca0270c2a', 'tabi-r78-l1-bf94adaab578'), detail: 'no SCORECARD correction states the pair tabi-r78-l1-d59ca0270c2a → tabi-r78-l1-bf94adaab578' }));
add('sc-78-nonce-truth', () => ({ ok: truth.scoredNonce === 'tabi-r78-l1-bf94adaab578', detail: 'the scored receipt nonce is ' + truth.scoredNonce }));
// 2. SCORECARD r78 C1 row: 398/398 vs the final 400-case battery.
add('sc-78-battery-stale-present', () => ({ ok: has(SCORECARD, '398/398'), detail: 'the stale 398/398 is no longer in SCORECARD.md' }));
add('sc-78-battery-corrected', () => ({ ok: has(SCORECARD, 'Correction — round 78 record drift') && pair(SCORECARD, '398/398', '400/400'), detail: 'no SCORECARD correction states the pair 398/398 → 400/400' }));
add('sc-78-battery-truth', () => ({ ok: truth.batteryCases === 400, detail: 'the scored battery ran ' + truth.batteryCases + ' cases' }));
// 3. SKILL.md r78 gate registry: 398 cases / 32 witnesses.
add('skill-78-stale-present', () => ({ ok: has(SKILL, '398 cases') && has(SKILL, '32 carried R77Mut1 witnesses'), detail: 'the stale registry numbers are no longer in SKILL.md' }));
add('skill-78-corrected', () => ({ ok: has(SKILL, 'Correction — round 78 registry') && pair(SKILL, '398 cases', '400 cases') && pair(SKILL, '32 carried R77Mut1 witnesses', '31 carried R77Mut1 witnesses'), detail: 'no SKILL correction states the pairs 398 cases → 400 cases and 32 witnesses → 31 witnesses' }));
add('skill-78-truth', () => ({ ok: truth.batteryCases === 400 && truth.witnessCases === 31, detail: 'battery ' + truth.batteryCases + ' cases, witness cases ' + truth.witnessCases }));
// 4. LOG.md round-78 entry: 398/398 and the superseded nonce, with no correction entry.
add('log-78-stale-present', () => ({ ok: has(LOG, '398/398') && has(LOG, 'tabi-r78-l1-d59ca0270c2a'), detail: 'the stale LOG numbers are no longer in LOG.md' }));
add('log-78-corrected', () => ({ ok: has(LOG, 'Correction — round 78 record drift') && pair(LOG, 'tabi-r78-l1-d59ca0270c2a', 'tabi-r78-l1-bf94adaab578') && pair(LOG, '398/398', '400/400'), detail: 'no LOG correction entry states the pairs nonce → nonce and 398/398 → 400/400' }));
// 5. The filed r78 report: 32 witnesses, 9 Mistakes rows, the nodeReport drift sentence. A filed
// report is never rewritten, so the correction lands in the round-79 lesson (and the r79 report).
add('report-78-stale-present', () => ({ ok: has(REPORT78, '32 carried R77Mut1 witnesses') && has(REPORT78, '9 Mistakes rows'), detail: 'the stale report sentences are no longer in the filed r78 report (' + fleetReport + ')' }));
add('report-78-corrected', () => ({ ok: has(LESSON79, 'Correction — round 78 record drift') && pair(LESSON79, '32 carried R77Mut1 witnesses', '31 carried R77Mut1 witnesses') && pair(LESSON79, '9 Mistakes rows', '8 Mistakes rows'), detail: 'the round-79 lesson carries no directional correction for the report\'s witness and Mistakes rows' }));
add('report-78-truth', () => ({ ok: truth.witnessCases === 31 && truth.mistakesRows === 8, detail: 'witness cases ' + truth.witnessCases + ', Mistakes rows ' + truth.mistakesRows }));
// 6. The r78 claims.json leg (b) path: `scored/` vs the actual `round-78-seats/` receipts.
add('claims-78-path-stale-present', () => ({ ok: has(CLAIMS78, '.ufo/waves/round-78/scored/') && has(CLAIMS78, 'cold-run acceptance'), detail: 'the stale claims.json leg (b) path is no longer present' }));
add('claims-78-path-corrected', () => ({ ok: has(LESSON79, 'Correction — round 78 record drift') && pair(LESSON79, '.ufo/waves/round-78/scored/', '.ufo/waves/round-78-seats/'), detail: 'the round-79 lesson does not state the path pair .ufo/waves/round-78/scored/ → .ufo/waves/round-78-seats/' }));
add('claims-78-path-truth', () => ({ ok: truth.coldPathsInSeats && truth.coldLines >= 4, detail: 'cold-runs.txt lines ' + truth.coldLines + ' all under round-78-seats: ' + truth.coldPathsInSeats }));
// 7. The nodeReport sentence: the scored receipt's pick-multiple id is 7; the 7->10 drift belongs
// to the pre-repair L1-cold1 run.
add('report-78-node-truth', () => ({ ok: truth.scoredNode === 7 && truth.cold1Node === 10, detail: 'scored pick-multiple node ' + truth.scoredNode + ', L1-cold1 node ' + truth.cold1Node }));
add('report-78-node-corrected', () => ({ ok: has(LESSON79, 'Correction — round 78 record drift') && pair(LESSON79, 'pick-multiple 10', 'pick-multiple 7'), detail: 'the round-79 lesson does not state the pair pick-multiple 10 → pick-multiple 7' }));
// 8. The capability-status command states its provisional count (round-78 Correction 7 / spot-check §6 item 6).
add('capability-status-count', () => {
  const r = spawnSync(process.execPath, [path.join(lane, 'scripts/check-capability-status.mjs'), '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  const ok = r.status === 0 && j && j.mismatches === 0 && j.provisional === 1;
  return { ok, detail: 'check-capability-status exit ' + r.status + ' ' + JSON.stringify(j ? { rows: j.rows, claimed: j.claimed, provisional: j.provisional, mismatches: j.mismatches } : r.stderr.slice(0, 200)) };
});

const results = [];
for (const c of claims) {
  let res;
  try { res = c.fn(); } catch (e) { res = { ok: false, detail: 'threw: ' + e.message }; }
  results.push({ id: c.id, ok: !!res.ok, detail: res.detail });
}
const mismatches = results.filter((r) => !r.ok);
const out = { schema: 'tabi-r79-record-drift', claims: results.length, mismatches: mismatches.length, failed: mismatches, results, truth };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches: out.mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches.length === 0 ? 0 : 1;
