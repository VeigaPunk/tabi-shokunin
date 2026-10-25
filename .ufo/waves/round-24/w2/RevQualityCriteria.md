# RevQualityCriteria — QUALITY.md criteria 64 and 65 (round-24 wave-2 review)

Seat: `L1Tabi24.RevQualityCriteria`. Scope: mechanical applicability, grounding in this
round's evidence (lesson M1/M2 and routed round-23 defects 1/2/4), duplication with existing
criteria, would-they-have-caught-the-named-defect, numbering and the append-only rule.
All paths below are lane-relative under `/home/vgpnk/Projects/shokunin/tabi-shokunin`; all runs
were performed by me this session against lane tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08`
with `TMPDIR=/home/vgpnk/tmp-tabi24`.

## Findings by severity

### F1 (high) — Criterion 64's first sentence is internally contradictory, and its completeness conclusion is overstated

`corpus/QUALITY.md:331-332` reads: *"the gate set is derived from the revision's own scripts
(a naming convention plus the scripts rows invoke), never from the registry, so the registry
cannot vouch for its own completeness"*. The parenthetical concedes that **registry rows**
contribute to the gate set — confirmed in `scripts/check-gate-registry.mjs:256`
(`if (!gates.has(script)) gates.set(script, { name: row.name, script });` — a gate-kind row's
script cell adds to the set; the row itself is a registry row). So "never from the registry"
is false as written, and a mechanical reader cannot resolve which limb is the rule without
reading code.

The completeness conclusion is also overstated: the gate set is
`GATE_CONVENTION = /^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/` (script line 62)
∪ row-named scripts, so any gate named outside that convention and absent from rows is
invisible, and the registry *does* vouch for its own completeness over that class. At tip,
`scripts/` holds 23 `.mjs` files (`ls scripts/`), the gate set is 14
(`node scripts/check-gate-registry.mjs --rev ad125e8 --json` → `gates.length` 14); the 9
unconventioned scripts (`freshness-witness`, `pstack-*`, `user-*`, `webmcp-*`,
`aria-loopback-round13`, `selftest-measurement-binding`) are helpers/probes today, so no live
missed gate — the overstatement is structural, not an observed nonconformance. The criterion
also does not spell the convention pattern; "a naming convention" is uncheckable without the
regex.

### F2 (high) — Criterion 65's clean-tree clause is internally incoherent and unimplemented; the round's own receipts violate it

`corpus/QUALITY.md:345-346`: *"A class whose 'before' is a working-tree property is measured
with a clean tree and says so, because a fresh checkout scores it zero by construction."*
Read literally, measuring that class (m3) with a clean tree is exactly the condition under
which it scores zero — so the clause prescribes the one input that makes the class unable to
fire. If the intent is that the *after* run must be on a clean tree, the text does not say
"says so" binds to any artifact: the counter's JSON carries no tree-state field
(`--json` keys: `schema, rev, mismatches, findings, counted, couldNotEvaluate, superseded,
clean`), and the instrument accepts no tree-state input (`--rev|--selftest|--repo` only,
script usage line).

The round's own evidence does what the clause prohibits:
`corpus/evidence/round-24/c2-measurements.json` records `after.mismatches = 1` (an
`m3-unlanded-paths` count of 4 on a dirty tree at `b973fde`), and `before.mismatches = 5`
while frozen `claims.json` declares `before: 4`, `after: 0` and `revisions: []` is empty
(`cat .ufo/waves/round-24/claims.json`; `node -e` print). The SCORECARD disposition
(`SCORECARD.md:1227`) asserts "5 → 0 mismatches … tip counts none", which no committed
receipt shows: `c2-tip.json` at `b973fde` has `mismatches: 1`. Re-run by me at the reviewed
tip: `TMPDIR=/home/vgpnk/tmp-tabi24 node scripts/check-selfassessment.mjs --rev ad125e8…
--json` → `mismatches: 1`, exit 1, the counted finding being `m3-unlanded-paths` observed 5 —
exactly this wave's five untracked artifacts (`git status --porcelain`: `gen-w2.mjs`,
`w2-dispatch.err`, `w2-dispatch.json`, `w2-spec.json`, `w2/`). So at any wave-2 tip the
counter reads failed by construction of the review itself — a wave-2 reviewer cannot apply
criterion 65 to get a clean verdict.

### F3 (high) — Criterion 65 cites routed defect 2 but the named instrument cannot have caught it, and misattributes live paths to a historical round

Defect 2 is *"Uncommitted round work at closure — 89 paths"* (`corpus/lessons/
round-23-verifier-spotcheck.md:91`). The m3 class (`scripts/check-selfassessment.mjs:262-274`)
runs `git status --porcelain` **now** and keys the finding to the newest
`## Round N — executed disposition` block in the SCORECARD blob at `--rev`. It therefore
cannot observe any past tree: the 89 never enters a receipt (`grep 89
corpus/evidence/round-24/*.json` → 0 hits). In my baseline run
(`--rev 573c99e --json`) the m3 finding reported `round: 23, observed: 5` — today's five
wave-2 files attributed to round 23's landed claim, a misattribution the criterion does not
guard against. For "would it have caught the defect it names": defect 4 (stale 12/12) —
yes, verified below; defect 2 — no; it detects a lookalike at whatever tree the caller
happens to have.

