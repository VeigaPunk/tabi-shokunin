# CritC2Vacuity — round 25 wave 1 (critic: C2 counter and kill rule)

Seat: `L1Tabi25.CritC2Vacuity`, author-side, lane-dispatched (not a non-author judgment).
Inputs, read-only: `.ufo/waves/round-25/claims.json` (C2 as frozen in commit `c8ef308`, 2026-10-25T12:14:55Z);
the reference scorer `.ufo/waves/round-25/scratch/ExecControlScore/ref-check-source-reopen-receipt.mjs` (35 lines,
the only C2 counter code that exists; `scripts/check-source-reopen-receipt.mjs` is absent at HEAD — `ls scripts | rg reopen` → empty);
the draft receipt `.ufo/waves/round-25/scratch/ExecFreshnessReceipt/reopened.json`; the round-18 precedent
`.ufo/waves/round-18/measure-c1.mjs` and `.ufo/waves/round-18/recheck-fetch.mjs`.
Fixtures and probes: `.ufo/waves/round-25/scratch/CritC2Vacuity/{mk.mjs,match.mjs,v1..v9-*.json,S0xx.html}`.
No network fetch, no browser, no process left running, no tool installed.

## Verdict

C2 as frozen is a **fixable defect, not yet a rejectable tradeoff**. The claim only means something if the counter
binds every field to git or retained bytes instead of trusting the receipt. The reference scorer trusts the receipt:
**9 of 9 vacuity fixtures reach the target** (`reopened=6`, `unresolved=0`, exit 0). Separately, unresolved=0 was
**predictable before the freeze**. All six of today's fetched bodies are byte-identical to the round-18 bodies
already committed at baseline, so a receipt built from those bodies matches every digest a real fetch would produce.
Six rows is too small a sample to move the freshness axis, and the claim must be narrowed to the six named rows.

## Axes impacted

freshness (the claim's axis: false-positive risk), calibration (a predetermined 6/6 is reported as if it were a
measurement), and provenance (a freshness proof the counter cannot actually verify). Depth, coverage, operability and
adjacency are not touched.

## (a) Can unresolved=0 be reached by choosing rows whose quotes are trivially findable?

**Not through trivially findable quotes. Yes through row selection.**

- Observation: if the counter uses the canonical quotes (`corpus/lessons/kaika-fleet-round-1.md:56,58,59,63,66,67`),
  each one is located only in its own page. The cross-page strict matrix (tag-strip, entity decode, round-18
  `normalize()`, `includes`) is a clean diagonal: 6 hits out of 36 probes, all on the diagonal.
  Command: `node .ufo/waves/round-25/scratch/CritC2Vacuity/match.mjs .ufo/waves/round-25/scratch/CritC2Vacuity`.
  None of these quotes is site chrome.
- Observation (selection): the six rows are the registry's most stable. Today's bodies equal the round-18 retained
  bodies for **6/6** rows, and for 5/6 (all but S020) they also equal the 2026-10-19 round-1 seat digests:
  - S013 `cf48ff4d…`
  - S015 `31075410…`
  - S016 `1bb8afe8…`
  - S020 `56275966…`
  - S023 `234a2452…`
  - S024 `bbbad688…`

  Command: `sha256sum` of `scratch/ExecFreshnessReceipt/bytes/S0xx.html` versus
  `gunzip -c corpus/evidence/round-18/source-recheck/S0xx.body.gz`; every row prints `same=yes`.
  Five of the six belong to the 8-row set {S013, S014, S015, S016, S017, S023, S024, S027} whose round-18 digest
  equals the round-1 digest. Command: the loop over round-18 `held` receipts against
  `rg "\| $s \|.*$digest" corpus/lessons/kaika-fleet-round-1.md`.
- Observation (population, at baseline `9e136667`), from `git show $B:corpus/SOURCES.md` + awk on the `recheck`
  column, and `jq .teachesVerdict` over `corpus/evidence/round-18/source-recheck/S*.json`:
  - 80 rows are `on-release`.
  - Round 18 recorded 41 held and 10 drift (S003 S008 S010 S029 S031 S034 S042 S044 S052 S054).
  - **46 on-release rows have no round-18 receipt**: 6 superseded, plus S058–S102 and S105.
  - C2 picks none of the drift-history rows and none of the never-reopened rows.
