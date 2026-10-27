# W1-48 — Scribe48 — evidence note (focus #3: sources row / knowledge gate; lesson & mistakes; SCORECARD/LOG/report consistency)

- Seat: `Scribe48`, attack id `W1-48`, role scribe, milestone C1-C2, axes calibration + coverage.
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Frozen claim bytes: `.ufo/waves/round-38/claims.json` @ `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`.
- Observed HEAD during this inspection: `a8e7d50` at start, `3bc0b10` ("round-38: record Firefox capability and routed defects") before finish. Worktree clean except untracked `.ufo/waves/round-38/{w1,w1-spec.json,w1-dispatch.json,w1.ready,w1.ready.dispatched,w1/}` and the untracked round-37 `.ufo/waves/round-37/w1-results.json`.
- This note is **state evidence**, not verification credit: no claim leg is credited, no production file was written, no git/jj mutation, no install.
- Files written by this seat: this report only. Scratch used: `/fast/scratch/hyaku/tabi-r38/Scribe48/` (cleaned before yield).

## Method (exact commands, all read-only)

```
git rev-parse HEAD; git status --porcelain; git diff --stat
git show HEAD:corpus/SOURCES.md | grep -c '^| S'; git show HEAD:corpus/SOURCES.md | grep -c 'S144'
sed -n '158p' corpus/SOURCES.md   # S144 row; awk field split -> 11 columns
git ls-tree -r --name-only HEAD .ufo/waves/round-38/
node -e '<D2 replication over git show REV:.ufo/waves/round-37/w1/**>'
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c… --repo . --json   # exit 1
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev HEAD      --repo . --json   # exit 1
sha256sum .ufo/waves/round-38/counters/*.mjs scripts/playwright-firefox-loopback-round38.mjs
node -e '<receipt field dump>' ; grep -n on c1-routed-defects.mjs, the driver, SCORECARD.md, LOG.md, lessons/round-38.md
npm ls -g playwright --depth=0; ls ~/.cache/ms-playwright/
```

## Findings

### F1 — S144 registry row: committed, structurally sound, but absent at the frozen claim commit, and the knowledge-index gate is unmet
- `.ufo/waves/round-38/claims.json:29,40` ("citing opened S144"; kill rule "no cited newly opened source row").
- At `a8e7d50`: `git show a8e7d50:corpus/SOURCES.md | grep -c 'S144'` → `0`; rows `143`. At `3bc0b10`: `144` rows, `S144` present once.
- Working tree `corpus/SOURCES.md:158`: 11 columns, `S144 | Browsers — Playwright — https://playwright.dev/docs/browsers | docs | A | … | mined | 2026-10-27 | on-release | corpus/knowledge/playwright-firefox-loopback-round-38.md`; the `used-by` path exists at `3bc0b10` (`git ls-tree --name-only HEAD corpus/knowledge/ | grep round-38` → present).
- **Gap:** the round-38 knowledge note is *not* indexed in `corpus/README.md`. `grep -c 'round-38\|Round 38' corpus/README.md` → `0`, while every comparable note is indexed there (round 34 `:798`, round 35 `:824`, round 36 `:852`). Nothing in the frozen instruments checks this — the coverage index is a documentation-only surface, so no counter will ever fail on it.
- **Gap:** no frozen instrument derives the row's *newness*. `claims.json` C2's `countingCommand` is the driver; `scripts/playwright-firefox-loopback-round38.mjs` contains no reference to `S144`, `corpus/`, or the registry (`grep -n 'S144\|SOURCES\|sources\|corpus/'` → no hits). The lane already owns the pattern that would gate this (`scripts/check-bidi-runtime.mjs:48`, "entry in used-by, absent at --baseline, AND has a …"), but no r38 counter is bound to C2.
- **Falsifier:** if the S144 row were also present at the round-start baseline `3f42a5c7…`, the "newly opened" leg would be false; if `used-by` resolved to no committed file, the citation leg would be false. Neither is the case today. What *is* true today: the leg is prose-only, and the coverage index does not name the note.

