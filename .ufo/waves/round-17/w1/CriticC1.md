VERDICT: ISSUES

# CriticC1 — attack on C1 (jj-safe lane-tip anchoring), wave 1

Read-only. My sandbox was `/tmp/tabi-r17-CriticC1-3pM2` (`git clone --no-hardlinks LANE`). The clones are deleted. Mutants are kept in `keep/` for the counter seat. I ran `jj` only in a sandbox clone with a bare remote, not in LANE. No tools installed. Baseline REV = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`.
Poisons, built with plumbing (`commit-tree`); the worktree stays at REV:
- P = REV plus: drop `corpus/lessons/pstack-20261015-r10.md`, append to SHONEN.md, append to `scripts/check-round-contract.mjs`. This follows the PLAN:92-94 style.
- P2 = REV plus 2 newlines appended to `corpus/evidence/user-20261015-r01/spec.json`.
- O = an orphan commit whose tree equals REV's tree (same content, no common ancestry).

## A1 — "a real operability move, not a relabel": HOLDS for production paths, NEEDS-CHANGE for witness entries
- Real part: the production gates read committed state through HEAD in 20+ places. Baseline `check-round-contract.mjs:119,170-177,231-233,266,466-587` and `check-user-round-contract.mjs:167,230-262,308-338,443-610`. A detached HEAD that is not master does change verdicts. Baseline gate, arm B (HEAD→P): `exit 1 shonen_policy`. Arm A: `exit 0 clean rounds=10`. A realistic non-jj path to HEAD≠master also exists. In the jj sandbox, a plain `git commit` on the jj-detached HEAD gave `HEAD=51c76ed master=e3bda95`, and `git branch --contains HEAD` printed `* (no branch)`. The lane-tip anchor closes this.
- Relabel part: the round `--count-witness` mode reads live HEAD only for the printed label. `check-round-contract.mjs:1007` is `code_revision=rev-parse HEAD`, and `:1008` is `code_sha256 = sha256(readFileSync(script))`, i.e. the worktree bytes.
  - Test: the gate ran with `--count-witness bebe2efc…` and one uncommitted edit to the worktree. It printed `code_revision=5859243… code_sha256=2c2f86a2…` and `result=PASS`. The committed blob at 5859243 hashes to `8a573b4e…`.
  - So the receipt credits bytes to a revision that does not contain them. C1 changes only which revision is named (HEAD→tip). The false attribution stays. This is the live state of this round: seats are editing the gates uncommitted.
  - For this entry, arm C ("C differs from A") is met only because the label changes.
  - The user gate already guards this case (`check-user-round-contract.mjs:794-796`: `measuredRevision = committed ? codeRevision : 'uncommitted'`). The round gate has no such guard.
- Repair (GateRoundAnchor): the round count-witness line should print `committed=yes|no` and `measured_revision=<tip>|uncommitted`, comparing the worktree blob with the tip blob, as the user gate does. Alternatively, drop this entry from the count, or count it as label-only. Counter: add arm W (worktree gate script edited, uncommitted). In W, a 40-hex revision field may be printed only next to `committed=yes`.

## A2 — "the before count is honest": NEEDS-CHANGE (wording and scope, not the number)
- The before value of 0 is an honest property of the code: baseline gates differ between A and B.
- "Would certify an unlanded HEAD in practice" is overstated.
  - Lane reflog: one jj event, `.git/logs/HEAD` last line `0000… 5859243… export from jj`. Live state is HEAD = master = 5859243 (`git rev-parse HEAD master`). HEAD≠master has never been observed in this lane.
  - The helper keeps HEAD == master. `jj-lane.sh:231-233` sets the bookmark to `@-`, which is git HEAD. Push recovery (`:121`, `rebase -b`) moves `@` along with the tip.
  - The remaining helper window is a `bookmark set` failure after `jj commit` (`:233-234`, exit 1). That leaves an off-branch HEAD.
- Strongest counterexample against "landed": I ran the helper exit-3 path in the sandbox (remote made read-only, then `jj-lane.sh commit` exited 3). Result: `HEAD=master=e3bda95…`, `origin=5859243…`, `state … ahead=1 head=detached`.
  - `laneTip()` resolves `refs/heads/master` = e3bda95, which is an unpushed commit. This is the one unlanded state the helper itself produces, and C1 certifies it exactly as baseline does.
  - PLAN:21 says "unlanded/empty". The fix guarantees "on the lane branch", not "landed".
- Arm B (HEAD has content the worktree lacks) is synthetic. Under jj, worktree content always includes @- content.
- Repair (L1 wording): claim and lesson should say "branch-anchored (no off-branch HEAD), not landed/pushed". Record the exit-3 state as a residual limit. A landed anchor would be `origin/master` plus an ahead=0 check. Do not change the anchor this round: the PLAN contract is coherent as written.

## A3 — "the counter is not gameable": FAILS as specified. Arm C closes only the never-reads-git game.
- Arm C does work against a gate that reads no git. Such a gate gives C == A, so it fails the "C differs" rule. That part holds.
- Counterexample 1, ancestry and mode reads are invisible to a descendant poison (`keep/mutant-partial2.mjs`, sha256 `4f719527…`).
  - The mutant is the baseline round gate with every `show/list/blob` read and checkHistory's head moved to master. It keeps `merge-base --is-ancestor baseline HEAD`, `merge-base measured HEAD` (`:504`) and `ls-tree HEAD` (`:119`).
  - Arms: A `0 clean`; B(P) `0 clean` (= A); C(P) `1 shonen_policy` (≠ A). The mutant counts as jj-anchor-safe.
  - Arm B2 (HEAD→O) gives `1 history_rewritten` ≠ A, so B2 catches it. P is a child of REV, so every ancestry check is unchanged by P.
- Counterexample 2: in arm A the user production gate stops early, so most of its reads never run (`keep/mutant-user.mjs`, `c54d6e29…`).
  - Baseline user production in arm A is `exit 1 round_count 6/10`. It stops at `:602`, before every read at `:607-625` (SCORECARD, LOG, lessons, spec, swarm, report ancestry `:529`, `sameTree`).
  - The mutant moves only reads at lines <360 and leaves 15+ `'HEAD'` reads (`:444-610`, `:790-955`). Arms: A `1 round_count`, B(P) `1 round_count` (= A), C(P) `1 history_rewritten` (≠ A). It passes, and also passes B2.
  - A fixture-mode run catches it. Run the gate from outside the clone with `--repo <clone> --baseline 7f506aff… --expect 6`: baseline arm A is `0 clean rounds=6`, 7 lines. With P2, the full loop runs and arm B gives `evidence_moved` ≠ A for both the baseline and `keep/mutant-user-fixture.mjs`.
  - That catch only works with a poison on loop inputs. P touches only checkHistory inputs, so it stops the gate at checkHistory and hides the loop again.
- Counterexample 3: the entry list leaves out a live HEAD-reading mode. User `--self-test` reads `show(defaultRoot,'HEAD','SCORECARD.md')` and `roundIds(defaultRoot)` (`:1267-1268`), then runs live count commands. GateUserAnchor's work-in-progress diff converts `:1268`, but no counter entry measures it. The round gate's `--witness` mode correctly has no live HEAD read (`:933-970`).
- Repair (C1Counter, smallest):
  1. Add arm B2, HEAD detached at O. Every entry must give B2 == A.
  2. Add fixture entry `user --repo S --baseline HARD --expect 6`, run from a gate copy outside S, with a poison on loop inputs (P2: `user-…-r01/spec.json`, plus a SCORECARD change).
  3. Treat an entry as passing only when arm A runs its full read path. A production exit 1 that stops before the reads is "uncovered", not "pass".
  4. Add the user `--self-test` entry, or record why it is dropped. Use a SCORECARD poison for it.
  5. Optional: add a counter-owned static residual check. It lists every `'HEAD'` git argument in the gate blob at REV outside fixture-only functions, cross-checked with `c1-sites.json`. The after count may credit an entry only if no live site remains.

## A4 — "leaving check-freshness unfixed is an honest why-not": HOLDS, with two needed clarifications
- The freeze is real and covers the whole file:
  - `protectedPath` at `check-round-contract.mjs:101` and `check-user-round-contract.mjs:151`.
  - User `pstackDrift` `:269` returns drift for any change to `scripts/check-freshness.mjs`.
  - The bytes are pinned in committed evidence: `pstack-20261015/baseline-census.tsv:57` blob `987c3267…`, and the user-round seats `s28`/`s30` `result.json` record sha `93d19637…`.
  - `.ufo/rounds/fleet-round-1…/gate-witness*.json` run it with hex witnesses.
  - Editing the file would turn both production gates red, so this is a harm-axis refusal.
- Clarification 1: freshness has no HEAD read in code. JjAudit's site table covers `:65-94`: every live read is the `<witness>` argument or `<baseline>`. The hazard is the caller's argv (`--witness HEAD`, JjAudit F6). Excluding it from the count is correct, and the claim must not say "all round gates" are anchored.
- Clarification 2: the proposed SKILL rule `--witness "$(git rev-parse --verify refs/heads/master)"` is not enforced, and it differs from `laneTip` when HEAD is attached to a non-master branch. Write it as `git rev-parse --verify --end-of-options refs/heads/master^{commit}`, labelled "detached-lane form". The why-not should also say that the ROUND_SCRIPT identity-chain precedent (`check-user-round-contract.mjs:29-40`) shows an unfreeze path exists. It was rejected as a tradeoff, because round-1 closeout receipts and the census pin bind these bytes. It is not impossible.

## Impacted axes
- operability (C1 count): the after value is inflated by A3 and by the A1 label-only entry.
- harm: none found (the freshness freeze is respected).
- calibration: A2 wording ("unlanded").

## Smallest safe correction (summary)
1. Counter: arm B2 (orphan tree), a full-read fixture entry for the user gate, a full-path requirement for arm A, the user `--self-test` entry, and arm W.
2. Round count-witness: `committed`/`measured_revision` guard.
3. L1: "branch-anchored, not landed" wording plus the exit-3 residual; the freshness why-not clarifications.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/CriticC1.md
- /tmp/tabi-r17-CriticC1-3pM2/keep/{mutant-partial2.mjs,mutant-user.mjs,mutant-user-fixture.mjs} (cited counterexamples; outside LANE)
