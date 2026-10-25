# ExecCounterC2Proto — C2 counter prototype (round 25, wave 1)

Seat: L1Tabi25.ExecCounterC2Proto (executor, leaf, read-only reporter). Lane HEAD at run time:
`c8ef3084c6363f265b9d23285296ab3547654f57` (`git rev-parse HEAD`), descends from baseline 9e136667.

## Outcome

A 177-line Node prototype of `scripts/check-source-reopen-receipt.mjs` scores all three required
fixtures as specified:

| fixture | reopened | resolved | unresolved | exit | verdict |
|---|---|---|---|---|---|
| `control/skipwork-freshness.json` | 6 | 0 | 6 | 1 | miss (`unresolved_rows`) |
| crafted clean 6/6 (`fixtures/clean-6of6.json`) | 6 | 6 | 0 | 0 | clean (1 supersession → S107) |
| dangling supersession (`fixtures/dangling-supersession.json`) | 6 | 5 | 1 | 1 | miss, S020 `supersession_dangling=S199` |

Command for each (cwd = `.ufo/waves/round-25/scratch/ExecCounterC2Proto/`, node v24.21.0):
`node check-source-reopen-receipt.mjs --file <fixture> --today 2026-10-25 --sources fixtures/SOURCES.fixture.md`

## Files (all under `.ufo/waves/round-25/scratch/ExecCounterC2Proto/`, no tracked file touched)

- `check-source-reopen-receipt.mjs` — prototype counter, 177 lines (`wc -l`), sha256 `26ead9ddfddbc1d067924b65d2eb99c65486395fa67bd3b3ef151c09890b2a8f`.
- `make-fixtures.mjs` — generator, 69 lines, sha256 `df5224f4297962c768a67a40e6a7d706b0b04019de9071440771d204b984c25c`.
- `fixtures/*.json` (15 receipts), `fixtures/raw/*.html` (7 **synthetic** byte files, never real fetches), `fixtures/SOURCES.fixture.md` (HEAD `corpus/SOURCES.md` + one synthetic row S107 opened 2026-10-25).
- Control scored unmodified: `control/skipwork-freshness.json` sha256 `b2f0d9ba4f3083f83ff44ac00449da21f031feea4baf1595f9a5af8a01a29df0`.

## Counter behavior (as built)

Modes: `--rev REV` (production: everything via `git show REV:<path>`) or `--file RECEIPT` (prototype
scoring; `--sources`, `--lesson`, `--today` overrides, file-mode only). `--json` for machine output.
Exit 0 = target met, 1 = target missed, 2 = could-not-evaluate / usage.

Constants: schema `tabi-source-reopen-v1`; baseline `9e13666759bcf30665abec84dec13adefc1fa86a`;
round date `2026-10-25`; declared rows S013 S015 S016 S020 S023 S024; receipt
`corpus/evidence/round-25/freshness/reopened.json`; raw bytes must live under
`corpus/evidence/round-25/freshness/` (rev mode).

Receipt-level stops (exit 2): receipt absent at REV (`receipt_absent`, "could-not-evaluate, never 0"),
REV not descending from baseline (`baseline_ancestry`), non-JSON, wrong schema / no `rows[]`.

Per declared row; any failure below makes the row **unresolved**:
- (a) `fetched_at` must be a date ≥ 2026-10-25 and ≤ the REV commit date (file mode: `--today`) → `fetched_at_missing|stale|future`.
- (b) `sha256` must be 64-hex, must NOT equal the row's 2026-10-19 digest held in `corpus/lessons/kaika-fleet-round-1.md` (`digest_is_legacy_2026-10-19`), must equal sha256 of the committed `raw_path` bytes (`digest_mismatch`, `raw_bytes_missing`), and in rev mode those bytes must be absent at baseline (`raw_bytes_predate_round`).
- (c) the counter independently locates the held quote: `held_quote` must equal the lesson's quote for that row (`held_quote_mismatch` blocks swapping in an easier quote); the quote is searched in the raw bytes after stripping script/style/tags, decoding entities, NFKC, curly→straight quotes, and removing all whitespace. `quote_located=true` that the counter cannot reproduce → `quote_located_false_claim`.
- `superseded_by` must be `S\d{3}`, ≠ row id, present in SOURCES at REV, absent at baseline, `opened` ≥ 2026-10-25 → else `supersession_malformed|dangling|not_new|not_this_round`.
- (d) `verdict ∈ {holds, drifted, absent}`. Resolved = `holds` with verified located quote, or `drifted|absent` with a valid supersession pointer. `drifted|absent` while the quote IS located → `verdict_contradicts_bytes`; without pointer → `drift_without_supersession`.
- `fetch_status` present and ≠ 200 → row is `could_not_evaluate` (neither resolved nor unresolved).
- Missing declared row → `row_absent` (unresolved, not counted reopened); duplicated → `row_duplicated`.

Aggregate: `reopened` = declared rows present; `supersessions` = resolved rows carried by a pointer;
target met iff reopened=6 ∧ unresolved=0 ∧ could_not_evaluate ≤ 1 (kill rule: >1 CNE misses honestly).
The receipt's self-reported `summary` is never trusted; disagreement is surfaced as `self_report_mismatch`.

## Retained evidence — full matrix (same command shape as above)

