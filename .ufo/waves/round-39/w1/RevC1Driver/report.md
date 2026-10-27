# RevC1Driver — C1 line review

## Scope and inputs
Reviewed the C1 claim in `.ufo/waves/round-39/claims.json` (session-bound Playwright Firefox egress), the frozen C1 and C2 counter source files, the round-39 instrument `scripts/playwright-firefox-egress-round39.mjs`, and the round-39 receipt. No files outside this seat's reports or scratch were changed. No tool installs. No live browser or loopback fixture was run; this is a source/receipt review, not a new measurement.

Claims require a nonempty owned tree rooted at a child of the driver, >=8 samples across >=1000ms, zero non-loopback observations on both `ss` and `/proc` including final sweep, zero survivors, closed fixture port, and live-session version binding. C1's counter checks some receipt fields but cannot make the underlying observations stronger than the driver implementation.

## Findings (severity order)

### High — Owned process membership is a one-time PID snapshot, not the sampled session tree
At `scripts/playwright-firefox-egress-round39.mjs:245-246`, the driver calls `ownedRoots(process.pid)` and `ownedTree(...)` once, before the session actions. That fixed `rec.owned.tree` is then reused for every periodic sample (`:268-271`) and the final sweep (`:329`). Firefox can spawn content/GPU/socket helper descendants after the initial snapshot; descendants created later are never added. Their sockets are therefore absent from both the `ss` PID filter and `/proc/<pid>/fd` scan while the receipt still advertises a complete session tree and can report zero egress. The source comment at `:9-13` claims a descendant walk per sample tick, but the implementation does not do that. This is a concrete false-negative path for browser-owned non-loopback sockets.

### High — The two required observation surfaces can be reported as zero when unavailable
`observeSs()` returns `null` for empty output at `:116-118`; `sampleSockets()` converts a null surface to a synthetic all-zero record with `unavailable: true` at `:218-225`. Empty `ss -Htnp` output can mean there are no matching TCP rows, but it can also result from command unavailability/permission or execution failure (`sh()` suppresses errors and returns empty stdout at `:73`). A readable `/proc/net/tcp*` alone makes the sample pass the driver's `both null` refusal (`:221`), while the C1 counter checks only numeric `nonLoopback` values (`c1-egress-session-bound.mjs:112-117`) and never rejects `ss.unavailable`. The final-sweep check likewise rejects only a missing/unavailable whole sweep (`:115-117`); a partial sweep with one unavailable surface and synthetic zero passes. Thus a receipt can claim zero observations on both surfaces without successfully observing one surface. This directly violates the frozen predicate's explicit dual-surface agreement.

### Medium — PID/argv matching does not prove executable identity and PID lifetime is not bound
`ownedRoots()` (`scripts/playwright-firefox-egress-round39.mjs:90-92`) selects a direct child solely because its `ps args` text contains `/ms-playwright/firefox-<digits>/`. It does not check `/proc/<pid>/exe`, process start time, or that the matching path is argv[0]; it records `args.split(' ')[0]` as `argv0` even when the matching path occurs later in arguments. This is not proof that the child is the Playwright-launched Firefox binary. Further, the tree stores bare numeric PIDs (`:94-111`) and later reads those PIDs without start-time identity. If a process exits and its PID is reused during the run, the replacement process can be attributed to the browser, or the real process can disappear between tree discovery and socket sampling. That is a concrete PID-reuse/reparenting race; no revalidation is performed before accepting samples or the final sweep.

### Medium — Sampling coverage counter is elapsed wall time, not proof of >=1000 ms of live samples
`t0` is set at `:266`; `coverageMs` is computed only after the `finally` block's `POST_CLOSE_TAIL_MS` sleep (`:315-321`), although `clearInterval(sampler)` runs before the 600 ms tail (`:317-319`). The counter checks `coverageMs >= 1000` and `sampleCount >= 8` (`c1-egress-session-bound.mjs:110-111`) but does not check sample timestamps span 1000 ms or that the observation interval remained active for that span. A short live window can be padded by the post-close tail (and the recorded `coverageMs` then overstates the live sampling interval). The counter also accepts fabricated or internally inconsistent counts because it verifies receipt fields rather than executing the instrument.

## Falsifier answers
1. **Late-descendant socket false negative:** after the initial owned-tree snapshot, a Firefox content/helper process is spawned with a non-loopback socket. It is not in `rec.owned.tree`; every `ss` filter and `/proc` lookup only scans the old PID list, so the receipt can still report zero. The source explicitly snapshots once before navigation and never refreshes it.
2. **Unavailable-`ss` false zero:** make `ss` unavailable or have it yield empty stdout while `/proc/net/tcp*` remains readable. `observeSs()` yields null; the sampler records synthetic `ss.nonLoopback: 0`; the other surface prevents refusal; the counter sees `0` and does not check the `unavailable` marker. Hence the frozen counter may admit a receipt lacking the required `ss` observation.
3. **PID reuse (additional):** an owned process exits and its PID is reused before a subsequent sample; bare PID membership and `/proc/<pid>` reads treat the replacement as owned. There is no `(pid,starttime)` identity or executable re-check, so the observations are no longer session-bound.

## C2 / frozen counter context
The initial requested inputs were read: claims and both counter files. The C1 counter's source confirms it checks receipt claims rather than re-running the browser (`:11-17`), which makes the driver gaps decisive. The C2 counter was read only as a frozen-input prerequisite; no C2 judgment was made in this seat.

## Verification and gaps
- Reviewed exact source ranges: instrument lines 73-225, 229-341, 344-384; C1 counter lines 50-140; C2 counter opening/predicate lines 1-63; claims JSON; round-39 receipt summary.
- The receipt currently records two runs with `coverageMs: 1560`, `sampleCount: 9` for run1 and zeros for reported egress, but those fields do not cure the source-level false negatives above.
- No dynamic falsification fixture was executed and no live socket/process evidence was captured. This is an explicit verification gap, not evidence that these paths occurred in the recorded runs.
- LSP: `xd://lsp` was unavailable in the mounted tool list; line references below are from the reviewed source text, not semantic LSP analysis.
- Scratch setup created `/fast/scratch/hyaku/tabi-r39/RevC1Driver`; it was removed before completion. No install/update occurred.

## Commands and outputs
- Read `.ufo/waves/round-39/claims.json`: observed schema `tabi-round-claims-v2`, C1 predicate, and frozen source digests.
- Read `scripts/playwright-firefox-egress-round39.mjs:1-384`: observed one-time tree snapshot at lines 245-246, socket surfaces at 116-225, sampling lifecycle at 265-341.
- Read `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs:1-168`: observed numeric counter checks at lines 112-120 and no unavailable-marker check.
- Read `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs:1-63` and `corpus/evidence/round-39/playwright-egress/receipt.json`: inputs reviewed; no C2 verdict.
- Read `skill://godspeed` and `/home/vgpnk/.omp/agent/RULES.md`; no tools installed.

VERDICT finding — C1 is falsified by stale process-tree membership and acceptance of an unavailable `ss` surface; dynamic occurrence in the recorded run was not tested.
