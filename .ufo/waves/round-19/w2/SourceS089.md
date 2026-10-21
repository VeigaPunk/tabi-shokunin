# SourceS089 — round-19 source falsification

## Finding

**Agree with S089's source identity, located lesson quote, decoded hash, scoped tier A, and narrow `teaches`; keep it queued, not mined.** No substantive source contradiction found. One metadata qualification: `used-by = —` omits the lesson's own Gate citation under the literal source-contract definition; that citation is not evidence of admitted knowledge. **Agree with S094's rejection; no rejection flip is justified.** Its fresh 404 response hash differs only because the response includes a different request ID.

Axis: **depth** — source fidelity, precise exported-contract boundaries, and admission/status calibration. This is a source audit, not a round-admission judgment.

Reviewed checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). The initial read-only `rev-parse --verify refs/heads/master` returned R. Registry anchors: `corpus/SOURCES.md:103,108`; lesson anchors: `corpus/lessons/round-19.md:45,51,53-56`. Access date for every fresh fetch below: **2026-10-21**.

## S089 fetches and exact quote

- Registry URL (fetched exactly; HTTP 200): https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/generated/protocol.ts
- Lesson/raw URL (fetched exactly; HTTP 200): https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/generated/protocol.ts
- Raw decoded source: **611,260 bytes; 23,012 newline-terminated lines**.
- Raw SHA-256: `2d77790a775f2db3de2842cea1c37509a2fb535d3e737214d8c462a08c47267d` — exact match to lesson `:45`, gate JSON `:19`, and registry abbreviation. **No immutable-source drift.**
- Located lesson quote: `export const enum InvocationStatus {` — **5 whitespace-delimited words**, exactly at `front_end/generated/protocol.ts:20223`; stated range `20223-20227` correctly contains the complete enum.
- The GitHub HTML wrapper is a different representation: **849,004 decoded bytes**, SHA-256 `90309b4ff30ec8ab86cfb1829a041b7d8f34f6742fdeddc5bb5d9f46942b6b2a`. Its title/ref identify the same pinned file. Do not compare this dynamic wrapper's hash with the source hash.
- Retained raw source, gzip with no stored filename/timestamp: `.ufo/waves/round-19/w2/SourceS089.body.gz` (**127,557 compressed bytes**). The SHA above is over the decoded TypeScript, not HTTP compression or the gzip artifact.

All source quotes in the next table refer to the raw URL above, accessed 2026-10-21, decoded SHA-256 `2d77790a775f2db3de2842cea1c37509a2fb535d3e737214d8c462a08c47267d`.

| Observed symbol/fact | Exact quote | Words | Location |
|---|---|---:|---|
| Enum members, with no fourth member in the complete declaration | `Completed = 'Completed', Canceled = 'Canceled', Error = 'Error',` (consecutive source lines) | 9 | `protocol.ts:20224-20226` |
| Event status uses that enum | `status: InvocationStatus;` | 2 | `protocol.ts:20359` |
| Output is an optional property | `output?: any;` | 2 | `protocol.ts:20364` |
| Error text is a distinct optional property | `errorText?: string;` | 2 | `protocol.ts:20368` |
| Exception is a distinct optional property | `exception?: Runtime.RemoteObject;` | 2 | `protocol.ts:20372` |

`WebMCP` is the namespace at `:20196`; `ToolRespondedEvent` begins at `:20351`. Its `invocationId` and `status` lack the optional marker (`:20355,20359`). The auto-generated notice and generation command are at `:5-8`.

### Verifying the Chromium 154 scope

This scope need not rest on a milestone inference. The Chromium tag root directory listed `DEPS`; its tagged body was then fetched:

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT
- HTTP 200; access 2026-10-21; base64-decoded body **197,649 bytes**.
- Decoded SHA-256: `dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d`.
- Quote: `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` — **2 words**, `DEPS:424`.
- `DEPS:2215-2216` binds `src/third_party/devtools-frontend/src` to that revision variable. Thus the frontend revision is actually pinned by Chromium **154.0.8037.97**, not merely assumed to be contemporaneous.

This auxiliary pin check audits S089's scope; it does not add or mine another registry row.

## Definition/caller trace and entailment boundary

**Semantic-tool availability:** `read xd://lsp` returned `No such tool: xd://lsp` and a mounted-device list without LSP. No server was available to start/check/warm or query. Consequently the following is a bounded **literal source trace**, not LSP-resolved references or a claim of exhaustive callers.

Definition/use within the freshly fetched source: `WebMCP.InvocationStatus` (`:20223-20227`) → `WebMCP.ToolRespondedEvent.status` (`:20359`), alongside the three optional properties above.

A named, previously retained consumer was also inspected without reopening other queued source rows: `.ufo/waves/round-19/w1/RevDeclErrorSurface.WebMCPModel.ts.gz`, member `RevDeclErrorSurface.WebMCPModel.ts`, `:21-49,230-258`. Decoded SHA-256 was freshly recomputed as `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`, matching its existing dossier. Its source identity is https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts (retained-body inspection on 2026-10-21; not a new network fetch).

