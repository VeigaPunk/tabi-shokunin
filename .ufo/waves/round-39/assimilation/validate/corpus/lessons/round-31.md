# Round 31 — sourced rate/crawl decision thresholds and the calibration window over SKILL.md and corpus/README.md (2026-10-26)

Baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`; claims frozen before data in
`9505a10eb80b2a0b273ebaba3f7f872ad302192d` (`.ufo/waves/round-31/claims.json`); controls and freeze receipts in
`.ufo/waves/round-31/baseline/` (`README-receipts.md`). Waves: w1 build + first falsifiers (`.ufo/waves/round-31/w1/`),
w2 falsify (`.ufo/waves/round-31/w2/`). Integrated by TabiR31.

## Gate

New registry rows S119–S122 (all opened 2026-10-26; status `mined`; tier A scoped to each row's `scope`; used-by
`corpus/knowledge/rate-signal-decision-table.md`). Each was opened this round by a lane seat's own read-only HTTPS GET;
receipts `corpus/evidence/round-31/decision-table/S119.json` … `S122.json` with bytes under `bytes/` (fetched twice per
receipt seat; the four pages also re-fetched three times 130 s apart by w1 ExecLiveStability with identical normalised
text).

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S119 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T08:36:21Z (ScribeSourcesRows; receipt FetchS119 08:36:13Z; HTTP 200, 25,265 B, sha256 `f633915d…b207`) | §2.3.1.2 "Redirects" lines 377-378: "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" (12 words) |
| S120 | https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T08:36:21Z (ScribeSourcesRows; receipt FetchS120 08:36:10Z; HTTP 200, 17,164 B, sha256 `f6d55d1b…6e58`) | §4 "429 Too Many Requests" lines 137-139: "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request." (25 words) |
| S121 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T08:36:21Z (ScribeSourcesRows, raw sha256 `ae5e1812…4c18`; receipt FetchS121 08:36:16Z, 337,116 B, sha256 `3a33f87b…f755`; raw bytes differ per response, normalised text identical) | §About secondary rate limits, HTML line 67: "No more than 900 points per minute are allowed for REST API endpoints" (13 words) |
| S122 | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 2026-10-26T08:36:21Z (ScribeSourcesRows; receipt FetchS122 08:36:21Z; HTTP 200, 328,088 B, sha256 `b15c1c0b…a33e`) | §Handle rate limit errors appropriately, HTML line 51: "Otherwise, wait for at least one minute before retrying." (9 words) |

Further located spans (same fetched bytes, ScribeSourcesRows):

- S119 `rfc9309.txt:384-385` "If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable." (17 words). `:425` "The parsing limit MUST be at least 500 kibibytes [KiB]." (10 words). `:419` "SHOULD NOT use the cached version for more than 24 hours" (11 words). `:392` "such status codes are in the 400-499 range"; `:403` "server errors are identified by status codes in the 500-599 range"; `:406` "for example, 30 days".
- S120 `rfc6585.txt:145` "Retry-After: 3600" (2 words). `:165` "Responses with the 429 status code MUST NOT be stored by a cache." (13 words).
- S121 `gh-rate-limits.html:38` "The primary rate limit for unauthenticated requests is 60 requests per hour." (12 words). `:66` "No more than 100 concurrent requests are allowed." (8 words). `:70` "no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed" (19 words). `:41` "your personal rate limit of 5,000 requests per hour"; `:61` "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository."; `:143` "you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0".
- S122 `gh-best-practices.html:43` "you should make requests serially instead of concurrently" (8 words). `:45` "wait at least one second between each request" (8 words). `:49` "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed." (20 words). `:51` "wait for an exponentially increasing amount of time between retries" (10 words).

Decision-table rows: 13 (D1–D13; five from S119, six from S121, two from S122). S120 sources no row: its only numbers
are the specimen 429 response (`Retry-After: 3600`) and its example body (50 requests per hour), which are instances,
not statements (QUALITY criterion 80); S120 is cited in the entry's prose for §4 (429 may carry `Retry-After`) and §7.2
(a server need not use 429). Refused candidate rows, with reasons, are in the w1 row drafts' `rejected.md` files and the
selection note below.

Selection (L1, from the w1 drafts): kept the robots rows D1, D3–D6 of ScribeRowsRobots (its D2 restates D1's five-redirect
bound under MUST and was dropped as a second row on one number); dropped ScribeRowsRetry D1/D2 (specimen values);
kept ScribeRowsGitHubLimits D1, D2, D3, D7, D8, D9 and dropped D4 (installation minimum repeats 5,000), D5
(`GITHUB_TOKEN`, Actions-only), D6 (installation ceiling), D10 (content creation — outside an observation-only
province), D11 (OAuth token minting), D12 (LFS); kept ScribeRowsGitHubPractice D1 (as `stop`, 0 remaining) and D3, and
dropped its D2 (the same one-minute sentence as S121's, kept once under S121). Declared limits carry `(derived)`.

### Assimilation (§10)

Assimilation: **none**. The rate/ToS theme's remaining staged entries rest on staged S126 (GitHub REST rate limits),
refused in round 27 because the register's recorded quotes for S126 (`Native messaging` / `Extension side`) are absent
from that page (register id drift, `.ufo/waves/round-27/w1/RevStagedProvenance.md:405-406`); on S187/S199,
campaign-local work files under `shokuknow/lanes/tabi/` that are not re-openable public sources; or on S203. The S126
refusal stands: its flip condition is a register fix or an operator ruling on the id drift. S121/S122 are not an adoption
of S126 or S203: the lane opened the GitHub pages itself (own fetch, own bytes, own located quotes), took no package
bytes, rows or entry text, and the staged rows stay refused/unadopted (w1 RevAssimDecision). Collision check
(`.ufo/waves/round-31/assimilation/`): lane ids 118, staged ids 148, collisions 17 (S102–S118); the lane's new ids
S119–S122 are also staged ids in the package (staged S119–S122 are unrelated rows) — numbering is the lane's own
append order, by document. Guard proof (indented `  | S102 |` row caught by the 0–3-space pattern, missed by a
column-zero pattern): `.ufo/waves/round-31/w1/ExecAssimGuard/`. Quarantine slice 38 rows, register sha256
`5afe1810…d833` unchanged since round 27; no slice row adopted.

### Status / recheck / used-by changes

None to existing rows. New rows only (S119–S122, recheck `365d` for the RFCs, `90d` for the GitHub pages).

## Mistakes

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `number-drift` | `.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt:1` — `{"mismatches":1,…"doc":"SCORECARD.md","line":1527,"claimed":12,"observed":2}`; `.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt:130` mismatches=3; row at `corpus/lessons/round-30.md:344` | `scripts/check-selfassessment.mjs` m1 (it emitted the false positive); adjudicated at `corpus/lessons/round-30-verifier-spotcheck.md:148` (routed defect 2) | **landed** — v2 summary-line oracle (`scripts/check-selfassessment.mjs:172-179`) + regression case `v2-oracle-reads-summary-line-not-first-cases-token` (`:685`). Red state proven: `baseline/m8-proof/old-oracle-selftest.txt` (`cases=29 passed=28`, exit 3) |
| M2 | `scope` | the pre-freeze counter read only `SCORECARD.md` and `LOG.md` (`git show 96a2d1a3:scripts/check-selfassessment.mjs` → `readBlob(repo, rev, …)` calls at `:402`, `:405`, none for `SKILL.md`/`corpus/README.md`); nine stale tallies stood there — `baseline/c2-T0-reading.json` | `none` | **landed** — v2 windows (`scripts/check-selfassessment.mjs:422-425`, no-section-fallback association `:315-320`); red state: the same command at the T0 tree exits 1 with those nine (`baseline/c2-J1-do-nothing.json` + `.exit`) |
| M3 | `number-drift` | `SCORECARD.md:1523` "`check-selfassessment` mismatches 0 after the round-30 corrections above", against `measure/noharm-at-0ffc6ea.txt:130` (3) and `measure/noharm-at-d3cd62a.txt:1` (1); routed at `corpus/lessons/round-30-verifier-spotcheck.md:147` | the outside verifier (non-author closure spot-check), not a lane instrument | **landed at integration** (not at the freeze: `git grep -n 1523 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md` → 0 hits, exit 1) — appended `SCORECARD.md` §Round 31 — correction to the round-30 disposition, citing `SCORECARD.md:1523` with the measured residual 1 and its cause (M1). Red state: the sentence itself, now cited |
| M4 | `vacuous` | `.ufo/waves/round-30/w2/ConnCounterLeaks.md:13-20`, `:80-100`; `.ufo/waves/round-30/w2/CritC1EnvLeak.md:11-20`; frozen bytes still carry the leaks — `scripts/check-gate-mutants.mjs:142,152` (run dir `<work>/<runId>`, env spread), `scripts/check-frontier-admission.mjs:174-175` (`file://` accepted, `curl -sS -L` with no `-q`/proto pin) | `none` (attack seats, after the freeze) | **partially landed** — round-31's new counter is hermetic (`scripts/check-decision-table.mjs:194-213`): `curl -q`, `--proto =https`, `--proto-redir =https`, final URL same-host; its self-test case `live-offhost-redirect` (`:360`) is the red state. The three carried counters and the QUALITY criterion draft (80, `ConnCounterLeaks.md:102-113`; QUALITY.md still ends at 79) are **not landed** |
| M5 | `survivor` | `.ufo/waves/round-30/w2/MutC1Beyond.md:5` (22 hand-built mutants outside the frozen catalogue; `:63` a survivor killed only by a reason pin, `:70` fifteen new fault rows available); `.ufo/waves/round-30/w2/CritC1CasesPinsB.md:79-95` (five teaches-side weakenings pass the full `--selftest`); `CritC1CasesPinsA.md:52-66` (prefix-only reason match; a crash aborts the harness) | `none` | **not landed** (counter frozen for C1; carried as `claims.json.notClaimed` item 1). Red states exist per variant table in both reports |
| M6 | `attribution` | `.ufo/waves/round-30/w2/CritC2Fabrication.md:185-186` (F2: the S116 "refetch" is the entry author's own fetch relabelled by the L1; F3: the counter cannot decide copy vs refetch), `:177` | `none` | **not landed** (frontier-admission v2 independence evidence; `claims.json.notClaimed` item 1). Red state: the two labels in `corpus/evidence/round-30/frontier/refetch/` |
| M7 | `scope` | `SKILL.md:2474` states a self-test figure as `(cli_cases=36, helpers=4)`; the window's tally detector is `\bcases\s*=\s*(\d+)` (`scripts/check-selfassessment.mjs:122-127`), which cannot see a `_cases=` prefix, and no finding is emitted for that line in `baseline/c2-T0-reading.json`; independent probe `.ufo/waves/round-31/w1/ExecC2Oracle/oracle.tsv` row 2 (oracle could-not-evaluate: "no word boundary before cases") | w1 ExecC2Oracle (this round, after the freeze) | **not landed** — no detector alternative for `<name>_cases=N` and no `could-not-evaluate`-on-a-stated-tally rule. Red state to build: a fixture line whose `cli_cases` figure is stale → today it yields no finding at all |
| M8 | `vacuous` | `claims.json` §claims[0].controls (J1 do-nothing, J2 old rows, J3 self-quote offline/live, J4 invented thresholds, J5 package-as-is) and §claims[1].controls (J1 do-nothing, J2 delete lines, J3 uncited correction, J4 wrong-doc citation, gateEditJunk): every control attacks the **work**; none attacks an observable of the counter itself | `none` — the round-30 M7 row (`corpus/lessons/round-30.md:297`) asked for exactly this control class and round 31's freeze did not build one | **not landed** (freeze passed). Cheapest observable-junk named, unbuilt: a fixture gate that prints a different `…_SELFTEST … cases=N` when an ambient variable is set, run through `scripts/check-selfassessment.mjs:167` (parent env forwarded) |
| M9 | `reference-drift` | `.ufo/waves/round-30/w2/ConnFrontierConsistency.md:25-40` — six defects (item-label drift README `:216,:282-285,:302-305,:331-332` vs canonical `:182,:641-651`; class-pointer narrowing "C2–C6" `:182` vs "C3 and C6" `:644,:651`; fixture pointer §4–§5 vs `external-class-fixture-v2.md:510`; C3 parenthetical; SKILL `§Rights / rate boundary` `:693-695`; `adjacency.tsv` row 6 truncated quote with `ruling_ref -`), each fixable by append-only additions | `none` (attack seat, after the freeze) | **not landed** — at the freeze tree `corpus/README.md:37` still reads "(C2–C6)" and `:644` "C3 and C6", i.e. neither pointer was reconciled; no QUALITY criterion covers pointer precision on a frontier restatement |
| M10 | `vacuous` | `.ufo/waves/round-31/w1/CritC1Axis.md` Q2 (ten rows, one 12-word RFC 9309 quote, one new row: frozen counter exit 0, population 10, admitted 10, live — `w1/CritC1Axis/pad-live.json`); `.ufo/waves/round-31/w1/CritC1Counter.md` A1–A6 (unit mismatch, inverted bound, status code `429` as a threshold, the pronoun "one", an RFC number, a TOC section number all admitted) | `none` — the freeze controls (claims.json C1 J1–J5) attacked the work; none attacked repetition or the meaning of the matched number; same class as round-30 M7 and this round's M8 | **not landed** (the C1 counter is frozen; a rule changed after seats scored is not the claim's rule). Carried: counter v2 with distinct (source, quote) pairs, unit and bound word located in the quote, and a status-code/document-number exclusion; red state ready — `w1/CritC1Axis/fixture-entry-pad.md` and the CritC1Counter fixtures must fail under v2. This round's landed rows are read row by row in wave 2 instead (distinctness, unit, bound, force) |



