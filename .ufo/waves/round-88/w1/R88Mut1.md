# R88Mut1 — independent mutation sweep (round 88, wave w1)

Seat: mutation-tester (independent), lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
base `f16f992d`, lane HEAD at run `7f1de1921803187920ee4edafab8ae68e318d64f`.
Scored receipt `corpus/evidence/round88/chromium-showpicker/receipt.json`
(driver `8c015fa4…b9b4`, nonce `tabi-r88-l1-86f1dcec`, fixture
`8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`).
Frozen set `.ufo/waves/round-88/freeze.txt` (`D 93500a4e`). Scratch `/fast/scratch/hyaku/tabi-r88/R88Mut1`
(removed before yield). Node v24.21.0; nothing installed (host pacman paused, no installs needed).

Instruments (copied to scratch at sweep start; this seat modified no lane byte — see §E for the
concurrent lane movement by other seats):

| file | sha256 of the copied/scored bytes (= freeze pin) |
|---|---|
| `scripts/check-showpicker-round88.mjs` | `3224747613008046907f88332e1054ff8f364fab9763e88868c905f5829c6f79` |
| `scripts/negatives-showpicker-round88.mjs` | `9c2bff42abb6c0060f0f7c02423ae433b883197d4c1a59b9642671a279938d10` |
| `scripts/check-record-drift-r88.mjs` | `3953e340a7521eb89af08dccff5a99bc37bdc3c2caa1372fe9c96ea42d432ab5` |

## Method and detectors

43 one-clause semantic mutants were written by hand against the two named instruments
(26 × `check-showpicker-round88.mjs`, 17 × `check-record-drift-r88.mjs`); none is from the
frozen kill-power list. Each mutant is applied to a scratch copy (`from` occurs exactly once
in the frozen source; 43/43 applied). Baseline before any mutation:

- frozen battery: **215 cases, 0 failed, coverage declared 102 / covered 102 / uncovered 0**, exit 0;
- drift gate on the live lane: exit 0, claims 4, mismatches 0; drift `--selftest`: exit 0.

Classification (same semantics as the frozen kill-power instrument):

- **killed** — the detector notices the edit (showpicker: frozen battery exits 1, i.e. at least
  one case is red where it must be green or green where it must be red; drift: any detector
  expectation breaks); **survived** — every detector still passes; **crashed** — the mutant does
  not run (no JSON); **unapplied** — the edit string is absent/non-unique.

Drift detectors per mutant: live lane must stay exit 0 / 0 mismatches; a healthy mirror fixture
must stay exit 0; an **isolated fixture** carrying exactly one statement defect must exit 1 with
that statement id; the gate's own `--selftest` must exit 0. Fixtures are a copy of the lane's
records under scratch; each was first verified red in exactly one statement with the frozen gate:

| fixture | injected defect | frozen gate |
|---|---|---|
| `healthy` | none | exit 0, failed `[]` |
| `t1a` | Round 44 carries `selftest 9/9 and selftest 10/10` (six other sections restored) | exit 1, `["scorecard-tallies"]` |
| `t1b` | Round 68 carries no `selftest 9/9` | exit 1, `["scorecard-tallies"]` |
| `t2a` | `SKILL.md` carries `selftest 10/10 at D7` | exit 1, `["selftest-wording"]` |
| `t2b` | lesson-88 names the D7 wording but not D6 | exit 1, `["selftest-wording"]` |
| `t2c` | lesson-88 names D6 but not the correction | exit 1, `["selftest-wording"]` |
| `t3a` | selftest runner not wired to the drift gate | exit 1, `["gate-selftest"]` |
| `t3b` | showpicker counter has no `--selftest` | exit 1, `["gate-selftest"]` |
| `t3c` | kill-power has no `--selftest` | exit 1, `["gate-selftest"]` |
| `t4a` | QUALITY 161 sweeps the tally set but does not cite the gate | exit 1, `["quality161-sweep"]` |

Totals: **killed 23, survived 20, crashed 0, unapplied 0** (26 + 17 = 43).

## A. `check-showpicker-round88.mjs` — 26 mutants

Killed (12):

