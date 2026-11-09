# R97Mut — counter mutation sweep (C1)

Seat: R97Mut. Target: frozen counter `scripts/check-client-oopif-uploadfile-round97.mjs`
(sha256 `8571f6b9…4cf0ee0`) vs frozen battery `scripts/negatives-client-oopif-uploadfile-round97.mjs`,
positive receipt nonce `tabi-r97-ctl-positive`, driver pin `09f0c2fe…c9e4eb`.
No --live run of this seat (all mutants were --receipt/battery only); no verdict below
implies any leg claim is false.

## Method

Scratch mirror `S=/fast/scratch/hyaku/tabi-r97/R97Mut` with
`S/lane/scripts/` (3 frozen scripts), `S/lane/corpus/evidence/round96/.../receipt.json`
(battery do-nothing case), `S/receipt-positive.json` (controls copy). Pristine baseline
first: counter `--receipt` on positive → rc 0, `verdict: clean`, 229 checks; battery →
70/70, rc 0. Each of 83 single-point mutants was written into a per-mutant mirror
`S/mirror-<id>/` and the battery run with `--lane` pointed at that mirror
(`run_battery` derives the lane from the mutant counter path). A mutant SURVIVED iff
the battery still passes 70/70 (rc 0, no failed case); KILLED otherwise (any failed
case, including `positive`, kills it — the detector fired). Runner:
`.ufo/waves/round-97/w1/R97Mut-run_mutants.py`, results:
`.ufo/waves/round-97/w1/R97Mut-results.json`.

Result: **9 survived / 74 killed / 0 invalid, of 83.** (Runner bug note: the first
sweep scored every mutant against the pristine lane — all 83 misread "KILLED". Fixed
`--lane` to the mirror and reran; the numbers below are the fixed run, ~124 s.)

## Genuine survivors (battery gaps; killer receipts verified)

All three killers: frozen counter rc 1 with the expected finding id; the mutant
counter rc 0 on the same bytes. Killers are mutated positive receipts (a forger's
copy, nonce unchanged).

| Mutant | Edit | Why it survives | Killer |
|---|---|---|---|
| M40 | drop `check('reps', receipt.reps === reps, ...)` | battery never mutates `receipt.reps` (no reps case) | `R97Mut-killer-M40-reps.json`: `reps: 999` → frozen `findings: [reps]` rc 1; mutant rc 0 |
| M42 | `receipt.missingExists === false` → `!== true` | battery only writes `true`/`false`; falsy non-`false` (`null`) slips through the weak form | `R97Mut-killer-M42-missingexists-null.json`: `missingExists: null` → frozen `findings: [missing]` rc 1; mutant rc 0 |
| M66 | resolved `outcome` check drops `errName/errMessage === null` | battery mutates `outcome+err` together (`pum-rejected`, `plm-resolved`); never a resolved leg carrying a stale error | `R97Mut-killer-M66-resolved-with-err.json`: `PLX-1 errName/errMessage` set → frozen `findings: [outcome]` rc 1; mutant rc 0 |

Fixes (battery only; frozen counter is the contract): add cases
`reps-mutated` (expect `reps`), `missing-exists-null` (expect `missing`),
`resolved-with-error` (expect `outcome`). Each killer above is the corresponding
ready-made negative case.

## Equivalent / no-op survivors (no battery change owed)

- M74: appends a `// leg-label` comment to the leg-label regex line. Bytes change,
  semantics identical.
- M80: `JSON.stringify(a) === JSON.stringify(b)` → `==`. Both sides are strings,
  so `==` and `===` coincide. Equivalent for all inputs.
- M84: prepends a `PUM` entry to the `ARM` literal before the real one. A later
  duplicate key wins in JS object literals, so the dead first entry is shadowed.
  Equivalent.

## Live-only survivors (unreachable in a --receipt battery; r96 D2/D4 class)

- M75 drop `driver-exit`, M76 drop `ports-bound`, M77 drop `missing-bound`. These
  checks execute only under `--live`; the battery's `--receipt` mode never runs
  them, so no receipt forgery can kill them. Same queue class as r96 M20/M51/M52/
  M54/M65/M67 (live killers for `driver-exit`/`ports-bound`): a live killer needs a
  driver run whose receipt carries mismatched ports / non-zero driver status /
  wrong missing path. Not built here (no --live for this seat); listed, not
  claimed as evidence either way.

## Evidence

- `R97Mut-run_mutants.py`, `R97Mut-results.json` (83 mutants, old/new strings,
  hashes, per-mutant battery ok/failed lists).
- `R97Mut-killer-M40-reps.json` sha256 `70882630…25a9b62`,
  `R97Mut-killer-M42-missingexists-null.json` sha256 `f5dd62e8…8fb92a0d`,
  `R97Mut-killer-M66-resolved-with-err.json` sha256 `38fc0155…a5b9187fd39`.
- Commands (all rc as stated): pristine counter `--receipt` rc 0; pristine battery
  rc 0 (70/70); per-mutant battery in mirror lanes (83 runs, see results);
  killer receipts vs frozen counter rc 1 each with the single expected finding;
  same killers vs the three mutant counters rc 0.
- Restoration: mirror counter sha256 after the sweep is the pristine
  `8571f6b9…4cf0ee0` (verified); pristine positive still rc 0 and battery still
  70/70 (rc 0) after all runs. Lane files untouched (no edits outside
  `.ufo/waves/round-97/w1/`). No chromium started by this seat
  (`pgrep -f remote-debugging-port=` empty). Scratch `S` to be `rm -rf`'d
  after this report is copied; per contract it lives at
  `/fast/scratch/hyaku/tabi-r97/R97Mut`.
- Tooling: no installs (node 24.21.0 + python3 only); nothing to record under
  the operator authorization; no pacman/uv/npm used.

## What this does not say

A surviving mutant is a coverage finding, not a contract change: the frozen
counter bytes and the frozen claim sentence stand. The three genuine gaps are
battery-side blind spots (receipt-mode), not counter falsehoods — the frozen
counter correctly rejects every killer above.

VERDICT C1: neutral
