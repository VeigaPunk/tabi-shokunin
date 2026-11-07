# tabi — round 79

L1 `TabiR79`. Base `24c821895f31f9dcb66ac2f357bc947818b0408c` (lane clean, `local=remote`,
`ahead=0 behind=0`). Round 78 was admitted (`round-78-verifier-spotcheck.md`); its routed defects
1-6 are the spine of this round. Claims: C1 coverage — capability `chromium-showpicker-linux`
(new); C2 calibration — record drift, counted by a committed instrument.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(`.ufo/waves/round-79/census/start.txt`; 215 rows at base). End: 219 rows, exit 0
(`.ufo/waves/round-79/census/end.txt`).

## Gate

### Sources — new rows (opened this round; R79Scout re-opens them independently)

- **S216** WHATWG HTML, the input element's `showPicker()` steps —
  `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`. Opened 2026-11-07, http
  200, 687,515 B, sha256 `b0202de1c0b4…`. Located quotes (the `showPicker()` steps): "If this is not
  mutable, then throw an \"InvalidStateError\" DOMException." (11 words) and "If this's relevant global
  object does not have transient activation, then throw a \"NotAllowedError\" DOMException." (17
  words), and in the "show the picker" sub-algorithm "Consume user activation given element's relevant
  global object." (9 words). Tier A for the normative algorithm; it does not evidence any browser's
  implementation. The algorithm has a fourth refusal this round does not measure (an unrendered select
  → `NotSupportedError`).
- **S217** MDN `HTMLInputElement.showPicker()` —
  `https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker`. Opened 2026-11-07,
  http 200, 171,971 B, sha256 `db037377f1fb…`. Located quote (Exceptions): "NotAllowedError DOMException
  Thrown if not explicitly triggered by a user action such as a touch gesture or mouse click (the
  picker requires Transient activation)." (24 words). Tier A for the client-facing contract, not for
  Chromium behaviour.
- **S218** Chromium 155.0.8059.84 `html_input_element.cc` —
  `…/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`. Opened 2026-11-07,
  http 200, 135,428 B base64 → 2,818 lines, sha256 `405b52c70185…`. Located quote (lines 2673-2676):
  "if (!LocalFrame::HasTransientUserActivation(frame)) { … ThrowDOMException(
  DOMExceptionCode::kNotAllowedError, \"HTMLInputElement::showPicker() requires a user gesture.\");"
  (23 words), with `LocalFrame::ConsumeTransientUserActivation(frame);` at 2678 and
  `input_type_view_->OpenPopupView();` at 2680. Tier A for the implementation at that tag.
- **S219** the CDP Runtime domain at the revision Chromium 155.0.8059.84 pins —
  `https://chromium.googlesource.com/v8/v8/+/712e1808de2d7416f1276d0deb1ee4ac978132b8/include/js_protocol.pdl?format=TEXT`.
  Opened 2026-11-07, http 200, 94,320 B base64 → 1,848 lines, sha256 `678fd97bf647…`. Located quote
  (lines 1541-1542, `Runtime.evaluate` parameters): "# Whether execution should be treated as initiated
  by user in the UI." / "optional boolean userGesture" (16 words). Tier A for the protocol's own
  wording. **Path correction:** the wave brief calls this "the CDP Runtime.pdl"; at the tag the Blink
  `third_party/blink/public/devtools_protocol/domains/` directory lists 52 `.pdl` files and none is
  `Runtime.pdl` — Runtime is a V8 domain and the file is `v8/include/js_protocol.pdl` at the DEPS
  `v8_revision` (`DEPS` line 348). The row's `source` and `scope` say so.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-79.md` (cites S216-S219; states the nine
measured laws with their receipt field paths, and what a receipt of this shape cannot prove).

Rejected (with flip conditions):

- **"`Runtime.evaluate` with `userGesture: true` is a user gesture"** — reject as a *user* gesture: it
  satisfies the activation check (`sp-cdp-gesture` succeeds, `hasBeenActive` becomes true) but
  `navigator.userActivation.isActive` never becomes true, so it is not the same state a real click
  grants. The protocol's own wording agrees — "treated as initiated by user" (S219), not "initiated".
  Flip: a measurement showing `isActive === true` after a `userGesture` evaluation.
