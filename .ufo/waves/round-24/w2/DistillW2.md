# DistillW2 — wave-2 dedupe → integration checklist (tabi round 24)

Seat: `L1Tabi24.DistillW2`. Read-only. Tip attacked: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`;
baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`. `TMPDIR=/home/vgpnk/tmp-tabi24` for every node run.

**Cutoff / inventory.** At start of my run: 0 reports. At cutoff: **31 of 32 peer reports landed**
(31 peer reports + this file; `w2/RevUnlandedResolution.md` absent — its scope, routed-defect-2
composition, is represented below only by the sibling findings that overlap it). Reports read: all 31
(heading+skeleton extraction over every file; full reads of CritC1Verdict, RevReceipts; targeted full
sections of RevSelfAssessmentCode, RevCensusEnd, RevScratchDeletion, CritC2Verdict, RevCorrectionsBlock,
CritBaselineArm, RevLesson, SimplGates, RevGateRegistryCode).

**Cluster accounting.** ~220 discrete labelled findings across the 31 reports (26 numbered in
RevSelfAssessmentCode alone, 15 mutants in MutGateRegistryRows, 9 in RevGateRegistryCode) →
**64 distinct actionable clusters** below (P0 6, P1 31, P2 20, P3 7); **12 duplicate groups** absorb
≥3 reports each; **6 contradictions** (§2).

## 1. Ground truth I re-derived (not trusted from any report)

Committed gate bytes extracted to `scratch/DistillW2/tipbytes/{reg,sa}.mjs`
(`git show ad125e8:scripts/…`; blobs `4aa6ec1…`, `740b9dc…`), run with `--repo <lane>` so the
worktree's uncommitted edits are excluded:

| Measurement | Command | Result |
|---|---|---|
| C1 baseline | `reg.mjs --repo <lane> --rev 573c99e --json` | `gates=12 nonconformant=3` exit 1 (check-adjacency, check-measurement-binding, round-evidence-audit) |
| C1 tip | `reg.mjs --repo <lane> --rev ad125e8 --json` | `gates=14 nonconformant=0 rows=23` exit **0** |
| C2 baseline | `sa.mjs --repo <lane> --rev 573c99e --json` | `mismatches=5` exit 1 (m1 :410 25→26; :1138/:1139/:1151 12→13; m3) |
| C2 tip | `sa.mjs --repo <lane> --rev ad125e8 --json` | `mismatches=1 cne=79 sup=5` exit **1** |
| C3 | `git grep -lE '^source: S10[45] ' ad125e8 -- corpus/knowledge \| wc -l` | **1** |
| S105 bytes | `wc -c corpus/evidence/round-24/sources/page.pdl`; `61911/3*4` | **61911**; **82548** = base64 envelope |
| Gate universe | `reg.mjs` gate names vs `grep -n "Name / kind" SKILL.md` | 14 measured; `check-isolation` (`SKILL.md:2101`), `check-wave` (`:2244`) registered in `Name / kind` tables (`:2096`, `:2241`) and **absent** from the 14 |
| Corrections rewrite | `git show b973fde -- SCORECARD.md` | 3 lines of the block rewritten (`25 cases`→`twenty-five`, `12/12`→`twelve-of-twelve`, `eight isolated CLI cases`→`eight`) |
| Control receipt | `ls .ufo/waves/round-24/control`; `git ls-tree -r ad125e8 \| grep -c round-24/control` | absent on disk; **0** in git |
| C3 control's named check | `grep -c quote scripts/check-sources.mjs` | **0** — no per-row quote check exists |
| m3 ambient value | `git status --porcelain -uall \| wc -l` during my run | 46 (receipt recorded 4) |

Net: **C1 confirmed (3→0). C2 falsified (5→1, exit 1, no committed receipt anywhere records 0). C3
metric true (1), failure-capability false.**

## 2. Contradictions between reports (with resolution)

