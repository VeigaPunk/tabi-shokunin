# ScoutUsedBy — C3 citation map (round 29, wave w1)

Scope: every line under `corpus/knowledge/` and `SKILL.md` that cites one of the 23 on-release rows pinned at Chromium 154.0.8037.97. Method: `git show <rev>:<path>` over all files, token match `S0nn` (word-boundary) plus range expansion (`S041–S042`, `S077–S083`, `S033–S035`); commands in `m.py` (scratch, removed). Primary revision **856fa9e** (baseline, claims-frozen state); a second pass at HEAD **190052c** (round-29 C3 commit) shows what was added. The `claim` column is the cited line verbatim (inline backticks stripped, truncated at 190 chars). Line numbers are baseline line numbers; the append-only notes in HEAD only add lines at file ends, so baseline numbers stay valid at HEAD.

Not mechanical: a hit means the id token (or a range covering it) appears on that line; it does not prove the line depends on the 154 bytes (e.g. SKILL.md :1873 cites S033 as spec-agreement context).

## Used-by cell vs actual citers (baseline SOURCES.md)

| id | SOURCES used-by cell | citing files found by grep (baseline, knowledge + SKILL.md) | notes |
|---|---|---|---|
| S033 | webmcp-chromium-loopback-round-16.md | SKILL.md, source-recheck-round-18.md, webmcp-chromium-loopback-round-16.md |  |
| S034 | webmcp-chromium-loopback-round-16.md | SKILL.md, source-recheck-round-18.md, webmcp-chromium-loopback-round-16.md |  |
| S041 | webmcp-invocation-round-17.md | SKILL.md, source-recheck-round-18.md, webmcp-declarative-validation-round-19.md, webmcp-invocation-round-17.md |  |
| S042 | webmcp-invocation-round-17.md | source-recheck-round-18.md, webmcp-invocation-round-17.md |  |
| S045 | webmcp-invocation-round-17.md | source-recheck-round-18.md, webmcp-invocation-round-17.md |  |
| S062 | harness-hardening-round-18.md | SKILL.md, harness-hardening-round-18.md |  |
| S064 | harness-hardening-round-18.md | SKILL.md, harness-hardening-round-18.md |  |
| S071 | source-recheck-round-18.md | SKILL.md, harness-hardening-round-18.md, source-recheck-round-18.md |  |
| S074 | source-recheck-round-18.md | SKILL.md, source-recheck-round-18.md |  |
| S077 | webmcp-declarative-validation-round-19.md | SKILL.md, webmcp-declarative-validation-round-19.md |  |
| S078 | webmcp-declarative-validation-round-19.md | SKILL.md, webmcp-completion-lifecycle-round-20.md, webmcp-declarative-validation-round-19.md |  |
| S079 | webmcp-declarative-validation-round-19.md | SKILL.md, webmcp-declarative-validation-round-19.md |  |
| S080 | — | webmcp-declarative-validation-round-19.md | used-by is `—` |
| S081 | — | webmcp-declarative-validation-round-19.md | used-by is `—` |
| S093 | — | (none) | used-by is `—` ; no knowledge/SKILL.md citer |
| S094 | corpus/lessons/round-19.md | (none) | used-by is lessons/round-19.md (outside scan scope); no knowledge/SKILL.md citer; row is REJECTED/C (HTTP 404 body) |
| S096 | webmcp-declarative-validation-round-19.md, webmcp-completion-lifecycle-round-20.md | SKILL.md, webmcp-completion-lifecycle-round-20.md, webmcp-declarative-validation-round-19.md |  |
| S097 | webmcp-declarative-validation-round-19.md | webmcp-declarative-validation-round-19.md |  |
| S098 | — | webmcp-declarative-validation-round-19.md | used-by is `—` but validation note :156 cites it; cited also corpus/README.md:426, corpus/lessons/round-19.md:133,166-168 |
| S099 | webmcp-declarative-validation-round-19.md | webmcp-declarative-validation-round-19.md |  |
| S100 | webmcp-completion-lifecycle-round-20.md, webmcp-nonautosubmit-round-21.md, webmcp-nonautosubmit-round-21-corrected.md | SKILL.md, webmcp-completion-lifecycle-round-20.md, webmcp-nonautosubmit-round-21-corrected.md, webmcp-nonautosubmit-round-21.md |  |
| S105 | navigation-history-bfcache-evidence.md | bfcache-runtime-observed-round-25.md, navigation-history-bfcache-evidence.md |  |
| S106 | bfcache-runtime-observed-round-25.md | SKILL.md, bfcache-runtime-observed-round-25.md |  |

## Rows whose used-by is `—` at baseline (4)

S080, S081, S093, S098. (S094 has used-by `corpus/lessons/round-19.md`, no knowledge/SKILL.md citer.) Citers at baseline: S080 and S081 appear only through the range `S077–S083` in the recheck cell at webmcp-declarative-validation-round-19.md:9 (a recheck-cadence line, no claim) and in corpus/lessons/round-19.md:36-37 (outside scope); S093 has no citer in knowledge/SKILL.md (corpus/lessons/round-19.md:49,158 only; LOG.md:1107 range); S098 is cited at webmcp-declarative-validation-round-19.md:156 (plus corpus/README.md:426, corpus/lessons/round-19.md:133,166-168). S080 and S081 DRIFTED at 156 (→ S112, S113): their only knowledge-side citer is the :9 recheck line, which the validation note's round-29 block covers.

## Drifted rows (per committed `chromium-156-release-pin-recheck.md` table at 190052c) and their baseline citers

| drifted row | superseded by | baseline citers (file:line) | carries round-29 note at HEAD? |
|---|---|---|---|
| S042 | S109 | source-recheck-round-18.md: 1,91,104,110,172; webmcp-invocation-round-17.md: 2,11,71,73 | source-recheck-round-18.md=yes; webmcp-invocation-round-17.md=yes |
| S071 | S110 | SKILL.md: 1972,1995,2011,2046; harness-hardening-round-18.md: 86; source-recheck-round-18.md: 157,172 | SKILL.md=NO; harness-hardening-round-18.md=yes; source-recheck-round-18.md=yes |
| S078 | S111 | SKILL.md: 2053,2065,2070,2077,2079,2081,2312; webmcp-completion-lifecycle-round-20.md: 1,15,86,151; webmcp-declarative-validation-round-19.md: 2,9,40,106,114,129,130 | SKILL.md=NO; webmcp-completion-lifecycle-round-20.md=yes; webmcp-declarative-validation-round-19.md=yes |
| S080 | S112 | webmcp-declarative-validation-round-19.md: 9 | webmcp-declarative-validation-round-19.md=yes |
| S081 | S113 | webmcp-declarative-validation-round-19.md: 9 | webmcp-declarative-validation-round-19.md=yes |
| S096 | S114 | SKILL.md: 2160,2165,2172,2174,2176,2210,2217,2218,2219,2220,2221,2222,2223,2224…; webmcp-completion-lifecycle-round-20.md: 1,15,29,30,31,32,33,34,35,36,37,38,40,42…; webmcp-declarative-validation-round-19.md: 129 | SKILL.md=NO; webmcp-completion-lifecycle-round-20.md=yes; webmcp-declarative-validation-round-19.md=yes |
| S100 | S115 | SKILL.md: 2210,2227,2243,2283,2308,2311,2366,2383; webmcp-completion-lifecycle-round-20.md: 1,15,39,42,48,50,52,86,90,122,147,150; webmcp-nonautosubmit-round-21-corrected.md: 1,15,21,32,33,34,35,36,38,39,40,41,42,43; webmcp-nonautosubmit-round-21.md: 1,15,21,32,33,34,35,36,38,39,40,41,42,43 | SKILL.md=NO; webmcp-completion-lifecycle-round-20.md=yes; webmcp-nonautosubmit-round-21-corrected.md=yes; webmcp-nonautosubmit-round-21.md=yes |

