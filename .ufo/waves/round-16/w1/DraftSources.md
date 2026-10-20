# DraftSources — round 16 report (TabiR16.DraftSources-5, scribe, author-side advice; not non-author certification)

Date: 2026-10-20. Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Leaf seat; no delegation, no commits, no background jobs. No gates, selftests, counters or browsers were run.

## Behavior

- Opened every source named in the assignment that resolved to a page or file, and grep-verified each Gate quote against the saved bytes.
- Drafted 11 SOURCES row cells: the S020 re-open (replace), plus proposed rows S030–S039 (8 `mined`/`queued` with quotes; 2 `rejected`). Full cells, the Gate quote table, the digest table and the round-16 search-log line are in `.ufo/waves/round-16/drafts/DraftSources.md`.
- Did not edit `corpus/SOURCES.md` or any knowledge, lesson, log or scorecard file. L1 owns those.

## Gates

- Quotes: every row carries at least one quote of 25 words or fewer, with section or line, URL and access date 2026-10-20. Quotes come from raw bytes (grep-verified) or from the read tool's reader text, and the draft marks which.
- Digests: sha256 of the fetched bytes for every opened source (draft §C). Repo HEADs are branch-tip values from `git ls-remote`, not blob-level commits, because the GitHub commits API was rate-limited (the response body read "API rate limit exceeded").
- Scope caveat: Chromium files are read from `main` at fetch time, not from the Chromium 154.0.8037.97 build on this host. Build-level claims stay with the probe seats.

## Touched surfaces

- Written (owned): `.ufo/waves/round-16/drafts/DraftSources.md`, `.ufo/waves/round-16/w1/DraftSources.md`.
- Scratch, outside the lane, uncommitted: `/tmp/tabi-r16-src/` (fetched bytes kept for re-hashing).
- Read-only: PLAN.md, corpus/SOURCES.md, spec.json (for the scout prompts).

## Tools installed or updated

None. The work used the existing `curl`, `git`, `node` and `sha256sum`. `gh` is present (`~/.local/bin/gh`) and was not used; its API calls were not made.

## Findings for L1

1. S020's recorded anchor is stale. The live spec is "Draft Community Group Report, 20 October 2026", meta revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, which equals the webmcp repo HEAD at fetch time. The recorded `f14762e6` (2026-10-16) is not in the page. The C2 contract should cite cb3d1696.
2. The entry point matches the observed Chromium surface. Spec and Chromium IDL both put `modelContext` on a partial Document interface, `[SecureContext, SameObject]`. The spec text has no `navigator.modelContext`. Chromium's supplement IDL is `RuntimeEnabled=WebMCP`. Rejected S038 claims `navigator.modelContext`, which the IDL contradicts.
3. Declarative is not specified. The repo README states the declarative API "is not part of the specification at this time", and the explainer leaves form-to-schema synthesis TBD, with "Chromium is implementing a loose version". Any knowledge note must scope declarative to Chromium's experimental `DeclarativeWebMCP` feature, not to the spec.
4. Chromium main is ahead of the spec in one place I could see. It has `resumeTool`, gated by WebMCPContinuations (model_context.idl line 54); the fetched spec text has no "resume" or "continuation" match.
5. PLAN flag spellings need checking against the 154 binary before the probe seats use them. Main source: `DeclarativeWebMCP` (PLAN says `DeclarativeWebmcp`). `WebMCPTesting` and `DevToolsWebMCPSupport` appear in neither fetched file. `chrome://flags/#enable-webmcp-testing` maps to `kWebMCP` (about_flags.cc line 13181–13183).
6. The protocol shape is consistent across the protocol JSON and the Chromium PDL. The `WebMCP` domain is experimental; `Tool` carries `frameId` and an optional `backendNodeId` "for declarative tools". This is my reading of the PDL, not an observation from the 154 binary.
7. S002 was not re-opened by this seat. The tip-of-tree viewer URL is a redirect shell, so S033 cites the protocol JSON instead. L1 decides whether S002 takes a used-by add.
8. The Chrome docs say "from Chrome 149" with no end milestone. The Fastly claim of "through 156" is therefore rejected (S039), with a flip condition written in the draft. `debugging` annotation "available from Chrome 156" is a different claim.

## Out of scope (not done)

- SrcSpecSecurity (not in this seat's list).
- Any Chromium 154 runtime observation; that belongs to WebmcpProbe* and WebmcpHarness.
- Registry numbering: S030–S039 are proposed; L1 assigns final ids and runs `node scripts/check-sources.mjs` after integration.
- The webmcpverify.com Chrome 146 article was screened and not rejected (it re-scopes its own API names to `document.modelContext`).
- MCP `Tool` fields beyond line 300 of 804 were not read; S037 is therefore marked partial.

## Checks main should run after integration

- `node scripts/check-sources.mjs` (structure only).
- Confirm the S020 anchor change and the proposed ids against the registry validator.
- Re-hash the scratch copies in §C of the draft before any row is admitted, if the sources are re-fetched later.

## Artifact paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/drafts/DraftSources.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/w1/DraftSources.md`
