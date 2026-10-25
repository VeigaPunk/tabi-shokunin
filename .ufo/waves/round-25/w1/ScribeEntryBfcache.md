# ScribeEntryBfcache — draft for `corpus/knowledge/bfcache-runtime-observed-round-25.md`

Seat: `L1Tabi25.ScribeEntryBfcache` (scribe, report-only). No tracked file edited, no git/jj write,
no browser/server/fetch run by this seat, no tool installed. Only this report was written. Every
value below was re-read or recomputed by this seat from retained scratch bytes, with the command
named.

## 0. Input state and branch

| Input | State | Command |
|---|---|---|
| `w1/ExecHarnessC1.md` | **present** (landed ~12:22Z; absent at 12:15:42Z first poll) | `ls .ufo/waves/round-25/w1` polled in 5 s slices until `[ -s w1/ExecHarnessC1.md ]` |
| harness draft receipt | `scratch/ExecHarnessC1/runs/positive/receipt.draft.json`, sha256 `220abf1b7c0ae731c199015a665d8f3b61ed9d76f9dcddf241580e359bf9f0ad`, `"draft": true` | `sha256sum runs/positive/receipt.draft.json` |
| committed receipt `corpus/evidence/round-25/bfcache/receipt.json` | **absent at tip** `c8ef3084c6363f265b9d23285296ab3547654f57` | `git rev-parse HEAD`; `git ls-tree -r --name-only HEAD -- corpus/evidence/round-25` → empty |

**Branch: restore observed (scratch), receipt not yet committed.** The harness shows a real
`BackForwardCacheRestore`, so the U1-open fallback does not apply. But C1 counts only a *committed*
receipt (kill rule: missing at the measured rev means could-not-evaluate). The draft below therefore
cites the committed target paths, and its digests are valid only if the L1 commits the harness
bytes unchanged. §4 lists the lines to swap if the L1 re-runs the probe instead.

### Re-derivation of the harness values (this seat)

- `sha256sum runs/*/events.jsonl` (in `scratch/ExecHarnessC1/`):
  - positive `76a8b7c7969874989e30d7d250e35e151e1ed7b778ec9729cb1764ca3743cc1f`
  - nohistory `7469868238c90ed2a94ce8d1a766b91a6c4bc52c1d48eff43668fc5c3262b45c`
  - disabled `474ea935bc7849d1d662d2518bda13e813d7e61bcb1307ae8ae7a2495e344398`
  - attempt-0 `e853c85ecc7660e57db688acc77dc309e1441b4113e372dab150c21e84f42abe`
  
  All four match the harness report. `wc -l runs/positive/events.jsonl` → 61.
- `sha256sum probe.mjs` → `3eba5f58f8140c52b8542f1f6811e0aba85711c2e7fb2b32c16709d58abac55c` (matches).
- The `events_sha256` recompute uses `node -e` with sha256 over `JSON.stringify(r.events)` for each draft:
  - positive `e80377c8…c235db`: MATCH, restores 1, no disabling flag. Steps are `navigate:Page.navigate`, `navigate:Page.navigate`, `goBack:Page.navigateToHistoryEntry`.
  - nohistory `2a590135…314314`: MATCH, restores 0, two navigate steps only.
  - disabled `301afba6…0e1318`: MATCH, restores 0, `flags_effective` includes `--disable-back-forward-cache`.
- The raw-log trace uses `node -e` to read `runs/positive/events.jsonl` and print the seq 57 line: `Page.frameNavigated BackForwardCacheRestore http://127.0.0.1:35729/a.html 1941FE13C74DB519D590080CA2038552`.
- The literal `Page.goBack` reply comes from `sed -n '33,38p' runs/positive/steps.json`: `"goBackAttempt": {"code": -32601, "message": "'Page.goBack' wasn't found"}`.
- The disabled-run refusal reasons come from `grep -o '"reason":"[A-Za-z]*"' runs/disabled/events.jsonl | sort -u`: `BackForwardCacheDisabled`, `BackForwardCacheDisabledByCommandLine`, `BrowsingInstanceNotSwapped`.
- The PDL history commands come from `grep -n 'command goBack\|command navigateToHistoryEntry\|command getNavigationHistory\|command resetNavigationHistory' scratch/ScoutOpenS106/Page.pdl`. It finds `getNavigationHistory` at line 850, `resetNavigationHistory` at 858 and `navigateToHistoryEntry` at 913. `grep -n -i 'goback\|go_back' Page.pdl` exits 1, so the Page domain has no `goBack` command.

