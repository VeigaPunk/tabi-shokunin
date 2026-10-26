# Append-only errata appendix for `corpus/knowledge/rate-signal-decision-table.md`

Append at the very end of the entry, after the round-31 `## Errata — round 31, attempt-2 falsify wave a2w1` block
(the document's current last line is the S119-publication-month bullet). Nothing above it is edited; the header
(`recheck: 180d …`, line 8) keeps its bytes. 0 deletions.

```markdown
## Errata — round 32 wave w1 (append-only; the text above keeps its bytes)

- **Recheck cadence: the registry's `365d` governs, for S119 and S120 both (round-31 routed defect 3, routed here by
  `corpus/lessons/round-31.md:321`).** The header `recheck:` line (`:8`) says `180d` for the two RFCs; their registry
  rows say `365d` (`corpus/SOURCES.md` S119 and S120, and the round-31 lesson records the freeze-time choice at
  `corpus/lessons/round-31.md:60`). **Read `365d`.** The registry governs because `recheck` is a registry field and
  not a property of this entry: the SOURCES contract defines the cell's vocabulary and `scripts/check-sources.mjs`
  validates it (finding `bad_recheck`), while the header is a prose restatement of four rows that no gate reads; the
  contract's rule 2 allows a cadence to change only as a logged old→new row edit, and no such edit was made. So
  `180d` above is a stale restatement rather than a second cadence, and a future change of cadence is a logged row
  edit, never a header edit. The round-31 bullet reached the same reading by naming the registry; this paragraph
  records why. What the cadence buys is a re-open and re-location of every span: the class is standards-track RFC
  text, which changes by erratum or a successor RFC, so the guard is a replacement, not page drift.
- **The S119 publication-month erratum above now rests on a row, not on an assertion.** S123
  (`supersedes S119`, written this round from a fresh read-only GET of the same URL) reports HTTP 200, 25,265 B,
  sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` — byte-identical to the S119 receipt —
  with the header date at line 11 (`September 2022`) and `June 2022` only inside the RFC's own RFC 9110 and RFC 9111
  reference entries at lines 554 and 559. Rows D1–D5 keep citing S119: every span their quotes come from
  re-locates unchanged in those bytes, so the supersession corrects the anchor and admits no new number.
```

## Why this shape

- **Operative value named first**, then the mechanism (contract rule 2 + the counter that validates the cell), then
  what the cadence guards. A reader who stops after the first sentence still knows the value.
- **No in-place edit and no header rewrite.** The header's `180d` is left as the round-31 bytes, so `git diff
  --numstat` over this change stays `+N/-0` for this document; the entry's own rule (`QUALITY.md` rule 4; the
  round-31 errata heading's "the text above keeps its bytes") is kept.
- **S123 is cited inside the entry.** That citation is what makes the new row's `used-by
  corpus/knowledge/rate-signal-decision-table.md` honest and satisfies `scripts/check-sources.mjs`
  `used_by_uncited` (the checker looks for the literal id in the named file). No `source:` header line is added for
  S123, so `scripts/check-decision-table.mjs` continues to bind D1–D5 to S119, whose receipts under
  `corpus/evidence/round-31/decision-table/` already cover the identical bytes.
- **The other correction from the same route is not made here.** The round-31 lesson also records `90d` for S121 and
  S122, which the header already says; only the RFC pair disagreed.
