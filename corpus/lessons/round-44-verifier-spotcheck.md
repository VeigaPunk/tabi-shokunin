author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# Round 44 — tabi — non-author verifier spot-check (closure)

Closure judge: hyaku closure, fresh zcode subagent session, non-author (did not author round 44;
dispatched by the campaign orchestrator, not the lane). Lane HEAD closed:
`63444fe8d192acdee70480811408a0879612b936` (local == origin master at closure). Baseline
`5c3f4cca86e9d0c548d41e21524525c5095652d5`. All git work index-free (`rev-parse`, `cat-file`,
`ls-tree`, `diff-tree`, `merge-base --is-ancestor`, `ls-remote`); no mutating git anywhere.

## 1. Step-1 conformance — PASS (defects below are status-neutral)

| Check | Command (abridged) | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an <%ae> %H %ci' -1 -- .ufo/reports/round-44/tabi.md` | `tabi-shokunin <tabi@shokunin.local> 2e14124bc42cee3672aec11cc2cbd0822122264c 2026-10-31 20:40:10 -0700` | PASS |
| SHONEN heading in committed report | `git cat-file -p HEAD:.ufo/reports/round-44/tabi.md \| grep -c '^## SHONEN'` | `1`; four `[~]` lines, no `[x]` | PASS |
| Cited lane commits exist + are ancestors of master | `git merge-base --is-ancestor <h> refs/heads/master` for `5c3f4cca…`, `d3d31472…`, `8c238799…`, `844a5b3a…`, `63444fe8…` | all five: ancestor-ok | PASS |
| Branch tip pushed | `git rev-parse refs/heads/master` vs `git ls-remote origin refs/heads/master` | both `63444fe8d192acdee70480811408a0879612b936` | PASS |
| Round work reachable in 5c3f4cca..63444fe8 | `git diff-tree -r --name-only 5c3f4cca… 63444fe8…` | 67 files incl. runner, counter trio, evidence pair, claims.json, note, lesson, SOURCES/README, SCORECARD, PROVINCE, LOG | PASS |
| Dispatch/complete evidence | watchdog log lines 4 and 40 | `2026-10-31T18:57:57-07:00 launch tabi round=44 base=5c3f4cca86e9 (zcode run14)` / `2026-10-31T20:40:10-07:00 complete tabi round=44 head=63444fe8d192 pushed=True` — matches the orchestrator digest and the report-commit timestamp | PASS |
| Real report, not a marker | committed report content | work performed, evidence pointers, landed-changes table with hashes, per-claim measurements, Sources & frontier, trend verdicts, SHONEN — substance present | PASS |
| SHONEN.md box marks | `git cat-file -p 63444fe8…:SHONEN.md \| grep -E '^-\['` | four `- [~]`, `grep -c '^- \[x\]'` = 0 — no non-author `[x]` written by anyone | PASS |

## 2. Freeze-amendment discipline (d3d31472 → 8c238799) — VERIFIED PRE-DATA

- Commit chain is linear and ordered: `d3d31472` (freeze, 03:08:03Z) → `8c238799` (amendment,
  03:17:51Z) → `844a5b3a` (measured claims / after-receipts, 03:21:33Z) → `63444fe8`
  (integration, 03:36:25Z). The amendment and its disclosure (`claims.json` gains the
  `freezeAmendment` key; commit message; lesson; report) all precede the after-receipts commit.
- Instrument blob history proves no post-measurement edit: runner
  `557a059b→08ba2732` and C2 counter `6435f13d→2797bf57` changed ONLY at the amendment and are
  byte-identical at `8c238799`, `844a5b3a`, `63444fe8`; C1 checker (`86328e9a`) and C3
  supervisor (`0107e038`) never changed; `claims.json` (`f9d7448f→a38b24ee`) changed only at
  the amendment. The counter diff is exactly the runner-digest pin at three sites — "gained no
  clause" is accurate; no predicate loosened.