### Source anchors (from ScoutOpenS106 / ScoutBfcacheHazards bytes; this seat fetched nothing)

| Row | File | Bytes | sha256 | Anchor (`grep -n`) |
|---|---|---|---|---|
| S106 | `scratch/ScoutOpenS106/content_features.cc` | 73952 (b64 98604) | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | L186 `// Enable using the BackForwardCache.` · L187 `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` · L193–203 low-memory gate, `kBackForwardCacheMemoryControls` "enabled only on Android" |
| S105 | `scratch/ScoutOpenS106/Page.pdl` | 61911 (b64 82548) | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`, equal to the committed row anchor | L1345 `BackForwardCacheRestore` · L1706 `backForwardCacheNotUsed` · L1713/1715 `notRestoredExplanations(Tree)` · L913 `navigateToHistoryEntry` |
| S104 | `scratch/ScoutOpenS106/bfcache.html` | 157663 | `46dac3cd4155100d983a8b307f01e5329cfc1a69954d3c76befcceae3906515e` (≠ row anchor `0dd45292…`) | L2531 "…the entire page can be restored from memory, without having to go to the network at all." |
| S104 (2nd copy) | `scratch/ScoutBfcacheHazards/bfcache-2026-10-25.html` | 157667 | `0832def10a2c18ee2dbd9ea53dc047c9934411a52da09bfcec0194b5b2804d3f` | same L2531 span |

`chromium --version` → `Chromium 154.0.8037.97 Arch Linux`.

## 1. Draft entry

```markdown
# Loopback bfcache journey: a BackForwardCacheRestore observed on this host

source: S106 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT — `kBackForwardCache` declared default-on, decoded line 187, opened 2026-10-25, 73952 bytes decoded from a 98604-byte base64 transfer, sha256 `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`
source: S104 — https://web.dev/articles/bfcache — restore-path table cell line 2531, re-opened 2026-10-25 (157663 B, sha256 `46dac3cd…`; the quoted span resolves, the whole-file digest differs from the row anchor, see U4)
source: S105 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT — `NavigationType` line 1345, `navigateToHistoryEntry` line 913, `backForwardCacheNotUsed` line 1706, re-opened 2026-10-25, 61911 bytes decoded, sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` (byte-identical to the row anchor)
evidence: corpus/evidence/round-25/bfcache/receipt.json (schema tabi-bfcache-journey-v1; events_sha256 `e80377c8434cf302194af02cb50884eed55971f68fa9b78b79d77c0ef1c235db`; raw log sha256 `76a8b7c7969874989e30d7d250e35e151e1ed7b778ec9729cb1764ca3743cc1f`, 61 lines)
verified-at: 2026-10-25
recheck: on-release for S105/S106 and for the observation (pinned tag 154.0.8037.97; re-run when the host Chromium leaves that tag); 90d for S104 (rolling article)
tier: runtime observed on this host — loopback, same-origin, headless=new, Chromium 154.0.8037.97; unprobed elsewhere

## 1. What this closes

The round-24 note `navigation-history-bfcache-evidence.md` §5 U1 said: "No
restore has been observed on this host." Round-24's frontier row named the cause:
no committed probe performed a history step, and the `--disable-back-forward-cache`
launch flag (a Playwright default, not a lane policy) kept the cache off. This
round's journey probe performs a real history step without that flag, and the
browser reported a restore:

> seq 57 `Page.frameNavigated` `type: "BackForwardCacheRestore"`,
> url `http://127.0.0.1:35729/a.html`, loaderId `1941FE13C74DB519D590080CA2038552`
> (raw event log line with `seq` 57; the same loaderId as A's first load at seq 13)

U1 is closed **for this configuration only** (see §6).

## 2. Build precondition (S106)

At tag 154.0.8037.97 the feature is declared on by default:

> BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);

(`content_features.cc`, decoded line 187). No `--enable-features` switch is
needed. The low-memory gate is a field-trial threshold, and
`kBackForwardCacheMemoryControls` "is enabled only on Android" (decoded lines
193–203). INFERENCE: the default alone does not prove the cache was active in a
given run, because command-line or field-trial overrides can turn it off. Only a
`BackForwardCacheRestore` event shows the cache was active, as the
`--disable-back-forward-cache` control in §5 demonstrates.

