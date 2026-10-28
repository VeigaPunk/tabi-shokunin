#!/usr/bin/env python3
import json
from pathlib import Path

LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin'
ROUND=41
BASE='fecbdf0a3aa79ce17bce3ef7338f69112f604f88'
FREEZE='8c32528dd3ab04b75739a077d60884c22a085129'
SCRATCH='/fast/scratch/hyaku/tabi-r41'
GODSPEED='''You are a Godspeed-enabled subagent.

1. **Name the axes.**
2. **Iterate cheap, in parallel.**
3. **Keep moves that improve any axis and harm none.**
4. **Don't aim — let the frontier walk itself.**

## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.'''
CONTEXT=f'''# Goal
Tabi round 41, attempt 1. One v2 wave of 64 seats — build and attack items together. Two frozen claims: C1 coverage capability (measure-c1-round41 launches two Playwright Firefox loopback runs under a loader-clean environment boundary: exec-time /proc environ free of injection variables, execArgv without preload flags, producer digests pinned, fresh nonce bound to receipt+runs, >=8 increasing samples spanning >=1000ms, both ss/proc surfaces usable per sample/final sweep, >=1 owned-socket observation per run per surface, zero nonLoopback, refreshed identity-bound owned trees, an independent witness seeing driver+firefox descendants on >=10 samples, identical first shots, zero survivors, closed port, bound version, summary-per-sample agreement, wall-clock consistency; round-39/40 receipts refused) and C2 depth (knowledge entry on the environment-injection forgery class citing S146/S147 with a >=6-row vector decision table). Freeze commit: {FREEZE}. Baseline: {BASE}. The frozen C1 predicate sentence lives in .ufo/waves/round-41/claims.json and byte-identically in .ufo/waves/round-41/counters/c1-session-bound-v4.mjs.

Scope: your reports only under {LANE}/.ufo/waves/round-41/w1/<SeatName>/report.md. Production tree, fleet, siblings and shokuknow are read-only. No commits/pushes, no git/jj mutation, no agents spawned, no external site interaction — loopback and local files only; executors may run the committed instrument but must never write outside their scratch + report dir. Every Report trailer path is relative to {LANE}: write it at {LANE}/<that path>.

Tooling authorization (operator, 2026-10-19): you may install/upgrade tools that help the task; first read /home/vgpnk/.omp/agent/RULES.md (official channels only) and record tool/version/channel/reason. PACMAN GUARD: pacman transactions are PAUSED host-wide; never run pacman. No install is planned.

Scratch root: {SCRATCH}/<YourSeatName>/; mkdir -p it yourself and pass it explicitly. Delete it before yielding (trap or finally). /tmp only for files under 50 MB; never rely on inherited TMPDIR. Receipts that matter go in your report folder.

One wave item per seat, leaf only. Return one report with exact observed commands/output, evidence paths, limitations, and final `VERDICT ok|finding|could-not-evaluate ...` line. No claim verdict by assertion. Dead seats and missing reports are recorded, never replaced.'''

def add(name,role,task,axes,milestone):
    prompt=f'''{GODSPEED}

Item: {task}

Report: .ufo/waves/round-41/w1/{name}/report.md'''
    return {'name':name,'role':role,'prompt':prompt,'axes':axes,'milestone':milestone}

items=[]

