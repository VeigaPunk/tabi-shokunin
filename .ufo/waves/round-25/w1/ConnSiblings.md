# ConnSiblings — round 25 wave 1: sibling-overlap scan (report, never absorb)

Seat: `L1Tabi25.ConnSiblings` (connector, read-only). Date 2026-10-25.
Tabi HEAD read: `c8ef3084c6363f265b9d23285296ab3547654f57` (`git -C tabi-shokunin rev-parse HEAD`;
one commit past baseline `9e136667`: "round-25: freeze claims, controls, census-before, wave-1 spec").
Fleet HEAD: `a409e65dfaef0b4441c0643b0f57f5a7432a4c47`. No tools were installed. No processes were launched.
The only file written is this report.

## Axes

- **Depth (C1).** A real bfcache restore observed on loopback, and a counter that cannot be gamed.
- **Freshness (C2).** Six on-release rows re-opened with today's bytes.
- **Adjacency.** Report sibling overlap rather than absorbing it.
- **Calibration.** Keep the claim text consistent with the protocol bytes it cites.

## Sibling HEADs swept

Each sibling was swept at its committed `HEAD` with read-only `git grep`.

| lane | HEAD |
|---|---|
| audio | 7a2fcd4f0883 |
| chousa | 02d95d32af99 |
| game-dev-2d | 7753d49b1667 |
| game-dev-3d | 89dd182b7094 |
| kagi | 69b61db46be4 |
| kaidoku | aa04633a686d |
| kake | 8aa066ecc6e6 |
| kama | 873c5d7774b9 |
| kasegi | b76676eedca7 |
| kengaku | f20a1097af90 |
| kotoba | 2b79115cccdb |
| kotodama | b60c7b140c53 |
| kumitate | 0cbe0d75e5a0 |
| lore | 380ef3abc7c7 |
| mado | 80b83c856b8c |
| mori | 9834fed4dd8a |
| revenger | 3f5edbc20635 |
| souji | a6d2d157755e |
| tameshi | 506e99c7b73c |
| tsukuroi | 564db0b614b2 |

- **Lanes named in the item but absent as directories:** `protocol`, `aggregator`, `user`.
  - Command: `ls -d *aggregat* *user* *protocol*` gave "No such file or directory" for all three.
  - Protocol and aggregator live as fleet-root files (`PROTOCOL.md`) and fleet `.ufo/reports/round-*/aggregator.md`. Those were covered by the fleet-root `rg` sweep below.
  - `user` has no directory under `/home/vgpnk/Projects/shokunin`, so it was not swept.

Per-lane counts (files at HEAD) came from one loop:
`for d in *-shokunin; do git -C $d grep -il -E '<pattern>' HEAD | wc -l; done`

| pattern class | regex | non-zero lanes (files) |
|---|---|---|
| A: bfcache / history step | `bfcache\|back-forward cache\|back_forward_cache\|BackForwardCache\|disable-back-forward\|Page\.goBack\|navigateToHistoryEntry\|history step` | game-dev-3d 2, kagi 1, kake 4, kotoba 1; all others 0 |
| B: DevTools-for-agents / WebMCP | `chrome-devtools-mcp\|devtools-mcp\|webmcp\|devtools for agents\|devtools-agent` | kagi 14, kaidoku 59, kake 8, kama 1, kasegi 28, kotoba 5, kotodama 2, kumitate 10, mado 5, mori 12; all others 0 |
| C: re-verification (broad) | `on-release\|source-reopen\|reopened\.json\|superseding row\|re-?verif… (source\|row)` | all 20 lanes non-zero (9 to 865). Too broad to use alone, so it was refined below. |

## (a) Held bfcache / history-step / back-forward restore evidence

**Observation.** No sibling holds a runtime bfcache restore observation, receipt or probe. All 8 class-A hits are listed below (`git -C <lane> grep -n -i -E '<A regex>' HEAD`).

