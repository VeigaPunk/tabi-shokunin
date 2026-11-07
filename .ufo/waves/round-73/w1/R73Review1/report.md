FINDINGS

Seat R73Review1 — false-green review of `scripts/check-synthpinch-r73.mjs` at its frozen bytes
(`sha256sum` → `3104101a9ac8b0cd09337a870139653f7a64cfb7eb65067daf389119ce20d4d1`, exit 0; driver pin
`3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4` re-measured, exit 0). 48 crafted
receipts scored with the pinned counter; matrix in `matrix.json`, every receipt beside this report.
No script was edited; no driver/Chromium run; no tool installs; no git mutations.

**Bottom line: the r73 generation's own new surface HOLDS — no false green found in the replay
checks, the nonce binding, or argv handling.** Every replay that keeps even one of the three
identifiers is refused, nonce mismatches are refused at all five carriers, and all four required-
argument gates fail closed (exit 2). What remains is the inherited r72 FG2–FG12 class of
receipt-content false greens (14 crafted, all exit 0), which sit inside the declared umbrella limit
("the counter reads a receipt; it is not an execution oracle", claims.json C1.limit) and were routed
as carry-overs, not as r73 defects — reconfirmed here on the r73 bytes so the next generation can
cite measured exits. Two boundary findings sharpen the declared limit's wording (§1.4, §5).

## 0. Method and baseline

Canonical invocation (48×, per case): `node scripts/check-synthpinch-r73.mjs --receipt <crafted>
--expect-driver-sha256 3f0ffe24…9c4 --expect-nonce tabi-r73-l1-3409ab53b905 --prior <PRE×12> --json`,
run from scratch `/fast/scratch/hyaku/tabi-r73/R73Review1` (deleted after evidence copy).
Replay-family receipts are built from PRE `smoke1.receipt.json` with the nonce rewritten everywhere
it occurs (field `nonce`, `nonceOnPage`, every `serverLog[].run`, the `Page.navigate` URL and the
ready-expression string in `cdpSendLog`) and wall stamps +1 h; `r01` proves the rewrite is complete
(its only findings are the three replay ids, exactly the pre-freeze `nonce+stamps` control).
All crafted files and the runner (`forge.mjs`) are in this directory.

| baseline | command | result |
|---|---|---|
| counting command verbatim (committed paths, PRE as 12 `--prior`) | claims.json `countingCommand` | exit 0, `clean`, 98 checks, findings `[]` |
| `--list-checks` | `node scripts/check-synthpinch-r73.mjs --list-checks` | exit 0, 98 ids |
| (a) receipt digest | `sha256sum corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json` | `a3b9070bca0db67000d58eb34a990d05e8191a34b2882ec30a9316472d703ea8` (= scored/c1-counter-a.json claim) |
| wave-dir copies are faithful | counter on `a-receipt.json` with copied PRE priors (b3) | exit 0, clean, 98 checks |

## 1. Priority 1 — replay checks (r73's new surface): all declared refusals fire; one wording gap

### 1.1 Refused — replay keeping ≥1 identifier (exit 1 each)

| case | forged delta vs smoke1→L1-nonce | exit | findings |
|---|---|---|---|
| r00-replay-verbatim | byte-identical PRE replay | 1 | `nonce-expected` + all three replay ids (= controls-summary `byte-identical` witness) |
| r01-nonce-stamps-rewritten | nonce everywhere + stamps +1 h | 1 | exactly `replay-launch-token, replay-devtools-url, replay-event-timeline` |
| r02-timeline-alone-kept | fresh token + fresh browser id, event timeline kept | 1 | `replay-event-timeline` only |
| r03-bid-alone-kept | fresh token, every ts/at +0.001, browser id kept | 1 | `replay-devtools-url` only |
| r12-reorder-renumbered | two slow-leg touchmoves swapped, seqs renumbered | 1 | `event-leg-window` (:175 — handler-`at` monotonicity) |
| r07-uuid-case-upper | browser id uppercased (dl.url + stderrHead kept consistent) | 1 | `replay-devtools-url` — fails CLOSED: `browserId()` regex `[0-9a-f-]{36}$` (:145) yields null, check fails |
| r09-url-trailing-space | dl.url + trailing space, stderrHead adjusted | 1 | `replay-devtools-url` — fails CLOSED (regex end-anchor) |

No crafted receipt that keeps any one of launch token / DevTools browser id / event timeline was
accepted. The each-identifier-alone refusals are exact (single finding each), matching the declared
check semantics at scripts/check-synthpinch-r73.mjs:148-152.

### 1.2 Accepted — the declared limit, reproduced (exit 0)

`r08-full-identifier-rewrite` (fresh token, fresh browser id, every ts/at +0.001, nonce rewritten)
→ exit 0, clean, 98 checks — same class as the executed witness `controls/c1/controls-summary.json`
`limit-full-identifier-rewrite`. Inside the declared limit verbatim.

