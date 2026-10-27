# RevClaimFit — round-40 w1 claim review (C1)

Seat: RevClaimFit (leaf reviewer; no subagents). Milestone: claim-review. Judged on: coverage, calibration.
Target: adversarial assessment of the frozen `.ufo/waves/round-40/claims.json` (freeze `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`, baseline `a1b1e939048885d2793759b7f49b10c5c820d70d`) against `SCORECARD.md` and the round-39 falsifier records, on six axes: axis fit, causal scope, source grounding, target/control reachability, kill rule, shared inputs. The freeze was not amended; defects and recommendations are separated.

Method: read-only. No live browser run (the wrapper's first live invocation is claim data owned by the executor seat, not by this review). Scratch root `/fast/scratch/hyaku/tabi-r40/RevClaimFit/` was used explicitly and removed before this report was filed. No production-tree, fleet, sibling, or shokuknow writes; no git mutation (read-only `git show`/`diff` only); no tool installs.

## 1. Observed commands and outputs (exact)

Freeze integrity:

```
$ sha256sum scripts/playwright-firefox-egress-round39.mjs scripts/measure-c1-round40.mjs \
    scripts/selftest-measure-c1-round40.mjs .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b  scripts/playwright-firefox-egress-round39.mjs
a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735  scripts/measure-c1-round40.mjs
5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82  scripts/selftest-measure-c1-round40.mjs
0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c  .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
```
All four equal `claims.json.frozenDigests`.

```
$ sha256sum .ufo/waves/round-40/claims.json
3e304b2c55d03f20aa6b1ad6e8f86ceec80dfa5ec9f41d58ce98f9d55ebe0246
$ git show 07e99cf1:.ufo/waves/round-40/claims.json | sha256sum
3e304b2c55d03f20aa6b1ad6e8f86ceec80dfa5ec9f41d58ce98f9d55ebe0246
```
Working-tree claims bytes are byte-identical to the freeze. `git diff 07e99cf1..HEAD --stat` touches only `gen-w1-spec.py`, `measure/census-start-exit.txt`, `w1-dispatch.json`, `w1-plan.json`, `w1-spec.json`, `w1/swarm-registry.json`, `LOG.md`, `SCORECARD.md` — no post-freeze instrument or claims edit. All five commits named in the amendment chain exist in-repo (`07e99cf1`, baseline `a1b1e939`, superseded `cb35339d`, `c451a3c4`, `8a387c0c`).

Sentence discipline (claims predicate vs counter constant): byte-identical, 716 characters both (`sentence-identical: true`).

Before-state (`corpus/evidence/round-39/playwright-egress/receipt.json`, extracted with a scratch script):

- schema `tabi-pw-firefox-egress-receipt-v2` (not r40); no `runNonce` key anywhere;
- run1: 9 samples, span 799 ms; run2: 8 samples, span 701 ms — matches the frozen `before` text;
- per-run ss observations 6, proc observations 6, `binding:true`, `egressNonLoopback:0`, survivors 0, `portClosed:true`, `browserVersion:"157.0"`.

Control reproduction at current bytes:

```
$ node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs \
    corpus/evidence/round-39/playwright-egress/receipt.json --nonce <fresh 64-hex>
→ findings ["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"], predicate false, exit=1
$ node scripts/selftest-measure-c1-round40.mjs /fast/scratch/hyaku/tabi-r40/RevClaimFit/selftest-work
→ {"cases":7,"passed":7,"failures":[]}, exit=0
```
Both reproduce the committed control receipts `.ufo/waves/round-40/controls/c1-round39-replay-v3.json` and `c1-measure-selftest-v2.json` exactly as claimed (the selftest's last case shows `output-already-exists` with `scratchCreated:false`, i.e. the wrapper refuses a pre-existing output before creating the driver scratch, hence before any browser start).

Host reachability of the counting command: node v24.21.0; `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/index.mjs` present; `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` present and executable; `ss` at `/usr/bin/ss`; `ps` resolvable. Round-39 live runs on this host already satisfied every v3 conjunct except span (799/701 ms), nonce, and r40 schema — the round-40 changes add the in-session ≥1000 ms wait loop (4 s deadline, driver `--round40` block), the one-use nonce, and the schema switch, so predicate=true is reachable, and the two controls demonstrate the refused side is real. No claim verdict is asserted here; execution belongs to the executor seat.

## 2. Axis fit — grounded, no defect

- `axesAtRoundStart` (adjacency 8 lowest, others 9) matches `SCORECARD.md` round-37 declaration ("adjacency 8 (lowest non-retired), operability 9, all others 9") and the held scores of rounds 38–39.
- Stagnation waiver is valid: SCORECARD records no capability row in rounds 36 ("No new capability entered"), 37 ("No new capability row"), 38 ("no capability row enters"), 39 ("No capability entered"). The claims' window (rounds 37–39) is accurate; last entry remains round-35 `webdriver-bidi-runtime-firefox`. The waived shape (frontier/coverage capability move) is the round-39 precedent.
- C1 `kind:"capability-acquisition"` is a fit, not a recount: the Playwright Firefox loopback capability has never been admitted — round 38 C2 was "not admitted because the runtime evidence is not session-bound" and round 39 C1 was "not met" (spans below the frozen window; "No capability row admitted"). The round-39 knowledge note exists, but no capability-table row does. Coverage 9 is held, not moved, by this claim — consistent with the round-36+ discipline ("no rubric authorizes an automatic scalar bump").

## 3. Findings

### F1 — HIGH (causal scope): the frozen predicate can green a run that never observed a single socket; "positive ticks" is a constant availability flag, not an observation

The capability title and surface say "loopback TCP observation", and the kill rule's term "nonpositive ticks on any sample/final sweep" reads as an observation floor. It is not:

- `observeSs`/`observeProc` return `ticks: 1` as a literal constant on command success (`scripts/playwright-firefox-egress-round39.mjs:128`, `:206`); the actual per-sample observation counts are `ss.lines` and `proc.inodes`.
- Counter v3 `usable()` (`.ufo/waves/round-40/counters/c1-sample-span-v3.mjs:9`) requires only `unavailable!==true && Number.isFinite(ticks) && ticks>0 && Number.isFinite(nonLoopback)`. No term anywhere requires `lines>0` / `inodes>0` on any sample or the final sweep.

So a session whose observation pipeline is blind — e.g. an `ss` pid-regex or `/proc` inode-attribution regression, exactly the parser classes round-39 seat CritC1SsParse/CritC1ProcParse probed — yields samples that are all "usable", all `nonLoopback:0`, and the measured command exits 0 while zero loopback sockets were ever seen. This is the surviving core of round-39 SentinelScope F1 (HIGH: "the C1 counter admits receipts with zero socket observations and cannot distinguish 'observed zero non-loopback' from 'never observed'"). The round-40 freeze closed F1's *unavailable-marker* half (fail-closed surfaces + four selftest mutants) but not its *zero-observation* half. Mitigation, not closure: the driver's in-session steps (`goto` + `waitForFunction('hydrated')` + identical screenshots) prove live loopback-served Firefox sessions ran, and the round-39 landed receipt shows the real pipeline observed 6+6 sockets — but the frozen claim does not score any of that.

Classification: defect in the frozen claim's causal scope (predicate narrower than the capability it acquires), found after freeze; not amendable by this seat. The honest runtime reading of a green result is "two cold Firefox sessions ran on loopback, both surfaces were queryable, nothing non-loopback was observed, cleanup verified" — not "loopback TCP was observed". A future freeze (not this one) should require `sockets.ss.observations>0 && sockets.proc.observations>0` per run — the smallest remediation SentinelScope already proposed; nothing in this report widens the frozen predicate.

### F2 — MEDIUM (shared inputs / instrument trust): `ss` and `ps` in the measured path resolve through the inherited PATH; no pinning, no version recorded

`observeSs` ROUND40 spawns `ss` by name (`spawnSync('ss', ['-Htnp'])`), `ownedRoots`/`ownedTree` run `/bin/bash -c 'ps -eo …'` via `sh()`, and the port-closure check spawns `ss -Hlt` — all PATH-resolved, none recorded by absolute path or version in the receipt. A directory ahead of `/usr/bin` on the scorer's PATH supplying a well-formed fake `ss`/`ps` blinds the ss surface and fabricates the ownership story while the run itself stays real. This is the round-35 lesson M4 instrument-trust class ("caller-supplied binaries … routed: the counter amendment pins the binary digests") that the BiDi counter received and this driver never did. Combined with F1 the failure mode is silent blindness rather than forgery (status≠0 or missing binary now fails closed in ROUND40 mode). Defect of the frozen instrument (kill rule has no instrument-pin terms); recommendation for a future freeze: absolute paths, recorded `ss --version`, digest-pinned instruments per QUALITY 99.

### F3 — MEDIUM (round-39 residual closure is partial and the remainder is not enumerated): one-shot owned-tree snapshot and argv-substring identity survive

SCORECARD's round-39 planned item for round 40 was to "re-freeze a TCP-only C1 predicate that requires observed sample span, both surfaces available, **refreshed/identity-bound process ownership**, and fail-closed cleanup". Delivered: span ✓, surfaces ✓, fail-closed cleanup ✓ (port closure is now positive-evidence, closing SentinelScope F2's fail-open; survivors/survivorPids cross-check closes F9's probe). Not delivered: refreshed/identity-bound ownership. `ownedRoots` still selects roots by substring match on `ps args` and `ownedTree` is snapshotted once ~400 ms after launch; late-spawned Firefox descendants and reparented escapees stay invisible to sampling, survivors, and the final sweep (round-39 RevC1Driver High#1, Medium#3; SentinelScope F4). The frozen predicate wording ("per-run owned tree is nonempty") is honest about this, so the claim is internally consistent — but the round-40 claims.json neither closes nor lists the surviving round-39 driver residuals. Defect against the lane's own written plan (silent plan-narrowing); recommendation: name RevC1Driver High#1/Medium#3 and SentinelScope F3/F4/F5 as still-open routed defects in the round-40 lesson, so "provenance hardening" is not read as driver hardening.

### F4 — LOW (shared inputs): freeze digest binding is out-of-band

The wrapper computes and records `driverSha256` but enforces no equality against `claims.json.frozenDigests`, and the kill rule has no digest term; counter and selftest digests are likewise never checked inside the measured command. Freeze enforcement therefore rests entirely on scorer discipline (the round-36/37 pattern of provenance-recorded "digests equal to the frozen pins"). Defect (enforcement gap), low because any drift is visible in git and to the freeze-integrity reviewer; recommendation: one digest-equality check in the wrapper.

### F5 — LOW (source grounding): "cited by the round-40 receipt" is not satisfiable by the frozen receipt

`claims.json.claims[0].source` says S145 is "cited by the round-40 receipt and lesson Gate". The frozen driver's receipt schema has no source/citation field (keys: schema, driver, measuredAt, playwrightVersion, fixture, runNonce, runs, refused, binding, egressNonLoopback, survivors, browserVersion, userAgent, binary — same shape as the round-39 receipt). The citation can only live in the knowledge note (`corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`, already in S145's used-by) and the future lesson. Text-vs-artifact mismatch in the freeze wording; the grounding itself is sound (below).

### F6 — LOW (kill rule enumeration): counter-enforced refusals missing from killRule, one killRule term vacuous

The kill rule does not name: run-set ≠ 2 (`run-set`), receipt schema mismatch (`schema`), a driver-refused run (`run{i}-refused`), or a malformed `firstShotSha256` (`shot-hash`). All four are enforced by counter v3 and by the wrapper (`runs.length===2`, r40 schema, exclusive out), so this is an enumeration gap, not an enforcement gap. The kill rule's "nonpositive ticks" term is vacuous (ticks ≡ 1; see F1). Recommendation-level: align kill rule wording with the counter's finding names, as rounds 37's sentence-discipline work did for its own counters.

## 4. What the freeze verifiably gets right (calibration positives)

- Freeze integrity holds end-to-end: 4/4 instrument digests match the frozen pins; claims bytes are byte-identical to the freeze commit; no post-freeze instrument edit; all superseded commits exist.
- Sentence discipline: the predicate is byte-identical at both sites that carry it (claims.json, counter constant); the wrapper carries no third copy.
- The `before` state is truthful and re-verified (799/701 ms, v2 schema, no nonce, refused with exactly the claimed findings).
- Both controls are real, committed, and reproduce at current bytes; the selftest proves the parser-only synthetic positive is selftest-scoped and that a pre-existing output is refused before the browser starts.
- Round-39 falsifier debt actually closed by this freeze: unavailable-marker synthetic zeros (RevC1Driver High#2, SentinelScope F1 second half, CritKillRules `finalSweep:{}`), coverage-`Ms` span proxy (Medium#4 — counter now uses actual sample timestamps), `portClosed` fail-open (SentinelScope F2), `survivors` vs `survivorPids` mismatch (F9 probe).
- Source grounding: S145 (proc_pid_net(5), tier A docs, freshly opened 2026-10-27, `.ufo/waves/round-40/sources/S145-open.txt` with page sha256) supports exactly the `/proc/net/tcp` `rem_address` semantics the driver's `decodeProcIp`/`isLoopbackHexRem` rely on, and its stated limits ("not UDP, not continuous egress visibility, not process ownership") match what the claim does not assert. The ss surface is host-instrument ground outside S145, consistent with those limits.

## 5. Residual risks and verification gaps

- No live measurement was run by this seat, so predicate=true at delivered revision is unverified here by design; the wrapper→driver→counter chain has never executed end-to-end pre-data (its first execution is the claim data).
- SIGKILL/OMA during a run skips the driver's `exit`-only scratch cleanup (SentinelScope F5, open in r40 mode); residue only, fail-closed for the claim.
- The measured command is pinned to this workstation's absolute paths (fnm node 24.21.0, Playwright 1.64.0, firefox-1555); portability is out of scope for a host-scoped capability, and the receipt records the binary path.
- Parallel wrapper invocations in the 64-seat wave are safe against each other (distinct `--out`, `'wx'` write flag, per-invocation nonce); the nonce rides argv and is ps-visible — acceptable for a binding token, not a secret.
- The control receipts record `predicate:false` rather than an explicit exit code; exit 1 is implied by counter behavior and was observed directly in this review's reproduction.

## 6. Defect vs recommendation split

Defects (post-freeze observations, no amendment made): F1 (high), F2 (medium), F3 (medium), F4 (low), F5 (low), F6 (low).
Recommendations for a future freeze/lesson (not applied): observation-floor terms (`observations>0`), absolute pinned instruments + recorded versions, wrapper digest equality, kill-rule wording aligned to finding names, enumerate the surviving round-39 driver residuals as open routed defects.

VERDICT finding — frozen C1 is freeze-clean, honestly grounded, and its controls and before-state reproduce, but the acquisition predicate still greens a socket-blind run (F1: "positive ticks" is a constant flag; zero ss/proc observations are admissible), the measured path trusts PATH-resolved ss/ps (F2), and the round-39 planned ownership refresh was silently dropped (F3).
