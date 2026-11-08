---
author: hyaku closure (non-author integrator, @m_zfl)
round: 90
lane: tabi
measured_at: 2026-11-08T15:25:18Z
lane_head: 3e6cf40f980ea011a400eec7ce1c5db58773141a
base: a9f1da0828856ccd4987d1ee07df857fad044b15
---

# tabi round 90 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this
file. Nothing below amends a lane-authored file; defects are routed for the lane's next round.

## 1. Step-1 conformance

- Report path `.ufo/reports/round-90/tabi.md` correct. `git log --format='%an %H %ai %ci' -- .ufo/reports/round-90/tabi.md` →
  `tabi-shokunin <tabi@shokunin.local> e0b7ecf8a765b7f4085dacd5e843d85eaceeec99` (author
  `2026-11-08 12:10:25 -0300`, committer `12:12:00`) then
  `e2c976b3dceaa6a1c5fa37fa1fa8ac189cc1728b` (author `12:12:09`, committer `12:12:37`). Both
  commits are pathspec-limited to the report (`git show --stat` → one file each: `+171` then
  `+5/−1`). Lane identity holds.
- `## SHONEN` present with exactly four `[~]` lines, one per box, each carrying an evidence
  pointer (the r90 instruments/receipt, the executor seats, the connector scan). No `[x]` was
  written by this reviewer and none appears in the lane file.
- Cited commits: `f2b69440c7c7f003b0f5d694eba4c5f985684141` (lane tip when the report was
  written), `3e6cf40f980ea011a400eec7ce1c5db58773141a` (lesson commit, the actual tip) and base
  `a9f1da0828856ccd4987d1ee07df857fad044b15` — `git merge-base --is-ancestor <hash>
  refs/heads/master` holds for all three; `git cat-file -t` → `commit` for all three.
