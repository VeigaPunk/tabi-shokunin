# ConnSiblings — adjacency scan, tabi round 29 w1

Seat: ConnSiblings (leaf, no subagent dispatch). Item: adjacency scan.
Read-only throughout: no sibling lane file was written; all findings are
report-only per tabi PROVINCE.md "Out of province → report, never absorb."

## Question

Do sibling lane repos under `/home/vgpnk/Projects/shokunin/*-shokunin` hold
registry rows or knowledge pinned to Chromium tag `154.0.8037.97`, or covering
WebMCP / CDP / bfcache / Gitiles sources, such that (a) they overlap tabi's
23 on-release rows being re-checked this round, and (b) tabi's
156.0.8078.47 recheck evidence is something that lane would want?

## Method (all commands read-only; exit codes as observed)

- `grep -rn '154\.0\.8037\.97' .../corpus .../SOURCES.md .../*.md` across all
  21 sibling repos → exit 0, **zero** corpus/SOURCES matches outside tabi.
- `grep -rlni 'webmcp\|bfcache\|backforwardcache\|back-forward-cache\|gitiles'`
  across sibling corpora → exit 0, 6 files (4 kaidoku, 1 kasegi, 1 mori).
- Per-pinned-filename sweep (`WebMCP.pdl`, `model_context.idl/cc`,
  `form_mcp_schema.cc`, `html_form_element.cc`, `html_select_element.cc`,
  `content_features.cc`, `content_switches.cc`, `command_line.cc`,
  `runtime_enabled_features.json5`, `inspector_web_mcp_agent.cc`,
  `script_tool_types.h`, `Page.pdl`, `WebMCPView.ts`, `devtools_protocol`)
  across all sibling corpora → exit 0, **zero** matches in every case.
- `grep -rn -i 'bfcache\|back-forward' .../corpus` → exit 0, **zero** matches.
- Whole-repo tag grep (all 20 siblings, including `.ufo/waves`) → exit 0,
  14 files, **all** under sibling `.ufo/waves/` (wave outputs, not registry
  rows); each read and classified below.

Tabi's own pinned set (from `corpus/SOURCES.md`, for the overlap column):
S033 S034 S041 S042 S044 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081
S093 S094 S096 S097 S098 S099 S100 S105 S106 (24 rows carry the tag with
recheck on-release; the frozen counter's population=23 is authoritative on
membership — S094 is the rejected/absence row and S108 is the chromiumdash
trigger row, itself unpinned).

## Overlap table

| lane | path:line | what it is | overlaps tabi's pinned rows? | wants the 156.0.8078.47 recheck evidence? |
|---|---|---|---|---|
| kaidoku | corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:180-185, 597-612, 666-678 | REA CLI CDP self-launch verb census; `discover-webmcp-tools` honest-zero against self-launched chromium **152.0.7977.82**; loopback-only | No — different build (152), no tag pin, no shared file paths | Low: substrate is host runtime REA verbs, not tag-pinned source; unchanged unless REA toolset changes |
| kaidoku | corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:3, 16, 45, 98-114, 137-182 | CDP envelope hash identity; webmcp discovery returns `{total:0}` | No | Low (same reason) |
| kaidoku | corpus/knowledge/2026-10-13-r2-skill-references-deep.md:71-79 | loopback-CDP-only passive observation contract; WebMCP untrusted-inventory rule | No | Low (behavioral rule, not source-pinned) |
| kama | corpus/knowledge/listener-census.md:56, 102, 241-243, 355 | live CDP `127.0.0.1:9222` census, Chrome **152.0.7977.64**, 21 targets | No — host-runtime observation | Marginal: census is runtime; tabi S105/S106 (Page.pdl bfcache discriminator) only matters if kama ever classifies bfcache-restored navigations — not in its current scope |
| kagi | corpus/knowledge/cdp-bridge-1password.md:1-70 | the-janitor CDP bridge on 9222; profile lease contested with kake | No | No — secrets lane, session shape-only; recheck is public-source work |
| kake | corpus/SOURCES.md:233 | Gitiles registry row: chromium src `+/main/docs/speed/metrics_changelog/README.md` | No — Gitiles source row but not tag-pinned, different path (main, not refs/tags/154) | No — kake is publishing/SEO; a Chrome-stable source drift note is not its evidence need |
| kasegi | corpus/source-snapshots/round-24/S011.txt:802 | token "WebMCP" inside a Cloudflare product glossary list | No — not knowledge, not a registry row | No |
| mori | corpus/evidence/recheck-r32/S043.src:451 | "hasWebMcpPermissions" inside a Z.AI docs page snapshot | No — not Chromium-source knowledge | No |
| chousa | corpus/knowledge/archived-export-intake.md:20, 141 | CDP listed only as a *refused* surface (secrecy guard) | No | No |
| audio | corpus/live/**/measurements.json (~40 files) | numeric false positives on `9222`/pattern | No | No |
| revenger | PROVINCE.md:5 (no corpus rows) | browser/Electron runtime evidence via REA — artifacts, not Chromium source tags | No corpus rows pin any browser source | No — analyzes shipped APK/EVM artifacts |

## `.ufo/waves/` hits (wave outputs, not registry rows — classified)

