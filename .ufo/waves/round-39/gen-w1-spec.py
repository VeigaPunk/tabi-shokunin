#!/usr/bin/env python3
# Round-39 single-v2-wave generator. Godspeed directive bytes are read verbatim from host binding.
import json
from collections import Counter

LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
WAVE = 'w1'
FREEZE = '1f4260aeb3af186e84444cbb417a31b8a35bdb55'
BASELINE = '5bc56a81d196caeb8d24551928b883802697aabb'
SCRATCH = '/fast/scratch/hyaku/tabi-r39'
GODSPEED = open('/home/vgpnk/.agents/skills/godspeed/directive.md').read().rstrip('\n')

COMMON = f"""# Goal
Tabi round 39, attempt 1, one v2 wave (64 seats). Claims are frozen in {LANE}/.ufo/waves/round-39/claims.json; instrument freeze commit {FREEZE}; round-start baseline {BASELINE}. C1 is coverage capability (session-bound Playwright Firefox egress); C2 is calibration (close round-38 routed residuals 1-2). Read claims.json and both frozen counters before acting.

Scope: work only in your unique seat directory and scratch. Do not edit production lane files outside your seat dir, commit/push, mutate git/jj, touch fleet/sibling repos, or spawn. Every `Report:` trailer path is relative to {LANE} — write it at {LANE}/<that path>. L1 holds the canonical planner seat; connector items carry the bounded cross-surface planning scan. Use one live browser only when your item explicitly requires it, loopback fixture only, and clean it up.

Tooling authorization (operator, 2026-10-19): you may install/upgrade tools that help the task; read /home/vgpnk/.omp/agent/RULES.md first (official channels only) and record tool/version/channel/reason; never install via pacman. PACMAN GUARD: all pacman transactions are PAUSED host-wide — never run pacman. REA work only via CLI, never MCP.

Scratch root: {SCRATCH}/<YourSeatName>/ — mkdir -p, use it explicitly for any clone/fixture/tmp dir, and delete it before yielding (`trap 'rm -rf -- "$S"' EXIT`). `/tmp` is for files under 50 MB only. Never rely on inherited TMPDIR. Any reportable evidence goes under {LANE}/.ufo/waves/round-39/w1/<YourSeatName>/.

Task harness: every role is a leaf; no seat spawns. Never message agent://all. Return one report with exact commands/output, evidence paths and a final `VERDICT ok|finding|could-not-evaluate ...` line (same line at end of report.md). Report only observed results; no verdict by assertion. No tool installs planned; if you install, include exact details.
"""

def item(name, role, task, axes=None, milestone=None):
    prompt = f"""Item: {task}

Report: .ufo/waves/round-39/w1/{name}/report.md"""
    d = {'name': name, 'role': role, 'prompt': GODSPEED + '\n\n' + prompt, 'milestone': milestone or 'C1-C2'}
    if axes:
        d['axes'] = axes
    return d

