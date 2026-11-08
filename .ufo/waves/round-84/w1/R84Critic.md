# R84Critic — round 84 w1, L1 falsifier (TabiR84 seat)

Axes: **coverage** (C1 new surface vs rescoring), **calibration** (C2 record-drift predicate scope), **provenance** (no-work reach + replay limit honesty).
Assignment: falsify, do not summarize. Commands run from fleet root with absolute lane paths unless noted; scratch `$HYAKU_SCRATCH/tabi-r84/R84Critic` (HYAKU_SCRATCH=/fast/scratch/hyaku). Lane copy under test is read-only; forgeries live in scratch.

## 1. Counter `limit` block + escape-minimum forgery

### Baseline (scored receipt, frozen pins)

Command:
```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-showpicker-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round84/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 \
  --expect-fixture-sha256 <scored fixture sha256> \
  --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --json
```
Output (exit 0): `verdict clean`, `checkCount 80`, `checks 80`, `findings []`.
`limit` block printed verbatim:
```json
{
  "tolerance": 0.05,
  "gapMin": 50,
  "ownEvents": 61,
  "ownGaps": 8,
  "perPrior": [
    {"priorEvents": 61, "priorGaps": 3, "absMatched": 0, "gapMatched": 0,
     "absNeed": 31, "gapNeed": 3, "escapeEvents": 31, "refused": false}
  ],
  "sentence": "refuse when absMatched >= ceil(0.5 * prior events); the escape minimum is priorEvents - absNeed + 1 moved events. The gap side is reported, not a refusal: this driver's fixed waits reproduce gap durations across honest runs, so a gap match is a driver artifact. A forger who moves fewer events but shifts EVERY event by a constant offset escapes this rule — that is the limit."
}
```
Code form (`check-showpicker-r84.mjs:663-670`): `absNeed = ceil(0.5*np - 1e-9)`, `refused = absMatched >= absNeed`, `escapeEvents = np - absNeed + 1`. For np=61: absNeed=31, escapeEvents=31. Frozen comment at lines 27–34 states the same.

### Forgery construction (scratch, constant offset +10.0 ms, 0.1-grid preserved)

Two bases, same offset so the test is legible:
- **Scored-copy**: exact copy of the scored 18-leg receipt, move exactly 31 events by +10.0 (suffix move preserving per-leg order: `sp84-multiple-mode`, `sp84-accept-mime-answer`, `sp84-click-while-open`, `sp84-second-chooser-answer` tails; first-31 prefix move broke `event-leg-window` with an order inversion, so the clean suffix was used).
- **Prior-copy**: exact copy of `prior1.json` (r84 probe4, nonce `tabi-r84-probe4`), move 0/30/31/32 events by +10. This isolates the replay rule: unmoved prior-copy has `absMatched=61`, so any `absMatched<31` after moving is the escape effect, not run-to-run jitter (baseline scored-vs-prior is already 0, so scored-copy alone cannot show the threshold).

Isolation note: a receipt outside the walked trees (`TREES=['.ufo/waves/round-84','corpus/evidence/round84']`) triggers `prior-set-complete` on the in-tree scored receipt, and `replay-launch-token`/`replay-devtools-url` fire on prior-copy forgeries. Results below quote the `replay-event-timeline` check, not the whole verdict, for exactly this reason; `--prior corpus/evidence/round84/chromium-showpicker/receipt.json` was added on the suffix runs to keep `prior-set-complete` from masking the replay verdict.

### Results

