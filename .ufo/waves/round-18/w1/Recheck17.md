VERDICT: PASS

Lane tip read for row cells: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` → `2bff864fdfee684ddbcd066cc8e735adaba2735c`. Producer: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`, sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (same value recorded by sibling seats, e.g. `corpus/evidence/round-18/source-recheck/S001.json`).

## S034 — Chromium 154 runtime_enabled_features.json5 — verdict held

- Row at tip: `corpus/SOURCES.md:48`; rowUrl occurs verbatim in the `source` cell (`grep -cF` on the tip blob → 1).
- Fetch: `GET .../154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT`
  (rowUrl unchanged; `?format=TEXT` passed only as `--url`), decode `base64`; http 200, bytes 310220.
- Raw (base64 transport) sha256: `3dc33e9d2e40f0c448c13e1ab7d1ea4f5a74dc1e95c72b943fbd5b43f2a478d0`
- Decoded body sha256: `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` — equals the row's recorded identity `99b92e67…1d2b`, so the tag body is byte-identical to what the row was opened against.
- Quote (original Gate quote, `corpus/lessons/round-16.md:44`, 8 words) found at normalized offset 184675:
  `implied_by: [ "WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting" ], status: "experimental",`
- Anchor observed: no in-body revision marker; tag `154.0.8037.97` from the row URL; WebMCP block at decoded body lines 7023-7050.
- Teaches check (`teaches` = "WebMCP is experimental and implied by WebMCPTesting at 154; no DeclarativeWebmcp feature exists there, so that flag token is inert"): `name: "WebMCP"` 7023 with `status: "experimental"` 7036; `implied_by` lists all three features including `WebMCPTesting` (7030-7035), which itself is `status: "experimental"` at 7049; grep for `DeclarativeWebmcp|WebMCPDeclarative` returns only `WebMCPDeclarativeFileInput` rows (7031, 7038) — no `DeclarativeWebmcp` token exists. Held, not overstated.
- Second fetch ~1 min later: raw sha256 identical `3dc33e9d…a478d0`, decoded identical `99b92e67…1d2b`.

## S035 — Chromium main WebMCP.pdl — verdict held (Gate quote restated; quote-source `new`)

- Row at tip: `corpus/SOURCES.md:49`; rowUrl occurs verbatim in the `source` cell (`grep -cF` on the tip blob → 1).
- Fetch: same URL as the row (`raw.githubusercontent.com/chromium/chromium/main/.../WebMCP.pdl`), decode `none`; http 200, bytes 4126.
- sha256: `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` — equals the row's recorded identity `f386bcfd…f99f`, so the body is byte-identical to what the row was opened against.
- Gate quote at `corpus/lessons/round-16.md:45` ("Enabling the domain will trigger a toolsAdded event for all currently registered tools.") is **not a contiguous span** of the body: the sentence is wrapped across two comment lines (53-54), each carrying a `# ` prefix, so the tool's whitespace normalizer cannot match it. Probe: `--normalize-only --decode none --body /tmp/S035.pdl --quote '<Gate quote>'` → `{"found":false,...}`.
- Replacement quote (3 words, `--quote-source new`, found at normalized offset 234):
  `experimental domain WebMCP` — body line 7.
- Anchor observed: no in-body revision marker (`# Copyright 2026 The Chromium Authors`, line 1); main fetched 2026-10-20; body sha256 `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f`.
- Teaches check (`teaches` = "The domain is experimental; enable replays toolsAdded for registered tools; backendNodeId marks declarative tools; the 154 build's own /json/protocol is the build authority"): line 7 `experimental domain WebMCP`; line 48 `optional DOM.BackendNodeId backendNodeId` under the `# Optional node ID for declarative tools.` comment (47); lines 53-54 `command enable` documented as triggering `toolsAdded` for all registered tools, with `event toolsAdded` at 80. The final clause is a methodological statement about the 154 build's `/json/protocol`, not a claim about this body — it is not contradicted here. Held.
- No superseding row drafted (holding row, not drift). Gate is byte-frozen, so the line-join rendering is recorded only in this report and in the receipt `note`.
- Second fetch ~1 min later: sha256 identical `f386bcfd…f99f`.

## Receipt contract self-check (both receipts)

`node -e` over the two JSON files: schema `tabi-source-recheck-v1`; `rowUrl` in the tip row cell; `sha256` 64-hex; `quoteWords` equals the whitespace word count (S034 8, S035 3, both ≤25); `normalize(quote)` occurs in `normalize(excerpt file)` → true; excerpt file bytes match the recorded `excerptSha256`:
- S034.excerpt.txt `941f353dc64c00c82f312e090728f7e0dfdc08690dddd7355a2e889fbac81c94`
- S035.excerpt.txt `1538792635294ec9fc5c1039f41c035fc450b286b55e20f2cd4ad07001dc38ca`
`quoteFound` true, `fetchedAt` 2026-10-20T19:06:12.039Z (S034) / 2026-10-20T19:06:11.024Z (S035), `httpStatus` 200, `producerSha256` `f2ba0033…a360`.

Integration flags:
1. `recheck-fetch.mjs` exists only on disk: `git show <tip>:.ufo/waves/round-18/recheck-fetch.mjs` → "exists on disk, but not in '2bff864…'". Every receipt in this wave records `producerSha256` `f2ba0033…a360`, so the REV commit must include exactly those tool bytes or all receipts need regeneration.
2. S035 needs no new row, but the round-16 Gate quote at `corpus/lessons/round-16.md:45` is a wrap-joined rendering; a future lesson correction (round-18 `## Corrections`) could state that the contiguous quotes are line 7 and the two comment lines separately.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S034.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S034.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S035.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S035.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck17.md
