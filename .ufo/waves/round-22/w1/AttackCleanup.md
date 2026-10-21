# AttackCleanup — round-22 W1 (tabi)

Seat: `TabiR22.AttackCleanup`, leaf reviewer, read-only. Subject: shared oracle/debt design for observed nonempty PID identities and sampled empty survivors. Scope is finite owned-process samples, not universal quiescence.

Method: static reading of the round-21 producer, frozen counter, selftest, fixtures, note, and round-22 wave spec; read-only arithmetic over committed JSON (`node -e`, no writes); `sha256sum` for identity. Every counterexample is a coherent mutation proposed for future red controls. None was executed. Frozen-counter outcomes are static readings of `measure-c1.mjs:140`. No tests, builds, linters, browser runs, network, REA, or installs.

Paths are relative to the lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin/`. Producer `scripts/webmcp-lifecycle-round21.mjs` sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` (matches `receipt.json` producer and `measure-c1.mjs:31`). Frozen counter `.ufo/waves/round-21/measure-c1.mjs` sha256 `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`.

"Resealed" below means: recompute each mutated case file's `evidence.sha256` in `receipt.json`, then recompute the receipt and artifact pins in `.ufo/waves/round-21/runtime-execution-finalized.json`, as `selftest-c1.mjs:184–193` does.

## 0. Verdict

1. **The round-22 contract has no cleanup home.** `.ufo/waves/round-22/w1-spec.json:3` fixes the exported stable findings (`semantic_*`, `evidence_binding`, `case_set`, `source_binding`, `input_shape`, `revision_input`). None is cleanup. The BuildOracle prompt (`:10`) names no cleanup predicate. An oracle built to that text would pass the round-21 `survivor` red control (`selftest-c1.mjs:39`) once resealed (CE-0).
2. **The frozen round-21 predicate is blind to identities.** `measure-c1.mjs:140` tests `browserPidsBefore` (nonempty positive integers), `browserPidsAfter` (`== []`), `contextClosed === true`, and `closeError`. No other line of that counter reads `processIdentitiesAtLaunch`, `processIdentities`, `browserPidsAtClose`, `browserPidsSeenAfterClose`, or `forcedCleanup`. Five coherent mutations that should be red pass it: CE-1, CE-2, CE-3, CE-4, and the identity-free history shape (CE-6).
3. **An empty survivor sample is vacuous when identities are empty.** `scripts/webmcp-lifecycle-round21.mjs:84` filters `identities`, and `:103` writes `browserPidsAfter = sameProcesses()`. An empty identity list yields `[]` by construction. The only launch guard (`:170–171`) tests pids, not identities.
4. **The 12 canonical rows are clean on every proposed predicate** (§5). The defects are in what the oracle can distinguish and in scope the evidence does not record, not in these bytes.
5. **Universal wording is unsupported** by round-21 evidence: no run-level stray scan, an identity-scoped final sample, silent `/proc` skips, and unrelated host Chromium (CE-7, CE-8).

Severity: CE-0, CE-1, CE-2 high. CE-3, CE-4, CE-6, CE-7 medium. CE-5, CE-8 low (a guard against false negatives, and debt). Parent decisions: D-1, D-2, D-3 (§3).

## 1. Anchors (exact, verified in this pass)

Producer `scripts/webmcp-lifecycle-round21.mjs`:
- `:52–65` `processTree`. Roots are `cmdline` tokens equal to `--user-data-dir=<profile>` (`:58`). Ppid closure at `:61–63`. Read errors `ENOENT`, `ESRCH`, and `EACCES` are silently skipped (`:59`).
- `:66–71` `startTicks`. `ENOENT`/`ESRCH` return `null` (`:70`); other errors throw.
- `:73` `browserPidsAtClose = processTree(profile)`. `:74` `browserPidsBefore` becomes the union of launch and close samples.
- `:75` identities seeded from `processIdentitiesAtLaunch`. `:76–79` close samples bound by ticks. `:78` and `:90` dedupe by (pid, ticks).
- `:80–83` `context.close` bounded at 5 s. Success sets `contextClosed = true`; failure sets `closeError`.
- `:84` `sameProcesses` returns identities whose `startTicks` still match.
- `:85` waits up to 40 × 50 ms. `:86–91` late sample and late identities. `:87` `browserPidsSeenAfterClose`.
- `:93–102` if any identity survives: `:95` `forcedCleanup`, `:96–100` SIGKILL each identity whose ticks still match, `:101` wait again.
- `:103` `browserPidsAfter = sameProcesses()`. Identity-scoped; no fresh scan.
- `:161` case evidence starts with no `closeError`, `forcedCleanup`, or identities.
- `:169–171` launch sample, identities via `filter(p => p.startTicks)` (`:170`), guard on `browserPidsBefore.length` (`:171`).
- `:225` after-action observation on a live page. `:228–236` finally: `closeOwnedContext` (`:230`), evidence saved (`:233`).
- `:237–238` boundary gate reads only `closeError`, `browserPidsAfter`, `blocked`, `downloads`.
- `:241` `receipt.cleanup.browserClosed` is the case count (constant true for any persisted receipt).
- `:256` `rmSync(temp)` at run end only. No per-case profile removal record.

