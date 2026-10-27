#!/usr/bin/env python3
# gen-w1-spec.py — tabi round 36 wave-1 spec generator (re-runnable).
import json
from collections import Counter

GODSPEED = """You are a Godspeed-enabled subagent.

1. **Name the axes.**
2. **Iterate cheap, in parallel.**
3. **Keep moves that improve any axis and harm none.**
4. **Don't aim - let the frontier walk itself.**

## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize what can be parallelized. Do not output philosophical reasoning or verbose plans. Act directly via tool calls."""

LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
FLEET = '/home/vgpnk/Projects/shokunin'
FREEZE = '2e7b7a8920bff47fae6f75c3d06e48e37767099e'
TIP = '11c64b96f357de106c30a71c5e21ca44a3eacdc0'
SCRATCH = '/fast/scratch/hyaku/tabi-r36'

COMMON = f"""- Round: tabi 36 (attempt 1), wave w1 (build + first falsifiers). Lane repo: {LANE} (browser & web-interaction craft; read {LANE}/PROVINCE.md if you need scope). Claims, counters and control receipts are frozen at {FREEZE} — read {LANE}/.ufo/waves/round-36/claims.json FIRST (both claims, predicates, kill rules, feasibilityDisclosed).
- Tooling authorization (operator, 2026-10-19): you may install/upgrade tools that help the task — official channels only (uv tool / npx / official binary into ~/.local/bin); record tool/version/channel/reason in your report. PACMAN GUARD: all pacman transactions are PAUSED host-wide — never run pacman.
- Scratch discipline (binding): your scratch root is {SCRATCH}/<YourSeatName>/ — mkdir -p it yourself, pass TMPDIR=.../tmp explicitly, and DELETE it before you finish (trap 'rm -rf -- "$S"' EXIT). /tmp is for files under 50 MB only; anything a report must point at goes under {LANE}/.ufo/waves/round-36/w1/<YourSeatName>/ .
- Write scope: you may write ONLY under {LANE}/.ufo/waves/round-36/w1/<YourSeatName>/ (your seat dir) and your scratch root. NEVER edit, commit, fetch or push into any sibling repo ({FLEET}/*-shokunin), the fleet root files (.ufo/state, MANIFEST.json, templates/, scripts/), or the lane repo outside your seat dir — the L1 integrates. Never run a mutating git/jj command anywhere; read-only git only. Git fixtures: any fixture repo is created as D=$(mktemp -d -p {SCRATCH}/<YourSeatName>) && git -C "$D" init -q, and every git call names -C "$D".
- Every `Report:` trailer path is relative to {LANE} — write it at {LANE}/<that path>. End your final message with a VERDICT line (`VERDICT ok ...` / `VERDICT finding ...` / `VERDICT could-not-evaluate ...`) AND write the same content to your seat dir as report.md; counters parse both. Your seat's files are its evidence. Do not spawn subagents (executor seats may spawn ONE read-only labrat probe; every other role is a leaf). Never message agent://all.
"""

def item(name, role, prompt, milestone, axes=None):
    d = {"name": name, "role": role, "prompt": GODSPEED + "\n\n" + prompt, "milestone": milestone}
    if axes:
        d["axes"] = axes
    return d

items = []

for i in range(1, 17):
    seat = f'AdjDrift{i:02d}'
    n = 20 if i < 16 else 7
    items.append(item(seat, 'executor', f"""Item: C1 drift-verification chunk {seat} — independently re-derive the audit status of the {n} ledger rows in {LANE}/.ufo/waves/round-36/w1-chunks/{seat}.tsv (format per line: `sibling_ref<TAB>status<TAB>note`; sibling_ref = `<lane>-shokunin@<pin>:<path>:<line>`).
For EACH row, from git objects only:
1. `git -C {FLEET}/<lane>-shokunin show <pin>:<path>` — take line <line>, trim: that is the CITED text. (Line absent -> your derivation is `stale: pin line absent`.)
2. Read {LANE}/.ufo/waves/round-36/baseline/c1-delta-pins.json for <lane>'s frozen delta head H. `git -C {FLEET}/<lane>-shokunin show <H>:<path>` (absent -> `stale: head file absent`). Compare line <line> trimmed: equal -> `unchanged`. Else search the head file for a line whose trimmed text EQUALS the cited text: found at line(s) N -> `moved :N`; not found -> `stale`.
3. Compare your derivation with the committed ledger row ({LANE}/corpus/adjacency-screen-drift.tsv — find the row by its sibling_ref).
Write {LANE}/.ufo/waves/round-36/w1/{seat}/receipt.tsv with one line per input row: `sibling_ref<TAB>my-status<TAB>my-note<TAB>ledger-status<TAB>agree|MISMATCH` plus a summary line `# {seat}: N rows, K mismatches`. Record the exact commands in {LANE}/.ufo/waves/round-36/w1/{seat}/commands.txt.
Report: .ufo/waves/round-36/w1/{seat}/report.md
VERDICT line: ok if every row agrees with the committed ledger, else `VERDICT finding <k> mismatches ...` naming each.""", 'C1', ['adjacency']))

