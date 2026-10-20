# SrcExplainerExec-2 — WebMCP README / explainers on invocation, execution and submit response (r17 / C2 source seat)

Seat `TabiR17.SrcExplainerExec-2`, leaf, read-only outside my two assigned paths.
Access date for every quote below: **2026-10-20**. Fetch method: `git clone --filter=blob:none --depth 1`
over HTTPS plus `curl` of `raw.githubusercontent.com` at the pinned commit (not the web UI), so every
`file:line` is repo-relative at the commit named. No tool installed or upgraded (git/curl/sha256sum/awk
already present; zero installs, zero pacman transactions).

## Answer in brief

1. **Revision** — `webmachinelearning/webmcp` `main` at access is
   `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`, `2026-10-20T10:57:14-04:00`, subject
   `Discuss general agent ecosystem risks and link to agent security guidance (#334)`.
   `git ls-remote origin HEAD refs/heads/main` returned that same SHA for both, so this is the branch
   tip, not a stale mirror. It is one commit after r16's `cb3d16964ab3e92cfd5f09901ed0504373a906e8`.
2. **What actually changed since r16** — `api.github.com/.../compare/cb3d1696...51ed7565`:
   `ahead_by=1`, `total_commits=1`, files `[index.bs modified +55 -0]`. **Only `index.bs` moved.**
   README.md, declarative-api-explainer.md, continuations-explainer.md and
   security-privacy-questionnaire.md are byte-identical at the two commits (raw sha256 equal, below).
   So this row's novelty is **scope**, not revision: it anchors the invocation/response semantics that
   r16's rows (S030 README:319, S031 declarative:108-115) did not cover.
3. **The target's suggested `docs/` paths do not exist.** `docs/` holds exactly one file
   (`service-workers.md`); `docs/proposal.md` and `docs/security-privacy*.md` are HTTP 404. The
   security-privacy questionnaire is at repo **root**. Sweep with codes under "Sweep" below.
4. **Core semantics** — a call is agent → browser → page: the browser mediates, invokes the tool's
   `execute` callback with schema-shaped arguments, and the callback's return value is the response
   (README.md:308-313). In-page agents use `executeTool(tool, args, {signal})`, which the browser
   mediates and runs "in the tool owner's execution context" (README.md:375).
5. **Declarative form submission** — `SubmitEvent` gains `agentInvoked` (boolean) and
   `respondWith(Promise<any>)`; `respondWith` overrides the default submit, suppresses navigation and
   requires `preventDefault()` first (declarative-api-explainer.md:157-171). This is a **proposal**:
   README.md:319 says declarative is "not part of the specification at this time".
6. **The load-bearing separation for C2** — the README and all three explainers never name CDP:
   `grep -rn 'invokeTool\|CDP\|DevTools\|invocationId\|toolInvoked\|toolResponded' --include='*.md' .`
   → **0 hits** at 51ed7565. Command/event shapes must come from S035 (the `WebMCP.pdl`); this row
   grounds only the *semantics* a receipt is allowed to assert.

## Verbatim quotes (each ≤25 words, exact substring, verified by `grep -cF`)

