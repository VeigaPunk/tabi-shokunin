FINDINGS

Seat R72Review1 — false-green review of `scripts/check-synthpinch-r72.mjs` (frozen `142062ef…e4b`, verified by `sha256sum`, exit 0). Full report, matrix, and all 43 crafted receipts: `.ufo/waves/round-72/w1/R72Review1/report.md`. Baseline control clean: counter on the honest receipt → exit 0, `clean findings=0`, 94 checks (`--list-checks`).

## False greens — counter exits 0 on receipts that cannot describe the claimed run (17 crafted, beside the report)

| # | Forged receipt | Forged delta | Exit |
|---|---|---|---|
| FG1 | fg05-nonce-replay.json | whole-receipt nonce swap (nonce, nonceOnPage, serverLog run, navigate URL, readyExpr) | 0 |
| FG2a | fg01-sendlog-navigate-last.json | Page.navigate moved after `__closeRecord()`, ids renumbered | 0 |
| FG2b | fg17-closerecord-before-zero-pinch.json | `__closeRecord()` sent before the final pinch | 0 |
| FG3a | fg03-page-clock-compressed.json | page timeline (marks/at/closedAt) ×0.05 → 672 ms page vs 15 060 ms wall vs 4706 ms zero elapsed vs 4675.7 ms ts span | 0 |
| FG3b | fg09-page-clock-shifted-1s.json | uniform +1000 ms shift (no absolute anchor; at↔ts gap ~1007 ms) | 0 |
| FG3c | fg04-wall-window-9s.json | wall window 9000 ms < page closedAt 13447.8 ms | 0 |
| FG3d | fg13-elapsed-in-zero.json | legs[in].elapsedMs = 0 vs 249.9 ms wheel span | 0 |
| FG3e | fg14b-empty-windows-collapsed.json | empty-leg mark windows collapsed to 0 vs elapsedMs 716/702/702 | 0 |
| FG4 | fg02-middle-ts-1e9.json | middle in-wheel ts = 1e9 (spans read first/last only) | 0 |
| FG5 | fg06-driver-sha-foreign.json | driverSha256 = 64×a, run without pin (with pin → exit 1 driver-pin) | 0 |
| FG6 | fg07-host-chromium-99.json | host.chromium "Chromium 99.0.0.0" vs cdpProduct Chrome/155 | 0 |
| FG7 | fg08-fixture-sha-zeroed.json | fixture.sha256 zeroed (no check reads it) | 0 |
| FG8 | fg12-late-claim-zeroed.json | lateAfterClose 0 vs actual 42 dropped events (claim-only) | 0 |
| FG9 | fg10-dup-noop-wheel.json | fabricated in-wheel deltaY −1e-9, legShape forged consistent | 0 |
| FG10 | fg16b-wheel-pointertype-touch-consistent.json | wheel pointerType "touch", legShape kinds forged consistent | 0 |
| FG11 | fg11-extra-allowed-eval.json | extra allow-listed Runtime.evaluate, ids 1..75 | 0 |
| FG12 | fg15-scale-interior-reforged.json | per-event scale↔deltaY re-pairing preserving the leg sum (limit probe) | 0 |

Root causes (path:line in the frozen counter): nonce bound only to producer-written bytes (:106,:107,:110,:145,:156); send-log has membership/counts but **no order** (:159-164); four timelines (marks/at/closedAt, event ts, legs[].elapsedMs, wall startedAt/finishedAt) never cross-bound (:118,:121-122,:136-141,:176-181); driver digest pinned only when the caller passes `--expect-driver-sha256` (:111); host version regex unanchored (:113); `fixture.sha256` unread; producer summaries (`legShape`, `lateAfterClose`, `teardown`, `serverLog`) bindable only to themselves. **No check binds the nonce to independent bytes; no check binds per-event scale beyond leg endpoints (:199-202) and the leg sum (:209-211).**

## Direction — all declared refusals re-proved (28 probes, exit 1 each)

Producer-verdict polarity strict (M5 AND→OR guarded): `predicate:false` and `hypothesis:'REFUTED'` each refused (`producer-verdict`, :228). Also refused: forged legShape/ratio, duplicate pinch (count+params), **pinch reordering** (frozen order enforced), unknown eval expression, wrong driver pin, open/missing teardown, before-window event, negative lateAfterClose, short zero leg, broken delta law, untrusted event, seq shuffle, bad nonce shape, nonempty failures, degenerate set, removed mark, mixed wheel sign, ctrlKey false, deltaMode 1, duplicate leg entry, mouse-typed pointermove. Full table in the report (§4).

## R1 closure (r71 routed defect) — CLOSED

`d11-trailing-after-close-consistent.json`: trailing zero-leg wheel at `closedAt + 37` with legShape forged fully consistent → exit **1**, sole finding `event-leg-window` (:138-139; zero window ends at `closedAt`). `d12` ('end' relabel, the exact r71 leak) → exit 1 `event-leg-domain`. `d13` (before-window) → exit 1. Baseline `max(events[].at) = 13446.4 ≤ closedAt = 13447.8`; dropped late events cannot re-enter (their count remains a claim, FG8).

## Residual risk / gaps

Exit 0 certifies internal law-consistency, not that the run happened; mechanically forged replays/re-orders/re-clocks pass. Reality enters only via leg (b) (independent cold run), the driver pin **if passed**, and bytes outside the receipt. Driver/Chromium not run (seat scope). No LSP device in this seat — semantics verified by executing the frozen bytes on 43 crafted receipts. Scratch deleted; no /tmp in evidence; no tool installs; no git mutations.
