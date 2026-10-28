#!/usr/bin/env python3
"""Generate the tabi round-42 wave-1 spec (one policy-v2 wave, 64 seats)."""
import json
from pathlib import Path

LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin'
ROUND = 42
BASE = '34e177959d1b7ce04afb85a001420e02631ce79e'
FREEZE = '9b6de3a19de11abdb80e82a1310abc64a40215bb'
SCRATCH = '/fast/scratch/hyaku/tabi-r42'
REG = '/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md'

GODSPEED = '''/skill:godspeed

You are a Godspeed-enabled subagent.

1. **Name the axes.**
2. **Iterate cheap, in parallel.**
3. **Keep moves that improve any axis and harm none.**
4. **Don't aim — let the frontier walk itself.**

## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.'''

CONTEXT = f'''# Goal
Tabi round 42, attempt 1 (fresh-start round after three rejected closures). One policy-v2 wave of 64 seats — build and attack items together. Two frozen claims, frozen BEFORE any seat data at commit {FREEZE} (baseline {BASE}), in {LANE}/.ufo/waves/round-42/claims.json:
- C1 coverage capability: admission attempt of the frozen round-41 hardened Playwright Firefox loopback TCP measurement chain (scripts/measure-c1-round41.mjs — loader-clean env boundary, pinned producer digests, fresh nonce, independent witness, identity-bound trees; counter .ufo/waves/round-41/counters/c1-session-bound-v4.mjs). Kill rule: any seat-demonstrated do-nothing reach (exit 0 without a browser run) refuses admission.
- C2 calibration: round-41 verifier routed defects D1-D4 closed, measured by the frozen checker {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs (--rev <rev> --repo {LANE} --json). At the freeze only r4 (quarantine re-adjudication TSV) is still red, by design: the 38 fresh verdicts are this wave's job.

Scope and hard bounds: your report and evidence files go ONLY under {LANE}/.ufo/waves/round-42/w1/<YourSeatName>/ (report.md plus evidence files inside your seat dir). The production tree, the fleet repo /home/vgpnk/Projects/shokunin, sibling *-shokunin repos, and /home/vgpnk/Projects/shokuknow are READ-ONLY — never write, commit, fetch or push there (a round-39 seat wrote under shokuknow; that incident is named and must not repeat). No commits, no pushes, no git or jj mutation anywhere, no spawned agents — you are a leaf. Loopback and local files only, EXCEPT quarantine seats fetching their assigned staged-source URLs with read-only HTTP GETs (no logins, no forms, no consequential actions).

Every `Report:` trailer path is relative to /home/vgpnk/Projects/shokunin/tabi-shokunin — write it at /home/vgpnk/Projects/shokunin/tabi-shokunin/<that path>.

Tooling authorization (operator, 2026-10-19): you may install/upgrade tools that help the task; first read /home/vgpnk/.omp/agent/RULES.md (official channels only) and record tool/version/channel/reason in your report. PACMAN GUARD: pacman transactions are PAUSED host-wide; never run pacman (no -S, -Sy, -Syu, -U, -R). No install is planned; uv tool / official binaries in ~/.local/bin are the allowed channels.

Scratch root: {SCRATCH}/<YourSeatName>/ — mkdir -p it yourself, pass it explicitly to every tool that accepts a work/scratch dir, and DELETE it before you yield (trap 'rm -rf -- "$S"' EXIT in shell; finally: shutil.rmtree in Python). /tmp only for files under 50 MB; never rely on an inherited TMPDIR. Receipts that matter are copied into your seat report dir first.

One wave item per seat, leaf only. Return one report with exact observed commands and output, evidence paths, limitations, and a final `VERDICT ok|finding|could-not-evaluate <one line>` line. No claim verdict by assertion; an unrun check has not passed. Counter/claims bytes are frozen: never propose or apply amendments; route holes as findings instead. Dead seats are recorded, never replaced.'''

items = []


def add(name, role, task, axes, milestone):
    items.append({'name': name, 'role': role, 'prompt': task, 'axes': axes, 'milestone': milestone})


def seat_task(title, body):
    return f'{GODSPEED}\n\n# {title}\n{body}\n\n# Output\nWrite your report at {LANE}/.ufo/waves/round-42/w1/<YourSeatName>/report.md (create the dir). Cite exact commands and outputs. End with the VERDICT line.'


# --- 19 quarantine scouts, 2 staged rows each (38 rows total) ---
rows = []
for line in Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/quarantine/slice-raw.txt').read_text().splitlines():
    sid, rest = line.split(' ', 1)
    rows.append((sid, rest.strip()))
assert len(rows) == 38, len(rows)

QBODY = '''You are re-adjudicating staged quarantine rows of THIS lane's slice (round-41 verifier defect D4; the round-40 adjudication is superseded as a fresh check, not copied).
Your assigned staged ids: {ids}.
For each id, in order:
1. Read its full row from the READ-ONLY register {reg} (derive: lane cell `tabi`, round cell, id cell). Record the row's source URL/anchor cells and the staged quote exactly as registered.
2. Fetch the cited source NOW with a read-only HTTP GET (curl -sSL or browser-free fetch). Record HTTP status, byte count, sha256 of the body, and the accessed URL after redirects. Never write inside /home/vgpnk/Projects/shokuknow.
3. Locate the staged quote in the fetched body (exact match first; then whitespace-normalized). If the exact URL 404s, try the obvious corrected location ONLY to classify misbound vs absent (the r40 round documented several misbindings); do not silently substitute a different URL as if it were the registered one.
4. Verdict, one of: present (quote verbatim in the registered source), absent (source opens, quote not in it), misbound (the quote/text belongs to a different registered source), partial (some phrase present, some absent, or a one-token register typo), unreachable (source cannot be fetched or record moved; NEVER fabrication).
5. Write evidence-<ID>.txt in your seat dir: id, registered URL, final URL, HTTP status, bytes, sha256, located/absent detail with the surrounding sentence, verdict, 2-6 sentence justification.
Your round-40 predecessor dispositions (for delta notes only, never copy): {prior}.
Changed verdict vs r40 must state exactly what changed on the live source today.'''

