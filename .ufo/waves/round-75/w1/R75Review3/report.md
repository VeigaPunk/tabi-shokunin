HOLDS

# R75Review3 — read-only conformance review of round 75 C1 (C1-DRAGINTERCEPT-R75)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; base `c19a520fdfa574a5c082b09130b7dbfcdd1e99eb`;
pre-freeze `d71951a78f5fa1a6672359c815e85a7f297bc8db`; freeze (claims) `b1ddabc5f3eda9fa4c780c41c51a574ae1edf4d8`;
digests commit D `57f28cf128e69dc40604f3201eab6a843c8e4142`; scored `8204c1762192d23529ebe1df5d7577e2d351f979`.
All six assigned items PASS. Nothing was written outside `.ufo/waves/round-75/w1/R75Review3/` (plus the trailer copy
`.ufo/waves/round-75/w1/R75Review3.md`). No git/jj mutation; read-only git only. Scratch
`/fast/scratch/hyaku/tabi-r75/R75Review3` deleted after copying the re-run receipts beside this report.

---

## 1. Ordering — PASS

```
$ git -C <lane> log --format='%H %ci %s' c19a520f..master -- .ufo/waves/round-75 scripts corpus SCORECARD.md
061b10d08b3e295dffdf5624e9422082bf7a99e8 2026-11-07 02:53:22 -0300 round-75: wave w1 spec and validated dispatch (11 seats)
8204c1762192d23529ebe1df5d7577e2d351f979 2026-11-07 02:53:08 -0300 round-75: scored run (leg a clean 146; leg c battery 254/254, kill power holds)
57f28cf128e69dc40604f3201eab6a843c8e4142 2026-11-07 02:47:44 -0300 round-75: digests commit D (freeze.txt) before the scored run
b1ddabc5f3eda9fa4c780c41c51a574ae1edf4d8 2026-11-07 02:47:32 -0300 round-75: FREEZE C1 claims (C1-DRAGINTERCEPT-R75) + prior-set enumeration at the freeze parent
d71951a78f5fa1a6672359c815e85a7f297bc8db 2026-11-07 02:46:49 -0300 round-75: pre-freeze — drag-intercept driver/counter/battery/kill power/selftest, 4 probes + 9 smokes + 3 degenerates, controls allOk, prefreeze 9/9, S196-S200, note, lesson draft
exit 0
```

Parentage is exact, not just timestamp order:

```
$ git rev-parse b1ddabc5f3eda9fa4c780c41c51a574ae1edf4d8^ → d71951a78f5fa1a6672359c815e85a7f297bc8db
$ git rev-parse 57f28cf128e69dc40604f3201eab6a843c8e4142^ → b1ddabc5f3eda9fa4c780c41c51a574ae1edf4d8
$ git rev-parse 8204c1762192d23529ebe1df5d7577e2d351f979^ → 57f28cf128e69dc40604f3201eab6a843c8e4142
```

Commit contents match the claimed roles: `b1ddabc` adds `claims.json` + `lesson-proof/prior-set-enumeration-{raw,toplevel}.txt`
(3 files); `57f28cf` adds **only** `freeze.txt` (1 file); `8204c17` adds the receipt + 13 scored artifacts.
The scored run is genuinely post-D: receipt `startedAt` `2026-11-07T05:47:54.409Z` (epoch 1794030474) vs D commit
epoch 1794030464 — 10 s after D. `claims.json` does not exist at the pre-freeze commit (added at `b1ddabc`), and its
digest is unchanged from `b1ddabc` to D (`b6b4183e…8f57` both).

## 2. Pins — PASS

Every file named in `freeze.txt` hashes to its recorded digest at the freeze parent, at `b1ddabc`, at D, at `master`
and in the worktree. Command (loop over the 7 recorded rows, `git show <c>:<f> | sha256sum`):

| recorded digest | file | d71951a | b1ddabc | D | master | worktree |
|---|---|---|---|---|---|---|
| d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 | scripts/chrome-cdp-dragdrop-round75.mjs | = | = | = | = | = |
| 9b370790a97193ff662678b38b957b5cdaab06267092931ab1719bbed31c9270 | scripts/check-dragdrop-r75.mjs | = | = | = | = | = |
| 9df82b2eab2adb733123a209b51b596a64d71f552298fe894b33accaac9f0721 | scripts/negatives-dragdrop-r75.mjs | = | = | = | = | = |
| c227da0042465488dc503f2f00381e156e226ee7d850994e1df32cd82833b68f | .ufo/waves/round-75/controls/c1/kill-power-r75.mjs | = | = | = | = | = |
| 4d85dfb212d008c3dc6fd873d3102c5ba20c1fa53e6fd65edbce7ed5afd90db7 | .ufo/waves/round-75/controls/c1/prior-set.txt | = | = | = | = | = |
| b6b4183e5e93c99704103e02ca17f0a26b889e70520c8f57cdcbdeb0db8e8f57 | .ufo/waves/round-75/claims.json | absent (added at b1ddabc) | = | = | = | = |
| 84ae7b486da5bd19c760d5eb9a91d2d615dce04eb5fdfffa92cf1149f43d29b2 | .ufo/waves/round-75/run-scored.sh | = | = | = | = | = |

