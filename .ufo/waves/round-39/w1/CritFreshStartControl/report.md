# CritFreshStartControl — round 39 do-nothing controls

Axes: **coverage** (C1 session-bound Playwright Firefox egress capability), **calibration** (C2 closure of round-38 routed residuals). Review focus: whether claimed progress requires new capability/instrument enforcement rather than a rerun or count-only fixture; apply run-10 fresh-start discipline.

## Evidence reviewed

- Frozen claims at `.ufo/waves/round-39/claims.json`, freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81d196caeb8d24551928b883802697aabb`: C1 requires v2 receipt, two unrefused runs, same first-shot hash, each owned tree nonempty and rooted under driver, >=8 socket samples/run and >=1000ms, zero nonloopback on both `ss` and `/proc` including post-close sweep, zero survivors, closed fixture port, live-session Firefox version, and refusal of round-38 v1 receipt. C2 requires the old routed-defect re-derivations plus actual sentence-mutant refusal, parsed census equality, and numstat bytes matching baseline..REV.
- Both frozen counters read: C1 explicitly says it verifies committed receipt internals and refuses round-38 v1; it does not rerun browser. C2 D7 performs the refusal on mutated claims and requires recorded observed run fields; D5 parses SOURCES, D6 independently derives numstat.
- Prior closure evidence: `corpus/lessons/round-36.md` records C2 measured predicate true while receipt observed fields were not consumed and notes the independent receipt evidence limits; `corpus/lessons/round-37.md` records counter-v2 controls admitted graft/tamper, whereas v3 refuses them, and explicitly documents do-nothing old instruments admit attack fixtures. `corpus/lessons/round-38-verifier-spotcheck.md` records C1 coverage unprovable: global executable grep, too few/short samples, empty PID set not refused, null Firefox version; C2 calibration false because M3 receipt absent and D6 measured through stale `0930a6b`, not final tip. `corpus/lessons/round-38.md` confirms the failed attempted M3 fix and absent receipt.
- The round-38 v1 receipt itself has `firefoxVersion: null`; v2 receipt currently observed at `corpus/evidence/round-39/playwright-egress/receipt.json` is schema v2, with run1 9 samples/1560 ms, version 157.0, zero survivors, port closed, and aggregate binding true. This shows a potentially distinct evidence shape, but receipt presence/shape alone does not establish frozen counter pass or independently sourced live process/socket observations.
- Run-10 rule (`corpus/lessons/round-10.md`) emphasizes re-deriving facts from committed bytes, a cited verifier is not a verifier landed, counts need command/read-time, and falsifiers must discriminate rather than merely repeat success. Its historical 32-lane shape is not relevant to this v2 wave's frozen 64-seat limit; avoid treating fresh-start wording as an excuse to waive claims or import an unrelated seat-count predicate.

## Counterexample / risk

A superficial “do-nothing” for C1 could copy/replay the round-39 receipt or fabricate a count-only fixture with two matching screenshot hashes and asserted counts. If the counter trusts receipt fields without binding them to the driver/session or requiring observed process/socket records, it may admit without new capability; this is exactly the round-38 failure class. A superficially count-only C2 fixture can also pass a census/numstat check if it merely repeats stated counts/body, unless D5/D6 compare against independently parsed SOURCES and `git diff` at exact REV, while D7 requires an actual nonzero counter invocation against changed predicate bytes. Existing frozen predicates and counter descriptions explicitly specify those discriminants, but this review did not execute crafted fixtures or the counters; so I cannot assert those controls actually refuse.

## Smallest safe correction

Keep do-nothing controls tied to prior committed round-38 v1 receipt and the actual frozen v2 counter invocation; require observable refusal output/exit plus distinct reason, and preserve immutable run-10 fresh-start practice: exact command, revision, raw output and read time. For any count-only attack, mutate/remove the underlying evidence while retaining reported counts; require refusal from independent raw evidence derivation. Do not count copied receipt fields, a fixture count, or rerunning old browser capability as C1 advancement. For C2, test the frozen counter against a one-byte predicate mutation and a stale/mismatched numstat window, with actual exit and receipt provenance; reported tally alone is not enough.

## Commands and observed output

- `read skill://godspeed` → loaded Godspeed posture.
- Read `.ufo/waves/round-39/claims.json` → freeze/baseline and predicates above.
- Read `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` → frozen comments state receipt verification/no browser rerun and v1 refusal; predicate sentence listed.
- Read `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` → frozen comments state D1–D7 semantics and mutant invocation.
- Read `corpus/lessons/round-{36,37,38}.md`, `corpus/lessons/round-38-verifier-spotcheck.md`, `corpus/lessons/round-10.md` and both receipts as listed above.
- Attempted `read .../corpus/lessons/round-10*` → path not found (glob is not a read selector); located and read exact `round-10.md` thereafter.
- No counter, fixture, browser, or live instrumentation command was executed. No tool installed.

Evidence path: `.ufo/waves/round-39/w1/CritFreshStartControl/report.md`.
VERDICT finding — historical C1 false-positive mode is materially targeted by frozen predicates but actual refusal was not exercised here; guard against receipt/count-only replay with mutation fixtures and observed counter runs before accepting coverage or calibration.