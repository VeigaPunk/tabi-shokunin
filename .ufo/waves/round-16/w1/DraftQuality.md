# DraftQuality — round 16 scoped report (author-side advice, not certification)

## Behavior
Drafted QUALITY.md criteria 22 and 23 at `.ufo/waves/round-16/drafts/DraftQuality.md`, in the
numbered-item style of `corpus/QUALITY.md:60-77` (≤6 lines each, lesson pointer in trailing parens).

- 22 binds: counter blob sha256 at measured revision, declared counted inputs, measured revision,
  reproduction at or diff to delivered HEAD; enforced by `scripts/check-measurement-binding.mjs`
  (contract per `.ufo/waves/round-16/PLAN.md:34-77`; legacy-shaped record → `counter_digest_unrecorded`).
- 23 binds: exact surface (object path, flags, Chromium version, secure-context state); no generalization
  of a CG-draft API name to the implementation; loopback `http://127.0.0.1` as the test surface.

## Sources read (this session)
- `corpus/QUALITY.md:1-8, 48-77` (style; criteria 17–21 and their lesson trailers).
- `corpus/lessons/round-15-verifier-spotcheck.md:118-124` (routed defects 1 and 2: counter pinned only by
  revision `3ee59de0…` vs HEAD `dd9c8675…`; report measured at `b7cf044` not delivered `36240c7`).
- `.ufo/waves/round-16/PLAN.md:1-114` (C1 contract, C2 surface facts, ownership table).
- No web sources opened; criteria text does not cite external URLs. No S020 re-open performed.

## Gaps and findings
- **Lesson pointer target does not exist yet.** `corpus/lessons/round-16.md` is absent (L1-only write per
  PLAN ownership). Both criteria cite `corpus/lessons/round-16.md#mistakes`; L1 must create that file with a
  `#mistakes` anchor or the pointers dangle.
- **Criterion 23 secure-context wording is unobserved.** PLAN does not record a secure-context observation
  for the loopback fixture; the criterion requires recording it, so the first C2 receipt must capture it or
  the criterion will be unmet by that receipt. [INFERENCE from PLAN text; not run.]
- **S020 cross-reference unverified.** Criterion 23's trailer names "WebMCP spec S020" as the CG-draft source;
  this is taken from PLAN.md (`S020 WebMCP spec re-open`) and not re-opened here.
- **Criterion 22 "not admissible" wording** is a prohibition on the admission bar; L1 should confirm the
  QUALITY.md header ("probation draft") accepts a hard reject phrasing for claims.

## Tooling
No installs or updates. No subagents spawned. No commits. No gates, selftests, browsers or counters run.
Only owned file written: `.ufo/waves/round-16/drafts/DraftQuality.md`; report written to
`.ufo/waves/round-16/w1/DraftQuality.md`.

## Checks for main agent
- Confirm `corpus/lessons/round-16.md` gains a `#mistakes` anchor matching both trailers.
- Verify criteria 22/23 numbering follows 21 in `corpus/QUALITY.md` after integration (no collision with
  other drafts' 22/23).
