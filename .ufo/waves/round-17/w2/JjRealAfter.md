VERDICT: HOLDS

# JjRealAfter — C1 attacked with real jj at M (6c97851034e9d8f58b135d28ff969f1f28fa2f7d)

Seat `TabiR17.JjRealAfter`. M = `6c97851034e9…` (= `refs/heads/master`); B = `5859243183c4…`.
Tools unchanged (no installs): jj 0.45.1-7c41cdeb (the probe records version), git 2.56.0, node v24.21.0.
Probe blob at M = worktree blob, sha256 `44654a8d532171dfee29f9f268ed2a466572251786b48cd49ae4b590173d3b4c`
(`git show M:.ufo/waves/round-17/probes/jj-real-probe.mjs | sha256sum` == `sha256sum` worktree).

## Attacked

The assigned falsifier of C1: do the M gates resolve **`refs/heads/master`** rather than the jj-owned git
HEAD across the three real-jj states — (1) after `jj new` (empty HEAD on no branch), (2) SHONEN.md edit +
`jj new` (snapshot-only HEAD), (3) counted-input edit + `jj new` (clean second sandbox)? Criterion: each
state's verdict equals the base state's and every resolved anchor (`at=`) equals M — against B's results
in `w1/C1JjRealProbe.md`.

## Evidence — assigned probe at M

`node .ufo/waves/round-17/probes/jj-real-probe.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d` → exit 0,
100 steps, `errors=[]`, both sandboxes `removed=true`, 9.39 s. Run twice: `verdict` and the full per-state
gate tuple identical; only jj commit ids differ.

| state (M) | HEAD / refs containing it | check-round-contract | check-measurement-binding (`--json at`) | B (w1 report) |
|---|---|---|---|---|
| `base` | HEAD=M on master, origin/master | exit 0 `verdict=clean rounds=10` | exit 1 `failed claims=2 bound=0`; C1 `counted_input_changed paths=scripts/check-measurement-binding.mjs,scripts/selftest-measurement-binding.mjs`; C2 `paths=corpus/README.md,corpus/SOURCES.md`; **at=M** | clean, at=B |
| `after-jj-new` | HEAD `9af7ac5d1bd7` (empty), **refs=[]** | exit 0 `clean` — byte-identical to base | byte-identical to base; **at=M** | clean, at=HEAD `59ea0d3d` |
| `after-snapshot-content` | HEAD `01293781`, **refs=[]**; `HEAD:SHONEN.md`=`61da6620` = worktree ≠ master `9dcb2687`; tree≠master | exit 0 `clean` — identical to base | identical to base; **at=M** | **failed `shonen_policy`**, at=HEAD `00d5d09b` |
| `counted-input-offbranch` (2nd sandbox) | HEAD `f183854d`, **refs=[]**; `HEAD:scripts/selftest-measurement-binding.mjs`=`cdacc285` = worktree ≠ master `becb683a` | exit 0 `clean` — identical to base | identical to base; **at=M** | **failed, C1 `counted_input_changed paths=selftest`**, at=HEAD `7eb0fe16` |

- Equality: RC stdout+stderr and MB stdout+stderr are identical to `base` in all four states (normalized
  only ISO timestamps and `/tmp` paths); 1 distinct RC blob and 1 distinct MB blob across the run.
- `at=M` in all four states, including both off-branch-HEAD states where B resolved `at=HEAD`.
- All off-branch states: `detached=true`, `refsContainingHead=[]`, `status --porcelain` 0 lines,
  `masterIsAncestorOfHead=true`. Probe verdict at M: `baseline_reads_jj_head=false`,
  `round_contract_reads_jj_head=false`, `measurement_binding_reads_jj_head=false`,
  `expectation.matched=false` — **the expected inversion** (the probe encodes B's expectation
  `baseline_reads_jj_head=true`; false at M is the pass, not a failure).
- LANE untouched: before/after both runs `git rev-parse HEAD` = `refs/heads/master` = M; the only
  `git status --porcelain` entries are sibling seats' untracked `w2/` and `drafts/` files.

### The base-state MB red is the gate working, not a break

It is the r16 manifest checked at the r17 tip: M changed exactly the four paths the finding names, so
`counted_input_changed` is correct semantics for an r16 claim evaluated at M. Consequence for counters:
once `base` is dirty, verdict equality alone no longer separates "reads tip" from "reads HEAD"; `at` is
the discriminator. I supplied the clean discriminator below.

## Supplementary real-jj measurement (the gate the probe omits + sensitivity controls)

