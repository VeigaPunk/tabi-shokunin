# ReopenS021 — S021 disposition under attack (round 16, wave 2)

Seat: `TabiR16.ReopenS021` (leaf scout; no subagents, no commits, no background jobs).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3`,
worktree clean for `corpus/SOURCES.md` (`git status --porcelain corpus/SOURCES.md` → empty; row bytes at
HEAD and in worktree both sha256 `b6b94597…6691e`).
Access date for every fetch below: **2026-10-20**. The lane was not modified; the only lane file written is
this report. Mutation probes ran in a `/tmp` clone.

## Axes and item

Axes: (1) factual grounding of S021's cells in its own URL bytes; (2) append-only legality at this
snapshot; (3) measurement-binding cost of touching the registry.

Item under attack: **"S021 was re-opened this round and left `queued` with `used-by —`"**, and the two
supporting claims offered for it — *the page mentions no WebMCP or page tools* and *its anchor
"no revision marker" is false (dateModified)*.

## Verdict

- **Disposition (re-open, keep `queued`, keep `used-by —`): HOLDS.** The row's URL carries zero
  WebMCP/modelContext/page-tool vocabulary, nothing in the corpus cites S021, and `queued` is the
  registry's own word for "opened, worth mining". Leaving it is also the only zero-cost legal state at
  this revision (measured binding cost below).
- **Zero-WebMCP/page-tools support: HOLDS.** Measured zeros on the fetched bytes, not a summary.
- **"Anchor is false" support: BREAKS as worded.** `dateModified` is a *modification date*
  (2026-03-22), not a revision marker: the page contains the string `revision` **0** times and exposes
  no version/hash. The clause is **imprecise and misleading**, not literally false; the real defect is
  that the anchor denies the one diffable identity the page does expose, against the registry's own
  convention (S010 anchors "last updated 2023-05-09", S032 "page last updated 2026-10-07").
- **Secondary defect found (not in the assignment, same row):** `teaches` says "alternative to raw CDP",
  but `cdp` occurs **0** times on the page; the creation quote grounds the debugging/verification
  workflow, not the CDP alternative. Both wrong cells are *fixed* cells.

## F1 — Fetch of the row's exact URL (body GET, this session)

```
curl -sS -D /tmp/s021.headers -o /tmp/s021.html https://developer.chrome.com/docs/devtools/agents
# HTTP/2 200 ; content-length: 125478
# last-modified: Sun, 22 Mar 2026 00:00:00 GMT
# date: Tue, 20 Oct 2026 14:57:23 GMT
sha256sum /tmp/s021.html
# ae0ef6e3122e0fc49bd3375e6fdddb23c32bf9eb11966181b8d1017ae48ff131
```

`<link rel="canonical" href="https://developer.chrome.com/docs/devtools/agents">` — the served page's
canonical identity is the row URL (no redirect, no locale suffix).

The byte digest is **fetch-specific** (per-response nonce + `GoogleDevelopersObject` flag list); it
differs from wave-1's `558a3fa9…` and `fa344696…` while the article bytes and the quote are stable.
Bind identity to `dateModified` + the located quote, never to a response hash.

## F2 — Does it mention WebMCP or page tools? No (measured)

Counts on the raw fetched bytes, `grep -oi -- '<token>' /tmp/s021.html | wc -l`:

| token | count |
|---|---|
| `webmcp` | 0 |
| `modelcontext` | 0 |
| `navigator.modelContext` | 0 |
| `registerTool` | 0 |
| `list_webmcp_tools` | 0 |
| `execute_webmcp_tool` | 0 |
| `tools/list` | 0 |
| `toolname` | 0 |
| `declarative` | 0 |
| `page tool` | 0 |
| `registered tool` | 0 |
| `cdp` | 0 |
| `chrome devtools protocol` | 0 |
| `expose` | 0 |

Positive-context checks that could have been false friends:

- `MCP` — 12 raw occurrences, **all agent→browser**: the meta/og description (`Give the power of
  DevTools to agents through MCP or the CLI.`), the `ChromeDevTools/chrome-devtools-mcp` links,
  `npx chrome-devtools-mcp@latest`, `codex mcp add`, and `(MCP+Skills)` comments. It names a DevTools MCP
  server, never a page-registered tool.
- `tools` — 154 raw occurrences are overwhelmingly the substring in `DevTools`. Standalone ` tools`
  (preceded by a non-letter) is 3, all site chrome: nav description "the web's best tools", a
  `.tools-button` CSS selector, and the experiment-flag name `Concierge__enable_devsite_llm_tools`.
  The article body itself has no standalone "tools" concept.
- `origin trial` — 4 raw occurrences, all in the global nav ("participate in origin trials",
  "Origin trials"); **0 after the H1**. Not a WebMCP origin-trial statement.
- `agent skills` — 1 occurrence: "To access specialized agent skills, install the DevTools plugin" —
  agent-side install-time plugin skills, not a page-registered tool.

So S021's bytes support only its own scope ("Chrome's documented agent integration surfaces": install
channels Antigravity / Claude Code / Codex, and the emulate / debug-live / Lighthouse cards). They cannot
back any sentence of `corpus/knowledge/webmcp-chromium-loopback-round-16.md` — and they do not: that
note has **0** occurrences of `S021` (`grep -oc S021 …` → 0). The DevTools-side WebMCP page is a
*different* URL (`/docs/devtools/agents/webmcp-debugging`, opened this session: 200, 173457 bytes,
sha256 `a0f055ba…d647`, `dateModified 2026-09-23`, `webmcp` ×80), reachable from `get-started`, not from
S021's article. It needs its own row; S021 cannot stand in for it.

### Located quote (≤25 words, access 2026-10-20)

> "Help your agent build, debug, and verify your code correctly."

10 words. Location: introduction, first paragraph under H1 "Chrome DevTools for agents"; raw byte
offset 78167 (`grep -ob`), exactly one occurrence in the response. It grounds "agent debugging and
verification workflows"; it does not ground "raw CDP" or "supported high-level alternative".

Direction-of-MCP quote (12 words), `<meta name="description">` / `og:description`:

> "Give the power of DevTools to agents through MCP or the CLI."

## F3 — Is "no revision marker" false? Partly; it is imprecise, not false

Observed in the same bytes:

- JSON-LD `Article` block, `agents.html:87` (single occurrence; `datePublished` 0):
  `"dateModified": "2026-03-22"`.
- HTTP `last-modified: Sun, 22 Mar 2026 00:00:00 GMT` — same date.
- `revision` string: 0 occurrences; no version/hash; no `<meta name="last-modified|updated">`.
- Visible "updated": 0 in rendered text; no visible publication date at all; no content footer.

The strict reading of the anchor is therefore true — there is no *revision identifier*. But the anchor
uses absence as identity policy, and in this registry a page's last-updated date **is** the anchor
convention (S010 `last updated 2023-05-09`; S032 `page last updated 2026-10-07`). By that convention S021
does have a diffable marker that the anchor omits. The wave-1 finding "the anchor clause is false" is an
overstatement; the durable finding should be "the anchor is incomplete: dateModified 2026-03-22 exists
and is the re-open diff key; no revision identifier exists".

Corrected anchor text, if a correction row is ever written (new row, read 2026-10-20):
`JSON-LD dateModified 2026-03-22 (= HTTP Last-Modified); no visible last-updated line, no revision identifier; read 2026-10-20`.

## F4 — Row state and provenance

`corpus/SOURCES.md:35` at HEAD:

```
| S021 | Chrome DevTools for agents — https://developer.chrome.com/docs/devtools/agents | docs | A |
Chrome's documented agent integration surfaces | rolling docs, no revision marker, read 2026-10-19 |
The supported high-level alternative to raw CDP for agent debugging and verification workflows |
queued | 2026-10-19 | on-release | — |
```

- `queued` is defined as "opened, worth mining" (`CORPUS.md:103`); `used-by —` is legal for `queued`
  (`scripts/check-sources.mjs` only requires used-by for `mined`, finding `mined_without_used_by`).
- Creation quote is durable: `corpus/lessons/kaika-fleet-round-1.md:64` records
  `"Help your agent build, debug, and verify your code correctly." — introduction` with a 2026-10-19
  fetch digest.
- `corpus/lessons/round-16.md` **does not exist** yet. The round-16 re-open currently lives only in two
  wave-1 seat reports (`w1/SrcAgentsDocs.md`, `w1/RevAccessDates.md`); the contract's durable record
  (round lesson `## Gate`: URL, access date, ≤25-word located quote, mutated cells old→new) is still owed.
