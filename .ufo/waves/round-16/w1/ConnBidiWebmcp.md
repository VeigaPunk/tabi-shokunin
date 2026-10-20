# ConnBidiWebmcp — round 16 wave 1 report

Owned output: this report only. No repo file outside it was written; no browser launched by this
seat (runtime facts below are read-only reads of sibling evidence). No subagent dispatch.

## Question and verdict

Is there a WebDriver BiDi (S005) equivalent for the WebMCP CDP domain that C2 observes?

**No standard one, as of the fetched W3C Working Draft.** In the 8 October 2026 WD, `WebMCP`,
`webmcp`, `modelContext`, `model context` and `toolName` occur **zero** times; §7 declares exactly
ten modules (§7.1 session … §7.10 webExtension) and none is WebMCP. The editor's draft of the same
date is identical in this respect, and MDN's BiDi module index has zero hits. The only BiDi-side
route that exists is Chromium's **non-standard** BiDi+ command `goog:cdp.sendCommand`, which runs
"the described CDP command" — i.e. the BiDi+ route could carry `WebMCP.*` only as CDP payload
(unprobed), not as a BiDi module. The reverse direction is also empty: the WebMCP CG draft contains no occurrence of
WebDriver, BiDi, CDP, DevTools or automation; it specifies the page-side JS API only. So the CDP
`WebMCP` domain is an implementation surface specified by neither standard.

## Sources opened this session (all 2026-10-20)

| id | URL | method | bytes / sha256 | anchor + verbatim quote |
|---|---|---|---|---|
| S005 | https://www.w3.org/TR/webdriver-bidi/ | `curl -sS -L`, HTTP 200 | 4,235,856 / `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` | WD 8 October 2026, revision `f922e6af669ead51496db85f37813f39438ef171`, §3.3 Modules (`#extension-modules`): "An implementation may define extension modules. These must have a module name that contains a single colon \":\" character." (19 words) |
| S005 | same | same | same | §3.3 Modules: "Other specifications may define their own WebDriver-BiDi modules that extend the protocol." (12 words) |
| S005 | same | same | same | §7 Modules list: `7.1 session`, `7.2 browser`, `7.3 browsingContext`, `7.4 emulation`, `7.5 network`, `7.6 script`, `7.7 storage`, `7.8 log`, `7.9 input`, `7.10 webExtension` — ten modules, no WebMCP |
| — | https://w3c.github.io/webdriver-bidi/ (editor's draft) | `curl -sS -L`, HTTP 200 | 4,235,329 / `d07f85f8afd9e2d2ee616832f4f280ffd2c9ba06ff00b5ad9591eb5ad2b8e1bb` | rendered date `datetime="2026-10-08"`; zero WebMCP/modelContext hits |
| S006 | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules | `curl -sS -L`, HTTP 200 | 163,592 / not hashed | module index page: `grep -o -i -E 'webmcp\|modelcontext'` → no output (0) |
| S020 | https://webmachinelearning.github.io/webmcp/ | `curl -sS -L`, HTTP 200 | 505,949 / `180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a` | Abstract: "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents." (13 words); Status: "It is not a W3C Standard nor is it on the W3C Standards Track." (14 words); `<time class="dt-updated" datetime="2026-10-20">` |
| S012 | https://raw.githubusercontent.com/GoogleChromeLabs/chromium-bidi/main/README.md | `curl -sS -L`, HTTP 200 | 22,873 / `f3a626db446bda23866afbeab6e5d0f6a60de10f30b0ea7de821ceda356af401` | §BiDi+ → Command `goog:cdp.sendCommand`: "The command runs the described CDP command and returns the result." (11 words) |
| new | https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/public/devtools_protocol/browser_protocol.pdl?format=TEXT | `curl -sS -L` then `base64 -d` | decoded 1,868 / `f1aa425c26e6c00459f7f5880d3adfc63d3c79762ba7658fdb88b31a59161775` | line 63: `include domains/WebMCP.pdl` |
| new | …/devtools_protocol/domains/WebMCP.pdl?format=TEXT | `curl -sS -L` then `base64 -d` | decoded 4,126 (125 lines) / `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` | line 7 `experimental domain WebMCP`; line 55 `command enable`; line 61 `command invokeTool`; line 80 `event toolsAdded`; lines 53-54: "Enables the WebMCP domain, allowing events to be sent. Enabling the domain will trigger a toolsAdded event for all currently registered tools." (22 words) |
| own-work (read) | `corpus/evidence/round-16/webmcp/protocol-domain.json`, `runtime-pin.json` | file read | per WebmcpProtocol report | Chromium 154.0.8037.97, `/json/protocol` 58 domains, `WebMCP` present and byte-identical with and without WebMCP flags |

