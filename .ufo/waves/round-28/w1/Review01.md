# Review01 — C2 claim fit vs actual LOG correction matcher and false-clear (round 28, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`)

Frozen claims: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (C2 = line 12 of that file, `frozenBeforeData: true`).
This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/w1/Review01.md`.
Review axes walked: (1) claim↔mechanism fit, (2) baseline do-nothing controls, (3) red/green control killability, (4) tip discriminator soundness, (5) residual risk. Read-only; no production code touched; no installs.

## 1. Baseline do-nothing controls (observation, commands recorded)

Lane HEAD = `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (`git rev-parse HEAD`); baseline blob resolves (`git cat-file -e`). Working tree: only `?? .ufo/waves/round-28/` untracked (`git status --porcelain`).

- Selftest control: `node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`, exit 0 (observation, 2026-10-25).
- Counting control: `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → `mismatches=1`, `superseded=10`, `couldNotEvaluate=92`; `counted` holds only `m3-unlanded-paths` (SCORECARD, observed 15 — the untracked wave dir, expanded by `--untracked-files=all`). The sole counted m1-class item is absent (observation).
- The false-clear is reproduced: finding `{doc: "LOG.md", line: 221, script: "scripts/check-freshness.mjs", claimed: 8, observed: 12, superseded: true}` is in `findings` but not in `counted` (observation, same command). LOG.md:221 line text: "exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`," (located LOG.md:221). Consistent with round-27 evidence `corpus/lessons/round-27-verifier-spotcheck.md:15` (`mismatches=0` on a clean tree; here m3 adds 1 only because of wave-dir noise).

## 2. Actual matcher mechanism and the false-clear cause

`m1LogFindings` supersession (scripts/check-selfassessment.mjs:309-327): a later paragraph clears a stale mention when it (a) names the same script, (b) matches `/supersed|correct/i`, (c) matches `/:\d+/`, (d) `statedTallyNumbers(text).includes(f.observed)` (scripts/check-selfassessment.mjs:322-326). Inference from code: condition (c) accepts ANY colon-number token — timestamp, range, hash-suffix — as the "citation"; condition (d) accepts the oracle-correct number appearing anywhere in the paragraph, including as that paragraph's own unrelated fresh tally.

Concrete clearing paragraph (inference from code + confirmed outcome): the paragraph starting LOG.md:265 ("post-commit measurement and handoff") satisfies all four: names `scripts/check-freshness.mjs` at LOG.md:272; "Corrected owned work landed" at LOG.md:266 matches (b); the timestamp `2026-10-15T05:16:28Z` at LOG.md:269 supplies `:16` for (c); "12-case self-invocation" at LOG.md:275 supplies 12 for (d). None of it cites line 221 or restates the stale 8→12 figure for that tally. Outcome (`superseded: true` for :221) is observation. The round-27 LOG entry itself already diagnosed this: "marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221" (LOG.md:1931-1932).

Claim-killer checked and cleared: no other LOG.md paragraph cites `:221` — `grep -n '221' LOG.md` returns only :1931-:1932, and that paragraph names no `scripts/check-freshness.mjs` and carries no tally-shaped 12, so it cannot clear :221 under any tightening of (c) alone (observation + code-level inference). The C2 "after" target therefore survives the fix.

## 3. Claim-fit verdict: FIT, with one sharpening requirement

