# MutC1Repaired — mutation test of the repaired s106 self-test (tabi round-29 w2, C1/operability)

Seat: MutC1Repaired (leaf mutation tester) · 2026-10-26 · Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only throughout)
Item: mutation-test the repaired s106 self-test at `32008a453737a27f69e9ab401d0b9775d2a944f7` — six assigned mutants attacking the C1 repair, run `--selftest` per mutant, report killed/survived with the killing case id.

## 0. Pinning and pristine detector

- Clean `git clone --shared` of the lane into scratch, detached to **`32008a453737a27f69e9ab401d0b9775d2a944f7`**; `git status --porcelain` empty before and after all runs; `rev-parse HEAD` = the pinned commit at the end.
- Gate bytes at that commit: `scripts/check-s106-evidence.mjs`, 378 lines, sha256 `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` — byte-identical to the file at the live lane tip `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` (checked before detaching; the lane advanced under me from sibling commits, not mine) and to wave-1's `tip.mjs` ledger.
- Pristine detector (run twice, start and end): `TMPDIR=$S/tmp node scripts/check-s106-evidence.mjs --selftest` → `S106_SELFTEST verdict=clean cases=7 passed=7`, **exit 0** both times. Baseline green ⇒ every mutant verdict below is decidable.

## 1. Method

- Nine scratch copies of the gate file (`$S/mutants/m*.mjs`, `S=/fast/scratch/hyaku/tabi-r29/MutC1Repaired`); mutations applied with the edit tool to the copies only — the clone file and the lane worktree file were never written.
- Detector: the gate's own `--selftest` (7 isolated fixture-repo cases; declared exits 0 clean / 3 failed). Kill attribution is **per-case**: a case kills a mutant iff it PASSes on pristine and FAILs on the mutant. Every run passed `TMPDIR=$S/tmp` explicitly (fixtures `mkdtemp` under scratch; the self-test removes its own trees).
- The six assigned mutants, plus three supplementary **decision-only** forms (term dropped from the `valid` conjunction, field still honestly computed) for the three "check removed" items, because "check removed" has two minimal readings and the two readings differ observably.

## 2. Mutant table (deliverable)

Pristine line numbers in the 32008a45 gate file. All runs: `node <mutant>.mjs --selftest`.

| # | mutant | edit (pristine line) | post-edit sha256 | tally | exit | verdict | killing case id |
|---|---|---|---|---|---|---|---|
| 1 | runner field assertion reverted to `=== false` | `:311` `out[c.field] === c.fieldValue` → `out[c.field] === false` | `265d10b2c3c8360c492b41971bdc387fbb1c10540aac655f7ca9f3bf6a653951` | `verdict=failed cases=7 passed=6` | 3 | **KILLED** | `measured-revision-bytes-match` |
| 2 | mismatch case drops its final `d.commit()` | `:203` line removed (after `:202` `d.receipt(fixtureReceipt({ measured_rev: measuredRev }))`) | `f1ad18bb3a9df9f40129c2e7e9ac705a1143ffe910795fc813b22e23228ebe82` | `verdict=failed cases=7 passed=6` | 3 | **KILLED** | `measured-revision-bytes-mismatch` |
| 3 | `revisionMatch` ignores measured bytes | `:116-117` → `const revisionMatch = measuredBytes !== null;` | `2b173023ac0cf7dea020c336a326a86755a5f33fc7b9e3ae81aebe851fa6db39` | `verdict=failed cases=7 passed=6` | 3 | **KILLED** | `measured-revision-bytes-mismatch` |
| 4 | anchor-uniqueness check removed (force-true) | `:126` `anchorUnique = occurrences === 1` → `= true` | `8e7117605c0f6144975c79c812971f8c5d70caecd9f988c7dc6172c88b425af8` | `verdict=clean cases=7 passed=7` | 0 | **SURVIVED** | none |
| 5 | byte-count check removed (force-true) | `:127` `byteCountMatch = Buffer.byteLength(bytesText) === receipt.decoded_bytes` → `= true` | `0836d79b0e2d7c4cbd63c2d11e6a0f8ef77bb07e62d909085eef26a0509f66be` | `verdict=clean cases=7 passed=7` | 0 | **SURVIVED** | none |
| 6 | sha check removed (force-true) | `:121` `shaMatch = observedSha === receipt.decoded_sha256` → `= true` | `bb415f7a8e7cb7c0fd55c0019f5f1cc362ca5b2c50f82776f8092c60e7d498ae` | `verdict=failed cases=7 passed=6` | 3 | **KILLED** | `sha-mismatch-invalid` |
| 4b | anchor-uniqueness term dropped from `valid` | `:128` → `valid = revisionMatch && shaMatch && anchorLocated && byteCountMatch` | `edad1eaef0c3faf4b7de552595ced416cf3b8a8ea68d810a1d7c6391552ebce2` | `verdict=clean cases=7 passed=7` | 0 | **SURVIVED** | none |
| 5b | byte-count term dropped from `valid` | `:128` → `valid = revisionMatch && shaMatch && anchorLocated && anchorUnique` | `1343db2d7a52b5728dd30d1caa996865c65841ca5f185d323e6ccbe398c98e24` | `verdict=clean cases=7 passed=7` | 0 | **SURVIVED** | none |
| 6b | sha term dropped from `valid` | `:128` → `valid = revisionMatch && anchorLocated && anchorUnique && byteCountMatch` | `4a187fbed53879eea510582847e1570e83a95f1cd479402ee219ce86afdac149` | `verdict=clean cases=7 passed=7` | 0 | **SURVIVED** | none |

