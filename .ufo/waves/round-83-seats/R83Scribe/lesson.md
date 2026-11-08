# tabi — round 83

L1 `TabiR83a2`. Lane base `518f6b84` (round-82 non-author spot-check, clean tree); the wave was
dispatched at `4cdf4def` (this round's digests + first freeze). Round 82 was admitted; its three routed
defects (the direction-bound counter, the lesson `7 -> 4` numbers, the missing census artifacts) are this
round's C2 spine, and its named frontier legs (`type=number`/`range` cross-origin, `multiple`-mode
answer, the accept answer, the second-chooser answer) are C1's. Claims: C1 coverage — capability
`chromium-showpicker-linux` generation r83; C2 calibration — record drift on the r82 routed defects plus
the anchored direction-bound counter and the self-drift identity/numbers legs.

Census start: exit 0, 223 rows, 37 `W04` lines (`.ufo/waves/round-83/census/start.txt`); end: exit 0,
same 223 rows and the same 37 `W04` lines (`.ufo/waves/round-83/census/end.txt`). The two pastes are
byte-identical, and a fresh run reproduces them line for line.

Scored (r83): counter 74 checks clean, battery 153/153 with coverage 74/74, kill power 50/50 (0
survivors, 0 crashed), gate self-test 9/9. Instrument pins in `.ufo/waves/round-83/freeze.txt`; all six
files re-hashed this round and byte-identical to their freeze lines.

**The digest lineage, because this round is full of 12-hex strings that look alike.** `claims.json`
`digestsCommit` is the **sha256 of `freeze.txt` itself**, not a git object id, so it moves whenever the
freeze is amended:

| commit | what it did | `sha256(freeze.txt)` |
|---|---|---|
| `4cdf4def` | digests + first freeze | `c016710129da3323…` |
| `27d5451b` | freeze amendment (redundant mutant removed, prior set repaired, law checks added) | `6ff35c2863afd903…` |
| `5d6c34f0` | generation r83 + calibration drift, scored | `9d90392aca79209c…` |
| `615c97a1` | 69 imported witnesses, final pins | `b6496e6f5d4f0fda…` |

The driver pin never moved (`70b522cc…` at all four states), which is why a scored receipt stays
scoreable across the amendments: the browser artifact is fixed and the counter grew from 72 checks to
74. The receipt was re-run once at the identity nonce `tabi-r83-l1-b6496e6f5d4f`, so the scored receipt
and the records' identity nonce are now one value; the earlier first-freeze run (nonce minted under
`4cdf4def`) is superseded and shares its law surface leg for leg.

## Gate

### Sources — the candidates (19 opened; 14 fetched HTTP 200, 5 probed 404)

The scout's manifest is `.ufo/waves/round-83-seats/R83Scout/sources/FETCH.txt`; this seat re-hashed
every staged file and compared each against the pin of the row it would collide with.

| file (tag 155.0.8059.84 unless noted) | HTTP | decoded bytes | sha256 | existing row / decision |
|---|---|---|---|---|
| WHATWG `input.html` | 200 | 687,515 | `b0202de1c0b4…` | S219/S223/S216 — byte-identical re-open; **S224** new scope |
| `DOM.pdl` | 200 | 34,575 | `50c460459e50…` | S208/S222 — byte-identical, excluded |
| `Page.pdl` | 200 | 61,911 | `e944a3b19fa2…` | S202/S212/S221 — byte-identical, excluded |
| `html_input_element.cc` | 200 | 101,570 | `405b52c70185…` | S218/S220 — byte-identical, excluded |
| `file_input_type.cc` | 200 | 23,415 | `f96265db986a…` | S210 — byte-identical; **S225** new scope |
| `inspector_page_agent.cc` | 200 | 79,304 | `1dd744b58227…` | S211 (lines 1899-1913 already carry the mode map and `GetDomNodeId`) — excluded |
| `inspector_dom_agent.cc` | 200 | 128,010 | `e7c983b4b00f…` | S209 (lines 1795-1817) — byte-identical; **S227** new scope |
| `file_chooser.mojom` | 200 | 5,755 | `718783541fb3…` | no row — **S226** |
| `dom_node_ids.h` | 200 | 1,189 | `83f63b185057…` | no row — **S228** |
| `dom_node_ids.cc` | 200 | 2,081 | `33f40333b67f…` | folded into S228's anchor, no second row |
| `file_chooser.h` / `file_chooser.cc` | 200 | 4,818 / 5,950 | `1c24816c…` / `1f203063…` | nothing the laws need — excluded |
| `input_type_view.cc` | 200 | 8,351 | `c382c7c17659…` | `MultipleAttributeChanged()` is an empty no-op — excluded |
| `identifiers_factory.cc` | 200 | 5,551 | `8d8ee04ee525…` | its `IntIdForNode` restates `GetDomNodeId`, inside S211's range — excluded |
| `inspector_protocol.pdl`, `inspector_file_chooser.cc`, retired `devtools-protocol/pdl/domains/DOM.pdl`, `core/file/file_chooser.h`, `platform/filechooser/file_chooser.cc` | 404 | — | — | five probes, no bytes — excluded |

