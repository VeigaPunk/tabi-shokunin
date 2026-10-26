# ScribeErrataA — frontier errata intake A (round 33 w1)

**Verdict.** Every one of the ten intake findings (CritNewNumbers D1–D5, RevLesson F1–F5) plus the one
observation they carry (O1) re-checks against the bytes at
`e6b0a9074d434ccc307badd312ae7379d1193fea`: **five land** (CritNewNumbers D1–D5, exact append-only texts drafted
below and measured inert), **one lands strengthened** (RevLesson F1 — I derived the missing draft tree
digest `f0d867c3a711f6c7c2176841aff92efef95233d5` from committed bytes and reproduced `mismatches 0` at it), **one
is closed-already** (CritNewNumbers' REV-re-run observation — the round-32 integration did land the promised re-run
as `measure/c1-distinct-at-0808688.json` plus `measure/provenance-0808688.txt`), and **four are refused** with
reasons and flip conditions (RevLesson F2–F5: no statement is false, and each fix would edit a committed receipt
rather than correct a claim). No item falsifies a C1 or C2 verdict, a QUALITY criterion or
a claim; D1 remains a genuine medium, because it reports a routed round-31 defect group as closed with a
remain-count the errata ledger does not support (`16 of 27` where the ledger supports `20 of 27`, with eight carried
items never opened). Two append-only numerals in the source reports are wrong in detail and are corrected in the
drafts rather than copied: CritNewNumbers cites `LOG.md:2107` as stale (its `43 … 27 carried` figure re-derives and
is left alone), and its S125 token parenthesis gives 19 C/JS tokens where my tokeniser gives 20 — the load-bearing
count is the whitespace one (8 words), which stands. Nothing in the lane, in its git index, in jj state, in the
fleet repo or in a sibling lane was edited; the three drafted blocks were applied only in a throwaway `--shared`
clone (`1fcbc24`) and verified to leave the frozen counter clean at an unchanged 202 findings and the sources gate
clean at 126 rows with 0 deletions in every file.

## Disposition table

| # | source | item | severity | stale line(s) | disposition |
|---|---|---|---|---|---|
| D1 | CritNewNumbers | carried-errata arithmetic | medium | `corpus/lessons/round-32.md:98`; `LOG.md:2196` | **land** (two appends; `LOG.md:2107` is *not* corrected — it re-derives) |
| D2 | CritNewNumbers | 195-finding itemization sums to 189 | low | `corpus/lessons/round-32.md:112-116` | **land** |
| D3 | CritNewNumbers | Gate quote lengths 16/18/12 | low | `corpus/lessons/round-32.md:17`, `:18` | **land** (S124 half already recorded at `corpus/lessons/round-32-verifier-spotcheck.md:128`; the append records both halves against the lesson itself) |
| D4 | CritNewNumbers | "claimed 17/22/30" omits two figures | low | `LOG.md:2171-2172` | **land** |
| D5 | CritNewNumbers | S124 `scope` "sixteen … commands and one event" | low | `corpus/SOURCES.md:138` | **land** |
| O1 | CritNewNumbers (observation) | red-green green block promises a REV re-run that the file lacks | — | `measure/c1-distinct-red-green.txt:1` | **closed-already** at `measure/c1-distinct-at-0808688.json` + `measure/provenance-0808688.txt` |
| F1 | RevLesson | M4 receipt chain (`363be55`) unreproducible, no tree digest | minor | `.ufo/waves/round-32/w1/ExecC2Apply/verify.txt:1-4` | **land** (tree digest derived and `mismatches 0` reproduced there) |
| F2 | RevLesson | red-green carries 3 of the 4 v1–v4 constructions | minor | `measure/c1-distinct-red-green.txt` (no v4 leg) | **refuse** — nothing false; the lesson's sentence claims v1/v2/v3 only |
| F3 | RevLesson | S124 gate-row access cell is date-only | nit | `corpus/lessons/round-32.md:17` | **refuse** — no rule requires a time-of-day |
| F4 | RevLesson | M3 evidence pointer "F2" is positional | nit | `corpus/lessons/round-32.md` M3 row | **refuse** — the house label resolves; finding 2 *is* the item |
| F5 | RevLesson | red-green v1 header says "lane transcripts substituted" | nit | `measure/c1-distinct-red-green.txt:56` | **refuse** — raw capture prose; editing it would edit a receipt |

