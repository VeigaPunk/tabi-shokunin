VERDICT: ISSUES

# RevJjHead — jj 0.45.1 colocated git-HEAD, measured (round-17 wave 1)

Host: jj `0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5` (`/home/vgpnk/.local/bin/jj`), git 2.56.0,
2026-10-20. No tools installed/upgraded. Lane read-only (reads + `git clone --no-hardlinks`); every jj/git
write happened in `/tmp/tabi-r17-RevJjHead-EMMSHW` (7 sandboxes, deleted after the run). This report is the
only lane write.

## Reconstructed contract (observed, not inferred)

1. **In a colocated repo jj maintains `git HEAD = @-`** — the *parent* of the working-copy commit — never
   `@` itself. Index = `@-`'s tree, worktree = `@`'s tree, so `git status` renders the jj working-copy diff
   as ordinary unstaged changes. `HEAD == @-` in all 42 snapshots that had a `.jj` and recorded both ids
   (expB 8/8, expC 8/8, expD 9/9, expE 7/7, expG 5/5, expF 5/5; the only `no` rows are the two pre-init
   clones, where `@` does not exist) and in every expA `detail` block (10 rows, `@`/`@-` read from
   `jj log --ignore-working-copy`).
   `git diff --cached` was empty in all 8 expC states (index == HEAD tree).
2. **Attachment is sticky, not managed.** `jj git init --colocate` leaves HEAD attached (`symbolic-ref` rc 0)
   while `@-` is that branch's tip. The first export that must name a different commit detaches HEAD and jj
   **never re-attaches**: `bookmark set master -r @-` with master already == HEAD leaves it detached
   (expD D5, expE E1-2). Only `git checkout master` re-attached (expD D6). Detached `.git/HEAD` on disk is a
   raw 40-hex file (expB: `7e5ab7f6…`; expE e1: `e78f0dc5…`), i.e. exactly what the C1 counter's Arm B
   (`git update-ref --no-deref HEAD P`) writes; `git symbolic-ref -q HEAD` rc 1, no output.
3. **`HEAD == master` is a coincidence of state, not an invariant.** It holds after init, after a no-op
   push, after `git checkout`, and after each helper commit (the helper bookmarks the same `@-` that HEAD
   already names, `scripts/hyaku/jj-lane.sh:231,233`). It breaks after a raw `jj commit` (HEAD ahead), after
   `jj edit` or `bookmark set master -r @` (HEAD behind/parent), and when a snapshot rewrites the bookmark.
4. **Any jj command without `--ignore-working-copy` snapshots and exports**, including `jj log` and `jj st`
   (expD D1 / expA A2b). Snapshotting can rewrite the descendants of `@`, and bookmarks follow rewrites:
   a plain `jj st` moved `master` `c6dfc38b` → `f4cd97a3` with no commit in expA A10b. Gates are git-only,
   so they never trigger this.

## Acceptance table — step → HEAD, attached?, HEAD==master?

