# DraftScorecard — round 16 scoped report (author-side advice, not certification)

Owned output: `.ufo/waves/round-16/drafts/DraftScorecard.md` (written: round 16 scorecard draft with PENDING markers).

## Behavior
- Draft follows the round-15 section style of `SCORECARD.md` (axis table, claim table, planned/capabilities/saturation). Scalars before values are taken from round 15's end (depth8, coverage9, operability8, freshness8, calibration9, adjacency8); all after values are PENDING.
- Claim C1 (operability, binding gate, counter `measure.mjs --claim C1`) and C2 (coverage, WebMCP capability, counter `measure.mjs --claim C2`) are drafted from PLAN.md claim and contract text.
- New counter-digest column added to the claim table; it addresses round-15 routed defect 1 (counter pinned by revision only).
- Capability row drafted for `webmcp-cdp-observation`, first-working16 PENDING.

## Gates / checks
- None run. Per lane bounds this seat runs no gates, selftests, counters or browsers. `measure.mjs`, the binding gate and the WebMCP harness do not yet exist, so the counting commands in the draft are unexecuted.
- Start census values are copied from PLAN.md, not re-observed by this scribe.

## Touched surfaces
- Written: `.ufo/waves/round-16/drafts/DraftScorecard.md`, `.ufo/waves/round-16/w1/DraftScorecard.md`.
- Read: `.ufo/waves/round-16/PLAN.md`, `SCORECARD.md` lines 640-730.
- Not touched: SCORECARD.md, corpus/, scripts/, other seats' drafts or probes.

## Tools installed or updated
- None.

## Findings / open items for L1
1. Saturation wording is ambiguous in the assignment: "round16 is position3 since r13 capability — a capability entering resets it". The draft states pre-entry position3 and position1 if `webmcp-cdp-observation` is held. L1 must confirm which reading is intended.
2. The baseline `e38d2599…` is taken from PLAN.md. The measured revision and counter digests are PENDING until L1 integration. Round 15 measured at `b7cf044` rather than delivered HEAD; the round-16 draft asks that the measured revision be recorded explicitly.
3. The assignment names Chromium 152 for the frontier; PLAN.md pre-probe found Chromium 154.0.8037.97. The draft uses 154 and notes the change.
4. Source-row numbers (Sources29, A23/B4/C2, mined24/queued3/rejected2) are unverified copies from PLAN.md; L1 must run the census start/end.
5. Outside-agreement and trend verdicts are left PENDING; the draft does not certify them.
