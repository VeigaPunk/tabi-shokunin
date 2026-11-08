# tabi — round 85 (scribe draft of the `## Gate` / `## Mistakes` sections)

> Draft for the L1 (`TabiR85`) to integrate. Every number in `## Gate` and in the `## Mistakes`
> table is one this seat **measured itself** from the lane's committed and scored bytes, unless the
> row says otherwise — two rows (`prior-drift`, `battery-coverage`) are the lane's own record of
> this round's earlier failed runs, carried here with their evidence, not re-run by this seat. The
> command that produced each measurement is quoted inline.
> This seat wrote **no** lane file outside its own scratch and its own report path; no git/jj
> mutation was run; no package was installed. Scratch was
> `/fast/scratch/hyaku/tabi-r85/R85Scribe/` (removed before yield).
>
> **Identity conflict, recorded verbatim.** This seat's brief names **D `dbecb1a18905`**, nonce
> `tabi-r85-l1-dbecb1a18905`, freeze commit `5c1961525e83efe2682cab389b8995d67c0ab4f0`. The lane
> has since **re-frozen to D `620623a43f74`**, nonce `tabi-r85-l1-620623a43f74`
> (`.ufo/waves/round-85/claims.json` `digestsCommit` / `nonce`, `.ufo/waves/round-85/freeze.txt`
> sha256 `620623a43f747cfadf13e24b4501bfd8b8fff43cefa7c97aa1bee67c5a3c6906`, and
> `plans/round-85.md` §Re-freeze history). The scored receipt was **re-executed** at the D2 nonce
> (`corpus/evidence/round85/chromium-showpicker/receipt.json`, nonce
> `tabi-r85-l1-620623a43f74`, fixture `0b012937…`, sha256 `c22f90f7…1e56a`; the D1 receipt was
> superseded, never edited). Every number in this draft is from the **D2** bytes, because those are
> the bytes the D2 instruments and the D2 scored artifacts bind. The brief's D1 receipt
> (`d5b1cb25…746a7`, nonce `tabi-r85-l1-dbecb1a18905`, fixture `9b71a949…2db5d`) is superseded and
> is quoted only where a D1-vs-D2 difference is the point.

L1 `TabiR85`. Base `c574d593` (lane clean). Round 84's non-author spot-check admitted both claims
and routed five defects to r85: battery witnesses for R84Mut1's survivor families; the `accept`
MIME-token / `image/*` grammar; a same-origin tel/search/text contrast leg; a counter generation
whose limit sentence prints the constant-offset escape; and C2's Gate-prose reconciliation. Claims:
C1 coverage — capability `chromium-showpicker-linux` generation r85; C2 operability — the six
survivor-family witnesses.

D `620623a43f74`, nonce `tabi-r85-l1-620623a43f74`. Freeze commit `5c19615` (instrument family),
D2 re-freeze for the drift counter's family→case mapping fix.

Census start: exit 0, 223 rows (`.ufo/waves/round-85/census/start.txt`); end: exit 0, 223 rows
(`.ufo/waves/round-85/census/end.txt`); the registry carries no new rows this round
(`grep -cE '^\| S[0-9]+ ' corpus/SOURCES.md` → 223; the carried rows S216, S218, S219, S220, S221,
S222 are the ones the r85 laws rest on).

## Gate

### Sources — opened this round

