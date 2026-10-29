# ExecScratchGuard — misroot and scratch scan

Seat: `ExecScratchGuard` (executor, leaf). Axis: **operability**. Milestone: **misroot and scratch
scan**. Lane: tabi, round 43, wave 1 (policy-v2, 64 seats).

Scope executed (verbatim from the item): scan for out-of-bounds writes —
`git -C /home/vgpnk/Projects/shokunin status --porcelain` (report anything naming tabi/round-43, do
NOT touch other lanes' files); `find /home/vgpnk/Projects/shokunin -maxdepth 1 -newer
.../round-43/claims.json -type f` (report only); `df -h /fast /tmp`;
`du -sh /fast/scratch/hyaku/tabi-r43`. Receipt; **finding only for tabi-owned misroots**.

All commands below are read-only observations of the four mandated checks plus the lane-tree
reconciliation needed to decide whether a tabi-owned misroot exists. No commit, no push, no git/jj
mutation anywhere: this seat created no ref, no object, no index entry and no jj operation in any
repository (proof in receipt 8 and receipt 5).

## Verdict in one line

**No tabi-owned misroot found.** Every write made by round-43 tabi seats in the wave window landed
inside a seat directory (`w1/<Seat>/…`) or a seat report (`w1/<Seat>.md`), or in the lane's own
`corpus/` (L1-owned, L1-authored). The only writes observed in *foreign* trees during the window
belong to other lanes (kaidoku's `tools/round-50-c3/`, kasegi's `corpus/lessons/round-46` row in
the fleet root `.ufo/l0-questions.md`) — reported here for the L1's awareness, **not touched, not
attributed to tabi**.

## 1. Mandated check A — fleet repo status

```
$ git -C /home/vgpnk/Projects/shokunin status --porcelain
 M .scratch/goal-20261029-hyaku-run12.md
 M .ufo/l0-questions.md
```

Full receipt: `evidence/fleet-status.txt`.

**Names no tabi / round-43 path.** Both modified files are fleet-root owned by other actors:

| Path | Owner | Evidence |
|---|---|---|
| `.scratch/goal-20261029-hyaku-run12.md` | hyaku run-12 orchestrator | mtime 2026-10-29 17:13:19, i.e. **before** the wave dispatch (17:52:19) and before the tabi freeze commit `7ca6f018` (17:43:39) — a pre-wave fleet goal-file edit, not a round-43 write. |
| `.ufo/l0-questions.md` | kasegi (round-46) | mtime 2026-10-29 17:52:30; the single appended line is `kasegi \| round-46 \| …`. Not tabi text, not round-43. |

A third fleet-root item appeared **transiently** during the window and is now gone:
`/home/vgpnk/Projects/shokunin/tools/round-50-c3/sqfs-triage-v5.py` (created 17:51:00, deleted by
17:53:28). The live copy of that instrument now lives at
`kaidoku-shokunin/tools/round-50-c3/sqfs-triage-v5.py` (mtime 18:28, 107,916 B) — i.e. a **kaidoku**
seat wrote into the fleet root and later moved the file into its own lane. Empty directory
`/home/vgpnk/Projects/shokunin/tools/` remains (0 entries, mtime 17:53:28). Report-only per the
item: **not touched, not tabi-owned.** The repeated pattern (a seat's tool landing in the fleet root
instead of its lane repo) is the same shape as the round-39 shokuknow incident the round brief names,
and it is worth the L1's attention for the fleet-root `tools/` residue — but it is kaidoku's lane,
not tabi's.

Also observed in the fleet root but **outside** the status output (gitignored or already-tracked and
unmodified): `.ufo/prompts/tabi-round-43.md` (56,328 B, 17:09:53 — the dispatch prompt itself,
written before the wave; read-only use confirmed), `.ufo/state/disk-guard.log` (driver-owned,
17:50:06), `.ufo/state/inline-dispatcher.log` (driver-owned, 17:52:19).

## 2. Mandated check B — fleet-root files newer than the freeze

```
$ find /home/vgpnk/Projects/shokunin -maxdepth 1 -newer \
      /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json -type f
(no output)
```

Exit 0, empty output: **no top-level fleet file is newer than the round-43 freeze.** Full receipt:
`evidence/find-df-du.txt`.

Caveat worth recording: `-maxdepth 1` only inspects the fleet root's own entries, so it cannot see
the two modified files above (they live at depth 2, under `.scratch/` and `.ufo/`). Check A covers
those. Both checks are consistent: **no tabi-written path in the fleet root.**

## 3. Mandated checks C and D — disk and scratch

```
$ df -h /fast /tmp
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme1n1p2  804G  318G  486G  40% /fast
/dev/nvme1n1p1  128G   29G  100G  23% /tmp

$ du -sh /fast/scratch/hyaku/tabi-r43
2.8G    /fast/scratch/hyaku/tabi-r43
```

Receipts: `evidence/find-df-du.txt`, `evidence/scratch-disk.txt`. **No disk pressure:** `/fast` at
40 %, `/tmp` at 23 %, 486 G free on the scratch filesystem. `/tmp` itself holds 103 G of unrelated
content (large model binaries and other lanes' artifacts, e.g. `/tmp/.mount_KimiCogEAx7f/kimi-code`
at 219 MB, `/tmp/tmp1smw8ws_/s.wav` at 78 MB) — none of it tabi's, and `TMPDIR`/`TMP`/`TEMP` are all
unset in this environment, so nothing this seat ran depended on an inherited temp dir.

Scratch census of the wave root (`evidence/scratch-disk.txt`): 51 per-seat directories plus the
L1's own `L1*` directories, **zero files at the wave-scratch root level** (correct: each seat owns a
subdirectory), no directory named after another seat's work, and no cross-lane contamination —
`/fast/scratch/hyaku/{kaidoku-r50,kasegi-r46,souji-r42}` contain only their own lanes' files. The
scratch total fluctuated between 603 M and 2.8 G across the window as seats cleaned up
(`ExecSelfassess` peaked at 1.3 G, `RevC2Checker` at 308 M); the largest consumers are wave seats'
own scratch, which the wave brief designates as reaper-eligible. This seat's own scratch was
274 M (a local clone made for the clone-semantics probe) and is deleted before this report is filed.

## 4. Tabi-owned misroot assessment (the finding the item asks for)

The tabi lane tree is `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Every path written in it during
the wave window (dispatch 17:52:19 → capture) was classified mechanically — receipt
`evidence/lane-tree-writes.txt`:

```
853  files inside a seat dir        (.ufo/waves/round-43/w1/<Seat>/…)
 56  seat reports                   (.ufo/waves/round-43/w1/<Seat>.md)
  1  corpus/lessons/round-43.md          <- L1-owned
  1  .ufo/waves/round-43/w1.ready.dispatched   <- dispatcher-owned
  4  .ufo/waves/round-43/measure/failed-run-1/*  <- L1-owned (copy of the run-1 archive)
  4  .ufo/waves/round-28/scratch/Exec12/dnclone/.git/objects/pack/*.pack  <- see §5
```

* Every **seat** write is inside `w1/<Seat>/` or is that seat's own `w1/<Seat>.md` report path. No
  seat wrote to `corpus/`, to the lane root, to the fleet root, to a sibling `*-shokunin` repo, or to
  `/home/vgpnk/Projects/shokuknow`. Cross-check: `find /home/vgpnk/Projects/shokunin
  /home/vgpnk/Projects/shokuknow -iname '*tabi*' -o -iname '*round-43*' -o -iname '*round43*'`
  newer than 17:41, excluding the tabi repo, returns **empty**; `shokuknow`'s newest file is from
  2026-10-27 (the round-39 residue), so **the round-39 shokuknow incident has not recurred**.
* `corpus/lessons/round-43.md` (L1), `corpus/knowledge/receipt-authenticity-signing-round-43.md` and
  the `corpus/README.md` row (L1) and `.ufo/waves/round-43/measure/failed-run-1/` (L1) are the lane
  owner's own integration writes — confirmed against the L1 transcript
  (`history://TabiR43`: `write(corpus/knowledge/receipt-authenticity-signing-round-43.md)`,
  `edit(corpus/README.md)`, `write(corpus/lessons/round-43.md)`, `mkdir -p …/measure/failed-run-1 &&
  cp …`). The scribe seat `ScribeLessonSkel` independently recorded in its report that the lesson file
  "appeared in the working tree during this wave … written by the L1 seat, not by this one".
* **No git mutation by any seat**: lane `HEAD` is `ba433c94` ("C1 receipt+witness committed as
  explicit files"), committed **17:51:11**, i.e. *before* the wave dispatched at 17:52:19; the reflog
  contains only `export from jj` entries (17:43:39 / 17:49:41 / 17:51:11). `git count-objects -v`
  shows 89 loose objects and 5 packs — the loose objects are the L1's jj snapshot residue at
  17:53:44, not seat output. `git status --porcelain` in the lane tree lists only the L1-owned items
  above plus the untracked `w1/` tree.
* **No jj mutation by any seat**: `jj op log` shows the newest operation is
  `snapshot working copy | 2026-10-29 17:53:44.648` (L1's), and `find .jj -type f -newermt 17:55`
  is empty — this seat's own `jj log`/`jj status`/`jj op log` calls (read-only) created **no** jj
  operation, no working-copy rewrite and no git object.

## 5. Two anomalies found in the tabi tree — reported, not repaired

### 5a. The lane object store's packs were rewritten in place at 17:53:43 (integrity intact)

Receipt: `evidence/pack-rewrite-and-stale-clone.txt`.

All five pack files under `tabi-shokunin/.git/objects/pack/` carry `mtime == ctime ==
2026-10-29 17:53:43` with **unchanged inode and unchanged size**, and four of them are
`nlink=2` — the *same inodes* as the pack files of a stale round-28 clone that still sits inside the
production tree at `.ufo/waves/round-28/scratch/Exec12/dnclone/` (136 M, gitignored by
`.gitignore:5 .ufo/waves/*/scratch/`, so invisible to `git status`). The rewrite therefore landed
on the shared inodes, and shows up in the wave-tree scan as four "writes" under
`round-28/scratch/…/dnclone/.git/objects/pack/` — an apparent wave write that is really a
side effect on the stale clone.

Reproduced mechanism, verified by controlled probe in scratch (all read-only w.r.t. the lane):

| Probe | Effect on source repo packs |
|---|---|
| `git clone --shared <repo>` | none (no nlink, no mtime change) |
| `git clone <repo>` (local, hardlink) | **nlink 1→2**, mtime unchanged, ctime updated |
| `git gc --prune=now` inside the clone | source pack inode unchanged, mtime unchanged, nlink back to 1 |
| `git gc --auto` in the source | no change |
| `git status` / `git log` / `git fsck` / `git verify-pack` / `git count-objects` / `git rev-list` / `git cat-file --batch-all-objects` | no change (mtime **and** ctime stable) |
| `jj new` + `jj describe` + `jj git export` in a colocated repo | no change |

So the 17:53:43 mtime/ctime bump on all five packs is **not** attributable to any read-only git or jj
command, and not to a local clone (which only bumps ctime and nlink). It is consistent with a
**write to the pack payloads themselves** — e.g. an in-place `git repack`/`git index-pack` style
rewrite — at the same second the L1's `jj` snapshot wrote 89 loose objects (17:53:43–44) and the
working-copy tree state (17:53:44.682). Whatever wrote them, the **bytes are sound**: `git
verify-pack -s` returns OK for all five `.idx`, `git fsck --connectivity-only` exits 0, full
`git fsck` exits 0 with only pre-existing dangling trees, the pinned C2 measure blob
`8ff64d691f5c09569a50f2a5a038bb23774c3d35` still resolves at the freeze rev, the r41 receipt blob
still hashes to `4166e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1` (the digest the
frozen measure record pins), and the frozen `claims.json` at `7ca6f018` is byte-identical to the
worktree copy (`sha256 290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029` both).
Receipt: `evidence/frozen-bytes-integrity.txt`. **No frozen byte drifted; no claim-verdict impact.**

The stale round-28 clone is nonetheless a standing hazard for the wave-close commit: its pack
inodes are shared with the live lane store, so any `git gc`/`repack` in either repository rewrites the
other's objects in place. The clone resolves `HEAD eb23c0b` and its own `fsck --connectivity-only`
exits 0, so it is not currently broken — but it is 136 M of gitignored residue inside the production
tree that the L1 should delete before the wave-close commit rather than leave sharing inodes with
the live object store. **This seat did not touch it** (it is in the lane's own production tree and
outside this seat's write scope).

### 5b. Two embedded git repositories inside the wave tree will be committed as gitlinks

Receipt: `evidence/lane-tree-writes.txt` plus the dry-run below.

```
$ find .ufo/waves/round-43 -name .git -type d
.ufo/waves/round-43/w1/CritC2Blob/commit-gitlink-fixture-repo/.git
.ufo/waves/round-43/w1/CritC2Blob/annotated-tag-entry-fixture-repo/.git

$ git add -n --dry-run .ufo/waves/round-43/w1
warning: adding embedded git repository: .ufo/waves/round-43/w1/CritC2Blob/commit-gitlink-fixture-repo
warning: adding embedded git repository: .ufo/waves/round-43/w1/CritC2Blob/annotated-tag-entry-fixture-repo
```

(`git add -n` is a dry run; the index was not written.) A wholesale `git add` of the wave tree would
record both fixture repos as **gitlink entries (mode 160000)** — a pointer to a commit the clone
cannot obtain — which is the same class of defect as the r41 D1 trap the lane's own freeze commit
message records. The wave-close committer should add these two paths' *contents* explicitly or
exclude the fixture repos' `.git` directories. Reported for the L1; **not touched by this seat**,
since those paths belong to `CritC2Blob`.

## 6. Evidence index (all inside this seat's directory)

| File | Content |
|---|---|
| `evidence/fleet-status.txt` | mandated check A verbatim, plus the tabi/round-43 grep |
| `evidence/find-df-du.txt` | mandated check B verbatim, plus `df -h /fast /tmp` and the wave `du` |
| `evidence/scratch-disk.txt` | scratch census: wave total, per-lane scratch totals, per-seat top-12, `df`, `/tmp` total, timestamped |
| `evidence/lane-tree-writes.txt` | every path written in the tabi lane tree during the wave window, classified; lane `git status`; `git log`/`git reflog` (no seat commit) |
| `evidence/frozen-bytes-integrity.txt` | independent re-derivation of the frozen pins: measure blob id, r41 receipt sha256, claims.json sha256 at freeze vs worktree, `verify-pack` on all 5 packs, `fsck --connectivity-only`, `count-objects -v` |
| `evidence/pack-rewrite-and-stale-clone.txt` | the 17:53:43 pack mtime/ctime/inode table for both the lane store and the hardlinked round-28 clone, `check-ignore`, `du`, stale-clone HEAD + fsck |
| `evidence/tooling-and-footprint.txt` | tool versions used, proof no tool/package was installed, this seat's own write footprint |

## 7. Limitations

* The mandated `find -maxdepth 1` cannot see depth-2 fleet-root writes; check A is what covers
  `.scratch/` and `.ufo/`. The two modified fleet-root files were attributed by content
  (a `kasegi | round-46` row; a hyaku run-12 goal edit) and by mtime relative to the wave window.
* The exact writer of the 17:53:43 pack rewrite is **not established**: every read-only git and jj
  command I could construct leaves the pack mtimes and ctimes untouched (table in §5a), and the
  rewrite's one-second coincidence with the L1's jj snapshot is circumstantial. I report the
  observable (mtime == ctime bump on shared inodes, bytes intact) and decline to name a cause.
* Whether the stale round-28 clone should be deleted, and how the two embedded fixture repos should be
  committed, are closure decisions for the L1 — this seat is a leaf and left both untouched.
* `du`/`df` numbers are point-in-time (18:22–18:37); the wave scratch total moved from 603 M to
  2.8 G to 603 M as seats deleted their scratch. Numbers are reproduced with their capture
  timestamps.
* This seat made **no** claim verdict and proposes **no** amendment to the frozen claims, counters,
  controls or instruments — nothing in this scan bears on C1's kill rule or C2's calibration.

## 8. Footprint of this seat

* Wrote only inside `.ufo/waves/round-43/w1/ExecScratchGuard/` (this report + `evidence/`) and
  `/fast/scratch/hyaku/tabi-r43/ExecScratchGuard/` (deleted before filing).
* No write to the fleet root, to any sibling `*-shokunin` repo, to `shokuknow`, to the lane tree
  outside this seat dir, to `~/.local/bin`, or to any PATH directory. No commit, no push, no fetch, no
  git/jj mutation, no ref, no index entry, no object created in any repository.
* No tool or package was installed (no pacman transaction — the host guard pauses those; no
  `uv tool install`; nothing added to `~/.local/bin`). Tools used, all pre-existing, read-only:
  `git 2.56.0`, `node v24.21.0`, `python3 3.14.8`, coreutils `find`/`stat`/`du`/`df`/`grep`/`sed`.
* Scratch root deleted: `/fast/scratch/hyaku/tabi-r43/ExecScratchGuard` (trap-equivalent
  `rm -rf` on the seat's own subdirectory only).

VERDICT ok no tabi-owned misroot: every round-43 tabi seat wrote only inside its own `w1/<Seat>/` directory or its own `w1/<Seat>.md` report; the lane store shows no seat-made commit, ref, object or jj operation; the fleet root shows no tabi/round-43 path (the two modified files belong to hyaku run-12 and kasegi round-46); the fleet-root `tools/` residue and the kasegi `.ufo/l0-questions.md` row are other lanes' and were left untouched; two closure hazards are reported without repair — the 136 MB gitignored round-28 clone inside the production tree sharing pack inodes with the live object store (rewritten in place at 17:53:43 with all frozen bytes re-deriving identically) and the two embedded fixture repos under `w1/CritC2Blob/` that a wholesale `git add` would record as gitlinks.
