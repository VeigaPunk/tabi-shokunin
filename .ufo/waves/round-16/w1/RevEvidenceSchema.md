# RevEvidenceSchema — `tabi-round16-webmcp-v1` vs QUALITY 17/18

Seat `TabiR16.RevEvidenceSchema-5`, wave 1, 2026-10-20. Read-only review; no gate,
self-test, counter or browser executed. Baseline `e38d259`.

Scope: the receipt schema declared at `.ufo/waves/round-16/PLAN.md:88-90` and the case list at
`:85-87`, judged against `corpus/QUALITY.md:48-53` (Q17) and `:54-59` (Q18). Deliverable:
required fields for `TabiR16.WebmcpHarness-5`.

**Result: the schema as written does not meet Q17 or Q18.** It names seven top-level facts
(`runtime`, `flags`, `producerSha256`, `protocolDomain`, `cases[]`, `summary`, overwrite
refusal) and omits the case-input manifest, the cause model, run/worker aggregation, cleanup
proofs, the observed/pinned split, and any verdict vocabulary. All are low-cost to add because
round 13's ARIA receipt already carries the same propositions with checkable names
(`corpus/evidence/round-13/aria/receipt.json`; producer `scripts/aria-loopback-round13.mjs`).
Recommended shape: reuse those names wherever the proposition is identical, add the WebMCP
specifics below, keep everything inside `receipt.json` (no new owned paths, no ownership-table
change).

## 1. Findings

### High

**H1 — `runtime` conflates observed and pinned values and its `executable sha256` is ambiguous (Q18).**
PLAN:88 asks for `runtime {chromium version, executable sha256, playwright, node}`; nothing
distinguishes an observed value from a descriptive recorded one. Q18 requires exactly that split.
The ambiguity is concrete on this host: `runtime-pin.json` records
`sha256sum /usr/lib/chromium/chromium` → `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`,
while the probe seats hash the launch path: `/usr/bin/chromium` is a 14,424-byte ELF exec stub
(`file`: "ELF 64-bit LSB pie executable … stripped"; `strings` shows `execv` and
`/usr/lib/chromium/chromium`) with sha256
`eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`
(`.ufo/waves/round-16/probes/WebmcpProbeFlags.json` `runtime.chromiumSha256`). A receipt that
records one "executable sha256" will either fail the pin or relabel a mismatch as matched.
`WebmcpRuntimePin.md:20` ("receipt.json `runtime` block can copy verbatim") is the exact route
to the Q18 defect and must not be followed.
Also: observed version must come from the browser (`CDP Browser.getVersion` → product
`Chrome/154.0.8037.97`), not from `--version` stdout, and never from the UA — `WebmcpProtocol.md`
records `/json/version` UA `HeadlessChrome/154.0.0.0`, a different string.

