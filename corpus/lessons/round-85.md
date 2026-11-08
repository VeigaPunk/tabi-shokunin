# tabi — round 85

L1 `TabiR85`. Base `c574d593` (lane clean). Round 84's non-author spot-check admitted both claims and
routed five defects to r85: battery witnesses for R84Mut1's survivor families; the `accept`
MIME-token / `image/*` grammar; a same-origin tel/search/text contrast leg; a counter generation whose
limit sentence prints the constant-offset escape; and C2's Gate-prose reconciliation. Claims: C1
coverage — capability `chromium-showpicker-linux` generation r85; C2 operability — the six
survivor-family witnesses.

D `620623a43f74`, nonce `tabi-r85-l1-620623a43f74`. Freeze commit `5c19615`.

Census start: exit 0, 223 rows (`.ufo/waves/round-85/census/start.txt`); end: exit 0, 223 rows
(`.ufo/waves/round-85/census/end.txt`).

## Gate

### Sources — opened this round

The L1 re-opened S219 (WHATWG HTML input page) itself on 2026-11-08: HTTP 200, 687,515 bytes,
sha256 `b0202de1c0b4…`, and located the algorithm at the `showPicker()` method steps. Located quote
(19 words): "If this 's relevant global object does not have transient activation , then throw a
' NotAllowedError ' DOMException ." The same block gives the order — mutability ("InvalidStateError"),
then origin ("SecurityError", File/Color exempt), then activation — which is exactly the measured r85
ladder. S220/S218 (`html_input_element.cc` at tag 155.0.8059.84) are re-opened by the R85Scout seat
and cited by the knowledge note.

Identified 3 / screened 3 / included 0 / excluded 3 for NEW rows (carried rows S219, S220, S218
re-opened; no registry change — the round adds measured laws, not new sources).

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-85.md` (cites S219, S220, S218, S221,
S222).

Rejected (with flip conditions):

- **"The same-origin no-picker result proves Chromium returns early for text-like types"** — the
  receipt records `undefined` and zero chooser events; the mechanism (early return vs no popup view)
  is not recorded. Flip: a leg that reads the input type's popup-view state from the source or a
  DevTools-side probe of the input's picker class.
- **"The six legs give the same-element origin comparison"** — the parent `#tes`/`#ses`/`#txs` and the
  child `#te`/`#se`/`#tx` are different elements in different frames; the type attribute is what is
  held constant. Flip: a same-element origin proxy in the fixture.
- **"The `accept` grammar is measured"** — one extension token (`.png`) and one MIME-typed byte
  answer; `image/*` and mixed lists are not exercised. Flip: one leg per token form (carried from
  r84's routed defect 2).

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-85/claims.json` (nonce `tabi-r85-l1-620623a43f74`, D
`620623a43f74`). Scored: counter clean **87** checks; battery **175** cases / 0 failed / coverage
87/87; kill power **58** mutants / 58 killed / 0 survivors / 0 crashed / 0 unapplied; witness
families before **3** survivors / after **0**.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `battery-coverage` — the first battery run flagged 8 failing cases: my own duplicate leg cases for the six new legs (the generic `LEG_NAMES` loop already emitted them) failed because `no-selection-law` fires as collateral and my copy had no allowlist | `.ufo/waves/round-85/scored/battery-a.json` first run (`cases 181, failed 8`, every failure `extra ["no-selection-law"]`) | the battery's own case-level `alsoAllowed` rule — a case passes only when no unnamed id fires | removed the duplicate loop, added `LEG_ALSO` entries for the six legs; 175/0 |
| `prior-drift` — the prior receipt was a 21-leg probe while the counter planned 24 legs, so the replay-forgery case fired `plan-frozen`/`leg-order`/`leg-records` instead of `replay-event-timeline` | battery failure log, `replay-event-timeline` case detail listing `plan-frozen, leg-order, leg-records` | the replay case's own `expect`+`alsoAllowed` assertion | re-ran a 24-leg prior at nonce `tabi-r85-prior3-a1` and committed it as `controls/c1/probes/prior1.json` |
| `measurement-scope` — C2's first before-value assumed all six families survive the r84 battery; three were already killed by the r84 D repair (R84Mut1 ran the freeze-commit battery `828dfcb7…`, not the D bytes `42fcfedc…`) | `.ufo/waves/round-85/scored/witness-a.json` before leg | the witness runner's own before/after split, read before the report was written | claim narrowed to the measured `3 → 0`; recorded in `plans/round-85.md` §Declared limits and in SCORECARD |

Sweep for further mistakes: `node scripts/witness-families-r85.mjs` (12 runs), the battery's 175
cases, kill power's 58 mutants, and both pre-freeze probes agree with the frozen law tables; no other
class found.

## Corrections — the r84 spot-check's routed defects (append-only)

| # | routed defect | state at r85 close |
|---|---|---|
| 1 | battery witnesses for R84Mut1 survivor families | six family cases added; before 3 survivors, after 0 |
| 2 | `accept` MIME-token / `image/*` grammar | carried as frontier with flips (r85 note §Frontier, this Gate) |
| 3 | same-origin tel/search/text contrast leg | landed twice (no-activation and activated arms), six legs, one new law `same-origin-no-picker-law` |
| 4 | limit sentence printing the constant-offset escape | the r85 counter carries the sentence and the battery keeps `accept-retimed`; R85Exec3 measures the escape |
| 5 | C2 Gate-prose reconciliation | `scripts/check-record-drift-r85.mjs` reads the accept-frontier sentence and the family witness numbers |

## Corrections — record drift caught by the round's own wave (append-only)

| # | record | stale statement | correction |
|---|---|---|---|
| 1 | `.ufo/waves/round-85/claims.json` C1 `doNothingControl` | "81 checks (not 87), 21 findings" | 21 findings at the D1 nonce, **22** at D2 (the in-tree scored receipt adds `prior-set-complete`); `controls/c1/noreceipt.txt` is the exit-2 control. Fixed in the field (record prose, not a predicate or pin) |
| 2 | `plans/round-85.md:18` | predicate line pinned the superseded D1 fixture `9b71a949…` beside the D2 nonce | `0b012937…d252a` (the D2 receipt's fixture) |
| 3 | `SCORECARD.md` capability row | "opens **no** chooser (no picker exists for tel/search/text on this platform)" | "fires **zero** `Page.fileChooserOpened` (a file-chooser metric); 'these types have no picker' stays an inference" — R85Review1 MEDIUM-3 and R85Scribe both measured the parenthetical as prose |
