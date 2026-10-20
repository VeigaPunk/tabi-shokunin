
## Round 18 — source recheck, hardened harness, freshness wrapper (2026-10-20)

Append-only. Plan: `.ufo/waves/round-18/PLAN.md` (claims C1–C3; byte-frozen list §Byte-frozen).
Baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c`. Round-17 measured revision
`93bfead1f5f25f584353df3152a60209bbd89a2e` (M17). REV = the round-18 lane tip, recorded as
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` (40-hex),
never bare `HEAD` (anchor rule: §Round 17 "Lane-tip anchor rule").

### Source recheck procedure (C1; `corpus/evidence/round-18/source-recheck/`)

Target: every SOURCES row not superseded at B (51 = 57 − 6). Superseded at B, not rechecked:
S004 (→S028), S039 (→S040), S047 (→S054), S049 (→S055), S050 (→S056), S053 (→S057).

1. One receipt per row, produced only by the shared normalizer
   `.ufo/waves/round-18/recheck-fetch.mjs` (schema `tabi-source-recheck-v1`). Do not hand-write receipts.
2. Probe the quote before writing anything (writes nothing):
   `node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body <FILE> --quote "<quote>"`
3. HTTP source (row-url must occur verbatim in that row's `source` cell, e.g. S001 →
   `https://developer.chrome.com/blog/remote-debugging-port`, `corpus/SOURCES.md:15`):
   `node .ufo/waves/round-18/recheck-fetch.mjs --row S001 --row-url <URL> --decode html-text --quote "<≤25-word verbatim quote>" --quote-source corpus/SOURCES.md:15 --verdict held --anchor-observed "<revision/date marker in body>" --note "<teaches check>" --seat <Name> --outdir /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck`
4. Repo-path source (e.g. S029, `own-work`): fetch the bytes first, then pass them:
   `node .ufo/waves/round-18/recheck-fetch.mjs --row S029 --row-url corpus/evidence/round-13/aria/receipt.json --body <FILE> --fetch-command "<how FILE was produced>" --decode none --quote "<quote>" --quote-source <path:line> --verdict held --anchor-observed "<marker>" --note "<teaches check>" --seat <Name> --outdir <as above>`
5. Exit codes: `0` receipt written, quote found; `1` receipt written, quote NOT found (not counted until
   resolved); `2` usage or fetch error (no receipt).
6. Drift (live body no longer teaches the row): verdict `drift`, and a NEW superseding SOURCES row
   opened this round whose `teaches` starts `supersedes <row> —`. Never edit a row's cells in place
   beyond status/recheck/used-by (logged old→new in `LOG.md`).
7. Count and live re-check:
   `node .ufo/waves/round-18/measure-c1.mjs <REV>` → `c1_rows_rechecked` (0 → N, target 51);
   `node .ufo/waves/round-18/measure-c1.mjs <REV> --live` re-fetches each `url` with the same curl argv
   and reports `live_held` separately (does not change the count).

Counting rules (the receipt contract): PLAN.md §C1 receipt contract (`:67-77`). In short: schema, row
present at REV and not superseded, `sha256` 64-hex, `quoteWords` ≤25 and equal to the quote's word
count, `normalize(quote)` found in `normalize(excerpt)`, `excerptSha256` = sha256 of the excerpt bytes,
`fetchedAt` 2026-10-20, `teachesVerdict` `held` (or `drift` with a superseding row), `producerSha256` =
sha256 of `recheck-fetch.mjs` at REV. One receipt per row.

### Hardened harness decision rows (C2; hazard → rule)

Source: round-17 `w2/SentinelHarnessAfter.md` (H1–H4, S1 at lines 17–75; F6 open item). Round 17's
harness `scripts/webmcp-invoke-round17.mjs` stays byte-frozen as a counted round-17 input; round 18
adds `scripts/webmcp-invoke-round18.mjs` (new file).