| lane | path:line | interface | what it is | disposition |
|---|---|---|---|---|
| game-dev-3d | `reports/round-107/r107-rev-unlock.md:148,189`, `reports/round-107/r107-unlock.md:112` | Docker image config `.history[]` | "history step" means an OCI layer history entry | false positive, no overlap |
| kagi | `.ufo/waves/round-27/build/ConnTsukuroi.md:173` | registry history | "the history step (22 `KN-*` rows…)" | false positive |
| kake | `.ufo/waves/round-39/sources/yandex-sitemap.html:382` (and 3 copies at round-40 and round-48 assimilation) | fetched third-party HTML | Yandex RUM script bytes that happen to contain the token | false positive |
| **kotoba** | `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt` lines 4614, 555866, 581356, 975750, 1278112, 1281531, 1482478 (commit `7d8bf2f6`, "round 44: record+map composition door CLOSED") | `strings` dump of the omp 18.12.2 binary | Bundled browser-driver code. Line 975750: `if (e.type === "BackForwardCacheRestore") this.#i();`. Lines 1278112–1278113: `if (e === "BackForwardCacheRestore") { return this.#k(); }`. Lines 1281525–1281536: `const i = r.entries[r.currentIndex + e]; … this.#i.send("Page.navigateToHistoryEntry", { entryId: i.id })`. Lines 1482470–1482482: `sendCommand("Page.getNavigationHistory")` then `sendCommand("Page.navigateToHistoryEntry", { entryId: r.id })` | **adjacency: report, do not absorb** (see below) |

- **Why kotoba is adjacency, not absorption.**
  - It is static code-shape evidence that a shipped driver implements "go back" as `Page.getNavigationHistory` followed by `Page.navigateToHistoryEntry(currentIndex-1)`, and branches on the `BackForwardCacheRestore` navigation type.
  - It is not a runtime observation and carries no restore count.
  - It is also shipped-artifact analysis, which is kaidoku/revenger territory and already a refused route in `adjacency.tsv` row 2.
  - Tabi MAY cite it as corroborating interface evidence in the round-25 entry. It MUST NOT be counted toward C1.
  - Status: `[INFERENCE]` that the code is Puppeteer. The file does not name its origin. The shapes match Puppeteer's `Page.goBack` and `LifecycleWatcher`, but I did not open a Puppeteer source to confirm.
- **Fleet root.** `rg -il … -g '!tabi-shokunin/**'` found only `.ufo/reports/round-24/tabi.md` and `MANIFEST.json:21639`. Both mirror tabi's own round-24 S104/S105 work, so there is no third-party overlap.
- **Negative sweep for working trees.** `rg -il --no-ignore --hidden 'bfcache|…|navigateToHistoryEntry'` over every non-tabi `*-shokunin` tree added only `kotodama-shokunin/reports/supplement-opencode-1/scratch/round5-08/wb-sd-buti.html`, which is third-party HTML bytes and not evidence.

## (b) DevTools-for-agents / chrome-devtools-mcp surface rows

- **chrome-devtools-mcp: zero.** No sibling file mentions it at HEAD.
  - Command: `for d in *-shokunin; do git -C $d grep -I -l -i -E 'chrome-devtools-mcp|devtools-mcp' HEAD | wc -l; done` printed nothing for every non-tabi lane.
  - No sibling `corpus/SOURCES.md` holds `github.com/ChromeDevTools/chrome-devtools-mcp`, `developer.chrome.com/docs/devtools/agents`, or `chromedevtools.github.io/devtools-protocol`. This came from a `grep -F` loop over `git show HEAD:corpus/SOURCES.md` per lane, with zero matches.
- **WebMCP hits:**

