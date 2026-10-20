# WaveConformance — tabi round 15, wave 1 (read-only audit)

Seat: `TabiR15.WaveConformance` (reviewer, dispatched m_haiku, status pending at read time).
Scope: campaign seat-count rule (64+32), planner-seat rule, report-path rule, inherited 32-seat limit.
Author-side audit. Not a non-author certification.

## Method and limits

- Read-only. Files read from the lane, `ufo-fsd-alpha` validator, `shokunin` prompts and hyaku policy files, and read-only `git log/show/status` on `ufo-fsd-alpha`. Read `~/.omp/agent/config.yml` (routing block only).
- NOT executed: `ufo-swarm-wave.mjs plan` or `run`, validator, tests, gates, counters, browser, builds, lint. No source edits. No delegation.
- Read-only JSON queries against `validation.json`, `dispatch-result.json`, and the policy files.
- Tools installed or updated: none.

## Axes

1. Seat count and band (wave 1 = 64–100 on policy v2; wave 2 = 32–64 on v1; round ≤128).
2. Planner seat (must be absent from swarm roles; L1 holds planner).
3. Report path (lane-relative trailer plus absolute context sentence; no relative leaks in task bodies).
4. Routing and config provenance (what the artifacts prove about policy and role→model).
5. Inherited 32-seat limit (where it still binds).

## Verified facts (wave 1)

- Spec: 64 items, `spec.json:8–323`. Roles: executor 3, scout 11, connector 6, reviewer 18, critic 9, sentinel 4, scribe 8, revenger 5 = 64.
- `validation.json`: `counts` spawn 64 / resume 0 / total 64; `taskCall.tasks` length 64; 64 distinct `Report:` trailers, all `.ufo/waves/round-15/w1/<Name>.md`.
- Relative-path scan of the 64 task bodies, with the trailer stripped: 0 hits. Positive control (`.ufo/waves` in task text): 64 hits. The regex works.
- `dispatch-result.json`: "Spawned 64 background agents"; 64 progress rows, all `pending`, `toolCount 0` at read time. Results are not yet evidence of completion.
- Applied `modelRole` per agent (from progress rows): executor→m_flash 3, reviewer→m_haiku 18, scribe→m_haiku 8, critic→m_opus 9, sentinel→m_opus 4, scout→m_antigravity 11, connector→m_antigravity 6, revenger→m_luna 5. This matches the campaign mapping at `.ufo/prompts/tabi-round-15.md:194–197` (shokunin root).
- `WaveConformance` row: `reviewer`, `m_haiku`, `pending`.
- Wave policy in `validation.json:4–15`: `source: config`, `maxLanes 64` (spec tightening), `minLanes 16`, `waveMinLanes 64`, `waveMaxLanes 100`, `declaredMaxLanes 64`, `hardCeiling 100`, `globalRunnerCeiling 1056`.
- `validation.stderr.txt` is empty. The exit code is not recorded in `validation.json`.
- No `round-15/w2` directory exists yet.

## Findings (by severity)

### F1 — HIGH: wave-1 band provenance is not recorded in the artifact

- The 64/100 band matches `scripts/hyaku/ufo-wave-policy-v2.json` (`sighting.dispatch.swarm`: `waveMinLanes 64`, `waveMaxLanes 100`, `maxLanes 100`, `minLanes 16`). That file is selected via `UFO_CONFIG_PATH` plus `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` (`tabi-round-15.md:177–178`, shokunin root).
- The emitted `policy` block (`ufo-swarm-wave.mjs:1210–1225`) carries only `source: "config"`. It records no config path, no hash, and no external-override flag. `validation.json:5` therefore cannot distinguish HEAD, v1, or v2.
- Anchors: external gate at `ufo-mission-result.mjs:2146` (`ALLOW_EXTERNAL_TOOLS`) and `:2163–2179` (`gatedConfigPath`); default config path at `ufo-swarm-wave.mjs:125–127`.
- Proposed: emit `policy.configPath` (resolved), `policy.configSha256`, and `policy.externalOverride` (boolean). See T2.

### F2 — HIGH (inference, not executed): the committed config refuses a 64-spawn wave

- `ufo-fsd-alpha/config/ufo.json:83–91` at HEAD: `maxLanes 100`, `minLanes 16`, `waveMinLanes 16`, `waveMaxLanes 32`.
- Git history: `5ace2559` (2026-10-08) set band 32–100 (`minLanes 64`, `waveMinLanes 32`, `waveMaxLanes 100`). `c90bbcff` (2026-10-19 19:02 −03:00, operator) set 16–32 / `minLanes 16`. `config/ufo.json` is clean in the working tree.
- Code path: `laneFloor = policyFloor` (`ufo-swarm-wave.mjs:958`), `laneCeiling = min(policyCeiling, cap)` (`:959`), `wave_too_wide` when `total > laneCeiling` (`:980–985`). With HEAD values, `laneCeiling = min(32, 64) = 32`, so 64 spawns is refused as `wave_too_wide`.
- This is code reading only. I did not run the validator. T1 is the falsifiable check.