`freeze.txt` itself is unchanged since D (`git show D:…/freeze.txt | sha256sum` = `sha256sum` worktree =
`4455c585e77fce22d79eada11d43885c576ebf4a4d527662a6564d449c5454e0`). The counter digest recorded in
`controls-summary.json` is the frozen one (`9b370790…9270`), and the driver digest in the receipt and in
`c1-a.args.txt` is the frozen one (`d604552e…8105`).

## 3. Nonce — PASS

Receipt nonce (`corpus/evidence/round75/chromium-drag-intercept/receipt.json:3`) = `tabi-r75-l1-57f28cf128e6`;
`nonceOnPage` (line 250), the page URL (line 1022) and the readiness expression (line 1029) carry the same string.

```
$ git -C <lane> grep -n 'tabi-r75-l1-57f28cf128e6' 57f28cf128e69dc40604f3201eab6a843c8e4142
(no output)  exit 1
```

The full nonce is absent from every file committed at or before D. The *prefix* `tabi-r75-l1-` is present at D only
as derivation code — `run-scored.sh:10-12` reads D from `scored/digests-commit.txt` and computes
`NA="tabi-r75-l1-${D:0:12}"`; `digests-commit.txt` is added by the **scored** commit, not at D, so the nonce could
not be known when D was written. `claims.json` and `build-spec.py:16` carry the same `<first 12 hex of D>` template.
Derivation is honest, not pre-planted.

## 4. QUALITY 140 (prior set) — PASS, with one documentation note

```
$ git -C <lane> grep -l '"schema": "tabi-chrome-cdp-dragdrop-r75"' d71951a78f5fa1a6672359c815e85a7f297bc8db -- '*.json'
25 files: the 16 PRE receipts + .ufo/waves/round-75/controls/c1/pf-smoke1..9.counter.json
```

Literal line-by-line comparison against `prior-set.txt` is therefore 25 vs 16. The 9 extras are **counter outputs**:
their top-level `schema` is `tabi-check-dragdrop-r75`; the receipt-schema string appears only inside their
`priorSet[]` records (`jq -r .schema` over all 25 at the freeze parent → 16 × `tabi-chrome-cdp-dragdrop-r75`,
9 × `tabi-check-dragdrop-r75`). Filtered to files whose top-level `.schema` is the receipt schema:

```
freeze parent d71951a : 16 files == prior-set.txt line for line (diff empty)
D 57f28cf             : 16 files, identical set
master (tip)          : the same 16 + corpus/evidence/round75/chromium-drag-intercept/receipt.json
```

No committed **receipt** of the schema lies outside PRE at the freeze parent or at D. At the tip exactly one new
receipt exists — the scored receipt the predicate requires after D. (`scored/c1-counter-a.json` also matches the raw
grep; it is a counter output, top-level schema `tabi-check-dragdrop-r75`, not a receipt.)
`claims.json` `priorSet` states both lists (25 raw → 16 top-level) and cites
`lesson-proof/prior-set-enumeration-raw.txt` and `-toplevel.txt`, both committed at `b1ddabc`. The counter's recorded
`priorSet` has 16 entries in exactly the `prior-set.txt` order (`diff` of the two lists empty), and every recorded
prior sha256 equals the file's sha256 at D and in the worktree (16/16 `D_OK WT_OK`).

## 5. Before → after — PASS

Before, re-run at base `c19a520f` from committed bytes:

```
$ git show c19a520f:SCORECARD.md | grep -c '^| `chromium-drag-intercept-linux` |'   → 0   (grep exit 1: zero matches)
$ git grep -lE 'dispatchDragEvent|setInterceptDrags' c19a520f -- corpus/knowledge | wc -l → 0
$ git cat-file -e c19a520f:corpus/evidence/round75/chromium-drag-intercept/receipt.json → exit 128 (path not in base)
```

Before, counter behaviour (pinned counter, re-run by this seat):

```
no receipt          → exit 2, verdict "unreadable", finding receipt-unreadable          (rerun-no-receipt.json)
r74 IME receipt     → exit 1, verdict "findings", ids include schema, nonce-shape, nonce-expected,
                      driver-pin, fixture-hash, drag-call-count, intercept-event, …     (rerun-r74-ime.json)
```

