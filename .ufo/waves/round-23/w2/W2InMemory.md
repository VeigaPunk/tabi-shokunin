# W2InMemory — in-memory matrix of `scripts/round-evidence-audit.mjs`

Seat: W2InMemory (lane root /home/vgpnk/Projects/shokunin/tabi-shokunin, HEAD `a89f1935f523a64b00991d792fca6a8c0d321948`).
Pristine bytes under test: `sha256 6eeaeda730b32214368acd867b8c88ad49d3489ac0395948bb8fb372c9870662`
(working-tree file; it is UNTRACKED at HEAD — see F10). All probes ran on scratch copies only.

**Verdict: C1's matrix reproduces `cases=12 passed=12 clean=true exit=0` and is sound as a
per-class detector (every red trips exactly one class, every green clears it, all six classes
present). It is unsound as a completeness/self-verdict invariant: two probes survive with
`exit=0` — a deleted case (11/11) and a hardcoded `pass = true` (12/12).**

## Findings

F1 (confirms) 12 cases = 6 red + 6 green, one pair per class, all six classes covered, every red `observed.length === 1`, every green `findings.length === 0`.
  `node scripts/round-evidence-audit.mjs --selftest --json | node -e '…red/green census…'` → `cases 12 red 6 green 6; red one-class: true; green zero-findings: true; classes covered: c1-refusal-arithmetic,c2-wave-caps,c3-gate-spotcheck,c4-stale-attempts,c5-registry-identities,c6-landed-log-binding`.

F2 (confirms) Exit code is the only machine verdict: `main` returns `result.clean ? 0 : 3`; `clean = passed === cases.length`.
  `sed -n '815,825p' scripts/round-evidence-audit.mjs` (read, not edited) / `node scripts/round-evidence-audit.mjs --selftest; echo $?` → `0`.

F3 (KILLED) Expected class changed on c1-red (`"c1-refusal-arithmetic"` → `"c2-wave-caps"`).
  `node .ufo/waves/round-23/scratch/W2InMemory/mutA.mjs --selftest` → `exit=3 cases=12 passed=11`, `FAIL c1-red-cited-below-receipts expect=c2-wave-caps observed=["c1-refusal-arithmetic"]`.

F4 (KILLED) Green flipped to red: c1-green fixture stripped of its spot-check line while still asserted clean.
  `node .ufo/waves/round-23/scratch/W2InMemory/mutB.mjs --selftest` → `exit=3 cases=12 passed=11`, `FAIL c1-green-cited-matches-receipts expect=clean observed=["c3-gate-spotcheck"]`.

F5 (SURVIVED — coverage finding) A case deleted (c3-red-gate-without-spotcheck removed) still exits clean: no case-count or case-name inventory is checked.
  `node .ufo/waves/round-23/scratch/W2InMemory/mutC.mjs --selftest; echo $?` → `cases=11 passed=11 clean=true`, `exit=0`.
  Consequence: dropping a whole class's red case (or all six) is invisible to `--selftest`; only a human reading `cases=11` vs C1's `cases=12` catches it.

F6 (KILLED — the "exactly one class" rule is enforced, not merely observed) c1-red fixture made to also strip the spot-check line.
  `node .ufo/waves/round-23/scratch/W2InMemory/mutD.mjs --selftest` → `exit=3`, `FAIL c1-red… observed=["c1-refusal-arithmetic","c3-gate-spotcheck"]` (predicate `findingClasses.length === 1 && findingClasses[0] === expectClass`).

F7 (KILLED — unconditional-clean control) `audit()` forced to return zero findings.
  `MUT_E=1 node .ufo/waves/round-23/scratch/W2InMemory/mutE.mjs --selftest` → `exit=3 passed=6`, all six reds `obs=[]`.

F8 (KILLED — skip-work control) `audit()` forced to return all six classes always.
  `MUT_F=1 node .ufo/waves/round-23/scratch/W2InMemory/mutF.mjs --selftest` → `exit=3 passed=0`, all 12 cases fail.

F9 (SURVIVED — coverage finding) `pass` hardcoded `true` in `runFixtureCase` (both branches).
  `node .ufo/waves/round-23/scratch/W2InMemory/mutG.mjs --selftest; echo $?` → `cases=12 passed=12 clean=true`, `exit=0`.
  Root: the suite's own pass predicate has no independent witness; a file that always claims 12/12 is indistinguishable by this command alone (the evidence-keyed matrix is the separate defence).

F10 (finding, grounding) The bytes tested are NOT committed: `git log --oneline -1 -- scripts/round-evidence-audit.mjs` → empty; `git ls-files --error-unmatch scripts/round-evidence-audit.mjs` → `Did you forget to 'git add'?`; `git status --porcelain` → `?? scripts/round-evidence-audit.mjs`.
  So C1's `failureCapable` command is reproducible from the working tree only, not from any revision; and the tree at the same time carries 5 modified tracked files (`M LOG.md`, `M SCORECARD.md`, `M corpus/QUALITY.md`, `M corpus/README.md`, `M corpus/SOURCES.md`, all wave-1 output, none touched here).

F11 (restoration) No repository byte was modified by this probe: `sha256sum scripts/round-evidence-audit.mjs .ufo/waves/round-23/scratch/W2InMemory/pristine.mjs` → both `6eeaeda7…`; every mutation lived in its own `scratch/W2InMemory/mut?.mjs` copy.
  `git status --porcelain --untracked-files=no | wc -l` → `5` (same five wave-1 files as before the probe).

F12 (tooling) No install or upgrade was performed (no pacman, uv, npm, cargo); nothing to record.

## Reading of the result
- Per-class behaviour is trustworthy: five of five behavioural probes (F3, F4, F6, F7, F8) were killed for the right reason, and F6 shows the "one red trips exactly ONE class" property is asserted rather than eyeballed.
- Both survivors (F5, F9) are about the reporter, not the classes: the suite prints `cases=N` but never asserts `N === 12`, and never checks that its own `pass` flags came from the detector. C1's claim text "cases=12, passed=12, exit 0" is therefore readable output, not a defended invariant — anything gating on `exit 0` alone accepts a 1-case or always-pass suite.