Frozen counter `.ufo/waves/round-21/measure-c1.mjs`:
- `:33` FINDINGS include `context_cleanup` and `cleanup`.
- `:73` checks `receipt.cleanup` flags only.
- `:140` the sole per-case cleanup predicate: `!Array.isArray(e.browserPidsBefore) || !e.browserPidsBefore.length || e.browserPidsBefore.some(p=>!Number.isInteger(p)||p<=0) || !equal(e.browserPidsAfter,[]) || e.contextClosed!==true || e.closeError` → `context_cleanup`.
- `:57` and `:143` `result()`: any finding gives value 0, exit 1.

Round-21 red controls: `.ufo/waves/round-21/selftest-c1.mjs:38` `empty-pids`, `:39` `survivor`, `:40` `cleanup-summary`, `:160` `context-close-false`, `:161` `context-close-error`. Reseal pattern at `:184` and `:187–193`. `.ufo/waves/round-21/fixtures/expected.json` maps `empty-pids`, `survivor`, `context-close-false`, and `context-close-error` to `context_cleanup`, and `cleanup-summary` to `cleanup`.

Note `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`:
- `:62–67` "Cleanup refreshes the owned process set before close, retains PID start identities … These are finite owned-process observations, not a universal process-liveness or hostile-host guarantee."
- `:74–77` sampled identities do not attest isolation.
- `:96–97` rule 6: "retain a nonempty run-owned PID set before close and an empty survivor set afterwards".
- `:104` "cleanup [is a] finite run claim".

Canonical evidence `corpus/evidence/round-21/runtime/na-click.json`: `:280–290` `browserPidsBefore`; `:291` `browserPidsAfter` `[]`; `:292` `contextClosed` true; `:295–332` `processIdentitiesAtLaunch`; `:333–343` `browserPidsAtClose`; `:344` `browserPidsSeenAfterClose` `[]`; `:345–382` `processIdentities`. Identity entries have exactly the keys `pid` and `startTicks`. `receipt.json` cleanup is `{browserClosed: true, serverClosed: true}`.

Round-22 state: no `measure-c1.mjs` or `corpus/evidence/round-22/` exists yet. `.ufo/waves/round-22/clones/BuildOracle` holds only round-13 copies (read-only grep). The predicates in §3 are requirements for BuildOracle, not checks of existing code.

## 2. Counterexamples and stable expectations

Convention: every failure is exit 1 and value 0 (global, per `measure-c1.mjs:57`/`:143`). Finding ID `evidence_binding` unless noted, with detail `cleanup:<token>:<case>`.

### CE-0 — the stated list cannot carry the survivor control (design; HIGH)

- Evidence: `w1-spec.json:3` (export list), `:10` (BuildOracle prompt, no cleanup predicate), `selftest-c1.mjs:39` (`survivor` → `context_cleanup`).
- Failure: a round-22 oracle with only the listed IDs has no predicate for `browserPidsAfter = [1000]`. Once resealed, the control is green.
- Expectation: every cleanup predicate exports as `evidence_binding` with `cleanup:*` detail (P2–P9, §3). Type violations are `input_shape` (P1). Do not export `context_cleanup` from the new oracle unless the parent amends the list (D-2).
- Preserving: the canonical 12 produce no cleanup finding (§5).

### CE-1 — identity-vacuous empty survivor (HIGH)

