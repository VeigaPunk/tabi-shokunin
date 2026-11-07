# gate-review — round-75 lesson Gate, sources S196–S200 (r75)

Reviewer: R75Scribe (leaf seat, read-only). Scope: the lesson's Gate section
(`corpus/lessons/round-75.md`, "### Sources — new rows" and the Admitted/Rejected entries it
rests on), checked against the staged bytes in `.ufo/waves/round-75/sources/` and against
`corpus/SOURCES.md`. Verdict: **HOLDS for all five source rows** — every located quote occurs
at the stated line, every quote is ≤ 25 words, every digest and line count matches, the
append changed no existing row, and the census now reports exactly the two new W04 warnings
the lesson predicts. One fix cell in the lesson's **Mistakes** table is contradicted by its own
evidence file (`F6`); details at the end.

Commands and outputs: `quote_check.txt` (quotes, word counts, file identity),
`census-now.txt` (validator at the current tree), plus the git commands cited inline.

## Per-row check (the lesson's five new rows)

| row | lesson's located quote | stated line | actual line | words | ≤25 | file identity |
|---|---|---|---|---|---|---|
| S196 | "Prevents default drag and drop behavior and instead emits `Input.dragIntercepted` events." | 265 | **265** | 11 | yes | 336 lines, sha256 `5bbc6e23…66e3d` — matches lesson and `FETCH.txt` |
| S197 | "// Only allow when Input.setInterceptDrags is disabled." | 1582 | **1582** | 6 (+`//`) | yes | 2,343 lines, sha256 `72cf0d1d…24f4` — matches |
| S197 | "widget_host->DragSourceSystemDragEnded();" | 1539 (dragCancel branch) | **1539** | 1 | yes | same file |
| S198 | "// IPC RACE CONDITION: do not allow this drop. DragTargetDragLeave(point_in_viewport, screen_point);" | 736–737 | **736–737** | 10 (+`//`) | yes | 6,210 lines, sha256 `5178b1e9…8c17` — matches |
| S198 | "current_drag_data_ = nullptr;" | 1474 | **1474** | 3 tokens | yes | same file |
| S199 | "DataTransferAccessPolicy policy = DataTransferAccessPolicy::kTypesReadable;" | 853 | **853** | 4 | yes | 1,535 lines, sha256 `4f181d76…92fc` — matches |
| S199 | "CreateDraggingDataTransfer( DataTransferAccessPolicy::kReadable, drag_data);" | 291–292 | **291–292** | 3 | yes | same file |
| S200 | "String DataTransfer::getData(const String& type) const { if (!CanReadData()) return String();" | 352–354 | **352–354** | 10 | yes | 706 lines, sha256 `e5a7f7a1…028c` — matches |

Evidence: `quote_check.py` (`quote_check.txt`) normalises whitespace and checks contiguity;
all eight lesson quotes report `PASS … OK`; file identity reports `PASS` for all five files
(line count **and** sha256 prefix).

Row-cell audit (`corpus/SOURCES.md` lines 210–214, 11 columns):
`kind = code`, `tier = A`, `status = mined`, `opened = 2026-11-07`, `recheck = on-release`,
`used-by = corpus/knowledge/chromium-drag-intercept-runtime-round-75.md, corpus/lessons/round-75.md`
— all five rows carry exactly what the lesson's "Each row" sentence claims.

## Gate claims that hold (with the command that shows it)

1. "Before the append, `grep -c 'web_frame_widget_impl\|drag_controller.cc\|data_transfer.cc'
   corpus/SOURCES.md` was 0" — `git show c19a520f:corpus/SOURCES.md | grep -c
   'web_frame_widget_impl\|drag_controller.cc\|data_transfer.cc'` → `0`.
2. "195 rows" at census start — `git show c19a520f:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3,} '`
   → `195`; the tree now has 200 (`grep -c '^| S[0-9]' corpus/SOURCES.md` → `200`), i.e. the
   five new rows.
3. "S196 and S197 add W04 (same URL as S173/S187 and S174/S188 across scopes)" — validator run
   here returned **exit 0** and the only new W04 lines are
   `tabi W04 S196 duplicate url …/Input.pdl?format=TEXT across scopes` and
   `tabi W04 S197 duplicate url …/input_handler.cc?format=TEXT across scopes`
   (`census-now.txt`; 27 W04 warnings at base → 29 now).
