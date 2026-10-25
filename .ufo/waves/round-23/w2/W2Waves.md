# W2Waves — round 23 wave accounting from bytes (attempt 1)

Seat L1Tabi23.W2Waves. Read-only; no tracked edits, no git/jj writes, no spawns, no messages, no installs (nothing installed).
Bytes: `w1/w2-spec.json`, `w1/w2-dispatch.json`, `w1/w2-record.json`, `w1/w2-spawn-result.json`, `w1|w2/swarm-registry.json`, `scripts/hyaku/ufo-wave-policy{,-v2}.json`, roster `history://`. Snapshot 2026-10-25T07:33:23Z.

**Verdict: PASS on seat arithmetic, registry binding, dispatch policy block and role mix** (44 + 44 = 88; both waves in
32–64; registries hold exactly the 44 spec names/roles with unique disjoint ids; attack roles 37/44 = 84.1 %), with one
medium **provenance** finding: `w2-spawn-result.json` was replaced after a version that named the 44 wave-1 identities.

## Findings

1. **Seat counts (pass).** w1 44, w2 44, round 88.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const s=require("./w1-spec.json"),t=require("./w2-spec.json");console.log(s.items.length,t.items.length,s.items.length+t.items.length)'` → `44 44 88`.

2. **Band and round ceiling (pass, under the declared 32–64 band).** 44 ∈ [32,64] twice; 88 ≤ 128.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const s=require("./w1-spec.json"),t=require("./w2-spec.json");console.log(s.items.length>=32&&s.items.length<=64,t.items.length>=32&&t.items.length<=64,s.items.length+t.items.length<=128)'` → `true true true`.

3. **Registries equal the specs (pass).** On-disk registries: 44 members each, name sets identical to the spec items,
 per-item roles equal, 44 unique non-null `L1Tabi23.<item>` ids per wave, waves' id sets disjoint.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const fs=require("fs"),s=[require("./w1-spec.json"),require("./w2-spec.json")],r=[1,2].map(w=>JSON.parse(fs.readFileSync("w"+w+"/swarm-registry.json","utf8")).members);s.forEach((x,i)=>{const n=Object.keys(r[i]);console.log("w"+i,i+1,n.length,n.sort().join("|")===x.items.map(y=>y.name).sort().join("|"),new Set(Object.values(r[i]).map(m=>m.agentId)).size,x.items.every(y=>r[i][y.name].role===y.role))})'` → `w0 1 44 true 44 true` / `w1 2 44 true 44 true`.

4. **Dispatch counts agree with payload and registry (pass).** `counts.spawn`/`total` 44, `taskCall.tasks` 44, embedded
 registry 44 in both waves; spec `maxLanes` 44 = `declaredMaxLanes` 44 (no over-declaration); spec prompt is a substring
 of each task 44/44 both waves (task = `/skill:godspeed\n\n` + prompt + role suffix).
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const a=require("./w1-dispatch.json"),b=require("./w2-dispatch.json");console.log(a.counts.spawn,a.taskCall.tasks.length,Object.keys(a.registry.members).length,b.counts.spawn,b.taskCall.tasks.length,Object.keys(b.registry.members).length)'` → `44 44 44 44 44 44`.

