# ReopenS136S137 — re-open of SOURCES S136, S137 (round 35, w2)

**Verdict.** Both rows hold on the evidence cells: every URL re-fetched at 200 with byte counts and sha256 identical to the Gate rows and SOURCES cells, the Gate quotes are present at the stated lines, tier/kind/cadence fit, and neither URL is registered under another id. Two defects, both low severity (anchor/quote precision, no fact wrong): **S136 anchor** cites `capabilities.rs:199-215 and :411-418` as the "unknown-field rejection", but neither range contains it — the rejection is at `:309-312` (`Invalid moz:firefoxOptions field`, inside the firefoxOptions key loop) and `:336-338` (`Unrecognised option` for unknown `moz:` names); 199-215 is the start of the key-validation loop and 411-418 is the not-an-object check. **S136 Gate quote** is not verbatim: Gate row 17 writes `if has_web_socket_url ¦¦ has_debugger_address {` with U+00A6 broken bars; the source bytes (`capabilities.rs:522`) have `||`. (Table-escape substitution, defensible but a grep of the Gate quote against the source fails.) One further nit on **S137 anchor**: `build.rs:38-41` / "build.rs 1184 B" is `src/build.rs` (verified 1184 B, sha 69379ffa…8c25, lines 38-41 correct); the repo also has a root `build.rs` of 3378 B, so the bare name is ambiguous. S137 otherwise holds.

## Fetches (curl -q -sS --proto =https; all exit 0)
| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| …/v0.37.1/src/capabilities.rs | 2026-10-26T21:40:22Z | 200 | 54316 | d3e65953dca6b6e1653326fbeae49d4c6cd1abfba8df47de9f9d9ca2ac870359 (= Gate) |
| …/v0.37.1/src/marionette.rs | 2026-10-26T21:40:23Z | 200 | 66012 | 757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3 (= Gate) |
| …/v0.37.1/Cargo.toml | 2026-10-26T21:40:24Z | 200 | 1656 | 7d44e4c4c402b042120071bbd870d1adb284cbab5c548bc53065b7d1a21b8543 (= S136 cell) |
| …/v0.37.1/src/build.rs | 2026-10-26T21:40:38Z | 200 | 1184 | 69379ffa7946fbd01f116f83182ff8341504d86eae2e1dcc7d1dccf9ee028c25 (= S137 cell) |
| …/v0.37.1/build.rs (root, not cited) | 2026-10-26T21:40:33Z | 200 | 3378 | c881d3d19e6899e1e17f294dd86dce54457f174c4d2d82e90b53c6ff0445b9c9 |

## Gate quotes located
- S136: `grep -n 'has_web_socket_url\|use_websocket' capabilities.rs` → `395: pub use_websocket: bool`, `510: let has_web_socket_url = matched`, `522: if has_web_socket_url || has_debugger_address {`, `523: rv.use_websocket = true;`. `:511 .get("webSocketUrl")` (flag read 510-513 ✓), `:515-518 moz:debuggerAddress` ✓. Same 522-523 body also pushes `--remote-debugging-port` (so teaches "BiDi endpoint requested per New Session" holds; `webSocketUrl` appears elsewhere only in tests 1008-1067).
- S137: `grep -n 'moz:geckodriverVersion' marionette.rs` → `767: capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());` verbatim; `NewSession(_) =>` arm opens at 743, response at 769-770 (row says "arm, 757-770": the cited span is the capabilities clone + insert + response; arm start is 743 — fine). `src/build.rs:38-41`: `impl From<BuildInfo> for Value { … Value::String(BuildInfo::version().to_string()) }` ✓ (version only; hash/date only in Display :26-36). `Cargo.toml:4 version = "0.37.1"` ✓. `geckodriver --version` → `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)` ✓ (matches the row's self-report).
- Anchor defect proof: `sed -n 199p` = `"moz:firefoxOptions" => {`; `411` = `if let Some(json) = matched.remove("moz:firefoxOptions") {`, 411-418 = not-an-object error; `grep -n 'Invalid moz:firefoxOptions field\|Unrecognised option'` → `312`, `338`.
- Broken-bar proof: `grep -n '¦' lessons/round-35.md` → only line 17 (the S136 Gate row); `grep -n 'build.rs\|…'` shows no other row uses it.

## 11 cells
S136: id ✓ · source (title — canonical URL, tag-pinned raw) ✓ · kind code ✓ · tier A (source code, scoped to v0.37.1 tag bytes, explicitly excludes Firefox BiDi support) ✓ · scope ✓ · anchor ✗ (misplaced rejection lines; see above) · teaches ✓ · status mined ✓ · opened 2026-10-26 ✓ · recheck on-release ✓ (tag-pinned, a new release is the trigger) · used-by file exists (37004 B) ✓.
S137: all ✓ (anchor nit: path `src/build.rs` unqualified).
Duplicates: `grep` of `raw.githubusercontent.com/mozilla/geckodriver` and `capabilities.rs|marionette.rs` in SOURCES.md → only rows 150, 151; no other id carries either URL. Neither `Cargo.toml` nor `src/build.rs` has its own id (secondary fetches referenced inside anchors; their bytes are recorded only in the row cells, not in a Gate row — minor).

## Deliverables
This report only. Scratch /fast/scratch/hyaku/tabi-r35/ReopenS136S137 removed after writing. No browser started; no lane files edited.
