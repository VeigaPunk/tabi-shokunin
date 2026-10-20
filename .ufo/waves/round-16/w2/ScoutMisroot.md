# ScoutMisroot — fleet-root misroot sweep (read-only)

- Seat: `TabiR16.ScoutMisroot` (leaf). Wave: tabi round 16, wave 2 (FALSIFY).
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (nested git root, confirmed by `git -C tabi-shokunin rev-parse --show-toplevel`).
- Fleet root swept: `/home/vgpnk/Projects/shokunin` (all commands run with cwd = fleet root).
- Access date: 2026-10-20. Nothing moved, created or deleted at the fleet root; the only write is this Report.
- Instrument: `git status` + literal `grep` over file contents and paths. This item is a path/content question, so literal grep is the correct instrument, not a substitute for semantic proof; no LSP server applies to a whole-tree content sweep.

## Attack item M1

Predicate under test:

> **P:** at least one *untracked* fleet-root file has content that names tabi round 16 or a `TabiR16` seat (i.e. a lane artifact was misrooted out of the lane and left untracked at the fleet root).

## Verdict: **BREAKS** (P not supported) — and the cleanliness invariant **HOLDS**

- `P` is falsified: 0 of 10 untracked (`??`) fleet-root files name tabi round 16 or `TabiR16`; 0 of 174 ignored (`!!`) regular files do either (2 contain the string `round-16`, but as an unrelated audio-corpus directory, see below); 0 tracked files at `HEAD` contain `TabiR16` at all.
- Cleanliness invariant holds in the positive direction too: every tabi round-16 artifact I probed lives under the lane root, and no file shaped like `scripts/*webmcp*`, `scripts/*binding*`, `corpus/`, `drafts/`, or `probes/` for this round exists at the fleet root.

`UNPROVEN` is not used: the negative result is direct observation, not an inference from absence of tooling.

## Commands and observed outputs

### 1. Untracked set (the assignment's first command)

```
$ git -C /home/vgpnk/Projects/shokunin status --porcelain
 M .ufo/watchdog.log
?? .ufo/state/kaidoku.report-baseline
?? .ufo/state/kake.report-baseline
?? .ufo/state/kama.report-baseline
?? .ufo/state/mado.report-baseline
?? .ufo/state/mori.report-baseline
?? .ufo/state/souji.report-baseline
?? .ufo/state/tabi.report-baseline
?? .ufo/state/tameshi.report-baseline
?? .ufo/state/tsukuroi.report-baseline
?? scripts/hyaku/jj-lane.sh.new
```

That is exactly 10 `??` entries and 1 ` M`. No `.ufo/waves/round-16/w1/`, `w2/`, `drafts/`, `probes/`, `corpus/`, or `scripts/*webmcp*|*binding*` path appears.

### 2. Untracked files: sha256, size, mtime, marker scan

```
$ sha256sum <each ?? file>   # content scan: grep -E 'TabiR16|round-16|round 16|b444ca8e…|webmcp-cdp-observation|measurement-binding'
```

| path (fleet-root relative) | sha256 | bytes | mtime (-0300) | names tabi round 16 / TabiR16? |
|---|---|---|---|---|
| `.ufo/state/kaidoku.report-baseline` | `6f71be54bb490ab1899d969745fa567ee568e9b67956648e7c8d9bc752fc009b` | 68 | 2026-10-20 10:14:09 | no |
| `.ufo/state/kake.report-baseline` | `c20bb00a372c10e6504210f41ebea0bae14c5d281926a2439a99f71d37cdd48e` | 68 | 2026-10-20 05:51:50 | no |
| `.ufo/state/kama.report-baseline` | `6f71be54bb490ab1899d969745fa567ee568e9b67956648e7c8d9bc752fc009b` | 68 | 2026-10-20 11:52:24 | no |
| `.ufo/state/mado.report-baseline` | `6f71be54bb490ab1899d969745fa567ee568e9b67956648e7c8d9bc752fc009b` | 68 | 2026-10-20 10:51:17 | no |
| `.ufo/state/mori.report-baseline` | `096c86cb77732f5fd6c969cbcb67addc696702bf72fd0b12a82170c84be9c23a` | 68 | 2026-10-20 05:44:36 | no |
| `.ufo/state/souji.report-baseline` | `096c86cb77732f5fd6c969cbcb67addc696702bf72fd0b12a82170c84be9c23a` | 68 | 2026-10-20 10:51:16 | no |
| `.ufo/state/tabi.report-baseline` | `096c86cb77732f5fd6c969cbcb67addc696702bf72fd0b12a82170c84be9c23a` | 68 | 2026-10-20 10:51:14 | no |
| `.ufo/state/tameshi.report-baseline` | `096c86cb77732f5fd6c969cbcb67addc696702bf72fd0b12a82170c84be9c23a` | 68 | 2026-10-20 10:14:08 | no |
| `.ufo/state/tsukuroi.report-baseline` | `096c86cb77732f5fd6c969cbcb67addc696702bf72fd0b12a82170c84be9c23a` | 68 | 2026-10-20 05:43:24 | no |
| `scripts/hyaku/jj-lane.sh.new` | `9573ac6dc8f3e711ad035a5f5c5421a8b45ea21c5172fb21470f2e4b70520863` | 29726 | 2026-10-20 11:56:20 | no |

