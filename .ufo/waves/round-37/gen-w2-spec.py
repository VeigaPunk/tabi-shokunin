#!/usr/bin/env python3
# gen-w2-spec.py — tabi round 37 wave-2 (falsify) spec generator. Every item names the w1
# seat report it attacks; fresh reviewers/critics/mutation-testers re-derive, re-run and
# contradict. Re-runnable.
import json
from collections import Counter

GODSPEED = open('/home/vgpnk/.agents/skills/godspeed/directive.md').read().rstrip('\n')

LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
FREEZE = '99437d29de036415a9f2d0524343617a3b19988a'
TIP = 'ed8ccfc00ad3784bc424aa118e056f8edf4ee803'
SCRATCH = '/fast/scratch/hyaku/tabi-r37'

COMMON = f"""- Round: tabi 37 (attempt 1), wave w2 (falsify — attacks what wave 1 produced). Lane repo: {LANE}. Frozen contract: {LANE}/.ufo/waves/round-37/claims.json (freeze {FREEZE}). Wave-1 seat reports live at {LANE}/.ufo/waves/round-37/w1/<Seat>/report.md — read the report YOUR item names FIRST, then attack it.
- Tooling authorization (operator, 2026-10-19): official channels only for installs; record tool/version/channel/reason. PACMAN GUARD: all pacman transactions are PAUSED host-wide — never run pacman.
- Scratch discipline (binding): scratch root {SCRATCH}/w2/<YourSeatName>/ — mkdir -p it, TMPDIR under it, DELETE it before you finish (trap 'rm -rf -- "$S"' EXIT). /tmp is for files under 50 MB only; report-pointed files go under {LANE}/.ufo/waves/round-37/w2/<YourSeatName>/ .
- Write scope: ONLY {LANE}/.ufo/waves/round-37/w2/<YourSeatName>/ and your scratch root. NEVER edit/commit/fetch/push sibling repos or the lane repo outside your seat dir; read-only git only; no mutating git/jj anywhere (fixture clones in your scratch with -C "$D" and a verified toplevel are allowed).
- Every `Report:` trailer path is relative to {LANE} — write it at {LANE}/<that path>. End your final message with a VERDICT line AND write the same content to your seat dir as report.md. Do not spawn subagents. Never message agent://all.
- Firefox note: reproductions may launch the pinned Firefox 158.0.1 + geckodriver 0.37.1 headless against the loopback fixture only.
"""

def item(name, role, prompt, milestone, axes=None):
    d = {"name": name, "role": role, "prompt": GODSPEED + "\n\n" + prompt, "milestone": milestone}
    if axes:
        d["axes"] = axes
    return d

W1 = {
 'RevFrozenDigests': 'freeze digests, predicate-sentence byte-identity, remote tip',
 'RevControls': 'control constructions vs the ten committed receipts',
 'RevC1a': 'independent C1 re-derivation (honest v5, decoy fixture, pins fixture)',
 'RevC2a': 'independent C2 re-derivation (honest v3, observed-tamper, replace-graft)',
 'RevHarness': 'harness v2 review + end-to-end smoke run',
 'RevNoHarm': 'no-harm plan vs the round-36 nonzero exits',
 'CritC1a': 'attack on B1: list-mode pins reads, CRLF normalization, duplicate JSON keys',
 'CritC1b': 'attack on B2/B3: note-parser edge cases, sentence byte-diff',
 'CritC2a': 'attack on C2-B1: packed-refs, TOCTOU, separate-git-dir',
 'CritC2b': 'attack on C2-B2/B3: display-only set truthfulness, survivor false-positives',
 'CritHarness': 'attack on measure.sh v2: OUT handling, trap, unquoted expansion',
 'MutC1a': 'mutation test of the v5 new terms',
 'MutC1b': 'mutation test of the v5 unchanged v4 semantics',
 'MutC2a': 'mutation test of the v3 new terms',
 'MutC2b': 'mutation test of the v3 unchanged v2 semantics',
 'ExecBuildTool': 'build-tool v2 regeneration + negative controls',
 'ExecCensus': 'census receipt at the tip',
 'ExecSelftest': 'instrument self-test receipt',
 'ExecHonestRe': 'honest-floor reproduction in clean clones',
 'LabratC1': 'probe: v5 list-mode pins read classification',
 'LabratC2': 'probe: survivor-check isolation',
 'SimplifyC1': 'YAGNI review of the v5/v3 diffs',
 'SentinelScope': 'security review of counters, build tool, harness',
 'ScoutAssim': 'assimilation survey + quarantine re-derivation',
 'ScoutSrc': 'S143 source opening evidence',
 'ScribeSources': 'S143 registry row draft + census validation of the copy',
 'ScribeLesson': 'round-37 lesson draft',
 'ScribeScorecard': 'SCORECARD round-37 drafts',
 'ConnDrift': 'sibling drift scan since the frozen delta heads',
 'ConnPattern': 'fleet-wide scan for the two defect classes',
 'RevC1Code': 'line-level v5 diff review',
 'RevC2Code': 'line-level v3 diff review',
 'ExecPinsBinding': 'B1 binding-depth receipt (worktree vs REV)',
 'ExecFreezeIntegrity': 'freeze-integrity execution receipt',
}