- Lane state: `scripts/hyaku/jj-lane.sh state /home/vgpnk/Projects/shokunin/tabi-shokunin` →
  `ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty;
  `git ls-remote origin refs/heads/master` → `3e6cf40f980ea011a400eec7ce1c5db58773141a`. No
  uncommitted round work; no un-pushed lane commit.
- Prompt `.ufo/prompts/tabi-round-90.md` (committed `1c9dc16f5b26da26a8f6ffa26cd34def8f3da87e`,
  tabi identity) carries the template contract: sections 1, 2, 2b, 3, 4, 5 are present with the
  rendered placeholders (claims 1–3/distinct axes/lowest axis; the frontier step; the report
  path, `SHONEN` heading and commit-hash citation; commit-then-push, push scope, L0 side
  channel), plus the hyaku addendum §6. `MISSION.md` §L2 concurrency requires ≥8 seats in one
  batched call; the wave is one batched `taskCall` of 13 tasks (`w1-dispatch.json`
  `taskCall.tasks` = 13, `counts.spawn` = 13), and the L1 holds the planner seat per the
  addendum's 2026-10-19 ruling (the validator rejects a `planner` seat).
- Marker test: the report names real committed work, evidence pointers, Sources & frontier,
  trend verdicts and `SHONEN`; it is a real report, not a marker. Status `ok`.

Status-neutral defects found (none changes the status):

1. **Report author date.** The final report commit `e2c976b3` has author `12:12:09` and committer
   `12:12:37`. The author date is after the cited lane tip `f2b69440` (committer `12:11:41`) but
   14 s before the cited lesson commit `3e6cf40f` (committer `12:12:23`); the committer time is
   after both, so the landing order is provable. The report discloses the earlier first-commit
   author date (`12:10:25`, 76 s before `f2b69440`). The r89 correction item 6 says "Round 90's
   report commit uses a clean author date (the committer time)" — that parenthetical is inexact
   (author `12:12:09` ≠ committer `12:12:37`). Routed.
2. **Pre-file digest arithmetic.** Report line 141 says "Four rows are `falsifies-wording`" and
   lists five; the TSV has five (`C1` Review2/Critic/Mut1; `C2` Critic/Sentinel). Routed.
3. **Dangling pointer.** Report line 11 cites `plans/round-90.md` §Re-freeze history for D3–D6;
   that section holds D1–D2 only — D3–D6 live under §Wave corrections. Routed.
4. **Landed-changes hashes.** The "Landed changes" bullets name files and "LOG round-90 entry" but
   not the carrying commit hash per bullet; the header names `f2b69440` and `3e6cf40f`, so the
   pointer resolves. Minor, not routed separately.
5. **Attack-seat roster wording.** The round shape says "5 attack seats of 13 (38 %)" (line 43);
   the pre-file paragraph says "all six attack seats (… Connector)" (line 141). The pre-file
   script's `attack_seats=6` includes the connector; the protocol's ≥25 % list is
   reviewer/critic/mutation-tester/labrat. Wording only; the 4 protocol attack seats (2
   reviewers + critic + mutation-tester) are 31 %, so the floor holds either way.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

Command: `python3 /home/vgpnk/Projects/shokunin/scripts/hyaku/prefile-falsification.py --lane tabi --round 90`
Observed: `PREFILE-FALSIFICATION: pass claims=2 rows=14 attack_seats=6 findings=0` (exit 0) —
matches the report's line and digest.

Coverage: both claims (C1, C2) × the six seats the script counts (Review1, Review2, Critic, Mut1,
Sentinel, Connector), plus the `Exec4` (C1) and `Simplifier` (C2) rows = 14. All five
`falsifies-wording` rows name a narrowing: C1/Review2 → `plans/round-90.md` §Wave corrections +
`SCORECARD.md` §Round 90 narrowing (6); C1/Critic → §Wave corrections; C1/Mut1 → §Wave
corrections (kill-power note); C2/Critic → §Wave corrections (D4 gate repairs); C2/Sentinel →
§Re-freeze history D6/§Wave corrections.

Adjudication of the falsifying rows:

- **C1/Review2** (F1/F2/F4c/F7 accepted) — real and reconciled. I re-opened
  `w1/R90Review2.md` §F1 and the artifact `R90Review2-f1-forged-domread-copied-call.json`:
  `verdict clean`, `checkCount 107`, `findings []`. The binding is syntactic; the lane reports C1
  NOT VERIFIED and records the narrowings. Agree.
- **C1/Critic** — real and reconciled. The fixture's `__inputs` takes no parameter; the driver's
  only substantive change is one argument; `checkCount 107` in both generations; C1 is reported
  NOT VERIFIED. Agree.
- **C1/Mut1** — real as a declared-scope limitation: the frozen 76-mutant list is list-relative;
  the independent sweep's survivors are recorded as a narrowing and no battery case was added
  after scoring. Agree (narrowing on record, not a claim falsification).
- **C2/Critic** — real and reconciled: four false-greens in the first gate were repaired at D4 and
  the counted set is narrowed on record (five §7 defects + three self-checks). Agree.
- **C2/Sentinel** — real and reconciled: F8/F9 remain source-text statements (declared
  narrowings), F10 metadata/F12 red artifact/F13 D5-runner crash were repaired at D4–D6. Agree.

No failing row is unreconciled; the ledger passes. I did not edit the ledger.

## 3. Per-claim re-checks (plain measurement on committed bytes at `3e6cf40f`; no sibling gate executed)

### C1 — coverage (9), capability generation r90 — NOT VERIFIED (honest stop)

Evidence re-derived by me:

- Driver delta: `diff <(git show a9f1da08:scripts/chrome-cdp-showpicker-round89.mjs)
  <(git show 3e6cf40f:scripts/chrome-cdp-showpicker-round90.mjs) | grep -c '^[<>]'` → **64**;
  after the r89→r90 schema/nonce/upload-filename strings, the only behavioural change is
  `window.__inputs()` → `window.__inputs(true)` at line 597.
- Fixture signature: `git show a9f1da08:scripts/chrome-cdp-filechooser-round78.mjs:196` →
  `window.__inputs = function () { ... }` — no parameter; the argument is discarded. The r90
  driver extracts this template (`/*CHOOSER-FIXTURE-BEGIN*/`) byte-identically.
- Check set: `.ufo/waves/round-89/scored/counter-a.json` and
  `.ufo/waves/round-90/scored/counter-a.json` both `verdict clean`, `checkCount 107`,
  `findings []`.
- Receipt `corpus/evidence/round90/chromium-showpicker/receipt.json`: 41 legs, `failures []`;
  the four `sp89-accept-domread-*` legs carry `window.__inputs(true)` at send-log index 13,
  immediately after `window.__state()` at index 12; none of the 37 non-domread legs carries it.
  The four `domRead` arrays are unchanged from r89 in content.
- Gate verdicts evidence-verified (not executed by me): `counter-a.json` clean/107;
  `battery-a.json` 226 cases/0 failed/coverage 107/107; `killpower-a.json` 76 mutants/76
  killed/0 survived/0 crashed/0 unapplied; `selftest.json` clean, 12 cases, 12/12 (D6);
  `pins-match-freeze` → `[]`.

Verdict: the declared `coverage` axis does not move; the lane's NOT VERIFIED is correct. Two
non-author seats (R90Critic F1.3, R90Review2 §6) measured the same thing, and the lane did not
re-scope the claim.

### C2 — calibration (9), the r89 routed defects — VERIFIED as narrowed

- `scored/drift-before.json`: 8 claims, **7 mismatches**, failed
  `[r89-claim-sweep, r89-narrowing-pointers, r89-census-attribution, r89-leak-enforcement,
  r89-revision-naming, gate-selftest, quality161-sweep]` (base `a9f1da08` worktree;
  `scorecard-tallies` was green at base).
- `scored/drift-a.json`: 8 claims, **0 mismatches**, `results` all `ok`.
- I re-derived the eight statement predicates over the committed bytes at `3e6cf40f`:
  `1 claim-sweep amendment=1 named=true; 2 narrowing-pointers corrected=2 pointsReal=true live=[]
  ledgerLive=0; 3 census rows=224 censusOk=true says224=true r88=true quote=true words=17;
  4 leak ok=true pin=bd33d158f3ae named=true; 5 revision=true; 6 gate-selftest wired=true
  all-four-selftests=true; 7 quality161 cites=true sweeps=true; 8 tallies bad=[] tens=2
  sanctioned=2 stray=[]`. All eight green.
- `.ufo/waves/round-90/scored/selftest.json`: `clean true`, `cases 12`, `failed []`;
  `gate-selftest` detail: all four instruments' `--selftest` exit 0.
- `scored/leak-witness.json`: stock `exit 0` / `fixtureAbsent true` / `decoyPresent true`;
  deadBranch `exit 1` / `fixtureAbsent false`; `instrumentPins[scripts/check-record-drift-round90.mjs]`
  = `bd33d158f3ae198d5587bf8469cb15460692100662277e940a871f94ca732ee2` = the freeze pin.
- Revision: the after artifact was produced at D4; my re-derivation at the committed tip
  (`3e6cf40f`) is green, so the claim holds at the committed revision. The after-run's own
  revision is not named in `drift-a.json`; the committed-tip re-derivation is the stronger
  evidence (see routed defect 5).

Verdict: C2 verifies on its predicate with the counted set narrowed on record: five of the six
§7 defects plus three self-checks; §7 defect 6 (report author date) is a record statement, not a
repo-state counter. Calibration `improved`.

## 4. No-harm check

`git diff a9f1da08 3e6cf40f -- SCORECARD.md` → additive r90 section (`+41/−1`; the one deletion
is the r89 `§Narrowings` line annotated in place) and no axis-score row changed. `git diff
--numstat -- SHONEN.md PROVINCE.md` → empty. Overall `git diff --stat` → 265 files, `+251318`,
`−12`; the other deletions are the r89 ledger/lesson/claims corrections
(`claim-falsification.tsv` 3, `claims.json` 6, `corpus/QUALITY.md` 1, `corpus/lessons/round-89.md`
1). No owned axis is downgraded; no lane-owned file outside the round's declared repairs was
deleted.

## 5. Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| coverage | unchanged | C1 NOT VERIFIED: 64-line driver diff, one substantive argument; fixture `__inputs` takes no parameter; `checkCount 107` at r89 and r90; 4/4 domread legs carry the call, 0/37 other legs; the moved surface is a checker obligation (R90Critic F1.3, R90Review2 §6) |
| calibration | improved | C2 verified: 8 statements re-derived green at `3e6cf40f` (before 7 mismatches, after 0), selftest 12/12, leak witness pin-matched; five counted r89 defects repaired |
| depth | unchanged | no new decision table beyond the r90 knowledge note; the held showpicker surface is unchanged |
| operability | unchanged | instruments re-run green (107 / 226 / 76 / 12); no new runnable surface beyond the counter obligation |
| freshness | unchanged | S224/S223/S219 re-opened live (HTTP 200, staged byte-identical), but no row old→new and no stale entry re-verified as a claimed axis move |
| adjacency | unchanged | R90Connector's 21-lane scan found zero contested ground on `__inputs(true)`/settle-eval/`plan-calls`; nothing absorbed |

## 6. Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| Knowledge entry `corpus/knowledge/chromium-showpicker-runtime-round-90.md` | admit | the committed entry (provenance trio), the r90 receipt, and live `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html` (§2.3.8 dfn, HTTP 200, 121,595 B, sha256 `2e9e2cbbe1ed…`) | agree | The entry is sourced (S224/S223/S219/S216 + receipt), the measured mechanism is verified (4 domread legs carry the call; 37 do not), and the limits honestly state the fixture convention. Its item 2 misattributes the non-domread refusal to `plan-calls`; that is a routed record defect (defect 1), not an admission-bar failure — the central law and limits are true |
| "The settle call proves Chromium parsed the attribute" | reject | `scripts/chrome-cdp-filechooser-round78.mjs:196` (`window.__inputs = function ()`), `scripts/chrome-cdp-showpicker-round90.mjs:597` (`__inputs(true)`), live S224 §2.3.8 | agree | The fixture's function takes no parameter, so the argument is discarded and the payload is identical; the token lists are unchanged; the dialog remains unmeasured. The reject's flip condition (a dialog-observable or source-side leg) is correctly named |
| "`plan-calls` makes the domread data unforgeable" | reject | `w1/R90Review2.md` §F1/§F2/§F7 and `R90Review2-f1-forged-domread-copied-call.json` (`verdict clean`, `checkCount 107`) | agree | A forged `domRead` plus a copied call record, another leg's `domRead`, an extra plain `__inputs()` before the anchor, and a reshaped state anchor all score clean; the reject is correct |
| `corpus/SOURCES.md` S224 (re-opened, not a new row) | row check | live `common-microsyntaxes.html` (same bytes) and the committed row | agree | The `§2.3.8 id=set-of-comma-separated-tokens` anchor resolves; the r90 correction block's 17-word quote is verbatim and ≤25 words; no new row was written this round, so the "newly written row" sample is n/a and the re-opened row's `teaches`/`anchor` remain valid |

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0
(`tabi ok`, W04 duplicate-URL warnings only). Manual row count: `grep -cE
'^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → **224** at base and at tip. Live
re-fetch of both WHATWG pages: HTTP 200, 687,515 B / 121,595 B, sha256
`b0202de1…`/`2e9e2cbb…` = the staged `.ufo/waves/round-90/sources/` files byte-for-byte.

