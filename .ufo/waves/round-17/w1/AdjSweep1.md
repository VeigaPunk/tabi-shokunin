VERDICT: PASS

# AdjSweep1 — sibling sweep (audio, chousa, game-dev-2d, game-dev-3d, kama, kasegi, kengaku, kotoba)

Scope: the 8 named siblings under /home/vgpnk/Projects/shokunin, read-only. Rows written into
`.ufo/waves/round-17/adjacency/sweep1.tsv` (rows only, no header, 9 TAB columns).

## 1. Sweep command and hit counts (named surfaces)

```
PAT='browser|CDP|Playwright|Puppeteer|WebDriver|BiDi|WebMCP|screenshot|headless|chromium|web.interaction|tabi'
for s in audio chousa game-dev-2d game-dev-3d kama kasegi kengaku kotoba; do
  d="$s-shokunin"; for f in PROVINCE.md SKILL.md corpus/README.md; do
    [ -f "$d/$f" ] && grep -Eic "$PAT" "$d/$f"
  done; grep -Eic "$PAT" "$d"/corpus/adjacency* 2>/dev/null
done
```

Matched lines (case-insensitive) per file; `corpus/adjacency*` exists in **none** of the 8:

| sibling | PROVINCE | SKILL | corpus/README | adjacency* | total |
|---|---|---|---|---|---|
| audio | 3 | absent | 3 | 0 | 6 |
| chousa | 0 | 1 | 4 | 0 | 5 |
| game-dev-2d | 3 | absent | 21 | 0 | 24 |
| game-dev-3d | 8 | 7 | 9 | 0 | 24 |
| kama | 0 | 0 | 0 | 0 | **0** |
| kasegi | 0 | 1 | 0 | 0 | 1 |
| kengaku | 0 | 3 | 6 | 0 | 9 |
| kotoba | 0 | 1 | 1 | 0 | 2 |

Token attribution (`grep -Eino`): the named surfaces contain only `headless`, `screenshot`,
`browser`+`CDP` (kasegi:267, kengaku:39), `bidi` (kengaku README:19 = "bidirectional") and `tabi`
**substrings**. Word-boundary check `grep -rEic 'tabi-shokunin|\b[Tt]abi\b'` over the same files =
**0** for all 8; every `tabi` token is inside executability / suitability / stability /
repeatability / portability.

## 2. Corroborating wider scan (md/mjs/js/ts/py, `node_modules` and `.git` excluded)

`grep -rEino 'playwright|puppeteer|webdriver|webmcp|devtools.protocol|\bcdp\b|chromium|headless.chrome|screenshot'`
→ token counts: audio 0; chousa 6 cdp; game-dev-2d 4 screenshot; game-dev-3d 71 screenshot + 2 cdp;
kama 11 cdp + 2 devtools-protocol; kasegi 5 cdp; kengaku **0**; kotoba 16 cdp.
The named-surface sweep alone would have missed two of the three rows below (kama, game-dev-3d);
both are recorded as sweep findings, which C3's "others found by sweep" allows.

## 3. Rows written (3, verified verbatim at pinned commits)

1. `kimi-webbridge plugin substrate` — game-dev-3d-shokunin@`3118be0b`…`reports/round-101/r101-scout-roster.md:110`
   "The only province that owns a *plugin*" / tabi `PROVINCE.md` "the kimi-webbridge plugin" /
   **split-declared**. The sibling cedes the surface; its r107 report
   (`reports/round-107/r107-kimi-adapt.md:205-217`) nevertheless documents the same plugin manifest
   (`"keywords": ["browser","webbridge","cdp","automation","web","scraping"]`, `"skills": "./skills/"`).
