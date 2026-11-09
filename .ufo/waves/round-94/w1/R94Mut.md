# R94Mut — mutation sweep over the frozen C1 counter

Seat: R94Mut (leaf member). Milestone: counter mutation sweep pinned to frozen bytes.
Lane untouched: no git/jj, no commits, no chromium, no driver run, no subagents, no background jobs left.

## Pins (verified)

| artifact | sha256 | check |
|---|---|---|
| `scripts/check-backendnode-collision-round94.mjs` (frozen counter) | `d7fd2cbe0899ec59b639752d99f3cd22594dbe600300596cdcc6ce30abf2a95a` | `sha256sum` on lane file; asserted again inside `R94Mut-mutate.mjs` before any mutant (exit 2 on mismatch) |
| `scripts/negatives-backendnode-collision-round94.mjs` (battery) | `b750ee17b7784d23fbc6c13f5356d1485f05f5702023e48f928730b6cfcd7822` | matches `controls/instrument-sha256.txt` |
| `scripts/chrome-cdp-backendnode-collision-round94.mjs` (driver pin) | `518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f` | matches `controls/instrument-sha256.txt` |
| `controls/receipt-positive.json` (nonce `tabi-r94-ctl-positive`) | `f511f644e0a0073d4bce0f8d2001cb6836c1e4e6e55fe5a153962a5fc4eafa7c` | copy at `w1/R94Mut-receipt-positive.json` (same sha) |

Scratch (deleted before yield): `/fast/scratch/hyaku/tabi-r94/R94Mut/` holds the lane copy
(`lane/scripts/` = the three instruments, `lane/corpus/evidence/round93/chromium-oopif-backendnode-scope/receipt.json`
= the r93 receipt, copied from the lane) and per-mutant lanes under `mutants/`.
Each mutant gets its own scratch lane; the battery resolves counter and r93 receipt from `--lane`, so the
lane is never written.

## Baseline (pristine counter, before any mutant)

```
node <scratch>/lane/scripts/negatives-…mjs --lane <scratch>/lane --receipt .../controls/receipt-positive.json \
  --expect-nonce tabi-r94-ctl-positive --expect-driver-sha256 518f40ff…9686 --scratch <scratch>/battery-base --json
→ rc 0, cases 74, ok 74, failed []   (positive: rc 0, ids [])
node <scratch>/lane/scripts/check-backendnode-collision-round94.mjs --lane <scratch>/lane \
  --expect-driver-sha256 518f40ff…9686 --receipt .../controls/receipt-positive.json --expect-nonce tabi-r94-ctl-positive --json
→ rc 0, verdict clean, checkCount 165, findings []
```

Matches the L1 control table (positive: rc 0, 165 checks, 0 findings; battery 74/74).

## Method

- `w1/R94Mut-mutate.mjs` (final, pinned): 70 mutants. Each is one exact string replacement; the anchor
  is asserted to occur exactly once in the pristine bytes (0 setup failures in the final run). Each mutant
  is `node --check`ed, then the battery runs against the mutated counter with `--json`.
- killed = battery exit 1 (`status === 1`), per the assignment. Killed has two sources, recorded separately:
  - `positiveOk: false` — the mutated counter fails the positive control itself;
  - `killedBy` — the battery negative cases the mutated counter fails to reproduce (empty means every
    negative still got its expected id).
- Outputs: `w1/R94Mut-results.json` (mutant id, theme, old anchor, new text, killed, rc, positiveOk, killedBy)
  and `w1/R94Mut-mutate.mjs`. The run log lives only in scratch and is not cited.
- Interim history, superseded: an earlier pass had 6 anchors that matched twice or zero times. Those were
  rewritten with unique anchors (M27, M39, M40, M43, M44, M51) and the sweep was rerun whole. The earlier
  "71" count from patched runs is not used; the final count is 70.

## Result

`mutantCount 70 · killed 65 · survived 5`. No syntax-error mutants, no setup failures.

