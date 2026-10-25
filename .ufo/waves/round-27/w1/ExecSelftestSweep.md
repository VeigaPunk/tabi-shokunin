# ExecSelftestSweep — lane gate self-test no-regression sweep (round 27, w1)

Seat: `TabiR27.ExecSelftestSweep` (leaf executor, read-only reporter).
Item: for the 13 named lane gates run each gate's **own** self-test flag (read from the file, never
guessed) and record `{script, flag, exit, tally}`; then `check-gate-registry.mjs --rev <tip> --json`
must report `nonconformant=0`. Any non-clean run = finding.

- Named tip: `5a0178c744a92f63f8add30b8ef035c5a0a89b22`
- Node `v24.21.0`; lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; every command run from there.
- **Result: 13/13 exit 0, every run `verdict=clean`; `nonconformant=0`. No finding under the item's rule.**
- Lane tip moved during the sweep (`5a0178c` → `8e07f0b` → `336d5d1` → `5198e28` → `5ed6484`); §1 proves
  the measured bytes were the named tip's, §5 re-sweeps the moved tip.

## 1. Proof the sweep ran on the named tip's bytes

When measurement started, lane HEAD was `336d5d1ca241503dfe2c95ba1471003864d4ae76` (then 2 commits ahead
of the named tip). `scripts/` was byte-identical to `5a0178c`, so the working tree *was* the named tip for
all 13 scripts; no extraction was required.

Command per script: `git rev-parse 5a0178c744a92f63f8add30b8ef035c5a0a89b22:scripts/<s>.mjs` compared with
`git hash-object scripts/<s>.mjs` → `IDENTICAL` for all 13 (git blob ids):

| script | blob at `5a0178c` = worktree | script | blob |
|---|---|---|---|
| check-adjacency.mjs | `0a24cfec0acefec7bcc423d7affccb34b45b52c7` | check-s106-evidence.mjs | `a420bd2214d026f0dae6e1f8162c025206db6c93` |
| check-aria-metadata.mjs | `78d7564ab9faca16120d6338de6e2951241835ed` | check-selfassessment.mjs | `b2d5543d4abeb5db7d8b558bf2e8481dc846672c` |
| check-bfcache-receipt.mjs | `125f9f5d019ecb5980179d46999ad25d7e6f5af0` | check-source-reopen-receipt.mjs | `61badff3b906bfae21c89431f2b164d6269ec869` |
| check-freshness.mjs | `987c3267f1781db643e0269942a126ca9fee814a` | check-sources.mjs | `3f96058fad6fd0163e9ec5f63347af4607e5646b` |
| check-gate-registry.mjs | `8538d4194d0b1555b62f518ad3bd11fedf2bf8cc` | check-user-round-contract.mjs | `9ebe31193325eb690e968ff09ef324400ae51fdb` |
| check-measurement-binding.mjs | `57d0aa5a74beffb313451ae0fed7934cbac6a418` | round-evidence-audit.mjs | `dbb7906204976e62a7c5acdd2a697ff7ff64035b` |
| check-round-contract.mjs | `8272d03f6ce188de1a83b40bd01029e235e9259f` | | |

Lane data these self-tests read at run time was unchanged then:
`git diff --name-only 5a0178c744a92f63f8add30b8ef035c5a0a89b22 HEAD -- .ufo/rounds corpus/evidence SKILL.md`
→ empty; `git status --porcelain -- scripts/` → empty.

## 2. Sweep at the named tip — `{script, flag, exit, tally}`

Every run: `node scripts/<script> <flag>`; stdout+stderr captured in
`.ufo/waves/round-27/scratch/ExecSelftestSweep/logs/`.

