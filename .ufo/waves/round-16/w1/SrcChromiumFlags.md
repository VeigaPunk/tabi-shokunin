# SrcChromiumFlags — Chromium WebMCP feature entries (round 16, wave 1)

Seat: `TabiR16.SrcChromiumFlags-5` (leaf scout). Access date for every URL below: **2026-10-20**.
No gates/browsers/counters run; no tool installs. All reads via `curl` (read-only network).

## Artifacts opened (identity pinned)

| Ref | Commit | File | SHA-256 of fetched bytes | Lines |
|---|---|---|---|---|
| chromium `main` | `9fb5068556ca4e5df6a0a5884490ab031810c610` (`git ls-remote https://chromium.googlesource.com/chromium/src main`, 2026-10-20) | `third_party/blink/renderer/platform/runtime_enabled_features.json5` | `090f32bf0f8f504a59427bd6092fc7ad25f9d4b648861f6af87d5a0b7c2fa3bd` | 7969 |
| tag `154.0.8037.97` (host Chromium per L1 plan) | tag ref resolves to `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (`git ls-remote … refs/tags/154.0.8037.97*`) | same path | `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` | 7428 |

Fetch methods: main = `curl -sS https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/platform/runtime_enabled_features.json5`; gitiles mirror = `https://chromium.googlesource.com/chromium/src/+/main/<path>?format=TEXT` piped through `base64 -d`; tag = same gitiles form with `+/refs/tags/154.0.8037.97/<path>?format=TEXT`.
Equality check: GitHub-raw and gitiles-`main` copies are byte-identical (`sha256sum` both `090f32bf…2fa3bd`).

## `main` entries (all WebMCP matches, `grep -n -i 'webmcp'`)

| Name (line of `name:`) | Status | public | Origin trial | `implied_by` (lines) | Base feature |
|---|---|---|---|---|---|
| `DeclarativeWebMCP` **2396** | `experimental` (2406) | true (2399) | `"WebMCP"` (2397) | `WebMCPDeclarativeFileInput`, `WebMCPFormAssociatedCustomElements` (2402-2405) | `base_feature_status: "enabled"` + `copied_from_base_feature_if: "overridden"` (2400-2401) → generated `blink::features::kDeclarativeWebMCP` |
| `WebMCP` **7528** | `experimental` (7540) | true (7531) | `"WebMCP"` (7529) | `WebMCPContinuations`, `WebMCPDeclarativeFileInput`, `WebMCPFormAssociatedCustomElements` (7535-7539) | same base semantics (7532-7533) → `blink::features::kWebMCP` |
| `WebMCPContinuations` **7543** | `experimental` (7545) | true (7544) | — | — | auto-generated same-name base feature, default disabled |
| `WebMCPDeclarativeFileInput` **7548** | `test` (7549) | false | — | — | auto-generated same-name base feature, default disabled |
| `WebMCPFormAssociatedCustomElements` **7554** | `experimental` (7555) | false | — | — | auto-generated same-name base feature, default disabled |

Quotes (main, line-located, each ≤25 words):

- `runtime_enabled_features.json5:2378-2380` — "Declarative WebMCP: tools declared via HTML <form> attributes (`toolname`, `tooldescription`, ...), and the associated CSS pseudo-classes and SubmitEvent extensions." (19 words)
- `:2396` — `name: "DeclarativeWebMCP",` · `:2406` — `status: "experimental",`
- `:7526-7527` — "Imperative WebMCP: `document.modelContext` and its tool registration/execution APIs. See also `DeclarativeWebMCP`." (15 words)
- `:7528` — `name: "WebMCP",` · `:7540` — `status: "experimental",`
- `:7535-7538` — `implied_by: [` … `"WebMCPContinuations",` `"WebMCPDeclarativeFileInput",` `"WebMCPFormAssociatedCustomElements"`
- `:7543-7545` — `name: "WebMCPContinuations",` / `public: true,` / `status: "experimental",`
- `:7548-7549` — `name: "WebMCPDeclarativeFileInput",` / `status: "test",`
- `:7552-7555` — "Support for form-associated custom elements in declarative WebMCP tools." then `name: "WebMCPFormAssociatedCustomElements",` / `status: "experimental",`

Negatives on main (searched, not found):

- **`WebMCPTesting` — ABSENT.** No occurrence of the string in the file at main (same `grep -n -i` set; removed 2026-10-06, see timeline).
- **`DeclarativeWebmcp` (lowercase `mcp`) — ABSENT** as a literal in either ref; the only spelling is `DeclarativeWebMCP` (main) / none at 154.

