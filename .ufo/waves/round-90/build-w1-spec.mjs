#!/usr/bin/env node
// Builds the round-90 w1 spec from the frozen freeze.txt + the scored receipt's identity.
// Usage: node build-w1-spec.mjs <lane> <wave-dir> <scoredReceipt> <nonce> <base>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [lane, waveDir, scored, nonce, base] = process.argv.slice(2);
if (!lane || !waveDir || !scored || !nonce || !base) { console.error('usage'); process.exit(2); }
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pins = {};
for (const m of fs.readFileSync(path.join(lane, '.ufo/waves/round-90/freeze.txt'), 'utf8').matchAll(/^([0-9a-f]{64})  (\S+)$/gm)) pins[m[2]] = m[1];
const rec = JSON.parse(fs.readFileSync(scored, 'utf8'));
const fixture = rec.fixture.sha256;
const driver = pins['scripts/chrome-cdp-showpicker-round90.mjs'];
const ABS = (p) => path.join(lane, p);
const R = (p) => path.join(lane, '.ufo/waves/round-90', p);
const S = (name) => `/fast/scratch/hyaku/tabi-r90/${name}`;
const PS = R('controls/c1/prior-set.txt');
const receipt = path.join(lane, 'corpus/evidence/round90/chromium-showpicker/receipt.json');

const context = [
  '# Target',
  `Tabi round 90, one v1 wave \`w1\`. L1 \`TabiR90\` holds the planner seat and is the sole integration owner. Lane ${lane}; base ${base}; instrument freeze D (sha256 in ${R('freeze.txt')}); scored receipt nonce ${nonce}, receipt ${receipt} (fixture sha256 ${fixture}, driver ${driver}).`,
  `Claims are FROZEN in ${R('claims.json')}; instrument pins in ${R('freeze.txt')}. Never propose amending a predicate, counter, pin, prior, threshold or kill rule; attack them.`,
  '',
  '# Contract',
  `- Scratch root: /fast/scratch/hyaku/tabi-r90/<your seat name>/ — create it with mkdir -p, pass it explicitly, and delete it before you yield (receipts first copied under ${R('w1')}). Never write under /tmp.`,
  `- Every \`Report:\` trailer path is relative to ${lane} — write it at ${lane}/<that path>.`,
  `- Leaf member: no subagent dispatch, no background jobs, no commits, no git/jj mutation anywhere, no edits outside ${lane}; read-only seats write only their own report file.`,
  `- Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help the task — first read /home/vgpnk/.omp/agent/RULES.md (official channels, update-safety gate, record tool/version/channel/reason in your report). ALL pacman transactions are PAUSED host-wide: install via \`uv tool\`/\`npx\`/an official binary in ~/.local/bin, or file the need in your report. Never -Sy/-Syu/-U/-R and never restart a host service.`,
  `- Instrument commands (read the pinned files; never edit them): counter ${ABS('scripts/check-showpicker-round90.mjs')}; battery ${ABS('scripts/negatives-showpicker-round90.mjs')}; kill power ${ABS('scripts/kill-power-round90.mjs')}; drift ${ABS('scripts/check-record-drift-round90.mjs')}; selftest ${ABS('scripts/selftest-r90-gates.mjs')}.`,
  `- C1 is the settle-call binding: the four domread legs must carry a distinct \`Runtime.evaluate\` of \`window.__inputs(true)\` immediately after the settle \`window.__state()\` evaluate, and no other leg may carry it. C2 is the eight statements of the r89 spot-check's six routed defects (${ABS('corpus/lessons/round-89-verifier-spotcheck.md')} §7).`,
].join('\n');