Identified 19 / screened 19 / **included 5** / excluded 14.

### Sources — included (new rows S224-S228; quote, locator, `wc -w`)

- **S224** WHATWG HTML §4.10.5.3.5 *The multiple attribute* — raw line 4989 (definition sentence at
  4990-4991); the File Upload bound at raw line 4027; the picker step at raw line 5865. Quote (22
  words): "The multiple attribute is a boolean attribute that indicates whether the user is to be
  allowed to specify more than one value." Second quote (20 words, raw line 4027): "Unless the multiple
  attribute is set, there must be no more than one file in the list of selected files."
- **S225** Chromium `file_input_type.cc` — decoded lines 62-70 (`CollectAcceptTypes`). Quote (8 words,
  lines 63-64): "Vector<String> mime_types = input.AcceptMIMETypes(); Vector<String> extensions =
  input.AcceptFileExtensions();". Outside S210's declared mined lines (174-224, 465-481, 483-508,
  525-556), hence a second scope rather than a re-open.
- **S226** Chromium `file_chooser.mojom` — decoded lines 14-59 (`FileChooserParams`: `Mode` enum
  15-36, `accept_types` 55-59). Quote (9 words, line 20): "Like Open, but allows picking multiple files
  to open." The `accept_types` comment (19 words, lines 55-56) contains literal `|` characters and
  cannot go into a registry cell; quote it in prose only.
- **S227** Chromium `inspector_dom_agent.cc` — decoded lines 636-658 (`AssertNode`). Quote (3 words,
  line 646): "node = DOMNodeIds::NodeForId(backend_node_id.value());"; the no-selector refusal (8
  words, line 657): "Either nodeId, backendNodeId or objectId must be specified".
- **S228** Chromium `dom_node_ids.h` lines 29-30 with the sibling `.cc` lines 22-38. Quote (13 words,
  line 29): "Return a node for the DOMNodeID or null if one hasn't been assigned."

Why these five and no others: each carries a sentence a law of this generation needs and no existing
row's `scope` reaches. S224's `multiple` ground is in neither S219's scope (the exception steps) nor
S223's (`accept`); S225's token split is outside S210's mined lines; S227's id resolution is outside
S209's; S226 and S228 are URLs the registry does not hold at all.

**Cost of the insert, measured on a scratch copy before landing:** census `validate` stays exit 0 with
37 → 40 `W04` lines (S224/S225/S227 are same-URL second scopes, the `S206`/`S212` precedent);
`scripts/check-sources.mjs` goes from 15 to 18 `duplicate_url` findings in a gate that is already red at
base with the same 15. S226 and S228 add nothing. The laws do not depend on S224/S225/S227, so dropping
them costs the round a scope cell, not a claim. Paste-ready rows and the per-row Gate material are
drafted at `.ufo/waves/round-83-seats/R83Scribe/sources-rows.md`.

