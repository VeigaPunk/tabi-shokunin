# CritEntryProse — round 36 attempt 2, wave w2

VERDICT finding — §6.7's “Movement after freeze is invisible” overstates what the entry's current prose establishes: the named delta heads are pinned, but its table is explicitly for the freeze snapshot, and a later commit may change the live sibling head without changing that snapshot. The smallest safe correction is to scope the sentence to the measured snapshot: “Movement after the frozen delta heads is invisible to this ledger; a later sibling commit does not alter the ledger or its frozen inputs.”

## Requested checks

1. **Front matter — pass.** `source`, `verified-at`, and `recheck` are the expected keys, in the same top-level shape as the established entries (the rate entry also adds optional `ground`/`tier`). Provenance is honest: `verified-at` explicitly limits itself to source text, while the entry opening and §6.1 say the drafting seat ran no measurement and that the numbers are ledger/claims reads, not a counter verdict. Those disclosures survive the landing wording. Evidence: landed entry `corpus/knowledge/adjacency-drift-audit-r36.md` lines 1–4, 8–10, 139–141; comparator headers `webdriver-bidi-firefox-runtime-round-35.md` lines 5–7 and `rate-signal-decision-table.md` lines 1–10.

2. **§6 limits — finding on #7, other six pass within the requested prose review.** Limits 1–6 remain accurately scoped as non-measurement, disclosed derivation risk, line-granularity, relocation-context, unverified revision grammar, and citing-row coverage/delta emptiness. #7 accurately states that this ledger is frozen against resolved delta heads and cannot change retroactively, but “Movement after freeze is invisible” is too broad: a later sibling movement is invisible to this frozen ledger, not to a future re-derivation/recheck. Narrow the sentence as in the verdict. Evidence: entry §6 lines 137–162 and §7 lines 166–171 (which explicitly says sibling movement supersedes §4); frozen claims C1 surface lines 35–40 identifies frozen delta heads. I found no ExecDeltaLive report in the available w2 files, so this assessment uses entry/contract wording rather than attributing a peer finding.

3. **DRAFT status remnant — pass.** No `DRAFT` wording survives in the landed entry; its former draft banner has been replaced by descriptive text (“This entry documents the method”). The remaining “drafting seat” is a factual provenance description, not a claim that the landed entry remains a draft. The w1 draft's DRAFT banner is not part of the landed file.

4. **Cited figures upgraded into evidence — pass.** The entry repeatedly distinguishes observation from claims and counter-owned verdicts: §4 calls 0 added lines the claims file's figure, §5 says S142 is not evidence of statuses, §6.1 disclaims measurement, and the introduction says numbers are cited with provenance, not upgraded. The 304/3/0 ledger columns are presented as the frozen committed ledger and explicitly not a predicate verdict. This matches the method-entry remit; no prose upgrade found. Evidence: lines 8–10, 108–114, 132–135, 139–141.

## Scope

Compared landed entry at the specified landing with the established WebDriver and rate entries; inspected frozen claims and available w2 review reports. No counter or measurement run. The generic entry review `w2/RevEntry/report.md` corroborates the committed figures but does not test this wording finding.

VERDICT finding — §6.7 overstates “Movement after freeze is invisible”; scope it to movement after the frozen delta heads being invisible to this ledger, since a later sibling commit leaves the frozen snapshot unchanged but can be seen by a subsequent re-derivation.
