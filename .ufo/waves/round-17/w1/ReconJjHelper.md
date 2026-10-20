VERDICT: PASS

# ReconJjHelper — jj-lane.sh: HEAD after `commit`, what `state` prints, where HEAD drifts

Scope: `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh` (268 lines, deployed: callers `scripts/hyaku/inline.sh`,
`hyaku.env`, `lane-addendum.md`, `closure-prompt.md`). Read-only on LANE. Method: full read + three throwaway sandboxes
(`git init --bare` local origin, real `jj-lane.sh init/commit/push`) with jj `0.45.1-7c41cdeb…` (`/home/vgpnk/.local/bin/jj`)
and git 2.56.0; all git/jj writes in `/tmp/tabi-r17-reconjj-*`, removed. LANE only read (`jj-lane.sh state`, `git rev-parse`,
`symbolic-ref`, `reflog`, `status`). Live lane is concurrently edited by C1 seats (state `tracked=0`→`4` during the recon).

## 1. After `commit` (exit 0): HEAD is detached at the committed commit and equals the pushed master tip

- `jj commit -m msg -- paths` (:228-230) commits `@` as `@-` and makes a new empty working-copy `@`; jj writes git HEAD detached
  at `@-` (the committed commit), not at the new empty `@` — JjDocHeadAttachment.md:18 table, :63-79 F2. The helper reads that
  same `@-` for its hash (`hash=$(jj_ids '@-' commit_id)`, :231).
- It then points the branch bookmark at that hash (`bookmark set "$branch" -r "$hash"`, :233-234) and pushes (:238-239).
  With no push recovery: `HEAD == refs/heads/master == refs/remotes/origin/master ==` the printed `pushed` hash.
- Observed, exact script in sandbox (local bare origin, master): init line `state … head=attached`,
  `HEAD-symbolic: refs/heads/master`, head=master=origin=`4e86f353…`; then
  `committed bd3ab4f88cd1176acb0a0a859041e13135783fb8` / `pushed bd3ab4f88cd1…`, `HEAD-symbolic: DETACHED`,
  head=master=origin=`bd3ab4f88…`, `git branch --contains HEAD` lists `master` + `remotes/origin/master`,
  `git merge-base --is-ancestor HEAD refs/heads/master` rc=0, `state branch=master local=remote=bd3ab4f8… ahead=0 behind=0 head=detached`.
- HEAD is **not attached** (`git symbolic-ref -q HEAD` fails; same in JjAuditTabi.md:74-78) and is **not** the new empty `@`
  (jj printed `Working copy (@) now at: 204f6ffb (empty)`; HEAD was its parent `bd3ab4f8`).
- The first `commit` on a fresh init is what detaches: `jj git init --colocate` leaves HEAD attached (:142-147; doc :17;
  JjAuditTabi.md:91-93 "detachment begins at the first `jj commit`/`jj new`").
- Recovery caveat: if `do_push` rebases the unpushed change (:118-122), jj rewrites `@-` and HEAD follows to the rewritten
  commit, so HEAD == master == origin == `pushed`; the earlier `committed` line is the pre-rebase hash (JjTrialTabi.md:121;
  sandbox: committed `32517c76…`, push rebased → `pushed b184401…`, HEAD `b184401…`).
- Other outcomes:
  * exit 3 (push failed, :239): HEAD == local master (new commit) but != origin/master. Observed `commit_rc=3`,
    head=master=`32517c7631d8…`, origin=`bd3ab4f88…`, `state … ahead=1 behind=0 head=detached`.
  * exit 1 at :232 (hash unreadable) or :233-234 (bookmark set failed): the commit object already exists (:230) and nothing
    rolls it back → HEAD at the new commit, master at the old tip. [INFERENCE: code path; the bare-`jj commit` sandbox shows
    exactly this pair, HEAD `4372d82` vs master `e38d259` — JjAuditTabi.md:69-91.]
  * `nothing to commit` (:218-220): HEAD untouched, but the branch is still pushed (:238).
  * every listed path missing (:199): prints `nothing to commit (no such paths)`, **exit 0, no commit, no push**.

## 2. What `state` prints

One line (:81):
`state branch=<b> local=<hex|-> remote=<hex|-> ahead=<n> behind=<n> head=attached|detached tracked=<n> untracked=<n>`
- `branch`: symbolic HEAD branch if attached (:55), else `refs/remotes/origin/HEAD` (:57-58), else local master/main/first branch
  (:59-63), else `?` (:70). Live lane: origin/HEAD = `refs/remotes/origin/master`, so `branch=master` while detached.
- `local`/`remote`: `refs/heads/$branch` / `refs/remotes/origin/$branch` (:71-72), `-` if absent.
- `ahead`/`behind`: `rev-list --count` both directions only when both refs resolve (:73-76), else `0`/`0`. **No fetch** — the
  remote side is only as fresh as the last fetch (see §3 item 3).
- `head`: `attached` iff `git symbolic-ref -q HEAD` succeeds (:77); `detached` is printed whenever HEAD is detached, including
  the healthy HEAD==master case.
