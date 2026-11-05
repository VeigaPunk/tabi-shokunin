# R65Scribe — draft report (tabi round 65, wave w1)

Seat: scribe (leaf, draft prose only). Base `58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`.
No lane file was edited: `corpus/` was read only, and all drafts sit in the seat directory.
No scratch clone was needed, so none was created. No tool was installed. No commit, push or
mutating git command was run. No PASS/fail verdict is written.

## Deliverables (drafts)

| Path (under `.ufo/waves/round-65/w1/R65Scribe/`) | Content |
|---|---|
| `round-65.md` | `# Round 65 — lesson`; `## Gate` (7 candidate rows; `Spot-check: pending (non-author)` left unfilled); `## Mistakes` (M1 `vacuous`, M2 `number-drift`) |
| `S170.row.md` | one 11-column registry row, S170, scope "SHA-256 digest semantics (byte identity, not provenance)", anchor from the scout's `R65Scout/fips-quote.txt` |
| `digest-binding-round-65.md` | knowledge-entry skeleton; provenance trio first (`source: S170`, `verified-at:`, `recheck:`); body states what equality proves and what it does not, with `[INFERENCE]` marks |

## Grounding notes

- S170 anchor and quotes: taken from `R65Scout/fips-quote.txt` §4 (NIST FIPS 180-4, PDF
  sha256 `0455b406…deb82`, fetched 2026-11-05). Quotes: printed p. 23 "the resulting 256-bit
  message digest of the message, M, is"; printed p. 21 "SHA-256 may be used to hash a message,
  M, having a length of l bits, where 0 <= l < 2^64." The scout states both were confirmed by
  two independent extractions. I did not re-open the PDF.
- `opened` = 2026-11-05 (scout access date). `recheck` = `on-release` (scout's caveat: NIST has
  an open revision plan for FIPS 180-4, so it is not frozen). `status` = `queued`, `used-by` = `—`
  per the assignment; the scout's `used_by_uncited` rule is satisfied by `—` for a queued row, as
  it is for existing queued rows (S021, S022).
- Registry id S170 is free: `grep -c 'S170'` in the scout run returned 0, and
  `grep -ciE 'fips|nist' corpus/SOURCES.md` returns 0.
- M1 pointers: `corpus/lessons/round-64-verifier-spotcheck.md` §2 C2 and §9-rule bullet;
  `.ufo/waves/round-64/w1/R64Reviewer.md` lines 94–109 (H5, E6c).
- M2 pointers: `corpus/lessons/round-64.md` lines 95–96 (the phrase "closed with a residual wave" /
  "w2 of 4 seats" is split across the two lines, so a literal grep for "residual wave w2" matches
  nothing; the sweep greps `w2 of 4 seats` instead).

## Findings against the assignment's cited revision

1. `40095308` is not the landed round-64 lesson. It is the "run-15 wrap-up" snapshot
   (`git log` subject: "preserve in-flight work … not a landed round"). The round-64 lesson exists
   at `e2303730` and at `58ed8c7a` (base), where the sweep commands were run. At `40095308` the lesson
   file does not contain the phrase, so the M2 sweep is written against `58ed8c7a`. Both
   `40095308` and `58ed8c7a` list only `w1` under `.ufo/waves/round-64/` (`w2` count 0).
2. The S170 row's `used-by` must later hold a path that contains the token `S170` once the L1 lands
   `corpus/knowledge/digest-binding-round-65.md`. The draft note contains `source: S170` and "S170" in
   the body, so the token check is met.

## Defects routed or left open (not mine to fix)

- Scout D1 (non-blocking): the staged round-64 filename `s170-chromium155-Input.pdl` sits in S168's
  anchor, and a staged `s170-*` file for S170 would collide with it. Name S170's staged file
  `s170-fips180-4.pdf` only with an id-aware lookup, or pick a different prefix. Not used in these drafts.
- Round-64 spot-check defects D2–D5 are outside this seat's M1/M2 scope and are not drafted here
  (D2 seat count, D3 `Mistakes` row count and table break, D4 SCORECARD mutation count, D5 S169 assembled
  quote). The round-65 lesson carries only M1 and M2 as assigned.
- M2's fix names an erratum at `.ufo/waves/round-65/w1/R65Scribe2/`. That seat's bytes are outside this
  seat's scope; I confirmed only that the directory exists.
- The `Spot-check: pending (non-author)` line is intentionally unfilled.

## Commands the main agent may run

- Sweep (M2): `git -C <LANE> ls-tree -r --name-only 58ed8c7a -- .ufo/waves/round-64/ | cut -d/ -f4 | grep -E '^w[0-9]+$' | sort -u` → expect `w1`.
- Row shape: `grep -o '|' .ufo/waves/round-65/w1/R65Scribe/S170.row.md | wc -l` → expect `12` (11 cells).
- Census (L1, after landing): `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` on the committed registry.