| Forged receipt | exit | `replay-event-timeline` | `limit.perPrior` (relevant prior) | finding ids |
|---|---|---|---|---|
| `forge-prior-0` (0 moved) | 1 | **False** | `priorEvents 61, absMatched 61, gapMatched 3, absNeed 31, gapNeed 3, escapeEvents 31, refused true` | nonce-expected, fixture-hash, replay-event-timeline, replay-launch-token, replay-devtools-url, prior-set-complete |
| `forge-prior-30` (30 moved) | 1 | **False** | `absMatched 31, refused true` | … replay-event-timeline … |
| `forge-prior-suffix30` (30 moved) | 1 | **False** | `absMatched 31, gapMatched 0, refused true` | nonce-expected, fixture-hash, replay-event-timeline, replay-launch-token, replay-devtools-url |
| `forge-prior-31` (31 moved) | 1 | **True** | `absMatched 30, refused false` | nonce-expected, fixture-hash, event-leg-window, replay-launch-token, replay-devtools-url, prior-set-complete |
| `forge-prior-suffix31` (31 moved) | 1 | **True** | `absMatched 30, gapMatched 0, refused false` | nonce-expected, fixture-hash, replay-launch-token, replay-devtools-url |
| `forge-prior-32` (32 moved) | 1 | **True** | `absMatched 29, refused false` | … (no replay-event-timeline) |
| `forge-scored-31` (scored+31 prefix, +10) | 1 | **True** | `absMatched 0, refused false` | event-leg-window, prior-set-complete |
| `forge-scored-suffix31` (scored+31 suffix, +10, + `--prior scored`) | 1 | **True** | both priors `absMatched 30/0`, `refused false` | replay-launch-token, replay-devtools-url |

**Measured escape: 31 events.** Moving 30 leaves `absMatched=31 ≥ absNeed=31` → refused; moving 31 drops to `absMatched=30 < 31` → `replay-event-timeline` passes. The threshold printed in `limit` is exactly where the counter flips. The counter therefore **refuses below the minimum and escapes at it** — the limit sentence is honest as a description of this one rule. It does not save a full forgery (identity/token checks and `prior-set-complete` still fire), and a constant-offset shift of *every* event escapes the rule with fewer than `escapeEvents` per‑event matches because no `(ts,at)` pair lands within 0.05 ms of the prior — the limit sentence admits this explicitly ("shifts EVERY event by a constant offset escapes this rule").

## 2. Cheapest no-work control: r83 receipt under the r84 counter

Command:
```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-showpicker-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round83/chromium-showpicker/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-l1-a5bdb15ec9a7 \
  --expect-fixture-sha256 7784c9dece0f5c7ad1911733281a8bd7337a8a5588799cbda9acc02f9a9e55fa \
  --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --json
```
- exit **1**, `verdict findings`, `checkCount 77`.
- Finding ids (48): `schema, nonce-shape, nonce-expected, driver-pin, plan-frozen, leg-order, leg-records, context-binding, send-log-allowlist, plan-calls, cdp-event-log-closed`, then 15 `leg-sp83-*` (every r83 leg unknown to the r84 `LEG_SHAPE`), `gesture-law, activation-law, cross-origin-nonfile-law, order-law`, `sp84-cross-origin-color-law` (and further sp84 law checks — full list in scratch `nowork-r83.json`), plus the same counter's law/plan ids. Re-running with the r84 fixture pin adds `fixture-hash` and keeps the same law failures.
- `limit` for the r83 receipt: `ownEvents 61, ownGaps 2`, `perPrior absMatched 0`, `refused false` — the no-work receipt is refused by identity/law/plan checks, not by the replay rule.

**Result: the r84 claim is out of the r83 receipt's reach.** The check count collapses to 77 (15 unknown-leg checks replace the 18 sp84 leg checks), and the refusals are exactly the generation-binding fields — schema `tabi-chrome-cdp-showpicker-r83` ≠ `tabi-chrome-cdp-showpicker-r84`, nonce `tabi-r83-l1-b6496e6f5d4f`, driver pin, and frozen plan/leg-order. This is a genuine no-work control: no receipt surgery reaches a pass, because the plan itself (18 legs with `sp84-` names) is frozen into 18 leg checks plus the law checks.

## 3. C2 predicate: which routed defects are NOT checked; can the counter pass with the r83 note uncorrected?

### Mapping: spot-check `## Routed defects` (8) vs `check-record-drift-r84.mjs` (10 claims)