| mutant | clause edited (weakened) | witness |
|---|---|---|
| `show-accept-answer-hex-dropped` | accept-answer-law read `ret === 'hex:'+ANSWER.hex` → `typeof … === 'string'` | `accept-answer-law` |
| `show-accept-mime-hex-dropped` | accept-mime law read hex → any string | `accept-mime-answer-law-bytes` |
| `show-accept-mime-state-dropped` | accept-mime state `[[PNG…]]` → `isObj(stateAfter)` | `accept-mime-answer-law` |
| `show-exempt-unmatched-one-tolerated` | `unmatched.length === 0` → `<= 1` | `prior-set-unmatched-exempt` |
| `show-grammar-accept-value-unpinned` | `desc.accept === accept` → `desc.accept !== null` (token value unpinned) | 6 cases incl. `accept-grammar-law-r88-case`, `-r88-mimeparam`, `-r87-audio/multimime/whitespace`, `-token` |
| `show-grammar-read-hex-loose` | grammar read `ret === 'hex:'+f.hex` → any string | `accept-grammar-law-bytes` |
| `show-grammar-state-array-only` | grammar state `[[name,size,type,'']]` → `Array.isArray(st)` | `accept-grammar-law-state`, `-r87-video`, `-r88-audiovideo` |
| `show-legshape-files-dropped` | per-leg `files` dropped from the shape loop | 9 `leg-*` cases (accept legs) |
| `show-legshape-seq-dropped` | per-leg `seq` dropped | `leg-sp84-same-origin-nonfile-disabled` |
| `show-legshape-state-dropped` | per-leg `state` dropped | 26 `leg-*` cases |
| `show-legshape-xy-dropped` | per-leg `xy` (x/y/buttons) dropped | `leg-sp84-click-while-open` |
| `show-prior-outside-one-tolerated` | `outside.length === 0` → `<= 1` | `prior-set-complete` |

Survived (14), with the clause left alive:

| mutant | clause left alive | consequence / claim wording |
|---|---|---|
| `show-accept-answer-state-dropped` | accept-answer-law no longer pins `stateAfter.k`; `isObj(stateAfter)` only | same value still pinned by `leg-sp84-accept-answer` shape → no clean-verdict escape. Redundant witness. No claim falsified. |
| `show-grammar-answer-files-dropped` | grammar law no longer pins `answer.files` (the driver's own file list) | `answer.setParams.files` basename, delivered state and read hex still bound; only the answer record's `files` mirror can be forged. No claim falsified. |
| `show-grammar-backend-id-int` | grammar law no longer binds `answer.setParams.backendNodeId` to the chooser node (`Number.isInteger` only) | the CDP send-log call is still pinned by `plan-calls`, and delivery by state/read hex; the answer **record** can misreport the node id. No claim falsified (no sentence binds the node id). |
| `show-grammar-read-count-open` | read count `=== 1` → `>= 1` on the grammar legs | an extra read event is also refused by `leg-<name>` (exact `seq` shape), so no clean-verdict escape. Redundant witness. |
| `show-legshape-opened-dropped` | per-leg `opened` (chooser modes) dropped | `mode-law` + `cdp-event-log-closed` bind the same modes/counts. Redundant. |
| `show-legshape-trusted-dropped` | per-leg `trusted` dropped | `trust-law` requires every page event trusted. Redundant. |
| `show-multiple-read-hex-dropped` | `multiple-mode-law` no longer pins the read `ret` (`hex:ANSWER.hex`) | **real witness hole**: the page-read bytes of the `sp84-multiple-mode` answer can be forged; `leg-shape` pins the read event's name/size/type but not its bytes. No other case mutates that `ret`. Not a claim falsification (the frozen counter still enforces it; the batterability is what fails). |
| `show-nonce-expected-case-insensitive` | nonce equality made case-insensitive | equivalent for a clean verdict: any case variant also fails `nonce-shape`. |
| `show-nonce-shape-max-open` | nonce shape upper bound `{4,48}` → `{4,}` | equivalent for a clean verdict: `--expect-nonce` still pins the exact string. |
| `show-nonce-shape-prefix-open` | `/^tabi-r88-/` → `/^tabi-r[0-9]+-/` | equivalent for a clean verdict: exact `nonce-expected` still pins. |
| `show-replay-need-floor` | `Math.ceil(FRAC*np - 1e-9)` → `Math.floor(FRAC*np)` | boundary hole (probe below): need 88 instead of the printed ceil 89 → refuses at matched 88 where the printed rule escapes, and the emitted `limit.sentence` (which says `ceil`) contradicts its own `absNeed`. Instrument limit wording, not C1 claim wording. |
| `show-replay-refused-strict` | `absMatched >= absNeed` → `> absNeed` | boundary hole (probe below): at the printed threshold matched = 89 no refusal → a forger moving 88/177 events escapes where the printed rule says refuse. The emitted `limit.sentence` and its escape minimum (89) become false by one event. Instrument limit wording, not C1 claim wording. |
| `show-unparsable-json-ext-only` | unparsable detection `(.json || startsWith '{')` → `.json` only | a schema-carrying non-`.json` file whose text does not start with `{` escapes `prior-set-unparsable`; the battery's stray is `.json`. Narrow detection hole; no claim falsified. |
| `show-webdir-read-hex-dropped` | webkitdirectory law no longer pins the two read `ret` values (count 2 kept) | **real witness hole**: the r84 webkitdirectory leg's page-read bytes can be forged (`uploadDir` sha and read file triples stay bound). Not a claim falsification (claim's accept law is about the token forms; the frozen counter still enforces the hex). |

