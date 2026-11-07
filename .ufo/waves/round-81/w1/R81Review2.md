# R81Review2 — attack on the r81 battery and kill power (operability)

Seat: R81Review2 (read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`c27e8406e6a2dc3cafcff030c9224cf8a14e3464`, D `a2183a93362259cb574ef3d03b565ee6d2c26599`.
The (a) receipt landed at 20:14 while this seat was reading; the lane was being repaired at the
same time. Every measurement below names the bytes it used. Evidence JSON is in
`.ufo/waves/round-81-seats/R81Review2/`.

## Bytes actually exercised

| instrument | sha256 | freeze.txt at D | freeze.txt now |
|---|---|---|---|
| `scripts/check-showpicker-r81.mjs` | `0d69659cd28f96f4c0e37daf8920493e24f869158f84be45d11daf545746a0c0` | same | same |
| `scripts/negatives-showpicker-r81.mjs` | `f7c423c183c11d19180ebad9428eed52d12dd52997ac4d5435602e8d73c8e542` | `6964de6f4a4a02ea225a2d3959277f7d0b9a5553812f3918bcbde51a8a69f6d2` | `f7c423c1…` |
| `scripts/kill-power-r81.mjs` | `e381162d49771b3dba077db559d3a43d98037144ec930f4bb8c0311f9d9b215c` | same | same |
| `.ufo/waves/round-81/controls/c1/prior-set.txt` | `5f8becd3892b9c7c093cfe07791ddab79e55f630377d46fe88867275a78307d1` | `1275fa1f5f5f22f1580dff7b50391bceeb38ba6a90822021a1b9602c6456a793` | `5f8becd3…` |
| `.ufo/waves/round-81/claims.json` | `0b850d157d044094094687a3dbd3323ba7250992eb0dc5a8db7b8340f63b6c03` | `49c8c96e86198a9063ca3cebec2c388aaa410d8a3848c1f7d8948f7fd5ecc3ba` | `49c8c96e…` (stale) |

The D battery differs from the current one only in the two mirror-lane cases
(`receiptPath = realPath` → `path.resolve(realPath)`); with an absolute `--real` the behaviour is
identical, so the battery measurements below are valid for both. The D prior set and the D battery
pin are not the bytes the scored artifacts were produced under; the L1 documents both repairs in
`corpus/lessons/round-81.md:94-107` and `freeze.txt` carries a repair note. The residual pin
disagreement is F4.

Scored receipt: `corpus/evidence/round81/chromium-showpicker/receipt.json`, sha256
`cb9e25420fb1afe9aab08554d9bfb946699310a5f5e50dc83add3d1f786ad89d`, nonce
`tabi-r81-l1-a2183a933622`, fixture `d9129edd5b5485169d8a523f76c6bcf7055202668824a38d3b4e654b092a1703`.

## Baseline commands and outputs

```
node scripts/check-showpicker-r81.mjs --lane $PWD --receipt corpus/evidence/round81/chromium-showpicker/receipt.json \
  --expect-driver-sha256 e35e63c1… --expect-nonce tabi-r81-l1-a2183a933622 \
  --expect-fixture-sha256 d9129edd… --prior-set .ufo/waves/round-81/controls/c1/prior-set.txt --json
→ exit 0, verdict clean, checkCount 56            (counter-a.json)

same, --prior-set /fast/scratch/.../prior-set-D.txt (exact D bytes, sha 1275fa1f)
→ exit 1, findings [prior-set-complete] naming probes/tabi-r81-probe2.json   (counter-a-D.json)

node scripts/negatives-showpicker-r81.mjs … --real <a> --prior-set <repaired> --json
→ exit 0, cases 62, failed 0, coverage {declared 56, covered 60, uncovered [], unknown [
   order-law-message, activation-before, cross-nonfile-chooser, cross-nonfile-result]}   (battery-a.json)

same, --prior-set <D bytes>
→ exit 1, cases 62, failed 61                      (battery-a-D.json)

node scripts/kill-power-r81.mjs … --real <a> --prior-set <repaired> --json
→ exit 0, mutants 46, killed 46, survived 0, crashed 0; every result first:null   (killpower-a.json)

same, --prior-set <D bytes> (baseline battery already fails 61/62)
→ exit 0, mutants 46, killed 46, survived 0, crashed 0; every result failed:61    (killpower-a-D.json)
```

## Findings by severity

### F1 (high) Kill power has no baseline guard: 46/46 is vacuous when the baseline battery fails

`kill-power-r81.mjs` counts a mutant killed whenever the battery exits 1. It never runs the
unmutated counter under the same invocation. With the D prior set the baseline battery fails 61/62
(`battery-a-D.json`), yet kill power still reports `mutants 46, killed 46, survived 0, crashed 0`
(`killpower-a-D.json`); every mutant's `failed` is 61, i.e. the baseline failure, not a mutation
detection. The repaired-state 46/46 is meaningful only because `battery-a.json` is 62/62; the
instrument cannot distinguish the two states. A future broken baseline (a drifted prior set, a new
receipt in the walked tree) would again print 46/46 with zero discriminating power.

### F2 (high) The frozen 46 are not clause-complete: 11 independent clause-level weakenings survive

The 46 themselves are all genuine weakenings and all killed (F3), but the battery has no case for
these rules. I applied 12 independent single-clause weakenings beyond the frozen set and ran the
same battery (`extra-mutants.json`):

```
killed:   accept-read-ret-drop                     (by accept-answer-law)
survived: order-name-drop                          (order-law's name clause; both order cases carry a wrong message)
survived: cross-child-activation-drop              (childActivationBefore/After)
survived: cross-child-events-seq-drop              (childEvents type@target sequence)
survived: cross-child-late-drop                    (childLate === 0)
survived: dir-answer-seterror-drop                 (wa.answer.setError === null)
survived: dir-read-ret-drop                        (directory read ret bytes)
survived: accept-answer-files-drop                 (aa.answer.files === [ANSWER.name])
survived: click-before-drop                        (clickWhileOpenChoosersBefore === 1)
survived: trust-ptr-drop                           (no pointer event in a show-picker leg)
survived: run-window-upper-drop                    (t1 - t0 < 600000)
survived: child-server-status-drop                 (child server status === 200)
```

Each survivor is a real weakening: the counter accepts a receipt that violates the dropped rule.
This is the "no-op for the battery" result: none of the frozen 46 is a semantic no-op, but a real
weakening outside the frozen set is a no-op to the battery. The 46/46 claim is scoped to the frozen
set, not to the counter's rules.

### F3 (high) Claims leg (c) says `coverage.unknown []`; the battery reports `unknown` = 4

The four extra cases are aliases: their case names (`order-law-message`, `activation-before`,
`cross-nonfile-chooser`, `cross-nonfile-result`) are not check ids. The battery's `covered` is a set
of **case names**, so they land in `unknown`; the battery's exit criterion is only
`failed === 0 && uncovered.length === 0`, not `unknown`. `battery-a.json` (mine) and the L1's own
`.ufo/waves/round-81/scored/battery-a.json` both record `unknown` = those four. The frozen
`claims.json` (D and current) says "coverage.uncovered [] and coverage.unknown []". The battery
cannot satisfy that claim as written; the claim and the instrument disagree. (The predicate text
given to this seat requires only `coverage.uncovered []`, which holds.)

### F4 (high) The D freeze bytes are superseded; the (a) leg is clean only under the repaired prior set

D pins the battery `6964de6f` and the prior set `1275fa1f` (probe1 only). The current battery is
`f7c423c1` and the current prior set is `5f8becd3` (probe1+probe2). Under the exact D prior set the
(a) receipt exits 1 on `prior-set-complete` naming `probes/tabi-r81-probe2.json`
(`counter-a-D.json`), and the battery fails 61/62 (`battery-a-D.json`). The L1 documents the two
repairs in `corpus/lessons/round-81.md:94-107` ("two repairs were made after D and are the frozen
state the scored artifacts were produced under") and `freeze.txt` re-pins the repaired battery and
prior set. Residual, not covered by the repair note: `freeze.txt` still pins `claims.json` at
`49c8c96e`, while the current `claims.json` is `0b850d15` (the post-D `digestsCommit`/`nonce`
fill-in). The pin set is internally inconsistent; the L1 must reconcile it. I do not propose
amending the pins; this is the state disagreement to record.

### F5 (medium) Kill power's `first` diagnostic is always null

`kill-power-r81.mjs` records `first: j.results.find((x) => !x.ok).name`, but the battery's result
objects carry `case`, not `name`. All 46 results in `killpower-a.json` have `first: null`; the tool
cannot name the killing case. I had to re-run the battery per mutant (`harness.json`) to recover
the failing case names. This is a diagnostics defect, not a wrong verdict.

### F6 (medium) Coverage is name-based, not id-based

`covered` is the set of case names of passing refusal cases; `uncovered` is declared check ids not
in that set. A case named X expecting Y covers X, not Y. The four aliases inflate `covered` to 60
and produce `unknown` 4 (F3). The "56/56 declared checks covered" statement is true at id level but
does not mean the checks' clauses are covered (F2).

### F7 (medium) The four extra cases are NOT redundant, but the order-law pair is asymmetric

Measured with the frozen battery plus one added probe each:

- `activation-before` is the sole killer of `activation-before-dropped` (`harness.json`).
- `cross-nonfile-chooser` is the sole killer of `cross-nonfile-nochooser-dropped`.
- `cross-nonfile-result` is the sole killer of `cross-nonfile-result-dropped`.
- `order-law-message` is the sole killer of a message-only drop: adding
  `order-message-only-drop` (drop `sod.showPicker.message === IMMUTABLE_ERR`) gives
  `status 1, failed 1, failedCases ["order-law-message"]`; the primary `order-law` does not kill it.

So none of the four is redundant with an existing case. But the order-law **name** sub-clause is
unexercised: adding `order-name-only-drop` (drop `sod.showPicker.name === 'InvalidStateError'`)
gives `status 0, failed 0` — both order cases carry a wrong message, so the name comparison is
never the deciding conjunct. The pair covers message, not name.

### F8 (medium) Dead `alsoAllowed` entries; no live entry hides a real finding

The live allowances are genuine collateral (e.g. `ports-declared` → `context-binding` because
`ports.child = ports.http` breaks the child-origin match; `leg-records` → `host-argv` because
deleting `stderrHead` breaks the devtools line; `gesture-law` → `intercept-law`; `intercept-law` →
`plan-calls`, `leg-…`, `order-law`; `cancel-law` → `event-leg-window`, `leg-…`, `dismiss-law`).
Dead entries (measured: the id never fires for that case): `ports-declared` allows `fixture-hash`,
`host-argv`, `devtools-port-binding`, `send-log-allowlist`, `cdp-event-log-closed`; `leg-order`
allows `plan-calls`, `leg-marks`, `context-binding`; `context-binding` allows `send-log-allowlist`,
`cdp-event-log-closed`; `plan-frozen` allows `plan-calls`; `event-leg-window` allows
`leg-sp81-accept-answer`; `teardown-closure` allows `host-argv`. They widen the pass condition
beyond the measured collateral but do not mask a real defect in these runs.

### F9 (low) Fixed detail strings omit the fired sub-clause

`cross-origin-nonfile-law` prints child/cross/events but not the chooser count;
`webkitdirectory-answer-law` prints answer/state but not `uploadDir`; `accept-answer-law` prints
answer/state but not `upload`; `trust-law` is generic. The id still fires on the mutated field (the
real receipt passes, so a single-field mutation can only fail the check on that field), but the
detail cannot distinguish a no-chooser failure from a `parentCrossAccess` failure. Same class as F5.

### F10 (low) Kill power counts `unapplied` as `crashed`

The counters do `else crashed++` for any non-killed/non-survived outcome; the separate `unapplied`
list is correct and the exit code requires it empty, but the `crashed` number is misleading. All 46
frozen `from` strings occur exactly once in the counter, so no unapplied in this run.

## Answers to the four questions

1. **Every refusal case fails for the id it names; no case passes on collateral alone.** The
   battery requires `ids.includes(expect)`, and the per-case run (`harness.json`) shows the
   expected id present in all 60 non-invocation cases. Because `accept-real` proves the real
   receipt passes every check, a single-field mutation that makes a check fail can only fail it on
   the mutated field; the details confirm this for the cases whose detail names the field. The
   `alsoAllowed` lists carry genuine collateral; the dead entries are listed in F8; none hides a
   real finding in these runs.
2. **The four extra cases are not redundant** (F7): each is the sole killer of a distinct frozen
   mutant, and `order-law-message` is the sole killer of a message-only drop. But they are aliases
   that produce `unknown` 4 (F3), and the order-law name sub-clause remains unexercised (F7).
3. **The 46 frozen mutants: none is a semantic no-op.** All 46 are genuine weakenings and all are
   killed, each by a case whose expected id is the mutated rule (44 one-case kills, 1 two-case,
   1 three-case; the failing case names match the rule in `harness.json`). The set is not
   clause-complete: 11 independent weakenings survive (F2).
4. **The `alsoAllowed` lists do not hide a real finding** in the measured runs; several entries are
   dead (F8). The real hiding is the coverage metric: id-level coverage overstates clause coverage
   (F2, F6).

## Residual risk and verification gaps

- The (a) receipt is the L1's post-D run; I verified it under the repaired prior set. The exact D
  bytes refuse it (`prior-set-complete` naming probe2). The repair is documented; its admissibility
  under the frozen kill rule is the L1's call, not this seat's.
- I did not re-run the driver (no browser); the receipt content is taken as committed. My work is
  on the counter, battery and kill power.
- The 11 surviving mutants are mine, not the frozen 46; they show the frozen set's scope, not a
  defect in any frozen mutant.
- The lane was being repaired while I measured (freeze.txt and claims.json moved at 20:15-20:22).
  The shas in the table are the state at the time of the runs; re-check them before integration.
- The kill-power baseline-guard defect (F1) is independent of the repair: the repaired-state 46/46
  is only as good as the 62/62 baseline beside it.

## Artifacts (`.ufo/waves/round-81-seats/R81Review2/`)

`counter-a.json`, `counter-a-D.json`, `battery-a.json`, `battery-a-D.json`, `killpower-a.json`,
`killpower-a-D.json`, `harness.json` (per-case fired clauses and per-mutant failing cases),
`extra-mutants.json` (12 clause-level probes), `prior-set-D.txt` (exact D prior-set bytes),
`negatives-D.mjs` (exact D battery bytes, sha `6964de6f`).