4. "No status, recheck or used-by cell of an existing row changed" —
   `git diff --stat c19a520f d71951a7 -- corpus/SOURCES.md` → `5 insertions(+)`, 0 deletions;
   `git diff … | grep -c '^-[^-]'` → `0`.
5. "byte-identical to the S173/S187 staged copies" / "byte-identical to S188" —
   `sha256sum` over every staged copy: all `Input.pdl` copies
   (`.ufo/waves/round-68/sources/`, `round-74/sources/`, `round-75/sources/`) are
   `5bbc6e23…66e3d`; all `input_handler.cc` copies (`round-59`, `round-69`, `round-71`,
   `round-74`, `round-75`) are `72cf0d1d…24f4`.
6. Rejected-claim flips are measured, not asserted:
   - "`dragCancel` delivers `dragleave`" — 0 events in the `ext-cancel` leg on **14/14**
     receipts (`derive.txt` per-leg derivation).
   - "`Input.dispatchDragEvent` accepts `dragLeave`" — PDL enum lines 81–85 contain only
     dragEnter/dragOver/drop/dragCancel; `bad-type` returns
     `{"code":-32602,"message":"Unexpected event type 'dragLeave'"}` on 14/14.
   - "A drop on any element under the point fires `drop`" — `ext-drop-nz` is
     `dragover@nz` then `dragleave@nz`, `nz` text unchanged, `drops` still 1, on 14/14;
     S198 734–738 states the mechanism (`kNone` → `DragTargetDragLeave`).
7. Admitted note sentence "measured identically on 13/13 pre-freeze runs (4 probes + 9
   smokes)" — the 13 pre-freeze receipts have identical `legShape` and identical event tuples
   (verified 14/14 including the (a) receipt). See `note-review.md` F1 for the one thing this
   sentence does not say (p1–p3 carry the producer's old `REFUTED` verdict under a superseded
   driver digest).

## Spot-check decisions a non-author closure can take

**ADMIT — S196 (protocol), with the row as written.** The row's located quote is the
`setInterceptDrags` comment at line 265, 11 words, in bytes of
`sha256 5bbc6e23…66e3d`; the row's scope ("DragData type, `dispatchDragEvent` enum,
`setInterceptDrags`, `dragIntercepted`; not runtime delivery") is exactly what the PDL
contains and nothing more. A closure that wants to confirm it without trusting this report:
```
sed -n '265p' .ufo/waves/round-75/sources/Input.pdl          # quote, line 265
sed -n '69,95p;332,336p' .ufo/waves/round-75/sources/Input.pdl | grep -c 'dragEnter\|dragOver\|dragCancel\|dragIntercepted'
sha256sum .ufo/waves/round-75/sources/Input.pdl              # 5bbc6e23…66e3d
```
The row's `teaches` cell is a protocol statement ("replaces a native drag with a
dragIntercepted event whose data the client replays"), and the receipts show exactly that:
one `Input.dragIntercepted` (mask 17) per run and every `INTERCEPTED` leg replaying it
byte-for-byte (0 mismatches over 14 receipts).

**REJECT — "`Input.dispatchDragEvent` accepts `dragLeave`".** The lesson rejects this for
this producer, and the rejection is mechanically checkable three ways:
```
sed -n '81,85p' .ufo/waves/round-75/sources/Input.pdl        # type enum: dragEnter dragOver drop dragCancel
sed -n '1547,1550p' .ufo/waves/round-75/sources/input_handler.cc   # the InvalidParams branch
python3 -c "import json;d=json.load(open('corpus/evidence/round75/chromium-drag-intercept/receipt.json'));print([l['cdpError'] for l in d['legs'] if l['name']=='bad-type'])"
```
Expected: four enum values; the `Unexpected event type '%s'` branch at 1548–1549; and
`[{'code': -32602, 'message': "Unexpected event type 'dragLeave'"}]` on every receipt
(14/14, `table_check.txt`). Flip condition as the lesson states it (a PDL tag that adds
`dragLeave`) is not present at 155.0.8059.84.