- The teaches defect is real and separate: page `cdp` = 0, so "raw CDP" is an ungrounded clause in a
  fixed cell. The row's scope and kind/tier (docs/A, agent integration surfaces) are honest.
- The registry is structurally clean as it stands: `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0`.
  Do not read that as validation of S021's cells: the gate is structure only — `corpus/SOURCES.md:9`
  says it "cannot see whether a source was opened", and `check-sources.mjs` never reads git, so it
  could not detect an in-place edit of a fixed cell even if one were made.

## F5 — What an honest append-only handling is (measured cost)

Contract: only `status`, `recheck`, `used-by` may change in place; `source/kind/tier/scope/anchor/teaches/
opened` are fixed; a correction is a new row whose `teaches` opens `supersedes S0NN —`
(`CORPUS.md:116-118`; gate exemption regex `check-sources.mjs:296`). S021's two defects are both in fixed
cells, so **no in-place anchor/teaches edit is available** — including "just make the anchor honest".
Note the rule is contractual, not machine-enforced: the gate is structural and never reads git, so an
in-place anchor rewrite would pass `check-sources.mjs`; only the lesson log and a reviewer's diff expose
it. That is why step 2 below is the load-bearing record.

Measured on a `/tmp` clone (`git clone --no-hardlinks` of the lane, HEAD reset to `b444ca8`; the untracked
manifest copied in; all mutations committed in the clone only):

