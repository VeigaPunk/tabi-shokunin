# W2Waves — round 23 wave accounting from bytes (attempt 1)

Seat: L1Tabi23.W2Waves. Read-only: no tracked-file edits, no git/jj writes, no spawns, no messages, no installs.
Bytes read: `w1-spec.json`, `w2-spec.json`, `w1/w2-dispatch.json`, `w1/w2-record.json`, `w1/w2-spawn-result.json`,
`w1/w2/swarm-registry.json`, `scripts/hyaku/ufo-wave-policy{,-v2}.json`, `history://` roster, `w2/` listing.

**Verdict: PASS on the arithmetic** — 44 + 44 = 88 seats (band 32–64 both, round ≤128), both registries hold exactly the
spec's 44 names/roles with unique disjoint ids, the dispatch policy block is identical in both waves and grounds in
`ufo-wave-policy.json`, and wave-2 attack roles are 37/44 = 84.1 %. One receipt is unbound: `w2-spawn-result.json`
names wave-1 identities, so it must not be cited as evidence of the wave-2 spawn.

## Findings

1. **Seat counts (pass).** w1 = 44, w2 = 44, round = 88.
 `cd …/round-23 && node -e 'const s1=require("./w1-spec.json"),s2=require("./w2-spec.json");console.log("A seats w1/w2/total:",s1.items.length,s2.items.length,s1.items.length+s2.items.length)'` →
 `A seats w1/w2/total: 44 44 88`.

2. **Band and round ceiling (pass).** 44 ∈ [32,64] twice; 88 ≤ 128.
 `cd …/round-23 && node -e 'const s1=require("./w1-spec.json"),s2=require("./w2-spec.json");console.log("B band32-64:",s1.items.length>=32&&s1.items.length<=64,s2.items.length>=32&&s2.items.length<=64,"total<=128:",s1.items.length+s2.items.length<=128)'` →
 `B band32-64: true true total<=128: true`.

3. **Registries bind to the specs (pass).** On-disk registries: 44 members each, name sets identical to the spec item
 names, roles equal item-by-item (0 mismatches), 44 unique non-null agent ids per wave, and the two waves' id sets are
 disjoint (`L1Tabi23.<item>`).
 `cd …/round-23 && node -e '…new Set(Object.values(r1.members).map(m=>m.agentId)).size===44, …'` → `C disk registry w1/w2: 44 44 names==spec: true true ids unique: true true disjoint ids: true`.
 Role equality: `node -e '…spec.items.filter(i=>rec.members[i.name].role!==i.role)…'` → `role mismatches: 0` both waves.

4. **Dispatch counts agree with payload and registry (pass).** `counts.spawn` 44 / `resume` 0 / `total` 44 in both
 waves, `taskCall.tasks` 44, embedded registry members 44; spec `maxLanes` 44 = `declaredMaxLanes` 44 (no
 over-declaration). Each task = `/skill:godspeed\n\n` + the spec prompt (prompt ⊆ task 44/44 both waves) + a
 role-derived suffix; 44/44 wave-2 and 36/44 wave-1 trailers name `reportDir/<item>.md` exactly.
 `cd …/round-23 && node -e '…console.log("E counts vs tasks:",JSON.stringify(d1.counts),d1.taskCall.tasks.length,JSON.stringify(d2.counts),d2.taskCall.tasks.length,"spec maxLanes:",s1.maxLanes,s2.maxLanes)'` →
 `E counts vs tasks: {"spawn":44,"resume":0,"total":44} 44 {"spawn":44,"resume":0,"total":44} 44 spec maxLanes: 44 44`.

