# ScribeReport — round 39 final-report section outline (draft)

Seat item: draft the round-39 final report's section outline, with exact required headings and
clearly marked placeholders for L1 integration. This file is the draft only. It does not edit any
product file, does not commit, and does not state a claim result.

- Lane repo read at: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, tip
  `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` (read with `git rev-parse HEAD`).
- Frozen claims: `.ufo/waves/round-39/claims.json`; declared freeze
  `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; baseline
  `5bc56a81d196caeb8d24551928b883802697aabb`.
- Contract sources read: `PROTOCOL.md:85-215` (report path, minimum content, lands-last,
  content check, stale-lane), `AXES.md` (six axes, claim/capability/nudge rules),
  `MISSION.md` (L2 floor, report path, round end), `SHONEN.md` (four box texts),
  `.ufo/reports/round-38/tabi.md` and `.ufo/reports/round-37/tabi.md` (lane's established
  report shape), both frozen counters, the driver, and the round-39 measure/assimilation dirs.

Placeholder syntax: `{{L1:ID}}`. Every placeholder has one row in the ledger below with a
source-of-truth path/command and an acceptance rule. No value in this outline is a predicted
result; values observed at draft time are labelled **observed** with the command that produced
them.

---

## 1. Contract the filed report must satisfy (exact, sourced)

| # | Requirement | Source | Hard? |
|---|---|---|---|
| 1 | Report path `.ufo/reports/round-<N>/<lane>.md` in the **fleet main repo**, i.e. `/home/vgpnk/Projects/shokunin/.ufo/reports/round-39/tabi.md` | `PROTOCOL.md:146-149` | yes (path); a file under another name does not satisfy the contract |
| 2 | Work performed + evidence pointers (paths, commands, diffs) | `PROTOCOL.md:152-156` | yes (content check) |
| 3 | Changes landed in the lane repo, **each tied to a `LOG.md` entry** | `PROTOCOL.md:157`, `:197-199` | yes (content check) |
| 4 | Cross-domain evidence encountered, with the domain it belongs to | `PROTOCOL.md:158-159` | yes (conformance) |
| 5 | `Sources & frontier` section: `SOURCES.md` rows before→after, counting command, rows added by tier, rows touched old→new, frontier rows advanced — or a line beginning `SOURCES: unchanged —` naming why | `PROTOCOL.md:160-166` | yes (conformance) |
| 6 | `SHONEN` heading, **exactly one `[x]`/`[ ]`/`[~]` line per box** in `SHONEN.md`, with pointer | `PROTOCOL.md:164-168` | yes (content check; a report without this heading fails the contract) |
| 7 | Commit-hash citation: lane `HEAD` at filing, ancestor of closure `HEAD` (`git merge-base --is-ancestor <hash> HEAD`) | `PROTOCOL.md:117-135` | yes (content check) |
| 8 | Report lands **last**, after the lane's round work is committed; report commit carries the lane identity | `PROTOCOL.md:117-135` | yes |
| 9 | Stale-lane: list every mission open longer than two driver ticks, age from launch timestamp, graded *progressing* / *silent* / *progressing-weak* | `PROTOCOL.md:169-186` | yes (conformance) |
| 10 | 1–3 claims, distinct axes, each with before→after; lowest-axis obligation or the recorded stagnation waiver | `AXES.md`; `claims.json` | yes (round admission) |
| 11 | L2: one batched dispatch of ≥8 lanes; here the frozen wave is 64 seats and L1 held the planner seat | `MISSION.md`; `w1-spec.json` | yes (round shape) |
| 12 | Report content check is not a marker: real work, ≥1 evidence pointer, LOG-tied changes, checkable commit | `PROTOCOL.md:189-206` | yes |

Note on the trailer: `PROTOCOL.md` does **not** require a `VERDICT …` line in the lane report;
round-38's filed report ends at its last section. The `VERDICT ok|finding|could-not-evaluate …`
trailer is this wave's seat-harness requirement. If the harness also applies it to the lane
report, L1 appends it as the final line, after `## Disposition`, as
`VERDICT {{L1:R-08}} — {{L1:R-09}}`; otherwise the round outcome lives in `## Disposition`.

---

## 2. Canonical heading set (ordered, exact text)

Only `## SHONEN` and the `## Sources & frontier` content are named by `PROTOCOL.md`. The rest is
the lane's established shape (rounds 36–38) extended for the round-39 two-claim design. Use these
strings verbatim so the report reads as one series; do not rename headings between rounds.

