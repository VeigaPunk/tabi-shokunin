# AttackRawSummary — round22/w1 — raw frames vs mirrored summary vs page observations

Seat: TabiR22.AttackRawSummary (reviewer, read-only). Target: shared round-22 oracle/debt design over the retained round-21 acquisition. Artifacts inspected: WIP `corpus/evidence/round-22/semantic-expectations.json` in clone `BuildOracle` (HEAD 5f58577, file untracked), retained acquisition under `corpus/evidence/round-21/runtime/`, frozen counter `.ufo/waves/round-21/measure-c1.mjs`, canonical note `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`. The round-22 `measure-c1.mjs` does not exist yet; findings are design constraints + exact red cases, not code review.

Axes: (a) raw↔summary chronology agreement, (b) summary↔page-observation mirror agreement, (c) expectation↔observation agreement, (d) frozen-counter parity, (e) zero silent cases.

## Ground model (verified in retained bytes)

Three representations of each case exist and must agree:

1. **Raw frames** — `corpus/evidence/round-21/runtime/<id>.json`, `frames[]` (ordered CDP log, `seq`/`at`/`dir`), plus `pageObservations[]` duplicating the `observation` frames.
2. **Mirrored summary** — `corpus/evidence/round-21/runtime/receipt.json` `cases[]`: `preAction {start,end,windowMs,responseCount,formActive}` and `after {start,end,windowMs,responses,submits,navigations,pageState}`, `evidence {path,sha256}`.
3. **Fixed expectations** — `corpus/evidence/round-22/semantic-expectations.json` (WIP): per-case `pre`/`post` blocks, `response`, `responseWindow`, `delayed`.

Frozen precedent (`.ufo/waves/round-21/measure-c1.mjs:139`) defines the summary mirror **asymmetrically**: `after.responses` is compared to *all* `toolResponded` events with `seq < post.seq` (marker-cumulative, **not** time-scoped), while `after.navigations` in the same expression *is* time-scoped (`f.at >= c.after.start`). The note pins this intent (`webmcp-nonautosubmit-round-21-corrected.md:59-61`: "preserves unavailable post-navigation submit state as null rather than zero. Current windows use their observation marker sequence as the response/navigation cutoff; later frames remain in the case trail, not in the in-window summary.").

## Findings (most severe first)

### R1 — HIGH: `after.responses` is marker-cumulative, not window-scoped; a "finite window" reading of the contract false-fails — or certifies nothing about — the two autosubmit rows

Exact counterexample in the **retained** data (no mutation needed):

- `corpus/evidence/round-21/runtime/auto-positive.json:170-177` — raw `WebMCP.toolResponded` (Completed, invocationId `4F3E02707F9A539DF7284C78EC392F5A`) at `seq 12, at 1792590716712`.
- `corpus/evidence/round-21/runtime/receipt.json` `$.cases[10]` (auto-positive): `after.start = 1792590716965`, `after.responses[0]` = the **same** response. The raw event precedes the window it is listed under by 253 ms, and the receipt itself admits it: `preAction.responseCount = 1`.
- Same shape: `auto-invalid.json:171-183` (`seq 12, at 1792590717647`) vs `$.cases[11].after.start = 1792590717898`. Acquisition stdout corroborates: `LIFECYCLE_OBSERVED auto-positive pre=1 statuses=Completed` (`.ufo/waves/round-21/runtime-execution-finalized.json`).

Consequence: any round-22 oracle rule of the form "Completed ⇒ response timestamp ∈ [after.start, after.end]" or "Completed ⇒ response after the action" **false-fails two retained rows**; any summary-only rule (`after.responses[0].status === 'Completed'`) cannot distinguish pre-action auto completion from post-action completion at all — a silent timing miss.

Stable finding expectation: `semantic_timing` fires when raw-frame marker chronology contradicts the summary attribution or the expectation's `responseWindow`. Required reconciliation (matches all 12 retained rows): derive chronology only from `frames[]` marker sequence; `after.responses` must equal the params of `toolResponded` events with `seq < after-action.seq`; `preAction.responseCount` must equal the count with `seq < pre-action.seq`; `after.navigations` stays time+seq scoped per frozen precedent; expectation `responseWindow: "pre-action"` requires the response's `seq < pre-action.seq`.