| # | Contradiction | Sides | Resolution |
|---|---|---|---|
| X1 | C2 baseline = 4 or 5 | 5: RevReceipts F2, RevScorecardDisposition F2, RevLogEntry F4, RevWaves X1, RevLesson MED-3, CritC2Verdict §8 · 4: CritC2Verdict §5 ("true count of distinct stale facts is 4 … which is what frozen `before: 4` happened to say") | **Both true under different conventions.** Per-line counter = **5** (verified). Distinct stale *facts* = 4 if `:1138`/`:1139` (one wrapped sentence) merge. The frozen declaration's decomposition ("three 12/12 figures + one m3") omits `:410` under *either* convention → declaration is wrong; `revisions: []` at tip. |
| X2 | S104 stability | RevEntryBfcache F2 (claim "quoted spans are dated, not stable" contradicted; retained diff = 4 lines, a `<script nonce>`) · RevWaves X3, CritC3Verdict F4 (digest differs across same-round fetches) | **Compatible.** Digest differs (per-request nonce); content differs by 4 lines. "Not stable" overstates; "digest is not reproducible" is the accurate statement. |
| X3 | C1 verdict | CritC1Verdict ("0 by luck of wording", universe incomplete) · ExecReDerive / RevReceipts / RevGateRegistryCode / MutGateRegistryRows ("CONFIRMED") | **No numeric dispute.** 3→0 reproduces on committed bytes (verified). Dispute is scope, not count: C1-P1-1 below. |
| X4 | C3 verdict | ExecReDerive ("CONFIRMED", one prose defect) · CritC3Verdict ("letter not spirit; control not failure-capable") | **Compatible.** Metric = 1 (verified). The claim's *control* is unimplemented (verified `grep quote` → 0). |
| X5 | m3 observed value | receipt 4 · seats 5/6/8/29 · mine 46 | **Not a contradiction** — the value is ambient (C2-P0-2). Drift itself is the evidence. |
| X6 | Lesson 66 vs 67 | RevScorecardDisposition F3 (66 vs 67 inconsistent) · RevLesson LOW-2 ("live file already says 67") | **Worktree drift.** Tip blob (`git show ad125e8:corpus/lessons/round-24.md:86`) says **66**; worktree now says "follows the verifier's own classification". Tip is the 66-vs-67 inconsistency. |

## 3. Integration checklist (ranked: does it block a claim's admission?)

Legend: **P0** blocks admission as declared · **P1** committed prose/receipt false, counted metric
survives · **P2** instrument weakness (weakens capability framing, not the count) · **P3** hygiene.
`DUP` = absorbed duplicates. `[WT]` = already addressed by the uncommitted worktree diff (do not redo).

### P0 — blocks admission

| ID | Finding (one line) | Sources (dedup) | Blocks |
|---|---|---|---|
| C2-P0-1 | C2 `after: 0` is false: committed tip bytes return `mismatches=1`, exit 1; no committed receipt records 0 (`c2-tip.json` and `c2-measurements.json` both say 1 at `b973fde`). | RevReceipts F1 · CritC2Verdict §"after-value" · RevScorecardDisposition F1 · RevNoHarmDiff F1 · ExecReDerive C2 · LabIsolation2 F1 · RevLogEntry F1 · MutSelfAssessmentClasses F1 · RevSelfAssessmentCode S1.1 · CritSupersessionGaming §5.1 · RevCorrectionsBlock F1 · RevFrontierRows F1 · RevLesson HIGH-1 · SimplGates F1 · ConnInterface 3.1 · **DistillW2 §1** (15 peer reports + this file) | **C2 admission** |
| C2-P0-2 | `m3Findings` runs `git status --porcelain -uall` on the **live worktree** for every `--rev`; `--rev` is not a function of the revision, and `claimed:"landed"` is a constant. | RevReceipts F3 · RevNoHarmDiff F2 · CritC2Verdict §1 · RevSelfAssessmentCode #8 · ConnInterface 3.1 · LabIsolation2 F2 · CritBaselineArm §4 · RevLesson HIGH-1 · SimplGates F1 · RevScorecardDisposition F1 (10) | **C2 admission** (mechanism of C2-P0-1) |
| C3-P0-1 | C3's counting command is a file-presence proxy: a 6-line stub scores 1, and `check-sources.mjs` returns `findings=0` on it. | CritC3Verdict F1 · CritC3Verdict F8 · ExecReDerive C3 (2) | **C3 failure-capability** |
| C3-P0-2 | C3's declared control ("the Gate's per-row quote check fails on it") names a check that does not exist — `grep -c quote scripts/check-sources.mjs` → 0 (verified). | CritC3Verdict F2 · **DistillW2 §1** | **C3 control claim** |
| C1-P0-1 | Empty/unparseable universe reports `clean` — no minimum-gate assertion (`gates=0 → clean, exit 0`), against the killRule "cannot decide ⇒ nonconformant". | RevGateRegistryCode F2 | **C1 killRule compliance** |
| C1C2-P0-1 | The control receipt both claims cite (`.ufo/waves/round-24/control/control-receipt.json`) does not exist on disk or in git (verified). | RevReceipts F6 · RevNoHarmDiff F3 · RevSelfAssessmentCode #21 · **DistillW2 §1** | **C1+C2 evidence pointer** |

