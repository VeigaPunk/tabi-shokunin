# ExecC1Repair — C1 operability repair (round-29, wave w1, attempt 1)

Seat: executor (leaf), item **C1**. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `/fast/scratch/hyaku/tabi-r29/ExecC1Repair` (HYAKU_SCRATCH=`/fast/scratch/hyaku`), removed at seat exit.
No tool installs or updates were needed (node v24.21.0, git, GNU patch present).
No lane tracked file, lane index, lane jj state, fleet repo or sibling lane was written. Read-only git in the lane only.

## What was repaired

Lane file digest is unchanged by this seat: `git show master:scripts/check-s106-evidence.mjs | sha256sum` = `0f5e7c474a4261653b76d3f7ec4b2575fdd5491c484bbec664e5cf9f8a21e6ff`, and the working-tree file has the same digest (lane `git diff --stat` empty; only `.ufo/waves/round-29/` untracked entries exist). All work is on the copy
`.ufo/waves/round-29/w1/build/c1/check-s106-evidence.mjs` (sha256 `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3`).

Three routed defects (round-28 spotcheck routed defects 1 and 2; `corpus/lessons/round-28-verifier-spotcheck.md:27-31,76-77`):

1. **(a) `ReferenceError: existsSync`** — `rev()` in `makeFixture` calls `existsSync(receiptPath)` (lane `:267`) but the `node:fs` import (`:38`) did not include it. Baseline reproduced verbatim, exit 1:
   `ReferenceError: existsSync is not defined at Object.rev (.../check-s106-evidence.mjs:267:9) at runSelftest (:288:22)`.
   Fix: added `existsSync` to the `node:fs` import.

2. **(b) inverted field assertion** — runner asserted `out[c.field] === false` for every case that declared `field`, which the positive case `measured-revision-bytes-match` (`valid: true`, `revision_match` true under `valid = revisionMatch && …`) could never satisfy.
   Fix: per-case `fieldValue` plus a runner assertion that the declared field's observed value equals it:
   ```js
   if (c.field) {
     if (!Object.prototype.hasOwnProperty.call(c, "fieldValue")) {
       throw new Error(`case ${c.id} declares field ${c.field} without fieldValue`);
     }
     ok = ok && out[c.field] === c.fieldValue;
   }
   ```
   Values: `measured-revision-bytes-match` → `fieldValue: true` (asserts `revision_match === true`); `measured-revision-bytes-mismatch`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid` → `fieldValue: false`. A case that declares `field` without `fieldValue` now throws instead of silently weakening. Header comment (`:8-11`) corrected from "asserts exit code AND the stable field set" to "asserts exit code, validity, and each declared field's expected value".

3. **(c) mismatch case never committed its receipt** — `build` called `d.commit()` for the prior bytes (setting `committed = true`), then rewrote the bytes and the receipt without a second commit; `rev()` skips its commit when `committed` is true, so the evaluated HEAD carried no receipt → `Refusal("receipt absent")` → exit 2 instead of the expected 1.
   Fix: one added `d.commit()` at the end of that case's `build`, after `d.receipt(fixtureReceipt({ measured_rev: measuredRev }))`. The evaluated HEAD now carries the receipt pointing at a revision whose committed bytes differ, so `revision_match` is false and the gate exits 1.

All seven case ids are preserved and no assertion was weakened: every case still checks `exit`, `valid` (when non-null), and now the exact expected field value.

## Exact commands and exit codes

Run from the copy's directory; `TMPDIR=/fast/scratch/hyaku/tabi-r29/ExecC1Repair` for every run.

| # | Command | Exit |
|---|---|---|
| 1 | lane baseline, `node scripts/check-s106-evidence.mjs --selftest` | **1** (`ReferenceError: existsSync`, no tally) |
| 2 | copy, `node check-s106-evidence.mjs --selftest` → `selftest.txt` | **0** |
| 3 | copy, `node check-s106-evidence.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev master --json` → `rev.json.txt` | **0** |
| 4 | mutant (revision comparison removed, `revision_match` forced `true`), `node mutant.mjs --selftest` → `mutation.txt` | **3** |
| 5 | second mutant (`revision_match` forced `false`), `node mutant2.mjs --selftest` → `positive-control-nonvacuous.txt` | **3** |
| 6 | `sha256sum` of lane blob vs working tree (lane unmodified) | **0**, digests equal |
| 7 | `patch -p0 <patch.diff` applied to a copy of the lane file in scratch, then `cmp` | **0**, `applied_copy_identical=yes` |

## Tallies (observed, pasted from `selftest.txt`)

```
S106_SELFTEST verdict=clean cases=7 passed=7
exit=0
```

Per-case (copy, run 2):
```
CASE id=clean-fixture-valid expected_exit=0 exit=0 valid=true PASS
CASE id=measured-revision-bytes-match expected_exit=0 exit=0 valid=true PASS
CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=1 valid=false PASS
CASE id=sha-mismatch-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=anchor-off-by-one-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=missing-bytes-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=decoded bytes absent at <rev>: corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc PASS
CASE id=missing-receipt-could-not-evaluate expected_exit=2 exit=2 valid=n/a refusal=receipt absent at <rev> PASS
```
7 distinct `id: "` entries in `CASES` (`grep -c '^    id: "'` → 7); both revision ids present; N=7 satisfies the frozen `N >= 7`.

