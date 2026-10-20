# SrcSpecSecurity — round 16, wave 1

Scope: the WebMCP spec's Security and Privacy Considerations (and its normative API/permissions
sections that the security section depends on), plus every explainer-side security/permission
statement in the `webmachinelearning/webmcp` repo. Read-only: no browser, no Playwright, no gate,
no counter, no selftest, no repo edits. This file is the only write.

Axes: (1) secure-context requirement; (2) permission / user-activation rules; (3) cross-origin
iframe and `exposedTo` exposure rules; (4) what the C2 harness may legitimately assert as
*spec-backed* versus implementation-only. Report is author-side advice, not verification.

## Provenance — what was opened, how, and binding identities

Fetch method was `curl -sS -L` on 2026-10-20 (server `GitHub.com`, HTTP/2 200). Line anchors below
are into the local snapshots, whose SHA-256 is recorded so the lines can be re-derived byte-exactly.

| Artifact | URL | Access | Bytes | SHA-256 | Identity |
|---|---|---|---|---|---|
| `spec.html` (CG-DRAFT) | https://webmachinelearning.github.io/webmcp/ | 2026-10-20 | 505949 | `180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a` | `<meta name="revision" content="cb3d16964ab3e92cfd5f09901ed0504373a906e8">` (`spec.html:11`); page date `2026-10-20` (`spec.html:845`); `last-modified: Tue, 20 Oct 2026 09:54:46 GMT` |
| `explainer.md` (repo README) | https://raw.githubusercontent.com/webmachinelearning/webmcp/main/README.md | 2026-10-20 | 37575 | `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` | last commit touching README.md per GitHub API: `14ae813cc4e9fe0d39313f4b1ee5b231746731ad`, 2026-10-08T11:26:23Z (observed before API rate-limit hit) |
| `security-privacy-questionnaire.md` | https://raw.githubusercontent.com/webmachinelearning/webmcp/main/security-privacy-questionnaire.md | 2026-10-20 | 9229 | not hashed (raw fetch, same branch as explainer) | W3C self-review questionnaire answers |
| `declarative-api-explainer.md` | https://raw.githubusercontent.com/webmachinelearning/webmcp/main/declarative-api-explainer.md | 2026-10-20 | 10417 | not hashed | declarative `<form>` design doc |
| `secure-contexts.html` | https://w3c.github.io/webappsec-secure-contexts/ | 2026-10-20 | 128785 | not hashed | normative loopback rule, quoted below |

**S020 divergence (needs L1 action if S020 is mined).** `corpus/SOURCES.md:34` records S020 as
`CG-DRAFT 2026-10-16, revision f14762e6`. The live document now self-identifies as
`revision cb3d1696…`, dated 2026-10-20, `last-modified` 2026-10-20T09:54:46Z. The spec moved between
the row and this open. Any S020 quote must be re-stamped against `cb3d1696…` / `180c55ba…`, not
`f14762e6`.

Quote discipline: tags stripped and typographic quotes/apostrophes normalized to ASCII; all quoted
fragments are contiguous in the located line(s) and are ≤25 words each.

## 1. Secure context — required, on the attribute and the interface; no Worker exposure

The IDL applies `[SecureContext]` twice, so the gate is not an algorithm step and cannot be
bypassed by call order:

- `spec.html:1488-1490` — `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };`
  - quote: `[SecureContext, SameObject] readonly attribute ModelContext modelContext;`
- `spec.html:1505-1506` — `[Exposed=Window, SecureContext] interface ModelContext : EventTarget {`
  - quote: `[Exposed=Window, SecureContext] interface ModelContext : EventTarget {`
- The two event interfaces repeat it: `spec.html:2210` and `spec.html:2228` both read
  `[Exposed=Window, SecureContext]`.

Consequences (observed from the IDL, WebIDL semantics are `[INFERENCE]` from the attribute's
definition):

- `Exposed=Window` only: the document declares exactly three interfaces — `ModelContext`
  (`spec.html:1506`), `ToolActivatedEvent` (`spec.html:2211`), `ToolCancelEvent` (`spec.html:2229`) —
  each preceded by `[Exposed=Window, SecureContext]`, plus the `partial interface Document`
  (`spec.html:1488`, no `[Exposed]`). No `Worker`, `SharedWorker` or `ServiceWorker` global appears
  anywhere, so tool registration is unavailable in workers by construction. Evidence note: the
  deployed HTML syntax-highlights IDL tokens (`Exposed` and `Window` are separate elements), so a
  literal `grep 'Exposed=Worker'` returns 0 for every value and is **not** a valid absence test;
  the claim rests on reading every `interface` declaration plus the IDL index (`spec.html:3059-3100`).
