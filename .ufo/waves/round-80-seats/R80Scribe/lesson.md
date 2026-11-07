# tabi — round 80

L1 `TabiR80`. Base `e2e12ca58fe2cdbed4aa97af47793b6cfb5a9350` (lane clean, `local=remote`,
`ahead=0 behind=0`). Round 79 was admitted (`corpus/lessons/round-79-verifier-spotcheck.md`); its
routed defects 1-4 are C2's subject. Claims: C1 coverage — capability `chromium-showpicker-linux`,
generation r80 (the frontier r79 named and did not hold); C2 calibration — record drift, counted by
`scripts/check-record-drift-r80.mjs`.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
**exit 0** (`.ufo/waves/round-80/census/start.txt`; 218 rows at base). The registry does not grow
this round: the four sources the scout opened are byte-identical re-openings of S216, S218, S212 and
S208, so no id is minted and no cell is rewritten (218 → 218).

Digests: the assignment's D is `f9ece6562c9448c30f0aabd0726d2ffd5aeeb3d3` (D3). The lane moved
through four more digests commits before this snapshot: `b2560829` (D4, re-pinned
`scripts/check-record-drift-r80.mjs`, `6958ca31…` → `53491bf8…`), `53ecca84` (D5, re-pinned
`scripts/negatives-showpicker-r80.mjs`, `fe91f6be…` → `87bb405d…`, and reworked the replay bracket),
`045fccc5` (D6, made the replay rule pair-based — `refused: np > 0 && absMatched >= absNeed` — so the
gap side is reported and no longer refuses), and `a1b14284` (D8, scoped the unparsable-receipt check to
`.json` files or files starting with `{`, so a prose report quoting the schema is not a receipt; it
re-pinned `check-showpicker-r80.mjs`, `negatives-showpicker-r80.mjs` and `kill-power-r80.mjs`). Each
commit updated `freeze.txt` and `claims.json` together; at 19:36 every pin in `freeze.txt` re-derived
from the committed bytes. The claims name the nonce as `tabi-r80-l1-<first 12 of D>`, so a new D moves
the nonce with it — the post-D8 scored receipt is `tabi-r80-l1-a1b142849e91` (7 legs, `failures []`,
`finishedAt 2026-11-07T22:36:18.986Z`).

Scored outputs — post-D8 (19:36 -0300), green:

- **counter** `scored/counter-a.json` (19:36:21): `verdict clean`, `checkCount 57`, `findings []`.
- **battery** `scored/battery-a.json` (19:36:24): `cases 102`, `failed 0`, `cleanVerdict clean`,
  coverage `declared 57, covered 57, uncovered [], unknown []`.
- **kill power** `scored/killpower-a.json` (19:36:54): `mutants 80, killed 80, survived 0,
  crashed 0`, no unapplied.
- In the drift counter's shapes: battery 102/102, kill power 80/80, 57 checks.

Three red snapshots preceded it, and they are the round's instrument history (Mistakes rows 5 and 6):
19:22 battery 103 cases / 1 failed; 19:29 battery 103 / 100 failed with kill power 81/80 and survivor
`replay-gap-threshold-loose` — the replay rule refused the receipt on the gap side, and D6 removed the
gap side from the refusal; 19:34 battery 102 / 98 failed with the counter red on `prior-set-unparsable`
— two prose reports in the walked tree carried the counter's schema literal, and D8 scoped the check to
`.json` files or files starting with `{`. The frozen target is 0 battery failures, 0 survivors, 0
crashed, 57 checks clean; the post-D8 outputs meet it.

## Gate

### Sources — re-opened this round (no new rows; R80Scout opened, L1 re-derives the pins)

- **S216** WHATWG HTML, the input element's `showPicker()` steps —
  `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`. Re-opened 2026-11-07,
  687,515 B, sha256 `b0202de1c0b4…` — byte-identical to the r79 fetch. Located quote (SecurityError
  step, lines 5832-5836): "this's type attribute is not in the File Upload state or Color state, then
  throw a "SecurityError" DOMException." (18 words). The exemption note at 5838-5840 says file and
  color inputs were never guarded by an origin check.
