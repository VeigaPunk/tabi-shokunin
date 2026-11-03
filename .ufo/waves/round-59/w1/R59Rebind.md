# R59Rebind — r59 rebind tool + kagi/kake/kama browser-ground adjudication drafts

Seat: R59Rebind (leaf executor, round 59 w1). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; fleet root
`/home/vgpnk/Projects/shokunin` (read-only). Lane base revision
`4e7fb89d7b71a6fdf661680891440be6577759e8`; lane HEAD at authoring
`dd337bb339abb8e50dfae268f820d0fa6e62c031` (instruments only; no data).
Authority: `.ufo/waves/round-59/claims.json` C1 + the L1's pre-data correction
(`preDataCorrection`: C1 after-state counts corrected to
`{roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20}`).
I did not amend claims; the counts tension I raised was ruled on by the L1
before any seat scored and is confirmed in claims.json.

## Result

1. `adj/rebind-r59.mjs` — generation-adapted from `adj/rebind-r58.mjs`
   (r58 lesson Mistakes row 3): r59 ledger names, `PREV_DELTA ->
   corpus/adjacency-host-delta-r58.tsv`, v19 meter import, and the v19 declared
   change (d) screen set (ALL roster siblings × {PROVINCE.md ∪ every
   map-referenced file}, one lane row per screened `(lane,path)`); plus a
   `--dry-run`/`--preflight-out` preflight mode and a `meterSha256` provenance
   pin. `node --check` green. The full rebind was NOT run.
2. `adj/bg-hits-draft-kagi-kake-kama.tsv` — 72 adjudication rows for the three
   newly screened lanes, every quote byte-exact at the lane head recorded in the
   row (72/72 re-read check).
