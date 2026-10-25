# ConnInterface — the two new gates' interfaces vs sibling implementations

Seat: L1Tabi24.ConnInterface (wave 2, read-only). Scope per item: compare
`scripts/check-gate-registry.mjs` (C1) and `scripts/check-selfassessment.mjs` (C2)
against the four siblings `w1/ConnSiblings.md` named — kotoba
`verifiers/check_gate_registry.py`, kama `tools/gate-registry-check.py`, mori
`tools/mori-gate-registry.py`, tsukuroi `tools/check-self-assessment.py` — on exit
codes, JSON field names, self-test spelling, universe derivation; report where
tabi diverges and whether the divergence is lane-justified or a second
convention. Read-only everywhere; siblings were read, never executed. Scratch
fixtures only under `.ufo/waves/round-24/scratch/ConnInterface/` and
`/home/vgpnk/tmp-tabi24` (host `/tmp` is full).

## 0. Measured state at the committed tip (grounding for every claim below)

`TMPDIR=/home/vgpnk/tmp-tabi24` for all runs.

| Command | Exit | Key output |
|---|---|---|
| `node scripts/check-gate-registry.mjs --rev ad125e85 --json` | 0 | `nonconformant=0`, `gates=14`, `rows=23`, `clean=true` |
| `node scripts/check-gate-registry.mjs --rev 573c99e… --json` | 1 | `nonconformant=3`, `gates=12`: e1 on `check-adjacency`, `check-measurement-binding`, `round-evidence-audit` |
| `node scripts/check-gate-registry.mjs --selftest --json` | 0 | `cases=22, passed=22` |
| `node scripts/check-selfassessment.mjs --selftest --json` | 0 | `cases=13, passed=13` |
| `node scripts/check-selfassessment.mjs --rev ad125e85 --json` | **1** | `mismatches=1` (one `m3-unlanded-paths`, `observed=5`), `findings=93`, `couldNotEvaluate=79`, `superseded=5` |
| `node scripts/check-selfassessment.mjs --rev 573c99e… --json` | 1 | `mismatches=5` (4×m1 + 1×m3), `couldNotEvaluate=75` |
| same command in a clean `git clone` of the lane at `ad125e85` | 0 | `mismatches=0`, `couldNotEvaluate=79` |

C1's claims reproduce at both revisions. C2's `after=0` does **not** reproduce at
the tip in this working tree (5 unlanded wave-2 dispatch files: `gen-w2.mjs`,
`w2-dispatch.{json,err}`, `w2-spec.json`, `w2/swarm-registry.json`); it reproduces
only in a clean clone of the same commit. See §3.

## 1. Interface surface comparison

| Surface | C1 / C2 (tabi) | kotoba | kama | mori | tsukuroi |
|---|---|---|---|---|---|
| Revision arg | `--rev REV`, required; resolves via `rev-parse --verify {rev}^{commit}`; accepts refs, echoes resolved 40-hex | `--rev`, required | `--rev`, **defaults to worktree** | `--rev` + `WORK` | `--revision`, required |
| Production exit | 0/1/2; usage+unknown-arg → 2 | 0/1/2; usage → 2 | 0/1/2; usage → 2 | 0/1/2; setup → 2 | 0/1/2 |
| Self-test flag | `--selftest` | `--self-test` | `--selftest` | `--selftest` | `--selftest` |
| Self-test red exit | **3** | 1 | 1 | 1 | 1 |
| `--selftest` + `--rev` | silently ignores `--rev` (exit 0) | refuses (argparse → 2) | n/a | n/a | n/a |
| JSON envelope | `{schema, rev, …}` | `{conformant, of, phantom, verifiers}` | none | none | `{status, checked, mismatches, checks, requested_revision, …}` |
| Counted field | `nonconformant` / `mismatches` | `conformant`,`of`,`phantom` | text `registered R unregistered U defective D` | text `REGISTRY=met|unmet` | `mismatches` |
| Universe derivation | tree convention `scripts/check-*.mjs`, `scripts/*audit*.mjs` **∪ scripts named in gate-kind rows' entry/self-test cells** | tree: every `verifiers/*.{py,sh}` blob | tree: `.ufo/waves/round-*/count-*.py` ∪ `tools/round<N>-*.py` | caller `--audit` list | fixed check set K01–K27 |
| Registry/document scope | **whole SKILL.md**, header-name schema-aware, latest-row-wins | `## Gate registry` section only, exactly one row per verifier | all 5-column tables | `## Gates` section | last `## Axes -` section, round sections |
| Worktree read | never | never | only in default rev=None mode | only `WORK` mode | **never** ("the working tree is never read") |
| Undecidable | fail-closed (nonconformant) | exit 2 whole-run | exit 2 whole-run | exit 2 whole-run | `CannotEvaluate` → exit 2 |
| — in C2 | **fail-open per finding** (`couldNotEvaluate` count, `clean` still possible) | — | — | — | exit 2 |