No new registry rows. Generation r85 measures six new legs on ground the r84 note already cites:
S216 (the normative `showPicker()` steps — the exception order: mutability `InvalidStateError`,
then origin `SecurityError` with File/Color exempt, then transient activation `NotAllowedError`),
S218/S220 (Chromium 155.0.8059.84 `html_input_element.cc` — the check order and the exact
messages), S219 (the `showPicker()` steps as the r84 note cited them), S221 (CDP Page domain —
`Page.setInterceptFileChooserDialog` / `Page.fileChooserOpened`) and S222 (CDP DOM domain —
`DOM.setFileInputFiles`). Identified 0 / screened 0 / included 0 / excluded 0 (**new** rows);
carried rows S216, S218, S219, S220, S221, S222 re-opened.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-85.md` — it cites S216, S218/S219,
S220, S221, S222; states the measured laws with receipt field paths; and names the accept-grammar
and same-element-origin frontier.

Rejected (with flip conditions):

- **"The same-origin no-picker result proves Chromium returns early for text-like types"** — the
  receipt records `undefined` and zero chooser events; the mechanism (early return vs. no popup
  view) is not recorded anywhere, and the zero-open expectation is a hardcoded name set in the
  counter (`NO_PICKER`, `scripts/check-showpicker-r85.mjs:146`), not a receipt field. Flip: a leg
  that reads the input type's popup-view state from the source, or a DevTools-side probe of the
  input's picker class.
- **"The six legs give a same-element origin comparison"** — the parent `#tes`/`#ses`/`#txs` and the
  child `#te`/`#se`/`#tx` are different elements in different frames; the type attribute is what
  is held constant. The claim reads "same type attribute, activation held constant, origin
  varied", never "same element". Flip: a same-element origin proxy in the fixture.
