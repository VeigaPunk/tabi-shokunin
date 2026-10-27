# ConnPlanning — round 40 C1 bounded data-walk (independent, leaf)

Scope: read-only walk of frozen C1 (claims.json), its counter (v3), measurement wrapper, Firefox driver, selftest and no-op/replay controls. No claim, counter, driver or control was modified; no browser was launched; no commit, git mutation, install or agent dispatch. Axes judged: coverage, adjacency. Milestone: cross-surface (wrapper ↔ driver ↔ counter ↔ host ss/proc).

Note on report path: the seat spec names both `.ufo/waves/round-40/w1/ConnPlanning/report.md` and `.ufo/waves/round-40/w1/ConnPlanning.md`; the scope line says reports go only under the seat folder, so this is the only report file written.

## 1. Freeze integrity (read-only git show of 07e99cf, compared with worktree)

Command: `git show 07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4:<path> | sha256sum` vs `sha256sum <path>`

| path | freeze (07e99cf) | worktree | match |
|---|---|---|---|
| scripts/measure-c1-round40.mjs | a0e564c7d18bf75d | a0e564c7d18bf75d | yes |
| scripts/selftest-measure-c1-round40.mjs | 5a0b702d90c37628 | 5a0b702d90c37628 | yes |
| scripts/playwright-firefox-egress-round39.mjs | 1f8a15f00a85c7a8 | 1f8a15f00a85c7a8 | yes |
| .ufo/waves/round-40/counters/c1-sample-span-v3.mjs | 0b452eac24280353 | 0b452eac24280353 | yes |
| .ufo/waves/round-40/claims.json | 3e304b2c55d03f20 | 3e304b2c55d03f20 | yes |

`git diff --stat 07e99cf -- <those paths>` printed nothing (rc 0). The four `frozenDigests` in claims.json match these bytes in full.
Both `cat-file -t` checks returned `commit` for 07e99cf and a1b1e93.

## 2. Counter replay on the committed round-39 receipt (no-op control)

Command: `node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs corpus/evidence/round-39/playwright-egress/receipt.json --nonce bbbb…bb` (64 hex)

Output (predicateSentence elided): `receiptSha256 e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493, nonceMatched false, predicate false, findings ["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]`, exit 1.

Consistent with `controls/c1-round39-replay-v3.json` (run-nonce-mismatch + schema + both sample-span). The round-39 receipt sha256 equals `receiptSha256` in `controls/c1-round39-noop-v2.json` and `c1-round39-noop.json` (both v1/v2 counters, superseded by v3 and not named in claims.json controls). Receipt facts read directly: schema `tabi-pw-firefox-egress-receipt-v2`; run1 9 samples span 799 ms; run2 8 samples span 701 ms; owned tree length 5 in both runs; no runNonce field.

## 3. Selftest reproduction (wrapper refusal case only; no browser)

Command: `node scripts/selftest-measure-c1-round40.mjs /fast/scratch/hyaku/tabi-r40/ConnPlanning/selftest`
Output: `cases 7, passed 7, failures []`. The wrapper case refuses on the pre-existing output path before `spawnSync` of the driver, so no Firefox was started.

## 4. Walk of wrapper → driver → counter (what the frozen predicate actually sees)

Verified clauses, all matching the predicate text:
- Wrapper (measure-c1-round40.mjs:16–27): nonce from `crypto.randomBytes(32)` hex; refuses an existing `--out` path (line 13); driver is spawned with `--round40 --runs 2 --nonce`; receipt nonce and each run's nonce must equal the wrapper nonce (line 21) before the counter runs (line 23); exit 0 only if driver status 0, counter status 0 and predicate true.
- Driver writes with `{flag:'wx'}` (driver:403), so a file that appears during the run causes EEXIST and the wrapper's nonce check then fails.
- Driver ROUND40 refuses when either `ss` or `/proc/net/tcp{,6}` is unreadable (observeSs:121, observeProc:206, sampleSockets:229); mid-session loss sets FailClosed (driver:280); the post-session span loop waits until ≥1000 ms or a 4000 ms deadline and fails closed otherwise (driver:325–327). Predicate sample count, ordering, span, per-sample ss/proc usability and nonLoopback, final sweep, survivors, portClosed, browserVersion and firstShot identity are each checked by the counter (counter lines 13–33).

## 5. Findings (coverage, adjacency)

