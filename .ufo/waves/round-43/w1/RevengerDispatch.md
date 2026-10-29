# RevengerDispatch — r41 dispatch-failure residue audit

Full report with every check: `.ufo/waves/round-43/w1/RevengerDispatch/report.md`
(evidence: `w1/RevengerDispatch/evidence/{consistency-rerun.txt,hashes.txt,xcheck.py}`).
Read-only lane audit; pins in `evidence/hashes.txt`.

**Verdict: the r41 defect class cannot recur on this round's artifacts.**
r41's marker (`round-41/w1.ready.dispatched`, 204 B) records it verbatim:
`never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall)`. This round:

- `w1.ready` = `{lane:tabi, round:43, wave:w1, dispatch:<abs w1-dispatch.json>, l1:TabiR43}` — points at the **dispatch file**;
- target exists, parses (`ufo-swarm-wave-dispatch-v1`), `taskCall.tasks` = 64, counts `{spawn:64,resume:0}`, `resumeSends: []`;
- spec↔dispatch: 64 names identical in order, prompts nonempty 64/64 (777–1574 B), task text embeds spec prompt 64/64, `Report:` trailer 64/64, context byte-identical; registries (embedded + `w1/swarm-registry.json`) 0 mismatches vs spec, all `kind:spawn`;
- dispatch confirmed: `w1-run.err` 0 B, marker `w1.ready.dispatched` ts 17:52:19, all 64 marker values are live agents in `history://`.

Findings routed (frozen bytes untouched):
- **F1** name collisions at spawn: `ScribeLogDraft→ScribeLogDraft-2`, `ConnCrossClaim→ConnCrossClaim-2` (pre-existing Main children held the base names; r40 had 3 such). Marker is the only old→new record — consumers must address marker values, not spec names.
- **F2** `agentId: null` for all 64 registry members (also r40/r42): identity lives only in the marker.
- **F3** marker format drift r42 (bare epoch float) vs r40/r43 (ISO ts + JSON map).

Limitation: leaf — live dispatcher process not observable; verdict pinned to the hashed artifact states. No `.dispatched` bare file exists; the marker convention here is `w1.ready.dispatched` (as r29–r42).

VERDICT ok — r41 ready→spec-without-taskCall KeyError class structurally excluded; hazards F1–F3 recorded as findings.
