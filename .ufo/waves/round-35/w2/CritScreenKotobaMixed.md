# CritScreenKotobaMixed — wave 2 seat report (C1 screen attack, lanes kotoba|kama|mori|chousa|tameshi)

## Verdict

**Holds.** All 33 C1 screen rows in my lane scope (kotoba 20, kama 9, mori 2, tameshi 1, chousa 1) survive attack: 33/33 verdict `ok`, 0 `relabel`, 0 `should-map`. Every screen reason was checked against the decision rule (SKILL.md:2861-2881) at the sibling line's frozen pin, and every `same-surface` row was checked against the actual kama map row (`cdp-live-target-census`, adjacency.tsv line 11) rather than a label reuse: all five kama same-surface rows are the same 9222-CDP-census object the map row dispositions contested-open (one of them, listener-census.md:356, is the tail of the very item the map row cites at :355). No sibling line in scope states its own side of ground on a tabi PROVINCE surface that no existing row answers; the closest candidates (kama consumer-registry.md:236 webbridge-daemon liveness row; kama listener-census.md:356 "any local process can drive a logged-in browser"; tameshi gates-survey-kagi.md:287 musketeer-profile miss) are each explicitly disclaimed / same-item / another-lane's-gate-output respectively, so no map row draft is warranted. No severity, no defect found.

## Evidence

Commands (all exit 0):

1. Candidate extraction from the frozen ledger:
   `node -e '…' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen-browser.tsv` → wrote `targets.json` with 33 rows (key/reason/surface/quote/note). `count 33`.
2. Pin-context dump (sibling repos read-only):
   `node -e '…'` over `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path>` per target (±8 lines around each line). All `git show` status 0; no ERR lines. Output `contexts.txt` (55,239 chars).
3. Quote/surface mechanical check:
   `node -e '…'` → `OK quote_verbatim=true` for 33/33 rows; `surface_check=MAP-ROW-EXISTS` for all 5 same-surface rows; `total 33 ok 33 bad 0`.
4. Verdicts + counts:
   `node -e '…'` → `verdicts.tsv` (33 rows); `awk` counts → `ok 33`; by reason `not-browser-sense 16, third-lane-report 10, no-claim-declared 2, same-surface 5`.

Line-by-line judgments (key → decision-rule step):

- chousa `archived-export-intake.md:141` (no-claim-declared): AP-03 approval row denies "browser, CDP, profile, session or credential reads of any kind" in-row; step 4 (explicit non-goal). ok.
- kama `consumer-registry.md:61` (not-browser-sense): deletion inventory; `~/.omp/agent/skills/kimi-webbridge` listed among dead consumer files; step 1. ok.
- kama `consumer-registry.md:236` (no-claim-declared): under heading "Recorded for completeness; **not** kama's serving surface, and deliberately not given a model verdict" (:230-231); liveness-only probe row (daemon DEAD); step 4. ok.
- kama `consumer-registry.md:277` (same-surface cdp-live-target-census): `# → 9222 code=404 ct=text/html (CDP; FOREIGN_SERVICE for model purposes)` — same 9222 CDP probe object the map row dispositions contested-open; step 2. ok.
- kama `consumer-registry.md:325` (not-browser-sense): config-grep search-root row; `agents/musketeer.md` is an agent config filename; step 1. ok.
- kama `consumer-registry.md:332` (third-lane-report): counts hits inside other lanes' text (kotoba/kake/kagi/ufo) — a census of sibling records, never kama's own side (QUALITY 97); step 3. ok.
- kama `endpoint-identity.md:125` (same-surface cdp-live-target-census): "Chrome DevTools at `9222` answered `200 text/html` with an empty body" — same 9222 observation as anti-pattern specimen; step 2. ok.
- kama `listener-census.md:241` (same-surface cdp-live-target-census): `# C12 — chrome devtools` section label of the very 9222 CDP probe block owning the mapped surface; step 2. ok.
- kama `listener-census.md:243` (same-surface cdp-live-target-census): cmdline read `--remote-debugging-port=9222` inside the same C12 block; step 2. ok.
- kama `listener-census.md:356` (same-surface cdp-live-target-census): tail of out-of-province item 2 whose head (:355) is the **exact cited line** of the map row; item marked Report-only; step 2 (no second row for an answered surface). ok.
- kotoba `agent-def-audit-round6.md:23/:56/:76` (not-browser-sense): AD matrix cell / enrollment / fidelity row — `musketeer` is an agent-definition name; step 1. ok.
- kotoba `agent-defs-commands-and-round-prompts.md:36` (not-browser-sense): dispatch-prompt census; musketeer one of four omitted agent files; step 1. ok.
- kotoba `harness-router-models-round9.md:28`, `harness-verifier-round10.md:91/:103` (not-browser-sense): cache-key style / offer-gate root lists; `kimi-webbridge` is a skill name; step 1. ok.
- kotoba `opencode-offer-trace-round8.md:216/:217/:237` (not-browser-sense): offered-name-set reconstruction; historical/telemetry, no browser use; step 1. ok.
- kotoba `sibling-description-rewrites-round8.md:129/:135/:155/:163/:164/:208/:209/:236` (third-lane-report): all inside kotoba's rewrite package for kagi/kake (`description:` drop-ins); they measure/quote/arbitrate other lanes' text, never state kotoba's own side; step 3. ok.
- kotoba `trigger-miss-proxy-round6.md:45/:80` (not-browser-sense): trigger-miss proxy statistics/read for the webbridge skill; telemetry, no browser craft; step 1. ok.
- mori `observability-census-r1.md:142/:145` (not-browser-sense): journal kill-attribution finding; webbridge daemon named only to be excluded; step 1. ok.
- tameshi `gates-survey-kagi.md:287` (third-lane-report): breadth-audit output line (`SCOPE BREADTH-HOST-MISSING $HOME/.local/share/the-musketeer/chrome-profile`) from kagi's gate captured in tameshi's survey of kagi's gates; reports another lane's finding, not tameshi's own side (QUALITY 97); step 3. ok.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/CritScreenKotobaMixed/verdicts.tsv` — 33 rows: `key | verdict | correct reason+surface | one-sentence ground`.
- This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/CritScreenKotobaMixed.md`.
- Scratch evidence (deleted at yield): `$HYAKU_SCRATCH/tabi-r35/CritScreenKotobaMixed/{targets.json,contexts.txt}`.
