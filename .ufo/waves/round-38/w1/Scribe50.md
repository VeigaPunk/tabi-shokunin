# W1-50 — Scribe50 — sources row/knowledge gate, lesson/mistakes, SCORECARD/LOG/report consistency

- seat: Scribe50 (scribe, leaf — no dispatch)
- round/wave: tabi round 38, attempt 1, v2 falsification wave; attack id **W1-50**
- lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- frozen claim bytes: `.ufo/waves/round-38/claims.json` at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`
- revs observed: `a8e7d50` (freeze), `3bc0b10` (worktree HEAD while writing; lane is live and HEAD may advance)
- method: read-only (`git show`, gates run read-only, live page fetch, `curl`+`sha256sum` into scratch). No production file, commit, judge, or sibling repo touched. Nothing was rerun merely to decorate the report; every executed command's output is quoted below.
- scratch: `/fast/scratch/hyaku/tabi-r38/Scribe50/` (removed before yielding; all cited outputs are inlined here)

Focus #2 surfaces attacked: `corpus/SOURCES.md` row admission (S144) and the knowledge gate that admits `corpus/knowledge/playwright-firefox-loopback-round-38.md`; `corpus/lessons/round-38.md` (Gate + Mistakes); SCORECARD/LOG round-38 blocks against the frozen claims and the frozen C1 counter.

## 0. Freeze integrity (holds)

```
sha256sum of each claims.json frozenDigests path  ==  digest in claims.json   (5/5)
c1-routed-defects.mjs      209d86a0…d57f7
c1-adjacency-sweep-v6.mjs  704da806…a890bb
c2-firefox-bidi-v4.mjs     6a14d8ca…7fecf
c2-battery-mutants.mjs     6d7a925b…e503c
scripts/playwright-firefox-loopback-round38.mjs 4cf3a849…e75c1
```
Both worktree bytes and `git show a8e7d50:<path>` bytes produce these digests.

Falsified already: nothing about instrument byte-freeze.

## 1. Frozen C1 counter at the current rev (predicate false, exit 1)

```
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3bc0b10 --repo . --json
→ exit 1; predicate=false; 12 findings
```
Per clause (verbatim from `--json`):

| Clause | State at `3bc0b10` | Evidence |
|---|---|---|
| D1 stale 68-seat line present | true | SCORECARD stale block ("**68 seats** (w1 34 + w2 34)") still present |
| D1 superseding correction after it | true | `SCORECARD.md:2102` "the old scorecard wave block says 68 seats; round-37 w2 was not dispatched" |
| D1 seats re-derived == 34 | **FAIL** `d1-results: w1-results.json absent` | `.ufo/waves/round-37/w1-results.json` is untracked in the worktree (`git status --porcelain` → `?? .ufo/waves/round-37/w1-results.json`) and absent at `3bc0b10` (`git cat-file -e 3bc0b10:.ufo/waves/round-37/w1-results.json` → fail) |
| D1 w2 artifacts absent | true | no `w2.ready`, no `w2-results.json` |
| D2 tally stated == recomputed | **holds** | counter recomputes `{ok:23, finding:11, reports:34}` from the 34 committed `.ufo/waves/round-37/w1/*` seat reports; LOG r38 states `23 ok / 11 finding` |
| D3 six hashes present in LOG r38 | **FAIL ×6** | all six report `presentInR38Section:false`, `isCommit:true`, `ancestorOfRev:true` |
| D3 freeze landing = `34ed508c` | **FAIL** `d3-freeze-landing` | LOG r38 names `3f42a5c7`, `a8e7d50c`, `98239d0` only |
| D4 lesson captured-by + mutant receipt | **FAIL** `d4-m3`, `d4-receipt` | see F5 |
| D5 census receipt with counts | **FAIL** `d5-receipt` | `.ufo/waves/round-38/measure/` empty (see F3) |
| D6 numstat window | **FAIL** `d6-file` | no `numstat-at-*.txt` under `measure/` |

Assessment: C1 is **not met at any observed rev**; the unfalsified-at-freeze parts (D1 correction text, D2 tally) are the two clauses that actually hold. The SCORECARD block itself says the result is "pending integration and frozen measurement", so this is a state report, not an overclaim — except F2, which is a committed false statement.

## 2. Findings

### F1 — C2's counting command cannot fail (calibration; coverage)
`scripts/playwright-firefox-loopback-round38.mjs:157-167`: `main()` writes the receipt and prints `{wrote, runs, binding, egress, survivors, firstShot}`. The only exit paths are `process.exit(64)` for missing `--out` (line 153) and `process.exit(1)` on a thrown error (line 169). There is **no assertion and no non-zero exit** when `binding === false`, `egressNonLoopback > 0`, or `survivors > 0`.
Consequence: claims.json C2's `countingCommand` reports the predicate's inputs; it never evaluates "Two cold runs; same first screenshot SHA; loopback-only requests; zero observed non-loopback sockets; zero survivors; click/navigation/evaluation evidence verified". A run with differing first-shot hashes or a survivor still exits 0 and yields a citation-shaped receipt.
Falsifier: mutate the receipt's `binding` to false / `survivors` to 1, run the frozen command over that state, and show a non-zero exit or a refusal; or add the assertion and show exit 1.

### F2 — committed SCORECARD sentence cites an uncommitted object (calibration)
`SCORECARD.md:2102` (round-38 block): "The committed round-37 result object records 34 w1 seats."
`git cat-file -e 3bc0b10:.ufo/waves/round-37/w1-results.json` fails; the file is only an untracked worktree file. The frozen counter reaches the same conclusion (`d1-results`). The sentence is false at the rev it is committed at.
Falsifier: commit that object (or a seat-count receipt the counter can read) and re-run the counter's D1 clause.

### F3 — lesson and LOG cite a census receipt that does not exist (calibration)
`corpus/lessons/round-38.md` §Census: "Round-end validation returned exit 0 and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt`".
`git cat-file -e 3bc0b10:.ufo/waves/round-38/measure/census-end.txt` → absent; `.ufo/waves/round-38/measure/` is empty in the worktree too (D5 is keyed on this exact path). The validate run itself is reproducible and green:
```
bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi → exit 0
last line: tabi  ok  /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md   (20 pre-existing W04)
```
So the fact is true; the committed pointer is false.
Falsifier: land `measure/census-end.txt` carrying parsed counts (rows / tier / status) that equal the counter's own parse.

### F4 — LOG r38 has no hash-carrying ledger (calibration; D3)
`LOG.md` round-38 section (starts `## Round 38 — 2026-10-27 — calibration corrections and Playwright Firefox capability`) contains none of `99437d29`, `f76da094`, `34ed508c`, `5a2ebb6a`, `f485cce1`, `bf8ecd5a`; all six exist as commits and are ancestors of `3bc0b10`. The freeze-landing attribution (`34ed508c`, not `99437d29`) is also absent. The section's own last line defers this ("will follow in the appended round-38 ledger"), so it is an open defect, not a false statement.
Falsifier: append a hash-carrying round-38 ledger; counter clause D3 flips.

### F5 — lesson `## Mistakes` does not carry the routed M3 row or its red control (calibration; D4)
`corpus/lessons/round-38.md` has one row: `M1, class self-assessment-overclaim … Captured-by: none at round 37`. No `surface-mismatch` row, and `Captured-by:` names nothing that captures it. `.ufo/waves/round-38/baseline/` is empty — `m3-sentence-mutant.json` absent, so round-37's routed defect 4 ("M3's byte-identity fix is green-only — ship a red control") is unaddressed in committed bytes.
Falsifier: add a `## Mistakes` row whose `Captured-by:` names round-37 M3 (surface-mismatch) and commit `.ufo/waves/round-38/baseline/m3-sentence-mutant.json` recording `exit != 0` for the mutated sentence.

### F6 — claims.json names a baseline that is not the round-start baseline (calibration; D6)
- `claims.json`: `"frozenAt": "98239d03…"`, `"baseline": "98239d03…"` (`98239d0` = "round-38: add frozen-instrument candidates and Firefox driver", 12:31:49).
- `LOG.md` r38: "Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`" (= round-37 verifier spot-check, 11:34:56, i.e. the tip before the 11:37:11 launch).
- frozen C1 counter: `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'`, and D6 requires "the receipt's header names both endpoints and the baseline equals the frozen round-start baseline".
Three different meanings, one name: a D6-satisfying `numstat-at-<rev>.txt` must diff `3f42a5c..REV`, which contradicts `claims.json` `"baseline": "98239d0"`. Also `frozenAt` names `98239d0` although the claims file itself lands at `a8e7d50`.
Falsifier: a receipt under `measure/` whose header names `98239d0..REV` and is accepted, or an amendment to claims.json that reconciles the field.

### F7 — the new knowledge note has no coverage-map row (coverage gate; QUALITY 11)
```
( export LC_ALL=C; comm -23 <(git ls-tree --name-only 3bc0b10 corpus/knowledge/ | xargs -n1 basename | sort) \
   <(git show 3bc0b10:corpus/README.md | grep -o 'knowledge/[a-z0-9-]*\.md' | sed 's|knowledge/||' | sort -u) )
→ playwright-firefox-loopback-round-38.md        (exactly one unmapped note, the round-38 admit)
```
`3bc0b10` touches `LOG.md`, `SCORECARD.md`, `corpus/SOURCES.md`, the receipt, the note and the lesson — **not** `corpus/README.md`. `corpus/QUALITY.md` criterion 11: "A coverage/index map either lists every current note or states its snapshot date and the exact open row-count gap in the same commit as each admit." Neither holds in the admitting commit. `corpus/README.md` is also in `check-round-contract.mjs`'s `APPEND_ONLY` set, so the fix is an append.
Falsifier: a README row for the note (or a dated snapshot + gap statement) in the admit commit; the `comm` line then returns empty.

### F8 — S144's registry anchor is weaker than every neighbouring row (sources row gate)
`corpus/SOURCES.md` row 158 (`S144`, 11 columns, tier A, status mined, `used-by` resolves to the committed note):
```
anchor = "living docs page, §Firefox; opened 2026-10-27, page identifies Playwright's patched Firefox and platform variation"
```
No fetch timestamp, no byte count, no raw-fetch sha256, no located quote in the cell. S140/S141/S143 by contrast carry a fetch timestamp, a byte count and a raw-fetch sha256 (S141/S143 also the HTTP status) plus line/section anchors. The row passes `node scripts/check-sources.mjs` only because that gate checks structure (its only anchor rule is `bare_anchor` when the cell is empty):
```
SOURCES_GATE verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0
```
I verified the source and the quote live (read-only fetch into scratch):
```
curl -sSL https://playwright.dev/docs/browsers → http=200 bytes=134107
sha256 bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5
grep -c "Playwright doesn't work with the branded version of Firefox" → 1
```
and the lesson's §Gate quote ("…since it relies on patches.", 14 words) matches the page under §Firefox. So the admission is *substantively* true; what is missing is the row-level provenance digest the lane's own precedent records, and the divergence is invisible to both `check-sources` and the census.
Falsifier: an anchor cell carrying fetched-at + bytes + sha256 (e.g. that digest, dated); the row then matches S143's shape.

### F9 — note freshness fields drift from the lane's stated standard (freshness)
`corpus/knowledge/playwright-firefox-loopback-round-38.md`:
```
verified-at: round 38, Playwright 1.64.0, Firefox 157.0          ← no timestamp, no digests
recheck: run `node scripts/playwright-firefox-loopback-round38.mjs --out <receipt> --runs 2`; compare …
```
32 of 56 knowledge notes carry `recheck:`; the sampled set uses a cadence (`180d`, `on-release`, `90d`, `on each Playwright release`). SCORECARD r37's planned freshness work says "dated `recheck:` lines … each with a date or cadence and a procedure". This note has a procedure and no date/cadence, while its own source row declares `recheck: on-release` — row and note disagree on cadence. Round-35/36 precedent for `verified-at` carries fetch timestamps and digests.
Falsifier: a `recheck:` line with a date or cadence (e.g. `on-release`) and a `verified-at:` with the fetch timestamp/digest.

### F10 — C2's "Firefox 157.0" rests on a probe, and the receipt field for it is permanently null (coverage evidence)
Driver line 157 initializes `firefoxVersion: null` and nothing ever assigns it; line 158-159 launches a probe and sets only `browserVersion = probe.version()`. Committed receipt: `firefoxVersion: null`, `browserVersion: 157.0`. The claim (`Firefox 157.0`), the knowledge note ("ran Firefox 157.0"), and the SCORECARD bullet all trace to `browserVersion` alone; the receipt says nothing about the on-disk binary (`/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`, 579,008 B, installed 2026-10-27 11:48:57 — after the 11:37:11 launch, before the 12:31 freeze, consistent with C2's `before`).
Falsifier: populate `firefoxVersion` from the binary (and record its digest) and show it equals `browserVersion`.

### F11 — C2 egress/survivor/sampling instrument limits (coverage; not a claim violation)
From the committed receipt (`3bc0b10:corpus/evidence/round-38/playwright-firefox/receipt.json`):
```
runs=2  firstShotSha256=[3e0c070a…, 3e0c070a…]  binding=true  egressNonLoopback=0  survivors=0
run1: egress {samples:2, nonLoopback:0, lines:1} survivors=0 firefoxPids=[397394,397786,397834] portClosed=true httpLog=6
run2: egress {samples:2, nonLoopback:0, lines:1} survivors=0 firefoxPids=[401023,401401,401452] portClosed=true httpLog=6
hosts per run: 127.0.0.1:<port>, /a.html, /favicon.ico, /b.html   (all loopback)
```
Three limits, each observable in the driver:
1. egress is sampled twice per run (400 ms timer, `ss -tnp`, TCP only) — DNS/UDP egress is invisible, and the claim's "zero observed" hedge is what keeps this honest.
2. `ss -tnp` is filtered to the pids captured immediately after launch; children spawned later are outside both the egress filter and the survivor count.
3. `const profile = mkdtempSync(join(profileRoot,'profile-'))` (line 72) is never passed to `firefox.launch` (line 73), so `profiles/` stays empty: the "two cold runs" property is Playwright's own per-launch temp profile, uncontrolled and unrecorded by the driver.
Also: "loopback-only requests" has no derived field or assertion; the receipt only lists event URLs, and `httpLog` is a page-event slice (server-side `http.request` events are excluded).
Falsifier: a run whose receipt shows `binding=false`/`survivors>0`/a non-loopback URL — or an added loopback assertion and profile plumbing with a receipt that shows it.

### F12 — C2's capability-row clause is satisfied in prose form, but no frozen instrument reads it (coverage; calibration)
The round-38 block carries an appended capability row — `Capability row: playwright-firefox-loopback — … first-working round 38. Source: S144.` (`SCORECARD.md:2105`). That shape matches the lane's *current* append convention rather than the round-35 table: `SCORECARD.md:1102` ("Capability row (appended; the table at `:381` is a historical snapshot and is not edited in place)"), `:1237` and `:1297` ("Capability rows (appended; … historical snapshots)") all append prose rows with an evidence pointer and a first-working round. On that convention the clause is met; the residual finding is measurement, not wording:
- no frozen instrument reads SCORECARD.md (the frozen set is the two C1/C2 instruments plus three operability amendments), so "capability row enters SCORECARD" is asserted, never checked;
- the row's evidence pointer is the receipt, and neither the receipt nor the knowledge note appears in `claims.json` `frozenDigests` — a hand-edited receipt would satisfy every frozen instrument in this round (compare round-37's `observed`-binding amendment, which closed exactly this class for the BiDi receipt).
Falsifier: a frozen digest for `corpus/evidence/round-38/playwright-firefox/receipt.json` (or a counter that re-derives its binding/egress/survivor fields); or a mutation of that receipt accepted by the round's instruments.

### F13 — frozen instrument set exceeds the declared claim set (calibration; scope)
`claims.json` declares C1 (calibration, `c1-routed-defects.mjs`) and C2 (coverage, the Playwright driver), yet freezes five instruments. The extra three are round-38 operability amendments whose own headers claim labels that do not exist in claims.json:
- `c1-adjacency-sweep-v6.mjs` — "claim C2a (operability — amendment of the round-37 frozen v5 counter)"
- `c2-firefox-bidi-v4.mjs` — "claim C2b (operability: survivor-term control …)"
- `c2-battery-mutants.mjs` — mutant battery over the v4 counter
None has a predicate in `claims.json`, a counting command, or a measurement at REV. A grep for `playwright|S144|playwright-firefox-loopback|round-38/.*receipt` over the three returns one match, and it is unrelated: `c1-adjacency-sweep-v6.mjs:115` has `playwright` inside its browser-term regex `BG`. So none of them examines C2's surface.
Falsifier: claim entries (C2a/C2b) with predicates and commands, or their removal from `frozenDigests`.

### F14 — `check-selfassessment` is red for a worktree-dirt reason, and round 38 will not fix it by landing its own block (calibration; gate scoping)
```
node scripts/check-selfassessment.mjs --rev 3bc0b10 --json → exit 1
{mismatches:1, couldNotEvaluate:116, superseded:48}
mismatch: {class:"m3-unlanded-paths", doc:"SCORECARD.md", round:37, claimed:"landed", observed:57}
```
The 57 porcelain paths are round-38 wave artifacts (`?? .ufo/waves/round-38/…`, `?? .ufo/waves/round-37/w1-results.json`), but m3 attributes them to the newest block matching `/^##\s+Round\s+(\d+)\s+—\s+executed disposition/` — which is **round 37**, because round 38's block is titled "## Round 38 — corrections and capability candidate". Until those artifacts are committed, the lane's calibration gate cannot be green; and if round 38 keeps the non-conforming heading, its own dirt will keep being charged to round 37. Any round-end report citing "mismatches 0" must say at which rev it was measured.
Falsifier: commit the wave artifacts and re-run (expect `mismatches 0`), or rename the round-38 block to the `executed disposition` form and show m3 then names round 38.

## 3. Consistency matrix (SCORECARD / LOG / lesson / claims) at `3bc0b10`

| Statement | Source | Observed | Verdict |
|---|---|---|---|
| stale 68-seat block retained + correction appended | SCORECARD | both present | consistent (append-only held) |
| "committed round-37 result object records 34 w1 seats" | SCORECARD:2103 | object uncommitted | **F2 false** |
| seat tally 23 ok / 11 finding | LOG r38 | counter recompute 23/11 over 34 reports | consistent |
| round-37 commit hashes in LOG r38 | LOG r38 | none present | **F4 open** |
| freeze landing `34ed508c` | LOG r38 | absent | **F4 open** |
| census receipt path | lesson §Census | absent; dir empty | **F3 false pointer** |
| 143 rows at round start | lesson §Census | `git show 3f42a5c:corpus/SOURCES.md` = 143 | consistent |
| round-end validate exit 0 / `tabi ok` | lesson §Census | reproduced exit 0, 20 W04 | consistent |
| S144 admitted, quote 14 words, §Firefox | lesson §Gate | live page 200/134,107 B/sha256 bc8a4e26…; quote present | substantively consistent; row lacks digest (**F8**) |
| WebKit rejection: 21 missing libs on `ldd` | lesson §Gate | `ldd …/webkit-2370/minibrowser-gtk/bin/MiniBrowser` → 21 "not found" | consistent |
| note cites S144; row `used-by` resolves | note / SOURCES | row present, path exists | consistent |
| capability "row" enters SCORECARD | claims C2 target | appended prose row present (`:2105`) | met in form; unmeasured by any instrument (**F12**) |
| two runs, same first-shot sha, egress 0, survivors 0 | SCORECARD bullet / LOG / note | receipt agrees | consistent (instrument limits **F1/F11**) |
| note mapped in coverage map | QUALITY 11 | missing | **F7** |
| baseline `3f42a5c` (LOG, counter) vs `98239d0` (claims) | claims.json | disagreement | **F6** |

## 4. What this seat did not attack (out of scope)

- No measurement of C1/C2 at an integration tip in a clean clone; no counter mutants; no driver re-run (the receipt was read, not regenerated).
- No judgment on axis scores, no suggested disposition, no editing of SCORECARD/LOG/lesson, no commit.
- C2's click/navigation/evaluation step *content* was not re-executed; only its presence and the receipt's structural fields were read.

## 5. Artifact paths

- this report: `.ufo/waves/round-38/w1/Scribe50.md` (under `/home/vgpnk/Projects/shokunin/tabi-shokunin`)
- commands whose full output was inlined above were captured at `/fast/scratch/hyaku/tabi-r38/Scribe50/` (`c1-at-3bc0b10.json`, `selfassess-3bc0b10.json`, `receipt-3bc0b10.json`, `census-144.txt`, `pw-browsers.html`) and that scratch is removed before yielding; every figure needed to falsify a finding is reproduced inline.

## 6. Tool installs

None. `curl`, `sha256sum`, `git`, `node` were already present; no pacman transaction, no PATH write.
