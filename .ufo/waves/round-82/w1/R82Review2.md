# R82Review2 — battery & kill-power attack (read-only)

## Reproduction (all from clean scratch, copied back to seat dir)

Real receipt: `corpus/evidence/round82/chromium-showpicker/receipt.json`
(nonce `tabi-r82-scored1`, driver `2085c2a7…`, fixture `7373c608…`, 10 legs, 64 checks).

- Counter on real: `node …/check-showpicker-r82.mjs --lane <lane> --receipt <real> --expect-driver-sha256 2085c2a7… --expect-nonce tabi-r82-scored1 --expect-fixture-sha256 7373c608… --prior-set <prior-set.txt> --tree-exempt-sha256 <sha256 of real receipt> --json` → **exit 0, verdict clean, 64 checks, findings []**.
- Battery: `node …/negatives-showpicker-r82.mjs --lane <lane> --real <real> … --work <scratch>/battery --json` → **exit 0, cases 70, failed 0, coverage declared 64 / covered 64 / uncovered []** (`battery.json`).
- Kill-power: `node …/kill-power-r82.mjs --lane <lane> --real <real> … --work <scratch>/killpower --json` → **exit 0, mutants 46, killed 46, survived 0, crashed 0** (`kill.json`).
- Verify-kill (my re-run, same 46 mutants, mutant counter judged against the real receipt AND the mutant battery): **all 46 mutant counters stay clean on the honest receipt, and every mutated battery fails exactly on its namesake case** (`verifykill.json`) — see §3.

Per-case counter output for every battery case file was re-measured independently (`percase.json`, script `measure.py`): for each case the exact finding-id list the counter emits was compared against the battery's declared `expect` + `alsoAllowed`.

## 1. Does every refusal case fail for the id it names?

**Yes, on the committed case set.** All 68 refusal cases (incl. the 3 prior-set walk cases, exercised via the mirror lane) exit 1 with the named id present, and (where `alsoAllowed` is declared) the emitted ids are within `expect ∪ alsoAllowed`. Full table in `percase.json`. Two observations, neither a false-pass:

- 7 cases declare `alsoAllowed` entries that **did not fire** on the committed receipt: `context-binding` (send-log-allowlist, cdp-event-log-closed), `cross-color-law` (intercept-law), `devtools-port-binding` (host-argv), `event-leg-window` (leg-sp82-accept-answer), `leg-order` (plan-calls, leg-marks, context-binding), `plan-frozen` (plan-calls), `teardown-closure` (host-argv). Over-permissive declarations — they can only weaken the battery, never inflate a pass — but they mean the battery's "no extra ids" claim is looser than the actual coupling. Not a kill-power hole: every `alsoAllowed` id that *did* fire is a genuine collateral of the same mutation.
- 13 `leg-*` cases (one per leg) carry the `LEG_ALSO[n]` entries (`no-selection-law`, plus `webkitdirectory-answer-law` / `accept-answer-law` for the two answer legs). My parser could not attribute that table to the `add('leg-…')` call lines, but the counter output confirms both facts: e.g. `leg-sp82-webkitdirectory-answer` emits `['leg-sp82-webkitdirectory-answer','webkitdirectory-answer-law','no-selection-law']`, `leg-sp82-cross-origin-color` emits `['leg-sp82-cross-origin-color','no-selection-law']`, `leg-sp82-accept-answer` emits `['leg-sp82-accept-answer']` only. The battery's own run reports **failed 0**, so the declared table matches; the collateral is real (mutating `stateAfter` trips the leg-shape *and* the no-selection/answer law), not a cover story.
- `ports-declared` declares 5 non-firing allowances (`fixture-hash`, `host-argv`, `devtools-port-binding`, `send-log-allowlist`, `cdp-event-log-closed`); the only collateral that actually fires is `context-binding`. `leg-order`'s 5 declared allowances: only `plan-frozen` and `leg-records` fire.

**No case passes by collateral-alone**: in every refusal case the expected id is itself in the emitted list (checked case-by-case, `percase.json` → `ids` contains `exp` for all 68).

## 2. Are the four extra cases redundant?

No. Each kills something the base case it resembles does not:

