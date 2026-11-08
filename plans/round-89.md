# Round 89 — plan and narrowing amendments

Base `5a9011635c3bafb64a59a1411c4036bb40438724` (lane clean; the round-88 verifier spot-check
commit). Two claims: C1 coverage (`chromium-showpicker-linux` generation r89 — the DOM-parsed
token list) and C2 calibration (the round-88 spot-check routed defects 1–2: the R88Mut1
survivor families + the DOM frontier, plus the freeze discipline the spot-check demands).

Instruments are the round-88 family retargeted to `r89`, with the fixture patch extended so
`window.__inputs()` returns `acceptTokens` (comma-split, trimmed, ASCII-lowercased) alongside
the raw `accept`, the counter gaining `accept-domread-law` and `replay-limit-consistency`,
the battery gaining three domread cases, the kill-power list gaining two domread mutants plus
a replay-limit mutant, and the record-drift gate's two selftest-fixture defects (the absent
sections, the leaked scratch) repaired. Pins land in `.ufo/waves/round-89/freeze.txt`, claims
in `.ufo/waves/round-89/claims.json`.

## C1 — `chromium-showpicker-linux` generation r89 (the DOM-parsed token list)

Round 88 left one accept-law frontier open: "the parser's whitespace/comma normalization read
from the DOM rather than the raw string" (r88 spot-check §7 routed defect 2; r88 SCORECARD
`Planned (r89)` line 1). Every earlier leg read the raw attribute string from the page; no leg
read the parsed form. This generation measures the parsed form: each of the four new legs
re-reads `window.__inputs()` on the page at settle (`domRead`), and the counter binds BOTH the
raw string AND the DOM-parsed token list, where the fixture's normalization is the spec's
`§2.3.8` "set of comma-separated tokens" (split on U+002C, tokens neither begin nor end with
ASCII whitespace) plus ASCII lowercasing:

1. `sp89-accept-domread-text` on `#aw` (`image/*` ← txt): tokens `["image/*"]`;
2. `sp89-accept-domread-png` on `#am` (`image/png, .txt` ← png): tokens `["image/png", ".txt"]`;
3. `sp89-accept-domread-multimime` on `#a2` (`image/png,application/pdf` ← txt): tokens `["image/png", "application/pdf"]`;
4. `sp89-accept-domread-whitespace` on `#aws` (`"  image/png ,  .txt  "` ← png): tokens `["image/png", ".txt"]`.

The measured law stays the one rounds 86–88 stated, now over a DOM-parsed token list:
**`accept` is not a validator on a programmatic answer** — every delivered file lands in the
input's file list with its bytes, fires trusted `input`+`change`, and the page reads the bytes
back; the raw attribute AND the parsed tokens are read from the page, so the tokenization is
measured, not asserted. The dialog remains unmeasured.

## C2 — calibration, the round-88 spot-check routed defects 1–2

The r88 spot-check routes: (1) the R88Mut1 survivor families and Narrowings 4–7 (battery/kill
selftest assertion strength, drift-fixture overdetermination, replay limit-block
self-contradiction); (2) the DOM-parsed frontier (C1). C2's counted work:

1. The drift `--selftest` fixture carries all seven swept sections (`44, 68, 79, 80, 81, 84,
   85`) so the `scorecard-tallies` red is causal — removing the injected `10/10` turns the
   fixture green on that statement (kills the
   `drift-selftest-fixture-swept-tally-removed` survivor class).
2. The drift `--selftest`'s fixture tree is removed in the same process (Narrowing 7 leak
   fix); verified: `ls /fast/scratch/hyaku/tabi-r89-driftfix-*` → 0 after a selftest run.
3. The counter's replay limit sentence prints the computed per-prior `absNeed` values and a
   new `replay-limit-consistency` check binds `refused == (absMatched >= absNeed)` (Narrowing 8
   fix: the sentence can no longer drift from the math).

## Declared limits (pre-freeze)

- **C1 measures acceptance, not filtering.** `DOM.setFileInputFiles` is a programmatic answer;
  what a user's dialog offers is unmeasured.