pairs = [(rows[i], rows[i + 1]) for i in range(0, 38, 2)]
PRIOR40 = {
    'S102': 'absent as staged', 'S106': 'absent/misbound (attribution defect)', 'S109': 'absent as staged', 'S110': 'absent as staged',
    'S111': 'partial (zh-cn locale only)', 'S114': 'partial/near-verbatim', 'S117': 'absent as staged', 'S118': 'present in arXiv PDF §2.3',
    'S124': 'absent verbatim / misbound', 'S125': 'absent', 'S126': 'absent', 'S130': 'absent', 'S131': 'absent', 'S133': 'absent',
    'S134': 'present as staged', 'S135': 'absent', 'S137': 'absent/misbound', 'S138': 'absent', 'S140': 'present as staged',
    'S142': 'absent', 'S143': 'absent', 'S144': 'absent', 'S145': 'absent (SameSite row; distinct from lane S145)', 'S147': 'absent at cited URL (misbound 1015/1020)',
    'S148': 'absent', 'S149': 'absent/misbound (daemons text belongs to S150)', 'S153': 'absent', 'S154': 'absent', 'S158': 'absent',
    'S163': 'present as staged', 'S164': 'present as staged', 'S165': 'absent (editorial summary)', 'S166': 'present as staged',
    'S167': 'absent', 'S171': 'unreachable (register URL 404; /features/ malformed row)', 'S174': 'absent', 'S175': 'partial (one-char typo 佪/佇)', 'S176': 'absent/misbound',
}
for i, (a, b) in enumerate(pairs, 1):
    ids = f'{a[0]}, {b[0]}'
    prior = f'{a[0]}: {PRIOR40[a[0]]}; {b[0]}: {PRIOR40[b[0]]}'
    body = QBODY.format(ids=ids, reg=REG, prior=prior)
    add(f'QuarR42{i:02d}', 'scout', seat_task(f'Quarantine re-adjudication rows {ids}', body), ['discernment'], f're-adjudicate {a[0]}+{b[0]}')

# --- 1 slice-derivation scout ---
add('ScoutRegisterDrift', 'scout', seat_task('Independent slice derivation cross-check', f'''Independently re-derive this lane's staged slice from the READ-ONLY register {REG} two ways:
1. The round-41 (buggy) extraction: awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {{print $4, $5}}' — show that it yields a malformed trailing-backtick id (S171``) for the S171 row.
2. The fixed extraction (gsub strip): awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {{id=$4; gsub(/[^A-Za-z0-9]/,"",id); print id, $5}}' | sort -u — confirm 38 unique ids.
Compare your fixed output byte-wise with the committed {LANE}/.ufo/waves/round-42/quarantine/slice-ids.txt (git show {FREEZE}:.ufo/waves/round-42/quarantine/slice-ids.txt). Also check the register's header AND its `## By lane` summary totals against your derived slice and report any staleness (the register is known-stale; derive, never trust summaries). Never write inside shokuknow.'''), ['discernment'], 'slice derivation cross-check')

# --- 8 reviewers ---
add('RevC1Receipt', 'reviewer', seat_task('C1 replay + battery controls audit', f'''Re-run the committed round-42 pre-data controls exactly as recorded and byte-compare the findings SETS (finding names, not timestamps):
- node scripts/measure-c1-round41.mjs --battery (committed .ufo/waves/round-42/controls/c1-battery-r42.json — all 6 cases pass: 5 vectors exit 2 environment-loader-contamination, clean exit 0)
- three counter v4 replay refusals (c1-r39-replay-r42, c1-r40-replay-r42, c1-r41-replay-refused — fresh 64-hex nonce each, exit 1). For the r41 replay use the committed receipt corpus/evidence/round41/playwright-egress/receipt.json + its real witness file with a FRESH nonce (the nonce binding is the do-nothing control for the round-42 claim).
Then attempt ONE novel bypass of your own design against SCRATCH COPIES of the wrapper/counter (cp to /fast/scratch/hyaku/tabi-r42/RevC1Receipt/ first; never modify lane bytes). Report whether the frozen chain holds and what your bypass attempt showed.'''), ['coverage'], 'C1 controls audit + one novel bypass')

add('RevC1Battery', 'reviewer', seat_task('Environment gate surface audit', f'''Read the env-gate code in scripts/measure-c1-round41.mjs (FORBIDDEN_ENV regex, ENV_ALLOW list, gate probe). The battery covers NODE_OPTIONS --require/--experimental-loader, NODE_PATH, LD_PRELOAD. Construct and test additional environment vectors in scratch against BOTH `node scripts/measure-c1-round41.mjs --battery-probe` and, where safe (no browser launch), the refused path of the wrapper: candidates include BASH_ENV, ENV, SHELLOPTS, GEM_HOME/BUNDLE_BIN, NODE_COMPILE_CACHE, NODE_V8_COVERAGE, NODE_EXTRA_CA_CERTS, PYTHONINSPECT, LC_ALL overload, and any vector you can argue. For each: does the gate refuse (exit 2) or pass? Does the vector actually reach a child of the driver or only this probe? Distinguish 'gate misses it but it cannot reach the measurement' from 'gate misses it and it can'. Findings only — no lane edits.'''), ['coverage'], 'env gate surface audit')

add('RevC2Freeze', 'reviewer', seat_task('Pre-data freeze integrity audit', f'''Verify the round-42 claims were frozen before wave data:
1. git -C {LANE} log --format='%H %cI %s' — the freeze commit {FREEZE} (round-42 claims.json + counters/check-routed-defects-round42.mjs + controls + D1/D2/D3 repairs) must predate this wave's dispatch; record the ordering.
2. git show {FREEZE}:.ufo/waves/round-42/claims.json — extract the C2 predicate sentence; byte-compare against the checker header comment and the code conditions (r1a/r1b/r2/r3/r4) in the same commit; any drift = finding.
3. git diff {FREEZE}..HEAD -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/ — must be empty at audit time.
4. Confirm the baseline red control (controls/c2-baseline-red.json, exit 1, 7 findings at {BASE}) is committed and its finding ids match the checker's current output at that rev.'''), ['calibration'], 'freeze integrity audit')

