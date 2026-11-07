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

## Round-73 routed defects

1. Pinch cross-generation prior set (QUALITY 138): carried to a pinch counter re-generation; this
   generation's prior set is every committed receipt of its surface (no earlier IME generation).
2. R73Mut1's 21 survivors: carried (pinch battery).
3. Timeline 1e-12 escape: closed for the IME generation (above).
4. r71 R2 verifier hardening, R72Scout R3 rows, R4/R5: carried.
5. Planner seat: held by the L1 (the validator rejects `planner`).