Red case CX1 (coherent-mutation class, per contract test doctrine): move auto-positive's `toolResponded` frame to `seq 14` (after the `action` frame at `seq 13`), keep params identical, update `receipt.json` `evidence.sha256` and the acquisition artifact digest. Summary and expectations for status/output still "pass"; `semantic_timing` must fire because `responseWindow: "pre-action"` and `preAction.responseCount=1` now contradict raw. A window/status-only oracle passes silently.

### R2 — HIGH: `null` vs `[]` submits — coercion erases the post-navigation distinction the round-21 repair explicitly preserved

Retained facts: `receipt.json` `$.cases[3]` (na-native-submit) has `after.submits = null`, array `output` `[{"dummy":"landing"}]`, and a `pageState` missing `nonce`/`submits`/`errors` keys; every other row uses `submits: []` or a populated array. Both na-remove (`$.cases[5]`, `formExists:false`, `submits: []`) and na-native-submit (`formExists:false`, `submits: null`) share `formExists:false` — so null is **not** derivable from any other field; only the raw after-action observation's key presence decides (`'submits' in post.value`, frozen precedent `measure-c1.mjs:139`).

Red case CX2: delete the `submits` key from na-remove's after-action observation (and its `pageObservations` copy), set `receipt.json $.cases[5].after.submits = null`, update digest links. A `null→0`-coercing oracle passes silently and loses the meaning pinned at `webmcp-nonautosubmit-round-21-corrected.md:59` ("null, not observed zero", table row `na-native-submit`).

Stable finding expectation: `input_shape` fires when `after.submits` is `null` for any row whose expectation `post.submitCount` is numeric, or when the raw after-action observation drops/gains the `submits` key relative to the summary; `submitCount: null` is satisfiable **only** by na-native-submit; array-output `response.output` is legal only together with `navigation: "landing"` (`semantic_navigation` nonempty for that row).

### R3 — MEDIUM: `semantic_delayed` is invisible in the mirrored summary; it must bind to raw release frames

The receipt carries no release field — `$.cases[8]` (na-delayed) differs from `$.cases[2]` (na-requestsubmit) only by `after.windowMs 755` vs `503` and case id. The actual delayed semantics live only in raw: `na-delayed.json:198-241` — observation `delayed-before-release` (`seq 15`, at 1792590715100, `formActive: true`, submits present), frame `dir:"release"` (`seq 16`, same ms), `toolResponded` Completed (`seq 17`), after-action (`seq 18`). The WIP expectations encode exactly this (`delayed: {minMs:250, maxMs:10000, formActiveBeforeRelease:true, responseBeforeRelease:false}`); measured release-to-action-complete delta is 252 ms.

Red case CX3: swap the order of frames `seq 16`/`17` in `na-delayed.json` (release after response; `at` values already equal so ordering is purely by `seq`), update digest links. Receipt unchanged; a status/window oracle passes silently. Expected: `semantic_delayed` fires.

Stable finding expectation: `semantic_delayed` requires, for na-delayed only: exactly one `dir:"release"` frame; exactly one observation labeled `delayed-before-release` with non-empty submits and `formActive:true`; `toolResponded.seq > release.seq`; `release.at - action-complete.at ∈ [250,10000]` ms. Removing the release frames from raw (digests updated) must also fail `semantic_delayed` — otherwise the delayed row is silent.

### R4 — MEDIUM: pending-finiteness must cover the whole trail, not only the window

`na-pending` has zero `toolResponded` frames anywhere (`frames[]` ends at the after-action observation). The note's cutoff rule ("later frames remain in the case trail", line 60-61) means a window-only check of `after.responses == []` would miss a response recorded **after** the window.

Red case CX4: append a `toolResponded` Completed frame at `seq 19, at 1792590717900` to `na-pending.json`, update digest links. Summary stays coherent (`after.responses: []`). Expected: `semantic_timing` (response where `responseWindow:"none"` forbids any) — the exact all-silent synthetic case this round exists to kill.

Stable finding expectation: `responseWindow:"none"` ⇒ zero `toolResponded` events in the entire `frames[]`; additionally every row's last frame must be the after-action observation (holds in all 12 retained cases), so no outcome can hide past the trail end.

### R5 — MEDIUM: frozen-counter parity must be folded, not dropped