| # | Routed defect (r83 spot-check §Routed defects) | Drift claim id | Checked? |
|---|---|---|---|
| 1 | accept-token correction in lesson + r83-note erratum | `r83-accept-correction` | Partial — lesson tokens only (`extensionToken && #accept/image/png && frontier`); **note path never read** |
| 2 | real-PNG correction in lesson + r83-note erratum | `r83-png-correction` | Partial — lesson tokens only; **note path never read** |
| 3 | Scout ledger polarity (`neutral` → `falsifies-wording`) | `falsification-scout` | Yes, via ledger OR lesson |
| 4 | Review2 re-pointing / cross-origin narrowing + battery witnesses | `falsification-review2` | Yes, via ledger OR lesson + witness grep on `negatives-showpicker-r84.mjs` |
| 5 | record counts (69/41, reverse, laws 7→8, knowledge, attack roles, defects, SKILL 153) | `record-counts` | **Loose** — gates only on `69 checks && 41 findings` (lesson) and `153 cases` (SKILL); `reverse`, `laws8` computed but `laws8` not gating: `claim('record-counts', noWork && skill153, ... ' laws8=' + laws8)` |
| 6 | r83 numbers + SKILL battery + knowledge count asserted | `r83-numbers` | **Loose** — gates only on `153 cases` in SKILL; knowledge expression is `|| true` (`const knowledge = ... \|\| true; // counted separately below` — nothing below checks it); lines 107–113 read `scored.counter` into `c` and never use it |
| 7 | census artifacts | `census-artifacts` | Yes — `exit=0` in start, `exit=0 && /tabi\s+ok/` in end |
| 8 | keep r83 instrument family as scored (74/74, 153/153, 50/50, 9/9), no change required | **none** | **NOT CHECKED.** No claim id asserts the retained family; `claim-count-stable` only counts ids |

Plus two extra ids (`r84-identity`, `r84-numbers`) which are r84 self-consistency, not routed-defect coverage. The file has zero references to `erratum`, `round-83.md`, or the knowledge-note path (`grep -n "erratum|round-83.md|knowledge.*round-83" check-record-drift-r84.mjs` → no match).

**Answer to the pointed question:** the entirely unchecked routed defect is **#8 (instrument family retained)**. Defects **#1 and #2 are half-checked** (lesson half only — the erratum half is never read). Defects **#5 and #6 are half-checked** (the gating subset passes while `laws8=false`, knowledge count, reverse-receipt, Gate/Source reconciliation are tolerated). Defect #7's `Gate 0/0/0/0 vs Sources 5/5` reconciliation is nowhere in the counter (`grep -n "0/0/0/0"` → no match).

### Scratch-mirror test: counter passes with the r83 note left uncorrected?

Mirror: `$S/mirror` contains only `scripts/check-record-drift-r84.mjs` (copied), `scripts/negatives-showpicker-r84.mjs` (witness), `.ufo/waves/round-84/claims.json`, `.ufo/waves/round-83/claim-falsification.tsv`, `SKILL.md` (with `84 cases` → `153 cases` patched in the mirror copy only), `SCORECARD.md`, `LOG.md`, `corpus/lessons/round-84.md` (synthetic token-correct lesson citing `tabi-r84-l1-a5bdb15ec9a7`), `.ufo/waves/round-84/scored/{counter-a,battery-a}.json` (copied) + synthetic `killpower-a.json` (`survived 0, crashed 0`), and `.ufo/waves/round-84/census/{start.txt,end.txt}` (end synthesized as `tabi ok\nexit=0` — the lane has no `end.txt`). **No `corpus/knowledge/` directory exists in the mirror at all** — the uncorrected r83 note is absent, not merely uncorrected.

Run: `node $S/mirror/scripts/check-record-drift-r84.mjs --lane $S/mirror --json` → **exit 0, `mismatches 0`, `failed []`** (10/10 pass), including `record-counts ok:true` with `laws8=false` in the detail and `r83-numbers ok:true` with detail `skillBattery153=true` only.

**Conclusion: yes, the counter passes with the r83 note left uncorrected** — by construction it cannot distinguish corrected from uncorrected, because no path it reads can contain the erratum. The claims `legs.b` ("corrections live in `corpus/lessons/round-84.md` **and** the r83 note's append-only erratum") is **stronger than the predicate**: a lane that writes only the lesson, never the erratum, satisfies `check-record-drift-r84.mjs` exit 0 while failing leg b as written. The lane at freeze has neither yet: `corpus/lessons/round-84.md` does not exist, and `chromium-showpicker-runtime-round-83.md` ends with the uncorrected `Remaining input types (tel, search, text) are carried from S219 enumeration, not measured` (no erratum). Live drift run against the lane: exit 1, 8 mismatches (`r83-accept-correction, r83-png-correction, falsification-scout, record-counts, r83-numbers, census-artifacts, r84-identity, r84-numbers`; `falsification-review2` passes today because the ledger row already reads `falsifies-wording`, and `claim-count-stable` is tautological).

