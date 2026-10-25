# RevGateRegistryCode — line-by-line falsification of `scripts/check-gate-registry.mjs`

Scope: committed bytes at lane tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (464 lines), plus
behavioural probing against the same file in the worktree. All triggers were built and run under
`.ufo/waves/round-24/scratch/RevGateRegistryCode/` (`probe.mjs`, `probe2.mjs`, `mut-selftest.mjs`)
with `TMPDIR=/home/vgpnk/tmp-tabi24`. Line numbers cite the committed file.

Note: the worktree copy of the script was edited during this review (header comment "15 isolated
cases" → "22"; `git status` shows `M scripts/check-gate-registry.mjs`). The committed tip still
carries "15"; findings cite committed bytes.

## Claims reproduced (observed, not trusted)

- Baseline `573c99e`: `nonconformant=3`, `gates=12`, e1-missing-row ×3 (check-adjacency,
  check-measurement-binding, round-evidence-audit) — matches `corpus/evidence/round-24/c1-measurements.json`.
- Tip `ad125e8`: `nonconformant=0`, `gates=14`, `rows=23`, `clean=true`, exit 0 — matches
  `c1-tip.json` (recorded at `b973fde`, same 0).
- `--selftest`: 22/22 cases pass, exit 0. Pinned paths cited by the round-24 rows all resolve at tip
  (`git cat-file -e` on each). The skip-work control is sound: an always-clean stub still prints 0 at
  the baseline, so the frozen counter rejects it.

The headline verdict is honest **for the 14 gates it derives**. The defects below attack what it
cannot see and what it counts as conformant.

---

## HIGH

### F1 — inherited `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` overrides `--repo` and the lane pin
Lines 74–82. `git()` nulls `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` but passes the rest of
`process.env` through. Location variables beat `-C`, so the gate grades whatever repository the
caller exported while the report claims the lane.

Trigger (observed):
```
GIT_DIR=<fixture>/.git node scripts/check-gate-registry.mjs --rev HEAD   # --repo defaults to the lane
→ GATE_REGISTRY verdict=failed rev=f22e7b06…  # fixture HEAD, fixture gates (check-alpha e1)
```
Both directions fire: export a clean repo's `GIT_DIR` against a broken lane → clean. Fix surface:
delete `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` (and any `GIT_*` location vars) in the env at
line 77, or pass `--git-dir`/`--work-tree` explicitly. Inference: also makes `--repo` a lie whenever
these vars are set, not merely hostile — a wrapper that exports `GIT_DIR` silently mis-evaluates.

### F2 — the derived gate set is silently incomplete; an empty set reports `clean`
Lines 248–256 (convention arm restricted to `scripts/` + `/^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/`),
172–176 (`parseRows` drops any row whose kind cell does not *start* with `gate`/`probe`), 291
(`clean: findings.length === 0`). There is no minimum-gate assertion: `gates=0 → clean, exit 0`.

Triggers (each printed `exit=0 clean=true gates=0`):
- repo with `scripts/check_alpha.mjs` (underscore escapes convention), no table → clean.
- `scripts/lib/check-alpha.mjs` (subdir escapes: `base` contains `/`) → clean.
- `scripts/check-Alpha.mjs` (uppercase escapes `[a-z0-9-]`) → clean.
- a complete row `| unregistered counter / gate | node tools/measure-c1.mjs REV | … |` in the
  `Name / kind` shape, with `tools/measure-c1.mjs` committed → clean; the gate never enters the set.

Live instance at `ad125e8`: `git cat-file -e` confirms `.ufo/waves/round-19/isolation/check-isolation.mjs`
and `.ufo/waves/round-20/check-wave.mjs` exist; SKILL.md:2101 and :2244 declare them `… / gate`;
`.ufo/waves/round-19/measure-c{1,2,3}.mjs` are declared `… / gate` at :2098–2100. None appears in the
instrument's own `gates[]` (14 entries). These rows sit in `Name / kind` tables, whose kind cell
starts with the *name* — `kindOf` never sees "gate" — so the docstring's claim (line 34) that "the
lane's five historical table shapes (4-, 5-, 6- and 8-column) are read by header name" is false for
three of them. Committed bytes carry 41 tables with column counts {2,3,4,5,6,8}; only shapes with a
dedicated Kind column yield rows. Same blind spot produced baseline e1 for check-measurement-binding
while a real (kindless) registry row existed at SKILL.md:1838.

Consequence for C1: the metric undercounts the declared gate population at both ends (5+ live gates
invisible at baseline and tip), and a lane state where `scripts/` is renamed, a gate gains an
uppercase/underscore basename, or the registry changes shape degrades to `clean` rather than red.

### F3 — row↔gate binding is by script-mention, not name; hidden rows supersede visible ones
Line 263: `owned = gateRows.filter(r => r.name === gate.name || scriptsInRow(r).includes(script))`;
line 264 takes the last by document order. `missingFields` (219–233) never checks that the row's
`name` cell is the gate's name. `parseTables` (128–152) has no code-fence or HTML-comment awareness.

Triggers (all observed):
- F: incomplete row for alpha (owner blank) + later *complete* row named "beta" whose entry invokes
  `scripts/check-alpha.mjs` → `clean`; beta's row supersedes alpha's and makes alpha conformant.
- N: same exploit through the self-test cell (`also node scripts/check-alpha.mjs --selftest`).
- U: single row named "alpha" whose entry runs `scripts/check-beta.mjs` → check-beta conformant
  under a row that names another gate; check-alpha e1.
- A complete row inside `<!-- -->` *after* an incomplete real row → `clean` (the commented row wins;
  the "append-only; never edit above" convention is defeated by a comment block GitHub doesn't even
  render). A fenced table is likewise parsed as live rows (e2 fired on the superseding real row).

Live instance: all ten round-24 rows bind by script mention — e.g. gate `check-aria-metadata` is
conformant under row `aria-historical-metadata` (SKILL.md:2474). That accommodation is necessary
given the lane's naming, but it means the "name" field predicate validates an arbitrary string while
a *hidden* row (comment, fence, or an umbrella row naming many scripts) can supersede the visible
ones.

### F4 — six of the eight field predicates accept prose/absent fields; `kind` is dead code
Lines 219–233. Each is a keyword-presence/shape test, not the required field. Grounded green-on-bad:

| field | line | trigger cell | result |
|---|---|---|---|
| verdictMap | 224–228 | no Verdict column at all; codes live in entry cell | clean |
| verdictMap | 225–227 | `0=clean; 1=findings; 2=usage` (reasons/causes, not classes) | clean |
| verdictMap | 225–227 | `0=clean; 1=red; 2=refused` (no failed/could-not-evaluate) | clean |
| verdictMap | 224 | cell `see the runbook` + codes in entry | clean |
| selftest | 229 | `no --selftest is provided for this gate` (negative mention) | clean |
| selftest | 229 | `node scripts/check-alpha.mjs --self-test` — spelling the script rejects | clean |
| pinned | 230 | `not pinned.` (sentence period satisfies `/[/.]/`) | clean |
| pinned | 230 | `corpus/evidence/round-24/does-not-exist.json` — path absent at rev | clean |
| scope | 231 | `unreadable` (matches `read`) | clean |
| owner | 232 | `no owner` (matches `owner`) | clean |
| entry | 223 | `not a command` (13 chars ≥ 8) | clean |

`--self-test` vs this script is real: `node scripts/check-gate-registry.mjs --self-test` → exit 2
("unknown argument"). The claim's field is "self-test command *and spelling*"; the predicate can
never check spelling against the script it names.

Line 222 `if (row.kind !== "gate")` is unreachable: `gateRows` is already filtered to `kind==="gate"`
(line 244), so `missing.push("kind")` is dead code — a probe row yields e1-missing-row, never
e2 kind. Per the claim's killRule ("a field predicate not shown red on a mutated row leaves the
required set"), `kind` is exactly that case.

### F5 — the gate's own exit codes violate its declared verdict map
- Line 439: selftest disagreement exits **3**, which neither the header (lines 4–6: "Any other
  nonzero code is undeclared and reads as could-not-evaluate") nor the gate's own registry row
  (SKILL.md:2478, only 0/1/2) declares. Observed: a mutated CASES copy reports
  `verdict=failed cases=22 passed=21`, exit 3 — under PROTOCOL §Gate standard that reads as
  could-not-evaluate, i.e. a genuinely *failed* selftest presents as an evaluation failure.
  (`round-evidence-audit` declares `3=self-test disagreement`; this gate copied the pattern but not
  the row.)
- Lines 449–451 + 461: only `Refusal` maps to exit 2; any other throw is uncaught → Node exits **1**,
  which the declared map reads as "failed (≥1 nonconformant gate)". Observed:
  `TMPDIR=/nonexistent-dir-xyz node scripts/check-gate-registry.mjs --selftest` → Node uncaught
  exception dump, `EXIT=1`. An environment failure (full/missing tmpdir, OOM) masquerades as a red
  registry verdict. The production path has the same shape (a non-Refusal throw in `evaluate` exits 1).
- Header line 7 (committed bytes): "15 isolated cases" — actual 22. Stale; the worktree edit to "22"
  during review confirms the drift, but the claim's counted artifact still ships the stale number.

## MEDIUM

### F6 — `splitCells` misparses malformed rows instead of flagging them
Line 123: `parts.slice(1, -1)` assumes leading+trailing `|`.
- No trailing `|`: last cell silently dropped → e2 pins the wrong field (fixture H: owner reported
  missing on a row whose real defect is a missing delimiter).
- Surplus cells: a 9-cell row under an 8-column header is silently accepted (extra cell dropped by
  header-indexed reads) → `clean`; a row can smuggle content past the last declared column.

### F7 — e1 detail is false on existing-but-unreadable rows
Line 272 detail "no gate-kind registry row names this gate" also covers rows that exist but were
dropped: kind cell `gates` (fixture W), Kind column spelled `Type` (fixture O), `Name / kind` rows
(F2), blockquoted/indented tables (fixture K). The diagnostic conflates "no row" with "row the
parser refused" — a fixer chasing e1 will add a duplicate row instead of repairing the existing one.

### F8 — `main()` runs on import; the `evaluate` export is unreachable
Line 464 executes `main()` unconditionally. `node -e 'import("./scripts/check-gate-registry.mjs")'`
prints the usage line and exits 2, killing the importer. `export function evaluate` (line 238) is a
trap: any consumer that imports it gets a CLI run against the importer's argv.

### F9 — `$`-prefixed and helper `.mjs` mentions manufacture phantom gates
Lines 205–215. `SCRIPT_TOKEN` strips only `./` (211–213); an entry `` `node $PWD/scripts/check-alpha.mjs` ``
produces script `PWD/scripts/check-alpha.mjs` → new gate "alpha" → false e3-row-script-absent
(fixture G, observed). Absolute paths are skipped (212) but `$`- and `~`-prefixed are not. Latent
corollary: any `.mjs` helper mentioned in an entry/self-test cell (e.g. a selftest harness like
`selftest-measurement-binding.mjs`) becomes a gate; deleting the helper would then emit e3 on a
non-gate. No live instance — the only cell mentioning a helper sits in the dropped kindless table.

## LOW

- Line 91: `--rev` rejects valid rev expressions (`HEAD~2`, `main@{1}` → exit 2). Honest refusal,
  but restricts the rev grammar to literal refs; ancestry expressions are exactly what a
  before/after counter wants.
- Line 429: usage omits `--repo` (documented only in a code comment).
- Line 395: the two refusal cases assert only `exit===2`; `expectedFindings:["refused"]` is recorded
  but never compared — a refusal that exits 2 for the wrong reason still passes.
- Lines 330–335: fixture `run()` does not isolate git config the way production `git()` does (line
  77) — a user gitconfig (`commit.gpgsign`, `core.fsmonitor`, hooks) can break selftest fixtures,
  another environment→exit-1 path (F5).
- Line 221: name charset requires ≥3 chars and excludes `(){}:` — "gate (registry)" → e2 name
  (fixture V). Fail-closed, but rejects plausible registry names.
- Line 4–6's own convention ("undeclared nonzero reads as could-not-evaluate") combined with F5
  means this gate's failure modes classify themselves inconsistently: red→could-not-evaluate (exit 3),
  crash→failed (exit 1). Both are the wrong class per its own map.

## Residual risk and gaps

- Structural: the instrument never executes named commands (correctly — the header forbids it), so
  "entry command" and "self-test command and spelling" can only ever be shape-checked. F4's
  fail-opens are the visible edge of that limit; the honest fix is comparing the spelled flag against
  the script's arg parser, which requires either execution or a second pin.
- The gate set is definitionally bounded: `scripts/` convention ∪ gate-kind-row scripts. The
  PROTOCOL gate population is larger (F2); until rows exist for check-isolation/check-wave or the
  convention arm reads outside `scripts/`, "0 nonconformant" audits a subset.
- Environment-inheritance (F1) is the cheapest real attack/mistake and the only one that changes
  *which repo* is graded.
- Not in scope here (other seats): `check-selfassessment.mjs` internals, C3 entry bytes,
  LOG/SCORECARD prose, the `revisions` block (empty at freeze — no post-freeze corrections to apply).
- Verification gaps: textconv/attribute driver execution in the *target* repo (`.gitattributes` +
  `.git/config` survive the `GIT_CONFIG_GLOBAL/SYSTEM` null-out) is inferred, not demonstrated; the
  lane's own repo has no such config.
