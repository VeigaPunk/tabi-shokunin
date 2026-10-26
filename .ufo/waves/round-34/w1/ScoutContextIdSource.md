# ScoutContextIdSource — C2 sourcing: BiDi browsingContext id shape

**Verdict: the upper-case claim HOLDS, in source and in the round-32 transcripts.** At Chromium tag
`154.0.8037.97` (commit `b510e9d7…`, tree `e096b085…`, same pin as S125/S127) a page target's DevTools id is
`devtools_frame_token().ToString()`, an `UnguessableToken` whose `ToString` forwards to `base::Token::ToString`, which
prints `%016PRIX64%016PRIX64` — 32 upper-case zero-padded hex characters; `Token::FromString` is "intentionally strict about case,
accepting 'A' but rejecting 'a'". The vendored chromium-bidi mapper (v17.0.2, rev `d3bda5af…`, Static.HardFork — no npm tag, the copy
lives in `third_party/chromium-bidi` of the Chromium tree) creates the top-level `BrowsingContextImpl` with `targetInfo.targetId`
verbatim, so the BiDi context id equals the CDP targetId. The round-32 evidence agrees: `run1`/`run2` transcripts carry exactly two
distinct context ids, `31B8FE9C25C36020CBB175F250715903` and `0E62B928C3D82E935056B338D5E0FBF4` (36 occurrences each),
both `[0-9A-F]{32}`; the session id `10abbb479bdcc37a405098c5ea778bf0` is lower-case (S127). Two rows drafted: S130 (shape, token.cc)
and S131 (identity, CdpTargetManager.ts). Not opened: the nested-frame `frameId` shape, tab-target ids.

## Evidence (file:line at the tag; decoded blobs)

| claim | file:line |
|---|---|
| `Token::ToString` = `"%016" PRIX64 "%016" PRIX64` | base/token.cc:34-36 (sha256 dec `6ef1fc2b…2628f`) |
| strict upper-case parse | base/token.cc:46-47, 50-53 (`'A' <= c <= 'F'`) |
| `UnguessableToken::ToString` forwards to `Token` | base/unguessable_token.h:105 |
| DevTools agent-host id = frame token string | content/browser/devtools/render_frame_devtools_agent_host.cc:339; devtools_agent_host_impl.cc:255-256, 387-388 |
| mapper: top-level context id = targetId | third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts:223,245-247 |
| mapper: nested frame id = CDP frameId | CdpTargetManager.ts:135-136 |
| mapper version/pin | third_party/chromium-bidi/README.chromium:1-6; package.json "version": "17.0.2" |

All fetched with `curl -q -sS --proto =https "<gitiles URL>?format=TEXT" | base64 -d`, HTTP 200, 2026-10-26T19:47Z-19:50Z; URLs, times,
byte counts and sha256 are in `rows.md` (Gate entries). A burst of three 503s (Google error body, 1,459 B) came back for
render_frame_devtools_agent_host.cc, identifiers_factory.cc and the tag JSON; each succeeded on retry after 8-16 s; identifiers_factory.cc
was fetched (200) but not used for any claim. Commands: the `curl` loop above, `grep -n` on the decoded files, `grep -ohE '"context":"[^"]*"'`
on `corpus/evidence/round-32/bidi/run{1,2}/transcript.jsonl` (exit 0). No tool installs, no browser launched.

## Evidence-side cross-checks run

- `grep -ohE '[0-9A-F]{32}'` over `corpus/evidence/round-32/bidi/`: 8 distinct upper-case 32-hex strings (the two context ids plus
  others elsewhere in the receipt); `grep -ohE '[0-9a-f]{32}'` in run1: the session id and the first 32 chars of the commit hash in
  `chromedriverVersion` — a gate that scans for lower-case 32-hex must not mistake the latter for an id.
- `scripts/check-bidi-runtime.mjs:67,881` already states and generates the upper-case shape (`sha256(...).toUpperCase().slice(0, 32)`).

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w1/ScoutContextIdSource/rows.md` — S130, S131 rows + Gate entries
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w1/ScoutContextIdSource/receipts/` — decoded blobs (token.cc, unguessable_token.cc/.h, render_frame_devtools_agent_host.cc, CdpTargetManager.ts, README.chromium) and tag.json; hashes in rows.md match them
- Scratch `/fast/scratch/hyaku/tabi-r34/ScoutContextIdSource` removed.

## Notes for the L1

- Rows need `corpus/knowledge/bidi-gate-selftest-round-34.md` to exist and carry `S130` and `S131` (else `used_by_missing`).
- identifiers_factory.cc was fetched but no row cites it (S131 deliberately makes no claim about the frameId shape); the only mention of it in rows.md is the 503 fetch note.
