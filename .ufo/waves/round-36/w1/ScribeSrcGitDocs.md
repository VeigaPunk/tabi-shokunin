# ScribeSrcGitDocs — report (tabi round 36, w1)

Seat: leaf scribe. Job: frontier source opening for C1's sourced leg (§2b.4) plus the C1 method
entry and the S142 registry draft. No measurement, no product code, no registry edit.

## Behavior

1. Read the frozen contract first (`tabi-shokunin/.ufo/waves/round-36/claims.json`, HEAD
   `2e7b7a8920bff47fae6f75c3d06e48e37767099e` = the frozen rev), then the registry header, the
   round-35 entry's front-matter shape, the drift build tool and the frozen counter's header.
2. Fetched `https://git-scm.com/docs/git-show` and `https://git-scm.com/docs/git-diff` with
   `curl -sSL`; recorded HTTP status, byte size, sha256 and a UTC access timestamp; located a
   10-word DESCRIPTION quote and a 20-word EXAMPLES quote (revision:path addressing) inside the
   fetched bytes, with line numbers and a tag-stripped presence check.
3. Confirmed S142 is the next free id (registry has 141 data rows, last is S141) and drafted the
   11-column row in the S141 style — written to the seat dir, **not** inserted.
4. Drafted the drift-audit method entry: frozen inputs, the three status classes with their
   verbatim derivations, the 3 moved rows, the empty delta pool, `source: S142`, and a DRAFT
   banner for L1 review.
5. As an independent check (read-only `git -C <sibling> show`, not a counter run), verified all
   3 `moved` notes byte-for-byte at the delta head and sampled 4 of 304 `unchanged` rows.

## Gates / evidence

| gate | result |
|---|---|
| git-show fetch | HTTP **200**, 246,608 B, sha256 `0a95cbcd8868054d851eedb192864798092c597592851989f5d1bb392730168a` |
| git-diff fetch (support) | HTTP **200**, 229,155 B, sha256 `5ae80d1deee5dc2c1acafff5491c5ba019629b9a785e6781a3e8a411cf9e22ed` |
| access timestamp | 2026-10-27T09:29:57Z (single `date -u` after both requests) |
| primary quote ≤25 words | `Shows one or more objects (blobs, trees, tags and commits).` — 10 words, git-show.html:3272, present verbatim in tag-stripped text |
| addressing quote ≤25 words | `Shows the contents of the file Documentation/README as they were current in the 10th last commit of the branch next.` — 20 words, git-show.html:5566-5571; **whitespace-normalised** (page hard-wraps it) |
| registry end | 141 rows, `S14[0-9]` = {S140, S141} → S142 free |
| freeze / ledger | lane HEAD `2e7b7a8…`; `corpus/adjacency-screen-drift.tsv` committed at HEAD, 308 lines = 307 data rows, worktree clean |
| ledger classes read | 304 `unchanged`, 3 `moved`, 0 `stale` |
| 3 moved rows verified | kaidoku `SKILL.md` 585→748, 621→784, 652→815 — pin `49096c7e…` vs head `1ed29de2…`, all **MATCH** byte-for-byte; file 1,405 → 1,568 lines (+163) |
| unchanged sample | 4/4 MATCH (chousa, kaidoku, kama, tsukuroi rows sampled at every 97th) |
| delta ledger | `corpus/adjacency-screen-delta.tsv` **absent** at HEAD; counter reads it `{ optional: true }` (c1-adjacency-sweep-v4.mjs:459) |

Counter definitions quoted in the entry were checked against the frozen file's header lines
45-48 and the build tool's lines 85-88 (both read this seat); line numbers in the entry were
corrected to match.

## Touched surfaces

- `.ufo/waves/round-36/w1/ScribeSrcGitDocs/` (only): `report.md`, `S142-row.md`,
  `adjacency-drift-audit-r36.md`, `fetch-receipts.md`.
