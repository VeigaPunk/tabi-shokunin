# Round 17 — lane-tip anchored gates, WebMCP invocation receipt, checked adjacency map

Steered round 17, attempt 1, 2026-10-20 (hyaku phase 2). Baseline
`5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean lane). Measured revision
`93bfead1f5f25f584353df3152a60209bbd89a2e` (wave-2 repairs landed; first integration
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d`). C1 operability 8 (lowest tie): jj lane-tip
anchoring of the round gates. C2 coverage 9 + capability `webmcp-cdp-invocation`, sourced by
S041–S048 opened this round. C3 adjacency 8 (lowest tie): checked sibling-overlap map. No
exploratory claim; no scalar moves (wave-2 `w2/CriticScalars.md`). The L1 session was resumed
once under its own identity after an Anthropic 429 (parent steer); three wave-1 seats were
revived by message, none respawned.

## Gate

Author-side admission criteria (an unrun check has not passed):

- admit C1 only if `node .ufo/waves/round-17/measure-c1.mjs REV` gives 0 at baseline and 4 at the
  measured revision, where an entry counts only if a jj-like detached HEAD on a poison commit
  (arm B) and the jj-real state `checkout -f --detach P` (arm B2) leave its exit/output and every
  printed revision equal to the branch tip, moving the branch to P changes its verdict (arm C,
  labels normalised), and the static HEAD-operand residue of its gate is 0. Four witness entries
  are label-only (arm C differs only in revision labels) and are not credited.
- admit C2 only if `measure-c2.mjs` counts 1: note cites mined A/B rows absent at baseline and
  non-own-work, receipt producer digest = committed harness, 11 unique required cases and 4
  required controls all pass with fixture digests bound and predicate digests found in the harness
  source, summary recomputed, runs with pid/argv/gone, no external request, README row present —
  and 17 counter-owned forgeries count 0.
- admit C3 only if `measure-c3.mjs` re-derives every row itself (quote on the pinned sibling line,
  pin reachable from the sibling's master/main tip, tabi quote on its `path:line`, venue rules,
  one sibling line counts once, ASCII surfaces) and agrees with `scripts/check-adjacency.mjs`.
- rejected: operability 8→9 and adjacency 8→9 (USER 6/10 red; no outside execution; only 1 of 10
  rows arbitrated and that by the integrator; 4 contested rows rest on tabi-filed L0 questions —
  `w2/CriticScalars.md`); coverage 9→10 (real-site, agent-side, Chromium 152, default profile
  open); a `PROVINCE.md` append (census-frozen: `corpus/evidence/pstack-20261015/baseline-census.tsv:24`,
  sandbox `history_rewritten`, `w1/RevHarmPlan.md` H1); fixing `check-freshness --witness HEAD` in
  code (byte-frozen by `protectedPath` in both round gates and the census; `w1/RevF6Repro.md`);
  the kasegi "CDP browser submissions" row (a shared operator gate, not a route — `w2/AdjRow8.md`);
  calling the probes or counters "unforgeable".

Measured (`corpus/evidence/round-17/measurements.json`; binding manifest
`corpus/evidence/round-17/measurement-binding.json`):

| Claim | Before (5859243) | After (93bfead) | Detail |
|---|---|---|---|
| C1 `c1_anchor_safe` | 0 | 4 | label-only 4 not credited; residue 20/31/1 → 0/0/0 |
| C2 `c2_invocation_held` | 0 | 1 | 15 fixture-bound cases+controls, 15 predicate digests bound, 17 probes 0 |
| C3 `c3_adjacency_verified` | 0 | 10 | ruled 1 (integrator ruling, `c3_self_ruled` 1), contested-open 4 (all on tabi-filed L0 lines 62/65, `c3_self_filed_questions` 4), split-declared 2, refused-route 3 |

### Sources opened this round (CORPUS SOURCES rule 1)

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

