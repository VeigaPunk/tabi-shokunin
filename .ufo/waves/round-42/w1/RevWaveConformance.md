# Wave conformance audit — tabi round 42, wave 1

Seat: `RevWaveConformance` (reviewer, axis `quality`, milestone `wave conformance audit`).
Lane: tabi. Wave: `tabi-r42-w1`. Audit ran read-only against the lane's own wave artifacts.

## Inputs (exact, hashed at read time)

| file | bytes | sha256 |
|---|---|---|
| `.ufo/waves/round-42/w1-spec.json` | 131644 | `07227640b0ee8702d86320df6d7df8aeaf79ddacc6090c985c1583b4dc11c864` |
| `.ufo/waves/round-42/w1-dispatch.json` | 156453 | `9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4` |
| `.ufo/waves/round-42/w1/swarm-registry.json` | 13767 | `4400ebed02aa8878c7687477f24f99f34e7abf9ebf685312dbab71b07b55b5e1` |

All three present at first read (no 60 s retry needed). Registry `createdAt` `2026-10-28T15:19:52.640Z`; dispatch written at `2026-10-28T12:20:16-0300` (`15:20:16Z`) — registry precedes the dispatch write, and the dispatch embeds the same registry.

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42
$ sha256sum w1-run-output.json w1-dispatch.json
9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4  w1-run-output.json
9f4ac9a0a7ee248a61947a60fdd2d8220fb3c662095c77a761cbd56aca9f87c4  w1-dispatch.json
$ ls -la w1-run.err
-rw-r--r-- 1 vgpnk vgpnk 0 Oct 28 12:19 w1-run.err
```

The payload actually sent (`w1-run-output.json`) is byte-identical to the audited `w1-dispatch.json` (same sha256), and the run stderr is 0 bytes. The audit therefore covers the dispatched bytes, not merely a candidate file.

## Method

Structural comparison in one Python pass over the three JSON documents (full script output retained as `evidence-audit.json`), plus `jq` shape probes and filesystem census. No writes outside this seat dir and the required `Report:` trailer path; no git/jj, no network, no installs.

```
$ jq -r '{schema,wave,reportDir,createdAt,updatedAt,members:(.members|length),
          memberRoleHist:([.members[]|.role]|group_by(.)|map({role:.[0],n:length}))}' w1/swarm-registry.json