add('RevWaveConformance', 'reviewer', seat_task('Wave conformance audit', f'''After the wave spawns: read {LANE}/.ufo/waves/round-42/w1-spec.json, {LANE}/.ufo/waves/round-42/w1-dispatch.json and {LANE}/.ufo/waves/round-42/w1/swarm-registry.json (registry may appear shortly after dispatch; if absent, retry once after 60s, else report could-not-evaluate). Verify: 64 members; roles histogram matches reviewer 8, critic 6, mutation-tester 9, scout 20, executor 9, scribe 5, connector 4, sentinel 1, simplifier 1, revenger 1; attack share (reviewer+critic+mutation-tester) >= 25 percent; no planner/distiller/labrat roles; all names unique; reportDir is lane-relative .ufo/waves/round-42/w1; dispatch.json taskCall.context+tasks equal the spec-rendered payload (tasks count 64, every task begins with /skill:godspeed). Report exact numbers.'''), ['quality'], 'wave conformance audit')

add('RevLogDraft', 'reviewer', seat_task('LOG.md round-42 draft audit', f'''Audit the round-42 material for CORPUS.md count discipline: every count must carry its command and date; errata append-only; no admission asserted before WAVE-DONE. Read {LANE}/LOG.md tail (round-41 entry and any round-42 draft), {LANE}/.ufo/waves/round-42/claims.json beforeState fields, and the committed controls. Check: beforeState counts carry commands; the r41 entry's final paragraph does not claim wave completion; the working tree's uncommitted round-42 bytes (git status) are limited to expected landing paths. Report violations with path:line.'''), ['calibration'], 'LOG draft discipline audit')

add('RevQuarCross', 'reviewer', seat_task('Quarantine verdict cross-sample', f'''Wait until seat reports exist for QuarR4201, QuarR4208, QuarR4214, QuarR4219 under {LANE}/.ufo/waves/round-42/w1/<seat>/report.md (poll up to 3 times, 90s apart; if still absent report could-not-evaluate). For each sampled seat: open ONE cited source yourself (read-only GET), re-derive the verdict letter (present/absent/misbound/partial/unreachable), and check the seat's evidence file (id, URL, status, sha256, justification) is internally consistent. Flag any verdict that asserts without fetching, or whose letter contradicts its own evidence. Report per-seat agree/disagree with reasons.'''), ['discernment'], 'quarantine cross-sample')

add('RevReceiptBytes', 'reviewer', seat_task('Round-42 receipt bytes audit', f'''Audit the fresh round-42 receipt at {LANE}/corpus/evidence/round42/playwright-egress/receipt.json and .witness.json (may land during the wave; poll up to 3 times 90s apart):
1. sha256 both; compare with .ufo/waves/round-42/measure/c1-measure.json fields receiptSha256/witnessSha256.
2. Parse the receipt: schema, runNonce is 64-hex, runs length 2, both runs carry the same nonce, browserVersion bound, zero nonLoopback counts, zero survivors, identical firstShotSha256 across runs.
3. Confirm the committed r41 measure record (.ufo/waves/round-41/measure/c1-measure.json) hashes match the now-committed r41 files (git show {FREEZE}:corpus/evidence/round41/... sha256sum) — this is D1 closure evidence.
4. Confirm `git -C {LANE} status --porcelain` shows these files no longer untracked at audit time (they must be committed at the measured revision; report which commit if visible).
Report exact values.'''), ['coverage'], 'receipt bytes audit')

add('RevWitnessProbe', 'reviewer', seat_task('Witness channel audit', f'''Read the counter's witness conditions in .ufo/waves/round-41/counters/c1-session-bound-v4.mjs (>=10 samples, driver pid observed, firefox-binary descendants, startTicks inside run window). Then:
1. Verify the committed r42 witness (corpus/evidence/round42/playwright-egress/receipt.witness.json) actually satisfies them in its bytes (sample count, rootPid present in samples, firefox exe pids).
2. In scratch, attempt a witness-only forgery: hand-build a witness JSON (samples with firefox exe pids and startTicks) around a COPY of the committed r41 receipt; run counter v4 on the copy with a fresh nonce. Document exactly which finding refuses (nonce binding? witness nonce? root pid?) and whether ANY reachable forgery chain remains when the attacker controls only files, not the measure process.
Report the refusal chain precisely.'''), ['coverage'], 'witness channel audit')

# --- 6 critics ---
add('CritC1Reach', 'critic', seat_task('C1 do-nothing reachability attack', f'''The round-40 falsifier (NODE_OPTIONS=--require forger) is now refused by the loader-clean gate (battery exit 2). Your job: attempt to reach the C1 predicate — counter exit 0, predicate true — WITHOUT launching Firefox, using only what a seat has: scratch copies of scripts/measure-c1-round41.mjs, scripts/playwright-firefox-egress-round41.mjs, .ufo/waves/round-41/counters/c1-session-bound-v4.mjs, .ufo/waves/round-41/claims.json, the committed fixtures (.ufo/waves/round-41/fixtures/), committed receipts, and ordinary userland. Constraints: never modify lane bytes; never load kernel modules; no attacks on other processes. Try at least: (a) forging receipt+witness pair bound to a nonce you choose and invoking the counter directly; (b) environment vectors the battery does not cover; (c) race/rename tricks on the --out path; (d) invoking the counter with --measure crafted stdin. For each: exact command, exit code, refusing finding name or SUCCESS. Success = the round-42 claim is not admitted; report honestly either way.'''), ['coverage'], 'C1 reachability attack')

