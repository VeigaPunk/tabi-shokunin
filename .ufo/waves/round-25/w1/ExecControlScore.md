# ExecControlScore — round 25 wave 1 (skip-work controls vs prototype counters and naive greps)

Seat: L1Tabi25.ExecControlScore. Read-only reporter. Repo HEAD `c8ef3084c6363f265b9d23285296ab3547654f57`
("round-25: freeze claims, controls, census-before, wave-1 spec"), one commit on top of baseline
`9e136667` (`git merge-base --is-ancestor 9e13666759bcf30665abec84dec13adefc1fa86a HEAD` → exit 0).
All commands were run from `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25`.
Tool installs: none. Processes launched: none besides `node`/`grep`/`sha256sum` one-shots (no servers, no browsers).

## Result

Both frozen controls behave as expected, and both naive grep controls would falsely meet their targets.
But each prototype counter fails in a way that the frozen controls do not catch:

- **LOUD — the C1 prototype goes GREEN on a forged receipt.** A receipt with two fabricated
  `BackForwardCacheRestore` events (no Navigation events, one goBack, self-computed digest) scores
  `valid=true, restores=2, exit 0`. The frozen control only fails because its `events` array is empty;
  it does not test a forger who fabricates events. The counter as written does not meet the claim's kill rule.
- **LOUD — the C2 prototype goes RED on honest work.** On the sibling's real fresh-fetch receipt it
  reports `unresolved=5`. The `digest_is_legacy_2026-10-19` rule rejects five rows whose pages simply
  have not changed since 2026-10-19: today's HTTP-200 bytes hash to the same value as the held digests.
  With this rule in place, C2's target is unreachable however honest the work is.

| Check | Command (abbrev.; full in receipts) | Output | Expected | Verdict |
|---|---|---|---|---|
| C1 control vs C1 prototype | `node scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs --file control/fake-receipt-bfcache.json --json` | exit 1, `valid=false`, `restores=0`, findings `events-empty, restore-unbacked, digest-missing` | invalid | met |
| C1 naive | `grep -c 'BackForwardCacheRestore' …/corpus/knowledge/*.md \| awk -F: '{s+=$2} END{print s}'` | `3` | ≥1 | falsely meets |
| C2 control vs C2 prototype | `node scratch/ExecCounterC2Proto/check-source-reopen-receipt.mjs --file control/skipwork-freshness.json --json --repo …` | exit 1, `reopened=6 resolved=0 unresolved=6` | unresolved=6 | met |
| C2 naive | `grep -c 'on-release' …/corpus/SOURCES.md` | `80` | ≥6 | falsely meets |
| C1 stronger forgery vs C1 prototype | `node scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs --file scratch/ExecControlScore/forged-selfdigest-proto-bfcache.json --json` | exit 0, `valid=true`, `restores=2` | invalid | **GREEN ON FORGERY** |
| Honest fresh receipt vs C2 prototype | `node scratch/ExecCounterC2Proto/check-source-reopen-receipt.mjs --file scratch/ExecFreshnessReceipt/reopened.json --today 2026-10-25 --repo …` | exit 1, `resolved=1 unresolved=5` | resolvable | **RED ON HONEST WORK** |

Receipts (JSON):
- `scratch/ExecControlScore/receipt-c1-control.json`
- `scratch/ExecControlScore/receipt-c2-control.json`

## C1 detail

The control file has sha256 `578a466a…2bbc` (`sha256sum control/*.json`). Its full prototype output:

```
{"receipt_present":true,"restores":0,"claimed_restores":2,"valid":false,
 "findings":[{"id":"events-empty"},{"id":"restore-unbacked","detail":"summary.restores=2 observed=0"},{"id":"digest-missing"}],"verdict":"failed"}  exit=1
```

