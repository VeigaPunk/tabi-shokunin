author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# tabi — round 48 verifier spot-check (non-author closure)

Closed at 2026-11-01T13:04Z against lane head `31d7df44b7b917cde61c134b6545f3a52dbdb7a1`
(base `8ccf0a82087d`). I did not author this round; everything below is my own re-derivation
over committed bytes. Verdict: **all three claims verify; no axis harmed; round admitted.**

## 1. Step-1 conformance

| Check | Result |
|---|---|
| Report committed by lane identity | PASS — `git log --format='%an <%ae> %H' -1 -- .ufo/reports/round-48/tabi.md` → `tabi-shokunin <tabi@shokunin.local> 5e6510f4` (fleet 2026-11-01T04:04:23-08:00, one second after the `complete tabi round=48` watchdog line 04:04:22 — report landed last) |
| `SHONEN` heading | PASS — `## SHONEN` with 4 `[~]` lines, each with a resolvable pointer; no `[x]` written by the lane or by this closure |
| Cited commits exist + ancestry | PASS — all six (`f4288c0e`, `04dfee64`, `710c7143`, `f623ce5d`, `9fe7cc08`, `31d7df44`) are `merge-base --is-ancestor` of `refs/heads/master` |
| Round work in `8ccf0a8..31d7df44` | PASS — the range contains exactly those six commits, all authored `tabi-shokunin`; the LOG correction `31d7df44` is append-only (+13 lines, names its superseded text) |
| Branch tip pushed | PASS — `git ls-remote origin refs/heads/master` = local `refs/heads/master` = `31d7df44b7b9…` |
| Marker rule | PASS — real report: work performed, evidence pointers, landed changes tied to LOG, commit-hash citations; not a marker |
| Scratch hygiene | PASS — `scratch/tabi-r48` deleted at round close (verified absent); my own closure scratch is separate and removed after closure |
| Dispatch digest | matches watchdog lines 152/187: `2026-11-01T01:26:20-08:00 launch tabi round=48 base=8ccf0a82087d (zcode run14)`; `2026-11-01T04:04:22-08:00 complete tabi round=48 head=31d7df44b7b9 pushed=True` |

Conformance defects: none. Note (status-neutral): the round ran L1-inline while the
`tabi | round-44` L2-floor L0 stays open and routed around — same disposition the two prior
closures recorded; still the operator's to answer.

## 2. Per-claim re-check

C1/C2 rest on lane-owned instruments; per the gate standard I verified their **committed
evidence** (receipts, frozen verdicts, measured revisions — I did not execute the lane's gate
or meter) and re-derived the byte-level facts myself. C3 I verified the same way **and**
re-ran the committed runner live (below). C2 is additionally the re-declaration the r47
closure sanctioned; the prediction discipline is the load-bearing repair and is re-derived
from committed bytes end-to-end.

### C1 — adjacency (the r47-closure-owed ledger re-bind) — VERIFIED

- My own count over committed bytes at `04dfee64`:
  `git show 04dfee64:corpus/adjacency-host-audit-r48.tsv | awk 'NR>1' | wc -l` → **16**;
  histogram `unchanged 10 / sibling-absent 6` — matches the report exactly.
- Delta ledger: `12 lane rows + 16 line rows` (my awk on column 1), same shape as r47's 12+16.
- Dispositions carried: `diff` of sorted (disposition, quote) pairs
  r47@8ccf0a8 vs r48@04dfee64 line rows → **empty** → 0 new adjudications, whole-line carry
  confirmed byte-for-byte.
- Committed receipts: red control at freeze `f4288c0e`
  (`.ufo/waves/round-48/controls/c1-meter-red-at-round-open.json`) pins `rev 524910a9` and
  reads `predicate=false, findingCount 15` (9 head + 3 sha + 3 lines mismatches); green at
  `f623ce5d` (`.ufo/waves/round-48/measure/c1-meter-green-at-data.json`) pins
  `rev 04dfee64`, `predicate=true, findingCount 0`, counts {roster:16, mapRows:16,
  auditRows:16, deltaLanes:12}. Selftest receipt `c1-meter-v8-selftest.json` allPass=true.
  Retarget diff committed (`controls/v7-v8-retarget.diff`).

### C2 — operability (the r47-refused claim re-declared) — VERIFIED, prediction discipline intact

The core verification, all from committed bytes:

1. **Pin committed before data.** `claims.json` at freeze `f4288c0e` (11:13:55Z) carries
   `frozenPredicate` pinning the gate bytes `sha256 19bcd7d95b13…03b53d` and naming the
   prediction receipt; the data commit `710c7143` is 11:20:09Z — the pin precedes the data.