**Score on the assigned six: 4 killed (m1, m2, m3, m6), 2 survived (m4, m5).** Supplementary: all three decision-only forms survive.

## 3. Killing observables (pasted from the run)

- **m1** — `CASE id=measured-revision-bytes-match expected_exit=0 exit=0 valid=true FAIL`. Exit and validity are still correct; the reverted runner asserts `revision_match === false` against a true value. The repair's positive `fieldValue: true` assertion is load-bearing: if the runner regresses to the round-28 inversion, the self-test goes red on the positive revision case.
- **m2** — `CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=2 valid=n/a refusal=receipt absent at 8c8ece65407183580ede987bc83aa227bde1b4f2 FAIL`. Dropping the final commit resurfaces exactly the pre-repair defect (c): the evaluated HEAD (`committed` already true, so `rev()` returns the first commit) carries no receipt → Refusal → exit 2. The self-test sees the regression.
- **m3** — `CASE id=measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL`. With the measured-bytes comparison gone, the gate admits a revision whose committed bytes differ from the receipt's sha (exit 0, `revision_match=true`). Note m3 is a third, subtler revision mutant distinct from wave-1's term-drop (`f2dd4e41…`) and force-true (`89d6929a…`) forms — same killer case.
- **m6** — `CASE id=sha-mismatch-invalid expected_exit=1 exit=1 valid=false FAIL`. Exit and validity still hold (`revisionMatch` is false in that fixture and masks the verdict path); the kill comes **only via the field assertion** (`sha_match === true` vs expected `false`). The sha term's *decision* power is not covered — see §4.

## 4. Coverage findings (survivors — coverage gaps, not contract changes; attack seat repairs nothing)

1. **`anchor_unique` has zero kill coverage in both forms.** No CASES fixture ever produces a duplicated anchor line (`occurrences ≥ 2`), and no case asserts the `anchor_unique` field. Both the force-true mutant (m4) and the decision-only drop (m4b) leave all 7 cases PASS. Kill recipe (not run here — outside the assigned detector): a fixture whose bytes repeat `FIXTURE_LINE` in the tail, expecting exit 1 / `anchor_unique=false`.
2. **`byte_count_match` has zero kill coverage in both forms.** The only byte-differing fixture (`sha-mismatch-invalid`, `// tail` → `// tampered`, +4 bytes) is already rejected by the sha and revision terms, so the byte-count term is masked in every case. Kill recipe (not run): a receipt whose `decoded_bytes` disagrees by a few bytes with otherwise sha-intact bytes (receipt-internal inconsistency).
3. **The sha term's verdict power is masked too** (m6 killed only through the reported field; m6b — decision-only drop — survives). A same-length tamper fixture (e.g. `// tail` → `// tgil`) would be needed to kill the sha-drop via exit/valid. Net of the five `valid` terms: `revision_match` and `anchor_located` are kill-covered via the verdict; `sha_match` via the field only; `anchor_unique` and `byte_count_match` not at all.

