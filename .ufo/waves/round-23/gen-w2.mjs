#!/usr/bin/env node
// Generates the round-23 wave-2 spec (falsify, v1 band 32-64). Lane evidence.
import { writeFileSync, readFileSync } from "node:fs";

const LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin";
const W = `${LANE}/.ufo/waves/round-23`;
const GODSPEED = readFileSync("/home/vgpnk/.agents/skills/godspeed/directive.md", "utf8").trim();

const context = `# Goal
tabi round 23, attempt 1 — WAVE 2 (falsify). Wave 1 built the round's artifacts; your job is to attack
what exists now, by re-running it, not by trusting it. Claims are frozen in ${W}/claims.json (read the
"revisions" block too — it records every post-freeze correction, including a control that failed).
C1: \`scripts/round-evidence-audit.mjs\` must derive six defect classes from round-22's committed bytes
(target 0 -> 6; baseline a89f1935f523a64b00991d792fca6a8c0d321948). C2: one re-grounded shokuknow entry
admitted with two new SOURCES rows (S102/S103), counted by \`git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge\`.
Everything a seat asserts is author-side: you are this lane's seat, so no finding you make is a non-author judgment.

# Contract
Lane root ${LANE}; every path absolute. Every \`Report:\` trailer path is relative to ${LANE} — write it at
${LANE}/<that path>. Write ONLY your single report file under ${W}/w2/ plus throwaway fixtures under
${W}/scratch/<YourName>/. Never edit tracked repo files, never run git/jj writes (no add/commit/push/
checkout/reset/stash, no mutating jj), never touch the fleet repo /home/vgpnk/Projects/shokunin except
READ-ONLY (the round report and the wave policy are there and are named in your item), never touch a
sibling lane or /home/vgpnk/Projects/shokuknow (read-only). Never build/lint/format; the L1 runs the lane
gates once. Never spawn or delegate, never message other seats, never start services, never open a browser,
never fetch a URL unless your item names exactly one GET, never touch credentials. Read-only git only
(log, show, ls-tree, diff-tree, grep, cat-file, rev-parse). Tooling authorization (operator 2026-10-19): you
may install or upgrade tools that help your task after reading /home/vgpnk/.omp/agent/RULES.md (official
channels; record tool/version/channel/reason). PACMAN GUARD (orchestrator 2026-10-20): all pacman
transactions are PAUSED host-wide — use uv tool / npx / an official binary in ~/.local/bin, or report the need;
never run pacman -S/-Sy/-Syu/-U/-R.
An attack is only worth filing with the command that produced it and the exact bytes it read. A disagreement
with the claim is a finding, not a failure; a disagreement you cannot ground is an unknown.`;

const out = [];
const add = (name, role, body) =>
  out.push({
    name,
    role,
    prompt: [
      GODSPEED,
      "",
      body.trim(),
      "",
      `Output: write ONLY ${W}/w2/${name}.md (Markdown, <=70 lines).`,
      "Return: one verdict line + <=12 finding lines, each with its command.",
      "No tracked-file edits; no git/jj writes; no spawns; no messages to other seats.",
    ].join("\n"),
  });

const A = `${LANE}/scripts/round-evidence-audit.mjs`;
const R = `/home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md`;
const P = `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`;
const E = `${LANE}/corpus/knowledge/csrf-defense-shape-boundary.md`;
const L = `${LANE}/corpus/lessons/round-23.md`;

