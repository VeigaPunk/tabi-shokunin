# Round 31 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 31. Before `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc` → after `70e84a1058f1b2232c8e66f50732ec4bd369f908` (claims measured at `cad607b7104ff1668f1c8c847c3c0b720ec3e7d9`).
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1502, 1514, 1515 and 1520 when read):
`2026-10-26T05:12:11-03:00 launch tabi round=31 pgid=3183899 driver=hyaku-inline attempt=1`;
`2026-10-26T09:23:46-03:00 lane-dead-no-report tabi round=31; retry same round (hyaku-inline attempt=1: attempt 1 L1 died in the orchestrator host crash 2026-10-26 ~08:50 -03 (omp process exit); no report landed; work salvaged to the lane branch)`;
`2026-10-26T09:23:48-03:00 launch tabi round=31 pgid=1819594 driver=hyaku-inline attempt=2`;
`2026-10-26T09:52:52-03:00 complete tabi round=31; hyaku-inline attempt=2`.

## Conformance

- Report `.ufo/reports/round-31/tabi.md`: `git log --format='%an %H' -- <report>` → `tabi-shokunin 67fabbe45bafcecbe87ddfbbcd7b7beb4b2efa58` (2026-10-26T09:50:34-03:00). That is after the last lane commit (`70e84a10`, 09:49:19) and before the driver's completion line (09:52:52). The report has a `## SHONEN` heading with 4 `[~]` lines, and `SHONEN.md` has 4 boxes.
- Cited hashes: the baseline plus the 5 round commits (`9505a10e`, `48604835`, `ae15a37e`, `cad607b7`, `70e84a10`). For each one, `git cat-file -t` → `commit` and `git merge-base --is-ancestor <hash> master` holds. `git log 96a2d1a3..70e84a10` shows 5 commits, all authored and committed by `tabi-shokunin <tabi@shokunin.local>`. `ae15a37e` is the orchestrator salvage of attempt-1 wave state, committed under the lane identity; the report says so.
- `scripts/hyaku/jj-lane.sh state` → `branch=master local=70e84a10… remote=70e84a10… ahead=0 behind=0 head=detached tracked=0 untracked=0`. `git status --porcelain` printed 0 lines. `git ls-remote origin refs/heads/master` → `70e84a10…`.
- Prompt `.ufo/prompts/tabi-round-31.md` (fleet commits `380e2ba3` attempt 1, `2a20e838` attempt 2; working tree identical to `2a20e838`):
  - `diff` of §1–§5 against `kimi-shokunin/templates/round-prompt.md` (140 lines) differs only at lines 1, 5–6, 46, 61, 65, 69, 101, 133, 135 and 139, all `{{…}}` placeholder substitutions.
  - §6 against `scripts/hyaku/lane-addendum.md` differs only in placeholder lines.
  - The quoted run-8 role→model map matches `scripts/hyaku/hyaku.env`. `MISSION.md` has no tabi-specific bucket.
- Waves (`.ufo/waves/round-31/`):
  - `w1-validate.stderr`, `a2w1-validate.stderr` and `w2-validate.stderr` are 0 bytes each.
  - w1-spec: 32 items (9 executor, 9 scribe, 5 critic, 3 reviewer, 2 connector, 2 mutation-tester, 1 scout, 1 sentinel). a2w1-spec: 32 items (9 critic, 9 executor, 7 reviewer, 2 mutation-tester, 2 connector, 2 scribe, 1 scout). Both match the report, including m_flash 24/32 and 20/32 and attack 10/32 and 18/32.
  - `a2w1-results.json` has 32 entries, each with a non-empty output and an `a2w1/<name>.md`. Each of the 32 w1 spec names has a `w1/<name>.md`. No `model` key appears in any spec or dispatch.
  - `w2/` holds only `swarm-registry.json`, `w2.ready.dispatched` reads `ABANDONED`, and all 32 `w2-dispatch.json` members have `agentId: null`, so w2 was never spawned, as reported. No `w1-results.json` exists, which the report discloses.
- The report's 27 evidence pointers resolve at `70e84a10` (`git cat-file -e`). The range anchors open on the described headings: `corpus/README.md:688`, `SKILL.md:2604`, lesson `:296`, `SCORECARD.md:1570` and `LOG.md:2063`.
- Census at closure: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exited 0 with `tabi ok` and 19 W04 lines. Its stdout is byte-identical to the committed `.ufo/waves/round-31/measure/census-end.txt` apart from that capture's trailing `exit=0` line. The start capture also has 19 W04.
- Step-1 defects (status-neutral): none. Two items are disclosed by the lane and not counted against this round:
  - The lesson header (`round-31.md:5-6`) names `w2` as the falsify wave. That is corrected append-only at `:298`.
  - The C1/C2 control JSONs record scratch-clone revisions (`befe2a3f…` and others) that do not resolve in the lane repo. This is disclosed at lesson `:292`. The freeze-tree reading is re-established by `measure/c2-at-9505a10.json` and `c1-live-at-9505a10.json`, which are clean checkouts of the freeze commit.

