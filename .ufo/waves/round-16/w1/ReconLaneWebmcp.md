# ReconLaneWebmcp — WebMCP / modelContext / census-U3 anchor inventory (round 16, wave 1)

- Seat: `TabiR16.ReconLaneWebmcp-5` (read-only scout). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Date: 2026-10-20 (host clock `2026-10-20T11:31:13-03:00`). No writes outside this report. No browser launched,
  no gate/counter/selftest run, no tool installed or upgraded.
- Assignment: grep `WebMCP / modelContext / census U3 / webmcp` across `SKILL.md`, `corpus/README.md`,
  `corpus/knowledge/*.md`, `corpus/SOURCES.md`, `LOG.md`, `PROVINCE.md`; report every anchor `path:line` and what
  it says so L1 can supersede append-only.
- Sibling ids carry the `-5` suffix per L1 note; this seat wrote only its own Report.

## 0. Method (commands + observed results)

Run at lane root, all read-only:

```
for f in SKILL.md corpus/README.md corpus/SOURCES.md LOG.md PROVINCE.md; do
  grep -n -i -E 'webmcp|modelcontext|census u3|\bU3\b' "$f" || echo "(none)"; done
grep -rn -i -E 'webmcp|modelcontext|census u3|\bU3\b' corpus/knowledge/
wc -l LOG.md SKILL.md PROVINCE.md corpus/README.md corpus/SOURCES.md
```
→ `SKILL.md` (1828 lines): no match for `webmcp|modelcontext` and no match for plain `mcp`.
→ `LOG.md` (961 lines): no match for `webmcp|modelcontext` and no match for plain `mcp`.
→ `PROVINCE.md` (21 lines): no match for any of the four terms.
→ `corpus/README.md`, `corpus/SOURCES.md`, `corpus/knowledge/browser-surface-census.md`: hits listed in §1–§2.

Sources opened by `sed -n`/`grep -n` on this checkout; every line number below was re-confirmed with `grep -n`
against the literal text, not inferred.

## 1. Live WebMCP anchors (the rows L1 must supersede, append-only)