| shape | command | observed |
|---|---|---|
| baseline at `b444ca8` | `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at HEAD` | `MEASUREMENT_BINDING verdict=clean claims=2 bound=2`, exit 0 |
| lesson-only file added | same, after committing `corpus/lessons/round-16-probe.md` | `verdict=clean claims=2 bound=2`, exit 0 |
| legal in-place cells changed (`S021 status queued→mined`, `used-by —→note`) | same | `verdict=failed claims=2 bound=1`; `finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md`, exit 1 |
| sanctioned correction row `S040` (teaches opens `supersedes S021 —`; inserted after `S039`) | `node scripts/check-sources.mjs` | `SOURCES_GATE verdict=clean rows=40 … findings=0`, exit 0 |
| same `S040` commit, at the corrected revision | binding gate | `verdict=failed claims=2 bound=1`; `finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md`, exit 1 |
| same `S040` commit, count check | `node .ufo/waves/round-16/measure.mjs <NEW> --claim C2` | `c2_webmcp_held: 1`, `failures: []` — the **count survives; the binding does not** |

Mechanism (read, not guessed): `corpus/SOURCES.md` is a declared C2 counted input
(`corpus/evidence/round-16/measurement-binding.json` → `claims[C2].countedInputs`), and the gate diffs
every counted input between `measuredRevision` and `--at REV`
(`scripts/check-measurement-binding.mjs:496-498`, reason `counted_input_changed` at `:135`). Lessons are
not counted inputs, which is why the lesson-only control stays clean.

Honest handling, in order:

1. **Do not change S021's cells now.** `queued`/`used-by —` is the true state (opened, worth mining, cited
   by nothing). Marking it `mined` would be false: `mined` means cited by ≥1 `used-by` path
   (`CORPUS.md:103`), the note has no `S021`, and the page grounds none of the note's WebMCP sentences.
2. **Log the re-open in the round lesson** (`corpus/lessons/round-16.md`, `## Gate`): row id, URL, access
   date 2026-10-20, GET 200 / 125478 bytes / sha256 `ae0ef6e3…`, the 10-word located quote above, the
   observed `dateModified 2026-03-22` (and that no revision identifier exists), the zero-token sweep, and
   the cell transition record `status queued→queued`, `used-by —→—` (no change). This is the only vehicle
   that is both durable and free of binding cost (measured row 2).
3. **If L1 decides the fixed cells must be corrected**, the only legal vehicle is a new row (`S040`, next
   unused id after `S039`) whose `teaches` starts `supersedes S021 — `, carrying the corrected anchor from
   F3 and a teaches without the CDP claim. It must not be appended silently: it changes a C2 counted input,
   so C2 has to be re-measured at the new revision and `measuredRevision`/`after.revision` updated in the
   manifest. (Adjacent fact: the manifest itself is currently untracked in the lane —
   `git status --porcelain corpus/evidence/round-16/` → `?? corpus/evidence/round-16/measurement-binding.json`
   — so a re-measure must also commit the manifest or the binding stays unreproducible from HEAD.)
4. **Do not cite S021 as a contrast in the WebMCP note as a shortcut.** That both fabricates grounding and
   edits a counted input (the note is also in C2's `countedInputs`), so it costs the same re-measure while
   adding an unsupported citation.

If L1 prefers to spend no re-measure this wave, the honest residue is: S021 stays `queued`, un-cited, with
its two defective fixed cells **knowingly recorded as defects in the lesson** — not silently left as if
grounded. The registry is not "corrected" in that option, and the lesson must say so.

## Unknowns / not run

- No browser was launched; nothing asserted about runtime WebMCP behavior.
- Only the row URL and two adjacent child URLs (`get-started`, `webmcp-debugging`) were opened; other
  subpages (`use-cases/*`, `extensions`, `memory`) were not.
- The mutation probe used the lane's worktree manifest copied into `/tmp`; because that manifest is
  untracked, the probe is reproducible only from the current worktree, not from `b444ca8` alone.
- `dateModified` is a page-level build/update date; that it tracks content edits is an inference from the
  header match and from distinct dates on sibling pages (2026-05-13, 2026-09-23), not a controlled test.
- Not run by this seat as verification: `scripts/selftest-measurement-binding.mjs`, the WebMCP harness,
  or the C1/C2 counters at HEAD beyond the one C2 run shown. The binding gate was run only as a probe
  cost measurement, not as a certification.
- Tooling: nothing installed or upgraded; no pacman/uv/npm/cargo transaction attempted.