- Inference: the selection was not trivially findable, but the outcome was knowable before the freeze. The bodies
  that decide all six rows were committed on 2026-10-20 and have not changed. That makes this a predetermined
  re-confirmation, not a risk-bearing freshness probe.
- Counterexample: a receipt built entirely from baseline git objects (fixture V1 below) scores 6/6. A real fetch
  yields exactly the same digests.

## (b) Can a supersession pointer be invented without a real fetch?

**Yes, in both the reference scorer and the round-18 precedent.**

- Reference scorer line 28: `sup = typeof row.supersededBy === "string" && /^S\d{3,}$/.test(row.supersededBy)`,
  and line 30 counts the row as resolved. A pointer to `S999`, which exists nowhere, resolves (V4). So does `S028`,
  a baseline row that supersedes S004 rather than S013 (V5).
- Round-18 `measure-c1.mjs:414` accepts **any** SOURCES row at REV whose `teaches` starts with `supersedes <row> —`.
  It does not require that row to be absent at baseline, to share the row's URL, to be dated this round, or to have
  its own quote located in this round's retained bytes. A copied validator inherits all four gaps.
- Structural gap: "resolved = located OR superseded" means any fetch that returns 200 can be driven to unresolved=0.
  An absent quote is cured by appending a row whose new quote is picked from today's bytes. Supersession needs its
  own evidence, or it turns every miss into a hit.

## (c) Does `quote_located` have a definition that a lenient grep satisfies?

**Yes. In the reference scorer it has no definition at all.**

- Reference scorer line 29 checks `row.quote_located !== true`. That is a self-reported boolean: no quote is read, no
  body is read, and no offset is checked. V2 (empty quote, digest of arbitrary bytes) and V3 ("Playwright" or
  "WebMCP" as the quote) both resolve 6/6.
- The draft receipt states the rule in prose: `quote_rule: "substring test after decode+normalize of both sides"`.
  Nothing enforces it.
- Round-18 `recheck-fetch.mjs:76,110` does `text.indexOf(normalize(q))`. An empty quote is located at offset 0 for
  S013 and S020. Command: `node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body S013.html --quote ""`
  → `{"found":true,"offset":0}`.
- Round-18 `measure-c1.mjs` rejects empty quotes and quotes over 25 words, but **never binds `quote` to
  `quoteSource`**. `rg -n quoteSource .ufo/waves/round-18/measure-c1.mjs` → no hits. Any non-empty page string
  passes; for example "Copyright ©" is located in all five Playwright bodies.
- Strict versus lenient matchers on adversarial edits of the canonical quotes, which must all be NOT located
  (`match.mjs`):

  | row | edit | strict normalized substring | case-insensitive | word-bag (all words present) | 5-word prefix |
  |---|---|---|---|---|---|
  | S023 | negation deleted ("do not replace" → "replace") | absent | absent | **LOCATED** | absent |
  | S013 | label swapped `"flaky"` → `"passed"` | absent | absent | **LOCATED** | absent |
  | S015 | clause order reversed | absent | absent | **LOCATED** | absent |
  | S016 | "will" → "never" | absent | absent | absent | **LOCATED** |
  | S020 | tail falsified after 5 words | absent | absent | absent | **LOCATED** |
  | S024 | case changed | absent | **LOCATED** | **LOCATED** | absent |

- The opposite failure also occurs: a raw-byte grep without tag-strip misses the true quote for S016 and S023,
  because the quote is split across HTML tags (`raw-byte grep … S016:0 S023:0`). A too-strict matcher would push
  honest rows into supersession, which is the gap described in (b).
- The only definition that survives is: tag-strip, entity decode, NFC/quote/dash/whitespace fold, then a
  **case-sensitive contiguous substring of the canonical quote read from git at baseline**. Offset and occurrence
  count are recomputed from the retained body, never read from the receipt.

## (d) Is the before-state (0 rows re-opened) verifiable at baseline?

**Only as an absence, and the frozen C2 does not say how an absence is scored.**

- Observation: `git ls-tree -r --name-only 9e136667 -- corpus/evidence/round-25` → 0 entries, and there are 0 files
  named `reopened.json` anywhere at baseline.
