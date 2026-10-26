# Round 33 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 33. Before `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd` → after `6f4053dbdbddbed24f4515ff01a895b1038d2f37`. Claims were measured at
`0aa2281a4fe3df3d0e6d07f4cde6935e75de1fb7`, and the freeze is `e6b0a9074d434ccc307badd312ae7379d1193fea`.
Driver digest (`.ufo/watchdog.log`, copied at closure; lines 1535 and 1547 when read):
`2026-10-26T14:57:48-03:00 launch tabi round=33 pgid=81695 driver=hyaku-inline attempt=1`;
`2026-10-26T16:12:03-03:00 complete tabi round=33; hyaku-inline attempt=1`.

**Verdict: rejected-honest-stop.** C1 (adjacency) misses its frozen target, newMapped ≥ 4, at 3. C2 (operability) is met. No axis is harmed.

## Conformance

- **Report.** `.ufo/reports/round-33/tabi.md`: `git log --format='%an %H' -- <report>` → `tabi-shokunin e777db66a7b1fbe6ee7dabc0a2117ffe98d8b25c`, committed 16:11:33-03:00.
  - That is after the last lane commit (`6f4053db`, 16:10:06) and before the completion line (16:12:03).
  - The `SHONEN` heading is present, with 4 lines for the 4 boxes in `SHONEN.md`. All four are `[~]`.
- **Cited commits.** All 7 resolve, and `git merge-base --is-ancestor <hash> master` exits 0 for each: `b7d16fb8`, `e6b0a907`, `bf48b81c`, `042d6d9a`, `0aa2281a`, `9f008f6c`, `6f4053db`.
  - All six round commits are authored `tabi-shokunin <tabi@shokunin.local>`.
  - `git ls-remote origin refs/heads/master` → `6f4053dbdbddbed24f4515ff01a895b1038d2f37`.
- **Lane state.** `scripts/hyaku/jj-lane.sh state` → `branch=master local=remote=6f4053db… ahead=0 behind=0 head=detached tracked=0 untracked=0`, exit 0. `git status --porcelain` is empty.
- **Prompt.** `.ufo/prompts/tabi-round-33.md` was committed `82a68a01` by `tabi-shokunin` at 14:57:46, before launch. This is the same pattern as rounds 31 and 32: in hyaku-inline, the lane commits its dispatch evidence.
  - `diff` of prompt lines 1–140 against `kimi-shokunin/templates/round-prompt.md` shows only placeholder substitutions, so the full template contract is present: §1–§5 and all five child-lane items.
  - §6 hyaku addendum and §7 scratch discipline follow.
  - The prompt quotes no L2 route map (`grep -i 'route map|bucket'`: 0).
- **Waves.**
  - `w1-results.json`: 36 seats, 36 non-empty outputs (scribe 18, critic 5, executor 4, connector 3, reviewer 2, mutation-tester 2, sentinel 1, scout 1).
  - `w2-results.json`: 38 seats, 38 non-empty outputs (critic 21, reviewer 6, executor 5, mutation-tester 2, connector 2, scout 1, sentinel 1).
  - Total 74, inside the 64–100 band. No `"model"` key in either file.
  - The planner seat is held by the L1, as prompt §6 (orchestrator ruling 2026-10-19) requires.
- **Step-1 defects.** None that bear on status. Observations:
  - Two intermediate commits read `check-selfassessment` mismatches 1 (`bf48b81c`, `9f008f6c`). Each was corrected append-only in the next commit.
  - The c1-J3 control does not rebuild byte-exactly (M3 residual, disclosed).

## Claim re-checks

No lane gate or counter was executed (Gate standard, Closure consequence):
- C1 was **re-measured** with my own parse of the committed TSVs.
- C2 was **evidence-verified** from its committed receipts, plus plain grep and sha checks on the gate bytes.

The frozen bytes are identical at the freeze and at HEAD (sha256 prefixes):

| File | sha256 prefix |
|---|---|
| `counters/c1-adjacency-sweep.mjs` | `da59d157c29ce537` |
| `counters/c2-bidi-forgery-battery.mjs` | `51ace65fcece8e79` |
| `baseline/controls.mjs` | `2d0cf8416a35c244` |
| `measure.sh` | `ca6b830e1c9b6856` |

`scripts/check-adjacency.mjs` is `4e2c2a64b9eae9c1` at `b7d16fb8`, `0aa2281a` and `6f4053db`, which equals the pin. `provenance-0aa2281.txt` records porcelain 0 and matching digests.

### C1 adjacency — sweep of 52 sibling PROVINCE lines (target missed: honest stop)

