# AdjKumitate3 — dispositions for 17 kumitate-shokunin candidate lines (round 35, w1)

Chunk: `.ufo/waves/round-35/w1-chunks/AdjKumitate3.tsv` (17 keys, all `corpus/knowledge/kimi-skills-plugins.md`
at `kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d`).

Result: **17 screens, 0 map rows.** Every line is a census fact about the `kimi-webbridge` plugin package
(path, layout, modes, manifest keys, install record, frontmatter, declared tool table) recorded by kumitate while
its own boundary clause puts plugin internals out of scope and with tabi (sibling lines 318-321) and concedes the
plugin copy's size, digests, version and install record "are tabi's ground" (sibling line 324). The plugin surface
is already owned by verified map row 9 (`kimi-webbridge-plugin-internals`, kumitate), so these lines add no second
row (decision rule SKILL.md:2861-2881 step 2; QUALITY 91's "fact on the sibling's own side of an already-mapped
split is a screen"; QUALITY 97).

| key | disposition | one sentence grounded in both sides' lines |
|---|---|---|
| `kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md:303` | screen `same-surface` (`kimi-webbridge-plugin-internals`) | Kumitate cites the plugin copy's `SKILL.md:2` in its name-collision section while its boundary clause (318-321) puts plugin internals out of scope and with tabi, and tabi's `PROVINCE.md:6` already owns "the kimi-webbridge plugin" as primary substrate documentation, so the split row answers this surface. |
| `…kimi-skills-plugins.md:304` | screen `same-surface` | The collision is asserted as `name:` equality between two copies and decided by the harness precedence rule, kumitate's own skill-plane census ground, while tabi's `PROVINCE.md:6` owns the plugin's documentation; no side on tabi's ground is stated. |
| `…kimi-skills-plugins.md:315` | screen `same-surface` | The claim is kumitate's `K_sections`/`K_members` naming rule (full path required, bare basename binding to no member) for its own census, bookkeeping inside the split row's kumitate side, not a statement about the internals tabi owns at `PROVINCE.md:6`. |
| `…kimi-skills-plugins.md:337` | screen `same-surface` | The quoted `installed.json` `id` is the plugin's install record, which kumitate's own line 324 concedes "are tabi's ground" and which tabi's `PROVINCE.md:6` covers as the plugin it documents. |
| `…kimi-skills-plugins.md:338` | screen `same-surface` | The same record's absolute `root` is the install location kumitate line 324 assigns to tabi's ground, and tabi `PROVINCE.md:6` owns the plugin at that path as primary substrate documentation. |
| `…kimi-skills-plugins.md:343` | screen `same-surface` | The `originalSource` fetch URL is provenance of that same install record (kumitate 324: tabi's ground; tabi `PROVINCE.md:6`: the plugin as substrate). |
| `…kimi-skills-plugins.md:361` | screen `same-surface` | The heading names the plugin directory whose internals kumitate 318-321 route to tabi, and tabi `PROVINCE.md:6` owns that plugin as substrate documentation, so the surface is already answered. |
| `…kimi-skills-plugins.md:368` | screen `same-surface` | The tree line records the plugin root's mode from kumitate's measured `find -L` layout — a census measurement of the package tabi documents (`PROVINCE.md:6`), a layout fact on the split's kumitate side. |
| `…kimi-skills-plugins.md:371` | screen `same-surface` | The plugin's skill directory line is package layout that kumitate 318-321 places with tabi and tabi `PROVINCE.md:6` owns, adding no second row. |
| `…kimi-skills-plugins.md:381` | screen `same-surface` | The line identifies `kimi.plugin.json` as the plugin's own manifest distinct from `installed.json` — manifest identity of the package tabi documents (`PROVINCE.md:6`), a fact on the mapped surface. |
| `…kimi-skills-plugins.md:383` | screen `same-surface` | The quoted manifest version and author are the census values kumitate line 324 assigns to tabi's ground and tabi `PROVINCE.md:6` owns as substrate documentation. |
| `…kimi-skills-plugins.md:386` | screen `same-surface` | The keywords array (`browser, webbridge, cdp, …`) is the plugin's declared metadata, a package fact inside the split row and not a side on tabi's interaction surfaces. |
| `…kimi-skills-plugins.md:390` | screen `same-surface` | Where the skill sits under the manifest's `"skills": "./skills/"` pointer is layout mechanics kumitate records while routing internals to tabi (318-321), and tabi owns the plugin (`PROVINCE.md:6`). |
| `…kimi-skills-plugins.md:395` | screen `same-surface` | The plugin `SKILL.md` frontmatter quote is package metadata whose version line 324 calls tabi's ground, and tabi `PROVINCE.md:6` owns the plugin's documentation. |
| `…kimi-skills-plugins.md:396` | screen `same-surface` | The frontmatter-style comparison cites `kimi.plugin.json` L4 — a metadata observation on the package tabi documents (`PROVINCE.md:6`), adding nothing to the split. |
| `…kimi-skills-plugins.md:405` | screen `same-surface` | The 14 browser tool names are the plugin's own declared tool table, the internals kumitate 318-321 routes to tabi and tabi `PROVINCE.md:6` owns; kumitate states no side of its own. |
| `…kimi-skills-plugins.md:406` | screen `same-surface` | The tool list closes and names `references/operations.md`, whose daemon detail kumitate routes to kama at line 408, while tabi `PROVINCE.md:6` owns the plugin as substrate documentation — a census citation, not a tabi-surface claim. |

No map row is possible here: none of the 17 lines states kumitate's own side (owns / refuses / routes / leases /
shares / contests) of a tabi surface. The one line in this section that does state a side — 318-321, "Plugin
internals … are **out of this note's scope**; they belong to `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md`"
— names tabi and is therefore excluded from the candidate set by the counter's TABI filter, and the existing row 9
already declares that split. Drafting a declaration to force a row would be the round-33 mislabel red state
(QUALITY 88) and would fail QUALITY 97's "the sibling itself states its side".
