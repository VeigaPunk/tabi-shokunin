# tabi — round 71 (attempt 1)

Round 70 was admitted (MANIFEST `rounds[1439]`); no fresh-start obligation. Its non-author
spot-check (`corpus/lessons/round-70-verifier-spotcheck.md`) routed R1–R6; their disposition is
below. Base `11b00f644f5af1a4f7827da6956732e0b91023a5`. Pre-freeze instruments and executed
controls `711a38c2`; freeze `04f4330f` (`.ufo/waves/round-71/claims.json`); digests `749a1ab5`
(`.ufo/waves/round-71/freeze.txt`). Axes at start: all six at 9, so each claim works a lowest
axis. Saturation 8 / window 3; capability `chromium-synth-tap-gesture-linux` entered at r70,
inside the window: no stagnation nudge.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
exit 0, 175 rows (`.ufo/waves/round-71/census/start.txt`).

Claims: C1 coverage — capability `chromium-synth-pinch-gesture-linux` (sourced: S176–S178, new
this round). C2 operability — `scripts/verify-live-r71.mjs`, a live-verifier generation whose
runs are bound to the pinned bytes and a sanitised environment; measured by a frozen attack
harness (false passes 4 → 0 on the four named attacks, both positives intact).

## Gate

### Sources — new rows

