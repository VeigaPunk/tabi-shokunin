# ReviewC2Admission — tabi round 14, w1 (C2 calibration sidecar)

Seat: TabiR14.ReviewC2Admission (reviewer, leaf). Read-only. Author-side advisory; not non-author verification.
Executed: file reads and greps only. No builds, tests, checkers, self-tests, browser runs, installs or git writes. Tools installed or updated: none.
No outcome is claimed: nothing below says the sidecar exists, passes, or has been derived.

## Verdict

Admit C2 only as a **calibration** move: one counted, digest-bound metadata correction to a committed round-13 receipt. It is not expansion, not coverage, and not a browser capability. Conditions in §3 (wording/scope) and §4 (assertions) are required before the admission is credited.

Scalars stay unchanged. The round-13 closure records calibration 9→9 (`corpus/lessons/round-13-verifier-spotcheck.md:143`), and the wave spec says scalars are unchanged (`.ufo/waves/round-14/w1/spec.json` context).

## 1. Evidence read (pointers)

Subject receipt (the "old aria receipt"): `corpus/evidence/round-13/aria/receipt.json`
- Verdict `pass` (`:2617`); summary 8 expected / 8 ran / 8 passed (`:2563-2582`); `workers: 1`.
- Aggregate server block `cleanup.server` (`:2519-2524`): `closed` true (`:2520`), **`listeningAfter` true (`:2521`)**, `refusedAfterClose` true (`:2522`), `ok` true (`:2523`), `perWorker` (`:2524`).
- Sole per-worker proof (`:2525-2534`): `listeningBefore` true (`:2527`), `closed` true (`:2528`), **`listeningAfter` false (`:2529`)**, `refusedAfterClose` true (`:2530`), `refusalDetail` ECONNREFUSED (`:2531`), `closeError` null (`:2532`).
- Finding `R13-ARIA-CLEANUP-01` = pass (`:2328-2331`, `allCaseCleanup` true, `serverOk` true).
- Runtime: `runtime.node` = "26.12.0" (`:20`); pin copy `node.recorded` = "24.21.0", `minimumMajor` = 20 (`:61-63`); `runtime.pinned.pinSha256` = 4d8947564ee9… (`:37`).
- Source binding: runner sha256 1d54c9e9… (`:13`), spec 03cb4e17… (`:15`), config 87ae779b… (`:17`).

Pin: `corpus/evidence/round-13/aria/runtime-pin.json:14-17` (`node.recorded` 24.21.0; `minimumMajor` 20).

Runner that produced the inversion: `scripts/aria-loopback-round13.mjs`
- `:603-608`: `listeningAfter: serverProofs.every((proof) => proof.listeningAfter === false)`. This is the proposition "no worker is listening" stored under the name `listeningAfter`.
- `:439-443`: the admission gate `serverOk` already uses the correct per-worker proofs.
- The runner never reads the pin's `node` block. `minimumMajor` and `recorded` do not appear in it.

Enforcement of the Node pin: `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:269` asserts `RUNTIME.nodeMajor >= PIN.node.minimumMajor`. That assert sits in `assertPinnedRuntime` (`:262-270`), which is called at `:924`. `PIN.node.recorded` is referenced nowhere in the spec or the runner, so exact Node equality is not enforced.

Independent identification of both defects: `corpus/lessons/round-13-verifier-spotcheck.md`
- Header `:1`: "author: hyaku closure (non-author integrator, @m_strong)"; `:7`: "not an author-side seat judgment".
- Defect text `:94-100`: the aggregate field is "inverted by runner605"; observed Node 26.12.0 "satisfies enforced minimumMajor 20"; recorded 24.21.0 is "stale descriptive metadata, not an exact enforced Node pin".
- Routed items `:158-159`: (1) correct field semantics or name in new evidence, preserve the original receipt, keep admission tied to per-worker proofs, add a failure-capable summary check; (2) distinguish observed 26.12.0 from recorded 24.21.0 and minimumMajor 20 through a qualified new artifact.
- Verdict line `:152`: "not conformant" for these metadata fields; status-neutral.

Other receipts in round-13 (scope check):
- `corpus/evidence/round-13/aria-second-receipt.json`: top-level `listeningAfter` **true** at `:2513`, per-worker proofs false at `:2521` and `:2530`, verdict fail (7/8). Same defect; same Node metadata (`:20`, `:62`).
- `corpus/evidence/round-13/aria-initial-receipt.json`: top-level `listeningAfter` false (`:810`), no `perWorker`. Same Node metadata (`:20`, `:58`).
- Grep of `corpus/evidence/round-13` for `"listeningAfter": true` matched only `aria/receipt.json` and `aria-second-receipt.json`. The `aria-execution-*.json` files and worker JSON were not inspected individually.

## 2. Findings (severity order)