- The failed first attempt is retained as declared: `measure/c2-live-run-stdout.json` records
  `"ok":false` (its own counter's `chromeTerminated` clause refused it); it never entered
  `corpus/evidence/`.

## 3. Per-claim re-check

### C2 (coverage capability `chrome-cdp-loopback-windows`) — RE-MEASURED LIVE (strongest re-derivation)

Safety review of the committed runner before re-running: fixture HTTP server binds
`127.0.0.1:0` only; Chrome launched `--headless=new` with a throwaway `--user-data-dir` under
the `--scratch` dir passed by the invoker; DevTools endpoint regex-verified `127.0.0.1:<port>`;
the only navigated URL is the loopback fixture; teardown is fail-closed (target close → SIGKILL
→ `taskkill /T /F` tree fallback → exit-event wait → server close). Writes only to the
`--out`/`--shot`/`--scratch` paths. Safe. Re-run performed with committed bytes extracted from
git (`git cat-file -p 63444fe8…:<path>`), not working-tree files:

- Extracted runner sha256 = `9b2855f09e4b72f1e3250089c2e3d3341fd98b50bf2ea86291953e3a97c6f655`
  = the frozen pin. Committed screenshot sha256 = `4ee1806fc2ddc0d86255c6e5fe7323e3df53cde15e3d00a40fa1cb75bf98d9db`
  = the committed receipt's `screenshotSha256`; PNG magic `89 50 4e 47 0d 0a 1a 0a` present; 7,908 B.
- `node counter.mjs committed-receipt.json --shot committed-screenshot.png --runner runner.mjs`
  → exit 0, `"predicate": true, "findingCount": 0` on the committed bytes.
- LIVE re-run: `node runner.mjs --out rerun-receipt.json --shot rerun-screenshot.png --scratch <closure scratch>/cdp-run`
  → **exit 0**, `ok:true`, `Chrome/156.0.8078.74`, fresh socket `wsHost 127.0.0.1:56616`
  (committed run: 51901), fresh receipt nonce `f3284fb77818a969e8e251fe0a0f7c85b27cf471c64576dd05e6292f0f3bb135`
  (committed: `96316efa…`), fresh fixture nonce `b7da1d448fe20f2404907c9e8b7ce77fc7ebacf5863baff0e407b94603690c83`
  (committed: `138796f4…`), `domNonce == fixtureNonce` (`invocationBound: true`),
  `chromeTerminated: true` (`childExit.sig SIGKILL` observed), screenshot **byte-identical** to
  the committed PNG (`4ee1806f…`, 7,908 B), no stray chrome.exe process afterwards, profile
  directory under the passed scratch only.
- The capability therefore re-derives from committed bytes alone on this host, with fresh
  nonces every invocation — the declared Chrome-ness re-derivation path, executed by a
  non-author. Kill rule not fired; receipt/screenshot are explicit blobs at the measured
  revision (`ls-tree -r -l`: `receipt.json` 1,968 B blob `7f40f6b9`, `screenshot.png` 7,908 B
  blob `73246099`); capabilities row present in SCORECARD with first-working 44.

### C1 (calibration, routed defect 3) — EVIDENCE-VERIFIED (committed receipts + frozen bytes)

- Frozen digests re-hashed from committed blobs: checker `12405cc1…`, fixture builder
  `f8db0ebd…`, gen-selfauth-record `d790edaa…`, selfauth fixture `5796dd2d…` — all match
  `claims.json.frozenDigests` (one stale entry found; defect D1 below).
- Checker source pins the r43 freeze blob `f3036d9eddad68da5ef2899b6b0da8737cc5f40e`
  (`CLAIMS_BLOB_PIN`) and implements exactly the claimed r5 clauses: `typeof b?.path !==
  'string'` → `r5-binding-path-type`; binding-set completeness → `r5-binding-set-missing`;
  `lines.includes(b.quote)` → `r5-binding-quote-not-whole-line` (whole-line semantics).
- Fixture-built receipts record deterministic revs matching the report: none `0bee79ee453b…`,
  drop3 `1648e0cf7b14…`, fragment `eff28d05dcdc…`, pathtype `7c558d5e2eae…` (all built from
  source rev `5c3f4cca…`, 55 files each).
- Committed run receipts: r43 bytes on drop3/fragment → 0 findings (FALSE GREEN, as reported);
  v2 on drop3 → `r5-binding-set-missing` (+ `r5-claims-blob-pin-mismatch`, expected on a
  rebuilt freeze); v2 on fragment → `r5-binding-quote-not-whole-line`; v2 on pathtype →
  `r5-binding-path-type`; honest fixture → 0 findings both checkers; honest lane state at
  freeze2 → 0 findings; `--selftest` receipt `allPass: true, cases: 8`. All match the report.

### C3 (operability, routed defects 1–2 deterministic halves) — EVIDENCE-VERIFIED

- Supervisor source pins the anchor PEM
  `MCowBQYDK2VwAyEAEYYWsPtD35E9SEtw/PHWjdChqehBYLLP4MiLZiC3Lm0=` and SPKI sha256
  `868c0d898fcc28194c275c32aa1e7d6f3280e4d34fb91d3ea55f62478f0caefd`; the pin check
  (`anchor-pin-mismatch`) is emitted BEFORE any signature verification — the anchor is no
  longer selected by the candidate record.
- Committed receipts at freeze2 `8c238799`: honest → predicate true, 0 findings; failedrun →
  predicate false, 48 findings = `anchor-pin-mismatch` + `measure-signature-invalid` + 46 ×
  `egress-count-without-remotes` (matches the report's "46 ×"); selfauth fixture → predicate
  false, exactly {`anchor-pin-mismatch`, `measure-signature-invalid`}; the SAME fixture under
  `--mutation anchor-self-select` → predicate true (the deterministic r43 kill-class reach,
  reproduced browser-free); `--selftest` → `allPass: true, cases: 9`. All match the report.
- Declared residual honestly carried: the fully-zeroed lying-driver class stays unbindable
  over committed bytes (declared pre-data in the residual model, not claimed closed).

### Plain before→after counts — RE-MEASURED, all match

| Count | Command (abridged) | Before | After |
|---|---|---|---|
| knowledge notes | `git ls-tree -r --name-only <rev> corpus/knowledge \| grep -c '\.md$'` | 60 | 61 |
| registry rows | `git cat-file -p <rev>:corpus/SOURCES.md \| grep -c '^| S[0-9]'` | 151 | 153 |
| evidence tree round44 | `git ls-tree -r --name-only <rev> corpus/evidence/round44 \| wc -l` | 0 | 2 |

SCORECARD diff `5c3f4cca..63444fe8` is a pure append: round-44 block (C1/C2/C3 met), the
capability row, trend table, planned/saturation — no prior axis row touched, no scalar moved,
adjacency untouched at 8. No owned axis harmed. LOG round-44 entry and PROVINCE dated
host-surface correction landed as reported (absent surfaces recorded with date + probe pointer
`controls/host-probe.txt` — protocol work, not a failure). New knowledge note carries the
provenance trio (`source:` S152/S153/S001/S002, `verified-at:` with both sha256s, `recheck:`
90d with concrete commands). L0 question filed (`tabi | round-44 | MISSION.md L2 floor…`,
append-only line 231, routed around, never treated as answered). `considerthese/` absent.

## 4. Discernment spot-check (non-author; sample ≥1 admit + ≥1 reject, ≥1 new SOURCES row)

| Item | Decision (lane) | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| Capability demonstration (C2 live run + counter + repro) | ADMIT | Independent live re-run of the committed runner + counter over committed bytes (this closure, fresh throwaway profile) | **agree** | Re-executed end-to-end by a non-author: exit 0, fresh nonces, invocation-bound DOM nonce, `chromeTerminated true`, byte-identical screenshot. The admit rests on a demonstration that reproduces from committed bytes alone. |
| First live C2 attempt | REJECT | `.ufo/waves/round-44/measure/c2-live-run-stdout.json` (committed): `"ok":false`, ws `127.0.0.1:52204` | **agree** | The round's own counter clause refused its producer's run (`chromeTerminated false` — teardown-detection race); the failure was retained as evidence instead of being smoothed into the evidence tree, and the repair was disclosed as a pre-data freeze amendment. Correct call under the frozen kill rule. |
| S152 — Chrome Headless mode docs | ADMIT (new row) | Staged copy `.ufo/waves/round-44/sources/headless-docs.html`: sha256 `be71bfe0ece5e3089c037e1eb372ad9146282300e9ef6aed239235c2b8715aad`, 111,098 B — matches row + lesson; quote "Chrome now has unified Headless and headful modes." = 8 words, 1 hit in the raw bytes | **agree** | Row is a claim honored: raw-fetched, digest-pinned, ≤25-word located quote verbatim in the committed bytes, tier A appropriate for official docs, mined (used-by the new note). |
| S153 — CDP browser_protocol.json | ADMIT (new row) | Staged copy `.ufo/waves/round-44/sources/browser_protocol.json`: sha256 `f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2`, 1,421,620 B — matches; quote "Capture page screenshot." located, 1 hit | **agree** | Same discipline; the quote grounds the Page.captureScreenshot contract the runner actually exercises. |

Spot-check verdict: agree 4/4 (one admit + one reject on gate decisions; both new SOURCES rows).
`bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi` at closure → **exit 0**,
`tabi ok`, the same 21 pre-existing W04 duplicate-URL warnings the round disclosed; committed
`census-end.exit` = 0 and `check-sources-end.txt` = `SOURCES_GATE verdict=clean rows=153
findings=0` corroborated.

## 5. Per-axis verdicts (closure)

| Axis | Verdict | Evidence |
|---|---|---|
| calibration | improved | C1 verified (evidence-verified; live re-run discipline not required for an instrument claim): the r43 routed defect 3 is closed in committed bytes with red-before controls that false-green/crash the old bytes and named findings on the new bytes; selftest 8/8; score held 9→9 (no rubric), axis observable moved. |
| coverage | improved | C2 verified AND re-measured live by this non-author (fresh nonces, invocation-bound, fail-closed teardown); capability row entered (first-working 44); sourced note on ground the coverage map did not hold, citing mined rows S152/S153. |
| operability | improved | C3 verified (evidence-verified): pinned-anchor supervisor refuses failedrun/selfauth classes with named findings, greens only the honest pair, mutation reach reproduced, selftest 9/9; declared residual honestly carried. |
| depth | unchanged | No depth claim declared; no depth surface touched. |
| freshness | unchanged | No freshness claim declared; PROVINCE host-surface correction is protocol work (absent surfaces recorded with date), recorded, not scored. |
| adjacency | unchanged | Lowest-axis obligation waived by the active stagnation nudge (no capability rounds 39–43); returns to the obligation at round 45 now that a capability entered at 44. Not harmed. |

Trend verdicts (closure): **expansion improved** (capability admitted to SCORECARD — the
LEARNING.md expansion observable; new note on uncovered ground citing mined rows; registry
151→153; notes 60→61); **quality improved** (r43 routed defects 1–3 closed in committed bytes
each with a red-before demonstration; the round's instruments caught two producer defects
pre-data; check-sources clean at tip; no admitted entry failed a re-check — corroborated by
this closure); **discernment improved** (LEARNING.md's improved condition — "the spot-check
agrees with the gate on admits and rejects" — is met by this outside non-author spot-check,
agree 4/4 with reasons on record; the lane's own `unchanged` was graded pending this check and
the outside check now exists and agrees).

## 6. Routed defects the lane must fix next round (all status-neutral)

- **D1 — stale instrument pin in `claims.json.frozenDigests`.** The entry for
  `.ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs` pins the PRE-amendment digest
  `d994ab716df4cb97ab007f7f955b000df1091265e77993e7f06331de4b3feb72`; the committed bytes at
  `8c238799`/tip hash to `f796ae84085087b6acde10a7d32787e95589f3202386f33bce7d8dfaaf101cc5`.
  The amendment re-pinned the runner at all sites but not its own counter's entry. No predicate
  is loosened (the receipt binds the runner digest, not the counter's); fix by recording the
  corrected digest old→new in the round-45 lesson and, if the freeze file is touched, under the
  same amendment discipline.
- **D2 — revision-wording drift in the report.** The honest-state C1/C3 receipts are measured
  at freeze2 `8c238799` (`rev` field in `c1-v2-honest-at-freeze2.json`, `c3-*-at-freeze2.json`)
  while the report's C1/C3 lines say "at `844a5b3a`". The read-set of both instruments is
  identical between the two revs (`844a5b3a` only adds round-44 evidence/measures), so no
  verdict changes; name the measured rev precisely next round.
- **D3 — unreceipted before-state limb (C1).** The r43-checker "uncaught TypeError crash" on
  the pathtype fixture has no committed receipt (a crashed process writes no JSON); the frozen
  CLAIM concerns v2 behavior, which is receipted. Where a before-state limb is a crash, commit
  the captured stderr tail as the receipt.
- **D4 — prompt fidelity (operator-side).** The dispatched `.ufo/prompts/tabi-round-44.md` does
  not embed the L2 minimum verbatim (≥8 lanes in one batched AgentSwarm call); it binds
  MISSION.md as SSOT (§1) and §3 allows read-only subagents. The lane routed around it honestly
  (L0 filed, claims carry no wave-settled clause, disclosure in report). Routed to the
  operator/protocol lane for the round-prompt template; not lane debt.
- **Notes (no action):** `claims.json` verdict fields remain `pending`/`null` at tip — the
  verdicts are recorded in SCORECARD/LOG/lesson instead; acceptable freeze discipline.
- **SHONEN flag for the operator (duty 6, no `[x]` written):** box 2 (end-to-end domain task
  executed and logged) and box 3 (instructions executable without oral context) now look
  checkable by a non-author — the live CDP run is committed, logged in LOG.md, and was
  independently re-executed by this closure from committed bytes alone. Box 1 and box 4 remain
  reviewer-work. Per protocol only a named non-author verifier may write `[x]`; this closure
  records the flag and writes nothing into SHONEN.md.

## 7. Closure disposition

All three declared claims verify under their frozen predicates at the measured revision
(`844a5b3a`, instruments frozen since the pre-data amendment `8c238799`); no axis harmed; no
scalar moved; a capability row entered the table. C2 was re-measured live by this closure;
C1 and C3 were evidence-verified against committed receipts whose values match the report.
Conformance defects: none barring admission; D1–D4 above are routed, status-neutral.

**Closure verdict: tabi round 44 — status ok, admitted.**