| script | flag | flag spelled at | exit | tally (exact summary) | declared in `SKILL.md` @5a0178c | match |
|---|---|---|---|---|---|---|
| check-adjacency.mjs | `--self-test` | `:17`, `:1114`, parser `:1128` | 0 | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` | `:2475` cases=57, reasons=18 | yes |
| check-aria-metadata.mjs | `--self-test` | `:44`, `:3221`, parser `:3245` | 0 | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` (JSON `ok:true`, 36 cases) | `:2474` cli_cases=36, helpers=4 | yes |
| check-bfcache-receipt.mjs | `--selftest` | `:48`, parser `:318` | 0 | JSON `{cases:17, passed:17, clean:true, exit:0}` | `:2498` cases=17, passed=17 | yes |
| check-freshness.mjs | `--self-test` | argv grammar `:50`, dispatch `:213` (no usage header; `SKILL.md:2469` spells it) | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` | `:2469` cases=12 | yes |
| check-gate-registry.mjs | `--selftest` | `:50`, usage string `:429` | 0 | `GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22` | `:2478` cases=22, passed=22 | yes |
| check-measurement-binding.mjs | `--self-test` | `:16`, `:813`, parser `:846` | 0 | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` | `:2476` cases=76, reasons=13 | yes |
| check-round-contract.mjs | `--self-test` | `:275`, `:282`, `:284` | 0 | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` | `:2472` cases=38, alias_checks=1 | yes |
| check-s106-evidence.mjs | `--selftest` | `:34`, `:300`, parser `:282` (named-tip bytes) | 0 | `S106_SELFTEST verdict=clean cases=4 passed=4` | `:2514` cases=4, passed=4 | yes |
| check-selfassessment.mjs | `--selftest` | `:67`, `:722` | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17` | `:2515` cases=17, passed=17 | yes |
| check-source-reopen-receipt.mjs | `--selftest` | `:40`, parser `:351` | 0 | JSON `{cases:18, passed:18, clean:true, exit:0}` | `:2499` cases=18, passed=18 | yes |
| check-sources.mjs | `--self-test` | parser `:97`, dispatch `:556` (no usage string; `SKILL.md:2470` spells it) | 0 | `SOURCES_SELFTEST verdict=clean cases=26` | `:2470` cases=26 | yes |
| check-user-round-contract.mjs | `--self-test` | `:369`, `:371` | 0 | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` | `:2473` cases=45 | yes |
| round-evidence-audit.mjs | `--selftest` | `:11`, usage `:909`, parser `:926` | 0 | JSON `{cases:13, passed:13}` (`schema: tabi-round-evidence-audit-v1-selftest`) | `:2477` cases=13, passed=13 | yes |

`grep -c 'result=FAIL'` over all 13 logs → 0 hits. The single line in `check-user-round-contract.log`
containing `verdict=failed` is its `count_witness_comparison` design arm (`new_verdict=failed` for the
legacy branch, outer `result=PASS`, log line 43) — not a failure.

### Control: the flag spellings are load-bearing

Each script was also run with the **opposite** spelling; all 13 refused with exit 2 (usage/could-not-evaluate),
so no self-test silently accepted the wrong flag:

`check-adjacency|check-aria-metadata|check-freshness|check-measurement-binding|check-round-contract|check-s106-evidence|check-selfassessment|check-source-reopen-receipt|check-sources|check-user-round-contract|round-evidence-audit` given `--selftest`/`--self-test` (opposite of §2) → exit 2;
`check-bfcache-receipt` given `--self-test` → exit 2; `check-gate-registry` given `--self-test` → exit 2.
Sample details: `S106_EVIDENCE … unknown argument: --self-test`, `GATE_REGISTRY … unknown argument: --self-test`,
`round-evidence-audit: refused: unsupported argument "--self-test"`.

## 3. Gate-registry conformance at the named tip

```
node scripts/check-gate-registry.mjs --rev 5a0178c744a92f63f8add30b8ef035c5a0a89b22 --json
exit=0
{schema:"tabi-gate-registry-v1", rev:"5a0178c…", skillBytes:233850, rows:27, gates:17, nonconformant:0, clean:true, findings:[]}
```

**`nonconformant=0` — requirement met.** Every gate's latest row has `missing=[]`. Latest-row selection
per gate (row:owned_rows): adjacency 2475:1, aria 2474:3, bfcache 2498:1, freshness 2469:2,
gate-registry 2478:1, measurement-binding 2476:1, round-contract 2472:2, s106-evidence 2514:1,
selfassessment 2515:2, source-reopen 2499:1, sources 2470:2, user-round-contract 2473:3,
round-evidence-audit 2477:1, plus four gate-kind rows naming scripts outside `scripts/`
(`claim-record-discipline`, `lifecycle observation count`, `finite review-chronology/history classifier`,
`finite lifecycle semantic outcome oracle`).

## 4. Reproducibility and determinism

Every self-test was run twice (`rerun/`). `diff -q` per log:

- **Byte-identical for 12 of 13**, including tallies and every per-case `PASS`.
- **`check-s106-evidence` differs, in two refusal detail strings only** (both cases PASS): pass 1 line 4
  `refusal=decoded bytes absent at 1d44379e…`, pass 2 `… at 051e44fa…`; verdict/tally identical
  (`cases=4 passed=4`). Cause: the fixture commit at `scripts/check-s106-evidence.mjs:239-240`
  (`git add -A`; `git commit`) takes the wall clock, and `:111`/`:117` interpolate `${rev}`.
  Proof of cause: with `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` pinned to `2026-01-01T00:00:00+0000`, two
  consecutive runs are **byte-identical** with the same tally. Output nondeterminism only; verdict stable.

## 5. Concurrency — the lane advanced under the sweep

Commits after the named tip: `8e07f0b`, `336d5d1`, then during the sweep `5198e28` and `5ed6484`.

- `5198e28` *round-27: classify missing S106 receipt as could-not-evaluate* — `scripts/check-s106-evidence.mjs`
  (missing receipt becomes `Refusal` → exit 2; 5th selftest case), `SKILL.md:2514` `cases=4` → `cases=5`,
  `corpus/lessons/round-27.md`.
- `5ed6484` *round-27: permit empty missing-receipt selftest fixture commit* — `git commit --allow-empty`
  (`:240`) so the no-file fixture can be committed.

Re-sweep at `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (logs in `head-5ed6484/`):

