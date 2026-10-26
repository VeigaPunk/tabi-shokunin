# CritC2Axis — C2 claim attack (round 34, w1)

**Attacked:** C2's predicate "the self-test kills all 20 frozen mutants". **Verdict: defect (high) — target
unreachable; 17/20 is the ceiling.**

**Verdict, one paragraph.** C2's target is **unreachable as frozen**. Three of the twelve baseline
survivors — **M04, M05, M06** — are equivalent mutants on the only surface the gate's self-test can
observe: `runSelftest()` compares `exit`, `admitted`, `population` and `reason` and never reads
`detail` (`scripts/check-bidi-runtime.mjs:1107-1109`). M04's path-distinctness rule can only fire when two
runs cite the same path, which at one rev forces the same blob and therefore the same sha256 the intact
sha rule already rejects (same `reason` `t1-receipt`, same exit 1, same admitted 0, `:797-798`); M05's sha
rule can only fire when two runs' transcripts are byte-identical, which forces one sessionId and therefore
the intact sessionId-distinctness rule already rejects (`:811`); M06 relaxes `SESSION_ID` to admit uppercase
hex, but the very next rules — `WS_SESSION` (lowercase `[0-9a-f]{32}` only, `:148`) and the
`webSocketUrl`↔`sessionId` equality (`:388`) — reject every uppercased session id with the same
`t1-receipt` outcome. I built the runner's fixtures with the pristine gate and with each mutant and measured
it: **not distinguishable** for M04/M05/M06, **distinguishable** for the other nine survivors (M01, M03, M07,
M08, M09, M10, M16, M18, M19). So the maximum kill count under the allowed diff ("added self-test
cases/fixture options only") is **17 of 20**, `survivors` can never be 0, and the counter's predicate stays
false. The do-nothing control is not the reason: the frozen counter at the baseline reproduces exactly the
claimed "before" (killed 8, survivors 12, exit 1). The claim's `feasibilityDisclosed` names the wrong two
risks — M03 and M10 are both killable and honest (an entry cell `Yes` is admitted by the pristine gate; the
honest round-32 driver imports `serveFixture` at `scripts/bidi-loopback-round32.mjs:31`) — while the actually
unreachable three are undisclosed. Under the claim's own clause ("if one turns out equivalent … the target is
missed, not narrowed") C2 must stop honestly; in kind the move is a genuine **operability** delta (a runnable
check gains a refusal control over a disabled rule), not test hygiene, but it is an operability delta of
17 sites, not 20.

## Findings

### F1 — BLOCKING (defect, high): M04, M05, M06 are equivalent for any case the self-test can express

The runner's comparison surface (verbatim, `scripts/check-bidi-runtime.mjs:1107-1109`):

```
const reason = out.entryFinding || (out.rows.find((r) => !r.admitted) || {}).reason || null;
const pass = exit === c.exit && out.admitted === c.admitted && reason === c.reason
  && (c.population === undefined || out.population === c.population);
```

A CASE carries only `{id, exit, admitted, reason, population, build}`; `detail` is produced but never
compared (`:860` sets `admitted`; `:867` sets `clean`). Code-order proof, one mutant at a time:

- **M04** (`:797` disabled). The rule is reachable only when `new Set(paths).size !== paths.length`, i.e. two
  runs cite the same `transcript` path. `runs[].sha` is `sha256(blob(repo, rev, path))` (`:789-792`), so at one
  rev the same path is the same blob is the same sha: the intact `else if` at `:798` fires with
  `reason="t1-receipt"`, `admitted=0`, same `exit`. Every other fixture shape leaves the path rule
  un-triggered in both gates. Only `detail` differs.
- **M05** (`:798` disabled). The rule is reachable only when two shas repeat, i.e. the blobs are byte-identical.
  Byte-identical transcripts carry the same classic new-session body, so the same `sessionId`, which the intact
  pairwise-distinctness check at `:811` rejects — again `t1-receipt`, `admitted=0`, same exit. Only `detail`
  differs (pristine "transcript sha256 repeated…" vs mutant "sessionId repeated…").
