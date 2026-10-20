# CaseImperativeModelContext — attack on receipt case `imperative-model-context`

- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Snapshot: HEAD `b444ca8e024f386124418169e8e400221524bba3` (C2 counter = 1), measured commit `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a`
- Producer: `scripts/webmcp-loopback-round16.mjs`, sha256 `961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1` (matches `receipt.producer.sha256`)
- Case: `corpus/evidence/round-16/webmcp/receipt.json` → `cases[id=imperative-model-context]`, fixture `corpus/evidence/round-16/webmcp/fixtures/imperative.html` sha256 `568824181b4afb23d1ff039635b00c241cbe757dddfba7c5ad75cfe5c7112aa8`
- Date: 2026-10-20. Author-side review, not non-author certification.

## Verdict

**BREAKS** on the claimed QUALITY-17 quality "expectation set from a named oracle before observation", with two demonstrable defects (oracle read post-observation and mutable; fixture path attribution hardcoded). The committed pass itself is **not** falsified: it is non-vacuous, reproducible, and its fixture bytes bind in the default run.

| Axis | Verdict | Basis |
|---|---|---|
| Expectation fixed before observation | **BREAKS** (mechanism) | Harness reads the declaration at `:908` after the `toolsAdded` event at `:907`; a fixture that rewrites `expectedTools` after registration resolves passes with a contradicting registration (probe `posthoc`, exit 0). |
| Named oracle | **BREAKS** (provenance) | Receipt names only the fixture's own field; `expected.oracleBasis` absent. PLAN C2:86 says "shape per probe"; the named pre-wave probe exists but observed different values and the receipt does not cite it. |
| Pass vacuous | **HOLDS** (not vacuous) | Three field/name mutants fail (`reg-desc`, `oracle-desc`, `reg-name`, exit 1); missing declaration fails closed (`nodecl`, exit 1). |
| Fixture binds | **HOLDS** for the default run; **BREAKS** under `--fixtures` | Default run: sha/bytes/stackTrace bind. `--fixtures /tmp/...` still records `corpus/evidence/round-16/webmcp/fixtures/imperative.html` while hashing and serving the /tmp bytes. |

## Attack item

Re-run the pinned producer and test whether the case's expectation is established before observation, whether its pass can be vacuous, and whether the recorded fixture is the bytes actually served. Mutation probes were run on copies under `/tmp/w2-imc-fteyUX/`; the lane was not modified except this report.

### Commands and observed outputs

Re-run (from the lane root):

```
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-imperative-model-context.json
...
WEBMCP_CASE id=imperative-model-context status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-imperative-model-context.json
EXIT=0
```

Comparison of the rerun case to the committed case (normalized only by per-run values):

```
DIFF case.actual.toolsAdded.0.frameId                  "A9C1C39E…" -> "D10438B8…"
DIFF case.actual.toolsAdded.0.stackTrace.callFrames.0.url "http://127.0.0.1:41439/imperative.html" -> "…:43245/imperative.html"
DIFF case.actual.toolsAdded.0.stackTrace.callFrames.1.url (same port-only change)
DIFF case.toolsAdded[0].frameId / stackTrace urls      (same)
DIFF case.eventLog.0.params.tools.0.frameId / urls     (same)
DIFF case.eventLog.0.atMs                              13 -> 11
DIFF case.durationMs                                   41 -> 30
```

No difference in `expected`, `actual.toolsAdded[0].{name,description,inputSchema}`, `actual.modelContext`, `actual.getTools`, `comparison`, or `detail`. The committed `expected` equals the fixture literal at `fixtures/imperative.html:17-25`, and the committed `actual.modelContext` is `{"documentModelContext":"object","registerTool":"function","getTools":"function","provideContext":"undefined"}`.

Mutation probes (each run in its own `/tmp` copy of the fixtures dir; same pinned producer):

```
$ for n in reg-desc oracle-desc reg-name posthoc nodecl; do
    node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-imc-fteyUX/$n --out /tmp/w2-imc-fteyUX/$n.json
    echo "$n exit=$?"
  done
reg-desc exit=1
oracle-desc exit=1
reg-name exit=1
posthoc exit=0
nodecl exit=1
```

## Findings

