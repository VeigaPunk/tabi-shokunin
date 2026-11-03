# R58MutCounter — MUTATE-RUN-REVERT on the r58 C2 counter

Seat: mutation-tester (leaf), round 58 wave w1 (the only v1 wave). Assignment: probe the NEW
r58 counter with five single-logic mutants in scratch; read-only on the repo; no live data
run; no subagent dispatch; no git/jj mutation. This probe attacks the instrument, not the
frozen claim: C2's kill rule is the L1's to apply at the data pass.

## Target under test

| | |
|---|---|
| Counter | `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs` |
| sha256 | `632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52` |
| bytes / fixtures | 83 630 B; 78 fixture cases; 49 finding ids |
| Author's declaration | `counters/R58Counter.md` declares the same sha and 78/78 — cross-checked, matches |
| Stability before probe | sha unchanged across four 30 s polls (120 s) after the author's report appeared |
| Stability during/after probe | sha re-checked after every mutant and once more before this report — unchanged |

`--self-check` (authoritative self-description of the bytes I probed):
`{"schema":"tabi-chromium-receipt-r58-selfcheck", "sha256":"632e62e4…", "bytes":83630,
"fixtureCount":78, "status":"ok"}`.

## Method (MUTATE-RUN-REVERT)

1. **Independent baseline.** Ran the unmutated counter `--selftest` from the lane repo:
   exit 0, `allPass true`, 78 cases / 78 pass, id coverage 49/49 (uncovered [], stray []).
   Receipt `selftest-independent.json`, full stdout `selftest-independent.log`.
2. **Per mutant** (scratch copy `<id>/chromium-receipt-r58.mjs` + copied fixtures dir):
   copied the counter and fixtures; verified copy sha == repo sha; ran the **pristine copy's**
   selftest and required it green (a red baseline would be inconclusive, not a kill); applied
   the edits with a uniqueness assertion (each `old` must occur exactly once); ran the mutated
   selftest; located the failing case whose expected set names the lost id; ran the seeded
   refusal fixture through the CLI on the pristine and mutated copies (same driver /
   `expectDriverSha256` / `shotFiles` options the selftest case declares); restored the pristine
   bytes and verified the restored sha; verified the repo counter's sha was still the probed one.
3. **Harness validation first.** The harness was dry-run against the r57 counter with a
   throwaway mutation (the `server-log-echo-count` push). That dry run caught an ordering bug
   in the harness — the "baseline" was being executed *after* the mutation was written, which
   would have made every kill auto-confirm. Fixed so the baseline runs on pristine bytes; the
   r57 dry run then produced baseline 70/70 green, mutant 68/70 with the exact lost id. No r58
   probe ran before that fix.
4. **Isolation.** Every selftest and fixture run executed in
   `/fast/scratch/hyaku/tabi-r58/R58MutCounter/`; receipts were copied into this directory
   before the scratch tree was removed at yield.

Mutant definitions (exact, byte-anchored on sha `632e62e4…`; line numbers as observed):

| id | mutation (single logic point) | line |
|---|---|---|
| m1 | delete `if (bs.defaultPrevented !== true) add('swallow-defaultprevented-missing', …)` | 646 |
| m2 | replace `bs.valueAfter !== pre` and `dg.valueAfter !== pre` with a prefix test (`startsWith(pre)`) | 645, 652 |
| m3 | delete the block `if (echoes.length !== 1 \|\| submissions.length !== 1) { add('swallow-enter-chord-leak', …) }` | 682–684 |
| m4 | `const NONCE_RE = /^tabi-r58-[0-9a-f]{12}$/;` → `const NONCE_RE = /^tabi-r58-/;` | 327 |
| m5 | delete the block `if (typeof e.cancelable !== 'boolean' \|\| typeof e.defaultPrevented !== 'boolean') { add('swallow-recorder-fields-missing', …) }` | 592–594 |

