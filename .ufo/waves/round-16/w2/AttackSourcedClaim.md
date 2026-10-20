# AttackSourcedClaim — round 16 wave 2 (FALSIFY)

Seat: `TabiR16.AttackSourcedClaim` (critic, author-side; not a non-author certification).
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3`.
Attack item: §2b sourced-claim obligation. C2 must rest on a SOURCES row opened this round. Do the note's `source:` rows
(S020, S030–S036) each back the statements the note attributes to them?
Sources re-opened by this seat on 2026-10-20 (~14:57 UTC), into `/tmp/attacksrc.STDz` (outside the lane).
Lane writes: this report only. Tools installed: none.

## Verdict: **BREAKS** (narrow and fixable; C2's evidence base survives)

S020 is **not** cited for declarative or CDP behaviour. The note keeps that boundary itself ("never cite S020 for it", line 78;
"neither is spec text", line 93). Every text quote and line anchor attributed to S020, S030, S031, S033, S035 and S036 is in the
bytes I fetched. One attribution does not hold: the inertness clause attributed to **S034**. Its SOURCES row also makes a claim
that the 154 binary contradicts. Five lesser provenance defects are listed below. The C2 counter cannot detect any of them, or a
row "opened" in a prior round (mutation M1).

## Primary counterexample — S034 is cited for "inert", which it cannot back

Note lines 43-45 (at b444ca8): "(S034, lines 7023-7035); there is no `DeclarativeWebmcp` runtime feature at 154 (that token is
inert here …)". The S034 row's Claim column says: "no DeclarativeWebmcp feature exists there, so that flag token is inert".

- **What S034 does back:** no Blink *runtime-enabled* feature is named `DeclarativeWebmcp`.
  - `curl …/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT | base64 -d`
    gives sha256 `99b92e6776a5…1d2b`, matching the row.
  - `grep -n -i 'webmcp\|DeclarativeWeb'` matches only lines 7023, 7024, 7031-7033, 7038, 7043, 7044 and 7048 (`WebMCP`,
    `WebMCPDeclarativeFileInput`, `WebMCPFormAssociatedCustomElements`, `WebMCPTesting`). Nothing is named DeclarativeWebmcp.
- **What S034 cannot back:** `--enable-features=` tokens resolve against `base::Feature`s, which can be defined in any C++ file.
  The JSON5 runtime-feature list therefore cannot prove such a token is inert.
- **The 154 binary contradicts the row's "no … feature exists".** Command:
  `strings -n 6 /usr/lib/chromium/chromium | grep -a -E '^kDevToolsWebMCPSupport$|^kWebMCP|^kDeclarativeWebmcp$|…' | sort | uniq -c`
  (binary `--version` = `Chromium 154.0.8037.97`). Output:
  `1 kDeclarativeWebmcp`, `1 kDevToolsWebMCPSupport`, `1 kWebMCP`, `1 kWebMCPDeclarativeFileInput`,
  `1 kWebMCPFormAssociatedCustomElements`, `1 kWebMCPTesting`.
  - `kDevToolsWebMCPSupport` uses the same string form. It is defined as
    `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);` at 154 `third_party/blink/common/features.cc:571`
    (fetched this session).
  - So a base::Feature `DeclarativeWebmcp` is compiled into 154 `[INFERENCE from identical BASE_FEATURE string form; defining
    file not located]`.
  - The lane already knew this: `.ufo/waves/round-16/PLAN.md:25` and `drafts/DraftNote.md:57` list `kDeclarativeWebmcp` among
    the 154 binary strings.
- **Mitigation: the behaviour is observed, but from a different source.** The probe, not S034, shows no effect on the probed
  surfaces. From `.ufo/waves/round-16/probes/WebmcpProbeFlags.json`:
  - `features-DeclarativeWebmcp ["--enable-features=DeclarativeWebmcp"] events: []` with `documentModelContextTypeof:"undefined"`.
  - `blink-WebMCP` and `blink-WebMCP+DeclarativeWebmcp` give the same single `toolsAdded`
    (`search`, `backendNodeId:3`, same inputSchema).
  - The 154 declarative gate checks only the WebMCP runtime feature. `html_form_element.cc:353-355` at the tag reads
    `if (!RuntimeEnabledFeatures::WebMCPEnabled(GetExecutionContext())) return;`.
- **Impacted axes:** provenance and sourced-claim fidelity, for a C2 note statement and the S034 row Claim column. The receipt
  and the C2 coverage cases are not impacted.
- **Smallest safe correction:**
  - Reword the S034 row Claim to: "no Blink runtime-enabled feature named DeclarativeWebmcp at 154".
  - Reword the note parenthetical to: "a `kDeclarativeWebmcp` base::Feature string is compiled into 154, and enabling it changed
    no probed surface (WebmcpProbeFlags.json: features-DeclarativeWebmcp, blink-WebMCP±DeclarativeWebmcp); declarative
    registration is gated by WebMCP alone".
  - Cite the probe for that statement, not S034. Use append-only correction wording per lane convention.

## Per-row attribution check (re-opened 2026-10-20)

| Row | Note statement(s) attributed | Fetched bytes / command | Result |
|---|---|---|---|
| S020 | §4.1 `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }` (l.24, l.77); §4.2 `ontoolchange`/`ontoolactivated`/`ontoolcancel` (l.79); `executeTool` "optional `object`" (l.80); §4.4 `tools`, default `'self'` (l.81) | `curl https://webmachinelearning.github.io/webmcp/` → sha256 `180c55ba…0d1a`; `<meta content="cb3d16964ab3e92cfd5f09901ed0504373a906e8" name="revision">`, `dt-updated 2026-10-20`. Quotes found: "partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };" (§4.1, then "4.2. ModelContext Interface"); "executeTool(RegisteredTool tool, optional object inputObject, …) attribute EventHandler ontoolchange; … ontoolactivated; … ontoolcancel;" (§4.2); "gated behind the policy-controlled feature "tools", which has a default allowlist of 'self'." (§4.4) | Content **HOLDS**. Not cited for declarative or CDP. Identity defect F1 below |
| S030 | "not part of the specification at this time" (l.78) | `raw…/cb3d1696…/README.md` sha256 `184c519a…c7d6`, line 319: "…Declarative API Explainer…, but it is not part of the specification at this time." Spec negative check: `git show cb3d1696:index.bs \| grep -i 'declarative\|toolname'` finds only `toolName` algorithm variables, no form surface | **HOLDS** |
| S031 | Chromium implements "a loose version" (l.78) | `raw…/cb3d1696…/declarative-api-explainer.md` sha256 `4587c9f2…bd28`, line 114: "Chromium is implementing a loose version of this and will conduct testing/trials" (inside §Input schema synthesis, 108-115) | **HOLDS** |
| S032 | none in the body | Appears only at l.4 (`source:`) and l.10 (`recheck:`). Page fetched: "Published: May 18, 2026, Last updated: October 7, 2026"; "Join the WebMCP origin trial from Chrome 149"; "chrome://flags/#enable-webmcp-testing"; "Both APIs are gated by the tools Permissions Policy. The policy defaults to self" | Row content true; **backs no note statement** (F2) |
| S033 | Same IDL at 154 tag, "S033 line 11" (l.77) | gitiles `?format=TEXT` → sha256 `50dd337d…6364` (matches row); line 8 `RuntimeEnabled=WebMCP`, line 10 `] partial interface Document {`, line 11 `[SecureContext, SameObject] readonly attribute ModelContext modelContext;` | **HOLDS** |
| S034 | WebMCP `experimental`, enabled from the base feature only when overridden, `implied_by` `WebMCPTesting` (l.42-43); "no DeclarativeWebmcp runtime feature … inert" (l.43-45) | lines 7022-7036: `name: "WebMCP"`, `base_feature_status: "enabled"`, `copied_from_base_feature_if: "overridden"`, `implied_by: [… "WebMCPTesting"]`, `status: "experimental"` | First part **HOLDS**; inertness **BREAKS** (primary) |
| S035 | "S035 marks `experimental domain WebMCP`" (l.82) | `raw…/main/…/WebMCP.pdl` sha256 `f386bcfd…f99f` (matches row); line 7 `experimental domain WebMCP`; lines 53-54 "Enabling the domain will trigger a toolsAdded event for all currently registered tools." | **HOLDS** (row correctly says main, not 154) |
| S036 | consumer drops a frame's tools on default execution-context destruction, "as DevTools does" (l.57, l.102) | `raw…/66df492a…/WebMCPModel.ts` sha256 `c23d575e…b632` (matches row); lines 192-201 `#executionContextDestroyed … if (executionContext.isDefault && executionContext.frameId) { … this.#tools.delete(executionContext.frameId); … TOOLS_REMOVED`. 154 `DEPS:424` `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2'` | **HOLDS** for the note's use. Row over-infers (F5) |

## Lesser defects (fixable; none breaks C2's receipt)

- **F1 — S020 row identity is stale relative to the note's citation.**
  - The S020 row still reads "CG-DRAFT 2026-10-16, revision f14762e6", accessed `2026-10-19`. b444ca8 changed only the status
    (queued→mined) and used-by fields (`git diff e38d259 b444ca8 -- corpus/SOURCES.md`).
  - The note cites "§4.1, rev `cb3d1696`" (l.77). `git grep -c 'cb3d1696\|f14762e6' b444ca8 -- corpus` matches only SOURCES
    (S020, S030 and S031 rows) and the note, so the S020 re-open has no committed quote or digest record.
  - Content is unaffected. `git diff --stat f14762e6 cb3d1696` gives `index.bs | 1 +` (one Editor line).
  - Spec HEAD has since moved to `51ed7565` (2026-10-20T10:57-04:00, index.bs +55). The hunks are at 128 (biblio) and 1606/1973
    (security). §4.1-§4.4 are untouched. The live page still served `cb3d1696` at fetch time.
  - Correction: update the S020 Version and Accessed columns to `cb3d1696` and 2026-10-20 (append-only note per convention), or
    record the re-open quote and digest in the round lesson.
- **F2 — S032 is declared but backs no statement.** The note never mentions the origin-trial path (S032 "origin trial from
  Chrome 149"; S034 `origin_trial_feature_name: "WebMCP"`). Either cite S032 where it applies, for example the decision-table
  row "WebMCP is available in Chromium", which currently ignores the origin trial, or drop it from `source:`.
- **F3 — S002 is cited in the body (l.82, "unsupported posture as for all CDP (S002)") but not declared.** It is absent from the
  `source:` header, and its used-by lacks the note: the S002 row is unchanged at b444ca8 (accessed 2026-10-19). Its content does
  back the statement. DraftScorecard planned an "S002 CDP viewer re-open with WebMCP-domain used-by add", which did not land.
- **F4 — "main later added `DeclarativeWebMCP`" (l.44-45) has no SOURCES row.** It is true: main `runtime_enabled_features.json5`
  line 2396 is `name: "DeclarativeWebMCP"`, fetched this session. The search log lists main-branch flag copies as excluded,
  though, so the note asserts an unsourced fact. Add a row or cite the exclusion with its location.
- **F5 — the S036 row Claim over-infers.** It says "so navigation removal is inferred, not sent as toolsRemoved". A frontend
  handler cannot show that the backend never sends the event. The note correctly rests "no event" on the receipt.
  - Corroboration outside SOURCES: 154 `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` (sha256
    `1cc55ef9…8475`) calls `GetFrontend()->toolsRemoved` only at line 190, inside `WebMCPToolRemoved`.

## Mutation M1 — the C2 counter cannot enforce "opened this round" or attribution

C2 counter predicate, `measure.mjs` at b444ca8 (lines 204-215). For each cited row it checks:
- 13 fields
- tier A or B
- status `mined`
- used-by contains the note
- at least one non-own-work row

It checks neither the accessed date nor the statements. Probe:
- `git clone` to `/tmp/attacksrc-mut.M7i6/l`
- check out b444ca8
- set the Accessed column of S030–S036 to `2026-10-19`; `git diff --word-diff` → `7 [-2026-10-20-]{+2026-10-19+}`
- commit (`1351a122…`)
- `node .ufo/waves/round-16/measure.mjs 1351a122… --claim C2`

Output: `{"revision":"1351a122ca3031af38457249aec6e4bfd774e7ba","c2_webmcp_held":1,…}`, exit 0.

So the counter's 0→1 for C2 is structural only. §2b sourced-claim fidelity rests on a human read like this one. That is a
tradeoff to state in the claim, not a counter defect to hide.

## Commands run (all read-only on the lane)

- `git log/show/diff/grep` at `e38d259`/`8f7feb3`/`b444ca8`
- `node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2` →
  `"c2_webmcp_held":1,…"failures":[]`, exit 0
- source fetches with `curl` into `/tmp/attacksrc.STDz`; gitiles `?format=TEXT` decoded with base64
- `git clone --filter=blob:none https://github.com/webmachinelearning/webmcp.git`
- `strings` on `/usr/lib/chromium/chromium`
- mutation M1 in `/tmp/attacksrc-mut.M7i6`

Recomputed sha256 matched the recorded digests for S033 (`50dd337d…6364`), S034 (`99b92e67…1d2b`), S035 (`f386bcfd…f99f`) and
S036 (`c23d575e…b632`).
