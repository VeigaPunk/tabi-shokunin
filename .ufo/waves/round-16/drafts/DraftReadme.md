# DraftReadme — corpus/README.md round-16 append (draft v2, L1 integrates)

Status: DRAFT. Not applied. `corpus/README.md` and `corpus/knowledge/*` are L1-owned (PLAN.md:112).
Append-only: nothing in `corpus/README.md` is edited in place. Historical lines `:35`, `:181`, `:194`,
`:216`, `:284-285` stay byte-intact; this block restates status below them (convention `:173-176`).

## Gates (re-checked this session, read-only)

| Gate | State at drafting | Governs |
|---|---|---|
| `corpus/knowledge/webmcp-chromium-loopback-round-16.md` exists (CORPUS.md:45-47) | **absent** | §A knowledge-map row; W2 pointer |
| `corpus/evidence/round-16/webmcp/receipt.json` with `summary.failed == 0 && summary.passed == summary.cases` | **absent** (`scripts/webmcp-loopback-round16.mjs` exists, 878 lines, sha256 `cfece24c…`, not yet run as far as this seat can see) | W2 `held` wording only |
| `corpus/evidence/round-16/webmcp/protocol-domain.json` | **present**, sha256 `f7cb1e8c13e2ff543abe33cf4b16b87946b1db21c6f2c58c2d970c1a57848e55` | W1b |
| `corpus/evidence/round-16/webmcp/runtime-pin.json` | present, sha256 `fd1d34e8f49714d01c6dd6b032d00f3c6458ac5f53caff5559d9a14d8db3b9b8` (re-hashed this session) | W2 precondition only — not a held frontier row |
| `/var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` | **present**, sha256 `2598ad3e2ce31bdbc116e6cfb1f605802445df4560a1c9b2ffd139537965b363` | W1 |
| `~/.config/chromium-flags.conf` WebMCP lines | **0** (`grep -ci webmcp` → `0`; file is 5 lines) | W3 |

If the receipt gate fails, W2 uses §D. W1, W1b, W3 do not depend on the harness.

## Anchors (verified by opening the file this session)

- `corpus/README.md:35` — round-3 "Native WebMCP in chromium 152 — unprobed (census U3)". Unedited.
- `corpus/README.md:181` — kaika row; clause (a) "still unprobed", clause (b) "only surface … not `navigator.modelContext`", clause (c) "no flag carries it". Unedited. Clause (c) is falsified at code level by W1 below; a dated restatement here does not rewrite `:181`.
- `corpus/README.md:194` — "WebMCP spec | open — S020 opened and queued". Unedited.
- `corpus/knowledge/browser-surface-census.md` — sha256 `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b` (pre-append; the §6 erratum in §C records it). `:145-153` (§3.4), `:188` (U3). Unedited.
- `corpus/README.md` sha256 `590284b9afb33bee6f035b803e80940d4cc913f199ce1e9150ec1d326ff011e7` (pre-append).
- `corpus/SOURCES.md:16` — S002 CDP viewer, `mined`. `:34` — S020 WebMCP CG draft, `queued`. `:35` — S021, `queued`, not used.
- `.ufo/waves/round-16/PLAN.md:84` — harness abort rule (planned contract until receipt exists).

## A. Knowledge-map row (gated on the note existing)

## Round 16 — native WebMCP status restatement (2026-10-20)

| Note | Holds | Sources |
|---|---|---|
| `knowledge/webmcp-chromium-loopback-round-16.md` | Loopback-only runtime observation of native WebMCP on Chromium 154.0.8037.97 under explicit feature flags: declarative `<form toolname=…>` → `WebMCP.toolsAdded` with exact name, description, input schema; imperative `document.modelContext` registration; flag-off control; `navigator.modelContext` absent. Decision table keyed to which evidence supports which assertion. No real site, no agent consumption, no spec-conformance verdict. | S020 (only if it backs the note), S002 (used-by add); `corpus/evidence/round-16/webmcp/receipt.json`, `protocol-domain.json`, `runtime-pin.json`; harness `scripts/webmcp-loopback-round16.mjs`. |

## B. Frontier restatement — native WebMCP graded rows (append after the Round 15 block)

The historical rows `:35`, `:181`, `:194` stay. These rows restate their status by layer; they do not
close the census item U3 (see §C).

