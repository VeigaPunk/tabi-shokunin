# CaseDataUrlDeclarative — attack on `data-url-declarative`

Seat: TabiR16.CaseDataUrlDeclarative (wave 2, falsification lane). Author-side report; not a
non-author certification. Lane read-only except this file; all mutation probes were run on
`/tmp` copies.

Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` (HEAD, `8f7feb3` + counter
repair). Runtime: Chromium `Chrome/154.0.8037.97` at `/usr/bin/chromium`
sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`, Playwright 1.64.0,
Node v24.21.0. No installs/upgrades were needed or performed.

Target artifacts:
- `corpus/evidence/round-16/webmcp/receipt.json:1843-1900` (case record; provenance at :1853)
- `scripts/webmcp-loopback-round16.mjs:1256-1292` (case code; pass predicate at :1271,
  expectation at :1275-1276)
- `corpus/evidence/round-16/webmcp/fixtures/declarative-form.html`
  (sha256 `7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e`)
- oracle: `.ufo/waves/round-16/probes/WebmcpProbeSecure.json` (committed at `8f7feb3`)

## Re-run (required by the ticket)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-data-url-declarative.json
…
WEBMCP_CASE id=flags-off-negative-control status=pass
…
WEBMCP_CASE id=data-url-declarative status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-data-url-declarative.json
exit=0
```

Field-by-field diff of committed vs re-run case (frameId/atMs/durationMs excluded from the
claim; every asserted field equal):

```
DIFF .actual.toolsAdded.0.frameId        committed D164478AF808BB91AE34B0BE723D67F3  rerun F0666BBCB054D6F14339C9FD5669C686
DIFF .eventLog.0.params.tools.0.frameId  (same value pair)
DIFF .eventLog.0.atMs                    committed 13  rerun 14
DIFF .durationMs                         committed 90  rerun 94
```

`status`, `expected`, `expectedProvenance`, `actual.documentModelContext`,
`actual.isSecureContext`, `actual.toolsAdded` payload, `fixture`, `fixtureFile`,
`fixtureSha256`, `flags` are byte-identical. Producer sha256 `961874e4…` equals the receipt's
`producerSha256` and the harness blob at both `8f7feb3` and `b444ca8`.

## Verdicts

| Attack | Verdict | Basis |
|---|---|---|
| Expectation set from a named oracle before observation | **HOLDS for the values; defect F1/F2 in the citation** | probe `producedAt` 14:30:00.446Z < first run 14:46:36.879Z < committed run 14:48:16.345Z; probe `data_url` row is exactly the expected pair |
| Pass vacuous | **HOLDS (not vacuous)** | form-removal mutation fails the case; flag-removal mutation fails the case |
| Fixture binds | **HOLDS at byte level; not at tool-identity level (F3)** | served bytes = `readFixture('declarative-form.html')`; recorded digest equals the served bytes and the committed blob |
| Reproducibility | **HOLDS** | re-run 11/11, case identical modulo ids/timing |

## Findings (severity ordered)

### F1 (Medium) — the named oracle path does not resolve; the oracle is not bound or counted

`receipt.json:1853`:

```
"expectedProvenance": "probe-observed divergence (probes/WebmcpProbeSecure.json): page API gated on secure context, CDP event not"
```

```
$ [ -f probes/WebmcpProbeSecure.json ] && echo EXISTS || echo ABSENT
ABSENT
$ [ -f .ufo/waves/round-16/probes/WebmcpProbeSecure.json ] && echo EXISTS
EXISTS
```

The actual committed oracle is `.ufo/waves/round-16/probes/WebmcpProbeSecure.json`
(`git ls-files` lists it, introduced by `8f7feb3`). The same receipt cites the full path for a
sibling case (`devtools-domain-disabled`: `.ufo/waves/round-16/probes/WebmcpProbeFlags.json`),
so this case's citation is the outlier. Consequences:

- The oracle is not in C2's `countedInputs` (`corpus/evidence/round-16/measurement-binding.json`
  C2 lists only README/SOURCES/receipt/fixtures/note/harness), and `countC2`
  (`.ufo/waves/round-16/measure.mjs:193-253`) does not read it or check any
  `expected`/`expectedProvenance` field (verified: no `provenance` token in that file).
- The receipt does not record the oracle's digest, so a changed probe cannot be detected from
  the receipt.

The *values* still hold (see next section); this is a citation/binding defect, not a fabricated
oracle.

### F2 (Medium) — the provenance's mechanism clause is contradicted by the cited oracle's own control

The probe (`.ufo/waves/round-16/probes/WebmcpProbeSecure.json`) reports:

| label | isSecureContext | modelContextType | toolsAddedCount |
|---|---|---|---|
| `http_alias_tabi_test` (insecure http) | false | undefined | **0** (lines 202-220) |
| `data_url` | false | undefined | 1 (lines 223-264) |
| `about_blank` (form injected via `setContent`) | false | undefined | 1 (lines 267-308) |

So "page API gated on secure context, **CDP event not**" is false as a general statement: the
oracle's own non-secure HTTP control produces zero events. The divergence is scheme-specific
(`data:`/`about:` opaque documents), not "secure context does not gate the CDP event". The
expected *values* are still exactly the oracle's `data_url` row
(`modelContextType: "undefined"`, `toolsAddedCount: 1`), and the note
(`corpus/knowledge/webmcp-chromium-loopback-round-16.md:62`) states only the values, not the
causal gloss. The harness comment at `scripts/webmcp-loopback-round16.mjs:1269-1271` repeats
the same unsupported gloss.

### F3 (Low–Medium) — the pass predicate is a threshold, not a match; the fixture's declared oracle is unused

`scripts/webmcp-loopback-round16.mjs:1271`:

```js
const pass = probe.documentModelContext === 'undefined' && cdp.toolsAdded.length >= 1;
```

- No comparison against the fixture's declared `__webmcpFixture.expectedTools` (the
  `compareTools`/`toolMatches` helpers used by `declarative-form-tool` are not called here), and
  the record stores `expected.toolsAdded` as the prose string
  `">=1 (event fires despite absent page API — divergence)"`.
- No assertion of the document URL/origin — `actual` only records
  `{documentModelContext, isSecureContext, toolsAdded}`. On this build `about:blank` with the
  form injected satisfies the identical asserted pair (probe row above), so the two asserted
  conjuncts alone do not pin the observation to a `data:` document.
- `isSecureContext` is recorded but not asserted.

Evidence that the verdict does not read the fixture oracle: delete the fixture's
`<script>__webmcpFixture…</script>` block only (form left intact) and the case still passes:

```
$ cp -r corpus/evidence/round-16/webmcp/fixtures /tmp/w2-dud-TfIp/fx-nofx   # script stripped
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-dud-TfIp/fx-nofx --out /tmp/w2-dud-TfIp/out-nofx.json
WEBMCP_CASE id=declarative-form-tool status=fail
WEBMCP_CASE id=data-url-declarative status=pass
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
NO-ORACLE-SCRIPT data-url status: pass tool: search detail: divergence confirmed: doc.modelContext undefined but 1 tool(s) announced via CDP
```

The recorded payload still shows the fixture's `search`/`Search` tool with the fixture schema
(`required:["category"]`, `sort` with `anyOf`/`enum`), so the committed receipt's *data* is
correct; the *verdict* would not notice a wrong payload. This is an assertion-strength gap, not
a false positive.

## Non-vacuity probes (pass is load-bearing)

1. Remove the declarative form from the served fixture (fresh `/tmp` copy; recorded digest
   follows the mutated bytes `d457320407bebe7ac885972c349303c1828734290680c2868a939440952db554`):

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-dud-noform-bPPt/fx-noform \
    --out /tmp/w2-dud-noform-bPPt/out-noform.json
WEBMCP_CASE id=data-url-declarative status=fail
NO-FORM data-url status: fail detail: docMc=undefined toolsAdded=0
```

