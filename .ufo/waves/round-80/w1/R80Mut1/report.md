# R80Mut1 — independent conjunct-level mutation testing of the r80 counter

**Seat:** R80Mut1 (mutation tester, leaf member, no subagent dispatch)
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
**Judged on:** coverage
**Milestone:** independent conjunct-level mutants of the r80 counter beyond the frozen list
**Scratch:** `/fast/scratch/hyaku/tabi-r80/R80Mut1/` (deleted before yield; evidence copied to the seat dir first)
**Evidence:** `.ufo/waves/round-80-seats/R80Mut1/` — `summary.json`, `mutants.json`, `results-d6.json`,
`baseline-d6.json`, `witnesses-d6.json`, plus the superseded-target receipts
`results-8db6a43a.json`, `baseline-8db6a43a.json`, `results-f22db0ac.json`, `baseline-f22db0ac.json`,
`frozen-honest-refusal-f22db0ac.json`, `witness-8db6a43a.json`, `witness2-8db6a43a.json`
**Tooling installed/upgraded:** none (node v24.21.0 on PATH; no pacman/uv/npx transaction was needed)

---

## 0. Verdict

* **Target:** counter `90118040…f6d76` (git HEAD `211962dc`, `freeze.txt` and `claims.json` all agree),
  battery `7371dffa…6ea04` (**102** cases), receipt `9107fce0…0f52` (nonce `tabi-r80-l1-211962dccb61`,
  7 legs, fixture `97374b43…51c2`), prior set with probes 1-4. Baseline: counter **clean (57 checks)**,
  battery **exit 0, 102/102 cases, coverage declared 57 / covered 57, uncovered [], unknown []**.
* **123 independent mutants** (119 apply to the D6 counter; 4 targeted the `gapRule` variable that D6
  removed). **22 killed by refusal cases, 2 killed by the honest must-accept case, 95 survivors,
  0 crashed.**
* **84 of the 95 survivors have an executed witness** — a battery case of that shape kills the mutant
  (pristine refuses with the expected id, the mutant no longer lists it). The other **11** are classified
  as control, equivalent, stricter-than-pristine, unreachable under the frozen plan, unobservable, or
  subsumed, each with the reason (section 5b).
* The D6 replay rule is **pair-only** (`refused: np > 0 && absMatched >= absNeed`). Three of my mutants
  that used to attack the gap side (`replay-gapfrac-raised`, `replay-gapmin-raised`,
  `replay-gapneed-floor`) are now **equivalent**: `GAP_MIN`/`GAP_FRAC`/`gapNeed` feed only the reported
  `limit` block. That is consistent with the claim's rewritten limit text, and it is the reason the
  constant-offset escape is now the stated limit rather than a defect.
* The D5 inconsistency I measured earlier (pinned counter `f22db0ac` **refusing** the then-committed
  receipt, battery failing 100/103, kill power vacuous) is **resolved by D6**; it is recorded in section
  6 because it explains why the instrument moved and because the same failure mode — a must-accept case
  failing — silently converts any kill-power run into a vacuous one.

---

## 1. Target and digests at run time

| Instrument | Digest | Consistency |
|---|---|---|
| `scripts/check-showpicker-r80.mjs` | `901180407c3719170a50ef16475e4f216dd7083f63960036f6320f7dcf9f6d76` | HEAD `211962dc` = `freeze.txt` = `claims.json` pin |
| `scripts/negatives-showpicker-r80.mjs` | `7371dffa4f90141d4f3b30673321682dbd3426cbc30f5a73f82a0bd25076ea04` | HEAD = `freeze.txt` = `claims.json` pin; 102 cases |
| `scripts/kill-power-r80.mjs` | `45d71e59463c871716222bde045a4c82070ea031daed267f8f338f52bcadf161` | HEAD = `freeze.txt`; 80 mutants |
| receipt under test | `9107fce0c9a5f8c97287ff0ebc334183b06df01d00ac970b6dbbd45465ff0f52` | nonce `tabi-r80-l1-211962dccb61`, fixture `97374b43…51c2` |
| prior set | probes 1-4 (`controls/c1/prior-set.txt`) | frozen |

