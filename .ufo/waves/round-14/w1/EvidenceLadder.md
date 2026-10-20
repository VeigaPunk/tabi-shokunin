# EvidenceLadder — Round-14 UFO-FSD Connector Report

## 1. Declared Axes (Naming the Axes)

Under the Godspeed posture and Tabi campaign charter, the six ordinal axes and three learning trends are evaluated:

| Axis | Baseline Scalar | Target Scalar | Impact of Proposed Move | Rationale |
|---|---|---|---|---|
| **Calibration** | 9 | 9 | **Improved** (internal rigor) | Formulates explicit boundary between primary empirical browser signals and post-hoc analytical derivations; admits and resolves historical metadata defects without revisionist history. |
| **Coverage** | 9 | 9 | **Unchanged / Protected** | Explicitly prohibits claiming fresh browser surface or expanded test coverage from a derived metadata sidecar. |
| **Depth** | 8 | 8 | **Unchanged / Protected** | Enforces Evidence Ladder discipline: an analytical reconciliation cannot climb rungs or masquerade as a Rung-3 multi-signal witness. |
| **Operability** | 8 | 8 | **Unchanged / Synergistic** | Complements C1's non-shell gate repairs by establishing execution-free verification contracts for metadata sidecars. |
| **Freshness** | 8 | 8 | **Unchanged** | Distinguishes historical analytical reconciliation from dated live runtime executions. |
| **Adjacency** | 8 | 8 | **Unchanged** | Confines changes strictly within Tabi's observation and calibration boundaries. |
| *Expansion (trend)* | — | — | **Protected** | Prevents spurious capability inflation. |
| *Quality (trend)* | — | — | **Improved** | Cites and enforces grounded resolution of Round-13 spotcheck defects. |
| *Discernment (trend)* | — | — | **Improved** | Sharpens the distinction between browser execution truth and report-aggregation truth. |

---

## 2. Repository Evidence and Resolvable Pointers

1. **Evidence Ladder Structure (`tabi-shokunin/SKILL.md:361–375`)**:
   - Rung 1: Static bytes (idempotence proof across runs).
   - Rung 2: Dynamic capture (before/after pair under sha-pinned methodology and state-waits).
   - Rung 3: Multi-signal (two or more independent signals agree: visual screenshot, DOM shape, protocol metadata across independent runs).
   - Rung 4: Network / wire capture (CDP Network slice, wire `ExtraInfo`, encoded data length, performance timing witness, server request logs).
   - *Foundational Ladder Axiom (`SKILL.md:366`)*: "**never present a lower rung as support for a higher one.**"
   - *Layer Routing Rule (`SKILL.md:443`)*: "**name the producer layer per fact**... and treat a disagreement between like measurements as a finding, not noise."

2. **Accessible Evidence Boundaries in Round 12 (`tabi-shokunin/SKILL.md:1631–1643`)**:
   - `SKILL.md:1637`: *"An ARIA template match proves neither rendered appearance nor the network action [inference]; ARIA and DOM shape are not independent rung-3 witnesses."*
   - `SKILL.md:1641–1642`: *"This extends the state-evidence routing at `:402`; Playwright YAML and webbridge `@e` snapshots are different producers/formats and must not be conflated."*

3. **Locally Demonstrated Accessible-Selector Contract in Round 13 (`tabi-shokunin/SKILL.md:1688–1715`)**:
   - Documents the real execution of `node scripts/aria-loopback-round13.mjs` at code revision `06e6ada` (8 cases passed, 4 expected rejections).
   - Recorded exact environment: Playwright 1.64.0, Chrome for Testing 156.0.8078.4 (revision 1248, executable SHA-256 `377a9fc07b495c3b8d0ab8ec1fdfd153641759f9756fea34d8dfce4de82f5025`).
   - Pinned receipts: `corpus/evidence/round-13/aria/receipt.json` and `corpus/evidence/round-13/aria-execution-pass.json`.
   - `SKILL.md:1706–1710`: *"The receipt proves context closure, removed run-owned profiles/temp roots and refused server ports, with no page request outside the fixture origin. No packet-level no-egress, sandbox-certification, pixel/audit, real-site, cross-browser or determinism claim is made."*

