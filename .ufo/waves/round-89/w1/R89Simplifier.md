# R89Simplifier — round-89 instrument dead-weight review (w1)

Read-only seat. Nothing in this report is an edit; the only lane write is this file.
Frozen target: HEAD `0791b191` (assignment freeze D `7bde5e6c2f2d`). The working tree was
being edited by other seats during the review (see §Live state); every finding below is
anchored to the committed blob and its sha256, which I verified against `freeze.txt`:

```
76b69b4f… driver            (match)
33d4b927… check-showpicker  (match at HEAD; working tree 53593b5c…)
7951d40e… negatives         (match at HEAD; working tree 0668a439…)
319534b9… kill-power        (match at HEAD; working tree e8f9810f…)
35235eff… selftest-gates    (match at HEAD; working tree 2ad05c4b…)
c54d5edf… record-drift      (match)
```

Axes: operability (can the frozen family reach a coherent verdict), preservation (what
must not be deleted), deletion cost.

## Verdict at a glance

The frozen family cannot satisfy its own C1 predicate as committed. Four deterministic
reds (and one latent one) are in the *instrument scaffolding*, not in the 41-row measured
data:

| # | Candidate | Frozen-state effect | Kind |
|---|---|---|---|
| 1 | `selftest-r89-gates.mjs:55` hardcodes `checkCount === 102` | `counter-clean` red at the frozen counter's real count 108 | stale constant (r88 copy) |
| 2 | frozen battery has no `sp89` entries in `LEG_ALSO`/`legMutators` | 4 new `leg-sp89-*` cases fail on an unlisted `no-selection-law` extra → battery red | fixture gap |
| 3 | frozen `replay-limit-consistency` check | unfalsifiable tautology **and** the only declared id with no battery case → coverage red; it is also 1 of the 108 | dead check |
| 4 | frozen kill-power `MUTANTS` | 3 of 72 mutants are `unapplied` by the instrument's own occurrence test → kill power red; its kill criterion is vacuous on a red battery | stale/mis-sized mutants |
| 5 | `same-origin-color-law`, `same-origin-no-picker-law` | fully subsumed by 4 other checks; 2 ids + 5 battery cases + 5 mutants carry zero extra detection | duplicate authority |

The live tree already repairs parts of 2/3/4 and the gate count (see §Live state), but the
committed digest the seat was given still carries all five. The dead code that is *safe*
to delete later is §6–§10; the 41-row pins are §11 and must stay.

## Measured facts (frozen bytes; read-only runs)

All runs used `/tmp` mirror copies of the priors and the frozen counter copied from
`git show HEAD:…`; no lane path was written.

**F1 — the frozen counter really emits 108.** Scored against `prior1.json` with
`prior2.json` as the prior set (a complete 41-leg receipt; mirror lane so the live tree is
not read):

```
node counter.mjs --lane /tmp/…/tabi-shokunin --receipt …/prior1.json \
  --expect-driver-sha256 76b69b4f… --expect-nonce tabi-r89-probe1-probe0001 \
  --expect-fixture-sha256 df374c20… --prior-set …/prior-set.txt --json
→ verdict clean, checkCount 108, findings []
```

Arithmetic corroboration: the frozen `nowork-r88-under-r89.json` (same counter, r88
receipt, 37 legs) has `checkCount 104`; the 4 new domread legs account for 104 → 108.
Decomposition: 67 non-leg ids + 41 `leg-*` ids (legs + `leg-order`/`leg-records`/`leg-marks`
count as their own ids).

**F2 — 102 is the round-88 count, not this counter's.** `scripts/selftest-r88-gates.mjs:55`
contains the byte-identical line, and
`corpus/lessons/round-88-verifier-spotcheck.md:36` records “`verdict clean`,
`checkCount 102`”. The r88→r89 delta is exactly the four new legs plus
`accept-domread-law` plus `replay-limit-consistency` (+6). The working-tree gate was
changed to 107 after the live counter dropped the replay check; the committed gate was
never at 108.

**F3 — frozen coverage set: 108 declared, 107 case ids.** Parsing the frozen counter's
check ids (58 literals + 41 legs + 9 `extra + '-law'` ids) and the frozen battery's
`expect` ids (literal `add()` second args + 41 leg ids + 12 search/text family ids) gives
exactly one declared id with no case: `replay-limit-consistency`. Coverage in the battery
is `declared.filter(id => !covered.has(id))` (`negatives…:597-599`), so the frozen battery
cannot report full coverage.

