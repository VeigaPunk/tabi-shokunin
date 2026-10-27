# Round 34 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 34. Before `15dfaccb34601c2d221c78501e2befd8998d600c` → after `71a873055ad7627ea4495ce554ff8bfb03513d74`. Claims were measured at
`b44b964d1044996ed08f1079916592065dee3094`, and the freeze is `59f1b47aae277e1670e4a824173da8cde7e388ee`.
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1550 and 1561 when read):
`2026-10-26T16:23:03-03:00 launch tabi round=34 pgid=3980957 driver=hyaku-inline attempt=1`;
`2026-10-26T17:36:34-03:00 complete tabi round=34; hyaku-inline attempt=1`.

**Verdict: rejected-honest-stop.** C1 (adjacency) misses its frozen target, newMapped ≥ 3, at 1. C2 (operability) is met. No axis is harmed.

## Conformance

- **Report.** `.ufo/reports/round-34/tabi.md`: `git log --format='%an %H' -- <report>` → `tabi-shokunin 2904a67800813bd6d45b2d5da1f63fc09b7858f9`.
  - The commit's committer date is 17:35:42-03:00. That is after the last lane commit (`71a87305`, 17:34:22) and before the completion line (17:36:34).
  - Its author date is 17:07:10, which is earlier than `04f9623d`, `b44b964d` and `71a87305`. This is the jj change-creation stamp. The bytes landed at 17:35:42, so the report was not filed before its commits. Recorded as an observation only.
  - The `SHONEN` heading is present, with 4 lines for the 4 boxes. All four are `[~]`.
- **Cited commits.** All 5 resolve, and `git merge-base --is-ancestor <hash> master` exits 0 for each: `15dfaccb`, `59f1b47a`, `04f9623d`, `b44b964d`, `71a87305`.
  - All four round commits are authored and committed by `tabi-shokunin`.
- **Lane state.** `scripts/hyaku/jj-lane.sh state` printed: `branch=master local=remote=71a87305… ahead=0 behind=0 head=detached tracked=0 untracked=0`. `git status --porcelain` is empty.
- **Prompt.** `.ufo/prompts/tabi-round-34.md` was committed as `0929a340` by `tabi-shokunin` at 16:23:01, before launch at 16:23:03.
  - `diff` of prompt lines 1–140 against `kimi-shokunin/templates/round-prompt.md` (140 lines) shows only `{{LANE}}`/`{{ROUND}}`/`{{FLEET_ROOT}}`/`{{AXES}}` substitutions. The full template contract is present: §1–§5 and all five child-lane items.
  - The §6 hyaku addendum and §7 scratch discipline follow.
  - The prompt quotes no L2 route map (`grep -ciE 'route map|bucket'` prints 0).
- **Waves.**
  - `w1-results.json`: 37 seats, 37 non-empty outputs (scribe 18, critic 4, scout 4, executor 3, connector 3, reviewer 2, mutation-tester 2, sentinel 1).
  - `w2-results.json`: 39 seats, 39 non-empty outputs (critic 17, reviewer 10, scout 4, executor 3, mutation-tester 2, connector 2, sentinel 1).
  - Total 76. No `"model"` key in either file. All of this matches the report.
- **Step-1 defects.** None bear on status. One observation: the frozen `noHarmRule` permits relabels of round-33 ledger rows kake 396/422/440 only. However, `git diff 15dfaccb 71a87305 -- corpus/adjacency-screen.tsv` also changes the kake:411 row. That change is in the note column only. It was routed item 5 (CritScreenCrawlerSplit), and the lesson lists it in §Errata intake 5. I find no harm.

## Claim re-checks

No lane gate or counter was executed (Gate standard, Closure consequence):
- C1 was **re-measured** with my own Python parse of committed bytes, using `git show <rev>:…` in the lane and in each sibling at the pinned commit.
- C2 was **evidence-verified** from its committed receipts, with plain sha256, grep and jq checks on the gate bytes.

The frozen bytes are identical at the freeze and at HEAD, and each equals its `claims.json` `frozenDigests` value (sha256 prefixes):

| File | sha256 prefix |
|---|---|
| `counters/c1-adjacency-sweep-v2.mjs` | `0dba816ccab0b7bf` |
| `counters/c2-gate-mutants.mjs` | `3cf5eb699934eae4` |
| `baseline/controls.mjs` | `18c95d673c55f3d3` |
| `measure.sh` | `0a11973daf308e6f` |

