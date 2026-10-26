# CritSemanticDrift — attack on C3's notion of `holds` (round 29, w1)

Seat: critic (attack only; no production code touched). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, work dir `/fast/scratch/hyaku/tabi-r29/CritSemanticDrift`.
Evidence bundle copied to `.ufo/waves/round-29/w1/CritSemanticDrift/` (run receipts, fetch manifest, block-offset table, 404 determinism log, per-file diffs).
Tooling installed/updated: **none** (no install was needed; pacman untouched).

Axis attacked: **freshness** (claim C3). Verdict of this review: `holds` is a *survival-of-filed-lines* predicate, not a resolution of the row, and C3's target is reachable at **exit 0 with `holds=23 drifted=0`** while 7 of the 23 rows have a changed cited span at 156 and no supersession is recorded. The 404 row (S094) is also reachable, but only through the order in which the refetching seat commits its own bytes — which makes its `f6` self-certifying rather than an agreement check (seats independently found the 404 non-determinism: `PinS094.md` F1/F2).

---

## 0. What the frozen counter actually decides

`scripts/check-release-pins.mjs` (frozen at the claims commit):

- **r1** (`:194`): a row needs exactly one receipt entry and **`files.length >= 1`** — no requirement that the cited file set be filed.
- **f2** (`:206-210`): each filed path must appear in the row's source cell or its basename in the anchor cell.
- **f4** (`:234-241`): every `ranges` element is checked **individually** against the anchor cell (`anchorHasRange`, `:140-145`); the counter never derives expected spans from the anchor and never requires the union of filed ranges to cover them.
- **`holds`** (`:242-243`, `:159-168`): a 200 file holds iff each cited block's whitespace-normalised lines occur **contiguously somewhere in the new file** (`blockIn` scans the whole file, position-free, first match wins).
- **f5** (`:245`): a recorded digest is matched against the **whole old file's** sha256, independent of which spans were filed.
- **f6** (`:218-221`): an independent refetch record must carry the **same sha256 as the committed new bytes**.

Consequence: `holds` is "the lines I chose to file still exist somewhere", not "the row's cited evidence survived". The receipts below are produced from the *same* lane bytes at the *same* tag, and the frozen counter accepts all of them.

---

## 1. Counterexample A — same bytes, same revision, two verdicts (subset filing)

Fixture repos built under `$HYAKU_SCRATCH` from the **tip registry** (`git show HEAD:corpus/SOURCES.md`, which carries S109–S115) with real 154.0.8037.97 / 156.0.8078.47 bytes and independent refetch records:

| run | how the 7 rows were filed | S094 | exit | population | resolved | unresolved | holds | drifted | clean |
|---|---|---|---|---|---|---|---|---|---|
| `tip-subset` | only the non-drifted cited spans | natural order | 1 | 23 | 22 | 1 | **22** | **0** | false |
| `tip-full` | every anchor-cited span + `superseded_by` S109–S115 | natural order | 1 | 23 | 22 | 1 | **15** | **7** | false |
| `tip-subset-remedy` | only the non-drifted cited spans | remedy (a), §4 | **0** | 23 | 23 | **0** | **23** | **0** | **true** |
| `tip-full-remedy` | every anchor-cited span + supersessions | remedy (a), §4 | **0** | 23 | 23 | **0** | **16** | **7** | **true** |

```
node scripts/check-release-pins.mjs --repo .../tip-subset --rev HEAD --stable 156.0.8078.47 --json   # exit 1
  S042 holds  S071 holds  S078 holds  S080 holds  S081 holds  S096 holds  S100 holds   (subset)
node scripts/check-release-pins.mjs --repo .../tip-full   --rev HEAD --stable 156.0.8078.47 --json   # exit 1
  S042 drifted(resolved via S109)  S071 drifted(S110)  S078 drifted(S111)  S080 drifted(S112)
  S081 drifted(S113)  S096 drifted(S114)  S100 drifted(S115)
```

Receipts: `CritSemanticDrift/tip-subset-run.txt`, `tip-full-run.txt`, `tip-subset-remedy-run.txt`, `tip-full-remedy-run.txt`.
The intervening truth is in the real bytes — measured with the counter's own `blockIn`, exact and normalised agree (`CritSemanticDrift/holds-analysis.txt`):

