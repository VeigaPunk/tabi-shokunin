# tabi — round 17 report (hyaku phase 2, attempt 1) — DRAFT

DRAFT by TabiR17.DraftReport (wave 2). Not the shipped report. `<<…>>` = placeholder that L1 fills at integration. Scribe did not write LOG, SCORECARD, SKILL, PROVINCE, QUALITY, lessons, measurements.json, or any commit.

Placeholder keys: `<<B>>` = L1 integration commit (LOG, SCORECARD, SKILL, QUALITY, lesson, `corpus/evidence/round-17/measurements.json`, binding manifest, `ROUND_SCRIPT_*` re-pin if not already in place); `<<C>>` = delivered-tip binding commit (`binding/check.json`); `<<TIP>>` = lane tip after `landed <hash>`.

Lane tip `<<TIP>>` (pushed, `origin/master`, ahead `<<n>>`, clean). Reads at this draft: `git rev-parse HEAD` = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (detached, jj-owned; not the branch name). `jj-lane.sh state` not run by this seat. Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. Measured revision `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (wave-1 landing; `git rev-list --count 5859243…..6c97851…` = 1).

## Work performed

Declared claims (3):
- **C1 — operability 8 (lowest non-retired tie with depth/freshness/adjacency):** jj-anchor-safe gate entry points 0→4 of 8 behavior-bearing (4 label-only, not credited). Fixes the lane-tip anchoring defect (`PLAN.md:16-23`, `:56-85`).
- **C2 — coverage 9 + capability `webmcp-cdp-invocation`, sourced:** held WebMCP-invocation entries 0→1 on Chromium 154.0.8037.97, loopback fixtures, flags on. Rests on S041–S048 (mined, tier A), cited by `corpus/knowledge/webmcp-invocation-round-17.md` `source:` header.
- **C3 — adjacency 8 (lowest tie):** verified adjacency dispositions 0→9 (`ruled` 1, `split-declared` 2, `refused-route` 4, `contested-open` 2), `corpus/adjacency.tsv`.

Work items:
- C1 gates (wave 1, commit `6c97851`): `scripts/check-round-contract.mjs` (+303/−), `scripts/check-user-round-contract.mjs` (+228/−), `scripts/check-measurement-binding.mjs` (+132/−), `scripts/selftest-measurement-binding.mjs` (+124/−). Lane-tip anchor per `PLAN.md:58-82`. `git diff --stat 5859243 6c97851`.
- C1 counter v2 `.ufo/waves/round-17/measure-c1.mjs`: 8 entries, per-entry poison, arm B2, label-only reported not credited (`w1/C1Counter.md:64`, `:113`). Harm and site inventory: `.ufo/waves/round-17/c1-sites.json`, `harm-baseline.json` (`w1/C1SiteInventory.md`, `w1/HarmBaseline.md`).
- C1 identity chain: `scripts/check-user-round-contract.mjs:35` `ROUND_SCRIPT_CURRENT_SHA256` = `1579a794…`, equal to `sha256(git show 6c97851:scripts/check-round-contract.mjs)`; round-14 identity `8a573b4e…` archived at `:36-40`. The PLAN (`PLAN.md:83-85`) reserves this re-pin for L1 integration; it is already in the M blob (see Disclosed limits).
- C2 harness `scripts/webmcp-invoke-round17.mjs` (2127 lines; sha256 `de62820d…`, equal to `receipt.json` `producerSha256`). Fixtures `corpus/evidence/round-17/webmcp-invoke/fixtures/` (7 files).
- C2 receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json`: `verdict: pass`, `summary.cases 11`, `passed 11`, `failed 0`, `missing 0`, `caseSetOk: true`; `controls` `[0,1,2,3]`; `runs` 3; `loopback.externalRequestCount` 0. Stdout `receipt.stdout.txt`.
- C2 failing history kept: `corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json` (`verdict: fail`, `failed: 2` of 11). Filename differs from the PLAN's `receipt-first-run-failed.json` (`PLAN.md:127`).
- C2 note `corpus/knowledge/webmcp-invocation-round-17.md` (126 lines): `source:` S041–S048 header, `verified-at: 2026-10-20`, `recheck:` line. Decision table and limits: `<<L1 confirm sections>>`.
- C3 map `corpus/adjacency.tsv` (header + 9 rows, 9 columns, TAB-separated); checker `scripts/check-adjacency.mjs` (1667 lines); counter `.ufo/waves/round-17/measure-c3.mjs`; wave-1 rows `.ufo/waves/round-17/adjacency/*.tsv`.
- Routed defects (`corpus/lessons/round-16-verifier-spotcheck.md:146-157`):
  1. liar probe: `corpus/evidence/round-17/routed/liar/` (`generate.mjs`, `originals.bundle`, `blobs/`, `receipt.json` verdict `pass`, `run.stdout.txt`).
  2. pre-hardening receipts: `corpus/evidence/round-17/routed/binding-hardened/` (`selftest.json`: `cases=59 reasons=13`, `gateSha256 1f84fb54…`; `legacy-r15.json`; `index.json` history label).
  3. delivered-HEAD receipt at `1205d26`: `binding-hardened/check-at-1205d26.json` (`MEASUREMENT_BINDING verdict=clean claims=2 bound=2`). Round-end tip receipt: `<<C>>`.
  4. census U3 pointer: `corpus/README.md:334-345` index row (`knowledge/browser-surface-census.md:188` → `README:295-305`, `:307-314`).
  5. integrator ruling: `corpus/adjacency.tsv` row 1 (`cdp-runtime-observation`, `kaidoku`, `ruled`, `ruling_ref` `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:142`). Open findings in `w1/RevKaidokuRuling.md` (see Disclosed limits).