### Absence measurement (reproducible, read-only)

```
$ curl -sS -L https://www.w3.org/TR/webdriver-bidi/ -o /tmp/bidi.html
$ wc -c /tmp/bidi.html
4235856 /tmp/bidi.html
$ sha256sum /tmp/bidi.html
dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4  /tmp/bidi.html
$ grep -c -i -E 'webmcp|model.?context' /tmp/bidi.html
0
```

Text extraction over the rendered body (655,029 characters after tag stripping) also returned 0
for each of `WebMCP`, `webmcp`, `modelContext`, `model context`, `Model Context`, `toolName`,
`toolname`. The zero count includes the spec's inline definition index, so there is no defined
`WebMCP` term hiding from the keyword.

### Reverse direction (WebMCP draft → protocols)

```
$ curl -sS -L https://webmachinelearning.github.io/webmcp/ -o /tmp/webmcp-spec.html
$ wc -c /tmp/webmcp-spec.html
505949 /tmp/webmcp-spec.html
$ sha256sum /tmp/webmcp-spec.html
180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a  /tmp/webmcp-spec.html
$ for t in WebDriver BiDi CDP DevTools automation declarative tooldescription autosubmit; do
    printf '%-16s %s\n' "$t" "$(grep -o -i -E "$t" /tmp/webmcp-spec.html | wc -l)"; done
WebDriver        0
BiDi             0
CDP              0
DevTools         0
automation       0
declarative      0
tooldescription  0
autosubmit       0
```

`toolName` occurs 51 times, all as the ModelContext event-interface attribute / tool-map key
(e.g. `ToolCancelEvent.toolName`), not as a form attribute. The draft's own API sections are
§4.1 Extensions to Document, §4.2 ModelContext Interface (`getTools`, `executeTool`, …), §4.3
Events, §4.4 Permissions policy integration, §5 Interaction with agents.

## Relation to tabi's protocol-choice path

- `corpus/SOURCES.md:48` — the `protocol-choice` path is S002 → S005 → S006 → S012 → S011 → S008 →
  S009, "so transport is chosen per evidenced feature", ending at
  `corpus/knowledge/webdriver-bidi-capability-matrix.md`. WebMCP is a **new feature outside that
  matrix**, not a new path: S005 was reopened this session and yields a negative fact (no module)
  plus the extension-module mechanism.
- `SKILL.md:1607` — "claim a BiDi surface only after a pinned browser/binding loopback probe
  reproduces the CDP evidence contract; the W3C draft is protocol text, not support". For WebMCP
  the failure is one step earlier than implementation: the draft defines no surface to probe.
- Therefore C2's evidence contract must stay CDP-native (`WebMCP.enable` / `toolsAdded` /
  `toolsRemoved` / `invokeTool`) and must not imply BiDi portability. The matrix's decision rule
  (§3, "choose the transport per evidenced feature") already covers the choice; WebMCP is its
  strongest instance so far — the feature has no standard BiDi counterpart at all.

### Proposed L1 move (knowledge/note only; L1 owns both files)

