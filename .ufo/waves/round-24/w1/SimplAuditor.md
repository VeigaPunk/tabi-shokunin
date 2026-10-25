# SimplAuditor — YAGNI pass over the C1/C2 plan (round 24, w1)

Seat: `L1Tabi24.SimplAuditor` (leaf member, read-only reporter).
Scope: weigh extending `scripts/round-evidence-audit.mjs` with C1/C2 classes vs the planned
separate gates; recommend the smallest design that satisfies the frozen claims; name dead weight.
No tools installed (none needed; nothing to record under the operator tooling directive).

## Verdict (summary)

**Do not extend `round-evidence-audit.mjs` with a seventh/eighth class.** Keep the two planned
gates as separate scripts — the frozen claims already pin their file names and CLIs, their input
surfaces do not fit the round auditor's contract, and merging would couple two axes into one exit
verdict and inflate the very self-test matrix that produced routed defect 4 (stale 12/12 tally).
The *smallest* design is two small standalone gates that **reuse the proven git-blob reader**
(`gitCtx` + the scrubbed-env pattern) instead of re-implementing it, each with its own minimal
red/green self-test matrix, each with its own landed registry row — plus the missing
`round-evidence-audit` row (defect 1). Dead weight to cut is listed in §5.

## 1. The frozen contract already names the files

`claims.json` is authoritative and frozen before data:

- C1 `countingCommand`: `node scripts/check-gate-registry.mjs --rev <REV> --json`
  (`claims.json:24`).
- C2 `countingCommand`: `node scripts/check-selfassessment.mjs --rev <REV> --json`
  (`claims.json:38`).
- Both `failureCapable` arms name `--selftest` on those exact scripts (`claims.json:30,44`).

L1 will run these commands and the controls were recorded against these counters. So the
"smallest design" cannot be zero new files: the entry points are part of the claim contract.
Merging the logic into `round-evidence-audit.mjs` would still force the two files to exist as
thin wrappers, so the apparent saving is illusory — you would end up with two wrapper files
**plus** mode-switching inside a 1,102-line auditor.

## 2. Why the classes cannot honestly live inside round-evidence-audit.mjs

Evidence (`scripts/round-evidence-audit.mjs`, read at HEAD; exports at lines 37–755):

1. **Input surface mismatch — round-scoped vs lane-wide.** `main()` requires `--round` and
   hard-fails without fleet inputs: `--report` must resolve under
   `/home/vgpnk/Projects/shokunin/.ufo/reports/` and `--policy` must be one of the fleet
   authority files (`:1028-1036,1046-1054`). It reads `corpus/lessons/round-N.md`,
   `.ufo/waves/round-N/`. C1 reads SKILL.md's registry tables + the scripts listing at any
   revision, round-agnostic; C2 reads SCORECARD.md/SHONEN.md at a revision **and the live
   working tree**. These are disjoint input surfaces; hosting them means a second CLI mode with
   its own argument vector anyway.
2. **Working-tree dependency breaks the auditor's documented contract.** The header states it
   "reads no expectations file, writes nothing but stdout/stderr" and its `gitCtx` is
   committed-blob-only (`:99-143`). C2's m3 needs `git status --porcelain` on the live tree
   (observed: 90 porcelain paths at HEAD — `git status --porcelain | wc -l`). Folding m3 in
   changes what the auditor is.
3. **Exit map and verdict shape differ.** The auditor exits 0/1/2/3 (3 = self-test
   disagreement) and emits 6 round-accounting classes. The claims specify 0/1/2 and different
   finding records (`{name, script, row, missing}` / `{class, doc, line, claimed, observed}`).
   One exit would conflate an operability verdict (C1) with calibration verdicts (C2); each
   claim's kill rule demands independent fail-closed behavior (C1: undecidable ⇒
   nonconformant; C2: unparseable ⇒ could-not-evaluate, never a match).
