# W2 attack — receipt case `lifecycle-removal`

Author-side review (leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` (commit A
`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).

**Verdict: HOLDS** for the committed `lifecycle-removal` record: the expectation
is fixture-declared before observation, the pass is not vacuous on the removal
claim, and the fixture is sha-bound at both record time and measurement time.
Two defects in the *pass predicate* are recorded (F1, F2): they do not falsify
this receipt, but F1 means the case's `detail` string ("via actions …") is not
something the pass predicate itself establishes.

## What was run

```
$ git rev-parse HEAD
b444ca8e024f386124418169e8e400221524bba3

$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-lifecycle-removal.json
WEBMCP_CASE id=lifecycle-removal status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-lifecycle-removal.json
EXIT=0
```

Committed receipt vs re-run, after deleting `durationMs` and every `frameId`:

```
$ jq -S '.cases[]|select(.id=="lifecycle-removal")|del(.durationMs)|walk(if type=="object" then del(.frameId) else . end)' <receipt> ...
DIFF_EXIT=1
# only atMs values (10→11, 15→16, 75→77) and the two loopback ports (43245→36267)
```

Status, `expected`, `expectedProvenance`, per-action outcomes, `toolsAdded`,
`toolsRemoved`, `getTools`, and `issues` are identical between the committed
receipt and the re-run.

A second consecutive re-run also passed and reproduced the same per-action
attribution:

```
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-lifecycle-removal-run2-3092.json
WEBMCP_CASE id=lifecycle-removal status=pass
lifecycle: toolsRemoved ["transient","volatile"], getTools [],
  removeForm{ran:true, removed:["transient"]},
  abortRegistration{ran:true, removed:["volatile"]}
```

## Q1 — expectation set from a named oracle BEFORE observation (QUALITY 17): HOLDS

- Fixture declares the expectation as literals before any registration or
  action: `corpus/evidence/round-16/webmcp/fixtures/lifecycle.html:53-54`
  (`actionOrder: ['removeForm','abortRegistration']`,
  `expectedRemoved: ['transient','volatile']`).
- Case reads it as `decl?.expectedRemoved` and records
  `expectedProvenance: 'fixture __webmcpFixture actionOrder + expectedRemoved'`
  (`scripts/webmcp-loopback-round16.mjs:970,990`). The receipt's
  `expected.toolsRemoved` equals the fixture literal; nothing in the expectation
  is derived from `cdp.toolsAdded/toolsRemoved`.
- The fixture blob is byte-identical at A and at the snapshot:
  `git show 8f7feb3:…/lifecycle.html | sha256sum` =
  `7be6268a8b80d3a435d13ca12fd43b0a0ab1703b1b3981e289b443ac51eed938`
  = working-tree sha = receipt `fixtureSha256` (both receipts).
- Failure cannot pass: if `fixtureDeclaration` returns null,
  `expected=[]` and `expectedRemoved=[]`, and the `expectedRemoved.length > 0`
  guard at `:979` forces fail. The fixture's modelContext-absent branch slices
  `expectedTools` but leaves `expectedRemoved` at both names, so the skip path
  also fails on `missingRemovals`.

## Q2 — is pass vacuous: HOLDS (non-vacuous), with two predicate defects

Pass requires (a) non-empty expectation, (b) both names in browser-emitted
`WebMCP.toolsAdded`, (c) both names in browser-emitted `WebMCP.toolsRemoved`,
(d) neither name in the final `getTools` snapshot (`:970-984`). (b)/(c) are
CDP events the page cannot forge, so a green pass is a real browser-level
add/remove observation.

Isolated mutation B (copy of the fixtures dir; `__webmcpFixture.actions = {}`,
`actionOrder: []`, removals on 500/900 ms timers) **fails** the case, because
the case snapshots before the timers fire:

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-mutB --out /tmp/w2-mutB2.json
WEBMCP_CASE id=lifecycle-removal status=fail
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
```

### F1 (Medium) — pass ignores `actionsRun`; `detail` credits actions that did not act

`pass` never looks at `actionsRun` (`:978-984`), so neither `ran` nor
`removedAfterAction` is enforced. Observed with synthetic fixtures in
`/tmp` (mutated bytes, therefore different sha — these demonstrate the
predicate, not the committed fixture):

- Mutant A: both action bodies replaced by `Promise.resolve('noop')`; the form
  removal and `ac.abort()` are performed by 500/900 ms timers instead.

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-mutA-fixtures --out /tmp/w2-mutA-3092.json
WEBMCP_CASE id=lifecycle-removal status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0
```

  Record: `detail: "toolsRemoved observed for transient, volatile via actions
  removeForm, abortRegistration"`, `removeForm{ran:true,
  removed:["transient"]}`, `abortRegistration{ran:true, removed:["volatile"]}`
  (and `getTools:null`, see F2) — the same attribution shape as the committed
  receipt, from action bodies that do nothing.

