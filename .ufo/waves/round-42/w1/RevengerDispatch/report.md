# RevengerDispatch — reverse the round-41 dispatch failure

Seat: `RevengerDispatch` (revenger, axis: quality). Milestone: dispatch failure reverse.
Lane repo HEAD at read time: `0081bfdb93b6bd1bf2853bb128996f1a976b7218`; fleet repo HEAD for the
dispatcher source: `e2fdc5fe95af081995a1cd394761f08259c0a392` (2026-10-28T11:09:42-03:00).
Nothing outside this seat dir was written; no commits, no git/jj mutation, no agents spawned.
No tool was installed or upgraded (nothing needed); no scratch payload remained in
`/fast/scratch/hyaku/tabi-r42/RevengerDispatch/` (created `mkdir -p`, removed at exit).

---

## 1. Reconstructed contract (what a handoff MUST satisfy)

The handoff is two files: `<wave>.ready` and the file its `dispatch` field names. Every consumer
in the chain indexes **`taskCall` on the file `ready.dispatch` points at**, never on the spec:

| Consumer | Committed source | What it reads |
|---|---|---|
| inline dispatcher `register()` | `scripts/hyaku/inline-dispatcher.py:249-250` | `meta = json.load(open(ready)); d = json.load(open(meta['dispatch']))` then `tc = d['taskCall']; tasks = tc['tasks']` |
| inline dispatcher `adopt()` (kernel restart) | `inline-dispatcher.py:218-229` | `d['taskCall']['tasks']` for names/agents; seat ids from line 2 of `<ready>.dispatched` |
| inline dispatcher `bootstrap()` | `inline-dispatcher.py:372-383` | same `d['taskCall']['tasks']` |
| addendum dispatch bridge (run-6/7 handoff) | `scripts/hyaku/lane-addendum.md:145-147,216-222` | "spawns every seat of `taskCall`" / `tc=p['taskCall']; tasks=[...]` |
| wave runner | `~/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (CLI tail) | `command === "run" ? planToDispatchPayload(plan)` → emits `{schema:'ufo-swarm-wave-dispatch-v1', …, taskCall:{context,tasks}, …}` **on stdout**; it persists the registry and agent cards, never the dispatch file |

Binding text (`lane-addendum.md:145-147`): the L1 writes `<wave>.ready` holding
`{"lane","round","wave","dispatch":"<abs dispatch json>","l1"}`, the orchestrator "takes it within
~15 s (marker `<wave>.ready.dispatched`), spawns every seat of `taskCall`". So the artifact
`ready.dispatch` names MUST be the compiled dispatch payload — the spec is the runner's *input*
(`['wave','maxLanes','reportDir','context','items']`) and has no `taskCall` at all.

`tick()` (`inline-dispatcher.py:306-322`) wraps `register()` in `except Exception as e:
dlog('wave-error', ready, repr(e))`; it writes `ready.dispatched` **only** after every seat is
spawned (`:266-267`). A raise therefore leaves no marker and the ready is re-tried on every tick.

## 2. Evidence chain — why round 41 never spawned

All r41 bytes below are committed at lane HEAD and hash-identical in the worktree
(`evidence/01-r41-handoff.txt`).

**a. The committed handoff points at the spec.**
`git show HEAD:.ufo/waves/round-41/w1.ready` (sha256 `3048d43a02ee…`):

```json
{"lane":"tabi","round":41,"wave":"w1","dispatch":"/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-41/w1-spec.json","l1":"TabiR41"}
```

**b. That target has no `taskCall`.** `w1-spec.json` (sha256 `2562e34043b3…`) top-level keys:
`['wave', 'maxLanes', 'reportDir', 'context', 'items']`, 64 items, `tabi-r41-w1`, `maxLanes 64`.
There is no `taskCall` key anywhere, and no `round-41/w1-dispatch.json` has ever existed:
`git log --all --name-only | grep 'round-41/.*dispatch'` returns only
`.ufo/waves/round-41/w1.ready.dispatched`; the r41 landing commit
`8c84417652f7602886dcc85f74bffdadd9c3a281` ("round-41 w1 spec+ready: 64 seats, 62% attack",
2026-10-28T08:21:13-03:00) contains exactly `gen-w1-spec.py`, `w1-spec.json`, `w1.ready`,
`w1/swarm-registry.json` — **no dispatch artifact**.

**c. The exact raise, reproduced against the frozen bytes** (`evidence/03-keyerror-repro.txt`):

```
$ python3 -c "import json; d=json.load(open('.ufo/waves/round-41/w1-spec.json')); print(len(d['taskCall']['tasks']))"
KeyError: 'taskCall'   exit=1
```

which is precisely `inline-dispatcher.py:249-250` against the r41 ready. `tick()` caught it and
logged it as `wave-error` (`evidence/02-dispatcher-source.txt`).

**d. The failure is visible in the dispatcher log as a 33-minute retry storm**
(`evidence/05-log-window.txt`):

```
$ grep -c "wave-error .*tabi-shokunin/.ufo/waves/round-41/w1.ready" .ufo/state/inline-dispatcher.log
23209
first: 2026-10-28T08:21:20 wave-error .../round-41/w1.ready KeyError('taskCall')
last : 2026-10-28T08:54:40 wave-error .../round-41/w1.ready KeyError('taskCall')
after 08:56 (tombstone marker landed): 0 lines
```

**e. Zero seats ever existed.** `.ufo/waves/round-41/w1/` contains only `swarm-registry.json`
(64 members, all `agentId: null` — the plan, never a spawn). No seat report dirs. The L1's own
report says it: "The handoff remained queued at 0/64 spawned" (`.ufo/reports/round-41/tabi.md`).

**f. The upstream half of the cause: the compile payload was emitted and thrown away.** The r41 L1
*did* run the compile, three times, but piped stdout through `tail`
(`evidence/08-r41-compile-piped.txt`, from `…/sessions/…/TabiR41.jsonl`):

```
11:20:03Z  node ~/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs run --spec .ufo/waves/round-41/w1-spec.json 2>&1 | tail -20
11:20:50Z  … | tail -25
11:21:06Z  … | tail -15
```

The result the seat actually saw for the last run (jsonl line 406) begins
`items 64 roles {'reviewer': 16, 'critic': 14, …} attack seats 40 (62%)` followed by the last two
task objects (`SonicDigestCheck`, `SimpDeadCode`) — the tail of a 1003-line dispatch payload that
was never redirected to a file. At 11:20:5xZ the L1 wrote the ready with the thinking text
"Spec validates. Writing `w1.ready` for the orchestrator." and `dispatch → w1-spec.json`
(jsonl line 407) — the spec was mistaken for the dispatch artifact because the real payload had
only ever existed on a `tail` pipe.

**g. How the loop stopped, and what it cost.** The L1 filed the interim report at
2026-10-28T08:54:32-03:00 (fleet commit `9fa5ad615a5c9746e44027d7308fcc7b18ac3d27`,
`.ufo/reports/round-41/tabi.md`), then the orchestrator wrote the tombstone
`w1.ready.dispatched` (sha256 `d864e6dd0106…`, committed in
`ef41e539c017797bce97001e7c9ed2e8a7666a90` at 08:56:05):

```
never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall) 08:53+; L1 filed report 9fa5ad61 with queued-wave disposition (orchestrator 2026-10-28)
```

That file is a *human tombstone*, not a dispatcher marker (no `YYYY-MM-DDTHH:MM:SS` header, no
seat-id map), and it exists only to make `tick()` (`:311`) and `ready-watch.sh` stop selecting the
ready. 64 planned seats, 0 spawned, whole round idled.

**Same shape, other lane (corroboration, not repaired here):** kasegi r42 `w2.ready` logged the
identical `KeyError('taskCall')` 392 times, 2026-10-28T09:20:02 → 09:57:57, and was cleared by
deleting the stale ready at run start (`/home/vgpnk/Projects/shokunin/.scratch/goal-20261028-hyaku-run11.md`,
"Run-start repairs", first bullet). Carried as a finding, not an amendment.

## 3. The round-42 handoff breaks this chain — verified

Artifact-level (`evidence/04-r42-chain.txt`), all bytes committed at HEAD and hash-identical:

```
$ sha256sum .ufo/waves/round-42/w1-dispatch.json          9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4
$ git show HEAD:.ufo/waves/round-42/w1-dispatch.json | sha256sum
                                                          9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4