| lane | path:line | interface | disposition |
|---|---|---|---|
| **kaidoku** | `corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:164,180` ("`discover-webmcp-tools` → `ev_82dbdf0e…`: `tools:{total:0,items:[]}`"); `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:185`; `corpus/knowledge/2026-10-13-r2-skill-references-deep.md:72,76`; `corpus/README.md:55,150`; `LOG.md:316` | REA verb `discover_webmcp_tools` / `discover-webmcp-tools` on a self-launched loopback CDP target | **adjacency, already declared.** Tabi's own `corpus/knowledge/webmcp-chromium-loopback-round-16.md:136-138` says: "The REA `discover_webmcp_tools` verb and MCP server registration are kaidoku's; the agent-side MCP plane is kumitate's; authoring WebMCP tools for the operator's own published properties is kake's". No tsv row names this surface yet. |
| kake | `.ufo/waves/round-30/w1/ReviewRenderPrimary.md:87-89` ("`id="webmcp"` (1 014 B): an agent-tools manifest — notably `render.docs.get-markdown`…") | live third-party page declares a WebMCP manifest, seen by kake's publishing review | adjacency only (kake publishing). Wave artifact, not corpus. Do not absorb. |
| kasegi | `corpus/source-snapshots/round-24/S011.txt:802` (`WebMCP`) | navigation text inside fetched Cloudflare blog bytes (S011 = "Project Glasswing") | false positive |
| mori | `corpus/evidence/recheck-r32/S043.src:451` | Mintlify manifest inside Z.AI docs bytes | false positive |
| kotoba / kotodama / kumitate / mado / mori / kake (other wave files) | e.g. kotoba `.ufo/waves/round-52/falsify-a2/ConnSiblingOverlap.md` rows 10–11; kotoba `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt` lines 505816–505819 (`WEBMCP_BRIDGE_KEY`, `WebMcpController`, `installWebMcp`, `installWebMcpPageHook` — the shipped driver embeds WebMCP controller code); kumitate `.ufo/waves/round-43/build/ConnSiblingOverlap.md` ("Browser/WebMCP lifecycles remain tabi-owned."); mado/mori seat-name strings `TabiR17.ConnSiblingWebmcp-2` | siblings citing tabi's corpus, static driver strings, or run telemetry | reverse references to tabi. No sibling claim. |
| kagi (14), kama (1) | all under `.ufo/waves/round-26..27/sandboxes|build/*.html|.body` | fetched HTML bytes | false positive |

- **Assimilation side note (not my item, but it is a collision check).** I pulled the URLs of the shokuknow theme `webmcp-devtools-agent-surface-r25` from `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md`. The command was `grep -B2 -A12 … | grep -o https…`; the window may sweep in adjacent rows, such as the novada 429 URL.
  - URLs: developer.chrome.com webmcp-debugging, devtools-frontend `WebMCPModel.ts`, chromium `form_mcp_schema.cc` and `html_form_element.cc`, openreplay, juejin, zenn, novada.
  - Every one matched **no** sibling `corpus/SOURCES.md` at HEAD (loop output `-> none` ×16).
  - So there is no fleet-level URL collision. Tabi-internal id collision and quarantine remain the assimilation seat's call.

## (c) On-release source re-verification practice overlapping C2

**Observation.** Several siblings own source re-check *tooling*. None holds any of tabi's six target URLs.

- URL cross-match: `git show HEAD:corpus/SOURCES.md | grep -F <url>` over all 20 siblings, for each of `playwright.dev/docs/{test-retries,actionability,test-assertions,locators,aria-snapshots}` (S013, S015, S016, S023, S024), `webmachinelearning.github.io/webmcp` (S020), `web.dev/articles/bfcache` (S104) and `devtools_protocol/domains/Page.pdl` (S105). The result was 0 matches for every URL.
- Topical rows: `grep -c -i 'playwright\.dev|web\.dev/|chromium\.googlesource|webmachinelearning|chrome-devtools'` found 4 rows, all in kake (S036 and S037 web.dev Web Vitals, plus web.dev optimize-inp and the Chromium speed metrics changelog in non-row bullets). All other lanes had 0.
- So C2's re-opening is **not shared with any sibling**. The fleet `scripts/sources-census.sh shared` mode would report none of these URLs as shared `[INFERENCE from the grep; the shared mode itself was not run]`.

