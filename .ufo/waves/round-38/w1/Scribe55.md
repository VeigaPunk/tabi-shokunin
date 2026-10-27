# W1-55 · Scribe55 — bounded evidence note (draft findings)

Surface inspected: sources row / knowledge gate, lesson and mistakes, SCORECARD/LOG consistency
for round-38 claims C1 (calibration, routed defects D1–D6) and C2 (coverage, Playwright Firefox
Juggler). Read-only; no product/judge/commit action.

## State actually observed

- Frozen claim bytes: `.ufo/waves/round-38/claims.json` at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`.
  `git show --stat a8e7d50` = **claims.json only** (59 insertions); `git show --stat 98239d0` = the
  five frozen instruments + driver. `git rev-parse 98239d0^` = `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`.
- The lane moved **during** this inspection: HEAD `a8e7d50` → `3bc0b108708c46c800f9050a1caa25bfe3bf5e5a`
  ("round-38: record Firefox capability and routed defects", +427 lines: LOG, SCORECARD, SOURCES,
  receipt, note, lesson). Every HEAD-relative statement below is at `3bc0b10`.
- Worktree at inspection end: only untracked `.ufo/waves/round-37/w1-results.json`,
  `.ufo/waves/round-38/{w1-spec,w1-dispatch}.json`, `w1.ready*`, `w1/` (seat spec/registry/dispatch).

## Commands and outputs (observed)

| # | Command | Observed |
|---|---|---|
| 1 | sha256 of the five `frozenDigests` paths vs claims.json | **5/5 equal** (`209d86a0…`, `704da806…`, `6a14d8ca…`, `6d7a925b…`, `4cf3a849…`) |
| 2 | `node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50 --repo <lane> --json` | `predicate false`; `d2.recomputed = {ok:23,finding:11,error:0,none:0,reports:34}`; `d1.stalePresent true` |
| 3 | same, `--rev 3bc0b10` | `predicate false`; `d1 {stalePresent:true, supersedingCorrection:true, w2Absent:true}`, `d2.stated {ok:23,finding:11}` = recomputed; findings = `d1-results`, 6×`d3-hash`, `d3-freeze-landing`, `d4-m3`, `d4-receipt`, `d5-receipt`, `d6-file` |
| 4 | `node scripts/check-sources.mjs` | `verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0` |
| 5 | `curl -sS https://playwright.dev/docs/browsers` (independent, 2026-10-27) | HTTP 200, **134,107 B**, sha256 `bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5`; §Firefox: "Playwright's Firefox version matches the recent Firefox Stable build. Playwright doesn't work with the branded version of Firefox since it relies on patches." |
| 6 | receipt audit `corpus/evidence/round-38/playwright-firefox/receipt.json` | schema/driver/playwrightVersion 1.64.0/firefoxVersion **null**/browserVersion 157.0/fixture/runs[2]/firstShotSha256[2]/binding true/egressNonLoopback 0/survivors 0. Runs: ports 42819 vs 44115, first shot `3e0c070a…` both, 20,626 B; post-click 22,924 B both, `differsFromFirst true` both; all 10 substantive steps byte-identical across runs |
| 7 | `grep -c 'playwright-firefox-loopback' corpus/README.md SKILL.md` | `0` / `0` |
| 8 | `git cat-file -e HEAD:.ufo/waves/round-38/measure/census-end.txt` | `fatal: path … does not exist in 'HEAD'`; `git ls-tree HEAD .ufo/waves/round-38/` = only `claims.json` + `counters` |
| 9 | `git ls-files .ufo/waves/round-37/w1-results.json` | empty (untracked; content `{lane,round:37,wave:w1,seats:34,results[34]}`) |
| 10 | D4 regexes replayed on `corpus/lessons/round-38.md` | `## Mistakes` true, `captured-by:` true, `surface-mismatch` **false** ⇒ `capturedBy` leg false |

## Findings

