HOLDS

Reviewer: R73Review2 (leaf, no delegation). Scope: frozen `scripts/negatives-synthpinch-r73.mjs` + `.ufo/waves/round-73/controls/c1/kill-power-r73.mjs` — QUALITY 135 re-run, isolation, kill power. No tool installs this session (node v24.21.0 preexisting; `node --version` exit 0). Scratch `/fast/scratch/hyaku/tabi-r73/R73Review2` deleted before yield; receipts kept beside this report.

## 0. Frozen bytes verified

`sha256sum` on all four scripts, exit 0:
- `scripts/negatives-synthpinch-r73.mjs` = `0a738780090a8483eda8290f513b7d88ba41dd221120b14950dd6649609b88af` = freeze.txt line 5.
- `.ufo/waves/round-73/controls/c1/kill-power-r73.mjs` = `5e4a8255f84b61a75da6643fba1ca4f8a4a64b52d1c02280cea2f92b0ee0a8fe` = freeze.txt line 6.
- `scripts/check-synthpinch-r73.mjs` = `3104101a…d4d1`, `scripts/chrome-cdp-synthpinch-round73.mjs` = `3f0ffe24…59c4` (target-stated values).

## 1. QUALITY 135 — battery re-run on 3 of 9 PRE smokes

Chose smoke2 (the receipt whose pf output was lost in the QUALITY 137 red state), smoke3 and smoke6 (the two r72 red-state anchor receipts). Replicated `prefreeze-eval.sh:24` exactly:

```
node scripts/negatives-synthpinch-r73.mjs --real .ufo/waves/round-73/controls/c1/smoke<n>.receipt.json \
  --expect-driver-sha256 3f0ffe24…59c4 --expect-nonce $(cut -d' ' -f1 .ufo/.../smoke<n>.args.txt) \
  --prior <8 other smokes> --prior <3 degenerate receipts> \
  --laundered degenerate-dispatch-wheel.receipt.json --laundered degenerate-set-scale.receipt.json --laundered degenerate-skip-touch.receipt.json \
  --work <scratch>/bat-s<n> --json
```

Result (driver: eval cell, Promise.all): all three exit 0, `allOk: true`, `228/228`, and the emitted JSON is **byte-identical** to the committed `pf-smoke{2,3,6}.battery.json` (`byteIdenticalVsCommitted: true` for all three). Receipts: `rerun-smoke{2,3,6}.battery.json` beside this report. This also confirms the committed pf outputs were produced by these exact frozen bytes.

Absolute-vs-relative audit (question: "is every refusal case's mutation absolute or shown to cross its tolerance on every PRE receipt?"):
- Absolute (overwrite to a fixed value outside the law regardless of honest jitter): anchor family `wheel-anchor` x=405 (negatives:168), `in-wheel-anchor-abs-402` (169), `in-wheel-anchor-abs-398` (170), `default-wheel-anchor-abs-y302` (171) — all outside the counter's ±1 anchor (`check-synthpinch-r73.mjs:240`); `wheel-anchor-clamp-exact` +1 vs the exact-equality clause (172 vs counter:241); seq/shape/type rewrites; `run-window` 5 s/700 s vs [8 s, 600 s); `leg-params-zero-short` 100 ms vs 4000 ms; `driver-pin` all-zeros; scale `+0.5` vs ±0.01.
- Relative (shift fixed by construction but crossing depends on the honest value): `clamp-delta-off-0.8` / `out-delta-off-0.8` / `default-delta-off-0.8` (negatives:190,192,193 — fixed 0.8 sum shift vs the ±0.5 law tolerance, counter:244-246), `slow-ratio` +3000 ms (touch-span relative), must-accept edges `accept-clamp-delta-edge-0.4` (250) and `accept-zero-scale-edge` (253). For these, the every-PRE-receipt claim is empirical: an independent assertion sweep over all 9 committed `pf-smoke{1..9}.battery.json` (node -e, exit 0) recomputed each case's verdict from raw `findingIds`: **219/219 refuse+laundered case-names fire their expected id on 9/9 receipts, 0 cases where expect is absent, 0 undeclared co-fires, 0 ok-flag inconsistencies, all 9 must-accepts clean** (`violations: []`). My 3 reruns re-demonstrate it on 3 more runs of the same receipts. QUALITY 135's "must cross the counter's tolerance on every repetition receipt" holds for the PRE set, and leg (c) (`scored/c1-negatives-a.json`, 228/228) extends it to the scored receipt.

