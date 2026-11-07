FINDINGS

# R73Mut1 — semantic mutants of `check-synthpinch-r73.mjs` (tabi round 73, C1 coverage)

Seat: mutation tester (leaf, no delegation), lane `tabi-shokunin`, wave w1, round 73.
Base `d7ff9f190260d91a1e675f474b7abf79960cdfd4`; freeze digests commit D =
`3409ab53b905d12d0866c6c93373e1c9887eda10`. I did not touch the frozen claim, the claim file,
the kill-power control, `scripts/`, `corpus/`, lane root, fleet root, or any sibling directory.
No git/jj mutation, commit or push; read-only git only. No tools installed or upgraded.
All writes were in `/fast/scratch/hyaku/tabi-r73/R73Mut1/` (deleted before this seat yields) and in
`.ufo/waves/round-73/w1/R73Mut1/` plus the seat's Report trailer path.

## 1. Headline

- **38 single-edit semantic mutants** of the r73 counter were generated. **None is a force-true
  mutant**; **0 is an exact duplicate of the 19 frozen semantic mutants** in
  `.ufo/waves/round-73/controls/c1/kill-power-r73.mjs` (exact from→to pair comparison, §2.4).
  **4 share a source location** with a frozen mutant but make a different edit: timeline JSON
  shape (`[e.ts,e.at]` → `[e.ts,e.at,e.type]` vs frozen `[e.at]`), launch-token loop
  (first-only/last-only vs frozen every→some), producer predicate truthiness
  (`r.predicate` vs frozen AND→OR).
- **15 killed / 23 survived** under the frozen rule (*killed = battery exit 1*; unmutated
  baseline exit 0). Every kill is targeted: `positiveOk` stayed true and each failed battery case
  is the case that names the mutated law (§3). No usage exit-2, no timeout, no positive-broken
  kill of the r72 kind.
- **21 of the 23 survivors have an acceptance witness**: a crafted receipt or prior set that the
  **pristine** counter refuses for the named id (exit 1) and the **mutant accepts clean** (exit 0,
  no finding). All 21 are run and recorded in `receipts/probes.json` (§4).
- **2 survivors are verdict-equivalent**: the named id disappears, but another check refuses every
  receipt that could distinguish them, so no receipt exists that the mutant accepts and the
  pristine counter refuses. They are redundant clauses, not battery gaps (§5).
- The frozen leg-(c) kill-power result is not contradicted: kill power `holds=true` over the 19
  selected semantics. The 23 survivors are a **coverage finding about the battery**, not a defect
  in the predicate, the counter's own positive gate, or the kill rule. I propose no amendment.

## 2. Provenance and method

### 2.1 Inputs (read-only; hashes unchanged before and after all runs)

```
$ sha256sum tabi-shokunin/scripts/check-synthpinch-r73.mjs \
            tabi-shokunin/scripts/negatives-synthpinch-r73.mjs \
            tabi-shokunin/scripts/chrome-cdp-synthpinch-round73.mjs \
            tabi-shokunin/corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json
3104101a9ac8b0cd09337a870139653f7a64cfb7eb65067daf389119ce20d4d1  scripts/check-synthpinch-r73.mjs
0a738780090a8483eda8290f513b7d88ba41dd221120b14950dd6649609b88af  scripts/negatives-synthpinch-r73.mjs
3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4  scripts/chrome-cdp-synthpinch-round73.mjs
a3b9070bca0db67000d58eb34a990d05e8191a34b2882ec30a9316472d703ea8  corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json
```
exit 0. The three instrument hashes equal `.ufo/waves/round-73/freeze.txt`; the receipt hash equals
the scored (a) receipt recorded in `.ufo/waves/round-73/scored/c1-counter-a.json`.

Scratch copies
`/fast/scratch/hyaku/tabi-r73/R73Mut1/s/{check,negatives}-synthpinch-r73.mjs` are byte copies
(same two hashes, verified again after 38 mutant runs + 23 probes + 1 baseline re-run).

### 2.2 Mutant construction

Every mutant is one contiguous source-string replacement applied in memory to the pristine copy,
written to its own directory `m/<id>/` together with an **unmutated** battery copy beside it (the
battery always runs the counter beside itself, `negatives-synthpinch-r73.mjs:33-34`). The generator
(`receipts/run-mutants.mjs`) refuses (exit 2) unless each edit string occurs **exactly once** and
actually changes the bytes. It records the 1-based counter line and the mutated-counter sha256 per
mutant in `receipts/manifest.json`.

