# AdjKaidoku5 — C1 dispositions for 16 kaidoku candidates

Pin: `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`. Every line is from
`corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md` (15 lines) or
`corpus/knowledge/2026-10-13-rea-cli-surface.md:94`.

Outcome: **16 screened / 0 mapped / 0 l0**. No line in this chunk carries a SIDE word
(`own|refuse|route|lease|report|shared|contest|handle|stays|never|out of scope`) at all —
checked mechanically over all 16 lines — so a `split-declared` row on any of them fails the
frozen counter's n4 clause, and `ruled`/`contested-open`/`refused-route` would need a ruling,
an L0 line or a tabi refusal that does not exist. The four surfaces they touch for kaidoku are
already owned by verified map rows (`cdp-runtime-observation`, `recorded-har-producer-channel`),
so decision-rule step 2 applies to every one of them.

Surface → owning tabi line (both sides of the split, already committed):
- `cdp-runtime-observation` → `PROVINCE.md:9` "CDP session discipline (endpoints, targets, screenshot/DOM evidence" (kaidoku row ruled by `corpus/lessons/round-16-verifier-spotcheck.md:142`: kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis).
- `recorded-har-producer-channel` → `SKILL.md:2958` (a recorded HAR is one network channel here, admitted only when its producer is named).

| key | disposition | ground |
|---|---|---|
| kaidoku-shokunin@49096c7e…:2026-10-13-r4-16-frontier-rescan.md:181 | screen / same-surface / cdp-runtime-observation | kaidoku queues its own `capture-electron-scenario` verb at "electron CDP :9223 self-launch", the provider-surface CDP use the round-16 ruling already assigns kaidoku; tabi's PROVINCE.md:9 keeps CDP session discipline on its own side of that split. |
| …:2026-10-13-r4-16-frontier-rescan.md:183 | screen / same-surface / cdp-runtime-observation | "observe-web-session` / `observe-web-execution" are queued on "CDP endpoint :9222 self-launch | chromium headless", the same kaidoku-side CDP endpoint ground PROVINCE.md:9 rules on. |
| …:2026-10-13-r4-16-frontier-rescan.md:185 | screen / same-surface / cdp-runtime-observation | The three verbs bind to a "CDP target" on the same self-launched endpoint, i.e. the target-listing ground the kaidoku `cdp-runtime-observation` row already verifies against PROVINCE.md:9. |
| …:2026-10-13-r4-16-frontier-rescan.md:264 | screen / same-surface / cdp-runtime-observation | The r5-queue summary names "the CDP/V8 self-launch family" among kaidoku's own 26 self-provisionable ops, no side claimed against tabi's PROVINCE.md:9 CDP surface. |
| …:2026-10-13-r4-16-frontier-rescan.md:521 | screen / same-surface / recorded-har-producer-channel | kaidoku records that "a real 1,310-event chromium `--log-net-log` capture" failed its own HAR-schema gate, a fact on kaidoku's side of the producer-channel row whose tabi side (SKILL.md:2958) admits a HAR only when its producer is named. |
| …:2026-10-13-r4-16-frontier-rescan.md:524 | screen / same-surface / recorded-har-producer-channel | "the path that works is playwright 1.64.0" names the producer tool of kaidoku's HAR channel — exactly the producer-naming condition SKILL.md:2958 states. |
| …:2026-10-13-r4-16-frontier-rescan.md:525 | screen / same-surface / recorded-har-producer-channel | "`recordHar` over self-launched `/usr/bin/chromium` 152" is the producer/engine pair already covered by the recorded-HAR row (SKILL.md:2958). |
| …:2026-10-13-r4-16-frontier-rescan.md:561 | screen / same-surface / cdp-runtime-observation | The line reports a defect in kaidoku's own census ("lists only the r3 CDP verbs"), internal bookkeeping over the CDP verbs PROVINCE.md:9 rules as kaidoku's provider surface. |
| …:2026-10-13-r4-16-frontier-rescan.md:568 | screen / same-surface / cdp-runtime-observation | kaidoku re-runs its four CDP verbs on "loopback-only self-launched endpoints (chromium 152 headless :9222", the endpoint/liveness ground of the existing `cdp-runtime-observation` row against PROVINCE.md:9. |
| …:2026-10-13-r4-16-frontier-rescan.md:612 | screen / same-surface / cdp-runtime-observation | "9222/9229/9230/8878 verified closed and the chromium profile removed" is run cleanup on kaidoku's own self-launched endpoints, the same CDP-endpoint surface PROVINCE.md:9 owns. |
| …:2026-10-13-r4-16-frontier-rescan.md:666 | screen / same-surface / cdp-runtime-observation | The capture ran on "self-launched chromium 152 :9232 + loopback http.server", a kaidoku-side self-launch fact under the ruled CDP/provider split. |
| …:2026-10-13-r4-16-frontier-rescan.md:676 | screen / same-surface / cdp-runtime-observation | "`REA_BROWSER_EXECUTABLE=/usr/bin/chromium`" is kaidoku's own env gate for the browser its REA verb launches; the browser-inventory question stays on tabi's side of PROVINCE.md:9's split, and no side word appears in the line. |
| …:2026-10-13-r4-16-frontier-rescan.md:677 | screen / same-surface / cdp-runtime-observation | "`chromium-native-module-resolver` 152.0.7977.82" is the engine identity of kaidoku's REA provider surface, not a claim on tabi's runtime-evidence discipline. |
| …:2026-10-13-r4-16-frontier-rescan.md:678 | screen / same-surface / cdp-runtime-observation | The nested contract ("executes only a trusted REA resolver stub in an") bounds REA's own verb on kaidoku's side; its "owned context" sits on the next line and no single-line quote can carry both browser ground and a side word, so the line cannot be a truthful map row. |
| …:2026-10-13-r4-16-frontier-rescan.md:719 | screen / same-surface / cdp-runtime-observation | "ports verified closed and the chromium profile" is the cleanup half of the same self-launched runs, the endpoint/profile ground PROVINCE.md:9 rules. |
| …:2026-10-13-rea-cli-surface.md:94 | screen / same-surface / cdp-runtime-observation | A help-text census lists "capture-browser-scenario via Playwright, inspect-web-*, CDP target listing" among many verb families and claims no browser-ground side; the CDP-target ground is the same surface the kaidoku row already owns against PROVINCE.md:9. |