## Evidence per item

Rev = `e6b0a9074d434ccc307badd312ae7379d1193fea`. All reads are `git show REV:<path>` in the scratch clone
(`git -C "$C" rev-parse HEAD` = REV, `git status --porcelain` = 0 lines at start and before each measurement).

### D1 — carried-errata arithmetic (medium): stands, with two corrections to the finding

I parsed `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` by item boundary
(`^- \*\*E<N> —`) and read each item's bolded disposition (`errata-parse.txt`):

```
items 43
Carried n= 27 [4, 6, 7, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27, 28, 30, 31, 32, 33, 35, 37, 38]
Corrected here n= 12     No action n= 4     items with no bold disposition: []
```

That is exactly the identity set CritNewNumbers states (`E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33,
E35, E37, E38`), so the finding's derivation re-derives. Against the round-32 disposition table
(`corpus/lessons/round-32.md:88-96`, rows `E1 … E27`):

- carried items inside `E1–E27`: 19 — in-table rows `E4, E6–E10, E12–E14, E16–E18, E20–E24, E26, E27`;
- carried items outside `E1–E27`: 8 — `E28, E30, E31, E32, E33, E35, E37, E38`, none of which any row names;
- closed by the table: 7 (`E16`, `E23` closed-refused; `E21, E24, E26, E27` landed as recorded limits; `E22` closed);
- therefore 19 of 27 dispositioned and **20 of 27 still carried**, while `corpus/lessons/round-32.md:98` says
  `16 of 27` and names `E1, E3, E5, E19's arm` — four names that are not carried items at all
  (`E1`/`E3`/`E5`/`E19` are `Corrected here`; `E19`'s enforcement arm is the second, lower-case marker on `E19`).

The wave-1 record says the same from the other side, verified at REV: `.ufo/waves/round-32/w1/ScribeErrataA.md:98`
"Queue items **E10–E43** are not dispositioned by me" and `.ufo/waves/round-32/w1/ScribeErrataC.md:118` "Queue items
outside E19–E27 (E1–E18, **E28–E43**) belong to sibling scribes".

**Two corrections to the finding text.** (a) CritNewNumbers lists `LOG.md:2107` among the stale lines; that line
reads "43 wave-1 errata recorded … (27 carried to round 32)" — both figures re-derive, so it is *not* corrected.
The false statement is `LOG.md:2196` ("the 27 carried errata → dispositioned by wave-1 scribes"), which claims all
27 were dispositioned when 19 were. (b) The finding's proposed paragraph closes with "carried at round end is 20 of
27, not 16"; I keep that but state the eight unopened ids explicitly, because a count without the ids is what let
the original line drift.

### D2 — finding itemization (low): stands exactly

`jq` over the committed control (`baseline/c2-J1-do-nothing.json`, rev `5ad1fcbf`): `findings 195`,
`counted 18` = 15 `m1-selftest-tally` + 3 `m4-nudge-state`. Classifying all 195 by the fields the counter emits
(`superseded`, `claimed`, `observed`):

| class | n | superseded | claimed = observed | claimed ≠ observed |
|---|---|---|---|---|
| m1-selftest-tally | 109 | 21 | 46 | 42 (= 15 counted + 24 ambiguous + 3 outside `RUNNABLE_GATE`) |
| m2-receipt-exit | 77 | 0 | **1** (`corpus/evidence/round-23/c1-measurements.json`, 128) | 76 (refused) |
| m4-nudge-state | 9 | 0 | **5** (`SCORECARD.md:1126`, `:1215`, `:1277`, `:1333`, `:1382`) | 4 (3 counted + 1 refused) |

The lesson's itemization (`:112-116`) states `104 refused + 46 matched + 21 cleared + 15 + 3 = 189`; the six it
omits are the one m2 match and the five m4 matches — precisely the entries CritNewNumbers names. Holds.

### D3 — Gate quote lengths (low): stands; S125's unit is the load-bearing error

`word-counts.txt`, counting the lesson's own strings (each verified verbatim inside its row):

```
S124-abstract: whitespace_words=15   S124-4.1: whitespace_words=17
S125-code:     whitespace_words=8    S126-ignore: whitespace_words=12
```

versus the stated `(16 words)`, `(18 words)`, `(12 tokens)`, `(12 words)` at `corpus/lessons/round-32.md:17-19`.
The S124 half is already recorded as a precision note at `corpus/lessons/round-32-verifier-spotcheck.md:128`
("by whitespace split the S124 quotes are 17 and 15 words, not the 18 and 16 stated at lesson `:17`") — a record,
not a landed correction, so the item still lands; the S125 `(12 tokens)` half appears nowhere else (no standard
tokenisation of that line yields 12: whitespace 8, my C/JS tokeniser 20 — the finding's parenthetical says 19; the
difference is my tokeniser's, not load-bearing, and the column's own unit is words).

### D4 — "claimed 17/22/30" (low): stands

Reproduced the freeze reading with the frozen counter (sha256 `77b5c8ed…d4c6a9`) at the control's own rev:

```
$ node scripts/check-selfassessment.mjs --rev 5ad1fcbfbae947e56ed448c7d24af0632b534e80 --json   ; exit=1
$ jq -r '.counted[]|[.class,.doc,(.line|tostring),(.claimed|tostring)]|@tsv' … | sort -k4
SKILL.md:2479 13 | SCORECARD.md:1439 17 | SKILL.md:2515 17 | corpus/README.md:613 17 | SKILL.md:2530 20
SCORECARD.md:1465 22 | SCORECARD.md:1486 22 | SKILL.md:2545 22 | SCORECARD.md:1564 30 | SKILL.md:2576 30
SKILL.md:2578 30 | SKILL.md:2590 30 | SKILL.md:2594 30 | SKILL.md:2598 30 | corpus/README.md:668 30
```

15 lines, observed 41, distinct claimed values **{13, 17, 20, 22, 30}**. `LOG.md:2171-2172`'s `17/22/30` is a
three-way claim the readings do not support. Holds.

### D5 — S124 `scope` cell (low): stands

`transcript-methods.txt`, over both committed round-32 C1 transcripts:

```
run1: sends=28  sends_with_method=28  distinct_methods=15
run2: sends=28  sends_with_method=28  distinct_methods=15
```

Methods (both runs identical): `session.subscribe`, `browsingContext.getTree|setViewport|navigate|captureScreenshot|
locateNodes|traverseHistory|handleUserPrompt`, `script.evaluate`, `input.performActions`,
`network.addDataCollector|addIntercept|continueRequest|getData`, `storage.getCookies`. Received notifications:
`browsingContext.load`, `browsingContext.userPromptOpened`, `network.beforeRequestSent`,
`network.responseCompleted`. Every send frame carries a `method`, so **no event is sent**. `corpus/SOURCES.md:138`
cell 5 reads "the sixteen WebDriver BiDi commands and one event"; the rest of that row already lists all 15 commands
and names `userPromptOpened` as an event the driver observes — so the cell contradicts its own row.

### O1 — the red-green re-run promise: closed-already

`measure/c1-distinct-red-green.txt:1` labels the green block "lane working tree (pre-commit; re-run at the measured
revision in measure/)". At REV the promise is kept by two committed files the round-32 integration added:
`measure/c1-distinct-at-0808688.json` (`rowsMarkedYes 16, distinctRowIds 16, duplicateListings 0, transcripts 2,
distinctTranscriptPaths 2, distinctTranscriptDigests 2, driverSha256 55dbef88…, driverEqualsGate false,
driverReexports false, ok true`) and `measure/provenance-0808688.txt` (`rev=08086884d425b879f020af82fc6e57180e991a3e`,
`porcelain=0`, frozen-counter digests `2f25af5a…`/`77b5c8ed…`, `c1-live exit=0`, `c1-offline exit=0`, `c2 exit=0`).
Nothing to land; the observation should be read as satisfied by those two paths.

