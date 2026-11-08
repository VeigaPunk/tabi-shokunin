# tabi — round 86

L1 `TabiR86`. Base `57265864` (lane clean). Round 85's non-author spot-check admitted both claims and
routed five defects to r86; three touch this round's claims: the kill-power reach of the new-leg laws
(its independent 73-mutant sweep left 31 case-level survivors), the tel-only witness gap, and the
`accept` token grammar. Claims: C1 coverage — capability `chromium-showpicker-linux` generation r86
(the `accept` token grammar matrix and the same-origin `type=color` arm); C2 operability — the tel-only
conjunct narrowings.

D `4bd89a80f439`, nonce `tabi-r86-l1-4bd89a80f439`. Freeze commit recorded in LOG.

Census start: exit 0, 223 rows (`.ufo/waves/round-86/census/start.txt`); end: exit 0, 223 rows
(`.ufo/waves/round-86/census/end.txt`).

## Gate

### Sources — opened this round

The L1 re-opened S223 and S219 on 2026-11-08 (the same living WHATWG input page, HTTP 200, 687,515
bytes, sha256 `b0202de1c0b4…`; staged at `.ufo/waves/round-86/sources/whatwg-input.html`).

- **S223** — the `accept` attribute's own sentence, located in the File Upload state. Located quote
  (18 words, `printf '%s' … | wc -w`): "attribute may be specified to provide user agents with a hint
  of what file types will be accepted." This is the normative ground for the measured law that
  `accept` is a hint (a dialog filter), not a validator.