**F4 — the four frozen domread leg cases fail.** The battery adds one case per receipt leg
with `legMutators[n] || fallback` and `LEG_ALSO[n] || []`
(`negatives…:227`). The frozen `legMutators` and `LEG_ALSO` have **no `sp89` keys** (30
`LEG_ALSO` keys checked; the only `sp89` strings in the frozen battery are the three
`accept-domread-law` cases at lines 359–361). The fallback sets `stateAfter.sValue='x'`.
Running the frozen counter on each of the four mutated receipts yields exactly:

```
sp89-accept-domread-text      → ["leg-sp89-accept-domread-text","no-selection-law"]
sp89-accept-domread-png       → ["leg-sp89-accept-domread-png","no-selection-law"]
sp89-accept-domread-multimime → ["leg-sp89-accept-domread-multimime","no-selection-law"]
sp89-accept-domread-whitespace→ ["leg-sp89-accept-domread-whitespace","no-selection-law"]
```

`no-selection-law` is an unlisted extra for these cases, so each fails
(`extra = ids.filter(id => id !== expect && !alsoAllowed.includes(id))`). Four failed cases
→ battery exit 1, and the four leg ids also stay out of `covered`.

**F5 — frozen kill-power has 3 unapplied mutants.** The instrument applies a mutant only
when `from` occurs exactly once (`src.split(from).length - 1 !== 1`). Static count against
the frozen counter: **72 mutants, 3 non-unique/absent**:
`leg-records-keys-open` (0 occurrences), `accept-grammar-bytes-dropped` (2),
`accept-grammar-state-dropped` (2). The summary counts `unapplied` and exits 1 when it is
non-empty, so the frozen kill power is red before any survivor is considered.

**F6 — the frozen replay check is true on a receipt that fails schema/plan.** The r88
control `nowork-r88-under-r89.json` has `verdict findings`, findings including `schema`
and `plan-frozen`, `checkCount 104`, and `checks["replay-limit-consistency"] === true`.
That is the expected behaviour of a predicate that cannot fail (see §3), not a property of
a clean receipt.

**F7 — the four file constants are correct and load-bearing.** On `prior1.json`:

```
ANSWER  size 22, sha256(hex) == const sha256, page read hex == const hex
PNG     size 21, sha256(hex) == const sha256, page read hex == const hex
SECOND  size 28, sha256(hex) == const sha256, page read hex == const hex
DIR     inner-a 19 B / 7ccf3ffd…, inner-b 18 B / 58e98c83…, from uploadDir
```

They are duplicated from the driver's write calls but each field is re-bound by a law to a
driver-measured field (`upload`, `uploadPng`, `uploadSecond`, `uploadDir`, page-read hex).
Deleting them would make the counter trust the driver's own numbers; see §11.

## Ranked candidates

### 1. [Blocker, stale constant] `selftest-r89-gates.mjs:55` — `checkCount === 102`

- **Evidence.** F1/F2. Frozen gate line 55 is the r88 line copied verbatim
  (`selftest-r88-gates.mjs:55`); the gate's own header still says “Gate self-test for tabi
  round 88” (line 2). The frozen counter measures 108 (F1), so `counter-clean` can never
  go green on the frozen bytes. The live tree changed this line to 107, which is coherent
  with the live counter that drops the replay check.
- **Delete cost.** One integer. The check is the only guard that the counter's id count is
  the expected one; deleting the gate removes the guard, changing the integer changes the
  gate's sha (→ freeze/claims pin).
- **What breaks if deleted.** Gate `counter-clean` disappears; no battery case or
  kill-power mutant references it. If the integer is changed instead, the gate's sha
  `35235eff…` and the claims' pin for it change. Either way the wave's identity changes;
  this is L1's call, not a seat edit.
- **Why it is dead weight.** The number is a third copy of a fact the counter already
  reports (`checkCount`); it has no derivation in the gate, so it silently encodes the
  round-88 instrument.

### 2. [Blocker, fixture gap] frozen battery: 4 `leg-sp89-*` cases fail on `no-selection-law`