| Anchor | Verbatim fragment | What it asserts | Supersession implication |
|---|---|---|---|
| `corpus/README.md:35` | `- Native WebMCP in chromium 152 — unprobed (census U3).` | Round-3 `## Frontier` bullet: WebMCP frontier unprobed, version-stamped **chromium 152**. | `corpus/README.md:173` states the round-3 `## Frontier` block "stays unedited". Do **not** rewrite :35; supersede via a round-16 section + the round-1 style table. |
| `corpus/README.md:181` | `\| Native WebMCP in chromium 152 \| open — still unprobed; the only WebMCP surface evidenced on the host is a CDP tool, not `navigator.modelContext`, and no flag carries it. \| knowledge/browser-surface-census.md:145-153 and U3 :188. \|` | Three negatives: (a) still unprobed, (b) only WebMCP surface is the `rea-agents` CDP tool, (c) no browser flag carries it. | Strongest target. Every clause is now falsified or version-scoped: a flag set exists (`--enable-features=WebMCP…`), a native in-page surface was probed at 154 (PLAN, not this seat), and the CDP domain is typed in Playwright 1.64 (§4). |
| `corpus/README.md:194` | `\| WebMCP spec \| open — S020 opened and queued (CG draft 2026-10-16); native WebMCP in chromium 152 still unprobed \| corpus/SOURCES.md S020; knowledge/browser-surface-census.md U3 \|` | S020 is opened but **queued**; native probe still open at 152. | Flip only if the round-16 note actually cites S020 (state column + used-by), per PLAN C2. |
| `corpus/README.md:216` | `\| Other open frontier ground \| unchanged — extension↔daemon handshake, native WebMCP host probe, rate/rights real-site records, real-site journeys, WebMCP spec mining \| historical frontier rows :180–183 and :194 \|` | Groups "native WebMCP host probe" as unchanged open ground. | Needs a round-16 row/pointer if C2's held entry lands; do not edit :216 in place. |
| `corpus/README.md:283-284` | :283 `native WebMCP, real-site rate/rights,` / :284 `real-site journeys and WebMCP spec mining remain open; no source-row or` | Closing of `## Round 15` (:265): WebMCP named as still open; "no source-row or metadata-fixture count is counted as expansion". | The round-15 section is history. A new `## Round 16` section after :285 must restate the WebMCP status; leave :283-284 as the round-15 record. |
| `corpus/README.md:14` | `\| knowledge/browser-surface-census.md \| Host browser inventory (chromium 152.0.7977.82-1 the only real install; …` | Coverage-map row stamps the census (and therefore its WebMCP rows) to **chromium 152.0.7977.82-1**. | Host now reports `Chromium 154.0.8037.97 Arch Linux` (§5). Version scope changed; the 152 stamp must not be silently reused for a 154 claim. |
| `corpus/SOURCES.md:34` | `\| S020 \| WebMCP — https://webmachinelearning.github.io/webmcp/ \| spec \| A \| … \| CG-DRAFT 2026-10-16, revision f14762e6 \| Grounds the native-WebMCP frontier: pages expose JavaScript tools to agents; a CG draft, not a W3C Standard \| queued \| 2026-10-19 \| on-release \| — \|` | S020 state `queued`, added 2026-10-19, recheck `on-release`, used-by `—`, tier A. | C2's note may take it `queued→mined` and fill used-by, **only** after a seat opens the spec this round with URL + access date + ≤25-word located quote. This seat did not open S020. |
| `corpus/knowledge/browser-surface-census.md:145` | `### 3.4 WebMCP` | Section heading; the whole WebMCP evidence base of the corpus is this 9-line section + U3. | Census note is append-only via §6 errata (:196-198). Add an errata entry; never rewrite §3.4. |
| `…browser-surface-census.md:147-148` | `No WebMCP configuration exists in browser flags (chromium-flags.conf §1.1), the webbridge plugin tree, or kimi config (grep -ri webmcp over those → no matches).` | Measured absence of WebMCP config **as of 2026-10-14**. | Was true then; PLAN's 154 probe supplies flags at launch, which is not a config-file presence. Supersede by scope, not by calling the old row wrong. |
| `…browser-surface-census.md:149-152` | `The only WebMCP surface evidenced on this host is the rea-agents CDP tool discover-webmcp-tools (kaidoku corpus anchors: …:185,597,608; …:3).` | Only evidenced surface = an **agent-side CDP client tool**, explicitly not the browser. | This is exactly the conflation the note must correct: `discover-webmcp-tools` is a rea-agents tool name, not a browser capability. Native surface evidence now comes from the browser side (§4). |
| `…browser-surface-census.md:153` | `Native WebMCP support in chromium 152 was not probed (§5-U3).` | Negative probe statement, version 152. | Correct for 152 on 2026-10-14. The 154 probe (PLAN) is a different version; state both. |
| `…browser-surface-census.md:188-189` | `U3: Whether chromium 152 exposes native WebMCP (navigator.modelContext etc.) — no flag configured and no runtime probe performed in this census.` | The census unknown, phrased with the `navigator.modelContext` guess. | Resolvable: PLAN reports `document.modelContext` at 154 and `'modelContext' in navigator` false. The `navigator.` phrasing is the *guess*, not the finding — the note should quote both spellings and say which was observed. |
| `…browser-surface-census.md:196-198` | `## 6. Errata` / `(Append-only. No corrections yet.)` / `Appended 2026-10-14 …` | The note's own append-only rule. | The mechanism L1 must use for every census row above. |
| `corpus/README.md:22` | `## Frontier` | The round-3 frontier block; :173 declares it unedited. | Anchor for where a round-16 frontier section goes (after :285), not inside :22-55. |

## 2. Every other `\bU3\b` hit in the assigned files — not WebMCP anchors

Each note keeps its own U-numbering. These are unrelated unknowns; superseding them as "WebMCP" would be a
fabricated correction. Listed exhaustively from the grep so the set is closed.

