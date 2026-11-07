FINDINGS

# R75Review1 — review of `scripts/check-dragdrop-r75.mjs` at frozen bytes

Seat: R75Review1 (reviewer, leaf). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Counter reviewed: `scripts/check-dragdrop-r75.mjs`
sha256 `9b370790a97193ff662678b38b957b5cdaab06267092931ab1719bbed31c9270`
(`sha256sum scripts/check-dragdrop-r75.mjs`, exit 0) — equals the digest in
`.ufo/waves/round-75/freeze.txt:4` and the seat spec. No script was edited; every crafted
receipt lives under this seat's directory (`receipts/`, `out/`).

Counter command used for every row below (cwd = `scripts/` so the pinned driver sits beside the
counter; 16 PRE priors in `prior-set.txt` order):

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts
node check-dragdrop-r75.mjs --receipt <R> \
  --expect-driver-sha256 d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 \
  --expect-nonce tabi-r75-l1-57f28cf128e6 \
  --prior .ufo/waves/round-75/controls/c1/degenerate-native-mouse.receipt.json \
  --prior .../degenerate-no-intercept.receipt.json --prior .../degenerate-script-events.receipt.json \
  --prior .../probe/p1.receipt.json ... --prior .../smoke9.receipt.json --json
```

Baseline: the scored receipt `corpus/evidence/round75/chromium-drag-intercept/receipt.json`
(sha256 `6ecc2560…1761`) exits 0, `verdict clean`, `checkCount 146`, `findings []`,
`maxAbs 0`, `maxGap 0.25` (`out/…` baseline reproduced in `run.sh`). Exit codes for every crafted
row are in `out/EXITS.txt`; each row's full JSON is `out/<name>.json`.

## Findings (severity order)

### F1 — HIGH — the Chromium version is not pinned; the capability's "155.0.8059.84" claim is unverified
`check-dragdrop-r75.mjs:165` (`host-chromium`) only tests the *shape*
`/^Chromium \d+\.\d+\.\d+\.\d+/` and `/^HeadlessChrome\/|^Chrome\//`. No check compares
`host.chromium` to `155.0.8059.84`, and the pinned driver never asserts it either
(`scripts/chrome-cdp-dragdrop-round75.mjs:276-278` records `--version` output, no comparison;
`receipt.host.cdpProduct = ver.result.product` at :306, no comparison).

- Crafted: `receipts/host-version-154.json` (sha256 `9c776662…bb16`) — `host.chromium`
  `"Chromium 154.0.0.0 Arch Linux"`, `host.cdpProduct` `"HeadlessChrome/154.0.0.0"`.
- Command: above, `--receipt receipts/host-version-154.json`.
- Exit **0**, `verdict clean`, `checkCount 146`, `findings []` (`out/host-version-154.json`,
  `out/EXITS.txt`).
- Also exit 0: `receipts/host-version-old.json` (`"Chromium 1.0.0.0"` / `"Chrome/1.0"`).
- Declared limit? **No.** The limit names a rewritten *driver-pin field*, not the host block; it
  does not say the browser version may be anything.

### F2 — HIGH — "headless" is not enforced
Same check (`:165`) accepts `^Chrome/` (headful) as well as `^HeadlessChrome/`, and
`devtools-port-binding` (`:167-168`) reads only the `--remote-debugging-port=` entry from
`host.argv`; nothing requires `--headless=new`.

- Crafted: `receipts/headful-product.json` (sha256 `d7c13a29…fa5`) — `host.cdpProduct`
  `"Chrome/155.0.8059.84"`, `--headless=new` removed from `host.argv`.
- Exit **0**, clean, 146, `findings []` (`out/headful-product.json`).
- Declared limit? **No.**

### F3 — HIGH — the `-32602` refusal code is not checked; only the message substring is
Predicate C1(d) says "an unknown type is refused **-32602**". `ERR_BAD` is the message string
(`:67`, `:92`), and `leg-${name}-error` (`:269`) is
`typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error)`. No check reads the code;
`--list-checks` has no id containing `32602` or an error-code concept (146 ids, checked).

