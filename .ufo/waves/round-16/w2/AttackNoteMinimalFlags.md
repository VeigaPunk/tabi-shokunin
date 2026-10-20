# Attack — note "minimal flag set" vs probes/WebmcpProbeFlags.json and S034

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3` (measured revision; commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).
- Target text: `corpus/knowledge/webmcp-chromium-loopback-round-16.md:38-46`.
- Fixture: `.ufo/waves/round-16/probes/WebmcpProbeFlags.json` (committed sha256 `c5569fa91b5be4c0eabf1685217c6139b222dba575edd6b7c692ed81ec6f88dd`), producer `.ufo/waves/round-16/probes/WebmcpProbeFlags.mjs`.
- Note blob sha256 `91c0385b188a0e96c4a1febb3077f9ec1f7104fe4dedc52f0f99fb1ecd86ac22`; working tree equals HEAD for both files (`git status --porcelain` empty, sha256 matches `git show HEAD:`).
- Runtime (re-measured this session): Chromium `154.0.8037.97 Arch Linux`, Playwright `1.64.0`, Node `v24.21.0`.
- Read-only lane discipline: the probe hardcodes `OUT_PATH` beside itself (writes into the lane), so it was **not** run from the lane. A copy was run in `/tmp/w2-flags-fMkbw8/`; it wrote only `/tmp/w2-flags-fMkbw8/WebmcpProbeFlags.json`. No lane mutation; no installs/upgrades performed.

## Attack item

> "Minimal flag set (probe, not receipt): any one of `--enable-blink-features=WebMCP`,
> `--enable-features=WebMCP`, `--enable-experimental-web-platform-features` exposes
> `document.modelContext` and the CDP event stream on this build
> (`…/WebmcpProbeFlags.json`, 11 launch variants)."

### Verdict: **BREAKS as written — one false parenthetical; every operative assertion HOLDS**

- **BREAKS:** "11 launch variants" is false. The committed fixture has **14** cases, and the committed producer has 14 case definitions (`grep -c "name: '"` = 14). The number 11 is the *receipt's* case count (`receipt.json.cases.length` = 11), not the probe's; the probe paragraph appears to have inherited it. At commit time the fixture already had 14 cases (fixture `producedAt` 2026-10-20T14:33:18.074Z is ~21 min before the 14:54:43Z commit timestamp).
- **HOLDS:** each of the three named single flags independently yields `document.modelContext` = object **and** a `WebMCP.toolsAdded` carrying the declarative tool `search` (committed fixture and fresh re-run).
- **HOLDS:** zero flags is negative (`none`: `documentModelContextTypeof` `undefined`, 0 events), so one flag is minimal; no sub-one-flag set exists.
- **HOLDS:** the S034 sentence is exact, including citation range 7023-7035 and the default-on `DevToolsWebMCPSupport` line.

### Commands and observed output

```
$ git rev-parse HEAD
b444ca8e024f386124418169e8e400221524bba3

$ git show HEAD:.ufo/waves/round-16/probes/WebmcpProbeFlags.json | node -e '…'
committed cases: 14
producedAt: 2026-10-20T14:33:18.074Z
posMC: 10 posEv: 9

$ git show HEAD:.ufo/waves/round-16/probes/WebmcpProbeFlags.mjs | grep -c "name: '"
14
$ git show HEAD:.ufo/waves/round-16/probes/WebmcpProbeFlags.mjs | grep -n "Ablation cases added"
88:  // Ablation cases added after CriticC2-5 source-scoped predictions:

$ node -e '<receipt>'   # corpus/evidence/round-16/webmcp/receipt.json
receipt cases: 11
```

Fresh re-run of a copy (exit 0; one launch per case):

```
$ d=$(mktemp -d /tmp/w2-flags-XXXXXX); cp …/WebmcpProbeFlags.mjs "$d/"; cd "$d"; node WebmcpProbeFlags.mjs
case=none                              enable=ok  doc.modelContext=undefined toolsAdded=0
case=features-WebMCP                   enable=ok  doc.modelContext=object    toolsAdded=1
case=blink-WebMCP                      enable=ok  doc.modelContext=object    toolsAdded=1
case=experimental-web-platform-features enable=ok doc.modelContext=object    toolsAdded=1
case=blink-WebMCPTesting               enable=ok  doc.modelContext=object    toolsAdded=1
case=blink-WebMCP+disable-DevToolsWebMCPSupport enable=err 'WebMCP.enable' wasn't found
case=features-WebMCP+disable-blink-WebMCP       enable=ok  doc.modelContext=undefined toolsAdded=0
… (all 14 cases)
wrote /tmp/w2-flags-fMkbw8/WebmcpProbeFlags.json
EXIT=0
```

Reproduction fidelity: `schema`, `runtime`, `page`, and `summary` are byte-identical between the committed fixture and the fresh run; the only case-level diffs are 9 per-run `frameId` hashes. Event payloads for the named singles: `tools: 1`, `toolNames: ["search"]`.

## Findings by severity

### S3 — false variant count in the note (path: note:41)
`11 launch variants` vs 14 committed cases (10 `document.modelContext` positives, 9 `toolsAdded` positives). The fixture's own ablation comment (`WebmcpProbeFlags.mjs:88`) shows three cases were appended after the first matrix, which is the most plausible origin of the stale count. Fix: `11` → `14`. No certification impact, but the sentence's evidence pointer is wrong as committed.

### S3 — enumeration is incomplete against the committed fixture (path: note:38-40)
`--enable-blink-features=WebMCPTesting` is a fourth **single-token** sufficiency path: `document.modelContext` object + `WebMCP.toolsAdded` tool `search`, in both the committed fixture and the fresh run. It is not a counterexample to "any one of A, B, C exposes…", but the paragraph is titled "Minimal flag set" and immediately cites S034's `implied_by: … "WebMCPTesting"`, so the omission reads as exhaustive when it is not. Fix: add the fourth flag, or mark the list exemplary ("e.g."). Note the fixture's `summary.minimalFor*` names a single case only because of an alphabetical tie-break over equally minimal one-argument cases (`blink-WebMCP` < `blink-WebMCPTesting` < `experimental-web-platform-features` < `features-WebMCP`); it does not assert uniqueness.

### S4 — "any one of" is sensitive to an explicit disabling token (path: fixture, `features-WebMCP+disable-blink-WebMCP`)
`--enable-features=WebMCP --disable-blink-features=WebMCP` → `document.modelContext` undefined. This is consistent with S034 (`copied_from_base_feature_if: "overridden"`, explicit Blink override wins) and does not contradict the note; a one-clause caveat ("absent an explicit `--disable-blink-features=WebMCP`") would prevent a careless "flag always wins" reading.

## Positive verification of the source sentence (falsification failed here)

S034 re-opened this session (access 2026-10-20), tag-pinned URL decoded from `?format=TEXT`; sha256 `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` matches the SOURCES row `99b92e67…1d2b`.

- Lines 7023-7035, verbatim field set: `name: "WebMCP"`, `public: true`, `base_feature_status: "enabled"`, `copied_from_base_feature_if: "overridden"`, `implied_by: ["WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting"]`, `status: "experimental"`. The note's citation range and every clause ("experimental", base_feature_status enabled when overridden, implied_by WebMCPTesting) are exact.
- S034 schema comment (same file, lines 182-190): "Enables the Blink feature when the base::Feature status is overridden to the enabled or disabled state". Also (lines 118-121): "a base::Feature is automatically generated in features_generated.{h,cc}". This explains both observed paths without a hand-written `kWebMCP` in `blink/common/features.cc` (`grep WebMCP` there yields only line 571): `--enable-features=WebMCP` overrides the auto-generated base feature, whose default is enabled by `base_feature_status`.
- `grep -n "DeclarativeWebMCP"` on the 154 file → no match (`rc=1`); on `main` → line 2396 `name: "DeclarativeWebMCP"` (`rc=0`). Note's "no DeclarativeWebmcp at 154; main later added DeclarativeWebMCP" holds. `features-DeclarativeWebmcp` is correspondingly negative in the probe.
- `blink/common/features.cc` at the 154 tag, line 571: `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);` — note's claim and line number exact.
- Default-on domain is independently visible in the fixture: `none` → `WebMCP.enable` ok `{}`; `--disable-features=DevToolsWebMCPSupport` → `'WebMCP.enable' wasn't found`. The note's decision-table caveat (enable success ≠ page feature) is consistent with `none` having no `document.modelContext`.

## Residual risk and verification gaps

- The count defect is documentation-only; it does not weaken the C2 runtime observation or the 11/11 receipt (`receipt.json` genuinely has 11 cases).
- The probe is a single-host, flag-enabled observation on one build; the fresh run re-confirms it only for `154.0.8037.97`. Any package change invalidates both fixture and note.
- The probe writes beside itself by design; a future re-run must use a `/tmp` copy or the producer needs an `--out` argument, otherwise it mutates the lane.
- `summary.minimalFor*` semantics (single case name via alphabetical tie-break) can be misread as uniqueness; not a note error, but a reworded summary field (`minimalOneFlagCases: [...]`) would remove the ambiguity.
- No claim here is non-author certification: this report is an author-side attack on the note text and its local fixture only.
