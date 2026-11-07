# tabi — round 79

L1 `TabiR79`. Base `24c821895f31f9dcb66ac2f357bc947818b0408c` (lane clean, `local=remote`,
`ahead=0 behind=0`). Round 78 was admitted (`round-78-verifier-spotcheck.md`); its routed defects
1-6 are the spine of this round. Claims: C1 coverage — capability `chromium-showpicker-linux`
(new); C2 calibration — record drift, counted by a committed instrument.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(`.ufo/waves/round-79/census/start.txt`; 215 rows at base). End: 218 rows, exit 0
(`.ufo/waves/round-79/census/end.txt`).

## Gate

### Sources — new rows (opened this round by the L1; the R79Scout seat re-opens them independently)

- **S216** WHATWG HTML, the input element's `showPicker()` steps —
  `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`. Opened 2026-11-07, http
  200, 687,515 B, sha256 `b0202de1c0b4…`. Located quote (showPicker() steps): "If this is not
  mutable, then throw an "InvalidStateError" DOMException." (12 words) and, later in the same
  algorithm, "If this's relevant global object does not have transient activation, then throw a
  "NotAllowedError" DOMException." (19 words). Tier A for the normative algorithm; it does not
  evidence any browser's implementation.
- **S217** MDN `HTMLInputElement.showPicker()` — `https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker`.
  Opened 2026-11-07, http 200, 171,971 B, sha256 `db037377f1fb…`. Located quote (Exceptions):
  "NotAllowedError DOMException Thrown if not explicitly triggered by a user action such as a touch
  gesture or mouse click (the picker requires Transient activation)." (24 words). Tier A for the
  client-facing contract, not for Chromium behaviour.