- **S218** Chromium 155.0.8059.84 `html_input_element.cc` —
  `…/third_party/blink/renderer/core/html/forms/html_input_element.cc?format=TEXT`. Re-opened
  2026-11-07, 135,428 B base64 → 2,818 lines, sha256 `405b52c70185…` — byte-identical. Located quote
  (cross-origin block, line 2661): "showPicker() called from cross-origin iframe." (6 words). The
  condition at 2657-2658 excludes `kInputFile` and `kInputColor`; the order is cross-origin
  (2657-2663) → mutability (2666-2671) → gesture (2673-2677) → consume (2679) → open (2681).
- **S212** Chromium 155.0.8059.84 `Page.pdl` —
  `…/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT`. Re-opened 2026-11-07,
  61,911 B, sha256 `e944a3b19fa2…` — byte-identical. Located quote (lines 1280-1281): "When file
  chooser interception is enabled, native file chooser dialog is not shown. Instead, a protocol event
  `Page.fileChooserOpened` is emitted." (20 words). The mode enum at 1301-1302 is
  `selectSingle`/`selectMultiple`; `backendNodeId` is optional and declared at 1304.
- **S208** Chromium 155.0.8059.84 `DOM.pdl` —
  `…/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT`. Re-opened 2026-11-07,
  34,575 B, sha256 `50c460459e50…` — byte-identical. Located quotes (lines 681 and 688): "Sets files
  for the given file input element." (8 words), "Identifier of the backend node." (5 words).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-80.md` (cites S216, S218, S212 and S208;
states the eight generation-r80 laws with their receipt field paths; carries the Limits section,
including the `SecurityError` reachability question, and the frontier). The capability row's
first-working round moves to 80 for generation r80 (the capability entered at round 79).

Rejected (with flip conditions):

- **"The spec's `SecurityError` branch is reachable from page script in this fixture"** — reject: the
  cross-origin child's own script is same-origin with its own document, so its `showPicker()` call
  opens a picker rather than throwing; the parent cannot reach the child document
  (`contentDocument === null`, `contentWindow.document` throws `SecurityError`). The branch needs a
  non-file, non-color input *inside* the cross-origin frame, which the fixture does not hold. Flip: a
  leg whose cross-origin child calls `showPicker()` on such an input and gets `SecurityError`.
- **"A `webkitdirectory` input opens a directory-mode chooser"** — reject: the CDP mode enum has no
  directory value and the measured mode is `selectSingle`, the same as an ordinary file input. Flip: a
  receipt carrying a mode outside `{selectSingle, selectMultiple}`, or a directory-specific mode in a
  later `Page.pdl`.
- **"`showPicker()` has an already-open guard"** — reject: two calls each carrying
  `Runtime.evaluate {userGesture:true}` both succeed and open two pickers in one leg. Flip: a second
  call that throws while the first picker is still open.
- **"A deferred call loses its activation"** — reject: a `setTimeout(…, 0)` scheduled from a trusted
  click's handler succeeds while the activation is live, and its chooser opens during the click. Flip:
  a deferred call that throws `NotAllowedError` with `isActive` still true.
- **"The trigger and the answer are one act"** — reject: `showPicker()` selects nothing and fires no
  pointer/input/change event; the answer (`DOM.setFileInputFiles`) is a separate act that fires
  trusted `input` + `change`. Flip: a `showPicker()` call that fires `input` or `change` on its own.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability acquisition; the frozen predicate, counter, pins,
