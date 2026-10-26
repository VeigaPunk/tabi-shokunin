# CritC2Claim — C2 corrections as landed at `b234a589`

Seat: CritC2Claim (attack, w2 falsify). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; clean
clone `/fast/scratch/hyaku/tabi-r32/CritC2Claim/clone` detached at
`b234a58920134424e0d104f137311ff54a16d26b` (tree clean, 0 porcelain lines), counters byte-identical to
`claims.json` `frozenDigests`:
`check-selfassessment.mjs 77b5c8ed…c6a9`, `check-bidi-runtime.mjs 2f25af5a…c393`. Node v24.21.0.
No installs, no network, no browser started. Lane checkout read-only; all runs in the clone.

## Verdict

**The corrections are substantively TRUE; their clearance is only formally loose; and the 18 → 0 movement is
3 genuine corrections plus 15 instrument-induced bookkeeping.** I re-derived every landed statement from the lane
bytes: the three nudge corrections cite the right lines (`SCORECARD.md:1472`, `:1514`, `:1574-1575`; statements at
`:1473`, `:1515`, `:1576`), the axis vectors, saturation 8 / window 3 and the window rounds 26–28 / 27–29 / 28–30 are
exactly as written, the last capability entries really are round 25 (`SCORECARD.md:1306`, `:1314`), and no entry exists
in 26–31 (`capabilityRounds = [1,13,16,17,22,23,24,25,32]` at REV; 32 is the new row). The m1 correction's numbers are
true at their tips (13@`ad125e8`, 17@`fd722a7`, 20@`b4128c4`, 22@`97be89b`, 30@`9505a10`, 41@`b234a58`, all measured by
the frozen counter) and `v3` adds exactly 11 (`CASES` 28 → 39). Nothing claims a calibration score rise, so there is no
score inflation. But the frozen counter's m4 supersession reads only *marker + `SCORECARD.md:N` + `nudge was active`*:
a one-line bare restatement clears all three findings (fixture A, exit 0), and a correction whose stated window is
**false** (`rounds 25–27`, which contains the round-25 entry and would derive `inactive`) also clears them (fixture B,
exit 0). So the C2 predicate's 0 certifies that *a* correction exists, not that the landed derivation is true — the
truth had to be re-read by hand, which I did. The 18 → 0 split is 3 real mis-statements (m4, rounds 29–31) and 15
restatements forced by v3's own 30 → 41 case change; 6 of those 15 are the lane's own round-29/31 correction lines,
which the m1 oracle re-flags at every case-count change — a treadmill that makes `SCORECARD.md:1610`'s own `41/41` the
next version's finding. Two false statements sit inside the corrections themselves: `SKILL.md:2761` and
`corpus/README.md:745` say the **CASES table** holds 41 (it holds 39; the runner generates 2 refusal probes), and
`SCORECARD.md:1615` says "the table's last entries are round 25", which the same commit falsifies by appending the
round-32 capability row.

## Evidence — commands, exit codes, readings

### 1. Freeze reading reproduces; REV reading is 0

```
$ git -C "$S/clone" rev-parse HEAD                     # b234a58920134424e0d104f137311ff54a16d26b
$ git -C "$S/clone" status --porcelain | wc -l         # 0
$ git -C "$S/clone" show HEAD:scripts/check-selfassessment.mjs | sha256sum
77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9   # == frozenDigests
$ TMPDIR=$S node scripts/check-selfassessment.mjs --rev 4181fffb… --json    # exit=1
  mismatches 18, clean false, counted 18 = 15 m1 + 3 m4
  m4: SCORECARD.md:1473/1515/1576 inactive->active
$ TMPDIR=$S node scripts/check-selfassessment.mjs --rev b234a58… --json     # exit=0
  mismatches 0, clean true, counted 0, superseded 39, couldNotEvaluate 106
  m4 findings: 1473/1515/1576 superseded=true; 1643 round-32 active->active (correct); 1456 round-28 observed=null
  (could-not-evaluate: "no `Axes at round start:` with all six axes in the round group") — still unjudged
```