## 3. The journey probe as a measured method

1. **Fixture.** Two static pages, `a.html` and `b.html`, served by
   `python3 -m http.server <port> --bind 127.0.0.1 --directory fixture` on a
   free port chosen by binding port 0. The pages have no `unload` handler. The
   server sends no `Cache-Control` header (it does send `Last-Modified`). Each
   page sets a random `window.__nonce` at load and appends
   `pageshow.persisted` to `window.__pageshow`.
2. **Launch.** The browser is spawned as `/usr/bin/chromium` with
   `XDG_CONFIG_HOME` pointing at an empty dir. The Arch launcher otherwise injects
   `~/.config/chromium-flags.conf`, which on this host carries
   `--ozone-platform=wayland`,
   `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=…`
   and `--disable-features=Vulkan`. Requested switches: `--headless=new
   --remote-debugging-port=<dbg> --remote-debugging-address=127.0.0.1
   --user-data-dir=<run>/profile --no-first-run --disable-gpu about:blank`.
3. **Effective argv.** The command line is read back from `/proc/<pid>/cmdline`
   after `/json/version` answers. Chromium rewrites its argv region into one
   space-joined string, so the probe splits it. Recorded for the positive run
   (pid 1314355):
   `/usr/lib/chromium/chromium --headless=new --remote-debugging-port=41561
   --remote-debugging-address=127.0.0.1 --user-data-dir=<run>/profile
   --no-first-run --disable-gpu --noerrdialogs --ozone-platform=headless
   --ozone-override-screen-size=800,600 --use-angle=swiftshader-webgl about:blank`.
   Headless mode appended the last four switches itself. None of the launcher's
   user flags appears, and neither does `--disable-back-forward-cache`. The
   browser reported itself as `Chrome/154.0.8037.97`, protocol `1.3`
   (`/json/version`).
4. **Capture chain.** Raw CDP runs over Node v24.21.0's built-in `WebSocket`
   against the first `page` target from `/json/list`, with `Page`, `Network` and
   `Runtime` enabled. **Every** inbound CDP message is appended to
   `events.jsonl` as `{seq, t, msg}`, and every outbound command to
   `commands.jsonl`. The receipt copies the main-frame `Page.frameNavigated` and
   `Page.backForwardCacheNotUsed` params verbatim, keyed by raw `seq`, and binds
   them with `events_sha256` = sha256(`JSON.stringify(events)`). It also records
   the raw log's own sha256 and line count.
5. **Journey.**
   1. `Page.navigate` A, then wait for `Page.loadEventFired`.
   2. `Page.navigate` B, then wait for `Page.loadEventFired`.
   3. The history step. **CDP has no `Page.goBack`:** the probe sends it
      literally and records the reply `{"code":-32601,"message":"'Page.goBack'
      wasn't found"}`. S105 at the pinned tag has `getNavigationHistory`
      (line 850) and `navigateToHistoryEntry` (line 913), and no `goBack`. The
      probe calls `Page.getNavigationHistory`, asserts that
      `entries[currentIndex-1].url` is A, and sends
      `Page.navigateToHistoryEntry {entryId}`. The receipt step is
      `action: "goBack"`, `cdpMethod: "Page.navigateToHistoryEntry"`.
      `currentIndex` falls from 2 to 1.
6. **Event reading.** A restore counts only when all of the following hold:
   - the event is a main-frame `Page.frameNavigated` (`parentId` null);
   - its `type` is `BackForwardCacheRestore`;
   - its URL equals the history step's target;
   - it comes after the history step in raw `seq`.

   A `type: Navigation` on the step is a fetched document. A
   `backForwardCacheNotUsed` event is a refusal, and its
   `notRestoredExplanations` are kept verbatim.

   Corroboration is read separately:
   - Same `loaderId` as the original load.
   - Same page nonce.
   - A second `pageshow` with `persisted = true`.

   Two readings are **not** signals:
   - `performance` navigation type still reads `navigate` after a restore.
   - The fixture server log cannot tell the cases apart. The disabled control's
     back step also made no server request. INFERENCE: the HTTP cache served it.
