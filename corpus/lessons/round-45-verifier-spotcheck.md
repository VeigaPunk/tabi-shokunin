author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# tabi round 45 — non-author verifier spot-check (closure)

Lane repo: `C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/fleet/tabi-shokunin`
(range `d252ea17bf8d39ea2e1da9770316146f264f8a0e..13a22ee17e1fe8f71de8263e343002fa588ef64b`).
Every command below was run by this verifier at closure time (2026-10-31) against committed
bytes; index-free git only. This file is a closure artifact — it is NOT committed by the
verifier; the orchestrator commits it under the protocol identity.

## 1. Step-1 conformance

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an %H' -1 -- .ufo/reports/round-45/tabi.md` | `tabi-shokunin deab3c9a50dd5d0cf64fc7d5a18c72f8145cf433` | PASS |
| `SHONEN` heading | read `.ufo/reports/round-45/tabi.md` | `## SHONEN` present, 4 `[~]` lines with pointers, no `[x]` | PASS |
| Lane tip pushed | `git rev-parse refs/heads/master` vs `git ls-remote origin refs/heads/master` | both `13a22ee17e1fe8f71de8263e343002fa588ef64b` | PASS |
| Cited lane commits exist + ancestry | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> refs/heads/master` for `d252ea17`, `51ee1921`, `fb8e2435`, `0360b069`, `cc34ab50`, `13a22ee1`, `8c238799`, `844a5b3a` | all EXIST + ANCESTOR | PASS |
| Round work reachable in range | `git log --format='%h %s' d252ea17..13a22ee1` | exactly the 5 round commits (freeze, measured, data-correction, integration, round-close); 43 files, all lane-local | PASS |
| Freeze discipline | `git diff 51ee1921..13a22ee1 -- scripts/chrome-cdp-loopback-round45.mjs .ufo/waves/round-45/counters/` and `-- .ufo/waves/round-45/claims.json` | both empty (0 bytes) | PASS |
| Frozen digests byte-true | `git show 13a22ee1:<path> \| sha256sum` for all 5 `frozenDigests` entries + all 12 `controlBindings` spot-reads | all equal the pinned sha256 (e.g. runner `c2abfccf…`, counter `9a1e81ca…`, checker `3e41e649…`, meter `d197ffb6…`, amendment `18035d30…`) | PASS |
| r44 freeze untouched (D1 discipline) | `git ls-tree <rev> -- .ufo/waves/round-44/claims.json` at freeze and tip | blob `a38b24ee66108fb8c55e7f08463732c378bc28f6` at both | PASS |

Notes (status-neutral): (a) `7c558d5e2eae93a5f32a8f9235f97775a3fb488c` (D3 fixture rev) is not a
git object in the lane repo — it is the deterministic `fixtureRev` of a scratch fixture tree,
reproducible from the committed builder `.ufo/waves/round-44/fixtures/build-r5-fixtures.mjs`
(receipt `.ufo/waves/round-45/measure/d3-pathtype-fixture-build.json`); not a commit citation, no
conformance failure. (b) The dispatched prompt carries no standalone L2-floor line; the L2 floor
is reached through §1's MISSION.md/AXES.md SSOT binding (MISSION.md §L2 concurrency, ≥8), the
same template shape prior closures (r43/r44) accepted — named here for the integrator's fidelity
ledger, not graded by this closure. (c) No `census-start` receipt file exists; the start census
is quoted inline in the lesson — acceptable, and re-run by this verifier below.

## 2. Claim re-checks

Verification mode per claim: **C2 re-measured** (this verifier re-executed the committed runner
on a live surface); **C1 and C3 evidence-verified** (lane-owned gates: committed receipts,
self-test tallies, revision binding checked against committed bytes; the gates were NOT executed
by the closure, per the closure standard).

### C1 — calibration (instrument-repair) — VERIFIED (evidence-verified)

- Red at baseline: `.ufo/waves/round-45/measure/c1-checker-red-at-baseline.json` — `rev:
  d252ea17…`, `predicate: false`, 2 findings `amendment-missing` + `frozen-digest-stale`
  (".ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs: pinned d994ab716df4 != committed
  f796ae840850").
- Green at measured: `.ufo/waves/round-45/measure/c1-checker-green-at-measured.json` — `rev:
  0360b069…`, `predicate: true`, 0 findings.
- Self-test: `.ufo/waves/round-45/measure/c1-selftest-at-measured.json` — `allPass: true`,
  11/11, with the refusal cases named (relabel, invented repin, duplicate binding, fragment
  quote, untyped path, digest mismatch, named-control-unbound, blob mismatch).
- Amendment re-derived by this verifier: `git show 13a22ee1:.ufo/waves/round-44/claims-amendments.json`
  carries exactly one entry, old `d994ab71…` → new `f796ae84…`, round 45, defect D1; and
  `git show 13a22ee1:.ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs | sha256sum` →
  `f796ae84085087b6acde10a7d32787e95589f3202386f33bce7d8dfaaf101cc5` — the newDigest equals the
  actual committed bytes. The freeze blob itself is byte-identical (see §1).
- Verdict: **met under the frozen rule**; the r44 routed defect D1 is closed append-only with a
  checker ratchet. calibration **improved** (round instrument-repair, held 9→9 by rubric honesty).

### C2 — coverage (capability-acquisition, sourced S154) — VERIFIED (re-measured)

Committed evidence, all re-checked at `13a22ee1`:

- Evidence tree 0→2: `git ls-tree -r --name-only d252ea17… -- corpus/evidence/round45 | wc -l`
  → 0; same at `0360b069…` → 2 (`edge-cdp/receipt.json`, `edge-cdp/screenshot.png`).
- Byte-pin: `git show 13a22ee1:corpus/evidence/round45/edge-cdp/screenshot.png | sha256sum` →
  `7dfce09d24d2c5610317b08efd2884ff8e31cbe0e7adc6cd289115eccebc323c`, PNG magic `89 50 4e 47`
  present; equals the receipt `screenshotSha256` and both live-run stdout receipts.
- Receipt clauses: `declaredSurface: edge`, `browser: Edg/156.0.4314.50`,
  `discoveryVia: devtools-active-port` + `/devtools/browser/67318b0d…` path, `wsHost
  127.0.0.1:52661`, fixture `http://127.0.0.1:52660/` (loopback-only), `invocationBound: true`
  (fixtureNonce == dom.nonce), timestamps strictly increasing, `chromeTerminated: true`, profile
  under the declared throwaway scratch.
