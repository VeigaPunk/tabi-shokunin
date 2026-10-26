# Wave 2 seat report — CritScreenKaidokuB (C1 attack: kaidoku screen rows, ranks 70–137)

Seat: CritScreenKaidokuB (leaf; no subagents). Item: attack the C1 screen rows of sibling lane `kaidoku` in `corpus/adjacency-screen-browser.tsv`, ranks 70–200 among kaidoku rows in file order (kaidoku has 137 rows → attacked ranks 70–137 = ledger file lines 127–194, 68 rows). Attacked against the wave-1 integration `083c5c643be7aa5965a5de3458a32ed0d289ead3` (K lane checkout at that rev; sibling kaidoku read at its frozen pin `49096c7e6f226af0c750c4b003be58883cb6049f` via `git show`).

## Verdict (one paragraph)

**The C1 screen ledger holds for the kaidoku rows I attacked, with one low-severity reason-label defect.** All 68 attacked rows (a) have quotes that are verbatim substrings of the pinned sibling lines at the frozen pin (verified mechanically, 68/68), (b) are correctly screened — none is a REAL un-mapped overlap: every row is kaidoku's own side of an already-mapped, verified kaidoku map row (`cdp-runtime-observation` ruled row 2, `recorded-har-producer-channel` split row 16, `screenshot-pair-compare-semantics` split row 17), so `unaccounted 0` survives and **should-map = 0**. The defect: **11 of 68 rows are relabels** — the wave-1 seat labelled kaidoku's own probe/tool-gate receipts in `2026-10-14-r11-01-queue-ops.md` as `third-lane-report` (10 rows) and one provisioning-taxonomy sentence as `third-lane-report` (line 91). Under the decision rule's order (`SKILL.md:2861-2881`) rule 2 (same-surface) precedes rule 3 (third-lane-report), and these lines are kaidoku's own receipts on the mapped REA-provider browser surface — not another lane's work — so the correct reason is `same-surface / cdp-runtime-observation` (line 91: `not-browser-sense`, a tooling-class reference). Severity: **low** — the screens remain valid (reason ∈ SCREEN_REASONS, quote verbatim, surface names a verified kaidoku map row), so the C1 predicate's `unaccounted == 0` is unaffected; only the reason-group distribution is mislabelled (third-lane-report 11 → same-surface 10 / not-browser-sense 1), which matters only to the QUALITY 88/91 closure review of screen-reason groups. No new map row is required by any attacked row.

## What I attacked

- C1 screen rows of sibling `kaidoku` in `corpus/adjacency-screen-browser.tsv` (integrated ledger, 382 screens), ranks 70–137 (car file lines 127–194; exactly the kaidoku rows in that band).
- For each row: (a) reason against the decision rule `SKILL.md:2861-2881`; (b) same-surface ground truth against the verified kaidoku map rows in `corpus/adjacency.tsv` (rows 2 `cdp-runtime-observation`, 3 `reverse-engineering-of-shipped-artifacts`, 16 `recorded-har-producer-channel`, 17 `screenshot-pair-compare-semantics`; row 18 is the new kagi row, not kaidoku); (c) whether the line states a side of ground no existing row answers (should-map).

## Evidence

Commands run (all from scratch `/fast/scratch/hyaku/tabi-r35/CritScreenKaidokuB/`; `$S` = that dir):

1. Dump kaidoku pinned files to scratch:
   `git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 49096c7e6f226af0c750c4b003be58883cb6049f:<path> > $S/kaidoku-pin/<file>` for the 9 pinned files touched by the attacked rows → exit 0 each, 2768 lines total. (Read-only git; the pinned commit equals `c1-pins.json` kaidoku pin `49096c7e6f226af0c750c4b003be58883cb6049f`.)
