# R57Connector — sibling-overlap scan (tabi-shokunin, round 57, wave w1)

Seat: `R57Connector` (connector). Wave: round 57 w1 (the only v1 wave). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scope: **read-only**. Nothing outside the lane's own `.ufo/waves/round-57/connector/` and this report was written; no tracked lane file was touched; no git/jj mutating command was run anywhere.

- Fleet root (`/home/vgpnk/Projects/shokunin`): READ-ONLY, read with `git rev-parse HEAD` + `git cat-file -p <head>:<path>` only.
- `shokuknow` (`/home/vgpnk/Projects/shokuknow`): READ-ONLY. No campaign tool was run (`renumber-staged.py`, `merge-plan.py`, `quote-lint.py`, `absent-defect-register.py` were **not** executed).
- Scratch: `/fast/scratch/hyaku/tabi-r57/R57Connector/` — created, all artifacts copied into the wave dir, **removed before yield**.
- Tooling: **no install, no upgrade**. `RULES.md` was read; pacman is paused host-wide, so no pacman transaction was attempted. `node v24.21.0`, `python3`, `git` were already present and sufficient.

## Artifacts written (this seat's paths only)

| Path | Content |
|---|---|
| `.ufo/waves/round-57/connector/heads-r57.tsv` | **Deliverable 1** — `lane \| r56-head \| r57-head \| moved?` for the 20-lane roster |
| `.ufo/waves/round-57/connector/heads-r57-detail.tsv` | the same table plus the r57 round-open head column and a `moved-since-round-open?` column |
| `.ufo/waves/round-57/connector/bg-screen-r57.tsv` | **Deliverable 3** — `lane \| head \| bgHits \| hit lines verbatim` (spec shape) |
| `.ufo/waves/round-57/connector/bg-screen-r57-hits.tsv` | the same screen in the r56 `overlap.tsv` per-hit-line shape (used for the set diff) |
| `.ufo/waves/round-57/connector/bg-screen-r57-lanes.tsv` | per-lane `head \| provinceSha256 \| lines \| bgHits` |
| `.ufo/waves/round-57/connector/bg-diff-r57-vs-r56.tsv` | the hit-line SET diff against the r56 adjudications, per lane, with a `needs-re-adjudication?` verdict |
| `.ufo/waves/round-57/connector/bg-diff-r57-vs-r56.json` | the same diff with the machine-readable detail |
| `.ufo/waves/round-57/connector/sibling-quarantine-overlap.json` | **Deliverable 2** — evidence lines (file:line + text) for every sibling hit |
| `.ufo/waves/round-57/connector/sibling-quarantine-overlap.tsv` | the per-lane count summary of the same scan |

The instrument was copied verbatim from the two frozen r56 sources so the r57 numbers are comparable by construction, not by assertion:
- roster scan / head snapshot / byte read: `.ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs` (`rosterScan`, `headSnapshots`, `makeSibRefGit`);
- the `BG_WORDS` list: the same file, line 150, byte-for-byte;
- the adjudication-table shape: `.ufo/waves/round-56/connector/receipts/gen-tsv.mjs`.

---

## Deliverable 1 — head-movement table (the L1's correction-cycle input)

**Snapshot taken 2026-11-03T19:18:51Z** (the artifacts in `connector/` carry this instant). `r56-head` is the `headSnapshot` of `.ufo/waves/round-56/measure/c1-meter-green-at-correction1.json` (the r56 correction-1 GREEN receipt); `r57-head` is `git -C <lane> rev-parse HEAD` read at this seat's snapshot instant.

**The lane the round-open red flags: `kengaku-shokunin`.**
`.ufo/waves/round-57/controls/c1-meter-v16-red-at-round-open.json` records `predicate: false`, `findingCount: 1`, and the single finding `{"id": "lane-screen-head-mismatch", "detail": "kengaku-shokunin"}` — the r56 delta ledger binds kengaku's lane row to head `9ebde3a73502ef210f3e2f6d0c1e0edfc90de0f3`, but kengaku had already advanced to `6b0908a5aefb143fd5d8a5a83d8e96951f5f2128` at round open.