- Repro run: `c2-live-edge2-stdout.json` — fresh socket `127.0.0.1:62784`, same screenshot sha
  (byte-identical PNG), fresh nonces.
- Cross-refusal (re-derived from the r44 receipt bytes, not by executing the counter): the r44
  receipt is schema `tabi-chrome-cdp-round44`, has no `declaredSurface`, `runnerSha256
  9b2855f0…` ≠ pin `c2abfccf…`, no `discoveryVia`, title `tabi r44 cdp loopback fixture` —
  exactly the 5 findings the committed control `c2-counter-refuses-r44-receipt.json` records.
- Counter on committed bytes: `c2-counter-edge-committed.json` — `predicate: true`, 0 findings.

**Strongest verification — independent live re-run performed by this verifier** (sanctioned by
the closure note): the committed runner bytes extracted via `git show
13a22ee1:scripts/chrome-cdp-loopback-round45.mjs` (sha256 verified `c2abfccf…` pre-run), run once
with fresh nonces into a fresh throwaway scratch:

```
node chrome-cdp-loopback-round45.mjs --browser edge --out verifier-receipt.json \
  --shot verifier-shot.png --scratch <verifier-scratch>/cdp-edge-closure1
→ {"ok":true,"declaredSurface":"edge","pageTitle":"tabi r45 cdp loopback fixture",
   "invocationBound":true,"screenshotSha256":"7dfce09d24d2c5610317b08efd2884ff8e31cbe0e7adc6cd289115eccebc323c",
   "pngByteLength":8194,"browser":"Edg/156.0.4314.50","wsHost":"127.0.0.1:49239"} EXIT=0
```

Fresh ports (49238/49239 vs 52660/52661 vs 62784), fresh fixture nonce, fresh
`/devtools/browser/9ef775f4…` path, and the screenshot **byte-identical** to the committed pin
across four independent invocations (live1, live2, committed, verifier). Teardown hygiene
replicated PID-scoped (see §4). The capability is real on this host. Verdict: **met**; coverage
**improved** (held 9→9 by rubric honesty); capabilities row `edge-cdp-loopback-windows`
(first-working 45) present in SCORECARD.