### F1 — M4 receipt chain (minor): lands, with the digest derived

```
$ git -C "$C" cat-file -t 363be55bb36cb77e0dce644c807804e1de1aeb40     ; exit=128  (not a valid object)
$ git -C "$C" apply --check corrections.patch   (at 4181fff, porcelain 0) ; exit=0
$ git -C "$C" commit …  →  tree f0d867c3a711f6c7c2176841aff92efef95233d5
$ node scripts/check-selfassessment.mjs --rev HEAD --json                ; exit=0
{"rev":"ea60ceaaefa11e18da16a487c87753d1620dcf42","mismatches":0,"clean":true,"findings":198}
```

`corrections.patch` sha256 `7a61bfa6855d95d188fb77f7869e954cd308ecdd2a10e3fc45832655d7dfd879`, three files. The
original scratch commit id cannot be recorded usefully (it dies with the scratch dir); the **tree** digest can, and
with it the `mismatches 0` reading in `ExecC2Apply/counter-after.json` becomes reproducible from committed bytes.
Full command log: `draft-tree-reconstruction.txt`.

### F2–F5 — refusals

- **F2 (v4 leg).** The red-green file has four blocks (green, v2, v3, v1) and no v4 block — true. But the lesson's
  sentence (`corpus/lessons/round-32.md` M2 fix cell) claims only "red on the v1/v2/v3 forgeries", which is what the
  file shows; and the v4 construction is committed as a gate run,
  `.ufo/waves/round-32/w1/CritC1Forgery/runs/v4-one-run-copied.json` (population 16, admitted 16, clean) with
  `CritC1Forgery.md:51` and `:117` describing it. The rule that would go red exists in code
  (`measure/c1-distinct.mjs:37` builds `distinctTranscriptDigests`, `:40-41` requires it to equal `transcripts`).
  **Refuse**: no document asserts a v4 leg exists, and the finding's own fix ("append a v4 leg at its next touch")
  is an action on a committed receipt, not a correction of a false line. **Flip:** a round whose C1 work re-runs
  `c1-distinct.mjs` appends the v4 leg, or gate v2's case list requires one case per named construction.
