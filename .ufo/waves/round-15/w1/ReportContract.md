# ReportContract — tabi round 15, wave 1 (scribe, read-only audit)

Author-side findings for L1. Not a certification, not a verifier record, not a gate result.
No gate, census, `measure.mjs`, selftest, test, suite, or browser was executed. No source,
registry, SHONEN, LOG, SCORECARD, or lesson file was edited. The only write is this file.

## 0. Method, boundaries, state

- Lane HEAD at audit: `7054a5e` (`round-14 verifier spot-check`). Baseline candidate for round 15: `7054a5e`.
- The working tree was **dirty and moving** during the audit (sibling seats). Snapshot at read time:
  - Tracked, modified: `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`,
    `scripts/check-aria-metadata.mjs`, `scripts/check-user-round-contract.mjs` (diffstat 6 files, +107/−16).
  - Untracked: `.ufo/waves/round-15/`, `corpus/evidence/round-15/`.
  - `SHONEN.md` unchanged vs HEAD.
- Reads performed: `.ufo/prompts/tabi-round-15.md` (§1–§6), `.ufo/reports/round-14/tabi.md`,
  `corpus/lessons/round-14.md`, `corpus/lessons/round-14-verifier-spotcheck.md`, `corpus/SOURCES.md`,
  `CORPUS.md` (SOURCES section), `LEARNING.md:28-46`, `MISSION.md:45-48`, `AXES.md:47-49`, `SHONEN.md`,
  `scripts/check-round-contract.mjs` (gate grammar), `scripts/sources-census.sh` (header only),
  `scripts/hyaku/fleet-commit.sh` (exists, executable), `.ufo/waves/round-15/w1/{spec,validation,swarm-registry}.json`,
  `SCORECARD.md` (round-14 block), `LOG.md`/`SCORECARD.md` grep for round-15 (none).
- One-off JSON read of `spec.json` to tally seat roles (reconnaissance, not a lane counter).
- Tools installed or updated by this seat: **none**. Read `/home/vgpnk/.omp/agent/RULES.md`; no install was needed.
- Peer messages: none. No finding is code-related, so nothing was routed to `MetadataEnforce` or `CounterDiagnostics`.
  Round-14 verifier routed items 1–4 are code/metadata-side and belong to those seats.

## 1. Axes named

1. Report-contract conformance: section order, required content, marker predicate.
2. Count-command and revision integrity: literal argv, baseline/measured commit binding, clean-tree binding.
3. Source frontier: SOURCES census, row provenance, frontier-step obligations.
4. Trend-verdict discipline: protocol vocabulary, no scalar, non-author gate for `discernment`.
5. SHONEN compliance: canonical boxes, evidence-line grammar, `[x]` never self-declared.

## 2. Required ordered report sections (canonical)

Source: `.ufo/prompts/tabi-round-15.md:99-125` (§4), with extras at `:238-239` (§6 item 6) and wave
accounting at `:186-189` (§6 item 2). Target path: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-15/tabi.md`
(fleet repo). **That file does not exist yet** (`.ufo/reports/round-15/` absent at audit).

| # | Heading (exact) | Required content | Marker predicate? |
|---|---|---|---|
| 1 | `## Work performed` | Opens by naming declared claims C1 operability and C2 calibration with axes; one bullet per item with path:line, command output, or commit hash. Includes `Stale-lane:` line and tool-install line (`Tools installed/updated this round: none` or tool/version/channel/reason). Records wave seat count and round total. | Yes |
| 2 | `## Landed changes` | Every change tied to a `LOG.md` entry and the commit hash that carries it. | Yes |
| 3 | `## Before → after measurements` | One per claim: literal counting command, baseline commit, measured commit, before value, after value, self-verdict. | Yes |
| 4 | `## Sources & frontier` | `SOURCES.md` rows before→after with counting command; rows added by tier; rows touched old→new; frontier rows advanced; census start/end output with exit codes. | No (`:123-125`) |
| 5 | `## Trend verdicts` | Exactly one verdict each for `expansion`, `quality`, `discernment` from `improved`/`harmed`/`unchanged`/`unprovable-but-better`, with evidence; **no scalar**. | No (`:123-125`) |
| 6 | `## SHONEN` | One line per canonical box; `[x]` only with named non-author verifier; `[~]` with resolvable evidence pointer. | Yes |