`scripts/check-adjacency.mjs` is `4e2c2a64b9eae9c1` at `15dfaccb`, `59f1b47a`, `04f9623d`, `b44b964d` and `71a87305`, which equals the pin. `measure/provenance-b44b964.txt` records porcelain 0, matching digests, and gate mode 100755.

### C1 adjacency — sibling ground outside PROVINCE (target missed: honest stop)

**Command (closure, Python over `git show`).** It implements the counter's documented semantics: the header at `c1-adjacency-sweep-v2.mjs:34-51` and `evaluate()` at `:207-279`.
- Candidates: `baseline/c1-candidates.tsv` has 67 lines (A 38, B 29) and 67 unique keys.
  - 67/67 candidate texts equal `git -C <sibling> show <pin>:<path>` line N after trimming.
- **Mapped:** a map row whose `sibling_ref` line text (at its own pin, not `PROVINCE.md`) equals the candidate's (lane, path, trimmed text).
- **Screened:** an exact-key row in `corpus/adjacency-screen-skill.tsv` whose quote is a substring of the candidate text.
- **newMapped:** a row whose key is absent at the baseline, that maps a candidate, and that has a new `tabi_ref` line containing a `tabi_quote` which names the sibling. Its disposition must be ruled, contested-open or refused-route, or split-declared with a `sibling_quote` naming tabi.
- I did not re-run `check-adjacency`. Its verdict (clean, 16/16 at `b44b964d`) is evidence-verified from `measure/c1-at-b44b964.json`.

**Observed:**

| rev | map rows | screen rows | mapped | screened | unaccounted | newMapped | screen reasons |
|---|---|---|---|---|---|---|---|
| `15dfaccb` | 13 | 0 | 1 | 0 | 66 | 0 | — |
| `04f9623d` (w1) | 17 | 62 | 5 | 62 | 0 | 4 (rows 15–18) | same-surface 35, third-lane-report 23, no-claim-declared 3, not-browser-sense 1 |
| `b44b964d` (measured) | 16 | 63 | 4 | 63 | 0 | 1 (row 15 kake lab-performance) | same-surface 29, third-lane-report 30, no-claim-declared 4 |
| `71a87305` (HEAD) | 16 | 63 | 4 | 63 | 0 | 1 | same as `b44b964d` |

- Screen findings: 0 at every revision. Duplicate screen keys: 0. Screens on non-candidates: 0.
- At `b44b964d`, new rows 16 and 17 (kaidoku HAR and screenshot pair-compare) map candidates and carry new tabi lines (`SKILL.md:2958`, `:2959`). They are not counted, because their `sibling_quote` does not name tabi. That matches the report's disclosure.
- **Reported values match:** before 67/1/0/66/0, after 67/4/63/0/1 (`measure/c1-at-b44b964.json`, predicate false). The w1 reading of newMapped 4 also reproduces.
- **Ruling:** the claim did not verify (newMapped 1 < 3). The stop is honest: wave 2 withdrew three integrator admits on findings I re-opened and agree with (below), and none was kept against a finding. Axis grade: **unchanged** (8 → 8).
  - No harm: the map is 13 → 16 rows and clean. Sweep unaccounted is 66 → 0. The round-33 C1 counter at `b44b964d` reads unaccounted 0 and screenFindings `[]` (`measure/r33c1-at-b44b964.json`).

### C2 operability — the gate's own self-test kills the 20 frozen mutants (met)

**Evidence verified:**

| | `baseline/c2-J1-do-nothing.json` (`15dfaccb`) | `measure/c2-at-b44b964.json` |
|---|---|---|
| gate sha256 | `eded1be04a47fbd2` | `370e8e95417e16dd` (= gate at `b44b964d` and `71a87305`, my `sha256sum`) |
| killed / survivors | 8 / M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19 | 20 / none (each of M01, M01b, M02–M19 killed with exit 3) |
| unappliable / twinsFailing | none / none | none / none |
| pristine / neutral / decoy exit | 0 / 0 / 0 | 0 / 0 / 0 |
| self-test line | `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44` | `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56` |
| round-33 battery | true | true |
| predicate | false | true |