$ jq -r '{schema,wave,counts,taskCallKeys:(.taskCall|keys),tasks:(.taskCall.tasks|length)}' w1-dispatch.json
$ jq -r '{wave,maxLanes,reportDir,items:(.items|length),contextLen:(.context|length)}' w1-spec.json
$ jq -r '[.taskCall.tasks[]|keys]|add|unique' w1-dispatch.json      # → ["agent","name","task"]
```

## Criterion results — every mandated check passes

| # | criterion | observed | verdict |
|---|---|---|---|
| 1 | 64 members | registry `members` = **64**, spec `items` = **64**, dispatch `tasks` = **64** | PASS |
| 2 | roles histogram | **connector 4, critic 6, executor 9, mutation-tester 9, revenger 1, reviewer 8, scout 20, scribe 5, sentinel 1, simplifier 1** — exactly the required set, sum 64 | PASS |
| 3 | attack share ≥ 25 % | reviewer 8 + critic 6 + mutation-tester 9 = **23 / 64 = 35.9375 %** | PASS |
| 4 | no planner/distiller/labrat roles | registry role members **planner 0, distiller 0, labrat 0**; task `agent` vocabulary is exactly the 10 declared roles | PASS |
| 5 | all names unique | 64/64 unique in each artifact; name sets identical across spec, dispatch, registry | PASS |
| 6 | reportDir lane-relative | `.ufo/waves/round-42/w1` in **both** spec and registry; no leading `/`, no repo-name prefix | PASS |
| 7 | dispatch = spec-rendered payload | `taskCall` keys exactly `[context, tasks]`; context **byte-equal** (3305 chars, sha `8a9d17495aae2870…`); tasks **64**; **64/64** task strings begin `/skill:godspeed`; **64/64** reproduce the spec render (prompt + lane-bounds + judged-on + milestone + report trailer; task order = item order); task keys only `[agent, name, task]` (**no `model` parameter**) | PASS |

Supporting checks, also observed: `counts` = `{spawn: 64, resume: 0, total: 64}`; all registry `kind` = `spawn`; every `agentId` and `item` null (spawn-time registry); embedded dispatch registry `members` byte-equal to the file; `policy.maxLanes` 64 inside the declared band `[waveMinLanes 64, waveMaxLanes 128]`; `w1.ready` names **the dispatch file** (`/…/w1-dispatch.json`), closing the round-41 failure mode where ready named the spec without `taskCall`.

## Findings

### F1 — Medium. The frozen context contradicts itself on write scope, and completed seats are already double-writing divergent copies.

The shared context carries two mutually exclusive instructions:

- offset **1233**: `Scope and hard bounds: your report and evidence files go ONLY under /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1/<YourSeatName>/ (report.md plus evidence files inside your seat dir)`
- offset **1949**: ``Every `Report:` trailer path is relative to /home/vgpnk/Projects/shokunin/tabi-shokunin — write it at /home/vgpnk/Projects/shokunin/tabi-shokunin/<that path>.``

Every trailer resolves to a **sibling** of the seat dir: `64/64` match `^\.ufo/waves/round-42/w1/<Name>\.md$`, which is not under `…/w1/<Name>/`. So the sentence that says "ONLY under the seat dir" is contradicted by the sentence that endorses the trailer path, in the same payload, for all 64 seats.

The contradiction is not hypothetical — it is already visible on disk:

```
$ python: glob w1/*.md  vs  w1/*/report.md  for all 64 roster names
flat w1/*.md files: 24      seat dirs with report.md: 24
both: 24   only flat: 0   only seat: 0   neither (unfinished): 40
```

Every one of the 24 finished seats wrote **both** copies — the sets are exactly identical, so this is systematic hedging, not seat idiosyncrasy. And the copies are not always equal:

```
identical: 12   differing: 12
differing: ExecWaveAudit, MutC2TinyStub, QuarR4202, QuarR4203, QuarR4204,
           QuarR4207, QuarR4209, QuarR4210, QuarR4211, QuarR4212, QuarR4213, QuarR4216
verdict class same across both: 24 / 24
```

Half the finished seats (12/24) have byte-divergent copies (e.g. `QuarR4207`: flat 2808 B vs seat 6635 B; `ExecWaveAudit`: 4635 B vs 12725 B). Verdict class still agrees 24/24 today, so no adjudication has flipped yet — but which document a reader integrates depends on which path it picks, and 40 seats have yet to choose. This is a hole in the frozen bytes; per the wave rules it is routed as a finding, not amended. Evidence: `evidence-dual-write.json`, `evidence-dual-content.json`.

### F2 — Low. Nine executor trailers authorize a labrat the same payload's context forbids, and no labrat is registered.

The 9 executor task bodies carry `Lane bounds: leaf member — no subagent dispatch except your single labrat.` (the other 55 carry `… no subagent dispatch.`). The same payload's context says `no spawned agents — you are a leaf`.

Canonical lane policy does permit this narrowly — `scripts/hyaku/lane-addendum.md:278-280`: "an executor seat may spawn one read-only `labrat` probe for a falsifiable hypothesis — the only card-permitted seat spawn; every other role stays a leaf", and `templates/agents/ufo-executor.md:28-31` limits it to a seat "explicitly seated as the probeParent executor". But this wave declares no `probeParent`: registry member keys are only `{agentId, axes, item, kind, milestone, role}`, all 64 `item`/`agentId` null, and no member has role `labrat`.

Consequences: (a) the roster-level criterion "no planner/distiller/labrat roles" passes while the payload simultaneously grants a labrat child — the two statements must be read as roster-scoped vs authorization-scoped, which the payload never says; (b) a spawned labrat is unregistered and unregistrable here, so its evidence is invisible to the 64-member census and to the attack-share denominator. This is pre-existing emitter behaviour (round-12/round-13 dispatch files carry the same clause), not a round-42 regression, but round-42's context text is what now contradicts it.

## Residual risk and verification gaps

- Registration is spawn-time only: 40 seats had not finished at audit time, so the registry cannot evidence per-seat liveness; dead seats are recorded by the results parser, not here.
- The `Report:`-path divergence (F1) is measured at one instant; more seats may widen it as they land.
- The renderer that appends lane-bounds/judged-on/milestone/report is not in this repo (`scripts/ufo-swarm-wave.mjs` absent; no emitter in `scripts/hyaku`), so the 64/64 render equality is established empirically against the spec fields, not by reading emitter source.
- `w1-results.json` did not exist at audit time; `parse-w1-results.mjs` reads seat `finalOutput` from it, so no machine adjudication has consumed the flat/seat files yet.
- Semantic role correctness (whether a seat's prompt matches its declared role) was checked per-name for role/axes/milestone equality only; prompt content quality is other seats' scope.

No tool installs were performed (no pacman; no `uv`/binary installs needed). No writes outside the seat dir and the required trailer path.

Evidence files: `evidence-audit.json`, `evidence-dual-write.json`, `evidence-dual-content.json`.

VERDICT finding — all six mandated checks pass with exact numbers (64 members; histogram exact; attack 23/64 = 35.94 %; zero planner/distiller/labrat members; 64 unique names; reportDir lane-relative; 64 tasks, context byte-equal, 64/64 `/skill:godspeed`, 64/64 spec-render equal), but the frozen context self-contradicts on report scope (F1: 64/64 trailers outside the seat dir; 24/24 finished seats dual-wrote, 12/24 byte-divergent) and 9 executor trailers authorize a labrat that the context forbids and the registry cannot record (F2).