| lane | interface | what it does | overlap with C2 | disposition |
|---|---|---|---|---|
| **chousa** | `tools/quote-reopen.py verify --items <tsv> [--registry corpus/SOURCES.md]` (commit `49b2aa3`); SKILL.md:24,25,72,88 | Fetches each registry URL live once per run, extracts page text, and returns one verdict per item, `VERBATIM` / `ABSENT` / `TOO_LONG` / `NO_SOURCE` / `UNREACHABLE`, plus a `QUOTE_REOPEN_SUMMARY` line | **Same practice as C2's "locate the held quote in today's bytes".** | report adjacency (practice prior art); do not import the tool |
| kake | `scripts/source_recheck.py --manifest PATH` (offline, reads recorded bodies); `scripts/freshness-sweep.mjs` (PROVINCE.md:17, SKILL.md:184-185) | offline quote-still-present re-check over committed bodies, and a pinned freshness battery | method overlap (offline re-check of committed bytes) | report adjacency |
| kumitate | `node scripts/source-capture.mjs` (contract `kumitate-source-capture-v1`, SKILL.md:620,720) | gate binding every opened SOURCES row to committed capture bytes | overlaps C2's "fresh fetch digest this round" control | report adjacency |
| mori | `corpus/evidence/recheck-r32/` (`README.md`: "one fetched copy `<id>.src` for each of the 33 population rows… `sha256sum <id>.src` equals the row's sha256 cell") | committed re-fetch of mutable-URL rows | closest committed analogue of C2's receipt | report adjacency |
| kasegi | `corpus/instruments/{capture-source.py,recheck-audit.py,frontier-recheck-count.py,anchorcheck.py}`, `corpus/source-snapshots/round-23..25/` | per-round source snapshots and re-check counters | method overlap | report adjacency |
| tsukuroi | `tools/check-freshness-r17.py` (schema `tsukuroi-freshness-recheck-v1`) | stale current-use observations answered by appended dated notices | append-only supersession analogue | report adjacency |
| kama | `tools/echo-recheck.py` | re-runs a live loopback probe without overwriting receipts | different subject (llama-server); shape only | no overlap row needed |
| fleet | `scripts/sources-census.sh` (`overdue` mode: "symbolic cadences (e.g. on-release) are reported, never judged overdue") | fleet registry census | **second-order effect:** on-release rows never surface as overdue, so C2's re-open is the only mechanism that ages them | context only |

- On-release row prevalence per sibling registry (`grep -c 'on-release'` on `HEAD:corpus/SOURCES.md`): audio 10, chousa 39, game-dev-2d 28, game-dev-3d 23, kagi 38, kaidoku 78, kake 18, kama 171, kasegi 15, kengaku 22, kotoba 15, kotodama 14, kumitate 70, lore 11, mado 131, mori 181, revenger 33, souji 101, tameshi 22, tsukuroi 160. The practice gap is fleet-wide. That is a disclosure, not a claim.

## Current `corpus/adjacency.tsv` rows (at working tree = HEAD `c8ef3084`)

Header: `surface sibling sibling_ref sibling_quote tabi_ref tabi_quote disposition ruling_ref ruling_quote`

| # | surface | sibling | disposition |
|---|---|---|---|
| 1 | cdp-runtime-observation | kaidoku (`@9011581d:PROVINCE.md:53`) | ruled (tabi `@5859243:corpus/lessons/round-16-verifier-spotcheck.md:142`) |
| 2 | reverse-engineering-of-shipped-artifacts | kaidoku (`@9011581d:PROVINCE.md:3`) | refused-route |
| 3 | reverse-engineering-of-shipped-artifacts | revenger (`@cf024192:PROVINCE.md:3`) | refused-route |
| 4 | rea-browser-runtime-evidence | revenger (`@cf024192:PROVINCE.md:5`) | contested-open (fleet `@b6b3b5e4:.ufo/l0-questions.md:65`) |
| 5 | crawler-discipline-vs-publishing | kake (`@7c61c8cc:PROVINCE.md:30`) | split-declared |
| 6 | musketeer-cdp-9222-profile-lease | kake (`@7c61c8cc:PROVINCE.md:35`) | contested-open (fleet `@ebeb396f:.ufo/l0-questions.md:62`) |
| 7 | musketeer-cdp-9222-profile-lease | kagi (`@c2cab35b:PROVINCE.md:43`) | contested-open (same ruling ref) |
| 8 | secrets-vault-ops | kagi (`@c2cab35b:PROVINCE.md:3`) | refused-route |
| 9 | kimi-webbridge-plugin-internals | kumitate (`@1770305f:SCORECARD.md:1556`) | split-declared |
| 10 | cdp-live-target-census | kama (`@54a29268:corpus/knowledge/listener-census.md:355`) | contested-open (fleet `@b6b3b5e4:.ufo/l0-questions.md:65`) |

Command: `cat /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency.tsv`, giving 10 data rows.
**Gaps observed:** no row exists for the kaidoku `discover_webmcp_tools` surface, for chousa `quote-reopen`, or for the kotoba omp-strings history-step evidence. Each is new adjacency, not absorption.