- **M06** (`:145` relaxed to `[0-9a-fA-F]`). It can change an outcome only for a sessionId containing an
  uppercase hex letter. The ws URL is built from that session id and `WS_SESSION` accepts lowercase only
  (`:148`), while an equal-but-uppercase URL segment fails the binding equality (`:388`). Both paths set
  `t1-receipt` before admission, exactly as pristine's `SESSION_ID` rejection does. Only `detail` differs.

Measured (harness below; `exit/admitted/population/reason`, pristine vs mutant on the same fixture):

| scenario | mutant | pristine | mutant | distinguishable |
|---|---|---|---|---|
| samePath | M04 | 1/0/16/t1-receipt | 1/0/16/t1-receipt | **no** |
| sameBytes | M05 | 1/0/16/t1-receipt | 1/0/16/t1-receipt | **no** |
| uppercase-sid | M06 | 1/0/16/t1-receipt | 1/0/16/t1-receipt | **no** |
| uppercase-sid + lowercase url | M06 | 1/0/16/t1-receipt | 1/0/16/t1-receipt | **no** |
| dup-two-rows | M01 | 1/0/2/x3-duplicate-id | 0/2/2/- | yes |
| **`Yes` Measured cell** | **M03** | **0/16/16/-** | **1/0/16/-** | **yes** |
| lowercase context id | M08 | 1/0/16/t1-receipt | 0/16/16/- | yes |
| ws url names another session | M07 | 1/0/16/t1-receipt | 0/16/16/- | yes |
| driver imports `ROWS` | M09 | 1/0/16/t1-receipt | 0/16/16/- | yes |
| driver imports `serveFixture` | M10 | 0/16/16/- | 1/0/16/t1-receipt | yes |
| Gate row without 64-hex sha | M16 | 1/0/16/s1-source-row | 0/16/16/- | yes |
| all rows `no` (unmeasured) | M18 | 1/0/1/- | 0/0/1/- | yes |
| two runs, one sessionId, distinct bytes | M19 | 1/0/16/t1-receipt | 0/16/16/- | yes |

Control: the `golden` fixture evaluates `exit 0, admitted 16, population 16` through the pristine gate,
matching the existing `golden-two-runs` CASE expectation — the harness reproduces the runner, it does not
invent a surface. Kill count ceiling: 8 already killed + 9 distinguishable = **17 of 20**; `survivors` ∈
{M04, M05, M06} at best; counter predicate false.

### F2 — do-nothing control: not the cause (answered: no)

The frozen counter at the baseline was run (below): `predicate false`, `killedCount 8`, survivors
M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19, `unappliable []`, `twinsFailing []`, pristine/neutral/decoy
exit 0, battery predicate true, exit 1. The claim's `before` is faithful; F1 is about the target, not the
instrument. (The claim states the target to be a move, not reachable by doing nothing — correct; it is
unreachable by doing everything allowed.)

### F3 — axis classification: operability in kind, not test hygiene — but 17/20, not 20/20

