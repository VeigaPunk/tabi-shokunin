# ExecNoHarm — no-harm diff sweep (tabi round 42, wave w1)

Leaf executor. Read-only sweep; nothing in the production tree, the fleet repo, sibling repos
or shokuknow was written, committed, fetched or pushed by this seat. No tools installed or
upgraded (PACMAN batch avoided entirely; no `uv`, no binaries).

- Repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- `HEAD` audited: `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (`refs/heads/master` = `refs/remotes/origin/master` = HEAD)
- Baseline: `34e177959d1b7ce04afb85a001420e02631ce79e`
- Freeze: `9b6de3a19de11abdb80e82a1310abc64a40215bb`
- Snapshot time: 2026-10-28T15:41Z (wave live — see §7 concurrency caveat)
- Evidence: `.ufo/waves/round-42/w1/ExecNoHarm/evidence/01…10-*.txt`
- Scratch: `/fast/scratch/hyaku/tabi-r42/ExecNoHarm/` (created empty, removed at yield)

## 1. Diff scope — PASS with two out-of-allowlist paths (finding F1)

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --stat 34e177959d1b7ce04afb85a001420e02631ce79e..HEAD
 46 files changed, 24182 insertions(+), 2 deletions(-)
```
`git diff --name-status` → 46 entries, no deletions (`--diff-filter=D` = 0), no renames
(`--diff-filter=R` = 0). Full lists: `evidence/01-diff-stat.txt`, `evidence/02-name-status.txt`,
classification: `evidence/03-allowlist-classification.txt`.

Classified against the assigned allowlist
(`corpus/SOURCES.md`, `corpus/knowledge/`, `corpus/README.md`, `.ufo/waves/round-42/`,
`.ufo/waves/round-41/controls/c1-baseline-noop.out`, `corpus/evidence/round41/`,
`corpus/evidence/round42/`):

```
total=46 inside=44 outside=2
OUTSIDE ALLOWLIST:
  M LOG.md
  M SCORECARD.md
```

All 44 in-scope paths (exact): `.ufo/waves/round-41/controls/c1-baseline-noop.out` (M);
`.ufo/waves/round-42/{claims.json,controls/c1-baseline-tree-count.txt,controls/c1-battery-r42.{err,exit,json},controls/c1-r39-replay-r42.{err,exit,json},controls/c1-r40-replay-r42.{err,exit,json},controls/c1-r41-replay-refused.{err,exit,json},controls/c2-at-freeze.{exit,json},controls/c2-baseline-red.{exit,json},counters/check-routed-defects-round42.mjs,gen-w1-spec.py,measure/c1-measure.{exit,json,stderr.txt},measure/census-start.{err,exit,out},quarantine/build-quarantine-tsv.mjs,quarantine/slice-derivation.txt,quarantine/slice-ids.txt,quarantine/slice-raw.txt,sources/git-ls-tree.html,w1-dispatch.json,w1-run-output.json,w1-run.err,w1-spec.json,w1.ready,w1/swarm-registry.json}`
(A); `corpus/README.md`, `corpus/SOURCES.md` (M);
`corpus/evidence/round41/playwright-egress/{receipt.json,receipt.witness.json}` (A);
`corpus/knowledge/committed-bytes-verification-round-42.md` (A),
`corpus/knowledge/environment-injection-measurement-integrity-round-41.md` (M).

No diff path escapes the repo (absolute / `../` count = 0), so the diff cannot have written
`../templates/`, `../scripts/`, a sibling repo, `.ufo/state/` or `.ufo/watchdog.log`.

**F1:** `LOG.md` (+53) and `SCORECARD.md` (+23) are outside the assigned allowlist. See §2 for
`SCORECARD.md`, which is the named invariant. `LOG.md` was changed in the pre-wave-dispatch
commit `236c4f4`; project convention carries a per-round LOG entry, so this looks like an
allowlist omission rather than an unauthorized write — routed as a finding, not amended.

## 2. SCORECARD.md untouched at audit time — FAIL (finding F2, provenance)

Blob oids per revision (`evidence/06-scorecard-log-timeline.txt`):

```
SCORECARD.md
34e1779 (baseline)  a393b4011fe4c315d982e8979cf713404844a197
9b6de3a (freeze)    a393b4011fe4c315d982e8979cf713404844a197   <- unchanged at freeze
236c4f4             a393b4011fe4c315d982e8979cf713404844a197   <- unchanged at measurement/dispatch
0081bfd (HEAD)      3f67de77e32ffc34c0997f9486d72e2f3976e1a4   <- +23 lines
```
Commits (`git log --format='%h %cI %s' 34e1779..HEAD`):
```
0081bfd 2026-10-28T12:26:20-03:00 round-42: SCORECARD declared-claims section (frozen predicates, C1/C2)
236c4f4 2026-10-28T12:23:38-03:00 ... C1 live measurement ... wave w1 spec+dispatch(64 seats ...) ... LOG pre-dispatch entry
9b6de3a 2026-10-28T12:07:26-03:00 round-42: freeze C1 ... + C2 ...; land r41 defects D1/D2/D3; open S149
```
So `SCORECARD.md` **is touched at audit time**: the +23-line block landed in HEAD (`0081bfd`,
12:26:20), i.e. 18m54s after the freeze and 2m42s after the commit that already carried the live
C1 measurement. The appended heading is `## Round 42 — declared claims (frozen before data)`,
and its C1 row's Target cell embeds the measured post-data result
(`measured 2026-10-28: exit 0, spans 16,356/17,790 ms`) — the section's own provenance sentence
is chronologically false for the commit that carries it.

