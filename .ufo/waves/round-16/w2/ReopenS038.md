# ReopenS038 — rejected webmcp-fork CHROMIUM_FLAGS.md

**Verdict: HOLDS.** The rejection reason is true on all three legs; the flip is a sound,
checkable condition and is unfired at both the 154 tag and Chromium `main` today; the quote at
the anchor supports `teaches`; tier/kind/scope are honest. One non-blocking anchor deviation is
recorded at the end (revision slot holds an access date, not a revision).

Observed at lane HEAD `b444ca8e024f386124418169e8e400221524bba3` (`git rev-parse HEAD`);
`git status --porcelain corpus/SOURCES.md corpus/evidence/round-16/webmcp/receipt.json` printed
nothing — the attacked bytes are the measured revision.

## Attack item and axes

Item: S038 (`corpus/SOURCES.md:52`), `community | C | Flag recipe and readiness check for native
WebMCP in Chromium`, anchor `fetched 2026-10-20, §Verification Method 2 line 140`, teaches
`REJECTED: its navigator.modelContext readiness check contradicts S020 §4.1 and S033 (Document
only) and the observed 154 surface; flip: a pinned build whose IDL exposes navigator.modelContext`,
status `rejected`.

Axes: (1) quote–anchor fidelity; (2) truth of each rejection leg; (3) flip falsifiability;
(4) tier/kind/scope honesty; (5) record provenance.

## Source re-opened this session (2026-10-20)

Row URL `https://github.com/Sgr57/webmcp-fork/blob/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md`
→ HTTP 200. Content behind it:

```
$ curl -sSL -o /tmp/s038.md https://raw.githubusercontent.com/Sgr57/webmcp-fork/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md
$ sha256sum /tmp/s038.md
351c02db5b16e283b9e59f1a2575c012cda96c51a60467051a1236fe15c7555a
$ wc -l /tmp/s038.md
511 /tmp/s038.md
$ awk 'NR==140 {print NF" words: ["$0"]"}' /tmp/s038.md
3 words: [console.log('modelContext available:', !!navigator.modelContext);]
```

Anchor check, numbered around the locator:

```
136: #### Method 2: JavaScript Console
140: console.log('modelContext available:', !!navigator.modelContext);
141: console.log('modelContextTesting available:', !!navigator.modelContextTesting);
```

**Quote at the anchor:** `console.log('modelContext available:', !!navigator.modelContext);`
(3 words, ≤25). It grounds exactly the object the `teaches` cell faults — the readiness check —
and the locator (`§Verification Method 2 line 140`) is exact. The digest is also the draft's
recorded raw-bytes digest (`351c02db…55`), so the bytes are unchanged since the row was drafted.

## Rejection legs

### 1. "contradicts S020 §4.1" — TRUE

Live spec, CG-DRAFT revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, dated 20 October 2026:

```
$ curl -sSL https://webmachinelearning.github.io/webmcp/ | awk 'NR>=1480 && NR<=1490'
1480: <h2 ... data-level="4" id="api"><span class="secno">4. </span><span class="content">API</span>
1481: <h3 ... data-level="4.1" id="document-extension"><span class="secno">4.1. </span><span class="content">Extensions to <code class="idl">...Document</a></code></span>
1488: <pre class="def highlight idl"><c- b>partial</c-> <c- b>interface</c-> ...<c- g>Document</c-> {
1489:   [<c-a ...>SecureContext</a>, ...>SameObject</a>] <c- b>readonly</c-> <c- b>attribute</c-> ...>ModelContext</a> ...>modelContext</a>;
```

Quote (≤25 words): `partial interface Document { [SecureContext, SameObject] readonly attribute
ModelContext modelContext; }` — §4.1 "Extensions to Document", lines 1488-1490. No `partial
interface Navigator`; spec source `main` agrees (`index.bs:675 partial interface Document {`).
The doc's `navigator.modelContext` check is therefore not the spec entry point.

### 2. "S033 (Document only)" — TRUE

