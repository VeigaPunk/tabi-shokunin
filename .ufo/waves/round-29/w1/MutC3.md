# MutC3 — mutation test of `scripts/check-release-pins.mjs` self-test (C3, round-29 w1)

Target: `scripts/check-release-pins.mjs` at claims-freeze commit `97be89bc66139eb45526a04af59a35dccc006eb9` (lane baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`).
Method: pristine bytes extracted read-only via `git show <commit>:scripts/check-release-pins.mjs` into scratch; each mutant is a **separate scratch file** applying exactly one single-point disable (find/replace, asserted to occur exactly once); each run is `node <mutant> --selftest --json` with `TMPDIR` isolated per run under scratch. The lane was never written; no clone was created (no `git clone` at all).

## Baseline (pristine, before mutants)

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 97be89bc66139eb45526a04af59a35dccc006eb9:scripts/check-release-pins.mjs > $S/pristine.mjs
  sha256 = 567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770 (479 lines)
$ TMPDIR=$S/tmp/baseline node pristine.mjs --selftest --json
  verdict=clean cases=20 passed=20 exit=0
```

Baseline clean ⇒ all mutant runs are conclusive. Harness: `/fast/scratch/hyaku/tabi-r29/MutC3/mutate.mjs` (removed after receipts were copied here; exact find/replace strings below reproduce every mutant).

## Mutant table

Killed-by = self-test case id(s) that failed under the mutant (self-test asserts exit code AND unresolved count). SURVIVED = self-test still clean (20/20, exit 0) ⇒ missing coverage.

| # | Mutant | Disabled behavior (find → replace) | Verdict | Killed by |
|---|--------|-------------------------------------|---------|-----------|
| 1 | f1-old-tag | `if (!row.tags.includes(f.old_tag))` → `if (false)` | **SURVIVED** | — |
| 2 | f2-path-binding | `if (!inSource && !inAnchor)` → `if (false)` | killed | path-not-bound-unresolved |
| 3 | f2-path-traversal *(extra)* | `f.path.includes("..")` → `false` | **SURVIVED** | — |
| 4 | f3-bytes-path | `if (f.old_bytes !== wantOld \|\| f.new_bytes !== wantNew)` → `if (false)` | killed | new-bytes-under-old-tag-unresolved |
| 5 | f3-bytes-sha | `if (sha256(ob) !== f.old_sha256 \|\| sha256(nb) !== f.new_sha256)` → `if (false)` | killed | sha-mismatch-unresolved |
| 6 | f3-bytes-absent *(extra)* | `if (ob === null \|\| nb === null)` → `if (false)` | **SURVIVED** | — |
| 7 | f4-range-bounds | `a < 1 \|\| b < a \|\| b > oldLines.length \|\| !anchorHasRange(row.anchor, a, b)` → `!anchorHasRange(row.anchor, a, b)` | **SURVIVED** | — |
| 8 | f4-anchor-token | same find → `a < 1 \|\| b < a \|\| b > oldLines.length` | **SURVIVED** | — |
| 9 | f5-digest | `if (digests.length && !digests.some((d) => oldShas.some((s) => digestMatches(d, s))))` → `if (false)` | killed | digest-binding-mismatch-unresolved |
| 10 | f6-refetch-seat | `rf.seat !== entry.fetched_by &&` → `true &&` | killed | refetch-same-seat-unresolved |
| 11 | f6-refetch-sha | `x.status === f.new_status && x.sha256 === f.new_sha256` → `x.status === f.new_status` | killed | copied-old-as-new-caught-by-refetch |
| 12 | f6-refetch-all *(extra)* | whole `const confirmed = rf && …f.new_sha256);` → `const confirmed = true;` | killed | refetch-missing-unresolved, refetch-same-seat-unresolved, copied-old-as-new-caught-by-refetch |
| 13 | s1-supersession-prefix | `` sup.teaches.startsWith(`supersedes ${row.id} —`) && `` → `` (removed) `` | **SURVIVED** | — |
| 14 | s1-supersession-tag | `` && sup.source.includes(`refs/tags/${stable}/`) `` → `` (removed) `` | **SURVIVED** | — |
| 15 | notfound-status | `f.new_status === 404 && nb.toString("utf8").includes("NOT_FOUND")` → `nb.toString("utf8").includes("NOT_FOUND")` | **SURVIVED** | — |
| 16 | notfound-body | same find → `f.new_status === 404` | **SURVIVED** | — |
| 17 | population-on-release | `r.recheck === "on-release" && ` → `` (removed) `` | killed | not-on-release-not-counted |
| 18 | population-tag-compare | `r.tags.some((t) => cmpVersion(t, stable) < 0)` → `r.tags.length > 0` | killed | pinned-at-stable-not-counted, empty-population-could-not-evaluate, drift-with-supersession-resolved |

Score: **9 killed / 9 survived** of 18 mutants (10 listed check points covered; 6 extra sub-point mutants marked *(extra)*).

## Survivors = missing coverage (findings only; no repairs made)

1. **f1-old-tag** — no case ever reaches an f1 failure: every receipt-bearing row is `regLine("S001")` at the default tag 154.0.8037.97 and every `fileEntry` uses `old_tag: OLD`; the only rows pinned at another tag (S002 at NEW in pinned-at-stable / empty-population / drift-with-supersession) either have no receipt entry or are outside the population, so f1 is never evaluated against a mismatch. A receipt claiming `old_tag` not carried by the row's source cell would resolve.
2. **f2-path-traversal** — no case path contains `..`; a receipt path like `../../lane-file` passes the self-test with the guard removed.
3. **f3-bytes-absent** — every case's `receipt()` fixture writes both byte files before committing; no case omits the committed bytes, so "absent bytes ⇒ unresolved" is untested.
4. **f4-range-bounds** — all case ranges (`[[3,4]]`, `[[1,2]]`, `[]`) are inside OLD_TEXT's 6 split lines; no out-of-bounds / inverted range case exists.
5. **f4-anchor-token** — the only anchor-token case (range-not-in-anchor-unresolved, ranges `[[1,2]]`) is satisfied for the wrong reason under the mutant: OLD lines 1–2 (`// header`, `int a = 1;`) are absent from NEW_SAME (`// header v2`, `int a = 2;`), so the row still lands unresolved=1 via the drift/block path instead of the f4 reason. The self-test asserts only exit + unresolved count, not the reason, so a range whose old lines DO occur in the new bytes but whose anchor token is missing would flip unresolved→resolved undetected.
6. **s1-supersession-prefix** — the only superseded-drift case (drift-with-supersession-resolved) has the correct `supersedes S001 —` prefix; no case has a superseding row whose teaches cell lacks the prefix while its source carries the stable tag.
7. **s1-supersession-tag** — same case's superseding row S002 is correctly pinned at the 156 tag; no case has a superseding row pinned at the old tag, so dropping the stable-tag requirement is invisible.
8. **notfound-status** — absence-404-holds (404→404, body contains NOT_FOUND) holds either way; absence-404-now-present-drifts (404→200, body `int now_exists;\n` lacks NOT_FOUND) still yields unresolved=1 via the drifted verdict. No case has new_status ≠ 404 with a NOT_FOUND-containing body, so such a body would be accepted as "holds" under the mutant.
9. **notfound-body** — absence-404-holds holds on new_status 404 alone; absence-404-now-present-drifts falls through to the `f3-bytes status` reason (old_status 404 ≠ 200) and still yields unresolved=1. No case has new_status 404 with a body lacking `NOT_FOUND`, so an empty/wrong 404 body would count as "holds" under the mutant.

Pattern across survivors: the self-test asserts only exit code + unresolved count, never the *reason* string, and several negative cases are satisfiable through a different failure path. Reason-asserting (or path-specific) cases for f1, f2-traversal, f3-absent, f4-bounds, f4-anchor, s1-prefix, s1-tag, and the two NOT_FOUND sub-conditions would close all nine gaps.

## Commands run and exit codes

```
node /fast/scratch/hyaku/tabi-r29/MutC3/mutate.mjs        → HARNESS_EXIT=0 (baseline + 18 mutants, ~7.4 s)
node pristine.mjs --selftest | tail -1                    → verdict=clean cases=20 passed=20, PRISTINE_RERUN_EXIT=0
sha256sum pristine.mjs                                    → 567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770 (unchanged before/after)
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain scripts/check-release-pins.mjs
                                                          → empty, LANE_STATUS_EXIT=0 (lane untouched)
```

First harness run aborted with `HARNESS_EXIT=10` (harness bug: per-run TMPDIR subdirs not pre-created; baseline ENOENT) — fixed in the harness, then the clean run above. That aborted run produced no mutant verdicts.

## Restoration evidence

- Pristine bytes never modified: sha256 identical before extraction-run and after all runs (`56763720…fc3770`); pristine re-run after the battery is clean 20/20 exit 0.
- Lane `scripts/check-release-pins.mjs`: `git status --porcelain` empty; no lane file, index, or jj state written; no clone created; no network access used.
- All mutants lived and died in `/fast/scratch/hyaku/tabi-r29/MutC3/` (mut-*.mjs + results.json); scratch removed after this report (receipts inlined above). Self-test fixture trees were removed by the script itself; residual `tmp/` subdirs deleted with the scratch dir.

## Tooling record

No tools installed or upgraded (operator authorization 2026-10-19 read; nothing needed): pre-existing `node v24.21.0`, `git 2.56.0`. No pacman transactions.

## Verdict

The frozen C3 counter's self-test is clean at the pinned commit but has **9 surviving single-point mutants** — the listed checks f1 (old-tag), f4 (both bounds and anchor token), s1 (both supersession sub-checks), the 404 NOT_FOUND body/status sub-conditions, plus the f2 traversal guard and f3 absent-bytes guard are untested. f2-path-binding, f3-bytes path/sha, f5-digest, f6 (seat, sha, whole), and both population filters are covered (killed).