## F6 — a lesson **Mistakes** fix cell contradicted by its own evidence

Lesson row 2, `fix` cell: "the four mutants re-run against the new battery are killed
(`lesson-proof/survivor-recheck-after-cases.txt`: **each fails exactly its new case**)."

`.ufo/waves/round-75/lesson-proof/survivor-recheck-after-cases.txt` (read verbatim):

```
m0 251/254 failed=replay-timeline-sub-quantum,replay-timeline-whole-shift-1ms,replay-timeline-whole-shift-100ms
m1 253/254 failed=drop-acceptance-extra-leave
m2 253/254 failed=source-lifecycle-end-before-drop
m3 253/254 failed=coordinate-law-y
```

- m1–m3 fail exactly one case each — agrees.
- **m0 fails three cases**, so "each fails exactly its new case" is false for at least one of
  the four. Killed-ness (the claim that matters for `holds`) is not in doubt: all four mutants
  are killed. The parenthetical overstates the isolation of m0.
- The file names its mutants `m0..m3` only. The mapping to
  `M-timeline-tol-exact / M-drop-counts-dropped / M-lifecycle-order-dropped /
  M-coordinate-y-dropped` (the survivor list in `killpower-trial-p4-survivors.json`) is not in
  the evidence file or anywhere in `lesson-proof/`; no harness that produced
  `m0..m3` survives in the lane. `[INFERENCE]` m0 is `M-timeline-tol-exact` by order, but a
  non-author cannot confirm it.

Proposed replacement, same evidence: "the four survivors are killed by the new battery
(`lesson-proof/survivor-recheck-after-cases.txt`, 251–253 of 254 cases pass); `m1`–`m3` fail
exactly their new case, `m0` (the timeline mutant) fails its new case and two pre-existing
whole-shift cases as well" — and add the mutant ids to the file's lines.

## Consistency of the rest of the Gate (checked, no finding)

- Instrument requirements the lesson routes to r75 are present in code: the counter refuses
  without `--expect-driver-sha256`/`--expect-nonce`/≥1 `--prior` (usage exit 2, counter
  lines 115–119); `negatives-dragdrop-r75.mjs` refuses unless three `--laundered` receipts,
  one per degenerate kind, are given (`usage(...)` at line 36); `kill-power-r75.mjs`
  scores `killed` only on battery exit 1 with a parsable summary whose `failed` is non-empty,
  treats every other outcome as `crashed`, and reads stdout on `close` (lines 96–116, 130).
- Mistake row 1 evidence reproduces: `controls-first-pass-1e-12-expectation.json` has
  `allOk: false` and the single failing control `replay-forged-1e-12`, `ids:
  ["replay-event-timeline"]` (so the "expected `event-time-quantum` as well" belief was wrong
  and the file shows it).
- Mistake row 3 numbers reproduce: `timeline-honest-pairs.json`
  `gapMatchHistogramEighths {0:120, 1:32, 2:4}` (sum 156), `firstChosenGapThreshold 0.5`,
  `maxGap 0.25` (= 2 of 8), `refusedAtFirstChosenGapThreshold 0`; counter `GAP_FRAC = 0.75`.
- Mistake row 4 evidence reproduces: `git grep -l '"schema":
  "tabi-chrome-cdp-dragdrop-r75"' d71951a7 -- '*.json' | wc -l` → `25`;
  `prior-set-enumeration-toplevel.txt` → 16 paths, equal to `prior-set.txt`; the claims'
  `priorSet` sentence states both lists (16 receipts + 9 `pf-smokeN.counter.json`).
- Battery case names the lesson cites exist in `c1-negatives-a.json`:
  `replay-timeline-prior-has-extra-event`, `replay-timeline-prior-missing-event`,
  `replay-timeline-whole-shift-1ms`, `replay-timeline-whole-shift-100ms`, plus
  `replay-timeline-sub-quantum` and the three survivor cases; controls
  `replay-forged-whole-shift-0.1ms`/`-100ms` are refused with `replay-event-timeline`
  (`controls-summary.json`).
- The claim's prior-set sentence and the 16-element `priorSet` in
  `scored/c1-counter-a.json` agree path-for-path.