2. **Landed blob == pin.** `git show 710c7143:scripts/check-adjacency.mjs | sha256sum` →
   `19bcd7d95b13438c347923610a4f2a64ee912b2b89aa7bc0884f7034ff03b53d` — equal to the pin.
3. **Prediction (pre-data)** `.ufo/waves/round-48/measure/c2-gate-prediction-at-freeze.json`
   (committed at freeze): rows=16, **verified=10**, findings **exactly 6 × sibling_unresolved**.
4. **Data-time run** `.ufo/waves/round-48/measure/c2-gate-green-at-data.json` (committed at
   `f623ce5d`, `at 710c7143`): rows=16, **verified=10**, findings **exactly 6 ×
   sibling_unresolved**; my programmatic compare of the two receipts (all fields modulo the
   `at`/`tips` revision fields) → **equal**. The prediction held to the byte.
5. **Controls**: before at inherited bytes (verified=5; findings 6 sibling_unresolved +
   4 ruling_unresolved + 3 quote_too_long — the r47 honest verdict reproduced); without-flag
   (verified=7, 6+4) — the `--fleet-repo` flag is load-bearing, the repair is venue
   resolution, not relaxation.
6. **Self-test** receipt: `ADJACENCY_SELFTEST verdict=clean cases=64 reasons=18
   could_not_evaluate=6` — 57 prior + 7 new, including `fleet-repo-wrong-dir-fails-closed`
   and `long-substring-quote-still-fails` (the repairs fail closed; substring cap retained).

### C3 — coverage capability `webview2-cdp-loopback-windows` — VERIFIED, live re-run GREEN

- Evidence files: `git ls-tree -r --name-only 8ccf0a8 -- corpus/evidence/round48/webview2-cdp
  | wc -l` → **0**; at `f623ce5d` → **2** (receipt.json + receipt.png).
- Receipt vs committed bytes: receipt records PNG 8,063 B sha `dcd754c6…`; my own hash of the
  committed blob `git show f623ce5d:corpus/evidence/round48/webview2-cdp/receipt.png |
  sha256sum` → `dcd754c6f0e07c74613ba91a570e7e7cfb35c968b9f799529b928e681b8bce5b`, size 8,063 —
  match; PNG magic verified. Receipt pins driver sha `074490f3…` / host sha `13b2bc3d…`.
- Counter receipts (committed): green at data (predicate=true, 0 findings), post-freeze repro
  (predicate=true, 0 findings, **distinct fresh nonce** `b3b8752d…`, valid PNG 8,010 B), r44
  cross-refusal (predicate=false, **18 findings**), selftest allPass=true cases=6 pass=6.
- Standalone probes bundle: 7 launcher variants across the four committed probe files — every
  variant `port: null`, none alive after probe; the standalone route is honestly refuted.
- **LIVE RE-RUN (this closure, strongest check): executed.** I extracted the committed bytes
  (`git show 31d7df44:scripts/…` → sha `074490f3…` / `13b2bc3d…`, equal to the receipt's
  pins), compiled the C# 5 host with the in-box `csc.exe` (status 0), and ran the committed
  runner with a throwaway profile under my own scratch. Result: **exit 0, ok=true,
  `Edg/156.0.4314.50` at `/json/version`, fresh nonce `tabi-r48-26bd66ec1b8b7262` read back
  over the CDP WebSocket (`invocationBound: true`), `Page.captureScreenshot` 7,340 B,
  `postKillSweepCount: 0`** — and my own post-run sweep found 0 token-bearing
  msedgewebview2 processes. The capability reproduces from committed bytes alone with a
  fail-closed teardown (40 s host auto-close backstop + token-keyed taskkill sweep).

## 3. Per-axis verdicts

| Axis | Verdict | Ground |
|---|---|---|
| adjacency | improved | C1 verified (red 15 → green 0; ledgers re-bound at one snapshot; dispositions carried by exact match; score row held 8→8 with the re-bind as the axis-move) |
| operability | improved | C2 verified (venue repair + whole-line quotes fail closed; prediction == data-time run; selftest 57→64; score 9→9) |
| coverage | improved | C3 verified (third Chromium-class surface; live re-run green from committed bytes by this closure; capability row first-working 48; score 9→9) |
| depth | unchanged | not worked this round; no harm observed (SKILL.md untouched, reported honestly) |
| freshness | unchanged | not worked; S152–S157 rechecks correctly ruled out as not due (2027-01-29) |
| calibration | unchanged | not worked as a claim; the round's honest dead-end reading and self-caught E12 are discernment-positive but no calibration claim was declared |

No axis harmed. All three declared claims verify → **admitted**.

## 4. Discernment spot-check (outside, non-author)