The material check that dispositions did **not** leak early still passes:
```
git diff 34e1779..HEAD -- SCORECARD.md | grep -E '^\+' | grep -cE '\| (expansion|quality|discernment|adjacency|momentum) \|'
0
```
(Only prior-round rows use that shape; no Round-42 axis row was added.) And the predicates
themselves were not amended after data:
```
git rev-parse 9b6de3a:.ufo/waves/round-42/claims.json  -> 53445f632acf24d3a816514b89268144122cc898
git rev-parse HEAD:.ufo/waves/round-42/claims.json     -> 53445f632acf24d3a816514b89268144122cc898
```
Net: F2 is a provenance/timing defect (SCORECARD restated the frozen claims after data, with a
"frozen before data" heading), not a premature disposition.

## 3. Protected paths — PASS

`evidence/04-protected-paths.txt`:
```
## MANIFEST.json
ls: cannot access 'MANIFEST.json': No such file or directory
.ufo/waves/round-32/w1/ExecCollectorTiming/MANIFEST.json      <- only MANIFEST.json in the repo (historical seat file, not in diff)
## .ufo/state
absent
## .ufo/watchdog.log
ls: cannot access '.ufo/watchdog.log': No such file or directory
## diff paths matching protected regex (MANIFEST|.ufo/state/|watchdog.log|^../|^templates/|^scripts/)
grep-exit=1 (no match)
## diff paths outside .ufo|corpus|LOG.md|SCORECARD.md
(none)
## working-tree modified tracked files
(none)
```

Fleet repo `/home/vgpnk/Projects/shokunin` (`evidence/09-outside-substrates.txt`):
```
git status --porcelain -- templates scripts   ->  (empty / clean)
git status --porcelain                        ->   M .ufo/l0-questions.md
                                                  ?? .scratch/{closure-mado-r50.json,closure-r54/,source-routing-queue.md}
                                                  ?? log-transcript.txt log.err log.exit o.bin oldrep1.out oldrep2.out utc_log
```
The single tracked fleet change is a **kaidoku round-45** question row (mtime 12:20:27), not
tabi round-42:
```
+kaidoku | round-45 | streak-brake cleared by orchestrator after 3x rejected-honest-stop (r42-r44); ...
```
Sibling repos: dirty trees observed are other lanes' in-flight artifacts, none referencing tabi
round-42 — `kaidoku-shokunin` (18, round-45), `mori-shokunin` (2, round-60), `tameshi-shokunin`
(3, round-54), `kama-shokunin` (1, a nested `kama-shokunin/` directory), all other siblings 0.
`/home/vgpnk/Projects/shokuknow`: HEAD `8b94c5c1` dated 2026-10-24, no worktree file newer than
the round start; only the `.git` directory mtime reads 12:41:07 with no surviving file inside
newer than 12:00 — consistent with a transient lock/index touch, not a content write. No
round-39-style write under shokuknow by this round.

## 4. The two >1 MiB D1 files are committed blobs — PASS

`evidence/05-d1-committed-blobs.txt`, at `HEAD=0081bfd`:
```
git cat-file -s HEAD:corpus/evidence/round41/playwright-egress/receipt.json          -> 1167198   (type blob, >1MiB yes)
git cat-file -s HEAD:corpus/evidence/round41/playwright-egress/receipt.witness.json  -> 1153988   (type blob, >1MiB yes)

git cat-file blob HEAD:.../receipt.json         | sha256sum -> 416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1
git cat-file blob HEAD:.../receipt.witness.json | sha256sum -> d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3
committed r41 measure record .ufo/waves/round-41/measure/c1-measure.json
  receiptSha256: 416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1
  witnessSha256: d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3
```
Digests match exactly; `.gitattributes` is absent at HEAD and the blob begins with real JSON
(`{"schema": "tabi-pw-firefox-egress-receipt-r41"`), i.e. no LFS pointer. Working-tree sizes
match the committed sizes byte for byte.

The only modified round-41 file re-derives correctly (D3): the populated control's command
```
git ls-tree -r --name-only fecbdf0a3aa79ce17bce3ef7338f69112f604f88 -- corpus/evidence/round41 | wc -l  ->  0
```
matches the `0` it now carries; at HEAD the same path counts 2.