The object is the gate's source; the observable is a runnable check's exit code. After the change,
`--selftest` **refuses** a gate whose rule is disabled (exit 3 + `CASE … FAIL`) where it previously read
clean — a differential/refusal control on a runnable check, which is this lane's operability vocabulary
(`SCORECARD.md:603` counts "real supported/refusal/differential controls"; `SCORECARD.md:97` operability =
re-runnable receipt checks). Test hygiene would be the label if the added cases only widened path coverage
without changing the check's outcome on a broken artifact; here the outcome on a broken artifact changes, so
the delta is operability. Two caveats bound it: (a) the delta exists only at sites the runner can observe —
F1 removes three; (b) the fleet's own precedent treats gate-mutant claims as operability claims with exactly
this failure mode — `.ufo/l0-questions.md:118` (kumitate r43: "gate-mutants operability claim … junk controls
with no real verdict path read CLEAN"), read-only, not authority for this lane.

### F4 — sourcing (defect, medium): no S130+ row exists; the only reachable id-shape kill case is M08's, and its ground is a chain

At the freeze `corpus/SOURCES.md` has **129 rows, highest S129** (verified in the clone); S130+ is exactly the
L1's work this round, so the entry's `s1-source-row` leg can only pass after that. The claim assigns the
id-shape kill cases to "the BiDi browsingContext id shape (upper-case 32 hex) and the session id shape
(S127)"; the facts are: **S127** (`util.cc` `%016" PRIx64`) grounds *lower-case 32-hex session ids* and bears
on **M06 — which is unkillable (F1)**, so the S127 leg can never be a kill case; the *upper-case 32-hex
browsing-context* shape has **no registry row** at all — the lane asserts it from its own receipts
(`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:91`, "honest contexts are 32 uppercase hex";
`corpus/knowledge/cdp-evidence-patterns.md:48`, observed target id `38204F3DC6886277C5D400107604A825`) and
from the gate's own comment (`scripts/check-bidi-runtime.mjs:146`). Probes for a single public file that
states it failed to land (log below): `base/types/id_type.h` at the tag has no formatting at all;
`DevToolsAgentHostImpl::GetId()` returns a stored opaque string (`content/browser/devtools/devtools_agent_host_impl.cc:387`);
the mapper file I tried answered 404 and another Chromium file 503. So the M08 case's authority is a chain
(BiDi `browsingContext` id = CDP target/frame id → Chromium's uppercase 32-hex formatting), and a row that
merely restates the lane's observed shape would be false provenance — the exact thing the `s1` Gate-row rule
exists to stop. Smallest correction: the L1 must open S130 against a file that *states the browsingContext id
shape mints as uppercase hex* (mapper mapping + id formatting, pinned), and the entry must cite it; if no such
single-chain source is found, the M08 case is unsourced and C2's "sourced" step fails with it.

### F5 — M03 and M10 (answered: neither is equivalent)

- **M03**: yes, an honest input admits an upper-case verdict. An entry whose Measured cells read `Yes` is
  parsed by `MEASURED` (`/i`, `:149`), lower-cased at `:373`, and admitted by the pristine gate —
  fixture-measured `exit 0, admitted 16`. Under M03 the same entry yields `exit 1, admitted 0, reason null`
  (no row finding: `Yes` is not `no` and not `yes`-equal, so the row is silently un-admitted). Killable with
  a case, no runner change. **But** this pins an undocumented leniency: the header prose says a row must be
  "a bare `yes` … `no`" (`:38-39`) while the code is case-insensitive; the case freezes the code over the
  prose. Low severity: acceptable only if recorded as a limit, because the allowed diff forbids the header
  edit that would reconcile them.
- **M10**: not equivalent — an honest driver *does* import `serveFixture`:
  `scripts/bidi-loopback-round32.mjs:31` `import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";`,
  and that file is the round-32 receipt's driver (`corpus/evidence/round-32/bidi/receipt.json` →
  `"driver": "scripts/bidi-loopback-round32.mjs"`). Dropping it from `DRIVER_ALLOW` refuses a genuine receipt
  (the round-33 battery killed M10 on exactly `honestH0/H1/H2=false`). A fixture driver importing that line is
  admitted by pristine (`0/16/16`) and refused by M10 (`1/0/16/t1-receipt`) — killable.
- Consequence: the claim's `feasibilityDisclosed` names M03/M10 as the two that might be equivalent; both are
  fine, and the three that are not (M04/M05/M06) are undisclosed. That disclosure is not merely stale — it
  points the wave-2 read at the wrong sites.

## Evidence (commands, exit codes, file:line)