4. **Identified Metadata Defects in Round-13 Closure Review (`tabi-shokunin/corpus/lessons/round-13-verifier-spotcheck.md:158–160`)**:
   - *Defect 1 (Cleanup Summary Metadata, `:158`)*: `runner605 stores the proposition “all workers not listening” under listeningAfter. Correct the field semantics or name in new evidence and preserve this original receipt; keep admission tied to correct per-worker closed/false/refused controls. Add a failure-capable summary consistency check. Evidence: aggregate=true versus sole perWorker=false in committed receipt.`
   - *Defect 2 (Reproducibility Wording, `:159`)*: `distinguish observed Node26.12.0 from runtime-pin.json's recorded24.21.0 and minimumMajor20; correct stale recorded metadata through a qualified new artifact, without pretending exact Node equality was enforced.`

5. **Historical Receipt Integrity (`tabi-shokunin/corpus/evidence/round-13/aria/receipt.json`)**:
   - `receipt.json:20`: `"node": "26.12.0"`
   - `receipt.json:37`: `"pinSha256": "4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2"`
   - `receipt.json:2388–2517`: 8 individual per-case browser cleanup records proving `contextClosed: true`, `profileRemoved: true`, and `tempRootRemoved: true`.
   - `receipt.json:2524–2534`: 1 worker server proof on dynamic loopback port 40983 proving `listeningBefore: true`, `closed: true`, `listeningAfter: false`, `refusedAfterClose: true`, and `refusalDetail: "ECONNREFUSED"`.
   - Aggregate field inverted: `cleanup.server.listeningAfter = true` despite `cleanup.server.perWorker[0].listeningAfter = false`.

---

## 3. Analysis: Derived Metadata Correction vs. Runtime Reexecution

### A. Substrate and Causality Disconnection
- **Runtime Reexecution** spawns real host processes (Node runner, Playwright Test runner, Chrome for Testing browser subprocesses), allocates a dynamic TCP loopback socket (observed port 40983), performs IPC over Chrome DevTools Protocol, renders DOM trees into Accessibility Object Model trees, evaluates locator queries, writes disk artifacts to volatile scratch roots (`/tmp/tabi-r13-aria-*`), and actively probes TCP connection termination (`ECONNREFUSED`). It generates **primary empirical evidence**.
- **Derived Metadata Correction** is an offline, pure analytical derivation operating exclusively over existing, byte-frozen cryptographic artifacts. It executes zero browser binaries, initiates zero network connections, opens zero CDP sessions, and creates zero browser contexts. It performs a post-hoc syntactic reconciliation:
  1. It reads the historical `corpus/evidence/round-13/aria/receipt.json` and evaluates the 1 worker server proof (`cleanup.server.perWorker[0]`, dynamic port 40983) proving `listeningAfter == false && closed == true && refusalDetail == "ECONNREFUSED"`, alongside the 8 per-case browser cleanup records.
  2. It recalculates the aggregate summary boolean (`cleanup.server.listeningAfter = false`), resolving the inversion introduced by runner line 605.
  3. It cross-references `runtime.node = "26.12.0"` with `runtime-pin.json`, documenting that while Node 26.12.0 satisfies `minimumMajor: 20`, the pinned `24.21.0` was stale descriptive metadata rather than an exact pinned match.

### B. Ladder Discipline: Zero Independent Additional Browser Signal
- In the Evidence Ladder (§Evidence ladder, §Claim classes, §Layer routing):
  - Rung 3 requires *two or more independent signals* (e.g., visual snapshot + DOM tree + protocol event stream) produced across independent runs.
  - Crucially, a derived metadata sidecar **has zero independent variance from the original Round-13 run**. Its assertions derive deterministically from the identical bytes of `receipt.json`.
  - An analytical sidecar cannot corroborate the original run because it shares the identical underlying witness. Citing a metadata sidecar as an additional witness would commit the exact error warned against in `SKILL.md:1637` ("ARIA and DOM shape are not independent rung-3 witnesses") and violate `SKILL.md:366` ("never present a lower rung as support for a higher one").
  - Therefore, the sidecar belongs strictly to the **analytical/audit surface**, NOT the empirical execution rungs (Rungs 1–4).