- **S218** Chromium 155.0.8059.84 `html_input_element.cc` — `…/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`.
  Opened 2026-11-07, http 200, 135,428 B base64 → 2,818 lines, sha256 `405b52c70185…`. Located
  quote (lines 2673-2676): "if (!LocalFrame::HasTransientUserActivation(frame)) { … ThrowDOMException(
  DOMExceptionCode::kNotAllowedError, "HTMLInputElement::showPicker() requires a user gesture.");"
  (23 words). Tier A for the implementation at that tag.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-79.md` (cites S216-S218; states the
eight measured laws with their receipt field paths, and what a receipt of this shape cannot prove).

Rejected (with flip conditions):

- **"`Runtime.evaluate` with `userGesture: true` is a user gesture"** — reject as a *user* gesture:
  it satisfies the activation check (`sp-cdp-gesture` succeeds, `hasBeenActive` becomes true) but
  `navigator.userActivation.isActive` never becomes true, so it is not the same state a real click
  grants. Flip: a measurement showing `isActive === true` after a `userGesture` evaluation.
- **"The `SecurityError` path is part of this capability"** — reject: not measured (same-origin
  loopback fixture only); the source states it (S218 lines 2658-2667) but a source is not a
  measurement. Flip: a cross-origin iframe fixture whose `showPicker()` throws `SecurityError`.
- **"`showPicker()` and a click are interchangeable triggers"** — reject: a click on the input
  fires pointer/mouse/click events and opens the picker; `showPicker()` fires no pointer event and
  opens the same picker (`sp-click-control` vs `sp-click-then-show`). Flip: a page that observes a
  pointer event from `showPicker()`.
- **"The activation is consumed by the picker opening, not by the call"** — reject as unproven: the
  source consumes before `OpenPopupView` (S218 line 2679), and the receipt shows `isActive` false
  after the call, but the two are not separable in this fixture. Flip: a leg whose popup fails to
  open after a successful call.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability acquisition; see `claims.json` / `SCORECARD.md`
for the frozen predicate, counter, pins and kill rule). C2 admitted as the calibration move
(`scripts/check-record-drift-r79.mjs`; before state `lesson-proof/c2-before.json`).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `survivor` — the first kill-power run left 30 of 70 counter mutants alive because the battery had one case per CHECK, not one per RULE: a case that trips a broad check passes even when the narrow clause inside it is dropped | `scripts/kill-power-r79.mjs` run 1 (30 survivors, `.ufo/waves/round-79/lesson-proof/kp-run1.json`); e.g. `gesture-message-dropped` survived `gesture-law`'s ok-only case | none at the time — QUALITY 155 (new) | one isolating case per rule clause (88 cases; `gesture-name-only`, `gesture-message-only`, `consumption-second-contradictory-ok`, `cdp-open-id-zero`, `event-after-settle`, …), then kill power re-run to 0 survivors |
| `vacuous` — three counter clauses duplicated a rule another check already owned (the teardown clauses in `host-argv`, the descriptor clause in `mode-law`, the trigger-order clause in `plan-calls`), so their mutants were unkillable by construction and the duplication only looked like strength | kill-power run 1 survivors `teardown-survivors-ok`, `teardown-ports-ok`, `mode-law-descriptor-dropped`, `plan-trigger-order-dropped` | QUALITY 156 (new) | the duplicated clauses were removed (dead weight), not covered by a case; the rules stay owned by `teardown-closure`, `fixture-descriptors` and the trigger-id binding |
| `scope` — the counter crashed (TypeError, no verdict) on a foreign receipt (the r78 file-chooser receipt) because `intercept-law` and `gesture-law` looked up `PLAN`/`SP_LAW` without an unknown-leg guard; the no-work control exposed it | `{S}/nowork.json` before the guard: `TypeError: Cannot read properties of undefined (reading 'intercept')` at `check-showpicker-r79.mjs:398` | the no-work control (the claim's own do-nothing state) — it must fail CLOSED, never crash | unknown legs are findings (`intercept-law`, `gesture-law` push `unknown-leg`), and the unreadable paths now `process.exit` instead of falling through (`fatal()`) |
| `stale-premise` — the battery's mirror-lane cases passed a lane-relative `--prior-set`, which the counter resolves against `--lane`, so the mirror runs died `prior-unreadable` and the two walk cases could never pass; the battery's own honest run masked it because it used the real lane | battery run with the mirror cases: `prior-unreadable … battery13/mirror/tabi-shokunin/.ufo/…/prior-set.txt` | the battery's coverage rule (a case that cannot run is a failure) | the prior set is passed absolutely, and `buildMirror()` copies `controls/c1/` so the lane-relative entries resolve |

Sweep for further mistakes: `ls .ufo/waves/round-79/lesson-proof/` (every red state above);
`node .ufo/waves/round-79/controls/c1/prefreeze-summary.mjs` re-reads every gate output and fails
closed.

## Corrections (round-78 routed defects 1, 2 and 6 — C2's subject)

**Correction — round 78 record drift.** The round-78 non-author spot-check
(`round-78-verifier-spotcheck.md` §6) found the lane's records stale against the committed bytes.
Records are append-only, so every stale statement stays where it is and this entry names the
correction; `scripts/check-record-drift-r79.mjs` counts the mismatches (before: 7; after: 0).

1. **SCORECARD r78 C1 row.** Its counting command cited the superseded nonce
   `tabi-r78-l1-d59ca0270c2a` and "(c) battery 398/398". The final scored receipt is
   `tabi-r78-l1-bf94adaab578` and the final battery is **400/400**. Correction appended to
   `SCORECARD.md` (r78 row block); the row's own text is not rewritten.
2. **SKILL.md r78 gate registry.** "398 cases … 32 carried R77Mut1 witnesses" → the committed
   battery has **400 cases** and **31** `witness-*` cases (29 `add` + 2 `accept`). Correction
   appended to the registry block.
3. **LOG.md round-78 entry.** "Battery 398/398 allOk" and the old nonce → a correction entry is
   appended to `LOG.md` naming `398/398` → **400/400** and `tabi-r78-l1-d59ca0270c2a` →
   `tabi-r78-l1-bf94adaab578`.
4. **The filed r78 report.** It states "400 cases incl. **32 carried R77Mut1 witnesses**",
   "**9 Mistakes rows**" and "the scored receipt's `nodeReport` carries a drifted id
   (**pick-multiple 10**)". Correction: `32 carried R77Mut1 witnesses → 31 carried R77Mut1 witnesses`,
   `9 Mistakes rows → 8 Mistakes rows`, `pick-multiple 10 → pick-multiple 7` — the 7→10 drift belongs
   to the pre-repair `L1-cold1` run (`lesson-proof/driver-shape-id-pin.json`). A filed report is never
   rewritten; this entry and the round-79 report carry the correction.
5. **The r78 `claims.json` leg (b) path.** It said the cold runs are "committed under
   `.ufo/waves/round-78/scored/`"; correction: `.ufo/waves/round-78/scored/ → .ufo/waves/round-78-seats/`
   (the ledger is in `scored/`). Recorded here; the frozen claims file is not edited.
6. **C2 command limit (round-78 Correction 7).** The capability-status command alone is satisfiable
   by labelling every row `provisional`. C2's claim states the count in the predicate
   (`provisional 1`, `mismatches 0`) and the counter's `capability-status-count` claim checks it.

## Carried, not closed

- **Round-78 routed defect 3a** (the 21 R78Mut1 survivors as battery cases for the r78 counter) is
  assigned to the wave's `R79Exec4` seat as a new file (`scripts/negatives-filechooser-r79.mjs`);
  it is not a claim of this round and its result is reported as wave evidence, never as a C1 leg.
- **Round-78 routed defect 3b** (`--tree-exempt` bound by sha256) is closed *in the new instrument*:
  `check-showpicker-r79.mjs` refuses a path-shaped `--tree-exempt` (exit 2,
  `tree-exempt-path-refused`) and resolves `--tree-exempt-sha256` inside the walked trees. The r78
  counter's own path flag is frozen bytes and is not edited.

## Wave w1 findings (integrated)

The wave's 12 seats settled; the ones that changed the record:

- **R79Critic H1 (HIGH, fixed).** The C2 counter counted substrings, so a *reversed* correction
  passed (control: exit 0 with the SCORECARD pair reversed). Fixed: every correction claim now
  requires the directional pair `<stale> → <truth>`; the reversed control exits 1 with 2 mismatches
  (`lesson-proof/c2-controls.json`).
- **R79Critic H2–H5 (fixed).** The battery count drifted in this round's own records (87/88/90);
  `claims.json` and `SKILL.md` now state 90; `coverageGap` is corrected to the battery's actual
  `coverage.uncovered`/`coverage.unknown`; the claims' S216-S219 is corrected to S216-S218 (no S219
  row exists — the CDN Runtime.pdl the brief assumed is absent at the tag, per R79Scout); the two
  cited-but-absent control files now exist (`controls/c1/prefreeze-summary.json`,
  `lesson-proof/c2-controls.json`); `scored/c1-killpower-a.json` is produced by the scored pipeline.
- **R79Critic M1 (statement corrected).** The counter's header sentence said a forger who moves
  `absNeed` events escapes; the escape condition is `absMatched < absNeed`, i.e. `N_p - absNeed + 1`
  moved events. The printed `escapeEvents`/`escapeGaps` were already correct; the prose is corrected
  in the round report and this lesson.
- **R79Probe (hypothesis REFUTED).** `showPicker()` checks mutability before the gesture: a disabled
  input with no activation throws `InvalidStateError`, not `NotAllowedError` — matching S218's order.
- **R79Scout (2 claims flagged).** The note's "the source agrees on the order" was false for the
  first two steps (spec mutability→cross-origin, Chromium cross-origin→mutability); corrected in the
  note. The second flag (the `userGesture`-is-not-`isActive` sentence) is kept as measured: the
  receipt shows `isActive` false before and after the `userGesture` evaluation.
- **R79Mut1 (routed to r80, not closed).** An independent conjunct-level mutant set (76 mutants)
  found 56 weakenings the frozen battery does not kill: the battery has one isolating case per
  *check*, and a check with several conjuncts is only bracketed on one of them. The counter holds the
  rule; the battery is blind to the other conjuncts. This is QUALITY 155's limit stated from
  outside — the frozen kill-power set (64 mutants, 0 survivors) is complete for the rules it names,
  not for every conjunct.
- **R79Exec4 (routed defect 3a, landed as wave work).** `scripts/negatives-filechooser-r79.mjs`: a
  self-contained battery for the frozen r78 counter with one witness per R78Mut1 survivor (19 refuse
  + 2 must-accept), the r78 bytes untouched.
- **R79Connector.** 20 sibling lanes scanned, 0 contested rows; the showPicker surface appears in no
  sibling's capability table or knowledge corpus.

## Corrections — round 80 (append-only; counted by scripts/check-record-drift-r80.mjs)

1. **Battery count.** 88 cases → 90 cases (the committed battery is 90 cases,
   `.ufo/waves/round-79/scored/c1-negatives-a.json`).
2. **Dead red-state pointer.** lesson-proof/kp-run1.json → withdrawn (the file was never committed;
   the run-1 survivor count is prose only and the final kill power is 64/64, 0 survivors).
3. **Gate quote counts.** The three S216/S218 parenthetical word counts were wrong:
   (12 words) → (10 words), (19 words) → (15 words), (23 words) → (11 words). The quotes are
   verbatim and ≤25 words; the counts are re-measured by the r79 non-author spot-check.
