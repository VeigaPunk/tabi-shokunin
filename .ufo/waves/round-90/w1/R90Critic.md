---
seat: R90Critic
round: 90
wave: w1
lane: /home/vgpnk/Projects/shokunin/tabi-shokunin
base: a9f1da08
reviewed_at: 2026-11-08T11:2x-03:00
claims: .ufo/waves/round-90/claims.json (frozen; C1 lines 9-23, C2 lines 25-37)
freeze: .ufo/waves/round-90/freeze.txt
scope: claims vs instruments — attack/verify, no edit outside this file
---

# R90Critic — claims vs instruments

Nothing below proposes a change to a predicate, counter, pin, prior, threshold or kill rule.
Where a claim overstates an instrument, the correction offered is claim/record text, and it is
marked as such. Every measurement below was run on the lane's bytes at `a9f1da08` + uncommitted
r90 work; the scratch paths used are deleted before yield, so the numbers are reproduced inline.

## 0. What was executed (all read-only against the lane)

| # | command | observed |
|---|---|---|
| 1 | `check-showpicker-round90.mjs --lane <lane> --receipt corpus/evidence/round90/.../receipt.json --expect-driver-sha256 ac5a… --expect-nonce tabi-r90-l1-e573334c78fa --expect-fixture-sha256 5fb1… --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json` | exit 0, `verdict clean`, `checkCount 107`, `findings []` |
| 2 | same counter, `--receipt .ufo/waves/round-90/controls/c1/nowork-r89-under-r90.json` | exit 1; findings `schema`, `nonce-shape`, `nonce-expected`, `driver-pin`, `fixture-hash`, **`plan-calls`**; plan-calls detail includes `sp89-accept-domread-{text,png,multimime,whitespace}:settle-eval 0` and `:settle-order` |
| 3 | `sha256sum` of the control vs `corpus/evidence/round89/chromium-showpicker/receipt.json` | both `78eb6ceac46ae68b3d49ac748e18746af05b94232d05f1521fb81ea00704b938` (byte-identical; the "before" is the committed r89 receipt) |
| 4 | `check-record-drift-round90.mjs --lane <lane> --json` | exit 0, `claims 8`, `mismatches 0` |
| 5 | same gate, `--lane` = `git archive a9f1da08` unpacked into scratch | exit 1, `claims 8`, `mismatches 7`, exactly the claim's set |
| 6 | `selftest-r90-gates.mjs --lane <lane> --work <scratch> --skip-killpower --json` | exit 0, `cases 10`, `failed []` (incl. `pins-match-freeze`, `counter-clean`, `battery` 225 cases/0 failed/coverage 107/107, `nowork-control` exit 1, `noreceipt-control` exit 2, `record-drift` 8/0) |
| 7 | `diff` r89 vs r90 driver and counter; `check('…')` id sets | drivers: 64 changed lines, 62 are `tabi-r89-*`→`tabi-r90-*`/schema renames, **one substantive line** (line 597); counters: identical 59 `check('…')` ids, `checkCount` 107 both |
| 8 | 7 receipt mutations against the counter (table in §2) | 6 caught, 1 not a real mutation (see M4) |

Environment note (observation, not a finding against a claim): `freeze.txt` was **rewritten**
while this review ran — mtime `11:09:33` → `11:23:23`. At 11:09 it pinned
`06c67275…` (battery) and `686cb665…` (kill power); it now pins `6dc63daf…` and `95f59965…`,
i.e. the D2 repair recorded at `plans/round-90.md:106-116`. The ticket's pins for those two
files are therefore no longer the frozen bytes. Counter, driver, drift gate, runner and both
priors are unchanged since D1. The scored receipt and nonce are unaffected (D2 is post-scoring);
C1 leg (b) is simply measured on instruments that post-date the scored run, which the plan
discloses. `.ufo/waves/round-90/w1/` has no `scored/` artifacts yet, so legs (b)/(c) are green
via the gate runner, not via a frozen scored file.

## 1. C1 — does "the settle call is bound" overstate what `plan-calls` enforces?

### F1.1 The mechanism sentence is accurate — six mutations were caught (calibration-positive)

`plan-calls` (`scripts/check-showpicker-round90.mjs:576-640`) is keyed by `PLAN` name; the
domread settle logic is lines **600-616**:

- `:602` appends `{method:'Runtime.evaluate', params:{expression:'window.__inputs(true)', returnByValue:true}}` to `want`;
- `:607` `if (settle.length !== 1)` → `:settle-eval N`;
- `:609-610` `settleIx === stateIx + 1` where `stateIx` is the **first** `window.__state()`;
- `:613` `settle.length !== 0` on every non-domread leg → `:settle-eval-unexpected`;
- `:615` the call is inside the ordered `got`/`want` sequence;
- additionally `:561` `if (params.expression === 'window.__inputs(true)') return p.kind === 'showpicker-domread'` forbids it in the allowlist as well.

Mutations on a scratch copy of the scored receipt (`--receipt` outside the lane, pins held):

| mutation | result |
|---|---|
| M1 remove the call from `…domread-text`, ids renumbered | exit 1; `plan-calls`: `settle-eval 0`, `settle-order`, `sequence`, `dismiss-id` |
| M2 move the call text→png (attribution swap between two domread legs) | exit 1; both legs red (`settle-eval 0` / `settle-eval 2`) |
| M3 swap the whole `cdpSendLog` of text↔png | exit 1; `send-log-allowlist` + `plan-calls` (`trigger-id`, `answer-files`, sequence) — the `wrapperFor(target)` expression differs per target |
| M4 swap `domRead` payloads text↔png | **no finding.** All four domread legs carry the *same* 21-entry whole-page snapshot (`s…amc`), so there is nothing to swap and nothing to catch |
| M5 drop `returnByValue` from the call | exit 1; `plan-calls` sequence mismatch |
| M6 move the call after the post-dismiss `__state()` (count stays 1) | exit 1; `settle-order` |
| M7 put the call on `sp84-accept-answer` | exit 1; `settle-eval-unexpected 1` |

So "exactly one, in that position, on domread legs; forbidden elsewhere; in the ordered plan
sequence" is enforced, and a right-expression call with swapped-leg attribution is caught
(M2, M3). The one wording imprecision: the counter identifies "the settle `window.__state()`
evaluate" as the **first** `window.__state()` in the log (`:609`), not by any settle marker. On
the pinned driver the settle read is the first (scored receipt: state@22, state@25,
inputs@23 in all four domread legs), so the sentence is true *of these bytes* but is a driver
convention, not a counter fact.

### F1.2 The "before" is real on committed bytes