| Order | Exact heading | Purpose | Protocol-fixed? |
|---|---|---|---|
| 1 | `# tabi — round 39 report` | H1 + filing preamble | shape |
| 2 | `## Work performed` | claims, types, work items, wave dispatch, planner seat | content check |
| 3 | `## Freeze and instrument integrity` | freeze/baseline commits, digests, predicate byte-identity, frozen-input immutability | round-39 addition |
| 4 | `## Claim C1 — coverage capability: session-bound Playwright Firefox egress` | C1 target, command, receipt fields, do-nothing control, capability input | round-39 addition |
| 5 | `## Claim C2 — calibration: round-38 routed residuals 1–2` | C2 D1–D7, both controls, census/numstat protocol | round-39 addition |
| 6 | `## Wave falsification credit` | 64-seat tally, role mix, dead/partial seats, seat evidence path | round-39 addition |
| 7 | `## Landed changes` | one bullet per commit, each with its `LOG.md` anchor | content check |
| 8 | `## Before → after measurements` | the numbers: baseline → integration REV per claim | content check |
| 9 | `## No-harm` | gate/self-test battery, baseline comparison, exit counts | round 37 practice |
| 10 | `## Cross-domain evidence` | evidence + owning domain, reported not absorbed | content check |
| 11 | `## Sources & frontier` | census before→after, rows added/touched, frontier advance | **yes** |
| 12 | `## Assimilation and quarantine` | slice count, collisions/guard, adoption decision, `considerthese/` check | round-39 addition |
| 13 | `## Axis, capability and scorecard disposition` | axis verdicts, capability-row decision, saturation/window, no auto-bump | round-39 addition |
| 14 | `## Trend verdicts` | expansion / quality / discernment, evidence per row | shape |
| 15 | `## SHONEN` | four boxes, one line each, with pointers | **yes** |
| 16 | `## Stale-lane` | mission inventory and progress grade | **yes** |
| 17 | `## Round shape, tools, open questions, and misroot sweep` | seat/role counts, installs, L0, sweep output | shape |
| 18 | `## Disposition` | per-claim verdict, round admission, routed defects | round-39 addition |

Preamble (under the H1, before `## Work performed`) must carry, in one short block:

- lane repo `HEAD` at filing + branch, and the remote equality check
  (`git ls-remote origin refs/heads/master` → same hash, ahead=0);
- round-start baseline and freeze commit(s) (see §3 for the pointer conflict);
- one sentence naming the two claims' axes and the stagnation-nudge waiver.

---

## 3. `## Freeze and instrument integrity`

Required content, each item with its observed command:

1. Freeze/baseline commit table. Observed segment of `git log --format='%H %s'`:
   - `1f4260aeb3af186e84444cbb417a31b8a35bdb55` round-39: freeze claims, driver, C1/C2 counters
   - `690b0500fab8eac5ab85485bbcecbc0076247bea` control receipts and session-bound receipt
   - `9c09ebb1e2ff594c70ce72093b5d4133c1734dca` amend C2 pre-data predicate binding and quarantine slices
   - `dc695dc00b24feeaed6d31478a77532ca4f50776` finalize amended C2 freeze and validated 64-seat wave
   - `3fdf16fb2b8e5fdbf736dc409c5835a9ca0b5ee7`, `d3232d56a909576aef6370243c5d457fbf42b1d2`,
     `25d4f53821d5fbfe5f32d695b4d83e747fc6768e`, `03322e9d6da8a22f739529680db392b4f3d39697`,
     `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`
   L1 must state which commit **carries the measured bytes** of `claims.json`, each counter, and the
   driver, and which commit is the claim-declared freeze.
2. Digest table vs `claims.json.frozenDigests` (observed `sha256sum`):
   - `c1-egress-session-bound.mjs` = `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e` ✓
   - `c2-routed-defects-v2.mjs` = `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c` ✓
   - `scripts/playwright-firefox-egress-round39.mjs` = `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc` ✓
3. Frozen-input immutability: `git diff --stat 9c09ebb..<REV> -- .ufo/waves/round-39/counters scripts/playwright-firefox-egress-round39.mjs`
   → observed empty at `1ace2fd`. Paste the same at the integration REV.
4. Predicate byte-identity, both claims (observed `true` for C1 and C2 at HEAD with the constant
   parsed by regex from each counter):

   ```sh
   node - <<'NODE'
   const fs=require('fs');
   const claims=JSON.parse(fs.readFileSync('.ufo/waves/round-39/claims.json','utf8'));
   const files=['.ufo/waves/round-39/counters/c1-egress-session-bound.mjs',
                '.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs'];
   files.forEach((f,i)=>{const s=fs.readFileSync(f,'utf8');
     const m=/const PREDICATE_SENTENCE = "([^"]+)"/.exec(s);
     console.log(i,claims.claims[i].id,m[1]===claims.claims[i].predicate);});
   NODE
   ```
5. **Claims-file pointer conflict (must be stated, not smoothed).** Observed:
   `git show 9c09ebb:<claims>` sha256 = `40740f82aee080b9a1cd2c002d31c8f36455622c8b37b95bb03e101086fcc009`;
   `git show HEAD:<claims>` sha256 = `ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6`;
   `git diff --stat 9c09ebb..HEAD -- .ufo/waves/round-39/claims.json` → `1 file changed, 1 insertion(+), 1 deletion(-)`,
   the single line `frozenAt` changing `1f4260a…` → `9c09ebb…`. The D4 mutant receipt records
   `frozenClaimsSha256: 40740f82…`, i.e. the pre-amendment bytes. D4 does not compare that digest to
   the claims at REV, so the counter cannot expose this. State the actual binding used by the
   measured claim and the receipt's digest, side by side.
