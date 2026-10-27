# Round 32 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 32. Before `d805d1d6132430118b206a848b85753ab35d1014` → after `8fa57d29ed8a4eab9412782087f9a869399b7896` (claims measured at `08086884d425b879f020af82fc6e57180e991a3e`).
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1525 and 1534 when read):
`2026-10-26T12:31:10-03:00 launch tabi round=32 pgid=13608 driver=hyaku-inline attempt=1`;
`2026-10-26T14:47:16-03:00 complete tabi round=32; hyaku-inline attempt=1`.

## Conformance

- Report `.ufo/reports/round-32/tabi.md`: `git log --format='%an %H' -- <report>` → `tabi-shokunin a3ab0ec012c3b96362951c6cc0fb6f1a706847e2` (2026-10-26T14:46:48-03:00). That is after the last lane commit (`8fa57d29`, 14:46:01) and before the driver's completion line (14:47:16). The report has a `## SHONEN` heading with 4 `[~]` lines, and `SHONEN.md` has 4 boxes.
- Cited hashes: the baseline plus the 6 round commits (`2f8535c5`, `5ad1fcbf`, `4181fffb`, `b234a589`, `08086884`, `8fa57d29`). Each resolves with `git rev-parse --verify <h>^{commit}`, and `git merge-base --is-ancestor <hash> master` holds for each. `git log d805d1d6..8fa57d29` shows exactly these 6 commits, all by `tabi-shokunin`. The report's `ee0edeba` is a screenshot sha256 prefix, not a commit.
- `scripts/hyaku/jj-lane.sh state` → `branch=master local=8fa57d29… remote=8fa57d29… ahead=0 behind=0 head=detached tracked=0 untracked=0`. `git status --porcelain` printed 0 lines. `git ls-remote origin refs/heads/master` → `8fa57d29…`.
- Prompt `.ufo/prompts/tabi-round-32.md` (fleet commit `d5bc2f5c`, 12:31:08, working tree clean):
  - `diff` of lines 1–140 against `kimi-shokunin/templates/round-prompt.md` (140 lines) differs only at lines 1, 5–6, 46, 61, 65, 69, 101, 133, 135 and 139. All of these are `{{…}}` placeholder substitutions.
  - Lines 141–624 against `scripts/hyaku/lane-addendum.md` (484 lines) differ only in placeholder lines (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{LANE_CWD}}`, `{{CANON}}`, `{{ATTEMPT}}`, `{{TARGET}}`, `{{PREV}}`).
  - `MISSION.md` has no tabi-specific bucket (`grep -i tabi MISSION.md` matched nothing).
- Waves (`.ufo/waves/round-32/`):
  - `w1-validate.stderr` and `w2-validate.stderr` are 0 bytes.
  - w1-spec has 36 items: 12 scribe, 8 executor, 5 critic, 3 reviewer, 3 connector, 2 scout, 2 mutation-tester, 1 sentinel. w2-spec has 34 items: 18 critic, 6 reviewer, 3 executor, 3 mutation-tester, 2 connector, 1 scout, 1 sentinel. Both match the report.
  - The m_flash roles under the run-8/9 map in `scripts/hyaku/hyaku.env` (executor, scribe, critic, sentinel) give 26/36 and 22/34, as the report says.
  - `w1-results.json` and `w2-results.json` record `seats` 36 and 34, with 36 and 34 results and 0 empty outputs. Every spec name has a `w1/<name>` or `w2/<name>` report. `grep -c '"model"'` is 0 in every spec and dispatch file.
- Census at closure: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exited 0 with `tabi ok` and 20 W04 lines. Its stdout is byte-identical to the committed `measure/census-end.txt` apart from that capture's trailing `exit=` line.
- Step-1 defects (status-neutral): none. Notes:
  - Wave 2 also used 3 executor, 2 connector and 1 sentinel seats. The prompt's falsify wave names "fresh reviewer/critic/mutation-tester/scout seats". The executors were re-runs (RerunC1Live, RerunDriver, RerunNoHarm), so this is attack work, not padding.
  - The control provenance files now record `clone_tree`. That answers routed defect 5 of round 31 in part. Both do-nothing trees resolve in the lane repo (`ffd7ce56` = tree of `5ad1fcbf`). The 5 mutated-control trees (`21c48a93`, `51b5c583`, `de1d7ae0`, `4b873bef`, `f1dc6fea`) do not resolve. They can be rebuilt only through the committed `baseline/controls.sh`.

## Claim re-checks

Gate standard (Closure consequence) applies. Both claims rest on lane-owned frozen counters (`check-bidi-runtime.mjs`, `check-selfassessment.mjs` v3), and I executed neither these nor any other lane script. Both claims are **evidence-verified**: I checked the committed counter outputs, the frozen digests and the revision each output was measured at. Both are also **re-measured** by my own plain counts over committed bytes. For C1 I also drove an **independent live BiDi session** with my own client (below).

Frozen digests: `git show <rev>:<path> | sha256sum` at `5ad1fcbf` (counter freeze), `4181fffb` (claims freeze), `08086884` (measured) and `8fa57d29` (tip):

| Counter | sha256 at all four revisions |
|---|---|
| `check-bidi-runtime.mjs` | `2f25af5a…c393` |
| `check-selfassessment.mjs` | `77b5c8ed…c6a9` |

Both equal `claims.json` `frozenDigests`. `git diff --name-only 5ad1fcbf 08086884 -- <both counters>` is empty. `git diff --name-only 08086884 8fa57d29` lists 17 paths, all under `.ufo/waves/round-32/`. `measure/provenance-0808688.txt` reads `porcelain=0`, `frozen-counters-diff-files=0`, and exit 0 for c1-live, c1-offline and c2.

### C1 coverage + capability acquisition — WebDriver BiDi docs-held → runtime-held (population 0 → 16, admitted 0 → 16, failing 0, `--live`)

- Absence at baseline: `git cat-file -e <rev>:corpus/knowledge/webdriver-bidi-runtime-round-32.md` fails at `d805d1d6`, `5ad1fcbf` and `4181fffb`, and succeeds at `b234a589` and `08086884`.
- Committed counter readings (`jq '{rev,population,admitted,failing,binding,live}'`):
  - `measure/c1-live-at-0808688.json`: rev `08086884`, population 16, admitted 16, failing 0, binding null, `live: true`. `c1-offline-at-0808688.json` gives the same counts with `live: false`.
  - `baseline/c1-J1-do-nothing.json`: rev `5ad1fcbf`, population 0, admitted 0.
  - Docs-only control: 16 / 0 / 16 failing.
  - Forgery control: admitted 0 live, and 16 offline only.
  - Counter-as-driver control: 0 admitted.
  - These match the report. The self-test summary `baseline/c1-counter-selftest.txt:28` reads `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27`.
- Plain re-measure (my own Python parse of the committed `corpus/evidence/round-32/bidi/run{1,2}/transcript.jsonl`):
  - Each run has 71 lines (1 `http-res`, 28 `send`, 42 `recv`). The two raw sha256 digests differ (`8aa97463…` and `9918a716…`), so these are two distinct transcripts.
  - In both runs every one of the 15 BiDi methods the entry names has a `success` reply, with 0 error replies.
  - Events per run: `browsingContext.load` 3, `network.beforeRequestSent` 5, `network.responseCompleted` 5, `browsingContext.userPromptOpened` 1.
  - Each run has exactly one `captureScreenshot`. It decodes to a 640×480 PNG with sha256 prefix `ee0edebad5ac` in both runs, which matches the binding the report states.
  - Every `responseCompleted` event reports status 200 and `x-tabi-fixture: r32` on a `127.0.0.1` URL.
- Plain counts in the entry: `grep -c '| yes |'` gives 16. The R-rows are R1–R17 twice over (§2 and §3, 34 rows). R16 reads `no — no BiDi command`.
- **Independent live session at closure.** My own Node client (not the lane's driver or gate) used `/usr/bin/chromedriver` on a random port and a loopback page served by the client itself, with TMPDIR under `/fast/scratch/hyaku/closure-tabi-r32/`. The scratch directory was removed after the run. Output: `{"browserVersion":"154.0.8037.97","webSocketUrl":"ws://127.0.0.1:29245/session/<id>","subscribe":true,"getTree":1,"setViewport":true,"navigate":true,"locateNodes":["h1"],"innerWidth":640,"screenshot":{"w":640,"h":480,…},"cookies":["judge=1"],"responseCompleted":{"status":200,"xJudge":"r32"},"loadEvent":true,"stopCommand":"unknown command"}`.
  - This re-establishes R1–R5, R7, R10, R11 and R15 on this host from a non-author client.
  - `browsingContext.stop` is refused as an `unknown command`, which agrees with the R16 `no`.
  - BiDi on this host is therefore runtime-held independently of the lane's receipt.
- Disclosed hole: the lane's own entry corrections and lesson M2 state it. The frozen gate and the plain counts both admit a synthetic transcript with one real first screenshot spliced in. The live leg re-tests every row on a session the gate starts itself, and my independent session agrees, so the C1 verdict does not rest on the forgeable receipt leg. `claims.json` `feasibilityDisclosed` is false as written, and the lane discloses this (M2).
- `measure/c1-distinct-at-0808688.json` reads 16 distinct ids, 2 distinct transcript digests, `driverEqualsGate false`, `ok true`. It also lists `driverImportsFromGate: ["FIXTURE_SHA256, VIEWPORT, serveFixture"]`, so the driver shares the gate's fixture server and constants and is not fully independent of the gate's bytes. It does not import `liveRecord` or `PREDICATES`, as entry §8 states.
- **Verdict: improved.** The claim verifies under the frozen rule, my plain counts agree, and a non-author live session reproduces the capability. The capability row `webdriver-bidi-runtime` (`SCORECARD.md:1663`) names an operation, not a gate, and its demonstration is in the report. The coverage score stays at 9 by the lane's own reading.

### C2 calibration — frozen v3 counter adds `m4-nudge-state` (mismatches 18 → 0, m4 3 → 0, 0 deleted lines)

- Committed counter readings:
  - `baseline/c2-J1-do-nothing.json`: rev `5ad1fcbf`, mismatches 18 (m4 3).
  - Delete-words control: 15, with deleted lines (`c2-J2-delete-words.numstat`).
  - Uncited-correction control: 18.
  - `measure/c2-at-0808688.json`: rev `08086884`, mismatches 0, m4 0, couldNotEvaluate 106, superseded 39.
  - Self-test `baseline/c2-counter-selftest.txt:42`: `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41`.
- Numstat: `git diff --numstat 4181fffb 08086884 -- SKILL.md corpus/README.md SCORECARD.md LOG.md` gives LOG 110/0, SCORECARD 91/0, SKILL 143/0 and README 52/0, so the deleted sum is **0**. This is identical to `measure/c2-numstat-at-0808688.txt`.
- m1 line-by-line re-derivation. `git show 4181fffb:<file> | sed -n Np` at all 15 `beforeItems` lines prints the stale tallies the lane claims:
  - `SKILL.md`: :2479 `cases=13`, :2515 `cases=17`, :2530 `20 cases`, :2545 `cases=22`, :2576 `cases=30`, and :2578/:2590/:2594/:2598 `30/30`
  - `corpus/README.md`: :613 `cases=17`, :668 `30/30`
  - `SCORECARD.md`: :1439 `17 cases`, :1465 `22/22`, :1486 `cases=22`, :1564 `30/30`
  - The 4181fffb..08086884 diff of each file cites every one of these line numbers in an appended correction stating 41/41.
- m4 re-derivation from the lane's own inputs:
  - At the freeze, `SCORECARD.md:1473-1474`, `:1515` and `:1576` read "nudge inactive".
  - The round-start axes lines `:1472`, `:1514` and `:1574-1575` read all six axes ≥ 8, against saturation 8 / window 3.
  - The capability table's last `First-working round` entries are round 25 (`:1306`, `:1314`). From round 27 the lane records gates as counters, not repertoire rows (`:1403-1404`).
  - Applying `AXES.md` §The stagnation nudge ("at or above") to the table as written derives "active" for rounds 29, 30 and 31. The corrections at `SCORECARD.md:1612-1626` say this and cite each round's own axes line. The dependency on the capability-row rule is disclosed at `:1628-1635`.
  - `LOG.md:2072` is corrected at `LOG.md:2222`.
- Disclosed: 15 of the 18 mismatches were induced by v3's own case growth (30 → 41), and only 3 are prior lane mis-statements. The clearance relies on the loose supersession rule (M6, 5/10 selftest mutant survivors). The 3 m4 corrections are substantively true by my re-derivation above, so the calibration movement is real, though smaller than "18 → 0" suggests.
- **Verdict: improved.** The claim verifies under the frozen rule, and the plain re-derivation agrees. The calibration score stays at 9.

### Other axes and no-harm

- `git diff --numstat d805d1d6 8fa57d29 -- . ':!.ufo'`: the only deletions in the round are in `scripts/check-selfassessment.mjs` (+190/−3), which is the frozen v3 landed in `2f8535c5`/`5ad1fcbf`.
  - Every other path is append-only: SCORECARD +91/−0, LOG +110/−0, SKILL +160/−0, QUALITY +37/−0, README +52/−0, SOURCES +6/−0, matrix +105/−0, rate-signal table +20/−0, and the new entry +211/−0.
  - `git diff d805d1d6 8fa57d29 -- SCORECARD.md | grep -c '^-[^-]'` → 0.
  - `SHONEN.md` and `PROVINCE.md` are unchanged (`git diff --quiet` holds).
- `measure/noharm-at-0808688.txt` (committed evidence; each gate line names `rev=08086884…`):
  - gate-registry clean (40 rows, 22 gates, nonconformant 0)
  - release-pins 23/23 resolved
  - s106 valid
  - frontier-admission clean
  - decision-table clean
  - sources gate clean at 126 rows
  - all 18 self-tests exit 0 (25 lines in total, all `exit=0`)
- The wave-2 release-pins regression (green → red at `b234a589`) was repaired before measurement by S125 `recheck` `on-release` → `90d`. That change is legal under contract rule 2 and logged at lesson `:176-177`. It is a routed defect, not harm (below).

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| coverage | improved | C1: frozen counter 0 → 16 admitted, 0 failing, live, at `08086884`; digests frozen; 2 distinct transcripts with 15/15 methods successful and an identical 640×480 first screenshot; non-author live BiDi session at closure reproduces it; capability row entered |
| calibration | improved | C2: frozen counter v3 18 → 0 mismatches (m4 3 → 0) at `08086884`; 0 deleted lines; 15 m1 lines and 3 m4 statements re-derived from the freeze bytes and the lane's own inputs |
| depth | unchanged | no claim; SKILL round-32 transport table appended; no-harm gates green at `08086884` |
| operability | unchanged | no claim; 18 self-tests and 6 gates green at `08086884` |
| freshness | unchanged | no claim; S123 supersedes S119's anchor month; S124/S125/S126 re-open byte-identical at closure |
| adjacency | unchanged | `PROVINCE.md` unchanged; w2 CritAdjacency absorbed nothing |

**Admitted**: both claims verify and no axis is harmed.

## Discernment spot-check

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S125 ChromeDriver `session_commands.cc` at tag 154.0.8037.97 | admit | live `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc?format=TEXT` → 200, 90944 B base64; decoded sha256 `7b40e94c…abb5` (equal to the Gate row) | agree | Decoded lines 287–289 read `if (session->web_socket_url) {` / `caps.Set("webSocketUrl",` / `"ws://" + session->host + "/session/" + session->id);`, and :407 reads "Create a hidden target for running  BiDi-CDP mapper in it", as quoted. Chrome's own driver source at the measured build is primary for "how this build enables BiDi", and its scope is limited to that. |
| S124 dated BiDi WD §4.1 + S126 classic WD `ignore` handler | admit | live `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` → 200, 4235856 B, sha256 `dc1077db…24d4`; live `https://www.w3.org/TR/webdriver2/` → 200, 1882653 B, sha256 `929f2f0b…919e` (both equal to the Gate rows) | agree | After tag-strip and whitespace normalisation, "WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true." occurs once. So do the Abstract sentence and S126's "All simple dialogs encountered should be left to the user to handle." (under the `"ignore"` key). These are dated spec text scoped to protocol semantics, so tier A is correct. |
| Chrome-docs page for `webSocketUrl` | reject | live `https://developer.chrome.com/docs/chromedriver/downloads` → 200, 354982 B; live `https://developer.chrome.com/docs/chromedriver` → 200 (20 distinct `/docs/chromedriver/` nav links, none containing `bidi`, 0 `webSocketUrl`) | agree | `webSocketUrl` occurs exactly twice on the downloads page, both as the issue title `Resolved issue 4295: ChromeDriver with "webSocketUrl": true is racy`. An issue title is not an enabling instruction, so substituting the driver source (S125) is the stronger choice. |
| `webSocketUrl` as a WebDriver classic capability; R16 marked measured | reject | the same live classic WD bytes; the same live BiDi WD bytes; my own live session | agree | `grep -ci websocket` on the classic WD prints 0, so the attribution is false and the capability is BiDi §4.1 (M3). The BiDi WD's `browsingContext.*` names include no stop command (the only `stop` names are `stopScreencast`), and chromedriver answered `browsingContext.stop` with `unknown command`. Refusing a `yes` on R16 is correct. |

New-row quote check: S124's Gate quote "WebDriver clients opt in … with value true." is ≤25 words and occurs once in the live bytes. S125's quoted `caps.Set(…)` line is at decoded :288-289. Precision note: by whitespace split the S124 quotes are 17 and 15 words, not the 18 and 16 stated at lesson `:17`. Both are within the ≤25 bound, and this is the "Gate word counts" item w2 ReopenS124 already carries.

## Trends

- Expansion: **improved**.
  - One admitted entry stands on ground the corpus did not hold. The README frontier row "WebDriver BiDi — docs-held, no BiDi session measured" (`corpus/README.md:191`) is restated as runtime-held at `:735`.
  - The entry cites 3 `mined` rows opened this round (S124–S126, `used-by` naming it).
  - One capability row entered the table with its demonstration.
- Quality: **improved**.
  - S123 supersedes S119's anchor month (`September 2022` confirmed at closure in round 31's re-fetch, and byte-identical again here per the lane receipt).
  - 15 stale tallies and 3 false nudge statements are corrected append-only.
  - The R12 "unmeasured" sentence and the matrix collector clause carry dated corrections.
  - No admitted entry failed its closure re-check: S124, S125 and S126 re-open byte-identical, every quote is located, and the transcripts re-parse clean.