## 2. Divergences that are lane-justified

- **`schema` + `rev` in the JSON.** No sibling emits either, but PROTOCOL §Gate
  standard ("Two evidences") requires a verdict to name the measured revision —
  kotoba's JSON lacks it, tabi's resolved-`rev` field is the better-aligned one.
  `schema` is a lane-owned version marker; harmless. `mismatches` matches
  tsukuroi's field name exactly.
- **`--rev` required, ref-resolved to a commit.** Matches kotoba/mori; stricter
  than kama's worktree default. Justified: the claim's counting command must be
  reproducible.
- **Latest-row-wins supersession.** ConnSiblings flagged that no sibling does
  this; it is the one divergence *required* by tabi's own append-only documents
  ("never edit above" — an old row can only be superseded by a newer row). The
  rule is tested both ways (`supersession-latest-wins` exit 0,
  `supersession-later-row-red` exit 1). Justified in direction.
- **`--repo` test flag.** kama/mori/tsukuroi share it. Harmless.
- **`--selftest` spelling.** PROTOCOL leaves spelling lane-owned; kama/mori/
  tsukuroi use the same spelling. Tabi's `missingFields` accepts both
  `--self-?test`, which is correct because the lane's own older rows mix the two
  (`check-freshness`/`check-sources` rows say `--self-test`,
  `round-evidence-audit` and the new rows say `--selftest`).

## 3. Divergences that are second conventions or defects

### 3.1 C2's m3 reads the live worktree under a `--rev` contract — and falsifies the committed numbers [the load-bearing finding]

C2's verdict is not a function of its `--rev`: `m3-unlanded-paths` runs
`git status --porcelain` on the *worktree* whenever SCORECARD.md's newest
`## Round N — executed disposition` block exists (`check-selfassessment.mjs:257-273`).
Every sibling refuses this mixing: tsukuroi reads only through Git at one
revision; kumitate `round-gate.mjs` reports `TREE_DIRTY` as its own finding, not
inside a rev-keyed counter. Grounded twice:

- The same revision `ad125e85` yields `mismatches=1` in the lane tree and
  `mismatches=0` in a clean clone of it (§0). The verdict changed on worktree
  state alone.
- The committed receipt `corpus/evidence/round-24/c2-measurements.json` records
  `after.mismatches=1` (m3, `observed=4`) at `b973fde` — while SCORECARD's
  disposition in the same commit chain records "5 → 0 mismatches — **met**:
  tip counts none". The receipt contradicts the verdict it was committed with.
- `claims.json` freezes `before=4` ("three stale `--selftest` 12/12 … one
  unlanded-path"), but the shipped counter measures `before=5` (four m1: the
  three `12/12` tallies plus `check-sources` `25` vs `26` at SCORECARD `:410`).
  The `revisions` block is `[]` — no post-freeze correction was recorded, so
  three documents now carry three different before/after pairs (4→0 in claims,
  5→0 in SCORECARD, 5→1 in the receipt).

The `mismatches` *count* happens to be stable (m3 contributes at most 1), but
the finding payload isn't (`observed=4` in the receipt vs `observed=5` today vs
`89` at freeze) — and under wave-2 in-flight writes the class makes the gate
red by construction while the wave that measures it is running. **Justified?
No lane requirement names it.** The claim text defines m3 over "the working
tree", so the behavior is declared — but declaring it makes the counting
command's output time-dependent, which is exactly what PROTOCOL's "a run over a
moving worktree is not comparable to one over the cited commit" addresses. The
honest shapes are: move m3 into a round-disposition gate (kumitate's
`round-gate.mjs` precedent, where TREE_DIRTY is a finding of its own), or state
m3 as out-of-band context, not as a term in the counted field.