### C. Prohibiting Fresh Capability Credit
- In Round 13, C2 was an admitted **coverage/capability** claim (0→1 locally demonstrated accessible-selector contract).
- In Round 14, C2 is declared strictly as **calibration** (`"C2": "calibration: verified qualified derived metadata correction 0→1"` in `before.json`).
- If an agent or report were to treat the metadata sidecar as demonstrating a "new cleanup capability" or "expanded Playwright feature support", that would represent **spurious capability inflation**.
- Round 14 did not execute a browser run to test cleanup. The browser cleanup was already executed in Round 13; Round 14 merely corrected a flawed summary aggregation field and clarified descriptive environment metadata.
- Therefore, `SKILL.md` must explicitly forbid fresh capability credit for this artifact, and all ordinal scalars (depth=8, coverage=9, calibration=9) must remain unchanged.

---

## 4. Proposed Move: The Bounded Synthesis

Establish in `SKILL.md` the **Analytical Derivation vs. Runtime Signal Boundary Rule** as an append-only Round-14 section. This cleanly synthesizes:
1. The **Evidence Ladder's independence requirement** (`SKILL.md:361–375`).
2. The **ARIA note's non-conflation and boundary principles** (`SKILL.md:1631–1643`, `1688–1715`).
3. The **Verifier Spotcheck's routed debt** (`round-13-verifier-spotcheck.md:158–160`).
4. The **C2 Calibration contract** (`before.json`, `spec.json`).

### Exact Suggested Wording for `tabi-shokunin/SKILL.md`

```markdown
## Round 14 — derived metadata calibration and evidence ladder boundary (2026-10-20)

### Analytical derivation vs runtime reexecution

The Round-13 accessible-selector contract (`:1688-1715`) established locally demonstrated
runtime evidence for Playwright accessible locators and ARIA matchers (`corpus/evidence/round-13/aria/receipt.json`).
The Round-13 closure review (`corpus/lessons/round-13-verifier-spotcheck.md:158-160`) identified two status-neutral
metadata defects: an inverted aggregate summary field (`cleanup.server.listeningAfter=true` despite all per-worker
probes recording `false`), and stale descriptive Node pin metadata (`24.21.0` recorded vs `26.12.0` observed).

A **derived metadata correction sidecar** (`corpus/evidence/round-14/aria-metadata/corrected.json`) resolves these
defects analytically under the following strict boundaries:

1. **Analytical derivation, not runtime reexecution:**
   The sidecar is generated by an offline, deterministic derivation tool (`scripts/check-aria-metadata.mjs --derive`)
   reading the byte-frozen historical artifacts `corpus/evidence/round-13/aria/receipt.json` and `runtime-pin.json`.
   Zero browser processes are launched, zero loopback ports are bound, zero temporary profile directories are created,
   and zero new CDP interactions occur.

2. **No independent additional browser signal:**
   Under §Evidence ladder (:361-375) and §Layer routing (:426-443), an analytical sidecar is **not** an independent
   witness. It derives entirely from the historical Rung-2/Rung-3 capture envelope. It cannot serve as a corroborating
   signal for multi-signal Rung-3 claims, cannot arbitrate runtime disputes, and cannot climb the Evidence Ladder.
   The core rule holds: **never present an analytical derivation as an empirical runtime witness.**

3. **Grounded defect correction:**
   - **Cleanup summary reconciliation:** The sidecar qualifies `cleanup.server.listeningAfter = false` exclusively
     because the 1 worker server proof (`cleanup.server.perWorker[0]`, dynamic port 40983 in `receipt.json:2524-2534`)
     and actual worker output (`corpus/evidence/round-13/aria/actual/workers/worker-0-*.json`) independently established
     `closed=true`, `listeningAfter=false`, and `ECONNREFUSED` alongside the 8 per-case browser cleanup records
     (`receipt.json:2388-2517`). The historical receipt is preserved byte-for-byte and pinned; its original aggregate
     field remains documented as a runner aggregation defect, not an unclosed server.
   - **Environment qualification:** The sidecar records that observed Node `26.12.0` satisfies the enforced
     `minimumMajor: 20` requirement, while the pinned `24.21.0` was stale descriptive metadata. It explicitly refuses
     to claim exact Node equality was enforced at runtime.

4. **Prohibition of fresh capability credit:**
   This correction is classified strictly as **calibration** (scalar 9→9, unchanged). It demonstrates no new browser
   capability, adds no new locator/matcher assertions, covers no new Playwright APIs, and claims no additional browser
   surface. All ordinal scalars (depth=8, coverage=9, calibration=9, operability=8, freshness=8, adjacency=8) remain
   strictly unchanged.
```