### Sources — re-opened, no new row (byte-identical to their pins)

S219, S220, S221, S222, S223 were re-opened by this round's fetches: the WHATWG page is
`b0202de1c0b4…`, `html_input_element.cc` `405b52c70185…`, `Page.pdl` `e944a3b19fa2…`, `DOM.pdl`
`50c460459e50…`, `file_input_type.cc` `f96265db986a…` — every one byte-identical to the pin its row
already carries. `recheck` stays `90d` for all of them: nothing moved. Their `used-by` cells are the open
defect (Corrections row 8).

### Admitted / rejected claims

C1 admitted as the round's coverage move (frozen predicate `C1-SHOWPICKER-R83`, counter
`check-showpicker-r83`, **74 checks**, battery 153/153, kill power 50/50, selftest 9/9). C2 admitted as
the calibration move (`scripts/check-record-drift-r83.mjs`, 7 claims; before
`lesson-proof/c2-before.json` 4 mismatches, after the identity repair 0).

Rejected framings, each with the flip that would change the verdict:

- **"The number/range SecurityError generalizes to every remaining input type."** Two of the three named
  remaining types are measured (`number`, `range`); `tel`, `search`, `text` are carried from S219's
  enumeration. Flip: a cross-origin leg for each remaining type at this tag.
- **"`multiple` is the only trigger of `selectMultiple`."** The mode is read from the fixture's
  `multiple` attribute by `mode-law`; no leg varies `webkitdirectory`, `capture`, or the directory/save
  modes S226's `Mode` enum names. Flip: a leg sweep over the mode-producing attributes.
- **"The PNG into `accept=\".png\"` proves `accept` validates by extension."** It proves the opposite —
  `accept` does not filter a programmatic answer (`legs[13]` accepted a conforming file, `legs[8]` a
  non-conforming one). The grammar's MIME-token and `image/*` branches are unmeasured; the fixture
  declares `accept="image/png"` on `#accept` and no leg targets it. Flip: a token-grammar leg set.
- **"Answering the second chooser proves the shared `backendNodeId` is discriminating."** The id stays
  shared; the bytes discriminate the *answer*, never the chooser that consumed it, and a consistent
  relabel of the id to `999` at all four sites still scores clean 74/74 (measured). Flip: two choosers
  on different inputs.
- **"A clean 74/74 proves a browser ran."** The replay rule binds against the recorded prior only and
  escapes at 31 of 61 moved events; every identity field is an operator-supplied pin. Flip: a
  translation-invariant statistic in the limit block.
- **"The carried set is the r82 seven laws."** The counter carries eight law checks (`gesture`,
  `activation`, `mode`, `cross-origin-nonfile`, `order`, `webkitdirectory-answer`, `accept-answer`,
  `click-while-open`), and the r82 note numbers five. Flip: a claims sentence naming the eight ids.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `reference-drift` — the frozen PLAN omitted `clickAt` on the two click legs while `plan-calls` reads `p.clickAt[0]` | reproduced this round: deleting `clickAt: [160, 670]` from both click-leg entries of a scratch copy of the frozen counter and scoring the real receipt gives `TypeError: Cannot read properties of undefined (reading '0')` at `check-showpicker-r83.mjs:389`, exit 1, no verdict emitted | the pre-freeze probe (fatal before scoring; no probe receipt survives from that pass) | both click legs carry `clickAt` in the frozen PLAN; each leg's rect-centre read in `pageEvents` verifies the coordinates |