# ---- attack seats: reviewers (15) ----
reviewers=[
('RevPredicateFit','Adversarially read .ufo/waves/round-41/claims.json against the v4 counter, the driver and the wrapper: which declared predicate clause is NOT checked anywhere (counter, gate, driver, witness, measure doc), which code check is NOT in the sentence? Enumerate clause-by-clause with file:line. Report whether the refused-receipt clause is enforced or decorative. Do not edit.'),
('RevBatteryReplay','Re-run `node scripts/measure-c1-round41.mjs --battery` in your scratch; compare output to controls/c1-battery.json; then compose TWO NEW environment attacks not in the battery (e.g. NODE_OPTIONS with -r form, --inspect, --import, LD_AUDIT, combined vectors, env -i clean-path) and show each either refused exit 2 or reaching driver spawn (a reach is a finding).'),
('RevEnvAllowlist','Attack the ENV_ALLOW list in measure-c1-round41.mjs: which allowed variable could still redirect execution or evidence (PATH→binary shadowing, PLAYWRIGHT_* missing-but-allowed?, TABI_RUN_NONCE visible to the forger via /proc/<driver>/environ)? For each, say whether it produces a false green under the frozen counter; run the verbatim forger reading the nonce from the driver environ if you can.'),
('RevGateInternals','Review GATE_SRC/runGate/selfEnvCheck/batteryProbe in measure-c1-round41.mjs: execArgv shape assumptions (--eval len==2), spawnSync error paths, parse failures, timeout paths. Find an invocation environment where the gate fails open (returns ok:true under contamination) or fails closed wrongly. Demonstrate in scratch.'),
('RevDriverGaps','Review playwright-firefox-egress-round41.mjs: per-sample tree refresh, startTicks comm/exe reads, ownedRoots matching, finalSweep semantics, refusal paths. Identify fields a forged driver could fake but an honest one cannot verify — and whether any are post-hoc detectable. Compare against the r40 driver diff.'),
('RevWitnessDesign','Review the WITNESS_SRC block + counter witness checks: 50 ms sampling, descendant re-derivation from nodePid, >=10-sample thresholds, environ names, nonce. Find a scenario where a no-browser run still satisfies every witness check, or an honest run fails them (timing, pid reuse, namespace, zombie).'),
('RevCounterLogic','Line-review c1-session-bound-v4.mjs: argument parsing, usable(), summary re-derivation, witness aggregation, digest pins, measure-doc checks. Find a finding set that exits 0 wrongly, a crash path (exit 2 on hostile receipt), or a clause silently weaker than the predicate sentence.'),
('RevStalePid','Analyze the startTicks window rule (runStartTicks-slack .. sample tTicks+slack): craft a synthetic receipt where a reused pid (same pid number, recycled) evades or trips the check wrongly; determine whether startTicks resolution at CLK_TCK permits an overlap false-green. Scratch fixtures only.'),
('RevZeroObs','F1 routed defect: verify the per-run zero-observation rule is the right fix, not per-sample. Build a receipt where Firefox holds sockets only during finalSweep, or where one surface legitimately observes zero while the other sees them — decide if the frozen rule fails closed or fails open in each.'),
('RevWallClock','Attack the wall-clock check (elapsedMs >= spanSum+500): measure doc is wrapper-self-reported — identify what binds elapsedMs to real time, and whether a shimmed driver that sleeps could satisfy it. Assess residual vs the declared threat model.'),
('RevDigestScope','Verify every digest pin in claims.json actually binds the executed bytes: measure hashes SELF/DRIVER/COUNTER at runtime — check for TOCTOU between hash and exec, import side effects, or paths read but not hashed (fixture files, playwright package, firefox launcher scripts).'),
('RevR40ReceiptAttack','Take the committed round-40 forged receipt (.ufo/waves/round-40/w1/CritControlReach/forged-receipt-F4.json): run counter v4 over it and enumerate every finding class it triggers; then hand-minimize it — which single field additions reduce findings toward zero while keeping it fake? Stop at any finding-free fake.'),
('RevClaimSeparation','Check C1 vs C2 causal separability: could C2 land while C1 stays unadmitted and vice versa? Check the check-c2 checker for overreach (does it assert the C1 capability result?) and underreach (can the entry exist without the table?).'),
('RevSourcesGrounding','Re-open S146 (nodejs.org cli.html NODE_OPTIONS) and S147 (proc_pid_environ.5) in your scratch; locate the registry quotes verbatim; judge tier=A and scope cells against actual page content; verify no duplicate URL in SOURCES.md; check the entry uses only what the sources say.'),
('RevFreezeIntegrity','Verify freeze integrity: sha256 each file named in claims.json frozenDigests at the freeze commit vs working tree; confirm the PREDICATE in the counter is byte-identical to claims.json predicate; confirm claims.json itself is committed at the freeze and which files the freeze did NOT pin (entry, README, SOURCES rows — is that a gap?).'),
]
for n,t in reviewers: items.append(add(n,'reviewer',t,['coverage','calibration'],'claim-review'))