items.append(item('AdjDriftKaidoku', 'executor', f"""Item: C1 deep verification of the 3 MOVED rows (the round's only non-unchanged drift). The committed ledger ({LANE}/corpus/adjacency-screen-drift.tsv) says kaidoku-shokunin rows SKILL.md:585/:621/:652 (pin 49096c7e6f226af0c750c4b003be58883cb6049f) moved verbatim to head lines :748/:784/:815 (delta head 1ed29de2cdd6061315fb2f5478d5029b7d570675).
Prove or refute by hand from git objects: for each of the 3 rows show the pin line and the head line side by side (git show ... | sed -n '<n>p'), verify byte-equality after trim, verify the head line still carries the kimi-webbridge mention the screen row quotes, and confirm the head file has NO other verbatim occurrence the ledger failed to name (grep -nF). Also confirm the screen ledger rows those refs point at ({LANE}/corpus/adjacency-screen-browser.tsv lines 62-64) still quote text present in the moved lines.
Write {LANE}/.ufo/waves/round-36/w1/AdjDriftKaidoku/receipt.md with the diffs and greps.
Report: .ufo/waves/round-36/w1/AdjDriftKaidoku/report.md""", 'C1', ['adjacency']))

items.append(item('ConnDeltaScan', 'connector', f"""Item: cross-claim pattern check — independently re-derive the EMPTY delta pool. Claim C1's delta leg says the 12 drifted lanes added ZERO browser-ground lines post-pin. Verify with a DIFFERENT construction than the frozen counter's: for each drifted lane in {LANE}/.ufo/waves/round-36/baseline/c1-delta-pins.json (head != the round-35 pin), run `git -C {FLEET}/<lane>-shokunin log --oneline <pin>..<head>` and `git -C {FLEET}/<lane>-shokunin diff --unified=0 <pin> <head> -- SKILL.md corpus/knowledge` and eyeball every added line against a browser-ground regex of your own choosing (name it; it must cover at least webdriver/geckodriver/playwright/chromium/cdp/devtools/musketeer/webbridge). Any added line your regex flags that the counter's delta pool (run `node {LANE}/.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs --list-delta --repo {LANE}`) misses is a FINDING. Also report each drifted lane's commit subjects (for the round report's drift narrative).
Write {LANE}/.ufo/waves/round-36/w1/ConnDeltaScan/scan.md (per-lane: commits, added-line count, BG hits).
Report: .ufo/waves/round-36/w1/ConnDeltaScan/report.md""", 'C1', ['adjacency']))

