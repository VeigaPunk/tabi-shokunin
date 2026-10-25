# RevCounterScope — C2 scope-honesty review (round 24, wave 1)

Seat: `L1Tabi24.RevCounterScope` (leaf member; no delegation).
Measured revision: `573c99e4885382db38babc3a6fc90e77afeb42a6` (HEAD == frozen baseline tip; `git rev-parse HEAD`).
Working tree: `git status --porcelain` shows 91 entries, all untracked wave/scratch files or round-23/19
files; **none** of `SCORECARD.md`, `LOG.md`, `SKILL.md`, `SHONEN.md` is modified, so committed bytes ==
worktree bytes for the four docs analyzed. `scripts/check-selfassessment.mjs` does not exist yet (L1
writes it); this item critiques/specifies, never writes.

---

## 1. m1 extraction against the real lines (SCORECARD.md 1138/1139/1151)

Ground truth first — the shipped gate at the measured revision:

- `node scripts/round-evidence-audit.mjs --selftest` → `{"cases":13,"passed":13,"inventoryOk":true,"clean":true}`, exit 0.
- Commit `43e9bb5` (ancestor of tip, in `git log --oneline`) documents the 13th case: "a second
  `c2` red arm for the round-total leg (selftest 13 cases; removing that arm now exits 3)".

The three stale tallies, verbatim at `573c99e` (`git show 573c99e:SCORECARD.md`):

| Line | Text at REV | Tally type | Stale vs 13? |
|---|---|---|---|
| 1138 | `12-case in-memory matrix and a six-repair evidence-keyed matrix; refuses rather than` | `N-case` | yes (12) |
| 1139 | `guessing. Evidence: `scripts/round-evidence-audit.mjs`, `--selftest` (12/12),` | `--selftest` N/N | yes (12/12) |
| 1151 | `**met** as a capability: `--selftest` 12/12 exit 0; …` | `--selftest` N/N | yes (12/12) |

No other auditor-bound tally exists in SCORECARD.md at REV: a full-file scan for `selftest|12/12|13-case|13/13` matches only 1139/1151 for this gate (lines 77/79 are round-4/6 historical pin tallies for other gates; line 1140 `(6/6 repairs)` is the evidence-keyed repair arm, not a case tally, still true). So the m1 target set is exactly these three lines.

**Block-scoped catch verdict:**

- 1138 and 1139 sit in the **same paragraph** (the round-23 capabilities row) that literally names
  `scripts/round-evidence-audit.mjs` (line 1139). Any block-scoped matcher whose block contains the
  script name catches both.
- 1151 sits in the executed-disposition **table** (`## Round 23 — executed disposition`, lines
  1149–1153). That table contains **no literal script path**. The enclosing `##` section does contain
  the path later, at line 1171 (inside the `### Round 23 — corrections …` subsection).
  - If "block" = `##`-section: 1151 is caught (section names the gate at 1171).
  - If "block" = table/paragraph/`###`-subsection: 1151 is **missed** unless the extractor associates
    tallies to the nearest named gate script in document order (the preceding script path at 1139 is
    in the previous section, so a document-global association still catches it).

**Conclusion:** a block-scoped match catches all three **only** if blocks are heading-sections or the
script→tally association is document-global nearest-named-script. Under strict paragraph/table scoping
it catches 1138+1139 and **misses 1151**. Specify the block unit in the gate (recommend:
`##`-section, or nearest-preceding script path document-global) and add a selftest fixture whose only
content is the disposition-table row (assert m1 fires on it). As written, the claim's "three stale
figures" is realizable but the extraction must not silently shrink to two.

## 2. Scope attack — stale figures the counter would miss (LOG.md, SKILL.md)

### LOG.md (dated journal) — one same-defect figure
- `LOG.md:1664` →§Round23 main entry): "Non-vacuity: `--selftest` 12/12 (one red + one green per
  class, each red isolating its class)". Same gate, same round, same defect family as the three
  scorecard figures; false at REV (13/13). The counter excludes LOG.md, so this is **missed**.
