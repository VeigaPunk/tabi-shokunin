# ExecPinsCasesA — C1 build: five release-pin self-test survivors killed

**Verdict.** All five assigned fault mutants (`pins-f1-old-tag`, `pins-f2-path-traversal`,
`pins-f3-bytes-absent`, `pins-f4-range-bounds`, `pins-f4-anchor-token`) are **killed** by five new
self-test cases appended as one contiguous block at the end of `CASES` in
`scripts/check-release-pins.mjs`, each pinned to its reason string by a small runner assertion
(`out.rows[0].reasons`), so a bypassed check can no longer hide behind a neighbouring failure path.
The frozen counter at my clone commit (`87199077…`) reads `fault_total 27 / fault_killed 18 /
fault_survivors 9 / benign_total 13 / benign_killed 0`, with both gates' pristine self-tests clean
(s106 7/7, release-pins **25/25**); counter and catalogue bytes at the measured revision are
byte-identical to `claims.json` `frozenDigests`, and the counter exited **1** (survivors remaining),
never 2, so no `find` string moved and no mutant-aware literal was introduced. The 9 remaining
survivors are exactly the 14 pre-change survivors minus my 5 — i.e. the 5 s106 rows and the 4
`pins-s1-*` / `pins-notfound-*` rows owned by the sibling seats; nothing I added regressed them. The
unchanged catalogued check lines are untouched (every hunk is inside the self-test section), and
`--rev HEAD --stable 156.0.8078.47` on the clone still reports `population 23, unresolved 0`.

## Delivered files (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ExecPinsCasesA/`)

| File | What it is |
|---|---|
| `pins-cases-a.patch` | `git -C "$S/clone" diff 061e6202…` — 1 file, +52/−3, applies to the frozen tree |
| `c1-counter-after.json` | frozen counter at my clone commit (18 killed, 9 survivors, 0 benign killed) |
| `c1-counter-before.json` | same counter at `061e6202…` (14 survivors — the "before" reading, reproduced in-round) |
| `release-pins-selftest-after.json` / `.txt` | `--selftest [--json]` on my clone: clean 25/25 |
| `release-pins-head.json` | `--rev HEAD --stable 156.0.8078.47` on my clone: unresolved 0 |
| `f3-absent-mutant.stderr` / `.stdout` | the single-point f3-absent mutant's kill mechanism (uncaught `ERR_INVALID_ARG_TYPE` at the sha line, 0 stdout bytes) |
| `digests.txt` | sha256 of the patch and the two outcome files |

Clone commit: `87199077f6c2032d7f1762ef180190784345a69e` (on `061e62024c0523d3c6c7e819506a773ff2cd7d75`,
`git status --porcelain` empty after commit). Scratch root `/fast/scratch/hyaku/tabi-r30/ExecPinsCasesA`.

## The change (self-test section only)

1. **Runner assertion** (one hunk, `runSelftest`). Cases may carry `reasons: [...]`; the runner then
   requires `out.rows` to have exactly one row whose `reasons` array has the same length and
   prefix-matches each expected string. `expectedReasons`/`reasons` are carried in the result record
   and printed in text mode. Cases without `reasons` behave exactly as before.
2. **Five cases appended after `copied-old-as-new-caught-by-refetch`**, before the closing `];`
   (single contiguous block; seat B can append after it):