All three fetched by the L1 on 2026-11-06 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/common/input/<file>?format=TEXT`
(base64, decoded; transport committed beside each staged file in `.ufo/waves/round-71/sources/`,
access times in `<file>.accessed`). `grep -c pinch_gesture corpus/SOURCES.md` was 0 before the append.

- **S176** — `synthetic_pinch_gesture.cc`, 54 lines, sha256
  `4f7fd1017b17d007bdf13b55f75bc7d169a394549278bbda99a60a319bcd33e8`.
  - Located quote (lines 29-30): "if (source_type == content::mojom::GestureSourceType::kDefaultInput) { source_type = target->GetDefaultSyntheticGestureSourceType();"
  - Located quote (lines 34-36): "if (source_type == content::mojom::GestureSourceType::kTouchInput) { lazy_gesture_ = std::make_unique<SyntheticTouchscreenPinchGesture>(params());"
- **S177** — `synthetic_touchpad_pinch_gesture.cc`, 187 lines, sha256
  `67ab6a4b9baf3a6fd7ad24733d615dc8b4c3fba6c86bf60dd00162333a4df9d2`.
  - Located quote (line 88): "if (params().scale_factor == 1.0f) {" — early finish (line 89 `state_ = DONE`).
  - Located quote (lines 160-169): "const int kPixelsNeededToDoubleOrHalve = 200;" … "(scale_factor - 1.0f) * kPixelsNeededToDoubleOrHalve;" with the inverse for `scale_factor < 1.0f` at lines 163-166.
- **S178** — `synthetic_touchscreen_pinch_gesture.cc`, 199 lines, sha256
  `3b5253cebad6376dd952c0dfbdb744d0c2a82b350a1970ddd07bd18ff717e3c0`.
  - Located quote (line 127): "// The two pointers move in opposite directions."
  - Located quote (lines 117 and 119): "synthetic_pointer_driver_->Press(params().anchor.x(), start_y_0_, 0);" and the same with `start_y_1_, 1` — both pointers on the anchor's x.
- Each row: tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-71 note and this lesson.
- Re-opened this round, digests unchanged: `input_handler.cc` (S174's document) fetched again,
  sha256 `72cf0d1d…24f4` equal to `.ufo/waves/round-69/sources/input_handler.cc`; `Input.pdl`
  (S173's document) fetched again, sha256 `5bbc6e23…6e3d` equal to the S173 staged digest.
- Status / recheck / used-by changes (old → new):
  - **S173** used-by `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md, corpus/lessons/round-68.md, corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md, corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md`
    → the same `, corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md` (the note cites Input.pdl:272-284).
  - **S174** used-by `corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md, corpus/lessons/round-69.md, corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md`
    → the same `, corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md` (the note cites input_handler.cc:2106, 2111-2114, 2116-2117, 2119-2125, 295-305).
  - No status or recheck cell changed.

### Admitted

- `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md` (cites S176, S177, S178,
  S174, S173): measured page-side delivery of `Input.synthesizePinchGesture` on this host, each
  behaviour tied to a source line or marked as inference. Scored receipt
  `corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json` (sha256 `19e3c5b6…1ab6`).

### Rejected (with flip conditions)

- **"An omitted `gestureSourceType` makes a touch gesture"** — carried from the tap note (r70
  item 2) to pinch. Reject for pinch: S176:29-31 resolves the default through the target, and
  the scored `default` leg is the ctrl+wheel stream. Flip: a host whose target reports touch as
  its default source.
- **"`scaleFactor` is any positive or zero number"** (S173 Input.pdl:278 says only ">1.0 zooms
  in, <1.0 zooms out"). Reject `0` as a usable value: S177:162-172 gives it no finite end time
  and the scored `zero` leg gets no response in 4 s while zero-delta wheels stream. Flip: a tag
  whose handler validates `scaleFactor > 0` and answers `-32602`.
- **"A touch pinch zooms the page"** — reject on this desktop configuration (touch and slow legs:
  two-finger sequences, scale unchanged). Flip: a receipt on this host where a synthetic touch
  pinch changes `visualViewport.scale`; R71Exec3 probes mobile and touch emulation.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register correction L0,
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| a control labelled degenerate ran the honest producer | the first C1 control loop omitted the `--degenerate <kind>` argument: three "degenerate" runs were honest runs (driver exit 0, counter clean). Caught by the L1 reading the printed exits before commit; the receipts were discarded. Re-staged as a proof: an honest receipt filed as `degenerate-dispatch-wheel` (`.ufo/waves/round-71/lesson-proof/mislabeled/`) | QUALITY 131 would have refused it on exit and finding ids, but no evaluator was run before the receipts were read | `controls/c1/evaluate-c1-controls.mjs` also refuses a control whose receipt does not carry its own degenerate label (`label-mismatch`). Shown able to fail: on the mislabeled proof it exits 1, `failing: degenerate-dispatch-wheel`, `label-mismatch: receipt.degenerate=null` (`.ufo/waves/round-71/lesson-proof/mislabeled-summary.json`); on the real controls 4/4 hold. QUALITY 133. |
| an attack that did not land almost read as a defence | the first pre-freeze harness run triggered the post-pin swap (B) by polling `ps` for the evidence-counter process; on verify-live-r70 the counter finished between polls and the swap never happened (`B-swap-tap … class=NOT-LANDED`), so the r70 baseline showed 3 false passes, not 4. The first run's output files were deleted before the rerun; only the job transcript recorded it | the harness's own `NOT-LANDED` class (a swap that never happened is never scored as a refusal) | trigger on `<scratch>/run-a` appearing, polled every 1 ms, which both verifier generations create after the pin read and before the spawn (`attack-harness.mjs` B watcher); rerun: B landed on both (r70 FALSE-PASS, r71 HONEST-PASS). The evaluator fails any summary with `notLanded > 0`: `blanket-accept.eval.json` holds=false with `attacks not landed 2`. QUALITY 134. The deletion of a red pre-freeze run is itself recorded here: red runs are kept, not replaced. |

## Round-70 routed defects (R1–R6)

- R1 (verify-live-r70 not an execution oracle): C2. verify-live-r71 refuses loader-injection
  variables and node execArgv, spawns children with an allow-listed environment, executes a
  private snapshot of the hashed bytes and re-hashes it, refuses runs under a 6 s wall floor
  (r70 F4) and binds driver stdout to the receipt. The evidence leg still binds the bytes at the
  path, not their provenance (r70 F1): routed on.
- R2 (falsified r70 C1 limit sentence): named correction entry appended to SCORECARD.md
  `## Round 71` (`Correction — round 70 C1 limit`).
- R3 (form-only tap counter, battery proves coverage not kill power): the tap counter and its
  battery are pinned r70 instruments and stay; the round-71 pinch battery adds isolation (a case
  passes only if its expected id fires with no undeclared co-firing id; 98 of 107 cases fire
  exactly one id) and a kill-power control (87/87 single-check mutants killed,
  `.ufo/waves/round-71/scored/c1-kill-power-a.json`). R70Review1 FG1–FG16 on the tap counter:
  routed on.
- R4 (no child-exit listener): the pinch driver has one and refuses an over-long scratch before
  launch (R71Exec4 measures it). The frozen r69/r70 drivers are unchanged.
- R5 (adjacency carry-overs): R71Connector re-checks kama; not absorbed this round.
- R6 (5 missing registry rows; `w1-results.json` per-seat status): unchanged; the round-71 gates
  get their rows.
