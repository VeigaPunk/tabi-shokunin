# ReopenS034 — S034 re-opened at tag 154.0.8037.97 (wave 2, FALSIFY)

Seat: TabiR16.ReopenS034 (leaf, read-only on lane; this file is the only lane write).
Target: `corpus/SOURCES.md:48`, row S034.
Access date: 2026-10-20. Verdict: **HOLDS**.

## Row under attack (verbatim)

`| S034 | Chromium 154 runtime_enabled_features.json5 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 | code | A | Which Blink runtime features gate WebMCP in Chromium 154 and how they imply each other | tag 154.0.8037.97, lines 7023-7050, sha256 99b92e67…1d2b | WebMCP is experimental and implied by WebMCPTesting at 154; no DeclarativeWebmcp feature exists there, so that flag token is inert | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |`

## 1. Open and pin the source (anchor honesty)

Command:
`curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT' -o /tmp/s034_b64.txt`
Observed: `HTTP:200 bytes:310220` (base64 text); `base64 -d` → 232,665 bytes, 7,428 lines.

Command: `sha256sum /tmp/s034_154.json5`
Observed: `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b  /tmp/s034_154.json5`
Row's digest `99b92e67…1d2b` matches both prefix and suffix. ✓

Command: `awk 'NR==7023||NR==7050{printf "%d:[%s]\n", NR, $0}' /tmp/s034_154.json5`
Observed:
```
7023:[      name: "WebMCP",]
7050:[    },]
```
i.e. the anchor begins at the `name: "WebMCP",` line and ends at the `},` closing the `WebMCPTesting` block; region `sed -n '7023,7050p'` contains exactly the four blocks WebMCP / WebMCPDeclarativeFileInput / WebMCPFormAssociatedCustomElements / WebMCPTesting. Anchor is exact, not a superset of unrelated text. ✓

## 2. Quote supporting `teaches` (≤25 words, with location)

> "implied_by: [ "WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting" ], status: "experimental","

Location: `third_party/blink/renderer/platform/runtime_enabled_features.json5:7030-7035` at tag `154.0.8037.97`; accessed 2026-10-20 (8 words as quoted; multi-line array rejoined). It grounds "WebMCP is experimental and implied by WebMCPTesting at 154". Note the same block also names `WebMCPDeclarativeFileInput` and `WebMCPFormAssociatedCustomElements` as imply-ers; `WebMCPTesting` is defined in the same anchor at 7048-7050 (`status: "experimental"`).

The absence half of `teaches` ("no DeclarativeWebmcp feature exists there") cannot be carried by any quote; it is carried by exhaustive search of the anchored file:

Command: `grep -in "declarative" /tmp/s034_154.json5`
Observed hits only: 2174/2176/2180 `DeclarativeCSSModules`, 2184 `DeclarativeFragment`, 2189/2190 `DeclarativePerformanceObserver`, 2201 `DeclarativeSkeletons`, 3502 comment, 5683/5684 `DeclarativeCSSModules` implied_by/origin-trial, 5704 comment, 7031/7038 `WebMCPDeclarativeFileInput`, 7042 comment. **No `DeclarativeWebmcp` / `DeclarativeWebMCP` in any casing.**

## 3. Test the "inert" clause against the shipped 154 runtime (strongest available check)

