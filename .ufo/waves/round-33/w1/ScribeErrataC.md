# ScribeErrataC — frontier errata intake C (round-33 w1)

Attacked/re-checked revision: `e6b0a9074d434ccc307badd312ae7379d1193fea` (round-33 freeze). Lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. All work in one `git clone --shared` detached at the freeze; the lane
checkout, index and jj state were read-only throughout. Deliverable: `.ufo/waves/round-33/w1/ScribeErrataC/errata-C.md`
(ledger + copy-ready append-only texts).

## Verdict

Of the ConnRoutedLedger 19 medium-or-higher w1 findings, **13 land** with exact append-only text (A.1, A.2, A.5, A.6, A.7,
A.9, A.13–A.19), **5 are already closed** by landing lines written after that report (A.3/A.4 by lesson round-32 M7 at
`corpus/lessons/round-32.md:143`; A.10–A.12 by M6 at `:142`), and **1 is closed by this round's claim** (A.8 =
CritC1Forgery D5 through C2's frozen forgery F8, `c2-bidi-forgery-battery.mjs:190`); none is refused and none is carried
silently. The item's premise that C2 closes "MutC1/CritC1Forgery items" is half true: the frozen battery's F1–F7 carry
CritC1Forgery D1–D4 and MutC1Entry, but **no F case builds any of the five MutC1 survivors** (M11's mismatched
`driverSha256`, M06's error frame, M04's cross-run driver version, M18's well-formed wrong-IHDR PNG, M17's non-loopback
`webSocketUrl`), and C2's predicate checks only `--selftest` exit 0 — so those five remain line-landed, not
predicate-verified; the ledger records the flip for wave 2. The CritReadmeLog five split the same way: **F1 is closed** at
the freeze (the round-32 after-readings and the disposition block landed, and the measured revision resolves as an
ancestor); **F2–F5 stand** and receive corrections (two README bullets, two LOG bullets). Two claim-scope observations go
to the L1: (a) do not record C2 as having verified the five MutC1 survivors; (b) keep the new m4/D8 text in a lesson, never
in `SCORECARD.md`, and re-run `check-selfassessment --rev REV` after landing.

## Dispositions (summary; full table in the deliverable)

| finding | disposition | target |
|---|---|---|
| A.1 RevCounters HIGH-1 (live deadline settles nothing) | land | lesson §Errata intake C, bullet 1 |
| A.2 RevCounters MEDIUM-1 consequence (unfrozen-oracle zero) | land | same, bullet 2 |
| A.3 MutC1 M11 · A.4 MutC1 M06 | closed-already | `corpus/lessons/round-32.md:143` (M7) |
| A.5 M04 · A.6 M18 · A.7 M17 | land | same, bullet 3 (names all three) |
| A.8 CritC1Forgery D5 | landed-this-round-by-claim | `c2-bidi-forgery-battery.mjs:190` (F8) + `claims.json` C2 |
| A.9 CritC1Predicates E13 (unread cells) | land | same, bullet 4 |
| A.10–A.12 D1–D3 | closed-already | `corpus/lessons/round-32.md:142` (M6) |
| A.13–A.19 D4–D10 | land | same, bullet 5 |
| CR-F1 (no committed after-reading) | closed-already | `LOG.md:2228`; `measure/provenance-0808688.txt:1` |
| CR-F2 (41 vs 39 table cases) | land | append `corpus/README.md` after `:757` |
| CR-F3 (claim set 17/22/30) | land | append `LOG.md` after `:2230` |
| CR-F4 (README "three contracts" set) | land | append `corpus/README.md` after `:757` |
| CR-F5 (unrecorded pre-freeze 16/16) | land | append `LOG.md` after `:2230` |

## Evidence (commands, exit codes, file:line)

Workdir `/fast/scratch/hyaku/tabi-r33/ScribeErrataC`, `TMPDIR` under it.

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                     # 0
$ git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea                 # 0
$ git -C "$S/clone" rev-parse HEAD    # e6b0a9074d434ccc307badd312ae7379d1193fea                  # 0
$ git -C "$S/clone" status --porcelain | wc -l                                                    # 0
$ node scripts/check-selfassessment.mjs --rev 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 --json     # 1 (expected red)
    # mismatches 18 = 15 m1 + 3 m4; m1 figures 17,22,22,30,13,17,20,22,30,30,30,30,30,17,30
    #   at SCORECARD 1439/1465/1486/1564, SKILL 2479/2515/2530/2545/2576/2578/2590/2594/2598, README 613/668
    # distinct set {13,17,20,22,30}; 8 claims below 30 (17×3, 22×3, 13, 20)
$ git cat-file -t 0808688                                                                         # commit (0)
$ git merge-base --is-ancestor 0808688 e6b0a90                                                    # 0
$ git show e6b0a90:.ufo/waves/round-32/measure/provenance-0808688.txt
    # rev=08086884d425b879f020af82fc6e57180e991a3e / porcelain=0 / both frozen digests / c1-live exit=0