### P1 — committed artifacts false; counted metric survives

| ID | Finding | Sources (dedup) | Affects |
|---|---|---|---|
| C2-P1-1 | Frozen `claims.json` C2 `before: 4` vs measured 5; `revisions: []` at tip (see X1). | RevReceipts F2 · CritC2Verdict §8 · RevScorecardDisposition F2 · RevLogEntry F4 · RevWaves X1 · RevLesson MED-3 · CritSupersessionGaming §5.1 · LabIsolation2 F1 (8) | C2 before-arm |
| C2-P1-2 | C2 declared before-arm text ("one unlanded-path mismatch over **89** porcelain paths") misdescribes m3 (live count, not 89). | RevReceipts F2 · CritC2Verdict §8 | C2 before-arm |
| C2-P1-3 | Both "tip" receipts are pinned to `b973fde`, not the tip; SCORECARD says "measured against the tip commit". | RevReceipts F5 · RevScorecardDisposition F1 · ExecReDerive | C1+C2 receipts |
| C2-P1-4 | SCORECARD "5 → 0 … tip counts none" and LOG "5 → 0" are false at tip (verified: exit 1). | RevScorecardDisposition F1 · RevCorrectionsBlock F1 · RevLogEntry F1 · RevFrontierRows F1 · RevLesson HIGH-1 | C2 disposition |
| C2-P1-5 | SCORECARD:1255 and lesson "`git status --porcelain` empty at the round-24 tip" false (tip tree dirty; 46 paths during my run). | RevReceipts F8 · RevNoHarmDiff F2 · RevLesson HIGH-1 · RevScorecardDisposition F3 | routed defect 2 |
| C2-P1-6 | The corrections block is labelled append-only but `b973fde` rewrote 3 of its lines, converting parseable digits (`25 cases`, `12/12`, `eight isolated CLI cases`) into words — i.e. the rewrite removed exactly the forms the counter reads (verified by `git show b973fde -- SCORECARD.md`). | RevCorrectionsBlock F2 · **DistillW2 §1** | C2 mechanism integrity |
| C3-P1-1 | S105 anchor says "82548 bytes decoded"; committed body is 61911 (82548 = base64 envelope). Propagated to `SOURCES.md:120`, entry `:4`, `corpus/lessons/round-24.md:16`. | CritC3Verdict F3 · RevEntryBfcache F1 · RevCensusEnd F1 · RevSourcesRows F2 · RevNoHarmDiff F5 · RevFrontierRows F4 · RevLesson MED-2 · RevScorecardDisposition F4 · ScoutReopenS105 F1 · **DistillW2 §1** (9 peer reports + this file) | C3 row truth |
| C3-P1-2 | S104 anchor cites `§"What is the back/forward cache?"`; no such heading exists (nearest `<h2 id="basics">`). | CritC3Verdict F5 | C3 row truth |
| C3-P1-3 | S104/S105 rows sit **outside** the registry table (blank line at `SOURCES.md:118` closes it) → they render as a literal pipe paragraph. | RevSourcesRows F1 | C3 row form |
| C3-P1-4 | Located quotes are de-marked-up, not byte-present (`<em>` / `don&#39;t`); entry §2 gives S105 no located quote. | CritC3Verdict F6 · RevSourcesRows F3 · RevNoHarmDiff F6 · RevLesson MED-2 | C3 quote discipline |
| C3-P1-5 | Entry asserts S104 supports "scroll position and form values survive"; `grep -ic scroll` on the committed page → only nav markup. | RevEntryBfcache F3 | C3 entry claims |
| C3-P1-6 | Decision row 3 needs `notRestoredExplanations` only; PDL's optional `notRestoredExplanationsTree` (`:1715`) omitted everywhere. | RevEntryBfcache F4 | C3 actionability |
| C3-P1-7 | PDL caveats dropped: "Do not assume any ordering with `Page.frameNavigated`", main-frame non-same-document scope. | RevEntryBfcache F5 | C3 markers |
| C3-P1-8 | §4.2 "must drop `--disable-back-forward-cache`" is not actionable — the flag is a Playwright default in the retained bundle. | RevEntryBfcache F6 | C3 actionability |
| C3-P1-9 | `corpus/README.md:575` says 42 knowledge notes; tree holds 43. | RevEntryBfcache F7 | C3 admission hygiene |
| C1-P1-1 | "This block restates the lane's **whole gate set**" is false: `check-isolation` and `check-wave` are registered in `Name / kind` tables the parser cannot read and are absent from the 14 (verified). | CritC1Verdict F1 · RevRegistryRestatement F3 · RevFrontierRows F5 · RevGateRegistryCode F2/F3 · **DistillW2 §1** (4 peer reports + this file) | C1 prose + scope |
| C1-P1-2 | `adjacency-map` row's pinned path is wrong: says `corpus/knowledge/`; the gate's `MAP_PATH` is `corpus/adjacency.tsv`. | RevRegistryRestatement F1 | C1 row truth |
| C1-P1-3 | Rows 9-11 pin **output receipts** the gates never read (`grep -n corpus/evidence scripts/round-evidence-audit.mjs` → nothing). | RevRegistryRestatement F4 | C1 row truth |
| C1-P1-4 | `measurement-binding` supersession drops the helper-only selftest disclosure (PROTOCOL §Self-test warns against it). | RevRegistryRestatement F5 | C1 row truth |
| C1-P1-5 | C1's frozen before is the literal placeholder "N"; 3 was substituted later. | RevScorecardDisposition F7 | C1 before-arm |
| C1C2-P1-1 | Both new rows declare 0/1/2 while a failing `--selftest` exits **3** (`check-gate-registry.mjs:439`, `check-selfassessment.mjs:550`), violating PROTOCOL §Verdict and both scripts' own headers. | RevRegistryRestatement F2 · LabIsolation2 F4 · RevGateRegistryCode F5 · ConnInterface 3.2 · RevSelfAssessmentCode #29 (5) | C1+C2 row truth |
| M5-P1-1 | M5 closure overstated: `9e52cb2` deletes 1,035 paths, one out-of-prefix (`D .ufo/waves/round-23/w2-record.err`), undisclosed. | RevScratchDeletion F1 · RevLesson LOW-2 | routed defect 3 |
| M5-P1-2 | "every round-23 document that cites a scratch path still resolves" is falsified by 4 cited paths never committed on master. | RevScratchDeletion F2 · RevNoHarmDiff F4 | routed defect 3 |
| M5-P1-3 | 20 committed round-24 citations point at never-committed (now uncommittable) `round-24/scratch/` paths. | RevNoHarmDiff F4 · RevScratchDeletion F4 | routed defect 3 |
| D2-P1-1 | Defect-2 composition is internally inconsistent and unverifiable: SCORECARD 66 empty numeric files vs lesson 67; 66+4+2+1 = 73 < 89; mirror named only in the lesson; tip blob says 66 (verified). | RevScorecardDisposition F3 · RevLesson LOW-2 · **DistillW2 §2/X6** | routed defect 2 |
| PROSE-P1-1 | QUALITY 64/65: 64's first sentence self-contradicts (rows do feed the universe); 65's clean-tree clause prescribes the input that makes m3 score zero; 65 cites defect 2 with an instrument that cannot observe a past tree; `#m1` anchor misassigned; no `Refines`/`Supersedes` marker. | RevQualityCriteria F1-F7 | QUALITY append |
| PROSE-P1-2 | Lesson defects: id-collision claim contradicted by its own cited artifacts (S104/S105 are *staged* in shokuknow with different sources; `next-free-ids.txt` starts at S250); M1's "31 mismatches / 24 superseded" reproduces at no revision; `grep -c 'CASE'` → 4 not 13; census path is fleet-root, not lane. | RevLesson HIGH-2, MED-1, MED-4, LOW-1 | lesson |
| PROSE-P1-3 | Frontier row 3 "held" contradicts its own pointer (`c2-measurements.json` after = 1); row 1's universal "probes launched with `--disable-back-forward-cache`" is false for 1 of 141 committed argv arrays; row 3's "held" hides 79/93 unevaluable. | RevFrontierRows F1, F2, F3 | frontier block |
| PROSE-P1-4 | LOG: `16fa92f`'s commit subject describes a different change than its diff. | RevLogEntry F7 | LOG entry |
| PROSE-P1-5 | Corrections block: `:1199`'s `cli_cases=36` is invisible to the counter (underscore breaks `\bcases\s*=`), so "the supersession is mechanical" is vacuous for that line; `baselineClasses: 6` misquotes an array as a scalar. | RevCorrectionsBlock F4, F5 | corrections block |
| ENV-P1-1 | `check-adjacency.mjs --self-test` is red on this host (`git-failed` → `map_unreadable`), so the "cases=57, reasons=18" figure quoted in the corrections block omits a failed verdict and 5 CNE. | RevScorecardDisposition F5 · RevCorrectionsBlock F3 · CritC1Verdict context note | corrections block |

