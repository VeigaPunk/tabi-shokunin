#!/usr/bin/env node
// Generates the round-24 wave-2 spec (v1 band 32-64, falsify). Lane evidence, not a gate.
import { writeFileSync, readFileSync } from "node:fs";

const LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const WAVE_DIR = `${LANE}/.ufo/waves/round-24`;
const GODSPEED = readFileSync("/home/vgpnk/.agents/skills/godspeed/directive.md", "utf8").trim();
const TIP = process.argv[2] || "ad125e85c235e1c4ec6a08e398bd64da01f68a08";

const context = `# Goal
tabi round 24, WAVE 2 — falsify. Wave 1 built the round's artifacts and the L1 integrated them; your job is to
attack what is COMMITTED at lane tip ${TIP}, by re-running and re-reading it, never by trusting a report.
Claims are frozen in ${WAVE_DIR}/claims.json (read it first; the "revisions" block records post-freeze corrections).
C1 (operability, 3 -> 0 nonconformant gates): \`scripts/check-gate-registry.mjs\` derives the lane's gate set from a
revision's committed bytes and reports gates whose latest registry row is missing or incomplete against PROTOCOL
§Gate standard's eight fields; the conformant rows are appended in SKILL.md §"Round 24 — gate registry conformance".
C2 (calibration, 5 -> 0 mismatches): \`scripts/check-selfassessment.mjs\` counts self-assessment/observed-state
mismatches in three classes (m1 stale self-test tally vs the gate's own output, m2 receipt exit vs a closed-grammar
re-run, m3 unlanded paths vs a landed disposition).
C3 (coverage, 0 -> 1 admitted entry): \`corpus/knowledge/navigation-history-bfcache-evidence.md\` citing S104 (web.dev
bfcache article) and S105 (CDP Page.pdl at Chromium 154.0.8037.97), both opened this round.
Round-23 routed defects this round claims to close: 1 (registry row), 2 (89 unlanded paths), 3 (M5: 1,034 committed
scratch paths, now 0, with \`.ufo/waves/*/scratch/\` ignored), 4 (stale 12/12), 5 (claimed NOT to reproduce).
Attack the claims, the instruments, the prose and the deletions. A finding you cannot ground with a command is not
a finding; state observation, inference and unknown separately.

# Contract
Lane root ${LANE}; every path you use is absolute. Every \`Report:\` trailer path is relative to
${LANE} — write it at ${LANE}/<that path>. You are a READ-ONLY reporter: write ONLY the single report file
named in your item (inside ${WAVE_DIR}/) plus throwaway fixtures under
${LANE}/.ufo/waves/round-24/scratch/<YourName>/. Never edit tracked repo files (SKILL.md, LOG.md,
SCORECARD.md, corpus/**, PROVINCE.md, scripts/**, .gitignore), never run git/jj writes (no add/commit/push/
checkout/switch/reset/stash/rm, no mutating jj), never touch the fleet repo /home/vgpnk/Projects/shokunin, any
sibling lane, or /home/vgpnk/Projects/shokuknow (read-only). Never run builds/linters/formatters; the L1 runs the
lane gates once after integration. Never spawn or delegate (no nested swarms), never message other seats or
broadcast, never start services, never open a browser, never probe external sites beyond the single documented
HTTP GET your item names, never touch credentials or session material. Use read-only git only (log, show,
ls-tree, grep, cat-file, rev-parse, merge-base). Host note: /tmp is 100% FULL — export
TMPDIR=/home/vgpnk/tmp-tabi24 (create it if absent) before running any node gate, or its temp fixtures fail with
ENOSPC and the result is could-not-evaluate. Tooling authorization (operator 2026-10-19): you may install or
upgrade tools that help your task after reading /home/vgpnk/.omp/agent/RULES.md (official channels only; record
tool/version/channel/reason). PACMAN GUARD (orchestrator 2026-10-20): all pacman transactions are PAUSED host-wide
— use uv tool / npx / an official binary in ~/.local/bin, or report the need; never run pacman -S/-Sy/-Syu/-U/-R.
Evidence discipline: every number carries the command that produced it; a negative claim carries its sweep.

# The instruments (attack them; do not fix them)
\`node scripts/check-gate-registry.mjs --rev <REV> [--json]\` -> {gates, findings, nonconformant, clean}, exit 0/1/2,
\`--selftest\` (cases=22). \`node scripts/check-selfassessment.mjs --rev <REV> [--json]\` -> {mismatches, findings,
counted, couldNotEvaluate, superseded, clean}, exit 0/1/2, \`--selftest\` (cases=13).`;