Fetched from the pinned tag myself (not read from S033's row):

```
$ curl -sSL "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT" | base64 -d | cat -n
     7  [
     8    RuntimeEnabled=WebMCP,
     9    ImplementedAs=ModelContextSupplement
    10  ] partial interface Document {
    11    [SecureContext, SameObject] readonly attribute ModelContext modelContext;
    12  };
```

Only the Document partial exists in the 154 `script_tools` directory (directory listing has no
Navigator supplement). S033 line 11 is accurate.

### 3. "the observed 154 surface" — TRUE

The lane's own receipt (`corpus/evidence/round-16/webmcp/receipt.json`), case
`model-context-location`, on `Chrome/154.0.8037.97` (`.runtime.observed.product`):

```
$ jq '.cases[] | select(.name=="model-context-location") | .actual' corpus/evidence/round-16/webmcp/receipt.json
{
  "documentModelContextType": "object",
  "documentOwnProperty": false,
  "navigatorHasModelContext": false,
  "navigatorModelContextType": "undefined",
  "isSecureContext": true
}
```

The harness asserts the same expectation (`scripts/webmcp-loopback-round16.mjs:1090-1094`:
`navigatorHasModelContext: 'modelContext' in navigator`, pass requires
`documentModelContextType === 'object' && navigatorHasModelContext === false`). Running the
doc's readiness check against this build prints `false` while the native API is present — a
false negative, i.e. it contradicts the observed surface.

### The rejection is understated, not overstated

Two further 154 facts (not needed for the verdict, but they make the doc's recipe wrong beyond
the check):

- `--enable-features=WebModelContext` names no feature at 154:
  `grep -c WebModelContext runtime_enabled_features.json5` → `0` (the feature is `WebMCP`,
  lines 7023-7050; `about_flags.cc` at the tag registers only `kWebMCP` and
  `kDevToolsWebMCPSupport`).
- The doc's "Expected output … Available methods" list (`provideContext`, `listTools`,
  `unregisterTool`, `clearContext`) does not match 154's `model_context.idl`, which declares
  only `registerTool`, `getTools`, `executeTool` (lines 70-72).

## Tier / kind / scope honesty

- `kind=community`: third-party fork by an individual, not the WebMCP editors or Chrome. Correct.
- `tier=C`: contract forbids `community` at A; C is "lead only". Conservative and defensible for
  an unpinned community guide whose central readiness check is wrong. No inflation (A:31,B:4,C:4
  in the gate's histogram; S038 is one of the four C rows).
- `scope`: "Flag recipe and readiness check for native WebMCP in Chromium" names exactly the
  doc's two functions and claims no build validity. The draft's "; carries no build pin" was
  dropped in integration, but the row is `rejected` at tier C, so no overclaim survives.
- `status=rejected`, `used-by=—`, `opened=2026-10-20`, `recheck=on-release` are in vocabulary and
  consistent with a rejected row kept as taste evidence.
- Row shape: `awk -F'|' 'NR==52'` → `NF=13` (11 cells), all enums valid.
- `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=39 … findings=0`.

## Flip soundness

"a pinned build whose IDL exposes `navigator.modelContext`" is observable by reading that build's
`model_context_supplement.idl` (a Navigator partial would have to appear). Tested today:

- at tag `154.0.8037.97`: Document-only (above);
- at Chromium `main`: `raw.githubusercontent.com/chromium/chromium/main/.../model_context_supplement.idl`
  is byte-identical in shape — still `partial interface Document`.

So the flip is unfired. Nuance, not a defect: the flip addresses the readiness-check leg; it would
re-admit the row build-scoped, while the spec would still say Document (`index.bs:675`). The row's
scope is already build-agnostic, so a build-scoped re-admission is the correct granularity.

## Deviation recorded (non-blocking)

The anchor's revision slot is `fetched 2026-10-20` — an access date, not "version, commit or
publication date" as the Shape rule and the lane's own
`.ufo/waves/round-16/sources-staging.json` `fieldContract.anchor` require. The lane gate does not
detect this (it only flags empty/`—` anchors: `scripts/check-sources.mjs:324`), and the wave draft
had pinned the bytes (`DraftSources.md` §C: `351c02db…55`), which I recomputed and matched. The
locator is exact and the content is verifiable, so this is a self-containment gap in the row, not
a defect in the rejection's truth. If L1 wants conformance to the letter, append the digest or a
`main` commit to the anchor — a `status`/`recheck`/`used-by`-only edit is not enough under Rule 2,
so that would be a new correction row, which for a rejected row is not worth it.

Adjacent, outside S038: S020's own anchor still records `CG-DRAFT 2026-10-16, revision f14762e6`,
while the live page is `cb3d1696` dated 20 October 2026 (the wave draft logged this divergence).
S038's citation was verified against the live §4.1, so the rejection leg stands; S020's anchor is
a separate row defect.

## Limits

- The browser harness was not re-run; the committed receipt and its harness source are the
  observation record (a re-run needs Chromium launches and is receipt-producing, not needed to
  test this row).
- I read the 154 tag and Chromium `main` IDL, the live spec, and the repo raw file myself; no REA
  MCP, no tool installs, no lane mutation outside this report.
- This is an author-side falsification check of one rejected row, not non-author certification.