- S042 `model_context.cc:528-580` occ=0, `:748-811` occ=0; `:856-873` holds.
- S071 `html_form_element.cc:192-258` occ=0, `model_context.cc:752-811` occ=0; `form_mcp_schema.cc:208-243`, `model_context.cc:562-565` hold.
- S078 / S096 / S100 `html_form_element.cc:174-328` occ=0; `:635-842`, `:729-758`, `:818-842` hold.
- S080 `script_tool_types.h:16-49`, `html_form_element.cc:174-259`, `model_context.cc:528-580`/`695-745` occ=0; five other cited spans hold.
- S081 `html_select_element.cc:1047-1108` occ=0; `:291-347`, `:871-887`, `:1162-1184`, `:180-210` hold.

So **7 of 23 population rows have a changed cited span at 156, and every one of them can be certified `holds` by filing the surviving spans** — with the S094 remedy of §4 that is `tip-subset-remedy`: exit 0, `unresolved=0`, `holds=23`, `drifted=0`. The claim's killRule ("any drifted row whose citing knowledge entries carry no round-29 recheck note → quality harmed") never fires, because the counter never says `drifted`.

Degenerate form of the same hole (executed, single-row fixture): S074 resolves as `holds` with **one filed line**, `ranges: [[7035,7035]]`, whose content is the context-free `      status: "experimental",` (154:7035). The other 27 lines of the WebMCP block are never compared. `exit 1`, `S074 = holds`, receipt `CritSemanticDrift/degenerate-single-line-run.txt`.

---

## 2. Counterexample B — all cited spans hold while the meaning changed (S045)

`executeTool-abort.https.html` changed 206 → 236 lines at 156. Both cited lines survive **byte-exactly** (154:87 → 156:108, 154:113 → 156:134; `exact_occ = 1`), so the counter says `holds` with nothing else to check. What those lines now witness changed:

```diff
# 154:39 / 154:69            ->  156:49 / 156:86
-  window.addEventListener('toolactivated', e => { ... }, { once: true });
-  window.addEventListener('toolcancel',    e => { ... }, { once: true });
+  document.modelContext.addEventListener('toolactivated', modelContextHandler);
+  document.modelContext.addEventListener('toolcancel',    modelContextCancelHandler);
+  assert_true(modelContextEvent instanceof ToolActivatedEvent, ...);
+  assert_equals(modelContextEvent.target, document.modelContext);      # 156:98-104
```
and the call under test changed shape at every cite:
```diff
-  document.modelContext.executeTool(tool, '{}');                       # 154:26
+  document.modelContext.executeTool(tool);                             # 156:26
-  ...executeTool(tool, '{}', { signal: controller.signal });           # 154:66/106/136/187-188
+  ...executeTool(tool, {},   { signal: controller.signal });           # 156:73/136/166/217-218
```
The held assertion `assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel'])` therefore no longer verifies `window`-dispatched events (154) but `document.modelContext`-dispatched `ToolActivatedEvent`/`ToolCancelEvent` (156), over a JSON-object argument instead of a JSON string. Same bytes at the anchor, different contract. No row supersedes S045, and the counter reports `holds`, so no recheck note is required. Diff: `semantic-diffs/S045-executeTool-abort.diff`.

This is the requested class in its purest form: *block survives verbatim, meaning changed, every check green.*

---

## 3. Per-row semantic findings (high-risk set + the rest of the population)

### S034 / S074 — `runtime_enabled_features.json5` 7023-7050 → 7204-7231 (Δ +181, occ=1)
- Block byte-identical; `DeclarativeWebmcp` absent at **both** tags (grep over all 7429 / 7635 lines), so the teaching is still true at 156. **No drift found.**
- Two structural gaps, both real but not falsifying at this tag:
  1. The teaching's load-bearing half is an **absence** claim ("this file lacks DeclarativeWebmcp"); `holds` only witnesses the *presence* of 28 lines. Any 156 addition outside that 28-line block would pass. Nothing in the counter binds absence.
  2. The anchor's line numbers no longer address the 156 file (block at 7204). The counter neither reports nor checks the offset (`block-offsets.txt`), so a shifted, duplicated or relocated block is indistinguishable from an in-place one.
