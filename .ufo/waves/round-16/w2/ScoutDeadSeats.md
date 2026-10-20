# ScoutDeadSeats — wave-1 dead-seat census (round 16, wave 2)

- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Audited revision: `b444ca8e024f386124418169e8e400221524bba3` (HEAD at audit; worktree clean except untracked `.ufo/waves/round-16/w2/` and `corpus/evidence/round-16/measurement-binding.json`).
- Authority for seat names: `.ufo/waves/round-16/w1/spec.json` (`items[]`, 84). Authority for ownership: `.ufo/waves/round-16/PLAN.md:98-112`. Report location authority: PLAN `## Ownership` header — "reports at `.ufo/waves/round-16/<wave>/<Name>.md`".
- Method: read-only. Nothing under the lane was created, modified or deleted except this Report. No tool installs, no counters/gates/harness run — this slice is a census, not a measurement.

## Attack item

Claim attacked: *"Of the 84 wave-1 seats named in `w1/spec.json`, the seats with no Report file are dead seats; each dead seat's PLAN-owned artifacts are present."*

## Verdict

| # | Sub-claim | Verdict | Basis |
|---|---|---|---|
| A1 | Exactly 6 of 84 seats have no `<Name>.md` Report; no orphans, no deletions | **HOLDS** | census command (§Evidence E1): `seats=84 mdReports=78 orphans=0`; `git log --diff-filter=D` over w1 is empty |
| A2 | Each of the 6 left its PLAN-owned file(s) at HEAD, git-tracked | **HOLDS** (all 9 PLAN paths populated and tracked; for MeasureCounters the PLAN path holds L1's replacement and the seat's bytes sit at a non-PLAN path — see below) | 9/9 files present and tracked; all first added in `8f7feb3` (§E3) |
| A3 | Those committed bytes are the dead seats' own final work | **BREAKS** for MeasureCounters (the PLAN-path file is L1-authored by its own header); **UNPROVEN** for the other five (one add commit, transcripts cut mid-work) | §E4 headers, §E3 history |

Overall for the assignment question — list the report-less seats and say whether they left owned files — **HOLDS**, with the A3 attribution qualifier carried below.

## The dead seats — exact list

From `w1/spec.json` item names vs `*.md` stems in `.ufo/waves/round-16/w1/`:

1. `BindCore` — missing report `.ufo/waves/round-16/w1/BindCore.md`
2. `MeasureCounters` — missing report `.ufo/waves/round-16/w1/MeasureCounters.md`
3. `WebmcpHarness` — missing report `.ufo/waves/round-16/w1/WebmcpHarness.md`
4. `WebmcpProbeDeclarative` — missing report `.ufo/waves/round-16/w1/WebmcpProbeDeclarative.md`
5. `WebmcpProbeLifecycle` — missing report `.ufo/waves/round-16/w1/WebmcpProbeLifecycle.md`
6. `WebmcpProbeFrames` — missing report `.ufo/waves/round-16/w1/WebmcpProbeFrames.md`

All six carry role `executor`. Census arithmetic: 19 executors in spec → 13 executor Reports exist, 6 missing; all 65 non-executor seats reported (78 = 65 + 13). So the dead-seat set is exactly "the six executor seats whose Report file is absent" — there is no report-less seat in any other role.

## Owned-file check (PLAN.md ownership table, lines 100-112)

`tracked` = `git ls-files --error-unmatch` at HEAD.