Observed consumer: `WebMCPModel.toolResponded(params: Protocol.WebMCP.ToolRespondedEvent)` (`:249`) looks up the invocation, skips unknown IDs, converts an optional exception to an SDK remote object, then creates `Result`. Quote: `call.result = new Result(params.status, params.output, params.errorText, exception);` — **7 words**, `WebMCPModel.ts:256`, source URL/hash immediately above. The `Result` constructor preserves the separate status/output/errorText/exception values (`:21-35`).

**Entailed:** at this implementation revision the generated frontend contract declares exactly the three named enum values, and the three response properties are separately optional. `code` and **A** are appropriate for this tightly scoped, primary checked-in generated-code claim. The lesson's 5-word opener is exact but weak in isolation: the enum values and optional-field entailment come from the additional correctly located source ranges, not from the opener alone.

**Not entailed:** actual invocation outcomes, Blink validation behavior, remote payload validation, output/error mutual exclusion, or an exhaustive runtime status universe across versions. The interface is not a discriminated union enforcing field combinations; its output comment at `:20361` is not executable enforcement. This is an implementation-associated generated **frontend contract**, neither a proposal/spec nor a fresh browser runtime observation. No browser was launched, and no runtime acceptance claim is made.

## Status, recheck, and used-by

Observed row values: `code`; `A`; Chromium 154 generated `InvocationStatus`/`ToolRespondedEvent` scope; `queued`; `opened 2026-10-21`; `on-release`; `used-by —` (`corpus/SOURCES.md:103`). All are justified for the narrow source claim except the backlink qualification below. A commit pin protects the captured body; `on-release` is still sensible for checking whether the current browser's contract changed.

A bounded literal search for `S089` in `SKILL.md`, `corpus/knowledge/`, and `corpus/lessons/round-19.md` returned only the lesson Gate source row at `round-19.md:45`. This supports keeping S089 **queued**, and does not supply mined/admitted knowledge or C1 credit. No other queued row was promoted or audited.

**Metadata qualification (medium confidence as a defect classification):** `CORPUS.md:107-108` defines `used-by` to include lessons citing the row. The lesson does cite S089, so `—` is incomplete under that literal definition; `corpus/lessons/round-19.md` is an existing resolvable backlink. A gate-only source listing should not be used to manufacture mined status or expansion credit. The source fact is sound regardless of how L1 resolves this gate-citation/backlink convention. No registry edit was made.

## S094 rejection cross-check

- Exact URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT
- Fresh result: **HTTP 404**, `text/plain; charset=utf-8`, **233 decoded bytes**, 8 lines; accessed **2026-10-21**.
- Quote: `NOT_FOUND: Requested entity was not found` — **6 words**, response line **1**.
- Fresh response SHA-256: `8491c1e6e90b9737c870cf3dea2d73d0a3e0375754b55e5837d0f6a89411092e`.
- Lesson `:51` records `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. The old retained artifact (`corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz`, member of the same basename without `.gz`) was inspected: all displayed response lines match the fresh response except `request_id` on line 7. The response hash drift does **not** mean an immutable source file changed; no such source body was retrieved.

**Agree with rejection and scoped tier C.** This proves the exact attempted filename does not resolve at the tag, not that Chromium has no form-schema tests. **Flip condition remains unfulfilled:** obtain a resolvable actual test file and its own located, relevant quote before admitting it. `html_form_mcp_tool_test.cc` remains an unopened lead for this seat; the lesson itself says its prior gate quote came from a different file. Neither a lead nor a quote borrowed from an implementation file is test-file evidence. Keep S094 rejected; no flip now, and never change SOURCES in this audit.

## Confidence and remaining unknowns

- **High:** S089 exact body/hash/quote/line binding, three enum members, optional-field declarations, Chromium-tag frontend pin, and S094's exact-path 404 rejection.
- **Medium:** classifying the missing Gate backlink as a contract defect versus an intentional gate-only citation convention; observed bytes are unambiguous, interpretation is stated above.
- **Unresolved/out of scope:** exhaustive semantic callers (LSP unavailable), browser/runtime wire behavior, and whether the alternative test-file lead contains an admissible quote. None is silently inferred from generated types.
- Exercised only source fetch/hash/line/pin checks and retained-caller inspection. No build, linter, suite, runtime probe, orchestration, or package install/update was run. No long-lived process was started.

## Isolation

- Mode: advisory/report-only; no runtime or mutation probe, so no sandbox clone was required or created.
- Clone / branch: none.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`; inspected checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Authored clone commit: none; no git write or jj command was run.
- Production changed paths: none; SOURCES and domain source trees unchanged by this seat.
- Seat-owned LANE writes only: `.ufo/waves/round-19/w2/SourceS089.md`, `.ufo/waves/round-19/w2/SourceS089.body.gz` (temporary uncompressed seat artifact was consumed by gzip). Fetch/decoding scratch remained under `/tmp`.
