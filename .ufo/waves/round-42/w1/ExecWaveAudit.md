# ExecWaveAudit — scoped findings (round-42 w1 dispatch payload audit)

Full report: `.ufo/waves/round-42/w1/ExecWaveAudit/report.md`. Evidence: `.ufo/waves/round-42/w1/ExecWaveAudit/evidence/{summary.json,audit-core.json,audit-samples.json,samples-first200.txt,dispatch-entry-ExecWaveAudit.txt,w1.ready.json,w1.ready.dispatched.txt}`.

## Result: dispatch defect NOT present in round-42 w1

| Check | Observed | Verdict |
|---|---|---|
| top-level `taskCall` with `context` + `tasks` | `taskCall keys: ['context','tasks']`; context 3305 B, equal to `w1-spec.json` context | pass |
| `tasks` length | 64 (entries are objects `{name, agent, task}`, each with a `task` string) | pass |
| every task string begins `/skill:godspeed` | 64/64 (`task_field_starts_godspeed: 64`); all also carry the 4-axis preamble | pass |
| names 1:1 with spec items | `name_sequence_equal: true`, dupes 0, only-in-spec 0, only-in-dispatch 0; also role/axes/milestone/`Report:`-trailer 0 mismatches | pass |
| no model parameter | no `model` key at document/taskCall/entry level; 3 `model` word hits are prose ("threat model", "local model serving", the audit instruction itself) | pass |
| `w1.ready` names THIS dispatch path | `{"lane":"tabi","round":42,"wave":"w1","dispatch":"/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1-dispatch.json","l1":"TabiR42"}`; target sha256 `9f4ac9a0…f87c4` == `w1-dispatch.json`, basename `w1-dispatch.json`, `'w1-spec.json' in path == False`, target has `taskCall` with 64 tasks | pass |
| delivery evidence | `w1-run-output.json` byte-identical to `w1-dispatch.json` (same sha256), `w1-run.err` 0 bytes, `w1.ready.dispatched` = `1793201876.0697021` → 2026-10-28T15:37:56.069702Z (mtime delta 3.7e-05 s) | pass |

## Round-41 contrast (the defect being checked)
```
../round-41/w1.ready        → dispatch: ".../round-41/w1-spec.json"
../round-41/w1.ready.dispatched → "never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall) 08:53+; L1 filed report 9fa5ad61 ..."
round-41 w1-spec.json keys: ['wave','maxLanes','reportDir','context','items']  → has taskCall: False
```
Round-42's ready pointer resolves to a file that does carry `taskCall`. The failure mode that killed round-41 is not repeated.

## Sample first-200-char quotes (all three)
```
QuarR4201    (agent=scout,    len=2666): "/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim — let the frontier"
CritC1Reach  (agent=critic,   len=1891): "/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim — let the frontier"
SentC2Checker(agent=sentinel, len=2182): "/skill:godspeed\n\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim — let the frontier"
```

## Observations (non-blocking, no amendment proposed — bytes frozen)
1. `w1/swarm-registry.json`: 64 members, order == dispatch order == spec order, roles/axes/milestones all agree, kinds `{spawn: 64}` — **but** `agentId` is null for 64/64, `item` null for 64/64, and `createdAt == updatedAt == 2026-10-28T15:19:52.640Z` despite the 15:37:56Z dispatched stamp and demonstrably live seats. Registry is a spawn-plan snapshot never written back; attribute seats from the dispatch `name`/`agent` fields.
2. Task text = spec prompt + appended tail (176–223 B: `Lane bounds:` / `Judged on:` / `Milestone:` / `Report:` per item). Tail values are each item's own (0 mismatches); this seat's dispatch entry matches the assignment text received, including "no subagent dispatch except your single labrat".
3. `compaction.applied: false`, `payloadBytesBefore/After: 0` — nothing was elided to fit 64 seats; payload 156453 B; `counts {spawn:64, resume:0, total:64}` matches `resumeSends: []`.
4. No duplicate JSON keys in `w1-dispatch.json`, `w1-spec.json`, `w1.ready`.

## Limitations
- Hub transport unobservable from a leaf: "hub received these bytes" is [INFERENCE] from byte-identical dispatcher stdout + live seats.
- No installs performed (none needed); pacman never invoked.

VERDICT ok dispatch payload is sound: taskCall{context,tasks} present, 64/64 tasks open with /skill:godspeed, names 1:1 with spec items in order, zero model parameters, and w1.ready names the taskCall-bearing w1-dispatch.json (round-41 spec-path defect not repeated).