After, at the tip, the (a) counting command (exact frozen nonce, frozen driver digest, the 16 PRE priors in order):

```
$ node scripts/check-dragdrop-r75.mjs --receipt corpus/evidence/round75/chromium-drag-intercept/receipt.json \
    --expect-driver-sha256 d604552e…8105 --expect-nonce tabi-r75-l1-57f28cf128e6 <16 --prior> --json
exit 0; verdict clean; checkCount 146; priorSet 16; nonce tabi-r75-l1-57f28cf128e6   (rerun-counter-a.json)
$ sha256sum corpus/evidence/round75/chromium-drag-intercept/receipt.json
6ecc2560da70eb9285378d459a563c5617b07ce7ca813b7c328cd4aa572f1761   (= 6ecc2560…1761, unchanged since 8204c17)
```

`--list-checks` = 146. Counter timeline block on the scored receipt: absThreshold 0.5, gapThreshold 0.75,
tolerance 0.05 ms, gapMin 50, ownGaps 8, maxAbs 0, maxGap 0.25 — the constants at
`scripts/check-dragdrop-r75.mjs:175` (`TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75`).
Scored exits: driver 0, counter 0, battery 0, kill power 0; battery `allOk true` 254/254 with 3 laundered,
`coverageGap 0`, `stoppedEarly false`; kill power `holds true`, force-true 146/146, semantic 40/40, `crashed []`.

## 6. QUALITY 130/131/133/135/137/139 — PASS each

**130 PASS.** `run-scored.sh:21-29` records each exit with `echo $? > …exit` as the first command after the run (no
intervening expansion); the four scored exits agree with their own stdout verdicts: counter `verdict "clean"`/exit 0,
battery `allOk true`/exit 0, kill power `holds true`/exit 0. The counter's verdict and exit are computed from the same
value in one expression (`scripts/check-dragdrop-r75.mjs:317-318`: `verdict = findings.length === 0 ? 'clean' :
'findings'` … `findings.length === 0 ? 0 : 1`), and `usage`/`unreadable` hardcode 2 (lines 113-127), so agreement is
structural. The pre-freeze controls capture `p.status` directly (`controls-c1.mjs:88`), not a shell `$?` — the red
state is avoided.

**131 PASS.** `controls-c1.mjs:61-92`: every control names `expectExit` **and** `expectIds`; `ok` requires
`rc === expectExit` AND every expected id present AND (`exact` ⇒ the id set is equal). `controls-summary.json`:
12 controls + 3 degenerates, `allOk true`, e.g. `replay-zeroedit-smoke1` expectExit 1, expectIds
`[nonce-expected, replay-launch-token, replay-devtools-url, replay-event-timeline]`, ids identical. The evaluator is
shown able to fail: `lesson-proof/controls-first-pass-1e-12-expectation.json` `allOk false`, where
`replay-forged-1e-12` expected `[replay-event-timeline, event-time-quantum]` and got `[replay-event-timeline]`; the
rejection is kept (QUALITY 5) and the expectation was corrected before the freeze.

