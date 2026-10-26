# Round 31 `## Mistakes` — draft for `corpus/lessons/round-31.md`

Seat ScribeLessonMistakes, frontier step 2b.3. This file is the draft the L1 folds into the round-31 lesson: the
table rows and one `### M<n>` subsection each. Class vocabulary is `CORPUS.md` §5 (`vacuous`, `survivor`,
`stale-premise`, `reference-drift`, `number-drift`, `scope`, `attribution`, `landing`, `provider`). Every fix is
marked landed / partially landed / not landed, and carries the red state a stored command turns on — or states
plainly that no red state exists yet, which under this lane's rule means the fix does not count as proven.

Provenance of every pointer below: the freeze commit `9505a10eb80b2a0b273ebaba3f7f872ad302192d`, the baseline
`96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`, and committed receipts under `.ufo/waves/round-31/baseline/` and
`.ufo/waves/round-30/`. Line numbers are at the freeze commit unless the row says otherwise. Receipts I produced
while mining (greps, diffs, extracts) are in `receipts/` beside this file.

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `number-drift` | `.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt:1` — `{"mismatches":1,…"doc":"SCORECARD.md","line":1527,"claimed":12,"observed":2}`; `.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt:130` mismatches=3; row at `corpus/lessons/round-30.md:344` | `scripts/check-selfassessment.mjs` m1 (it emitted the false positive); adjudicated at `corpus/lessons/round-30-verifier-spotcheck.md:148` (routed defect 2) | **landed** — v2 summary-line oracle (`scripts/check-selfassessment.mjs:172-179`) + regression case `v2-oracle-reads-summary-line-not-first-cases-token` (`:685`). Red state proven: `baseline/m8-proof/old-oracle-selftest.txt` (`cases=29 passed=28`, exit 3) |
| M2 | `scope` | the pre-freeze counter read only `SCORECARD.md` and `LOG.md` (`git show 96a2d1a3:scripts/check-selfassessment.mjs` → `readBlob(repo, rev, …)` calls at `:402`, `:405`, none for `SKILL.md`/`corpus/README.md`); nine stale tallies stood there — `baseline/c2-T0-reading.json` | `none` | **landed** — v2 windows (`scripts/check-selfassessment.mjs:422-425`, no-section-fallback association `:315-320`); red state: the same command at the T0 tree exits 1 with those nine (`baseline/c2-J1-do-nothing.json` + `.exit`) |
| M3 | `number-drift` | `SCORECARD.md:1523` "`check-selfassessment` mismatches 0 after the round-30 corrections above", against `measure/noharm-at-0ffc6ea.txt:130` (3) and `measure/noharm-at-d3cd62a.txt:1` (1); routed at `corpus/lessons/round-30-verifier-spotcheck.md:147` | the outside verifier (non-author closure spot-check), not a lane instrument | **not landed at the freeze** — `git grep -n 1523 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md` → 0 hits, exit 1. Red state ready: the sentence itself |
| M4 | `vacuous` | `.ufo/waves/round-30/w2/ConnCounterLeaks.md:13-20`, `:80-100`; `.ufo/waves/round-30/w2/CritC1EnvLeak.md:11-20`; frozen bytes still carry the leaks — `scripts/check-gate-mutants.mjs:142,152` (run dir `<work>/<runId>`, env spread), `scripts/check-frontier-admission.mjs:174-175` (`file://` accepted, `curl -sS -L` with no `-q`/proto pin) | `none` (attack seats, after the freeze) | **partially landed** — round-31's new counter is hermetic (`scripts/check-decision-table.mjs:194-213`): `curl -q`, `--proto =https`, `--proto-redir =https`, final URL same-host; its self-test case `live-offhost-redirect` (`:360`) is the red state. The three carried counters and the QUALITY criterion draft (80, `ConnCounterLeaks.md:102-113`; QUALITY.md still ends at 79) are **not landed** |
| M5 | `survivor` | `.ufo/waves/round-30/w2/MutC1Beyond.md:5` (22 hand-built mutants outside the frozen catalogue; `:63` a survivor killed only by a reason pin, `:70` fifteen new fault rows available); `.ufo/waves/round-30/w2/CritC1CasesPinsB.md:79-95` (five teaches-side weakenings pass the full `--selftest`); `CritC1CasesPinsA.md:52-66` (prefix-only reason match; a crash aborts the harness) | `none` | **not landed** (counter frozen for C1; carried as `claims.json.notClaimed` item 1). Red states exist per variant table in both reports |
| M6 | `attribution` | `.ufo/waves/round-30/w2/CritC2Fabrication.md:185-186` (F2: the S116 "refetch" is the entry author's own fetch relabelled by the L1; F3: the counter cannot decide copy vs refetch), `:177` | `none` | **not landed** (frontier-admission v2 independence evidence; `claims.json.notClaimed` item 1). Red state: the two labels in `corpus/evidence/round-30/frontier/refetch/` |
| M7 | `scope` | `SKILL.md:2474` states a self-test figure as `(cli_cases=36, helpers=4)`; the window's tally detector is `\bcases\s*=\s*(\d+)` (`scripts/check-selfassessment.mjs:122-127`), which cannot see a `_cases=` prefix, and no finding is emitted for that line in `baseline/c2-T0-reading.json`; independent probe `.ufo/waves/round-31/w1/ExecC2Oracle/oracle.tsv` row 2 (oracle could-not-evaluate: "no word boundary before cases") | w1 ExecC2Oracle (this round, after the freeze) | **not landed** — no detector alternative for `<name>_cases=N` and no `could-not-evaluate`-on-a-stated-tally rule. Red state to build: a fixture line whose `cli_cases` figure is stale → today it yields no finding at all |
| M8 | `vacuous` | `claims.json` §claims[0].controls (J1 do-nothing, J2 old rows, J3 self-quote offline/live, J4 invented thresholds, J5 package-as-is) and §claims[1].controls (J1 do-nothing, J2 delete lines, J3 uncited correction, J4 wrong-doc citation, gateEditJunk): every control attacks the **work**; none attacks an observable of the counter itself | `none` — the round-30 M7 row (`corpus/lessons/round-30.md:297`) asked for exactly this control class and round 31's freeze did not build one | **not landed** (freeze passed). Cheapest observable-junk named, unbuilt: a fixture gate that prints a different `…_SELFTEST … cases=N` when an ambient variable is set, run through `scripts/check-selfassessment.mjs:167` (parent env forwarded) |
| M9 | `reference-drift` | `.ufo/waves/round-30/w2/ConnFrontierConsistency.md:25-40` — six defects (item-label drift README `:216,:282-285,:302-305,:331-332` vs canonical `:182,:641-651`; class-pointer narrowing "C2–C6" `:182` vs "C3 and C6" `:644,:651`; fixture pointer §4–§5 vs `external-class-fixture-v2.md:510`; C3 parenthetical; SKILL `§Rights / rate boundary` `:693-695`; `adjacency.tsv` row 6 truncated quote with `ruling_ref -`), each fixable by append-only additions | `none` (attack seat, after the freeze) | **not landed** — at the freeze tree `corpus/README.md:37` still reads "(C2–C6)" and `:644` "C3 and C6", i.e. neither pointer was reconciled; no QUALITY criterion covers pointer precision on a frontier restatement |

Table rows: 9. `### M` subsections below: 9.

### M1 — the calibration oracle read the first `cases=` token in a gate's output

- **Class:** `number-drift`.
- **Evidence:** `scripts/check-gate-mutants.mjs --selftest` prints a per-case line carrying a child gate's tally
  (`… cases=2 passed=1 …`) before its own `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12`. The round-29
  oracle took the first `cases=` it saw, so `SCORECARD.md:1527`'s true 12/12 was reported as 12 vs 2
  (`.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt:1`), and that finding is the residual behind routed defect 2
  (`corpus/lessons/round-30-verifier-spotcheck.md:148`). Round-30's own row is `corpus/lessons/round-30.md:344`.
- **Captured by:** the same counter, m1 — it did emit the finding; what was missing was any rule that the oracle
  itself be tested against a noisy gate, so the false positive survived a round.
- **Fix (landed at the freeze):** the v2 oracle anchors on the gate's own summary line,
  `^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)`, taking the last match
  (`scripts/check-selfassessment.mjs:172-179`); regression case
  `v2-oracle-reads-summary-line-not-first-cases-token` (`:685-693`).
- **Able to fail:** `baseline/m8-proof/old-oracle.mjs` (sha256
  `bfc9682b692339acfd1647bbddca7a1569c1410968aa742ad2ae8e5ed3962855`) is the frozen counter with the v2
  behaviours reverted; its committed run reads `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28`,
  `exit=3`, and the one FAIL is that case (`expected_exit=0 exit=1 expected=- actual=m1-selftest-tally`) —
  `baseline/m8-proof/old-oracle-selftest.txt`. The other 28 cases pass, so the case is not red for an adjacent
  reason.
- **Limit — the probe is a three-change revert, and the receipt's own figure is off by one.** My
  `diff -u` of the frozen blob against the probe (exit 1, 6 hunks, 19 removed / 9 added lines; `receipts/frozen-vs-old-oracle.diff`)
  shows it also drops the `lineOnly` window parameter (`:286-320`) and deletes the case
  `v2-readme-no-section-fallback` — hence `cases=29`, not 30. So (a) only the oracle clause has an isolated red
  state; the no-section-fallback association rule's own case *passes* in the reverted file, and its ability to
  fail is unproven; and (b) `baseline/README-receipts.md`'s m8-proof row says "28/30, exit 3" while the receipt it
  describes says `cases=29 passed=28`. Keep the proof, correct the denominator when the lesson cites it.

### M2 — two documents carried self-test tallies that no window read

- **Class:** `scope`.
- **Evidence:** the pre-freeze counter's declared windows are `SCORECARD.md` and `LOG.md` only —
  `git show 96a2d1a3:scripts/check-selfassessment.mjs | grep -n 'readBlob(repo, rev,'` gives `:402`
  (`"SCORECARD.md"`), `:405` (`"LOG.md"`) and no `SKILL.md`/`corpus/README.md` read; the file's only
  `SKILL.md`/`corpus/README.md` strings are fixture receipt commands at `:606`, `:617` (`receipts/baseline-window-absence.txt`).
  Nine tallies in those two documents therefore went stale without an instrument noticing:
  `SKILL.md:1614` (sources 25 vs 26), `:2479` (selfassessment 13 vs 30), `:2514` (s106 5 vs 10),
  `:2515` (selfassessment 17 vs 30), `:2529` (s106 7 vs 10), `:2530` (selfassessment 20 vs 30),
  `:2543` (release-pins 20 vs 29), `:2544` (s106 7 vs 10), `corpus/README.md:613` (selfassessment 17 vs 30) —
  `baseline/c2-T0-reading.json`, mismatches 9 (`receipts/t0-mismatch-set.txt`). Each was already stale at the
  baseline: the superseding figures are in the corpus itself, e.g. `SCORECARD.md:1192` (sources 26) and `:1465`
  (selfassessment 22) are present at `96a2d1a3`.
- **Captured by:** `none`.
- **Fix (landed at the freeze):** two more windows with the same-document citation rule and per-line script
  association (`scripts/check-selfassessment.mjs:286-320`, `:422-425`), plus the append-only corrections C2 lands.
- **Able to fail:** the identical command on the pre-correction tree is red — `baseline/c2-J1-do-nothing.json`
  (`mismatches 9`) with `c2-J1-do-nothing.json.exit` = `exit=1`.
- **Limit — the red state's revision is not in the lane repo.** `c2-T0-reading.json` and `c2-J1-do-nothing.json`
  name `befe2a3f96f451e1fe797c3cab5f4c8dcf670f99`; `git cat-file -t befe2a3f…` in the lane fails ("Not a valid
  commit name"). T0 was a scratch clone committed by `baseline/controls.sh` (`fresh()`/`commit()`, fixture
  identity), so the before-reading is reproducible only by re-running that script over the freeze tree (tree
  `192b06438ee03341904242d8e218f5ee80a307cc`, present in the lane). Say so where the number is cited, or a reader
  will try `git show befe2a3f` and find nothing.

### M3 — a disposition line claimed zero mismatches while the committed readings were 3 and 1

- **Class:** `number-drift`.
- **Evidence:** `SCORECARD.md:1523` — "`check-selfassessment` mismatches 0 after the round-30 corrections above" —
  against `measure/noharm-at-0ffc6ea.txt:130` (`mismatches=3`) and `measure/noharm-at-d3cd62a.txt:1`
  (`{"mismatches":1,…}`). Routed as defect 1 at `corpus/lessons/round-30-verifier-spotcheck.md:147`, which asks
  for an appended correction citing `SCORECARD.md:1523` by line.
- **Captured by:** the outside verifier, at closure. No lane instrument reads a "mismatches 0" prose sentence; the
  counter in force at the time matched only tally shapes.
- **Fix (not landed at the freeze):** `git grep -n 1523 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md`
  → no output, exit 1 (`receipts/freeze-1523.txt`). The round-31 freeze section corrects `:1439`, `:1465`, `:1486`
  and `SKILL.md:2545` only (`claims.json.freezeTimeCorrections`, "Nothing else is corrected at freeze").
- **Able to fail:** the red state is the sentence at `:1523`; the check is `grep -c 'SCORECARD.md:1523' SCORECARD.md`
  ≥ 1 with the correction stating the measured residual of 1 and its cause (M1).
- **Limit:** the routed fix is a curation edit; no instrument enforces it. Criterion 78 demands the citation form,
  not its existence — worth saying in the row so the next round does not believe an append is instrumented.

### M4 — a counter's measurement path stayed reachable from the code under test

- **Class:** `vacuous`.
- **Evidence:** `.ufo/waves/round-30/w2/ConnCounterLeaks.md:13-20` (both round-30 counters reuse a production
  affordance: the run directory names the mutant, the live check admits a local scheme) and `:80` (a third gate,
  `check-freshness`, reads three absolute host paths in production); `CritC1EnvLeak.md:11-20` (a `process.cwd()`
  case reaches the frozen target at the tip with frozen bytes). The frozen bytes still carry them:
  `scripts/check-gate-mutants.mjs:143` (`const dir = join(work, runId)`) and `:152`
  (`env: { ...process.env, … }`); `scripts/check-frontier-admission.mjs:174` (`/^(https:\/\/|file:\/\/)/`) and
  `:175` (`spawnSync("curl", ["-sS", "-L", …])`, no `-q`, no proto pin); `scripts/check-selfassessment.mjs:167`
  forwards the parent environment to the gate under test.
- **Captured by:** `none` (attack seats, after the freeze).
- **Fix (partially landed):** the round-31 decision-table counter was written hermetic —
  `scripts/check-decision-table.mjs:194-213` (`curl -q -sS --proto =https --proto-redir =https -L`, rejecting a
  final URL that is not https on the row's own host) — and its self-test case `live-offhost-redirect`
  (`:360`) demands `l1-live`, so the refusal is exercised (frozen self-test receipt `baseline/c1-counter-selftest.txt`:
  `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34`, exit 0; not re-run by this seat). The three older
  counters and the criterion are carried: QUALITY.md has 79 criteria at the freeze, and the drafted criterion 80
  (`ConnCounterLeaks.md:102-113`) is not among them.
- **Able to fail:** landed half — `live-offhost-redirect` (off-host redirect ⇒ `admitted 0, reason l1-live`).
  Unlanded half — no red state exists for the env-forward (`:167`) or the `<work>/<runId>` naming (`:143`); the w1
  CritC1Counter / CritC1EnvLeak fixtures are the raw material.
- **Limit:** the env forward is latent rather than exploited — no gate in the runnable set decides its tally from
  an ambient variable (`git grep -n process.env 9505a10 -- scripts/` hits only PATH/HOME filtering, git config
  pinning, TMPDIR setting and fixture spawns; `receipts/env-forward-lines.txt`). Say "latent" so the row is not
  read as a measured 27/0 bypass of the calibration claim.

### M5 — case gates accept weakened checks, and the catalogue misses mutants

- **Class:** `survivor`.
- **Evidence:** `.ufo/waves/round-30/w2/MutC1Beyond.md:5` — 22 mutants strictly outside the frozen catalogue, of
  which fifteen are available as new fault rows with demonstrated behaviour change (`:63`, `:70`);
  `CritC1CasesPinsB.md:79-95` — five teaches-side weakenings (`includes("supersedes")`, `startsWith("supersedes ")`,
  `includes(" —")`, prefix without separator, tag `>= stable`) pass the whole `--selftest` at exit 0, because the
  supersession case's fixture `teaches` cell carries no `supersedes` token; `CritC1CasesPinsA.md:52-66` — the
  reason assertion pins a prefix only, both `f4` cases share one reason string, and any crash aborts the harness so
  "killed" can mean "the suite died".
- **Captured by:** `none`.
- **Fix (not landed):** the gate-mutants v2 items (`claims.json.notClaimed` item 1: opaque run directories, minimal
  child env, killer attribution, catalogue extended with the MutC1Beyond survivors).
- **Able to fail:** not applicable until landed; the attack reports carry the fixtures and the exact find/replace
  strings, which is the red state a landed catalogue row would consume.

### M6 — a refetch record was labelled independent while produced by the entry's author

- **Class:** `attribution`.
- **Evidence:** `.ufo/waves/round-30/w2/CritC2Fabrication.md:185` (F2: the S116 "refetch" transcribes a real fetch
  by `ScribeEntryRateLimitFields`, the seat that also wrote the entry and had declared it "cannot supply an
  independent refetch"; independence holds only against `FetchS159`) and `:186` (F3: receipt and refetch bytes are
  the same git blob for an immutable URL, so copy vs. refetch is decidable only from an external log). The label
  test is at `:177`.
- **Captured by:** `none` — `g7` checks a refetch's seat label and bytes, never the seat's role.
- **Fix (not landed):** frontier-admission v2 must require independence evidence
  (`claims.json.notClaimed` item 1). Today the frozen bytes still admit `file://` and follow redirects
  (`scripts/check-frontier-admission.mjs:174-175`).
- **Able to fail:** the two labels in `corpus/evidence/round-30/frontier/refetch/` are the red state; no case
  consumes them.

### M7 — the window cannot read a `cli_cases=` figure, so that registry row's tally is never compared

- **Class:** `scope`.
- **Evidence:** `SKILL.md:2474` (aria-historical-metadata row) states its self-test as `(cli_cases=36, helpers=4)`.
  The window's tally detector is `TALLY_PATTERNS` (`scripts/check-selfassessment.mjs:122-127`), whose `cases` form
  is `\bcases\s*=\s*(\d+)`; `_` is a word character, so `cli_cases=36` has no boundary and no tally is recognised —
  and `baseline/c2-T0-reading.json` emits no finding for line 2474 at all. The independent probe
  `.ufo/waves/round-31/w1/ExecC2Oracle/oracle.tsv` row 2 reaches the same line from the other end: "oracle
  could-not-evaluate ('self-test printed no tally'): summary line carries cli_cases=36, which has no word boundary
  before 'cases'" (`receipts/oracle-coverage-rows.tsv`). The gate prints that shape on both paths — clean at
  `scripts/check-aria-metadata.mjs:2983-2986` (`ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` with a
  probe reading of 36) and refused at `:2320` (`ARIA_METADATA_SELFTEST verdict=blocked cli_cases=0 helpers=0`) — so
  the shape is the gate's production summary, not a fixture's.
- **Captured by:** w1 ExecC2Oracle, this round, after the freeze.
- **Fix (not landed):** no detector alternative for `<name>_cases=N`, and no rule that a states-a-tally line the
  oracle cannot read must be reported rather than skipped.
- **Able to fail:** unbuilt. Today a stale `cli_cases` figure produces no finding, silently — that absence is the
  red state a case would turn green.
- **Limit:** this is not the round-30 M8 misread (a wrong number); it is a silent non-read. Keep them separate rows
  so the oracle fix (M1) is not credited with coverage it does not have.

### M8 — the freeze controls attacked the work, not the counter's own observables

- **Class:** `vacuous`.
- **Evidence:** `claims.json` §claims[0].controls — do-nothing, rows already in the registry, self-quote receipts
  (offline and `--live`), invented thresholds, package-copied-as-is; §claims[1].controls — do-nothing, deleted
  stale lines, uncited blanket correction, wrong-document citation, "gateEditJunk". Ten controls, every one of them
  a fixture about the **work**. None asks what the counter reveals about itself: the run directory it creates
  (`scripts/check-gate-mutants.mjs:142`), the environment it forwards (`check-selfassessment.mjs:167`,
  `check-gate-mutants.mjs:152`), the URL scheme it accepts from a receipt it did not write
  (`check-frontier-admission.mjs:174`). This is the recurrence of round-30 M7 (`corpus/lessons/round-30.md:297`),
  whose fix was a freeze checklist item — "build one junk per observable before freezing".
- **Captured by:** `none` (the round-30 M7 row asked for it; the round-31 freeze did not do it).
- **Fix (not landed — the freeze has passed):** for the next freeze, one control per observable; the cheapest here
  is a fixture gate that prints a different `…_SELFTEST … cases=N` when an ambient variable is set, plus a receipt
  whose url is `file://`, scored against the frozen counters.
- **Able to fail:** unbuilt. State it as a control gap, not as a measured bypass.

### M9 — six frontier-pointer defects were routed and none was corrected

- **Class:** `reference-drift`.
- **Evidence:** `.ufo/waves/round-30/w2/ConnFrontierConsistency.md:25-40` lists them with line pointers: (1)
  item-label drift — "rate/rights real-site records" (`corpus/README.md:216`, `:282-285`, `:302-305`, `:331-332`;
  `PROVINCE.md:10`) against the canonical "Rate/ToS surface for site-interaction records" (`:182`, `:641-651`), with
  rounds 18/20/21/22 dropping the item from their "still open" enumerations; (2) class-pointer narrowing — "C2–C6"
  (`:182`) against "C3 and C6" (`:644`, `:651`) when the deciding evidence names C2, C3 and C6; (3) fixture pointer
  §4–§5 where the quoted sentence lives at `external-class-fixture-v2.md:510`; (4) the C3 parenthetical read as
  "no datum in the corpus" after S116/S117 landed documented vocabulary; (5) `SKILL.md:693-695` and the C3/C6 rows
  carry no pointer to S116/S117; (6) `adjacency.tsv` row 6 truncates two quotes without ellipsis and cites
  `ruling_ref -` for a phrase that lives in the lane's own `.ufo/waves/round-14/w1/PolicyBoundaries.md:27`.
  All six are append-only-fixable and none changes a disposition.
- **Captured by:** `none` (attack seat, after the freeze); round-30's corrections addressed the `docs-held` half of
  the same row and nothing else.
- **Fix (not landed):** at the freeze tree the drift is still literal — `corpus/README.md:37` reads "(C2–C6)" and
  `:644` reads "C3 and C6" while `:182` keeps the canonical label. An errata block in both documents, each line
  citing the drifted line, is the fix; criterion 78 fixes the form, and nothing requires the errata to exist.
- **Able to fail:** no instrument; the red state is a reader-facing grep (`grep -n "rate/rights real-site records" corpus/README.md`)
  returning hits after the errata claims the drift is reconciled.

## Swept, already fixed — deliberately not rows

Checked and left out, with the pointer that shows the fix landed:

- `CritMistakes.md:53-68` (D1: M1's routed pointer was `:118` for a defect at `:119`; D2: M6's "§2" names no
  section) — corrected append-only at `corpus/lessons/round-30.md` §Wave-2 corrections ("M1's pointer … `:119`";
  "M6's pointer … Verdict and §F1 (`:80-101`)"). Already a fix; criterion 77/78 cover the form.
- `CritEntryPolicyFields.md` D1–D7 and F1 — errata appended (round-30.md §Wave-2 corrections: `rate-limit-policy-fields.md`
  §Errata D1–D7/F1; S116 `recheck` changed 180d → 2026-11-24).
- `CritEntryDiscord.md` D1/D2 — errata appended (`host-published-rate-limit-headers.md` §Errata: shared-scope 429
  carve-out, receipt-quote scope).
- `CritC2Surface.md` F1/F3 — README restatement ("`docs-held` covers the rate half only") and the S116 span
  correction (308–311 → 308–310).
- `CritC1CasesS106.md` — all three added cases hold under the catalogue mutant of their own term; no defect.
- `RevUsedByChange.md` / `RevS118.md` / `RevRegistrationV2.md` — registry appends accepted; no defect carried.
- `CritClaimVerdicts.md`, `MeasureC1Clean.md`, `MeasureC2Clean.md`, `RevC1KillAttribution.md`, `RevC1Diff.md` —
  measurements, not defect reports.

## What the L1 should carry into `## Gate`

- M1, M2 are the two fixes the round's own claims stand on; their red states are the receipts named above.
- M3, M9 are routed items still open at the freeze; if the round closes without them, say so in the lesson rather
  than in a correction.
- M4–M8 are `claims.json.notClaimed` in substance; keep the "not landed" wording identical to `notClaimed` so the
  lesson and the claims file cannot drift.
