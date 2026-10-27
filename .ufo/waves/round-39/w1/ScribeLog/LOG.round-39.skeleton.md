# LOG.md round-39 entry — DRAFT SKELETON (milestone: draft)

> **Status: draft, pre-disposition.** Written 2026-10-27 by seat `ScribeLog` while the v2 wave is
> still in flight. Every `OWED:` marker is an unmeasured field. Nothing here is a disposition, a
> score move, or a wave result: no counter was run against a clean clone at a final integration
> REV, no wave tally is complete, and no axis score is assigned. The two candidate mistakes below
> are *observations with commands*, not adjudicated findings.
>
> Intended landing: appended to lane `LOG.md` at integration, append-only, after the round-38
> entry. Do not land this file as-is.

## Round 39 — 2026-10-27 — session-bound Playwright Firefox egress (coverage, capability) and round-38 routed residuals (calibration)

### Freeze entry (before any claim data)

Claims frozen at instrument-binding commit `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`;
round-start baseline `5bc56a81d196caeb8d24551928b883802697aabb`. Claim file
`.ufo/waves/round-39/claims.json`, sha256 `ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6`
(worktree = `HEAD`).

Frozen instruments, digests re-derived at `HEAD` on 2026-10-27 (all three equal
`claims.frozenDigests`):

| Path | sha256 | vs claims |
|---|---|---|
| `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` | `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e` | equal |
| `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` | `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c` | equal |
| `scripts/playwright-firefox-egress-round39.mjs` | `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc` | equal |

Round-start axes (frozen): adjacency 8, operability 9, depth 9, coverage 9, freshness 9,
calibration 9. `lowestAxis` = adjacency. The frozen stagnation note waives the lowest-axis
obligation for this round and makes it a frontier/capability move: C1 is a capability
acquisition on coverage (session-bound Playwright Firefox egress), C2 is instrument repair on
calibration (round-38 routed residuals 1–2).

### Claim surfaces (verbatim scope, not results)

- **C1 · coverage · capability-acquisition** — Playwright 1.64.0 + Firefox 157.0 via Juggler
  against the loopback fixture, observed by `scripts/playwright-firefox-egress-round39.mjs`.
  Predicate requires: schema v2; two unrefused runs; identical first-shot sha256; per-run owned
  tree nonempty and rooted at a child of the driver node process; ≥8 socket samples per run over
  ≥1000 ms; zero non-loopback socket observations on **both** `ss` and `/proc` including the
  post-close final sweep; zero survivors; fixture port closed; Firefox version bound from the
  live session; and the round-38 v1 receipt refused by this counter.
- **C2 · calibration · instrument-repair** — `c2-routed-defects-v2.mjs` over
  `.ufo/waves/round-39/baseline/c2-sentence-mutant.json` and
  `.ufo/waves/round-39/measure/{census-end.txt,numstat-at-<REV>.txt}`. Predicate spans D1–D7;
  its predicate sentence is 709 bytes, sha256
  `b535dd0cbb94cd86ea040fc98cfbcc4555b2585808c1bc479aa2a86f4cac448f`, and is **byte-identical**
  to `PREDICATE_SENTENCE` in the frozen counter (re-derived by direct comparison, 2026-10-27).
- Note for the record: C2's D6 window names baseline `3f42a5c7cc19…` (round-38's baseline), not
  this round's `5bc56a81…`. That is consistent with C2 repairing a round-38 missing receipt
  (window spans round-38 baseline → REV); recorded because the two baselines appear in one frozen
  artefact.

### Observed source (S145)

`Source: proc_pid_net(5) — Linux man-pages`, `https://man7.org/linux/man-pages/man5/proc_pid_net.5.html`,
accessed 2026-10-27, anchor `DESCRIPTION, /proc/net/tcp`, located quote (11 words):
“rem_address” is the remote address and port number pair (if connected).
Recorded at `.ufo/waves/round-39/assimilation/S145-open.txt`. Cited by
`corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`.
Discrepancy recorded without adjudication: the frozen C1 `source` field calls S145 "proc(5) man
page", while the opened page and the knowledge entry are `proc_pid_net(5)`; and S145 is **not**
in `corpus/SOURCES.md` (`grep -c S145 corpus/SOURCES.md` → `0`; registry rows still `144`).
→ `OWED:` the S145 row, its tier, and any registered-source reconciliation.

