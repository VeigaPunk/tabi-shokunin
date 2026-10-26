# CritC2Counter — C2 frozen v3 counter as an instrument (m4 class)

Seat: CritC2Counter (attack). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`, clone at
`/fast/scratch/hyaku/tabi-r32/CritC2Counter/clone` detached at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`,
`scripts/check-selfassessment.mjs` sha256 `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`
(= `claims.json` frozenDigests). Node v24.21.0. No installs, no lane writes, no browser started.

## Verdict

**The freeze reading of 18 holds; the target-0 path does not.** The counter's own numbers reproduce exactly
(`mismatches=18`, `counted = 15 × m1-selftest-tally + 3 × m4-nudge-state` at lines 1473/1515/1576), the
derivation behind the three m4 findings is independently correct (capability rounds
`[1,13,16,17,22,23,24,25]`; no capability row enters in 26–31; every axis ≥ 8), and none of the defects below
changes any of the 18. But the m4 class is **defective as an instrument** in three ways that matter before this
round ends: (1) a correction bullet that *quotes* the stale phrase is itself parsed as a fresh round-32
statement, so the natural append-at-end correction leaves 3 fresh mismatches (demonstrated end-to-end: CLI exit 1,
3 phantoms at 1615–1617); (2) a round-32 capability-table cell whose **first** digit run is 29–31 silently flips
rounds 29–31 and manufactures 4 phantoms (CLI exit 1, mismatches 4); (3) a single *ordinary* sentence containing
the substring `correct`, a `SCORECARD.md:` range and the words `nudge active` clears all three findings (CLI exit
0, `superseded=true` ×3) without being a correction at all. Two further operational traps (correction placed
before the statement never clears; a citation of the state-word line `:1474` rather than `:1473` never clears) and
six blind-spot classes (phrasings, per-group input requirement tighter than `AXES.md`, capability-cell shapes,
statements outside `## Round N`, rule quotations, duplicate counting) are listed with fixtures.

## Evidence — commands and exit codes

Baseline (clean clone, frozen bytes, working tree clean before the run):

```
$ TMPDIR=$S node scripts/check-selfassessment.mjs --rev HEAD --json   # exit 1
rev=4181fffb… mismatches=18 findings={"m1":109,"m2":77,"m4":9} counted={"m1":15,"m4":3}
m4_counted=1473,1515,1576
```

`capabilityRounds(SCORECARD.md @4181fff)` → `[1,13,16,17,22,23,24,25]`. Every `## Round 23`…`## Round 27`
statement reads `inactive` against derived `inactive`; `## Round 28` is could-not-evaluate. Capability rows in
26–31 are explicitly absent (`SCORECARD.md:1356,1403-1404,1427,1456,1501,1544,1603`), so 29–31 derive `active`
and the three counted statements are genuine.

Probe harness `probe.mjs`–`probe5.mjs` import the frozen module (argv redirected at an inert fixture repo) and
call the *production* `m4Findings`/`capabilityRounds`; every probe exited 0; transcripts in this seat's output
dir (`probe.out` 211 lines, `probe2.out` 107, `probe3.out` 43, `probe4.out` 27, `probe5.out` 13).
Production-path fixtures are committed repos containing only `SCORECARD.md`, so m1 findings are
could-not-evaluate there by construction and only m4 counts are compared.

```
$ node clone/scripts/check-selfassessment.mjs --repo $PWD/fx-target-quoted-round32   --rev HEAD --json  # exit 1
  m4 counted 3: line=1615,1616,1617 round=32 claimed=inactive observed=active    (1473/1515/1576 superseded)
$ node clone/scripts/check-selfassessment.mjs --repo $PWD/fx-target-safe-round32     --rev HEAD --json  # exit 0
  m4 counted 0
$ node clone/scripts/check-selfassessment.mjs --repo $PWD/fx-target-safe-poisoncell  --rev HEAD --json  # exit 1
  m4 counted 4: line=1607,1615,1616,1617 round=32 claimed=active observed=inactive (1576 no longer counted)
$ node clone/scripts/check-selfassessment.mjs --repo $PWD/fx-falseclear              --rev HEAD --json  # exit 0
  lines 1473/1515/1576 SUPERSEDED by one ordinary paragraph
```

