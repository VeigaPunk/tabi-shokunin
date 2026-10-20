VERDICT: PASS

# AdjSweep2 — sibling sweep 2 (kotodama, kumitate, lore, mado, mori, souji, tameshi, tsukuroi)

Rows only in `.ufo/waves/round-17/adjacency/sweep2.tsv` (3 rows, 9 TAB columns, no header).
Every cited sibling line and every tabi line was read from the pinned commit with
`git -C <repo> show <rev>:<path>`, not from the worktree.

## Pins (`git -C <repo> rev-parse <ref>`)

| repo | ref | 40-hex |
|---|---|---|
| kotodama-shokunin | refs/heads/main (no `master`) | 4ad26836552462d28a946ca3b067cab0b5ce3532 |
| kumitate-shokunin | master | 1770305fae20826b39905a8251ddeca6b4957ac4 |
| lore-shokunin | refs/heads/main (no `master`) | 01306d51252f837909af5252c398ee4e31259f9b |
| mado-shokunin | master | d3a00003e6ef0b1e3c7b4faf52d592eb293857ba |
| mori-shokunin | master | 24526ea9617cd020fee16c28fe4d4a2789dc28cb |
| souji-shokunin | master | 5fa6017ddcae9f6bd4412df44765f6360cb16294 |
| tameshi-shokunin | master | 98bea7da5801f4bc58e4187690ee1687c8a5061f |
| tsukuroi-shokunin | master | 6923fe0bd3add04fc90f3bc3522895b27cf44bbe |
| tabi-shokunin (quotes) | master | 5859243183c4d7ac5429dfdb8a73ce0d9a43d583 |

`git -C kotodama-shokunin rev-parse master` and `git -C lore-shokunin rev-parse master`
both fail (`fatal: ambiguous argument 'master'`); each repo has only `refs/heads/main`,
so the main tip is the pin for those two. All other refs above are `master`.
Branch tip was pinned once at sweep start; no sibling repo was written.

## Sweep A — the assigned four-file term sweep (term list from the ticket)

```
for r in kotodama kumitate lore mado mori souji tameshi tsukuroi; do
  d=/home/vgpnk/Projects/shokunin/$r-shokunin
  grep -rniE 'browser|CDP|Playwright|Puppeteer|WebDriver|BiDi|WebMCP|screenshot|headless|chromium|web interaction|tabi' \
    "$d/PROVINCE.md" "$d/SKILL.md" "$d/corpus/README.md" 2>/dev/null
done
```

Hit counts (lines; PROVINCE / SKILL / corpus/README → total):

| sibling | P | S | R | total |
|---|---|---|---|---|
| kotodama | 0 | 0 | 1 | 1 |
| kumitate | 0 | 2 | 1 | 3 |
| lore | 0 | 0 | 0 | 0 |
| mado | 1 | 8 | 2 | 11 |
| mori | 0 | 0 | 0 | 0 |
| souji | 0 | 0 | 0 | 0 |
| tameshi | 0 | 5 | 0 | 5 |
| tsukuroi | 1 | 2 | 0 | 3 |
| **total** | 2 | 17 | 4 | **23** |

No sibling has a `corpus/adjacency*` file (`ls` + `find -iname '*adjacency*'`: kumitate,
mado, mori, souji, tameshi have none; kotodama 13 files, lore 21, tsukuroi 5 are named
adjacency records outside `corpus/`).

## Sweep B — adjacency-named files (same term list, `find -iname '*adjacency*'` + grep -c)

kotodama 13 files / 0 matching lines; kumitate 0/0; lore 21/6; mado 0/0; mori 0/0;
souji 0/0; tameshi 0/0; tsukuroi 5/0. The 6 lore lines are listed under rejections.

## Sweep C — supplementary: whole-repo `\btabi\b|tabi-shokunin` over `*.md`/`*.tsv`

This is where the one load-bearing split outside the four assigned files was found
(kumitate `SCORECARD.md:1556`). It also surfaced lore round-87/round-16 maps and mado's
own round-17 map, used below for rows/rejections.

## Rows written (3) and evidence

