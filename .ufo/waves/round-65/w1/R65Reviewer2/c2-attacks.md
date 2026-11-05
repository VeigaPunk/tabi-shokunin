# R65Reviewer2 — C2 attacks (receipt-provenance gate v2, matrix binding)

Reviewer deliverable · base 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162 · frozen run verified against
commit 4a3481048cb3afd0d6068fdbc1421dfec4f06084. Attack target:
`.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs`
(= wave copy `.ufo/waves/round-65/w1/R65Executor2/check-receipt-provenance-v2.mjs`, sha256
e947dabd65a016153126cb46ea33b13ce0126597861aa78c4a0905a89151ebe9; the frozen counters copy adds
only a PREDICATE-SENTENCE header line, sha 81c8a5ec…, selftest also 12/12 clean).
Attacks ran under /fast/scratch/hyaku/tabi-r65/R65Reviewer2/clone (deleted at yield; commands below
are reproducible in any clone of the lane).

Frozen predicate verified against code at lines 82-93: `fmtOk` → resolve `input.path`
(absolute as-is; relative first `<repo>/<rel>`, then `<matrixdir>/<rel>`) → first candidate that is a
regular file → sha256(file) must equal the pinned 64-hex sha. Failures keep check `matrix-input`
(details `input absent: <path>` / `input digest mismatch`). v1 CHECK_IDS, receipt checks, `readAt`,
CLI, exit codes unchanged (diff vs base: header, checkMatrix signature+body, evaluate pass-through,
selftest matrix cases). Non-author judgment: matches the C2 predicate sentence; binding is tree-read
(never `git show <rev>`) — consistent with v1's `readAt` worktree fallthrough and declared.

## Under-refusal attacks (v2 exit 1 in all six; v1 column shows the false green where present)

| id | fixture | command (relative to a clone ROOT; DIR=path to fixture) | v1 exit | v2 exit | v2 matrix-input finding | expected | verdict |
|----|---------|----------|----|----|---------|----------|---------|
| 2k1 | `attack-C2/relative-miss/matrix.json`: input `{path:"../../.ufo/waves/round-64/controls/scored/smoke/receipt.json", sha: 4e3a…a86f}` (true digest of the committed receipt — but `repo+rel` = clone/…/clone/…/w1/.ufo/…: both candidates miss) | `node <v2> --dir $DIR --repo $CLONE --rev e3f52156… --require-committed --min-receipts 1 --json` | 0 (accepted) | 1 | `input absent: ../../.ufo/…/receipt.json` | refused | killed-by-counter |
| 2k2 | `attack-C2/escape/matrix.json`: `path:"../../../indeed-escape/receipt.json"` (repo+rel = `$HYAKU/indeed-escape/…` outside the repo) | same | 1 (matrix-command only) | 1 | `input absent: ../../../indeed-escape/receipt.json` | refused (absent) | killed (both candidates miss; escape outside repo is refused on absence, not provenance) |
| 2k3 | `attack-C2/upper-hx/matrix.json`: same rel path as k9 hit, pin `4E3A…A86F` (uppercase of true digest); selfconsistent `matrix.command.json` | same | 1 | 1 | `no input path+sha256` | refused | killed — refused by the pre-existing lowercase-HEX64 format gate (v1-equivalent finding, not the new digest compare; nit R-1) |
| 2k3b | same dir, second matrix `matrix-lower.json`: lowercase `000…000` pin, existing file | same (min-receipts 2) | — | 1 | `input digest mismatch` (2 matrix-input total: 1 k3 + 1 k3b) | refused | killed-by-counter (decisive proofof digest compare) |
| 2k4b | `attack-C2/symlink-wrong/matrix.json`: absolute `input-link` → `other.json`, other sha 23d9…b787c, pin 000…000 | same | 0 (accepted, false green) | 1 | `input digest mismatch` | refused | killed-by-counter |
| 2k5 | `attack-C2/isdir/matrix.json`: absolute path → directory `dir-as-input/` | same | 1 (matrix-command only) | 1 | `input absent: …/dir-as-input` | refused | killed — directory is refused through the `statSync(c).isFile()` gate (a dir never counts as a hit) |
| 2k6 | `attack-C2/onlymatrixdir/matrix.json`: absolute dead path `…/onlymatrixdir/nav.json` | same | 1 | 1 | `input absent: …/nav.json` | refused | killed-by-counter |
| 1k3 (variant) | `attack-C2/matrix-only/matrix.json`: absolute dead path, min-receipts 0 | `cd $CLONE && node <v2> --dir $DIR --repo . --rev 58ed8c7a… --require-committed --min-receipts 0 --json` | — | 1 | `input absent: /nonexistent-probe-for-absolute/dead.json` | refused | killed — cwd-relative `--repo .` keeps refusing |