// auditor, class by class: re-run and try to break
add("W2Cls1", "reviewer", `Re-run C1's counter and attack class c1-refusal-arithmetic: \`node ${A} --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json\`. Verify cited 23 vs derived 24 from the receipts (13 + 11). Then break it: a lesson citing 24 while 23 receipts carry the marker must clear; a receipt without the capacity marker must not count; a lesson citing nothing must not fire. Build each mutant as a scratch copy and show the auditor's answer.`);
add("W2Cls2", "reviewer", `Attack class c2-wave-caps. Verify on round-22 bytes that it reports maxLanes 65 > band 64 and round total 129 > cap 128, with the per-wave counts in \`evidence\`. Then break it: a wave at exactly 64 seats and a round at exactly 128 must be clean; a wave with 65 items but maxLanes 64 must trip; a wave with a spec and no receipt must be reported unaccounted, not silently zero. Also confirm \`--round-cap\` cannot be omitted (exit 2) and that \`--policy\` refuses a non-fleet path.`);
add("W2Cls3", "reviewer", `Attack class c3-gate-spotcheck. Verify round-22's Gate trips (no spot-check result, no "owed to closure") and that inserting one line of either kind clears it on a scratch copy of the lesson. Then check the predicate's honesty: round-21's Gate says closure belongs to the verifier but records no result — does the auditor trip it, and is that a true positive? Argue both ways with the exact wording from ${LANE}/corpus/lessons/round-21.md and round-22.`);
add("W2Cls4", "reviewer", `Attack class c4-stale-attempts. Verify it requires ≥2 committed attempt receipts and a Stale-lane paragraph grading ≥2 attempts (attempt number + disposition). Build three scratch reports: one grading no attempt, one grading one, one grading three; show the answer for each. Then check that a wave with several spawn-results but no attempt receipt does not trip (round 23 must be clean on this class).`);
add("W2Cls5", "reviewer", `Attack class c5-registry-identities. Verify it fires on w2b (65 spawned, 65 null agentId) and does NOT fire on w2 (0 spawned, refused) or on round-21's registries. Then break it: fill one id only (must still fire), fill all (must clear), and a spawned wave with no registry file at all (must fire as registry-unreadable).`);
add("W2Cls6", "reviewer", `Attack class c6-landed-log-binding. Verify the two rows it flags in ${R} (§Landed changes) and that each really cites only commits with no LOG.md (\`git -C ${LANE} diff-tree --no-commit-id --name-only -r <hash>\`). Then check the rule's edges: a row naming "LOG entry lands in <hash>" must clear; a row with no hash must be skipped; a row citing two commits where one touches LOG.md must clear.`);
add("W2EvRepair", "mutation-tester", `Attack the evidence-keyed repair matrix: \`node ${A} --selftest --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128\`. It must report baseline 7 findings / 6 classes and 6 repairs, each repair removing exactly its own class. Then attack its claim to be non-gameable: could an instrument that keys its answer on the round number pass this matrix? State precisely what the matrix forbids and what it still allows.`);
add("W2InMemory", "mutation-tester", `Attack the in-memory matrix: \`node ${A} --selftest\`. Verify 12 cases, one red and one green per class, and that each red case trips exactly ONE class (not two). Then mutate three expectations in a scratch copy of the script (change an expected class, flip a green to a red, delete a case) and show the suite exits 3 each time.`);
add("W2Determinism", "reviewer", `Attack the auditor's read path: directory-as-bytes, missing blob, replace refs (\`git replace\` in a scratch clone), GIT_DIR poisoning, a sibling repo behind \`--root\` (must now be refused), a policy file outside /home/vgpnk/Projects/shokunin/scripts/hyaku, and a report path that does not exist. Each must be exit 2 or a recorded sha256, never a silent clean. Paste the command and exit code for each.`);
add("W2CounterShape", "critic", `Attack the counter's shape against the frozen claim: with the "revisions" block in ${W}/claims.json, is the executed counter the declared one? Is \`findingClasses.length\` (distinct classes) rather than \`findings.length\` (7) the right field? Is the "before 0" arm honest when the instrument simply did not exist? Name any sentence in the claims or the lesson that a closure could read as credit the lane did not earn.`);
add("W2SelfAudit", "reviewer", `Run the auditor against round 23 itself at the lane tip once the round-23 files are in the tree: \`node ${A} --rev <tip> --round 23 --round-cap 128 --json\` with the round-23 report path if it exists, else note that the report is absent and what that means. Report every finding it raises against this round; a finding here is a defect this round must fix before landing.`);
add("W2NoHarm", "reviewer", `No-harm check: byte-prefix (append-only) proof for LOG.md, SCORECARD.md, corpus/QUALITY.md, corpus/README.md, corpus/SOURCES.md, SKILL.md against a89f1935; no byte of .ufo/waves/round-21 or round-22 evidence changed; the auditor writes nothing outside stdout/stderr (strace or a read-only bind mount). Paste the commands and their silence or output.`);
add("W2Report", "reviewer", `Attack the round report draft at /home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md if it exists (else say so): required sections in order, every bullet carrying an evidence pointer, no universal clause the counting command does not enumerate, the Stale-lane line grading this round's attempts, and the marker rule (a contentless report fails the round). List each defect by line.`);
add("W2LandedCites", "reviewer", `Attack the landed-changes trail: for every commit cited in ${L} and in the round-23 LOG entry, verify it exists, is an ancestor of the lane branch (use \`git rev-parse refs/heads/master\` or jj-lane state, never @{u}), and that the LOG.md section it names is in that commit. Every change must be tied to a LOG entry and to the commit that carries it — this round's own defect 6.`);

