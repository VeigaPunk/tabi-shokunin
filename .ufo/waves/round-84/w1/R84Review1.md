# R84Review1 — Attack C1: counting-command re-run + false-green hunt on the three new legs

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`; freeze `84ebfa95`/`d90b7f55` (D `a5bdb15ec9a7`).
Claim: C1-SHOWPICKER-R84, capability `chromium-showpicker-linux` generation r84, nonce `tabi-r84-l1-a5bdb15ec9a7`.
Counter: `scripts/check-showpicker-r84.mjs` (pin `e88e9fc7…d315a7`), driver `scripts/chrome-cdp-showpicker-round84.mjs` (pin `f436b229…8807e`).
Receipt: `corpus/evidence/round84/chromium-showpicker/receipt.json` (18 legs). Fixture sha256 `64817252…7738a`.
Prior set: `.ufo/waves/round-84/controls/c1/prior-set.txt` → `probes/prior1.json` (nonce `tabi-r84-probe4`, schema `tabi-chrome-cdp-showpicker-r84`).
Scratch: `/fast/scratch/hyaku/tabi-r84/R84Review1/`; receipts copied to `w1/` before cleanup. No commits; no lane-tree edits except `w1/`.

## 1. Independent re-run of the counting command — CONFIRMED clean, checkCount 80

Counting command per `claims.json` C1.countingCommand, executed from scratch (cwd `$S`, absolute lane):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-showpicker-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round84/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 \
  --expect-fixture-sha256 64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-84/controls/c1/prior-set.txt --json
```

Observed output (quoted):

```
EXIT:0
--- verdict/checkCount/findings ---
verdict: clean
checkCount: 80
checks total: 80
false checks: []
findings: []
--- stderr ---

(saved: w1/R84Review1-rerun-counter.json)
```

Recorded scored output (`.ufo/waves/round-84/scored/counter-a.json`) also reads `verdict: clean, checkCount: 80, findings: []` — the two agree exactly, so **checkCount 80 clean is confirmed**, not refuted. Pin re-verification:

```
f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e  scripts/chrome-cdp-showpicker-round84.mjs
e88e9fc7a7f5f4ca47c2aca40b77cf6d93a0347dfdf5f60e427ba036b3d315a7  scripts/check-showpicker-r84.mjs
```

Receipt header: `nonce: tabi-r84-l1-a5bdb15ec9a7`, `driverSha256: f436b229…8807e`, 18 legs, `failures: []`.

