# tabi — round 91

L1 `TabiR91`. Base `b1d8f07b0d5895ffdd5bf9a143d2b591414fabea` (the round-90 verifier spot-check
commit; lane clean). Round 90's non-author spot-check (`corpus/lessons/round-90-verifier-spotcheck.md`)
routed eight defects to this round (§8); its C1 was an honest NOT VERIFIED because generation r90
moved a checker obligation, not a domain surface. This round takes the frontier the r90 knowledge
note named and did not hold, as a new capability, and repays the routed record defects as the
calibration claim.

## Claims (frozen before data)

### C1 — coverage (capability `chromium-showpicker-proxy-linux`, new; first-working round 91)

**Predicate `C1-SHOWPICKER-PROXY-R91`.** On Chromium 155.0.8059.84 Linux `--headless=new`, the same
file-input shape (`#s`, `type=file`) in a same-origin iframe and in a cross-origin iframe is reached
through a `window.postMessage` proxy in its own document that accepts only the parent origin, and
the measured laws are:

- no transient activation in either window: the proxy call on `#s` throws `NotAllowedError` with
  the `showPicker()` user-gesture message and opens no chooser, in both iframes;
- a real click in the PARENT document (which activates the same-origin child but not the
  cross-origin child): the same-origin child's DIRECT and PROXY calls both return `undefined` and
  open exactly one `Page.fileChooserOpened` owned by the same-origin frame; the cross-origin
  child's PROXY call still throws `NotAllowedError` and opens nothing;
- a real click INSIDE the cross-origin child: its proxy file call returns `undefined` and opens
  exactly one chooser owned by the cross-origin frame; the answer `DOM.setFileInputFiles` on that
  chooser delivers `tabi-r91-answer.txt` (22 B) to the CHILD input while the parent `#ps` stays
  empty;
- the cross-origin proxy call on a `type=date` input throws `SecurityError` in BOTH activation
  states (the File/Color exemption does not cover date) and opens nothing; the proxy call on a
  `type=color` input returns `undefined` and opens no FILE chooser;
- the parent's direct access to the cross-origin child yields `contentDocument === null` and
  `SecurityError` from `contentWindow.document`.