- A non-secure-context document exposes no `modelContext` property at all; there is no
  "present but rejects" path for the secure-context condition, unlike the Permissions Policy path.
- Each frame gets its own object: `spec.html:1482-1483` — `Each Document object has an associated ModelContext, which is a ModelContext object.` The getter (`spec.html:1494-1500`) only returns that object and performs **no** permission check (see §2).

**Loopback is a secure context, so the C2 harness needs no TLS.** The spec's own
`potentially trustworthy` link resolves to the Secure Contexts algorithm, which states at
`secure-contexts.html:1203-1205`:

> If origin's host matches one of the CIDR notations 127.0.0.0/8 or ::1/128, return "Potentially Trustworthy".

(the sentence is rendered across `secure-contexts.html:1203-1205` as two source lines; the joined
text is verbatim). Therefore `http://127.0.0.1:<port>` satisfies
`[SecureContext]` unconditionally, while `http://localhost:<port>` depends on the UA conforming to
the spec's `let-localhost-be-localhost` conditions (`secure-contexts.html:1206-1213`). This is
`[INFERENCE]` applied to the harness plan, but it is an inference over two sourced rules, not a
guess: keep the literal `127.0.0.1` in the C2 harness rather than `localhost`.

## 2. Permission rule that exists: Permissions Policy feature `tools`, default `'self'`

The only permission gate in the document is a policy-controlled feature; there is no Permissions
API integration (`grep -c -i 'permissions.query\|navigator.permissions' spec.html` → `0`).

Normative statement, §4.4 (`https://webmachinelearning.github.io/webmcp/#permissions-policy`),
`spec.html:2244-2245`:

> Access to the APIs in this specification is gated behind the policy-controlled feature "tools", which has a default allowlist of 'self'.

`registerTool` enforces it before any registration state is touched, `spec.html:1567-1568`:

> If tool owner is not allowed to use the "tools" feature, then return a promise rejected with a "NotAllowedError" DOMException.

The same `allowed to use` check gates `getTools` (`spec.html:1724`), `executeTool` on the target
document (`spec.html:1757`) and on the calling document (`spec.html:1854`), and the "notify
documents of a tool change" algorithm (`spec.html:1258`). `NotAllowedError` appears on 6 source
lines; `allowed to use` on 8.

Two details that matter for a harness:

- The `document.modelContext` **getter is not gated** by `tools` (`spec.html:1494-1500`). In a
  disallowed frame the object exists and `registerTool`/`getTools`/`executeTool` reject with
  `NotAllowedError`. A harness that asserts "API absent" for a policy-disabled frame would be
  asserting something the spec does not say.
- `registerTool` checks `fully active` **before** the permission check (`spec.html:1564-1567`:
  `If tool owner is not fully active, then return a promise rejected with an "InvalidStateError"`),
  so a detached document yields `InvalidStateError`, not `NotAllowedError`.

Spec-recommended site mitigation, §6.4.1 (`#mitigation-disable-permissions-policy`),
`spec.html:2658-2662` — note this is inside the **non-normative** §6:

> Site authors can deliver a Permissions-Policy: tools=() response header.

> This defense applies to every descendant frame, including both same-origin and cross-origin ones.

> The user agent enforces this before script runs on the page

Explainer corroboration (author-facing restatement, not normative), `explainer.md:327` and
`explainer.md:333`:

> By default, WebMCP is enabled in top-level `Window`s and its same-origin iframes, but access can be delegated to cross-origin iframes

> Calls to `document.modelContext.registerTool()` will return a promise rejected with `NotAllowedError` DOMException when the permission is disabled

The questionnaire states the same default in first-party/third-party terms,
`security-privacy-questionnaire.md:73`:

> It is allowed in top-level documents and same-origin descendants by default

## 3. User activation: no requirement anywhere — confirmation is delegated, not specified

This is the strongest negative finding and it is reproducible by count, not by impression. On the
2026-10-20 snapshots:

```
grep -c -i 'user activation'                spec.html=0 explainer.md=0 security-privacy-questionnaire.md=0
grep -c -i 'transient activation'           spec.html=0 explainer.md=0 security-privacy-questionnaire.md=0
grep -c -i 'gesture'                        spec.html=0 explainer.md=0 security-privacy-questionnaire.md=0
```

