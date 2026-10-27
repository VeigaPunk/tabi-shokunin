# W1-54 — Scribe54: sources row / knowledge gate; lesson and mistakes; SCORECARD/LOG/report consistency

- Seat: `Scribe54` (scribe, leaf member — no dispatch)
- Wave: tabi round 38, attempt 1, w1 (v2 falsification)
- Frozen claims: `.ufo/waves/round-38/claims.json` at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`
- Axes: calibration (C1), coverage (C2)
- Scope: one bounded evidence surface (focus #3). No production edits, no git/jj writes, no installs, no pacman.
- **Moving HEAD**: the lane advanced during inspection. `a8e7d50` (grep freeze) → `3bc0b10` (2026-10-27 12:37:21 -0300, "round-38: record Firefox capability and routed defects"), observed at `2026-10-27T15:39:54Z`. Findings below are stated against `3bc0b10` unless marked "freeze-time"; the chronology is material because two claims changed state between the two commits.

## Axes named

1. **Calibration** — does each stated number/citation re-derive from committed bytes, and is a stated correction actually present?
2. **Coverage** — is the claimed new capability backed by a cited, *opened* source row whose opening is verifiable?

## Commands actually run (read-only; no writes outside this report and removed scratch)

```
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c… --repo . --json   # exit 1, 14 findings
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3bc0b10 --repo . --json     # exit 1, 12 findings
git -C . log --oneline -5 ; git status --porcelain ; git rev-parse HEAD
git cat-file -e 3bc0b10:.ufo/waves/round-37/w1-results.json          # absent
git cat-file -e 3bc0b10:.ufo/waves/round-38/measure/census-end.txt   # absent
git show HEAD:corpus/SOURCES.md | grep -c S144                       # 1
node scripts/check-sources.mjs                                       # verdict=clean rows=144 tiers=A:128,B:7,C:9 status=queued:15,mined:120,rejected:9 findings=0
node -e '<tally over .ufo/waves/round-37/w1/*/report.md, last /VERDICT (ok|finding)/>'   # {ok:23, finding:11}, 34 reports
curl -sS -L https://playwright.dev/docs/browsers -o <scratch>        # HTTP 200, 134,107 B, sha256 bc8a4e26…
sha256sum counters/{c1-routed-defects,c1-adjacency-sweep-v6,c2-firefox-bidi-v4,c2-battery-mutants}.mjs scripts/playwright-firefox-loopback-round38.mjs
```

## Findings

### F1 (C2, coverage) — S144 is now a committed cited row, but its opening has no byte identity

- Freeze-time: `git show a8e7d50:corpus/SOURCES.md | grep -c S144` → **0**; the knowledge note and receipt did not exist in `a8e7d50` (`git cat-file -t a8e7d50:corpus/knowledge/playwright-firefox-loopback-round-38.md` → *"exists on disk, but not in 'a8e7d50'"*).
- Now: `corpus/SOURCES.md:158` is committed at `3bc0b10`; `grep -c '^| S144 |'` → 1. C2's kill-rule clause *"no cited newly opened source row"* is therefore **met in committed bytes** at this HEAD.
- Remaining gap: the row's anchor cell (column 7) reads `living docs page, §Firefox; opened 2026-10-27, page identifies Playwright's patched Firefox and platform variation` — **no HTTP status, no byte count, no sha256, no line anchor**. Every neighbouring row carries one (e.g. `S143`: `page fetched 2026-10-27T09:29:57Z (200, 246,608 B, sha256 0a95cbcd…)`); the round-38 Gate (`corpus/lessons/round-38.md:5`) adds URL, access date and the located quote but still no raw-fetch sha256. The registry contract requires a row's URL, access date, ≤25-word quote with location **and raw-fetch sha256** (`corpus/SOURCES.md:3-6`); for a 200 the bytes are the identity (`corpus/QUALITY.md:615-616`).
- Independent fetch of the cited URL: HTTP 200, **134,107 B**, sha256 `bc8a4e2617cf0388026d59f9932ab762aebec61bdba9f4c0eda6a12c2127eee5`. Because the lane's own bytes are unrecorded, page drift between open time and any later recheck cannot be measured, and "opened 2026-10-27" is not distinguishable from an assumed open.
- What would falsify/repair: bind the row to a fetch receipt (time, status, bytes, sha256) or record it in the Gate; the quote half is already satisfied (F2).

