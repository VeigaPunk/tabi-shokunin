# MutC1Baseline — mutation baseline for the s106 gate (tabi round-29 w1, C1/operability)

Seat: MutC1Baseline (leaf mutation tester) · 2026-10-26 · Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only throughout)
Item: mutation baseline for the s106 gate — import-fixed scratch copy, `--selftest` per-case results, then four `evaluate()` mutants with kill attribution. Report tables carry exit codes.

## 0. Revision pinning (concurrent-wave note)

The item was authored against baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`, where the gate crashes (`ReferenceError: existsSync is not defined`, claims C1 "before"). While I ran, the lane tip advanced (sibling commits, not mine):

- `59e8167aa5a4399e4115e7253fa0bab5e8dd773d` — "round-29: C1 repair s106 self-test (+mutation receipt), C2 doc-bound corrections, round-29 gate registry rows"
- `35045d7d9f6cf0bbdc4c734881ab77b48deedb81` — "round-29: LOG entry with doc-bound correction of LOG.md:221" (gate script diff vs `59e8167`: 0 lines)

I therefore pinned and tested **both** bases, extracted with `git show` into scratch (never the worktree):

| base | source | sha256 | lines |
|---|---|---|---|
| `baseline-raw.mjs` | `git show 856fa9e:scripts/check-s106-evidence.mjs` | `0f5e7c474a4261653b76d3f7ec4b2575fdd5491c484bbec664e5cf9f8a21e6ff` | 367 |
| `baseline-fixed.mjs` | baseline-raw + **only** the existsSync import fix | `277c7f15bfa348b343a241e3347c9d29580b7a8a344bbd38ead09795732f5c1d` (pre-mutation) | 367 |
| `tip.mjs` | `git show 59e8167:scripts/check-s106-evidence.mjs` | `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` | 378 |

`tip.mjs` bytes == the worktree file at `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs` (same sha256, verified twice, start and end of the run). The `856fa9e → 59e8167` diff for this file is exactly the three routed repairs: (1) `existsSync` added to the `node:fs` import; (2) runner field assertion `out[c.field] === false` → `out[c.field] === c.fieldValue` with `fieldValue` declared on the four field cases; (3) `measured-revision-bytes-mismatch` build now commits the receipt (`d.commit()` after `d.receipt(...)`). `evaluate()` is byte-identical between the two versions, so the same mutation edits apply to both.

## 1. Method

- All work in `$HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r29/MutC1Baseline/`; every `node` run passed `TMPDIR=$S/tmp` explicitly (fixtures `mkdtemp` under it; self-test removes its own trees).
- Detector: `node <copy>.mjs --selftest` — the gate's own 7-case self-test (declared exits: 0 clean / 3 failed; crash = node's uncaught-exception exit 1).
- Mutations applied with the edit tool to scratch copies only; two forms per term for completeness:
  - **drop**: term removed from the `valid` conjunction (field stays honestly computed);
  - **force-true**: term's check replaced by `true` (the form the lane's own committed mutant used for revision).
- Kill attribution is per-case: a case **kills** a mutant iff it PASSes on that base's pristine run and FAILs on the mutant run. Overall exit alone is meaningless on the red baseline (already exit 3) and on any mutant of it.
- No lane tracked file, index, or jj state touched; git in the lane strictly read-only (`rev-parse`, `log`, `status`, `show`, `diff`, `ls-tree`).

## 2. Pristine runs

| base | command | tally | exit |
|---|---|---|---|
| baseline-raw (no fix) | `node $S/baseline-raw.mjs --selftest` | crash: `ReferenceError: existsSync is not defined` at `baseline-raw.mjs:267` (in `rev()`) | **1** |
| baseline-fixed (import only) | `node $S/baseline-fixed.mjs --selftest` | `S106_SELFTEST verdict=failed cases=7 passed=5` | **3** |
| tip (repaired) | `node $S/tip.mjs --selftest` | `S106_SELFTEST verdict=clean cases=7 passed=7` | **0** |

The unfixed crash reproduces claims C1 "before" exactly (ReferenceError at :267, exit 1). With only the import fixed, the round-28 gate is red-but-declared (exit 3), not crashing.

## 3. Baseline (856fa9e + import fix) — per-case results

| case | expected exit | observed exit | valid | verdict | reason |
|---|---|---|---|---|---|
| clean-fixture-valid | 0 | 0 | true | PASS | — |
| measured-revision-bytes-match | 0 | 0 | true | **FAIL** | runner defect: baseline runner asserts `out[c.field] === false`; actual `revision_match === true`. Exit and validity are correct; only the inverted field assertion fails. |
| measured-revision-bytes-mismatch | 1 | 2 | n/a | **FAIL** | fixture defect: `refusal=receipt absent at d197ab3e…`. Build commits the measured-rev bytes, then writes the receipt **without committing**; `rev()` skips its commit because `committed` is already true, so evaluated HEAD has no receipt → Refusal → exit 2, not 1. |
| sha-mismatch-invalid | 1 | 1 | false | PASS | — |
| anchor-off-by-one-invalid | 1 | 1 | false | PASS | — |
| missing-bytes-could-not-evaluate | 2 | 2 | n/a | PASS | — |
| missing-receipt-could-not-evaluate | 2 | 2 | n/a | PASS | — |

Both failures are exactly the two routed defects recorded in `corpus/lessons/round-28-verifier-spotcheck.md:27-29` (runner line 301 inversion; mismatch case never commits its receipt) — now confirmed by execution, not just static reading.

## 4. Tip (59e8167 bytes) — per-case results

All 7 cases PASS: `verdict=clean cases=7 passed=7`, exit 0. The C1 self-test predicate's tally form (`cases=N passed=N`, N=7 ≥ 7, both revision case ids present) holds on these bytes.

## 5. Kill matrix — 16 mutant runs

Mutant edits (all inside `evaluate()`; `valid` line at tip:128 / baseline:127):

| id | form | edit |
|---|---|---|
| M1 / M1b | drop / force-true | sha term: removed from `valid` / `const shaMatch = true;` |
| M2 / M2b | drop / force-true | anchor uniqueness: removed from `valid` / `const anchorUnique = true;` |
| M3 / M3b | drop / force-true | byte count: removed from `valid` / `const byteCountMatch = true;` |
| M4 / M4b | drop / force-true | revision comparison: removed from `valid` / `const revisionMatch = true;` |

### On tip (repaired gate; pristine = 7/7, exit 0)

| mutant | tally | exit | verdict | killer case(es) |
|---|---|---|---|---|
| M1 drop-sha | clean cases=7 passed=7 | 0 | **SURVIVED** | none |
| M1b sha-force-true | failed cases=7 passed=6 | 3 | **KILLED** | `sha-mismatch-invalid` (exit 1/valid false still match; field `sha_match === true` ≠ expected false — killed via the field assertion only) |
| M2 drop-anchor-unique | clean cases=7 passed=7 | 0 | **SURVIVED** | none |
| M2b anchor-unique-force-true | clean cases=7 passed=7 | 0 | **SURVIVED** | none |
| M3 drop-byte-count | clean cases=7 passed=7 | 0 | **SURVIVED** | none |
| M3b byte-count-force-true | clean cases=7 passed=7 | 0 | **SURVIVED** | none |
| M4 drop-revision | failed cases=7 passed=6 | 3 | **KILLED** | `measured-revision-bytes-mismatch` (observed exit 0, valid true vs expected 1/false) |
| M4b revision-force-true | failed cases=7 passed=6 | 3 | **KILLED** | `measured-revision-bytes-mismatch` (identical observable) |

### On baseline-fixed (round-28 red gate; pristine = 5/7, exit 3)

| mutant | tally | exit | verdict | killer case(es) |
|---|---|---|---|---|
| M1 drop-sha | failed cases=7 passed=5 | 3 | **SURVIVED** | none (per-case output identical to pristine) |
| M1b sha-force-true | failed cases=7 passed=4 | 3 | **KILLED** | `sha-mismatch-invalid` (new FAIL: field `sha_match === true` vs baseline runner's `=== false` assertion) |
| M2 drop-anchor-unique | failed cases=7 passed=5 | 3 | **SURVIVED** | none |
| M2b anchor-unique-force-true | failed cases=7 passed=5 | 3 | **SURVIVED** | none |
| M3 drop-byte-count | failed cases=7 passed=5 | 3 | **SURVIVED** | none |
| M3b byte-count-force-true | failed cases=7 passed=5 | 3 | **SURVIVED** | none |
| M4 drop-revision | failed cases=7 passed=5 | 3 | **SURVIVED** | none (mismatch case already fails for the fixture reason; removing the revision term changes nothing observable) |
| M4b revision-force-true | failed cases=7 passed=5 | 3 | **SURVIVED** | none |

Survivor runs printed per-case lines identical to their base's pristine run (only the per-run mkdtemp commit ids inside refusal messages vary, as expected for fresh fixtures).

## 6. Findings (coverage, not contract changes)

1. **Anchor-uniqueness mutant survives in both forms on both bases.** No fixture in CASES ever produces a duplicated anchor line (`occurrences ≥ 2`); `anchor_unique` is asserted nowhere. The gate header claims the round-26 freeze "also checks anchor uniqueness", but the round-28 case set gives that term zero kill coverage. A `duplicate-anchor-invalid` fixture (e.g. repeat `FIXTURE_LINE` in the tail) would kill both forms.
2. **Byte-count mutant survives in both forms on both bases.** The only byte-differing fixture (`sha-mismatch-invalid`, `// tail` → `// tampered`, +4 bytes) is already rejected by the sha term, so `byte_count_match` is sha-masked in every existing case. Its independent power — a receipt whose `decoded_bytes` disagrees with otherwise-intact bytes (receipt-internal inconsistency) — is exercised by no case.
3. **The sha term's verdict power is masked too.** Dropping sha from `valid` survives because byte count still rejects the tampered fixture. A same-length tamper (e.g. `// tail` → `// tgil`) would be needed to kill the sha-drop mutant via the verdict; today a forced-true sha is caught only by the field assertion. Net: of the five `valid` terms, only `revision_match` and (via field assertion) `sha_match` are kill-covered; `anchor_located` is covered (`anchor-off-by-one-invalid`); `anchor_unique` and `byte_count_match` are not.
4. **On the round-28 red gate, mutation testing by exit code is blind.** Every asked mutant (M1, M2, M3, M4, and force-true M2/M3/M4) leaves the run at 5/7 exit 3 with byte-identical per-case output — the redness is fully pre-explained by the two broken revision cases. Kill attribution must be per-case flip; only the field-visible sha-force-true mutant flips anything (the baseline runner's `=== false` assertion can only see fields that become true, never verdict-only lies).
5. **Committed receipt cross-check (C1 predicate input).** `corpus/evidence/round-29/s106-selftest/mutation.txt` (committed at `59e8167`) shows the revision-comparison-removed mutant at `failed cases=7 passed=6`, exit 3, with `measured-revision-bytes-mismatch` FAIL (exit 0, valid true). My independent M4b run reproduces this exactly, and my M4 (drop form) produces the same observable failure — the lane's mutation receipt is corroborated, and it is the single case that kills revision mutants. Their `mutation.diff` also pins `LANE` to the absolute lane path; that is harness-only (self-test evaluates fixture repos, never `LANE`), no behavioral effect on `--selftest`.

## 7. Hash ledger (before → after per scratch file)

| file | pre-mutation sha256 | post-mutation sha256 |
|---|---|---|
| baseline-raw.mjs | — (extracted) | `0f5e7c474a4261653b76d3f7ec4b2575fdd5491c484bbec664e5cf9f8a21e6ff` |
| baseline-fixed.mjs | `277c7f15bfa348b343a241e3347c9d29580b7a8a344bbd38ead09795732f5c1d` | — (pristine detector) |
| tip.mjs | — (extracted) | `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` |
| m1-drop-sha.mjs | `1a01256e…` (tip) | `4a187fbed53879eea510582847e1570e83a95f1cd479402ee219ce86afdac149` |
| m1b-sha-force-true.mjs | `1a01256e…` (tip) | `bb415f7a8e7cb7c0fd55c0019f5f1cc362ca5b2c50f82776f8092c60e7d498ae` |
| m2-drop-anchor-unique.mjs | `1a01256e…` (tip) | `edad1eaef0c3faf4b7de552595ced416cf3b8a8ea68d810a1d7c6391552ebce2` |
| m3-drop-byte-count.mjs | `1a01256e…` (tip) | `1343db2d7a52b5728dd30d1caa996865c65841ca5f185d323e6ccbe398c98e24` |
| m4-drop-revision.mjs | `1a01256e…` (tip) | `f2dd4e416a787a01d9cbeb5f681db11ad90dd2cb6b2a1986ee0b34065ed45510` |
| m2b-anchor-unique-force-true.mjs | `1a01256e…` (tip) | `08a2b56280689bc5d78f2fe6055aed416e7d05c933e952373da1ee67ba7195c2` |
| m3b-byte-count-force-true.mjs | `1a01256e…` (tip) | `7897809300869bb451fceac1ee26f6087f553566ecc4cae57b24154819b2b9f9` |
| m4b-revision-force-true.mjs | `1a01256e…` (tip) | `89d6929ac88d635375885ec283000ba96b8933d026513eab67faab9c3ac7fe23` |
| b-m1-drop-sha.mjs | `277c7f15…` (baseline-fixed) | `bf573743576a48242155ff432b809c0c63b4293f0b4cf2e257268c3f5543fb30` |
| b-m1b-sha-force-true.mjs | `277c7f15…` | `799608eb0114edffebb9de83311451d0cce7bfd48cd6ceb47f4777bbcffcfba3` |
| b-m2-drop-anchor-unique.mjs | `277c7f15…` | `6bde990dd01103377036034626cdbfbbfadf3fa561c4474099f2c4d554ae5bb4` |
| b-m3-drop-byte-count.mjs | `277c7f15…` | `eae620766b4499039ac82e8bb2230ab34af0ef1868aaa27dc927234d49ae0b64` |
| b-m4-drop-revision.mjs | `277c7f15…` | `4bb80e80dcc5d8a70c77bfd19af23a0cc1618f28074ef4637b2360979293ce8d` |
| b-m2b-anchor-unique-force-true.mjs | `277c7f15…` | `83f883752af73fa3dd6c531bccfdf6f61b6ed300bb1bc585a0b9442870b3f1bc` |
| b-m3b-byte-count-force-true.mjs | `277c7f15…` | `1ab3f6cf519a6844723f14f4c72931f9ecb94f566f10a1e96169527ad83f2f4a` |
| b-m4b-revision-force-true.mjs | `277c7f15…` | `ff8b013e057f72a39a524231f04b45b2db309e2f003f63c2711d2d97717d5179` |

## 8. Commands and exit codes

All runs: `export TMPDIR=$S/tmp` with `S=/fast/scratch/hyaku/tabi-r29/MutC1Baseline`; each followed by `echo exit=$?`.

```
node $S/baseline-raw.mjs --selftest            # ReferenceError existsSync :267        exit=1
node $S/baseline-fixed.mjs --selftest          # verdict=failed cases=7 passed=5       exit=3
node $S/tip.mjs --selftest                     # verdict=clean cases=7 passed=7        exit=0
node $S/m1-drop-sha.mjs --selftest             # verdict=clean cases=7 passed=7        exit=0   SURVIVED
node $S/m1b-sha-force-true.mjs --selftest      # verdict=failed cases=7 passed=6       exit=3   KILLED sha-mismatch-invalid
node $S/m2-drop-anchor-unique.mjs --selftest   # verdict=clean cases=7 passed=7        exit=0   SURVIVED
node $S/m2b-anchor-unique-force-true.mjs --selftest  # verdict=clean cases=7 passed=7  exit=0   SURVIVED
node $S/m3-drop-byte-count.mjs --selftest      # verdict=clean cases=7 passed=7        exit=0   SURVIVED
node $S/m3b-byte-count-force-true.mjs --selftest     # verdict=clean cases=7 passed=7  exit=0   SURVIVED
node $S/m4-drop-revision.mjs --selftest        # verdict=failed cases=7 passed=6       exit=3   KILLED measured-revision-bytes-mismatch
node $S/m4b-revision-force-true.mjs --selftest # verdict=failed cases=7 passed=6       exit=3   KILLED measured-revision-bytes-mismatch
node $S/b-m1-drop-sha.mjs --selftest           # verdict=failed cases=7 passed=5       exit=3   SURVIVED
node $S/b-m1b-sha-force-true.mjs --selftest    # verdict=failed cases=7 passed=4       exit=3   KILLED sha-mismatch-invalid
node $S/b-m2-drop-anchor-unique.mjs --selftest # verdict=failed cases=7 passed=5       exit=3   SURVIVED
node $S/b-m2b-anchor-unique-force-true.mjs --selftest  # verdict=failed cases=7 passed=5  exit=3 SURVIVED
node $S/b-m3-drop-byte-count.mjs --selftest    # verdict=failed cases=7 passed=5       exit=3   SURVIVED
node $S/b-m3b-byte-count-force-true.mjs --selftest   # verdict=failed cases=7 passed=5  exit=3   SURVIVED
node $S/b-m4-drop-revision.mjs --selftest      # verdict=failed cases=7 passed=5       exit=3   SURVIVED
node $S/b-m4b-revision-force-true.mjs --selftest     # verdict=failed cases=7 passed=5  exit=3   SURVIVED
```

Lane reads (all read-only): `git rev-parse HEAD`, `git status --porcelain`, `git log --oneline`, `git log -- <script>`, `git show <rev>:<script>`, `git diff <a> <b> -- <script>`, `git ls-tree`, `git show <rev>:corpus/evidence/round-29/s106-selftest/{mutation.txt,mutation.diff}`. No network use; no tool installed or updated (node v24.21.0 preexisting — tooling log: none).

## 9. Restoration / cleanup evidence

- Lane gate file sha256 before first touch and after all 19 node runs: `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` — unchanged; no lane tracked file was ever written.
- Lane HEAD moved `59e8167` → `35045d7` mid-run from a sibling's commit (C2 LOG correction; gate script diff 0 lines) — not my doing; my git usage in the lane was read-only throughout.
- All mutants lived and died in scratch copies; scratch `/fast/scratch/hyaku/tabi-r29/MutC1Baseline/` is removed after this report is written (receipts preserved above and in the committed lane evidence they corroborate).
- No sibling source was modified; no production code repaired (attack seat: findings only).