7 drifted rows at 156 per the committed note table (rows S042 S071 S078 S080 S081 S096 S100); 16 hold (S033 S034 S041 S045 S062 S064 S074 S077 S079 S093 S094 S097 S098 S099 S105 S106).

**SKILL.md cites drifted rows and carries no round-29 note at HEAD** (SKILL.md unchanged between 856fa9e and 190052c): drifted-row citations in SKILL.md are listed in the table below (S071 :1995; S078 :2053,:2065; S096/S100 where cited; S042 where cited) — gap per killRule ("any drifted row whose citing knowledge entries carry no round-29 recheck note").

## Citation map (one row per id, citing path:line, claim)

| id | path:line | claim (cited line) |
|---|---|---|
| S033 | SKILL.md:1873 | \| Which object? \| model-context-location \| document.modelContext (spec S020 §4.1 and 154 IDL S033 agree); any navigator.modelContext text is wrong (S038, S039 rejected) \| |
| S033 | SKILL.md:1875 | \| Is a declarative tool spec behaviour? \| S030, S031 \| No: Chromium-only surface; cite the receipt and S033–S035, never S020 \| |
| S033 | SKILL.md:1890 | - Declarative tools cite S030/S031/S033 and the receipt, never S020. |
| S033 | corpus/knowledge/source-recheck-round-18.md:1 | source: S001 S002 S003 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S0… |
| S033 | corpus/knowledge/source-recheck-round-18.md:83 | \| S033 \| mined / A \| base64 \| 200 \| 520 \| 9c0d5822fbae \| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_co… |
| S033 | corpus/knowledge/source-recheck-round-18.md:110 | - **Pinned** (URL names a commit, tag or fixed revision): e.g. S033, S034, S036, S041–S042, S044–S046, S055–S056 and S043. The served bytes should match the named revision, but the receipt r… |
| S033 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:5 | source: S033 |
| S033 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:82 | \| Question \| Spec / proposal (S020, S030, S031) \| Chromium 154 observed / declared (receipt, S033, S035) \| Verdict \| |
| S033 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:84 | \| Entry point \| partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; } (§4.1; read at rev cb3d1696; an editor-only rev 51ed7565 appeared l… |
| S034 | SKILL.md:1875 | \| Is a declarative tool spec behaviour? \| S030, S031 \| No: Chromium-only surface; cite the receipt and S033–S035, never S020 \| |
| S034 | corpus/knowledge/source-recheck-round-18.md:1 | source: S001 S002 S003 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S0… |
| S034 | corpus/knowledge/source-recheck-round-18.md:84 | \| S034 \| mined / A \| base64 \| 200 \| 310220 \| 3dc33e9d2e40 \| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enable… |
| S034 | corpus/knowledge/source-recheck-round-18.md:110 | - **Pinned** (URL names a commit, tag or fixed revision): e.g. S033, S034, S036, S041–S042, S044–S046, S055–S056 and S043. The served bytes should match the named revision, but the receipt r… |
| S034 | corpus/knowledge/source-recheck-round-18.md:175 | \| S074 \| S034 \| Source-file token absence does not by itself establish runtime inertness. w2/LiveS034.md. \| |
| S034 | corpus/knowledge/source-recheck-round-18.md:187 | a new sentence; S034 status is line7035; S036's no-toolsRemoved description is navigation-scoped, |
| S034 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:6 | source: S034 |
| S034 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:46 | WebMCP is experimental and implied_by WebMCPTesting (S034, lines 7023-7035). S034 |
| S034 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:48 | shown by the flags probe and a wave-2 re-run (.ufo/waves/round-16/w2/ReopenS034.md), not by |
| S034 | corpus/knowledge/webmcp-chromium-loopback-round-16.md:49 | S034 alone (the binary contains a kDeclarativeWebmcp string whose declaration is unresolved). |
| S041 | SKILL.md:1954 | \| Did the tool run because invokeTool returned an id? \| No — the id precedes tool events (S041 line 68); read toolResponded.status \| |
| S041 | corpus/knowledge/source-recheck-round-18.md:1 | source: S001 S002 S003 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S0… |
| S041 | corpus/knowledge/source-recheck-round-18.md:90 | \| S041 \| mined / A \| base64 \| 200 \| 5292 \| 0ea9bf3f3d06 \| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/W… |
| S041 | corpus/knowledge/source-recheck-round-18.md:110 | - **Pinned** (URL names a commit, tag or fixed revision): e.g. S033, S034, S036, S041–S042, S044–S046, S055–S056 and S043. The served bytes should match the named revision, but the receipt r… |
| S041 | corpus/knowledge/source-recheck-round-18.md:136 | - **S053 → S057.** Same Chrome Web Store listing URL. S057 records a developer name and a Chrome 150.0.7861.0 floor, and states that the listing adds no invocation contract beyond S048 and S… |
| S041 | corpus/knowledge/webmcp-declarative-validation-round-19.md:155 | canonical-identity row for the object input declaration used in :66-67; it explicitly reuses S041 bytes. |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:1 | source: S041 |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:11 | recheck: on chromium package change; S041/S042/S044/S045 on-release (tag-pinned); S043/S046/S047/S048/S054 on-release |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:71 | \| "invokeTool returned an id, so the tool ran" \| the id alone \| **no**: the command answers before tool events (S041 line 68; S042 posts execution without waiting); outcome is toolRespond… |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:75 | \| "toolResponded identifies tool and session" \| — \| **no**: it carries invocationId/status/output/errorText/exception only; pair through toolInvoked (S041; S044 binds by id) \| |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:85 | \| Agent-side invocation format \| not prescribed (S043 index.bs:1570-1572) \| CDP WebMCP.invokeTool (S041) \| build-scoped, Chromium-only \| |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:88 | \| Error mapping \| DOMException names (S043 :260-301) \| CDP Error + exception RemoteObject with errorText separate (S041 lines 115-122); empty errorText observed (receipt) \| different lay… |
| S041 | corpus/knowledge/webmcp-invocation-round-17.md:89 | \| Status vocabulary \| DevTools UI adds "In Progress" (S048) \| protocol Completed/Canceled/Error (S041) \| key predicates on the protocol enum \| |
| S042 | corpus/knowledge/source-recheck-round-18.md:1 | source: S001 S002 S003 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S0… |
| S042 | corpus/knowledge/source-recheck-round-18.md:91 | \| S042 \| mined / A \| base64 \| 200 \| 66824 \| 039e24a0a954 \| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_… |
| S042 | corpus/knowledge/source-recheck-round-18.md:104 | Quote source locations: for S018, S029, S035 and S043 the receipt's quoteSource is new (the quote was chosen in round 18, not taken from an earlier lesson). S042's quote differs from its rou… |
| S042 | corpus/knowledge/source-recheck-round-18.md:110 | - **Pinned** (URL names a commit, tag or fixed revision): e.g. S033, S034, S036, S041–S042, S044–S046, S055–S056 and S043. The served bytes should match the named revision, but the receipt r… |
| S042 | corpus/knowledge/source-recheck-round-18.md:172 | \| S071 \| S042 \| No declared-inputSchema validation was evidenced for **imperative ExecuteV8Tool**; declarative FormMCPSchema::FillData rejects unknown parameters and invalid supported val… |
| S042 | corpus/knowledge/webmcp-invocation-round-17.md:2 | source: S042 |
| S042 | corpus/knowledge/webmcp-invocation-round-17.md:11 | recheck: on chromium package change; S041/S042/S044/S045 on-release (tag-pinned); S043/S046/S047/S048/S054 on-release |
| S042 | corpus/knowledge/webmcp-invocation-round-17.md:71 | \| "invokeTool returned an id, so the tool ran" \| the id alone \| **no**: the command answers before tool events (S041 line 68; S042 posts execution without waiting); outcome is toolRespond… |
| S042 | corpus/knowledge/webmcp-invocation-round-17.md:73 | \| "Chromium validated the input against inputSchema" \| — \| **no**: mismatching input ran (invoke-input-schema-mismatch); the 154 Blink invoke path checks only JSON syntax and is-object (S… |
| S045 | corpus/knowledge/source-recheck-round-18.md:1 | source: S001 S002 S003 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S0… |
| S045 | corpus/knowledge/source-recheck-round-18.md:94 | \| S045 \| mined / A \| base64 \| 200 \| 10684 \| b1300c0657f1 \| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imp… |
| S045 | corpus/knowledge/source-recheck-round-18.md:110 | - **Pinned** (URL names a commit, tag or fixed revision): e.g. S033, S034, S036, S041–S042, S044–S046, S055–S056 and S043. The served bytes should match the named revision, but the receipt r… |
| S045 | corpus/knowledge/webmcp-invocation-round-17.md:5 | source: S045 |
| S045 | corpus/knowledge/webmcp-invocation-round-17.md:11 | recheck: on chromium package change; S041/S042/S044/S045 on-release (tag-pinned); S043/S046/S047/S048/S054 on-release |
| S045 | corpus/knowledge/webmcp-invocation-round-17.md:97 | - Cross-origin iframes, Canceled from page-side abort, and upstream web-test expectations (S045) are not re-run here. |
| S062 | SKILL.md:1972 | c0aff2364b49b21c41669f050e03800138589fa7. SOURCE corrections S058–S076 and the two new notes |
| S062 | SKILL.md:1989 | the refused-download case (12/12). Sources S059/S060/S061/S062/S064 and superseding S070 distinguish |
| S062 | corpus/knowledge/harness-hardening-round-18.md:4 | source: S062 — Chromium 154.0.8037.97 --remote-debugging-pipe versus --remote-debugging-port and the DevToolsActivePort write site — https://chromium.googlesource.com/chromium/src/+/refs/tag… |
| S062 | corpus/knowledge/harness-hardening-round-18.md:8 | recheck: on-release for S059–S064 (tag-pinned sources; re-fetch when the Playwright, Chromium or Node pin moves) |
| S062 | corpus/knowledge/harness-hardening-round-18.md:26 | - **Pipe transport (S061, S062).** BrowserContext.newCDPSession(page) returns a raw CDP session and is documented as Chromium-only. For a launched Chromium, Playwright's default launch adds … |
| S062 | corpus/knowledge/harness-hardening-round-18.md:38 | \| H3 CDP channel \| --remote-debugging-port=0 (:91, pushed at :599); the harness reads DevToolsActivePort (:471-493) and opens a raw WebSocket to 127.0.0.1:<port> (:506-576) with target loo… |
| S064 | SKILL.md:1972 | c0aff2364b49b21c41669f050e03800138589fa7. SOURCE corrections S058–S076 and the two new notes |
| S064 | SKILL.md:1989 | the refused-download case (12/12). Sources S059/S060/S061/S062/S064 and superseding S070 distinguish |
| S064 | corpus/knowledge/harness-hardening-round-18.md:6 | source: S064 — Chromium 154.0.8037.97 duplicate-switch merge and feature-list parsing — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc (anchor … |
| S064 | corpus/knowledge/harness-hardening-round-18.md:8 | recheck: on-release for S059–S064 (tag-pinned sources; re-fetch when the Playwright, Chromium or Node pin moves) |
| S064 | corpus/knowledge/harness-hardening-round-18.md:28 | - **Switch merge (S064).** Chromium keeps one value per switch name. A later --enable-features= replaces an earlier one, and the earlier list is dropped whole. Each list is comma-split. For … |
| S064 | corpus/knowledge/harness-hardening-round-18.md:40 | \| S1 switches \| WEBMCP_FEATURE_ARGS (:82-85) and DOMAIN_DISABLED_ARGS (:86-89) are appended next to Playwright's own switches. Chromium keeps only the last --enable-features= and the last … |
| S071 | SKILL.md:1972 | c0aff2364b49b21c41669f050e03800138589fa7. SOURCE corrections S058–S076 and the two new notes |
| S071 | SKILL.md:1995 | mismatch case was an **imperative** tool. Source S071 traces declarative form inputs through |
| S071 | SKILL.md:2011 | transitions only if those cells actually change. S065–S076 are the round18 examples. |
| S071 | SKILL.md:2046 | rejection paths are now runtime-observed, not only read from S071. It is not a claim about real sites, |
| S071 | corpus/knowledge/harness-hardening-round-18.md:86 | - Superseding S071 narrows the old SKILL1956 and round17 invocation-note54/73 schema statement |
| S071 | corpus/knowledge/source-recheck-round-18.md:157 | same commit, contrary to §6's “not a superseding row” wording. S065–S076 now make the |
| S071 | corpus/knowledge/source-recheck-round-18.md:172 | \| S071 \| S042 \| No declared-inputSchema validation was evidenced for **imperative ExecuteV8Tool**; declarative FormMCPSchema::FillData rejects unknown parameters and invalid supported val… |
| S074 | SKILL.md:1972 | c0aff2364b49b21c41669f050e03800138589fa7. SOURCE corrections S058–S076 and the two new notes |
| S074 | SKILL.md:2011 | transitions only if those cells actually change. S065–S076 are the round18 examples. |
| S074 | corpus/knowledge/source-recheck-round-18.md:157 | same commit, contrary to §6's “not a superseding row” wording. S065–S076 now make the |
| S074 | corpus/knowledge/source-recheck-round-18.md:175 | \| S074 \| S034 \| Source-file token absence does not by itself establish runtime inertness. w2/LiveS034.md. \| |
| S077 | SKILL.md:2047 | other builds, agent-side clients or custom elements (ValidateParameterData returns true for them, S077 form_mcp_schema.cc:289-291). |
| S077 | SKILL.md:2051 | Two error classes exist. **Fill-time** (kInvalidInputArguments, S077): unknown key or a value the |
| S077 | SKILL.md:2060 | \| DV-01 \| An input key names no control \| Error; errorText Input contains a parameter "<key>" but there is no such parameter for the tool; no submit; controls unchanged \| decl-unknown-pa… |
| S077 | SKILL.md:2061 | \| DV-02 \| A valid key is sent together with an unknown key \| Whole call rejected with the unknown-parameter Error; the valid key is NOT applied (validate-all, then apply) \| decl-unknown-… |
| S077 | SKILL.md:2062 | \| DV-03 \| The key is the control's id, not its name \| Rejected as unknown: parameters are keyed by the control name \| decl-unknown-param-03; control decl-unknown-param-04 \| S077 form_mc… |
| S077 | SKILL.md:2063 | \| DV-04 \| A key targets a disabled or readonly control \| Absent from inputSchema and rejected as unknown parameter; control unchanged \| decl-disabled-hidden-01, decl-disabled-hidden-02; … |
| S077 | SKILL.md:2064 | \| DV-05 \| A key targets an <input type=hidden> \| Absent from inputSchema but NOT unknown: Error Invalid value "<v>" for parameter <name> (no validator branch for hidden) \| decl-disabled-… |
| S077 | SKILL.md:2066 | \| DV-07 \| A required text control receives JSON null \| Fill-time Error Invalid value for parameter required (unquoted template): null cannot be string-coerced \| decl-missing-required-03;… |
| S077 | SKILL.md:2068 | \| DV-09 \| A number control receives a non-numeric string or a boolean \| Fill-time Error Invalid value "<v>" for parameter n (boolean quoted as "true"); control left empty \| decl-number-t… |
| S077 | SKILL.md:2069 | \| DV-10 \| A number control receives a numeric string or a large exponent \| Accepted and submitted; the string is coerced ("42") and 1.25e21 is reserialized as 1.25000e+21 \| decl-number-t… |
| S077 | SKILL.md:2071 | \| DV-12 \| A single select receives a visible label or an absent value \| Fill-time Error Invalid value "<v>" for parameter choice; only option value strings match; selection unchanged \| d… |
| S077 | SKILL.md:2072 | \| DV-13 \| A single select receives the value of a disabled option \| Accepted, selected and submitted: option disabled state is not filtered (contrast DV-17) \| decl-select-enum-04; contro… |
| S077 | SKILL.md:2073 | \| DV-14 \| A multiple select receives an array with a non-option member, or a bare string \| Error (Invalid value for parameter colors / Invalid value "red" for parameter colors); no select… |
| S077 | SKILL.md:2074 | \| DV-15 \| A single checkbox receives a string (including "on" or its value attribute) \| Error Invalid value "<v>" for parameter <name>; single checkboxes take booleans only \| decl-checkb… |
| S077 | SKILL.md:2075 | \| DV-16 \| A radio group receives a value matching no radio \| Error Invalid value "not-an-option" for parameter choice; nothing checked \| decl-radio-02; control decl-radio-01 \| S077 form… |
| S077 | SKILL.md:2076 | \| DV-17 \| A radio group receives the value of a disabled radio \| Rejected like an unknown value: disabled radios are dropped from the control set (contrast DV-13) \| decl-radio-03; contro… |
| S077 | SKILL.md:2080 | \| DV-21 \| A date, time or datetime-local control receives a non-ISO string \| Fill-time Error Invalid value "<v>" for parameter <name>; nothing filled (sanitizer yields empty) \| decl-date… |
| S077 | SKILL.md:2085 | \| DV-26 \| A key is omitted \| The control keeps its default/pre-filled value (omission is not clearing) \| decl-textarea-empty-03; control decl-textarea-empty-04 \| S077 form_mcp_schema.cc… |
| S077 | SKILL.md:2086 | \| DV-27 \| A key is sent as the empty string \| The control is cleared (empty strings pass text validation) \| decl-textarea-empty-02; control decl-textarea-empty-04 \| S077 form_mcp_schema… |
| S077 | SKILL.md:2113 | enter S077's text-control branch (form_mcp_schema.cc:1270-1281), so hidden inputs are not generally |
| S077 | SKILL.md:2118 | were the rejected string probes. S077 :71-88,337-342 also accepts integers and case-insensitive |
| S077 | SKILL.md:2155 | \| DV-01 \| In the pinned unknown-param fixture, precisely decl-unknown-param-01 test: An input key names no control; no other input shape is asserted. \| Error; errorText Input contains a p… |
| S077 | SKILL.md:2156 | \| DV-02 \| In the pinned unknown-param fixture, precisely decl-unknown-param-02 test: A valid key is sent together with an unknown key; no other input shape is asserted. \| Fill-time unknow… |
| S077 | SKILL.md:2157 | \| DV-03 \| In the pinned unknown-param fixture, precisely decl-unknown-param-03 test: The key is the control's id, not its name; no other input shape is asserted. \| queryId is rejected whi… |
| S077 | SKILL.md:2158 | \| DV-04 \| In the pinned disabled-hidden fixture, precisely decl-disabled-hidden-01, decl-disabled-hidden-02 test: A key targets a disabled or readonly control; no other input shape is asse… |
| S077 | SKILL.md:2159 | \| DV-05 \| In the pinned disabled-hidden fixture, precisely decl-disabled-hidden-03 test: A key targets the tested hidden input without a nonempty toolparamdescription; no other input shape… |
| S077 | SKILL.md:2161 | \| DV-07 \| In the pinned missing-required fixture, precisely decl-missing-required-03 test: A required text control receives JSON null; no other input shape is asserted. \| Fill-time Error:… |
| S077 | SKILL.md:2163 | \| DV-09 \| In the pinned number-type fixture, precisely decl-number-type-03, decl-number-type-04 test: A number control receives a non-numeric string or a boolean; no other input shape is a… |
| S077 | SKILL.md:2164 | \| DV-10 \| In the pinned number-type fixture, precisely decl-number-type-02, decl-number-type-05 test: A number control receives a numeric string or a large exponent; no other input shape i… |
| S077 | SKILL.md:2166 | \| DV-12 \| In the pinned select-enum fixture, precisely decl-select-enum-02, decl-select-enum-03 test: A single select receives a visible label or an absent value; no other input shape is a… |
| S077 | SKILL.md:2167 | \| DV-13 \| In the pinned select-enum fixture, precisely decl-select-enum-04 test: A single select receives the value of a disabled option; no other input shape is asserted. \| Accepted and … |
| S077 | SKILL.md:2168 | \| DV-14 \| In the pinned select-multiple fixture, precisely decl-select-multiple-02, decl-select-multiple-03 test: A multiple select receives an array with a non-option member, or a bare st… |
| S077 | SKILL.md:2169 | \| DV-15 \| In the pinned checkbox fixture, precisely decl-checkbox-03, decl-checkbox-04, decl-checkbox-05 test: A single checkbox receives the tested strings on, checkbox-choice, or unrelat… |
| S077 | SKILL.md:2170 | \| DV-16 \| In the pinned radio fixture, precisely decl-radio-02 test: A radio group receives a value matching no radio; no other input shape is asserted. \| Error Invalid value "not-an-opti… |
| S077 | SKILL.md:2171 | \| DV-17 \| In the pinned radio fixture, precisely decl-radio-03 test: A radio group receives the value of a disabled radio; no other input shape is asserted. \| The disabled gamma value, wi… |
| S077 | SKILL.md:2175 | \| DV-21 \| In the pinned date-time fixture, precisely decl-date-time-02, decl-date-time-03, decl-date-time-04 test: A date, time or datetime-local control receives a non-ISO string; no othe… |
| S077 | SKILL.md:2180 | \| DV-26 \| In the pinned textarea-empty fixture, precisely decl-textarea-empty-03 test: A key is omitted; no other input shape is asserted. \| For the tested empty input object, the two opt… |
| S077 | SKILL.md:2181 | \| DV-27 \| In the pinned textarea-empty fixture, precisely decl-textarea-empty-02 test: A key is sent as the empty string; no other input shape is asserted. \| The tested optional text/text… |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:1 | source: S077 — Chromium 154.0.8037.97 form_mcp_schema.cc FillData/ValidateParameterData/per-type validators — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_p… |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:9 | recheck: on chromium package change — re-run node scripts/webmcp-validation-round19.mjs --out <new path outside the lane>; S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:19 | toolautosubmit, custom elements (FillData returns true for them without validation, S077 |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:35 | 1. **Two error classes.** Fill-time kInvalidInputArguments (S077 :208-231): an unknown key, or a value the |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:44 | readonly controls are dropped from the control set (S077 :1241) — absent from the schema and rejected as |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:96 | route hidden inputs through S077's text-control path (:1270-1281); hidden inputs are not generally |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:99 | were the rejected string probes. S077 :71-88,337-342 accepts integers and case-insensitive |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:114 | - **:9, recheck:** S077–S079 and S091 are version-pinned source openings; S082/S083 are dated rolling |
| S077 | corpus/knowledge/webmcp-declarative-validation-round-19.md:156 | S098 similarly qualifies the queued schema-construction reading as S077 implementation reuse. Neither is |
| S078 | SKILL.md:2053 | (kToolInvocationFailed, S078 html_form_element.cc:729-751): values were filled, then toolautosubmit's |
| S078 | SKILL.md:2065 | \| DV-06 \| A required control is omitted or sent as "" \| Fill succeeds, then autosubmit's interactive validation fails: Error Form validation failed: <name>: Please fill out this field.; n… |
| S078 | SKILL.md:2070 | \| DV-11 \| A number violates min, max or step \| Filled (field keeps the bad value), then Error Form validation failed: amount: Value must be … / Please enter a valid value. The two nearest… |
| S078 | SKILL.md:2077 | \| DV-18 \| A text value violates pattern \| Filled, then Error Form validation failed: q: Please match the requested format.; no submit \| decl-text-constraints-01; control decl-text-constr… |
| S078 | SKILL.md:2079 | \| DV-20 \| An email or url control receives a malformed string \| Filled, then Error Form validation failed: email: Please include an '@' … / url: Please enter a URL.; schema has no format … |
| S078 | SKILL.md:2081 | \| DV-22 \| A date/time value lies outside min/max \| Filled, then Error Form validation failed: date: Value must be 12/31/2026 or earlier. (locale-formatted); no submit \| decl-date-time-05… |
| S078 | SKILL.md:2312 | same body as S096/S078: the table's LC11 override and these prose anchors add no publisher. |
| S078 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:1 | source:S096+S100 — Chromium 154.0.8037.97 html_form_element.cc (HTMLFormMcpTool ExecuteTool/CancelTool/CallDoneCallback, HandleWebMcpToolResponse, PrepareForSubmission submit branches) — htt… |
| S078 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:15 | **Reuse, not diversity.** The source is the same S096 body already retained for round 19 (S078). S100 is the same file, read at more line ranges and used only for the LC11 rendering. Neither… |
| S078 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:86 | - One build (Chromium 154.0.8037.97), one source body (S096 = S078 bytes; S100 = same bytes), no runtime claim. |
| S078 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:151 | same body as S096/S078: the table's LC11 override and these prose anchors add no publisher. |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:2 | source: S078 — Chromium 154.0.8037.97 html_form_element.cc HTMLFormMcpTool (fill call, autosubmit, Form validation failed) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.… |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:9 | recheck: on chromium package change — re-run node scripts/webmcp-validation-round19.mjs --out <new path outside the lane>; S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:40 | kToolInvocationFailed (S078 :729-751): values were filled, then autosubmit's interactive validation |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:106 | submit event occurs. No isolated one-field range experiment is claimed. S078 describes the generic |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:114 | - **:9, recheck:** S077–S079 and S091 are version-pinned source openings; S082/S083 are dated rolling |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:129 | - **S096**, Chromium 154 html_form_element.cc, same retained body as S078: supersedes the |
| S078 | corpus/knowledge/webmcp-declarative-validation-round-19.md:130 | ordinary-empty-string reading of S078. Navigation's callback uses a **null String sentinel**; |
| S079 | SKILL.md:2067 | \| DV-08 \| The top-level input is not a JSON object (array, string, null) \| CDP rejects the command (Invalid parameters): no invocationId, no toolInvoked, page untouched \| decl-non-scalar… |
| S079 | SKILL.md:2162 | \| DV-08 \| In the pinned non-scalar fixture, precisely decl-non-scalar-03, decl-non-scalar-04, decl-non-scalar-05 test: The top-level input is not a JSON object (array, string, null); no ot… |
| S079 | corpus/knowledge/webmcp-declarative-validation-round-19.md:3 | source: S079 — Chromium 154.0.8037.97 WebMCP.pdl (invokeTool object input, toolResponded) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/… |
| S079 | corpus/knowledge/webmcp-declarative-validation-round-19.md:9 | recheck: on chromium package change — re-run node scripts/webmcp-validation-round19.mjs --out <new path outside the lane>; S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d |
| S079 | corpus/knowledge/webmcp-declarative-validation-round-19.md:66 | 5. **CDP boundary.** WebMCP.invokeTool declares object input (S079 :66); an array, string or null input is |
| S079 | corpus/knowledge/webmcp-declarative-validation-round-19.md:114 | - **:9, recheck:** S077–S079 and S091 are version-pinned source openings; S082/S083 are dated rolling |
| S079 | corpus/knowledge/webmcp-declarative-validation-round-19.md:133 | 1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475, supersedes S079's |
| S079 | corpus/knowledge/webmcp-declarative-validation-round-19.md:154 | S099 (same Chromium-tag PDL URL/body as source S079 above, WebMCP.pdl:59-69,109-123) is the current |
| S080 | corpus/knowledge/webmcp-declarative-validation-round-19.md:9 | recheck: on chromium package change — re-run node scripts/webmcp-validation-round19.mjs --out <new path outside the lane>; S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d |
| S081 | corpus/knowledge/webmcp-declarative-validation-round-19.md:9 | recheck: on chromium package change — re-run node scripts/webmcp-validation-round19.mjs --out <new path outside the lane>; S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d |
| S096 | SKILL.md:2160 | \| DV-06 \| In the pinned missing-required fixture, precisely decl-missing-required-01, decl-missing-required-02 test: A required control is omitted or sent as ""; no other input shape is as… |
| S096 | SKILL.md:2165 | \| DV-11 \| In the pinned number-range fixture, precisely decl-number-range-01, decl-number-range-02, decl-number-range-03 test: A number violates min, max or step; no other input shape is a… |
| S096 | SKILL.md:2172 | \| DV-18 \| In the pinned text-constraints fixture, precisely decl-text-constraints-01 test: A text value violates pattern; no other input shape is asserted. \| Filled, then Error Form valid… |
| S096 | SKILL.md:2174 | \| DV-20 \| In the pinned email-url fixture, precisely decl-email-url-01, decl-email-url-03 test: An email or url control receives a malformed string; no other input shape is asserted. \| Fi… |
| S096 | SKILL.md:2176 | \| DV-22 \| In the pinned date-time fixture, precisely decl-date-time-05 test: A date/time value lies outside min/max; no other input shape is asserted. \| The combined out-of-bounds ISO val… |
| S096 | SKILL.md:2210 | not a claim that a browser exposes or executes it. S096 and S100 reuse one retained source |
| S096 | SKILL.md:2217 | \| LC01 \| At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. \| require_submit_button is true; the autosubmit use counter is increment… |
| S096 | SKILL.md:2218 | \| LC02 \| FillFormControls returns a ScriptToolError. \| done_callback is run with the error immediately; the running state (is_currently_running_, active submit button, done_callback_) is … |
| S096 | SKILL.md:2219 | \| LC03 \| The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. \| FillFormControls returns kMissingR… |
| S096 | SKILL.md:2220 | \| LC04 \| FillFormControls returned no error and the entry-time require_submit_button is true. \| submit_button->Focus() and context->PauseExecution() are called; this branch does not run t… |
| S096 | SKILL.md:2221 | \| LC05 \| FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). \| form_->PrepareForSubmission(/*event*/ nullptr, submit_bu… |
| S096 | SKILL.md:2222 | \| LC06 \| CancelTool is called (it CHECKs is_currently_running_). \| CallDoneCallback runs with kToolCancelled and the message Tool execution cancelled by abort signal. \| S096:224-229 \| |
| S096 | SKILL.md:2223 | \| LC07 \| CallDoneCallback is called. \| If done_callback_ is null it returns with no state change. If non-null, the callback is invoked (line 266) before the state reset at lines 267-270, … |
| S096 | SKILL.md:2224 | \| LC08 \| HandleWebMcpToolResponse receives a settlement for a tool that is not CurrentlyRunning. \| The settlement is ignored: the function returns without calling the done callback. \| S0… |
| S096 | SKILL.md:2225 | \| LC09 \| The tool is still CurrentlyRunning, the respondWith promise resolves with an object, and v8::JSON::Stringify(...).ToLocal(...) returns false. \| CallDoneCallback is called with kT… |
| S096 | SKILL.md:2226 | \| LC10 \| The tool is still CurrentlyRunning and the respondWith promise rejects. \| The rejection value is reported through V8ScriptRunner::ReportException, then CallDoneCallback runs with… |
| S096 | SKILL.md:2228 | \| LC12 \| PrepareForSubmission reaches the should_submit branch and executing_tool remains CurrentlyRunning after ScheduleFormSubmission returns. \| CallDoneCallback runs with base::ok of a… |
| S096 | SKILL.md:2243 | \| lifecycle documented-row counter / probe \| node .ufo/waves/round-20/measure-c1.mjs REV \| 0 evaluated count (baseline absent=0); 1 failed validation; 2 could-not-evaluate \| node .ufo/wa… |
| S096 | SKILL.md:2273 | \| LC01 \| At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. \| The local require_submit_button is true. The autosubmit UseCounter::Co… |
| S096 | SKILL.md:2274 | \| LC02 \| The FillFormControls error result is present after the enclosing CEReactionsScope has closed. \| Contains a call to the incoming done_callback with the error, then returns before … |
| S096 | SKILL.md:2275 | \| LC03 \| The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. \| FillFormControls returns kMissingR… |
| S096 | SKILL.md:2276 | \| LC04 \| FillFormControls returned no error and the entry-time require_submit_button is true. \| Contains calls to submit_button->Focus() and context->PauseExecution(), but no direct CallD… |
| S096 | SKILL.md:2277 | \| LC05 \| FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). \| Contains a direct PrepareForSubmission(nullptr, submit_b… |
| S096 | SKILL.md:2278 | \| LC06 \| CancelTool is entered and its is_currently_running_ CHECK passes. \| Calls the CallDoneCallback method with kToolCancelled and literal message Tool execution cancelled by abort si… |
| S096 | SKILL.md:2279 | \| LC07 \| CallDoneCallback is entered; its done_callback_.is_null() test selects the early-return or held-callback arm. \| Null returns before cleanup. Otherwise the code invokes Run(result… |
| S096 | SKILL.md:2280 | \| LC08 \| HandleWebMcpToolResponse enters with tool->CurrentlyRunning() false. \| Returns before resolve/reject handling, without a CallDoneCallback or ReportException call from this functi… |
| S096 | SKILL.md:2281 | \| LC09 \| HandleWebMcpToolResponse passed the CurrentlyRunning guard at handler entry, reaches the resolved object arm, and JSON::Stringify(...).ToLocal(...) returns false. \| Contains a Ca… |
| S096 | SKILL.md:2282 | \| LC10 \| HandleWebMcpToolResponse passed its CurrentlyRunning guard at handler entry and reaches the resolved=false arm. \| Contains a ReportException(value) call followed by a CallDoneCal… |
| S096 | SKILL.md:2284 | \| LC12 \| The should_submit block is reached; after ScheduleFormSubmission returns executing_tool is non-null and CurrentlyRunning, and the WebMCPEnabled CHECK passes. \| Contains CallDoneC… |
| S096 | SKILL.md:2312 | same body as S096/S078: the table's LC11 override and these prose anchors add no publisher. |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:1 | source:S096+S100 — Chromium 154.0.8037.97 html_form_element.cc (HTMLFormMcpTool ExecuteTool/CancelTool/CallDoneCallback, HandleWebMcpToolResponse, PrepareForSubmission submit branches) — htt… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:15 | **Reuse, not diversity.** The source is the same S096 body already retained for round 19 (S078). S100 is the same file, read at more line ranges and used only for the LC11 rendering. Neither… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:29 | \| LC01 \| At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. \| require_submit_button is true; the autosubmit use counter is increment… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:30 | \| LC02 \| FillFormControls returns a ScriptToolError. \| done_callback is run with the error immediately; the running state (is_currently_running_, active submit button, done_callback_) is … |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:31 | \| LC03 \| The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. \| FillFormControls returns kMissingR… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:32 | \| LC04 \| FillFormControls returned no error and the entry-time require_submit_button is true. \| submit_button->Focus() and context->PauseExecution() are called; this branch does not run t… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:33 | \| LC05 \| FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). \| form_->PrepareForSubmission(/*event*/ nullptr, submit_bu… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:34 | \| LC06 \| CancelTool is called (it CHECKs is_currently_running_). \| CallDoneCallback runs with kToolCancelled and the message Tool execution cancelled by abort signal. \| S096:224-229 \| |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:35 | \| LC07 \| CallDoneCallback is called. \| If done_callback_ is null it returns with no state change. If non-null, the callback is invoked (line 266) before the state reset at lines 267-270, … |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:36 | \| LC08 \| HandleWebMcpToolResponse receives a settlement for a tool that is not CurrentlyRunning. \| The settlement is ignored: the function returns without calling the done callback. \| S0… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:37 | \| LC09 \| The tool is still CurrentlyRunning, the respondWith promise resolves with an object, and v8::JSON::Stringify(...).ToLocal(...) returns false. \| CallDoneCallback is called with kT… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:38 | \| LC10 \| The tool is still CurrentlyRunning and the respondWith promise rejects. \| The rejection value is reported through V8ScriptRunner::ReportException, then CallDoneCallback runs with… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:40 | \| LC12 \| PrepareForSubmission reaches the should_submit branch and executing_tool remains CurrentlyRunning after ScheduleFormSubmission returns. \| CallDoneCallback runs with base::ok of a… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:42 | **LC11 operative branch and authority.** LC11 is rendered from S100 at S100:787-815. The operative text is the programming-error message at line 810 (The site has a programming error: it cal… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:48 | The twelve rows are a finite sample of documented decisions from the S096/S100 anchor (lines 174-328 and 635-842). They are not exhaustive completion or cancellation coverage, and other path… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:81 | - **Submit-time validation (adjacent, not one of the twelve rows).** Round-19 corpus/evidence/round-19/validation/cases/missing-required.json:12-13 records Error with Form validation failed:… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:86 | - One build (Chromium 154.0.8037.97), one source body (S096 = S078 bytes; S100 = same bytes), no runtime claim. |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:112 | \| LC01 \| At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. \| The local require_submit_button is true. The autosubmit UseCounter::Co… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:113 | \| LC02 \| The FillFormControls error result is present after the enclosing CEReactionsScope has closed. \| Contains a call to the incoming done_callback with the error, then returns before … |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:114 | \| LC03 \| The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. \| FillFormControls returns kMissingR… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:115 | \| LC04 \| FillFormControls returned no error and the entry-time require_submit_button is true. \| Contains calls to submit_button->Focus() and context->PauseExecution(), but no direct CallD… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:116 | \| LC05 \| FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). \| Contains a direct PrepareForSubmission(nullptr, submit_b… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:117 | \| LC06 \| CancelTool is entered and its is_currently_running_ CHECK passes. \| Calls the CallDoneCallback method with kToolCancelled and literal message Tool execution cancelled by abort si… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:118 | \| LC07 \| CallDoneCallback is entered; its done_callback_.is_null() test selects the early-return or held-callback arm. \| Null returns before cleanup. Otherwise the code invokes Run(result… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:119 | \| LC08 \| HandleWebMcpToolResponse enters with tool->CurrentlyRunning() false. \| Returns before resolve/reject handling, without a CallDoneCallback or ReportException call from this functi… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:120 | \| LC09 \| HandleWebMcpToolResponse passed the CurrentlyRunning guard at handler entry, reaches the resolved object arm, and JSON::Stringify(...).ToLocal(...) returns false. \| Contains a Ca… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:121 | \| LC10 \| HandleWebMcpToolResponse passed its CurrentlyRunning guard at handler entry and reaches the resolved=false arm. \| Contains a ReportException(value) call followed by a CallDoneCal… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:123 | \| LC12 \| The should_submit block is reached; after ScheduleFormSubmission returns executing_tool is non-null and CurrentlyRunning, and the WebMCPEnabled CHECK passes. \| Contains CallDoneC… |
| S096 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:151 | same body as S096/S078: the table's LC11 override and these prose anchors add no publisher. |
| S096 | corpus/knowledge/webmcp-declarative-validation-round-19.md:129 | - **S096**, Chromium 154 html_form_element.cc, same retained body as S078: supersedes the |
| S097 | corpus/knowledge/webmcp-declarative-validation-round-19.md:132 | - **S097**, Chromium 154 inspector_web_mcp_agent.cc:47-64,208-243, decoded body |
| S098 | corpus/knowledge/webmcp-declarative-validation-round-19.md:156 | S098 similarly qualifies the queued schema-construction reading as S077 implementation reuse. Neither is |
| S099 | corpus/knowledge/webmcp-declarative-validation-round-19.md:154 | S099 (same Chromium-tag PDL URL/body as source S079 above, WebMCP.pdl:59-69,109-123) is the current |
| S100 | SKILL.md:2210 | not a claim that a browser exposes or executes it. S096 and S100 reuse one retained source |
| S100 | SKILL.md:2227 | \| LC11 \| The tool is still running after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise. \| CallDoneCallback runs with kToolInvocationFailed and the p… |
| S100 | SKILL.md:2243 | \| lifecycle documented-row counter / probe \| node .ufo/waves/round-20/measure-c1.mjs REV \| 0 evaluated count (baseline absent=0); 1 failed validation; 2 could-not-evaluate \| node .ufo/wa… |
| S100 | SKILL.md:2283 | \| LC11 \| PrepareForSubmission reaches its post-dispatch declarative block with executing_tool still running, no promise taken, and should_submit=false. \| Contains a CallDoneCallback call … |
| S100 | SKILL.md:2308 | S100:635-842 supplies the additional submit-path context, including the early-return |
| S100 | SKILL.md:2311 | anchor ranges, so this sample does not infer its full scheduling semantics. S100 is the |
| S100 | SKILL.md:2366 | own-work runtime evidence; S100 reopened upstream source interpretation). |
| S100 | SKILL.md:2383 | Reset/removal are observation-only with respect to S100's narrower source anchors. |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:1 | source:S096+S100 — Chromium 154.0.8037.97 html_form_element.cc (HTMLFormMcpTool ExecuteTool/CancelTool/CallDoneCallback, HandleWebMcpToolResponse, PrepareForSubmission submit branches) — htt… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:15 | **Reuse, not diversity.** The source is the same S096 body already retained for round 19 (S078). S100 is the same file, read at more line ranges and used only for the LC11 rendering. Neither… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:39 | \| LC11 \| The tool is still running after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise. \| CallDoneCallback runs with kToolInvocationFailed and the p… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:42 | **LC11 operative branch and authority.** LC11 is rendered from S100 at S100:787-815. The operative text is the programming-error message at line 810 (The site has a programming error: it cal… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:48 | The twelve rows are a finite sample of documented decisions from the S096/S100 anchor (lines 174-328 and 635-842). They are not exhaustive completion or cancellation coverage, and other path… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:50 | Caveat only, not a row: within the S100 anchor, submitFromJavaScript also calls the done callback with a null String when a tool is running (S100:834-842). This table is not a complete inven… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:52 | PrepareForSubmission has early-return branches without a direct done-callback call at lines 639, 647, 659 and 679 (S100:635-682). These source callsites prevent treating LC05's call as a uni… |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:86 | - One build (Chromium 154.0.8037.97), one source body (S096 = S078 bytes; S100 = same bytes), no runtime claim. |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:90 | - S100 is a bounded same-file anchor extension for the LC11 rendering only, not an independent source. |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:122 | \| LC11 \| PrepareForSubmission reaches its post-dispatch declarative block with executing_tool still running, no promise taken, and should_submit=false. \| Contains a CallDoneCallback call … |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:147 | S100:635-842 supplies the additional submit-path context, including the early-return |
| S100 | corpus/knowledge/webmcp-completion-lifecycle-round-20.md:150 | anchor ranges, so this sample does not infer its full scheduling semantics. S100 is the |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:1 | source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; S100 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/b… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:15 | S100 supplies scoped **source interpretation**, not proof that this Arch build's |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:21 | their implementation locations are outside S100's immutable registered anchors. |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:32 | \| na-pending \| no action \| no matching response in either recorded window; form active before and after \| S100:212-218 supports focus/pause callsites, not an indefinite pending guarantee… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:33 | \| na-click \| Playwright input-pipeline button click \| Completed with the dummy response object; submit event isTrusted and agentInvoked true \| S100:298-319,720-815; not a claim of human … |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:34 | \| na-requestsubmit \| page-context requestSubmit() through Playwright evaluate \| Completed with the dummy response object; submit event isTrusted and agentInvoked true \| S100:298-319,720-… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:35 | \| na-native-submit \| page-context form.submit() \| Completed output is an array containing the landing document's JSON-LD object; navigated to /landing with dummy q; old-document submit co… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:36 | \| na-reset \| page script form.reset() \| Canceled, errorText "Tool execution cancelled by a form reset" \| S101 observation only; do not cite this implementation to S100's narrower anchors… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:38 | \| na-reject \| requestSubmit; preventDefault then respondWith a rejected promise \| Error, errorText "respondWith promise was rejected" \| S100:320-327 and 787-806; declarative promise reje… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:39 | \| na-throw \| requestSubmit; handler calls preventDefault before throwing, without respondWith \| Error, programming-error text naming preventDefault without respondWith \| S100:807-813; th… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:40 | \| na-delayed \| requestSubmit; hold respondWith promise, then explicitly release it \| Completed with dummy response object after controlled release \| S100:290-319,787-806; retained interm… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:41 | \| na-invalid-submit \| clear the required field after agent fill; requestSubmit \| Error, "Form validation failed: q: Please fill out this field.. "; no submit event \| S100:729-758; this i… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:42 | \| auto-positive \| no page action; toolautosubmit present \| response already present in initial window: Completed with dummy response object \| S100:218-221; held-ground positive control, … |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:43 | \| auto-invalid \| no page action; toolautosubmit and malformed email \| response already present in initial window: Error, native email validation text; no submit event \| S100:729-758; hel… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:1 | source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; S100 — Chromium 154.0.8037.97 html_form_element.cc:174-328,635-842, reopened 2026-10-21 |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:15 | S100 supplies scoped **source interpretation**, not proof that this Arch build's |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:21 | their implementation locations are outside S100's immutable registered anchors. |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:32 | \| na-pending \| no action \| no matching response in either recorded window; form active before and after \| S100:212-218 supports focus/pause callsites, not an indefinite pending guarantee… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:33 | \| na-click \| Playwright input-pipeline button click \| Completed with the dummy response object; submit event isTrusted and agentInvoked true \| S100:720-815; not a claim of human interven… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:34 | \| na-requestsubmit \| page script form.requestSubmit() \| Completed with the dummy response object; submit event isTrusted and agentInvoked true \| S100:720-815; these event flags do not pr… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:35 | \| na-native-submit \| page script form.submit() \| Completed with the landing document's JSON-LD array; navigated to /landing with dummy q; old-document submit count unavailable after navig… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:36 | \| na-reset \| page script form.reset() \| Canceled, errorText "Tool execution cancelled by a form reset" \| S101 observation only; do not cite this implementation to S100's narrower anchors… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:38 | \| na-reject \| requestSubmit; preventDefault then respondWith a rejected promise \| Error, errorText "respondWith promise was rejected" \| S100:320-327 and 787-806; declarative promise reje… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:39 | \| na-throw \| requestSubmit; handler calls preventDefault before throwing, without respondWith \| Error, programming-error text naming preventDefault without respondWith \| S100:807-813; th… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:40 | \| na-delayed \| requestSubmit; hold respondWith promise, then explicitly release it \| Completed with dummy response object after controlled release \| S100:290-319,787-806; retained interm… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:41 | \| na-invalid-submit \| clear the required field after agent fill; requestSubmit \| Error, "Form validation failed: q: Please fill out this field.. "; no submit event \| S100:729-758; this i… |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:42 | \| auto-positive \| no page action; toolautosubmit present \| response already present in initial window: Completed with dummy response object \| S100:218-221; held-ground positive control, … |
| S100 | corpus/knowledge/webmcp-nonautosubmit-round-21.md:43 | \| auto-invalid \| no page action; toolautosubmit and malformed email \| response already present in initial window: Error, native email validation text; no submit event \| S100:729-758; hel… |
| S105 | corpus/knowledge/bfcache-runtime-observed-round-25.md:68 | - S105 (Page.pdl): Page.frameNavigated type enum names |
| S105 | corpus/knowledge/navigation-history-bfcache-evidence.md:4 | source: S105 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT — Page.frameNavigated.type and… |
| S105 | corpus/knowledge/navigation-history-bfcache-evidence.md:6 | recheck: 90d for S104 (rolling article); on-release for S105 (a pinned Chromium tag is immutable) |
| S105 | corpus/knowledge/navigation-history-bfcache-evidence.md:36 | (S105): |
| S105 | corpus/knowledge/navigation-history-bfcache-evidence.md:39 | BackForwardCacheRestore alongside Navigation (S105, NavigationType, |
| S105 | corpus/knowledge/navigation-history-bfcache-evidence.md:43 | loaderId, frameId, and a required notRestoredExplanations array (S105, |
| S106 | SKILL.md:2508 | gate C2 commits the S106 decoded bytes + receipt (corpus/evidence/round-26/sources/) to a |
| S106 | SKILL.md:2517 | ## Round 28 — revision-bound S106 and exact LOG citations (2026-10-25; append-only) |
| S106 | SKILL.md:2519 | The S106 receipt now names measured_rev; the gate checks the committed source |
| S106 | corpus/knowledge/bfcache-runtime-observed-round-25.md:61 | - S106 (new, opened this round): Chromium 154 content_features.cc declares |

Ids with zero baseline hits in knowledge/SKILL.md: .

## Delta at HEAD 190052c (new lines citing the ids, not in baseline)

Hits at HEAD in `chromium-156-release-pin-recheck.md` (75 lines, the table and prose of the round-29 note) and the 7 appended `## Round-29 recheck` blocks (harness-hardening-round-18, source-recheck-round-18, webmcp-completion-lifecycle-round-20, webmcp-declarative-validation-round-19, webmcp-invocation-round-17, webmcp-nonautosubmit-round-21, webmcp-nonautosubmit-round-21-corrected). SKILL.md, webmcp-chromium-loopback-round-16, navigation-history-bfcache-evidence and bfcache-runtime-observed-round-25 have no round-29 note (S033/S034/S105/S106 are `holds`, so none is required for them).