**H2 — no cleanup section, so Q18's "complete nonempty set of worker proofs" has nothing to agree with.**
PLAN:82 says "fresh temp profile"; the receipt schema has no cleanup field at all. Round 13's
inverted-summary defect came from exactly this omission (`corpus/lessons/round-14.md:39`; Q18
line 55: "a negative property such as listeningAfter is not the proposition that every worker
stopped"). A capability admission that rests on "we saw no browser process" is a negative
property, not a stop proof. Required per-run and per-case positive propositions (browser pid
gone, contexts/pages closed, profile and temp root removed, server closed), aggregated with
`every` over the complete set — the pattern used at
`scripts/aria-loopback-round13.mjs:449-455` and emitted at `:560-625`.

**H3 — `summary {cases, passed, failed}` cannot detect a missing, duplicated or zero-case run (Q17).**
Q17's last clause ("aggregate every executed case after worker restart before admitting a
capability") means the admission set is the union of persisted per-run records, reconciled
against the manifest. With three numbers, `cases=0, passed=0, failed=0` is "clean", and a run
that dies after case 3 looks identical to a complete run. ARIA's summary carries
`expected, expectedIds, ran, passed, failed, missing` and `caseSetOk` requires exactly one record
per expected id and zero duplicates (`scripts/aria-loopback-round13.mjs:464-468`; receipt
`summary.cases`). PLAN also lacks the `missing` case status that makes truncation visible
(`:230-240`).

**H4 — no cause model; two case expectations are unfalsifiable as written (Q17).**
PLAN:87 says malformed form → "no tool (+ issue if observed)"; PLAN:86 says
"unregister/abort/removal → `toolsRemoved`". Q17 rejects both the parenthetical and the
attribution: the negative control must check the pinned producer's *actual* rejection cause,
not any exception or any absence.
- The actual declared-form cause is observable: `Audits.issueAdded` with `code:"GenericIssue"`
  and `details.genericIssueDetails.errorType:"FormModelContextMissingToolName"`
  (`.ufo/waves/round-16/probes/WebmcpProbeIssues.json`, case `missing-toolname`; it arrives
  **twice**). Matching only `code` is vacuous — every issue in that probe is `GenericIssue`
  (`summary.uniqueIssueCodes:["GenericIssue"]`). The selector path must be recorded.
- Issues do not imply rejection: probe case `input-without-name` emits 6 issues *and* registers
  a tool (`getToolsCount:1`). Registration outcome and diagnostics must be separate assertions.
- `WebMCP.toolsRemoved` carries only `{name, frameId}` (`protocol-domain.json`
  `types.RemovedTool`), so an event cannot attribute removal to abort vs form removal vs
  navigation. Attribution needs the recorded action and ordering, or split cases.

**H5 — no complete case-input manifest and no input digests (Q17).**
PLAN:89 records only `producerSha256`. Q17's first clause requires the manifest that closed
round 13's missing-template defect (`corpus/lessons/round-13.md:49`): every case's fixture,
action, parameters, expected value and its provenance, digest-bound. The fixtures already carry
a machine-readable block (`window.__webmcpFixture` with `expectedTools`, `actions`,
`actionOrder`, `expectedRemoved` in `corpus/evidence/round-16/webmcp/fixtures/declarative-form.html`
and `lifecycle.html`), so the harness can and should record that block's digest per case rather
than hand-typing expectations. Without digests for fixtures, actions, protocol domain and
expectation provenance, `producerSha256` binds only the script text: a fixture swap or an
expectation edit is invisible.

**H6 — `WebMCP.enable` success and unarmed collectors are vacuous evidence (Q17).**
`WebMCP.enable` returns `{ok:true,result:{}}` in **all** probe cases, including `none` and
`features-DevToolsWebMCPSupport`, which observe no surface and no events
(`WebmcpProbeFlags.json`, 11 cases; `summary.minimalForDocumentModelContext:"blink-WebMCP"`).
PLAN:84's "`WebMCP.enable`" step is therefore not a capability signal, and the PLAN's own
pre-probe note ("no flags: `WebMCP.enable` returns `{}`") must not be used as an observation.
Likewise `Audits.issueAdded` only exists after `Audits.enable` (the issue probe issues both
commands and records their `ok` results); without an armed-collector field, "no issue observed"
is indistinguishable from "collector never armed".

### Medium

**M1 — no server/loopback proof.** PLAN:83 claims "aborts every non-loopback request" but the
receipt cannot show it. ARIA retained `server.requests[]`, `externalAborts`, `externalRequestsBlocked`
and an explicit `claimScope` ("page-level exact-origin confinement only; no claim of global host
no-egress"). Also record `isSecureContext` and the exact origin: `WebmcpProbeSecure.json`
`summary.contexts` shows `http_alias_tabi_test` is `isSecureContext:false` with
`modelContextType:"undefined"`, while `http_loopback_ip`/`http_localhost` are secure and positive.
PLAN's "`http://127.0.0.1:<port>`" must be an asserted field, not an implicit assumption.

**M2 — no verdict, exit-code or refusal contract.** PLAN:90 ends at "Refuses to overwrite
differing bytes" with no candidate/existing digests, no action vocabulary, no exit code. Q17
needs a verdict distinction so a failure is retained rather than crashing: `pass`/`fail`/
`could_not_evaluate`, `findings[]` with stable ids (ARIA uses
`R13-ARIA-RUNTIME-PIN-01`, `…-CASE-SET-01`, `…-CLEANUP-01` and computes `verdict` at
`scripts/aria-loopback-round13.mjs:494`), and a receipt even on setup failure (ARIA's initial
receipt is `could_not_evaluate` with every expected case missing).

**M3 — `protocolDomain` source ambiguity.** PLAN:89 says "from the browser's own `/json/protocol`
or `Schema`" — two different sources with different bytes. Require the observed endpoint per run
plus the committed pin (`corpus/evidence/round-16/webmcp/protocol-domain.json`, sha256
`f7cb1e8c13e2ff543abe33cf4b16b87946b1db21c6f2c58c2d970c1a57848e55`) and a match boolean. Also
record flag invariance (`WebmcpProtocol.md:58`: the domain bytes are identical with and without
flags), and validate every case's expected signal name against the domain's command/event sets.

**M4 — no observation sequencing or arming order.** `WebMCP.enable` "will trigger a `toolsAdded`
event for all currently registered tools" (`protocol-domain.json`, command `enable` description),
so a late enable replays and a late *disable* loses events; absence claims depend on ordering.
Record a monotonic `seq` on every CDP call/event/issue, the enable seq before navigation, and a
bounded `waitMs` with the last-observation seq per absence assertion. Without these, `toolsAdded:0`
and `toolsRemoved` ordering are uninterpretable.

**M5 — expectations without provenance, including prose from a non-authoritative README.**
`fixtures/README.md` states shapes (e.g. "`registerTool(options) -> Promise`"); probe evidence
records the awaited result (`returned:true`, `value:undefined`), which is consistent with a
promise but does not establish the promise shape. Expected literals must be derived from the
fixture's `__webmcpFixture` block and/or a pinned prior observation/spec row, with
`provenance{path,sha256,locator}`; a README sentence is not an authority and must not be the
source of an expected value.

### Low

**L1** `summary.cases` as a scalar shadows the `cases[]` array; use
`summary.cases.expected|ran|passed|failed|missing|duplicates|caseSetOk`.
**L2** `producerSha256` alone lacks path/bytes/`hashedAt`; emit `producer{path,sha256,bytes}`.
**L3** event payloads can carry `stackTrace` (imperative probe `toolsAdded`); specify a cap and a
`capped` flag, and refuse `pass` for a capped case.
**L4** record repository-root output confinement (`rootOutputsIntroduced`), as ARIA does.

## 2. Required receipt fields (normative for `scripts/webmcp-loopback-round16.mjs`)

```json
{
  "schema": "tabi-round16-webmcp-v1",
  "wave": "round-16",
  "claim": "C2",
  "generatedAt": "2026-10-20T…Z",
  "verdict": "pass|fail|could_not_evaluate",
  "exitCode": 0,
  "command": { "argv": ["node", "scripts/webmcp-loopback-round16.mjs"], "cwd": "<repo>",
               "envKeys": ["PATH", "HOME", "TMPDIR", "TZ"] },
  "loopbackOnly": true,
  "externalSite": false,

  "producer": { "path": "scripts/webmcp-loopback-round16.mjs", "sha256": "<64-hex>",
                "bytes": 0, "hashedAt": "2026-10-20T…Z" },

  "manifest": {
    "sha256": "<canonical digest of this block>",
    "fixtures": [
      { "id": "declarative-form", "path": "corpus/evidence/round-16/webmcp/fixtures/declarative-form.html",
        "sha256": "<64-hex>", "bytes": 0,
        "embeddedManifest": { "locator": "window.__webmcpFixture",
                              "sha256": "<digest of JSON.stringify of that object>",
                              "expectedTools": 1, "actions": [], "actionOrder": [] } }
    ],
    "cases": [
      { "id": "declarative-positive",
        "kind": "positive|negative",
        "run": "run-on|run-off",
        "fixture": "declarative-form",
        "actions": [{ "name": null, "source": null }],
        "params": { "origin": "http://127.0.0.1:<port>", "waitMs": 0 },
        "expected": {
          "outcome": { "registration": "registered|absent|rejected",
                       "tools": [{ "name": "search", "description": "Search",
                                   "inputSchema": { "type": "object", "properties": {},
                                                    "required": [] } }],
                       "removed": [] },
          "signal": { "domain": "WebMCP", "member": "toolsAdded",
                      "memberOfPinnedDomain": true },
          "cause": { "kind": "rejection|absence|removal|surface",
                     "channel": "audits|console|cdp-error|none",
                     "selectorPath": "details.genericIssueDetails.errorType",
                     "code": "GenericIssue",
                     "value": "FormModelContextMissingToolName",
                     "minOccurrences": 1,
                     "forbidToolRegistered": true },
          "provenance": { "kind": "fixture-manifest|prior-observation|spec-row",
                          "path": "<repo-relative or wave path>", "sha256": "<64-hex>",
                          "locator": "window.__webmcpFixture.expectedTools[0]" }
        },
        "controls": { "positive": "declarative-positive", "negative": "flag-off-negative" } }
    ]
  },

  "runtime": {
    "components": {
      "chromium": {
        "launchPath": "/usr/bin/chromium",
        "launchSha256": "eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b",
        "launchBytes": 14424,
        "resolved": { "path": "/usr/lib/chromium/chromium",
                      "sha256": "95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a",
                      "bytes": 0, "resolution": "proc-exe|pin-path" },
        "observed": { "product": "Chrome/154.0.8037.97", "version": "154.0.8037.97",
                      "source": "CDP Browser.getVersion",
                      "versionDerivation": "product-after-slash",
                      "userAgent": "HeadlessChrome/154.0.0.0" },
        "pinned": { "path": "corpus/evidence/round-16/webmcp/runtime-pin.json",
                    "sha256": "fd1d34e8f49714d01c6dd6b032d00f3c6458ac5f53caff5559d9a14d8db3b9b8",
                    "recorded": { "version": "154.0.8037.97",
                                  "executablePath": "/usr/lib/chromium/chromium",
                                  "executableSha256": "95b17db7…" },
                    "kind": "descriptive-recorded",
                    "recordedVersionSource": "argv ['/usr/bin/chromium','--version'] stdout" },
        "match": { "digestScope": "resolvedExecutable",
                   "resolvedExecutableSha256": true, "version": true, "allRequired": true }
      },
      "playwright": {
        "observed": { "version": "1.64.0", "resolvedPath": "<abs>",
                      "packageJsonPath": "<abs>", "packageJsonSha256": "<64-hex>" },
        "pinned": { "version": "1.64.0", "packageJson": "<abs>", "kind": "descriptive-recorded" },
        "match": { "version": true, "allRequired": true }
      },
      "playwrightCore": { "observed": { "version": "1.64.0", "resolvedPath": "<abs>",
                                        "packageJsonSha256": "<64-hex>" },
                          "pinned": { "version": "1.64.0" }, "match": { "version": true } },
      "node": {
        "observed": { "version": "v24.21.0", "source": "process.version" },
        "pinned": { "recorded": "v24.21.0", "minimumMajor": 20, "kind": "descriptive-recorded" },
        "policy": { "kind": "minimum", "minimumMajor": 20, "satisfied": true },
        "match": { "observedEqualsRecorded": true, "minimumSatisfied": true }
      }
    },
    "acrossRuns": { "versions": ["154.0.8037.97"],
                    "resolvedSha256s": ["95b17db7…"], "consistent": true }
  },

  "protocolDomain": {
    "observed": { "run": "run-on", "endpoint": "http://127.0.0.1:<port>/json/protocol",
                  "httpStatus": 200, "sha256": "<64-hex>", "bytes": 0, "domains": 58,
                  "webmcpDomain": { "domain": "WebMCP", "sha256": "<64-hex>",
                                    "commands": ["enable","disable","invokeTool","cancelInvocation"],
                                    "events": ["toolsAdded","toolsRemoved","toolInvoked","toolResponded"],
                                    "types": ["Annotation","InvocationStatus","Tool","RemovedTool"] } },
    "pinned": { "path": "corpus/evidence/round-16/webmcp/protocol-domain.json",
                "sha256": "f7cb1e8c13e2ff543abe33cf4b16b87946b1db21c6f2c58c2d970c1a57848e55",
                "webmcpDomainSha256": "<64-hex>" },
    "match": { "domainDigest": true, "commandSet": true, "eventSet": true },
    "flagInvariance": { "comparedRuns": ["run-on","run-off"], "identical": true,
                        "sha256PerRun": ["<64-hex>","<64-hex>"] }
  },

  "flags": {
    "on":  { "run": "run-on",
             "argv": ["--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp",
                      "--enable-blink-features=WebMCP,WebMCPTesting"],
             "enabledFeatures": ["WebMCP","WebMCPTesting","DevToolsWebMCPSupport","DeclarativeWebmcp"],
             "enabledBlinkFeatures": ["WebMCP","WebMCPTesting"],
             "behaviorConfirmedBy": "declarative-positive" },
    "off": { "run": "run-off", "argv": [], "behaviorConfirmedBy": "flag-off-negative" },
    "pairing": { "sameProducer": true, "sameFixtureSha256": true,
                 "sameResolvedChromiumSha256": true, "differing": ["argv"] }
  },

  "runs": [
    { "id": "run-on", "profile": "webmcp-on", "launchArgv": ["<argv array>"],
      "browserPid": 0, "browserClosed": true,
      "chromium": { "launchSha256": "<64-hex>", "resolvedSha256": "<64-hex>",
                    "observedVersion": "154.0.8037.97" },
      "collectors": [
        { "domain": "WebMCP", "method": "enable", "seq": 1, "ok": true, "result": {},
          "evidenceRole": "domain-presence-only" },
        { "domain": "Audits", "method": "enable", "seq": 2, "ok": true, "result": {} }
      ],
      "navigationSeq": 3,
      "protocolDomainSha256": "<64-hex>",
      "server": { "port": 0, "origin": "http://127.0.0.1:<port>" },
      "cases": ["declarative-positive", "…"],
      "cleanup": { "tempRoot": "/tmp/…", "profileDir": "/tmp/…/profile",
                   "profileRemoved": true, "tempRootRemoved": true,
                   "contextsClosed": true, "browserClosed": true,
                   "browserPidAliveAfter": false, "processesAfter": [],
                   "serverClosed": true, "serverListeningAfter": false, "ok": true },
      "error": null }
  ],

  "cases": [
    { "id": "malformed-declarative", "kind": "negative", "run": "run-on",
      "status": "pass|fail|missing|inconclusive",
      "input": { "fixture": "declarative-missing-name", "fixtureSha256": "<64-hex>",
                 "url": "http://127.0.0.1:<port>/declarative-missing-name.html",
                 "origin": "http://127.0.0.1:<port>", "isSecureContext": true,
                 "actions": [], "params": { "waitMs": 1500 },
                 "collectorArmedBeforeNavigation": true },
      "expected": { "outcome": { "registration": "absent", "tools": [] },
                    "signal": { "domain": "WebMCP", "member": "toolsAdded" },
                    "cause": { "kind": "rejection", "channel": "audits",
                               "selectorPath": "details.genericIssueDetails.errorType",
                               "code": "GenericIssue",
                               "value": "FormModelContextMissingToolName",
                               "minOccurrences": 1, "forbidToolRegistered": true },
                    "provenance": { "kind": "prior-observation",
                                    "path": ".ufo/waves/round-16/probes/WebmcpProbeIssues.json",
                                    "sha256": "<64-hex>", "locator": "cases[0].issues" } },
      "actual": {
        "surface": { "documentModelContextTypeof": "object",
                     "navigatorModelContext": false,
                     "documentHasOwn": false,
                     "getTools": [],
                     "isSecureContext": true },
        "registration": { "kind": "none", "awaited": false,
                          "threw": null, "value": null },
        "toolsAdded": [], "toolsRemoved": [],
        "events": [{ "seq": 4, "at": "…Z", "method": "WebMCP.toolsAdded", "params": {},
                     "payloadSha256": "<64-hex>", "bytes": 0, "capped": false }],
        "issues": [{ "seq": 5, "at": "…Z", "code": "GenericIssue",
                     "selectorPath": "details.genericIssueDetails.errorType",
                     "value": "FormModelContextMissingToolName",
                     "payloadSha256": "<64-hex>", "bytes": 0, "occurrence": 1 },
                   { "seq": 6, "at": "…Z", "code": "GenericIssue",
                     "selectorPath": "details.genericIssueDetails.errorType",
                     "value": "FormModelContextMissingToolName",
                     "payloadSha256": "<64-hex>", "bytes": 0, "occurrence": 2 }],
        "console": [{ "seq": 3, "type": "log", "text": "fixture-loaded …",
                      "textSha256": "<64-hex>", "url": "http://127.0.0.1:<port>/…" }],
        "cdp": [{ "seq": 1, "method": "WebMCP.enable", "ok": true, "result": {},
                  "error": null }],
        "externalAborts": [],
        "lastObservationSeq": 6
      },
      "cause": { "matches": true, "observed": [
                   { "channel": "audits", "identity": "GenericIssue/FormModelContextMissingToolName",
                     "occurrences": 2, "payloadSha256s": ["<64-hex>","<64-hex>"] } ],
                 "mismatch": null },
      "checks": [
        { "id": "registration-absent", "expected": "absent", "actual": "absent", "pass": true },
        { "id": "tools-added-empty", "expected": 0, "actual": 0, "pass": true },
        { "id": "cause-identity", "expected": "GenericIssue/FormModelContextMissingToolName",
          "actual": "GenericIssue/FormModelContextMissingToolName", "pass": true }
      ],
      "controls": { "positive": "declarative-positive", "negative": null },
      "durationMs": 0,
      "error": null }
  ],

  "server": {
    "host": "127.0.0.1", "port": 0, "origin": "http://127.0.0.1:<port>",
    "isSecureContext": true,
    "fixtureRoutes": ["/declarative-form.html", "…"],
    "requests": [{ "method": "GET", "url": "http://127.0.0.1:<port>/…", "status": 200, "bytes": 0 }],
    "externalAborts": [{ "url": "…", "error": "…" }],
    "externalRequestsBlocked": 0,
    "claimScope": "page-level exact-origin confinement only; no claim of global host no-egress",
    "closed": true, "listeningAfterAny": false
  },

  "findings": [{ "id": "R16-WEBMCP-RUNTIME-01", "status": "pass|fail", "detail": {} }],

  "cleanup": {
    "runs": [{ "run": "run-on", "profileRemoved": true, "tempRootRemoved": true,
               "contextsClosed": true, "browserClosed": true,
               "browserPidAliveAfter": false, "processesAfter": [],
               "serverClosed": true, "serverListeningAfter": false, "ok": true }],
    "cases": [{ "case": "declarative-positive", "run": "run-on",
                "pageClosed": true, "contextClosed": true, "ok": true }],
    "aggregate": { "runCount": 2, "allRunsOk": true, "allCasesOk": true,
                   "serverListeningAfterAny": false,
                   "stopProposition": "every run's browser process, contexts, profile, temp root and server stopped and were removed",
                   "ok": true },
    "rootOutputsIntroduced": { "testResults": false, "playwrightReport": false }
  },

  "summary": {
    "cases": { "expected": 7, "expectedIds": ["…"], "ran": 7, "passed": 7, "failed": 0,
               "missing": [], "duplicates": [], "caseSetOk": true },
    "controls": { "negatives": ["flag-off-negative","malformed-declarative","navigator-absent"],
                  "positives": ["declarative-positive","imperative-registration"],
                  "orphans": [], "ok": true },
    "runs": 2, "browserRestarts": 1,
    "loopbackOnly": true, "externalSite": false,
    "collectorsArmed": true,
    "setupError": null,
    "durationMs": 0
  },

  "write": { "path": "corpus/evidence/round-16/webmcp/receipt.json",
             "action": "written|identical|refused",
             "existingSha256": null, "candidateSha256": "<64-hex>",
             "refusedReason": null, "bytes": 0 }
}
```

Pseudo-run above annotates one case; every case in `manifest.cases` must appear exactly once in
`cases[]`, including cases that never executed (`status:"missing"`).

## 3. Admission invariants (implement as `--verify`-style checks; L1 can re-derive)

| # | Invariant |
|---|---|
| I1 | `summary.cases.expectedIds` is a duplicate-free set equal to `manifest.cases[].id`; `cases[]` has exactly one record per id; `summary.cases.duplicates === []`. |
| I2 | `summary.cases.ran === expected - missing.length`; `passed + failed === ran`; `missing` lists every expected id with no executed record. |
| I3 | `verdict === "pass"` implies `failed===0 && missing===[] && duplicates===[] && controls.orphans===[] && cleanup.aggregate.ok && runtime.components.*.match.allRequired && summary.collectorsArmed && cases.every(c=>c.status==="pass")`. |
| I4 | Every `case.expected.signal.member` exists in `protocolDomain.observed.webmcpDomain.events` or `.commands`, and `memberOfPinnedDomain===true`. |
| I5 | Every negative case has `kind:"negative"`, appears in `summary.controls.negatives`, and resolves a positive control with the same fixture digest(s) and the same resolved Chromium sha256. |
| I6 | For `cause.kind==="removal"`, each `actual.toolsRemoved[]` entry has `trigger`, `actionSeq < eventSeq`, `frameId`, `basis`, and `ambiguousTriggers===[]` (see H4; prefer one trigger per case). |
| I7 | `runtime.components.chromium.match.digestScope==="resolvedExecutable"` and `resolved.sha256 === pinned.recorded.executableSha256`; `launchSha256` is recorded separately and never substituted. |
| I8 | `cleanup.runs.length === runs.length > 0 && cleanup.runs.every(r=>r.ok)`; every run lists positive stop propositions; `aggregate.ok` is exactly `allRunsOk && allCasesOk && serverClosed`; `serverListeningAfterAny` is `any`, never the stop proof. |
| I9 | Every `server.requests[].url` and `cases[].actual.externalAborts[].url` is accounted for; `externalRequestsBlocked === total aborts`; no non-loopback request succeeded. |
| I10 | `producer.sha256` equals the sha256 of the script file read at generation time; `manifest.sha256` is the canonical digest of the manifest block; every `manifest.fixtures[].sha256` and `cases[].input.fixtureSha256` match the bytes read. |
| I11 | `expected.provenance` is present for every case and its `sha256` matches the cited file (or the manifest literal when `kind:"fixture-manifest"`); no expected value is sourced only from README prose. |
| I12 | `write.action==="refused"` implies `existingSha256 !== candidateSha256`, exit 3, and the existing file's digest is unchanged; `action==="identical"` exits 0 with no byte change. |
| I13 | `verdict==="could_not_evaluate"` iff setup failure; the receipt is still written, `setupError !== null`, and every expected case is `missing`. Exit codes: 0 pass, 1 fail, 2 could_not_evaluate, 3 refused. |
| I14 | Stdout trailer `WEBMCP_RECEIPT verdict=<v> cases=<n> passed=<m> sha256=<file digest>` matches the written bytes — an external binding, so the `write` block need not be self-referential. |

## 4. Clause → field map

| QUALITY clause | Fields that satisfy it |
|---|---|
| Q17 "complete case-input manifest" | `manifest.fixtures[]` (`path,sha256,bytes,embeddedManifest`), `manifest.cases[].input/expected/provenance`, `cases[].input`, invariant I10/I11 |
| Q17 "actual rejection cause, not any exception or source-reasoned spelling" | `expected.cause{channel,selectorPath,code,value,minOccurrences}`, `actual.issues[]/console[]/cdp[]` with `payloadSha256`, `case.cause{matches,observed,mismatch}`; H4/I6 |
| Q17 "retain real expected/actual structure" | `cases[].expected`, `cases[].actual`, `cases[].checks[]` (per-assertion expected/actual/pass) |
| Q17 "positive control" | `cases[].kind`, `cases[].controls`, `summary.controls{negatives,positives,orphans,ok}`, `flags.pairing`, I5 |
| Q17 "aggregate every executed case after worker restart" | `runs[]` with `cases[]` unions, `summary.cases{expectedIds,ran,missing,duplicates,caseSetOk}`, `status:"missing"`, `setupError`, I1/I2 |
| Q18 "cleanup summary agrees with complete nonempty set of worker proofs" | `cleanup.runs[]`, `cleanup.cases[]`, `cleanup.aggregate`, `runs[].cleanup`, invariants I8 |
| Q18 "negative property is not every worker stopped" | positive propositions `browserClosed/browserPidAliveAfter/contextsClosed/profileRemoved/tempRootRemoved/serverClosed`; `serverListeningAfter` recorded but not used as the stop proof |
| Q18 "observed, minimum-enforced and descriptive recorded versions" | `runtime.components.*.observed`, `.pinned.kind:"descriptive-recorded"`, `.policy{kind,minimumMajor,satisfied}`, `.match`, `acrossRuns`; H1/I7 |
| Q18 "historical corrections retain input digests, red→green witness, no-new-execution qualifier" | Not triggered by C2 (new execution). If the harness ever reissues a prior receipt, add `correction{inputDigests, redWitnessSha256, greenWitnessSha256, newExecution:false}`; do not claim correction here. |

## 5. Handoff — minimum must-dos for `TabiR16.WebmcpHarness-5`

1. **Two runs minimum** (`run-off`, `run-on`), identical producer/fixtures, differing only in
   `launchArgv`; record `flags.pairing` and `summary.browserRestarts`.
2. **Observe, never copy, runtime identity**: Chromium version from `CDP Browser.getVersion`
   product; resolved binary digest from `/proc/<browserPid>/exe` (the launch path
   `/usr/bin/chromium` is a 14,424-byte exec stub, sha256 `eaed39c3…`, while the pin records
   `/usr/lib/chromium/chromium`, sha256 `95b17db7…`). Read `runtime-pin.json` only as the pin.
3. **Embed the manifest** with fixture digests and the `window.__webmcpFixture` block digest;
   derive each expected from the fixture block or a pinned prior observation/spec row, with
   `provenance`, never from the current run and never from `fixtures/README.md` prose.
4. **Cause model**: for the malformed declarative case the expected cause is
   `Audits` `GenericIssue` / `details.genericIssueDetails.errorType:"FormModelContextMissingToolName"`
   (observed twice); match the selector path and count occurrences; keep
   `forbidToolRegistered:true` because issues do not imply rejection
   (`input-without-name` registers a tool with 6 issues). For the imperative rejection, capture
   the thrown `TypeError` name/message verbatim plus digest.
5. **Arm collectors before navigation** (`Audits.enable`, `WebMCP.enable`), record `seq` and
   `collectorArmedBeforeNavigation`; record `WebMCP.enable` with
   `evidenceRole:"domain-presence-only"` — it succeeds for `none` and non-enabling flags.
6. **Absence claims bounded**: `waitMs`, `lastObservationSeq`, and the surface probe
   (`documentModelContextTypeof`, `navigatorModelContext`, `getTools`) recorded as data.
7. **Removal attribution**: `toolsRemoved` carries only `{name,frameId}`; split `lifecycle`
   actions into one trigger per case, or record `actionSeq`/`eventSeq`/`basis` with
   `ambiguousTriggers:[]`. Do not state "abort caused removal" from the event alone.
8. **Cleanup proofs** per run and per case with positive stop propositions; aggregate with
   `every` over the complete nonempty set; `serverListeningAfter` uses `any` semantics and is
   not the stop proof.
9. **Verdict/exit contract** (`pass|fail|could_not_evaluate`, exits 0/1/2/3), `findings[]`,
   refusal-to-overwrite block with existing/candidate digests, atomic write, and the stdout
   digest trailer. On setup failure still write the `could_not_evaluate` receipt with all cases
   `missing`.
10. **Loopback proof**: `server.origin`, `isSecureContext` (assert `http://127.0.0.1:<port>`;
    `http_alias_tabi_test` was observed non-secure with no `document.modelContext`),
    `requests[]`, `externalAborts[]`, `claimScope`.

Cheapest implementation: one additional block builder in the existing harness, reusing round-13
receipt names (`summary.cases.*`, `cleanup.*`, `runtime.pinned`, `findings[]`) so L1's checks and
any later checker need no new vocabulary.

## 6. Residual risk and gaps

- **No executable check yet.** This schema has no `--verify` mode and C2's counter
  (`measure.mjs --claim C2`) is specified to count the held entry, not to validate receipt
  internals. Until L1 runs the harness and applies I1–I14 by hand or a checker, a receipt could
  satisfy the field list while contradicting itself (the round-14 aggregate defect shape).
- **Concurrent authoring.** Probe and fixture files were still being written during this review
  (`WebmcpProbeIssues.json` grew from 18,057 to 26,107 bytes between two reads; fixtures settled
  at 11:31–11:32 local). Content anchors above were observed at 2026-10-20T14:33Z; re-read after
  wave 1 lands before freezing expected literals.
- **Probe artifacts are wave-local** (`.ufo/waves/round-16/probes/`). If they are not committed,
  an expectation whose provenance cites them is bound only by `producer.sha256`; that is weaker
  than citing a committed row. Prefer committing the provenance or citing a spec row.
- **Not independently verified**: I did not execute the harness, browser or any gate (contract:
  reviewer seats run none); all browser facts above are read from sibling artifacts and my own
  read-only filesystem checks (`file`, `strings`, `sha256sum`, `readlink -f`, `--version`,
  JSON parsing). No source rows were opened, so no SOURCES claim is made.
- **Tooling**: no installs or updates were performed; no package manager ran.

## 7. Evidence log (commands and observed output)

- `nl -ba corpus/QUALITY.md | sed -n '44,62p'` → Q17 at 48-53, Q18 at 54-59 (exact text quoted
  in §1).
- `nl -ba .ufo/waves/round-16/PLAN.md | sed -n '76,96p'` → C2 harness at 81-87, receipt schema at
  88-90, note at 91-93.
- `readlink -f /usr/bin/chromium` → `/usr/bin/chromium`; `ls -l` → 14,424 bytes;
  `file` → "ELF 64-bit LSB pie executable … stripped"; `strings` → `execv`,
  `/usr/lib/chromium/chromium`.
- `sha256sum /usr/bin/chromium /usr/lib/chromium/chromium` →
  `eaed39c3… /usr/bin/chromium`, `95b17db7… /usr/lib/chromium/chromium`;
  `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux`.
- `node -e` parse of `corpus/evidence/round-16/webmcp/protocol-domain.json` → WebMCP domain:
  commands 4, events 4, `RemovedTool{name,frameId}`, `enable` description replays `toolsAdded`.
- parse of `.ufo/waves/round-16/probes/WebmcpProbeFlags.json` → 11 flag cases; `none` and
  `features-DevToolsWebMCPSupport` both `enable {ok:true,result:{}}` with zero events;
  `runtime.chromiumSha256` `eaed39c3…`.
- parse of `.ufo/waves/round-16/probes/WebmcpProbeIssues.json` → `missing-toolname`: 2 issues,
  `errorType FormModelContextMissingToolName`, `getToolsCount:0`; `input-without-name`: 6 issues,
  `getToolsCount:1`.
- parse of `.ufo/waves/round-16/probes/WebmcpProbeImperative.json` → `registerTool_missing_name`
  throws `TypeError` "Failed to execute 'registerTool' on 'ModelContext': Failed to read the
  'name' property from 'ModelContextTool': Required member is undefined."; `toolsRemoved:0`.
- parse of `.ufo/waves/round-16/probes/WebmcpProbeSecure.json` → `http_alias_tabi_test`
  `isSecureContext:false`, `modelContextType:"undefined"`; `http_loopback_ip` secure and positive.
- `node -e` shape dump of `corpus/evidence/round-13/aria/receipt.json` → `cases[].status`,
  `summary.cases{expected,expectedIds,ran,passed,failed,missing}`, `negative[].messageSha256`,
  `cleanup.caseCleanup[]`, `runtime.pinned{...}`.
- `sed -n '370,510p' scripts/aria-loopback-round13.mjs` and `:540,660` → runtime pin comparison
  at 375-403, `every`-based cleanup at 449-455, `caseSetOk` at 464-468, `verdict` at 494,
  receipt emission at 540-653.
- `git status --porcelain` → only untracked `.ufo/waves/round-16/` and
  `corpus/evidence/round-16/`; no seat commits.
