# ScoutSibling — sibling overlap scan (tabi round 43, seat ScoutSibling)

Read-only scan of the newest LOG.md entries and latest-round files of `kama-shokunin/`, `souji-shokunin/`, `kasegi-shokunin/` for browser/web-interaction material inside tabi's PROVINCE (browser & web-interaction craft: real browsers vs real sites, kimi-webbridge, CDP session discipline, browser/profile surfaces, dynamic-page evidence patterns). Nothing absorbed; no writes to any sibling repo, the fleet root, or the production tree.

## Scope checked (latest round files only)

| Lane | Latest round | Files swept |
|---|---|---|
| kama-shokunin | Round 64 (2026-10-28) | `LOG.md` round-64 entry (~lines 2407–2511); `.ufo/waves/round-64/` recursive (waves `b/`, `f/`, `controls/`, `measured/`, `source/`) |
| souji-shokunin | Round 42 (2026-10-28) | `LOG.md` round-42 entry; `.ufo/waves/round-42/` (`w1/`, `w2/`, `w3/`); `census/round-42/` (`records/`, `waves/`, `sources/`) |
| kasegi-shokunin | Round 46 (2026-10-28) | `LOG.md` round-46 entry; `.ufo/waves/round-46/` (`wave1/`, `wave2/`, `attempt2/`, `controls/`, `source-recon/`) |

Method (exact): `grep` tool, case-insensitive, gitignore respected, over the scoped paths above, pattern
`browser|firefox|chromium|chrome|playwright|puppeteer|selenium|webbridge|CDP|devtools|headless|websocket`
plus targeted reads of every matched file region. A first broad grep truncated its display, so confirmation re-greps were run scoped to kama `round-64/{f,controls,measured,source}`, souji `round-42/w1`, souji `round-42/w3`, and kasegi `round-46/attempt2` — all returned no further matches except one incidental line (§D). No shell commands were needed; no scratch artifacts were produced (scratch root `/fast/scratch/hyaku/tabi-r43/ScoutSibling/` was created per protocol and removed before yield). No tools installed; pacman untouched.

## A. True province overlap — browser/CDP/webbridge material

**A1. kama r64 wave-b seat `CN02SiblingOverlap.md` formally inventories tabi browser knowledge and routes citation duties back to tabi.**
Path: `/home/vgpnk/Projects/shokunin/kama-shokunin/.ufo/waves/round-64/b/CN02SiblingOverlap.md`
- Line 32 (row D1): tabi `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` + `scripts/playwright-firefox-egress-round39.mjs` — "Tabi measures browser egress over loopback, kama measures serving identity … Cite; do not merge."
- Line 33 (row D2): tabi `corpus/knowledge/webmcp-chromium-loopback-round-16.md:35` and `webmcp-invocation-round-17.md` — chromium launcher (`/usr/bin/chromium`) vs engine image; "Cite the launcher case as a fixture idea (wrapper script as `exe`)."
- Line 44 (row R2): tabi `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:16` + `corpus/evidence/round-39/measure/proc-endian-raw-row.txt` — the first `/proc/net/tcp` parser read a `7F` prefix on displayed hex (12 false non-loopback rows; raw row `0100007F:8AEF` shows little-endian) — routed to tabi as a reusable bug-class control.
- Line 45 (row R3): tabi `environment-injection-measurement-integrity-round-41.md:25-30,52,68` — `/proc/<pid>/environ` is exec-time only; kama told to keep the caveat in receipt text (adjacent measurement discipline).
- Supporting evidence files (same seat dir): `b/out/CN02SiblingOverlap/grep-receipt.txt` (lines 59–61, 136–139, 240–254 cite tabi `webbridge-plugin-anatomy.md`, `browser-surface-census.md`, `cdp-evidence-patterns.md`, `webbridge-daemon-disposition.md`) and `b/out/CN02SiblingOverlap/hits.tsv` rows 2–4 (explicit per-row actions: "cite; reuse its raw fixture `0100007F:8AEF` as a parser regression"; "a wrapper-script exe must fail kama's exe pin").
- Actionable for tabi: kama's r64 left two citation/regression duties on tabi's files (endian fixture; launcher-vs-engine precedent) and classified the primitive overlap as cite-don't-merge. Nothing was merged into tabi; nothing absorbed here.

