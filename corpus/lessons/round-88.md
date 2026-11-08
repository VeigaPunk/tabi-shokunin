# tabi — round 88

L1 `TabiR88`. Base `f16f992d` (lane clean; the round-87 verifier spot-check commit). The round-87
non-author spot-check admitted r87 C1 (`chromium-showpicker-linux` generation r87) but **rejected
the round as rejected-harmed**: it rewrote seven historical SCORECARD selftest tallies
9/9 → 10/10 with no evidence and no named correction, and its D7 wording contradicted its own
lesson. Claims: C1 coverage — capability `chromium-showpicker-linux` generation r88 (MIME
parameters, case variants, combined lists); C2 calibration — the r87 spot-check routed defects
D1–D4 (the seven tallies, D2 wording, D3 gate self-tests, D4 freeze batching, and the
QUALITY 161 sweep extended to the SCORECARD set).

D **`86f1dcec`** — the first freeze (six instruments). A pre-freeze probe run at
`tabi-r88-probe1-probe0001` (37 legs, 0 failures) confirmed the driver before the freeze; the
scored run takes place at the D1 nonce `tabi-r88-l1-86f1dcec`.

Census start: exit 0, 223 rows (`census/start.txt`); end: pending.

## Gate

### Sources — opened this round

The L1 re-opened the living WHATWG input page on 2026-11-08 (HTTP 200, 687,515 bytes, sha256
`b0202de1c0b4…`, staged at `.ufo/waves/round-88/sources/whatwg-input.html`).

- **S223** — the `accept` attribute's own sentence. Located quote: "attribute may be specified to
  provide user agents with a hint of what file types will be accepted." This is the normative
  ground for the ten-form acceptance law (a hint, not a validator on a programmatic answer).
- **S219** — the `showPicker()` colour exemption, re-opened this round as the ground of the
  colour arm. Located quote (21 words, `printf '%s' … | wc -w`): "Throws a 'SecurityError'
  DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or
  Color states." (The page's own quotation marks are straight double quotes; the nested single
  quotes here render the inner DOMException name.)

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows; no registry change. The
round-88 `## Search log` entry is added at `corpus/SOURCES.md` (this round's bounded re-opening).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-88.md` (cites S223, S219, S216
and the r87 carrier rows).

Rejected (with flip conditions):

- **"The accept grammar is fully enumerated"** — ten token forms are measured; the parser's
  whitespace/comma normalization read from the DOM stays frontier. Flip: one leg reading the
  DOM-parsed form rather than the raw string.
- **"The dialog filters what the user sees"** — the receipt answers programmatically; the dialog
  is unmeasured. Flip: an interactive-dialog harness.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Report corrections carried into this round (round-87 spot-check §2, defects D2)

- The round-87 records' "selftest 10/10 at D7" wording is corrected to the D6 value: the
  committed tally is at the D6 freeze (`6d4a63d29e0c`), and the round-87 lesson's scored line
  and this SCORECARD's r87 row now carry "10/10 at D6" (the D7 freeze changed the drift
  gate's item-heading/directional checks only, never the selftest). This lesson names the
  correction explicitly, so the drift gate's `selftest-wording` statement holds.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-88/claims.json` (nonce `tabi-r88-l1-86f1dcec`,
receipt D `86f1dcec`; instrument freeze D1 `86f1dcec`). Scored: counter clean **99** checks;
battery **212** cases / 0 failed / coverage 99/99; kill power **69** mutants / 69 killed /
0 survivors / 0 crashed / 0 unapplied; selftest **10/10**; record drift **3 → 0**.