add('CritC2Ledger', 'critic', seat_task('C2 ledger rule gaming audit', f'''For each frozen checker rule in {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs, decide whether an untrusted committer could satisfy it without the real repair, and demonstrate on scratch fixtures (git init in /fast/scratch/hyaku/tabi-r42/CritC2Ledger/fixture; the checker takes --repo and --rev, so point it at your fixture):
- r1a/r1b: a hand-written receipt-shaped JSON whose sha256 also matches a self-authored measure record (both committed in the fixture) — the binding is to the COMMITTED measure record, so a self-consistent fixture greens it; is that a hole against the lane (the lane's measure record is itself committed and digest-pinned by the r41 chain) or acceptable? Argue from the threat model.
- r2: can a 1-word quote (e.g. 'options') green the substring check? Confirm the >=1..25 word window allows it and recommend (findings only) whether the window needs tightening.
- r3: '0' inside a longer number or command text — does the regex accept a file that never ran the command? 
- r4: self-authored TSV with self-authored 200-byte evidence files — the checker verifies shape, not truth; state plainly that truth comes from the seat reports + RevQuarCross sampling, and whether that chain is honest.
Report per rule: gameable-by-committer yes/no with demonstration.'''), ['calibration'], 'ledger gaming audit')

add('CritScorecard', 'critic', seat_task('Scorecard self-assessment audit', f'''Audit {LANE}/SCORECARD.md and {LANE}/.ufo/waves/round-42/claims.json for calibration drift beyond the four routed defects:
1. axesAtRoundStart in claims.json says adjacency 8, others 9, saturation 8, window 3 — re-derive from SCORECARD.md's last-measured table and the round-37..41 dispositions; confirm.
2. Verify no capability row was entered in rounds 39-41 (the nudge premise) by reading the capabilities table and round dispositions.
3. Check the r41 scorecard section for any assertion the round-41 verifier refuted (e.g. calling the uncommitted receipt durable) and list every remaining self-assessment-vs-observed mismatch you can find with path:line (the four known: D1-D4).
4. Confirm saturation/retired lines are consistent with 'no axis harmed' accounting for this round's planned moves.'''), ['calibration'], 'scorecard drift audit')

add('CritPredicateSentence', 'critic', seat_task('Predicate sentence identity audit', f'''The r37 lesson froze the rule: one predicate must be the same sentence at three sites (plan/claims, counter code, receipt label). For round 42:
1. Extract the C2 predicate from {LANE}/.ufo/waves/round-42/claims.json and the condition text from the checker header + each code branch (r1a, r1b, r2, r3, r4); verify each checker rule implements exactly its sentence clause; report any semantic drift with quoted diffs.
2. The C1 predicate claims to inherit the r41 chain: byte-compare the C1 predicate's technical clauses against the r41 claims.json C1 predicate ({LANE}/.ufo/waves/round-41/claims.json) and the r41 counter's enforced checks; report which clauses are inherited verbatim, which are new (committed bytes, controls, wave settlement), and whether any inherited clause is NOT actually enforced by counter v4 (that would be a counter-proxy defect like r39).
3. Confirm the receipt label schema (tabi-r42 paths) matches the claims.
No lane edits; report only.'''), ['calibration'], 'predicate sentence identity')

add('CritAdmissionPolicy', 'critic', seat_task('Admission policy preparation', f'''From the binding files ({LANE}/../AXES.md if readable at /home/vgpnk/Projects/shokunin/AXES.md, /home/vgpnk/Projects/shokunin/LEARNING.md, /home/vgpnk/Projects/shokunin/CORPUS.md, {LANE}/corpus/QUALITY.md), prepare the verdict vocabulary for the two round-42 outcomes:
- If C1's counter passes and the wave yields only THEORETICAL holes (no working do-nothing): does AXES.md admit the capability, or does QUALITY criterion history (r38-r40 admissions refused after attack waves) demand refusal? Quote the exact rules.
- If C2's checker greens but a seat shows the TSV's truth rests only on self-authored evidence: improved or unprovable for calibration? Quote LEARNING.md's discernment line.
- State exactly what 'no axis is harmed' requires for this round's landings (which files changed on which axes).
Report as a decision table the L1 can apply mechanically after WAVE-DONE.'''), ['calibration'], 'admission policy table')

add('CritC1Witness', 'critic', seat_task('Witness-only forgery bound', f'''Complementary to RevWitnessProbe: assume the attacker CANNOT run the measure wrapper (no nonce) but CAN write files and invoke the counter directly. Build in scratch the strongest forged receipt+witness pair you can (reuse committed r41 bytes as the base, patch nonces consistently in BOTH receipt runs and witness, forge sample timestamps with >1000ms spans, firefox exe pids with startTicks inside the run window, ss/proc summaries consistent per sample). Run counter v4. If it returns predicate true, the do-nothing chain exists and C1 must not be admitted — document the exact minimal edits that achieved it. If it refuses, name every refusing finding and which in-byte binding (nonce echo, digest pin, tree-ticks vs receipt window) blocks it. Either answer is valuable; report honestly.'''), ['coverage'], 'witness forgery bound')

# --- 9 mutation-testers ---
add('MutC1Counter', 'mutation-tester', seat_task('Counter v4 mutation run', f'''Copy .ufo/waves/round-41/counters/c1-session-bound-v4.mjs to /fast/scratch/hyaku/tabi-r42/MutC1Counter/ (never edit lane bytes). Copy the fresh round-42 receipt+witness beside it when they exist (else use the committed r41 pair). Apply and run each mutation separately (node mutant.mjs <receipt> --nonce <real nonce from the receipt> --witness <witness> --pins <claims copy>):
M1 drop the sample-span check; M2 accept usable() with ticks==0; M3 skip witness verification entirely; M4 accept nonzero nonLoopback counts; M5 relax the tree exe check to any executable; M6 skip the nonce comparison.
Record per mutant: exit code, predicate, which committed facts it now accepts. Survivors (mutations that flip predicate to true on the real receipt) = counter holes; list them as findings for the next freeze. Restore nothing (scratch only).'''), ['coverage'], 'counter mutation run')