### M1 — the calibration oracle read the first `cases=` token in a gate's output

- **Class:** `number-drift`.
- **Evidence:** `scripts/check-gate-mutants.mjs --selftest` prints a per-case line carrying a child gate's tally
  (`… cases=2 passed=1 …`) before its own `GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12`. The round-29
  oracle took the first `cases=` it saw, so `SCORECARD.md:1527`'s true 12/12 was reported as 12 vs 2
  (`.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt:1`), and that finding is the residual behind routed defect 2
  (`corpus/lessons/round-30-verifier-spotcheck.md:148`). Round-30's own row is `corpus/lessons/round-30.md:344`.
- **Captured by:** the same counter, m1 — it did emit the finding; what was missing was any rule that the oracle
  itself be tested against a noisy gate, so the false positive survived a round.
- **Fix (landed at the freeze):** the v2 oracle anchors on the gate's own summary line,
  `^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)`, taking the last match
  (`scripts/check-selfassessment.mjs:172-179`); regression case
  `v2-oracle-reads-summary-line-not-first-cases-token` (`:685-693`).
- **Able to fail:** `baseline/m8-proof/old-oracle.mjs` (sha256
  `bfc9682b692339acfd1647bbddca7a1569c1410968aa742ad2ae8e5ed3962855`) is the frozen counter with the v2
  behaviours reverted; its committed run reads `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28`,
  `exit=3`, and the one FAIL is that case (`expected_exit=0 exit=1 expected=- actual=m1-selftest-tally`) —
  `baseline/m8-proof/old-oracle-selftest.txt`. The other 28 cases pass, so the case is not red for an adjacent
  reason.