| Hazard (observed at M17 / B) | Rule (round 18) | Counter probe |
|---|---|---|
| H1 SIGTERM/SIGINT/SIGHUP: Playwright's default handlers keep Node alive; the run then writes `verdict=fail` (`:17–27`) | Launch with `handleSIGTERM:false, handleSIGHUP:false, handleSIGINT:false`; own handlers set `aborted`, run cleanup, exit `2` with `run_aborted`. A "Target … closed" or browser `disconnected` is `could_not_evaluate`, never `fail`. | h1: SIGTERM at first `case` line (or 6 s) → exit 2, no `verdict=fail`/`pass`, no surviving browser pid |
| H2 leaks: only the normal path removes `tmpBase`; Chromium `org.chromium.Chromium.*` sits outside it (`:29–40`) | One idempotent `cleanup()` on every exit path: close contexts, wait for pids, `rmSync(tmpBase)`. Browser `TMPDIR` set inside the run dir. | h2: TMPDIR empty after an abnormal run and after a normal run |
| H3 `--remote-debugging-port=0` exposes an unauthenticated CDP TCP port to any local UID (`:42–51`) | Drop the port flag. Drive WebMCP via `context.newCDPSession(page)` over Playwright's pipe. | h3: no browser argv has `--remote-debugging-port`; no `DevToolsActivePort` in run profile dirs |
| H4 `acceptDownloads` unset; a tool's `blob:` download writes host temp bytes unrecorded (`:53–58`) | `acceptDownloads:false`; `page.on('download')` recorded as a finding; new fixture case `invoke-download-refused`. | h4: normal run has case `invoke-download-refused` passed; no downloaded bytes under TMPDIR |
| S1 duplicate feature switches: tokens appended, so a later `--disable-features` re-enables features (`:69–75`) | Exactly one merged `--enable-features=` and at most one `--disable-features=` in every launch's effective argv; union of intended features preserved. | s1: counts per launch as stated |
| F6 `check-freshness.mjs` accepts `--witness HEAD` (`check-freshness` is byte-frozen) | Wrapper refuses non-anchor revisions (§Freshness wrapper below). | f6: `--rev HEAD` → exit 2; `--dry-run` prints the `refs/heads/master` 40-hex while HEAD is detached on a poison commit |

Not claimed in round 18 (no C2 counter; stay open): S2 netns witness, S3 argv allowlist, S6 field caps,
S8 NODE_PATH/module sha. Do not cite them as closed.

Counter: `node .ufo/waves/round-18/measure-c2.mjs <REV>` → `c2_hazards_closed` (0 → 6). Probes run in a
sandbox clone at REV and at B; the round-17 artifact must be red on the h/s/f probes at B.

### Freshness wrapper (replaces the round-17 SKILL-only rule at `:1919–1922`)

Round 17 wrote `node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"`
as a convention that no code enforced. Round 18 replaces that instruction:

- Always run freshness through the wrapper:
  `node scripts/freshness-witness.mjs [--rev <40-hex>] [--dry-run]`
  [INFERENCE: flags `--rev` and `--dry-run` are taken from PLAN.md §C2 probes; L1 confirms against the
  committed wrapper before integration.]
- The wrapper resolves the lane tip by the same anchor rule as QUALITY 29 (`refs/heads/master`),
  refuses `HEAD`, symbolic and non-40-hex revisions (exit 2), and then invokes
  `node scripts/check-freshness.mjs --witness <40-hex>`. Passing `--rev HEAD` to the wrapper is always
  exit 2.
- `scripts/check-freshness.mjs` is unchanged (byte-frozen; it still accepts `--witness HEAD`). The
  wrapper is the only sanctioned path; the restriction is enforced by the wrapper, not by the checker.
- Other gates keep the round-17 rule: `check-measurement-binding` must never receive `--at HEAD`.

### Registry — round 18 (sha256 at REV; L1 fills)

| Entry | argv | Verdict map | sha256 |
|---|---|---|---|
| recheck producer | `node .ufo/waves/round-18/recheck-fetch.mjs --row S### --row-url URL [--url FETCH_URL] --decode none\|base64\|html-text\|pdf-text --quote Q --quote-source P --verdict held\|drift\|unreachable --anchor-observed A --note N --seat Name --outdir <dir> [--body FILE --fetch-command C]`; `--normalize-only` probe | 0 receipt, quote found; 1 receipt, quote not found; 2 usage/fetch error | `L1 FILL` |
| C1 counter | `node .ufo/waves/round-18/measure-c1.mjs REV [--live]` | one JSON line; `c1_rows_rechecked`; target 51 | `L1 FILL` |
| C2 counter | `node .ufo/waves/round-18/measure-c2.mjs REV` | one JSON line; `c2_hazards_closed`; target 6 [INFERENCE: exit map mirrors round-17 counters — 0 counted, 2 could not evaluate] | `L1 FILL` |
| C3 counter | `node .ufo/waves/round-18/measure-c3.mjs REV` | one JSON line; `c3_routed_closed`; target 5 [INFERENCE: exit map as C2] | `L1 FILL` |
| WebMCP invoke harness (new) | `node scripts/webmcp-invoke-round18.mjs --out <path outside the lane>` | 0 pass, 1 a case failed, 2 could not evaluate (incl. `run_aborted`, refused overwrite) [INFERENCE: mirrors round-17 map] | `L1 FILL` |
| freshness wrapper (new) | `node scripts/freshness-witness.mjs [--rev <40-hex>] [--dry-run]` | 0 clean, 2 refused or could not evaluate [INFERENCE: L1 confirms] | `L1 FILL` |

Byte-frozen, unchanged: `scripts/check-freshness.mjs`, `scripts/webmcp-invoke-round17.mjs`,
`scripts/webmcp-loopback-round16.mjs`, every `scripts/check-*.mjs`.

