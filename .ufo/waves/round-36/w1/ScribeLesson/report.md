# ScribeLesson — round 36, wave w1 (tabi) — report

Seat: `ScribeLesson` (scribe, leaf). Assignment: draft the round-36 lesson skeleton at
`.ufo/waves/round-36/w1/ScribeLesson/round-36-draft.md`, copying the shape of `corpus/lessons/round-35.md`
(opening claims paragraph, `## Gate` with the S-row table, gate decisions, `## Mistakes`, errata), using the frozen
contract `2e7b7a8920bff47fae6f75c3d06e48e37767099e`.

## Behavior (what was produced)

`round-36-draft.md` — 158 lines, five `##` sections plus the header, marked DRAFT SKELETON:

| section | contents | provenance |
|---|---|---|
| header | claims paragraph for C1 + C2, with the freeze, the round-start tip `11c64b96…`, the prior closure (round-35 `rejected-honest-stop`), the frozen predicates quoted verbatim for both claims | `claims.json` (read whole) + `corpus/lessons/round-35-verifier-spotcheck.md:1-20` |
| `## Gate` | ONE row, S142 (git-show), with accessed / HTTP 200 / 246,608 B / sha256 / 10-word quote / `:3272`; the additional 20-word EXAMPLES quote with its whitespace-normalisation caveat; the row's own recorded limits; git-diff as a kept-not-registered decision; registry log line; `Assimilation: PENDING`; freeze-byte check | `w1/ScribeSrcGitDocs/S142-row.md`, `w1/ScribeSrcGitDocs/fetch-receipts.md` (both read), transcribed — not re-fetched by this seat |
| `## C1 gate decisions — wave 1` | the six frozen controls with exits and readings; chunk-seat, delta-leg and moved-row bullets marked PENDING | `claims.json` `controls` + `.ufo/waves/round-36/baseline/c1-J*.json`/`.provenance` |
| `## C2 gate decisions — wave 1` | the seven frozen controls (J0–J6) with exits and readings; live re-measurement and carried-limit bullets PENDING | `claims.json` `controls` + `baseline/c2-J*` |
| `## Mistakes` | M1, class `hand-copied-constant`, with evidence, `captured-by: none`, fix, and two artifact notes for the judge | assignment (operator ground truth) + reads below |
| `## Errata intake (round-35 closure routed defects)` | the four round-35 closure routed defects from `priorClosure`, each with `Disposition: PENDING` | `claims.json` `priorClosure` |

Every cell that needs wave-1 data or an L1 decision is literally `PENDING`; nothing was invented to fill a gap.

## Gates and reads (all read-only; no measurement run by this seat)

| read | result |
|---|---|
| `sha256` of the six frozen files + both gate scripts vs `claims.json` `frozenDigests` | 8/8 equal (`8a223faf…`, `15910c59…`, `27dba3ea…`, `6a652aca…`, `c8153a5a…`, `81019362…`, `4e2c2a64…`, `370e8e95…`) |
| `git show 2e7b7a8:corpus/adjacency-screen-drift.tsv` | 308 lines = header + **307** rows; statuses **304 unchanged / 3 moved / 0 stale** |
| the three `moved` notes vs kaidoku SKILL.md at delta head `1ed29de2…` | 585→748, 621→784, 652→815 all **verbatim equal** (node read of both blobs) |
| `git show 2e7b7a8:.ufo/waves/round-36/baseline/c1-delta-candidates.tsv` | **1 byte (a newline)** — delta pool empty, as claimed |
| `w1-chunks/AdjDrift*.tsv` | 16 files, 307 rows; ref set **identical** to the ledger's 307 refs (`diff -q` → identical) |
| `PINS` block of `c1-adjacency-sweep-v4.mjs` | 20 lanes, all **40 hex**, each `rev-parse --verify -q <pin>^{commit}` → **ok** at its lane repo |
| `PINS` vs `.ufo/waves/round-35/baseline/c1-pins.json` | key-for-key **identical** (20/20) |
| source read of `c1-adjacency-sweep-v4.mjs:126-131` (`resolveCommit`) | `^[0-9a-f]{40}$` guard throws `Refusal` before `rev-parse` |
| `git -C kama-shokunin rev-parse --verify -q <39-hex prefix>` | **exit 0**, prints the full sha (see F2) |
| counter headers | `c1-adjacency-sweep-v4.mjs:64` and `c2-firefox-bidi-v2.mjs:54` carry the predicate sentences |
| `corpus/SOURCES.md` | 141 registered rows, last `S141` — `S142` is next free |
| `corpus/adjacency-screen-delta.tsv` at `2e7b7a8` | **absent** (see F3) |

Counters were **not executed** by this seat; no `measure.sh` run, no live Firefox session. Nothing here is a
measurement, so `claims.json`'s predicates remain un-evaluated by this seat.

