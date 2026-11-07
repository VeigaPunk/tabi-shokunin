author: hyaku closure (non-author integrator, @m_zfl)

# tabi round 75 — verifier spot-check (non-author closure)

Lane round 75, base `c19a520fdfa574a5c082b09130b7dbfcdd1e99eb` → tip `a92837d05dde6ea5a5cc9053c5bb83599c84f62f`.
Report `.ufo/reports/round-75/tabi.md` (fleet repo). Driver digest (copied from the mutable `.ufo/watchdog.log`):

    2026-11-07T01:31:10-03:00 launch tabi round=75 pgid=1431067 driver=hyaku-inline attempt=1
    2026-11-07T03:41:34-03:00 complete tabi round=75; hyaku-inline attempt=1

## Step 1 — conformance

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-75/tabi.md` | `tabi-shokunin d1f53fc6e85825a8c0a8a2e34968f78aec3cb57f`, committer date 03:41:09 (before complete 03:41:34) | pass |
| SHONEN heading, one line per box | `grep -c '^## SHONEN'` on the report; `grep -nE '^\s*- \[' SHONEN.md` | 1 heading; 4 `[~]` lines for the 4 SHONEN.md boxes | pass |
| Cited commits exist and are ancestors of `master` | `git cat-file -e <h>^{commit} && git merge-base --is-ancestor <h> master` for c19a520f, d71951a7, b1ddabc5, 57f28cf1, 8204c176, 061b10d0, a92837d0 | 7/7 ok | pass |
| Lane pushed, nothing left over | `scripts/hyaku/jj-lane.sh state …`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; remote = a92837d0 | pass |
| Prompt carries the template contract | `grep -nE '^## ' .ufo/prompts/tabi-round-75.md` | sections 1, 2, 2b, 3, 4 (report contract incl. SHONEN), 5, 6 (hyaku addendum), 7 + run-15 notes | pass |
| Freeze ordering | `git log --format='%h %ad %cd'` | pre-freeze d71951a7 (c 02:46:49) → freeze b1ddabc5 (02:47:31) → D 57f28cf1 (02:47:43) → scored 8204c176 (02:53:07) → dispatch 061b10d0 → tip a92837d0 (03:40:03) | pass |

Conformance notes (status-neutral): d71951a7 author date 01:27:55 precedes the 01:31:10 launch — the
inherited jj change date (committer 02:46:49), same pattern as r74; the dispatched prompt was committed by
`tabi-shokunin` (d4c9dc9e, "dispatch evidence"), as in prior hyaku-inline rounds.

## Step 2 — claims

One claim, **C1 coverage — capability `chromium-drag-intercept-linux`**, frozen predicate `C1-DRAGINTERCEPT-R75`
(`.ufo/waves/round-75/claims.json`, legs a–d).

### Re-measured (plain commands over committed bytes, run by this judge)

| Measurement | Command | c19a520f | a92837d0 | Reported |
|---|---|---|---|---|
| Capability row (leg d) | `git show <rev>:SCORECARD.md \| grep -c '^\| \`chromium-drag-intercept-linux\` \|'` | 0 | 1 | 0 → 1 ✔ |
| Notes citing the drag commands (leg d) | `git grep -lE 'dispatchDragEvent\|setInterceptDrags' <rev> -- corpus/knowledge \| wc -l` | 0 | 1 | 0 → 1 ✔ |
| Note `source:` line (leg d) | `git show a92837d0:corpus/knowledge/chromium-drag-intercept-runtime-round-75.md \| grep '^source'` | — | `source: S196, S197, S198, S199, S200 (…); S201 (…)` | cites S196–S200 ✔ |
| Knowledge files | `git ls-tree -r --name-only <rev> corpus/knowledge \| wc -l` | 87 | 88 | 87 → 88 ✔ |
| SOURCES rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\| S[0-9]{3,} '` | 195 | 201 | 195 → 201 ✔ |
| Freeze digests | `git show <rev>:<file> \| sha256sum` at 8204c176 and a92837d0 vs `57f28cf1:.ufo/waves/round-75/freeze.txt` | — | 7/7 match at both revisions (driver d604552e…, counter 9b370790…, battery 9df82b2e…, kill power c227da00…, prior-set 4d85dfb2…, claims b6b4183e…, run-scored 84ae7b48…) | instruments unchanged after D ✔ |
| Prior set | `git show a92837d0:…/controls/c1/prior-set.txt \| grep -vc '^#'` | — | 16 | 16 ✔ |
| Census | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | — | exit 0, `ok`, 29 W04 (S196/S197 share URLs with S173/S187, S174/S188 across scopes) | 201 rows / 29 W04 ✔ |