- Adjacent status flip, invisible to `holds`: `WebIdentityDigitalCredentialsCreation` loses `origin_trial_feature_name`/`origin_trial_allows_third_party` and goes `status: "experimental"` → `"stable"` (154:7009-7016 → 156:7192-7197), 7 lines above the anchor's new start. Demonstrates that flag/status flips next to an anchor are outside the predicate.

### S106 — `content_features.cc` 186-187 (Δ 0, occ=1)
- `// Enable using the BackForwardCache.` / `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` identical at both tags; every other `kBackForwardCache*` declaration keeps its line number (186-203, 215, 240, 300 unchanged). **No drift found.**
- Coverage gap: the row's sentence ("a clean launch without `--disable-back-forward-cache` exercises it") also depends on `kBackForwardCacheEntryTimeout` (191) and `kBackForwardCacheMemoryControls` (193-203), none of which the 2-line anchor covers. At 156 those lines are unchanged, so no harm today; a later flip in 193-203 would leave the row `holds`.

### S105 — `Page.pdl` 1345, 1706 → 1373, 1734 (Δ +28, occ=1 each)
- `NavigationType` still `experimental type … enum` at 156:1370 with `BackForwardCacheRestore` at 1373, and `event frameNavigated` (156:1376) still carries `experimental NavigationType type` (156:1380); `backForwardCacheNotUsed` parameters are identical including the required `notRestoredExplanations` (156:1734-1743). 156's additions are elsewhere (155 permissions policy, 393 `monotonicTimestamp`, 810-845 `SubApp`/`getSubApps`/`getSiblingSubApps`). **No drift found.**
- Coverage gap: the cited 1706 is the event *header*; the parameter list the teaching depends on (154:1707-1715 / 156:1735-1743) is outside the cited span. A PDL `deprecated: true` added on the following line, or parameters gutted, would leave the anchor `holds`.

### S041 / S099 / S079 — `WebMCP.pdl` (occ=1, Δ +2)
- Cited spans `7`, `58-122` (→ 60-124), `59-69` (→ 61-71), `109-123` (→ 111-125) all survive exactly. **No teaching falsified.**
- In-file semantic change outside every cited span: `type Annotation` gained a fourth hint at 156:22-23 (`# If true, indicates that the tool is intended for debugging…` + `optional boolean debugging`); the emitter was extended to populate it (`builder.setDebugging(annotations->debugging);`, 156 `inspector_web_mcp_agent.cc:75`). Every PDL row still says `holds` and no row covers annotations, so the 156 annotation surface is certified without evidence.
- No cited block is duplicated in 156 (occ=1). `blockIn` would accept a duplicate at any offset; latent, not exercised.

### S080 — mixed (the clearest multi-file case)
- `script_tool_types.h:16-49` **drifted** (occ=0): `std::optional<bool> debugging;` inserted at 156:46 inside the cited struct.
- `html_form_element.cc:174-259`, `model_context.cc:528-580`, `model_context.cc:695-745` **drifted**. `frame.mojom:1112-1119` holds at 156:1072 (Δ −40); the removals are fenced-frame imports/methods (154:43-44, `SendFencedFrameReportingBeacon*`), unrelated to the block.
- Filing only `form_mcp_schema.cc:208-300` (byte-identical at both tags, sha `904b75e7…152f`) resolves the row as `holds` — one unchanged file out of eight cited sources.

### S042 — `model_context.cc`
- `528-580` (`ExecuteTool`) and `748-811` (`ExecuteV8Tool`) **drifted**; `856-873` (`OnToolExecuted`) holds at 156:855.
- Semantic content of the drift: input now passes through `ValidateAndStringifyValue`, which throws `invalid <name>: value is not an object` for non-objects (156:80-88); `IsValidToolName` is replaced by shared `IsValidScriptToolName` (156:379); the parallel WPT switched from a JSON string to an object literal. The row's held span (`OnToolExecuted`) contains none of this.

### S071 — mixed
- `form_mcp_schema.cc:208-243` holds (file byte-identical); `model_context.cc:562-565` holds; `html_form_element.cc:192-258` and `model_context.cc:752-811` **drifted**.
- Filing just the unchanged `form_mcp_schema.cc` span resolves the row.

