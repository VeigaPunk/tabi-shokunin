#!/usr/bin/env python3
import json
from pathlib import Path

LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET='/home/vgpnk/Projects/shokunin'
ROUND=40
BASE='a1b1e939048885d2793759b7f49b10c5c820d70d'
FREEZE='07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4'
SCRATCH='/fast/scratch/hyaku/tabi-r40'
GODSPEED='''You are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n3. **Keep moves that improve any axis and harm none.**\n4. **Don\'t aim — let the frontier walk itself.**\n\n## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.'''
CONTEXT=f'''# Goal
Tabi round 40, attempt 2. One v2 wave of 64 seats. C1 is the sole final pre-data frozen claim: coverage capability, the counting command `scripts/measure-c1-round40.mjs` must invoke the Firefox driver for exactly two Playwright Firefox loopback runs with a fresh 64-hex nonce, bind the emitted receipt/runs to that nonce, and score it; each run needs >=8 strictly increasing samples whose actual first-to-last timestamp span is >=1000ms, both ss/proc surfaces available with positive ticks on every sample/final sweep, zero observed non-loopback counts, nonempty owned process tree, identical first-shot hashes, no survivors, closed fixture port, and browser version bound. Freeze commit: {FREEZE}; it supersedes prior pre-data freezes before dispatch/data. Baseline: {BASE}. Read {LANE}/.ufo/waves/round-40/claims.json and frozen counter/runner bytes; never widen or amend the predicate.

Scope: your reports only under {LANE}/.ufo/waves/round-40/w1/<SeatName>/report.md. Production tree, fleet, siblings and shokuknow source repo are read-only. No commits/pushes, no git/jj mutation, no agents spawned, no external site interaction. For quarantine seats, read the source register and fetch only your assigned cited public source; do not edit or write anywhere under /home/vgpnk/Projects/shokuknow. Every Report trailer path is relative to {LANE}: write it at {LANE}/<that path>.

Tooling authorization (operator, 2026-10-19): may install/upgrade tools that help the task; first read /home/vgpnk/.omp/agent/RULES.md (official channels only) and record tool/version/channel/reason. PACMAN GUARD: pacman transactions are PAUSED host-wide; never run pacman. No tool install is planned; do not install unless essential.

Scratch root: {SCRATCH}/<YourSeatName>/; mkdir -p and pass it explicitly. Delete it before yielding (`trap 'rm -rf -- "$S"' EXIT` or Python finally). `/tmp` only files under 50 MB; never rely on inherited TMPDIR. Receipts that matter go in your lane report folder. No shared production writers.

One wave item per seat, leaf only. Return one report with exact observed commands/output, evidence paths, limitations, and final `VERDICT ok|finding|could-not-evaluate ...` line. No claim verdict by assertion.''' 

def add(name,role,task,axes,milestone):
    prompt=f'''{GODSPEED}\n\nItem: {task}\n\nReport: .ufo/waves/round-40/w1/{name}/report.md'''
    return {'name':name,'role':role,'prompt':prompt,'axes':axes,'milestone':milestone}

items=[]
ids=['S102','S106','S109','S110','S111','S114','S117','S118','S124','S125','S126','S130','S131','S133','S134','S135','S137','S138','S140','S142','S143','S144','S145','S147','S148','S149','S153','S154','S158','S163','S164','S165','S166','S167','S174','S175','S176','S171']
for sid in ids:
    items.append(add('ScoutQuarantine'+sid[1:],'scout',f'''Quarantine-first hand-check for exactly staged ID {sid}. Open the read-only source register /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md, locate the exact data row (confirm staged URL, anchor, quote and class), then open/fetch that exact cited source in your scratch. Locate the quoted passage and classify only this row: present, absent/fabrication (only if the actual source was successfully opened and the exact quote is absent), unreachable/unverifiable, or partial/unverifiable. Record URL, access date, exact section, <=25-word quote if located, source status/bytes, and limitations. For S171 the staged prose says it could not be fetched: unreachable is not fabrication. Do not treat earlier seat summaries as evidence, do not edit the source repo or lane corpus, and do not adopt package content.''',['coverage'],'quarantine'))