| script | flag | exit | tally |
|---|---|---|---|
| check-s106-evidence.mjs | `--selftest` | 0 | `S106_SELFTEST verdict=clean cases=5 passed=5` |
| the other 12 | unchanged | 0 | identical tallies to §2; **logs byte-identical** (same sha256) |

`node scripts/check-gate-registry.mjs --rev HEAD --json` at `5ed6484` → exit 0,
`{rows:27, gates:17, nonconformant:0, clean:true, skillBytes:233850}`. No regression at the moved tip.
Sibling work touched `scripts/` again after that re-sweep (HEAD still `5ed6484`):
`?? scripts/report-contract.mjs` (untracked; not one of the 13, invisible to `--rev` gates) and an
uncommitted **comment-only** edit to `scripts/check-s106-evidence.mjs` (worktree blob `45138be…` vs HEAD
`ea0f9d8…`; `git diff -U0` filtered to non-`//` lines is empty). Re-ran that gate on the edited worktree:
exit 0, `S106_SELFTEST verdict=clean cases=5 passed=5` — the edit fixes the OBS-2 header claim
(`4 isolated cases` → `5 isolated cases`) and changes no behaviour. Uncommitted at this writing.

## 6. Observations (advisory; no tracked file touched, no verdict changed)

- **OBS-1 — `check-s106-evidence` selftest output is not byte-reproducible** (§4; detail strings only).
  Stable verdict/tally; an operator diffing two logs sees a false delta. Optional fix: pin
  `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` in the fixture `run()` env.
