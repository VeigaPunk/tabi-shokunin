FINDINGS

Seat R78Review2, tabi round 78 wave w1. Scope: `scripts/negatives-filechooser-r78.mjs` and
`.ufo/waves/round-78/controls/c1/kill-power-r78.mjs` at their frozen bytes, the 398-case battery, the
carried witnesses, the r78-new cases, and attribution of expected finding ids.

Bytes reviewed (verified at dispatch, both matched `.ufo/waves/round-78/freeze.txt`):
`sha256sum scripts/negatives-filechooser-r78.mjs` = `724887280cfc11e0c0bd05d6cd07b80c899d7546953465d2cda836d6f7a3ab1a`;
`.ufo/waves/round-78/controls/c1/kill-power-r78.mjs` = `60460ed137ed252d3e450608d4387564f536b8f691cb783c9ab967a941b45726`.
The L1 re-froze while this review ran (commit `d986c273`, "digests commit D (re-freeze)"): freeze.txt
now pins `74102f20…` / `494002e5…`, and the working tree matches it
(`while read -r h f; do …; done < freeze.txt` → 14/14 OK). Findings F1 and F2
below are **fixed in those re-frozen bytes** (verified by diff and by a clean run); F3–F5 persist.
All bracket/witness measurements bind to the receipt I was given,
`corpus/evidence/round78/chromium-file-chooser/receipt.json` sha256
`203dcef9765a74c4c274c0194a506f9189cbb40372758a921bf143e7c7ffd560` (79 events, 11 own gaps,
absNeed 40, gapNeed 9). The re-frozen battery re-derives the same block on the same receipt
(`refrozen-battery.json`: `brackets {events:79, gaps:11, absNeed:40, gapNeed:9, gapLeg:"script-click"}`).

Method. The lane's own counter refused honest receipts while a gate log sat inside the walked tree (F5);
to measure the instruments I copied `scripts`, `.ufo/waves/round-78`,
`corpus/evidence/round78` and `corpus/evidence/round77` to `/fast/scratch/hyaku/tabi-r78/R78Review2/lane`
and stripped that one file's non-JSON trailer. Nothing else differs. Every mutant is a copy of the
counter with one exact-once edit (the harness refuses an edit string that does not occur exactly once),
run through a copy of the battery with `--first-failure`; every case receipt is re-derived independently
in Python (`brackets.py`) from the prose rule, not from the JS. Artifacts are under
`.ufo/waves/round-78-seats/R78Review2/`.

## 1. Brackets — HOLD (every case sits where it claims)

Pristine battery on the mirror: `node …/negatives-filechooser-r78.mjs --lane … --real … --json` exit 0,
`cases 398, passed 398, allOk true, coverageGap [], positiveOk true` (`pristine-battery.json`). My own
re-derivation of each bracket case (`brackets-summary.json`, `brackets.py`):

| case | my computation | decisive side | mutant that kills it |
|---|---|---|---|
| `replay-timeline-tol-in-0.049` | abs 79 / need 40, gap 7 / need 9 | pair tolerance (abs) | TOL 0.045 |
| `accept-prior-retimed-0.051-scattered` | abs 0 / 40, gap 8 / need 17 | pair tolerance (accept) | TOL 0.0511 |
| `replay-timeline-abs-at-threshold` | abs 40 = 40, gap 5 / 9 | abs fraction | FRAC 0.5064 |
| `accept-prior-abs-below-threshold` | abs 39 / 40, gap 2 / 14 | abs fraction (accept) | FRAC 0.4936 |
| `replay-timeline-gap-at-threshold` | gap 9 = 9, abs 0 / 40 | gap fraction | GAP_FRAC 0.8182 |
| `accept-prior-gap-below-threshold` | gap 8 / 9, abs 0 / 40 | gap fraction (accept) | GAP_FRAC 0.7272 |
| `replay-timeline-gaps-added-own-denominator` | ownGaps 13, gap 9 = need 9 (own denominator would need 10) | prior denominator | GAP_FRAC 0.8182 |
| `accept-gaps-added-prior-below` | ownGaps 13, gap 8 / 9 | prior denominator (accept) | GAP_FRAC 0.6 |
| `replay-timeline-own-gap-49.9` | ownGaps 10 < 11, priorIdx −1, shrunk gap 49.89999997615814 | own-gap floor | MIN_OWN_GAPS 10 / GAP_MIN 49.85 |
| `accept-own-gap-50.1` | ownGaps 11, gap 50.09999997615796 | own-gap floor (accept) | GAP_MIN 50.1 |
| `event-time-quantum-bracket-2e-5` | 1 off-grid event, residual 2.0000000040454324e-4 | grid tolerance | tolerance 0.02 |
| `accept-grid-5e-6` | residual 5.0000002374872565e-5 | grid tolerance (accept) | tolerance 5e-5 |