- Mutant F: `actions` contains only `removeForm`; `actionOrder` still names
  `abortRegistration`; removals again on timers.

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-mutF-fixtures --out /tmp/w2-mutF-3092.json
WEBMCP_CASE id=lifecycle-removal status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0
```

  Record: `status:"pass"`, `detail:"… via actions removeForm, abortRegistration"`,
  `{"action":"abortRegistration","ran":false,"reason":"no such action",
  "observedEventsAfterAction":true,"removedAfterAction":[{"name":"volatile",…}]}`.

Consequence: a green `lifecycle-removal` establishes "both tools were announced
removed at some point in the page session, and neither is in the final
snapshot", not "removeForm removed `transient` and abortRegistration removed
`volatile`". For the committed run the causal mapping
is true, but it is established by reading the sha-bound fixture source
(`lifecycle.html:38-51`), not by the pass predicate. The receipt's
`expected.basis` caveat is accurate; the `detail` string overstates the
predicate's reach.

### F2 (Low) — final-state check silently skipped when `getTools` is unavailable

`:976-977` sets `remainingNames = Array.isArray(getTools) ? … : null` and then
`lingering = remainingNames ? … : []`, so any null/non-array snapshot disables
the anti-lingering check with no degradation marker.

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-mutD --out /tmp/w2-mutD.json
WEBMCP_CASE id=lifecycle-removal status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0

actual.getTools = {"error":"page.evaluate: Error: mutant-getTools-throws …"}
```

Mutant A above also passed with `getTools:null`. In the committed run the
snapshot is real (`getTools: []`), so the property held; the defect is that a
future run cannot be distinguished from one where it was never checked.

## Q3 — does the fixture bind: HOLDS

```
$ sha256sum corpus/evidence/round-16/webmcp/fixtures/lifecycle.html
7be6268a8b80d3a435d13ca12fd43b0a0ab1703b1b3981e289b443ac51eed938
$ git show b444ca8e024f386124418169e8e400221524bba3:corpus/evidence/round-16/webmcp/fixtures/lifecycle.html | sha256sum
7be6268a8b80d3a435d13ca12fd43b0a0ab1703b1b3981e289b443ac51eed938
```

- Receipt case carries `fixtureFile:"lifecycle.html"` and
  `fixtureSha256:7be62…`; the harness computes that digest from the exact
  bytes it served (`fixtureInventory`, `scripts/webmcp-loopback-round16.mjs:1324-1356`).
- Measurement enforces it: `.ufo/waves/round-16/measure.mjs:239-243` reads the
  fixture blob at the measured revision and fails the claim when
  `sha256(blob) !== case.fixtureSha256` (the A-revision counter defect existed
  precisely because it read `fixture` instead of `fixtureFile`).
- Producer binding also holds: `receipt.producerSha256` is compared to the
  harness blob at rev (`measure.mjs:229`), and `git diff 8f7feb3 b444ca8`
  touches only `.ufo/waves/round-16/measure.mjs` and the retained defect
  measurement — the harness and lifecycle fixture are unchanged between A and
  the snapshot.

## Counter cross-check

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"c2_webmcp_held":1,…, "caseIds":[…,"lifecycle-removal",…],"failures":[]}
EXIT=0
```

Running the repaired counter against A also returns 1; the claimed "0 at A" is
a property of the counter blob at A (`4eb82895…`), retained as
`corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json`
(its failure was `case data-url-declarative fixture digest`, not lifecycle).
So "0 → 1 at b444ca8" is consistent with a counter-only repair; it is not a
change in the lifecycle case.

## Residual risk / verification gaps

- Action-loop race: the case waits only for `toolsAdded.length > 0` before
  running actions (`:949`). If `volatile`'s registration resolved after the
  abort action, the case would fail on missing add/removal; this is the safe
  direction (no false pass). During this run `volatile` was added first.
- Expectations are read from the live page via `fixtureDeclaration` after load,
  not parsed from disk. The sha binding makes the served bytes identical in
  this run; a divergence would require a browser-level mutation of
  `__webmcpFixture`, which is outside the observed evidence.
- Mutants A/B/D/F use modified fixture bytes under `/tmp`; they exercise the
  predicate only and were not written to the lane. No lane file was modified
  except this report.
- Not re-run: the measurement-binding gate/selftest (out of this item's scope);
  the `--claim C1` counter.

No tools installed or updated.