items = []
i = 0
def n(role):
    global i
    i += 1
    return f'{role}{i:02d}'

# Every w1 seat gets one fresh attacker; role mix: 13 reviewers, 6 critics, 6
# mutation-testers, 5 executors, 1 connector, 1 sentinel, 1 scout, 1 scribe = 34.
ROLEMAP = {
 'RevFrozenDigests': ('reviewer', 'Re-run every digest and byte-compare yourself with sha256sum/diff — do not trust the w1 receipt. Sentence identity: extract the three sites with python and compare bytes.'),
 'RevControls': ('reviewer', 'Re-derive ONE control end-to-end in your own scratch exactly as the w1 seat describes, and read the run-controls.sh source yourself; any construction step you cannot reproduce is a finding.'),
 'RevC1a': ('reviewer', 'Independently rebuild all three C1 fixture clones and re-run the frozen v4 AND v5 over each from the freeze bytes; your exits must match the w1 verdicts or you name the mismatch a finding.'),
 'RevC2a': ('reviewer', 'Independently rebuild the observed-tamper and replace-graft fixtures and re-run v2 and v3 from the freeze bytes; ALSO re-run the honest v3 (live Firefox). Compare every exit/predicate against the w1 report.'),
 'RevHarness': ('reviewer', 'Read measure.sh v2 line by line yourself; run the harness smoke in your own scratch at the current tip; verify numstat exists non-empty and the freshness leg exits 0. Disagreement with w1 = finding.'),
 'RevNoHarm': ('reviewer', 'Verify the no-harm command-set diff claim by diffing the two harnesses yourself; run the two baseline-nonzero gates and confirm the frontier exit is pre-existing while freshness now exits 0.'),
 'CritC1a': ('critic', 'Push the B1 attack further than w1: try a pins blob that differs ONLY in line endings, a duplicate-key JSON, and a keys-reordered file that ALSO swaps two lane values — classify every v5 behaviour (refuse/evaluate) with receipts.'),
 'CritC1b': ('critic', 'Push the B2 attack further: note with TWO verbatim-at clauses, a clause naming a verifying-but-unlisted line, and whitespace variants; then re-run the sentence byte-diff with cmp, not eyes. Any acceptance w1 missed = finding.'),
 'CritC2a': ('critic', 'Push the C2-B1 attack further: pack-refs the graft, use --separate-git-dir, and add the replace ref AFTER a first honest run in the same clone (fresh run) — classify v3 on each. Any read-through = finding.'),
 'CritC2b': ('critic', 'Tamper a decoration step OUTSIDE the v3 derivable set (e.g. held body, #out textContent) and confirm v3 still admits — then check the v3 header declaration covers exactly the derivable set and no more; over- or under-claim = finding.'),
 'CritHarness': ('critic', 'Try OUT with an embedded space and a pre-existing symlink; try killing the harness mid-run and inspect what survives under $S; word-split audit of the command list. Any hazard w1 missed = finding.'),
 'MutC1a': ('mutation-tester', 'Reproduce w1 MutC1a and go further: build the mutants w1 did NOT (e.g. pinsDigest computed over base64 of the blob; note regex accepting `verbatim at :0`; sentence constant with a trailing period). A mutant that keeps every control expectation = SURVIVOR = finding.'),
 'MutC1b': ('mutation-tester', 'Reproduce w1 MutC1b; add mutants on the audit-coverage and stale-disposition legs. Survivor = finding.'),
 'MutC2a': ('mutation-tester', 'Reproduce w1 MutC2a; specifically try to construct the survivor m3 (survivors zeroed) — can you demonstrate it with a controlled fake /proc entry or a wrapper? If undemonstrable, classify the test gap precisely so the L1 can plan it for round 38.'),
 'MutC2b': ('mutation-tester', 'Reproduce w1 MutC2b; verify the identical-id twin is refused by the frozen v3 (A6 still intact) and that the m1 15-row boundary still flips.'),
 'ExecBuildTool': ('executor', 'Re-run the v2 builder regeneration and its negative controls yourself in your scratch; compare your ledger against the committed one with cmp. Then run the round-36 v1 builder and record its exit on the SAME inputs (does it still run despite the typo?).'),
 'ExecCensus': ('executor', 'Re-run the census at the CURRENT lane tip (note: the L1 may have landed integration files — census must be exit 0 at the tip you see; record the row/tier/status counts and compare to w1’s).'),
 'ExecSelftest': ('executor', 'Re-run the full self-test battery; ADD a re-check that the v5/v3 JSON outputs carry predicateSentence equal to claims.json (post-integration files must not have drifted the counters).'),
 'ExecHonestRe': ('executor', 'Third independent honest-floor run of v5 and v3 in clean clones at the current tip; record wall times and outputs; compare to the w1 and controls receipts.'),
 'LabratC1': ('executor', 'Re-probe the list-mode question and ATTACK the w1 classification: if v5 list modes read unfrozen disk pins, produce the receipt showing it, then argue whether display-only is defensible given the modes write nothing — verdict agree/disagree with w1.'),
 'LabratC2': ('executor', 'Re-probe the survivor-check isolation; attempt the controlled false-positive with exec -a in your scratch; verdict agree/disagree with w1.'),
 'SimplifyC1': ('executor', 'Re-diff v4->v5 and v2->v3; ATTACK the w1 minimality verdict: any hunk that is not strictly required by a routed defect, name it with line numbers.'),
 'SentinelScope': ('sentinel', 'Re-run the security review with attention to anything w1 classified as "limited": verify each named limit is real and not an unexamined hole (path traversal via --rev? symlinked TMPDIR parent? env leakage to geckodriver beyond the literal?).'),
 'ScoutAssim': ('scout', 'Re-derive the assimilation and quarantine numbers; ATTACK w1’s `none` recommendation: read merge/tabi/MERGE-REPORT.md yourself and name the single closest staged theme and why it still fails the per-entry gates.'),
 'ScoutSrc': ('scout', 'Re-fetch S143 yourself; your hashes/timestamps must be compatible with the w1 evidence (same page modulo dynamic nav bytes); a quote you cannot re-locate is a finding.'),
 'ScribeSources': ('reviewer', 'ATTACK the drafted S143 row: validate it against the census schema yourself on a fresh copy of the registry; check the used-by names a real committed path; any malformed cell or unverifiable teaches claim = finding.'),
 'ScribeLesson': ('reviewer', 'Read the round-37 lesson file in the lane corpus; verify every evidence pointer in its Gate/Mistakes sections resolves (files exist, hashes quoted match a real sha256sum, verdicts match the control receipts). Any dead pointer = finding.'),
 'ScribeScorecard': ('reviewer', 'Read the SCORECARD round-37 sections; verify the frozen-claims table matches claims.json verbatim, the disposition numbers match the measure receipts, and the planned row names only real routed residue.'),
 'ConnDrift': ('connector', 'Re-scan sibling drift; ATTACK the w1 numbers by including lanes w1 may have skipped (any lane in the delta pins with commits since its frozen head) and by using your own browser-ground regex; any BG line w1 missed = finding.'),
 'ConnPattern': ('connector', 'Re-run the fleet-wide defect-class scan; extend it to .ufo/waves/round-3[0-7] counters of every lane; your file:line list must cover at least what w1 found — a lane w1 flagged that you cannot reproduce = finding, and vice versa.'),
 'RevC1Code': ('reviewer', 'Re-review the v5 diff hunk by hunk; ATTACK w1’s approved verdicts: pick the two weakest hunks and try to construct an input that passes the mutant reading of the hunk while violating the claim’s intent.'),
 'RevC2Code': ('reviewer', 'Re-review the v3 diff hunk by hunk; ATTACK w1’s approved verdicts the same way; pay special attention to the finally-path rec scope and the observedFinding undefined-step handling.'),
 'ExecPinsBinding': ('executor', 'Re-run the worktree-vs-REV binding receipts; extend with a fixture where the pins digest differs only in the JSON\'s final newline — classify v4 and v5.'),
 'ExecFreezeIntegrity': ('executor', 'Re-run the freeze-integrity battery at the CURRENT tip: remote == the latest landed lane hash, freeze is an ancestor, freeze touched only round-37 paths, worktree clean.'),
}
for seat, (role, brief) in ROLEMAP.items():
    title = W1[seat]
    items.append(item(n('Rev' if role == 'reviewer' else 'Crit' if role == 'critic' else 'Mut' if role == 'mutation-tester' else 'Exec' if role == 'executor' else role.capitalize()),
        role, f"""Item: falsify w1 seat `{seat}` ({title}). {brief}
Rules: rebuild every fixture in YOUR scratch from the freeze/lane bytes (never trust w1's artifacts); run the frozen counters from the freeze bytes (`git -C {LANE} show {FREEZE}:<path> > $S/c.mjs`); quote commands and exits for every claim you make; a disagreement with w1 is a FINDING, an agreement is ok with the evidence you produced.
Report: .ufo/waves/round-37/w2/<YourSeatName>/report.md""", 'w2', ['calibration']))

spec = {
    "wave": "tabi-r37-w2",
    "maxLanes": 64,
    "reportDir": ".ufo/waves/round-37/w2",
    "context": "# Goal\nTabi round 37 (attempt 1), wave w2 — falsify wave-1. Each item names the w1 report it attacks. Frozen contract: " + LANE + "/.ufo/waves/round-37/claims.json.\n" + COMMON,
    "items": items,
}
out = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-37/w2-spec.json'
json.dump(spec, open(out, 'w'), indent=1)
print('items:', len(items))
print(Counter(i['role'] for i in items))