items.append(item('ExecC2Repro', 'executor', f"""Item: C2 control-receipt reproduction. Two receipts must reproduce from committed bytes in YOUR scratch ({SCRATCH}/ExecC2Repro/):
1. Boundary: in a scratch clone of the lane at {FREEZE} (git clone --shared {LANE}; checkout {FREEZE}), flip the first `| yes` measured cell of corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md to `no` (table row cells: id | command | counterpart | measured), commit in the CLONE, then run the frozen counter from the freeze bytes (`git -C {LANE} show {FREEZE}:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs > $S/c2.mjs; TMPDIR=$S/tmp node $S/c2.mjs --rev <clone-HEAD> --repo <clone> --json`). Expect admitted 15, predicate false, exit 1. (This runs a live Firefox session; ~1 min.)
2. Egress instrument: write $S/c2-egress-instrument.mjs = the frozen counter's bytes with the DNS-off prefs object (the `prefs: {{ 'network.dns.disabled': true, 'network.trr.mode': 5 }}` literal inside the new-session body) replaced by `prefs: {{}}`, run it the same way at the clone HEAD. Expect live.egress.nonLoopback >= 1 and predicate false.
Record both raw JSON outputs under {LANE}/.ufo/waves/round-36/w1/ExecC2Repro/ and state agree/disagree with the frozen receipts {LANE}/.ufo/waves/round-36/baseline/c2-J3-boundary-15.json and c2-J6-egress-instrument.json.
Report: .ufo/waves/round-36/w1/ExecC2Repro/report.md""", 'C2', ['operability']))

items.append(item('ScribeSrcGitDocs', 'scribe', f"""Item: frontier source opening for the round's sourced claim (§2b.4) and the C1 method entry.
1. Fetch https://git-scm.com/docs/git-show (and https://git-scm.com/docs/git-diff as support) with curl -sSL; record HTTP status, byte size, sha256, access timestamp (UTC). Locate by grep a <=25-word quote stating that git show reads objects/blobs at a revision (e.g. the "Shows one or more objects (blobs, trees, tags and commits)" line in git-show).
2. Draft the registry row for S142 (next free id; the registry currently ends at S141) in the fleet census schema — read {LANE}/corpus/SOURCES.md's header for the 11-column shape and copy an existing mined row's format; status `mined`, recheck `180d`, used-by `corpus/knowledge/adjacency-drift-audit-r36.md`. Do NOT edit the registry itself — write the drafted row to {LANE}/.ufo/waves/round-36/w1/ScribeSrcGitDocs/S142-row.md.
3. Draft {LANE}/.ufo/waves/round-36/w1/ScribeSrcGitDocs/adjacency-drift-audit-r36.md — a knowledge entry (front-matter style like other entries in {LANE}/corpus/knowledge/; read one first, e.g. webdriver-bidi-firefox-runtime-round-35.md's header shape) documenting the drift-audit METHOD: the claim it serves (C1), the frozen inputs (delta pins, screen ledger), the three status classes with their derivations, the 3 kaidoku moved rows, the empty delta pool, and a `source: S142` line citing the git-show documentation for the git-object addressing the method relies on. Mark clearly it is a DRAFT for L1 review.
Report: .ufo/waves/round-36/w1/ScribeSrcGitDocs/report.md""", 'frontier', ['coverage']))

items.append(item('ExecS125', 'executor', f"""Item: land the S125 `on-release` cadence WITH its four companion files (round-34 routed defect 5, second carry; the round-35 lesson ## Gate records the requirement). Read {LANE}/corpus/lessons/round-35.md ## Gate (S125 paragraph) for the exact requirement: the registry cell change is gate-green only with four companion evidence files under corpus/evidence/round-29/release-pins/ (receipt row, two decoded tag blobs, a refetch record).
Work in your scratch: read {LANE}/scripts/check-release-pins.mjs to learn the exact contract (entry r1 and the files it expects), re-open the S125 source (read its URL from {LANE}/corpus/SOURCES.md row S125), produce the four companion files byte-complete, and place them under {LANE}/.ufo/waves/round-36/w1/ExecS125/release-pins/ (ready for the L1 to commit at corpus/evidence/round-29/release-pins/). Verify in a scratch mirror (copy the lane corpus/ + scripts/ into your scratch, add your files at the right path, run `node scripts/check-release-pins.mjs --rev HEAD` inside the mirror) that the gate is GREEN with the files and RED without — record both exits.
Report: .ufo/waves/round-36/w1/ExecS125/report.md""", 'routed-defects', ['freshness']))

