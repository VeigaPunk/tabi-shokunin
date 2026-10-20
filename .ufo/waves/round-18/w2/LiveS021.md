VERDICT: ISSUES

(count-invalidating: no. The S021 receipt is mechanically accepted by the C1 counter and the
baseline-51 target is met; the defects are receipt-level precision: `teachesVerdict: held` and the
receipt `note` assert full support for a `teaches` cell whose "supported high-level alternative to
raw CDP" clause the fetched page never carries, and the receipt's raw digest is a per-response
value presented without a dynamic-page caveat.)

# C1 S021 — independent falsification (round 18, wave 2)

Seat `TabiR18.LiveS021-2` (leaf; no subagents). Lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
(`git -C … rev-parse --verify refs/heads/master`); baseline B
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. Read-only: no lane write, no git write, no `jj`, no
producer run in production (its exported `decodeBody`/`normalize` were imported by a `/tmp` probe;
`main()` did not run because `process.argv[1]` was the probe path). No service restarted, no
package transaction, no tool installed. Scratch workspace `/tmp/tabi-r18-s021` was removed after
the digests below were taken; every command is replayable.

## 1. Independent re-fetch of `receipt.url`

Exact command (the producer's actual argv, with the UA as one argument; the same argv the receipt
records in string form at `corpus/evidence/round-18/source-recheck/S021.json:7`):

```
mkdir -p /tmp/tabi-r18-s021 && cd /tmp/tabi-r18-s021
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -o s021.body \
  -w 'HTTP %{http_code} bytes=%{size_download} url_effective=%{url_effective}\n' \
  'https://developer.chrome.com/docs/devtools/agents'
sha256sum s021.body
```

Observed, exit 0:

```
HTTP 200 bytes=20529 url_effective=https://developer.chrome.com/docs/devtools/agents
125482 s021.body            (2026-10-20 17:02:08.355 -0300 = 20:02:08Z)
ed67403bae6ad3204a9d317487c94888ba1334a85d1b29f8117add7263969c5c
```

`%{size_download}=20529` is compressed transfer bytes; `--compressed` writes the decoded body,
whose length is the receipt's `bytes` (125482). The two numbers are not contradictory.

Second identical GET, 38 s later:

```
HTTP 200 bytes=20526
125478 s021.b2              (2026-10-20 17:02:46.612 -0300 = 20:02:46Z)
9670100479c76ec7ff8a7fa106b3837ba64507df41a02da049463cec13d4b6bb
```

HEAD at 20:06:35Z:

```
HTTP/2 200
last-modified: Sun, 22 Mar 2026 00:00:00 GMT
content-type: text/html; charset=utf-8
content-security-policy: … 'nonce-7hLYLiluI8NL0f6ZlJxGCOzMjGPSdh' …
content-length: 125482
date: Tue, 20 Oct 2026 20:06:35 GMT
```

Receipt (`S021.json:6,9,10`): `fetchedAt` `2026-10-20T19:05:54.433Z`, `bytes` 125482, `sha256`
`30dd763c0276474d6c1f7902ab3f3375baeea8bc74965db3903472f25112fe73`.

Same-day responses of the same URL, all HTTP 200:

| fetch (UTC) | bytes | sha256 |
|---|---|---|
| round-16 `ReopenS021` F1 14:57:23 | 125478 | `ae0ef6e3122e0fc49bd3375e6fdddb23c32bf9eb11966181b8d1017ae48ff131` (reported, not re-fetched by me) |
| receipt 19:05:54 | 125482 | `30dd763c0276474d6c1f7902ab3f3375baeea8bc74965db3903472f25112fe73` |
| this seat A 20:02:08 | 125482 | `ed67403bae6ad3204a9d317487c94888ba1334a85d1b29f8117add7263969c5c` |
| this seat B 20:02:46 | 125478 | `9670100479c76ec7ff8a7fa106b3837ba64507df41a02da049463cec13d4b6bb` |