# ---- attack seats: critics (8) ----
critics=[
('CritRealmHook','Declared residual: a caller-realm shim that hooks child_process.spawn/spawnSync/Worker BEFORE measure parses argv. Build a NODE_OPTIONS=--require shim that patches spawn to hide NODE_OPTIONS from gate children (or fake their output) and show whether measure can still reach exit 0 without a browser. This probes the declared residual — report exactly what reached where; do not modify committed files.'),
('CritNonceChannel','The forger must learn the 64-hex nonce to bind its receipt: enumerate every channel (argv, /proc/<pid>/environ, /proc/<pid>/cmdline, ps output, filesystem) a colocated attacker could read it from; judge whether nonce-binding adds any protection beyond replay freshness.'),
('CritTocTou','Time-of-check attacks: the counter re-hashes producer files AFTER the run — show whether editing a producer file between measure stage-1 and counter stage-3 (or after) changes the verdict; determine if the pins check is a guard or a post-hoc annotation.'),
('CritWitnessForge','Construct a witness JSON that satisfies every counter check (>=10 samples, nodePid descendants, ff exes, nonce, clean environ) with NO real run — does the counter exit 0 given a consistent fake receipt+witness+measure? If yes, identify exactly which leg must fail for the attack to matter, and whether that leg is attacker-reachable.'),
('CritFinalSweep','Attack finalSweep semantics: LISTEN sockets excluded (st==0A) while ss -Htnp may list listening sockets owned by firefox — does a surviving LISTEN port of a foreign process get attributed? Does portClosed check catch a different listener on the same port?'),
('CritSpanEdge','Boundary battery vs the counter: spans of exactly 999/1000/1001 ms, 7 vs 8 samples, ticks=0 vs ticks=1 vs ticks=1e-9, nonLoopback null/string/missing, unavailable flag variants — one mutation per fixture, exact findings.'),
('CritProcIpv6','/proc/net/tcp6 loopback classification: build rem values for ::1, ::ffff:127.0.0.1, and a real external v6, plus ss peer strings for each; verify isLoopbackHexRem/isLoopbackPeer agree; find an input where they disagree and the counter trusts one surface.'),
('CritForgerRetarget','Take fixtures/forger-round41.cjs: run it under the REAL measure command (env NODE_OPTIONS=--require forger-round41.cjs node scripts/measure-c1-round41.mjs --out <scratch fresh> --scratch <scratch>) and record exact exit + finding; then mutate the forger until something besides the env gate refuses it — or it wins.'),
]
for n,t in critics: items.append(add(n,'critic',t,['coverage'],'falsification'))

# ---- attack seats: mutation-testers (6) ----
mutations=[
('MutEnvCheckFields','Mutate receipt.envCheck one field at a time (readable false, forbiddenNames nonempty, execArgvClean false, envNonceEcho absent/mismatch/match) plus whole-field removal; run counter v4 per fixture; confirm each refused with the named finding; try a superset envCheck that passes.'),
('MutTreeIdentity','Mutate sample.treePids: missing startTicks, startTicks before runStartTicks-25 (stale), after tTicks+25 (future), null exe, non-firefox exe everywhere, exe " (deleted)" suffix, missing comm, empty array; one field per fixture; exact findings.'),
('MutWitnessDocs','Mutate the witness doc: schema, nonce, environ with NODE_OPTIONS, <10 samples, all samples missing nodePid, ff pids not descending from nodePid, no overlap with claimed pids; one per fixture; confirm findings.'),
('MutMeasureDoc','Mutate the measure doc leg: elapsedMs below spanSum+500, missing gate, self.forbiddenNames nonempty, execArgvClean false, child.ok false; confirm each refused; then feed a doc where elapsed is huge but samples are 1ms apart and judge the semantic gap.'),
('MutSummaryFields','Mutate only summary fields vs samples: sockets.ss.observations, egressNonLoopback, binding=false, survivors top-level, browserVersion empty — check F2 cross-checks catch each; find a summary field the counter does NOT cross-check (finding).'),
('MutDigestPins','Mutate digests: run counter with a claims.json whose frozenDigests were edited in scratch (do NOT edit committed claims.json) vs edited producer file bytes in a scratch copy — show which mismatch surfaces which finding, and whether an unedited-claims + edited-producer pair is caught.'),
]
for n,t in mutations: items.append(add(n,'mutation-tester',t,['coverage'],'mutation'))