**Command (closure, Python over `git show <rev>:…`).**
- Candidates: `.ufo/waves/round-33/baseline/c1-candidates.tsv` (52 lines, 52 unique `sibling@pin:path:line` keys).
- A candidate is **mapped** when a `corpus/adjacency.tsv` row for that sibling carries a `sibling_quote` that is a substring of the candidate line. This is the quote anchor, needed because rows 6 and 7 cite older kake pins whose lines moved from 30/35 to 34/39.
- A candidate is **screened** when its key appears in `corpus/adjacency-screen.tsv`.

**Observed:**

| rev | map rows | screen rows | mapped | screened | unaccounted | screen quote not in candidate line |
|---|---|---|---|---|---|---|
| `b7d16fb8` | 10 | 0 | 5 | 0 | 47 | — |
| `bf48b81c` | 14 | 43 | 9 | 43 | 0 | 0 |
| `0aa2281a` | 13 | 44 | 8 | 44 | 0 | 0 |
| `6f4053db` | 13 | 44 | 8 | 44 | 0 | 0 |

- Duplicate screen keys: 0. Screens on non-candidates: 0.
- Rows that are new against the baseline and map a candidate: kake `PROVINCE.md:61`, `:79`, `:304`. That gives **newMapped 3**. At `bf48b81c`, kake:347 was a fourth row; it was withdrawn in w2.
- Candidate provenance: 52/52 candidate lines equal `git -C <sibling> show <pin>:<path>` line N, up to leading indentation (kake:23 and kake:39 are indented two spaces in the source).
- New rows 12–14: the `sibling_quote` is present at the cited sibling pin line, and the `tabi_quote` is present at `SKILL.md:2887-2889` (3/3 each).
- **Reported values match:** before 52/5/0/47/0, after 52/8/44/0/3, adjacency rows 10 → 13 (`measure/c1-at-0aa2281.json`, predicate false).
- **Ruling:** the claim did not verify (newMapped 3 < 4). The withdrawal is honest. The fourth row was an L1 reversal of a w1 screen, and kake:347 names no lane (re-opened below). Keeping it would have met the target on an aimed row. Axis grade: **unchanged** (8 → 8).

### C2 operability — BiDi runtime gate v2 refuses the 8-construction forgery battery (met)

**Evidence verified:**

| | `baseline/measure-at-baseline/c2-at-b7d16fb.json` | `measure/c2-at-0aa2281.json` |
|---|---|---|
| F1–F8 | all exit 0, accepted | all exit 1, refused |
| Refusal reasons | — | F1/F3/F4/F5/F6 `t1-receipt`; F2 `x3-duplicate-id`; F7 `x4-measured-cell`; F8 `s1-source-row` |
| H0/H1/H2 | true (admitted 16, failing 0) | true (population 17, admitted 16, failing 0) |
| Self-test | `cases=27 passed=27` | `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44`, exit 0 |
| `digestLiterals` | `[]` | `[]` |
| Predicate | false | true |

