# R87Critic — claims vs instruments (tabi round 87, wave w1)

Seat: R87Critic (critic, read-only). Review window: 2026-11-08 ~07:13–07:30 -03.

State read at report time:

- HEAD `24765dd9`; claims.json sha256 `ec0be7b1…` — `digestsCommit` `b1d06cf8db57` (D4);
  `freeze.txt` sha256 `b1d06cf8db57…` (D4); pinned instruments match freeze (`pins-match-freeze` green).
- Scored receipt `corpus/evidence/round87/chromium-showpicker/receipt.json`: nonce
  `tabi-r87-l1-3dd4b0802d67` (D3), driver `7c54…`, fixture `10e4…`; 34 legs.
- The dispatched target named D3 `3dd4b0802d67`. During this review the lane performed the
  documented D4 re-freeze (selftest-only) at 07:16:18–07:16:23; `plans/round-87.md:104-109` records
  it and states the scored receipt/nonce stay at D3. Both states are distinguished below where they
  diverge.

## Verdicts (one row per attack)

| # | Attack (claim) | Verdict | Artifact |
|---|---|---|---|
| C1-1 | Law "accept is not a validator on a programmatic answer" over seven token forms | **neutral** — no measured fact contradicts it; the seven is exactly the matrix's distinct raw strings | `scripts/check-showpicker-r87.mjs:685-695`; receipt legs `sp86-*`/`sp87-*` |
| C1-2 | `claims.json` C1 `countingCommand` reproduces the clean score | **falsifies-wording** — the frozen command carries the superseded D2 nonce and exits 1 | `.ufo/waves/round-87/claims.json:18`; run below |
| C1-3 | C1 leg c "selftest green" | **neutral at D4** (9/9, disclosed repair) / **falsifies-wording at the dispatched D3 pin** — the D3 selftest could not be green | `scripts/selftest-r87-gates.mjs` (D3 pin `3e41…` vs D4 `4346…`); `plans/round-87.md:104-109`; `.ufo/waves/round-87/scored/selftest.json` (0 bytes at 07:13) |
| C1-4 | C1 leg b battery 209/0/99 and kill power 66/66/0/0/0 | **neutral** — reproduced both | `.ufo/waves/round-87/scored/battery-a.json`, `killpower-a.json`; rerun results below |
| C1-5 | Four new page inputs/legs with raw attribute read from the page | **neutral** — `aa/av/a2/aws` descriptors and deliveries match | receipt `fixtureInputs` + `stateAfter`; `scripts/check-showpicker-r87.mjs:685-695` |
| C1-6 | "seven token forms" as the counter's accept census | **neutral** (scope note) — the counter also enforces the accept answer on `accept=".png"`, an eighth raw form outside the matrix | `scripts/check-showpicker-r87.mjs:151,164`; `ANSWER_LEGS` |
| C2-1 | C2 leg a: AFTER 0 mismatches / 5 claims | **neutral** — reproduced | run below; `.ufo/waves/round-87/scored/drift-a.json` |
| C2-2 | C2 leg b: BEFORE at base `24765dd9` = 5 mismatches | **neutral** — reproduced; "5" alone is not the discriminator, the detail fields are | run below; `.ufo/waves/round-87/scored/drift-before.json` |
| C2-3 | C2 statement (4): "the round-86 ledger pointer resolves to a §Narrowings headline item" | **falsifies-wording** — the row names item 1, which is the receipt-level narrowing; the headline narrowing is item 9 | `.ufo/waves/round-86/claim-falsification.tsv:3`; `plans/round-86.md:120,158` |
| C2-4 | C2 statement (5): the lesson "records the 39→40 correction", counted against repo state | **falsifies-wording** — the gate is a token test with no direction; an inverted record passes 0/5 | `scripts/check-record-drift-r87.mjs:79-83`; counterexample below |
| C2-5 | The two do-nothing C1 controls' reach | **neutral** — both exits reproduce (1, 2), but neither reaches the accept law | `.ufo/waves/round-87/controls/c1/nowork-r86-under-r87.json`, `noreceipt.txt` |
| C2-6 | Statement (2) "committed note" | **neutral** (caveat) — the note is in-tree but untracked; the wave is uncommitted | `git status`: `?? .ufo/waves/round-86/lesson-proof/` |
| C2-7 | Lane freeze identity in the round-87 lesson | **neutral** (observation) — the lesson still cites the D2 nonce; outside the five counted statements | `corpus/lessons/round-87.md:11,54-55` |