The naive grep's 3 hits all come from one file:
`grep -c 'BackForwardCacheRestore' …/corpus/knowledge/*.md | grep -v ':0$'` → `navigation-history-bfcache-evidence.md:3`.
That is round-24 documented-upstream prose, not a runtime observation. A grep therefore "meets" `≥1` at the
baseline with zero work.

Other prototype runs:
- `--rev HEAD --json --repo /home/vgpnk/Projects/shokunin/tabi-shokunin` → exit 2, `could-not-evaluate`,
  "receipt absent at c8ef3084…". The prototype correctly reports a missing receipt as could-not-evaluate, never 0.
- `--selftest` → `BFCACHE_RECEIPT_SELFTEST verdict=clean cases=7 passed=7`, exit 0.
- On its own `synthetic-valid-receipt.json` → exit 0, `valid=true restores=1`.

**Forgery that passes.** File `scratch/ExecControlScore/forged-selfdigest-proto-bfcache.json`: the control's
steps (navigate A, navigate B, goBack A), with `events` set to two identical main-frame
`{"method":"Page.frameNavigated","params":{"frame":{"id":"F","url":"http://127.0.0.1:19411/a.html"},"type":"BackForwardCacheRestore"}}`
entries, `summary.restores` unchanged at 2, and `digest = "sha256:" + sha256(JSON.stringify(events))`.
The prototype output was `{"restores":2,"claimed_restores":2,"valid":true,"findings":[],"verdict":"clean"}`, exit 0.

The cause: the digest only covers the events in the receipt itself, so anyone who writes the receipt can
recompute it. None of the checks (a)–(d) require a restore to have a prior original load, and none bound the
restore count by the number of goBacks.

**Invariant observed in real Chromium events.** The five diagnostics captures contain real CDP events
(`scratch/ExecBfcacheDiagnostics/runs/*/capture.json`, sha256 values in the C1 receipt). In all four goBack or
history.back runs (v1-goback, v2-historyback, v1-goback-r2, v1-goback-r3), the main-frame restore event reuses
the `loaderId` of the original A `Navigation` event. Example from v1-goback:

```
Navigation               …/a.html loaderId=8DFC0ECCFCED3BB7BE3BF2671ECE9056
Navigation               …/b.html loaderId=623A3878FA9FC694401A074FE4BDA52F
BackForwardCacheRestore  …/a.html loaderId=8DFC0ECCFCED3BB7BE3BF2671ECE9056
```

In the disabled-cache control (v3), the return to A is a `Navigation` with a new loaderId (`7D441B5F…`).

`scratch/ExecControlScore/extra-guards-bfcache.mjs` adds three checks on top of the prototype:
- each restore must be preceded by a main-frame Navigation with the same URL and loaderId, with a navigation
  to a different URL in between;
- restores must not exceed the number of goBacks;
- no duplicate events.

Results:
- forgery → exit 1, `duplicate-event, restore-without-original-load(url=…/a.html), restores-exceed-goBacks(2>1)`;
- all four real goBack captures → exit 0, restores=1;
- v3 disabled control → exit 0, restores=0;
- prototype synthetic-valid → exit 0.

[INFERENCE] These guards raise the cost of forgery but do not make it impossible. A forger who copies a
real-shaped A/B/A sequence with matching loaderIds would still pass. A receipt-only counter cannot tell
fabricated events from real ones. The kill rule's phrase "trace to a real Page.frameNavigated event in the
run's committed raw event log" needs the raw CDP log committed as its own file with its own digest, plus these
structural invariants. The prototype currently reads `receipt.events` only.

## C2 detail

The control file has sha256 `b2f0d9ba…9df0`. Every row fails with
`fetched_at_missing, digest_not_sha256, raw_bytes_missing, held_quote_mismatch, holds_without_located_quote`.
The output also has `self_report_mismatch=true` and `finding=unresolved_rows`, exit 1.

