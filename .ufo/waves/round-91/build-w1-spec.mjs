#!/usr/bin/env node
// Builds the round-91 w1 v1 spec from the frozen pins + the scored receipt identity.
// Usage: node build-w1-spec.mjs <abs lane> <waveDir> <scoredReceipt> <nonce> <base>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [lane, waveDir, scored, nonce, base] = process.argv.slice(2);
if (!lane || !waveDir || !scored || !nonce || !base) { console.error('usage'); process.exit(2); }
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pins = {};
for (const m of fs.readFileSync(path.join(lane, '.ufo/waves/round-91/freeze.txt'), 'utf8').matchAll(/^([0-9a-f]{64})  (\S+)$/gm)) pins[m[2]] = m[1];
const rec = JSON.parse(fs.readFileSync(scored, 'utf8'));
const ABS = (p) => path.join(lane, p);
const R = (p) => path.join(lane, '.ufo/waves/round-91', p);
const S = (name) => `/fast/scratch/hyaku/tabi-r91/${name}`;
const PS = R('controls/c1/prior-set.txt');
const receipt = ABS('corpus/evidence/round91/chromium-showpicker-proxy/receipt.json');
const driver = pins['scripts/chrome-cdp-showpicker-proxy-round91.mjs'];
const counter = pins['scripts/check-showpicker-proxy-round91.mjs'];
const parent = rec.fixture.parent.sha256, same = rec.fixture.same.sha256, child = rec.fixture.child.sha256;
const pinArgs = `--expect-driver-sha256 ${driver} --expect-nonce ${nonce} --expect-parent-sha256 ${parent} --expect-same-sha256 ${same} --expect-child-sha256 ${child}`;

const context = [
  '# Target',
  `Tabi round 91, one v1 wave \`w1\`. L1 \`TabiR91\` holds the planner seat and is the sole integration owner. Lane ${lane}; base ${base}; instrument freeze ${pins.__digest || 'D1'} (sha256 in ${R('freeze.txt')}); scored receipt nonce ${nonce}, receipt ${receipt} (parent ${parent}, same ${same}, child ${child}, driver ${driver}).`,
  `Claims are FROZEN in ${R('claims.json')}; instrument pins in ${R('freeze.txt')}. Never propose amending a predicate, counter, pin, prior, threshold or kill rule; attack them.`,
  '',
  '# Contract',
  `- Scratch root: /fast/scratch/hyaku/tabi-r91/<your seat name>/ — create it with mkdir -p, pass it explicitly, and delete it before you yield (receipts first copied under ${R('w1')}). Never write under /tmp.`,
  `- Every \`Report:\` trailer path is relative to ${lane} — write it at ${lane}/<that path>.`,
  `- Leaf member: no subagent dispatch, no background jobs, no commits, no git/jj mutation anywhere, no edits outside ${lane}; read-only seats write only their own report file. Never run mutating git/jj commands in the lane; a fixture repo is created with mktemp -d + git -C "$D" init and every later git call names -C "$D".`,
  `- Tooling authorization (operator, 2026-10-19): you may install or upgrade tools that help the task — first read /home/vgpnk/.omp/agent/RULES.md (official channels, update-safety gate, record tool/version/channel/reason in your report). ALL pacman transactions are PAUSED host-wide: install via \`uv tool\`/\`npx\`/an official binary in ~/.local/bin, or file the need in your report. Never -Sy/-Syu/-U/-R and never restart a host service. Never mutate host sysctls.`,
  `- C1 is the new capability \`chromium-showpicker-proxy-linux\`: a same-origin and a cross-origin iframe carry the same file/date/colour shapes; a \`window.postMessage\` proxy in each child accepts only the parent origin. C2 is the six lane-measurable r90 spot-check §8 defects over eight drift statements.`,
].join('\n');

