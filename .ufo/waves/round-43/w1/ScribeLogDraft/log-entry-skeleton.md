# Round 43 — integration LOG entry skeleton (ScribeLogDraft)

**Status: SKELETON — nothing in it is a verdict.** Every `[TBD: …]` marker is a fill-in the
L1 completes *after* WAVE-DONE, from observed command output and committed bytes only.
Lines marked **⟨FROZEN⟩** are copied verbatim from the round-43 freeze
(`.ufo/waves/round-43/claims.json`, committed at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`,
baseline `ab592825cd195599822ca227f7768914df208201`) and must not be reworded, shortened or
amended. The round-42 closure conformance defect 1 (a freeze that enumerated five baseline
finding ids while the committed control carried seven) is what the ⟨FROZEN⟩ discipline exists
to prevent.

**Append target:** the end of `LOG.md`. The round-43 dispatch entry currently closes the file at
`LOG.md:2747-2799`; the integration entry is a new `## Round 43 — …` section appended after it.
The matching disposition block goes to `SCORECARD.md` after
`## Round 43 — declared claims (frozen before data)` (`SCORECARD.md:2297-2321`), mirroring the
round-42 shape (`SCORECARD.md:2244-2296`).

**Fill rules (binding on the L1):**

1. **No claim verdict by assertion.** A disposition is written only against an observed
   command and its output (measure receipt, counter exit code, checker JSON), cited by path.
   An unrun check has not passed.
2. **No post-data amendment** of the predicate, kill rule, counting command, counter, checker,
   fixture or control bytes. A hole a seat finds is a *finding routed to round 44*, never an
   edit to a frozen instrument.
3. **Dead seats are recorded, never replaced.** Name each dead seat with its status; do not
   infer a verdict for it and do not substitute a rerun for it.
4. **Numerics.** `coverage` holds 9 → 9 unless C1 is admitted; `calibration` holds 9 → 9 (C2's
   admission clause allows no numeric change without a later score rubric). Adjacency stays the
   lowest axis at 8; the stagnation nudge (no capability entered rounds 39-42, window 3) is
   discharged only by an admitted C1 capability row.
5. **No tool install is implied by this skeleton.** If the L1 installs anything, record
   tool / version / channel / reason here; pacman transactions remain paused host-wide.

---

## Round 43 — wave-1 integration and [TBD: disposition headline] — [TBD: 2026-10-29]

WAVE-DONE received from [TBD: the orchestrator — inline dispatcher or manual fill loop; note
any stall and the kama r61 precedent if it recurred]. **[TBD: n]/64 seats settled with nonempty
reports and VERDICT lines; [TBD: d] dead seats recorded (none replaced); role mix exact:
[TBD: role: count, …]; attack share (reviewer + critic + mutation-tester) [TBD: n]/64 =
[TBD: n.n%] against the round floor of ≥25%. L1 held the canonical planner seat. Results:
`.ufo/waves/round-43/w1-results.json`; parse summary
`.ufo/waves/round-43/w1-parse-summary.json`; per-seat reports
`.ufo/waves/round-43/w1/<Seat>/report.md`.** Verdict kinds: [TBD: x ok / y finding /
z could-not-evaluate]. Round total: 64 seats, one policy-v2 wave, no residual call.

**Fill sources for this paragraph**

- **Results file.** `.ufo/waves/round-43/w1-results.json` is written by the orchestrator at
  WAVE-DONE; entries carry `name`, `agent` (role), `status`, and `output` or a `note`. Round-42
  entries showed `output: null` with a note pointing at the seat report file — so the results
  file is an index, and the *report files* are the truth. Read every seat report; do not read a
  verdict out of the results file alone.
- **Parse summary.** Round 43 has **no committed parser** (round 42's is at
  `.ufo/waves/round-42/parse-w1-results.mjs`). Copy it to scratch and point it at the round-43
  results path; it takes the path as `argv[2]` and is read-only:
  `node <scratch-copy> /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1-results.json`.
  **Schema caveat (observed, not a claim):** the committed round-42 script prints
  `{total, roles, dead, emptyOutput, noVerdictLine, verdicts[]}`, while the committed round-42
  `w1-parse-summary.json` on disk has the older shape `{total, reports, roles, noReport,
  noVerdict, verdicts{ok:<n>,finding:<n>}}`. The round-43 summary must state which shape it
  uses; if the L1 writes the older shape (comparable with round 42), say so in the entry and
  keep the parser's own output as the receipt.
- **Seat tallies.** A seat counts as *settled* only if `.ufo/waves/round-43/w1/<Seat>/report.md`
  exists, is nonempty, and ends in a `VERDICT ok|finding|could-not-evaluate` line. Dead seats
  (no report, or a report without a VERDICT line) are listed by name.
- **Expected shape of the wave** (from `.ufo/waves/round-43/w1-spec.json`, 64 items — the
  expected-vs-observed diff is itself a receipt): critic 16, executor 16, mutation-tester 8,
  reviewer 6, scout 5, scribe 5, connector 4, sentinel 2, simplifier 1, revenger 1; attack
  share 30/64 = 46.9%. The 64 seat names are listed in Appendix A.
- **Roles not in the round-42 mix:** round 43 adds `revenger` and `simplifier` (1 each) and
  raises `critic` to 16 — report the mix exactly, not by analogy with round 42.

### Claim dispositions

**C1 (coverage capability) — [TBD: ADMITTED / NOT ADMITTED — kill rule fired].**

- Frozen counting command (⟨FROZEN⟩, `claims[0].countingCommand`):
  `node scripts/measure-c1-round43.mjs --out corpus/evidence/round43/playwright-egress/receipt.json --measure-out .ufo/waves/round-43/measure/c1-measure-r43.json --scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run`
- Frozen kill rule (⟨FROZEN⟩, `claims[0].killRule`): *If any settled seat demonstrates an
  in-model do-nothing reach, or any control refuses, or the receipt/measure bytes are not
  committed at the measured revision, the claim is not admitted: no capability row enters the
  SCORECARD table, coverage holds its score, and the finding is routed to round 44. The
  predicate, kill rule and counting command are frozen before any seat scores; they are never
  amended after wave data.*
- Frozen admission (⟨FROZEN⟩, `claims[0].admission`): *On pass only: one capabilities-table row
  `playwright-firefox-loopback-tcp - observe a loopback browser session's TCP sockets from both
  ss and /proc/net/tcp under a signature-authenticated chain (per-invocation Ed25519 run key,
  witness-attested, challenge-bound receipt)` whose evidence pointer names the committed
  round-43 receipt and measure record, first-working round 43.*
- Fill from the observed run, not from the dispatch entry's pre-freeze summary: exit code,
  counter `predicate` value, `findings` array (must be empty for a pass), the two run spans,
  the fresh 64-hex nonce, the receipt and witness sha256s, the measure-record sha256, the
  measured revision, and the two committed evidence paths
  (`corpus/evidence/round43/playwright-egress/receipt.json`,
  `.ufo/waves/round-43/measure/c1-measure-r43.json`).
- **The kill rule has three independent limbs.** The L1 must state the observed outcome of
  each: (i) any settled seat demonstrating an in-model do-nothing reach → not admitted;
  (ii) any control refusing → not admitted (all eight controls are bound by sha256 + verbatim
  quote in the freeze and were re-derived green at seat time — see
  `w1/ScribeLogDraft/evidence/frozen-digest-verification.txt`; the L1 re-runs the battery,
  replay, synthetic and tamper refusals before asserting they still refuse);
  (iii) receipt/measure bytes not committed at the measured revision → not admitted.
- **The claim sentence is longer than the counter sentence.** `claims[0].predicate` is
  `claims[0].counterPredicate` (byte-identical to the counter's `PREDICATE-SENTENCE` header
  its `const PREDICATE` literal — re-derived at HEAD, 0 mismatches, see
  `w1/ScribeLogDraft/evidence/sentence-identity-check.txt`) **plus** a 669-byte suffix that
  the freeze marks ` THE CLAIM:`. That suffix adds six claim-level conjuncts the counter does
  not itself check, and the L1 must state the observed outcome of each, separately from the
  counter's exit code:

  | Claim-level clause (⟨FROZEN⟩ suffix of `claims[0].predicate`) | Evidenced by |
  |---|---|
  | the counting command exits 0 on a fresh nonce | the measure run's exit code + the receipt's nonce |
  | the produced `receipt.json`, `receipt.witness.json` and signed measure record are committed at the measured revision | `git ls-tree` at `<REV>` (Appendix C row 8) |
  | `node scripts/measure-c1-round43.mjs --battery` reports all cases pass (contamination vectors exit 2 with `environment-loader-contamination`, clean probe exit 0) | the battery run (Appendix C row 3) |
  | direct counter-v5 invocations refuse the committed r42 receipt and self-authored synthetic pairs | the replay and synthetic controls (Appendix C row 3) |
  | the round's validated policy-v2 wave settled with WAVE-DONE over at least 64 seats | the wave accounting paragraph above |
  | no settled seat demonstrates an in-model do-nothing reach (exit 0 without a browser run) under the declared residual model | the seat findings, named by seat |

  A green counter settles the measurement-level part of the sentence only; it does not admit
  the claim. Write the six outcomes as a short list inside the C1 paragraph.
- **Do not paraphrase the sentence in the entry.** Quote the frozen texts above, or cite the
  counter's own `predicate`/`findings` output; the L1's prose must not restate the sentence in
  its own words (the round-42 P-A defect class was exactly a sentence that the instrument did
  not implement).
- On ADMISSION, paste into `SCORECARD.md` a new `### Capabilities — round 43` section
  (rounds 36-42 have none — no capability entered rounds 39-42) with the house row shape
  `| Capability | What it can now do | Evidence pointer | First-working round |`:

  | playwright-firefox-loopback-tcp | observe a loopback browser session's TCP sockets from both ss and /proc/net/tcp under a signature-authenticated chain (per-invocation Ed25519 run key, witness-attested, challenge-bound receipt) | `corpus/evidence/round43/playwright-egress/receipt.json`; `.ufo/waves/round-43/measure/c1-measure-r43.json` | 43 |

- On NON-ADMISSION, state which seat demonstrated which limb, name the routed defect in the
  L1's own words (not the seat's), and route it to round 44. Coverage holds 9 → 9.

