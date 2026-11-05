# R65Scribe2 — round-64 erratum drafts (D2–D5)

Seat: scribe, leaf (no subagent dispatch). Lane: tabi, base `58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`. Scope: draft append-only corrections for spot-check defects D2–D5 (`corpus/lessons/round-64-verifier-spotcheck.md` §5). D1 and the carried items (a)–(d) are out of scope.

## Deliverables

| Path (lane-relative) | sha256 |
|---|---|
| `.ufo/waves/round-65/w1/R65Scribe2/errata-round-64.md` | `d61c61ab2fc454a57f6f9c33aea75684c63db1c28f0adb1c2641c0c2dc5abbde` |
| `.ufo/waves/round-65/w1/R65Scribe2/erratum-commands.txt` | `032953909d04317397d95c3219b63875f8fc4938a371021d6286af4a9d047651` |

## Findings (each re-run with the spot-check's own command)

- **D2 — confirmed.** Ten seat reports at top level of `w1/` (committed at base: 10), not eleven. The superseded sentence is at `corpus/lessons/round-64.md:93-94`. `R64Sentinel` has no file or directory; `R64MutDriver` has 17 files and no report. The nested `R64Scribe/draft/*.md` files are not seat reports; a naive `grep '\.md$'` over `ls-tree` returns 13 and should not be used.
- **D3 — confirmed, with a second defect.** The Mistakes table has 11 data rows (header line 53, separator 54, rows 55–59 and 61–66). A blank line at **line 60** splits it. The "seven rows" sentence is in the fleet-root report `.ufo/reports/round-64/tabi.md:67`, which is not in the lane tree. The lane's own spot-check text is not the superseded source.
- **D4 — confirmed.** The SCORECARD defect (c) at `SCORECARD.md:3549-3550` says "18 of 30". The matrix gives 30 mutants, 26 survivors of the declared negatives, 18 of those accepting their targeted forgery, and 8 with none. The matrix's `survivedButForgeryKills` list equals the 18 rows whose `forge.acceptedByMutant` is true (checked by set equality).
- **D5 — confirmed.** The S169 Gate quote at `corpus/lessons/round-64.md:24` says "lines 208-219, read as one response shape". Lines 208–209 (`command getVersion` / `returns`) are the only contiguous non-comment span; the five fields sit on lines 211, 213, 215, 217, 219 with comment lines between. The sha256 of the staged PDL matches the pin (`5e1faf7d…170da`).

## Limits

- The erratum blocks are drafts. The lane commits them; this seat did not touch the lesson, SCORECARD, or the report.
- The D3 table-render claim (lines 61–66 not rendering as a table) is marked `[INFERENCE]` in the draft: it rests on the GFM delimiter-row rule and was not rendered.
- No instrument was run. No lane gate was run. No scratch clone was created because only read-only commands were needed, so there is nothing to delete.
- The fleet-root report is read-only here; its D3 sentence is quoted by line number, not edited.

## Commands

The full command set and literal outputs are in `.ufo/waves/round-65/w1/R65Scribe2/erratum-commands.txt`. Single proving command for the seat's central count: `git ls-tree -r --name-only 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162 -- .ufo/waves/round-64/w1 | grep -c '^\.ufo/waves/round-64/w1/[^/]*\.md$'` → `10`.

## Tooling

No tools installed or updated.
