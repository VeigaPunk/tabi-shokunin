# ExecWaveAudit — round-42 w1 dispatch payload audit

Seat: ExecWaveAudit (executor, role from dispatch `agent=executor`), judged on quality, milestone "dispatch payload audit".
Scope: read-only audit of `.ufo/waves/round-42/w1-dispatch.json`, `w1-spec.json`, `w1.ready`, `w1.ready.dispatched`, `w1/swarm-registry.json`. No writes outside `.ufo/waves/round-42/w1/ExecWaveAudit/` and scratch `/fast/scratch/hyaku/tabi-r42/ExecWaveAudit/` (deleted before yield). No commits, no git/jj mutation, no spawned agents, no network.

## Axes named
1. **Presence/completeness** — top-level `taskCall {context, tasks}` exists; `tasks` length 64; declared counts agree.
2. **Payload fidelity** — every `task` string starts with `/skill:godspeed`; task bodies are the spec prompts verbatim plus a uniform appended tail; no params injected (`model` etc.).
3. **1:1 name bijection** — dispatch names vs spec item names: order, no dupes, no strays; roles/axes/milestones/trailers agree.
4. **Ready-pointer correctness** — `w1.ready.dispatch` names the dispatch path (with `taskCall`), not the spec path; that is the round-41 defect.
5. **Delivery evidence** — captured dispatcher output byte-identical to the dispatch file; dispatched marker present.

## Commands and exact observed output

### 1. Top-level shape
```
$ python3 -c "...json.load(open('w1-dispatch.json')); print(list(d.keys()))"
top keys: ['schema', 'wave', 'policy', 'counts', 'registry', 'compaction', 'taskCall', 'resumeSends', 'note']
schema = "ufo-swarm-wave-dispatch-v1"
wave = "tabi-r42-w1"
counts = {"spawn": 64, "resume": 0, "total": 64}
compaction = {"applied": false, "mechanism": null, "reason": null, "savedBytes": 0, "payloadBytesBefore": 0, "payloadBytesAfter": 0}
resumeSends type/len: list 0
taskCall keys: ['context', 'tasks']
taskCall.context type: str
taskCall.tasks type/len: list 64
```
`taskCall` exists with exactly the two required keys. Entry schema is **objects**, not bare strings:
```
types: {'dict'}
keys per entry (unique): {('agent', 'name', 'task')}
  name  => str 'QuarR4201'
  agent => str 'scout'
  task  => str "/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**..."
```
So "tasks length 64" and "every task string begins with /skill:godspeed" are satisfied as: 64 entries, each carrying a `task` string, 64/64 starting with `/skill:godspeed`.

### 2. Godspeed prefix, evenly
```
task_field_starts_godspeed: 64
task_field_starts_godspeed_notfirstline: 0
tasks_with_godspeed_preamble ("/skill:godspeed\n\nYou are a Godspeed-enabled subagent."): 64
tasks_with_4_axes: 64
```
Full preamble check: `/skill:godspeed`, the four numbered axes (`Name the axes` / `Iterate cheap, in parallel` / `Keep moves that improve any axis and harm none` / `Don't aim — let the frontier walk itself`), the "IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS" paragraph, then the item body — present in all 64.

### 3. Spec 1:1 (names, order, roles, tails)
```
tasks_len 64 / items_len 64
name_sequence_equal: true
dup_names: []   names_only_in_spec: []   names_only_in_dispatch: []
role_mismatch: []                    # dispatch agent == spec role for all 64
task_equals_spec_prompt_plus_appended_block: 64/64  (task field == spec item prompt + appended tail)
all task fields = spec prompt + appended block: True
Report-trailer mismatches: 0         # every tail ends ".ufo/waves/round-42/w1/<name>.md"
missing lane-bounds: 0   missing judged-on: 0   missing VERDICT instruction: 0
judged-on vs spec axes mismatches: 0 # "Judged on: <axes joined>" agrees with spec axes
milestone mismatches: 0              # "Milestone: ..." agrees with spec milestone
duplicate_json_keys: [] for w1-dispatch.json, w1-spec.json, w1.ready
```
Appended tail (byte-exact, QuarR4201), 183 bytes:
```
'\n\nLane bounds: leaf member — no subagent dispatch.\nJudged on: discernment\nMilestone: re-adjudicate S102+S106\n\nReport: write your scoped findings to .ufo/waves/round-42/w1/QuarR4201.md'
```
Tail length varies 176–223 bytes across seats only because lane-bounds/judged-on/milestone/path text varies — each tail is the item's own values, no seat got another seat's values (0 mismatches on all four fields).