## Connector move (one bounded proposal)

**Contradiction (stated, not smoothed).**
- `claims.json` C1 says "via CDP Page.goBack", and its killRule says "executed a history step (goBack)".
- The pinned protocol bytes the round itself opened have no such command:
  - `scratch/ScoutOpenS106/Page.pdl` (61911 B, sha256 `e944a3b1…05be`): `grep -c goBack` gives **0**.
  - The history primitives are `command getNavigationHistory` (line 850) and `command navigateToHistoryEntry` (line 913).
  - `BackForwardCacheRestore` is a `NavigationType` value (line 1345), and that type is carried on `event frameNavigated` (line 1348) as `experimental NavigationType type` (line 1352).
- This resolves the unknown U7 in `w1/ScribeEntryBfcache.md:152`.
- The kotoba evidence above shows that a shipped driver implements "goBack" the same way, which gives independent interface-level corroboration.

**Second-order effect (runtime → counter).**
- `scratch/ExecHarnessC1/probe.mjs:213-229` already sends the literal `Page.goBack`, records its error as `goBackAttempt`, steps with `Page.navigateToHistoryEntry`, and labels the step `action: 'goBack', cdpMethod: 'Page.navigateToHistoryEntry'`.
- `scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs:61-64` validates only the self-reported label `s?.action === "goBack"` plus target-stack consistency. It ignores `cdpMethod`.
- `[INFERENCE]` This is not exploitable for `restores`. A main-frame `type: BackForwardCacheRestore` event can only arise from a real history traversal, and the counter requires that event at the goBack target (lines 81-85).
- It does leave the receipt's step provenance self-attested.

**Proposed move.**
1. Do not alter the frozen claim. The L1 records the wording in the round-25 lesson as the mined mistake: "the frozen claim named a CDP method (`Page.goBack`) absent from the pinned PDL; the realized history step is `Page.navigateToHistoryEntry(currentIndex-1)`, PDL:913."
2. Cite `Page.pdl:850/913/1345-1352` (S106) for the operational meaning, and kotoba's omp-strings lines as corroborating adjacency.
3. In the C1 counter (before it is committed), additionally require `cdpMethod ∈ {"Page.navigateToHistoryEntry"}` on every `goBack` step, plus a `goBackAttempt` record. Add one selftest mutation: a `goBack` step with `cdpMethod: "Page.navigate"`, which must be invalid.
4. Add three adjacency rows (`report`, not absorb), each with its interface and quote above:
   - `webmcp-tool-discovery` → kaidoku
   - `quote-reopen-practice` → chousa
   - `shipped-driver-history-step-code` → kotoba, refused-route via row 2's reverse-engineering route

**Affected axes.**
- Calibration: claim text is reconciled with the PDL, with no rewrite of the frozen claim.
- Depth: the counter's step provenance becomes byte-backed.
- Adjacency: three reported overlaps, zero absorption.
- None is harmed `[INFERENCE]`: freshness and coverage are untouched, and the C1 target (`restores>=1, valid=true`) is unchanged because the harness already emits `cdpMethod`.

**Risks.**
- Requiring `cdpMethod` after a harness run was captured without it would turn an honest run invalid. Gate the change on the committed receipt schema actually carrying the field, which the probe does.
- The three tsv rows need `sibling_ref` at the sibling's pinned HEAD (above) and a quote ≤ one line.
- The kotoba file is a 1.4M-line strings dump, so cite line numbers, not the file.

**Verification (for the L1, after integration).**
- `grep -c goBack .ufo/waves/round-25/scratch/ScoutOpenS106/Page.pdl` should give 0, and `grep -n 'command navigateToHistoryEntry' …` should show line 913.
- `node scripts/check-bfcache-receipt.mjs --selftest` should include the new cdpMethod mutation case, exit 1.
- `git -C kotoba-shokunin show 2b79115c:.ufo/round-44/evidence/omp-live-18.12.2-strings.txt | sed -n '1281525,1281536p'` should show the navigateToHistoryEntry block.
- `git -C kaidoku-shokunin show aa04633a:corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md | sed -n 180p` should show the honest-zero `discover-webmcp-tools` result.
- `git -C chousa-shokunin show 02d95d32:SKILL.md | sed -n 24p` should show the `quote-reopen` row.
