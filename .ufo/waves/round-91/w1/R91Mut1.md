# R91Mut1 — independent mutation sweep (C1 proxy counter, C2 record-drift gate)

Seat: mutation-tester, round 91 wave `w1`. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`
at base `b1d8f07b`, instrument freeze D1/D3 (`sha256` per `.ufo/waves/round-91/freeze.txt`).
Scratch root `/fast/scratch/hyaku/tabi-r91/R91Mut1` (all mutants were copies written there; the
lane files were only read). Node v24.21.0. No tool installed or upgraded; no pacman transaction.
No git/jj command was run. Judge/other-runtime: none.

**Restoration evidence.** The two instruments were never written. Their sha256 before and after the
whole sweep are identical and equal the freeze pins:

```
f2f052f27c3a0e18ecef3217fc902c2897c59ab9f175d314ba66d526a7edb03e  scripts/check-showpicker-proxy-round91.mjs
e2e51c6b50e24cfb7b4991ccbdddc9e375dc73a6de8e7ab4aa95893fd62ffda3  scripts/check-record-drift-round91.mjs
6475f056ba9d0a868274c0047337a6c61736415b39ace5bd907a41e135fe78cb  scripts/negatives-showpicker-proxy-round91.mjs
```

## Detectors and counting commands

Baselines reproduced before any mutant was scored (all green):

```
# C1 positive control (scored receipt, frozen pins, 30 checks)
node scripts/check-showpicker-proxy-round91.mjs --lane <ABS lane> \
  --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json \
  --expect-driver-sha256 343eb0f202d9b37a21d948adf0f5eff84fbebf8c195ab99c272fd66580e33015 \
  --expect-nonce tabi-r91-l1-1d073adc0b8d \
  --expect-parent-sha256 a6ecf367adcfd31e3e54e82794db09e2f9845b8d910eb465ab47ca022b778bf0 \
  --expect-same-sha256 01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36 \
  --expect-child-sha256 01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36 \
  --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json      -> exit 0, clean, 30 checks

# C1 frozen battery against each mutant (the kill detector)
node scripts/negatives-showpicker-proxy-round91.mjs --lane <ABS lane> --real <scored receipt> \
  --expect-* <same five pins> --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt \
  --work <scratch> --counter <mutant.mjs> --json                        -> 44 cases, 0 failed on pristine

# C2 green lane and the gate's own causal fixture
node scripts/check-record-drift-round91.mjs --lane <ABS lane> --json    -> exit 0, clean, 8 checks
node scripts/check-record-drift-round91.mjs --selftest --json           -> exit 0, ok, 8 causal cases

