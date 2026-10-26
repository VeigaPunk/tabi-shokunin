# CritC1Axis — C1 axis and sizing falsifier (tabi round 31, w1)

**Verdict (one paragraph).** C1's axis label holds: the surface it changes is a knowledge entry whose shape — signal → action → sourced numeric threshold — is exactly what `AXES.md` names as *depth* ("decision tables with real thresholds, named error signatures, cited sources"), and the lane holds no such table today. Its **sizing does not hold**. The frozen predicate ("`admitted >= 10` and `failing = 0`, live") is met by a ten-row table built from **one 12-word quote and one newly opened registry row**; I built and ran exactly that control in a scratch clone at the freeze commit and the frozen counter returned exit 0, population 10, admitted 10, failing 0, live, with **one distinct threshold value and one distinct source**. The frozen counter also admits a status code dressed as a threshold (`429 requests` quoting "The 429 status code indicates…"), so it cannot enforce the "real thresholds" half of the depth definition. Under prompt §9 this is the failure mode that must be fixed *before data*: the cheapest control that skips the claimed work meets the target, and the counter cannot tell the claimed table from a padded one. PROVINCE is not overreached (rate/rights discipline is owned), but the GitHub rows are REST-client thresholds and must be scoped to their client class.

Impacted axes: **depth** (measurement of the claim), **calibration** (the "held ground before" sentence overstates absence), **adjacency** (client-class scoping of the GitHub rows). No coverage, freshness or operability harm is shown by this attack.

---

## Q1 — Is a sourced-threshold decision table "depth", or quality/coverage/freshness under prompt §9?

**Verdict: holds as depth, with a required narrowing of the claim's "before" sentence (low severity).**

Evidence:

- `/home/vgpnk/Projects/shokunin/AXES.md` depth row, verbatim: "Verifiable technical detail — decision tables with real thresholds, named error signatures, cited sources." The new surface is a decision table with thresholds and cited sources; the axis is named by the surface, not by the number the counter produces (the §9 rule's own instruction).
- No decision table of this shape exists in the corpus at the freeze tree: `grep -rln 'Row | Signal' corpus/knowledge/` → no files (exit 1). The table shape is new ground, not a re-run of an existing rule on new inputs (the §9 quality-work exclusion).
- The §9 exclusion targets "re-scoring a rule the lane already holds on new inputs". C1 does not re-score: it adds numeric detail for signals the lane holds only as vocabulary. It therefore lands on the depth axis by the AXES definition.
- However, the claim's held-ground sentence — "no entry gives a sourced numeric threshold for any decision" — is **overstated**. `corpus/knowledge/host-published-rate-limit-headers.md:96` carries the sourced figure `"All bots can make up to 50 requests per second to our API."` and `:105` carries "a documented 10,000 per 10 minutes", with a recording rule attached ("Interaction endpoints … must not read as a breach of the global budget", `:100-101`). What is genuinely absent is a *signal → driver-action* mapping with a sourced number, not any sourced number attached to any decision. The surface sentence should say the narrower thing.

The distinguishing test I applied: does the round's changed surface add detail the corpus cannot already re-derive? For robots.txt redirect/cache/size limits, RFC 6585 status semantics, and GitHub primary/secondary quotas — yes. For the general rule "classify a rate signal", the lane already holds it (round-30 `rate-limit-policy-fields.md`, `host-published-rate-limit-headers.md`); the new entry is detail on a held rule, which AXES calls depth, not coverage.

## Q2 — Does any control, or a cheaper one I build, meet `admitted >= 10`?

**Verdict: defect (high).** None of the five frozen controls meets the target, but the cheapest skip-work control does, so the target does not measure the claimed surface.

Frozen controls (receipts under `.ufo/waves/round-31/baseline/`), exit codes read from the `.exit` files:

```
c1-J1-do-nothing.json.exit:        exit=1   (population 0, admitted 0)
c1-J2-old-rows.json.exit:          exit=1   (population 2, admitted 0, r4-new-row)
c1-J3-selfquote-live.json.exit:    exit=1   (population 2, admitted 0, l1-live)
c1-J3-selfquote-offline.json.exit: exit=0   (admitted 2 offline — excluded by the kill rule)
c1-J4-invented-thresholds.json.exit: exit=1 (population 3, admitted 0, n1-threshold-sourced)
c1-J5-package-as-is.json.exit:     exit=1   (population 0)
```

So the frozen control set proves the counter is not met by *do-nothing, old rows, self-quote, invented thresholds, or package-as-is*. It does not test **repetition**, the cheapest way to reach 10 rows.

I built the repetition control in a scratch clone at the freeze commit (`9505a10e…`, counter sha256 `d15f3bd7…` = `frozenDigests`) and committed it. Fixture: ten rows, all citing the **same** RFC 9309 quote, the **same** threshold `5 redirects`, ten different backticked signals, and six distinct closed-set verbs (`follow`, `cap`, `allow`, `stop`, `backoff`, `cache`); one new registry row (S119) with a genuine fetched RFC 9309 receipt:

```
node scripts/check-decision-table.mjs --rev 0be8da601d0fdb25e4dd7ad59cbd2a7bbb83ce53 \
  --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json
# exit 0
{ "population": 10, "admitted": 10, "failing": 0, "clean": true }
jq '{thresholds:([.rows[].threshold]|unique), sources:([.rows[].source]|unique), rows:(.rows|length)}'
# { "thresholds": [5], "sources": ["S119"], "rows": 10 }
```

Receipts: `w1/CritC1Axis/pad-live.json`, `pad-offline.json`, `fixture-entry-pad.md`, `fixture-revs.txt`. Offline run is also exit 0 (`admitted 10`), so `--live` does not add protection here: the quote is genuine, only the rows are padding.

The counter enforces uniqueness **only on the row id** (`scripts/check-decision-table.mjs:262-268`; selftest case `row-id-duplicate`). It has no `(source, quote)`, `(source, threshold)` or `(threshold value, unit)` uniqueness, and no check that S119–S122 each contribute a row. Confirmed by `grep -n "S119\|S120\|S121\|S122\|four\|4 sources" scripts/check-decision-table.mjs` → only the `NUMBER_WORDS` line (exit 0), i.e. no four-source constraint exists.

Second false-admission, same counter: the "threshold" need not be a threshold. A row with threshold `429 requests` quoting RFC 6585's "The 429 status code indicates that the user has sent too many requests in a given amount of time" is admitted live:

```
node scripts/check-decision-table.mjs --rev 0b88cc9d62eac3e4c9238a9780c6ccebc2430f1b --baseline 96a2d1a3… \
  --entry corpus/knowledge/rate-signal-decision-table.md --live --json
# exit 0
{ "population": 1, "admitted": 1, "failing": 0, "clean": true, "rows": [{ "row": "D1", "threshold": 429, … }] }
```

Receipt: `w1/CritC1Axis/bogus-live.json`, `fixture-entry-bogus.md`. `UNIT_RE` accepts any number followed by a unit word, and `n1-threshold-sourced` only checks that the number occurs in the quote — a 3-digit status code plus the word "requests" satisfies both. Likewise `t3-decision` accepts any closed-set verb without checking that the source entails it; my pad row `D7` says `stop` over a quote that says "SHOULD follow at least five consecutive redirects" and is admitted.

This is precisely the control §9 says must be built before freezing: "if it meets the target, the counter or target is wrong — fix it before data." Data has not landed (w1 is the first falsifier), so the rule can still be amended before any scoring.

## Q3 — Can `admitted >= 10` be landed honestly from the four named sources without padding?

**Verdict: feasible (holds), with a provenance caveat on S120 (RFC 6585).**

I fetched all four pages this round (read-only GETs; receipts in `w1/CritC1Axis/fetch-receipts.md`) and counted distinct threshold statements:

- **S119 RFC 9309** (`rfc9309.txt`, 25,265 B, sha256 `f633915d…`): 4 distinct numeric thresholds — at least five consecutive redirects (`:377`), 30 days (`:406`), 24 hours (`:419`), 500 KiB (`:425`).
- **S120 RFC 6585** (`rfc6585.txt`, 17,164 B, sha256 `f6d55d1b…`): **0 normative** numeric thresholds. Its numbers are status codes (428/429/431/511) and two example values inside the 429 response illustration — `Retry-After: 3600` (`:145`) and the example page's "I only allow 50 requests per hour" (`:153`). A populating row from S120 therefore has to cite either an example or a status code; the latter is the false admission shown in Q2.
- **S121 GitHub rate limits** (337,116 B, sha256 `ae5e1812…`): 17 distinct (number, unit) statements, e.g. 5,000 req/h, 60 req/h, 15,000 req/h, 1,000 req/h, 900 points/min, 2,000 points/min, 100 concurrent requests, 80 content-generating req/min, 500 content-generating req/h, 300 req/min, 3,000 req/min, 2,000 OAuth token req/h, 12,500 req/h, 50 req/h, 100 LFS objects/request, 30,000 LFS objects/min, 300,000 LFS objects/min.
- **S122 GitHub best practices** (328,088 B, sha256 `b15c1c0b…`): 2 distinct — "wait for at least one minute" (secondary limit) and "wait at least one second" between mutative requests.

So ≥10 rows is honestly reachable, but almost entirely from **one** page (S121); the "four registry rows" wording in the assignment is not part of the predicate, and S119/S122 supply 6 of the remaining candidates. The counter's target requires neither ten distinct thresholds nor four sources — Q2's ten-row/store-one-quote table meets it. If the L1 intends "rows cite all four", S120 is the weak link and the only admissible rows there are illustrative, not rule-bearing.

## Q4 — Does C1 overreach PROVINCE?

**Verdict: holds (in province), with a client-class scoping caveat.**

- `PROVINCE.md:6-12` owns "interaction records: site-specific gotchas, **rate/rights discipline**, login-session handling rules" (`:10`). Rate discipline is an owned surface, and the lane already holds host-published rate-policy material (S116 draft, S117 Discord) at the baseline. The round-27 refusal of staged S126 was evidentiary (the register's recorded quotes absent from the page), not provincial, so opening GitHub pages as independent rows does not cross the boundary.
- The caveat is scope, not province: GitHub's primary/secondary limits are documented for **authenticated REST API clients** (per-hour token budgets, point costs, concurrency), not for browser sessions. Each row must name its client class so a reader does not apply `5,000 requests/hour` to a browser journey. Related: the interaction approval table's C6 says a rate-limited third-party surface is operator-asleep-blocked and the first rate datum means "stop and report" (`corpus/knowledge/interaction-approval-table.md:62`); the new table's `wait`/`retry`/`backoff` actions are only coherent under an operator-approved journey and must not read as a self-granted budget.
- The notClaimed line already says nothing is run against a real host; that keeps the entry documentary, so no consequential action and no session material is touched.

## Defects, severity, and the smallest safe correction

1. **High — the target is met by one quote repeated ten times.** The predicate's `admitted >= 10` counts rows, not distinct sourced thresholds, and the counter enforces only row-id uniqueness. Smallest safe correction (before data, as a new freeze commit): add to the frozen predicate and counter (a) no two admitted rows may share the same `(source, threshold number, unit)` triple, and (b) admitted rows must come from at least four distinct registry rows (S119–S122, with S120 permitted to contribute a signal-only row rather than an illustrative figure). Add the pad fixture and the bogus fixture to the frozen control set with expected refusals, plus selftest cases for both; re-record `frozenDigests`.
2. **High — a status code is admitted as a "threshold".** `UNIT_RE` + `n1-threshold-sourced` accept `429 requests`. Smallest safe correction: require a time window for count units (`requests`/`points` must be followed by per second/hour/minute/day), or a size unit (`KiB`/`MiB`/`bytes`); a bare `N requests` is not a rate threshold. Selftest case: `threshold-status-code` expected `t4-threshold`.
3. **Low — the "held ground before" sentence overstates absence.** `host-published-rate-limit-headers.md:96,105` already pairs sourced numbers with a recording rule. Correction: state that no entry maps a signal to a **driver action** with a sourced numeric threshold.
4. **Moderate (risk, not yet material) — S120 has no normative numeric threshold.** If "rows cite four registry rows" means all four, the S120 row will be an example figure (`Retry-After: 3600`, `:145`; "50 requests per hour", `:153`) or a status code. Correction: either scope the requirement to "at least one row per cited source, and no row may cite an illustrative figure as a rule", or cite S120 as a source for the 429/Retry-After **signal** without a threshold row and say so.

None of these is a reason to move C1 off the depth axis; they are reasons the counting predicate must be strengthened before the L1 lands bytes.

---

## Commands run (with exit codes)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone   # exit 0
git -C $S/clone checkout -q 9505a10e…                                      # exit 0
sha256sum $S/clone/scripts/check-decision-table.mjs                        # d15f3bd7… = frozenDigests
node … --rev 9505a10e… --entry corpus/knowledge/rate-signal-decision-table.md --live --json
  # exit 1; population 0, admitted 0, entryPresent false   (before-reading confirmed)
node … --rev 0be8da60… (pad fixture) --live --json                          # exit 0; admitted 10, failing 0
node … --rev 0be8da60… (pad fixture) --json                                 # exit 0; admitted 10 (offline)
node … --rev 0b88cc9d… (429-requests fixture) --live --json               # exit 0; admitted 1
grep -n "S119\|S120\|S121\|S122\|four\|4 sources" scripts/check-decision-table.mjs  # exit 0; only the NUMBER_WORDS table, no source check
grep -rln 'Row | Signal' corpus/knowledge/                                  # exit 1, no files
```

Fetch receipts (URL, UTC time, HTTP status, bytes, sha256) are in `w1/CritC1Axis/fetch-receipts.md`; the two RFC texts are copied beside it. Scratch: `/fast/scratch/hyaku/tabi-r31/CritC1Axis/` (fixture commits `0be8da60…` pad, and the bogus commit in `fixture-revs.txt`). No lane tracked file, index or jj state was written; no subagent was dispatched; no tool was installed or upgraded.