Base-feature semantics are documented in the same file's schema header: `base_feature` at `:120-139`, `base_feature_status` at `:141-151` (`"enabled"` = `base::FEATURE_ENABLED_BY_DEFAULT`), `copied_from_base_feature_if` at `:153-177`. With `"overridden"`, the Blink flag follows only an explicit command-line/field-trial override, so the default-enabled base feature does not by itself turn the Blink feature on. Schema quote `:172-176` (22 words): "we require the base::Feature to be enabled by default, but we don't want the default enabled status to affect the Blink feature."

Override wiring on main (`content/child/runtime_features.cc`, fetched raw GitHub same commit):
- `:268-272` — "Overriding kWebMCP (e.g. --enable-features=WebMCP) controls both imperative and declarative WebMCP. An explicit kDeclarativeWebMCP override still takes precedence…" followed by `{"DeclarativeWebMCP", blink::features::kWebMCP, kSetOnlyIfOverridden},`
- Therefore on main, `--enable-features=WebMCP` turns on declarative WebMCP unless `DeclarativeWebMCP` is explicitly overridden; enabling the origin trial `WebMCP` also covers both.

## Tag 154.0.8037.97 entries (host binary source line)

| Name (line) | Status | Notes |
|---|---|---|
| `WebMCP` **7023** | `experimental` (7035) | OT `"WebMCP"`; `implied_by` = `WebMCPDeclarativeFileInput`, `WebMCPFormAssociatedCustomElements`, **`WebMCPTesting`** (7030-7034) |
| `WebMCPDeclarativeFileInput` **7038** | `test` (7039) | same as main |
| `WebMCPFormAssociatedCustomElements` **7044** | `experimental` (7045) | same as main |
| `WebMCPTesting` **7048** | `experimental` (7049) | present only at 154 |
| `DeclarativeWebMCP` | **ABSENT at 154** | declarative gating lived under `WebMCP` pre-split |

Quotes:
- `:7023` — `name: "WebMCP",` · `:7031-7033` — `"WebMCPDeclarativeFileInput",` `"WebMCPFormAssociatedCustomElements",` `"WebMCPTesting"`
- `:7048-7049` — `name: "WebMCPTesting",` / `status: "experimental",`

## `DevToolsWebMCPSupport` — not in chrome/common or content features

- `chrome/common/chrome_features.cc` (main and 154): zero `webmcp|modelcontext` matches.
- `content/public/common/content_features.cc` (main and 154): zero matches.
- It is a **Blink common feature**:
  - 154 `third_party/blink/common/features.cc:571` — `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);`
  - 154 `third_party/blink/public/common/features.h:396` — `BLINK_COMMON_EXPORT BASE_DECLARE_FEATURE(kDevToolsWebMCPSupport);`
  - 154 call sites (all `base::FeatureList::IsEnabled(…kDevToolsWebMCPSupport)`):
    - `chrome/browser/devtools/chrome_devtools_session.cc:95-98` (registers `WebMCPHandler` for trusted clients)
    - `content/browser/devtools/render_frame_devtools_agent_host.cc:476-478` (`session->CreateAndAddHandler<protocol::WebMCPHandler>();`)
    - `third_party/blink/renderer/core/exported/web_dev_tools_agent_impl.cc:364-366` (`CreateAndAppend<InspectorWebMCPAgent>`)
- `main`: the symbol is **absent from `third_party/blink/common/features.cc`** (grep finds only `kWebMCPContinuationTimeout`/`kWebMCPContinuations` in an unrelated param list at 2444-2445) and from the header. The registration sites now run unconditionally (observed at main): `chrome/browser/devtools/chrome_devtools_session.cc:95-98`, `content/browser/devtools/render_frame_devtools_agent_host.cc:491`, `third_party/blink/renderer/core/exported/web_dev_tools_agent_impl.cc:366`; `content/browser/devtools/protocol/webmcp_handler.cc` and `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` contain no feature check.

## Timeline (provenance from chromium-review; message text, not source)