`2k3` detail nit R-1: refusal text is `no input path+sha256` rather than a digest-mismatch line
because `HEX64` (lowercase-only) fails first in `fmtOk`. Exit code and check id are correct; the
uppercase form cannot reach the digest compare. Not a hole.

## Over-refusal attacks (all v2 exit 0)

| id | fixture | command | v2 exit | expected | verdict |
|----|---------|---------|----|----------|---------|
| OR-1 | Executor2 official `r65/w1/R65Executor2/c1-honest/` (matrix-honest.json names honest-240.command.json by ABSOLUTE lane path, pin c6ab… ) | `node <v2> --dir /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/w1/R65Executor2/c1-honest --repo $CLONE --rev 58ed8c7a… --require-committed --min-receipts 1 --json` | 0 (checked 2, matrices 1, failures 0) | admit | killed — no over-refusal of the honest fixture |
| OR-2A | `attack-C2/symlink/matrix.json`: absolute path through a symlink whose target content digest = pin; receipts self-consistent | `node <v2> --dir $DIR --repo $CLONE --rev e3f52156… --require-committed --min-receipts 1 --json` | 0 | admit | killed — symlink NOT refused: v2 reads through symlinks (like v1's fs.readFileSync) |
| OR-3 | `attack-C2/relative-miss/matrix.json` rewritten to repo-relative pin `".ufo/waves/round-64/controls/scored/smoke/receipt.json"` (true sha; repo-first hit) | same | 0 (with a correct matrix.command.json) | admit | killed — repo-first resolution accepted an honest relative pin |
| OR-4 | real r64 scored population `.ufo/waves/round-64/controls/scored/` (15 receipts, 2 matrices) | `rev e3f52156…`, `--repo $CLONE` and (re-check) `--repo /home/vgpnk/Projects/shokunin/tabi-shokunin`: both exit 0, checked 15, failures 0 | 0 | admit | killed — no regression on the v1-admitted population |
| OR-6B | my mirror of OR-1 with `input.path` rewritten repo-relative `c1-honest/honest-240.command.json` (fixture dir set at a clone-root sibling, pin unchanged) | `node <v2> --dir <that> --repo $CLONE --rev 58ed8c7a… --require-committed --min-receipts 1 --json` | 0 | admit | killed — repo-first relative pin accepted |
| OR-6 (dual) | the same fixture with `--repo /home/vgpnk/Projects/shokunin/tabi-shokunin` (OR-1's real pin) | | 0 | admit | |

## Frozen-copy cross-checks (post-freeze commit 4a348104…)
- Frozen counters run on the untouched lane `c1-fab`: exit 1, byCheck `{matrix-input: 3}` —
  `matrix-fab1.json` absent, `matrix-fab2.json` digest mismatch, plus `fab-selector-matrix.json`
  digest mismatch (the 3rd matrix was added to the lane c1-fab dir after the fixture was recorded by
  Executor2, which saw only fab1+fab2: residual nit R-2, not a defect in v2 itself).
- Frozen counters on frozen controls: r64 scored exit 0 checked 15 failures 0; c1-honest exit 0
  checked 2 matrices 1 failures 0. Positive controls stay green on the frozen copy.

## Findings (defects, ranked)
- R-1 (nit): uppercase-hex pin refused via `no input path+sha256` not `input digest mismatch`
  (v2 …:82-84, `fmtOk` / `HEX64` gate; list-tail-only consequences: text is v1-identical). Behavior safe.
- R-2 (residual, cross-check only): lane `c1-fab` now holds a third matrix `fab-selector-matrix.json`
  (`cccc…` pin) that Executor2's wave-run receipt did not see. Frozen-copy count is 3 `matrix-input`
  findings, wave record says 2. The claim text's kill rule says "exactly the two `matrix-input`
  findings." The L1 must either drop `fab-selector-matrix.json` from c1-fab or re-pin the
  slide-serif detail to 3 at freeze. Verdict on the CHECK itself: digests right, ruling is a prose/fixture-mismatch.
- R-3 (design non-defect): v2 binding is tree-read only (never `git show <REV>`), so a committed
  REV whose working tree has since changed is bound against the tree, not the rev. Same semantics as
  v1's `readAt` fallthrough (line 29-30) — declared, not a v2 regression. A committed pin at an
  older REV whose tree-sha has moved since will be bound to the CURRENT file bytes. Scored pass
  unaffected because the L1 runs at the freeze tip.

## Attack ownership
- 2k1-2k6, 1k3, OR-1, OR-2A, OR-3, OR-4, OR-6B: reviewed and ran in this reviewer's scratch (v1
  differential where relevant). Attack table is self-contained; my lane dir
  `.ufo/waves/round-65/w1/R65Reviewer2/` holds only its own deliverable.
- No lane writes besides this report and my deliverable dir. No git mutation anywhere. No pacman.
