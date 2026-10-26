# MutC1 — mutation attack on C1's frozen counter `scripts/check-bidi-runtime.mjs`

## Verdict

I applied 20 single-point mutants to the frozen counter's behavior-bearing points inside my isolated scratch clone (`$HYAKU_SCRATCH/tabi-r32/MutC1/clone`, detached at the frozen claims commit `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`, counter sha256 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` = `frozenDigests`) and ran the counter's own `--selftest` (27 cases) on pristine, each mutant, and restored bytes. Pristine baseline: `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27`, exit 0 (confirmed under both node v24.21.0 and v26.12.0). Result: **11 of 20 mutants killed** (10 by a named selftest case, 1 by an uncaught `TypeError` crash on case `unknown-row`) and **9 survived 27/27**. The lane checkout was never edited; the mutant copies were untracked scratch files, removed after runs; the pristine counter's before/after sha256 is identical, and the clone's tracked tree is clean (`git status --porcelain` empty). Findings only — nothing repaired.

The 9 survivors are **coverage findings against the selftest suite, not the contract**: each is a weakening the frozen 27-case suite cannot detect, and each names below the missing case that would kill it. Highest severity: M11 (driver `driverSha256` equality unenforced by any case — only `driver-absent`/`driver-is-the-counter` are tested) and M06 (`ok()` accepting error frames — the suite's only error case targets a command whose predicate independently revalidates the result).

## Setup (commands and exit codes)

```
export HYAKU_SCRATCH=/fast/scratch/hyaku
S=$HYAKU_SCRATCH/tabi-r32/MutC1
mkdir -p "$S/tmp" "$S/out"                                          # ok
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # ok
git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
# HEAD=4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6  toplevel=$S/clone
sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"
# 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  (= claims.json frozenDigests)

cd "$S/clone"
TMPDIR=$S/tmp/base node scripts/check-bidi-runtime.mjs --selftest   # exit=0  (0.79s, node v24.21.0)
TMPDIR=$S/tmp/base node scripts/check-bidi-runtime.mjs --selftest --json   # exit=0, cases=27 passed=27
```

Mutants were made as copies `scripts/mut01.mjs` … `mut20.mjs` (one single-point `edit` each; full diffs in `mutants.patch` in the output dir), each run as:

```
TMPDIR=$S/tmp/<MID> node scripts/<MID-file> --selftest --json   # 4-way parallel, every exit captured
```

Verdict rule: killed = any selftest case FAIL / exit ≠ 0 / crash; survived = `cases=27 passed=27`, exit 0. No `--live` leg and no browser was ever started (`--selftest` injects `liveRunner`; chromedriver/chromium versions checked at setup only: both 154.0.8037.97).

## Results

| Mutant | Line (pristine) | Single-point change | Expected killer | Actual failing case (observed mutant output) | Verdict |
|---|---|---|---|---|---|
| M01 | 550 | drop between-runs screenshot equality (`new Set(shots).size !== 1`) | `run-screenshots-differ` | `run-screenshots-differ`: exit 0, admitted 1 (expected 1/0) | **killed** |
| M02 | 553 | drop vs-live screenshot equality (`firstShot(liveRec) !== shots[0]`) | `live-screenshot-differs` | `live-screenshot-differs`: exit 0, admitted 1 (expected 1/0) | **killed** |
| M03 | 554 | drop vs-live chromedriverVersion equality | `live-chromedriver-differs` | `live-chromedriver-differs`: exit 0, admitted 1 (expected 1/0) | **killed** |
| M04 | 551 | drop between-runs chromedriverVersion equality (presence only) | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M05 | 529 | drop `runs.length < 2` from t1 | `one-run-only` | `one-run-only`: exit 0, admitted 16 (expected 1/0) | **killed** |
| M06 | 177 | `ok()` accepts any response (`type === "success"` dropped) | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M07 | 186 | `navBase` accepts any http host (loopback clause dropped) | `off-loopback-navigate` | `off-loopback-navigate`: exit 0, admitted 1 (expected 1/0) | **killed** |
| M08 | 251 | drop R8 `c.i > first` post-click ordering | `readout-before-action` | `readout-before-action`: exit 0, admitted 1 (expected 1/0) | **killed** |
| M09 | 257 | drop R9 `c.i > first` post-typing ordering | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M10 | 292 | drop R14 `c.i > tr.i` post-traverse ordering | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M11 | 528 | drop driver `sha256(d) !== driverSha256` (presence only) | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M12 | 564 | accept R16 (x2 branch disabled) | `stop-loading-marked` | `stop-loading-marked`: exit 1, reason `t2-run` (expected `x2-no-counterpart`) | **killed** |
| M13 | 514 | drop `!regThen.has(id)` from s1 | `old-source-row` | `old-source-row`: exit 0, admitted 16 (expected 1/0) | **killed** |
| M14 | 219 | R1 browserVersion compared by major only | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M15 | 534 | drop transcript `sha256(tb) !== transcriptSha256` | `transcript-tampered` | `transcript-tampered`: exit 0, admitted 16 (expected 1/0) | **killed** |
| M16 | 526 | drop `fixtureSha256 !== FIXTURE_SHA256` | `fixture-sha-differs` | `fixture-sha-differs`: exit 0, admitted 16 (expected 1/0) | **killed** |
| M17 | 220 | R1 webSocketUrl regex loosened to `/^ws:\/\//` (any host) | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M18 | 236 | drop R4 PNG width/height equality (any decodable PNG) | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M19 | 508 | population filter accepts any non-empty Measured cell | — | 27/27 PASS, exit 0 | **SURVIVED** |
| M20 | 563 | disable `x1-row-unknown` branch | `unknown-row` | case `unknown-row` (ids R18): uncaught `TypeError: PREDICATES[id] is not a function` at line 569, node exits 1 with stack, no selftest verdict | **killed (crash)** |

Runtime controls: pristine selftest re-run under the harness's node (`mise` v26.12.0): exit 0, 27/27 (`base-selftest-node26.json`); killed M08 re-run under shell node v24.21.0: exit 3, `readout-before-action ... FAIL`, `verdict=failed cases=27 passed=26` (`M08-node24.txt`). Classification is runtime-independent.

## Survivor defects (coverage findings; the killing case each lacks)

1. **M11 — driver digest unenforced by the suite. Severity: high.** t1's `sha256(d) !== receiptObj.driverSha256` arm has no case: the suite only tests `driver-absent` and `driver-is-the-counter`, never a present blob with a wrong recorded digest. A receipt whose `driverSha256` does not match the committed driver bytes admits. Killing case (missing): like `fixture-sha-differs` but on the driver — `build: () => ({ driverSha: "0".repeat(64) })`; pristine expects t1-receipt, exit 1, admitted 0; the mutant returns exit 0, admitted 16.
2. **M06 — error frames accepted as successes. Severity: high.** The only error case, `error-response-not-success`, fires on `browsingContext.getTree`, whose predicate re-checks `res(c).contexts` — so an error frame with a payload-carrying `result` still fails it and the `ok()` gate itself is never the thing under test. Killing case (missing): transcript whose `browsingContext.getTree` recv frame is `{id, type:"error", error:"unknown command", message:"x", result:{contexts:[{context:"C1", url:"about:blank"}]}}` with ids `["R2"]`; pristine: t2-run, exit 1; mutant: R2 admitted, exit 0.
3. **M04 — cross-run chromedriverVersion equality unenforced. Severity: medium.** No case supplies two runs with different `chrome.chromedriverVersion` (`live-chromedriver-differs` varies only the live side). Two committed runs from different driver builds bind as one evidence stream. Killing case (missing): run2 built with `goldenLines({ driverVersion: "155.0.0.0 (other)" })`; pristine expects t3-binding, exit 1; mutant admits 16, exit 0.
4. **M18 — R4 viewport-pin unenforced for well-formed PNGs. Severity: medium.** `screenshot-wrong-size` supplies non-PNG bytes, which `pngSize` already rejects; the dimension equality itself is never exercised. Killing case (missing): captureScreenshot result data = base64 of a valid 100x100 PNG (correct magic, wrong IHDR dims); pristine t2-run; mutant admits R4.
5. **M17 — loopback-only webSocketUrl unenforced. Severity: medium.** No case ships a non-loopback `webSocketUrl`; the lane's loopback-only contract has no R1 detector in the suite. Killing case (missing): transcript `webSocketUrl: "ws://10.0.0.1:9515/session/X"`, ids `["R1"]`; pristine t2-run ("webSocketUrl not a loopback ws url"); mutant admits.
6. **M09 — R9 timing/ordering unenforced. Severity: medium-low.** `readout-before-action` only reorders R8's readout; the typing surface's post-action read is untested. Killing case (missing): like `readout-before-action` but moving the `document.getElementById('t').value` evaluate before the key `input.performActions`, ids `["R9"]`; pristine t2-run; mutant admits.
7. **M10 — R14 timing/ordering unenforced. Severity: medium-low.** No case reorders the `location.pathname` read relative to `traverseHistory`. Killing case (missing): move the `location.pathname` evaluate before the `traverseHistory` (or before the `/b.html` navigate), ids `["R14"]`; pristine t2-run; mutant admits.
8. **M14 — browserVersion binding major-only. Severity: low-medium.** `browser-version-mismatch` uses "1.0" vs "154.0.8037.97" (different majors), so a same-major forgery is invisible. Killing case (missing): transcript `browserVersion: "154.9.9"` against receipt `browserVersion: "154.0.8037.97"`, ids `["R1"]`; pristine t2-run; mutant admits.
9. **M19 — Measured-cell filter admits mislabeled rows. Severity: low-medium.** No case writes a row with Measured ≠ `yes`; the real round entry will mark R16 `no`, so the mutant inflates population/failing (false-failure direction, cannot inflate admissions, but corrupts the counted fields C1's predicate reads). Killing case (missing): entry = `ALL_OK` rows plus an R16 row with Measured `no`; pristine exit 0, population 16, admitted 16; mutant exit 1, population 17, failing 1.

M20 note: killed, but not gracefully — the mutant converts an unknown row id into an uncaught `TypeError` (production CLI would die with a stack instead of reporting `x1-row-unknown`); the suite detects it only because the process aborts. The x1 branch has no case asserting the graceful reason path beyond this (it does: `unknown-row` asserts `x1-row-unknown`, so the graceful path is covered in pristine).

## Restoration evidence

- Before: `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  …/clone/scripts/check-bidi-runtime.mjs` (`before.sha`).
- After all runs: same digest (`after.sha`) — the original counter file was never an edit target; only `mutNN.mjs` copies were.
- `git -C "$S/clone" status --porcelain` before cleanup: only `?? scripts/mut01.mjs` … `?? scripts/mut20.mjs`; after `rm -f scripts/mut*.mjs`: empty. HEAD `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` throughout; no commits made anywhere; lane checkout untouched.
- Receipts copied to `.ufo/waves/round-32/w1/MutC1/` before scratch deletion: `base-selftest.txt/.json`, `base-selftest-node26.json`, `M01–M20.selftest.json/.err`, `M08-node24.txt`, `harness-runs.json` (per-run exit codes and durations), `mutants.patch` (all 20 single-point diffs), `before.sha`, `after.sha`.
- Scratch deleted: `rm -rf -- "$S"` → `scratch_removed=YES`; nothing left under `$HYAKU_SCRATCH/tabi-r32/MutC1`.

## Process hygiene

`pgrep -fa 'chromedriver|chromium'` after work: **no lines owned by MutC1** — this seat spawned no chromedriver/chromium (the selftest never launches a browser). Observed lines belong to a sibling seat's tree (`--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/tmp/…`) and an `earlyoom` daemon whose `--prefer` regex merely contains the word `chromium`.

No tools were installed or upgraded (operator authorization noted, none needed: node/git/chromium/chromedriver all present).