items.append(item('ScoutAssim', 'scout', f"""Item: assimilation survey (§10). Read /home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.md (the source repo is READ-ONLY: never write or run campaign tools there) and list the staged themes/entries. Decide whether ANY theme touches (a) the sibling adjacency map / browser-ground overlap, or (b) Firefox / WebDriver BiDi / browser automation runtime evidence. If none touches either, recommend `Assimilation: none` for round 36. If one fits, name the theme, the 1-3 entries, and the re-grounding each would need. Also re-derive the lane's quarantine slice: awk the register per the round prompt §10 against /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md (lane cell `tabi`, data rows with a round cell and an S-id) and confirm the row count matches the 38 recorded in rounds 22-23; list the S-ids.
Report: .ufo/waves/round-36/w1/ScoutAssim/report.md""", 'frontier', ['coverage']))

items.append(item('ScribeQuarantine', 'scribe', f"""Item: quarantine verdict re-derivation for the round report. The lane's 38-row absent-defect register slice was hand-checked in rounds 22-23; round 35 re-derived the count. Re-derive the slice: awk the register (READ-ONLY path /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md) for lane `tabi` data rows (`$3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/`), count rows, and extract the S-id + class cell of each row into a table. Cross-check that each S-id in your table EXISTS as a row in {LANE}/corpus/SOURCES.md (grep) — record any slice id missing from the lane registry. Do not fetch URLs (rounds 22-23 verdicts stand; this is a count+membership re-derivation only).
Report: .ufo/waves/round-36/w1/ScribeQuarantine/report.md""", 'frontier', ['coverage']))

STATUS_SET = '{unchanged,moved,stale}'
STATUS_SET2 = '{unchanged,moved}'
items.append(item('CritC1', 'critic', f"""Item: ATTACK C1 — find a tree the frozen counter (frozen bytes: git show {FREEZE}:.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs) scores predicate=TRUE while a drift row is mis-audited, or predicate=FALSE on the honest ledger. Work in scratch clones (git clone --shared {LANE}; the honest ledger is corpus/adjacency-screen-drift.tsv; the delta pins .ufo/waves/round-36/baseline/c1-delta-pins.json). Avenues: (a) a 'moved' row whose cited text appears at SEVERAL head lines — the note must name ONE where the text verifies; can a wrong choice pass? (b) a drift row whose pin line is past EOF (stale at pin) — does the counter still agree with the generator? (c) duplicate audit rows, header tricks, CRLF in notes, tab-in-note parsing. (d) a stale row whose new head text is browser-ground but keyed to a delta line covered by a delta-map row — reachable? Each attack: construct the tree in a scratch clone, run the frozen counter from the freeze bytes, record exit+JSON. A REAL finding names the counter line and shows the JSON.
Report: .ufo/waves/round-36/w1/CritC1/report.md""", 'C1', ['adjacency', 'calibration']))

items.append(item('MutC1', 'mutation-tester', f"""Item: mutation-test the C1 counter. The control construction is documented in {LANE}/.ufo/waves/round-36/baseline/controls.mjs: clone the lane at {TIP}, copy the round's pre-data files in (NOT the ledger), commit = control base; the honest ledger is {LANE}/corpus/adjacency-screen-drift.tsv. Mutants (apply each to the frozen counter bytes in scratch, run against both the honest ledger and the matching junk control):
m1 drift.total >= 1 -> >= 9999 (must flip the honest-floor reading to false);
m2 auditCoverage === total -> !== (must flip);
m3 drop the moved-relocation verification branch (c1-J3 wrong-relocation must flip from refused to admitted);
m4 the status set """ + STATUS_SET + """ -> """ + STATUS_SET2 + """ (what happens to a stale row: crash = could-not-evaluate, pass = survivor);
m5 drop the delta screenFindings leg (c1-J4 delta-screen-junk must flip to admitted);
m6 narrow the BG regex (must shrink the candidate pool reading).
For each mutant record: site, honest-floor flip?, junk-control flip?, receipts.
Report: .ufo/waves/round-36/w1/MutC1/report.md""", 'C1', ['adjacency', 'calibration']))