**C2 (calibration) — [TBD: MET AS WORDED / NOT MET AS WORDED].**

- Frozen counting command (⟨FROZEN⟩, `claims[1].countingCommand`):
  `node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json`
- Frozen kill rule (⟨FROZEN⟩, `claims[1].killRule`): *If any settled seat demonstrates, within
  the committed bytes and the declared model, that a rule accepts what its sentence denies (a
  tree scored as blob, a fabricated measure record greened, a forged control binding, a quote
  line absent from the control bytes), the claim is not met as worded: calibration holds its
  score and the repair routes to round 44. No rule or sentence is amended after any seat
  scores.*
- Frozen admission (⟨FROZEN⟩, `claims[1].admission`): *On pass only: calibration evidence
  pointer updated to the round-43 checker receipt at the measured revision; no numeric score
  change without a later score rubric.*
- Fill from the checker's own JSON: the `<REV>` used, the exit code, `predicate`, and the
  `findingIds` array (empty for a pass). `<REV>` must be the revision at which the checker is
  run — the same revision the entry cites as the measured revision.
- **The claim sentence and the checker sentence are the same bytes here.** `claims[1].predicate`
  is byte-identical to the checker's `PREDICATE-SENTENCE` header and its `const PREDICATE`
  literal (re-derived at HEAD, 0 mismatches — `w1/ScribeLogDraft/evidence/sentence-identity-check.txt`),
  so unlike C1 there is no claim-level suffix to score separately: a green checker plus no
  seat demonstrating a rule accepting what its sentence denies is the whole claim.