# ---- attack seats: scouts (8) ----
scouts=[
('ScoutNodeDocs','Deep-open https://nodejs.org/docs/latest-v24.x/api/cli.html in scratch: enumerate EVERY env var Node 24 reads that can alter code loading, cert trust, inspector, worker, snapshot or module resolution (NODE_OPTIONS, NODE_PATH, NODE_EXTRA_CA_CERTS, NODE_PENDING_DEPRECATION, NODE_REPL_*, NODE_NO_*, NODE_V8_*, OPENSSL_CONF, SSL_CERT_*); check each against the FORBIDDEN_ENV regex and say which would pass the gate while still changing behavior.'),
('ScoutLdVectors','Recon the loader-variable class beyond LD_PRELOAD: LD_AUDIT, LD_BIND_NOW, LD_LIBRARY_PATH, LD_DEBUG, LD_PROFILE, LD_ORIGIN_PATH, LD_DYNAMIC_WEAK, GLIBC_TUNABLES — which could plausibly alter a node/firefox child; confirm the LD_.* class regex catches each; report any loader-ish var outside the class (e.g. MOZ_*, GTK_*, FONTCONFIG_*, XDG_*) that changes firefox behavior.'),
('ScoutProcEnviron','Verify proc_pid_environ(5) semantics on this host experimentally: does /proc/pid/environ reflect setenv/putenv/deletion? (C program or node child that calls putenv via a .so is out of scope — test what node CAN do: delete process.env.X, spawn env overrides, exec environ). Determine exactly which mutations leave traces the gate can see vs cannot.'),
('ScoutBrowserEnv','Enumerate environment variables Playwright 1.64 + Firefox 157 actually honor (PW_*, PLAYWRIGHT_*, MOZ_*): which could redirect the browser binary, profile, headless mode, or remote-debugging surface WITHOUT a forbidden name? Playwright source at /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright + docs.'),
('ScoutSiblingOverlap','Sibling-overlap scan: grep sibling PROVINCE.md files and recent sibling knowledge for browser-process/socket/proc-environ measurement claims that overlap this round (revenger, kaidoku, kasegi, tsukuroi, kengaku). Report overlaps vs unique ground; never edit siblings.'),
('ScoutRouteCheck','Verify the host route table in ~/.omp/agent/config.yml agentModelOverrides (read-only): which alias serves each role in this wave; report the exact map and whether any role lacks a mapping. Also record node --version and playwright package version from the pinned paths.'),
('ScoutPriorRounds','Fresh-start re-verification: re-read the last three rejected spot-checks (round-38/39/40-verifier-spotcheck.md) and list every routed defect marked for this lane; for each, point to the file/mechanism in the round-41 freeze that addresses it, or name it still-open.'),
('ScoutForgerArchaeology','Read .ufo/waves/round-40/w1/CritControlReach/* completely: reconstruct exactly how F4-full ran (command, env, exit, timing, artifacts), then verify fixtures/forger-round39.cjs is a faithful verbatim copy vs a retargeted rewrite — diff them and report deltas.'),
]
for n,t in scouts: items.append(add(n,'scout',t,['coverage','adjacency'],'recon'))

# ---- build seats: executors (6) ----
executors=[
('ExecCleanRun','Run the frozen counting command in your scratch: `node scripts/measure-c1-round41.mjs --out <your scratch>/receipt.json --scratch <your scratch>/run`; record exit, driver exit, counter predicate, findings, elapsed; verify the witness doc and receipt exist with the right shapes; then run counter v4 standalone over the produced receipt+witness+measure doc. Two attempts max.'),
('ExecSelftest','Re-run .ufo/waves/round-41/controls/c1-mutants.mjs --scratch <your scratch> and node scripts/check-c2-knowledge-round41.mjs --root /home/vgpnk/Projects/shokunin/tabi-shokunin; capture full outputs; then run the C2 checker against a git archive of baseline fecbdf0 in scratch and confirm the do-nothing findings list.'),
('ExecBatteryVariants','Beyond the committed battery: run measure --battery-probe under (a) NODE_OPTIONS="-r <fixture>" short form, (b) NODE_OPTIONS="--inspect=0", (c) GLIBC_TUNABLES=glibc.malloc.check=1, (d) MOZ_HEADLESS=1, (e) PLAYWRIGHT_BROWSERS_PATH=/nonexistent — record exit/finding for each and whether the allowlist should change.'),
('ExecWitnessTiming','Measure witness fidelity empirically: run measure once in scratch, then compare witness sample wall-clock coverage vs driver run window; count gaps where firefox ran but witness recorded nothing; compute whether 50ms cadence could miss a 30ms fake browser (run a synthetic /usr/bin/sleep renamed firefox under firefox-1555 dir? — loopback only, no real binary edits).'),
('ExecNoHarm','Run the lane gates in production mode against the working tree: check-sources, check-selfassessment, check-freshness --worktree, check-adjacency, check-frontier-admission, check-release-pins, check-measurement-binding --check corpus/evidence/round40/measurement-binding.json --reproduce, sources-census validate tabi; record each exit code; flag anything red that was not red at baseline.'),
('ExecInstrumentAudit','Statically diff round-40 driver/counter vs round-41: produce a precise change ledger (added checks, moved checks, removed checks) with line pointers; flag any round-40 check that silently disappeared and any new code path that is untested by c1-mutants.mjs.'),
]
for n,t in executors: items.append(add(n,'executor',t,['coverage','operability'],'execution'))