2. Remove the WebMCP launch flags (harness copy under `/tmp`, `WEBMCP_FEATURE_ARGS = []`):

```
$ node /tmp/w2-noflags-Hi9k/scripts/h.mjs --fixtures corpus/evidence/round-16/webmcp/fixtures \
    --out /tmp/w2-noflags-Hi9k/out-noflags.json
WEBMCP_CASE id=data-url-declarative status=fail
NO-FLAGS data-url status: fail detail: docMc=undefined toolsAdded=0 tools: 0
```

Both conjuncts are necessary; the CDP event requires a real declarative registration under the
WebMCP flags. The case is not vacuous.

## Fixture binding (byte level, verified)

- Case code builds the data URL from the in-memory bytes read from the fixtures dir
  (`readFixture('declarative-form.html')`, harness :1259-1261); no second copy is embedded.
- `sha256sum corpus/evidence/round-16/webmcp/fixtures/declarative-form.html` =
  `7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e` = receipt
  `fixtureSha256` = `receipt.fixtures[declarative-form.html].sha256`.
- The C2 counter re-derives the blob digest at `REV` from `fixtureFile`
  (`.ufo/waves/round-16/measure.mjs:239-242`), and rejects on mismatch.
- The `fixture` display label (`"data: (declarative-form.html bytes)"`) is not used as a path by
  the repaired counter; `fixtureFile` carries the path. The retained first after-measurement at
  A (`corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json`) failed with
  exactly `case data-url-declarative fixture digest` under the old counter — i.e. this case was
  the one defect that made the A arm read 0; the repair is consistent with the observed cause.

Counter checks at this snapshot:

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"revision":"b444ca8…","c2_webmcp_held":1,…,"failures":[],…}   exit=0
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2
{"revision":"e38d259…","c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"],…}  exit=0
$ node .ufo/waves/round-16/measure.mjs 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a --claim C2
{"revision":"8f7feb3…","c2_webmcp_held":1,…,"failures":[],…}   exit=0   # repaired counter run from the worktree
```

The last line is expected and consistent with the ticket: the *committed* counter blob at A
(`4eb82895…`) counted 0 (retained file above); the repaired worktree counter scores the same
tree 1. The manifest's `before.revision` is `e38d259` (0), not A.

## Residual risk / not run

- No real verdict on the Chromium mechanism behind the `data:`/`about:` announcement (why the
  insecure `http://tabi.test` control gets no event while `data:`/`about:` do). The case only
  needs the observed pair; F2 is about the provenance wording.
- The pass predicate's non-binding to tool identity was shown by mutation, not by a committed
  counterexample; no shipped receipt is wrong.
- Not run: a fresh probe run of `WebmcpProbeSecure.mjs` (would re-launch Chromium; the oracle
  artifact is committed and its rows were read directly). Not run: any mutation of the lane
  tree.