### F3 — MEDIUM: shared context contradicts executor lane bounds

- Spec and taskCall context (`spec.json:3`; `validation.json:421`): "Leaves only; no delegation".
- Executor lane text, emitted per seat (`ufo-swarm-wave.mjs:724–726`): "Lane bounds: leaf member — no subagent dispatch except your single labrat."
- Campaign §6 explicitly allows one read-only labrat per executor (`tabi-round-15.md:204–206`; `config.yml:117` `maxRecursionDepth: 3`).
- Three seats are affected: `MetadataEnforce`, `CounterDiagnostics`, `MeasureContracts`. Wave 1 is already dispatched, so this is a wave-2 context fix plus a note in the report. Do not re-dispatch wave 1.

### F4 — MEDIUM: routing is not reproducible from on-disk config

- `~/.omp/agent/config.yml:118–133` (`task.agentModelOverrides`): every role resolves to `@m_flash` except `critic`, `planner`, `main` → `@m_strong`.
- Applied routes (`dispatch-result.json`) match the campaign map instead (see Verified facts). The applied map therefore came from session-level overrides, per `tabi-round-15.md:194–195`. Those overrides are not recorded in any wave artifact.
- Action: for wave 2, verify `modelRole` in its `dispatch-result.json` against `tabi-round-15.md:194–197` before collection. Do not edit the global config (lane contract forbids route changes).

### F5 — LOW–MEDIUM: relative `Report:` trailer is the literal instruction a seat sees

- Renderer: `reportInstruction` returns `Report: write your scoped findings to ${reportDir}/${name}.md` (`ufo-swarm-wave.mjs:208–209`), appended at `:1133–1134`. `reportDir` is lane-relative.
- Mitigation exists: the context carries "Every `Report:` trailer path is relative to …/tabi-shokunin — write it at …/<that path>" (`spec.json:3`). Rules are satisfied for wave 1.
- Residual risk: the trailer itself stays relative. Proposed: emit an absolute trailer when `UFO_PROJECT_ROOT` is set (T3).

### F6 — LOW: role mix departs from the campaign suggestion

- `tabi-round-15.md:198–200` suggests roughly 28 executor / 16 scout / 8 connector / 16 reviewer / 8 scribe / 12 critic / 4 sentinel / 4 revenger for 96 lanes.
- Wave 1 has executor 3/64 (4.7% vs ~29%) and reviewer+critic 27/64 (42% vs ~29%).
- The prompt says "roughly", so this is advisory. The prompt also requires recording the seat count and mix in the report (`tabi-round-15.md:183–189`).

### F7 — LOW: planner seat rule holds

- No `planner` item in the spec. `SWARM_ROLES` excludes planner (`ufo-swarm-wave.mjs:246–248`). An unknown role is refused with `unknown_role` (`:913–915`).
- The L1 holds the planner seat. The campaign allows a planning data-walk on a scout, connector, or revenger (`tabi-round-15.md:190–193`). The report must name the item carrying it (candidates: `DerivePaths`, `RoundBaseline`, `LowestAxis`, all scouts).

### F8 — INFO: campaign arithmetic caps wave 1 at 96

- Wave 2 floor is 32 (v1, `ufo-wave-policy.json`: `waveMinLanes 32`, `waveMaxLanes 64`). Round total ≤128 (`tabi-round-15.md:169–173`).
- Therefore wave 1 ≤96. Wave 1 = 64 leaves wave 2 in [32, 64]. Any split with wave 1 in [64, 96] and wave 2 in [32, 64] satisfies both floors and the 128 total; the total reaches exactly 128 only at 96+32 or 64+64.
- A single wave cannot exceed 100 (`MAX_SWARM_LANES`, `ufo-mission-result.mjs:2462`).

## Inherited 32-seat limitation: where it still binds

| Source | Value | Binds? |
|---|---|---|
| HEAD `config/ufo.json:90` `waveMaxLanes` | 32 | Yes for any default run (F2) |
| `rounds/…/wave.plan.json`, `waves/round-12..14/w1/dispatch.json` `declaredMaxLanes` | 32 | Spec-level tightening; rounds 12–14 ran 32-seat waves |
| `ufo.json:98` `nativeProfiles.omp-native-v1.concurrencyCeiling` | 32 | Not read by `ufo-swarm-wave.mjs` (grep: no hit). Consumers not traced. Does not bind swarm width |
| `~/.omp/agent/config.yml:116` `task.maxConcurrency` | 100 | No (runtime cap is 100) |

