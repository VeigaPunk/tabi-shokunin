FINDINGS

# R72Mut1 — semantic mutants of `check-synthpinch-r72.mjs` (tabi round 72, C1 coverage)

Seat: mutation tester (leaf, no delegation). Lane `tabi-shokunin`, wave w1, round 72.
I did not touch the frozen claim, the claim file, the kill-power control, `scripts/`, `corpus/`,
or any sibling directory. All work happened in a scratch copy and the artifacts below.

## 1. Headline

- **54 single-edit semantic mutants** of the r72 counter were generated; **none is a force-true
  mutant** and **none duplicates the 12 frozen semantic mutants** in
  `.ufo/waves/round-72/controls/c1/kill-power-r72.mjs:29-42`.
- **41 killed / 13 survived**, using the seat's augmented rule: *killed only if the mutant adds at
  least one failed battery case beyond the baseline failure set* (baseline already fails
  `in-wheel-anchor-2px` on this receipt).
- **3 of the 41 kills are not targeted kills**: `wheel-sign-flip`, `law-constant-50`, `law-log10`
  make the counter reject the clean scored receipt (`positiveOk=false`), so every refusal case
  fails at once. They satisfy the literal kill rule but prove nothing about the battery; see §6.
- **All 13 survivors were demonstrated**: for each I built a receipt mutation that the **pristine**
  counter refuses for a named check and the **mutant** accepts (13/13 distinguishing, §5).
  `receipts/survivor-probes.json`.
- The frozen leg (c) honest stop stands: the baseline failure is `in-wheel-anchor-2px`, and its
  cause is receipt geometry, not a counter defect (measured in §3). I do not propose amending the
  frozen predicate, counter, pins, or kill rule.

## 2. Provenance and method

Inputs (read-only, hashes taken before and after the probe):

```
$ sha256sum tabi-shokunin/scripts/check-synthpinch-r72.mjs \
            tabi-shokunin/scripts/negatives-synthpinch-r72.mjs \
            tabi-shokunin/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json
142062ef166f4436b015fd93d08d80d9ec7a4f0a3f3d1a0d0bcfebc64d593e4b  scripts/check-synthpinch-r72.mjs
414e04a6fb8459ece7f22b633bf4c0d4caad65bede0a9c9bf0b035e6a5825602  scripts/negatives-synthpinch-r72.mjs
ac2245cfe23696b1d6c8904b40f6e780bf41b95e6232509490a2613e619260b9  corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json
```

- Counter sha256 matches the seat spec (`142062ef…`); the receipt's `driverSha256` equals the
  pinned driver `d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877`.
- Scratch: `/fast/scratch/hyaku/tabi-r72/R72Mut1/s/{check-synthpinch-r72.mjs,negatives-synthpinch-r72.mjs}`
  are byte copies of the two production files (same hashes, verified before and after all runs).
- Every mutant = one contiguous source-string replacement applied in memory to the pristine copy,
  written to its own scratch dir `mNN-<id>/` / `eNN-<id>/` with an **unmutated** battery copy
  beside it. The runner refuses to proceed (exit 2) unless each edit string occurs **exactly once**
  and actually changes the bytes; no such refusal occurred. Each result row records `fromCount: 1`,
  the mutated counter sha256, and the 1-based counter line of the edit.
- Battery invocation per mutant (port-free, no Chromium involved):
  `node <dir>/negatives-synthpinch-r72.mjs --real <receipt> --expect-driver-sha256 d007… --work <dir>/work --json`.
  The battery runs the counter **beside it** (`negatives-synthpinch-r72.mjs:23-26`).
- **215 of 218 cases exercised**: I passed no `--laundered` degenerate receipts, so the 3
  `laundered-*` cases were not run. Baseline is therefore 214/215.

Commands and exits:

| step | command | exit |
|---|---|---|
| baseline (unmutated copies) | `node s/negatives-synthpinch-r72.mjs --real <receipt> --expect-driver-sha256 <pin> --work "$S/base/work" --json` | 1 |
| batch 1, 43 mutants | `JOBS=8 node run-mutants.mjs` | 0 |
| batch 2, 11 mutants | `JOBS=8 node run-extra.mjs` | 0 |
| survivor probes, 13 | `node probe-survivors.mjs` | 0 |