## 2. Isolation

**Can a refusal case pass with its expected id absent? No — mechanically impossible.** The verdict is `ok = o.exit === 1 && ids.includes(c.expect) && extra.length === 0` with `extra = ids \ {expect} ∪ alsoAllowed` (negatives:285-286). `alsoAllowed` only tolerates co-firing ids; it can never substitute for the expect. A counter crash (exit 2), unparseable stdout (`findingIds: null`), or exit 0 all fail the case — fail-closed. Empirically 0 violations across 9 receipts × 228 cases (sweep above, including the 3 laundered cases whose `alsoAllowed: ['*']` still require the expected id in `findingIds`, negatives:296).

**alsoAllowed audit**: widest sets are the two `priorReal` replay cases (all three replay ids allowed — justified: a byte-identical or nonce-and-stamps-rewritten replay shares all three per-run identifiers by construction, negatives:180-184) and `leg-order` (8 cascading leg laws allowed). No allowed set contains an id that could replace the expect, and mechanically none can. The per-identifier attribution the family cases lack is supplied by the three `-only-shared` cases: my smoke3 rerun shows `replay-token-only-shared` → `findingIds: ['replay-launch-token']`, `replay-url-only-shared` → `['replay-devtools-url']`, `replay-timeline-only-shared` → `['replay-event-timeline']`, each `isolated: true`, `alsoAllowed: []`. So yes — **the replay cases are each isolated** (family cases by declared co-fire, attribution by the single-identifier trio). `nonce-expected` (negatives:179) is isolated (`['nonce-expected']`); note it mutates nothing and exercises the CLI-arg→check wiring (`r.nonce === expectNonce`, counter:133) — correct for its kill role (M-nonce-expected-dropped).

**Does any must-accept case accept a dishonest receipt? No.** Every must-accept runs the full 98-check counter and passes only with exit 0 and zero findings (negatives:284), so no other forged aspect could ride along. Each pins a declared law edge, none a forgery surface: key order (canon-sorted comparisons), `lateAfterClose = 0`, equal-consecutive-spans/ratio-exactly-2.0 touch geometry inside the `>=` laws, +0.4 inside the ±0.5 law tolerance, anchor x=401 inside ±1, a prior with all three identifiers different, +0.009 scale inside ±0.01, event `at` == leg mark inside the closed window, and one extra `Page.getLayoutMetrics {}` inside the closed allow-list. Observation (info, not a defect): the counter's EMPTY-set methods (`Page.enable`, `Browser.getVersion`, `Runtime.enable`, `Page.getLayoutMetrics`, counter EMPTY set at :192) are accepted unlimited times — `once()` covers only setDeviceMetricsOverride/Page.navigate/Browser.getVersion (:196) — a forger may append repetitions of benign read-only calls; declared allow-list edge.

Diagnostic note: per-receipt isolation counts differ (smoke1 committed 172/88 vs smoke3 170/87 — my rerun is byte-identical to the committed smoke3 file, so both numbers are genuine); `isolated` is a metric, not part of `ok`. 10 of 98 ids have no isolated case (`nonce-shape`, `leg-order`, `event-leg-domain`, `leg-marks`, `pinch-call-count`, `leg-start-trusted`, `leg-unit-trusted`, `leg-unit-scale`, `leg-pen-trusted`, `leg-outside-trusted`) — coverage intact (all fired 9/9); the gaps are structurally unavoidable insert/cascade co-fires (e.g. an inserted untrusted event into the event-less `start` leg necessarily fires `leg-start-seq` too).

## 3. Kill power