m2 is one predicate weakening applied at the two negative-edit witness sites the header names
(“the value read back after the swallowed Backspace or the swallowed insertion”); the optional
Enter re-read (`en.valueAfter`) was not touched. The m2 receipt records both edits explicitly.

## Results

All five mutants were **KILLED**. Baselines were green in every probe (78/78); the mutated
selftests were 77/78 with exactly the seeded case failing; the direct fixture runs show the
lost refusal id (and, for m4, the spurious admissions that replace it).

| id | expectId | baseline | mutated | failing case: want → got | fixture CLI pristine → mutant | verdict |
|---|---|---|---|---|---|---|
| m1 | swallow-defaultprevented-missing | 78/78 allPass | 77/78 | `[swallow-defaultprevented-missing]` → `[]` | exit 1 `[swallow-defaultprevented-missing]` → exit 0 `[]` | KILLED |
| m2 | swallow-value-changed | 78/78 allPass | 77/78 | `[swallow-value-changed]` → `[]` | exit 1 `[swallow-value-changed]` → exit 0 `[]` | KILLED |
| m3 | swallow-enter-chord-leak | 78/78 allPass | 77/78 | `[swallow-enter-chord-leak]` → `[]` | exit 1 `[swallow-enter-chord-leak]` → exit 0 `[]` | KILLED |
| m4 | nonce-shape | 78/78 allPass | 77/78 | `[nonce-shape]` → `[field3-not-empty, swallow-plan-mismatch, swallow-recorder-fields-missing]` | exit 1 `[nonce-shape]` → exit 1 `[swallow-recorder-fields-missing, swallow-plan-mismatch, field3-not-empty]` | KILLED |
| m5 | swallow-recorder-fields-missing | 78/78 allPass | 77/78 | `[swallow-recorder-fields-missing]` → `[]` | exit 1 `[swallow-recorder-fields-missing]` → exit 0 `[]` | KILLED |

What each kill demonstrates:

* **m1** — the swallowed-Backspace flag refusal is load-bearing: without it the
  `swallow-defaultprevented-missing` fixture becomes synthetic-green (exit 0), i.e. a page
  that recorded `defaultPrevented=false` would be admitted.
* **m2** — the negative-edit witness demands equality, not a prefix relation: the sealed
  fixture drifts `digitSwallow.valueAfter` to `"0f1"` over pre-step `"0f"`; under the
  prefix-weakened comparison the drift is admitted and the case goes green.
* **m3** — the one-submission `/echo` count is the leak witness: the fixture carries a second
  `/echo`; dropping the count check admits the chord-submitted duplicate.
* **m4** — the nonce shape binds the swallow plan: under a bare `^tabi-r58-` test the 11-hex
  `nonce-shape` receipt is admitted (`nonce-shape` disappears) and the swallow checks run
  against a nonce the plan cannot be bound to, emitting `swallow-plan-mismatch`,
  `swallow-recorder-fields-missing`, `field3-not-empty` instead. The lost assertion is
  `nonce-shape`; the mutant is not merely noisy — the refusal id it drops is the binding.
* **m5** — the per-entry recorder-field booleans are load-bearing: the fixture removes
  `cancelable` from a control entry and the case goes green when the check is dropped.

## Restoration and hashes

Every probe recorded: pristine counter sha `632e62e4…af52`, mutated sha, after-restore sha
`632e62e4…af52` (`restore.equalsPristine true`), and `restore.repoBytesUntouched true`
(the repo counter was re-hashed at the end of each mutant and matched the probed sha).