| Dead seat | PLAN write set | Observed at HEAD | Size | sha256 | tracked |
|---|---|---|---|---|---|
| BindCore | `scripts/check-measurement-binding.mjs` | present | 36 986 B | `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` | yes |
| MeasureCounters | `.ufo/waves/round-16/measure.mjs` | present **but L1-authored** (see below) | 15 385 B | `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9` | yes |
| MeasureCounters | (non-PLAN path) | `.ufo/waves/round-16/measure.seat-draft-unrunnable.mjs` — the seat's retained draft | 42 929 B | `749e33c177449d4671b78f4d8d9588212079f8ef63eb52fdef87c667964e22e1` | yes |
| WebmcpHarness | `scripts/webmcp-loopback-round16.mjs` | present | 63 358 B | `961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1` | yes |
| WebmcpProbeDeclarative | `probes/WebmcpProbeDeclarative.{mjs,json}` | both present | 20 381 B / 176 911 B | `9eb0ac98…cf4ef` / `45ef6a49…cf967` | yes |
| WebmcpProbeLifecycle | `probes/WebmcpProbeLifecycle.{mjs,json}` | both present | 15 691 B / 72 152 B | `5904d666…56eb49` / `5bfd1f60…d500ae` | yes |
| WebmcpProbeFrames | `probes/WebmcpProbeFrames.{mjs,json}` | both present | 18 730 B / 34 582 B | `d6a02bac…327d86` / `4debd5c0…9f014` | yes |

Notes that change how the "left owned files" line must be read:

- **MeasureCounters — the PLAN path is occupied by a replacement.** `.ufo/waves/round-16/measure.mjs:2-3` says verbatim: *"L1-authored; replaces the dead seat draft measure.seat-draft-unrunnable.mjs, which never executed its C1 path."* The seat's own 42 929 B draft is retained under `measure.seat-draft-unrunnable.mjs`, a path absent from the PLAN ownership table. The committed counter was also repaired again in `b444ca8` (`+9/−2`, the `fixtureFile` read fix). So for this seat: [OBSERVED] the seat wrote a draft, [OBSERVED] L1 replaced it, [INFERENCE] the seat's draft never worked (the lane's own claim).
- **WebmcpHarness — the artifact demonstrably executed.** `corpus/evidence/round-16/webmcp/receipt.json` records `producer.sha256 = 961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1`, byte-identical to the on-disk harness, so the committed receipt's `schema`/`producer` binding points at this exact file.
- **Probe seats — the artifacts self-identify and are load-bearing.** `WebmcpProbeDeclarative.json` has `"seat": "TabiR16.WebmcpProbeDeclarative-5"`; `WebmcpProbeLifecycle.json` and `WebmcpProbeFrames.json` carry `"seat"` too. `receipt.json:1386` (`expectedProvenance`) cites `.ufo/waves/round-16/probes/WebmcpProbeLifecycle.json` — a dead seat's artifact is cited as evidence inside C2's own receipt.
- No dead seat left files *outside* its PLAN write set that I could attribute to it, and no live seat's report file is a duplicate of another (0 duplicate-content pairs among the 78 reports; smallest report 2 455 B, so none is a stub).

## Falsification attempts that did not move the count

1. **Alternate report naming / nested dirs.** w1 has 0 subdirectories; every one of the 78 `.md` stems is a spec item name (orphans=0). No `Name.report.md`, no `-5.md`, no `.txt` report (`validation.stderr.txt` is 0 B).
2. **Reports written then deleted.** `git log --diff-filter=D --name-only -- .ufo/waves/round-16/w1` → empty. Nothing was removed; the six were never written.
3. **Seat-count authority drift.** `spec.json` (84) == `assignments.json` (84) == `swarm-registry.json` members (84); `validation.json` `counts.spawn=84, resume=0`; `dispatch-result.json` text opens "Spawned 84 background agents".
4. **Bookkeeping records completion** (would contradict a dead seat). It does not: every registry member is `{"kind":"spawn","agentId":…,"role":…,"item":null}` — no status, completion or error field for any of the 84. The wave bookkeeping therefore neither confirms nor denies the census; report-file presence is the only available signal. This is a bookkeeping gap for L1's DraftReport `dead seats PENDING(name + error)` line.
5. **Report triviality.** All 78 reports are non-empty and non-duplicate (smallest 2 455 B), so no "present but empty" seat is hiding in the 78.

## Why the six are dead (corroboration, not the census basis)

`read history://TabiR16.<Seat>-5` for all six: header line is `(parked)`; each transcript ends mid-tool-call with no final assistant message (BindCore stops right after its first `--check` fixture run; MeasureCounters stops while `tokensOf` is missing; WebmcpHarness stops mid-edit of the CDP section; the three probes stop mid-edit/mid-read). One IRC line in the BindCore transcript documents the provider class: `[irc] TabiR16.BindSelftest-5 → me: Wake turn failed: Devin stream error resource_exhausted: Reached free model rate limit.` [OBSERVED for that line; INFERENCE that it is the common cause for all six — only this one error string appears.]

Lane-side terminology matches this census: `measure.mjs:2` calls MeasureCounters "the dead seat", and `.ufo/waves/round-16/drafts/DraftReport.md:98` still reads "dead seats PENDING(name + error)". Wave 2's `spec.json` (73 items) re-dispatches **none** of the six, so their Reports will stay missing unless L1 respawns them.

## Remaining unknowns

1. Whether `8f7feb3`'s bytes for the five non-MeasureCounters artifacts equal the seats' last worktree bytes — each file has exactly one commit (the add), so git cannot separate author from committer; transcripts show them editing those paths but not finishing.
2. Per-seat failure cause: only one provider error string was observed; the other five transcripts simply stop.
3. Whether L1 will treat the six dead seats' artifacts as admissible non-author evidence (the C1 gate, the C1 counter, the C2 harness, three probes) given that their owners never reported functions, reasons or observed outputs.

## Evidence — commands and verbatim output

E1 — census (run at lane root):

```
node -e '
const fs=require("fs"),cp=require("child_process");
const p=".ufo/waves/round-16/w1";
const spec=JSON.parse(fs.readFileSync(p+"/spec.json","utf8"));
const items=spec.items, names=items.map(i=>i.name);
const md=new Set(fs.readdirSync(p).filter(f=>f.endsWith(".md")).map(f=>f.slice(0,-3)));
const dead=names.filter(n=>!md.has(n));
const role=n=>items.find(i=>i.name===n).role;
const ex=items.filter(i=>i.role==="executor");
console.log("seats="+items.length+" mdReports="+md.size+" orphans="+[...md].filter(n=>!names.includes(n)).length+" dirs="+fs.readdirSync(p,{withFileTypes:true}).filter(d=>d.isDirectory()).length);
console.log("executors="+ex.length+" executorReports="+ex.filter(i=>md.has(i.name)).length+" nonExecutorReports="+items.filter(i=>i.role!=="executor"&&md.has(i.name)).length);
for(const n of dead) console.log("DEAD\t"+n+"\trole="+role(n)+"\treportMissing="+p+"/"+n+".md");
const del=cp.execFileSync("git",["log","--diff-filter=D","--name-only","--format=%h %s","--",p],{encoding:"utf8"});
console.log("w1 deletions in history:["+del.trim()+"]");
const a=JSON.parse(fs.readFileSync(p+"/assignments.json","utf8"));
const r=JSON.parse(fs.readFileSync(p+"/swarm-registry.json","utf8")).members;
console.log("spec==assignments="+(names.length===Object.keys(a).length&&names.every(n=>n in a))+" spec==registry="+(names.length===Object.keys(r).length&&names.every(n=>n in r)));'
```

```
seats=84 mdReports=78 orphans=0 dirs=0
executors=19 executorReports=13 nonExecutorReports=65
DEAD	BindCore	role=executor	reportMissing=.ufo/waves/round-16/w1/BindCore.md
DEAD	MeasureCounters	role=executor	reportMissing=.ufo/waves/round-16/w1/MeasureCounters.md
DEAD	WebmcpHarness	role=executor	reportMissing=.ufo/waves/round-16/w1/WebmcpHarness.md
DEAD	WebmcpProbeDeclarative	role=executor	reportMissing=.ufo/waves/round-16/w1/WebmcpProbeDeclarative.md
DEAD	WebmcpProbeLifecycle	role=executor	reportMissing=.ufo/waves/round-16/w1/WebmcpProbeLifecycle.md
DEAD	WebmcpProbeFrames	role=executor	reportMissing=.ufo/waves/round-16/w1/WebmcpProbeFrames.md
w1 deletions in history:[]
spec==assignments=true spec==registry=true
```

E2 — independent file counts:

```
$ git ls-tree -r --name-only HEAD -- .ufo/waves/round-16/w1 | grep -c '\.md$'
78
$ ls .ufo/waves/round-16/w1/*.md | wc -l
78
```

E3 — PLAN-owned artifacts, presence/tracking/size and add commit:

```
$ for f in scripts/check-measurement-binding.mjs scripts/webmcp-loopback-round16.mjs .ufo/waves/round-16/measure.mjs .ufo/waves/round-16/probes/WebmcpProbeDeclarative.mjs .ufo/waves/round-16/probes/WebmcpProbeDeclarative.json .ufo/waves/round-16/probes/WebmcpProbeLifecycle.mjs .ufo/waves/round-16/probes/WebmcpProbeLifecycle.json .ufo/waves/round-16/probes/WebmcpProbeFrames.mjs .ufo/waves/round-16/probes/WebmcpProbeFrames.json; do \
    printf '%s\t%s\t%s\n' "$(git ls-files --error-unmatch "$f" >/dev/null 2>&1 && echo tracked || echo UNTRACKED)" "$(stat -c%s "$f")" "$f"; done
tracked	36986	scripts/check-measurement-binding.mjs
tracked	63358	scripts/webmcp-loopback-round16.mjs
tracked	15385	.ufo/waves/round-16/measure.mjs
tracked	20381	.ufo/waves/round-16/probes/WebmcpProbeDeclarative.mjs
tracked	176911	.ufo/waves/round-16/probes/WebmcpProbeDeclarative.json
tracked	15691	.ufo/waves/round-16/probes/WebmcpProbeLifecycle.mjs
tracked	72152	.ufo/waves/round-16/probes/WebmcpProbeLifecycle.json
tracked	18730	.ufo/waves/round-16/probes/WebmcpProbeFrames.mjs
tracked	34582	.ufo/waves/round-16/probes/WebmcpProbeFrames.json
$ git log --format='%h %ad %s' --date=iso-strict --diff-filter=A -- scripts/check-measurement-binding.mjs
8f7feb3 2026-10-20T11:54:43-03:00 round-16: measurement-binding gate, native WebMCP loopback capability, sources and wave-1 evidence
```

(Same single add commit for the harness, the seat draft, and all three probe `.mjs` files; `measure.mjs` additionally appears in `b444ca8`.)

E4 — authorship/replacement evidence:

```
$ head -3 .ufo/waves/round-16/measure.mjs
#!/usr/bin/env node
// tabi round-16 C1/C2 counting probe (L1-authored; replaces the dead seat
// draft measure.seat-draft-unrunnable.mjs, which never executed its C1 path).

$ head -1 .ufo/waves/round-16/probes/WebmcpProbeDeclarative.mjs
// WebmcpProbeDeclarative.mjs — round 16 C2 probe (seat: TabiR16.WebmcpProbeDeclarative-5)
$ head -2 .ufo/waves/round-16/probes/WebmcpProbeLifecycle.mjs
#!/usr/bin/env node
// tabi round-16 / wave-1 probe: WebMCP lifecycle events (toolsRemoved / re-add).

$ node -e 'const r=require("./corpus/evidence/round-16/webmcp/receipt.json");console.log(r.producer)'
{ path: 'scripts/webmcp-loopback-round16.mjs',
  sha256: '961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1' }
```

E5 — bookkeeping cannot decide liveness (all 84 identical shape):

```
$ node -e 'const m=require("./.ufo/waves/round-16/w1/swarm-registry.json").members;console.log(JSON.stringify(m.BindCore));console.log(JSON.stringify(m.BindSelftest))'
{"kind":"spawn","agentId":"TabiR16.BindCore-5","role":"executor","item":null}
{"kind":"spawn","agentId":"TabiR16.BindSelftest-5","role":"executor","item":null}
$ grep -c '"item": null' .ufo/waves/round-16/w1/swarm-registry.json
84
```

## Report trailer

Report: `.ufo/waves/round-16/w2/ScoutDeadSeats.md` (author-side, not non-author certification).
