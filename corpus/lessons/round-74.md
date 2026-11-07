# tabi — round 74

L1 `TabiR74`, attempt 1. Base `c72235d6aebca89269809050e983d53df36273f5` (lane clean, `ahead=0 behind=0`;
`.ufo/watchdog.log` shows only `launch tabi round=74 … attempt=1`, no earlier attempt, nothing inherited).

Round 73 was admitted (MANIFEST index 1469; spot-check `corpus/lessons/round-73-verifier-spotcheck.md`).
Rounds 71 and 72 were rejected as honest stops (leg b red; leg c red on a receipt-relative battery case
plus a replay hole). The three spot-checks were read before the claim. Routed defects of the r73 closure:
(1) cross-generation prior set for the pinch counter and (2) R73Mut1's 21 witnessed survivors as pinch
battery cases are carried, not claimed: this round's claim is a new surface, and both items belong to a
pinch counter re-generation. (3) the 1e-12 timeline escape is closed for the new generation: the r74
counter replaces the timeline hash with a near-match (< 0.05 ms per event) plus a 0.1 ms quantum check
(controls `replay-forged-1e-12`, battery `replay-timeline-1e-12`, `replay-timeline-sub-quantum`).

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0,
186 rows, 25 W04 (`.ufo/waves/round-74/census/start.txt`).

Claim: C1 coverage — capability `chromium-ime-composition-linux` (CDP `Input.imeSetComposition` and
`Input.insertText` on Chromium 155 headless), sourced: S187–S193, new this round. One claim only.

## Gate

### Sources — new rows

All fetched by the L1 on 2026-11-06 between 23:13:07 and 23:29:50 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(HTTP 200, base64 decoded; decoded copies and sha256 in `.ufo/waves/round-74/sources/`, `FETCH.txt`;
transport `.b64` files deleted at fetch time). Each row: tier A, kind `code`, status `mined`, recheck
`on-release`, used-by the round-74 note and this lesson. Before the append,
`grep -c 'input_method_controller\|event_dispatcher.cc\|scoped_event_queue\|editing_utilities' corpus/SOURCES.md` was 0.