### P2 — instrument weakness (count stands; capability framing weakens)

| ID | Finding | Sources (dedup) |
|---|---|---|
| C1-P2-1 | Field predicates are shape checks, not truth checks: fabricated entry flags, absent pinned paths, non-parsing scripts and a 3-char name all score conformant; `kind` is effectively dead. | CritC1Verdict F2 · MutGateRegistryRows Tier A-D · RevRegistryRestatement F6 · ConnInterface 3.3 · RevGateRegistryCode F4 (5) |
| C1-P2-2 | Row↔gate binding is by script *mention*, not name: one row can vouch for N gates, and 5 of 10 `scripts/` gates are certified by alias-named rows. | CritC1Verdict F3 · RevGateRegistryCode F3 · MutGateRegistryRows d2/d3 (3) |
| C1-P2-3 | `e1-missing-row` conflates "no row" with "row the parser refused" — count right, diagnosis false. | CritC1Verdict F4 · RevGateRegistryCode F7 (2) |
| C1-P2-4 | Parser robustness: `splitCells` silently drops/accepts cells; `main()` runs on import (killing the `evaluate` export); `$PWD`-prefixed tokens manufacture phantom gates; verdict-map predicate rejects lawful `0 evaluated` maps. | RevGateRegistryCode F6/F8/F9 · CritC1Verdict F5 (3) |
| C1C2-P2-1 | Security surface: `--repo` unvalidated (read escape + code exec), repo-local `core.fsmonitor` exec, PATH-resolved `git`/`node`, inherited `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/`NODE_OPTIONS`, no subprocess timeout. | SentGateExec R1-R4, R6 · RevGateRegistryCode F1 (2) |
| C1C2-P2-2 | "Write scope: stdout/stderr only" is false — `git status` rewrites `.git/index` (no `--no-optional-locks`). | SentGateExec R5 · RevSelfAssessmentCode #12 (2) |
| C2-P2-1 | m1 oracle compares the printed tally only: gate exit/`verdict`/`passed` unread, so a **red** self-test reads as a match; first `cases=` anywhere wins. | LabIsolation2 F3 · RevSelfAssessmentCode #16 (2) |
| C2-P2-2 | m1 association/pattern defects: first-claim cross-product, flag sniffed from comments, fenced `## ` splits sections, prose "4 cases" false positive, `selftest 12/12` false negative. | RevSelfAssessmentCode #13/#14/#15/#17 (1) |
| C2-P2-3 | Supersession launders stale figures (any later correct line clears earlier mentions) — `[WT]` hardened. | CritSupersessionGaming · RevSelfAssessmentCode #18 · CritC2Verdict §3 (3) |
| C2-P2-4 | m2 is a null class undisclosed: 75-76 findings, **1** decidable in the whole corpus, 0 counted. | CritC2Verdict §6 · RevScorecardDisposition F6 · RevSelfAssessmentCode #20 · ConnInterface 3.5 · RevFrontierRows F3 · LabIsolation2 F7 (6) |
| C2-P2-5 | m2 grammar/scope defects: `-C` parsed then discarded, sweep limited to `corpus/evidence/**`, string `exit` silently dropped, no dedupe by (command,exit), `line: null` everywhere. | RevSelfAssessmentCode #19/#21/#22/#23/#24 (1) |
| C2-P2-6 | m3 fail-opens: `git status` non-zero ignored → clean; raw git calls bypass the hardened helper (global/`.git/info/exclude` hide dirt); brittle em-dash anchor; absent anchor → clean. | RevSelfAssessmentCode #9/#10/#11 (1) |
| C2-P2-7 | Crash paths exit 1 ("failed") where the honest code is 2; `clean` ignores every could-not-evaluate; unwritable TMPDIR exits 1. | RevSelfAssessmentCode #6/#7 · LabIsolation2 F5 (2) |
| C2-P2-8 | SHONEN.md declared in C2's scope but never read (`grep -c SHONEN` → 0). | RevReceipts F7 · CritC2Verdict §4 · RevSelfAssessmentCode #25 · ConnInterface 3.6 · RevCorrectionsBlock F6 (5) |
| C2-P2-9 | `couldNotEvaluate` rose 75 → 79 at tip: the four ambiguous associations are the round's **own** new-gate tallies (`:1232`,`:1233`,`:1243`,`:1249`). | RevReceipts F4 · CritC2Verdict §7 · LabIsolation2 F6 · RevSelfAssessmentCode #30 (4) |
| C2-P2-10 | The counter is not bound to its own bytes (executes the worktree copy, unlike the blob pin it applies to other gates). | CritC2Verdict §2 · RevSelfAssessmentCode #26 · MutGateRegistryRows (peer patch mid-run) (3) |
| C2-P2-11 | Decidable surface at tip is 14 of 93 findings (85% CNE). | LabIsolation2 F7 · RevFrontierRows F3 (2) |
| M5-P2-1 | Ignore rule is one level deep: `.ufo/waves/*/scratch/` does not cover `w2/scratch/`, a bare `scratch` file, `git add -f`, or `git checkout 573c99e -- …/scratch` (staged all 1,034). | RevScratchDeletion F3 (1) |
| IFACE-P2-1 | Interface divergence from siblings: self-test exit 3 undeclared, field predicates materially weaker than kotoba's, universe inflated by row-union, JSON lacks `of`/`phantom`/`conformant`. | ConnInterface §3.2-§3.7, §4 (1) |
| HYG-P2-1 | Stale self-test figures in both scripts' headers (15 vs 22; 10 vs 13; legacy "4 cases" template) — the m1 class outside m1's window. `[WT]` fixed. | CritC1Verdict F6 · RevQualityCriteria F5 · LabIsolation2 F6 · SimplGates §1 (4) |