- **Limit — the probe is a three-change revert, and the receipt's own figure is off by one.** My
  `diff -u` of the frozen blob against the probe (exit 1, 6 hunks, 19 removed / 9 added lines; `receipts/frozen-vs-old-oracle.diff`)
  shows it also drops the `lineOnly` window parameter (`:286-320`) and deletes the case
  `v2-readme-no-section-fallback` — hence `cases=29`, not 30. So (a) only the oracle clause has an isolated red
  state; the no-section-fallback association rule's own case *passes* in the reverted file, and its ability to
  fail is unproven; and (b) `baseline/README-receipts.md`'s m8-proof row says "28/30, exit 3" while the receipt it
  describes says `cases=29 passed=28`. Keep the proof, correct the denominator when the lesson cites it.

### M2 — two documents carried self-test tallies that no window read

- **Class:** `scope`.
- **Evidence:** the pre-freeze counter's declared windows are `SCORECARD.md` and `LOG.md` only —
  `git show 96a2d1a3:scripts/check-selfassessment.mjs | grep -n 'readBlob(repo, rev,'` gives `:402`
  (`"SCORECARD.md"`), `:405` (`"LOG.md"`) and no `SKILL.md`/`corpus/README.md` read; the file's only
  `SKILL.md`/`corpus/README.md` strings are fixture receipt commands at `:606`, `:617` (`receipts/baseline-window-absence.txt`).
  Nine tallies in those two documents therefore went stale without an instrument noticing:
  `SKILL.md:1614` (sources 25 vs 26), `:2479` (selfassessment 13 vs 30), `:2514` (s106 5 vs 10),
  `:2515` (selfassessment 17 vs 30), `:2529` (s106 7 vs 10), `:2530` (selfassessment 20 vs 30),
  `:2543` (release-pins 20 vs 29), `:2544` (s106 7 vs 10), `corpus/README.md:613` (selfassessment 17 vs 30) —
  `baseline/c2-T0-reading.json`, mismatches 9 (`receipts/t0-mismatch-set.txt`). Each was already stale at the
  baseline: the superseding figures are in the corpus itself, e.g. `SCORECARD.md:1192` (sources 26) and `:1465`
  (selfassessment 22) are present at `96a2d1a3`.