### 3.2 Self-test exits 3 — undeclared in both new rows, violating the clause C1 enforces

Both gates `process.exit(out.ok ? 0 : 3)` on a red self-test
(`check-gate-registry.mjs:439`, `check-selfassessment.mjs` same pattern).
PROTOCOL §Gate standard: "every other code a gate exits (`2`, `3`, `64`, …) is
declared in its registry entry and mapped onto `clean | failed |
could-not-evaluate`". The two new registry rows declare only `0/1/2`, and both
file headers say "any other nonzero code is undeclared and reads as
could-not-evaluate". Demonstrated: a mutant with one flipped expectation exits
**3** (`GATE_REGISTRY_SELFTEST verdict=failed cases=22 passed=21`). So a red
self-test is, by the gate's own verdict map, *could-not-evaluate* — a false
signal to any executor. Siblings uniformly exit 0/1 from self-test. The lane
has an in-lane precedent (`round-evidence-audit` declares `3=self-test
disagreement` in its row, `check-gate-registry.mjs` fixture rows do too), so
the convention is defensible — **the defect is that the two new rows fail to
declare it**. C1's own `verdictMap` predicate only checks 0/1/2 are present;
it cannot see a gate that exits a code its row omits — both new gates are that
gate.

### 3.3 Field predicates are materially weaker than kotoba's — all grounded in scratch fixtures

`--repo` fixtures under `scratch/ConnInterface/` (each a git repo at `HEAD`):

| Fixture | Result | Sibling rule tabi relaxes |
|---|---|---|
| F1a: script with **no self-test handler**, row names `--selftest` | exit 0, conformant | kotoba `has_flag_handler` requires an exact handler in the script; mori requires a `--selftest` mode |
| F1b: pinned cell `in-file` | exit 1, nonconformant | kotoba **accepts** `in-file` (its own self-test asserts it) |
| F1c: pinned cell names `corpus/evidence/does-not-exist.json` | exit 0, conformant | kotoba verifies backticked pinned paths exist at the rev; a dead pin is nonconformant |
| F1d: pinned cell `none` | exit 1, nonconformant | kotoba accepts `none` |
| F1e: one row, `name=alpha`, entry names `check-beta.mjs`, both scripts exist | exit 0, **two gates, both conformant** | kotoba: "entry command lacks <path>" when the entry cell doesn't name the script |
| F1f: a `probe` row with all cells garbage | exit 0, `rows=1`, never validated | kotoba judges probe rows (no `1=failed`, no `--self-test` handler) |
| F1g: verdict map `0=clean; 1=findings; 2=could-not-evaluate` | exit 0, conformant | kotoba requires the exact `clean`/`failed`/`could-not-evaluate` classes |

F1b/F1d are wrong in the strict direction (they reject spellings the reference
implementation and PROTOCOL's row-shape admit); F1a/F1c/F1e/F1f/F1g are wrong in
the loose direction. F1g's synonyms (`findings|red|semantic failed`,
`usage|refus`) are deliberate — tabi's own `adjacency` row uses `1=findings` —
but the class mapping is the *outer* interface PROTOCOL governs, so this is a
second convention, not a lane requirement. None of these predicate choices is
named in the claim; they are unexplained divergence from the reference
implementation the wave-1 connector recommended mirroring.

### 3.4 Universe derivation: row-union inflates the denominator with historical prose

Tabi's gate set = tree convention **∪ scripts named in gate-kind rows**
(`check-gate-registry.mjs` `scriptsInRow` over `entry`+`selftest` cells). At the
tip this yields `gates=14`, not the 11 the round-24 restatement names: the
union pulls in `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs` plus
three historical measurement scripts (`.ufo/waves/round-21/measure-c1.mjs`,
`.ufo/waves/round-22/measure-c1.mjs`, `.ufo/waves/round-22/check-review-
chronology.mjs`) whose *old rows* name them. Two consequences no sibling has:

- The metric's denominator is a function of append-only prose, not the tree —
  `gates` grew 12→14 this round without a new script landing that matches the
  convention (measurement scripts in old rows are counted as gates).
- Phantom rows fold into `nonconformant` *gates* (e3) instead of a separate
  `phantom` count, so `nonconformant` is not expressible as kotoba's
  `of - conformant`; `gates` includes scripts that don't exist.

The union *is* needed for `claim-record-discipline` (a real registered gate
outside `scripts/` — kotoba's tree-only rule can't see it either). But the
append-only requirement is satisfiable without it: scope the scan to the
newest `## Round N — gate registry` block (kotoba/mori's heading-scoped shape)
plus the tree convention, and old rows stop feeding the universe while
corrections stay append-only. As shipped, scope + union + latest-wins is three
coupled second conventions where one (heading scope) does the work.

Blind spot measured: 14 `scripts/*.mjs` sit outside the naming convention and
no row (`aria-loopback`, `pstack-*`, `user-*`, `webmcp-*` ×6, `freshness-witness`,
`selftest-measurement-binding`); `grep could-not-evaluate` over their rev blobs
finds 0, so no verdict-shaped script escapes today — the convention is currently
complete but only name-deep.

### 3.5 C2's m2 is a class that cannot fire — a probe registered as a mismatch class

The closed grammar admits only `git cat-file -e <rev>:<path>` and `git show
<rev>:<path>`. At the tip: 76 findings, **75 could-not-evaluate**, 0 counted;
at the baseline: 76 findings, 1 measured (matched), 0 counted. The lane's
receipts record `sed`/`sha256sum`/`ls`/`node` commands — outside the grammar by
design — including the round-24 `c1/c2-measurements.json` receipts themselves
(`node scripts/… --rev …` commands → CNE). So m2 has counted zero at every
measured revision, and per PROTOCOL "a tool that cannot fail is a probe". The
claim's killRule requires disclosing a null class; the disposition and the
receipt record `couldNotEvaluate` counts but do not disclose m2 as a null
class. The grammar is a defensible no-shell choice — but then the class should
be registered as context, or widened to kumitate's `git archive` + recorded-argv
shape (exit **and** stdout sha256, which m2 does not check anyway).

Related: m1's oracle requires the rev blob byte-identical to the runnable
working copy (else CNE) where tsukuroi extracts the rev via `git archive` and
runs there — a capability loss with no safety gain, and it is what makes a
stale-tally measurement impossible on any gate edited after the measured rev.

### 3.6 C2 reads SCORECARD.md only; the claim declares SHONEN.md

`claims.json` declares the counter compares "(SCORECARD.md blocks that name a
lane gate script, **and SHONEN.md**)". `grep SHONEN scripts/check-selfassessment.mjs`
→ 0 hits; `evaluate` reads only `SCORECARD.md`. Claim scope exceeds the shipped
interface. Compounding it: m1 scans SCORECARD.md only, so the stale self-test
tallies in both new gates' own headers (`check-gate-registry.mjs:7` "15 isolated
cases" vs emitted `cases=22`; `check-selfassessment.mjs:8` "10 isolated cases"
vs emitted `cases=13`) are invisible to the calibration gate — the instrument
cannot see the m1-class defect in its own docstrings.

### 3.7 Minor: `--selftest --rev` silently ignored; fail-open CNE

`--selftest --rev <X>` exits 0 running the self-test, ignoring the rev (kotoba
refuses the combination, exit 2). Harmless today, but a mistyped command gets a
green from a different run than the caller named. And C2's `clean` can be true
with `couldNotEvaluate>0` — a declared killRule, but the opposite of C1's
fail-closed rule and every sibling's exit-2 policy; the two new gates disagree
with each other on undecidability.

## 4. Verdict per axis the item names

- **Exit codes:** production 0/1/2 aligned fleet-wide; **self-test red exit 3
  is a second convention, undeclared in the new rows** (§3.2). Usage=2 aligned.
