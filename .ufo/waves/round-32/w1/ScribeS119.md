# ScribeS119 — round 32 w1, routed defect 3 (S119 anchor date + recheck alignment)

**Verdict.** Routed defect 3 is discharged as a draft, and every part of it is gate-clean in a throwaway clone.
RFC 9309 was re-fetched (HTTP 200, 25,265 B, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`
— byte-identical to the round-31 receipt) and its header date is **September 2022 at line 11**, with the only two
`June 2022` occurrences at lines 554 and 559 inside its RFC 9110/9111 reference entries. On that evidence I drafted
**(a)** superseding registry row **S123** (11 cells; `teaches` opens `supersedes S119 —`; used-by
`corpus/knowledge/rate-signal-decision-table.md`; `recheck 365d`), **(b)** the `## Gate` row plus the re-located span
list for `corpus/lessons/round-32.md`, and **(c)** an append-only errata section for the decision table that resolves
`recheck: 180d` against the registry's `365d` in favour of the registry and states why. Applied to a detached clone at
`4181fffb…`, the drafts pass `scripts/check-sources.mjs` (rows 123, findings 0, exit 0) and
`scripts/check-decision-table.mjs` (13/13 admitted offline; 13/13 live at round 31's baseline, exit 0) with **0 deleted
lines**. The lane checkout was not written: both lane files are byte-identical to `4181fffb` (`sha256` compared below).
Integration is the L1's; nothing here claims an axis.

## Deliverables (drafts, ready to paste; exact verified bytes)

1. **Row S123** — `S123-row.md`, marked block. Append as the last row of `## Registry` in `corpus/SOURCES.md`,
   immediately before `## Paths`. Eleven cells; no `|` inside a cell. It reuses S119's URL, which
   `scripts/check-sources.mjs:296-298` accepts only because cell 7 opens `supersedes S119 —`. Do **not** edit S119
   (SOURCES contract v1 rule 2; fleet `CORPUS.md` "Corrections are new entries, never rewrites").
2. **Gate block** — `gate-line.md`: the one table row (`| row | URL | accessed | receipt quote |`) plus the further
   located spans with word counts, and the negative sweep for `June 2022` (two hits, both reference entries).
3. **Errata section** — `errata-appendix.md`, marked block: append at the very end of
   `corpus/knowledge/rate-signal-decision-table.md`, after the round-31 errata's last bullet
   ("S119 publication month"). It states the operative value first (`Read 365d`), then the mechanism, then why the
   cadence exists; it cites `S123` (which is what makes the new row's `used-by` honest for
   `used_by_uncited`) and names the round-31 route (`corpus/lessons/round-31.md:321`) and freeze-time choice (`:60`).

## The recheck resolution (defect 3's second half)

`180d` vs `365d` — **365d governs**, for S119 and S120 both. Reasons, in the order the errata gives them:

- `recheck` is a **registry field**: the SOURCES contract defines its vocabulary and `scripts/check-sources.mjs`
  validates the cell (`bad_recheck`, E09). The entry header (line 8) is a prose restatement of four rows that no gate
  reads.
- The contract's **rule 2** permits a cadence to change only as a logged old→new row edit; no such edit was made, and
  S119/S120 have carried `365d` since they were written (round-31 lesson `:60`).
- The header keeps its round-31 bytes (`QUALITY.md` rule 4: errata are append-only blocks), so `180d` is a stale
  restatement, not a second cadence. A future change is a logged row edit, never a header edit.
- S123 carries `365d` too, so the corrected anchor cannot reintroduce the split.

## Gates (commands, exit codes, readings)

All script runs in `$HYAKU_SCRATCH/tabi-r32/ScribeS119/clone` (shared clone of the lane, detached at
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`, `status --porcelain` = 0 before edits), TMPDIR = seat scratch.
Transcripts: `verification.md`, `census-and-sources.txt`, `dt-*.json`.

| # | command | exit | reading |
|---|---|---|---|
| 1 | `curl -q -sS --proto =https -o rfc9309.txt -w 'http=%{http_code} bytes=%{size_download} url=%{url_effective}' https://www.rfc-editor.org/rfc/rfc9309.txt` | 0 | `http=200 bytes=25265`, sha256 `f633915d…b207`, UTC 2026-10-26T16:02:28Z |
| 2 | `grep -n "September 2022" rfc9309.txt` / `grep -n "June 2022" rfc9309.txt` | 0 | `11: September 2022`; `554:`/`559:` `DOI …RFC9110/9111, June 2022,` |
| 3 | `git clone --shared … ; git -C clone checkout -q --detach 4181fffb…` | 0 / 0 | toplevel = clone; HEAD = `4181fffb…` |
| 4 | `git -C clone -c user.name=ScribeS119 -c user.email=ScribeS119@scratch.local commit …` | 0 | `c6798906125d93d98571a58348f929aeda7f5598`; porcelain 0 |
| 5 | `grep -cE '^\| S[0-9]{3,} \|' corpus/SOURCES.md`; `awk -F'\|' … NF!=13` | 0 | rows 123 (122 before), malformed 0 |
| 6 | `node scripts/check-sources.mjs` | **0** | `verdict=clean rows=123 … findings=0` |
| 7 | `node scripts/check-decision-table.mjs --rev c679890… --baseline d805d1d… --entry … --json` | **1** | population 13, admitted 0, failing 13, all `r4-new-row` (baseline semantics, see F1) |
| 8 | same, `--baseline 96a2d1a3…` (round 31's baseline) | **0** | 13/13 admitted |
| 9 | same, `--baseline 96a2d1a3… --live` | **0** | 13/13 admitted, `live: true`, D1–D13 all ok |
| 10 | `git -C clone diff --numstat HEAD~1 HEAD -- corpus/SOURCES.md corpus/knowledge/rate-signal-decision-table.md` | 0 | `2 0` and `20 0` — **0 deletions** |
| 11 | `pgrep -fa 'chromedriver\|chromium' \| grep tabi-r32/ScribeS119` | 1 (no match) | 0 own processes; no browser started |

The drafts in this seat's output dir are byte-identical to the block strings the clone gates scored
(`errata_block_in_clone: True`, `row_line_in_clone: True`, `row_pipes: 12 → cells: 11`).

## Touched surfaces

**Written:** only `.ufo/waves/round-32/w1/ScribeS119/` (this directory) and the scratch clone, which was deleted
(`rm -rf`, exit 0, `scratch_absent`). **Read (lane, no writes):** `PROVINCE.md`, `.ufo/waves/round-32/claims.json`,
`.ufo/waves/round-32/baseline/README-receipts.md`, `corpus/lessons/round-31-verifier-spotcheck.md`,
`corpus/lessons/round-31.md`, `corpus/SOURCES.md`, `corpus/knowledge/rate-signal-decision-table.md`,
`corpus/QUALITY.md`, `scripts/check-sources.mjs`, `scripts/check-decision-table.mjs`, fleet
`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` and `CORPUS.md`.

**Lane files unchanged by this seat** — working bytes equal the freeze blobs:
`corpus/SOURCES.md` `ad70bbffb7dadda65848e8321620960b8504141ec46bdcd71e42a6dd5fdd9789`,
`corpus/knowledge/rate-signal-decision-table.md` `dc60f91d9c0f5883dcf0f1082138e8945a604433aa03b881caa09ec3cb594449`
(`git show 4181fffb:<path> | sha256sum` vs `sha256sum <path>` → equal=yes for both).

**Tooling:** nothing installed or upgraded; only `curl`, `git`, `node`, `grep`/`awk`/`sha256sum` already on the host.

## Findings

- **F1 (constraint, not this seat's defect) — the decision table cannot be re-measured at the round-32 baseline.**
  `r4-new-row` requires the cited row to be *absent* at `--baseline`; S119–S122 all exist at `d805d1d`, so a run with
  the round-32 baseline reads 0/13 (exit 1) however correct the entry is. Measured both ways (rows 7–8 above).
  Re-measure with a pre-round-31 baseline (`96a2d1a3…`, or `9505a10e…`), or not at all; the counter must not be cited
  as failing on the round-32 baseline.
- **F2 (minor prose defect, routed to curation).** The round-31 errata's S119-date bullet cites "`CORPUS.md` rule 2"
  for the no-edit rule; the fleet `CORPUS.md` has no numbered rule 2 that says that — the append-only corrections
  bullet is the sixth item under "Rules added from the round-1/2 corpus audits". The precise citation is
  `corpus/QUALITY.md:7` rule 4 ("Errata are append-only blocks"). The new errata section cites `QUALITY.md` rule 4, so
  the correction does not propagate the mis-citation; the old bullet keeps its bytes.
- **F3 (minor anchor precision, not re-admitted as a defect).** S119's anchor reads "five consecutive redirects at
  377-384"; the five-redirect sentence is lines **377-378** and 384-385 is the *more-than-five* sentence. S123 pins
  377-378, and no threshold changes.
- **F4 (integration note).** README/SCORECARD lines that state "sources gate clean at 122 rows" are round-31 readings
  and remain true of their round; after S123 lands the tip is 123 rows. The L1 should state the new count in the
  round-32 LOG/README rather than edit those round-31 lines.

## Out of scope / not claimed

- No claim is made for any axis; this is curation (claims.json `notClaimed` includes the adjacency route and the
  decision-table counter v2). No counter was modified; no C1/C2 measurement is asserted.
- Rows S124/S125/S126 and the round-32 lesson body belong to other seats; no assimilation was read.
- The entry's other round-31 errata bullets, the `90d` cadence for S121/S122 (the header already agrees), and the
  decision-table counter's M10 holes are untouched.

## Artifact paths (all lane-relative)

- `.ufo/waves/round-32/w1/ScribeS119/S123-row.md` — row draft + cell-by-cell table
- `.ufo/waves/round-32/w1/ScribeS119/gate-line.md` — lesson `## Gate` block, located spans, fetch record
- `.ufo/waves/round-32/w1/ScribeS119/errata-appendix.md` — append-only errata section + why this shape
- `.ufo/waves/round-32/w1/ScribeS119/receipt.md` — fetch receipt (URL, UTC, 200, 25,265 B, sha256, identity)
- `.ufo/waves/round-32/w1/ScribeS119/bytes/rfc9309.txt` — raw fetched bytes (sha256 `f633915d…b207`)
- `.ufo/waves/round-32/w1/ScribeS119/verification.md` — every command with exit code and reading
- `.ufo/waves/round-32/w1/ScribeS119/census-and-sources.txt`, `dt-baseline-round32.json`,
  `dt-baseline-round31.json`, `dt-live-baseline-round31.json`, `numstat.txt`, `sha256-drafts.txt`

**Limits.** One fetch, one host, one seat. The identity claim is byte equality with the round-31 receipt, not a
second opinion on the RFC's content; no external page was fetched beyond rfc-editor.org. The live counter leg (row 9)
made the counter's own four read-only GETs to the allowed hosts; the lane's 122→123 row count is verified only in the
clone, since the lane was not written.