- On a PASS, record the instrument pass *and* the admission separately: as in round 42, a
  checker exit 0 is an instrument pass; admission additionally requires that no settled seat
  showed a rule accepting what its sentence denies. Name the r42→r43 repairs that closed:
  r1a blob-type gate (`git cat-file -t`, S151), the pinned measure blob id
  `8ff64d691f5c09569a50f2a5a038bb23774c3d35`, r5 freeze-binds-controls (sha256 + verbatim
  quote per control), and r6 committed V0-probe refusal.
- On NON-ADMISSION, name the seat, the rule, and the sentence it contradicts; route to round
  44. Calibration holds 9 → 9.

### Registry old→new

| Row | old (at freeze, `corpus/SOURCES.md` @ `ba433c9`) | new (at integration) |
|---|---|---|
| S150 | status `mined`, used-by `corpus/knowledge/receipt-authenticity-signing-round-43.md` | status `mined` (unchanged), used-by `corpus/knowledge/receipt-authenticity-signing-round-43.md`, `corpus/lessons/round-43.md` |
| S151 | status `mined`, used-by `corpus/knowledge/receipt-authenticity-signing-round-43.md` | status `mined` (unchanged), used-by `corpus/knowledge/receipt-authenticity-signing-round-43.md`, `corpus/lessons/round-43.md` |

