# AdjDrift02 — C1 drift-verification chunk (tabi round 36, attempt 1, wave w1)

Axis: adjacency. Milestone: C1. Assigned: 20 rows of `.ufo/waves/round-36/w1-chunks/AdjDrift02.tsv`,
independently re-derived from sibling git objects only and compared with the committed ledger
`corpus/adjacency-screen-drift.tsv`.

## Result

**20 rows, 0 mismatches — every row's derived status equals the committed ledger status.**
All 20 rows derive `unchanged`; the ledger says `unchanged` with note `-` for all 20.

Every one of the 20 rows cites `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`
(the round-35 pin) across 5 files:

| file cited | rows |
|---|---|
| `corpus/knowledge/2026-10-13-r2-frontier-prereqs.md` | 54, 59, 65, 69, 136, 144 |
| `corpus/knowledge/2026-10-13-r2-provider-capability-matrix.md` | 101 |
| `corpus/knowledge/2026-10-13-r2-skill-references-deep.md` | 71, 79, 121 |
| `corpus/knowledge/2026-10-13-r3-jq-provenance.md` | 106 |
| `corpus/knowledge/2026-10-13-r3-runtime-observation.md` | 3, 5, 6, 14, 16, 25, 61, 64, 71 |

Frozen delta head for `kaidoku` read from `.ufo/waves/round-36/baseline/c1-delta-pins.json`:
`1ed29de2cdd6061315fb2f5478d5029b7d570675`. Precondition checked: the pin is an ancestor of
that head (`merge-base --is-ancestor` exits 0), so a head comparison is a forward-only drift
test, not a cross-branch accident.

**Evidence beyond line equality:** for all 5 cited files the git blob at the pin and at the delta
head are the *same object* — `pin_head_blob_equal = yes` on 20/20 rows in `evidence.tsv`. The
`unchanged` verdict is therefore byte-identity of the whole file, not a coincidence of one line
index surviving an edit elsewhere. Stated the other way: `kaidoku`'s delta between
`49096c7e` and `1ed29de2` does not touch any of these five paths at all (`git diff --numstat`
over those paths returns 0 lines); its only relevant change is `SKILL.md`.

## Method (per row, exactly as specified)

1. `git -C …/kaidoku-shokunin show <pin>:<path>` → line `<line>`, trimmed = CITED text.
   (Line absent → `stale: pin line absent`.)
2. `git -C …/kaidoku-shokunin show <H>:<path>` (absent → `stale: head file absent`); compare
   line `<line>` trimmed: equal → `unchanged`. Else search the head file for a line whose trimmed
   text equals CITED: found at N → `moved :N`; not found → `stale`.
3. Look up the row in `corpus/adjacency-screen-drift.tsv` by `sibling_ref`; compare statuses.

The rule is not my invention: it reproduces the frozen counter's derivation statement
(`.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs:44-50` "observed status of a drift row"
and the body at `:391-415`) branch for branch — `pin file absent` → `stale`,
`pin line absent` → `stale`, `head file absent` → `stale`, `headAtN === cited` → `unchanged`,
relocation hit → `moved` (`verbatim at :N`), else `stale`. Undefined vs empty-string is kept
distinct, as in the counter (`pinText === undefined` vs `''`).

## Falsifiers run against my own derivation

1. **The derivation is not vacuously "unchanged".** Replaying the 3 relocations the claim names,
   from the pin and the delta head: `SKILL.md` 585 → **748**, 621 → **784**, 652 → **815** — the
   exact three `moved` rows in the committed ledger, whose notes read `verbatim at :748/:784/:815`.
   The same code path that reports 20 × `unchanged` reports those three as `moved` with the correct
   relocation line.
2. **Stale branches exercised** on a scratch fixture repo (`mktemp -d` inside my scratch root,
   `git rev-parse --show-toplevel` asserted equal to `$D` before any commit): `pin line absent`
   (line beyond EOF and 0-byte file), `pin file absent`, `cited text absent at head`, plus
   `moved :2`, `moved :6`, `moved :3,:4` and `unchanged`. 10/11 fixture expectations passed on the
   first run; the 11th was my expectation being wrong, not the code — see the edge note below.