5. **Dispatch policy block (pass, with a stale note in its source).** Both blocks are byte-identical:
 `{"source":"config","maxLanes":44,"minLanes":16,"waveMinLanes":32,"waveMaxLanes":64,"declaredMaxLanes":44,"hardCeiling":256,"rampBatchSize":5,"rampIntervalMs":700,"globalRunnerCeiling":1056}`.
 Every number except the round-local 44s grounds in `scripts/hyaku/ufo-wave-policy.json` `sighting.dispatch`
 (`minLanes 16`, `waveMinLanes 32`, `waveMaxLanes 64`, `swarm.maxLanes 256`, `globalRunnerCeiling 1056`, ramp 5/700).
 `cd …/round-23 && node -e '…console.log("D policy equal:",…)'` → `D policy equal: true`;
 grounding: `cd /home/vgpnk/Projects/shokunin && node -e 'console.log(JSON.stringify(require("./scripts/hyaku/ufo-wave-policy.json").sighting.dispatch.swarm))'`.
 Caveat: that file's own note still says "maxLanes 100 unchanged" while its numeric `swarm.maxLanes` is 256 — hardCeiling 256 is grounded in the numeric, not the note.

6. **Role mix (pass).** Wave 2: reviewer 28, critic 6, mutation-tester 3, sentinel 2, revenger 2, simplifier 1,
 scout 2 — attack roles (reviewer+critic+mutation-tester, the fleet round-23 convention: kasegi r23 counts 9+7+3 = 19/36)
 = 37/44 = **84.1 % ≥ 25 %**. No executor/scribe production seat exists in wave 2.
 `cd …/round-23 && node -e '…const atk=r=>["reviewer","critic","mutation-tester"].reduce((a,k)=>a+(r[k]||0),0); …'` →
 `F roles w2: {"reviewer":28,"mutation-tester":3,"critic":6,"sentinel":2,"revenger":2,"simplifier":1,"scout":2} attack 37 / 44 = 84.1%`.

7. **DEFECT (medium) — the wave-2 spawn receipt names wave-1 agents.** `w2-spawn-result.json` (`at`
 2026-10-25T07:25:54.078Z) contains 44 unique `L1Tabi23.<name>` identities, **0** of them wave-2, and its body differs
 from `w1-spawn-result.json` (07:20:08.273Z) in **exactly one line** — line 0, the role sentence. Its role sentence is
 wave-2's (`reviewer, critic, mutation-tester, sentinel, revenger, simplifier, scout`), so the file was regenerated at
 line 0 only while the 44 job identities stayed wave-1's. The on-disk registry is correct (44 `W2*` ids, updated
 07:26:10.821Z) and the roster shows those 44 `L1Tabi23.W2*` agents running, i.e. the spawn did happen — the receipt
 just does not evidence it. Do not cite this file as wave-2 spawn evidence; a later reader reconciling 44 + 44 would
 otherwise double-count wave-1 identities.
 `cd …/round-23 && node -e '…const ids=x=>new Set([...x.matchAll(/L1Tabi23\.([A-Za-z0-9]+)/g)].map(m=>m[1])); console.log("H …","w2 W2-prefixed:",[...ids(b)].filter(x=>x.startsWith("W2")).length); console.log("I receipt differs in lines:",a.split("\n").filter((l,i)=>l!==b.split("\n")[i]).length)'` →
 `H spawn receipts unique ids w1: 44 w2: 44 same id set: true w2 W2-prefixed: 0` / `I receipt differs in lines: 1`.

8. **Low — 8 wave-1 executor tasks carry a nested-agent clause absent from the spec.** Those 8 tasks end
 `Lane bounds: leaf member — no subagent dispatch except your single labrat.`; no spec prompt mentions "labrat"
 (0/44) and the wave context says "no nested swarms". The clause is role-derived and matches the fleet policy note
 ("The executor card explicitly permits only labrat"), and at read time no roster entry had a seat as its parent, so no
 labrat spawn is observed — but a labrat would be an agent outside the 44-member registry and therefore outside this
 accounting.
 `cd …/round-23 && node -e '…spec.items.forEach((it,i)=>{const t=d.taskCall.tasks[i].task; const exp="…"+it.name+".md"; if(!t.endsWith(exp)) console.log("--",it.name,…)}'` → 8 blocks, all `Exec*`, vs `w1 tasks with exact trailer: 36 / 44`.

