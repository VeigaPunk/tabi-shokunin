# D2 — c2-wave-caps ground truth (round 23, baseline a89f193)

**Verdict: CONFIRMED, with one addition the prose omits.** W2b = **65** seats against `waveMaxLanes: 64` (spec `maxLanes`, `items` length and registry `members` all agree on 65); round-22 spawned total = **129** (64 + 0 + 65) against the ≤128 round cap; round-21 control = **128** (64 + 64), exactly at cap, not over. **Addition:** the wave *passed validation* because its validation record's own band was `[waveMinLanes 64, waveMaxLanes 100]`, not `[32, 64]` — the defect is a band substitution, and 65 ≤ 100 is why nothing refused it.

## 1. Derived figures (every number from the command shown)

`C1` policy band (authority): `python3 -c "import json;print(json.load(open('scripts/hyaku/ufo-wave-policy.json'))['sighting']['dispatch']['swarm'])"`
→ `waveMinLanes 32, waveMaxLanes 64, maxLanes 256, minLanes 16`; v2: `waveMinLanes 64, waveMaxLanes 128`.

`C2` line anchors: `grep -n 'seats in total' scripts/hyaku/lane-addendum.md` → `:42 "Swarm: each round is 32–128 seats in total"`; `grep -n 'stay ≤128' …` → `:52 "the two waves together stay ≤128 seats"`. **The round cap exists only in this prose — no JSON field anywhere carries 128** (`grep -rn '≤128|roundMax|roundMaxLanes' scripts/hyaku/*.json` → no hit).

`C3` per-wave figures (`python3` over `.ufo/waves/round-22`):
| wave | spec.maxLanes | len(items) | val.policy.waveMaxLanes | val.counts.spawn | registry.members | spawned (receipt) |
|---|---|---|---|---|---|---|
| w1 | 64 | 64 | 100 | 64 | 64 | 64 |
| w2 | 64 | 64 | 100 | 64 (never spawned) | 64 | 0 (refused) |
| w2b | **65** | **65** | 100 | 65 | **65** | **65** |

`C4` spawned receipts: `grep -rhoE 'Spawned [0-9]+ background agents' .ufo/waves/round-22` → `3× "Spawned 64"`, `3× "Spawned 65"`. Three of the six are **review prose** (`w2b/CriticWaveConformance.md`, `w2b/ScoutRegistry.md`, `w2b/ScoutPredecessorClaims.md`); only `w1-spawn-result.json` and `w2b-spawn-result.json` are receipts. `w2-spawn-result.json` has no marker and carries `Background job limit reached (100)` → spawned 0, while its `validation.counts.spawn` still says 64 (declared, not actual). `129 = 64+0+65`.

`C5` effective band: `sed -n '3,8p' .ufo/waves/round-22/w2b-validation.json` → `source: "config", maxLanes 65, minLanes 16, waveMinLanes 64, waveMaxLanes 100, declaredMaxLanes 65`; `:17 "spawn": 65`. So the validator graded 65 against a `[64,100]` band — it would have **refused a compliant 64-seat wave** on the floor and **admitted 65–100** on the ceiling.

`C6` round-21 control: `grep -rlE 'Spawned [0-9]+ background agents' .ufo/waves/round-21` → `w1-task-result.json`, `w2-task-result.json`, `2× "Spawned 64"` → 128, not >128. Round-21 has **no** `*-validation.json` and no `*-spawn-result.json` (`ls .ufo/waves/round-21 | grep -E 'spawn|validation|registry'` → empty).

## 2. Fields a detector must read (committed bytes only)
- Policy authority: `scripts/hyaku/ufo-wave-policy.json` → `.sighting.dispatch.swarm.{waveMinLanes,waveMaxLanes}`; `-v2.json` for v2-shaped rounds.
- Round cap: **no field** — prose `scripts/hyaku/lane-addendum.md:42,52` (=128) or a literal constant.
- Per stem over `glob('.ufo/waves/round-N/*-spec.json')`: `.maxLanes`, `.items.length`; `<stem>-validation.json` → `.policy.{source,waveMinLanes,waveMaxLanes,declaredMaxLanes}`, `.counts.{spawn,total}`; `<stem>/swarm-registry.json` → `keys(.members).length`; receipt `<stem>-spawn-result.json` | `<stem>-task-result.json` → `.text` matching `Spawned (\d+) background agents` (w2b also `.spawnedSeats`).
- Never: `.context` prose, review reports, `validation.counts` for the round total.