- **What actually changes.** The knowledge-entry path is already in both committed rows (it was
  written at the freeze); the integration delta is the **lesson path**. There is no status flip,
  no teaches-cell rewrite and no row deletion in round 43: S150/S151 stay `mined`, tier `A`,
  recheck `on-release`.
- **Two preconditions before the used-by cell may name the lesson** (both enforced by
  `scripts/check-sources.mjs`, read at `scripts/check-sources.mjs:329-344` and
  `:203-238`): the file `corpus/lessons/round-43.md` must **exist** (else
  `used_by_missing`), and its bytes must **cite the row id** — a `S150` token for the S150 row,
  a `S151` token for the S151 row, each bounded by non-alphanumerics (else `used_by_uncited`).
  A lesson that names neither turns the sources gate red at integration.
- The lesson file is written by the `ScribeLessonSkel` seat and completed by the L1; the
  entry `corpus/knowledge/receipt-authenticity-signing-round-43.md` already exists (committed
  at the freeze) — its `corpus/README.md` coverage row is a separate integration task and is
  named here so it is not dropped.
- **Status of the lesson file at skeleton time (observed, not assumed):** `corpus/lessons/round-43.md`
  was present in the working tree (1,941 bytes) and already cited both `S150` and `S151` as
  bare tokens, so both preconditions above are met *for the working-tree copy*. It was
  untracked at that moment, so the L1 must confirm the file is **committed** before the
  used-by cell names it — the sources gate reads committed bytes at the measured revision,
  not the working tree.
- Verify with `node scripts/check-sources.mjs` (read-only over `corpus/SOURCES.md`; writes only
  its own mkdtemp scratch) and paste the `SOURCES_GATE verdict=… rows=… findings=…` line.
  Round 42's precedent: `check-sources.mjs` clean, `check-c2-knowledge-round41.mjs` red — the
  standing-gate line below.

### Census end

- Receipt path convention (round-42 precedent): `.ufo/waves/round-43/measure/census-end.out`,
  `.ufo/waves/round-43/measure/census-end.exit`, `.ufo/waves/round-43/measure/census-end.err`.
  Round 43's census **start** receipt is already committed
  (`.ufo/waves/round-43/measure/census-start.out` / `.exit` / `.err`: exit 0, `tabi ok`, 21 W04
  duplicate-url warnings, last line `tabi ok …/corpus/SOURCES.md`). The census-end receipt is
  the L1's post-integration run.