**Are the 19 semantic mutants meaningful edits? Yes.** Each is a single-occurrence operator/polarity/tolerance/conjunct-drop edit at an exact counter source string, with a hard guard: occurrence count ≠ 1 → exit 2 (kill-power:55-58), so a mutant can never silently be the unmutated counter; the force-true class is exactly one per `--list-checks` id (98). My independent rebuild of 8 of them (7 new r73 + M5) each hit exactly once.

**Does each new r73 mutant die for the reason intended? Yes — verified twice.** (i) committed `scored/c1-kill-power-a.json`: `holds: true`, survivors `[]`, per-mutant `failedCases`; (ii) my reproduction: rebuilt each mutant counter, copied the frozen battery beside it, ran the battery on smoke3 (exit codes captured) — killer cases identical to the committed record:

| mutant (kill-power line) | killer case(s) (my smoke3 repro = committed) | reason intended |
|---|---|---|
| M-nonce-expected-dropped (:46) | `nonce-expected` | expected-nonce wiring is load-bearing |
| M-replay-token-every-to-some (:47) | `replay-byte-identical`, `replay-nonce-stamps-rewritten`, `replay-token-only-shared` | `some` lets one shared token through |
| M-replay-token-shape-dropped (:48) | `replay-launch-token-shape` | 12-hex shape test |
| M-replay-url-dropped (:49) | `replay-url-only-shared` | browser-id distinctness |
| M-replay-timeline-every-to-some (:50) | `replay-timeline-only-shared` | timeline distinctness |
| M-replay-timeline-at-only (:51) | `replay-token-only-shared` + `replay-url-only-shared` (undeclared co-fire of `replay-event-timeline` on ts-shifted priors) + must-accept `accept-prior-all-identifiers-differ` (legitimate prior refused) | the ts component of the timeline hash is load-bearing |
| M-anchor-tolerance-2 (:52) | `in-wheel-anchor-abs-402` + `in-wheel-anchor-abs-398` | exactly the r73 absolute-anchor cases; r72's relative +2 case could not have killed this mutant (401 is inside both ±1 and ±2); must-accept `accept-in-anchor-abs-401` correctly still passes under the mutant |
| M5 spot-check (:34) | 9 producer-verdict cases (`false-REFUTED` correctly still refuses under OR) | the r62 survivor polarity |

All 8: `batteryExit: 1` in my repro (`mutant-repro.json` beside this report). Pre-freeze legs: `pf-smoke{1..9}.killpower.exit` all 0; `pf-smoke3.killpower.json` = unmutatedExit 0, forceTrue 98/98, semantic 19/19, survivors [], holds true; `prefreeze-summary.json` allOk 9/9.

## Findings (none blocking; severity-ordered)

1. **INFO — residual calibration sensitivity of two must-accept edges.** `accept-clamp-delta-edge-0.4` (negatives:250) and `accept-zero-scale-edge` (:253) sit at the tolerance edge; a future honest receipt whose clamp-law sum is ≥ 0.3 off-center (or zero-leg scaleAfter ≥ 0.001 above want) would red the battery as a false refusal of an honest receipt. Held on all 9 PRE receipts + scored; inherent to pinning a measured tolerance, fails safe (red → investigation, never silent acceptance).
2. **INFO — EMPTY-set CDP calls accepted unlimited times** (counter:192,196): repetitions of benign read-only calls are not refused. Declared allow-list edge, no capability signal.
3. **INFO — 10/98 ids without an isolated case** (listed §2): coverage and kill power intact; co-fires structurally unavoidable.

## Residual risk & verification gaps

- My QUALITY 135 rerun covers 3 of 9 PRE receipts directly; the other 6 rely on the committed pf files — mitigated by the independent assertion sweep over all 9 and the byte-identical replication of 3.
- I did not re-run the full 118-mutant kill-power matrix myself; I verified the harness logic by reading (kill-power:31-88), rebuilt and killed 8/19 semantic mutants independently, and cross-checked all 19 against the committed per-mutant `failedCases`. The 98 force-true mutants were verified structurally (one per declared id) and via committed counts only.
- `pf-smoke*.battery.json` predate the freeze; the freeze digests of battery/kill-power/counter match today's files, and my reruns reproduce the pf bytes exactly, so the pre-freeze evidence is bound to the frozen generation.