Role mix in the 64 entries: scout 20, reviewer 8, critic 6, mutation-tester 9, executor 9, scribe 5, connector 4, sentinel 1, simplifier 1, revenger 1 (= 64). Registry kinds: `{'spawn': 64}`; `resumeSends: []` — consistent with `counts.spawn=64, resume=0`.

### 4. No model parameter
```
model_key_top: false          # no "model" key at document top level
model_key_in_taskcall: false  # taskCall has only context, tasks
model_key_in_entries: []      # per-entry keys are exactly {agent, name, task}
model_parameter_hits: 0
```
The only `model` word occurrences in payload text are ordinary prose, not parameters — 3 hits, all verified in context:
- `CritC2Ledger`: "...Argue from the threat model. - r2: can a 1-word quote (e.g. 'options') green the substring c..."
- `ExecWaveAudit`: "...no task contains a model parameter. Cross-check three sample tasks..." (the audit instruction itself)
- `ConnSiblingProc`: "...kama (local model serving — /proc/net/listener ownership) and souji (process resid..."

No alias, no `model:` field, no `--model` flag anywhere in the 64 task bodies (regex `(?i)\bmodel\b`, `"model"\s*:`, `(?i)\bmodel\s*[=:]`).

### 5. Three sample tasks — first 200 chars (verbatim)
`QuarR4201` (agent=scout, len=2666):
```
"/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim — let the frontier"
```
`CritC1Reach` (agent=critic, len=1891):
```
"/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim — let the frontier"
```
`SentC2Checker` (agent=sentinel, len=2182):
```
"/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim — let the frontier"
```
All three begin with the identical Godspeed preamble; their differing bodies follow (`QuarR4201` → "re-adjudicate S102+S106"; `CritC1Reach` → "C1 reachability attack"; `SentC2Checker` → checker sentinel item). Evidence: `evidence/samples-first200.txt`.

### 6. w1.ready names THIS dispatch path (the round-41 fix)
```
$ cat w1.ready
{"lane":"tabi","round":42,"wave":"w1","dispatch":"/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1-dispatch.json","l1":"TabiR42"}

$ cat w1.ready.dispatched
1793201876.0697021
```
Verified mechanically, not just by reading:
```
ready.dispatch exists: True bytes: 156453
ready.dispatch sha256 == w1-dispatch.json sha256: True
ready.dispatch basename: w1-dispatch.json
ready target has taskCall: True  tasks: 64
ready names spec path?  False
marker 1793201876.0697021 = 2026-10-28T15:37:56.069702Z UTC; file mtime 15:37:56.069739Z; delta 3.7e-05 s
```
So the ready pointer resolves to a file that *does* carry `taskCall`, and it is not the spec path.

Contrast with round-41 (the defect this audit checks):
```
$ cat ../round-41/w1.ready
{"lane":"tabi","round":41,"wave":"w1","dispatch":".../round-41/w1-spec.json","l1":"TabiR41"}
$ cat ../round-41/w1.ready.dispatched
never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall) 08:53+; L1 filed report 9fa5ad61 with queued-wave disposition (orchestrator 2026-10-28)
$ python3 ... 'taskCall' in json.load(open('../round-41/w1-spec.json'))
r41 spec keys: ['wave','maxLanes','reportDir','context','items']   has taskCall: False
```
Round-41's ready pointed at a spec that has no `taskCall`; round-42's ready points at a payload that has one. Defect closed for this wave.

### 7. Delivery evidence
```
9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4  w1-dispatch.json
9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4  w1-run-output.json
07227640b0ee8702d86320df6d7df8aeaf79ddacc6090c985c1583b4dc11c864  w1-spec.json
-rw-r--r-- 156453 12:20:16.706658833 w1-dispatch.json
-rw-r--r-- 156453 12:19:52.641662326 w1-run-output.json
-rw-r--r--      0 12:19:52.614662330 w1-run.err
-rw-r--r--    148 12:20:16.717658832 w1.ready
-rw-r--r--     19 12:37:56.069738851 w1.ready.dispatched
```
`w1-run-output.json` (dispatcher stdout) is byte-identical to `w1-dispatch.json`; `w1-run.err` is 0 bytes. Order of events: spec 12:19 → dispatcher run 12:19:52 → dispatch file 12:20:16 → ready 12:20:16 → dispatched marker 12:37:56.