### F1 — calibration · HIGH · frozen claims misstate their own freeze commit and baseline
`claims.json` declares `frozenAt = baseline = 98239d0…`. That commit is the **instrument** commit;
the claims landed one commit later at `a8e7d50` (stat above). The round-start tip is `3f42a5c`
(parent of `98239d0`), which is what `LOG.md:2527` states ("Round-start baseline: `3f42a5c…`.
Frozen claims at `a8e7d50…`") and what the counter enforces (`c1-routed-defects.mjs:52
const BASELINE = '3f42a5c…'`). Three surfaces, two agree, the frozen byte is the outlier.
This is round-37 routed defect 3's exact class (freeze-entry landing attribution) recurring inside
the round-38 frozen bytes.
*Falsifier:* `git show --stat a8e7d50` (claims.json only) and `git rev-parse 98239d0^` = `3f42a5c`.

### F2 — calibration · HIGH · D6 enforces a baseline the frozen claim does not declare
`c1-routed-defects.mjs:211-224` requires the numstat receipt to contain `BASELINE.slice(0,12)` =
`3f42a5c7cc19` and `REV`. A receipt written to the claim's own baseline (`98239d0…`) fails
`d6-window`; one written to `3f42a5c` contradicts `claims.json.baseline`. The frozen counter cannot
accept both readings, and no errata currently reconciles them.
*Falsifier:* generate the numstat window from `claims.json.baseline` and re-run the counter.

### F3 — calibration · HIGH · the counter's declared byte-identity with claims.json is false
`c1-routed-defects.mjs:42-45` states "Predicate (frozen) — the same sentence in claims.json and the
receipt's `predicateSentence` field". Measured: counter `PREDICATE_SENTENCE` = 311 chars; claims.json
`C1.predicate` = 82 chars (`D1-D6 all re-derived and corrected at REV by c1-routed-defects.mjs;
predicate true`) — **not equal**. Same for C2: claims predicate is 163 chars of prose; the frozen
`c2-firefox-bidi-v4.mjs` sentence is 154 chars (`no entry finding AND no receipt finding AND …`) — not equal.
This is round-37 M3 (`surface-mismatch`) inside the round-38 frozen set, and the round-38 lesson
(`corpus/lessons/round-38.md:11`) routes D1 only, not M3.
*Falsifier:* string comparison of the three sites (command 10 above, extended to C2).

### F4 — calibration · HIGH · C1 predicate false, with three structurally wedged legs
At `3bc0b10` the counter returns 12 findings. Eight are ordinary pre-integration deliverables
(D3 six hashes + `34ed508c`; D5 `census-end.txt`; D6 numstat; `LOG.md:2531` explicitly defers the
hashes). Three are wedges:
- **(a) D4 requires a literal token the honest lesson does not contain.** `:163,166` test
  `/captured-by:/i && /surface-mismatch/ && /round-37|r37/`. The committed lesson's only Mistakes row
  (`round-38.md:11`) is class `self-assessment-overclaim` for routed defect 1; `grep -c
  surface-mismatch corpus/lessons/round-38.md` = 0. The lesson cannot pass D4 unless it spells
  round-37's M3 class; the counter is frozen.
- **(b) D4's control must live in the frozen-baseline dir, which is empty.**
  `:169-177` reads `.ufo/waves/round-38/baseline/m3-sentence-mutant.json`; `ls -la
  .ufo/waves/round-38/baseline/` = total 0 at dispatch (`w1.ready.dispatched`
  2026-10-27T12:34:41) and at HEAD. claims.json carries no `controls`/`controlsDoNothingNote`
  field (round-37 had both). A control written now is not pre-data.
- **(c) D1 depends on an untracked round-37 artifact.** `:97-102` reads
  `.ufo/waves/round-37/w1-results.json` at REV; `git ls-files` = empty. `SCORECARD.md:2102` already
  states "The committed round-37 result object records 34 w1 seats" — false while untracked.
  Committing that file inside round 38 is the only way D1 can pass, and its `seats:34` is an
  aggregator value, not a seat-dir count.
*Falsifier:* replay the three regexes on the lesson (done, command 10); `git ls-files`; `ls baseline/`.

### F5 — calibration · MEDIUM · two of five frozen digests carry a non-existent claim identity
`c1-adjacency-sweep-v6.mjs:2` = "claim **C2a** (operability)"; `c2-firefox-bidi-v4.mjs:2` = "claim
**C2b** (operability)"; `c2-battery-mutants.mjs:2` = "C2b mutation driver". claims.json declares only
C1 (calibration) and C2 (coverage, Playwright). `grep` over `w1-spec.json`/`w1-dispatch.json` = 0
occurrences of all four counter names; `SCORECARD.md:2103-2105` names only `c1-routed-defects.mjs`
and the driver. The "C2" label is therefore three different things across claims.json, instrument
headers and SCORECARD, and two frozen instruments are unattached this round.
*Falsifier:* `grep -n 'claim C[0-9]' .ufo/waves/round-38/counters/*.mjs` vs claims.json ids.

### F6 — coverage · HIGH · C2's counting command returns no verdict
claims C2's `countingCommand` is the driver itself. `playwright-firefox-loopback-round38.mjs:167-169`
writes the receipt, logs a summary, and returns; the only exits are `64` (missing `--out`, `:153`)
and `1` (thrown, `:169`). `binding`, `egressNonLoopback` and `survivors` are computed into the
receipt (`:166-168`) but influence no exit code and no emitted verdict. The C2 predicate
(`same first screenshot SHA; loopback-only requests; zero observed non-loopback sockets; zero
survivors; click/navigation/evaluation evidence verified`) is prose with **no frozen evaluator** —
unlike C1, whose counter exits 1 on a false predicate. The kill-rule term "no cited newly opened
source row" is likewise checked by no instrument cited by C2 (the only frozen source-row leg,
`c2-firefox-bidi-v4.mjs:581`, belongs to the round-35 BiDi entry and requires a 64-hex gate digest).
*Falsifier:* run the driver on a fixture whose first shot differs between runs → `binding:false`,
exit 0; or with a non-loopback request → `egressNonLoopback>0`, exit 0.

### F7 — coverage · MEDIUM · declared pin is unused; receipt lacks producer provenance
`:24 const FIREFOX_BIN = '…/firefox-1555/firefox/firefox'` — single occurrence in the file
(`grep -c FIREFOX_BIN` = 1): it pins nothing. Launch is `firefox.launch({headless:true})` with no
`executablePath` (`:72`); pid capture (`:73`) and the survivor check (`:138`) both hardcode the path
substring `firefox-1555/firefox/firefox`, so browser identity is a path-label assumption. Mitigation
observed in the receipt: `firefoxPids` = `[397394,397786,397834]` non-empty (the label matched at
run time) and `browserVersion 157.0` from `probe.version()` (`:159`). `firefoxVersion` is hardcoded
`null` (`:157`), so "Firefox 157.0" everywhere is Playwright's build label only. The receipt records
no `argv`, producer digest, revision or exit (top-level keys: schema, driver, playwrightVersion,
firefoxVersion, browserVersion, fixture, runs, firstShotSha256, binding, egressNonLoopback,
survivors) — QUALITY 26/30 fields absent; the driver digest lives only in claims.json `frozenDigests`.
*Falsifier:* `grep -c FIREFOX_BIN` (1); receipt key list.

### F8 — sources row / knowledge gate · HIGH · row registered clean, but the gate is prose and the note is unindexed
- `corpus/SOURCES.md:158` S144: 11 columns, tier A, `mined`, opened 2026-10-27, `used-by` resolves to
  the note; `check-sources` clean (144 rows; 143 → 144). **But** the `anchor` cell is "living docs page,
  §Firefox; opened 2026-10-27, page identifies Playwright's patched Firefox and platform variation" —
  no 64-hex digest, no quote, while S141/S142/S143 anchors carry "page fetched … sha256 …".
  `corpus/lessons/round-38.md:5` gives URL/date/quote (14 words, §Firefox) and likewise **no bytes and
  no sha256**; `grep -E '[a-f0-9]{64}'` on the lesson = none. The lane's own frozen source-row contract
  shape requires exactly that (`c2-firefox-bidi-v4.mjs:581`: lesson §Gate row with an https URL on the
  registry host **and** `HEX64`).
- Substance check (my fetch): the page does carry the claimed distinction, and the lesson's quoted
  sentence is verbatim in §Firefox — so the row's `teaches` cell holds; the missing fetch digest is the
  defect, not the claim.
- QUALITY rule 11: the coverage map must list every current note in the same commit as the admit. The
  note is committed at `3bc0b10`; `corpus/README.md` has **0** round-38 rows and 0 mentions of the note
  (SKILL.md likewise).
- `round-38.md:15` asserts "Round-end validation returned exit 0 and `tabi ok`; captured output at
  `.ufo/waves/round-38/measure/census-end.txt`". That path does not exist at HEAD and `measure/` is not
  in the tree: a committed lesson carries a completed-tense round-end claim and an unresolvable evidence
  pointer (QUALITY 28) — the same self-assessment-overclaim class C1 D1 routes.

### F9 — calibration · LOW · frozen claims cite an id that did not exist at freeze
claims C1 `source`: "S144 (Playwright docs) is only for C2…". `git show a8e7d50:corpus/SOURCES.md |
grep -c S144` = 0; the row lands at `3bc0b10`. Harmless as a plan, but the frozen byte cannot be
re-read as self-consistent, and `LOG.md:2529` "S144 was opened … admitted" has no digest behind it
(F8).

## Consistency legs that DO hold (recorded so they are not re-litigated)

- 5/5 frozen digests match the claims' pins.
- D2 recompute is honest and stable: committed round-37 w1 seat reports → 23 ok / 11 finding over 34
  reports; `LOG.md:2531` states the same tally; D1's stale "68 seats" line survives (append-only) and
  the round-38 correction is admitted by the frozen regex once committed.
- The receipt's two runs agree on every substantive step and both shots; first-shot binding is true;
  request log contains only `127.0.0.1` URLs.
- `check-sources` clean at 144 rows (143 → 144; A 127 → 128; mined 119 → 120).

## What would falsify the claims (summary)

- **C1:** predicate true at the measured REV with all six legs traceable to committed bytes. Current
  state false. Falsified outright if D4 is satisfied only by inserting the word `surface-mismatch`,
  if D1 passes on the untracked aggregator file, or if the measured numstat window uses the
  `claims.json` baseline (F2).
- **C2:** falsified if `binding:false`, `egressNonLoopback>0` or `survivors>0` can coexist with a
  "met" declaration (F6 guarantees no instrument refuses), or if S144's opening has no fetch digest
  in the round's gate receipt (F8).

## Out of scope for this seat

No production-file edits, no commits/pushes, no git/jj mutation, no fleet/sibling repos, no subagents.
Not run: `c1-adjacency-sweep-v6.mjs`, `c2-firefox-bidi-v4.mjs`, `c2-battery-mutants.mjs`, census
script, no-harm suite, the round report (`.ufo/reports/round-38/` does not exist yet). No tool
installs; no pacman. Scratch `/fast/scratch/hyaku/tabi-r38/Scribe55/` (one fetched HTML file) removed
before yield.

## Artifacts

- This report: `.ufo/waves/round-38/w1/Scribe55.md` (lane root, absolute
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-38/w1/Scribe55.md`).
- Cited lane bytes: `claims.json`, `counters/c1-routed-defects.mjs`, `scripts/playwright-firefox-loopback-round38.mjs`,
  `corpus/evidence/round-38/playwright-firefox/receipt.json`, `corpus/knowledge/playwright-firefox-loopback-round-38.md`,
  `corpus/lessons/round-38.md`, `corpus/SOURCES.md:158`, `SCORECARD.md:2100-2106`, `LOG.md:2525-2531`.
