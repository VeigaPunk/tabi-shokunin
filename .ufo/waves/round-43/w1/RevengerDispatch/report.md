# RevengerDispatch — r41 dispatch-failure residue audit (tabi round-43, wave w1)

Seat: `RevengerDispatch` (revenger, leaf, judged on **operability**). Lane:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, read-only; audited artifacts at
`.ufo/waves/round-43/` as they existed 2026-10-29 17:49–17:56 local (UTC−3).
Scratch `/fast/scratch/hyaku/tabi-r43/RevengerDispatch/` (deleted before yield).
No installs (python3 + coreutils only); no git/jj writes anywhere; pacman untouched.

**Verdict: the r41 defect class cannot recur on this round's artifacts.**
The r41 failure was: `w1.ready` pointed at `w1-spec.json`, which has no
`taskCall`, so the dispatcher raised `KeyError(taskCall)` and the wave never
dispatched. This round's `w1.ready` points at `w1-dispatch.json`, which parses,
contains `taskCall.tasks` of 64, matches the spec name-for-name, and dispatch is
confirmed by the marker + live agents + empty `w1-run.err`.

## 1. Recurrence guard — observed evidence (exact checks)

| # | Check (command shape) | Observed |
|---|---|---|
| 1 | `ls -la round-43/` | `w1-spec.json` 86242 B (17:49:06), `w1-dispatch.json` 112180 B (17:49:15), `w1.ready` 148 B (17:49:41), `w1.ready.dispatched` 2227 B (17:52:19), `w1-run.err` **0 B** |
| 2 | `cat w1.ready` | `{"lane":"tabi","round":43,"wave":"w1","dispatch":".../round-43/w1-dispatch.json","l1":"TabiR43"}` — points at the **dispatch file**, not the spec |
| 3 | target exists + parses + `taskCall` | exists; schema `ufo-swarm-wave-dispatch-v1`; `taskCall.tasks` = **64**; counts `{spawn:64, resume:0, total:64}`; `resumeSends: []` |
| 4 | ready→target ordering | ready mtime 17:49:41 ≥ dispatch mtime 17:49:15 (ready written after dispatch compiled) |
| 5 | spec vs dispatch names | 64 unique names each, **identical and same order**; symmetric diff empty |
| 6 | prompts nonempty | 64/64, lengths 777–1574 chars; all start `/skill:godspeed`; task text embeds spec prompt 64/64; `Report:` trailer 64/64; `context` byte-identical spec↔dispatch |
| 7 | registries | dispatch-embedded registry and `w1/swarm-registry.json` both 64 members, all `kind:"spawn"`, role/milestone/axes match spec with **0 mismatches** |
| 8 | dispatch note | "Issue exactly one batched task call with taskCall ({context, tasks}); never split a wave into multiple task calls" — dispatch payload is exactly one such call |
| 9 | dispatch ran | `w1-run.err` empty (sha256 `e3b0c442…b855` = empty input); marker ts 17:52:19; `TabiR43` seen running in `history://`; 7 seat dirs already created under `w1/` at audit time |

Artifact pins (sha256, full list in `evidence/hashes.txt`): w1-spec
`0b895a2b…05cd8`, w1-dispatch `7ee041fc…be64e`, w1.ready
`ed764043…86a18`, w1.ready.dispatched `5e94f787…5fa`.

## 2. r41 residue (the audited failure, ground truth)

- `round-41/` contains **no `w1.ready` and no `w1-dispatch.json`**; only
  `w1-spec.json` (64 items, prompts nonempty — the spec itself was fine) and a
  204-byte `w1.ready.dispatched` whose entire content is:
  > `never-dispatched: ready pointed at w1-spec.json (no taskCall; swarm compile skipped); dispatcher KeyError(taskCall) 08:53+; L1 filed report 9fa5ad61 with queued-wave disposition (orchestrator 2026-10-28)`
- r41 `w1-spec.json` has keys `[context, items, maxLanes, reportDir, wave]` — no
  `taskCall` (correct for a spec; the defect was the ready pointing at it).
- r42 fix observed in-tree: `round-42/w1.ready` points at
  `round-42/w1-dispatch.json`, which has `taskCall` — same shape as r43.
- The seat brief's "validator payload was piped through tail" detail is **not
  corroborated by any in-tree residue** (no `w1-validate.*` in round-41/); the
  marker records the mechanism as "swarm compile skipped" + `KeyError(taskCall)`.
  The tail story is treated as [INFERENCE] from the orchestrator's account.

## 3. Divergences routed as findings (frozen artifacts untouched)

- **F1 — seat-name collisions at spawn (recurring, not new).** Marker body maps
  spec name → live agent name; 62/64 identity, 2 suffixed:
  `ScribeLogDraft → ScribeLogDraft-2`, `ConnCrossClaim → ConnCrossClaim-2`.
  Cause observed in `history://`: pre-existing Main children already held those
  names (`ScribeLogDraft` parked since ~17:43; `ConnCrossClaim` running before
  the 17:52:19 marker — it was in the pre-wave peer roster). All **64 marker
  values are live registered agents** → every seat actually spawned. Hazard: any
  post-wave addressing by spec name (`agent://ScribeLogDraft`, `hub send`,
  or a `w1/ScribeLogDraft/` seat dir) hits the wrong agent/dir; the marker is
  the only old→new record. r40 precedent: 3 collisions (`RevNoHarm-3`,
  `ScribeLesson-6`, `ConnSiblingOverlap-4`), i.e. ~3–5% per 64-seat wave.
  Neither affected seat's prompt pins an absolute seat path, so report-location
  ambiguity is possible for those two seats. Route: consumers must use marker
  values; L1 may want to pre-create `w1/ScribeLogDraft-2/`-style dirs or
  re-key from the marker.
- **F2 — registry carries no identities.** `agentId: null` for all 64 members in
  both the dispatch-embedded registry and `w1/swarm-registry.json` (also true in
  r40/r42 — not an r43 regression). Identity survives only in
  `w1.ready.dispatched`.
- **F3 — marker format drift.** r40/r43: ISO timestamp line + JSON map;
  r42: 19-byte bare epoch float. No consumer was assumed here; recorded as
  residue for whoever parses markers next.
- Non-issue re-checked: task items are `{name, agent, task}` with `agent` as a
  role string (10 roles, identical set to r42) and no `solutionSpace` — same
  shape as r40/r42 dispatches that dispatched successfully, so no r43 regression.

## 4. Limitations

- Leaf: the live dispatcher process and lane runtime are not observable; all
  statements are about the on-disk artifacts + the `history://` registry. If the
  runner were to re-read `w1.ready` after my audit and the files changed, this
  verdict covers the pinned hashes above, not later states.
- `.dispatched` naming: the goal text says `.dispatched`; the actual marker file
  this round is `w1.ready.dispatched` (same convention as r29–r42 per in-tree
  jj operation-log references). No file named bare `.dispatched` exists in
  round-43/ — recorded, not treated as missing.

Evidence: `evidence/consistency-rerun.txt` (full cross-check output),
`evidence/hashes.txt` (artifact + r41-residue sha256), `evidence/xcheck.py`
(the checker that produced it; run with `python3 xcheck.py <round-43 dir>`).

VERDICT ok — r41 ready→spec-without-taskCall KeyError class is structurally excluded by this round's ready→dispatch pointer, populated 64-task taskCall, and dispatched marker; residual hazards F1–F3 routed as findings, no frozen bytes touched.