## 5. Cross-corroboration with wave-1 (independent reproduction)

Four of my mutants are byte-identical (same sha256) to entries in wave-1 `MutC1Baseline`'s ledger on the same tip bytes, with matching verdicts: m6 ≡ their `m1b-sha-force-true` (`bb415f7a…`, KILLED `sha-mismatch-invalid`), m4b ≡ their `m2-drop-anchor-unique` (`edad1eae…`, SURVIVED), m5b ≡ their `m3-drop-byte-count` (`1343db2d…`, SURVIVED), m6b ≡ their `m1-drop-sha` (`4a187fbe…`, SURVIVED). My m4/m5 force-true forms likewise match their m2b/m3b survivors. The three repair-attack mutants (m1, m2, m3) are new to this wave — all killed, i.e. each of the three routed C1 repairs (runner assertion, mismatch-case commit, revision comparison) is regression-detectable by the self-test it ships with.

## 6. Restoration / cleanup evidence

- The detector ran on **pristine, mutated, and pristine-again** bytes. The clone's gate file was never mutated (mutations lived in separate scratch copies); its sha256 before the first run and after all 11 node runs: `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` — unchanged; pristine re-run `verdict=clean cases=7 passed=7` exit 0.
- Lane worktree gate file same digest after all runs; lane `git status --porcelain`: 37 lines, **0 tracked modifications** (untracked `.ufo/waves/round-29/` outputs from concurrent seats, including my two files below). Clone porcelain: 0 lines, HEAD `32008a453737a27f69e9ab401d0b9775d2a944f7`.
- Mutant files lived and died in scratch; scratch `/fast/scratch/hyaku/tabi-r29/MutC1Repaired/` is removed after this report. Receipts preserved first in the output dir: `MutC1Repaired.mutant-runs.txt` (machine-written repeat run of all nine mutants + pristine + sha256 ledger; tallies and exit codes identical to the first run — per-fixture commit ids inside refusal messages vary between runs, as expected).
- No tool installed or updated (node v24.21.0, git preexisting — tooling log: none). No network use. No lane tracked file, lane index, lane jj state, fleet repo or sibling lane written; no production code repaired (attack seat: findings only).

## 7. Commands and exit codes

```
S=/fast/scratch/hyaku/tabi-r29/MutC1Repaired
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # then detach to 32008a45
git -C "$S/clone" checkout -q --detach 32008a453737a27f69e9ab401d0b9775d2a944f7   # exit 0
TMPDIR="$S/tmp" node scripts/check-s106-evidence.mjs --selftest             # exit=0  (pristine, 7/7)
for m in m1 m2 m3 m4 m5 m6 m4b m5b m6b; do TMPDIR="$S/tmp" node "$S/mutants/$m.mjs" --selftest; echo "exit=$?"; done
#   m1 exit=3  m2 exit=3  m3 exit=3  m4 exit=0  m5 exit=0  m6 exit=3  m4b exit=0  m5b exit=0  m6b exit=0
TMPDIR="$S/tmp" node scripts/check-s106-evidence.mjs --selftest             # exit=0  (pristine re-run, 7/7)
sha256sum scripts/check-s106-evidence.mjs "$S"/mutants/*.mjs                # ledger in §2
```

Lane reads (read-only): `git rev-parse HEAD`, `git status --porcelain`, `sha256sum` of the lane worktree gate file. Mutations applied via the edit tool on scratch copies only.