Reading every step of `registerTool` (`spec.html:1555-1614`) and `executeTool`
(`spec.html:1846-1930`) confirms that no step conditions on activation, consent, or a user prompt;
the only preconditions are `fully active`, the `tools` feature, name/schema validity, origin
matching and traversal identity. What the document does instead:

- It names permission prompting as an **agent** decision, not a page or UA precondition,
  `spec.html:2535`: `agents rely on natural language descriptions to decide whether to invoke a tool and whether to prompt the user for permission`.
- It states the resulting capability without a browser-side check, `spec.html:2537`:
  `having an authenticated state means tools can perform high-privilege actions without additional verification`.
- Confirmation is a **proposed mitigation**, `spec.html:2675-2678` (§6.4.5, non-normative):
  `selectively enforce mandatory user confirmation prompts before executing high-stakes tools`,
  driven by an author-supplied `consequentialHint`.
- The questionnaire records that the hint can go the other way, `security-privacy-questionnaire.md:63`:
  `a readOnlyHint may cause the agent to skip a confirmation step`.
- Explicit user prompting is still an open question, `explainer.md:529`:
  `Exploring a way for a tool to prompt the user for confirmation when tools require explicit user authorization.`

So: **no browser-side gesture gate, no activation requirement, no specified consent UI.** The only
per-execution option the callback receives is an abort signal — `spec.html:2024-2026` defines
`dictionary ToolExecuteCallbackOptions { required AbortSignal signal; };` — i.e. cancellation, not
consent. `[INFERENCE]` applied from those algorithms (no browser run here): a page script, or a
cross-origin frame holding `allow="tools"`, can register and an in-page agent can execute tools with
zero user gesture; whether the user is asked is entirely the agent implementation's behaviour. Any
C2 case that claims "requires user activation" would be false against this draft.

## 4. Cross-origin iframe exposure — layered opt-ins, default closed

Default exposure is same-origin-only, stated at the spec's exposure predicate
(`spec.html:1295-1306`) and at `spec.html:1301`:

> If tool owner origin is same origin with accessing origin, then return true.

The exposure list starts empty when `exposedTo` is omitted (`spec.html:1619`:
`Let exposed origins be an empty list of origins.`). Layered rules:

1. **API availability in the frame** — needs `allow="tools"` (or the header), otherwise
   `NotAllowedError`; delegated per §2 and `explainer.md:327`.
2. **Registration-time origin list** — `exposedTo` entries must be potentially trustworthy or the
   promise rejects, `spec.html:1629-1630`:
   > If parsedURL is failure or its origin is not potentially trustworthy, then return a promise rejected with a "SecurityError" DOMException.
3. **Query-time origin list** — `getTools({fromOrigins})` rejects non-trustworthy entries the same
   way (`spec.html:1736-1737`), and `executeTool` additionally re-checks that the supplied
   `RegisteredTool.origin` still matches the live target document
   (`spec.html:1859-1863`: opaque origin → `NotSupportedError`; `spec.html:1919`: mismatch →
   `NotFoundError`).
