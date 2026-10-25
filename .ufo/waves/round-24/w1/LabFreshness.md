# LabFreshness — bounded probe: gate self-test isolation

Seat: `L1Tabi24.LabFreshness` (executor). Wave: tabi-r24-w1. Date: 2026-10-25.

## Hypothesis
Running each lane gate's `--selftest` leaves the lane's tracked tree byte-identical
(`git status --porcelain` unchanged) and creates no new files under
`/home/vgpnk/Projects/shokunin/tabi-shokunin` other than this seat's own scratch.

## Method / evidence commands
- Lane baseline rev: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD`
  → `573c99e4885382db38babc3a6fc90e77afeb42a6` (matches claims.json baseline).
- Runtime: `node --version` → `v24.21.0` (no tools installed; no pacman/uv/npm actions).
- Gate inventory at probe start: `git ls-tree -r --name-only HEAD scripts/` (read-only) lists
  21 gate scripts; neither `check-gate-registry.mjs` nor `check-selfassessment.mjs` is committed.
  `git log --all --oneline -- scripts/check-gate-registry.mjs scripts/check-selfassessment.mjs`
  → empty. Working-tree glob
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/**/*gate-registry*` → found
  `scripts/check-gate-registry.mjs` (landed uncommitted during this wave; sha256 prefix
  `937dba48c407d4e3`, identical before and after the probe runs). Glob `**/*selfassessment*` →
  no file.

## Gate 1: `scripts/check-gate-registry.mjs --selftest` — CONFIRMED isolated
Ran twice from lane root: `node scripts/check-gate-registry.mjs --selftest --json`.
- Exit 0 both runs; JSON `{schema: "tabi-gate-registry-selftest-v1", cases: 15, passed: 15,
  ok: true}`; ~0.24 s each. (Note: ships a 15-case matrix, not the "13-case" figure that
  appears in the C1/C2 claim text; relevant to C2 m1 tallies.)
- Temp-dir sweep: fixture sandboxes are created via `mkdtempSync(join(tmpdir(), "tabi-gate-registry-"))`
  (source lines 378–405, 428–430, 454–456) and removed in `finally` with `rmSync(..., recursive, force)`.
  `os.listdir(tempfile.gettempdir())` before/after both runs: **no leftover `tabi-gate-registry-*` dirs**.
- Lane tree byte-identical: `git status --porcelain` captured immediately before/after each run;
  set-difference of the two snapshots (excluding this seat's scratch path
  `.ufo/waves/round-24/scratch/LabFreshness/`) = **0 added lines, 0 removed lines**. I.e. no tracked
  change and no new untracked file in the lane.
- Fleet repo (`/home/vgpnk/Projects/shokunin`; confirmed a git repo via
  `git rev-parse --is-inside-work-tree` → true): `git status --porcelain` delta = 0 added, 0 removed.
- Concurrency attribution: each before/run/after cycle was <1 s and the script hash was stable;
  any concurrent peer write would have surfaced as added porcelain lines (none did).
- Structural corroboration: selftest mode has no code path writing into `LANE`; every fs write in
  the file (lines 393, 396) is relative to the `mkdtempSync` root.

## Gate 2: `scripts/check-selfassessment.mjs --selftest` — NOT TESTABLE (script absent)
- The gate does not exist at probe time nor at report time. Sweep evidence:
  - `git ls-tree -r --name-only HEAD scripts/` → absent at baseline revision;
  - `git log --all --oneline -- scripts/check-selfassessment.mjs` → empty (never committed on any ref);
  - glob `/home/vgpnk/Projects/shokunin/tabi-shokunin/**/*selfassessment*` → no files (the only
    partial match anywhere is the unrelated skip-work control prototype
    `.ufo/waves/round-24/scratch/ExecControlSkip/check-selfassessment-skip.mjs`, not the gate).
- Therefore no self-test exists to run; the isolation hypothesis for C2's gate cannot yet be
  falsified. This is a measured absence, not a pass/fail.
- [INFERENCE] The C1/C2 API contract describes each selftest as "isolated CLI cases ... on fixture
  copies", consistent with isolation, but this is unverified until the script lands.

## Verification commands for L1 after `scripts/check-selfassessment.mjs` lands
```
SNAP=$(mktemp -d)
git status --porcelain > "$SNAP/before"
node scripts/check-gate-registry.mjs --selftest --json; echo "exit=$?"
node scripts/check-selfassessment.mjs --selftest --json; echo "exit=$?"
git status --porcelain > "$SNAP/after"
diff -u "$SNAP/before" "$SNAP/after"     # expect no output
ls -d /tmp/tabi-*-* 2>/dev/null           # expect none
```
Caveat: while wave seats are writing concurrently into `.ufo/waves/round-24/`, the porcelain diff
will show those peer paths; attribute only non-wave paths (or re-run in an isolated clone under
`scratch/`).

## Summary
| Gate | Self-test exists | Ran | Exit | Lane tree delta | Fleet delta | Temp leftovers | Verdict |
|---|---|---|---|---|---|---|---|
| check-gate-registry.mjs | yes (uncommitted) | 2× | 0 | 0/0 | 0/0 | none | hypothesis CONFIRMED |
| check-selfassessment.mjs | no (never committed anywhere) | n/a | n/a | n/a | n/a | n/a | untestable until landed |

No tracked repo files were edited; only this report and the snapshot files under
`.ufo/waves/round-24/scratch/LabFreshness/` were written.