4. **Self-test inventory invariant breaks.** `selftest()` asserts
   `cases.length === CLASSES.length * 2 + 1` (`:732`) — 13 cases for 6 classes. Adding classes
   forces rewriting that invariant for every consumer, and routed defect 4 exists precisely
   because a shared tally went stale (12/12 claimed vs 13 shipped — `grep -c 'runFixtureCase('`
   = 14 at HEAD = 1 definition + 13 cases). More classes in one tally = wider staleness surface
   for m1, which audits all gate tallies including this one.
5. **Convention.** Every prior capability gate in this lane is a distinct script with its own
   registry row in SKILL.md (sources-census, aria-historical-metadata, historical-user-contract,
   measurement-binding, adjacency, freshness, WebMCP harnesses). A multi-claim mega-gate would
   establish a second convention.

## 3. What separation buys vs costs (honest)

**Buys:**
- A dedicated CLI, owner, and registry row per claim (all three are *required* by the Gate
  standard anyway — a row is mandatory for any gate that exists, so this is not a delta cost of
  separation).
- Independent fail-closed verdict per axis (operability vs calibration); one gate's refusal
  cannot taint the other's verdict.
- Correct input surfaces: committed lane-wide docs (C1), self-assessment + live tree + named
  read-only receipts (C2).
- The round auditor stays untouched; it is itself referenced by m1 and by SCORECARD claims, and
  changing it mid-round creates churn.

**Costs:**
- A second self-test harness: small — `runFixtureCase`/`fixtureCtx` already exist and are
  exported (`:146,629`); copy or import the pattern (~100 lines).
- Two more registry rows: mandatory regardless of architecture.
- Two small files in `scripts/`: negligible, and matches convention.

Net: separation is the smaller total design, not the larger one.

## 4. Smallest design that satisfies the frozen claims

