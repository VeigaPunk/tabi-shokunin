## Round23 — declared capability-acquisition and coverage-adoption claims (2026-10-25)

Baseline `a89f1935f523a64b00991d792fca6a8c0d321948`; both claims frozen before data in
`.ufo/waves/round-23/claims.json` (`frozenBeforeData: true`). C1 values below come from an untracked
worktree receipt (`git status --porcelain` → `??` for `.ufo/waves/round-23/` and `corpus/evidence/round-23/`),
not from a committed revision.

### Declared claims (frozen scope)

C1 **operability**, lowest non-retired tie 8, capability acquisition 0→6: `scripts/round-evidence-audit.mjs
--rev <REV> --round <N> [--json]` prints `{schema,rev,round,findings:[{class,cited,derived,evidence}],classes:6,clean}`,
exit 0 clean / 1 finding / 2 usage-or-IO refusal; `--selftest` 12 cases, exit 3 on disagreement.
Counting command `node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --json`, field
`findings[].class` (distinct). Controls: clean fixture → 0, round-21 → none of the six classes, per class
a red mutant trips and a green clears. Kill rule: a class whose red misses or whose green still trips
leaves the counted set; the round then reports an honest stop on that class.

C2 **coverage**, assimilation adoption 0→1, documented-upstream only, no measured credit: admit ONE
staged shokuknow entry (CSRF defence-shape boundary, `corpus-expansion-1 merge/tabi`, frontier item
"CSRF-checked submits untested by rule") only after this lane re-opens every cited source itself and
appends the two SOURCES rows it cites, re-pointed by document, with this round's access date and located
quotes ≤25 words each. Counting command `git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge | wc -l`.
Kill rule: a quote absent from the re-fetched source refuses the row; an entry duplicating held ground
is not coverage.

### Disposition (receipt-backed; commit binding owed)

| Claim / axis | Before → after | Counting command / field | Measured revision | Author verdict / bounds |
|---|---|---|---|---|
| C1 operability, tie 8 | 0 → 6 classes | `node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --json`, `findings[].class` distinct | before `a89f193`=0 (instrument absent, exit 1); after `a89f193`=6, `fbee618`=6, `be271a2`=6, `47bfb5f`/`e3cf4e0`=4 | receipt `corpus/evidence/round-23/c1-measurements.json` (07:14:36Z): `a89f193` yields all six incl. `c2-wave-caps`/`c5-registry-identities`; mid-round commits yield four, so only a rev carrying the landed defects reaches 6. Scalar 8→8 |
| C2 coverage | 0 → 1 | `git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge \| wc -l` | before `a89f193`=0; after owed | worktree holds the entry (`corpus/knowledge/csrf-defense-shape-boundary.md`, 116 lines, untracked) and two SOURCES rows (S102/S103, access 2026-10-25); the counting command still returns 0 at any revision until they land, so 1 is target only. Scalar 9→9 |
| depth8, operability8, freshness8, calibration9, adjacency8 | unchanged | — | `a89f193` (`claims.json` `axisScoresAtRoundStart`) | no promotion, no retirement, no credit beyond C1's one row; saturation8/window3 retained |

Controls in the same receipt: clean fixture 6/6 → 0 findings; skip-work control (six classes
unconditionally) → 6 on the clean fixture, `verdict: control-refused`; `--selftest` 12/12. Two deviations
the landing must reconcile: (a) the frozen counting command omits `--round-cap 128`, which the executed
counter adds; (b) the round-21 control returns **1** finding (`c3-gate-spotcheck`), not 0 — the receipt
calls it a genuine round-21 Gate defect, so five of six classes clear. C1's control sentence is therefore
not literally satisfied until it is restated as "no round-22-specific class" or the inherited r21 `c3`
is recorded as an inlying defect.

### Six-class target and verified round-22 byte anchors