### F1 (coverage, primary) — owned tree is a launch-time snapshot; the header describes a different mechanism
- Driver header (line 9) says the tree is "enumerate[d] once per sample tick".
- Code: `tree0 = ownedTree(roots)` at driver:255, taken ~400 ms after `firefox.launch` (driver:253). Then `rec.owned = {tree: tree0}` (266). Every sample uses `sampleSockets(rec.owned.tree)` (279), the final sweep uses the same array (344), and survivors are `rec.owned.tree.filter(existsSync)` (345). `pidPpidTable()` is called only at launch (255, 259) and in `ownedTree`/`ownedRoots`; nothing re-enumerates per tick.
- Consequences for the frozen predicate:
  - "all observed nonLoopback counts are zero" is literal-true over only launch-time descendants. The word "observed" keeps the predicate honest, but a Firefox child created after the snapshot (for example a content/utility process started by a later newPage or navigation) is never sampled.
  - "zero survivors" is checked only against launch-time pids (345), so a late-spawned child that outlives `browser.close()` cannot register as a survivor.
  - "owned tree nonempty" is satisfied by the snapshot. The `tree.size` step (driver:323) reports `rec.owned.tree.length`, the same array, so it cannot show growth. The round-39 receipt shows 5 and 5 in both runs, and this is self-referential.
- [INFERENCE] Late child creation is plausible for Firefox but is not observed in any receipt here: the receipt does not record pids per sample, and the round-39 data cannot distinguish "no late children" from "late children not in the snapshot".
- Severity: coverage limitation inside the predicate's literal wording. It is not a counter bug and not an amendment target (claims are frozen; I did not propose changing them).

### F2 (coverage, low) — "positive ticks" is a constant sentinel
- observeSs returns `ticks: 1` on every successful call (driver:135); observeProc returns `ticks: 1` (driver:223). The counter's `ticks > 0` (counter:6) therefore re-tests only the same availability already encoded by `null`/`unavailable`. The clause adds no independent observation.

### F3 (coverage, low) — unreadable fd directory is silently zero
- `socketInodesOfPid` returns null on readdir failure (driver:152) and `observeProc` does `continue` (driver:211) without setting unavailable. A same-user owned pid is unlikely to hit this, but the path counts as zero observations with no flag.

### F4 (coverage, low) — wall-clock span
- Sample `t` is `Date.now()` (driver:232). The span predicate therefore inherits clock steps. An NTP step inside a 1 s window could fake or hide the span. Low risk over a ~1.5 s run.

### F5 (adjacency, out of claim scope) — UDP is not observed
- Only `ss -Htnp` (TCP) and `/proc/net/tcp{,6}` are read. S145 (`sources/S145-open.txt`) says it "does not establish UDP coverage". The claim title says "loopback TCP", so UDP is outside the frozen surface and is recorded as a limitation, not a falsifier.

## 6. Relevant unresolved browser surface and cheapest falsifier

Surface: Firefox descendant processes created after the launch snapshot (F1). It sits inside the predicate's non-loopback and survivor clauses, so it is the surface that could change a counted result.

Cheapest falsifier (designed, NOT run): one uncounted live probe in its own scratch, outside the counted command. Log `ps -eo pid=,ppid=,args=` every 100 ms, select descendants of the node pid, and diff against `tree0` (driver:255). Also run `ss -Htnp` and `/proc/<pid>/fd` socket checks on any new pid. Falsifier fires if any descendant pid not in `tree0` appears with a TCP socket (any peer), or survives `browser.close()`. Cost: one Firefox 157 launch, about 3 s, no claim impact. I did not run it because the claim's counted command is the only sanctioned live invocation for C1 and the freeze is pre-data; main should decide.

## 7. Verification and limits

- Ran: freeze hash comparison; counter replay on round-39 receipt; selftest (wrapper refusal case only); read-only `ss -Htnp` / `ss -Hlt` / `/proc/net/tcp` presence checks; ss pid-regex sanity check on a synthetic line.
- Did not run: the driver, the wrapper with a real output path, the counted command, or any Firefox launch.
- Limits: no live socket trace exists for the round-39 runs, so F1 is established from code plus the self-referential receipt, not from an observed late child.
- Tools: none installed, none upgraded; no pacman. `toolInstalls: []` in claims.json still holds for this seat.
- Scratch `/fast/scratch/hyaku/tabi-r40/ConnPlanning/` deleted before yield.

VERDICT finding — the frozen C1 counter, wrapper, driver and controls match freeze 07e99cf and the round-39 no-op refuses as expected; but the driver's owned tree is a single snapshot 400 ms after launch (never refreshed), so the zero-nonLoopback and zero-survivor clauses cover launch-time descendants only. The predicate's "observed" wording keeps the claim literal, so this is a coverage limitation to disclose, not a falsifier; the cheapest falsifier (§6) is designed but not run.
