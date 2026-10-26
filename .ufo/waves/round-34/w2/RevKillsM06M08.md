# RevKillsM06M08 — C2 kill cases for mutants M06 and M08 (round 34, wave w2, rev 04f9623dde8ad35d470cecf766e421eafbcb47fa)

**Verdict: holds.** Both assigned mutants are killed by the gate's own `--selftest` alone, each by exactly its own case and with zero collateral case failures (55/56 with only the assigned case FAIL in each mutant run), while the pristine gate passes 56/56 (exit 0). Both cases exercise the gate's production `evaluate()` on a git fixture and compare runtime outputs only — never the gate's source text — and every expected value is the pristine gate's real outcome for that fixture (proven empirically: the pristine run's PASS compares exit, admitted, reason, population and detail simultaneously). One low-severity fragility is recorded on the M06 case (prose-coupled `detailIncludes` pin); the M08 case has no such coupling. Findings only; nothing repaired. No tools installed, no network fetches, no lane tracked files touched.

## Evidence

Setup (all runs in a `--shared` scratch clone detached at 04f9623; TMPDIR under scratch; lane only read):

    git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
    git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa   # clone rev == lane master == 04f9623
    TMPDIR=$S node scripts/check-bidi-runtime.mjs --selftest [--json]

Mutants applied verbatim from the frozen counter `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` (M06 at its lines 89-93, M08 at 101-105) with exact-string edits; between runs the gate was restored with `git checkout -- scripts/check-bidi-runtime.mjs` and `git status --porcelain` confirmed empty.

| Run | Exit | Result |
|---|---|---|
| pristine (before, and again after each restore) | 0 | `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56` |
| M06 applied (`SESSION_ID` → `[0-9a-fA-F]{32}`, clone gate:145) | 3 | `CASE id=v3-a-m06-session-id-uppercase … FAIL` — sole failure |
| M08 applied (`CONTEXT_ID` → `[0-9a-fA-F]{32}`, clone gate:146) | 3 | `CASE id=v3-a-m08-context-id-lowercase … FAIL` — sole failure |

(1) **Kill + THAT case failing.** M06: exit 3, `v3-a-m06-session-id-uppercase` FAIL (`--json`: `ok:false`, `detail:"run1: webSocketUrl is not ws://<host>/session/<sessionId>: ws://127.0.0.1:9515/session/585E9EC1343EAA7FAA0718A636677BC9"` vs pinned `sessionId is not 32 lowercase hex`). M08: exit 3, `v3-a-m08-context-id-lowercase` FAIL with the strongest possible flip — mutated gate judged the receipt **clean**: `exit:0, admitted:16, reason:null` where pristine refuses (`exit:1, admitted:0, reason:"t1-receipt"`). Full verbatim output: receipts m06/m08.

(2) **Pristine passes both.** 56/56 exit 0 on the untouched clone; both cases PASS (see receipt-pristine.md).

(3) **Rule, not source text; expectations untuned.** `runSelftest` builds a per-case git fixture and calls `await evaluate(fx.root, …)` (clone gate:1149); the pass predicate compares observed exit/admitted/reason/population/firstDetail (clone gate:1161-1164). The only source read in the self-test is `gateSource`, used solely as fixture driver bytes for `v2-f5` (`driverCopyOfGate`), never in any v3-a expectation. Both cases' expected values are the pristine gate's actual outputs for their fixtures: pristine 56/56 PASS is exactly that comparison, so a tuned-wrong expectation would have failed pristine.

(4) **M06 `detailIncludes` — real runtime output, with recorded fragility.** The pinned string is built at clone gate:382 (`sessionId is not 32 lowercase hex: ${JSON.stringify(sid)}` inside `sessionOf`), prefixed `run1: ` by the receipt loop (clone gate:804), surfaced as `firstDetail` (clone gate:1161). Pristine detail verbatim: `run1: sessionId is not 32 lowercase hex: "585E9EC1343EAA7FAA0718A636677BC9"`. **Fragility (low defect, recorded):** a semantically equivalent rewording of that message — or reordering the session-shape check after the ws checks — keeps the rule intact but breaks the pin, producing a false kill; under M06 only the detail field mismatched (exit/admitted/population/reason all still matched), so the kill surface is exactly the prose substring. Mitigating: the coupling is deliberate and documented in the case's own comment (clone gate:1029-1035 — without the detail pin, M06's refusal reroutes to the ws-shape rule and is indistinguishable by exit/admitted/reason from any other t1 refusal), and reason codes are stable, prose is not. M08 has no `detailIncludes`: no message fragility; no equivalent exposure found.

(5) **Sourced shapes match their S-rows.**
- M06 fixture sessionId `585E9EC1343EAA7FAA0718A636677BC9` = `sha256("tabi-v3-a-session").slice(0,32).toUpperCase()` (derivation re-computed) — 32 **upper** hex, deliberately off S127 (corpus/SOURCES.md:141: ChromeDriver 154 mints `%016PRIx64%016PRIx64` = exactly 32 lowercase hex, echoed verbatim as `sessionId` and inside `webSocketUrl`).
- M08 fixture context id `8f219b48c042686311a73bfee44a3739` = `sha256("tabi-v3-a-context").slice(0,32)` — 32 **lower** hex, off S130 (corpus/SOURCES.md:144: `base::Token::ToString` prints `%016PRIX64` = 32 upper hex, `FromString` rejects lower case, "a lower-case or mixed-case id marks a forged or foreign one") via S131 (corpus/SOURCES.md:145: BiDi context id = `targetId` verbatim).

## Findings by severity

- **Low (fragility, no claim impact):** `v3-a-m06`'s kill rides the `detailIncludes` prose pin alone; an equivalent rewording/reordering of the session-shape message would yield a false kill. Deliberate per the in-code comment; recorded, not a defect against C2's predicate.
- No medium/high findings. No collateral failures under either mutant; both kill cases are precise to their mutant.

## Residual risk / verification gaps

- The frozen counter was not run end-to-end (its pristine/neutral/decoy/twin legs are other seats' scope); kills here are direct applications of the counter's own find/replace bytes, so they are the same mutations by construction.
- Multi-mutant combinations (e.g. M06+M07) untested — the counter is single-point by definition.
- The M08 case carries no detail pin: if a future gate change made the context-shape refusal surface at a different reason code, the case could still catch the clean-flip but would no longer pin which check fired. Accepted; single-point scope.

## Deliverable paths

- Report: tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM06M08.md (this file)
- Receipts: tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM06M08/receipt-pristine.md, receipt-m06.md, receipt-m08.md
- Scratch /fast/scratch/hyaku/tabi-r34/RevKillsM06M08 deleted after receipts were copied.
