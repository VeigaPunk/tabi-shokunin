## Mistakes

Mined from the last three closures (r26 `rejected-honest-stop`, r27 `rejected-harmed`,
r28 `rejected-honest-stop`): `shokunin@a7c6d0f1828099828a6ca0e01c2f6eb2b3f8c59c:MANIFEST.json:22967`,
`:23280`, `:23439`; `corpus/lessons/round-26-verifier-spotcheck.md`,
`round-27-verifier-spotcheck.md`, `round-28-verifier-spotcheck.md`, `round-28.md`.

One row per mistake, in the `CORPUS.md` §5 vocabulary
(`shokunin@a7c6d0f1:CORPUS.md:174-176`): class · evidence · captured-by · fix ·
able-to-fail. "Able to fail" names the stored red state in
`.ufo/waves/round-29/baseline/` (or the committed receipt) that the fix's assertion
must turn on; a fix with no reachable red state is not counted. `captured-by: none`
rows carry a drafted criterion in the section after the table.

| # | Class | Mistake (one line) | Captured by |
|---|---|---|---|
| M1 | `landing` (secondary `vacuous`) | Round 28 landed two revision controls around a `ReferenceError` and ran neither the self-test nor any recorded invocation of the changed gate | none — nearest 37 (`corpus/QUALITY.md:154`) does not reach an unclaimed instrument; drafted as P-71 |
| M2 | `reference-drift` | Round 28 quoted census output that the same command never produces, and the round's own count in that block was right | none — nearest 26 (`corpus/QUALITY.md:102`) binds a run claim to a receipt, not the quote's bytes; 61 (`corpus/QUALITY.md:309`) covers the figure, which was correct; drafted as P-72 |
| M3 | `vacuous` (secondary `attribution`) | The r27 self-assessment counter cleared `LOG.md:221` on an unbound citation, so a stale tally read clean | 65 (`corpus/QUALITY.md:343`), reinforced by 70 (`corpus/QUALITY.md:381`) — the implementation was thinner than 65's text and no cross-document red case existed until r29 |

```text
# the pointers above, as committed bytes (checked this seat, read-only)
corpus/QUALITY.md:10  = criterion 6      corpus/QUALITY.md:309 = criterion 61
corpus/QUALITY.md:102 = criterion 26     corpus/QUALITY.md:343 = criterion 65
corpus/QUALITY.md:112 = criterion 28     corpus/QUALITY.md:374 = criterion 69
corpus/QUALITY.md:143 = criterion 34     corpus/QUALITY.md:381 = criterion 70
corpus/QUALITY.md:154 = criterion 37     (file ends at criterion 70, line 384)
```

### M1 — a self-test that cannot be invoked was landed, and nothing recorded its absence

- **Class:** `landing` (C09, evidence landing), secondary `vacuous` (C04): the two added
  controls are inert as landed, because no run ever reached them.