### S078 / S096 / S100 — `html_form_element.cc`
- `174-328` **drifted**: a 10-line guard was inserted at 156:201-209 (comments 201-202, `if` at 203, message at 207) inside `HTMLFormMcpTool::ExecuteTool`:
  ```cpp
  // Filling out the form controls dispatches `input` and `change` events,
  // whose handlers may have detached the document.
  if (!form_->GetDocument().IsActive()) {
    return std::move(done_callback).Run(base::unexpected(
        ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,
                        "The document was detached while filling out the form")));
  }
  ```
  i.e. a **new failure mode** between "fill succeeded" and "submit" — exactly the region S078's teaching describes ("After successful fill, toolautosubmit submits immediately…"), and a *guard added around* the cited logic.
- `635-842` holds at 156:673 (Δ +38); `729-758` at 767; `818-842` at 856.
- Also moved/removed outside all cited spans: the `ScheduleWebMCPSchemaUpdateIfActive()` call in `Associate` moved (154:1194 → 156:1239) around a new `is_connected_nested_form_` branch and the `EmailVerificationStatusIndicatorEnabled` block was deleted; the second call moved 154:1211 → 156:1251.

### S081 — `html_select_element.cc`
- `1047-1108` (`SelectOption`) **drifted**: the `RuntimeEnabledFeatures::SelectedcontentSpecEnabled()` guards were removed — in `SelectOption` 154:1075-1076 → 156:1077 (`if (!(flags & kDontUpdateSelectedcontentFlag))`), and the identifier disappears from the file entirely at 156 (`grep -c` = 0 vs 6 hits at 154:996, 1075, 1962, 1969, 1982, 2086). That is the flag-deleted/flag-default-flipped-elsewhere class. Other cited spans hold at the same or +1 lines.
- S113 already supersedes S081; a subset filing would nonetheless report `holds`.

### S045 — see §2. `holds` on both cited lines, witnessed contract changed.

### Rows with **no** drift at 156 (checked, negative evidence)
- `S033` `model_context_supplement.idl` byte-identical (sha `50dd337d…`), occ=1.
- `S077`, `S093`, `S098` `form_mcp_schema.cc` / `.h` byte-identical (sha `904b75e7…152f`, `e44593c0…`), all cited spans occ=1.
- `S062` cited spans hold exactly; file changes are `DCHECK`→`CHECK(NotFatalUntil::M159)` in `devtools_pipe_handler.cc` (305-306, 436) and `devtools_http_handler.cc`, plus a new `kNativeFilePathStyle`; pipe stdio semantics and the `DevToolsActivePort` write are untouched.
- `S064` cited `InitFromCommandLine` (417-453) and `SplitFeatureListString` (872-875) hold exactly; `command_line.cc` is byte-identical; `feature_list.cc`'s changes are the runtime-mutability refactor. Duplicate-switch teaching untouched.
- `S094` statuses 404 → 404 and the body still starts `NOT_FOUND: Requested entity was not found`; the absence is real at both tags, but its certification path is self-certifying — see §4.

`holds-analysis.txt` also records that **every held span matched byte-exactly** (`exact_occ = occ`), so `normLine` is not load-bearing on these rows. It remains a latent hole: `normLine` collapses inner whitespace, so a JSON5 string such as `name: "Web  MCP"` ↔ `"Web MCP"` would compare equal.

---

## 4. Counterexample C — the absence row's `f6` is self-certifying, not an agreement check

`S094` is in the population (`third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc`, 404 at both tags). Gitiles' 404 body embeds a per-request id:

```
NOT_FOUND: Requested entity was not found
[type.googleapis.com/google.rpc.LocalizedMessage]
locale: "en-US"
message: "Object is not found"

[type.googleapis.com/google.rpc.RequestInfo]
request_id: "bbda0809c39e4a838483297f968a8d9c"
```

Six independent fetches, three per tag (`CritSemanticDrift/404-determinism.txt`):

| tag | sha256 of the 404 body |
|---|---|
| 154.0.8037.97 | `77a2a5f6f0a6fbfdfd6fdc7629c2c0bc…8f27` |
| 154.0.8037.97 | `a4637049f8f81d81ef4de13c3580838b…f017` |
| 154.0.8037.97 | `c68555fb8ef025d34b4ba9694d81f52d…ef30` |
| 156.0.8078.47 | `b662d2baaa165f0dfde839676adb09eb…65da` |
| 156.0.8078.47 | `ec16cbcc11d721dea283cbc59629d4f6…83d3` |
| 156.0.8078.47 | `c3741cfed375e638f86588edca6952fb…8934` |