---

## 5. Second-Order Effects Across Surfaces

1. **Runtime Surface**:
   - Spawns zero subprocesses during C2 verification.
   - Eliminates flakiness, port contention (dynamic loopback port 40983), and profile leak risks in CI and subagent execution.
   - Ensures strict conformance with the leaf constraint ("Skip ALL builds/tests/lint/format/smoke and selftest execution while authoring").

2. **Contract Surface**:
   - Keeps C2 strictly within the bounds of `before.json`: `"C2": "calibration: verified qualified derived metadata correction 0→1"`.
   - Prevents scope creep where C2 could be misconstrued as an unfulfilled capability expansion or an incomplete Playwright test run.

3. **Substrate Surface**:
   - Protects the historical integrity of `corpus/evidence/round-13/aria/receipt.json` and `runtime-pin.json` (zero byte mutations).
   - Complies with the immutable evidence directive: historical evidence files are never edited or overwritten.

4. **Verification Surface**:
   - Provides L1 and outside closure agents (`CloseTabiR14`) with a deterministic, fast, non-flaky verification path:
     Verify C2 purely via static JSON schema and SHA-256 digest checks (`scripts/check-aria-metadata.mjs` default check mode).

---

## 6. Risks and Contradiction Handling

- **Risk 1: Ladder Rung Confusion (False Multi-Signal Claim)**
  - *Symptom*: A downstream seat or evaluator claims that because the sidecar confirms the server was closed, we now have "independent corroboration" of server closure.
  - *Countermeasure*: The suggested wording explicitly forbids this: the sidecar shares the identical causal origin with the receipt and possesses zero independent variance.
- **Risk 2: Coverage vs. Calibration Conflation**
  - *Symptom*: Measuring scripts or reports increment coverage scalar or claim new Playwright feature coverage.
  - *Countermeasure*: `MeasureClaims` (`spec.json:23–26`) explicitly counts C2 as calibration (0→1) tied to digest-bound sidecar and lesson admission, leaving coverage scalar strictly unchanged at 9.
- **Risk 3: Revisionist History / Secret Edits**
  - *Symptom*: Modifying the original Round-13 `receipt.json` to make `listeningAfter=false`.
  - *Countermeasure*: Direct edit of `receipt.json` is strictly prohibited. The sidecar references `receipt.json` by exact SHA-256 digest (`1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`) and records the correction externally.

---

## 7. Concrete Commands for L1 Execution

When L1 executes wave landing and verification, L1 should run:

```bash
# 1. Verify that Round-13 historical receipt and pin bytes remain unmodified
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --exit-code HEAD -- corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json

# 2. Verify C2 metadata checker self-test (isolated CLI execution, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs --self-test

# 3. Verify C2 metadata sidecar derivation from historical artifacts
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs \
  --derive /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria/receipt.json \
           /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria/runtime-pin.json \
  --out /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-14/aria-metadata/corrected.json

# 4. Verify C2 metadata sidecar verification in check mode (exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs \
  --sidecar /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-14/aria-metadata/corrected.json

# 5. Verify C1 and C2 claims via revision-based measure probe
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/measure.mjs HEAD --claim C1 --claim C2
```