Sampled from `corpus/lessons/round-48.md` `## Gate`: two admits re-opened live, one reject
re-opened from committed bytes, plus the second reject's artifact.

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S158 (WebView2 VS Code debugging docs) | ADMIT | Live re-fetch of the URL: 65,545 B (`wc -c`), sha `2bfc5c98…` equal to the staged copy's claim; quote "Make sure that your application is started after the environment variable is set" — 23 words, 1 hit in the fetched bytes; `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS` present on the page | **agree** | The row is exactly what the page teaches; the env-var route it documents is the route the capability demonstrably used (my live run used it) |
| S159 (WebView2 SDK `WebView2.h` COM ABI header) | ADMIT | Staged header at tip: sha `4e477637…` matches the lesson/row claim (2,951,155 B); quote "ICoreWebView2Controller : public IUnknown" — 4 words, exactly 1 hit, directly under `MIDL_INTERFACE("4d00c0d1-9434-4eb6-8078-8697a560334f")` (my grep: header line 39227, quote line 39228) | **agree** | The ABI the host declares is transcribed from this header; anchor verified to the line; the compiled host ran live, which is the strongest confirmation the ABI transcription is right |
| Launching msedgewebview2.exe standalone as a surface | REJECT | Committed probes bundle (7 variants): every variant `port: null`, none alive after probe, exit 0, no CDP endpoint | **agree** | The rejection is the honest reading of the lane's own evidence — the runtime is hosted, not standalone; the capability was built on the documented host route instead |
| First C3 repro attempt's artifact (cp overwrote repro PNG with receipt JSON) | REJECT | Committed replacement pair `c3-repro-postfreeze-receipt.{json,png}`: JSON parses, PNG magic valid, distinct fresh nonce, counter green | **agree** | Producer slip caught pre-commit, both files deleted and re-run fresh; nothing false was committed — rejecting the corrupted artifact was correct |

SOURCES row re-open: S158 and S159 rows read at tip (`corpus/SOURCES.md:172-173`) — both are
proper Registry-table rows (the E12 placement mistake was fixed before landing), tiers A with
scoped rationale, ≤25-word located quotes (23 and 4 words), status mined, used-by set, recheck
90d. `bash scripts/sources-census.sh validate --root <fleet root> tabi` → **exit 0**,
`tabi ok` (W04 duplicate-URL warning set unchanged at 22 — pre-existing rows, none new).

Trend re-derivation: registry `grep -cE` 157 (baseline) → **159** (tip); knowledge
`git ls-tree | wc -l` 64 → **65**; the new note carries the provenance trio first; PROVINCE
gains the third declared surface line. expansion **improved** agrees. quality: the r47 debt
closed in committed bytes with red/green receipts; no admitted entry failed a re-check —
**improved** agrees. discernment: all five predicates were measured pre-data (C2's after-state
exists as a sha-pinned prediction receipt, not a post-hoc number); the standalone dead end was
read against the lane's own hope; D1 corrected by a named append-only erratum; the round's own
census caught its own SOURCES misplacement and disclosed the failing intermediate receipt —
**improved** agrees.

## 5. Routed items for next round (status-neutral; none bars admission)

1. **Document absolute `--scratch`/`--out` for the webview2 runner.** In my first live
   attempt I passed a *relative* `--scratch`; WebView2 resolved the relative
   `WEBVIEW2_USER_DATA_FOLDER` against the host exe's directory (profile landed under
   `<scratch>/<scratch>/…`) while the runner polled the relative path, so discovery timed out.
   With an absolute scratch (as the lane's own receipts show) it is green. One sentence in the
   knowledge note's `recheck:` line / runner usage ("pass absolute paths") closes this foot-gun.
2. **The four SHONEN `[~]` boxes look fully checkable by a non-author** (the round itself says
   so): box 2's end-to-end task is the one this closure live-re-ran; box 1/3 pointers resolve;
   box 4's PROVINCE update is in the diff. Left to the operator per the r46/r47 closure notes —
   only a non-author `[x]` counts, and this file is that non-author record if the operator
   chooses to act on it.
3. `tabi | round-44` L2-floor L0 remains open — routed around three rounds running; needs an
   operator answer, not another routing.

## 6. Verdict summary

- C1 adjacency **VERIFIED** (evidence-verified receipts + my own ledger counts)
- C2 operability **VERIFIED** (prediction discipline re-derived from committed bytes:
  pin-before-data, landed blob == pin, data-time run == prediction, controls and selftest)
- C3 coverage **VERIFIED** (evidence-verified receipts + **live re-run green from committed
  bytes** with fresh nonce and sweep 0)
- Trends: expansion improved / quality improved / discernment improved — all agree
- **Round 48 admitted; no axis harmed; no conformance defects.**
