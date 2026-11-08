# tabi — round 91

L1 `TabiR91`. Base `b1d8f07b` (the round-90 verifier spot-check commit; lane clean). Round 90's
non-author spot-check admitted its C2 and reported C1 NOT VERIFIED; its §8 routed eight defects to
this round. Claims: C1 coverage — the new capability `chromium-showpicker-proxy-linux` (the
same-element origin comparison through a `postMessage` proxy); C2 calibration — the six
lane-measurable r90 routed defects, counted by `scripts/check-record-drift-round91.mjs` over eight
statements.

## Gate

### Sources — opened this round

The L1 and the wave's scout fetched the living pages on 2026-11-08 and staged them under
`.ufo/waves/round-91/sources/`; the staged bytes hash to the live bytes.

- **S225** — WHATWG HTML §9.3 Cross-document messaging, §9.3.2.1 Authors (fetched 2026-11-08,
  132,045 B, sha256 `26fe488d4437`): "Authors should not use the wildcard keyword (*) in the
  targetOrigin argument in messages that contain any confidential information" (19 words).
- **S226** — WHATWG HTML §6.4 Tracking user activation, §6.4.1 Data model (fetched 2026-11-08,
  454,117 B, sha256 `7499db18f2b3`): "a transient activation duration, which is a constant number
  indicating how long a user activation is available for certain user activation-gated APIs"
  (22 words).
- **S219** re-opened in place, not superseded (fetched 2026-11-08, 687,515 B, sha256
  `b0202de1c0b4`): "Throws a " NotAllowedError " DOMException if called without transient user
  activation" (10 words) and "Throws a " SecurityError " DOMException if input is inside a
  cross-origin iframe , unless input is in the File Upload or Color states" (21 words).

Identified 3 / screened 3 / included 2 NEW rows / excluded 1 for a NEW row (S219 re-opened; its
`used-by` gained the r91 note, old→new: `…round-80.md, …round-81.md` → `…round-80.md,
…round-81.md, corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md`). Registry 224 →
226. `## Search log` carries the round-91 entry.

Admitted: `corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md` (cites S225, S226,
S219, S216, S221/S222 and the r91 receipt).

Rejected (with flip conditions):

- **"A parent click activates the cross-origin iframe"** — measured false: the cross-origin
  child's `isActive` stays false and its proxy call throws `NotAllowedError`
  (`sp91-xo-proxy-file-parentact`). Flip: a browser build where the parent activation propagates
  across origins.
- **"The proxy proves Chromium parsed the element's origin"** — the proxy is the lane fixture's
  origin check (`e.origin === served parent origin`); the browser's own check is only measured
  through it. Flip: a source-side reading of the cross-origin frame's activation/origin path.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-91/claims.json`; instrument pins in
`.ufo/waves/round-91/freeze.txt`. Scored: counter clean **30** checks; battery **39** cases /
0 failed (positive control included); kill power **32** mutants / **32** killed / 0 survived /
0 crashed / 0 unapplied; gate runner six gates green; record drift **8 → 0** over 8 statements at
the committed tip. C1's prior set is two independent clean probes (probe4, probe5; 15/15 legs, 0
failures each; the copy-with-a-changed-nonce used only for the pre-freeze counter smoke is not
committed as a prior).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `socket-path-unmeasured` — the first 15-leg probe lost four legs with `no loopback page target`; Chromium's stderr says `Socket path too long: …/org.chromium.Chromium.XXXXXX/SingletonSocket` | `.ufo/waves/round-91/controls/c1/probes/probe1.json` failures (4 legs); the precheck measured `scratch/org.chromium…` but the real profile is `scratch/<leg>/profile/org.chromium…` | the driver's precheck measured a path 30+ bytes shorter than the profile it later created; nothing compared its formula to the launch path | the precheck measures the longest leg path (`leg-01..leg-15/profile/...`) and the leg dirs are `leg-NN`; probe2–probe5 ran 15/15 legs clean |
| `field-omitted-from-record` — the counter's `leg-marks` statement was red on every probe because the driver never pushed the three marks it declared | `leg-marks` finding on probe2/probe3; `check-showpicker-proxy-round91.mjs` LEG_KEYS includes `marks` | the driver's record object initialized `marks: []` but no code appended to it; the counter's other 29 checks were green, so a single missing field hid | the driver pushes `start`/`pre`/`settle`; probe4/probe5 carry three monotonic marks and `lateAfterClose` 0; the batched field fix also added `answerSet` to the record (the answer leg was the only one carrying it, so the strict key set would have refused a clean run) |
| `answer-events-taken-for-a-violation` — the counter first forbade `input`/`change` on every leg, but the answer leg must fire them when `DOM.setFileInputFiles` delivers the file | `event-shape` finding on probe4 for `sp91-xo-proxy-file-answer:child [input@s, change@s]`, with the child state correctly carrying the file | the no-selection law was written for trigger legs and copied to the answer leg without the measured event shape | the answer leg's expected child sequence is the five `cpad` events plus `input@s`,`change@s`; every other leg keeps the empty sequence; probe5 green |