- **"The `SecurityError` path is part of this capability"** — reject: not measured (same-origin
  loopback fixture only); the spec and the source state it (S216, S218 lines 2658-2667) but a source is
  not a measurement. Flip: a cross-origin iframe fixture whose `showPicker()` throws `SecurityError`.
- **"`showPicker()` and a click are interchangeable triggers"** — reject: a click on the input fires
  pointerdown/mousedown/pointerup/mouseup/click on the input (`sp-click-control`), `showPicker()` fires
  none of them and opens the same picker (`sp-click-then-show`). Flip: a page that observes a pointer
  event from `showPicker()`.
- **"The activation is consumed by the picker opening, not by the call"** — reject as unproven: the
  source consumes before `OpenPopupView` (S218 line 2678), and the receipt shows `isActive` false after
  the call, but the two are not separable in this fixture. Flip: a leg whose popup fails to open after
  a successful call.
- **"The `backendNodeId` identifies the input"** — reject, and harder than r78 could: in this one
  generation the same pinned driver reports **3** for `#s` and **3** for `#m` under `showPicker()`, and
  **5** for `#s` under a real click (`nodeReport`). The id is a function of the trigger path, not of the
  element. Flip: a tag where the id is stable per element across trigger paths.
- **"The replay rule's gap side is a real constraint"** — reject: each prior has exactly **one** gap
  ≥ 50 ms, so `gapNeed` is 1 and moving that single gap escapes the gap rule; only the event side
  (19 of 37) still costs a forger anything (`limit.perPrior[]`). Flip: a receipt generation with ≥ 4
  gaps ≥ 50 ms, where `gapNeed` > 1.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Spot check (placeholder)