1. **kimi-webbridge plugin internals (browser substrate) — kumitate — split-declared**
   - kumitate `SCORECARD.md:1556` (`FLEET-ADJACENCY-ERRATA-V1` clause A):
     "internals route to **tabi**, the `config.toml` REA MCP spawn key to **kaidoku**"
     — preceded at `:1553-1555` by "The K-block registry is an enumerable CENSUS ... not
     exclusive ownership of their domains".
   - tabi `PROVINCE.md:6-7`: "**Owns (surfaces):** the kimi-webbridge plugin
     (`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate ...".
   - Both sides state the split: kumitate keeps the member census, tabi owns the plugin
     internals. `ruling_ref` `-`.
2. **browser-evidence tasks (live-site interaction) — lore — refused-route**
   - lore `.ufo/waves/round-87/followup/K2-adjacency.md:75`: "A static corpus note needs
     no live-site interaction; any later browser-evidence task routes to tabi."
   - tabi `PROVINCE.md:3-4`: "browser & web-interaction craft ... driving real browsers
     against real sites with evidence discipline."
   - Provenance: round-87 seat report (committed at the pin), not a lore PROVINCE clause;
     it is a standing route reservation, so `refused-route`, `ruling_ref` `-`.
3. **evidence capture for browser/page claims — tameshi — split-declared**
   - tameshi `.ufo/waves/round-16/w1/Overlap1.md:114` row O-16 quotes tabi
     `PROVINCE.md:12-13` and concludes "complementary | None; evidence-capture craft for
     browser claims is tabi's."
   - tabi `PROVINCE.md:12-13`: "dynamic-page evidence patterns (what to capture so a claim
     about a page is re-verifiable)."
   - Both sides state the division (tameshi: generic before/after proof; tabi: browser
     claims). Tameshi's own word is "complementary", so this row records a declared
     division, not a contest. `ruling_ref` `-`.

Checker check (exercised, sandbox only): cloned LANE to
`/tmp/tabi-r17-AdjSweep2-n6ZK/lane` (`git clone --no-hardlinks`), copied the C3Checker's
current `scripts/check-adjacency.mjs`, added the header + these 3 rows as
`corpus/adjacency.tsv`, committed in the sandbox, ran
`node scripts/check-adjacency.mjs --repo <sandbox> --at <sandbox-rev> --fleet /home/vgpnk/Projects/shokunin --json`
→ `"verdict":"clean","rows":3,"verified":3`, `findings:[]`, exit 0. Sandbox removed.
That validates row shape/quotes against the in-progress checker, not a lane commit.

## Rejected hits (all 23 Sweep-A lines, one reason each)

- kotodama `corpus/README.md:314` — `tabi` inside "sTABIlized"; creole/linguistics note, no browser surface.
- kumitate `SKILL.md:265` — `--headless` is the wall-run TUI CLI flag, not a browser.
- kumitate `SKILL.md:267` — same flag documented ("headless is explicit").
- kumitate `corpus/README.md:90` — "headless trust gate" is the Kimi MCP config trust gate, not a browser/WebMCP page tool.
- mado `PROVINCE.md:16` — "file-byte- or screenshot-verified" governs desktop/compositor claims; no page claim.
- mado `SKILL.md:42` — compositor probes, input capture, screenshots; Wayland plane, not CDP pages.
- mado `SKILL.md:187` — the same strictness restated for Hyprland config claims.
- mado `SKILL.md:213` — `grim -t ppm -` compositor screenshot recipe.
- mado `SKILL.md:254` — screenshot artifacts of desktop state kept under the lane repo.
- mado `SKILL.md:514` — "no screenshot, refresh signal or service launch" (source-only Waybar round; negative).
- mado `SKILL.md:518` — "Old screenshot/RUN recipes are not standing authorization" (Waybar producer auth).
- mado `SKILL.md:520` — "Producer fields and screenshot" pixels are session material (Waybar privacy rule).
- mado `SKILL.md:1785` — "interrupted headless launch" is a fleet-round dispatch attempt, not a browser.
- mado `corpus/README.md:27` — `tabi` inside "sTABIlity"; walker-live-surface note (D-Bus/socket stat).
- mado `corpus/README.md:82` — "No screenshot, input injection or socket connection" (negative mention).
- tameshi `SKILL.md:244,463,771,1150,1666` — all `tabi` inside "sTABIlity"; fixture-stability text, no browser.
- tsukuroi `PROVINCE.md:48` — ADJ-03 routes desktop UI/screenshot to mado; no tabi/browser ownership.
- tsukuroi `SKILL.md:71` — `/opt/1Password/1Password-BrowserSupport` package path token; no browser interaction.
- tsukuroi `SKILL.md:1687` — `tabi` inside "wriTABIlity"; package-census arm.
- lore `K2-adjacency.md:35`, `F19-adjacency.md:62`, `V28-adjacency.md:177`, `V24-adjacency.md:112`, `V30-verdict-adjacency.md:164` — a PROVINCE path listing, a lane-prefix hygiene list, and three evidence grep commands; no ownership claim (only K2:75 is a route, row 2).

## Negative claims carried with their sweep

- lore, mori, souji: 0 hits across PROVINCE/SKILL/corpus/README under the full term list
  (Sweep A); 0 browser/CDP hits in lore's 21 adjacency-named files except the row-2 route.
- mado's own round-17 overlap map settles the screenshot question against tabi:
  `mado-shokunin@d3a0000:.ufo/waves/round-17/w1/reports/SiblingOverlap.md:99` —
  "| **tabi** | Browser/CDP interaction; secrets shape-only ... | None beyond the shared
  no-secret-text posture. | No contact. |" — so mado's `grim`/screenshot hits are a
  different substrate (compositor state), not a shared surface; no mado row.
- No tabi round-17 L0 question covers these surfaces (`grep -n '^tabi |' .ufo/l0-questions.md`
  → only round-5 and round-1 lines), so no `contested-open` row.
- Integrator CDP ruling exists but is scoped to tabi vs kaidoku
  (`tabi-shokunin@5859243:corpus/lessons/round-16-verifier-spotcheck.md:141-142`); it is not
  cited as the ruling for these three rows, hence `ruling_ref` `-`.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/adjacency/sweep2.tsv` (3 rows, rows only)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/AdjSweep2.md` (this report)

Tool installs/updates: none. Sandbox clone `/tmp/tabi-r17-AdjSweep2-n6ZK` removed; no lane
git write and no `jj` command was run in the lane.