- The declared repair ("a correction only clears the exact stale tally it cites, not an unrelated later line/paragraph", claims.json line 12) maps 1:1 onto the real gap: bind `/:\d+/` to the superseded finding's own line number (e.g. require `:${f.line}` with a word boundary, tolerating `LOG.md:221` and ranges `:221-224`; must not match `:2210`). [INFERENCE on implementation shape; the requirement itself is the frozen claim.]
- Scope guard: the fix belongs in `m1LogFindings` (paragraph unit). The SCORECARD window (`m1Findings`, line unit) already requires the correcting finding's own tally to be oracle-correct (`g.observed === g.claimed`) and its live citations are exact (`:410`, `:1138`, `:1139`, `:1151` cleared by LOG-independent SCORECARD lines :1192-:1193); baseline shows those four stay superseded. Do not weaken `namesScript` or the number requirement (killRule compliance).
- Sharpening requirement (must hold for verdict): the tip discriminator is NOT "mismatches nonzero". At any tip with an untracked wave dir, m3 alone forces `mismatches>=1`, do-nothing included (baseline observation, Section 1). Verifiers MUST assert `counted` contains `{class: "m1-selftest-tally", doc: "LOG.md", line: 221}` with that finding `superseded: false` in `findings`, and the do-nothing control shows the same finding `superseded: true` and absent from `counted`. The claim's "after" text supports this; the metric name `selfassessment_mismatches_and_cases` alone invites a lazy nonzero check — flagging so measurement binds to content.
- Expected post-fix variance: historical non-exactly-cited LOG supersessions flip to counted (candidates seen at baseline: LOG.md:335, :391, :1664; LOG.md:1090/:1103 stay superseded — their correction bullets at LOG.md:1919-1926 name `scripts/check-sources.mjs`, state `cases: 26`, and cite exact lines). So the tip mismatch count will exceed 1 by more than the :221 item; that is claim-conformant (target is nonzero + :221 present), not a defect.

## 4. Red/green control specification (selftest, CASES table, assert exit AND counted classes)

Fixture shape per existing helpers: stale LOG tally "Non-vacuity: `--selftest` 12/12" at LOG line 6; fixture gate prints `cases=13`.

- RED R1 (unrelated citation, minimal): correction paragraph "Correction (supersedes LOG.md:3): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip." — cites a line that is not the stale line 6. Do-nothing matcher: clears → exit 0 (defect reproduced, case FAILS = red). Fixed matcher: mismatch retained → exit 1, counted classes `["m1-selftest-tally"]`. Killable against the do-nothing mutant; kills any fix that merely keeps status quo.
- RED R2 (mechanism-faithful, mirrors LOG.md:265→:221): later paragraph names `scripts/check-fixture.mjs`, contains the word "corrected", contains a timestamp-like `:05:13:11Z` token, and states its own fresh oracle-correct `cases: 13` tally — but never cites `:6`. Do-nothing: clears via (a)+(b)+`(c) :13 from timestamp`+(d) `13 from its own tally` → exit 0 (red). Fixed: mismatch retained → exit 1. This is the mutation-killer for weak-`/:\d+/` fixes and for a fake fix that only requires "the correcting paragraph's own tally is correct".
- GREEN G1 (exact-citation positive control): already present as `m1-log-stale-then-corrected` — correction cites `LOG.md:6` (exact) and states `cases: 13` → exit 0 both before and after; the claim's "positive exact-citation control" is satisfied by retaining it (no net-new needed; say so in the report rather than duplicating).
- GREEN G2 (regression guard): existing `m1-log-wrong-number-correction` (cites `:6` exactly, states wrong number 12) must remain exit 1 after the fix — proves the number requirement was not dropped while adding exact-citation.
- Acceptance: selftest goes 17 → ≥19 cases, all passing; both red cases must FAIL on the do-nothing matcher first (control results recorded before implementation, per frozen notes field). `failureCapable` is met only if expected classes are asserted, not exit alone (existing harness compares `JSON.stringify(classes)`; keep that).

## 5. Residual risk and verification gaps

- m3 measures live porcelain, not `--rev` (also flagged in LOG.md:1935 round-27 note); out of C2 scope but it makes any count-based C2 verdict unsound — content-based assertion per Section 3 is mandatory.
- "Exact citation" semantics: the frozen text says "cites the superseded line (:/LINE/)"; a range form `:221-224` arguably cites :221. Recommend accepting exact-number-in-range; rejecting bare `:\d+`. Unresolved wording, low risk.
- Unknown/not run: post-fix tip measurement (fix not yet landed by executor at review time); `--rev` values other than baseline were not exercised. Baseline controls in Section 1 are the only numbers certified here.
- No pacman transaction, no installs, no tracked-file changes; the only bytes I wrote are this report.