- Crafted: `receipts/cdpError-nocode.json` (sha256 `2d3481ce…83de`) — bad-type `cdpError`
  `"Unexpected event type 'dragLeave'"` (no code at all).
- Crafted: `receipts/cdpError-wrongcode.json` (sha256 `1e87b7e1…2b5`) — same message with
  `{"code":-32000,...}`.
- Both exit **0**, clean, 146, `findings []` (`out/cdpError-nocode.json`,
  `out/cdpError-wrongcode.json`).
- Declared limit? **No.**

### F4 — HIGH — the `|`-joined DataTransfer view collapses distinct `types` arrays
`dtView` (`:251`) is `[arr(e.types).join('+'), e.plain, e.custom, e.dropEffect, e.effectAllowed,
e.items].join('|')`. The six fields force five `|` separators, so `plain/custom/dropEffect/
effectAllowed` cannot absorb a `|`; but `types` is an array joined with `+`, so
`["text/plain","text/x-tabi"]` and `["text/plain+text/x-tabi"]` render the **same** string
`text/plain+text/x-tabi|tabi-drag|x1|none|copyMove|2`. Both `leg-*-dt` (`:267`) and
`legshape-consistency` (`:290`, via `derived.dt`) use this lossy view, so neither can tell them
apart. The counter also never checks `items === types.length`, so the collapsed receipt claims
one DataTransfer type with `items: 2`.

- Crafted: `receipts/dt-collapse-all.json` (sha256 `ead30f62…1bf3`) — every drag event whose
  `types` joined to `text/plain+text/x-tabi` rewritten to the single element
  `["text/plain+text/x-tabi"]`.
- Crafted: `receipts/dt-collapse-types.json` (sha256 `9157c6c6…2728`) — dragstart only.
- Both exit **0**, clean, 146, `findings []` (`out/dt-collapse-all.json`,
  `out/dt-collapse-types.json`). `leg-move-start-dt`, `leg-drop-dz-dt` and
  `legshape-consistency` all report OK.
- Predicate C1 says "items text/plain **and** text/x-tabi"; the accepted receipt claims one type.
- Declared limit? **No.** The limit names relabels with re-timing and a receipt "fabricated from
  nothing"; this is a field-level rewrite of an otherwise honest receipt that every check reads.

### F5 — MEDIUM — `cdpResult` is never read; a leg can report a successful CDP call and a refusal at once
`cdpResult` occurs zero times in the counter (`grep -c cdpResult scripts/check-dragdrop-r75.mjs`
= 0). `leg-params` (`:194-196`) reads `cmd`, `params`, `sentData`, `elapsedMs`; `leg-*-error`
reads `cdpError`; `cdpResult` is unread.

- Crafted: `receipts/cdpResult-garbage.json` (sha256 `86a56993…f52c`) — every leg's `cdpResult`
  set to `{"error":{"code":-1,"message":"NOT WHAT HAPPENED"}}`.
- Crafted: `receipts/badtype-result-success.json` (sha256 `6777b4cd…dd76`) — the bad-type leg's
  `cdpResult` set to `{}` (a successful call) while its `cdpError` still reports the refusal.
- Both exit **0**, clean, 146, `findings []` (`out/cdpResult-garbage.json`,
  `out/badtype-result-success.json`).
- Declared limit? **No specific clause.** Closest is "a receipt fabricated from nothing that
  satisfies every check", but this is an internal contradiction inside an otherwise honest
  receipt, which the counter's header claims to re-derive ("every leg is re-derived from … the
  driver's CDP send log and its CDP event log").

### F6 — MEDIUM — the prior set is not enforced (`>= 1 --prior`); a verbatim relabel passes when its own prior is omitted
`:119` requires only "at least one `--prior`". The predicate says the counting command passes the
16 PRE priors; the counter never compares the supplied set to `controls/c1/prior-set.txt` (it
records `priorSet` with path/sha256/schema but does not gate on it).

- Crafted: `receipts/relabel-smoke1-noprior.json` (sha256 `01553e1e…5fd8`) — `smoke1` with nonce,
  fixture hash (recomputed from the pinned driver), launch token, DevTools browser id and
  `Page.navigate`/`Runtime.evaluate` nonce rewritten; **events untouched**.
