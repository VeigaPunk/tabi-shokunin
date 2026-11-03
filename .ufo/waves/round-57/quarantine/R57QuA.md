# R57QuA — quarantine hand-check part A (S102, S106, S109, S110, S111, S114, S117, S118, S124, S125)

Seat: R57QuA (round 57 w1, wave-4 quarantine-first duty, slice lines 1–10).
**ADOPT NOTHING** — verdict receipts only. No register row, staged row or
knowledge note was edited; every file this seat wrote lives under
`.ufo/waves/round-57/quarantine/R57QuarA/`.

Receipts: `quarantine/R57QuarA/` — ten `S<id>.json` verdicts, the ladder tool
`laddr.py`, the generator `gen_receipts.py`, `fetch.sh`, fetch/guard metadata and
`R57QuA-summary.md` (full method, tables and evidence).

## What was done

For each of the ten rows: read the full register row and the staged row with the
same id, resolved and guard-checked the cited host (all https, all public — no
loopback/private/link-local/metadata address, so no fetch was refused), fetched
the cited source once with `curl -sL --max-time 90 --max-filesize 25000000`
(no POST, no cookies, no credentials), fetched the staged URL when it differs in
string (S109) plus the companions the staged rows name (S111's zh-CN mirror,
S118's paper PDF), split the quote cell on `<br>`, and located every fragment
under the frozen fold ladder f0–f6, recording the fold, line, byte/char offset
and the byte-exact source span, with the re-runnable command per fold. PDF
sources were text-extracted with the already-installed `pdftotext`; S118's
sentence required the page-level reading-order extraction because the
full-document `-layout` pass interleaves the two columns mid-sentence.

All ten fetches returned 200 with non-empty bodies (bytes and sha256 in
`R57QuA-summary.md`); no row was `unreachable` and no row was
`extraction-unavailable`.

## Verdicts

| id | verdict | reason (one line) |
|---|---|---|
| S102 | `absent-confirmed` | README has the anchor headings but zero "Last updated"; the cell is S103's footer date, and S103's live footer has since moved to 2026-10-29 UTC |
| S106 | `mispaired` | both Chinese fragments locate f0 at S107's zh-TW page (lines 5631, 5652); RFC 9309 has none |
| S109 | `mispaired` | the 429 fragments locate in RFC 6585 (S110's source, f0 line 68 / f2), not in tool-reference.md or its staged blob rendering |
| S110 | `mispaired` | 2 of 3 fragments locate f0 in S111's page (lines 4342, 4483); the third is S111's paraphrased heading; RFC 6585 has none |
| S111 | `partial-located` | the Chinese sentence is byte-exact f0 on the zh-CN mirror (line 3862); "Add hints to your tools" is nowhere — the h2 is "Use annotation hints" |
| S114 | `absent-confirmed` | no fragment under f0–f6; the PDF says "naive set-of mark prompting technique" and the quote adds an `s` (edit distance 1) |
| S117 | `mispaired` | "User awareness" locates f0 in S118's PDF (line 257), not in the WebMCP CG draft (whose anchored IDL surface is present) |
| S118 | `quote-located` | all three fragments locate in the paper PDF (f0 heading, f2 sentence, byte-exact including its line break); the register URL is only the abs landing page |
| S124 | `absent-confirmed` | neither fragment is in RFC 9110 (nor RFC 7231); fragment 0 is a §10.2.3 paraphrase, fragment 1 is the tail of S125's anchor cell with an unbalanced backtick |
| S125 | `mispaired` | both fragments locate f0 (10 and 5 hits) in S126's GitHub rate-limits page; the draft has the anchored §5.5.7 but not the quote |

Tally: 5 mispaired, 3 absent-confirmed, 1 partial-located, 1 quote-located.

## Structural finding (the one that matters beyond my slice)

**The register's quote column is spliced; the rows are not fabrications.** Six
rows carry another row's quote cell in full (S102←S103, S106←S107, S109←S110,
S110←S111, S117←S118, S125←S126) and S124 mixes its own paraphrase with the
tail of S125's anchor cell. Each foreign fragment was *located* in the
neighbour's artifact under f0/f2 — this is not inference from titles. The staged
rows and the knowledge notes attribute the same strings to the same neighbour
S-ids, so the mispairing is in the register's quote column, between the register
generator and the staged bytes.

Consequences the L1 should carry:

1. On this slice `payload-absent` is not a fabrication class; the correct action
   is quote-column re-alignment, not row refusal. The register's 194-row total
   should not be read as 194 inventions.
2. Three strings are genuinely unlocatable and need correction:
   `Add hints to your tools` (S111 — actual heading "Use annotation hints"),
   the `set-of-marks` spelling (S114 — source "set-of mark"), and
   `Retry-After can be used with a 3xx …` (S124 — a paraphrase, already found
   absent in round 27's `w1/ScoutStagedGround.md` §4.4 and still quoted in
   `merge/tabi/knowledge/redirect-and-retry-after-semantics.md` lines 20–21).
3. `merge/tabi/knowledge` is a reliable attribution source for this slice: 14 of
   19 fragments are exact substrings (16 under f0-or-f6) and every one sits under
   the correct S-id's `source:` header; the only knowledge-side defects are the
   two non-source strings it quotes (the S111 label, the S124 sentence).

## Risks / limits

- The fragments' live bytes are dated 2026-11-03; S103's footer already drifted
  (2026-10-05 → 2026-10-29), so a register row that pins a page footer can only
  be checked against an archived copy, which this seat did not fetch.
- Verdicts describe the artifact each row cites (register URL, then staged URL,
  then same-id companions). A fragment that locates only at another row's
  artifact is reported `mispaired` with the carrier named; the receipt schema
  spells this rule out so the aggregator can re-derive it.
- No anchor title was rewritten and no quote was corrected in place: the label
  defects above are recorded for the campaign's correction pass, not applied.

## Hygiene

No git/jj mutation (read-only inspection only), no pacman transaction, no tool
install (poppler/`pdftotext`, python3 stdlib and curl were already present), no
credentials or cookies sent, no write outside this seat's two owned paths.
Scratch `/fast/scratch/hyaku/tabi-r57/R57QuarA/` deleted after the receipts were
copied out; `refetch` lines plus sha256 make the bytes re-checkable.