The non-author spot check for this round is **pending**; it lands as
`corpus/lessons/round-79-verifier-spotcheck.md` and its §6 routes defects into the next round. This
section is the placeholder the verifier fills — no verdict is claimed here.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability acquisition; see `claims.json` / `SCORECARD.md`
for the frozen predicate, counter, pins and kill rule). C2 admitted as the calibration move
(`scripts/check-record-drift-r79.mjs`; before state `lesson-proof/c2-before.json`, 20 claims / 7
mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `vacuous` — the C2 counter's five `*-stale-present` claims are satisfied by the **correction text itself**, so they cannot tell "the stale row survives" from "the correction quotes the stale value". `sc-78-battery-corrected` requires `398/398` in `SCORECARD.md`; `sc-78-battery-stale-present` then finds that same occurrence | `.ufo/waves/round-79-seats/R79Scribe/c2-vacuity.json`: a mirror of the lane with the original stale rows deleted (`SCORECARD.md` line 3846, `SKILL.md` line 3226, `LOG.md` line 3814) and the corrections kept still reports `claims 20 mismatches 0`, every `*-stale-present` `ok:true` | this scribe seat's mirror run (the claim text is the witness) | scope each `*-stale-present` claim to the record that carries the statement — a row/section anchor, or "the string occurs outside the correction block" — otherwise C2 leg (b) is unbound and the counter reports 0 on a tree where the stale statements were deleted |
| `number-drift` — one battery, three numbers in one round: the frozen claims say 87, the lesson's fix column said 88, the committed battery ran 90 | `.ufo/waves/round-79/claims.json` leg (c) "87 cases"; `corpus/lessons/round-79.md` fix column "88 cases"; `.ufo/waves/round-79/scored/c1-negatives-a.json` `cases 90`, coverage `declared 56 covered 56` | reading the battery's own output against the two records | the lesson states **90** (the battery's own count); the frozen claims are not edited — the L1's report records the discrepancy and the judge reads leg (c) against the battery's own count |
| `unfiled-evidence` — the first Mistakes row cites a kill-power run output that is not in the tree | the row cites `.ufo/waves/round-79/lesson-proof/kp-run1.json` (30 survivors of 70); `ls .ufo/waves/round-79/lesson-proof/` on 2026-11-07 = `c1-nowork.json`, `c2-before.json`, `c2-after.json` — no `kp-run1.json` | this seat's path check | file the run output under the cited path before the sentence stands, or withdraw the row; a lesson row may not cite a path that does not resolve |
| `message-polarity` — the drift counter prints its *failure* text as the `detail` of a **passing** claim, so the record reads as a contradiction | `.ufo/waves/round-79/lesson-proof/c2-before.json` `results[]`: `{"id":"sc-78-nonce-stale-present","ok":true,"detail":"the stale nonce is no longer in SCORECARD.md (records are append-only)"}` | reading the counter's output | `detail` states the observed fact ("the stale nonce is present in SCORECARD.md"); a separate `why` carries the failure text, or `detail` is emitted only when `ok` is false |
| `stale-premise` (carried from r78) — the r78 driver's LEG-SHAPE carried r77's literal backendNodeIds and its predicate compared them, so the producer refused an honest cold run (`pick-multiple` 7→10) although the counter's mode-only leg check passed | `.ufo/waves/round-78/lesson-proof/driver-shape-id-pin.json` (driver exit 1, counter 1 finding; the diff is the only field) | the round's own leg (b) cold-run acceptance, before any scored verdict | LEG_SHAPE compares modes only and the predicate compares a mode projection; QUALITY 150. This round's receipt shows the rule is right in both directions: `nodeReport` 3 for `#s` and `#m` under `showPicker()`, 5 for `#s` under a click |
| `survivor` (carried from r78) — replacing a fragile accept case removed the only case that dies when the pair tolerance widens 0.05 → 0.06, so `M-timeline-tol-0.06` survived with every other mutant killed | `.ufo/waves/round-78/lesson-proof/tol-witness-loss.txt` (76 semantic mutants, 75 killed, survivor named) | QUALITY 143 (every tolerance bracketed on both sides) read through kill power's survivor list | `accept-prior-retimed-0.051-scattered`: `absNeed` scattered prior events sit exactly 0.051 ms out, UNROUNDED, so it must accept at 0.05 and is refused at 0.06 |

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
   (**pick-multiple 10**)". The committed truth: **31** witness cases, **8** Mistakes rows, and the
   scored receipt's `pick-multiple` node is **7** — the 7→10 drift belongs to the pre-repair
   `L1-cold1` run (`lesson-proof/driver-shape-id-pin.json`). A filed report is never rewritten; this
   entry and the round-79 report carry the correction.
5. **The r78 `claims.json` leg (b) path.** It said the cold runs are "committed under
   `.ufo/waves/round-78/scored/`"; the receipts are under **`.ufo/waves/round-78-seats/`** (the
   ledger is in `scored/`). Recorded here; the frozen claims file is not edited.
6. **C2 command limit (round-78 Correction 7).** The capability-status command alone is satisfiable
   by labelling every row `provisional`. C2's claim states the count in the predicate
   (`provisional 1`, `mismatches 0`) and the counter's `capability-status-count` claim checks it.

**Correction — round 79's own records (this wave).**

7. **The battery count.** `claims.json` leg (c) states "87 cases"; the fix column of this lesson's
   first Mistakes row said "88 cases"; the committed scored battery ran **90** cases
   (`scored/c1-negatives-a.json`, `cases 90`, coverage `declared 56 covered 56`). The frozen claims
   are not edited (they are frozen at D `80830674`); the discrepancy is recorded here and in the
   round-79 report, and leg (c) is read against the battery's own count.
8. **C2 leg (b) is not independently bound.** The `*-stale-present` claims are satisfied by the
   correction text (see the `vacuous` row above and `c2-vacuity.json`). The counter's 0 mismatches
   after the corrections is a true statement about the bytes it reads; it is not proof that the
   original rows survive. The fix is named in the Mistakes row; the frozen predicate is not amended.
9. **The lesson's `kp-run1.json` citation.** The first Mistakes row cites
   `.ufo/waves/round-79/lesson-proof/kp-run1.json`; the file is not in the tree at the time of this
   entry. Either it is filed under that path before the row stands, or the row is withdrawn.

## Carried, not closed

- **Round-78 routed defect 3a** (the 21 R78Mut1 survivors as battery cases for the r78 counter) is
  assigned to the wave's `R79Exec4` seat as a new file (`scripts/negatives-filechooser-r79.mjs`);
  it is not a claim of this round and its result is reported as wave evidence, never as a C1 leg.
- **Round-78 routed defect 3b** (`--tree-exempt` bound by sha256) is closed *in the new instrument*:
  `check-showpicker-r79.mjs` refuses a path-shaped `--tree-exempt` (exit 2,
  `tree-exempt-path-refused`) and resolves `--tree-exempt-sha256` inside the walked trees. The r78
  counter's own path flag is frozen bytes and is not edited.