- **Evidence.** F4. The four new legs are `ANSWER_LEGS`, whose `no-selection-law` branch
  requires `stateAfterDismiss` to equal `stateAfter`; the battery's fallback mutator
  changes only `stateAfter`. The frozen `LEG_ALSO` map and `legMutators` map contain no
  `sp89` keys, so the extra id is not allowed. The live diff adds exactly
  `DOMREAD_ALSO = { four sp89 keys → ['no-selection-law'] }`, which is mechanical
  confirmation.
- **Delete cost.** Four map entries (or four mutators) in the live repair; in the frozen
  bytes, nothing can be deleted without changing the pin.
- **What breaks if the four cases are deleted.** `leg-sp89-accept-domread-{text,png,multimime,whitespace}`
  would no longer be covered by any case; the battery would then fail `coverage` for those
  ids. So deleting the cases trades one red for another.
- **What breaks if the entries are added.** Nothing: the case's expected id still fires;
  only the extra-finding classification changes. No check id or kill-power mutant stops
  firing.

### 3. [Blocker + dead check] `replay-limit-consistency`

- **Evidence.**
  - Definition: `absNeed: np > 0 ? Math.ceil(FRAC*np - 1e-9) : 0` and
    `refused: np > 0 && absMatched >= absNeed` (frozen counter line 889). The check
    (line 943) tests `limBad.length === 0 && sims.every(p => p.refused ===
    (p.absMatched >= p.absNeed) || p.absNeed === 0)`. `limBad` recomputes the *same*
    `ceil(FRAC*np-…)` expression and compares it to the value just computed by that
    expression; the second disjunct is the definition of `refused`. The predicate is a
    tautology for every input, including malformed priors.
  - Empirical: true on the r88 control that fails `schema` and `plan-frozen` (F6).
  - Coverage: the only declared id with no battery case (F3).
  - Kill power: no mutant targets it. The closest name, `replay-limit-printed-drift`
    (frozen kill-power line 174), replaces `const replayIdx = sims.findIndex` with `-1`,
    which attacks `replay-event-timeline`, not this check. The live comment claims “its
    battery witness is the kill-power mutant”; that witness does not exist.
- **Delete cost.** One check id → the frozen counter's count becomes 107 (the live tree's
  current state). No battery case stops firing (none exists); no kill-power mutant stops
  firing (none targets it). The only broken statement is C1-a “checkCount 108” (frozen
  claims) — which is exactly why the check is load-bearing only for the count, not for a
  property.
- **Tradeoff.** Keeping it forces the battery to invent a case that cannot be red; the
  tautology cannot be made falsifiable by a receipt mutation. The live repair moves the
  bit to `limit.replayConsistency` (a non-check output field) and leaves the same
  tautology; that removes the coverage failure and the count, but the bit still can never
  be false and its comment still names a non-existent witness.

### 4. [Blocker, instrument vacuity] frozen kill-power: 3 unapplied + no green-baseline precondition

- **Evidence.** F5 (3/72 unapplied). Independently, the kill criterion is
  `code === 0 → survived`, `code === 1 → killed` (frozen kill-power lines 200–201) with no
  assertion that the *baseline* battery is green. With the frozen battery red on four
  legitimate cases (F4), every mutant is “killed” for the same unrelated reason; the
  summary would read `survived: 0` while measuring nothing. The frozen suite therefore
  cannot distinguish “mutant killed” from “battery already red”. (The gate `battery` would
  still be red, so the family is not fully green; but the kill-power number is not usable
  as evidence on its own.)
- **Also latent:** the frozen battery has no case that mutates only `domRead[].accept`; the
  frozen battery's three domread cases mutate tokens, bytes and state respectively
  (lines 359–361). The mutant `domread-raw-dropped` (line 173) only drops
  `desc.accept === raw`; none of the three frozen cases turns red for that alone. Once the
  battery is repaired, that mutant survives unless a raw-only case exists. The live tree
  adds `accept-domread-law-raw` for exactly this.
- **Delete cost.** Fixing the three `from` strings / adding the raw case changes the
  kill-power/battery sha. Deleting the vacuity requires a baseline run (a new gate), not a
  deletion.
