# ExecS106Cases — C1 build: s106 self-test kill coverage (tabi round 30, w1)

Seat: ExecS106Cases (leaf executor) · 2026-10-26 · Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(never written) · Scratch clone of the lane at `061e62024c0523d3c6c7e819506a773ff2cd7d75`
(`git clone --shared`, `status --porcelain` empty before and after) · Item: C1 build, the five
surviving s106 fault mutants.

## Verdict

All five assigned s106 survivors are now killed, and no s106 benign mutant is falsely killed: three
new behavioural self-test cases (`same-length-tamper-invalid`, `duplicate-anchor-invalid`,
`receipt-byte-count-mismatch-invalid`) take the s106 rows from 9/9 killed to 9/9 killed with zero
false kills — i.e. from 5 survivors at the baseline to 0 survivors, `benign_killed = 0`, pristine
self-test `clean cases=10 passed=10` (exit 0). The edit is confined to the self-test section of
`scripts/check-s106-evidence.mjs` plus one header-comment word (`7` → `10` isolated cases); the
`evaluate()` block is byte-identical (sha256 `e6525742…a2a1` at both revisions) and every catalogued
`find` string still occurs exactly once, so the counter's static guards did not fire. The frozen
counter at my scratch commit `774e0e21ad72e0d8f3cd7484e5bf3491f32bd66e` reports
`fault_total 27, fault_killed 18, fault_survivors 9, benign_total 13, benign_killed 0, clean false,
exit 1`; the 9 remaining survivors are exactly the nine `pins-*` rows in
`scripts/check-release-pins.mjs`, which are outside this item (release-pin seat). The gate on its own
revision still reads `valid: true` (exit 0), so the fix is not self-serving.

## Before (baseline measurement in my own clone, frozen counter bytes)

`TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work" --json`
at `061e6202…` → **exit 1** (`before-counter.json`):

```
fault_total 27  fault_killed 13  fault_survivors 14  benign_total 13  benign_killed 0  clean false
survivors: s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true,
           s106-byte-count-drop, s106-byte-count-true, pins-f1-old-tag,
           pins-f2-path-traversal, pins-f3-bytes-absent, pins-f4-range-bounds,
           pins-f4-anchor-token, pins-s1-supersession-prefix,
           pins-s1-supersession-tag, pins-notfound-status, pins-notfound-body
```

This reproduces claims C1 "before" (14 survivors, 5 of them s106) exactly. Frozen-file digests at
the clone before the edit: `check-gate-mutants.mjs 02945f88…3a55`, `gate-mutants.json cd1c27a2…3833`,
`check-s106-evidence.mjs 1a01256e…5eb3` — the first two match `claims.json frozenDigests`.

## Change (patch `s106-cases.patch`, 53 insertions / 1 deletion, one file)

Why each survivor existed, and the fixture that now sees it:

| survivor | why it survived | new case |
|---|---|---|
| `s106-sha-drop` | the only byte-differing fixture (`// tail` → `// tampered`) also changes byte count, so `byte_count_match` masked the missing sha term | `same-length-tamper-invalid`: measured rev commits pristine bytes; HEAD commits `// tgil` (same 7-byte token), so `revision_match` and `byte_count_match` both hold and only `sha_match` can reject |
| `s106-anchor-unique-drop` / `s106-anchor-unique-true` | no fixture ever duplicated the anchor line; `anchor_unique` was asserted nowhere | `duplicate-anchor-invalid`: anchor line appears at lines 187 and 188 (occurrences 2) while line 187 still matches, so `anchor_located` holds, `anchor_unique` false |
| `s106-byte-count-drop` / `s106-byte-count-true` | the receipt's `decoded_bytes` always agreed with the bytes it described | `receipt-byte-count-mismatch-invalid`: intact bytes and matching sha at both measured and HEAD revision, receipt `decoded_bytes` = true length + 7 |

Each case declares `exit`, `valid` and one field with its expected value (the runner's existing
`field`/`fieldValue` assertion):

| case | exit | valid | field = value |
|---|---|---|---|
| `same-length-tamper-invalid` | 1 | false | `sha_match = false` |
| `duplicate-anchor-invalid` | 1 | false | `anchor_unique = false` |
| `receipt-byte-count-mismatch-invalid` | 1 | false | `byte_count_match = false` |

