# ScoutSiblingDrift — sibling PROVINCE.md drift since the frozen C1 pins (round 33 w2)

## Verdict: holds (no defect). Drift since pin = 0 on every candidate line.

For all 20 frozen sibling pins (the 7 siblings that carry the 52 candidates, plus the 13 with 0 candidates), the sibling's `PROVINCE.md` blob at the current lane tip (`master`/`main`) is byte-identical to the blob at the frozen pin. Therefore no candidate line changed, moved or disappeared, and no new browser-domain (frozen-REGEX) line appeared at any tip. 4 siblings advanced their tip beyond the pin without touching PROVINCE.md (kaidoku +1, kengaku +5, tsukuroi +4; plus kasegi +4, mado +3, souji +1 with 0 candidates); kake, kagi, kotoba, revenger tips equal their pins. Frozen-predicate impact: none (it reads git objects at the pins only). A next-round sweep at current tips would add **0 candidates** and drop **0**; the candidate set stays 52 (kagi 4, kaidoku 2, kake 42, kengaku 1, kotoba 1, revenger 1, tsukuroi 1).

Two observations a next-round sweep could act on (neither is a defect of the frozen counter):
1. **Regex-miss lines in kake** (not matched by the frozen REGEX, so outside the 52, but they concern the tabi/kake boundary): kake PROVINCE.md:35 (continuation of the already-mapped :34 "tabi drives browsers…robots/sitemap"), :59 ("not a claim that a live website was repaired"), :67 ("saved GET-response HTML … This is not rendered-DOM observation, navigation/readiness approval"). :35 is the second half of the mapped :34 pair; :59/:67 are kake-side non-claims about rendered DOM/live observation, arguably candidate for a `same-surface`/`split-declared` look next round. Also kaidoku:4 and revenger:4 ("Electron/ASAR/JavaScript", "Electron/JavaScript packages") are unmatched by REGEX; their CDP-bearing lines (kaidoku:53, revenger:5) are already mapped. Judgement not made here.
2. **Existing map rows cite older sibling pins** than the frozen ones (adjacency.tsv rows 1-9 at kaidoku@9011581d, revenger@cf02419, kake@7c61c8cc, kagi@c2cab35b, kumitate@1770305f, kama@54a29268; rows for kake PROVINCE:61/79/304/347 at kake@04404859). That is by design (a row verifies at its own pin); not drift.

## Evidence

Method: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/ScoutSiblingDrift/drift.mjs` (read-only `git show`/`rev-parse`/`rev-list` against each sibling repo; PINS and REGEX extracted from the frozen counter `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:62-83`, REGEX line 61). Exit 0. Output: `drift.json` in the same dir.

| sibling | pin | tip (branch) | commits pin..tip | PROVINCE blob pin / tip | candidates pin / tip | moved / gone / added |
|---|---|---|---|---|---|---|
| kake | 04404859 | 04404859 (master) | 0 | 175fdab3 / 175fdab3 | 42 / 42 | 0/0/0 |
| kagi | 69b61db4 | 69b61db4 (master) | 0 | 2bbd4daa / 2bbd4daa | 4 / 4 | 0/0/0 |
| kaidoku | 8b9634ed | fa6a8a3f (main) | 1 (round-39 spot-check lesson file only) | d0cc2e26 / d0cc2e26 | 2 / 2 | 0/0/0 |
| kengaku | 7984fd30 | fc79f2a4 (master) | 5 (round-40 recheck, round-41 freeze/spec/probe; 40 files, no PROVINCE.md) | 6bdaefdf / 6bdaefdf | 1 / 1 | 0/0/0 |
| kotoba | 65a5c7a6 | 65a5c7a6 (master) | 0 | a58c3b80 / a58c3b80 | 1 / 1 | 0/0/0 |
| revenger | 6da884c6 | 6da884c6 (main) | 0 | 797f67fe / 797f67fe | 1 / 1 | 0/0/0 |
| tsukuroi | 9cc9aa77 | 64f9062e (master) | 4 (round-41 integration, 473 files, no PROVINCE.md) | 976061fc / 976061fc | 1 / 1 | 0/0/0 |
| audio, chousa, game-dev-2d, game-dev-3d, kama, kotodama, kumitate, lore, mori, tameshi | = tip | = tip | 0 | equal | 0 / 0 | 0 |
| kasegi, mado, souji | pin | master | 4 / 3 / 1 | equal | 0 / 0 | 0 |

`git log pin..tip -- PROVINCE.md` printed nothing for kake, kagi, kaidoku, kengaku, kotoba, revenger, tsukuroi (first loop; commands: `git -C <lane> rev-list --count`, `git diff --stat`, `git log --oneline … -- PROVINCE.md`, all exit 0). Pin ancestry: `merge-base --is-ancestor pin HEAD` = yes for all seven.

Working-copy and branch checks (read-only, exit 0):
- `git status --porcelain -- PROVINCE.md` is clean in all siblings except **kasegi** (uncommitted append "r38 Frontier amendment", OASIS CSAF/VEX text, zero regex hits on the added lines; kasegi has 0 candidates). Uncommitted, so it would not enter a pinned sweep until committed.
- Non-tip branches with a different PROVINCE.md blob exist (audio/game-dev-2d `wt-r9x/r10x`, `hyaku/s3-*`, `round20-*`, `mado-r21-*`, `mori-r19-*`, `kake53/*`, kengaku `round29/R29ExecCore`, `souji-r20-*`). Spot ancestry checks (14 pairs): all are either strict ancestors of the tip (older snapshots) or divergent older bases (`wt-r100` dated 2026-10-16; `kake53/exec-quality-gate`/`exec-cross-citation` merge-base 3994101d, i.e. behind master, their PROVINCE diff vs master is mostly deletions of Yahoo!-JAPAN round-56 crawl text that master carries). None is a descendant of its tip, so none can introduce a new candidate without a merge.
- Non-PROVINCE added lines pin..tip matching a narrower browser regex: kaidoku 0, kengaku 0, kasegi 0, souji 0; tsukuroi 473-file round-41 diff hits only in `.ufo/waves/round-41/w1/*` process-evidence scans (sibling-grep outputs, reports) — tool outputs about the fleet, not claims; mado hits only in `.ufo/waves/round-44/w2/*` census artifacts. No new knowledge/claim file with browser content.

Extra regex-miss scan at tips (case-insensitive; `electron|webview|headless|xvfb|http(s)|dom|sitemap|robots|…` minus frozen REGEX): relevant hits only those listed under observation 1; others (audio/game-dev headless Godot, kama baseURL/HTTP pins, kengaku model HTTP endpoints, kagi the-janitor HTTP client, kotoba MCP, kumitate MCP/OAuth) are not browser-sense.

## Deliverable paths
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/ScoutSiblingDrift.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/ScoutSiblingDrift/drift.mjs`, `drift.json`

No network use, no browser/chromedriver started (`pgrep` not needed), no scratch tree created, no lane tracked file, git index, jj state or sibling repo touched; tools installed: none.