## Touched surfaces

- Written: `.ufo/waves/round-36/w1/ScribeLesson/round-36-draft.md`, `.ufo/waves/round-36/w1/ScribeLesson/report.md`.
- Scratch: `/fast/scratch/hyaku/tabi-r36/ScribeLesson/` (two ref-set files used for the chunk-vs-ledger diff),
  deleted before yield.
- Nothing else: no lane commit, no `corpus/SOURCES.md` edit, no sibling-repo write, no fleet-root file, no
  `~/.local/bin` write, no installs or upgrades. Tooling used as installed: node v24.21.0, git 2.56.0,
  Python 3.14.8 — no tool was installed, upgraded or pinned this seat.
- No mutating git/jj command was run anywhere; all git calls were `show`/`rev-parse`/`log`/`cat-file -e`/`status`
  reads, each with `-C <repo>`.

## Out of scope (untouched by design)

- The S142 row's registry insertion, the knowledge entry `adjacency-drift-audit-r36.md`, and every wave-1 gate
  decision — L1's.
- Wave-2 mistake rows M2+ and the errata dispositions — PENDING markers left in the draft.
- Any re-measurement of C1/C2, any re-fetch of the S142 page, any judge/critic role.

## Findings (for the judge and the L1)

- **F1 — the M1 fix is not visible in the frozen bytes.** The assignment records the fix as "constants extracted
  programmatically (the pins file became the single source)". The frozen counter still carries a literal
  `const PINS = Object.freeze({…})` whose 20 values are key-for-key identical to
  `.ufo/waves/round-35/baseline/c1-pins.json`. Reported as a discrepancy, not corrected: the extraction step is
  invisible in the artifact, while the observable properties (20/20 well-formed, 20/20 resolving) hold.
- **F2 — what actually catches a truncated pin is the length guard, not the object lookup.**
  `git rev-parse --verify -q` accepts a 39-hex prefix (exit 0, full sha printed), so without
  `c1-adjacency-sweep-v4.mjs:127`'s `^[0-9a-f]{40}$` a one-character truncation would have resolved to the intended
  commit silently and `hand-copied-constant` would have passed unnoticed. This strengthens M1 rather than contradicting
  it, and is recorded in M1's judge note.
- **F3 — the counter names a delta screen ledger the freeze does not ship.** `c1-adjacency-sweep-v4.mjs:83`
  (`DELTA_SCREEN = 'corpus/adjacency-screen-delta.tsv'`) and its header (lines 17-19, 58) describe a delta ledger;
  `git cat-file -e 2e7b7a8:corpus/adjacency-screen-delta.tsv` → absent, and `claims.json`'s C1 surface sentence does
  not name the file. With `delta.total` 0 there is no row to carry and `c1-J5` passes, so no predicate breaks; the gap
  is a contract-surface gap for the judge, flagged in the draft's delta-leg bullet rather than patched.
- **F4 — seat-spec path conflict.** The item body's milestone line says `Report: …/w1/ScribeLesson.md` (outside the
  seat dir, which the write-scope rule forbids) while the item's `Report:` trailer says
  `…/w1/ScribeLesson/report.md`. The trailer was used; this file is the report.
- **F5 — the S142 row landed mid-task.** At 06:31 the seat dir existed but was empty (the row was `PENDING` in the
  first pass of this draft); by 06:32 `S142-row.md`, `fetch-receipts.md` and the knowledge-entry draft were present and
  the Gate row was filled from them. The two row quotes are transcriptions of that seat's receipt; this seat did not
  re-fetch, so the row's bytes/quote/location stay the seat's evidence and the re-fetch remains an integration or
  wave-2 check.

## Artifact paths

- Draft: `tabi-shokunin/.ufo/waves/round-36/w1/ScribeLesson/round-36-draft.md`
- Report: `tabi-shokunin/.ufo/waves/round-36/w1/ScribeLesson/report.md`
- Referenced evidence: `.ufo/waves/round-36/claims.json`; `.ufo/waves/round-36/baseline/c1-J*`, `c2-J*`;
  `corpus/adjacency-screen-drift.tsv` @ `2e7b7a8`; `w1-chunks/AdjDrift*.tsv`;
  `w1/ScribeSrcGitDocs/{S142-row.md,fetch-receipts.md,adjacency-drift-audit-r36.md}`;
  `corpus/lessons/round-35.md`, `corpus/lessons/round-35-verifier-spotcheck.md`.

VERDICT ok — round-36 lesson skeleton drafted with the claims paragraph, the single S142 Gate row (transcribed from
ScribeSrcGitDocs, all evidence cells filled), both control tables, M1 (`hand-copied-constant`, captured-by none) and
the errata-intake placeholder; every cell needing wave-1 data is marked PENDING. No measurement, no counter run, no
lane write outside the seat dir. Findings F1–F5 above, none blocking.