- **What breaks if the three mutants are deleted.** The `unapplied` red disappears, but the
  three rules lose their kill-power witnesses: `leg-records-keys-open` (leg key-set),
  `accept-grammar-bytes-dropped` (read-hex binding) and `accept-grammar-state-dropped`
  (delivered state) would then have no mutant. So deleting is not the repair; making each
  `from` unique is.
- **Live-state note:** at 09:52 the live kill-power (e8f9810f) still reports **2**
  unapplied by the same test — `leg-records-keys-open` (2 occurrences:
  the condition and the detail expression both contain
  `same(Object.keys(l).sort(), LEG_KEYS)`) and `accept-grammar-state-dropped` (2
  occurrences: the GRAMMAR and DOMREAD lines both contain the new `from` text). The live
  edits fixed `accept-grammar-bytes-dropped` but not these two.

### 5. [Duplicate authority] `same-origin-color-law` + `same-origin-no-picker-law`

- **Evidence.** Each component of the two checks is already asserted:
  - `showPicker.ok === true && ret === 'undefined'` → `gesture-law` via `SP_LAW`
    (`sp86-same-origin-color-activated`, the three activated tel/search/text legs).
  - `opens.length === 0` → `intercept-law`: `NO_PICKER` contains exactly those four names
    and sets `want = 0` (frozen counter line 838).
  - `activationBefore/After` → `activation-law` via `ACT_LAW`.
  - `stateAfter.cos === []` and “no input/change” → `no-selection-law` (`empty` list
    contains `cos`; the file-event filter fires for all non-answer legs).
  The battery itself prints the overlap: e.g. `color-law-input-event` also allows
  `no-selection-law` and `event-leg-window`; `same-origin-activated-opens-none` also allows
  `intercept-law` and the leg id.
- **Detection added by the two checks: zero.** They are named attributions, not independent
  predicates.
- **Delete cost.** 2 ids (108 → 106 in the frozen family), 5 battery cases
  (`same-origin-color-law`, `color-law-activation-after`, `color-law-input-event`,
  `same-origin-color-law-opens`, `same-origin-activated-opens-none`) and 5 kill-power
  mutants (`same-origin-no-picker-want-dropped`, `same-origin-no-picker-law-dropped`,
  `color-law-opens-dropped`, `color-law-activation-dropped`, `color-law-no-input-dropped`)
  become dead or `case-expect-not-declared`. Deleting the checks without deleting the
  cases turns the battery red (`extra`/missing expect), so the deletion is only coherent as
  a set.
- **What breaks.** Nothing in the underlying detection: gesture/intercept/activation/
  no-selection still fire on the same mutations. The cost is the loss of the two named ids
  and their cases, and the checkCount changes. In a frozen wave this is not actionable;
  post-wave it is the cleanest weight removal in the family.

**Secondary duplicate (lower confidence, do not touch in-wave):** `mode-law` derives
`selectMultiple`/`selectSingle` from `fixtureInputs.multiple`, but `fixture-descriptors`
pins those descriptors and `leg-shape` pins every `opened` list. The derived invariant is
entailed by the two pins; the check costs one id, one battery case (`mode-law`) and one
mutant (`mode-law-any`). Unlike §5, its battery case is the only explicit witness for the
multiple-input mapping, so removal is a judgment call.

### 6. [Dead pins] fields that are shape-only

- **`r.failures` is never read.** `RECEIPT_KEYS` requires it (frozen counter line 474) but
  the string `failures` has 0 reads after the declaration; the real receipts carry
  `failures: []`, and a receipt with a non-empty driver failure list scores exactly the
  same. **Delete cost:** removing it from `RECEIPT_KEYS` makes every real receipt fail
  `receipt-fields` (the key is present); the only in-contract alternative is a new
  `failures.length === 0` assertion, which is a new check. **What breaks on deletion:** no
  check id stops firing (none reads it); the shape gate rejects all current receipts.
- **`fixture.patch` and `fixture.child.sha256` are shape-only.** `fixture-hash` checks the
  key list and requires `child.sha256` to be 64 hex, but never compares either to a
  constant; only `fixture.sha256` is pinned by `--expect-fixture-sha256`. A receipt with
  the right main sha and arbitrary patch text/child sha passes. **Cost:** deleting the
  patch fields/driver writes changes the receipt shape and the driver sha; keeping them is
  cheap but they are evidence, not bindings.