- With all 16 PRE priors: exit **1**, `findings ["replay-event-timeline"]`, `maxAbs 1.0`,
  `maxGap 1.0` (`out/relabel-smoke1-with-all-priors.json`) — correctly refused.
- With the 15 priors that omit `smoke1`: exit **0**, `verdict clean`, `findings []`,
  `priorSet 15`, `maxAbs 0`, `maxGap 0.125` (`out/relabel-smoke1-noprior.json`).
- Declared limit? **No.** The limit names relabels of receipts *outside* PRE; it does not say an
  incomplete PRE set is acceptable. The verdict is `clean`, so a caller must read `priorSet` to
  notice.

### F7 — LOW — unread receipt fields (silent divergence)
All of the following exit **0**, clean, 146 (`out/*.json`):
`receipts/sweeps-garbage.json` (`sweeps` set to `[{pid:99999,alive:true}]`; `sweeps` occurs 0
times in the counter), `receipts/fixture-viewport-wrong.json` (`fixture.viewport` 1×1;
`viewport` occurs 0 times), `receipts/host-argv0-true.json` (`host.argv[0]` `/bin/true`;
`childExit` and `cdpProtocolVersion` also unread), `receipts/cdpProtocolVersion-garbage.json`,
`receipts/receipt-extra-topkey.json`, `receipts/legs-extra-key.json`,
`receipts/event-extra-key.json`, `receipts/teardown-extra-key.json`,
`receipts/serverLog-extra-rows.json` (a `/evil` 500 row with a foreign run is ignored),
`receipts/marks0-arbitrary.json` (`legMarks[0].at` is never used by `windowOf`),
`receipts/elapsedMs-zero.json` (every `elapsedMs` 0 while `run-window` is 7.3 s;
`leg-params` only requires `num >= 0`).
- Declared limit? **No**, but these are cosmetic/consistency fields, not evidence-bearing ones.

## Verified — priority items that are NOT false greens

Each row was crafted from the scored receipt (or a relabelled `smoke1`) and refused; the finding
ids are the counter's own.

| Vector | Crafted mutation | Exit | Finding ids |
|---|---|---|---|
| unknown target | `ext-enter-nz` target `dz` / `null` | 1 | `leg-ext-enter-nz-seq`, `legshape-consistency` |
| target containing `@` | dragstart target `src@x` | 1 | `leg-move-start-seq`, `source-lifecycle`, `legshape-consistency` |
| duplicate event + renumbered seq in an empty leg | copy of event 1 labelled `start` | 1 | `event-leg-window`, `leg-start-*`, `coordinate-law`, `legshape-consistency` |
| insert / delete one event | insert `dragover@dz` into `over-dz`; delete it | 1 | `leg-over-dz-seq` (+ `replay-event-timeline`, `event-types`/`data-protection-law`) |
| `sentData` vs send-log | `ext-enter-nz.sentData` non-null | 1 | `leg-params` |
| `items`, `buttons`, `dropEffect`, `effectAllowed`, `plain`, `custom`, `stateAfter` keys | one field changed on a pointer/drag/drop leg | 1 | `event-types` / `leg-*-xy` / `leg-*-dt` / `leg-*-state` / `data-protection-law` / `mask-effect-law` |
| leg label swap | `ext-enter-nz` ↔ `ext-enter-dz` | 1 | `event-leg-window`, `leg-*-seq/prevented/xy`, `coordinate-law` |
| off-grid time | `ts = 766.15` | 1 | `event-time-quantum` |
| event outside its leg window | `at = marks[4].at+1` | 1 | `event-leg-window` |
| marks decreasing / `closedAt` early / `lateAfterClose` 1 | — | 1 | `leg-marks`, `event-leg-window`, `cancel-clears-session` |