| Case | Fixture | Reason asserted | Why the mutant flips it |
|---|---|---|---|
| `f1-old-tag-not-carried-by-row-unresolved` | row `S001` at tag 154.0.8037.97; file keeps `path`/bytes/sha/refetch/range valid but `old_tag`=155.0.8037.97 with `old_bytes` under the 155 path; anchor keeps `feature.cc` so f2 binding still holds | `f1-old-tag` | guard `if (false)`: old-tag mismatch is no longer recorded → row resolves, case fails |
| `f2-dotdot-inside-filename-unresolved` | `path = content/public/common/feature..cc`, carried by both the registry source cell (so `inSource` stays true) and the bytes dirs | `f2-path-bound` | `f.path.includes("..")`→`false`: the traversal guard no longer fires, the file passes every later check, row resolves |
| `f3-old-bytes-never-committed-unresolved` | receipt names `BYTES_ROOT/154…/feature.cc` but `_old` is deleted, so the blob is never committed | `f3-bytes absent` | guard `if (false)`: the sha line then dereferences `null` → uncaught `TypeError` → self-test dies (contract: crash = killed) |
| `f4-range-past-last-old-line-unresolved` | range `[[7,8]]` against a 6-element OLD split, anchor `feature.cc:7-8` so the token **is** present | `f4-ranges` | condition reduced to `!anchorHasRange(...)` is false → `slice(6,8)` is empty → `blockIn([], …)` true → holds |
| `f4-anchor-lacks-range-token-unresolved` | range `[[4,5]]`; those old lines occur consecutively in `NEW_SAME`; anchor `feature.cc; sha256 …` with **no** range token (abbr contains an ellipsis, never a dash) | `f4-ranges` | condition reduced to bounds-only: `4≥1, 5≥4, 5≤6` → proceeds → block found → holds |

Case design notes:
- The f4-bounds case needs the anchor token present *and* the range out of bounds; the reverse
  mutant (`pins-f4-anchor-token`) keeps failing it via the bounds disjunct, and vice versa, so the
  two mutants are separated by exactly one case each (confirmed by `failing_cases` below).
- The f2 and f3 cases drop the `sha256 …` abbreviation from the row anchor on purpose: the byte
  loop `continue`s before `oldShas` is populated, so a digest-bearing anchor adds a second reason
  (`f5-digest`) and the case would no longer fail for one reason. `f5-digest` already has its own
  killed case (`digest-binding-mismatch-unresolved`), which stays killed.
- No new case names a catalogued replacement literal: the file's static guards passed (counter
  exit 1, not 2), and `git apply --check -R pins-cases-a.patch` is 0, i.e. the diff is exactly the
  commit's change against the freeze.

## Evidence (commands, working dir, exit codes)

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75
    → rev-parse HEAD 061e6202…, status --porcelain 0 lines                    (exit 0)
$ # edit scripts/check-release-pins.mjs (self-test section only)
$ TMPDIR=$S/tmp node scripts/check-release-pins.mjs --selftest
    → RELEASE_PINS_SELFTEST verdict=clean cases=25 passed=25                  (exit 0)
$ test "$(git -C "$D" rev-parse --show-toplevel)" = "$D" && echo TOPLEVEL_OK
    → TOPLEVEL_OK                                                             (exit 0)
$ git -C "$D" -c user.name=ExecPinsCasesA -c user.email=ExecPinsCasesA@scratch.local \
      commit -am "pins self-test: reason-pinned cases …"
    → 87199077f6c2032d7f1762ef180190784345a69e, status 0 lines, diffstat +52/−3  (exit 0)

# BEFORE (frozen tree, no edit) — reproduces the claim's "before"
$ TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev 061e6202… --repo "$D" --work "$S/work-before" --json
    → fault_total 27, fault_killed 13, fault_survivors 14, benign_total 13,
      benign_killed 0; release-pins pristine 20/20; survivors =
      s106-{sha-drop,anchor-unique-drop,anchor-unique-true,byte-count-drop,byte-count-true},
      pins-{f1-old-tag,f2-path-traversal,f3-bytes-absent,f4-range-bounds,f4-anchor-token,
      s1-supersession-prefix,s1-supersession-tag,notfound-status,notfound-body}      (exit 1)

# AFTER (my clone commit)
$ TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev HEAD --repo "$D" --work "$S/work" --json
    → fault_total 27, fault_killed 18, fault_survivors 9, benign_total 13,
      benign_killed 0, benign_killed_ids [];
      counter_sha256_at_rev 02945f88…c3a55 == counter_sha256_running == claims frozenDigests;
      catalogue_sha256 cd1c27a2…53833 == claims frozenDigests;
      gates: s106 pristine clean 7/7, release-pins pristine clean 25/25;
      survivors = the 9 non-assigned ids (5 s106 + s1-prefix, s1-tag, notfound-status, notfound-body)
                                                                                    (exit 1)

