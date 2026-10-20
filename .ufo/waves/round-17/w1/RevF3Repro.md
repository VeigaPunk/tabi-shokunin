VERDICT: PASS

F3 reproduced end-to-end at baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` with real
`jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`. Every quoted F3 number that is
revision-independent matched exactly. No jj/git write ran in LANE; all writes were sandbox only.

## Setup (sandbox only)

```
SB=/tmp/tabi-r17-RevF3Repro-2-1dJx
git clone -q --no-hardlinks LANE "$SB/jj";      # HEAD=master=5859243
git clone -q --no-hardlinks LANE "$SB/plain"
cd "$SB/jj" && jj --config 'snapshot.auto-track="none()"' git init --colocate .
jj --ignore-working-copy config set --repo snapshot.auto-track '"none()"'
# init leaves git HEAD attached at master=5859243 (JjTrialTabi step 2 reconfirmed)
```

## 1. SHONEN.md edit is snapshotted into git HEAD (F3's sequence)

```
$ printf '\nprobe-edit\n' >> SHONEN.md
$ git status --porcelain=v1
 M SHONEN.md
$ jj st
Working copy changes:
M SHONEN.md
Working copy  (@): nktlxqnl 52071387 (no description set)
$ jj new
Working copy  (@) now at: txvuqkqy 1b2b4e9a (empty) (no description set)
$ git rev-parse HEAD; git rev-parse master
52071387ece328bbbb33e0cb3d79ab96373f022d
5859243183c4d7ac5429dfdb8a73ce0d9a43d583
$ git hash-object SHONEN.md; git rev-parse HEAD:SHONEN.md; git rev-parse master:SHONEN.md
5b58313999cb54214c77964841c61483f7859f50
5b58313999cb54214c77964841c61483f7859f50
9dcb2687d3083f696b57032389eed7349e03893e
$ git branch -a --contains HEAD      ->  * (no branch)
$ git merge-base --is-ancestor HEAD master   -> rc=1   (likewise vs origin/master=5859243, rc=1)
$ git status --porcelain=v1          ->  (empty: a clean porcelain status hides the divergence)
```

`jj file track SHONEN.md` exits 0 (already tracked); auto-track `none()` does not stop
*modified tracked* files from entering @ — only untracked paths are skipped. Export to git HEAD
happens at `jj new`/`jj commit`, not at `jj st` (probe2: after `jj st` HEAD stayed 5859243;
after `jj new` HEAD=ef9b54d).

The failure is identical to F3: `ROUND_CONTRACT verdict=failed finding=shonen_policy
detail=SHONEN.md has non-canonical prose after the four boxes:` (exit 1). Code read:
`scripts/check-round-contract.mjs:170` `blob(root,'HEAD',SHONEN_PATH)`,
`:173` `show(root,'HEAD',SHONEN_PATH)`, `:231` `rev-parse HEAD` (baseline blob at 5859243).

## 2. Benign SHONEN edit: unlanded bytes certified clean (fresh probe3)

Appended ` (f3 benign probe)` to box 1's existing evidence line (evidence text is excluded from
the normalized seed, so policy normalizes to the canonical digest):

```
worktree SHONEN=bc45790461210ad3a9abf25f9a2a233c78336639
HEAD=b926442a3b5f796126edceb05524db4641eb263e  master=5859243
HEAD:SHONEN=bc457904...  master:SHONEN=9dcb2687...   status=[]  contains=* (no branch)  merge-base rc=1
$ node scripts/check-round-contract.mjs   -> exit=0
ROUND_CONTRACT verdict=clean rounds=10 consequential=0
```

This confirms F3's parenthetical: a benign edit to the same path yields a *clean* verdict from
unlanded HEAD bytes, not merely a failure.

## 3. Witness `committed` comparison reads HEAD — controlled A/B

Baseline code (`git show 5859243:scripts/check-user-round-contract.mjs`, exact lines):
```
788 function witness(rev) {
790   const codeRevision = gitOk(defaultRoot, ['rev-parse', 'HEAD']);
793   const worktreeBlob = gitBlobSha1(scriptBytes);
794   const headBlob = blob(defaultRoot, 'HEAD', USER_SCRIPT);
795   const committed = headBlob !== null && headBlob === worktreeBlob;
796   const measuredRevision = committed ? codeRevision : 'uncommitted';
```
Same trio at `:877-879` (count witness) and `:952-954` (diagnostic witness). `blob()` is
`rev-parse --verify <rev>:<path>` (`:126-129`); `regularBlob()`/`checkShonen` likewise use HEAD.
No line consults `master`, `origin/master`, or push state.

Probe: append the identical comment to `scripts/check-user-round-contract.mjs`, run the SKILL.md
registry argv `node scripts/check-user-round-contract.mjs --witness 75e7836b6c3090180aee2754e20a5d3cfb186e74`
(SKILL.md:1730):

plain git clone (HEAD=master=5859243, edit uncommitted):
```
head-blob=ce89e692d601ad39e88d7f037ede34a31ad87f25 worktree-blob=c427ff0c22e26aa777b562d0bbfcc8a83532f7b7
committed=no measuredRevision=uncommitted codeRevision=5859243... code-sha256=9c3a32b4... result=PASS exit=0
```
jj clone after `jj st` + `jj new` (same worktree bytes, HEAD moved):
```
HEAD=cb65e22379e4fc0fe881733721837f8e977ee0cd  master=origin/master=5859243
HEAD:script=c427ff0c... = worktree-blob ; master:script=ce89e692...
contains=* (no branch) ; merge-base --is-ancestor HEAD master -> rc=1 ; --is-ancestor HEAD origin/master -> rc=1
head-blob=c427ff0c22e26aa777b562d0bbfcc8a83532f7b7 worktree-blob=c427ff0c22e26aa777b562d0bbfcc8a83532f7b7
committed=yes measuredRevision=cb65e22379e4fc0fe881733721837f8e977ee0cd codeRevision=cb65e2237... result=PASS exit=0
```
Identical script bytes (`code-sha256=9c3a32b4...`) and identical master blob in both arms; only
HEAD moved. `committed=no` flips to `committed=yes` and the receipt cites a commit on no branch,
not an ancestor of master or origin/master. F3's `[INFERENCE]` is now directly observed.

## Notes / scope precision (not defects)

- `committed=yes` requires HEAD:USER_SCRIPT == worktree, so the witness leg needs the checker
  script itself snapshotted into HEAD; the SHONEN-only leg demonstrates the gate read (part 1).
- The F3 window opens at an exporting jj operation (`jj new`, whole `jj commit`), not at `jj st`.
  A helper-style path-scoped `jj commit -- <path>` exports HEAD to the split commit and leaves
  un-pathed edits in @ (probe2: `HEAD:probe-b.txt` absent, `status= A probe-b.txt`; later
  `HEAD:SHONEN=5b58313` vs worktree `99fac72`, `status= M SHONEN.md`). This narrows but does not
  remove the hazard: the committed file itself is exported, and the flag never checks push state.
- F3's wording "never-committed working-copy content" is loose for jj (the bytes do live in the
  working-copy commit object); the precise hazard, stated later in F3, is "on no branch and were
  never pushed". The finding itself stands.
- F3 line refs verified: `:793-795`, `:877-879`, `:952-954` exact; `check-round-contract.mjs:990,
  996,1000,1004` are the fixture reads/`headStable` assertion (the live `code_revision=` read is
  `:1007`), consistent with F3's sentence.

## Verification gaps

- Not re-run: `check-freshness.mjs --witness HEAD` (byte-frozen, F6 scope, excluded from C1).
- No Chromium/WebMCP runtime involved; not applicable to F3.

Files written: .ufo/waves/round-17/w1/RevF3Repro.md
(Sandbox /tmp/tabi-r17-RevF3Repro-2-1dJx and /tmp/witness-*.out remain only for this report's
citation; F3 held, so nothing needs preservation — removed at close unless the interviewer asks.)