- **Evidence:** at the round-29 baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`,
  `node scripts/check-s106-evidence.mjs --selftest` exits 1 with
  `ReferenceError: existsSync is not defined` at `scripts/check-s106-evidence.mjs:267`
  and prints no `S106_SELFTEST` tally
  (`.ufo/waves/round-29/baseline/s106-selftest.txt`). The cause is in the same file:
  `existsSync` is used at `:267` and absent from the `node:fs` import at `:37`
  (`git show 856fa9e:scripts/check-s106-evidence.mjs | grep -n existsSync` → one hit,
  `:267`). The defect entered with the round-28 edit
  `b4128c420009a9736c8a64f75ccc02fc94c68502`: its diff adds
  `+        if (existsSync(receiptPath)) {` inside the fixture and no import line
  (`git diff eb23c0b b4128c4 -- scripts/check-s106-evidence.mjs`); the script bytes at
  `856fa9e` are identical to `b4128c4` (`git diff --stat b4128c4 856fa9e -- scripts/check-s106-evidence.mjs`
  empty). That the round never ran it is stated in three places: `corpus/lessons/round-28.md:19`
  ("Post-edit self-test was not run, so effectiveness is not verified"), the registry row
  `SKILL.md:2529` ("7 cases in CASES (not run at round-28 tip)"), and
  `corpus/lessons/round-28-verifier-spotcheck.md:26`. The closure's own static read found the
  other two control defects and missed this one — it names the field inversion at runner `:301`
  and the never-committed receipt (`round-28-verifier-spotcheck.md:28-29`) and never mentions
  `existsSync` (`grep -c existsSync` on that file → 0). Execution, not reading, was the only
  detector.
- **Captured by:** `none`. Criterion 37 (`corpus/QUALITY.md:154`) requires a *self-test claim*
  to cite a committed receipt; round 28 made no self-test claim and avoided the criterion by
  declaring the instrument unrun. Criterion 6 (`:10`) requires a self-test to assert each
  refusal's expected exit/finding pair but does not require the self-test to run. Criterion 27
  (`:107`) requires a probe to be described by the shapes it defeats — "added" is not "defeats".
  Criterion 69 (`:374`) requires paired controls and a full resolved revision, not an execution
  record. Nothing in the bar yet says a changed instrument must execute at the commit that lands
  it. Drafted: **P-71**.
- **Fix (landed):** `59e8167aa5a4399e4115e7253fa0bab5e8dd773d`. In
  `scripts/check-s106-evidence.mjs` at that commit: `existsSync` joins the `node:fs` import
  (`:38`); each case may declare `fieldValue` and the runner compares against it
  (`:311`, `ok = ok && out[c.field] === c.fieldValue`) instead of the r28 inversion; and the
  mismatch fixture writes its receipt and then commits (`:203`, a trailing `d.commit()` after
  the case's `build`, `:193`), so the evaluated HEAD carries a receipt whose `measured_rev`
  points at the earlier bytes rather than no receipt at all. The after-arms are committed
  evidence: `corpus/evidence/round-29/s106-selftest/selftest-l1.txt`
  (`S106_SELFTEST verdict=clean cases=7 passed=7`, `exit=0`) and
  `corpus/evidence/round-29/s106-selftest/mutation.txt` /
  `mutation.diff` (revision comparison removed → `measured-revision-bytes-mismatch` FAIL,
  `verdict=failed cases=7 passed=6`, `exit=3`).
- **Able to fail:**
  1. Pre-fix red, same command: `.ufo/waves/round-29/baseline/s106-selftest.txt` — exit 1 for the
     named reason, no tally. This is the state C1's `killRule` reads.
  2. The cheapest partial fix cannot pass: `.ufo/waves/round-29/baseline/c1-control-case-deletion.txt`
     is the control copy with the import added and both revision cases deleted →
     `S106_SELFTEST verdict=clean cases=5 passed=5`, `exit=0`; the target (`N >= 7`, both case
     ids present) still fails, so green selftest output alone is not the claim.
     `.ufo/waves/round-29/baseline/c1-control-case-deletion.diff` records the delta (it also
     repoints `LANE` at `/fast/scratch/hyaku/tabi-r29/L1-measure/base`, which is why it is a
     control artefact and not a proposed patch).
  3. Post-fix red: the committed mutant in `corpus/evidence/round-29/s106-selftest/mutation.txt`
     turns the mismatch case red while the other six stay green, and the seat's inverse mutant
     (revision comparison forced false) turns the positive cases red
     (`.ufo/waves/round-29/w1/build/c1/positive-control-nonvacuous.txt`, seat output, uncommitted
     at draft time) — so neither the positive nor the negative case passes by construction.
- **Untested shapes:** the mutant covers only the revision comparison. The field-assertion
  repair is exercised by case exits, not by its own mutant; a receipt that is present but whose
  `bytes_path` names a different file is covered by `path-not-bound`-style cases in the sibling
  C3 counter, not here.

### M2 — census output was quoted as prose, so the quote and the command disagreed

- **Class:** `reference-drift` (C01). Deliberately not `number-drift` (C02): the counts in the
  quoted block were right (16 W04 warnings, same row id, same as the re-run); the drift is in a
  URL token.
- **Evidence:** the round-28 report's census block prints
  `tabi\tW04\tS068 duplicate url github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts across scopes`
  at `shokunin@a7c6d0f1:.ufo/reports/round-28/tabi.md:37` (repeated at `:58`). The same command
  at the same revision prints `.../front_end/panels/application/WebMCPView.ts` — in the closure
  re-run (`corpus/lessons/round-28-verifier-spotcheck.md:16`, defect b) and in this round's
  baseline capture (`.ufo/waves/round-29/baseline/census-start.txt:4`, `exit=0`, lines 1-16 plus
  `tabi\tok\t...`). The registry row agrees with the capture, not with the report:
  `corpus/SOURCES.md:82` carries the URL `.../panels/application/WebMCPView.ts` with anchor
  `View:942-952; Model:249-257`. Measured pair, this seat, read-only:
  `sha256(report:37) = 03602872ac94b723487ce0989390f0308beae7aa27e00d69262d28ac14c7a434`,
  `sha256(capture:4) = 4e778de488344a994a50b761dd6c77a24587b6dc305c13647553a9141538fe7b`,
  `equal? False`. Recorded as a closure defect at `shokunin@a7c6d0f1:MANIFEST.json:23439`
  ("census After block S068 URL not byte-reproducible") and routed as round-28 spot-check
  defect 5.
- **Captured by:** `none`. Criterion 26 (`corpus/QUALITY.md:102`) binds a run claim — count,
  verdict or exit "at REV" — to a committed receipt, but a quoted block can carry all of that and
  still misquote the payload. Criterion 61 (`:309`) requires a round-evidence figure to be derived
  from receipts; the figure here was derived correctly. Criterion 28 (`:112`) asks a pointer to
  resolve as committed bytes, and the report's own bytes resolve fine. Criterion 34 (`:143`)
  asks a prose count to carry its counting command; the command was there and correct. Nothing
  compares the quoted payload with a re-capture. Drafted: **P-72**.
- **Fix (prescribed, not yet a built check):** a census block in a report, lesson or SCORECARD
  row becomes a pointer to a committed capture: produce it by redirect at the named revision,
  commit the capture, cite its path and sha256, and re-capture with the same command at that
  revision and compare byte-for-byte. This round's own census legs already use the capture form
  (`.ufo/waves/round-29/baseline/census-start.txt`, tab bytes intact — `cat -A` shows `^I`
  separators), so what remains is the comparison, not the artefact.
- **Able to fail:** the red state is stored and needs no new execution — the pair above differs
  on one path token, so a byte-compare of the two stored lines fails today. The neighbouring
  shape is already refused one layer over: `.ufo/waves/round-29/baseline/c3-selftest-frozen.txt`
  `CASE id=copied-old-as-new-caught-by-refetch ... expected_unresolved=1 unresolved=1 PASS`
  (copied bytes offered as re-fetched bytes are not accepted) and
  `CASE id=sha-mismatch-unresolved ... unresolved=1`.
- **Untested shapes:** the pair covers a drifted payload token in one row. Not covered: a quote
  that is correct in this round and drifts in a later one (needs a cadence), and any quote whose
  capture was never committed (unverifiable by construction, which is the point of P-72).

### M3 — a counter cleared a stale tally on a citation that named the wrong document

- **Class:** `vacuous` (C04 — verification that cannot distinguish), secondary `attribution`
  (C10 — the correction was attributed to a line that the cited text does not name).
- **Evidence:** round 27's C1 ran
  `node scripts/check-selfassessment.mjs --rev ef8aa4a3… --json` and got `mismatches=0`,
  `clean=true`, `superseded=10` while the same run's own finding at `LOG.md:221` read claimed 8,
  observed 12, `superseded=true` — a clear produced by a citation that does not name line 221
  (`corpus/lessons/round-27-verifier-spotcheck.md:15`; closure record
  `shokunin@a7c6d0f1:MANIFEST.json:23280`, "C1 false clear"). Round 28 replaced "any `:<digits>`"
  with line/range parsing and recorded the mechanism itself (`corpus/lessons/round-28.md:19`), but
  its matcher still accepted either document name, so `SCORECARD.md:221` cleared `LOG.md:221`
  (`corpus/lessons/round-28-verifier-spotcheck.md:39`). The recurrence is measurable at this
  round's baseline: the frozen doc-bound counter reports `mismatches=6`, `clean=false` with
  `LOG.md:221 claimed=8 observed=12`
  (`.ufo/waves/round-29/baseline/c2-before-frozen-counter-cleanbase.json.txt`), and the
  gameability is shown end-to-end by the two junk controls on one scratch tree —
  `baseline/c2-control-crossdoc-oldcounter.json` `mismatches=0 clean=true` versus
  `baseline/c2-control-crossdoc-frozencounter.json` `mismatches=6 clean=false superseded=5`.
- **Captured by:** 65 (`corpus/QUALITY.md:343`). Its text already required a supersession to
  "cite the superseded mention" and required the counter to report superseded mentions rather
  than drop them; round 27 satisfied that text in form while its implementation accepted any
  digits, and no red case tested a citation naming another document. Criterion 70 (`:381`),
  written in round 28 from its own M2, states the binding explicitly ("names the target document
  and line") and demands an unrelated-line red case, a timestamp red case and an exact-line
  positive case — the missing fourth case, cross-document, is the one this round adds. The gap
  is therefore in enforcement, not in the bar's wording: 65 was satisfied by a counter thinner
  than its text, and only a case can tell those apart.
- **Fix (landed):** the counter is frozen at
  `sha256 728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4`
  (`.ufo/waves/round-29/baseline/frozen-counter-sha256.txt`) and its `citesLine` binds the
  stale finding's own document plus a line or range containing it; the corrections are
  append-only and each names its stale line in that line's own document —
  `SCORECARD.md:1458` (block header; rows at `:1463` for `SCORECARD.md:410`, and the
  `:1138-1139`/`:1151`/`:1439`/`:1438` rows below it) and `LOG.md:2007`
  ("Correction (supersedes LOG.md:221)"). The stale lines themselves are untouched.
- **Able to fail:** the same two cases, one matcher apart — pre-fix
  `.ufo/waves/round-29/baseline/c2-red-before-selftest.txt` shows
  `m1-scorecard-crossdoc-citation-not-superseded expected_exit=1 exit=0 ... FAIL` and
  `m1-log-crossdoc-citation-not-superseded expected_exit=1 exit=0 ... FAIL`, verdict
  `SELFASSESSMENT_SELFTEST verdict=failed cases=22 passed=20`; post-fix
  `baseline/c2-after-fix-selftest.txt` shows both PASS and `verdict=clean cases=22 passed=22`.
  The end-to-end arm is the junk pair quoted above (0 mismatches under the old matcher, 6 under
  the frozen one), and the intended-target arm is the baseline's own 6 mismatches, i.e. the
  frozen counter still reports the stale tallies rather than clearing them.
- **Untested shapes:** the cases cover `LOG.md`/`SCORECARD.md` in both directions. Not covered:
  a third document that later carries a tally, a citation to a line range that merely *contains*
  a neighbouring stale line (range semantics with two interchangeable names), and a correction
  marker inside a fenced block.

### Proposed criteria (for the rows with `captured-by: none`)

Numbering: `corpus/QUALITY.md` ends at criterion 70 (`:381`); these are drafted as 71 and 72 and
the integrator owns the final numbering.

**71 — a changed instrument must execute where it lands.**
A gate, counter or self-test whose bytes a round changes is executed at the commit that lands the
change, and the round records that run (argv, revision, exit and tally) together with one mutant
that turns a named case red. A landed instrument that cannot be invoked, or whose added case no
recorded run exercises, is a `landing` finding even when the round makes no claim about it:
"the control was added" is not evidence that the control works, and a declared-unrun instrument
does not silence the finding. (lesson: `corpus/lessons/round-29.md#mistakes` M1; round 28 landed
two revision controls around `ReferenceError: existsSync is not defined` at
`scripts/check-s106-evidence.mjs:267` and recorded no run, while its closure's static read found
the other two control defects — `round-28-verifier-spotcheck.md:28-29` — and not this one.)
Able to fail: the mutant arm is already required by C1 and committed at
`corpus/evidence/round-29/s106-selftest/mutation.txt` (mismatch case red, exit 3); the
pre-fix arm is `baseline/s106-selftest.txt` (exit 1, no tally).