- **`LEG_KEYS` has 68 keys; 11 are never read anywhere and 7 are read once.** Never read:
  `armResult, armSendId, childClosedAt, childResult2, childState, deferredResult,
  interceptResult, priorClickElement, showPicker2, trigger2Result, triggerResult`.
  Read once: `armError, domRead, interceptError, interceptSendId, priorClickError,
  trigger2Error, triggerError` (mostly the `errOk` or DOMREAD path). The driver writes all
  68, so **deleting any from `LEG_KEYS` makes the real receipt fail `leg-records`**; the
  fields are forgery surface (any value passes) rather than behaviour. **Cost:** high
  (driver + counter + every receipt). Keep as a carried narrowing unless the next
  generation shrinks the record.
- **`dis` / `f` fixture elements.** `FIXTURE_INPUTS` pins both; no r89 leg targets either
  (the `dis` disabled file input is a leftover of the older `go2` path still present in the
  child fixture; `f` is the non-input descriptor). Deleting them changes the fixture sha,
  the designer page, and every receipt's `fixtureInputs`, so not in-wave.

### 7. [Dead code] `negatives-showpicker-round89.mjs`

- `openAll` (line 113) — defined, never called (`openOf` + an inline `.filter` are used).
- `freshPrior` (lines 278–…) — defined, never called; the must-accept case
  `accept-retimed` inlines the same constant-offset retime.
- `opts` on `add`/`accept` (lines 152–153) — stored on every case object, never read
  (`grep '\.opts'` = 0). All 200+ cases carry a dead `opts: {}` field.
- `selftestAsJson` (line 10) — parsed, output is unconditionally JSON.
- **`--selftest` does not test the battery.** The header (lines 2–8) says it runs “the
  battery's OWN case list” and asserts “one named battery case is RED”; the body (ends line
  50) only runs the **counter** on a clean and an `ac`-mutated receipt and checks
  `clean.status === 0 && bad.status === 1 && badIds.includes('accept-grammar-law')`. The
  battery runner, the case list and the coverage computation are never executed in this
  mode. It is a near-copy of the kill-power selftest's receipt harness. So the D3 claim
  “the negatives battery (one named case red)” is not demonstrated by this mode; the gate
  `gate-selftest` only checks the mode exits 0 with `ok:true`.
- **Delete cost / breakage.** ~15 lines; no check id, battery case or kill-power mutant
  references any of them. `gate-selftest` still passes. The only loss is the unused
  extension point `opts` (nothing sets it today) and a dead helper that could mislead a
  future author into thinking the limit witness uses it.

### 8. [Dead code / stale] `kill-power-round89.mjs`

- `selftestAsJson` (line 10) — unused; output is always JSON.
- Header (lines 2–8) names `accept-grammar-r89-case-dropped`, says “spawns the copy with
  `--only accept-grammar-r89-case-dropped`” and “one named mutant is KILLED”. The body
  never passes `--only`; it applies the `fixture-descriptors-any` weakening and compares
  two counter runs on the same mutated receipt. Both runs exit 1; it proves a finding-id
  difference, not a battery kill (the battery is never run in the selftest). The named
  mutant at line 165 is still in `MUTANTS` and is killed by the battery's
  `accept-grammar-law-r89-case`, so correcting the comment loses no coverage.
- `replay-limit-printed-drift` (line 174) is misnamed: it replaces `replayIdx` with `-1`,
  attacking `replay-event-timeline`; it does not touch the printed limit sentence or the
  consistency predicate.
- **Cost / breakage.** 3–4 comment lines and one unused const; no id/case/mutant changes.

### 9. [Dead code / non-causal fixture] `check-record-drift-r89.mjs`

- Unused: `reporter` (lines 47–52, never called), `readJson` (line 88, never called),
  `log` (line 94, read on every run but no claim references it — the header lists LOG.md
  as one of the fixed records), `createHash` (line 45), `mkdtempSync`/`readFileSync`/
  `existsSync` (line 46; `copyFileSync` is used), `os` (line 53). The
  `try { base = tmpRoot } catch {}` assignment cannot throw. The selftest also re-imports
  `node:fs` while the module already has `fs` imported statically.