9. **Low — registry shape drift under the same `ufo-swarm-registry-v1` schema.** Tabi's members carry only
 `kind,agentId,role,item` with `item: null` for all 44 in both waves; earlier dispatches under that schema carried
 `kind,agentId,role,item,axes,milestone` with `item` populated. Consequence: seat↔item/axis binding cannot be read
 from the registry, only from names.
 `cd /home/vgpnk/Projects/shokunin && node -e '…".ufo/waves/shokunin-train-20261013/dispatch.json"… console.log(p,"members",Object.keys(m).length,…)'` → `members 26 … "item":"audio/r62/scout","axes":["expansion","quality","discernment"],"milestone":…`;
 tabi: `cd …/round-23 && node -e 'console.log(JSON.stringify(Object.entries(require("./w2/swarm-registry.json").members)[0]))'`.

10. **Residual (not a defect under the declared policy) — the round runs under policy v1, not v2.** The dispatch
 declares band 32–64 (= `ufo-wave-policy.json`, v1). `ufo-wave-policy-v2.json` (committed 2cc78e45, 2026-10-22) sets
 `waveMinLanes 64 / waveMaxLanes 128`, so 44/wave sits 20 below v2's floor; v2's own note says "v1 … stays for rounds
 dispatched under it", which is the only reason this is a residual and not a failure. Fleet hyaku waves in the same
 directory use a third block (64–100).
 `cd /home/vgpnk/Projects/shokunin && node -e 'for (const f of ["scripts/hyaku/ufo-wave-policy.json","scripts/hyaku/ufo-wave-policy-v2.json"]) console.log(f,JSON.stringify(require("./"+f).sighting.dispatch.swarm))'` → v1 `waveMinLanes:32,waveMaxLanes:64`, v2 `waveMinLanes:64,waveMaxLanes:128`;
 `git log -1 --format='%h %ad %s' --date=iso -- scripts/hyaku/ufo-wave-policy-v2.json` → `2cc78e45 2026-10-22 … v2 wave band 64-128, round total 32-128`.

11. **Verification gap — wave-2 completion is not yet byte-checkable.** `w2/` holds only `swarm-registry.json` (0 `.md`
 reports) at check time, so no wave-2 seat output can be reconciled. Wave 1 is complete: 44 reports, basenames exactly
 the 44 registry names, 306,112 bytes total.
 `cd …/round-23 && ls w2/*.md | wc -l` → `0`; `node -e '…const files=fs.readdirSync("w1")…console.log("report basenames == registry names:",…)…'` → `w1 reports 44 registry 44` / `report basenames == registry names: true` / `missing reports: [] extra reports: []`.

12. **Observation — compaction block is zeroed on real payloads.** `payloadBytesBefore/After = 0` while the dispatch
 files are 87,681 B (w1) and 68,632 B (w2); the same zeroed block appears in older fleet dispatches with non-empty
 payloads, so this is a schema-wide telemetry artifact, not a round-23 anomaly.
 `cd …/round-23 && node -e '…console.log(JSON.stringify(j.compaction))'` → `{"applied":false,"mechanism":null,"reason":null,"savedBytes":0,"payloadBytesBefore":0,"payloadBytesAfter":0}` both waves.

## Residual risk

- Finding 7 means the only receipt naming 44 spawns for wave 2 is wave-1's text; the registry and live roster are the
 load-bearing evidence. If a closure counts spawns by receipt contents, it will under-report wave 2 as zero.
- The 88-seat total is compliant with the declared band and the ≤128 item ceiling, but not with v2's 64-per-wave
 floor; a policy-version change retroactively makes this round non-compliant (finding 10).
- No labrat is observed, but nothing in the registry fields prevents one from being invisible to the 44-seat count.
- Tools installed: none (no pacman/uv/npx use).