Raw JSON: `receipts/counter-before-4181fff.json`, `receipts/counter-after-b234a58.json`.

### 2. Deletion leg

```
$ git -C <lane> diff --numstat 4181fffb… b234a58… -- SKILL.md corpus/README.md SCORECARD.md LOG.md   # exit=0
106  0  LOG.md
62   0  SCORECARD.md
135  0  SKILL.md
41   0  corpus/README.md
```

Holds: the correction blocks are pure additions after the cited lines, so every `DOC:N` citation still resolves.
Receipt: `receipts/numstat.txt`.

### 3. Per-correction truth check (cited line → lane bytes)

| Correction | Cited evidence | Independent check | True? |
|---|---|---|---|
| `SCORECARD.md:1610` m1, `41/41`, "v3 adds eleven cases" | `SCORECARD.md:1439,1465,1486,1564`; `baseline/c2-counter-selftest.txt` | counter `--selftest` at REV prints `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41` (exit 0); receipt file exists, sha256 `fd534f8a…bd3d3`, 41 `CASE` lines; `CASES` entries 28→39 (+11: 9 `m4-*` + 2 `v3-*`); each stale figure is a real earlier tip count (13/17/20/22/30/41 measured per §5) | **yes** |
| `SCORECARD.md:1612-1616` round-29 nudge → active | `SCORECARD.md:1472`, `:1306`, `:1314` | axes at 1472 = depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8 (all ≥ 8); window rounds 26–28 carry no entry; last entries round 25 at 1306/1314 | **yes** (one scope defect, D3) |
| `SCORECARD.md:1618-1620` round-30 nudge → active | `SCORECARD.md:1514` | axes at 1514 as written; window 27–29 empty | **yes** |
| `SCORECARD.md:1622-1626` round-31 nudge → active; quotes the round-31 claims.json reason | `SCORECARD.md:1574-1575` | 1574 has the `Axes at round start:` label, 1575 the six values; window 28–30 empty; `.ufo/waves/round-31/claims.json lowestNonRetiredAxis` really says "depth and adjacency sit at the line, not above it" | **yes** |
| `SKILL.md:2758-2762` nine tallies → 41 | nine `SKILL.md:N` citations | all nine lines carry the listed figures (13/17/20/22/30); counter cites exactly those nine; figures true at tips | **yes except D2** |
| `corpus/README.md:743-746` two tallies → 41 | `corpus/README.md:613,668` | 17 and 30 as written; true at tips | **yes except D2** |
| `LOG.md:2222-2226` round-31 nudge → active | `LOG.md:2072` | 2072 reads `nudge inactive` with the axes of round 31; derivation active | **yes, but unmeasured (D5)** |

### 4. Does it clear legitimately, or via the loose supersession? — both: true content, loose instrument

The frozen clearing condition (`check-selfassessment.mjs:503-507`) is
`/supersed|correct/i` ∧ `citesLine(pt,"SCORECARD.md",no)` ∧ `/nudge\s+(?:was\s+|is\s+)?<observed>/i` — the stated
derivation is never read. Two fixture commits in my own scratch clone (counter bytes untouched):

```
fixture A (d1a1887f): the three substantive paragraphs replaced by ONE line
  "Correction — supersedes the round-29, round-30 and round-31 stagnation-nudge statements at
   `SCORECARD.md:1473`, `SCORECARD.md:1515` and `SCORECARD.md:1576`: the nudge was active."
  $ node scripts/check-selfassessment.mjs --repo $S/fxA --rev HEAD --json     # exit=0
  mismatches 0, clean true, m4 counted 0, m4 superseded 3
fixture B (0599cf47): landed text kept but the round-29 window falsified to "rounds 25–27"
  (round 25 is a capability entry, so those stated inputs derive INACTIVE, contradicting "the nudge was active")
  $ node scripts/check-selfassessment.mjs --repo $S/fxB --rev HEAD --json     # exit=0
  mismatches 0, clean true
```

Receipts: `receipts/fixture-A-*.json|txt`, `receipts/fixture-B-*.json|txt`. Consequence: the C2 "mismatches 0" is not
evidence that the landed corrections are true; it is evidence that a mathematically-shaped correction exists. The
landed text happens to be true — established above by line reading, not by the gate.

