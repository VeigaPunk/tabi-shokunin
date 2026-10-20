# CaseDeclarativeMissingName — wave-2 attack on `declarative-missing-name`

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; only this report written)
- Measured revision: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair)
- Runtime: Chromium 154.0.8037.97 (`/usr/bin/chromium` stub `eaed39c3…`, real `/usr/lib/chromium/chromium` `95b17db7…`), Playwright 1.64.0, Node 24.21.0
- Date: 2026-10-20. Seat: `TabiR16.CaseDeclarativeMissingName` (leaf, no dispatch).

## Verdict

**Item verdict: BREAKS — on the "named oracle before observation" clause only.**

| Sub-question | Verdict | Basis |
|---|---|---|
| Expectation set from a named oracle BEFORE observation | **BREAKS** (as recorded) | `expectedProvenance` says the value was *observed twice on this build*; no SOURCES row, note citation, path, digest or locator names an oracle. The name is nevertheless a real Chromium 154 constant (fetched below), so this is a provenance/manifest defect, not fabrication. |
| Pass vacuous | **HOLDS** (not vacuous) | Two mutants: form removed → case fails; `toolname` added → case fails (tool registers, no issue). Pass requires both an exact wire error and zero registrations. |
| Fixture binds | **HOLDS** | Receipt digest `12e74e98…` == `sha256` of the committed blob at `b444ca8`; the C2 counter re-checks that equality (`measure.mjs:242`); mutant bytes change the digest and fail the case. |

The runtime observation is sound and discriminating. The defect is that the expected value's origin is post-observation and unbound, which is exactly the property this item attacks.

## Evidence — commands and observed outputs

### 1. Required re-run reproduces the case

```
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-declarative-missing-name.json
WEBMCP_CASE id=flags-off-negative-control status=pass
…
WEBMCP_CASE id=declarative-missing-name status=pass
…
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-declarative-missing-name.json
EXIT=0
```

Case-level comparison against the committed receipt (`node -e` structural diff):

```
COMMITTED status=pass expected={toolsAdded:0,auditsErrorType:"FormModelContextMissingToolName"}
          issueErrorTypes={FormModelContextMissingToolName:4} toolsAdded=0 getTools=[] durationMs=31
RERUN     status=pass expected=(identical) issueErrorTypes=(identical) toolsAdded=0 getTools=[] durationMs=34
identical modulo durationMs+atMs: true
```

Diff detail: only `eventLog[].atMs` 12→11 (4 entries) and `durationMs` 31→34. Four `Audits.issueAdded` payloads, all `GenericIssue / details.genericIssueDetails.errorType = FormModelContextMissingToolName / violatingNodeId = 2`.

### 2. Mutant A — form removed (tests whether "no tools" alone is enough)

Fixture copied to `mktemp -d /tmp/w2-dmn-XXXXXX`, `<form …>…</form>` stripped, run with `--fixtures <tmp>/fixturesA --out /tmp/w2-mutA.json`:

```
WEBMCP_CASE id=declarative-missing-name status=fail
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
A case: fail | toolsAdded=0 errorTypes={} | toolsAdded=0 | issues={}
```

No form → no issue → **fail**. The issue arm is independently required; "no tool" cannot carry the case.

### 3. Mutant B — `toolname="search"` added (tests cause discrimination)

```
WEBMCP_CASE id=declarative-missing-name status=fail
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
B case: fail | toolsAdded=1 errorTypes={} | toolsAdded=1 | names=["search"] | issues={}
```

A well-formed declarative form → one `toolsAdded`, no `FormModelContextMissingToolName` → **fail**. The pass is bound to the missing-name cause, not to "a form exists" or "any page".

### 4. Fixture binding

```
$ sha256sum corpus/evidence/round-16/webmcp/fixtures/declarative-missing-name.html
12e74e989145661d9efeabef14189d1142cf99eb5f8e231c636a92ab6424ba31  …
$ git show b444ca8:corpus/evidence/round-16/webmcp/fixtures/declarative-missing-name.html | sha256sum
12e74e989145661d9efeabef14189d1142cf99eb5f8e231c636a92ab6424ba31  -
```