Environment: node v24.21.0, Arch x86_64 (32 cores). No tools installed or upgraded.

## 3. Baseline (unmutated) on the scored receipt

`receipts/baseline-unmutated-battery.json` (`base/baseline.json`, sha256 `b8a6997e…`):

```
cases 215 (refuse 207, must-accept 8, laundered 0), passed 214, allOk false,
failed ["in-wheel-anchor-2px"], checkIds 94, positiveOk true
```

The failing case is a counter-accept, not a crash: `in-wheel-anchor-2px` exits 0 with
`findingIds: []`. Cause, measured directly from the receipt:

```
$ node -e 'const r=require(".../receipt.json"); console.log(r.events.filter(e=>e.leg==="in"&&e.type==="wheel").map(e=>e.clientX))'
[ 399, 399, 400, 399, 399, 400, 399, 400, 400, 400, 400, 399, 399, 400, 400, 400, 400 ]
```

The battery case adds +2 to the **first** `in` wheel, whose `clientX` is **399** → 401;
`Math.abs(401 − 400) = 1` is inside the counter's ±1 tolerance (`check-synthpinch-r72.mjs:204`),
so the pristine counter correctly accepts it. That is the frozen leg (c) stop; it is not a counter
bug. It also masks the one battery case that would otherwise kill the `±1 → ±2` mutant (§5.4).

## 4. Mutant inventory (54)

Verdict rule: `batteryExit` 1 alone is not a kill; killed = at least one failed case not in the
baseline set `{in-wheel-anchor-2px}`. Full per-case failure lists are in
`receipts/mutants-batch1-results.json` and `receipts/mutants-batch2-results.json`.
"line" is the 1-based counter line of the edit; every edit string occurs exactly once.

Batch 1 (`run-mutants.mjs`, 43 mutants):

