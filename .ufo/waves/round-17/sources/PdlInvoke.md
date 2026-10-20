# PdlInvoke — Chromium 154 WebMCP domain PDL (source open, round 17)

VERDICT: PASS

Seat `TabiR17.SrcPdlInvoke-2`. Opened 2026-10-20. Purpose: the build-authority CDP
declaration of the WebMCP **invocation** surface that C2 must turn into committed evidence, plus
its delta against Chromium main.

## Opened source

| Field | Value |
|---|---|
| canonical URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT |
| grep-able URL (no `?format=TEXT`) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl |
| revision | tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles `+refs/tags/154.0.8037.97?format=JSON`); git blob `13490686045341e0e01e9572294856a2d37f2a32` |
| access date | 2026-10-20 |
| raw-fetch sha256 (as served, base64, 5,292 B) | `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4` |
| decoded file sha256 (3,969 B, 123 lines) | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` |
| anchor | line 7 (`experimental domain WebMCP`), `depends on` lines 8-10, `invokeTool` lines 58-69, `cancelInvocation` lines 71-75, invocation events lines 97-122 |
| kind | `code` |
| proposed tier | **A**, scoped to: the CDP WebMCP invocation contract declared by the 154.0.8037.97 tag and served by that build — primary source, and its bytes match the build's own `/json/protocol` (§Cross-check) |
| recheck cadence | `on-release` (Chromium tag) |

**VERBATIM quote** (line 68 comment text, file sha256 `26e62f29…37ff`):

> `Unique identifier for this invocation. Response is sent before tool events.`

11 words. Grounds the row's `teaches`: the command result carries only an id; the outcome is a
separate event.

**What it teaches the lane, one line:** `invokeTool` returns an `invocationId` before any tool
event, so the invocation outcome — including `Canceled` — arrives only in `toolResponded`.

## Fetch sweep — all reachable

| URL | HTTP | bytes |
|---|---|---|
| gitiles `…/refs/tags/154.0.8037.97/…/domains/WebMCP.pdl?format=TEXT` | 200 | 5,292 (base64) |
| gitiles `…/refs/heads/main/…/domains/WebMCP.pdl?format=TEXT` | 200 | 5,504 (base64) |
| raw.githubusercontent `chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | 200 | 4,126 |
| gitiles `…/refs/tags/154.0.8037.97/…/browser_protocol.pdl?format=TEXT` | 200 | 2,452 (base64) |
| gitiles `…/refs/heads/main/…/browser_protocol.pdl` (raw.githubusercontent mirror also 200) | 200 | 2,492 / 1,868 |
| gitiles `+refs/tags/154.0.8037.97?format=JSON`, `+refs/heads/main?format=JSON`, file `?format=JSON` | 200 | metadata |
| gitiles `…/refs/tags/154.0.8037.97/…/browser_protocol-1.3.json?format=TEXT` | 200 | 428,584 (base64) |

No unreachable host; no sweep truncation. Digests are of the decoded file unless labelled raw.

## C2 facts — each with its tag line anchor

| Fact (tag `154.0.8037.97`) | Line anchor | What an invocation claim may assert |
|---|---|---|
| The domain is declared `experimental` and depends on Runtime, Page, DOM | 7, 8-10 | The surface is experimental; its shapes are build-scoped, never spec text |
| `invokeTool` takes `frameId`, `toolName`, `input` (object) | 58-66 | Invocation addresses one frame plus a name; there is no page-level or global tool address |
| `invokeTool` returns one string `invocationId`; the response precedes tool events | 67-69 | A command response is **not** the tool result; a consumer must correlate by id on the event stream |
| `toolInvoked` carries `toolName`, `frameId`, `invocationId`, and `input` as a **string** | 97-107 | The CDP event re-serialises the input as JSON text, unlike the object the command accepted |
| `toolResponded` carries `status`, optional `output`, optional `errorText`, optional `exception` | 109-122 | Terminal outcome is one of three declared statuses; output is `any` and must be treated as untrusted (note at line 117 names prompt injection) |
| `InvocationStatus` = `Completed` / `Canceled` / `Error` | 25-30 | `Canceled` is a declared terminal status, so a cancel is not an error and not a missing response |
| `cancelInvocation` takes an `invocationId` | 71-75 | Cancellation is by id at the protocol level; the PDL declares no page-side cancel |
| `Tool.backendNodeId` is the declarative marker | 45-46 | A declared tool's DOM provenance is declarative-only; imperative tools carry `stackTrace` instead (47-48) |
| `toolsRemoved` carries only `name` + `frameId` | 83-95 | Removal is a name/frame fact; there is no navigation-removal event to rely on |
| `Annotation` = `readOnly` / `untrustedContent` / `consequential` / `autosubmit` | 12-23 | These are page-declared **hints**; none is a guarantee, and none is validated by the protocol |

