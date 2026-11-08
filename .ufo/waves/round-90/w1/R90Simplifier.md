# R90Simplifier — instrument dead-weight review (round 90, w1)

Read-only seat. No lane edit, no git/jj mutation, no dispatch, no background job. All probes ran under
`/fast/scratch/hyaku/tabi-r90/R90Simplifier` (deleted before yield); scratch selftest dirs cleaned by the instruments.

## Review snapshot (pin state)

`freeze.txt` sha256 `85c4191706b3af4b028c0be6b29ad782fe26858799235f52a91581ff692dd11a`, mtime
2026-11-08 11:36:19 -03. All entries match the tree at review time:

| file | sha256 |
|---|---|
| scripts/chrome-cdp-showpicker-round90.mjs | ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d |
| scripts/check-showpicker-round90.mjs | 6f65a0d420adea5947eb6a218ca46b354a966e8f695bde28d2df422f7074f735 |
| scripts/negatives-showpicker-round90.mjs | 2f11fffc3b03a48a30460277b79f1dde9e759f56a328a3a02e6324e7bff39960 |
| scripts/kill-power-round90.mjs | 05bbe353419c1463b3b7ff1a7c6f4e8de611d077c1d4c51b84f3b1ab3c19c3e3 |
| scripts/selftest-r90-gates.mjs | 0da4d405bbb97cf5c6650b2898cb123e29de5b1fd8b7a478348289e3d1c6be67 |
| scripts/check-record-drift-round90.mjs | bd33d158f3ae198d5587bf8469cb15460692100662277e940a871f94ca732ee2 |
| before/after history: freeze was republished as D3 (`5134c4be…`, 11:31:53) and again at 11:36:19 (`85c419…`) while this review ran. The 11:09 generation pinned obsolete battery/kill bytes; it is superseded. Line anchors below are for the hashes above. |

## What I measured (current bytes)

- Counter on the scored receipt: exit 0, `verdict: clean`, `checkCount: 107`, 0.103 s wall.
  (`node scripts/check-showpicker-round90.mjs --lane <lane> --receipt corpus/evidence/round90/chromium-showpicker/receipt.json --expect-driver-sha256 ac5a… --expect-nonce tabi-r90-l1-e573334c78fa --expect-fixture-sha256 5fb1… --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json`)
- Four isolated `--selftest` modes on the current bytes: all green (exit 0, `ok: true`):
  - counter: `{"ok":true,"exit":1,"ids":["lane","send-log-allowlist","plan-calls"]}`
  - battery: `{"ok":true,"cleanExit":0,"mutatedExit":1,"mutatedIds":["accept-grammar-law","fixture-descriptors"]}`
  - kill power: `{"ok":true,"stockExit":1,"stockIds":["accept-grammar-law","fixture-descriptors"],"mutantExit":1,"mutantIds":["accept-grammar-law"]}`
  - drift: `{"exit":1,"failed":[all 8],"cases":8,"ok":true,"fixtureAbsent":true,"decoyPresent":true}`