## 7. Trend verdicts

- **expansion: unchanged** — knowledge 102 → 103 (`git ls-tree -r --name-only <rev>
  corpus/knowledge/ | wc -l`), but the new note documents a checker obligation over the same 41
  legs and the same coverage ground; `git diff a9f1da08 3e6cf40f -- corpus/SOURCES.md` is a
  single search-log line, 0 new `S###` rows (224 → 224). No frontier ground is newly held.
- **quality: improved** — the five counted r89 routed record defects re-derive 7 → 0 at the
  committed tip; the gate's four false-greens were found by an attack seat and closed before
  scoring (D4); the instruments re-run green (107 / 226 / 76 / 12); the r90 knowledge note and
  QUALITY 163 were added, and no admitted entry fails its `recheck:` command (the counter exits
  0). Caveat: three unswept copies of the C1 attribution and a 225/226 battery-count drift are
  routed (defects 1–2); they are record defects, not a failing re-check.
- **discernment: improved** — the round's own wave falsified its declared axis and the lane
  reported C1 NOT VERIFIED rather than re-scoping it; the four accepted forgeries (F1/F2/F4c/F7)
  are recorded as narrowings with their reproduction; the pre-file ledger passes; the outside
  spot-check agrees with the Gate's admit and both rejects.

## 8. Routed defects for tabi r91 (durable queue)