## B. `check-record-drift-r88.mjs` — 17 mutants

Killed (11): each weakened statement was green on its isolated fixture while the frozen gate is red there.

| mutant | clause edited | detector that broke |
|---|---|---|
| `drift-scorecard-any-section` | `secs.every(has9 && !has10)` → `some(...)` | `t1a` and `t1b` both exit 0 (want exit 1 + `scorecard-tallies`) |
| `drift-scorecard-ten-ignored` | `every(has9 && !has10)` → `every(has9)` | `t1a` exit 0 |
| `drift-scorecard-nine-ignored` | `every(has9 && !has10)` → `every(!has10)` | `t1b` exit 0 |
| `drift-wording-stale-ignored` | `staleHolds` scan → `false` | `t2a` exit 0 (want `selftest-wording`) |
| `drift-wording-d6-ignored` | `d6named` → `true` | `t2b` exit 0 |
| `drift-wording-correction-ignored` | `correctionNamed` → `true` | `t2c` exit 0 |
| `drift-gate-wired-ignored` | `wired` → `true` | `t3a` exit 0 (want `gate-selftest`) |
| `drift-gate-counter-selftest-ignored` | `cst` → `true` | `t3b` exit 0 |
| `drift-gate-killpower-selftest-ignored` | `kst` → `true` | `t3c` exit 0 |
| `drift-quality-cites-ignored` | `cites` → `true` | `t4a` exit 0 (want `quality161-sweep`) |
| `drift-quality-wrong-section` | `^161\.` → `^160\.` | live and healthy fixture exit 1 with `quality161-sweep` (false red) |

All 11 also keep the gate's own `--selftest` green; statement weakenings that the selftest's own
fixture cannot see are exactly the survivors below.

Survived (6):

| mutant | clause left alive | consequence |
|---|---|---|
| `drift-selftest-wantred-dropped` | `wantRed = ['scorecard-tallies','selftest-wording']` → `['scorecard-tallies']` | the isolated mode no longer requires the wording statement red. Paired probe: with the selftest fixture's lessons made healthy (lesson-87 clean, lesson-88 naming D6 + the correction), the **frozen** selftest exits 1 (wording green but required red) while the mutant exits 0. The assertion set has no independent witness. C2 leg c wording not falsified by the frozen gate; the survivor shows the assertion can rot silently. |
| `drift-selftest-wantred-any` | `wantRed.every(...)` → `some(...)` | one of the two reds suffices; same paired probe: frozen exit 1, mutant exit 0. |
| `drift-selftest-claims-loose` | `claims === 4 && ids.length === 4` → `claims >= 1` | a gate that lost a statement still passes its own selftest. Paired probe: a copy with statement 4 removed reports claims 3; **frozen** selftest exits 1, mutant exits 0 (same `failed` ids are still reported). |
| `drift-selftest-always-zero` | `process.exit(out.ok ? 0 : 1)` → `process.exit(0)` | the isolated mode can never fail; every red-path expectation is dead. Paired probe (fixture lesson weakening): frozen exit 1, mutant exit 0. Strongest survivor: the only detector for the selftest is “exits 0”, so a permanently-green selftest is unfalsified. |
| `drift-selftest-status-loose` | `r.status === 1` → `r.status !== 2` | equivalent: the only statuses are 0/1/2 (and null on kill), and the `j && wantRed.every(...)` gate classifies each identically. No fixture can distinguish it. |
| `drift-selftest-fixture-swept-tally-removed` | selftest fixture Round 44 `selftest 10/10` → `selftest 9/9` | survived because the fixture's `scorecard-tallies` red is **overdetermined**: the fixture carries only Round 44 and Round 87, so six of the seven checked sections are absent and `has9` is false for them. Probe with all seven sections present: Round 44 `10/10` → red; Round 44 `9/9` → green. The selftest fixture therefore does not isolate the “swept tally” clause; the header's “red on a fixture that carries a swept tally” is literally true but not causal. Not a claim-wording falsification; the witness is weaker than it reads. |

## C. Boundary probes (evidence for the survivors)

Replay threshold (prior1: 177 events, `absNeed` frozen 89; forged receipt = prior with identity
rewritten and the first *M* page events shifted +1 ms; the replay clause's presence inspected
directly because the forged probe fails other plan checks for unrelated reasons):