### P3 — hygiene / notes (no claim impact)

| ID | Finding | Sources |
|---|---|---|
| C3-P3-1 | S104 scope's third clause ("what disqualifies a page") is unanchored; no SOURCES row names the retained evidence bytes; `## Search log` has no round-23/24 entry; census "only 2026-10-25 rows" is false literally (S102-S105), true for *new* rows. | RevSourcesRows F4/F5 · RevCensusEnd F2/F4/F3 |
| C3-P3-2 | `multi-step-journey.md:215-219` starts one bullet early (rule at `:217-219`). | RevEntryBfcache F8 |
| C1-P3-1 | Dead weight: `git()` opts param, `fieldOf` fallback index, unused `statSync`, unused `sections()` fields, unreachable `evaluate` export, duplicated `Refusal`/`parseArgs`/`resolveRev` (no shared library proposed). | SimplGates §1-§2 |
| WAVE-P3-1 | w1: `ScribeLesson` is a dead seat (spec/dispatch/registry present, no report, no reason recorded); `MutMismatchCounter` did not produce its demanded matrix; spec/dispatch divergence. | RevWaves §3/§4/§5 |
| DEF5-P3-1 | Routed defect 5: "does not reproduce" is honest for the literal field (`7ac9fff` changed it), but the disposition recasts a verifier misgrade as a lane pre-correction. | RevengerIntent §A/§B |
| ENV-P3-1 | `check-adjacency` selftest's `git-failed` case cannot pass under `TMPDIR=/home/vgpnk/tmp-tabi24` (inside the `/home/vgpnk` repo); 8+ leaked `tabi-adjacency-selftest-*` dirs accumulate. | CritC1Verdict context note · LabIsolation2 F8 |
| HAZARD-P3-1 | `SimplGates` ran `git stash` in the lane (contract-violating write) and its `stash pop` conflicted with a peer edit; it reports byte-exact restoration of `corpus/SOURCES.md` and the entry. Any measurement taken 05:56-06:0x may have read a stashed tree — treat observed m3 counts in that window as unreliable. | SimplGates §5 |
| DRIFT-P3-1 | At cutoff the worktree carries 11 modified tracked files (both gates, claims.json, SKILL.md, LOG, QUALITY, README, SOURCES, entry, lesson, .gitignore) — L1's in-flight response to wave 2. Any tip measurement must use `git show ad125e8:…`, not the worktree (see §1). | **DistillW2 observation** |

