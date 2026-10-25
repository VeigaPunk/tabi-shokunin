# CritVacuity — round 24, wave 1 (tabi)

- Seat: `L1Tabi24.CritVacuity` (critic, leaf — no delegation).
- Scope: attack the two new counters (C1 gate-registry conformance, C2 self-assessment calibration) for vacuity: can they pass their after-target while doing no real work?
- Method: read-only, static. No gate executed (contract: never invoke another runtime; L1 runs gates after integration). All claims below are grounded in committed bytes read at `573c99e4885382db38babc3a6fc90e77afeb42a6` (= HEAD = baseline) plus file reads of the peer's work-in-progress draft. Every number below carries the command that produced it.
- Tooling: no installs performed (none needed); pacman untouched.

## Axes at stake

- **operability** — C1's `nonconformant_gates` counter (baseline tie 8).
- **calibration** — C2's `selfassessment_mismatches` counter (baseline 9).
- Each axis is attacked through the counter named for it; a vacuous counter makes the claim's "after" reachable without the repair the claim sells.

---

## 1. C1 — gate-registry conformance counter: vacuity analysis

Claim (`.ufo/waves/round-24/claims.json:18-31`): fail-closed gate `scripts/check-gate-registry.mjs` reads a revision's committed bytes (SKILL.md registry home + the gate scripts it names), derives for every gate in the lane's gate-script set whether its latest registry row carries the eight PROTOCOL §Gate fields, exit 0 clean / 1 nonconformant / 2 refusal.
Control: a skip-work grep for `round-evidence-audit` in SKILL.md must fail on the baseline (row absent ⇒ N ≥ 1).
Kill rule: undecidable gates count nonconformant, never clean; every field predicate needs a red mutant and a green conformant row.

### 1.1 Exact vacuous code shapes (any of these must be treated as a fail)