6. Ancestry: `git merge-base --is-ancestor 9c09ebb <REV>` and `… 5bc56a8 <REV>` → observed exit 0
   at `1ace2fd`; re-run at the integration REV.

---

## 4. `## Claim C1 — coverage capability: session-bound Playwright Firefox egress`

State: axis `coverage`; kind `capability-acquisition`; surface Playwright 1.64.0 + Firefox 157.0
(Juggler) against the loopback fixture, observed by `scripts/playwright-firefox-egress-round39.mjs`.

Required content:

1. The frozen predicate sentence quoted verbatim from `claims.json` (do not paraphrase; the kill
   rule fires on "any stated number differing from the receipt").
2. Counting command, exactly:
   `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev {{L1:C1-01}} --repo {{L1:C1-02}} --json`
   with the clean-clone path and `git -C <clone> rev-parse --show-toplevel` assertion.
3. Counter result: exit code, `predicate`, `findings[]` (empty is required for a true predicate),
   `control.refused` — placeholders, pasted raw JSON.
4. Receipt field checklist derived from `corpus/evidence/round-39/playwright-egress/receipt.json`
   (schema `tabi-pw-firefox-egress-receipt-v2`, top-level keys `schema, driver, measuredAt,
   playwrightVersion, fixture, runs, refused, binding, egressNonLoopback, survivors, browserVersion,
   userAgent, binary`). Per run: `refused:false`, `firstShotSha256` identical across runs,
   `owned.tree` nonempty and rooted at a child of the driver Node PID, `sampleCount ≥ 8`,
   `coverageMs ≥ 1000`, both socket surfaces (`ss`, `proc`) with zero non-loopback observations,
   `finalSweep` zero, `survivorPids` empty, `survivors:0`, `portClosed:true`,
   `browserVersion` bound from the live session. Values: `{{L1:C1-03}}` … `{{L1:C1-09}}`.
5. Do-nothing control (round-38 v1 receipt at `corpus/evidence/round-38/playwright-firefox/receipt.json`):
   refused with exactly five reasons observed at draft time —
   `schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2`,
   `run1 has no owned pid tree`, `run1 sampleCount undefined < 8`,
   `run2 has no owned pid tree`, `run2 sampleCount undefined < 8`
   (source: `measure/pre-integration-counters.txt`, `w1/RevC1Control/report.md`). Re-paste from the
   L1 run; do not copy this list unverified.
6. Live-run provenance: the round-39 receipt existence/commit, the driver hash, the two-run
   `firstShotSha256`, fixture port, `playwrightVersion`, `browserVersion`, and confirmation the
   fixture was loopback-only with cleanup (no survivors, port closed).
7. Capability-row input for `SCORECARD.md` **only if** exit 0 and predicate true: name → one-line
   what-it-can-do → evidence pointer → first-working round. If the predicate is not met, write
   "no capability row enters the table" and do not pre-claim (AXES.md: a capability without a
   passing demonstration in the round report does not enter).

---

## 5. `## Claim C2 — calibration: round-38 routed residuals 1–2`

State: axis `calibration`; kind `instrument-repair`; surface `c2-routed-defects-v2.mjs`,
`.ufo/waves/round-39/baseline/c2-sentence-mutant.json`,
`.ufo/waves/round-39/measure/{census-end.txt,numstat-at-<REV>.txt}`.

Required content:

1. Frozen predicate sentence, verbatim.
2. Counting command with `--repo <clean clone> --rev <REV> --json`.
3. D-by-D table (D1–D7), each row: requirement, observed value, pass/fail, evidence pointer.
   Placeholders `{{L1:C2-01}}` … `{{L1:C2-12}}`. Include D1's 34 seats and D2's `23 ok / 11 finding`
   recomputation, D3's six round-37 hashes each `ancestorOfRev`, D3 freeze landing stated at
   `34ed508c`, D4's `Captured-by` M3 row.
4. Both controls:
   - v1 counter on the mutated-claims fixture → observed exit 1, findings `d4-receipt`, `d6-file`,
     no sentence-identity check (`v1Control` block in the mutant receipt);
   - v2 counter on the same fixture → observed exit 1, finding `d7-sentence-mismatch`, sha pair
     `40740f82…` / `a2ba6ee…`, mutant tally token `23 ok 12 finding`.
   Re-run and paste; do not trust the stored `observedExit`.
5. D5 census: counting command and receipt must equal the counter's parse at REV; observed
   round-start counts `rows=144, tier A=128/B=7/C=9, status mined=120/queued=15/rejected=9`
   (`measure/census-start-counts.txt`). After counts: `{{L1:C2-05}}`.