```
$ DRY=1 node run-mutants.mjs
DRY 38 mutants ok                                    # exit 0: all 38 edits unique
```

The 12 r72 survivors named in the seat were re-targeted at r73 bytes (the 13th, anchor
tolerance-2, is now frozen as `M-anchor-tolerance-2` and excluded by definition). The remaining
26 are new: replay identifier loops / browserId shape / timeline JSON, leg-mark floors, run-window,
host/devtools coercions, scale chain, event-window edge, per-leg wheel deltaMode, touch-sequence
identity, teardown values, pinch count, producer predicate, allow-list branches, origin port,
schema, leg order, elapsedMs, wheel-law tolerance.

### 2.3 Battery invocation (identical for all 38; only `--work` differs)

```
node <mutantdir>/negatives-synthpinch-r73.mjs \
  --real .../corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json \
  --expect-driver-sha256 3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4 \
  --expect-nonce tabi-r73-l1-3409ab53b905 \
  --prior .ufo/waves/round-73/controls/c1/smoke1.receipt.json  ... (smoke1..9) \
  --prior .../degenerate-dispatch-wheel.receipt.json \
  --prior .../degenerate-set-scale.receipt.json \
  --prior .../degenerate-skip-touch.receipt.json \
  --work /fast/scratch/hyaku/tabi-r73/R73Mut1/w/<id> --json
```

No `--laundered` argument was passed (the seat command omits it), so the battery's 3 laundered
degenerate cases are not in this run: **225 cases, not 228**. Kill rule used exactly as frozen:
unmutated battery exit 0, mutant battery exit 1.

### 2.4 Baseline and duplicate checks

```
$ node m/zz-baseline/negatives-synthpinch-r73.mjs ... --work w/zz-baseline --json
EXIT=0
{"positiveOk":true,"cases":225,"refuseCases":216,"mustAcceptCases":9,"launderedCases":0,
 "passed":225,"isolatedCases":171,"idsWithIsolatedCase":87,"checkIds":98,
 "coverageGap":[],"allOk":true,"failed":[]}
```
(`receipts/baseline-full.json`; compact copy `receipts/baseline.json`.)

Exact frozen-pair comparison (the 19 SEMANTIC entries parsed from
`.ufo/waves/round-73/controls/c1/kill-power-r73.mjs`, not from my transcription):

```
$ node -e '<parse SEMANTIC literal; compare with manifest>'
frozen mutants 19
exact frozen pair duplicates 0 shared-location 4 mine 38     # exit 0
```

### 2.5 Reproducible drivers copied beside this report

`receipts/run-mutants.mjs` (38 mutant runs, `JOBS=10`, wall 436 s, shell exit 0) and
`receipts/probe-survivors.mjs` (23 probes, exit 0). Per-mutant battery records:
`receipts/results.json` and `receipts/m-01..m-38-*.json`.

## 3. Mutant inventory (38)

`line` is the 1-based line of the edit in `scripts/check-synthpinch-r73.mjs` (sha256 `3104101a…`).
"failed battery case(s)" are the cases the mutated counter failed that the baseline passed; every
killed mutant had `positiveOk: true`, so these are targeted negative-suite kills, not the mutant
rejecting the clean scored receipt.