| counter | moved events | absMatched | absNeed | `replay-event-timeline` |
|---|---|---|---|---|
| frozen | 0 | 177 | 89 | present (refused) |
| frozen | 88 | 89 | 89 | present (refused — printed boundary) |
| frozen | 89 | 88 | 89 | absent (escape) |
| `show-replay-need-floor` | 88 | 89 | 88 | present |
| `show-replay-need-floor` | 89 | 88 | 88 | present (refused where the printed rule escapes) |
| `show-replay-refused-strict` | 88 | 89 | 89 | **absent** (escape at the printed boundary) |
| `show-replay-refused-strict` | 89 | 88 | 89 | absent |

The frozen counter's refusal matches its emitted rule exactly (escape minimum 89 moved events).
`show-replay-refused-strict` moves the escape minimum to 88 events while still emitting the
sentence “refuse when absMatched >= ceil(0.5 * prior events)” and printing `absNeed` 89 — its own
limit block becomes false. `show-replay-need-floor` makes the printed ceil/floor pair inconsistent
in the strict direction. Neither touches the scored receipt verdict.

Drift selftest fixture overdetermination (emulated fixture: all seven sections present):

| emulated fixture | frozen gate failed |
|---|---|
| Round 44 `10/10`, six sections `9/9` | `["scorecard-tallies","selftest-wording","gate-selftest","quality161-sweep"]` |
| Round 44 `9/9`, six sections `9/9` | `["selftest-wording","gate-selftest","quality161-sweep"]` |

With the fixture's two-section shape the first and second rows both stay red, which is why
`drift-selftest-fixture-swept-tally-removed` survives.

## D. Claim-wording verdict

- **C1 (accept law).** No survivor falsifies “accept is not a validator on a programmatic answer”,
  the checkCount 102 / battery 0 failed / full-coverage 102/102 baseline, or the three r88 leg
  grammar rows: the killed mutants include the row-value, state and read-hex edits the assignment
  named (the answer↔chooser node-id binding is one of the surviving witness holes below). Two battery **witness holes** survive (`multiple-mode` and
  `webkitdirectory` page-read hex) and three record-binding holes (`answer.files`,
  `answer.setParams.backendNodeId`, read multiplicity) — all are battery coverage findings; the
  frozen counter still enforces each clause.
- **C1's own emitted limit block.** `show-replay-refused-strict` and `show-replay-need-floor`
  falsify the counter's `limit.sentence`/escape-minimum consistency at the replay boundary while
  the frozen battery stays green. This is instrument wording, not one of the claim's sentences.
- **C2 (four drift statements).** No survivor changes the live-gate path, so neither the verified
  after-leg (0 mismatches here) nor the declared before-leg (base `f16f992d`: 3 mismatches — not
  re-run by this seat) is affected by a survivor. Every statement weakening is killed by its
  isolated fixture. The selftest-mode survivors (`wantRed` dropped/any-loosened, `claims` loosened,
  always-exit-0) show the isolated mode's **assertion strength** is unwitnessed — the frozen
  detector only requires exit 0, so a weakened or permanently-green selftest survives. The
  swept-tally fixture survivor shows the “swept tally” witness is not isolated (six absent
  sections also make the statement red).
- No survivor justifies changing a predicate, counter, pin, prior, threshold or kill rule; they
  are routed as calibration findings only.

## E. Harness note and restoration

Under the first 5-way parallel battery run, 5 of 26 children were terminated by a signal with no
output (spawn pressure); all 5 were rerun serially and produced deterministic outcomes
(2 killed, 3 survived), and a second 3-way evidence run reproduced all 26 outcomes. No instrument
mutant crashed.

Lane bytes: at sweep start the lane's instrument files hashed to the freeze pins above
(`3224747…` counter, `9c2bff42…` battery, `3953e34…` drift gate), and the scratch copies scored
here are byte-identical to those pins. **During the sweep other seats modified the lane scripts**:
at capture time `scripts/check-showpicker-round88.mjs` = `282eeb28…`, `scripts/negatives-showpicker-round88.mjs`
= `e549eba7…`, `scripts/check-record-drift-r88.mjs` = `b755d513…`, `scripts/kill-power-round88.mjs`
= `7f546f0c…` (git status `M`, four files, diffs not authored by this seat). Those new bytes are not what
this sweep scored and its results do not bind them; re-verification against the moving lane is the
integration owner's call. One observed diff — the drift gate's selftest now requires all four
`wantRed` ids and checks the red reasons (`round-44-has-10`, `staleHolds=true`) — would address two
of the survivors above if re-run, but that was not verified here.

This seat wrote no lane byte other than this report: no `edit`/`write` touched `scripts/**` or any
record, no mutating git/jj command was run, and no file was written outside the seat scratch and
this report. Scratch `/fast/scratch/hyaku/tabi-r88/R88Mut1` (instruments, fixtures, mutants, probe
receipts, results) was removed after the summary above was captured.

