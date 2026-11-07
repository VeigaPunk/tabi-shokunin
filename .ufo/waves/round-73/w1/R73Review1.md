FINDINGS

Seat R73Review1 — scoped false-green review of `scripts/check-synthpinch-r73.mjs` at its frozen bytes
(sha256 `3104101a…4d1`, re-measured exit 0). 48 crafted receipts scored with the pinned counter and
the frozen PRE priors; full report, matrix, runner and all crafted receipts:
`.ufo/waves/round-73/w1/R73Review1/report.md`. Baseline: the claims.json counting command on the
committed (a) receipt → exit 0, `clean`, 98 checks; `--list-checks` → 98 ids.

## r73 focus (replay, nonce binding, argv) — HOLDS, no false green found

- **Replay refusal (r73's new checks, check-synthpinch-r73.mjs:148-152):** every crafted replay that
  keeps even ONE of launch token / DevTools browser id / event timeline is refused — byte-identical
  PRE replay exit 1 `[nonce-expected + 3 replay ids]`; nonce+stamps rewrite exit 1 exactly the three
  replay ids; each identifier kept alone exit 1 with that id only; case-changed uuid and url
  trailing-space fail CLOSED (`browserId()` regex `[0-9a-f-]{36}$`, :145); event reorder exit 1
  `event-leg-window` (:175).
- **Nonce binding (:133-137, :186-196):** mismatches refused at all five carriers — `--expect-nonce`,
  `nonceOnPage`, `serverLog[].run`, `Page.navigate` URL, ready-expression string (each exit 1,
  single finding). The r72 FG1 "nonce bound only to itself" is closed at least to the caller-side
  pin; full rewrite by a same-user forger stays accepted = declared limit (`limit-full-identifier-rewrite`).
- **Argv (no false green; all gates fail closed):** `--prior` missing value exit 2; `--prior --json`
  exit 2; `--expect-nonce` missing value exit 2; typo'd `--expect-driver-sha25` exit 2; no pin / no
  nonce / no priors exit 2 (r72 FG5 CLOSED). `--json` position-independent; duplicate flags and
  duplicate `--receipt` resolve first-wins (:46) — observation only.

## Findings

1. **Timeline hash is 1-ULP-fragile (inside declared limit; sharpens its wording).** `timeline()`
   (:146) hashes only `(ts, at)` pairs: a forged receipt with fresh nonce/token/browser id and ONE
   event time perturbed by 1e-12 → exit 0 (r05, r06). The limit sentence says "every event time";
   measured: any single 1e-12 perturbation defeats the check. Recommend next generation tightens the
   sentence or hashes more event material. Minor: `event-leg-window`'s detail prints the window-
   violation count even when the monotonicity clause is what failed.
2. **Inherited r72 FG2–FG12 false greens persist on the r73 bytes (14 crafted, all exit 0):**
   send-log causality unbound (`Page.navigate` after `__closeRecord()`, `__closeRecord()` before the
   last pinch); four clocks unbound (page ×0.05 vs wall, 9 s wall vs 13.4 s page, `elapsedMs=0`);
   middle `ts=1e9`; `host.chromium "Chromium 99.0.0.0"` and headed `cdpProduct "Chrome/155…"`
   accepted (:140 version-agnostic, `^Chrome\/` allowed); `fixture.sha256` unread; `lateAfterClose=0`;
   noop-wheel dup / wheel `pointerType:"touch"` / extra allowed eval / interior scale re-forge with
   regenerated legShape. All same-user receipt-content forgeries → inside the declared umbrella
   limit ("not an execution oracle"); none was claimed fixed by r73. Re-measured so the next
   generation can route them with exits in hand.
3. **Self-prior false refusal (fail-closed).** A clean receipt passed also as its own `--prior` is
   refused with all three replay ids (a4, exit 1). Harmless to the pinned leg (a)/(b) commands; a
   usage note for future callers.

Direction re-verified on r73 bytes: pinch param swap (in↔out) exit 1 `pinch-call-params`; seq
shuffle exit 1 `[seq-monotonic, event-leg-window]`.

Residual: driver/Chromium not executed (seat scope); leg (b) pending at review time. Scratch
`/fast/scratch/hyaku/tabi-r73/R73Review1` deleted; evidence lives in `w1/R73Review1/`. No installs,
no git mutations, nothing written outside the wave dir and scratch.