MUT_C2 = '''Copy {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs to /fast/scratch/hyaku/tabi-r42/{seat}/ (never edit lane bytes). Build a scratch git fixture repo (mktemp -d under your scratch; git init -q; verify git -C "$D" rev-parse --show-toplevel equals "$D" before any commit) containing: {fixture}. Apply the mutation {mutation}; run the MUTANT checker against your fixture where the unmutated checker must refuse; then run the pristine checker (from lane bytes, read-only) against the SAME fixture and record its exact refusing finding ids. Report a red/green table: fixture x (pristine, mutant) x (exit, findings). A mutant that greens a fixture the pristine checker refuses proves the dropped clause is load-bearing.'''
MUT_C2 = MUT_C2.replace('{LANE}', LANE)
add('MutC2Size', 'mutation-tester', seat_task('C2 r1 size-floor mutation', MUT_C2.format(seat='MutC2Size', mutation='M: drop the >=1000-byte floor and the JSON parse requirement in r1a/r1b (accept any committed blob)', fixture='a 12-byte receipt.json and a 10-byte witness at corpus/evidence/round41/playwright-egress/, plus a self-authored measure record with matching sha256s of those tiny files')), ['calibration'], 'r1 size floor mutation')

add('MutC2Status', 'mutation-tester', seat_task('C2 S146-status mutation', MUT_C2.format(seat='MutC2Status', mutation='M: skip the S146 status==rejected requirement in r2', fixture='corpus/SOURCES.md with the real S148 row appended but S146 left mined')), ['calibration'], 'S146 status mutation')

add('MutC2IdSet', 'mutation-tester', seat_task('C2 id-set mutation', MUT_C2.format(seat='MutC2IdSet', mutation='M: drop the id-set equality check in r4 (accept any TSV with valid rows)', fixture='re-adjudication.tsv with only 33 of the 38 ids plus slice-ids.txt with all 38')), ['calibration'], 'id set mutation')

add('MutC2Enum', 'mutation-tester', seat_task('C2 verdict-enum mutation', MUT_C2.format(seat='MutC2Enum', mutation='M: accept any verdict token in r4', fixture='re-adjudication.tsv with 38 rows where 5 verdicts are `ok` and evidence paths exist (200+ byte files)')), ['calibration'], 'verdict enum mutation')

add('MutC2Sentence', 'mutation-tester', seat_task('C2 verbatim-quote mutation', MUT_C2.format(seat='MutC2Sentence', mutation='M: relax the r2 quote check from verbatim substring to whitespace/case-insensitive fuzzy containment', fixture='SOURCES.md whose S148 teaches cell carries the ORIGINAL spliced S146 quote (A space-separated list of command-line options; interpreted before command-line options) — show the pristine checker refuses it (not a substring) while the mutant accepts it; this proves the verbatim rule is load-bearing')), ['calibration'], 'verbatim quote mutation')

add('MutC2Digest', 'mutation-tester', seat_task('C2 digest-binding mutation', MUT_C2.format(seat='MutC2Digest', mutation='M: skip the sha256==measureRecord comparison in r1a/r1b (keep size+parse)', fixture='a receipt.json of 2000 bytes that is valid JSON but whose bytes differ from the committed r41 record; measure record unchanged')), ['calibration'], 'digest binding mutation')

add('MutC2TinyStub', 'mutation-tester', seat_task('C2 r3 stub mutation', MUT_C2.format(seat='MutC2TinyStub', mutation='M: drop the ls-tree-command-mentioned requirement in r3 (keep nonempty+digit)', fixture='c1-baseline-noop.out containing only the single line 0')), ['calibration'], 'r3 stub mutation')

add('MutSliceExtraction', 'mutation-tester', seat_task('Slice extraction red/green', f'''Prove the r41 D4 extraction fix able to fail (CORPUS.md: a fix counts only once shown able to fail):
1. Run the OLD r41 extraction (awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {{print $4, $5}}' {REG}) — capture its S171 line and show the malformed id (S171 with trailing backtick).
2. Run the FIXED extraction (same with {{id=$4; gsub(/[^A-Za-z0-9]/,"",id); print id, $5}} | sort -u) — capture S171 clean.
3. Diff both id lists against the committed {LANE}/.ufo/waves/round-42/quarantine/slice-ids.txt (git show {FREEZE}:...): fixed must equal, old must differ (or contain the malformed token).
4. Also demonstrate the census-parser angle: on a scratch fixture SOURCES.md with an indented `  | S002 |` row, show a column-zero-only grep misses it while '^ {{0,3}}' catches it (the kumitate lesson).
Never write inside shokuknow. Save both outputs in your seat dir.'''), ['discernment'], 'extraction red/green')

# --- 9 executors ---
add('ExecC1ColdRunbook', 'executor', seat_task('Wrapper usage-contract red cases', f'''Cold-read ONLY the usage header of scripts/measure-c1-round41.mjs, then verify its refusal surface without launching any browser:
1. No args: expect exit 64 and the usage line.
2. --out pointing at an existing file (create a tiny file in your scratch and pass its path): expect exit 1 and finding output-already-exists.
3. --out under a nonexistent unwritable path (e.g. /fast/scratch/hyaku/tabi-r42/ExecC1ColdRunbook/no/such/dir/x.json after chmod 000 on a parent you own): expect a refusal, not a traceback.
4. --battery-probe in your own scrubbed env: expect exit 0, contaminated false.
Record every command + exit + output. Do NOT run the full measurement (the L1 runs it).'''), ['operability'], 'usage-contract red cases')

add('ExecCensus', 'executor', seat_task('Manual census battery', f'''From /home/vgpnk/Projects/shokunin/CORPUS.md §SOURCES.md Census, run the frozen manual commands against {LANE}/corpus/SOURCES.md: row count (grep -cE), malformed rows (awk NF!=13 → 0), tier histogram, status histogram, duplicate ids (nothing), enum violations + tier inflation (nothing), mined used-by existence (no missing). Also run /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi and record exit + warning count. Compare row count and histograms against the round-40 recorded baseline (145 rows; A129/B7/C9; mined121/queued15/rejected9) plus the expected round-42 deltas (S146 mined→rejected; +S148, +S149 mined) and report whether observed matches expected exactly.'''), ['quality'], 'manual census battery')