- **Captured by:** `none`.
- **Fix (landed at the freeze):** two more windows with the same-document citation rule and per-line script
  association (`scripts/check-selfassessment.mjs:286-320`, `:422-425`), plus the append-only corrections C2 lands.
- **Able to fail:** the identical command on the pre-correction tree is red — `baseline/c2-J1-do-nothing.json`
  (`mismatches 9`) with `c2-J1-do-nothing.json.exit` = `exit=1`.
- **Limit — the red state's revision is not in the lane repo.** `c2-T0-reading.json` and `c2-J1-do-nothing.json`
  name `befe2a3f96f451e1fe797c3cab5f4c8dcf670f99`; `git cat-file -t befe2a3f…` in the lane fails ("Not a valid
  commit name"). T0 was a scratch clone committed by `baseline/controls.sh` (`fresh()`/`commit()`, fixture
  identity), so the before-reading is reproducible only by re-running that script over the freeze tree (tree
  `192b06438ee03341904242d8e218f5ee80a307cc`, present in the lane). Say so where the number is cited, or a reader
  will try `git show befe2a3f` and find nothing.

### M3 — a disposition line claimed zero mismatches while the committed readings were 3 and 1

- **Class:** `number-drift`.
- **Evidence:** `SCORECARD.md:1523` — "`check-selfassessment` mismatches 0 after the round-30 corrections above" —
  against `measure/noharm-at-0ffc6ea.txt:130` (`mismatches=3`) and `measure/noharm-at-d3cd62a.txt:1`
  (`{"mismatches":1,…}`). Routed as defect 1 at `corpus/lessons/round-30-verifier-spotcheck.md:147`, which asks
  for an appended correction citing `SCORECARD.md:1523` by line.
- **Captured by:** the outside verifier, at closure. No lane instrument reads a "mismatches 0" prose sentence; the
  counter in force at the time matched only tally shapes.