- **The token list is the fixture's normalization, not Chromium's internal tokenization.** The
  fixture splits on commas, trims ASCII whitespace and lowercases — the lowercasing is recorded
  as the fixture's own rule, not the spec's (spec §2.3.8 says nothing about case; the r88 case
  leg's page comment attributes the case-insensitivity to the WHATWG "ASCII case-insensitive"
  match rule).
- **41 legs** (37 carried + 4 domread).
- **The DOM-read is per-leg at settle.** Each domread leg re-reads `window.__inputs()` on its
  own page; the top-level `fixtureInputs` still comes from the first leg (carried narrowing 1).

## Frontier carried (not moved)

- A same-element origin comparison (an input reachable from both origins via a `postMessage`
  proxy) — not constructible in the current loopback fixture.
- What a `type=color` call does to the colour popup itself (not a CDP file-chooser event).

## Freeze

Single freeze (the r89 rule from the r88 mistake table: freeze only after every gate has
executed green once on the exact bytes). Probes `tabi-r89-probe1-probe0001` /
`tabi-r89-probe2-probe0002` (41 legs, 0 failures) are the prior set; each scores clean (108
checks, exit 0) against the other probe's prior-set. Do-nothing controls:
`controls/c1/nowork-r88-under-r89.json` (exit 1, `schema` among findings) and
`controls/c1/noreceipt.txt` (exit 2 `receipt-unreadable`).

Pre-freeze defects found and fixed (each before the freeze, so no re-freeze):
- The counter's `LEG_KEYS` had to be synced to the r89 driver's actual record shape (the r88
  sed left the clickLeg field names stale; non-click legs carry no click keys, the plain click
  leg carries 5, the second-chooser leg 7).
- `errOk` on error fields had to be null-safe (`clickError` is absent, not null, on most legs).
- `fixture-descriptors`' empty-token column: the page emits `[]` for file inputs with a null
  accept and `null` for non-file inputs.
- `plan-calls`' click-unexpected rule had to treat absent click ids as null.

## Re-freeze history (instrument family)

- **D1 `7bde5e6c2f2d`** (first freeze): six instruments pinned. A pre-freeze probe run at
  `tabi-r89-probe1-probe0001` confirmed the driver reaches all 41 legs with 0 failures.
- **D2 `a78e70a4`** (post-scoring, one batched repair): the battery's per-leg `LEG_ALSO` list
  lacked the `no-selection-law` collateral for the four new domread legs (the per-leg state
  mutation trips it exactly as it trips it on the r84/r86 answer legs), so four cases failed
  on their own expected id plus an unlisted collateral. The battery bytes are re-pinned; no
  predicate, threshold, prior or kill rule changed, and the scored receipt is untouched.
- **D3** (the replay-limit consistency move; the digest label in an earlier draft of this section (`a78e70a4`) was unverifiable and is withdrawn — the D3 freeze is the `freeze.txt` bytes whose sha256 prefix is recorded in claims.json `digestsCommit` at landing): the replay-limit
  consistency invariant (`refused == (absMatched >= absNeed)`, limit sentence prints the computed
  `absNeed` values) moved out of the numbered check set into the `limit` block as a computed
  boolean, because a battery case cannot witness a counter-text check by mutating the receipt.
  CheckCount 108 → 107, `limit.replayConsistency: true` on the scored run; the battery's witness
  for the class is the kill-power mutant. No predicate, threshold, prior or kill rule changed.
- **D4** (post-wave, one batched repair): the kill-power run left three mutants unapplied (a
  stale from-string after the LEG_KEYS sync, and two grammar-law from-strings made
  non-unique by the domread law's shared clause shape) and one survivor
  (`domread-raw-dropped` — no battery case mutated the domread raw string). The from-strings
  are re-pinned to unique context and the battery gains `accept-domread-law-raw`. The scored
  receipt is untouched; no predicate, threshold, prior or kill rule changed.
- **D5** (post-wave, one batched repair): the last kill-power from-string
  (`accept-grammar-state-dropped`) re-anchored to a unique GRAMMAR-loop prefix. Final measured
  state at the frozen bytes: counter clean 107, battery 223/0/107, kill power 72/72/0/0/0,
  selftest 11/11, record drift 3 → 0. Final freeze `061dec8a` (sha256 prefix of
  `.ufo/waves/round-89/freeze.txt`; nonce stays the D1-derived `tabi-r89-l1-7bde5e6c2f2d`).
