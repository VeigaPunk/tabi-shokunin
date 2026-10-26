# AdjMado1 — C1 dispositions, 10 mado candidates (round 35, w1)

Sibling pin: `mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7` (the counter's frozen `PINS.mado`).
Decision rule applied: `SKILL.md:2861-2881`, asked in order 1→5.
Tabi side tested against `PROVINCE.md:6-13` (owns) and `PROVINCE.md:15-19` (refuses).
No verified map row exists with `sibling = mado` (`corpus/adjacency.tsv` rows 1-16 are kaidoku/revenger/kake/kagi/kumitate/kama), so `same-surface` is unavailable for any of these lines by construction.

| key | decision | ground |
|---|---|---|
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/hyprland-gkeep-geometry-r43.md:70 | screen `not-browser-sense` | mado:70 asserts Hyprland floating geometry over a `hyprctl clients -j` dump ("four mapped clients and none is floating"), with `chromium` only the window-class token of the example client; tabi `PROVINCE.md:9` claims CDP endpoints/targets, not compositor client state, and step 1 of the rule answers first. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/province-accuracy-selfaudit.md:99 | screen `not-browser-sense` | mado:99 lists `chromium` among other applications' state that the declared-tree `find` excluded ("none a declared surface"), a config-plane coverage fact; tabi `PROVINCE.md:8` would claim a browser inventory or profile census, which this list is not. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/province-accuracy-selfaudit.md:298 | screen `not-browser-sense` | mado:298 re-runs the same filter and counts "320 raw hits, all non-surface state" with `chromium` one comma-list item; tabi `PROVINCE.md:6-13` claims no surface over mado's excluded app-state list. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/remaining-planes-census.md:84 | screen `not-browser-sense` | mado:84 is a theme-payload size table row (`chromium.theme` = 9 B) in the omarchy theme plane mado claims at `PROVINCE.md:8-9,18`; tabi claims no theme-file or rendered-file surface. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/remaining-planes-census.md:138 | screen `not-browser-sense` | mado:138 lists `chromium.theme` as one of the 17 `*.tpl` template filenames in that payload; the token is a file name, and tabi `PROVINCE.md:8` browser *profile* surfaces are not at issue in a template listing. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/remaining-planes-census.md:171 | screen `not-browser-sense` | mado:171 quotes the systemd scope name `app-Hyprland-chromium-…scope` inside the consumer-scope list mado owns; tabi `PROVINCE.md:9` CDP targets are not uwsm scopes, so the match is the scope-name suffix only. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/remaining-planes-census.md:223 | screen `not-browser-sense` | mado:223 counts "4 total" Hyprland clients and gives chromium as PID 2552209 beside three Alacritty windows — display/session shape (`PROVINCE.md:9`), not tabi's installed-browser inventory (`PROVINCE.md:8`). |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/remaining-planes-census.md:224 | screen `not-browser-sense` | mado:224 names the Hyprland window rules `chromium-based-browser*` and `default-opacity*` plus the walker elephant ppid — hypr rule text, which mado owns at `PROVINCE.md:6`; tabi claims no window-rule surface. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/theme-route-r18.md:92 | screen `not-browser-sense` | mado:92 counts the renderer's "16 rendered names" and `chromium.theme` is one filename in that list; tabi `PROVINCE.md:6-13` claims no rendered-theme-file surface. |
| mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/theme-route-r18.md:115 | screen `not-browser-sense` | mado:115 puts `chromium.theme` in its "Declared-only (no consumer read here)" list of template renders; the line is a theme-render scope limit, and tabi claims no theme-consumer surface (`PROVINCE.md:6-13`). |

## Why no map row and no `no-claim-declared`

Step 1 of the rule answers for all ten: each line's subject is mado's compositor/window or theme-file plane, and `chromium` enters only as a window class, a PID, a window-rule pattern, a systemd scope name, an app-state directory name or a rendered theme filename. None of the ten states mado's side (owns / refuses / routes / leases / shares / contests) of any tabi surface, which is what a map row requires — so no `DECL<n>` was drafted and `decl.md` is empty.

`no-claim-declared` was considered for `theme-route-r18.md:115` ("no consumer read here") and `theme-wallpaper-plane`-style lines and rejected: that boundary is about mado not opening a theme consumer, not a refusal of a shared surface or a non-goal on browser ground.

## Delivered

- `screen.tsv` — 10 rows, no header (the ledger body committed in the scratch clone).
- `rows.tsv` — empty (0 map rows proposed).
- `decl.md` — empty (0 `DECL` lines).
- `l0.txt` — absent (no `contested-open` row).
- `counter-check.json` — the frozen counter's JSON at my clone commit `fda19ba8283cb451a81a714e25a793f7707a21ed`.
