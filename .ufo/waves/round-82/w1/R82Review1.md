# R82Review1 — C1 SHOWPICKER-R82 attack (read-only)

## Axes
- Honest-run acceptance (counter + battery + kill-power + selftest + drift)
- False-green resistance per law (i)–(v)
- Pin / identity integrity (freeze, driver, fixture, nonce, D)

## Environment / identity reconciliation
- HEAD (lane) = `4937252df252790420d3c8df956c96f865dac30a` ("round-82: digests + self-drift identity (D 5204a0581de5)").
- Claims `digestsCommit` / freeze D = `5204a0581de5ef1a9eae08d156646dcb3e6ed25f`. The seat prompt's "D = 4937…" is HEAD, not the digests commit.
- Tooling: no installs; `node`, `python3`, `sha256sum` only (operator 2026-10-19 rules read; PACMAN guard respected).

## Pin re-derivation (from committed bytes)
All 6 `sha256sum` values at HEAD match `freeze.txt` exactly:
- `scripts/chrome-cdp-showpicker-round82.mjs` `2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1` ✓
- `scripts/check-showpicker-r82.mjs` `d0d26fe59b6f5067b6a8021d6e7e039466e6ded46bb4cd4f5eda6f07b444d62e` ✓
- `scripts/negatives-showpicker-r82.mjs` `e2d554e6ffd4e3b35d7b00f9301e3d1d0c59f28876a3f830aa229b455a0f32ff` ✓
- `scripts/kill-power-r82.mjs` `f0d2b8667817fc7b676277499010b5156a801b203629cfb3abe1ac296a1b4db1` ✓
- `scripts/selftest-r82-gates.mjs` `64888b15d5beecd93d425364419087073396732d2f0cb75a497ceeea8e866db7` ✓
- `scripts/check-record-drift-r82.mjs` `d145d9ff448c3ce9c5180d477e604dde69795ad091e92a2528667dca33c7e5c9` ✓

## Re-runs (correct pin)
- Scored receipt `corpus/evidence/round82/chromium-showpicker/receipt.json` (nonce `tabi-r82-scored1`, fixture `7373c60896dc0238e46b864f735454b42ae515df7bd3339ef47ed1791ef42b4d`, driver `2085…`): **exit 0, verdict clean, 64/64 checks**, replay `absMatched 2 / priorEvents 32, absNeed 16, refused false`.
- Selftest `node scripts/selftest-r82-gates.mjs --lane … --work <scratch> --json`: **exit 0, clean 9/9** (pins-match-freeze, counter-clean 64, battery 70 cases coverage `{declared:64,covered:64,uncovered:[],unknown:[]}`, kill-power `{mutants:46,killed:46,survived:0,crashed:0}`, nowork-control exit 1, tree-exempt-path-refused exit 2, record-drift 0 mismatches, capability-status rows 15 claimed 14).
- Drift `node scripts/check-record-drift-r82.mjs --lane … --json`: **exit 0, mismatches 0, 8 claims**, incl. `r82-identity finalD=5204a0581de5ef1a9eae08d156646dcb3e6ed25f nonce=tabi-r82-l1-5204a0581de5`.
- Prior `prior1.json` (nonce `tabi-r82-prior1`) pointed at itself via `prior-set.txt`: **exit 1, findings** — `replay-event-timeline` refused (`absMatched 32`), `replay-launch-token`, `replay-devtools-url`, `prior-set-complete` (scored receipt). This is correct: `prior1.json` is the committed prior, scored receipt is its cold-run comparand. Tested as a fresh cold run it is refused as a self-replay.

## Assigned-command defects (verbatim form cannot pass)
1. `--receipt …/probes/tabi-r82-probe2.json` does **not exist** under the wave tree (only `prior1.json` exists there). Verbatim run: **exit 2, `receipt-unreadable: ENOENT`**.
2. `--expect-driver-sha256 e35e63c11052a7b48efd765541618495d8a2301dbfb36f3250b763dc3c97c669` is the **r81 driver** (`scripts/chrome-cdp-showpicker-round81.mjs` sha256), not r82. Any r82 receipt with that pin fails `driver-pin` alone (exit 1, 63/64). The r82 pin is `2085c2a7…` as in `freeze.txt`.

## Forgery probes (scratch-only receipts, counter exit codes)
All receipts below start from the scored bytes, nonce/fixture identity otherwise unchanged unless noted.