- **F3 (S124 access cell).** `corpus/lessons/round-32.md:17` cell 3 reads `2026-10-26 (ScribeSrcBidiSpec; both HTTP
  200, …)` while its neighbours carry `…T16:02:28Z`-style stamps. No rule requires a time: `CORPUS.md:42` binds a
  quote to its location, and the registry's own S124 cell (`corpus/SOURCES.md:138` cell 6) is likewise date-only
  ("fetched 2026-10-26"), with `scripts/check-sources.mjs` validating neither. **Refuse** as cosmetic.
  **Flip:** a criterion or the registry contract adds a UTC-time requirement to access cells, or the Gate table's
  header names a timestamp.
- **F4 (M3 pointer "F2").** `ScribeSrcClassic.md` numbers its findings `1.`–`4.` under `## Findings`, with no `F`
  prefix; but "F2" is the lane's own convention for a finding number elsewhere in the same intake
  (e.g. `errata.md` E6 cites "`[w1/SentinelC1Live.md F1]`"), and position 2 *is* the `webSocketUrl`
  misattribution (`ScribeSrcClassic.md:197`). **Refuse**: the pointer resolves and names the right finding.
  **Flip:** a pointer that resolves to a different finding, or a document that defines an `F`-label scheme it then
  violates.
- **F5 (v1 header).** `measure/c1-distinct-red-green.txt:56`'s header says "lane transcripts substituted for path
  resolution" while that block reports `distinctTranscriptPaths 2, distinctTranscriptDigests 0` — the paths did not
  resolve, so no digest was computed. This is a header line inside a committed measurement capture (criterion 72
  treats such captures as fixed bytes), and the lesson does not repeat the wording. **Refuse**: correcting it means
  editing a capture. **Flip:** a re-capture of that file at a named revision, written with an accurate header.

## Drafted correction texts (append-only, new lines at the document end)

