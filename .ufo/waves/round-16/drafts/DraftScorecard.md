## Round 16 — hyaku, 2026-10-20

DRAFT by scribe DraftScorecard; every `PENDING` marker is resolved by L1 after integration and final checks.

Baseline `e38d2599a922cb729186353830fff8e159b4fef0` (clean, per PLAN). Measured revision: PENDING (L1 integration revision; both counters measure at it). C1 works operability8, a lowest non-retired tie (depth/operability/freshness/adjacency at 8); no stagnation waiver. C2 works coverage9 plus the new capability `webmcp-cdp-observation`. Two claims, causally separable: C1 reads only binding gate and receipts; C2 reads only WebMCP note, evidence and source rows. No exploratory claim; no source-row inflation called expansion.

| Axis | Scalar before → after | Round16 verdict / evidence |
|---|---|---|
| depth | 8→PENDING | PENDING; expected unchanged, precision of held contracts only |
| coverage | 9→PENDING | PENDING; C2 native WebMCP held entry 0→1 if WebmcpHarness receipt passes its cases |
| operability | 8→PENDING | PENDING; C1 enforced measurement-binding contract 0→1 if the gate, selftest and legacy receipt verify at measured revision |
| freshness | 8→PENDING | PENDING; expected unchanged unless a primary Chromium/spec source is re-opened with access date 2026-10-20 |
| calibration | 9→PENDING | PENDING; expected unchanged |
| adjacency | 8→PENDING | PENDING; loopback browser evidence and own-lane counters only, external domains remain refused |

| Claim | Before → after | Counting command | Measured revision / counter digest / evidence |
|---|---|---|---|
| C1 operability | enforced measurement-binding contracts 0→1 | `node .ufo/waves/round-16/measure.mjs REV --claim C1` | baseline→PENDING; counter digest PENDING (sha256 of `.ufo/waves/round-16/measure.mjs` blob at measured revision, recorded in `corpus/evidence/round-16/measurement-binding.json`); evidence `corpus/evidence/round-16/binding/selftest.json`, `corpus/evidence/round-16/binding/legacy-r15.json`; closes round-15 routed defects 1 and 2 (counter pinned only by revision; report measured at `b7cf044` not delivered HEAD) |
| C2 coverage | native-WebMCP held entries 0→1 | `node .ufo/waves/round-16/measure.mjs REV --claim C2` | baseline→PENDING; counter digest PENDING (sha256 of `scripts/webmcp-loopback-round16.mjs` blob at measured revision); evidence `corpus/evidence/round-16/webmcp/receipt.json`, `corpus/evidence/round-16/webmcp/runtime-pin.json`, `corpus/evidence/round-16/webmcp/protocol-domain.json`; knowledge `corpus/knowledge/webmcp-chromium-loopback-round-16.md` PENDING |

New counter-digest column: round 15's C1 row carried no digest, so its counter was pinned by revision only. Round 16 records the counter blob digest for each claim, so the column closes routed defect 1. PENDING: confirm the column is filled for both rows at the measured revision.

Measurement receipts: `corpus/evidence/round-16/measurement-binding.json` PENDING; `--check` exit PENDING; `--self-test` last line `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=PENDING reasons=PENDING` PENDING.

WebMCP receipt (`tabi-round16-webmcp-v1`): runtime Chromium 154.0.8037.97 (`/usr/bin/chromium`), Playwright 1.64.0, Node v24.21.0, summary cases PENDING / passed PENDING / failed PENDING. Flags: `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting`. Observed-versus-spec divergence and limits: PENDING.

Sources29→PENDING (A23/B4/C2 start; end PENDING). Start census as reported by PLAN, not re-observed by this scribe: exit0, rows29, A23/B4/C2, mined24/queued3/rejected2. Planned row changes: S020 WebMCP spec re-open (queued→mined only if it backs the note); S002 CDP viewer re-open with WebMCP-domain used-by add; new rows only for primary Chromium source or docs actually opened this round, with rejections kept with reason and flip. End census PENDING. Histogram command `node .ufo/waves/round-16/measure.mjs REV --histogram` PENDING.

Round15's outside agreement remains external; round16 outside agreement PENDING and no lane-dispatched seat is a non-author verifier.

Trends: expansion PENDING; quality PENDING; discernment PENDING. Trend verdicts are self-assessment, not author-side certification.

### Planned / capabilities / saturation / retired — round16

- planned: operability — measurement-identity binding gate closing round-15 routed defects 1 and 2 (PENDING outcome); coverage — native WebMCP loopback observation as the held entry (PENDING outcome).
- capabilities: draft row for `webmcp-cdp-observation`, first-working16 PENDING; evidence `corpus/evidence/round-16/webmcp/receipt.json`; limits: loopback only, `document.modelContext` (not `navigator.modelContext`), no real site, no agent integration claim. Enters only if the flag-off negative control and declarative-form positive case both pass. Chromium 152 is no longer the target version; the probed build is 154.0.8037.97.
- saturation8/window3. Pre-entry position is 3 (round13 capability, round14 position1, round15 position2, round16 position3). A capability entering resets the window, so with `webmcp-cdp-observation` held the round16 position is 1: PENDING L1 confirmation. No axis retired, no hidden waiver, all scalar deltas PENDING.