## 5. Working-tree hygiene — FAIL (finding F3, tree pollution)

`evidence/07-untracked-pollution.txt` (snapshot 15:41:33Z):
```
tracked-modified: 0
untracked: 509..532 (live seats writing)
untracked outside ticket allowlist: 1
  OUTSIDE: corpus/lessons/lessons
```
Two self-referential directory symlinks exist in the production tree, both created during this
wave and both untracked:
```
corpus/knowledge/knowledge  symbolic link -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/   (mtime 2026-10-28 12:39:23.176663602 -0300)
corpus/lessons/lessons      symbolic link -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/     (mtime 2026-10-28 12:39:23.176663602 -0300)
```
`ls corpus/knowledge/knowledge/` resolves back into `corpus/knowledge/`, so the loop is real:
`find -L`, `grep -r`, `rsync`, `cp -r` over the tree can recurse, and a naive `git add -A`
would commit the symlink into `corpus/`. `corpus/knowledge/knowledge` slips past the allowlist
only because it sits under the allowed `corpus/knowledge/` prefix; `corpus/lessons/lessons` is
flatly outside. Not created by this seat (read-only sweep; no `ln`).

## 6. Evidence-pointer discipline — FAIL (finding F4, D1-class recurrence)

`evidence/08-dangling-pointer.txt`: `corpus/lessons/round-42.md` is cited by three changed
files, but is **absent** both from the HEAD tree and from the working tree:
```
git ls-tree -r --name-only HEAD -- corpus/lessons/round-42.md   -> (empty)
ls -la corpus/lessons/round-42.md                               -> No such file or directory
citers: corpus/README.md:879, corpus/SOURCES.md:160 (S146 used-by),
        corpus/knowledge/environment-injection-measurement-integrity-round-41.md:82
```
The last one states the redirect explicitly: "…its `used-by` moved to
`corpus/lessons/round-42.md` (old→new logged in the round-42 lesson)". This is the same class
as D1 — a pointer to evidence that does not exist at a revision — occurring inside the round
that claims to have closed D1/D2, so the C2 "D2 landed" narrative is under-supported as
committed. (Adjudication of the C2 predicate belongs to the C2 reviewers; recorded here as a
sweep-observed landing defect.)

## 7. Reachability and concurrency

`evidence/10-reachability-concurrency.txt`:
```
refs pointing at HEAD (0081bfd):
  refs/heads/master, refs/jj/keep/0081bfd…, refs/remotes/origin/HEAD, refs/remotes/origin/master
HEAD symbolic? detached (master points at the same commit)
```
So the audited tree is reachable from a branch and from the pushed remote ref — "committed but
unreachable" does not apply. Reflog: three jj exports `9b6de3a → 236c4f4 → 0081bfd`.

Concurrency caveat: wave w1 is still live (57–58 seat dirs under `.ufo/waves/round-42/w1/`,
untracked count grew 349 → 509 → 532 during this sweep). All statements above are a
point-in-time snapshot at 15:41Z over HEAD `0081bfd`; no tracked file was modified in the
working tree at snapshot time.

## 8. Findings summary

| # | Check | Result |
|---|---|---|
| — | 46 tracked changed paths, no deletes/renames, none escaping the repo | PASS |
| F1 | Allowlist: `LOG.md`, `SCORECARD.md` outside the assigned path list | finding |
| F2 | `SCORECARD.md` untouched at audit time | **FAIL** — +23 lines in HEAD `0081bfd` (12:26:20), after freeze (12:07:26) and after the measurement commit (12:23:38); no axis disposition rows added (grep count 0), claims.json unamended (oid `53445f6` both ends) |
| — | `MANIFEST.json`, `../templates/`, `../scripts/`, `.ufo/state/`, `.ufo/watchdog.log` | PASS (untouched/absent; no matching diff path) |
| — | Sibling repos / shokuknow | PASS (dirty trees belong to other lanes; no round-42 tabi writes outside the repo) |
| — | Two >1 MiB D1 files are committed blobs at HEAD | PASS (1,167,198 / 1,153,988 B, type `blob`, digests equal the committed r41 measure record) |
| F3 | Working-tree hygiene: recursive directory symlinks `corpus/knowledge/knowledge`, `corpus/lessons/lessons` | finding (untracked, mtime 12:39:23; `corpus/lessons/lessons` outside allowlist; recursion hazard) |
| F4 | `corpus/lessons/round-42.md` cited by 3 changed files but absent at HEAD and on disk | finding (D1-class) |
| — | Reachability of HEAD | PASS (`refs/heads/master` = `refs/remotes/origin/master` = HEAD) |

Limitations: no network used; `origin/master` equality read from the local remote-tracking ref,
not from `ls-remote`. Sibling-repo and shokuknow checks are read-only status/mtime observations,
not attribution. Wave is live, so untracked totals and sibling dirty counts drift.

VERDICT finding