**133 PASS (note).** The three degenerate receipts carry their own label and a refuted hypothesis:
`native-mouse`, `no-intercept`, `script-events` → `.degenerate` = the name, `dragHypothesis REFUTED`,
`predicate false`. `controls-c1.mjs:94-98` requires `r.degenerate === k` independently of the driver exit, so a
mislabeled receipt fails the control (→ `allOk false` → exit 1). Note: the refusal carries no finding id
(`label-mismatch` is round-71's name) and no negative control feeds a mislabeled receipt to the evaluator; the
laundered battery cases (3) cover the relabel-into-honest path instead.

**135 PASS.** `prefreeze-summary.json`: 9 rows (smoke1..9), each `driverExit 0`, counter `0/clean/146`,
battery exit 0 with `passed == cases == 254` and `laundered 3`, kill power exit 0 with `holds true`, `crashed []`;
`ok 9`, `allOk true`, `checkCount 146`. The relative-mutation battery cases (`replay-timeline-sub-quantum`,
`replay-timeline-whole-shift-1ms`, `replay-timeline-whole-shift-100ms`) exit 1 `ok=true` on the scored receipt and
are inside the 254/254 on every repetition receipt.

**137 PASS.** `prefreeze-summary.mjs:18-32` enumerates the expected set (receipts 1..9) and every `row.ok` conjunct
requires a present, parsable output: counter exit 0 + verdict clean + checkCount == 146; battery exit 0 + a `failed`
array + `passed == cases` + `laundered == 3`; kill power exit 0 + `holds true` + a `crashed` array. A missing or
unparsable file yields `null` and fails the row (e.g. `Array.isArray(null)` is false), so absence is red, never
"not reported"; `process.exit(allOk ? 0 : 1)`. The committed summary is `allOk true` 9/9.

**139 PASS.** `timeline-honest-pairs.json`: 13 honest receipts, 156 ordered pairs, `honestPairsRefused 0`,
`tolerance 0.05`, `absThreshold 0.5`, `gapThreshold 0.75`, `firstChosenGapThreshold 0.5`,
`refusedAtFirstChosenGapThreshold 0`, `maxAbs 0`, `maxGap 0.25`, `minAlignedMaxDiffMs 17.600000023841858`,
`minOwnGaps 8`, `ownGapCounts` all 8, `gapMatchHistogramEighths {0:120, 1:32, 2:4}`. The 0.05 ms tolerance sits far
below the measured minimum honest max-difference (17.6 ms) and refuses 0/156; the gap threshold was raised
0.5 → 0.75 only after the measurement, with 0 refused at the first chosen threshold. Carried rules: the counter is
clean 146 on all 9 honest receipts, so no carried rule refuses an honest receipt; the one carried-rule defect found
(the 1e-12 id expectation) was in a control expectation, not in the counter, and is kept as evidence.

---

## Findings (all LOW; none falsifies a frozen rule or any leg)

**F1 — `prior-set.txt`'s own header is not reproducible by the command it cites.** The frozen header (digest
`4d85dfb…0db7`) says the set was enumerated by `grep -rl --include='*.json' '"schema": …'` and "re-checked with
git grep at the freeze parent"; that literal command returns 25 files at `d71951a`, not 16. The correct account
(25 raw → 16 top-level receipts) is in `claims.json.priorSet` and `lesson-proof/prior-set-enumeration-{raw,toplevel}.txt`,
and the lesson is recorded in the uncommitted QUALITY 141 and the `corpus/lessons/round-75.md` row. No effect on PRE
or on any leg; the frozen bytes simply under-describe their own derivation.

**F2 — QUALITY 133's refusal is unnamed and unexercised** (see item 6): the check exists by construction at
`controls-c1.mjs:97` but has no finding id and no negative control.

**F3 — QUALITY 130's per-control verdict is not committed**: `controls-summary.json` rows carry
name/why/expectExit/expectIds/exact/exit/ids/ok and no verdict, so exit↔verdict agreement is structural in the
counter and verified for the scored receipts, but not independently evidenced per control.

**F4 — host-guard deviation in the scored run**: `run-scored.sh:28` defaults `--jobs "${JOBS:-8}"`, above the
dispatch's ≤6 guidance, and `c1-kill-power-a.json` records `jobs: null`, so the scored job count is not evidenced.
No effect on the predicate.

## Residual risk and verification gaps

- **Leg (d) is open at the tip**: `grep -c '^| \`chromium-drag-intercept-linux\` |' SCORECARD.md` = 0 (grep exit 1).
  The note exists at `corpus/knowledge/chromium-drag-intercept-runtime-round-75.md` (unchanged since D, sha256
  `9ea3a600…0ab7`) and cites S196-S200 (lines 1, 16, 21, 25, 33, 40, 42); `corpus/SOURCES.md` at D has all five
  rows. Predicate (d) requires the row 0→1, so C1 is not yet verified by its own kill rule. This matches
  `scored/status-at-dispatch.txt` (legs b and d open at dispatch); it is not a conformance failure of the frozen
  rules, but the capability claim is incomplete.
- **Leg (b)** (R75Exec1's cold run) is outside this seat.
- The counter's prior loader records each prior's top-level `.schema` but does not require it to be the receipt
  schema (`check-dragdrop-r75.mjs:124-131`); a non-receipt prior is inert (no events ⇒ no replay match), so it cannot
  produce a false clean, but it also cannot be refused.
- The worktree is dirty in 4 documentation files (`SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`,
  `corpus/lessons/round-75.md`); the diff shows only appended rows 141-142 and lesson rows — frozen rows 130-140 are
  unchanged, and no C1 instrument or receipt is modified.
- I did not re-run the driver (leg (a) is run-once; `run-scored.sh:15` refuses a second run), the battery, or kill
  power. Those legs are checked against the committed scored outputs and the pre-freeze summary, plus a fresh counter
  re-run on the committed receipt. No LSP server applies to this JSON/JS review.

## Receipts beside this report

- `rerun-counter-a.json` — this seat's re-run of the (a) counting command at the tip (exit 0, clean, 146, 16 priors).
- `rerun-no-receipt.json` — counter with no receipt (exit 2, `unreadable`, `receipt-unreadable`).
- `rerun-r74-ime.json` — the r74 IME receipt under the r75 counter (exit 1, `findings`, the claimed ids present).