Case mapping for C2's required set: `invoke-imperative-success` ← 59-69 + 110-118;
`invoke-imperative-throws` ← 121-122 (`exception` is a `Runtime.RemoteObject`, distinct from
`errorText`); `invoke-imperative-rejects` ← 119-120 vs 121-122 (the PDL declares both optional; which
one a rejection populates is build behaviour, for the harness to observe); `invoke-unknown-tool` ←
63-66 (no declared "not found" return — a protocol error is not in the PDL); `invoke-input-schema-mismatch`
← 65-66 (the PDL says the input "match[es] the tool's inputSchema" but declares no protocol-level
validation); `invoke-declarative-form` ← 46; `invoke-after-unregister` ← 91-95;
`invoke-concurrent-ids` ← 68 (per-invocation id declared; ordering across ids is **not** declared);
`invoke-flags-off-control` ← 7 + 53-56 (the domain's enable/disable is independent of any page feature
flag); `invoke-iframe-frameid` ← 44, 62, 103; `invoke-navigation-pending` ← 68 + 74 (nothing in the
PDL declares what a navigation does to a pending invocation — that is an observation, not a citation).

## Cross-check against the shipped 154 build

The round-16 committed capture `corpus/evidence/round-16/webmcp/protocol-domain.json` holds the
154 build's own `/json/protocol` WebMCP domain (protocol sha256 `126cf5fa…5e7d`, 58 domains,
identical with and without WebMCP flags). Compared field by field with the tag PDL: **32 declared
fields, 0 semantic differences** — 4 types (`Annotation` with 4 properties, `InvocationStatus` with
3 values, `Tool` 7, `RemovedTool` 2), 4 commands, 4 events. Verification: a `python3` set comparison
over (kind, owner, params/returns, field, type-or-$ref, optional) prints
`PDL fields 32 shipped 32 | equal True`, both difference sets empty; the JSON merely projects
`array of Tool` as `{type: array, items: {$ref}}`.

Negative cross-check: the tag's checked-in `browser_protocol-1.3.json` is a **33-domain legacy
snapshot with zero occurrences of `WebMCP`** (`grep -c WebMCP` → 0), so that file must not be cited
as "the 154 protocol". The aggregator `browser_protocol.pdl` at the tag does include the domain
(line 62) and declares protocol version 1.3 (lines 7-9); decoded sha256 `7d6b626ced3287a0fc6b6991e1b3b1ed944fcb5654bf305639c4cf1d86db66da`.

## Delta against main (2026-10-20)

main `WebMCP.pdl` at `refs/heads/main` = commit `8efae681a0524266b73507914e1c5012fdab118f`,
sha256 `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f`, 4,126 B, 125 lines —
**identical to S035's round-16 recorded digest**, so the file did not move even though main's HEAD did.
`diff` tag→main is one hunk, `+2` lines: a fifth `Annotation` property

> `# If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.` (main lines 22-23, `optional boolean debugging`)

Everything else is byte-identical. The aggregator also gained `include domains/FindInPage.pdl`
(main line 36) — a second, unrelated delta.

Consequence: citing main's WebMCP.pdl for `Annotation` fields over-attributes to the 154 build; the
154 tag has four annotation fields, not five. S035 quoted the main file (lines 53-54 of the enable
comment, re-verified byte-for-byte at the current main), which stays correct for main only.

## C1-supporting facts (revision anchoring)

