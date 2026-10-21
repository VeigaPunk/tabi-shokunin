# WebMCP inputSchema source scout

## Verdict

The pinned WebMCP CG Draft does **not** prescribe a normative validator that checks a tool invocation against `inputSchema`. The `ModelContextTool.inputSchema` member is described as a JSON Schema; the normative `registerTool()` algorithm serializes and stores it. The only statement that an invalid schema rejects registration, and that an `executeTool()` input is expected to match the schema, is in the explicitly non-normative DOM intro. The normative tool callback algorithm maps JSON parse failure or a non-Object argument to the internal `invalid input` error, associated with `DataError`; that is not a schema-mismatch error. No declarative/form API or declarative validation rule occurs in this pinned `index.bs`.

## Source identity and custody

- Rendered draft: <https://webmachinelearning.github.io/webmcp/> — accessed 2026-10-21; response body SHA-256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`, 511,987 bytes.
- Pinned source: <https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs>; raw fetch URL: <https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs> — accessed 2026-10-21. GitHub `main` resolved to commit `51ed75653aaa7f174f8dbe05d1bc327359bbc57c` (commit date 2026-10-20T14:57:14Z); its `index.bs` matched the pinned raw body byte-for-byte. The decoded UTF-8 body SHA-256 is `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`, size 91,001 bytes (2,053 lines). The source metadata labels it `CG-DRAFT` (`index.bs:1-8`).
- Retained decoded source body: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/TabiR19-2.SrcWebmcpSpecDecl-4.body.gz`; gzip file SHA-256 `c3919472a02a3825f38fc14d5b26de062a25e03ef8c56249d893c715be049aff`, size 24,124 bytes. The compressed artifact contains the decoded pinned `index.bs` body above.
- No tools were installed or updated.

## Observed facts

- `inputSchema` is a schema description, while the registration algorithm stores its JSON-stringified representation. The `ModelContextTool` dictionary's field is optional (`index.bs:1191-1201`), and its description calls it a JSON Schema for expected parameters (`1237-1240`).
- `registerTool()`'s normative steps check ordinary registration constraints, serialize `inputSchema` if present, propagate serialization exceptions, re-check document/duplicate-registration state, then store the string (`753-803`, `804-819`, `849-897`). They do not name a JSON Schema validation operation or define the semantics of schema-invalid input.
- The `executeTool()` DOM intro says callers are expected to match `RegisteredTool.inputSchema` and that omitted input becomes an empty object (`726-735`), but all DOM intro material is explicitly labeled non-normative (`44-46`).
- The normative `executeTool()` method defaults omitted input to an ordinary object, asserts Object, and JSON-serializes it (`1023-1053`). The callback algorithm parses `inputArguments`; parse failure and a non-Object each take the `invalid input` branch (`547-560`). It then fires `toolactivated` and invokes the execute callback with that parsed object (`562-583`); no schema comparison appears in that path.
- The normative error table defines `invalid input` as failure to parse arguments into a JavaScript Object and maps it to `DataError` (`260-278`). Completion rejects with a DOMException named for the corresponding error (`1146-1155`); the error note says the caller observes the corresponding exception name, not the internal error object (`293-301`).
- The source-level note about UI and direct-tool paths possibly using different validation logic is in the explicitly non-normative Security and Privacy Considerations section (`1587-1590`, `1790-1809`); it is a risk observation, not a validation algorithm.
- Case-insensitive text search of the full pinned body found no `declarative`, `form tool`, `invalid argument`, or `invalid-argument` occurrence. S030 already records the editors' separate statement that the declarative form API is outside the specification. S071 is Chromium implementation evidence, not a WebMCP spec rule.

## Inference and unresolved scope

- **[INFERENCE]** The normative draft does not require WebMCP to validate actual invocation arguments against JSON Schema: the full `registerTool()` algorithm only serializes/stores the schema, and the full invocation path shown above parses/checks Object-ness without applying that schema. This is a statement about what this pinned draft prescribes, not proof that a browser or agent never performs extra checks.
- **[INFERENCE]** The DOM intro's claim that an invalid `inputSchema` rejects registration is not enough to assert a normative schema validator or a particular invalid-schema exception: it is expressly non-normative, and the algorithm does not define what makes a schema invalid.
- Unresolved by this source: which schema constraints a browser/agent might validate; whether any particular declarative form implementation rejects unsupported/invalid values; and the precise runtime error on a schema mismatch. This source scout did not run a browser probe. Agent-side invocation is also not specified here; S043 already covers the execute/error anchor.

## Line-numbered map of relevant statements and branches

The following is a complete map of schema, mismatch, validation, and invalid-input material in the pinned source; unrelated origin/permission/lifecycle branches are omitted except where they surround an input branch.

- `44-46` — the DOM intro is labeled “For web developers (non-normative)”; interpret `709-715` and `726-735` accordingly.
- `260-278` — normative platform tool-execution error table. `invalid input` means arguments failed to parse into a JavaScript Object, with corresponding exception name `DataError`; this is not defined as JSON Schema mismatch.
- `293-301` — explanatory note: platform error concepts map to exposed DOMException names; tool-author errors can also appear in response JSON.
- `501-515` — tool execution first checks whether the tool still exists. The note describes an unprotected unregister/re-register race involving old arguments and a new schema, and points to issue #92 for resolving that mismatch; it does not specify validation.
- `517-536` — illustrative race example: re-registers with a changed schema, then invokes with `{a: 10}`; the comments anticipate “requisite errors” without defining a validator or outcome.
- `547-560` — normative callback-input branches: parse `inputArguments`; on parse exception use `invalid input`; if the parsed value is not an Object, use `invalid input`; otherwise continue. No inputSchema test occurs between parsing and callback invocation.
- `562-583` — after those checks, dispatches `toolactivated` and passes `inputObject` plus options to the tool callback.
- `601-620` — result-serialization failure maps to `unserializable result`; rejected execute callback maps to `tool rejected`. Neither is an invalid-argument/schema-mismatch category.
- `709-715` — non-normative `registerTool()` summary says a rejected promise results if the input schema is invalid, without defining invalidity.
- `726-735` — non-normative `executeTool()` summary says caller input is expected to match the registered schema; omission supplies an empty object.
- `753-788` — normative `registerTool()` guards and schema handling: initializes the stringified schema empty; if the member exists, JSON-serializes it; serialization exceptions reject with that exception. No JSON Schema keyword/instance validation step is defined here.
- `790-802` — serialization note: if JSON serialization yields `undefined`, a new TypeError is thrown; exceptions from JSON.stringify are re-thrown (e.g. circular reference). This concerns serializability, not schema validity.
- `804-819` — after serialization, rechecks active document, duplicate name, and aborted signal; these guards do not validate schema content.
- `849-897` — stores the stringified input schema on the tool definition and registers it; no intervening schema validator.
- `901-1019`, especially `987-993` — `getTools()` reconstructs the registered `inputSchema` by parsing the stored JSON string, or returns `undefined` when absent; the note guarantees valid JSON syntax only.
- `1023-1053` — normative `executeTool()` prelude: omitted input becomes an ordinary empty object, Object is asserted, then the object is serialized to JSON; serialization exceptions propagate. No schema comparison is performed in these steps.
- `1146-1155` — completion resolves with result or rejects with a DOMException whose name comes from the tool-execution error; internal error details are not forwarded across origins.
- `1187-1201` — `ModelContextTool` dictionary declares optional `object inputSchema`; this is a type/member declaration, not schema validation.
- `1237-1240` — defines `ModelContextTool.inputSchema` as a JSON Schema describing expected parameters.
- `1337-1373`, especially `1370-1373` — `RegisteredTool.inputSchema` is described as a deep copy of the schema passed at registration.
- `1587-1590`, `1790-1809` — explicitly non-normative security discussion warns that UI and direct-tool paths may differ in validation/security checks; examples do not specify behavior.

## Verbatim quotes (all from the pinned decoded body)

1. “For web developers (non-normative)” — `index.bs:44-46`, DOM intro label.
2. “or if the {{ModelContextTool/inputSchema}} is invalid.” — `index.bs:714-715`, `#model-context-container`, non-normative `registerTool()` summary.
3. “it's expected to match the schema described by the tool's {{RegisteredTool/inputSchema}}.” — `index.bs:733-734`, `#model-context-container`, non-normative `executeTool()` summary.
4. “The input arguments could not be parsed into a JavaScript Object.” — `index.bs:276-278`, Supporting concepts / tool execution error table.

