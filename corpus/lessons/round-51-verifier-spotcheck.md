# tabi round 51 — non-author verifier spotcheck

author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

Closed 2026-11-02T05:4xZ against lane HEAD `509540c5023c045e0b041bbf3087dc0253ae7dd0`
(branch `master`, pushed), baseline `c54749228e3b71f3d3c2d1f6a8167d89c2233a8e`. I did not
author this round; I verified, spot-checked, and closed it. Index-free git only, no mutating
command anywhere. All evidence paths below are at HEAD unless a rev is named.

## 1. Step-1 conformance — PASS

| Check | Command | Observed |
|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an <%ae> %H %cI' -1 -- .ufo/reports/round-51/tabi.md` | `tabi-shokunin <tabi@shokunin.local> f497d5aa48a894a9f36357fa5cc6b089d286c70d 2026-11-01T20:45:53-08:00` — matches the watchdog complete line instant |
| SHONEN heading | read `.ufo/reports/round-51/tabi.md` | `## SHONEN` present, one `[~]` line per box (4 boxes, resolvable pointers), closing line `SHONEN: no [x] written` |
| Cited commits exist + ancestor | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> refs/heads/master` for all 9 cited hashes (1ecb86bf, 33967b10, 08cc4b72, b3abd0ba, 3ed86e6a, 8e2fe015, f04a837b, f74325bb, 509540c5) | all 9: `OK ancestor` |
| Branch tip pushed | `git rev-parse refs/heads/master` vs `git ls-remote origin refs/heads/master` | both `509540c5023c045e0b041bbf3087dc0253ae7dd0` |
| Round work in window | `git log c5474922..509540c5` | exactly the 9 cited commits, all authored `tabi-shokunin` |
| Report landed last | fleet report commit time 20:45:53-08:00 == watchdog `complete tabi round=51` line; cited HEAD is the pushed tip | PASS |
| No `[x]` written into SHONEN.md | `git show 509540c5:SHONEN.md` | 4 box lines all `- [~]`; the single literal `[x]` in the file is prose inside box 1's evidence line quoting the prior invalid verifier marks |
| No r50 byte edited | `git diff --name-status c5474922 509540c5 -- .ufo/waves/round-50/ .ufo/waves/round-49/ corpus/lessons/round-50.md` | only `A .ufo/waves/round-50/measure/c1-meter-red-at-data.stderr.txt` and `A .ufo/waves/round-50/measure/check-sources-at-integration-pre.txt` (the two r50-era straggler receipts landed at f74325bb, additions only, disclosed in the lesson); round-50/49 lesson bytes untouched; the D-2 superseded sentence is still present verbatim in r50 bytes (`grep -c "INSIDE the Registry table"` = 1) with the correction of record in the r51 lesson |

## 2. Per-claim re-checks

Verdict discipline: C1 and C3 are **evidence-verified from committed receipts** per the
closure note (heads have advanced since; the snapshot pins govern — I did not re-run the
meter's live predicate or the gate over the live tree). C2 is **evidence-verified AND
re-measured live** (one throwaway-profile re-run of the committed runner + the committed
counter over the fresh receipt). Selftests I re-ran are named as re-runs.

### C1 (adjacency) — VERIFIED, evidence-verified; meter selftest re-run live

- Red control `controls/c1-meter-v10-red-at-round-open.json`: rev `c5474922`, counts
  `{roster:1, mapRows:16, auditRows:16, deltaLanes:12}`, headSnapshot `{".git": "0d1f9c15…"}`,
  predicate false, **23 findings** = 10 `audit-status-mismatch` + 1 `roster-lane-uncovered`
  (`.git`) + 12 `delta-lane-not-on-roster` — matches the report and SCORECARD block exactly.
- Isolation control `controls/c1-meter-v11-rosterfix-on-r50-ledgers.json`: same rev, same
  r50 ledgers, counts `{roster:16, …}`, **7 findings, all `lane-screen-head-mismatch`**
  (chousa, kengaku, mori, binary-forensics, reverse-engineering, tameshi, tsukuroi), zero
  sha/lines/quote findings — the fix is isolated from the staleness; zero byte drift, as claimed.
- Green receipt `measure/c1-meter-green-at-data.json`: rev `33967b10`, predicate **true**,
  **0 findings**, counts `{roster:16, mapRows:16, auditRows:16, deltaLanes:12}`; its
  `headSnapshot` equals `measure/c1-snapshot-at-rebind.json` (one fresh snapshot; the
  receipt also records `AUDIT rows 16; DELTA lane rows 12 + line rows 16; carried 16;
  newAdjudications 0`).
- My own row counts at HEAD: `git show HEAD:corpus/adjacency-host-audit-r51.tsv | awk NF |
  wc -l` = 17 lines = header + **16 data rows**; `delta-r51` = 29 lines = header + **12 lane
  rows + 16 line rows**. Matches.
- Meter selftest **re-run live**: `node c1-adjacency-host-v11.mjs --selftest` → exit 0,
  `allPass: true, cases: 16, pass: 16` (matches `measure/c1-meter-v11-selftest.json`).
- Meter digest pin: `git cat-file blob HEAD:.ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs
  | sha256sum` = `551c0aee8797…` — equals the claims.json C1 `frozen digest 551c0aee…` pin.
- Pure-core-identical claim: `controls/v10-v11-meter.diff` (8 hunks) touches only the
  header comments, `AUDIT_REL`/`DELTA_REL` rebind (r50→r51), schema/usage/predicate-sentence
  strings, and the `rosterScan` function (follow symlinked entries via stat, skip
  dot-entries). Verify + selftest-case core untouched, as claimed.

### C2 (coverage) — VERIFIED, evidence-verified + live re-measured by this judge

- File count re-derived: `git ls-tree -r --name-only 08cc4b72 -- corpus/evidence/round51 |
  wc -l` = **7** (receipt + 6 PNGs); same 7 at HEAD; 0 at baseline (`c5474922`).
- Committed receipt `corpus/evidence/round51/webview2-form-journey/receipt.json`: 6 journey
  legs (Page.navigate /a.html → anchor-click /b.html → /c.html → navigateToHistoryEntry
  /b.html targetIndex 2 → anchor-click /form.html → form-submit /echo?field=tabi-r51-81bda5e52cf6fee7),
  history at C `[data:, a, b, c]` 4/3, back leg 4/2, `form-complete` step with
  `fieldValue == echoPage == nonce` and `serverSaw: true`, fixture `served` log carries
  `/echo?field=<nonce>` (server-side witness), Edg/156.0.4314.58, `postKillSweepCount` 0
  (keyed teardown), `failures: []`.
- Counter green `measure/c2-counter-green-at-data.json`: schema `tabi-webview2-receipt-r51`,
  predicate true, findingCount 0, `couldNotEvaluate: []`, form block
  `mechanism: dispatchMouseEvent+insertText+submit-click`, all four form witnesses true.
- Cross-refusal `measure/c2-r50counter-refuses-r51.json`: r50 counter schema, predicate
  false, **5 findings** (schema, profile-not-throwaway, nonce-shape, driver-pin-mismatch
  `3bbcd38f… != 2152d292…`, journey-steps) — the prior generation refuses, as claimed.
- Selftest receipts at the freeze: `measure/c3-counter-selftest-at-freeze.json` =
  `tabi-webview2-receipt-r51-selftest` 17/17 allPass; `measure/c2-path-selftest-at-freeze.json`
  allPass true (6 cases).
- **Live re-run (this judge, once, throwaway profile, scratch outside the repo)**: extracted
  committed bytes of `scripts/webview2-cdp-loopback-round51.mjs` (sha256 `3bbcd38f…` — equal
  to the receipt's `driverSha256`) and `scripts/webview2-host-round48.cs` (sha256 `13b2bc3d…`
  — equal to `hostCsSha256`) into a judge scratch tree; ran
  `node …round51.mjs --runtime "…/EdgeWebView/Application/156.0.4314.58" --loader … --scratch
  <scratch>/formrun --out <scratch>/formrun/receipt-rerun.json --form` → **exit 0**, 6 steps,
  fresh invocation-bound nonce `tabi-r51-615f5ae7461b5253`, `serverSaw: true`,
  `echoPage == fieldValue == nonce`, history 4/3, back leg targetIndex 2 → /b.html 4/2,
  `postKillSweepCount: 0`, `failures: []`.
- Committed counter over the fresh receipt: predicate true, 0 findings,
  `couldNotEvaluate: []`, exit 0.
- Counter selftest **re-run live** over the committed fixtures in a repo-shaped root:
  exit 0, `allPass: true, cases: 17, pass: 17`. Verifier disclosure: my first attempt ran
  `--selftest` from a flat scratch layout and failed 0/17 with spurious `pin-file-unreadable`
  findings — the counter resolves the pinned driver/hostsrc five levels above the fixtures
  dir (repo layout); the failure was my harness layout, not the committed fixture set.

### C3 (operability) — VERIFIED, evidence-verified (snapshot pins govern; gate not executed over the live tree)

- v4 gate bytes at HEAD (`scripts/check-selfassessment.mjs`): header declares verdict map
  0/1/2, selftest flag `--selftest`, write scope stdout/stderr only; the v4 delta comment
  (`// v4 (round 51): m3 classifies each status row by BYTE TRUTH against the measured
  tree`) and the `m3-index-artifact` classification + case-collision branch are present in
  the bytes (`grep m3-index-artifact` hits at the classification push and selftest case ids).
  Diff `controls/selfassessment-v3-v4.diff`: 9 hunks.
- Before (control) `controls/c3-gate-v3baseline-at-round-open.txt`: baseline v3 bytes over
  the round-baseline tree — the standing environmental class; report quotes
  `verdict=failed mismatches=1 (could_not_evaluate=182)`.
- Separation pre-data `measure/c3-gate-v4-at-baseline-predata.txt`: 650 artifact rows
  disclosed, real rows only the round's own in-progress files.
- Sandbox red/green pair, same fixture rev `a0d26c06…`: v3 bytes →
  `FINDING class=m3-unlanded-paths … SELFASSESSMENT verdict=failed … mismatches=1`;
  v4 bytes → `FINDING class=m3-index-artifact … couldNotEvaluate…` +
  `SELFASSESSMENT verdict=clean … mismatches=0 could_not_evaluate=1`. The fix is shown able
  to fail (red before) with the gate as the only delta (green after).
- Selftest `measure/c3-selftest-v4-at-instrument.txt`: 45 CASE lines ending
  `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45`, including the four new
  (`m3-index-artifact-untracked-byte-identical`, `m3-real-modified-bytes-vs-tree`,
  `m3-ntfs-unrepresentable-name` win32-conditional, `m3-real-gone-representable-name`) and
  real-drift refusals (`expected_exit=1 … m3-unlanded-paths`).
- The m1 chain receipts: `c3-gate-v4-at-R.txt` (19 stale tallies at b3abd0ba), `…at-R2.txt`
  (6 after the addenda), `…at-R3.txt` (1 — m3 counting its own six in-flight receipt files,
  closed by f04a837b), `…at-R4.txt` (1 — exactly the two r50-era stragglers, which f74325bb
  then landed), and the final `measure/c3-gate-v4-at-R5.txt` whose verdict line reads
  **`SELFASSESSMENT verdict=clean rev=f74325bb86c7a33d276eeb376eea574393bf57e4
  mismatches=0 could_not_evaluate=172 superseded=43`** — exactly the note's quoted verdict,
  naming the rev it measured, landed at 509540c5 (exit 0 per the gate's verdict map).

### Carry-in D-1/D-2/D-3 — performed as corrections of record; appends verified

- D-1 re-derived from the committed receipt:
  `git show HEAD:.ufo/waves/round-50/controls/c1-meter-v9-red-at-round-open.json | grep -oE
  '"id": "[a-z-]+"' | sort | uniq -c` → 11 `lane-screen-head-mismatch` / 4
  `lane-screen-sha-mismatch` / 4 `lane-screen-lines-mismatch` / 2 `delta-line-missing` /
  1 `delta-quote-not-whole-line` / 2 `delta-line-invented` = **24** — the lesson's and
  SCORECARD's correction text quotes exactly this split; r50 bytes unedited.
- D-2: the superseded sentence ("…lands INSIDE the Registry table…") is still in the r50
  lesson bytes (1 hit, unedited); the r51 lesson carries the dated correction (2026-11-01)
  naming the withdrawn S161 draft and the true 160-row end state (my own count: 160 before,
  160 after).
- D-3: r50 claims.json still contains the superseded parenthetical sha `8372402c` (2 hits)
  and the governing `frozenDigests` pin `b7f54586` (3 hits); the committed r50 counter bytes
  at baseline hash to `b7f54586…` — the governing pin matches the committed bytes, exactly
  as the correction states. No measured predicate binds 8372402c.
- Item 4: the `tabi | round-44` L2-floor L0 is consolidated into one standing line in
  PROVINCE.md (present at HEAD), still open, never treated as answered.

## 3. Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | improved | C1 verified: the regression gate was do-nothing-RED on this host at round open (roster `{.git}`, 23 findings — a control no re-bind can green) and is GREEN at `33967b10` (predicate true, 0 findings) through a versioned, digest-pinned meter fix isolated by a committed control; SCORECARD holds 8 → 8 (score unchanged, state improved) |
| coverage | improved | C2 verified + judge re-run: the webview2 surface's measured model now covers real form interaction (input-domain fill+submit witnessed four ways incl. server-side), 0 → 7 committed evidence files, capability row `webview2-form-journey-windows` first-working 51; score held 9 → 9 |
| operability | improved | C3 verified: the standing environmental false-failure (mismatches=1 every round since 44) is closed by byte-truth grading with a sandbox red/green pair and deterministic hard branches; the gate's own selftest went from cannot-run-on-host to 45/45; final verdict clean at `f74325bb` with the class disclosed; score held 9 → 9 |
| depth | unchanged | untouched this round (9) |
| freshness | unchanged | untouched as a claim (9); S153's byte-identical re-open is recorded under quality/expansion, not a freshness axis move |
| calibration | unchanged | untouched as a claim (9); the m3 gate fix lands under operability (the gate's own axis), calibration's rows re-verified by the repaired gate itself |

No axis harmed (SCORECARD diff c5474922→509540c5 is 91 insertions, 0 deletions; the
supersession discipline is append-with-named-supersede, verified green by the gate's own
m1 window at R5 with superseded=43).

## 4. Discernment spot-check (outside, non-author)

The round lesson's `## Gate` holds one re-opened source row (S153), four admits, three
rejects. No new SOURCES.md row was written this round (160 → 160 UNCHANGED), so the
new-row re-open duty is satisfied by re-opening the round's only touched row, S153, whose
re-open the Gate records. My re-opens:

| Item | Decision | Re-opened source (by this judge) | Agree/disagree | Reason |
|---|---|---|---|---|
| S153 re-open | ADMIT | Fetched `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` fresh today: 1,421,620 B, sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2` — byte-identical to the registered anchor and to the staged committed copy (`git cat-file blob …sources/browser-protocol.json` hashes equal); grep on the opened bytes: `"This method emulates inserting text that doesn't come from a key press"` 1 hit, `"Dispatches a mouse event to the page."` 1 hit (13 and 7 words, ≤25-word rule met) | agree | The row's teaches (CDP Input-domain primitives ground the form legs) is exactly what the opened bytes carry; the re-open receipt's claims all reproduce |
| C2 form journey | ADMIT | Re-ran the committed runner once live (throwaway profile, keyed teardown sweep 0) and the committed counter over the fresh receipt; both green (see §2) | agree | The capability is real and reproducible right now on this host by a non-author from committed bytes alone |
| C1 meter v11 | ADMIT | Red/isolation/green receipts read at committed bytes; selftest re-run live 16/16; meter digest matches the frozen pin | agree | Do-nothing control reaches exactly the red; the fix is isolated from the real staleness (7 head races, zero byte drift); green is measured at a pinned rev |
| C3 gate v4 | ADMIT | v4 bytes, selftest receipt 45/45, sandbox red/green pair, R5 clean receipt naming `f74325bb` — all read from committed bytes (gate not executed live, per the snapshot-pin governance) | agree | The declared class semantics separate host artifact from real drift, and the pair proves the fix able to fail |
| v10 meter for this host shape | REJECT | `controls/c1-meter-v10-red-at-round-open.json` + the v10→v11 diff's minus line (`filter((d) => d.isDirectory() && …)`) | agree | The rejected behavior (readdir-isDirectory drops symlinked siblings, admits `.git`) is visible in the committed bytes and measured at 23 findings |
| baseline v3 gate bytes for host use | REJECT | `controls/c3-v3-baseline-artifact-sandbox-red.txt` (v3 reads mismatches=1 on a sandbox whose only delta is host-index artifact rows) vs `controls/c3-v4-sandbox-green.json` (same sandbox, clean, artifact disclosed) | agree | The rejection is measured, not reasoned: v3 counts phantom rows as unlanded work; bytes stay committed at the baseline rev |
| fixture generator first drafts (14/17 first selftest run) | REJECT | `measure/c3-counter-selftest-at-freeze.json` (the freeze carries the passing 17/17); my own selftest re-run reproduces 17/17 in repo layout | agree | Authoring-time drift disclosed with the overwritten-receipt caveat; nothing frozen carried a failing fixture set |

`sources-census.sh validate` re-run by this judge: exit 0, 22 pre-existing `W04`
(duplicate-url-across-scopes) rows, final line `ok …/tabi-shokunin/corpus/SOURCES.md` —
matches `measure/census-start.txt` and `measure/census-end.txt` (exit 0 both, same 22 W04)
and `measure/check-sources-at-work.txt` (`SOURCES_GATE verdict=clean rows=160`).

## 5. Trend verdicts (this judge's, agreeing with the lane's report)

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 0 → 7 evidence files on ground the coverage map did not hold (live input-domain form interaction with a server-side witness, judge re-run green); capability row `webview2-form-journey-windows` first-working 51; knowledge notes 66 → 67 (`ls-tree` recount); S153 re-open extends held ground to the Input-domain primitives |
| quality | improved | The regression gate survived a genuine host-shape change with fix isolated from staleness by a committed control (same ledgers: v10 23 findings/roster `{.git}` → v11 7 real head races, zero byte drift); the standing environmental false-failure is closed with a red/green pair; selftest cannot-run → 45/45; no admitted entry failed a re-check (S153 byte-identical — judge re-fetched) |
| discernment | improved | Outside spot-check (this file) agrees with every sampled admit and reject; stale m1 tallies superseded by line with oracle-correct figures instead of quieting the gate (19 → 6 → 1 → 0 chain all committed); fixture-authoring drift (14/17) disclosed with the overwritten-receipt caveat; two inherited modified worktree files restored to committed bytes under the uncommitted-work clause and disclosed; meter fix scoped by an isolation control |

## 6. Routed defects / notes for next round (all status-neutral; none bars admission)

1. **R51-V1 (cosmetic instrument-output drift, routed to the next meter version):** the v11
   meter's emitted `predicateSentence` still opens with the token
   `c1-adjacency-host-v10 admits…` (the frozen sentence carried the v10 name through the
   v11 diff; the sentence body correctly names the r51 ledgers and the JSON `schema` field
   says v11). Update the leading token (or disclose the frozen-sentence carry-over in the
   meter header) the next time the meter is versioned. No measurement binds the token.
2. **Verifier aid (no lane action):** the webview2 counter's `--selftest` resolves its
   pinned driver/hostsrc files five levels above the fixtures directory — run it only from
   a repo-shaped root. A flat fixtures dir yields spurious `pin-file-unreadable` findings
   (this judge's first attempt; disclosed in §2).
3. **Observation (no action required):** the SKILL.md gate-registry history carries the
   selfassessment-counter tally as per-round rows superseded by dated correction lines
   (latest: `--selftest (45/45)` corrections at SKILL.md ~:2982/:2995 superseding the v3-era
   41-case rows) — compliant with the corrections convention; a reader landing on the
   historical row must follow the correction chain to the oracle-correct figure.
4. **Operator note (SHONEN):** all four boxes are `[~]` with resolvable pointers and none
   was self-discharged; box 2's evidence (the live form journey, counter-checked, judge
   re-run green) and box 1's decision tables/checklists look fully checkable by a non-author
   if the operator wishes to run that gate. No `[x]` written anywhere by this closure.
5. Conformance defects: **none found.** Every cited hash exists and is an ancestor; the
   report landed last under the lane identity; no r50 byte was edited (the two round-50
   receipt additions at f74325bb are the disclosed stragglers, additions only); census
   start/end receipts match the judge's own census re-run; SOURCES old→new used-by change
   is logged in the lesson; the knowledge note carries the provenance trio.