- C2's killRule has no missing-receipt clause (`jq .claims[1].killRule | rg -i missing` → none). C1's has one: "A
  receipt missing at the measured revision is could-not-evaluate, never 0". This asymmetry is a defect.
- The reference scorer on a missing file prints `{"receipt_present":false,"reopened":0,…}` with exit 2. A consumer
  that reads the `reopened` field records "0" from a could-not-evaluate path, so `before: 0` is produced by the
  could-not-evaluate branch.
- Counterexample: baseline already holds **6** receipts for these exact rows (`corpus/evidence/round-18/source-recheck/S0{13,15,16,20,23,24}.json`).
  A counter that globs evidence instead of fixing the round-25 path and the round-25 fetch day would report
  reopened=6 at baseline.
- Inference: `before: 0` is true only by construction, because round 25 had not started. It says nothing about how
  fresh the six rows are. The meaningful before-state is that these six rows were last located on 2026-10-20 by the
  round-18 receipts, five days earlier.
- The kill rule's "fetch fails at measure time" clause is dead code for a `--rev` counter that reads a committed
  receipt. Such a counter never fetches, so it cannot observe a measure-time failure. Either the clause means a
  committed row with a non-200 status or a missing body, or a verifier must re-fetch. The reference scorer does
  neither: V6 (`http_status: 404`) resolves.

## Fixtures that must fail (could-not-evaluate or unresolved), with reference-scorer results today

Generator: `node .ufo/waves/round-25/scratch/CritC2Vacuity/mk.mjs .ufo/waves/round-25/scratch/CritC2Vacuity`.
Scored with `node …/ref-check-source-reopen-receipt.mjs --file <f> --json`, with the exit code captured per file.

| fixture | shape | reference scorer today | required result |
|---|---|---|---|
| V1 `v1-forge-from-git` | bodies copied from `git show 9e136667:corpus/evidence/round-18/source-recheck/<id>.body.gz`, date relabelled 2026-10-25, no network | exit 0, 6/6 resolved | unresolved (no this-round fetch artifact beyond the digest) |
| V2 `v2-selfreport-empty-quote` | `quote_located:true`, empty quote, digest of "not the page" | exit 0, 6/6 | unresolved (quote ≠ canonical; no retained body matching the digest) |
| V3 `v3-generic-quote` | quote = "Playwright" or "WebMCP" | exit 0, 6/6 | unresolved (quote ≠ canonical) |
| V4 `v4-dangling-supersession` | S013 `absent` → `supersededBy:"S999"` | exit 0, 6/6, supersessions=1 | unresolved (dangling pointer) |
| V5 `v5-preexisting-supersession` | S013 `drifted` → `S028` (exists at baseline, supersedes S004) | exit 0, 6/6 | unresolved (row not new, wrong target) |
| V6 `v6-non200` | S020 `http_status:404` | exit 0, 6/6 | that row could-not-evaluate (one allowed; two → target misses) |
| V7 `v7-future-date` | `fetched_at: 2099-01-01` passes the `>= ROUND_DATE` check | exit 0, 6/6 | unresolved (fetch after the REV committer time) |
| V8 `v8-duplicate-row` | a good S013 shadows a failing duplicate S013 (`rows.find` takes the first) | exit 0, 6/6 | could-not-evaluate (duplicate row id) |
| V9 `v9-wrong-url` | every row's `url` = `https://playwright.dev/` | exit 0, 6/6 | unresolved (URL ≠ the row's SOURCES URL at baseline) |
| frozen `control/skipwork-freshness.json` | `fetchDigest:"legacy-2026-10-19"` string | exit 1, 0/6 | fail (passes today, but only because the forgery is a straw man; V1 is the real skip-work) |
| missing receipt | no file | exit 2, but JSON `reopened:0` | could-not-evaluate with no numeric `reopened` |

## Exact vacuous code shapes (must not ship in `scripts/check-source-reopen-receipt.mjs`)

1. `row.quote_located === true` accepted from the receipt. Ref line 29.
2. `/^[0-9a-f]{64}$/.test(row.sha256)` treated as "this round's digest". Ref line 26: the finding is named
   `sha256-not-this-round`, but the check only tests the hex shape.