4. **Traversal boundary** — execution cannot cross top-level browsing contexts:
   `spec.html:1909-1913` rejects with `InvalidStateError` when target and caller are not in the same
   traversable navigable, and the spec notes it is "Consider supporting tool execution across
   top-level documents in the same browsing context group. [Issue #227]". So a cross-origin frame
   that is allowed and exposed can only be driven from within the same tab's frame tree.

Spec-level statement of the default, `explainer.md:337`:

> tools registered by a document are only exposed to itself, same-origin documents in the same tree, and built-in browser agents

`getTools` default, `explainer.md:357`:

> By default, `getTools()` only returns tools registered by documents same-origin with the caller in the frame tree.

Questionnaire restatement, `security-privacy-questionnaire.md:7`:

> Cross-origin iframes may discover these tools only if the tool author explicitly opts in via `exposedTo`

**Anti-probing property** worth an explicit harness case, `spec.html:1936-1940`:

> […] prevents a cross-origin caller from using fabricated RegisteredTool dictionaries to probe targetDocument's current origin or enumerate private tools not exposed to callerOrigin.

All three failure paths (origin mismatch, unknown tool name, not-exposed) deliberately collapse to
the same `NotFoundError`, so error identity leaks nothing.

**Built-in agent exposure is not specified.** The running design idea is that a missing `exposedTo`
in the top-level document exposes tools to the browser agent, while in iframes it would not
(`explainer.md:519`, open-question list, explicitly labelled "running idea"). Do not assert
built-in-agent exposure from the spec draft.

## 5. The security section itself is non-normative, and one subsection is a TODO

§6 opens with `This section is non-normative.` (`spec.html:2349`) and
`This document cannot define precise mitigation strategies that agents or user agents must provide.`
(`spec.html:2366`). Therefore the enforceable WebMCP security rules are the IDL gate (§1), §4.4
(§2) and the `exposedTo`/`fromOrigins` algorithms (§4); §6.3/§6.4 are risk narrative and
recommendations.

The same-origin analysis is unwritten, `spec.html:2646` (§6.3.4, the entire body of the section):

> TODO: Document risks and implications of agents carrying state from one origin to another.

The questionnaire confirms the gap and states the residual risk in its own words,
`security-privacy-questionnaire.md:112`:

> agents browsing multiple origins may carry state from one origin to another if not handled securely by the user agent

and `security-privacy-questionnaire.md:114` says the section "is currently marked as TODO in the
draft spec". Consequence for the lane: any claim that the spec *defines* cross-origin state
handling is unsupported; the spec defines only the exposure/permission mechanics in §4.

## 6. Divergences the C2 note must not smooth over

1. **Declarative `<form toolname>` is not in the spec at all.**
   `grep -c -i 'declarative' spec.html` → `0`; `grep -c 'toolname=' spec.html` → `0`. The only
   `toolName` occurrences are `RegisteredTool`/event attributes. The declarative design lives in
   `declarative-api-explainer.md`, and that file contains **no** security, permission, iframe,
   origin, activation, consent or trust text:
   `grep -c -i -E 'secur|permission|iframe|origin|activation|consent|trust' declarative-api-explainer.md` → `0`.
   So Chromium's `DeclarativeWebmcp` path (PLAN pre-probe) implements a proposal whose exposure and
   permission rules are **unspecified**; the harness may record behaviour, but must label it
   implementation-defined rather than spec-required.
2. **`document.modelContext` only.** IDL is `partial interface Document`
   (`spec.html:1488`); there is no `Navigator` extension, matching the PLAN pre-probe that
   `'modelContext' in navigator` is false. Spec and Chromium agree here.
3. **Policy-disabled ≠ API-absent** (§2). If the harness has a `tools=()` case, the expected
   observable is a rejection from the three methods, plus the object still being present.
4. **No user-activation case exists** (§3). If the harness wants a "no gesture needed" case, it is
   asserting a negative the spec supports by absence; phrase it as "executes with no activation
   step" and cite the zero counts, not a quote.

## 7. Limits and remaining unknowns

- Line numbers are valid only for the recorded snapshot digests; the deployed document changed
  between the S020 row (revision `f14762e6`, 2026-10-16) and this open (`cb3d1696…`, 2026-10-20), and
  the page is regenerated from `index.bs` on every push. Re-anchor by `#security-privacy` /
  `#permissions-policy` / `#document-extension` and the digest, not the line alone.
- I did not read `index.bs`, so I cannot say whether the generated HTML omits source-level
  annotations (`[SecureContext]` is present in the output IDL, which is what the harness observes).
- I did not open the linked issues (#165 `requestUserInput`, #50 `ModelContextClient`, #179
  `native-agents`). The questionnaire references them as active discussion; their state is unknown
  here, and no statement above depends on them.
- No browser was launched and no observable in Chromium 154 was checked by me; the harness seat owns
  the runtime evidence. Everything in §1-§5 is document law, not observed engine behaviour.
- `declarative-api-explainer.md` and `security-privacy-questionnaire.md` were fetched from `main`
  (moving branch) and not hashed; only the explainer's last-touching commit was pinned
  (`14ae813c…`, 2026-10-08). If either is quoted in `corpus/`, re-fetch and hash at quote time.

## 8. One-line handoff

Spec-backed and safe to gate on: `[SecureContext]` on attribute+interface (`Exposed=Window`);
Permissions Policy `tools` default `'self'` with `NotAllowedError` (but the getter is ungated);
`exposedTo`/`fromOrigins` requiring potentially trustworthy origins with `SecurityError`,
same-origin default, and uniform `NotFoundError` anti-probing. Not spec-backed: any user-activation
requirement, any consent UI, built-in-agent exposure in iframes, declarative form tools, and
cross-origin state isolation (§6.3.4 is a TODO). Loopback `http://127.0.0.1` is a secure context by
CIDR rule, so the C2 harness needs no certificate.

Tooling: no installs or upgrades were performed for this slice.
