# ConnMissedBoundaries — wave-2 second independent C1 boundary hunt (round 35)

Seat: ConnMissedBoundaries (leaf). Item: second independent hunt for missed C1 boundaries over the
382 screens of `corpus/adjacency-screen-browser.tsv` at the wave-1 integration `083c5c643be7aa5965a5de3458a32ed0d289ead3`, clustering by (sibling, surface) and probing every screened line for a claim of operation on tabi PROVINCE ground. Attack target: the C1 claim (newMapped >= 2) and the w1 ConnBoundaries conclusion that no clean new row exists.

## Verdict

**Holds (no defensible new boundary; the claim stays false by construction — severity of the hunt finding: none).** A full second pass over all 382 screens — every ref resolved to its frozen candidate, every quote verified as a verbatim substring, every same-surface anchor verified against a checked map row of that sibling — finds no screened line that states a sibling's side of a real split on tabi PROVINCE ground that an existing verified row does not already answer. The 225 same-surface screens all sit on their sibling's own side of an already-mapped split (QUALITY 91); the 30 third-lane records report other lanes' bytes (n3); the 8 no-claim rows are refusals/non-claims; the 119 not-browser-sense rows are carrier binaries, theme files, OOM/journal subjects, property names and audience classes. w1 ConnBoundaries' "no clean new row" verdict therefore survives, and the single integrated row `cdp-bridge-vault-dom-refusal` (row 18) is the only honest new row; `newMapped 1 < 2` is a true negative, not a miss. Two **ledger-hygiene defects (severity: low, counts unaffected)** are reported below: (D1) three kagi screens anchor to `secrets-vault-ops` although the new row 18 now owns the exact surface; (D2) kaidoku `r11-01-queue-ops.md:63` is screened `third-lane-report` where its honest reason is `same-surface cdp-runtime-observation` (REA is a tool, not a lane).

## Evidence (commands, exit codes, file:line)

- Frozen C1 counter (bytes equal frozenDigest `5707a937...`), run on the wave-1 integration in a shared clone (contract command): `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1**; output: `adjacency {verdict:"clean",rows:17,verified:17,findings:0}`, `candidates 383`, `mapped 1`, `screened 382`, `unaccounted 0`, `newMapped 1`, `newMappedRows:[{row:18,surface:"cdp-bridge-vault-dom-refusal",sibling:"kagi",disposition:"split-declared"}]`, `screenFindings:[]` (full JSON: `w2/ConnMissedBoundaries/counter-083c5c6.json`). Predicate false at integration, consistent with the frozen target (newMapped >= 2) not being met.
- Independent ledger audit (scratch `analyze.py`–`analyze5.py`, outputs in `w2/ConnMissedBoundaries/`):
  - screens 382; reason counts `same-surface 225, not-browser-sense 119, third-lane-report 30, no-claim-declared 8` — exact match to the integration facts;
  - 0 screen refs missing from the frozen candidate set; 0 quotes that are not verbatim substrings of the candidate line; 0 quote-shape violations under the counter rule (4–25 words / ≥20 non-space, or whole trimmed line ≤25 words);
  - same-surface cluster table: kagi 35 × `musketeer-cdp-9222-profile-lease` + 3 × `secrets-vault-ops`; kaidoku 81 × `cdp-runtime-observation` + 26 × `recorded-har-producer-channel` + 2 × `reverse-engineering-of-shipped-artifacts` + 1 × `screenshot-pair-compare-semantics`; kake 7 × `musketeer-cdp-9222-profile-lease` + 3 × `crawler-discipline-vs-publishing` + 1 × `js-rendering-browser-execution` + 1 × `lab-performance-tool-runs`; kama 5 × `cdp-live-target-census`; kumitate 60 × `kimi-webbridge-plugin-internals`;
  - 0 same-surface screens whose `surface` cell names a row that is not a verified map row of the same sibling (counter's same-surface screen rule satisfied everywhere);
  - 58 screened candidate lines carry SIDE+BG lexemes; each was individually classified (below) — none is a defensible new row.
- Per-sibling reason matrix (computed, `analyze5.py`): totals per sibling: chousa 0/0/0/1; kagi 38/8/8/1; kaidoku 110/15/12/0; kake 12/37/0/2; kama 5/2/1/1; kotoba 0/12/8/0; kumitate 60/6/0/0; mado 0/17/0/3; mori 0/2/0/0; tameshi 0/0/1/0; tsukuroi 0/20/0/0.

## Why each strongest candidate is not a new row

### Closest miss 1 — kumitate `kimi-skills-plugins.md:486` (screened same-surface `kimi-webbridge-plugin-internals`)
- Quote (verbatim, at pin 8d557f85): `**Local daemon endpoint** declared by the managed plugin: \`http://127.0.0.1:10086\` (WebBridge drives Chrome/Edge over CDP via a browser extension). → **kama (endpoints).**`
- Surface: kimi-webbridge plugin (PROVINCE.md:6-7); CDP session discipline (PROVINCE.md:9).
- Why not a new row: the sentence is one routing line of kumitate's plugin-internals census (neighbors route OMP substrate, credentials, model data to other lanes), and the internals split row 10 already routes the whole plugin-documentation surface to tabi. The quote carries **no SIDE lexeme** ("drives", "→" are outside SIDE; "declared" is not), so a split-declared row fails n4 mechanically; a contested-open row would require an L0 question this seat cannot write. Same-surface is the only defensible placement.