**Plain checks (closure):**
- `git show b44b964d:scripts/check-bidi-runtime.mjs | grep -oE 'v3-[ab]-[A-Za-z0-9-]+' | sort -u` finds 12 mutant-named cases: `v3-a-m01/m03/m06/m08/m09/m10`, `v3-b-m04/m05/m07/m16/m18/m19`. It also finds 2 helper ids, `v3-a-context` and `v3-a-session`. The 44 → 56 tally adds up.
- `detailIncludes` occurs 8 times.
- Gate numstat `15dfaccb..b44b964d` is +62/−7. The 7 removed lines are fixture helper signatures and the case-result record. No rule line was removed, consistent with w2 RevSelftestCodeRead `rule-lines-identical.tsv`.
- The registry home is updated: `SKILL.md:2943-2946` and `SCORECARD.md:1889-1892` supersede the stale 44/44 tallies append-only.
- The entry `corpus/knowledge/bidi-gate-selftest-round-34.md` opens with `source:` (S127, S125, S130–S132), `verified-at:` and `recheck:`.

**Disclosed limits (accepted as limits, not predicate failures):**
- The whitespace-normalised self-sniff residual (CritC2Counter K1–K3).
- 9 of 10 counter mutants are unguarded (MutC2Counter).
- The symlink write path (SentinelCounters F1). Its mitigation is recorded: the gate mode at the measured revision is 100755.
- M04/M05/M06 are killed only through the printed detail.

Axis grade: **improved**. The claim verifies, and the score holds at 9.

### Other axes and no-harm

- `git diff --numstat 15dfaccb 71a87305` shows 0 deletions in `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/adjacency.tsv`, `corpus/knowledge/*` and `corpus/lessons/*`.
  - The only deletions are `scripts/check-bidi-runtime.mjs` (+62/−7, the C2 surface) and the routed relabel in `corpus/adjacency-screen.tsv` (4/4).
  - `PROVINCE.md` and `SHONEN.md` are untouched.
  - The `SCORECARD.md` diff is 69 added lines and 0 removed. `## Round 34 — executed disposition` records the values above, with adjacency 8 → 8 and operability 9 (met).