## C1 — the law and its scope

### C1-1 / C1-5 / C1-6: seven forms, measured attributes, no contradiction

`GRAMMAR` (`scripts/check-showpicker-r87.mjs:685-695`) holds exactly seven distinct raw strings:

`image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`,
`image/png,application/pdf`, `  image/png ,  .txt  `.

The receipt carries the four new inputs `aa`, `av`, `a2`, `aws` with those exact attributes in
`fixtureInputs` (page `window.__inputs()` read), and each of the four new legs delivers the named
file: `aa`←PNG, `av`←text, `a2`←text, `aws`←PNG; `stateAfter` shows the file `[name,size,type,'']`
in the target input, and the page-read `read` event returns `hex:`+the expected bytes. The per-leg
frozen shape (`LEG_SHAPE` via `acceptShape`) enforces `seq` (input+change+read), `trusted` (all
true), `act`, `files` and `state` (`scripts/check-showpicker-r87.mjs:166-176,589-600`). So the
sentence "every delivered file lands in the input's file list with its bytes, fires trusted
input+change, and the page reads the bytes back" is enforced on every measured leg, matching and
non-matching accept tokens alike. No receipt fact contradicts the law.

The counter is **not wider** than the law in the direction that matters: the `accept-grammar-law`
conjuncts are the answer's file name/bytes, the target state, the single `read` with the expected
hex, and the page-read `desc.accept` equality (`:697-704`). It does not enforce dialog filtering;
the limit ("the dialog itself is unmeasured") holds. The separate `opened: ['selectSingle']` in the
leg shape is a chooser-event shape, not the accept law.

Scope note, not a falsification: the counter also enforces the accept answer law on
`accept=".png"` (`sp84-accept-answer`, `sp84-accept-mime-answer`, `ANSWER_LEGS` at
`:151,164`). That is an eighth raw attribute form outside the seven-form matrix. The claim's
"seven token forms" is therefore the matrix denominator, not the counter's full accept census; the
limit's "not the full grammar (MIME parameters and case variants stay frontier)" remains true.

### C1-2: the frozen counting command does not reproduce the claim

The C1 `countingCommand` (`.ufo/waves/round-87/claims.json:18`) hard-codes:

```
--expect-nonce tabi-r87-l1-42a489b9d4be
```

That is the superseded D2 nonce. The receipt, `claims.json.nonce`, `freeze.txt` context and the
`doNothingControl` entry all carry `tabi-r87-l1-3dd4b0802d67` (D3). Running the frozen command
verbatim against the scored receipt:

```
exit 1, verdict "findings", checkCount 99,
findings: [ { id: "nonce-expected",
  detail: "nonce tabi-r87-l1-3dd4b0802d67 expected tabi-r87-l1-42a489b9d4be" } ]
```