**F1 — High — scope is one receipt, one pin. Not "round-13 receipts".**
Without an explicit scope, a checker run over round-13 would find the inversion in two receipts (`aria/receipt.json:2521`, `aria-second-receipt.json:2513`) and Node metadata in three. The count "0→1" then has no defined denominator, and a second admitted sidecar would silently make it 2. Required: bind the sidecar to exactly the pair P1 = {`corpus/evidence/round-13/aria/receipt.json`, `corpus/evidence/round-13/aria/runtime-pin.json`}. State in the sidecar and in the report that `aria-second-receipt.json` (failed attempt, same inverted field) and `aria-initial-receipt.json` are out of scope and remain retained, unrouted debt. Do not rewrite either.

**F2 — High — "independently checked" overclaims.**
The defects were independently identified by the non-author round-13 closure (`round-13-verifier-spotcheck.md:1,7,94-100,158-159`). The correction (sidecar, checker, derivation) is lane-authored by ReceiptRepair and MeasureClaims. Replace the phrase with: "defect independently identified by the round-13 non-author closure (`corpus/lessons/round-13-verifier-spotcheck.md:94-100,158-159`); correction derived and gated by a lane-authored checker; no non-author verification of the correction is claimed." Counted calibration moves do not require a non-author reviewer (`ReviewShonen` F6, `AXES.md:47-49` as cited there), so no reviewer claim is needed or should be implied.

**F3 — High — "0→1" is an artifact count and must be defined as one.**
Same pattern as the round-12 CoverageAttack F6 finding: a count is only as honest as its definition. Define it per §3. Do not map it to the calibration scalar. Do not let "count 1" read as "calibration 10".

**F4 — Medium — the derived field must not keep the ambiguous name.**
The spec's "corrected `listeningAfter`=false" keeps the misleading name. Read literally, a reader sees `listeningAfter: false` and cannot tell whether it means "not listening" or "all workers not listening". Required: the sidecar's corrected view uses an unambiguous name (for example `anyWorkerListeningAfter: false`), and records the original mapping: original path `cleanup.server.listeningAfter`, original value `true`, original meaning `allWorkersNotListeningAfter`. The original receipt is not rewritten.

**F5 — Medium — the derivation predicate must be the full per-worker proof, not `listeningAfter === false`.**
A proof where the server never listened would also show `listeningAfter` false. For the correction to be a true fact about the run, derivation must require, for every `perWorker` entry: `listeningBefore` true, `closed` true, `listeningAfter` false, `refusedAfterClose` true, `refusalDetail` "ECONNREFUSED", `closeError` null, origin on 127.0.0.1. It must also require `perWorker.length === workers.length` and length ≥ 1. Any failure refuses derivation and writes no file (see §4 A6).

**F6 — Medium — Node wording must not imply enforcement that does not exist.**
Facts the sidecar may state: observed `runtime.node` = 26.12.0 (copied from `receipt.json:20`, not re-measured); `minimumMajor` = 20 is enforced by `aria-loopback.spec.mjs:269` as `>=`; `recorded` = 24.21.0 is descriptive and stale; exact equality is not enforced. The sidecar must carry `nodeExactEqualityEnforced: false`. Derive and check must not spawn `node --version` or any runtime, because that would be a new measurement and is out of scope.

**F7 — Medium — no new browser capability, and nothing in the checker may execute one.**
The sidecar must say `browserExecuted: false` and that all runtime facts come from the historical receipt. The checker must not import `child_process`, `playwright`, or launch chromium. The existing scope, "NO browser runtime support claimed", stays in force. Calibration is the claim; capability is not.

**F8 — Low — lesson and registry hygiene.**
Lesson admission must not add a knowledge row, a SOURCES row, or a knowledge count. Do not edit `corpus/lessons/round-13-verifier-spotcheck.md` or any round-13 evidence (historical). Do not mint or mark any SHONEN `[x]`.

**F9 — Low — routed-item coverage.**
The sidecar answers routed items 1 and 2 only (`round-13-verifier-spotcheck.md:158-159`). Item 1's "failure-capable summary consistency check" must live in the checker and must be red on P1 without a sidecar. Items 3-6 (`:160-166`) remain debt and must not be credited by this admission.

## 3. Count definition and suggested wording

Object: a sidecar JSON under `corpus/evidence/round-14/aria-metadata/` with schema `tabi-aria-metadata-correction-v1`.

C2 := number of **distinct source pairs** (receipt sha256, pin sha256) for which exactly one sidecar exists and check mode exits 0 on that sidecar. Two sidecars for the same pair → gate red, count does not increase. Any pair other than P1 → gate red and does not count toward this admission.

- **Before** (baseline `bebe2efc4565bb068efd905e9ef78011bb6b4efd`, `.ufo/waves/round-14/before.json`): directory absent, **C2 = 0**.
- **After**: exactly one sidecar for P1, check mode exit 0, **C2 = 1**. Scalars unchanged.