1. `c1-refusal-arithmetic` — `SCORECARD.md:1111` says 23 whole-payload refusals; receipts are 13 `w2-cap-refusal-*` plus 11 `w2b-cap-refusal-*` = 24 (`git ls-tree -r --name-only a89f193 -- .ufo/waves/round-22 | grep -c 'w2-cap-refusal-'` → 13; `'w2b-cap-refusal-'` → 11).
2. `c2-wave-caps` — `maxLanes 65` vs `waveMaxLanes 64`; round total 129 vs ≤128 (`git show a89f193:.ufo/waves/round-22/w2b-spec.json | grep -o '"maxLanes": *[0-9]*'` → 65).
3. `c3-gate-spotcheck` — round-22 lesson `## Gate` has no spot-check row and no owed line (`corpus/lessons/round-22.md:13`).
4. `c4-stale-attempts` — one `Stale-lane: none` line for three dispatches; attempt 2 silent on the commit test (spot-check §4).
5. `c5-registry-identities` — 65× `"agentId": null`, 7 dead seats unnamed, attempt 1 vs 12 (`git show a89f193:.ufo/waves/round-22/w2b/swarm-registry.json | grep -c '"agentId": null'` → 65).
6. `c6-landed-log-binding` — encoding row cites `47bfb5f`, which touches no LOG entry (`git show --name-only --format="" 47bfb5f | grep -c '^LOG.md$'` → 0; entry in `fbee618`).

All six re-derived here with the read-only command shown; none copied from the lesson.

### Capability row (appended; the table at `:381` is a historical snapshot, not edited in place)

**round-evidence auditor** — derives six defect classes from a round's committed wave bytes and fails
closed on usage/IO, with 12 in-memory mutants and a refused skip-work control, replacing the manual
spot-check that routed round 22's six defects. Evidence: `scripts/round-evidence-audit.mjs`,
`corpus/evidence/round-23/c1-measurements.json`, `.ufo/waves/round-23/fixtures/skipwork-receipt.json`.
First-working round: 23 — supported once a commit carries the script and the counting command reproduces
6/6 there; the `c2`/`c5` gap at `47bfb5f` shows the check is byte-sensitive.

### No axis harmed — evidence list

- Axes: all six scores untouched (`claims.json` `axisScoresAtRoundStart`); none promoted or demoted; saturation8/window3 and `retired: none` unchanged.
- Curation (read-only, exit 0): `node .ufo/waves/round-20/counts.mjs a89f1935…` → `rows101, tiers {A88,B4,C9}, statuses {mined73,queued19,rejected9}, knowledge41`; C2 may add at most one knowledge file and two SOURCES rows.
- Caps: W1 declares `maxLanes 44` (`w1-spec.json`), within 64; W2 stays ≤64 and the round total ≤128 (round-22's 129 is the defect being mechanised, not a precedent).
- Read-only by construction: the auditor reads committed bytes via `git show`/`git ls-tree` with isolated config and writes nothing.
- Gates owed once after integration, not asserted here: lane contract, freshness, adjacency, ARIA metadata, measurement binding, sources census (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root …`).

### Open at draft time (observations, not verdicts)

- `w1/swarm-registry.json` carries `"agentId": null` for 44/44 members and `w2/` is empty; landing it as-is makes round 23 trip its own `c5` class.
- `scripts/round-evidence-audit.mjs` exists untracked (559 lines) and is absent at `a89f193`.
- Selftest greens share one unmutated baseline fixture (`() => {}` at six sites): they prove the checks are not unconditional but isolate no per-class near-miss (`maxLanes` exactly 64, arithmetic exactly matching receipts).
- C2 quote integrity: the entry's first S102 quote renders "when and when supported by the client", eliding "deployed in strict mode," without an ellipsis (`sed -n '2815,2818p' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt`); the other checked spans exist (`grep -c "not the extent of"` → ≥1; S103 section names present, 1 and 4 hits). Quote must be made verbatim before admission.
- Spot-check §1/§2/§6 reproduce exactly; no conflicting byte in this six-command sweep.

Provenance: scribe-side read-only sweep — `git cat-file`, `git ls-tree`, `git show`, `git grep`,
`node .ufo/waves/round-20/counts.mjs a89f1935…`, receipt reads. I ran no auditor (peer receipt only),
no build/lint, no commit, no seat message, no tool install.
