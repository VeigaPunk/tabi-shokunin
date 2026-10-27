# Round 37 w1 freeze-integrity review

## Frozen digests

All five `claims.json` `frozenDigests` values match SHA-256 of their mapped file at commit `99437d29de036415a9f2d0524343617a3b19988a`, and each mapped file is byte-identical at the current worktree and tip `f76da094f0ff0ad9856d2232858241e3f7841379`:

- `c1` → `.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs`
- `c2` → `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`
- `buildTool` → `.ufo/waves/round-37/counters/c1-drift-audit-build-v2.mjs`
- `measure` → `.ufo/waves/round-37/measure.sh`
- `controls` → `.ufo/waves/round-37/baseline/run-controls.sh`

## Predicate sentence byte comparisons

- **C1:** claims predicate and `PREDICATE_SENTENCE` value are byte-identical. Header comment sentence differs: it has two leading ASCII spaces after the `//` comment marker (the sentence text itself otherwise matches). Thus the three sites are not byte-identical under literal extraction.
- **C2:** claims predicate and `PREDICATE_SENTENCE` value are byte-identical. Header comment sentence differs in the same way: two leading ASCII spaces after `//`; the sentence text itself otherwise matches. Thus the three sites are not byte-identical under literal extraction.

## Remote branch check

The requested equality fails. `git ls-remote origin refs/heads/master` returned `f76da094f0ff0ad9856d2232858241e3f7841379`, not freeze commit `99437d29de036415a9f2d0524343617a3b19988a`. Local `HEAD` and `refs/heads/master` are also `f76da094f0ff0ad9856d2232858241e3f7841379`. Freeze commit is an ancestor of that tip; the intervening commit changes only `gen-w1-spec.py`, `w1-dispatch.json`, `w1-dispatch.stderr`, `w1-spec.json`, and `w1.ready`, not the five frozen artifacts. Therefore the freeze artifacts remain intact, but the exact requested branch-tip/remote equality is false.

## Baseline controls

Found ten `.json` receipts under `.ufo/waves/round-37/baseline/`. All ten parse as JSON and contain all required fields: `control`, `counter`, `fixtureRev`, `exit`, `predicate`, and `summary`.

VERDICT finding C1/C2 header-comment predicate lines have two leading spaces versus the claims/constants; origin/master is f76da094, not frozen commit 99437d2 (frozen artifact digests remain intact).
