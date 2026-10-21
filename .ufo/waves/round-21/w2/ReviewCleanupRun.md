# ReviewCleanupRun — w2 review report (tabi round21 C1)

Seat scope (w2-spec.json item `ReviewCleanupRun`): attack all12 nonempty PID sets, fresh profiles,
empty survivors, context close/server cleanup; no vacuous summary or cross-run process claim.
Producer under test: `scripts/webmcp-lifecycle-round21.mjs` sha256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`
(matches `corpus/evidence/round-21/runtime/receipt.json` producer.sha256 and
`.ufo/waves/round-21/runtime-execution-bounded.json` producerSha256). All anchors relative to
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Read-only; no builds/tests/lint executed (per bounds);
evidence arithmetic only, no invented run results.

## Findings

### F1 — MEDIUM: unguarded `server.close` in the run's outer `finally` destroys the whole receipt and skips profile-dir removal
- Attack: make the loopback server's close callback error or exceed its 3 s deadline. `scripts/webmcp-lifecycle-round21.mjs:248`
  `await bounded(new Promise((ok, fail) => server.close((error) => error ? fail(error) : ok())), 'server.close', 3000);`
  sits in a `finally` with **no catch**. A rejection propagates out of the `finally`, so lines 250–255
  (`receipt.cleanup.serverClosed`, `finishedAt`, `requests`, `save(receipt.json)`, `rmSync(temp)`) never run.
  Result: all 12 cases' per-case evidence exists but the receipt that binds invocation IDs, windows, and
  digests is never written; the run's measured value is unrecoverable; fresh-profile temp dirs
  (`/tmp/tabir21-lifecycle-*`) leak on disk. Exit code becomes a bare node error, indistinguishable from a crash.
- Contract anchor: `corpus/knowledge/webmcp-nonautosubmit-round-21.md:89` — "close the fixture server even after
  failure". The close *action* survives the failure path, but its *record* does not; the bounded-deadline repair
  (w2 context: "context close/server cleanup … have explicit deadlines") converts a hang into receipt destruction
  instead of a recorded cleanup failure. Symmetry defect: the context close in the same finally is guarded
  (`:242–244` records `receipt.cleanup.contextError`), the server close is not.
- Concrete fix shape (author-side): wrap `:248` in try/catch recording `receipt.cleanup.serverCloseError`, then
  still execute `:250–255`.

### F2 — MEDIUM: measure's `context_cleanup` oracle checks 3 of 8 cleanup fields; two producer-impossible cleanup states pass the gate with no red control
- Oracle: `.ufo/waves/round-21/measure-c1.mjs:97` checks only
  `browserPidsBefore` nonempty/positive-integer, `browserPidsAfter === []`, `contextClosed === true`.
  It never reads `closeError`, `processIdentities`, `processIdentitiesAtLaunch`, `forcedCleanup`,
  `browserPidsAtClose`, `browserPidsSeenAfterClose`.
- Attack A (close-lie): forge evidence with `closeError:"operation_timeout:context.close"`, `contextClosed:true`,
  `browserPidsAfter:[]`. Under the producer these are mutually exclusive
  (`scripts/webmcp-lifecycle-round21.mjs:80–84`: `contextClosed` is set only on resolved close, `closeError` only
  on rejection). Measure passes it; no selftest mutant exercises it — the cleanup red controls are exactly three:
  `selftest-c1.mjs:35` (`empty-pids`), `:36` (`survivor`), `:37` (`cleanup-summary`).
- Attack B (orphan-lie): forge `browserPidsSeenAfterClose:[4242]` with no `forcedCleanup`. Producer-impossible:
  `:88–99` — any same-tick late survivor necessarily enters `identities`, makes `remaining` nonempty, and sets
  `forcedCleanup` before the SIGKILL branch. Measure passes it.
- Fix shape: add `!e.closeError && equal(e.browserPidsSeenAfterClose||[],[]) === (e.forcedCleanup===undefined)`
  style consistency checks plus red mutants (`close-error-ignored`, `orphan-without-forced`, `serverClosed` toggle —
  `cleanup-summary` only pins `browserClosed`).

### F3 — MEDIUM (operational): all-or-nothing persistence turns a single context-close flake into a zero-value run
- Attack: `context.close()` times out at its 5 s deadline on case 12 after an otherwise clean run.
  `scripts/webmcp-lifecycle-round21.mjs:237` throws `case_boundary_failure` (correctly), but the receipt is saved
  only after a fully clean loop (`:254`). 12 evidence files persist, receipt does not →
  `measure-c1.mjs:39–41` yields `partial_state`, count 0. A transient close flake erases the acquisition's entire
  measured value even though 11/12 cases were perfect and honestly recorded. The no-invented-results repair
  (timeout ≠ invented zero) does not force atomic persistence; per-case receipt incrementalism would survive.
  Not a correctness lie — an availability defect in the acquisition instrument itself.

### F4 — LOW: `receipt.cleanup` flags are vacuous — constant-true in every receipt that can exist
- `scripts/webmcp-lifecycle-round21.mjs:240` `browserClosed = receipt.cases.length === CASES.length` — any violating
  case aborts persistence, so no persisted receipt can carry `false`. `:250` `serverClosed = !server.listening` —
  evaluated only after a *resolved* close; a failed close hits F1 and no receipt is written. Therefore both flags
  are `true` in every reachable persisted state; `measure-c1.mjs:50` (`cleanup` finding) is unfalsifiable against
  producer output and fires only on hand-forged receipts (`selftest-c1.mjs:37`).
- The name also overstates: `browserClosed` derives from case-count completion, not a receipt-level process
  observation; the real guarantees live per-case (`context_cleanup` fields). A consumer reading
  `receipt.cleanup` learns nothing that "this receipt exists" doesn't already imply. Rename or derive honestly.

### F5 — LOW: unmapped failed-run execution record in wave root contradicts the history-preservation claim
- `.ufo/waves/round-21/runtime-execution.json`: producerSha256 `a273fe77161bf6b29e1f98efbb4568d615fe1aa8109e3cb6a33dc0070f905c3d`
  (= history/webmcp-lifecycle-v1.mjs), startedAt `2026-10-21T12:39:34.232445+00:00`, **exit 1** — a failed v1 run.
  `.ufo/waves/round-21/history/index.json` maps `runtime-execution-pinned.json` (same v1 sha, startedAt
  `12:39:42.650895`, exit 0 — 8 s later), `-ordered`, `-final`, `-bounded`, but `runtime-execution.json` appears in
  **no index key** (verified: zero occurrences of the name in index.json).
- The w2 context states earlier acquisitions were "preserved under .ufo/waves/round-21/history/ with exact old
  producers and path mapping"; this record is neither under history/ nor mapped anywhere. Reader risk: conflating
  the failed pre-pinned run with the pinned success by sha equality alone. Producers themselves *are* correctly
  under history/ (v1/v2/v3 shas match the index's records exactly); only the note's "acquisitions … preserved
  under history/" phrasing over-covers.

## Verified-clean attack results (no finding)

- **All 12 PID sets nonempty and disjoint**: every case records `browserPidsBefore` length 9,
  `browserPidsAtClose` 9, `processIdentitiesAtLaunch` 9, `processIdentities` 9, `browserPidsSeenAfterClose` 0,
  `browserPidsAfter` [], `contextClosed` true, `closeError`/`forcedCleanup` null, `blocked`/`downloads` empty
  (arithmetic over all 12 `corpus/evidence/round-21/runtime/<id>.json`). Zero PID overlap across the 12 sets
  (12×9 = 108 distinct pids) and zero `(pid,startTicks)` collisions — no cross-case set confusion; in-run PID-reuse
  defense is sound (`:75–79, :92–96` dedupe by pid+ticks; kill rechecks ticks `:97–102`).
- **Empty-survivor claim is honestly scoped**: `browserPidsAfter` is identities-derived (`:103`), but identities
  include launch+atClose+post-close scans; the note disclaims universal liveness
  (`webmcp-nonautosubmit-round-21.md:64–66`), matching what the evidence supports. No cross-run process claim found
  in producer, note, measure, selftest, or receipt.
- **Producer-side gates fire**: `browser_pid_set_empty` hard-stops the run on empty launch set (`:170`);
  `case_boundary_failure` on closeError/survivors/blocked/downloads (`:237`).
- **Bounded deadlines present**: observe 5 s / CDP send 10 s / actions 10 s / context.close 5 s / server.close 3 s
  / delayed-release 5 s (`:36, :150–153, :183–188, :81, :248`).
- **Red/green controls in scope exist and match expected.json**: `empty-pids`→`context_cleanup`,
  `survivor`→`context_cleanup`, `cleanup-summary`→`cleanup`
  (`fixtures/expected.json` rows at `:37–56` of 170); green `positive` exit 0 value 12. The null-submits repair has
  both controls: `unavailable-null-positive` exit 0 value 12 and `unavailable-to-empty`→`summary_mismatch`, matching
  producer `:200` (`Array.isArray ? … : null`) and measure `:95`.
- **Fresh profiles structurally sound**: `mkdtempSync` root + per-case subdir (`:143, :163`), stripped child env
  (`HOME`/`TMPDIR` pinned to temp, `:168`), `rmSync` on success (`:255`; leak only via F1).

## Residual risk and verification gaps

1. `processTree` silently drops /proc entries failing ENOENT/ESRCH/EACCES reads (`:59`); the survivor claim is
   /proc-visibility-scoped. Consistent with the note's disclaimer; no overclaim to correct.
2. Profile *freshness* is code-implied only; no profile path or pre-launch dir state is recorded in evidence, so
   freshness is not falsifiable from evidence bytes alone (bounds allowed no browser run to test it).
3. Launch-phase window: a browser spawned before a `launchPersistentContext` handshake failure is outside every
   recorded pid set; Playwright kills on launch timeout, but that path is unexercised — covered by the note's
   "Fault injection of every browser/OS hang and every signal path remains unexercised" (`:66–67`).
4. F1/F3 unexercised by any red control (no `server-close-error` or `close-timeout` mutant); I did not execute
   selftest/counter runs per lane bounds — L1's serial verification should confirm F2's proposed mutants before
   any gate change ships.
5. No tool installs were needed (read-only review, node + coreutils only); nothing to record under the tooling
   directive.

Report: `.ufo/waves/round-21/w2/ReviewCleanupRun.md`
