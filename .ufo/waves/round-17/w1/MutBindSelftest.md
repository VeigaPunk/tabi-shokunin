VERDICT: ISSUES
# Baseline measurement-binding selftest mutation probe

- Axes: C1 operability (revision anchoring), coverage (behavioral selftest sensitivity), calibration (survivors named without declaring the contract changed).
- Scope: baseline master only; 12 one-line mutants, 9 killed, 3 survived, 0 inconclusive. No production changes or round-admission judgment.
- Baseline: `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (read-only lane `git rev-parse --verify refs/heads/master^{commit}` and sandbox `git rev-parse HEAD` agreed).
- All source line references below are at that baseline, not GateBindAnchor’s concurrently edited worktree.
- Baseline behavior sites: `scripts/check-measurement-binding.mjs:227-237,320-325,504-508,833`.
- Selftest evidence: `scripts/selftest-measurement-binding.mjs:118-121` initializes attached `main`; `:252-254` changes an existing counted file; `:429-438,475-489` assert exit plus exact reason set.

## Isolation and identical bounded detector
Cloned with `git clone --no-hardlinks --branch master /home/vgpnk/Projects/shokunin/tabi-shokunin S`:
- A: `/tmp/tabi-r17-MutBindSelftest-u9nyi4nh`
- B: `/tmp/tabi-r17-MutBindSelftest-7g7gwakg`
- C: `/tmp/tabi-r17-MutBindSelftest-8egmu4en`
For each S, the same argv was run on pristine, mutant, and byte-restored gate:
```sh
 timeout --signal=TERM --kill-after=2s 45s node "$S/scripts/check-measurement-binding.mjs" --self-test --repo "$S"
 sha256sum "$S/scripts/check-measurement-binding.mjs" "$S/scripts/selftest-measurement-binding.mjs"