1. Add one row to `corpus/knowledge/webdriver-bidi-capability-matrix.md` §2:
   **WebMCP tool inventory/events (C2)** → CDP anchor `WebMCP.enable` / `toolsAdded` /
   `toolsRemoved` / `invokeTool` (experimental domain, Chromium 154, behavior flag-gated) →
   BiDi counterpart: **none in WD-20261008 (§7.1–§7.10)** → note: nominally reachable from BiDi only through
   non-standard Chromium BiDi+ `goog:cdp.sendCommand` (unprobed), which returns CDP payload; `script.evaluate`
   can call `document.modelContext.getTools()` but is page-context self-report, not the
   browser-side tool registry → `locally measured: no` (BiDi side).
2. In the C2 knowledge note's "observed vs spec divergence" section, add one sourced sentence:
   as fetched 2026-10-20, the WebMCP CG draft has no declarative-forms text ("declarative",
   "tooldescription" and "autosubmit" each occur 0 times; the 51 `toolName` occurrences are the
   event-interface attribute, e.g. `ToolCancelEvent.toolName`), while the CDP `Tool` type carries
   `backendNodeId` and an `autosubmit` annotation — so the `<form toolname>` surface is a Chromium
   implementation feature, not CG-draft text.
3. Do not add a new SOURCES row for BiDi: S005's `used-by` already points at the matrix; the
   re-open is a same-row use. Note the S020 revision drift below before touching its row.

## Contradictions stated explicitly

- "No BiDi equivalent" is **dated, not architectural**. §3.3 permits implementation extension
  modules (`prefix:module`) and external specifications to define their own BiDi modules. A future
  `webmcp.*` module is possible; today's WD simply has none.
- `script.evaluate` is a generic escape hatch, not an equivalent. It could read
  `document.modelContext.getTools()` or press a tool, but the evidence authority is page-context
  self-report; the CDP domain's events (`toolsAdded`, `toolInvoked`, `toolResponded`) are
  browser-side facts with `frameId`/`backendNodeId`. Mapping one to the other would erase that
  provenance difference.
- Protocol presence ≠ behavior: the `WebMCP` CDP domain appears in `/json/protocol` (1,578,134-byte schema,
  58 domains) even with no WebMCP flags, byte-identical across flag sets; only `document.modelContext`
  presence and event emission are flag-gated. A harness must assert events/JS state, never domain
  presence.

## Risks

- **Absence rot.** The negative is only as fresh as WD-20261008 (and the 2026-10-08 editor's draft).
  S005's 90d/on-republication recheck covers it; the matrix row must carry the date and revision.
- **Wrong build cited for PDL.** The PDL page is `@main`; the 154-specific anchor is the sibling
  `/json/protocol` capture (`126cf5fa…`, 58 domains, Chromium 154.0.8037.97). Cite the runtime
  endpoint for build scope and the PDL only as source-level corroboration.
- **S020 revision drift.** S020 records CG-DRAFT 2026-10-16 revision `f14762e6`, but the bytes
  fetched today do not contain that hash and the page says `dt-updated 2026-10-20`. L1 should
  record the revision actually cited (or the page access + date) rather than inherit `f14762e6`
  unverified.
- **Over-reading the BiDi+ route.** `goog:cdp.sendCommand` is Chromium-specific, non-standard, and
  still needs a BiDi session/binding; it does not make WebMCP portable, and the lane has not probed
  it.

## Verification for L1 (read-only, no browser)

```
curl -sS -L https://www.w3.org/TR/webdriver-bidi/ -o /tmp/bidi.html
sha256sum /tmp/bidi.html            # expect dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4
grep -c -i -E 'webmcp|model.?context' /tmp/bidi.html   # expect 0
grep -o 'id="modules".*' /tmp/bidi.html | head -c 120   # expect §7 Modules anchor
curl -sS -L https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/public/devtools_protocol/browser_protocol.pdl?format=TEXT | base64 -d | grep -n 'include domains/WebMCP.pdl'   # expect line 63
```

## Files changed

- `.ufo/waves/round-16/w1/ConnBidiWebmcp.md` (this report, new).

## Tooling

No installs or upgrades. Used `curl`, coreutils `sha256sum`/`base64`, Python 3 stdlib for text
extraction, and read-only reads of committed/uncommitted sibling evidence. No browser was launched
by this seat; no real site or user profile touched.