| Anchor | Own unknown | Verdict |
|---|---|---|
| `corpus/README.md:13` | webbridge-plugin-anatomy row: "Round-2 errata appended (re-run block, **U3 partial resolution**, …)" | webbridge note's U3 (extension id), not census U3 — leave. |
| `corpus/knowledge/webbridge-plugin-anatomy.md:197,240,248` | U3 = browser-extension presence/id `fldmhceldgbpfpkbgopacenieobmligc`, partial resolution | unrelated. |
| `corpus/knowledge/webbridge-daemon-disposition.md:205` | U3 = daemon lifespan across logout/reboot | unrelated. |
| `corpus/knowledge/interaction-approval-table.md:58,87,196` | U3 = ownership verification for class C2 | unrelated. |
| `corpus/knowledge/hygiene-sweep-r4.md:134,231,235` | U3 = disposition of daemon lifespan; pre-append byte retrievability | unrelated. |
| `corpus/knowledge/archive-receipt-r5.md:154`; `archive-receipt-r8.md:159`; `carried-debt-closure-r8.md:61,132,134` | U3 = pin-file mechanism; "4-line" descriptor convention | unrelated. |
| `corpus/knowledge/archive-receipt-r10.md:172,358,391` | U3 = session material elsewhere; one unrecoverable revision | unrelated. |
| `corpus/knowledge/stateful-fixture-evidence.md:748` | U3 = second submit in `dup-submit` loses | unrelated. |
| `corpus/knowledge/state-changing-matrix-r9.md:75,365` | U3 = human-facing re-submit; r8 list boundary | unrelated. |
| `corpus/knowledge/webdriver-bidi-capability-matrix.md:123` | U3 = `script.evaluate` realm model | unrelated. |
| `corpus/knowledge/external-class-fixture-v2.md:543,566` | U3 = second `/style.css` load | unrelated. |
| `corpus/knowledge/packet-readiness-r7.md:108` | U3 = cold-read verdict outside the repo tree | unrelated. |
| `corpus/knowledge/layer-routing-synthesis.md:163` | cites v2 U3 (:543-546) | unrelated. |
| `corpus/knowledge/webbridge-revival-assessment.md:290,297` | U3 = extension retries while daemon down | unrelated. |

## 3. Negative results (explicit, so absence is not mistaken for a miss)

- `SKILL.md`: 1828 lines, **zero** occurrences of `webmcp`, `modelcontext`, or even `mcp`.
  → There is no SKILL.md transport/capability row to supersede. If C2 lands, SKILL.md needs a **new** row
  (L1-owned), not an edit of an existing WebMCP row. SKILL.md does carry the chromium-152 stamps (§5).
- `LOG.md`: 961 lines, zero `webmcp`/`modelcontext`/`mcp`. The round-15 tail records C1/C2 as *measurement
  contract* work only (`count-after-c2-repaired.json`, `enforced_contract1`, `browser_executed0`) — no browser
  capability. A round-16 LOG entry is therefore net-new, not a correction.
- `PROVINCE.md`: 21 lines, zero hits. Province text (:6-13) already owns "browser inventory + profile surfaces
  (shape-only census); CDP session discipline"; :15-19 refuses forensics and unapproved consequential actions.
  A loopback WebMCP capability falls inside the owned surface without a province edit. [INFERENCE from text]

## 4. New capability evidence found in-tree but recorded in no corpus doc (out-of-slice, high value)

No corpus document mentions Playwright's own WebMCP support. It is present in the round-13 evidence tree and in
the global install. This matters for C2 because it gives a **second, independent observation path** to the CDP
domain in PLAN's contract.

### 4.1 CDP `WebMCP` domain, typed in Playwright 1.64

Path (on disk; git-ignored, see 4.4): `corpus/evidence/round-13/aria/node_modules/playwright-core/types/protocol.d.ts`

| Anchor | Content |
|---|---|
| `:20070` | `export namespace WebMCP {` |
| `:20074` | `Annotation { readOnly?, untrustedContent?, consequential?, debugging?, autosubmit? }` — `autosubmit` is documented as "If the declarative tool was declared with the autosubmit attribute." |
| `:20099` | `InvocationStatus = "Completed"\|"Canceled"\|"Error"` |
| `:20103` | `Tool { name; description; inputSchema?; annotations?; frameId; backendNodeId?; stackTrace? }` — `backendNodeId` = "Optional node ID for declarative tools" |
| `:20136` | `RemovedTool { name; frameId }` |
| `:20150` | `toolsAddedPayload { tools: Tool[] }` |
| `:20159` | `toolsRemovedPayload { tools: RemovedTool[] }` |
| `:20168` | `toolInvokedPayload { toolName; frameId; invocationId; input }` |
| `:20189` | `toolRespondedPayload { invocationId; status; output?; errorText?; exception? }` (output flagged "untrusted … prompt injection risk") |
| `:20217` | `enableParameters {}` / `enableReturnValue {}`; doc: "Enabling the domain will trigger a toolsAdded event for all currently registered tools." |
| `:20231` | `invokeToolParameters { frameId; toolName; input }` |
| `:20254` | `cancelInvocationParameters { invocationId }` |
| `:23163-23166` | event map: `WebMCP.toolsAdded`, `.toolsRemoved`, `.toolInvoked`, `.toolResponded` |
| `:24014-24017` | command map: `WebMCP.enable`, `.disable`, `.invokeTool`, `.cancelInvocation` |