- Duplicated list: the seven swept rounds `[44,68,79,80,81,84,85]` exist in the selftest
  fixture (line 62) and again in claim 1 (line 119). Drift is caught by `okC` (the fixture
  detail must contain `round-44-has-10`), so it is loud, not silent.
- **Fixture causality is only 2 of 4.** `okC` (line 80) asserts causality for
  `scorecard-tallies` and `selftest-wording` only. The fixture copies just the drift script
  into `fixture/scripts` and writes `corpus/QUALITY.md = '# fixture\n'`, so
  `gate-selftest` is red because the four instrument sources are absent and
  `quality161-sweep` is red because no `161.` section exists. These are absence reds, not
  “a swept statement” reds. The fixture cannot be made complete (copy the four instruments,
  add a 161 section) and still keep `gate-selftest` red for a causal reason; the mode
  therefore cannot test D3 as described. (The live C2 amendment now measures the same
  “absent instruments” red at the base worktree, which corroborates this.)
- **Concurrency nit:** `fx` is `(TMPDIR||base) + '/tabi-r89-driftfix-' + Date.now()` — no
  PID. Two seats starting the selftest in the same millisecond share a fixture dir, and one
  process's `rmSync(fx)` can delete the other's in-flight tree. The other three selftest
  modes use `process.pid`.
- **Cost / breakage.** ~15 lines and one extracted constant; no `claim()` id depends on any
  of them; the gate's `record-drift` claim count stays 4. The `log` deletion saves a file
  read per run. The fixture-causality gap is an assertion weakness, not a check id.

### 10. [Duplicated `--selftest` scaffolding] three near-identical blocks

- `negatives` (lines 9–50) and `kill-power` (lines 11–63) are structural twins: read the
  real receipt, mutate `fixtureInputs.ac.accept` to `'image/png'`, hash the receipt, spawn
  the counter with the same `--lane/--receipt/--expect-*/--prior-set/--tree-exempt-sha256`
  argv; the only difference is that kill-power spawns a second, mutated counter copy. The
  counter's selftest (lines 9–45) and the drift selftest (lines 38–85) are semantically
  distinct (schema fixture / mirror lane) but repeat the scratch-dir + `HYAKU_SCRATCH`
  pattern.
- Three blocks also re-import `node:fs`/`node:path` dynamically although their modules
  import them statically (`negatives` static imports lines 75–79, dynamic copy lines 12–15;
  `kill-power` static lines 75–78, dynamic copy lines 12–16); the
  `await import('node:child_process').then(m=>m).catch(...)` fallback cannot fire for a
  core module. These are dead alternate paths (~4–8 lines per file).
- **Delete cost.** Extracting a shared helper would add a new file that is not in
  `freeze.txt`, so the pins of all four instruments plus the claims change; that is
  incompatible with the single-freeze rule. **Tradeoff:** ~70 lines saved vs a new
  instrument and five pin changes — do it after the wave, not in it. The current
  duplication has already produced documentation drift (the two headers in §7/§8 are
  wrong), which is the real cost.

### 11. [Pin / record gaps]

- `pins-match-freeze` (gate line 43) lists 6 scripts, but `freeze.txt` pins 8 files: the two
  priors (`528090e5…`, `22114833…`) are never verified by any gate. The counter validates
  a prior only as a schema-bearing JSON used for the timeline; it never checks
  `driverSha256`, nonce, leg count or `failures`. A substituted prior that preserves the
  timeline pairing shape still passes the gate.
- `gate('capability-status')` (lines 105–106) depends on `scripts/check-capability-status.mjs`,
  which is not in `FILES` or `freeze.txt`; the r89 family's green depends on an unpinned
  script owned by the lane.
- The claims name `controls/c1/nowork-r88-under-r89.json` as the C1 do-nothing control, but
  no instrument reads it; the gate's `nowork-control` (line 65) uses the **r87** receipt
  instead. The named control is an evidence artifact with no consumer. (Its `checkCount 104`
  is still the useful arithmetic witness cited in F1.)
- **Cost / breakage.** Adding the prior pins and the capability script to the gate is a
  gate change (sha/pin). Deleting the unwired control removes a record, not a check. No
  check id or battery case stops firing.

### 12. [Keep] the constants and the 41-row pin set