Suggested SCORECARD / SKILL wording (round-14 C2 row):
> calibration: scalar unchanged (9). Counted metadata correction 0→1: a derived, digest-bound sidecar for `corpus/evidence/round-13/aria/receipt.json` + `runtime-pin.json` (pair P1) corrects the summary `listeningAfter` semantics and records observed Node 26.12.0 against the descriptive pin 24.21.0 and enforced minimumMajor 20 (`aria-loopback.spec.mjs:269`). Defect identified by the round-13 non-author closure (`corpus/lessons/round-13-verifier-spotcheck.md:94-100,158-159`); correction derived and gated by a lane-authored checker; original receipt and pin byte-identical. No browser run; no capability, coverage, or knowledge change. `aria-second-receipt.json` retained unrouted.

## 4. Assertions proving the correction (expected values; none executed)

- **A1 Original immutability**: sha256 of `receipt.json` and `runtime-pin.json` equals their `bebe2efc` blob hashes; `git diff --name-only bebe2efc -- corpus/evidence/round-13` is empty.
- **A2 Red before correction**: check mode on P1 with no sidecar exits non-zero with one stable finding ID for the summary inversion (ID chosen by ReceiptRepair; distinct from `R13-ARIA-CLEANUP-01`, which stays pass). The browser findings are not changed by this red.
- **A3 Node is not red**: the Node facts produce no red for 26.12.0 vs 24.21.0 as long as major ≥ 20 and the sidecar says exact equality is not enforced.
- **A4 Determinism**: two `--derive` runs produce byte-identical output (`cmp` exit 0).
- **A5 Diff closure**: the JSON-pointer diff between original P1 and the corrected view is exactly `/cleanup/server/listeningAfter` (true → renamed `anyWorkerListeningAfter` false) plus an additive `/correction` block. No change under `/verdict`, `/summary`, `/cases`, `/workers`, `/findings`, `/runtime`, `/pin`, `/note`, `/externalRequestsBlocked`.
- **A6 Derivation refusal**: derive exits non-zero and writes no file for each of these fixtures: empty `perWorker`; `perWorker` count ≠ `workers` count; one proof with `listeningAfter` true; `listeningBefore` false; `closed` false; `refusedAfterClose` false; non-boolean fields; non-null `closeError`; a pin whose sha ≠ `runtime.pinned.pinSha256`.
- **A7 Digest binding**: sidecar records sha256 of receipt, pin, and checker script; check mode recomputes all three. Any one-byte change in a temp copy → red.
- **A8 Node facts**: `nodeObserved` === `receipt.runtime.node` ("26.12.0"); `nodeMinimumMajor` === 20; `nodeMajorSatisfiesMinimum` === true; `nodeExactEqualityEnforced` === false; `nodeRecordedDescriptive` === "24.21.0" with status `stale-descriptive`.
- **A9 No new execution**: `browserExecuted` === false; `externalRequestsBlocked` unchanged (0); checker imports exclude `child_process`, `playwright`, and chromium.
- **A10 Count**: `corpus/evidence/round-14/aria-metadata/` holds exactly 1 sidecar; checker distinct-pair count = 1; before-count = 0 (`git ls-tree -r --name-only bebe2efc -- corpus/evidence/round-14/aria-metadata` empty).
- **A11 Scalars and expansion**: SCORECARD calibration scalar still 9; no knowledge or SOURCES rows added; `sources-census.sh validate` result unchanged from `before.json` census (`tabi ok`).

Commands L1 should run after all seats land (not run here):
1. `git show bebe2efc:corpus/evidence/round-13/aria/receipt.json | sha256sum` and `sha256sum corpus/evidence/round-13/aria/receipt.json`: must match. Repeat for `runtime-pin.json`.
2. `git diff --name-only bebe2efc -- corpus/evidence/round-13`: must be empty.
3. `node scripts/check-aria-metadata.mjs --self-test`: exit 0, with case IDs listed in ReceiptRepair's report.
4. Check mode on P1 without a sidecar: exit non-zero, finding ID as in A2. The exact check-mode argv is not yet landed; take it from ReceiptRepair's report.
5. `node scripts/check-aria-metadata.mjs --derive corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json --out corpus/evidence/round-14/aria-metadata/<name>.json`, run twice, then `cmp` the outputs.
6. Check mode on the sidecar with P1: exit 0.
7. `ls corpus/evidence/round-14/aria-metadata | wc -l`: must be 1.
8. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`: exit 0, output unchanged from `before.json:5-7`.

## 5. Gaps and unknowns

- `scripts/check-aria-metadata.mjs` and the sidecar did not exist at review time. Every expected value above is an assertion to test, not an observed outcome.
- The runner's HEAD sha256 was not measured here. A1-style binding to `receipt.source.sha256` (`:13`) must be checked by L1.
- `aria-execution-*.json` and the worker JSON were not inspected individually. The `"listeningAfter": true` grep covered them, and they were not matched.
- The round-13 closure is authored by an integrator (`@m_strong`). Its status as independent is taken from its own header (`round-13-verifier-spotcheck.md:1,7`), not verified here.
