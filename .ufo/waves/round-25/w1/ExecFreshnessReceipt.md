# ExecFreshnessReceipt — round-25 C2 draft freshness receipt (tabi, hyaku run 6)

Seat: `L1Tabi25.ExecFreshnessReceipt` (executor, read-only reporter, lane-dispatched; this is not a non-author check).
Installs: none. Processes started: none other than short-lived `curl` and `node` runs. I started no server or browser. The `http.server :8765/:8766` and `chromium` processes visible in `pgrep` belong to other seats.

## Verdict (TL;DR)

- **Receipt assembled:** `.ufo/waves/round-25/scratch/ExecFreshnessReceipt/reopened.json`, schema `tabi-source-reopen-v1`, sha256 `1ee46d6a8aebd0421686cf6eb7d3830dc316e54c04b3fd3caf0e0025f7ba1acf`. All six held quotes are present in today's bytes. All six verdicts are `holds`. No superseding row is needed, so none is proposed.
- **The C2 prototype counter scores the receipt as a MISS:** `reopened=6 resolved=1 unresolved=5`. The five unresolved rows (S013, S015, S016, S023, S024) fail on a single reason, `digest_is_legacy_2026-10-19`. Today's correctly fetched bytes are byte-identical to the 2026-10-19 seat fetch, and the prototype treats "sha256 equals the legacy digest" as stale.
- **That check is redundant and blocks the target.** I made a scratch copy with only that line removed. It changes no fixture verdict and no control verdict, and it scores this receipt `clean 6/6/0`. Details are in §4. This is a counter-design finding for the L1 and ExecCounterC2Proto. I did not edit their file, and per the contract I sent no messages.

## 1. Fetch (observed)

Command, run in parallel for each row in `scratch/ExecFreshnessReceipt/bytes/`:
`curl -sS -L --max-time 60 -o <ID>.html -D <ID>.headers -w '%{http_code} %{size_download} %{url_effective}' <URL>` (curl 8.23.0). `fetched_at` is `date -u` taken at the end of each fetch.

| id | URL | fetched_at | HTTP | bytes | sha256 | = 2026-10-19 seat digest? |
|---|---|---|---|---|---|---|
| S013 | https://playwright.dev/docs/test-retries | 2026-10-25T12:15:52Z | 200 | 99073 | `cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa` | yes (lesson :56) |
| S015 | https://playwright.dev/docs/actionability | 2026-10-25T12:15:51Z | 200 | 47845 | `31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d` | yes (:58) |
| S016 | https://playwright.dev/docs/test-assertions | 2026-10-25T12:15:51Z | 200 | 159543 | `1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c` | yes (:59) |
| S020 | https://webmachinelearning.github.io/webmcp/ | 2026-10-25T12:15:52Z | 200 | 511987 | `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` | no (seat `a8f75790…`); = round-18 S020.json (2026-10-20) |
| S023 | https://playwright.dev/docs/locators | 2026-10-25T12:15:52Z | 200 | 268087 | `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` | yes (:66) |
| S024 | https://playwright.dev/docs/aria-snapshots | 2026-10-25T12:15:51Z | 200 | 125426 | `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` | yes (:67) |

The bytes, sha and status come from `cat *.status; sha256sum *.html; wc -c *.html`. The seat digests come from `corpus/lessons/kaika-fleet-round-1.md` lines 56/58/59/63/66/67.

Triangulation: two other seats fetched the same pages independently today. Their bytes are identical to mine for all six rows.
- ScoutFreshnessReopen: `sha256sum` of `scratch/ScoutFreshnessReopen/*.html` diffed against mine printed `SCOUT_BYTES_IDENTICAL`.
- ScribeSOURCESRows: `scratch/ScribeSOURCESRows/<id>.body`, fetched 2026-10-25T12:15:58Z. The 12-hex sha prefixes match mine for all six.

## 2. Quote location (observed)

