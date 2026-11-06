# tabi — round 70 (attempt 1)

Round 69 was admitted (MANIFEST `rounds[1423]`); no fresh-start obligation. Its non-author
spot-check (`corpus/lessons/round-69-verifier-spotcheck.md`) routed R1–R6; their disposition is
below. Base `90b9ff045542651fb59814fe32f73fee0d1d8243`. Pre-freeze instruments and executed
controls `b5d77c4c`; freeze `7c42ef25` (`.ufo/waves/round-70/claims.json`); digests `2cde310f`
(`.ufo/waves/round-70/freeze.txt`). Axes at start: all six at 9 (after r69's adjacency move), so
each claim works a lowest axis. Saturation 8 / window 3; capability
`chromium-synth-scroll-gesture-linux` entered at r69, inside the window: no stagnation nudge.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
exit 0, 174 rows (`.ufo/waves/round-70/census/start.txt`).

Claims: C1 coverage — capability `chromium-synth-tap-gesture-linux` (sourced: S175, new this
round). C2 operability — `scripts/verify-live-r70.mjs --profile synthscroll-r69`, a live
re-derivation of the r69 capability that the r69 counter could only read from a receipt.

## Gate

### Sources — new rows

- **S175** — Chromium 155.0.8059.84 `content/common/input/synthetic_tap_gesture.cc`,
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/common/input/synthetic_tap_gesture.cc?format=TEXT`
  (base64-decoded). Access 2026-11-06 (L1; `.ufo/waves/round-70/sources/synthetic_tap_gesture.cc.accessed`).
  Staged `.ufo/waves/round-70/sources/synthetic_tap_gesture.cc`, sha256
  `ac27658fe7199e01f210bbfb29613ab99a7720fe8e2ecdb100b1a2d3672bd331`, 134 lines; the base64
  transport is committed beside it and decodes to the same digest. A first attempt at
  `content/browser/renderer_host/input/synthetic_tap_gesture.cc` returned 404 (the file lives
  under `content/common/input/` at this tag).
  - Located quote 1 (lines 24-25, 2 statements): "params().gesture_source_type = content::mojom::GestureSourceType::kTouchInput;"
    inside `if (params().gesture_source_type == …kDefaultInput)` (line 22).
  - Located quote 2 (line 100, 6 words): "if (params().duration_ms == 0) {" — release in the same
    step; otherwise `state_ = WAITING_TO_RELEASE` (line 109).
  - Tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-70 knowledge
    note and this lesson. No existing row registers this document (`grep -c synthetic_tap_gesture corpus/SOURCES.md` was 0 before the append).
- Status / recheck / used-by changes (old → new):
  - **S173** used-by `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md, corpus/lessons/round-68.md, corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md`
    → the same `, corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` (the note cites Input.pdl:318-330).
  - **S174** used-by `corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md, corpus/lessons/round-69.md`
    → the same `, corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` (the note cites input_handler.cc:2265, 2270-2273, 2285-2289, 2297-2304).
  - No status or recheck cell changed.

### Admitted

- `corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` (cites S175, S174, S173): the
  measured page-side delivery of `Input.synthesizeTapGesture` on this host, each behaviour tied
  to a source line or marked [INFERENCE]. Scored receipt
  `corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json` (sha256 `0a51f3a6…d631`).

### Rejected (with flip conditions)

- **"`tapCount:2` performs a double-click"** (the PDL's own comment, S173 Input.pdl:326). Reject:
  the scored run shows two `detail:1` clicks and no `dblclick`. Flip: a run on this tag where
  `tapCount:2` yields `detail:2` or `dblclick`.
- **"An omitted `gestureSourceType` uses the platform's preferred input"** for taps (S173
  Input.pdl:328-329). Reject for taps: S175:22-26 rewrites it to touch and the default leg equals
  the touch leg. Flip: a tag whose constructor no longer rewrites `kDefaultInput`.
- **"A synthetic touch tap clicks"** — reject on this host (default and touch legs, no click).
  Flip: a receipt where a synthetic touch tap delivers `click`; R70Exec3 probes emulation
  variants (see Attack findings).

Assimilation: none (`merge/tabi/` adoption stays closed pending the register correction L0,
`tabi | round-57`). `considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| refusal for the wrong reason counted as a passing control | attempt 1 of the control run: Chromium died at launch (`FATAL … process_singleton_posix.cc:313] Socket path too long`, the drivers set `TMPDIR` to a scratch path whose singleton socket exceeded 107 bytes) and the r69 driver waited 240 s (`no loopback page target`); every C2 control expecting exit 1 "passed" on exit code while its findings were `run-a-failed`, not the counter findings it was meant to show; the positive control failed. Seen only because the positive control failed. | none at the time (the control runner compared exit codes only) | `.ufo/waves/round-70/controls/evaluate-controls.mjs` checks exit AND expected finding ids; `scripts/verify-live-r70.mjs` refuses an overflowing scratch before launch (control `c2/scratch-too-long`, exit 2). Shown able to fail: the evaluator on a copy of the controls with the attempt-1 findings restored reports `30/31 hold; failing: c2/forger-degenerate-js-scroll` (`.ufo/waves/round-70/lesson-proof/evaluator-wrong-reason-summary.json`). QUALITY 131. |
| control judged with the wrong pin | first verifier draft judged the committed evidence receipt with the override driver pin, so `evidence-counter` fired on every forger control for a reason unrelated to the forgery (first control run, before `b5d77c4c`) | none | evidence and live receipts are judged against the profile's frozen driver digest; run binding compares the receipt digest to the executed binary (`verify-live-r70.mjs` header (4)); controls `forger-rewrite-full-lying` (refused by binding) and `-honest` (refused by the counter) separate the two |
| battery without a coverage rule (r69 R2 class) | r69 R69Mut2: 4 counter checks had no negative | the mutation seat, after the fact | `negatives-synthtap-r70.mjs` fails with `coverage-gap` unless every check id the counter lists (`--list-checks`) is the expected id of a case: 95 cases over 84 check ids (`.ufo/waves/round-70/scored/c1-negatives-a.json`). QUALITY 132. |
| a frozen claim's limit sentence overclaimed the verifier's guarantee | claims.json C1 `limit`: "a receipt passes only if it names the executed binary and that binary is the frozen driver". R70Critic greened the real verifier with pins frozen and no live run twice: an inherited `NODE_OPTIONS` preload that rewrites the driver's `--out` receipt (`w1/R70Critic/receipts/c1-env-verifier.json`), and a same-user driver swap after the pin read at `scripts/verify-live-r70.mjs:122`, before the spawn at `:158` (`c1-toctou-verifier.json`, 24 ms runs). The controls only tampered with the driver before the verifier started. | none (every forger control used the `--driver` override; no control varied the environment or the bytes after the pin read) | not fixed this round (the verifier is frozen): planned r71 generation (snapshot exec + re-hash, sanitised env, wall-time floor, stdout cross-check, one negative each). Counts only once a control shows it failing first. |

## Round-69 routed defects (R1–R6)

- R1 (counters prove form only): for the r69 synthscroll capability, fixed by C2 — the
  verifier refuses the rewritten replay that the r69 counter accepts
  (`controls/c2/r69-counter-accepts-rewrite` exit 0 vs `controls/c2/forger-rewrite` exit 1). The
  r69 sibling-matrix counter (adjacency) is unchanged: routed on.
- R2 (battery gaps): the r69 batteries are pinned and stay; the r70 battery carries the
  coverage rule (Mistakes row 3).
- R3 (receipt names a scratch path): r70 scored receipts name lane paths
  (`scored/c1-negatives-a.json` `real`); negative case files live in scratch by design and are
  regenerated by re-running the command.
- R4 (`w1-results.json` lacks a per-seat status): the file is written by the orchestrator, not
  the lane; noted again in the report.
- R5 (kotoba↔tabi disagreement): integrator arbitration still owed (L0 `tabi | round-69`).
- R6 (5 pre-existing missing registry rows): not touched this round (outside both claims); the
  round-70 gates get their rows (QUALITY 129).

## Attack findings (wave w1) — routed, not amended

One v1 wave of 12 seats, all settled (`.ufo/waves/round-70/w1-results.json`). Instruments stay as frozen.

- **R70Critic** — C1 FALSIFIED as an oracle (Mistakes row 4: env preload and post-pin swap both exit 0 with pins frozen); leg (d) was false at `bbdbf62f` because the SCORECARD row had not landed yet (integration order; the row lands in the next commit). C2 HOLDS-WITH-LIMIT: a real operability move; the same bypass applies; the evidence leg is form-only.
- **R70Review1** — the counter is clean on the scored receipt and both producer-verdict polarities fire at the right check, but 16 crafted receipts pass it (FG1–FG3 other `Input.synthesize*` / `Input.setIgnoreInputEvents` sends unread by the look-alike rule; FG4–FG5 forged trusted `pointermove` events never checked for target or position; FG6–FG8 timestamps not type-checked; FG9–FG15 unread fields; FG16 the declared nonce rebrand). FB1: no battery case isolates the `leg.skipped === false` conjunct of the error branch.
- **R70Mut1** — 31 single-line counter mutants, 10 killed, 21 survive the battery (15 accept a real escape, e.g. M25 `hold` lower bound 395 → 0, M30 any error string accepted for `outside`). The coverage rule (QUALITY 132) proves every check id has a negative, not that each negative isolates its check.
- **R70Mut2** — 17 verifier mutants, 15 killed; survivors are one equivalent (tap fingerprint detail, pinned by the counter) and one verdict-redundant (evidence agreement). No committed control exercises the counter-pin refusal.
- **R70Review2** — PASS on run binding, frozen-digest judging, exit-4 semantics and the scratch guard; F1 the evidence leg binds the bytes at the path, not provenance; F2 `existedBefore` is always false (fresh dir); F4 `wallMs` is recorded, never checked; F6 hash-then-spawn (raised to a false pass by R70Critic).
- **R70Exec1 / R70Exec2** — independent cold runs: synthtap-r70 exit 0 (nonces `tabi-r70-live-c0940d9c31-a`/`-9d98733c71-b`) plus own driver + counter exit 0; synthscroll-r69 exit 0 and the controls reproduced.
- **R70Exec3** — 24 variants × 2 passes: a synthetic touch tap never clicks (emulation, mobile metrics, duration 0, tapCount 1–3); clicks come from `Input.dispatchTouchEvent` or from a mouse tap converted by `setEmitTouchEventsForMouse`, where `tapCount:2` does double-click. `pen` → `-32602 Unknown gestureSourceType`. Integrated into the knowledge note as a scope limit on item 2 and new item 5.
- **R70Exec4** — the socket limit is TMPDIR + 45 bytes: 62-byte TMPDIR works, 63 fails in ~150 ms; both drivers then wait ~240 s (no child-exit listener). The verifier guard is exact for symlink-free paths; it is too strict for a long symlink to a short path and not a proof for a short symlink to a long path.
- **R70Scout** — S175 re-opened independently: transport and decoded digests equal the staged bytes (`ac27658f…d331`); quotes located (L22-25, L100, L106).
- **R70Connector** — no sibling holds the tap surface (bounded absence, two scanners); two matrix changes reported, not absorbed: kama `none → adjacent` (listener census `:56` CDP 9222 row) and the open kotoba label contradiction; 9 of 20 sibling heads moved since the r69 snapshot.
- **R70Scribe** — drafted the registry rows and the capability row; the landed rows check conformant; its battery-row patch is not adopted (the battery is listed as an instrument, not a gate).