Receipt case: `fixtureSha256 = 12e74e98…`, `fixtureFile = "declarative-missing-name.html"`, `bytes = 433`. Counter check at `.ufo/waves/round-16/measure.mjs:239-243`:

```js
if (c.fixtureFile !== undefined) {
  const name = String(c.fixtureFile);
  const fx = /^[A-Za-z0-9._-]+$/.test(name) ? blob(rev, `corpus/evidence/round-16/webmcp/fixtures/${name}`) : null;
  if (!fx || sha256(fx) !== c.fixtureSha256) failures.push(`case ${c.id} fixture digest`);
```

Counter at the measured revision:

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"revision":"b444ca8e024f386124418169e8e400221524bba3","c2_webmcp_held":1,
 "cited":["S020","S030","S031","S032","S033","S034","S035","S036"],
 "caseIds":[…11 ids incl. declarative-missing-name…],"failures":[],
 "counterBlobAtRevisionSha256":"bda4e18e…","inputsRead":[…,
 "corpus/evidence/round-16/webmcp/fixtures/declarative-missing-name.html",…]}
EXIT=0
```

Mutant receipts show the label/digest split: both record `fixture = corpus/evidence/round-16/webmcp/fixtures/declarative-missing-name.html` but digests `d7972ba1…` (A) and `9249faa7…` (B). The digest, not the label, is the binding; a non-canonical `--fixtures` run cannot be admitted by the counter, and the measured receipt's digest is the committed blob's.

### 5. Oracle: what the case record actually says

`scripts/webmcp-loopback-round16.mjs:1061-1069`:

```js
const expectedError = 'FormModelContextMissingToolName';
…
const pass = cdp.toolsAdded.length === 0 && (errorTypes[expectedError] ?? 0) >= 1;
return {
  pass,
  expected: { toolsAdded: 0, auditsErrorType: expectedError },
  expectedProvenance: 'harness-specified (FormModelContextMissingToolName observed twice on this build)',
```

Timeline (all 2026-10-20 UTC):

| Time | Artifact | Content |
|---|---|---|
| 14:32:14Z | `.ufo/waves/round-16/probes/WebmcpProbeIssues.json` | `missing-toolname`: 2 issues, `FormModelContextMissingToolName`, `toolStillRegistered:false` |
| 14:48:16Z | `corpus/evidence/round-16/webmcp/receipt.json` | case passes with 4 issues |
| 14:54:43Z | commit `8f7feb3` | harness, fixture, receipt, note all committed together |

The provenance's "twice" matches the probe's two issues, so the expected literal was derived from that observation, not from an independent oracle. The case never consults the fixture's declaration (`fixtureDeclaration` is used at lines 867/908/950 only; `caseDeclarativeMissingName` at 1053-1080 does not call it). The fixture itself only pre-declares `expectedTools: []` (line 12); it says nothing about the issue.

No cited source names the enum:

```
$ grep -c "inspector_issue\|GenericIssueErrorType" corpus/SOURCES.md
0
$ grep -n "^source: " corpus/knowledge/webmcp-chromium-loopback-round-16.md
1:source: S020  2:S030  3:S031  4:S032  5:S033  6:S034  7:S035  8:S036
```

An independent named oracle does exist and was available before the run — it simply is not cited:

- Chromium 154 tag, `third_party/blink/public/mojom/devtools/inspector_issue.mojom` line 307: `kFormModelContextMissingToolName,` (enum `GenericIssueErrorType`, opened 2026-10-20; URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/mojom/devtools/inspector_issue.mojom`). The wire spelling is the mojom value minus the `k` prefix.
- Playwright 1.64.0 protocol typings already on disk before the probe (`corpus/evidence/round-13/aria/node_modules/playwright-core/types/protocol.d.ts:1014`, mtime 2026-10-20 05:13Z): `GenericIssueErrorType = … "FormModelContextMissingToolName" | …` (untracked node_modules).
- `/usr/lib/chromium/chromium` binary: `strings … | grep -c FormModelContextMissingToolName` → `2`.