prior set and kill rule are in `claims.json` and `freeze.txt` and are not restated here). C2 admitted
as the calibration move (`scripts/check-record-drift-r80.mjs`; before state
`lesson-proof/c2-before.json`, 17 mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `ordering` — the deferred leg armed the `setTimeout(0)` listener **after** the prior click, so the click dispatched before the listener existed and the deferred call never ran | probe1 (driver `9b803fef…`) `legs[sp80-deferred-timer]`: `armSendId 18` > `priorReleaseId 16`, `deferredResult null`, `chooserWaitMs 2010` (the full wait), 0 choosers; probe2 (driver `d5c058a7…`): `armSendId 13` < `priorPressId 16`, `deferredResult {ok:true}`, 1 chooser | the pre-freeze probe series (probe1 → probe2), both receipts committed under `controls/c1/probes/` | arm before the click (driver lines 385-397); the counter binds the deferred chooser to `afterSendId ∈ [priorReleaseId, triggerSendId]`, so a chooser that arrives before the arm is a finding, not a pass |
| `baseline` — the deferred leg's chooser baseline was read from that same arm-after-click run, where the leg opened 0 choosers; a baseline frozen there would have written `LEG_SHAPE['sp80-deferred-timer'].opened = []` and the law "the deferred call opens nothing" | probe1 `legs[sp80-deferred-timer].cdpEventLog` carries no `Page.fileChooserOpened`, probe2 carries one; the counter's frozen shape comment names probe2 as its source ("Frozen observation of each leg's page-side shape (pre-freeze run probe2)") | the probe series plus the counter's `legSummary`, which counts every chooser in the leg's log and therefore inherits whatever the baseline run did | freeze the baseline from a run whose arm precedes the click; `legSummary.opened` has no send-id window, so the baseline is only as good as the run it is read from — the send-id binding (`cdp-event-log-closed`) is what makes the attribution, not the count |
| `exemption` — the battery ran the counter on the real lane without exempting the receipt under test by content, so a copy of it inside a walked tree was counted as an unexempted receipt (`prior-set-complete`) | commit `88808c13` (D2) adds three lines to `scripts/negatives-showpicker-r80.mjs`: `...(laneArg === lane ? ['--tree-exempt-sha256', realSha] : [])`, with the comment "the receipt under test lives in the walked trees once it is committed, so every run exempts it by CONTENT" | the battery's own honest run and the mirror-lane cases | content-bound exemption on every real-lane run; the path-shaped `--tree-exempt` stays refused (exit 2, `tree-exempt-path-refused`) and a hash matching no walked file stays a finding (`prior-set-unmatched-exempt`) |
| `survivor` — the first kill-power run left mutants alive (the r79 `survivor` class, QUALITY 155, recurring); the repair is one isolating case per surviving clause | commit `f9ece656` (D3) adds 20 cases under the comment "isolating cases for the kill-power survivors (round-80 repair)": `fixture-child-origin`, `fixture-child-keys`, `ports-collide`, `leg-errors`, `context-duplicate`, `context-id-wrong`, `send-context-dropped`, `send-context-in-parent-leg`, `send-id-gap`, `send-expression`, `plan-answer-send-id`, `cdp-open-id-zero`, `event-before-pre`, `cdp-event-method`, `frame-id-shape`, `cdp-open-frame`, `cross-child-ret`, `cod-child-act`, `answer-state`, `teardown-child-port`. The 19:22 run was 81/81; the 19:29 run (pre-D6) was `mutants 81, killed 80, survived 1, crashed 0`, survivor `replay-gap-threshold-loose` ("the battery still exits 0"); D6 removed the gap side from the refusal and with it that mutant, and the post-D8 run is `scored/killpower-a.json` `mutants 80, killed 80, survived 0, crashed 0` | kill power itself (the survivor list is the work list) | one isolating case per clause, plus the coverage rule that every check id must be the expected id of at least one refusal case; the survivor list is never carried as prose alone. The pre-D6 survivor is a routed defect for r81 unless a witness kills it |
| `count-vs-verdict` — the self-drift leg reads **counts** (battery `cases`, kill power `mutants`/`killed`, counter `checkCount`) and cannot see a case's pass/fail, so a battery with failing cases still satisfies "battery 102/102" | `scored/battery-a.json` at 19:22: `cases 103`, `failed 1`; at 19:29: `cases 103`, `failed 100`; at 19:34 (post-D6): `cases 102`, `failed 98`; at 19:36 (post-D8): `cases 102`, `failed 0`, `cleanVerdict clean`. The battery's own exit rule is `failed === 0 && uncovered.length === 0 && unknown.length === 0 && clean.status === 0`, so its exit was 1 in the first three states and 0 in the last, while its counts were complete in all four. `scripts/check-record-drift-r80.mjs` `numberTriples()` builds `'battery ' + cases + '/' + cases`, which prints the same string for 102/102 passing and 4/102 passing | this seat, reading the scored outputs against the frozen leg (c) | leg (c) is the battery's **exit status**, not its case count. The counter's battery triple is `cases/cases` and prints the same string for 102/102 passing and 4/102 passing, so the record must state the failures beside the count and the verdict must be read from the battery's exit, never from the drift counter's triple |
| `inadmissible-base` — the battery and kill power assume the base receipt is admissible; when the base is refused, almost every battery case fails and the survivor picture is meaningless, because the cases that expect a refusal pass for the wrong reason and the cases that expect acceptance cannot | two instances in one round: (i) 19:29 `counter-a.json` one finding `replay-event-timeline` (`gapMatched 1 = gapNeed 1`, `ownGaps 4`) → `battery-a.json` `cases 103, failed 100`, the only three passing cases being the replay-refusal cases, and `killpower-a.json` 81/80 with survivor `replay-gap-threshold-loose` ("the battery still exits 0"); (ii) 19:34 `counter-a.json` one finding `prior-set-unparsable` (two prose files in the walked tree carrying the counter's schema literal) → `battery-a.json` `cases 102, failed 98`, while the receipt's own replay sims are all `refused: false` | the scored run (the L1's own pipeline), which reports the full case list instead of stopping at the base | read the base case (`honest`) before any other: a red base makes the remaining case results uninformative. D6 removes the gap side from the refusal (instance i) and D8 scopes the unparsable-receipt check to `.json` files or files starting with `{` (instance ii); the post-D8 run is green. The reading discipline — base first — is what the record keeps |

Carried from r79 and still holding: the `scope` class (a counter must fail **closed** on a foreign
receipt, never crash). The r79 counter crashed with a `TypeError` on the r78 file-chooser receipt; the
r80 counter turns an unknown leg into a finding (`leg-<name>: unknown leg`, `spBad.push(name +
':unknown-leg')`) and an unreadable input into `fatal()` with exit 2. Verified by reading the frozen
bytes, not by a run.

## Corrections — round 79 routed defects (C2's subject)

The r79 non-author spot-check (`corpus/lessons/round-79-verifier-spotcheck.md` §6) routed four
defects — 1: the r79 battery count, 2: the r79 kill-power count, 3: dead pointers in the r79 report
and lesson, 4: the Gate quote counts — and `scripts/check-record-drift-r80.mjs` counts 17 mismatches
at base (`lesson-proof/c2-before.json`: `claims 17, mismatches 17`). Records are append-only: every
stale sentence stays where it is and a directional `<stale> → <truth>` pair names it. The corrections
land in four places, each counted:

1. **SCORECARD.md** `## Correction — round 79 record drift` (six items): the r79 C1 row's battery
   88/88 → battery 90/90; kill power → 64/64; the r79 report's dead `c1-killpower-a.json` →
   `selftest-r79-gates.out`; the dead short hash `f154beee` →
   `f154beeff14e349b84fa0d236461132295b7c017`; the r79 lesson's `lesson-proof/kp-run1.json` →
   withdrawn; the three Gate quote counts (12 words) → (10 words), (19 words) → (15 words),
   (23 words) → (11 words).
2. **LOG.md** `## Correction — round 79 record drift`: the r79 entry's battery and mutant counts.
3. **SKILL.md** `## Correction — round 79 gate registry`: 66 semantic mutants → 64 semantic mutants,
   88 cases → 90 cases.
4. **corpus/lessons/round-79.md** `## Corrections — round 80`: battery 88 → 90, the dead
   `kp-run1.json` pointer withdrawn, the three quote counts.

The self-drift leg is the r79 counter's missing piece (routed defect 8): it reads the round's **own**
numbers from the committed scored outputs — battery 102/102, kill power 80/80, 57 checks — and
requires them in SCORECARD, LOG, SKILL, this lesson, the filed report and `claims.json`. Its limit is
Mistakes row 5: it reads counts, not verdicts.