Own sandbox `/tmp/tabi-r17w2-JjRealAfter-_t0dct0f` (clone → `checkout --detach M` → `update-ref master M`
→ `jj git init --colocate` with `jj-lane.sh`'s config; removed after).

1. `check-user-round-contract.mjs` (third C1 gate) production in all four states: identical in every
   state, including the two off-branch ones — `USER_ROUND_CONTRACT verdict=failed finding=round_count
   detail=Found 6 user rounds, expected 10`, exit 1. Same line at B (plain clone at B, same gate): the
   red is inherited and documented at M (`SKILL.md:1678` "inherited six-of-ten `round_count` is still
   failed"; `:1800` "current production remains failed6/10"), not a C1 regression. The gate is
   tip-anchored but cannot certify *clean* at the tip.
2. RC sensitivity (same HEAD, different branch tip): in the SHONEN state (HEAD `8860ee28`, no refs) the
   gate is clean; `git update-ref refs/heads/master HEAD` → exit 1
   `ROUND_CONTRACT verdict=failed finding=shonen_policy detail=SHONEN.md has non-canonical prose after the four boxes:`;
   restoring `master=M` → exit 0 `clean`. Verdict follows the branch tip, not HEAD.
3. Confound-free counted-input arm: a copy of the r16 manifest with `measuredRevision`/`after.revision`=M
   (written outside the repo, passed to `--check`): clean (exit 0, at=M) at base, after `jj new`, after
   the SHONEN edit, and **after the unlanded `scripts/selftest-measurement-binding.mjs` edit**; moving
   `master` to that unlanded commit → exit 1 `failed counted_input_changed paths=scripts/selftest-measurement-binding.mjs`
   `at=317a7d08… bound=1`; restoring `master=M` → clean, `at=M`, `bound=2`, while HEAD stayed off-branch.
4. Printed-anchor receipts under off-branch HEAD `8860ee28` (refs=[]):
   `check-round-contract --count-witness 1212207fd7fad4adf1df1b3a2bde549235bd144d` → exit 0,
   `code_revision=6c97851034e9d8f58b135d28ff969f1f28fa2f7d code_committed=yes … result=PASS`;
   `check-user-round-contract --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` → exit 0,
   `measuredRevision=M codeRevision=M`;
   `--witness 75e7836b…` → exit 0, `measuredRevision=M codeRevision=M head-blob=9ebe3119… worktree-blob=9ebe3119… committed=yes`.

Code at M: `check-round-contract.mjs:114-156` `laneTip`, production `:651 const rev = laneTip(root)`
threaded into `checkHistory`/`roundIds`/`show`; `check-measurement-binding.mjs:267` `laneTip`,
`:941 atRev = options.at === null ? laneTip(repo) : …`; `check-user-round-contract.mjs:160 laneTip`,
`:692 const tip = laneTip(root)`, `:346`/`:392`/`:422` etc. read tip. PRODUCTION RC prints no revision
field (only `--count-witness` prints `code_revision=`), so an off-branch HEAD whose tree equals master
is invisible to output comparison alone — that is why the branch-move control, not output equality, is
the decisive RC witness.

## Risks (no repair required for C1 as stated)

1. `check-user-round-contract` resolves the tip repeatedly — 13 call sites reachable from production
   `check()` (`:249,312,334,346,392,422,527,558,577,609,625,646,654`) — while the C1 interface contract
   says "resolve ONCE per process and thread the 40-hex". Latent mixed-verdict race, currently
   unreachable: at M the gate aborts at `round_count` (`:693`) before the per-round reads. If closed:
   resolve once in `check()`, pass `tip` into the helpers as RC does.
2. The r16 manifest is red at the r17 tip by construction; any counter entry that judges the default
   `--at` arm by verdict cannot be sensitivity-tested at M (base is already failed). Use `--json at` /
   the synthetic manifest arm above.
3. Probe booleans are baseline-semantics: at M `expectation.matched=false` and
   `round_contract_clean_on_offbranch_head=true` mean "reads the tip, not HEAD". Reading them at face
   value inverts the finding; `measurement_binding_clean_on_offbranch_head=false` likewise because
   `at=M≠HEAD` is the correct direction.
4. `check-user-round-contract` cannot print clean at the tip until ten user rounds exist, so its
   anchoring is evidenced only by state-invariance plus the printed `codeRevision`/`committed=yes`
   receipts above.

Repair (only if the multi-resolution in risk 1 is in scope): one `laneTip` in `check()` threaded as an
argument to `checkHistory`, `roundIds`, `pstackDrift`, `lessonDrift`, `checkSpec`, `checkSwarm`.

Files written:
- `.ufo/waves/round-17/w2/JjRealAfter.md`