- Mutation on `na-click.json`: `processIdentitiesAtLaunch: []`, `processIdentities: []`, `browserPidsAtClose: []`, `browserPidsSeenAfterClose: []`. Keep `browserPidsBefore` (9 positive integers), `browserPidsAfter: []`, `contextClosed: true`, no `closeError`. Reseal.
- Frozen counter: `:140` raises nothing. Result: 12 rows, exit 0.
- Producer reachability: `:84` and `:103` yield `[]` for an empty identity list. `:171` checks pids only. `:238` passes. Requires every launch pid's `/proc/<pid>/stat` to vanish between `:169` and `:170`, and the refresh at `:73` to find no tree [INFERENCE: race window; not observed].
- Expectation: `cleanup:launch-identity-empty` (P2) and `cleanup:identity-set-empty` (P4).
- Preserving control: canonical `na-click` (9 entries, prefix-equal, types pass) → no finding.

### CE-2 — pre-close set empty while launch identities survive; note rule 6 literal (HIGH)

- Mutation: `browserPidsAtClose: []`, `browserPidsSeenAfterClose: []`. Keep identities (9, equal to the launch identities), `browserPidsBefore` (9), `browserPidsAfter: []`, `contextClosed: true`. Reseal.
- Frozen counter: `:140` raises nothing, because `:74` merges launch pids into `browserPidsBefore`.
- Why it matters: rule 6 (`:96–97`) requires a nonempty set before close. The note says cleanup "refreshes the owned process set before close" (`:62–63`), and that set is `browserPidsAtClose` (`:73`). The counter cannot distinguish launch-only pids from close-observed pids.
- Reachability: the tree dies between the live after-action observation (`:225`) and the refresh (`:73`), and `context.close()` still resolves [INFERENCE: millisecond window; not observed].
- Expectation: `cleanup:close-set-empty` (P5, zero close pids bound to identities).
- Preserving: canonical 12 each have 9 close pids, all bound to identities.

### CE-3 — forced cleanup accepted as clean (MEDIUM; decision D-1)

- Mutation: add `forcedCleanup: [<the nine identity pids>]` to `na-click`. Keep `browserPidsAfter: []`, identities (9), `browserPidsSeenAfterClose: []`, `contextClosed: true`. Reseal.
- Frozen counter: raises nothing (it never reads `forcedCleanup`). Producer gate `:238` passes.
- Reachability: code-observed. `:85` waits 2 s after close. Survivors trigger `:95` and SIGKILL (`:96–100`). `:103` then records an empty set. None of the 12 canonical rows has a `forcedCleanup` key.
- Expectation (recommended): `cleanup:forced`. Basis: lane `SKILL.md:1981` "failure/timeout is not successful closure". Rule 6's "empty survivor set afterwards" is reached here only after the graceful wait failed. The alternative (D-1) is crediting with an explicit disclosure rule. Silent credit is not acceptable.
- Preserving: 12/12 canonical rows have no `forcedCleanup`.

### CE-4 — cross-case identity reuse, the fresh-context claim (MEDIUM)

- Mutation: copy `na-click`'s cleanup fields (`browserPidsBefore`, `processIdentitiesAtLaunch`, `browserPidsAtClose`, `browserPidsSeenAfterClose`, `processIdentities`, `browserPidsAfter`, `contextClosed`) into `na-pending.json`. Keep its own nonce, frames, and observations. Reseal.
- Frozen counter: raises nothing (`context_cleanup` is per case). Confirmed open debt: `.ufo/waves/round-21/w1/ReviewBinding.md:29–30` (F3) and `.ufo/waves/round-21/w1/ReviewFreshContext.md:19–20` (F2).
- Reachability: not producer-reachable (`:160` gives each case a fresh profile and a new browser). Copied or forged evidence only.
- Expectation: `cleanup:identity-reuse:na-pending~na-click` (P9).
- Must stay green: PID-only overlap across two cases with different `startTicks` (legal PID reuse). Canonical: 108 distinct (pid, startTicks) pairs, 108 distinct pids, zero collisions of either kind.

### CE-5 — late survivor unbound, race-legal (LOW; must not fail)

- Mutation: `browserPidsSeenAfterClose: [4242]`, no identity entry for 4242, no `forcedCleanup`, `browserPidsAfter: []`.
- Frozen counter: raises nothing.
- Reachability: `:87` records `late` before the ticks read at `:89`. A pid that exits between them is never bound. A pid that exits between `:89` and `:93` is bound but absent from `remaining`, so no forced set is written. Both are legal [INFERENCE: sub-millisecond].
- Expectation: **no finding**. Disclosure `late_seen_unbound: 1`. Do not adopt `browserPidsSeenAfterClose ≠ [] ⇔ forcedCleanup present` (proposed at `.ufo/waves/round-21/w2/ReviewCleanupRun.md:42–44`). It rejects this legal state.
- Must stay green: a late pid that is bound to an identity with no forced set.