Historical waves: rounds 12–14 used v1 (32–64) with `declaredMaxLanes 32`. Round 15 wave 1 used v2 (64–100) with `declaredMaxLanes 64`.

## Proposed tests

- **T1 (band boundary, validator):** with v2 values, 64 spawns → ok; 100 → ok; 101 → `too_many_lanes`. With HEAD values, 64 spawns → `wave_too_wide`; 32 → ok. With v1 values, 33 spawns → ok. Pins F2 and F8.
- **T2 (provenance, validator):** `plan` output includes `policy.configPath`, `policy.configSha256`, `policy.externalOverride`. A `UFO_CONFIG_PATH` outside the root without `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` → `EXEC_PATH_OUTSIDE_ROOT`. Pins F1.
- **T3 (trailer, validator):** with `UFO_PROJECT_ROOT` set, the rendered `Report:` trailer resolves to `<root>/<reportDir>/<name>.md` (absolute). Pins F5.
- **T4 (context consistency, validator):** a context containing "no delegation" combined with any executor item either fails with a typed error or derives both lane-bounds lines from one source. Pins F3.
- **T5 (campaign checker, lane-side, read-only, for L1):** given wave-1 count a and wave-2 count b, assert 64≤a≤100, 32≤b≤64, a+b≤128. Assert each wave's `dispatch-result.json` `modelRole` per agent matches `tabi-round-15.md:194–197`. Assert `policy.configPath`/hash matches the file named in the dispatch command. Pins F1, F4, F8.

## Commands L1 should run (not executed by this seat)

1. Wave-2 validation, v1, with the same env as the prompt:
   `UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 UFO_PROJECT_ROOT=/home/vgpnk/Projects/shokunin/tabi-shokunin node ~/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs plan --spec <w2-spec.json> --emit-tasks`
   (`plan` only; `run` persists the registry. Usage at `ufo-swarm-wave.mjs:43–52`, `:1328`.)
2. Pin the policy bytes used for wave 1 and wave 2: `sha256sum /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json` and `…/ufo-wave-policy.json`. Record in the report (closes F1 manually).
3. Pin the committed config: `git -C /home/vgpnk/Projects/ufo-fsd-alpha show c90bbcff:config/ufo.json | sha256sum`.
4. After collection: re-query `dispatch-result.json` `modelRole` per agent (F4) and per-seat `status`.
5. Record the wave-1 seat count (64), wave-2 count, round total, role mix, and the planner-data-walk item (F6, F7) in the round report.
6. Decide the F3 wording before wave 2 dispatch; the context must state the executor labrat exception explicitly.

## Verification gaps

- F2 is inference from code and git. Not run. T1 is the falsifiable check.
- `ufo-swarm-wave.test.mjs` exists in `ufo-fsd-alpha/scripts/` but was not read.
- Session-level `agentModelOverrides` are not visible to this seat. F4 rests on `dispatch-result.json`.
- Validator exit code not recorded for wave 1.
- Whether seat tool roots start at the fleet root was not tested (campaign warns they do).
- Consumers of `omp-native-v1.concurrencyCeiling` were not traced beyond the swarm validator.
- Wave 1 seats were `pending` at read time. No outcomes are asserted here.

## Sources

- `.ufo/waves/round-15/w1/spec.json:3, 8–323`
- `.ufo/waves/round-15/w1/validation.json:4–20, 421, 649–651`
- `.ufo/waves/round-15/w1/dispatch-result.json` (`details.progress`)
- `.ufo/prompts/tabi-round-15.md:169–215` (shokunin root)
- `scripts/hyaku/ufo-wave-policy.json`, `scripts/hyaku/ufo-wave-policy-v2.json` (shokunin root; `sighting.dispatch.swarm`)
- `~/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs:43–52, 125–127, 208–209, 246–248, 724–726, 913–915, 957–985, 1133–1134, 1210–1225, 1328`
- `~/Projects/ufo-fsd-alpha/scripts/ufo-mission-result.mjs:2146, 2163–2179, 2462`
- `~/Projects/ufo-fsd-alpha/config/ufo.json:83–91, 98`
- `~/.omp/agent/config.yml:116–133` (routing block; no credentials read)
- `git -C ~/Projects/ufo-fsd-alpha log/show`: `5ace2559`, `c90bbcff`
- `.ufo/waves/round-12..14/w1/dispatch.json`, `.ufo/waves/round-15/before.json`
