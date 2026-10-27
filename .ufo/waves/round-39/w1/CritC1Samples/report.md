# CritC1Samples — round 39

Axes: coverage; calibration.

## Counterexample
A loopback-only TCP fixture opened 21 connections, each closed 12 ms after connect, while an `ss -Htn state established` probe ran at 100 ms intervals for 2.2 s. It observed the fixture port on only one of 22 ticks. Thus short-lived socket activity can fall between nominal 100 ms samples; the minimum sample-count and coverage thresholds do not guarantee continuous observation. This is a sampling blind spot, not evidence of non-loopback egress.

## Frozen-counter evidence
Read frozen claims at `.ufo/waves/round-39/claims.json`: C1 requires >=8 socket samples over >=1000 ms. Read `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs:95-121`: counter checks sampleCount, coverageMs and aggregated nonLoopback totals, then finalSweep; it does not verify cadence, maximum gap, or continuous connection observation. Its header documents periodic 100 ms sampling and final sweep. Frozen pre-integration output `.ufo/waves/round-39/measure/pre-integration-counters.txt` shows C1 exit 0 on the recorded receipt, but that counter validates receipt fields, not live sampling.

## Exact fixture command and output
Command:
```sh
node -e 'const net=require("node:net"); const srv=net.createServer(s=>s.end()); srv.listen(0,"127.0.0.1",()=>{const p=srv.address().port; let n=0, hit=0; const tick=setInterval(()=>{const c=net.connect(p,"127.0.0.1"); c.on("connect",()=>{n++; setTimeout(()=>c.end(),12)});},100); const sample=setInterval(()=>{const {spawnSync}=require("node:child_process"); const x=spawnSync("ss",["-Htn", "state", "established"],{encoding:"utf8"}).stdout; if(x.includes(`:${p} `))hit++;},100); setTimeout(()=>{clearInterval(tick);clearInterval(sample);srv.close(()=>{console.log(JSON.stringify({port:p,durationMs:2200,connections:n,samplerTicks:22,observedTicks:hit,connectionLifetimeMs:12,loopbackOnly:true}));});},2200);});'
```
Output:
```json
{"port":37737,"durationMs":2200,"connections":21,"samplerTicks":22,"observedTicks":1,"connectionLifetimeMs":12,"loopbackOnly":true}
```
Scratch: `/fast/scratch/hyaku/tabi-r39/CritC1Samples` (removed by EXIT trap). No external hosts accessed; no tool installed.

Smallest safe correction: characterize the claim as periodic sampled coverage, not continuous visibility; if continuous short-lived egress detection is required, a periodic sampler alone cannot establish it and needs an event/audit source or explicit maximum-gap guarantee. The current frozen counter cannot detect this blind spot from receipt aggregate fields.

VERDICT finding — 12 ms loopback TCP connections were observed on 1/22 nominal 100 ms probes; frozen predicate thresholds do not exclude between-tick egress.