Exact files: `block-round32.md`, `block-log.md`, `block-sources.md` in the output dir. Targets and stale lines:
`corpus/lessons/round-32.md` (after its last line, the round-32 `### Wave-2 precision defects carried` section),
`LOG.md` (document end), `corpus/SOURCES.md` (document end, opened by a new `## Corrections (append-only)` heading so
the correction does not land inside `## Leads (unopened)`).

**`corpus/lessons/round-32.md` end** (covers D1, D2, D3, F1):

```markdown

## Round-33 errata intake — corrections (append-only)

- **Carried-errata arithmetic, `corpus/lessons/round-32.md:98`.** `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`
  holds 43 items: 27 are marked `Carried` (E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33, E35, E37,
  E38), 12 `Corrected here` and 4 `No action`. The disposition table above covers E1–E27 by number and closes seven
  carried items (E16, E21, E22, E23, E24, E26, E27), so the remain-count the table supports is 20 of 27, not 16: the
  12 carried items the line names (E4, E6–E10, E12–E14, E17, E18, E20) plus eight carried items no disposition
  reaches (E28, E30, E31, E32, E33, E35, E37, E38). The line's other four names (E1, E3, E5, E19's `passed=` arm) are
  not carried items.
- **Finding itemization, `corpus/lessons/round-32.md:112-116`.** The freeze reading carries 195 findings: 109 m1,
  77 m2, 9 m4. The paragraph classifies 189 of them (104 refused, 46 m1 matched, 21 m1 cleared, 15 m1 and 3 m4
  counted); the six it omits are matches it does not classify — one m2 command
  (`corpus/evidence/round-23/c1-measurements.json`, claimed = observed = 128) and five m4 round groups whose stated
  `inactive` re-derives (`SCORECARD.md:1126`, `:1215`, `:1277`, `:1333`, `:1382`).
- **Gate quote lengths, `corpus/lessons/round-32.md:17` and `:18`.** By whitespace split the S124 Abstract quote is
  15 words and its §4.1 quote 17, not 16 and 18; the S125 `caps.Set(…)` quote at `:18` is 8 words, and the stated
  "12 tokens" matches no tokenisation of that line (the column's own unit is words). The S126 quote at `:19`
  re-counts to 12 words as stated. `corpus/lessons/round-32-verifier-spotcheck.md:128` records the S124 half.
- **Draft-tree provenance for M4's receipt, `.ufo/waves/round-32/w1/ExecC2Apply/counter-after.json`.** The rev that
  receipt and `verify.txt` name (363be55) does not exist in the lane repo, and no tree digest was recorded. The draft
  is reproducible from committed bytes: applying `ExecC2Apply/corrections.patch` (sha256
  `7a61bfa6855d95d188fb77f7869e954cd308ecdd2a10e3fc45832655d7dfd879`, three files) to the freeze 4181fff yields
  tree `f0d867c3a711f6c7c2176841aff92efef95233d5`, and the frozen counter at that tree reads mismatches 0, clean,
  198 findings — the reading the receipt records.
```

