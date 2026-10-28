# CritScorecard — scorecard self-assessment audit (tabi round 42, w1)

Lane: tabi-shokunin. Read-only audit of `SCORECARD.md` and `.ufo/waves/round-42/claims.json`
for calibration drift beyond the four routed defects D1–D4. No writes outside this seat dir,
no git/jj mutation, no commits, no spawned agents, no pacman, no network.

- Audited revision: `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (`git rev-parse HEAD`)
- Freeze rev audited against: `9b6de3a19de11abdb80e82a1310abc64a40215bb` (exists: `git cat-file -t` → `commit`)
- Round-start baseline: `34e177959d1b7ce04afb85a001420e02631ce79e`
- Round-41 measurement rev: `8c84417652f7602886dcc85f74bffdadd9c3a281` (r41 lesson:7);
  round-41 closure rev `ef41e539c017797bce97001e7c9ed2e8a7666a90`
- Tool installs: none. Tools used: `node v24.21.0`, `python3 3.14.8`, `git 2.56.0`.

Headline: the declared axis vector and the nudge waiver are **confirmed** against the round
groups and against the lane's own capability-round derivation, but the one canonical axes
table in `SCORECARD.md` contradicts them and would flip the derivation if read as the
authority. Thirteen findings (F1–F13) are enumerated with `path:line`: F2–F5 are residue
of the known routed defects D1/D3 in the texts that cite them, and F1/F6–F13 are new.
D1 and D2 are genuinely repaired in bytes (sha equality and verbatim-quote checks below),
and the remaining red C2 finding is `r4-quarantine-absent` exactly as the freeze declared.

---

## 1. `axesAtRoundStart` — re-derived and confirmed (with a table defect)

`claims.json:7-14` declares `adjacency 8, operability 9, depth 9, coverage 9, freshness 9,
calibration 9` and `lowestAxis: adjacency`; `claims.json:15-16` declares `saturation 8`,
`stagnationWindow 3`.

Re-derivation from the recorded vectors (each line printed by
`awk 'NR==N{printf "%d: %s\n",NR,$0}' SCORECARD.md`):

| Site | Recorded vector |
|---|---|
| `SCORECARD.md:1123` (r23 start) | depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8 |
| `SCORECARD.md:1642` (r32 start) | depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8 |
| `SCORECARD.md:1865` (r34), `1934` (r35) | identical to r32 |
| `SCORECARD.md:2051` (r37 start) | "adjacency 8 (lowest non-retired), operability 9, all others 9; saturation 8 / window 3" |
| `SCORECARD.md:2073` (r37 disposition) | adjacency 8 → 8; operability 9 → 9 |
| `SCORECARD.md:2105` (r38) | "Axis scores held; saturation 8 / window 3" |
| `SCORECARD.md:2129-2130` (r39) | coverage 9 → 9 held; calibration 9 → 9 held |
| `SCORECARD.md:2198` (r40) | coverage 9 → 9 held |
| `SCORECARD.md:2211` (r41) | "No axis is numerically re-scored or retired." |

⇒ the r42 start vector is exactly `adjacency 8, others 9`; saturation 8 / window 3 is
unchanged since r35 (`2001`, `2033`, `2085`, `2151`, `2200` all repeat it).
**Confirmed.**

Window slide is also consistent: r41 declared the window "rounds 38-40"
(`.ufo/waves/round-41/claims.json` `stagnationNudge`), r39 declared "rounds 36–38"
(`SCORECARD.md:2114`), r42 declares "rounds 39–41" (`SCORECARD.md:2227-2228`). A sliding
three-round window in every case.

**Defect F1 (high): the only axes table contradicts the vector and would invert the nudge.**
`SCORECARD.md:91-100` (`## Axes — final state (refresh landed round 11 …)`) is the sole
`## Axes` table (`grep -n "^## Axes" SCORECARD.md` → `91:`) and still records
`depth 7 / coverage 5 / operability 5 / freshness 3 / calibration 6 / adjacency 5`
with last-change rounds r9–r11. Under a literal reading of that table
`freshness 3 < 8`, so `every axis >= saturation` is false, the stagnation nudge is
**inactive**, and the lowest-axis obligation would bind on adjacency — i.e. the declared
premise ("the stagnation nudge waives the lowest-axis obligation", `claims.json:18`,
`SCORECARD.md:2228`) would be refuted. `AXES.md:77-79` (SCORECARD contract) requires an
axis row carrying score + last-change round; that row is ~20 rounds stale and understates
every axis by 2–6 points. The vector is only recoverable from round-group prose.

## 2. "No capability entered in rounds 39–41" — confirmed independently

The lane's own derivation function was run over the committed `SCORECARD.md` with its
exact rule (`capabilityRounds`: prose `First-working round: N` plus the last cell of rows
under a `First-working round` header, `scripts/check-selfassessment.mjs:445-459`):

