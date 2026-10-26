# AdjKaidoku2 — dispositions, 16 kaidoku browser-ground candidates

All 16 keys are from `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`. Decision rule applied in order
(`tabi-shokunin/SKILL.md:2861-2881`). Step 2 fired on 15 of 16: map row 2 of `corpus/adjacency.tsv`
(`cdp-runtime-observation`, sibling `kaidoku`, verified at the freeze) already owns the CDP overlap for this sibling —
tabi side `PROVINCE.md:9` "CDP session discipline (endpoints, targets, screenshot/DOM evidence", ruled by
`tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142`
"**kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis". Each line below is a fact on
kaidoku's side of that already-ruled split, so it is `same-surface` under QUALITY 91 (`corpus/QUALITY.md:585-590`),
never a second row for an answered surface. **No map row is proposed and no DECL is drafted** — a ninth CDP row would be
`duplicate_row` on the folded surface+sibling pair and would state nothing new.

Key | decision | why (both sides)
---|---|---
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:43` | screen/same-surface `cdp-runtime-observation` | Kaidoku's prerequisite bullet says chromium PID 25784 has "no debug flag — cannot attach" and counts playwright 1.64.0 global as substrate to self-provision a CDP target; that self-launched-target ground is tabi's CDP session discipline already ruled to kaidoku only as an REA provider surface.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:44` | screen/same-surface `cdp-runtime-observation` | The same bullet's ms-playwright `chromium-1248` + `chromium_headless_shell-1248` caches are provisioning substrate for that same self-launched target, which the ruled row already answers for this sibling.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:45` | screen/same-surface `cdp-runtime-observation` | The bullet's `agent-browser` 0.38.2 and stale `~/.local/share/burnerchrome/` profile (its `chrome.log` shows a prior `DevTools listening on ws://127.0.0.1:9222/`) is endpoint/substrate census on the same ruled CDP ground.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:54` | screen/same-surface `cdp-runtime-observation` | `electronToolContracts.js` defaulting Electron CDP to `:9223` and counting only `file://` page targets is an REA-provider endpoint fact, the surface tabi owns and the ruling leaves kaidoku as provider detail.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:59` | screen/same-surface `cdp-runtime-observation` | "`pgrep -af remote-debugging` empty; `pgrep -af electron` only 1Password" is a live CDP-listener census, the same endpoint-discipline ground already mapped.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:65` | screen/same-surface `cdp-runtime-observation` | The suggested r3 move `chromium --headless --remote-debugging-port=9222` is the literal self-launched target the ruled row quotes from kaidoku `PROVINCE.md:53`.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:69` | screen/same-surface `cdp-runtime-observation` | The Electron leg `--remote-debugging-port=9223 <tiny app with a file:// page>` → `list_electron_targets` is the same self-launched CDP target ground, not a new overlap.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:136` | screen/same-surface `cdp-runtime-observation` | The summary table's Runtime observation row ("zero live CDP endpoints", "**viable via self-launched CDP**") restates the axis the ruled row answers.
`...:corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:144` | screen/same-surface `cdp-runtime-observation` | "CDP `:9223`, not the browser `:9222`" corrects an Electron endpoint default, an endpoint fact inside the ruled CDP surface.
`...:corpus/knowledge/2026-10-13-r2-provider-capability-matrix.md:101` | screen/same-surface `cdp-runtime-observation` | `rea list-browser-targets` requiring `--endpoint <string>` with "no default loopback scan" is the caller-supplied-endpoint discipline tabi owns and the ruling assigns to the REA provider surface.
`...:corpus/knowledge/2026-10-13-r2-skill-references-deep.md:71` | screen/same-surface `cdp-runtime-observation` | The candidate heading "Passive browser/Electron observation is loopback-CDP-only with a fixed refusal list and deliberate data omissions" documents the REA provider's observation contract, the same ruled surface.
`...:corpus/knowledge/2026-10-13-r2-skill-references-deep.md:79` | screen/same-surface `cdp-runtime-observation` | "Explicit path mappings are inference inputs and never broaden filesystem or CDP authority" is an authority boundary on reconcile_javascript_runtime's passive-CDP evidence, inside the ruled surface.
`...:corpus/knowledge/2026-10-13-r2-skill-references-deep.md:121` | screen/same-surface `cdp-runtime-observation` | The references summary's "loopback-CDP-only passive observation with credential/body redaction" is an r2 corpus gain on the same provider CDP ground.
`...:corpus/knowledge/2026-10-13-r3-jq-provenance.md:106` | screen/not-browser-sense | The jq install-provenance line lists an installer-written npx stub name (`playwright-cli`) among seven stubs and asks who dropped the jq cohort; it asserts nothing about browser driving, CDP or capture, so it matches the sweep regex through a bare tool name only.
`...:corpus/knowledge/2026-10-13-r3-runtime-observation.md:3` | screen/same-surface `cdp-runtime-observation` | The r3 entry title names its surface "Runtime-observation surface: self-launched CDP endpoints", the same overlap recorded in the ruled kaidoku `PROVINCE.md:53` row.
`...:corpus/knowledge/2026-10-13-r3-runtime-observation.md:5` | screen/same-surface `cdp-runtime-observation` | The r3 opening restates that r2 closed the axis "viable via self-launched CDP", a status fact inside the already-ruled self-launched-CDP split.
