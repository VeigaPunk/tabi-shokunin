# w1 report — TabiR16.DraftNote-5 (scribe)

Target owned: `.ufo/waves/round-16/drafts/DraftNote.md` (written).
Lane: leaf, no subagent dispatch, no gates, no browsers, no commits. Read-only elsewhere.

## Behavior
Drafted the WebMCP Chromium-loopback knowledge draft for L1 integration. Sections: header (source lines, placeholders), Scope, What the spec says, What Chromium 154 exposes (PRE, pending), Decision table (D1–D15), Divergences, Limits/unknowns, Recheck procedure. Observation / spec / pre-probe / pending / inference / unknown are tagged separately.

## Commands and outcomes (observed)
- `read` PLAN.md — OK (420D).
- `read` https://webmachinelearning.github.io/webmcp/ — OK, reader markdown, 2039 lines, meta-revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, CG-DRAFT dated 20 October 2026. Fetch method: native `read`, not raw HTML. Access date 2026-10-20.
- `glob` round-16 tree — OK (drafts/ and probes/ exist and are empty of seat outputs at check time).
- `grep` over the spec artifact — OK. Matched §4.1, §4.2, §4.4, §3, §3.1, §6.3.4 and index lines. No hits for `navigator.modelContext`, `toolname`, `tooldescription`, `declarative`. One `Chromium` hit (§5.2 APC citation).

## Spec sources opened (S020)
Located quotes (≤25 words, verbatim from reader text, section given):
- §1 Introduction: "expose their web application functionality as “tools” - JavaScript functions with natural language descriptions and structured schemas"
- §4.1: "Each Document object has an associated ModelContext, which is a ModelContext object."
- §4.2: "The ModelContext interface provides methods for web applications to register and manage tools that can be invoked by agents."
- §4.2 registerTool: "Returns a rejected promise if a tool with the same name is already registered"
- §3 tool definition name: "The name’s length must be between 1 and 128, inclusive"
- §3 input schema note: "This is the stringified representation of the inputSchema passed to registerTool()."
- §4.4: "Access to the APIs in this specification is gated behind the policy-controlled feature"
- §6.3.4: "TODO: Document risks and implications of agents carrying state from one origin to another."

## Touched surfaces
- Written: `.ufo/waves/round-16/drafts/DraftNote.md`, `.ufo/waves/round-16/w1/DraftNote.md`.
- Not touched: any other file, corpus/, scripts/, probes/, SOURCES.md, LOG.md.

## Findings for L1
1. Spec-side ADMISSIBLE: D1 (surface `document.modelContext`), D2 (name grammar), D3 (`tools` permissions policy). These back the S020 row.
2. Spec is silent on declarative `<form toolname>` surface (negative grep). Any declarative claim (D6, D11, D12) is Chromium-only and must be labeled so. It is not spec-backed.
3. Chromium 154 surface (`document.modelContext`, `navigator` absent, `toolsAdded` payload, flag-off) remains PRE (from PLAN) and PENDING until probe receipts exist. This seat did not reproduce any of it.
4. Spec's `inputSchema` is a string; CDP payload shows an object (D13). Representation difference only until proven.
5. Reader-text grep may miss content; raw-HTML re-fetch is a recheck step.
6. Placeholders left in draft header for new SOURCES rows (CDP viewer re-open for WebMCP domain; primary Chromium source). L1 assigns IDs.

## Tooling
No tools installed or updated. No pacman use.

## Out of scope / not done
- No probe run, no harness run, no receipt written, no Chromium launched.
- No Chromium source opened (placeholder B is [UNK]).
- No Chromium `--version` check; runtime version is PRE only.
- No SOURCES.md row written (L1 only).

## Checks for main agent after integration
- Re-run recheck steps 1–8 in the draft, especially raw-HTML spec re-fetch and harness receipt (`failed: 0`) before promoting any PENDING row.