So the expected name is externally corroborated; the *record* does not bind it to any oracle, and its provenance is prose with no `path`/`sha256`/`locator` — the structured provenance the wave-1 schema review required (`w1/RevEvidenceSchema.md` H5/M5) and that the sibling `navigation-clears-tools` case does carry ("source oracle: devtools-frontend WebMCPModel.ts:192-203 (pin 66df492a)").

### 6. Committed fixture contract contradicts the receipt

`corpus/evidence/round-16/webmcp/fixtures/README.md:39` (present at `b444ca8`):

> `declarative-missing-name.html` | No `toolsAdded` and no `Audits.issueAdded` observed for the toolname-less form (`FormModelContextMissingToolName` path). `expectedTools` empty.

The receipt records **four** `Audits.issueAdded` events and the case *requires* ≥1. The knowledge note (`:58`) agrees with the receipt ("raises `Audits.issueAdded` … `emitted more than once per page`"). README, note and receipt entered the repo in the same commit, so the contradiction is inside the measured snapshot: the fixture contract cannot serve as the pre-registered expectation, and a reader auditing the fixture would conclude the case's expected issue is wrong.

## Findings by severity

**M1 — expectation provenance is post-observation and unstructured (Q17 manifest clause).**
`expectedProvenance` self-identifies the oracle as the same build's observation ("observed twice on this build", matching the 14:32Z probe). There is no path, digest or locator, no SOURCES row covers the enum (`grep -c … corpus/SOURCES.md` = 0), and the note's citations (S020, S030–S036) do not define it. Q17's literal clauses on *cause* (exact wire errorType, not any exception or a source-reasoned spelling) and on expected/actual structure are met; the manifest/oracle clause is not. Cheap fix: cite the mojom row and/or the probe file with digest+locator, or add `expectedProvenance {kind:"spec-row"|"prior-observation", path, sha256, locator}`.

**M2 — fixture README contradicts the receipt at the measured revision.**
`fixtures/README.md:39` states "no `Audits.issueAdded` observed"; receipt has 4 and passes on ≥1. This is a committed evidence-fidelity defect at `b444ca8`. Fix line 39 to match the note/receipt.

**L1 — `getTools()` is recorded but not part of the pass predicate.**
`pass` checks only `toolsAdded.length === 0` and the error count (`harness:1065`); `actual.getTools` is `[]` in the measured run and therefore consistent, but a registration visible only in-page (event missed) would still pass. Narrow, not observed.

**L2 — `waitFor` returns on the first issue of any type.**
`harness:1059` waits on `cdp.toolsAdded.length > 0 || cdp.issues.length > 0`, not on the target `errorType`. A non-target issue arriving first would end the window before the target arrives → false fail, never a false pass. Observed: all four issues at 11–12 ms, so not triggered.

**Info — `--fixtures` label.** Out-of-band runs record the canonical `fixture` path with the served bytes' digest. The label is not self-certifying; the digest plus `measure.mjs:242` is what binds the measured artifact.

## Residual risk / verification gaps

- The C2 counter admits on `status === 'pass'` + fixture digest only (`measure.mjs:227,234,239-243`). It does not inspect `expected`, `expectedProvenance`, `actual` or `issueErrorTypes`, so this case's discriminating power is established here by mutation, not by the artifact. A future harness edit that made `pass` unconditional would still be admitted.
- Mutation probes ran against copies under `/tmp`; the lane and the measured bytes were untouched. They establish behavior for this harness and fixture class only.
- No mutant produced a tool with the `toolsAdded` event suppressed, so L1 remains theoretical.
- Not in scope, noted for routing: the receipt's `runtime.observed.chromium.realExecutable` is `null` (launch stub hash only), which the wave-1 schema review flags as the Q18 observed/pinned ambiguity.

## Tool installs

None (nothing installed; pacman pause respected).