`diff` of two of them shows exactly one differing line: `request_id: "<32 hex>"`.

**The natural filing order cannot pass.** `f6` requires the independent seat's recorded sha to equal the committed `new_sha256`. Commit-then-refetch therefore always fails, because the refetch is a different body. Observed (`tip-subset`, `tip-full`, exit 1):

```
S094: resolved=false reasons=['f6-refetch …/form_mcp_schema_unittest.cc','f5-digest']
```

**The passing order makes `f6` vacuous.** If the refetching seat's own fetched bytes become the committed `new_bytes` (its sha becoming `new_sha256`, `entry.fetched_by` staying `PinS094`), f6 passes by construction and the retained 2026-10-21 body supplies the digest-bound `old_bytes` (`corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz`, `zcat | sha256sum` = `9d640282…b8b19`, exit 0). Verified (`s094-remedy-a-run.txt`):

```
remedy-a            exit 1 | S094: resolved=true verdict=holds reasons=[] | new_sha ec16cbcc11d721de
remedy-a-otherpath  exit 1 | S094: resolved=true verdict=holds reasons=[] | new_sha 12c9c2fb8644d654
```

The second line is the defect: committing a **404 body from a different path** (`…/does_not_exist_probe.cc?format=TEXT`, sha `12c9c2fb…`) under the cited path still resolves `holds`, because the 404 branch (`:227`) checks only `new_status === 404` and the literal `NOT_FOUND`, and f3/f6 are satisfied by whatever the refetcher supplies. So for absence rows `f6` does not test agreement about the cited URL; it tests that the receipt's two authors are the same fetch. This reproduces `PinS094.md` F2 from the other direction and extends F1: the non-determinism is not merely an ordering trap, it converts the independence check into self-certification.

With remedy (a) applied to all 23 rows, C3's target is met (`tip-subset-remedy-run.txt`, `tip-full-remedy-run.txt`):

```
tip-subset-remedy: exit 0  population=23 resolved=23 unresolved=0 holds=23 drifted=0  clean=true
tip-full-remedy:   exit 0  population=23 resolved=23 unresolved=0 holds=16 drifted=7  clean=true
```

(Honesty note: no byte fabricated for any lane claim; the fabricated-refetch fixture `tip-subset-fakerefetch` exists only inside scratch to show that the gate cannot distinguish it from the honest remedy-a receipt — both are "the refetcher's sha", one asserted, one real.)

---

## 5. Impacted axes and verdict

- **freshness (primary)**: `holds` is not a resolution predicate. 7/23 population rows have a changed cited span at 156 (S042, S071, S078, S080, S081, S096, S100), and all 7 can be certified `holds` — `tip-subset-remedy` reaches `unresolved=0, holds=23, drifted=0, clean=true` with **zero** supersessions, versus `tip-full-remedy`'s `holds=16, drifted=7` on the same bytes. The degenerate floor is one context-free line per row (`S074` filed as `[[7035,7035]]` = `      status: "experimental",`).
- **calibration (indirect)**: the claim's killRule on drifted rows is keyed to the counter's `drifted` verdict, which subset filing suppresses entirely. A "clean" C3 then asserts 23 rows fresh while 7 shifted, with no recheck note anywhere.
- **operability**: the natural filing order produces a false negative on S094 (`f6-refetch` for a row whose absence is real at both tags), and the only passing order quietly converts f6 into self-certification — a trap for the honest executor and an opening for the dishonest one.

Smallest safe corrections (no axis change, no new claim surface):