| Quote | Location | Words |
|---|---|---|
| The browser mediates the call, invokes the tool's `execute` callback with the provided arguments | README.md:312, §Lifecycle of a Tool Call step 4 | 14 |
| The agent requests a tool call, sending structured arguments matching the tool's `inputSchema` | README.md:311, §Lifecycle step 3 | 13 |
| The page's callback returns structured results back to the agent | README.md:313, §Lifecycle step 5 | 10 |
| and the tool runs in the tool owner's execution context | README.md:375, §Discovering and running tools | 12 |
| it is not part of the specification at this time | README.md:319, §Future Exploration: Declarative API | 11 |
| The `SubmitEvent` interface gets two new members, `agentInvoked` to let `submit` event handlers react to agent-invoked form submissions, and the `respondWith()` method | declarative-api-explainer.md:159-160, §Events | 22 |
| readonly attribute boolean agentInvoked | declarative-api-explainer.md:170, §Events IDL | 4 |
| takes a `Promise<any>` that resolves to the response that the agent will consume | declarative-api-explainer.md:162, §Events | 15 |
| the form's `action` will NOT | declarative-api-explainer.md:163-164, §Events | 5 |
| the submit button into focus | declarative-api-explainer.md:52, §Form attributes (`toolautosubmit` absent) | 5 |
| and submit it manually | declarative-api-explainer.md:53, §Form attributes | 4 |
| in-flight invocation of the tool will be cancelled | declarative-api-explainer.md:103, §Changes to form reset | 8 |
| This topic is currently under debate | declarative-api-explainer.md:119, §Getting the form response to the agent | 6 |
| this event does not fire when the site itself cancels the tool | declarative-api-explainer.md:187, §Events (`toolcancel`) | 12 |
| If a site executes a server request that navigates the document | continuations-explainer.md:18, §Overview | 11 |
| tool request is ended and the agent does not receive a success signal | continuations-explainer.md:19, §Overview | 13 |
| Tokens cannot be requested or redeemed on inactive documents or frames | continuations-explainer.md:220, §Document Lifecycle Considerations | 12 |
| Tool registrations are tied to the document's lifetime | security-privacy-questionnaire.md:33, Q06 | 8 |
| this behavior is not yet spec'd but is the intended direction | security-privacy-questionnaire.md:100, Q19 | 10 |
| Schema constraints provide hints to models | README.md:458, §Reliability and Error Handling | 6 |
| Investigating native validation of tool inputs and outputs | README.md:523, §Open Questions | 9 |
| a `readOnlyHint` may cause the agent to skip a confirmation step | security-privacy-questionnaire.md:63, Q12 | 11 |

## Draft registry row (paste into `corpus/SOURCES.md`; id assigned by L1 — first free is S041)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | WebMCP editors' explainers — call lifecycle and tool response paths — https://github.com/webmachinelearning/webmcp/blob/main/README.md | docs | A | Editors' statement of the invocation and execute contract plus its declarative and continuation response paths; never spec text, Chromium behaviour or CDP command shape | 51ed75653aaa7f174f8dbe05d1bc327359bbc57c (2026-10-20); README.md §Lifecycle of a Tool Call ll. 308-313 and §executeTool ll. 352-375; declarative-api-explainer.md §Events ll. 157-188 and §Getting the form response ll. 117-129; continuations-explainer.md ll. 15-20 and §Document Lifecycle Considerations l. 220; security-privacy-questionnaire.md Q12 ll. 57-65 and Q19 ll. 93-100 | Grounds which invocation outcomes a receipt may claim: execute arguments and returned response, not a navigation response or user consent | queued | 2026-10-20 | on-release | — |

Shape check on this exact line (`awk -F'|'`): `NF=13`, malformed `0` — the census expects 11 columns.
No `|` occurs inside any cell. The census row regex needs `S[0-9]{3,}`, so `S0??` counts 0 until L1
substitutes `S041`.

**Status transition at integration** (SOURCES rule 2 — log old→new, and only after the note exists, so
the "mined rows whose used-by paths do not exist" census stays clean):
`status queued→mined`; `used-by —→corpus/knowledge/webmcp-invocation-round-17.md`.

## Gate entry (for `corpus/lessons/round-17.md` §Gate)