| mutant | line | exit | positiveOk | added failed cases (beyond baseline) | verdict |
|---|---|---|---|---|---|
| `in-span-upper-100000` | 53 | 1 | true | `in-timing` | KILLED |
| `in-span-lower-1` | 53 | 1 | true | — | **SURVIVED** |
| `out-span-upper-100000` | 54 | 1 | true | `out-timing` | KILLED |
| `default-span-upper-100000` | 57 | 1 | true | `default-timing` | KILLED |
| `wheel-sign-flip` | 171 | 1 | false | `schema` (+213) | KILLED† |
| `law-constant-50` | 209 | 1 | false | `schema` (+201) | KILLED† |
| `law-log10` | 209 | 1 | false | `schema` (+201) | KILLED† |
| `wheels-drop-ctrlkey` | 186 | 1 | true | `in-wheels-ctrl` (+4) | KILLED |
| `wheels-drop-deltamode` | 186 | 1 | true | `in-wheel-delta-mode` (+4) | KILLED |
| `touch-ratio-strict-gt` | 218 | 1 | true | `accept-equal-touch-spans-ratio-2` | KILLED |
| `leg-order-sorted` | 120 | 1 | true | `leg-order` | KILLED |
| `pinch-params-first-only` | 145 | 1 | true | — | **SURVIVED** |
| `send-id-sequence-dropped` | 160 | 1 | true | `allowlist-id-gap` | KILLED |
| `closedat-below-last-mark` | 136 | 1 | true | `leg-marks-closed-early` | KILLED |
| `event-types-drop-istrusted` | 128 | 1 | true | `event-types-trusted-string` | KILLED |
| `run-window-floor-0` | 118 | 1 | true | `run-window-short` | KILLED |
| `run-window-ceiling-10x` | 118 | 1 | true | `run-window-long` | KILLED |
| `schema-prefix` | 105 | 1 | true | `schema` | KILLED |
| `nonce-shape-case-insensitive` | 106 | 1 | true | `nonce-shape` | KILLED |
| `seq-monotonic-numeric-only` | 124 | 1 | true | `seq-monotonic`, `seq-duplicate-event` | KILLED |
| `event-window-lower-dropped` | 139 | 1 | true | `event-leg-window-relabel-fitted` | KILLED |
| `event-window-order-dropped` | 139 | 1 | true | `event-leg-window-order` | KILLED |
| `wheels-count-at-least` | 185 | 1 | true | `start-wheels-extra` (+5) | KILLED |
| `touch-grows-dropped` | 217 | 1 | true | `touch-geometry-shrink` | KILLED |
| `mixed-sign-as-in` | 171 | 1 | true | `in-wheels-sign`, `default-wheels-sign` | KILLED |
| `scale-chain-dropped` | 199 | 1 | true | `scale-agreement-chain` | KILLED |
| `wheel-anchor-clamp-exact-dropped` | 205 | 1 | true | `wheel-anchor-clamp-exact` | KILLED |
| `wheel-anchor-tolerance-2` | 204 | 1 | true | — | **SURVIVED** |
| `allowlist-exprs-open` | 154 | 1 | true | `lookalike-script-wheel` (+5) | KILLED |
| `allowlist-empty-params-open` | 152 | 1 | true | — | **SURVIVED** |
| `navigate-url-prefix-only` | 156 | 1 | true | `allowlist-navigate-other-run` | KILLED |
| `teardown-survivors-dropped` | 226 | 1 | true | `teardown-closure` | KILLED |
| `late-close-nonnegative-dropped` | 136 | 1 | true | `leg-marks-late-negative` | KILLED |
| `touch-pointer-type-dropped` | 181 | 1 | true | `touch-pointer-type-pen` | KILLED |
| `law-tolerance-5` | 209 | 1 | true | `clamp-delta-off-0.8` (+3) | KILLED |
| `slow-ratio-lower-2` | 222 | 1 | true | `slow-ratio-low-2x` | KILLED |
| `host-chromium-any-browser` | 113 | 1 | true | `host-chromium` | KILLED |
| `devtools-stderr-dropped` | 116 | 1 | true | `devtools-stderr-absent` | KILLED |
| `event-types-ts-positive-dropped` | 127 | 1 | true | `event-types-ts-negative-shift` | KILLED |
| `leg-marks-monotonic-dropped` | 135 | 1 | true | — | **SURVIVED** |
| `browser-getversion-once-dropped` | 160 | 1 | true | — | **SURVIVED** |
| `dmo-once-dropped` | 160 | 1 | true | — | **SURVIVED** |
| `leg-error-message-loose` | 193 | 1 | true | — | **SURVIVED** |

† killed only because the mutant rejects the clean receipt (`positiveOk=false`); the added failures
are the whole suite, not a targeted negative. Counted per the literal rule, not as coverage.

Batch 2 (`run-extra.mjs`, 11 mutants):

| mutant | line | exit | positiveOk | added failed cases | verdict |
|---|---|---|---|---|---|
| `zero-span-upper-100000` | 62 | 1 | true | — | **SURVIVED** |
| `server-log-binding-some` | 110 | 1 | true | — | **SURVIVED** |
| `seq-first-free` | 124 | 1 | true | — | **SURVIVED** |
| `event-leg-domain-string` | 125 | 1 | true | `event-leg-domain`, `event-leg-fabricated-label` | KILLED |
| `pinch-call-count-at-least` | 144 | 1 | true | `pinch-call-duplicate` | KILLED |
| `marks-name-sequence-dropped` | 135 | 1 | true | `leg-marks-fabricated-name` | KILLED |
| `allowlist-eval-extra-keys` | 154 | 1 | true | `allowlist-eval-extra-param` | KILLED |
| `allowlist-dmo-extra-keys` | 155 | 1 | true | `allowlist-dmo-scale-param` | KILLED |
| `nonce-page-prefix` | 107 | 1 | true | `nonce-shape`, `nonce-on-page` | KILLED |
| `event-types-deltamode-dropped` | 129 | 1 | true | — | **SURVIVED** |
| `initial-scale-cdp-dropped` | 197 | 1 | true | — | **SURVIVED** |

## 5. Survivors: exact edit, why the battery misses it, and the case that would kill it