3. **Two independent implementations agree.** A bash+`sed`+`awk` derivation and a Python
   exact-semantics derivation produce identical `(status, note)` for all 20 rows
   (`diff` of the two receipts is empty).
4. **Comparison target is the frozen artifact.** `git show 2e7b7a89:corpus/adjacency-screen-drift.tsv`
   and the worktree ledger hash identically (`bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2`),
   and `git diff 2e7b7a89 -- corpus/adjacency-screen-drift.tsv .ufo/waves/round-36/baseline/c1-delta-pins.json`
   is empty — so the statuses I compared against are the frozen ones, not a later local edit.
5. **Chunk sanity.** 0 duplicate `sibling_ref`s in the chunk; 0 duplicate refs in the whole ledger;
   0 chunk refs missing from the ledger; 0 rows citing a blank/whitespace-only line (cited line byte
   lengths 38–1089, i.e. every row cites real prose, so no strip-equality ambiguity applies here).

## Edge observation (semantics, not a finding)

Under the frozen strip-equality rule, a *whitespace-only* cited line that still sits at the same
index short-circuits to `unchanged` before the relocation search, and a whitespace-only cited text
would match any blank line at head. The frozen counter behaves identically (`headAtN === cited`
is tested first), so this is a property of the contract, not a defect in this derivation. No row of
this chunk is affected. Recorded so a wave-2 seat does not read it as an audit error.

## Files

| path (relative to `tabi-shokunin/`) | sha256 | what |
|---|---|---|
| `.ufo/waves/round-36/w1/AdjDrift02/receipt.tsv` | `1a4f5164dbc45db69eaa67504356525658f64e9ff5337f38416ff63ecbad69c3` | 20 rows + `# AdjDrift02: 20 rows, 0 mismatches` |
| `.ufo/waves/round-36/w1/AdjDrift02/evidence.tsv` | `b42dddd5426b8641d7b434079f89d54ce867e9587ec429f2c0743712b72b9d55` | per row: pin blob, head blob, blob-equality, cited-text sha256, cited bytes, derived status |
| `.ufo/waves/round-36/w1/AdjDrift02/derive.py` | `9d931362b8f63e9244f538b52204af30719d53fe436c2af142f22e5d3599c3e4` | exact-semantics derivation (authoritative) |
| `.ufo/waves/round-36/w1/AdjDrift02/crosscheck_bash_parity.py` | — | second (independent) implementation used for parity |
| `.ufo/waves/round-36/w1/AdjDrift02/commands.txt` | `1b8c0f56f28f236ebd697143a37d552c9c8dc6d6bee2945f53d31f261fa246f6` | exact commands, including the fixture battery |

## Risks / disclosures

- These 20 `unchanged` verdicts are anchored to delta head `1ed29de2`. If the lane freezes a later
  delta head that advances one of the five files, these rows must be re-derived; the evidence table
  names the pin and head blob ids per row so that re-derivation is mechanical.
- `changed` scope: nothing outside my seat dir and scratch was written; no sibling repo, fleet root
  file, `MANIFEST.json`, or template was touched; all git invocations were read-only (`show`,
  `rev-parse`, `cat-file`, `merge-base`, `diff --numstat`), and the only repo that received a commit
  was the throwaway fixture inside my scratch root.
- Tools installed: **none** (git, awk, sed, sha256sum, python3 were sufficient); no `pacman`
  transaction was attempted.
- Scratch `/fast/scratch/hyaku/tabi-r36/AdjDrift02` deleted before finish.

VERDICT ok — 20/20 rows re-derived from kaidoku git objects agree with the committed drift ledger; 0 mismatches, 5 cited files byte-identical pin→delta-head, and the instrument independently detects the 3 known SKILL.md relocations (585→748, 621→784, 652→815).