### 5. 18 → 0: 3 genuine, 15 bookkeeping (instrument-induced)

- The three m4 findings are real self-description errors (verified independently of the counter, §3).
- All 15 m1 findings are produced by the counter's own growth: the oracle is the live tip (`gateTally` runs the frozen
  gate at `rev`), so v3's 30 → 41 change makes every earlier statement stale at once. The m1 correction itself
  concedes they were "each an earlier tip's count" (`SCORECARD.md:1610`).
- Six of the 15 are the lane's **own corrections**: `SCORECARD.md:1465` (round-29 correction), `:1564` (round-31
  correction), `SKILL.md:2578`, `:2590`, `:2594`, `:2598` (round-31 corrections). `SCORECARD.md:1564` even says
  "(each true at the round-30 tip, 22 cases…)" and is still counted against 41. The class cannot accept a
  historically scoped tally, so every correction that records the then-current count becomes the next version's
  finding — including `SCORECARD.md:1610`'s `41/41` under a future v4.
- Score effect: none claimed. The round-32 declared-claims table and capability table carry no calibration
  `9 → n` line (grep of the four docs' round-32 additions finds calibration only as an axis input/claim name).

### 6. Two false statements inside the corrections

```
$ grep -c '^  {$' scripts/check-selfassessment.mjs                       # 39  (the CASES table)
$ grep -c '^CASE ' .ufo/waves/round-32/baseline/c2-counter-selftest.txt  # 41
runSelftest(): for (const c of CASES) … then two generated probes ("../etc/passwd",
"000…0") appended to results; cases = results.length            (source lines 982-1021)
$ grep -n 'First-working round: 25' SCORECARD.md                        # 1306, 1314 (as cited)
$ grep -n 'First-working round' SCORECARD.md | tail -3                  # 1306, 1314 (as cited), 1661 header
$ grep -n 'webdriver-bidi-runtime | Drive' SCORECARD.md                 # 1663: the round-32 capability row (last cell 32)
```

- `SKILL.md:2761` and `corpus/README.md:745`: "v3's CASES table holds 41 isolated scenarios" — the `CASES` constant
  holds 39; 41 is 39 table entries + 2 refusal probes generated outside the table. The m1 regex does not see this
  clause (`41 isolated scenarios` is not a tally shape), so the false sentence coexists with `clean true`.
- `SCORECARD.md:1615`: "the table's last entries are round 25" — true at round 29's start, false at the cited revision,
  because the same commit appends the round-32 capability row (`SCORECARD.md:1663`, `First-working round | 32`).

### 7. LOG correction is outside the measured surface; two new CNE findings

`m4Findings(scorecard)` reads `SCORECARD.md` only; the `LOG.md:2072` correction therefore clears nothing the frozen
counter counts (it is true, verified at §3, but inert for the predicate). The round-32 LOG entry also adds two new
could-not-evaluate findings — `LOG.md:2154`, `:2155`, "ambiguous script association" (the two `SELFTEST … cases=`
summary lines name no script on their own line inside a multi-script section). CNE 104 → 106 while `clean` stays true.
Receipts: `receipts/cne-before.txt`, `receipts/cne-after.txt`.

## Defects

| # | Severity | Defect (path:line) | Evidence | Smallest safe **append-only** fix |
|---|---|---|---|---|
| D1 | **medium** | C2's proof is content-blind: `m4` supersession needs only marker + citation + the observed state word, so the landed 0 does not verify the corrections (scripts/check-selfassessment.mjs:503-507; the claim's kill rule is "mismatches 0" only) | fixtures A/B both exit 0 — bare one-liner and a falsified window both clear | Append one disclosure line to the SCORECARD round-32 corrections block: "the counter reads marker + `SCORECARD.md:N` + `nudge was active` only; it does not read the derivation, so mismatches 0 is not evidence of this paragraph's content (w2 CritC2Claim fixtures A/B)". Route v4: require the correction to restate saturation/window + window rounds and bind them to the derived inputs. Do not touch `scripts/`. |
| D2 | **low** | False factual clause in two corrections: `SKILL.md:2761`, `corpus/README.md:745` — "v3's CASES table holds 41 isolated scenarios" (39 entries + 2 generated refusal probes = 41) | `grep -c '^  {$'` = 39; 41 `CASE` lines; `cases = results.length` after 2 probes | Append to each doc: "Correction — supersedes the `CASES`-table count in this block: `CASES` holds 39 entries and the self-test adds two generated refusal probes, so the gate prints `cases=41`." |
| D3 | **low** | `SCORECARD.md:1615` present-tense "the table's last entries are round 25" is falsified by the same commit's round-32 capability row (`:1663`) | `capabilityRounds` at REV = [1,13,16,17,22,23,24,25,**32**] | Append: "Correction — the round-29 correction's 'last entries' sentence is scoped to round 29's start; at the round-32 tip the table's last entry is round 32." |
| D4 | **medium** | 15 of the 18 freeze findings are instrument-induced; the m1 oracle re-flags the lane's own corrections at each case-count change (treadmill), so `mismatches 0` measures doc recency, not calibration | §5; `SCORECARD.md:1564` (explicitly scoped "true at the round-30 tip") counted; `SCORECARD.md:1610` will be the next v4 finding | Append a disclosure to the corrections block: "15 of 18 were induced by v3's 30→41 change; six are the lane's own earlier corrections; the 41/41 statement here is the next version's finding." Route v4: accept a tally scoped to a named tip/revision. |
| D5 | **low** | The `LOG.md:2072` correction is outside the frozen m4 surface (SCORECARD-only); the LOG entry adds 2 CNE findings | §7; CNE 104→106, `LOG.md:2154-2155` | Append: "the `LOG.md:2072` correction clears nothing counted (m4 reads SCORECARD.md); the round-32 LOG entry adds two ambiguous-association findings at `LOG.md:2154-2155`." Route: bind LOG summary lines to their gates. |