- **Fix (not landed at the freeze):** `git grep -n 1523 9505a10 -- SCORECARD.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md`
  → no output, exit 1 (`receipts/freeze-1523.txt`). The round-31 freeze section corrects `:1439`, `:1465`, `:1486`
  and `SKILL.md:2545` only (`claims.json.freezeTimeCorrections`, "Nothing else is corrected at freeze").
- **Able to fail:** the red state is the sentence at `:1523`; the check is `grep -c 'SCORECARD.md:1523' SCORECARD.md`
  ≥ 1 with the correction stating the measured residual of 1 and its cause (M1).
- **Limit:** the routed fix is a curation edit; no instrument enforces it. Criterion 78 demands the citation form,
  not its existence — worth saying in the row so the next round does not believe an append is instrumented.

### M4 — a counter's measurement path stayed reachable from the code under test

- **Class:** `vacuous`.
- **Evidence:** `.ufo/waves/round-30/w2/ConnCounterLeaks.md:13-20` (both round-30 counters reuse a production
  affordance: the run directory names the mutant, the live check admits a local scheme) and `:80` (a third gate,
  `check-freshness`, reads three absolute host paths in production); `CritC1EnvLeak.md:11-20` (a `process.cwd()`
  case reaches the frozen target at the tip with frozen bytes). The frozen bytes still carry them:
  `scripts/check-gate-mutants.mjs:143` (`const dir = join(work, runId)`) and `:152`
  (`env: { ...process.env, … }`); `scripts/check-frontier-admission.mjs:174` (`/^(https:\/\/|file:\/\/)/`) and
  `:175` (`spawnSync("curl", ["-sS", "-L", …])`, no `-q`, no proto pin); `scripts/check-selfassessment.mjs:167`
  forwards the parent environment to the gate under test.