### 8. Registry agreement
```
registry count: 64  dispatch: 64  spec: 64
registry order == dispatch order: True
registry order == spec order: True
registry axes mismatches: 0   milestone mismatches: 0   role mismatches: 0
kinds: {'spawn': 64}
```
`taskCall.context` (3305 bytes) is **equal** to `w1-spec.json` context (`context_equals_spec_context: true`), and is the same round-42 goal/claims/scope text this seat received — no per-seat divergence in the shared block.

## Findings / observations
1. **No dispatch defect found.** Every check listed in the assignment passes: `taskCall` present with context+tasks, 64 entries, 64/64 `/skill:godspeed` prefixes, names 1:1 with spec items in order, zero model parameters, and `w1.ready` naming the dispatch (taskCall-bearing) path. This is the direct refutation of the round-41 failure mode, whose own `w1.ready.dispatched` records `never-dispatched ... KeyError(taskCall)`.
2. **Bookkeeping gap (non-blocking, not a dispatch defect).** All 64 `swarm-registry.json` members still have `"agentId": null` and `"item": null` (`agentId non-null: 0 of 64`), and `createdAt == updatedAt == 2026-10-28T15:19:52.640Z` even though `w1.ready.dispatched` marks success at 15:37:56Z and seats are demonstrably live. The registry is a spawn-plan snapshot, never written back with real ids; seat attribution must be read from the dispatch `name`/`agent` fields, not from the registry. Recorded as an observation, no amendment proposed (registry/claims bytes are frozen).
3. **Payload duplication is intentional but worth noting:** the same task text carries `Lane bounds:` / `Report:` trailers that also appear in the conductor's per-seat assignment; the two agreed byte-for-byte on this seat's entry (`evidence/dispatch-entry-ExecWaveAudit.txt` matches the assignment text this seat received, including "no subagent dispatch except your single labrat"). Tail variance across seats (176–223 bytes) is legitimate per-item content, not a corruption.
4. **`compaction.applied: false`, `payloadBytesBefore/After: 0`** — the payload was not compacted, so no content was elided to reach 64 seats; total dispatch is 156453 bytes.

## Limitations
- **Path correction (disclosed):** a first evidence-copy step used a `SEAT` path relative to the round-42 cwd, which resolved to a stray nested tree `.ufo/waves/round-42/.ufo/waves/round-42/w1/ExecWaveAudit/evidence/`. It was detected on artifact verification, all 7 files were copied to `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/`, and the stray `.ufo` child tree was removed (`stray tree removed: YES`). No file was written outside `.ufo/waves/round-42/w1/` except that transient stray tree, now deleted; the frozen dispatch/spec/ready/registry bytes were never modified (dispatch sha256 re-checked unchanged after the move).
- I verified delivery via `w1-run-output.json` hash equality and the dispatched marker only; I cannot observe the hub transport itself from a leaf seat, so "the hub received exactly these bytes" is [INFERENCE] from the dispatcher's captured stdout being byte-identical plus the presence of live seats.
- The claim that names "match the spec items 1:1" was tested by exact sequence equality and by task-body/sub-prompt equality, not by any identifier inside the task text (the `name` field is the only identifier; task bodies contain item titles, not seat names).
- No tool installs or upgrades were needed or performed; no pacman invocation was attempted (host guard respected).

## Evidence paths
- `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/summary.json` — consolidated audit result (hashes, counts, booleans, ready JSON, round-41 contrast)
- `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/audit-core.json` — machine audit pass 1 (prefix/name/role/model/1:1)
- `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/audit-samples.json` — sample quotes, trailer/lane-bounds/axes/milestone checks
- `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/samples-first200.txt` — raw first-200-char captures for the three samples
- `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/dispatch-entry-ExecWaveAudit.txt` — this seat's full dispatch task text
- `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/w1.ready.json`, `evidence/w1.ready.dispatched.txt` — copies of the ready marker and dispatched stamp
- Scratch `/fast/scratch/hyaku/tabi-r42/ExecWaveAudit/` created and removed before yield.

VERDICT ok dispatch payload is sound: taskCall{context,tasks} present, 64/64 tasks open with /skill:godspeed, names 1:1 with spec items in order, zero model parameters, and w1.ready names the taskCall-bearing w1-dispatch.json (round-41 spec-path defect not repeated; its own ready file records never-dispatched).