All git work in my scratch clone `/fast/scratch/hyaku/tabi-r34/CritC2Axis/clone` (`git rev-parse --show-toplevel`
= that dir), detached at the freeze `59f1b47aae277e1670e4a824173da8cde7e388ee`.

```
git clone -q --shared …/tabi-shokunin $S/clone; git -C $S/clone checkout -q --detach 59f1b47a…   # exit 0
sha256sum $S/clone/scripts/check-bidi-runtime.mjs
  eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1   # == the claim's baseline gate sha
sha256sum .ufo/waves/round-34/counters/c2-gate-mutants.mjs
  3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82  # == frozenDigests
node --version   # v24.21.0
```

**Frozen counter at the baseline** (claim's own instrument, unmodified bytes; TMPDIR under scratch, cwd = the
clone; `--repo` = the clone):

```
TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --repo "$S/clone" \
      --rev 15dfaccb34601c2d221c78501e2befd8998d600c --json
→ EXIT 1 (evaluated, predicate not met); predicate=false killedCount=8 survivors=[M01 M03 M04 M05 M06 M07
  M08 M09 M10 M16 M18 M19] unappliable=[] twinsFailing=[] pristine=0 neutral=0 decoy=0 battery={exit:0,
  predicate:true}          # receipt: CritC2Axis/counter-baseline.json
```

**Equivalence harness** (`CritC2Axis/harness-equivalence.mjs`): imports `evaluate`/`goldenLines` from the
pristine gate and from one-mutant-patched copies, builds each fixture exactly as `runSelftest()` does
(same `regDoc`/`entryDoc`/`lessonsDoc`, same receipt shape, same `makeFixture`), evaluates the same repo/rev
at both gates, and compares the runner's quadruple.

```
TMPDIR=$S/tmp node $S/harness-equivalence.mjs   → EXIT 0
  golden (pristine): 0/16/16/-        # == CASES golden-two-runs, runner reproduced
  samePath M04 → distinguishable=false;  sameBytes M05 → false;  uppercase-sid M06 → false;
  uppercase-sid+lowercase-url M06 → false
  M01, M03, M07, M08, M09, M10, M16, M18, M19 → distinguishable=true
  receipts: CritC2Axis/equivalence-run.json, CritC2Axis/equivalence-table.tsv
```

**Line evidence in `scripts/check-bidi-runtime.mjs` (freeze bytes `eded1be0…`)**: `:145` SESSION_ID,
`:146` CONTEXT_ID, `:148` WS_SESSION, `:149` MEASURED `/i`, `:373` `toLowerCase()`, `:388` ws↔sid binding,
`:789-792` blob→sha per run, `:797-798` path-then-sha distinctness, `:811` sessionId distinctness,
`:860` admission, `:867` clean guard, `:1035` `runSelftest`, `:1107-1109` pass predicate (no `detail`).
Honest driver import: `scripts/bidi-loopback-round32.mjs:31`; receipt driver:
`corpus/evidence/round-32/bidi/receipt.json`.

**Network probes** (read-only GETs, recorded in `CritC2Axis/fetch/fetchlog.tsv`; UTC / status / bytes / sha256):

```
2026-10-26T19:53:22Z 200  8296  39a8d0472cedfa17aba25755e49b0b5e1a4f4f025f9a09ee0e6e1382929a17aa
  https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/types/id_type.h?format=TEXT
  → no id formatting in the file (IdType is a StrongAlias wrapper; no PRIx/PRIX/hex), see fetch/id_type.h.txt
2026-10-26T19:53:34Z 200 28256  9da2afef05a9de35b8435c3314c1dd4a5b4d62ba5291df70e1ca3119afa77336
  https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/browser/devtools/devtools_agent_host_impl.cc?format=TEXT
  → :387 GetId() returns the stored opaque string; no shape production there
2026-10-26T19:53:39Z 404    14  https://raw.githubusercontent.com/GoogleChromeLabs/chromium-bidi/main/src/bidiMapper/modules/browser/BrowsingContextImpl.ts
  → body text "404: Not Found" (recorded as text, not sha), fetch/BrowsingContextImpl.ts.404.txt
2026-10-26T19:57:32Z 503  1459  aa3a9d3dae5552661b8ec5f20cbd82d7c3b358988d515b239bcd9700ca7d3ddc
  https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/browser/devtools/render_frame_devtools_agent_host.cc?format=TEXT
  → 503 body, fetch/render_frame_devtools_agent_host.cc.503.html
```

