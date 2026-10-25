# Scribe01 — round 28 audit/source-gate findings

## Behavior / assignment boundary
This is a report-only audit of source-gate feasibility and opened S-row candidates. No product code, judge, or tracked lane file was edited. No installation/update occurred; no tool version/channel/reason applies. No builds, linters, formatters, real-site interactions, consequential actions, credentials, or session material were used. No delegated work was initiated.

## Frozen claim provenance
Read `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (lines 5, 7, 11–15): frozen before data on 2026-10-25; baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; C1 requires revision mismatch rejection, matching revision acceptance, >=7 selftest cases, and preservation of missing-source CNE; C2 demands exact-citation-only supersession, retaining the LOG.md:221 mismatch without the exact correction, with positive/negative tests. Its `notClaimed` explicitly disclaims source admission unless an already-open source is reopened and cited. Prior defect evidence at `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47` documents the C2 false-clear and missing measurement-revision binding requirement.

## Source-gate finding
Feasible existing source candidate: **S106**, not a new round-28 admission. `corpus/SOURCES.md:120` identifies it as tier A, opened 2026-10-25, Chromium 154 `content_features.cc`, scoped to shipped-default enablement at that pinned tag. `corpus/knowledge/bfcache-runtime-observed-round-25.md:61-64` gives the source locator and quote: `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)` and `// Enable using the BackForwardCache.` The note says this implies the feature ships enabled by default; the row's scope bounds the claim to the tagged source, not general runtime behavior. This is an already-open row with a knowledge citation, suitable only if the report explicitly reopens/cites it under applicable gate rules.

An S106-backed source-gate fixture can use the existing quote/locator as the admitted control and a deliberately unrelated or unsupported claim as the reject control; however, **I did not execute or inspect a source-admission gate**, and therefore cannot claim either control was admitted/rejected by a gate. No round-specific source gate opening was evidenced by my commands; the relevant frozen claim source prohibition remains controlling. The user explicitly asks to identify a feasible current claim source: S106 is the one identified candidate. I make no new sourced claim or admission.

## Observations, limits, and provenance
- Read-only repository state command: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --short --branch` → `## HEAD (no branch)` and `?? .ufo/waves/round-28/`. This shows the round wave directory is untracked; it does not establish that all of its contents are authored by this seat.
- Read-only discovery: `grep` tool searched `corpus/knowledge` for `S106|source: S106`; it found the round-25 knowledge note lines 60–64. Search of the round-28 wave directory found frozen claims and wave artifacts, but no source gate execution evidence. These searches do not prove absence outside searched paths.
- Frozen claims file reports six starting axis scores and baseline; those are reported contract data, not measurements performed here.
- No checks/tests were run by this seat; no verification result is asserted.
- No install/update occurred. PACMAN was not invoked.

## Touched surfaces / out of scope
Only this requested report was written: `.ufo/waves/round-28/w1/Scribe01.md`. No other paths were intentionally written. Out of scope: editing production code, repairing claims, adjudicating C1/C2, source admission, gate execution, commit/push/publish/deploy, and modifications to tracked lane or sibling repositories.

## Artifact path
`.ufo/waves/round-28/w1/Scribe01.md`