## Defect list

| # | Severity | Defect | Evidence | Changes 18? |
|---|---|---|---|---|
| D1 | high | A correction bullet that reproduces the stale phrase is parsed as a new statement of the round whose group it lands in; the same paragraph cannot clear it (`p.start <= no`). Three bullets quoting `nudge inactive` inside `## Round 32 — corrections` (merged with `## Round 32 — declared claims`, which supplies the axes) give 3 fresh counted mismatches → net count stays 3. | `fx-target-quoted-round32`: CLI exit 1, counted 1615/1616/1617. `probe2.out` A1/A10; `probe3.out` target-quoted. | no (no such text at the freeze) |
| D2 | high | `capabilityRounds` takes the **first** digit run of a table row's last cell. Cell `loopback rows 30 measured, round32` ⇒ capability round 30, so round 31's statement derives `inactive` (its true finding is **suppressed**) and round 32's correct `nudge active` becomes a phantom ×4. | `fx-target-safe-poisoncell`: CLI exit 1, mismatches 4; `probe.out` F5/F8; `probe3.out`. | no (no round-32 table yet) |
| D3 | high | Clearing accepts any paragraph with the substring `correct` (so `correctly`, `incorrect`), any `SCORECARD.md:` line **range** containing the statement, and the words `nudge <observed>`. Ordinary round prose therefore clears findings: one sentence in `## Round 32 — waves and seats` — "Re-ran `git grep … SCORECARD.md:1470-1580`; the instrument correctly reads the nudge active state" — superseded all three. | `fx-falseclear`: CLI exit 0, 1473/1515/1576 `superseded=true`; `probe2.out` A9. | no (no such paragraph at the freeze) |
| D4 | medium | A correction placed **before** the statement (the lane's own convention: `## Round 29 — corrections` sits above `## Round 29 — declared claims`) never clears it. Inserting the correction at the end of the round-29 corrections section leaves all three counted. | `probe2.out` A4: counted=3, statement at 1474. | no |
| D5 | medium | The finding's line is the line holding the token `nudge` (1473), not the state word (1474). A correction citing `SCORECARD.md:1474` alone does not clear; `:1473-1474` does. | `probe2.out` A5 (counted), A6 (superseded). Real text: `SCORECARD.md:1473` ends `nudge`, `:1474` starts `inactive;`. | no |
| D6 | medium | The correction's round is never checked. "Correction — supersedes `SCORECARD.md:1473`: the nudge was active for round 30" clears the round-29 statement. | `probe2.out` A8. | no |
| D7 | medium | A range citation clears every round in the range: `SCORECARD.md:1470-1580` + "the nudge was active for every round in the range" clears 29, 30 and 31 with one sentence. | `probe2.out` A7: counted=0. | no |
| D8 | medium (low for 18) | Phrasing blind spots: `nudge is not active`, `does not use the nudge`, `nudge waived`, `nudge fires`, `nudge remains inactive`, `no stagnation nudge`, `nudge state: inactive`, `nudge = inactive`, `nudge is dormant`, `\| nudge \| inactive \|` are all invisible. Live text: `SCORECARD.md:523` "this round does not use the nudge" (round 12) and `:431` "the nudge fires only after all six axes reach 8" (inside `## Kaika fleet round-1`, not a round group); a waiver family at `:464,532,595,664,781,825,907` says "no waiver used" instead of "nudge inactive". | `probe.out` F1 (11 variants: 2 matched, 9 missed), F2. | no — masked twice: `:523`'s round-12 group also fails every input test (`probe4.out` case 1: 3 counted), and `:431` is outside any round group. |
| D9 | medium | Inputs must sit in the **same round group** although `AXES.md` requires the saturation line and window only "recorded in `SCORECARD.md`" (the document records them once, `:389-391`). Consequence: round 28's statement at `:1456` is could-not-evaluate because its axes are written `axes depth 8, …` at `:1432`; also unparsed: `depth: 9` colon form, >240 chars after the label, `Saturation line8 and window3` (`:523`), axes in a markdown table (`:466-473`), axes in a different round's section. | `probe.out` F4; live `:1456` CNE in the baseline JSON. Same-round other-section axes **do** work (merged by round number, even across an intervening non-round `##`, `probe.out` F3). | no — round 28's claim is in fact correct (`inactive`, capability 25 in window 25–27). Latent: `probe4.out` case 2 shows a 4th true mismatch at round 12 once phrase **and** inputs are fixed (count 4). |
| D10 | medium (low for 18) | Capability blind spots: prose `first-working13` (live at `:657` round 14 and `:728` round 15) and `First-working: 3`, `first working round 3`, header not in the last cell, word numerals are all unseen; conversely a **name** cell is read as a round (`:426` cell `kaika-fleet-round-1` ⇒ capability round 1; `probe.out` F8 `bi-transport-v3` ⇒ 3). | `probe.out` F5; real `capabilityRounds` contains the spurious `1`. | no — 13 and 1 lie outside all windows that carry a statement (26–30 / 9–11). |
| D11 | low now, medium if round 32 documents the grammar | False positives: a **rule quotation** inside a derived-inactive round ("the nudge is active when every axis sits at or above the saturation line…") is counted; a round that documents accepted spellings ("`nudge is active` and `nudge is inactive`") is guaranteed exactly one mismatch; a repeated statement is counted twice; a line wrap `…nudge\nactive…` merges into a claim. | `probe.out` F7 (2 cases), F9, F10. | no — no such text in rounds 29–31. |
| D12 | low | Statements outside `## Round N` groups are invisible entirely: `## Saturation`, an intro paragraph, and a `## Rounds 5-7` heading all yield 0 findings. | `probe.out` F2. | no — the two live non-round mentions (`:391`, `:431`) are rule text, not state claims. |

## Impact on the freeze reading of 18

None of D1–D12 changes it. The m4 contribution is exactly 3 and each is a real stale claim:
`SCORECARD.md:1473` (round 29), `:1515` (round 30), `:1576` (round 31) say `nudge inactive`; with saturation 8 /
window 3 and the last capability row at round 25 (`:1306`, `:1314`) the derived state is `active`, and the document
itself declares no capability row for 26–31. `superseded=false` for all three in the baseline JSON, so no existing
paragraph clears them. The 15 m1 mismatches were not audited here (out of scope).

## Smallest safe correction

For the C2 landing (wording only, no counter edit — scripts/ frozen):
1. The correction bullets must not contain the matchable phrase: use "that stagnation-nudge statement is stale; the
   derived state is `nudge active`" per line, citing `SCORECARD.md:1473`, `:1515`, `:1576`. Verified: whole-document
   CLI exit 0, m4 counted 0 (`fx-target-safe-round32`).
2. The round-32 capability row's last cell must begin with the round token (`round32`, or exactly `32`). Never let a
   digit in 29–31 lead the cell (`30 loopback rows …` poisons rounds 31 and 32 — D2).
For the counter (next freeze, not this round): (a) anchor the marker to `\b(correction|supersedes?)\b`; (b) bind the
citation to the statement's own round or forbid cross-round ranges; (c) accept either line of a wrapped statement;
(d) parse capability cells only on an explicit round token and ignore name cells; (e) accept the document-level
saturation/window and table-form axes, per `AXES.md`'s actual wording; (f) treat statements inside inline code in a
correction context as quotations, not claims.

## Hygiene

Scratch `/fast/scratch/hyaku/tabi-r32/CritC2Counter` deleted before yielding (receipts copied to
`.ufo/waves/round-32/w1/CritC2Counter/`: baseline JSON + summary, counter digest, five probe transcripts, three
target documents, three fixture JSONs, false-clear JSON + summary, fixture toplevels). No chromedriver/chromium
process was started by this seat. At 21:0x UTC `pgrep -fa 'chromedriver|chromium'` returned only the host's own
`earlyoom` argv (its `--prefer` regex text); a later check shows chromedriver/chromium belonging to the sibling seat
`ExecInterceptPhases` (`--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/tmp/...`), not to this seat,
whose scratch is deleted. No lane/fleet file written; commits only inside the scratch
fixture repos, each verified with `git -C <dir> rev-parse --show-toplevel` equal to its own directory.