- Routed `:76` ("unforgeable"): QUALITY criterion and lesson mistake row `<<B>>`.
- README: `corpus/README.md` +47 lines, round-17 section at `:316`. SOURCES +16 lines (13 new rows S041–S053, 0 removed).
- Lesson `corpus/lessons/round-17.md`: `<<B>>`. Not present at `6c97851` (name-only diff of `5859243..6c97851` excludes it).

Frontier bullet: `Native WebMCP in chromium 152 — unprobed (census U3)` stays open for 152; held for Chromium 154 only (`corpus/README.md:35`, `:297`). Real-site WebMCP, agent-side consumption and Chromium 152 remain open.

## Landed changes

| Commit | Change | LOG.md entry |
|---|---|---|
| `6c97851` (author `tabi-shokunin <tabi@shokunin.local>`, 2026-10-20 12:31:11 -03) | C1 gates + selftest, C2 harness/fixtures/receipt/note/preflight history, C3 `adjacency.tsv` + checker, routed liar/binding-hardened evidence, SOURCES S041–S053, README append, wave-1 evidence (`.ufo/waves/round-17/w1/`, `adjacency/`) | `<<B>>` (not yet written at `6c97851`) |
| `<<B>>` | L1 integration: LOG, SCORECARD, SKILL, QUALITY, lesson, `measurements.json`, binding manifest; `PROVINCE.md` not appended (census-frozen, `PLAN.md:201-203`) | `<<B>>` |
| `<<C>>` | delivered-tip binding receipt `corpus/evidence/round-17/measurement-binding.json` + `check.json` | `<<C>>` |

`<<landed hash>>` is the only cited hash for the report commit, per `jj-lane.sh` rule. Author identity and pathspec-limited adds: `<<confirm at L1>>`.

## Before → after measurements

| Claim | Counting command (lane root) | Before @ `5859243` | After @ `6c97851` |
|---|---|---|---|
| C1 | `node .ufo/waves/round-17/measure-c1.mjs REV` | exit 0, `c1_anchor_safe: 0` of 8 (all 8 entries fail: `ab_exit_or_output_differs`, `gate_static_head_residue`) | exit 0, `c1_anchor_safe: 4` of 8 behavior-bearing; `label_only`: `round-contract-count-witness`, `user-contract-witness`, `user-contract-count-witness`, `user-contract-diagnostic-witness` (not credited) |
| C2 | `node .ufo/waves/round-17/measure-c2.mjs REV` | exit 0, `c2_invocation_held: 0` (failures: note absent, README row absent, receipt absent) | exit 0, `c2_invocation_held: 1`, `failures: []`, `cited: S041…S048` |
| C3 | `node .ufo/waves/round-17/measure-c3.mjs REV` | exit 0, `c3_adjacency_verified: 0`, `rows: []` | exit 0, `c3_adjacency_verified: 9`, `by_disposition: {contested-open 2, ruled 1, split-declared 2, refused-route 4}` |