Marker rule (`tabi-round-15.md:121-125`): contentless report, missing sections other than rows 4–5, or no evidence
pointers = round **failed**. Missing sections 4–5 are a minimum-content conformance defect only.

Extra items the report must carry (not sections, but required):

- Lane HEAD hash that the report cites (pushed). Report commit lands last (`:224-230`).
- Planner statement (see D9).
- Wave seat count and round total (`:186-189`).
- L0 question line, or explicit "no new question".
- Commit: `scripts/hyaku/fleet-commit.sh --as tabi -m "round-15: tabi report" -- .ufo/reports/round-15/tabi.md` (`:227-228`).

## 3. Current state snapshot (committed and working tree)

| Item | Observed | Anchor |
|---|---|---|
| Round-15 lesson | **absent** (`corpus/lessons/` has round-1..14 + verifier spot-checks only) | `corpus/lessons/` listing |
| Round-15 LOG / SCORECARD block | **absent** (grep for `Round 15`/`round-15` finds only wave metadata) | `LOG.md`, `SCORECARD.md` (round-14 block at `SCORECARD.md:591`) |
| Round-15 fleet report | **absent** | `.ufo/reports/round-15/` not present |
| Start census artifact | **absent** (round-14 had `.ufo/waves/round-14/before.json`; round-15 wave dir has none) | `.ufo/waves/round-15/` |
| SOURCES rows at HEAD | 29 (S001–S029) | `corpus/SOURCES.md:15-43` |
| Tier at HEAD | A23 / B4 / C2 (computed by reading the table; census not run) | rows S001–S029 col 4 |
| Status at HEAD | mined24 / queued3 (S020, S021, S022) / rejected2 (S026, S027) | col 9 |
| S029 row (working tree) | `used-by` now `corpus/lessons/round-14.md, corpus/lessons/round-15.md`; the round-15 file does not exist yet | `corpus/SOURCES.md:43` |
| Round-15 SOURCES search-log entry | **uncommitted** (count 1 working tree, 0 at HEAD) | `corpus/SOURCES.md` search log, after round-14 entries (≈:64) |
| Wave 1 | 64 spawn, 0 resume, 64 registry members; `resumeSends` empty; `validation.stderr.txt` empty | `.ufo/waves/round-15/w1/validation.json`, `swarm-registry.json` |

Wave role tally (from `spec.json` items): executor 3, revenger 5, scout 11, reviewer 18, critic 9,
sentinel 4, scribe 8, connector 6 = **64**. L2 floor (`tabi-round-15.md:84-92`): connector ≥1 (6), executor ≥3 (3, exact),
scribe ≥1 (8), scout ≥1 (11), reviewer ≥1 (18), critic ≥1 (9) — all met. Planner: **0 in spec**; campaign ruling
gives the planner seat to L1 (`spec.json` context: "L1 holds canonical planner seat").

## 4. Defects and risks

Severity: H = likely to fail the round or a required check if repeated; M = conformance defect; L = hygiene.

### D1 (H) Trend section carries scalars

- Precedent: `.ufo/reports/round-14/tabi.md:98-106` — "All-axis verdicts: depth unchanged8→8; coverage unchanged9→9; operability improved8→8; …" and "Saturation8/window3".
- Rule: `tabi-round-15.md:116-117` ("no scalar"); `LEARNING.md:28-29` ("no trend is a scalar").
- Fix: axis scalars go to `SCORECARD.md` only. The Trend table holds verdict + evidence per trend.
- Test: T2 below. Negative control: round-14 text must fail T2.

### D2 (H) `discernment: improved` self-asserted while the non-author sample was pending