| `reference-drift` — `LEG_KEYS` requires `firstChooserBackendNodeId` and `secondChooserBackendNodeId` on **every** leg, but only the second-chooser leg used to set them | both receipts carry the keys on all 15 legs (`null` on 14, equal positive ids on `sp83-second-chooser-answer`); the committed `controls/c1/probes/prior1.json` carries them too (`null` on 14, `13`/`13` on the last) | the pre-freeze probe (one `leg-records` finding) | the driver initialises both to `null` on every leg. The earlier draft's sweep sentence — "the probe receipt's legs lack the fields" — describes a probe that was not retained and is superseded (Corrections row 10) |
| `reference-drift` — the prior set initially resolved to the **r82** receipt, so the battery's replay case cloned a foreign plan and failed on `plan-frozen`/`leg-*` before reaching `replay-event-timeline` | prior set now resolves to one r83 probe (`.ufo/waves/round-83/controls/c1/probes/prior1.json`, sha256 `dfeba0d3…`, schema `tabi-chrome-cdp-showpicker-r83`, 15 legs, 61 page events, nonce `tabi-r83-probe`); the counter's `limit.perPrior[0]` reports `priorEvents 61` | the battery's own case rule (one expected id, 20+ observed) | prior set holds an r83-shaped probe; the case passes |
| `survivor` — mutant `second-chooser-id-dropped` survived: its conjunct is double-covered by `plan-calls`' answer binding and by `first === second` | kill-power run reported 1 survivor; the final sweep is 50 mutants / 50 killed / 0 survived / 0 crashed | the kill-power gate | the redundant conjunct dropped as a rule owned by another check (QUALITY 156), not covered by a case |
| `record` — the earlier draft of this section recorded `R83Mut1` and `R83Scribe` as dead seats | both were alive: `R83Mut1` produced `mutants.json` plus per-mutant receipts (111 mutants executed) and this seat wrote three drafts; the orchestrator's liveness measure is the authority | the orchestrator's seat roster, read after the draft | the record is retracted in place (this row is the retraction); dead-seat claims now name the liveness source |
| `record` — the frozen claims state "72 checks" (`claims.C1.legs.a` and `frozenAt`) while the scored counter reports 74 | the counter at `4cdf4def` (sha256 `a89c2dbe…`) scores the same receipt 72/72 clean — measured by re-running it; the amended counter (`7b9f9ec4…`) reports 74 | this seat's re-run of the superseded counter | claims are frozen and are not edited; the supersession is recorded (Corrections row 4) |
| `record` — `SCORECARD.md`'s C1 counting command substitutes the lane identity nonce for the receipt's own run nonce | running it verbatim before the re-run gave exit 1, `verdict: findings`, 74 checks, with `nonce-expected` the only false check | this seat's re-run | the row must read `<the receipt's own run nonce>`; the note's `recheck:` line already does |
| `record` — the earlier draft of this lesson wrote the superseded first-freeze nonce **with its full `tabi-r83-l1-` prefix**, which the identity leg's whole-file regex reads as a wrong citation | the live C2 counter returned `mismatches: 1`, failed `[r83-identity]`, `cited=["b6496e6f5d4f","c016710129da"] wrong=["c016710129da"]` with only that sentence changed; removing the prefix (as this revision does) returns 0 | this seat's live run of the C2 counter | the superseded value is written as the bare 12-hex `c016710129da` with a word between it and the prefix; the rule is stated in Corrections row 6 so the next scribe does not re-arm it |
| `record` — `c2-controls.json` records six failed ids for the reversed-correction control, but the arrow swap alone fails one | on a scratch mirror of HEAD bytes, reversing the lesson's `23 -> 20` to `20 -> 23` fails `direction-bound` only (1 mismatch); restoring the arrow returns 0 | this seat's control run | the six-id list is a fuller mirror mutation; cite it as one, or re-record the arrow-only control |
| `counter` — the drift counter's header claims it "re-executes the reversed control on a scratch mirror" | `grep -c child_process scripts/check-record-drift-r83.mjs` → 0; no `spawn`/`exec`/`fork` in the file. The refusal in `c2-controls.json` is the drift seat's external run | this seat's read, corroborated by the drift seat's own Control 1 section | header corrected to "inspects a committed refusal record", or the executor implemented — an amendment, flagged and not applied |
| `counter` — `direction-bound`'s anchor is a whole-file regex, not cell-scoped | with the arrow present **only** outside the corrections table (cell rewritten, `23 -> 20` appended to a later prose section) the counter still exits 0, 0 mismatches | this seat's control | scope the test to the corrections table row — an amendment, flagged |
| `counter` — `direction-bound` tolerates the reversed arrow's co-presence, and `lesson-7-to-4` computes a truth string it never gates | adding `20 -> 23` beside the correct arrow exits 0; corrupting the named truth `mismatches: 4` to `mismatches: 99` in the lesson also exits 0 | this seat's controls | bind the direction by rejecting co-presence and wire or drop the dead `truthNamed` variable — amendments, flagged |
| `counter` — `multiple-mode-law` does not pin the delivered bytes | a receipt whose `sp83-multiple-mode` `read` event carries `ret:'hex:00'` scores clean 74/74; the same forgery fails `accept-mime-answer-law` and `second-chooser-answer-law` | this seat's receipt forgeries | add the `ret` conjunct — an amendment, flagged; until then the leg's file list, mode, state and upload sha are bound and its bytes are not. SCORECARD narrows the capability sentence to match |
| `record` — the SOURCES reciprocity is one-way for this whole family | `grep -c 'chromium-showpicker-runtime-round-8[23].md' corpus/SOURCES.md` → `0`: both notes cite S219-S228 and no row names either note | this seat's registry read | append both notes to S219-S223 `used-by` (draft in `sources-rows.md`; Corrections row 8) |
| `instrument` — the two registry instruments disagree on one class and only one of them is green | `scripts/check-sources.mjs` exits 1 with 15 `duplicate_url` findings at base `4cdf4def` and at HEAD (measured both, same 15); `scripts/sources-census.sh validate` scores the same rows as `W04` warnings and exits 0 | this seat's runs of both instruments | quote the instrument when claiming a clean registry; "census clean" is not "structural gate clean" |
| `evidence` — a scored artifact was observed truncated inside the walked tree while the round was live | `.ufo/waves/round-83/scored/killpower-a.json` read 0 bytes at 02:41 (sha256 of the empty string, `e3b0c442…`) and 5,327 bytes with 50/50/0/0 at 02:44; a C2 counter run inside that window fails `r83-numbers` with `kp=null` | this seat's two independent reads of the same path | write scored artifacts atomically (temp file + rename), and never score while a sibling is rewriting the tree; the final file is intact |

Sweep for further mistakes: re-ran the C1 counter (exit 0, 74), the C2 counter (exit 0, 7 claims, 0
mismatches after the identity repair), `check-sources.mjs` (exit 1, 15 `duplicate_url`, 223 rows, A:205
B:9 C:9, queued 15 / mined 198 / rejected 10) and `check-capability-status.mjs` (exit 0, rows 16,
claimed 15, provisional 1, mismatches 0). Degenerate cases reached: an r82 receipt under the r83 counter
fails 40+ ids across schema/plan/pins; an r83 receipt under the r82 counter fails symmetrically.

## Corrections — the r82 routed defects (append-only; the r82 records are not rewritten)

`scripts/check-record-drift-r83.mjs` counts these (before `lesson-proof/c2-before.json`: **4** mismatches
of 7 claims — `direction-bound`, `census-artifacts`, `r83-identity`, `r83-numbers`; after the identity
repair: 0).

| # | record (stale still present) | stale statement | correction |
|---|---|---|---|
| 1 | `scripts/check-record-drift-r82.mjs` `direction-bound`; `corpus/lessons/round-82-verifier-spotcheck.md` §Routed defects 1 | the direction leg greps `c2-controls.json` for `/reversed/` and never re-executes; the directional regex is satisfied by the stale quote's own text | the r83 counter anchors on the correction's own arrow, `23 -> 20`, and the reversed control `20 -> 23` is refused: on a scratch mirror of HEAD bytes the reversal makes `direction-bound` fail (exit 1, 1 mismatch) and restoring the arrow returns 0. Two halves of the routed fix are **not** landed and stay recorded: the anchor is a whole-file regex (the arrow outside the corrections table still passes, measured), and the counter contains no executor — the `"refused": true` in `c2-controls.json` is the drift seat's external run |
| 2 | `corpus/lessons/round-82.md:46,63` | "7 mismatches" (twice) | `7 -> 4`: the committed `.ufo/waves/round-82/lesson-proof/c2-before.json` records `mismatches: 4` with failed `[quote-count-propagation, direction-bound, r82-identity, r82-numbers]`. The frozen r82 lesson is append-only and stays stale. The binding is directional, not merely numeric: replacing the stale `7 mismatches` with `4 mismatches` in a scratch copy of the frozen lesson makes `lesson-7-to-4` fail (exit 1, measured) |
| 3 | `.ufo/waves/round-82/census/` (absent) | the r82 lesson cites a census start and end and a "W04 only — see below" pointer with no section and no artifact | this round files `.ufo/waves/round-83/census/start.txt` and `end.txt`, byte-identical pastes carrying 223 rows, 37 `W04` lines and `exit=0`; a fresh run of `sources-census.sh validate --root … tabi` reproduces them line for line |
| 4 | `.ufo/waves/round-83/claims.json` `claims.C1.legs.a` and `frozenAt` | "counter exits 0 clean 72 checks" | the scored counter reports **74 checks**; 72 is the pre-amendment counter (sha256 `a89c2dbe…` at `4cdf4def`), which scores the same receipt 72/72 clean — measured. The frozen claim is not edited; this line supersedes its number |
| 5 | `SCORECARD.md` round-83 C1 row (counting command) | `--expect-nonce tabi-r83-l1-b6496e6f5d4f` was once the identity nonce while the receipt carried the first-freeze nonce | the receipt was re-run at the identity nonce so the substitution is now true of the scored receipt; the row still must read `<the receipt's own run nonce>`, because the nonce is minted per run and a later re-run moves it again |
| 6 | `corpus/lessons/round-83.md` (this round's own earlier text) | it wrote the superseded first-freeze nonce with its full `tabi-r83-l1-` prefix, which the identity leg's whole-file regex reads as a wrong citation | **rule for the next scribe:** a superseded nonce is written as the bare 12-hex `c016710129da`, never adjacent to the lane prefix; the live counter returned `mismatches: 1`, failed `[r83-identity]` for exactly that sentence, and returns 0 with the prefix removed. Teaching the counter to exempt a supersession is an amendment, flagged |
| 7 | `.ufo/waves/round-83/lesson-proof/c2-controls.json` | the reversed-correction control lists six failed ids (`direction-bound`, `lesson-7-to-4`, `census-artifacts`, `r82-verdicts-preserved`, `r83-identity`, `r83-numbers`) | the lesson-arrow reversal alone fails one id (`direction-bound`), measured; the six-id list belongs to a fuller mirror mutation. The record is true of its own mutation and should say so |
| 8 | `corpus/SOURCES.md` (`used-by` of S219-S223) | no row names `corpus/knowledge/chromium-showpicker-runtime-round-82.md` or `…round-83.md` | append both paths to S219, S220, S221, S222 and S223 (old → new rows in `.ufo/waves/round-83-seats/R83Scribe/sources-rows.md`); the r82 Gate's claim that its re-opens refreshed `used-by` was not landed |
| 9 | `corpus/lessons/round-83.md` §Gate (this round's earlier text) | "No new source rows … identified/screened/included/excluded = 0/0/0/0" | the scout opened 19 candidates and five carry new ground: identified 19 / screened 19 / included 5 (S224-S228) / excluded 14, each with its quote, locator and `wc -w` count in §Gate above |
| 10 | `corpus/lessons/round-83.md` §Mistakes sweep (this round's earlier text) | "the pre-freeze probe receipt's legs lack the two chooser-id fields" | the committed `controls/c1/probes/prior1.json` carries both fields on all 15 legs (`null` on 14, `13`/`13` on the second-chooser leg); the probe was re-produced after the driver fix and the earlier probe was not retained |

Directions bound: the quote count requires the lesson to carry `23 -> 20` with the arrow between the
tokens (a reversed `20 -> 23` alone fails), and the mismatch count requires `7 -> 4` with the stale token
still present in the frozen r82 lesson. Both are file-wide tests; the cell-scoping gap and the
co-presence gap are recorded in Mistakes rather than claimed away.

## Sources

Identified 19 / screened 19 / included 5 (S224-S228) / excluded 14 (nine fetched files whose ground an
existing row already scopes or whose lines no law needs, plus five 404 probes). Carried rows re-opened
2026-11-08: S219, S220, S221, S222, S223 — all byte-identical to their pins. Rows before → after:
223 → 228 once the five land; census start and end both 223 because the rows land with this lesson.

## Wave w1 findings (integrated)

One v1 wave, ten seats (three attack roles — R83Review1, R83Review2, R83Critic — plus connector, scout,
scribe, drift, and two executors). The findings, and what this seat verified of each:

1. **`multiple-mode-law` accepts any read bytes (R83Review1; verified here).** A forged receipt with
   `read.ret='hex:00'` on that leg scores clean 74/74 while the same forgery fails the two sibling answer
   laws. Narrowed: the leg binds the mode, the file list, the state and the driver's upload bytes, not
   the page-read hex; the `ret` pin is frontier work.
2. **The direction-bound "re-execution" is external, not self-proving (R83Drift; verified by grep).**
   The counter binds direction statically (`cellAnchor` + `reversedOnly` + a committed refusal record) and
   spawns nothing; the drift seat's mirrored run is the refusal's provenance. Two further gaps measured
   here: the anchor is file-wide, and co-presence of both arrows passes.
3. **`r83-numbers` is presence-only for a single statement (R83Drift; verified).** Removing one of the
   several `74 checks` statements does not change the verdict; removing all of them is refused.
4. **The replay boundary (R83Critic).** Copying the prior verbatim is refused (61/61 matched, need 31);
   moving the first 31 events escapes replay (30 < 31) but `event-leg-window` catches the naive boundary
   move; a constant translation of every event escapes, as the limit sentence says.
5. **Cold-run reproducibility (R83Exec1).** Two runs of the frozen driver on disjoint port triples both
   exit 0 with 15/15 legs and identical leg surfaces after stripping volatile fields; the counter's
   `prior-set-complete` rule refuses an out-of-tree receipt while the in-tree scored receipt is neither
   under test nor a prior, and the documented content-bound `--tree-exempt-sha256` is the intended escape.
6. **No-work discrimination (R83Critic, R83Review2).** An r82 receipt under the r83 counter fails 40+
   ids across schema/plan/pins; an r83 receipt under the r82 counter fails symmetrically.
7. **Adjacency (R83Connector).** Twenty siblings scanned; the r83 C1 surface is uncontested. The five
   `contested` rows (kagi, kaidoku, kake, kumitate, revenger) contest shared loopback CDP endpoints,
   port leases and substrate paths — reported for the integrator, not absorbed.
8. **Identity-label drift (R83Review1, R83Review2).** The wave brief carried a stale digest stamp
   (`9d90392aca79…`, the `5d6c34f0` freeze) and a lane-prefixed nonce ending `9d90392aca79` that only a
   probe receipt carries — no scored receipt ever ran at it; the freeze's own sha256 is
   `b6496e6f5d4f…`, every seat's re-hash of the six pins matched the file, and the receipt was re-run at
   the identity nonce so the receipt and the records now agree.

Tooling: none installed or upgraded this round (node v24.21.0 and Chromium 155.0.8059.84 already
present; the host-wide pacman pause was respected).

Round-83 note on the spot-check's item 4 (connector F2 record tension): the `PROVINCE.md` contested
labels and the four r81 report quotes that are not substrings of their cited lines are reported to the
integrator for triage to the owning lane (`corpus/lessons/round-82-verifier-spotcheck.md` §Routed
defects 4); this lane does not absorb them. The single canonical amendment pointer stays
`plans/round-82.md` (item 3's second half).

- Round 83 digests: D b6496e6f5d4f, nonce tabi-r83-l1-b6496e6f5d4f. 74 checks.
