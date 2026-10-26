# MutC2 — mutation attack on C2's frozen counter v3 (round 32, wave w1)

## Verdict

The frozen counter held: all 10 single-point mutants of `scripts/check-selfassessment.mjs` (frozen v3, sha256 `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, byte-verified at HEAD `4181fffb` in my scratch clone) were **killed** — none survived, so no mutant reading of the real lane ships and no defect in the counter was found by these probes. Baseline was verified before any mutation: pristine `--selftest` = 41/41 exit 0 (matches frozen control `c2-counter-selftest.txt`), pristine `--rev HEAD` = mismatches 18 (15 m1 + 3 m4 at SCORECARD.md:1473, :1515, :1576) exit 1 (matches frozen control `c2-J1-do-nothing`). **Coverage finding (not a contract change): 5 of the 10 mutants survive the counter's own frozen 41-case selftest** — m01 (window far boundary), m04 (prose `First-working round:` parsing), m07 (self-supersession guard), m08 (verdict≠clean refusal at exit 0), m10 (grouping by round number vs section) — each was killed only by a targeted falsifier fixture; the frozen selftest does not pin those behaviors. Secondary observation: the m4 class on the real SCORECARD is load-bearing on the `>=` at-the-line boundary (m02 drops the reading from 18 to 15 — the three round-29/30/31 statements are counted only because every axis sits exactly at saturation 8), and on prose capability parsing (m04 raises the reading from 18 to 23 — five earlier `nudge inactive` statements at :1126, :1215, :1277, :1333, :1382 are held correct only by `First-working round:` prose entries inside their windows).

## Method

One bounded behavioral detector, three legs, run on pristine bytes, each mutant's bytes, and restored bytes, in a `--shared` clone at the freeze commit (`git -C "$S/clone" checkout -q --detach 4181fffb…`):

- **Leg A — selftest:** `node <counter> --selftest --json` (pristine expectation: 41 cases, 41 passed, exit 0).
- **Leg B — falsifier fixtures:** `suite.mjs` builds 10 throwaway git fixtures (one SCORECARD.md each, plus a gate script for the oracle cases) under `$S/fx`, commits each, and runs `node <counter> --repo <fixture> --rev <sha> --json`. Pristine expectations (all met): FC→E1 m1; F1 cap-at-`round-window`→E1 m4; F2 axis-exactly-at-line→E0; F3 prose cap in window→E1 m4; F4 uncited correction→E1 m4; F5 wrong-state correction→E1 m4; F6 self-paragraph supersession→E1 m4; F7 verdict=failed/exit 0 oracle→E0 cne=1; F8 exit 1/clean-verdict oracle→E0 cne=1; F9 two `## Round 5` sections→E1 m4.
- **Leg C — real lane at the freeze:** `node <mutant file> --repo "$S/clone" --rev HEAD --json` with the clone tree byte-pristine (pristine expectation: exit 1, mismatches 18, counted = 15 m1 + 3 m4).

Kill rule: a mutant is killed iff any leg's structured output differs from pristine's on that leg (baseline verified first, so no inconclusive cases arose). Per the protocol the clone script was byte-mutated in place for legs A/B and restored from the pristine copy before leg C after every mutant, with sha256 checked against the frozen digest each time.

## Results

| Mutant | Single point (frozen line) | mutated sha256 (prefix) | Selftest (leg A) | Killing case | Leg C real-lane reading |
|---|---|---|---|---|---|
| m01-window-offbyone | `c >= round - window` → `+ 1` (L497) | `2fb041bc` | same (survives!) | F1: cap at round 2, round 5, window 3 → pristine E1 m4, mutant E0 | 18 (unchanged) |
| m02-saturation-gt | `scores[a] >= line` → `>` (L496) | `2aa4ce87` | killed (4 cases fail) | F2 (+ selftest m4-stale-inactive et al.) | **15** — all 3 m4 findings vanish |
| m03-drop-table-parsing | capabilityRounds table loop deleted (L448-458) | `709bfed7` | killed (2 cases fail) | F1 (+ selftest m4-inactive-capability-in-window) | 18 (unchanged) |
| m04-drop-prose-parsing | prose `First-working round:` matchAll deleted (L447) | `ecfa73b1` | same (survives!) | F3: prose cap at 4 in window → pristine E1 m4, mutant E0 | **23** — 5 extra m4 findings (:1126, :1215, :1277, :1333, :1382) |
| m05-supersession-no-citation | `citesLine(pt, "SCORECARD.md", no) &&` removed (L506) | `f7f0526d` | killed (m4-correction-uncited) | F4 | 18 (unchanged) |
| m06-supersession-any-state | state regex → `/\bnudge\b/i` (L506) | `231a0ca0` | killed (m4-correction-wrong-state) | F5 | 18 (unchanged) |
| m07-self-supersession | `if (p.start <= no) return false;` removed (L504) | `b023f02a` | same (survives!) | F6: statement paragraph cites `SCORECARD.md:9` (its own line) and states `nudge was active` → pristine E1, mutant E0 (superseded=1) | 18 (unchanged) |
| m08-drop-verdict-refusal | `|| (verdict && verdict[1] !== "clean")` removed from gateTally (L190) | `ed7302d6` | same (survives!) | F7: gate prints `verdict=failed cases=13` and exits 0; claim 12/12 → pristine E0 cne=1, mutant E1 m1 (measures the failed oracle) | 18 (unchanged) |
| m09-drop-nonzero-exit-refusal | condition → `verdict && …` only (L190) | `fa7a5ee2` | killed (v3-nonzero-exit-is-not-an-oracle) | F8: gate exits 1 with `verdict=clean cases=12`; claim 13/13 → pristine E0, mutant E1 | 18 (unchanged) |
| m10-group-by-section | groups keyed by heading line, not round number (L464-476) | `8fe62c5f` | same (survives!) | F9: `## Round 5 — inputs` (axes) + `## Round 5 — claims` (statement) → pristine merges, E1 m4; mutant splits, E0 cne=1 | 18 (unchanged) |

Killed: 10/10. Survived: 0 (hence the "surviving-mutant vs 18" comparison is vacuous; leg C was recorded for every mutant anyway, column above). Selftest-only kills: m02, m03, m05, m06, m09. Fixture-only kills (= frozen-selftest coverage gaps): **m01, m04, m07, m08, m10**.

## Restoration evidence

- After every mutant: `cp pristine → clone script`, sha256 re-checked == `77b5c8ed…` (driver aborts on mismatch; 10/10 matched, hashes in `receipts/` driver log section of `compare.txt` inputs).
- Full restored pass after all mutants: leg A 41/41 exit 0, leg B identical per-case JSON, leg C 18 (15 m1 + 3 m4 @1473/1515/1576) — `RESTORED_MATCHES_PRISTINE true`.
- Clone `git status --porcelain` at end: 0 lines. Lane checkout: no tracked file modified (only this seat's new untracked `w1/MutC2*` outputs).

## Commands and exit codes

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # ok
git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 && git -C "$S/clone" rev-parse HEAD   # 4181fffb…, exit 0
sha256sum pristine copy   # 77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9 (== claims.json frozenDigests), exit 0
for f in mutants/*.mjs: node --check … # SYNTAX-OK ×10, exit 0
bash drive.sh             # full protocol, exit 0, wall 355s (first B leg crashed on a suite.mjs bug — fixture helper returned the commit sha; receipts from that attempt discarded, suite fixed, leg B re-run alone for all 12 passes, exit 0 ×12, 10.7s)
R=… node compare.mjs …    # exit 0, 72 lines → receipts/compare.txt
```

Note: leg B's first run crashed before emitting any case (suite bug, not a counter behavior); every B receipt used in this report comes from the fixed suite, run against the same pristine/mutated/restored bytes with per-run sha256 logs. Leg A and C receipts are from the original driver run.

## Hygiene and disclosures

- Scratch `/fast/scratch/hyaku/tabi-r32/MutC2` deleted after receipts (112 files: A/B/C outputs + exit codes for pristine, restored, and all 10 mutants; suite.mjs, drive.sh, compare.mjs) were copied to `.ufo/waves/round-32/w1/MutC2/receipts/`.
- No browser was started: `pgrep -fa 'chromedriver|chromium'` matches only PID 1371 `/usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` — the OOM daemon's own config string, not a chromium/chromedriver process. Nothing of mine to kill.
- No tools installed or upgraded (node v24.21.0 and git preexisting); nothing to record under the tooling authorization.
- No network fetches were needed: all evidence is local (frozen counter + fixtures + clone).
- Lane tracked files, lane git index, lane jj state, fleet repo, siblings: untouched. Read-only git in the lane: `ls-files` (report path untracked), `status --porcelain` scoped to `.ufo/waves/round-32/w1/` (shows only new untracked seat outputs).

## Attack summary (attack-seat format)

Name of what was attacked: `scripts/check-selfassessment.mjs` v3 at `4181fffb…` — m4 section (`capabilityRounds` L445-459, `m4Findings` L461-519) and the v3 refusal in `gateTally` (L190). Verdict: **holds** — every probed single-point defect is detected by the counter's own selftest or by one targeted falsifier fixture each. Coverage finding for C2 (severity: minor, hardening opportunity, no contract change): the frozen 41-case selftest leaves five behaviors unpinned — window far boundary (`round - window`), prose capability parsing, self-supersession guard (`p.start <= no`), the verdict≠clean refusal when the oracle exits 0, and round-number vs section grouping; each currently has exactly one behavioral line of defense (leg B fixture), and m02/m04 show the real-lane 18-count itself moves (15/23) under the saturation-boundary and prose-parsing mutants. Receipts: `.ufo/waves/round-32/w1/MutC2/receipts/` (compare.txt is the digested diff; per-leg raw JSON/JSONL alongside).
