# RevC1FrozenFit — shipped C1 extension vs frozen round-26 predicate (tabi round 27, wave 1)

Seat: TabiR27.RevC1FrozenFit · 2026-10-25 · read-only report.
Revs: frozen predicate `.ufo/waves/round-26/claims.json` claims[0] (C1, frozenBeforeData=true); diff `f185b4e7..master` on `scripts/check-selfassessment.mjs`; `master` resolved to `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` during this seat (`git rev-parse master HEAD` → both `5198e28…` earlier in the session, then advanced by sibling landings; all checks re-run at the then-tip).
Scratch fixtures: `.ufo/waves/round-27/scratch/RevC1FrozenFit/` (attack.sh + fx-* sandboxes). No tracked file touched; no tool installed (none needed).

## Frozen predicate, the clauses under test (claims.json:28)

- "a LOG line carrying a gate self-test tally (`--self-test N/N`, `N-case`, `cases=N`, or 'N cases') associates to the lane scripts/\*.mjs named in its own line or its round section (single-script sections only; multi-script ambiguity stays could-not-evaluate)"
- "mismatches … are findings unless an append-only correction **line** later in LOG.md names the same script, states the oracle-correct number, carries a correction marker and cites the superseded line."
- control: "a correction line that states the wrong oracle number or lacks the line citation must NOT supersede".

## (a) Association rule — CONFORMANT

Code `m1LogFindings` (scripts/check-selfassessment.mjs:316-330 at tip): line scripts → else `scripts.size === 1` → else `couldNotEvaluate: "ambiguous script association"`; gate blob ≠ working copy or no printed tally → could-not-evaluate (`gateTally`, :168-200). Line-level tally shapes are exactly the frozen four (`--self-?test N/N` prefix window, `N-case`, `cases=N`, `N [isolated|CLI] cases`). Observed behavior (my re-run, plain output):

- `LOG.md:471 :484 :994 :1056 :1079 :1812 :1863 :1864` → `could-not-evaluate=ambiguous script association` — multi-script sections stay uncounted, matching the round-27 LOG's own description of :1863 ("in a multi-script section so the tally is could-not-evaluate, never counted", LOG.md:1920-1922).
- `LOG.md:972` → `script outside the runnable gate set` (fail-closed).
- `SCORECARD.md` window counted mismatches = 0 at tip — the frozen "SCORECARD window stays clean" holds; m1Findings body is unchanged by the diff (kill rule respected; m2/m3 untouched).

One widening, unexercised: the 'N cases' arm accepts `N isolated cases` / `N CLI cases`, beyond the frozen `'N cases'`. Direction is fail-closed (more detections possible); no counted finding at tip rests on it. Note, not defect.

## (b) Supersession unit: paragraph vs frozen "line" — DEVIATION-JUSTIFIED for the unit itself; the shipped unit is coarser than the justification (see Finding 3)

The operative correction (round-26 entry, exists at baseline tip f185b4e) is LOG.md:1853-1856, one Markdown bullet wrapped over four physical lines:

- :1853 carries script name + marker + citation: "- Correction (supersedes LOG.md:1664): `scripts/round-evidence-audit.mjs"
- :1854 carries the oracle number: "--selftest` measured `cases: 13` at `4ad4c77` (exit 0); the round-23 entry's"
- :1855 quotes the stale figure: "`12/12` restates the pre-`43e9bb5` tally. Append-only; …"

A literal single-line unit can never satisfy all four conjuncts on one physical line here (name/marker/citation on :1853, number on :1854), so the frozen "after: mismatches=0" would be unreachable without rewriting frozen history — the paragraph reading is the only faithful implementation. Verdict: justified, not a violation of "predicate stays exactly as declared".

However `paragraphs()` (check-selfassessment.mjs:255-264) splits on blank lines only — it is a blank-line block, not "one correction wrapped over lines". The round-27 entry's five correction bullets (:1904-:1923) have no blank lines between them and are therefore ONE supersession block. Fixture F/F2 below proves the consequence.

## (c) statedTallyNumbers ambient-number pickup — YES, picked up; yes, it can let a wrong correction supersede (proven)

`statedTallyNumbers` (:245-252) includes the bare fraction arm `/\b(\d+)\s*\/\s*(\d+)\b/` with no `--selftest`/tally context, and supersession accepts `statedTallyNumbers(paragraph).includes(f.observed)` (:341-351). So ANY `N/M` in the paragraph — a quoted stale mention, a receipt figure, a date — counts as "stating the oracle-correct number". The real :1853 block does pick up `12/12` (stated set {13,12,12}); its supersession of :1664 is still correct because the oracle 13 is also asserted via `cases: 13`. Latent, not live, at this tip.

Attack fixtures (each: gate `--selftest` prints `cases: 12`; stale LOG line claims 13/13; run `node scripts/check-selfassessment.mjs --repo <fx> --rev <sha>`):

| case | correction paragraph | result |
|---|---|---|
| A | asserts wrong "still measures 13/13" AND quotes `12/12` | stale line **superseded** (wrong correction works); residual finding is the correction's own line |
| B | same, without the quoted `12/12` | not superseded; mismatches=2 (control holds) |
| C | asserts **no number at all**, only "see the round-23 entry's `12/12` matrix" | **superseded, verdict=clean, mismatches=0** — false clean |
| D | correct number but cites `LOG.md:99` (stale is :6) | **superseded, clean** — citation unbound |
| E | correct number, no `:N` citation anywhere | stays a finding (declared control holds in the simple shape) |
| F | block = bullet correcting script A + adjacent bullet merely naming script B (oracles both 12) | **both superseded, clean** — A's correction clears B's stale tally |
| F2 | same, blank line between bullets | B stays a finding — proves the blank-line block-merge is the cause |