Each quote is ≤25 words; source URL, access date, and decoded-body SHA-256 are recorded above.

## Proposed SOURCES row

This is a distinct anchor from S043's `executeTool()` (`1023-1185`) and error table (`260-301`): it covers `registerTool()`'s schema storage/registration contract and the inputSchema field definition. Keep the row's scope narrow; do not use it to claim declarative behavior or Chromium runtime behavior.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | WebMCP index.bs — inputSchema registration contract — https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | spec | A | Imperative `ModelContextTool.inputSchema` declaration and registration only; excludes declarative form validation | commit `51ed75653aaa7f174f8dbe05d1bc327359bbc57c` (2026-10-20); `#model-context-container` lines 709-735, 753-803; `#model-context-tool` lines 1187-1240 | The normative registration steps serialize and store the schema but do not define schema validation; the invalid-schema rejection and caller-match statements are non-normative DOM intro text. Pair with existing S043 for invocation parse/object errors; do not claim a declarative validator. | queued | 2026-10-21 | on-release | — |

## Isolation

- Clone: none; scout assignment produced no production file.
- Branch: not applicable.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (round-19 baseline; no lane git writes).
- Commit: none.
- Paths written: `.ufo/waves/round-19/w1/SrcWebmcpSpecDecl.md` (required report) and `.ufo/waves/round-19/w1/TabiR19-2.SrcWebmcpSpecDecl-4.body.gz` (retained decoded source body).