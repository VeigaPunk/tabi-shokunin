# ReviewLessonHistory: lesson-history.mjs vs frozen lessonDrift (round 20, w2)

Revision: 4ae99816b8994fdedc159156d8d9d242dd5c4782. HEAD is detached; refs/heads/master is the same commit, so the lane tip equals the audited revision.
Pins: baseline 7f506affa55f6fb892d3c8073c75151c998bdf2c; PSTACK_PIN 92d700d6a8aa9855f1e9d2cc8e12c82f762a1367.
Producer under audit: `.ufo/waves/round-20/lesson-history.mjs`, committed blob 7687b21f07a467aa540354e9c5b676ad9b5da92e, sha256 a8dade2deed3eab7d54c26576c2d604852b35757a076578c0c08b535eeb9bdc7 (worktree clean).
Frozen predicate: `scripts/check-user-round-contract.mjs` at 4ae9981, blob 9ebe31193325eb690e968ff09ef324400ae51fdb, sha256 568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273. Relevant lines: git() 126-146, laneTip 160-206, lessonDrift 333-342, checkHistory 391-419.
Tooling: git 2.56.0 (observed). Nothing installed or updated. The USER gate was not run. No fixtures, tests, or builds. Read-only commands only.

## Verdict
- Predicate equivalence at this revision holds. Same argv, same regex, same status and historical/current logic. The refused set is `[corpus/lessons/round-18.md, corpus/lessons/round-19.md]`, which matches the inherited expectation.
- Tool defect (HIGH, verified): run from any subdirectory, the script prints `refused: []`, `records: []` and exits 0. It must not produce a receipt until F1 is fixed.
- Not receipt-grade yet: the output carries no producer, gate, repo or argv identity (F3, F4).
- Round-20 lesson: the initial-only rule is encoded correctly. The committed `corpus/QUALITY.md:234` pointer to `corpus/lessons/round-20.md#mistakes` dangles until the single final lesson commit, which must contain a `## Mistakes` heading.

## Axes
| Axis | Result | Evidence |
|---|---|---|
| A1 predicate equivalence (argv, regex, status, historical/current) | holds | script:12-17 vs checker:333-342, :414 |
| A2 inherited refused set r18/r19 | holds when run from repo root | run result; per-lesson log below |
| A3 future round-20 lesson is initial-only | rule encoded correctly; exercised only by precedents | checker:337-341; script:17 |
| A4 fail-open / fail-closed | FAIL-OPEN from subdirectory (F1); malformed lines dropped silently (F7) | verified |
| A5 identity and provenance | missing (F3, F4) | verified |
| A6 hardening parity with gate git() | partial (F5, F6, F8) | checker:126-146 vs script:6 |
| A7 history-simplification completeness | latent gap shared with frozen gate (F2); no current instance | git-log man page; per-lesson comparison |

## Findings

### F1 HIGH (verified): cwd-dependent pathspecs, silent pass from a subdirectory
- script:12 and :16 use `corpus/lessons/` and `-- <path>` with no `cwd`, so git resolves pathspecs against the process working directory.
- Read-only reproduction: cwd `.ufo/` gives `{"refused":[],"records":[]}`, exit 0. cwd repo root gives refused `[round-18, round-19]`, 8 records, exit 0.
- The frozen git() spawns with `cwd: root` (checker:145).
- Fix: `root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')`, spawn with `cwd: root`, add `GIT_LITERAL_PATHSPECS=1`, and assert `git rev-parse --show-toplevel` equals root.

### F2 MEDIUM (latent; shared with frozen gate; doc-derived, not reproduced): default history simplification
- git 2.56.0 git-log "History Simplification", default mode: "If the commit was a merge, and it was TREESAME to one parent, follow only that parent." Also: "without --full-history ... if one of the parents is TREESAME, we follow only that one, so the other sides of the merge are never walked."
- The frozen argv (checker:339) and script:16 both use default mode. A lesson amended on a side branch whose merge result returns to first-parent content is pruned, so the predicate can admit a lesson with a committed modification inside pin..tip. `-m` does not change this; the man page describes `-m` as merge-diff output.
- Observed today: default and `--full-history` agree for all eight round-N lessons in pin..HEAD. Round-12..17 are empty in both. Round-18 is `{01531daf, c0aff236}` in both. Round-19 is `{3a933829, bf466e31, d5cf4d72}` in both. The two merges in the range (f032f2dc, 25f64835) change no LEGACY lesson against their first parent. No current instance.
- Mitigation: add a `--full-history` cross-check field to the audit output that does not change `refused`. Keep the round-20 lesson history linear. Closing the gap in the gate itself is a future-round change to checker:339, outside this wave.