| # | Attempt | Law fields read | Result |
|---|---|---|---|
| F1 | `sp82-cross-origin-nonfile.childResult := {ok:true}` (parent-side success) | `cross-origin-nonfile-law` reads `leg.childResult` (not `showPicker`), `childEvents`, `parentCrossAccess`, `childActivation*`, `cdpEventLog` opens==0 | exit 1 — `cross-origin-nonfile-law`, `intercept-law` fail |
| F2 | `sp82-same-origin-nonfile-disabled.showPicker := SecurityError…` (both errors Security, spec-order) | `order-law` cross half `cod.childResult` + same half `sod.showPicker` (`InvalidStateError` name; full message in `gesture-law`) | exit 1 — `order-law`, `gesture-law` fail |
| F3/H3 | `sp82-webkitdirectory-answer.uploadDir.files[0]: sha256→0×64, size→999` (state text unchanged) | `webkitdirectory-answer-law` `wa.uploadDir` vs `sha256(Buffer.from(frozen hex))`, `wa.stateAfter.d` vs `DIR_FILES`, `answer.setParams`, `answer.setResult`, `LEG_SHAPE.files` | exit 1 — `webkitdirectory-answer-law` fails |
| G3 | `sp82-webkitdirectory-answer.pageEvents` `read` `ret→hex:deadbeef` | same law + `leg-sp82-webkitdirectory-answer` `LEG_SHAPE.files` | exit 1 — `webkitdirectory-answer-law` fails |
| F4 | `sp82-click-while-open` second open identical params (backendNodeId 11, same frame, distinct `afterSendId`) | `click-while-open-law` counts only; real binding in `cdp-event-log-closed` (`afterSendId==triggerSendId` / within `clickReleaseId+3`) + `plan-calls` (4 mouse events, `clickPressId==clicks[2].id`) | exit 1 only via `prior-set-complete` (scratch artifact) — **law passes**; distinctness comes from send-binding, not the law |
| H4 | Duplicate the 2nd `fileChooserOpened` verbatim (3 opens) | `cdp-event-log-closed:multi-open`, `leg-…:opened`, law count==2 | exit 1 — `cdp-event-log-closed`, `click-while-open-law`, `intercept-law` fail |
| F5 | `fixture.child.sha256 := 'a'×64` | `fixture-hash` checks only `/^[0-9a-f]{64}$/` on `child.sha256` | exit 1 only via `prior-set-complete` — **passes all 63 named checks** — child HTML bytes are NOT content-bound |
| G1 | `sp82-cross-origin-nonfile.childContextId := 999` | `context-binding` (`childContextId==child context id`), `send-log-allowlist` (`contextId`-gated evals) | exit 1 — fail even with scored receipt `--tree-exempt-sha256`-ed |
| H6 | **Full forgery**: nonce→`tabi-r82-forged1` everywhere, every `ts`/`at`/mark/`closedAt`/`childEvents.at` += 10.0 | `replay-event-timeline` (constant-shift escape), `replay-launch-token`, `replay-devtools-url`, `prior-set-complete` | exit 1 on `prior-set-complete` only; **with scored exempted by content hash: exit 0, clean 64/64** |

## Findings by attack

### (i) Old receipt under the r82 counter?
No. r81 receipt → **exit 1, 60 checks**, `schema` (r81 vs r82), `nonce-shape`, `driver-pin` (e35e… vs 2085…), `plan-frozen`, `leg-order` (sp81 names), all 6 r82 `*-law` false, `fixture-descriptors`, `prior-set-complete`. r80 receipt → **exit 1, 61 checks**, same classes (`leg-sp80-*` unknown-leg). Identity (`schema`, `driver-pin`, `plan-frozen`, `leg-order`, `leg-records` = exact `LEG_KEYS`, `nonce-shape`, `fixture-hash` + `fixtureInputs` == `FIXTURE_INPUTS`) blocks a bare old receipt outright. Caveat: H6 shows identity fields themselves are cheap to relabel (schema string, `driverSha256`, nonce text) — the durable part is the leg/CDP/send shapes and the constants.

### (ii) `cross-origin-nonfile-law` — child's own script vs parent-side call?
**Bound.** Parent calls are excluded three ways: `SP_LAW` for CROSS legs is `null` so `gesture-law` requires `showPicker===null`; `plan-calls` requires `triggerSendId===null && trigger2SendId===null`; `send-log-allowlist` forbids the parent `wrapperFor(target)` expression on CROSS legs and gates child evals to `__r3…__r8` with `contextId===childContextId`. `context-binding` requires exactly one default child context at the child origin whose `id` is `childContextId`. So a parent-side call cannot produce this receipt without tripping `gesture-law` / `plan-calls` / `send-log-allowlist` / `context-binding` (F1/G1). Residual: `childState` and `childResult2` are in `LEG_KEYS` but **never asserted** for CROSS legs; the law proves the throw + activation + 5 trusted `go3` events, not child state content.

### (iii) `order-law` — real discrimination?
**Yes, but only as a conjunction.** The two errors live in different legs/contexts: cross half reads the child-context `cod.childResult` (exact `SECURITY_ERR` text via `CHILD_RESULT_LAW`), same half reads the parent-context `sod.showPicker` (`InvalidStateError`; full `IMMUTABLE_ERR` enforced by `gesture-law`). One call cannot produce both because a CROSS leg cannot have a parent `showPicker` (above). F2 (both `SecurityError`) fails `order-law` + `gesture-law`. The counter proves the observable error split; "origin-before-mutability" is an interpretation of that split, not something the receipt measures directly.