add('ExecNoHarm', 'executor', seat_task('No-harm diff sweep', f'''git -C {LANE} diff --stat {BASE}..HEAD (and --name-status). Verify every changed path is inside: corpus/SOURCES.md, corpus/knowledge/, corpus/README.md, .ufo/waves/round-42/, .ufo/waves/round-41/controls/c1-baseline-noop.out, corpus/evidence/round41/, corpus/evidence/round42/. Verify NO change touches MANIFEST.json, ../templates/, ../scripts/, sibling repos, .ufo/state/, .ufo/watchdog.log. Verify SCORECARD.md is untouched at audit time (scorecard dispositions land only after WAVE-DONE). Also verify the two >1MiB D1 files are committed blobs (git cat-file -s at HEAD). Report the exact path list and any violation.'''), ['calibration'], 'no-harm diff sweep')

add('ExecQuoteVerify', 'executor', seat_task('Quote fidelity from committed bytes', f'''At rev {FREEZE}:
1. git show {FREEZE}:corpus/SOURCES.md — extract the S148 row; take the teaches cell, strip the leading `supersedes S146 —`, confirm the remainder is exactly `A space-separated list of command-line options.` (7 words).
2. Confirm that string is a substring of git show {FREEZE}:.ufo/waves/round-41/sources/node-cli-v24.21.0.html (grep -F), and quote the surrounding 120 bytes.
3. Extract the S149 row; confirm its quote `Lists the contents of a given tree object, like what "/bin/ls -a" does` (13 words) is a substring of git show {FREEZE}:.ufo/waves/round-42/sources/git-ls-tree.html.
4. Run node {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev {FREEZE} --repo {LANE} --json and confirm its r2 state agrees with your manual derivation (only r4 should remain red).
Report each as command → output.'''), ['quality'], 'quote fidelity from bytes')

add('ExecBaselineCount', 'executor', seat_task('Baseline count transcription check', f'''Re-derive both baseline counts and verify the committed transcriptions are faithful:
1. git -C {LANE} ls-tree -r --name-only fecbdf0a3aa79ce17bce3ef7338f69112f604f88 -- corpus/evidence/round41 | wc -l  (expect 0)
2. git -C {LANE} ls-tree -r --name-only {BASE} -- corpus/evidence/round42 | wc -l  (expect 0)
3. Compare (1) against the now-populated .ufo/waves/round-41/controls/c1-baseline-noop.out at HEAD (git show HEAD:.ufo/waves/round-41/controls/c1-baseline-noop.out): the file must carry the same command shape and the digit 0.
4. Compare (2) against .ufo/waves/round-42/controls/c1-baseline-tree-count.txt.
5. Run node {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev {BASE} --repo {LANE} --json and confirm exit 1 with the committed red findings (controls/c2-baseline-red.json).
Report each command and output.'''), ['calibration'], 'baseline transcription check')

add('ExecSelftestSynthetic', 'executor', seat_task('Checker negative-surface selftest', f'''In /fast/scratch/hyaku/tabi-r42/ExecSelftestSynthetic/fixture (mktemp -d, git init -q, verify top-level), commit fixtures and run the REAL pristine checker from lane bytes (read-only) with --repo <fixture> --rev <fixture head>:
F1: re-adjudication.tsv with 38 valid rows but 5 evidence paths absent → expect r4-evidence-absent x5, exit 1.
F2: TSV with a duplicated id → r4-duplicate-ids, exit 1.
F3: receipt.json valid JSON of 500 bytes + matching tiny witness + self-authored measure record → r1a-too-small / r1b-too-small, exit 1.
F4: SOURCES.md with S148 quote = 30 invented words → r2-quote-word-count, exit 1.
F5: clean full fixture (all four repairs genuine but arbitrary bytes) → checker exit 0 (predicate true) — proving the checker is not red-by-construction.
Record every fixture, command, exit, findings. Clean up scratch before yielding.'''), ['calibration'], 'checker negative selftest')

add('ExecScrubRepro', 'executor', seat_task('r41 control reproducibility sweep', f'''Re-run the committed round-41 control set with fresh nonces and byte-compare the findings SETS (names only, ignore timestamps/nonces) to the committed r41 receipts:
1. node {LANE}/.ufo/waves/round-41/counters/c1-session-bound-v4.mjs <r39 receipt> --nonce <fresh> --witness <nonexistent> --pins <claims>  vs controls/c1-round39-replay.json findings.
2. Same for r40 vs controls/c1-round40-replay.json.
3. node scripts/measure-c1-round41.mjs --battery vs controls/c1-battery.json (all cases pass).
Report any findings-set drift as a finding with both sets quoted.'''), ['quality'], 'r41 control reproducibility')

add('ExecWaveAudit', 'executor', seat_task('Dispatch payload audit', f'''Read {LANE}/.ufo/waves/round-42/w1-dispatch.json (and w1-spec.json). Verify: top-level taskCall exists with context + tasks; tasks length 64; every task string begins with /skill:godspeed; names match the spec items 1:1; no task contains a model parameter. Cross-check three sample tasks (QuarR4201, CritC1Reach, SentC2Checker) — quote their first 200 chars. Also confirm a w1.ready file exists naming THIS dispatch path (not the spec path — the round-41 failure mode) and record its JSON. This audit is the direct check of the round-41 dispatch defect.'''), ['quality'], 'dispatch payload audit')

add('ExecScratchGuard', 'executor', seat_task('Scratch + bounds guard sweep', f'''Run LATE in the wave (if dispatched early, wait 8 minutes before sweeping):
1. ls -la /fast/scratch/hyaku/tabi-r42/ — list seat dirs still present; for each, note size (du -sh). Seats should delete on exit; mid-wave presence is legal, report as observation.
2. df -h /fast/scratch /tmp — record free space; if /fast/scratch usage > 90 percent, report immediately as a finding.
3. Detect out-of-bounds writes: find {LANE} -newer {LANE}/.ufo/waves/round-42/claims.json -type f -not -path '*/.ufo/waves/round-42/w1/*' -not -path '*/.jj/*' -not -path '*/corpus/evidence/round42/*' | head -50 — every hit must be an expected L1 landing path (LOG.md, SCORECARD.md, corpus/lessons/, corpus/SOURCES.md, corpus/README.md, corpus/knowledge/); anything else is a bounds violation to report with mtime evidence.
4. git -C /home/vgpnk/Projects/shokunin status --porcelain | head -30 — report any file naming tabi/round-42 at the fleet root (misroot candidate; do not touch, report).
Read-only sweep; report only.'''), ['operability'], 'scratch and bounds guard')

