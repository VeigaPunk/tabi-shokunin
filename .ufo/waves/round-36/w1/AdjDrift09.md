# AdjDrift09 — C1 drift re-derivation (round 36, attempt 1, wave w1)

Scope: independently re-derive the audit status of the 20 ledger rows in
`.ufo/waves/round-36/w1-chunks/AdjDrift09.tsv` from git objects only, and compare with the
committed ledger `corpus/adjacency-screen-drift.tsv`. Read-only git throughout; no mutating
git/jj, no sibling-repo writes, no pacman.

## Inputs
- All 20 rows are `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350` (the round-35 pin), across 7 files.
- Frozen delta head for `kake` from `.ufo/waves/round-36/baseline/c1-delta-pins.json`: `437f53b1f6cd22dbf307f1187f41d1c0850a1ac2` (resolvable: `cat-file -t` = commit).
- `git -C kake-shokunin log --oneline 04404859..437f53b1` = 32 commits; `diff --stat` over `corpus/knowledge/` = 4 files added, 735 insertions, **0 deletions**.

## Method (per row)
1. `git show <pin>:<path>` -> take line `<line>`, `strip()` -> CITED.
2. `git show 437f53b1:<path>` -> line `<line>` strip-equal -> `unchanged`; else search all head lines for strip-equal CITED -> `moved :N`; else `stale`. Pin line absent -> `stale: pin line absent`; head file absent -> `stale: head file absent`.
3. Compare with the committed ledger row found by exact `sibling_ref` match.

Exact commands: `commands.txt` in this seat dir. Driver: `derive.py` (scratch, deleted at exit).

## Result: 20/20 rows agree, 0 mismatches
`receipt.tsv` — 20 rows `unchanged / unchanged / agree`, summary line `# AdjDrift09: 20 rows, 0 mismatches`.

| my-status | rows | ledger-status | agree |
|---|---|---|---|
| unchanged | 20 | unchanged (20) | 20 |
| moved | 0 | — | — |
| stale | 0 | — | — |

## Independent second witness (stronger than line equality)
For every one of the 7 cited files, the **blob at pin equals the blob at the frozen head**:

| path | blob pin | blob head | lines pin/head |
|---|---|---|---|
| corpus/knowledge/free-read-verbs.md | 0313821d7394 | 0313821d7394 | 503/503 |
| corpus/knowledge/js-rendering-queue.md | 41bb388b990a | 41bb388b990a | 78/78 |
| corpus/knowledge/kimi-subpath-audit.md | 69ea79cdeec8 | 69ea79cdeec8 | 100/100 |
| corpus/knowledge/link-preview-metadata.md | d5fb88e0dda3 | d5fb88e0dda3 | 256/256 |
| corpus/knowledge/mirror-pitfalls.md | 835a1b3cf513 | 835a1b3cf513 | 72/72 |
| corpus/knowledge/ops-automation.md | 28d5b23add8c | 28d5b23add8c | 141/141 |
| corpus/knowledge/origin-repos.md | 2e77f16ad461 | 2e77f16ad461 | 95/95 |

So `unchanged` for these 20 rows is not an artefact of line matching: the cited bytes are
identical at pin and head. Consistent with the disclosed delta pool being empty for these files.

## Degeneracy / ambiguity checks
- Each of the 20 CITED texts occurs exactly **once** (stripped) inside its pin file (`occ_in_pin=1`), none is blank/whitespace-only — so no row's `unchanged` verdict can be a blank-line or duplicate-line coincidence.
- The committed ledger has **307 data rows, no duplicate `sibling_ref`**; census `unchanged=304, moved=3` — matches the frozen claim's "3 moved rows" (all kaidoku; not in this chunk).
- The 51 `kake@0440` ledger rows are **all** `unchanged`; with the 7/7 blob-identity result above, that lane block is internally consistent.

## Instrument self-test (my derivation is not a constant "unchanged" printer)
Fixture repo under scratch (`mktemp -d -p <scratch>/tmp`, `git init -q`, toplevel asserted, all git calls `-C "$D"`), 8 cases: `unchanged` x2, `moved :4`, `moved :5`, `moved :6`, `stale`, `stale: pin line absent` x2 — **8 cases, 0 failures**. Two initial expectation errors were mine (gamma/delta really do move to 5/6 in the fixture); the derivation output was correct both times and the `want` column was corrected, not the instrument. Fixture deleted by `trap ... EXIT`.

## Evidence retained (in this seat dir)
- `receipt.tsv` — 20 derivation lines + summary.
- `commands.txt` — exact commands.
- `report.md` — this report.

## Risks / limits (disclosed, not findings)
1. **Low discrimination in this chunk.** All 20 rows are one lane (`kake`) and one status (`unchanged`); the claim's discriminator is the 3 moved kaidoku rows, which this chunk does not contain. My chunk can confirm `unchanged` rows but cannot exercise `moved` on real corpus data.
2. Line-based agreement only proves text equality; for these rows blob identity subsumes it, but a future chunk with in-place rewrites would need the same blob witness to avoid a same-content-different-line blind spot.
3. The pin `04404859` is a round-35 pin whose lane head has since advanced 32 commits; verification is against the **frozen** head `437f53b1`, not live `main`.
4. Tooling: nothing installed or upgraded (git 2.x, python3, awk already present); pacman never invoked.

## Blockers
None.

VERDICT ok — 20/20 rows re-derived from git objects, all `unchanged`, all agree with the committed ledger `corpus/adjacency-screen-drift.tsv` (0 mismatches); corroborated by pin==head blob identity for all 7 cited files, and the derivation instrument self-tested across unchanged/moved/stale branches (8/8).