### F2 — C1 frozen counter, evaluated read-only at both revs: 14 findings at the freeze, 12 at the integration commit
- `--rev a8e7d50` → exit 1, `predicate:false`, 14 findings: `d1-correction`, `d1-results`, `d2-stated`, 6×`d3-hash`, `d3-freeze-landing`, `d4-lesson`, `d4-receipt`, `d5-receipt`, `d6-file`.
- `--rev 3bc0b10` → exit 1, `predicate:false`, **12 findings**:
  ```
  d1-results            w1-results.json absent
  d3-hash  ×6           99437d29 f76da094 34ed508c 5a2ebb6a f485cce1 bf8ecd5a  present=false isCommit=true ancestor=true
  d3-freeze-landing     LOG round-38 section does not record the freeze entry landing at 34ed508c
  d4-m3                 no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)
  d4-receipt            m3-sentence-mutant.json absent
  d5-receipt            census-end.txt absent at REV
  d6-file               no numstat receipt under .ufo/waves/round-38/measure
  ```
- Cleared between the two revs: `d1-correction` (`SCORECARD.md:2102`) and `d2-stated` (`LOG.md:2531`, "seat tally 23 ok / 11 finding" → `d2.stated == d2.recomputed`).
- `d1` at `3bc0b10`: `{stale:true, corr:true, w2Absent:true, seats:34}`.
- **Falsifier for the claim's target** ("predicate true at measured REV; baseline control must fail"): any measurement commit that leaves any of the 12 findings above would make the C1 predicate false; the claim cannot be met while F3–F6 stand.

### F3 — C1's D1 hard dependency is an *untracked* round-37 artifact
- `c1-routed-defects.mjs:90` reads `.ufo/waves/round-37/w1-results.json` at REV. `git cat-file -e HEAD:.ufo/waves/round-37/w1-results.json` → `fatal: path '.ufo/waves/round-37/w1-results.json' exists on disk, but not in 'HEAD'`; `git status --porcelain` → `?? .ufo/waves/round-37/w1-results.json` (mtime `2026-10-27 11:41:52`).
- The on-disk file is well-shaped for the counter: `{lane,round,wave,seats:34,results:[34]}`; `seats === 34`, `results.length === 34`.
- **Consequence:** until that file is committed inside the round-38 window, `d1-results` fires at every committed REV and C1 cannot reach `predicate:true`. It also silently widens the D6 numstat window story (a round-37 artifact lands in the round-38 diff).
- **Falsifier:** a committed REV where `git cat-file -t <REV>:.ufo/waves/round-37/w1-results.json` == `blob` and `.seats == 34` removes this finding.

### F4 — D4 is unmet, and `corpus/lessons/round-38.md` cites a receipt that does not exist
- `corpus/lessons/round-38.md:9` `## Mistakes` holds exactly one row (`:11`), class `self-assessment-overclaim`, routed defect 1, "Captured-by: none at round 37". The token `surface-mismatch` appears nowhere in the file, so `d4-m3` is false — the round-37 routed defect 4 (M3 missing `Captured-by`) is *not* recorded as closed here.
- `.ufo/waves/round-38/baseline/` is empty and uncommitted: `git ls-tree -r --name-only HEAD .ufo/waves/round-38/` lists only `claims.json` + the four counters. So `d4-receipt` (`m3-sentence-mutant.json`, exit 1/2) is false: no mutated-sentence red control exists at HEAD. The round-37 spot-check's own demand ("M3's byte-identity fix is green-only — ship a red control next round") is therefore still open at `3bc0b10`.
- **Consistency defect inside the lesson:** `corpus/lessons/round-38.md:15` states "Round-end validation returned exit 0 and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt`". That path does not exist at `3bc0b10` (`measure/` absent). The lesson asserts a receipt it does not hold, and it is the same file D5 requires.
- **Falsifier:** a lesson row carrying `Captured-by:` + `surface-mismatch` + a round-37 reference, plus a committed `baseline/m3-sentence-mutant.json` with `exit ∈ {1,2}`, would clear D4. The lesson text would additionally need its census pointer to resolve.

### F5 — D5's exact parity numbers (precomputed so the receipt is checkable without re-running anything)
Counter's own parse of `corpus/SOURCES.md` at `3bc0b10` (same code as `c1-routed-defects.mjs:178-210`, `c[4]`/`c[8]`):

```
rows: 144
tier:   {A:128, B:7, C:9}            (sum 144)
status: {mined:120, queued:15, rejected:9}  (sum 144)
```