- Fill: `[TBD: exit code]`; `[TBD: last line of census-end.out]`; `[TBD: N] W04 warnings`;
  `[TBD: N] rows`; tier split `[TBD: A…/B…/C…]`; status split `[TBD: mined … / queued … /
  rejected …]`.
- **Do not restate the start figures as the end figures.** Round 42's integration entry
  corrected its own pre-dispatch tier/status figures because they had been written from the
  start receipt — the L1 must read the end receipt for the end numbers.
- Optional, if the L1 runs it: the `ExecCensus` seat's expected-vs-observed table is the
  cross-check; paste both sides and reconcile them in the entry rather than silently picking
  one.

### Assimilation

**Assimilation: none** — [TBD: one clause of evidence]. The r42 fresh re-adjudication
(misbound 25 / absent 6 / partial 4 / present 2 / unreachable 1 of 38) keeps package adoption
closed; `considerthese/` is still absent. State the round-43 observation that supports the
"none" line (re-run the quarantine re-adjudication and quote the fresh counts, or state that
the round-43 wave produced no adoption candidate and why) — do not copy round 42's numbers
forward without a round-43 receipt.

### Standing-gate conflict

**Standing-gate conflict recorded (unchanged from round 42):** `scripts/check-c2-knowledge-round41.mjs`
stays **red** and is left unamended — its frozen pins describe the pre-D2 registry state that the
round-41 closure routed as a defect (S146's status cell is `rejected`, and its used-by cell
names the round-42 lesson rather than the round-41 knowledge entry). Observed at seat time
(`w1/ScribeLogDraft/evidence/standing-gate-check.json`):

```
$ node scripts/check-c2-knowledge-round41.mjs
{"schema":"tabi-r41-c2-knowledge","predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}
exit=1
```

The round-42 operator ruling request stands unchanged: **the r42 L0 question (`.ufo/l0-questions.md`,
filed under the r27 L0 surface) is still unanswered**, and no round-43 seat may amend that
checker's pins to make it green. Round 43 changes nothing in this gate; the L1 re-runs the
checker at integration and records the same red state with the same two findings.

### Tooling

No tool installs; no pacman transactions (pause honored). [TBD: amend only if the L1 installed
something — record tool, version, channel, reason.]

---

## Appendix A — the 64 seat names (expected, from `w1-spec.json`)

Round-43 expected roles: critic 16, executor 16, mutation-tester 8, reviewer 6, scout 5,
scribe 5, connector 4, sentinel 2, simplifier 1, revenger 1 (attack share 30/64 = 46.9%).

`ConnAdjacency`, `ConnCrossClaim`, `ConnRound`, `ConnSiblingProc`, `CritBatteryVectors`,
`CritC1KeyPersistence`, `CritC1ReachDirect`, `CritC1ReachReplay`, `CritC1ReachSynth`,
`CritC1Witness`, `CritC2Blob`, `CritC2LedgerR43`, `CritCapRow`, `CritFreezeAudit`,
`CritFreezeBindings`, `CritNoHarm`, `CritNonceAudit`, `CritPredC1`, `CritPredC2`,
`CritResidualModel`, `ExecC1Battery`, `ExecC2FreezeRev`, `ExecC2TreeFixture`, `ExecC2V0Probe`,
`ExecCensus`, `ExecClaimsSchema`, `ExecDigestPins`, `ExecFixtureRepro`, `ExecNoHarm`,
`ExecPinProbe`, `ExecReplayAll`, `ExecScratchGuard`, `ExecSelfassess`, `ExecSentence`,
`ExecTsvBlobs`, `ExecWaveAudit`, `MutC1Challenge`, `MutC1Nonce`, `MutC1Sig`, `MutC1Witness`,
`MutC2Bind`, `MutC2Blob`, `MutC2Pin`, `MutDriverEgress`, `RevC1Driver`, `RevC1Wrapper`,
`RevC2Checker`, `RevEvidenceR42`, `RevS150`, `RevS151`, `RevengerDispatch`, `ScoutDriftPins`,
`ScoutL0`, `ScoutRegister`, `ScoutSibling`, `ScoutSourceCandidates`, `ScribeEntryAuth`,
`ScribeErrata42`, `ScribeLessonSkel`, `ScribeLogDraft`, `ScribeScorecardDraft`,
`SentEgressAudit`, `SentSecrets`, `SimplifierC1`.

