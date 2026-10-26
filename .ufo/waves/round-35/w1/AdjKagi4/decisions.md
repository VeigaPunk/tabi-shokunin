# AdjKagi4 — C1 dispositions (round 35, w1, chunk AdjKagi4)

Sibling: `kagi-shokunin` at the frozen pin `69b61db46be4ed955994f6f1d1cba522bc5f4e97`.
Sibling's own province read at the pin (`PROVINCE.md`): secrets & vault ops — the-janitor flows,
credential hygiene evidence; it pins the `CDP 9222` + `~/.local/share/the-musketeer/chrome-profile`
ground as **contested with kake** and says it "pins only the 1Password native-messaging manifest —
the profile dir itself is presence-only" (PROVINCE.md:43).
Tabi side read at the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`: `PROVINCE.md:9` (CDP session
discipline: endpoints, targets, screenshot/DOM evidence capture), `PROVINCE.md:15-16` (refuses
secrets → kagi; session material shape-only), and the verified map row
`musketeer-cdp-9222-profile-lease` (kagi, contested-open) whose tabi quote is
`SKILL.md:556` "a fresh throwaway profile per run under the run's own output dir".

Decision order applied: SKILL.md:2861-2881 rule 1 (browser craft at all), then rule 2 (a
verification-passing map row already owns that surface for that sibling). No line reached rule 5.

| key | decision | grounding (both sides) |
|---|---|---|
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/handler-on-disk-state.md:113 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | kagi's flock table row names `cdp-bridge *` only as a non-locking verb, so its browser token is the cdp-bridge verb whose ground (CDP 9222 + the-musketeer chrome-profile) the verified kagi lease row already owns; tabi's `PROVINCE.md:9` CDP session discipline is that same endpoint ground, and a flock fact adds no second row. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/handler-trust-boundary.md:78 | screen — `not-browser-sense` | The regex hit is the md-defined opencode agent name `musketeer` in kagi's overloaded-agent-set enumeration (26 entries, resolved tool maps), a control-plane claim about the `_serve` socket; tabi owns no agent-permission surface (`PROVINCE.md:9-16` are browser/protocol/profile/secrets surfaces), so the line states nothing on tabi's craft. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/handler-trust-boundary.md:83 | screen — `not-browser-sense` | The line reports resolved opencode tool maps (`musketeer`/`ufo`/`sentinel` minus `edit`/`write`), i.e. which tools an agent may call inside kagi's socket; no browser, driver, protocol or capture is claimed, so no tabi surface is touched. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/handler-trust-boundary.md:122 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The claim is flock scope ("flock covers the CLI, not the port") and `cdp-*` appears only in a verb enumeration, so its ground is the same cdp-bridge/9222 endpoint the verified lease row owns; tabi's `PROVINCE.md:9` endpoint discipline is unchanged by which CLI verbs take a lock. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/handler-trust-boundary.md:163 | screen — `not-browser-sense` | The line reports that the `fnm_check` plugin tool is absent from five resolved tool maps, `musketeer` being one agent name checked; it claims nothing about a browser, driver or protocol, and no tabi surface covers opencode tool resolution. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/janitor-command-surface.md:23 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The verb-table row is `cdp-bridge ensure\|status\|open-popup` writing the 1Password NativeMessagingHosts manifest, exactly the manifest kagi `PROVINCE.md:43` pins as its side of the contested lease/profile split the verified row already answers for tabi's profile surface. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/janitor-env-contract.md:19 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The knob row pins `MUSKETEER_CHROME_PROFILE` = `~/.local/share/the-musketeer/chrome-profile` as the NMH target for `cdp-bridge`, the profile directory tabi `PROVINCE.md:9` counts as a shape-only browser profile surface and the verified lease row already dispositions. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/janitor-env-contract.md:21 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The knob row pins `MUSKETEER_CDP_PORT` = `9222` as the CDP reachability probe port, the very 9222 endpoint on which tabi holds `PROVINCE.md:9` CDP session discipline and the verified lease row records the contested split. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/janitor-env-contract.md:81 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The falsification recipe greps `MUSKETEER` knobs out of `~/.local/bin/the-janitor` to reproduce the knob table that holds the chrome-profile and 9222 rows, so it re-states the already-mapped lease/profile ground and adds no browser claim of its own. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/surface-census.md:150 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The probe result is `cmd_cdp_ensure` writing the manifest under a scratch `MUSKETEER_CHROME_PROFILE` (exit 0, sole NMH entry, mode 600), a fact on the manifest/profile ground the verified lease row already owns for tabi's profile surface. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/surface-census.md:151 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | The probe records the `-x` guard refusing with `BrowserSupport missing` and no manifest file written, another fact about the same native-messaging manifest write the verified lease row already dispositions. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/surface-census.md:181 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | Finding F3 is that a refused `cdp-bridge ensure` still creates the NMH directory inside the-musketeer chrome-profile, i.e. a mode/profiles-tree fact on the same manifest/profile ground, not a new browser surface. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/surface-census.md:284 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | Falsification step 10 runs `cdp-bridge ensure` with `MUSKETEER_CHROME_PROFILE=/tmp/x`, the same scratch-profile manifest exercise whose expected result the verified lease row's ground covers. |
| kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/surface-census.md:287 | screen — `same-surface` (`musketeer-cdp-9222-profile-lease`) | Step 11 asserts that breaking the default probe `CENSUS_BREAK=cdp-ensure-scratch` makes the census `FAIL`, naming the manifest-write probe whose ground the verified lease row already answers; the assertion is about census falsifiability, not a second browser surface. |

No map row is proposed: every browser token in this chunk lands on the one ground (cdp-bridge
manifest / CDP 9222 / the-musketeer chrome-profile) that the verified `musketeer-cdp-9222-profile-lease`
row already owns for kagi, and QUALITY 91 makes a fact on the sibling's own side of an already-mapped
split a screen rather than a second row. No `contested-open` was drafted, so `l0.txt` is empty.
