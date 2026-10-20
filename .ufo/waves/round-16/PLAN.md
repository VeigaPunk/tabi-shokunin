# tabi round 16 — L1 plan (canonical planner seat = L1 TabiR16)

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (all paths below are relative to it).
Baseline: `e38d2599a922cb729186353830fff8e159b4fef0` (clean). Round date 2026-10-20.
Start census (fleet validator): exit 0, rows 29, A23/B4/C2, mined24/queued3/rejected2.

## Claims (declared)

- **C1 — operability 8 (lowest non-retired tie: depth/operability/freshness/adjacency at 8).**
  Measurement-identity binding gate. Routes round-15 outside spot-check defects 1 and 2
  (`corpus/lessons/round-15-verifier-spotcheck.md:120-121`): C1's r15 counter was pinned only
  by revision (`measure.mjs` sha256 `3ee59de0…` at 27dfd98 vs `dd9c8675…` at HEAD), and the
  report measured at `b7cf044` rather than the delivered `36240c7`.
  Count: enforced measurement-binding contracts 0→1 (`node .ufo/waves/round-16/measure.mjs REV --claim C1`).
- **C2 — coverage 9 (lane axis) + capability `webmcp-cdp-observation`; sourced.**
  Native WebMCP frontier (README Frontier "Native WebMCP in chromium 152 — unprobed (census U3)").
  L1 pre-probe on this host: Chromium 154.0.8037.97 (`/usr/bin/chromium`), Playwright 1.64.0
  (global npm), Node v24.21.0. With `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
  --enable-blink-features=WebMCP,WebMCPTesting` a loopback page exposes **`document.modelContext`**
  (NOT `navigator.modelContext`; `'modelContext' in navigator` false), and a declarative
  `<form toolname="search" tooldescription="Search"><input name="q"></form>` produces CDP event
  `WebMCP.toolsAdded` `{tools:[{name:"search",description:"Search",inputSchema:{type:"object",properties:{q:{type:"string"}},required:[]},frameId,backendNodeId}]}`.
  With no flags: `WebMCP.enable` returns `{}` (domain exists; `Bogus.enable` → "wasn't found"),
  no `document.modelContext`, no event. `data:` URLs are not the test surface; use `http://127.0.0.1:<port>`.
  Binary strings include `kWebMCP`, `kWebMCPTesting`, `kDeclarativeWebmcp`, `kDevToolsWebMCPSupport`,
  `kWebMCPDeclarativeFileInput`, `kWebMCPFormAssociatedCustomElements`, `ModelContextRegisterToolOptions`,
  `FormModelContextMissingToolName`, `FormModelContextMissingToolDescription`, `FormModelContextParameterMissingName`,
  `FormModelContextParameterMissingTitleAndDescription`, `FormModelContextRequiredParameterMissingName`.
  Count: native-WebMCP held entries 0→1 (`node .ufo/waves/round-16/measure.mjs REV --claim C2`).

Claims are causally separable: C1 reads only binding gate/receipts; C2 reads only WebMCP note/evidence/source rows.
No exploratory claim. Scalars stay unless a counted move justifies them; no source-row inflation called expansion.

## C1 interface contract — `scripts/check-measurement-binding.mjs` (owner: BindCore)

Node ESM, no dependencies, never a shell (`execFileSync`/`spawnSync` with argv arrays), minimal Git
env (`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_OPTIONAL_LOCKS=0`,
`GIT_TERMINAL_PROMPT=0`, `GIT_NO_REPLACE_OBJECTS=1`, plus PATH/HOME/TZ=UTC), `--repo <dir>` (default: git toplevel of cwd).

Manifest `corpus/evidence/round-<N>/measurement-binding.json`:
```json
{ "schema": "tabi-measurement-binding-v1", "round": 16, "baseline": "<40-hex>",
  "claims": [ { "id": "C1", "axis": "operability",
    "counter": { "path": ".ufo/waves/round-16/measure.mjs", "sha256": "<64-hex blob digest>",
                 "argv": ["node", ".ufo/waves/round-16/measure.mjs", "{REV}", "--claim", "C1"],
                 "countField": "c1_binding_contracts" },
    "countedInputs": ["<repo-relative path or directory prefix>", "..."],
    "measuredRevision": "<40-hex>",
    "before": { "revision": "<40-hex>", "count": 0 },
    "after":  { "revision": "<40-hex = measuredRevision>", "count": 1 } } ] }
```
Modes:
- `--check <manifest> [--at REV] [--reproduce] [--json]` (REV default HEAD). Per claim:
  `measured_revision_not_ancestor` (measuredRevision not ancestor-or-equal of REV);
  `counter_digest_unrecorded` (no sha256); `counter_digest_mismatch` (blob at measuredRevision ≠ sha256);
  `counter_changed_since_measurement` (blob at REV ≠ sha256); `counted_inputs_undeclared` (empty list);
  `counted_input_changed` (`git diff --name-only measuredRevision REV -- <countedInputs + counter.path>` nonempty; detail lists paths);
  `argv_unsupported` (argv[0] ≠ `node`, argv[1] ≠ counter.path, or not exactly one `{REV}` token);
  with `--reproduce`: re-run argv with `{REV}`→REV (cwd repo, minimal env, no shell, timeout), parse JSON stdout,
  `counter_failed` (exit ≠0 or unparsable) / `count_not_reproduced` (field ≠ after.count).
  Exit 0 clean, 1 findings, 2 could-not-evaluate (`manifest_unreadable`, `manifest_schema_invalid`, `revision_unresolved`, `git_failed`).
  Stdout first line `MEASUREMENT_BINDING verdict=clean|failed|could_not_evaluate claims=N bound=M`, then one
  `finding claim=<id> reason=<reason> detail=<text>` line per finding (sorted), or one JSON object with `--json`.