items.append(item('RevC1', 'reviewer', f"""Item: review the C1 claim end to end for fabrication classes: read claims.json C1, the counter source, the generator c1-drift-audit-build.mjs, the ledger, the control receipts (baseline/c1-J*.json + controls-summary.json). Check: (1) every ledger row's status is derivable from git objects (sample 12 rows across lanes yourself with git show); (2) the 'before' sentence is true (delta pins absent at {TIP}: git cat-file -e {TIP}:.ufo/waves/round-36/baseline/c1-delta-pins.json — expect failure); (3) no universal clause hides an unmeasured set (verify 307 two ways: wc -l the ledger data rows, and the counter JSON drift.total at {FREEZE}); (4) the controls bind (c1-J2 fails with exactly 3 findings — read c1-J2-all-unchanged.json). Report disagreements as findings with file:line.
Report: .ufo/waves/round-36/w1/RevC1/report.md""", 'C1', ['adjacency', 'calibration']))

items.append(item('CritC2', 'critic', f"""Item: ATTACK C2 — try to reach predicate=TRUE on fabricated evidence under the frozen v2 counter (bytes: git show {FREEZE}:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs). Work in a scratch clone of the lane at {FREEZE}. Avenues: (a) write your own minimal honest BiDi driver in scratch, run Firefox/geckodriver yourself twice, commit the transcripts + receipt — does the counter admit it (it should if honest; record that as the avenue's outcome, not a finding); (b) transcript pair where run2's sessionId/context ids are REWRITTEN (randomUUID) but screenshots identical — A6 must refuse identical-id clones; verify the rewritten-id clone passes and name it as the disclosed limit; (c) read verifyBinaries closely — it compares the caller's PATH STRING against the pins; what happens with --firefox <pinned path> but a replaced file at that path in a sandbox where you control the binary? (Do NOT touch the real pinned binaries: simulate the reasoning and, if you build a demonstration, do it by bind-mount-free sandbox copy of the counter with modified PINNED_BINARIES — record what the real counter would do); (d) --rev pointing at a repo whose gate file differs — the gate digest check. Each attack: run the frozen counter from the freeze bytes, record JSON.
Report: .ufo/waves/round-36/w1/CritC2/report.md""", 'C2', ['operability', 'calibration']))

items.append(item('MutC2', 'mutation-tester', f"""Item: mutation-test the C2 v2 counter. Mutants (apply to the frozen bytes in scratch; control constructions per {LANE}/.ufo/waves/round-36/baseline/controls.mjs):
m1 TARGET 16 -> 15 (c2-J3 boundary must flip to predicate true — QUALITY 98's red state);
m2 neuter verifyBinaries() (c2-J2 wrong-binary must pass — QUALITY 99's red state);
m3 drop the A4 wsNorm comparison (c2-J4 must pass);
m4 drop the egress predicate leg (a DNS-on live session must pass);
m5 drop A6 disjointness (an identical-id twin transcript pair must pass).
For each: construct the control tree in a scratch clone, run the mutant counter, record flip/no-flip, and name the QUALITY criterion the mutant is the red state of.
Report: .ufo/waves/round-36/w1/MutC2/report.md""", 'C2', ['operability', 'calibration']))

items.append(item('RevC2', 'reviewer', f"""Item: review the C2 claim: read claims.json C2, the v2 counter source, and receipts c2-J0..J6 ({LANE}/.ufo/waves/round-36/baseline/). Check: (1) the binary pins equal the round-35 install receipts ({LANE}/.ufo/waves/round-35/measure/provenance-8de96c2.txt lines 8-9 and corpus/lessons/round-35.md ~line 165) — recompute sha256 of both pinned binaries and compare; (2) c2-J3's tree really admitted exactly 15 (read the JSON); (3) c2-J6's instrument is the frozen counter with ONLY the prefs changed (recompute: take the frozen bytes, apply the same replacement, compare sha256 with the receipt's record if present, and diff your reconstruction against the description); (4) the 'before' sentence: v2 absent at the round-start tip (git cat-file -e {TIP}:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs must fail). Report disagreements as findings.
Report: .ufo/waves/round-36/w1/RevC2/report.md""", 'C2', ['operability', 'calibration']))

