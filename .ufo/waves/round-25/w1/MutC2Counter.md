# MutC2Counter — C2 counter mutation matrix (round 25, wave 1)

Seat: L1Tabi25.MutC2Counter (mutation-tester, read-only reporter). Lane HEAD at run time `c8ef3084c6363f265b9d23285296ab3547654f57` (one commit past baseline 9e136667: "round-25: freeze claims, controls, census-before, wave-1 spec"; observed with `git log --oneline 9e13666759bcf30665abec84dec13adefc1fa86a..HEAD`). No lane file was edited. Everything was written under `.ufo/waves/round-25/scratch/MutC2Counter/` plus this report.

## TL;DR

- **The matrix:** 7 assigned mutants (case 5 split into 5a and 5b because "verdict is absent" is ambiguous) plus 1 extra probe (4b) taken from the frozen killRule. All were killed by the scratch reference oracle with the expected finding id. The clean receipt scored clean. Every restored copy matched the clean bytes (sha256 `0f9a6e4e…ff35`).
- **The in-flight production counter fails this matrix.** `scripts/check-source-reopen-receipt.mjs` is untracked; I tested sha256 `f2e6f75b…7c58` (mtime 2026-10-25 09:17:36 -0300) through a scratch copy with only its I/O swapped. It has three defects:
  1. **Every supersession pointer is reported as dangling.** The SOURCES lookup regex uses POSIX `[[:space:]]`, which JavaScript does not support. It matches neither `| S107 |` nor `|S107|`, so the clean receipt false-fails (f5-unresolved).
  2. **The verdict field is never read.** m3 (drifted), m5a (field missing) and m5b (value `absent`) all **SURVIVE** with exit 0 when the receipt's summary agrees with the counter's own count.
  3. **Two other mutants slip through.** m6 (five rows, honest summary) exits 1 with an **empty findings list**, and m4b (pointer to an old, existing row) would survive once the regex is fixed.
- The skip-work control `control/skipwork-freshness.json` fails correctly under both detectors (unresolved=6).

## Axes

- Kill coverage: does each defect class have a mutant that one specific check, and only that check, kills?
- Finding precision: does the detector name the right finding id, not just some failure?
- Restoration fidelity: are the restored bytes identical to the clean bytes?

## Fixtures (scratch)