- `measure/noharm-at-b44b964.txt` has 28 `exit=0` lines and 0 others; the baseline file has 28/0. `measure/selfassessment-at-b44b964.json` reads mismatches 0. The `check-selfassessment.mjs` sha is unchanged (`77b5c8ed`).
- Census (closure run): `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit 0, 20 W04. All 20 are pre-existing rows S058–S123; none is a new row.
  - Rows 129 → 133 (`grep -cE '^\| *S[0-9]{3,} *\|'` at `15dfaccb` and HEAD).
  - S130/S131/S132 are `mined` and `90d`, with used-by `corpus/knowledge/bidi-gate-selftest-round-34.md`. S133 is `mined` and `90d`, with used-by `corpus/lessons/round-34.md`.

## Axis verdicts

| axis | verdict | basis |
|---|---|---|
| adjacency | unchanged | C1 frozen predicate false (newMapped 1 < 3); score 8 → 8; map 13 → 16 rows clean, sweep 66 → 0 unaccounted |
| operability | improved | C2 met: self-test kills 8 → 20 of 20 frozen mutants, neutral/decoy/twins pass, self-test 44 → 56 |
| depth | unchanged | no claim; append-only, no-harm 28/28 |
| coverage | unchanged | no claim; append-only, no-harm 28/28 |
| freshness | unchanged | no claim; S128 superseded by S133 (re-opened byte-identical, below) |
| calibration | unchanged | no claim; selfassessment mismatches 0 at measured rev |

## Discernment spot-check

I re-opened the sources at closure, 2026-10-26T20:39Z. Gitiles fetches used `?format=TEXT` and were base64-decoded. All returned HTTP 200 on the first try.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S130 Chromium `base/token.cc` | admit | `…/154.0.8037.97/base/token.cc?format=TEXT`: raw 2,992 B `36deab71f228db91…`, decoded 2,243 B `6ef1fc2bddf044f5…` | agree | The bytes equal the lesson's receipt. Line 35 is `return StringPrintf("%016" PRIX64 "%016" PRIX64, words_[0], words_[1]);` verbatim (7 words). Upper-case `PRIX64` grounds the 32-upper-hex target-id shape that the M08 case uses. |
| S131 chromium-bidi `CdpTargetManager.ts` | admit | `…/third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts?format=TEXT`: raw 20,140 B `f3483993a72e0953…`, decoded 15,104 B `cd435aa8cbbd0a1e…` | agree | Line 223 is `case 'page':`. Lines 245-247 are `BrowsingContextImpl.create(` / `targetInfo.targetId,` / `parentId,`, matching the row's anchor. Context id = targetId holds. Precision: the Gate quote also carries `// New context.` (line 244) and `userContext,` (line 248), outside its stated `245-247` locator (routed, low). |
| S132 ChromeDriver `commands.cc` | admit | `…/chrome/test/chromedriver/commands.cc?format=TEXT`: raw 20,924 B `4bc5d8dccea1bbbe…`, decoded 15,692 B `d546e257994f46e4…` | agree | Line 96 is `std::string new_id = GenerateId();` and line 110 is `session_thread_map->emplace(new_id, std::move(thread_info));`, both verbatim. There is no uniqueness check between them, as the row says. |
| S133 Arch PKGBUILD (supersedes S128) | admit | `gitlab.archlinux.org/…/raw/871c2ad9…/PKGBUILD`: HTTP 200, 18,285 B, sha256 `a6fd458b70bc4aa4…` | agree | Line 12 is `_launcher_ver=8` and line 13 is `_manual_clone=1`, so the `:13` → `:12` locator correction is right. The sha equals the row's. |
| map row 15 `lab-performance-tool-runs` (kake) | admit | `git -C kake-shokunin show 04404859…:SKILL.md` line 697; tabi `SKILL.md:2922` at `71a87305` | agree | The kake line reads "Use it to guide a fix; give no Core Web Vitals verdict (S036). Running the tool is tabi's work." The sibling states its own side of the split, which satisfies criterion 97. The tabi side keeps CWV thresholds and the field verdict with kake. It is a new boundary, not a re-key of row 12. |
| map row 16 `recorded-har-producer-channel` (kaidoku) | admit (restored from L1 screen by w2) | `git -C kaidoku-shokunin show fa6a8a3f…:corpus/knowledge/2026-10-14-r10-01-queue-ops.md` lines 1-8, 148-151 | agree | The entry is kaidoku's `inspect-web-network-capture` on a real Chromium HAR. Line 151 reads "any har-schema-valid capture", which playwright's recordHar satisfies. A recorded-HAR artifact is shared evidence ground. The L1's `cdp-runtime-observation` screen was wrong because the file has no CDP subject. The counter honestly does not count the row, since the kaidoku quote does not name tabi. |
| withdrawn row 17 `agent-facing-tool-text-craft` (kotoba census49:171) | reject (withdrawn in w2; screened `third-lane-report`) | `git -C kotoba-shokunin show 65a5c7a6…:corpus/knowledge/sibling-overlap-census-round49.md` lines 84-87, 169-176 | agree | Line 86 rules kotoba–tabi as `none`. Lines 171-175 describe tabi's own round-16 draft, and say it "never reached tabi's scope surfaces, so the row stays `none`". The sibling states no side. Mapping it would make tabi's own draft the sibling evidence. |
| withdrawn row 18 `authenticated-consequential-driving` (kasegi mission-control:119) | reject (withdrawn in w2; screened `third-lane-report`) | `git -C kasegi-shokunin show 9a10b02f…:corpus/knowledge/mission-control.md` lines 1-12, 117-121; `PROVINCE.md:52`; `ls-tree` | agree | Line 119 records the bounty-hunter fleet's `fleets/claimer-mission.md`. That file does not exist in kasegi (`ls-tree … | grep -c claimer-mission` → 0). kasegi `PROVINCE.md:52` reads "Live-target testing is refused; this corpus is documentation only." This is a third-lane record. The CDP-9222 ground is already the contested lease row. |
| draft "S131" W3C BiDi §4 and draft "S132" WebDriver §Sessions | reject (duplicate URL) | `w3.org/TR/2026/WD-webdriver-bidi-20261008/` HTTP 200, 4,235,856 B `dc1077db50fe7844…`; `w3.org/TR/2026/WD-webdriver2-20260702/` HTTP 200, 1,882,653 B `929f2f0be15b73b0…` | agree | Both byte counts and shas equal ScoutSessionBinding's receipts. The quotes are present: bidi HTML 1873-1874 "concatenating the string "/session/" with session's session ID", and webdriver2 2588-2590 "the string representation of a UUID". S124 carries the BiDi URL. S126's row cites `WD-webdriver2-20260702` (`grep -c` → 1), so both documents are already registered, and a second row would be a census duplicate. |

`corpus/SOURCES.md` new row re-opened: S130 (above). Its ≤25-word Gate quote is verbatim at `token.cc:35`, and the anchor names the tag and commit. S131–S133 were also re-opened.

**Result: 6 admits and 3 rejects sampled, all agree.** The round's own gate disagreement — wave 2 overturning three integrator admits and two L1 screens — became lesson M5 and QUALITY criterion 97. Its red state is rows 17/18 at `04f9623d`, where newMapped was 4.

## Trends

- **expansion: improved.**
  - One admitted knowledge entry on ground the coverage map did not hold: `corpus/knowledge/bidi-gate-selftest-round-34.md`, BiDi gate rule coverage, which is a new `corpus/README.md` frontier row. Its `source:` cites S130–S132. These are `mined` rows opened this round and re-opened above.
  - Three new sibling boundaries in `adjacency.tsv` (kake lab performance; kaidoku HAR and screenshot compare).
  - A 63-row screen ledger bounds sibling ground outside PROVINCE.
- **quality: improved.**
  - S128 is superseded by S133, whose corrected locator re-opens byte-identical.
  - Round-32/33 errata landed append-only (`webdriver-bidi-runtime-round-32.md`, `LOG.md`, `lessons/round-32.md`).
  - Stale self-test tallies are superseded in `SKILL.md` and `SCORECARD.md`, and the three withdrawn declarations are marked at `SKILL.md` §wave-2 corrections.
  - No admitted entry failed its closure re-check.
  - One unmarked stale index line is routed below (defect 1). It is not a falsified entry.
- **discernment: improved.** The non-author spot-check agrees with the gate on 6 admits and 3 rejects. The in-round disagreement became a grounded criterion (97, lesson M5), with a red state.

## Routed defects (tabi, next round)

1. **Corrections sweep (Evidence standard).** `corpus/README.md:794` still reads "four new map rows", and `:799` still reads "`adjacency.tsv` rows 15–18". The final map has three new rows (15–17: kake lab-performance, kaidoku HAR, kaidoku screenshot compare), and w1 rows 15/17/18 were withdrawn. Append a correction naming both lines.
2. **Adjacency (carried claim, third consecutive miss).**
   - Before any target is set, amend the C1 counter so it refuses a split row whose sibling line does not state the sibling's side (QUALITY 97).
   - Add controls for the 9 of 12 unguarded C1 counter clauses (MutC1Counter).
   - Sweep browser-ground lines in sibling knowledge that neither name tabi nor were leads (the SCORECARD planned row).
3. **C2 counter amendment.**
   - `lstat` refusal on the gate write path and a scrubbed HOME (SentinelCounters F1).
   - Controls for the 9 of 10 unguarded counter mutants (MutC2Counter).
   - The whitespace-normalised self-sniff residual (CritC2Counter K1–K3).
4. **Round-33 w2 undisposed findings U01–U28** (ScribeMistakeSweep). All stay open for round 35, per the lesson's §Mistakes sweep. Give each a disposition.
5. **S125 recheck cadence.** The `on-release` proposal (ScribeS125Cadence) is still routed. Land it as a row change logged old→new, or record why `90d` stays.
6. **Precision (low).**
   - The S131 Gate quote spans lines 244-248 but is located `245-247`.
   - The frozen `noHarmRule` named only kake 396/422/440, while the relabel also touched the kake:411 note (routed item, listed). Name every routed cell in the next freeze.
   - Report §Trend "source drafts refused as duplicate URLs" also covers RFC 4122, which was refused as not needed, not as a duplicate.
7. **Calibration counter v4.** Still carried since round 32 (`claims.json:notClaimed[0]`).
8. **M1 misroot.** The wave label leaked into seat output paths in w1. Keep the w2 fix (path built from the wave id) in the dispatch template.

## Operator note (SHONEN)

All four boxes are `[~]` in the report. A non-author can check each one from committed artifacts:
- SKILL decision tables and registry rows: `SKILL.md:2926-2946`.
- End-to-end task: the frozen mutant counter run, `measure/c2-at-b44b964.json`.
- Executable without oral context: this closure re-derived C1 from committed TSVs and lane text alone, and matched the counter's numbers at four revisions.
- No bleed: `PROVINCE.md` is unchanged, and three overreaching rows were withdrawn rather than absorbed.

Promotion is operator-owned. Nothing here writes `[x]`.