- **S1 — gate set derived from the registry rows themselves.** `gates = rows.map(r => scriptInRow(r)).filter(Boolean)` (or `rows.map(r => r.name)`). Every gate then *has* a row by construction; `nonconformant` can never exceed rows-with-missing-fields, and if the row parser is lenient, N ≡ 0 on any revision. This is the exact "only counting rows, never enumerating scripts" shape. The counter must **not** enumerate gates from rows; it must enumerate gates independently of the registry.
- **S2 — scan surface restricted to a subsection.** `parseRows` only walks lines under a literal `## Registry` heading (the precedent is `check-sources.mjs`'s errata: rows outside `## Registry` fail). The lane's actual registry rows live under many variant headings (`### Freshness gate registry`, `### Round-21 runnable artifacts registry`, `### Round22 runnable artifacts registry`, `### Registry — round 19`, …). A scanner matching `^## Registry` only sees nothing ⇒ N = 0 at baseline, and the control fails to fire.
- **S3 — convention regex that misses the routed defect.** If the convention arm is only `check-*.mjs` (no `*audit*` alternative), `round-evidence-audit.mjs` never enters the gate set, the row-derived arm contributes only gates that already have rows, and N = 0 at baseline despite the absent row. The convention must include both `check-*` and `*audit*` stems.
- **S4 — verdict-map / field predicates that accept anything.** e.g. `entry.length >= 1`; `verdictMap` regex accepting `0` alone; `selftest` cell merely non-empty. Then a stub row (`| x | gate | foo | bar | baz | qux | quux | |`) passes all eight fields. Every field check needs a real red mutant (see F3).
- **S5 — "latest row wins" resolved by document order over a name collision.** If rows are matched to gates by gate-name only (`row.name === gate.name`), a row named e.g. `check-freshness` (not the actual `closeout-pin-witness`) silently becomes that gate's latest row, or a later unrelated row with the same name supersedes the real one. Matching must be by script token in entry/selftest cells (or both), not just by display name.
- **S6 — unparseable rows silently skipped.** If a row that fails to parse is dropped rather than counted, a gate whose latest row is malformed is graded on its older valid row and goes green. Kill-rule violation: undecidable ⇒ nonconformant.

### 1.2 The peer draft (as of 2026-10-25 05:17, untracked, 18,570 B)

`scripts/check-gate-registry.mjs` exists as a peer WIP (git status: `?? scripts/check-gate-registry.mjs`). Static read shows it already avoids S1–S3:

- Gate set = `scripts/*` at rev matching `GATE_CONVENTION = /^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/` (line 54) **UNION** scripts named in any parsed row's entry/selftest cells (lines 178-192). `round-evidence-audit.mjs` is in the convention arm ⇒ e1 fires at baseline ⇒ control satisfied (assuming the shipped version keeps this arm).
- Every field has a non-trivial predicate (`missingFields`, lines 149-167); 13 CLI selftest cases + 2 refusal arms cover missing-row, per-field drops, supersession both directions, audit convention, out-of-`scripts/` row-named gates (lines 251-376).

Residual holes in the draft shape (should be closed or disclosed):

- **H1 — 6-column historical rows are invisible.** `parseRows` requires cell[1] to start with `gate`/`probe` (line 128). The round-13/14/19/20 registry tables put the entry command in cell[1] (header `| Name / kind | Entry command | … |`), so their rows are skipped. Gates named only there (`.ufo/waves/round-19/measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`, `.ufo/waves/round-20/check-wave.mjs`, …) enter the set only when a *parseable* row also names them (round-21/22 8-column rows do for several). Any gate that is non-convention, outside `scripts/`, and only referenced in a skipped table can lose its row and never be flagged — a narrower, real instance of S1.
- **H2 — malformed-later-row is ignored.** A row with <3 cells or a non-gate/probe kind cell is skipped (lines 124-128), so a gate with a valid old row + appended garbage row grades green on the old row (S6). Fixture F8 must be red.
- **H3 — probe-kind rows always fail the kind predicate.** `missingFields` requires cell[1] to start with `gate` (line 153), while `parseRows` accepts `probe`. A complete PROTOCOL-conformant probe row (kind = `probe`) will be flagged e2. This errs red (fail-closed), but it means the counter's definition of "complete row" is gate-only; if probes are meant to need rows too, the predicate is wrong in the other direction. Decide and state it; the metric's N loses meaning if the kind vocabulary is unstable.
- **H4 — the table's own selftest claims "4 isolated cases" per row** (`CLEAN_ROW`) while the real gate has 13; fine as fixture text, but the C1 row that will be landed for `check-gate-registry.mjs` itself must state the real numbers or the C2 m1 class will flag it.

### 1.3 Fixtures that MUST fail if the implementation takes a vacuous shape

- **F1 (control-red, mandatory):** run at baseline `573c99e` → exit 1, `findings` contains `e1-missing-row` for `round-evidence-audit`, `nonconformant ≥ 1`. (Grounding: `grep -c round-evidence-audit SKILL.md` → 0; `git ls-files scripts/round-evidence-audit.mjs` → tracked. This is the claim's own control.)
- **F2 (row-drop red):** from a full conformant set, delete the row for one convention gate → e1 for that exact gate.
- **F3 (field-drop red, one per field):** for each of the eight fields, a mutant row missing exactly that field → e2 naming that field; the conformant row → clean. (Kill rule.)
- **F4 (script-absent red):** row names `scripts/check-ghost.mjs` not in the rev tree → e3.
- **F5 (supersession):** complete-then-incomplete rows → e2 (latest wins); incomplete-then-complete → clean.
- **F6 (audit convention):** `scripts/round-evidence-audit.mjs` with a full row → clean, without it → e1 (guards S3).
- **F7 (out-of-scripts gate):** `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs` with full row → clean (validates the row-named arm).
- **F8 (malformed-later-row red):** complete row followed by a later row that fails parse (e.g. `<3 cells or kind cell absent) → must be nonconformant, never clean (guards H2/S6).
- **F9 (empty-registry green):** empty SKILL.md, no script tree → clean with 0 gates, exit 0 — but only when the gate set is genuinely empty per the independent enumeration.

---

## 2. C2 — self-assessment calibration counter: vacuity analysis

Claim (`.ufo/waves/round-24/claims.json:32-45`): `scripts/check-selfassessment.mjs` compares self-assessment (SCORECARD.md blocks naming a gate script; SHONEN.md) and landing state against observed repo state. Three classes: m1 stale `--selftest`/`N-case` tallies vs the gate's own selftest output at the measured revision; m2 committed receipt exits vs re-run; m3 working-tree unlanded paths while the lane asserts landed rounds. Before 4 (three stale 12/12 figures + 89 unlanded porcelain paths) → after 0. Control: grep `12/12` in SCORECARD.md → prints 0 ⇒ must fail at baseline.

### 2.1 Exact vacuous code shapes (one per class, plus the cross-class case)

- **M1-V1 (regex matches nothing):** tally extractor uses a too-tight delimiter — e.g. `/--selftest\s+(\d+)\/(\d+)/` (space directly after the flag) against the real text, which is `` `--selftest` (12/12) `` (backtick, space, paren). No match ⇒ m1 ≡ 0.
- **M1-V2 (wrong document set):** scan only SHONEN.md (12 lines, no tallies) ⇒ m1 ≡ 0 always. The scan must cover SCORECARD.md blocks naming gate scripts.
- **M1-V3 (oracle sourced from a stale receipt — the strongest counterexample):** if the "gate's own selftest output" is read from a committed receipt instead of derived from the script at REV, the oracle itself can be stale. Grounding: `corpus/evidence/round-23/c1-measurements.json` at HEAD still records `failureCapable.inMemory.cases = 12` (and `passed = 12`) while the shipped script has 13 cases (`grep -c 'runFixtureCase(' scripts/round-evidence-audit.mjs` → 14 = 1 definition + 13 cases; `LOG.md:1730` and `corpus/lessons/round-23.md` §Gate say 13). A counter that parses this receipt as oracle sees 12/12 as *correct* ⇒ SCORECARD's 12/12 figures never mismatch ⇒ m1 ≡ 0 on the baseline without a single correction. The oracle must be the script's case count at REV (git-grep count of case registrations, or executing `--selftest`), never a committed tally.
- **M2-V1 (receipt discovery too narrow):** only receipts whose JSON has an `argv` array + numeric `exit` are considered (e.g. `.ufo/waves/round-20/final/binding-at-measured.json` shape), skipping the round-23 shape `{before: {command: "git cat-file -e …", exit: …}}` in `c1-measurements.json`. The known m2 defect lives in exactly that skipped shape.
- **M2-V2 (re-run context drift):** the re-run must execute in the lane root against the same repository as REV. If it runs in the wrong cwd (fleet root or elsewhere) the command either fails spuriously or, when `git cat-file -e <abbrev>:<path>` resolves differently, "agrees" with a recorded exit for the wrong reason.
- **M2-V3 (spawn error = skip):** if a re-run that cannot start (placeholder `<REV>` un-substituted, missing git, bad command string) is caught and *skipped* rather than counted, all unparseable receipts vanish from m2. Per kill-rule they must be `could-not-evaluate` (exit 2), never counted as matches.
- **M3-V1 (cwd/wrong repo):** `git status --porcelain` run outside the lane root sees a clean tree ⇒ m3 ≡ 0.
- **M3-V2 (untracked filtered out):** `git status --porcelain | grep -v '^??'` (or `-uno`) sees only the 2 `M` paths, not the 87 `??` (the 89-porcelain-path defect is 2 M + 87 ?? — `round-23-verifier-spotcheck.md:91-94`).
- **M3-V3 (assertion regex matches nothing):** the "asserts landed rounds" predicate anchored to a phrase that does not exist verbatim in the baseline docs (e.g. "no uncommitted work", "all work landed"). The natural anchor is the `## Round 23 — executed disposition` block (`SCORECARD.md:1143-1165`). If the predicate matches nothing, the class is silently absent ⇒ m3 ≡ 0 even when the tree is dirty; per kill-rule it must instead be disclosed as a null class.
- **M3-V4 (REV == HEAD gating):** if m3 only evaluates when `REV != HEAD` or only at closure, a measurement run at the baseline rev while the tree is dirty reports 0. m3 must evaluate the *present checkout's* dirt regardless of the `--rev` argument.

### 2.2 Baseline grounding for the fixtures

- The three stale figures are all inside the lane at HEAD: `SCORECARD.md:1138` ("12-case in-memory matrix"), `:1139` ("`--selftest` (12/12)"), `:1151` ("`--selftest` 12/12 exit 0") — verified by `sed -n '1136,1141p;1151p' SCORECARD.md`. (The round-23 report's "Work performed" is not in the lane tree: `git ls-tree -r --name-only HEAD | grep -c ufo/reports/round-23` → 0; `git diff --diff-filter=D c90dffd HEAD` → empty, so it never lived in this repository. m1 must therefore fire on the three SCORECARD mentions from lane bytes alone.)
- The m2 red state exists in history: at `03c1b4d` the receipt recorded `before.exit = 1` while its named command `git cat-file -e a89f1935:scripts/round-evidence-audit.mjs` exits 128 (`git show 03c1b4d:corpus/evidence/round-23/c1-measurements.json`). At HEAD the field is corrected to 128, so the red fixture must be built from the `03c1b4d` state (or a mutant receipt).
- Live-tree state at writing: `git status --porcelain | awk '{print $1}' | sort | uniq -c` → `89 ??, 5 M` (mid-wave drift; peers writing). Closure-time defect state was 87 ?? + 2 M.

### 2.3 Fixtures that MUST fail if the implementation takes a vacuous shape

- **M1-F1 (control-red):** baseline `573c99e` → m1 yields exactly the three findings against `SCORECARD.md:1138/1139/1151`; total mismatches ≥ 3 (4 with the m3 arm on a dirty tree). A 0 here fails the claim's control.
- **M1-F2 (restored-stale-figure mutant):** fixture copy of a SCORECARD block where a gate's tally says 12/12 while the script at REV has 13 cases → m1 finding with the exact line. (That is `failureCapable`'s "restored-stale-figure mutant".)
- **M1-F3 (clean fixture):** same block with 13/13 (and the matrix text "13-case") → no m1 finding.
- **M1-F4 (oracle-staleness red):** the oracle must not be satisfied by `c1-measurements.json` `failureCapable.inMemory.cases=12`; i.e. the fixture must pass when oracle = script-derived 13 and fail (finding) when oracle = receipt-derived 12.
- **M2-F1 (red):** the `03c1b4d` receipt state (recorded exit 1 vs re-run 128) → m2 finding.
- **M2-F2 (green):** HEAD receipt state (128 vs 128) → no m2 finding.
- **M2-F3 (unparseable receipt):** a receipt whose command cannot be re-run (placeholder, bad command) → exit 2 `could-not-evaluate`, never a clean 0.
- **M3-F1 (red):** lane checkout with one stray untracked file + one modified tracked file, REV = the checkout's commit, assertion block present → m3 finding (dir ≥ 2).
- **M3-F2 (green):** clean checkout → no m3 finding.
- **M3-F3 (assertion-miss):** with a dirty tree and the assertion regex changed to match nothing → must be disclosed as null/could-not-evaluate, never counted clean.

---

## 3. Impacted axes and smallest safe corrections

- **C1 / operability.** Minimum safe corrections: (1) gate set must include the independent convention arm (`check-*` ∪ `*audit*`) — any implementation that drops it is vacuous and must be rejected by F1; (2) any row that fails parsing counts as nonconformant for the gate it names (F8); (3) every field keeps a red mutant + green row (F3); (4) decide and document probe-kind handling (H3). The peer draft already carries (1) and (3); close H1/H2 and re-verify after integration.
- **C2 / calibration.** Minimum safe corrections: (1) m1 oracle = case count derived from the gate script at REV, never from a committed receipt (M1-F4); (2) m1 extractor must tolerate the actual delimiters (`` `--selftest` (12/12) ``) and scan SCORECARD.md blocks, not just SHONEN.md; (3) m2 re-runs execute the recorded command in the lane root with `<REV>` substitution, and any failure to re-run is `could-not-evaluate`; (4) m3 runs `git status --porcelain` in the lane root including `??`, gated on an assertion anchor that exists verbatim in the baseline docs, with null-class disclosure.

## 4. Notes

- Ground truth anchors: `claims.json` (both claims), `round-23-verifier-spotcheck.md:85-108` (routed defects 1-5), `SCORECARD.md:1138-1141,1151`, `c1-measurements.json` (HEAD + 03c1b4d), `LOG.md:1730`, `corpus/lessons/round-23.md` §Gate.
- This reviewer did not execute either gate (no runtime invocation permitted); all evaluation is static over committed bytes and the read draft.

Report: .ufo/waves/round-24/w1/CritVacuity.md