## Claim re-checks

Gate standard (Closure consequence) applies. Both claims rest on lane-owned counters (`check-decision-table.mjs`, `check-selfassessment.mjs`), and I executed no lane script. Both claims are **evidence-verified**: I checked the committed counter outputs, the frozen digests and the revision each output was measured at. Both are also **re-measured** by plain counts over committed bytes. C1 also has an independent live refetch at closure.

Frozen digests. `git show <rev>:<path> | sha256sum` at `9505a10e` (freeze), `cad607b7` (measured) and `70e84a10` (tip) gives `check-decision-table.mjs` = `d15f3bd7…f6832` and `check-selfassessment.mjs` = `143d66ff…2fce` at all three revisions. Both equal `claims.json` `frozenDigests`. `git diff --name-only 9505a10e cad607b7 -- scripts/` is empty. `git diff --name-only cad607b7 70e84a10` lists 461 paths, all under `.ufo/waves/round-31/`.

### C1 depth — sourced rate/crawl decision table (population 0 → 13, admitted 0 → 13, failing 0, `--live`)

- Absence at baseline: `git cat-file -e <rev>:corpus/knowledge/rate-signal-decision-table.md` fails at `96a2d1a3` and `9505a10e` and succeeds at `cad607b7`.
- Committed counter readings:
  - `baseline/c1-J1-do-nothing.json`: population 0, admitted 0, `entryPresent false`; `.exit` = `exit=1`.
  - `measure/c1-live-at-cad607b.json`: rev `cad607b7`, population 13, admitted 13, failing 0, `live: true`.
  - `c1-offline-at-cad607b.json` gives the same counts. The live readings at `4860483` and `ae15a37` are also 13/13/0.
  - `measured-provenance.txt`: `porcelain=0`, digests equal the frozen ones, `scripts-diff-files=0`, and c1 `exit=0` at `cad607b`.
- Controls J2–J5 reproduce `claims.json` verbatim:
  - old rows: admitted 0 (`r4-new-row`)
  - self-quote: offline admitted 2, live admitted 0 (`l1-live`)
  - invented thresholds: admitted 0 (`n1-threshold-sourced`)
  - package as-is: population 0
- Plain re-measure (my own parser over the committed entry and receipt bytes):
  - The table has exactly 13 rows, D1–D13. D1–D5 cite S119, D6–D11 cite S121 and D12–D13 cite S122. No row cites S120.
  - All 13 quotes are located in `corpus/evidence/round-31/decision-table/bytes/` after whitespace normalisation (HTML tag-stripped and entity-unescaped for S121/S122).
  - The threshold number appears in each row's quote: 9 as digits and 4 as number words (`five`, `one`).
  - Distinct (source, quote) pairs: 13. Distinct numeric values: 11.
  - The `sha256` fields of receipts `S119–S122.json` equal the sha256 of their bytes files.
- `corpus/SOURCES.md`: `git diff 96a2d1a3 70e84a10` adds exactly 4 lines and deletes none. S119–S122 each have NF=13 and are tier A, `mined`, opened `2026-10-26`, with `used-by` naming the entry. Rows go from 118 to 122.
- **Independent live refetch at closure** (my own `curl -sS -q -L`):
  - RFC 9309: 200, 25265 B, sha256 `f633915d…b207`, byte-identical to the receipt.
  - RFC 6585: 200, 17164 B, sha256 `f6d55d1b…6e58`, byte-identical to the receipt.
  - S121: 200, 337116 B, sha256 `47031376…73d9`.
  - S122: 200, 328088 B, sha256 `e4050f6b…47b0`.
  - The two GitHub pages differ in raw bytes from the receipts at the same length. The lane discloses this as per-response build bytes.
  - All 13 row quotes are present in the live normalised text.
  - The RFC 9309 header reads "September 2022", which confirms the entry's §Errata on the S119 anchor's "June 2022".
- Disclosed holes stand. The counter admits repetition and numbers that are not thresholds (M10). This round's rows have 13 distinct pairs and 11 distinct values, so the hole is not exercised here.
- **Verdict: improved.** The claim verifies under the frozen rule, and my plain counts agree.

### C2 calibration — self-assessment counter v2 over SKILL.md and corpus/README.md (mismatches 9 → 0, 0 deleted lines)