`rev.json.txt` (run 3) at lane `master` = `190052c923c6968a3d4a292eb1330938a7cb10b4`:
`decoded_bytes=73952`, `decoded_sha256_claimed == decoded_sha256_observed = 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`, `sha_match=true`, `revision_match=true`, `anchor.line=187`, `occurrences=1`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`, **`valid=true`**, `exit=0`.

## Mutant control (not vacuous)

`mutation.diff` (also inlined):
```diff
-  const revisionMatch = measuredBytes !== null &&
-    sha256(measuredBytes) === receipt.decoded_sha256;
+  const revisionMatch = true;
```
`mutation.txt` (header line is seat-added provenance; the rest is raw program output):
```
CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL
S106_SELFTEST verdict=failed cases=7 passed=6
exit=3
```
The control is red and nonzero: a gate without the revision comparison fails `measured-revision-bytes-mismatch`. A second, opposite mutant (`revision_match` forced `false`) additionally fails `clean-fixture-valid` and `measured-revision-bytes-match` (`cases=7 passed=5`, exit=3), which shows the *positive* case is live too — the `fieldValue: true` assertion cannot pass vacuously.

## Diff summary (`patch.diff`, lane file → copy)

```
1 file changed, 7 hunks, 15 insertions(+), 4 deletions(-)
```
(machine-counted: `grep -c '^@@'` = 7, `grep -c '^+[^+]'` = 15, `grep -c '^-[^-]'` = 4)
Hunks: header comment (`:6-11`); `node:fs` import gains `existsSync` (`:37`); `fieldValue: true` on `measured-revision-bytes-match`; `fieldValue: false` on `measured-revision-bytes-mismatch` plus the added `d.commit()`; `fieldValue: false` on `sha-mismatch-invalid`; `fieldValue: false` on `anchor-off-by-one-invalid`; runner field assertion block (`:301`, 1 line → 6 lines). No case added or deleted.

## Artifacts (all under `.ufo/waves/round-29/w1/build/c1/`)

| File | sha256 | Note |
|---|---|---|
| `check-s106-evidence.mjs` | `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` | repaired copy (deliverable) |
| `patch.diff` | `ad3ab8327e4a87c10ba9bbb782090df6921df8d290de0ad52035c41428b97ad3` | 75 lines, applies with `patch -p0` to reproduce the copy byte-identically |
| `selftest.txt` | `675326b0ef95d80362d359f1efbed1ac86b00541c163bf72f55a59975115d1f7` | run 2 raw output + `exit=0` |
| `rev.json.txt` | `f4677126f57634ccb96fb7890148f9f6624609258e2d1ab5d3c3c7d5d02f538c` | run 3 JSON + `exit=0` |
| `mutation.txt` | `baf738020af84d3b47ccb536106906f835e432752166b3704d1027ff8590b569` | mutant self-test + `exit=3` |
| `mutation.diff` | `e799dd36f7a4a48dab73dbadb9993e0fbe210b62582f8acaf27c2d2b6083c810` | the single mutated hunk |
| `positive-control-nonvacuous.txt` | `befc0242e00ca602b39a6a494bd0e04eec4d051206b860bcc8100f3a79c35b5a` | forced-false mutant, `exit=3` |

## Parent/scribe actions still owed (not done by this seat)

- Land `patch.diff` into `scripts/check-s106-evidence.mjs` (or drop in the copy) — the seat may not edit lane tracked files.
- Commit the mutant receipt to the path the frozen C1 predicate names: `corpus/evidence/round-29/s106-selftest/mutation.txt` (copy of `build/c1/mutation.txt`). The predicate reads that path; without it C1 is unprovable even though the gate is green.
- Re-run both counting commands at the final REV after landing (measurement rule: clean checkout, raw output committed under `.ufo/waves/round-29/measure/`). `rev.json.txt` here was measured at `190052c`, not at the post-landing REV.
- Update the SKILL registry tally from observed output (`7 cases in CASES (not run at round-28 tip)` is now stale: `verdict=clean cases=7 passed=7` at the repaired gate).

## Risks

- `[INFERENCE]` `missing-bytes-could-not-evaluate` exercises the bytes-absent branch only; it commits a receipt with no `measured_rev`-bearing bytes, so it never reaches the revision comparison. Left unchanged (not a routed defect, and changing it would alter an existing control).
- `mutation.txt` and `positive-control-nonvacuous.txt` carry a one-line `# mutant:` provenance header above raw output; a consumer parsing the file as pure stdout must skip lines starting with `#`.
- The mutant fixture commit ids are per-run and non-reproducible (temp repos); the *verdicts* are what the receipt asserts.
- Scratch tree (`/fast/scratch/hyaku/tabi-r29/ExecC1Repair`) was removed at seat exit; every receipt it produced was copied into the output dir first.