### F3 LOW-MEDIUM (verified; fail-closed today): no repository identity
- The lane's parent `/home/vgpnk/Projects/shokunin` is itself a git repository. The script run from there exits 2 with `fatal: Needed a single revision`, because the pinned objects are absent there (`cat-file` rc 128). It fails closed by accident.
- The gate's laneTip requires toplevel equal to root (checker:167-171) and sets GIT_CEILING_DIRECTORIES to the lane's parent (:141). The script has neither.

### F4 MEDIUM for receipts: output has no producer, gate, argv or environment identity
- Required by QUALITY 26 (a run claim cites argv, producer digest, revision and exit) and QUALITY 30 (a claim cites a receipt only when the producer digest equals the registered blob). Also required by CriticNoHarm R8 (`.ufo/waves/round-20/w1/CriticNoHarm.md:45`: a committed receipt at final HEAD that applies the same predicates).
- Add: producer path, blob and sha256; gate path, blob, sha256 and line range; toplevel; `git --version`; argv; exit.

### F5 LOW: abbreviated pins
- script:11 uses `7f506af^{commit}` and `92d700d^{commit}`. The gate pins full `HARD_BASELINE` and `PSTACK_PIN` (checker:12-13). Both abbreviations resolve to the full ids today (verified). Use the full constants and assert equality.

### F6 LOW: environment parity
- script:6 omits `GIT_GRAFT_FILE=/dev/null`, `GIT_NO_LAZY_FETCH=1`, `GIT_LITERAL_PATHSPECS=1`, `GIT_TERMINAL_PROMPT=0`, `GIT_CEILING_DIRECTORIES` and `TZ=UTC`. It does not reduce PATH to absolute entries (gate :138).
- Verified absent here: `.git/info/grafts`, `.git/shallow`, promisor config, relative PATH entries, refs/replace. Latent: a lane-writable `info/grafts` would change the script's ancestry but not the gate's.

### F7 LOW: silent drops and empty errors
- script:13 drops any diff line whose path does not match the regex. The gate fails closed on any line not matching `/^([A-Z])\t(.+)$/` (checker:414-415).
- git() throws `new Error(r.stderr)`, which is empty on spawn failure. blob() maps any non-zero status, including spawn failure, to absence.

### F8 LOW: missing preconditions
- The gate requires baseline and pin to be ancestors of the tip (checker:393-394, 409-410). The script does not check. Both are ancestors at 4ae9981 (verified rc 0).
- The gate uses laneTip (checker:160-206). The script accepts any 40-hex revision. Equal today.

### F9 INFO
- For baseline lessons the script still lists `laterMDRTCommits` while `refused` is bytes-only. This matches the gate, but a reader may misread it. Merge hashes may repeat once per parent under `-m` (untested; no merge touches a LEGACY lesson today).

## Frozen-gate observations (not edited; main decides)
- G1 (F2): checker:339 has no `--full-history`.
- G2: the frozen selftest covers only linear lesson fixtures (checker:1279-1286, 1306-1308). There is no merge fixture, so the round-13 `-m` merge claim (SafetyHistory L4) and F2 are untested. The git man page says `-m` "will produce no output unless -p is given".
- G3: `LEGACY_LESSON = ^corpus/lessons/round-\d+\.md$` (checker:60). `training-round-11.md`, `kaika-fleet-round-1.md` and `round-N-verifier-spotcheck.md` are outside lessonDrift and outside the protected loop. The refused set is therefore a round-N census only.
- G4: the protected loop is green for lessons. Baseline round-1..round-10 are byte-identical at 7f506af, 92d700d and 4ae9981 (10/10 verified).

