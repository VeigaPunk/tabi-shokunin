# Round 35 w1 — dispositions for round-33 wave-2 findings U15–U28

seat: ScribeUDispositionsB (scribe, leaf). write scope: this report, `.ufo/waves/round-35/w1/ScribeUDispositionsB/`,
scratch. No lane file, index or jj state touched; no gate, counter, build, linter or formatter run (scribe seat).

## Verdict

**All fourteen findings U15–U28 still hold at the round-35 freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`;
none is refuted, none was fixed, and none was silently absorbed by round 34.** Each named byte was re-read in a
detached clone at the freeze (36 checks, 36 HOLDS, 0 BROKEN, `holds-receipt.txt`): the criterion-88 mutuality
headline is still at `corpus/QUALITY.md:545`, criterion 89 still points at §Gate (0 battery terms there, 5 in M1),
criterion 90 still names the double-counted construction and omits v4, the two screen cells at
`corpus/adjacency-screen.tsv:21`/`:29` still carry `crawler-discipline-vs-publishing`, `corpus/README.md:766`
still claims "Every browser-domain line" over a regex-bounded population, the two kake/robots surfaces still share
one restated split with no granularity rule, quote-truncation still survives every instrument **including round
35's frozen counter at `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:242`**, R4 is still `shots.some`,
the driver check is still exact-byte against a SKILL row that says "that is the gate", MutGateV2's M03 text still
says `YES` "admits nothing", the refetch check is still two typed names, the round-33 C2 counter still has two
unexercised exit-2 `Refusal` paths, and the gate header still lists "lessons absent" under exit 2. `git log -S`
shows every one of those byte strings last moved by the commit that introduced it (`bf48b81` round 33, `2f8535c`
round 32), and the freeze adds only `.ufo/waves/round-35/**` plus append-only `LOG.md`/`SCORECARD.md` blocks.
Dispositions: **8 correction-drafted** (U15, U16, U17, U18, U19, U20, U26, U28), **4 routed** (U21, U22, U25,
U27), **U23 split** correction-drafted (wording) / routed (normalised digest), **U24 fixed in substance by
`04f9623d`** (a shipped case now pins the admitted behaviour) with its stale sentence correction-drafted. Four
findings carry a stale *example* while the defect stands (U15's row-15 example, U18's seat locators, U19's
`:354-363` range, U24's `:856`) — recorded in the deliverable, not upgraded to "rejected". One conflict between two
round-33 critics over screen row 6 (kake:22) is reported verbatim and left for the L1 / canonical judge.

## Evidence

Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then
`git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83`; `rev-parse HEAD` printed the
freeze. All reads read-only; nothing written outside my own directories.

Verification run (script and its output are deliverables):

```
$ bash .ufo/waves/round-35/w1/ScribeUDispositionsB/verify-holds.sh "$S/clone" > holds-receipt.txt 2>&1
$ echo $?
0            # 36 HOLDS, 0 BROKEN
```

`git show --name-only a4bfef0` → only `.ufo/waves/round-35/**`, `LOG.md` (+13), `SCORECARD.md` (+36);
`git show --stat 2d2c8a7` → only `corpus/lessons/round-34-verifier-spotcheck.md` (+187). No `corpus/QUALITY.md`,
`corpus/README.md`, `scripts/*`, `SKILL.md`, `corpus/lessons/*`, `corpus/SOURCES.md` or
`corpus/adjacency-screen.tsv` byte moved at the freeze; `corpus/adjacency-screen-browser.tsv` does not exist there.

No-fix check, `git log --oneline -S"<string>" --all -- <paths>` (all exit 0, one commit each):

| string | commit |
|---|---|
| `name each other's lane` | `bf48b81` |
| `Every browser-domain line` | `bf48b81` |
| `registry or lessons absent` | `bf48b81` |
| `driver is a byte copy of this gate` | `bf48b81` |
| `shots.some` | `2f8535c` |
| `v3-a-m03-measured-cell-uppercase` (U24's fix) | `04f9623` |

Per-item hits (full `got/want/grep_exit` lines in `holds-receipt.txt`):

- **U15** `corpus/QUALITY.md:545` "name each other's lane" = 1; one-directional clause
  `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:218-227` = 1; `corpus/adjacency.tsv:14` sib_has_tabi=0 /
  tabi_has_kake=1, `:15` sib_has_tabi=1 / tabi_has_kake=1. Round-35 n4
  (`c1-adjacency-sweep-v3.mjs:50-55`) names no lane at all.
- **U16** `corpus/QUALITY.md:567` = 1 for `round-33.md §Gate`; battery/forgeriesAccepted/whitelist terms:
  `round-33.md:24-92` (§Gate) = **0**, `:173-189` (M1) = **5**.
- **U17** `corpus/QUALITY.md:574-576` = 1 for "a driver re-exporting the gate", 0 for "byte-identical";
  `SCORECARD.md:1793-1796` carries v4 with `cee9539` (and `b858b5d`, `e666174`, `7912a62` adjacent).
- **U18** `corpus/adjacency-screen.tsv:21`, `:29` both `crawler-discipline-vs-publishing`;
  `corpus/adjacency.tsv:13` = robots row (sibling_ref kake `PROVINCE.md:304`), `:12` = js-rendering row whose
  ruling_quote is "canonical declaration and selection stay kake's" (kake:358's subject).
- **U19** `corpus/README.md:766` = 1 for "Every browser-domain line"; frozen regex
  `c1-adjacency-sweep.mjs:65`; at kake pin `0440485` line 67 no-match; of `:354-363`, no-match =
  `354,355,356,357,360,361,363`, match = `358,359,362` (`:362` names tabi → excluded by the not-tabi clause;
  `:358`,`:359` are screened at ledger lines 21-22).
- **U20** surfaces crawler (`adjacency.tsv:6`) and robots (`:13`); ledger `:6` kake:22→crawler, `:12-13`
  kake:322/323→robots, `:14` kake:338→crawler; `who drives browsers` = 0 anywhere in the lessons.
- **U21** gate `scripts/check-adjacency.mjs:728-729`; r33 counter `:202`; **r35 v3 counter `:242`**; `goodQuote`
  `:131`.
- **U22** `scripts/check-bidi-runtime.mjs:298` `shots.some`, `:825` first-shot equality.
- **U23** `scripts/check-bidi-runtime.mjs:778` exact bytes (seat's `:774` moved); `SKILL.md:2907` = 1 for
  "a driver that is the gate".
- **U24** `.ufo/waves/round-33/w2/MutGateV2.md:63` = 1 for "admits nothing"; gate `:149` (`/i`), `:373`
  (`toLowerCase`), `:860` (`row.verdict === "yes"`), `:1031` case `v3-a-m03-measured-cell-uppercase`
  (`exit: 0, admitted: 2`, cell `"Yes"`); mutant `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:72-76`.
- **U25** `scripts/check-frontier-admission.mjs:213-219` = 1 for `rf.seat !== rc.fetched_by`;
  `corpus/lessons/round-33.md:148-151` carry text = 1.
- **U26** `corpus/lessons/round-33.md:26-27` = 1 (`not .on-release.`), `:144-147` = 1 (`immutable`);
  `tag-pinned` = 0 in that lesson; freeze row counts 90 `on-release` / 26 `90d`.
- **U27** `c2-bidi-forgery-battery.mjs:118` (entry table header) and `:140` (toplevel mismatch) each a
  `new Refusal` → exit 2; `symlink` = 0 (no case); `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:215` repeats
  it; round-35's counter has no clone path (`toplevel|realpath` = 0).
- **U28** `scripts/check-bidi-runtime.mjs:8` = 1 for "registry or lessons absent"; `gateRows` `:511-517`
  (`return map` at `:514`); `SKILL.md:2907` exit-2 list omits it.

## Touched surfaces

- Written: `.ufo/waves/round-35/w1/ScribeUDispositionsB.md` (this report),
  `.ufo/waves/round-35/w1/ScribeUDispositionsB/dispositions.md`,
  `.ufo/waves/round-35/w1/ScribeUDispositionsB/verify-holds.sh`,
  `.ufo/waves/round-35/w1/ScribeUDispositionsB/holds-receipt.txt`.
- Scratch `/fast/scratch/hyaku/tabi-r35/ScribeUDispositionsB` deleted at yield.
- No lane tracked file, lane index, jj state, fleet file or sibling repo modified; no browser launched; no network
  fetch. Tooling installed: none.

## Out of scope / not done here

- No correction was landed in any lane file (append-only texts are drafted, not applied); landing them is the L1's
  §Errata intake step (`claims.json` `priorClosure` item 4).
- No instrument was amended (U21/U22/U23-instrument/U25/U27/U28-landing are routed; the round-35 counters and
  both gates are pinned by digest and "must not move", `SCORECARD.md` round-35 block).
- U01–U14 and U29–U32 are not mine (U01–U28 are split across seats this wave); this deliverable covers U15–U28
  only, as assigned.

## Findings (headline per item)

1. U15, U16, U17, U18, U19, U20, U26, U28: text corrections drafted, each naming its stale line; U18 and U20
   change ledger cells, so the L1 must adopt them as corrections (no counter clause changes for either).
2. U21 is the highest-value item of the set and got worse this round: the new frozen C1 counter keeps substring
   quote matching, so a truncated quote can still pass a screen in the round-35 claim.
3. U22/U23: the C2 gate is pinned by digest this round, so the R4 existential and the exact-byte driver check
   cannot be repaired inside the claim that depends on them — both must ride the next gate amendment, together with
   U28's header word.
4. U24's instrument half is already fixed (`04f9623d`); only the round-33 sentence is stale.
5. U27 does **not** extend to round-35's counter (no clone path), which narrows its severity for this round but
   leaves the two committed C2 counters with unexercised exit-2 classes.
6. Conflict, unresolved: U20 would move screen row 6 (kake:22) to the robots surface; `CritScreenCrawlerSplit`
   calls it "a legitimate umbrella use of the same label".

## Deliverables

- `.ufo/waves/round-35/w1/ScribeUDispositionsB.md` — this report.
- `.ufo/waves/round-35/w1/ScribeUDispositionsB/dispositions.md` — the required table
  `U-id | finding | holds-at-freeze | disposition | evidence`, the drafted correction texts, the routing table and
  the conflict record.
- `.ufo/waves/round-35/w1/ScribeUDispositionsB/verify-holds.sh` — the re-check script (36 checks).
- `.ufo/waves/round-35/w1/ScribeUDispositionsB/holds-receipt.txt` — its output at the freeze (36 HOLDS, 0 BROKEN).

Report: `.ufo/waves/round-35/w1/ScribeUDispositionsB.md`