- **JSON field names:** `schema`/`rev`/`mismatches` justified; missing
  `of`/`phantom`/`conformant` vocabulary makes the count inexpressible in
  kotoba's terms (§3.4); `counted` vs tsukuroi `checks` is cosmetic.
- **Self-test spelling:** `--selftest` aligned with lane majority and PROTOCOL;
  both spellings accepted is correct; no defect.
- **Universe derivation:** the union and document-wide scan are the largest
  divergence; justified only for the one out-of-`scripts/` gate, otherwise
  second conventions with a measurable cost (14-gate denominator from prose,
  phantom rows folded into `nonconformant`, m3's worktree oracle breaking the
  rev-keyed contract) (§3.1, §3.4).

## 5. Proposed move (bounded, declaration-only + one scope decision)

Not executed — reporter lane. Ordered by cost:

1. Declare `3=selftest disagreement` in both new gates' registry rows (mirroring
   the `round-evidence-audit` row already in the same section) — closes the
   PROTOCOL clause with a two-line append, improves operability, harms nothing.
2. Add `of` (= `gates.length`) and `phantom` (= e3 count) to C1's JSON —
   additive fields, zero behavior change, makes the counted field comparable to
   kotoba's vocabulary.
3. **Scope decision for m3:** either move `m3-unlanded-paths` out of the
   `--rev`-keyed counter into a round-disposition gate (kumitate `round-gate.mjs`
   shape), or keep it and state in the row that one class is worktree-oracled.
   A `git archive` rev-keyed m3 cannot exist — "unlanded paths" is a worktree
   property by definition — so the current shape makes the counting command
   time-dependent; the receipt's own `after=1` is the evidence. This is the one
   decision that determines whether C2's `after=0` is a measurement or a moment.
4. Tighten predicates to the reference shape (entry names the script; pinned
   path resolves at rev or is a declared `in-file`/`none`; self-test flag has a
   handler; probe rows validated) — larger change; do it only if the L1 accepts
   that "missing or incomplete" under §Gate standard means what kotoba/mori
   implement, not what F1a–F1f currently accept.

## 6. Evidence index

- Runs: §0 table (commands verbatim); `git clone --no-hardlinks` →
  `tmp-tabi24/clone` for the clean-worktree comparison.
- Fixtures: `.ufo/waves/round-24/scratch/ConnInterface/F1{a..g}*/`,
  `mut-gate.mjs` (exit-3 demonstration).
- Reads: `check-gate-registry.mjs:100-115` (Refusal/git), `:236-263` (universe
  union), `:280-295` (field predicates), `:305-345` (CASES), `:427-439`
  (`exit(3)`); `check-selfassessment.mjs:120-160` (m1 byte-identity oracle),
  `:216-250` (m2 grammar), `:257-273` (m3 porcelain), `:278-295` (`evaluate`,
  `clean: counted.length===0`), `:560-574` (`exit(3)`).
- Siblings: kotoba `:112-137` (universe), `:178-242` (`judge_row`/
  `has_flag_handler`), `:339-374` (CLI/JSON/exit, `--self-test` exclusive),
  `:245-320` (self-test asserts `none`/`in-file` accepted, pinned-path-checked,
  probe predicates); kama `:3-30` (universe regex), `:300-385` (self-test
  returns 0/1, `--rev` default worktree); mori `:250-308` (0/1/2, `WORK` mode);
  tsukuroi `:1052-1123` (`CannotEvaluate`→2, `--revision`, one JSON object).
- Repo evidence: `SKILL.md:2455-2478` (round-24 eight-column restatement incl.
  `3=self-test disagreement` on the `round-evidence-audit` row);
  `SCORECARD.md:1188-1248` (corrections block, disposition, "5 → 0 met");
  `corpus/evidence/round-24/c1-measurements.json` (3→0, gates 12→14),
  `c2-measurements.json` (**before=5, after=1**, `couldNotEvaluate=75`);
  `.ufo/waves/round-24/claims.json` (before=4, `revisions: []`,
  SHONEN.md in the declared scope); `PROTOCOL.md:375-410` (§Gate standard);
  `.gitignore:5` (`.ufo/waves/*/scratch/` ignore — m3 ignores my fixtures).

Report: .ufo/waves/round-24/w2/ConnInterface.md