### F2 (C2, coverage) — the quote is now located and verbatim, but the knowledge note over-asserts one word

- The round-38 Gate (`corpus/lessons/round-38.md:5`) states: *"Located quote, §Firefox: “Playwright doesn't work with the branded version of Firefox since it relies on patches.” (14 words)"*. My independent fetch reproduces that sentence **verbatim** in the page body. Quote discipline (≤25 words, located, present) **holds**.
- The committed knowledge note (`corpus/knowledge/playwright-firefox-loopback-round-38.md:7`, identical bytes at HEAD) says: *"Playwright's Firefox is a patched browser build and is not the branded Firefox executable"*. Page probes: `"patched"` → 0 occurrences, `"branded"` → 7. The page says Firefox *"relies on patches"* and *"matches the recent Firefox Stable build"*; it never calls the build "patched" and never says "executable". The paraphrase is directionally supported but strictly stronger than the source.
- Note fixed since the freeze: the note's *"The committed demonstration is `corpus/evidence/round-38/playwright-firefox/receipt.json`"* is now true — receipt blob at HEAD `dd77b71a…` equals the worktree file byte-for-byte.
- Falsifier: quote the page's own sentence (already in the Gate) in the note, or mark the sentence explicitly as an inference; otherwise a recheck against the living page yields a wording mismatch that the Gate quote alone will not cover.

### F3 (C1, calibration) — the frozen C1 counter is still `predicate=false`; 12 findings at `3bc0b10` (14 at the freeze commit)

Counter output at `3bc0b10` (exit 1):

```
d1-results          w1-results.json absent
d3-hash ×6          99437d29, f76da094, 34ed508c, 5a2ebb6a, f485cce1, bf8ecd5a present=false (all isCommit=true, ancestor=true)
d3-freeze-landing   LOG round-38 section does not record the freeze entry landing at 34ed508c
d4-m3               no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)
d4-receipt          m3-sentence-mutant.json absent
d5-receipt          census-end.txt absent at REV
d6-file             no numstat receipt under .ufo/waves/round-38/measure
predicate false     d4 {"mistakes":true,"capturedBy":false}  d5 {}  d6 {}
```

- Terms that now pass at `3bc0b10`: D1 stale-line-present + superseding-correction-present + w2-absent; D2 stated == recomputed (23/11); D4 `## Mistakes` section present (but see F6); D5/D6 inputs are still missing, not wrong.
- Terms that regressed relative to the freeze-time counter run: none — the freeze run additionally failed `d1-correction`, `d2-stated`, `d4-lesson`, which `3bc0b10` repaired. The freeze-time run reported 14 findings; the residual 12 are the ones above.
- Directory state: `.ufo/waves/round-38/baseline/` and `.ufo/waves/round-38/measure/` are still **empty directories** (`ls -la` → `total 0`), and git cannot carry empty dirs — every D4/D5/D6 receipt is a file that does not exist at any REV.
- Falsifier: a measured REV whose frozen-counter output is `predicate:true` with `findings:[]`. At the only REVs bound by frozen bytes (`a8e7d50`) and the current tip (`3bc0b10`) the predicate is false, and the claim text ("D1-D6 all re-derived and corrected at REV") is not yet true.

### F4 (C1, calibration, sharp) — the SCORECARD correction states a *committed* object that is not committed