- Counter file sha256 at `6c97851` (`git show 6c97851:<path> | sha256sum`): `measure-c1.mjs` `47185c8c…`, `measure-c2.mjs` `2cba594b…`, `measure-c3.mjs` `8dec4972…`.
- Counts observed by this seat (read-only, counter clones only); raw JSON in the counters' own stdout (`w1/C1Counter.md`, `w1/C2Counter.md`, `w1/C3Counter.md`). `<<L1 re-run and paste argv + exit>>`.
- Delivered-HEAD binding: `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-17/measurement-binding.json --at <<TIP>> --reproduce` → `<<expected MEASUREMENT_BINDING verdict=clean claims=3 bound=3>>` (`<<C>>`).
- History, not this measurement: C1 at intermediate `7babdfd` counted 4 behavior-bearing (`w1/C1Counter.md:113`); C2 preflight-smoke failed run (`preflight-smoke-failed.json`, 2 of 11 failed); C3 `ruling_authority: "self"` on the `ruled` row (see Disclosed limits).
- No-harm checks at the delivered HEAD: `<<check-round-contract, check-user-round-contract, check-freshness --worktree, check-sources, harm rows 1–9 from harm-baseline.json>>`. Pre-existing red, unchanged: user contract `Found 6 user rounds, expected 10` (`w1/ConnTrendsHarm.md:86-89`, `SCORECARD.md:744`).
- No scalar moves. (Claim scalars: operability 8→8, coverage 9→9, adjacency 8→8; `PLAN.md` pre-registration `w1/ConnTrendsHarm.md:86-91`.)

## Sources & frontier

- Rows 40→53. Counting command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit 0. Tuple counted from `corpus/SOURCES.md` rows `grep '^| S0'`: start `A31/B4/C5`, `mined33/queued2/rejected5`; now `A43/B4/C6`, `mined41/queued6/rejected6`.
- Added by tier: A 12 (S041–S052), C 1 (S053 rejected: `tool | C`, Chrome Web Store inspector; status `rejected`).
- Touched old→new: none (0 removed lines in `git diff 5859243 6c97851 -- corpus/SOURCES.md`). S049–S052 stay `queued` (`PLAN.md:217-218`).
- Frontier advanced: S041–S048 cited by the C2 note; adjacency rows 9 (`ruled` 1, `split-declared` 2, `refused-route` 4, `contested-open` 2).
- Mistake mined: `<<L1 lesson ## Mistakes row>>`. Sourced claim: C2, note `source:` S041–S048.

## Trend verdicts

- **expansion: `<<improved | unchanged>>`.** Evidence: `<<knowledge notes count before/after; capability webmcp-invocation enters>>`. External limit: `<<real-site WebMCP and Chromium 152 unprobed>>`.
- **quality: `<<improved | unchanged>>`.** Evidence: `<<counts digest-bound at delivered tip; preflight failure kept>>`. External limit: `<<outside spot-check not yet run>>`.
- **discernment: `<<improved | unchanged>> (author-side).`** Evidence: `<<RevKaidokuRuling ISSUES P1–P3 disposition>>`. External limit: `<<outside admit/reject agreement absent>>`.

## SHONEN

- [~] Decision tables, error patterns, checklists with cited sources — `SKILL.md` `<<round-17 section>>`; `corpus/knowledge/webmcp-invocation-round-17.md` decision table (no non-author verifier)
- [~] End-to-end domain task executed and logged — `corpus/evidence/round-17/webmcp-invoke/receipt.json` 11/11, `LOG.md` round-17 entry `<<B>>` (no non-author verifier)
- [~] Instructions executable without oral context — note recheck procedure; `SKILL.md` gate registry row `<<B>>` (no non-author verifier)
- [~] No cross-domain bleed, PROVINCE accurate — `PROVINCE.md:3-19`; kaidoku CDP overlap recorded `ruled` in `corpus/adjacency.tsv` row 1; musketeer lease `contested-open` (`corpus/adjacency.tsv`, fleet `.ufo/l0-questions.md:62`) (no non-author verifier)

Source of the four lines: `SHONEN.md:5,7,9,11` (byte-unchanged `5859243..6c97851`, `git diff --stat` empty). The SHONEN text above keeps the file's own criteria and pointers; the four `[~]` boxes stay `[~]`.

## Round mechanics and extras