1. **Sweep the C1 attribution narrowing into every distilled copy.** `corpus/knowledge/chromium-showpicker-runtime-round-90.md:22`,
   `LOG.md:4079` and `corpus/QUALITY.md:1060` (criterion 163, added this round) say `plan-calls`
   "forbids it elsewhere"; the counter enforces the non-domread refusal in
   `send-log-allowlist` (`scripts/check-showpicker-round90.mjs:574`), while `plan-calls`
   (`:638`) only requires the call on domread legs and checks the settle order. QUALITY 161's
   sweep rule binds the knowledge note and ledger cells; mark or rewrite each copy with the
   correct check id (the SCORECARD capability row and the report already do).
2. **Sweep the battery-case count.** `LOG.md:4086` and `plans/round-90.md:103` say **225**
   cases; `scored/battery-a.json`, `corpus/lessons/round-90.md:53` and the report say **226**.
   Record the D2/final delta or correct the numeral; the C2 eight-statement set does not catch it.
3. **Append-only discipline in the r89 records.** `corpus/lessons/round-89.md:75` (the
   `frozen-control-numeral` row) was extended in place while the appended block says "the
   round-89 records above are not rewritten"; `corpus/QUALITY.md:1054` (criterion 161) was
   rewritten in place (green-state citation) rather than superseded by a new row. Append named
   corrections for both; no further in-place edits. (The `SCORECARD.md:4292` in-place annotation
   is disclosed and not corpus; the `claims.json` reserialization is escape-only churn, but it
   still rewrites frozen lines.)
