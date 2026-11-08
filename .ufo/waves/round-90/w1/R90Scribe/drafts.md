# R90Scribe — drafts (round 90, wave w1)

Seat `R90Scribe`, axes depth + calibration, milestone "record drafts". Independent draft; the
lane's files were NOT edited. Draft bodies: `draft-a-knowledge-note.md`, `draft-b-lesson-gate.md`,
`draft-c-scorecard.md`, `draft-d-mistakes.md` (four `## Mistakes` candidates). Receipts: the
`*.json` files beside this note.

**Note on the receipt files here.** `evidence-forgeB.json` / `evidence-forgeF.json` are the
counter's OUTPUT for two forged receipts (both `clean`, 107 checks, 0 findings). The forged
receipts themselves are deliberately NOT stored in the lane: any file carrying the receipt
schema `tabi-chrome-cdp-showpicker-r90` under `.ufo/waves/round-90` is refused by the counter's
`prior-set-complete` check. The rebuild recipe is in `w1/R90Scribe.md` §Recipe.

Baseline measured by me (live D3/D4 bytes, 11:32–11:45):

| instrument | result |
|---|---|
| `check-showpicker-round90.mjs` on the scored receipt | exit 0, `clean`, 107 checks, 0 findings |
| `negatives-showpicker-round90.mjs` (lane's own scored artifact) | 226 cases / 0 failed / coverage 107/107 |
| `kill-power-round90.mjs` — my own independent run, 291 s | 76 mutants / 76 killed / 0 survived / 0 crashed / 0 unapplied |
| `check-record-drift-round90.mjs` — my own run | exit 0, 8 claims, 0 mismatches; the lane's `drift-before.json` = 8 claims / 7 mismatches |
| r89 scored receipt under the r90 counter | exit 1, **35** finding ids (not 2) |
| two forged receipts (settle read moved before the settle mark / anchored to an inserted `__state()`) | exit 0, `clean`, 107 checks, 0 findings each |