items = []
# Reviewers: independent derivations and evidence review (17)
reviewer_tasks = [
('RevC1Receipt', 'Independently re-run the frozen C1 counter against the lane at its current branch tip in a clean shared clone (clone under your scratch; use explicit --repo/--rev). Re-derive each receipt predicate field from committed bytes: schema, runs, first-shot hashes, owned roots/tree, sample count and duration, both socket surfaces, final sweep, survivors, port closure, version/binary/userAgent, and v1-control refusal. Report exact command/output and any mismatch.'),
('RevC1Driver', 'Line-review scripts/playwright-firefox-egress-round39.mjs against C1. Attack PID ownership binding and process-tree discovery (node-child selection, argv match, races/reparenting/PID reuse), fail-closed paths, sampling window, cleanup, and claims that the socket observations belong to the browser. Give at least two concrete falsifiers or explain why each fails.'),
('RevC1Control', 'Verify the C1 do-nothing control is genuine: inspect the committed round-38 v1 receipt and run the frozen C1 counter at the current tip. Enumerate the exact refusal reasons and assess whether the old global-grep/400ms/empty-set behavior could reach the C1 predicate.'),
('RevC2Counter', 'Compare round-39 c2-routed-defects-v2.mjs D1-D3 logic byte-for-byte/semantically against the frozen round-38 v1 counter; check D4-D7 amendments and paths. Identify any semantic drift in the original checks or any bypass in D7.'),
('RevC2Receipt', 'Re-run the round-39 mutated-claims control command from its receipt in your scratch against frozen counter bytes. Verify the mutant differs only in the C2 predicate token, sha256 pair is correct, observed exit is real, and d7-sentence-mismatch appears. Do not trust the stored exit alone.'),
('RevD5D6', 'Attack C2 D5/D6. Check census parser coverage, 0–3 leading-space handling assumptions, receipt freshness, numstat filename selection and exact baseline..REV matching. Propose a concrete fixture that would expose any false green.'),
('RevNoHarm', 'Re-run the lane’s committed offline `scripts/check-*.mjs` self-test modes as documented in scripts/check-gate-registry.mjs or their own usage, using read-only execution and recording count/exit. Compare the same command set at baseline 5bc56a8 where feasible. Report only regressions attributable to round-39 instruments.'),
('RevFreezeIntegrity', 'Re-derive the three frozenDigests in claims.json from commit 1f4260aeb3af186e84444cbb417a31b8a35bdb55 via git show + sha256sum. Compare both claims predicate sentences byte-for-byte with their counter constants/comments. Report each exact digest/equality.'),
('RevRunLive', 'Independently rerun the round-39 driver once (separate scratch/profile, loopback only). Compare its first-shot hash, session-bound version, egress/survivor counts and dual-surface observations with the committed receipt. Clean up browser/server/processes; report exact output.'),
('RevR38Lessons', 'Re-read corpus/lessons/round-38-verifier-spotcheck.md routed defects 1–2. Verify round-39 C2 directly closes those exact items and does not silently claim unrelated defects closed. Report mapping and any missing evidence.'),
('RevReceiptBinding', 'Attack owned-set binding: check whether a second pre-existing Firefox process can be mistaken for the newly launched one, whether descendants are covered, and whether the root/descendant set is stable across sampling. Use only your own loopback fixture and scratch; do not target external sites.'),
('RevC1Green', 'Independently reproduce C1 on committed bytes in a clean shared clone; run the counter at the exact measured lane tip, verify exit 0 and predicate true, then mutate one receipt field (e.g. survivors=1) in a fixture clone and confirm refusal.'),
('RevSourcesRow', 'Review the planned S145 source row shape against corpus/SOURCES.md contract v1: 11 columns/no pipes, correct tier/kind/status/date/recheck/used-by, and source quote grounding. Do not edit the registry. If S145 is not yet written, specify exact row defects to prevent.'),
('RevClaimSizing', 'Adversarially review claims.json C1/C2 for falsifiability, causal separability, axis correctness, lowest-axis/stagnation nudge justification, do-nothing controls, one-sentence predicate identity, and kill rules. Name any predicate reachable by do-nothing control.'),
('RevC1EgressWindow', 'Check whether the dual observation surfaces actually cover all browser-owned TCP egress during navigation and startup. Analyze process list and /proc inode semantics, loopback classification, unsupported sockets, and sampling gaps. Give a concrete counterexample test if possible.'),
('RevC2D2D3', 'Independently re-run C2 counter’s D1-D3 components at the frozen baseline and current tip; verify exact seat count/tally and each hash ancestor. Check whether the LOG hash typos are handled honestly. Report raw values.'),
('RevNoHarmScope', 'Check the round-39 changed path list for out-of-scope writes or hidden live-tree mutations. Read git status and diff (read-only) and name any file outside the declared lane scope; do not mutate anything.'),
]
for n,t in reviewer_tasks: items.append(item(n,'reviewer',t,['coverage','calibration'],'claim-recheck'))
# Critics: falsification attacks (12)
critic_tasks = [
('CritC1Samples','Attack the threshold `sampleCount >= 8` and `coverageMs >= 1000`: can short-lived or periodic egress evade the 100ms sampler? Construct a loopback-only fixture that opens/closes a short TCP connection between sample ticks and classify whether the frozen counter can detect the blind spot. Do not access external hosts.'),
('CritC1ProcParse','Attack decodeProcIp/isLoopbackHexRem using synthetic IPv4, 127/8, IPv6 ::1, IPv4-mapped ::ffff:127/8, unspecified, and public-address fixtures. Write unit snippets in scratch; identify false positives/negatives. The two surfaces must not be treated as independent if they share a parser flaw.'),
('CritC1SsParse','Attack `ss -Htnp` parsing: process-name formatting, multiple PIDs, IPv6 bracket forms, hostnames, whitespace, and pid regex boundary. Show if a non-loopback peer can be classified as loopback or an owned socket omitted.'),
('CritC2Semantics','Does C2 close round-38 verifier defects 1–2 exactly? Check the red-control must be executed by v2 (not merely asserted) and numstat window must end at the measured REV. Identify any post-hoc/fabricated receipt path.'),
('CritClaimsText','Byte-compare claims.json predicates with each counter constant and comment; mutate punctuation, whitespace, case, and one token in scratch; run the relevant frozen counter and report whether every mutant is refused.'),
('CritWaveIndependence','Review the two claims’ causal separability: show how C1 can be tested without C2 receipts and C2 without the C1 browser receipt. Identify any shared artifact that couples their verdicts.'),
('CritKillRules','Check each frozen killRule against the counter code and controls. For each clause, identify a concrete case where the condition is true but the counter still reports met, or report no such case with command evidence.'),
('CritFixture','Attack fixture determinism and capability scope: does identical first-shot SHA only prove same rendered frame, not full behavioral determinism? Check click, history, DOM state and request evidence for coverage gaps; recommend exact scope language if needed.'),
('CritC2ReceiptHonesty','Can c2-sentence-mutant.json be forged after the fact while satisfying C2? The counter checks the receipt fields structurally. Construct a forged receipt with fake exit and correct hashes in scratch; determine whether C2 has a verification gap.'),
('CritNumstatProtocol','Attack the C2 numstat protocol under a moving tree: can the receipt name a valid baseline and REV while its numstat body was produced from different endpoints? What should the counter verify to bind the output to the actual diff command?' ),
('CritFreshStartControl','Review the round-39 do-nothing controls against the previous three closures and the run-10 fresh-start rule. Check no claim is reachable by merely re-running old capability or adding a count-only fixture.'),
('CritNetworkScope','Evaluate C1’s network claim against browser startup telemetry, DNS, UDP/QUIC, Unix sockets, and external requests. Identify which are in scope and whether the current title/predicate overclaims “egress” beyond observed TCP.'),
]
for n,t in critic_tasks: items.append(item(n,'critic',t,['coverage','calibration'],'falsification'))
# Mutation testers: executable counter mutants (8)
mut_tasks = [
('MutC1ReceiptA','Mutation-test C1 counter in scratch with three independent receipt mutants: empty owned tree/root; missing finalSweep; wrong browserVersion/userAgent/binary. Each mutation must flip an honest predicate to nonzero exit; any survivor is a finding.'),
('MutC1ReceiptB','Mutation-test C1 with survivors=1, portClosed=false, sampleCount=7, coverageMs=999, and egressNonLoopback=1 (one field per fixture). Record exit and finding id for each; any surviving mutant is a finding.'),
('MutC1FinalSweep','Mutate finalSweep.ss/proc fields to unavailable or a non-loopback count, and remove one surface from a sample. Confirm counter fail-closed; classify whether sample surfaces are required on every sample or only totals.'),
('MutC2Receipt','Mutate the C2 red-control receipt: observedExit=0; equal frozen/mutant SHA; missing mutant sentence; fake empty command. Confirm v2 rejects each; any survivor is a finding.'),
('MutC2Tree','In a fixture clone, delete each of claims.json, census-end.txt, and the numstat receipt one at a time; run C2 counter at that rev and record d7/d5/d6 refusal. Then mutate each receipt endpoint and confirm refusal.'),
('MutDriverFailClosed','Mutation-test the driver: remove the empty-owned-set refusal and force owned tree empty in scratch; remove both observation surfaces or make them unreadable; verify the live driver refuses rather than writing a green receipt. No external network.'),
('MutD7Variants','Run v2 on mutated claims fixtures differing by one punctuation mark, whitespace, case, and one numeral. Each must produce d7-sentence-mismatch and nonzero exit; retain output in your seat directory.'),
('MutControlV1','Demonstrate the old v1 counter’s blind spot: on a fixture tree with a complete otherwise-green state and only a mutated C2 sentence, v1 has no sentence-identity check; v2 refuses. If a complete tree is infeasible, explain exactly which required fixture blocks the comparison.'),
]
for n,t in mut_tasks: items.append(item(n,'mutation-tester',t,['coverage','calibration'],'mutation'))
# Scouts: 8 quarantine slices + source opening (9)
quar = [
('S102 S106 S109 S110 S111',''),
('S114 S117 S118 S124 S125',''),
('S126 S130 S131 S133 S134',''),
('S135 S137 S138 S140 S142',''),
('S143 S144 S145 S147 S148',''),
('S149 S153 S154 S158 S163',''),
('S164 S165 S166 S167 S174',''),
('S175 S176 S171',''),
]
for i,(ids,_) in enumerate(quar,1):
    n=f'ScoutQuarantine{i:02d}'
    t=f"Hand-check a deterministic slice of the tabi quarantine register (nominal ids {ids}). First re-derive the full lane slice using the required awk extraction from /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md; every extracted row must carry an S-id. Use your scratch to fetch each cited source and locate the registry quote; classify each assigned row present / absent (fabrication) / unreachable (not fabrication) / unverifiable-family, with exact URL/anchor/quote evidence. Do not edit campaign files, the lane registry, or any knowledge entry. The assignment is by deterministic row-order partition (rows {i} of 8); if the actual lane slice differs, report the actual rows and do not silently skip any. Adoption remains closed regardless until L1 integrates all verdicts."
    items.append(item(n,'scout',t,['coverage'],'quarantine'))