Nothing claimed as passed was unrun. No browser was launched; no tool installed or upgraded; no lane tracked
file, lane index/jj state, fleet file, sibling repo or `shokuknow` was written; the lane checkout was never
executed. Writes: this report, `CritC2Axis/`, and the scratch clone (deleted at yield, receipts copied).

## Impacted axes

- **operability (C2, 9)**: no move can be claimed under the frozen predicate — ceiling 17/20, `survivors ≥ 3`
  by construction. Any report that reads `predicate true` would require a runner change the noHarmRule
  forbids ("scripts/check-bidi-runtime.mjs changes only by added self-test cases/fixture options; its rule
  lines … stay byte-identical").
- **adjacency (C1, 8)**: untouched by this finding.
- **calibration / freshness / depth / coverage**: untouched. The round-33 battery's no-harm leg is unaffected
  (mutant-equivalence is about the self-test, not the battery).

## Smallest safe correction

1. **Honest stop on C2's target (compliant this round).** Withdraw the "survivors 0 of 20" target, record the
   three equivalence proofs (F1) as limits in the round lesson, and note the disclosure error (F5). What can
   still be delivered within the allowed diff — nine new cases killing M01, M03, M07, M08, M09, M10, M16, M18,
   M19 — is a 9-of-12 coverage gain and a real refusal-control delta, but it does **not** meet the frozen
   predicate, so it must be reported as a partial with the predicate false, not as the axis move.
2. **Only if the L1 re-freezes before data:** add one compared field to the runner (`&& (c.detail === undefined
   || out.rows[0]?.detail === c.detail)` at `:1108`) plus the three detail-asserting cases; that kills M04,
   M05, M06 (each differs in `detail` only). This exceeds "cases/fixture options only", so it needs an explicit
   claim amendment and a new counter digest before any data is produced — not a post-freeze narrowing.
3. **Sourcing:** either open S130 against a source that states the browsingContext id shape (F4) so the M08
   case is grounded, or drop the "sourced" label — S127's fact (M06) is unkillable and cannot carry it.

## Deliverable paths

- Report: `.ufo/waves/round-34/w1/CritC2Axis.md` (this file)
- `.ufo/waves/round-34/w1/CritC2Axis/harness-equivalence.mjs` — harness (imports `evaluate`/`goldenLines` from
  pristine + patched gate copies; fixture builder mirrors `runSelftest`)
- `.ufo/waves/round-34/w1/CritC2Axis/equivalence-run.json`, `…/equivalence-table.tsv` — per-scenario quadruples
- `.ufo/waves/round-34/w1/CritC2Axis/counter-baseline.json` — frozen C2 counter at the baseline (exit 1)
- `.ufo/waves/round-34/w1/CritC2Axis/mutants.json` — the 20 find/replace pairs extracted from the frozen counter
- `.ufo/waves/round-34/w1/CritC2Axis/honest-driver-import.txt` — `scripts/bidi-loopback-round32.mjs:31`
- `.ufo/waves/round-34/w1/CritC2Axis/fetch/` — `fetchlog.tsv`, `id_type.h.txt`,
  `devtools_agent_host_impl.cc.txt`, `BrowsingContextImpl.ts.404.txt`,
  `render_frame_devtools_agent_host.cc.503.html`