Every name above must appear in the integration entry's accounting: settled (with a VERDICT
kind) or dead (recorded by name). No name may be silently dropped.

## Appendix B — the `SCORECARD.md` disposition twin (L1 fills after the LOG entry)

Mirror the round-42 shape (`SCORECARD.md:2244-2296`):

1. `## Round 43 — executed disposition ([TBD: headline]; admission [TBD: true/false])` — the
   measured revision, the wave results/TSV/lesson/QUALITY criteria/registry flips/census end,
   the final counter receipts, and the statement that the freeze `7ca6f018…` was never amended
   after seat data (baseline `ab592825…`).
2. The two-row claims table — `| Claim / axis | Counting command | Before → after | Verdict /
   score |` — with the exact counting commands and the frozen kill rules as the verdict column.
3. `### Round 43 — waves and seats` — seat counts, role mix, attack share, dead seats,
   WAVE-DONE mode, evidence paths.
4. `### Round 43 — capabilities / planned / saturation / retired` — the capability row (only on
   C1 admission), what is routed to round 44, saturation 8 / window 3 and the stagnation nudge's
   state after this round.
5. `### Round 43 — trend verdicts` — the house trend table (expansion / quality / discernment)
   with evidence; discernment for round 43 includes the outstanding non-author spot-check duty
   if it is still pending at filing (it was pending for round 42).

## Appendix C — the commands the L1 runs to fill this skeleton (each with its receipt)

| # | Command | Receipt to cite |
|---|---|---|
| 1 | `node <scratch-copy of .ufo/waves/round-42/parse-w1-results.mjs> /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1-results.json` | parse summary JSON → `.ufo/waves/round-43/w1-parse-summary.json` |
| 2 | `node scripts/measure-c1-round43.mjs --out corpus/evidence/round43/playwright-egress/receipt.json --measure-out .ufo/waves/round-43/measure/c1-measure-r43.json --scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run` (⟨FROZEN⟩ command) | exit code, measure record, receipt + witness bytes |
| 3 | `node scripts/measure-c1-round43.mjs --battery` | battery result (the freeze's committed battery is 7/7) |
| 4 | `node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` (⟨FROZEN⟩ command) | checker JSON + exit code at `<REV>` |
| 5 | `node scripts/check-sources.mjs` | `SOURCES_GATE verdict=… rows=… findings=…` |
| 6 | `node scripts/check-c2-knowledge-round41.mjs` | the two-finding red state (standing-gate line) |
| 7 | the lane census command that produced `measure/census-start.out` | `measure/census-end.out` / `.exit` / `.err` |
| 8 | `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only <REV> -- corpus/evidence/round43` | committed-byte check for the C1 kill rule's third limb (receipt/measure bytes committed at the measured revision) |

## Appendix D — what this skeleton does not decide

- It does not predict either claim's verdict, and it does not pre-count verdicts, roles or
  findings. Every tally is `[TBD]` because the wave has not reported.
- It does not amend, propose or paraphrase any frozen instrument; the frozen texts above are
  copies of the freeze, and the ⟨FROZEN⟩ blocks must survive the L1's edit byte-for-byte.
- It does not carry a finding about the round-43 instruments — the seats own that. Holes are
  routed, not patched.
- It does not authorise a commit, a push or a release. The integration commit is the L1's.
