# RevEntryFreshnessScope — C2 scope honesty, supersession mechanics, could-not-evaluate (round 25, w1)

Reviewer seat, read-only. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin` (all paths below relative to it unless absolute).
Lane HEAD `c8ef308` (`git log --oneline -1`), baseline `9e13666`. Untracked at review time: `scripts/check-source-reopen-receipt.mjs`,
`scripts/check-bfcache-receipt.mjs`, `.ufo/waves/round-25/w1/`, `.ufo/waves/round-25/assimilation/` (`git status --short`).
Axes reviewed: **scope honesty** (is the six a sample or a pick; is it disclosed), **supersession conformance** (CORPUS.md SOURCES rule 2 + census),
**fail-closed** (could-not-evaluate and skip-work resistance).

Verdict (a recommendation, not an admission): **C2 as frozen is a re-verification of the lane's most-verified, least-drift-prone rows,
and every counter in flight resolves rows that did no fresh work.** The six are named in the claim, but the claim does not say how they were chosen,
how many rows they were chosen from, or what they cannot show. The production counter cannot reach a correct clean verdict at its current revision,
and with its one-token bug fixed it passes a replay of round-18 values, a non-200 fetch, six copies of one row, and a supersession pointer that
supersedes the wrong row.

---

## Findings by severity

### HIGH-1 — The six rows look picked for convenience, not sampled, and the claim names them without saying why

Observation:

- **These are the exact Playwright and WebMCP rows that round 18 rechecked, and all of them held.** Each has a committed receipt at
  `corpus/evidence/round-18/source-recheck/<id>.json` with `teachesVerdict: "held"`, `quoteFound: true`, and `fetchedAt` 2026-10-20T20:49Z
  (python read of the six JSONs, this review). S013, S020 and S023 were also re-opened in the round-1 L1 spot-check (`corpus/SOURCES.md:137`).
  S020 was re-opened again in round 16 (`corpus/SOURCES.md:145`, "S020, S030–S038 held").
- **Today's bytes match bytes the lane already holds.** All six are byte-identical to round 18. Five of the six are also identical to the
  2026-10-19 Gate fetch. The scout's sha256 and byte counts equal the round-18 values (`.ufo/waves/round-25/scratch/ScoutFreshnessReopen/locate-out.json`
  compared with the round-18 JSONs). The draft receipt records `bytes_identical_to_2026_10_19_seat_fetch: true` for S013, S015, S016, S023 and S024
  (`.ufo/waves/round-25/scratch/ExecFreshnessReceipt/reopened.json`). Running
  `sha256sum scratch/ExecFreshnessReceipt/bytes/*.html scratch/CritC2Vacuity/*.html | awk '{print $1}' | sort | uniq -c` gives 6 digests with 2 copies each.
- **The quotes are lede sentences.** The held quotes (Gate `corpus/lessons/kaika-fleet-round-1.md:56-67`) come from §Introduction (S015, S016),
  the Abstract (S020) and section openers. A lede is the part of a page least likely to change.
- **Five of the six share one publisher and one deploy.** S013, S015, S016, S023 and S024 are all on `playwright.dev`. Their responses share
  `last-modified: Wed, 21 Oct 2026 17:41:39 GMT` (`scratch/ScoutFreshnessReopen/*.headers`). In practice that is about two independent fetch targets
  (one Playwright deploy and one WebMCP Pages deploy), not six.
- **The population is much larger.** There are 80 `on-release` rows (census awk recheck histogram: `365d=4 on-release=80 180d=8 90d=13`). 61 of them
  are not superseded (python: a row counts as superseded when its id is named by any `teaches` cell matching `^supersedes S\d+`). About 32 are
  live-URL rows that are not superseded (python heuristic: excludes `refs/tags/`, 40-hex `/blob/`, `/vN.N`, dated paths, and own-work; this is an
  [INFERENCE] about URL class, not content mutability). Six is 7.5% of the `on-release` rows and about 19% of the live ones.

Rows a reader would expect to be re-opened that are not in the six:

| Row | Why a reader expects it |
|---|---|
| **S017** Playwright release notes | This page is what tells you whether every Playwright row's `on-release` trigger has fired. Without it, C2 cannot say whether its own five Playwright rows were even due. `playwright.dev` redeployed on 2026-10-21 (headers above). Whether a release after 1.64 shipped is **UNKNOWN**, because this seat made no GETs. |
| **S014** Trace viewer | Same publisher, same open date (2026-10-19) and same knowledge entry (`corpus/knowledge/web-flake-retry-evidence.md`) as S013, S015 and S016. It is left out with no stated reason. |
| **S028** `remote_debugging_server.cc` @`main` | This is a `main`-branch source, the most mutable class in the oldest cohort (round 18 §4 classes it "live or rolling"). |
| **S001** Chrome blog | The other non-Playwright member of the 2026-10-19 `on-release` cohort. |
| **S021** Chrome DevTools for agents (queued) | Directly relevant to this round's assimilation candidate (`webmcp-devtools-agent-surface-r25`). Agent-docs pages are fetched this round for assimilation, but C2 does not count them. |
| **S030, S032, S035, S048, S073, S075** | The live WebMCP frontier rows (`main` READMEs and explainers, rolling Chrome docs). This is the lane's actively moving ground. |
| **S059–S061** | Playwright API rows from the same publisher, mined and `on-release`. |
| Tag-pinned Chromium 154 rows (e.g. S033, S041, S077, S105) | For these rows, "on-release" means "did 155 ship and supersede the build-scoped claim?" Re-fetching a tag returns the same bytes forever, so **C2's method cannot test this class at all**. The claim does not say so. |

Disclosure: the claim names the six ids (`claims.json` C2 `declared`). It does not give the selection rule, the population (80/61), the prior-pass history
(round 18 held, bytes identical), the single-publisher concentration, or the method's blindness to tag-pinned rows. The metric name
`freshness_rows_reopened_unresolved` on axis `freshness` reads as a statement about on-release freshness in general. `notClaimed` ("no scalar axis promotion")
limits the harm. Note also that `before: 0` ("0 rows re-opened this round") is true by construction for every round, so the 0→6 delta counts activity,
not freshness.

Fix, without changing the frozen claim: the disposition, the knowledge note and the SCORECARD row must state that "C2 covers six rows chosen from the round-18
held set." They must also state the population counts (80 `on-release`, 61 not superseded), that five of the six share one publisher, that the bytes are
identical to 2026-10-20, that S017 was not checked (so whether Playwright released since 1.64 is unknown), and that tag-pinned rows cannot be tested by
this method. The six must not be described as a sample of `on-release` freshness.

### HIGH-2 — S020's anchor is known to be stale, and C2 will mark the row "resolved" for the third time

Observation:

- The registry anchor is `CG-DRAFT 2026-10-16, revision f14762e6` (`corpus/SOURCES.md:34`).
- Today's bytes carry revision `51ed7565…` and an update date of 2026-10-20:
  `rg -n 'content="?[0-9a-f]{40}"? name="?revision|class="?dt-updated"?[^>]*>[^<]*' scratch/ExecFreshnessReceipt/bytes/S020.html` prints
  `11:content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision` and `844:class="dt-updated" datetime="2026-10-20">20 October 2026`.
- The Gate digest `a8f75790…` (kaika-fleet-round-1.md:63) is not today's `56275966…`. The page changed between 10-19 and 10-20 and has been stable since.
- Round 18 §4 recorded the same mismatch and declined to supersede the row ("Moving anchors are not drift").

C2's `declared` text says "land a new superseding row … with the corrected anchor", which implies anchor correctness is part of resolving a row.
But every predicate in flight checks only the quote:

- the reference scorer (`scratch/ExecControlScore/ref-check-source-reopen-receipt.mjs:29`),
- the oracle (`scratch/MutC2Counter/oracle.mjs` `judge()`),
- the production counter (`scripts/check-source-reopen-receipt.mjs:127-129` at sha256 `e23d9bfc…`).

A row whose immutable `anchor` cell is falsified by today's bytes therefore counts as resolved.

There is also a defect in the receipt: the draft records `"anchor_observed": "dt-updated 2026-10-20; meta revision null"` (`ExecFreshnessReceipt/reopened.json`, S020).
**"meta revision null" is a false observation.** The meta tag is present with `content` before `name`, which the assembler's pattern missed.

Fix: either append `supersedes S020 — …` with an anchor of revision `51ed7565…`, dt-updated 2026-10-20 (this conforms to rule 2), or have the disposition
say "S020 anchor drift known since 2026-10-20, not evaluated by C2 (quote-only predicate)". Correct `anchor_observed` before anything is committed.

### HIGH-3 — "This round's fetch digest" cannot be enforced, the skip-work control is a strawman, and the quote is self-asserted

- **The digest check only tests shape.** Every counter checks only `/^[0-9a-f]{64}$/`: the reference scorer at line 26, the oracle `judge()`, and the
  production counter at `:121`. The genuine fresh digests equal the round-18 digests for 6/6 rows (HIGH-1), so a receipt that reuses old bytes has the
  same digest as a fresh one. The kill rule's "must carry this round's fetch digest" is therefore unenforceable when content has not changed.
- **The frozen control only fails because of its literal values.** `control/skipwork-freshness.json` fails because `"legacy-2026-10-19"` is not hex, and
  `scratch/ExecControlScore/stronger-skipwork-freshness.json` fails because of `fetched_at: 2026-10-19`. Neither is the realistic skip: copy the round-18
  receipt values and stamp today's date.
- **I measured that the realistic skip passes.** Fixtures and runs are in `.ufo/waves/round-25/scratch/RevEntryFreshnessScope/`:
  - The `replay-round18.json` receipt is built from the round-18 JSON values with `fetched_at: 2026-10-25T00:00:00Z` and no fetch made. It returns
    `reopened 6 resolved 6 unresolved 0` on the reference scorer and `verdict=clean … exit=0` on the oracle (`node <scorer> --file …` and `node oracle.mjs … --sources corpus/SOURCES.md`).
  - Against the production counter, patched only at line 74 (see HIGH-4), the same replay using the **gzip** round-18 bodies as `bytes_path`
    (`xxd` of the committed blob begins `1f8b 0800`, so it is not HTML) returns `exit=0 clean True reopened 6 resolved 6 unresolved 0`.
- **The located quote is self-asserted.** Production `:128` accepts any non-empty `located_quote` string. Fixture `H-quote-and-digest-unbound`
  (`sha256: "000…0"`, `located_quote: "x"`) returns `exit=0 clean True`. The counter never hashes `bytes_path` or tests the quote against those bytes,
  so the "one command over committed bytes" re-derives only what the receipt claims about itself. That is a regression from the lane's own round-18 practice,
  which committed `body.gz` plus an excerpt plus a digest binding (`corpus/knowledge/source-recheck-round-18.md` §8).

Fix (counter-side; the claim stays frozen):

1. Recompute sha256 from the committed `bytes_path` blob and require it to equal `row.sha256`.
2. Decode and normalize the blob, then require the Gate quote (from `kaika-fleet-round-1.md` §Gate for the row, not a free string) to be a substring.
3. Commit the response headers with the bytes, and require a `date:` header on or after 2026-10-25. That header is the only field that distinguishes
   a fresh fetch from a replay when content has not changed. It is still author-side forgeable, and the disposition should say so.
4. Add a selftest case `replay-round18-relabelled → failed`.

### HIGH-4 — Could-not-evaluate fails open: in the frozen kill rule, in all three counters, and through crashes

- **The frozen text tolerates one unevaluated row.** It says "if more than one row is could-not-evaluate at the tip, the target misses", so exactly one
  could-not-evaluate row is allowed. Such a row is "never resolved or unresolved", so `reopened=6, unresolved=0` meets the target while one row was never
  evaluated (5 of 6). This is frozen. The disposition must report a could-not-evaluate count and must not say "6 re-opened and resolved" if it is 1.
- **"At measure time" has no meaning for these counters.** All of them read committed bytes at `--rev` and fetch nothing, so no fetch can fail at
  measure time. The could-not-evaluate trigger has to be bound to the receipt's recorded fetch result, and the counter header should say so.
- **No counter reads `http_status` or has a per-row could-not-evaluate state.** The `grep` sweep
  `rg -n 'http_status|could-not|cne' scripts/check-source-reopen-receipt.mjs` matches only header comments (lines 5, 7 and 18). Fixture `B-non200`
  (S013 `http_status: 503`) returns `exit=0 clean True` on the patched production copy, `resolved 6` on the reference scorer, and `clean` on the oracle.
- **Production at `e23d9bfc…` line 74 has a defect.** `readBlob` returns `r.stdout ?? ""`, but `git()` returns `{out, status}`. Every read is therefore
  `""`, and every real receipt scores `f2-invalid-schema exit=2`. All 8 fixtures against snapshot `97f8894…` returned `exit=2 ['f2-invalid-schema']`.
  This fails closed, but it means the counter can never reach a correct clean verdict. In that snapshot the selftest also crashed with
  `ReferenceError: sp is not defined` at `:197`. The file was being rewritten during this review (248→252→302→297→298 lines between 12:20 and 12:22 UTC,
  per a `wc -l`/sha256 watch loop).
- **Crashes exit with the wrong class.** At `:104`/`:153`, a missing `summary` pushes a finding and then dereferences `r.summary.reopened`. JSON `null`
  dereferences `r.schema`. Fixtures `E-no-summary` and `G-json-null` crash with `TypeError` and **exit 1** ("failed") instead of 2 (could-not-evaluate),
  which contradicts the header's "malformed → 2".
- **The date check is lexicographic.** Production `:116` (`row.fetched_at < ROUND_DATE`) and the oracle
  (`slice(0,10) >= ROUND_DATE`) accept `"zzzz"`. `node -e 'console.log("zzzz".slice(0,10)>="2026-10-25")'` prints `true`, and fixture `F-date-zzzz`
  returns `exit=0 clean True`. Only the reference scorer guards the date with a regex.
- **Duplicate rows are not detected.** Production counts `reopened = rows.length` (`:108`). Fixture `C-dup-S013x6` (six copies of S013) returns
  `exit=0 clean True reopened 6`, so S015–S024 were never evaluated. The oracle does detect duplicates (`duplicate_row`).
- **The oracle can switch off its own checks.** Its `--disable <check>` flag is a mutation-test hook and must not be carried into the production gate.
- **The missing-receipt path is correct.** Unlike C1, C2's kill rule says nothing about a missing receipt. Production `:94-95` returns
  `f1-missing-receipt` exit 2 (could-not-evaluate), which is correct, and `resolveRev` failure goes to exit 2 (`:236-241`). Small slip: `resolveRev`
  reads `r.stderr`, which `git()` does not return, so the refusal message is a `TypeError` text. The exit is still 2.

Selftest cases that need to be added: `non-200 → could-not-evaluate`, `two-non-200 → target miss`, `duplicate-ids → failed`,
`summary-absent → exit 2`, `json-null → exit 2`, `date-non-ISO → failed`, `replay-round18-relabelled → failed`, `digest≠bytes → failed`,
`quote-not-in-bytes → failed`, and `valid this-round supersession → clean`. The last one matters because without it the supersession path can be
dead and the selftest still passes; that is what happened in the 247-line first version (MEDIUM-1).

### MEDIUM-1 — The supersession mechanics do not implement rule 2 or the "opens `supersedes S0NN —`" rule

CORPUS.md SOURCES rule 2 (`/home/vgpnk/Projects/shokunin/CORPUS.md:116-118`): "Only `status`, `recheck` and `used-by` change in place, and each change is
logged old→new in the round lesson. A correction is a new row whose `teaches` opens `supersedes S0NN —`."

- **Production checks for any supersession, not for this row's.** At `:137` the test is `srow.teaches.includes("supersedes")`. It does not check the
  start of the cell, the superseded id, or the em-dash. Fixture `D-supersession-wrong-target` (S013 `drifted` → `S107`, whose teaches is
  `supersedes S999 — about some other row`, opened 2026-10-25) returns `exit=0 clean True` on the patched copy. It should be anchored as
  `^supersedes S013 —` (id-exact and dash-required).
- **The oracle's check is a substring with prefix collisions.** It uses `t.teaches.includes(\`supersedes ${row.id}\`)`, so `supersedes S0130` satisfies
  S013, and the dash is not required. Its SOURCES parser `/^S\d{3}$/` accepts only three digits, but the contract allows "3 or more" (CORPUS.md:89).
  That is low risk today (max id S105).
- **The first production version could never resolve a supersession.** The first version I read (247 lines, `cat -n` before 12:20 UTC, sha not captured) used POSIX `[[:space:]]` inside a JS `RegExp` at `:76`.
  `node -e` returned `false` against `| S107 | x |`, so any drifted row was permanently unresolved, and its `dangling-supersession` selftest passed
  vacuously. The current file switched to `\s` (`:82`).
- **No counter checks append-only.** None verifies that the six rows' immutable cells (source, kind, tier, scope, anchor, teaches, opened) at `--rev` equal
  baseline `9e13666`. An in-place anchor edit plus `verdict: holds` would pass, which is exactly the rule-2 violation the C2 wording is meant to prevent.
  Add a cell-by-cell compare against `git show 9e13666:corpus/SOURCES.md`.
- **The three seats spell the pointer field differently.** The draft receipt uses `supersession`, the reference scorer `supersededBy`, and the oracle
  `superseded_by`. The draft receipt also has `quote_located` but no `bytes_path` or `located_quote`, both of which production requires. The receipt
  will fail f4 against production until it is regenerated. That fails closed, but the counter and receipt must agree on one schema before measurement.
- **Lane tooling does not enforce "opens" in general.** `scripts/check-sources.mjs:296` anchors `^supersedes\s+S[0-9]{3,}\b`, but only when a URL is
  duplicated, and it does not require the dash. The fleet `scripts/sources-census.sh:648` uses the unanchored `supersedes S[0-9]{3}`, and only for a
  duplicate URL+scope (E04). A correction row with a new URL (a moved page) is not checked by either. For C2's rows, the C2 counter is the only place
  the rule could be enforced, and none of the three versions enforces it exactly.
- **In-place `used-by` changes have no settled precedent.** If `corpus/knowledge/source-recheck-round-25.md` is added to the six rows' `used-by`, each
  change must be logged old→new in `corpus/lessons/round-25.md`. Precedent is mixed: S013 lists `source-recheck-round-12.md` but not
  `source-recheck-round-18.md` (`corpus/SOURCES.md:27`), while 13 registry lines do cite round 18 (`rg -n 'source-recheck-round-18' corpus/SOURCES.md | wc -l` → 13).
  Pick one and log it.

### LOW-1 — The scout brief pointed at the wrong quote location

The `ScoutFreshnessReopen` brief says to read the held quote "from … corpus/SOURCES.md" (`w1-spec.json`). SOURCES rows hold no quotes; the ≤25-word quotes
are in `corpus/lessons/kaika-fleet-round-1.md` §Gate. The draft receipt correctly cites `kaika-fleet-round-1.md:56/58/59/63/66/67`, and the six
`quote` strings match those Gate lines verbatim (`sed -n '56,67p'`). No defect landed; the brief text is wrong.

### LOW-2 — The same six URLs were fetched four times

Four seats fetched the six URLs: ScoutFreshnessReopen, ExecFreshnessReceipt `bytes/`, CritC2Vacuity, and ScribeSOURCESRows `*.body` (`ls` of each scratch dir).
This is not a C2 defect. The committed receipt must name the single fetch it binds to (ExecFreshnessReceipt `fetched_at` 12:15:51–52Z) and commit those bytes.

---

## Addendum — counter at sha256 `5b6ea9998c3b…` (358 lines, read 12:24 UTC)

The counter changed again after the findings above. I re-ran the checks against a copy (`scratch/RevEntryFreshnessScope/counter-snapshot3.mjs`).

**Still broken as written.** Line 94 still has the `readBlob` bug: it returns `r.stdout ?? ""`, but `git()` returns `out`. As a result:

- every fixture returns `exit=2 f2-invalid-schema`;
- `--selftest` passes **1/16**.

**Fixed in this version** (verified on a copy patched only at line 94, `counter-patched3.mjs`; selftest **15/16**):

- The digest is now recomputed from the committed `bytes_path` blob (`createHash`, `:69`, and the digest check). Fixtures H (zero digest) and A (gzip bytes) now fail with `f4`.
- The quote is now tested against the normalized stored bytes.
- Duplicate ids are detected: C fails with `f6 duplicate row ids`.
- A supersession pointer must name the right row: R5 (`supersedes S999 —`) fails with `f5`.
- A missing summary or JSON `null` now exits 2 (fixtures E and G).
- The one selftest that still fails is `five-rows`: it returns exit 1 with **no finding id**, so the selftest's own finding-id contract is not met.

**Still open on the patched copy.** These fixtures use real bytes: the round-18 `body.gz` decompressed, whose sha256 `cf48ff4d…` equals today's fetch. Results are in `scratch/RevEntryFreshnessScope/repo3`, fixtures `r3-*.json`.

| Fixture | Result | Gap it shows |
|---|---|---|
| R1: round-18 bytes and values, `fetched_at` relabelled 2026-10-25, no fetch made | `exit=0 clean` | HIGH-3: freshness rests only on a self-asserted date. No response header or `date:` is bound. |
| R2: S013 `http_status: 503` | `exit=0 clean` | HIGH-4: there is no per-row could-not-evaluate state. |
| R3: two rows non-200 | `exit=0 clean` | Violates the frozen kill rule: more than one could-not-evaluate row must miss the target. |
| R4: `fetched_at: "zzzz"` | `exit=0 clean` | The date comparison at `:140` is still lexicographic. |
| R6: pointer to a this-round row whose teaches reads `an aside: this supersedes S0130 — not S013 at all` | `exit=0 clean` | MEDIUM-1: `:164` uses `includes(\`supersedes ${row.id}\`)`. It does not require the cell to open with the phrase, has no word boundary, and does not require the dash. |
| R7: `located_quote: "Playwright"` | `exit=0 clean` | The quote is not bound to the Gate quote (`kaika-fleet-round-1.md` §Gate). Any substring of the page satisfies it. |

Still not implemented: an append-only compare of the six rows' immutable cells against `9e13666`, and an anchor check (HIGH-2, S020).

## Residual risk

- **Whether the Playwright rows were even due is unknown.** S017 was not opened by C2 and this seat made no GETs (none are documented for this item).
  Whether a Playwright release after 1.64 shipped is UNKNOWN.
- **The freshness proof is author-side at best.** Even with header binding, a committed `date:` header is author-written. The strongest honest claim is
  "the lane-held bytes, re-derivable from commit, contain the Gate quote", not "the publisher served these bytes today".
- **The counter changed during this review.** Defects are cited against `97f8894…`, `e23d9bfc…` and `5b6ea999…`, with copies in my scratch dir
  (`counter-snapshot.mjs`, `counter-snapshot2.mjs`, `counter-snapshot3.mjs`). The integrated version must be re-run against two fixture batteries:
  - `scratch/RevEntryFreshnessScope/snap-*.json`. Expected: A, B, C, D, F and H → exit 1; E and G → exit 2.
  - `scratch/RevEntryFreshnessScope/r3-*.json`, using `repo3`'s bytes and SOURCES. Expected: R1, R2, R4, R5, R6 and R7 → non-clean; R3 → target miss.
    R1 can only fail if the receipt binds the fetch with a committed response `date:` header.
- **HIGH-1 is about selection, not dishonesty.** The claim does name the set. The risk is that downstream prose (SCORECARD, LOG, README frontier)
  generalizes from it.

## Verification gaps

- No external fetch was made, so today's bytes rest on sibling seats' captures. Their `date:` headers are `Sun, 25 Oct 2026 12:15:24 GMT` with
  `x-cache: MISS`, which suggests genuine fetches [INFERENCE].
- No LSP server answers `.mjs` here. Caller and definition checks were done by direct read and `rg`, and these are textual, not semantic.
- The production results under HIGH-3 and HIGH-4 come from a scratch copy that differs from `e23d9bfc…` only at line 74 (`diff` shown in the run).
  The unpatched file returns exit 2 on every fixture.
- The live-URL population figure (about 32) comes from a URL heuristic, not a content-mutability classification.

## Process accounting

- Writes: this report, plus throwaway fixtures and two git scratch repos under `.ufo/waves/round-25/scratch/RevEntryFreshnessScope/`.
  No tracked file was touched, and no git writes were made in the lane repo.
- Processes: no servers or browsers were started. Every `node` run exited, and the `wc`/sha watch loop ended within its 90 s bound.
- Tool installs or updates: none.