- **`scripts/check-gate-registry.mjs`** (C1):
  - Reuse `gitCtx` — `import { gitCtx } from "./round-evidence-audit.mjs"` (works as ESM
    `.mjs` without a package.json; keeps the tree-verified, sha1-re-checked blob reader
    single-sourced). If L1 prefers the repo's standalone-script convention, copy the ~40-line
    pattern; do **not** build a third reader.
  - Parse SKILL.md registry tables in document order; **accept both historical row shapes**
    observed at baseline: six-column packed (`| Name | Kind / owner | Entry and verdict map |
    Self-invocation | Persisted pinned values | Write scope |` at SKILL.md lines 1557, 1612,
    1655, 1675, 1753, 1798) and eight-column canonical (`| Name | Kind | Entry command |
    Verdict map | Self-test | Pinned-value path | Write scope | Owner |` at lines 2388,
    2433) — normalize both to the same eight-field record. Latest row wins per document order.
  - Fail-closed: missing field → nonconformant; row names a script absent at rev →
    nonconformant; gate script with no row → nonconformant (this is what flags
    `round-evidence-audit` at baseline — `git show 573c99e…:SKILL.md | grep -c
    'round-evidence-audit'` = 0, and 0 at HEAD).
  - `--selftest`: red/green per required class, including the mutant that drops one field and
    the mutant that removes the row (claim's `failureCapable`). Exit 0/1/2 only.
- **`scripts/check-selfassessment.mjs`** (C2):
  - m1: compare claimed `--selftest`/N-case tallies in SCORECARD blocks (and SHONEN.md) at rev
    against the static case count derived from committed script bytes (integrator method:
    `grep -c 'runFixtureCase('` − 1 definition). Open item to fix: at baseline the
    lane-committed SCORECARD.md carries **two** stale 12/12 figures (lines 1139, 1151); the
    verifier's third figure sits in the fleet report `.ufo/reports/round-23/tabi.md`, which is
    **outside lane bytes**. Either accept an explicit `--report` input carrying a digest
    (mirroring the auditor's `--report` pattern, `:1031-1036`) or scope m1 to lane-committed
    docs and disclose the count over that scope. The claim's before=4 is frozen over the
    verifier's scope; state the class's measured count over whichever scope is chosen.
  - m2: re-run named read-only receipts' commands in a scrubbed environment (replicate the
    `scrubbedEnv` pattern — it is module-private; ~18 lines); disagreement → mismatch. Refuse
    anything not evidently read-only or not parseable as could-not-evaluate (kill rule), never
    a match.
  - m3: live `git status --porcelain` count while the self-assessment asserts landed rounds;
    **derive the count generically** — no hard-coded 89.
  - `--selftest`: clean fixture + restored-stale-figure mutant (claim's `failureCapable`).
- **Land three rows by tip** in an append-only supersession section: `check-gate-registry`,
  `check-selfassessment`, and the missing `round-evidence-audit` row (defect 1).

## 5. Dead weight in the plan (cut these)

1. **A new shared "audit runner" library** — `scripts/` today has zero cross-script imports
   (grep: none) and no package.json; introducing a library for two small consumers is a second
   convention. Reuse `gitCtx`/the env-scrub *pattern* instead.
2. **Executing the gates under audit inside `check-gate-registry`** — C1 is a byte-level
   conformance check over committed rows; runtime execution belongs only to C2 m2, and only for
   the named read-only receipts.
3. **Human-readable non-JSON output modes** — the claims define the JSON contract; stdout
   should be exactly that (stderr reserved for refusals).
4. **Pinned literals** — no hard-coded 89 / N / 12/12 anywhere; derive all figures from repo
   state.
5. **Semantic validation of verdict-map content** — C1 measures row completeness (eight fields
   present), not whether the declared verdict map is "correct"; adding content judgment widens
   the claim beyond its frozen metric.
6. **`--rev` default fallback** — both claims always pass an explicit rev; a default-tip
   fallback would silently measure the wrong bytes. Require `--rev`.
7. **Self-test case inflation** — each new gate needs only its claim's stated cases (the
   mutants described above); do not copy the round auditor's 13-case inventory style.

## 6. Evidence appendix (exact commands)

- Claims (authoritative): `read .ufo/waves/round-24/claims.json` — C1 at lines 17–31, C2 at
  32–45; counting commands at :24/:38.
- Baseline row absence: `git show 573c99e4885382db38babc3a6fc90e77afeb42a6:SKILL.md | grep -c
  'round-evidence-audit'` → **0**. At HEAD: `grep -c 'round-evidence-audit' SKILL.md` → **0**.
- Registry table shapes at baseline: `git show 573c99e…:SKILL.md | grep -n '| Name | Kind\|Kind
  / owner\|Self-invocation'` → six-column headers at lines 1557/1612/1655/1675/1753/1798,
  eight-column at 2388/2433.
- Gate rows at baseline (six-column style): `git show 573c99e…:SKILL.md | grep -cE '^\| \S+ \|
  gate / tabi'` → **8**; eight-column gate rows also exist (e.g. lifecycle observation count at
  ~2391, finite review-chronology at ~2433+).
- Working tree at HEAD: `git status --porcelain | wc -l` → **90**.
- Stale tallies at baseline: `git show 573c99e…:SCORECARD.md | grep -n '12/12'` → lines 1139
  and 1151 are `--selftest` 12/12 figures; lines 77/79 are historical methodology pins (not
  self-test tallies). Third figure per `corpus/lessons/round-23-verifier-spotcheck.md:101-105`
  is in the fleet report (outside lane bytes).
- Self-test size: `grep -c 'runFixtureCase(' scripts/round-evidence-audit.mjs` → **14** (1
  definition + 13 cases); inventory invariant at `round-evidence-audit.mjs:732`.
- Auditor contract/IO: `round-evidence-audit.mjs:1-29,1022-1088` (round-required, fleet
  `--report`/`--policy` allowlists, exit 2 refusals, committed-bytes header).
- Exports available for reuse: `round-evidence-audit.mjs:37-38,99,146,180,287,629,755`.
- No intra-script imports / package.json: `grep -rn "from \"\./\|from '\./" scripts/` → none;
  `cat package.json` → absent.

## 7. Tradeoff note

If L1 values a minimal file count above all else, the least-bad merge is *not* folding into
`round-evidence-audit.mjs`; it is keeping the two claim-named files as thin wrappers over a
shared internal module. But since each gate is small and shares only `gitCtx` + the env-scrub
pattern, the standalone form costs almost nothing and keeps the two verdicts, owners, and
self-test matrices independent — which is what the frozen claims and the Gate standard assume.