### C3 — adjacency (frontier-rebase, lowest owned axis 8, nudge inactive) — VERIFIED (evidence-verified)

- Red at baseline: `c3-meter-red-at-baseline.json` — exit-1 state, 28 findings (16
  audit-missing, 12 roster-lane-uncovered). Green at measured: `c3-meter-green-at-measured.json`
  — `rev: 0360b069…`, counts `{roster:16, mapRows:16, auditRows:16, deltaLanes:12}`,
  `predicate: true`, 0 findings. Selftest 13/13 (`c3-selftest-at-measured.json`).
- Ledgers re-read: `corpus/adjacency-host-audit-r45.tsv` = header + 16 rows (statuses honestly
  recorded as drift: 6 sibling-absent, 9 stale, 1 moved — never smoothed);
  `corpus/adjacency-host-delta-r45.tsv` = header + 12 lane rows + 14 dispositioned hit lines.
- **The first-measurement reject re-derived**: the delta ledger at `fb8e2435` pins chousa head
  `27df950df83a…`; at `0360b069` it pins `948afaa0a2a7…` with PROVINCE bytes unchanged
  (`cf7826a4…` both times). Both heads are ancestors of chousa's current master; chousa really
  advanced mid-measurement and the meter's head binding caught it. The kill-rule data-correction
  (ledgers re-bound as data, instruments untouched) was the frozen, honest path.