3. `/^S\d{3,}$/.test(row.supersededBy)` treated as a supersession. Ref line 28. Also round-18's
   `rows.some(c => c.teaches.startsWith('supersedes X —'))` (`measure-c1.mjs:414`) with no baseline-absence, URL,
   date or retained-bytes check.
4. `fetchedAt >= ROUND_DATE` with no upper bound. Ref line 25.
5. No `http_status === 200` check, and no per-row could-not-evaluate state. A could-not-evaluate row must not count
   toward `reopened`, otherwise 5 real rows plus 1 failed fetch still report 6.
6. `rows.find(x => x.id === id)`, which silently ignores duplicates and extra rows. Ref line 20.
7. `--file <worktree path>` instead of `--rev`. The reference reads the worktree, not `git show REV:corpus/evidence/round-25/freshness/reopened.json`.
8. Missing receipt reported as `reopened: 0`. Ref lines 10 and 13.
9. `text.indexOf(normalize(q))` with `q` taken from the receipt and not rejected when empty (`recheck-fetch.mjs:110`),
   or any case-insensitive, word-bag or prefix matcher.

## Smallest safe correction

Counter, frozen before the claim is measured:
- Read the receipt and retained bodies only via `git show REV:`.
- Take each row's canonical quote from `git show 9e136667:corpus/lessons/kaika-fleet-round-1.md` at the frozen line
  numbers (56/58/59/63/66/67), and its URL from the baseline SOURCES row. Never read either from the receipt.
- Require for each row:
  - exactly one receipt row per declared id, and no extra ids;
  - `http_status === 200`;
  - a retained body (gzip) at REV whose sha256 equals the receipt digest;
  - retained response headers whose `date:` day is 2026-10-25 and is no later than REV's committer time;
  - the canonical quote located by the strict definition in (c), with offset and occurrence count recomputed.
- Accept a supersession only if the target row is absent at baseline, present at REV, has `teaches` starting with
  `supersedes <id> —`, carries the same URL host and path, is dated 2026-10-25, and has its own ≤25-word quote
  located in the same retained body.
- Treat a missing receipt or a missing body as could-not-evaluate (exit 2) with no numeric count. A could-not-evaluate
  row is excluded from `reopened`.
- Selftests must include V1–V9. V1 has to be framed honestly: a committed body plus headers can still be fabricated,
  so the counter proves consistency, not that a fetch happened. Say that in the claim rather than implying the digest
  proves freshness.

Claim text: change the "before" from `0 rows re-opened` to "receipt absent at baseline (could-not-evaluate); six
rows last located 2026-10-20 by round-18 receipts". Also add C1's missing-receipt sentence to C2's killRule.

## Is six rows enough to claim an axis move? Narrow it?

- **No axis move.** Six rows is 6/80 on-release rows (7.5%), or 6/74 live on-release rows. Round 18 re-opened a
  51-row cohort that includes all six, with retained bodies, and freshness stayed 8→8 (`SCORECARD.md:832`). A strict
  subset of an unscored cohort, chosen from the stablest rows and with a predetermined result, cannot move what 51
  did not. This matches `notClaimed[0]` ("no scalar axis promotion"), which the C2 write-up must not contradict
  with wording like "freshness improved".
- **Yes, narrow it explicitly.** State: "on 2026-10-25 the canonical held quotes of S013, S015, S016, S020, S023
  and S024 are located in this round's fetched bytes, which are byte-identical to the round-18 retained bodies; no
  statement about any other row, the 46 never-reopened on-release rows, or whether any release shipped". The
  freshness risk sits in S058–S105 and in the round-18 drift-history rows. A risk-weighted sample drawn from those
  would have been a real probe, but that is a re-plan, not an in-round fix, because the claims are frozen.
- One thing this round genuinely adds over round 18: response headers. For example, S023's `etag` went from
  `"6ad64547-41737"` (round 12) to `"6ad8f953-41737"`, and `last-modified` is now 2026-10-21, while the bytes are
  identical. That is evidence that a site rebuild without a content change is not drift. Round-18 receipts retain no
  headers (`jq 'has("headers")' S013.json` → false).

Report: .ufo/waves/round-25/w1/CritC2Vacuity.md