# --- 5 scribes ---
add('ScriC2Entry', 'scribe', seat_task('Errata compliance check', f'''Read {LANE}/corpus/knowledge/environment-injection-measurement-integrity-round-41.md tail (the round-42 errata block) and {LANE}/corpus/SOURCES.md rows S146/S148. Verify: (1) the errata is a pure append (git show {BASE}:corpus/knowledge/environment-injection-measurement-integrity-round-41.md | cmp with the first N bytes of the current file — prefix-preserving); (2) it changes no measured claim, only the source pointer and quote; (3) S146/S148 transitions it names match the registry bytes (S146 rejected with used-by corpus/lessons/round-42.md; S148 teaches begins supersedes S146). Draft any correction as a patch file in your seat dir — never edit the corpus. Report prefix-preservation proof (byte offset where the append starts).'''), ['quality'], 'errata compliance check')

add('ScriLesson', 'scribe', seat_task('Round-42 lesson skeleton draft', f'''Draft {LANE}/.ufo/waves/round-42/w1/ScriLesson/round-42-lesson-draft.md with the structure CORPUS.md requires: # Round 42 title; ## Gate (candidates considered — the two claims + quarantine set; admitted; rejected with reasons — cite the frozen claims.json and controls); ## Mistakes table rows for: D1 landing-class (cited durable receipt untracked; captured-by: none — no criterion required evidence-at-revision before r42; fix: S149 entry + checker R1), D2 reference-drift (spliced S146 quote; captured-by: CORPUS quote-location rule; fix: S148 + checker R2), D3 landing-class (empty committed control file; captured-by: CORPUS count-carries-command; fix: populated file + checker R3), D4 process (stale extraction accepted; captured-by: none; fix: gsub extraction + MutSliceExtraction red/green), and the r41 dispatch failure (provider/landing class: ready file pointed at the spec without taskCall; captured-by: none; fix: ready must name the validator dispatch output; verified by ExecWaveAudit). Leave measured values as clearly-marked PENDING-WAVE placeholders. This is a DRAFT for the L1 — do not write into corpus/.'''), ['quality'], 'lesson skeleton draft')

add('ScriSOURCES', 'scribe', seat_task('Registry rows census check', f'''Run the census against the CURRENT working tree {LANE}/corpus/SOURCES.md: row count (expect 149: 147 + S148 + S149), tier histogram (A131/B7/C9 expected — S148/S149 tier A), status histogram (mined 122... wait, S146 flips mined→rejected and S148/S149 arrive mined: mined 121-1+2=122, rejected 9+1=10, queued 15), duplicate ids none, enum violations none. Verify S148/S149 cells contain no literal or escaped pipe and are 11-column rows (awk NF==13). Cross-check /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi exits 0 (W04 duplicate-URL warnings may grow by one for S148 sharing S146's URL — acceptable). Report observed-vs-expected per number with commands.'''), ['quality'], 'registry census check')

add('ScriCapabilityRow', 'scribe', seat_task('SCORECARD round-42 section draft', f'''Draft {LANE}/.ufo/waves/round-42/w1/ScriCapabilityRow/scorecard-round42-draft.md: the Round 42 declared-claims table (C1/C2 rows with the frozen predicates, counting commands, before states quoted from claims.json), an empty waves block (L1 fills after WAVE-DONE), trend-verdict placeholders, and — only as a commented-out block — the capability row text for playwright-firefox-loopback-tcp with its evidence pointers (receipt path, counter, controls), ready to uncomment on admission. Verify vocabulary against /home/vgpnk/Projects/shokunin/AXES.md §SCORECARD contract (axes/capabilities/planned/saturation/retired fields) and §Capabilities (rows enter only through a demonstrated running capability). DRAFT ONLY — do not write SCORECARD.md.'''), ['calibration'], 'scorecard section draft')

add('ScriReportDraft', 'scribe', seat_task('Report skeleton draft', f'''Draft {LANE}/.ufo/waves/round-42/w1/ScriReportDraft/report-skeleton.md with the exact required sections in order (per the round prompt): Work performed; Landed changes; Before → after measurements; Sources & frontier; Trend verdicts; SHONEN — plus Stale-lane, wave shape, tool installs, misroot sweep, L0 questions. Pre-fill every section with the frozen facts you can already cite (claims, freeze commit {FREEZE}, baseline {BASE}, controls with paths, D1/D2/D3 repairs with commits) and leave clearly-marked PENDING slots for: live C1 measurement, wave results/role mix/dead seats, TSV, census-end, final tip hash, trend verdicts, SHONEN lines. DRAFT ONLY — the fleet report is written by the L1.'''), ['quality'], 'report skeleton draft')

# --- 4 connectors ---
add('ConnSiblingLedger', 'connector', seat_task('Sibling routed-defect ledger overlap', f'''Scan sibling lanes read-only for routed-defect-ledger patterns that overlap tabi round-42 C2: /home/vgpnk/Projects/shokunin/kumitate-shokunin/ (the r42 sentence-identity rule), /home/vgpnk/Projects/shokunin/kotoba-shokunin/ (r69/r71 SHONEN gate incidents), and any lane whose verifier routed uncommitted-evidence or quote-fidelity defects. For each overlap: what their instrument checks, what C2's checker checks, whether tabi should CITE a sibling lesson or ROUTE ground back. Name contested scope explicitly; report, never absorb.'''), ['adjacency'], 'sibling ledger overlap')