All probes below were run on a **laundered** receipt clone (legShape and
`slowToTouchSpanRatio` recomputed by the pristine counter, exactly like the battery's
`launderInto`), with `--expect-driver-sha256 d007…`. For each: pristine counter run →
`pristineFindings`; mutant counter run on the same file → `mutantFindings`.
`receipts/survivor-probes.json` shows `distinguishes: true` for all 13.

### 5.1 `in-span-lower-1` (line 53)
```
from: in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450], tm: null, error: null },
to:   in: { seq: [], wheels: [5, 'in'], scale: 2, span: [1, 450], tm: null, error: null },
```
Battery coverage: `in-timing` (+1000 ms) and `in-timing-short` (compresses all in-wheel `ts` to
`t0 + k*0.001`, span ≈ 0.016 ms) exercise only the far edges. A span of 100 ms passes the mutant
and is refused by the pristine counter.
Would-kill case (`in-timing-span-100`): for `in` wheels, `e.ts = t0 + k*100/(n-1)`.
Probe: pristine `["leg-in-timing"]` (isolated), mutant `[]` (exit 0).

### 5.2 `zero-span-upper-100000` (line 62)
```
from: zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 6000], tm: null, error: 'no-response-4000ms' },
to:   zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 100000], tm: null, error: 'no-response-4000ms' },
```
Battery coverage: `zero-timing` compresses the span to 100 ms (below the lower bound), so the
6000 ms ceiling is never approached. The receipt's zero span is 4675.7 ms.
Would-kill case (`zero-timing-long`): stretch zero wheels to a 7000 ms span.
Probe: pristine `["leg-zero-timing"]` (isolated), mutant `[]` (exit 0).

### 5.3 `pinch-params-first-only` (line 145)
```
from: canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params))
to:   canon(pinches.slice(0, 1).map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params).slice(0, 1))
```
Battery coverage: the only param-mutating case edits `pinches[0].params.relativeSpeed`
(`pinch-call-params`), i.e. exactly the one call the mutant still pins. Calls 2-10 are unpinned;
`send-log-allowlist` returns true for any `Input.synthesizePinchGesture` params
(`check-synthpinch-r72.mjs:151`).
Would-kill case (`pinch-call-params-nonfirst`): `r.cdpSendLog[<6th pinch>].params.scaleFactor = 2.5`.
Probe: pristine `["pinch-call-params"]` (isolated), mutant `[]` (exit 0).

### 5.4 `wheel-anchor-tolerance-2` (line 204)
```
from: Math.abs(e.clientX - AT.x) <= 1 && Math.abs(e.clientY - AT.y) <= 1
to:   Math.abs(e.clientX - AT.x) <= 2 && Math.abs(e.clientY - AT.y) <= 2
```
Battery coverage: `in-wheel-anchor-2px` is the intended discriminator, but on this receipt the
first `in` wheel is at `clientX = 399`, so +2 → 401 is within ±1 of 400 and the pristine counter
accepts — this is exactly the baseline failure. A case that adds +2 to a wheel whose `clientX` is
400, or adds +2.5 anywhere, does distinguish.
Would-kill case (`in-wheel-anchor-2_5px`): first `in` wheel `clientX += 2.5` → 401.5.
Probe: pristine `["wheel-anchor"]` (isolated), mutant `[]` (exit 0).

### 5.5 `allowlist-empty-params-open` (line 152)
```
from: if (EMPTY.has(c.method)) return canon(c.params) === '{}';
to:   if (EMPTY.has(c.method)) return true;
```
Battery coverage: `allowlist-params-absent` deletes `params`, which the earlier
`!isObj(c.params) → return false` guard already rejects, so the exact-`{}` branch is never tested
with extra keys. `allowlist-dmo-scale-param` / `allowlist-eval-extra-param` target non-EMPTY methods.
Would-kill case (`allowlist-empty-extra-param`): append `Page.enable` with `{ "extra": 1 }`.
Probe: pristine `["send-log-allowlist"]` (isolated), mutant `[]` (exit 0).

