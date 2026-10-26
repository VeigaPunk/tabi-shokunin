# Round 30 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 30. Before `f7c0317e4f8445502005e79e3d65767430912dab` → after `66171034636cad5be49b479c98355bd944919b51`.
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1484 and 1500 when read):
`2026-10-26T03:00:44-03:00 launch tabi round=30 pgid=486597 driver=hyaku-inline attempt=1`;
`2026-10-26T05:03:53-03:00 complete tabi round=30; hyaku-inline attempt=1`.

## Conformance

- Report `.ufo/reports/round-30/tabi.md`: committed by `tabi-shokunin <tabi@shokunin.local>` in fleet commit `ca815bbcebe42559c8d31d3f43041888f0fc656d` (2026-10-26 05:03:20 -0300). That is after the last lane commit (`6617103`, 05:02:09) and before the driver's completion line (05:03:53). The report has a `## SHONEN` heading with 4 `[~]` lines, and `SHONEN.md` has 4 boxes (`grep -c '^\s*- \['` → 4).
- Cited hashes: the baseline plus the 8 round commits (`061e6202`, `38891ca0`, `072af95f`, `af0664ed`, `e8720bcf`, `0ffc6ea0`, `d3cd62a1`, `66171034`). For each one, `git cat-file -t` → `commit` and `git merge-base --is-ancestor <hash> master` holds. `git log f7c0317e..66171034` shows 8 commits, all authored by `tabi-shokunin`.
- `scripts/hyaku/jj-lane.sh state` → `branch=master local=66171034… remote=66171034… ahead=0 behind=0 head=detached tracked=0 untracked=0`. `git status --porcelain` printed 0 lines. `git ls-remote origin refs/heads/master` → `66171034…`.
- Prompt `.ufo/prompts/tabi-round-30.md` (fleet commit `d23911b6`, 03:00:42): `diff` of lines 1–140 against `kimi-shokunin/templates/round-prompt.md` shows only `{{…}}` placeholder substitutions (lines 1, 5–6, 46, 61, 65, 69, 101, 133, 135, 139). §1–§5 are intact and are followed by hyaku addendum §6 and scratch §7.
- Wave accounting: `w1-results.json` has seats=32 and 32 results; `w2-results.json` has seats=34 and 34 results. Every `.results[].name` has a `w1/<name>.md` or `w2/<name>.md` (a loop found none missing). `w1-validate.stderr` and `w2-validate.stderr` are 0 bytes each. Roles per wave match the report (w1: 9 scribe, 7 executor, 5 critic, 3 reviewer, 3 connector, 2 mutation-tester, 2 scout, 1 sentinel; w2: 12 critic, 10 reviewer, 6 executor, 2 connector, 2 scribe, 1 mutation-tester, 1 sentinel).
- Census at closure: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exited 0 with `tabi ok` and 19 W04 lines. Its stdout is byte-identical to the committed `.ufo/waves/round-30/measure/census-end.txt` apart from that capture's trailing `exit=0` line. The start capture has 18 W04; the new one is S118, a duplicate URL across scopes.
- Step-1 defects (status-neutral): none.

## Claim re-checks

Gate standard (Closure consequence) applies. Both claims rest on lane-owned counters (`check-gate-mutants.mjs`, `check-frontier-admission.mjs`), and I executed no lane script. Both claims are **evidence-verified**: I checked the committed counter outputs, the frozen digests and the revision each output was measured at. Both are also **re-measured** by plain counts over committed bytes, and C2 by an independent live refetch.

### C1 operability — gate self-test kill coverage (fault_survivors 14 → 0 of 27, benign_killed 0 → 0 of 13)

- Frozen digests. `git show <rev>:<path> | sha256sum` gives:
  - `scripts/check-gate-mutants.mjs` = `02945f88…3a55`
  - `scripts/gate-mutants.json` = `cd1c27a2…3833`
  - `scripts/check-frontier-admission.mjs` = `cadef57e…9eca`

  All three are identical at `061e6202` (freeze), `d3cd62a1` (measured) and `66171034` (tip), and match `claims.json` `frozenDigests`. `git diff --name-only d3cd62a1 66171034` lists only `.ufo/waves/round-30/` paths, and 0 lines fall outside it.
- Catalogue (plain `jq`): 40 mutants, `fault=27 benign=13`.
- Production lines byte-identical. I loaded every mutant's `find` string and counted its occurrences in the gate script, with a plain node split-count:
  - At `061e6202`, 40/40 occur exactly once.
  - At `d3cd62a1`, 40/40 occur exactly once.
  - `git diff -U0 061e6202 d3cd62a1 -- <two gates>` touches only the self-test region:
    - s106: the header comment 7→10, two new fixtures after `FIXTURE_SHA`, and CASES +46.
    - release-pins: CASES +80, the `runSelftest` reason assertion, and the selftest print line.
- Case counts (plain `awk` over the `CASES` array):
  - s106: 7 → 10 rows.
  - release-pins: 20 → 29 rows.

  These equal the pristine tallies in the counter JSON (`gates[].cases/passed`: 7/7 and 20/20 → 10/10 and 29/29) and the SKILL.md round-30 registry rows (`cases=10`, `cases=29`).
- Committed counter readings:
  - `measure/c1-before-at-freeze.json`: rev `061e6202…`, fault_survivors 14 of 27, with the 14 survivors listed as in `claims.json`; benign_killed 0 of 13.
  - `measure/c1-after-at-d3cd62a.json`: rev `d3cd62a1…`; `counter_sha256_at_rev` and `counter_sha256_running` are both `02945f88…`; fault_survivors 0 of 27, benign_killed 0 of 13, survivors `[]`.
  - `measured-provenance-d3cd62a.txt`: `porcelain=0`, `c1 exit=0`.
- Identity-leak disclosure (w1 CritC1Counter):
  - `measure/c1-identity-blind-harness.diff` changes exactly one thing: `join(work, runId)` becomes a random 8-byte hex directory.
  - Under it, `c1-identity-blind-at-072af95.json` reads 0/27 and 0/13.
  - `git diff --stat 38891ca0 d3cd62a1 -- scripts/` is empty, so that reading carries to the measured revision.
  - Neither gate contains a catalogue mutant id (`grep -cE <40 ids>` → 0 and 0). The only path-derived line in either gate (`const LANE = …import.meta.url`) predates the round.
- Disclosed residuals stand: the `pins-f3-bytes-absent` kill is a self-test abort, and the runner change goes beyond the implementer note. Neither touches a catalogued line, so neither breaches the frozen kill rule.
- **Verdict: improved** (verifies under the frozen rule; operability score stays 8 in SCORECARD).

### C2 coverage — rate/ToS frontier admission (population 0 → 2, admitted 0 → 2, `--live`)

- Tagged entries (`git grep -l -E '^frontier:\s*rate-tos-signal' <rev> -- corpus/knowledge | wc -l`): 0 at `f7c0317e`, 0 at `061e6202`, 2 at `d3cd62a1` (`rate-limit-policy-fields.md:6`, `host-published-rate-limit-headers.md:6`). Each entry opens with `source:` (S116 or S117 with URL and anchor), `verified-at:` and `recheck:`.
- Rows (CORPUS census commands):
  - Rows 115 → 118.
  - Status histogram goes from mined=87 queued=19 rejected=9 to mined=94 queued=15 rejected=9.
  - S116 is `spec`/A, S117 `docs`/A and S118 `code`/A. All three are `mined`, opened 2026-10-26, NF=13.
  - S116 and S117 each list their entry in `used-by`.
- In-place SOURCES changes:
  - Diffing the rows by id between `f7c0317e` and `66171034` gives 3 new rows, 19 rows changed only in col 12 (`used-by`) and 4 changed in cols 9+12 (status+used-by).
  - No other column moved. That fits contract rule 2 and the lesson's §used-by changes (23 appends, 4 queued→mined).
- Receipts:
  - `sha256(bytes/S116.txt)` = `d6016dd0…d412` (67097 B), which equals `S116.json` and the row anchor. The refetch bytes are byte-identical.
  - `sha256(bytes/S117.html)` = `b73dc7d1…83c3` (408912 B), which equals `S117.json`. The refetch differs in raw bytes but has the same length; the report and lesson disclose this.
  - Each receipt's `fetched_by` (FetchS159, FetchS182) differs from its refetch seat.
- Entry quotes (plain Python, whitespace-normalised, tags stripped and entities unescaped for HTML): every double-quoted span of ≥4 words in the two entries is located in its cited receipt bytes. That is 22/22 for `rate-limit-policy-fields.md` against S116 and 14/14 for `host-published-rate-limit-headers.md` against S117.
- **Independent live refetch at closure** (my own curl, not the counter's `--live`, so the disclosed `file://`/redirect/`~/.curlrc` holes are bypassed):
  - The S116 URL returns HTTP 200, 67097 B, sha256 `d6016dd0…d412`, byte-identical to the receipt. The Gate quote appears once (line 308).
  - `-12.txt` returns 404, which confirms the row's `-11` pin.
  - The S117 URL returns HTTP 200, 408912 B. The Gate quote appears in the tag-stripped text, and the preceding sentence reads "Routes for controlling emojis do not follow the normal rate limit conventions. These routes are specifically …". That confirms the entry's re-scoping of the per-guild caveat to emoji routes.
- Committed counter readings:
  - `measure/c2-before-at-freeze.json`: population 0, admitted 0.
  - `measure/c2-after-live-at-d3cd62a.json`: `live: true`, population 2, admitted 2, failing 0.
  - The offline reading is 2/2. `measured-provenance-d3cd62a.txt`: `c2 live exit=0`.
- Uncovered ground: `git grep -l -E 'RateLimit-Policy|X-RateLimit' <rev> -- corpus/knowledge | wc -l` gives 0 at `f7c0317e` and 2 at `66171034`. The README frontier row moves from "open" to "docs-held … runtime open" as an appended restatement, so the old row keeps its bytes.
- **Verdict: improved** (verifies; also re-measured independently of the counter's `--live` path).

### Other axes and no-harm

- `git diff --numstat f7c0317e 66171034`: SCORECARD +57/−0, LOG +37/−0, SKILL +16/−0, QUALITY +55/−0, README +31/−0, round-29 lesson +13/−0. Every knowledge-file change is an addition. `SHONEN.md` and `PROVINCE.md` are unchanged (`git diff --quiet` holds).
- `measure/noharm-at-d3cd62a.txt` (committed evidence):
  - gate-registry nonconformant 0 (36 rows, 20 gates)
  - release-pins 23/23 resolved
  - s106 `valid=true`
  - SOURCES gate clean
  - `check-selfassessment` mismatches **1**: `SCORECARD.md:1527` claimed 12 vs observed 2.
- Rationale for the calibration ruling:
  - Committed self-test captures read `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12` (`baseline/c1-counter-selftest.txt:13`, `measure/noharm-at-0ffc6ea.txt:160`). The counter digest is unchanged from freeze to tip, so the 12/12 tally the counter flags is true.
  - The finding is an instrument misread. `w1/ExecNoHarmBaseline/matrix-raw.tsv:7` shows `cases=2 passed=1` from a per-case refusal message printed before the summary line.
  - However, `SCORECARD.md:1523` (blame `0ffc6ea`) still states "`check-selfassessment` mismatches 0 after the round-30 corrections above". The lane's own readings were 3 at `0ffc6ea` and 1 at `d3cd62a1`.
  - The appended correction at `SCORECARD.md:1554-1557`, the report and lesson M8 all state the residual. But no line cites `:1523` as superseded, which the lane's new criterion 78 requires.
  - I rule this a disclosed residual that is marked in the same document, not a false self-assessment of the lane's state: calibration is **unchanged**, and the line is routed below.

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| operability | improved | C1: frozen counter 14 → 0 of 27 fault survivors, 0 of 13 benign killed at `d3cd62a1`; digests frozen; 40/40 catalogued lines unchanged; self-test cases 7→10 and 20→29; identity-blind rerun 0/0 |
| coverage | improved | C2: tagged entries 0 → 2, rows S116/S117 mined and reciprocal, 36/36 entry quotes located in receipts; live refetch at closure byte-identical (S116) and quote present (S117) |
| depth | unchanged | no claim; existing entries changed only by appended notes |
| freshness | unchanged | no claim; S118 supersedes S044 (404 re-verified at closure), which counts under the quality trend |
| calibration | unchanged | no claim; one disclosed instrument-misread mismatch (12/12 true per committed self-test output); stale `SCORECARD.md:1523` "mismatches 0" sentence routed |
| adjacency | unchanged | `PROVINCE.md` unchanged; w1 ConnSiblings absorbed nothing |

**Admitted**: both claims verify and no axis is harmed.

## Discernment spot-check

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S116 IETF RateLimit header fields `-11` → `rate-limit-policy-fields.md` | admit | live `https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` → 200, 67097 B, sha256 `d6016dd0…d412` | agree | Byte-identical to the receipt. The 25-word Gate quote (`wc -w` = 25) is verbatim at line 308 (§3). `-12` returns 404, so the `-11` pin is the newest. All 22 quoted spans in the entry are located. The staged anchor's "-10 and later return 404" was rightly refused (M2). |
| S117 Discord Rate Limits → `host-published-rate-limit-headers.md` | admit | live `https://docs.discord.com/developers/topics/rate-limits` → 200, 408912 B | agree | The 25-word Gate quote is present in the tag-stripped text. The surrounding sentence scopes the per-guild limit to emoji routes, so the entry's correction of the package's whole-API generalisation is right. Tier A is scoped to "Discord's own published headers", not to observed behaviour, which is a legitimate scoping. |
| `merge/tabi/…/rate-and-tos-signal-vocabulary.md` (staged S106 RFC 9309, S110 RFC 6585) | reject | live `rfc9309.txt` → 200, 25265 B, sha256 `f633915d…b207`; live `rfc6585.txt` → 200, 17164 B, sha256 `f6d55d1b…6e58` (both equal to the round-27 quarantine fetch); register `shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` sha256 `5afe1810…d833` | agree | The register's recorded quotes are absent: `使用 WebMCP 時` and `確認 WebMCP 工具曝光度` give 0 hits in 9309; `Add hints to your tools`, `Expose your tools carefully` and `Last updated 2026-09-01 UTC` give 0 in 6585 (whitespace-normalised). The entry's paraphrase is substantively true (6585 does contain "too many requests in a given amount of time"), so this is a provenance reject, not a content reject. The flip condition (re-open in-round with a located quote and receipt) is the right one. |

New-row quote check:
- S118 (`code`/A): live `raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492…/front_end/models/web_mcp/WebMCPModel.ts` → 200, 8553 B, sha256 `c23d575e…b632`, equal to the anchor.
- Its Gate quote is lines 249–250 verbatim (8 words).
- The superseded S044 path `front_end/panels/application/WebMCPModel.ts` at the same commit → 404.
- Re-grounded round-29 quote S114: `executing_tool->CallDoneCallback(base::ok(String()));` is at line 867 of the committed 156 bytes, 1 occurrence.

## Trends

- Expansion: **improved**.
  - Two admitted entries stand on ground the corpus did not hold: 0 → 2 knowledge files carrying `RateLimit-Policy` or `X-RateLimit` vocabulary.
  - Each opens with the provenance trio and cites a `mined` row opened this round whose `used-by` names it.
  - The frontier item "Rate/ToS surface" advances from open to docs-held, as an appended restatement.
- Quality: **improved**.
  - S044's 404 anchor is superseded by S118, re-verified live.
  - The S110/S114/S115 Gate quotes are re-grounded; S114 was re-located at closure.
  - The chromium-156 errata (`:110-111` superseded by `:117-118`, the 9-line guard) are appended.
  - 23 `used-by` reciprocity appends and 4 status flips are logged.
  - 14 previously invisible gate checks are now seen by self-tests.
  - No admitted entry failed its closure re-check (36/36 quotes located).
- Discernment: **improved**.
  - The outside sample agrees with the gate on 2 admits and 1 reject.
  - Round-29 routed defects 1–6 each became a fix. Defect 7's self-test half became C1; its release-pins counter-v2 half is carried, declared "not claimed". Defects 1–5 also became QUALITY criteria 74–79, and each criterion cites its lesson: round-30 M1, M3 and M4, or `round-29-verifier-spotcheck.md`.
  - The round's own mistake mining keeps rows and subsections equal (`| M` rows 8 = `### M` subsections 8).
  - Post-freeze counter holes were disclosed, not hidden.

## Routed defects (tabi, next round)

1. `SCORECARD.md:1523` states "`check-selfassessment` mismatches 0 after the round-30 corrections above". The committed readings are 3 at `0ffc6ea0` and 1 at `d3cd62a1` (`measure/noharm-at-*.txt`). Append a correction that cites `SCORECARD.md:1523` by line, per the lane's criterion 78, stating the measured residual of 1 and its cause (M8).
2. The calibration counter v2 (`check-selfassessment.mjs`) should read a gate's summary `…_SELFTEST verdict=… cases=N passed=N` line, not the first `cases=` token (M8). Until it does, the `SCORECARD.md:1527` gate-mutants 12/12 finding stays a known false positive.
3. Counter v2 items the lane already planned (SCORECARD round-30 planned):
   - `check-gate-mutants.mjs`: opaque run directories, a minimal child env, killer attribution, and the w2 MutC1Beyond survivors in the catalogue.
   - `check-frontier-admission.mjs`: https-only, same-host redirects, `curl -q`, and evidence that refetches are independent.
   - `check-gate-mutants.mjs` also leaks an empty work dir on exit-2 refusals (w1 RevClaimsFreeze).
4. Release-pin counter v2 (id-set population, DEPS-pinned S044/S068 and successors) remains open, carried from round-29 routed defect 7 as "not claimed".

## Operator note (SHONEN)

Boxes 1, 2 and 4 carry resolvable repo pointers (`SKILL.md:697` approval table, `corpus/knowledge/multi-step-journey.md`, `PROVINCE.md:3-19`, unchanged) that a non-author can check. Box 3 still rests on lane-dispatched executor seats, so it needs a non-author executor run. Promotion is operator-owned, and no `[x]` was written.