## Round-20 lesson (initial-only)
- Frozen rule (checker:337-341) for a path absent at baseline: status `A` in pin..tip, blob present at tip, and `git log -m --no-renames --diff-filter=MDRT pin..tip -- corpus/lessons/round-20.md` empty. script:17 encodes the same rule.
- Precedent: round-12..17 are admitted (A, empty). Round-18 and round-19 are refused after post-add commits.
- Requirements: the exact name `corpus/lessons/round-20.md` (a `-verifier-spotcheck` name is outside the freeze, per CriticNoHarm R2); one creation commit with final content; no later commit touching it; no first-parent-TREESAME merge that discards side-branch edits (F2).
- Pointer: `corpus/QUALITY.md:234` (committed at 4ae9981) cites `corpus/lessons/round-20.md#mistakes`. QUALITY 28 requires committed resolution. Convention is a `## Mistakes` heading (round-12..15 and kaika lessons). The final lesson must contain it.
- Confirmed: no `round-20.md` exists at HEAD, tracked or untracked, as designed.
- Main's post-integration check: run from repo root, `node .ufo/waves/round-20/lesson-history.mjs <final tip>`. Expect `refused` unchanged at `[round-18, round-19]`. Expect a `round-20.md` record with status `A` and `laterMDRTCommits: []`. Also run `git log -m --no-renames --diff-filter=MDRT --full-history --format=%H <pin>..<tip> -- corpus/lessons/round-20.md` and expect empty.

## Recommended script changes (not applied; I write only this report)
Axes improved: A4, A5, A6, and A7 via a cross-check. The verdict argv stays identical, so A1-A3 do not regress.
1. `cwd: root` on every spawn; assert toplevel equals root; `GIT_CEILING_DIRECTORIES = dirname(root)`.
2. Full pins as constants; assert baseline and pin are ancestors of the revision.
3. Env parity with checker:126-146, including GIT_GRAFT_FILE, GIT_NO_LAZY_FETCH, GIT_LITERAL_PATHSPECS, GIT_TERMINAL_PROMPT, TZ and the absolute-PATH filter.
4. Fail closed on any `--name-status` line not matching `/^[A-Z]\t.+$/`.
5. Output: producer and gate identities, toplevel, git version, argv, exit code; plus `fullHistoryLaterMDRTCommits` and `divergent` as non-verdict cross-check fields.

## Evidence (read-only)
- `git rev-parse --verify` on full and abbreviated pins: match.
- `git diff --name-status --no-renames 92d700d 4ae9981 -- corpus/lessons/`: 24 `A` lines; 8 LEGACY (round-12..19).
- `git log --merges 92d700d..4ae9981`: f032f2dc, 25f64835.
- `node .ufo/waves/round-20/lesson-history.mjs 4ae9981...` from repo root: refused `[round-18, round-19]`, 8 records, exit 0.
- Same command from `.ufo/`: refused `[]`, records `[]`, exit 0 (F1).
- Same command from `/home/vgpnk/Projects/shokunin`: exit 2 (F3).
- Per-lesson `git log -m --no-renames --diff-filter=MDRT --format=%H`, default vs `--full-history`: identical for round-12..19.
- Baseline lesson set `git ls-tree`: round-1..round-10; each byte-identical at baseline, pin and HEAD.
- `git symbolic-ref -q HEAD`: rc 1 (detached); `refs/heads/master` = 4ae9981.
- `git merge-base --is-ancestor` for baseline and pin: rc 0.
- `git grep` for `lessons/round-20` in committed files: wave w1 files and `corpus/QUALITY.md:234` only.
- `git config --local --name-only`: core.*, remote.origin.* only; no color, diff or log keys. No `.git/info/grafts`, no `.git/shallow`, no refs/replace.
- `man -P cat git-log` (git 2.56.0): History Simplification (default mode, `--full-history`, `--sparse`) and `-m` (lines 1677-1680).

## Untested
- Evil-merge and TREESAME cases: no fixture was run, since probes are reserved for mutation-tester seats. F2 rests on the git documentation only.
- Whether `-m` without `-p` selects merges for `--diff-filter`.
- The USER gate itself was not run. No receipt was written beyond this report.