Replay boundary (declared limit sentence = "more than half of the event times and more than a
quarter of the >= 50 ms gaps each move by >= 0.05 ms"):

- `receipts/relabel-9move.json` (sha256 `ca338288…b8e`) — 9 events moved (7 `ts`, 2 `at` on
  single-event legs), `maxAbs 0.470588…`, `maxGap 0.5`, `ownGaps 8` → exit **0**, clean
  (`out/relabel-9move.json`). 9 > 8.5, so this is exactly the declared boundary, not below it.
- `receipts/relabel-8move.json` (sha256 `5fdab5b9…6ca`) — 8 events moved, `maxAbs 0.529411…`
  → exit **1**, `replay-event-timeline` (`out/relabel-8move.json`).
- Greedy-order exploit: `pairMatch` is greedy over the receipt's array order, but the receipt
  order is pinned (`event-leg-window` non-decreasing `at`; per-leg `seq`). With `k` events moved
  by >= 0.05 and `17-k` exactly unchanged, every unchanged event matches its own prior unless a
  moved event steals it, and every steal is itself a match by the moved event, so matches
  >= `17-k`; `abs < 0.5` therefore needs `k >= 9`. A 40 000-sample search over perturbations
  (moved `ts`/`at` by 0.1–1.0, rest exactly unchanged, `at` clamped to the leg window and made
  non-decreasing) found `greedy == optimal` in every sample and a minimum of 9 actually-moved
  events for `greedy <= 8`. No greedy undercount found.
- `>= 6 gaps` floor and the 50 ms boundary: the gap test is proportional to the receipt's own
  gap count (`<= 0.75` matched), so 8 gaps needs 3 unmatched, 6 gaps needs 2; both are "more than
  a quarter". No receipt with fewer than 3 moved gaps passed in the boundary runs above.
- Producer binding: `intercept-event` (`:225-227`) requires exactly one `cdpEventLog` entry with
  `afterSendId` equal to the **second** `Input.dispatchMouseEvent` id (the move-start send) and
  `intercept-data` (`:228`) requires the constant `INTERCEPT_WANT`. Both are readable from the
  receipt and the counter, so a receipt whose `Input.dragIntercepted` was never received passes
  if the fabricator writes those two values — the `cdpEventLog` is wholly self-reported and there
  is no independent receipt evidence. This is **named** by the declared limit ("a receipt
  fabricated from nothing that satisfies every check"), but the counter's header claim
  ("exactly one `Input.dragIntercepted` event … received after the move-start mouse send") is
  not independently verifiable. Negative controls: `afterSendId` 14 (press) and 20 (move-far)
  are refused (`intercept-event`); `params.data = "INTERCEPTED"` is refused (`intercept-data`,
  `leg-params`, `drag-call-params`, `mask-effect-law`); an empty or doubled `cdpEventLog` is
  refused (`intercept-event`, `cdp-event-log-closed`, `intercept-data`, `leg-params`,
  `drag-call-params`, `mask-effect-law`).

## Residual risk / verification gaps

- The counter is a receipt reader, not an execution oracle (its own declared limit). F1–F6 are
  *content* gaps: each accepted receipt is internally consistent enough that the 146 checks pass,
  but the receipt does not establish the predicate's platform (F1/F2), the predicate's `-32602`
  refusal (F3), the predicate's two DataTransfer items (F4), the CDP call outcome (F5), or the
  completeness of the prior set (F6). F1–F4 are not named by the declared limit.
- F6 is auditable from the output (`priorSet` path/sha256/schema), but the verdict word is
  `clean`; an operator who drops one `--prior` gets a clean run on a verbatim relabel.
- I did not run the battery (`negatives-dragdrop-r75.mjs`) or kill power
  (`controls/c1/kill-power-r75.mjs`); this review is scoped to the counter. Whether the battery
  catches F1–F5 is outside this seat.
- The pre-freeze controls (`controls-summary.json`, `prefreeze-summary.json`) do not contain a
  version-mismatch, headful-product, error-code, `types`-collapse, `cdpResult` or
  prior-set-omission case, so none of F1–F6 was exercised before the freeze.
- Scratch `/fast/scratch/hyaku/tabi-r75/R75Review1` is deleted before yield; the crafted
  receipts and counter outputs are preserved under this seat's `receipts/` and `out/`.
