# RevAccessDates — S020/S021 revision, date and `on-release` audit

Seat: `TabiR16.RevAccessDates-5` (leaf, read-only; no gates, no browser, no counters run).
Round: 16, access date **2026-10-20**. All paths lane-relative unless absolute.

## Verdict

- **S020's recorded pin is stale by one publication**: the row pins `CG-DRAFT 2026-10-16, revision
  f14762e6` (`corpus/SOURCES.md:34`); the live URL served **`cb3d1696`, `dt-updated 2026-10-20`** at
  `2026-10-20T14:33Z`. The delta is one editorial commit (`Add new editor (#352)`), and `index.bs`
  at both revisions differs by exactly one `Editor:` line, so every quoted sentence still checks.
- **S021's anchor clause "no revision marker" is false**: the page carries JSON-LD
  `"dateModified": "2026-03-22"` (`agents.html:87`). S021 also contains **0** occurrences of
  `WebMCP`/`modelContext` and is therefore **not admissible** as a C2 WebMCP source.
- **`on-release` has no enforcement surface** for either row: the lane gate only checks the token's
  spelling (`scripts/check-sources.mjs:322`) and the fleet census reports symbolic cadences but
  "never judged overdue" (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh:36-37`). The
  lesson log is the *only* durable freshness record — hence the re-open definition below.

## Findings (severity order)

### F1 — S020 identity moved between pin and this round (medium; must be logged, no cell write)

Recorded `anchor` (`corpus/SOURCES.md:34`): `CG-DRAFT 2026-10-16, revision f14762e6`.
Observed in the live bytes fetched this session:

- `<meta content="cb3d16964ab3e92cfd5f09901ed0504373a906e8" name="revision">` — `webmcp.html:11`
- `<time class="dt-updated" datetime="2026-10-20">20 October 2026</time>` — header block
- the string `f14762e6` occurs **0** times in the live page, and the page has no
  "Previous version" link, so the pinned revision is **not reachable from the row's URL**.
- GitHub commits Atom feed (`https://github.com/webmachinelearning/webmcp/commits/main.atom`, 200,
  17199 bytes): `cb3d16964ab3e92cfd5f09901ed0504373a906e8` @ `2026-10-20T09:53:18Z`, title
  `Add new editor (#352)`; previous entry `f14762e63607bf96592b1a7a6392cd2b047b8209` @
  `2026-10-16T16:30:24Z`, title `Editorial: sync explainers with spec (#350)`.
- Source diff at the two commits (`raw.githubusercontent.com/.../{sha}/index.bs`): `diff` yields
  exactly **1** changed line, `+Editor: Samuel Dallstream, Microsoft ...`; `Abstract:` is at
  `old-index.bs:12` and `new-index.bs:13` with identical text. So the revision bump is
  editor-list-only and **does not invalidate any S020 quote**.

Consequence: no anchor rewrite (append-only rule, F5), but the lesson must record
`f14762e6→cb3d1696 (2026-10-16→2026-10-20)` and the quoted revision.

### F2 — admissible S020 surface is narrower than "WebMCP" (medium; prevents a mis-cite)

`index.bs` (both revisions) defines one extension, `partial interface Document` (new-index.bs:652),
and the `ModelContext` interface; `navigator.modelContext` occurs **0** times. There is **no
declarative HTML form attribute**: every `toolname` hit is `ToolCancelEvent/toolName` or an internal
`|toolName|` variable — no `<form toolname>` registration and no `WebMCP.toolsAdded`.

Therefore S020 can back only: `Document.modelContext` entry point, `registerTool`/`getTools`/
`executeTool`, permissions/security text, and "CG draft, not a W3C Standard". It must **not** be
used-by for the declarative-form case, the CDP event, or "navigator absent" (the last is a runtime
observation, not a spec statement). `DraftNote.md:28,66` already states this correctly
(`D6 ... Spec is silent (no toolname in S020)`); this finding confirms it against the bytes.

### F3 — S021 anchor assertion falsified; row unusable for C2 (low; precision)

`corpus/SOURCES.md:35` anchor: `rolling docs, no revision marker, read 2026-10-19`.
Observed 2026-10-20 in the served bytes: JSON-LD `"dateModified": "2026-03-22"` (`agents.html:87`),
exactly one occurrence. The page is an install guide: its body mentions `MCP` only inside code
comments such as `# Install as an Antigravity plugin (MCP+Skills).`, and the only prose naming both
protocols is the meta description “Give the power of DevTools to agents through MCP or the CLI.”;
`webmcp=0` and `modelcontext=0` occurrences.

So: (a) "no revision marker" is not literally true (a machine-readable modification date is
exposed); (b) the row cannot supply a C2 WebMCP claim. Recommended disposition is the no-change
option in §Transitions; any in-registry fix must use the supersedes mechanism (F5), not an in-place
edit.

### F4 — `on-release` cannot flag staleness (structural; motivates the re-open log)

- Gate: `recheck` is accepted if ISO date, `NNd`, or literally `on-release`
  (`scripts/check-sources.mjs:322`); nothing else is checked.
- Gate: `opened` is only an ISO date and, with `--since`, a floor (`check-sources.mjs:321`); the
  lane's normal invocation passes no `--since`, so `opened` is not a freshness assertion.
- Census `overdue`: due date is computed as `opened + N days` only for ISO/`NNd`
  (`sources-census.sh:34-35`); symbolic cadences are printed as `cadence ...` and
  "never judged overdue" (`sources-census.sh:36-37`).
- the lane has kept `opened` immutable across re-opens (`corpus/lessons/round-12.md:54`,
  `corpus/lessons/round-13.md:31`, `corpus/lessons/round-15.md:20`), so the census clock does not
  reset on a re-open either.

Observed cost: S020 was opened 2026-10-19 and its pin had already moved four days later, with no
automated surface reporting it. This is the exact class the lesson log must catch.

### F5 — append-only rule already forbids anchor edits (blocks the tempting "fix")

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/sources-staging.json:48` states the
contract rule: "append-only — only status, recheck and used-by change in place, logged old->new; a
correction is a new row whose teaches opens 'supersedes S0NN —'". The gate implements the exemption
as a **start-anchored** match `/^supersedes\s+S[0-9]{3,}\b/` on `teaches`
(`check-sources.mjs:296`), so a supersedes row must begin `teaches` with that phrase; mid-string does
not exempt. `git log -p -- corpus/SOURCES.md` confirms no anchor cell has ever been rewritten
(only `status`/`used-by`, plus S029's first-add row). Next free id is `S030` (staging
`registry.currentState.nextId`).

## What counts as a re-open this round (fetch + quote)

A row is re-opened **iff all six hold**; otherwise the lesson must not claim a re-open.

1. **Body GET of the row's exact URL, this round.** HTTP 200 with bytes, performed by a seat on
   2026-10-20; record method, status, byte count, sha256 of the received bytes, and UTC time.
   HEAD-only, search snippets, cached copies, and re-reads of committed lessons/receipts are not
   fetches. (Own-work rows such as S029 are not "opened" this way; they are re-authenticated
   against their committed revision.)
2. **Identity captured from those same bytes.** Record the source's own marker: S020
   `<meta name="revision">` + `<time class="dt-updated">`; S021 JSON-LD `dateModified`. A marker
   different from the row's `anchor` is an observed identity transition and is logged old→new even
   though the `anchor` cell stays fixed (F5).
3. **A located quote of ≤25 words.** Contiguous verbatim words with section heading/id, and the
   word count stated. Count with `len(q.split())`/`wc -w`, never by eye (round-15 mistake:
   `corpus/lessons/round-15.md` mistakes table, "number-drift — L1 guessed a quote's word count").
   Identity strings (revision hash, date) are **not** the quote.
4. **Admissible support.** The quote must support the row's `teaches` claim and, when `used-by`
   gains a note, the exact sentence it backs in that note (F2 is the worked counter-example:
   `ToolCancelEvent.toolName` does not evidence declarative `toolname`).
5. **Append-only cells.** In-place: `status`, `recheck`, `used-by` only. Fixed: `source`, `kind`,
   `tier`, `scope`, `anchor`, `teaches`, `opened`. A wrong fixed cell → new supersedes row (F5).
6. **Lesson log.** Round lesson §Gate records: row id, URL, access date, located quote, observed
   identity marker, and each mutated cell as `old→new`. Neither validator substitutes:
   `corpus/SOURCES.md:9` says the gate is structural only and "cannot see whether a source was
   opened"; the census never marks symbolic cadences overdue (F4).

**Does not count as a re-open:** re-quoting an earlier lesson/receipt (e.g. S029 reuse), citing a
sibling seat's summary without the bytes, grepping the URL, a 200 without a located quote, or
fetching a different URL/revision than the row names.

## Exact old→new cell transitions L1 must log

Cell values below are literal, copied from `corpus/SOURCES.md` (13 pipe-fields; no `|` inside a
cell).

### S020 — `corpus/SOURCES.md:34` (the C2 source; change)

| cell | old | new |
|---|---|---|
| `status` | `queued` | `mined` |
| `used-by` | `—` | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` |
| `anchor` | `CG-DRAFT 2026-10-16, revision f14762e6` | **unchanged**; log `f14762e6→cb3d1696`, `2026-10-16→2026-10-20` |
| `opened` | `2026-10-19` | unchanged |
| `recheck` | `on-release` | unchanged |
| `source`/`kind`/`tier`/`scope`/`teaches` | as at `:34` | unchanged |

Preconditions, in order: (a) the note file exists and contains `S020` as a standalone token
(gate regex `(?<![A-Za-z0-9])S020(?![0-9])`, `check-sources.mjs:232`); (b) the note states the
revision it quoted (`cb3d1696…`) and that the registry pin `f14762e6` is the 2026-10-16 identity;
(c) `mined` may not ship with `used-by —` (`check-sources.mjs:329-331`).

Drop-in lesson sentence:

> S020 reopened 2026-10-20 (https://webmachinelearning.github.io/webmcp/, GET 200, 505949 bytes,
> sha256 `180c55ba…00d1a`): live served `meta-revision` `cb3d1696…` and `dt-updated` 2026-10-20 where
> the row pins 2026-10-16 revision `f14762e6`; delta is one commit, “Add new editor (#352)”
> (2026-10-20T09:53:18Z), and `index.bs` at both revisions differs by one `Editor:` line only, so
> §Abstract is byte-identical. Located quote, §Abstract (`id="abstract"`, 13 words): “The WebMCP API
> enables web applications to provide JavaScript-based tools to AI agents.” Registry:
> `status queued→mined`; `used-by —→corpus/knowledge/webmcp-chromium-loopback-round-16.md`;
> `anchor`, `opened`, `recheck` unchanged.

### S002 — `corpus/SOURCES.md:16` (plan: re-open for the WebMCP domain; used-by add)

| cell | old | new |
|---|---|---|
| `used-by` | `corpus/knowledge/chrome-remote-debugging-profile-boundary.md` | `corpus/knowledge/chrome-remote-debugging-profile-boundary.md, corpus/knowledge/webmcp-chromium-loopback-round-16.md` |
| `status` | `mined` | `mined` (no change) |
| `anchor` | `living page fetched 2026-10-19, §Scope and support, §HTTP endpoints` | unchanged; log the 2026-10-20 re-open |
| `opened`/`recheck` | `2026-10-19` / `90d` | unchanged |

Admissibility gate: the note must literally cite `S002`, and a seat must GET the viewer URL this
round with a ≤25-word located quote. This seat did **not** open S002 (out of slice) and supplies no
S002 quote; the note must not inherit one. Attempted and failed: `https://chromedevtools.github.io/
devtools-protocol/tot/protocol.json` → **HTTP 404** (3950 bytes), so the viewer's published protocol
JSON was not read here. The WebMCP domain claim must come from the browser's own `/json/protocol`
(L1 pre-probe) or a located viewer-page quote, not from that 404.

### S021 — `corpus/SOURCES.md:35` (not a C2 source; recommended: no cell change)

| cell | old | new |
|---|---|---|
| `status` | `queued` | `queued` (no change) |
| `used-by` | `—` | `—` (no change) |
| `anchor` | `rolling docs, no revision marker, read 2026-10-19` | unchanged; log the falsified clause |
| all other cells | as at `:35` | unchanged |

Drop-in lesson precision note:

> S021 opened 2026-10-20 (GET 200, 125478 bytes, sha256 `558a3fa9…ec0e`): the page exposes JSON-LD
> `"dateModified": "2026-03-22"` (`agents.html:87`), so the anchor clause "no revision marker" is
> not literally true; the page has 0 occurrences of `WebMCP`/`modelContext` and cannot back any C2
> claim. `status queued→queued`, `used-by —→—`, all cells unchanged. Any in-registry correction must
> be a new row whose `teaches` begins `supersedes S021 — ` (`check-sources.mjs:296`), not an in-place
> anchor edit (`sources-staging.json:48`).

Conditional variant, **only if** L1 decides to cite S021 as the contrast ("Chrome's documented agent
surface is DevTools MCP/CLI, not WebMCP") in the note's decision table: then also
`status queued→mined`, `used-by —→corpus/knowledge/webmcp-chromium-loopback-round-16.md`, the note
must contain `S021`, and the lesson must carry the located quote. Admissible ≤25-word candidates
measured from the served bytes: page lead “Help your agent build, debug, and verify your code
correctly.” (10 words) or the meta description “Give the power of DevTools to agents through MCP or
the CLI.” (12 words). The 38-word lead sentence cannot be quoted whole; any truncation must be
marked and must not change the claim.

## Evidence recorded (all HTTP GET, 2026-10-20, UTC)

| Object | URL | status/bytes | sha256 | located evidence |
|---|---|---|---|---|
| S020 live | https://webmachinelearning.github.io/webmcp/ | 200 / 505949 | `180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a` | `webmcp.html:11` meta revision `cb3d1696…`; `dt-updated` 2026-10-20; §Abstract 13-word quote |
| S020 pin source | https://raw.githubusercontent.com/webmachinelearning/webmcp/f14762e63607bf96592b1a7a6392cd2b047b8209/index.bs | 200 / 87973 | `eab56a31bc3b3934308f449587929809d04d2d47d3c10a165d3a0a197258c23e` | `Abstract:` at :12; `partial interface Document` context |
| S020 head source | https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/index.bs | 200 / 88074 | `dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39` | `Abstract:` at :13; `partial interface Document` at :652 |
| S020 commits | https://github.com/webmachinelearning/webmcp/commits/main.atom | 200 / 17199 | — | entry ids/dates/titles for `cb3d1696` and `f14762e6` |
| S021 live | https://developer.chrome.com/docs/devtools/agents | 200 / 125478 | `558a3fa985377199d63eac37470b4207ae10262b21425a41b4eb9b2895f6ec0e` | `agents.html:87` `"dateModified": "2026-03-22"`; lead sentence at rendered line 115 |

Fetch method: `curl -sS -L --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-source-check'`
with output written under `/tmp/r16s020/` and `/tmp/r16s021/`; sha256 via `sha256sum`; word counts via
Python `len(q.split())`. Full hashes: pinned `f14762e63607bf96592b1a7a6392cd2b047b8209`, head
`cb3d16964ab3e92cfd5f09901ed0504373a906e8`.

## Residual risk and verification gaps

- **No validator enforces this definition.** `check-sources.mjs` is structural (stated at
  `corpus/SOURCES.md:9`), and the census prints symbolic cadences without a due date
  (`sources-census.sh:36-37`). A false "re-opened" claim is only catchable by a reviewer comparing
  the lesson to a fresh GET; this report is that comparison for S020/S021 only.
- **`on-release` semantics for a continuously published draft.** The live page's `meta-revision`
  equals the newest `main` commit and its `dt-updated` equals that commit's date, so the published
  draft tracks `main` (five commits 2026-10-13…2026-10-20 per the Atom feed); that each push
  rebuilds the page is [INFERENCE] from the two matching identities, not separately observed. There
  is no discrete "release", so `on-release` never becomes due. The pull rule encoded above ("diff
  `meta-revision` whenever the row is touched") is the honest substitute; changing the cadence to
  `NNd` would invent a review interval the source does not define.
- **Digests are fetch-specific.** The sha256 values are for this seat's UA and moment; the stable
  comparison for a later re-open is the quoted text plus `meta-revision`/`dateModified`, not the
  byte digest. GitHub serves the same `index.bs` bytes for `raw.githubusercontent.com` at a fixed
  commit, so those two digests are reproducible.
- **Rate limits / transient failures, no claim rests on them.** GitHub REST commit lookup for
  `cb3d1696` returned `API rate limit exceeded` (unauthenticated); the commit HTML page returned
  HTTP 503. The Atom feed and `raw.githubusercontent.com` supplied the same identities.
- **Not run by this seat:** `node scripts/check-sources.mjs`, `sources-census.sh`, the round-16
  counter, any browser/probe (leaf contract: read-only). So this report asserts no registry
  cleanliness and no runtime WebMCP fact; it asserts only what the three fetches above show.
- **S002 quote is still owed** by whichever seat opens the CDP viewer this round; this report's 404
  on `/tot/protocol.json` is a dead end, not evidence.
- **Tooling:** none installed or updated; no pacman/uv/npm/cargo transaction attempted.