### Before-measurement (at baseline `5bc56a81…`)

- `.ufo/waves/round-39/measure/c1-before.txt` — `receipt-absent corpus/evidence/round-39/playwright-egress/receipt.json`;
  `predicate=not-met findings=1 controlRefused=true`.
- `.ufo/waves/round-39/measure/c2-before.txt` — `d4-receipt m3-sentence-mutant.json absent`,
  `d6-file no numstat receipt under .ufo/waves/round-38/measure`;
  `predicate=not-met findings=2 seats=34 tally=23/11 census=144`.
- `.ufo/waves/round-39/measure/census-start-counts.txt` — `rows=144`, tier A 128 / B 7 / C 9,
  status mined 120 / queued 15 / rejected 9, measured at the round-start baseline.

### Pre-integration measurement at `d3232d5` (not the disposition REV)

`.ufo/waves/round-39/measure/pre-integration-counters.txt` (exit codes recorded in the file):

- **C1** `predicate=met findings=0`, `C1_EXIT=0`. Receipt fields: schema v2, 2 runs, binding
  true, versionBound true, refused false; control (round-38 v1) refused for five reasons
  (schema mismatch, no owned pid tree ×2, sampleCount undefined < 8 ×2).
- **C2** `predicate=not-met`, `C2_EXIT=1`; D1 stale-line present + superseding correction + seats
  34 + w2 absent true; D2 stated 23 ok / 11 finding == recomputed 23/11/0/0 over 34 reports; D3
  six round-37 hashes present, ancestors, freeze landing stated (34ed508c); D4 mutant exit 1,
  sentence differs, sha pair, refused true; D7 `sentenceMatch=true`; findings `d5-receipt`
  (`census-end.txt absent at REV`) and `d6-file` (`numstat-at-d3232d56.txt absent at REV`).

### C1 receipt as observed (recording fields, not a verdict)