**FURTHER movement seen since that red receipt (4 more lanes, all after 15:50 — 5 movers in total):**

| lane | r56-green head | r57 round-open head | r57 head (19:18:51Z) | moved? |
|---|---|---|---|---|
| `kagi-shokunin` | `d1632908815d572c241c29ca269226662eb931fe` | `d1632908815d572c241c29ca269226662eb931fe` | `d00e37e57828b6c057dbedf1fb7c3630dfd09f25` | yes |
| `kake-shokunin` | `dbcfef0b80868dc3f677ccf2caa51110094e6d26` | `dbcfef0b80868dc3f677ccf2caa51110094e6d26` | `a46ca62acfa0b1661d63f3a5e64ef8ab33590204` | yes |
| `kengaku-shokunin` | `9ebde3a73502ef210f3e2f6d0c1e0edfc90de0f3` | `6b0908a5aefb143fd5d8a5a83d8e96951f5f2128` | `859ac24f41061bffde588b9ed5d5adfea5ca8e27` | yes |
| `souji-shokunin` | `ab8c1fcfa9b079a425c4eb8b12d517118a56e65e` | `ab8c1fcfa9b079a425c4eb8b12d517118a56e65e` | `9bf9234ae4d11c7b31706354302a9e95ad0d1f81` | yes |
| `tsukuroi-shokunin` | `2f3061ef725abebd8cd157b778203f1cf5c0cb0c` | `2f3061ef725abebd8cd157b778203f1cf5c0cb0c` | `431f0c9768c7c03c34355df3cad6fde89774c306` | yes |

The other 15 roster lanes are **unmoved** since the r56 correction-1 snapshot (`audio, chousa, game-dev-2d, game-dev-3d, kaidoku, kama, kasegi, kotoba, kotodama, kumitate, lore, mado, mori, revenger, tameshi`) — full table in `connector/heads-r57.tsv`.

### What the movement means for the r57 rebind (read-only re-derivation, at this snapshot)

Re-derived with the r56 v16 meter's own semantics (`observedStatus`, `BG_WORDS`, sha256 over the snapshot-head bytes):

- **P1 (map ↔ audit):** all 16 `corpus/adjacency.tsv` data rows still re-derive to their **claimed** status at the current heads. No audit row needs a status change. The one row the r56 audit carries as `moved` (kumitate `SCORECARD.md:1723` → note `text now at :1736`) still re-derives `moved` with the derived line **1736** — the note still matches, so `audit-note-moved-line` does not fire.
- **P3 (delta screen):** of the 16 `corpus/adjacency-host-delta-r56.tsv` lane rows, **13 are unchanged** in `provinceSha256`, `lines`, `bgHits` **and** `head`. **Three moved in `head` only, with byte-identical province:**
  - `kengaku-shokunin` — head `9ebde3a7…` → `859ac24f…`; `provinceSha256` still `fd1ad05b2bdb4c60f27e51ee5d15b3b3844c566e76f86ffa393af0860a04b269`, `lines` 952, `bgHits` 0;
  - `souji-shokunin` — head `ab8c1fcf…` → `9bf9234a…`; `provinceSha256` still `c60046df0ee067cded491caf99e013adaf0f0986238e1ec36df9b17838271d76`, `lines` 323, `bgHits` 0;
  - `tsukuroi-shokunin` — head `2f3061ef…` → `431f0c97…`; `provinceSha256` still `e0d2b3d3bd3aed0df3539c8a2c4f7ddb3a3fafbabb80f5f3852ba7cbaa6551c0`, `lines` 338, `bgHits` 1.
  - `kake-shokunin` also moved its head, but kake is **not** in the delta ledger (it is covered by the ruled map), and its `PROVINCE.md` sha256 is identical across the heads measured (`0513521fc4ac3d2a79ed53c86b3d82208e65a20d43ab927e2641eea75e361e7d` at both `dbcfef0b…` and `cb08ab09…`), so its map rows are unaffected.
  - `kagi-shokunin` moved its head and its `PROVINCE.md` bytes **did** change (sha `f0f278d5…` → `0bbf19b3…` at `064d4b64…`; the lane then moved on to `d00e37e5…`); the map rows citing `PROVINCE.md:64` and `PROVINCE.md:3` still re-derive `unchanged` at the new head, and its three BG hit lines are byte-identical (see Deliverable 3).

