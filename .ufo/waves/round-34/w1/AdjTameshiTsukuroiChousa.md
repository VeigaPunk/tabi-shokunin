# AdjTameshiTsukuroiChousa — C1 disposition drafts (tameshi / tsukuroi / chousa candidates)

**Verdict.** All eight assigned candidates — rows 32–38 and 67 of the frozen
`baseline/c1-candidates.tsv` — are non-overlaps, so this seat drafts **8 screen rows and 0 map rows**:
seven `third-lane-report` (tameshi's suite-census sightings of tabi's `tools/` directory and tsukuroi's
inbound-anchor ledger rows that quote tabi's own round-16 wave artifacts) and one `no-claim-declared`
(chousa's intake `window_mode:` line denying browser/CDP/session access). No declaration bullet, no L0 line
and no `rows.tsv` row is drafted: mapping any of these would manufacture a tabi side that does not exist, and
the C1 kill rule forbids mapping a non-overlap to reach `newMapped`. The screen ledger verifies: installed in a
scratch clone at `59f1b47a…` as commit `ddd52e18ffa8d0103af22379d864dddb9f3ca4fb`, `check-adjacency` is
`verdict=clean rows=13 verified=13` and the frozen C1 counter reports `screened=8 screenFindings=[]`, with none of
the eight seat keys left in `unaccountedKeys`. The counter's wave-level predicate stays false on this partition
alone (`unaccounted=58 newMapped=0`), which is expected: the ≥3-new-row half of C1 must come from the other w1
seats' candidates (the L1's pre-freeze reading named kake `SKILL.md:697` / `field-performance-cwv.md:153`,
kake `SKILL.md:408`, kasegi `mission-control.md:119`, kotoba's agent-facing-text rows).

## Evidence

Scratch `/fast/scratch/hyaku/tabi-r34/AdjTameshiTsukuroiChousa`; one clone
(`git clone --shared …/tabi-shokunin "$S/clone"`, `git checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee`);
`git -C "$S/clone" rev-parse --show-toplevel` printed the clone dir, so every git mutation ran there.

1. **Candidate bytes read at the sibling pins** (`git -C <lane>-shokunin show <pin>:<path> | sed -n`),
   compared with the frozen TSV text: 8/8 equal (row 36's pin line carries two leading spaces the TSV trims).
2. **Quote verification** — for each of the 8 screen rows:
   `git -C <lane>-shokunin show <pin>:<path> | sed -n '<line>p' | grep -c -F -- '<quote>'` printed `1`
   (8/8 present; word counts 4–12, non-space chars 23–93, all inside the gate's 4–25 / ≥20 window).
3. **Sibling-side context read** (all at the candidate's own pin):
   - `tameshi-shokunin@c6295cb0…:corpus/knowledge/fleet-kill-rate-ledger.md:120-136` — a "Boundary — sightings
     and adjacent machinery, not queued" paragraph listing kake/kama/kotoba file existence, then
     "tabi `tools/` absent"; tameshi's `PROVINCE.md:3-18` owns verification-fixture method and refuses product
     domains (":14 every lane's gate remains its own").
   - `tameshi-shokunin@c6295cb0…:corpus/knowledge/fleet-suite-census.md:298-316, 611-629, 638-652` — suite-census
     receipts: "`tabi-shokunin/tools/` were empty at read" (306), "tabi `tools/` still absent (`ls
     tabi-shokunin/tools` → No such file or directory, rc=2)" (621-622), "tabi tools absent" in the S3
     pin/drift anchor list (646).
   - `tsukuroi-shokunin@a84fc9de…:corpus/knowledge/adjacency-anchors-r19.md:1-25 and 187-188` — the file's own
     preamble says it is a census of **inbound** pointers *into tsukuroi files*; IN-092/IN-093 are extracted from
     `tabi:.ufo/waves/round-16/…` and resolved against `tsukuroi PROVINCE.md:8-14` / `:27` (pacman state,
     "Never installs, upgrades, or removes packages"). The operative content is host package state, and the tabi
     side cited is wave scratch (`.ufo/`), which `scripts/check-adjacency.mjs` refuses as a `tabi_ref`.
   - `chousa-shokunin@00f8c7f5…:corpus/knowledge/archived-export-intake.md:8-30` — the record's Meta block:
     `window_mode: loopback, local file reads only, … no browser, CDP or session access …`; chousa's
     `PROVINCE.md:3-15` owns research method and refuses external live-target research without approval.
   - Tabi side: `PROVINCE.md:3-19` (browser craft, CDP discipline; refuses RE/publishing/secrets) names none of
     tameshi, tsukuroi or chousa; `SKILL.md` has one tsukuroi mention (`SKILL.md:2827`, the PROVINCE-scan roster
     string) — a citation, not a claim on tsukuroi's host surfaces.
   - Round-33 w1 `ConnSiblingScan.md:86-99` recorded the same reading for these groups ("tsukuroi …
     third-lane record, not a new claim", "chousa … explicit denial — an anti-claim", "`tabi` in administrative
     roster/citation contexts (mori wave-settlement, tameshi fleet census)").
4. **Clone commit** — the only write is the new ledger:
   `git show --numstat ddd52e18…` → `9  0  corpus/adjacency-screen-skill.tsv` (header + 8 rows; no existing
   lane file touched, `corpus/adjacency.tsv` unchanged, `SKILL.md` unchanged because no declaration exists).
5. **Gate** — `TMPDIR="$S/tmp" node scripts/check-adjacency.mjs --at ddd52e18… --repo "$S/clone" --fleet
   /home/vgpnk/Projects/shokunin --json` → exit 0,
   `{"verdict":"clean","rows":13,"verified":13,"selfRulings":[2]}`; text mode →
   `ADJACENCY verdict=clean rows=13 verified=13`. `check-adjacency.mjs` at the commit hashes to
   `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (the pinned digest).
6. **Frozen C1 counter** — `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev ddd52e18…
   --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → exit 1 (predicate not met on this
   partition), counter sha256 `0dba816c…a8781e` = `frozenDigests`:
   `predicate=false candidates=67 mapped=1 screened=8 unaccounted=58 newMapped=0 newMappedRows=[] screenFindings=[]`,
   `adjacency={verdict:"clean",rows:13,verified:13}`. None of the eight seat keys appears in
   `unaccountedKeys` (58 remaining keys belong to kake/kotoba/kaidoku/etc. partitions of other seats);
   `screened=8` equals exactly this seat's rows (baseline screened was 0).

## Per-candidate table

| key | decision | reason (both sides) |
|---|---|---|
| `tameshi-shokunin@c6295cb0473ec75a7f97b479321706b684adefac:corpus/knowledge/fleet-kill-rate-ledger.md:128` | screen `third-lane-report` | tameshi's boundary paragraph lists tabi `tools/` as a census sighting ("gate-ness is U"); tabi `PROVINCE.md:3-13` owns browser craft with no gate/tooling surface, so there is no overlap to map. |
| `…/fleet-suite-census.md:306` | screen `third-lane-report` | suite census records `tabi-shokunin/tools/` "empty at read" — a roster fact about tabi tooling against tabi `PROVINCE.md:9-13` browser/CDP ground. |
| `…/fleet-suite-census.md:621` | screen `third-lane-report` | cross-ref paragraph repeats "tabi `tools/` still absent" as a read receipt; same census surface, no browser claim on either side. |
| `…/fleet-suite-census.md:622` | screen `third-lane-report` | the `ls` receipt (`rc=2`) for that same absence — a measurement fact about tabi, not a claim on tabi ground. |
| `…/fleet-suite-census.md:646` | screen `third-lane-report` | S3 drift/queue anchors list "tabi tools absent" beside kagi gate pins; roster fact, no overlap with tabi `PROVINCE.md:6-13`. |
| `tsukuroi-shokunin@a84fc9dec860f8bea516dff7ddfdc98223cdae52:corpus/knowledge/adjacency-anchors-r19.md:187` | screen `third-lane-report` | IN-092 extracts a pointer from tabi's own round-16 draft and resolves it against tsukuroi `PROVINCE.md:8-14` pacman state: it reports tabi's claim, and host package state is not tabi browser ground. |
| `…/adjacency-anchors-r19.md:188` | screen `third-lane-report` | IN-093 does the same for `tabi:.ufo/waves/round-16/w1/ConnSiblings.md:71` against tsukuroi `PROVINCE.md:27` — a third-lane record of tabi's own boundary, not a claim on it. |
| `chousa-shokunin@00f8c7f5272a1d98b6d34913985fa4537e00aaf9:corpus/knowledge/archived-export-intake.md:20` | screen `no-claim-declared` | the record's `window_mode:` line denies "no browser, CDP or session access" — an anti-claim, so chousa claims nothing on tabi ground (same reading, round-33 w1 `ConnSiblingScan.md:98-99`). |

## Findings / limits for the L1

- **Wave-level target risk:** this partition contributes 0 of the ≥3 new map rows. If the kake/kasegi/kotoba
  seats also return screens, C1 fails honestly; the L1 should weigh that before integration rather than accept
  a manufactured row here.
- **`third-lane-report` may be over-used in the ledger:** 7 of 8 rows share it. The rows are textually distinct
  reports (two sibling lanes, five census/inventory records), but a wave-2 attack may probe whether tameshi's
  `tools/`-absence sentences are better read as `not-browser-sense`; either label accounts for the candidate,
  and `third-lane-report` was chosen because each line is *about tabi* (a roster/census fact) rather than
  silent about browser work.
- **tsukuroi 187/188 carry tabi-side evidence under `.ufo/`:** any later attempt to map these would need a
  different tabi-side line (the gate refuses `.ufo/` tabi refs) and would have to survive the "restatement of
  tabi's own boundary" objection; not attempted.
- **Not claimed:** no map row, no declaration bullet, no L0 line, no `corpus/adjacency.tsv` change; the round-33
  `corpus/adjacency-screen.tsv` (different ledger) is untouched. No tool installs, no network fetches, no
  browser launches, no lane/index/jj/fleet writes; scratch deleted after copying receipts.

## Deliverables

- `.ufo/waves/round-34/w1 = build + first falsifiers/AdjTameshiTsukuroiChousa/screen.tsv` — 8 screen rows,
  5 TAB columns, no header.
- `…/AdjTameshiTsukuroiChousa/rows.tsv` — empty (no map rows).
- `…/AdjTameshiTsukuroiChousa/decl.md` — why no declaration bullet exists (grouped reasons).
- `…/AdjTameshiTsukuroiChousa/l0.txt` — empty (no contested-open).
- `…/AdjTameshiTsukuroiChousa/candidates.md` — the per-candidate table above.
- `…/AdjTameshiTsukuroiChousa/adj.json`, `adj.txt`, `c1.json` — raw gate/counter output at
  commit `ddd52e18ffa8d0103af22379d864dddb9f3ca4fb`.
- `…/AdjTameshiTsukuroiChousa/commands.txt` — exact commands, exit codes, digests.