Also confirmed open and *not* closed by this landing: `SCORECARD.md:1456` (round 28) stays
`could-not-evaluate` ("no `Axes at round start:` with all six axes"), so a boundary statement is still unjudged while
the target reads 0 (w1 CritC2Rule §5; same reading here).

## What holds

- Freeze reading `18 = 3 m4 + 15 m1`, exit 1 — reproduced with frozen bytes.
- Post-landing reading `mismatches 0`, `m4 0`, `clean true`, exit 0 — reproduced.
- Deletion leg 0 — reproduced (`106/62/135/41` additions, no deletions).
- Frozen counter digests at REV — match `claims.json`; no `scripts/` change between freeze and REV.
- Every line citation in all four correction blocks resolves to the intended line; axis inputs, saturation/window,
  window rounds and capability entries are true; the `41/41` oracle is true (selftest exit 0).
- No calibration score is claimed or raised, so the "15 bookkeeping" split is disclosed (`claims.json`
  `beforeComposition`; `SCORECARD.md:1650` "15 m1 stale tallies of the v3 gate itself") and is not used to inflate an
  axis.

## Hygiene

- Scratch `/fast/scratch/hyaku/tabi-r32/CritC2Claim` (clone + two fixture clones + receipts) is deleted after the
  receipts in `.ufo/waves/round-32/w2/CritC2Claim/receipts/` were copied out.
- No lane tracked file, lane index, jj state, fleet repo or sibling lane touched; commits only inside the three
  scratch repos, each verified with `git -C <dir> rev-parse --show-toplevel` equal to its own directory and authored
  `-c user.name=CritC2Claim -c user.email=CritC2Claim@scratch.local`.
- No browser was launched: `pgrep -fa 'chromedriver|chromium'` filtered for this seat returned exit 1 (no owned
  lines). No network fetch. No tool install or upgrade; nothing to record under the pacman guard.
- Leaf seat: no subagent dispatch, no `agent://all` message.

Report: `.ufo/waves/round-32/w2/CritC2Claim.md`. Output dir: `.ufo/waves/round-32/w2/CritC2Claim/`.
