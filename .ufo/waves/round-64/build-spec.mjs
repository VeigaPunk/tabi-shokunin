#!/usr/bin/env node
// Builds the round-64 wave-1 spec (12 seats, one v1 wave, band 8-16).
// Usage: node build-spec.mjs --freeze <commit> [--out <path>]
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const freeze = opt('freeze');
if (!/^[a-f0-9]{40}$/.test(freeze || '')) { console.error('need --freeze <40-hex commit>'); process.exit(2); }
const out = opt('out') || path.resolve('.ufo/waves/round-64/w1-spec.json');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';
const WAVE_DIR = LANE + '/.ufo/waves/round-64/w1';
const SCRATCH_ROOT = '/fast/scratch/hyaku/tabi-r64';

const context = `# Target
Tabi round 64, ONLY wave w1, 12 seats. The L1 (TabiR64) holds the canonical planner seat; the validator forbids planner. Lane repo: ${LANE} (every lane path below is absolute). Fleet root ${FLEET} is READ-ONLY for you. Baseline 6c19979fe63f3b9ec35179ca57bb91c6356bff25; instrument/controls FREEZE ${freeze}.

Read ${LANE}/.ufo/waves/round-64/claims.json FIRST, then the frozen bytes it pins. Two claims only:
- C1 (coverage, capability \`chromium-wheel-scroll-domain-linux\`, second declared generation): a run-bound wheel/scroll receipt (nonce rendered in page pixels, 120 px band colours encoding scroll position, per-leg witness strip, fixture re-rendered from the pinned driver, server-log run binding, CDP Browser.getVersion identity) that the frozen counter accepts, AND a live verifier (\`scripts/verify-live-r64.mjs\`) that RUNS the frozen driver twice cold and requires both runs counter-clean, mutually agreeing, and agreeing with the committed evidence receipt. The r63 generation's failure was that a hand-written receipt reached its target; the counter here is evidence quality, the live verifier is the demonstration.
- C2 (calibration): \`scripts/check-receipt-provenance.mjs\` counts mismatches between the lane's control receipts and observed repo state (real argv, exit, committed stdout digest, inputs bound to bytes at the named revision, matrix input + producing command). Measured before on the r63 controls: 11 receipts / 34 failures (schema 11, stdout-bound 11, inputs-bound 11, argv-real 1).

# Contract
- You are a LEAF: never spawn subagents, never run a background job that outlives you, never write outside your item's paths.
- Read-only on frozen instruments: ${LANE}/scripts/chrome-cdp-loopback-round64.mjs, ${LANE}/.ufo/waves/round-64/counters/{chromium-wheel-r64.mjs,png-r64.mjs,make-negatives-r64.mjs,mutate-r64.mjs}, ${LANE}/scripts/verify-live-r64.mjs, ${LANE}/scripts/check-receipt-provenance.mjs, ${LANE}/.ufo/waves/round-64/controls/run-controls-r64.mjs, claims.json. Never edit them; report defects instead. A frozen byte change invalidates its claim.
- NEVER commit, push, stash, checkout or run any mutating git/jj command anywhere. Read-only git (log, show, diff, status, rev-parse, cat-file) is fine. Never touch ${FLEET} (fleet repo), sibling lane repos, .ufo/state/, or another lane's files.
- Every \`Report:\` trailer path the validator renders is relative to ${LANE} — write it at ${LANE}/<that path>. Your seat report is ${WAVE_DIR}/<YourName>.md and your receipts go in ${WAVE_DIR}/<YourName>/.
- Scratch: every clone/work tree/fixture lives under ${SCRATCH_ROOT}/<YourName>/ (mkdir -p). Never rely on an inherited TMPDIR and never write scratch under /tmp (files under 50 MB only). Remove your scratch dir before you yield (trap 'rm -rf -- "$S"' EXIT); a seat that leaves its tree reports that as its own defect. Receipts are copied into ${WAVE_DIR}/<YourName>/ first.
- Git fixtures: any fixture repo is \`D=$(mktemp -d -p ${SCRATCH_ROOT}/<YourName>) && git -C "$D" init -q\`, every later git call names \`-C "$D"\`, and \`git -C "$D" rev-parse --show-toplevel\` must equal \`$D\` before the first commit. Never commit with a throwaway identity anywhere else.
- Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help the task; read /home/vgpnk/.omp/agent/RULES.md first (official channels, update-safety gate; record tool/version/channel/reason in your report). PACMAN IS PAUSED host-wide: install via uv tool/npx/an official binary in ~/.local/bin, or file nothing and route around it; never pacman -Sy/-Syu/-U/-R or restart a host service.
- Honesty: an unrun check has not passed. Report every defect you find with its exact command and observed output; never fabricate a verdict. Your findings are advisory — the L1 integrates and scores.
- Deliverable shape: write your seat report (${WAVE_DIR}/<YourName>.md) with \`## Findings\` (numbered, each with severity, evidence pointer and exact command) and \`## Verdict\`; return a short JSON summary (seat, findings count, key evidence paths, verdict) as your final message.`;