### 5.6 `leg-marks-monotonic-dropped` (line 135)
```
from: (i === 0 || m.at >= marks[i - 1].at)
to:   (i === 0 || true)
```
Battery coverage: `leg-marks-fabricated-name` changes a name; `leg-marks-closed-early` changes
`closedAt`; `leg-marks-late-negative` changes `lateAfterClose`. No case makes mark times decrease.
Would-kill case (`leg-marks-nonmonotonic`): `r.legMarks[3].at = r.legMarks[2].at - 1`.
Probe: pristine `["leg-marks","event-leg-window"]` (isolated with `alsoAllowed ["event-leg-window"]`),
mutant `["event-leg-window"]` — the target id is gone.

### 5.7 `browser-getversion-once-dropped` (line 160)
```
from: " && once('Browser.getVersion')"
to:   ""            (deleted)
```
Battery coverage: no look-alike case duplicates `Browser.getVersion`.
Would-kill case (`allowlist-browser-version-twice`): push `{ method: 'Browser.getVersion', params: {} }`.
Probe: pristine `["send-log-allowlist"]` (isolated), mutant `[]` (exit 0).

### 5.8 `dmo-once-dropped` (line 160)
```
from: " && once('Emulation.setDeviceMetricsOverride')"
to:   ""            (deleted)
```
Battery coverage: no case duplicates an exact DMO send (`allowlist-dmo-scale-param` adds a key,
which the params equality still rejects).
Would-kill case (`allowlist-dmo-twice`): push a second exact
`{width:1280,height:900,deviceScaleFactor:1,mobile:false}` DMO send.
Probe: pristine `["send-log-allowlist"]` (isolated), mutant `[]` (exit 0).

### 5.9 `leg-error-message-loose` (line 193)
```
from: leg.cdpError.includes(want.error)
to:   typeof leg.cdpError === 'string'
```
Battery coverage: `<leg>-error` cases replace the error with `null` (error legs) or with a string
(error-null legs); none swaps a declared message for another string.
Would-kill case (`pen-error-other-message`): pen `cdpError = '{"code":-32602,"message":"Other failure"}'`.
Probe: pristine `["leg-pen-error"]` (isolated), mutant `[]` (exit 0).

### 5.10 `server-log-binding-some` (line 110)
```
from: served.length >= 1 && served.every((s) => s.run === r.nonce)
to:   served.length >= 1 && served.some((s) => s.run === r.nonce)
```
Battery coverage: the receipt has exactly **one** served `/` row (`serverLog` has 2 rows: `/` 200
and `/favicon.ico` 404), and `server-log-binding` rewrites every row to another run, so
`every` and `some` agree. Distinguishing requires two served rows with mixed runs.
Would-kill case (`server-log-mixed-runs`): set the served `/` row's `run` to `tabi-r72-other`,
then append a second served `/` row carrying the real nonce.
Probe: pristine `["server-log-binding"]` (isolated), mutant `[]` (exit 0).

### 5.11 `seq-first-free` (line 124)
```
from: events.every((e, i) => isObj(e) && e.seq === i + 1)
to:   events.every((e, i) => isObj(e) && (i === 0 || e.seq === i + 1))
```
Battery coverage: `seq-monotonic` edits `events[3].seq`; `seq-duplicate-event` duplicates an
interior event. No case touches `events[0].seq`.
Would-kill case (`seq-first-off`): `r.events[0].seq = 42`.
Probe: pristine `["seq-monotonic"]` (isolated), mutant `[]` (exit 0).

### 5.12 `event-types-deltamode-dropped` (line 129)
```
from: (e.type === 'wheel' ? num(e.deltaY) && num(e.deltaMode) && num(e.clientX) && num(e.clientY) : true)
to:   (e.type === 'wheel' ? num(e.deltaY) && num(e.clientX) && num(e.clientY) : true)
```
Battery coverage: `*-wheel-delta-mode` sets `deltaMode = 1` (a number, so `event-types` stays
clean and the per-leg wheels check fires); no case uses a string `deltaMode`.
Would-kill case (`event-types-deltaMode-string`): set the first `in` wheel `deltaMode = '0'`.
Probe: pristine `["event-types","leg-in-wheels"]` (isolated with `alsoAllowed ["leg-in-wheels"]`),
mutant `["leg-in-wheels"]` — `event-types` is gone.