**Plain checks (closure):**
- Gate sha256: `2f25af5a3c6326b9` at `b7d16fb8` (equal to the counter's `GOLDEN_GATE_SHA256`), `eded1be04a47fbd2` at `0aa2281a` and at `6f4053db`. The measured gate is the shipped gate.
- For each of the 5 `HONEST_DIGESTS` 12-hex prefixes in the frozen counter: `git show 6f4053db:scripts/check-bidi-runtime.mjs | tr A-F a-f | grep -c <prefix>` → 0, 0, 0, 0, 0.
- The registry row for the v2 gate exists at the lane's registry home. `SKILL.md:2907` supersedes the round-33 row at `:2817` (stated at `:2902`). The round-32 v1 row is at `:2626`.
- Live leg (no-harm only): `measure/c2-live-at-0aa2281.json` population 17, admitted 16, failing 0, binding null.

**Disclosed limits (accepted as limits, not predicate failures):**
- The battery can be met by a stub keyed on commit subjects (M7); w2 RevGateV2Code reads per-variant reasons.
- w2 MutGateV2: 11 of 20 mutants survive.
- CritForgeV2B/C survivors, recorded in v2 note §8.

Axis grade: **improved** (the score holds at 9, and the claim verifies).

### Other axes and no-harm

- `git diff --numstat b7d16fb8 6f4053db`: 0 deletions in each of `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/adjacency.tsv` and `corpus/knowledge/*`. The only deletions are in `scripts/check-bidi-runtime.mjs` (+481/−113), the file C2 declares it rewrites. `PROVINCE.md` and `SHONEN.md` are untouched.
- The `SCORECARD.md` diff is 159 added lines and 0 removed. It covers the round-33 declared claims, the wave-2 corrections, and `## Round 33 — executed disposition`, which records the same before → after values as above with adjacency 8 → 8 and operability 9 → 9.
- `measure/noharm-at-0aa2281.txt`: 28 `exit=0` lines, 0 nonzero. The baseline `noharm-at-b7d16fb.txt` is also 28/0. `measure/selfassessment-at-0aa2281.json` mismatches 0. `check-selfassessment.mjs` sha is unchanged (`77b5c8ed`).
- Census (closure run): `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit 0, 20 W04 (duplicate URL across scopes). All 20 are pre-existing rows S058–S123; none is a new row.
  - Rows 126 → 129 (`grep -cE '^\| *S[0-9]{3,} *\|'` at `b7d16fb8` and HEAD). Malformed rows 0.
  - S127/S128/S129 are `mined`, `90d`, used-by `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`. That path exists and opens with `source:`/`verified-at:`/`recheck:`.

## Axis verdicts

| axis | verdict | basis |
|---|---|---|
| adjacency | unchanged | C1 frozen predicate false (newMapped 3 < 4); score 8 → 8; map 10 → 13 rows clean, sweep 47 → 0 unaccounted |
| operability | improved | C2 met: forgeries accepted 8 → 0, honest 3/3 kept, self-test 44/44, 0 digest literals |
| depth | unchanged | no claim; append-only, no-harm 28/28 |
| coverage | unchanged | no claim; append-only, no-harm 28/28 |
| freshness | unchanged | no claim; S127, S129 and S128's `launcher.c` re-open byte-identical (below) |
| calibration | unchanged | no claim; selfassessment mismatches 0 at measured rev and HEAD (intermediate 1s corrected) |

## Discernment spot-check

I re-opened the sources at closure, 2026-10-26T19:16Z. Gitiles fetches used `?format=TEXT` and were base64-decoded. Two first fetches returned 503 and were retried after 8 s.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S127 ChromeDriver `GenerateId` | admit | `chromium.googlesource.com/…/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT` HTTP 200, raw 26,200 B sha256 `e3e0d00fb3d7a2b6…`, decoded 19,648 B `3ed654c7574c1dd9…` | agree | The bytes equal the row's anchors. Lines 39-43 hold `GenerateId()`, and line 42 is `return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb);` verbatim. The scope excludes uniqueness, as the row says. |
| S129 Linux sandbox README | admit | `…/sandbox/linux/README.md?format=TEXT` HTTP 200, raw 5,348 B `5a1ddc20bcfde734…`, decoded 4,009 B `01c033462774302a…`; `…/sandbox/policy/switches.cc` raw 4,268 B `a614c36721de60e7…` | agree | The quote "We also generally use multiple layers of sandboxing, to achieve both confinement for the process and reduction of the exposed kernel attack surface" is at decoded lines 21-22 (23 words, ≤25). In `switches.cc`, line 42 has "Disables the sandbox for all process types that are normally sandboxed", line 43 says testing only, and line 44 has `kNoSandbox`. The row's `42-44` is exact, and the Gate table's `42-43` spans the comment. Tier A `docs` is correct for the primary URL. |
| S128 chromium-launcher | admit | `raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb8…/launcher.c` HTTP 200, 3,546 B sha256 `b2772fe008deb15b…` | agree | Line 26 is `path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);` and line 124 is `return execv(CHROMIUM_BINARY, exec_args);`, both verbatim. The user flags-file vector grounds the live-leg HOME isolation. |
| map row 12 `js-rendering-browser-execution` | admit | `git -C kake-shokunin show 04404859…:PROVINCE.md` line 61 | agree | The line reads "JS-rendered-canonical frontier above remains open; browser execution stays tabi's". The sibling itself hands execution to tabi, so this is a real declared split. |
| map row 14 `accessibility-browser-at-execution` | admit (screen reversed by L1) | kake `PROVINCE.md:79-80` and `SKILL.md:559-560` at `04404859…` | agree | PROVINCE:79 does not name tabi, but kake SKILL:559-560 says "tabi receives authorized browser/AT evaluation". The overlap is real, and criterion 91 now requires the reversal to be recorded, as M6 did. The AT-execution overclaim on the tabi side is corrected in the SKILL wave-2 corrections. |
| kake:347 crawl budget | reject (row withdrawn in w2, re-screened `same-surface`) | kake `PROVINCE.md:344-348` at `04404859…` | agree | The lines read "the emergency backoff reduces the crawl rate across the whole hostname (S274). Publishing stays operator-owned". This is publisher-side crawl-budget knowledge. It names no lane and restates the mapped crawler split (row 6). |
| kengaku:54 | reject (`not-browser-sense`) | `git -C kengaku-shokunin show 7984fd30…:PROVINCE.md` lines 50-56 | agree | The context is the `telemetry_source=journal` bench-harness field and kumitate's failure taxonomy. "scraper outages" names a telemetry row class; no browser is driven and no crawl is described. |
| `docs/linux/sandboxing.md` | reject (404) | `…/154.0.8037.97/docs/linux/sandboxing.md?format=TEXT` HTTP 404, 233 B, body "NOT_FOUND: Requested entity was not found" | agree | The page is absent at the tag. My body sha256 (`3bd81c56…`) differs from the lesson's `b52a956c…` at the same size. 404 bodies vary per request, so a 404 sha is not a stable receipt (routed, low). |
| `docs/linux/suid_sandbox_development.md` | reject | same tag, HTTP 200, raw 4,228 B `bd1562ceb74fa514…` | agree | Lines 3-5 read "The Linux SUID sandbox is almost but not completely removed. … This page is mostly out-of-date." The page is self-declared stale and scoped to the helper build, so it is a correct reject. |

`corpus/SOURCES.md` new row re-opened: S129 (above). The ≤25-word Gate quote is verbatim and located, and the anchor names the tag and line ranges.

**Result: 5 admits and 4 rejects sampled, all agree.** The round's own gate disagreement, w2 overturning the L1's kake:347 row, became lesson M6 and QUALITY criterion 91 with a red state (`c1-at-bf48b81.json` predicate true vs final false).

## Trends

- **expansion: improved.**
  - One admitted knowledge entry on ground the coverage map did not hold: `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`, on receipt-forgery checking. Its `source:` cites S127–S129, which are `mined` rows opened this round and re-opened above.
  - Three new sibling boundaries in `adjacency.tsv`, and a bounded 44-row screen ledger.
- **quality: improved.**
  - S127, S129 (with `switches.cc`) and S128's `launcher.c` re-open byte-identical at closure. The S128 PKGBUILD was not re-fetched; it is evidence-verified from ReopenS128.
  - Round-32 errata A/B/C landed append-only.
  - Each defect w2 found in this round's entries is marked: the `corpus/README.md:766` correction, the SKILL wave-2 corrections, v2 note §8, and the superseding registry row.
  - No admitted entry failed its closure re-check.
- **discernment: improved.** The non-author spot-check agrees with the gate on 5 admits and 4 rejects. The in-round disagreement became a grounded criterion (91, lesson M6).

## Routed defects (tabi, next round)

1. **Adjacency (carried claim).**
   - Re-run the sweep with the regex blind spots fixed, and with sibling `SKILL.md`/`corpus/knowledge` in scope (w1 ConnSiblingScan: 34 leads).
   - Count boundaries, not surface strings. Record every integrator reversal per criterion 91.
2. **Operability: battery v2.**
   - Randomise subjects, paths and ids (M7).
   - Add as cases the 11 MutGateV2 survivors, CritForgeV2B (a)(b), and CritForgeV2C (same-host junk Gate row passes s1).
3. **Calibration counter v4.** Still carried since round 32 (`claims.json:notClaimed[0]`).
4. **Integration hygiene.** Run `check-selfassessment` before each integration commit. Two commits this round read mismatch 1 (`bf48b81c`, `9f008f6c`) and needed follow-up corrections.
5. **Carried precision items:**
   - ReopenS128: three locator/stamp defects, to fix with a superseding row.
   - w2 CritErrataLanded: three low items.
   - CritScreenOthers: relabel kake 396/422/440 from `no-claim-declared` to `same-surface`.
   - CritScreenCrawlerSplit: kake:411 note.
   - Record 404 receipts by body text, not sha.
6. **S125 recheck cadence.** The 90d reason is withdrawn. Land draft-3 after a second seat's 156 fetch, or record a discriminating reason.
7. **M3 residual.** `c1-J3-junk-rows` reads sibling branch heads at run time and does not rebuild byte-exactly (6 of 7 controls reproduce). Pin its inputs.

## Operator note (SHONEN)

All four boxes are `[~]` in the report. A non-author can check each of them from committed artifacts:
- SKILL decision tables and registry rows: `SKILL.md:2887-2907`.
- End-to-end task: the live-leg receipt `measure/c2-live-at-0aa2281.json`.
- Executable without oral context: this closure re-derived C1 from the committed TSVs and lane text alone, and matched the counter's numbers.
- No bleed: `PROVINCE.md` is unchanged, and kake:347 was withdrawn rather than absorbed.

Promotion is operator-owned. Nothing here writes `[x]`.
