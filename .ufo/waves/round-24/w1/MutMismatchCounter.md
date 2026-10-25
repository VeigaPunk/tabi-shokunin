# MutMismatchCounter — C2 mutation matrix

## Result

**Inconclusive; requested production-counter matrix not executed.** The frozen gate source is absent at the baseline revision: exact command `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree HEAD scripts/check-selfassessment.mjs` (HEAD `573c99e4885382db38babc3a6fc90e77afeb42a6`) returned no entry. Consequently there is no production C2 detector to execute on pristine, mutated, and restored copies, and no actual finding ids or outputs can honestly be reported. The assignment requires those executions and exact restoration evidence; expectations below are specification, not observed results.

I did not mutate SCORECARD.md, use git/jj writes, or install tools. Scratch fixtures were not created because the detector/fixture schema is unavailable; therefore no byte changes or hashes are claimed.

## Required production behavior (expected matrix, unverified)

| Case | Exact fixture delta relative to corrected copy | Expected result |
|---|---|---|
| (a) stale tally | In the targeted gate selftest claim, replace the corrected tally bytes `13/13` with `12/12` (four bytes changed: `13`→`12` in numerator and denominator) | m1 finding for that claim; non-clean |
| (b) correct tally | Keep `13/13` unchanged | no m1 finding; clean if no other mismatches |
| (c) contradictory receipt | Change only the recorded exit field to the value opposite the named read-only command's actual exit; command and other receipt bytes unchanged | m2 finding identifying that receipt; non-clean |
| (d) clean receipt | Keep recorded exit equal to actual command exit | no m2 finding; clean if no other mismatches |
| (e) unparseable claim | Replace the tally token `13/13` with a non-tally token such as `unknown` | could-not-evaluate finding (not a clean match); non-clean/usage behavior must be specified by counter |

Finding-id spellings are not available from the frozen C2 contract; they must be asserted by the production `--selftest` and reported by id, not guessed. C2 requires `m1-selftest-tally`, `m2-receipt-exit`, and unparseable claims reported as could-not-evaluate (not matched clean). The claims file states the expected C2 selftest runs on fixture copies; exact frozen source: `.ufo/waves/round-24/claims.json` lines 36, 43–44. No detector output, verdict, or byte hash was observed.