### Evidence-verified (lane-owned gates; PROTOCOL §Gate standard Closure consequence — not executed by this judge)

- Leg (a): `scored/c1-driver-a.exit` 0; `scored/c1-counter-a.exit` 0; `c1-counter-a.json` → `verdict clean`,
  `checkCount 146`, `findings 0`, `priorSet 16`; receipt `nonce tabi-r75-l1-57f28cf128e6`, `driverSha256` = frozen
  driver digest; `c1-a.args.txt` carries the same nonce and digest. Holds.
- Leg (b): `w1/R75Exec1/counter.json` → `verdict clean`, `checkCount 146`, `findings 0`, nonce
  `tabi-r75-exec1-57f28cf128e6`, 17 priors, the 17th the (a) receipt. Holds.
- Leg (c): `scored/c1-negatives-a.exit` 0, `allOk true`, `passed 254`, `failed []`, `coverageGap []`, `launderedCases 3`;
  `scored/c1-kill-power-a.exit` 0, `unmutatedExit 0`, force-true 146/146, semantic 40/40, `crashed []`, `holds true`.
  Seat re-runs `w1/R75Exec1/negatives-{a,b}.json` allOk 254, `kill-power-a.json` holds 186/186. Holds.
- Selftest `scored/selftest-r75-gates.out`: `clean=true cases=12 failed=none`, `exit=0`. Registry row
  `check-dragdrop-r75` present at `SKILL.md` `## Round 75 gate registry` (registry home). Conformant.

**C1: verified** — all four legs hold as frozen.

### Non-predicate findings ruled

- R75Critic F1–F3: the frozen `limit` sentence is directionally right but imprecise (0.1 ms grid, 9 of 17 events,
  battery/kill power are receipt readers too). R75Revenger: frozen `priorRound` item 2 omits r74 F4/F5, which
  survive this generation's battery (`w1/R75Revenger/mutant-tol-0.045.battery.json`, `mutant-grid-0.02.battery.json`).
  Both are marked in SCORECARD `## Round 75` "Correction" and the lesson; neither is a predicate leg.
  Ruled **calibration unchanged**, not harmed: no claim on calibration, the false sentences are marked in-round,
  and the scored receipts are independent cold runs.
- R75Review1/R75Review2/R75Mut1 (counter false greens on unread fields; unattributed kills; 27 survivors with
  26 acceptance witnesses) bound the instrument, not the predicate; routed to r76 by the lane.

### SCORECARD / owned axes

`git diff c19a520f a92837d0 -- SCORECARD.md` is append-only (`## Round 75` section: claim table, capability row,
correction, knowledge/registry line, r76 plan); no axis score line changed. `PROVINCE.md`, `SHONEN.md` untouched.

| Axis | Verdict |
|---|---|
| coverage | improved |
| calibration | unchanged |
| depth | unchanged |
| freshness | unchanged |
| operability | unchanged |
| adjacency | unchanged |

## Step 3 — discernment spot-check (`corpus/lessons/round-75.md` `## Gate`)