# C2 red fixture (statement must be red): a 9-file fixture lane copied from the lane with ONE
# defect injected, run against the mutant:   node <mutant.mjs> --lane <fixture> --json
```

Mutant scoring convention: **killed** = the frozen detector distinguishes the mutant from the
pristine instrument; **survived** = the detector accepts it. Clean receipt / green fixture must
still pass under the mutant (no baseline breakage): 0 mutants were rejected on the clean baseline,
0 unapplied (every edit string matched exactly once), 0 crashes.

## C1 — `scripts/check-showpicker-proxy-round91.mjs`

40 clause-level mutants (P01–P40), each weakening exactly one clause across the named families:
proxy result/law, proxy log/reply, same-element, chooser frame/binding/shape, activation
parent/child, state parent/child/answer, event shape, send-log allowlist, plan-calls, prior-set,
replay-identity, host/teardown, frame-tree/context/leg-marks/run-window.

| verdict | n |
|---|---|
| killed by the frozen 44-case battery | **13** |
| survived (battery accepts the weakened counter) | **27** |
| crashed / unapplied | 0 / 0 |

### Killed (13) — and whether the kill is real

| id | clause weakened | battery case that failed | mutant's findings on that case | attribution |
|---|---|---|---|---|
| P03 | proxy log: parent origin no longer checked | `proxy-log-origin` | none (counter clean) | **own clause** |
| P09 | same-element: per-leg copy compared on the SO record only | `same-element-leg` | none | **own clause** |
| P12 | chooser binding: `afterSendId` window widened to any id ≥ 0 | `chooser-binding` | none | **own clause** |
| P17 | state: parent input may hold a file ≤ 1000 bytes | `state-parent` | none | **own clause** |
| P25 | send-log allowlist: any `Runtime.evaluate` under 4 KiB accepted | `send-log-expression` | none | **own clause** |
| P35 | host argv: chromium argv equality dropped | `argv` | none | **own clause** |
| P39 | leg-marks: post-close counts only need to be non-negative | `leg-marks` (+11 more cases) | none | **own clause** (12/44 cases fail; case-level attribution for the 11 extra cases unresolved — see Unfinished) |
| P40 | run window: 30 s minimum dropped | `run-window` | none | **own clause** |
| P01 | LAW `w.proxy` compared on the `ok` flag only | `law-proxy-message` | `prior-set` | **sibling** |
| P11 | chooser frame: only the 32-hex shape is checked | `chooser-frame` | `prior-set` | **sibling** |
| P14 | activation: parent before-state only | `activation-parent` | `prior-set` | **sibling** |
| P16 | state: non-answer child state only red for an answer-named file | `state-child` | `prior-set` | **sibling** |
| P33 | prior set: law reproduction no longer required | `prior-laws` | `law`, `proxy-law` | **sibling** |

**Calibration finding (C1).** 5 of the 13 kills are not the clause under test: the forged receipt
changes `lawOf()` (proxy/direct/cross value, chooser frame, activation pair, child state), so
`prior-set` fires and the counter exits 1 although the mutated check itself is green. The battery
case only "fails" because its `expect` id is missing from the findings. A clause-level weakened
counter is therefore refused by the counter but not by the case that names the clause.

### Survived (27) — every survivor with the clause it weakens

`gap` = the mutated check is green on a defect only that clause guards and nothing else catches it:
the frozen battery has **no case exercising the clause**. `redundant` = the defect is still refused
by another conjunct/check, so the weakening is invisible to the battery.

| id | clause weakened | class | what still catches it |
|---|---|---|---|
| P04 | proxy log: echoed `target` unchecked | gap | — |
| P05 | proxy log: exactly-one-request cardinality dropped | gap | — |
| P06 | proxy reply: reply `origin` (parent-addressed) unchecked | gap | — |
| P07 | proxy reply: payload compared on `ok` only | gap | — |
| P02 | proxy shape: `proxy.target`/`proxy.origin` binding dropped | redundant | `law` |
| P08 | same-element: iframe element **rect** not compared | gap | — |
| P10 | same-element: parent pad element `type: file` unchecked | gap | — |
| P13 | chooser shape: `params.mode` enum unchecked | gap | — |
| P15 | activation: child after-state only | redundant | `prior-set` |
| P18 | answer: child file descriptor **size** unchecked | redundant | `prior-set` |
| P19 | answer: `DOM.setFileInputFiles` `backendNodeId` binding dropped | gap | — |
| P20 | answer: delivered file `sha256` only needs 64 chars | gap | — |
| P21 | event shape: parent pad sequence only needs ≥ N events (order/dedup dropped) | redundant | same `event-shape` check |
| P22 | event shape: child pad sequence only needs ≥ N events | redundant | same `event-shape` check |
| P23 | event shape: pointer `act` flag dropped from the trust demand | redundant | same `event-shape` check (isTrusted half) |
| P24 | event shape: event key set only needs ≥ 8 keys (extra keys allowed) | gap | — |
| P26 | send-log: CDP command ids need not be monotonic 1..n | gap | — |
| P27 | send-log: frozen prologue order unchecked | gap | — |
| P28 | send-log: intercept may be enabled more than once | redundant | `plan-calls` |
| P29 | send-log: `Page.navigate` URL compared against itself | gap | — |
| P30 | plan calls: ordered action sequence only needs ≥ N actions | gap | — |
| P31 | plan calls: answer `setSendId` only needs to be an integer | gap | — |
| P32 | prior set: "at least two priors" relaxed to one | gap | — |
| P34 | replay identity: per-leg launch-token uniqueness dropped | gap | — |
| P36 | teardown: port probes only need to be named, not `closed` | gap | — |
| P37 | frame tree: cross-origin `childFrameId` binding dropped | gap | — |
| P38 | context binding: execution-context origin only needs loopback shape | gap | — |

**C1 verdict: NOT verified at clause granularity.** The claim's leg (b) says "kill power leaves
0 survivors, 0 crashed, 0 unapplied (32 mutants)". That is true of the frozen 32-mutant list only;
an independent 40-mutant clause sweep leaves **20 battery gaps** and 7 further weakenings that are
survivable because the same defect is caught elsewhere. The 30-check counter is much stronger than
its 44-case battery: several checks (reply origin, log cardinality, answer sha/binding, chooser
mode, send-log prologue/navigate/ids, plan sequence, prior count, replay token uniqueness, teardown
`closed`, context origin, frame-tree xo binding) have no case that exercises them. The counter still
scores the scored receipt clean (30/30, exit 0), so the predicate's pass is unaffected — what is
unfalsified is the battery's kill power, not the counter's verdict.

## C2 — `scripts/check-record-drift-round91.mjs`

13 mutants (D01–D13), each weakening one conjunct of one of the eight statements; detector is a
9-file fixture lane copied from the lane with exactly one defect injected (statement must be red).
Green fixture and the real lane must still exit 0. All 13: clean fixture exit 0, real lane exit 0.

| id | statement / clause weakened | red-fixture verdict | gate `--selftest` |
|---|---|---|---|
| D01 | 1 — knowledge note need not name `send-log-allowlist` | **killed** (mutant returns clean) | killed |
| D02 | 1 — LOG r90 entry need not name it | **killed** | survived |
| D03 | 1 — QUALITY 163 need not name it | **killed** | survived |
| D04 | 2 — LOG `226 cases` numeral unchecked | **killed** | survived |
| D05 | 2 — stale `(225 cases, coverage` no longer rejected | **killed** | survived |
| D06 | 3 — lesson correction need not name `frozen-control-numeral` | **killed** | survived |
| D07 | 3 — QUALITY row need not name the superseded 161 | **killed** | killed |
| D08 | 4 — r90 lesson need not carry tip `3e6cf40f` | **killed** | killed |
| D09 | 5 — re-freeze section need not point at `§Wave corrections` | **killed** | killed |
| D10 | 6 — counted `17-word` replacement unchecked | **killed** | survived |
| D11 | 7 — gate-run artifact need only name one gate | **killed** | survived |
| D12 | 8 — C-row count need not tally with `claims.json` (extra row) | **killed** | survived |
| D13 | 8 — every claim id need not appear as a C-row (duplicate row) | **killed** | survived |

**C2 verdict: verified.** 13/13 clause weakenings are distinguished by a lane where the statement
is red; no survivor, no crash, no unapplied edit. C2's own causal fixture is much thinner: the
gate `--selftest` kills only 4 of 13 — for each statement it injects exactly one defect, so a
mutant weakening *another* conjunct of the same statement (LOG copy, QUALITY copy, stale numeral,
lesson-side correction, the 17-word count, the gate-name list, the row tally in either direction)
passes the selftest. That is a calibration limit of the selftest, not of the gate's `--lane` mode.

**Record observation (not counted by the gate).** `SCORECARD.md` round-91 C2 row still says
"`--selftest` ok, **10 causal cases**"; the gate's selftest reports **8 causal cases**
(`plans/round-91.md` §limits already records the correction 8-not-10, the SCORECARD cell was not
swept). The C2 predicate counts eight statements and does not read that numeral, so the drift gate
stays green with a stale figure in the record it is meant to calibrate.

## What was not measured (unfinished)

1. **P39 case-level attribution.** The `leg-marks` mutant fails 12 of 44 battery cases, 11 more
   than the two cases that name `leg-marks`; the extra cases returned no findings, which is
   consistent with a crash/timeout in the battery's per-case spawn rather than a semantic kill. I
   did not resolve this before the wave was closed (the mutant copies were removed by an external
   cleanup of the scratch tree at 13:31). The mutant is still killed (battery exit 1).
2. **Battery `--counter` spawn stability** was not audited; the P39 anomaly is the only evidence
   that a case can fail for a non-semantic reason, and it was not isolated.
3. **Drift statement semantics beyond the injected defect**: one defect per statement, no
   compounding, no base-`b1d8f07b` worktree (the C2 before-control at base was not re-measured by
   this seat; only the tip-state lane and fixtures).
4. **The 5 sibling-attributed C1 kills and the 4 C2 selftest survivors** were not re-probed with a
   second, independent defect to confirm the attribution (time-boxed at wave close).
5. No mutant was pushed through `scripts/kill-power-proxy-round91.mjs` or
   `scripts/selftest-r91-gates.mjs` — the sweep is deliberately independent of the frozen
   kill-power list, which was not used to select any mutant (all 52 edit strings are minimal
   clause anchors, not the kill-power list's whole-check replacements).