| # | mutant | line | edit (from -> to) | verdict | failed battery cases |
|---|---|---|---|---|---|
| 1 | `r72-in-span-lower-1` | 69 | `in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450]` -> `in: { seq: [], wheels: [5, 'in'], scale: 2, span: [1, 450]` | **SURVIVED** | — |
| 2 | `r72-zero-span-upper-100000` | 78 | `zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 6000]` -> `zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 100000]` | **SURVIVED** | — |
| 3 | `r72-pinch-params-first-only` | 181 | `canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params))` -> `canon(pinches.slice(0, 1).map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params).slice(0, 1))` | **SURVIVED** | — |
| 4 | `r72-empty-params-open` | 188 | `if (EMPTY.has(c.method)) return canon(c.params) === '{}';` -> `if (EMPTY.has(c.method)) return true;` | **SURVIVED** | — |
| 5 | `r72-leg-mark-monotonic-dropped` | 171 | `(i === 0 \|\| m.at >= marks[i - 1].at)` -> `(i === 0 \|\| true)` | **SURVIVED** | — |
| 6 | `r72-browser-getversion-once-dropped` | 196 | ` && once('Browser.getVersion')` -> `` | **SURVIVED** | — |
| 7 | `r72-dmo-once-dropped` | 196 | ` && once('Emulation.setDeviceMetricsOverride')` -> `` | **SURVIVED** | — |
| 8 | `r72-leg-error-message-loose` | 229 | `leg.cdpError.includes(want.error)` -> `typeof leg.cdpError === 'string'` | **SURVIVED** | — |
| 9 | `r72-server-log-binding-some` | 137 | `served.every((s) => s.run === r.nonce)` -> `served.some((s) => s.run === r.nonce)` | **SURVIVED** | — |
| 10 | `r72-seq-first-free` | 160 | `events.every((e, i) => isObj(e) && e.seq === i + 1)` -> `events.every((e, i) => isObj(e) && (i === 0 \|\| e.seq === i + 1))` | **SURVIVED** | — |
| 11 | `r72-event-types-deltamode-dropped` | 165 | `num(e.deltaY) && num(e.deltaMode) && num(e.clientX) && num(e.clientY)` -> `num(e.deltaY) && num(e.clientX) && num(e.clientY)` | **SURVIVED** | — |
| 12 | `r72-initial-scale-cdp-dropped` | 233 | `near(legs[0]?.scaleBefore?.page, 1) && near(legs[0]?.scaleBefore?.cdp, 1)` -> `near(legs[0]?.scaleBefore?.page, 1)` | **SURVIVED** | — |
| 13 | `r73-replay-timeline-type-included` | 146 | `[e.ts, e.at]` -> `[e.ts, e.at, e.type]` | **SURVIVED** | — |
| 14 | `r73-replay-browserid-length-loose` | 145 | `/\/devtools\/browser\/([0-9a-f-]{36})$/` -> `/\/devtools\/browser\/([0-9a-f-]+)$/` | **SURVIVED** | — |
| 15 | `r73-replay-token-priors-last-only` | 148 | `priors.every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` -> `priors.slice(-1).every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` | **SURVIVED** | — |
| 16 | `r73-replay-token-priors-first-only` | 148 | `priors.every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` -> `priors.slice(0, 1).every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` | KILLED | ["replay-byte-identical","replay-nonce-stamps-rewritten","replay-token-only-shared"] |
| 17 | `r73-replay-token-shape-12-or-more` | 148 | `/^[0-9a-f]{12}$/.test(tok)` -> `/^[0-9a-f]{12,}$/.test(tok)` | **SURVIVED** | — |
| 18 | `r73-leg-marks-at-zero` | 171 | `num(m.at) && m.at > 0` -> `num(m.at) && m.at >= 0` | **SURVIVED** | — |
| 19 | `r73-closedat-floor-start-mark` | 172 | `r.closedAt >= marks[marks.length - 1].at` -> `r.closedAt >= marks[0].at` | KILLED | ["leg-marks-closed-early"] |
| 20 | `r73-marks-name-length-only` | 171 | `canon(markNames) === canon(['start', ...LEG_ORDER])` -> `markNames.length === LEG_ORDER.length + 1` | KILLED | ["leg-marks-fabricated-name"] |
| 21 | `r73-late-after-close-sign-dropped` | 172 | `Number.isInteger(r.lateAfterClose) && r.lateAfterClose >= 0` -> `Number.isInteger(r.lateAfterClose)` | KILLED | ["leg-marks-late-negative"] |
| 22 | `r73-run-window-floor-800` | 154 | `t1 - t0 >= 8000` -> `t1 - t0 >= 800` | KILLED | ["run-window-short"] |
| 23 | `r73-host-chromium-any-version` | 140 | `/^Chromium \d+\.\d+\.\d+\.\d+/` -> `/Chromium \d+/` | **SURVIVED** | — |
| 24 | `r73-devtools-stderr-dropped` | 143 | `typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url)` -> `true` | KILLED | ["devtools-stderr-absent"] |
| 25 | `r73-devtools-port-string-coercion` | 143 | `dl.port === argvPort` -> `Number(dl.port) === argvPort` | **SURVIVED** | — |
| 26 | `r73-scale-chain-dropped` | 235 | ` && LEG_ORDER.slice(1).every((n, i) => near(legOf(n).scaleBefore?.page, legOf(LEG_ORDER[i]).scaleAfter?.page))` -> `` | KILLED | ["scale-agreement-chain"] |
| 27 | `r73-event-window-strict-lower` | 175 | `return e.at >= w[0] && e.at <= w[1]` -> `return e.at > w[0] && e.at <= w[1]` | KILLED | ["accept-mark-equal-event-at"] |
| 28 | `r73-wheels-deltamode-number-only` | 222 | `wheels.every((e) => e.ctrlKey === true && e.deltaMode === 0)` -> `wheels.every((e) => e.ctrlKey === true && num(e.deltaMode))` | KILLED | ["in-wheel-delta-mode","out-wheel-delta-mode","clamp-wheel-delta-mode","default-wheel-delta-mode","zero-wheel-delta-mode"] |
| 29 | `r73-touch-seq-length-only` | 218 | `canon(nonMove) === canon(want.seq) && moveTypesOk` -> `nonMove.length === want.seq.length && moveTypesOk` | **SURVIVED** | — |
| 30 | `r73-teardown-curl-fixture-number` | 262 | `td.postKillCurl.fixture === 7` -> `typeof td.postKillCurl.fixture === 'number'` | **SURVIVED** | — |
| 31 | `r73-pinch-count-at-least-9` | 180 | `pinches.length === 10` -> `pinches.length >= 9` | KILLED | ["pinch-call-count","pinch-call-duplicate","pinch-method-suffix"] |
| 32 | `r73-producer-predicate-truthy` | 264 | `r.predicate === true && r.synthPinchHypothesis === 'CONFIRMED'` -> `r.predicate && r.synthPinchHypothesis === 'CONFIRMED'` | KILLED | ["producer-verdict-string-true","producer-verdict-one"] |
| 33 | `r73-layoutmetrics-params-open` | 188 | `if (EMPTY.has(c.method)) return canon(c.params) === '{}';` -> `if (EMPTY.has(c.method)) return c.method === 'Page.getLayoutMetrics' ? true : canon(c.params) === '{}';` | **SURVIVED** | — |
| 34 | `r73-origin-port-optional` | 182 | `/^http:\/\/127\.0\.0\.1:\d+$/` -> `/^http:\/\/127\.0\.0\.1(:\d+)?$/` | **SURVIVED** | — |
| 35 | `r73-schema-prefix-r7` | 131 | `r.schema === 'tabi-chrome-cdp-synthpinch-r73'` -> `typeof r.schema === 'string' && r.schema.startsWith('tabi-chrome-cdp-synthpinch-r7')` | KILLED | ["schema"] |
| 36 | `r73-leg-order-length-only` | 156 | `canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER)` -> `legs.map((l) => l && l.name).length === LEG_ORDER.length` | KILLED | ["leg-order"] |
| 37 | `r73-leg-params-elapsed-nullable` | 157 | `num(l.elapsedMs) && l.elapsedMs >= 0` -> `l.elapsedMs != null` | KILLED | ["leg-params-elapsed-string"] |
| 38 | `r73-wheel-law-relative-tolerance` | 245 | `-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5)` -> `-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), Math.abs(lawSum(n)) * 0.02)` | KILLED | ["clamp-delta-off-0.8","out-delta-off-0.8","default-delta-off-0.8"] |