- **"The `accept` grammar is measured"** — one extension token (`.png`) and one MIME-typed byte
  answer; `image/*` and mixed lists are not exercised. Flip: one leg per token form (carried from
  r84's routed defect 2, still unmet).
- **"The `accept` validates by extension"** — one extension token measured; the MIME-token and
  `image/*` forms are unexercised. The MIME-token branch of the r85 receipt is the
  `accept-mime-answer` **byte** law (`legs[16].stateAfter.k` = `[["tabi-r85-b.png",21,"image/png",
  ""]]`), whose `accept=".png"` is still an extension token — the delivered file's *media type* is
  not the `accept` token that was exercised.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-85/claims.json` (nonce `tabi-r85-l1-620623a43f74`, D
`620623a43f74`). What this seat measured itself, from the lane's scored bytes and by re-running
the frozen instruments read-only:

- **counter** — `node scripts/check-showpicker-r85.mjs --lane <ABS lane> --receipt
  corpus/evidence/round85/chromium-showpicker/receipt.json --expect-driver-sha256
  1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee --expect-nonce
  tabi-r85-l1-620623a43f74 --expect-fixture-sha256
  0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a --prior-set
  .ufo/waves/round-85/controls/c1/prior-set.txt --json` → **exit 0, verdict `clean`, 87 checks,
  findings []**. The 87 decompose as **34** structural/binding ids + **3** `leg-*` meta ids
  (`leg-marks`, `leg-order`, `leg-records`) + **24** per-leg shape ids + **26** `*-law` ids; the
  r84 counter's 80 decompose as 34 + 3 + 18 + 25, and the set difference of the two `checks` maps
  is exactly the seven new ids (six `leg-sp85-*` + `same-origin-no-picker-law`), with no r84 id
  lost.
- **battery** — `.ufo/waves/round-85/scored/battery-a.json`: **175 cases, 0 failed, coverage
  87/87** (`declared 87`, `covered 87`, `uncovered []`, `unknown []`).
- **kill power** — `.ufo/waves/round-85/scored/killpower-a.json`: **58 mutants, 58 killed, 0
  survived, 0 crashed, 0 unapplied**.
- **family witnesses (C2)** — `node scripts/witness-families-r85.mjs --lane <ABS lane> --work
  <ABS scratch> --json` → **exit 0**. `before.survivors` = **3** (`cross-access-dropped`,
  `cross-childseq-dropped`, `cross-childact-before-dropped`; each survived the frozen r84 battery
  with 162 cases / 0 failed), `after.survivors` = **0** (all six killed, 1–2 failures each, first
  `cross-tel-crossaccess` / `cross-tel-childseq` / `cross-tel-childact-before`); `crashed []`,
  `unapplied []` in both generations. **C2 before/after: 3 of 6 families survive the frozen r84
  battery, 0 of 6 survive the frozen r85 battery.** The same numbers are in
  `.ufo/waves/round-85/scored/witness-a.json`.
- **self-test** — `.ufo/waves/round-85/scored/selftest.json`: `clean true`, **9 gates, 0 failed**
  (`pins-match-freeze`, `counter-clean`, `battery`, `kill-power`, `nowork-control`,
  `tree-exempt-path-refused`, `tree-exempt-unmatched-refused`, `record-drift`,
  `capability-status`).
- **record drift** — `node scripts/check-record-drift-r85.mjs --lane <ABS lane> --json` → **8
  claims, 0 mismatches**; all eight ids `ok` (`family-witnesses`, `accept-grammar-frontier`,
  `same-origin-contrast`, `limit-constant-offset`, `r85-numbers`, `census-artifacts`,
  `r85-identity`, `witness-instrument`).
- **do-nothing control** — `.ufo/waves/round-85/controls/c1/nowork-r84-under-r85.json`: the r84
  scored receipt under the r85 counter → **exit 1, verdict `findings`, 81 checks, 22 findings**
  (`schema`, `nonce-shape`, `nonce-expected`, `driver-pin`, `fixture-hash`, `plan-frozen`,
  `leg-order`, `leg-records`, `plan-calls`, `leg-sp84-webkitdirectory-answer`,
  `leg-sp84-accept-answer`, `leg-sp84-multiple-mode`, `leg-sp84-accept-mime-answer`,
  `leg-sp84-second-chooser-answer`, `webkitdirectory-answer-law`, `accept-answer-law`,
  `multiple-mode-law`, `accept-mime-answer-law`, `second-chooser-answer-law`,
  `same-origin-no-picker-law`, `fixture-descriptors`, `prior-set-complete`) — it cannot reach 87.
  A no-receipt run exits **2** (`verdict: unreadable`, `receipt-unreadable`); the committed
  transcript is `.ufo/waves/round-85/controls/c1/noreceipt.txt`.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `instrument-drift` — the D1 drift counter looked for the six WITNESS family names (`cross-message-unpinned`, `cross-childlate-dropped`, `cross-access-dropped`, `cross-childseq-dropped`, `cross-childact-after-dropped`, `cross-childact-before-dropped`) inside the battery source, where the battery's case ids are `cross-tel-message-unpinned`, `cross-tel-childlate`, `cross-tel-crossaccess`, `cross-tel-childseq`, `cross-tel-childact-after`, `cross-tel-childact-before` (`scripts/negatives-showpicker-r85.mjs:238–243`). The `family-witnesses` claim therefore read red on a battery that does contain all six refusal cases. | re-run of the D1 bytes (`git show 5c19615:scripts/check-record-drift-r85.mjs`, sha256 `1c6f1396…20d84`) against the D2 lane → exit 1, `failed:["family-witnesses"]`, detail `battery cases missing: ["cross-message-unpinned", … ]` (all six); the D2 bytes add a `FAMILY_CASES` map and read clean | the drift counter's own `family-witnesses` claim (it named the six case ids it could not find) | the D2 counter maps each family to the battery case that must refuse that weakening; D1→D2 re-freeze recorded in `plans/round-85.md` §Re-freeze history (no record had been scored against D1's drift counter) |
| `prior-drift` *(carried from the lane's own r85 record; not re-run by this seat)* — the prior receipt was a 21-leg probe while the counter plans 24 legs, so the replay-forgery case fired `plan-frozen`/`leg-order`/`leg-records` instead of `replay-event-timeline` | the r85 battery's first-run failure log (`replay-event-timeline` case detail naming `plan-frozen, leg-order, leg-records`) | the replay case's own `expect`+`alsoAllowed` assertion | a 24-leg prior was re-run at nonce `tabi-r85-prior3-a1` and committed as `.ufo/waves/round-85/controls/c1/probes/prior1.json` (sha256 `d6ab237f…f4c2`, 24 legs, 76 page events); the scored counter's `limit` block now reads `priorEvents 76, absNeed 38, escapeEvents 39, refused false` |
| `battery-coverage` *(carried from the lane's own r85 record; not re-run by this seat)* — the first r85 battery run flagged 8 failing cases: duplicated per-leg cases for the six new legs (the generic `LEG_NAMES` loop already emits them) failed because `no-selection-law` fires as collateral and the duplicate copy carried no allowlist | the first `scored/battery-a.json` run (`cases 181, failed 8`, every failure `extra ["no-selection-law"]`) | the battery's own case-level `alsoAllowed` rule — a case passes only when no unnamed id fires | the duplicate loop was removed and `LEG_ALSO` gained the six new legs; final battery **175 / 0 / 87–87** |
| `measurement-scope` — C2's first before-value *(this seat re-measured the 3 → 0 result itself; the first before-value is the lane's record)* assumed all six families survive the frozen r84 battery; three were already killed by the r84 D repair (R84Mut1 ran the freeze-commit battery `828dfcb7…`, not the final D bytes `42fcfedc…`), so the honest before-value is **3**, not 6 | `.ufo/waves/round-85/scored/witness-a.json` `before` leg (3 survivors, 3 killed, first failures `cross-origin-tel-message` / `cross-origin-text-late` / `cross-origin-search-activation` — the three cases the r84 battery already carried at `scripts/negatives-showpicker-r84.mjs:174–176`) | the witness runner's own before/after split, read before the report was written | the claim is narrowed to the measured **3 → 0**; recorded in `plans/round-85.md` §Declared limits and in SCORECARD |
| `scope` — C1's "the SecurityError is origin-determined" reads as a 2×2, but the fixture measures three cells: every cross-origin leg calls `showPicker()` from inside the child's own click handler (`go12`/`go13`/`go14`), so the (cross-origin, **no**-activation) cell is never measured, and the two sides are different elements (`#tes` parent vs `#te` child) | the receipt's own activation readback: `legs[12..14].childActivationBefore` `{isActive:false,hasBeenActive:false}` → `childActivationAfter` `{isActive:true,hasBeenActive:true}` (all three cross legs), against `legs[18..20]` `{false,false}`→`{false,false}` and `legs[21..23]` `{true,true}`→`{false,true}`; the driver's `CHILD_TEMPLATE` binds `go12`/`go13`/`go14` to a `showPicker()` call inside the click handler (`scripts/chrome-cdp-showpicker-round85.mjs`, `CHILD_HTML`) — there is no non-gesture child call path | this seat's receipt read-back and the driver's own wiring, and R85Critic's independent falsification attempt | the law is stated as "origin-determined **given activation**, for these types, with the type attribute held constant" — same type attribute, activation held constant, origin varied; never "same element". No predicate, counter, pin, prior, threshold or kill rule is amended |
| `vacuous` — C1's parenthetical "(no picker exists for these types)" is prose inside the clause the claim calls "the measured law", and no receipt field backs it: the zero-open expectation is a hardcoded name set in the counter (`NO_PICKER`, `scripts/check-showpicker-r85.mjs:146`), and the receipt has no picker-capability field at all (`fixtureInputs` records `{id, tag, type, multiple, webkitdirectory, accept, rect}` only) | `legs[21..23].showPicker` = `{ok:true, ret:'undefined'}` and zero `Page.fileChooserOpened` are what is recorded; the mechanism (an early return for the type vs. no popup view) is not; the same unmeasured parenthetical has already propagated into the SCORECARD capability row (`SCORECARD.md:4133`: "(no picker exists for tel/search/text on this platform)") | this seat's read of the receipt's field set against the counter's expectation table | the law is stated as "returns `undefined` and opens NO chooser", and the mechanism is left in the knowledge note's §What a receipt of this shape cannot prove with its flip condition; the SCORECARD row's parenthetical is flagged to the L1 as prose, not amended here |
| `number-drift` — the frozen claim's do-nothing-control prose says "exit 1, 81 checks (not 87), **21 findings**", but the control artifact it points at (`.ufo/waves/round-85/controls/c1/nowork-r84-under-r85.json`, re-run at the D2 receipt) carries **22** findings. The number in the record is stale by one finding. | this seat's count of the committed control file (`len(findings)` → 22, ids listed in the lesson's Gate section) against the frozen claim's `doNothingControl` string (21) | the control artifact's own `findings` array and the frozen claim's prose, read side by side | **reported, not amended** — the claim is FROZEN and no predicate, counter, pin, prior, threshold or kill rule is proposed for change. The lesson states the measured **22** and names the twenty-two ids, so the lane's own prose is right; the L1 owns whether the frozen claim's descriptive string is re-issued (that is a re-freeze question, not a scribe's edit) |
| `reference-drift` — the plan's predicate line names the **D1** fixture pin next to the **D2** nonce: `plans/round-85.md:18` reads "with every pin (driver `1690c63d…`, fixture `9b71a949…`, nonce `tabi-r85-l1-620623a43f74`)", but the live D2 receipt's `fixture.sha256` is `0b012937…d252a` (`9b71a949…2db5d` is the superseded D1 receipt's fixture). The plan's own §Re-freeze history (line 82) records the correct D2 fixture. The `fixture-hash` check compares `r.fixture.sha256` to the operator-supplied expectation, so the stale line would make the plan's stated command fail on the live receipt. | `sha256sum`/JSON read of `corpus/evidence/round85/chromium-showpicker/receipt.json` (`fixture.sha256` = `0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a`, nonce `tabi-r85-l1-620623a43f74`) against `plans/round-85.md:18`; the plan's line 82 names the same D2 fixture `0b012937…` | this seat's own re-run of the frozen counting command with the plan's D2 fixture pin → exit 0, `clean`, 87 checks, 0 findings | **reported, not amended** — the plan is the L1's record; the knowledge note's `recheck:` line and the SKILL registry row both carry the concrete live fixture pin `0b012937…d252a`, and this seat's measured runs use it. No predicate, counter, pin, prior, threshold or kill rule is proposed for change |

Sweep for further mistakes: the honest D2 receipt and the frozen counter agree leg-for-leg on all
24 legs; the counter's 87 ids decompose exactly; the battery's 175 cases cover 87/87; the 58
mutants are all killed; the six family weakenings are applied and scored by the witness runner
itself, twice (this seat's own run and the scored `witness-a.json` agree id-for-id); and the
no-work control is refused. No further class found by this seat. Two findings this seat did **not**
attribute to itself are carried from the sibling seats' reports and are recorded here only as
provenance, not as this seat's measurement: the scored receipt is not yet committed (R85Review1
MEDIUM-1), and `--expect-fixture-sha256 <receipt fixture sha256>` in the frozen counting command
is self-supplied (R85Review1 MEDIUM-2) — this seat measured the same circularity independently and
notes that the **knowledge note's** `recheck:` line pins the concrete fixture hash
`0b012937…d252a`, which is stronger than the claim's command.

## Corrections — the r84 spot-check's routed defects (append-only; the r84 records are not rewritten)

| # | routed defect | state at r85 close (this seat's measurement) |
|---|---|---|
| 1 | battery witnesses for R84Mut1's survivor families | **six family cases present** (`scripts/negatives-showpicker-r85.mjs:238–243`); the witness runner measures before **3** survivors → after **0**; kill power re-derives the same six weakenings among its 58 mutants, all killed |
| 2 | `accept` MIME-token / `image/*` grammar | **carried as frontier with flips** — the r85 note §Frontier names the token matrix (`image/png` MIME token, `image/*`, mixed list) as the named frontier; nothing in the round moves it |
| 3 | same-origin tel/search/text contrast leg | **landed twice** — six legs, no-activation and activated arms, one new law `same-origin-no-picker-law`; the six arms' outcomes are the three distinct cells (NotAllowedError / `undefined`+0 choosers / SecurityError) |
| 4 | limit sentence printing the constant-offset escape | **landed and measured** — the counter prints the escape in its `limit` block; a copy of the scored receipt with every page event shifted by `+2.0` still passes `replay-event-timeline` (`checks['replay-event-timeline'] === true`, `absMatched 0`, `refused false`), and the battery keeps the `accept-retimed` must-accept case |
| 5 | C2 Gate-prose reconciliation | **landed** — `scripts/check-record-drift-r85.mjs` reads the accept-frontier sentence (`accept-grammar-frontier`) and the family witness numbers (`witness-instrument`, `before 3 / after 0`); 8 claims, 0 mismatches |
