# Round 17 — `## Gate` source rows (DRAFT, DraftLessonGate, wave 2)

Draft for L1 integration into `corpus/lessons/round-17.md` §Gate. Not admitted. Access date for every row:
**2026-10-20**. IDs S041–S053 match the registry rows already appended at `6c97851` (`corpus/SOURCES.md`,
rows 55–67; baseline `5859243` has no S041+ row). Quotes are ≤25 words, copied from the scout dossiers
(`.ufo/waves/round-17/sources/*.md`, `.ufo/waves/round-17/w1/Src*.md`) and re-checked this session against
freshly fetched bytes (see "Re-check" column). Where a dossier quote differs from the fetched bytes, the
in-bytes form is used and the change is stated.

## Rows opened this round (S041–S053)

| Row | URL | Access | Quote (verbatim, ≤25 words) | Location | sha256 (dossier) | Re-check 2026-10-20 | Pointer |
|---|---|---|---|---|---|---|---|
| S041 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | 2026-10-20 | "Unique identifier for this invocation. Response is sent before tool events." (11 words) | WebMCP.pdl line 68; tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d | decoded `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`; as-served base64 `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4` | decoded sha match; quote found | `sources/PdlInvoke.md:146`; `w1/SrcPdlInvoke.md:13-14` |
| S042 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT | 2026-10-20 | "It converts the input argument string to a JSON object, calls the function, receives a Promise, waits for the promise to resolve" (22 words) | model_context.cc:748-750; the source wraps this sentence over `//` comment lines, the `// ` prefixes are not part of the quote; tag 154.0.8037.97, commit b510e9d7…, blob c5ef637f | decoded `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`; as-served `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` | decoded sha match; quote found after removing `// ` prefixes | `sources/BlinkInvoke.md:131,141-145`; `w1/SrcBlinkInvoke.md:17-18` |
| S043 | https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | 2026-10-20 | "Despite the name of this API (i.e., WebMCP), this specification does not prescribe the format in which tools are exposed to the browser agent." (24 words) | index.bs:1570-1571 at commit 51ed7565 (the raw source carries `Web*MCP*` and `[=browser agent=]` markup; the rendered page reads the same words); dossier cited 1570-1572 | raw index.bs `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`; rendered `https://webmachinelearning.github.io/webmcp/` `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` | raw sha match; rendered sha match; quote found in rendered text with inline tags removed | `sources/SpecExecute.md:307`; `w1/SrcSpecExecute.md:73-74` |
| S044 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts | 2026-10-20 | "this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;" (code, 13 tokens) | WebMCPView.ts:945 at commit 66df492aaa0129d090937e933dd44c5389ab24d2 (Chromium 154 DEPS line 424) | raw `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` (59794 B) | raw sha match; quote found | `w1/SrcDevtoolsInvoke.md:55-61,129-130` |
| S045 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html | 2026-10-20 | "assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);" (code) | executeTool-abort.https.html line 87; tag 154.0.8037.97, commit b510e9d7… | decoded `faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e` (8013 B) | decoded sha match; quote found | `w1/SrcWebTests.md:31-35` |
| S046 | https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md | 2026-10-20 | "The browser mediates the call, invokes the tool's `execute` callback with the provided arguments" (14 words) | README.md:312 (§Lifecycle of a Tool Call, step 4) at commit 51ed7565; line number from dossier, text re-checked | raw README `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` (37575 B) | raw sha match; quote found | `sources/ExplainerExec.md:42,81-96` |
| S047 | https://developer.chrome.com/docs/ai/webmcp/imperative-api | 2026-10-20 | "This asynchronous method returns the result of the tool execution, or null when a navigation is triggered." (17 words) | §Execute tool (id `execute_tool`), paragraph 2 after the first code block; page "Last updated 2026-10-16" | `24239b8dc2eea46bda87fa2589b09b7d7fecd353f92cbec00980a81515ea3fbd` (189556 B) | **sha NOT reproducible**: three fetches gave three digests at equal length (see Re-check note 1); quote found in all | `w1/SrcChromeDocsInvoke.md:15,67` |
| S048 | https://developer.chrome.com/docs/devtools/application/webmcp | 2026-10-20 | "The result of the invocation (Completed, Canceled, In Progress, or Error.)" (11 words) | §Invoked tools (id `invoked-tools`), Status bullet; page "Last updated 2026-05-12" | `9bd94f4182619b9eb7bc83c127d58a4de41da691e25ca867ffa3f419d83a87e5` (191224 B) | **sha NOT reproducible** (note 1); quote found in all | `w1/SrcChromeDocsInvoke.md:16,68` |
| S049 | https://docs.jj-vcs.dev/v0.45.1/git-compatibility/ | 2026-10-20 | "`jj` commands will usually put the Git repo in a "detached HEAD" state" (13 words; backticks as in the raw file) | `docs/git-compatibility.md:114-115` at tag v0.45.1 (commit 7c41cdeb16b6b321c64e789a966b6adf723816a5), §Colocated Jujutsu/Git workspaces ¶5. Dossier cited 113-115; line 113 is not part of the quote | HTML `5362168d6cd398ea2f6a2d9ed6cad2807f356ee2e8800b277767c2f0987c0367` (58508 B); raw md `0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641` (12284 B) | HTML sha match; raw sha match; quote found in raw and HTML | `sources/JjColocation.md:10-35`; `w1/SrcJjColocation.md:10-18` |
| S050 | https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md | 2026-10-20 | "In colocated workspaces, `jj workspace update-stale` now correctly resets the Git HEAD to the parent of the fresh working-copy commit." (20 words; backticks as in the raw file) | CHANGELOG.md:96-97 at tag v0.45.1. Dossier quote dropped the backticks; the in-bytes form is used here | `05c34fb8d81f4de624c4f6754f6e31abdee14942ce3f32cc6925b7775b393c76` (212175 B) | sha match; in-bytes quote found after joining the wrapped line | `sources/JjColocation.md:36-53` |
| S051 | https://git-scm.com/docs/git-symbolic-ref | 2026-10-20 | "Do not issue an error message if the <name> is not a symbolic ref but a detached HEAD; instead exit with non-zero status silently." (24 words) | Documentation/git-symbolic-ref.adoc:41-43 at git v2.56.0 (dossier line numbers; substring re-checked, line numbers not re-counted) | HTML `d706904473082a0ef07ed8eedd2c4d94be25dac852e58ff3b017048828c38872` (28804 B); raw adoc `c852e74cba71e5b574205fd4f0ba18817f38be0ab5447435754a326480b60692` (2372 B) | HTML and raw sha match; quote found in both | `sources/JjColocation.md:55-70` |
| S052 | https://git-scm.com/docs/git-rev-parse | 2026-10-20 | "This will error out if $REV is empty or not a valid revision." (13 words) | Documentation/git-rev-parse.adoc:504 at git v2.56.0 (dossier line; substring re-checked) | HTML `1e84fc200220b2cd356b78f2344766ee7cbaafa8bcef64679dbf47ec585f19da` (122459 B); raw adoc `4d8e9aca13f6ea6808272eb44e417687a5cca7d23cf1ed311f25e9fdeb148902` (17036 B) | HTML and raw sha match; quote found in both | `sources/JjColocation.md:71-86` |
| S053 | https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | 2026-10-20 | "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words) | `<meta name="description">` and listing summary; publisher "Offered by François Beaufort" | `085c40b7d1bae1b3012c3bcf3dc74c1762f8c096136c0b6fa22e302069848a4c` (649153 B) | **sha NOT reproducible** (dynamic listing, note 1); quote found in all | `w1/SrcChromeDocsInvoke.md:20,69` |