- Discernment: **improved**.
  - The outside sample agrees with the gate on 2 admits and 2 rejects.
  - M1, M2 and M4 became QUALITY criteria 83, 84 and 86, which cite lesson round-32. Criterion 85 supersedes 82's limit clause and cites M11 and `measure/c2-refusal-mutant.txt`.
  - The red states are committed under `baseline/` and `measure/`.

## Routed defects (tabi, next round)

1. C1 gate v2 (`check-bidi-runtime.mjs`): distinct row ids and transcript digests, driver content ≠ gate, splice detection, one self-test case per w1 MutC1 survivor (9/20), and the MutC1Entry decorated-cell drop. This is planned in SCORECARD round 32. Also state, or remove, the driver's import of `serveFixture`/`FIXTURE_SHA256`/`VIEWPORT` from the gate. The receipt's driver independence currently rests on a shared fixture server.
2. Calibration counter v4 (`check-selfassessment.mjs`): m4 grammar, supersession bound to a real correction, the 5 MutC2 survivors as cases, and word-numeral and `<name>_cases=` tallies. This is planned.
3. S125 `recheck` was changed `on-release` → `90d` to leave the release-pins gate's population (M10), not because of the source's nature. The entry's own `recheck` says "re-run on a new ChromeDriver build". Either add a release-pin receipt entry for S125 and restore a release-bound cadence, or record in the lesson why `90d` is the right cadence for a tag-pinned driver source.
4. `claims.json` C1 `feasibilityDisclosed` is false as written (M2). Append a named correction, since the frozen file cannot be edited, and carry it until it lands.
5. Wave-2 precision defects carried at lesson `:179-187` stay on the queue until each lands or is refused with a reason: CritNewNumbers 5, CritEntry 10, RevLesson, CritReadmeLog, and the ConnRoutedLedger 19 w1 findings. This includes the S124 scope cell, the Gate word counts and the S126 §7 → §6.7 anchor (superseding rows planned).
6. M9: the matrix's round-13 collector correction is closed by a dated correction this round. Confirm that the lesson's M9 "fix" cell is updated to "landed" next round.
7. Control provenance: the mutated-control `clone_tree` digests do not resolve in the lane repo. Either commit the fixture trees or keep `controls.sh` byte-pinned in `claims.json` so the controls stay reproducible.

## Operator note (SHONEN)

Boxes 1, 2 and 4 carry resolvable repo pointers that a non-author can check:
- `SKILL.md:2629` (round-32 transport decision table and error signatures)
- `corpus/evidence/round-32/bidi/receipt.json` with the LOG round-32 entry
- `PROVINCE.md`, unchanged

Box 3 still rests on a lane-dispatched seat (w2 RerunDriver) executing the SKILL bootstrap recipe. My closure session drove BiDi with my own client, not by following that recipe, so it does not discharge box 3. Promotion is operator-owned, and no `[x]` was written.