Fixture helpers added: `FIXTURE_TAMPERED_BYTES` (equal byte length, different sha) and
`FIXTURE_BYTES_DUPLICATE_ANCHOR` (anchor line twice, +46 bytes), both derived from `FIXTURE_BYTES`.
The header comment `// Self-test: --selftest (7 isolated cases …)` now reads `10`; that is the only
line changed outside the CASES/fixture block, and it is self-test documentation, not a check line.

## After (same command shape, scratch commit `774e0e2`)

`TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work" --json`
→ **exit 1** (`after-counter.json`), exit 1 only because of the nine untouched `pins-*` rows:

```
fault_total 27  fault_killed 18  fault_survivors 9  benign_total 13  benign_killed 0  clean false
survivors: pins-f1-old-tag, pins-f2-path-traversal, pins-f3-bytes-absent,
           pins-f4-range-bounds, pins-f4-anchor-token, pins-s1-supersession-prefix,
           pins-s1-supersession-tag, pins-notfound-status, pins-notfound-body
catalogue_sha256        cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833
counter_sha256_at_rev   02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55
```

Per-row s106 attribution (`s106-mutant-rows.json`, extracted from the same run) — 9/9 fault killed,
6/6 benign survived, and each kill names the case that flipped:

| mutant | kind | outcome | exit | passed | failing case |
|---|---|---|---|---|---|
| s106-sha-drop | fault | killed | 3 | 9/10 | same-length-tamper-invalid |
| s106-sha-true | fault | killed | 3 | 8/10 | sha-mismatch-invalid, same-length-tamper-invalid |
| s106-anchor-unique-drop | fault | killed | 3 | 9/10 | duplicate-anchor-invalid |
| s106-anchor-unique-true | fault | killed | 3 | 9/10 | duplicate-anchor-invalid |
| s106-byte-count-drop | fault | killed | 3 | 9/10 | receipt-byte-count-mismatch-invalid |
| s106-byte-count-true | fault | killed | 3 | 9/10 | receipt-byte-count-mismatch-invalid |
| s106-revision-drop | fault | killed | 3 | 9/10 | measured-revision-bytes-mismatch |
| s106-revision-true | fault | killed | 3 | 9/10 | measured-revision-bytes-mismatch |
| s106-anchor-located-true | fault | killed | 3 | 9/10 | anchor-off-by-one-invalid |
| s106-valid-reorder, s106-sha-eq-swap, s106-anchor-unique-eq-swap, s106-byte-count-eq-swap, s106-revision-eq-swap, s106-anchor-located-eq | benign | survived | 0 | 10/10 | — |

Pristine gate record from the counter (`gates[]`): `pristine_clean true, cases 10, passed 10, exit 0`,
file sha256 `85dfd5e0cb9d5a99f311a8f94728df31e9308a2fd7e63853ed11a4f3b5e95467`.

## Falsifier / integrity checks (all on the clone)

1. **`evaluate()` unchanged.** Extract `^export function evaluate` … `^// ---- self-test` from
   `git show <rev>:scripts/check-s106-evidence.mjs` at `061e6202…` and at `HEAD`:
   both sha256 `e65257424888ff281e7fa76254f1df547f962db1724187fb6f240e1c44a8f2a1`.
2. **Every catalogued find line byte-identical.** All 15 s106 catalogue rows report
   `find_occurrences=1` at HEAD; the counter's own guard would have exited 2 otherwise (it did not,
   and no `mutant-aware literal` refusal fired — the new cases carry none of the fault replacements).
3. **No benign false kill.** `benign_killed 0` with 13 rows total, 6 of them s106; all six s106
   benign runs report `cases 10 passed 10 exit 0`, so the new cases key on behaviour, not source text.
4. **The gate still validates the real lane evidence.** `node scripts/check-s106-evidence.mjs --rev HEAD --json`
   on the clone → **exit 0**, `valid true`, `sha_match true`, `revision_match true`,
   `anchor_located true`, `anchor_unique true`, `byte_count_match true`, `decoded_bytes 73952`,
   anchor occurrences 1.