The round-22 finding vocabulary (`semantic_status/output/error/timing/navigation/delayed/evidence_binding/case_set/source_binding/input_shape/revision_input`) has no `summary_mismatch`, `window_mismatch`, `order_mismatch`, `raw_invoke`, `event_identity`, `execution_binding`. These frozen checks (`.ufo/waves/round-21/measure-c1.mjs:118,120,126,129,136-139`, plus `execution_binding` over `.ufo/waves/round-21/runtime-execution-finalized.json` artifacts) are the structural baseline the new oracle must carry inside the new names — chiefly `semantic_timing` (order/window arithmetic: `windowMs == end-start`, `after.start == pre.at`, `after.end == post.at`, monotone `seq`/`at`, invoke-before-observe-before-action), `evidence_binding` (receipt↔raw `evidence.sha256`, fixture digests, acquisition artifact map), `input_shape` (invocationId identity, single invoke with `input.q == $nonce|not-an-email`, raw↔`pageObservations` mirror equality). Dropping any of them regresses below the frozen counter and reopens the all-silent hole.

### R6 — LOW: expectations `pre` blocks are checkable only against raw page observations

`receipt.json preAction` carries only `{start,end,windowMs,responseCount,formActive}`. The `pre` expectations (`focused`, `value`, `submitCount`, `statuses`, `errors`, `urlPath`, `urlSearch`, `formExists`) exist only in the raw pre-action observation (e.g. `na-invalid-submit.json:165-183`: `value = nonce`, `focused: "go"`; `na-remove.json:165-183` likewise). A receipt-driven implementation silently skips them (~7 unchecked assertions × 12 rows). `pre.statuses` for autosubmit rows must come from raw events (`seq < pre-action.seq`), since the receipt records only a count. Mirror equality (`pageObservations[i]` vs observation frame with same `seq`) must cover `delayed-before-release`, not just pre/post (frozen precedent checks pre/post only, `measure-c1.mjs:136`).

### R7 — LOW: partial-state integration hazard

At inspection, `BuildOracle` has `semantic-expectations.json` (untracked) but no `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. Per contract, expectations-without-note is partial → exit 1 value 0. The note's first line must equal the expectations' `sourceHeader` exactly (`source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; .ufo/waves/round-21/runtime-execution-finalized.json`), S101 first, producer claim still the round-21 producer `bc11e4d6…` — no new producer claim.

## Bounded preserving positive (verified against retained bytes, not run as a test)

With R1–R4 reconciliation rules and R5 parity folded, all 12 retained rows certify value 12 / exit 0. Verified by direct comparison:

- All 12 `receipt.json evidence.sha256` match computed sha256 of the raw JSONs; all 12 fixture digests triple-agree (file bytes ≡ raw `fixture.sha256` ≡ expectations `fixtureSha256`); acquisition artifact map (`.ufo/waves/round-21/runtime-execution-finalized.json:22-46`) matches receipt `4bc79636…` and every case digest.
- Statuses/errorTexts/outputs per row match receipt, raw events, and expectations verbatim (incl. na-native-submit array output, Canceled errorTexts, validation errorTexts with trailing spaces).
- `pre`/`post` page state (formActive, formExists, value, focused, submitCount incl. `null`, urlPath/urlSearch, errors) match raw observations and receipt `pageState`, including auto rows' `pre.formActive:false`, `pre.submitCount:1/0`, `focused:""`.
- Window arithmetic: `windowMs == end-start` everywhere; pre 252–254 ms, post 501–755 ms; responseWindow chronology holds per marker sequence (`click 13<14<16`, `reset 13→15 Canceled`, `native 13→15 nav→16 response`, `delayed 13→14→15→16→17→18`).

## Residual risk and verification gaps

- `measure-c1.mjs` round-22 does not exist yet; R1–R6 are binding design constraints, not verified behavior. L1 verification must include CX1–CX4 as red cases and the preserving positive at value 12.
- `delayed.minMs 250` vs measured 252 ms: safe only because the acquisition is frozen bytes; any future re-acquisition flaps under scheduler jitter.
- Expectation independence ("not recomputed from the evaluated receipt") is supported by their hand-pinned literal form (per-case digests, verbatim errorTexts, explicit `responseWindow`/`delayed`), but provenance is not machine-checkable from the file alone.
- LSP: no server answered for this lane; all checks are text/digest reads of exact files cited. No counter, selftest, browser, or network was run (sha256sum + one `node -e` JSON-field read over retained bytes only).

Report: `.ufo/waves/round-22/w1/AttackRawSummary.md`