const items = [
  ["RevGateRegistryCode", "reviewer", `Review ${LANE}/scripts/check-gate-registry.mjs line by line for correctness and fail-closed behaviour: argument parsing, the schema-aware table parser (header-name mapping, escaped pipes, multi-line cells), the gate-set derivation (convention plus row-named scripts), latest-row-wins supersession, the eight field predicates, the D/absent-script path, and every branch that could report clean on unreadable input. Name each defect with the line and the input that triggers it.`],
  ["RevSelfAssessmentCode", "reviewer", `Review ${LANE}/scripts/check-selfassessment.mjs line by line: the tally patterns and their false positives/negatives, per-line association and the ambiguous case, supersession, the closed-grammar receipt re-run (argv, no shell), the m3 anchor and its porcelain scope, the oracle rule (blob must equal the runnable copy), timeouts and TMPDIR handling. Name each defect with the line and the input that triggers it.`],
  ["MutGateRegistryRows", "mutation-tester", `Run the mutation matrix against the SHIPPED gate: for each of the eight fields, one minimal mutation of a conformant row in a scratch copy of SKILL.md, plus row-removed, gate-renamed, absent-script and later-row-red mutants; run \`node ${LANE}/scripts/check-gate-registry.mjs --repo <scratch repo> --rev <rev>\` on a scratch git repo you create under your scratch dir and report which mutants the gate catches and which it misses. Every mutant needs its exact byte change and the observed finding id.`],
  ["MutSelfAssessmentClasses", "mutation-tester", `Run the mutation matrix against the SHIPPED counter on scratch repos: restore a stale tally (must trip m1), a correct tally (clean), a superseding line (clean), a contradictory receipt exit (must trip m2), a matching receipt (clean), an out-of-grammar command (could-not-evaluate, not counted), a dirty tree (must trip m3), a clean tree (clean). Report observed vs expected per mutant, and any mutant the gate misses.`],
  ["RevRegistryRestatement", "reviewer", `Attack ${LANE}/SKILL.md §"Round 24 — gate registry conformance": for each of the eleven rows check the eight fields against PROTOCOL.md §Gate standard and against the scripts themselves (does the named self-test flag exist? is the case count the one the script prints? is the pinned path real at the tip? is the verdict map complete, including codes 2 and 3?). Then verify the supersession claim: does each new row really supersede an earlier row for the same gate, and does any earlier row state a verdict the new row contradicts without saying so?`],
  ["RevCorrectionsBlock", "reviewer", `Attack ${LANE}/SCORECARD.md §"Round 24 — corrections to earlier figures": is every superseded figure actually superseded (run the gate to see which mentions it counts and which it treats as superseded), is the wording free of figures the counter can misread, and does the block avoid rewriting any filed byte? Check the "not corrected, because it reproduces" paragraph by re-running the command it names.`],
  ["RevEntryBfcache", "reviewer", `Attack ${LANE}/corpus/knowledge/navigation-history-bfcache-evidence.md against the QUALITY.md bar and PROVINCE.md scope: are the decision-table rows actionable, are the protocol field names right for the pinned tag, does any sentence claim more than documentation (a runtime fact, a determinism claim, a security verdict), are the Unknowns honest and complete, and does the entry duplicate an existing note?`],
  ["RevSourcesRows", "reviewer", `Attack the two new rows in ${LANE}/corpus/SOURCES.md (S104, S105): 11 columns, no literal or escaped pipe, id uniqueness, tier/kind vocabulary, the anchor cell's digest matching the committed bytes under corpus/evidence/round-24/sources/, used-by pointing at the admitted entry, status mined, recheck cadence defensible. Run the census yourself: \`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi\` and report exit plus W/E codes.`],
  ["ScoutReopenS104", "scout", `Independently re-open https://web.dev/articles/bfcache (one documented GET, save under your scratch dir) and report: HTTP status, byte count, sha256, whether the S104 row's anchor cell matches, and whether the quoted sentence is present verbatim. If the page has changed since the row was written, say exactly how and whether the row's dated wording survives it.`],
  ["ScoutReopenS105", "scout", `Independently re-open https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT (one documented GET, base64-decode) and report: status, decoded byte count, sha256, whether S105's anchor cell matches, whether \`BackForwardCacheRestore\` and \`backForwardCacheNotUsed\`/\`notRestoredExplanations\` are where the row says, and whether \`notRestoredReasons\` appears anywhere.`],
  ["RevScratchDeletion", "reviewer", `Verify the M5 closure: \`git -C ${LANE} ls-tree -r master .ufo/waves/round-23/scratch | wc -l\` must be 0; the deletion commit must be identifiable and must contain only D records for that prefix; every round-23 document that cites a scratch path must still resolve via \`git show 573c99e:<path>\` — sample at least eight cited paths and report which resolve and which do not; and the new .gitignore rule must actually prevent a re-add (test in a scratch clone, never in the lane).`],
  ["RevUnlandedResolution", "reviewer", `Verify routed defect 2's closure composition: at tip ${TIP}, \`git -C ${LANE} status --porcelain --untracked-files=all\` must be empty; then reconstruct what happened to the 89 paths the round-23 spot-check counted (66 empty numeric files, four empty .err captures, untracked seat scratch, the assimilation mirror, the two rewrite-in-progress files, the late seat append) and say for each class whether it was deleted, restored, or committed, with the commit that carried it. Name anything that was neither.`],
  ["CritC1Verdict", "critic", `Attack C1's verdict (3 -> 0). Re-run the counter at baseline 573c99e and at tip ${TIP} yourself. Then attack: is the baseline number an artifact of the parser's schema coverage? Does the gate count a gate whose row exists but whose script cannot run? Can the target be reached by writing rows that are true of nothing (e.g. a pinned path that does not exist)? Name the strongest surviving objection and what evidence would settle it.`],
  ["CritC2Verdict", "critic", `Attack C2's verdict (5 -> 0). Re-run the counter at both revisions. Then attack: the m1 window (SCORECARD.md only), the supersession rule (can appending a correct figure clear a wrong one without the wrong one being fixed?), m2's null class, and m3's dependence on a clean tree. Name every way the after-value of 0 is weaker than it looks, and whether the claim's wording discloses each.`],
  ["CritC3Verdict", "critic", `Attack C3's verdict (0 -> 1). The counting command is \`git grep -lE '^source: S10[45] ' <REV> -- corpus/knowledge | wc -l\` — an id proxy. Can a do-nothing control reach 1? Does the entry actually rest on the rows (quote located, span named), or only cite them? Would the closure's independent re-open of S104/S105 agree with the row's anchor cells? Report the strongest objection and the cheapest fix.`],
  ["CritSupersessionGaming", "critic", `Attack the supersession mechanism as a gaming surface: a lane could append "cases=N" lines forever to clear any stale figure. Under what conditions is a superseding line legitimate? Does the gate verify that the superseding line's own claim is true (it does — the oracle is the script) and that the earlier mention is addressed rather than merely outnumbered? Propose the minimal additional condition that would make gaming impossible without breaking append-only corrections, or show that none is needed.`],
  ["CritBaselineArm", "critic", `Attack the before-arms as evidence: both counters exist only at the tip and are run against a baseline revision. State the strongest objection (authorship of the definition, parser coverage chosen after seeing the data), then test it: mutate a scratch copy of the BASELINE SKILL.md/SCORECARD.md in ways that should move the count (add the missing row -> -1; break a conformant field -> +1; restore a stale tally -> +1) and report whether the counts move as predicted.`],
  ["RevNoHarmDiff", "reviewer", `Verify no-harm across the round: \`git -C ${LANE} diff --stat 573c99e ${TIP}\` and \`git diff --diff-filter=D --name-status 573c99e ${TIP}\`. Enumerate every deleted path and every modified prior-round byte, and classify each as (a) the owed scratch cleanup, (b) untracked junk removal, (c) an append-only addition, or (d) a rewrite. Report any (d) with its file and diff hunk.`],
  ["SentGateExec", "sentinel", `Security review of the two shipped gates as they are committed: what can they execute, read or write? Enumerate the receipt-command grammar, the script the counter runs (path containment, blob-equals-disk rule), env scrubbing, timeouts, maxBuffer, symlink escape, and whether any path can make the gate read outside the lane or run an arbitrary string. Report each risk with the guard that is present or missing, and the one you would refuse to ship without.`],
  ["LabIsolation2", "executor", `Bounded probe (one falsifiable hypothesis): running both gates leaves the lane's tracked tree byte-identical and writes nothing outside their declared scope. Export TMPDIR=/home/vgpnk/tmp-tabi24, snapshot \`git status --porcelain\` and \`git -C ${LANE} ls-tree -r master\` hashes before/after, run \`--selftest\` and \`--rev ${TIP}\` for both gates twice, and report any file created, modified or deleted, plus any leftover temp directory.`],
  ["RevLesson", "reviewer", `Review ${LANE}/corpus/lessons/round-24.md against the bytes it cites: every figure, quote, line number, commit hash and file path must resolve. Check the Gate table's quotes against the committed source bytes, the Mistakes entries against the runs they describe (is M1's 31-mismatch run reproducible in shape?), the Corrections table against the tip, and the "Open, carried" items for honesty.`],
  ["RevScorecardDisposition", "reviewer", `Review ${LANE}/SCORECARD.md §"Round 24 — executed disposition" against corpus/evidence/round-24/: do the before/after numbers match the receipts, is the routed-defect disposition table correct item by item (including "5 does not reproduce"), and does any row claim more than the receipts show? Check the capability rows enter only on a demonstrated run.`],
  ["RevLogEntry", "reviewer", `Review the round-24 entry in ${LANE}/LOG.md: every commit hash must exist and carry the paths the entry says it carries (\`git show --name-status <hash>\`), the landed-changes list must match the actual commit sequence at the tip, and the next-iteration items must be falsifiable. Report any hash whose contents differ from its description.`],
  ["RevQualityCriteria", "reviewer", `Review QUALITY.md criteria 64 and 65: are they mechanical (a reader can apply them without judgment), are they grounded in this round's evidence (the lesson's M1/M2 and the routed defects), do they duplicate an existing criterion, and would they have caught the defect they name? Check numbering and the append-only rule.`],
  ["ConnInterface", "connector", `Compare the two new gates' interfaces with the sibling implementations the wave-1 connector found (${LANE}/.ufo/waves/round-24/w1/ConnSiblings.md names kotoba's verifiers/check_gate_registry.py, kama's tools/gate-registry-check.py, mori's mori-gate-registry.py, tsukuroi's tools/check-self-assessment.py): exit codes, JSON field names, self-test spelling, universe derivation. Report where tabi diverges and whether the divergence is justified by a lane-owned requirement or is an unnecessary second convention. Read only; do not change siblings.`],
  ["RevCensusEnd", "reviewer", `Verify the round-end sources census and the registry's integrity: run \`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi\` (report exit and every W/E line with counts), then check rows 105, that S104/S105 are the only 2026-10-25 rows, that used-by resolves to an existing file, and that no row's anchor digest contradicts the committed bytes under corpus/evidence/round-24/sources/.`],
  ["SimplGates", "simplifier", `YAGNI pass over the two shipped gates: name every dead branch, unused flag, unused export, redundant predicate and duplicated helper (including the fixture builders and the refusal arms), and say which deletions are safe without weakening a claim's kill rule. Do not propose a shared library. Report the smallest diff that removes the dead weight.`],
  ["RevWaves", "reviewer", `Audit the round's wave evidence: \`${LANE}/.ufo/waves/round-24/\` must contain the claims, the w1 spec, the w1 dispatch payload, the 31 seat reports and the swarm registry, and \`.ufo/waves/round-24/scratch/\` must be absent from the committed tree (ignored). Report: seat count vs spec, the dead seat, any report whose content does not match its item, and any spec/dispatch divergence.`],
  ["RevFrontierRows", "reviewer", `Review the round-24 block appended to ${LANE}/corpus/README.md §Frontier: does each row's status word match what the round actually holds (held vs docs-held vs open), does each pointer resolve, and does the block avoid claiming a runtime observation the lane does not have? Compare with the entry's Unknowns list.`],
  ["RevReceipts", "reviewer", `Reproduce the round's receipts: run both counters at baseline 573c99e and at tip ${TIP} (export TMPDIR=/home/vgpnk/tmp-tabi24) and compare to ${LANE}/corpus/evidence/round-24/c1-measurements.json and c2-measurements.json — every field, including the finding lists and the selftest case counts. Report every field that does not reproduce, and whether the discrepancy changes a claim's verdict.`],
  ["ExecReDerive", "executor", `Independently re-derive the round's three claims with the documented commands at tip ${TIP}: C1 \`node ${LANE}/scripts/check-gate-registry.mjs --rev ${TIP} --json\`, C2 \`node ${LANE}/scripts/check-selfassessment.mjs --rev ${TIP} --json\` (TMPDIR=/home/vgpnk/tmp-tabi24), C3 \`git -C ${LANE} grep -lE '^source: S10[45] ' ${TIP} -- corpus/knowledge | wc -l\`. Report the exact numbers, exit codes and any could-not-evaluate, and whether the tip's working tree is clean enough for m3 to read 0.`],
  ["RevengerIntent", "revenger", `Reconstruct, from committed bytes only, why the round-23 spot-check's routed defect 5 (receipt exit 1 vs command exit 128) does not reproduce at the reviewed tip: find every revision of corpus/evidence/round-23/c1-measurements.json, the commit that changed the field, and the commit the spot-check actually read. Then state whether the round-24 report's "does not reproduce" wording is the honest description or whether it hides a live defect.`],
  ["DistillW2", "reviewer", `Deduplicate the wave-2 reports into one integration checklist: read every report under ${WAVE_DIR}/w2/ that exists when you start, list distinct actionable findings with their source report, mark duplicates and contradictions, and rank by whether they block a claim's admission. Do not restate prose.`],
];

const spec = {
  wave: "tabi-r24-w2",
  context,
  reportDir: ".ufo/waves/round-24/w2",
  maxLanes: items.length,
  items: items.map(([name, role, body]) => ({
    name,
    role,
    prompt: `${GODSPEED}\n\n${body}\n\nReport path: .ufo/waves/round-24/w2/${name}.md`,
  })),
};

writeFileSync(`${WAVE_DIR}/w2-spec.json`, JSON.stringify(spec, null, 2) + "\n");
const byRole = {};
for (const [, r] of items) byRole[r] = (byRole[r] ?? 0) + 1;
console.log(`wrote ${WAVE_DIR}/w2-spec.json items=${items.length}`, JSON.stringify(byRole));
