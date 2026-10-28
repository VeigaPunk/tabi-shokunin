# ExecScratchGuard — round-42 w1: scratch + bounds guard sweep

- Seat: `ExecScratchGuard` (executor, leaf). Axes: operability. Milestone: scratch and bounds guard.
- Mode: **read-only**. No file outside this seat dir was created, modified or deleted; no git/jj
  mutation; no fetches; no spawns; no installs.
- Repo under guard: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218`).
- Reference instants: claims.json mtime `2026-10-28 12:01:32.037050619 -0300`;
  `w1-dispatch.json` mtime `2026-10-28 12:20:16` (seat dispatch); sweep window
  `2026-10-28T12:37:56-03:00` → `12:42:00-03:00` (36→41 min after the freeze; **late** in the wave,
  so the "wait 8 minutes" instruction was already satisfied — no wait performed, sweep ran immediately
  and was re-snapshotted 5×).

The production tree, fleet repo, sibling repos and `shokuknow` were read-only for this seat.

---

## 1. Scratch inventory (`/fast/scratch/hyaku/tabi-r42/`)

Command:

```
ls -la /fast/scratch/hyaku/tabi-r42/
du -sh /fast/scratch/hyaku/tabi-r42/*/
du -sb /fast/scratch/hyaku/tabi-r42
```

Observed churn (five snapshots, same shell locale `LC_ALL=C`):

| instant | top-level scratch dirs | bytes |
|---|---|---|
| 12:37:57 | 46 | ~12M (`du -sh`, one unreadable subtree) |
| 12:38:30 | 51 | — |
| 12:39:16 | 57 | 46,983,936 |
| 12:41:03 | 38 | 35,637,534 |
| 12:42:00 | 31 | 251,551,587 |

- **Mid-wave presence is legal** and was observed exactly as such: seats create their dir and delete it
  on exit. Concrete proof of correct cleanup in-flight: `QuarR4214` was present at 12:38:08
  (`ls -la` showed 6 entries) and **gone** by 12:39 (`ls: cannot access
  '/fast/scratch/hyaku/tabi-r42/QuarR4214': No such file or directory`), while its report dir
  already held its evidence. No residue, no stale round-41 scratch: `/fast/scratch/hyaku/tabi-r42/`
  contains only this wave's seat names plus `L1-measure`.
- Final namespace check: every top-level scratch dir is either a seat name from `w1-spec.json` or
  `L1-measure` (L1's own working dir). `comm -13` of scratch names against spec names returned only
  `L1-measure`. **No stray, no misnamed, no foreign-lane scratch.**
- Growth is real and worth watching, not a problem: at 12:42 one seat (`ScriC2Entry`) held 247M of the
  251M total — a full `baseline/` repo copy (15,701 files, largest single file 4,235,856 B
  `.ufo/waves/round-32/w1/ScribeSrcBidiSpec/webdriver-bidi-20261008.html`). No file >20M existed in
  the whole scratch tree; total is 251 MB against 603 GB free.
- Transient permission oddity (testcraft, not a fault): `ExecC1ColdRunbook/locked` was mode
  `d---------` (`0000`) at 12:38:08, which made my first `du -sh` under-report (12M is a **lower
  bound**, not the true size). By 12:39 it was `drwx------` (700) — the seat was actively probing
  permission-denied behaviour (`case1..case4b.*`). Empty 0000/700 dirs are removable by their owner,
  so this is **not** a cleanup blocker. Fixture dirs with random suffixes (`mktemp -d`, mode 700) are
  likewise normal.

## 2. Disk headroom

```
df -h /fast/scratch /tmp
```

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme1n1p2  804G  200G  604G  25% /fast
/dev/nvme1n1p1  128G   15G  113G  12% /tmp
```

Inodes: 1% (`/fast`), 5% (`/tmp`). **Well under the 90% red line** — no finding to raise. `/tmp`
held no `tabi`/`r42`/`round-42`-named artifacts newer than dispatch (checked with
`find /tmp -maxdepth 2 \( -iname '*tabi*' -o -iname '*r42*' -o -iname '*round-42*' \) -newer …`):
seats are correctly not using `/tmp`.

## 3. Out-of-bounds write detection (the core check)

Command (as specified, from the repo root):

```
find . -newer .ufo/waves/round-42/claims.json -type f \
  -not -path '*/.ufo/waves/round-42/w1/*' -not -path '*/.jj/*' \
  -not -path '*/corpus/evidence/round42/*' | wc -l
```

→ **178 hits**, of which **172 are `.git/` internals** (objects/refs/`refs/jj/keep/*` — the
mechanical by-product of L1 landing). Filtering `.git` isolates 30 real paths; all 30 are on the
allowed set:

| group | files | mtimes |
|---|---|---|
| `LOG.md`, `SCORECARD.md` | 2 | 12:23:21, 12:26:20 |
| `corpus/SOURCES.md`, `corpus/README.md` | 2 | 12:04:53, 12:06:47 |
| `corpus/knowledge/` | 2 | 12:05:14, 12:06:03 |
| `.ufo/waves/round-42/{counters,controls,measure}` (wave harness) | 18 | 12:02:52 – 12:09:59 |
| `.ufo/waves/round-42/{w1-spec.json,gen-w1-spec.py,w1-run-*,w1-dispatch.json,w1.ready,parse-w1-results.mjs,w1.ready.dispatched,quarantine/build-quarantine-tsv.mjs}` (L1 dispatch tooling) | 7 | 12:19:34 – 12:37:56 |
| `.ufo/waves/round-41/controls/c1-baseline-noop.out` | 1 | **12:06:47** |

`corpus/lessons/` had **zero** writes (an allowed path that went unused).

**Cross-round write explained and cleared.** `.ufo/waves/round-41/controls/c1-baseline-noop.out` is
the one hit outside round-42, so I checked attribution rather than assuming: it predates dispatch
(12:06:47 < 12:20:16, i.e. no seat existed yet) and the file **self-documents** the reason —
`# tabi round 42: populated per round-41 verifier routed defect D3 (was committed empty). …
git -C … ls-tree -r --name-only fecbdf0a… -- corpus/evidence/round41 | wc -l` → content `0`, exit `0`.
That is L1's declared D3 repair landing, not a seat reaching into a prior round.

**Post-dispatch re-check (the sharper test).** Re-running the same find against
`w1-dispatch.json` (12:20:16) so that only *post-dispatch* activity is visible outside `w1/`:

```
find . -newer .ufo/waves/round-42/w1-dispatch.json -type f \
  -not -path '*/.ufo/waves/round-42/w1/*' -not -path '*/.jj/*' -not -path '*/.git/*'
```

→ exactly **6** hits, all L1, all wave plumbing/landing:

```
12:25:55  2559 ./.ufo/waves/round-42/quarantine/build-quarantine-tsv.mjs
12:20:16   148 ./.ufo/waves/round-42/w1.ready                    (same-second as reference)
12:28:07  1595 ./.ufo/waves/round-42/parse-w1-results.mjs
12:37:56    19 ./.ufo/waves/round-42/w1.ready.dispatched         (dispatch marker)
12:23:21 231169 ./LOG.md
12:26:20 201121 ./SCORECARD.md
```

**Zero seat-originated writes outside `w1/<seat>/`.** No writes to `scripts/`, no writes to
`corpus/evidence/`, no writes to any round-4x control/counter, no writes to sibling repos.
L1's landings are also committed rather than left dirty: `git status --porcelain | grep -v '^??'`
→ *no tracked modifications*; `LOG.md`/`SCORECARD.md` are blobs at HEAD and
`git diff --stat HEAD -- LOG.md SCORECARD.md corpus/README.md corpus/SOURCES.md` is empty.

**For the record — the round-39 incident class did not recur.** Four symlinks pointing into the live
production tree exist in scratch, and I verified none was used to write:

```
/fast/scratch/hyaku/tabi-r42/ScriSOURCES/root/tabi-shokunin/corpus/knowledge -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge
/fast/scratch/hyaku/tabi-r42/ScriSOURCES/root/tabi-shokunin/corpus/lessons   -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons
/fast/scratch/hyaku/tabi-r42/ScriSOURCES/root/tabi-shokunin/.ufo             -> /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo
/fast/scratch/hyaku/tabi-r42/SentC2Checker/symlink-to-lane                   -> /home/vgpnk/Projects/shokunin/tabi-shokunin
```

Both are deliberate fixtures, not accidents: `ScriSOURCES` is the scribe's *registry census check*
(it also **copied** `SOURCES.md`, 145,810 B at 12:39:08, rather than symlinking it) and
`SentC2Checker` is the sentinel's *adversarial CLI probes* seat — its own artefacts are
`mtimes.before`/`mtimes.after`, `status.before`/`status.after`, `pwned-canary`, `trace.log`,
`strace-run.out`. Evidence that no write reached production through them:

- `mtimes.before` vs `mtimes.after`: **IDENTICAL** (`.git/index 1938440 B @12:37:05`,
  `.git/refs/heads/master 41 B @12:26:20` — byte-for-byte same stat lines).
- Sentinel canary `pwned-canary` (content `still here`) exists only in scratch;
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/pwned-canary` → **No such file or directory**.
- `find corpus/knowledge .ufo -newermt '2026-10-28 12:39:00' -type f` (i.e. since the symlinks were
  created at 12:39) returns **only** `.ufo/waves/round-42/w1/<seat>/…` seat evidence files — no
  `corpus/knowledge/`, no `corpus/lessons/`, no counter/control writes.

Residual risk to note (not a violation): the symlinks *are* a live write-through surface for the rest
of the wave; a future write through
`ScriSOURCES/root/tabi-shokunin/.ufo/...` would land in production and would **not** be distinguishable
from L1 tooling by path. They were still present at 12:42 with `ScriSOURCES` apparently still active
(12:40:17 writes).

## 4. Fleet-root misroot check

```
git -C /home/vgpnk/Projects/shokunin status --porcelain
```

```
 M .ufo/l0-questions.md
?? .scratch/closure-mado-r50.json
?? .scratch/closure-r54/
?? .scratch/source-routing-queue.md
?? o.bin
?? oldrep1.out
?? oldrep2.out
```

**No file at the fleet root names `tabi` or `round-42` → no misroot candidate.** (Automated
`git ls-files -o --exclude-standard`-style filter plus a literal name grep both came back empty.)

Reported for awareness only, all untouched — attributions are outside a leaf seat's scope:
`.ufo/l0-questions.md` (tracked, modified 12:20:27), `.scratch/closure-r54/` (dir tree written
12:28–12:32), `.scratch/closure-mado-r50.json` (2026-10-27 06:38), `o.bin` (2026-10-27 16:58),
`oldrep1.out`/`oldrep2.out` (2026-10-28 09:10/09:11, i.e. **pre-freeze**). The two `.scratch/`
items and `l0-questions.md` moved *during* round-42 but carry no tabi/round-42 naming; most plausibly
L0/other-lane bookkeeping. Flagging, not asserting.

## 5. Roster and naming integrity (operability cross-check)

```
python3 - <<'PY'  # spec vs registry
… print('members:',len(m)); print('spec-not-in-registry:', …); print('registry-not-in-spec:', …)
PY
```

- `w1-spec.json` items: **64**. Roles: scout 20, executor 9, mutation-tester 9, reviewer 8, critic 6,
  scribe 5, connector 4, revenger 1, sentinel 1, simplifier 1.
- `w1/swarm-registry.json` members: **64**, `spec-not-in-registry: []`,
  `registry-not-in-spec: []`, all `kind: "spawn"`. **No naming drift in either direction.**
- w1 report dirs: 38 (12:38) → 51 (12:39) → **55** (12:41:03); `report.md` present in 16 → **24**.
  55/64 dirs and 24 reports at T+40min is normal mid-wave liveness, not a dead-seat signal.
- `comm` diffs: **`w1` dir not in spec → empty**; **scratch dir not in spec → `L1-measure` only**.
  `w1/swarm-registry.json` is mode `600` and the only non-644 file family in `w1/` besides seat
  scripts (mode 755: `*.mjs`, `*.py`, `isolation.sh`) — expected, no setuid/setgid anywhere
  (`find … -perm /6000` → empty), **no symlinks in any `w1/` seat dir** (all seats write plain
  files; none stages a link into a sibling's dir or into production).

## 6. Limitations / what this sweep does not prove

- **Read-only snapshot, five instants.** Bounds verdict is provisional for the remainder of the wave;
  seats were still writing at 12:42 (55 dirs, 24 reports, `ScriC2Output`-style work continuing).
- Writes cannot be **attributed per seat** by filesystem metadata: every process runs as uid 1000,
  so "which seat wrote X" rests on path+mtime correlation (which was decisive for the round-41 hit).
- `.git/` internals (172 hits) were deliberately excluded from the violation judgement — the task
  excludes `.git` and `.jj`; commits by L1 are the landing mechanism, and I verified tracked files
  are clean rather than auditing object graph.
- `corpus/evidence/round42/` was excluded per the specified predicate, so **not** audited here.
  It is untracked (`?? corpus/evidence/round42/`) and is an allowed wave-evidence path.
- Early `du` totals were lower bounds while `ExecC1ColdRunbook/locked` was mode 0000; the 251 MB
  figure at 12:42 is complete and error-free.
- One observation with real consequences for another seat's proof, reported not fixed:
  `SentC2Checker`'s `status.before`/`status.after` differ by one line —
  `4a5 > ?? .ufo/waves/round-42/w1/ExecCensus/` — i.e. a **sibling seat's** new report dir, not a
  write by the probe. A repo-wide `git status` predicate is therefore not a clean no-write proof
  while 63 peers run concurrently; that seat's scoped `mtimes.before/after` probe *was* clean and is
  the load-bearing evidence. Worth scoping the status predicate to the probed paths on re-run.

## 7. Tooling

No tool was installed or upgraded (pacman is host-paused; no `uv`/binary install was needed).
No scratch payload of mine was left behind: `/fast/scratch/hyaku/tabi-r42/ExecScratchGuard` was
created empty for contract compliance and removed before yield.

VERDICT ok — zero seat-originated out-of-bounds writes (post-dispatch: 6 hits outside w1/, all L1 harness/landing; the single cross-round round-41 write is pre-dispatch L1's self-documented D3 repair), /fast at 25% and /tmp at 12% (far below the 90% line), 64/64 spec-registry-seat naming integrity, all scratch dirs are this wave's seats (plus L1-measure) with in-flight cleanup proven (QuarR4214 present 12:38, gone 12:39), no tabi/round-42 file at the fleet root; residual risks are the four deliberate production symlinks in scratch (verified unexercised) and a sibling-dir false positive in SentC2Checker's repo-wide status probe.