`census-end.txt` satisfies D5 only if it carries `rows: 144`, `tier: … A:128 … B:7 … C:9 …`, `status: … mined:120 … queued:15 … rejected:9 …` (the counter requires exact histogram equality, so extra keys are a mismatch too). The lesson's round-start figure (`:15`, "143 registry rows") is consistent with the pre-S144 registry; the delta 143 → 144 *is* the S144 row, which is the round-37 routed-defect-5 repair shape.
- **Falsifier:** any receipt whose histograms differ from the four numbers above (e.g. the validate-only output of round 37, which carried no counts) fails D5.

### F6 — D6 has no receipt at all, and the window endpoints are pinned by constant
`c1-routed-defects.mjs:52` fixes `BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35'` (also `LOG.md:2527`). D6 requires `.ufo/waves/round-38/measure/numstat-at-<hex>.txt` whose header names that baseline and REV; nothing exists under `measure/` at HEAD. Note the counter's D6 check is substring-level (`BASELINE.slice(0,12)` and `REV.slice(0,8)`), so a receipt that merely *mentions* the two revs in prose satisfies it — the window statement need not be a real `git diff --numstat` invocation line. That is a weak-but-honest gate; the stronger claim (appends-only) is not re-derived by D6.

### F7 — C2 receipt / knowledge / SCORECARD / LOG agree on every number the claim names — and the receipt is self-attesting
Cross-surface agreement (observed):
- receipt `corpus/evidence/round-38/playwright-firefox/receipt.json` (committed at `3bc0b10`): `runs.length == 2`; both `runs[*].firstShotSha256 == 3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`; top-level `firstShotSha256` is that same pair; `binding:true`; `egressNonLoopback:0`; `survivors:0`; per run `egress {samples:2, nonLoopback:0, lines:1}`, `firefoxPids` 3, `portClosed:true`, `errors:[]`, 11 cmds / 9 events.
- `corpus/knowledge/playwright-firefox-loopback-round-38.md:1,7` (source S144; same sha), `LOG.md:2529` (same sha, "0 non-loopback socket observations and 0 remaining Firefox PIDs"), `SCORECARD.md:2105` (capability row `playwright-firefox-loopback`, "Source: S144"). No number disagrees across the four surfaces.
- **Independence defect:** C2's `countingCommand` *is* the driver, and the gate fields are computed by the same script that produced the observations — `binding = new Set(firstShotSha256).size === 1` (`:163`), `egressNonLoopback = Σ runs.egress.nonLoopback` (`:164`), `survivors = Σ runs.survivors` (`:165`). No committed instrument consumes the receipt, so the claim's own kill-rule arms (differing hashes / non-loopback egress / survivor) are self-attested. The two other C2-facing frozen instruments are not bound to this capability: `c2-firefox-bidi-v4.mjs:2` declares "claim C2b (operability: survivor-term control of the round-37 frozen v3 BiDi-runtime counter)".
- **Shape defects in the receipt itself:** `firefoxVersion` is `null` — initialised `null` at `:157` and never assigned, so the 157.0 identity comes only from `browserVersion = probe.version()` (`:159`). `FIREFOX_BIN` (`:24`, hardcoded host path `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`) is **declared and never used**: both launches are `firefox.launch({ headless: true })` (`:73`, `:158`) with no `executablePath`, so the binary identity is resolved implicitly. `profile` (`:72`, `mkdtempSync`) is likewise created and never passed to launch.
- Non-vacuity check that *did* pass: the survivor grep targets `firefox-1555/firefox/firefox`, `~/.cache/ms-playwright/firefox-1555/firefox/firefox` exists, and both runs recorded `firefoxPids` (3), so the pattern matched live processes rather than silently returning empty. [Observed: cache path + receipt pids. Inferred: that those pids came from that path match.]
- **Falsifier for C2:** any of these would falsify the frozen predicate — differing per-run `firstShotSha256`, `egressNonLoopback > 0`, any surviving pid, or a knowledge note whose cited S144/sha does not match the receipt. None observed. The independent-gate weakness is a *calibration* observation, not a predicate failure.