items.append(item('ScribeLesson', 'scribe', f"""Item: draft the round-36 lesson skeleton at {LANE}/.ufo/waves/round-36/w1/ScribeLesson/round-36-draft.md — copy the shape of {LANE}/corpus/lessons/round-35.md (opening claims paragraph, ## Gate with the S-row table, Gate decisions, ## Mistakes, errata). Fill: the claims paragraph from claims.json (round 36, freeze {FREEZE}); the ## Gate table with ONE row — the S142 git-show row drafted by ScribeSrcGitDocs (read their seat dir; if absent, leave the row marked PENDING); a ## Mistakes section with the round's first mined mistake: pre-freeze the L1 transcribed the kama round-35 pin into the C1 v4 counter by hand and the 39-char constant failed resolveCommit at control time — class `hand-copied-constant`, captured-by `none` (no instrument read the PINS block until the controls ran), fix: constants extracted programmatically (the pins file became the single source and the counter was re-verified by re-running the derivation). Errata intake placeholder.
Report: .ufo/waves/round-36/w1/ScribeLesson/report.md""", 'frontier', ['quality']))

items.append(item('ExecSelftest', 'executor', f"""Item: instrument self-test receipt. Verify from the freeze bytes / committed files: (1) sha256 of each frozenDigest file in {LANE}/.ufo/waves/round-36/claims.json equals the actual bytes (git show {FREEZE}:<path> | sha256sum) — record all; (2) `node --check` both counters; (3) C1 list modes: --list-candidates | wc -l (expect 383), --list-drift | wc -l (expect 307), --list-delta | wc -l (expect 0); (4) the C1 counter at {FREEZE} in a clean scratch clone exits 0 with predicate true (TMPDIR under your seat); (5) gate selftests: every {LANE}/scripts/check-*.mjs exposing a --self-test flag exits 0 (loop as measure.sh does). Write {LANE}/.ufo/waves/round-36/w1/ExecSelftest/selftest.txt with each command + exit + last output line.
Report: .ufo/waves/round-36/w1/ExecSelftest/report.md""", 'instruments', ['operability']))

items.append(item('SentinelScope', 'sentinel', f"""Item: security review of the two frozen counters and the controls/generator tools (read-only; no exploitation against real systems). Review {LANE}/.ufo/waves/round-36/counters/*.mjs and baseline/{{controls.mjs,c1-drift-audit-build.mjs}} for: path traversal via --repo/--fleet/--rev arguments; the C2 live leg's spawn surface (geckodriver argv, env isolation — are HOME/TMPDIR/XDG_* scoped to the scratch? does the child inherit the parent's env beyond PATH?); the safeWrite lstat chain (can a pre-existing symlinked TMPDIR component bypass? read the code); shell injection (any spawnSync with shell:true?); the /proc socket sampler (reads only /proc/<pid> of its own tree — verify); fleet write scope (does any tool write outside $TMPDIR and the lane?). Report each avenue with file:line and verdict (clean / finding).
Report: .ufo/waves/round-36/w1/SentinelScope/report.md""", 'instruments', ['operability']))

items.append(item('ExecDriftEdge', 'executor', f"""Item: one bounded probe — the counter's handling of malformed drift rows. Read the counter's audit + observed-derivation code paths first ({LANE}/.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs). Then, in a scratch clone of the lane at {FREEZE}: (a) edit corpus/adjacency-screen-browser.tsv's FIRST drifted-lane row (a chousa row — see the ledger for one) to cite line 99999, regenerate nothing, run the frozen counter from the freeze bytes — record exit code and verdict (clean stale handling expected; an unhandled stack trace = FINDING); (b) add a screen row whose ref lane is NOT in the delta pins (e.g. `souji-shokunin@<souji pin>:SKILL.md:1` with a matching junk quote...) — wait: screen rows are validated against the candidate pool first; instead try an AUDIT row for a non-drifted lane and one audit row duplicated; run and record. Write both JSON outputs under your seat dir.
Report: .ufo/waves/round-36/w1/ExecDriftEdge/report.md""", 'C1', ['adjacency']))

spec = {
    "wave": "tabi-r36-w1",
    "maxLanes": 64,
    "reportDir": ".ufo/waves/round-36/w1",
    "context": "# Goal\nTabi round 36 (attempt 1), wave w1 — build + first falsifiers for the two frozen claims. Read the frozen contract first: " + LANE + "/.ufo/waves/round-36/claims.json.\n" + COMMON,
    "items": items,
}
out = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/w1-spec.json'
json.dump(spec, open(out, 'w'), indent=1)
print('items:', len(items))
print(Counter(i['role'] for i in items))
