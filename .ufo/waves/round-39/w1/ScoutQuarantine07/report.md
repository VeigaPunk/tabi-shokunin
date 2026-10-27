# ScoutQuarantine07 — quarantine hand-check

## Frozen context
Observed claims.json declares round 39, freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81d196caeb8d24551928b883802697aabb`; C1 coverage capability and C2 calibration. Read frozen counter sources `c1-egress-session-bound.mjs` and `c2-routed-defects-v2.mjs` before the source check.

## Lane extraction
Required extraction command:
`awk -F'|' '/^\\| `tabi` / {print}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
It returned 37 `tabi` rows. Deterministic rows 7-8 of 8 are S117 and S118 (round1), not the nominal requested ids S164, S165, S166, S167, S174. Actual assigned rows are reported; nominal ids are still hand-checked below, with S174 the only nominal id located in the extracted `tabi` lane rows. No row omitted silently.

## Exact fetch observations (curl commands)
Each cited URL was fetched with `curl -L --max-time 20 -sS -D <id>.h <URL> -o <id>.body`; each ended HTTP/2 200:
- S164 `https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn` — 132978 bytes.
- S165 `https://googlechromelabs.github.io/webmcp-tools/demos/explainer/` — 19717 bytes.
- S166 `https://weel.co.jp/media/tech/webmcp/` — 299170 bytes.
- S167 `https://claude.com/ja/marketplace/connectors/webmcp-evaluator` — 381413 bytes.
- S174 `https://fullstackladder.dev/blog/2026/07/15/webmcp-basic-concepts/` — 605319 bytes.

Exact search command was `grep -Fqi <phrase> <id>.body` on the fetched bodies. Results:
- S164 quote `With the extension, you can:` — MATCH. Classification: present. Registry quote found in cited source; no anchor was recorded in the register, and no stable anchor was established in this check.
- S165 quote fragment `verification environment` — ABSENT. Classification: absent (fabrication candidate supported by successful fetch; register's quote is a longer combined span mentioning verification environment/flag and same-description tools). No registry quote located; exact anchor unavailable.
- S166 quote `evaluate_webmcp` — ABSENT. Classification: absent (fabrication candidate; successful fetch). No registry quote located; exact anchor unavailable.
- S167 quote `予測可能で機械可読なシグナル` — ABSENT. Classification: absent (fabrication candidate; successful fetch). No registry quote located; exact anchor unavailable.
- S174 quote `敏感動作留一道人工關卡` — ABSENT. Classification: absent (fabrication candidate; successful fetch). No registry quote located; exact anchor unavailable.

Limit: this was literal phrase matching in downloaded bodies, not manual inspection of rendered source or alternate representations. Thus the absence labels are hand-check findings for the fetched representation, not proof across companion URLs/local artifacts. S165's multi-part quote was represented only by the first short fragment in this probe. The register row itself supplies the exact URLs and quote spans; no separate registry entry or local artifact was fetched. Actual assigned S117/S118 were not fetched in this attempt.

VERDICT finding — nominal rows S165-S167 and S174 absent in fetched source representations; S164 present; actual deterministic rows S117/S118 remain unverified.