# ---- build seats: scribes (4) ----
scribes=[
('ScribeLesson','Draft corpus/lessons/round-41.md skeleton: ## Gate (claim freezes, controls run, source openings with dates/quotes for S146/S147), ## Mistakes slots for wave findings, census before/after slots. Read prior lessons for format. Draft only — do not edit corpus.'),
('ScribeScorecard','Draft the SCORECARD.md round-41 section text: claims table with counting commands, before→after slots, capabilities-row candidate wording for the playwright-firefox-session-bound capability (name per QUALITY 84: the transport operation, not the gate), saturation/planned updates. Draft only.'),
('ScribeLog','Draft the LOG.md round-41 entries: freeze commit, control receipts, wave dispatch/results placeholders, measurement command+output slots, sources registry rows added (S146/S147 old→new), trend verdict slots. Draft only.'),
('ScribeReport','Draft the fleet report skeleton for .ufo/reports/round-41/tabi.md: required sections in contract order (Work performed / Landed changes / Before→after / Sources & frontier / Trend verdicts / SHONEN / Stale-lane / tool installs), with evidence pointers filled where already known. Draft only.'),
]
for n,t in scribes: items.append(add(n,'scribe',t,['coverage','quality'],'drafting'))

# ---- connectors (3) ----
connectors=[
('ConnCrossClaim','Cross-claim pattern scan: compare the F4/F1/F3 fixes in this freeze with the three prior rejected claims (r38 unbound session, r39 span/self-reference, r40 env-injection) — is the same blind-acceptance pattern present anywhere ELSE in the round-41 chain? Name the single most likely fourth falsifier the wave should try.'),
('ConnFrontier','Check corpus/README.md ## Frontier + this round\'s entry: does the forgery-class entry advance or close a named frontier item? Which new frontier items does the hardened chain itself open (caller-realm hooks, sub-env native, sampling cadence)?'),
('ConnPlan','Bounded independent data-walk of the frozen round: baseline→freeze diff, claims.json, controls — restate in <=15 lines what must be TRUE for the round to admit, and the cheapest single thing that could still falsify it.'),
]
for n,t in connectors: items.append(add(n,'connector',t,['coverage','adjacency'],'cross-surface'))

# ---- support attack: sentinel + revenger (2) ----
items.append(add('SentinelSecrets','sentinel','Security review of the new surfaces: does the env-name list leak values (only names recorded — verify no values are captured anywhere); does the witness/receipt expose paths or environ data that should stay out of corpus; does any seat artifact path let a fixture escape into committed evidence; does the forger fixture write anywhere besides --out?',['coverage','calibration'],'security'))
items.append(add('RevngHistory','revenger','Reverse-engineer intent: read the r40 CritControlReach + CritTreeOwnership + CritSamplingGap reports and the verifier routed defects verbatim; verify each named routed defect (F4 env substitution, F1 zero-observation, F3 stale tree, census-receipt contemporaneity, spot-check requirement) maps to a concrete round-41 artifact; flag any routed defect with no addressing artifact.',['coverage','calibration'],'history'))