// C2 attacks
add("W2QuoteA", "reviewer", `Re-open S102 yourself (one GET to https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt) and verify every quoted span in ${E} against the fetched bytes: verbatim, ≤25 words, and located in §8.8.1. Report each span as match/miss with the line number, and any elision that changes meaning.`);
add("W2QuoteB", "reviewer", `Re-open S103 yourself (one GET to https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) and verify every quoted span in ${E}: verbatim, ≤25 words, and under the heading the entry names. Also verify the entry's claim that the sheet's list is OPEN by finding at least one defence class the entry does not tabulate.`);
add("W2EntryBar", "reviewer", `Apply ${LANE}/corpus/QUALITY.md criteria 1-10 and 61-63 to ${E} as committed. Report each failure with the line, and state which criteria a documented-upstream entry can never satisfy and whether the entry says so itself.`);
add("W2EntryProvince", "sentinel", `Scope and safety of ${E}: does it state any security verdict (adequacy, exploitability, weakness of a real site) instead of observability? Does it contain a credential, cookie value, private URL or session material? Does the "what a receipt could hold" column label its inferences? Report each as allow/refuse with the line.`);
add("W2RowsCensus", "reviewer", `Verify the two new SOURCES rows in ${LANE}/corpus/SOURCES.md (S102, S103) against the frozen census in /home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md: 11 columns, enum values, tier scope, no | inside a cell, mined + used-by resolves to an existing file, opened date = this round, recheck binding legal. Run \`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi\` and report exit code and E/W lines.`);
add("W2IdMap", "reviewer", `Verify the id map in ${L} §Gate: staged S145/S146 -> lane S102/S103, by document. Check that staged S102/S103 are different documents (read /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md), that the lane registry has no duplicate id or URL, and that the mapping cannot be read as arithmetic.`);
add("W2Coverage", "critic", `Attack the coverage credit: is the CSRF defence-shape ground really ground this lane did not hold (\`grep -rniE 'synchroni[sz]er|double-submit|custom request header' ${LANE}/corpus ${LANE}/SKILL.md\`)? Is "documented taxonomy held; measured submit still untested" an honest restatement of the frontier, or does it quietly claim a measured surface?`);
add("W2C2Counter", "reviewer", `Verify C2's counter on committed bytes: \`git grep -lE '^source: S10[23] ' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l\` (before) and the same at the current tip (after), plus \`git diff --diff-filter=A --name-only a89f1935 <tip> -- corpus/knowledge\`. State whether an append to an existing note could move the counter without admitting an entry, and whether the count is 0→1 for the right reason.`);