- **Held quote:** the ≤25-word quote recorded for each row in `corpus/lessons/kaika-fleet-round-1.md` §Gate. The SOURCES `teaches` cell is a paraphrase, not the quote.
- **Locator:** `scratch/ExecFreshnessReceipt/assemble.mjs`, sha256 `072d3ad9820acb37884907dfe409c800f1e33946bfd2e739d2cd37c852479345`. It imports `decodeBody(..., 'html-text')` and `normalize()` from `.ufo/waves/round-18/recheck-fetch.mjs`, so it uses the same method as the round-18 recheck. It also runs a tag-tolerant raw regex to find the raw line.

| id | quote_located | normalized-text offset | occurrences | raw line | section (from excerpt) | verdict |
|---|---|---|---|---|---|---|
| S013 | true | 3529 | 1 | 68 | §Retries ("Playwright Test will categorize tests as follows") | holds |
| S015 | true | 1230 | 1 | 5 | §Introduction | holds |
| S016 | true | 1402 | 1 | 7 (quote split by `<a>` around "async matchers") | §Introduction | holds |
| S020 | true | 586 | 1 | 872 | Abstract | holds |
| S023 | true | 4509 | 1 | 36 (quote split by `<strong>` around "do not replace") | §Locate by role | holds |
| S024 | true | 4648 | 1 | 56 | §Aria snapshots | holds |

Cross-checks:
- The raw lines match ScoutFreshnessReopen's `locate-out.json` exactly (68/5/7/872/36/56).
- S020's normalized offset of 586 equals round-18's `quoteOffset` on the same bytes. That is expected, because both runs use the same normalizer.

**S020 anchor (observation; verdict unchanged).** Today's bytes carry `<meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision">` and `dt-updated 2026-10-20`. The registry anchor cell says `CG-DRAFT 2026-10-16, revision f14762e6`. This drift is already known: `corpus/knowledge/source-recheck-round-18.md:118` records it and `:127` sets the precedent that "Moving anchors are not drift" and that no superseding row is opened. The receipt records the drift in the row's `anchor_observed` field.

## 3. Superseding rows proposed

**None.** Zero rows have an absent quote, so the receipt has `supersessions=0` and every row's `superseded_by` is `null`.

Id guard, in case the L1 still chooses to re-anchor S020: HEAD's registry ends at S105 (`grep -n -E '^\| S1[0-9][0-9] ' corpus/SOURCES.md`). S106 is taken this round by the ScoutOpenS106/ScribeSOURCESRows lane (`scratch/ScribeSOURCESRows/S106-*`). The next free id would be S107. Round-18 precedent argues against using it here.

## 4. C2 prototype counter run

Counter: `scratch/ExecCounterC2Proto/check-source-reopen-receipt.mjs`, sha256 at run time `c8739cd533f1c01d57f6bda291eddcde7b0bd7faaa92cb9c3d05b7d41bc8bc8b`. File mode uses HEAD (`c8ef308`) for SOURCES and the lesson, and today's date (2026-10-25).

The receipt uses the counter's field names: `held_quote`, `raw_path`, `superseded_by`, `fetch_status`, and boolean `quote_located`. Each `raw_path` is in the committed form, `corpus/evidence/round-25/freshness/<id>.html`. The bytes are mirrored at `scratch/ExecFreshnessReceipt/corpus/evidence/round-25/freshness/`, so the receipt's paths resolve in file mode.

```
$ node ../ExecCounterC2Proto/check-source-reopen-receipt.mjs --file reopened.json
ROW id=S013 state=unresolved why=digest_is_legacy_2026-10-19
ROW id=S015 state=unresolved why=digest_is_legacy_2026-10-19
ROW id=S016 state=unresolved why=digest_is_legacy_2026-10-19
ROW id=S020 state=resolved
ROW id=S023 state=unresolved why=digest_is_legacy_2026-10-19
ROW id=S024 state=unresolved why=digest_is_legacy_2026-10-19
SOURCE_REOPEN verdict=miss finding=unresolved_rows reopened=6 resolved=1 unresolved=5 could_not_evaluate=0 supersessions=0 self_report_mismatch=true revision=file:reopened.json
exit=1
```