`corpus/evidence/round-39/playwright-egress/receipt.json`, sha256
`e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`, landed by
`690b050` ("round-39: control receipts and session-bound egress receipt"). Recorded values:
Playwright `1.64.0`; Firefox `157.0` (live user-agent `…rv:157.0…`); binary
`~/.cache/ms-playwright/firefox-1555/firefox/firefox`; fixture sha256 `fe5564b6…`, 1261 bytes;
run1 9 samples / `coverageMs` 1560 / port 34321; run2 8 samples / `coverageMs` 1461 / port 39777;
both runs `firstShotSha256` `ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0`
(25382 bytes), 5 owned PIDs under node pid 2430191, `sockets.ss.observations` 6 /
`proc.observations` 6 / `nonLoopback` 0 on both surfaces plus final sweep, `survivors` 0,
`portClosed` true.
Known limits are already stated by the knowledge entry (TCP tables only; no UDP/QUIC/unix
sockets; namespace-local `/proc`; single tree snapshot; session profile not bound).
→ `OWED:` independent disposition of whether this receipt satisfies the frozen predicate at the
integration REV (the frozen counter's own run in a clean clone).

### Owed at draft time (must be filled before this entry lands)

- `OWED:` clean-clone runs of both frozen counters at the disposition REV, with `--repo <clone>`.
- `OWED:` `.ufo/waves/round-39/measure/census-end.txt` (counts parseable as `rows=`, `tiers: …`,
  `status: …`) and `.ufo/waves/round-39/measure/numstat-at-<REV>.txt` committed **at** REV; see
  M2 for why the second is not automatically attainable.
- `OWED:` wave composition and settled tallies (as of this draft: 64 seats dispatched by
  `.ufo/waves/round-39/w1-dispatch.json` `counts={spawn:64}`; registry role mix reviewer 17,
  critic 12, scout 9, mutation-tester 8, executor 7, scribe 6, connector 3, sentinel 1,
  revenger 1; 25 `report.md` files present with 31 `VERDICT` lines — an in-flight snapshot, not a
  tally).
- `OWED:` no-harm block (gate battery, freshness, self-assessment, census), frontier move
  (rows 144 → ?), assimilation/quarantine disposition, re-verification of prior sources, axis
  scores (no auto-bump rubric), trend verdicts (expansion / quality / discernment).
- `OWED:` the round-38 landed-commit ledger — `LOG.md` still ends at the round-38 freeze entry;
  its own text defers "Round-38 closure result and landed commit hashes" to an appended ledger
  that is not present (`grep -n "Round 38" LOG.md` → one heading only).

## Round 39 — mistakes and next-round plan (candidates only)

- **M1, class `reference-drift` (candidate, open).** `claims.json` names `frozenAt: 9c09ebb…`,
  but the claims blob **at** `9c09ebb` declares `frozenAt: 1f4260a…`; the bytes carrying the
  current value first appear in `dc695dc` ("finalize amended C2 freeze"). Verbatim:
  `git diff 9c09ebb..HEAD -- .ufo/waves/round-39/claims.json` → one line,
  `- "frozenAt": "1f4260aeb3af186e84444cbb417a31b8a35bdb55"` /
  `+ "frozenAt": "9c09ebb1e2ff594c70ce72093b5d4133c1734dca"`. The pointer resolves to the commit
  whose *instruments* match `frozenDigests` (C2 counter `eefc8997…` at `9c09ebb`, vs
  `891c1e9d…` at `1f4260a`), not to the commit holding the claims bytes. Consequence: anyone
  resolving a pre-`dc695dc` claims blob to `1f4260a` re-derives a C2 digest mismatch — the same
  observation w1 seat `RevFreezeIntegrity` reports ("C2 frozen digest mismatch at the requested
  commit"; C1 counter and driver digests equal at `1f4260a`). The predicate sentence is unchanged
  by the amendment (709 bytes, sha `b535dd0c…` in both blobs), so D7 byte-identity is untouched.
  Captured-by: none yet — the wave is in flight; `OWED:` a Captured-by row or an explicit
  "not captured" with the reason.
- **M2, class `claim-design` (candidate, open).** C2 D6 asks for a numstat receipt committed at
  REV whose path and body name REV, so committing the receipt changes the hash it must name
  (observed probe: `.ufo/waves/round-39/measure/c2-self-reference-probe.txt` — candidate
  `03322e9d…` → carrier `5c13c846…`; after the fixture commit the counter again demands
  `numstat-at-5c13c846.txt`, exit 1, `d5-receipt` + `d6-file`). The probe's own note calls this a
  claim-design defect and declines to amend the freeze after dispatch; two w1 seats
  (`CritC2Semantics`, `RevD5D6`) report independently that D6's same-REV receipt is
  self-referential. Consequence for this entry: C2's predicate is **not** asserted true here, and
  the round's calibration target may be unattainable under the frozen claim as written.
  Captured-by: none yet (`OWED:`).
- **M3, class `receipt-honesty` (candidate, open, wave-attributed).** `CritC2ReceiptHonesty`
  reports that C2 D4 accepts a forged mutant receipt with arbitrary unequal hashes and an
  asserted nonzero exit, without proving any counter run; `CritClaimsText` reports a one-token
  no-op mutation escape in D7. Both are seat claims made in flight, not re-derived here.
  Captured-by: none yet (`OWED:`).

## Round 39 — landed-commit ledger (append-only, observed at HEAD `1ace2fd`)

Observed by `git log --grep='round-39' --format='%h %ad %s'` (all ancestors of HEAD):

| Commit | Time (2026-10-27) | Subject |
|---|---|---|
| `1f4260a` | 13:29:44 | freeze claims, session-bound egress driver, C1/C2 frozen counters |
| `690b050` | 13:58:17 | control receipts and session-bound egress receipt |
| `11662da` | 13:58:50 | census start and before-measurement receipts |
| `9c09ebb` | 14:08:34 | amend C2 pre-data predicate binding and quarantine slices |
| `dc695dc` | 14:10:10 | finalize amended C2 freeze and validated 64-seat wave |
| `3fdf16f` | 14:11:13 | align mutant fixture to frozen claims bytes |
| `d3232d5` | 14:11:44 | verify C2 sentence-mutation red control |
| `25d4f53` | 14:19:38 | land source and collision guard evidence, ready wave |
| `03322e9` | 14:25:52 | preserve proc loopback parser red-green evidence |
| `1ace2fd` | 14:30:32 | preserve isolated C1 counter self-test |

`OWED:` the wave-evidence commits (w1 results, w2 results), the measurement commit at the
disposition REV, the census commit, and the lesson/scorecard/log disposition commit.

### Tooling

No tool installed or upgraded by this seat; `claims.toolInstalls` is `[]`. No pacman transaction
was run (host-wide guard honoured).
