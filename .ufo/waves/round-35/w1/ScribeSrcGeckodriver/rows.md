# SOURCES rows — draft for L1 integration (C2 Firefox / geckodriver)

Seat `ScribeSrcGeckodriver`, wave w1, round 35. Baseline freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`.
Insert these rows at the end of the `## Registry` table, immediately after the `S133` row and before the
`## Paths` heading (clone line 147 → 148 at the freeze). Append-only: no existing row is touched.

Id range: the seat item named `S134-S135`. Two further rows (`S136`, `S137`) are the escape-hatch files the
same item ordered ("if the capability is not documented there, find where geckodriver emits it in its source …
and register that file at a pinned tag v0.37.1") — `Capabilities.html` documents neither `webSocketUrl` nor
`moz:geckodriverVersion` (byte sweep below), so the code files that do are registered. L1 renumbers if it prefers.

Registry has 133 rows at the freeze (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`
→ 133), so `S134` is the next unused id; `S134`–`S137` are absent from the registry before this draft
(`grep -c -F '…URL…'` = 0 for all four URLs, commands in `census-check.txt`).

| S134 | geckodriver Flags — https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | docs | A | the launch switches a Firefox driver is built on, as the geckodriver docs page states them: the BiDi WebSocket port and its 9222 default, the WebDriver server port, and the temporary-profile root | fetched 2026-10-26T21:12:29Z, HTTP 200, 41404 B, sha256 2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc (living Sphinx build of testing/docs/geckodriver/Flags.md, no page-level version stamp — the only version strings in the bytes are the `--android-storage` deprecation note's 0.31.0 and 0.30.0 at lines 341-342); §`--websocket-port PORT` section lines 494-499 with the default quote at 496, §`-p PORT / --port PORT` section lines 472-477 (474), §`--profile-root PROFILE_ROOT` section lines 478-487 (480, read-write sentence 481-482) | `--websocket-port 0` and `--port 0` take a system-assigned free port instead of the 9222 and 4444 defaults, and `--profile-root` keeps temporary profiles inside the caller's own directory — the port-hygiene facts a driver launch needs | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |
| S135 | Firefox capabilities — geckodriver — https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | docs | A | which Firefox-specific capabilities geckodriver's own page documents in place, and the absence of `webSocketUrl` and `moz:geckodriverVersion` from its bytes | fetched 2026-10-26T21:12:29Z, HTTP 200, 31324 B, sha256 e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842; §Firefox capabilities lines 291-295, §moz:debuggerAddress heading line 297, §moz:webdriverClick heading line 338; byte sweep on the fetched file: `webSocketUrl` 0, `moz:geckodriverVersion` 0, `moz:firefoxOptions` 1 (the MDN link target at line 293) | The page covers only `moz:debuggerAddress` and `moz:webdriverClick` in place and defers the rest to MDN, so a BiDi-enable capability or a driver-version capability cannot be grounded from this page | mined | 2026-10-26 | 90d | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |
| S136 | geckodriver 0.37.1 capability parsing — capabilities.rs — https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/capabilities.rs | code | A | how geckodriver 0.37.1 reads the `webSocketUrl` capability and the `moz:firefoxOptions` object when it builds a session; the v0.37.1 tag bytes only, not Firefox's own BiDi support | tag v0.37.1 of the mozilla/geckodriver mirror, crate `version = "0.37.1"` at Cargo.toml:4 (same fetch 2026-10-26T21:12:29Z, HTTP 200, 1656 B, sha256 7d44e4c4c402b042120071bbd870d1adb284cbab5c548bc53065b7d1a21b8543); `capabilities.rs:510-513` (the `webSocketUrl` read), :515-518 (`moz:debuggerAddress`, the other switch), :522-523 (`rv.use_websocket = true`), :199-215 and :411-418 (`moz:firefoxOptions` object and its unknown-field rejection); fetched bytes 54316 B, sha256 d3e65953dca6b6e1653326fbeae49d4c6cd1abfba8df47de9f9d9ca2ac870359 | A `webSocketUrl` boolean capability is what flips `use_websocket` in geckodriver 0.37.1, so a BiDi endpoint is requested per New Session instead of assumed from the launch flags | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |
| S137 | geckodriver 0.37.1 New Session response — marionette.rs — https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs | code | A | where geckodriver 0.37.1 injects `moz:geckodriverVersion` into the capabilities it returns from New Session, and that the injected value is the crate version string alone | tag v0.37.1 of the mozilla/geckodriver mirror (crate `version = "0.37.1"` at Cargo.toml:4); `marionette.rs:757-770` with the insert at 767 inside the `NewSession` arm, value from `build::build_info()`; build.rs:38-41 `impl From<BuildInfo> for Value` yields `BuildInfo::version()` only; fetched marionette.rs 2026-10-26T21:13:19Z, HTTP 200, 66012 B, sha256 757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3, build.rs 1184 B, sha256 69379ffa7946fbd01f116f83182ff8341504d86eae2e1dcc7d1dccf9ee028c25; installed binary self-reports `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)` | geckodriver appends its own crate version as `moz:geckodriverVersion` to every New Session capability set, so a receipt names the driver version it ran but not the commit hash its `--version` banner shows | mined | 2026-10-26 | on-release | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md |

## Notes for L1 (not row content)

- **Two rows beyond the named range.** See the id-range paragraph above. If L1 wants exactly two rows, the
  defensible pair is `S134` + `S137` (Flags switches; the `moz:geckodriverVersion` emission the item asked for);
  `S135` (the absence sweep) and `S136` (`webSocketUrl` parse) are the two that make the C2 gate predicate —
  "a BiDi command on a live Firefox session" — groundable rather than folkloric.
- **The 9222 collision is the craft point.** The geckodriver page states the BiDi WebSocket port "Defaults to 9222"
  (`Flags.html:496`), and `127.0.0.1:9222` is the operator's musketeer CDP lease port in this fleet. `.ufo` /
  contract forbid binding it. `--websocket-port 0` is the documented, supported way out ("bind to 0 to get the
  system to atomically assign a free port", `Flags.html:497-498`).
- **`--profile-root` is documented as a write-permission fact, not an isolation claim**: "Both geckodriver and
  Firefox must have read-write access to this path" (`Flags.html:481-482`). A seat that points it at a
  read-only scratch gets a launch failure, not a fallback.
- **`moz:geckodriverVersion` value shape.** `build.rs:38-41` converts `BuildInfo` to a JSON string using
  `BuildInfo::version()` only, so the capability is `"0.37.1"` — not the `--version` banner's
  `0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`. A receipt that wants the commit hash must take it from the
  banner or the binary, not from the session capabilities.
- **Version pin honesty.** The two doc rows are living pages (Sphinx build of `testing/docs/geckodriver/*.md`
  on a moving branch, no release stamp), so `recheck` is `90d` and the byte sha256 is the real anchor. The two
  code rows are pinned to tag `v0.37.1`, so `recheck` is `on-release`: a new geckodriver release makes them stale.
- **`moz:firefoxOptions` is not documented on the Capabilities page** — its single occurrence is the MDN link
  target in "Most of these are documented on MDN" (`Capabilities.html:293`), and that MDN URL
  (`developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions`) is **not** opened here and is
  **not** claimed as a source. S136's `:199-215`/`:411-418` anchors are the only source-level statement about it
  in this batch.
- **Support files fetched but deliberately not registered** (they corroborate anchors, they do not teach a
  separate benefit): `Cargo.toml` at tag `v0.37.1` (crate `version = "0.37.1"`, 1656 B,
  sha256 `7d44e4c4…`) and `src/build.rs` (1184 B, sha256 `69379ffa…`). Both re-fetched at
  `2026-10-26T21:14:56Z` byte-identical to the first fetch. Receipts in `fetches/fetch-receipt.tsv`.