# Kill attribution (from c1-counter-after.json)
pins-f1-old-tag          killed  exit 3  cases 25/24  failing=f1-old-tag-not-carried-by-row-unresolved
pins-f2-path-traversal   killed  exit 3  cases 25/24  failing=f2-dotdot-inside-filename-unresolved
pins-f3-bytes-absent     killed  exit 1  cases null   (uncaught TypeError, 0 stdout bytes; stderr kept)
pins-f4-range-bounds     killed  exit 3  cases 25/24  failing=f4-range-past-last-old-line-unresolved
pins-f4-anchor-token     killed  exit 3  cases 25/24  failing=f4-anchor-lacks-range-token-unresolved
# untouched-by-me fault rows stay killed: f2-path-binding, f3-bytes-path, f3-bytes-sha, f5-digest,
# f6-refetch-{seat,sha,all}, population-{on-release,tag-compare}; all 7 pins benign rows survived.

# f3-absent kill mechanism (single find/replace reproduced on a scratch copy)
$ node $S/mut/f3-absent.mjs --selftest --json
    → TypeError [ERR_INVALID_ARG_TYPE]: "data" … Received null
        at sha256 (…:96:46) → evaluate (…:215:11) → runSelftest (…:449:15)      (exit 1, stdout 0 bytes)

# No-harm reading on the clone
$ TMPDIR=$S/tmp node scripts/check-release-pins.mjs --rev HEAD --repo "$D" --stable 156.0.8078.47 --json
    → population 23, resolved 23, unresolved 0, holds 16, drifted 7, clean true   (exit 0)

$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain scripts/check-release-pins.mjs
    → 0 lines (lane tracked file untouched by this seat)                        (exit 0)
$ git -C "$D" apply --check -R "$O/pins-cases-a.patch"                          (exit 0)
```

Patch sha256 `3cd41bc32cd8dd98634722fe64823b8ab0a26f5f42646a12cf37e5e75630b496`;
after-counter JSON sha256 `25ceec290b0a8c8907040bb53404209b2c7ba9ab39c638c029d6d19359a617c5`;
after-selftest JSON sha256 `77b6e86af6a0c5caacb22e73c284346be58c30c80859e9aae2c4455a51695e99`.
Node v24.21.0, git 2.56.0. No network used (this seat's claim is local only). No tools installed or
upgraded; per the paused-pacman guard nothing was attempted.

## Risks / notes for the L1

1. **Shared runner hunk.** The reason assertion (`runSelftest`) is the one non-CASES hunk. If
   ExecPinsCasesB also asserts reasons, take my runner hunk once and keep both case blocks; the
   contract is `reasons?: string[]` matched against `out.rows[0].reasons` by prefix, same length.
   Cases without `reasons` are unaffected (all 20 pre-existing cases still pass unchanged).
2. **`pins-f3-bytes-absent` is killed by a crash, not an assertion.** Removing the null guard makes
   `sha256(null)` throw before any verdict can be computed; the counter's contract counts that as
   killed. Causality is clean: at the 20-case tree the mutant survived, and only the new
   absent-bytes case reaches the unguarded dereference (stderr recorded). There is no
   assertion-only variant — the mutant removes the only `null` test that precedes the dereference.
3. **Refusal safety.** The counter exited 1 (survivors), never 2, on every run — so every catalogued
   `find` still occurs exactly once and no fault replacement literal was introduced. The new code
   deliberately avoids the literals `if (false)`, `!anchorHasRange(row.anchor, a, b)`,
   `a < 1 || b < a || b > oldLines.length`, `const confirmed = true;`, `404 === f.new_status`,
   `r.tags.length > 0`.
4. **Scope.** Only `scripts/check-release-pins.mjs` (self-test + runner) is in the patch; `evaluate()`
   and every catalogued check line are byte-identical. `scripts/check-s106-evidence.mjs` was not
   touched (its 5 survivors belong to the other seat).