Battery pre-check reading (context only, `.ufo/waves/round-84/scored/battery-a.json`): `cases: 156, failed: 3, coverage 74/80`, uncovered exactly the three new legs + their three `-law` checks, each detail `exit 1 expected leg-sp84-cross-origin-tel got ["leg-sp84-cross-origin-tel","no-selection-law"] extra ["no-selection-law"]`. This is a battery-expectation artifact (the battery's per-leg negative cases expect the *sole* finding id; the live counter also fires `no-selection-law` on those legs — see §4), not a defect in the scored receipt, which is clean under the frozen counter. It does, however, already signal that the three new legs are treated specially by `no-selection-law`.

## 2. Attack (a) — are the three legs' childResult/message pins the exact SecurityError, not a generic failure? YES

Receipt values for the three legs (identical to the carried cross-origin legs):

```
sp84-cross-origin-tel    | childResult {"ok": false, "name": "SecurityError", "message": "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."}
sp84-cross-origin-search | childResult {"ok": false, "name": "SecurityError", "message": "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."}
sp84-cross-origin-text   | childResult {"ok": false, "name": "SecurityError", "message": "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe."}
```

Counter pin (`scripts/check-showpicker-r84.mjs:219,275-285`):

```
const SECURITY_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe.";
...
'sp84-cross-origin-tel':    { ok: false, name: 'SecurityError', message: SECURITY_ERR },
'sp84-cross-origin-search': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
'sp84-cross-origin-text':   { ok: false, name: 'SecurityError', message: SECURITY_ERR },
```

`CHILD_RESULT_LAW` is compared with `same()` (exact deep equality), so `ok:false`, `name:'SecurityError'`, and the **full** message must all match. Field census across all 11 cross-origin legs: `childResult` has only 2 distinct values — the SecurityError string (10 legs) and `{ok:true,ret:'undefined'}` (color only). `childState` is 1 distinct value across all 11 (all-empty), `parentCrossAccess = {contentDocument:null, windowDocument:'SecurityError'}` 1 distinct, `childLate = 0` 1 distinct. So the pins are exact, but — see §5 — they are also *non-discriminating* between types.

## 3. Attack (b) — can a receipt that opens a chooser on those legs still pass? NO (exit 1, 3 substantive findings)

Forge procedure (in scratch, per spec): copy the scored receipt, append a `Page.fileChooserOpened` event to the tel leg's `cdpEventLog`, keep every other field. The scored tel leg has exactly 1 event (`Page.frameNavigated`, `afterSendId: 7`); v1 appended `{method:Page.fileChooserOpened, params:{frameId:<main>, mode:selectSingle, backendNodeId:999}, afterSendId:8}` (deliberately naive frame/binding); v2 corrected the frame to the child context frame (`085F7384…`, origin `http://127.0.0.1:19452`) with `afterSendId = priorReleaseId+1 = 19` and added the trailing `{enabled:true,cancel:true}` dismiss call + `dismissSendId/dismissResult={}/dismissError=null`.

Result v1 (quoted):

```
EXIT:1
verdict: findings checkCount: 80
false checks: ['plan-calls', 'cdp-event-log-closed', 'leg-sp84-cross-origin-tel', 'sp84-cross-origin-tel-law', 'intercept-law', 'prior-set-complete']
findings (substantive):
  plan-calls: "...sp84-cross-origin-tel:sequence [...] want [...,\"Page.setInterceptFileChooserDialog\"]"
  cdp-event-log-closed: "CDP event logs: sp84-cross-origin-tel:open-frame,sp84-cross-origin-tel:open-binding"
  leg-sp84-cross-origin-tel: "sp84-cross-origin-tel: opened [\"selectSingle\"]"
  sp84-cross-origin-tel-law: "sp84-cross-origin-tel: child {...SecurityError...} events [...]"
  intercept-law: "...sp84-cross-origin-tel:opened-1-want-0"
(saved: w1/R84Review1-forged-tel-out.json)
```

Result v2 (fully "honest" forgery: correct frame, in-window binding, dismiss call present — quoted):

```
EXIT:1
verdict: findings checkCount: 80
false checks: ['leg-sp84-cross-origin-tel', 'sp84-cross-origin-tel-law', 'intercept-law', 'prior-set-complete']
finding ids: ['leg-sp84-cross-origin-tel', 'sp84-cross-origin-tel-law', 'intercept-law', 'prior-set-complete']
(saved: w1/R84Review1-forged-tel-v2-out.json)
```

Verdict: **a chooser-opening tel leg canNOT pass.** Even after fixing the two mechanical gates (`plan-calls`, `cdp-event-log-closed`), three independent checks still fail, and each is load-bearing on its own:

- `leg-sp84-cross-origin-tel` — frozen `LEG_SHAPE[...].opened = []` vs observed `['selectSingle']`;
- `sp84-cross-origin-tel-law` — requires `cdpEventLog.filter(Page.fileChooserOpened).length === 0` in addition to the exact childResult;
- `intercept-law` — `CROSS.has('sp84-cross-origin-tel')` forces `want = 0` opens (`opened-1-want-0`).

No single-relaxation forge reaches clean. (The `prior-set-complete` finding in all scratch runs is a *positional artifact*, not a signal: the counter walks the lane's round-84 trees and always finds the scored receipt there; when the receipt under test is a scratch copy — even an unmodified baseline copy — that lane copy is "not the receipt under test, not exempted, not a prior". Baseline-copy control run: `verdict: findings, false: ['prior-set-complete']` with exit 1. It is the only false check in all control runs and does not affect the clean verdict when the receipt is at its scored path.)

## 4. Attack (c) — wrong-reason SecurityError: which check ids catch it; and is the leg distinguishable from type=date?

### 4a. Wrong-reason probe

Probe: all three legs' `childResult` replaced with `{ok:false, name:'SecurityError', message:"...permission denied (synthetic wrong reason)."}` (name preserved, message mutated). Observed (quoted):

```
EXIT:1
verdict: findings checkCount: 80
false checks: ['sp84-cross-origin-tel-law', 'sp84-cross-origin-search-law', 'sp84-cross-origin-text-law', 'prior-set-complete']
finding ids: ['sp84-cross-origin-tel-law', 'sp84-cross-origin-search-law', 'sp84-cross-origin-text-law', 'prior-set-complete']
(saved: w1/R84Review1-wrongreason-out.json)
```

So the "wrong reason" is caught by **exactly one check id per leg**: `sp84-cross-origin-tel-law`, `sp84-cross-origin-search-law`, `sp84-cross-origin-text-law`. Because `same()` is exact, *any* deviation in `ok`, `name`, or the full `message` fails that law; note `intercept-law` does **not** catch it (it only tests `childResult.ok === true` for CROSS legs, and the wrong-reason value stays `ok:false`), and `leg-*` does not catch it (page-events shape only). Control probe: flipping tel to `{ok:true,ret:'undefined'}` (the color value) additionally trips `intercept-law` (`...opened-0-want-1`), confirming the two-check split.

Cross-leg confusion probes (quoted):

```
== swap-result ==  (tel childResult <-> nonfile/dt childResult: identical objects)
EXIT:1, false: ['prior-set-complete']            (positional artifact only — swapping is undetectable)
== swap-events == (tel childEvents <-> text childEvents, go12 <-> go14)
EXIT:1, false: ['sp84-cross-origin-tel-law', 'sp84-cross-origin-text-law', 'prior-set-complete']
```

### 4b. Distinguishability from `type=date` — NO. The receipt and counter do NOT distinguish tel/search/text from date at all.

Driver does wire the types (`chrome-cdp-showpicker-round84.mjs:136`: `<input type="tel" id="te"><input type="search" id="se"><input type="text" id="tx">` alongside `<input type="date" id="dt">`, with `go12→te`, `go13→se`, `go14→tx`), but **the receipt carries no type evidence and the counter checks none**:

- `childResult` for tel/search/text/dt(`sp84-cross-origin-nonfile`)/dtd is byte-identical (`{ok:false,name:SecurityError,message:SECURITY_ERR}`); `childState` (including `teValue/seValue/txValue`) is all-empty for every cross leg; `parentCrossAccess`, `childActivationBefore`, `childLate`, `intercept`, `gesture` are each 1-distinct across all 11 cross legs;
- the receipt contains **zero** occurrences of `type="tel"`, `type="search"`, `type="text"`, or `type="date"` (verified by scan) — input types live only in the driver's `CHILD_HTML`, which the counter never hashes or inspects;
- the counter's `FIXTURE_INPUTS` (checked by `fixture-descriptors` via exact `same()`) contains only page-side elements (s/m/d/k/f/dis/disd) — **no te/se/tx entries**, so nothing pins the child-side input types either;
- the only per-leg discriminators in the receipt are administrative: `name`, `target` (`te/se/tx` vs `dt/dtd`), `childEvents` button id sequence (`pointerdown@go12…` vs `pointerdown@go3…`), and run-scoped fields (`argv`, `cdpEventLog`, `cdpSendLog`, `marks`, timing). Swapping tel↔date `childResult`/`childState` is provably undetectable (swap-result probe: baseline + positional artifact only);
- swapping `childEvents` between tel and text *is* caught — but only because the frozen `CHILD_EVENT_SHAPE` sequences name different buttons (`go12` vs `go14`). That proves the harness can tell the *legs* apart, not the *input types*: a driver bug that wired `go12` to a `type=date` element while leaving `target:'te'` and the button honest would still produce a clean receipt, since nothing in the receipt records what type `te` actually was.

Consequence for C1: the claim "cross-origin `type=tel/search/text` inputs each throw the SecurityError" is established only modulo the driver's own wiring — the counter verifies that *whatever element the leg's target id pointed at* threw the exact SecurityError. The instrument is sound against receipt forgery (§3) and blind to driver-side type mis-wiring (§4b). This is consistent with the claim's own `limit` sentence (the legs measure the SecurityError only, not dialog contents), but the limit wording does not disclose the type-binding gap; a `type=date` impostor for `te` would equally satisfy every gate. If the milestone needs the full *"measured on type=tel"* predicate, that needs an element-type readback in `childState` (e.g. `teType: document.getElementById('te').type`) pinned by a new law check — which would be a new claim, not an amendment.

## 5. Residual observations

- Battery coverage 74/80 with the three new legs "uncovered": the battery's negative-case harness expects the exact singleton finding set per leg (`expected leg-… got […,"no-selection-law"]`). The live counter fires `no-selection-law` on these three legs (`stateAfter` equality against `EMPTY_STATE` cannot hold when the leg's state assertion set differs) — same evidence as the battery's own diff line. Not a scored-receipt defect; flagged so the battery owner reconciles the expectation table with the frozen `LEG_SHAPE` state pin for `sp84-cross-origin-{tel,search,text}`.
- `no-selection-law` + `intercept-law` + the three `-law` checks form triple coverage on the "opens nothing" property for the new legs — no single-check false-green path found; every mutant I ran (chooser injection ×2, wrong-reason message, ok-flip, event swap, result swap) was caught or, in the result-swap case, provably invisible *in principle* (identical values).

## 6. Verdict on C1 (scoped to this assignment)

- Counting command independently re-run: **CONFIRMED clean, exit 0, checkCount exactly 80, zero false checks, findings []** at the scored receipt path.
- (a) Exact SecurityError pin confirmed for all three legs; wrong-reason caught by `sp84-cross-origin-{tel,search,text}-law` respectively.
- (b) Chooser-opening forgery **rejected** (exit 1; `leg-sp84-cross-origin-tel`, `sp84-cross-origin-tel-law`, `intercept-law`).
- (c) Type-date indistinguishability is a real, demonstrated gap between the *harness* (driver HTML) and the *instrument* (receipt + counter): acceptable under the claim as written, worth a limit-sentence disclosure or a future type-readback leg. No false-green found **within the receipt-forgery threat model**; the type-miswiring model is outside the counter's reach.

Commands run: the counting command (§1), baseline-copy control, v1 + v2 forgeries, wrong-reason probe, ok-flip probe, swap-result/swap-events probes, pin `sha256sum`, receipt/counter field censuses — full outputs quoted above; JSON receipts at `w1/R84Review1-{rerun-counter,forged-tel-out,forged-tel-v2-out,wrongreason-out}.json`.

Tools installed/upgraded: none (no network, no installs requested or made).