```
=== control (skipwork-freshness.json)
ROW id=S013..S024 (all six) state=unresolved why=fetched_at_missing,digest_not_sha256,raw_bytes_missing,held_quote_mismatch,holds_without_located_quote
SOURCE_REOPEN verdict=miss finding=unresolved_rows reopened=6 resolved=0 unresolved=6 could_not_evaluate=0 supersessions=0 self_report_mismatch=true   exit=1
=== clean-6of6
SOURCE_REOPEN verdict=clean finding=clean reopened=6 resolved=6 unresolved=0 could_not_evaluate=0 supersessions=1 self_report_mismatch=false   exit=0
=== dangling-supersession      S020 why=supersession_dangling=S199                 reopened=6 resolved=5 unresolved=1  exit=1
=== supersession-not-new       S020 why=supersession_not_new=S001                  unresolved=1  exit=1
=== quote-absent               S015 why=quote_located_false_claim,holds_without_located_quote  unresolved=1  exit=1
=== legacy-digest              S016 why=digest_is_legacy_2026-10-19,digest_mismatch  unresolved=1  exit=1
=== stale-fetched-at           S023 why=fetched_at_stale=2026-10-19                unresolved=1  exit=1
=== future-fetched-at          S023 why=fetched_at_future=2026-10-30>2026-10-25    unresolved=1  exit=1
=== held-quote-swap            S024 why=held_quote_mismatch                        unresolved=1  exit=1
=== drift-no-pointer           S020 why=drift_without_supersession                 unresolved=1  exit=1
=== drift-but-present          S015 why=verdict_contradicts_bytes                  unresolved=1 supersessions=1  exit=1
=== row-missing                S024 why=row_absent                                 reopened=5 unresolved=1  exit=1
=== row-duplicated             S013 why=row_duplicated                             unresolved=1  exit=1
=== one-cne                    S013 could_not_evaluate fetch_status=503            resolved=5 unresolved=0 cne=1  verdict=clean exit=0
=== two-cne                    S013 503, S015 ECONNRESET                           finding=could_not_evaluate_rows cne=2  exit=1
=== raw-escape                 S013 raw_path ../../… refused → raw_bytes_missing   unresolved=1  exit=1
=== clean-6of6 against HEAD SOURCES (no S107)   S020 why=supersession_dangling=S107  unresolved=1  exit=1
=== --rev HEAD --json
{"finding":"receipt_absent","detail":"corpus/evidence/round-25/freshness/reopened.json missing at c8ef3084c6363f265b9d23285296ab3547654f57: could-not-evaluate, never 0","target_met":false}   exit=2
=== --rev 8bc1d32 (pre-baseline)   finding=baseline_ancestry   exit=2
=== --rev HEAD --file x            finding=usage   exit=2
=== --rev HEAD --sources x         finding=usage   exit=2
```

Full `--json` output for the control was printed and retained in the seat transcript (six rows, each
with the five `why` codes above, `target_met:false`, `finding:"unresolved_rows"`).

Defect found and fixed during iteration: the first build counted a pointer on an unresolved row toward
`supersessions` (`drift-but-present` showed `supersessions=2`); now only resolved rows count (rerun shows 1).

## Risks / decisions for the L1 (observation vs inference kept separate)

1. **Legacy-equality false negative [INFERENCE].** Per the assignment, a digest equal to the 2026-10-19
   digest is unresolved. If a page is byte-identical today, an honest fresh fetch has that same digest
   and would be forced to supersede. Whether any of the six pages are byte-identical is UNKNOWN — this
   seat made no external fetch (none named in the item). Alternative: drop the equality rule and rely on
   committed-this-round raw bytes + `fetched_at`; byte-identical copies are indistinguishable either way.
2. **Freshness of bytes is not provable from bytes alone [INFERENCE].** Rev mode binds the digest to raw
   bytes committed under the round-25 path and absent at baseline; it cannot prove the bytes came from a
   live fetch today (old bytes could be re-committed). File mode skips the "absent at baseline" check.
3. **Quote matching on real pages unexercised.** Fixtures are synthetic (entities, `<code>` split,
   newline in phrase, curly quotes all matched). Dash variants (`-` vs `–`) are NOT normalized; S013's
   held quote contains ` - ` (lesson line 56) — if the live page renders an en dash, the honest verdict
   becomes `drifted` + supersession. UNKNOWN until the fetch seat runs.
4. **SOURCES row parse requires exactly 13 `|`-split cells**; a superseding row containing a literal `|`
   in a cell would read as dangling (fail-closed).
5. **Rev-mode positive path not exercised**: no receipt is committed and this seat may not commit, so
   only the `receipt_absent` / `baseline_ancestry` / usage paths ran against git.
6. `--selftest` (required by the frozen claim's `failureCapable`) is not in the prototype; the fixture
   matrix above maps directly onto its four named cases (stale-bytes, quote-absent, dangling, clean 6/6).
   Adding it in-file will push past 180 lines unless the generator logic moves into the selftest.

## Process / tooling

- Processes started: none (no http.server, no chromium). `pgrep -af 'http.server|chromium'` showed only
  processes owned by other seats/the user (e.g. `scratch/ExecHarnessC1`, omp headless daemon).
- Tools installed/updated: none. No external network access. No git writes. No subagents.