6. D6 numstat protocol: receipt filename `numstat-at-<REV[:8]>.txt`, header naming baseline
   `3f42a5c7cc19…` and the full REV, data body byte-equal to
   `git diff --numstat 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35..<REV> -- . ':(exclude)<receipt path>'`
   with `^#` lines stripped. **Record the structural conflict observed at draft time**:
   `c2-routed-defects-v2.mjs:239-252` computes the required filename from `REV.slice(0,8)` and reads
   the blob at `REV`, while the receipt must name the full `REV`; committing the receipt changes
   `REV`, so the required filename and header cannot both be satisfied by the same commit. The
   committed probe `measure/c2-self-reference-probe.txt` (untracked at draft time) observed the
   counter exiting 1 before and after carrier `5c13c846…`. Do not amend the frozen counter after
   data; report the outcome honestly and route the defect to the next round's freeze.
7. D7 scope limit: the check reads `claims[1].predicate` by index and not `claims[1].id`
   (`c2-routed-defects-v2.mjs:241-250`; `w1/RevC2Counter.md` observed `sentenceMatch:true` with the
   id mutated to `NOT-C2`). The report must state the human id check separately.
8. If C2's predicate cannot be met, the report says so in this section and in `## Disposition`,
   names the exact failing D-items, and does not describe the claim as repaired.

---

## 6. `## Wave falsification credit`

- Seat count and role mix derived from the committed results, not the spec:
  `node -e 'const s=require("./.ufo/waves/round-39/w1-spec.json");const m={};for(const i of s.items)m[i.role]=(m[i.role]||0)+1;console.log(JSON.stringify(m))'`
  → observed draft-time spec mix: 64 items = 17 reviewer, 12 critic, 8 mutation-tester, 9 scout,
  7 executor, 6 scribe, 3 connector, 1 sentinel, 1 revenger. The report must use the **results**
  object for completed/nonempty/dead seats: `{{L1:W-01}}` … `{{L1:W-04}}`.
- Verdict tally, deduped per seat (prefer `<Seat>/report.md`, else `<Seat>.md`, last `VERDICT` line):

  ```sh
  for f in .ufo/waves/round-39/w1/*/report.md .ufo/waves/round-39/w1/*.md; do
    [ -f "$f" ] || continue
    printf '%s\t%s\n' "$(basename "$f" .md)" "$(grep -h '^VERDICT' "$f" | tail -1)"
  done | sort -u
  ```
  Placeholders `{{L1:W-05}}` (ok/finding/could-not-evaluate counts) and `{{L1:W-06}}` (names and
  reasons of seats with no verdict/partial output; they receive no verification credit).
- L1 planner seat and the connector-carried bounded cross-surface planning scan must be stated
  (`w1-spec.json` items, round-38 precedent).
- One sentence: dispatched seats are not an outside non-author spot-check and do not satisfy
  discernment by themselves (round-38 report, `LEARNING.md`).
- Seat evidence pointer: `.ufo/waves/round-39/w1/` (and `w1-results.json` once committed).

---

## 7. `## Landed changes`

One bullet per commit, format: `<40-hex> — <what landed>; LOG \`LOG.md\` round-39 entry
\`<anchor line/text>\`.`
Observed round-39 commits available for the ledger are the ten in §3.1 plus the w1 integration
commit and the report commit — placeholders `{{L1:L-01}}` … `{{L1:L-06}}`. Each bullet must name
its `LOG.md` tie; a commit with no LOG anchor is a conformance defect, not a silent omission.
Report commit lands last and cites the lane `HEAD` at filing (checked with
`git merge-base --is-ancestor <HEAD> <closure HEAD>`).

---

## 8. `## Before → after measurements`

Table with one row per claim, columns: claim/axis | baseline command + exit/predicate | integration
REV command + exit/predicate | delta | evidence path.

- Baseline rows are already committed and observed:
  C1 `measure/c1-before.txt` → `receipt-absent`, `predicate=not-met`, findings 1;
  C2 `measure/c2-before.txt` → `predicate=not-met`, findings `d4-receipt`, `d6-file` (34 seats,
  tally 23/11, census 144).
- Draft-time pre-integration observation, labelled as such:
  `measure/pre-integration-counters.txt` records REV `d3232d56…`, `C1_EXIT=0`, `C2_EXIT=1`.
  This is **not** the final measurement; the final row must be at the integration REV
  `{{L1:M-01}}`.
- Include the census before→after row here or cross-reference §11; do not duplicate numbers with
  different values.
- A "number" must be the counter's own field or receipt field; no derived estimates.

---

## 9. `## No-harm`

- Command battery and exits at the integration REV: offline gate self-tests, `check-freshness`,
  `check-selfassessment`, `check-release-pins`, `check-sources`, census validate. Use the same
  command set as the round-37/38 no-harm practice and record count/exit (`{{L1:N-01}}`).
- Any non-zero exit is compared to the round-start baseline `5bc56a8` before it is called a
  regression (`{{L1:N-02}}`).
- No pacman transaction occurred; record any tool install/upgrade with tool, version, channel,
  reason, else "No tools installed or upgraded" (operator rule 2026-10-19).

---

## 10. `## Cross-domain evidence`

Table: evidence | domain it belongs to | disposition (reported / not absorbed / routed).
Only list what seats or L1 actually observed. Candidate rows to verify, not to assert:
git-replace/replace-ref semantics (protocol/git ground), `proc_pid_net(5)` procfs semantics (Linux
kernel/procfs ground, not web-interaction craft), census tooling behaviour (protocol source-census
ground). `{{L1:X-01}}` … `{{L1:X-03}}`. Absorptions that would violate `PROVINCE.md:3-19` must be
named as refusals.

