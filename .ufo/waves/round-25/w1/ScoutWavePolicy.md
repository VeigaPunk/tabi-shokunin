# ScoutWavePolicy — round 25, wave 1 (read-only scout)

Verdict: all three wave-policy facts hold. Validator present. Every role in the route table resolves to `@m_flash`. Caveat: `w1-dispatch.json` records the upstream default band (32–256), not the hyaku v1 band (32–64). See "Wave 1 was NOT dispatched under hyaku v1".

## Observed facts

**F1. Wave policy v1 swarm block**: `maxLanes 256`, `minLanes 16`, `waveMinLanes 32`, `waveMaxLanes 64`, `rampBatchSize 5`, `rampIntervalMs 700`.
- Cmd: `node -e 'const p=require("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json");console.log(JSON.stringify(p.sighting.dispatch.swarm,null,1))'`
- Location: `scripts/hyaku/ufo-wave-policy.json`, lines 83–90 (`"swarm": {` at 83, `"maxLanes": 256` at 84, `waveMinLanes` at 89, `waveMaxLanes` at 90). Found by grep `waveMinLanes|waveMaxLanes|maxLanes`.
- sha256 `b5f635af526c8af7aef2c3aef8ec950a8f2495cf715ebe3fc3b64f0b5225816d`. The fleet repo HEAD is `a409e65dfaef0b4441c0643b0f57f5a7432a4c47`. `git status --porcelain -- scripts/hyaku/ufo-wave-policy.json` printed nothing, so the file is clean.
- Last commit to touch the file: `2cc78e45` (2026-10-22T15:56:33-03:00), "hyaku: operator raises swarm limits (maxLanes 256, …)". Its diff contains `-"maxLanes": 100,` and `+"maxLanes": 256,`. The commit before it is `c030d1f0` (2026-10-19). Cmd: `git log --format='%h %cI %s' -5 -- scripts/hyaku/ufo-wave-policy.json; git show 2cc78e4 -- scripts/hyaku/ufo-wave-policy.json | rg -n 'maxLanes|wave(Min|Max)Lanes'`.

**F2. Validator exists**: `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`.
- Cmd: `ls -l …` → `-rwxr-xr-x 107309 bytes, Oct 24 21:55`. sha256 `9dbd91aaa26f9c5804db8a59538d4c27e20af91165601c9048025192322e8322`.
- The validator reads `maxLanes`, `waveMinLanes` and `waveMaxLanes` from config (lines 822, 836–848). It clamps the cap as `Math.min(policy.maxLanes, MAX_SWARM_LANES)` (line 836) and rejects an inverted band with `invalid_policy` (line 848).
- Hard ceiling: `MAX_SWARM_LANES = 256` and `MIN_SWARM_LANES = 2`, at `ufo-fsd-alpha/scripts/ufo-mission-result.mjs:2572-2573`. Cmd: `rg -n 'export const (MAX|MIN)_SWARM_LANES' …/ufo-mission-result.mjs`. So the policy's `maxLanes 256` equals the hard ceiling and does not exceed it.

**F3. Route table** (`/home/vgpnk/.omp/agent/config.yml`, `task.agentModelOverrides`, lines 357–375; sha256 `def1ba11422fdae40d97a376feb355bbb7c26e6d7648e6691a88ff9bea12c17b`). Found by grep `agentModelOverrides -A40`. The config was read only; nothing was edited.

| role | alias |
|---|---|
| task, main, executor, planner, labrat, mutation-tester, sentinel, simplifier, revenger, scout, sonic, scribe, distiller, seance, critic, reviewer, connector, security-reviewer | `@m_flash` |

One-line form: `task|main|executor|planner|labrat|mutation-tester|sentinel|simplifier|revenger|scout|sonic|scribe|distiller|seance|critic|reviewer|connector|security-reviewer -> @m_flash` (18 roles, 1 alias).

- Alias resolution: line 344 is `m_flash: commandcode/deepseek/deepseek-v4.1-flash:high`. The `retry.fallbackChains.m_flash` list (lines 492–495) is `charm-hyper/deepseek-v4.1-flash → opencode-go/deepseek-v4.1-flash → devin/deepseek-v4-1-flash …`. Cmd: `rg -n -A3 '^\s*m_flash:' /home/vgpnk/.omp/agent/config.yml`.
- Same block (lines 355–356): `maxConcurrency: 400`, `maxRecursionDepth: 3`.