Digest note: developer.chrome.com and chromewebstore bodies change per response (CSP nonce,
feature arrays); S047, S048, S053 digests bind one snapshot only — content is checked by quote
and stable byte offsets (`w2/ReopenS047.md`, `w2/ReopenS048.md`).

Corrections appended after wave-2 non-author re-opens (rule 2, new rows; no cell edited in place):

| Row | Supersedes | Why | Re-open |
|---|---|---|---|
| S054 | S047 | quote is the first paragraph before the first code block; `teaches` claimed a 154 string rule the page never states | `w2/ReopenS047.md` |
| S055 | S049 | quote is ¶3 of §Colocated workspaces, not ¶5 | `w2/ReopenS049.md` |
| S056 | S050 | "HEAD equals a bookmark only by coincidence" is not in the source; after `jj new master` HEAD = @- = master by construction | `w2/ReopenS050.md` |
| S057 | S053 | rejection premise false: developer is Google Ireland, Ltd. (offered by François Beaufort); re-grounded as "adds no invocation contract" | `w2/ReopenS053.md` |

Re-opened, held: | S032 (re-open) | https://developer.chrome.com/docs/ai/webmcp | 2026-10-20 | "Chrome Extensions can query and execute WebMCP tools" (8 words) | §Imitate an agent to test your tools (id `imitate_an_agent_to_test_your_tools`), byte 122198 in the fetched body; page "Last updated 2026-10-07" | `2a30b60b51dc4a758b006fc168c3fa1f348c59914d9932c6dbda4703f007786b` (145261 B), snapshot (note 1) | **held, no edit, no supersede.** The three S032 claims (origin trial from Chrome 149; `chrome://flags/#enable-webmcp-testing`; tools Permissions Policy default `self`) still appear on the page. The registry row at `6c97851` is byte-identical to baseline `5859243` (verified by diff). |

Registry transitions: rows S041–S057 appended (S041–S048, S054 `mined` with used-by
`corpus/knowledge/webmcp-invocation-round-17.md`; S049–S052, S055, S056 `queued`, used-by `—`,
because this lesson lands after the measured revision and the jj rows cite no knowledge note —
they are cited here and in `SKILL.md` round 17 and become `mined` when a round flips them;
S053, S057 `rejected`). No baseline row changed.

Census: start (5859243) `validate` exit 0 — rows 40, A31/B4/C5, mined33/queued2/rejected5. After
(93bfead) `validate` exit 0 — rows 57, A46/B4/C7, mined42/queued8/rejected7.

## Mistakes