### CE-6 — identity-free "empty survivor" acquisitions (MEDIUM)

- Evidence: `.ufo/waves/round-21/history/runtime-v1`, `runtime-v2`, `runtime-v3`. Each has 12 case files with zero identity fields, `browserPidsBefore` nonempty in 12/12, `browserPidsAfter` empty in 12/12, `contextClosed` true in 12/12, and no `closeError`. The survivor, `contextClosed`, and `closeError` conditions of `:140` hold on all 36 files. The pid-integer clause was not separately checked for them.
- `runtime-v4` is identity-bearing (12/12) and passes P1–P9 when checked here (§5).
- Expectation: identity-free cases fail P2 and P4 if ever evaluated. The oracle reads only `corpus/evidence/round-21/runtime/`. v1–v3 must not be cited as cleanup evidence.

### CE-7 — universal-scope wording (MEDIUM; no row finding)

- No run-level scan in round 21. The producer calls `readdirSync('/proc')` only inside `processTree` (`:54`). It has no `strays` and no `findProcessesUsing(tmpBase)`. Earlier lane harnesses required one as a stop proof: `scripts/webmcp-loopback-round16.mjs:1508,1513`; `scripts/webmcp-invoke-round17.mjs:1940,1955`; `scripts/webmcp-invoke-round18.mjs:857–859,2798`.
- Host scope: `.ufo/waves/round-17/w1/SentinelBrowser.md:107` — "The host has unrelated Chromium instances (pid 2082972), so never kill by name."
- Sample scope: `:103` reads identities only, with no scan after `:86`. A marked child spawned after `:86` by an identity killed at `:98` is orphaned, unbound, and never signalled [INFERENCE: forced path only; millisecond window].
- Precedent that tracked sets can miss survivors: `.ufo/waves/round-16/w2/AttackReceiptClosure.md:264–276` (a global scan found 36 Chromium processes that per-run tracking did not account for).
- Expectation: no oracle finding is representable. Enforce through note and SKILL wording (§9).

### CE-8 — `/proc` permission asymmetry (LOW; debt)

- `processTree` `:59` silently skips `EACCES` along with `ENOENT`/`ESRCH`. `startTicks` `:70` throws on `EACCES`. A marked root whose `cmdline` or `status` is unreadable is invisible to every sample, while an unreadable `stat` aborts the run (fail-closed). No evidence field counts skipped entries [INFERENCE: not observed in the 12; host `/proc` options not probed].
- Expectation: none (not evaluable from evidence). See DEBT-CL-2.

## 3. Predicate set for the shared oracle (proposed; not executed)

Fixed rules. No receipt-derived expectations. No hard-coded counts or pids.

| ID | Rule | Token | Exactness |
|---|---|---|---|
| P1 | `processIdentitiesAtLaunch` and `processIdentities` are arrays of exactly `{pid, startTicks}`, pid a safe integer > 0, `startTicks` matching `^[0-9]+$`. Pid arrays hold safe integers > 0. `forcedCleanup` is absent or a nonempty pid array. `contextClosed` is boolean. `closeError` is absent or a string. | `input_shape` | producer-exact |
| P2 | `processIdentitiesAtLaunch.length ≥ 1` | `cleanup:launch-identity-empty` | producer-exact (`:171` checks pids only) |
| P3 | `processIdentitiesAtLaunch` equals the prefix of `processIdentities`; no repeated (pid, startTicks) | `cleanup:identity-prefix` | producer-exact (`:75`, `:78`, `:90`) |
| P4 | `processIdentities.length ≥ 1` | `cleanup:identity-set-empty` | producer-exact (`:84`) |
| P5 | at least one `browserPidsAtClose` pid has an entry in `processIdentities` | `cleanup:close-set-empty` | race-tolerant by design (`:73`, `:77`) |
| P6 | `browserPidsAfter` deep-equals `[]` (existing rule), P4 holds, and `browserPidsAfter ⊆ pids(processIdentities)` | `cleanup:survivor` | producer-exact (`:103`) |
| P7 | `forcedCleanup` absent (D-1); if present, ⊆ pids(processIdentities) | `cleanup:forced`, `cleanup:forced-outside-identities` | subset exact (`:93`) |
| P8 | `closeError` absent ⇔ `contextClosed === true` (keeps the frozen `:140` conjunct) | `cleanup:close-error` | producer-exact (`:81–83`) |
| P9 | across the canonical 12, no (pid, startTicks) pair appears in two cases | `cleanup:identity-reuse` | exact for fresh profiles (`:160`); PID-only reuse is not a failure |