The control is weak in one respect: it uses the field `fetchDigest` instead of `fetched_at`/`sha256`, so it
fails on field names before the legacy-date logic is ever exercised.
`scratch/ExecControlScore/stronger-skipwork-freshness.json` uses the prototype's field names, with
`fetched_at=2026-10-19`, a 64-hex sha256, `quote_located=true`, `verdict=holds`, and no raw bytes. It is still
`unresolved=6`, exit 1, with `fetched_at_stale=2026-10-19, raw_bytes_missing, held_quote_mismatch,
quote_located_false_claim, holds_without_located_quote`. The prototype holds up against this stronger control.

`--rev HEAD --json --repo …` → exit 2, `{"finding":"receipt_absent",…"could-not-evaluate, never 0"}`.

The naive grep `grep -c 'on-release' …/corpus/SOURCES.md` → `80`. It counts lines that mention the cadence,
not rows re-opened this round, so it "meets" `≥6` at baseline with zero work.

**False negative on honest work.** Receipt `scratch/ExecFreshnessReceipt/reopened.json` (sha256 `1ee46d6a…acf`)
scores exit 1, `reopened=6 resolved=1 unresolved=5`. All five unresolved rows fail only on
`digest_is_legacy_2026-10-19`. I compared sha256 values (first 16 hex characters shown):

| Row | today (ExecFreshnessReceipt raw) | today (ScoutFreshnessReopen, independent fetch) | held 2026-10-19 (`corpus/lessons/kaika-fleet-round-1.md`) | equal |
|---|---|---|---|---|
| S013 | cf48ff4db0a305f9 | cf48ff4db0a305f9 | cf48ff4db0a305f9 | yes |
| S015 | 31075410ae19edfe | 31075410ae19edfe | 31075410ae19edfe | yes |
| S016 | 1bb8afe888af0921 | 1bb8afe888af0921 | 1bb8afe888af0921 | yes |
| S020 | 5627596668946732 | 5627596668946732 | a8f757909ae3c04f | no (resolved) |
| S023 | 234a24527d5a96e6 | 234a24527d5a96e6 | 234a24527d5a96e6 | yes |
| S024 | bbbad68813416192 | bbbad68813416192 | bbbad68813416192 | yes |

All six fetches had `fetch_status=200` and `fetched_at=2026-10-25T12:15:51–52Z`.

Unchanged bytes are the normal outcome for a page that still holds. A digest equal to the 2026-10-19 digest
does not show the bytes were reused. Freshness is already shown by `fetched_at ≥ 2026-10-25` and, in `--rev`
mode, by `raw_bytes_predate_round` (the raw file must not exist at baseline). [INFERENCE] Dropping the
`digest_is_legacy_2026-10-19` rule keeps both controls red: their failures never depend on it. It would also
let the honest receipt reach 6/6. I did not run a patched counter (scripts are out of my scope).

## Risks and blockers

- C1: the prototype does not satisfy the frozen kill rule against a fabricated-events receipt. The kill rule
  says "every counted restore must trace to a real Page.frameNavigated event in the run's committed raw event
  log". The selftest's `forged-receipt` case only covers the empty-events form. The production counter should
  add the forgery above as a selftest case that must fail.
- C2: as written, the prototype makes the target miss for any page unchanged since 2026-10-19, even with
  honest work.
- Neither naive grep is a usable counter: they read 3 and 80 at baseline.
- Scratch artifacts (throwaway, under `scratch/ExecControlScore/`): `ref-check-bfcache-receipt.mjs` and
  `ref-check-source-reopen-receipt.mjs` (spec-literal reference counters, written before the prototypes landed;
  the C1 reference also goes green on `forged-selfdigest-bfcache.json`), `extra-guards-bfcache.mjs`,
  `sanity-valid-bfcache.json`, `sanity-clean-freshness.json`, `forged-selfdigest-bfcache.json`,
  `forged-selfdigest-proto-bfcache.json`, `stronger-skipwork-freshness.json`, and the two receipts.
  No tracked files were edited, and no git writes were made.