- **Captured by:** `none` (attack seats, after the freeze).
- **Fix (partially landed):** the round-31 decision-table counter was written hermetic —
  `scripts/check-decision-table.mjs:194-213` (`curl -q -sS --proto =https --proto-redir =https -L`, rejecting a
  final URL that is not https on the row's own host) — and its self-test case `live-offhost-redirect`
  (`:360`) demands `l1-live`, so the refusal is exercised (frozen self-test receipt `baseline/c1-counter-selftest.txt`:
  `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34`, exit 0; not re-run by this seat). The three older
  counters and the criterion are carried: QUALITY.md has 79 criteria at the freeze, and the drafted criterion 80
  (`ConnCounterLeaks.md:102-113`) is not among them.
- **Able to fail:** landed half — `live-offhost-redirect` (off-host redirect ⇒ `admitted 0, reason l1-live`).
  Unlanded half — no red state exists for the env-forward (`:167`) or the `<work>/<runId>` naming (`:143`); the w1
  CritC1Counter / CritC1EnvLeak fixtures are the raw material.
- **Limit:** the env forward is latent rather than exploited — no gate in the runnable set decides its tally from
  an ambient variable (`git grep -n process.env 9505a10 -- scripts/` hits only PATH/HOME filtering, git config
  pinning, TMPDIR setting and fixture spawns; `receipts/env-forward-lines.txt`). Say "latent" so the row is not
  read as a measured 27/0 bypass of the calibration claim.

### M5 — case gates accept weakened checks, and the catalogue misses mutants

- **Class:** `survivor`.
- **Evidence:** `.ufo/waves/round-30/w2/MutC1Beyond.md:5` — 22 mutants strictly outside the frozen catalogue, of
  which fifteen are available as new fault rows with demonstrated behaviour change (`:63`, `:70`);
  `CritC1CasesPinsB.md:79-95` — five teaches-side weakenings (`includes("supersedes")`, `startsWith("supersedes ")`,
  `includes(" —")`, prefix without separator, tag `>= stable`) pass the whole `--selftest` at exit 0, because the
  supersession case's fixture `teaches` cell carries no `supersedes` token; `CritC1CasesPinsA.md:52-66` — the
  reason assertion pins a prefix only, both `f4` cases share one reason string, and any crash aborts the harness so
  "killed" can mean "the suite died".
- **Captured by:** `none`.
- **Fix (not landed):** the gate-mutants v2 items (`claims.json.notClaimed` item 1: opaque run directories, minimal
  child env, killer attribution, catalogue extended with the MutC1Beyond survivors).
- **Able to fail:** not applicable until landed; the attack reports carry the fixtures and the exact find/replace
  strings, which is the red state a landed catalogue row would consume.

### M6 — a refetch record was labelled independent while produced by the entry's author

- **Class:** `attribution`.
- **Evidence:** `.ufo/waves/round-30/w2/CritC2Fabrication.md:185` (F2: the S116 "refetch" transcribes a real fetch
  by `ScribeEntryRateLimitFields`, the seat that also wrote the entry and had declared it "cannot supply an
  independent refetch"; independence holds only against `FetchS159`) and `:186` (F3: receipt and refetch bytes are
  the same git blob for an immutable URL, so copy vs. refetch is decidable only from an external log). The label
  test is at `:177`.
- **Captured by:** `none` — `g7` checks a refetch's seat label and bytes, never the seat's role.
- **Fix (not landed):** frontier-admission v2 must require independence evidence
  (`claims.json.notClaimed` item 1). Today the frozen bytes still admit `file://` and follow redirects
  (`scripts/check-frontier-admission.mjs:174-175`).
- **Able to fail:** the two labels in `corpus/evidence/round-30/frontier/refetch/` are the red state; no case
  consumes them.

### M7 — the window cannot read a `cli_cases=` figure, so that registry row's tally is never compared

- **Class:** `scope`.
- **Evidence:** `SKILL.md:2474` (aria-historical-metadata row) states its self-test as `(cli_cases=36, helpers=4)`.
  The window's tally detector is `TALLY_PATTERNS` (`scripts/check-selfassessment.mjs:122-127`), whose `cases` form
  is `\bcases\s*=\s*(\d+)`; `_` is a word character, so `cli_cases=36` has no boundary and no tally is recognised —
  and `baseline/c2-T0-reading.json` emits no finding for line 2474 at all. The independent probe
  `.ufo/waves/round-31/w1/ExecC2Oracle/oracle.tsv` row 2 reaches the same line from the other end: "oracle
  could-not-evaluate ('self-test printed no tally'): summary line carries cli_cases=36, which has no word boundary
  before 'cases'" (`receipts/oracle-coverage-rows.tsv`). The gate prints that shape on both paths — clean at
  `scripts/check-aria-metadata.mjs:2983-2986` (`ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` with a
  probe reading of 36) and refused at `:2320` (`ARIA_METADATA_SELFTEST verdict=blocked cli_cases=0 helpers=0`) — so
  the shape is the gate's production summary, not a fixture's.
- **Captured by:** w1 ExecC2Oracle, this round, after the freeze.
- **Fix (not landed):** no detector alternative for `<name>_cases=N`, and no rule that a states-a-tally line the
  oracle cannot read must be reported rather than skipped.
- **Able to fail:** unbuilt. Today a stale `cli_cases` figure produces no finding, silently — that absence is the
  red state a case would turn green.
- **Limit:** this is not the round-30 M8 misread (a wrong number); it is a silent non-read. Keep them separate rows
  so the oracle fix (M1) is not credited with coverage it does not have.

### M8 — the freeze controls attacked the work, not the counter's own observables

- **Class:** `vacuous`.
- **Evidence:** `claims.json` §claims[0].controls — do-nothing, rows already in the registry, self-quote receipts
  (offline and `--live`), invented thresholds, package-copied-as-is; §claims[1].controls — do-nothing, deleted
  stale lines, uncited blanket correction, wrong-document citation, "gateEditJunk". Ten controls, every one of them
  a fixture about the **work**. None asks what the counter reveals about itself: the run directory it creates
  (`scripts/check-gate-mutants.mjs:142`), the environment it forwards (`check-selfassessment.mjs:167`,
  `check-gate-mutants.mjs:152`), the URL scheme it accepts from a receipt it did not write
  (`check-frontier-admission.mjs:174`). This is the recurrence of round-30 M7 (`corpus/lessons/round-30.md:297`),
  whose fix was a freeze checklist item — "build one junk per observable before freezing".
- **Captured by:** `none` (the round-30 M7 row asked for it; the round-31 freeze did not do it).
- **Fix (not landed — the freeze has passed):** for the next freeze, one control per observable; the cheapest here
  is a fixture gate that prints a different `…_SELFTEST … cases=N` when an ambient variable is set, plus a receipt
  whose url is `file://`, scored against the frozen counters.
- **Able to fail:** unbuilt. State it as a control gap, not as a measured bypass.

### M9 — six frontier-pointer defects were routed and none was corrected

- **Class:** `reference-drift`.
- **Evidence:** `.ufo/waves/round-30/w2/ConnFrontierConsistency.md:25-40` lists them with line pointers: (1)
  item-label drift — "rate/rights real-site records" (`corpus/README.md:216`, `:282-285`, `:302-305`, `:331-332`;
  `PROVINCE.md:10`) against the canonical "Rate/ToS surface for site-interaction records" (`:182`, `:641-651`), with
  rounds 18/20/21/22 dropping the item from their "still open" enumerations; (2) class-pointer narrowing — "C2–C6"
  (`:182`) against "C3 and C6" (`:644`, `:651`) when the deciding evidence names C2, C3 and C6; (3) fixture pointer
  §4–§5 where the quoted sentence lives at `external-class-fixture-v2.md:510`; (4) the C3 parenthetical read as
  "no datum in the corpus" after S116/S117 landed documented vocabulary; (5) `SKILL.md:693-695` and the C3/C6 rows
  carry no pointer to S116/S117; (6) `adjacency.tsv` row 6 truncates two quotes without ellipsis and cites
  `ruling_ref -` for a phrase that lives in the lane's own `.ufo/waves/round-14/w1/PolicyBoundaries.md:27`.
  All six are append-only-fixable and none changes a disposition.
- **Captured by:** `none` (attack seat, after the freeze); round-30's corrections addressed the `docs-held` half of
  the same row and nothing else.
- **Fix (not landed):** at the freeze tree the drift is still literal — `corpus/README.md:37` reads "(C2–C6)" and
  `:644` reads "C3 and C6" while `:182` keeps the canonical label. An errata block in both documents, each line
  citing the drifted line, is the fix; criterion 78 fixes the form, and nothing requires the errata to exist.
- **Able to fail:** no instrument; the red state is a reader-facing grep (`grep -n "rate/rights real-site records" corpus/README.md`)
  returning hits after the errata claims the drift is reconciled.

### M10 — the C1 counter admits repetition and numbers that are not thresholds

- **Class:** `vacuous`.
- **Evidence:** wave-1 CritC1Axis built, at the freeze commit with the frozen counter bytes, a ten-row table whose
  rows all quote the same RFC 9309 sentence with the same threshold and one new registry row: exit 0, population 10,
  admitted 10, failing 0, with `--live` (`.ufo/waves/round-31/w1/CritC1Axis/pad-live.json`). CritC1Counter A1–A6
  admitted a unit mismatch (60 requests quoted, 60 days claimed), an inverted bound, the status code `429` as a
  threshold, the pronoun "one", the RFC's own number 6585 and a table-of-contents section number. `n1` compares only
  the numeric token of the Threshold cell with numbers anywhere in the quote, and only the row id is unique.
- **Captured by:** `none`. The freeze controls (do-nothing, old rows, self-quote, invented thresholds, package-as-is)
  all attack the claimed work; none attacks repetition or what the matched number means — the round-30 M7 lesson
  ("freeze controls attacked the work, not the counter") recurred.
- **Fix (not landed; counter frozen):** counter v2 next round — distinct (source, quote) and (source, threshold)
  pairs, the threshold's unit and bound word located in the same quote, and status codes, document numbers and
  section numbers refused as thresholds. Able to fail: the CritC1Axis pad fixture and the CritC1Counter A1–A6
  fixtures are the red states v2 must turn red.
- **This round's mitigation:** the 13 landed rows were drafted against the rule in QUALITY criterion 80 and are read
  row by row in wave 2 (distinct quotes, unit and bound present in the quote, force class, scope). That reading is
  evidence beside the counter, not part of the frozen predicate.

## Corrections to freeze-time receipts

- `.ufo/waves/round-31/baseline/README-receipts.md` m8-proof row says "28/30"; the committed receipt reads
  `cases=29 passed=28` (the probe copy predates the 30th case `v2-readme-no-section-fallback`). That case's own red
  state is w1 MutC2Counter mutant m3 (lineOnly ignored → killed by `v2-readme-no-section-fallback`).
- `baseline/c2-T0-reading.json` and the C2 controls name scratch revisions (`befe2a3f…`) that are not lane commits;
  the freeze tree equals T0's tree outside `.ufo/waves/round-31/` (`192b0643…`), and the before value is re-measured at
  the freeze commit in `.ufo/waves/round-31/measure/`.

## Attempt 2 — falsify wave a2w1 and integration (append-only; integrated by TabiR31a2)

Correction to the header (line 5-6): the falsify wave is **a2w1** (`.ufo/waves/round-31/a2w1/`, 32 seats), not `w2`.
Attempt 1's L1 (TabiR31) died with the orchestrator host crash (2026-10-26 ~08:50 -03) after landing `9505a10e` and
`48604835`; its `w2` was abandoned unspawned (`w2.ready.dispatched` reads `ABANDONED`, `w2/` holds only a registry), and
the orchestrator salvage commit `ae15a37e` committed the attempt-1 wave state. Attempt 2 re-verified that state —
both frozen counters byte-identical, C1 live 13/13 failing 0 and C2 mismatches 0 at `ae15a37e`, all six no-harm checks
green (`.ufo/waves/round-31/measure/a2-reverify-at-ae15a37.txt`) — and redispatched the w2 items unchanged as a2w1.
Reused: claims, controls, freeze receipts, w1 reports, attempt-1 measurements at `9505a10e`/`48604835`. Discarded: the
`w2` spec as a dispatch (its items live on in `a2w1-spec.json`); the `<MEASURED>` placeholders of the a2w1 LOG draft.

### a2w1 dispositions

Held (no defect): C1 re-measured live 13/13 failing 0 by ExecC1Measure and CritC1Verdict (12 distinct thresholds over
13 rows; 10 under the harshest criterion-80 reading); all thirteen rows by the seven RowAttack seats (D1–D12 hold; D13
low defects below); S119–S122 refetched independently (S119/S120 sha256-identical, S121/S122 normalised-identical; the
S121 raw difference is 63 bytes of Next.js `buildId`); registry rows S119–S122 contract-valid (RevSourcesRows); C2
re-measured mismatches 0 with zero deleted lines (ExecC2Measure, CritC2Vacuity, CritCalibrationHarm), the ten appended
corrections each oracle-true (RevC2Corrections), six of seven correction mutants killed (MutC2Corrections); no gate
green at the freeze and red at the landing (ExecNoHarmTip); census exit 0 (ExecCensus); criterion 80 holds (RevQuality).

Defects and their disposition:

| finding | seat | disposition |
|---|---|---|
| entry recheck 180d vs registry 365d (S119, S120) | ConnFrontier #1, RevLesson D-b | entry errata (appended) |
| entry prose: S117 header overlap is three fields; "stated number of retries"; "no revision marker"; "exactly one action"; queue; four trip classes | CritEntryProse F1–F6 | entry errata (appended) |
| D12 "until the instant" vs "until after"; SHOULD capitals for a lower-case directive; D13 drops "a large number of"; time base outside the Threshold cell; D7 per-IP scope; content-generating limit not tabled | RowAttackD11D12, RowAttackD13, ExecC1Distinct | entry errata (appended); no row edited, no count changes |
| S119 anchor "June 2022" vs bytes "September 2022" | RefetchS119 | entry errata; anchor not edited in place (CORPUS.md rule 2); a superseding row is carried to round 32 |
| criterion 81 verdict clause enforced by no line; summary-less fallback | RevQuality F1, F2 | M11 below; QUALITY criterion 82 |
| README round-31 frontier row: instrument divergence (admission counter still reads the two round-30 notes), C3/C6 deciding evidence, multi-script disclosure, crawl rows under the rate half, criteria span 80–81 on the calibration row | CritReadmeRow F1–F4, ConnFrontier #2, ScribeErrata E25 | appended `corpus/README.md` §Round 31 — corrections to the round-31 rows |
| `SKILL.md:1559` "eight isolated CLI cases" stale (gate prints twelve); invisible to the frozen window (word numeral) | ScribeErrata E22 (w1 CritC2Counter FN-1) | appended `SKILL.md` correction citing `:1559`; the window's word-numeral gap stays carried |
| a merged two-bullet correction paragraph still clears both findings | MutC2Corrections F1 | carried (counter v2); the landed bullets are separate |
| M4 subsection cites `check-gate-mutants.mjs:143`; the line is `:142`; bare `receipts/` pointers mean `.ufo/waves/round-31/w1/ScribeLessonMistakes/receipts/` | RevLesson D-a, D-c | corrected here |
| lesson carries no sibling-adjacency line | ConnAdjacency Q3 | corrected here (below) |
| C1 counter met by junk at the freeze (repetition, status code) | ScoutClaimsHistory | already recorded (M8, M10); the landed bytes do not repeat it (CritC1Verdict, ExecC1Distinct) |

Wave-1 findings the attempt-1 integration did not record: 43 append-only errata drafted by a2w1 ScribeErrata
(`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`, committed as wave evidence): 9 corrected in that block, 3 corrected
as a rule with enforcement carried, 27 carried to round 32, 4 no action with reason. The carried set is this lane's
round-32 intake; none changes a frozen counter, predicate or reading.

Adjacency (ConnAdjacency): D1–D5 sit on RFC 9309 ground kake also holds publisher-side; the rows here are driver-side
and re-sourced from the lane's own S119 fetch, per kake's declared split. mori's S041/S042 hold RFC 6585 and
`Retry-After` for seat-terminal classification — a disjoint purpose, nothing absorbed. No contested surface is new.

## Mistakes — attempt 2 (append-only)

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M11 | `vacuous` | `corpus/QUALITY.md` criterion 81, clause "a summary whose verdict is not `clean` is not a tally"; `scripts/check-selfassessment.mjs:180-181` (summary pattern reads no `verdict=`), `gateTally` `:159-186` (status `measured` whatever the exit); probe `.ufo/waves/round-31/a2w1/RevQuality/probe2.json` (a `verdict=failed cases=13` gate read as tally 13; a summary-less gate as 9) | criterion 73 (a clause no line enforces is dropped or enforced) — not applied when 81 was written; caught by a2w1 RevQuality | **landed** — criterion 82 supersedes the clause and states it as a limit with a hand-read rule; red state is the committed probe. Counter enforcement carried to round 32 |

### M11 — a quality criterion asserted an enforcement the counter does not perform

- **Class:** `vacuous`.
- **Evidence:** criterion 81 says a non-clean summary is not a tally; the frozen v2 counter's summary regex has no
  `verdict` token and `m1Findings` never reads the gate's exit, so a failing self-test's `cases=N` is matched as the tally.
- **Captured by:** criterion 73 states the rule for predicate sentences; it was not applied to a criterion's own text.
- **Fix:** criterion 82 (appended) supersedes the clause; able to fail: the RevQuality probe gate printing
  `verdict=failed cases=13` yields observed 13 under the frozen counter (`probe2.json`), which the criterion now names
  as a hand-read case instead of a guarantee.