Notes to the rows:

1. **Digest stability.** `developer.chrome.com` and `chromewebstore` bodies change between consecutive fetches
   at the same URL (same-day, same UA): S032 gave `2a30b60b…`, then `fa3c3efe…` and `788abc73…`; S047, S048 and S053
   likewise. Their recorded sha256 binds only the scout's snapshot. Quotes reproduce in every fetch. The lesson
   must say "sha256 of the fetched snapshot, not reproducible on re-fetch" for these rows, not present them as
   stable digests. The Gate-level cell for each is `[snapshot]`.
2. **S046 URL.** The dossier's Gate line cites `blob/main/README.md`; the registry row at `6c97851` pins
   `blob/51ed7565…/README.md`. The pinned URL is used here.
3. **S053 status.** The scout proposed `queued` (optional corroboration, `w1/SrcChromeDocsInvoke.md:57`). At `6c97851` the
   row is `rejected` (`corpus/SOURCES.md:67`). The lesson must log this as queued→rejected with the reason from the row.

## Re-opened row — S032 (`corpus/SOURCES.md:46`)

| Row | URL | Access | Quote (verbatim) | Location | sha256 | Verdict |
|---|---|---|---|---|---|---|
| S032 (re-open) | https://developer.chrome.com/docs/ai/webmcp | 2026-10-20 | "Chrome Extensions can query and execute WebMCP tools" (8 words) | §Imitate an agent to test your tools (id `imitate_an_agent_to_test_your_tools`), byte 122198 in the fetched body; page "Last updated 2026-10-07" | `2a30b60b51dc4a758b006fc168c3fa1f348c59914d9932c6dbda4703f007786b` (145261 B), snapshot (note 1) | **held, no edit, no supersede.** The three S032 claims (origin trial from Chrome 149; `chrome://flags/#enable-webmcp-testing`; tools Permissions Policy default `self`) still appear on the page. The registry row at `6c97851` is byte-identical to baseline `5859243` (verified by diff). |