```
capabilityRounds: [1, 13, 16, 17, 22, 23, 24, 25, 32, 35]
allAtLine: True    recent in [39,41]: []
derived nudge for round 42: active
```

Cross-checks in text: `SCORECARD.md:1974` (`### Capabilities — round 35`, adds
`webdriver-bidi-runtime-firefox`) is the last capabilities table; `2033` (r36) "No new
capability entered"; `2085` (r37) "No new capability row"; `2104` (r38) "no capability row
enters the table"; `2149-2151` (r39) "No capability entered"; `2198` (r40) "no capability
row"; `2211` (r41) "No capability row or score delta."
Capability-table headings exist only at `383`, `424`, `572`, `764`, `805`, `1661`, `1976`.
⇒ **premise confirmed**; the r42 waiver follows `AXES.md:66-73`.

## 3. Round-41 section vs the round-41 verifier (and every remaining mismatch)

Verifier source: `corpus/lessons/round-41-verifier-spotcheck.md` (only file in
`34e1779`, `git show --stat 34e1779`), verdict `rejected-honest-stop`, defects D1–D4 at
`§6`. Re-derived datums:

```
git ls-tree -r --name-only ef41e53… -- corpus/evidence/round41 | wc -l        → 0
git ls-tree -r --name-only HEAD    -- corpus/evidence/round41                  → 2 files
git cat-file -s ef41e53:.ufo/waves/round-41/controls/c1-baseline-noop.out      → 0
git cat-file -s 9b6de3a:…/c1-baseline-noop.out                                 → 343
sha256sum HEAD:corpus/evidence/round41/…/receipt.json                          → 416f6e4b…446db1  (= c1-measure.json receiptSha256)
sha256sum HEAD:corpus/evidence/round41/…/receipt.witness.json                  → d3c9972e…f39d3  (= witnessSha256)
```

