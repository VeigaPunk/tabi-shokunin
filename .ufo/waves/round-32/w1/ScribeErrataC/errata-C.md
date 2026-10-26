# Errata C — carried queue items E19–E27, re-checked at `4181fff`

Scope: the C2 half of the carried queue (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`,
items E19–E27 by that file's own numbering). Lane revision for every reading below:
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (claims frozen before data). The counter bytes read are the frozen
v3 bytes: `sha256sum scripts/check-selfassessment.mjs` =
`77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, byte-identical to
`.ufo/waves/round-32/claims.json` `.frozenDigests`.

All line numbers in this file are **current at `4181fff`**. The round-31 texts cited *v2* numbering
(`:122`, `:233`, `:71`, `:881`); v3 added 11 self-test cases and a header section, so those anchors have
drifted — every draft below re-anchors them.

Machine readings used (no counter re-run by this seat; the frozen reading is
`.ufo/waves/round-32/baseline/c2-J1-do-nothing.json`, rev `5ad1fcbf`, docs unchanged `5ad1fcbf..4181fff`):

| Reading | Value |
|---|---|
| `mismatches` | 18 = 15 `m1-selftest-tally` + 3 `m4-nudge-state` |
| findings | 195 |
| refused (`observed === null`) | 104 = 27 m1 (24 `ambiguous script association`, 3 `script outside the runnable gate set`) + 76 m2 (`command outside the closed re-run grammar`) + 1 m4 (`no `Axes at round start:` with all six axes`) |
| m1 composition | 109 findings = 15 counted + 21 superseded + 46 matched + 27 refused |
| m4 composition | 9 findings = 3 counted + 5 matched + 1 refused |
| `couldNotEvaluate` | 104 |

Summary of dispositions:

| Erratum | Subject | Verdict at `4181fff` | Disposition |
|---|---|---|---|
| E19 | oracle ignores exit code / passed count | **half-closed in v3** (verdict+exit enforced for summaries); two arms remain | DRAFT — `corpus/QUALITY.md` criterion 83 |
| E20 | claim grammar narrower than the header | **live**, and now the header advertises a shape the extractor cannot match | DRAFT — same append as E19, clause 4 |
| E21 | four counter-hygiene items | **live** (all four), line anchors drifted | DRAFT — lesson `## Mistakes` |
| E22 | stale tally `SKILL.md:1559` | **already corrected** at `SKILL.md:2610` | REFUSAL (no bytes needed) |
| E23 | seven tally lines produce no claim | **live as a coverage gap**, out of the round's claimed scope | REFUSAL (two independent reasons) |
| E24 | coverage boundary 103/27 | **live**, now 104/27 | DRAFT — lesson `## Mistakes` (accounting rule) |
| E25 | two scripts on one line are compared, not skipped | **already corrected** at `corpus/README.md:699-703` | REFUSAL (no bytes needed) |
| E26 | receipt/population count read as a tally | **live**, two live instances at the freeze | DRAFT — lesson `## Mistakes` |
| E27 | supersession accepts any stated number | **live**, anchor drifted `:233` → `:246` | DRAFT — lesson `## Mistakes` |

Every draft below is append-only, cites the statement it addresses by document and current line, and states
no check this seat did not run. Append once: the two DRAFT targets are (i) `corpus/QUALITY.md` after `:491`
(new `## Round 32 additions` section) and (ii) the new `corpus/lessons/round-32.md` §`## Mistakes`.

---

## E19 — "the oracle ignores the gate's exit code and passed count"

**Carried text (verbatim, round-31 queue):** "A gate printing `verdict=failed cases=13 passed=11` with exit 3
still yields tally 13, so a document claiming 13/13 is clean against a broken gate (probe P6). … **Carried** —
the frozen counter has no verdict test."

**Re-check at `4181fff`:**

- `scripts/check-selfassessment.mjs:183` collects `<NAME>_SELFTEST … cases=N` summaries;
  `:184` picks the **last** summary, else falls back to the **first** `cases=`/`N/M` token in the output;
  `:188` extracts `verdict=` **from that summary only**;
  `:189` refuses a run with no tally;
  `:190` refuses when `r.status !== 0` **or** the summary verdict is not `clean`
  (`why: self-test not clean (exit=… verdict=…)`).
- The two proving cases are `:854` `v3-failed-summary-is-not-an-oracle`
  (gate prints `FIXTURE_SELFTEST verdict=failed cases=12 passed=11`, exits 3) and `:860`
  `v3-nonzero-exit-is-not-an-oracle` (prints `verdict=clean …`, exits 1); both assert `exit: 0, classes: []`
  — i.e. could-not-evaluate, never a counted mismatch.
- Header `:185-187` states the rule: "v3 (round 32): a self-test that did not pass is never an oracle — a
  nonzero exit or a summary line whose verdict is not `clean` (round-31 lesson M11) is could-not-evaluate,
  not a measured tally."

**Verdict:** the arm the erratum names is **closed in v3** — no counter change and no document correction is
needed to make "a failed summary is not a tally" true. Two arms of the same sentence remain open, and they
are code facts, not opinions:

1. **`passed=` is parsed nowhere.** A gate printing `FIXTURE_SELFTEST verdict=clean cases=13 passed=11` and
   exiting 0 is admitted with tally 13. No CASES entry exercises a clean verdict with
   `passed < cases` (grep `passed=` in the counter yields only `:544`, `:545`, `:815-845`, `:857`, `:863`,
   `:1061`; none has `verdict=clean` with a short `passed`).
2. **A summary-less gate is admitted on exit status alone.** When `summaries` is empty, `:184` takes the
   fallback token and `:188` leaves `verdict = null`, so `:190`'s verdict test cannot fire; only
   `r.status !== 0` refuses.

This matters document-side because `corpus/QUALITY.md:483-491` (criterion 82, landed at `cad607b`) states its
premise against **v2**: "which the frozen v2 counter does not enforce: its summary pattern reads no `verdict=`
token, a failed self-test's `cases=N` is read as the gate's tally, … Until a counter enforces it, a tally
stated for a gate whose self-test is not `clean` … is read by hand". At v3 that premise is false for the
summary arm (the `verdict=` token *is* read, `:188`). Criterion 82 cannot be edited (append-only; never edit
above), so the correction is a new criterion that supersedes the premise and states the two surviving limits
as limits (criterion 73's rule).

**Disposition — DRAFT (append).** Target `corpus/QUALITY.md`; append point: after `:491` (end of file), opening
a new section `## Round 32 additions (append-only; never edit above)` in the shape of `:455`. Text:

```markdown
83. Criterion 82's premise is bound to v2 and is superseded for the summary arm: the frozen v3 counter
    (`scripts/check-selfassessment.mjs`, sha256
    `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, round 32) reads `verdict=` from the
    last `<NAME>_SELFTEST` summary (`:183-188`) and refuses a nonzero exit or a summary verdict other than
    `clean` as could-not-evaluate (`:190`), proven by the cases `v3-failed-summary-is-not-an-oracle` (`:854`)
    and `v3-nonzero-exit-is-not-an-oracle` (`:860`). Two arms remain limits, not rules. (a) `passed=` is
    parsed nowhere: a summary `verdict=clean cases=13 passed=11` that exits 0 is an oracle. (b) A gate that
    prints no `<NAME>_SELFTEST` line falls back to the first `cases=` or `N/M` token (`:184`) with no verdict
    token (`:188`), so only its exit status is tested (`:190`). (source: round-31 errata E19; round-32 v3
    bytes at `4181fff`)
```

---

## E20 — "the claim grammar is narrower than the header documents"

**Carried text (verbatim):** "Line-level claims accept `cases=N` but not `cases: N` (probe P4); the fraction
shape is anchored within 24 non-pipe characters of `--selftest` (P7); bare `N/M` is never claimed — while
`statedTallyNumbers` accepts the colon form, so the two grammars disagree."

**Re-check at `4181fff` — still true, and sharper:**

- Header `:28-33` documents the tally shapes as: "`` `--selftest` (N/N) ``, `N-case`, `cases=N`, `cases: N`,
  `N cases`". The header **advertises** `cases: N`.
- Claim extraction accepts only three shapes, identical in both windows:
  `:216` (SCORECARD) and `:322` (LOG/SKILL/corpus-README) —
  `/(\d+)-case\b/g`, `/\bcases\s*=\s*(\d+)/g`, `/\b(\d+)\s+(?:isolated\s+)?(?:CLI\s+)?cases\b/g`.
  No colon form, no bare `N/M`.
- The fraction is anchored to `--selftest` with `[^\n|]{0,24}?` — `:216`, `:322`, and `:265` (three sites).
- `statedTallyNumbers` (`:264-271`) accepts five shapes: the anchored fraction (`:266`), `N-case` (`:267`),
  `cases\s*[:=]\s*N` (**colon included**, `:268`), `N cases` (`:269`) and any bare `N/M` (`:270`).
- Live colon-form text exists in the four scanned documents and is consumed **only** by the supersession
  check: `LOG.md:1854`, `:1907`, `:1911`, `:1915`, `:1919`, `:1921`, `:1925`, `:2008`;
  `SCORECARD.md:1204`, `:1351`. None of them is a claim; all are correction prose or quoted receipt fields.

**Verdict:** live. The header of the frozen counter overstates its own extractor by one shape, and the two
grammars (`:216`/`:322` vs `:268`/`:270`) disagree in both directions: the claim side is narrower than the
header, the supersession side is wider than the claim side.

**Disposition — DRAFT (append), one page with E19.** Append point: the same `## Round 32 additions` section;
this is clause 4 of criterion 83. Append **once** — do not write a second criterion for this erratum:

```markdown
    The claim grammar is narrower than the header states: a claim is extracted only for
    `` `--selftest` (N/N) `` within 24 non-pipe characters, `N-case`, `cases=N` and `N cases`
    (`scripts/check-selfassessment.mjs:216`, `:322`); the header's `cases: N` (`:30-33`) and a bare `N/M`
    are accepted by the supersession check alone (`:268`, `:270`), never as a claim. A tally written
    `cases: N` on a gate-naming line is therefore unchecked, not matched. (source: round-31 errata E20)
```

---

## E21 — "four small items, one line each"

**Carried text (verbatim):** "`GIT_DIR`/`GIT_WORK_TREE` and the m2/m3 spawns are not scrubbed; `TALLY_PATTERNS`
(`:122`) and `statSync` (`:71`) are dead code (see E5); exit 3 is undocumented in the header's verdict table;
`m3Findings` reads the `--rev` blob while `git status --porcelain` runs on the live worktree."

**Re-check at `4181fff` — all four live:**

1. **Environment scrub.** `git()` sets `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` only (`:104`); `GIT_DIR`,
   `GIT_WORK_TREE`, `GIT_INDEX_FILE` and every other `GIT_*` pass through. The **m2** re-run spawn (`:399`) and
   the **m3** spawn (`:419`) pass `{ encoding, maxBuffer }` and nothing else, so they inherit the full
   environment with no config scrub at all.
2. **Dead code.** `const TALLY_PATTERNS = [` at `:130` has exactly one reference in the file (its definition;
   the live extraction is inline at `:215-218` and `:321-324`). `statSync` is imported at `:79` and referenced
   once (the import). Both counts verified by `grep -c`.
3. **Exit 3.** `process.exit(out.ok ? 0 : 3)` at `:1063`; the header's verdict table (`:5-7`) declares
   0/1/2 and says "Any other nonzero code is undeclared and reads as could-not-evaluate". The self-test's own
   failure code is therefore undeclared *by the table it is read against*, even though `:8-10` describes the
   self-test. (The `exit=3` at `:545` is a fixture gate's exit, not the counter's.)
4. **Blob vs worktree.** `evaluate` passes the **`--rev` blob** to m3 (`:528`: `m3Findings(repo, scorecard)`
   where `scorecard = readBlob(repo, rev, "SCORECARD.md")`), while `m3Findings` runs
   `git -C repo status --porcelain --untracked-files=all` on the **worktree** (`:419`). A run at an ancestor
   compares the ancestor's disposition block with the live tree; the round's measurement rule (clean checkout
   at REV) is what keeps this from firing today, not the code.

**Verdict:** live, low severity, all four. None of them is a document statement, so none can be corrected by
citing a document line; the counter bytes are frozen, so the correction is a recorded limit.

**Disposition — DRAFT (append).** Target `corpus/lessons/round-32.md`, append point: end of `## Mistakes`
(last bullet). Text:

```markdown
- **Counter hygiene residual (round-31 errata E21, re-checked at `4181fff`).** `scripts/check-selfassessment.mjs`
  v3 keeps four v2 defects. (1) `git()` scrubs `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` only (`:104`); `GIT_DIR`,
  `GIT_WORK_TREE` and `GIT_INDEX_FILE` pass through, and the m2 and m3 spawns carry no environment scrub at all
  (`:399`, `:419`). (2) `TALLY_PATTERNS` (`:130`) and the `statSync` import (`:79`) are dead — one reference
  each, the definition and the import. (3) the self-test's failure code 3 (`:1063`) is absent from the header's
  verdict table (`:5-7`), which declares every other nonzero code could-not-evaluate. (4) `m3Findings` reads
  the `--rev` blob (`:528`) while its `git status --porcelain --untracked-files=all` runs on the worktree
  (`:419`); only the clean-checkout measurement rule keeps an ancestor run from comparing two trees.
```

---

## E22 — "a live stale tally the counter cannot see" (`SKILL.md:1559`)

**Carried text (verbatim):** "`SKILL.md:1559` still reads 'eight isolated CLI cases assert exit and stable
finding'; … `SKILL.md:2469` says so in prose … **without citing `:1559`**, which the frozen rule cannot credit
— a correction must cite the line."

**Re-check at `4181fff`:**

- The stale sentence is still in place, unchanged, at `SKILL.md:1559` ("…; eight isolated CLI cases assert
  exit and stable finding"). Append-only means it must stay.
- **The correction the erratum asks for has landed.** `SKILL.md:2610` reads: "`scripts/check-freshness.mjs`
  `--self-test` (12/12): correction — supersedes the stale tally at `SKILL.md:1559`. That line states the count
  as the word "eight"; the gate prints `FRESHNESS_SELFTEST verdict=clean cases=12`, the figure the round-24
  registry row states in prose without citing that line." It names the script, carries the marker, cites
  `SKILL.md:1559` in the same document, and states the tally in a parsed shape (`(12/12)`).
- Landed by `cad607b` (round-31 attempt-2 integration: "SKILL.md:1559 correction"), i.e. **after** the round-31
  wave a2w1 reading at `4860483` that produced this erratum. The erratum is stale, not open.
- Currency of the figure: `git log --oneline ae15a37..4181fff -- scripts/check-freshness.mjs` is **empty**, so
  the gate's bytes (and its case count) are unchanged since the measurement the correction cites. This seat did
  **not** re-run the gate; an unrun check is not a passed check, and the static history is the whole of the
  claim.
- Correctness of the landing: `SKILL.md:1559` produces **no claim** (the count is the word "eight"; the
  extractor at `:322` cannot see it, and the baseline has no finding for that line). So the correction is
  curation, not a counted mismatch — which is exactly how `SKILL.md:2608-2609` describes it ("the frozen
  calibration window cannot read it … so this correction is curation, not a counted mismatch").

**Verdict:** already corrected at `4181fff`; nothing to append.

**Disposition — REFUSAL.** Reason: a second correction citing `SKILL.md:1559` would duplicate a landed
correction and, worse, would re-state a tally on a gate-naming line inside a scanned document
(`m1LogFindings` window), creating a new claim of shape `(12/12)` against `scripts/check-freshness.mjs` whose
value is already 12 — harmless only by coincidence, and a second number on that paragraph is exactly what E27
shows can clear the wrong line. Flip condition: (a) `scripts/check-freshness.mjs` changes its self-test case
count (then the landed `12/12` becomes a stale claim the counter *will* read, and a superseding paragraph must
cite `SKILL.md:2610`); or (b) the bullet at `:2610` is removed, or an insertion above `:1559` renumbers the
line (E30's positional class), invalidating its citation.

---

## E23 — "seven tally-bearing lines produce no claim at all"

**Carried text (verbatim):** "`SKILL.md:1559, 1988, 2030, 2031, 2032, 2474` and `corpus/README.md:591` are
written in shapes the grammar does not parse (`--self-test`:N, `cases: N`, `selftests N/N`, `cli_cases=N`,
word numerals, digits fused to a word)."

**Re-check at `4181fff` — all seven present, none in the frozen reading:**

| Line | Current text (excerpt) | Why no claim |
|---|---|---|
| `SKILL.md:1559` | "eight isolated CLI cases assert exit and stable finding" | word numeral; extractor needs a digit |
| `SKILL.md:1988` | "The final observed six-hazard result is6 with original11 cases … (12/12)" | digits fused to words (`is6`, `original11`) defeat `\b(\d+)`; the `12/12` has no `--selftest` anchor within 24 non-pipe chars |
| `SKILL.md:2030` | "`--self-test`:38; embedded cases" | colon shape; `38; embedded cases` has no `(\d+)\s+…cases` run |
| `SKILL.md:2031` | "`--self-test`:26; embedded stub cases" | same |
| `SKILL.md:2032` | "`--self-test`:38; embedded cases" | same |
| `SKILL.md:2474` | "`node scripts/check-aria-metadata.mjs --self-test` (cli_cases=36, helpers=4)" | `\bcases` fails before `_cases` (word char `_`), and the shape is `cli_cases=`, not `cases=` |
| `corpus/README.md:591` | "selftests 17/17 and 18/18" | bare `N/M` is never a claim; and the line names two scripts |

`jq` over the frozen reading for exactly those `(doc, line)` pairs returns nothing — the lines appear in **no
finding at all**, neither counted nor refused. That is the erratum's point, reproduced at v3.

**Verdict:** live as a coverage gap; **not** a defect this round can correct.

**Disposition — REFUSAL.** Two independent reasons:

1. **Scope.** `claims.json` `.notClaimed[0]` reads: "word-numeral and `<name>_cases=` tallies (round-31 routed
   defect 1, M7/M11 holes)". The round declared these out of scope before data; drafting a correction that
   *claims* them repaired would contradict a frozen claim.
2. **No correction text can be written honestly for six of the seven.** `SKILL.md:2030-2032` name
   `.ufo/waves/round-18/measure-c*.mjs`, which `RUNNABLE_GATE` (`:88`) can never run, so no oracle exists —
   `corpus/QUALITY.md:478-481` (criterion 81) already rules this shape "outside the oracle until a later counter
   reads it, and a tally stated for it is unchecked, not matched", and the same sentence names the
   `cli_cases=` gate (`:479`). For `:2474` the oracle would be `node scripts/check-aria-metadata.mjs
   --self-test`; this seat did not run it, so no true tally is known and none may be written. For
   `corpus/README.md:591` the line names two gates and a receipt count, which is E26's shape.

Flip condition: a round that (a) widens `RUNNABLE_GATE` and the claim grammar to word numerals / `cases: N` /
`cli_cases=` / bare `N/M`, **and** (b) lands a committed, re-runnable self-test receipt per line; or an operator
reading of `check-aria-metadata.mjs --self-test` recorded as a measurement. Until then these seven lines stay
"unchecked, not matched" and must be quoted that way.

---

## E24 — "the coverage boundary is 103 refusals, 27 of them m1"

**Carried text (verbatim):** "At the freeze reading: 24 claims refused as 'ambiguous script association' and 3
naming scripts outside `RUNNABLE_GATE = ^scripts/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$`, which can
never count `scripts/freshness-witness.mjs`, `scripts/webmcp-*.mjs`, `scripts/selftest-measurement-binding.mjs`
or any `.ufo/waves/**` gate. … 'mismatches 0' must be quoted together with this residual, never as 'all
statements verified'."

**Re-check at `4181fff` (frozen reading `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json`):**

- `RUNNABLE_GATE` is byte-identical at `:88` (same alternation).
- Refusals: **104** total, of which m1 = **27** — 24 `ambiguous script association`, 3 `script outside the
  runnable gate set`, and those three are exactly the named class: `LOG.md:972`
  `scripts/selftest-measurement-binding.mjs` (claimed 59), `SKILL.md:2027` `scripts/freshness-witness.mjs`
  (claimed 8), `SKILL.md:2028` `scripts/webmcp-invoke-round18.mjs` (claimed 12).
- Total moved 103 → 104 because v3 adds the m4 class and one round group lacks its axis inputs
  (`1 × no `Axes at round start:` with all six axes`), not because m1 coverage changed.
- m2 contributes 76 refusals of its own (`command outside the closed re-run grammar`) — the residual is wider
  than the C2 half: 104 of 195 findings in the run are refusals, 46 m1 findings matched, 21 m1 findings were
  cleared only by a later correction paragraph.

**Verdict:** live, with corrected counts (104 / 27, not 103 / 27). The claim-side statement is accurate —
`corpus/README.md:699-703` already lists the three unchecked shapes — but nothing in the documents carries the
volume, and the volume is what "mismatches 0" hides.

**Disposition — DRAFT (append).** Target `corpus/lessons/round-32.md`, append point: end of `## Mistakes`.
Text (also the required companion of every "mismatches 0" quote from this round, including the SCORECARD
round-32 disposition and any §Gate sentence):

```markdown
- **Oracle coverage residual (round-31 errata E24, re-counted at `4181fff`).** `SELFASSESSMENT verdict=clean
  mismatches=0` is a statement about counted comparisons only. The frozen reading carries 195 findings: 104
  refused — 27 m1 (24 ambiguous script association, 3 outside `RUNNABLE_GATE`, at `LOG.md:972`,
  `SKILL.md:2027`, `SKILL.md:2028`), 76 m2 commands outside the closed re-run grammar, 1 m4 round group
  without axis inputs — plus 46 m1 matched and 21 m1 cleared only by a later correction paragraph; 15 m1 and
  3 m4 were counted. `RUNNABLE_GATE` (`scripts/check-selfassessment.mjs:88`) can never count
  `scripts/freshness-witness.mjs`, `scripts/webmcp-invoke-round18.mjs`,
  `scripts/selftest-measurement-binding.mjs` or any `.ufo/waves/**` gate. Quote the zero with these numbers;
  never as "all statements verified".
```

---

## E25 — "two scripts on one line are compared, not skipped — the landed README row has it backwards"

**Carried text (verbatim):** "The frontier row landed at `4860483` says 'multi-script lines stay unchecked'
(`corpus/README.md:686`). **Corrected here:** the true statement is 'a line naming N scripts is compared
against the first tally on it for each of them — a false-mismatch source — and only an unsectioned,
single-tally line is refused as ambiguous'."

**Re-check at `4181fff`:**

- The stale cell is still in place at `corpus/README.md:686` ("… a gate whose summary spells its count
  otherwise (`cli_cases=`) and multi-script lines stay unchecked") — append-only, as required.
- **The correction landed** at `corpus/README.md:699-703`: "`corpus/README.md:686`, status cell — read: tally
  lines stay unchecked when the gate prints no `<NAME>_SELFTEST … cases=N` summary, when the line does not name
  its own runnable gate (no section fallback in these windows, so a single-script section does not help), or
  when the named script is outside the runnable gate set. **A line naming two gates is checked, not skipped:
  its first tally is paired with every gate on it.** (a2w1 CritReadmeRow F3; ScribeErrata E25)".
- The correction matches current code: `:335` `const targets = lineScripts.size ? [...lineScripts] : !lineOnly
  && scripts.size === 1 ? [...scripts] : []` — every script on the line, first tally for each; refusal only
  when the line names none and the section names more than one (`:336-339`), or when `lineOnly` and the line
  names none.

**Verdict:** already corrected at `4181fff`; nothing to append.

**Disposition — REFUSAL.** Reason: the correction already exists in the same document, cites the stale cell,
and states the current rule with the code's own behaviour (compared per script, not skipped). A second
paragraph citing `:686` would be a duplicate; and any paragraph on that line naming a gate plus a tally would
be read as a claim (E26's shape).

Flip condition: (a) the paragraph at `:699-703` is removed, or (b) the association rule changes back to
skipping multi-script lines — then `:686`'s stale cell would become the accurate statement and `:699-703` would
itself need superseding (citing `corpus/README.md:699`).

---

## E26 — "a receipt or population count on a gate-naming line is read as a self-test tally"

**Carried text (verbatim):** "Fixture F2 counts 'real12-case/four-control receipt' against the gate's tally;
… **Carried** — no live instance in the landed sections, and any appended receipt count on a gate-naming line
will be read as a tally."

**Re-check at `4181fff` — the "no live instance" half is no longer true:**

- Mechanism unchanged: `:216` / `:322` include `/(\d+)-case\b/g` with **no actor test** — any `N-case` on a
  line that names a gate becomes a claim for that gate.
- **Live instance 1:** `SCORECARD.md:1138` — "12-case in-memory matrix and a six-repair evidence-keyed
  matrix; refuses rather than" — read as a tally of `scripts/round-evidence-audit.mjs`, claimed 12, observed 13,
  and it survives only because `superseded: true` (a later correction paragraph clears it). A matrix size is not
  a self-test tally; the counter cannot tell.
- **Live instance 2:** `SKILL.md:2028` — "real12-case/four-control receipt …" — read as a tally of
  `scripts/webmcp-invoke-round18.mjs`, claimed 12, refused only because that script is outside
  `RUNNABLE_GATE`. Put the same words on a line naming a runnable gate and it is a false mismatch.
- Historical withdrawal on record: `LOG.md:1912-1918` (the 66-decision population at `:1090`, `:1103`).

**Verdict:** live; two instances at the freeze, one counted-but-superseded and one refused-for-the-wrong-reason.
This is the constraint the round-32 corrections must respect: no receipt, population or matrix count on a line
that names a gate.

**Disposition — DRAFT (append).** Target `corpus/lessons/round-32.md`, end of `## Mistakes`. Text:

```markdown
- **Receipt counts read as tallies (round-31 errata E26, live at `4181fff`).** The claim extraction
  `(\d+)-case` (`scripts/check-selfassessment.mjs:216`, `:322`) has no actor test: `SCORECARD.md:1138`'s
  "12-case in-memory matrix" is read as a tally of `scripts/round-evidence-audit.mjs` (claimed 12, observed 13)
  and survives only because a later correction paragraph supersedes it, and `SKILL.md:2028`'s
  "real12-case/four-control receipt" is read as a tally of `scripts/webmcp-invoke-round18.mjs`, refused only
  because that script is outside `RUNNABLE_GATE`. A receipt, population or matrix size written on a
  gate-naming line is a claim until a correction clears it; the round-32 corrections therefore state one
  tally per line and no other `N-case` count.
```

---

## E27 — "supersession's 'stated number' is not bound to its script"

**Carried text (verbatim):** "`statedTallyNumbers` accepts any `N/M` anywhere in the correction paragraph, so a
date (`10/26`, fixture F6) or a round range (`round-30/31`, F9) clears a stale line. The frozen code comment at
`scripts/check-selfassessment.mjs:233` names the looseness ('or restates the figure')."

**Re-check at `4181fff`:**

- The looseness is still there and the anchor moved: the comment is at `:246` — "(d) cites the superseded line
  (or restates the figure)".
- `statedTallyNumbers` (`:264-271`) pushes a number for **any** `N/M` in the text (`:270`), plus `cases: N`
  (`:268`), `N-case` (`:267`), `N cases` (`:269`) and the anchored fraction (`:265-266`), with no binding to the
  script the paragraph names. The binding that *does* exist is on the other axis: the paragraph must start
  after the stale line (`:355`), name the stale line's script (`:357`) and cite its document+line (`:360`), and
  the *number* need only appear somewhere (`:361`).
- Consumers: the same shared function serves all three paragraph windows — `evaluate` `:525` passes
  `"SKILL.md", true` and `:527` passes `"corpus/README.md", true` — so `:361` applies to every correction
  paragraph the round writes.
- Live risk, not a live mismatch: the round-32 correction set is 18 statements (15 m1 + 3 m4), each needing a
  paragraph that states the oracle number; every such paragraph is an opportunity to leave a second `N/M`
  (a date, a round range, a ratio in prose) that equals the tally and clears the *wrong* line. No live
  mis-clear today — the landed corrections state real tallies — but nothing prevents one.

**Verdict:** live, low; anchor corrected from `:233` to `:246`.

**Disposition — DRAFT (append).** Target `corpus/lessons/round-32.md`, end of `## Mistakes`, and it is also a
writing rule the round's corrections must obey. Text:

```markdown
- **Supersession accepts any stated number (round-31 errata E27, live at `4181fff`).** `statedTallyNumbers`
  (`scripts/check-selfassessment.mjs:264-271`) accepts a bare `N/M` anywhere in the paragraph (`:270`), a
  `cases: N` (`:268`) and an `N-case` (`:267`) without binding the number to the script the paragraph names;
  the code comment at `:246` states the looseness ("or restates the figure"). A correction paragraph therefore
  clears a stale tally when *any* accepted number in it equals the oracle tally — a date (`10/26`), a round
  range (`round-30/31`) or a denominator elsewhere can do the clearing. Round-32 corrections state the oracle
  tally once, in a parsed shape, and carry no second number that could equal it.
```

---

## Cross-checks performed (and what was not done)

- Every `path:line` above was read at `4181fff`; the counter digest was verified against
  `claims.json` `.frozenDigests` before any line citation.
- The frozen finding set was read from `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` (rev
  `5ad1fcbf`); `git diff --name-only 5ad1fcbf 4181fff` touches `.ufo/waves/round-32/**` only, so its document
  line numbers hold at `4181fff`.
- **Not done:** no counter re-run, no clone, no browser, no network fetch, no gate self-test. Where a draft
  would need a measured tally this seat does not have (`check-aria-metadata.mjs --selftest`, E23), the erratum
  is refused rather than filled with a plausible number.
- Drafts for E19/E20 target one appended criterion (83) because both concern the same frozen header and the
  same oracle function; appending two criteria would duplicate the same supersession.