- `SCORECARD.md:2102` (added by `3bc0b10`): *"The committed round-37 result object records 34 w1 seats."*
- Check: `git cat-file -e 3bc0b10:.ufo/waves/round-37/w1-results.json` → **fatal: path exists on disk, but not in '3bc0b10'**. The file is untracked (`git status` → `?? .ufo/waves/round-37/w1-results.json`, 165,064 B on disk, `"seats":34`). The frozen counter independently records `d1-results: w1-results.json absent`.
- So the D1 repair itself asserts a committed byte that does not exist — the same class of defect (prose overclaim) D1 was routed to fix, now relocated into the correction text. D1's seat-count term cannot pass until the object is committed.
- Falsifier: commit `.ufo/waves/round-37/w1-results.json` (a round-37 artifact) or reword to "the working-tree result object"; the counter's `d1-results` is the executable check.

### F5 (C1, calibration) — the round-38 lesson asserts a census receipt that does not exist, and the count it implies is 144, not 143

- `corpus/lessons/round-38.md:15`: *"Round-end validation returned exit 0 and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt`"*. At `3bc0b10` and on disk that path **does not exist** (`git cat-file -e` → fatal; `ls .ufo/waves/round-38/measure` → empty). The lesson also asserts round-start "143 registry rows".
- Current committed registry parse (my node parse of `git show HEAD:corpus/SOURCES.md`): **rows 144**, tiers `A:128, B:7, C:9`, status `mined:120, queued:15, rejected:9`; `node scripts/check-sources.mjs` → `verdict=clean rows=144 … findings=0`. A `census-end.txt` must therefore carry 144 / A:128 B:7 C:9 / mined:120 to satisfy D5 (`d5-rows`, `d5-tier`, `d5-status` all compare against the counter's own parse). A round-37-shaped receipt (143 / A:127 / mined:119) fails.
- Falsifier: create and commit the counts block; the lesson sentence is currently unbacked and D5 is unmet.

### F6 (C1, calibration) — the M3 (`surface-mismatch`) defect is not dispositioned; its red control does not exist

- `corpus/lessons/round-37.md:80-86` M3 still has no `Captured-by:` (M1 at `:69` and M2 at `:75` have it). Round-38's `## Mistakes` (`corpus/lessons/round-38.md:11`) carries **M1 `self-assessment-overclaim`** with `Captured-by: none at round 37` — not the M3 class, and the counter requires the literal `surface-mismatch` + `round-37|r37` within a captured-by row (`d4.capturedBy=false`).
- `.ufo/waves/round-38/baseline/m3-sentence-mutant.json` is absent (baseline dir empty): the byte-identity fix remains green-only with no mutated-sentence refusal receipt, exactly as routed defect 4 said.
- Falsifier: a round-38 Mistakes row naming round-37 M3/`surface-mismatch` with `Captured-by:`, plus a JSON receipt whose `exit` ∈ {1,2} or `refused/killed:true`.

### F7 (C1, calibration) — LOG's round-38 section carries no hash ledger and no freeze-landing attribution

- `LOG.md:2525` opens `## Round 38 — 2026-10-27 — …`; none of the six required round-37 commit hashes appear in the section, and the section explicitly defers them: *"Round-38 closure result and landed commit hashes will follow in the appended round-38 ledger."* The counter flags `d3-hash` ×6 and `d3-freeze-landing` (freeze entry landed at `34ed508c`, not `99437d29`).
- Falsifier: append the ledger naming all six hashes (`99437d29, f76da094, 34ed508c, 5a2ebb6a, f485cce1, bf8ecd5a`) and the `34ed508c` freeze landing; the counter resolves each with `cat-file -t` and `merge-base --is-ancestor`.

### F8 (C1, calibration) — the baseline constant disagrees between the frozen claims, the counter and the LOG

- `claims.json:5-6`: `"frozenAt": "98239d03…"`, `"baseline": "98239d03…"`.
- `.ufo/waves/round-38/counters/c1-routed-defects.mjs:52`: `const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'`.
- `LOG.md:2527` (round-38 section): *"Round-start baseline: `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`."*
- D6 requires the numstat receipt to name the counter's baseline (`d6-window`, counter lines 208-224). A receipt that honors the frozen claims' `baseline` fails D6; a receipt that honors D6 contradicts `claims.json:6`. Two of three documents agree with each other, the frozen contract does not.
- Falsifier: one stated baseline identical in all three places, or an explicit claims-side statement that `98239d0` is the instrument-candidate commit and `3f42a5c7` is the measurement baseline.

### F9 (verified-holds) — D2's corrected tally reproduces exactly; C2's receipt/SCORECARD targets land

- Tally: independent parse over the 34 committed seat reports (last `/VERDICT (ok|finding)/` per `report.md`) → **{ok: 23, finding: 11}**; the counter's own `d2.recomputed` is identical, and `d2.stated` now reads `{ok:23, finding:11}` from LOG. The spot-check's corrected figure is sound on committed bytes. (The round-37 report's original 18/16 figure is not in this repo — `.ufo/reports/round-37/tabi.md` does not exist in the lane — so that half rests on the spot-check text.)
- C2 target "capability row enters SCORECARD": `SCORECARD.md:2105` — *"Capability row: `playwright-firefox-loopback` … first-working round 38. Source: S144."* Present.
- C2 receipt fields on committed bytes: 2 runs, identical `firstShotSha256 3e0c070a…` (matches the note), `egressNonLoopback: 0`, `survivors: 0`, `binding: true`, `browserVersion: "157.0"`, per-run `errors: []`. Consistency holds at field level; runtime depth is other seats' surface.
- Instrument digests: all five `claims.json:frozenDigests` entries match worktree bytes (`209d86a0…`, `704da806…`, `6a14d8ca…`, `6d7a925b…`, `4cf3a849…`).
- Id-space: `S144` is the next free id; `S143`'s row note records the quarantine register's `S143/S144` as a separate namespace, so no duplicate-id defect.

### F10 (consistency, low) — the new knowledge note is not indexed in `corpus/README.md`

- `grep -c 'playwright-firefox-loopback-round-38' corpus/README.md` → 0, while the README carries a per-note index table (`corpus/README.md:13-20`) and the round-36 trend verdict credited expansion partly on indexing. The round-38 note is unindexed; SCORECARD's round-38 block also states no trend verdict (the capability row is its only coverage artifact). Cosmetic/coverage-witness gap, not a claim-term failure.

## Chronology (why two states appear in this note)

| Observed at | HEAD | C1 predicate | S144 row | Note/receipt committed | Lesson/LOG/SCORECARD round-38 |
|---|---|---|---|---|---|
| first pass | `a8e7d50` | false (14 findings) | absent from committed bytes | absent | absent |
| second pass (`2026-10-27T15:39Z`) | `3bc0b10` | false (12 findings) | present (`SOURCES.md:158`) | present | lesson/LOG/SCORECARD blocks added; D3/D4/D5/D6 terms still open |

## Out of scope / not claimed

- No execution of the C2 driver, no Playwright/Firefox run, no egress or survivor measurement (C2 runtime seats).
- No mutation battery, no adjacency counter execution (C1 counter seats).
- The round-37 fleet-repo report file was not read (not present in the lane repo).
- No installs/updates; no pacman; no git/jj writes. Scratch `/fast/scratch/hyaku/tabi-r38/Scribe54/` held one docs fetch and was removed.

## Bottom line for the canonical judge

1. **C2's source gate is now met at committed bytes** (`S144` row + Gate + note + receipt committed at `3bc0b10`; the located 14-word quote reproduces verbatim), **with one calibration gap**: no raw-fetch sha256/byte count anywhere, so the opened page state is unrecorded and the note's "patched … executable" sentence is a paraphrase stronger than the source.
2. **C1 is unverified and currently false**: the frozen counter exits 1 with 12 findings at `3bc0b10`. Two of those findings are prose-vs-bytes defects in the round's own correction artifacts — the SCORECARD correction calls an untracked `w1-results.json` "committed" (F4), and the lesson cites a `census-end.txt` that does not exist (F5).
3. **Contract-level defect**: `claims.json:6` baseline `98239d0…` vs counter/LOG baseline `3f42a5c7…` — D6 cannot be satisfied by a receipt that agrees with the frozen claims (F8).
