VERDICT: PASS

Ticket: reproduce JjAudit F6 (`check-freshness --witness HEAD` is clean and prints `revision=HEAD`) and
verify PLAN's why-not (check-freshness is byte-frozen by `protectedPath` in both round gates, so the
F6 code fix turns the gates red). Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`.

Review target is the commit, not the worktree: while this review ran, wave-1 seats were editing the
lane (`git status --porcelain` → `M scripts/check-round-contract.mjs`, `M
scripts/check-user-round-contract.mjs`, `M scripts/check-measurement-binding.mjs`, `M
scripts/selftest-measurement-binding.mjs`, `?? scripts/check-adjacency.mjs`, `?? corpus/evidence/round-17/`,
`?? .ufo/waves/round-17/`). Every line number below is read from `git show 5859243:<path>`; line
numbers from the live worktree would already be stale (e.g. the worktree copy of
check-round-contract.mjs hashes 89e80b46… vs committed 8a573b4e…). No jj and no git write in LANE;
all write probes ran in `/tmp/tabi-r17-RevF6Repro-G53j` (`git clone --no-hardlinks`, removed after
this report). No tools installed or upgraded.

## 1. F6 reproduces exactly — PASS

```
$ git clone --no-hardlinks LANE /tmp/tabi-r17-RevF6Repro-G53j; cd there
$ git rev-parse HEAD       → 5859243183c4d7ac5429dfdb8a73ce0d9a43d583   (HEAD attached to master)
$ node scripts/check-freshness.mjs --witness HEAD
PIN_MATCH … (34 rows)
FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3
  revision=HEAD baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
$ echo $?                  → 0
```

`revision=HEAD` is printed literally by `scripts/check-freshness.mjs:114`
(`revision=${witness ?? 'worktree'}`). The accepting branch is `:49`: `--witness` takes any value
that does not start with `--`; there is no revision syntax check (the only `^[a-f0-9]` patterns are
the persisted baseline `:62`, the pin columns `:85`, and the source anchor `:86`). F6's descriptor
"accepts a non-hex revision (`HEAD`)" holds; option injection is refused as JjAudit said.

Hazard demonstrated, not just cited: same sandbox, empty commit made with `git commit-tree`
(`e874ca560ada632feb2b04b0a6cf6e71bff8d729`), HEAD detached there (`git symbolic-ref -q HEAD` exit 1;
`git branch --contains HEAD` → `* (no branch)`; `git merge-base --is-ancestor HEAD refs/heads/master`
exit 1). `node scripts/check-freshness.mjs --witness HEAD` again printed `verdict=clean …
revision=HEAD`, exit 0, and `node scripts/check-round-contract.mjs` also printed `verdict=clean
rounds=10`, exit 0. The unfixed gates therefore certify a revision on no branch — C1's premise —
and the byte-freeze does not change that.

## 2. Both round gates freeze check-freshness.mjs by protectedPath — PASS

`scripts/check-round-contract.mjs:94-103` has `|| path === 'scripts/check-freshness.mjs'` at `:101`;
`scripts/check-user-round-contract.mjs:144-153` has it at `:151` — exactly the blocks PLAN cites.
Both gates pin `HARD_BASELINE = 7f506affa55f6fb892d3c8073c75151c998bdf2c`
(check-round-contract.mjs:11, check-user-round-contract.mjs:12), and the frozen file has not moved
since it:

```
git ls-tree 7f506aff… -- scripts/check-freshness.mjs → 100755 blob 987c3267f1781db643e0269942a126ca9fee814a
git ls-tree HEAD(5859243) -- scripts/check-freshness.mjs → 100755 blob 987c3267f1781db643e0269942a126ca9fee814a
sha256 of both blobs and of the worktree file → 93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b
```

Patch arm (sandbox, appended one comment line, commit 7c97b95):

```
node scripts/check-round-contract.mjs
→ ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Protected bytes changed: scripts/check-freshness.mjs   exit 1
node scripts/check-user-round-contract.mjs
→ USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Protected bytes changed: scripts/check-freshness.mjs   exit 1
```

Both messages come from the protected loop (`check-round-contract.mjs:237/239`,
`check-user-round-contract.mjs:315`), so the clause — not some other check — is what fired.

Attribution controls in the same sandbox:
- `git reset --hard 5859243` restores the frozen bytes → `ROUND_CONTRACT verdict=clean rounds=10 consequential=0`, exit 0.
- commit an unprotected change (append to `AGENTS.md`) → round gate still `verdict=clean`, exit 0.
So the red is specific to that path, not to "any new commit".

Would-be fix arm: adding the one-line guard
`if (options.witness !== undefined && !/^[a-f0-9]{7,40}$/.test(options.witness)) fail('usage', '--witness takes one git revision id', 2);`
turns `--witness HEAD` into `FRESHNESS_GATE verdict=could-not-evaluate finding=usage`, exit 2, leaves
the 40-hex witness clean (`revision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, exit 0) — and both
round gates go red with `Protected bytes changed: scripts/check-freshness.mjs` (same lines as above).
PLAN's "the `--witness HEAD` acceptance is NOT fixed in code" is correct.