No case's expected id is produced by the other clause: the counter's own detail block reports the
decisive side for every `replay-event-timeline` case (`sweep.json`), e.g. `own-gap-49.9` and
`too-few-gaps` both report `prior #-1 … own >= 50 ms gaps 10, need >= 11`, and `tol-in-0.049` reports
`{"absMatched":79,"absNeed":40,"gapMatched":7,"gapNeed":9}`. The placement guard `placed()` throws on a
misplaced bracket, so a misplacement aborts the battery instead of passing silently.

Equivalent ranges at this receipt's granularity (measured by probing mutants at and just across each
edge; `probes.json`, `probes3.json`). Each interval reproduces the frozen battery's outcome exactly:

| constant | equivalent interval | below it | above it |
|---|---|---|---|
| `TOL` 0.05 | (0.04899999999997818, 0.05100000000038563] | `replay-timeline-tol-in-0.049` stops refusing (abs 79→<40) | `accept-prior-retimed-0.051-scattered` starts refusing (abs 0→40) |
| `GAP_MIN` 50 | (49.89999997615814, 50.09999997615796] | the 49.9 ms gap counts again, ownGaps 10→11, case accepts | the 50.1 ms gap stops counting, ownGaps 11→10, case refuses |
| grid tolerance 1e-4 | [5.0000002374872565e-5, 2.0000000040454324e-4) | `accept-grid-5e-6` refuses | `event-time-quantum-bracket-2e-5` accepts |
| `FRAC` 0.5 | (0.49367088608860754, 0.5063291139240507] | need 39, both abs accept cases refuse | need 41, `abs-at-threshold` accepts |
| `GAP_FRAC` 0.75 | (0.7272727273636364, 0.8181818181818182] | need 8, both gap accept cases refuse | need 10, both gap refuse cases accept |
| `MIN_OWN_GAPS` 11 | {11} | 10: `own-gap-49.9` and `too-few-gaps` accept | 12: the honest receipt itself fails (`killed-positive`) |

Probe outcomes (35 mutants): survive at 0.049/0.0491/0.0505/0.051, 49.9/50.05, 1.5e-4/2e-4,
0.4937/0.5063, 0.7273/0.8181, 11; killed elsewhere, always by the case named above. The nominal
"0.049" and "0.051" are float-represented as 0.04899999999997818 and 0.051000000000385626, so the
bracket is tight to ~4e-13 ms on both sides — it cannot be widened without the battery noticing.

## 2. Carried witnesses — 6/6 hold in both directions

(The battery carries 32 `witness-*` entries, 31 unique names — the duplicate is F2 — not 33.)
Pristine: each case passes with its expected id and only declared extras (`pristine-battery.json`).
Mutant: the r77 survivor edit (or its r78 equivalent) makes the case fail with the expected id gone.
A witness is decisive only when the expected id disappears while the declared `alsoAllowed` ids remain:

| witness | pristine ids | mutant | mutant result |
|---|---|---|---|
| `witness-event-types-file-quad` | event-types + leg-pick-same-files, cancel-law | `f.length === 3`→`>= 3` | fails; ids `leg-pick-same-files, cancel-law` (event-types gone) |
| `witness-leg-records-error-code-float` | leg-records + leg-not-file-input-error, not-file-input-law | `Number.isInteger(e.code)`→`num(e.code)` | fails; ids `leg-not-file-input-error, not-file-input-law` |
| `witness-cdp-event-log-aftersend-float` | cdp-event-log-closed + 3 declared | `Number.isInteger(e.afterSendId)`→`num(…)` | fails; ids `chooser-event-binding, leg-pick-single-opened-mode, activation-law` |
| `witness-node-binding-law-three-inputs` | node-binding-law + 4 declared | drop `Object.keys(nodeOf).length === 4` | fails; node-binding-law gone |
| `witness-host-argv-duplicate-headless-new` | host-argv alone | `same(hargv, argvWant)`→length only | fails (full run: 9 host-argv cases fail, incl. this one) |
| `witness-chooser-event-binding-set-gap` | chooser-event-binding alone | drop `l.setSendId !== e.afterSendId + 1` | fails; ids `[]` |