2. `CDP :9222 live target/page enumeration` — kama-shokunin@`cff9e62f`…`corpus/knowledge/listener-census.md:355`
   "Chrome DevTools protocol, 21 live targets including" / tabi `PROVINCE.md` "CDP session discipline
   (endpoints, targets, screenshot/DOM evidence" / **ruled** — ruling `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:141`
   "**tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface."
   (kama's :356-357 continue "Any local process can drive a logged-in browser." / "Report-only.")
3. `CDP browser submissions (operator-authed external-effect lane)` — kasegi-shokunin@`922a4dde`…`SKILL.md:267`
   "CDP browser submissions" / tabi `SKILL.md` "operator-approval-required — lane execution refused;
   approval routes the act to the operator" / **refused-route**. kasegi:268 continues "operator-authed";
   the cited corpus detail is `corpus/knowledge/mission-control.md:118-119`
   ("the external-effect lane: operator-authenticated burnerchrome at CDP 9222 (attach by URL substring…)").

Checks exercised: `awk -F'\t'` → 3 rows × 9 fields (no embedded TAB); every sibling/ ruling quote
re-extracted with `git -C <repo> show <hex>:<path>` at the cited line and matched as a substring,
every tabi quote matched inside the master blob `5859243…` → 6 OK, `fail=0`.
Pins: `git -C <repo> rev-parse master` for kama (cff9e62f) and kasegi (922a4dde);
game-dev-3d has **no** `master` (`rev-parse master` → "unknown revision"), only `main`
(3118be0b) — deviation from PLAN §C3 recorded here, no `HEAD` used.

## 4. Rejected hits (one line each, grouped; negative claims carry this sweep)

- **audio** PROVINCE:4,25,41 + corpus/README:11,25,33 — `headless` is the audio measurement battery
  (SoX/ffmpeg fixtures, Godot WAV import); no browser, HTTP or page surface.
- **audio** `chromium` in `corpus/live/runs/*/measurements.json` — only a `pactl`/PipeWire property
  (`application.process.binary = "chromium"`): the browser as an audio client, not a browser surface.
- **chousa** SKILL:22 + README:14,139,150,502 — `tabi` inside "suitability"/"stability"; no mention.
- **chousa** MINT:58,105-106 + `corpus/knowledge/archived-export-intake.md:141` (AP-03) — chousa
  *denies* "browser, CDP, profile, session or credential reads of any kind"; a refusal at its own
  intake gate, not an ownership claim, so no overlap to dispose.
- **game-dev-2d** PROVINCE:3,8,16 + README (21 lines) — `headless` = Godot 4.7.2 headless fixture
  battery; README:63 states rendered output is unprobed (`screens=0`).
- **game-dev-2d** `reports/r2-camera-scout.md:11`, `r3-ui-critic.md:14`, `r5-anim-critic.md:25`,
  `round-105/r105-R105Scout.md:78` — the four `screenshot` hits say a rendered screenshot is **not**
  the observable / are in-engine `get_image|save_png|capture_screen` greps.
- **game-dev-3d** PROVINCE:3,6,16,19,29,57,58,62 + SKILL:3,8,50,154,156 + README:4,25,154,160,163,167,168,180,185 —
  `headless` = Godot/Blender engine determinism; PROVINCE:62 states `--headless` has no rasterizer.
- **game-dev-3d** SKILL:47,110 — `tabi` inside "executability"; not a lane reference.
- **game-dev-3d** 71 `screenshot` tokens — engine render / Blender PNG-hash capture, not browser.
- **kama** all four named surfaces — zero hits; its CDP facts live in corpus/knowledge (row 2 source).
- **kama** `consumer-registry.md:9,235,277` + `.ufo/waves/round-16/build/advice/ConnectKake.md:33,41,89`
  — same surface class as row 2, not independent; :89 routes "tab/target set" to **kake** (see §5).
- **kasegi** mission-control:119, ufo-workspaces:272, LOG:67,399 — the 9222 attach / submission
  receipts behind row 3; corroboration, not separate rows.
- **kengaku** SKILL:39 — WebArena-Verified is a benchmark-selection table row ("deterministic browser
  eval"); kengaku measures agent capability and holds no browser surface (wider scan: 0 driver tokens).
- **kengaku** README:19 `bidi` = "bidirectional"; README:41,74,204,216,223 + SKILL:451,458 — `tabi`
  inside "stability"/"repeatability".
- **kotoba** SKILL:151 — `tabi` inside "Portability".
- **kotoba** README:102, `fleet-skill-audit-round5.md:45`, `sibling-description-rewrites-round8.md:129-236`,
  `.ufo/round-21/scouts/K06.md:89`, LOG:46 — kotoba auditing the **kagi↔kake** CDP overlap; the CDP
  facts belong to kagi/kake, not kotoba (corroborates AdjSweep2's kagi/kake row — do not duplicate here).

## 5. Findings routed to L1 (no schema-valid row available; not silently absorbed)

1. **kama routing conflict.** `ConnectKake.md:89` (tracked at cff9e62f) routes
   "`9222` CDP session, lease, tab/target set" to **kake**, and forbids kama to "list targets".
   The round-16 integrator ruling (`round-16-verifier-spotcheck.md:141`) assigns live browser/CDP
   page observation to **tabi**; it says nothing about the lease. Row 2 therefore carries only the
   page/target-enumeration half (`ruled`); the lease half is not tabi's and the kama table conflates
   the two. Needs either an L0 row (`tabi | round-17 | …` in `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md`)
   so a `contested-open` row becomes expressible, or a kama-side correction citing the ruling.
2. **kasegi internal tension (sibling-side, reported not absorbed).** `PROVINCE.md` closes
   "Live-target testing is refused; this corpus is documentation only", while SKILL:267 and
   mission-control:118-119 document an operator-authed CDP submission lane. Row 3's split is stated
   by tabi's SKILL.md:727 (C4: "lane execution refused; approval routes the act to the operator").
3. **kagi↔kake corroboration for AdjSweep2.** kotoba measured the same overlap independently
   (`corpus/knowledge/fleet-skill-audit-round5.md:45`; README:102 "0/5 descriptions carry an
   arbitration clause"). Handed to AdjSweep2's row; no kotoba row written.
4. **Pinning deviation.** `rev-parse master` fails for game-dev-3d (main 3118be0b), audio (main
   0462a544) and game-dev-2d (main bce53b83). Only game-dev-3d contributes a row; its row cites
   `main`. No `HEAD`, no `--` fallback.
5. **Tabi-side wraps.** PROVINCE.md:9 ends at "…screenshot/DOM evidence" ("capture)" continues on
   :10); game-dev-3d's tabi_quote is PROVINCE.md:6 ("the kimi-webbridge plugin", sentence continues
   :7). TSV cannot carry the newline, so the :9/:6 fragments are quoted verbatim.

No tool installs or upgrades were needed.

Files written:
- .ufo/waves/round-17/adjacency/sweep1.tsv
- .ufo/waves/round-17/w1/AdjSweep1.md