## 4. Is the C1 axis label honest — new surface, not rescoring?

- Plan delta (evidence, not label): r83 receipt has 15 legs (`sp83-*`); r83→r84 rename shows every renamed r83 leg present in the r84 18-leg plan (`r83 legs renamed ⊆ r84 legs`), and the r84-only legs are exactly `sp84-cross-origin-tel, -search, -text` (legs 13–15 of 18). The three new legs carry `childResult` = SecurityError `showPicker() called from cross-origin iframe.`, **0** `Page.fileChooserOpened` events — the SecurityError-only measurement the `limit` sentence names ("the tel/search/text legs measure the SecurityError only (no chooser opens), not the dialog contents").
- Not a rescoring: the scored receipt is a fresh run, not `prior1.json` relabbed. `prior1.json` is r84 probe4 — the same 18-leg plan, a different nonce — and serves as the replay prior. Scored-vs-prior `absMatched=0` on `ownEvents=61`; per-leg `launchToken`, `childEvents` timestamps, and `childServerLog` run bindings differ (e.g. tel leg: scored token `0c5d7c7b96d8` vs probe4 `5e2241724bd8`; scored `at 141.9/143.6` vs probe4 `142.6/144.6–144.7`) while the law fields (`childResult`, activation pair, `childLate`) agree — the agreement is the law reproducing, the timestamps/tokens prove a distinct execution. The `Limit`'s "backendNodeId relabel inside limit by design" is not exercised by the new legs (they open nothing).
- Caveat carried forward honestly: the r83 note's `Frontier` names `type=tel/search/text cross-origin legs` and `Remaining input types (tel, search, text) are carried from S219 enumeration, not measured` — so legs 13–15 close a named undecided surface with the same SecurityError law as the measured `number/range` pair, but they measure the *error*, not the dialog contents. The claims `type` and `limit` say exactly this. **The `coverage` label is honest as new-surface coverage, provided it is read as SecurityError coverage, not dialog coverage.**

## Counterexample, evidence, impacted axes, smallest safe correction

- **Counterexample (calibration):** synthetic mirror lesson + absent erratum + `laws8=false` + absent knowledge-note → drift exit 0 (10/10). The predicate covers the lesson half of defects 1/2/5/6 and none of defect 8, while `claims.json` C2 `legs.b` promises both halves.
- **Evidence:** mirror run above; `grep` shows no `erratum`/note reads; live lane drift fails only because the lesson does not exist yet and the ledger's Review2 row already matches. Kill-power/scored `killpower-a.json` in the lane is empty (0 bytes), so `r84-numbers` currently fails on `battery=null/null kp=null` even with the lesson present — the lane must land that artifact.
- **Impacted axes:** **calibration** (C2 predicate narrower than its claim; false-pass reachable now). **Coverage** is not harmed by this: C1's no-work control and the 18-leg plan hold; the only C1 softness is the documented SecurityError-only scope, which the label discloses.
- **Smallest safe correction (does not amend any predicate, counter, pin, prior, threshold, or kill rule):** land the erratum in the r83 note's file and the full lesson now, so the claims as written become true in fact; record in the lane report that `check-record-drift-r84.mjs` verifies only the lesson/SKILL/ledger/census halves (defect 8 and the erratum halves are out of predicate). Do not "fix" the counter post-freeze — that would invalidate the frozen pins. Any predicate widening belongs to a future round's freeze.

## Repro receipts (scratch; delete per seat contract after copy)

- Baseline / forgeries / no-work / mirror outputs kept under `$HYAKU_SCRATCH/tabi-r84/R84Critic/` (`baseline.json`, `forge-*.json`, `nowork-r83*.json`, `drift-live.json`, `mirror/`). Scratch was removed after writing this report per contract (receipts quoted above).
- Tools used: system `node` (counter runtime), `python3`, `cat/ls` — no installs. Host guard honored: absolute lane paths, no commits, no lane-tree edits except this report.