## Findings by severity

1. **HIGH — ambient-number pickup defeats the frozen skip-work control.** `statedTallyNumbers`' bare `N/M` arm lets a paragraph "state" a number it only quotes. Case C: a correction that never asserts a tally produces verdict=clean; case A: a correction asserting the wrong number still supersedes the stale line. The shipped selftest case `m1-log-wrong-number-correction` passes only because its fixture paragraph quotes no fraction — the control is fixture-lucky, not structural. Direct answer to the assigned question: the `12/12` in :1855 IS picked up; it did not cause a wrong supersession this round only because `cases: 13` is asserted in the same block.
2. **HIGH — "cites the superseded line" is implemented as `/:\d+/` presence (:349), unbound to the stale line's number.** Case D: citing `LOG.md:99` clears a finding at `:6`. Also weaker than the lane's own SCORECARD-window convention, which requires the clearer to be a later *matched* claim (`observed === g.claimed`, check-selfassessment.mjs:236-241) — the shipped comment "the same supersession convention" (:36-37) is inaccurate.
3. **MEDIUM — supersession unit is a blank-line block, not one correction item.** Five adjacent bullets (LOG.md:1904-:1923) merge into one block; conjuncts evaluated block-wide, so cross-item clearing fires (case F). Today's outcomes are correct only contingently — each (script, oracle) pair happens to be named and stated somewhere in the merged block.
4. **LOW — header comment vs code.** :27-29 lists `cases: N` as an m1 block shape; neither window's claim extraction accepts `cases\s*:` (only `cases\s*=`). Code is faithful to the frozen four shapes; the comment overstates detection (a stale line carrying only `cases: 12` would be missed while the doc claims coverage).

## Independent counter re-runs (non-author)

- Baseline: `node scripts/check-selfassessment.mjs --rev 4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` → `mismatches=6 could_not_evaluate=89 superseded=5`, exit 1. Counted = LOG:335 (4 vs 12), :391 (4 vs 12), :1090 (66 vs 26), :1103 (66 vs 26), :1664 (12 vs 13) + m3. Matches the committed receipt `.ufo/waves/round-27/selfassess-baseline-raw.json` field-for-field (mismatches=6, CNE=89, superseded=5; its m3 observed=6 vs my 38 — m3 reads the live tree, time-dependent, both nonzero).
- Tip: `node scripts/check-selfassessment.mjs --rev master` → `mismatches=1 could_not_evaluate=92 superseded=10`, exit 1. All five LOG-window findings **superseded**; m1 counted = 0; the 1 is `m3-unlanded-paths` observed=38 (wave-dirty working tree, out of the extension's scope per kill rule). Committed receipts agree: `selfassess-tip-raw.json` (rev f185b4e) mismatches=5 with :1664 superseded; `measure-c1-fd722a7.json` mismatches=1, superseded=10. Frozen targets hold: before ≥1 (measured 6 with 5 LOG-window, incl. the declared :1664 "Non-vacuity: `--selftest` 12/12" — quote re-located at LOG.md:1664 exactly), after m1=0 at tip on a clean tree.
- Stale-shape provenance (all re-located): `cases=4` receipt quotes at LOG.md:335/:391; "66 cases" at :1090; "66/66 cases" at :1103 (matched by the frozen `'N cases'` shape — predicate-inherent breadth, honestly dispositioned by corrections, not a code deviation).

## Kill-rule and failureCapable conformance

Diff touches class m1 only (new `statedTallyNumbers`/`paragraphs`/`m1LogFindings`, `evaluate()` inserts `logFindings`, header comment, +4 selftest cases; m2/m3 bodies untouched). CASES grows 13 → 17 (≥2 required). could-not-evaluate semantics stay fail-closed. Verdict on the assignment's (d): **deviation-real** — association (a) conformant, paragraph unit (b) justified but over-merged (Finding 3), stated-number extraction (c) carries two real soundness holes (Findings 1-2) that are latent at this tip but defeat the frozen skip-work control in reachable shapes.

## Recommended (recommendation only — read-only seat)

Bind the citation (`new Number(/:(\d+)/)` equality with `f.line`), restrict the correct-number check to asserted tally shapes (drop the bare `N/M` arm or require `--selftest`/`cases[:=]`/`N-case`/`N cases` context), and make the unit the Markdown list item (split paragraphs on list-item starts), plus a selftest case quoting a fraction in the correction paragraph.

## Corroborations (completed)

`node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`, exit 0 — all four frozen failureCapable case families present (log stale / log corrected / wrong-number / ambiguous + scorecard regression) plus the two refusal cases. `git show --stat 43e9bb5` → "round-23: c2 round-total red arm (13 selftest cases)", `scripts/round-evidence-audit.mjs | 35 +…3 -` — the "measured 13 since commit 43e9bb5" provenance pointer is corroborated, consistent with the counter's oracle output (13 at both measured revs).

## Residual risk / verification gaps

None open for this seat's scope: counter re-run at both revs matches the committed receipts; selftest 17/17 green; provenance commit verified. Findings 1-3 are latent at this tip (no wrong outcome in the shipped LOG), but any future correction paragraph quoting a fraction — the exact rhetorical pattern of the real :1853 block — can silence a stale tally or clear an unrelated script's finding. I did not audit C2/C3 (other seats). Fixture repos live only under `.ufo/waves/round-27/scratch/RevC1FrozenFit/` and are disposable.