Sources re-opened by this judge from upstream
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`, base64-decoded;
sha256 prefixes match the lesson: Input.pdl `5bbc6e23`, input_handler.cc `72cf0d1d`, web_frame_widget_impl.cc
`5178b1e9`, data_transfer.cc `e5a7f7a1`; line counts 336 / 2,343 / 6,210 / 706 match.

| Item | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| `chromium-drag-intercept-runtime-round-75.md` (data readable only in drop; dispatched drop without acceptance → dragleave) | admit | data_transfer.cc 352–354 and 612–615; web_frame_widget_impl.cc 734–738 | agree | `getData` returns `String()` unless `CanReadData()`, which is `kReadable \|\| kWritable` only; `if (drag_operation_.operation == DragOperation::kNone) { … DragTargetDragLeave(…); return; }` — the note's mechanism matches the source and 13 pre-freeze runs |
| "`dragCancel` delivers `dragleave` to the current target" | reject | input_handler.cc 1538–1546 | agree | the DragCancel branch calls only `DragSourceSystemDragEnded()` and `DragSourceEndedAt(…kNone…)`; no `DragTargetDragLeave` |
| "`Input.dispatchDragEvent` accepts `dragLeave`" | reject | Input.pdl 78–85; input_handler.cc 1547–1549 | agree | enum lists dragEnter/dragOver/drop/dragCancel only; else-branch `InvalidParams("Unexpected event type '%s'")` |
| "A drop on any element under the point fires `drop`" | reject | web_frame_widget_impl.cc 734–738 | agree | `kNone` operation turns the drop into `DragTargetDragLeave` |

New-row quote check: **S200** (row anchor "decoded lines 352-354 … 606-615"; lesson quote lines 352–354
"String DataTransfer::getData(const String& type) const { if (!CanReadData()) return String();") — 10 words (≤ 25),
verbatim across the three decoded lines. **S196** quote line 265 "Prevents default drag and drop behavior and
instead emits `Input.dragIntercepted` events." — verbatim at decoded line 265. Agree.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 29 W04.

## Trend verdicts

- **expansion: improved** — capability row 0 → 1; knowledge 87 → 88 on drag ground no prior note held (0 → 1 notes
  citing the drag commands), its `source:` citing mined tier-A rows S196–S200; registry 195 → 201.
- **quality: improved** — the r74 declared limit (whole-timeline shift) is refused by this generation (control
  `replay-forged-whole-shift-0.1ms`, `controls-summary.json` allOk), kill power scores a crash as crashed (scored
  `crashed []`), the prior set is enumerated by schema; the note's measured-only limit was deepened to sourced
  (S201); imprecise frozen sentences are marked, not left standing. No admitted entry failed re-check here.
- **discernment: improved** — this spot-check agrees with the gate on 1 admit and 3 rejects; QUALITY 141–142 each
  rest on a mined mistake with a fail-able proof (`lesson-proof/prior-set-enumeration-raw.txt`,
  `lesson-proof/killpower-trial-p4-survivors.json`).

## Routed defects (lane must address next round)

1. r74-routed F4/F5 (tolerance 0.05 → 0.045, grid 1e-4 → 0.02 survive the battery) were not applied this round —
   apply as bracketing battery cases + semantic mutants in r76 (the lane already routes them).
2. Mistakes row 5 has `captured-by: none`: add a grounded QUALITY criterion that a routed defect's applicability
   is re-derived against the new generation's instrument bytes before the freeze.
3. Counter generation r76: pin host version/product + headless argv, check the CDP error code, compare
   DataTransfer structurally, read priors from the committed file (R75Review1 F1–F6).
4. Kill power: attribute each kill to a named case, classify crashes, minimum-mutant guard (R75Review2 §3–§5);
   fold R75Mut1's 26 acceptance witnesses into the battery.
5. Frozen `limit` wording (R75Critic F1–F3): state the 0.1 ms grid and event-count threshold exactly in the next
   freeze.

SHONEN: all four boxes `[~]`; boxes 2–4 cite committed pointers a non-author can check (LOG `## Round 75`,
`w1/R75Exec{1,2}/report.md`, PROVINCE untouched + `w1/R75Connector/report.md`) — promotion review is operator-owned.