Bodies (read to classify, not to certify):
- Each `.ufo/state/*.report-baseline` is a two-token machine baseline, `<line-count> <sha256-of-empty>`; e.g. `.ufo/state/tabi.report-baseline` = `16 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Lane name appears; round identity does not.
- `scripts/hyaku/jj-lane.sh.new` is a 29,726-byte draft of the jj lane-VCS helper (`# jj-lane.sh — lane-repo VCS writes through Jujutsu …`). `grep -nE 'TabiR16|round-16|tabi'` returns only line 264, the word "immutability" (`...the c`**`tabi`**`lity...` as a substring hit) — no seat/round reference.

### 3. Ignored-but-untracked set (completeness beyond `??`)

```
$ git status --porcelain --ignored -uall | wc -l
208
```

208 entries = 1 ` M` + 10 `??` + 197 `!!`; the `!!` entries are 174 regular files and 23 directory entries (21 lanes' nested repo roots + `.tower/jj-probe/{chousa,kotoba}-shokunin/`). Every `!!` entry that is a regular file was scanned for the same markers. Exactly two hit, both incidental and both pre-dating this wave:

| path | sha256 | mtime | matching line |
|---|---|---|---|
| `.ufo/waves/shokunin-train-20261013-w5/xsentinel-scratch/new-w5-files.txt` | `5e9f4efb0209505363edc1ecdf6870a3b211f0736d67d3fd958030a3f1bcedeb` | 2026-10-13 23:32:38 | `103:/home/vgpnk/Projects/shokunin/audio-shokunin/corpus/live/r66-baseline/frozen/corpus/live/round-16/reverse180_probe.wav` |
| `.ufo/waves/shokunin-train-20261101-w10/xsentinel-scratch/audio-5415115-swept-files.txt` | `3261daffe67f00e46f890cb11811ef379bf63a5622fcd87b48f11b330d99c338` | 2026-10-14 11:23:36 | `169:corpus/live/r70-baseline/measure-env/corpus/live/round-16/reverse180_candidate.wav` (also 170, 171) |

Both name a *round-16 directory inside the audio lane's frozen corpus*, not tabi round 16 and not a `TabiR16` seat; both are week-old sweep listings, not round-16 artifacts of this wave.

Nested lane checkouts appear in this list only as ignored repo roots (`!! tabi-shokunin/`, `!! .tower/jj-probe/kotoba-shokunin/`, `!! .tower/jj-probe/chousa-shokunin/`, …); git does not descend into them, and their `round-16` files belong to those lanes, not to tabi.

### 4. Tracked context (fleet tree at HEAD)

```
$ git grep -l 'TabiR16' HEAD
(no output; exit 1)
$ git grep -l 'round-16' HEAD | wc -l
60
```

None of the 60 tracked `round-16` hits is a tabi round-16 floor artifact: they are the fleet **protocol** lane's round 16 (`.ufo/waves/round-16/{before.md,dispatch.md,clobber/,gate/}`, all `TRACKED` per `git ls-files`), sibling driver prompts, and `.ufo/prompts/tabi-round-16.md` — the fleet driver's prompt for this seat's L1, which is *by design* a fleet-root file (line 1: `You are the tabi L1, round 16. Working dir: /home/vgpnk/Projects/shokunin/tabi-shokunin.`). Its bytes equal `HEAD` (no ` M` in `git status`), mtime 2026-10-20 10:51:14, i.e. re-emitted byte-identically at dispatch. Not a misroot.

Classification of the fleet-root `.ufo/waves/round-16` tree:

```
$ for f in $(find .ufo/waves/round-16 -type f); do git ls-files --error-unmatch "$f" >/dev/null 2>&1 && echo TRACKED …; done
.ufo/waves/round-16/before.md -> TRACKED
.ufo/waves/round-16/clobber/classify.out -> TRACKED
.ufo/waves/round-16/clobber/classify.sh -> TRACKED
.ufo/waves/round-16/dispatch.md -> TRACKED
.ufo/waves/round-16/gate/mutate.sh -> TRACKED
.ufo/waves/round-16/gate/runs.md -> TRACKED
```

### 5. Positive control: the lane is where the round-16 material actually is

```
$ find tabi-shokunin/.ufo/waves/round-16 -maxdepth 2 -type d | sort
tabi-shokunin/.ufo/waves/round-16
tabi-shokunin/.ufo/waves/round-16/drafts
tabi-shokunin/.ufo/waves/round-16/probes
tabi-shokunin/.ufo/waves/round-16/w1
tabi-shokunin/.ufo/waves/round-16/w2
$ ls -la tabi-shokunin/scripts/{check-measurement-binding,selftest-measurement-binding,webmcp-loopback-round16}.mjs
-rwxr-xr-x … 36986 Oct 20 11:46 tabi-shokunin/scripts/check-measurement-binding.mjs
-rwxr-xr-x … 18794 Oct 20 11:49 tabi-shokunin/scripts/selftest-measurement-binding.mjs
-rwxr-xr-x … 63358 Oct 20 11:47 tabi-shokunin/scripts/webmcp-loopback-round16.mjs
```

So the C1/C2 harness and the wave directories are rooted in the lane, not at the fleet root. No `drafts/`, `probes/`, `corpus/` for this round exists at the fleet root (`find` outside nested repos returns only `./.ufo/round-44/drafts`, a tracked, unrelated fleet round-44 path).

## Non-tabi strays found (reported, not touched)

These are untracked-but-ignored fleet-root artifacts. Neither is tabi round 16; both are outside this item's predicate, reported because they are the only genuine misroot-shaped objects in the tree:

1. `bash: /` — a mirrored empty directory tree plus one regular file, created by a shell redirect failure (name contains the literal error text):
   - file: `bash: /home/vgpnk/Projects/shokunin/souji-shokunin/tests/tools/souji-verify.sh: No such file or directory`
   - sha256 `3a127f03b9afbfef76d8cfb4274e0cb16aa7d59b915ce19e70a236321e9b3c33`, 10139 bytes, mtime 2026-10-18 14:01:47; content is a **souji** seat result: `{"seat": "S54", "kind": "adversarial", "round": 4, "lane": "souji-shokunin", …}`.
2. `scripts/hyaku/jj-lane.sh.new` — see §2; a staging draft of `jj-lane.sh`, no round-16 content.

## Read-only proof

```
$ git status --porcelain --ignored -uall > /tmp/misroot_status_after.txt
$ diff /tmp/misroot_status.txt /tmp/misroot_status_after.txt && echo IDENTICAL
IDENTICAL: no fleet-root tree change during this sweep
```

(`/tmp/misroot_status.txt` was captured after the first read-only pass; the diff is empty, so this sweep mutated nothing at the fleet root. All mutation probes were none — this item needed none.)

## Limits

- Scope is the fleet git root. Contents of ignored nested repos (`tabi-shokunin/`, `.tower/jj-probe/*`, other `*-shokunin/`) were not scanned by fleet `git status` by construction; the lane-side existence check in §5 used plain `find`/`ls`.
- Two marker hits in the ignored set were classified by reading the matching lines only; I did not audit those week-old sweep files further.
- Tracked-state claims are at `HEAD` (`git grep … HEAD`) plus working-tree `git status`; no `git fsck` or reflog inspection was performed.
- No tools installed or upgraded; no pacman/uv invocation. This item required only git and coreutils.

## Verdict recap

| proposition | verdict | evidence |
|---|---|---|
| P: an untracked fleet-root file names tabi round 16 / a `TabiR16` seat | **BREAKS** | 0/10 `??` hits; 0/174 ignored-file hits for the seat; 0 `TabiR16` in tracked `HEAD`; the only two `round-16` ignored hits are audio-corpus paths |
| Invariant: tabi round-16 artifacts are rooted in the lane, not the fleet root | **HOLDS** | lane `w1/ w2/ drafts/ probes/` + the three claimed scripts exist under `tabi-shokunin/`; the fleet root has no `scripts/*webmcp*`, `*binding*`, `corpus/`, `drafts/`, or `probes/` for this round |