### F1 [medium] The oracle is read after observation and is mutable; a contradicting registration can pass

`caseImperative` navigates (`:906`), waits for the CDP event (`:907`), and only then reads the expectation (`:908` → `fixtureDeclaration` `:482-497`, which returns live `globalThis.__webmcpFixture.expectedTools`). There is no pre-observation snapshot, no static parse, and no fallback for this fixture (contrast the declarative case's static `parseDeclarativeTools` fallback at `:867-868`, used only when no declaration exists). Pass is computed from that read (`:916-923`).

Probe `posthoc` keeps the fixture's declared expectation at `"Echo the arguments back"` but registers `description: "WRONG-DESC-posthoc"`, then rewrites the declaration after the registration promise resolves:

```
  window.__webmcpFixture = { … expectedTools: [{ name:'echo', description:'Echo the arguments back', … }] … };
  mc.registerTool({ name:'echo', description:'WRONG-DESC-posthoc', … })
    .then(function (result) {
      window.__webmcpFixture.expectedTools[0].description = 'WRONG-DESC-posthoc';
      …
    });
```

Observed receipt (`/tmp/w2-imc-fteyUX/posthoc.json`):

```
verdict: pass
status: pass
detail: 1 imperative tool(s) observed; document.modelContext=object
comparison: {"missing":[],"unexpected":[],"fieldMismatches":[]}
expected.tools[0].description: "WRONG-DESC-posthoc"
actual.toolsAdded[0].description: "WRONG-DESC-posthoc"
```

The expectation was not fixed before observation: the harness compared the observation against page state written after registration. Any fixture (or a future edit to this fixture) can therefore mask a registration mismatch. The committed fixture does not do this — its only mutation of `expectedTools` is the fail-closed `= []` in the API-absent branch (`:31-35`) — but the property is a fixture-author promise, not a harness guarantee. Suggested fix: derive the expected set from a separate machine-readable fixture manifest (or a static parse) and assert the read-back declaration equals it; at minimum capture and hash `__webmcpFixture` before the registration event.

### F2 [low] The recorded fixture path is hardcoded and can name bytes that were not served

`pushCase` always writes `fixture: corpus/evidence/round-16/webmcp/fixtures/<file>` (`:1345-1347`), while `fixtureSha256` and bytes come from `args.fixtures` (`:1321-1322`) and the server serves `args.fixtures` (`:277`, `:1331`). Under `--fixtures`, the two disagree. From the `posthoc` run:

```
case.fixture       = "corpus/evidence/round-16/webmcp/fixtures/imperative.html"
case.fixtureSha256 = "fb9697d171059bc51436863bd4e957ab76dd213b22751787d7544ce2c8b7b125"  (1720 bytes, /tmp mutant)
lane file digest   = "568824181b4afb23d1ff039635b00c241cbe757dddfba7c5ad75cfe5c7112aa8"  (1490 bytes)
server.served      = [{"path":"imperative.html","bytes":1720}]
```

In the committed default run the path and digest agree with the lane file, so the HEAD receipt is correctly attributed. The defect is that a supported CLI mode (`--fixtures`, advertised in `--help`) can emit a receipt whose `fixture` field lies about provenance. `server.served` records paths and byte counts only, not digests; the only digest is the pre-serve inventory read at `:1321-1322`, while the server streams the file at request time (`:333-334`) — a small TOCTOU window between inventory and serve.

### F3 [low] No named oracle is cited for this case

The case records `expectedProvenance: "fixture __webmcpFixture.expectedTools (registerTool imperative)"` and no `expected.oracleBasis` (only `declarative-form-tool` has one, `:880`). PLAN C2:86 describes the case as "shape per probe". The named pre-wave probe exists: `.ufo/waves/round-16/probes/WebmcpProbeImperative.json`, `generatedAt 2026-10-20T14:37:22.648Z` (before the receipt's `14:48:16.345Z`), and it records `registerTool_valid` → `WebMCP.toolsAdded` with `probe_echo` / `"Echo the supplied text"` / schema `{text}` — a different name, description and property from the fixture's `echo` / `"Echo the arguments back"` / `{q}`. So the probe corroborates the *shape* (`name`, `description`, `inputSchema`, `frameId`, `stackTrace`, no `backendNodeId`) but cannot be the source of the fixture's exact values; the fixture mtime (`2026-10-20T14:31:05Z`) also precedes the probe. The expectation is an author-declared fixture oracle, not a spec/WPT/source-named oracle, and the receipt does not even cite the probe artifact.

### F4 [info] No retained red control for this case

`receipt-first-run-failed.json` (producer `cedccdf9…`, `generatedAt 2026-10-20T14:46:36.879Z`) also records `imperative-model-context: pass`. The case has never been red in retained evidence; its failure capability is shown only by the external mutants above. The note's corrections section lists three repaired cases; this is not one of them.

### F5 [info] The note's `frameId`/`stackTrace`/no-`backendNodeId` claim is not gated by the pass

The pass compares only `name`, `description` and `inputSchema` (`compareTools` `:569-594`). The note row (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:55`) additionally claims `frameId` and `stackTrace` are present and `backendNodeId` absent. On this build the recorded actual supports that (frameId `D10438B8…`, stackTrace `imperative.html:35/49`, no `backendNodeId`), but a build that dropped `frameId` or added `backendNodeId` would still pass this case. The note's claim is therefore supported by the recorded actual, not by the case's assertion.

## What holds

- **Non-vacuous comparison.** Changing the registration description only (`reg-desc`): `exit=1`, `detail: missing=1 fieldMismatches=1 unexpected=0`, `expectedDescription "Echo the arguments back"` vs `actualDescription "WRONG-DESC-registration"`. Changing the declaration only (`oracle-desc`): `exit=1`, mirrored mismatch. Changed name (`reg-name`): `exit=1`, `missing=1 unexpected=1` (`echo2`). Removing the declaration while registration succeeds (`nodecl`): `exit=1`, `detail: fixture declared no expectedTools (cannot compare)`. `expected.length > 0` (`:920`) prevents a pass from an empty oracle.
- **Default-run fixture binding.** `case.fixtureSha256 5688…` equals `sha256sum` of the lane fixture; the file is 1490 bytes and the receipt's `server.served` entry for `imperative.html` is 1490 bytes; `toolsAdded[0].stackTrace.callFrames` point at `http://127.0.0.1:43245/imperative.html` lines 35/49 (0-based), i.e. fixture lines 36 and 50 around the `registerTool` call. Page traffic is confined to exactly `http://127.0.0.1:<port>` by `guardLoopback` (`:379-419`); the receipt's `loopback.externalRequestCount` is 0.
- **Reproducibility.** The rerun reproduces the committed case modulo ephemeral port, `frameId`, `atMs`, `durationMs`; expected/actual/comparison/detail are identical, and the producer digest is unchanged.

## Residual risk and verification gaps

- F1 means this case's pass rests on the honesty of the pinned fixture bytes, not on a harness-enforced pre-observation oracle. Because `fixtureSha256` is recorded, the committed instance can be audited; the harness itself cannot detect a post-hoc rewrite.
- F2 means a future re-derivation with `--fixtures` would misattribute bytes; the receipt's `server.served` has no digests. The default-run receipt is unaffected.
- Small inventory→serve TOCTOU at `:1321` vs `:333`.
- No `imperative.html` flag-off control exists in the receipt; the negative control uses `declarative-form.html`.
- Not run: `--force` against the committed receipt (read-only discipline; rerun used `--out` under /tmp); `WebMCP.invokeTool`/`executeTool` (harness never invokes tools by design); the pre-wave probe was read, not re-executed; C1/C2 counters (outside this item's scope). No resume path or runtime rerouting exists in this surface, so `resume_continuity_v1` is not applicable.

## Lane state / tooling

- `git status --short` at finish: `?? .ufo/waves/round-16/w2/` (this report's target) and `?? corpus/evidence/round-16/measurement-binding.json` (not written by this seat). This seat wrote only this report; all probe artifacts and receipts are under `/tmp/w2-imc-fteyUX/` and `/tmp/w2-imperative-model-context.json`.
- No tool installs or upgrades. Used the repo's existing Node 24.21.0, Playwright 1.64.0 and `/usr/bin/chromium` (Chrome/154.0.8037.97) through the pinned harness.