### 1.3 Accepted — law-consistent forged content on top of a full rewrite (exit 0)

`r10-noop-touchmove-insert`: fresh token + browser id, an extra `touchmove` interpolated mid-slow-leg
(midpoint ts/at, seqs renumbered, `legShape.slow.{total,touchmoves}` regenerated) → exit 0. Same-user
content forgery → inside the umbrella limit; also the r72 FG9 class re-confirmed on r73 (§4).

### 1.4 FINDING (calibration, inside limit but sharper than declared): the timeline hash is 1-ULP-fragile

- `r05-ts-perturb-1e-12` (fresh token/bid/nonce, ONE event `ts` +1e-12) → **exit 0**.
- `r06-at-perturb-1e-12` (same, ONE event `at` +1e-12 on a strictly-gap-neighbor event) → **exit 0**.

`timeline()` (:146) hashes only the `(ts, at)` pair sequence, so *any* single-event perturbation —
1 ULP suffices — defeats `replay-event-timeline`. The declared limit sentence says a forger who
rewrites "…and every event time" is not refused; measured reality: a forger who rewrites nonce,
token, browser id and perturbs **one** event time by 1e-12 is not refused. Same forger capability
class, so not a falsification — but the next generation should either state "any byte-level change
to any (ts, at) pair" in the limit or hash more identifier material (e.g. `leg`+`type`+`deltaY`).
Related diagnostics nit: when `event-leg-window` (:175) fails on its *monotonicity* clause, the
detail prints the *window*-violation count — r06's intermediate (neighbor-tied) variant printed
"events … outside their labelled leg window: 0" while exiting 1.

## 2. Priority 2 — nonce binding: all five carriers bound (all mismatches refused)

| case | delta on clean (a) receipt | exit | finding |
|---|---|---|---|
| n7-only-wrong-expect-nonce | `--expect-nonce tabi-r73-exec1-3409ab53b905` | 1 | `nonce-expected` (:133) |
| n1-nonceonpage-mismatch | `nonceOnPage` → `tabi-r73-l1-deadbeef00` | 1 | `nonce-on-page` (:134) |
| n2-serverlog-run-mismatch | one served `/` 200 row's `run` | 1 | `server-log-binding` (:137) |
| n3-navigate-url-wrong-nonce | `Page.navigate` URL nonce swapped | 1 | `send-log-allowlist` (:186-196 — allow rule rebuilds the URL from `r.nonce`) |
| n4-readyexpr-wrong-nonce | ready-expression nonce literal swapped | 1 | `send-log-allowlist` (EXPRS closed set built from `r.nonce`, :183-185) |

The r72 FG1 root cause ("nothing binds the nonce to independent bytes") is, on r73 bytes, bound at
least to `--expect-nonce` (caller-side, :133) and internally across all five carriers; every
single-carrier mismatch fires. Residual unchanged from r72: all carriers are producer-written bytes,
so a same-user forger rewrites them all (r08) — the declared limit.

## 3. Priority 3 — argv parsing: no false green; all gates fail closed

| case | invocation delta | exit | note |
|---|---|---|---|
| a1-prior-missing-value | `--prior` as final arg | 2 | `priorPaths` picks `undefined` → typeof gate (:104-105) |
| a2-prior-value-json-flag | `--prior --json` | 2 | value starts with `--` → usage gate (:105) |
| a7-expect-nonce-missing-value | `--expect-nonce` last | 2 | regex fails on `undefined`→"undefined" (:102-103) |
| a9-typo-pin-flag | `--expect-driver-sha25 <hex>`, no real pin | 2 | unknown flags are ignored, but the pin requirement then fires (:111-112) — fails closed |
| f5a-no-pin / f5b-no-nonce / f5c-no-priors | omit each required arg | 2 / 2 / 2 | r72 FG5 (unpinned driver identity) is CLOSED on r73 |
| a3-dup-priors-24 | each prior twice | 0 | dedup-free, harmless |
| a5-json-flag-first / a6-priors-after-json | `--json` first / all priors after it | 0 | parse is position-independent (whole-argv scan, :46,:104) |
| n5-dup-expect-nonce-first-wins | `--expect-nonce` twice (right, then wrong) | 0 | `opt()` takes the FIRST occurrence (:46) — observation, not exploitable against the pinned command |
| a8-receipt-dup-first-wins | `--receipt clean --receipt forged` | 0 | first wins (:99-101) — same class |
| a4-self-prior | the receipt under test also passed as `--prior` | 1 | all three replay ids fire against itself — **false refusal** (fail-closed direction; the pinned leg (a)/(b) commands never do this). Worth a usage note, not a fix-or-die |