- **S219** — the `showPicker()` step that exempts the colour state. Located quote (21 words):
  "Throws a 'SecurityError' DOMException if input is inside a cross-origin iframe, unless input is in
  the File Upload or Color states." The same block's "Shows any applicable picker UI … If input does
  not support a picker, this method does nothing" bounds the colour law to "no FILE chooser".

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows. Opened this round: S223 and S219
(one fetch of the living page), with S216 anchoring the same page's algorithm. Carried, NOT re-opened:
S221/S222 (the CDP Page/DOM domain documents — no `.pdl` was fetched this round). No registry
change — the round adds measured laws, not new sources. (Corrected on R86Scribe's source-accounting
finding, `w1/R86Scribe.md` §Divergences.)

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-86.md` (cites S223, S219, S216 and,
as carried context, S221/S222).

Rejected (with flip conditions):

- **"The same-origin colour arm proves no colour popup opened"** — the receipt records zero
  `Page.fileChooserOpened` events, a FILE-chooser metric; the colour popup is not a CDP file-chooser
  event. Flip: a UI-side probe or a source-side reading of the colour chooser path.
- **"`accept` filters what the user's dialog offers"** — five programmatic answers are measured; the
  dialog itself is not (headless opens no real dialog). Flip: an interactive-dialog harness.
- **"The accept grammar is fully enumerated"** — three token forms are measured (`image/*`, a mixed
  list, `application/pdf`). Flip: one leg per remaining form (`audio/*`, `video/*`, multi-MIME,
  whitespace variants).

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-86/claims.json` (nonce `tabi-r86-l1-4bd89a80f439`, D
`4bd89a80f439`). Scored: counter clean **95** checks; battery **201** cases / 0 failed / coverage
95/95; kill power **66** mutants / 66 killed / 0 survivors / 0 crashed / 0 unapplied; witness families
before **3** survivors / after **0** (12 families).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `witness-polarity` — the first tel-only narrowing families were written as "skip the WHOLE law for search/text", and both generations killed them: the r85 battery already has `cross-origin-search-law`/`cross-origin-text-law` childResult cases, and dropping the whole law makes the tel cases vacuous | `.ufo/waves/round-86/scored/witness-a.json` first two runs: all 12 families killed in both generations | the witness runner's own before/after split, read before the freeze | families rewritten conjunct-scoped (`extra !== 'sp84-cross-origin-tel' || <conjunct>`); after the fix before = 3 survivors, matching R85Mut1's routed finding |
| `guard-inversion` — the first conjunct-scoped families used `extra === 'sp84-cross-origin-tel' || <conjunct>`, which drops the conjunct FOR tel and keeps it for search/text — the opposite of the narrowing | second witness run: `narrow-tel-*` killed in both generations by their own tel cases (`firstFailure: cross-tel-*`) | the same before/after split | operator flipped to `!==`; before 3 / after 0 |
| `kill-power-reach` — the first frozen-mutant list left three survivors (`accept-grammar-state-dropped`, `color-law-activation-dropped`, `color-law-no-input-dropped`): the battery had no case mutating the accept-law state, the colour activation transition, or adding an input event to the colour leg | kill-power run on the probe receipt: 66 mutants, 3 survivors | the kill-power summary's `survivorsList` | three battery cases added (`accept-grammar-law-state`, `color-law-activation-after`, `color-law-input-event`); 66/66 killed |
| `prior-set-hygiene` — a byte-identical second copy of the first probe (`probes/probe1.json`) sat beside `prior1.json` and the counter refused every case with `prior-set-complete` | battery run: every case `extra ["prior-set-complete"]` | the counter's prior-set-complete finding, read before the freeze | deleted the duplicate; the mirror-lane build now copies only the prior-set's own files instead of the whole `controls/c1` tree (which had also copied the receipt under test) |

Sweep for further mistakes: the battery's 201 cases, kill power's 66 mutants, 12 witness families over
two generations, and the counter's 95 checks agree with the frozen law tables; the selftest's 10 gates
run them in order; no other class found.

## Corrections — the r85 spot-check's routed defects (append-only)

| # | routed defect | state at r86 close |
|---|---|---|
| 1 | report prose 21-vs-22 findings inconsistency | not repeated this round; every control number in the report is read from the committed JSON |
| 2 | kill-power reach (31 case-level survivors) | the frozen 66-mutant list kills every mutant it declares (66/66); the surviving families were folded into the battery as three state/activation/input cases, and the leg-narrowings into the witness runner |
| 3 | tel-only witnesses | closed: 12 search/text battery cases + six conjunct-scoped narrowing families; before 3 survivors → after 0 |
| 4 | zero-chooser = FILE-chooser metric only | carried into the r86 note and the colour law's wording ("no FILE chooser") |
| 5 | `accept` token grammar matrix | measured: `image/*`, mixed list, non-matching MIME token |

## Corrections — record drift caught by the round's own wave (append-only)

| # | record | stale statement | correction |
|---|---|---|---|
| 1 | `plans/round-86.md` §C2 | the first draft declared three whole-law narrowing families and a before-value of 3 | rewritten to six conjunct-scoped families; the mechanism and both measured values are recorded above |
| 2 | `.ufo/waves/round-86/claims.json` C2 `legs.a` | names the three survivors by family id | they are `narrow-tel-crossaccess`, `narrow-tel-childseq`, `narrow-tel-childact-before` — exactly R85Mut1's three |
| 3 | `corpus/knowledge/chromium-showpicker-runtime-round-86.md` law 1 headline | "`accept` is a dialog filter, never a validator" — wider than a receipt can show (the dialog is unmeasured) | narrowed to "`accept` is not a validator on a programmatic answer — for every token form measured", with the dialog reading marked unmeasurable (R86Scribe §Divergences; R86Critic Q1) |
| 4 | this Gate's source accounting | "carried rows S223, S219, S216, S221, S222 re-opened" | opened this round: S223/S219 (+S216 anchoring the same page); S221/S222 **carried, not re-opened** — no `.pdl` was fetched (R86Scribe source-accounting finding) |
| 5 | `.ufo/waves/round-86/controls/c1/nowork-r85-under-r86.json` | recorded 39 findings, all captured before the scored receipt and the two priors existed in the walked trees | regenerated in place after the wave: **40** findings, the new one `prior-set-complete` (the r86 receipts now in the tree); R86Sentinel F1 caught the stale artifact, and the number is now reproducible from the committed tree |
| 6 | `.ufo/waves/round-86/freeze.txt` + every record's nonce | D1 `0e7bb7e08cac` was frozen with a `check-record-drift-r86.mjs` that could not parse (`SyntaxError: Unexpected identifier`, its new `accept-grammar-measured` claim) | repaired counter re-frozen as **D2 `4bd89a80f439`**; the scored run and every gate re-run at D2's nonce; the file and the records cite D2, and `plans/round-86.md §Re-freeze history` keeps D1 named |