# ---- second attack batch: 4 critics + 4 mutation-testers + 2 labrats + 2 support ----
critics2=[
('CritProcSamples','Probe the sampling-cadence residual honestly: run the r41 driver once in your scratch (node scripts/playwright-firefox-egress-round41.mjs --out <scratch>/r.json --scratch <scratch>/s --nonce <64hex> under a scrubbed env with TABI_RUN_NONCE set) and tabulate per-sample ssObs/procObs — how many zero-observation samples occur in an honest run; could a sub-100ms non-loopback socket still hide? This bounds the declared residual, loopback only.'),
('CritClaimsSchema','Conformance review of claims.json vs the prior rounds schema (round-39/40 claims.json): missing fields the verifier expects, control entries whose commands cannot run as written (e.g. nonce placeholders), kill-rule clauses no check enforces. Report file:line.'),
('CritMeasureArgv','Attack measure-c1-round41 argv and path handling: --out path that exists, nested nonexistent dirs, relative vs absolute scratch, --out not .json suffix (witness/measure naming), out under a read-only dir, out inside lane tree vs scratch — show exact exits; any path that writes a receipt without evidence is a finding.'),
('CritC2CheckerReach','Attack check-c2-knowledge-round41.mjs itself: build a scratch lane root whose entry technically satisfies every check (trio, S146/S147 mentions, 6 arrow rows) while being wrong content (copied table, wrong sources); confirm the checker exits 0 on form — then decide whether that matters for C2 as declared.'),
]
for n,t in critics2: items.append(add(n,'critic',t,['coverage'],'falsification'))
mutations2=[
('MutSamplesBattery','Second mutation battery over receipt.samples: sample missing t, t as string/NaN/null, ss/proc objects absent entirely, extra unknown keys, treePids entries non-object, runs[0] absent fields; exact findings per case in scratch.'),
('MutWitnessTiming','Mutate witness timing fields: startedTicks after endedTicks, samples with tTicks out of order, witness rootPid != measure pid claim, duplicate pids across trees; which are checked vs silently accepted (finding if accepted).'),
('MutForgerMinimize','Minimize findings on the retargeted forger receipt: run counter v4 over .ufo/waves/round-41/fixtures/forger-round41.cjs forged output shape with a fake witness+measure doc you craft in scratch; remove fields one by one until findings disappear — report the minimal fake that still fails and what finally catches it.'),
('MutExecArgvFlags','Mutate execArgv concept directly: spawn the gate probe and counter with node --inspect-brk=0 / --experimental-loader flags yourself; record whether the probe detects them via execArgv or only via environ; map which flags appear where.'),
]
for n,t in mutations2: items.append(add(n,'mutation-tester',t,['coverage'],'mutation'))
labrats=[
('LabSocketObs','Empirical: run the r41 driver once in your scratch (scrubbed env, TABI_RUN_NONCE=<64hex> set) and tabulate the per-sample ssObs/procObs distribution — how many zero-observation samples occur in an honest run; report the empirical false-positive risk of the F1 per-run rule.'),
('LabEnvironEdge','Empirical environ edges on this host: env NODE_OPTIONS="" (empty), NODE_OPTIONS with only spaces, NODE_OPTIONS="-e process.exit(0)", duplicate NODE_OPTIONS entries, TABI_RUN_NONCE preset wrong vs absent — run scripts/measure-c1-round41.mjs --battery-probe under each; which is refused vs passes; report a vector table.'),
]
for n,t in labrats: items.append(add(n,'critic',t,['coverage'],'probe'))
items.append(add('SonicDigestCheck','reviewer','Verify every sha256 in claims.json frozenDigests and producerPins against the working-tree files and named binaries (sha256sum each); confirm the battery/mutants/replay control receipts exist and their JSON parses; report a table of matches/mismatches only.',['coverage'],'verification'))
items.append(add('SimpDeadCode','simplifier','Dead-code review of the three new files (measure, driver, counter) and the forger fixtures: unused imports/branches/constants (e.g. unused env names, unreachable refuse paths, imports never used); report only — do not edit.',['coverage','quality'],'review'))

assert len(items)==64, len(items)
spec={'wave':'tabi-r41-w1','maxLanes':64,'reportDir':'.ufo/waves/round-41/w1','context':CONTEXT,'items':items}
Path(LANE+'/.ufo/waves/round-41/w1-spec.json').write_text(json.dumps(spec,indent=2)+'\n')
from collections import Counter
print('items',len(items),'roles',dict(Counter(x['role'] for x in items)))
attack=sum(1 for x in items if x['role'] in ('reviewer','critic','mutation-tester'))
print('attack seats',attack,f'({attack/len(items)*100:.0f}%)')