// corrections + claims + verdicts
add("W2CorrArith", "reviewer", `Re-derive every number in ${L} §Corrections: 24 = 13 + 11, attempt 10 missing, 65 > 64, 129 > 128, the 85-hour silent window, the 47bfb5f/fbee618 LOG binding. Any figure you cannot reproduce is a finding.`);
add("W2CorrGate", "reviewer", `Verify that ${L} §Gate carries the round-22 spot-check result (defect 3 close): the reviewer identity, the agree count, and the pointer to ${LANE}/corpus/lessons/round-22-verifier-spotcheck.md. Verify those numbers against that file (1 admit + 3 refusal rulings + register binding = 5 agree, 6 routed defects).`);
add("W2CorrAttempts", "reviewer", `Verify the per-attempt grades in ${L} §Corrections item 4 against the lane's launches: read /home/vgpnk/Projects/shokunin/.ufo/watchdog.log for tabi round=22 launches (read-only) and the lane's commits in each window. Is "attempt 1 progressing / attempt 2 silent / attempt 3 landed" supported by those bytes?`);
add("W2CorrRegistry", "reviewer", `Verify that routed defect 5 is actually closed for round 23: \`node -e\` over ${W}/w1/swarm-registry.json and ${W}/w2/swarm-registry.json — every spawned wave's members must carry an agentId, and the record receipts must exist. Report the null counts and the record files.`);
add("W2Mistakes", "critic", `Attack ${L} §Mistakes: is each row's "captured-by" the rule that really should have caught it (not a rule invented after the fact)? Is each fix shown able to fail by a command that exists in this repo? Name any row that is prose only.`);
add("W2Separability", "critic", `Attack separability with the current artifacts: could C1 verify if C2's entry were refused? Could C2 verify if the auditor were deleted? Name the exact commands that would still pass and any shared file the two claims both write.`);
add("W2Trends", "critic", `Attack the trend verdicts the round intends to report (expansion / quality / discernment) against LEARNING.md's observables. Name the observable each verdict rests on and the evidence pointer; refuse any verdict that has no observable this round's bytes can show.`);
add("W2SHONEN", "reviewer", `Read ${LANE}/SHONEN.md and check the round's SHONEN lines: one line per box, [x] only with a named non-author verifier, [~] with a resolvable pointer. Report any box that cannot be written at [~] and why.`);
add("W2Waves", "reviewer", `Verify the round's wave accounting from bytes: ${W}/w1-spec.json and w2-spec.json seat counts, both inside 32-64, round total ≤128, registries' member counts equal to the spec items, the dispatch payload policy block, and the role mix (attack roles ≥25% of wave 2). Report each count with its command.`);
add("W2Misroot", "reviewer", `Fleet-root sweep: \`git -C /home/vgpnk/Projects/shokunin status --porcelain\` (read-only) — classify every entry as driver/operator, another lane's, or tabi-authored. Report any file whose content names tabi or round-23 outside ${LANE} (a misroot the L1 must fix) and paste the commands.`);
add("W2Secrets", "sentinel", `Security sweep of every file this round adds under ${LANE} (scripts, corpus, .ufo/waves/round-23): no credential, cookie value, session token, private URL, absolute /home path that leaks a secret, or host mutation instruction. Report each hit or the sweep that found none.`);
add("W2Revenger", "revenger", `Reverse-engineer the round-22 author's likely path to the filed "23" refusals: reconstruct which glob or sum could produce 23 from the committed receipts (13 w2 + 11 w2b + attempt/spawn envelopes = 24 files; 9 w2-attempt duplicates). State the mechanism you can support with bytes and mark the rest unknown — do not accuse.`);
add("W2Revenger2", "revenger", `Reverse-engineer how the W2b wave got validated at 65: read ${W}/../round-22/w2b-validation.json and the validator's own band logic in /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs (read-only). Name the exact field that admitted 65 and whether the lane could have known it at dispatch time.`);
add("W2Simplifier", "simplifier", `Read ${A} and name dead weight: unreachable branches, duplicated guards, a class that no committed round can exercise, the tighten-only policy branch's reachability, and any option that cannot change a verdict. Propose the deletions that keep all 12 in-memory cases and all 6 repair cases green. Do not edit the file.`);
add("W2ScoutEntry", "scout", `Check the entry's internal consistency: every quoted span is introduced by the section the SOURCES row names, every table row's inference is labelled, the "not measured here" block does not contradict §4, and the errata section's three claims (E1/E2/E3) each match the staged bytes at /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md. List mismatches.`);
add("W2ScoutFrontier", "scout", `Check ${LANE}/corpus/README.md's new round-23 block: the counts it states are reproducible (\`ls corpus/knowledge/*.md | wc -l\`, \`grep -cE '^\\| S10[23] '\`), the frontier restatement does not narrow the historical bullet, and no earlier line was edited (compare against the baseline revision).`);
add("W2Log", "reviewer", `Read the round-23 LOG.md entry (tail of ${LANE}/LOG.md) and attack it: claims with commands, before/after with the measured revision, landed paths, wave shape and seat counts, dead seats, the six corrections, tool installs, honest bounds. Name every required item that is missing or unsupported.`);
add("W2Scorecard", "reviewer", `Read the round-23 block of ${LANE}/SCORECARD.md and attack it against the contract: declared claims, executed disposition with before/after and counting command and measured revision, the capability row (name, what it does, evidence pointer, first-working round), no scalar promotion, no axis harmed. Name every missing field.`);
add("W2Tooling", "reviewer", `Verify the round's tooling claim: \`git -C ${LANE} diff a89f1935 --stat\` shows no dependency-manifest change, no install ran (check for a receipt or its absence), and no pacman transaction occurred. Report what you can prove and what you cannot.`);
add("W2Prune", "reviewer", `Attribute every file under ${W} to a producer (spec, dispatch, registry, record, refusal, report, fixture, scratch) and name the files that are neither evidence nor a fixture — those must not be committed. Also name any file over 1 MiB (the lane helper skips large files inside directories).`);
add("W2Cheat", "critic", `Adversarial: assume the lane wants credit it did not earn. Enumerate the cheapest ways this round could be read as having met C1 and C2 without doing so (a count read from \`classes\`, a fixture that ships the answer, a counter that reads its own receipt, a SOURCES row whose used-by is the entry itself, an entry whose quotes are paraphrases). For each, name the artifact or command in this round that already blocks it, or state that nothing does.`);
add("W2FinalArms", "mutation-tester", `Re-run every arm and report the table: \`--selftest\` (12), \`--selftest --rev a89f1935... --round 22 --round-cap 128\` (6 repairs), the round-22 counter (6 classes, exit 1), the round-21 counter (per this predicate), the four refusals (no --round-cap, bad rev, --root, foreign policy), and the skip-work control receipt. Each with its exact exit code.`);

if (out.length !== 44) {
  console.error(`expected 44 items, got ${out.length}`);
  process.exit(1);
}
const seen = new Set();
for (const it of out) {
  if (seen.has(it.prompt)) { console.error(`duplicate prompt: ${it.name}`); process.exit(1); }
  seen.add(it.prompt);
}
writeFileSync(
  `${W}/w2-spec.json`,
  JSON.stringify({ wave: "tabi-r23-w2", context, reportDir: ".ufo/waves/round-23/w2", maxLanes: 44, items: out }, null, 2) + "\n"
);
const roles = out.reduce((a, i) => ((a[i.role] = (a[i.role] || 0) + 1), a), {});
const attack = out.filter((i) => ["reviewer", "critic", "mutation-tester"].includes(i.role)).length;
console.log(`wrote w2-spec.json: ${out.length} items; roles=${JSON.stringify(roles)}; attack=${attack}/${out.length}`);