3. `adj/screen-set-r59-inventory.json` — the complete v19 (d) screen set:
   20 lanes / 25 files / 140 hit lines, with per-file head+sha, and the 37 hit
   lines that remain unadjudicated (all in kaidoku's two map-referenced files).
4. `adj/rebind-r59-preflight.json` — authored-state dry run: exit 3, exactly the
   37 open lines named, no ledger written.
5. `adj/rebind-r59-preflight-v19core.json` — v19 pure-core preflight exercise:
   exit 0, predicate true, findings 0, counts `{20, 16, 16, 20, 20}`, 25 file
   screens / 140 line rows, pinned to the meter bytes current at receipt time
   (`0f956f86…`; the meter's own `--selftest` 38/38 allPass at that sha).
6. `adj/data-pass-runbook.md` — the exact one-snapshot data-pass sequence.
7. `adj/rebind-r59-v18core-rehearsal.json` — control: the same candidate rows
   against the v18 core exit 5 with 151 `delta-line-invented` findings (the
   A5/N4 defect v19 (e) fixes), proving the multi-file rows are only valid under
   the v19 core.

## Artifacts (sha256)

| Path (relative to lane root) | sha256 | Bytes |
|---|---|---|
| `.ufo/waves/round-59/adj/rebind-r59.mjs` | `577fef0019362ed102e1b839c77f403ea6fd51dc81dc730311232c03367c3645` | 23,220 |
| `.ufo/waves/round-59/adj/bg-hits-draft-kagi-kake-kama.tsv` | `7d93735d2132f872c2b7869a1c383e6856075c1bd857ff757d03ba118a0f9895` | 27,229 |
| `.ufo/waves/round-59/adj/screen-set-r59-inventory.json` | `64e35b77804499e8faff7e5aca1b8cd18ebfaeff1d9ceb070129c6107e3b061d` | 18,783 |
| `.ufo/waves/round-59/adj/rebind-r59-preflight.json` | `11d5c5ef6847dbff9ef1ae3b8e746d580180cef1e72376ca1302537e9b7bfa8b` | 7,554 |
| `.ufo/waves/round-59/adj/rebind-r59-preflight-v19core.json` | `d0efdf2df5719583fdbbdeeecd22b21ba188a7722c167e5a3fbef64709124fd7` | 6,940 |
| `.ufo/waves/round-59/adj/preflight-only-adjudications-109.json` | `8151b5ebed9c46589a6053733d513e42c3e7497a87d2028dc925e825e6a3b65c` | 35,855 |
| `.ufo/waves/round-59/adj/rebind-r59-v18core-rehearsal.json` | `23c82aacce7440fca30be4e11ce8480bd132cc53e1cfbcd182b040dac8c89a88` | 10,779 |
| `.ufo/waves/round-59/adj/data-pass-runbook.md` | `683a830916aab849f638538b091ef7ee74b2421250d89bc97254e44dc40038eb` | 7,864 |

Meter read by the preflights:
`.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs` =
`0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c`
(sha stable across a 60 s check; `--selftest` exit 0, **38 cases, 38 pass,
allPass true**; exports `verify`/`predicateFrom` unchanged, `BG_WORDS`/
`DISPOSITIONS` literals unchanged, multiple lane rows per lane accepted and
counted as `deltaLanes`/`bgScreenSiblings` = 20). Pre-freeze drift, disclosed:
the meter seat first declared final at
`7c4e4b5d2c909f68803454bc4c3338f2846a6d98839d3470398989b6c3641073` (37-case
selftest); the seat then added the `kaidoku-multi-file-keyed-green` selftest case
(R59Connector's routed keying case → 38 cases), and both adj/ receipts were
re-run against the new bytes, which they now pin in `meterSha256`. The freeze
commit must record the frozen meter sha and exact selftest case count; the L1
re-runs this preflight at the data pass (runbook §2–3). The tool imports the
meter at run time and records the sha in every report. `adj/v19-line-audit.txt`
in the same directory is the meter seat's artifact; I did not touch it.

Pre-final shas (single-write discipline / defect fix / meter refresh, disclosed):
tool `9fbed9fc893a34f30827a240084eb3069f594c99cc056bde395c80a241d6df62`
(before the missing-parent-dir fix + meter pin); `rebind-r59-preflight.json`
`105b0c52d218033797c003f3c3e62ffac157b8c9c44a451e89e48f359aac4fc7` (pre-fix
tool) then `b1979d756cbf27c282066fd09ec3d48a7770d7f80c5abecf6370df4a1c1b0c4e`
(pre-meter-pin) then `d1b9db4e1b1f7dd1dc59ff4ede7604e2f533ea945f6c3d6945081997b3030e8f`
(against meter `7c4e4b5d…`); `rebind-r59-preflight-v19core.json`
`df8fad9741927975362f818f1480783610383a8699707a6a16969dc27cc1a70f`
(pre-meter-pin) then `1b360b99d2945b99bae8b0f2648bafb1658c625d595dd63f42c198ea273c1284`
(against meter `7c4e4b5d…`). The current shas in the table are the 60 s-stable
`0f956f86…`-pinned refresh. The draft TSV and inventory were written once and
not rewritten (v19's `BG_WORDS`/`DISPOSITIONS` literals are byte-identical to
v18's, so the scan did not need re-doing).

## 1. Rebind adaptation vs r58 (declared, same class)

- Names: `corpus/adjacency-host-audit-r59.tsv` / `-delta-r59.tsv`; schema strings
  `tabi-adjacency-r59-rebind|snapshot|rebind-unresolved`.
- `PREV_DELTA_REL = corpus/adjacency-host-delta-r58.tsv`;
  `METER_REL = ../counters/c1-adjacency-host-v19.mjs`; `verify` + `predicateFrom`
  unchanged names, so the preflight runs the v19 pure core directly.
- v19 (d): screened set = every roster sibling (v18 `rosterScan` derivation,
  minus tabi) × {`PROVINCE.md` ∪ every path its `corpus/adjacency.tsv` rows
  reference}. One `lane` row per `(lane,path)`; one `line` row per hit line.
  `--also-screen` is removed (the set is structural, not a CLI list).
- r59 (e) alignment: line rows are keyed `(lane, relPath, line)`; the rebind
  never writes a row for a non-hit line and never writes for a lane/file it did
  not screen.
- `--dry-run` + `--preflight-out`: steps 1–4 with no ledger write; normal mode
  is unchanged from r58's contract except the screen set. `--out` still refuses
  any path inside `corpus/`.
- `pinSourceLists()` keeps the duplicate `BG_WORDS`/`DISPOSITIONS` and dies (4)
  if the meter's literal lines drift; `meterSha256` is recorded in the snapshot
  and all reports.
- `node --check .ufo/waves/round-59/adj/rebind-r59.mjs` → exit 0 (`SYNTAX_OK`).

## 2. Newly screened lanes: heads, files, hits

Live heads at authoring (from `git -C <lane> rev-parse HEAD`):

| Lane | Head | Files screened (v19 (d)) | Lines | BG hits | File sha256 |
|---|---|---|---|---|---|
| kagi-shokunin | `91f7752ba551092eef20f6bd43d6dd798dc88ba0` | `PROVINCE.md` | 107 | 3 | `0bbf19b3019e780269259b1acbbd45fcb9a53139fe6337609e7bd6448b364edd` |
| kake-shokunin | `1240288fb1065ba4dfae0bb3beeaa9cbeb97ea27` | `PROVINCE.md` | 491 | 45 | `0513521fc4ac3d2a79ed53c86b3d82208e65a20d43ab927e2641eea75e361e7d` |
| kake-shokunin | same | `SKILL.md` (map ref `SKILL.md:697`) | 1,396 | 19 | `434967d478cd84aa462535968bdc88eba5b467d6c5c0ac1830f02cdd7d57a2e5` |
| kama-shokunin | `6035e952c2521999e192d6f236331f265ac98392` | `PROVINCE.md` | 270 | 0 | `f0aaae9ccfd0ecb6641ad1646934f4ff5555fcc45d2e397670b2eb5ff083e8a6` |
| kama-shokunin | same | `corpus/knowledge/listener-census.md` (map ref `…:355`) | 398 | 5 | `8cdecda6a4640a6ab1a882b9cf74e2bca82043ab6b5df12cb00b46a39b127620` |

These hit counts reproduce the r58 reviewer's live check exactly
(`.ufo/waves/round-58/w1/R58Reviewer.md` §A4: kagi 3, kake 45+19, kama 5).

Full-screen totals at the same heads (`screen-set-r59-inventory.json`): 20
siblings, 25 file screens (20 `PROVINCE.md` + 5 distinct map-referenced files:
kake `SKILL.md`, kama `corpus/knowledge/listener-census.md`, kaidoku
`corpus/knowledge/2026-10-14-r10-01-queue-ops.md` and
`…-r10-02-queue-ops-2.md`, kumitate `SCORECARD.md`), 140 hit lines, 31 rows
carried from the r58 delta (all still quote-exact at these heads), 12 lanes with
≥1 hit line, 8 zero-hit lanes (chousa, kasegi, kotodama, kumitate, lore, mori,
souji, tameshi). `deltaLanes 20` is the lane-row count, not the line-row count —
told to the L1 and to R59Meter; the L1's ruling confirms lane-row derivation.

## 3. Draft adjudication rule and dispositions

Columns: `lane, file, line, quote, disposition, ruling_ref, ruling_quote, head,
bg_word`. Dispositions use the meter-enforced frozen vocabulary
`no-tabi-ground | overlap-declared | contested-open` (the r58 exemplars in
`corpus/adjacency-host-delta-r58.tsv`). The audit-status words in the seat brief
(`sibling-absent|unchanged|moved|stale`) belong to the audit ledger and have no
referent here: these files carry no prior citation to compare against — for
these three lanes the r58 delta has zero rows.

Rule applied (stated so the reviewer/critic can attack it):

- `no-tabi-ground` (59 rows): the line contains browser-ground vocabulary but
  claims no tabi surface — kagi's secret-tooling inventory, kake's
  publisher-side crawl/robots/canonical content and its own gate tables.
- `overlap-declared` (5 rows): the line names the tabi/sibling boundary as a
  ruled split — kake `PROVINCE.md:40`, `:310`, `:329`, `:344` and
  `SKILL.md:697`. Rulings cited: `corpus/adjacency.tsv: crawler-discipline-vs-
  publishing` (40/329/344), `…robots-txt-publisher-audit-vs-client-obedience`
  (310), `…lab-performance-tool-runs` (697).
- `contested-open` (8 rows): the line names an unresolved joint surface already
  tracked as an open L0 question — kagi `PROVINCE.md:64`, `:81` (the-musketeer
  CDP 9222 profile lease; `fleet@ebeb396f…:.ufo/l0-questions.md:62`), kake
  `SKILL.md:161` (same lease), kama `listener-census.md:56`, `:241`, `:242`,
  `:243`, `:355` (live CDP 9222 target census;
  `fleet@b6b3b5e4…:.ufo/l0-questions.md:65`).

Verification: a separate process re-read every row's `head` and compared
`git cat-file -p <head>:<file>` line `<line>` with the TSV quote → **72/72 exact,
0 mismatches**; no row contains a tab or newline (TSV column-count check: 72/72
rows have 9 fields).

## 4. Preflight measurements

| Run | Command shape | Exit | Result |
|---|---|---|---|
| authored state (72 draft rows) | `node adj/rebind-r59.mjs … --dry-run --preflight-out adj/rebind-r59-preflight.json` | **3** | 37 unresolved (all kaidoku), `counts {roster 20, mapRows 16, auditRows 16, screenedLanes 20, screenedFiles 25, lineRows 103, unresolved 37}`, no ledger written |
| v19 core exercise (72 + 37 preflight-only placeholders = 109 explicit + 31 carried) | same, `--adjudications adj/preflight-only-adjudications-109.json`, `--preflight-out adj/rebind-r59-preflight-v19core.json` | **0** | predicate true, **findings 0**, counts `{roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20}`, 25 screens, 140 line rows, meter `0f956f86…` |
| control, v18 core on the SAME rows (scratch copy importing v18) | same inputs | **5** | **151 findings, all `delta-line-invented`** — the v18 screen keys stray line rows by line number only (A5/N4); receipt `adj/rebind-r59-v18core-rehearsal.json`. This is why the multi-file ledger is only valid under v19 (e). |

Meter drift across the authoring window (all pre-freeze): the meter's first
stable bytes were
`cc11af86f5a86c96310ed210dd4665f68c88f6dd9dbddc6df8c89362ac552e1c`, then
`7c4e4b5d…` (declared final, 37 selftest cases), then `0f956f86…` (37 + the
`kaidoku-multi-file-keyed-green` keying case = 38 cases). Every time the bytes
moved, both adj/ receipts were re-run against the new file and the pinned
`meterSha256` moved with them; the current receipts pin `0f956f86…`, whose
`--selftest` is 38/38 allPass. The green counts were identical on all three
shas (`{20,16,16,20,20}`, findings 0), so the drift is selftest surface, not
verify behaviour — but the freeze commit, not this note, is the pin of record.

## 5. Data-pass runbook (not executed)

`adj/data-pass-runbook.md` gives: freeze preconditions; the exact TSV→JSON
adjudication conversion (`72 adjudications` printed); the dry-run command; the
ONE-snapshot real pass (`--out adj/out`, `--snapshot-out
adj/rebind-snapshot.json`); the L1's corpus copy + commit; the v19 meter run with
the corrected counts; the per-lane `grep -c` new-surface proof; and the
head-move rule (rerun one fresh pass, never hand-edit a row). The dry-run's
`--out`/snapshot paths are scratch; the tool refuses `--out` inside `corpus/`.

## 6. Commands run (with outcomes)

| Command | Outcome |
|---|---|
| `git -C <lane> rev-parse HEAD` over the fleet (v18 rosterScan replicated in node) | 21 lane dirs, 20 siblings excluding tabi; all 20 have `PROVINCE.md` |
| `git -C kagi/kake/kama cat-file -p <head>:PROVINCE.md` (+ kake SKILL.md, kama listener-census.md) into scratch | 17,256 / 34,987 / 24,187 / 191,109 / 36,856 B; heads recorded above |
| node BG scan with the frozen 13-word list (case-insensitive substring) at those heads | 3 / 45 / 19 / 0 / 5 hits — matches R58Reviewer §A4 exactly |
| `node --check .ufo/waves/round-59/adj/rebind-r59.mjs` | exit 0 (`SYNTAX_OK`) |
| draft generation + independent re-read exactness check | 72 rows, 72/72 quotes exact at the recorded heads; 9 fields each |
| inventory generation | 25 screens, 0 absent, 140 hits, 31 carried, 72 drafted, 37 open |
| scratch v18-core rehearsal (dry-run, 109 inputs) | exit 5, 151 `delta-line-invented`; report landed |
| dry-run, 72 inputs, meter `0f956f86…` | exit 3, 37 unresolved; report landed |
| dry-run, 109 inputs (72 real + 37 placeholders), meter `0f956f86…` | exit 0, findings 0, counts 20/16/16/20/20 |
| `node c1-adjacency-host-v19.mjs --selftest` (consumer check) | exit 0, 38 cases, 38 pass, allPass true |
| `node --check` on the v19 meter (consumer check) | exit 0 |
| 60 s meter sha check | `0f956f86…` stable |

Not run (deliberately): the full rebind/normal mode; any corpus copy; the v19
meter itself; any git/jj mutation. No network fetch. No tool installs (nothing
was needed; pacman was not touched).

## 7. Risks, limits and open items for the L1

1. **37 unadjudicated hit lines** (all kaidoku): 12 in
   `corpus/knowledge/2026-10-14-r10-01-queue-ops.md`, 25 in
   `…-r10-02-queue-ops-2.md`, enumerated with verbatim quotes in
   `adj/screen-set-r59-inventory.json` → `uncovered`. The L1 adjudicates them at
   data time (stated in the L1's ruling); until then the rebind correctly exits 3.
2. **`adj/preflight-only-adjudications-109.json` is NOT a landing input.** 37 of
   its rows are `no-tabi-ground` placeholders used only to reach the v19 core.
   Landing it would assert unadjudicated dispositions. The runbook says so.
3. **Pre-freeze meter drift, measured and handled.** The meter moved twice during
   authoring (`cc11af86…` → `7c4e4b5d…` 37-case → `0f956f86…` 38-case, the last
   adding R59Connector's `kaidoku-multi-file-keyed-green` keying case). Both
   receipts were re-run at each move and now pin `0f956f86…` (`meterSha256`);
   its `--selftest` is 38/38 allPass and the green verdict/counts were identical
   on all three shas. The freeze commit — not this note — must pin the exact
   meter sha and selftest case count, and the L1 should re-run the preflight from
   the frozen bytes before the data pass. If the bytes move again, the tool reads
   the new file at run time and `pinSourceLists()` dies on `BG_WORDS`/
   `DISPOSITIONS` drift; any (d) derivation change surfaces at the data-time
   preflight as `bg-screen-missing` / `delta-line-missing`; no ledger row is
   hand-patched to hide it.
4. **One-snapshot discipline:** sibling heads move (tsukuroi moved during this
   seat: `c68bfe97…` → `aa75398e…`, PROVINCE bytes unchanged). The rebind and the
   v19 meter each take their own head snapshot; they must be run back to back and
   re-run as a pair if any head moves (runbook §6).
5. **Draft judgments are pre-data.** Dispositions are keyed by
   `(lane,path,quote)`, so a head move relocates lines without losing a ruling; a
   byte change that deletes an adjudicated line surfaces as unresolved, never a
   silent pass. The line numbers in the TSV are evidence at the recorded heads,
   not keys.
6. **The v18-core control is not a v18 ledger verdict**: it deliberately feeds
   the v19 screen set to the v18 core to demonstrate the A5/N4 defect. Its report
   schema is the r59 one; the file name and this report name it a rehearsal.
7. Process notes: one mechanical multi-site replacement (six report writes) was
   applied with `perl -0pi` and verified with `node --check` plus both dry runs
   (pre-replacement tool sha above); the bounded read-only v19 poll was
   auto-backgrounded by the harness after 60 s (no writes) and its result was
   used. No labrat was needed. Scratch `/fast/scratch/hyaku/tabi-r59/R59Rebind/`
   is deleted after this report; every cited byte is in this directory or the
   lane's committed bytes.