Battery exits: 15 × 1, 23 × 0; baseline 0. Every mutant had `positiveOk: true`, `cases: 225`.
Mutant #27 is killed by the **must-accept** class (`accept-mark-equal-event-at`): the mutated
counter became stricter than the frozen law at an exact mark boundary, so the must-accept case
fails. All other kills are refuse-case kills naming the mutated law.

## 4. Survivor witnesses (21 acceptance witnesses)

For every survivor except the two in §5, the same probe shape was run: pristine counter →
exit 1 with the named finding; mutant counter on the same input → **exit 0, findings []**.
Unless stated otherwise the receipt is the scored (a) receipt with one mutation; several receipt
changes alter the counter's own re-derivation, so `legShape` and `slowToTouchSpanRatio` were
recomputed from that re-derivation before both runs (the battery's `launderInto` procedure), so
`legshape-consistency`/`ratio-consistency` cannot fire on the mutation's behalf. Exact operations
are in `receipts/probe-survivors.mjs`; results in `receipts/probes.json`.

| mutant | crafted receipt / prior set | pristine | mutant |
|---|---|---|---|
| `r72-in-span-lower-1` | `in` wheels' `ts` linear from t0 to t0+100 ms (laundered) | exit 1 `["leg-in-timing"]` | exit 0 `[]` |
| `r72-zero-span-upper-100000` | last `zero` wheel `ts` = first + 7000 ms (laundered) | exit 1 `["leg-zero-timing"]` | exit 0 `[]` |
| `r72-pinch-params-first-only` | 6th `Input.synthesizePinchGesture` send `scaleFactor = 2.5` | exit 1 `["pinch-call-params"]` | exit 0 `[]` |
| `r72-empty-params-open` | append `Page.enable` with params `{"extra":1}` (id N+1) | exit 1 `["send-log-allowlist"]` | exit 0 `[]` |
| `r72-leg-mark-monotonic-dropped` | `legMarks[1].at = legMarks[0].at - 1` (6 < 7) | exit 1 `["leg-marks","event-leg-window"]` (marksOk false cascades) | exit 0 `[]` |
| `r72-browser-getversion-once-dropped` | append `Browser.getVersion {}` | exit 1 `["send-log-allowlist"]` | exit 0 `[]` |
| `r72-dmo-once-dropped` | append a second exact `Emulation.setDeviceMetricsOverride` | exit 1 `["send-log-allowlist"]` | exit 0 `[]` |
| `r72-leg-error-message-loose` | pen `cdpError = '{"code":-32602,"message":"Other failure"}'` | exit 1 `["leg-pen-error"]` | exit 0 `[]` |
| `r72-server-log-binding-some` | served `/` row's `run` → `tabi-r73-other`, then append a second served `/` row carrying the real nonce | exit 1 `["server-log-binding"]` | exit 0 `[]` |
| `r72-seq-first-free` | `events[0].seq = 42` | exit 1 `["seq-monotonic"]` | exit 0 `[]` |
| `r73-replay-timeline-type-included` | extra `--prior`: clone of the receipt with launch token and browser id swapped and every `event.type` prefixed `zz-` (same `ts`,`at`) | exit 1 `["replay-event-timeline"]` | exit 0 `[]` |
| `r73-replay-browserid-length-loose` | DevTools url id → `abc123` (stderrHead updated too) | exit 1 `["replay-devtools-url"]` | exit 0 `[]` |
| `r73-replay-token-priors-last-only` | `--prior <collision>` (same launch token, url swapped, all `ts` +0.5) then `--prior smoke1` (collision **first**, non-colliding **last**) | exit 1 `["replay-launch-token"]` | exit 0 `[]` |
| `r73-replay-token-shape-12-or-more` | `host.launchToken = "0123456789abc"` (13 hex) | exit 1 `["replay-launch-token"]` | exit 0 `[]` |
| `r73-leg-marks-at-zero` | `legMarks[0].at = 0` | exit 1 `["leg-marks","event-leg-window"]` | exit 0 `[]` |
| `r73-devtools-port-string-coercion` | `host.devtoolsListening.port = String(port)` (url/argv unchanged) | exit 1 `["devtools-port-binding"]` | exit 0 `[]` |
| `r73-touch-seq-length-only` | last `touchend` of the `touch` leg → `touchcancel` (same length; laundered) | exit 1 `["leg-touch-seq"]` | exit 0 `[]` |
| `r73-teardown-curl-fixture-number` | `teardown.postKillCurl.fixture = 6` (still a number) | exit 1 `["teardown-closure"]` | exit 0 `[]` |
| `r73-layoutmetrics-params-open` | append `Page.getLayoutMetrics` with params `{"x":1}` (id N+1) | exit 1 `["send-log-allowlist"]` | exit 0 `[]` |
| `r73-origin-port-optional` | `fixture.origin = "http://127.0.0.1"` and the `Page.navigate` url likewise (no `:port`) | exit 1 `["send-log-allowlist"]` | exit 0 `[]` |
| `r73-host-chromium-any-version` | `host.chromium = "Chromium 155"` (same family, 3-part version) | exit 1 `["host-chromium"]` | exit 0 `[]` |

## 5. Two verdict-equivalent survivors (no acceptance witness exists)

For these the mutant drops the named id, but every receipt that makes the named check fail is
refused by a second check, so the mutant's exit code is unchanged. `probes.json` records both
finding sets; `distinguishes` is null by construction.

| mutant | crafted receipt | pristine | mutant | why no acceptance witness |
|---|---|---|---|---|
| `r72-event-types-deltamode-dropped` | first `in` wheel `deltaMode = "0"` (string) | exit 1 `["event-types","leg-in-wheels"]` | exit 1 `["leg-in-wheels"]` | every wheel event belongs to a frozen leg (`event-leg-domain`); each wheel leg's `leg-*-wheels` check requires `deltaMode === 0`, and each non-wheel leg requires zero wheels, so a wheel with a non-number `deltaMode` always fires `leg-*-wheels` |
| `r72-initial-scale-cdp-dropped` | `legs[0].scaleBefore.cdp = 7` (page stays 1) | exit 1 `["initial-scale","scale-agreement"]` | exit 1 `["scale-agreement"]` | the only pair the dropped term catches is page≈1, cdp≉1, which `scale-agreement`'s `near(before.page, before.cdp)` always catches; both≈v≠1 is still caught by the retained page term |

These are redundant clauses, not battery gaps: adding a battery case for them would not change a
single verdict.

## 6. Coverage reading (what the battery cannot see on this receipt)

The 21 witnesses above cluster into these unexercised regions of the frozen battery. Each is a
concrete suggested case for a future battery generation; none requires touching the frozen
predicate, counter, pins or kill rule.

1. **Leg span bounds away from the far edges.** `leg-in-timing`/`leg-zero-timing` are exercised
   only by a +1000 ms stretch (above the upper bound), a ~0.016 ms compression (below 1) and a
   100 ms compression (below 150). The interval `[1,150)` for `in`/`out`/`clamp` and
   `(6000,100000]` for `zero` are invisible. Cases `in-timing-span-100` and
   `zero-timing-span-7000` would kill mutants 1–2.
2. **Pinch params beyond the first call.** The only param-mutating case edits `pinches[0]`;
   calls 2–10 are pinned by nothing (the allow-list accepts any `Input.synthesizePinchGesture`
   params). A `pinch-call-params-nonfirst` case kills mutant 3.
3. **Exact-`{}` allow-list branch.** `allowlist-params-absent` deletes `params`, which the earlier
   `!isObj(c.params)` guard rejects, so extra keys on `Browser.getVersion`/`Page.enable`/
   `Runtime.enable`/`Page.getLayoutMetrics` are untested; `Page.getLayoutMetrics` with `{"x":1}`
   is untested separately. Cases `allowlist-empty-extra-param` and
   `allowlist-layoutmetrics-extra-param` kill mutants 4 and 33.
4. **`once()` for `Browser.getVersion` and `Emulation.setDeviceMetricsOverride`.** Only
   `Page.navigate` has a duplicate case (`allowlist-navigate-twice`). Two duplicate-send cases
   kill mutants 6–7.
5. **Leg error message identity.** Cases set `cdpError` null (error legs) or a generic string
   (non-error legs); none swaps one declared message for another. `pen-error-other-message`
   kills mutant 8.
6. **`server-log-binding` with more than one served row.** The receipt has exactly one served `/`
   row, so `every` and `some` agree; `server-log-mixed-runs` kills mutant 9.
7. **`seq` of the first event.** No case touches `events[0].seq`; `seq-first-off` kills mutant 10.
8. **Replay identifier loops only see the last `--prior`.** All identifier-sharing battery cases
   append the colliding prior last, so `slice(0,1)` is killed but `slice(-1)` is not. A case with
   the colliding prior first and a non-colliding prior appended after abolishes mutant 15 (and
   makes the `every` requirement explicit).
9. **Launch-token shape is tested only at 1 char.** A 12-or-more-hex token passes mutant 17;
   `replay-launch-token-13hex` kills it.
10. **DevTools browser-id shape is tested only at a valid 36-hex uuid.** A shortened id
    (`abc123`) passes mutant 14; `devtools-id-short` kills it.
11. **Timeline JSON includes only `[ts,at]`.** Frozen `M-replay-timeline-at-only` covers `[at]`,
    but adding fields (`type`) is not covered; a prior with the same `ts`/`at` and different
    `type` passes mutant 13. `replay-timeline-type` kills it.
12. **Leg-mark floors.** Only fabricated names, early `closedAt` and negative `lateAfterClose` are
    tested; `m.at > 0` and monotonicity are not (r72 finding, still open). `leg-marks-nonmonotonic`
    and `leg-marks-at-zero` kill mutants 5 and 18.
13. **Run-window floor in (5000,8000).** `run-window-short` is a 5000 ms run, so it kills floors
    at or below 5000 (mutant 22's 800 included); a floor of 7900 would survive. A 7900 ms case
    would pin it (not generated here; noted for completeness).
14. **Host Chromium version precision.** `host-chromium` swaps the browser family (Firefox), so a
    same-family malformed version (`Chromium 155`) passes mutant 23; `host-chromium-short-version`
    kills it.
15. **DevTools port type coercion.** The only port case increments the numeric port; a string port
    passes mutant 25; `devtools-port-string` kills it.
16. **Touch sequence identity, not just length.** `touch-seq-length-only` survives because no case
    substitutes a same-length non-move type (`touchend`→`touchcancel`); that case kills mutant 29.
17. **Teardown post-kill curl values.** Cases mutate `survivors` and `postKillSweepCount`; the
    `postKillCurl.fixture/devtools === 7` clauses are never exercised with another value;
    `teardown-curl-fixture-6` kills mutant 30.
18. **Fixture origin's port.** No case drops the port from `fixture.origin` and the navigate url;
    `origin-without-port` kills mutant 34.

`r73-replay-token-priors-first-only` is killed (mutant 16), `r73-replay-token-priors-last-only`
survives; together they show the battery's prior ordering is load-bearing. Mutants 19–22, 24,
26–28, 31–32, 35–38 are killed, which confirms the battery does pin: `closedAt` floor, mark-name
identity, `lateAfterClose` sign, run-window floor, stderr binding, the scale chain, the exact mark
boundary (must-accept), wheel `deltaMode` value, pinch count, strict producer predicate, schema
identity, leg order, `elapsedMs` type, and the wheel-law tolerance. Mutant 27 is the useful
inverse: a *stricter* counter is caught by the must-accept class.

## 7. Bounds, restoration and cleanup

- **No production/lane/fleet/sibling write.** `git -C tabi-shokunin status --porcelain --`
  `scripts/check-synthpinch-r73.mjs scripts/negatives-synthpinch-r73.mjs`
  `scripts/chrome-cdp-synthpinch-round73.mjs`
  `corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json` printed nothing, exit 0.
  Production hashes after all runs equal §2.1.
- **Scratch copies unchanged.** `s/check-synthpinch-r73.mjs` = `3104101a…`,
  `s/negatives-synthpinch-r73.mjs` = `0a738780…` after the whole run; mutants were produced from
  memory into separate directories, never by editing the shared copy.
- **Receipts copied before scratch deletion**: `receipts/` (46 files: baseline full/compact,
  manifest with every edit + mutated-counter sha256 + line, 38 per-mutant records, aggregate
  results, 23 probes, the two drivers). Hashes can be recomputed from the files.
- **Scratch deleted**: `/fast/scratch/hyaku/tabi-r73/R73Mut1` (46 MB) removed before this seat
  yields. Probe receipts/priors were regenerated by `receipts/probe-survivors.mjs`; they are not
  retained.
- **No host sysctl/service change; no browser launched; no port bound.** The battery and probes
  are receipt-only; their `--work` directories were under my scratch and are gone.
- **No tool installed or upgraded** (nothing to record).

Commands and exits:

| command | exit |
|---|---|
| `sha256sum` of driver, counter, battery, receipt (read-only) | 0 |
| `DRY=1 node run-mutants.mjs` (uniqueness gate, 38 edits) | 0 |
| `JOBS=10 node run-mutants.mjs` (38 batteries; wall 436 s) | 0 |
| baseline battery over 225 cases | 0 (`allOk true`) |
| `node probe-survivors.mjs` (23 probes; 21 witnesses + 2 co-fire) | 0 |
| frozen-pair duplicate check against the 19 SEMANTIC entries | 0 (0 duplicates) |
| `git -C tabi-shokunin status --porcelain -- <four instrument paths>` | 0 (empty) |
| `sha256sum` of the two scratch copies after all runs | 0 (unchanged) |

I do not propose amending the frozen predicate, counter, pins, or kill rule. This report is a
coverage measurement of the battery against the frozen counter generation; the decision about any
next-generation case list belongs to the L1.