- **S187** `third_party/blink/public/devtools_protocol/domains/Input.pdl` (336 lines, sha256 `5bbc6e23…6e3d`,
  byte-identical to S173's staged copy; new scope). Located quote (line 150): "Use imeSetComposition with empty string as text to cancel composition."
- **S188** `content/browser/devtools/protocol/input_handler.cc` (2,343 lines, sha256 `72cf0d1d…24f4`,
  byte-identical to S174; new scope). Located quote (line 1345): "Either both replacement start/end are specified or neither."
- **S189** `third_party/blink/renderer/core/editing/ime/input_method_controller.cc` (2,163 lines, sha256
  `7c72e618…bde4`). Located quotes (line 1084): "!DispatchCompositionStartEvent(GetFrame().SelectedText())) {"
  and (line 409): "EventDispatcher::DispatchScopedEvent(*target, *event);"
- **S190** `third_party/blink/renderer/core/dom/events/event_target.cc` (1,175 lines, sha256 `46bfd353…92d0`).
  Located quote (line 868): "event.SetTrusted(true);"
- **S191** `third_party/blink/renderer/core/dom/events/event_dispatcher.cc` (496 lines, sha256 `8456e1ee…f06b`).
  Located quote (line 92): "ScopedEventQueue::Instance()->EnqueueEvent(event);"
- **S192** `third_party/blink/renderer/core/dom/events/scoped_event_queue.cc` (99 lines, sha256 `85f4e467…71ee`).
  Located quote (line 78): "EventDispatcher::DispatchEvent(*node, event);"
- **S193** `third_party/blink/renderer/core/editing/editing_utilities.cc` (1,999 lines, sha256 `dda549bb…b1a0`).
  Located quote (lines 1772–1773): "if (!target) return DispatchEventResult::kNotCanceled;"
- No status, recheck or used-by cell of an existing row changed. S187 and S188 add W04
  (same URL as S173 / S174 across scopes; census warnings 25 → 27).

### Admitted

- `corpus/knowledge/chromium-ime-composition-runtime-round-74.md` (cites S187–S193): the event shapes of
  CDP IME composition on this build, sourced leg by leg (start/update/end choice, selected-text start
  data, commit vs insert, the no-focus composition return, the untrusted `compositionend` through the
  scoped queue, the missing `beforeinput` without a focused target), and measured identically on 9/9
  pre-freeze runs.

### Rejected (with flip conditions)

- **"An IME-driven composition delivers `keydown` with keyCode 229 before each update"** (the usual
  page-side expectation for native IMEs) — reject for this producer: S188's handlers call
  `ImeSetComposition` / `ImeCommitText` with no key event, and 0 key events were recorded in 9/9 runs.
  Flip: a Chromium tag whose DevTools IME handler injects a key event, or a run that records one.
- **"`Input.imeCommitComposition` commits the composition"** — reject: S187 line 149 names it in a
  comment, but the PDL declares no such command at this tag. Flip: a tag whose PDL declares it.
- **"No focused element means `insertText` does nothing"** — reject: S189/S193 show the insert path
  dispatches `beforeinput` to the focused element only (none) and inserts anyway; measured: the text
  lands in the contenteditable holding the DOM selection. Flip: a run where it is dropped.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register-correction L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a look-alike detector matched the producer's own allowed call: the driver's deny-list regex `textContent\s*=` hit its readiness probe `textContent === "<nonce>"`, so every honest run was REFUTED (driver exit 1) | first full pre-freeze pass (12 runs, all exit 1); `.ufo/waves/round-74/lesson-proof/prefreeze-defects.json` `m1.oldRuleHits` 1 per smoke vs `newRuleHits` 0 | none: no instrument tested the deny-list against the driver's own call set | lookahead `(?!=)`; the counter never relied on a deny-list (closed allow-list `send-log-allowlist`); proof script exits 0 only while the old rule still fails |
| a rule carried from the previous surface without re-deriving it: the pinch generation's "every event trusted" leg rule refuses every honest IME run, because `compositionend` is untrusted | second pass, 9/9 smokes REFUTED; `lesson-proof/prefreeze-defects.json` `m2.oldRuleHonestRunsPassing` 0, untrusted types `compositionend` only | none at the time; QUALITY 139 (below) | per-event trusted vector in the frozen leg shape and a sourced `trust-law` (S190–S192) |
| a replay tolerance chosen by feel, not measured against honest pairs: the first near-match tolerance (1 ms) refuses one of the 36 honest pre-freeze pairs (their max per-event difference is exactly 1.0 ms) | `lesson-proof/prefreeze-defects.json` `m3.refusedAtOldTolerance1ms` 1, `refusedAtFrozenTolerance005ms` 0 | QUALITY 135 measures battery margins, not counter tolerances against honest pairs | tolerance 0.05 ms (half the 0.1 ms page clock quantum) plus `event-time-quantum`; QUALITY 139 |
| a prior-set completeness sentence written before the last receipts of the surface were committed: three probe receipts of the same schema went into the pre-freeze commit after claims.json said "no committed receipt with schema tabi-chrome-cdp-imecompose-*" outside PRE — the round-73 class (QUALITY 138) one step removed | R74Critic §1.2/§2: relabels of `controls/c1/probe/p2`/`p3` (nonce, fixture hash, `driverSha256` field, producer verdict, `legShape`; no token, browser-id or time change) pass legs (a) and (b) clean 148, the battery 239/239 and kill power; `lesson-proof/prior-set-enumeration.txt` lists the 3 receipts outside PRE at the freeze parent `b70e0a27` | QUALITY 138 named earlier generations, and no instrument enumerated committed receipts against the frozen prior set | QUALITY 140 (enumerate by schema at the freeze parent; non-empty difference blocks the freeze); post-freeze `lesson-proof/postfreeze-checks.json`: with the probes added as priors the relabels are refused (three replay ids) while the scored (a), R74Exec1 and R74Exec2 d1–d3 receipts stay clean, so none of the round's receipts is a probe relabel |
| a near-match that silently requires equal event counts: one duplicated or deleted `focusin` takes a fully relabelled PRE receipt out of the timeline comparison | R74Review1 S1: `w1/R74Review1/b4-…plus-dup-focus.replay.json` and `b5-…minus-focus.replay.json` exit 0 clean 148 with PRE priors (re-run in `lesson-proof/postfreeze-checks.json`, `review1-b4/b5`); the frozen limit sentence names only a whole-quantum time move as the escape | none: the counter comment states count-equality, the limit sentence omits it | routed to the next generation: compare timelines by event identity (type, leg, target) with insertions/deletions, not index; the limit sentence is corrected in SCORECARD `## Round 74` |

## Sources — opened after the freeze (frontier, not the claim's grounding)

- **S194** `third_party/blink/renderer/core/dom/document.cc` (10,542 lines, sha256 `0604c18a…fbe8`) and
  **S195** `third_party/blink/renderer/core/editing/frame_selection.cc` (1,808 lines, sha256 `be431f6b…4048`),
  located by R74Scout (`w1/R74Scout/report.md` §3), re-opened by the L1 2026-11-07 01:12:24–01:12:25 -03:00
  (same URL form, HTTP 200; `sources/FETCH.txt`).
  - S194 (line 6090): "if (GetPage() && (GetPage()->GetFocusController().IsFocused())) {"
  - S195 (line 390): "if (!new_selection.IsNone() && !options.DoNotSetFocus()) {"
  They turn the note's focus-deferral inference and the no-focus insert's target/focus change into
  sourced statements (note section "Sourced after the freeze"); they are not counted for the claim.
- Rejected (not re-opened, kept as R74Scout's reading only): the intermediate editor links
  `editor.cc`, `event_handler.cc`, `editing_commands_utilities.cc`, `node.cc`. Flip: an L1 re-open
  with located quotes.

## Attack findings (wave w1, 11 seats, 0 dead) — not amended; instruments stay as frozen

- **R74Exec1 (HOLDS):** pins equal `freeze.txt`; leg (b) cold run, nonce `tabi-r74-exec1-ca30e1a3b7b2`,
  driver exit 0, counter exit 0 clean 148 (PRE + (a) as 13th prior); battery 239/239 on (a) and on its own
  receipt; kill power on (a) holds 148/148 + 26/26.
- **R74Exec2 (CONFIRMED):** 3 more cold runs clean 148, battery 239/239 each; over 13 honest receipts
  the minimum pairwise timeline distance is 1.0 ms (78 pairs, none under 0.05 ms), 0 of 520 events off
  the 0.1 ms grid, 16 leg shapes byte-identical.
- **R74Critic (FINDINGS):** the frozen `priorSet` and `limit` sentences are false (Mistakes row 4);
  coverage naming and the `sourced` field hold.
- **R74Review1 (FINDINGS):** S1 count-change replay (Mistakes row 5); S2–S8 receipt-content and
  binding gaps inside the umbrella limit (error code not read, `fixture.viewport`/`origin` unbound,
  page-side evaluations unbounded, free per-event fields) — routed.
- **R74Review2 (FINDINGS):** battery re-run on smoke2/5/8 identical to the committed outputs. F1: kill
  power counts a battery crash as a kill — 4 such rows in the scored run; re-run one at a time, all 4 are
  genuine kills attributed to the mutated check (`lesson-proof/postfreeze-checks.json` `reruns`).
  F2: the battery does not require the three `--laundered` receipts. F4/F5: an equal-`at` honest gap and
  two tolerance weakenings (0.045 ms, grid 0.02) survive. Routed.
- **R74Review3 (FINDINGS, conformance holds):** ordering b70e0a27 → 8faa903a → D ca30e1a3 → 19c301da;
  pins equal at D and tip; the (a) nonce occurs in no file at D; before→after re-derived. F1: the counter
  output does not record its prior set (routed).
- **R74Mut1 (FINDINGS):** 54 extra semantic mutants, 26 killed, 28 survived (19 acceptance witnesses,
  2 over-refusal, 7 equivalent) — battery coverage debt for the next generation; the frozen kill-power
  result is not contradicted.
- **R74Scout (CONFIRMED):** S187–S193 re-fetched byte-identical, every anchor lands (27 checks); located
  the sources for both measured-not-sourced mechanisms (above).
- **R74Connector (FINDINGS, verdict adjacent):** no sibling holds IME/composition ground; overlap none.
- **R74Scribe (HOLDS):** 10 receipts × 16 legs × 6 fields re-derived, 0 mismatches against the note's
  table; every Gate quote at its line.
- **R74Revenger (HOLDS):** none of the eight r60–r73 root failures repeated in the frozen legs; SHONEN
  4/4 pointers resolve; SCORECARD 0 contradicted claims at audit time.

## Round-73 routed defects

1. Pinch cross-generation prior set (QUALITY 138): carried to a pinch counter re-generation. The
   claim that this generation's prior set was every committed receipt of its surface was false
   (Mistakes row 4).
2. R73Mut1's 21 survivors: carried (pinch battery).
3. Timeline 1e-12 escape: closed for the IME generation (above).
4. r71 R2 verifier hardening, R72Scout R3 rows, R4/R5: carried.
5. Planner seat: held by the L1 (the validator rejects `planner`).