(`probes2.json`; the argv mutant needed a full run because `--first-failure` stops scheduling before the
witness is reached — `w5full-battery.json`.)

## 3. r78-new cases — 6/6 fail for the stated reason (one caveat)

| case | pristine result | stated reason, as reported | causation mutant |
|---|---|---|---|
| `prior-set-complete-escaped-schema` | exit 1, exactly `prior-set-complete`, names `.ufo/waves/round-78/escaped.json` | the file is parsed, not byte-gated | re-add `if (!bytes.includes(SCHEMA)) continue` → case passes |
| `prior-set-complete-contradictory-nonce` | exit 1, exactly `prior-set-complete`, names `contradictory.json` | exemption is a path, not the nonce | correct nonce exemption → this is the **only** failing case, ids `[]` |
| `fixture-descriptors-attribute` | exit 1, `fixture-descriptors` detail `m:multiple` + `mode-law` (declared) | page-measured attribute | force the check true → case fails |
| `fixture-descriptors-point` | exit 1, `fixture-descriptors` lists 7 legs `:point outside` | rect contains the commanded point | replace the rect test with `isObj(dsc.rect)` → case fails |
| `host-argv-decoy-user-data-dir` | exit 1, `host-argv`, detail shows the decoy at argv[5] | whole-array equality | length-only comparison → case fails |
| `receipt-fields-extra` | exit 1, `receipt-fields`, detail lists `extraBookkeeping` | closed key set | force the check true → case fails |
| `tree-exempt-absent` (selftest) | exit 1, exactly `prior-set-complete`, names p1 **and** the scored receipt | see F3 | nonce exemption → still exit 1 |

## 4. Attribution findings

**F1 (High, kill-power validity — fixed in the re-freeze).** `M-walk-nonce-exemption-reintroduced` was
mis-specified by operator precedence. The frozen edit produced
`… && (j.nonce !== expectNonce || (rf !== selfReal && …))`, which is true for *every* file whose nonce
differs from the expected nonce — including all ten priors. Reproduced: the honest scored receipt exits 1
with `fixture-hash` + `prior-set-complete` naming `deg-*.receipt.json` and the probe receipts
(`n2-pos.json`). So the mutant was `killed-positive` by refusing the priors, never by the receipt test,
and the claimed E2 coverage ("the receipt test") was not exercised. The correct form
(`&& j.nonce !== expectNonce && rf !== selfReal && …`) leaves the positive run clean (`n3-pos.json`,
exit 0, no findings) and is killed by exactly `prior-set-complete-contradictory-nonce`
(`n3-battery.json`, `failed:["prior-set-complete-contradictory-nonce"]`). The re-frozen kill-power line
now carries the `&&` form (`diff` at `kill-power-r78.mjs:80`).

**F2 (High, battery flake → false kills — fixed in the re-freeze).** The frozen battery declared 398
cases but only 397 unique names: `witness-leg-records-error-code-float` appeared twice
(`negatives-filechooser-r78.mjs:459` and `:460`, byte-identical; also twice in the committed bytes at
`b1f33724`, so the uncommitted TOL-witness edit did not introduce it). Both cases write the same
`work/neg-witness-leg-records-error-code-float.case`, so two concurrent cases truncate-write and read
one path. Observed once in 35 battery runs: a boundary probe whose counter was otherwise equivalent
failed with `witness-leg-records-error-code-float → receipt-unreadable` (exit 2) while the twin run
passed (`probes.json`, `grid-1.5e-4`). A flake is a *named failed case*, so `classify()` returns
`killed` — a false kill — and if it lands in either unmutated run, `holds=false` with no mutant to blame.
Ten repeat runs of the frozen battery (duplicate still present) were clean (`flake-1..10.json`, 10/10
`allOk`), so the race is rare (~1 in 45 runs) rather than absent; removing the duplicate removes the
shared path structurally, and the re-frozen battery reports `cases 397, unique 397, allOk true`
(`refrozen-battery.json`).

