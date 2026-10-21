# SourceS094 — independent source re-open

**Finding: AGREE with S094's HTTP404 rejection; no status flip is warranted.** Confidence: high for the exact tagged path and recorded quote; no conclusion about form-schema behavior or test execution.

Axes: **depth** (located quote and narrow entailment), **freshness** (independent fetch and body comparison), **calibration** (rejection versus conditional replacement).

## Checkpoint and scope

Attacked revision: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). The lane's `refs/heads/master` resolved to R. Read-only `git show R:<path>` confirmed the S094 row at `corpus/SOURCES.md:108`, its lesson record at `corpus/lessons/round-19.md:51`, and the original retained response. The two selected text lines and original decoded evidence matched the working copies. No other registry row was reopened or mined.

| Row field at R | Finding |
|---|---|
| Source | Exact missing-file URL below; no redirect occurred. |
| Kind / tier | `code` / `C`. This describes an attempted code source, not fetched implementation: the actual response is an error message. Tier C is appropriately conservative and cannot support admitted functional facts. |
| Scope | Only the attempted file path at Chromium tag `154.0.8037.97`. Supported; not a repository-wide claim that form-schema tests do not exist. |
| Status | `rejected`. Supported by independent HTTP404 plus successful parent-directory/tag controls. |
| Opened / recheck | `2026-10-21` / `on-release`. The opening date is corroborated by the retained historical evidence; the independent access was also 2026-10-21. A later release can motivate a new source search, but does not itself repair this fixed-tag URL. |
| Used-by | `corpus/lessons/round-19.md` exists and explicitly cites S094 as rejected at line 51; lines 54–56 preserve the rejection and distinguish the alternative test lead from an implementation quote. |

Literal searches in `SKILL.md`, `corpus/knowledge/`, and `corpus/evidence/round-19/validation/` found no S094 ID or missing filename. This is a bounded textual observation, not semantic proof of the absence of indirect dependencies. `read xd://lsp` returned `No such tool`; no LSP device/server was available, rather than an empty cold-index result. No exported implementation contract was recovered from the missing file.

## Exact fetch and located quote

Source URL, accessed **2026-10-21**:

<https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT>

- Observed HTTP status: **404**; final URL identical to requested URL.
- Recorded fetch timestamp: `2026-10-21T08:40:27.233586+00:00`.
- Response type: `text/plain; charset=utf-8`; content encoding: identity.
- Located quote: **“NOT_FOUND: Requested entity was not found”** — **6 whitespace-delimited words**, response **line 1**, matching `corpus/lessons/round-19.md:51` exactly.
- Decoded response: **233 bytes**; SHA-256 **`6575d4a30c9fcb13477e9e3ec7202df32813e3c7acd6fc3e6e7a09eb9d126cd9`**.
- Retained complete response: `.ufo/waves/round-19/w2/SourceS094.body.gz` (**183 compressed bytes**).

Decoding here means HTTP content decoding, not Gitiles base64 decoding: a failed `format=TEXT` request returned plain error text, not a base64 source blob.

### Historical SHA and drift

The R artifact `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` decodes to **233 bytes**, SHA-256 **`9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`**, exactly the hash in both registry and lesson. The independently fetched body differs **only at line 7**, the server-generated `request_id`: historical `ae2958d1612f4cf1a1b6caf7c52fd969`, refetch `7a06da48743d4d6599d5a0f9817aa7b8`. All other lines match.

Therefore the new full-body SHA **does drift**, but the recorded historical hash is correct. This is per-request error-envelope variability, not evidence that immutable Chromium code changed, and not rolling-document drift. No missing source blob's SHA can be verified because no source blob was returned.

## Controls: missing file, not missing tag or directory

These two diagnostic fetches only disambiguate S094's negative result; they do not mine an alternative source.

1. Tag URL, accessed **2026-10-21**:
   <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON>
   - HTTP **200**; JSON `/commit` = `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; `/tree` = `e096b0852a79b0810dba5cfaa714c95d74908532`.
   - Decoded body **2,334 bytes**; SHA-256 `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`.
   - Retained `.ufo/waves/round-19/w2/SourceS094.tag.body.gz`.
2. Exact parent directory URL, accessed **2026-10-21**:
   <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/?format=JSON>
   - HTTP **200**; directory `/id` = `05d83bb3e33e0d50ba4df58c7ceb6f3c3a3d2c7a`.
   - Complete JSON `/entries` contains **248 immediate entries** and **0** named `form_mcp_schema_unittest.cc`.
   - The listed lead `html_form_mcp_tool_test.cc` is a blob, ID `1ab20b5736a34838eef0cd959dbeec414daa7534`. Only its directory entry was checked; its body was not fetched or mined.
   - Decoded body **37,662 bytes**; SHA-256 `e21daf15b3d0beb35d9d31b8ea8e0279fed6e44466a9a10b5612c6d1630b619a`.
   - Retained `.ufo/waves/round-19/w2/SourceS094.parent.body.gz`.

The successful controls and exhaustive immediate-directory enumeration strengthen the scoped interpretation: the exact expected filename is absent from the tagged forms directory. They do not establish absence under every other path or filename.

## Source-versus-teaches and flip

**Entailed:** the attempted tagged file request fails with the located NOT_FOUND message; the exact filename is absent from its existing parent directory. This supports S094's narrow rejection reason and its lesson's exclusion.

**Not entailed:** any declarative-WebMCP validation branch, schema rule, unit-test assertion, CDP outcome, browser support claim, or passing runtime test. An error response is neither proposal/spec text nor implementation/test source. The `code` category must not convert it into implementation evidence.

**Flip assessment:** agree with a resolvable test file plus a correctly located test-body quote as the criterion for admitting a **replacement test source**; **that criterion has not been met by this re-open**, and it does not make S094's exact URL resolve. The parent listing establishes only the alternative filename's existence. `corpus/lessons/round-19.md:55–56` and the original seat report `.ufo/waves/round-19/w1/SrcFormSchemaTests.md:109–115` identify why the prior proposed test admission was held back: its gate quotes came from `form_mcp_schema.cc`, not the test body. Those prior implementation quotes were not independently reopened here and are not used as evidence for test semantics.

A corrected test URL, scope, anchor, and directly supporting test quote would require a new source row rather than rewriting S094's source/teaches cells: the source contract permits only status/recheck/used-by changes in place (`CORPUS.md:116–118`). Preserve S094's negative provenance; do not flip it merely because a differently named test exists. Even an admitted test-source assertion would remain source-level evidence, not proof of an executed runtime result.

## Remaining unknowns and operations

The alternative test body's current decoded hash, directly located quote, and semantic assertions were deliberately not evaluated. No other queued source was mined. No browser, runtime/mutation probe, build, lint, or test suite was run. No tools were installed or updated. No production file or SOURCES cell was changed.

## Isolation

- Mode: advisory, report-only source audit; no runtime/mutation probe, so no sandbox clone was needed.
- Clone path / branch: none.
- Examined base/checkpoint: R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no production branch from B was created.
- Clone commit: none; no git write command was run.
- Direct lane writes, all seat-owned: `.ufo/waves/round-19/w2/SourceS094.md`, `.ufo/waves/round-19/w2/SourceS094.body.gz`, `.ufo/waves/round-19/w2/SourceS094.parent.body.gz`, `.ufo/waves/round-19/w2/SourceS094.tag.body.gz`.
