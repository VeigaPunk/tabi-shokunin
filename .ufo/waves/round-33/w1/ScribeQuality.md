# ScribeQuality — round 33 w1 (frontier step: QUALITY criteria 87+)

**Verdict.** Four criteria are drafted as an appendable block after criterion 86, one per failure mode the
round-33 controls actually carry: (87) a frozen sweep is answered only by mapped-or-screened coverage and never by
one count, (88) a new map row covers a candidate only when its quotes name the other lane, (89) a gate is scored on
three independently-moving populations including a whitelist control, (90) a feasibility sentence exists only after
the cheapest forgery was run. Every rule is grounded in a frozen reading I re-read from
`.ufo/waves/round-33/baseline/` (the counters' bytes hash to the frozen digests in `claims.json`), and every red
state is a committed control, not a construction of mine. No instrument enforces 87-90 yet, so they are rules with
hand-read red states (criterion 82's discipline), and that limit is stated here rather than in the criteria. No lane
file, lane index, sibling repo or fleet file was touched; no clone, browser, network fetch or tool install was needed.

## Evidence

Commands, all run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`, all exit 0 unless noted:

| # | command | exit | reading |
|---|---|---|---|
| 1 | `grep -cE '^[0-9]+\.' corpus/QUALITY.md` | 0 | `86` — the last numbered criterion is 86, so the block starts at 87 |
| 2 | `sha256sum .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs scripts/check-adjacency.mjs scripts/check-bidi-runtime.mjs` | 0 | `da59d157…c6380`, `51ace65f…e812b`, `4e2c2a64…24aac`, `2f25af5a…c393` — all four equal `claims.json` `frozenDigests` / the C2 `GOLDEN_GATE_SHA256`, so the controls I read are the frozen counters' output |
| 3 | `node -e '…require("./.ufo/waves/round-33/baseline/c1-J2-screen-all.json")…'` | 0 | `screened 47`, `unaccounted 0`, `newMapped 0`, `adjacency {verdict:"clean",rows:10,verified:10}`, `predicate false` |
| 4 | same for `c1-J3-junk-rows.json` | 0 | `adjacency {clean,rows:14,verified:14}`, `mapped 5`, `unaccounted 47`, `newMapped 0`, `predicate false` |
| 5 | same for `c1-J4-mislabel-unnamed.json` | 0 | `adjacency {clean,rows:14,verified:14}`, `mapped 9`, `unaccounted 43`, `newMapped 0`, `predicate false` |
| 6 | same for `c2-J1-do-nothing.json` | 0 | `forgeriesAccepted 8`, `acceptedForgeries ["F1"…"F8"]`, honest all true, `selftest {exit:0,"…verdict=clean cases=27 passed=27"}` |
| 7 | same for `c2-J2-reject-all.json` | 0 | `forgeriesAccepted 0`, `honest {H0:false,H1:false,H2:false}`, `predicate` false |
| 8 | same for `c2-J3-whitelist.json` | 0 | `forgeriesAccepted 0`, honest all true, `digestLiterals` 5 × 12-hex, `selftest {exit:3,"…verdict=failed cases=27 passed=25"}` |
| 9 | `node -e '…require("./.ufo/waves/round-32/claims.json") C1.feasibilityDisclosed'` | 0 | "…it is not reachable without a committed receipt of two real runs from a driver other than the counter (controls J3/J4)" — the sentence criterion 90 makes a finding |
| 10 | `grep -n "feasibilityDisclosed\|Routed defects" corpus/lessons/round-32-verifier-spotcheck.md` | 0 | routed defect 4 at `:151`; the spot-check's own disclosure at `:63` |
| 11 | `node -e '…c1-J2…perLane'` | 0 | `kake 42` of 52 candidates (`kagi 4, kaidoku 2, kengaku 1, kotoba 1, revenger 1, tsukuroi 1`) — one sibling carries most of C1 |
| 12 | `awk 'FNR>=493 && FNR<=528 {if(length>m)m=length}' corpus/QUALITY.md` | 0 | max 147 — the drafted widths (111-118) are inside the round-32 block's own range |

Grounded citations used by the criteria (file:line):

- `scripts/check-adjacency.mjs:44-95` (map-shape header) — 9 TAB columns, `sibling_quote`/`tabi_quote` 4-25 words and >= 20
  non-space chars, `ruled`/`contested-open` need a ruling, `split-declared`/`refused-route` need `-` and a tabi-side
  quote; `:111-155` the closed finding vocabulary. The gate verifies quotes and uniqueness, never overlap — the basis
  of criterion 88.
- `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:31-41` (definitions) and `:61-62` (`SCREEN_HEADER`, `SCREEN_REASONS`) — `screened` requires the
  exact `<lane>@<pin>:PROVINCE.md:<n>` ref, a closed reason, a verbatim quote, and for `same-surface` a surface naming
  a mapped-verified row of that sibling; `newMapped` requires the named-other-side clause.
- `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:21` (golden transcripts), `:57` (`GOLDEN_REV`), `:72` (`VARIANTS`) — `GOLDEN_REV` synthetic transcripts "never from
  REV's gate", H0/H1/H2 + F1-F8, the digest-literal clause; basis of criterion 89's "prior-era golden output".
- `.ufo/waves/round-33/claims.json:38` (C1 `feasibilityDisclosed`), `:56` (C2 `feasibilityDisclosed`) — the green form
  criterion 90 rewards.
- `corpus/lessons/round-32.md:179-187` — the wave-2 precision errata carried; routed defect 4 is the one that is a
  QUALITY gap, the rest belong to the ScribeRoutedDefects ledger and are not duplicated here.

## Deliverables

- `.ufo/waves/round-33/w1/ScribeQuality/quality-87.md` — criteria 87, 88, 89, 90 with the append header
  `## Round 33 additions (append-only; never edit above)`, each rule followed by its red state and `(source: …)`.
- this report: `.ufo/waves/round-33/w1/ScribeQuality.md`

## Findings and limits (for the L1)

1. **Two criteria for candidate (a), deliberately.** 87 covers coverage accounting (J2 screens all, J3 makes the map
   gate clean while 47 stay unaccounted); 88 covers the named-other-side clause (J4 is clean at 14/14 verified and
   still scores `newMapped 0`). They fail under different controls and neither red state reaches the other's, so
   merging them would hide one failure mode. If the L1 prefers one criterion, 88's sentence folds into 87 as the
   `newMapped` clause with J4 kept as the red state.
2. **`corpus/lessons/round-33.md` does not exist yet** (verified absent: `wc -l corpus/lessons/round-33.md` printed "No such file or directory");
   the ScribeLesson seat was still running. Criteria cite its assigned sections (`§Gate`, `§Mistakes`) and no M number;
   the L1 assigns numbers on filing. This is the only citation that is not a frozen artifact.
3. **No instrument enforces 87-90.** 87/88's clauses are the frozen counter's own rules (`unaccounted`, `newMapped`,
   `same-surface`), so their counters exist; 89/90 are read by hand against the control JSONs. Stated as a limit, per
   criterion 82, not as a rule the lane claims to check.
4. **89 does not supersede 86.** 86 governs what an admitted count means (distinct surfaces); 89 governs which
   populations a `forgeriesAccepted` number is read against (honest / forgery / whitelist). The draft says this in its
   own last sentence so a later reader cannot read 89 as a widening of 86.
5. **C2's feasibility text is honestly weaker than C1's** — it says a smarter forgery survives F1-F8 by construction.
   Criterion 90 does not demand that the limit be closed; it demands the attack have been run before the sentence was
   written, which the F1-F8 controls satisfy.
6. **42 of 52 C1 candidates are kake's** (`c1-J2-screen-all.json` `perLane`). Criterion 87/88's coverage therefore
   depends mostly on one sibling's lines; that is a fact about the sweep, not a defect in the criteria, and the wave-2
   attacks (one per new row and per screen-reason group) are where it can be judged.
7. Out of scope by assignment: no edit to `corpus/QUALITY.md` or any lane file, no criteria drafted from the five other
   wave-2 errata reports (they are the routed-defects ledger's), no assimilation (claims `notClaimed`).

## Housekeeping

- Scratch: none created (`ls /fast/scratch/hyaku/tabi-r33/ScribeQuality` → exit 2, no such directory); no clone.
- Browser processes: none started. `pgrep -fa 'chromedriver|chromium'` returned one line, PID 1371
  `/usr/bin/earlyoom -r 3600 --avoid (^|/)(Hyprland|…) --prefer (^|/)(java|node|chromium|python3?)$` — earlyoom's own
  argv matching the pattern, not a browser I started; no chromedriver or chromium process is mine.
- Tool installs / upgrades: none. Network fetches: none.