### F4 (medium) — The lesson anchors are misassigned between 64 and 65

Criterion 64 cites `(lesson: corpus/lessons/round-24.md#m1)`. Round-24 M1 (`### M1 — a counter
that infers an association manufactures findings`, `corpus/lessons/round-24.md:37`) is about
`check-selfassessment.mjs`'s per-line tally association, and the lesson itself states
*"QUALITY criterion 65 encodes the rule."* Neither M1 nor M2 names criterion 64. Criterion 64's
true support is only its routed-defect citation (defect 1, verified real); the `#m1` anchor is
unsupported by the section it points to. Criterion 65 cites `#m2` (supported — M2 is the
stale documented number, `corpus/lessons/round-24.md:55`) but omits the `#m1` anchor the
lesson explicitly assigns to it. `#m1`/`#m2` as anchors match lane convention
(`corpus/lessons/round-22.md` also uses `### M1 —` headings and is cited the same way in
criterion 59), so the defect is mapping, not anchor syntax.

### F5 (medium) — Both instruments that the criteria cite carry stale self-test figures, and 65's mechanism cannot reach them — or the claims/disposition figures

- `scripts/check-gate-registry.mjs:7`: `Self-test: --selftest (15 isolated cases …)`;
  `node scripts/check-gate-registry.mjs --selftest` → `cases=22 passed=22`. The count was
  20+2 cases at the file's landing commit (`git show f6f7f45:scripts/check-gate-registry.mjs
  | grep -c '^  { id: "'` → 20), so the header was never true.
- `scripts/check-selfassessment.mjs:8`: `Self-test: --selftest (10 isolated cases …)`;
  `--selftest` → `cases=13 passed=13`. Accurate at `f6f7f45` (10 ids), stale after `b973fde`/
  `ad125e8` — the exact M2 pattern, inside the instrument, in the round that lands 65.
- Criterion 65's window is SCORECARD.md only (`m1Findings` receives only the SCORECARD blob;
  `grep -n SHONEN scripts/check-selfassessment.mjs` → nothing). The criterion names neither
  the window nor "self-assessment figure" as a defined term, so claims.json (`before: 4`
  vs measured 5, `after: 0` vs receipt 1), SHONEN.md (named in claim C2's declared scope
  but never read), LOG.md (`LOG.md:1664` stale twelve, disclosed open in
  `corpus/lessons/round-24.md` "Open, carried"), and script headers all escape — including
  the round's own "tip counts none" prose, which m1's tally patterns cannot see.
  A reader applying 65 cannot tell what is in scope without reading the script.

### F6 (medium) — No `Refines N:` / `Supersedes` marker on either criterion, against the file's own convention

QUALITY.md uses `Refines 4 and 24` (:131), `Refines 14/27` (:214), `Refines 45` (:219),
`Refines 40/44/46` (:224), `Refines55`/`Refines51` (:269,:284), and `Supersedes criterion 12`
(criterion 15) when a rule specializes an earlier one. 64's "every required field carries a
red mutant and a green control" refines 6 (self-test asserts each refusal, :7) and 60
(detector needs positive and negative control, :303); 65's figure-vs-instrument rule
refines/adjacent-contradicts 61 ("a round-evidence figure is **derived from the round's own
receipts**, never restated from prose", :309) vs 65's "never against a committed **receipt**
that may itself carry the stale figure" — for a figure that lives in both a receipt and
SCORECARD, 61 and 65 point opposite directions and neither names the precedence. Duplication:
no earlier criterion covers the core rules (registry-row conformance; figure-vs-instrument) —
`grep -n "registry\|self-assessment" corpus/QUALITY.md` outside 64/65 hits only unrelated
uses — so they are not duplicates, but the missing markers make the overlap a reader's
judgment call, which is unmechanical.

### F7 (low) — Precision and pointer gaps

- 64's "every required field carries a red mutant **and a green control**": the 22-case
  matrix (`--selftest` run by me) has one red mutant per eight fields — `name-empty`,
  `kind-column-absent`/`probe-row-for-convention-gate`, `entry-cell-none`,
  `verdict-map-incomplete`/`verdict-code2-dropped`, `missing-selftest`/`selftest-flag-typo`,
  `pinned-value-missing`, `scope-missing`, `missing-owner` — but the green controls are
  shared (`clean-canonical-row`, `clean-legacy-six-column-row`,
  `supersession-latest-wins`, `audit-convention-name`, `row-named-gate-outside-scripts`),
  not per-field. Literal reading unmet; charitable reading met.
- "§Gate standard" is external and unpath'd in the criterion (no lane `PROTOCOL.md`; the
  spec lives at `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/PROTOCOL.md`),
  unlike criteria 12/15 which give absolute spec paths.

## Verified mechanically (non-findings)

- Numbering: `node` sweep over `corpus/QUALITY.md` → 65 numbered items, 1..65 contiguous, in
  order, no duplicates; 64/65 occupy :331 and :340.
- Append-only: `git diff 573c99e..ad125e8 -- corpus/QUALITY.md` is a pure append (one blank
  line + criteria 64, 65); no earlier criterion edited.
- 64 sub-rules verified in code/cases: header-name parsing (`fieldOf`/`col` at
  `scripts/check-gate-registry.mjs:148-158`); later-row supersession
  (`supersession-latest-wins`/`supersession-later-row-red` PASS); gate-set convention
  (`GATE_CONVENTION` :62); eight-field mutants red, exit codes match CASES.
- 64 **does** catch its named defect: `node scripts/check-gate-registry.mjs --rev 573c99e…
  --json` → `nonconformant: 3`, findings `e1-missing-row` for `round-evidence-audit`
  (routed defect 1) plus `check-adjacency`, `check-measurement-binding`; tip → 0, exit 0.
- 65 catches routed defect 4: `--rev 573c99e --json` → m1 findings at SCORECARD
  :410 (25 vs 26) and :1138/:1139/:1151 (12 vs 13); supersession verified: tip reports the
  five stale mentions `superseded: true` and `superseded: 5` in the JSON, satisfying "the
  counter reports the superseded mentions" (`scripts/check-selfassessment.mjs:212`).
- `cases=22` and `cases=13` cited by 64/65 are accurate as CASES counts (`--selftest`
  outputs, run by me: `verdict=clean cases=22 passed=22`, `cases=13 passed=13`).
- Routed-defect citations are numbered correctly: defect 1 = registry row absent, defect 2 =
  89 uncommitted paths, defect 4 = stale 12/12 (`corpus/lessons/round-23-verifier-spotcheck.md
  :85-106`).

## Residual risk

- m2's closed grammar leaves most of the population unevaluated: `couldNotEvaluate: 79` of
  ~90 receipt commands at the tip run — the "clean" verdict covers a thin slice, and
  criterion 65 does not disclose that the majority of receipt commands are unreachable.
- The m3 misattribution (live paths charged to the newest disposition block at `--rev`,
  F3) will keep producing false failures at every review wave until the class gains a
  tree-state input or the criterion's clean-tree clause is rewritten into something the
  instrument can satisfy.

## Verification gaps

- I did not re-run the m2 closed-grammar re-runs per receipt (they run as part of the
  `--rev` evaluation; 75–79 `could-not-evaluate` are reported, not verified individually).
- Whether a *fresh checkout* at `ad125e8` actually yields `mismatches: 0` was not tested
  (would require writing outside my scratch scope); inferred from `m3Findings` returning
  `[]` when `git status --porcelain` is empty (`scripts/check-selfassessment.mjs:271-272`).

## Tooling

None installed. `TMPDIR=/home/vgpnk/tmp-tabi24` created/used per the host note. No pacman
transactions attempted (host-wide pause honored); node was already present.