items.append(item('ScoutSourceS145','scout',"Open https://man7.org/linux/man-pages/man5/proc.5.html this round. Locate the /proc/net or /proc/<pid>/net description relevant to socket tables; record access date/time, HTTP status, title, exact section, and a quote of at most 25 words. If that page is unreachable or lacks a relevant passage, open https://man7.org/linux/man-pages/man8/ss.8.html and report the fallback. The quote must ground a source-registry row; do not write the registry.",['coverage'],'source-opening'))
# Executors: runnable checks/fixtures (7)
exec_tasks = [
('ExecCounterSelftests','Build isolated scratch fixtures for both frozen counters. For C1: honest receipt => 0, v1 receipt only => non-met, one mutated egress field => exit 1. For C2: mutated claims => d7 exit 1; absent D5/D6 => respective findings. Use `git -C <scratch repo>` explicitly, verify toplevel before fixture commits, and keep all scratch under your seat path.'),
('ExecDriverStress','Run the frozen round-39 driver with a pre-existing Firefox process owned by a separate process, then run the driver. Confirm only the new browser’s direct-node child and descendants enter `owned.tree`; confirm cleanup preserves the unrelated process and no external requests occur. Loopback only.'),
('ExecNumstatProtocol','Prepare a reproducible scratch procedure for the C2 numstat receipt: exact command `git diff --numstat <baseline>..<REV>` against a clean clone, header with both full hashes, and an independent comparison against the same diff. Do not write the final receipt; report a precise recipe and test it at current tip.'),
('ExecCensusScratch','Create a scratch mirror of corpus/SOURCES.md plus a synthetic S145 row and run `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/SOURCES.md`; confirm row schema and capture output/exit. Do not edit production registry.'),
('ExecQuarantineSlice','Re-derive the complete tabi quarantine slice from the absent-defect register using the exact awk command; report row count, IDs, and whether any summary row was accidentally included. Confirm every data row has an S-id. No source fetch required.'),
('ExecNoHarm','Run the lane’s documented self-tests / check-gate-registry selftest and counter selftests at current tip; record command, exit, and stable outputs. Do not modify the lane; use scratch for any fixture.'),
('ExecDriverSampleAudit','Run the driver with `--runs 2` in a fresh scratch output and independently inspect the sample timeline: samples monotonic, coverage duration consistent, both socket surfaces present, final sweep post-close. Report any sample gaps over 300ms.'),
]
for n,t in exec_tasks: items.append(item(n,'executor',t,['operability'],'executable-check'))
# Scribes: isolated drafts only; L1 integrates after settlement (6)
scribe_tasks = [
('ScribeKnowledge','Draft a candidate knowledge entry under your seat directory (not corpus/knowledge) describing only the session-bound TCP egress operation and its measured limits. Open the S145 source yourself and cite S145 provisionally; include source/verified-at/recheck provenance trio and a bounded claim. Do not claim UDP/QUIC coverage or external-site permission.'),
('ScribeLesson','Draft corpus/lessons/round-39.md content in your seat directory: ## Gate with at least one candidate admit and one reject (including assimilation candidate/reject status), source-access quote slot for S145, and ## Mistakes rows in required class · evidence · captured-by · fix form. The mistake should include the observed first /proc endianness parsing failure and its passing red/green comparison; do not mark anything as verified unless evidence exists.'),
('ScribeScorecard','Draft the SCORECARD round-39 declared claims and executed disposition sections from claims.json; include counters/commands, before/target, and clearly distinguish measured predicate from numeric axis score. Leave measured values as evidence-backed fields only; do not invent verdicts.'),
('ScribeLog','Draft an append-only LOG.md round-39 entry skeleton in your seat directory with frozen claims commit, baseline, instrument paths, the observed source, the mistake and planned landed commits; do not present unmeasured outcomes as done.'),
('ScribeSources','Draft an S145 candidate registry row in your seat dir only after opening the source; verify current max S-id from the committed registry; ensure 11 columns, no pipes, tier/scope/anchor/teaches/status/opened/recheck/used-by all satisfy CORPUS.md v1. Include the ≤25-word quote/location in your seat report.'),
('ScribeReport','Draft the final report section outline in your seat dir only, with exact required headings and placeholders clearly marked for L1 integration; do not fabricate commit hashes, wave results, or census outputs.'),
]
for n,t in scribe_tasks: items.append(item(n,'scribe',t,['depth','freshness'],'draft'))
# Connectors: overlap and integration pattern (3)
connector_tasks = [
('ConnSiblingOverlap','Sibling-overlap scan: read the fleet lane roster and sibling PROVINCE/SCORECARD/round-39 reports read-only for browser egress/session-bound evidence work. Report exact overlap or the bounded sweep used to find none. Never modify siblings.'),
('ConnPattern','Cross-claim pattern scan: compare C1 receipt binding and C2 sentence/measurement binding. Identify one shared failure class (if any) and whether the two claims are causally separable; cite exact paths/lines.'),
('ConnPlanAudit','Bounded planning data-walk: independently enumerate each frozen claim’s predicate clauses, counter checks, controls and integration dependencies. Flag any missing prerequisite before claim data and any item conflating frontier/quarantine work with claims.'),
]
for n,t in connector_tasks: items.append(item(n,'connector',t,['coverage','calibration'],'cross-surface'))
# Remaining taxonomy roles
items.append(item('SentinelScope','sentinel','Read-only security/scope review of the driver and counters: ensure loopback-only navigation, no secret reads, no external writes, no pacman, no fleet/sibling mutation, no global process kills, and scratch cleanup. Identify concrete path traversal, shell injection, or process ownership risks with evidence.',['safety','operability'],'scope-review'))
items.append(item('RevengerR38AttackSurface','revenger','Reverse-engineer round-38 C2 attack evidence (Critic18/20/21/26, MutationTester29) and assess whether round-39 C1 closes each original falsifier or merely changes the measurement surface. Report exact prior finding -> current check mapping and any surviving gap.',['calibration'],'reverse-engineering'))

assert len(items) == 64, f'expected 64, got {len(items)}'
roles = Counter(i['role'] for i in items)
assert sum(roles[r] for r in ('reviewer','critic','mutation-tester')) >= 16
assert len({i['name'] for i in items}) == 64
spec = {
 'wave':'tabi-r39-w1',
 'maxLanes':64,
 'reportDir':'.ufo/waves/round-39/w1',
 'context':'# Goal\nTabi round 39 (attempt 1), one v2 falsification wave (64 seats).\n'+COMMON,
 'items':items,
}
out=f'{LANE}/.ufo/waves/round-39/w1-spec.json'
json.dump(spec, open(out,'w'), indent=1)
print('items:',len(items),'roles:',dict(roles),'attack:',sum(roles[r] for r in ('reviewer','critic','mutation-tester')))
print('spec:',out)
