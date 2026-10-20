VERDICT: PASS

Seat `TabiR17.SrcPdlInvoke-2` (leaf, no dispatch). Full dossier:
`.ufo/waves/round-17/sources/PdlInvoke.md`.

## Opened

Chromium `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` at tag
`154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, git blob
`13490686…a32`), fetched 2026-10-20 from
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT

- raw (base64) sha256 `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4`, 5,292 B
- decoded file sha256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`, 3,969 B, 123 lines
- digest convention verified against S033 (decoded `50dd337d…6364` matches its recorded value; base64
  transport digest is `9c0d5822…f373`), so the row records the decoded digest and labels the raw one.
- Anchor: line 7 `experimental domain WebMCP`; invocation block 58-75; events 97-122.
- Quote, line 68: "Unique identifier for this invocation. Response is sent before tool events."
  (11 words, verbatim substring of the fetched bytes — `grep -cF` → 1).
- Kind `code`, tier **A** scoped to the 154-tag CDP WebMCP invocation contract, recheck `on-release`.

## C2 facts (tag line anchors — details in the dossier table)

- `invokeTool{frameId,toolName,input}` → `invocationId`; response is sent **before** tool events (58-69)
  → the invoke response is never the result; correlate on `toolResponded`.
- `toolInvoked` input is a **string** (107) while the command accepted an object (66).
- `toolResponded`: `status` (115) + optional `output` (118), `errorText` (120), `exception`
  `Runtime.RemoteObject` (122) → two distinct failure surfaces; PDL line 117 names prompt injection.
- `InvocationStatus` = Completed / Canceled / Error (25-30) → cancel is a terminal status, not an error.
- `cancelInvocation{invocationId}` exists at 154 (71-75) — **absent from the round-16 note**.
- `Annotation` = readOnly / untrustedContent / consequential / autosubmit (12-23) — hints only.
- `toolsRemoved` = name + frameId only (83-95); `Tool.backendNodeId` is the declarative marker (45-46).
- Case mapping to the eleven C2 case ids is in the dossier; `invoke-navigation-pending` is explicitly
  **not** PDL-grounded (no navigation clause), so it must stay an observation.

## Cross-checks

- Shipped 154 `/json/protocol` WebMCP domain (round-16 capture `corpus/evidence/round-16/webmcp/protocol-domain.json`,
  protocol sha256 `126cf5fa…5e7d`, 58 domains): **32 declared fields, 0 semantic differences** vs the
  tag PDL (4 types, 4 commands, 4 events; only delta is the JSON `items.$ref` encoding of `array of`).
  The tag PDL is therefore the build's own declaration, not merely a repo artifact.
- Trap recorded: the tag's checked-in `browser_protocol-1.3.json` is a 33-domain legacy snapshot with
  `grep -c WebMCP` → **0**; it must not be cited as "the 154 protocol". The aggregator
  `browser_protocol.pdl` does include the domain (line 62); decoded sha256 `7d6b626c…66da`.
- Main delta (commit `8efae681…`, fetched 2026-10-20): main `WebMCP.pdl` sha256 `f386bcfd…f99f` — the
  same value S035 recorded — so the file did not move while main's HEAD did. `diff` vs tag is one hunk,
  `+2` lines: `optional boolean debugging` (main 22-23). Aggregator also gained `include domains/FindInPage.pdl`.
  Citing main's Annotation fields over-attributes one field to 154.

## Contradictions

None with `corpus/knowledge/webmcp-chromium-loopback-round-16.md` or any registry row. The note's
probe statement matches lines 59-69/97-118. Gaps now sourced: `cancelInvocation`, the
`errorText`/`exception` split, and the annotation set. Not a duplicate of S035 (main) — this row is
the tag whose bytes the shipped build serves, plus the main delta.

## C1-supporting anchoring facts

- Tag ref → commit `b510e9d7…f78d` is resolvable (`+refs/tags/154.0.8037.97?format=JSON`), and the
  same bytes carry a content digest independent of the ref.
- `WebMCP.pdl` sha256 was unchanged across a main HEAD movement (`8efae681`), exactly the
  ref-vs-content distinction C1 encodes for gates reading `HEAD`. The mapping to C1 is [INFERENCE];
  the digests and revisions are observed.

## Draft row and Gate

Both are in the dossier (§Draft registry row, §Gate entry), 13 pipe fields, `S0??` placeholder per
the ticket. Structural proof on a sandbox copy (LANE untouched, `/tmp/pdl-r17/checkroot2`):
`node scripts/check-sources.mjs --root … --file corpus/SOURCES.md` →
`verdict=clean rows=41 tiers=A:32,B:4,C:5 status=queued:2,mined:34,rejected:5 findings=0`, exit 0;
frozen awks: rows 41, malformed 0, duplicate ids none, enum violations none. Without the cited note
the same checker prints `E11 used_by_missing row=S041` exit 1, so the row (`mined` +
`corpus/knowledge/webmcp-invocation-round-17.md`) must land with that note; the `queued` + `—`
variant also verifies clean if L1 integrates in two steps.

## Sweep

All URLs reachable (HTTP 200): tag PDL, main PDL (gitiles + raw.githubusercontent), tag/main
`browser_protocol.pdl`, tag/main ref JSON, tag file JSON, tag `browser_protocol-1.3.json`. No
unreachable host; no tool installs or upgrades were made (host `curl`, `python3`, `node` v24.21.0).

## Files written

- `.ufo/waves/round-17/sources/PdlInvoke.md`
- `.ufo/waves/round-17/w1/SrcPdlInvoke.md`