Each is observed here; the mapping to C1's lane-tip rule is [INFERENCE], stated as such.

1. **Tag → immutable commit is resolvable**: `+refs/tags/154.0.8037.97?format=JSON` → `b510e9d7…f78d`;
   the file's own metadata names blob `13490686…a32`. Two independent identities for the same bytes.
2. **Content digest survives ref movement**: main's HEAD moved to `8efae681` while `WebMCP.pdl` kept
   sha256 `f386bcfd…f99f` identical to its round-16 value. A citation anchored on commit + content
   digest is stable; one anchored on "main" is not — the same failure mode C1 removes from gates that
   read `HEAD`.
3. **Digest convention confirmed, not assumed**: re-fetching S033's file at the same tag yields
   decoded sha256 `50dd337d…6364`, exactly the value S033 records, while the base64 transport digest
   is `9c0d5822…f373`. The lane records the decoded-file digest; this row does likewise and labels
   the transport digest separately.

## Relationship to the round-16 note and existing rows

- **No contradiction** with `corpus/knowledge/webmcp-chromium-loopback-round-16.md` or any registry
  row. The note's probe statement (invokeTool → `invocationId`, `toolInvoked` input as JSON string,
  `toolResponded` status/output) matches lines 59-69 and 97-118 exactly.
- **Gaps the note leaves, now sourced**: (a) `cancelInvocation` is declared at 154 (71-75) and present
  in the build's protocol (round-16 probe recorded `cdpCancelInvocation: true`) — the note never
  mentions it; (b) the note collapses failure into "status/output" and does not distinguish
  `errorText` (protocol text) from `exception` (`Runtime.RemoteObject`); (c) it does not record the
  `Annotation` hint set that the invocation cases will surface.
- **Not a duplicate of S035**: S035 is Chromium main via raw.githubusercontent; this row is the
  154.0.8037.97 tag, whose bytes are the ones the shipped build serves, plus the main delta. Keeping
  S035 supplies the "what changed" half.

## Draft registry row (13 pipe fields; L1 replaces `S0??` with the assigned id)

| S0?? | Chromium 154 WebMCP domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | code | A | CDP WebMCP invocation contract at the 154.0.8037.97 tag: invokeTool, cancelInvocation, toolInvoked and toolResponded, InvocationStatus | tag 154.0.8037.97 fetched 2026-10-20, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, lines 7 and 58-122, sha256 26e62f29…37ff | invokeTool returns an invocationId before any tool event, so the outcome including Canceled arrives only in toolResponded | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |

Structural check, run on a sandbox copy (LANE untouched): `check-sources.mjs --root
/tmp/pdl-r17/checkroot2` → `SOURCES_GATE verdict=clean rows=41 tiers=A:32,B:4,C:5 status=queued:2,mined:34,rejected:5 findings=0` exit 0.
Frozen census awks on the same copy: rows 41, malformed 0, duplicate ids none, enum violations none.

## Gate entry (for `corpus/lessons/round-17.md` §Gate)

| S0?? | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | "Unique identifier for this invocation. Response is sent before tool events." | line 68; tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; decoded sha256 `26e62f29…37ff`, raw base64 fetch sha256 `0ea9bf3f…47e4` |

## Integration notes

1. The row's `used-by` names `corpus/knowledge/webmcp-invocation-round-17.md`, so **the note must
   exist at the same revision** or `check-sources.mjs` reports `E11 used_by_missing row=S0??`
   (observed verbatim on a sandbox without the note, exit 1). If L1 lands the registry row before the
   note, use `queued` + `—` first and flip it when the note lands, logging old→new in the lesson
   (also verified: that variant prints `verdict=clean`, exit 0).
2. The knowledge note is not written here — `corpus/knowledge/**` is L1-owned.
3. No tool installs or upgrades were made for this seat; `curl`, `python3`, `node` v24.21.0 and the
   lane's own `scripts/check-sources.mjs` were used as provided.

## Files written

- `.ufo/waves/round-17/sources/PdlInvoke.md` (this file)
- `.ufo/waves/round-17/w1/SrcPdlInvoke.md` (seat report)