- **OBS-2 — stale case-count claim inside code, introduced mid-sweep.** At `5ed6484` (committed bytes),
  `scripts/check-s106-evidence.mjs:8` still says ``Self-test: `--selftest` (4 isolated cases …`` while
  `CASES` holds 5 (`:177`, `:183`, `:190`, `:202`, `:208`) and the run prints `cases=5 passed=5`. At the
  named tip the line was accurate (4/4). `SKILL.md:2514` was correctly bumped to `cases=5`, so only the
  inline comment is stale. Unpoliced: `check-gate-registry` only requires `--self-test` in the row's cell,
  and `check-selfassessment` m1 reads `SCORECARD.md` + `LOG.md` only (`:27-38`, `:203`, `:244`).
  **Status: remediated in the worktree, uncommitted** — the comment-only edit noted in §5 now reads
  `5 isolated cases` and the gate still prints `cases=5 passed=5`; closes when that edit is committed.
- **OBS-3 — append-only registry keeps superseded tallies reachable.** `check-gate-registry` evaluates only
  the last owned row (`:263-264`), so older cells are accepted and unread: `SKILL.md:2479` selfassessment
  `(cases=13, passed=13)` vs current `:2515` `(cases=17, passed=17)`; `:1559` freshness "eight isolated CLI
  cases" vs `:2469` `cases=12`; `:1614` sources "25 isolated CLI cases" vs `:2470` `cases=26`. Each is marked
  superseded by its newer row; flagged so the L1 can decide whether the registry gate should reject
  stale-in-place tallies.
- **OBS-4 — `round-evidence-audit.mjs:561` says "Twelve cases" while the suite runs 13**, and `:731`
  reconciles it ("the inventory is 13, not 12"). Independently verified here:
  `sed -n '561p'` → `// Twelve cases: one red per class …`; selftest → `cases:13, passed:13`; `:731` →
  `// c2 carries two red arms … the inventory is 13, not 12.` Pre-existing comment inconsistency, not a
  gate failure.

**Findings under the item's rule: none.**

## 7. Evidence

```
git rev-parse 5a0178c744a92f63f8add30b8ef035c5a0a89b22:scripts/<s>.mjs   # vs git hash-object scripts/<s>.mjs
node scripts/<s>.mjs <f>                                                  # pass 1 → scratch/…/logs/<s>.log
node scripts/<s>.mjs <f>                                                  # pass 2 → scratch/…/rerun/<s>.log
diff -q logs/<s>.log rerun/<s>.log
node scripts/check-gate-registry.mjs --rev 5a0178c744a92f63f8add30b8ef035c5a0a89b22 --json
node scripts/check-gate-registry.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json
GIT_AUTHOR_DATE=2026-01-01T00:00:00+0000 GIT_COMMITTER_DATE=2026-01-01T00:00:00+0000 node scripts/check-s106-evidence.mjs --selftest
node scripts/<s>.mjs <opposite-flag>                                       # control, always exit 2
```

Log sha256, pass 1 (named tip). Pass-2 hashes are identical except `check-s106-evidence` (fixture commit id only):

```
d77890f2247dfd48b26b9704d8bd7236d06f2bc893f004e8eeac1e388c686b24  check-adjacency.log
d6ae0b28d9cba2ba14649da3d2094436683a681a1ee3665fdf1685b060371eb3  check-aria-metadata.log
3872c1f71bd041791b14decd095d107ffe01007f8846053e9b733b75b25ae107  check-bfcache-receipt.log
32d6959967507bd75731eaa52a52a2bc47f8a2ffa7dc806f0528e3c0d1414838  check-freshness.log
fe6db2608bad778e5beb7f6ed9fd13799bfba5ef9772e341478e8dfb89e1998e  check-gate-registry.log
13ab29c52ab387c050feec24359202f5cddf8dd7ecce1bbd35182f33a35a5a28  check-measurement-binding.log
5e1c535b40314815a1105f01d6fe0e3617991e6ed82b447dd46d50fdb5646e42  check-round-contract.log
3dc92f0127cca9380a508550c44761fddd14c6db3b5b363ad4bbf6750445e514  check-s106-evidence.log  (pass 2 differs)
de58470b96c077fa4d7edfddd59d096a4a4877951e89a6436413a84af453a794  check-selfassessment.log
8303750c5c8c2c0cc55dd75dca4f707b7fc1a321fc846f378a273bb76db496ca  check-source-reopen-receipt.log
8a1efa8b30d2864dcc97e1e680be5b23ac1d8fda0f2bbe0d1ea2156a47a884a0  check-sources.log
1a92202e16d7dae48d5f2356a693e872f258146ff26c5aef001f10be9aadea81  check-user-round-contract.log
6edf5d31ee8bb1d578ea599829ee9d2ef56557ebf149e467ebf283d54ce3c463  round-evidence-audit.log
```

HEAD-tip pass: 12 hashes identical to the list above; `check-s106-evidence.log` =
`fb26b60be458a8b1d325928418f625435ec7e33c8478d2cb0d1552a8f014c8ae` (5 cases).

Scratch layout (this seat): `.ufo/waves/round-27/scratch/ExecSelftestSweep/{logs,rerun,head-5ed6484}`.
A throwaway instrumented copy used to diagnose OBS-1 was deleted after the finding was recorded.

## 8. Duplicate-seat collision on this report path (for the L1)

A second seat is executing the same ticket: it wrote `.ufo/waves/round-27/w1/ExecSelftestSweep.md`
(191 lines, mtime `14:39:33`) after this seat's first write (14388 B, `14:39:10`), and it transiently used
this seat's scratch directory (`tip-5a0178c/scripts/…`, `gate-registry-rev-5a0178c.mjs.json`, mtimes 14:37,
since removed). Its content is preserved verbatim at
`.ufo/waves/round-27/scratch/ExecSelftestSweep/peer-collision-copy.md` so nothing is lost; its findings
agree with this report (its F1 = OBS-2, F2 = OBS-4, same 13 tallies and `nonconformant=0`). Its method
differed: it swept HEAD and tip-pinned only `check-s106-evidence`; this report swept the named tip's bytes
directly (§1) and re-swept HEAD (§5). No subagent was spawned; no peer was messaged.

## 9. Tooling, bounds, unknown

- No tool installed or updated; no `pacman` transaction attempted.
- Read-only git only (`rev-parse`, `hash-object`, `diff`, `log`, `show`, `status`, `merge-base` class). No
  git/jj write, no commit, no build/lint/formatter beyond the assigned 13 self-tests, the wrong-flag
  controls, and the registry gate.
- No credential, session, or sibling-lane path was read.
- Unknown: whether the lane tip moves again before integration. §2 is pinned to the named tip's blob ids
  (§1); §5 pins the tip measured at `5ed6484`.
