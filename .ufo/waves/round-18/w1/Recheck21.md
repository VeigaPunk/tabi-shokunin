VERDICT: PASS

# C1 freshness — S043, S044 recheck (seat Recheck21)

Scope: two rows, both `status: mined` at B, neither in the PLAN superseded set
(`S004→S028, S039→S040, S047→S054, S049→S055, S050→S056, S053→S057`).
Lane tip at start and end: `git -C LANE rev-parse --verify refs/heads/master` →
`2bff864fdfee684ddbcd066cc8e735adaba2735c` = baseline B.
Producer: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (unchanged during the run;
equals `producerSha256` in the S001 receipt this wave).

## S043 — verdict held

- Row: `corpus/SOURCES.md:57`; source cell URL used verbatim as `--row-url`:
  `https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs`
- Fetch (`--url`, raw pinned blob; receipt `command`):
  `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs'`
  → **HTTP 200, 91001 bytes**
- **sha256 `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`** — byte-identical to
  the raw digest recorded in the round-17 Gate (`corpus/lessons/round-17.md:55`), so the anchored body
  has not changed since round 17 opened it. `decode none`, `quoteFound true`, quoteOffset 63321.
- Quote (24 words, `--quote-source new`):
  `Despite the name of this API (i.e., Web*MCP*), this specification does not prescribe the format in which tools are exposed to the [=browser agent=].`
  This is the raw-source form of the Gate's rendered quote. Probed on the curl'd copy:
  `--normalize-only --decode none` with the rendered form → `{"found":false,"offset":-1,...}`; with the
  raw-markup form → `{"found":true,"offset":63321,...}`. Round-17 already noted the `Web*MCP*` /
  `[=browser agent=]` markup difference, so this is a re-quote of the same sentence, not a body change.
- Anchor observed: commit `51ed7565…` raw blob, 91001 B; `<pre class='metadata'>` block reads
  `Status: CG-DRAFT`, `Shortname: webmcp`, `Repository: webmachinelearning/webmcp`, no date stamp.
  Row anchor cell's §4.2 bounds verified: `<div algorithm>` 1023, `executeTool` `<dfn>` 1024, `</div>` 1185.
- teaches (`Agent-side invocation is not specified — the draft fixes only in-page executeTool and its
  DOMException names — so an invocation receipt is build-scoped, never spec-derived`) — held:
  - Note at `index.bs:1570-1573`: the spec "does not prescribe the format in which tools are exposed to
    the browser agent"; exposure steps are `[=implementation-defined=]` at 1566-1568 and again in the
    §"The browser agent" note at 1502.
  - The only defined invocation is in-page: `executeTool(...)` dfn 1024, body to 1185, rejecting with
    `InvalidStateError` (1088), `NotFoundError` (1100, 1116), plus `NotAllowedError`/`SecurityError` in
    the surrounding algorithms; error table at 260-301 (table 264-291, realm-agnostic note 293-302).
  - No CDP / DevTools-protocol / wire-format / JSON-RPC occurrence anywhere in the 91001 B body
    (`grep -ni 'cdp|devtools protocol|transport|wire format|json-rpc|jsonrpc'` → no matches), so no
    agent-side invocation is specified.
- Receipt: `corpus/evidence/round-18/source-recheck/S043.json`; excerpt sha256
  `7f5613874679a0932e94accf121ca930d4ed32418b76f0bda669ad03a158169a`.

## S044 — verdict held

- Row: `corpus/SOURCES.md:58`; source cell URL used verbatim as `--row-url`:
  `https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts`
- Fetch: same curl argv against
  `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts`
  → **HTTP 200, 59794 bytes**
- **sha256 `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f`** — byte-identical to
  the round-17 Gate's raw digest (`corpus/lessons/round-17.md:56`, same 59794 B). `decode none`,
  `quoteFound true`, quoteOffset 32384, `--quote-source corpus/lessons/round-17.md:56`.
- Quote (6 words, original Gate quote, found verbatim at line 945):
  `this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;`
- Anchor observed: commit `66df492a…` raw `WebMCPView.ts`, 59794 B, digest match to the Gate; the body
  is the Chromium-154 DEPS-pinned revision per the row anchor (the file carries no tag string of its own).
- teaches (`The panel invokes a tool with an object input and binds the outcome only through a pre-seen
  toolInvoked id, so an invocation receipt must record both events`) — held:
  - `WebMCPView.ts:942-945` — `onRunTool` sets `this.#selectedTool.parameters = event.data.parameters || {}`
    (object input) then awaits `tool.invoke(...)` and keeps the returned id.
  - `WebMCPView.ts:946-952` — the outcome is bound only by `models.flatMap(m => m.toolCalls).find(c =>
    c.invocationId === this.#lastDevToolsInvocationId)`; the id is dropped if null (946) or after a match (952).
  - `WebMCPView.ts:850, 861-866` — listener on `WebMCP.WebMCPModel.Events.TOOL_INVOKED`; `#toolInvoked`
    matches the id and captures the call. So the call must already have been seen as an event.
  - Model side, at the same revision — `front_end/models/web_mcp/WebMCPModel.ts` (path from the view's
    import `s044.ts:21`), fetch HTTP 200, 8553 B, sha256
    `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`: `invoke(input)` 128-139 returns
    `response.invocationId` from `invoke_invokeTool`; `toolInvoked` 230-246 stores the call in
    `#calls` keyed by `invocationId` and dispatches `TOOL_INVOKED`; `toolResponded` 249-258 looks the call
    up by `invocationId`. Confirms both the row anchor cites (128-139, 249-258) and "pre-seen".
  - Row anchor's other cite `WebMCPView.ts:561-576` lands on the status/output rendering cells.
- Receipt: `corpus/evidence/round-18/source-recheck/S044.json`; excerpt sha256
  `472bb1d5b39b8739a64a35a76297e5073dff6325abd73ff47856aa9054532937`.

## Drift drafts

None. Both rows held, so no superseding row (`teaches` opening `supersedes S0xx —`) and no Gate entry
was drafted. No SOURCES cell was edited by this seat.

## Receipt-contract self-check

Independently re-derived every C1 predicate in a throwaway script (`/tmp`, since removed) rather than
trusting the tool's own log line. Per row, all 13 pass: `schema` = `tabi-source-recheck-v1`;
`row` present in `corpus/SOURCES.md` at REV and not superseded; `rowUrl` occurs verbatim in that row's
source cell; 64-hex `sha256`; `quoteWords` equals the quote's word count and ≤ 25 (43: 24, 44: 6);
`normalize(quote)` occurs in `normalize(excerpt bytes)`; `excerptSha256` equals the sha256 of the excerpt
file; `quoteFound` true; `fetchedAt` 2026-10-20; `teachesVerdict` = held; `httpStatus` 200;
`producerSha256` equals the producer's sha256; `seat` = Recheck21. This is a self-check, not the
counter's `measure-c1.mjs` run.

## Remaining unknowns

- None material to these two rows. The live default-branch tips of both repositories were not consulted
  (out of scope: both rows anchor at pinned commits, and their recheck cadence is `on-release`).
- Tooling: nothing installed or upgraded (no pacman, no uv/npx) — no record needed.
- Scratch: all probe files lived in `/tmp/r18-recheck21` and were deleted after the receipts were verified.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S043.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S043.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S044.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S044.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck21.md