Fresh git repo + `jj git init --colocate` (auto-track `none()`, helper's exact call), expA/C/D/E1.
`base` = first commit; below, 12-hex ids; "det" = detached; full ids in the notes.

| # | step | HEAD | attached? | H==master? | side facts |
|---|---|---|---|---|---|
| 1 | plain git, `master` checked out | `be51c910a4e9` | yes | yes | baseline (expA A0; expC C0; expE E1-0) |
| 2 | `jj git init --colocate` (+repo config) | `be51c910a4e9` | yes | yes | unchanged; `@` = new empty commit (e.g. `9e5c3d4b`) |
| 3 | edit tracked file, no jj command | `be51c910a4e9` | yes | yes | `git status` = ` M a.txt` |
| 4 | `jj st` (snapshot) | `be51c910a4e9` | yes | yes | `@` rewritten (f90d52dc); HEAD untouched |
| 5 | `jj log` (no `--ignore-working-copy`) | `be51c910a4e9` | yes | yes | also snapshots: `@` 09d793e0→08ab9d62 (expD D1) |
| 6 | `jj commit -m … -- a.txt` (raw) | `d454c62b1c03` | **det** | **no** (ahead 1) | HEAD==@-; non-empty; master stays base (A3; D4; E1-1) |
| 7 | `jj new` (after the helper steady state) | `1ce63dcbdf42` | det | no (ahead 1) | HEAD = old `@`, **empty** (expB B4; expA A4 8c49ed2e; expD D8 741fd956) |
| 7b | `jj new` after a dirty `jj st` | `25c228048c0c` | det | no (ahead 1) | HEAD = the **uncommitted snapshot**, non-empty (expF F2b) |
| 8 | `jj describe -m …` | unchanged | as before | as before | rewrites `@` only; A5: `@` 8c49ed2e→c6dfc38b, HEAD stays 8c49ed2e |
| 9 | `jj edit master-` / `jj edit master` (unpushed) | target's parent (`d454c62b1c03` / `7f9b8c7ec3bf`) | det | **no** | G1: HEAD a.txt=`v0`, master/worktree=`v1` (byte divergence) |
| 9b | `jj edit master` where master==`master@origin` | unchanged | det | unchanged | **rc 1** `Error: Commit … is immutable` (expB B6, expC C5, no mutation) |
| 10 | `jj bookmark set feature -r @` | unchanged | det | unchanged | new bookmark only (A6) |
| 11 | `jj bookmark set master -r @` | `8c49ed2e13b0` | det | **no** (behind 1) | master=@=c6dfc38b, HEAD=@- (A7; expC C6) |
| 11b | `jj st` while `@` is an ancestor of master | unchanged | det | **no** | snapshot rewrote the bookmark: master c6dfc38b→f4cd97a3 (A10b) |
| 12 | `jj git push --remote origin --bookmark master` | unchanged | det | yes if 11 ran | push success does not touch HEAD (E1-3 rc 0; B3 no-op) |
| 12b | push with non-tracking remote bookmark | unchanged | det | unchanged | rc 1 `Non-tracking remote bookmark master@origin` (A9) |
| 12c | push with an undescribed commit in range | unchanged | det | unchanged | rc 1 `Won't push commit … since it has no description` (C7) |
| 13 | helper `init` | `5859243183c4` | yes | yes | `state … head=attached`; `@` empty (B1/E2-1) |
| 14 | helper `commit` (normal) | `7369a31c5b78` | **det** | **yes** | HEAD==master==**pushed** (B2b; E2-2 `4d337a4b936a`); `state … head=detached` |
| 15 | helper `commit` after operator remote move | `e52d889ed9fb` | det | yes | rebase recovery: pushed line `e52d889e`, committed line `e293394f` is pre-rebase and absent from the remote (E2-3) |
| 16 | helper `commit` after a stray raw `jj new` | `7e5ab7f640f4` | det | yes | push failed after 3 attempts, **exit 3**; remote still `7369a31c`; `state … ahead=2` (B7) |

Lane today (read-only): `HEAD == master == 5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, **detached**, clean
worktree — the anchored post-helper state, consistent with `PLAN.md:5` (`head=detached`).

## Divergences from the round's stated premises (C1)

- `PLAN.md:20-21` and the gate draft comment (`scripts/check-round-contract.mjs:82-86`, currently an
  *uncommitted* worktree edit; the committed blob has no `laneTip`, grep count 0) say "after `jj commit` HEAD
  names an unlanded local commit". True only for a **raw** commit (#6). The helper's commit re-bookmarks that
  same `@-`, so #14 ends with HEAD == local master == pushed hash. The unlanded window is raw `jj commit`,
  `jj edit`, `bookmark set master -r @`, and a failed push — not the normal gate flow.
- "after `jj new` it names an empty commit" is conditional: it names **whatever `@` was**; empty in the
  helper steady state (#7), but a non-empty uncommitted snapshot after a dirty tree (#7b, expF F2b). The
  "snapshot-only content" hazard (`PLAN.md:20-21`) is real and survives the fix.
- The C1 `laneTip()` semantics match observed git behaviour (`symbolic-ref` rc 0/1 as assumed), **but** it
  anchors the **local** `refs/heads/master`. After a failed push the helper has already moved that bookmark
  (#16: local master `7e5ab7f6`, remote `7369a31c`), so `laneTip` cannot yield the *pushed* hash. A gate
  printing `code_revision=<laneTip>` must label it "local lane tip", or compare
  `refs/remotes/origin/<branch>` separately. This is the one substantive gap for C1.
- `JjAuditTabi.md` F1/F2/F3 and `JjTrialTabi.md` hazard 3 reproduce (HEAD detached after the first write;
  gates read HEAD bytes). Corrected mechanism: HEAD is `@-`, not `@`, and not intrinsically "the new commit"
  — that is why HEAD equals master exactly after the helper and why the index/worktree stay clean.

## Live gate demonstration (committed gate bytes, no `laneTip`)

expF lane clone (master `5859243`): edit `SHONEN.md`, `jj st`, raw `jj commit`, then rewind master to
`master@origin` (sandbox `--allow-backwards`). HEAD `fb23a77d45ee` (unlanded, tree from `25c2280`), master
`5859243`: `SHONEN.md` blob `eaf0acd2…` at HEAD vs `9dcb2687…` at master.
`node scripts/check-round-contract.mjs` → **exit 1**, `verdict=failed finding=shonen_policy` — a HEAD-anchored
gate certifies bytes master does not have. With master pointed at the unlanded commit it still fails (gate
follows HEAD==master), so the defect is the anchor, not the bytes.

## Operability findings for the lane

1. One stray **empty undescribed** commit between master and the next commit wedges the helper's push for
   every later commit: retries 3×, exit 3, local bookmark already moved ahead (#16). [INFERENCE] recovery is
   to describe or abandon that empty commit; not executed.
2. `jj edit` of any **pushed** lane commit is refused (`immutable_heads()` = `trunk()`, which the helper
   aliases to `master@origin`, `jj-lane.sh:155`); only unpushed commits are editable. After a successful
   helper push, the whole lane history is immutable — good for gate stability, but seat-level `jj edit` is
   unavailable.
3. `jj bookmark set` refuses backwards/sideways moves without `--allow-backwards` (observed in sandbox), so
   any future helper recovery that rewinds must pass it.
4. A plain `jj st`/`jj log` can rewrite a bookmark (A10b). Gates are git-only and cannot trigger it, but a
   concurrent seat jj command can change the very hash a gate just resolved; resolving the tip once (already
   the C1 design) is the right mitigation.

## Confidence

High. Every row was observed in at least two independent sandboxes; the `HEAD == @-` rule held in all 42
`.jj` snapshots plus the 10 expA detail rows; the gate demo used the lane's committed gate bytes. Two
mechanisms are marked [INFERENCE] (descendant-rewrite propagation, wedge recovery) because only their
effects were measured.

## Evidence commands (each row came from this probe)

Per row, `<R>` = sandbox repo: `git -C <R> rev-parse HEAD`; `git -C <R> symbolic-ref -q HEAD` (rc 0 attached
/ rc 1 detached); `git -C <R> rev-parse refs/heads/master`; `jj --ignore-working-copy -R <R> log --no-graph
-r @ -T commit_id` and `-r '@-'`; `git -C <R> rev-parse HEAD:<path>` / `master:<path>`; `git hash-object`.
Empty-commit flag: `h=$(git -C <R> rev-parse <C>)`, compare the trees of `$h` and `$h^`.
```
d=$(mktemp -d); git init -q --bare "$d/remote.git"; git init -q -b master "$d/repo"; cd "$d/repo"
printf 'a\n' > a.txt; git add -A; git commit -qm base; git remote add origin "$d/remote.git"
git push -q -u origin master
jj --config 'snapshot.auto-track="none()"' git init --colocate .
jj --ignore-working-copy config set --repo snapshot.auto-track '"none()"'
jj --ignore-working-copy config set --repo 'revset-aliases."trunk()"' '"master@origin"'
jj --ignore-working-copy bookmark track master@origin

# helper arms: clone LANE (lane0) and its bare remote; clone lane; set lane's origin to the bare remote
HYAKU_STATE="$d/state" scripts/hyaku/jj-lane.sh init "$d/lane" tabi
echo probe > "$d/lane/probe.txt"
HYAKU_STATE="$d/state" scripts/hyaku/jj-lane.sh commit "$d/lane" --as tabi -m probe -- probe.txt
HYAKU_STATE="$d/state" scripts/hyaku/jj-lane.sh state "$d/lane"
```
E2-3: clone `"$d/remote.git"` separately as operator, commit one file, `git push origin master`, then run a
second helper commit from the lane clone.

## Files written

- `.ufo/waves/round-17/w1/RevJjHead.md` (this report)

Sandboxes `/tmp/tabi-r17-RevJjHead-EMMSHW/{expA..expG}` were removed after transcription; no lane file was
modified, no jj/git write ran in the lane, no browser/CDP was used.