- **Contested items recorded-not-absorbed**: the two `contested-open` line rows quote verbatim
  whole lines of `shokunin-reverse-engineering` PROVINCE.md :53/:137 (CDP runtime-observation
  ground) and name the open fleet L0 `b6b3b5e…:65`. `git diff-tree d252ea17..13a22ee1 --
  PROVINCE.md` shows only the host-surface Edge update (tabi's own loopback raw-CDP ground) —
  the sibling's ground is routed (delta ledger → integrator), not absorbed. Lane-local scope
  held: all 43 changed files are inside the lane repo.
- Verdict: **met under the frozen rule**; adjacency **improved** (held 8→8 by rubric honesty).

## 3. Per-axis verdicts (closure)

| Axis | Verdict | Basis |
|---|---|---|
| calibration | improved | C1 met (evidence-verified); D1 closed append-only with ratchet; selftest 11/11 |
| coverage | improved | C2 met and **re-measured live** by this verifier; capability row entered, first-working 45 |
| adjacency | improved | C3 met (evidence-verified); drift recorded not smoothed; contested ground routed |
| depth | unchanged | no claim; SCORECARD diff append-only, no prior row touched |
| operability | unchanged | no claim; no harm observed (instruments ran on this host) |
| freshness | unchanged | no claim; S154 carries recheck 90d; no regression observed |

No axis harmed. No exploratory claim this round (none declared), so no `unprovable-but-better`
gate was needed.

## 4. Round-close orphan disclosure — honesty check

The disclosure (lesson Mistake 5, LOG round-close bullet, report addendum) says: three
re-parented msedge orphan trees survived `taskkill /T` although every receipt recorded
`chromeTerminated: true`; the clause is truthful about the MAIN child only; the three roots were
killed PID-scoped (never by image name); CimInstance sweep 0; repair routes to round 46.

This verifier **reproduced the class independently**: the §2 re-run exited 0 with
`chromeTerminated: true` and left **8 msedge processes** (root + crashpad/gpu/utility/renderer
helpers) bound to the verifier's own scratch; all were killed PID-scoped (CommandLine matched to
the verifier's unique scratch marker; `Stop-Process -Id`, no image-name kill), sweep-after = 0.
An independent sweep for any process whose CommandLine references `tabi-r45` (the lane's marker)
found **none** — the lane's "three roots killed, sweep 0" claim is confirmed. The disclosure is
honest and the defect class is real and reproducible; the runner repair routing (post-run
profile-token sweep or job-object kill → round 46) is present in lesson Mistake 5, LOG.md, and
the report addendum.

## 5. Discernment spot-check (outside, non-author)

Samples from `corpus/lessons/round-45.md` `## Gate` (≥1 admit, ≥1 reject):

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S154 (Edge DevTools Protocol docs) | ADMIT | Live re-open of https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol + committed staged copy `.ufo/waves/round-45/sources/edge-devtools-protocol.html` (sha256 re-derived `ab6c14c5…`; quote grep → exactly 1 verbatim hit) | AGREE | The page contains the exact sentence "The Microsoft Edge DevTools Protocol matches the APIs of the Chrome DevTools Protocol." and documents the `msedge.exe --remote-debugging-port` + distinct-user-profile contract; tier A docs, load-bearing for C2, honestly recorded incl. the rejected first URL |
| Edge capability demonstration (C2) | ADMIT | Independent live re-run of the committed runner (§2) | AGREE | Re-measured end-to-end: exit 0, Edg/156 identity, DevToolsActivePort discovery, invocation-bound, byte-identical PNG, cross-refusal re-derived from bytes |
| First C3 measurement at `fb8e2435` | REJECT (kill-rule data correction) | Delta ledger heads at `fb8e2435` vs `0360b069` + chousa ancestry | AGREE | The head binding caught a real sibling advance (`27df950d…` → `948afaa0…`, both ancestors of chousa master); correcting ledgers as data while instruments stayed frozen is the sanctioned flow and was disclosed in lesson, LOG, report, and the correction commit message |
| First delta keyword list | REJECT (pre-freeze instrument design) | Frozen owned-ground list in the meter bytes (`claims.json` P3); the broad-list 265+ line burden is a pre-freeze scratch measurement with no committed receipt | AGREE (with note) | The narrow list produced 14 bounded, dispositioned lines — the right taste call; noted that the rejected broad-list measurement itself left no receipt (pre-freeze design, acceptable) |

New SOURCES.md row re-opened: S154 (above) — quote is 13 words, verbatim, located (intro
paragraph); row carries tier A docs scope, `mined`, `used-by` naming the note + lesson; registry
count re-derived 154 (`git show 13a22ee1:corpus/SOURCES.md | grep -c '^| S[0-9]'`).

Census re-run by this verifier: `bash <fleet>/scripts/sources-census.sh validate --root <fleet>
tabi` → **exit 0**, `tabi ok`, the same 21 pre-existing W04 duplicate-URL warnings disclosed in
the lesson; matches the committed `census-end.*` receipt. `check-sources-end.txt`:
`verdict=clean rows=154 findings=0`.

## 6. Trend verdicts (closure)

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | Capability row `edge-cdp-loopback-windows` entered (re-measured live); new sourced note on ground the coverage map did not hold (note re-read: provenance trio present, source S154); registry 153→154 (re-derived); notes 61→62 (re-derived); evidence tree 0→2 (re-derived) |
| quality | improved | D1–D3 carry-ins closed in committed bytes (all receipts re-checked); head binding caught a real sibling move (re-derived); census + check-sources clean at tip (re-run); no admitted entry failed a re-check |
| discernment | improved | Both in-round refusals recorded not smoothed (re-derived); this closure's outside spot-check **agrees** with the gate on the sampled admit and reject; fresh-start classes re-derived from committed bytes by the lane and confirmed here |

## 7. Routed items for round 46 (the lane must fix)

1. **Teardown-orphan repair (the real one).** The r45 runner's `taskkill /PID /T /F` does not
   reliably reap Edge helper processes on this host (reproduced by this verifier: 8 survivors on
   one run). Land the post-run profile-token sweep or job-object kill; add a helper-tree sweep
   clause to the counter so `chromeTerminated` stops over-promising; add a scratch-deletion
   verification step after every C2-class run. (Routed by the lane in lesson Mistake 5 + LOG;
   confirmed open by this verifier's reproduction.)
2. **SCORECARD planned for round 46** does not name the teardown repair (routed via lesson + LOG
   instead) — list it explicitly in round 46's planned claims so the routing is visible where
   the next round declares.

## 8. Notes for the operator (status-neutral)

- All four SHONEN boxes are `[~]` with resolvable pointers; boxes 1–4 look fully checkable by a
  named non-author verifier (box 2's end-to-end task is now a committed, reproducible, re-run
  Edge CDP demonstration). Nothing bars a promotion review whenever the operator schedules one;
  this closure does not write `[x]`.
- Conformance observations: no standalone L2-floor line in the dispatched prompt (reached via
  MISSION.md SSOT binding — same template shape prior closures accepted); no census-start
  receipt file (start census quoted in lesson; end receipt committed; re-run by this verifier).
- `7c558d5e…` is a deterministic fixture-tree rev (not a lane commit), reproducible from the
  committed r44 builder — flagged so no later reader mistakes it for a dead hash.