| id | mutated sha256 | after-restore | repo untouched |
|---|---|---|---|
| m1 | `6d39553657e7f00b593d76ed1a67a0924a0f52d1b7305e3e231645990b57af95` | pristine | true |
| m2 | `0692c6a07f6cac351b7ee7d73e288f2cbd39182a9e63365da00a27af037bfe96` | pristine | true |
| m3 | `7e74e201b659575215c17568d6fa6582c211286a1bcad525402f1c01aff25ed1` | pristine | true |
| m4 | `3c66e7e38b8e5c17596ab01c07b138fd0df06c542990e64bcf30fcacc601e846` | pristine | true |
| m5 | `3fa29fd35d7d9f3a4dc9dbdfc9f353d3c52c04896dbb3cd7fb26cf6326042311` | pristine | true |

The scratch copies were disposable by tasking and have been removed; the receipts below carry
the edits, the baseline/mutated outputs, the fixture runs and the restore hashes inline.

## Coverage findings for the next generation (not probed here)

The five assigned mutants all died. While choosing the mutation points I scanned the 76
parseable fixture receipts (2 cases are the absent/unparseable receipt cases) to see which
sub-pushers the suite actually seeds. Results below are **[INFERENCE]** from that receipt
scan — they were **not** run as extra mutants (this seat stops after its assigned probes and
does not widen the counter):

* `backspaceSwallow.valueAfter` drift: **0** seeded receipts (only the digit block drifts).
  m2 had to weaken both value witnesses to make “swallow-value-changed stops firing on
  suffix drift” true suite-wide; a **Backspace-only** weakening would have no detector today.
* `digitSwallow.defaultPrevented` and `enterChordSwallow.defaultPrevented` block flags:
  **0** seeded receipts each. m1 drops the Backspace block flag only; those sibling flag
  checks are unseeded.
* A `serverRequests` row carrying `field3`: **0** seeded receipts; the `withField3` push in
  `checkSwallow` is unexercised. The absent-`serverRequests` push is reached only with a
  usable nonce, and the five receipts without `serverRequests` all have nonce-unusable
  values (crossgen r56/r57, two do-nothing receipts, `nonce-shape`), so that push is
  effectively unexercised too.
* `fixtureDelta` with an incomplete recorder-field name list: **0**; with
  `witness.allCarryAdditiveFields === false`: **0**. Only the “fixtureDelta absent” push is
  seeded (`do-nothing-no-swallow`).
* Per-entry `defaultPrevented` value mismatches (as opposed to the missing-field check):
  no fixture seeds one; `swallow-defaultprevented-missing` seeds the block-level Backspace
  field only.

Suggested next-generation cases (one per unseeded pusher) are named here for the r59 seat;
none of them changes any predicate, and no counter byte was touched by this probe.

## Bounds compliance

* Repo read-only: only reads and `node … --selftest` / `--self-check`; no mutating git/jj
  command; no commit/push/stash/checkout/reset/add.
* Writes: `mutant-counter/` receipts, README and this report; `w1/R58MutCounter.md` (the
  assignment's scoped report path); scratch under `/fast/scratch/hyaku/tabi-r58/R58MutCounter/`
  only. No `corpus/`, no `.ufo/state/`, no `MANIFEST.json`, no `scripts/`, no sibling repo.
* No system temp directory is referenced by any authored file, harness, spec or receipt
  (`grep` over the receipts, logs, harness and specs); every scratch path was passed
  explicitly.
* No installs or upgrades (none were needed); no browser; no live data run; no subagent
  dispatch.
* Scratch tree removed at yield after the receipts were copied here.

## Receipts (all written by this seat)

| Path | Content |
|---|---|
| `mutant-counter/selftest-independent.json` + `.log` | unmutated counter selftest: exit 0, 78/78, allPass true, 49/49 ids |
| `mutant-counter/m1-kill.json` … `m5-kill.json` | per-mutant edits, baseline vs mutated selftest outputs, lost assertion, fixture CLI runs, hashes, restore evidence, verdict |
| `mutant-counter/README.md` | one summary line per mutant + the independent selftest line |
| `mutant-counter/R58MutCounter.md` | this report |
| `w1/R58MutCounter.md` | scoped wave copy of this report |