- `tracked`: count of porcelain lines matching `^[ MADRCU][MADRCU ]` (:79); `untracked`: `^??` count (:80). Verified in sandbox:
  ` M base.txt` + `?? fresh.txt` → `tracked=1 untracked=1`.
- Pure git, no jj call (:67), so `state` itself never moves HEAD.
- Live lane at `2026-10-20T12:50:42-03:00`:
  `state branch=master local=5859243183c4d7ac5429dfdb8a73ce0d9a43d583 remote=5859243183c4… ahead=0 behind=0 head=detached tracked=4 untracked=1`
  (`tracked=4` = concurrent C1 seat edits; the same command read `tracked=0 untracked=1` earlier). `.git/HEAD` contains the raw
  OID `5859243…`, `git reflog` HEAD@{0} = `export from jj`.
- **Blind spot**: `state` never prints HEAD's OID, never compares HEAD to `local`, and never says whether HEAD is an ancestor of
  the branch. `head=detached` is byte-identical for healthy (HEAD==master) and drifted lanes. It cannot be used as anchor proof.

## 3. Lane operations that can leave HEAD != master

1. `commit`, exit 1 after the commit exists (:231-234): HEAD at the new commit, master at the old tip — HEAD on no branch
   (`git branch --contains HEAD` empty; JjAuditTabi.md:69-91). [INFERENCE: code path, not force-triggered.]
2. `commit`, exit 3 (:239): HEAD == local master but `origin/master` is behind; `state … ahead=1 head=detached` (observed).
3. A `jj git fetch` that fast-forwards a tracked bookmark (doc :20/:131-143), e.g. a fleet/seat fetch or `do_push`'s :118 fetch:
   master@origin and the tracked `master` advance, HEAD is left at the pre-move oid. `jj-lane.sh push` then exits 0 and prints
   the new tip (`pushed $(heads(master@origin) commit_id)`, :111) **without re-anchoring HEAD**; the only ref write in the push
   path is `bookmark set` (:122/:126), and a bookmark move never moves HEAD (doc :20). Observed: pre-push HEAD=`22cce39`, master=origin=`a86b01b`;
   `jj-lane.sh push .` → `pushed a86b01b…`, rc=0; after: HEAD=`22cce39`, master=origin=`a86b01b`, `HEAD_equal_master=NO`,
   `merge-base --is-ancestor HEAD master` rc=0, and `state … local=remote=a86b01b ahead=0 behind=0 head=detached` (clean-looking).
   Attached variant: after init HEAD attached; the fetch detached HEAD at the pre-move oid (`a86b01b`) while master/origin moved
   to `4f1d306`; `push` rc=0, state clean, HEAD != master.
4. Any jj mutation outside the helper: `jj new` (HEAD → old `@`, on no branch; verified HEAD=`9606dff3` vs master=`b1844019`,
   `merge-base --is-ancestor HEAD master` rc=1, and `state` byte-identical to the healthy line), likewise `jj edit`,
   `jj abandon`, `jj rebase`, `jj describe` (parent change). The script contains no HEAD assert/repair and no
   `git checkout/reset/switch/update-ref` (grep: only `jj git push` :109, `jj git fetch` :118, `bookmark set` :122/:126/:233).
5. `init` on an already-drifted lane (:142-163) neither attaches nor re-anchors HEAD; it only initializes/configures. Fresh repo
   → `head=attached` (sandbox).
6. `commit`'s "nothing to commit" (:218-220) on an already-drifted HEAD leaves the drift and still reports `pushed <master>`
   (a hash HEAD is not at).
7. Hash-trust corollary: with nothing to push, `jj git push` exits 0 without contacting the remote (sandbox STEP 3: true remote
   `768839eb`, printed `pushed b184401…`, origin ref stayed `b184401`). So even the `pushed` line can certify a stale tip, and
   `state behind=` is stale until a fetch.

## 4. Consequence for C1 (lane-tip anchoring)

- HEAD == pushed master tip is **incidental** to a successful `commit` (and to a recovery rebase that rewrote it), not an
  invariant: push failure, bookmark-set failure, a fetch that advances the tracked bookmark, or a bare `jj new` all break it.
- Gates/seats must anchor on `git rev-parse --verify 'refs/heads/master^{commit}'` (pushed claims: `refs/remotes/origin/master`),
  exactly as PLAN.md:63-72 `laneTip` specifies; `--witness HEAD` remains unsound (JjAuditTabi.md:184-188).
- After a successful helper `commit` HEAD==master is the common case, which is the trap: an accidental HEAD read is usually
  right and wrong only on exactly the paths that matter.

## Caveats

- `scripts/hyaku/jj-lane.sh.new` (33130 B, mtime 12:46 today) also exists; no reference under `scripts/` or `.ufo/waves/hyaku`
  (`grep -rl` rc=1). This report describes the deployed `jj-lane.sh`; `.new` has a different re-anchor design (e.g. :253-260,
  :394-395) and is out of scope.
- Live-lane numbers moved because C1 seats are writing `scripts/`; no live-repo writes were made by this seat, sandboxes removed.
- Tools: none installed. jj 0.45.1-7c41cdeb, git 2.56.0.

Files written:
- .ufo/waves/round-17/w1/ReconJjHelper.md