- `.ufo/waves/round-36/w1/ScribeSrcGitDocs.md` (identical findings copy, per the Report trailer).
- `corpus/SOURCES.md`, `corpus/knowledge/`, product code: **untouched**.
- Scratch `/fast/scratch/hyaku/tabi-r36/ScribeSrcGitDocs/` removed at exit.
- Tooling: **no installs, no upgrades, no pacman** (guard respected).

## Findings (disclosed, none blocks the deliverable)

1. **Drift coverage is citing rows, not drifted lanes.** 12 lanes' heads moved, but only 9 have
   screen rows citing them: kasegi, kengaku and revenger moved with **0** rows, so their movement
   is outside the drift leg entirely (307 rows = chousa 1, kaidoku 137, kake 51, kama 9,
   kumitate 66, mado 20, mori 2, tameshi 1, tsukuroi 20). A sibling that moves *and* adds
   browser-ground text nobody screened is only reachable through the delta leg.
2. **The delta leg carries zero positive evidence this round.** The pool is empty and the delta
   screen ledger is absent; the counter's optional read makes that legitimate, but the only
   support for "no new browser-ground lines" is the claim file's `git diff` statement at freeze,
   not any row in the ledger.
3. **`<rev>:<path>` is example-grounded, not spec-grounded here.** The EXAMPLES entry demonstrates
   `next~10:Documentation/README`; the general grammar lives in gitrevisions(7), which was not
   opened. S142's `scope` cell and the entry §6 say so — the row must not be read as a syntax
   specification.
4. **The EXAMPLES quote is whitespace-normalised.** The page hard-wraps the sentence across
   `git-show.html:5568-5571`; if the L1 requires strictly verbatim bytes for `anchor`, keep only
   the 10-word DESCRIPTION line (which is verbatim).
5. **Trim-equality is the audit's real boundary.** Re-indenting reads `unchanged`; re-wrapping a
   sentence mid-line reads `stale`. The class definitions are the attack surface for wave 2, and
   `moved` verifies text identity, never meaning (the 3 kaidoku rows sit +163 lines into a
   rewritten file).

## Limits

- This seat ran **no** measurement: no `measure.sh`, no counter invocation, no predicate verdict.
  Every figure in §"Gates" is either a fetch fact, a read of a committed file at the frozen rev,
  or a read-only sibling object read. The round's verdict remains the frozen counter's.
- The unchanged verification is a 4/307 sample, not coverage.
- No subagents dispatched; no peer messages sent.

## Artifacts

- `tabi-shokunin/.ufo/waves/round-36/w1/ScribeSrcGitDocs/report.md` (this file)
- `tabi-shokunin/.ufo/waves/round-36/w1/ScribeSrcGitDocs/S142-row.md`
- `tabi-shokunin/.ufo/waves/round-36/w1/ScribeSrcGitDocs/adjacency-drift-audit-r36.md` (DRAFT)
- `tabi-shokunin/.ufo/waves/round-36/w1/ScribeSrcGitDocs/fetch-receipts.md`
- `tabi-shokunin/.ufo/waves/round-36/w1/ScribeSrcGitDocs.md` (identical findings copy)

VERDICT ok — git-show (HTTP 200, 246,608 B, sha256 `0a95cbcd…`) and git-diff (200, 229,155 B,
`5ae80d1d…`) opened and quoted this round at 2026-10-27T09:29:57Z; the ≤25-word DESCRIPTION line
"Shows one or more objects (blobs, trees, tags and commits)." (git-show.html:3272) grounds the
object addressing and the EXAMPLES entry grounds the `rev:path` read; the S142 row (mined /
180d / used-by the new entry) and the DRAFT method entry are written to the seat dir with the
registry, knowledge dir and product code untouched. Findings: drift coverage covers citing rows
only (3 drifted lanes have 0), the delta leg is empty so its evidence is absence-only, and
`<rev>:<path>` is example-grounded (gitrevisions unopened) — all disclosed in the entry. No
measurement was run by this seat.