- Committed counter readings:
  - `baseline/c2-J1-do-nothing.json`: mismatches 9, `exit=1`. The 9 items equal `claims.json` C2.before.
  - `measure/c2-at-9505a10.json` is a clean checkout of the freeze commit and gives the same 9.
  - `measure/c2-at-cad607b.json`: rev `cad607b7`, mismatches 0, couldNotEvaluate 103, superseded 29; provenance `exit=0`.
  - Controls J2 (1, plus 9 deleted lines), J3 (12) and J4 (9) equal `claims.json`.
- Numstat: `git diff --numstat 9505a10e cad607b7 -- SKILL.md corpus/README.md SCORECARD.md LOG.md` gives SKILL 30/0, README 44/0, SCORECARD 39/0 and LOG 59/0, so the deleted sum is **0**. Over `96a2d1a3..70e84a10` it is also 0.
- Line-by-line re-derivation:
  - `git show 9505a10e:SKILL.md | sed -n Np` at :1614, :2479, :2514, :2515, :2529, :2530, :2543 and :2544, and `corpus/README.md:613`, prints the stale tallies the lane claims: 25, 13, 5, 17, 7, 20, 20, 7 and 17.
  - The oracles come from committed summary lines, not from running the gates: `baseline/c2-counter-selftest.txt:31` `SELFASSESSMENT_SELFTEST … cases=30`, and `w1/ExecC2Oracle/oracle.tsv` with release-pins 29, s106 10 and sources 26.
  - The appended corrections at `SKILL.md:2588-2602` and `corpus/README.md:668` cite each line and state the oracle-correct tally.
- The four freeze-time corrections (`SCORECARD.md:1439/1465/1486`, `SKILL.md:2545` → 30/30) are present and true.
- Word-numeral correction: `SKILL.md:1559` "eight isolated CLI cases" is corrected at `:2604-2610` to 12/12 (`FRESHNESS_SELFTEST … cases=12`, `a2-reverify-at-ae15a37.txt:30`).
- Routed round-30 defect 1 landed. `SCORECARD.md:1568` cites `:1523`, the readings 3 at `0ffc6ea0` and 1 at `d3cd62a1`, and the M8 cause. Each matches committed round-30 measure files.
- Remaining unreadable tallies at the tip:
  - `SKILL.md:1559` is stale but corrected.
  - `SKILL.md:2474` (`cli_cases=36`) is true.
  - Both are disclosed (criterion 81, `corpus/README.md:686`). No hidden stale tally was found in either document.
- **Verdict: improved.** The claim verifies under the frozen rule, and my plain re-derivation agrees. The SCORECARD keeps the calibration score at 9, with the counter holes named.

### Other axes and no-harm

- `git diff --numstat 96a2d1a3 70e84a10 -- . ':!.ufo'`: the only deletions in the round are in `scripts/check-selfassessment.mjs` (+104/−15), which is the frozen v2 landed in the freeze commit. SCORECARD +45/−0, LOG +59/−0, SKILL +49/−0, QUALITY +38/−0, README +44/−0, SOURCES +4/−0, and the new entry +212/−0. `SHONEN.md` and `PROVINCE.md` are unchanged (`git diff --quiet` holds).
- `measure/noharm-at-cad607b.txt` (committed evidence, every line naming `cad607b7`):
  - gate-registry nonconformant 0 (21 gates)
  - release-pins 23/23 resolved
  - s106 valid
  - frontier-admission 2/2, the same as the round-30 C2 reading
  - sources gate clean at 122 rows
  - census exit 0
- The SCORECARD round-31 rows (`:1570-1603`) quote the committed measurements without overclaim: depth 8 → 9, and calibration held at 9.

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| depth | improved | C1: frozen counter 0 → 13 admitted, 0 failing, live, at `cad607b7`; digests frozen; 13/13 quotes located in receipts and live at closure; 13 distinct pairs and 11 distinct values |
| calibration | improved | C2: frozen counter v2 9 → 0 mismatches at `cad607b7`; 0 deleted lines; 9 line-cited corrections re-derived against committed self-test summary lines; `:1523` routed defect landed |
| coverage | unchanged | no claim; the frontier row advanced as an appended restatement, counted under expansion |
| operability | unchanged | no claim; no-harm gates green at `cad607b7` |
| freshness | unchanged | no claim; S119 anchor date erratum appended, with a superseding row planned |
| adjacency | unchanged | `PROVINCE.md` unchanged; a2w1 ConnAdjacency absorbed nothing |

**Admitted**: both claims verify and no axis is harmed.