---

## 11. `## Sources & frontier`

Protocol-mandated. Required:

- Counting command, verbatim:
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
  plus the histogram command and receipt path `{{L1:S-01}}`.
- Before: observed `rows=144`, tier A=128/B=7/C=9, status mined=120/queued=15/rejected=9
  (`measure/census-start-counts.txt`), with the pre-existing W04 warning count `{{L1:S-02}}`.
- After: `{{L1:S-03}}` (rows, tiers, statuses, warning count, exit code) and the receipt
  `measure/census-end.txt` path.
- Rows added by tier: `{{L1:S-04}}`; rows touched old→new: `{{L1:S-05}}`; frontier rows advanced:
  S145 → `{{L1:S-06}}` (status `mined`, cited by the knowledge entry), and any existing-row status
  changes.
- Knowledge/index: `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` and its
  `corpus/README.md` coverage row — both must be committed before this section claims them
  (`{{L1:S-07}}`).
- Draft-time state to reconcile: `corpus/SOURCES.md` has an **uncommitted** S145 row in the working
  tree (`git status` → ` M corpus/SOURCES.md`), HEAD still parses 144 rows, the knowledge note is
  untracked, and `corpus/README.md` has no round-39 row. Do not report these as landed until the
  commit exists.

---

## 12. `## Assimilation and quarantine`

- Slice count with the specified `awk -F'|' …` extraction against the read-only absent-defect
  register; observed committed slice file
  `.ufo/waves/round-39/assimilation/quarantine-slice` (`38` rows by numstat `38 0`).
  Placeholder `{{L1:A-01}}` for the re-derived count and the hand-check sample.
- Collision/guard evidence: `assimilation/collisions`, `assimilation/indented-collisions`,
  `assimilation/guard/indented-registry.md` (two-space row parsing guard), `assimilation/reg-ids`
  (144), `assimilation/staged-ids` (148). State whether the slice was individually adjudicated and
  what was adopted — round-38's defect was claiming the slice without hand-checking; do not repeat
  it.
- `S145-open.txt` records the source opening (proc_pid_net(5), 11-word quote, scope limit); the
  row draft is untracked at draft time (`assimilation/S145-row-draft.md`).
- Directory check for `considerthese/` — state absent/present with command.

---

## 13. `## Axis, capability and scorecard disposition`

- Axes at round start, quoted from `claims.json.axesAtRoundStart`: adjacency 8 (lowest),
  operability 9, depth 9, coverage 9, freshness 9, calibration 9; `lowestAxis: adjacency`.
- Nudge: the frozen `stagnationNudge` says saturation 8 / window 3 is exceeded (no capability in
  rounds 36–38) and the lowest-axis obligation is waived; the round is a frontier/capability move.
  State the waiver and the claim types.
- Per-claim axis verdict (met / not met / unprovable) → axis score effect. The lane's recorded rule
  is no auto-bump: a score moves only on a measured move; if nothing is admitted, record
  "score held" (`{{L1:Z-01}}`).
- Capability table: row text only if C1's counter exits 0 with predicate true at the measured REV;
  otherwise "no capability row enters the table" and the stagnation window position
  (`{{L1:Z-02}}`).
- `SCORECARD.md` round-39 section and `LOG.md` round-39 entry are the record; both are absent at
  draft time (observed: `grep -c "Round 39" SCORECARD.md` → 0; same for `## Round 39` in `LOG.md`).
  The report must not cite them until committed.
- Round admission: admitted only if every claim verifies and no axis is harmed; otherwise state the
  honest-stop disposition and route the defects.

---

## 14. `## Trend verdicts`

Three-row table, evidence per row (round-38/37 shape):

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | `{{L1:T-01}}` | new frontier row/entry, capability admission or not |
| quality | `{{L1:T-02}}` | C1/C2 instrument results, any admitted fact found false/stale |
| discernment | `{{L1:T-03}}` | outside non-author admit/reject spot-check pointer, or "unchanged — none" |

Dispatched seats do not count as outside verification; if no non-author spot-check exists, the
discernment row says so.

---

## 15. `## SHONEN`

Heading exactly `SHONEN`. Four lines, one per box, copied from `SHONEN.md` (verbatim box text) and
reassessed this round with a pointer; `[~]` means asserted-by-author, not skipped. The boxes:

1. `SKILL.md contains real decision tables, error patterns, checklists, cited sources`
2. `At least one end-to-end domain task executed and logged in LOG.md`
3. `Instructions executable by an agent without oral context`
4. `No cross-domain bleed (PROVINCE.md still accurate)`

Markers and pointers are placeholders `{{L1:Q-01}}` … `{{L1:Q-04}}`. Round-38 used one line per
box; keep that shape. No box may be marked `[x]` on a dispatched seat's own say-so.

---

## 16. `## Stale-lane`