**L1 action (derived, not adjudicated by this seat):** the r57 delta generation needs its **three** moved lane rows re-bound to the fresh snapshot heads (`kengaku-shokunin` → `859ac24f41061bffde588b9ed5d5adfea5ca8e27`, `souji-shokunin` → `9bf9234ae4d11c7b31706354302a9e95ad0d1f81`, `tsukuroi-shokunin` → `431f0c9768c7c03c34355df3cad6fde89774c306`), with `provinceSha256`/`lines`/`bgHits` carried forward unchanged. **No adjudication may be changed to match a head that moved after the snapshot** (C1's kill rule) — so the rebind must be a *fresh* snapshot, and the 13 unmoved lanes' dispositions carry verbatim.

**Movement is bursty, not continuous — but it is not finished.** Measured directly: a 90-second window (two full roster head reads back to back) observed **zero** lane movements; the movers land in **bursts** of 2–4 commits each (`kake` 16:03, 16:05, 16:11; `kagi` 15:29, 15:56, 16:15 ×2; `kengaku` 15:03, 15:49, 15:56; `souji` 16:08, 16:09; `tsukuroi` 16:17). **The mover count is still growing**: 1 lane moved at round open (15:50), 4 by 19:14Z, **5 by 19:18:51Z** (`tsukuroi` moved at 16:17, i.e. *after* this seat's first screen). A rebind taken now can still be invalidated by the next burst — the L1 should snapshot immediately before running and treat a further `lane-screen-head-mismatch` as a **rebind-timing** problem, not an adjudication problem.

**A live check for the L1 (read-only, run at this seat's final snapshot):** the frozen v16 meter re-run against the live fleet at the baseline revision returns **`findingCount: 3`** — `kengaku-shokunin`, `souji-shokunin` **and** `tsukuroi-shokunin`, all `lane-screen-head-mismatch` — with `counts {roster: 20, mapRows: 16, auditRows: 16, deltaLanes: 16}`. This is the committed round-open receipt's shape (`findingCount: 1`, `kengaku-shokunin`) **plus the two lanes that moved after it**, measured from the instrument's own side. It is the state the v17 rebind must clear, and it confirms the "further movement" finding above independently.

---

## Deliverable 2 — sibling quarantine / assimilation overlap

Read-only grep of every sibling lane's `.ufo/reports/**/round-5[67]*.md` and `corpus/lessons/round-5[67]*.md` for `quarantine|absent-defect-register|corpus-expansion|merge/`. Evidence lines only; **no sibling's write state is reported**.

> Path note (measured): no sibling has a file literally at `.ufo/reports/round-5[67]*.md` — the sibling `reports` trees are round-named *directories* (`round-20/`, `round-30/`, …), not flat `round-56.md` files. The sibling round-56/57 **seat** reports live under `.ufo/waves/round-5[67]/**` (chousa 138, kake 482, kama 182, mado 824, mori 128, tameshi 294, kasegi 13 `.md` files). The scan below covers the `corpus/lessons/round-5[67]*.md` files, which is where the sibling **adjudication** text lives; the `.ufo/waves/` seat reports were surveyed separately (below) because that is where the same-lane *work* is described.

### Lanes also doing shokuknow register / assimilation work right now

| lane | evidence | what it is doing |
|---|---|---|
| **`chousa-shokunin`** | `corpus/lessons/round-57.md:30` — "**S096 hand-check (the one row w1 left unassigned, `R57W1SentScope.md` S4):** register S096's URL (jc.hit.edu.cn `.doc`, key `6dc68fd6b32ce9c8dfcebce8`, lane-held as S101, C2-REPRODUCED) contains all three register quote families in its UTF-16LE text" ; `corpus/lessons/round-57.md:74` — "**Quarantine completion.** S096 adjudicated PRESENT (two verbatim, one comma-fold substance; the comma-width fold is a new fold class for `tools/quarantine-check.py`'s fold set — routed). Coverage 24/24, zero fabrications." | **Running its own wave-4 quarantine-first hand-check against the same register, and COMPLETED it at 24/24.** Its r57 `w1` seats `R57W1QuarA..D` (`.ufo/waves/round-57/w1/R57W1QuarA.md` etc.) read the register directly. Highest-overlap sibling for the §2b duty. |
| **`kake-shokunin`** | `corpus/lessons/round-57.md:91` — "Quarantine slice (`assimilation/quarantine-slice`, 12 rows; **the register's header and totals are stale, the slice is derived by the contract's awk**): none adopted, all 12 hand-checked this" ; `corpus/lessons/round-57.md:126` — "the first hand-check of the 12-row quarantine slice (10 verified, 2 absent as registered)" | **Its own register-slice hand-check, and it independently found the register's header/totals are stale.** Its r69 `w1/ConnW1.md` + `w1/ConnW1/evidence.md` (written today 15:59–16:02) re-derive the kake slice from the register: 9 payload-absent rows (S142, S143, S148, S156, S161, S193, S194, S195, S206) + 3 never-checked (S154, S178, S184) = 12. |
| **`mori-shokunin`** | `corpus/lessons/round-57.md:41` — "Assimilation: none; no merge package entry was adopted. The three quarantine-only mori rows were re-derived from the external register (`.ufo/waves/corpus-expansion-1/absent-defect-register.md:356-358`) and hand-checked against live source carriers this round; no register status was changed:" | **Hand-checked its own 3 register rows** (the never-checked table, lines 356–358 = S244, S262, S268) without changing any register status. |
| **`kasegi-shokunin`** | `corpus/lessons/round-57.md:49` — "The shokuknow package `merge/kasegi/` (MERGE-REPORT: 67 knowledge entries, 94 staged rows, first staged id S031) is not adopted this round: the package's adoption gate needs a per-entry PROVINCE and QUALITY check **plus the wave-4 quarantine-first pass** for the entries it cites" | **Names the wave-4 quarantine-first pass as an unmet precondition** — same rule tabi's §2b duty is discharging. Its r57 `w1/SiblingOverlap.md` (today 15:36) is a sibling-overlap scan of the same kind as this seat's. |
| **`mado-shokunin`** | `corpus/lessons/round-56.md:94` — "Assimilation: none. `/home/vgpnk/Projects/shokuknow/merge/mado/` holds 69 staged entries (15 adopted, 18 refused, 36 unadopted residue)" | Read the `merge/mado/` package; no register-slice hand-check claimed. |
| **`kama-shokunin`** | `corpus/lessons/round-57/controls/canonical-noop/corpus/lessons/round-41.md:99` — "Quarantine slice (register read-only): `awk -F'|' -v l='kama' ...` over `absent-defect-register.md` gives 7 rows: S200, S202, S206, S210, S211, S224, S230, all `payload-absent`" | Reads the register read-only and derives a lane slice with the same awk pattern. |

Lanes with **zero** hits on the pattern in their r56/r57 lessons and reports: `audio, game-dev-2d, game-dev-3d, kagi, kaidoku, kengaku, kotoba, kotodama, kumitate, lore, revenger, souji, tameshi, tsukuroi`.

### Register drift warning for the L1

**The register has NOT drifted.** Measured at this seat's snapshot:

- `sha256sum` = `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`, `83,621` bytes, mtime `2026-10-24 08:37:00.746072780 -0300` — **byte-identical to what `mori-shokunin` recorded in round 56** (`mori-shokunin/.ufo/waves/round-56/w1/Mo56ExecAssimSlice.md:99`: `| \`absent-defect-register.md\` (generated from v5) | 2026-10-24 08:37 | \`5afe1810…bad833\` | 83,621 |`) and to what tabi itself recorded in round 25 (`tabi-shokunin/.ufo/waves/round-25/w1/ScoutAssimilationPrep.md:11`).
- The register is a **tracked file in the shokuknow git repo** (`git ls-files --error-unmatch` succeeds; `git status --porcelain` on it is empty) and is **not** in the campaign scripts' output set for this wave — the four write-capable package scripts (`renumber-staged.py`, `merge-plan.py`, `quote-lint.py`, `absent-defect-register.py`) are **not** run by this seat.
- The `merge/*` staging tree is likewise untouched since `2026-10-24 23:33`; `merge/tabi/` holds `MERGE-REPORT.json`, `MERGE-REPORT.md`, `SOURCES.append.md` (141,928 B) and `knowledge/`.

**The register's own header/totals ARE stale — independently confirmed by two sibling lanes.** This is the same finding kake recorded (`round-57.md:91`) and it matters for tabi's §2b duty, because the frozen filter and the summary row disagree:

| measure | value | note |
|---|---|---|
| lines matching `^\| \`tabi\` \|` | **39** | the "39 tabi data rows" figure in `tabi-shokunin/corpus/lessons/round-56.md:153` counts **every** `\| \`tabi\` \|` line, including the **By-lane summary row** |
| `## By lane` summary row for tabi | **37** | register line 236: `\| \`tabi\` \| 37 \|` — this counts only the **payload-absent** rows of the main `## Rows` table |
| strict data rows (`^\| \`tabi\` \| round[0-9]+ \| S[0-9]+`) | **38** | 37 payload-absent (main table, lines 178–214) + 1 never-checked (line 362, S171) |

**Reconciliation (the r57 claims' own note):** 39 = **38 data rows + 1 By-lane summary row**. The claims' frozen filter — "lane `tabi` + round cell + S-id cell" — selects exactly **38**, and the extra 39th line is the summary row, not a data row. This is verified against the register bytes, not assumed:

- the **r25 committed slice is byte-identical to the current 38-row slice** — `awk -F'|' '$2 ~ /tabi/ && $3 ~ /round/ && $4 ~ /S[0-9]+/'` over the register today yields 38 lines and `diff` against the committed `tabi-shokunin/.ufo/waves/round-25/assimilation/quarantine-slice.md` (38 lines) is **empty**. The filter is stable and the slice has not changed since round 25.
- the 38 rows split **37 payload-absent** (main `## Rows` table, lines 178–214) + **1 never-checked** (line 362, `| \`tabi\` | round5 | S171\` | the cited source could not be fetched, so no quote was checked | https://chromestatus.com/features/5117755740913664 |`). The row-362 id cell carries a stray backtick (`S171\``) — the same malformed cell shape as the other 108 never-checked rows; the strict `S[0-9]+` pattern still matches it.
- **The By-lane table is systematically stale, not just for tabi**: its per-lane counts sum to **194** (the header's "rows with at least one ABSENT quote: **194**") while the strict per-lane data-row counts sum to **303**. The gap is the 109 never-checked rows (the register's own never-checked header says "rows: **109**"), plus `mori` (3 rows) and `lore` (9 rows) are **absent from the By-lane table entirely** despite having rows. For tabi specifically: summary says 37, strict says 38 — off by the one never-checked row.

**L1 warning (register drift while seats read it):** low. The file's sha256 and mtime are unchanged since 2026-10-24 and it is a tracked shokuknow file. The re-measurement hazard is the *opposite* of drift: a seat that counts rows with a loose filter will land on **39** and be off by one against the frozen **38**; the strict filter, or the r25 committed slice, is the correct instrument. The By-lane summary row is **not** a data row and must not be counted as one.

---

## Deliverable 3 — BG screen refresh at current heads + the SET diff against the r56 adjudications

**Screen:** the `BG_WORDS` list copied **byte-for-byte** from `.ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs:150` — `['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har']` — applied to every roster lane's `PROVINCE.md` **read through git at the snapshot head** (`git cat-file -p <head>:PROVINCE.md`; the working tree is never read). The `term` column joins **all** matching words with `+`, exactly as the r56 generator does.

**Result: 78 hit lines across 10 lanes, at the current heads** (`connector/bg-screen-r57.tsv`, per-hit-line detail in `connector/bg-screen-r57-hits.tsv`):

| lane | head | bgHits | hit lines |
|---|---|---|---|
| `audio-shokunin` | `f9da7ee97e0ba95da1803c2afe9c616c519bae18` | 3 | 4, 25, 41 |
| `game-dev-2d-shokunin` | `1e033ef053beedf9a201daa21fbeb9c8b2f72dc3` | 3 | 3, 8, 16 |
| `game-dev-3d-shokunin` | `39ca3973c7865456d97fae18033f3f460c6cf8c1` | 8 | 3, 6, 16, 19, 29, 57, 58, 62 |
| `kagi-shokunin` | `d00e37e57828b6c057dbedf1fb7c3630dfd09f25` | 3 | 41, 64, 81 |
| `kaidoku-shokunin` | `c7fe6898e9a8b3ff04486b4a1d672e9db37610c9` | 6 | 46, 53, 56, 134, 137, 147 |
| `kake-shokunin` | `a46ca62acfa0b1661d63f3a5e64ef8ab33590204` | 45 | 45 lines (see the TSV) |
| `kotoba-shokunin` | `1c8f37edf2e5ac0fb3c2be1c88e32406313fe47b` | 3 | 59, 61, 62 |
| `mado-shokunin` | `524fa1f90b1f2de44b3019bacf833d54e0af13a0` | 2 | 16, 35 |
| `revenger-shokunin` | `5915ad8d71c19ad377829d130ba1c35445eb32a4` | 4 | 26, 27, 30, 33 |
| `tsukuroi-shokunin` | `431f0c9768c7c03c34355df3cad6fde89774c306` | 1 | 48 |

The other 10 roster lanes (`chousa, kama, kasegi, kengaku, kotodama, kumitate, lore, mori, souji, tameshi`) have **0** hits. `tsukuroi-shokunin` is the one lane whose head moved **and** which carries a hit line — its single hit (line 48) is byte-identical, so its `no-tabi-ground` disposition carries.

### The SET diff against `.ufo/waves/round-56/connector/overlap.tsv`

**No lane's hit-line set changed. Zero lanes need re-adjudication.**

- r56 rows: **78**. r57 rows: **78**. The hit-line key sets are **equal** (`keySetsEqual: true`; key = `lane | PROVINCE.md:<line>`).
- `added` = 0, `removed` = 0, `hit-line-text-changed` = 0, **across every lane** (`connector/bg-diff-r57-vs-r56.tsv`, `lanesNeedingReAdjudication: []`).
- A byte-level comparison of the `term` **and** `wholeLineText` cells on all 78 shared keys gives **0 diffs**.

**Carried-forward dispositions.** Every r56 disposition therefore carries unchanged — **including for the two lanes whose heads moved**:
- `kagi-shokunin` (head `b7482b4a…` → `d00e37e5…`): all three hit lines are byte-identical, so the three `contested-open` dispositions (lines 41, 64, 81) carry by exact whole-line quote match, exactly as the r56 ledger's own rule provides.
- `kake-shokunin` (head `dbcfef0b…` → `a46ca62a…`): all 45 hit lines are byte-identical (`PROVINCE.md` sha256 unchanged across the heads measured); the 41 `no-tabi-ground` / 4 `overlap-declared` dispositions carry.
- `tsukuroi-shokunin` (head `2f3061ef…` → `431f0c97…`): its single hit line (48) is byte-identical; the `no-tabi-ground` disposition carries.
- `kengaku-shokunin` and `souji-shokunin` (both moved, both 0-hit lanes) have no hit lines to carry. The r56 disposition split across the 78 rows is **26 `no-tabi-ground`, 4 `overlap-declared`, 7 `contested-open`** (per lane: `audio` 3 no-tabi-ground; `game-dev-2d` 3; `game-dev-3d` 8; `kagi` 3 contested-open; `kaidoku` 4 no-tabi-ground + 2 contested-open; `kake` 41 no-tabi-ground + 4 overlap-declared; `kotoba` 3; `mado` 2; `revenger` 2 no-tabi-ground + 2 contested-open; `tsukuroi` 1) — **all 78 carry unchanged**.

**Cross-check against the adjacent seat's rebind instrument (`adj/rebind-r57.mjs`, seat R57Adj), read-only.** Two independent measurements agree with this seat's, and one gap is worth the L1's attention:

1. **The R57Adj rebind tool's own authoring snapshot is already stale on three lanes.** `adj/rebind-snapshot.authoring-test.json` (`snapshotAt` `2026-11-03T19:07:22.002Z`) records `kengaku-shokunin` = `5f517fe7147831f96a9900c9642c07ee71031940` and `souji-shokunin` = `8ec412c64d73d8c5e339f1d15d11cfc5b6e702d0`; by this seat's final snapshot both had advanced (`kengaku` → `859ac24f41061bffde588b9ed5d5adfea5ca8e27`, `souji` → `9bf9234ae4d11c7b31706354302a9e95ad0d1f81`), and `tsukuroi-shokunin` — which the 19:07 snapshot binds at `2f3061ef725abebd8cd157b778203f1cf5c0cb0c` — moved to `431f0c9768c7c03c34355df3cad6fde89774c306` at 16:17. That is **expected and correct** — `adj/README.md` states the L1 re-runs the tool at **its own** fresh snapshot after the freeze commit — but it confirms the tool must be **re-run**, not reused: a ledger written from the 19:07 snapshot would bind three already-stale heads. `kagi-shokunin` and `kake-shokunin` also moved again (`d00e37e57828b6c057dbedf1fb7c3630dfd09f25` and `a46ca62acfa0b1661d63f3a5e64ef8ab33590204`); neither is in the r56 delta ledger, so neither affects a rebind.
2. **The carry-set gap: `kagi-shokunin` and `kake-shokunin` have browser-ground dispositions in the r56 *connector* adjudications but NOT in the r56 *delta* ledger, so the rebind tool cannot carry them.** The tool carries dispositions only from `corpus/adjacency-host-delta-r56.tsv` line rows (8 lanes, 30 rows). The r56 `overlap.tsv` adjudicates **10** lanes / 78 hit lines — the extra two are `kagi-shokunin` (3 hit lines) and `kake-shokunin` (45 hit lines), which are **map-covered** (`corpus/adjacency.tsv` sibling column: `kagi, kaidoku, kake, kama, kumitate, revenger`) and therefore carry **no** delta lane row, so the meter never required a line row for them.
   - This is **harmless as the tool is configured**: its `--also-screen` default is `kaidoku-shokunin,revenger-shokunin` — both of which **are** in the carry set — so the r57 rebind will not screen `kagi`/`kake` and will not hit exit 3.
   - It becomes a **live trap** if the L1 widens `--also-screen` to include them: 48 hit lines (3 `kagi` + 45 `kake`) would resolve to **no** carried disposition and the tool would abort with **exit 3**, `unresolved.json` written and no ledgers. Their dispositions exist in `.ufo/waves/round-56/connector/overlap.tsv` (3 `contested-open` for `kagi`; 41 `no-tabi-ground` + 4 `overlap-declared` for `kake`) and would have to be passed explicitly via `--adjudications`, quoted byte-exactly from that file.
   - This seat's Deliverable 3 is **not** a disposition source for the rebind: it is a *screen*, and the r56 dispositions it verifies as still-valid live in the r56 `overlap.tsv` and the r56 `delta-r56.tsv`, keyed by (lane, path, whole-line quote). The r56 `overlap.tsv` is a superset of the r56 `delta-r56.tsv` line rows; the rebind's carry set is the smaller one.

 the r56 `overlap.tsv` was screened at `kagi-shokunin` head **`b7482b4acc42413fbb3d49ab6e4f811fb18e9f0c`**, while the r56 **meter**'s own green receipt `c1-meter-green-at-correction1.json` records kagi at **`d1632908815d572c241c29ca269226662eb931fe`**. The two r56 artifacts were taken at **different kagi heads** — the connector screen ran at 15:23 and the meter green at 15:36, and kagi committed in between (15:29). This is benign *for this round* (kagi's `PROVINCE.md` sha256 is identical at both heads — `f0f278d5583549ccf4da0e4d2906c580c5aeffaf29db22d26036545493231319` — and all three hit lines are byte-identical), but it means the r56 screen and the r56 meter were **not** one snapshot. **The r57 screen in `connector/` and the r57 rebind must be ONE snapshot**: take the head snapshot and the ledger re-bind from the same instant, or the r57 delta ledger will bind a head the screen did not see. This seat's `heads-r57.tsv` and `bg-screen-r57.tsv` share one snapshot instant (2026-11-03T19:18:51Z) and are usable as a pair.

---

## Tools, bounds and hygiene

- **No tool was installed or upgraded.** `/home/vgpnk/.omp/agent/RULES.md` was read first; pacman is paused host-wide, so no pacman transaction was run; `node v24.21.0`, `python3` and `git` (read-only) were already present and sufficient. No need to name a pacman-only tool.
- **No mutating git/jj command** was run anywhere. Git use was `rev-parse`, `cat-file`, `log`, `ls-files`, `status --porcelain` (the last two read-only), plus `sha256sum`/`awk`/`grep`/`diff`.
- **Writes** were confined to `.ufo/waves/round-57/connector/**` and this report (`.ufo/waves/round-57/w1/R57Connector.md`). Nothing was written to the fleet root, any sibling lane, `shokuknow`, `.ufo/state/`, `.ufo/watchdog.log`, the fleet's `templates/` or `scripts/`.
- **Scratch** `/fast/scratch/hyaku/tabi-r57/R57Connector/` was created, its artifacts were copied into the wave dir, and the directory is removed before yield (`rm -rf -- /fast/scratch/hyaku/tabi-r57/R57Connector`).
- **No subagent was dispatched** (leaf member).
- **No shokuknow campaign tool was run** and nothing was written to `shokuknow`.

## What this seat did NOT do (out of scope by the seat spec)

- No adjudication of any BG hit line (the dispositions are carried from r56 unchanged; this seat only measured whether they still apply).
- No rebind of `corpus/adjacency-host-audit-r57.tsv` / `corpus/adjacency-host-delta-r57.tsv` — those are the L1's data pass; this seat supplies the snapshot and the set-diff verdict.
- No part of the 38-row quarantine hand-check itself (the §2b duty belongs to the quarantine seats; this seat supplies the row-count reconciliation and the register-stability measurement that the duty depends on).
- No change to the frozen claims, the v17 meter's declared change set, or any predicate.