With the D3 nonce (and the receipt's fixture `10e4…`) the same command is clean: exit 0,
`checkCount 99`, 0 findings — identical to `.ufo/waves/round-87/scored/counter-a.json`. The claim's
prose (leg a) is true; the claim's own counted command is not. The D4 re-freeze fixed the selftest
pin but not this line. `w1/R87Exec3.md:130-133` independently flagged the same string; this seat
reproduces the exit code and the single finding.

### C1-3: selftest green — D3 false, D4 true and disclosed

At the dispatched D3 pin, `scripts/selftest-r87-gates.mjs` (`3e41bd2e…`) set
`receiptRel = 'corpus/evidence/round86/chromium-showpicker/receipt.json'` and derived `expect`
(driver/nonce/fixture) from that round-86 receipt. Its `counter-clean` gate therefore ran the r87
counter on the r86 receipt. The exact subcommand (r86 receipt, its own identity pins) returns:

```
exit 1, verdict "findings", checkCount 95;
failed: schema, nonce-shape, plan-frozen, leg-order, leg-records, plan-calls, ...,
        accept-grammar-law, ... (30-leg plan vs the frozen 34-leg PLAN)
```

`.ufo/waves/round-87/scored/selftest.json` is 0 bytes at 07:13, consistent with no green capture.

At D4 (07:16:18), the selftest was repointed to `corpus/evidence/round87/chromium-showpicker/receipt.json`
(pin `4346700a…`, freeze `b1d06cf8…`). My run with `--skip-killpower`: `clean: true`, 8/8 gates;
`/fast/scratch/hyaku/tabi-r87/l1/selftest-d4.json` records 9/9 with `kill-power` green. The lane's
own D4 note (`plans/round-87.md:104-109`) states the D3 selftest failed on the r86 receipt and that
the D4 change is selftest-only; `claims.frozenAt` now records D4. This is a disclosed, reconciled
repair, not a hidden pass: the claim "selftest green" is true only under the D4 pin and must be
cited with the D3 receipt/nonce, not the D3 freeze.

### C1-4: battery and kill power reproduce

- Battery: my selftest run (D4, r87 receipt) — `cases 209, failed 0, coverage declared 99 /
  covered 99 / uncovered [] / unknown []`, exit 0. The battery carries per-leg cases for the four
  new legs (`scripts/negatives-showpicker-r87.mjs:164-167`) and a grammar-law case (`:296`).
- Kill power: rerun with the scored receipt and D3 pins — `mutants 66, killed 66, survived 0,
  crashed 0, unapplied 0`, exit 0; matches `.ufo/waves/round-87/scored/killpower-a.json`.
- Leg a: D3-pin counter run — exit 0, `checkCount 99`, 0 findings; matches
  `.ufo/waves/round-87/scored/counter-a.json`.

"Full coverage" here is check-level coverage (99/99 checks each have a mutant), not
conjunct-level; the r86 §Narrowings already records that distinction. No falsification.

## C2 — the five drift statements

### C2-1 / C2-2: AFTER 0 and BEFORE 5 reproduce

AFTER on the lane: exit 0, `claims 5, mismatches 0` (matches `.ufo/waves/round-87/scored/drift-a.json`).

BEFORE on a base tree extracted with `git archive 24765dd9 | tar -x` (read-only git): exit 1,
`claims 5, mismatches 5`, details identical to `.ufo/waves/round-87/scored/drift-before.json`:

```
accept-headline:   skill=false plan86=false quality161=false
mistake-evidence:  rows=2 stalePointer=true repointed=false note=false beforeSurvivors=3
sources-searchlog: round86-entry=false
ledger-pointer:    scribeRow=true pointer=true ledgerItem=false
report-corrections:count=false sources=false
```

Reach caveat for the BEFORE control: the count "5" alone is not discriminating. An empty directory
also yields `mismatches 5`, but with degenerate details:

```
mistake-evidence: rows=0 ... beforeSurvivors=null
ledger-pointer:   scribeRow=false pointer=false ledgerItem=false
```

The base-specific detail fields (`rows=2`, `beforeSurvivors=3`, `scribeRow=true pointer=true`) are
what prove the base tree; `drift-before.json` records those fields, so the control has real reach.
The report should cite the details, not only the count. (Two of the five base failures are absent
r87-introduced files, so "5" measures the whole record fix, not only stale sentences; the leg's
`before == 5` kill rule is satisfied as written.)

### C2-3: statement (4) — the ledger pointer names the wrong item

The Scribe row (`.ufo/waves/round-86/claim-falsification.tsv:3`) says:

```
plans/round-86.md §Narrowings item 1
```

`plans/round-86.md:120` item 1 is "`accept-grammar-law` is receipt-level"; the accept-headline
narrowing is `plans/round-86.md:158` item 9 ("The accept-headline narrowing (round-86 verifier
spot-check defect 3)"). The round-87 fix added item 9 but did not repoint the row. The gate
(`scripts/check-record-drift-r87.mjs:70-77`) checks only that the row contains
`plans/round-86.md §Narrowings` (`pointer`) and that the whole section contains
`accept.headline` (`item`); it never resolves the row's "item 1". It therefore returns
`ledgerItem=true` while the pointer, followed literally, lands on the wrong narrowing. The claim
as written ("the pointer resolves to a §Narrowings headline item") is false.

Smallest safe correction (record edit, not a gate change): repoint the cell to
`plans/round-86.md §Narrowings item 9`; alternatively withdraw the "pointer resolves" wording and
claim only that the section carries the item. Do not amend the frozen counter.

### C2-4: statement (5) — a token test with no direction

The gate (`scripts/check-record-drift-r87.mjs:79-83`) checks `/39/`, `/40/`, `/control/`,
`/S221\/S222/` and `/carried|not re-opened/` anywhere in `corpus/lessons/round-87.md`. The live
lesson records the correction correctly (`:46-49`), and the committed control really has 40
findings (`.ufo/waves/round-86/controls/c1/nowork-r85-under-r86.json`), so the *content* is true.
But the gate cannot tell the correction from its inverse. Counterexample, run on a scratch copy of
the nine gate inputs (only `corpus/lessons/round-87.md` changed):

```
- ... says "40 findings"; the committed control has **39** ... records carry 40 only.
```

Result: exit 0, `claims 5, mismatches 0` — the inverted record passes all five statements. The
statement is therefore not minimal in the useful sense and does not measure the relation it claims
to count; it restates the fix's tokens. Smallest safe correction within the frozen instruments:
cite the committed control's findings length (40) beside the gate, and do not present the gate's
green as proof of the correction's direction. Binding the direction would be a counter change and
is a re-freeze decision, not proposed here.

### C2-5: the two do-nothing controls' reach

- `controls/c1/nowork-r86-under-r87.json` is a saved counter output (schema
  `tabi-chrome-cdp-showpicker-r87-counter`), not the round-86 receipt. Re-running the control means
  running the counter on `corpus/evidence/round86/chromium-showpicker/receipt.json`: exit 1. Its
  failure is dominated by identity and plan (schema, nonce-shape, driver-pin/fixture-hash under r87
  pins, plan-frozen, 30 vs 34 legs) and by `prior-set-complete` (the r87 receipt is in the walked
  tree). `accept-grammar-law` fails only because the four `sp87` legs are absent. It is a
  previous-generation receipt control; it cannot distinguish a false accept law from an old
  receipt. The exit is confirmed both with the r87 pins (stored output) and the r86 receipt's own
  pins (my run, checkCount 95).
- `controls/c1/noreceipt.txt` records exit 2. Reproduced with a fresh absent path: exit 2,
  `receipt-unreadable` ENOENT. The stored transcript's path is a removed seat scratch
  (`/fast/scratch/hyaku/tabi-r87/l1/absent.json`), so the control is not self-contained; any
  absent path reproduces it. Reach is the unreadable branch only (it does not exercise malformed
  JSON).

Both exits reproduce, so C2 leg c's control clause holds; the controls' reach is identity/unreadable,
not the accept law.

### C2-6 / C2-7: caveats, not falsifications

- The "committed note" in statement (2) is
  `.ufo/waves/round-86/lesson-proof/README.md`, which is untracked at report time
  (`git status`: `?? .ufo/waves/round-86/lesson-proof/`). The whole r87 wave is uncommitted; the
  gate reads the working tree. If integration commits the wave without this note, the gate goes
  red. This is the lane's in-tree "committed bytes" idiom, not a claim failure.
- `corpus/lessons/round-87.md:11` and `:54-55` still cite the D2 nonce
  `tabi-r87-l1-42a489b9d4be` / `D 42a489b9d4be`, while claims.nonce and the receipt are D3 and the
  freeze is D4. The C2 limit ("five record statements, not every sentence in the lane") excludes
  this from the five, but it is the same identity drift as the countingCommand and should be
  reconciled before filing.

## Impacted axes and smallest safe corrections

- **C1 coverage**: the law and all C1 numbers hold (99 checks clean; 209/0/99; 66/66/0/0/0; 34
  legs; four new attributes page-read). The defect is the claim artifact's counted command
  (C1-2): replace its nonce with `tabi-r87-l1-3dd4b0802d67` (the `claims.nonce` / receipt value).
  This is a text repair, not a counter/pin/threshold/prior/kill-rule change.
- **C2 calibration**: (C2-3) repoint the Scribe cell to `plans/round-86.md §Narrowings item 9`, or
  withdraw the "pointer resolves" wording; (C2-4) cite the committed control's 40 findings beside
  the gate, and do not cite the gate alone as proof of the correction's direction.
- **Lane identity**: cite D4 pins (`4346700a`, freeze `b1d06cf8`) with the D3 receipt/nonce
  (`tabi-r87-l1-3dd4b0802d67`); reconcile `corpus/lessons/round-87.md:11,54-55` (D2 references).
  The D3→D4 selftest repair is already disclosed in `plans/round-87.md:104-109`; no hidden pass.
- The accept law itself is not falsified by any measured fact; the seven-form count is exactly the
  matrix's distinct raw strings, and the counter's extra `.png` accept legs are the same law on an
  eighth form, not a wider claim.

## Tooling and scratch

No tool installs or upgrades. Node v24 (host), read-only git (`archive`, `status`, `show`, `log`);
no mutating git/jj command. Scratch root `/fast/scratch/hyaku/tabi-r87/R87Critic/` was used for the
base-tree extraction, counters/selftest work and the statement-(5) counterexample, and is removed
before yielding. This report is the only file written.