Pointers: `w1/SrcChromeDocsInvoke.md:24-34` (§2 S032 re-open), `:70` (quote table row).

## Registry transitions (old→new, in-place cells only)

Baseline `5859243` → `6c97851` (verified by `git show` + diff of `corpus/SOURCES.md` rows beginning `| S0`):

- Rows appended: S041–S053 (13 rows; 0 baseline rows removed or changed; S032 identical).
- Totals at `6c97851`: 53 rows; mined 41, queued 6, rejected 6. Baseline census (PLAN.md:7): 40 rows, mined 33 / queued 2 / rejected 5.

Transitions relative to the dossier drafts (the brief stated "none in place"; this is not what the committed registry shows):

- `S041–S048`: drafted `queued` by the dossiers → **`mined` at `6c97851`**, used-by
  `corpus/knowledge/webmcp-invocation-round-17.md`. That path exists at `6c97851` and cites S041–S048 (`git show`
  lines 1–8). Log as: `queued→mined`, `used-by —→corpus/knowledge/webmcp-invocation-round-17.md`.
- `S049–S052`: `queued`, used-by `—` at `6c97851` (matches the brief and PLAN.md:217). They stay queued until
  `corpus/lessons/round-17.md` exists; that file is absent at `6c97851`. Log as "no transition this round".
- `S053`: drafted `queued` → `rejected` at `6c97851`. Log as `queued→rejected`, reason per row.
- `S032`: no transition (re-open held).

## Re-check record (this seat, 2026-10-20)

- Fetched 18 bodies with `python3` + stdlib `urllib` (no browser, no tool install). Decoded gitiles base64 where `?format=TEXT`.
- Checked each quote as a substring after whitespace normalisation and tag removal. Two quotes needed a stated
  transform: S042 (C++ `// ` comment prefixes at a line break) and S049/S050 (backtick code spans present in the raw file, which the dossier had dropped).
- Did not re-count line numbers for S046, S051, S052 (dossier line numbers, substring verified only).