- **`order-law-message` vs `order-law`** — NOT redundant, and the pair is well-designed. Both mutate the same field to `InvalidStateError`, but in different ways: `order-law` sets `message:'x'` (also wrong), `order-law-message` sets `message:'wrong message'`. Isolated probes: setting the **correct** `IMMUTABLE_ERR` message (`Failed to execute 'showPicker' … cannot be used on immutable controls.`) makes the counter **exit 0** (clean); any other message (including `''`) exits 1 with `['gesture-law','order-law']`. So the message check is load-bearing — without `order-law-message` nothing distinguishes a correct-message forgery from a wrong-message one. (`gesture-law` fires in both because the parent `showPicker` law is the same object.)
- **`activation-before` vs `activation-law`** — NOT redundant. `activation-law` mutates `activationAfter`; `activation-before` mutates `activationBefore` to `{isActive:false,hasBeenActive:false}`. Both exit 1 with `activation-law` only, on different fields. The counter checks `same(leg.activationBefore,want[0]) || same(leg.activationAfter,want[1])` jointly, so both probes are needed; the kill-power mutants `activation-before-dropped` / `activation-after-dropped` confirm each side is independently load-bearing (each killed by exactly its case).
- **`cross-nonfile-chooser` vs base `cross-origin-nonfile-law` / `intercept-law`** — NOT redundant. Pushing a `Page.fileChooserOpened` into the cross-origin leg's event log yields `['cross-origin-nonfile-law','intercept-law','leg-sp82-cross-origin-nonfile','plan-calls']`. `intercept-law` alone does NOT cover this: the chooser's `afterSendId` is set to `priorReleaseId` (a legal binding), so `cdp-event-log-closed` stays clean — the chooser is *well-formed*, it is just *illegal* for this leg. The base `cross-origin-nonfile-law` mutation (flipping `parentCrossAccess`) instead yields `['cross-origin-nonfile-law']` only. The chooser probe exercises the "no chooser opened" conjunct of `cross-origin-nonfile-law` in isolation. Kill-power confirms: `cross-nonfile-nochooser-dropped` is killed by `cross-nonfile-chooser` alone.
- **`cross-nonfile-result` vs base `cross-origin-nonfile-law`** — NOT redundant. `childResult={ok:true,ret:'undefined'}` yields `['cross-origin-nonfile-law','intercept-law']`, while `childResult={ok:false,name:'SecurityError',message:'x'}` yields `['cross-origin-nonfile-law']` only. The base case in the battery perturbs `parentCrossAccess`, not `childResult` at all; the result probe is the only case that flips the child-result conjunct. Kill-power: `cross-nonfile-result-dropped` killed by exactly this case. The sub-conjuncts were isolated individually (parentCrossAccess, childActivationBefore/After, childEvents, childLate each → `['cross-origin-nonfile-law']` alone), so every conjunct of the law is reachable and none is dead.

## 3. Are any of the 46 mutants semantic no-ops?

**No.** "Killed" in `kill-power-r82.mjs` means the *mutated battery* exits 1 — that alone could be triggered by a mutant that merely breaks an accept case or a different rule. My verify-kill re-run closes that gap: for all 46 mutants the mutant counter **remains clean (exit 0) on the honest receipt**, so no mutant is a "kill by breaking honest runs"; and the mutant battery fails on **exactly the namesake case(s)**:

- 43 mutants → exactly 1 failing case, the case named for that rule (e.g. `schema-accepts-any→schema`, `replay-browser-any→replay-devtools-url`, `dismiss-law-any→dismiss-law`).
- `leg-shape-seq-dropped` → 3 failing cases (`leg-sp82-same-origin-nonfile-disabled`, `leg-sp82-accept-answer`, `leg-sp82-click-while-open`), i.e. the three legs whose battery mutations hit `seq/files/xy` rather than `state`. The other 7 legs' mutations hit `state` and stay caught — consistent with the mutant keeping the `state` conjunct.
- `order-same-error-dropped` → 2 failing cases (`order-law`, `order-law-message`), the two cases that exercise that conjunct.

No mutant survives, none crashes, none is an `unapplied` rewrite. The suspects I inspected textually (`intercept-count-dropped` removing the only push into `intBad`; `mode-law-any` → `if(false)`; `dismiss-law-any` rewiring the dismiss filter; `leg-shape-seq-dropped` narrowing to `state`) are all genuine weakenings with observable behavioural differences, each confirmed killed by its own case above.

## 4. Are any `alsoAllowed` lists hiding a real finding?

**No — with the caveat in §1.** Every `alsoAllowed` id that fires is a true collateral consequence of that case's mutation (verified per-case in `percase.json`: e.g. `cancel-law` → `event-leg-window, leg-sp82-accept-answer, dismiss-law` all genuinely caused by pushing the extra cancel event; `intercept-law` → `plan-calls, leg-sp82-cross-origin-nonfile-disabled, order-law` all caused by the extra opened-chooser event). Every collateral is declared, none is silently absorbed: the battery's pass criterion (`ids ⊆ expect ∪ alsoAllowed`) is checked against the counter's real output in my re-measurement, and the counter-side kill-power confirms the collaterals are not the *only* thing catching their cases — removing the primary rule always surfaces a namesake failure. The over-declared (non-firing) allowances are looseness in the test, not hidden findings: they can never turn a real finding into a pass, because the counter still exits 1 and still lists the expected id.

## Verdict

Battery and kill-power hold under attack: 70/70 cases, 64/64 check coverage, 46/46 mutants killed on the right case, no no-op mutants, no redundant extra cases, no hidden findings. Residual softness (not a predicate violation): 7 cases over-declare `alsoAllowed` entries that never fire, so the battery's "no undeclared ids" guarantee is weaker than the actual coupling — worth tightening, not worth blocking. Tooling: no installs needed (node + python3 already present).