add('ConnSiblingProc', 'connector', seat_task('Sibling /proc-net observation refresh', f'''Refresh the round-40 connector finding: kama (local model serving — /proc/net listener ownership) and souji (process residue). Read-only scan of their corpora/recent lessons (ls -t, newest first) for anything landed since 2026-10-27 about /proc/net/tcp parsing, socket ownership, process-tree identity. Report what is new, whether tabi's S145-scoped TCP observation should cite it, and confirm the provinces remain distinct (tabi observes its own browser session's sockets; not a general host-egress claim).'''), ['adjacency'], 'sibling proc-net refresh')

add('ConnSiblingQuar', 'connector', seat_task('Wave-4 quarantine peers', f'''The wave-4 quarantine-first lanes are tabi, revenger, chousa, kotodama. Read-only: how did the other three land their slice adjudications (verdict vocabularies, evidence formats, adoption decisions)? Check /home/vgpnk/Projects/shokunin/revenger-shokunin/corpus/lessons/ , /home/vgpnk/Projects/shokunin/chousa-shokunin/corpus/lessons/ , /home/vgpnk/Projects/shokunin/kotodama-shokunin/corpus/lessons/ and their recent round reports. Report format alignment opportunities for tabi's re-adjudication TSV (staged_id, verdict, evidence path) and any adoption reasoning tabi should consider or route. No lane edits.'''), ['adjacency'], 'quarantine peer alignment')

add('ConnSelfOverlap', 'connector', seat_task('In-lane overlap of the new entry', f'''Read {LANE}/corpus/knowledge/committed-bytes-verification-round-42.md and the registry rows S142 (git-show manual) and S143 (git-replace manual) with their used-by entries. Decide: is the new committed-bytes entry distinct ground from the existing git-show/git-replace material, or overlap? Name the specific distinct claims (evidence-at-revision rule, >1MiB file commit behavior, ls-remote pre-report gate). If overlap, recommend (findings only) a supersession or a cross-cite. Read-only.'''), ['adjacency'], 'in-lane entry overlap')

# --- 1 sentinel ---
add('SentC2Checker', 'sentinel', seat_task('Checker adversarial input probes', f'''Attack the checker CLI itself with adversarial inputs (read-only; the checker must never write): run node {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs with:
P1 --rev HEAD-short-hash (7 hex) → expect exit 2 usage.
P2 --rev with shell metacharacters (; rm -rf /tmp/x) → exit 2, nothing executed (verify /tmp/x absent).
P3 --repo /fast/scratch/hyaku/tabi-r42/SentC2Checker/symlink-to-lane (a symlink you create) → does it behave identically to the real lane (symlink following is acceptable for a read-only checker; report).
P4 a TSV with CRLF line endings committed in your scratch fixture → confirm the checker strips \\r or refuses; whichever it does is fine, report it.
P5 evidence path with ../ traversal (fixture: ../../etc/passwd) → expect r4-evidence-absent (git has no such blob), no filesystem read outside the repo.
P6 5000-row TSV → termination within 60s or report DoS.
P7 unicode/emoji staged ids → r4-ids-* findings, no crash.
P8 quote cell containing a pipe character inside the S148 teaches cell → the split-based parser must not crash; report behavior (census would flag the row separately).
Record each probe: command, exit, finding/output, and whether any filesystem write occurred (argue from the code: which fs APIs does the checker call?).'''), ['quality'], 'adversarial CLI probes')

# --- 1 simplifier ---
add('SimplC2Checker', 'simplifier', seat_task('Checker simplification review', f'''Read {LANE}/.ufo/waves/round-42/counters/check-routed-defects-round42.mjs against its frozen predicate in claims.json. Identify: dead branches, duplicated logic, error paths that cannot fire, and any simplification that PRESERVES the frozen semantics exactly (e.g., shared blob-read helper). Deliver a unified-diff patch file in your seat dir — NEVER edit the frozen counter this round; the patch is a routed proposal for the next freeze. Verify your patch preserves behavior by running BOTH versions against {LANE} at HEAD and at {BASE} and comparing JSON outputs byte-wise. If no worthwhile simplification exists, say so explicitly — deleting working validation code is not a win.'''), ['operability'], 'checker simplification review')

# --- 1 revenger ---
add('RevengerDispatch', 'revenger', seat_task('Reverse the round-41 dispatch failure', f'''Reconstruct from committed bytes why round 41's wave never spawned:
1. Read {LANE}/.ufo/waves/round-41/w1.ready (dispatch field → w1-spec.json) and .ufo/waves/round-41/w1.ready.dispatched (the never-dispatched marker naming dispatcher KeyError(taskCall)).
2. Read the spec's top-level keys (wave/maxLanes/reportDir/context/items — no taskCall) vs the dispatcher's expectation (dispatch JSON with taskCall.context+tasks). Also read the kasegi r42 run-start repair note in /home/vgpnk/Projects/shokunin/.scratch/goal-20261028-hyaku-run11.md (same failure shape: ready pointing at a spec without taskCall).
3. Verify the round-42 handoff breaks this chain: {LANE}/.ufo/waves/round-42/w1-dispatch.json must contain taskCall; the w1.ready JSON must name THE DISPATCH file, not the spec. Report the exact check (jq/python extraction of taskCall.tasks length) as your evidence. If the ready file has not landed yet at your runtime, audit the dispatch file only and say so.
4. Draft the two-sentence guard rule for future rounds as lesson text in your report.
Do not write outside your seat dir.'''), ['quality'], 'dispatch failure reverse')

# --- assemble ---
spec = {
    'wave': 'tabi-r42-w1',
    'maxLanes': 64,
    'reportDir': '.ufo/waves/round-42/w1',
    'context': CONTEXT,
    'items': items,
}
out = Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1-spec.json')
out.write_text(json.dumps(spec, indent=1, ensure_ascii=False) + '\n')
print('items:', len(items))
from collections import Counter
print(Counter(i['role'] for i in items))
attack = sum(1 for i in items if i['role'] in ('reviewer', 'critic', 'mutation-tester'))
print('attack share:', attack, '/', len(items))