| # | Class | Evidence pointer | Captured-by | Fix (shown able to fail) |
|---|---|---|---|---|
| 1 | Gates certified git `HEAD`, which jj owns and may detach onto an empty or snapshot-only commit | fleet `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` F1–F3; `.ufo/waves/round-17/w1/C1JjRealProbe.md` (baseline gates clean or red on off-branch HEAD) | none | laneTip in three gates + QUALITY 29; red at baseline bytes: `lane_tip_detached_head` (`w1/GateRoundAnchor.md`), `detached_head_reads_lane_tip` (`w1/GateUserAnchor.md`), six binding cases (`w1/GateBindAnchor.md`); counter 0 at baseline; real jj at 93bfead's parent: `w2/JjRealAfter.md` |
| 2 | Evidence rooted only in `/tmp` (round-16 liar probe) | `corpus/lessons/round-16-verifier-spotcheck.md:148` | none (QUALITY 25 covers counter trust, not roots) | `corpus/evidence/round-17/routed/liar/` blobs + bundle + generator; QUALITY 28; fails on one changed blob byte or a deleted bundle (`w2/ReRunLiar.md`) |
| 3 | Run claimed at a revision with no committed receipt | spot-check `:150` | QUALITY 22 (partly) | `routed/binding-hardened/check-at-1205d26.json`; QUALITY 26 |
| 4 | Receipts produced by a superseded gate cited as current | spot-check `:149` | none | `routed/binding-hardened/` at the registered blob + history index; QUALITY 30 (the r16 receipts' `5150611c…` ≠ registered `1f84fb54…` is the red case) |
| 5 | Probe strength stated absolutely ("unforgeable", an uncommitted author-summary word paraphrased at spot-check `:76`) — and repeated in kind this round: C2 and C3 counters first certified forged receipts/maps | `w2/ForgeC2Counter.md` (12 survivors), `w2/ForgeC3Checker.md` (4), `w2/MutC1Counter.md` (1) | QUALITY 25 (counters only) | QUALITY 27; repaired counters: all 23 C2 forgeries → 0, C3 survivors → `duplicate_row`/`surface_charset`/`ruling_ref_invalid`, the `..HEAD` mutant drops C1 to 2 (`w1/C1Counter.md` Wave-2 repair) |
| 6 | Wrong attributions in this round's own plan: "unforgeable" called a round-16 report word; README frontier cited `:308-309` (it is `:303`) | `w2/CriticQualityDraft.md`; `w1/DraftReadme.md` | QUALITY 28 | corrected here and in the README append |
| 7 | Adjacency map over-claimed: a `refused-route` row with no route to the sibling (kasegi), and the note said the map recorded the invocation reading | `w2/AdjRow8.md`; `w2/RevNoteVsReceipt.md` F5 | none (the checker certifies citations, not semantics) | row dropped; note corrected; QUALITY 32 states the limit; two further real overlaps (revenger, kama) filed as fleet L0 line 65 |
| 8 | Planned an append to a census-frozen file (`PROVINCE.md`) | `w1/RevHarmPlan.md` H1, `w1/ConnProvinceRuling.md` | `check-round-contract` census loop (sandbox `history_rewritten`) | recorded in README/SKILL/map instead |
| 9 | Source rows minted with locator/teaches errors (S047, S049, S050, S053) | `w2/Reopen*.md` | CORPUS rule 1 non-author re-open | S054–S057 |

## Routed defects from the round-16 spot-check

1. liar probe rooted: done (`corpus/evidence/round-17/routed/liar/`, re-run `w2/ReRunLiar.md`).
2. hardened-gate receipts: done (`routed/binding-hardened/{selftest,legacy-r15}.json`, history index).
3. delivered-HEAD receipt: done for round 16 (`check-at-1205d26.json`); round 17's own lands at round end.
4. census U3 pointer: README index row (the note is sha-pinned; no in-file pointer is possible — residual).
5. integrator ruling recorded: `corpus/adjacency.tsv` row `cdp-runtime-observation` + SKILL round 17;
   `PROVINCE.md` cannot carry it (census-frozen). kaidoku's half (cite tabi) is still open at kaidoku.

## Adjacency

Map: 10 rows, 7 siblings. Known overlaps left undispositioned: kaidoku `PROVINCE.md:128`
(verbs; same surface as row 1), kagi `corpus/adjacency.tsv:83` (NMH manifest inside kake's lease),
lore and tameshi routes (wave scratch only, not province-level), game-dev-3d roster mention, kasegi
operator-gated CDP submissions (shared operator gate). Fleet L0 lines 62 (musketeer lease) and 65
(ruling reach to revenger and kama) are open; tabi absorbs neither.

## Seats

Wave 1: 86 seats (scout 22, executor 19, reviewer 12, scribe 9, connector 8, critic 6, revenger 4,
sentinel 2, mutation-tester 2, simplifier 2), all delivered; dispatch refused once (job cap 100),
spawned on retry 2. Wave 2: 78 seats (scout 24, reviewer 23, executor 8, critic 7, scribe 5,
mutation-tester 4, sentinel 3, connector 3, revenger 1); dead seats are listed in the fleet report
(zai glm-5.3-flash 429 retry exhaustion; one sentinel refused by the provider's cyber filter).