So the receipt's raw digest is **not reproducible**, and byte-count equality (receipt vs A) does
not imply body equality. A byte diff of A vs B after masking the CSP `nonce="…"` still differs;
every hunk is inside the mid-document `GoogleDevelopersObject` feature/experiment-name list in a
`<script>` (region ~byte 120132–124000), e.g. A carries `OnSwitch__enable`,
`DevPro__enable_code_assist`, B carries `DevPro__enable_credits_banner`,
`SignIn__enable_l1_signup_flow`. `html-text` decode drops `<script>`, so the visible text is
unaffected: `normalize(decodeBody(A)) === normalize(decodeBody(B))` → `true`, length 5579 both.
This is the dynamic-page class the round-18 note already limits in general
(`corpus/knowledge/source-recheck-round-18.md:143`: "A receipt's `sha256` must not be compared
across runs or used as a page identity"), but the S021 receipt itself does not say it, and
`w1/Recheck10.md:45-47` offers a **wrong** explanation: "the 4-byte delta is UA-dependent devsite
chrome." With the receipt's exact UA I obtained both 125482 and 125478 38 s apart; the delta is
per-response server content, not user-agent. The same w1 line also says the receipt fetch "is the
one `measure-c1.mjs --live` reproduces" — `liveCheck` (`measure-c1.mjs:380-432`) re-fetches and
checks HTTP 200 + decode + quote presence only; it never compares `bytes` or `sha256`, so `--live`
reproduces quote presence, not the canonical response.

Alternative rendering/raw endpoint was **not needed**: the quote is present, unique, and contiguous
in the first fetch (below). No evidence was replaced.

## 2. Decode, quote location, excerpt integrity

Receipt `decode` is `html-text` (`S021.json:11`). Using the producer's exported functions
(`.ufo/waves/round-18/recheck-fetch.mjs:21-48`) on fetch A:

- Normalized length 5579; quote index **2031**, exactly `S021.json:17` (`quoteOffset`); occurrence
  count **1**.
- Raw HTML byte offset **78167**, contiguous plain text inside
  `<div class="devsite-landing-row-item-description-content">Help your agent build, debug, and
  verify your code correctly. With Chrome DevTools for agents, …` — not tag-joined by tag
  stripping.
- Quote has 10 words (`S021.json:14`), ASCII, no fold needed.
- Derived excerpt `text.slice(max(0,2031-600), 2031+51+600) + "\n"` is **1262 bytes**, sha256
  `792b6959ac0c7091d22355db316488b63cc851151732fe1d37931289765306c6`; it is **byte-identical** to
  the committed `corpus/evidence/round-18/source-recheck/S021.excerpt.txt` (1262 bytes, same
  digest) and to `S021.json:19` (`excerptSha256`). This is stronger than the counter's own check
  (quote-in-committed-excerpt): the whole committed window regenerates from today's response.
- `quoteSource` `corpus/lessons/kaika-fleet-round-1.md:64` is the S021 row at REV and carries the
  same sentence with round-1 digest `33c0773da9e81c50d997229fb6b398e942fdd70ca3891cb6282708046906b4c0`.
- `producerSha256` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
  (`S021.json:24`) equals `git show 530f40a9….ufo/waves/round-18/recheck-fetch.mjs | sha256sum` and
  the working-tree file. The receipt blob at REV is `402264ffee404a74caf07d45e0f4304c1073a191d5ed640b70120699672eccee`,
  equal to the working-tree file; `git diff REV -- S021.json S021.excerpt.txt corpus/SOURCES.md` is
  empty.

## 3. Does the quote actually support `teaches`? — partial, not `held`

Row at REV, `corpus/SOURCES.md:35` (unchanged from B, same line):

> teaches: The supported high-level alternative to raw CDP for agent debugging and verification workflows

What the fetched page supports:

- "agent debugging and verification": yes. Quote at offset 2031; "With Chrome DevTools for agents,
  your AI agent can interact with the Chrome browser to test code, emulate users, and catch bugs
  using Chrome DevTools' capabilities before shipping" (offset 2144); "see agents debugging and
  verifying autonomously" (offset 4610).
- "supported", "high-level", "alternative to raw CDP": **not in the page**. Counts on the
  normalized 5579-char text: `CDP` 0, `Chrome DevTools Protocol` 0, `alternative` 0, `raw` 0,
  `supported` 0, `high-level` 0, `protocol` 0; `MCP` 6. The page's own `<meta name="description">`
  and `og:description` say: "Give the power of DevTools to agents through MCP or the CLI. Validate
  agent code by interacting with a real Chrome instance, run Lighthouse audits, and more." Its
  visible body is install instructions for `npx chrome-devtools-mcp@latest`, an Antigravity plugin,
  and Claude/Codex MCP setup. The page teaches an **MCP/CLI agent server**, not a "CDP
  alternative"; it never uses the comparison in its visible text.

The quote alone supports only the "build, debug, verify" workflow fragment. The receipt's `note`
(`S021.json:22`) says the three fragments "support teaches" and `teachesVerdict` is `held`
(`S021.json:21`); that overstates: at most the workflow clause is held, while the comparative
clause is the lane's own framing. Two further facts:

- The lane already knew this. `round-16/w2/ReopenS021.md:31-32` records the same defect
  ("`teaches` says 'alternative to raw CDP', but `cdp` occurs **0** times on the page; the creation
  quote grounds the debugging/verification workflow, not the CDP alternative"), and `:89-91`
  records "it does not ground 'raw CDP' or 'supported high-level alternative'". Round 16 also
  recorded the page's positioning as a DevTools MCP server, not a page-tool surface.
- The round-18 seat disclosed it only in its wave report: `w1/Recheck10.md:59-63` says the page
  contains no "CDP"/"Chrome DevTools Protocol", that the "alternative to raw CDP" clause is "the
  lane's comparative framing against the CDP rows, not a claim the page makes about itself", and
  still calls the page-level claim "fully supported". The counted artifact does not carry that
  caveat (`S021.json:21-22`), and the committed corpus note does not either
  (`corpus/knowledge/source-recheck-round-18.md:71` reproduces only the registry anchor; §5/§6 have
  no S021 caveat).

A second, smaller evidentiary gap: the receipt `note` cites "agents debugging and verifying
autonomously" as support, but that sentence is at normalized offset **4610**, outside the
committed excerpt window `[1431, 2682]`. The excerpt contains the intro and the "interact with the
Chrome browser…" sentence (offset 2144, inside), not the offset-4610 sentence. So the note's third
citation is not verifiable from the receipt's own committed bytes without a fresh fetch.

This is a partial-support verdict presented as full support. It is **not count-invalidating**: the
row is `queued` with `used-by —` (`corpus/SOURCES.md:35`); the only `corpus/knowledge/`
occurrences of `S021` are the round-18 recheck note itself (front matter line 1, §3 line 71, §4
line 111 — `grep -rn S021 corpus/knowledge/` → 3, all
`corpus/knowledge/source-recheck-round-18.md`), not a mined claim that cites it as evidence; and
the counter's contract only requires `teachesVerdict ∈ {held, drift}`. But a consumer reading
`S021.json` alone would over-read it, and the scalar report must not say "51 rows held" without the
S021 qualifier.

## 4. Source identity / anchor / teaches — held, drifted, unreachable

| Dimension | Result | Evidence |
|---|---|---|
| Source identity | **held** | Same URL, HTTP 200 on three requests; `<link rel="canonical" href="https://developer.chrome.com/docs/devtools/agents">` and `og:url` the same; `<title>Chrome DevTools for agents \| Chrome for Developers`; JSON-LD headline "Chrome DevTools for agents". |
| Anchor | **held as recorded** | JSON-LD `"dateModified": "2026-03-22"`; HTTP `last-modified: Sun, 22 Mar 2026 00:00:00 GMT`; no `revision` string, no visible last-updated line. This matches `S021.json:20` ("JSON-LD dateModified 2026-03-22; no in-body revision marker …") and the row anchor's strict sense ("rolling docs, no revision marker, read 2026-10-19"). No drift: the page's date is unchanged across the receipt, round-16's fetch, and mine. |
| Teaches | **partial; receipt says held** | Workflow fragment supported at offsets 2031/2144/4610; "supported high-level alternative to raw CDP" absent (0 CDP/alternative/supported tokens; meta description names MCP/CLI). See §3. |
| Quote presence | **held** | Unique at raw byte 78167 / normalized 2031; excerpt window reproduces byte-for-byte. |
| Unreachable | **none** | 200 on GET A, GET B, HEAD. No retry or alternative endpoint needed. |

## 5. Immutable availability vs live product freshness

As written, the C1 claim does **not** conflate the two: `PLAN.md:15` scopes C1 to "Source rows
re-verified against their live source with a committed recheck receipt"; `corpus/lessons/round-18.md:12-16`
says C1 "counts round-specific integrity-checked recheck receipts, not overdue rows or current
product support"; the note §6 limits receipts to what the cited documents contain; and the counter
returns `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date
gate"`. The row's own `recheck` cell is `on-release`, not date-due.

The residual is at the per-row label, and S021 is a concrete case:

- The page is live/rolling (`corpus/knowledge/source-recheck-round-18.md:111` lists it under "Live
  or rolling"), with `last-modified` 2026-03-22 — seven months before the check. What the receipt
  establishes is that the same 10-word promotional lede (and the 1262-byte window around it) is
  still served, on a page whose visible text is unchanged across two responses 38 s apart. That is
  **availability/stability of a document**, not live product freshness. It says nothing about
  whether the devtools MCP surface works on this host's Chromium 154, and the page itself is an
  install/overview page, not a capability statement.
- `teachesVerdict: held` reads as "the row's teaching still holds". For S021 the page supports only
  the workflow fragment; the comparative clause ("supported high-level alternative to raw CDP") is
  the lane's framing, already shown unsupported in round 16 and absent from the fetched body now.
  So a reader who takes `held` as validating the whole cell confuses the document's continued
  availability with the teaching's current validity.
- Binding identity to the receipt's `sha256` would also be wrong: four same-day responses produced
  four different digests (two lengths), and the receipt's 125482-byte digest was not reproducible
  even at the same length. Identity for this row has to be bound to canonical URL + `dateModified`
  2026-03-22 + the located quote, exactly as `round-16/w2/ReopenS021.md:49-51` concluded ("Bind
  identity to `dateModified` + the located quote, never to a response hash"). My excerpt
  regeneration is the positive check that makes that binding concrete.

Recommended narrow repair (integration seat, not this seat): carry the §3 caveat into the S021
receipt `note` (re-produce with the same body/quote and a note that says the page supports the
workflow but not the CDP comparison), or record it in the round-18 note and the scorecard wording
("51 receipts accepted; S021's held covers the workflow clause only"). A correction row for the
`teaches` cell is the round-16 recommendation and remains legal only as a new superseding row; it
is outside C1's drift rule because the source did not change.

## 6. Counter and contract checks

`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`, exit 0:

```
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c`, exit 0:

```
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c",…,"c1_rows_rechecked":0,"eligible_rows":51,"held":0,…,"row_classes":{"status":{"mined":42,"queued":8,"rejected":7},"url":{"immutable_pinned":14,"living_live":42,"own_work":1}},…}
```

S021 is accepted: schema, row present and not superseded, `rowUrl` verbatim in the source cell,
64-hex sha, 10-word quote equal to `quoteWords`, quote in the committed excerpt, excerpt sha
matches, `quoteFound: true`, `fetchedAt` on 2026-10-20, `httpStatus: 200`, producer sha equal to the
REV blob. `eligible_rows:58` at REV is the 64-row registry minus the six superseded rows; the seven
rows opened this round (S058–S064) have no receipt and are outside the baseline-51 target. The
note's §2 "51 / 0" figure is the B measurement (`eligible_rows` 51 at B), consistent with the
lesson's fixed baseline selection.

Finite documentation defect (shared by all HTTP receipts, not S021-specific): the `command` string
is a display rendering, not shell-parseable, because the UA is unquoted:

```
cmd=$(python3 -c "import json;print(json.load(open('corpus/evidence/round-18/source-recheck/S021.json'))['command'])")
bash -n -c "$cmd"    # exit 2: syntax error near unexpected token `('
```

The producer's actual call passes the UA as one argv element (`recheck-fetch.mjs:95`), and the
counter's `--live` uses its own `CURL_USER_AGENT` argv (`measure-c1.mjs:399`), so no measurement is
affected; only literal replay of the `command` field fails. My replay above quotes the UA.

## 7. Not done / limits

- I did not run `measure-c1.mjs --live` (it re-fetches 50 URLs). My S021 fetch uses the receipt's
  exact argv and is stronger for this row: it compares the full body digest, the normalized text,
  the quote offset, and the excerpt bytes, not only quote presence.
- S029 is outside this seat's assignment; no own-work source was fetched over the network.
- One page, one row, four responses (round-16's report, the receipt, two of mine) plus one HEAD on
  2026-10-20. The raw digest is not comparable across responses; the visible text and the excerpt
  are. No browser, no Chromium 154 run, no WebMCP invocation: this report says what the cited
  document contains, nothing about product behaviour.
- The page is a live/rolling doc; a later response could change the visible text. The committed
  excerpt is the checkable window, not a page identity.
- Author-side recheck only; no non-author verification is claimed here. No credential or session
  content was used; all requests were public GET/HEAD. No tool was installed or upgraded (curl
  and Node were already present; no package transaction).
- The registry anchor cell remains as opened (SOURCES append-only); this report does not repair
  it. The round-16 finding that the anchor omits `dateModified 2026-03-22` still stands as an
  incomplete-anchor note, not a C1 drift.

Files written (absolute):

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS021.md`