1. **Coverage binding for f4** — derive the expected span set from the row's anchor cell (each `<basename>:<a>-<b>` / `<basename>:<n>` token, en/em dashes normalised) and require the receipt's filed entries/ranges to *cover every cited span of a filed path, and every cited path*; emit `f4-coverage` otherwise. Mechanical, keeps `holds` semantics, and turns `tip-subset-remedy` into `tip-full-remedy` on identical bytes (`holds 23/drifted 0` → `holds 16/drifted 7`). Cost: the 7 rows must then carry `superseded_by` S109–S115 — which the registry already provides.
2. **Stop treating the 404 body as digest evidence** — for `old_status === 404`, drop f3/f5/f6 sha binding and require instead two independent seats' records of `404` + the stable first line `NOT_FOUND: Requested entity was not found` for the cited path, and amend the anchor's recorded `body sha256` to state that it is one fetch instance, not a property of the URL (the lane's retained gz still proves what was fetched). Normalising `request_id: "[0-9a-f]{32}"` before hashing is the weaker variant: it makes agreement testable but still cannot bind content, since a foreign path's 404 body passes (`remedy-a-otherpath`).
3. **Require uniqueness and report the offset** — `blockIn` should require exactly one occurrence and the counter should emit the matched new line range (`new_at`) per span. All cited blocks are unique today (occ=1) and offsets reach +181 / −40, so the guard costs nothing and closes the duplication/relocation blind spot.
4. **Require the anchor's file list to be fully filed** — a row names N distinct basenames; r1 should require N entries, not ≥ 1 (S080 is currently clearable with one unchanged file out of eight).

If only one change is admissible this round, (1) is the one that makes C3 true when it terminates; (2) is the one that keeps an honest executor from having to choose between a false negative and a vacuous check.

---

## Commands run (exit codes)

```
curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT' | base64 -d
  → 22 corpus paths × 2 tags: http=200 (manifest: CritSemanticDrift/fetch-manifest.txt)
  → forms/form_mcp_schema_unittest.cc: http=404 both tags (intentional); three wrong-path probes also 404 (unused)

node scripts/check-release-pins.mjs --rev 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb --stable 156.0.8078.47 --json
  → exit 1 ; population=23 unresolved=23                     (baseline reproduction)

node scripts/check-release-pins.mjs --repo <tip-subset>          --rev HEAD --stable 156.0.8078.47 --json → exit 1 ; resolved=22 unresolved=1 holds=22 drifted=0
node scripts/check-release-pins.mjs --repo <tip-full>            --rev HEAD --stable 156.0.8078.47 --json → exit 1 ; resolved=22 unresolved=1 holds=15 drifted=7
node scripts/check-release-pins.mjs --repo <tip-subset-fakerefetch> --rev HEAD --stable 156.0.8078.47 --json → exit 1 ; unresolved=1, S094 reasons=['f5-digest']
node scripts/check-release-pins.mjs --repo <degenerate>          --rev HEAD --stable 156.0.8078.47 --json → exit 1 ; S074 resolved=true verdict=holds ranges=[[7035,7035]]

node scripts/check-release-pins.mjs --repo <tip-subset-remedy>   --rev HEAD --stable 156.0.8078.47 --json → exit 0 ; population=23 resolved=23 unresolved=0 holds=23 drifted=0 clean=true
node scripts/check-release-pins.mjs --repo <tip-full-remedy>     --rev HEAD --stable 156.0.8078.47 --json → exit 0 ; population=23 resolved=23 unresolved=0 holds=16 drifted=7 clean=true
node scripts/check-release-pins.mjs --repo <remedy-a>            --rev HEAD --stable 156.0.8078.47 --json → exit 1 ; S094 resolved=true holds   (refetcher's own 156 body committed)
node scripts/check-release-pins.mjs --repo <remedy-a-otherpath>  --rev HEAD --stable 156.0.8078.47 --json → exit 1 ; S094 resolved=true holds   (404 body of a DIFFERENT path committed)

zcat corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz | sha256sum
  → 9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19  exit 0  (retained 2026-10-21 body)

python3 analyse.py        → replication of blockIn/holds over all 23 rows (holds-analysis.txt)
python3 build_tip.py      → subset / full / fake-refetch fixture runs (tip-*-run.txt)
python3 degenerate.py     → single-line filing (degenerate-single-line-run.txt)
python3 s094_remedy.py    → f6 remedy-a and foreign-404 probes (s094-remedy-a-run.txt)
python3 s094_in_subset.py → all-23 subset + remedy-a (tip-subset-remedy-run.txt)
python3 s094_in_full.py   → all-23 full spans + supersessions + remedy-a (tip-full-remedy-run.txt)
```

Fixture hygiene: each fixture is a fresh directory under `$HYAKU_SCRATCH/tabi-r29/CritSemanticDrift` (removed and recreated per run), `git init` there, `git -C "$D" rev-parse --show-toplevel` asserted equal to `$D` before the first commit; every git call names `-C "$D"`; the lane was read with `git show` only and never written.