const tasks = [
  {
    name: 'R64Scout', agent: 'scout', axes: ['coverage'],
    milestone: 'Open and stage the sources for the wheel/scroll + CDP input domain; located quotes; registry collision check',
    task: `# Target
Open the sources the round-64 claim cites or should cite. Stage raw bytes under ${WAVE_DIR}/R64Scout/ and record a located quote (<=25 words) with byte offset for each.

# Change
1. Fetch and stage: MDN WheelEvent (https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent), the Chrome DevTools Protocol Input domain (https://chromedevtools.github.io/devtools-protocol/tot/Input/ — dispatchMouseEvent/mouseWheel), the CDP Page domain captureScreenshot section, and the CSSOM View scrolling section (https://drafts.csswg.org/cssom-view/).
2. For each, give the exact section/anchor, a <=25-word verbatim quote located in the staged bytes, and what it grounds (and what it does NOT ground). Name the rejections too (e.g. a page that only lists property semantics cannot ground cross-build pixel identity).
3. Registry collision check: extract the lane's existing SOURCES ids (\`grep -oE '^ {0,3}\\|[[:space:]]*S[0-9]{3,}' ${LANE}/corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort\`) and the URLs of the rows you propose, and report whether any URL is already held (a duplicate URL is an E03/E04 census finding).
4. Read ${LANE}/corpus/knowledge/chromium-wheel-scroll-round-63.md and say which of its stated unknowns the new sources can and cannot ground.

# Acceptance
${WAVE_DIR}/R64Scout.md with a table (candidate | URL | anchor | located quote | word count | grounds / rejects) plus ${WAVE_DIR}/R64Scout/staged/*.html, a quotes.json with byte offsets, and a collision check output. Every quote must be findable verbatim in the staged bytes.`,
  },
  {
    name: 'R64ExecDriver', agent: 'executor', axes: ['coverage'],
    milestone: 'Independently re-run the frozen r64 driver twice cold and verify stability, teardown and the driver pin',
    task: `# Target
Independently reproduce the live behaviour C1 rests on, from your own scratch, without trusting the L1's runs.

# Change
1. Copy nothing into the lane; run the frozen driver directly: \`node ${LANE}/scripts/chrome-cdp-loopback-round64.mjs --scratch <your scratch>/work-a --out <your scratch>/a/receipt.json --nonce tabi-r64-driver-a --http-port <free> --cdp-port <free>\` and the same with \`tabi-r64-driver-b\` into b/. Check the driver pin first (\`sha256sum\` against claims.json).
2. Run the frozen counter on each receipt (\`--driver ... --expect-driver-sha256 <pin> --shot <run dir> --json\`) and record exit + findings.
3. Compare the two runs: legs (name/scrollY/wheellogLen/witnessRgb), wheellog minus ts, pageState. Do the shots differ? Explain why (nonce-bound grid) and verify the nonce grid and band pixels decode as claimed for BOTH runs.
4. Teardown: check the receipt's sweeps/teardown fields, then independently confirm no chromium process with your launch token survives and both ports are closed (\`ss -ltnp\`, \`ps -eo pid,args | grep <token>\`). Report any survivor.
5. Report the wall-clock cost of one run and any nondeterminism you observe (PNG byte equality within a run vs across runs).

# Acceptance
${WAVE_DIR}/R64ExecDriver.md: per-run exit codes, counter findings, a field-by-field cross-run diff (0 or listed), teardown evidence, and a verdict on whether an independent party can reproduce the claim. Receipts in ${WAVE_DIR}/R64ExecDriver/.`,
  },
  {
    name: 'R64ExecNeg', agent: 'executor', axes: ['coverage'],
    milestone: 'Build an independent negative set from the receipt schema and run the production CLI',
    task: `# Target
Attack the frozen counter with your OWN negative set, not the declared one.

# Change
1. Read the receipt schema from the frozen driver (${LANE}/scripts/chrome-cdp-loopback-round64.mjs) and the checks in ${LANE}/.ufo/waves/round-64/counters/chromium-wheel-r64.mjs. Do not reuse counters/make-negatives-r64.mjs.
2. Produce at least 20 single-change forgeries of the committed smoke receipt (${LANE}/.ufo/waves/round-64/controls/smoke/receipt.json) plus its shots: wrong schema, nonce swap, driver pin, fixture digest, origin, argv, leg order, scroll values, wheellog fields (seq/deltaY/deltaMode/isTrusted/cancelable/defaultPrevented/targetId/scrollYAtDispatch), pageState, server log, host identity, teardown, sweeps, failures, predicate/hypothesis polarity BOTH ways, plus pixel forgeries (1x1 PNG, borrowed PNG from another leg, one recoloured grid cell, one recoloured band sample, wrong witness colour, cropped shot).
3. Run the production CLI on every forgery and record exit + findings. Count forgedGreen (forgeries the counter accepts).
4. Also try the opposite direction: two receipts that are legitimate but odd (e.g. a run with the same nonce twice, a shot dir with an extra unused PNG) and say whether the counter's verdict is right.

# Acceptance
${WAVE_DIR}/R64ExecNeg.md with the forgery table (id | single change | expected refusal | exit | findings), the forgedGreen count, and any check that no forgery can reach. Receipts in ${WAVE_DIR}/R64ExecNeg/.`,
  },
  {
    name: 'R64ExecGate', agent: 'executor', axes: ['calibration'],
    milestone: 'Reproduce the C2 provenance gate before/after and audit every counted receipt',
    task: `# Target
Audit ${LANE}/scripts/check-receipt-provenance.mjs: is its before-state real, is its after-state reachable without work, and does every counted receipt survive an independent reading?

# Change
1. Run the gate's selftest and the before-run exactly as the claims file names them. Confirm the before count (11 receipts / 34 failures) by reading the r63 receipts yourself: list each failing check and whether the failure is real (a receipt that cannot be re-derived) or a gate artefact.
2. In a sandbox clone at the freeze revision (git clone --shared into your scratch), build the after-population shape: take the round-64 control receipts and check, per receipt, that (a) argv is a real argv, (b) stdoutFile digest matches, (c) every input resolves at the receipt's rev with the recorded digest. Report any receipt that passes the gate but is not actually re-derivable, and any that fails it unfairly.
3. Try to reach the gate's target with no work: can a receipt be fabricated (argv/exit/stdout/inputs) that passes? Build one and say what the gate cannot see.
4. Check the gate's own negatives (selftest cases) are one per check id and that a blanket-refusing gate would fail the clean case.

# Acceptance
${WAVE_DIR}/R64ExecGate.md: the reproduced before table, a per-check soundness verdict, the no-work fabrication attempt with its exact receipt, and a verdict on whether "0 failures at the scored population" is a real improvement or a gameable one. Receipts in ${WAVE_DIR}/R64ExecGate/.`,
  },
  {
    name: 'R64Scribe', agent: 'scribe', axes: ['coverage'],
    milestone: 'Draft the generation-2 wheel/scroll knowledge entry, SOURCES rows and README row',
    task: `# Target
Draft (do not commit) the round-64 knowledge entry and registry rows in your wave dir, in the lane's existing voice.

# Change
1. Read ${LANE}/corpus/knowledge/chromium-wheel-scroll-round-63.md, ${LANE}/corpus/QUALITY.md, ${LANE}/corpus/README.md (coverage map + Frontier), and the newest 3 entries in ${LANE}/corpus/SOURCES.md.
2. Write ${WAVE_DIR}/R64Scribe/chromium-wheel-scroll-round-64.md: the generation-2 model (six legs, six shots, nonce-in-pixels binding, band-colour scroll encoding, witness strip, server-log run binding, CDP Browser.getVersion), the measured values from the committed smoke receipt, an as-of table with one command per row, and an explicit \`## Limits\` that says the counter is synthesis-equivalent (a synthesized rendering passes) and that the demonstration is the live verifier.
3. Write the SOURCES rows the entry cites, in the lane's 11-column schema, with the ids you propose (do not collide with existing ids) and a recheck cell that is a valid ISO date / \`NNd\` / symbolic cadence. Record which rows the entry's \`source:\` header cites and nothing else.
4. Write the README coverage row for the new entry.
5. State every value as [measured] / [sourced] / [unknown]; no value you did not read from committed bytes.

# Acceptance
${WAVE_DIR}/R64Scribe.md summarising decisions + the three drafted files under ${WAVE_DIR}/R64Scribe/draft/. The SOURCES rows must parse as 11 columns (no literal or escaped pipe inside a cell) and must not reuse an existing id.`,
  },
  {
    name: 'R64Connector', agent: 'connector', axes: ['adjacency'],
    milestone: 'Sibling-overlap scan for the wheel/scroll and receipt-provenance ground',
    task: `# Target
Scan the sibling lanes for overlap with this round's two claims; nothing is absorbed.

# Change
1. For each lane repo under ${FLEET} (read-only): grep for wheel/scroll, CDP Input.dispatchMouseEvent, captureScreenshot, receipt provenance, sha256-pinned evidence gates, and live-verifier patterns.
2. Classify every hit: same-surface (a sibling already holds this ground), adjacent-new (a sibling holds something the claim should cite), third-lane-report (a sibling reported it), or no-claim.
3. Report registry collisions: any sibling \`corpus/SOURCES.md\` row whose URL matches the two URLs the lane proposes.
4. Say explicitly whether any sibling could absorb this round's ground instead of tabi.

# Acceptance
${WAVE_DIR}/R64Connector.md: a per-lane table (lines scanned, same-surface, adjacent-new, third-lane-report), the collision result, and one paragraph on contested scope.`,
  },
  {
    name: 'R64Reviewer', agent: 'reviewer', axes: ['coverage', 'calibration'],
    milestone: 'Attack C1 do-nothing standard and C2 gate: cheapest passing forgery, cheapest failing receipt',
    task: `# Target
Break both claims the way the r63 closure broke C1.

# Change
1. C1: construct the CHEAPEST receipt+shots that the frozen counter accepts without running a browser (you have the fixture geometry and the PNG codec; that is the point). Record its cost in lines of code and wall-clock. Then say whether the live verifier closes the gap: can you satisfy \`scripts/verify-live-r64.mjs\` without executing the frozen driver (e.g. by writing a fake driver, by pre-seeding the scratch dirs, by racing the port allocation)? Try at least two of those.
2. C1: verify the claim's target sentence is exactly what the verifier enforces (two runs, counter-clean, cross-run agreement, evidence agreement). Name any sentence in claims.json that no command enforces.
3. C2: find a receipt that passes the provenance gate but is not re-derivable, and one that is re-derivable but fails it.
4. Check the kill rules: which one would fire first if the counter were weakened, and is any rule unreachable?

# Acceptance
${WAVE_DIR}/R64Reviewer.md with H-numbered findings, each with the exact command and observed exit, plus a verdict: does C1's target survive a do-nothing control, and is C2's after-state reachable without work? Receipts in ${WAVE_DIR}/R64Reviewer/.`,
  },
  {
    name: 'R64Critic', agent: 'critic', axes: ['calibration'],
    milestone: 'Falsify the claims: target vs counters, kill rules, claim text fidelity',
    task: `# Target
Falsify the two claims on their text, not on their instruments.

# Change
1. Read claims.json line by line. For each number in a \`target\` or \`afterCommand\`, find the command that emits it and run it. Report every target value that no command prints, every prose claim with no counter, and every counter output the claim does not name.
2. Check the claim text against the r63 routed defects (D1-D9 in ${LANE}/corpus/lessons/round-63-verifier-spotcheck.md §6): which are closed by this round's work, which are declared limits, which are silently dropped?
3. Check the kill rules for vacuity (a rule that can never fire) and for blanket refusal (a rule a broken instrument would satisfy).
4. Check axis assignment: is C1 coverage (a new surface) and C2 calibration (self-assessment vs repo state) per AXES.md? Would a do-nothing control reach either target? Name the cheapest control for each and whether it was committed.
5. Check the frozen-before-scoring ordering claim: are the failing-before controls actually committed before the freeze revision?

# Acceptance
${WAVE_DIR}/R64Critic.md: a finding per claim item (id | claim line | command | observed | verdict), the vacuity list, the axis verdict, and one sentence per r63 D-item. Receipts in ${WAVE_DIR}/R64Critic/.`,
  },
  {
    name: 'R64MutCounter', agent: 'mutation-tester', axes: ['coverage'],
    milestone: 'Exact-line mutants over the r64 counter; kill matrix',
    task: `# Target
Mutate the frozen counter independently of counters/mutate-r64.mjs and report survivors.

# Change
1. Take the frozen counter (pin it with sha256sum first). Produce at least 12 single-line mutants in the LOOSENING direction (a check that stops refusing): drop a conjunct, widen a bound, replace an equality with >=, drop a pixel comparison, drop a finding push, invert a polarity, remove an early return.
2. For each mutant: does it still accept the live smoke receipt (else it is blanket refusal, not a survivor)? Does it accept at least one declared negative (${LANE}/.ufo/waves/round-64/controls/negatives/) or one of your own forgeries? Report survivors with the exact mutated line.
3. Report which checks are only covered by an implied other check (a dead conjunct), and which have no negative at all.

# Acceptance
${WAVE_DIR}/R64MutCounter.md: mutant table (id | mutated line | liveExit | negativesAccepted | survivor), the survivor list with a proposed negative for each, and the dead-conjunct list. Mutants + matrix in ${WAVE_DIR}/R64MutCounter/.`,
  },
  {
    name: 'R64MutDriver', agent: 'mutation-tester', axes: ['coverage'],
    milestone: 'Driver-side lies: fabricate receipts and shots, attack the live verifier',
    task: `# Target
Attack the driver and the verifier from the inside: what can a caller make the receipt say?

# Change
1. Copy the frozen driver into your scratch (never edit the lane copy) and produce at least 8 mutations: drop a leg, swap two legs' shots, reuse one shot for all legs, change the witness table, shrink the viewport, report a scrollY the page never reached, make the page not swallow the wheel (so the swallowed leg scrolls), report a foreign nonce, skip the server-log run binding.
2. For each mutant driver, run it live and run the frozen counter on its output. Report which lies the counter catches and which pass.
3. Attack the live verifier: (a) replace the driver with a wrapper that runs the real driver once and copies the receipt twice; (b) pre-create the scratch run dirs with forged receipts and see whether the verifier overwrites them; (c) make the counter refuse both runs and see whether the verifier distinguishes a broken instrument from a broken run.
4. Report the cheapest way to make the verifier exit 0 without a real wheel session.

# Acceptance
${WAVE_DIR}/R64MutDriver.md: the mutation table (lie | counter exit | findings), the three verifier attacks with observed exits, and a verdict on what the verifier actually proves. Receipts in ${WAVE_DIR}/R64MutDriver/.`,
  },
  {
    name: 'R64Sentinel', agent: 'sentinel', axes: ['operability'],
    milestone: 'Containment, egress and credential-surface audit of driver and verifier',
    task: `# Target
Audit the round-64 driver and verifier for containment and credential surface, on this host.

# Change
1. Read ${LANE}/scripts/chrome-cdp-loopback-round64.mjs and ${LANE}/scripts/verify-live-r64.mjs. Check: scratch containment (is \`inside()\` lexical or realpath? demonstrate a bypass with an ancestor symlink in YOUR scratch, reading nothing of the operator's), the XDG/HOME redirect set (which XDG_* variables are NOT redirected), profile path token-keying, port binding address, and whether the driver can write outside --out/--scratch.
2. Egress: during a live run, sample established TCP connections of the browser process (\`ss -tnp\` filtered by your launch token / port) and the fixture server log. Report every non-loopback peer and whether any page request left the fixture origin.
3. Credential surface: does any receipt, log or scratch file contain session material, cookies, or operator paths? Grep your own run artifacts for cookie-shaped and token-shaped strings.
4. Run the verifier's port allocation: can two concurrent verifier runs collide, and what happens when a port is taken (exit code, finding id)?

# Acceptance
${WAVE_DIR}/R64Sentinel.md: F-numbered findings with severity and exact commands, the egress table, the containment bypass demonstration (or a statement that none was found with the commands you ran), and a verdict on whether the instruments are safe to run unattended. Receipts in ${WAVE_DIR}/R64Sentinel/.`,
  },
  {
    name: 'R64Revenger', agent: 'revenger', axes: ['coverage'],
    milestone: 'Independently reconstruct the red-before and the pixel arithmetic in Python',
    task: `# Target
Reconstruct, independently and in another language, what the round claims the r63 generation could not do and what the r64 pixels prove.

# Change
1. In Python (no lane code), decode the committed smoke shots (${LANE}/.ufo/waves/round-64/controls/smoke/*.png) with zlib and no external image library. Verify: dimensions, the 256-cell nonce grid against sha256(nonce) bits, the band colour at the four sample rows for each leg's scrollY, and the witness strip colour per leg.
2. Reconstruct the red-before: take the r63 committed receipt and its shots, and show what the r63 counter accepted that the r64 counter refuses (run both counters if you can; otherwise state what the r64 checks require and which r63 fields are absent).
3. Re-derive the scroll arithmetic from the pixel evidence alone (band index -> scrollY) and compare to the receipt's legs. Report any leg where pixels and receipt disagree.
4. Say what a forger would have to do to produce six shots that satisfy the pixel checks without rendering, and whether that is cheaper or dearer than running the driver.

# Acceptance
${WAVE_DIR}/R64Revenger.md: the Python verifier (in ${WAVE_DIR}/R64Revenger/), its per-leg output, the red-before reconstruction, and the cost comparison. State your Python's independence explicitly (no imports from the lane).`,
  },
];

const spec = {
  wave: 'w1',
  milestone: 'Round64 second-generation wheel/scroll capability plus receipt-provenance calibration, attacked by 12 seats',
  reportDir: '.ufo/waves/round-64/w1',
  context,
  maxLanes: 16,
  items: tasks,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(spec, null, 1));
console.log(JSON.stringify({ spec: out, items: tasks.length, roles: tasks.reduce((a, t) => (a[t.agent] = (a[t.agent] || 0) + 1, a), {}) }));