The JSON output is saved at `scratch/ExecFreshnessReceipt/counter-out.json`. Every row reports `located: true`. The only failing reason is the legacy-digest equality.

**Frozen skip-work control** (`node <counter> --file ../../control/skipwork-freshness.json`): `verdict=miss reopened=6 resolved=0 unresolved=6`. Each row fails on `fetched_at_missing, digest_not_sha256, raw_bytes_missing, held_quote_mismatch, holds_without_located_quote`. The legacy-digest check is not among them.

**Patched-copy experiment.** `scratch/ExecFreshnessReceipt/counter-nolegacy.mjs` (sha256 `2d6f7ab3…3ac`) is the prototype with one line deleted. `diff` shows only `96d95 < else if (held && row.sha256 === held.digest) why.push('digest_is_legacy_2026-10-19');`.

| input | original prototype | patched copy |
|---|---|---|
| this receipt | miss 6/1/5 | **clean, reopened=6 resolved=6 unresolved=0, self_report_mismatch=false, exit 0** |
| control/skipwork-freshness.json | miss 6/0/6 | miss 6/0/6 (same) |
| 15 prototype fixtures (`fixtures/*.json`, `--sources fixtures/SOURCES.fixture.md --today 2026-10-25`) | — | all 15 verdict/finding/counts **same** |
| fixtures/legacy-digest.json, S016 | unresolved | unresolved, `why=digest_mismatch` |

The fixture loop is in the shell transcript: for every fixture it printed `same`. The control's `exit=0` in that transcript is `tail`'s exit code, not the counter's.

**Reading [INFERENCE from the table above]:** in rev mode, freshness is already proven by four checks: `fetched_at >= 2026-10-25`, raw bytes committed under `corpus/evidence/round-25/freshness/`, those bytes absent at baseline (`raw_bytes_predate_round`), and `sha(raw) == row.sha256`. Re-using a legacy digest without the matching raw bytes is caught by `digest_mismatch`.

Digest inequality is therefore not a freshness signal. A stable page fetched fresh today legitimately returns the 2026-10-19 bytes: Playwright's `last-modified` moved to 2026-10-21 while the bodies did not change (ScoutFreshnessReopen §Observations). With the equality check, C2 can resolve only rows whose page happened to change. That fails the claim's own text: "A resolved row must carry this round's fetch digest", and this round's fetch digest is `cf48ff4d…` etc.

Recommendation to the counter owner: drop the equality check, or replace it with the rev-mode `raw_bytes_predate_round` check, which already exists. The frozen counter must also stay consistent with `claims.json`, which does not require the digest to differ.

## 5. Integration risks

- **Raw bytes must be committed uncompressed** under `corpus/evidence/round-25/freshness/` (about 1.21 MB total, `wc -c`). The counter hashes the raw file as stored. If the bodies are gzipped the way round 18 did, every row becomes `digest_mismatch`, unless the frozen counter gunzips.
- **`fetched_at` must not be later than the measured commit's date** (rev-mode `today` = `%cs` of `<REV>`). A commit on or after 2026-10-25 satisfies this.
- **The scout's draft JSON uses different field names** (`quote`, an object-valued `quote_located`, no `raw_path`/`held_quote`). It would score unresolved under the prototype. Use this receipt's fields.
- **Rev mode was not exercised.** It needs a commit, and I may not perform git writes. Only `--file` mode was run.
- **The prototype may still change.** The sha recorded above pins the version I ran.

## Files written

All files are under `.ufo/waves/round-25/scratch/ExecFreshnessReceipt/`:
- `bytes/<id>.{html,headers,status,fetched_at}`
- `corpus/evidence/round-25/freshness/<id>.html` (mirror copies)
- `assemble.mjs`
- `reopened.json`
- `counter-out.json`
- `counter-nolegacy.mjs`

I also wrote this report. No tracked file was touched.

## Unknowns

- The frozen `scripts/check-source-reopen-receipt.mjs` does not exist in the tree yet, so its final legacy-digest behavior is unknown.
- I did not judge whether each row's `teaches` paraphrase still follows from the page. I checked the quotes only.
