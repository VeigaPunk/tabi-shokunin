# CritSurfaceGaps — C1 "ss and proc observations available with positive ticks" attack

Seat: critic, axis coverage, milestone falsification. Leaf, read-only on production tree. No installs, no pacman.
Frozen bytes verified at HEAD c925d92 (sha256 match claims.json frozenDigests): measure-c1-round40.mjs a0e564c7…, driver 1f8a15f0…, counter c1-sample-span-v3.mjs 0b452eac….
Mutant harness: `mutants.mjs` in this folder (copy of scratch script; reads corpus/evidence/round-39 receipt, builds a parser-only synthetic r40 positive with nonce `a`×64, mutates one field, runs the frozen counter). Output below is observed.

## Counterexamples (frozen counter accepts, exit 0, no finding)

1. **"Positive ticks" is a hardcoded constant, not an observation.** Driver lines 135 and 223: `return { ticks: 1, … }` for both ss and proc whenever the surface merely returned. Counter's `usable()` = `unavailable!==true && ticks finite >0 && nonLoopback finite`. Mutant `base-minimal-ticks1-nl0-no-lines` (`{ticks:1,nonLoopback:0}` everywhere, no `lines`/`inodes` keys at all) → exit 0. `ticks:1e-9` → exit 0.
2. **Zero observations pass.** Counter never reads `ss.lines` or `proc.inodes`. Mutant `all-surfaces-zero-observation-both-runs` (every sample `lines:0, inodes:0`, both runs) → exit 0; `lines:-5` → exit 0. A blind surface (e.g. ss `-p` returning no `users:` info, pid regex matching nothing; or proc fd dirs unreadable) is scored identically to a surface that saw the fixture's loopback sockets. Live sanity: ss -Htnp does see own-pid loopback sockets here (2 lines for a python loopback pair), and the committed round-39 receipt has sum ss.lines=6 / proc.inodes=6 per run, so real runs do have nonzero observations — the predicate just does not require them. No ss↔proc cross-agreement either.
3. **Final sweep "availability" is vacuous by construction.** The final sweep runs after `browser.close()` + 600 ms tail, on a tree that is dead; both committed runs show finalSweep `lines:0, inodes:0`. `ticks:1` there only proves `ss` exited 0 and `/proc/net/tcp{,6}` were readable, not that any owned socket was observed. Final-sweep zero-egress carries no egress information; survivor check is the only substantive post-close evidence.
4. **proc surface accepts unreadable per-pid fds.** Driver line 211 `if (s === null) continue;` (pid gone → null; also EACCES — demonstrated `/proc/1/fd` → EACCES). If every owned pid is unreadable, observeProc still returns `{ticks:1,inodes:0,nonLoopback:0}` = available. Combined with (2) the counter cannot distinguish.
5. **`unavailable` is tested with `!== true`.** `unavailable:"true"`, `1`, `null` → accepted (exit 0) if ticks/nonLoopback are valid. Not exploitable by the real driver (only emits boolean true) but the counter's reading of "unavailable" is not fail-closed against non-boolean markers.
6. **`nonLoopback:-0`** accepted (JSON `-0`→ `-0 === 0`); harmless. `ticks` fractional accepted.
7. **Extra/aggregate egress fields ignored.** Per-sample extra fields (`egressNonLoopback:7`, peer lists), run-level `sockets.*.nonLoopback:9`, `egressNonLoopback:18`, and `binding:false` all exit 0; counter trusts only per-sample/final-sweep `nonLoopback`. Acceptable only because the runner is nonce-bound and writes both; but the counter alone, given a receipt carrying the nonce, does not cross-check aggregates.

## Correctly refused (observed exit 1)
ss/proc absent, null, string, array, true, number; ticks string or 1e999(Infinity); nonLoopback missing/null/"0"/1/-1/0.5; `unavailable:true`; sample replaced by `{t,unavailable:true}`; finalSweep absent/null/`{unavailable:true}`; final ss null, final proc string / missing nonLoopback; final proc nonLoopback 2. Absent/null/non-numeric/missing-field/nonzero cases are all handled; the gaps are in what *positive* means, not in negatives.

## Scope gaps in the surface itself (not counter bugs; tradeoffs)
- TCP only: UDP (DNS, QUIC/HTTP3, mDNS) and unix sockets are unobserved; "nonLoopback zero" means zero non-loopback TCP peers seen at 100 ms samples. Connections that open and fail/close between ticks, and TIME_WAIT (inode 0) are invisible.
- proc surface skips LISTEN and all-zero remotes by design.

## Impacted axes / smallest safe correction
Axis: coverage (C1's "available with positive ticks" over-claims observation). Smallest correction without widening the predicate's intent: the counter should require per-run Σ ss.lines>0 and Σ proc.inodes>0 (the fixture necessarily makes loopback connections; round-39 shows 6/6) and treat non-boolean `unavailable` as unavailable; final-sweep claim should be reworded as "surfaces readable" rather than observed. Per the freeze these are NOT amendable now: the canonical judge should record that C1's "positive ticks" is satisfied by a constant, i.e. tradeoff-class for the frozen predicate, and any score should not cite it as observation-backed coverage beyond (a) ss exit 0, (b) both /proc/net files readable, (c) nonce/span/hash/survivor/port checks.

## Limitations
No live browser run (production tree read-only; wrapper writes under corpus/evidence). Counter attacks use parser-only synthetic receipts derived from the round-39 receipt; they are not claim receipts. Scratch /fast/scratch/hyaku/tabi-r40/CritSurfaceGaps removed before yield.

VERDICT finding C1 counter accepts availability without observation: ticks is hardcoded 1, ss.lines/proc.inodes never scored (all-zero-observation receipt exit 0), final sweep is post-death vacuous, non-boolean `unavailable` accepted; absent/null/non-numeric/missing-nonLoopback/nonzero cases all refused

Report: .ufo/waves/round-40/w1/CritSurfaceGaps/report.md