`sha256sum -c freeze.txt` at snapshot time (19:41 local): the **counter and battery entries verified OK**; at 19:44 the C2 instrument `check-record-drift-r80.mjs` no longer matched its freeze entry (edited by another seat after my snapshot; outside this seat's target).

---

## 2. Method

* **Mutant set:** 123 semantic edits of the counter, written independently of `kill-power-r80.mjs`
  (`mutants.json`). Each is a real weakening: dropped conjunct, flipped comparison, widened tolerance,
  accepted extra value, skipped binding. Coverage: identity/run binding 16, plan/leg records 11,
  contexts 3, send log 5, plan calls 3, CDP event log 6, page events 7, law checks 24,
  host/teardown/server 10, run window/replay 18, prior-set walk 9, CLI guards 5, shared helpers 6,
  control 1.
* **Overlap disclosure:** 13 mutants replace the **identical source substring** as a frozen mutant but
  with a *different* weakening (`sameFromAsFrozen` in `mutants.json`); 21 weaken a different conjunct
  inside a check a frozen mutant also touches; **89 attack conjuncts the frozen list never touches**.
  The different weakening matters: `seq-monotonic-offby-one` (`v === i+1 || v === i+2`) **survives**
  while the frozen `seq-monotonic-loose` (`Number.isInteger`) is killed, because the battery's case only
  injects a gross violation (`seq = 99`).
* **Detector:** the frozen battery, unmodified, copied **beside** each mutated counter in its own
  `mut-<label>-<name>/` directory (the battery runs the counter by path). Kill criterion is
  **baseline-relative**: a mutant is killed only when a case that passes on the pristine counter now
  fails. A mutant that makes the `honest` must-accept case fail is recorded separately
  (`killedByHonestCase`): it is a kill, but by the accept side.
* **Lane isolation:** no lane file was edited. The counter, battery, prior set (probes 1-4) and receipt
  were snapshotted into a **mirror lane** `/fast/scratch/…/lane/tabi-shokunin/` so the counter's tree
  walk, the prior-set resolution and the battery's own mirror cases behave exactly as on the lane while
  the lane's live edits could not move the target mid-run. `--lane` points at the mirror; the receipt's
  `lane` field still matches the basename.
* **Concurrency:** 8 parallel batteries (each serialises its own 102 counter runs). Wall time 55 s for
  123 mutants.

---

## 3. Results

```
mutants 123 | applied 119 | killed 22 | killedByHonestCase 2 | survived 95 | crashed 0 | unapplied 4
baseline: exit 0, cases 102, failed 0, coverage 57/57
```

**Killed by a refusal case (22):** `argv-length-only`, `cancel-one-allowed`, `devtools-port-int`,
`dismiss-result-any`, `event-quantum-ts-dropped`, `exempt-unmatched-one`, `fixture-descriptors-ids-only`,
`frame-binding-parent-any`, `host-node-any`, `leg-order-sorted`, `outside-one`, `plan-frozen-names-only`,
`receipt-fields-superset`, `replay-absneed-floor`, `replay-frac-raised`, **`replay-refused-strict-gt`**
(`>=` → `>`), `replay-skip-small-priors`, `run-window-ceiling-raised`, `run-window-floor-lowered`,
`schema-extra-r79`, `trust-pointer-first-dropped`, `unparsable-one`.

The exact-threshold bracket now kills the `>=` → `>` flip and the `Math.floor(absNeed)` widening — the
D5 bracket repair did its job.

**Killed by the honest must-accept case (2):** `intercept-twice-count-dropped` (twice-leg `want` 2 → 1)
and `replay-tol-widened` (`TOL` 0.05 → 2 makes the honest receipt match a prior). Both make the counter
refuse the honest receipt.

**Unapplied (4):** `gaprule-never`, `gaprule-prior-one-gap`, `gaprule-own-one-gap`,
`gaprule-or-accepted` — they targeted the `gapRule` variable that D6 removed.

**Survivors (95): 84 witnessed, 11 classified.**

### 3a. Witnessed survivors — the battery has no case of this shape

Each witness was executed: the **pristine** counter refuses with the expected id and the **mutant** no
longer lists it (so a case with that `expect` and the other firing ids in `alsoAllowed` would kill it).
Full transcripts in `witnesses-d6.json`.

| Mutant (weakening) | Witness (receipt / invocation edit) | Expected id |
|---|---|---|
| `nonce-shape-unbounded` (`{4,48}` → `+`) | nonce `tabi-r80-` + 60×`a`, `--expect-nonce` the same | nonce-shape |
| `driver-pin-prefix` (first 32 hex) | pin with the last 32 hex zeroed | driver-pin |
| `fixture-hash-prefix` (first 8 hex) | fixture sha with the last 56 zeroed | fixture-hash |
| `fixture-child-hash-any` | `fixture.child.sha256 = "zz"` | fixture-hash |
| `fixture-keys-open` | `fixture.extra = 1` | fixture-hash |
| `fixture-viewport-any` | `fixture.viewport = {1,1}` | fixture-hash |
| `frame-tree-parent-any` | `frameTree.mainFrameParentId = "X"` | frame-tree |
| `host-cdp-product-dropped` | `host.cdpProduct = "Chrome/999…"` | host-chromium |
| `host-cdp-protocol-dropped` | `host.cdpProtocolVersion = "9.9"` | host-chromium |
| `lane-prefix-accepted` | `lane = "tabi"` | lane |
| `ports-floor-lowered` (≥1024 → ≥1) | `ports.http = 80` + origin/navigate/frameNavigated rewritten | ports-declared |
| `ports-http-origin-dropped` | `fixture.origin = "http://127.0.0.1:1"` | ports-declared |
| `leg-records-wait-any` | `chooserWaitMs = 99999` | leg-records |
| `leg-records-arm-error-dropped` | `armError = {code:"x",message:"y"}` | leg-records |
| `leg-records-trigger2-error-dropped` | `trigger2Error = {code:"x",message:"y"}` | leg-records |
| `leg-records-kind-dropped` | `kind = "other"` | leg-records |
| `leg-marks-grid-dropped` | a mark at `pre + 1.25` (off the 0.1 ms grid, order kept) | leg-marks |
| `leg-marks-monotonic-dropped` | a mark earlier than its predecessor | leg-marks |
| `leg-marks-start-dropped` | first mark renamed `begin` | leg-marks |
| `num-finite-dropped` | `closedAt` written as the raw literal `1e999` (parses to Infinity) | leg-marks |
| `context-default-dropped` | child context `isDefault = false` | context-binding |
| `context-mainframe-dropped` | disabled-leg child context `frameId = mainFrameId` | context-binding |
| `context-unexpected-id-dropped` | a non-cross leg `childContextId = 5` | context-binding |
| `cdp-aftersendid-any` | cross-leg open `afterSendId = priorReleaseId + 0.5` | cdp-event-log-closed |
| `cdp-nav-count-lowered` (`!== 1` → `< 1`) | duplicate the `frameNavigated` event | cdp-event-log-closed |
| `cdp-open-keys-open` | an extra key on an open event's params | cdp-event-log-closed |
| `cdp-open-mode-any` | cross-leg open `mode = "weird"` (mode-law skips cross legs) | cdp-event-log-closed |
| `event-window-order-dropped` | swap two events' `at` inside the window | event-leg-window |
| `event-window-start-leg-dropped` | an event with `leg = "start"` | event-leg-window |
| `seq-monotonic-offby-one` | `seq = 2` at index 0 (equals `i+2`) | seq-monotonic |
| `leg-shape-opened-dropped` | cross-leg open `mode = "selectMultiple"` | leg-sp80-cross-origin |
| `gesture-ret-dropped` | `webkitdirectory.showPicker.ret = "x"` | gesture-law |
| `activation-hasbeen-dropped` | `activationBefore.hasBeenActive = false` | activation-law |
| `deferred-ret-dropped` | `deferredResult.ret = "x"` | deferred-law |
| `cross-shape-dropped` | `childEvents[2].type = "mouseup"` | cross-origin-law |
| `cross-childlate-dropped` | `childLate = 1` | cross-origin-law |
| `cod-childlate-dropped` | `childLate = 1` | cross-origin-disabled-law |
| `no-selection-dismiss-state-dropped` | answer leg `stateAfterDismiss.s = []` | no-selection-law |
| `plan-intercept-id-dropped` | `interceptSendId = 999` | plan-calls |
| `plan-dismiss-id-dropped` | `dismissSendId = 999` | plan-calls |
| `plan-prior-ids-dropped` | `priorReleaseId = priorPressId` | plan-calls |
| `send-navigate-url-dropped` | send-log navigate url → `127.0.0.1:1` | send-log-allowlist |
| `send-once-dropped` | append a second `Browser.getVersion` send | send-log-allowlist |
| `send-prologue-dropped` | swap `Page.enable` / `Runtime.enable` in the prologue | send-log-allowlist |
| `send-params-any` | `Page.enable` params = `null` | send-log-allowlist |
| `argv-browserid-any` | `devtoolsListening.browserId = "zz"` | host-argv |
| `argv-stderr-dropped` | `stderrHead` without the devtools line | host-argv |
| `argv-token-shape-any` | `launchToken = "zzzzzzzzzzzz"` + matching profile name | host-argv |
| `teardown-curl-any` | `postKillCurl.devtools = 0` | teardown-closure |
| `teardown-probes-any` | `portProbes.devtools = "open"` | teardown-closure |
| `server-status-any` | `/` entry `status = 500` | server-log-binding |
| `server-root-count-widened` | a second `/` entry with the same run | server-log-binding |
| `child-server-status-any` | `/child.html` entry `status = 500` | child-server-log-binding |
| `replay-token-shape-any` | `launchToken = "zzzzzzzzzzzz"` + matching profile name | replay-launch-token |
| `replay-browser-unique-any` | two legs share one `browserId` | replay-devtools-url |
| `walk-error-skipped` | a directory under `.ufo/waves/round-80/` chmod 000 | prior-set-complete |
| `unparsable-json-only` (drop the `{`-prefix test) | a truncated **non-`.json`** file whose first byte is `{` and which quotes the r80 receipt schema | prior-set-unparsable |
| `unparsable-brace-only` (drop the `.json` test) | a truncated **`.json`** file that does **not** start with `{` and quotes the schema | prior-set-unparsable |
| `unparsable-and-joined` (`\|\|` → `&&`) | same as above | prior-set-unparsable |
| `prior-schema-string-dropped` (schema test → `true`) | an unparsable `.json` that does **not** quote the schema (accept-side witness: pristine clean, mutant refuses) | prior-set-unparsable |
| `cli-pin-hex-dropped` | `--expect-driver-sha256 zz` | usage (exit 2) |
| `cli-fixture-hex-dropped` | `--expect-fixture-sha256 zz` | usage (exit 2) |
| `cli-exempt-hex-dropped` | `--tree-exempt-sha256 zz` | usage (exit 2) |
| `cli-tree-exempt-path-accepted` | `--tree-exempt <path>` (the round-77 routed defect 3 shape) | usage (exit 2) |
| `prior-set-empty-ok` | `--prior-set` an empty file | prior-unreadable (exit 2) |
| `answer-files-any` | `answer.files = ["other.txt"]` | answer-law |
| `answer-basename-any` | `setParams.files = ["/x/other.txt"]` (+ the send log's params) | answer-law |
| `answer-setparams-count` | two files (first keeps the answer basename) | answer-law |
| `answer-seterror-dropped` | `setError = {code:1,message:"x"}` | answer-law |
| `answer-setresult-any` | `setResult = {x:1}` | answer-law |
| `answer-read-count` | a second `read` event | answer-law (also trips leg-shape) |
| `answer-svalue-any` | `stateAfter.sValue = "x"` | answer-law (also trips leg-shape) |
| `cdp-multi-open-widened` | three opens on one leg | cdp-event-log-closed |
| `cross-count-widened` | two opens on the cross leg | cross-origin-law |
| `deferred-count-widened` | two opens on the deferred leg | deferred-law |
| `event-istrusted-any` | `isTrusted = "yes"` | event-types |
| `event-seq-num` | `seq = 1.5` | event-types |
| `intercept-deferred-ok-any` | `deferredResult = {ok:false,…}` | intercept-law |
| `no-selection-keys-open` | an extra key on `stateAfter` | no-selection-law |
| `typed-files-any` | `files = "x"` | event-types |
| `typed-target-any` | `target = 5` | event-types |
| `typed-x-any` | `x = "x"` | event-types |
| `err-code-any` | `priorClickError = {code:"x",message:"y"}` | leg-records |
| `err-keys-open` | `priorClickError = {code:null,message:"y",extra:1}` | leg-records |

### 3b. Survivors with no witness (11) — each with the reason

| Mutant | Status | Reason |
|---|---|---|
| `control-noop-comment` | **control** | semantic no-op; survives by design and proves the battery's exit code is not vacuous (baseline 102/102 clean) |
| `nonce-expected-case-insensitive` | **equivalent** | a case-only nonce difference is already rejected by `nonce-shape` (`[a-z0-9-]`) |
| `replay-refuse-guard-dropped` (`np>0` / `gp>0` dropped) | **equivalent** | every prior carries 23 events; the guard is dead |
| `replay-refused-guard-dropped-d6` (`np>0` dropped) | **equivalent** | same |
| `replay-gapfrac-raised` (`GAP_FRAC` 0.75 → 0.95) | **equivalent (D6)** | the gap side is reporting-only: `GAP_FRAC` feeds the printed `gapNeed`, never the verdict. My D5 witness for it (4 gaps, 3 matching, `absMatched 11`) now shows the pristine counter **accepting** — the gap fingerprint is no longer part of the rule |
| `replay-gapmin-raised` (`GAP_MIN` 50 → 500) | **equivalent (D6)** | `GAP_MIN` only shapes the reported gap list |
| `replay-gapneed-floor` (`ceil` → `floor`) | **equivalent (D6)** | `gapNeed` is reporting-only |
| `self-real-dropped` (identity self-exemption dropped) | **not a weakening** | makes the counter *stricter*; the battery always passes `--tree-exempt-sha256 <receipt>`, so the identity branch is dead under the battery's invocation. It is still untested behaviour: a run without the content exemption would refuse the receipt under test |
| `send-min-length-lowered` (`log.length < 10` → `< 1`) | **unobservable** | a <10-send log makes `plan-calls` throw (`log.find(...).id` of `undefined`) for **both** pristine and mutant; the length guard is a crash guard, not a rule |
| `twice-first-ok-dropped` | **subsumed** | `gesture-law`'s `SP_LAW['sp80-twice-gesture']` checks the same field; the mutant still refuses with the same ids |
| `mode-hardcoded-single` (`wantMode` hardcoded) | **unreachable** | no leg in the frozen PLAN targets the `multiple: true` input (`targets s,d,k,dis,s,s,s`), so the `selectMultiple` branch of `mode-law` cannot fire on any receipt the plan can produce |

---

## 4. Routed defects for r81, ordered by how much of the claim text they leave unbound

1. **`mode-hardcoded-single` — the `selectMultiple` law is unreachable.** `mode-law` encodes
   `multiple → selectMultiple`, but no leg targets the `m` input, so the branch is dead. Either add a leg
   (a plan change, frozen for r80) or drop the branch from the claim's law list.
2. **`walk-error-skipped` — an unreadable directory in the walked trees is silently skipped.** One
   `chmod 000` defeats the only defence against an unlisted receipt. Witness executed.
3. **`cli-tree-exempt-path-accepted` — the round-77 routed defect 3 guard has no case.** Deleting the
   `--tree-exempt` refusal survives; a path-shaped exemption is accepted again.
4. **`prior-set-empty-ok` — an empty prior set is accepted.** With no priors the replay rule is vacuous.
5. **`unparsable-json-only` / `unparsable-brace-only` / `unparsable-and-joined` / `prior-schema-string-dropped`
   — the new unparsable gate has four untested conjuncts.** A truncated `.json` without a leading `{`, or
   a truncated non-`.json` quoting the schema, escapes the scan; and any unparsable `.json` is flagged
   regardless of content once the schema test is dropped. Witnesses executed for all four.
6. **`nonce-shape-unbounded` — the `{4,48}` length bound is untested.** The existing case only tests the
   character class (uppercase).
7. **`driver-pin-prefix` / `fixture-hash-prefix` — the pins are only tested with a fully-wrong value.**
   A 32-hex / 8-hex prefix forgery passes both.
8. **`event-window-order-dropped` — the in-leg event ordering conjunct is unbracketed.** The window case
   only moves an event before `pre`.
9. **`leg-marks-grid-dropped` / `leg-marks-monotonic-dropped` / `leg-marks-start-dropped` — the mark
   grid, ordering and name anchors are untested** (`leg-marks` only tests `lateAfterClose`).
10. **`context-default-dropped` / `context-mainframe-dropped` / `context-unexpected-id-dropped` — three
    context conjuncts are untested** (the battery covers the child count and the `childContextId` match
    only).
11. **`cdp-open-keys-open` / `cdp-open-mode-any` / `cdp-aftersendid-any` / `cdp-nav-count-lowered` — the
    open-event shape, the mode enum and the integer `afterSendId` are only reachable through
    `mode-law`/`leg-shape`, which the battery's cases trip simultaneously.**
12. **`answer-*` (7 conjuncts) — `files`, `setError`, `setResult`, the `setParams.files` count, the
    basename, `sValue` and the single-`read` count are untested.** The battery's `answer-law` cases only
    touch bytes, node id, upload and state.
13. **`plan-*-id` (3) and `send-*` (4) — the send-id coherence for intercept/dismiss/prior-click, the
    prologue order, the "exactly once" rule, the navigate URL binding and `params` being an object are
    untested.**
14. **`typed-*` / `event-*` — the per-field type gates are only tested through `leg-shape`, which fires
    at the same time.** Cases with `alsoAllowed` for the leg id would isolate them.
15. **`teardown-*` (2), `server-*` (3), `argv-*` (3), `fixture-*` (4), `host-*` (2), `ports-*` (2),
    `leg-records-*` (4), `err-*` (2), `num-finite-dropped`, `frame-tree-parent-any`,
    `lane-prefix-accepted`, `seq-monotonic-offby-one`, `leg-shape-opened-dropped`, `gesture-ret-dropped`,
    `activation-hasbeen-dropped`, `deferred-ret-dropped`, `cross-shape-dropped`, `cross-childlate-dropped`,
    `cod-childlate-dropped`, `no-selection-dismiss-state-dropped`, `no-selection-keys-open`,
    `intercept-deferred-ok-any`, `cdp-multi-open-widened`, `cross-count-widened`,
    `deferred-count-widened`, `event-istrusted-any`, `event-seq-num`** — all have executed witnesses in
    3a; each is one battery case away from being killed.

**Robustness note (not a coverage defect):** the counter is not total on adversarial input — a send log
with fewer than 10 entries throws in `plan-calls` (`log.find(...).id` of `undefined`), for pristine and
mutant alike. A guard would turn the refusal into a finding instead of a crash.

---

## 5. History — the D5 target (superseded, kept because it explains the instrument move)

At 19:30 local the frozen instrument set was inconsistent with the then-committed receipt:

* counter `f22db0ac` (then HEAD `53ecca84`, `freeze.txt`, `claims.json`) **exited 1** on receipt
  `f3a8cdf4` (nonce `tabi-r80-l1-53ecca8411dc`) with `replay-event-timeline`: prior #1 (probe2, 1 gap)
  `absMatched 0`, `gapMatched 1 >= gapNeed 1` — the gap side alone.
* the battery then failed **100 of 103** cases (the `honest` must-accept case inherited the refusal), so
  the frozen `81/81 killed` was an exit-code artifact; my semantic no-op control was "killed" on that
  counter and survived on the repaired one.
* the working tree already held the repair (`8db6a43a`, `gapRule = gp >= 2 && ownGaps.length >= 2`,
  uncommitted and unpinned): counter clean, battery allOk (103 cases), and 118 mutants gave 25 killed,
  3 killed-by-honest, 90 survived, 0 crashed.

D6 (`211962dc`) resolved it by making the gap side **reported, never a refusal**, dropping the
gap-only battery case (103 → 102) and rewriting the claim's limit text to state the constant-offset
escape. The D5 numbers are preserved in the seat dir so the change is auditable; the D6 numbers above are
the ones that describe the frozen instrument.

---

## 6. Reproduction

```bash
mkdir -p /fast/scratch/hyaku/tabi-r80/R80Mut1 && cd $_
sha256sum instruments/check-showpicker-r80.mjs        # 90118040…f6d76  (D6, frozen)
sha256sum instruments/negatives-showpicker-r80.mjs    # 7371dffa…6ea04  (D6, frozen, 102 cases)
sha256sum instruments/check-showpicker-r80.8db6a43a.mjs   # D5 repair, superseded
sha256sum instruments/check-showpicker-r80.f22db0ac.mjs   # D5 pin, superseded
node harness.mjs    --counter instruments/check-showpicker-r80.mjs --label d6 --out results-d6.json
node witnesses.mjs  --counter instruments/check-showpicker-r80.mjs --label d6 --out witness-d6.json
node witnesses2.mjs --counter instruments/check-showpicker-r80.mjs --label d6 --out witness2-d6.json
node witnesses3.mjs --counter instruments/check-showpicker-r80.mjs --label d6 --out witness3-d6.json
```

The harness builds its own mirror lane and its own pristine baseline, and deletes each mutant directory
after the run. No file in the lane or in the walked trees was modified by this seat; the only write
inside the lane is this report.

## 7. Limits of these results

* The results describe the **D6 counter `90118040`** and the **D6 battery `7371dffa`**. If the L1 re-edits
  either, the mutant `from` strings must be re-checked (`mutants.json` carries them verbatim; the harness
  reports `unapplied` when a `from` no longer occurs exactly once — that is how the four `gapRule`
  mutants were caught).
* The receipt is the D6 run (`tabi-r80-l1-211962dccb61`). The battery's cases mutate the receipt
  generically; the mutant outcomes depend on the receipt's shape only through the per-leg shapes and the
  replay pair timeline, both fixed by the frozen driver and plan.
* A survivor is a coverage finding, not permission to change the contract. Nothing here proposes
  amending the predicate, the counter, the pins, the priors, the thresholds or the kill rule; every
  finding attacks them and names the case that would bind them.
