# CritNoHarm — round-24 no-harm critique (tabi, leaf seat)

Author: L1Tabi24.CritNoHarm (critic, leaf member — no delegation). Scope: the no-harm claim of
the round-24 plan as frozen in `.ufo/waves/round-24/claims.json` (authoritative). Read-only:
no tracked file edited, no git/jj write, no installs (none needed). Every number below carries
the command that produced it; observation / inference / unknown are separated.

## Axes attacked

1. **Prior-round evidence byte preservation** — does the plan change or delete bytes that
   prior rounds' claims, reports, receipts or counters cite?
2. **Append-only rule adherence** — does each change fit the lane's documented append-only
   convention, or does it edit filed bytes?
3. **Closure readability** — would a closure (the round-23 verifier pattern) read the change as a
   rewrite of filed bytes?
4. **Re-derivation integrity** — does any change break a re-derivation the round-23 closure
   already performed?

## Baseline facts (re-measured)

- Committed scratch at the baseline tip: 1,034 paths, all under `.ufo/waves/round-23/scratch/`
  (`git ls-tree -r --name-only 573c99e | grep -cE '\.ufo/waves/.*/scratch/'` → 1,034;
  closure measured 25.7 MB: `git ls-tree -r -l c90dffd .ufo/waves/round-23/scratch | awk` sum).
- Closure (573c99e) added only `corpus/lessons/round-23-verifier-spotcheck.md` (+137 lines).
  Its owning-axis-harm check: `git diff --shortstat a89f1935 c90dffd` → 1,149 files changed,
  248,333 insertions(+), **0 deletions**; `git diff --diff-filter=D` empty.
- Shipped selftest matrix at tip: **13 cases** (`git show 573c99e:scripts/round-evidence-audit.mjs
  | grep -c 'runFixtureCase('` → 14 = 1 definition + 13 cases; inventory `cases.length === CLASSES.length*2+1` = 13).
  At `03c1b4d` it was 12 (13 `runFixtureCase(`); the 13th arm (c2 round-total red) landed in
  `43e9bb5` (LOG.md:1730 "selftest 13 cases").
- `SKILL.md` at baseline carries **zero** `round-evidence-audit` mentions
  (`git show 573c99e:SKILL.md | grep -c 'round-evidence-audit'` → 0 — routed defect 1).
- Working tree at closure: 89 porcelain paths (2 M, 87 ??) — verifier spot-check defect 2.

---

## 1. The 1,034 committed scratch paths (M5 cleanup)

**What the plan does:** delete them, preserving "the cited evidence" (claims.json preamble).

**Preservation analysis.** 38 committed non-scratch files cite literal `waves/round-23/scratch/`
paths (`git grep -n -E 'waves/round-23/scratch/' 573c99e -- .ufo/waves/round-23/w1 w2 control corpus`
→ 38 files). The citations are of two kinds:

- **Evidence bodies** (raw bytes a finding/quotation check operated on):
  - `scratch/SrcS102/rfc6265bis-13.txt`, `scratch/SrcS103/owasp-csrf.{html,txt}`,
    `scratch/SrcDivergence/owasp-csrf.html` — cited by ScribeGate, ScribeScorecard, ScribeSources,
    RevCoverageGround, ExecRecheckDates, W2Cheat as the byte substrate for round-23's C2 quote
    verification. The two fetch digests are recorded in `corpus/evidence/round-23/c2-measurements.json`
    (`digests.S102 = 06223931…d85fbf` matches the verifier's curl digest), so the *digest claims*
    survive deletion, but the pinned bytes themselves vanish from the tree.
  - `scratch/MutClassFalsifiers/**` (621 paths) — cited by w1/MutClassFalsifiers.md (audit.mjs)
    and w2/W2Cls4.md (finding F6: "117 fixture copies under …/MutClassFalsifiers/** are counted as
    attempt receipts"). W2Cls4's F6 demonstration cannot be re-executed at tip without these
    fixtures.
  - `scratch/W2NoHarm/*.strace` + `audit-y.json` — cited by w2/W2NoHarm.md as the strace
    evidence bodies (report line 45–48).
  - `scratch/CritControl/skipwork-roundkeyed.mjs`, `report-attempt-word.md`; `scratch/L1Tabi23.D4StaleAttempts/grade-scan.py`,
    `green-stale-lane.md`; `scratch/ExecAppendNormalize/SOURCES.block.md`;
    `scratch/ExecBlobReader/read-at-rev.mjs`; `scratch/ExecCliContract/refuse.mjs`, `p21.json`,
    `p22.json`; `scratch/ExecCollisionGuard/fx/**`; `scratch/ExecNoHarmGuard/**`;
    `scratch/RevMinWaveIntegrity/policy-loose.json`; `scratch/RevRenumber/**`;
    `scratch/ScribeGate/audit-round22.json`, `audit-round21-tip.json`, `selftest.json`,
    `src-flat.txt`, `entry-flat.txt`; `scratch/SrcS102/**`, `scratch/SrcS103/**`;
    `scratch/W2Cheat/faketree/**`; `scratch/W2Cls1/c1-mutants.mjs`; `scratch/W2Cls4/**`;
    `scratch/D3GateSpot/**` — tool/fixture provenance citations in committed w1/w2 reports.
- **Dispatch-generator instructions** (`gen-w1.mjs`) — not evidence; safe to ignore.

**Verdict:** deletion **preserves** the append-only rule (scratch is not one of the six mutable
docs, and the cleanup is the round-23-owed M5, recorded in LOG.md:1738–1741 "Not fixed,
disclosed: M5 (scratch over-commit, cleanup commit owed)"). But the plan's "cited evidence
preserved" clause is **underspecified**: if "cited" is read as *every path a committed report
mentions*, the preservation set covers ~20+ seat dirs including all 621 MutClassFalsifiers paths
and the SrcS10x/103 fetch bytes — i.e. most of the 1,034 paths, making the cleanup nominal. If
"cited" is read narrowly (only digest-pinned or claim-required bytes), ~20 seat dirs dangle:
a closure reading tip will find committed reports citing absent files, which is a new harm the
round-23 closure did not have (it observed 0 deletions). **Smallest safe correction:** define the
preservation set explicitly in the round's plan/LOG as *all paths cited by committed non-scratch
reports*, delete only the rest, and name the kept set in the landing commit message.

**Closure readability:** a deletion of committed bytes is the first non-additive change in the
lane's recent history (round-23 closure verified 0 deletions). It is not itself a rewrite of any
doc, but a closure will read it as an evidence-set change — acceptable only if the kept set is
explicit.

**Re-derivation check (axis 4):** the round-23 closure's re-derivations are all git-blob
commands (`git show <rev>:…`, `git grep <rev>`, `git cat-file -e <rev>:…`, `node scripts/… --rev …
`) plus external `curl` re-opens for the discernment spot-check; none read committed scratch
(`corpus/lessons/round-23-verifier-spotcheck.md` §2–§3). `git cat-file -e` on the auditor at the
baseline exits 128 (instrument absent). The control receipt `fixtures/skipwork-receipt.json` has
zero scratch references. **Deleting scratch breaks no closure re-derivation.** The only closure
adjacent loss is re-executability of certain *report findings* (W2Cls4 F6, ScribeSources quote
checks), which is a citation-integrity issue, not a claim re-derivation.

---

## 2. The 89 unlanded paths

Closure-time composition (verifier defect 2): 2 M (`.ufo/waves/round-23/w2/W2LandedCites.md`
−23/+19, `W2Simplifier.md` +1) + 87 ?? (67 empty numeric-named files at root, `w1-dispatch.err`,
`w1-record.err`, `w2-dispatch.err`, `w2-record.err`, scratch subtrees, `.ufo/waves/round-23/assimilation/`).
Current state has drifted (peers writing): 66 empty numerics (all 0 bytes, `du -ch 179291*` → 0
total), 4 M (adds `corpus/evidence/round-19/selftests/c1.json`, `c3.json`), plus untracked
`scripts/check-gate-registry.mjs` and `.ufo/waves/round-24/`.

Per-path resolution risk:

- **`W2LandedCites.md` (M): closure-readable REWRITE.** The worktree version is 29 lines vs 34
  committed; it replaces the verdict paragraph, renumbers/rewords findings, and rewrites "Verified
  clean" (18 insertions / 23 deletions). Committing it as-is changes a prior-round report's bytes
  at tip **without any appended correction entry** — exactly the pattern the verifier flagged
  ("the committed W2 text and the reviewer output diverge and no correction entry says so").
  **Smallest safe correction:** discard the worktree rewrite; append the revised content as a new
  dated section (or as a new report) rather than replacing the filed report. `W2Simplifier.md`
  (+1 line) is a pure append ("Drift after that pin: the live file is now `ddee0113…` … 13
  in-memory cases") — safe to commit.
- **`corpus/evidence/round-19/selftests/c1.json`, `c3.json` (M): prior-round evidence edits.**
  Diffs show only `generatedAt` rewritten (`2026-10-21T09:10…` → `2026-10-25T08:17…`) and the
  `argv[1]` path changed (`/fast/scratch/tabi-r19/…` → repo-local). These are regenerated round-19
  receipts sitting in the working tree; committing them edits filed prior-round evidence in place.
  **Smallest safe correction:** do not commit these edits; restore the committed blobs and, if a
  regeneration matters, land it as a new receipt, not by editing round-19's.
- **66–72 empty numeric-named root files:** zero bytes; unreferenced (pure-digit names); deletion
  loses nothing (`wc -c` → 0).
- **Scratch subtrees untracked** (`CritDeterminism/proof/`, `ExecBlobReader/lane-clone/`,
  `W2C2Counter/`, `W2Determinism/clone/`, `sibling/`, `W2LandedCites/*.mjs|json`,
  `W2Log/SOURCES-base.md`, `W2NoHarm/strace*.txt`, `W2SelfAudit/final-head.json`): `W2C2Counter/`
  fixtures are cited by committed `w2/W2C2Counter.md` ("Fixtures …/W2C2Counter/{repo2..repo5}")
  which notes they were deliberately left uncommitted. Committing any of these would re-add scratch
  (contradicting M5); deletion is safe — the citation was already to uncommitted material.
- **`assimilation/`:** working fixture tree (`validate/corpus/knowledge/**` mirrors); untracked;
  delete, do not commit.
- **`w1-dispatch.err`, `w1-record.err`, `w2-dispatch.err`, `w2-record.err`:** stderr captures;
  throwaway.
- **`scripts/check-gate-registry.mjs` (untracked):** this round's own new gate; will land as part
  of C1 — fine, but it must itself receive a registry row (see §4).

---

## 3. The three stale SCORECARD figures

**Identity (all in the round-23 section of `SCORECARD.md` @573c99e):**
- `:1138` — "with a **12-case** in-memory matrix and a six-repair evidence-keyed matrix" (N-case tally);
- `:1139` — "Evidence: `scripts/round-evidence-audit.mjs`, `--selftest` (**12/12**), …";
- `:1151` — "`--selftest` **12/12** exit 0; …" (C1 executed-disposition row).

Lines 77 and 79 also contain "12/12" but are historical round-4/round-6 pin verdicts, not
`--selftest` tallies — not part of the three. Staleness is real: the shipped matrix is 13 cases
at tip (see baseline), and LOG.md:1730 + the lesson's `## Gate` already say 13; the scorecard is
the laggard (verifier defect 4). The three are exactly the C2 m1 before-count.

**Two mechanisms:**
- **In-place edit** of `:1138/:1139/:1151` → violates the lane's documented convention written in
  the very same section ("Corrections … (append-only, after wave-2 review)", "Capability row
  (appended; … is not edited in place, per the append-only mutable-docs rule)", and SKILL.md
  "Errata — … (append-only; never edit above)"). A closure's rewrite check (the round-23
  "Report is not a post-filing rewrite" check) would read in-place edits of a filed section as a
  rewrite. **Not acceptable.**
- **Appended correction** (extend "### Round 23 — corrections" with a "13-case supersedes the
  12/12/12-case texts above" sentence; also fix the report's "Work performed" by append, not
  edit). This preserves bytes. **But:** the C2 counter as described in claims.json counts
  mismatches between self-assessment and observed state, with **no supersession semantics for m1**
  (unlike C1's "latest row wins"). If the L1 counter flags any disagreeing assertion, three
  appended-only correction leaves `:1138–1151` still text the fact and the count cannot reach 0.
  The smallest safe correction therefore has two parts: (a) land the correction as an append; (b)
  specify in the C2 counter (and in the claim's API text) that a later superseding tally statement
  supersedes earlier ones in document order for m1 — mirroring the registry rule — so the counter
  is not forced to rewrite filed bytes to zero.

---

## 4. SKILL.md registry rows (append-only supersession)

**Baseline:** `SKILL.md` has the registry tables in the exact eight-field shape the C1 claim names
(name · kind gate|probe · entry command · verdict map · self-test command/spelling · pinned-value
path · write scope · owner) — see the Round-21 and Round22 "runnableable artifacts registry"
tables. `round-evidence-audit` has **no row anywhere** (routed defect 1). The round's two new
gates (`scripts/check-gate-registry.mjs`, `scripts/check-selfassessment.mjs`) will likewise need
rows.

**Append-only supersession:** adding a new section/rows for round-23/24 gates is pure insertion —
consistent with the closure's 0-deletion precedent and the "never edit above" convention; a
closure reads it as an append. **Risk:** if the implementation retrofits an *existing* row
(e.g. patching the Round22 table) to complete a field set, that is in-place editing of SKILL.md's
prior section — closure-readable as a rewrite. **Smallest safe correction:** only insert new rows
(in a new registry section or as appended rows at the end of a table); never modify existing rows;
let a later row supersede an earlier one in document order (already the C1 gate's stated rule).

---

## 5. Re-derivation summary (axis 4)

| Artifact | Closure re-derivation uses scratch? | Impact of deletion |
|---|---|---|
| C1/C2 counters & receipts | No — `git show`/`git grep`/`git cat-file` at revs; curl re-opens | none |
| Control receipt `fixtures/skipwork-receipt.json` | No — no scratch refs | none |
| `corpus/evidence/round-23/c1|2-measurements.json` | No — commit rev-pinned | none |
| Report-finding evidence bodies (SrcS102/103, MutClassFalsifiers, straces, …) | Re-execution only | citations dangle unless preserved |

**Conclusion:** no claim re-derivation performed by the round-23 closure breaks under the M5
deletion. The harm surface is citation integrity, not counter reproducibility.

---

## Overall verdict

The plan's no-harm claim **holds** for: appending SKILL.md registry rows (§4, if insertion-only);
the M5 cleanup as an *owned, recorded* deletion of throwaway bytes (§1 — re-derivation intact);
deleting the empty numerics, err captures, untracked scratch remnants and assimilation fixture (§2).

The no-harm claim **fails as written** on three points, each with a smallest safe correction:

1. **Preservation set undefined (§1)** — "cited evidence preserved" must be enumerated (the 38
   committed citing reports and their seat dirs); otherwise either scratch stays mostly intact
   (cleanup nominal) or committed reports dangle to absent files (new harm).
2. **`W2LandedCites.md` rewrite-in-progress (§2)** — committing the worktree version is a
   closure-readable rewrite of a prior-round report; discard and append instead. Likewise do not
   commit the round-19 selftest receipt edits.
3. **Scorecard correction mechanism (§3)** — in-place edits of `:1138/:1139/:1151` are a rewrite;
   append-only correction requires the C2 counter to gain explicit latest-statement-wins semantics
   for m1 or the target cannot be met honestly without a rewrite.

Nothing above requires touching any axis score, and no non-author judgment is asserted.