### F8 — Three of the five frozen digests belong to no claim in `claims.json`
`claims.json` freezes five instruments, but declares two claims with two counting commands (`c1-routed-defects.mjs`, `scripts/playwright-firefox-loopback-round38.mjs`). The other three — `c1-adjacency-sweep-v6.mjs` (`:97` schema `tabi-r38-c1-adjacency-sweep-v6`), `c2-firefox-bidi-v4.mjs` (`:2` "claim C2b"), `c2-battery-mutants.mjs` — map to no claim, no counting command, no target and no kill rule. `axesAtRoundStart` gives adjacency 8 (lowest, explicitly unclaimed in `stagnationNudge`) and operability 9, and the two claims are calibration + coverage.
Digest integrity itself is clean — all five match the frozen pins byte-for-byte:
```
209d86a0…d57f7  c1-routed-defects.mjs
704da806…a890bb c1-adjacency-sweep-v6.mjs
6a14d8ca…47fecf c2-firefox-bidi-v4.mjs
6d7a925b…1e503c c2-battery-mutants.mjs
4cf3a849…02e75c1 scripts/playwright-firefox-loopback-round38.mjs
```
- **Consistency defect:** a reader of `frozenDigests` cannot distinguish "instrument bound to a claim" from "carried candidate". Nothing in SCORECARD/LOG says the three are unclaimed, so this round cannot show whether their amendments were exercised.
- **Minor ambiguity:** `claims.json` `frozenAt: 98239d03…` names the *frozen-instrument candidate* commit, not the commit that holds the claim bytes (`a8e7d50`). `LOG.md:2527-2528` disambiguates; `claims.json` alone does not.

## Consistency checks that passed (positive evidence)

- **P1 — D2's number is reproducible.** Independent replication of `c1-routed-defects.mjs:103-139` over the committed round-37 w1 blobs at `a8e7d50` (448 tree entries, 34 seat reports after the dir/`<name>.md` de-duplication) → `{"ok":23,"finding":11,"error":0,"none":0,"reports":34}`. This matches the round-37 spot-check's closing verdict ("23 ok / 11 finding") *and* the counter's `d2.recomputed` at `3bc0b10`. D2 is not a hand-copied constant.
- **P2 — D1's stale line survives as required.** `SCORECARD.md:2078` ("**68 seats** (w1 34 + w2 34") is still present; the correction at `:2102` is append-only and explicit. No silent rewrite.
- **P3 — d1 correction matches through its second alternative only.** `/34 seats/` does not match `:2102`'s "records 34 w1 seats"; `corr:true` comes from the `/w2.*(not dispatched|…)/` branch (`c1-routed-defects.mjs:85`). The leg passes today but is one rephrasing away from failure — a phrasing the ledger should not sit on.
- **P4 — Recorded tool state is consistent with the environment.** `npm ls -g playwright --depth=0` → `playwright@1.64.0` (matches `claims.json.toolInstalls` "npm global already present" and `receipt.playwrightVersion`); `~/.cache/ms-playwright/` contains `firefox-1555` (matches `browserVersion: "157.0"` claims). No install was performed by this seat.

## Not verified here (explicit limits)

- No claim leg is credited; F2 is a state evaluation of a frozen counter, not a round measurement at a declared REV.
- I did not run the C2 driver, `c2-firefox-bidi-v4.mjs`, `c2-battery-mutants.mjs` or `c1-adjacency-sweep-v6.mjs`; I did not evaluate the census gate (`scripts/sources-census.sh validate`) or `check-sources.mjs` (repository-level gates, other seats' surfaces).
- No observation about whether the live Firefox actually opened a non-loopback socket: egress rests on 2 samples/run with `lines ≤ 1`; "0 non-loopback" is what the sampler saw, nothing stronger.
- Whether `corpus/README.md` indexing is a hard gate is not established in the committed docs I read; I report it as convention-with-precedent (rounds 29–36), not as a counter requirement.

## Artifact paths

- Report (this file): `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-38/w1/Scribe48.md`
- Counter evaluation JSON (scratch, cleaned): `/fast/scratch/hyaku/tabi-r38/Scribe48/c1-at-freeze.json`, `c1-at-head.json`

## Note for the canonical judge

Two items are calibration-relevant beyond prose: (1) C1's predicate cannot be met at any committed REV while `.ufo/waves/round-37/w1-results.json` stays untracked (F3); (2) C2's kill-rule arms have no independent instrument — the receipt is produced and graded by the same script (F7). Everything else listed here is a documentation-consistency gap (F1 index, F4 lesson/captured-by + dangling census pointer, F8 unclaimed digests).