- Inventory missions open longer than two driver ticks, aged from the launch timestamp (not the
  tick counter), each graded `progressing` / `silent` / `progressing-weak` with the evidence
  (lane-authored commit or files modified under the repo after launch).
- This lane is respawn-per-round; if no other mission is open, write: "Respawn-per-round driver; no
  other mission of this lane is open." Otherwise `{{L1:K-01}}`.

---

## 17. `## Round shape, tools, open questions, and misroot sweep`

- Wave shape: one v2 wave, 64 seats, role mix (from §6), dead 0/`{{L1:W-04}}`, no residual call,
  L1 planner seat, connector scan.
- Tools: none planned. If any install/upgrade happened, record tool, version, channel, reason, and
  that pacman was not used (pacman paused host-wide).
- L0 questions: `{{L1:O-01}}` (none → say none).
- Misroot sweep: `git -C /home/vgpnk/Projects/shokunin status --porcelain` and a find for stray
  seat artifacts at the fleet root; paste the observed output `{{L1:O-02}}`.
- If any required receipt could not be produced (e.g. D6's circular receipt), name it here as a
  frozen-instrument limit with the probe path, in addition to the claim section.

---

## 18. `## Disposition`

Final claim table: claim | axis | kind | predicate outcome at REV | exact failing findings |
disposition text. Then one line each:

- round admission: `{{L1:R-05}}`;
- capability row: `{{L1:R-06}}`;
- routed defects for the next round (numbered, with evidence pointer): `{{L1:R-07}}`;
- if the harness applies it, the trailer `VERDICT {{L1:R-08}} — {{L1:R-09}}` as the last line.

---

## 19. Placeholder ledger

| ID | Placeholder | Source of truth | Derivation | Acceptance rule |
|---|---|---|---|---|
| C1-01 | `{{L1:C1-01}}` | integration REV | `git rev-parse HEAD` in lane at measurement | 40-hex, ancestor of closure HEAD |
| C1-02 | `{{L1:C1-02}}` | clean clone path | clone + `rev-parse --show-toplevel` assertion | clone toplevel == clone dir |
| C1-03 | `{{L1:C1-03}}` | C1 counter JSON | paste `receipt` block | schema v2, runs=2 |
| C1-04 | `{{L1:C1-04}}` | receipt `runs[*].firstShotSha256` | paste both | identical across runs, 64-hex |
| C1-05 | `{{L1:C1-05}}` | receipt `runs[*].owned` | paste root/child relation | nonempty tree, root child of driver node |
| C1-06 | `{{L1:C1-06}}` | `sampleCount`,`coverageMs` | paste | ≥8 and ≥1000 per run |
| C1-07 | `{{L1:C1-07}}` | `sockets.ss`/`sockets.proc`/`finalSweep` | paste counts | 0 non-loopback on both, final sweep 0 |
| C1-08 | `{{L1:C1-08}}` | `survivors`,`portClosed`,`browserVersion` | paste | 0 survivors, port closed, version non-null |
| C1-09 | `{{L1:C1-09}}` | `control.refusalReasons` | paste | v1 refused, reasons listed |
| C2-01 | `{{L1:C2-01}}` | C2 counter JSON | paste exit + `predicate` + `findings` | exit 0 ⇒ findings empty |
| C2-02 | `{{L1:C2-02}}` | `d1` block | paste | stale+correction+34+w2 absent |
| C2-03 | `{{L1:C2-03}}` | `d2` block | paste stated/recomputed | 23 ok / 11 finding / 34 reports |
| C2-04 | `{{L1:C2-04}}` | `d3` block | paste six hashes' present/ancestor | all true, landing 34ed508c |
| C2-05 | `{{L1:C2-05}}` | `measure/census-end.txt` + `d5` | paste counts | receipt == counter parse at REV |
| C2-06 | `{{L1:C2-06}}` | `measure/numstat-at-<REV8>.txt` + `d6` | paste header/body verdict | names baseline+REV, body byte-equal |
| C2-07 | `{{L1:C2-07}}` | baseline mutant receipt | paste exit/sha pair/sentence token | exit≠0, sha pair differs, sentence differs |
| C2-08 | `{{L1:C2-08}}` | v1 control block | paste exit/findings | v1 misses sentence identity |
| C2-09 | `{{L1:C2-09}}` | `d7` | paste `sentenceMatch` + human id check | claims[1].id == C2 and sentence equal |
| C2-10 | `{{L1:C2-10}}` | D6 code/probe | paste `measure/c2-self-reference-probe.txt` | conflict stated verbatim |
| C2-11 | `{{L1:C2-11}}` | census-start receipt | paste before counts | 144 / A128 B7 C9 / 120-15-9 |
| C2-12 | `{{L1:C2-12}}` | claim outcome | prose | no overclaim if predicate false |
| W-01 | `{{L1:W-01}}` | `w1-results.json` | `seats`, result count | 64 |
| W-02 | `{{L1:W-02}}` | `w1-spec.json` | role histogram command | sums to 64 |
| W-03 | `{{L1:W-03}}` | `w1-results.json` | nonempty outputs | equals seats |
| W-04 | `{{L1:W-04}}` | `w1-results.json` | dead/partial seats | names listed |
| W-05 | `{{L1:W-05}}` | w1 reports | dedupe command §6 | ok+finding+cne == reports |
| W-06 | `{{L1:W-06}}` | w1 evidence | list | no silent exclusion |
| M-01 | `{{L1:M-01}}` | integration REV | `git rev-parse HEAD` | 40-hex |
| N-01 | `{{L1:N-01}}` | gate battery | paste exits | counts match commands run |
| N-02 | `{{L1:N-02}}` | baseline comparison | run same at 5bc56a8 | regressions named |
| X-01..03 | `{{L1:X-01}}`… | seat reports | table rows | domain named, not absorbed |
| S-01..07 | `{{L1:S-01}}`… | census + corpus | commands §11 | before/after arithmetic checks |
| A-01 | `{{L1:A-01}}` | assimilation dir | awk extraction | count + hand-check state |
| Z-01 | `{{L1:Z-01}}` | scorecard | paste axis rows | no auto-bump |
| Z-02 | `{{L1:Z-02}}` | scorecard capabilities | paste | row only on passing demo |
| T-01..03 | `{{L1:T-01}}`… | trends | table | evidence pointer per row |
| Q-01..04 | `{{L1:Q-01}}`… | SHONEN.md | four lines | one per box |
| K-01 | `{{L1:K-01}}` | missions | list/grades | age from launch ts |
| O-01..02 | `{{L1:O-01}}`… | L0/misroot | paste | observed only |
| L-01..06 | `{{L1:L-01}}`… | git log | commit + LOG anchor | every commit has an anchor |
| R-05..09 | `{{L1:R-05}}`… | disposition | prose/table | matches claim sections |

---

## 20. Pre-flight gates (all must pass before the report is filed)

1. **G1** Lane `HEAD` at filing == remote `master`; `jj-lane.sh state`/`git status` clean.
2. **G2** Clean clone under `/fast/scratch/hyaku/tabi-r39/<Seat>/`, toplevel asserted, detached at
   the measured REV.
3. **G3** Digest table (§3.2) matches `claims.json.frozenDigests`; counters/driver unchanged since
   the freeze commit.
4. **G4** Both predicate sentences byte-identical between claims and counter constants.
5. **G5** C1 counter run at the integration REV; exit code and predicate pasted; no claim text
   stronger than the exit code.
6. **G6** C1 do-nothing control refused; the receipt's own `refused` is false.
7. **G7** C1 receipt field checklist complete (owned tree, samples, coverage, dual surface, sweep,
   survivors, port, version).
8. **G8** C2 D1–D7 each pasted with pass/fail; any structural impossibility (D6) stated.
9. **G9** C2 both controls re-run from their receipts; stored exit not trusted.
10. **G10** Census receipt exists at REV and equals the counter parse; counts pasted.
11. **G11** Numstat receipt protocol attempted; if unsatisfiable, the probe and reasoning are
    reported and the claim is not called met.
12. **G12** `w1-results.json` committed; seat count 64; deduped verdict tally; dead/partial seats
    named.
13. **G13** `corpus/lessons/round-39.md` exists with `## Mistakes` (class · evidence · captured-by ·
    fix) or the sweep that found none, and at least one claim is sourced to an `S###` row.
14. **G14** S145 row + knowledge note + README coverage row committed (or `SOURCES: unchanged —`
    with the reason).
15. **G15** `LOG.md` round-39 entry and `SCORECARD.md` round-39 section committed; every commit
    bullet tied to a LOG anchor.
16. **G16** No-harm battery run at the integration REV with baseline comparison.
17. **G17** SHONEN heading present with exactly four `[~]`/`[ ]` lines and pointers.
18. **G18** Stale-lane inventory written; misroot sweep pasted.
19. **G19** Report lands last; cited `HEAD` is an ancestor of closure `HEAD`; report commit carries
    the lane identity.

---

## 21. Draft-time observations L1 must reconcile (not verdicts)

Observed at lane tip `1ace2fd` on 2026-10-27, with the commands named. These are conflicts and
gaps, not adjudications; L1 re-derives each at the integration REV and states the outcome.

| # | Observation | Command/evidence |
|---|---|---|
| O1 | claims `frozenAt` pointer vs bytes: `9c09ebb` bytes sha `40740f82…`, `dc695dc`/HEAD bytes sha `ed88855…`, diff is the `frozenAt` line only; mutant receipt binds `40740f82…` | `git show <rev>:claims.json \| sha256sum`; `git diff --stat 9c09ebb..HEAD -- claims.json` |
| O2 | C2 D6 self-reference: filename `numstat-at-<REV8>.txt` read at REV, header must name full REV → unsatisfiable in one commit | counter `:239-252`; `measure/c2-self-reference-probe.txt` (exit 1 before/after carrier `5c13c846…`) |
| O3 | D7 is index-bound (`claims[1]`), not id-bound; id mutation passes | `w1/RevC2Counter.md` observed `sentenceMatch:true` with id `NOT-C2` |
| O4 | Wave in flight at draft: 64 spec items; at 2026-10-27T17:39Z, 59 `.md` + 31 `report.md` + 54 `VERDICT` lines (9 ok, 39 finding, 2 `finding:` variants, 4 could-not-evaluate); by 17:42Z the same counts were 98 / 47 / 87. Moving target — re-derive at integration; `w1-results.json` absent at draft | `find`/`grep` counts in §6 |
| O5 | `measure/census-end.txt` and `measure/numstat-at-*.txt` absent; `measure/c2-self-reference-probe.txt` untracked | `ls measure/`; `git status --porcelain` |
| O6 | S145 row uncommitted (` M corpus/SOURCES.md`); knowledge note untracked; no README row; HEAD parses 144 rows | `git status --porcelain corpus/`; `grep -c S145 corpus/SOURCES.md` → 0 at HEAD |
| O7 | No `LOG.md` round-39 entry and no `SCORECARD.md` round-39 section | `grep -c "Round 39"` → 0 each |
| O8 | Pre-integration counters: C1 exit 0, C2 exit 1 at `d3232d56` (not the final measurement) | `measure/pre-integration-counters.txt` |
| O9 | `corpus/lessons/round-39.md` absent | `ls corpus/lessons/` |
| O10 | `corpus/README.md` has no round-39 coverage row | `grep -n "round-39" corpus/README.md` → none |

---

## 22. Copy-paste skeleton (placeholders only)

```markdown
# tabi — round 39 report

Lane repo HEAD at filing: `{{L1:M-01}}` (branch `master`; `git ls-remote origin refs/heads/master`
matches). Round-start baseline: `5bc56a81d196caeb8d24551928b883802697aabb`. Freeze commit(s):
see `## Freeze and instrument integrity`. Claims: coverage capability (C1) and calibration (C2);
stagnation nudge waived the lowest-axis obligation per the frozen claims record.

## Work performed

{{L1:W-01}} … (claims, work items with evidence pointers, wave dispatch, planner seat)

## Freeze and instrument integrity

{{L1:C2-04}} … (digest table, predicate identity, immutability, claims-pointer note)

## Claim C1 — coverage capability: session-bound Playwright Firefox egress

{{L1:C1-01}} … {{L1:C1-09}}

## Claim C2 — calibration: round-38 routed residuals 1–2

{{L1:C2-01}} … {{L1:C2-12}}

## Wave falsification credit

{{L1:W-02}} … {{L1:W-06}}

## Landed changes

{{L1:L-01}} … {{L1:L-06}}

## Before → after measurements

{{L1:M-01}} …

## No-harm

{{L1:N-01}} {{L1:N-02}}

## Cross-domain evidence

{{L1:X-01}} … {{L1:X-03}}

## Sources & frontier

{{L1:S-01}} … {{L1:S-07}}

## Assimilation and quarantine

{{L1:A-01}}

## Axis, capability and scorecard disposition

{{L1:Z-01}} {{L1:Z-02}}

## Trend verdicts

{{L1:T-01}} … {{L1:T-03}}

## SHONEN

{{L1:Q-01}} … {{L1:Q-04}}

## Stale-lane

{{L1:K-01}}

## Round shape, tools, open questions, and misroot sweep

{{L1:O-01}} {{L1:O-02}}

## Disposition

{{L1:R-05}} … {{L1:R-07}}
```

---

## 23. Anti-fabrication rules for the integrator

- Do not write a predicate result that is not the counter's exit code + JSON at the measured REV.
- Do not report the spec's 64 seats as completed seats; derive completion from the results object.
- Do not report the working-tree S145 row / knowledge note / README row as landed before their
  commit exists.
- Do not copy the draft's pre-integration exits (`C1=0`, `C2=1` at `d3232d56`) as final results.
- Do not call the round a capability move if C1's counter does not exit 0 with predicate true.
- Do not treat the frozen D4/D7 checks as stronger than they are (O1–O3).
- Do not amend a frozen counter, claim, or receipt to make a predicate pass after data.
- Do not cite a hash that is not an ancestor of the closure `HEAD`.

---

## 24. What this draft did and did not do

Did: read the frozen claims, both frozen counters (headers and D1–D7/C1 control blocks), the driver
path, `PROTOCOL.md`/`AXES.md`/`MISSION.md`/`SHONEN.md`, the round-37/38 filed reports, the
round-39 measure/assimilation evidence, and the lane's git history; re-derived the digest table,
predicate byte-identity, ancestry, the claims-file pointer diff, and the draft-time seat/file
counts. No file outside `.ufo/waves/round-39/w1/ScribeReport/` was written.

Did not: run either counter at a final REV, run the browser, run the census, edit any lane file,
commit, or adjudicate any claim. No scratch dir was created (no clone or fixture was needed), so
nothing under `/fast/scratch/hyaku/tabi-r39/ScribeReport/` remains. No tool installed or upgraded;
no pacman transaction.

VERDICT ok — outline delivered with exact headings, 40+ placeholders and gates; no claim result, commit ledger entry, wave tally or census output asserted beyond observed draft-state facts.