4. **Pre-file digest arithmetic.** The report says "Four rows are `falsifies-wording`" and lists
   five; correct the digest/erratum (the ledger itself is right).
5. **Name the C2 after-run revision.** `scored/drift-a.json` does not state the revision it was
   measured at (the D4 worktree); the committed-tip re-derivation holds, but the record should
   name the revision as r89's defect 5 required, and the next after-run should be at the
   committed tree.
6. **Report author date.** `e2c976b3`'s author date (`12:12:09`) precedes the cited lesson commit
   `3e6cf40f` (`12:12:23`); the committer time (`12:12:37`) is after both. Write the report only
   after the last lane commit and let the helper stamp author = committer; correct r89 correction
   item 6's "(the committer time)" wording, which is inexact (author `12:12:09` ≠ committer
   `12:12:37`).
7. **Dangling pointer.** The report's "Instrument freeze" cites `plans/round-90.md` §Re-freeze
   history for D3–D6; that section holds D1–D2 only. Point D3–D6 at §Wave corrections (the
   ledger's C2/Sentinel row already names both).
8. **Mark the original S224 Gate quote.** The r89 lesson's Gate quote remains 31 words above the
   correction block; the correction block's 17-word quote is the counted one. Append a sentence
   naming the original's over-length and the replacement; do not rewrite the Gate.

## 9. Verdict

`status=ok admitted=false` — C2 verifies on its narrowed predicate; C1 is an honest NOT VERIFIED
on its declared `coverage` axis (the moved surface is a checker obligation, not a domain
surface); no owned axis is harmed. The round is an honest stop, reported for the operator, not a
marker. The defects above are record/conformance items and are routed to r91; none falsifies a
measured state. `SHONEN` boxes: all four look checkable by a non-author from committed artifacts
(the SKILL r90 registry + instruments; the receipt and seat reports; the executor seats ran the
frozen commands from their prompts; the connector scan), so promotion remains operator-owned.