const items = [
  {
    name: 'R90Exec1', role: 'executor', axes: ['coverage', 'operability'], milestone: 'C1 cold-run reproduction',
    prompt: `Run the frozen driver twice under fresh nonces and distinct port triples, all under ${S('R90Exec1')}:\n\nnode ${ABS('scripts/chrome-cdp-showpicker-round90.mjs')} --lane ${lane} --nonce tabi-r90-cold1-cold00001 --scratch ${S('R90Exec1/cold1')} --out ${S('R90Exec1/cold1.json')} --http-port 19990 --cdp-port 19991 --child-port 19992\nnode ${ABS('scripts/chrome-cdp-showpicker-round90.mjs')} --lane ${lane} --nonce tabi-r90-cold2-cold00002 --scratch ${S('R90Exec1/cold2')} --out ${S('R90Exec1/cold2.json')} --http-port 19993 --cdp-port 19994 --child-port 19995\n\nScore each cold receipt with the frozen counter, using its OWN nonce and fixture sha256 and prior-set ${PS}:\nnode ${ABS('scripts/check-showpicker-round90.mjs')} --lane ${lane} --receipt <cold.json> --expect-driver-sha256 ${driver} --expect-nonce <that nonce> --expect-fixture-sha256 <that receipt's fixture sha256> --prior-set ${PS} --json\n\nReport: both exits and verdicts, checkCount, the four domread legs' send-log tail (state -> inputs(true) -> dismiss) from the first cold receipt, and whether each cold run reproduces the scored receipt's law set. State honestly if a cold run refuses and why.`,
  },
  {
    name: 'R90Exec2', role: 'executor', axes: ['operability'], milestone: 'leg (b) re-measure',
    prompt: `Re-measure C1 leg (b) from committed bytes under ${S('R90Exec2')}:\n\nnode ${ABS('scripts/negatives-showpicker-round90.mjs')} --lane ${lane} --real ${receipt} --expect-driver-sha256 ${driver} --expect-nonce ${nonce} --expect-fixture-sha256 ${fixture} --prior-set ${PS} --work ${S('R90Exec2/battery')} --json\nnode ${ABS('scripts/kill-power-round90.mjs')} --lane ${lane} --real ${receipt} --expect-driver-sha256 ${driver} --expect-nonce ${nonce} --expect-fixture-sha256 ${fixture} --prior-set ${PS} --work ${S('R90Exec2/killpower')} --json\nnode ${ABS('scripts/selftest-r90-gates.mjs')} --lane ${lane} --work ${S('R90Exec2/selftest')} --json\n\nReport cases/failed/coverage, mutants/killed/survived/crashed/unapplied and every survivor name, and the selftest gate list with each gate's ok. If the battery reports an uncovered check or a failing case, paste the case name and detail — do not repair it.`,
  },
  {
    name: 'R90Exec3', role: 'executor', axes: ['calibration', 'operability'], milestone: 'C2 before/after and do-nothing controls',
    prompt: `Reproduce C2's before-state and the C1 do-nothing controls, all under ${S('R90Exec3')}:\n\n(1) git -C ${lane} worktree add --detach ${S('R90Exec3/base')} ${base}, then node ${ABS('scripts/check-record-drift-round90.mjs')} --lane ${S('R90Exec3/base')} --json; report claims/mismatches/failed ids (expect 7 with scorecard-tallies green). Remove the worktree when done (git -C ${lane} worktree remove --force ${S('R90Exec3/base')}).\n(2) Score ${ABS('corpus/evidence/round89/chromium-showpicker/receipt.json')} under the r90 counter (expect exit 1 with \`schema\` and \`plan-calls\`) and a nonexistent receipt path (expect exit 2 \`receipt-unreadable\`).\n(3) Run the drift gate's own --selftest and report fixtureAbsent/decoyPresent and the eight failed ids.\n\nReport each exit, the finding ids, and whether the do-nothing controls are red for the intended reason.`,
  },
  {
    name: 'R90Exec4', role: 'executor', axes: ['coverage'], milestone: 'settle-call refusal matrix',
    prompt: `Build a refusal matrix for the settle-call binding, under ${S('R90Exec4')}: take the scored receipt clone and produce at least eight mutations of ONE domread leg's send log or another leg's send log — remove the call, rename it to the plain \`window.__inputs()\`, duplicate it, move it after the dismiss, add it to a non-domread leg, change \`returnByValue\`, insert an extra evaluate between state and settle, swap two legs' logs — and score each with the frozen counter. Record which check id refuses each mutation and which mutations pass (a pass is a finding about the binding's reach). Report the table and the exact commands. Never edit lane files.`,
  },
  {
    name: 'R90Review1', role: 'reviewer', axes: ['coverage', 'calibration'], milestone: 'count reproduction and pin audit',
    prompt: `Re-run C1's counting command from committed bytes on ${receipt} with every pin, and verify every sha256 in ${R('freeze.txt')} against the committed bytes (git -C ${lane} show <branch>:<path> | sha256sum). Audit the prior set: are prior1/prior2 genuine r90 receipts with 41 legs, zero failures, distinct nonces/ports, and do they score clean against each other's prior-set? Report whether the fixture pin is counter-enforced or declaration-level, and whether \`plan-calls\` really requires the settle call (read the check, then prove it with one mutated receipt in ${S('R90Review1')}).`,
  },
  {
    name: 'R90Review2', role: 'reviewer', axes: ['coverage'], milestone: 'settle-call attribution attack',
    prompt: `Attack the settle-call attribution: can a receipt pass the counter while the four domread legs' \`domRead\` data was NOT produced by the call in the send log? Construct at least six forgeries in ${S('R90Review2')} (forged domRead + a copied call id from another leg; call present but domRead taken from another leg; call with the right expression but a different contextId; two calls where one is the plain expression; the call moved one position later; a leg whose send log ids are renumbered around the swap) and score each. Report which forgeries the counter refuses, which it accepts, and what the acceptance means for the claim's wording. Quote the check's source lines.`,
  },
  {
    name: 'R90Critic', role: 'critic', axes: ['calibration'], milestone: 'claims vs instruments',
    prompt: `Falsify the claims as written (${R('claims.json')}). C1: does the claim's sentence ("the settle call is bound") overstate what \`plan-calls\` enforces — is a call with the right expression and a swapped-leg attribution caught? Does the claim name a surface the round actually moved, and is the "before" (the r89 receipt refused with plan-calls) real on the committed bytes? C2: are the eight statements the six routed defects, or has a statement been widened/narrowed? Does any statement pass for a reason other than the defect (e.g. a file missing)? Does the drift gate's \`r89-leak-enforcement\` statement test the gate's source text rather than its behaviour? Report each finding with the line numbers and a verdict per claim.`,
  },
  {
    name: 'R90Mut1', role: 'mutation-tester', axes: ['coverage', 'calibration'], milestone: 'independent mutant sweep',
    prompt: `Independent mutation sweep: write at least 25 semantic mutants of ${ABS('scripts/check-showpicker-round90.mjs')} and ${ABS('scripts/check-record-drift-round90.mjs')} in ${S('R90Mut1')} (weaken or flip one clause each: the settle-call requirement, the settle-order requirement, the unexpected-settle rule, the wants-sequence, the domRead binding, the eight drift statements, the selftest assertions). Score each mutant against the frozen battery (and for the drift gate against a fixture lane where the statement should be red). Report the killed/survived/crashed/unapplied table and name every survivor with the clause it weakens. Do not use the frozen kill-power list.`,
  },
  {
    name: 'R90Scout', role: 'scout', axes: ['coverage', 'freshness'], milestone: 'source re-opening',
    prompt: `Re-open the sources the round cites. Fetch https://html.spec.whatwg.org/multipage/input.html (expect HTTP 200, ~687,515 B, sha256 b0202de1c0b4...) and https://html.spec.whatwg.org/multipage/common-microsyntaxes.html (expect HTTP 200, ~121,595 B, sha256 2e9e2cbbe1ed...), stage both under ${S('R90Scout')}, and locate with exact anchor: (a) the \`accept\` attribute's "hint" sentence and its word count; (b) the \`set of comma-separated tokens\` dfn and its word count; (c) whether either page assigns a case rule to accept matching. Verify staging is byte-identical to live (sha256). Report the located quotes, their line/paragraph locators, word counts (wc -w), and whether the r89 lesson's Gate quote (17 words) is verbatim at the dfn. No lane edits.`,
  },
  {
    name: 'R90Scribe', role: 'scribe', axes: ['depth', 'calibration'], milestone: 'record drafts',
    prompt: `Draft independently (write only under ${S('R90Scribe')} and your report): (a) the round-90 knowledge-note body for the settle-call binding — laws, leg facts, declared limits (compare with ${ABS('corpus/knowledge/chromium-showpicker-runtime-round-90.md')} and list divergences); (b) the round-90 lesson Gate source rows with located quotes and word counts; (c) the SCORECARD round-90 section's claim table wording and the capability row text; (d) three \`## Mistakes\` candidates with class/evidence/captured-by/fix. Do not edit lane files.`,
  },
  {
    name: 'R90Connector', role: 'connector', axes: ['adjacency'], milestone: 'sibling-overlap scan',
    prompt: `Sibling-overlap scan (read-only): grep /home/vgpnk/Projects/shokunin/*-shokunin/corpus/knowledge, SCORECARD.md and scripts for \`__inputs(true)\`, \`settle-eval\`, \`plan-calls\`, \`record-drift\`, \`domRead\`, \`setFileInputFiles\`, \`showPicker\`. Report which lanes hold the same ground (path + one-line state), whether anything this round plates is contested, and one pattern this lane should reuse. No edits anywhere.`,
  },
  {
    name: 'R90Sentinel', role: 'sentinel', axes: ['calibration'], milestone: 'bounds and provenance audit',
    prompt: `Adversarial bounds/provenance audit: (1) every sha256 in ${R('freeze.txt')} vs committed bytes; (2) receipt identity (schema, lane basename, nonce ${nonce}, driver pin, fixture pin, distinct ports, 41 legs, zero failures) read from ${receipt}; (3) the census artifacts ${R('census-start.txt')} and ${R('census-end.txt')} carry pasteable output and exit codes (report honestly if end is absent); (4) no seat wrote outside the lane — check \`git -C /home/vgpnk/Projects/shokunin status --porcelain\` for files naming tabi/round-90; (5) the r89 claims.json amendment and the two corrected ledger rows are append-only (the original lines still present); (6) the r90 drift gate's eight statements each name a repo fact, not a self-referential tautology — flag any that only test the gate's own text. Report findings with paths and line numbers.`,
  },
  {
    name: 'R90Simplifier', role: 'simplifier', axes: ['operability'], milestone: 'instrument dead-weight review',
    prompt: `YAGNI/dead-weight review of the r90 instrument family, preserving verified behaviour: read ${ABS('scripts/check-showpicker-round90.mjs')}, ${ABS('scripts/negatives-showpicker-round90.mjs')}, ${ABS('scripts/kill-power-round90.mjs')}, ${ABS('scripts/selftest-r90-gates.mjs')} and ${ABS('scripts/check-record-drift-round90.mjs')}. Identify dead code paths, duplicated constants that can drift, unused parameters, and any \`--selftest\` block that duplicates another or cannot fail. Report each with path:line and a concrete recommendation; never edit the lane.`,
  },
];

for (const it of items) it.prompt = '/skill:godspeed\n\n' + it.prompt;

const spec = {
  wave: 'w1',
  milestone: 'Round 90 v1 wave: cold runs, leg-(b) re-measure, C2 controls, settle-call refusal matrix, count/pin audit, attribution attacks, mutants, sources, records, sibling scan, bounds audit, simplification; 13 seats, 5 attack roles.',
  reportDir: path.join(path.relative(lane, waveDir), 'w1'),
  context,
  items,
};
fs.writeFileSync(path.join(waveDir, 'w1-spec.json'), JSON.stringify(spec, null, 1) + '\n');
console.log(JSON.stringify({ spec: path.join(waveDir, 'w1-spec.json'), items: items.length, reportDir: spec.reportDir }, null, 1));