### 5.13 `initial-scale-cdp-dropped` (line 197)
```
from: near(legs[0]?.scaleBefore?.page, 1) && near(legs[0]?.scaleBefore?.cdp, 1)
to:   near(legs[0]?.scaleBefore?.page, 1)
```
Battery coverage: `initial-scale-7` sets page **and** cdp to 7, so the page term still fires;
`scale-agreement-cdp` edits leg 3. No case sets a disagreeing pair at leg 0.
Would-kill case (`initial-scale-cdp-only-7`): `r.legs[0].scaleBefore.cdp = 7` (page stays 1).
Probe: pristine `["initial-scale","scale-agreement"]` (isolated with `alsoAllowed
["scale-agreement"]`), mutant `["scale-agreement"]` — `initial-scale` is gone.

## 6. Kill-power nuance (mutation-tester judgement)

- 38 of 41 kills are **targeted**: the mutant's added failure is the case that names the mutated
  law (e.g. `wheels-drop-ctrlkey` → 5 `*-wheels-ctrl` cases; `law-tolerance-5` → 4 delta cases).
- 3 kills (`wheel-sign-flip`, `law-constant-50`, `law-log10`) are **positive-broken**: the mutated
  counter no longer passes the scored receipt (`positiveOk: false`), so ~200 cases acquire an extra
  finding and the battery exits 1 for the wrong reason. The frozen kill rule (`battery exit 1`)
  would still count them; they carry no discriminating power for the negative suite. The r72
  counter's own positive gate is what catches them, and it does catch them.
- The 13 survivors are genuine coverage findings, not counter regressions: each is a weakening that
  the current battery cannot see on this receipt. I did not modify the counter or the battery.

## 7. Restoration, bounds and cleanup evidence

- No production/lane-root/fleet file was written. Production hashes after all runs:
  `check-synthpinch-r72.mjs 142062ef…` and `negatives-synthpinch-r72.mjs 414e04…` (unchanged);
  `git -C tabi-shokunin status --porcelain` for those paths printed nothing.
- Only read-only git was used (`rev-parse`, `status`); no git/jj mutation, commit or push.
- The pristine scratch copies `s/check-synthpinch-r72.mjs` and `s/negatives-synthpinch-r72.mjs`
  still hash `142062ef…` / `414e04…` after 54 mutant runs + 13 probes — mutants were produced from
  memory into separate dirs, never by editing the shared copy.
- Free-port binding was never needed (no browser was launched); all loopback work was the battery's
  receipt-only counter runs, `--work` under my scratch.
- Receipts copied to this directory before scratch deletion: `receipts/*.json` + the three
  reproducible runner scripts; sha256 of each is in the copy log below.
- Scratch `/fast/scratch/hyaku/tabi-r72/R72Mut1` (1.9 GB of per-case receipts) is deleted before
  this seat yields; the surviving evidence is the copied JSON receipts.

Copy log (sha256 in the wave dir):

```
b8a6997eaa10aa025d79a5498e68d40dd6459922fe2142110388a20e19ba3b1e  receipts/baseline-unmutated-battery.json
bdebe900d671697bd19950ac2ca6b846802d819cf2e17aec379b485876adc134  receipts/mutants-batch1-results.json
685ce05f4707f84f8f9d9ff4154022534caf92a316c8bbfb0f3638d55b1b9264  receipts/mutants-batch2-results.json
21c55055bc179f0ddf0929c9ec4dfd618b3de0034c7ba2fbac33ab1f93575beb  receipts/survivor-probes.json
7f33972ee83034b70e7d5f4d27a58045444a8777398f075cd7ea6f8fd4d518dc  receipts/run-mutants.mjs
be42ff5fefa0cfc046b63896fcb7ff39c0753f4b41922187307c9f91abbff3fc  receipts/run-extra.mjs
1e39c7182112136ce08bb202fd651cde8016e46306beb997adfdf8423597d70c  receipts/probe-survivors.mjs
```

Not claimed: whether C1's leg (c) should be resolved by regenerating the receipt, by adding the 13
cases above to the r73 battery, or by any other mechanism — that is the L1's call and the frozen
claim is not mine to amend.