Kill attribution (from `R94Mut-results.json`):
- 9 kills where the positive control stayed clean and at least one negative case failed to reproduce.
- 56 kills where the positive control itself fails under the mutant. Of these, 48 kill with no negative
  case failing (`killedBy` empty), i.e. the 74-case battery's negatives all still produce the expected
  finding ids under the mutant. The other 8 (M01, M02, M05, M06, M07, M11, M60, M65) also fail at least one negative.

Reading the 56: most mutants are caught only because they reject the clean receipt. The negative cases
check that an expected finding id appears, so a counter that over-reports the same ids passes them.
Battery strength against mutants that *widen* acceptance rests on the 9 + 8 negatives; the rest is positive-only.

## Survivors (5) and classification

Survived = battery exit 0 = the mutated counter gives the expected result on every battery case and on
the positive control.

| id | mutation (in the counter) | what it changes | wording verdict |
|---|---|---|---|
| M08-ports-range-lo | `p >= 1024` → `p >= 0` | accepts ports 0–1023 | Battery gap. Unmutated counter rejects <1024, the frozen wording says "1024..65535", so the unmutated counter does not accept what the wording forbids. No battery case has a port below 1024 (only `cdp = 70000` is tested). Benign for wording. |
| M10-ports-distinct | `size === 3` → `size >= 1` | accepts duplicate ports | Battery gap. Unmutated enforces distinct ports, matching "three distinct ports". No battery case has duplicate ports. Benign for wording. |
| M13-fresh-browser-regex | `{36}` UUID-length → `+` | accepts non-UUID-length browser ids | Battery gap. The wording says "fresh browsers" and does not state id shape. Unmutated counter is stricter than the wording, not looser. Benign. |
| M39-C-pierce-ge-to-gt | C arm `maxBackendNodeId >= B` → `> B` | rejects `max == B` (narrower) | Equality boundary is not tested. Mutant is stricter, so it does not widen acceptance. The frozen wording says "≥ B" and the unmutated counter enforces ≥, so the instrument matches the sentence. Benign for wording. |
| M56-S-pierce-ge-to-gt | S arm `maxBackendNodeId >= B` → `> B` | rejects `max == B` (narrower) | Same as M39, S arm. Benign for wording. |

Boundary evidence for M39/M56 (`controls/receipt-positive.json`): every leg's pierced max vs B is
C: max 15, B 2; M: max 15, B 302; S: max 635, B 305 (`max == B` in none of 9 legs). So neither live
evidence nor the battery exercises the equality case the ≥ wording covers.

No survivor widens what the unmutated counter accepts beyond the frozen wording. Each survivor is either a
battery coverage gap (M08, M10, M13) or a stricter mutant that the battery cannot distinguish from the
unmutated counter (M39, M56).

## Wording check (clause by clause, counter vs §Claim)

I read the §Claim arm bullets (C/M/S: describe, page root, pierce, setFileInputFiles errors/files) and the
"also requires" paragraph against counter lines 156–231. Each clause maps to a check that the unmutated
counter enforces exactly as worded (e.g. C `describe-page` `dp.documentURL === l.parentUrl`; M `page-root`
`root.backendNodeId !== B`; S `cross-answer` `crossAnswer === null && filesAfterCross === null`).
I found no clause the counter enforces more weakly than the sentence. That check came from reading, not
from a mutant, and I did not check the §Declared limits or pre-freeze probes beyond what the claim
block cites.

## Not verified / limits of this seat

- I did not run `--live` or the driver; this seat is mutation-only and the baseline is receipt-mode.
- The killed/survived result is per the battery as frozen; it says nothing about counter behaviour on
  receipts outside the battery's 74 cases beyond the 5 survivors reported above.
- No new tools were installed or upgraded.
- Chromium: none launched by this seat (no driver run). `pgrep -fa remote-debugging-port` lists no
  process from this seat (none was launched).

VERDICT C1: neutral