### (iv) `webkitdirectory-answer-law` — delivered bytes or state text?
**Bytes, via frozen constants** — but only in the honest-driver sense. `waState` must equal `DIR_FILES` (name/size/type/`webkitRelativePath`), `LEG_SHAPE.files` must match the `input`/`change`/`read` event file tuples, `wa.uploadDir` must equal `{name, files:[{name,size,sha256: sha256(Buffer.from(frozen hex))}]}`, `answer.setParams.backendNodeId` must equal the `nodeReport` (actual `fileChooserOpened.params.backendNodeId`), `answer.setResult=={}` and `setError===null`. H3/G3 both fail. Residual limits: `setParams.files[0]` is checked by **`path.basename` only** (directory path unchecked); the `sha256` is recomputed from the counter's own frozen `hex` constants, not from any receipt-carried bytes — a fully hand-written receipt copying those constants passes without running a browser. That is the receipt-counter design limit, not a law-logic bug (negatives/kill-power cover driver mutation).

### (v) `click-while-open-law` — two real choosers vs one event recorded twice?
**The law alone: no** (count of `Before==1/After==2` + 2 opens + 1 trusted click). A double-record with cloned params but consistent send-ids passes the law (F4). What actually distinguishes them is `cdp-event-log-closed` (`afterSendId==triggerSendId` for open #1, `clickReleaseId∈[afterSendId-3, afterSendId]` for open #2) plus `plan-calls` (exactly 4 `Input.dispatchMouseEvent`s, `clickPressId/ReleaseId` = ids 3/4, `triggerSendId` = wrapper eval). H4 (third open) and H5 (single open) fail those. Being a receipt, send-ids are still self-reported — the binding is as strong as the receipt model allows (same for all legs).

### Child fixture bytes — NEW genuine gap
`fixture.child.sha256` is checked only for 64-hex shape (`fixture-hash`, l.254). F5 (`'a'×64`) passes every named check. The driver constant `CHILD_HTML`'s hash is never recomputed from the pinned driver; child-origin bytes are pinned only via `childServerLog` (`/child.html` → nonce, 200) and the child context/activation/events. A forger can substitute any child HTML and keep the SecurityError laws passing, as long as the child page calls `showPicker()` from the child context. Severity: **medium** (state/activation/events still bind behavior, but child HTML identity is not content-bound).

### Replay / cold-run limit — DECLARED, but worth stating plainly
H6 is a **complete passing forgery** outside the walked trees: new nonce, all event times uniformly shifted, launch tokens and devtools URL left as the scored run's (they don't repeat any *prior*'s, and within-leg uniqueness holds). It is refused only by `prior-set-complete` (scored receipt sitting un-priored in the walked tree). With `--tree-exempt-sha256` of the scored receipt it is **exit 0 clean 64/64**. The counter's own `limit.sentence` declares exactly this escape ("shifts EVERY event by a constant offset escapes this rule"). Consequences: cold-run acceptance (b) is only as honest as commit-time tree placement + the committed prior set; per-leg `launchToken`/`devtools browserId` uniqueness is within-run + vs-priors, so a *single* novel forgery with fresh tokens also passes — but that's the stated limit, not a new defect. No predicate amendment proposed (attack-only).

## Predicate (a)–(d) re-checked
- (a) Scored run post-D: **clean 64/64** (above). The L1 nonce in claims (`tabi-r82-l1-5204a0581de5`) is a *claim identity*; scored receipt nonce is `tabi-r82-scored1` — they differ (intentional: claims nonce ≠ run nonce in this generation).
- (b) Cold-run acceptance: triple-clean cannot be shown by this seat (only the scored + prior1 receipts exist). Refusal part verified: r81- and r80-receipts and the self-replay `prior1` each exit 1 (`findings`), no honest receipt was refused.
- (c) Battery 70/70 coverage 64/64 uncovered [] and kill-power 46/46 — verified via the selftest gates (above), exit 0.
- (d) `corpus/knowledge/chromium-showpicker-runtime-round-82.md` exists; SKILL gate registry + selftest exit 0 — verified.
- C2: `check-record-drift-r82.mjs` exit 0, 0 mismatches (8/8 legs incl. `r82-identity` finalD and `r82-numbers` checks=64).

## Verdict
No false-green in the law logic for an honest pinned driver; the five asked attacks each fail for the named reason, with two reservations: (1) **child HTML bytes are shape-bound only** (F5), and (2) the **constant-shift full forgery passes** as the frozen limit states (H6, 64/64 when the scored receipt is content-exempted). Both are reported as findings, not amendments.
