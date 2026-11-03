# R56Mutant — mutate-run-revert on the frozen round-55 instruments

Round 56, wave w1. Target: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane base `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8`. Scratch `$HYAKU_SCRATCH/tabi-r56/R56Mutant/` (removed on exit).

Read-only on both instruments: the working files match their HEAD blobs
(`git hash-object` == `git rev-parse HEAD:<path>` for `c1-adjacency-host-v15.mjs`
and `webview2-receipt-r55.mjs`). No repo byte was written; every mutant lives in scratch and in `mutant/mutants/`.

## 1. c1-adjacency-host-v15.mjs (C1's meter core)

Baseline reproduced the frozen before-state exactly before mutation:
`--rev faee4cb2 --repo <lane> --fleet <fleet> --json` → exit 1, findingCount 19,
`{audit-status-mismatch 6, roster-lane-uncovered 5, delta-lane-not-on-roster 3,
lane-screen-sha-mismatch 1, lane-screen-lines-mismatch 1, lane-screen-head-mismatch 3}`,
counts `{roster 20, mapRows 16, auditRows 16, deltaLanes 12}`. Matches claims.json C1.before.

Each mutant was run at `--rev HEAD` **bracketed** by a pristine run
(pristine → mutant → pristine) so live sibling-head drift cannot be mistaken for a
mutant effect. Drift was real and observed: `tsukuroi-shokunin` moved
`44fc183b…` → `2f3061ef…` mid-probe, taking the pristine count 19 → 20 → 21
(`lane-screen-head-mismatch` 3 → 4 → 5). Delta is therefore always read against the
brackets, never against a stale baseline.

| mutant | change | exit | findingCount (bracket) | verdict |
|---|---|---|---|---|
| m1 | drop `audit-status-mismatch` (`if (false && …)`) | 1 | 15 (21); audit-status-mismatch 6→0 | caught |
| m2 | drop `lane-screen-head-mismatch` | 1 | 16 (21); lane-screen-head-mismatch 5→0 | caught |
| m3 | `roster-lane-uncovered` always passes | 1 | 16 (21); roster-lane-uncovered 5→0 | caught |
| m4 | final predicate AND → OR | 1 | 21 (21); **finding set and predicate identical** | **SURVIVOR** |
| m5 | `AUDIT_REL` → nonexistent file | 1 | 31 (21); audit-missing 16 appears, audit-status-mismatch 6 gone | caught |

m1–m3 and m5 all keep exit 1 but change the finding set, so the frozen
`findingCount` + set is a working detector for them. They also fail the meter's own
`--selftest`: m1 13/16, m2 15/16, m3 15/16 (m5 16/16 — the selftest does not exercise
`AUDIT_REL`, which is a host-layer constant, so only the run detects m5).

### SURVIVOR — m4 (final predicate AND → OR)

Reason, in two independent parts:

1. **At the live state the mutant is byte-identical to pristine.** All three legs are
   already dirty at HEAD (P1 6 findings, P2 8, P3 6), so `OR` and `AND` both evaluate
   false and the emitted `predicate`, `findingCount` and `findings[]` are unchanged.
   Bracketed run: exit 1, 21 findings, identical to both pristine brackets
   (`c1-matrix.json`, `runs/m4.json` vs `runs/pre-m4.json` / `runs/post-m4.json`).
2. **The selftest cannot see the predicate at all.** `selftest()` asserts only
   `findings.length === 0` / finding ids (`base-v15.mjs:396`); the emitted
   `out.predicate` is computed in the CLI block and never asserted. m4 passes
   `--selftest` 16/16. Re-deriving the OR form over the 16 selftest cases shows
   13 of 16 would flip `false` → `true`, i.e. the coverage to kill m4 already exists
   in the case data but is never observed by an assertion.

Consequence for C1: finding-set mutation testing alone cannot kill a predicate-composition
defect; a green/partial-green fixture plus an assertion on the emitted `predicate`
(not just on `findings`) is what would kill it. This is a coverage finding against the
detector, not a change requested to the frozen claim.

## 2. webview2-receipt-r55.mjs (C2's counter shape, r55 frozen)

Selftest run in a faithful layout
(`<scratch>/scripts/{webview2-cdp-loopback-round55.mjs,webview2-host-round48.cs}` beside
`<scratch>/.ufo/waves/round-55/counters/fixtures` — the counter's pinned layout contract),
TMPDIR inside scratch.

**Baseline is 102/103, not 103/103.** The single pre-existing failure is disclosed
verbatim, unmodified by any mutant:

```
{ "name": "runtime-folder-not-webview2", "ok": false, "findingsOk": true, "cneOk": false,
  "got": ["runtime-folder-not-webview2"], "want": ["runtime-folder-not-webview2"],
  "gotCne": [], "wantCne": ["runtime-pin-host-drift"] }
```

Cause: the fixture's `runtimeFolder` is `C:\Windows\System32`, a path that does not exist
on this Linux host, so the selftest's `folderExists` probe derives a `runtime-pin-host-drift`
CNE the counter never emits (the CNE branch sits inside the `RUNTIME_SHAPE` else-arm and this
fixture fails the shape test by design). A host-shape baseline red, not a mutant effect.

| mutant | inverted witness | selftest | target case under the mutant | verdict |
|---|---|---|---|---|
| w1 | End negative witness (`valueAfterEnd === nonce` raises) | 2/103 | `control-end-witness-wrong` got `[]`, want `[control-end-witness]` | caught |
| w2 | Backspace residue (`valueAfterBackspace === nonce.slice(0,-1)` raises) | 2/103 | `control-backspace-witness-wrong` got `[control-backspace-witness ×2]`, want `[control-backspace-witness]` | caught |
| w3 | Tab focus (`activeElementAfter === 'field2'` raises) | 2/103 | `control-tab-focus-wrong` got `[]`, want `[control-tab-focus]` | caught |
| w4 | Enter submit (`submitMechanism === 'implicit-submission-enter-key'` raises) | 2/103 | `control-enter-submit-wrong` got `[]`, want `[control-enter-submit]` | caught |

All four are caught in both directions: the green fixtures gain the spurious finding
(so `green-rel`/`green-abs` fail) and the matching negative fixture loses its finding
(so the witness stops discriminating). The two surviving passes under each mutant are
`journey-steps-short` and `control-domain-missing`, neither of which reaches the inverted
witness. No remaining survivor among the four.

## 3. Restoration

Both instruments were only ever read. Working-tree blob == HEAD blob for both after the
probe; `git status --porcelain .ufo/waves/round-55` is empty. Scratch
`/fast/scratch/hyaku/tabi-r56/R56Mutant` removed after the receipts were copied into this
directory.

## 4. Counts

- c1 mutants: 4 caught, **1 SURVIVOR (m4)**.
- r55 counter mutants: 4 caught, 0 survived.
- Total: **8 caught / 1 survived** of 9.

## 5. Receipts

- `mutant/results.tsv` — the required table.
- `mutant/c1-matrix.json` — bracketed matrix (exit, findingCount, sets, indistinguishability).
- `mutant/runs/{pre,m,post}-*.{json,exit}` — every raw run of the final pass.
- `mutant/c1-baseline-v15-at-faee4cb2.json` — frozen before-state reproduction (19 findings).
- `mutant/c1-pristine-selftest.json`, `mutant/c1-m{1..5}-selftest.json` — meter selftests.
- `mutant/r55-pristine-selftest.json`, `mutant/r55-w{1..4}-selftest.json` — counter selftests.
- `mutant/mutants/*.mjs` + `*.diff` — the nine mutants and their single-site diffs.