### Closest miss 2 — kama `listener-census.md:356` (screened same-surface `cdp-live-target-census`)
- Quote (verbatim, at pin e8fa87ef): `` `gemini.google.com` (`the-musketeer` profile). Any local process can drive a logged-in browser. ``
- Surface: browser inventory + profile surfaces, shape-only census (PROVINCE.md:8); CDP session discipline (PROVINCE.md:9).
- Why not a new row: line 356 is the tail of the same out-of-province item 2 whose head (line 355) is the cited line of the contested `cdp-live-target-census` row (item header "2. `127.0.0.1:9222` — Chrome DevTools protocol, 21 live targets …; item mark "Report-only", routed away at :357). The security property (drive-ability of the logged-in musketeer profile) is a report-only observation on the contested lease/census ground, not kama's side of a split; the quote carries no SIDE lexeme ("drive"/"logged-in" are outside SIDE). Same-surface is correct.

### Closest miss 3 — kake `ops-automation.md:78` (screened same-surface `musketeer-cdp-9222-profile-lease`)
- Quote (verbatim, at pin 044048597d): `| \`auth [--json]\` | surface matrix: CDP, grok/kimi tabs, grok CLI, grok-bot app, origin | free |`
- Surface: CDP session discipline (PROVINCE.md:9).
- Why not a new row: kake's only documented CDP ground is the shared burner chrome at 127.0.0.1:9222 (`ops-automation.md:79` lease verb; `publish-queue.md:29,131` "CDP :9222 was down r13"), i.e., kake's own side of the already-mapped contested lease row — a fact on the sibling's own side of an already-mapped split is a screen whatever its surface name (QUALITY 91). The quote also carries no SIDE lexeme ("free"/"matrix"/"auth" are outside SIDE), so an n4-eligible split row is impossible; the only alternative (L0 contested-open) is not this seat's to write.

### Honorable mention — kaidoku `r11-01-queue-ops.md:63` (screened `third-lane-report`)
- Quote (verbatim, at pin 49096c7e): `## Candidate: row 22's gate refinement — \`trace-web-module-imports\` refuses typed without \`REA_BROWSER_EXECUTABLE\` (invisible in the 18-op capability matrix); the caller-supplied chromium runs only a REA resolver stub, and with the host-present binary the gate is zero-provisioning, no-key env`
- This is the mechanically n4-eligible line (SIDE "refuses" + BG "chromium"), but it describes kaidoku operating Chromium inside REA's provider frame for shipped-artifact analysis — a fact on kaidoku's own side of the ruled `cdp-runtime-observation` split (round-16 spotcheck:142: "kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis"). Per QUALITY 91 it is a screen, and its honest reason is `same-surface cdp-runtime-observation`. **D2:** the integrated `third-lane-report` label is the wrong reason (REA is a tool/provider, not a lane; the sentence is kaidoku's own operation), though the count is unaffected. The same mislabel applies to the run-log companions at `:68,74,77,83,91,101,108,280,310` (all receipts of REA's gate, not other lanes' work).

## New-row audit (the one integrated row)

Row 18 `cdp-bridge-vault-dom-refusal` (kagi, split-declared, tabi declaration `SKILL.md:2970`) survives every gate check and the overlap test: n1 (new tabi line naming sibling and path), n2 (kagi `SKILL.md:40` uncited at baseline), n3 (SKILL.md path, not third-lane), n4 (sibling quote carries BG `musketeer` + SIDE `refusal`), and the split is real — kagi refuses `open-popup` and bans vault-DOM scraping; tabi declares its CDP discipline never reads a vault DOM or session value. No withdrawal argument found; this row is the correct and only honest new row.

## Ledger-hygiene defect D1 (low, counts unaffected)

Kagi `corpus/knowledge/cdp-bridge-1password.md:57/:60/:87` — `## \`cdp-bridge open-popup\` is refused by design`, `` the-janitor: open-popup is human/CDP UI — use agent-browser; will not scrape vault DOM ``, `` \`the-janitor cdp-bridge open-popup\` exits 2 with the quoted refusal. Neither `` — are screened `same-surface secrets-vault-ops` (screen rows 36, 37, 41), although map row 18 `cdp-bridge-vault-dom-refusal` now owns precisely that surface (the open-popup refusal and the vault-DOM ban). Under decision-rule step 2 (SKILL.md:2868-2869) the `surface` cell should repeat **row 18's** surface for these three lines; the `secrets-vault-ops` anchor (a refused-route row on vault ops broadly) predates row 18 and was not updated at integration. This changes no count (`unaccounted 0`, `newMapped 1` both stand; the counter accepts any verified same-sibling row as anchor) but leaves the new row with zero visible companion screens on its own surface. Reported as a finding; seats do not repair.

## Deliverables

- This report: `.ufo/waves/round-35/w2/ConnMissedBoundaries.md`
- Output dir (scripts + evidence): `.ufo/waves/round-35/w2/ConnMissedBoundaries/analyze.py`, `analyze2.py`, `analyze2.out`, `analyze3.py`, `analyze4.py`, `analyze5.py`, `counter-083c5c6.json`