Disclosures (no finding): `late_seen_bound`, `late_seen_unbound` (= |seen ∖ pids(I)|), `close_unbound` (= |close ∖ pids(I)|), `forced` boolean, set cardinalities, and `scope: "identity-scoped"`.

Do-not-gate list: `browserPidsBefore ⊆ pids(I)` (race at `:77`, `:90`, `:170`); `browserPidsSeenAfterClose ⊆ pids(I)` (race, CE-5); exact counts (9); pid values; timestamps (none recorded); root-role identity (not recorded); the `forcedCleanup ⇔ late-seen` equivalence.

Parent decisions:
- D-1: forced rows fail (recommended) versus disclosure-credit.
- D-2: map to `evidence_binding` (recommended) versus add cleanup IDs to the export list.
- D-3: P5 race-tolerant (recommended) versus strict.

## 4. Output shape

- Any cleanup failure: exit 1, value 0 globally. Findings are `evidence_binding` or `input_shape`, with detail `cleanup:<token>:<case>`.
- Rows may carry observation-only cleanup counts and `scope`. No new top-level keys; the `evaluate()` contract is unchanged.
- `semantic-expectations.json` may fix per-case cleanup expectations: `contextClosed: true`, `closeError` absent, `forcedCleanup` absent, survivors `[]`, identity minimum 1. These are fixed rules, not values recomputed from the receipt.
- The frozen counter stays frozen. The new oracle re-implements P1–P9 without importing it.

## 5. Bounded preserving positive

Canonical `corpus/evidence/round-21/runtime/<id>.json`, all 12 (read-only arithmetic):
- `processIdentitiesAtLaunch` has 9 entries and is a prefix of `processIdentities` (9). No repeated (pid, startTicks). Types pass.
- `browserPidsBefore` = `browserPidsAtClose` = the identity pid set, 9 distinct pids each. Zero launch-to-close churn.
- `browserPidsAtClose` is bound to identities: 9/9.
- `browserPidsSeenAfterClose` = []; `forcedCleanup` absent; `browserPidsAfter` = []; `contextClosed` true; `closeError` absent; `blocked` = []; `downloads` = [].
- Cross-case: 108 distinct (pid, startTicks) pairs, 108 distinct pids, zero collisions of either kind.
- Result: P1–P9 emit zero findings, and all disclosures are zero or absent.

Secondary positive, `.ufo/waves/round-21/history/runtime-v4` (12/12 identity-bearing): same cardinalities, prefix, forced absent, survivors empty, closed, no `closeError`, types, and no duplicates. Zero cross-case collisions. Use only as a secondary positive.

Preserving negatives (must stay green): CE-5 bound and unbound late survivors; PID-only reuse across cases with different `startTicks`.

Note: `browserPidsAfter = []` is conservative for identities. A zombie keeps `/proc/<pid>/stat` with the same starttime, so it still counts as alive [INFERENCE from Linux `/proc` behavior].

## 6. Proposed red and green control set (names are suggestions)

| Control | Mutation (resealed) | Expected |
|---|---|---|
| `cleanup-identity-empty` | CE-1 | `cleanup:launch-identity-empty`, `cleanup:identity-set-empty` |
| `cleanup-close-empty` | CE-2 | `cleanup:close-set-empty` |
| `cleanup-forced` | CE-3 | `cleanup:forced` (per D-1) |
| `cleanup-identity-reuse` | CE-4 | `cleanup:identity-reuse` |
| `cleanup-survivor` | `browserPidsAfter = [1000]` | `cleanup:survivor` |
| `cleanup-history-identity-free` | v1-shaped case | `cleanup:launch-identity-empty` |
| `cleanup-late-unbound-green` | CE-5 | pass, no finding |
| `cleanup-pid-reuse-green` | PID-only overlap, different ticks | pass, no finding |
| `positive` | canonical 12 unmodified | pass, value 12 |

## 7. Debt (no credit; stable IDs)

