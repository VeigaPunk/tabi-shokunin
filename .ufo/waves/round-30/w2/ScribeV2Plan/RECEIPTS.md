# ScribeV2Plan — receipts

Seat `ScribeV2Plan`, round 30 w2, scribe lane. Plan deliverable: `plan.md` beside this file.
All commands below were run by this seat on 2026-10-26; exit codes are as printed. No network
fetch was made; no tool was installed or upgraded; no subagent was dispatched; no lane tracked
file was edited.

## Scope and paths

```
HYAKU_SCRATCH=/fast/scratch/hyaku
S=$HYAKU_SCRATCH/tabi-r30/ScribeV2Plan
OUT=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/ScribeV2Plan
```

## Clone and frozen bytes

| # | command | exit | reading |
|---|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` | 0 | shared clone |
| 2 | `git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5` | 0 | detached at the assigned tip |
| 3 | `git -C "$S/clone" rev-parse HEAD` | 0 | `072af95fe2822f0785a6ff88a578e2142dd258e5` |
| 4 | `git -C "$S/clone" status --porcelain \| wc -l` | 0 | `0` (before and after all runs) |
| 5 | `sha256sum scripts/{check-gate-mutants.mjs,gate-mutants.json,check-frontier-admission.mjs,check-release-pins.mjs,check-s106-evidence.mjs}` in the clone | 0 | `02945f88…3a55`, `cd1c27a2…3833`, `cadef57e…9eca`, `915a6bba…4648`, `85dfd5e0…5467` — the first three equal `claims.json:frozenDigests` |

## Self-tests (frozen bytes)

| gate | command | exit | reading |
|---|---|---|---|
| gate-mutants | `TMPDIR="$S/tmp" node scripts/check-gate-mutants.mjs --selftest --json` | 0 | `cases=12 passed=12 ok=true` |
| frontier-admission | `TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --selftest --json` | 0 | `cases=24 passed=24 ok=true` |
| s106-evidence | `TMPDIR="$S/tmp" node scripts/check-s106-evidence.mjs --selftest --json` | 0 | `cases=10 passed=10 ok=true` |
| release-pins | `TMPDIR="$S/tmp" node scripts/check-release-pins.mjs --selftest --json` | 0 | `cases=29 passed=29 ok=true` |

Raw JSON: `check-*-selftest.json`; stderr files are 0 bytes.

## Counter readings (control baselines for the plan)

| # | command | exit | reading |
|---|---|---|---|
| 6 | `TMPDIR="$S/tmp" node scripts/check-release-pins.mjs --repo "$S/clone" --rev HEAD --stable 156.0.8078.47 --json` | 0 | `population 23 resolved 23 unresolved 0 holds 16 drifted 7 clean true`; 23 ids = S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096 S097 S098 S099 S100 S105 S106 (`pins-v1-at-072af95f.json`) |
| 7 | `TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --repo "$S/clone" --rev HEAD --frontier rate-tos-signal --since 2026-10-26 --json` (offline) | 0 | `population 2 admitted 2 failing 0 clean true` (`frontier-v1-offline-at-072af95f.json`) |

## Population re-derivation (not the counter)

| # | command | exit | reading |
|---|---|---|---|
| 8 | `python3 "$S/population.py" "$S/clone" 156.0.8078.47 "$OUT/population-v2.json"` | 0 | 118 registry rows, 90 `on-release`; v1 23; DEPS rows 7 (S036 S044 S068 S088 S089 S090 **S118**); v2 set 30; excluded buckets at-stable 7, main-branch 3, non-chromium-host 50, malformed 0; statuses inside the set: queued S080 S081 S088 S089 S090 S093 S098, rejected S094 |

The script applies the v1 selector verbatim (`recheck === "on-release"` and a source-cell
`refs/tags/<A.B.C.D>/` below stable) and classifies every `on-release` row into the four excluded
buckets; the DEPS arm is the source-shape test (`devtools-frontend` URL at 40 hex) and is reported
separately because its tag mapping depends on committed DEPS evidence (plan §4.3).

## One recorded failure and its fix

`python3 "$S/enum.py" …` exited 1 with
`AttributeError: partially initialized module 're' … (most likely due to a circular import)`:
the script file name `enum.py` shadowed the stdlib `enum` module that `re` imports. Renamed to
`population.py` (copied into the output dir) and rerun; exit 0. No result depends on the failed
run.

## Restoration

- Scratch clone: `rev-parse HEAD` = `072af95f…`, `git status --porcelain` empty.
- Lane: `git status --porcelain` shows no modified tracked file (`grep -c "^ M\|^M "` → 0); the
  only untracked path this seat added is `.ufo/waves/round-30/w2/ScribeV2Plan/` and the report
  `.ufo/waves/round-30/w2/ScribeV2Plan.md`.
- No commit was made anywhere; the scratch clone was never committed to.

## Tooling

Nothing installed, upgraded, or removed. `node v24.21.0`, `git`, `python3` were already present;
no package manager, no pacman, no network fetch.