Binary identity (matches the knowledge note's pins): `sha256sum /usr/lib/chromium/chromium` → `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a` (`95b17db7…b330a`); `/usr/bin/chromium` → `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` (`eaed39c3…a172b`); `pacman -Q chromium` → `chromium 154.0.8037.97-1`.

Source of the matching rule: `base/feature_list.cc` at the same tag — `ParseEnableFeatureString` copies the token verbatim into `feature_name` (no case folding), `RegisterOverride` keys it with `overrides_.try_emplace(feature_name, …)`, and lookup is `overrides_.find(name)` (line 1318). Matching is exact-case, no `k` normalization. There is no feature named `DeclarativeWebmcp` anywhere in the tree's runtime-feature registry or `third_party/blink/common/features.cc` (`grep -in "webmcp|declarativewebmcp"` → only `kDevToolsWebMCPSupport` at features.cc:571).

Direct probe (my own run; page written to /tmp, temp `--user-data-dir`, 4 s virtual time, no lane writes, no network):

```
/usr/bin/chromium --headless --no-sandbox --disable-gpu --no-first-run \
  --user-data-dir=$(mktemp -d /tmp/s034ud.XXXXXX) --virtual-time-budget=4000 \
  --dump-dom "$FLAGS" file:///tmp/s034probe.html
```
Page body reports `("modelContext" in document)`, `typeof document.modelContext`, `("modelContext" in navigator)`.

Observed:
```
<no flags>                                 -> DOC=NO  TYPE=undefined NAV=NO
--enable-features=DeclarativeWebmcp        -> DOC=NO  TYPE=undefined NAV=NO
--enable-blink-features=DeclarativeWebmcp  -> DOC=NO  TYPE=undefined NAV=NO
--enable-features=WebMCP                   -> DOC=YES TYPE=object    NAV=NO
--enable-features=WebMCP,DeclarativeWebmcp -> DOC=YES TYPE=object    NAV=NO
```
The token alone activates nothing; added to `WebMCP` it changes nothing. "That flag token is inert" is confirmed on the observable WebMCP surface of this exact binary. (Cross-check: the lane's own `probes/WebmcpProbeFlags.json` shows `--enable-features=WebMCP` alone exposing `document.modelContext` plus a declarative `WebMCP.toolsAdded`, so the positive control is not headless-specific.)

## 4. Contract v1 honesty (CORPUS.md:64-155)

- `kind` = `code`: the cell is a Chromium source file; not spec/docs. ✓
- `tier` = `A`, scoped to "Which Blink runtime features gate WebMCP in Chromium 154 and how they imply each other": source code at a pinned tag is the A-grade authority for that scope. Tier not inflated (not community, not a secondary write-up). ✓
- `scope` matches what `teaches` asserts and stays inside the tag; the extra "flag token is inert" clause is a practical consequence of the same gating question, not a claim about page behavior on other builds. ✓
- `anchor` carries revision (tag), exact lines (7023-7050), and a digest whose prefix/suffix both verify. ✓
- `teaches` = one learner benefit, no `|`, no ungrounded superlatives. ✓
- `status` = `mined`; `used-by` = `corpus/knowledge/webmcp-chromium-loopback-round-16.md`, which exists and cites "S034, lines 7023-7035" (the inner WebMCP entry; consistent with, and narrower than, the row's 7023-7050 anchor). ✓
- `opened` 2026-10-20 (re-opened by me today); `recheck` = `on-release`, a valid cadence for a version-tagged artifact. ✓
- Census on the row: `awk -F'|' '/^…S034…/ {print "NF="NF}'` → `NF=13`; duplicate-id scan → none; `used-by` existence test → yes. ✓

## 5. Adjacent observations (not verdict-changing, recorded so they are not lost)

1. **`kDeclarativeWebmcp` exists as a string in the 154 binary** — `.rodata` file offset 618030 (`grep -aob "kDeclarativeWebmcp" /usr/lib/chromium/chromium`), adjacent to other k-prefixed identifiers (`kSpeechRecognition`, `kDirPseudo`, `kMathml`, `kOverflowShorthand`, `kClipPath`, `kPromiseTry`, `kScrollMarkers`, `kMetaApplicationTitle`, `kWasmExtendedConstantExpressions`, `kDRAFT_IncomingCallNotifications`, `kWebxrDepthSensing`). It is **not** a `base::Feature` name: no 8-byte pointer to 618030 exists anywhere in the file (numpy uint64 scan), while the bare `WebMCP` literal at 2500115 has two aligned `.data.rel.ro` pointers (323812352, 323812832) — the Feature-object name slot. It is also absent from `runtime_enabled_features.json5`, from `third_party/blink/common/features.cc`, and from `web_feature.mojom` (5,327 lines). Declaration/purpose unresolved; it is not the harness token (`DeclarativeWebmcp`, exact literal absent from the binary) and is not reachable by `--enable-features`.
2. **`teaches` under-describes the implication set.** The anchored block lists three imply-ers; the cell names only `WebMCPTesting`. Nothing claimed is false, but the scope wording says "how they imply each other" while the cell shows one edge. Precision note, not a BREAK.
3. The knowledge note's `S034, lines 7023-7035` and the row's `7023-7050` are consistent (single WebMCP entry vs. the whole family); no renumber drift.

## 6. Remaining unknowns

- Declaration site of the `kDeclarativeWebmcp` identifier literal in the 154 build; no observable effect was found, and no feature registry opened contains it.
- Inertness was tested on the `document.modelContext` surface only (two flag forms, one combination); no source evidence suggests the token gates anything else, but a non-page-observable effect was not exhaustively excluded.
- No `## Gate` exists yet in a round-16 lesson file (`corpus/lessons/round-16.md` does not exist); wave-1 seat records (`w1/SrcChromiumFlags.md`, `w1/CriticC2.md`) carry the URL/access/quote for this row. Round-gate recording is L1's integration step, not a row defect observed here.

## Tooling

No installs or upgrades were performed (uv/pacman/npm/cargo: none). Tools used were already present: curl, base64, sha256sum, awk, grep, python3+numpy, chromium 154.0.8037.97-1.