- Precedent: round-14 report Trend table, `discernment | improved | … Current-round external admit/reject agreement remains pending`.
- Rule: `LEARNING.md:35` (`improved` only when the spot-check agrees on admits **and** rejects); `LEARNING.md:40-46`
  ("Self-assessed taste is not discernment"; non-author records `agree`/`disagree` in the round's lesson, at least one admit and one reject).
- Also: `SCORECARD.md:157` (the round-3 probation block) records `discernment | unchanged` with the reason "No outside non-author sample of both an admit and a reject" — a precedent for holding the verdict at `unchanged` until that sample exists.
- Fix: until the round-15 lesson holds a non-author agree/disagree record with ≥1 admit and ≥1 reject, `discernment` = `unchanged`
  (or `unprovable-but-better` only for an exploratory claim with a named non-author reviewer). Do not write `improved`.
- Mistakes candidate (for L1 `## Mistakes`): class `attribution`; evidence `.ufo/reports/round-14/tabi.md` Trend table vs `LEARNING.md:40-46`;
  captured-by `none` (round-14 gate did not check the verdict); fix as above. Counts as fixed only when T7 has a red control.

### D3 (H) Sources & frontier lacks the counting command and before/after cells

- Precedent: `.ufo/reports/round-14/tabi.md:60-96` gives "rows28→29; tiers A22→23/B4→4/C2→2; statuses …" but pairs no
  literal count command with each before/after value. The census block shows only end-state `tabi ok …` text.
- Rule: `tabi-round-15.md:111-115` ("with the counting command"); `:54-58` (census start and end, paste outputs and exit codes; exit 0 required at end).
- Fix: paste the CORPUS census commands (`CORPUS.md` §SOURCES census block: rows, malformed, tier histogram, status histogram, duplicates, enum, mined used-by)
  with the **baseline `7054a5e`** output and the **measured commit** output. Paste
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` start and end with exit codes.
  Exit semantics per `scripts/sources-census.sh` header: 0 clean/warnings, 1 E or overdue findings, 2 usage/missing registry.
- Test: T4.

### D4 (H) Count-command revisions: placeholder `REV`, wrong baseline, dirty tree

- Precedent: `.ufo/reports/round-14/tabi.md:39-58` used `node .ufo/waves/round-14/measure.mjs REV --claim C1` (placeholder in the pasted command) and baseline `bebe2ef`.
- Rule: `tabi-round-15.md:20-22` (paste the counting command, before and after) and `tabi-round-15.md:109-110` (each measurement names "the commit it was measured against").
- Gate grammar (the same shape the lane's round gate enforces; `scripts/check-round-contract.mjs` main loop ≈:601-612): the score command must name the measured
  commit exactly once in its revision operand, and replacing it with the baseline must reproduce the before command.
- Current risk: six tracked files are modified (D0 snapshot). Any count taken now measures uncommitted state and is not admissible as a
  before/after value. Commit first; then measure literal committed revisions.
- Fix: write the literal argv in the report (`node .ufo/waves/round-15/measure.mjs 7054a5e --claim C1`, with the measured commit substituted, no `REV`).
  Name the baseline explicitly. Record `git status --porcelain` empty at the measured commit.
- Test: T5. Negative control: a command containing the measured commit twice, a `REV` placeholder, or a dirty measured tree must fail.

### D5 (H) Frontier obligation: the sourced claim lacks a round-15 Gate record

- Rule: `tabi-round-15.md:70-74` (§2b.4: at least one claim rests on a `SOURCES.md` row opened **this round**, and the lesson cites that `S###`);
  `CORPUS.md` §SOURCES rule 1 (URL, access date, ≤25-word located quote recorded in `## Gate` for every new row) and rule 2 (status/recheck/used-by changes logged old→new in the lesson). The reopening of S029 is not a new row, but §2b.4 and rule 1's provenance intent both call for the round-15 reopening to be recorded in the lesson `## Gate`.
- Current state: S029's `opened` column is `2026-10-20` (round-14 reading, `SOURCES.md:43`). The round-15 reopening exists only as an **uncommitted** search-log line.
  Its `used-by` change to `corpus/lessons/round-15.md` (working tree) is not yet logged old→new in any lesson, and that lesson file does not exist.
- Risk: census E11 "used-by path missing on disk" fires until `corpus/lessons/round-15.md` exists (`scripts/sources-census.sh` header, E11).
- Fix: create `corpus/lessons/round-15.md` with `## Gate` containing the round-15 reopening of S029 (path `corpus/evidence/round-13/aria/receipt.json`,
  location `cleanup.server.perWorker[0].listeningAfter`, access date 2026-10-20, quote ≤25 words), the S029 `used-by` old→new line, and `## Mistakes`.
  Cite `S029` from the claim's evidence index or knowledge entry, as the round-14 verifier routed item 5 requires.
- Test: T6.

### D6 (M, judgment) S029 tier `A` is arguable

- `CORPUS.md` §SOURCES tier A lists "the lane's own re-runnable gate output". S029 is a retained historical receipt. Its own `teaches`
  cell says "not a new runtime observation", and re-deriving it would need the browser run that the round does not do.
- Options: (a) keep A and record in the round-15 Gate why it counts as re-derivable (pinned blob `837b33a3988ebeea7f6b4ef5c04698da88909a73`,
  receipt sha256 check); (b) reclassify to B with reason. Either way the change is logged old→new in the lesson.
- Owner: SourceS029 / SourceCuration seats decide. This audit does not decide. [INFERENCE on tier semantics, from the CORPUS text above.]

### D7 (M) `SOURCES.md` header is stale for S029

- `corpus/SOURCES.md:4-6`: "Every row below was opened in kaika fleet round-1 (2026-10-19)." False for S029 (opened 2026-10-20).
- The qualification already sits in the search log ("Registry preamble qualification (round14)"). The header is frozen text under the append-only rule
  (`CORPUS.md` §SOURCES rule 2); an in-place edit is not clearly sanctioned. Recommend: leave the header; keep the search-log qualification; name this in the report.
- Owner: L1 judgment.

### D8 (M) SHONEN lines, evidence grammar, gate compatibility

- Canonical boxes (`scripts/check-round-contract.mjs:14-19`):
  1. `SKILL.md contains real decision tables, error patterns, checklists, cited sources`
  2. `At least one end-to-end domain task executed and logged in LOG.md`
  3. `Instructions executable by an agent without oral context`
  4. `No cross-domain bleed (PROVINCE.md still accurate)`
- Gate facts: `checkShonenPolicy` (`:133-160`) requires the exact preamble, box order, `[x]`/`[~]`/`[ ]` marks, two-space evidence line, and for `[~]` a backticked path that is a committed regular blob at HEAD (`regularBlob`, `ls-tree HEAD`). `[x]` fails closed (`:150`).
- Current `SHONEN.md`: unchanged vs HEAD. All four evidence pointers are committed regular blobs at `7054a5e`: `SKILL.md`, `corpus/knowledge/multi-step-journey.md`, `corpus/knowledge/executor-test-sufficiency.md`, `PROVINCE.md` (100644 blobs, verified by `ls-tree HEAD`).
- Round-14 fleet report SHONEN lines paraphrase the box text and prefix paths with `tabi-shokunin/`. The lane's `checkReport` (`:498-510`) wants each box to be the **end** of a line starting `- [x~ ] `, but it is called only for pstack round ids (`:601`), so it does not check the fleet report today.
- Recommended line form for the fleet report (gate-compatible, still readable): `- [~] <evidence pointer and boundary prose> — <exact canonical box text>`. Never `[x]`.
- Inside `SHONEN.md`, evidence pointers stay lane-relative, backticked, committed at HEAD.
- Test: T3.

### D9 (M) Wave and planner accounting

- `spec.json` has 0 planner items while the L2 floor lists one (`tabi-round-15.md:84-92`). Campaign §6 gives the planner seat to L1 (`spec.json` context).
- Fix: the report states "planner: L1 canonical seat; no planner spawn" and gives wave 1 = 64 seats with the role tally above, round total 64.
  Wave 2 status must be stated as dispatched or not dispatched. Do not invent a count.

### D10 (M) Start census not recorded for round 15

- `tabi-round-15.md:54-58` requires start output and exit code. No `before.json` (or equivalent) exists under `.ufo/waves/round-15/`. The start census was not captured before wave 1 wrote files.
- Fix: record the omission honestly as a conformance defect in `## Sources & frontier`. Do not back-date a start record. Run the start-equivalent census at the baseline commit only if L1 judges it useful, and label it as taken after the fact.

### D11 (L) Report location and gate-path conflict

- Fleet path `.ufo/reports/round-15/tabi.md` (prompt) vs lane-local `reports/<id>.md` with `lane-commit:` line (`scripts/check-round-contract.mjs:499-502`).
  Already flagged at round 12 (`.ufo/waves/round-12/w1/ReportEvidence.txt:17`). Route to L1 as a location conflict; not reconciled here.
- Cheap compatibility: include a `lane-commit: <pushed-hash>` line in the fleet report.

### D12 (L) Precedent typo

- `corpus/lessons/round-14.md:19`: "opened2026-10-20" (missing space). Use `opened 2026-10-20` in the round-15 Gate.

## 5. Skeleton for the round-15 report (L1 to fill; placeholders only)

```markdown
# tabi — round 15 (hyaku, attempt 1)

## Work performed
Declared claims: C1 operability (<axis score before→after in SCORECARD>) — <claim text>; C2 calibration — <claim text>.
Pushed lane HEAD: <hash>. lane-commit: <hash>. Baseline: <7054a5e or as decided>.
Stale-lane: <one line>. Tools installed/updated this round: <none | tool/version/channel/reason>.
Planner: L1 canonical seat; no planner spawn. Wave 1: 64 seats (executor 3, revenger 5, scout 11, reviewer 18, critic 9, sentinel 4, scribe 8, connector 6). Round total: 64 (wave 2: <dispatched N | not dispatched>).
- <bullet: path:line | command output | commit hash>

## Landed changes
| Commit | Work | LOG.md entry |

## Before → after measurements
<one block per claim: literal argv, baseline commit, measured commit, before, after, self-verdict>

## Sources & frontier
<census start/end outputs and exit codes; before/after cells; tier histogram; rows touched old→new; frontier rows advanced; D10 start-census note>

## Trend verdicts
| Trend | Verdict | Evidence |
|---|---|---|
| expansion | <verdict> | <evidence> |
| quality | <verdict> | <evidence> |
| discernment | <verdict; `unchanged` unless the round-15 lesson holds a non-author agree/disagree record> | <evidence> |

## SHONEN
- [~] <evidence prose> — SKILL.md contains real decision tables, error patterns, checklists, cited sources
- [~] <evidence prose> — At least one end-to-end domain task executed and logged in LOG.md
- [~] <evidence prose> — Instructions executable by an agent without oral context
- [~] <evidence prose> — No cross-domain bleed (PROVINCE.md still accurate)
```

## 6. Proposed tests (for L1 to run after integration; NOT executed here)

Each test has a negative control. A test counts only after its control fails for the named reason.

- **T1 section order.** `grep -n '^## ' .ufo/reports/round-15/tabi.md` must equal, in order: Work performed, Landed changes, Before → after measurements, Sources & frontier, Trend verdicts, SHONEN. Control: swap two headings, must fail.
- **T2 no scalar in Trend.** The text between `## Trend verdicts` and `## SHONEN` must not match `[0-9]\s*→\s*[0-9]`. Control: the round-14 Trend section must fail (`depth unchanged8→8`).
- **T3 SHONEN form.** Exactly four lines matching `^- \[[x~ ]\] `, each ending with one of the four canonical box strings, in order. Zero `[x]` lines unless a named non-author record exists in the round-15 lesson. Control: a `[x]` line with no record must fail; a box line with paraphrase at the end must fail.
- **T4 Sources counts.** Using the CORPUS census commands, the baseline output and the measured-commit output must both be pasted with exit codes. Expected baseline at `7054a5e`: 29 rows, A23/B4/C2, mined24/queued3/rejected2 (reading from the table; L1 must confirm by running). Control: a before value taken from the working tree rather than the baseline must fail.
- **T5 Count-command grammar.** The pasted command names the measured commit exactly once in its revision operand; replacing it with the baseline reproduces the before command; `git status --porcelain` is empty at the measured commit. Controls: a `REV` placeholder fails; a dirty measured tree fails.
- **T6 Frontier provenance.** Each `S###` the report cites: row exists in `corpus/SOURCES.md`; status `mined`; `used-by` lists the claim path; `corpus/lessons/round-15.md` `## Gate` has that `S###`, an access date, and a quote of ≤25 words. Control: cite S029 with no round-15 Gate line must fail. Control: a `used-by` path that does not exist must fail (census E11).
- **T7 Discernment.** The round-15 lesson holds a non-author record with `agree`/`disagree` for ≥1 admit and ≥1 reject. The report's `discernment` verdict may be `improved` only if that record exists. Control: remove the record and the verdict must downgrade.
- **T8 Commit citations.** Every hash in the report resolves and `git merge-base --is-ancestor <hash> <pushed HEAD>` exits 0. The report commit lands last. Control: one unknown hash must fail.
- **T9 Census end state.** `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exits 0 at the end, after `corpus/lessons/round-15.md` exists.
- **T10 Wave accounting.** The report states seat count 64, the role tally summing to 64, and the planner statement. Control: a total that differs from `swarm-registry.json` members must fail.

## 7. Checks L1 should run after integration (order)

1. `git status --porcelain` (expect empty after integration commits), `git rev-parse HEAD`, push state.
2. Create `corpus/lessons/round-15.md` (`## Gate`, `## Mistakes`, `## Discernment`), then run the census validate for `tabi` (T9) and the CORPUS census block (T4).
3. Measure committed revisions only, with the literal argv (T5).
4. Verify report hashes (T8) and the SHONEN form (T3), then commit the fleet report last with `fleet-commit.sh`.

## 8. Open judgments (not decided here)

- D6 S029 tier A vs B. D7 header qualification. D11 report location and `lane-commit:` line. These belong to L1 and the source seats.
- Whether the round-15 frontier claim uses S029 reopened in round 15 (recommended, D5) or another row.

## 9. Evidence pointers

- Prompt contract: `.ufo/prompts/tabi-round-15.md:1-253` (§2 `:16-40`, §2b `:42-78`, §3 `:80-99`, §4 `:99-125`, §5 `:131-140`, §6 `:141-253`, extras `:238-239`, wave accounting `:186-189`, report commit `:224-230`).
- Round-14 report precedent: `.ufo/reports/round-14/tabi.md` (Work `:3`, Landed `:21`, Before→after `:39`, Sources `:60`, Trend `:98`, SHONEN `:108`).
- Round-14 verifier: `corpus/lessons/round-14-verifier-spotcheck.md` (discernment `:133`, per-axis/trends `:161`, routed items `:180+`, item 5 S029 reference).
- Round-14 lesson: `corpus/lessons/round-14.md` (Gate `:5`, S029 Gate `:19`, Mistakes `:35`).
- Doctrine: `LEARNING.md:28-46`; `MISSION.md:45-48`; `AXES.md:47-49`.
- SOURCES contract: `CORPUS.md` §SOURCES (`:64-184`; rules and census block); `corpus/SOURCES.md` (header `:4-6`, registry `:13-43`, search log ≈`:45-64`).
- Gate grammar: `scripts/check-round-contract.mjs` (`:14-19` BOXES, `:112-115` canonicalShonenText, `:118-124` regularBlob, `:133-160` checkShonenPolicy, `:150` `[x]` fail, `:265-269` roundIds (pstack-only), `:498-510` checkReport, `:578` roundIds call, `:601` checkReport call site).
- Census tool header: `scripts/sources-census.sh:1-38` (E-codes, exit semantics).
- Wave: `.ufo/waves/round-15/w1/spec.json` (64 items, context), `validation.json` (counts spawn 64, resume 0), `swarm-registry.json` (64 members).
- Fleet commit helper: `scripts/hyaku/fleet-commit.sh` (exists, executable).
- Working-tree state: `git status --short` and `git diff HEAD -- corpus/SOURCES.md` at audit time (S029 used-by delta).
