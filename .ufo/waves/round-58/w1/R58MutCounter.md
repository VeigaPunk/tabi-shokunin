# R58MutCounter — MUTATE-RUN-REVERT on the r58 C2 counter (scoped wave findings)

- Seat: R58MutCounter (mutation-tester, leaf). Lane base revision
  `051f433dd49880d652407f1c02f8a15646602bbe`. Read-only on the repo; mutants lived in
  scratch only.
- Frozen authority: `.ufo/waves/round-58/claims.json` C2 (the counter under test implements
  it) — not amended. This seat attacks the instrument; the kill rule stays the L1's to apply
  at the data pass.
- Status: **complete. All five assigned mutants KILLED; unmutated selftest green (78/78).**
  No live data run, no browser, no git/jj mutation, no installs.

## Bytes probed

| file | sha256 | bytes |
|---|---|---|
| `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs` | `632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52` | 83 630 |
| fixtures dir | 78 cases | 49 finding ids |

The sha matches the author's declaration in `counters/R58Counter.md` and stayed unchanged
during and after the probe (re-hashed after every mutant and before this report; the file was
stable for 120 s across four 30 s polls before probing). `--self-check`: status ok, 78
fixtures, same sha.

## Baseline (independent of the authoring seat)

`node chromium-receipt-r58.mjs --selftest` on the unmutated repo bytes → exit 0,
`allPass true`, **78 cases / 78 pass**, id coverage 49/49, uncovered [], stray [].
Receipt: `mutant-counter/selftest-independent.json` (+ full stdout `.log`).

## Mutations and verdicts

| id | single logic change | expected detector | observed | verdict |
|---|---|---|---|---|
| m1 | drop `if (bs.defaultPrevented !== true) add('swallow-defaultprevented-missing', …)` | selftest case `swallow-defaultprevented-missing` + fixture CLI | baseline 78/78 → mutated 77/78; case wants `[swallow-defaultprevented-missing]`, got `[]`; CLI pristine exit 1 `[swallow-defaultprevented-missing]` → mutant exit 0 `[]` | **KILLED** |
| m2 | weaken the value-unchanged witnesses to a prefix test (`bs.valueAfter` and `dg.valueAfter` `startsWith(pre)`) | case `swallow-value-changed` (suffix drift `"0f1"` over `"0f"`) | 77/78; case wants `[swallow-value-changed]`, got `[]`; CLI exit 1 → exit 0 `[]` | **KILLED** |
| m3 | drop the one-submission block `if (echoes.length !== 1 \|\| submissions.length !== 1)` | case `swallow-enter-chord-leak` (second `/echo`) | 77/78; case wants `[swallow-enter-chord-leak]`, got `[]`; CLI exit 1 → exit 0 `[]` | **KILLED** |
| m4 | weaken the nonce binding `^tabi-r58-[0-9a-f]{12}$` → `^tabi-r58-` | case `nonce-shape` (11-hex nonce) | 77/78; case wants `[nonce-shape]`, got `[field3-not-empty, swallow-plan-mismatch, swallow-recorder-fields-missing]`; CLI pristine exit 1 `[nonce-shape]` → mutant exit 1 `[swallow-recorder-fields-missing, swallow-plan-mismatch, field3-not-empty]` | **KILLED** |
| m5 | drop the per-entry block `if (typeof e.cancelable !== 'boolean' \|\| typeof e.defaultPrevented !== 'boolean')` | case `swallow-recorder-fields-missing` (control entry lost `cancelable`) | 77/78; case wants `[swallow-recorder-fields-missing]`, got `[]`; CLI exit 1 → exit 0 `[]` | **KILLED** |

m2 is one predicate weakening applied at the two negative-edit witness sites the counter's
header names; both edits and the untouched Enter re-read are disclosed in `m2-kill.json`.

## Restoration evidence

Every mutant ran on a scratch copy; the pristine copy's selftest was green before mutation
(a red baseline would have been inconclusive, not a kill); pristine bytes were restored after
the run. All five receipts record `restore.equalsPristine true`,
`restore.repoBytesUntouched true`, `afterRestoreSha256 =
632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52`. Mutated shas (per receipt):
m1 `6d395536…`, m2 `0692c6a0…`, m3 `7e74e201…`, m4 `3c66e7e3…`, m5 `3fa29fd3…`. Scratch tree
removed at yield; receipts copied into `mutant-counter/` first.

## Findings for the next generation (scan-based; NOT probed)

Scan of the 76 parseable fixture receipts (the absent/unparseable cases excluded) shows these
sibling sub-pushers have no seeded detector. This is **[INFERENCE]** from the receipt scan, not
extra mutation runs (this seat stops after its assigned probes and does not widen the counter):

- `backspaceSwallow.valueAfter` drift — 0 seeded receipts (only the digit block drifts). A
  Backspace-only weakening of the value-unchanged clause would survive today; m2 had to weaken
  both sites for the stated consequence to hold suite-wide.
- `digitSwallow.defaultPrevented` and `enterChordSwallow.defaultPrevented` block flags — 0
  seeded receipts each.
- A request row carrying `field3` — 0 seeded receipts; the absent-`serverRequests` push is
  reached only with a usable nonce, and all five receipts without `serverRequests` are
  nonce-unusable, so that push is effectively unexercised.
- `fixtureDelta` with an incomplete recorder-field name list, or
  `witness.allCarryAdditiveFields === false` — 0 seeded receipts each (only “fixtureDelta
  absent” is seeded, via `do-nothing-no-swallow`).

Suggested r59 cases: one per unseeded pusher. No predicate changed here.

## Receipts (written by this seat)

| Path | Content |
|---|---|
| `mutant-counter/selftest-independent.json` + `.log` | unmutated selftest, 78/78, allPass true, 49/49 ids |
| `mutant-counter/m1-kill.json` … `m5-kill.json` | edits, baseline/mutated outputs, lost assertion, fixture CLI runs, hashes, restore evidence |
| `mutant-counter/README.md` | one summary line per mutant |
| `mutant-counter/R58MutCounter.md` | full report (same findings, expanded method) |
| `w1/R58MutCounter.md` | this scoped report |

Bounds: reads + `--selftest`/`--self-check` only on the repo; writes confined to
`mutant-counter/`, this file and the scratch root
`/fast/scratch/hyaku/tabi-r58/R58MutCounter/`; no corpus/, no `.ufo/state/`, no MANIFEST.json,
no scripts/, no sibling repo, no system temp path, no installs, no live data run.
