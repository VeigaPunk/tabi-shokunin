# AdjKaidoku6 — C1 dispositions, 16 kaidoku `corpus/knowledge/2026-10-14-r10-01-queue-ops.md` lines

Seat: AdjKaidoku6 (scribe, w1). Pin `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`.
Chunk: `.ufo/waves/round-35/w1-chunks/AdjKaidoku6.tsv` (16 lines, all one file).
Decision rule: `SKILL.md:2861-2881`. Frozen screen reasons: `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:78`.

Result: **16 screens, 0 map rows, 0 DECL, no L0 question.** All 16 lines are facts on kaidoku's own
side of a split this lane has already mapped — 15 on map row 15 `recorded-har-producer-channel`
(kaidoku, `split-declared`, tabi side `SKILL.md:2958`, whose declaration cites this very file at
`:151,161-166`: "kaidoku's Playwright `recordHar` run and its HAR-schema gate feed its own
`inspect-web-network-capture` input … and stay kaidoku's"), and 1 on map row 1 `cdp-runtime-observation`
(kaidoku, `ruled`). Step 2 of the decision rule therefore decides every line; QUALITY 91 ("a map row
whose only sibling-side ground is a fact on the sibling's own side of an already-mapped split is a
screen, whatever its surface name") and QUALITY 97 bind the choice. No line states a *new* side of a
tabi surface: each reports a probe kaidoku ran to provision the input of its own REA verb.

| key (suffix `:<line>`) | disposition | ground in both sides |
|---|---|---|
| kaidoku-shokunin@49096c7e...:…queue-ops.md:3 | screen `same-surface` recorded-har-producer-channel | The heading announces kaidoku's row-16 run on "`inspect-web-network-capture` on a real chromium HAR"; the mapped row's declaration (`SKILL.md:2958`) already assigns that HAR, as a named-producer artifact, to kaidoku. |
| …:9 | screen `same-surface` recorded-har-producer-channel | "hint a viable provisioning path for the HAR gate?" is kaidoku asking how to feed its own gate; tabi's side of the channel (producer named, bytes pinned) is already declared. |
| …:24 | screen `same-surface` recorded-har-producer-channel | "(Playwright 1.64.0 `recordHar`, HAR 1.2, 5 entries of" is the probed input for kaidoku's gate, the channel row 15 splits. |
| …:25 | screen `same-surface` recorded-har-producer-channel | "real self-launched chromium 152 traffic against a localhost fixture" is kaidoku's own recording act, already inside the split. |
| …:26 | screen `same-surface` recorded-har-producer-channel | The `/tmp/r10-01-netlog.json` chromium netlog is kaidoku's second producer candidate, refused later in the same file (`:116`). |
| …:116 | screen `same-surface` recorded-har-producer-channel | kaidoku refutes the netlog route for its own `har|mitmproxy` gate; tabi's declaration (`SKILL.md:403-406` via `:2958`) already treats a netlog as not a HAR. |
| …:129 | screen `same-surface` recorded-har-producer-channel | "A genuine chromium netlog (314,987 B," is kaidoku's own refused input, quoted inside its gate-contract observation. |
| …:131 | screen `same-surface` recorded-har-producer-channel | kaidoku captured that netlog from its own localhost fixture; the channel's ownership is already answered. |
| …:137 | screen `same-surface` recorded-har-producer-channel | kaidoku's `**INFERENCE**` that the netlog hint fails its gate is a conclusion about its own provisioning path. |
| …:153 | screen `same-surface` recorded-har-producer-channel | The lossless 5/5 decode is a HAR kaidoku recorded and decoded with its own verb, the artifact channel already split. |
| …:155 | screen `same-surface` recorded-har-producer-channel | "provisioning that works: playwright 1.64.0 (npm -g)"' names the tool kaidoku uses for its own input, not a second claim on browser craft. |
| …:156 | screen `same-surface` recorded-har-producer-channel | kaidoku drives `/usr/bin/chromium` 152 with `recordHar` only to produce the fixture HAR its gate consumes. |
| …:158 | screen `same-surface` recorded-har-producer-channel | The record's `creator "Playwright"` is the producer identity the mapped channel row already splits. |
| …:235 | screen `same-surface` recorded-har-producer-channel | The 1.4 s provisioning cost is measured on kaidoku's own side of the channel. |
| …:236 | screen `same-surface` recorded-har-producer-channel | "chromium 152 + playwright 1.64.0" preinstalled is kaidoku's own provisioning of its own input. |
| …:241 | screen `same-surface` cdp-runtime-observation | "`capture-electron-scenario`, CDP self-launch family" is kaidoku's own next census verb; map row 1 (`ruled`) already holds kaidoku's CDP self-launch as an REA provider surface. |

Rejected alternatives (recorded so wave 2 can attack the choice): a split-declared map row on `:155`/`:156`
would cite a tabi declaration that already exists (`SKILL.md:2958`), so (n1) fails — the quote is not a NEW
line, and the surface `recorded-har-producer-channel` is already in `baseKeys`, so it could never count as
`newMapped`; on `:241` the same holds for `cdp-runtime-observation`. Forging a new surface name for
kaidoku's HAR provisioning would be the J8 construction the claim already scores (`feasibilityDisclosed`).

Counter run (frozen bytes, `adjGateSha256 4e2c2a64…`):
`node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 9d1ff097a3740bc54144cb5a7fd5be7df1fea326 --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json`
→ exit 1; adjacency clean rows 16 verified 16 findings 0; candidates 383; mapped 0; screened 16;
unaccounted 367; newMapped 0; screenFindings []; my 16 keys absent from `unaccountedKeys`
(0 of 16). Predicate false lane-wide by construction: one seat's 16 screens of 383.

Paste of the exact evidence: `counter-check.json` (full JSON), `screen.tsv` (16 rows, sha256
`0f6a90efff3d1c918e32e9a8fc174af05f03d194105873b35cf858dfa9a3b409`).
