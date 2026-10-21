# CriticNoHarm — round 20 no-new-refusal review (frozen USER lesson-history)

**Advisory outcome: CONDITIONAL. Not a canonical judgment.** Round 20 can avoid a new USER lesson-history refusal and leave every round-19 byte untouched, if rules R1–R8 hold. The current wave plan has defects that would either alter r19 registry rows or certify the refusal count from output that cannot show it (§5).

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` equals HEAD (verified).

**Amendment after TabiR20 IRC.** The S096 `used-by` objection is withdrawn: the SOURCES contract permits in-place `used-by` changes with an old→new audit in the round lesson. Anchor and teaches stay immutable, so S100 remains the only anchor route. Conditions were sent to TabiR20: same integration commit as round-20.md, audit inside round-20.md, S100 carries the LC11 anchor union, and measurement binding runs after registry edits.

## 1. Axes and scope

- Axes (`AXES`, USER gate:63): depth, coverage, operability, freshness, calibration, adjacency.
- Focus: **operability** (refusal set), **freshness** (committed bytes, pins), **calibration** (anchors, refusal semantics), **adjacency** (`SKILL.md:556` quote). Depth (0→12) is the claim under test and is not re-judged here.
- Read: `design.json`; `SKILL.md` (EOF, H2 structure); `corpus/README.md` (last H2); `corpus/QUALITY.md` (criteria 1–49); `corpus/evidence/round-20/sources/html_form_element.cc`; `scripts/check-user-round-contract.mjs`; `scripts/check-round-contract.mjs`; `scripts/check-sources.mjs`; `corpus/SOURCES.md`; `corpus/adjacency.tsv`; round-19 lesson, critic NH1–NH3 and L0 ruling; round-20 `w1` connector notes (treated as data).
- Not run: the USER gate and every other gate; no build, test or formatter. Git used read-only (`log`, `ls-tree`, `diff --name-status`, `show`, `cat-file`, `ls-files`, `rev-parse`). No commit, no index refresh, no writes other than this report.
- Tools installed or updated: none.

## 2. Frozen policy as implemented

- Constants: `HARD_BASELINE = 7f506af` (USER:12), `PSTACK_PIN = 92d700d` (USER:13). `7f506af` is an ancestor of `92d700d`. Production refuses any override (USER:385–387).
- **Lesson rule** `lessonDrift` (USER:330–342). A `round-N.md` present at baseline is frozen: any byte change refuses. A `round-N.md` absent at baseline is admitted only if its pin→HEAD status is `A`, it exists at HEAD, and `git log -m --diff-filter=MDRT 92d700d..HEAD -- <path>` is empty. `-m` diffs merges against each parent, so a merge carrying a different copy counts.
- **Drift scan** (USER:407–418). `git diff --name-status 92d700d HEAD -- PSTACK_PATHS` (USER:77–86), filtered by `pstackDrift` (USER:344–355). The refusal prints only `drifted[0]` (USER:418). Later drifted paths are invisible.
- **Protected loop** (USER:395–400): every protected path present at baseline (`round-1..10.md` here) must be byte-identical at HEAD.
- **APPEND_ONLY** (USER:76, checked at USER:401–406; ROUND:25, checked at ROUND:308–321): `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md`, `corpus/README.md`. Baseline bytes must remain a prefix at HEAD. `corpus/SOURCES.md` is in neither list.
- ROUND gate has the same APPEND_ONLY, a `protectedPath` for `round-N.md` (ROUND:168–169) and a census, but **no MDRT rule**. Round-N drift refusals come only from the USER gate.
- Selftests encode the rule: `future_lesson_allowed` exit 0 (USER:1279–1281); `future_lesson_mutated_after_commit` exit 1 `history_rewritten` (1282–1286); rename-from-pinned refused (1306–1308).

## 3. Current refusal set (derived from static git queries; gate not rerun)

- Lessons with M/D/R/T after pin: **`round-18.md`** (A `530f40a`; M `c0aff23`, `01531da`) and **`round-19.md`** (A `08e8173`; M `d5cf4d7`, `bf466e3`, `3a93382`). Last r19 touch: `3a93382`.
- `round-12..17.md` are A-only, so not refused. `round-N-verifier-spotcheck.md`, `user-*`, `training-*`, `kaika-*` are not LEGACY, so not frozen.
- `scripts/check-round-contract.mjs` (in PSTACK_PATHS, sorts after the printed path, so it could have been masked): HEAD blob `8272d03f` = sha256 `1579a794` = `ROUND_SCRIPT_CURRENT`. Pin is prior `7d403cee`. History `6f9eddc7`, `8478cd43`, `8a573b4e`, `1579a794` is all accepted. **Not drifted.**
- `SHONEN.md` is M since pin but sorts before the printed path, so it is not drifted [ordering inference].
- All six APPEND_ONLY prefixes hold at HEAD. `round-1..10.md` unchanged.
- **Refused set = {`corpus/lessons/round-18.md`, `corpus/lessons/round-19.md`}, size 2.** Matches the L0 ruling and NH1 (B=1, R=2).

## 4. Rules that keep the set at 2 without touching r19

- **R1. `round-20.md` lands once, final, in one commit.** No checkpoint copy on any branch in `92d700d..HEAD`, including merges and clone branches. Nothing later may touch it. It must not cite its own commit hash. `round-20.md` sorts after `round-19.md`, so a round-20 drift would be masked behind `round-18.md` in the printed message.
- **R2. Corrections go to append-only blocks or new non-LEGACY files.** Author-side corrections: append to `LOG.md`, `SCORECARD.md`, `corpus/README.md`, or `corpus/QUALITY.md` (APPEND_ONLY, EOF). Non-author verifier output: `corpus/lessons/round-20-verifier-spotcheck.md`, authored by a non-lane seat (adjacency's ruling venue requires non-lane authorship). Do not rename or delete a lesson to escape `^corpus/lessons/round-\d+\.md$` (NH1 correction).
- **R3. Zero edits to:** `round-1..19.md`; `scripts/check-round-contract.mjs`; `scripts/check-freshness.mjs`; `scripts/pstack-{seat,aggregate}.mjs`; `SHONEN.md`; `corpus/evidence/pstack-20261015/**`; `reports/pstack-*`; `corpus/lessons/pstack-*`. Do not import clone copies of these: `clones/ScribeLifecycle` is a full baseline copy with its own `corpus/lessons/`, `scripts/`, `SHONEN.md`, and the other clones are sparse. Import only named output files. `scripts/check-user-round-contract.mjs` is not in PSTACK_PATHS and production never pins its own bytes (`USER_SCRIPT` appears only in witness/diagnostic code, USER:885–1046), so editing it would not itself be refused. It stays out of scope under the L0 ruling.
- **R4. Append-only files take EOF additions only, with a new H2 wrapper.** `SKILL.md` EOF is line 2197; its last H2 is `## Round 19 …` (SKILL:2038). Add `## Round 20 — …` before the declared H3 `### Declarative WebMCP completion lifecycle — source-scoped (round 20)` (text exact), or the H3 nests under round 19's block for any outline reader. Same for `corpus/README.md`: last H2 is `## Round 19 …` at line 401. New QUALITY criteria go after 49. Re-derive any count line at commit time (QUALITY 34/43).
- **R5. Do not edit any r19 registry row except the S096 `used-by` cell.** Keep `S078` (SOURCES:92) byte-identical and `S096` (SOURCES:110) byte-identical except its `used-by` cell, which may take the note path in place (CORPUS.md:116-118; SOURCES-CONTRACT-v1.md:49-51), logged old→new in round-20.md. Mint a supersession row **S100** inserted after `S099` (line 113), before the blank line and `## Paths` (115). Its `teaches` must begin `supersedes S096` (E04 exemption, check-sources:296-297). Its `used-by` must name a path that contains the token `S100` (inspectUsedBy:231-233). The round-20 note cites `S100`. Anchor and teaches stay immutable.
- **R6. Commit the source bytes before anything cites them.** `corpus/evidence/round-20/sources/html_form_element.cc` is untracked (`git ls-files` count 0). sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` matches S096 and `design.json` `source.sha256`. 1740 lines.
- **R7. Measurement order.** Finalize counted inputs (SKILL, SOURCES, decisions manifest, source, counter) → measure → binding with `--reproduce` at the delivered HEAD → lesson commit last. The lesson must not be a declared input. [INFERENCE: depends on the counter's declared inputs; `.ufo/waves/round-20/measure-c1.mjs` does not exist at HEAD.]
- **R8. Verify no-growth by committed enumeration, not gate output.** The USER gate prints one path, so `exit 1` with first path `round-18.md` cannot certify a count of 2. Commit a receipt at the final HEAD that applies the same predicates (extract `lessonDrift`/`pstackDrift` verbatim, as NH1 did). Expected drift set is exactly `{corpus/lessons/round-18.md, corpus/lessons/round-19.md}`. `git log -m --diff-filter=MDRT -- corpus/lessons/round-20.md` must be empty.

## 5. Defects in the current wave plan

- **D1. LC11 anchor gap (verified by arithmetic).** S096 anchor `html_form_element.cc:174-328,729-758,818-842` (SOURCES:110) leaves **759–817** uncovered. LC11 span `787-815` (design) falls inside. Narrowing LC11 to `807-813` (ScribeChecklist) does not close it. ConnPlanner §4.2(2) and §7(3) and ConnSibling §4.1(1) would edit S096's anchor in place. **Reject:** the anchor is immutable under the contract, and the edit would alter an r19 row. ScribeGate F3's `used-by` append is accepted under R5. Use S100 with the exact union `html_form_element.cc:174-328,729-758,787-815,818-842`. Open: the counter's registry checks (`missing source registry backlink`, ExecFixtures) are not yet written. If it checks spans against the S096 cell only, it must accept S100 for LC11. That is a counter change, not a gate change.
- **D2. ConnPlanner Receipt 2 (§4.3) and step 4 (§7.4)** require the USER gate to show "exactly the 2 baseline refusals". It prints one path. Replace with R8.
- **D3. ConnPlanner Receipt 3 (§4.3)** requires "zero added source rows". S100 adds one. Revise the receipt and disclose the row count.
- **D4. ScribeFrontier F2 (QUALITY 33 superseded marker on S078)** would edit an r19 row. **Reject.** S096's `teaches` already begins `supersedes S078`, and S100 carries the same explicit supersession.
- **D5. ConnPlanner §6 Risk 2 is correct** (`round-20.md` once). Keep it. Add R1's no-checkpoint and no-clone-copy clauses.
- **D6. Untracked source (R6).** Confirmed (ScribeGate F1, ScribeLifecycle §Current state).
- **D7. LC11 span precision** (ScribeChecklist: operative branch 807–813). Calibration-neutral for every gate. Optional.

## 6. Axis ledger (keep moves that improve an axis and harm none)

| Move | Axes affected | Verdict |
|---|---|---|
| `round-20.md` written once, last (R1) | operability ↑ (no new refusal); others neutral | KEEP |
| Author corrections to LOG/SCORECARD/README/QUALITY EOF (R2) | operability ↑, calibration ↑ | KEEP |
| Non-author output to `round-20-verifier-spotcheck.md` (R2) | operability ↑, calibration ↑ (non-lane venue) | KEEP |
| EOF appends with H2 wrappers (R4) | operability ↑, adjacency ↑ (`SKILL.md:556` stable) | KEEP |
| Commit source bytes before citing (R6) | freshness ↑ (QUALITY 28) | KEEP |
| S100 supersession row, exact anchor union (R5) | freshness ↑, calibration ↑ (LC11 pointer); coverage neutral, no diversity credit; r19 untouched | KEEP, conditional on counter check (D1) |
| Enumeration receipt (R8) | operability ↑ (catches masked growth), calibration ↑ | KEEP |
| QUALITY 50+ criterion codifying R1–R3, R8 (EOF) | operability ↑, calibration ↑ | KEEP (optional) |
| In-place S096 anchor expansion (ConnPlanner §7(3)) | calibration ↑ but alters r19 row | REJECT |
| In-place S096 `used-by` append (ScribeGate F3) | freshness ↑; contract-permitted (CORPUS.md:116-118; SOURCES-CONTRACT-v1.md:49-51); anchor and teaches untouched | KEEP: same integration commit as round-20.md, old→new audit inside round-20.md |
| S078 superseded marker (ScribeFrontier F2) | calibration ↑ but alters r19 row | REJECT |
| Edit USER gate to print all drifted paths | operability ↑ but out of scope; L0 forbids gate edits | REJECT |
| Defer round-20 lesson (QUALITY 10 deferral) | gains nothing; a deferral is a scope reduction | REJECT without explicit approval |
| Checkpoint `round-20.md` then amend or squash | creates M events or hides them | REJECT |
| Rename lesson to escape `round-\d+\.md` | evades predicate (NH1) | REJECT |
| Narrow LC11 to 807–813 | no gate or axis gain | NEUTRAL (optional) |

## 7. Untested and unknown

- No gate run. The production USER stderr at HEAD is derived, not observed.
- `measure-c1.mjs` absent; counter registry-backlink behavior unknown.
- `check-measurement-binding.mjs` internals not read.
- Peer claim that round-20's source copy is byte-identical to round-19's retained `.gz`: not verified here.
- jj: rewriting unlanded working-copy commits creates no M events in branch ancestry. Once landed, the path is frozen [INFERENCE].
- Not gate-refused but QUALITY-level: count lines must be re-derived at commit time (QUALITY 34/43).

## 8. Checks for main (once, after integration)

1. Enumeration receipt at final HEAD (R8): drift set equals the two r18/r19 paths; MDRT count for `round-20.md` is 0.
2. `node scripts/check-sources.mjs`: E04 exempt via `supersedes S096`; `S100` used-by token present; mined rows have used-by.
3. `node scripts/check-adjacency.mjs`: `SKILL.md:556` still matches.
4. `node scripts/check-round-contract.mjs`: APPEND_ONLY prefixes hold.
5. `node scripts/check-user-round-contract.mjs`: expect exit 1, first refused path still `round-18.md`. Not used as a count proof.
6. `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-20/measurement-binding.json --reproduce`.
7. `git ls-files corpus/evidence/round-20` non-empty before the note cites it.

Report: .ufo/waves/round-20/w1/CriticNoHarm.md