- DEBT-CL-1 (scope). The final survivor sample is identity-scoped (`:103`). No run-level stray scan exists (CE-7). Universal claims are unavailable from round-21 evidence.
- DEBT-CL-2 (recording). `processTree` skips `EACCES` silently (`:59`), while `startTicks` throws (`:70`). The asymmetry is unrecorded (CE-8).
- DEBT-CL-3 (freshness). No scan after `:86`. The forced kill acts on an identity snapshot (`:96–100`). Children orphaned by the kill escape (CE-7).
- DEBT-CL-4 (time). Samples carry no timestamps (`:73`, `:86`, `:103`). "After close" is code order only.
- DEBT-CL-5 (membership). Identities are asserted by the producer from the marker tree. Canonical entries carry only `pid` and `startTicks`, so run ownership is not re-derivable offline.
- DEBT-CL-6 (naming). `browserPidsBefore` is launch ∪ close (`:74`). Use `processIdentitiesAtLaunch` for launch and `browserPidsAtClose` for pre-close. Never describe `browserPidsBefore` as pre-action.
- DEBT-CL-7 (forced). Forced kill is indistinguishable from graceful closure in `browserPidsAfter`. Gate `:238` and the frozen counter accept it (CE-3), unless D-1 is adopted.
- DEBT-CL-8 (history). `runtime-v1` to `v3` have empty survivor arrays with no identity basis (CE-6). `runtime-v4` and the canonical set are the only identity-bearing acquisitions.
- DEBT-CL-9 (summary). `receipt.cleanup.browserClosed` is the case count (`:241`). `serverClosed` derives from a resolved close. Neither is process evidence (`.ufo/waves/round-21/w2/ReviewCleanupRun.md` F4).
- DEBT-CL-10 (kill). The ticks check (`:97`) precedes the SIGKILL (`:98`), and a PID can be reused in between. Residual, producer-side.
- DEBT-CL-11 (profiles). Profiles are removed only at run end (`:256`). Per-case removal is unrecorded (`.ufo/waves/round-21/w1/ReviewFreshContext.md:19–20`). Notes must not claim per-case profile removal.

## 8. Corrections to inherited review text

- `.ufo/waves/round-21/w2/ReviewCleanupRun.md` F2 Attack A (lines 34–38) is stale for the current counter. `measure-c1.mjs:140` tests `e.closeError`. The review's `:97` cites an earlier revision.
- Attack B (lines 39–41) is not producer-impossible. It is race-possible between `:86` and `:93` (CE-5). Its proposed equivalence (lines 42–44) must not be adopted.
- Its verified-clean arithmetic (lines 77–88) is confirmed by this pass. Its residual 1 (lines 103–104) is correct and equals CE-8.
- `.ufo/waves/round-22/round21-closure.json:48` ("sampled survivor sets empty") matches the scope in §9. Keep it.

## 9. Required wording

Allowed, adapted from `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:62–67` and `:96–97`:

> Cleanup retained launch, pre-close, and post-close identities (pid and start ticks) of run-owned Chromium processes, sampled by the round-21 producer's profile-marker tree walk. The identity-scoped survivor sample, taken after the wait and any forced kill, was empty for the twelve canonical rows. This is a finite owned-process observation. It does not cover unreadable `/proc` entries, processes spawned after the final sample, unrelated host processes, or universal process liveness.

Forbidden: "no browser processes survived"; "no Chromium remains"; "browser fully quiesced"; "profile fully removed per case"; "every process exited"; "no survivors on the host"; "forced kill is graceful closure".

## 10. Verification gaps

- Not executed: the counter, the selftest, the producer, any browser, `/proc` probing, hidepid or pidfd checks. CE outcomes come from static reading or read-only arithmetic.
- [INFERENCE] labels: race windows (CE-1, CE-2, CE-5), `EACCES` (CE-8), the post-sample escape (CE-7), and zombie behavior (§5).
- No round-22 `measure-c1.mjs` or `corpus/evidence/round-22/` exists yet. The predicates in §3 are requirements for BuildOracle.
- Producer fixes (record skips, guard identities, add a run-level scan, flag forced cleanup) are outside this lane and are not proposed as edits.

Tooling: no installs or updates. Read-only tools only, plus `node -e` JSON arithmetic and `sha256sum`. The only write is this report.

Report: `.ufo/waves/round-22/w1/AttackCleanup.md`