reviewers=[
('RevCounter','Re-run the frozen C1 counter over the committed round-39 receipt and inspect its exact findings. Independently recompute both sample spans from timestamp arrays; compare with the logged 799ms/701ms values. Check predicate sentence, control receipt and frozen digest bytewise. Report any mismatch.'),
('RevDriver','Review the current Playwright Firefox driver against C1. Attack process ownership discovery/refresh, stale PID snapshots, PID reuse/reparenting, sample timing, both socket surfaces, fail-closed paths, cleanup, and version binding. Give concrete false-green scenarios within loopback-only/scratch bounds.'),
('RevIdentity','Inspect receipt ownership tree semantics and driver source. Determine which fields establish the observed Firefox process belongs to this run, how child processes are tracked over time, and what evidence is still descriptive/self-reported. Do not claim session authentication absent evidence.'),
('RevAvailability','Review whether ss and /proc observations can become unavailable or synthetic zero. Trace driver code paths and propose source-level falsifiers, including permission/tool absence and malformed output. No external traffic.'),
('RevClaimFit','Adversarially assess frozen claims.json against SCORECARD and round-39 spotcheck: axis fit, causal scope, source grounding, target/control reachability, kill rule, shared inputs. Do not amend the freeze; distinguish defects from recommendations.'),
('RevPriorThree','Fresh-start review: re-read the three prior Tabi rejected reports (rounds 37,38,39) and their spot-check defects. Verify which routed defects the C1 freeze addresses and which remain open; cite exact lane paths/lines.'),
('RevCounterSemantics','Check the frozen counter logic against its sentence. Identify any predicate clause not actually checked, any malformed receipt that can reach exit 0, and whether its round-39 negative control is genuinely below target. Scratch fixtures only.'),
]
for n,t in reviewers: items.append(add(n,'reviewer',t,['coverage','calibration'],'claim-review'))
items.append(add('RevNoHarm','reviewer','Read-only compare the frozen round-40 instrument additions against baseline a1b1e939. Confirm they only add round-40 evidence and do not alter existing production scripts, corpus entries, or historical receipts. Report `git diff --name-only` and any scope issue.',['coverage'],'scope-review'))
critics=[
('CritSparseSamples','Construct timestamp-array counterexamples in scratch: sparse sample span, duplicate/decreasing timestamps, missing timestamp, NaN/string, false tail-inclusive coverage, and sampled window <=999ms. Show exact frozen counter outcomes; do not change frozen bytes.'),
('CritSurfaceGaps','Attack the meaning of sample/final-sweep availability. Test absent/null/non-numeric ss/proc objects, missing nonLoopback fields, and nonzero counts. Identify any surface that the counter accepts without observation.'),
('CritControlReach','Attack the round-39 no-op receipt against frozen counter: can field changes, schema changes, receipt path substitution or top-level summary override produce exit 0 without a round-40 run? Report executable fixture results in scratch.'),
('CritTreeOwnership','Attack owned-tree condition and its link to browser/socket samples: empty tree, stale unrelated PID, wrong root, missing owner field, and descendant churn. Distinguish counter-checked facts from driver assertions.'),
('CritClaimBoundary','Check TCP-only scope against UDP/QUIC, DNS, IPv6 and non-browser processes. Ensure claim/report language does not assert comprehensive egress or external-site behavior; give a falsifier for each overbroad clause.'),
('CritNoOp','Try the cheapest do-nothing path from the baseline: reusing round-39 artifacts, relabeling the receipt, editing only coverageMs, or adding an arbitrary JSON file. Show whether frozen counter admits any path.'),
('CritSamplingGap','Assess whether >=8 samples over >=1000ms proves continuous coverage. Identify a short-lived loopback connection between polls as a limitation and test with a local-only fixture if feasible; no external connections.'),
]
for n,t in critics: items.append(add(n,'critic',t,['coverage'],'falsification'))
mutations=[
('MutSpanCases','Mutation-test the frozen C1 counter with isolated receipt copies: valid round-39 receipt, 999ms sample span, exactly 1000ms span, duplicate timestamp, missing timestamp, and missing observation surface. Record exit/finding per case; never modify committed inputs.'),
('MutEgressCases','Mutation-test ss/proc nonLoopback fields independently at one sample and at final sweep; remove each surface. Require every unavailable/nonzero case to fail closed. Use scratch-only JSON copies.'),
('MutOwnershipCases','Mutation-test empty/missing owned tree, survivors, portClosed=false, unbound version, and differing first-shot hashes. Record each exit and finding; one field per fixture.'),
('MutCounterControls','Attempt a plausible false-green mutation of only the output receipt (tail-inclusive duration, synthetic zero, or sample count without time coverage); establish whether frozen counter refuses. Preserve pristine counter digest and no repository writes.'),
]
for n,t in mutations: items.append(add(n,'mutation-tester',t,['coverage'],'mutation'))
executors=[
('ExecDriverBuild','In your report-only seat directory, outline a concrete implementation change to the existing driver that records per-sample timestamps across >=1000ms, refreshes owned process identity, and fails closed on unavailable ss/proc. Do not edit production files. If practical, execute the current driver in a loopback-only scratch copy and retain exact outputs.'),
('ExecLoopbackRun','Run one independent loopback-only Firefox capture using the existing lane instructions/driver in isolated scratch; measure actual first/last sample timestamp span, both surfaces, owned process set, survivors, port closure and browser version. Keep output in your report directory; clean up. Do not create a round-40 receipt or modify lane files.'),
('ExecCounterReplay','Execute frozen C1 counter against round-39 receipt and a scratch mutation where sample span is below 1000ms. Verify stable distinct failure findings, input digests and exact exit codes. Use explicit scratch root and leave committed bytes unchanged.'),
]
for n,t in executors: items.append(add(n,'executor',t,['coverage','operability'],'execution'))
items.append(add('ScribeLesson','scribe','Draft a report-only lesson outline for round 40: record the pre-data control, claim, opened S145 quote, quarantine-first decisions as they arrive (do not invent), mistake M2 from round-39 counter self-reference and its prevention, and exact census before/after slots. Do not edit corpus files or assert a fix until shown to fail.', ['coverage','quality'],'lesson-draft'))
connectors=[
('ConnSiblingOverlap','Read sibling PROVINCE.md/owned knowledge at the current committed revisions and identify any overlap with Tabi C1 (browser process/socket evidence). Report evidence and boundary only; never edit sibling or Tabi files.'),
('ConnPlanning','Provide a bounded independent data-walk of the frozen round-40 claim, its counter and no-op control. Identify one relevant unresolved browser surface and the cheapest falsifier; do not modify claims or add a claim.'),
('ConnSourcePattern','Check whether S145’s /proc/net/tcp field is correctly scoped to remote address/port and whether the frozen C1 source citation supports only that claim. Reopen the source and quote <=25 words; do not edit SOURCES or knowledge.'),
]
for n,t in connectors: items.append(add(n,'connector',t,['coverage','adjacency'],'cross-surface'))
assert len(items)==64,len(items)
spec={'wave':'tabi-r40-w1','maxLanes':64,'reportDir':'.ufo/waves/round-40/w1','context':CONTEXT,'items':items}
Path(LANE+'/.ufo/waves/round-40/w1-spec.json').write_text(json.dumps(spec,indent=2)+'\n')
print('items',len(items),'roles', {r:sum(x['role']==r for x in items) for r in sorted({x['role'] for x in items})})