## 4. Priority 4 — r72 FG2–FG12 classes re-checked on the r73 bytes (all exit 0 = still open, all receipt-content classes inside the declared umbrella limit)

| case | forged delta | exit | r72 class |
|---|---|---|---|
| f2a-navigate-moved-last | `Page.navigate` moved after `__closeRecord()`, ids renumbered | 0 | FG2 send-log causality (:196 checks membership + ids 1..N + `once()`, no order) |
| f2b-closerecord-before-last-pinch | `__closeRecord()` eval moved before the final pinch | 0 | FG2 |
| f3a-page-clock-compressed | all marks/at/closedAt ×0.05 (page 672 ms vs wall 15 s) | 0 | FG3 clocks unbound |
| f3b-wall-window-9s | `finishedAt` = started+9000 ms while closedAt 13.4 s | 0 | FG3 (:154 lower-bounds 8 s only) |
| f3c-elapsed-in-zero | `legs[in].elapsedMs = 0` vs 250 ms wheel span | 0 | FG3 (:157 num ≥ 0; only zero leg bounded) |
| f4-middle-ts-1e9 | third in-wheel `ts = 1e9` | 0 | FG4 ts unbound (spans read first/last only) |
| f6-host-chromium-99 | `host.chromium = "Chromium 99.0.0.0 Arch Linux"` (product left Chrome/155) | 0 | FG6 — version-agnostic regex (:140); the chromium↔product version contradiction is not inspected |
| f6b-product-headed-chrome | `cdpProduct = "Chrome/155.0.8059.84"` (headed) | 0 | FG6 — regex accepts `^Chrome\/`, so a headed-Chrome receipt passes the headless capability's counter |
| f7-fixture-sha-zeroed | `fixture.sha256 = 00…0` | 0 | FG7 — no check reads it (:186-196 uses only `fixture.origin`) |
| f8-late-claim-zeroed | `lateAfterClose = 0` | 0 | FG8 claim-only field (:137 shape-checks ≥ 0) |
| f9-noop-wheel-dup | duplicate in-wheel `deltaY −1e-9`, legShape regenerated | 0 | FG9 (sum law ±0.5, min-bound counts) |
| f10-wheel-label-touch | in-wheel `pointerType: "touch"`, kinds reforged | 0 | FG10 |
| f11-extra-allowed-eval | extra `window.visualViewport.scale` eval, ids renumbered | 0 | FG11 (evals have no `once()`) |
| f12-scale-interior-reforged | in-leg wheels `scale→1`, `deltaY×scale` preserved | 0 | FG12/S4 limit probe |

Direction spot-checks re-verified on r73 bytes: `d06b-pinch-order-swapped` (in↔out pinch params) →
exit 1 `pinch-call-params`; `d18-seq-shuffle` → exit 1 `[seq-monotonic, event-leg-window]`.

## 5. Severity and limit classification

- **Closed by r73 (verified):** FG1 replay/nonce (replay ids + required nonce, §1-§2), FG5 driver
  identity (pin REQUIRED, exit 2), priors REQUIRED.
- **Open false greens, exit 0 (14):** f2a, f2b, f3a, f3b, f3c, f4, f6, f6b, f7, f8, f9, f10, f11,
  f12 + r10 — every one is a same-user *receipt-content* forgery, i.e. inside the declared umbrella
  limit ("the counter reads a receipt; it is not an execution oracle", claims.json C1.limit) and
  none was claimed fixed by the r73 generation. Inherited, measured, for the next routing decision.
- **Boundary sharpening (§1.4):** r05/r06 exit 0 — the effective timeline check is byte-exact on
  `(ts,at)`; recommend the limit sentence (or the check) be tightened in the next generation.
- **No finding outside the declared limit** was produced: no receipt keeping any replay identifier,
  any nonce carrier mismatch, or any malformed argv was accepted.

## 6. Residual risk / gaps

- The driver and Chromium were not executed (seat scope = counter + crafted receipts); leg (b)
  (R73Exec1 cold run) was still pending at review time and is untouched here.
- Replay checks compare against the 12 frozen PRE receipts only; a receipt identical to a *future*
  run (leg b) is not detectable as a replay today — the predicate mitigates by passing the (a)
  receipt as the 13th prior for leg (b). If leg (b)'s receipt were passed as its own prior it would
  be refused (a4) — fail-closed.
- `host-chromium` (:140) cannot pin 155 (not an execution oracle); the capability's version claim
  rests on the driver run + knowledge note, not on this counter.
- Scratch `/fast/scratch/hyaku/tabi-r73/R73Review1` deleted after evidence copy; all 48 crafted
  receipts, `forge.mjs` and `matrix.json` live in this directory. No `/tmp` in evidence. No
  installs; no git/jj mutations; nothing written outside this wave directory and scratch.
