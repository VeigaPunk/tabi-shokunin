# DraftReadme — scoped report v2 (round 16, seat TabiR16.DraftReadme-5)

Artifact: `.ufo/waves/round-16/drafts/DraftReadme.md` (draft v2; `corpus/README.md` and `corpus/knowledge/*` NOT edited — L1-owned).

## Behavior
Draft v2 restates native WebMCP as four graded rows, following the ConnFrontierRows proposal (`.ufo/waves/round-16/w1/ConnFrontierRows.md` §2, §2b, §4, §5):
- **W1** code presence — held (static, code-level only; 152 cache package and 154 binary).
- **W1b** CDP domain advertised at 154 with no flags — held (`protocol-domain.json`).
- **W2** runtime exposure, flags + loopback — conditional on `receipt.json` with `summary.failed == 0`; otherwise open.
- **W3** default profile — open (flags file has 0 WebMCP lines).
Plus conditional S020 spec row, open conformance / real-site / agent-consumption rows, and the knowledge-map row gated on the note existing.
Census U3 is handled as an append-only §6 erratum with pre-append sha `a33c2264…`, narrowing U3 into four successors (`U3-152-runtime`, `U3-154-cdp-domain`, `U3-154-runtime`, `U3-default-profile`). U3 and census §3.4 are not rewritten.

## Falsifiers re-checked this session (read-only; no pacman transaction, no browser, no gate)
| Claim | Command | Result |
|---|---|---|
| 152 cache package hash | `sha256sum /var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` | `2598ad3e2ce31bdbc116e6cfb1f605802445df4560a1c9b2ffd139537965b363` — matches |
| 152 string set | `bsdtar -xOf <pkg> usr/lib/chromium/chromium \| grep -a -o 'kWebMCP…\|kDeclarativeWebmcp\|kDevToolsWebMCPSupport\|ModelContextRegisterToolOptions' \| sort \| uniq -c` | 6 constants ×1, `ModelContextRegisterToolOptions` ×3 — matches |
| 154 string set | same grep on `/usr/lib/chromium/chromium` | identical counts — matches |
| `WebMCP.toolsAdded` in 154 | `grep -a -c 'WebMCP.toolsAdded' /usr/lib/chromium/chromium` | `1` — matches |
| protocol-domain.json hash | `sha256sum …/webmcp/protocol-domain.json` | `f7cb1e8c13e2ff543abe33cf4b16b87946b1db21c6f2c58c2d970c1a57848e55` — matches |
| protocol comparison | `node -e` read of `comparison` | `protocolSha256Equal`, `domainListsEqual`, `webmcpDomainPresentNoFlags`, `webmcpDomainPresentWithFlags`, `webmcpDomainIdentical` all `true` — matches |
| flags file WebMCP entries | `grep -ci webmcp ~/.config/chromium-flags.conf` | `0` — matches; file is 5 lines |
| census pre-append sha | `sha256sum corpus/knowledge/browser-surface-census.md` | `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b` — matches |
| README pre-append sha | `sha256sum corpus/README.md` | `590284b9afb33bee6f035b803e80940d4cc913f199ce1e9150ec1d326ff011e7` — matches |

Not re-checked by this seat: `experimental: true` and `deps Runtime+Page+DOM` in the WebMCP domain object (taken from the ConnFrontierRows report §2b and the protocol file; the file's `domains`/`commands` entries were seen only partially, e.g. `invokeTool` at line 215 and `toolsAdded` at line 256). `runtime-pin.json` hash (`fd1d34e8…`) taken from the sibling report, not re-hashed.

## Gate status
- `receipt.json` — absent. W2 stays open; §D fallback applies.
- `knowledge/webmcp-chromium-loopback-round-16.md` — absent. §A row gated.
- `corpus/evidence/round-16/webmcp/` — `protocol-domain.json`, `runtime-pin.json`, `fixtures/` present.

## Corrections made in v2
1. Replaced the single "held" native-WebMCP row with W1/W1b/W2/W3 so that the static presence and CDP advertisement are not counted as a runtime capability.
2. Census U3 erratum is now paste text for L1 with the pre-append sha, instead of an in-place edit.
3. The draft states the W1 cache-package dependency (`paccache` risk) and pins its sha256.

## Out of scope / not done
- No edits to `corpus/README.md`, `corpus/knowledge/*`, `corpus/SOURCES.md`, probes, harness, or evidence.
- No commits, no gates, no selftests, no browsers, no MCP/REA devices, no subagents.
- No tools installed or upgraded.

## Findings for L1
- Apply §B as an appended block only; keep `:35`, `:181`, `:194` unedited.
- Apply §C only after checking the census pre-append sha `a33c2264…`.
- The W2 row moves only on the receipt; the counter does not count W1/W1b (static facts).
- Checks to run after integration (not run by this seat): `sha256sum` the census and README against the pre-append shas; `grep -c 'Native WebMCP in chromium 152 — unprobed' corpus/README.md` ≥1; `node -e` on `receipt.json` `summary` only once it exists.