- **Self-disclosure inside LOG.md:** the `## Round23 — post-landing corrections` section (lines
  1711–1747) explicitly binds the §Round23 entry to `03c1b4d`/`7ac9fff` — "The §Round23 entry above
  describes the round as it stood at …" — and names `43e9bb5` as carrying "(selftest 13 cases; removing
  that arm now exits 3)". The journal is therefore internally honest: the 12/12 is a dated,
  time-bound snapshot that the same document supersedes in-place. A reader of the whole journal is not
  misled; a reader skimming only the main entry would call it stale.
- No other current-state tally in LOG.md is stale: round-21/22 serial figures (45/45, 35/35, 83/83,
  30/30) were verified against their commits; historical 12/12s are superseded in-line (e.g., line
  252 "now 12/12 … These supersede the old helper's … acceptance").

### SKILL.md — no auditor row, all registry tallies verified accurate
- `grep` for `round-evidence-audit|evidence-audit|audit\.mjs` across SKILL.md → **zero matches**. The
  auditor has no registry row in SKILL.md at all — this is precisely C1's routed defect (missing
  PROTOCOL §Gate row), so there is no auditor tally in SKILL.md to go stale.
- Other SKILL.md registry case counts were re-verified at tip by running each gate's selftest
  read-only (all write only their own temp fixtures):

  | SKILL.md registry claim | Command | Observed |
  |---|---|---|
  | round contract self-test 38 cases | `node scripts/check-round-contract.mjs --self-test` | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38`, exit 0 |
  | user contract self-test 45 cases | `node scripts/check-user-round-contract.mjs --self-test` | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45`, exit 0 |
  | measurement binding self-test 76 cases, 13 reasons | `node scripts/check-measurement-binding.mjs --self-test` | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13`, exit 0 |
  | adjacency self-test 57 cases, 18 reasons | `node scripts/check-adjacency.mjs --self-test` | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18`, exit 0 |

  All match. Historical 12/12s in SKILL.md (line 913 round-7 archive pins; line 1989 refused-download
  harness case) are revision-bound history and remain true.

## 3. Disclosure verdict

- **Disclosed:** the claim's `declared` text enumerates its data window — "(SCORECARD.md blocks that
  name a lane gate script, and SHONEN.md)". The metric is defined over that scope, so "after: 0" is
  honest *for that scope*. The kill rule handles null/unparseable classes. SHONEN.md contains no
  tallies, so its inclusion is inert.
- **Residual risk (keeps it honest but not airtight):**
  1. The m1 class description ("a `--selftest`/`N-case` tally that disagrees with the gate's own
     selftest output at the measured revision") is **doc-agnostic** and would naturally cover LOG.md's
     12/12. The claim's "three stale figures" count is exact only because the journal is excluded,
     not because no fourth such figure exists in the lane.
  2. The claim says it compares "the lane's self-assessment" yet excludes the lane's landing journal,
     where final-state claims also live; a reader must notice the parenthetical enumeration to know
     LOG.md is out of scope.
  3. Today the exclusion is harmless (LOG.md self-corrects; SKILL.md has no auditor row), but it is
     fragile: a future round that appends a stale tally to LOG.md without an explicit correction would
     be invisible to the counter while the claim still reports 0.
- Recommendation to keep the claim honest: state the exclusion explicitly in the gate's schema (e.g.,
  `scope: ["SCORECARD.md", "SHONEN.md"]`, `excluded: ["LOG.md (dated, self-correcting)", "SKILL.md
  (revision-bound rows)"]`), or cheaply extend m1 to non-revision-bound tallies in LOG.md (same
  extraction; skip lines inside a corrections entry). Either way the 0 target remains scoped and the
  residual fourth figure is acknowledged, not implied absent.

## 4. Residual risk / verification gaps

- The L1 gate script is not yet present in the repo (`scripts/check-gate-registry.mjs` exists
  untracked; `scripts/check-selfassessment.mjs` absent). The m1 conclusions above are derived from the
  frozen claim spec plus observed repo state; the block-scope sensitivity (finding 1) is the one part
  that depends on the unimplemented extraction, hence the explicit spec recommendation.
- The worktree currently carries unlanded paths (91 porcelain entries) — this is another class (m3),
  belongs to a different item, and is noted only as context; none of the four analyzed docs is among
  the modified/untracked paths.
- No external sites, no writes beyond this report; all commands cited above are read-only
  (git show/log/status, node selftests that create only their own temp fixtures).