**A2. kasegi r46 wave1 seat `R46ScoutCensus3.md` shows browser/CDP submission material living in kasegi's own corpus.**
Path: `/home/vgpnk/Projects/shokunin/kasegi-shokunin/.ufo/waves/round-46/wave1/R46ScoutCensus3.md`
- Line 112: kasegi `SKILL.md:266-267` — "Sibling L1s: `fleets/claimer-mission.md` (CDP browser submissions, operator-authed)" — corroborated by `corpus/knowledge/ufo-workspaces.md` ("veigapunk, CDP 9222, `submission_verified: true`, 0 mutations").
- Line 95 (census summary): "claimer-mission contract (CDP 9222, FULL strength, STOP verbatim) + submitted outcomes".
- Flag only: CDP session discipline is a tabi-owned surface per PROVINCE; the claimer material is a separate operator-gated claiming mission that happens to drive a browser. Reported, not absorbed; routing decision belongs to the L1s.

## B. Adjacent web material — HTTP page captures, no browser driving

- souji r42: `census/round-42/sources/python-3-library-site.html` (docs.python.org page capture; footer "Last updated on Oct 28, 2026", python.org links) with `sources/SHA256SUMS`; the round-42 LOG entry lands it as "S259 Python `site`, tier A" (`corpus/SOURCES.md` 182→183). Live web-source capture as corpus provenance — near tabi's dynamic-page evidence patterns but a plain HTTP capture.
- kasegi r46: S073 GitHub Docs "private vulnerability reporting" capture quoted throughout wave1/wave2 selftests. `wave1/R46ScoutLive.md:117-118` — live `curl` re-check served through Varnish cache; explicit limitation "not for the browser-rendered DOM; dynamic content injected after load would not appear in either". `wave1/R46ScoutOverlap.md:111` and `wave2/R46W2RevEntryRule.md:91` — "page chrome" (site navigation) vs body-claims citation precedent (FC-4): "F28 must not cite chrome as page content."
- kama r64: `b/out/SC05Quarantine/s200-arxiv.html` — an arxiv.org page capture held under quarantine (grep hit was its static asset path `…/design-system/latest/chrome/banner.js`, not browser activity).

## C. Latest LOG.md entries themselves: no overlap

Pattern matches inside the three LOG.md files fall only in old entries, outside the latest-round scope: kama lines 96–97 (round-1 census: `127.0.0.1:9222` DevTools with logged-in targets), 337–338, 549–550 (headless round-11); souji lines 386–388 (chromium cache cleanup), 427–428 (`~/.cache/ms-playwright`); kasegi lines 66–68, 398–400 (old mission-control entries). The kama round-64, souji round-42, and kasegi round-46 LOG entries contain zero browser/web-interaction matches.

## D. Incidental mentions, not overlap (recorded for completeness)

- souji r42 `w3/R42w3reviewer01.md:46` — "other tenants' … gifski/blender/playwright churn" cited only as host-load noise that delayed a gated run.
- souji r42 `w2/R42w2scout01/receipts/log-all.txt:300` (and its `census/round-42/waves/` copy) — historical git-log receipt line "replay headless sources" (a round-21 commit title).
- kama r64 `b/MT01DumpableHide.md:112`, `b/MT02ReusePort.md:174`, `b/MT07RefAgree.md:150` — "1Password(-BrowserSupport)"/"1Password's browser helper" as same-uid host process noise in procfs experiments.
- kama r64 `b/MT12ProxyLeak.md:64` — `LLAMA_ARG_CORS_ORIGINS=*` "widens the browser-reachable surface" (attack-surface framing only).

## Limitations

- Scan is grep-plus-targeted-read over the named latest-round files; it is not a full-text read of every wave file. Truncation-compensation re-greps covered the dirs the first pass may have under-shown (all clean, except §D).
- LOG.md is append-style; the "newest entries" boundary was taken as each lane's latest round entry (kama 64, souji 42, kasegi 46), verified by line ranges. Older LOG content was not in scope and is only noted where the grep surfaced it (§C).
- souji's `w3` wave was still being written during this scan (dispatched minutes earlier); its swept bytes are those observed at scan time.
- No `lsp` semantic resolution was used — this is a text-overlap scan of markdown/JSON evidence, so grep is the appropriate instrument here, not a fallback.

VERDICT finding — kama r64 routes citation/regression duties onto tabi's playwright/chromium knowledge files (endian fixture `0100007F:8AEF`, launcher-vs-engine precedent) and kasegi r46 holds CDP-browser claimer material; both reported with paths above, nothing absorbed.