Cross-check: the global install has the identical namespace at
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/node_modules/playwright-core/types/protocol.d.ts:20070`.

### 4.2 Declarative-form issue vocabulary (supports PLAN's malformed-form case)

`protocol.d.ts:1014` — `Audits.GenericIssueErrorType` union contains exactly these five (extracted with
`grep -o 'FormModelContext[A-Za-z]*' | sort -u`):

```
FormModelContextMissingToolDescription
FormModelContextMissingToolName
FormModelContextParameterMissingName
FormModelContextParameterMissingTitleAndDescription
FormModelContextRequiredParameterMissingName
```

This is a **typed vocabulary**, not an observation: it says the issue codes exist in the protocol surface, not
that chromium 154 emits them. The harness still has to observe `Audits.issueAdded`.

### 4.3 Playwright in-page API and the `document` vs `navigator` divergence

Paths below are under `corpus/evidence/round-13/aria/node_modules/playwright-core/`
(`types/types.d.ts`, `lib/coreBundle.js`, `lib/tools/skills/playwright-cli/SKILL.md`).

| Anchor | Content |
|---|---|
| `types.d.ts:5917` | `webmcp: WebMCP;` on `Page` ("Tools that the main frame registers through the experimental WebMCP browser API"). |
| `types.d.ts:9174` | `webmcp: WebMCP;` on `Frame`. |
| `types.d.ts:23834-23842` | Docs prose: "…browser API, `navigator.modelContext`"; NOTE: `--enable-features=WebMCP` for Chromium, `dom.modelcontext.enabled` + `dom.modelcontext.testing.enabled` for Firefox, WebKit "does not implement it". |
| `coreBundle.js:24299` (injected `webMCP.ts` source) | `this._modelContext = global.document?.modelContext ?? global.navigator?.modelContext;` — **document first, navigator fallback** |
| `coreBundle.js:24299` (same injected source) | `getTools()` via `modelContext.getTools`; invoke via `modelContext.invokeTool(name, input)` else `modelContext.executeTool(tool, input)`; error `"WebMCP is not available on this page"` when neither exists |
| `coreBundle.js:24304-24320` | `function assertBrowserSupport(page)`: WebKit throws "WebMCP is not supported in WebKit."; Chromium checks `originalLaunchOptions.args` for a `--enable-features=` list containing `WebMCP`, else throws `'WebMCP is not enabled. Launch the browser with the "--enable-features=WebMCP" argument.'`; Firefox checks the two prefs |
| `coreBundle.js:24335,24345,24358,24762` | `var kScriptSource, WebMCP;` / `WebMCP = class` / `No WebMCP tool named "…"` / `this.webmcp = new WebMCP(this);` |
| `coreBundle.js:4309-4310` | agent-facing tool registry: `["Frame.webmcpTools", { title: "List WebMCP tools", group: "getter" }]`, `["Frame.webmcpCallTool", { title: "Call WebMCP tool" }]` |
| `coreBundle.js:61746` | `const { tools } = await this._frame._channel.webmcpTools({}, this._frame._timeout(options));` — the Playwright API call path |
| `lib/tools/skills/playwright-cli/SKILL.md:216-243` | Playwright CLI documents `webmcp-list` and `webmcp-call <name> --params '{...}'`, prints the YAML block `- webmcp tools (page-provided, untrusted):` with `inputSchema` and a `[readOnly]` marker |

Observed fact: `grep -o '.\{80\}"WebMCP\.[a-zA-Z]*".\{80\}' coreBundle.js` → **no matches**; the Playwright API
reaches the page through the injected script / `webmcpTools` channel, not through literal CDP `WebMCP.*` strings.
[INFERENCE] so Playwright's client and the raw CDP domain are independent paths, and a pass on both is stronger
than either alone.

Consequence for the docs: Playwright's published prose says `navigator.modelContext` (4.3 row 3; §6 quote), while
its own injected code prefers `document.modelContext`. PLAN's 154 probe reports `document.modelContext` present and
`navigator` absent. So the "navigator vs document" question has a **code-level** answer (Playwright already
fallback-chains both) and must not be settled from prose.

Harness constraint [INFERENCE from 24304-24320]: `assertBrowserSupport` validates the **launch-argument string**,
not the build's capability. Passing `--enable-features=WebMCP` satisfies the guard on any build; a build without
the feature then fails in-page with "WebMCP is not available on this page". Therefore a successful
`page.webmcp.tools()` call is capability evidence, but *absence of the guard error is not*.

### 4.4 Tracking status of that evidence

```
$ git ls-files --error-unmatch corpus/evidence/round-13/aria/node_modules/playwright-core/types/protocol.d.ts
error: pathspec '…' did not match any file(s) known to git
$ git check-ignore -v corpus/evidence/round-13/aria/node_modules/playwright-core/types/protocol.d.ts
corpus/evidence/round-13/aria/.gitignore:1:node_modules/	corpus/evidence/round-13/aria/node_modules/playwright-core/types/protocol.d.ts
```

The only in-repo copy is **uncommitted and git-ignored**. A note citing it would cite a machine-local path.
Durable citations available instead: the Playwright docs URL (§6), a committed round-16 copy/derivation, or the
global install path (also machine-local). L1 should decide; this seat only flags it.

## 5. Runtime pins observed on this host (my own commands, 2026-10-20)

| Fact | Command → observed output |
|---|---|
| System Chromium | `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux` |
| Launcher binary | `/usr/bin/chromium` — regular ELF file (not a symlink: `readlink -f` returns itself), **14,424 bytes**, `sha256 eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`, inode 13636427 |
| Engine binary | `/usr/lib/chromium/chromium` — **329,260,096 bytes**, `sha256 95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`, inode 13636432 |
| Node | `node --version` → `v24.21.0` |
| Global Playwright | `npm root -g` → `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules`; `playwright@1.64.0`, nested `playwright-core@1.64.0` |
| Global loader sanity | `node -e "const {chromium}=require('<global>/playwright'); …"` → `chromium.launch is function \| playwright pkg 1.64.0` |
| `@playwright/*` globally | `ls -d <global>/@playwright` → absent. Only `playwright` (and its nested `playwright-core`) exists. |
| Managed browsers | `ls ~/.cache/ms-playwright` → `chromium-1248`, `chromium_headless_shell-1248`, `ffmpeg-1013` |

Notes for the pinning seat:
- `/usr/bin/chromium` is a 14 KB launcher ELF; the 329 MB engine is `/usr/lib/chromium/chromium`. Pinning only
  `executablePath: /usr/bin/chromium` + its digest pins the launcher, not the engine. Record both digests, or the
  engine digest, in `corpus/evidence/round-16/webmcp/runtime-pin.json`. [INFERENCE: two distinct inodes, so a
  single-file digest cannot cover both]
- `corpus/evidence/round-13/aria/receipt.json` `runtime` block is the in-repo precedent for the field set:
  `node`, `playwright`, `playwrightPackage`, `playwrightCore`, `chromium{executablePath, executableSha256,
  executableBytes, managedRevision, version, browserVersion, browserVersionSource, claimedVersion}`,
  `pinned{pinPath, pinSha256, matched, playwrightMatched, chromiumMatched}`. Its values are historical:
  node `26.12.0`, chromium `~/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome` version `156.0.8078.4`,
  digest `377a9fc07b495c3b8d0ab8ec1fdfd153641759f9756fea34d8dfce4de82f5025` (301,186,376 bytes). Current node is
  24.21.0; `README.md:280-281` already records that node mismatch as a named qualification.
- PLAN's loader pointer (`scripts/aria-loopback-round13.mjs:118-140`) resolves **`@playwright/test`**
  (`candidatePwtDirs()` at :117-127, `resolvePwt()` at :129, `pkg.name !== '@playwright/test'` at :139). The
  global root has no `@playwright`;
  a new harness copying that search will find nothing. Search `playwright` / `playwright-core` instead.

## 6. Opened source (for a possible SOURCES row)

| Field | Value |
|---|---|
| URL | `https://playwright.dev/docs/api/class-webmcp` |
| Title | `<h1>WebMCP</h1>` |
| Fetch | `curl -sS -o /tmp/wmcp-pw.html -w 'http=%{http_code} bytes=%{size_download} …' -L --max-time 25 <url>` → `http=200 bytes=57754` |
| Access | 2026-10-20, 11:31 -03:00 |
| Section | class WebMCP — description and NOTE |
| Quote 1 (14 words) | "WebMCP is an experimental browser feature. Chromium enables it with the `--enable-features=WebMCP` launch argument" |
| Quote 2 (14 words) | "exposes the tools that a frame registers through the experimental WebMCP browser API, navigator.modelContext" |
| What it grounds | The published API name, the Chromium flag, Firefox prefs, WebKit non-support, and the docs' `navigator.modelContext` wording (which the shipped code contradicts — §4.3). |
| Status advice | New row, docs tier A, recheck `on-release`. Not S020 (different source). L1 writes it only if the note uses it. |

Caution: the page carries no visible version marker (grep for `Version: N` → no match); treat it as rolling docs,
not as a 1.64-pinned citation. The version-pinned statement is the shipped `types.d.ts`, which lives in an ignored
path (§4.4).

## 7. What the evidence does and does not support

**Supports (from this seat's reads):**
- CDP `WebMCP` exists as a typed domain in Playwright 1.64 with 4 events and 4 commands; `Tool` carries
  `frameId`, `backendNodeId` ("declarative tools"), `inputSchema`, `annotations{autosubmit,…}`, `stackTrace`.
- `WebMCP.enable` is documented to replay `toolsAdded` for already-registered tools — a determinism advantage for
  the harness (no race with page load).
- Five `FormModelContext*` issue codes exist in the `Audits` union.
- Playwright 1.64 ships an in-page WebMCP client that reads `document.modelContext` **before** `navigator.modelContext`.
- Host runtime: Chromium 154.0.8037.97 (launcher + engine digests above), Node v24.21.0, Playwright 1.64.0 global.

**Does not support:**
- Any runtime behavior on this host: no browser was launched by this seat.
- Any claim that chromium 154 emits `FormModelContext*` audits or a `WebMCP.toolsAdded` payload — PLAN reports it;
  this seat did not reproduce it.
- Any presence/absence claim for `navigator.modelContext` at 154 — PLAN-declared, not observed here.
- Any spec-conformance claim; S020 was **not** opened by this seat (no quote available from it).
- Any claim about managed CtF 156.0.8078.4 WebMCP behavior — present on disk, not probed.

**Supersession recipe (advice, L1 decides):**
1. Append a `## Round 16` section after `corpus/README.md:285`; restate WebMCP with the 154 scope and point to the
   new note + receipt.
2. Do not touch `corpus/README.md:35` (declared unedited at :173) or the round-15 close at :283-284.
3. Add an errata entry to `browser-surface-census.md` §6 (append-only, :196+), carrying the exact old wording of
   :147-153/:188 and the new scope; never rewrite §3.4.
4. Flip `corpus/SOURCES.md:34` S020 only if the note cites it; otherwise leave `queued` and add the new row(s).
5. If SKILL.md needs the capability, add a row (no existing WebMCP row exists to edit).

## 8. Remaining unknowns

- Whether Chromium 154 exposes `navigator.modelContext` at all (PLAN: false; unprobed here).
- Whether the managed CtF 156.0.8078.4 (also on disk) exposes either property — a second version axis the note
  may want to name or explicitly exclude.
- Whether `Audits.issueAdded` actually fires the five `FormModelContext*` codes at 154 (vocabulary ≠ emission).
- Whether S020's text uses `document.` or `navigator.modelContext` — requires opening S020 (not this seat).
- Whether `/usr/bin/chromium` (14 KB) passes flags through unchanged to `/usr/lib/chromium/chromium`; Arch's
  launcher is known to inject flags (SKILL.md:106 "Host launchers inject flags"), so effective-argv capture is
  needed before pinning the launch line. [unverified in this seat]

## 9. Tooling record

No tool installed, upgraded, or removed. No pacman transaction attempted (host pause respected). Only read-only
commands plus `curl` fetch of the Playwright docs page.