**72 — quoted command output is a pointer to committed bytes, never a transcription.**
Command output quoted in a report, lesson or SCORECARD row is produced by redirect into a
committed capture at the named revision; the prose cites the capture path and digest; a
re-capture by the same command at that revision is compared byte-for-byte, and a difference is a
`reference-drift` finding even when every count in the block is correct. (lesson:
`corpus/lessons/round-29.md#mistakes` M2; round 28's census block printed
`…/front_end/models/web_mcp/WebMCPModel.ts` where the same command printed
`…/panels/application/WebMCPView.ts`, with the identical 16-warning count.)
Able to fail: the stored pair `shokunin@a7c6d0f1:.ufo/reports/round-28/tabi.md:37` versus
`baseline/census-start.txt:4` differs and its line hashes differ
(`03602872…` versus `4e778de4…`); the criterion is admitted only once a check diffs such a pair,
and the shape at the next layer down is already refused by
`baseline/c3-selftest-frozen.txt` (`copied-old-as-new-caught-by-refetch` → `unresolved=1`).

### Scope note

These rows cover the three routed defects the round was assigned. Round 28's wave-accounting
defect (`corpus/lessons/round-28-verifier-spotcheck.md:16`, defect a: 62 report files for 64
results, one seat's output left as unfinished reasoning) is not mined here; it belongs to the
gate section for the seat-accounting rule, and keeping it out avoids a fourth row this seat has
no r29 red state for.