**F4 (moderate) — D1 residue in the scorecard, uncorrected.** `SCORECARD.md:2208`
("two measured runs and witness are recorded") and `SCORECARD.md:2218` ("C1's live receipt
and counter pass are recorded") present the receipt as evidence; at the r41 measurement
rev the tree held **0** committed files under `corpus/evidence/round41`. No append-only
correction naming 2208/2218 was landed in r42 (the r42 block `2221-2242` contains no
correction block; the file's own convention is "corrections (append-only; each cites the
stale line in its own document)", e.g. `1503`, `1560`, `1605`, `1779`, `1807`, `1885`).

**F5 (moderate) — D3 residue.** `SCORECARD.md:2208` before-cell cites
`.ufo/waves/round-41/controls/c1-baseline-noop.out`, "exit 0"; that blob was 0 bytes at
`ef41e53` and was populated only in r42 (343 B, commit `9b6de3a`). The control's own header
discloses the retrofit ("populated per round-41 verifier routed defect D3 (was committed
empty)"), the scorecard line does not.

**F6 (moderate) — a r41 "observed result" no longer reproduces, uncorrected.**
`SCORECARD.md:2209` records `node scripts/check-c2-knowledge-round41.mjs --root …` as
"current checker exits 0". At HEAD:

```
$ node scripts/check-c2-knowledge-round41.mjs --root /home/vgpnk/Projects/shokunin/tabi-shokunin
{"schema":"tabi-r41-c2-knowledge","predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}
EXIT=1
```

The cause is this round's own D2 repair (S146 `mined`→`rejected`, used-by repointed). The
checker bytes are unchanged (`sha256` matches the r41 `frozenDigests` pin
`53cded9e…`), so this is a genuine environment-vs-assertion divergence, not a byte drift.
Nothing in r42 states that the r41 instrument was superseded, and r42 declares no no-harm
gate that would catch it.

**F7 (moderate) — the "one sentence, three sites" assertion is not literally true.**
`SCORECARD.md:2230` states the predicate is "one sentence, three sites: claims.json,
checker header, checker code for C2". Tested with a literal substring check:

```
C2 .ufo/waves/round-42/counters/check-routed-defects-round42.mjs | predicate 1070 B | byte-identical copy present: False
C1 scripts/measure-c1-round41.mjs                                | predicate  716 B | byte-identical copy present: False
```

The checker header restates the predicate as a numbered clause list (`:9-22`), not the
sentence. The *conditions* do match — I read `R1` (`:70-90`), `R2` (`:92-120`), `R3`
(`:121-132`), `R4` (`:133-167`) and confirmed each against the frozen sentence, and the
`r2` cell index is correct (`cell(s148,7)` is the `teaches` column; `cell(s146,8)` is
`status`, verified against the `SOURCES.md` header at `:13`). So this is a wording
overstatement of the round-37 defect class ("the enforced predicate is not one
byte-identical sentence"), not a semantic hole.

**F8 (low-moderate) — the D-map loses half of r41-D3.** The verifier's D3 has two parts
("The undispatched wave … `KeyError(taskCall)` … `controls/c1-baseline-noop.out` is empty").
`claims.json:19` (`freshStartNote`) and `claims.json:43` (`surface`) restate D3 as only
"empty baseline control", and the C2 ledger's `r3` checks only the file. The dispatch half
is carried by C1's wave predicate (`.ufo/waves/round-42/w1-spec.json` `items` = 64;
`w1-dispatch.json` carries `taskCall`), so no hole is open, but the ledger's numbering is
lossy for a reader.

**F2 (moderate) — the C2 before-state under-enumerates.** `claims.json:46` lists five
finding ids ("r1a … r1b … r2-supersession-absent, r3-baseline-file-empty,
r4-quarantine-absent"). The committed red control and my re-run at the baseline rev both
produce **seven**:

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 34e17795… --repo … --json
predicate false, findingCount 7: r1a-receipt-absent, r1b-witness-absent,
r2-s146-not-rejected, r2-supersession-absent, r3-baseline-file-empty,
r4-slice-absent, r4-quarantine-absent          (EXIT_BASE=1)
$ cat .ufo/waves/round-42/controls/c2-baseline-red.json      → identical seven
```

**F3 (moderate) — the scorecard row is internally inconsistent.** `SCORECARD.md:2236`
says "exit 1, 7 findings" and then enumerates six (drops `r4-slice-absent`).

**F9 (low) — forward-referenced provenance at the measured revision.**
`LOG.md:2656` records "S146 used-by → `corpus/lessons/round-42.md`"; `corpus/SOURCES.md:160`
carries that path, but `ls corpus/lessons/round-42.md` → `No such file or directory` at
HEAD. The C2 checker does not test `used-by` existence, so `predicate` is unaffected.

**Other checks that came out clean** (stated so the negative results are on record):
`claims.json` producer digests all match at HEAD (`scripts/measure-c1-round41.mjs`,
`scripts/playwright-firefox-egress-round41.mjs`, `scripts/check-c2-knowledge-round41.mjs`,
`.ufo/waves/round-41/counters/c1-session-bound-v4.mjs`, three forger fixtures → 7/7
`MATCH`); the r42 C1 self-measurement's declared digests match disk
(`39844552…7b7e`, `163f4eba…d339`, nonce `94c0f0ef…21ab` in receipt and both runs,
sampleCount 126/134); the r41-replay control refuses (`EXIT=1`); the C2 checker at HEAD is
red on exactly `r4-quarantine-absent`; `c2-at-freeze.json` equals my HEAD run; the
`causalSeparation` claim in `claims.json:20` holds (the C2 checker reads no
`corpus/evidence/round42` path—`grep` finds only its own filename; the C1 counter
`c1-session-bound-v4.mjs` contains no `registry`/`SOURCES`/`quarantine` reference);
`quarantine/slice-ids.txt` = 38 ids (`wc -l` → 38, non-empty lines 38), matching the frozen
sentence's "38 identifiers"; S148's teaches remainder "A space-separated list of
command-line options." is a 6-word verbatim substring of the committed staged HTML
(`p in html` → `True`), S146 status is `rejected`.

**F10 (low) — the lane's own self-assessment gate is red during the wave.**
`node scripts/check-selfassessment.mjs --rev 0081bfdb… --json` → exit 1,
`clean=false`, `mismatches=1`, `couldNotEvaluate=117`, `superseded=48`; the single counted
finding is `m3-unlanded-paths` (round 40, `claimed=landed`, `observed=649`) because the
newest `## Round N — executed disposition` block is r40 while
`git status --porcelain --untracked-files=all` was non-empty (662 of the paths are this
wave's own seat reports under `.ufo/waves/round-42/w1/`; the count grew to 668 while I
worked). This is an in-flight artifact of the counter's worktree rule
(`scripts/check-selfassessment.mjs:414-424`), not a static false claim — but it must be
disclosed, and re-run after integration, because rounds 35–36 recorded
"check-selfassessment mismatches 0" (`SCORECARD.md:1972`, `2025`).
Raw: `selfassessment-head.json` in this seat dir.

**F11 (low) — out-of-bound tree mutations created during this wave.**
```
$ git status --porcelain --untracked-files=all | grep -v '^?? .ufo/waves/round-42/w1/'
?? .ufo/waves/round-42/parse-w1-results.mjs
?? .ufo/waves/round-42/w1.ready.dispatched
?? corpus/evidence/round42/playwright-egress/receipt.json
?? corpus/evidence/round42/playwright-egress/receipt.witness.json
?? corpus/knowledge/knowledge
?? corpus/lessons/lessons
$ ls -la corpus/knowledge/knowledge corpus/lessons/lessons
lrwxrwxrwx … 12:39 corpus/knowledge/knowledge -> …/tabi-shokunin/corpus/knowledge/
lrwxrwxrwx … 12:39 corpus/lessons/lessons   -> …/tabi-shokunin/corpus/lessons/
```
Two self-referential symlinks in the production corpus tree, mtime **12:39**, i.e. after the
12:20 dispatch (`LOG.md` r42 entry). They are outside any seat dir, are not D1–D4, inflate
F10's porcelain count, and are a recursion hazard for recursive walkers. Observed bytes
only — no attribution is claimed.

## 4. Saturation / retired vs "no axis harmed"

- Numbers: `saturation 8 / window 3` (`SCORECARD.md:2227`, `claims.json:15-16`) are identical
  to r35–r41 and consistent with the confirmed vector (all axes ≥ 8) and the confirmed
  capability history (none after r35) ⇒ **nudge active, waiver legitimate** (AXES.md:66-73).
- **F12 (low-moderate): the r42 block omits the retirement line.** Every recent round states
  it — `SCORECARD.md:2033` (r36), `2085` (r37), `2151` (r39), `2200` (r40), `2211` (r41)
  ("No axis retired" / "No axis is numerically re-scored or retired"). The r42 block
  (`2221-2242`) contains `retired` nowhere (`awk` filter over the range returns only the
  `saturation`/`nudge` lines 2227-2228). Retirement is a declaration-time fact, not
  wave data, so its absence is not "owed until WAVE-DONE".
- **F13 (moderate): no declared no-harm accounting.** `AXES.md:34-38` makes admission
  conditional on "every claim verifies **and no axis is harmed**". r42 declares no no-harm
  instrument (no `noharm-at-*.txt` command, unlike r32 `SCORECARD.md:1677`, r34 `1904`,
  r35 `1972`), and its two kill rules only hold the two claimed axes
  ("coverage holds its score", `claims.json:33`; "calibration holds its score",
  `claims.json:48`). The four unclaimed axes (adjacency, operability, depth, freshness) have
  no declared detector for this wave — and F6 is a concrete observed candidate harm (an
  existing committed instrument went red) that such a detector would have caught.

## Findings summary (smallest safe correction; frozen bytes are never amended)

| # | Sev | Site | Mismatch | Smallest safe correction |
|---|---|---|---|---|
| F1 | high | `SCORECARD.md:91-100` | canonical axes table 5–7 vs declared 8/9; literal read inverts the nudge | append a refreshed axes table (r32–r37 vector + last-change rounds) citing `91-100` as historical |
| F2 | mod | `claims.json:46` | before-state lists 5 ids; control has 7 | route in round report/lesson; do not amend |
| F3 | mod | `SCORECARD.md:2236` | "7 findings" then 6 enumerated | append-only correction citing the red control |
| F4 | mod | `SCORECARD.md:2208`, `2218` | receipt called "recorded"; 0 committed files at `ef41e53` | append-only correction citing both lines + `ef41e53` |
| F5 | mod | `SCORECARD.md:2208` | cites an empty control as before-state | append-only note (control header already discloses) |
| F6 | mod | `SCORECARD.md:2209` | "current checker exits 0"; now exit 1 | append-only correction; record r41 instrument superseded |
| F7 | mod | `SCORECARD.md:2230` | "one sentence, three sites" not byte-true | correct the wording, or land the literal sentence in a later round's own bytes |
| F8 | low-mod | `claims.json:19`,`43` | r41-D3 halved (dispatch part dropped) | state the split in the disposition |
| F9 | low | `LOG.md:2656`, `SOURCES.md:160` | `used-by` → absent `corpus/lessons/round-42.md` | land the lesson (already owed) or note the forward ref |
| F10 | low | whole tree | self-assessment `mismatches=1` (m3) mid-wave | disclose; re-run after integration |
| F11 | low | `corpus/knowledge/knowledge`, `corpus/lessons/lessons` | out-of-bound symlinks at 12:39 | L1 removes before integration; record as wave-boundary incident |
| F12 | low-mod | `SCORECARD.md:2221-2242` | no "no axis retired" line | append the line (declaration-time fact) |
| F13 | mod | `SCORECARD.md:2221-2242` | no no-harm instrument declared | declare and run one before admission |

## Limitations

- The C1 live measurement was not re-run (out of this seat's axis; C1 seats own it, and the
  counting command is a 40 s browser run). I verified only that its declared digests match
  disk bytes and that its producer digests equal the r41 pins.
- F10's count is a worktree snapshot (649 at run time, 668 later); it is not a static
  property of the revision.
- No wave seat output was judged; the wave is in flight. Nothing here scores C1 or C2.
- No remote fetch was needed: every datum came from committed bytes or local files.

VERDICT finding
