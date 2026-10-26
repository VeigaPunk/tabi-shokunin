# ScribeLog — round 33 w1 (frontier: LOG entry + SCORECARD declared section)

**Verdict.** Both drafts are complete against the frozen record and ready to paste: `log-entry.md` mirrors the round-32
LOG entry section-for-section (freeze commit, counter digests, axes, controls, per-claim description, verbatim counting
commands, frontier step, routing ledger, waves, re-verification, commit ledger) and `scorecard-declared.md` mirrors
`SCORECARD.md:1637-1666` (freeze paragraph, six-axis `Axes at round start:` line, saturation / nudge sentence, claims
table with before→target, controls, feasibility, no-harm clause). Every before-value is the byte the named receipt holds;
every after-value is literally `<pending measurement>`; artifacts that do not exist at the freeze (SOURCES rows S127+,
QUALITY numbering, w2 seat counts, integration commit ids, the freshness re-verification result) are marked `<pending …>`
and not invented. No lane tracked file, lane index, fleet path, sibling repo or scratch dir was written.

## Evidence

Read-only reads used as the only source of numbers (all exit 0):

| Command | Result |
|---|---|
| `read .ufo/waves/round-33/claims.json` (:12 baseline, :14 axes, :15 lowest axis + nudge, :16 measurementRule, :17-23 frozenDigests, C1 :22-39, C2 :41-57, :59 notClaimed, :64 noHarmRule) | claims frozen at `e6b0a907`, baseline `b7d16fb8` |
| `read .ufo/waves/round-33/baseline/controls-summary.json` | 7 controls, every `predicate false`, every `exit 1` |
| `jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}' baseline/measure-at-baseline/c1-at-b7d16fb.json` | `false,52,5,0,47,0,{clean,10,10,0}` |
| `jq -c '{predicate,honest,forgeriesAccepted,acceptedForgeries,selftest,digestLiterals}' baseline/measure-at-baseline/c2-at-b7d16fb.json` | `false,{H0..H2:true},8,[F1..F8],{exit:0,BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27},[]` |
| `jq -r '.results \| to_entries[] \| [.key,.value.accepted,.value.admitted,.value.failing]' baseline/measure-at-baseline/c2-at-b7d16fb.json` | H0/H1/H2 and F1-F8 `accepted true`; **F7 admitted 15**, the other ten 16, failing 0 everywhere — the LOG carries this detail |
| `node -e` over `baseline/c1-candidates.tsv` + `c1-at-b7d16fb.json` | 52 candidates, 47 unaccounted, mapped 5 = kake:34, kake:39, kagi:43, kaidoku:53, revenger:5; `perLane` kake 42, kagi 4, kaidoku 2, kengaku/kotoba/revenger/tsukuroi 1 each; 7 distinct lane pins |
| `jq -c '{mismatches}' baseline/measure-at-baseline/selfassessment-at-b7d16fb.json` | `0` |
| `awk -F'exit=' … baseline/measure-at-baseline/noharm-at-b7d16fb.txt \| sort \| uniq -c` | `28` lines, all `exit 0` |
| `head` of `baseline/census-start.txt` / `noharm-at-b7d16fb.txt` | `ADJACENCY verdict=clean rows=10 verified=10`; `SELFASSESSMENT … mismatches=0 could_not_evaluate=106 superseded=39`; `SOURCES_GATE verdict=clean rows=126 tiers=A:111,B:6,C:9 … findings=0`; census validate `file ok` |
| `grep -n 'First-working round \|$\|saturation 8 / window 3; the round-32' SCORECARD.md` | capability row `webdriver-bidi-runtime … 32` at `SCORECARD.md:1663`; window statement at `SCORECARD.md:1694` (both anchors the claims cite) |
| `tail -120 LOG.md`, `SCORECARD.md:1637-1665`, `SCORECARD.md:1667-1694` | round-32 entry and declared/executed section shapes that the drafts copy |

Nudge: carried as **inactive** with the reason, and re-derived against the frozen m4 rule rather than copied —
all six axes ≥ saturation 8, and capability round 32 falls inside rounds 30–32 for round 33 at window 3
(`SCORECARD.md:1663`, `SCORECARD.md:1694`; `AXES.md:66-73`; `scripts/check-selfassessment.mjs:426-509`).

Parser compatibility of the drafts was simulated locally (scratch file removed before yielding): `node "$S/parse-check.mjs" …`
exit 0 — both drafts yield `axes={depth9,coverage9,operability9,freshness9,calibration9,adjacency8}`, `sat=8/3`,
nudge statement = inactive; the LOG's two self-test summary lines carry no `scripts/` token on-line, so m1's
per-line association is `ambiguous → could-not-evaluate` (the round-32 entry's form, which the frozen v3 gate reads as 0
mismatches), and the SCORECARD draft carries no tally line at all.

## Deliverables

- `.ufo/waves/round-33/w1/ScribeLog/log-entry.md` — append-only `## Round 33 — 2026-10-26 — …` LOG entry skeleton.
- `.ufo/waves/round-33/w1/ScribeLog/scorecard-declared.md` — `## Round 33 — declared claims (frozen before data)`.
- This report.

Placeholders left for the L1: `<pending measurement>` (all after-values, incl. disposition), SOURCES S127+ ids, QUALITY
87+ numbering, lesson round-33 M-numbers, wave-2 seat counts and totals, integration commit ids, the freshness
re-verification result (duty at `AXES.md:14`; `claims.json` declares no freshness claim), the errata-intake table.

## Notes / limits

- The drafts cite only numbers that exist in receipts today. `claims.json` C1 `before` and the counter output agree
  exactly (52/5/0/47/0, clean 10/10), so no reconciliation wording was needed.
- The LOG's two self-test summary lines are deliberately whole (`BIDI_RUNTIME_SELFTEST … cases=27 passed=27`,
  `SELFASSESSMENT_SELFTEST … cases=41 passed=41`, both copies of the baseline `noharm` reading). If the L1 adds a
  `scripts/…mjs` token to either line, m1 will compare that tally against the named gate's live self-test and it can
  go stale — leave them untokenised, as round 32 did.
- The SCORECARD section names two `scripts/` paths (`check-adjacency.mjs` pinned digest, `check-bidi-runtime.mjs` as the
  one rewritten prior file); do not add a `cases=` tally inside that section later without naming its script on the
  same line.
- `round-32.md:179-187` errata and `corpus/lessons/round-32-verifier-spotcheck.md` §Routed defects (lines 146-160) are
  routed in both drafts by defect number; the errata intake table itself is `<pending>` because the wave-1 errata
  seats own it.
- One honesty note for the L1: the C2 controls row for `c2-J3-whitelist` records `digestLiterals` 5 with the twelve-hex
  prefixes from `controls-summary.json`; the drafts say "five digest literals" without repeating the prefixes, which
  stay in the receipt.

## Scope compliance

Wrote only `log-entry.md`, `scorecard-declared.md` and this report under `.ufo/waves/round-33/w1/ScribeLog*`; scratch
`/fast/scratch/hyaku/tabi-r33/ScribeLog` created and removed (`scratch_removed=yes`). Read-only git only
(`git log`, `git status --porcelain` — the untracked entries listed are the L1's own baseline/wave files, not mine).
No network fetch, no tool install, no browser, no chromedriver/chromium started; `pgrep -fa 'chromedriver|chromium'`
returned one line, `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$`, whose argv text matches the
pattern — not a process this seat owns or started.