const items = [
  {
    name: 'R91Exec1', role: 'executor', axes: ['coverage', 'operability'], milestone: 'C1 cold-run reproduction',
    prompt: `Run the frozen driver twice under fresh nonces and distinct port triples, all under ${S('R91Exec1')}:\n\nnode ${ABS('scripts/chrome-cdp-showpicker-proxy-round91.mjs')} --lane ${lane} --nonce tabi-r91-cold1-cold00001 --scratch ${S('R91Exec1/cold1')} --out ${S('R91Exec1/cold1.json')} --http-port 19951 --cdp-port 19952 --child-port 19953\nnode ${ABS('scripts/chrome-cdp-showpicker-proxy-round91.mjs')} --lane ${lane} --nonce tabi-r91-cold2-cold00002 --scratch ${S('R91Exec1/cold2')} --out ${S('R91Exec1/cold2.json')} --http-port 19954 --cdp-port 19955 --child-port 19956\n\nScore each cold receipt with the frozen counter, using its OWN nonce and fixture pins and prior-set ${PS}:\nnode ${ABS('scripts/check-showpicker-proxy-round91.mjs')} --lane ${lane} --receipt <cold.json> --expect-driver-sha256 ${driver} --expect-nonce <its nonce> --expect-parent-sha256 $(python3 -c "import json;print(json.load(open('<cold.json>'))['fixture']['parent']['sha256'])") --expect-same-sha256 <same> --expect-child-sha256 <child> --prior-set ${PS} --json\n\nReport each exit, checkCount, findings; compare the 15-leg law table (direct/proxy/cross/choosers/activation/state) of both cold receipts with ${receipt}; confirm the two cold receipts' launch tokens and devtools ids are disjoint and repeat neither prior. A cold receipt that does not score clean is a finding, not a retry.`,
  },
  {
    name: 'R91Exec2', role: 'executor', axes: ['operability'], milestone: 'C1 leg (b) re-measure',
    prompt: `Re-measure C1 leg (b) from committed bytes under ${S('R91Exec2')}:\n\nnode ${ABS('scripts/negatives-showpicker-proxy-round91.mjs')} --lane ${lane} --real ${receipt} ${pinArgs} --prior-set ${PS} --work ${S('R91Exec2/battery')} --json\nnode ${ABS('scripts/kill-power-proxy-round91.mjs')} --lane ${lane} --real ${receipt} ${pinArgs} --prior-set ${PS} --work ${S('R91Exec2/killpower')} --json\nnode ${ABS('scripts/selftest-r91-gates.mjs')} --lane ${lane} --work ${S('R91Exec2/selftest')} --json\n\nReport cases/failed (name every failed case), mutants/killed/survived/crashed/unapplied (name every survivor with its mutant), and each gate's exit. Never edit the instruments.`,
  },
  {
    name: 'R91Exec3', role: 'executor', axes: ['calibration', 'operability'], milestone: 'C2 before/after and do-nothing controls',
    prompt: `Reproduce C2's before-state and the C1 do-nothing controls, all under ${S('R91Exec3')}:\n\n(1) git -C ${lane} worktree add --detach ${S('R91Exec3/base')} ${base}, then node ${ABS('scripts/check-record-drift-round91.mjs')} --lane ${S('R91Exec3/base')} --json; report checkCount/findings (expect 8 findings at base). Remove the worktree (git -C ${lane} worktree remove --force ${S('R91Exec3/base')}).\n(2) Score a nonexistent receipt path with the r91 counter (expect exit 2 receipt-unreadable).\n(3) Score the r90 scored receipt (${ABS('corpus/evidence/round90/chromium-showpicker/receipt.json')}) under the r91 counter (expect exit 1 with schema among the findings).\n(4) Mutate a ${receipt} clone by flipping sp91-xo-proxy-file-noact.proxy to {ok:true,ret:'undefined'} (keep the reply as is) and score it (expect exit 1 law; proxy-law may also fire).\n(5) Mutate a clone by removing the postMessage evaluate from sp91-xo-proxy-file-childact.cdpSendLog and score it (expect exit 1 plan-calls).\n(6) node ${ABS('scripts/check-record-drift-round91.mjs')} --selftest --json (expect ok true; report the 10 case results).\n\nReport each command, exit, and the finding ids; keep the control JSONs under ${R('w1')}.`,
  },
  {
    name: 'R91Exec4', role: 'executor', axes: ['coverage'], milestone: 'proxy refusal matrix',
    prompt: `Build a refusal matrix for the proxy capability, under ${S('R91Exec4')}: take a clone of ${receipt} and produce at least ten mutations, each of ONE field of ONE leg — proxy result ok/name, proxy target, proxy origin, proxyLog origin/cmd/target, reply origin, reply result vs proxy, childFrameId/chooser frameId, chooser mode, chooser afterSendId, activationAfter, childActivationAfter, answerSet backendNodeId, answerSet files basename, childState, parentState, same-element accept, one send-log expression, one mark, one teardown field — and score each with the frozen counter. Record which check id refuses each mutation and which mutations PASS (a pass is a finding about the binding's reach, not a failure of the exercise). Report the table and exact commands. Never edit lane files.`,
  },
  {
    name: 'R91Review1', role: 'reviewer', axes: ['coverage', 'calibration'], milestone: 'count reproduction and pin audit',
    prompt: `Re-run C1's counting command from committed bytes on ${receipt} with every pin, and verify every sha256 in ${R('freeze.txt')} against the committed bytes (git -C ${lane} show <branch>:<path> | sha256sum). Audit the prior set ${PS}: are probe4/probe5 genuine r91 receipts with 15 legs, zero failures, distinct nonces/ports/launch tokens, and does each score clean against a prior set made of the other probe (construct the temporary prior set in ${S('R91Review1')}, never commit it)? Report whether the fixture pins are counter-enforced or declaration-level, and whether the counter really requires the proxy postMessage call (read the check, then prove it with one mutated receipt).`,
  },
  {
    name: 'R91Review2', role: 'reviewer', axes: ['coverage'], milestone: 'origin-attribution attack',
    prompt: `Attack the proxy attribution: can a receipt pass the counter while the child-side proxy result was NOT produced by the parent's postMessage? Construct at least eight forgeries in ${S('R91Review2')} (a proxy result copied from another leg with the log/reply adjusted; the parent reply only, with the child proxy null; a proxy log with the right origin but the wrong target; a reply from the wrong origin; the same-element record with the cross-origin element's accept changed and every leg's copy changed; a chooser event owned by the cross-origin frame on a same-origin leg; an answer delivered to the parent input; a send-log post expression whose targetOrigin is '*' but whose text matches the allowlist). Score each; report which the counter refuses, which it accepts, and what the acceptance means for C1's wording. Quote the check's source lines.`,
  },
  {
    name: 'R91Critic', role: 'critic', axes: ['calibration'], milestone: 'claims vs instruments',
    prompt: `Falsify the claims as written (${R('claims.json')}). C1: map each clause of the claim sentence to the check that binds it; find a clause with no check or a check narrower than the sentence; test whether a parent click really activates the same-origin child but not the cross-origin child on the committed receipt; test whether the date/colour arms overstate "SecurityError"/"no chooser". C2: are the eight statements the six lane-measurable §8 items plus two self-checks, or has a statement been widened/narrowed? Does any statement pass for a reason other than the defect (e.g. a file missing at base)? Is §8 item 4/6 correctly excluded as fleet-report/process? Report each finding with line numbers and a verdict per claim.`,
  },
  {
    name: 'R91Mut1', role: 'mutation-tester', axes: ['coverage', 'calibration'], milestone: 'independent mutant sweep',
    prompt: `Independent mutation sweep: write at least 25 semantic mutants of ${ABS('scripts/check-showpicker-proxy-round91.mjs')} and ${ABS('scripts/check-record-drift-round91.mjs')} in ${S('R91Mut1')} (weaken or flip one clause each: proxy result/law, proxy log/reply, same-element, chooser frame/binding, activation parent/child, state parent/child/answer, event shape, send-log allowlist, plan-calls, prior-set, replay-identity, host/teardown, and each of the eight drift statements). Score each mutant against the frozen battery (and for the drift gate against a fixture lane where the statement should be red). Report the killed/survived/crashed/unapplied table and name every survivor with the clause it weakens. Do not use the frozen kill-power list.`,
  },
  {
    name: 'R91Scout', role: 'scout', axes: ['coverage', 'freshness'], milestone: 'source re-opening',
    prompt: `Re-open the sources the round cites. Fetch https://html.spec.whatwg.org/multipage/web-messaging.html (expect HTTP 200, ~132,045 B, sha256 26fe488d4437...), https://html.spec.whatwg.org/multipage/interaction.html (expect HTTP 200, ~454,117 B, sha256 7499db18f2b3...) and https://html.spec.whatwg.org/multipage/input.html (expect HTTP 200, ~687,515 B, sha256 b0202de1c0b4...), stage all three under ${S('R91Scout')}, and locate with exact anchor: (a) the S225 Authors sentence about the wildcard targetOrigin and its word count; (b) the S226 transient-activation-duration sentence and its word count; (c) the S219 NotAllowedError and SecurityError-exemption sentences and their word counts. Verify staging is byte-identical to live (sha256) and that the committed rows' anchors/word counts are true. No lane edits.`,
  },
  {
    name: 'R91Scribe', role: 'scribe', axes: ['depth', 'calibration'], milestone: 'record drafts',
    prompt: `Draft independently (write only under ${S('R91Scribe')} and your report): (a) the round-91 knowledge-note body for the proxy capability — laws, leg facts, declared limits (compare with ${ABS('corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md')} and list divergences); (b) the round-91 lesson Gate source rows with located quotes and word counts; (c) the SCORECARD round-91 section's claim table wording and the capability row text; (d) three \`## Mistakes\` candidates with class/evidence/captured-by/fix. Do not edit lane files.`,
  },
  {
    name: 'R91Connector', role: 'connector', axes: ['adjacency'], milestone: 'sibling-overlap scan',
    prompt: `Sibling-overlap scan (read-only): grep /home/vgpnk/Projects/shokunin/*-shokunin/corpus/knowledge, SCORECARD.md and scripts for \`postMessage\`, \`contentWindow\`, \`same-origin\`, \`cross-origin\`, \`userActivation\`, \`transient activation\`, \`showPicker\`, \`record-drift-round91\`. Report which lanes hold the same ground (path + one-line state), whether anything this round claims is contested, and one pattern this lane should reuse. No edits anywhere.`,
  },
  {
    name: 'R91Sentinel', role: 'sentinel', axes: ['calibration'], milestone: 'bounds and provenance audit',
    prompt: `Adversarial bounds/provenance audit: (1) every sha256 in ${R('freeze.txt')} vs committed bytes; (2) receipt identity (schema, lane basename, nonce ${nonce}, driver pin, three fixture pins, distinct ports, 15 legs, zero failures) read from ${receipt}; (3) the census artifacts ${R('census-start.txt')} and ${R('census-end.txt')} carry pasteable output, row counts and exit codes; (4) no seat wrote outside the lane — check \`git -C /home/vgpnk/Projects/shokunin status --porcelain\` for files naming tabi/round-91; (5) the six r90 §8 corrections are append-only (the original lines still present; the new blocks name what changed); (6) the r91 note/receipt carry no cookie/token/session material and the child proxy accepts only the served parent origin; (7) the two prior receipts are independent of the scored receipt (distinct nonces/tokens). Report each with the command and observed output.`,
  },
  {
    name: 'R91Simplifier', role: 'simplifier', axes: ['operability'], milestone: 'instrument dead-weight review',
    prompt: `YAGNI/dead-weight review of the r91 instrument family, preserving verified behaviour: read ${ABS('scripts/chrome-cdp-showpicker-proxy-round91.mjs')}, ${ABS('scripts/check-showpicker-proxy-round91.mjs')}, ${ABS('scripts/negatives-showpicker-proxy-round91.mjs')}, ${ABS('scripts/kill-power-proxy-round91.mjs')}, ${ABS('scripts/selftest-r91-gates.mjs')} and ${ABS('scripts/check-record-drift-round91.mjs')}. Identify dead code paths, duplicated constants that can drift, unused parameters, checks that can never fail, and any \`--selftest\` block that duplicates another. Report each with path:line and a concrete recommendation; never edit the lane.`,
  },
];

for (const it of items) it.prompt = '/skill:godspeed\n\n' + it.prompt;

const spec = {
  wave: 'w1',
  milestone: 'Round 91 v1 wave: cold runs, leg-(b) re-measure, C2 controls, proxy refusal matrix, count/pin audit, origin-attribution forgeries, claims falsification, mutants, sources, records, sibling scan, bounds audit, simplification; 13 seats, 5 attack roles.',
  reportDir: path.relative(lane, path.join(waveDir, 'w1')),
  context,
  items,
};
fs.writeFileSync(path.join(waveDir, 'w1-spec.json'), JSON.stringify(spec, null, 1) + '\n');
console.log(JSON.stringify({ spec: path.join(waveDir, 'w1-spec.json'), items: items.length, reportDir: spec.reportDir }, null, 1));