**F3 (Medium, selftest over-claim — persists; selftest bytes unchanged, `647239d3…`).**
`tree-exempt-absent` cannot fail for its stated reason ("the exemption is a path, not a nonce"). The
receipt under test is exempt either way (it is `selfReal`), and the given prior set's complement holds
two more unlisted receipts (p1 and the scored receipt) whose nonces differ from the expected nonce, so a
nonce-based exemption still leaves `prior-set-complete` firing: under the correct nonce-exemption mutant
the command still exits 1 with exactly `prior-set-complete` (`tea-n3.json`). The case is a valid test of
"an unlisted pre-freeze receipt is refused", but the property in its comment is actually witnessed by
the battery's `prior-set-complete-contradictory-nonce` (F1's second direction).

**F4 (Low, diagnostics — persists; counter bytes unchanged, `d3a8fd87…`).** Two cases fire their
expected id with a detail that does not name the violated clause: `event-leg-window-order` reports
`… labelled leg window: 0` (the detail counts window violations, while the case breaks the
non-decreasing-`at` clause), and `leg-order` fires `leg-records` with an empty reason list (the
`legs.length === FROZEN.length` clause is not reported). Attribution is still correct — the mutations
can only hit those clauses — but a reader of the summary cannot tell why the id fired.

**F5 (Medium, live-tree hazard — persists; routed to the L1).** The prior-set walk parses every regular
file and classifies as JSON-looking anything whose first 64 bytes match `/^\s*[[{]/`, extension-
independent; a file that looks like JSON and does not parse is refused. The L1's own gate log
`.ufo/waves/round-78/scored/selftest-r78-gates.out` (valid JSON body plus the trailer
`clean=true cases=15 failed=none`, parse failure at byte 7629) made the honest scored receipt exit 1
with `prior-set-unparsable` (`c1-pristine.json`). This breaks every honest run, including kill-power's
unmutated control, which would report `holds=false` rather than a kill. The live state is clean now
(`c1-recheck.json`: exit 0, `walk {outside:[], unparsable:[]}`, 186 checks).

Not found: no refusal case fires an undeclared id (the battery enforces `extra.length === 0`; 372/372
refusal cases pass), and every `event-types` case maps to exactly one clause under an independent
re-implementation of `typed()` — `act-on-read`, `extra-key`, `file-size-float`, `files-on-pointer`,
`half-null-xy`→`x/buttons-null-pair`, `read-ts-after-at`, `ret-on-pointer`, `trusted-string`,
`ts-string`, `unknown-type`, `x-float`, and the five witnesses to `fileev-files`/`read-files`/`ts`/
`x/y-null-pair`. `leg-records` details name the exact clause for 50 of 51 cases (the exception is
`leg-order`, F4). The r77 row-3 class (an expected id produced by an unrelated rule) is therefore absent from the
brackets, the replay family and the two aggregate ids I could attribute mechanically.

## Residual risk and verification gaps

- The equivalence intervals are properties of *this* receipt (79 events, 11 gaps, and its exact float
  event times). `placed()` re-derives the needs from any receipt, but the edges must be re-measured if
  the re-run's event times differ; a re-freeze with a new nonce produces a new receipt.
- I did not re-run the full 262-run kill power on the re-frozen bytes. The one changed mutant was
  verified directly (positive clean, killed by exactly one case); the other 259 mutants and the
  force-true set are unchanged by the diff.
- The flake is rare (1 in 45 battery runs). Ten clean repeats of the frozen battery are consistent with
  a low rate, not with absence; the re-frozen battery's single clean run plus the structural removal of
  the shared path is the evidence that it is gone.
- The must-accept side of each bracket is only as strong as the loosening mutant I ran. A mutant that
  changes two constants at once could still survive; I probed one constant at a time.
- `witness-event-types-half-null-xy` mutates `buttons`, not `y`; the name is a misnomer for the clause it
  covers (`x/buttons-null-pair`). Naming only.

Report: .ufo/waves/round-78/w1/R78Review2.md