7. **Cleanup proof (per run).** The probe sends SIGTERM to the chromium pid and
   then the http.server pid, by explicit pid. It records each exit. Then it
   checks:
   - `pgrep -f -- <profile>` exits 1 (no strays);
   - `/proc/<pid>` is absent for both pids;
   - `ss -Hltn ( sport = :H or sport = :D )` prints nothing;
   - `curl` to the HTTP port and to `/json/version` on the debug port both
     exit 7.

   All results go to `cleanup.json`, with `clean: true` only when every check
   holds.

## 4. Observed result

| Run | Main-frame `frameNavigated` types (raw seq) | Restores | `backForwardCacheNotUsed` | Cleanup |
|---|---|---|---|---|
| positive | 13 `Navigation` (A), 39 `Navigation` (B), 57 **`BackForwardCacheRestore`** (A) | 1 | none | clean (curl 7/7, ss empty, pgrep 1) |

The restore is corroborated in the positive run's page states. The nonce was
`ferby0qy2fb` before leaving A and again after the back step. `__pageshow` went
from `[false]` to `[false, true]`, and the page text read `A nonce=ferby0qy2fb
pageshow persisted=true count=2`.

A restore fires **no** `Page.loadEventFired` or `load` lifecycle event. A driver
that waits for `load` after the back step will hang on a success, so it waits on
the main-frame `frameNavigated`. `Runtime.executionContextsCleared` /
`executionContextCreated` fire even though the heap survives, so a cleared
context does not mean lost state. (Both observations come from the
round's diagnostic probe, `.ufo/waves/round-25/w1/ExecBfcacheDiagnostics.md`
§Hazards 2–3.)

## 5. Negative controls

| Control | Changed variable | frameNavigated types | Restores | Other |
|---|---|---|---|---|
| no history step | journey stops at B | 13 `Navigation`, 39 `Navigation` | 0 | — |
| cache disabled | `--disable-back-forward-cache` present in the effective argv | 13 `Navigation`, 39 `Navigation`, 58 `Navigation` (A) | 0 | seq 60 `backForwardCacheNotUsed`, all `Circumstantial`: `BackForwardCacheDisabled`, `BackForwardCacheDisabledByCommandLine`, `BrowsingInstanceNotSwapped`. The nonce changed, `pageshow` stayed `[false]`, navigation type was `back_forward`, and the loaderId was new. |

Each control differs from the positive run in exactly one variable. The disabled
run is what makes the positive interpretable (QUALITY 60): the same probe sees a
restore when the cache is on and a refusal, with reasons, when it is off.

## 6. Unknowns (named, not claimed)

- U1 — **Closed for this configuration only:** loopback, same-origin A/B,
  headless=new, Chromium 154.0.8037.97, this host, launcher user flags excluded.
  Headed mode, cross-origin pairs, real sites, other builds and the host's
  default launcher flags (`chromium-flags.conf`, including `--load-extension`)
  are unprobed.
- U2 — Byte-determinism of a restore across cold runs: unmeasured. The
  `type` value was stable across repeats (two harness attempts and four
  diagnostic default-flag runs all restored), but loaderIds, nonces and
  timestamps differ per run by construction.
- U3 — Partly answered. `backForwardCacheNotUsed` fired with populated
  `notRestoredExplanations` when the cache was disabled by command line, and did
  not fire on an eligible page that was restored. Whether it fires for
  page-caused disqualifiers (unload handler, `Cache-Control: no-store`) on
  loopback is unmeasured.
- U4 — S104 is a live page. Today's two fetches gave 157663 B `46dac3cd…`
  and 157667 B `0832def1…`, neither equal to the row anchor `0dd45292…`. The
  span at line 2531 resolves in both.
- U5 — Firefox/Safari bfcache surfaces: not probed.
- U6 — The restore rate under load or concurrency is unmeasured. The harness's
  final runs ran as one parallel batch of three browsers, one of them positive.

## 7. Frontier status