## 3. Minimal deterministic rule (pseudocode, bytes only)
```
band = policy.v1.swarm | policy.v2.swarm   // by round shape, else v1
cap  = 128                                  // prose-constant, lane-addendum:42,52
findings = []
total = 0
for spec in glob(roundDir/*-spec.json):
  stem = basename(spec) - "-spec.json"
  for v,limit in [(spec.maxLanes, band.waveMaxLanes), (len(spec.items), band.waveMaxLanes),
                  (len(registry[stem].members), spec.maxLanes),
                  (validation[stem].policy.waveMaxLanes, band.waveMaxLanes)]:
      if v > limit: findings.push({class:"c2-wave-caps", cited:limit, derived:v, evidence:[file,field]})
  if spec.maxLanes < band.waveMinLanes: findings.push(...)
  n = first receipt of [stem+"-spawn-result.json", stem+"-task-result.json"]:
        match /Spawned (\d+) background agents/ -> int, else (refusal-marker ? 0 : UNKNOWN)
  if n is UNKNOWN: findings.push({class:"c2-wave-caps", derived:"spawn-count-uncommitted"})
  total += n
if total > cap: findings.push({class:"c2-wave-caps", cited:cap, derived:total})
clean = findings.empty
```
Expected on round-22: two problems (`w2b-spec.json maxLanes 65 > 64`, `round total 129 > 128`), derived 129, one class. Round-21: 0. Deterministic, no clock, no prose parsing beyond the cap constant.

## 4. Fixtures
- **RED** (trips only c2): `round-90/` with `w1-spec.json {maxLanes:64, 64 items}` + `w1-spawn-result.json "Spawned 64 background agents"` + `w1/swarm-registry.json` 64 members; `w2b-spec.json {maxLanes:65, 65 items}` + `w2b-spawn-result.json "Spawned 65…"` + `w2b/swarm-registry.json` 65 members; policy band 32/64, cap 128. Expect exactly one `c2-wave-caps` finding whose derived total is 129 and whose evidence names `w2b-spec.json:maxLanes 65 > 64` **and** `129 > 128`.
- **GREEN** (clears c2): same shape, `w2b` replaced by `w2-spec.json {maxLanes:64, 64 items}` + `"Spawned 64"` + 64 members → total 128, cap 128 **not exceeded**; also add a refused wave whose receipt lacks the marker to prove 0-vs-refusal is not a finding.

## 5. Brittleness / ambiguity (named)
1. **Round cap has no machine field** — a fully byte-derived detector cannot read 128; it must hardcode or parse markdown. Any CLI default of `null` silently disables the check (fail-open), and the frozen API `--rev/--round/--json` has no slot for it.
2. **Two policy surfaces.** Reading `validation.policy.waveMaxLanes` (100) yields **no** finding for 65 → false negative. The detector must read the fleet policy, then also require `validation.policy.waveMaxLanes == band.waveMaxLanes` and `waveMinLanes == band.waveMinLanes`; that equality check is the only thing that catches the mechanism, not just the symptom.
3. **Spawn-marker fragility.** The marker is human text (JSON `.text` string or raw file body); the same regex matches review prose — summing all hits gives 64×3+65×3. Must scope to the wave's own receipt and take one count per wave.
4. **Receipt naming is not uniform.** Round-21 uses `w1-task-result.json`; round-22 uses `w1-spawn-result.json`. An existence-only candidate list returns 0 for round-21, making the control pass **vacuously** (0 ≤ 128) rather than by deriving 128.
5. **Zero and absent are conflated.** `w2-spawn-result.json` is a whole-payload refusal (no marker) and `validation.counts.spawn` says 64; `w2b`'s registry has 65 members with **0** `agentId`s. A detector that treats "no marker" as 0 cannot distinguish a refused wave from an uncommitted one, and declared vs spawned changes the cited figure (193 declared vs 129 spawned; both exceed, different numbers).
6. **Band selection.** A v2 round legitimately allows `waveMaxLanes 128`; a hardcoded 64 false-positives. Nothing in a spec names its policy version — the spec's keys are only `{wave, context, reportDir, maxLanes, items}` — so v1/v2 is inferred from the round's own record, which is itself defect-bearing.
7. **Units.** `maxLanes`, `items.length`, `registry.members` can disagree (here all 65); each must be checked against its own limit, since `items > maxLanes` and `members > maxLanes` fire in different mutant directions than the band check.
