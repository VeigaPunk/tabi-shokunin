# round-1 — non-author verification and spot-check (orchestrator, kaika)

Written by the integrator, not the lane (CORPUS.md: corrections and outside reviews are new
files; the lane owns `round-1.md`). Verifiers were fresh agents dispatched by the orchestrator
after the round landed at `5cdc97654`; full reports are committed in the fleet repo at
`.ufo/waves/kaika-w3/tabi-review.md` and `tabi-critic.md`.

## Spot-check (LEARNING.md — at least one admit and one reject)

| decision | sample | verifier | result |
|---|---|---|---|
| admit | chrome-profile, BiDi-capability-matrix and flake notes — reviewer re-opened 9 rows (tier-A S004, S017; rejected S027); quotes and sha256 match except S001 (dynamic page, disclosed); agree | W3ReviewTabi | agree |
| reject | S026, S027 and r07-as-credit rejected — agree (r07's only receipt is byte-identical to r01's) | W3ReviewTabi | agree |

## Adjudication

ADMITTED after post-review fixes `5cdc976`. Per-axis: operability improved (new `scripts/check-sources.mjs`, self-test 0→26 cases, now scoped to `## Registry` — a row outside Registry fails; score 7→8), coverage improved (SOURCES 0→28 rows, census ok; 3 notes citing S### rows 0→3; score 8→9 as a note/row count, not the AXES fraction), calibration improved (self-description drift 15→0 with the `LC_ALL=C`-corrected command; seven QUALITY criteria cite the lesson; inference-stated-as-fact corrections appended), freshness/depth/adjacency unchanged. SHONEN regenerated with four `[~]` (lane-subagent `[x]` withdrawn: a dispatched subagent is still the lane). Trends: expansion improved, quality improved, discernment improved (6/6 spot-check agree). Debt: the lane's round-contract gates pin SHONEN.md bytes and now report `history_rewritten` — the pin contradicts PROTOCOL's per-round SHONEN regeneration; re-baseline it next round (not counted as harm).