- **Waves:**
  - **Wave 1: 86 seats.** Attempt 1 refused 86; attempt 2 spawned 86 (`.ufo/waves/round-17/w1/dispatch-attempts.json`). Role tally: `<<seat tally>>`. The r16 command `jq -r '.details.progress | group_by(.agent)…' w1/dispatch-result.json` returns `null` for this run (`w1/dispatch-result.json` has no `.details.progress`); derive from the spawned list (`w1/dispatch-attempts.json`, attempt 2 `result` text) or assignments. Wave 1 dead seats: `<<not checked by this seat>>`.
  - **Wave 2:** `<<seat count, role tally>>`. This seat (`TabiR17.DraftReport`) is a leaf scribe.
  - **Round total:** `<<n>>` seats.
- **Misroot sweep:** `<<not run by this seat>>`.
- **Contested scope (adjacency):** musketeer CDP 9222 profile lease (kagi/kake) — fleet `ebeb396` `.ufo/l0-questions.md:62`; the two `musketeer-cdp-9222-profile-lease` rows are `contested-open` in `corpus/adjacency.tsv` and stay open until ruled. kaidoku `:53` CDP row `ruled` (row 1); `RevKaidokuRuling` requires a second `:128` row and wording fix (below).
- **Inherited state:** lane was `5859243` at dispatch; no earlier round-17 attempt. `<<confirm>>`.
- **Carried debt:** protocol step-1/step-4 closure-checker certification; USER 6/10; r07 replay; user-record freezing; IPv6; Git env; validator pin (carried from round 16, `.ufo/reports/round-16/tabi.md:140-141`). Round-17 routed debt: `<<e.g. C3 ruling findings P1–P3>>`.
- **Disclosed limits:**
  - the counters run revision code unsandboxed inside clones only (`measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`); this seat ran them read-only.
  - C3 `ruled` row 1 has `ruling_authority: "self"` (`measure-c3.mjs` output; `w1/C3Counter.md`). PLAN `:145-146` admits a `ruled` venue only as fleet or a non-tabi-authored spot-check line; the ruling is `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:142`, a tabi-repo path. `<<L1 decide: re-point to fleet or declare>>`.
  - `w1/RevKaidokuRuling.md` verdict ISSUES: P1 the AdjKaidoku scout pin recipe `rev-parse master` returns rc 128 for kaidoku (use `refs/heads/main` or `9011581d…`); P2 the ruling covers `kaidoku PROVINCE.md:53` only, a second live row `:128` (`observe-web-session`, `observe-javascript-runtime`, …) is unrecorded; P3 `:142` wording is present-tense and false at the pin (use constraint `:152`). `<<L1 disposition>>`.
  - `ROUND_SCRIPT_CURRENT_SHA256` already re-pinned in the M blob (`scripts/check-user-round-contract.mjs:35`, `1579a794…`) although `PLAN.md:83-85` reserves it for L1 integration. Pin equals `sha256(check-round-contract.mjs @ 6c97851)`; round-14 `8a573b4e…` archived at `:36-40`. `<<L1 confirm the ownership deviation is acceptable>>`.
  - The receipt filename `preflight-smoke-failed.json` differs from `PLAN.md:127`'s `receipt-first-run-failed.json`. `<<L1 rename or record>>`.
  - The r16 carried limits: counter runs revision code unsandboxed; confinement is page-level only (WebRTC, WebTransport, SharedWorker not confined); protocol-capture profile leaks one temp dir per run; producer of the 8/11 pre-commit run not retained (`.ufo/reports/round-16/tabi.md:142-146`).
- **L0 questions:** one tabi question open: fleet `ebeb396` `.ufo/l0-questions.md:62` (musketeer CDP 9222 lease — rule kagi vs kake or declare the split). Also `.ufo/l0-questions.md:25` and `:34` remain open per `RevKaidokuRuling` (`<<re-verify at tip>>`).
- **Stale-lane:** respawn-per-round driver. This tabi round-17 mission was launched `<<ISO-8601>>` and is progressing (`<<n>>` lane commits). No other tabi mission is open. No round-18 mission was started. [INFERENCE: launch = `.ufo/waves/round-17/w1/record.json:5` createdAt `2026-10-20T15:43:21Z`; commit `6c97851` (12:31:11 -03) precedes it, so L1 must confirm.]
- **Tools installed/updated:** none by L1. This seat installed none. Grep of `.ufo/waves/round-17/w1/*.md` for `uv tool|npm -g|npx -y|cargo install|pacman -S|sudo` finds no install: `AdjRevenger.md:100` cites `npx -y rea-agents@6.5.0` as the environment's own tool; `DraftLesson.md:48` records "no … action taken". Seat installs in wave 2: `<<confirm>>`. No pacman transaction (host pause).