## 3. Why-not is a lock stack, not one line (input for the L1 wording)

Deleting only the `protectedPath` clause does not unfreeze it:
- round gate, clause removed, freshness changed (commit 80228fa) →
  `ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Census blob drifted: scripts/check-freshness.mjs`, exit 1.
  Cause: `corpus/evidence/pstack-20261015/baseline-census.tsv:57` pins
  `987c3267… scripts/check-freshness.mjs`, and `check-round-contract.mjs:261` requires the HEAD blob
  to equal that row (`:30 CENSUS_SHA256`, `:184 Census identity changed`).
- Editing the census row cannot legalize the change: `:252` requires the same row to equal the
  HARD_BASELINE blob, so it fires instead (`Census baseline drifted: scripts/check-freshness.mjs`,
  observed). Only gate logic can exempt the path.
- The user gate freezes the same file twice: `protectedPath :151` and `pstackDrift :269`
  (`Pstack bytes changed: …` at `:334`); removing `:151` alone still fails at `:269`.
- Lifting the round gate's pins trips the user gate's identity chain: after editing
  check-round-contract.mjs (sha 765a0a74…) the user gate reported
  `USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: M scripts/check-round-contract.mjs`,
  exit 1, via `acceptedRoundScript` (`check-user-round-contract.mjs:226-245`, constants `:29-41`).
  That function requires every round-gate blob in `92d700d…..HEAD` to be an archived identity and
  HEAD's blob to be prior-or-current, i.e. the L1's integration-time constant rotation.

Not executed (verification gap): I did not finish a full unfreeze+rotation and observe green; that
a correctly rotated chain passes is code-read (`:239` puts CURRENT into the archived set, `:38-41`
puts it into the accepted set), not observed.

## 4. Residual risk (non-blocking)

1. The freeze covers committed history only. With check-freshness.mjs modified but uncommitted, the
   round gate returned `verdict=clean`, exit 0 (worktree sha256 a28b454c…, frozen 93d19637…);
   `grep -c worktree` on the committed gate = 0. Node executes the worktree file, so a gate run
   taken before the jj snapshot/commit is not constrained by this freeze. Under jj that window is
   short, but a receipt can precede it.
2. The identity chain terminates unanchored at the user gate: `grep -c check-user-round-contract
   scripts/check-round-contract.mjs` = 0, so nothing pins the user gate's own bytes; its
   `ROUND_SCRIPT_*` constants are self-attestable by whoever edits that file. Relevant this round
   because GateUserAnchor edits the file (constants reserved to L1).
3. The F6 name is reachable from the registry: `SKILL.md:1559` documents
   `node scripts/check-freshness.mjs --witness REV`. PLAN's mitigation was verified in LANE:
   `git rev-parse --verify refs/heads/master` → `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, and
   `node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"` →
   `verdict=clean … revision=5859243183c4d7ac5429dfdb8a73ce0d9a43d583`, exit 0. It fails closed
   (rev-parse error) if the branch ref is absent.
4. Baseline context, not a regression: the user gate is red on `round_count` (6 user lessons vs
   expected 10) at 5859243, documented as inherited in `SKILL.md:1678` ("inherited six-of-ten") and
   `:1800` ("remains failed6/10"). `checkHistory` runs at `:600` before `:602`, so the
   `history_rewritten` results above are not masked by it.

## 5. Citation nit in the routed evidence

`JjAuditTabi.md:187` cites `scripts/check-freshness.mjs:51`; at 5859243 `:51` is the argument loop's
closing brace and the accepting branch is `:49` (the file is byte-frozen since 7f506aff, so no
revision explains the offset). The cross-gate pointers are exact at this baseline:
`check-round-contract.mjs:211` and `check-user-round-contract.mjs:291,295`. F6's substance is
unaffected.

## 6. PASS rationale

F6 reproduces with the exact line PLAN cites (`verdict=clean`, `revision=HEAD`, exit 0), the jj-like
off-branch variant is cleaner still (gate green on a commit on no branch), and the byte-freeze
claimed in PLAN is real in both gates, attributed to `protectedPath` by message, differential
controls, and blob identity. The why-not is stronger than stated: freshness has two independent
freezes in the round gate (protectedPath and census row/identity) and two in the user gate
(protectedPath and pstackDrift), and the round gate's own bytes are pinned by the user gate — so
landing the F6 fix is a coordinated L1 change, not a one-line edit. Residual risks above are limits
of the mechanism, not defects in PLAN.

Files written: .ufo/waves/round-17/w1/RevF6Repro.md