| lane | path:line | content | note for that lane |
|---|---|---|---|
| kotoba | .ufo/waves/round-71/receipts/census-after.txt:251, 254, 256 | cross-lane duplicate-URL census flagging **tabi** rows S074, S077, S096 ("duplicate url .../154.0.8037.97/... across scopes") | **Would want:** when tabi supersedes rows at the 156 tag this round, the URLs kotoba de-duplicated change; its census should re-run against the superseding rows |
| kasegi | .ufo/waves/round-33/wave1/ExecScratchDiscipline.md:123, 138, 150, 164 | lane-hygiene seat found `/tmp/code.154.0.8037.97` and `/tmp/code.156.0.8078.47` editor temp dirs (3 files each, 01:26:02), "session/editor temp snippets, unattributable" | **Would want attribution.** These look like editor/temp scratch from a Chromium-source session working both tags — consistent with tabi r29 recheck activity, but tabi's contract requires scratch under `$HYAKU_SCRATCH/tabi-r29/<seat>/`, not `/tmp`. Flagged here; kasegi can correlate. No write made to kasegi. |
| tsukuroi | .ufo/waves/round-24/w1/ExecPacmanLogCensus/table.md:244; round-15/build/host-snapshot.json; round-37/w1/C32Ledger218/fixture-before/... | host pacman log records `chromium (152.0.7977.82-1 -> 154.0.8037.97-1)` upgrade 2026-10-20 (PRE-WINDOW) | **Would want:** tabi's S108 chromiumdash evidence (stable 155.0.8059.84 → 156.0.8078.47) predicts the next host chromium package bump; tsukuroi's package-tracking tables benefit from the corroborated new stable number |
| tameshi | .ufo/waves/round-25/w1/C2HtmlRender.md:48, 103 | render harness used system Chromium 154.0.8037.97 at `/usr/bin/chromium` via puppeteer-core | **Would want:** its harness binary tracks the host package; the 156.0.8078.47 stable move foretells the harness binary changing under it |
| chousa | .ufo/waves/round-30/build/ReviewContractV2.md:128 | one-off headless 154.0.8037.97 `DOMParser` probe inside `unshare -rn` | Marginal: only if the probe is re-run on a newer host chromium |
| kagi | .ufo/waves/round-28/build/ConnTabi.md:58; retained-probes/ConnTabi/probe.py:7 | kagi's own tabi-connector probe of version-boundary direction (`154.0.8037.97` vs `154.0.8037` prefix) | Historical connector work; no current need |

## Adjacency notes

1. **Zero registry overlap.** No sibling lane has any corpus/SOURCES.md row
   pinned to tag 154.0.8037.97, and no sibling references any of the same
   pinned file paths. The 23-row recheck is tabi-internal; no sibling
   competes for these source rows, and tabi has nothing to absorb.
2. **Contested rows in `corpus/adjacency.tsv` this touches** (all CDP-scope,
   none source-pin-scope): `cdp-runtime-observation`/kaidoku (ruled),
   `cdp-live-target-census`/kama (contested-open, fleet l0-questions.md:65),
   `musketeer-cdp-9222-profile-lease`/kake+kagi (contested-open, :62),
   `rea-browser-runtime-evidence`/revenger (contested-open, :65). This scan
   adds no new contested row and changes no ruling — the version-pinned
   source registry is outside all four contested surfaces.
3. **PROVINCE.md check:** tabi refuses reverse engineering (→ kaidoku/
   revenger), web publishing (→ kake), secrets (→ kagi). Nothing found
   crosses into tabi's province; report-only stands.
4. **`/tmp/code.<tag>` hygiene flag:** kasegi's r33 seat already recorded the
   unattributed 154/156 temp dirs. If those belong to tabi r29 seats, the
   correct venue is `$HYAKU_SCRATCH` (or a sub-50 MB /tmp file), not
   `/tmp/code.*` editor dirs. Reported for Main/kasegi; not absorbed.
5. **Evidence other lanes would want (deliverable via this report, since
   siblings are read-only to me):** tsukuroi (host chromium package tracking)
   and tameshi (render-harness binary) both benefit from the corroborated
   156.0.8078.47 stable; kotoba's duplicate-URL census needs a re-run after
   tabi's superseding rows land; kasegi wants attribution of the `/tmp`
   snippet dirs.

## Verification honesty

- Commands ran: six `grep` sweeps (tag, topic keywords, 14 pinned filenames,
  bfcache, chromium.googlesource, chrome/chromium in SOURCES.md) plus
  whole-repo tag grep and per-hit context reads (`sed -n`, `grep -o`).
  All exit codes 0 except: sibling-`gitiles`-in-kaidoku-README grep exit 1
  (no match — README's Gitiles mention is actually in kake's SOURCES.md:233);
  corpus-scope tag grep produced zero sibling lines.
- No builds, no network fetches, no writes to any sibling lane, the fleet
  repo, or lane tracked files. No tools installed (none needed).
- Everything above is observed output; nothing inferred is presented as
  measured. The one unverified attribution is the owner of the
  `/tmp/code.154.0.8037.97` / `/tmp/code.156.0.8078.47` dirs — marked as a
  flag, not a verdict.