- **S0??** — URL `https://github.com/webmachinelearning/webmcp/blob/main/README.md`
  (raw `https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md`).
  Accessed **2026-10-20**. Revision **51ed75653aaa7f174f8dbe05d1bc327359bbc57c**
  (`2026-10-20T10:57:14-04:00`, `#334`); `git ls-remote` HEAD = `refs/heads/main` = that SHA.
  Quote grounding `teaches`: **"The browser mediates the call, invokes the tool's `execute` callback
  with the provided arguments"** — `README.md:312`, §Lifecycle of a Tool Call step 4.
  Limit quotes: **"This topic is currently under debate"** — `declarative-api-explainer.md:119`;
  **"a `readOnlyHint` may cause the agent to skip a confirmation step"** —
  `security-privacy-questionnaire.md:63` (Q12); **"If a site executes a server request that navigates
  the document"** — `continuations-explainer.md:18`.
  Raw-fetch sha256 (pinned commit, HTTP 200 each):
  `README.md` `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` (37575 B);
  `declarative-api-explainer.md` `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` (10417 B);
  `continuations-explainer.md` `009b04ae31ffdb0c3ca211572d49f3a6d68cf85f66e0be541bfb8a3ac9fe9de8` (10512 B);
  `security-privacy-questionnaire.md` `76e65774f109f3f0b8ce296dda8116cb919ed616ddb00cb46841b9b5f75141c0` (9229 B).
  Same four sha256 at `cb3d1696` (r16's commit) — byte-identical, so no drift to reconcile.

## Facts this source supports for C2 (one anchor each; case names from the PLAN's required list)

| # | Fact | Anchor | Case it predicates |
|---|---|---|---|
| F1 | A call is five steps — registration, discovery, invocation with schema-shaped args, browser-mediated execution of `execute`, structured response. No browser-side error taxonomy is defined. | README.md:308-313 | `invoke-imperative-success`; `invoke-imperative-throws` / `-rejects` are page-side failures, not specified categories |
| F2 | Execution goes through `executeTool(tool, args, {signal})`; the browser checks `exposedTo`/`fromOrigins` and runs the tool in the owner's execution context. | README.md:352-375 | `invoke-imperative-success`, `invoke-iframe-frameid` |
| F3 | Invocations are cancellable mid-execution by AbortSignal (user stop button is the stated example). | README.md:394-396 | cancellation cases; any `AbortSignal`-based control |
| F4 | Declarative form tools are outside the specification today. | README.md:319 | every declarative case must be labelled implementation evidence |
| F5 | `SubmitEvent` gains `agentInvoked: boolean` and `respondWith(Promise<any>)`. | declarative-api-explainer.md:159-160, 170-171 | `invoke-declarative-form` (page observable: submit with `agentInvoked === true`; the promise's value is the tool response) |
| F6 | `respondWith` overrides default submit, suppresses navigation and requires `preventDefault()` first. | declarative-api-explainer.md:162-164 | `invoke-declarative-form` non-navigating path |
| F7 | Without `toolautosubmit`, the browser focuses the submit button and the agent "should then tell the user" to check and submit manually. | declarative-api-explainer.md:49-53 | a fill is not a submission; a receipt may not claim completion without autosubmit or a page-side observation |
| F8 | A form reset or `toolname`/`tooldescription` change cancels any in-flight invocation and notifies the agent. | declarative-api-explainer.md:101-104 | `invoke-after-unregister` (cancel, not silent success) |
| F9 | The navigating (cross-document) response path is under debate; the `ld+json` extraction idea sits in a pre-issue `<details>` block. | declarative-api-explainer.md:117-129 | `invoke-navigation-pending` — assert pending/terminated, not a specified response |
| F10 | `toolcancel` fires when the agent cancels and does **not** fire when the site cancels by removing or renaming the tool. | declarative-api-explainer.md:186-188 | distinguishes harness cancellation from page-side teardown |
| F11 | Whether `toolactivated`/`toolcancel` also fire for imperative invocations is an open question ("Chromium seems to do that"). | declarative-api-explainer.md:190-195 | any such event observed on 154 is build-scoped, not spec-guaranteed |
| F12 | Current semantics: one document and one Promise per call; a navigating server request **ends** the call and the agent gets no success signal or output. | continuations-explainer.md:15-20 | `invoke-navigation-pending` |
| F13 | Continuation tokens cannot be requested or redeemed on inactive documents/frames; a token is revoked if the caller aborts. | continuations-explainer.md:129-142, 220 | not in the required case list; do not build a case on tokens as if specified |
| F14 | On disconnect, pending invocations are abandoned (in-page Promise rejects; built-in agent is notified) — intended direction, not yet spec'd. | security-privacy-questionnaire.md:93-100 (Q19) | `invoke-after-unregister`, `invoke-navigation-pending` |
| F15 | Registrations are tied to the document's lifetime; persistence across navigation is not specified. | security-privacy-questionnaire.md:31-33 (Q06) | consistent with r16's S036 frame-drop inference |
| F16 | Only register-side errors are enumerated (`InvalidStateError`, `NotAllowedError`, `SecurityError`, `TypeError`); no invocation-side vocabulary. | security-privacy-questionnaire.md:102-104 (Q20) | `invoke-unknown-tool` — any error text is a build observation |
| F17 | Browser-side input/output validation against declared schemas is still being investigated. | README.md:523 | `invoke-input-schema-mismatch` must not assume browser-side rejection |
| F18 | Schema constraints are hints; strict validation failures can stall agents, so validation belongs in `execute`. | README.md:456-458 | same case: page-side validation is the modelled path |
| F19 | Annotations can make an agent skip a confirmation step; `requestUserInput` is still discussed (#165). | security-privacy-questionnaire.md:57-65 (Q12) | no receipt may claim user consent or confirmation |
| F20 | No CDP surface is named anywhere in the Markdown: `invokeTool`, `invocationId`, `toolInvoked`, `toolResponded` = 0 hits (`grep -rn ... --include='*.md' .`). | sweep, 51ed7565 | command/event shape must cite S035, never this row |

**C1: none.** No statement in this source bears on jj/git revision anchoring, lane tips, or gate
entries; this row is not C1 support and must not be counted as such.

## Drift and contradiction checks

- **S030** (README.md:319, "outside the specification") — byte-identical and still on line 319 at
  51ed7565; anchor holds, no supersession needed. This row is **not** a correction.
- **S031** (declarative-api-explainer.md:108-115, schema synthesis) — unchanged; section heading at
  106, TODO paragraph 108-115. Scope is disjoint: S031 = schema synthesis, this row = response path.
- **Round-16 note** (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`) — no contradiction. Its
  frontier line "No tool is invoked in the receipt" is consistent: this source names no CDP command
  (F20). Its §Limits ("page-level confinement", "navigation removal inferred") are consistent with
  Q06/Q19 and with F12.
- **r16 seat report wording** — `.ufo/waves/round-16/w1/SrcExplainer.md:17` says `toolactivated`/
  `toolcancel` appear "only in `index.bs`, not in the explainer", while `:224` of the same file cites
  `declarative-api-explainer.md:175-178` for them. Bytes are identical at both commits, so this is the
  report's README-vs-declarative use of "explainer", not text drift. `toolactivated` occurs in Markdown
  only at `declarative-api-explainer.md:175,180`; `title`/`annotations` remain IDL-only (`index.bs`).
- **PLAN caution** — the case id `invoke-navigation-pending` must not be read as "a response arrives
  after navigation": F12 says the call ends with no success signal, F9 says the response path is under
  debate. Predicate should be `pending → terminated/abandoned, no success output`, or the case will
  encode a guess as an expectation.

## Sweep (the target's named `docs/` paths)

`raw.githubusercontent.com/<commit>/<path>`, HTTP codes at 51ed7565:

| Path | Code |
|---|---|
| docs/proposal.md | 404 |
| docs/security-privacy.md | 404 |
| docs/security-privacy-questionnaire.md | 404 |
| docs/README.md | 404 |
| docs/index.md | 404 |
| docs/service-workers.md | 200 |
| security-privacy-questionnaire.md (repo root) | 200 |

`api.github.com/repos/webmachinelearning/webmcp/contents/docs?ref=51ed7565` → `['service-workers.md']`
(exactly one entry). `docs/service-workers.md` was opened and is **excluded** as evidence for page
invocation: it proposes SW-scoped `modelContext` and background discovery (ll. 134-138), states routing
across multiple client agents is unsolved (ll. 195-199), and names no protocol surface; sha256
`5a811973bee7c0c96e66a35990a0fe42d2547395698bd50b501da65e646b622a`. Worth a lead only if tabi ever
targets service-worker tools.

## Limits and unknowns

- Static read only; no browser run and no CDP call in this seat. Nothing here is evidence about
  Chromium 154 behaviour.
- A Community Group explainer is not normative: `index.bs` is the spec text and it did move (+55 lines)
  between `cb3d1696` and `51ed7565`; I did not read it (S020 owns the spec row).
- Branch tip is a moving target; `recheck: on-release` plus the pinned commit in the anchor.
- Exact-schema synthesis, cross-document responses, `outputSchema`, `requestUserInput` and
  `updateTool()` remain explicitly open in these documents (declarative:106-119, 204-207; README:523).

## Tooling

None installed or upgraded. Used git, curl, sha256sum, grep, awk, nl already present on the host.
No pacman transaction attempted (host-wide pause honoured). Clone at `/tmp/wmcp-explain/webmcp` and raw
copies at `/tmp/rawfetch` are temporary and deleted after this report.