**`LOG.md` end** (covers D1's LOG half and D4):

```markdown

Round-33 errata intake (append-only; the round-32 lesson carries the same corrections in its own block).
Correction to `LOG.md:2171-2172`: the fifteen stale self-assessment tallies there claim 13, 17, 20, 22 and 30 against
the observed 41 — five distinct figures, not the three ("17/22/30") that line states. Correction to `LOG.md:2196`:
43 wave-1 errata were recorded and 27 carried, but the wave-1 scribes dispositioned 19 of the 27 carried items; eight
(E28, E30, E31, E32, E33, E35, E37, E38) received none, and the round-32 lesson's supported remain-count is 20 of 27.
`LOG.md:2107`'s "43 … (27 carried to round 32)" re-derives and is not corrected.
```

**`corpus/SOURCES.md` end** (covers D5):

```markdown

## Corrections (append-only)

- **Round-33 correction to `corpus/SOURCES.md:138` (S124 `scope`).** The round-32 C1 driver sends 15 distinct BiDi
  commands over 28 send frames per transcript — `session.subscribe`, `browsingContext.getTree`, `.setViewport`,
  `.navigate`, `.captureScreenshot`, `.locateNodes`, `.traverseHistory`, `.handleUserPrompt`, `script.evaluate`,
  `input.performActions`, `network.addDataCollector`, `.addIntercept`, `.continueRequest`, `.getData`,
  `storage.getCookies` — and sends no event: all 28 send frames carry a `method`. The events the transcripts show
  (`browsingContext.load`, `.userPromptOpened`, `network.beforeRequestSent`, `network.responseCompleted`) appear only
  as `session.subscribe` names and as received notifications, so the cell's "sixteen … commands and one event" does
  not re-derive. Evidence: `.ufo/waves/round-32/w1/ExecDriver/bidi/run1/transcript.jsonl` and `run2`.
```

Design notes for the integrator: none of the three blocks names a `scripts/*.mjs` path (so no m1 tally can attach to
it), none contains a `SCORECARD.md:` range together with the phrase `nudge active` (so the m4 self-supersession lane
stays shut), and none contains a backticked re-runnable command (so the m2 grammar sees nothing). The measured proof
is below.

## Verification of the drafts (scratch clone only)

```
$ git -C "$C" diff --numstat e6b0a90 HEAD
7	0	LOG.md
11	0	corpus/SOURCES.md
25	0	corpus/lessons/round-32.md          # insertions only, 0 deletions
$ node scripts/check-selfassessment.mjs --rev HEAD --json ; exit=0
{"rev":"1fcbc2475ee6b6f6266cccdd21ae549f5dc3995d","mismatches":0,"clean":true,"findings":202}
$ node scripts/check-sources.mjs ; exit=0
SOURCES_GATE verdict=clean rows=126 tiers=A:111,B:6,C:9 status=queued:15,mined:102,rejected:9 findings=0 file=corpus/SOURCES.md
```

Baseline at `e6b0a90` without the appends: `mismatches 0, clean, findings 202`; with the appends: identical
(`appends-inertness.txt`, `appends-c2.json`, `appends-sources.out`). The appends neither create nor clear a finding.

## Commands and exit codes

| # | command (in the scratch clone unless noted) | exit | reading |
|---|---|---|---|
| 1 | `git clone --shared … && git checkout -q --detach e6b0a90…` | 0 | HEAD = `e6b0a907…`; `rev-parse --show-toplevel` = the scratch clone; `status --porcelain` 0 lines |
| 2 | `git show REV:corpus/lessons/round-32.md \| sed -n '96,99p'` etc. | 0 | stale lines read at their round-33 numbers (`:98`, `:112-116`, `:17`, `:19`) |
| 3 | errata parse (`python3`, item boundary + bold marker) | 0 | 43 items; 27 Carried / 12 Corrected here / 4 No action; id set as stated |
| 4 | `jq` over `baseline/c2-J1-do-nothing.json` | 0 | findings 195; counted 18 = 15 m1 + 3 m4 |
| 5 | `python3` classification of all 195 findings | 0 | m1 21/46/42, m2 76/1, m4 3/5/1 — the six omitted items exactly |
| 6 | `node scripts/check-selfassessment.mjs --rev 5ad1fcbf… --json` | **1** | 18 counted, claimed {13,17,20,22,30}, observed 41 |
| 7 | `node scripts/check-selfassessment.mjs --rev e6b0a90… --json` | 0 | mismatches 0, clean, findings 202 |
| 8 | `python3` word/token counts of the four quotes | 0 | 15 / 17 / 8 / 12 words |
| 9 | `jq` over both `ExecDriver/bidi/run*/transcript.jsonl` | 0 | 28 sends, 28 with method, 15 distinct methods, 0 sent events |
| 10 | `git cat-file -t 363be55…` | **128** | `fatal: git cat-file: could not get object info` |
| 11 | `git apply --check` + `apply` of `corrections.patch` at `4181fff` | 0 | 3 files modified; tree `f0d867c3…` |
| 12 | `node scripts/check-selfassessment.mjs --rev HEAD --json` at the draft tree | 0 | mismatches 0, clean, findings 198 |
| 13 | appends commit `1fcbc24`; `check-selfassessment` / `check-sources` | 0 / 0 | 202 findings unchanged / `SOURCES_GATE verdict=clean rows=126 … findings=0` |
| 14 | `git diff --numstat e6b0a90 HEAD` | 0 | 7/0, 11/0, 25/0 — append-only |

## Conflicts reported verbatim for the judge

1. CritNewNumbers, D1 header: "`corpus/lessons/round-32.md:98`, `LOG.md:2107`, `LOG.md:2196`" — against
   `LOG.md:2107`: "43 wave-1 errata recorded in `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` (27 carried to
   round 32)". Both figures re-derive; the correction is scoped to `:2196` only.