| file | sha256 | origin |
|---|---|---|
| `clean.json` | `0f9a6e4e00e5b7093915fc0b3bdb1d8973cc2cfc010597ffc394f09af6d7ff35` (1585 bytes) | 6 rows using real bytes, sizes, sha256 and `fetched_at` from ScoutFreshnessReopen's fetch (all HTTP/2 200, `date: Sun, 25 Oct 2026 12:15:24 GMT`, read from `scratch/ScoutFreshnessReopen/*.headers`). S020 is set to `verdict: drifted`, `quote_located: false`, `superseded_by: "S107"` **synthetically**, so the clean receipt exercises a valid supersession. The scout itself found 6/6 holds. |
| `SOURCES-fixture.md` | `2de19cf89386c4694fa60bf32d2ec626032d55a2c81d44c4d9bd301c7b5db649` | Lane `corpus/SOURCES.md` (`c1826c75…de98`) plus one fixture row inserted after S105: `\| S107 \| … \| supersedes S020 — fixture … \| mined \| 2026-10-25 \| on-release \| — \|`. `diff` shows a single added line at 119a120. |
| `oracle.mjs` | `24938de21f14f9420d7f8fa2a43fc44acda7e96780cc420503e3071f39e7105a` | Scratch reference checker implementing claims.json C2 and the w1-spec ExecCounterC2Proto rules. **Not the production counter.** |
| `run.mjs` | `2aa84e6c2ed75395ce478c1ec21f0d23ce56ce0d9053e2c4ffba17844cdb687a` | Builds the mutants, runs the oracle on the pristine copy, each mutant, and the restored copy, then runs the per-check ablation and the control. |
| `prod-copy.mjs` | `023f518ed3a2e8d0e67ec9463521f43f3351f1ba6862f1d2c8c898b21f2bf72f` | Copy of the production counter. Only `readBlob` reads files from env vars `FX_RECEIPT`/`FX_SOURCES` instead of `git show`, and `resolveRev` is skipped. The scoring logic is byte-identical (`diff -u` shows only those 3 hunks). |
| `prod-copy-regexfix.mjs` | `160c94d69516af6c0566641ee6f35b6233133dfe86bf971680e467ec40b47a2a` | Same copy with only `[[:space:]]` replaced by `\s`. Used to look past defect 1. |
| `run-prod.mjs` | `b005c7effee02f77fe85ce6d3565b4b538416ca1e31acb18813343d47d27ac2f` | Adapts each mutant to the production field names (`superseded_by` becomes `supersession`, and a `summary` is added with the oracle's honest counts), then runs `prod-copy.mjs`. |

Field names: `superseded_by` is my choice, because no field name for the pointer is frozen anywhere. The production counter reads **`supersession`** and **requires a `summary` object**. Whichever name the receipt producer (ExecFreshnessReceipt) uses has to match the counter.

## Mutation matrix (oracle), the contract the production counter must meet

Command: `node .ufo/waves/round-25/scratch/MutC2Counter/run.mjs` (exit 0). Pristine run: `exit=0 verdict=clean finding=reopen_clean reopened=6 resolved=6 unresolved=0 supersessions=1`.

Offsets are byte offsets into `clean.json`. Each anchor string was asserted to occur exactly once before replacement.

| # | mutant | exact byte change | expected finding id | oracle output (mutated) | verdict |
|---|---|---|---|---|---|
| 1 | m1-stale-fetched-at | offset 136, 52 bytes deleted, 52 inserted: S013 `"fetched_at": "2026-10-25T12:15:24Z", "bytes": 99073` becomes `"fetched_at": "2026-10-19T12:15:24Z", "bytes": 99073` (bytes `25` changed to `19`) | `stale_fetch` | exit=1 reopened=6 resolved=5 unresolved=1, row S013 `stale_fetch` | killed |
| 2 | m2-missing-sha256 | offset 188, 78 bytes deleted, 0 inserted: removes `, "sha256": "cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa"` from S013 | `missing_digest` | exit=1 reopened=6 resolved=5 unresolved=1, S013 `missing_digest` | killed |
| 3 | m3-drifted-located-no-pointer | offset 447, 109 deleted, 111 inserted: on S015, `"quote_located": true, "verdict": "holds"` becomes `"quote_located": true, "verdict": "drifted"` (no pointer present) | `drift_without_supersession` | exit=1 reopened=6 resolved=5 unresolved=1, S015 `drift_without_supersession` | killed |
| 4 | m4-dangling-pointer | offset 1062, 23 deleted, 23 inserted: S020 `"superseded_by": "S107"` becomes `"superseded_by": "S199"` (S199 is not a row in SOURCES-fixture.md) | `dangling_supersession` | exit=1 reopened=6 resolved=5 unresolved=1, S020 `dangling_supersession` | killed |
| 4b | m4b-pointer-to-old-row (extra probe, from the killRule clause "a new superseding row committed in the same round") | offset 1062, 23 deleted, 23 inserted: `"S107"` becomes `"S014"` (an existing row, opened 2026-10-19, whose teaches cell does not say "supersedes S020") | `stale_supersession` | exit=1 reopened=6 resolved=5 unresolved=1, S020 `stale_supersession` | killed |
| 5a | m5a-verdict-field-missing | offset 697, 109 deleted, 89 inserted: removes `, "verdict": "holds"` from S016 | `missing_verdict` | exit=1 reopened=6 resolved=5 unresolved=1, S016 `missing_verdict` | killed |
| 5b | m5b-verdict-value-absent | offset 697, 109 deleted, 110 inserted: S016 `"verdict": "holds"` becomes `"verdict": "absent"` (quote_located stays true, no pointer) | `absent_without_supersession` | exit=1 reopened=6 resolved=5 unresolved=1, S016 `absent_without_supersession` | killed |
| 6 | m6-five-rows | offset 1310, 269 deleted, 20 inserted: deletes the whole S024 line (`\n    {"id": "S024", … "verdict": "holds"}`) and the S023 trailing comma, so `"verdict": "holds"},\n<S024 line>\n` becomes `"verdict": "holds"}\n` | `declared_row_missing` | exit=1 **reopened=5** resolved=5 unresolved=0, missing=S024 | killed |
| 7 | m7-clean | none (identity) | `reopen_clean` | exit=0 reopened=6 resolved=6 unresolved=0 supersessions=1 | clean as expected |

Mutant sha256 values, in order: m1 `e4dc0c73…a64c`, m2 `22bc2dd2…a2c`, m3 `e3dfe968…817e`, m4 `a4c06f66…a358`, m4b `f4f2e61a…4629`, m5a `11d34ed8…a91f`, m5b `a0c16b40…f3a0`, m6 `35466c40…f965`, m7 `0f9a6e4e…ff35` (full values are in the run.mjs output).

Restoration: after each mutant, `work.json` was restored from `clean.json` and re-scored. All 9 restores gave `restored_sha256=0f9a6e4e…ff35 equal_to_clean=true` and `exit=0 finding=reopen_clean`. `clean.json` itself was never mutated in place.

### Ablation: each mutant is killed by exactly one check

Method: each oracle check was disabled in turn (`--disable <check>`), and every mutant was re-run.

| disabled check | survivors (expected finding no longer fires) |
|---|---|
| verdict | m5a (falls through to `drift_without_supersession`, still exit 1) |
| fetched_at | m1 (exit 0, clean) |
| sha256 | m2 (exit 0, clean) |
| quote | **none: no mutant in the assigned set exercises `holds` + `quote_located:false`** |
| pointer_present | m3 and m5b (fall through to `dangling_supersession`) |
| pointer_exists | m4 (exit 0, clean) |
| pointer_fresh | m4b (exit 0, clean) |
| declared_set | m6 (exit 0, clean) |

Coverage finding: the assigned matrix has **no quote-absent mutant**, yet claims.json C2 `failureCapable` names one ("quote-absent row (unresolved)"). The missing mutant is: on one `holds` row, change `"quote_located": true` to `"quote_located": false`, expected finding `quote_absent`. The production self-test does include it (case `quote-absent-no-supersession`).

### Control

`control/skipwork-freshness.json` (sha256 `b2f0d9ba…9df0`) under the oracle gives `exit=1 finding=stale_fetch reopened=6 resolved=0 unresolved=6`. All six rows report `stale_fetch`, because the control has no `fetched_at` field and uses `fetchDigest` rather than `sha256`.

## Production counter run (scratch copy, same mutants)

Command: `node .ufo/waves/round-25/scratch/MutC2Counter/run-prod.mjs`. Each mutant's summary is set to the oracle's honest counts.

| mutant | prod-copy output | verdict |
|---|---|---|
| clean (S020 superseded by S107) | exit=1 reopened=6 resolved=5 unresolved=1; `f5-unresolved: S020 supersession S107 does not resolve`; `f6-count-mismatch: summary.unresolved=0 computed=1` | **FALSE FAIL** |
| m7b clean, all holds (no pointer) | exit=0 reopened=6 resolved=6 unresolved=0 findings=[] | clean |
| m1, m2, m3, m4, m4b, m5a, m5b, m6 on the supersession base | all exit=1, but every one also carries the S020 false `f5-unresolved` | masked, so not evidence |

Regex probe (observed): `node -e` testing ``new RegExp(`^\\|[[:space:]]*S107[[:space:]]*\\|`,"m")`` against `| S107 | x |` gives false, and against `|S107| x |` gives false. In JavaScript, `[[:space:]]` is the character class `[[:space:]` followed by a literal `]`.

**Unmasked pass** (S020 normalised to holds, `quote_located: true`, no pointer; honest summary):

| mutant | prod-copy output | verdict |
|---|---|---|
| m1 | exit=1 `f3-fetched-date: S013 fetched_at=2026-10-19T12:15:24Z` | killed |
| m2 | exit=1 `f4-fetch-digest: S013 sha256=undefined` | killed |
| m3 | exit=1, computed unresolved=0; the only finding is `f6-count-mismatch: summary.unresolved=1 computed=0` | killed only by the summary comparison |
| m5a | same as m3 | killed only by the summary comparison |
| m5b | same as m3 | killed only by the summary comparison |
| m6 | exit=1 reopened=5 unresolved=0 **findings=[]** | killed, but with no finding id |

**Self-consistent summary** (summary `{reopened:6,resolved:6,unresolved:0}`, which matches what the counter itself computes):

| mutant | prod-copy | oracle | verdict |
|---|---|---|---|
| selfconsistent-m3 (`593fc04b…16d5`) | `{"reopened":6,"resolved":6,"unresolved":0,"findings":[],"clean":true,"exit":0}`, prod_exit=0 | exit=1 `drift_without_supersession` | **SURVIVED** |
| selfconsistent-m5a (`ed1042cc…8203`) | clean, exit 0 | exit=1 `missing_verdict` | **SURVIVED** |
| selfconsistent-m5b (`9cf81d35…83d4`) | clean, exit 0 | exit=1 `absent_without_supersession` | **SURVIVED** |

Cause (read from source lines 116-117): `if (row.quote_located === true) { resolved++; }` runs before any verdict logic, and `verdict` is never read anywhere in `score()`.

m6 with a lying summary (`summary.reopened=6` over 5 rows) gives exit=1 `f6-count-mismatch: summary.reopened=6 rows=5`, so the five-rows mutant only gets a finding id when the summary lies.

**Regex-fixed copy** (`prod-copy-regexfix.mjs`):

| mutant | output | verdict |
|---|---|---|
| m7-clean | exit=0 reopened=6 resolved=6 unresolved=0 findings=[] | clean (defect 1 is the only cause of the false fail) |
| m4 | exit=1 `f5-unresolved: S020 supersession S199 does not resolve` | killed for the right reason |
| m4b | exit=1 computed unresolved=0, only finding `f6-count-mismatch: summary.unresolved=1 computed=0` | killed only by the summary comparison |
| m3 | same pattern as m4b | killed only by the summary comparison |

[INFERENCE] With a self-consistent summary, m4b survives the regex-fixed copy. Computed unresolved=0 is observed, so the only finding would disappear. This is the same mechanism observed for selfconsistent-m3.

Production control: `FX_RECEIPT=…/control/skipwork-freshness.json node prod-copy.mjs --rev fixture` gives exit=1 unresolved=6, six `f3-fetched-date … fetched_at=undefined`, plus `f6-count-mismatch: summary.unresolved=0 computed=6`. The control fails correctly.

[INFERENCE, not run] The production `--selftest` case `five-rows` expects `f6-count-mismatch`, but builds `summary.reopened=5` over 5 rows. The unmasked-m6 run of the identical scoring logic produced `findings=[]`, so that self-test case should report `ok:false`. I did not run `--selftest`, because it creates git repos under `/tmp`, outside my write scope.

## Required behavior for the production counter (derived from the matrix)

The finding ids below are proposed for the counter's `fN-` naming. The oracle's names are in parentheses.

| case | required result |
|---|---|
| m1 | exit 1, `f3-fetched-date` (stale_fetch) |
| m2 | exit 1, `f4-fetch-digest` (missing_digest) |
| m3 | exit 1, a row-level unresolved finding for verdict drifted without a pointer, **independent of `quote_located` and of the summary** (drift_without_supersession) |
| m4 | exit 1, `f5-unresolved` dangling (dangling_supersession); needs the regex fixed |
| m4b | exit 1, the pointer must name a row opened this round whose teaches cell reads `supersedes <id>` (stale_supersession) |
| m5a | exit 1, `verdict` missing or not in `holds\|drifted\|absent` makes the row unresolved (missing_verdict) |
| m5b | exit 1, verdict `absent` without a pointer makes the row unresolved (absent_without_supersession) |
| m6 | exit 1 with a **declared-row-missing finding id naming S024**, emitted whatever the summary says (declared_row_missing) |
| quote-absent (gap) | exit 1, `f5-unresolved` (quote_absent) |
| m7 clean, including one valid same-round supersession | exit 0, no findings |

## Not covered (unknowns)

- **A real but old digest passes.** A 64-hex `sha256` copied from an earlier fetch, paired with a 2026-10-25 `fetched_at`, passes both detectors. "This round's digest" is enforced only through the date. No prior 64-hex digests for these rows exist in the scout data (its table marks the prior digest column as a label, not a sha), so I could not build this mutant from real data.
- **Could-not-evaluate rows are not modelled.** The killRule's per-row could-not-evaluate path (fetch failure at measure time) is in neither the oracle nor the production counter. This was not part of the assignment.

## Hygiene

- Processes: `ps -eo pid,cmd | grep -E 'prod-copy|oracle.mjs|run(-prod)?\.mjs'` returned "no leftover processes". No servers or browsers were started.
- Lane files: the production counter hash `f2e6f75b…7c58` was identical at both reads. Lane `git status --short` showed only `?? .ufo/waves/round-25/assimilation/`, `?? .ufo/waves/round-25/w1/`, `?? scripts/check-bfcache-receipt.mjs` and `?? scripts/check-source-reopen-receipt.mjs`, none of which are mine apart from this report under w1/.
- Tools installed or updated: none. node v24.21.0 was already present.