Each law is bound by `scripts/check-showpicker-proxy-round91.mjs` over the 15-leg receipt; the
counter is frozen with `scripts/chrome-cdp-showpicker-proxy-round91.mjs`, the 39-case battery, the
32-mutant kill-power sweep, the gate runner and the drift gate. `showPicker()` consumes transient
activation on success and leaves it active when it throws — measured, and bound in the activation
law (r90's answer-law recorded the same consumption).

### C2 — calibration (the six lane-measurable r90 routed defects)

**Predicate `C2-RECORDDRIFT-R91`.** `scripts/check-record-drift-round91.mjs` counts EIGHT
statements: the six lane-measurable §8 items (D1 the false `plan-calls` attribution swept from the
knowledge note, the LOG r90 entry and QUALITY 163; D2 the battery-case numeral 225→226 with the
preflight delta recorded; D3 append-only corrections for the two in-place r89 edits; D5 the r90 C2
after-run revision named; D7 the D3–D6 pointer in `plans/round-90.md`; D8 the over-length S224 Gate
quote marked with the counted 17-word replacement) and two self-checks (`gate-selftest` reads the
gate-run artifact; `scorecard-tallies` reads this section's claim table). §8 items 4 (the r90 fleet
report's digest arithmetic) and 6 (its commit author date) live in the fleet report/commit, outside
this lane's write scope: they are disclosed in `corpus/lessons/round-90.md` and this report, and are
deliberately NOT counted.

## Counting commands

- C1 leg (a): `node scripts/check-showpicker-proxy-round91.mjs --lane <ABS lane> --receipt
  corpus/evidence/round91/chromium-showpicker-proxy/receipt.json --expect-driver-sha256 <pin>
  --expect-nonce <scored nonce> --expect-parent-sha256 <pin> --expect-same-sha256 <pin>
  --expect-child-sha256 <pin> --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json`
  → exit 0, 30 checks.
- C1 leg (b): the battery (39 cases, positive control included) and the kill-power sweep (32
  mutants) over the same receipt and pins.
- C1 leg (c): the capability row, the knowledge note, the SKILL registry and the gate runner.
- C2: `node scripts/check-record-drift-round91.mjs --lane <ABS lane> --json` → exit 0 iff 8
  statements, 0 findings.

## Do-nothing controls (executed before the freeze)

- `controls/c1/probes/probe1.json` — the first 15-leg run, 4 legs dead on the Chromium singleton
  path length: it is NOT a prior and is kept as the failed preflight (disclosed).
- `controls/c1/noreceipt.txt` — a nonexistent receipt path → counter exit 2 `receipt-unreadable`.
- The r90 scored receipt under the r91 counter → exit 1 with `schema` first (different schema).
- A probe clone with one proxy result flipped (`sp91-xo-proxy-file-noact` → `ok:true`) → exit 1
  `law` (the counter's own `--selftest` second case, committed as
  `controls/c1/nowork-proxy-flip.json`).
- A probe clone with the postMessage evaluate removed from `sp91-xo-proxy-file-childact` → exit 1
  `plan-calls`.
- C2 before: the frozen gate (tip script) on a base `b1d8f07b` worktree → 8 mismatches (the six
  defect statements plus the two self-checks, which are red because the r91 artifacts do not exist
  at base); after: 0 at the committed tip.

## Prior set and freeze intent

`controls/c1/prior-set.txt` names TWO independent clean probe receipts (probe4, probe5; both 15/15
legs, 0 failures, distinct nonces/ports/launch tokens). The counter requires the scored receipt's
15-leg law table to equal BOTH priors' and refuses any launch token / devtools browser id that
repeats a prior. Freeze only after the counter (on a probe), the battery, the kill power and the
drift gate are green once on the exact bytes; the scored receipt is produced once at the
D1-derived nonce; every later freeze touches only non-receipt instruments and is disclosed in
§Re-freeze history.

## Declared limits (pre-freeze)

- The proxy is a lane fixture convention: the child accepts `e.origin === its served parent
  origin`; the browser's own origin check is measured only through that fixture.
- The native pickers themselves are unmeasured: date/colour "success" is the absence of a
  `Page.fileChooserOpened` event, not a UI observation.
- The answer is programmatic (`DOM.setFileInputFiles`); a user's dialog is unmeasured.
- The activation states are the driver's POST-LEG reads; a successful `showPicker()` consumes
  transient activation and a throwing call leaves it active (the two exceptions, L9 and L13, are
  measured).
- The counter reads a receipt: a forger who rewrites identity fields and regenerates every
  synthetic launch token/devtools id is outside the replay rule (recorded as the limit).

## Frontier carried (not moved)

- The colour popup itself (a UI-side probe or a source-side reading of the colour chooser path).
- A second browser build (Edge/WebView2) for the proxy capability; this round pins Chromium
  155.0.8059.84 only.
- Real-site cross-origin frames (operator approval absent; loopback only).

## Re-freeze history (instrument family)

(Filled at the freeze; each entry names only instrument bytes.)

- **D1 `1d073adc0b8d`**: first freeze (six instruments + probe4/probe5 + prior set). The scored
  receipt is produced once at the D1-derived nonce `tabi-r91-l1-1d073adc0b8d`.
- **D2 `2d825d85aab7`** (post-scoring, non-receipt instruments only): the drift gate's
  `scorecard-tallies` statement read the object-shaped `claims.json` as an array (false red on a
  correct SCORECARD section), and the gate runner ran the drift-over-lane gate, which is circular
  with the `scored/selftest.json` artifact the drift gate reads. The runner now runs the five
  instrument gates (counter-selftest, counter, battery, killpower, drift-selftest); the drift
  gate's `gate-selftest` statement requires those four named gates. No predicate, counter,
  battery, kill rule, prior or receipt changed; the scored nonce stays D1's.

- **D3 `12cbe8a0267f`** (non-receipt instrument only): the drift gate's `--selftest` fixture
  still listed the old gate name `selftest`; it now lists `drift-selftest`, so the D2 gate-name
  change has a green causal fixture (`--selftest` ok, 10 cases). No predicate, counter, battery,
  kill rule, prior or receipt changed; the scored nonce stays D1's.