5. **Dispatch policy block (pass; its source's prose is stale).** Blocks byte-identical in both waves:
 `{"source":"config","maxLanes":44,"minLanes":16,"waveMinLanes":32,"waveMaxLanes":64,"declaredMaxLanes":44,"hardCeiling":256,"rampBatchSize":5,"rampIntervalMs":700,"globalRunnerCeiling":1056}`; every non-round-local number grounds in `ufo-wave-policy.json` `sighting.dispatch` (`16 32 64 256 1056 5 700`). The file's own note still says "maxLanes 100 unchanged" while its numeric `swarm.maxLanes` is 256 — hardCeiling 256 grounds in the numeric, not the note.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const a=require("./w1-dispatch.json"),b=require("./w2-dispatch.json");console.log(JSON.stringify(a.policy)===JSON.stringify(b.policy),a.policy.waveMinLanes,a.policy.waveMaxLanes,a.policy.hardCeiling,a.policy.globalRunnerCeiling,a.policy.declaredMaxLanes,a.policy.maxLanes)'` → `true 32 64 256 1056 44 44`;
 `node -e 'const p=require("/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json").sighting.dispatch;console.log(p.swarm.minLanes,p.swarm.waveMinLanes,p.swarm.waveMaxLanes,p.swarm.maxLanes,p.globalRunnerCeiling,p.swarm.rampBatchSize,p.swarm.rampIntervalMs)'` → `16 32 64 256 1056 5 700`.

6. **Role mix (pass).** w2: reviewer 28, critic 6, mutation-tester 3, sentinel 2, revenger 2, simplifier 1, scout 2;
 attack roles (reviewer+critic+mutation-tester — the fleet convention, cf. kasegi r23 19/36) = 37/44 = **84.1 % ≥ 25 %**.
 No executor/scribe production seat exists in w2. w1 = 15/44 = 34.1 % (not required).
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const s=require("./w2-spec.json"),r={},k=["reviewer","critic","mutation-tester"];s.items.forEach(i=>r[i.role]=(r[i.role]||0)+1);console.log(JSON.stringify(r),k.reduce((a,x)=>a+r[x],0)+"/"+s.items.length)'` → `{"reviewer":28,"mutation-tester":3,"critic":6,"sentinel":2,"revenger":2,"simplifier":1,"scout":2} 37/44`.

7. **DEFECT (medium, provenance) — the wave-2 spawn receipt is not contemporaneous and its earlier bytes contradicted the accounting.** At 04:25 local the directory listing showed `w2-spawn-result.json` = 2,845 B, `at 2026-10-25T07:25:54.078Z`; that version listed 44 unique `L1Tabi23.*` ids that were **all wave-1's** (0 `W2*`), differing from `w1-spawn-result.json` in exactly one line (line 0, the role sentence) — i.e. only the count/role line was wave-2, the 44 identities were wave-1's. The file on disk now is 2,489 B, `at 2026-10-25T07:30:25.844Z`, and its ids are set-equal to the registry — written 4 min 15 s **after** the registry's spawn update (`w2/swarm-registry.json updatedAt 2026-10-25T07:26:10.821Z`). Current bytes pass (44 unique, == registry), but the receipt is a re-recording: it neither independently corroborates the spawn nor can be quoted as the wave-2 spawn output, and the wave-1 identity list was on disk while wave 2 was already taking reports.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const fs=require("fs"),b=require("./w2-spawn-result.json"),reg=require("./w2/swarm-registry.json");const ids=[...new Set([...b.result.text.matchAll(/L1Tabi23\.([\w]+)/g)].map(m=>m[1]))].sort(),rids=Object.values(reg.members).map(m=>m.agentId.replace("L1Tabi23.","")).sort();console.log("at",b.at,"unique",ids.length,"==registry",JSON.stringify(ids)===JSON.stringify(rids),"bytes",fs.statSync("w2-spawn-result.json").size,"mtime",fs.statSync("w2-spawn-result.json").mtime.toISOString())'` → `at 2026-10-25T07:30:25.844Z unique 44 ==registry true bytes 2489 mtime 2026-10-25T07:30:25.844Z`.

8. **Low — 8 wave-1 executor tasks carry a nested-agent clause the spec does not contain.** Those 8 end `Lane bounds: leaf member — no subagent dispatch except your single labrat.`; 0/44 spec prompts mention "labrat" and the w1 context says "Never spawn or delegate (no nested swarms)". The clause is role-derived and matches the fleet policy note ("The executor card explicitly permits only labrat"); no roster entry had a seat as parent, so no labrat is observed — but one would sit outside the 44-member registry and outside this accounting.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const s=require("./w1-spec.json"),d=require("./w1-dispatch.json");let e=0,l=0;s.items.forEach((it,i)=>{const t=d.taskCall.tasks[i].task;if(t.endsWith("\n\nLane bounds: leaf member — no subagent dispatch.\n\nReport: write your scoped findings to "+s.reportDir+"/"+it.name+".md"))e++;else if(/labrat/.test(t))l++;});console.log(e,l)'` → `36 8`.

9. **Low — registry member shape drift under the same `ufo-swarm-registry-v1` schema.** Tabi members carry only `kind,agentId,role,item` with `item` null for 44/44 in both waves; an earlier wave under that schema carried `kind,agentId,role,item,axes,milestone` with `item` populated — seat↔item/axis binding is readable only from names.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const m=require("./w2/swarm-registry.json").members;console.log(Object.keys(Object.values(m)[0]).join(","),Object.values(m).filter(x=>x.item===null).length)'` → `kind,agentId,role,item 44`;
 `node -e 'const m=require("/home/vgpnk/Projects/shokunin/.ufo/waves/shokunin-train-20261013/dispatch.json").registry.members;console.log(Object.keys(Object.values(m)[0]).join(","),JSON.stringify(Object.values(m)[0].item))'` → `kind,agentId,role,item,axes,milestone "audio/r62/scout"`.

10. **Residual (not a failure under the declared policy) — the round is a v1-band round.** The dispatch declares 32–64,
 which is `ufo-wave-policy.json`; `ufo-wave-policy-v2.json` (commit 2cc78e45, 2026-10-22) sets 64–128, so 44/wave is 20 below v2's floor. v2's note says "v1 … stays for rounds dispatched under it", which is why this stays a residual; fleet hyaku waves in the same tree use a third block (64–100).
 `node -e 'for (const f of ["/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json","/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json"]) {const s=require(f).sighting.dispatch.swarm;console.log(f.split("/").pop(),s.waveMinLanes,s.waveMaxLanes)}'` → `ufo-wave-policy.json 32 64` / `ufo-wave-policy-v2.json 64 128`;
 `git -C /home/vgpnk/Projects/shokunin log -1 --format='%h %ad %s' --date=iso -- scripts/hyaku/ufo-wave-policy-v2.json` → `2cc78e45 … hyaku: operator raises swarm limits (maxLanes 256, v2 wave band 64-128, round total 32-128)`.

11. **In flight — wave-2 output is partial and fully inside the registry.** At 07:33:23Z `w2/` holds 34 of 44 reports, all basenames in the registry, none foreign (missing: W2Determinism, W2SelfAudit, W2NoHarm, W2LandedCites, W2QuoteB, W2Mistakes, W2Simplifier, W2Log, W2Scorecard, W2Cheat); w1 is complete — 44 reports, basenames exactly the 44 registry names.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const fs=require("fs"),n=Object.keys(require("./w2/swarm-registry.json").members),f=fs.readdirSync("w2").filter(x=>x.endsWith(".md")).map(x=>x.slice(0,-3));console.log("w2 reports",f.length,"of",n.length,"all in registry",f.every(x=>n.includes(x)),"missing",n.filter(x=>!f.includes(x)).join(","))'` → `w2 reports 34 of 44 all in registry true missing …`;
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'const fs=require("fs"),n=Object.keys(require("./w1/swarm-registry.json").members),f=fs.readdirSync("w1").filter(x=>x.endsWith(".md")).map(x=>x.slice(0,-3));console.log(n.length,f.length,n.slice().sort().join("|")===f.slice().sort().join("|"))'` → `44 44 true`.

12. **Observation — compaction block zeroed on real payloads.** `payloadBytesBefore/After = 0` while the dispatch files are 87,681 B (w1) and 68,632 B (w2); older fleet dispatches show the same zeroed block with non-empty payloads, so this is a schema-wide telemetry artifact, not round-23-specific.
 `cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23 && node -e 'console.log(JSON.stringify(require("./w1-dispatch.json").compaction),JSON.stringify(require("./w2-dispatch.json").compaction))'` → two identical `{"applied":false,…,"payloadBytesBefore":0,"payloadBytesAfter":0}`.

## Residual risk

- Finding 7: no file on disk is an untouched spawn-time receipt for wave 2. Any closure count of wave-2 spawns is backed by
 the registry + roster only; the current receipt is a 07:30:25Z re-recording.
- The 88-seat total satisfies the declared band and ≤128, but not v2's 64-per-wave floor (finding 10); a policy re-read
 retroactively makes the round non-compliant.
- Labrat spawns would be uncounted (finding 8); none observed, none prevented by the registry fields.
- Finding 11's counts are a 07:33:23Z snapshot; wave 2 is still landing reports and the receipt/registry were already
 rewritten once during this read, so re-read timestamps before quoting.