```
Three independent synchronous detectors ran concurrently per batch; no subagents/background jobs. Each clone held only one mutation at a time. Restore detectors also served as pristine predecessors for the next batch.
27 detector invocations: 3 pristine + 12 mutant + 12 restored. Every pristine/restored invocation exited 0 and printed exactly:
```text
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13
```
Every killed mutant exited 1 with named case FAILs and `verdict=failed cases=59 reasons=13`; survivors exited 0 with all 59 cases PASS. None timed out. Individual runs took approximately 2.3–3.2 seconds.

## Mutant table: exact delta and observed killing case
Expected detector = the unchanged baseline `--self-test` above; KILLED requires pristine/restored green plus a mutant case mismatch, not merely an arbitrary nonzero exit. Case column names a representative actual killing case; count is all failing cases.
| Mutant | Baseline gate line and one-line diff | Verdict | Pristine / mutant / restored exit | Killing case (total FAILs) |
|---|---|---|---|---|
| M01 (A) | :833: default `'HEAD'` → `'HEAD^'` | KILLED | 0 / 1 / 0 | `counter_digest_mismatch` (4) |
| M02 (B) | :833: default `'HEAD'` → `gitMust(repo, ['symbolic-ref', '-q', 'HEAD']).trim()` | SURVIVED | 0 / 0 / 0 | `none` (0) |
| M03 (C) | :833: default `'HEAD'` → `(git(repo, ['symbolic-ref', '-q', 'HEAD']).status === 0 ? 'HEAD' : 'refs/heads/main')` | SURVIVED | 0 / 0 / 0 | `none` (0) |
| M04 (A) | :232: revision argument `` `${text}^{commit}` `` → `text` (drop commit peeling) | KILLED | 0 / 1 / 0 | `revision_unresolved_at` (2) |
| M05 (B) | :232: delete `'--verify',` from the rev-parse argv | KILLED | 0 / 1 / 0 | `clean` (49) |
| M06 (C) | :234: `FAILURE_REASON.revisionUnresolved` → `FAILURE_REASON.gitFailed` | KILLED | 0 / 1 / 0 | `revision_unresolved_at` (2) |
| M07 (A) | :229: delete the `text.startsWith('-')` disjunct, retaining only the NUL guard | KILLED | 0 / 1 / 0 | `revision_unresolved_dash_ref` (1) |
| M08 (B) | :228: `const text = String(rev);` → `const text = 'HEAD';` | KILLED | 0 / 1 / 0 | `clean_reproduce` (17) |
| M09 (C) | :506: `changed.length > 0` → `changed.length > 1` | KILLED | 0 / 1 / 0 | `counter_digest_mismatch` (3) |
| M10 (A) | :504: `new Set([...inputs, counterPath])` → `new Set(inputs)` | KILLED | 0 / 1 / 0 | `counter_digest_mismatch` (4) |
| M11 (B) | :505: `diffNames(repo, measured, atRev, diffInputs)` → `diffNames(repo, atRev, atRev, diffInputs)` | KILLED | 0 / 1 / 0 | `counter_digest_mismatch` (3) |
| M12 (C) | :322: insert `'--diff-filter=M',` before `'--name-only'` | SURVIVED | 0 / 0 / 0 | `none` (0) |

## Actual detector stdout excerpts
Each mutant summary is verbatim after the `Mxx exit=N` label; one complete actual FAIL line is retained per killed mutant.
```text
M01 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counter_changed_since_measurement,counter_digest_mismatch FAIL
M02 exit=0 MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13
M03 exit=0 MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13
M04 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=revision_unresolved_at expected_exit=2 actual_exit=2 expected_reasons=revision_unresolved actual_reasons=git_failed FAIL
M05 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=clean expected_exit=0 actual_exit=2 expected_reasons=- actual_reasons=git_failed FAIL
M06 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=revision_unresolved_at expected_exit=2 actual_exit=2 expected_reasons=revision_unresolved actual_reasons=git_failed FAIL
M07 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=revision_unresolved_dash_ref expected_exit=2 actual_exit=0 expected_reasons=revision_unresolved actual_reasons=- FAIL
M08 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=clean_reproduce expected_exit=0 actual_exit=1 expected_reasons=- actual_reasons=count_not_reproduced FAIL
M09 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counter_digest_mismatch FAIL
M10 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counter_digest_mismatch FAIL
M11 exit=1 MEASUREMENT_BINDING_SELFTEST verdict=failed cases=59 reasons=13
case=counter_digest_mismatch expected_exit=1 actual_exit=1 expected_reasons=counter_digest_mismatch,counted_input_changed actual_reasons=counter_digest_mismatch FAIL
M12 exit=0 MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13
```
M01 also failed `counter_changed_since_measurement`, `counted_input_changed`, `legacy_counter_changed`; M04/M06 also failed `revision_unresolved_measured`; M09/M11 also failed `counter_changed_since_measurement`, `counted_input_changed`; M10 also failed `counter_changed_since_measurement`, `counted_inputs_undeclared`, `multi_claim_inputs_undeclared`.
M05’s observed FAIL_DETAIL for `clean` includes `git merge-base --is-ancestor --end-of-options ... failed (status=129)` and `unknown option`: removing --verify let the literal option leak into the resolved revision text. M04 kept exit 2 but changed the expected `revision_unresolved` to `git_failed` for missing object IDs.

## Survivors / GateBindAnchor handoff
- **M02:** attached-only symbolic-ref resolution survives 59/59. Detached HEAD makes `symbolic-ref -q HEAD` nonzero, so this default cannot certify the detached lane. The existing suite does not exercise that state.
- **M03:** a hard-coded detached fallback to `refs/heads/main` survives 59/59. Existing fixtures initialize attached main, so the fallback is unexercised. A new fixture must distinguish master from main (or omit main) as well as from the poisoned detached HEAD.
- **[INFERENCE] Expected strengthened detector:** a no-`--at` fixture with `refs/heads/master` at the legitimate tip, off-branch detached HEAD at a different input tree, and clean expected tip evaluation should kill M02 and M03 when main is absent or distinct. Actual round-17 case execution is not claimed here; only the baseline was assigned/run.
- **M12:** modification-only diff filtering survives 59/59. It suppresses added/deleted/type-changed paths; the named baseline input-drift case only rewrites an existing file. This is a separate coverage gap, not proof that a detached-HEAD-only case closes it. No new add/delete test was run or contract relaxed.
- GateBindAnchor received the M02/M03 fixture discrimination requirement and M12 finding by exact-id peer message.

## Hash and restoration evidence
Full SHA-256 gate baseline/restoration H0 = `1f84fb545f76ad776fc88411319dcd2d8145187014ca34bf569753acdde8b1f6`.
Full SHA-256 unchanged selftest HT = `481eefaec846fa8a58390652f7825122aef57a8ceb6de2fdb06d96f58c3414b3`.
Hashes came from `sha256sum` before and after every mutant/restored detector. Every mutant was reversed surgically; all 12 restored gates matched H0 exactly and all selftests remained HT. All recorded before/after hashes within each detector agreed.
| Mutant | Gate SHA-256: pristine → mutant → restored |
|---|---|
| M01 | H0 → `2c2ecb662affceb1afa67f082f30f8eaae2275e6e16831bdfd3a2cff38cba2b2` → H0 |
| M02 | H0 → `5a05a75f3fc924e6e8007f93dca31dddc8e22aa9f34596ad31dc611ea1e3467b` → H0 |
| M03 | H0 → `e8288d1f86702c4c24abe7b0258e6dad96f1c8743ea9573a5cb80d97ead3ed71` → H0 |
| M04 | H0 → `6a972504cb80c054d2116c09ae52d77ef697e855dbe55288537c380251758588` → H0 |
| M05 | H0 → `29a61a8c976d91c2113c10f5324164a92e79d834c2f48c669ac38b0c3798dab6` → H0 |
| M06 | H0 → `6a94b256ed761ee0e321c8682e67d63519c22962ed67309e655c7e946a4bf95c` → H0 |
| M07 | H0 → `de826719337241d19d955f285af1a2dd64cfdb06567fc840012e384a4061aec9` → H0 |
| M08 | H0 → `b27c6fefb25905e21afa3ecf0e504f39fce1fa331126ac68fe00dd2cdac63195` → H0 |
| M09 | H0 → `fdf55eacd21c4f1910fffe316b06469b4917beeac4d0c7c52b6b31dd7bb74bbf` → H0 |
| M10 | H0 → `18f1e519c979bafebfc2701a57310c8c834be7bfb6e5c0f28377a7b2882524a9` → H0 |
| M11 | H0 → `123b9f9ad8dd650be7a6593b195f253962abbd824a7e9696200ef1cbf09829c4` → H0 |
| M12 | H0 → `c805aaa42c5c7b8be250d4b3d51a5a0228b9bd2393a3b63b4cae07fb93f4804e` → H0 |
All three restored scratch clones were removed after their final green detector and hash capture. Cleanup command `rm -rf -- /tmp/tabi-r17-MutBindSelftest-u9nyi4nh /tmp/tabi-r17-MutBindSelftest-7g7gwakg /tmp/tabi-r17-MutBindSelftest-8egmu4en` exited 0; stdout: `Removed restored sandboxes A, B, C; rm exit=0`.
Lane source, frozen surfaces, Git/jj state, and sibling files were never written. Only this report persists.
Tooling: existing Node `v24.21.0`, Git `2.56.0`; no tools installed/upgraded, no pacman transactions, no REA/browser/runtime service invoked.

Files written:
- `.ufo/waves/round-17/w1/MutBindSelftest.md`