- Ordinary drift gate on the lane: `claims: 8, mismatches: 0` (exit 0).
- Battery size by construction: 173 literal `add/accept` cases + 41 `LEG_NAMES` loop + 12 `FAMILY_MUT` loop = **226 cases** (matches L1's measured 226). I did not re-run the full battery.
- Kill power: **76 mutants** (default `--jobs 8`); I did not re-run the full kill. Worst case is 76 × 226 = 17,176 counter invocations; at the measured 0.103 s that is ≈29.5 min serial, ≈3.7 min at 8 workers plus spawn overhead, against the gate runner's 1800 s timeout (`scripts/selftest-r90-gates.mjs:29`).

## Findings

Severity: **P0** = a green gate can report success without measuring the claimed thing, or a malformed receipt crashes instead of refusing; **P1** = duplicated authority / redundant check that can drift or cannot fail; **P2** = dead code or false/stale documentation (no verdict effect).

### P0-1 — Gate runner binds the receipt to itself (identity pins cannot fail)

`scripts/selftest-r90-gates.mjs:44`

```js
const expect = { driver: rec && rec.driverSha256, fixture: rec && rec.fixture && rec.fixture.sha256, nonce: rec && rec.nonce };
```

`counter-clean` (`:54`), `battery` (`:58`), `kill-power` (`:62`), `nowork` (`:66`), `noreceipt` (`:73`), and both exemption controls
(`:78`, `:82`) pass those values as the "expected" pins. The counter therefore compares `r.driverSha256` and
`r.nonce` to themselves (`driver-pin`, `nonce-expected`) and the `fixture.sha256` component of `fixture-hash` to itself.
The literal pins exist in `.ufo/waves/round-90/w1-spec.json` / `w1-dispatch.json` but the runner never reads them.

Proof (current bytes): a copy of the scored receipt with `driverSha256 = "0"*64` scores `verdict: clean`, 107 checks,
exit 0 when invoked with the matching zero pin — exactly what the runner would wire:

```
{"schema":"tabi-chrome-cdp-showpicker-r90-counter","verdict":"clean","checkCount":107,...}
```

The battery's `driver-pin` case proves the comparison fires when the receipt differs from the *supplied* pin; it cannot
prove the supplied pin is the frozen one.

**Recommendation:** add required `--expect-driver-sha256`, `--expect-nonce`, `--expect-fixture-sha256` options to the runner
(or read the three from `w1-spec.json`), source the driver from `freeze.txt` (it is pinned there), and thread the literals
into every counter/battery/kill invocation. Do not derive any of the three from `rec`.

### P0-2 — Kill power exits 0 with an empty mutant queue

`scripts/kill-power-round90.mjs:209` (`const queue = MUTANTS.filter(...)`), `:184` (`Number(opt('jobs') || 8)`), `:224` (exit code).

`--only <unknown-name>` selects zero mutants, and `--jobs 0` / `--jobs x` (`Math.min(0|NaN, n)` → zero workers) also leave
`results = []`. The exit expression then sees zero survivors, zero crashed and zero unapplied and returns 0.

Proof (current bytes):

```
$ node scripts/kill-power-round90.mjs … --only __no_such_mutant__ --json
{"schema":"tabi-r90-kill-power","mutants":0,"killed":0,"survived":0,"crashed":0,"survivorsList":[],"unapplied":[],"results":[]}
exit=0
```

**Recommendation:** require `Number.isInteger(CONCURRENCY) && CONCURRENCY >= 1`; require `only` to name exactly one entry in
`MUTANTS` (or be absent); after the workers finish, refuse (exit 2 or 1) unless `results.length === (only ? 1 : MUTANTS.length)`.
Also document `--jobs` in the usage block (`:71-73` lists only `--only`).

### P0-3 — `teardown-closure` crashes instead of refusing on a missing nested object

`scripts/check-showpicker-round90.mjs:905`

`Object.keys(l.teardown.portProbes)` and `Object.values(l.teardown.postKillCurl)` are dereferenced after only
`isObj(l.teardown)`. A receipt whose leg carries `teardown` but lacks either nested object dies with an uncaught `TypeError`
(exit 1, stack on stderr, no JSON findings) instead of a clean refusal. The battery has no case deleting either object
(`w-teardown-probes-open` deletes only `portProbes.child`; `w-teardown-curl-any`/`w-teardown-closed-any` set a value).

Proof (current bytes; receipt copies differ only by deleting one key):

```
file:///…/scripts/check-showpicker-round90.mjs:905
TypeError: Cannot convert undefined or null to object
    at Object.values (<anonymous>)
```

**Recommendation:** guard both with `isObj(...)` (refusal, not a crash) and add one battery case per absent object. This
does not weaken any passing receipt; it only converts a crash into a finding. Requires L1 re-freeze.

### P1-1 — `pins-match-freeze` checks a hardcoded six-file list, not the freeze

`scripts/selftest-r90-gates.mjs:43` (`const FILES = [...]`), `:49-51` (gate body). `freeze.txt` also pins the two priors
(`freeze.txt:7-8`), which no gate verifies; a future pinned file is likewise invisible. The list is a second authority for
`freeze.txt` and can silently omit an entry.

**Recommendation:** iterate the parsed `pins` map (`Object.entries(pins)`) and hash every named file, so priors and future
entries are covered and `FILES` disappears. This strengthens the gate; it does not amend a pin.

### P1-2 — Magic counts outside the freeze

- `scripts/selftest-r90-gates.mjs:55`: `checkCount === 107` (today's counter emits exactly 107 — verified).
- `:68`: `ids.length >= 5` for the r89 no-work control.
- `:107`: `provisional === 1` for `check-capability-status.mjs`.

All three are unpinned thresholds; only the first is a meaningful tripwire. When the count moves, the detail prints only
the observed number, not the id delta.

**Recommendation:** keep 107 as the tripwire (do not amend it mid-wave), print expected/observed plus the symmetric
id-set difference in the detail, and record the three numbers wherever the wave pins are recorded (L1 decision).

### P1-3 — `gate-selftest` does not pass its `--lane` to battery/kill selftests

`scripts/selftest-r90-gates.mjs:88-90` invokes `negatives… --selftest --json` and `kill-power… --selftest --json` with no
`--lane`; both fall back to the hardcoded absolute lane at `scripts/negatives-showpicker-round90.mjs:20` and
`scripts/kill-power-round90.mjs:20`. A runner pointed at a mirror/scratch lane therefore measures the real lane
silently (the drift selftest does get `--lane`, `:91`).

**Recommendation:** pass `--lane lane` to all four selftest invocations and require the scripts' `--lane` (or resolve
`path.join(HERE, '..')`); drop the machine-specific absolute default.

### P1-4 — Dead allowlist entry for the settle expression

`scripts/check-showpicker-round90.mjs:550` includes `'window.__inputs(true)'` in `parent`; `:561` intercepts every such
expression first and returns `p.kind === 'showpicker-domread'`. `parent.includes(...)` therefore never sees that entry: it is
unreachable. (Keeping the entry would only matter if the early return were removed, and then it would re-open the very
non-domread case the D3 rule forbids.)

**Recommendation:** delete `'window.__inputs(true)'` from the `:550` array; leave the `:561` rule as the single authority.
Verdict-neutral.

### P1-5 — Checks that cannot fail independently (kept as coverage glue)

- `scripts/check-showpicker-round90.mjs:528` `leg-order` is entailed by `:526` `plan-frozen`: the latter compares the leg
  name sequence element-wise, so a reorder fails it.
- `scripts/check-showpicker-round90.mjs:877` `same-origin-no-picker-law` is entailed for its three legs by `:720`
  `gesture-law` (ret `undefined`) plus `:881` `intercept-law` (zero opens via `NO_PICKER`).

Both ids are expected ids of battery cases and part of the frozen 107; deleting them is a re-freeze-level change.

**Recommendation:** do not change mid-wave; record the entailment in a one-line comment at each check so a future editor
does not mistake the duplicate for independent evidence.

### P1-6 — Dead replay-limit consistency code and a tautology

`scripts/check-showpicker-round90.mjs:977-978` builds `limBad` from `p.absNeed !== Math.ceil(FRAC*p.priorEvents-1e-9)`, but
`absNeed` was assigned by that same expression (`:924`), so the branch never fires; `limBad` is never read anywhere.
`:992` `replayConsistency` is `always true`: `refused` is defined as `np>0 && absMatched>=absNeed` (`:925`), and
`absNeed===0` covers the `np===0` case.

**Recommendation:** delete `:977-978` (verdict-neutral). Either delete `replayConsistency` or label it explicitly
"informational, always true by construction" so it is not read as an enforced check.

### P1-7 — Duplicated measured tables (keep, but label)

`scripts/check-showpicker-round90.mjs:388-429` (`ACT_LAW`) and `:431-443` (`CHILD_ACT_LAW`): the 11 cross-origin rows are
byte-identical today (verified programmatically: 11/11 identical). They are the parent-frame and child-frame measurements
respectively, so deriving one from the other would hide a future divergence.

**Recommendation:** keep both; add a comment stating they are independently measured (do not "simplify" by derivation).

### P1-8 — State-key list duplicates `EMPTY_STATE`

`scripts/check-showpicker-round90.mjs:236` defines the 18-key `EMPTY_STATE`; `:857` re-lists all 18 sorted keys plus the
16-key empty-array list, and `:863` lists six again. A new state-tracked fixture input would have to be added in three
places; forgetting one silently weakens `no-selection-law`.

**Recommendation:** derive the lists from `Object.keys(EMPTY_STATE).filter(k => k !== 'sValue')` (and the dismissal subset
from an explicit constant if it must differ). Verdict-neutral today.

### P1-9 — Battery/kill duplicate witnesses

Battery (`scripts/negatives-showpicker-round90.mjs`):
- `:254` `cross-origin-tel-message` ≡ `:319` `cross-tel-message-unpinned` (same leg, same `childResult.message`, same expected id).
- `:255` `cross-origin-search-activation` ≡ the loop-generated `cross-search-childact-after-dropped` (`FAMILY_MUT`, `:331-343`).
- `:256` `cross-origin-text-late` ≡ the loop-generated `cross-text-childlate-dropped` (`:331-343`).

Kill power (`scripts/kill-power-round90.mjs`):
- `:137` `cross-number-result-dropped` weakens the same `same(co.childResult, CHILD_RESULT_LAW['sp84-cross-origin-nonfile'])`
  conjunct as `:125` `cross-nonfile-result-dropped` (its `from` is a substring of the first's; both end at `isObj(co.childResult)`).
  Its name suggests a number-leg law it never touches.

Each extra case costs one counter run in the battery and one full battery (226 counter runs) in kill power.

**Recommendation:** delete the three older battery cases (keep the systematic family loop) and the duplicate kill mutant at
the next re-freeze; coverage of the same expected ids is retained by the twins. Re-run battery + kill after removal.

### P1-10 — Drift statement 6 is a text-presence check; the runner's is behavioural

`scripts/check-record-drift-round90.mjs:146-152` claims `gate-selftest` green when the four instrument sources contain the
substring `--selftest` and the runner names the drift script. A comment containing `--selftest` passes; the runner's
`gate-selftest` gate actually executes the four modes. This is a weaker duplicate authority.

**Recommendation:** leave the frozen statement in place; note in its comment that the executing witness is the runner's
`gate-selftest` gate, so a green record is not evidence the modes run.

### P1-11 — Leak witness is an unpinned input, coupled to the freeze by one self-pin

`scripts/check-record-drift-round90.mjs:129-137` reads `.ufo/waves/round-90/scored/leak-witness.json`; the only binding is
`witness.instrumentPins['scripts/check-record-drift-round90.mjs'] === selfPin` (self-pin from the current freeze). The
witness file itself is not in `freeze.txt`. Any later drift edit requires regenerating the witness *and* re-freezing in
lockstep, or `r89-leak-enforcement` goes red (fails closed, but an ordering trap). Current lane: witness pins `bd33…`, freeze
pins `bd33…`, ordinary drift gate 8/8 green.

**Recommendation:** record the witness hash in the same place as the other pins (L1 decision; do not amend freeze
mid-wave), or have the drift gate regenerate/verify the witness rather than trust a stored file.

### P2 — Dead declarations, false/stale documentation

Dead declarations (all no verdict effect):
- `scripts/check-showpicker-round90.mjs:45` `const hex = …` in the counter selftest is computed and never used.
- `scripts/check-showpicker-round90.mjs:977-978` `limBad` (see P1-6).
- `scripts/negatives-showpicker-round90.mjs:10` `selftestAsJson` never used (both paths print JSON).
- `scripts/negatives-showpicker-round90.mjs:113` `openAll` never used.
- `scripts/negatives-showpicker-round90.mjs:282` `freshPrior` never used.
- `scripts/kill-power-round90.mjs:10` `selftestAsJson` never used.
- `scripts/check-record-drift-round90.mjs:40-41` `read`/`readJson` never used (`statements()` defines its own `rd`/`rdJson`).
- `scripts/check-record-drift-round90.mjs:47` `skill` never used (statement 2 reads `SKILL.md` through `rd`).

False/stale documentation:
- `scripts/negatives-showpicker-round90.mjs:3` names `accept-grammar-law-r90-case`; the actual case is
  `accept-grammar-law-r89-case` (`:361`).
- `scripts/negatives-showpicker-round90.mjs:6-7` says the selftest "runs the battery's OWN case list copied into a scratch
  dir"; it copies nothing and runs the counter twice (`:38-48`) on the scored receipt with `ac.accept` mutated.
- `scripts/kill-power-round90.mjs:2-8` says the selftest spawns `--only accept-grammar-r89-case-dropped`; it spawns neither
  the battery nor `--only` — it runs stock vs a `fixture-descriptors`-weakened counter (`:40`, `:58`).
- Stale generation labels: `scripts/check-showpicker-round90.mjs:67-68` ("tabi round 83 … generation-r84"),
  `scripts/negatives-showpicker-round90.mjs:56` ("round 83"), `scripts/kill-power-round90.mjs:64` ("round 83"),
  `scripts/selftest-r90-gates.mjs:2` ("tabi round 88 … generation r89").
- `scripts/check-showpicker-round90.mjs:914` says "(6 legs, each >= 2 s observe …)" while the frozen plan has 41 legs.
- `scripts/check-record-drift-round90.mjs:232` comment typo `QAULITY 162`.

Counter selftest quality issues (same block, `scripts/check-showpicker-round90.mjs:25-61`):
- `:32` names the scratch lane dir `lane`, while both fixtures carry `lane: 'tabi'` (`:25`, `:30`). Every selftest run
  therefore also fails `lane`; the observed ids were `["lane","send-log-allowlist","plan-calls"]`. The "only defect" framing
  in the header is false.
- `:57` requires only that `plan-calls` is present; it does not assert the finding set, so a counter that over-refuses
  (`lane` + `plan-calls` on everything) would pass.
- The second case (`:41-58`) duplicates battery cases `plan-calls-settle-call` / `plan-calls-settle-order`
  (`scripts/negatives-showpicker-round90.mjs:190-191`), and its filter-based mutation also breaks the send-id sequence,
  adding `send-log-allowlist`. It is also the only selftest dependency on the scored receipt.

**Recommendation:** delete the dead declarations; fix the comments/case name; name the scratch lane `tabi` (or set the
fixtures' lane to `lane`), rename the settle entry instead of filtering it (to avoid the id gap) or renumber, and assert the
second run's id set is a subset of the expected ids. Consider dropping the second case and keeping the isolated schema case,
since the battery already binds the settle rule; the runner runs both anyway. All of these are byte changes to pinned
instruments — L1 re-freeze required; none changes a pass/fail predicate.

### Minor — `coverage.unknown` is informational only

`scripts/negatives-showpicker-round90.mjs:606` computes `unknown` as covered ids absent from `declared`, but a passing
refusal case must have emitted its expected id, so `unknown` is empty whenever `failed === 0`; the gate checks only
`uncovered` (`scripts/selftest-r90-gates.mjs:59`). Harmless duplication; either check both or drop `unknown` from the
output description.

## D3 settle change — reviewed, no gap found

The D3 diff (removal of the `settle.length !== 1` count check and the non-domread `else`; the `:561` allowlist rule; the
`:609-610` adjacency rule) is covered by the current battery and mutant set:

- ordered sequence `want`/`got` (`:604`, `:612`) requires exactly one settle call at the settle position on domread legs;
- `:561` refuses the expression on every non-domread leg; battery `send-log-settle-on-plain-leg` (`:192`) exercises it;
- `:609-610` adjacency is load-bearing because `window.__state()` is not in `got`; battery `plan-calls-settle-order`
  (`:191`) exercises it;
- kill mutants `settle-want-dropped`/`settle-want-always` (`:176-177`), `settle-order-any` (`:178`), `settle-allow-any`
  (`:179`) target the separate conjuncts; `settle-want-dropped`/`always` intentionally share one `from` string
  (complementary directions), which is not duplication.

## Preserved contract / stop point

- No lane file was edited, no git/jj mutation, no subagent, no background job. Scratch only, deleted before yield.
- I did not remove anything. The deletions above are verdict-neutral candidates; every one changes a `freeze.txt`-pinned
  byte, so it requires L1 re-freeze before any scored run.
- Not recommended for deletion: `CHILD_ACT_LAW`/`ACT_LAW` as independent measurements; `mode-law` (page-measured
  `multiple` vs hardcoded shape) and `fixture-descriptors`/`accept-grammar-law` cross-checks; the r89 no-work receipt,
  r89 lesson, prior receipts, and freeze provenance.
- Stop point: the next deletion candidate (`leg-order`, `same-origin-no-picker-law`, the 107th check) would either change
  the frozen check count or remove a distinct witness id required by the battery; that is a re-freeze decision, not
  dead-weight cleanup.

## Evidence index (scratch, deleted after this report)

- `counter-clean.json`, `counter-current.json` — clean 107/107.
- `d3-driver-zero.out` — zeroed-driver receipt scores clean under the matching self-derived pin.
- `d3-no-curl.err`, `d3-no-probes.err` — `TypeError` at `check-showpicker-round90.mjs:905`, no JSON.
- `d3-kp-empty` — `--only __no_such_mutant__` → `mutants: 0`, exit 0.
- selftest stdout captured in the "What I measured" section.