- `--legacy <round-15 measurements.json> [--at REV]`: adapts `tabi-round15-measurements-v1` (claims C1/C2 with
  `counterCodeRevision`, `measuredRevision`, no digest/inputs). Reports `counter_digest_unrecorded`, `counted_inputs_undeclared`,
  and `counter_changed_since_measurement` when the counter blob (`.ufo/waves/round-15/measure.mjs`) at counterCodeRevision
  differs from REV; detail carries the blob digests at counterCodeRevision, measuredRevision and REV. Exit 1 expected on the real r15 file.
- `--self-test`: spawns `scripts/selftest-measurement-binding.mjs` (owner: BindSelftest) which builds isolated temp Git repos
  (mkdtemp, minimal env, fixed author/committer dates) and drives the gate as a child CLI; every case asserts exact exit + exact
  reason set. Last stdout line `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=<n> reasons=<k>`; exit 0 only if all pass.
  Required cases: clean positive; clean `--reproduce`; each reason above at least once with a same-shape positive control;
  legacy-shaped manifest; `{REV}` injection attempt (`;`/`$()`) proven inert (no file side effect).

C1 counter (`measure.mjs --claim C1`) counts 1 at REV only if, at REV: the gate blob exists; committed
`corpus/evidence/round-16/binding/selftest.json` has exit 0, the selftest summary line, `cases ≥ 12`, every reason in the
vocabulary above exercised, and `gateSha256` = gate blob digest at REV; committed `corpus/evidence/round-16/binding/legacy-r15.json`
has exit 1 with `counter_digest_unrecorded` for both r15 claims and `gateSha256` equal too. Else 0 (missing → 0, malformed → 0 + exit 1).

## C2 contract — WebMCP loopback capability

- Harness `scripts/webmcp-loopback-round16.mjs` (owner: WebmcpHarness): loads Playwright 1.64.0 from the global npm root
  (`createRequire` search like `scripts/aria-loopback-round13.mjs:118-140`), launches `/usr/bin/chromium` headless with a fresh
  temp profile, serves `corpus/evidence/round-16/webmcp/fixtures/*.html` (owner: WebmcpFixtures) on `127.0.0.1:0`, aborts every
  non-loopback request, attaches a CDP session per page, `WebMCP.enable`, records `WebMCP.*` events and `Audits.issueAdded`.
  Cases (expected vs actual per case, `status` pass|fail): flag-off negative control; declarative form positive (exact name/description/schema);
  imperative `document.modelContext` registration (shape per probe); unregister/abort/removal → `toolsRemoved`; navigation clears;
  malformed declarative form (no toolname) → no tool (+ issue if observed); `navigator.modelContext` absent while `document.modelContext` present.
  Writes `corpus/evidence/round-16/webmcp/receipt.json` (schema `tabi-round16-webmcp-v1`: runtime {chromium version, executable sha256,
  playwright, node}, flags, producerSha256, protocolDomain (WebMCP domain JSON from the browser's own `/json/protocol` or `Schema`),
  cases[], summary {cases, passed, failed}). Refuses to overwrite differing bytes.
- Knowledge note `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (L1 integrates from scribe drafts): opens with
  `source: S0xx` lines (opened A/B rows), decision table (what can be asserted from which evidence), observed vs spec divergence,
  flag/version scope, limits (loopback only, no real site, no agent integration claim).
- SOURCES rows (L1 writes, only after a seat opened the source this round with URL, access date, ≤25-word located quote):
  S020 WebMCP spec re-open (queued→mined if it backs the note); S002 CDP viewer re-open for the WebMCP domain (used-by add);
  new rows for primary Chromium source/docs actually opened; rejections kept with reason + flip.

## Ownership (disjoint write sets; reports at `.ufo/waves/round-16/<wave>/<Name>.md`)

| Owner seat | Writes |
|---|---|
| BindCore | `scripts/check-measurement-binding.mjs` |
| BindSelftest | `scripts/selftest-measurement-binding.mjs` |
| MeasureCounters | `.ufo/waves/round-16/measure.mjs` |
| BindLegacyEvidence | `corpus/evidence/round-16/binding/r15-counter-identity.json` |
| WebmcpHarness | `scripts/webmcp-loopback-round16.mjs` |
| WebmcpFixtures | `corpus/evidence/round-16/webmcp/fixtures/` |
| WebmcpProtocol | `corpus/evidence/round-16/webmcp/protocol-domain.json` |
| WebmcpRuntimePin | `corpus/evidence/round-16/webmcp/runtime-pin.json` |
| Probe seats (WebmcpProbe*) | `.ufo/waves/round-16/probes/<SeatName>.mjs` + `.ufo/waves/round-16/probes/<SeatName>.json` |
| scribes | `.ufo/waves/round-16/drafts/<SeatName>.md` |
| L1 only | LOG.md, SCORECARD.md, SKILL.md, PROVINCE.md, corpus/README.md, corpus/QUALITY.md, corpus/SOURCES.md, corpus/knowledge/*, corpus/lessons/round-16.md, all receipts under corpus/evidence/round-16/ not listed above, commits |

Historical evidence, prior lessons and outside verifier files are immutable. No seat commits.