## 4. What the worktree already answers (don't duplicate)

`[WT]` clusters: C2-P2-3 (supersession now requires marker + `:line`), HYG-P2-1 (headers 22/13),
C2-P1-1's `revisions` entries (claims.json appended 4→5, C1.after clarification, C2.after note — see
CritBaselineArm §7), C3-P1-1 wording ("61911 decoded from a 82548-byte base64 transfer", per RevLesson
MED-2), D2-P1-1's 66→"follows the verifier's own classification". These are **uncommitted**; nothing in
§3 closes until they land and the committed receipts are re-measured at the landing tip.

## 5. Residual risk / gaps

- `w2/RevUnlandedResolution.md` absent at cutoff — routed-defect-2 composition is covered only
  obliquely (D2-P1-1, C2-P1-5); no seat verified the 89-path disposition end to end.
- My readings are skeleton-level for 25 of 31 reports (headings + first paragraphs + targeted
  sections); a finding stated only in a report's tail prose could be missing from §3. Full reads were
  done for the six reports whose findings decide admission.
- Dedupe counts report-level items; two reports can describe one defect at different granularity
  (e.g. C2-P2-1 and C2-P2-2 are distinct code paths in one function).
- I did not re-run any mutation fixture; mutant results are cited as observed by their seats.
- My own gate runs used the **committed** scripts via `--repo`, which is the correct pin for the
  measured bytes but means I did not exercise the worktree's hardened variant.
- No tool installs or upgrades were performed.

Report: .ufo/waves/round-24/w2/DistillW2.md
