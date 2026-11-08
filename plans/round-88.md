# Round 88 — plan and narrowing amendments

Base `f16f992d` (lane clean; the round-87 verifier spot-check commit). Two claims: C1 coverage
(`chromium-showpicker-linux` generation r88 — MIME parameters, case variants, combined lists) and
C2 calibration (the seven SCORECARD selftest tallies the round-87 sweep rewrote, plus the D2–D4
routed defects).

Instruments are the round-87 family retargeted to `r88`, with each gate carrying an isolated
`--selftest` mode (D3), and the record-drift gate rewritten to the round-88 statements. Pins
land in `.ufo/waves/round-88/freeze.txt`, claims in `.ufo/waves/round-88/claims.json`.

## C1 — `chromium-showpicker-linux` generation r88 (MIME parameters, case variants, combined lists)

Round 87 measured seven `accept` token forms and named the remainder frontier: `IMAGE/PNG`
(case variant), `image/png;q=0.9` (MIME parameter) and `audio/*,video/*` (combined media-type
list). This generation adds one leg per remaining form, each on its own page input whose `accept`
attribute is read back by `window.__inputs()`:

1. `accept="IMAGE/PNG"` answered with `image/png` bytes (`sp88-accept-case-png`, input `ac`);
2. `accept="audio/*,video/*"` answered with `text/plain` bytes
   (`sp88-accept-audiovideo-text`, input `au`);
3. `accept="image/png;q=0.9"` answered with `image/png` (`sp88-accept-mimeparam-png`, input `amc`).

The measured law stays the one rounds 86–87 stated, now over ten token forms: **`accept` is not
a validator on a programmatic answer** — every delivered file lands in the input's file list with
its bytes, fires trusted `input`+`change`, and the page reads the bytes back; the attribute
itself is read from the page, so the token form is measured, not asserted. The dialog remains
unmeasured.

Predicate `C1-SHOWPICKER-R88`:
- (a) the scored receipt `corpus/evidence/round88/chromium-showpicker/receipt.json` scores
  `clean` under `scripts/check-showpicker-round88.mjs` with every pin (driver, fixture, nonce)
  and the full check count (99 — the grammar table widens inside `accept-grammar-law`, which
  stays one check);
- (b) the battery (`scripts/negatives-showpicker-round88.mjs`) exits 0 with 0 failed and full
  coverage; kill power (`scripts/kill-power-round88.mjs`) leaves 0 survivors, 0 crashed, 0
  unapplied;
- (c) capability row, knowledge note, SKILL registry and the selftest
  (`scripts/selftest-r88-gates.mjs`) green.

Do-nothing controls (frozen before the wave; each is a construction that cannot pass): the round-87
scored receipt under the round-88 counter exits 1 (superseded generation: `schema`, `plan-frozen`,
leg records) and a no-receipt run exits 2 (`receipt-unreadable`). Neither reaches the target.

Kill rule: any leg false or any axis harmed → NOT verified.

## C2 — calibration: the round-87 spot-check routed defects

`corpus/lessons/round-87-verifier-spotcheck.md` §7 routed five defects; four are lane-owned and
countable against repo state, one (D5 fleet hygiene) is not lane debt.
`scripts/check-record-drift-r88.mjs` counts, over exactly four statements, where the lane's
records disagree with observed state:

1. **scorecard-tallies** (D1, blocking): the seven historical SCORECARD selftest tallies the
   round-87 sweep rewrote (rounds 44, 68, 79, 80, 81, 84, 85) again read `9/9`, matching their
   own committed round evidence (each runner's gate count and/or the round's scored selftest
   receipt). Every section is bounded by the next section heading, so a later row cannot rescue
   an earlier section.
2. **selftest-wording** (D2): the round-87 records' "selftest 10/10 at D7" sentence is replaced
   by the D6 value (the committed tally is at the D6 freeze); the round-88 lesson names the
   correction.
3. **gate-selftest** (D3): every round-88 gate exposes an isolated `--selftest` mode that
   asserts a stable finding id on a fixture that never touches the lane: the showpicker counter
   (`schema`, exit 1), the negatives battery (one named case red), kill power (one named mutant
   killed), and this drift gate (the swept-tally statement red on a fixture lane). The live
   isolated drift run is wired in the selftest runner as gate `gate-selftest`.
4. **quality161-sweep**: `QUALITY.md` 161's sweep now enumerates the SCORECARD tally set and
   cites this gate — the round-87 blanket sweep would fail it.

Predicate `C2-RECORDDRIFT-R88`: `node scripts/check-record-drift-r88.mjs --lane <ABS lane> --json`
exits 0 with `claims 4`, `mismatches 0`; the BEFORE control — the same frozen gate pointed at a
worktree of base `f16f992d` — exits 1 with `mismatches 3` (`quality161-sweep` is not red at
base, because base QUALITY 161 already sweeps; it goes red only under a re-sweep).

Kill rule: after `mismatches != 0` or before `mismatches != 3` → NOT verified.

## Declared limits (pre-freeze)

- **C1 measures acceptance, not filtering.** `DOM.setFileInputFiles` is a programmatic answer;
  the user's dialog is not measured (no UI dialog in headless).
- **The grammar covers ten token forms**, not the whole grammar — what remains is the parser's
  whitespace/comma normalization read from the DOM rather than the raw string, and the full
  WHATWG "unique security error" ordering for every type.
- **The byte CONTENTS stay the inherited r83 marker** (`tabi-r83-answer-alpha\n` under the
  r88 file names `tabi-r88-a.txt` / `tabi-r88-b.png`): the counter binds names, sizes, types,
  hex and hashes — never the content marker. A case-variant or MIME-parameter leg therefore
  measures the ATTRIBUTE string and the programmatic answer, not the UA's tokenisation of it.
- **C2 counts four record statements**, not every sentence in the lane; a green gate means those
  four match observed state, nothing more.
- **The round-87 selftest tally stays 10/10 at D6** — the committed tally is at D6 `6d4a63d29e0c`
  and the D6 wording is the correction; "at D7" is withdrawn, not re-run.

## Frontier carried (not moved)

- The parser's whitespace/comma normalization read from the DOM rather than the raw string.
- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` call does to the colour popup itself (not a CDP file-chooser event) — needs
  a UI-side probe or a source-side reading of the colour chooser path.

## Re-freeze history (instrument family)

- **D1 `86f1dcec` (probe run at D1's pins)** (first freeze): six instruments pinned (the
  chrome-cdp/showpicker family, the drift gate with its isolated `--selftest`, and the runner).
  A pre-freeze probe run at `tabi-r88-probe1-probe0001` confirmed the driver reaches all 37
  legs with 0 failures before the freeze.

## Narrowings (post-wave, pre-report — every one reconciled before filing)