2. CritNewNumbers, D3: "S125: 9 alphanumeric runs, 19 C/JS tokens" — my tokeniser counts 20 tokens. Immaterial: the
   column's unit is words and the whitespace count is 8 either way.
3. RevLesson, M5 section: "under a 77-byte TMPDIR" vs CritNewNumbers, holds list: "the 70-byte path". No conflict in
   the receipt — `measure/c1-socket-path-red-green.txt:1` states `(70 bytes)`; 77 bytes was RevLesson's own
   reproduction directory.
4. RevLesson, F2: the "fourth construction … has no committed leg" — true of `c1-distinct-red-green.txt` only;
   `CritC1Forgery/runs/v4-one-run-copied.json` is a committed v4 gate run (admitted 16, clean).

## Touched surfaces, hygiene, bounds

- Wrote: this report, `.ufo/waves/round-33/w1/ScribeErrataA/` (16 receipt files), scratch
  `/fast/scratch/hyaku/tabi-r33/ScribeErrataA` (deleted before yield). No lane tracked file, lane git index, jj
  state, fleet repo, sibling lane or `shokuknow` was written; the lane checkout saw no write and no git transaction
  (the clone was `--shared`, which reads the object store).
- Commits: two, both inside the scratch clone — `ea60cea` (draft reconstruction at `4181fff`) and `1fcbc24`
  (candidate appends), each made with `-c user.name=ScribeErrataA -c user.email=ScribeErrataA@scratch.local`, each
  after `git -C "$C" rev-parse --show-toplevel` confirmed the scratch path. Both die with the scratch dir; the
  content-addressed tree `f0d867c3…` is recorded so the measurement survives.
- Browser: none started. `pgrep -fa 'chromedriver|chromium'` shows one line, `/usr/bin/earlyoom -r 3600 …` (not
  mine); no chromedriver, no chromium, no loopback server. Network fetches: none this seat — every number was
  re-derived from committed bytes.
- Tooling: nothing installed or upgraded (no `pacman`, no `uv tool`, no binary added).
- Out of scope / not done: I did not land the appends in the lane (L1 integration owns that), did not re-run
  `check-bidi-runtime.mjs` or any control, and did not disposition the other wave-2 reports named in routed defect 5
  (`CritEntry` 10, `CritReadmeLog`, `ConnRoutedLedger` 19) — those belong to the sibling intake seats.
- Known limits: the reconstructed draft tree is *my* reconstruction from the committed patch, not the original
  `363be55` tree; it reproduces the receipt's `mismatches 0` but I cannot prove the original scratch tree was
  byte-identical, only that this tree is what the committed patch yields at the frozen counter. The 198-finding
  reading at the draft tree is stated because it was measured; the 195-finding figure belongs to the freeze.

## Deliverable paths

- Report: `.ufo/waves/round-33/w1/ScribeErrataA.md`
- `errata-A` deliverables (exact texts + receipts): `.ufo/waves/round-33/w1/ScribeErrataA/`
  - `block-round32.md`, `block-log.md`, `block-sources.md` — the drafted append-only correction texts
  - `errata-parse.txt`, `word-counts.txt`, `transcript-methods.txt`, `counted-at-freeze.tsv` — the re-derivations
  - `draft-tree-reconstruction.txt`, `draft-tree-c2.json`, `corrections.patch` — the M4 chain
  - `appends-inertness.txt`, `appends-c2.json`, `appends-sources.out` — the drafted-text measurement
  - `c2-at-freeze-5ad1fcbf.json`, `c2-at-e6b0a90.json`, `c2-J1-do-nothing.json` — the counter readings