- `ANSWER`/`PNG`/`SECOND`/`DIR` are correct against the realized prior1 (F7) and are
  independently re-bound by `accept-answer-law`, `accept-mime-answer-law`,
  `second-chooser-answer-law`, `webkitdirectory-answer-law` and `accept-grammar-law`. They
  cannot drift silently: a field change breaks the law that compares it to a
  driver-measured `upload*`/page-read value. **Deleting them would not save an authority;
  it would transfer trust to the receipt being audited** and stop those five laws from
  firing. Do not delete.
- `PLAN`, `LEG_SHAPE`, `SP_LAW`, `ACT_LAW`, `CHILD_*`, `FIXTURE_INPUTS` duplicate the
  driver's `LEGS` and page, but that duplication *is* the counter's independence:
  `plan-frozen`, `leg-shape`, `fixture-descriptors` and the law checks catch every drift
  loudly. The 41-row copy is the instrument, not dead weight. Same for the
  `GRAMMAR`/`DOMREAD` accept rows: they re-state strings from `FIXTURE_INPUTS`, but each row
  is compared to the page-read descriptor, so a change is caught; they are the witnesses
  that make the battery cases possible.

## Live state at write time (facts only; not my edits)

Snapshot `2026-11-08T09:52-03:00`, HEAD still `0791b191` (the assignment freeze):

```
scripts/check-showpicker-round89.mjs  33d4b927 → 53593b5c  (replay check removed; limit.replayConsistency added)
scripts/negatives-showpicker-round89.mjs 7951d40e → 0668a439 (DOMREAD_ALSO + accept-domread-law-raw + blank line)
scripts/kill-power-round89.mjs        319534b9 → e8f9810f  (three mutant from-strings rewritten)
scripts/selftest-r89-gates.mjs        35235eff → 2ad05c4b  (checkCount 102 → 107)
.ufo/waves/round-89/freeze.txt        modified (lists the new four hashes, but still 35235eff for the gate)
.ufo/waves/round-89/claims.json       modified (C1-a 108 → 107; C2 before 2 → 3; frozenAmendments added)
```

Observed incoherences in that snapshot, reported as facts:

1. `freeze.txt` and the claims pins still name `35235eff…` for `selftest-r89-gates.mjs`, but
   the working file is `2ad05c4b…`; `pins-match-freeze` compares freeze to the working file
   and will be red on the gate line until the pin and the file agree.
2. The amended C1-a says 107 while the `priorSet` sentence in the same claims still says
   “each scores clean at 108 checks”; the live counter's count is 107 (it drops the replay
   check), so the 108 in that sentence is stale.
3. The live kill-power still has 2 `unapplied` mutants by its own occurrence test
   (`leg-records-keys-open` 2, `accept-grammar-state-dropped` 2); the third frozen one
   (`accept-grammar-bytes-dropped`) is now unique. Details in §4.
4. The live repairs mechanically confirm §2/§3/§4 (DOMREAD_ALSO, replay removal, raw case,
   `accept-grammar-bytes` disambiguation) but are uncommitted, so the assignment digest
   `7bde5e6c2f2d` does not identify the tree that would be scored.

I did not edit any of these; the only lane writes named by this seat are this report. The
lane was not byte-identical across the review because other seats were editing it.

## Preserved contract / not deleted

- This seat made **no deletions**: the candidate list is the deliverable. All lane files
  named in the assignment are untouched by me; the report path is the only lane write.
- The frozen counter's 108 id set, its five law families, the 41-row plan, the four
  constants and the independent page/leg pins are load-bearing; §12 gives the reasons.
- If L1 wants a post-wave simplification budget, the safe order is: §7/§8/§9 dead lines
  (behaviour-neutral), §10 shared selftest harness (needs a new pinned helper), §5
  duplicate laws (needs the associated cases/mutants removed as a set), §6 dead pins (needs
  the driver and every receipt). §1–§4 are not dead-weight choices; they are the frozen
  blockers.

## Cleanup / tooling

- Scratch: all evidence files lived under `/tmp/r89frozen` (<50 MB copies of the priors and
  the frozen blobs); the designated variant scratch tree was not needed and no scratch
  tree was left in the lane. `/tmp/r89frozen` and the counter output files are removed
  before yielding.
- No tool installs or upgrades (nothing was needed; pacman is paused and no uv/npx package
  was required).
- No commits, pushes, worktrees, mutating git/jj commands, or subagents.