Finding 3: the control is a byte-identical copy of `corpus/evidence/round89/chromium-showpicker/receipt.json`
(sha `78eb6ce…`), and the r90 counter refuses it with `plan-calls` on all four domread legs.
Caveat, material to what the control proves: the same refusal also carries `answer-files` on 17
legs (r89 filenames `tabi-r89-*` vs the r90 plan's `tabi-r90-*`), and `schema`/`nonce-shape`/
`nonce-expected`/`driver-pin`/`fixture-hash`. The control is therefore **overdetermined** and is
not a single-variable witness for "the settle binding". The isolating witness is the counter's
`--selftest` domread case (`check-showpicker-round90.mjs:39-57`), which strips the call from an
otherwise-clean r90 receipt — though it strips the log entry without renumbering ids, so
`send-log-allowlist` would fire too; M1 above is the clean isolating form and `plan-calls` fires.

### F1.3 The claim's axis is wrong: the round moved an expression, not coverage

`diff` of the two drivers (`scripts/chrome-cdp-showpicker-round89.mjs` vs
`…round90.mjs`) has 64 changed lines; 62 are schema/nonce/`tabi-r89-*`→`tabi-r90-*` renames.
The only substantive line is `:597`:

```
-  … rec.domRead = JSON.parse(await evalValue('window.__inputs()'));
+  … rec.domRead = JSON.parse(await evalValue('window.__inputs(true)'));
```

`window.__inputs` is defined with **no parameters** —
`scripts/chrome-cdp-filechooser-round78.mjs:196`: `window.__inputs = function () { … }` — and
the r90 patch replaces only its id array (`check-showpicker-round90.mjs`-side driver
`scripts/chrome-cdp-showpicker-round90.mjs:139` `PATCH_INPUTS_FROM = "['s', 'm', 'd', 'k', 'f'].map"`
applied at `:153`). JavaScript ignores the argument, so `window.__inputs(true)` returns the
identical JSON as `window.__inputs()`. There is no `true` mode in the fixture.

Consequently the r90 delta is: one argument character in one call, plus a counter requirement on
its spelling. Unchanged: 41 legs (same as r89), 59 static check ids (diff empty), `checkCount 107`
(r89's `counter-a.json` is also 107), the `domRead` payload (identical across all four legs), and
the four token lists (the claim says so itself, line 11). The knowledge note concedes the
"lane convention" in its limits (`corpus/knowledge/chromium-showpicker-runtime-round-90.md`,
"What a receipt of this shape cannot prove") but does not say the argument is discarded.

**Counterexample to the coverage framing:** a receipt carrying the parsed token lists is accepted
iff the four logs spell `__inputs(true)`; the same data with `__inputs()` is refused. The
capability "gained" is the spelling of a call whose return value is identical — a calibration
(operability) constraint, not a new observation of Chromium. Nothing on the coverage plane moved
relative to r89; the claim's own `limit` (claims.json:23) only covers the first half of this.

### Verdict C1

- Predicate `C1-SHOWPICKER-R90` and legs (a)/(b)/(c) as *instruments*: hold on the measured bytes
  (leg a 107/clean; leg b battery 225/0/107-of-107 — kill power not independently re-run by this
  seat; leg c runner green).
- The **type sentence** (claims.json:11): true as a description of `plan-calls`; one imprecision
  ("the settle state read" = first state read).
- The **axis** (`"axis":"coverage"`, claims.json:10): **does not hold**. The surface the round
  moved is a call-spelling requirement with an ignored argument; coverage is unchanged, and the
  claim should be read on calibration. As written this is a coverage claim that r89 already
  satisfied.

## 2. C2 — are the eight statements the six routed defects, and do they test state?

The six routed defects are `corpus/lessons/round-89-verifier-spotcheck.md:97-105` (items 1-6,
item 6 = "Report author date"). The gate's eight statements are
`scripts/check-record-drift-round90.mjs:68-165`.

### F2.1 "The six routed defects … counted" is false (five counted, one dropped, three substitutes)

- Gate statements 1-5 map to §7 defects 1-5.
- Gate statements 6-8 are `gate-selftest` (`:117-124`), `quality161-sweep` (`:126-131`),
  `scorecard-tallies` (`:133-165`). None is one of the six routed defects; all three are r90
  self-checks that are red at base only because the r90 instruments/cite do not exist yet.
- **§7 defect 6 (report author date) is not counted anywhere**: the gate's 12 `rd(…)` reads are
  `SCORECARD.md, SKILL.md, LOG.md, corpus/QUALITY.md, corpus/lessons/round-89.md,
  plans/round-89.md, .ufo/waves/round-89/{claims.json,claim-falsification.tsv,census/end.txt},
  scripts/{check-showpicker,negatives,kill-power,selftest,check-record-drift}-round90.mjs`. It
  never reads `.ufo/reports/**`, and the header comment (`:6-7`) names `corpus/SOURCES.md` among
  the counted records, which is likewise never read.
- The claims `type` (claims.json:27) item **(6)** is "gate-selftest/quality161-sweep/scorecard-tallies",
  i.e. it substitutes those three for §7 defect 6. `plans/round-90.md:30-32` says the opposite —
  it lists the sixth statement as "report author date". The lane's plan, the gate, and the claims
  type disagree on what the sixth statement is.

### F2.2 Item (2) is false on the lane's bytes: "no lane file still cites `plans/round-89.md §Narrowings`"

`SCORECARD.md:4292` still reads:

```
Narrowings (`plans/round-89.md` §Narrowings, as forced by the wave): (1) acceptance is not …
```

This is the very block the spot-check routed ("the narrowing text lives in `SCORECARD.md`'s block
misattributing it to that plan section", lesson `round-89-verifier-spotcheck.md:26`). The gate is
blind to it because the regex at `check-record-drift-round90.mjs:87` requires the path and ` §`
contiguous; the backtick breaks the match. Measured in a scratch lane copy:

| SKILL.md content | `r89-narrowing-pointers` |
|---|---|
| ``stale pointer: plans/round-89.md §Narrowings (4)`` | RED, `live=["SKILL.md"]` |
| ``stale pointer: `plans/round-89.md` §Narrowings (4)`` | **GREEN**, `live=[]` |

`.ufo/waves/round-89/claim-falsification.tsv:6` and `:8` also still carry
`plans/round-89.md §Narrowings (…)`; the gate does not scan the ledger for `live` citations (it
only reads `-corrected\t` rows, appended at `:17-18`). The r90 correction block itself says the
original rows stay (`corpus/lessons/round-89.md:88-90`). So the absolute clause is false of at
least three lane files while the gate reports `live=[]`.

### F2.3 Item (3) does not measure the census: "end census 224 rows exit 0"

- `:94` `censusRows = /tabi\tok\t/` — only the ok marker in
  `.ufo/waves/round-89/census/end.txt`, which is a 38-line duplicate-URL report ending
  `tabi ok <SOURCES.md>`; it carries no row count.
- `:95` `says224` reads the **r90 correction prose** in `corpus/lessons/round-89.md`, not
  `corpus/SOURCES.md` (never read by the gate).
- Measured: a scratch lane copy with `corpus/SOURCES.md` reduced to **223 rows** and a count-free
  ``end.txt`` is still `censusOk=true says224=true`, 0 mismatches.
- Baseline proof that the statement tests prose, not state: at base `a9f1da08`,
  `corpus/SOURCES.md` already has **224** rows and `end.txt` already says `tabi ok`, yet the
  statement is RED (`says224=false`) because round 90 has not written its correction block.
- The correction block also annotates the S224 quote "(19 words)"
  (`corpus/lessons/round-89.md:103-104`) while the quote is 17 words and the gate computes 17;
  the annotation is unchecked drift inside the certified record.
- The claim's numeral and predicate also disagree: claim "17 words" vs predicate `words <= 25`
  (`:102`), so a 24-word quote would green the gate against a claim that says 17.

### F2.4 Item (4) tests the gate's own source text, not the selftest's behaviour — and the record's witness does not exist

`:107-108`:

```
const removes = /rmSync\(fx, \{ recursive: true, force: true \}\)/.test(driftSrc);
const asserts = /fixtureAbsent/.test(driftSrc) && /decoyPresent/.test(driftSrc);
```

`driftSrc` is the gate's own file. Measured in a scratch lane copy: the selftest's removal call
wrapped in `if (false) { … }` (literal retained):

- `check-record-drift-round90.mjs --lane <copy> --json` → **`r89-leak-enforcement ok:true`,
  0 mismatches** (`removes=true asserts=true named=true`);
- `check-record-drift-round90.mjs --selftest --lane <copy> --json` → exit 1,
  `fixtureAbsent:false`, and the fixture tree survives on disk.

So a cleanup-dropped variant that keeps the token is green on the counted statement and only
visible in leg (c)'s selftest run. This is the r89 defect's surviving mutant class
(`selftest-fixture-cleanup-dropped`) surviving the r90 statement.

`named` (`:109`) checks only that the **r90 correction block** contains "Leak enforcement" and
"narrowed"; it does not read the r89 record. The correction block's own narrowing sentence asserts
that "the round-90 instruments carry that removal plus a battery case
(`selftest-fixture-cleanup-dropped`) that makes the removal witnessable"
(`corpus/lessons/round-89.md:105-108`, `plans/round-90.md:33-35`). **No such case exists**:
`grep -rn 'selftest-fixture-cleanup-dropped|cleanup-dropped|drift' scripts/` finds nothing in
`scripts/negatives-showpicker-round90.mjs` (the battery only mutates receipts; 225 cases, none
subprocess/cleanup), and nothing anywhere in `scripts/`. The only hits are the record's own prose.
The gate certifies the behaviour claim by grepping for words, so the false battery sentence rides
through.

### F2.5 Item (1) narrows routed defect 1: the plan sentence is still false and unnamed

§7 defect 1 names three false artifacts: `claims.json` C2 type item (3), leg (c)'s `tapi-` glob,
**and `plans/round-89.md` §C2 item 3**. `plans/round-89.md:51` still reads

```
   new `replay-limit-consistency` check binds `refused == (absMatched >= absNeed)` …
```

The r89 `frozenAmendments` entry's `field` names only "C2.type item (3) + C2.legs.c fixture-leak
clause" — the plan is not named, and the gate's `sweep` predicate (`:69-73`) never reads the plan
clause. The claims type item (1) (claims.json:27) drops it too. So one of the three false artifacts
remains false and unnamed while the claim says defect 1 is counted.

Predicate strength note: `sweep = /replay-limit-consistency|replayConsistency/` **and**
`/tapi-|tabi-/` only requires substrings; `tabi-` is the lane name, so any amendment mentioning
"tabi-" satisfies the second clause. The lane's real amendment happens to name both clauses, so
the state holds — but the predicate does not test "names the two false clauses".

### F2.6 Item (5) is three word greps

`:113-115` requires `/10:13/ && /worktree/ && /predates/` anywhere in the correction block. It
does not require a worktree name/revision/path; the claim ("the drift after-run's actual 10:13
worktree is named") is broader than the predicate.

### F2.7 Item (2) passes when the scanned files are missing

Delete `SKILL.md` and `LOG.md` from a scratch lane copy: `r89-narrowing-pointers` stays
**GREEN** (`live=[]`); only `quality161-sweep` turns red (unrelated). So "no lane file still cites"
is satisfied by the scanned files not existing — the missing-file vacuity the assignment asks
about.

### F2.8 The before/after pair counts the absence of round 90's prose, not the defects

Base `a9f1da08` (archive): 8 claims, 7 mismatches, exit 1 — matching the claim. But the reds are:

| statement | base detail | what made it red |
|---|---|---|
| r89-claim-sweep | `amendment=missing` | no r90 amendment |
| r89-narrowing-pointers | `corrected=0 … live=[]` | no r90 corrected rows; **not** a live citation (backtick blindness) |
| r89-census-attribution | `censusOk=true says224=false` | no r90 prose; the census itself is already 224 |
| r89-leak-enforcement | `removes=false asserts=false` | the r90 drift script does not exist at base |
| r89-revision-naming | `namesWorktreeAndOrder=false` | no r90 prose |
| gate-selftest | all false | the four r90 scripts do not exist at base |
| quality161-sweep | `cites=false` | the r90 cite does not exist at base |

Six of seven reds are "round 90 has not written its record yet"; only `corrected=0` is a
record-state red. The 7 is a measured count as claimed, but it is not a defect count, so the
killRule's before-numeral is a control on prose presence. This is the same failure the r88/r89
lessons named (`frozen-control-numeral`) one level up.

### Verdict C2

- Legs (a) 8/0, (b) before 7 / after 0, (c) selftest + controls: **all reproduce**.
- The **type** (claims.json:27): **fails as written**. It is not "the six routed defects counted":
  five are counted, §7 item 6 (report author date) is dropped, and three non-defect self-checks
  are counted in its place. Item (2) is false on the lane's own bytes (`SCORECARD.md:4292`).
  Item (3) is a prose check that does not read `SOURCES.md` (223-row counterexample green; base
  224 already true and red). Item (4) is a source-text grep of the gate itself (dead-branch
  counterexample green) and the record's witness case does not exist. Item (1) omits one of the
  three artifacts §7 named.
- The `limit` "a green gate means those eight match observed state, nothing more" is honest about
  scope but is contradicted by items (2)/(3)/(4), which match *prose about* observed state.

## 3. Impacted axes

- **coverage (C1)**: claim rests here; not moved. The moved surface is one call argument the
  fixture ignores (`round-78.mjs:196`), with identical payload, identical legs, identical check set
  and identical `checkCount`.
- **calibration (C2)**: the gate is a prose/source-text checker at positions 2 (live clause),
  3 (census), 4 (leak) and 5 (revision); its before/after pair separates "no r90 record" from
  "r90 record", not defect state. Calibration is claimed as improved on a gate that cannot see the
  two most consequential routed defects.

## 4. Smallest safe corrections (claim/record text only — no instrument amendment)

1. **C1 axis/type.** Either move the claim to calibration, or add one clause to the type: the
   settle expression's argument is discarded by the fixture (`__inputs` takes no parameters), so
   the binding is a call-spelling constraint and the payload, legs, checks and `checkCount` are
   unchanged from r89. Do not touch `plan-calls`, the pins or the receipt.
2. **C2 counted-set sentence.** State the set as what the gate counts: §7 defects 1-5 plus
   `gate-selftest`/`quality161-sweep`/`scorecard-tallies`; §7 defect 6 (report author date) is not
   counted. This makes claims.json and `plans/round-90.md:30-32` agree without touching the gate.
3. **C2 record repairs.** Remove the false battery sentence (`corpus/lessons/round-89.md:105-108`,
   `plans/round-90.md:33-35`: no `selftest-fixture-cleanup-dropped` case exists) or name the
   artifact that carries the witness; fix "(19 words)" to 17; annotate `SCORECARD.md:4292` as
   historical or drop the claim's absolute "no lane file still cites" clause. These are record
   edits and change no predicate.
4. **C2 before-numeral framing.** If the 7 stays, state that it is a record-presence count: six of
   seven reds are the absence of the r90 correction block or the r90 instruments, not the six
   defects' states (base census is already 224; base `live` is already empty because of the
   backtick form).

## 5. Contract note

- **Deviation, disclosed:** one shell cell redirected `grep` output to `/tmp/x`
  (`grep -v … corpus/SOURCES.md > /tmp/x`). The file was created at 11:29 -03:00 and deleted at
  the next cell; nothing else was written under `/tmp`, and no lane file was written by that cell.
- No tool was installed or upgraded; no pacman/uv/npm channel was used.
- No subagent, no background job, no git/jj mutation; every fixture was a scratch copy; the base
  tree came from `git archive a9f1da08` (read-only export), not a worktree.
- Scratch root `/fast/scratch/hyaku/tabi-r90/R90Critic/` deleted before yield.