5. **Self-test tally.** `node scripts/check-s106-evidence.mjs --selftest` → **exit 0**,
   `S106_SELFTEST verdict=clean cases=10 passed=10`; all ten cases PASS including the three new ones
   at `expected_exit=1 exit=1 valid=false`.

## Commands and exit codes

All with `S=/fast/scratch/hyaku/tabi-r30/ExecS106Cases`, `TMPDIR=$S/tmp`, `cd $S/clone`:

```
git clone --shared <lane> "$S/clone"                                            exit=0
git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75          exit=0   (HEAD 061e6202…, porcelain 0)
node scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work" --json   exit=1  (14 survivors; before)
node scripts/check-s106-evidence.mjs --selftest                                 exit=0   (clean 7/7; before)
<edits to scripts/check-s106-evidence.mjs only>
node scripts/check-s106-evidence.mjs --selftest                                 exit=0   (clean 10/10)
git -C "$S/clone" rev-parse --show-toplevel                                     -> $S/clone (checked equal before commit)
git -C "$S/clone" -c user.name=ExecS106Cases -c user.email=ExecS106Cases@scratch.local commit -q -am …   exit=0  (774e0e2)
node scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work" --json   exit=1  (9 survivors, all pins-*; benign_killed 0)
node scripts/check-s106-evidence.mjs --rev HEAD --json                           exit=0   (valid true)
node scripts/check-s106-evidence.mjs --selftest --json                           exit=0   (ok true, 10/10)
git -C "$S/clone" diff 061e62024c0523d3c6c7e819506a773ff2cd7d75 > s106-cases.patch  exit=0
git -C "$S/clone" diff --stat 061e6202…                                          exit=0   (1 file, 53 insertions, 1 deletion)
```

## Evidence retained (output dir `.ufo/waves/round-30/w1/ExecS106Cases/`)

| file | sha256 | note |
|---|---|---|
| `s106-cases.patch` | `fedd5a6e2ed7d2741cb80fab3501fbb8890a2a25f7ddc8c49ebb7427d9b4da11` | `git diff 061e6202…` on the clone; 2890 bytes |
| `before-counter.json` | `b46f4e34ac425895f98f61273741b29b6c4ae4e9256531ff377bdb1572671df6` | counter at 061e6202…, 14 survivors |
| `after-counter.json` | `88ffefdb19b385e654a277dd8f34016b3894895d35b9d4c8a2cfa40eb97b2857` | counter at 774e0e2, 9 survivors (all pins-*), benign_killed 0 |
| `s106-mutant-rows.json` | `ee90e2a52cf2495c32b892d46d15eedd2a0e665594b57fb366a04bd5b02b3762` | s106 rows + pristine record, derived from `after-counter.json` |
| `selftest.txt` | `12b26495ea2efba9f650df28108daf8387b8e222438f29d4656c2c2e78f54873` | 10-case tally, exit 0 |
| `selftest.json` | `6d11be73682bc374ac44a50d4240b772db72b6a8921680e71fea7b23586aacdb` | `--selftest --json`, ok true |
| `s106-rev-head.json` | `c2741b4fcc113e5dcb97a5b0803d8f74baba7814f23929afca1c0ae2c7712401` | gate `--rev HEAD --json`, valid true |

## Risks / notes for the L1

- **Global counter still exits 1** until the nine `pins-*` rows are killed by the release-pin seat;
  the s106 half of C1 is met in isolation (9/9 fault killed, 0/6 benign killed). C1 as a whole needs
  both halves plus the `check-selfassessment.mjs` restatement of the new tally (cases 7 → 10) that
  claims `noHarmChecks` names — I did not touch `check-selfassessment.mjs` (out of my write scope).
- The three new fixtures add two extra fixture commits per case (measured-rev commit + receipt
  commit); self-test wall time stays ~1 s, well under the counter's 600 s per-run timeout.
- No lane tracked file, index, jj state, sibling repo or `shokuknow` path was written; the only commit
  is inside `$S/clone` (toplevel verified equal before committing). No network use, no tool installed
  or upgraded, no subagent dispatched. Scratch `/fast/scratch/hyaku/tabi-r30/ExecS106Cases/` is removed
  after the receipts above were copied into this output dir.