| Frontier item | Status | Pointer |
|---|---|---|
| **W1 — WebMCP code presence (Chromium 152 and 154 packages)** | **held** (static, code-level only). Every WebMCP feature constant (`kWebMCP`, `kWebMCPTesting`, `kDeclarativeWebmcp`, `kDevToolsWebMCPSupport`, `kWebMCPDeclarativeFileInput`, `kWebMCPFormAssociatedCustomElements`, `ModelContextRegisterToolOptions` ×3) and the embedded `WebMCP.toolsAdded` method name appear in both binaries. This corrects clause (c) of `:181` ("no flag carries it") at code level. Compiled-in strings do not show runtime registration; no claim is made that 152 exposes the API at runtime. | `/var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` sha256 `2598ad3e…` (`usr/lib/chromium/chromium`); `/usr/lib/chromium/chromium` sha256 `95b17db7…` (154.0.8037.97-1). Re-run: `bsdtar -xOf <pkg> usr/lib/chromium/chromium \| grep -a -o 'kWebMCP[A-Za-z]*\|kDeclarativeWebmcp\|kDevToolsWebMCPSupport\|ModelContextRegisterToolOptions' \| sort \| uniq -c`. |
| **W1b — WebMCP CDP domain advertised at Chromium 154, no flags** | **held** — `/json/protocol` advertises an `experimental` `WebMCP` domain byte-identically with and without the feature flags (`protocolSha256Equal`, `domainListsEqual`, `webmcpDomainIdentical` all `true`). Commands `enable, disable, invokeTool, cancelInvocation`; events `toolsAdded, toolsRemoved, toolInvoked, toolResponded`. This is domain advertisement, not tool registration; the page API remains flag-gated. Scoped to the exact 154 build; CDP has no third-party compatibility promise (`corpus/SOURCES.md:16`, S002). | `corpus/evidence/round-16/webmcp/protocol-domain.json` sha256 `f7cb1e8c13e2ff543abe33cf4b16b87946b1db21c6f2c58c2d970c1a57848e55`; comparison object in that file. |
| **W2 — WebMCP runtime exposure (Chromium 154.0.8037.97, explicit launch flags, loopback fixture, temp profile)** | **held only after the receipt lands with `summary.failed == 0`** — `document.modelContext` present; declarative and imperative tool registration observed through `WebMCP.toolsAdded` / `toolsRemoved`; flag-off control; `navigator.modelContext` absent. Scoped to the pinned runtime and `127.0.0.1` fixtures. Status until the receipt exists: **open**. | `knowledge/webmcp-chromium-loopback-round-16.md` (gated, §A); `corpus/evidence/round-16/webmcp/receipt.json`; `corpus/evidence/round-16/webmcp/runtime-pin.json`. |
| **W3 — WebMCP in the default profile (no launch flags, operator browser)** | **open** — `~/.config/chromium-flags.conf` carries no WebMCP entry (`grep -ci webmcp` → `0`); default-profile page exposure was not measured. The round-16 no-flag control is a fresh temp profile, not the operator profile, and must not be read as W3. | `~/.config/chromium-flags.conf` (5 lines); census U3 successor `U3-default-profile` (§C). |
| WebMCP spec | **conditional** — S020 is `queued` (`corpus/SOURCES.md:34`). The row may read `mined` only after a seat re-opens it this round with URL, access date 2026-10-20 and a located quote. The note cites S020 for draft API shape only. | `corpus/SOURCES.md:34`. |
| WebMCP spec conformance | **open** — observed behavior is recorded beside the spec text without a verdict; the spec is a Community Group draft (CG-DRAFT 2026-10-16), not a W3C Standard; flags are required for the page API. | `corpus/SOURCES.md:34`. |
| Real-site WebMCP | **open** — no external site is in the round-16 evidence. The harness contract (`PLAN.md:84`) aborts non-loopback requests; that rule is planned until the receipt exists. | `scripts/webmcp-loopback-round16.mjs`; note limits. |
| Agent-side consumption of WebMCP tools | **open** — the probes observe announcement (`toolsAdded`) and schema. No agent consumed or invoked a tool; no agent integration is claimed. | note limits; `corpus/SOURCES.md:35` (S021, queued, unused). |

Unchanged round-16 frontier ground (historical rows stay authoritative): extension↔daemon link (`:180`),
rate/ToS surface for site-interaction records (`:182`), real-site journeys (`:183`), evidence-byte
archival (`:184`).

## C. Census U3 — append-only §6 erratum (paste text for L1; `knowledge/browser-surface-census.md` is L1-owned)

Pre-append sha256: `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b`.
Leave `:147-153` and `:188` byte-intact. Do not renumber U3.

> **Erratum (round 16, 2026-10-20) — U3 narrowed, not closed.** Pre-append sha256 `a33c2264…`.
> (i) The host's chromium is now 154.0.8037.97-1; 152.0.7977.82-1 survives only as the cached package
> `/var/cache/pacman/pkg/chromium-152.0.7977.82-1-x86_64.pkg.tar.zst` (sha256 `2598ad3e…`). The census
> measurement of §3.4 was of that package and stands as written.
> (ii) The interface named in U3 (`navigator.modelContext`) is absent on the probed 154 build; the probed
> object is `document.modelContext`. This is a spec-versus-build divergence, recorded as such.
> (iii) U3 splits into four successors: `U3-152-runtime` (open — runtime of the cached 152 binary unrun);
> `U3-154-cdp-domain` (held — `WebMCP` domain advertised without flags, see `corpus/evidence/round-16/webmcp/protocol-domain.json`);
> `U3-154-runtime` (held only after the round-16 receipt, probed mode only); `U3-default-profile` (open).
> (iv) "No flag configured" in §3.4 is true for `~/.config/chromium-flags.conf`; it never meant that no flag exists.
> The code-presence claim is W1 in the round-16 README block, not a census measurement.

## D. Fallback if the receipt gate fails

W2 row reads: "open — round-16 runtime probe attempted; no held receipt at integration
(`corpus/evidence/round-16/webmcp/receipt.json` absent or failing). No runtime capability is claimed."
The §A knowledge-map row is not written and the note is not indexed. W1, W1b, W3 are unchanged.

## E. Integration notes for L1

- Apply §B as an appended block; do not edit `:35`, `:181`, `:194`, `:216`, `:284-285`.
- Apply §C only as an append to the census §6; check the pre-append sha first.
- W1 is a static fact and is excluded from the C2 counter (`PLAN.md:29`); the counter's unit is a held
  note/runtime entry (W2). The row joins the counter only through the note's limits sentence.
- The W1 pacman-cache anchor disappears under `paccache` pruning. Either re-confirm the package at commit
  time or record its sha256 (already in §B) so the row stays checkable against a later archive.
- Commit nothing from this draft; scribes do not commit.