| Date (submitted) | CL | Subject / quote |
|---|---|---|
| 2026-05-13 | [7844692](https://chromium-review.googlesource.com/c/chromium/src/+/7844692) | "Enable WebMCP DevTools support by default" (MERGED) |
| 2026-09-03 | [8330412](https://chromium-review.googlesource.com/c/chromium/src/+/8330412) | "Remove webmcp devtools support feature flag" (MERGED); files include `third_party/blink/common/features.cc`, `chrome/browser/devtools/chrome_devtools_session.cc`, `content/browser/devtools/render_frame_devtools_agent_host.cc`, `web_dev_tools_agent_impl.cc`, `chrome/browser/flag-metadata.json` |
| 2026-10-06 08:30 | [8500114](https://chromium-review.googlesource.com/c/chromium/src/+/8500114) | "Split declarative WebMCP into its own runtime feature"; "Overriding kWebMCP (e.g. --enable-features=WebMCP or the chrome://flags entry) enables both features." (14 words) |
| 2026-10-06 09:44 | [8505458](https://chromium-review.googlesource.com/c/chromium/src/+/8505458) | "Remove unused WebMCPTesting runtime feature"; "The `WebMCPTesting` Blink runtime-enabled feature is not used to gate anything; it was only listed in the `implied_by` lists of `WebMCP` and `DeclarativeWebMCP`." (23 words); files: `runtime_enabled_features.json5` + one CSS parser test |

This explains the ref divergence precisely: the host's 154 tag predates the 2026-09-03 DevTools-flag removal and the 2026-10-06 declarative split/WebMCPTesting removal.

## Consequences for the round-16 harness / knowledge note

1. The L1 probe's flag string `--enable-features=…,DeclarativeWebmcp,…` was **inert at 154** (no such feature, case-sensitive) and would also be inert on main (correct token: `DeclarativeWebMCP`). Declarative behaviour at 154 was governed by `WebMCP` itself; on main `--enable-features=WebMCP` still enables declarative via `content/child/runtime_features.cc:272` unless explicitly overridden. The observed `WebMCP.toolsAdded` declarative result stands; only the flag attribution changes.
2. `WebMCPTesting` is valid-but-non-gating at 154 (its only effect there is being an `implied_by` of `WebMCP`, so passing it implies `WebMCP`); it does not exist on main, so a main-based harness must drop the token.
3. `DevToolsWebMCPSupport` is already `FEATURE_ENABLED_BY_DEFAULT` at 154 and removed on main; the token is a no-op on both for observation purposes. The CDP `WebMCP` domain is not flag-gated at main.
4. Exact, case-sensitive tokens to use: 154 → `WebMCP`, `WebMCPTesting`, `DevToolsWebMCPSupport`; main → `WebMCP` and/or `DeclarativeWebMCP`.

## Confidence and remaining unknowns

- **High** — every entry, status, line number and the two absences are direct greps of byte-identical fetched files at pinned revisions; quotes copied verbatim from fetched bytes.
- **Medium** — "no other definition exists" is scoped to the four assigned files plus symbol greps in the fetched features files; I did not full-text-search the whole Chromium tree (grep.app returns an anti-bot challenge; GitHub code search requires auth). A tree-wide search would only add call sites, not change flag status.
- **Unresolved** — none material. `WebMCPContinuations`' intended purpose is undocumented in the JSON5 beyond its name (it is listed in `WebMCP.implied_by` and has no `origin_trial_feature_name`); not needed for the harness.

## Commands actually run (representative, all observed)

```
curl -sS -o ref_main.json5 https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/platform/runtime_enabled_features.json5   # 200 256045, 7969 lines
grep -c -i 'webmcp\|modelcontext' /tmp/ref_main.json5                             # 24
grep -n -i webmcp /tmp/ref_main.json5 | cut -d: -f1                               # 2378 2381 2383 2384 2386 2388 2389 2393 2395 2396 2397 2403 2404 7526 7527 7528 7529 7536 7537 7538 7543 7548 7553 7554
curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT' | base64 -d > ref154.dec.json5   # 200 310220, 7428 lines
grep -n -i webmcp /tmp/ref154.dec.json5                                            # 7023-7048, 9 hits incl. WebMCPTesting
grep -n -i 'webmcp\|modelcontext' /tmp/chrome_common_chrome_features.cc /tmp/content_public_common_content_features.cc   # no output, exit 1 (main and 154 copies)
grep -n 'kDevToolsWebMCPSupport' /tmp/tag154_third_party_blink_common_features.cc.dec    # 571
grep -n 'kDevToolsWebMCPSupport' /tmp/{chrome_devtools_session,render_frame_devtools_agent_host,web_dev_tools_agent_impl}.dec  # 95 / 476 / 364
sha256sum /tmp/ref_main.json5 /tmp/ref_gs.json5                                   # identical 090f32bf…2fa3bd
```