2. Verbatim-quote check (all 68 rows): parse the ledger, for each attack row extract the `quote` cell and test `quote in pinned_file[line-1]` → **68/68 OK, 0 mismatches, 0 out-of-range** (script output lines `70 OK 524 … 137 OK 142`).
3. Line-context reads of every attacked pinned line (r4-08, r4-16, rea-cli-surface, r10-01, r10-02, r11-01, l7-03, r17, r18 files at the pin) — semantic judgment per row.
4. Ledger reason census of the attacked band: same-surface 51, third-lane-report 11, not-browser-sense 6 = 68.

Exit codes: steps 1–3 exit 0. (One Python one-off exited 1 *after* writing the first verdicts.tsv draft — the failure was only in a `collections.Counter` line over unhashable row lists; the file was regenerated and verified afterwards; final counts confirmed by `awk` exit 0.)

## Findings (name → verdict)

### Holds (57/68)
All same-surface rows (51) and all not-browser-sense rows (6) survive: quotes verbatim, surface = a verified kaidoku map row that genuinely owns that ground (not merely an existing label — checked per row against the map's sibling_quote and ruling), and no row states a side of a tabi PROVINCE surface that no map row answers. Representative grounds:
- `cdp-runtime-observation` rows are all kaidoku's own self-launched/loopback CDP targets, REA-provider browser legs (`REA_BROWSER_EXECUTABLE`, `chromium-native-module-resolver` engine, resolver-stub contract), run logs and teardowns — the exact ground of row 2's ruling ("kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis", `adjacency.tsv:2`, ruling `round-16-verifier-spotcheck.md:142`).
- `recorded-har-producer-channel` rows are kaidoku's own HAR-gate provisioning results (playwright recordHar, netlog refutation, lossless decode) — row 16's split (producer named vs gate owned).
- `screenshot-pair-compare-semantics` (r10-02:161) is the compare-web-captures input contract — row 17's split.
- not-browser-sense (r17:207, r18:1/55/70/96/142) — `kimi-webbridge` there is a Go 1.24.13 ELF carrier for Ghidra Swiss-map analysis, not the browser bridge plugin (verified in context).

### Defect — low severity, reason relabel (11/68)
Rows `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:corpus/knowledge/2026-10-14-r11-01-queue-ops.md:{13,63,68,74,77,83,101,108,280,310}` are labelled `third-lane-report` but are kaidoku's own REA-run receipts on the mapped REA-provider browser surface (host chromium substrate digests, env-gate refusal, engine identity, REA package contract, verify commands, run-log rows). By rule order (`SKILL.md:2865-2871`; rule 2 before rule 3) and by the literal definition of third-lane-report ("another lane's work"), the correct reason is `same-surface / cdp-runtime-observation`. Line 91 (`NOW in the r10-01 sense (playwright-class preinstalled tooling)…`) is a provisioning-taxonomy argument where "playwright" is a tooling-class reference → `not-browser-sense`. Caveat noted for closure: rank-43 of the same ledger (own-host measurement "chromium-1248/headless-shell cache present") already uses third-lane-report for an own-measurement, so if the registry's accepted practice reads third-lane-report as "any receipt-type line claiming nothing on tabi's surface", the impact of this relabel is nil; under the written rule it is a mislabel.

### should-map: 0
No attacked row states a side of ground on a tabi PROVINCE surface that no existing kaidoku map row answers. No draft map row is offered.

## Counts (68 attacked)

- ok: 57 (same-surface 51, not-browser-sense 6)
- relabel: 11 (10 → `same-surface / cdp-runtime-observation`; 1 → `not-browser-sense / -`)
- should-map: 0
- quote mismatches: 0; pinned-line out-of-range: 0
- unaccounted impact: none (all rows remain screened; C1 predicate `unaccounted == 0` unaffected)

## Deliverables

- `verdicts.tsv` (68 rows + header: `key | verdict | correct reason+surface | one-sentence ground`) → `.ufo/waves/round-35/w2/CritScreenKaidokuB/verdicts.tsv`
- This report → `.ufo/waves/round-35/w2/CritScreenKaidokuB.md`

Tooling: no installs/updates performed this seat (nothing to record). Scratch cleaned after copying deliverables; no processes started.