$ git show e6b0a90:.ufo/waves/round-32/measure/c1-live-at-0808688.json
    # live=true population=16 admitted=16 failing=0
$ for c in J2-docs-only J3-forgery-live J4-counter-as-driver; do …; done
    # each live leg admitted=0 failing=16; J3-forgery-offline live=false admitted=16
$ git show e6b0a90:scripts/check-selfassessment.mjs | grep -cE '^\s{4}id: "'                      # 39
$ git show e6b0a90:scripts/check-selfassessment.mjs | grep -c 'results.push('                     # 2
$ grep -n 'const deadline' scripts/check-bidi-runtime.mjs                                         # 394
$ grep -n 'cells\[' scripts/check-bidi-runtime.mjs                                                # 508 (cells[3]), 560 (cells[0])
$ git grep -n -i 'deadline' e6b0a90 -- corpus/lessons/round-32.md SCORECARD.md corpus/QUALITY.md LOG.md corpus/README.md
    # no match → A.1 unrecorded
$ git grep -n -i 'unfrozen' …                                                                      # no match → A.2 consequence unrecorded
$ git grep -n -i 'cross-run|PNG dim|hand-review|cells\[|before the statement|range citation|same round group' …
    # no match outside unrelated hits → A.5–A.7, A.9, A.13–A.19 unrecorded
$ git show e6b0a90:corpus/lessons/round-32.md | grep -n '^| M6\|^| M7'   # 142, 143
$ git show e6b0a90:corpus/README.md | grep -n 'CASES table holds 41\|three contracts'   # 745, 725
$ git show e6b0a90:LOG.md | grep -n 'admittable predicates\|claimed 17/22/30'          # 2165, 2172
$ git show e6b0a90:corpus/knowledge/webdriver-bidi-runtime-round-32.md | grep -n '^## '  # §6 at 144, §8 at 181, corrections at 194
$ git show e6b0a90:corpus/knowledge/webdriver-bidi-capability-matrix.md | sed -n '84,86p;100,102p'
    # §3 gap incl. raw ExtraInfo; §Rejected names DOMSnapshot columnar, history entry, insertText
$ grep -n 'F8:' .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs              # 190 (F8 builder; D5 in header :41)
$ grep -n 'deadline' .ufo/waves/round-33/w1/ExecLiveLeg/live.patch                    # no match (v2 live change does not
                                                                                      #  touch the deadline arm)
```

No browser/chromedriver was started, no network fetch was made, no tool was installed or upgraded, and no lane file,
index or jj state was written. The only executed lane script was the frozen self-assessment counter, inside the scratch
clone.

## Claim-scope findings for the L1

1. **C2 does not verify the five MutC1 survivors.** `claims.json` `priorClosure` ("MutC1 survivors as cases") and
   `SCORECARD.md:1689-1691` ("a selftest case per w1 MutC1 survivor") route them; the frozen predicate exercises only F1–F8
   plus `--selftest` exit 0. A v2 whose suite omits M11/M06/M04/M18/M17 still passes C2. Wave 2 should build those five
   constructions against v2 and report survivors as limits. Do not close them on C2's reading.
2. **Placement of the D8 text.** The land block quotes nine invisible `nudge`-state spellings. It belongs in the round-33
   lesson, never in `SCORECARD.md`: the m4 class reads `SCORECARD.md` round groups only, and `claims.json` requires
   `check-selfassessment` mismatches to stay 0 at REV as a no-harm instrument.
3. **Application check.** After landing L-1/R-1/G-1, run `node scripts/check-selfassessment.mjs --rev <REV> --json`; the
   new lines state no gate-naming tally in an accepted shape (`N/M`, `cases: N`, `N-case`), so mismatches should stay 0.
   The C1 counter reads neither README nor LOG; the C2 battery reads the gate, entry, receipt and registry only.

## Deliverable paths

- `.ufo/waves/round-33/w1/ScribeErrataC/errata-C.md` — ledger tables (19 + 5), per-item evidence, exact append-only texts
  L-1 (round-33 lesson), R-1 (`corpus/README.md`), G-1 (`LOG.md`), application check, commands.
- `.ufo/waves/round-33/w1/ScribeErrataC/c2-freeze-at-4181fffb.json` — raw frozen-v3 reading at the round-32 freeze
  (18 mismatches, exit 1), the receipt for the CR-F3 numbers.
- `.ufo/waves/round-33/w1/ScribeErrataC/c2-freeze-summary.txt` — the 15 m1 figures in counter order with their lines.
- This report: `.ufo/waves/round-33/w1/ScribeErrataC.md`.

Scratch `/fast/scratch/hyaku/tabi-r33/ScribeErrataC` is deleted before yield; `pgrep -fa 'chromedriver|chromium'` lines
owned by this seat: none.