$ cat .ufo/waves/round-42/w1.ready
{"lane":"tabi","round":42,"wave":"w1","dispatch":"/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1-dispatch.json","l1":"TabiR42"}

dispatch top-level keys: ['schema', 'wave', 'policy', 'counts', 'registry', 'compaction', 'taskCall', 'resumeSends', 'note']
taskCall keys: ['context', 'tasks']
taskCall.tasks len: 64
taskCall.context len: 3305
spec names == dispatch names (order-sensitive): True
registry members: 64 == dispatch names: True
ready.dispatch is the DISPATCH file: True
ready names a spec file: False
every task begins /skill:godspeed: True
task keys union: ['agent', 'name', 'task']
```

Positive control — the dispatcher's own expression succeeds on the r42 target and fails on the
r41 target (`evidence/03-keyerror-repro.txt`, both exit codes recorded):

```
$ python3 -c "import json; print(len(json.load(open('.ufo/waves/round-42/w1-dispatch.json'))['taskCall']['tasks']))"
64        exit=0
```

Payload provenance: `.ufo/waves/round-42/w1-run-output.json` is byte-identical to
`w1-dispatch.json` (`cmp` → `IDENTICAL`, same sha256) and `.ufo/waves/round-42/w1-run.err` is
0 bytes — the swarm compile's stdout was captured this round instead of piped to `tail`
(landed in `236c4f49`, 2026-10-28T12:23:38-03:00, together with spec + ready + registry).

Runtime-level (the ready *has* landed and the wave *did* spawn, so the "audit dispatch only"
escape clause does not apply):

* `.ufo/waves/round-42/w1.ready.dispatched` exists, untracked, 19 bytes, mtime
  `2026-10-28 12:37:56.069738851 -0300`, content `1793201876.0697021` (= that mtime as epoch) —
  so `tick()`/`ready-watch.sh` no longer select the ready and cannot double-dispatch it.
* Seat reports are landing: `ls -d .ufo/waves/round-42/w1/*/ | wc -l` → **59** at check time
  (including this seat), against 0 for r41; this seat itself is one of the 64 dispatch tasks.
* The orchestrator session that took the handoff is the parent session
  `…/sessions/-Projects-shokunin/2026-10-28T14-01-34-216Z_01a182d0-….jsonl`. Its staging cell
  (jsonl line 1220) is the guard in action — it reads `taskCall` off the **dispatch** file:
  `d=json.load(open('…/round-42/w1-dispatch.json')); tc=d['taskCall']; ctx=tc['context']; tasks=tc['tasks']`
  → printed `64 seats; context bytes: 3305`; the spawn cell (line 1238) then looped
  `tool.task(...)` per seat and printed `104 seats spawned` (tabi 64 + kaidoku 40), writing the
  epoch marker quoted above (`evidence/06-orchestrator-cell.txt`).

Net: the r42 chain is `spec → (swarm compile, captured) → w1-dispatch.json(taskCall) →
w1.ready(dispatch→w1-dispatch.json) → spawn`, i.e. every arrow the r41 chain was missing.

## 4. Divergences and findings (routed, not amended)

* **F1 — swallowed dispatch failure (quality).** `tick()` reduces a broken handoff to a
  `wave-error` log line and retries forever; there is no escalation, no `.partial` heartbeat that
  a missing `taskCall` would trip, and no ready-watch message beyond the generic `READY` that was
  already consumed by the retry loop. r41 idled 33 min and would have idled the round out had the
  orchestrator not hand-written the tombstone. Counters/claims are frozen — nothing proposed.
* **F2 — markers are not all adoptable (quality, inference marked).** `adopt()`/`bootstrap()`
  read the seat-id map from **line 2** of `.dispatched` (`:221-226`, `:367-370`). r42's marker has
  one line (a bare epoch, written by the orchestrator's bridge cell), while the canonical
  `register()` writes two (`:266-267`). `[INFERENCE]` Anticipate that if this kernel restarts,
  `adopt()` finds `ids = {}` and the wave cannot be finished/messaged as WAVE-DONE. Not measured —
  no kernel restart reproduced (out of scope for a leaf seat).
* **F3 — the compile/persist step is unenforced (quality).** `ufo-swarm-wave.mjs run` emits the
  1003-line payload on stdout and writes only the registry/agent cards; whether the dispatch file
  exists depends entirely on the L1 not piping it through `tail`. r41 shows the failure; r42 shows
  the working habit (`> w1-run-output.json`, then committed). The guard rule below makes the
  artifact checkable; the mechanism change is a next-freeze decision, not mine.
* **F4 — observation: the dispatcher is not running in this session.** The orchestrator's own
  state reconstruction (same session, jsonl line 39) reads "The dispatcher is not running, leaving
  three claims orphaned…". r42's spawn therefore came from the hand-rolled bridge cell, not
  `register()`. That is why verification here is artifact-level plus spawn evidence: it proves the
  *contract* is satisfiable and satisfied by these bytes, and does not exercise `register()`'s live
  path.

## 5. Guard rule for future rounds (lesson text, two sentences)

> A `<wave>.ready` file's `dispatch` field MUST name a persisted `<wave>-dispatch.json` whose
> top-level `taskCall` carries both `context` and `tasks` — never the `<wave>-spec.json` the
> payload was compiled from — and that dispatch file MUST land in the same commit as the ready so
> the handoff is reconstructible from committed bytes.
> Never pipe the swarm compile (`ufo-swarm-wave.mjs run`) through `tail`/`head`: redirect its
> stdout to the dispatch file, then assert the artifact before writing the ready with
> `python3 -c "import json,sys;d=json.load(open(sys.argv[1]));t=d['taskCall']['tasks'];print(len(t))"`
> against the spec's item count (64 here, exit 0), because a KeyError in that one read is a whole
> round of seats that never spawn.

## 6. Evidence index (this seat dir)

| File | Content |
|---|---|
| `evidence/01-r41-handoff.txt` | HEAD hashes + bytes of r41 ready/spec/tombstone, spec keys, 0/64 spawn proof |
| `evidence/02-dispatcher-source.txt` | `register()` 231-278, `tick()` 306-322, marker write 266-268, at fleet HEAD `e2fdc5fe` |
| `evidence/03-keyerror-repro.txt` | negative control (r41 spec → `KeyError: 'taskCall'`, exit 1) and positive control (r42 dispatch → 64, exit 0) |
| `evidence/04-r42-chain.txt` | r42 hashes, ready bytes, taskCall lengths, 1:1 name check, registry, seat-dir count |
| `evidence/05-log-window.txt` | 23209 r41 wave-error lines + window, kasegi w2 392 lines, log mtime |
| `evidence/06-orchestrator-cell.txt` | staged taskCall cell, `104 seats spawned`, dispatch bridge tail, "dispatcher is not running" |
| `evidence/07-l1-transcript.txt` | r41 L1's ready write (spec binding), tombstone commit `9fa5ad61` resolution |
| `evidence/08-r41-compile-piped.txt` | the three `| tail` compile invocations, the tail-only result, and commit timing |

## 7. Limitations

* `register()` was not executed against the frozen r41 bytes; the reproduction is the single
  expression it dead-ends on (`d['taskCall']`), run verbatim, plus the log lines that same code
  path emitted. The fleet dispatcher is not running in this session (F4), so a live tick could not
  be exercised without touching the orchestrator kernel.
* r42's `w1.ready.dispatched` is an untracked runtime marker; its bytes and mtime are quoted from
  the worktree, not from a commit. The dispatch/ready/spec/registry bytes *are* committed and were
  compared at HEAD.
* The r41 L1's intent ("spec validates → write ready") is quoted from its own thinking and write
  call; no step in its transcript saves the emitted payload, and I found no other file that could
  have held it. Statements about *why* it chose the spec path beyond that are inference.
* Frozen bytes (`claims.json`, `counters/check-routed-defects-round42.mjs`) were read-only
  reference for scope; no verdict on C1/C2 is offered or implied here.

VERDICT finding — r41's handoff bound `w1.ready.dispatch` to `w1-spec.json` (no `taskCall`) after three `| tail` compile runs discarded the payload, so `register()` raised `KeyError('taskCall')` 23209 times (08:21:20–08:54:40) and 0/64 seats spawned; r42's committed `w1-dispatch.json` carries `taskCall` with 64 tasks (byte-identical at HEAD, `python3` extraction exit 0) and its ready names that file — the chain that did spawn 59+ seat dirs.