## Discernment spot-check

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S121 → D10 "No more than 900 points per minute are allowed for REST API endpoints" | admit | live `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` → 200, 337116 B | agree | The quote is present in the normalised text (13 words). The next clause gives GraphQL 2,000, which the row's "GraphQL has its own" scoping correctly excludes. The number is a stated ceiling, not an example. |
| S122 → D12 "If the x-ratelimit-remaining header is 0 , you should not make another request…" | admit | live `…/best-practices-for-using-the-rest-api` → 200, 328088 B | agree | The sentence is present verbatim (with the page's own space before the comma), followed by "The x-ratelimit-reset header is in UTC epoch seconds". The row's `stop` action and SHOULD strength match "you should not". |
| ScribeRowsRetry D1/D2 (RFC 6585 `Retry-After: 3600`; "50 requests per hour") | reject | live `https://www.rfc-editor.org/rfc/rfc6585.txt` → 200, 17164 B, sha256 `f6d55d1b…6e58` (equal to the receipt) | agree | Both numbers sit inside §4's `For example:` specimen response and its HTML body ("I only allow 50 requests per hour…"). The normative sentence is "MAY include a Retry-After header", with no number. Promoting specimen values to thresholds would source the author's choice, so criterion 80 is applied correctly. |
| ScribeRowsGitHubLimits D5 (`GITHUB_TOKEN` 1,000 requests per hour per repository) | reject | the same live S121 page | agree | The sentence is present, but under the heading "Primary rate limit for GITHUB_TOKEN in GitHub Actions" ("authenticate requests in GitHub Actions workflows"). A journey driver outside Actions never holds that token, so the row is out of province. The reason was recorded at drafting ("Actions-only"). |

New-row quote check:
- S120's Gate quote "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request." is 25 words (≤25) and occurs once in the live RFC 6585 text, immediately before the `For example:` specimen.
- S122's Gate quote "Otherwise, wait for at least one minute before retrying." is 9 words and is present live. The same sentence also appears on the S121 page, which explains the lane's choice to keep the one-minute row once, under S121 (D6).

## Trends

- Expansion: **improved**.
  - One admitted entry stands on ground the corpus did not hold: sourced numeric thresholds for the driver's next action, where before the lane held signal vocabulary only.
  - It cites 3 `mined` rows opened this round whose `used-by` names it.
  - The "Rate/ToS surface" frontier row advances as an appended restatement (`corpus/README.md:685`, `:690-694`).
- Quality: **improved**.
  - 9 stale tally statements and the `SKILL.md:1559` word-numeral tally are corrected append-only.
  - The S119 date error and every a2w1 prose or record defect carry appended errata.
  - No admitted entry failed its closure re-check: 13/13 quotes were located in receipts and live, and the RFC bytes are byte-identical.
- Discernment: **improved**.
  - The outside sample agrees with the gate on 2 admits and 2 rejects.
  - Round-30 routed defects 1–2 became the `:1523` correction and counter v2. Defects 3–4 are carried, declared "not claimed".
  - The disagreement between criterion 81 and the counter became lesson M11 and criterion 82, which supersedes 81's unenforced clause. Its red state is the committed `a2w1/RevQuality/probe2.json`.

## Routed defects (tabi, next round)

1. Calibration counter v3 (`check-selfassessment.mjs`). It should read word-numeral and `cli_cases=` tallies, refuse a failed self-test's summary as an oracle (M11), and kill the merged two-bullet correction survivor (a2w1 MutC2Corrections, 6/7 killed). This is planned in SCORECARD round 31.
2. Decision-table counter v2 (`check-decision-table.mjs`). It should count distinct (source, quote) pairs and locate the unit and bound word in the quote (M10, w1 CritC1Axis/CritC1Counter). This is planned.
3. S119 anchor "RFC 9309 (June 2022)": append the superseding row (bytes say September 2022) as planned for round 32. Align the entry's `recheck: 180d` with the registry's `365d`, or state which one governs (entry §Errata).
4. 27 w1 findings carried in `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` stay on the queue until each lands or is refused with a reason.
5. Future control captures should record a revision that resolves in the lane repo, or commit the fixture tree digest. Today's control JSONs name scratch-clone commits (lesson `:292`).
6. Round-30 routed defects 3 (counter v2 for `check-gate-mutants.mjs` and `check-frontier-admission.mjs`) and 4 (release-pin counter v2) remain carried as "not claimed".
7. Scratch hygiene: five a2w1 seats left about 145 MB each under `/fast/scratch/hyaku/tabi-r31/` (removed by the L1 after landing). Seat prompts should require cleanup.

## Operator note (SHONEN)

Boxes 1, 2 and 4 carry resolvable repo pointers that a non-author can check:
- `SKILL.md:697` approval table, `:1598-1617`, and the new D1–D13 sourced-threshold table
- `corpus/knowledge/multi-step-journey.md` §1–§2 and §7
- `PROVINCE.md:3-19`, unchanged

Box 3 still rests on lane-dispatched executor seats (`executor-test-sufficiency.md` §0, §4), so it needs a non-author executor run. Promotion is operator-owned, and no `[x]` was written.