**F4. Wave 1 fits the band**: `w1-spec.json` has 34 items and `maxLanes 34`, which is inside 32..64. No `modelAlias` key is set, so routing comes from the global table in F3. Cmd: `node -e 'const s=require(".../round-25/w1-spec.json");console.log((s.items||[]).length,s.maxLanes,s.modelAlias)'` → `34 34 undefined`.

## Discrepancy (observed)
- The policy file's own `note` field still says "copy of ufo-fsd-alpha config/ufo.json with only the wave band changed (16-32 -> 32-64); **maxLanes 100 unchanged**". The actual value is 256, raised by commit `2cc78e45`. The note is stale prose and does not affect the effective value, but anyone quoting the note would get maxLanes wrong.
- Upstream `ufo-fsd-alpha/config/ufo.json` lines 85–91 are `maxLanes 256`, `waveMinLanes 32`, `waveMaxLanes 256`. The hyaku v1 policy narrows `waveMaxLanes` to 64, which is a tightening. Cmd: `rg -n 'maxLanes|wave(Min|Max)Lanes' /home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`.
- A sibling `scripts/hyaku/ufo-wave-policy-v2.json` exists with band 64–128. `lane-addendum.md:51-75` selects v1 or v2 through `UFO_CONFIG_PATH`.

## Wave 1 was NOT dispatched under hyaku v1 (observed)
The validator wrote `w1-dispatch.json`. Its `policy` block records `minLanes 32`, `waveMinLanes 32`, `waveMaxLanes 256`, `hardCeiling 256`, `declaredMaxLanes 34`, and `globalRunnerCeiling 1056`.
- Cmd: `node -e 'const d=require(".../round-25/w1-dispatch.json");const{items,lanes,tasks,...rest}=d;console.log(JSON.stringify(rest,null,1).slice(0,1500))'`.

The swarm values of the three candidate policy files are:

| file | minLanes | waveMinLanes | waveMaxLanes | maxLanes |
|---|---|---|---|---|
| `ufo-fsd-alpha/config/ufo.json` (validator default) | 32 | 32 | **256** | 256 |
| `shokunin/scripts/hyaku/ufo-wave-policy.json` (v1) | 16 | 32 | **64** | 256 |
| `shokunin/scripts/hyaku/ufo-wave-policy-v2.json` | 16 | 64 | 128 | 256 |

Cmd: a `node -e` loop that prints `sighting.dispatch.swarm` for each file.

- The dispatch block (`minLanes 32`, `waveMaxLanes 256`) matches the upstream default on every field. It contradicts v1 on `minLanes` (16) and on `waveMaxLanes` (64).
- How the config path is chosen: `ufo-swarm-wave.mjs:143` calls `gatedConfigPath(ROOT, process.env.UFO_CONFIG_PATH, join(ROOT,"config","ufo.json"), "UFO_CONFIG_PATH")`. `ROOT` (line 129–131) is `UFO_PROJECT_ROOT`, or the validator's own repo root when that is unset. In `ufo-mission-result.mjs:2272-2283`, an override that resolves outside `ROOT` **throws** unless `ALLOW_EXTERNAL_TOOLS` is set. It does not silently fall back to the default.
- [INFERENCE] Because an outside-root override throws, the observed values mean the wave-1 validation ran with `UFO_CONFIG_PATH` unset, so the default `config/ufo.json` applied. The hyaku `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json` named in `lane-addendum.md:71` was not used. A second possibility: it ran with `ALLOW_EXTERNAL_TOOLS` set and the path pointed at a file with upstream values. Nothing I observed distinguishes these two cases.
- Impact: wave 1 has 34 lanes. That is inside both the v1 band (32–64) and the upstream band (32–256), so the lane count passes either policy. However, the recorded band ceiling is 256, not the 64 the round claims. Any statement that "wave 1 was validated under policy v1, band 32–64" is unsupported by `w1-dispatch.json`. The L1 SHOULD re-validate with `UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json` set, plus whatever root or escape flag the gate requires, or else record that the upstream default was used.

## Unknowns
- The exact environment (`UFO_CONFIG_PATH`, `UFO_PROJECT_ROOT`, `ALLOW_EXTERNAL_TOOLS`) of the wave-1 validator run. No dispatch log I read records it.
- The provider actually serving each seat at runtime: the primary model vs one of the fallback-chain entries.

## Tooling
No installs or updates. No validator runs, no builds, no git or jj writes. The only file written is this report.
