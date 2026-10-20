VERDICT: PASS

Scope: C2 skeleton draft of `corpus/knowledge/webmcp-invocation-round-17.md` (prose draft for L1 integration). Written only the draft and this report. No lane git write, no jj, no browser launch, no subagent dispatch, no tool install (none needed).

## Behavior

The draft follows the round-16 note structure (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`): header (`source:` / `verified-at:` / `recheck:`), a one-paragraph local-measurement statement, scope and runtime identity, the 11 required case ids with fixed predicates and an Observed column, a decision table of what an invocation claim may assert from which evidence, spec versus build, limits and unknowns, adjacency (report, never absorb), cross-references, corrections placeholder, and recheck procedure.

Placeholders used:
- `<<RECEIPT-*>>`, `<<RECEIPT>>`, `<<RECEIPT: ...>>` for receipt values only (schema, summary, producer sha, pids, driver, externalRequestCount, observed case results, history, cleanup).
- `<<S041+ ...>>` and `<<S0xx>>` for source-row ids in the header and the spec table. Deviation from the brief's single placeholder form: the S041+ ids do not exist yet (`.ufo/waves/round-17/sources/` is absent), so these are needed beyond `<<RECEIPT>>`.
- `<<SRC: ...>>` for two spec rows (execute semantics: SrcSpecExecute; statuses: SrcPdlInvoke). Same reason.
- `<<new fixture>>` for `invoke-imperative-throws` / `-rejects` (no such fixture in `corpus/evidence/round-16/webmcp/fixtures/`; C2Harness creates it).

## Findings (evidence pointers)

1. Round-16 invoked no tool. `webmcp-chromium-loopback-round-16.md:127` "No tool is invoked in the receipt"; harness states it never calls `WebMCP.invokeTool`/`cancelInvocation`/`executeTool`/submit (`scripts/webmcp-loopback-round16.mjs:22-24`; receipt `safety.toolInvocation` at `:1600`). The frontier still lists "tool invocation as committed evidence" as open at `corpus/README.md:303`. The draft supersedes `:127` for 154 loopback only.
2. Invocation path exists at 154 (probe, not receipt): `WebMCP.invokeTool` → `invocationId`, `toolInvoked` (input as JSON string), `toolResponded` `{status: Completed, output: "echo:…"}` (`.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` keys `verdict`, `toolInvokedEvent`, `toolRespondedEvent`). Round-16 note already records the string-input and status/output shapes at `webmcp-chromium-loopback-round-16.md:71-74`.
3. Probe errors: unknown tool `-32602 "Tool not found"`; before `enable` `-32000 "WebMCP domain is not enabled"` (probe keys `unknownToolInvoke`, `invokeBeforeEnable`).
4. Probe anomaly that changes a claim: a required-field-omitted input against the echo tool's `inputSchema` returned `Completed` with `echo:undefined` (probe `invalidInputInvoke`). The draft therefore forbids any "input validated" claim and leaves `invoke-input-schema-mismatch` observational. Not previously in the round-16 note.
5. Enum `InvocationStatus = Completed | Canceled | Error` appears in the 154 probe's `protocolDomain.types` (probe key). No case cancels, so "cancelled" is a decision-table "no".
6. Flags and controls are identical to round 16 (`scripts/webmcp-loopback-round16.mjs:67-74`, `:1428-1429`); PLAN `:112-113` requires the same flags.
7. Adjacency: integrator ruling `corpus/lessons/round-16-verifier-spotcheck.md:141-142`; kaidoku row `kaidoku-shokunin/PROVINCE.md:53` (verified by grep this session). The ruling names "observation … including the WebMCP page-tool surface", not invocation. The draft marks "invocation is covered" as `[INFERENCE]` and does not settle it. Other overlaps (kaidoku discover verb, kumitate agent-side, kake authoring, kasegi/kagi metadata trust) cited at `webmcp-chromium-loopback-round-16.md:136-139`.
8. Source rows to cite: S020 `corpus/SOURCES.md:34`, S030 `:44`, S033 `:47`, S034 `:48`, S035 `:49` (declares experimental domain), S036 `:50`, S037 `:51`. These are already in the registry; the draft cites S035 and S030 in the decision table. The S041+ rows for invocation semantics are not yet opened.
9. Lifecycle correction (peer `TabiR17.C2ProbeLifecycle-2`, measurements in `.ufo/waves/round-17/w1/C2ProbeLifecycle.md`, 8/8 predictions held). Applied to the draft: (a) `invoke-after-unregister` must use `registerTool(def, {signal})`; a bare `AbortSignal` in that position fires no `toolsRemoved` and the tool stays invokable (item 8); the r16 wording at `webmcp-chromium-loopback-round-16.md:61` is imprecise. (b) `invoke-navigation-pending` predicate is no `toolResponded` past 10.5 s, no `toolsRemoved`, order `executionContextsCleared` → `frameNavigated` → `toolsAdded`; no `Canceled` or frameId assertion. (c) Added as measured facts: page-session `WebMCP.enable` requirement (browser session `-32601`), reload and close-target produce no response, unregister mid-flight does not cancel. Reload and close-target are not promoted to required ids; that is the L1's call.

## Gaps and risks for L1 integration

- Receipt values are all placeholders. Nothing in the draft is a claim the receipt has yet confirmed; every observed column is `<<RECEIPT>>`. Probe observations are labelled as probe-only.
- `scripts/webmcp-invoke-round17.mjs`, `corpus/evidence/round-17/webmcp-invoke/**` and the `sources/*.md` scouts were absent when I read (`.ufo/waves/round-17/` contains only `PLAN.md`, `w1/`, and now `drafts/`). Line pointers into round-17 harness code are therefore absent by design.
- `[INFERENCE]` marks: recheck exit codes (mirrors round-16 harness, `webmcp-chromium-loopback-round-16.md:153-155`) and the adjacency reading of the ruling.
- L1 still owes: header S-row ids (`corpus/SOURCES.md` rows, `native-webmcp` path extension), the `corpus/README.md` map row and frontier supersession (`README.md:303`, `:307-314`), `SKILL.md` registry row, `corpus/adjacency.tsv` row for the ruling, and the `corpus/lessons/round-17.md` mistake/erratum for `:127`. None of these were written here (ownership: L1 only).

## Tools

Installed/updated: none. Reason: reading and drafting needed only `read`/`grep`/`jq`, all present.

## Files written

- `.ufo/waves/round-17/drafts/note-c2.md` (new; draft, 131 lines)
- `.ufo/waves/round-17/w1/DraftNote.md` (new; this report)
