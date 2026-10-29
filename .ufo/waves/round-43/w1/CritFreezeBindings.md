# CritFreezeBindings — round 43 r5 attack

## Result

**Finding — calibration (C2, r5).** The required negative controls all produced their named findings, and all eight frozen bindings audit cleanly. However, two nearby in-model mutations still make the checker return `predicate: true` with zero findings:

1. **Incomplete bindings can green.** In a scratch fixture based on frozen revision `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`, I kept the first five valid bindings and left the rest of `claims.json` unchanged. C2 `beforeState` still names the three omitted controls (`c2-baseline-red-r43.json`, `c2-v0-probe.json`, and `c2-tree-fixture.json`). Since r5 checks only `binds.length < 5`, it accepted the five-binding set: exit 0, `predicate: true`, no r5 findings. This violates the frozen requirement to bind every named control.
2. **A quote fragment can green.** I replaced the first full quote with a 19-character substring taken from that quote, leaving the correct control hash. The fragment is present in the bytes but is not a quote line. The checker returned exit 0, `predicate: true`, zero findings; the implementation uses `raw.toString('utf8').includes(b.quote)` rather than whole-line equality.

These are false-green counterexamples to the freeze-binds-controls sentence, not merely malformed-input failures. A JSON-object `path` is a separate robustness issue: it crashes at checker line 196 (`TypeError: b.path.replace is not a function`, empty stdout, exit 1) instead of returning a named finding. It fails closed, so it is not the primary false-green finding.

## Requested mutation cases

All five requested variants produced their expected r5 finding:

| Mutation | Observed r5 finding |
|---|---|
| Correct digest, quote absent from control | `r5-binding-quote-absent` |
| Quote present, digest for different bytes | `r5-binding-sha-mismatch` |
| Four bindings | `r5-freeze-bindings-thin` (`only 4 controls bound, need >=5`) |
| Empty malformed path | `r5-binding-malformed` |
| Quote shorter than 8 characters | `r5-binding-quote-absent` |

A malformed traversal string also returned `r5-ctl-../outside-control-absent`.

At the frozen revision, all eight named control paths were present in `controlBindings`; all eight SHA-256 values matched their committed bytes, all quotes appeared as complete lines, and the checker SHA-256 matched the digest pin in `claims.json`. The scratch fixture's unmutated baseline returned exit 0, `predicate: true`, and zero findings.

## Smallest safe correction

Do not amend the frozen bytes. Route this as a finding. For a future checker, pin the frozen `claims.json` blob (so a later revision cannot silently omit bindings), require the binding path set to equal the controls named by the frozen claims, and compare each quote to a complete committed line rather than an arbitrary substring. Validate that `path` is a string before deriving its diagnostic tag.

## Evidence, commands, and limitations

- `w1/CritFreezeBindings/evidence/binding-audit.json` — frozen digest/quote audit, named-control set, baseline result, and first attack outputs.
- `w1/CritFreezeBindings/evidence/commands-and-output.txt` — exact invoked archive, fixture, commit, and checker commands with output.
- `w1/CritFreezeBindings/evidence/exact-case-results.json` — exact per-case fixture revisions, exit statuses, stdout and stderr.
- `w1/CritFreezeBindings/evidence/scratch-cleanup.txt` — cleanup error and successful cleanup command/output.
- Scratch-only fixture root was verified as `/fast/scratch/hyaku/tabi-r43/CritFreezeBindings/fixture` before fixture commits; scratch was removed before return. No source-repository git/jj mutation, commit, push, or install/update was performed. No tools were installed; Node was `v26.12.0`, Git was `2.56.0`.
- This was an r5 counterattack only; no C1 browser measurement was run. The checker and claims were read from the frozen commit and not edited.

VERDICT finding r5 accepts five of eight named controls and a non-line quote as green.