`corpus/README.md` row "Navigation-history evidence across a bfcache restore":
**runtime-held on this host for loopback A->B->back; unprobed elsewhere.** The
discriminator is now observed, not only documented: `Page.frameNavigated.type`
(S105 line 1345) carried `BackForwardCacheRestore` on a real history step. The
"Real-site journeys" frontier stays open, because no real site was touched.
```

## 2. Observation / inference / unknown ledger

- **Observed (harness seat's bytes, re-derived here):** the seq 57 restore event, three run tables,
  effective argv, `goBackAttempt` error, NotUsed reasons, cleanup fields, all digests in §0.
- **Observed (diagnostic seat, cited only for lifecycle hazards and repeat stability):**
  `ExecBfcacheDiagnostics.md`. Of its 5 runs, 4 used default flags and all 4 restored. The disabled
  control did not restore. In-page `history.back()` also restored. Its scratch is not a claim
  receipt, and that report says so.
- **INFERENCE (labelled in draft):** default-on ≠ active per run; the HTTP cache served the disabled
  run's back load.
- **Not used:** the harness's "Puppeteer page.goBack() uses navigateToHistoryEntry" statement. The
  draft does not repeat it, because neither seat verified it (the diagnostics report labels the
  analogous Playwright claim [INFERENCE]).

## 3. Findings for the L1

- **F1 — The wording of frozen C1 names a CDP method that does not exist.** claims.json C1 says "via
  CDP Page.goBack". At the pinned tag, S105 has no `goBack` (`grep -n -i 'goback' Page.pdl` exits 1).
  The real primitive is `Page.navigateToHistoryEntry` (line 913). Both executor seats got -32601 on
  `Page.goBack`. The receipt labels the step `action:"goBack"` with
  `cdpMethod:"Page.navigateToHistoryEntry"`. Whether that meets C1's "real history step" predicate,
  or needs an append to `revisions[]`, is the L1's decision. The draft entry describes the step
  truthfully either way.
- **F2 — No committed receipt yet.** C1 is could-not-evaluate at `c8ef3084` until the L1 commits
  `corpus/evidence/round-25/bfcache/receipt.json`. The draft's `evidence:` line, its
  `events_sha256` and its raw-log digest are valid only for the harness bytes as retained.
- **F3 — The counter's raw-log binding is unchecked.** This is the harness seat's observation in the
  prototype counter source (lines 101–112). `events_sha256` binds only the receipt's own array, and
  restores are counted without a seq-after-step or URL-match check. The kill rule requires tracing
  each restore to a committed raw event log. The draft's §3.6 states the stricter reading. INFERENCE:
  commit `events.jsonl` next to the receipt so its sha `76a8b7c7…` can be checked.
- **F4 — S104 digest drift.** Two digests in two same-day fetches, neither equal to the anchor; the
  span resolves.
- **F5 — S105 is byte-identical** to the committed anchor `e944a3b1…`.
- **F6 — QUALITY 54:** S106 is the first `source:` line, as the item ordered.
- **F7 — Attempt-0 harness hang.** The `finish` listener was attached after the event fired, so the
  in-probe cleanup never ran and cleanup was manual (`runs/positive-attempt0-harness-hang/cleanup-manual.txt`).
  That run also restored (seq 57). It is a candidate for the round-25 lesson's second mined mistake,
  under the harness-hazard class.

## 4. Swap table if the L1 re-runs the probe before committing

Only these values change. Each must come from the committed receipt or raw log:

| Draft location | Current value (harness positive run) |
|---|---|
| `evidence:` line | events_sha256 `e80377c8…c235db`, raw log `76a8b7c7…3cc1f`, 61 lines |
| §1 quote | seq 57, url port 35729, loaderId `1941FE13…8552` |
| §3.3 | pid 1314355, port 41561 |
| §4 / §5 tables | seq numbers, nonce `ferby0qy2fb`, NotUsed seq 60 |

If a re-run yields **no** restore, the entry falls back to U1-open. The negative controls and
diagnostics then make that a reportable regression, not a re-labelled success.

## 5. Gates, scope, artifacts

- Gates run: none (scribe seat; the L1 runs the lane gates).
- Touched surfaces: this report only. Out of scope: the S106 SOURCES row (ScribeSOURCESRows), the
  README/SCORECARD text (ScribeScorecardLog), the receipt and counter (Exec seats), and claims.json
  revisions (L1).
- Tool installs/updates: none.
- Artifacts read: `w1/ExecHarnessC1.md`, `w1/ExecBfcacheDiagnostics.md`, `w1/ExecCounterC1Proto.md`,
  `scratch/ExecHarnessC1/runs/{positive,nohistory,disabled}/{receipt.draft.json,events.jsonl,steps.json,cleanup.json,countercheck.json}`,
  `scratch/ScoutOpenS106/{content_features.cc,Page.pdl,bfcache.html}`,
  `corpus/knowledge/navigation-history-bfcache-evidence.md`, `corpus/QUALITY.md` (criteria 1–5, 17–18, 23–30, 53–54, 60), `claims.json`.
