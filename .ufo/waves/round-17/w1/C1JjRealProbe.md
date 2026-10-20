VERDICT: PASS

# C1JjRealProbe — independent falsifier of C1 with real jj 0.45.1

Seat: `TabiR17.C1JjRealProbe-2`. Artifact: `.ufo/waves/round-17/probes/jj-real-probe.mjs` (new,
480 lines, sha256 `44654a8d532171dfee29f9f268ed2a466572251786b48cd49ae4b590173d3b4c`, self-reported
`probe.sha256` in every run matches `sha256sum`). jj `/home/vgpnk/.local/bin/jj` =
`jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`; git 2.56.0; node v24.21.0. No tools installed.

Answer to the assigned question at baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`:
**yes — both production gates read the jj-owned git HEAD, as expected** (`verdict.expectation.matched
= true`). `check-round-contract` fails on unlanded snapshot bytes; `check-measurement-binding`
resolves `--at` to HEAD and goes red on an unlanded counted input.

## What the probe does (all writes in /tmp; jj never runs in LANE)

1. `git clone --no-hardlinks LANE <tmp>/lane`; `git remote set-url origin LANE` (self-contained).
2. `git checkout -q --detach REV`; `git update-ref refs/heads/master REV`.
3. `jj --config 'snapshot.auto-track="none()"' git init --colocate .` then the four
   `jj config set --repo` keys and `bookmark track master@origin` exactly as
   `scripts/hyaku/jj-lane.sh:145-163` (helper read at those lines).
4. States: `base`; `after-jj-new` (`jj new`); `after-snapshot-content` (append to `SHONEN.md`,
   `jj new`); plus a second pristine sandbox `counted-input-offbranch` (append one comment line to
   `scripts/selftest-measurement-binding.mjs`, `jj new`) so the binding red has a single cause.
5. After every state: `node scripts/check-round-contract.mjs` (production, no args) and
   `node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json`
   (no `--at`), plus the same binding argv with `--json` to read the resolved revision. Each state
   also records `git rev-parse HEAD`, `refs/heads/master`, `symbolic-ref -q HEAD`,
   `for-each-ref --contains HEAD refs/heads refs/remotes`, `git status --porcelain`,
   `git rev-parse HEAD:SHONEN.md` vs `refs/heads/master:SHONEN.md`, and `jj log -r '@|@-|master'`.
6. stdout is exactly one JSON object; exit 0 = measured, 1 = probe error (sandboxes kept on error).
   Sandboxes removed on success (`sandboxes[].removed=true`; `ls -d /tmp/tabi-r17-C1JjRealProbe-*`
   → none after every run). Run time 8.6-9.1 s.

Commands used (LANE cwd for the probe; gate cwd = sandbox):
```
node .ufo/waves/round-17/probes/jj-real-probe.mjs 5859243183c4d7ac5429dfdb8a73ce0d9a43d583   # exit 0
node .ufo/waves/round-17/probes/jj-real-probe.mjs                                            # default REV=refs/heads/master, exit 0
node .ufo/waves/round-17/probes/jj-real-probe.mjs --help                                     # JSON usage, exit 0
node .ufo/waves/round-17/probes/jj-real-probe.mjs deadbeef…                                  # exit 1, errors=["revision did not resolve to 40-hex: (empty)"]
```

## Baseline verdict per state (final run; jj change ids are per-run, verdict is invariant)

| state | HEAD | refs containing HEAD | HEAD tree == master tree | check-round-contract | check-measurement-binding (`--json at`) |
|---|---|---|---|---|---|
| `base` | `5859243183c4…` (= master) | master, origin/master, origin/HEAD | yes | exit 0 `verdict=clean rounds=10` | exit 0 `clean`, `at=5859243183c4…` |
| `after-jj-new` | `59ea0d3de993…` | **none** | yes (empty commit) | **exit 0 clean** | **exit 0 clean**, `at=59ea0d3de993…` |
| `after-snapshot-content` | `00d5d09b7ba3…` | **none** | no | **exit 1 `failed finding=shonen_policy`** | exit 0 clean, `at=00d5d09b7ba3…` |
| `counted-input-offbranch` (clean sandbox) | `7eb0fe165bf0…` | **none** | no | exit 0 clean | **exit 1 `failed`, `counted_input_changed`**, `at=7eb0fe165bf0…` |

All three off-branch states: `detached=true`, `masterIsAncestorOfHead=true` (HEAD is a linear
unlanded descendant of master), `git status --porcelain` = **0 lines**, and
`git rev-parse HEAD` ≠ `refs/heads/master`. Verbatim gate lines (stderr for failures; the gate's
`fail()` path writes there):

```
ROUND_CONTRACT verdict=clean rounds=10 consequential=0
ROUND_CONTRACT verdict=failed finding=shonen_policy detail=SHONEN.md has non-canonical prose after the four boxes:
MEASUREMENT_BINDING verdict=clean claims=2 bound=2
MEASUREMENT_BINDING verdict=failed claims=2 bound=1
finding claim=C1 reason=counted_input_changed detail=paths=scripts/selftest-measurement-binding.mjs
```

Decisive facts:
- `after-jj-new`: `SHONEN.md` blobs at HEAD and master are identical, yet HEAD is on **no branch**;
  both gates print clean for a commit no bookmarked branch names. `jj new` exports git HEAD to the
  *previous* empty working-copy commit (`jj log`: `@` = a newer empty commit, `@-` = HEAD).
- `after-snapshot-content`: `HEAD:SHONEN.md` = worktree blob `61da6620…` ≠ `master:SHONEN.md`
  `9dcb2687…`; the contract gate parses those unlanded bytes (committed blob at REV:
  `scripts/check-round-contract.mjs:170` `blob(root,'HEAD',SHONEN_PATH)`, `:231-232`
  `rev-parse HEAD` + `merge-base --is-ancestor baseline <head>`). Binding stays clean because
  `SHONEN.md` is not one of its counted inputs, but its `--json` `at` field equals the off-branch
  HEAD (`scripts/check-measurement-binding.mjs:833`, committed blob at REV:
  `resolveCommit(repo, options.at ?? 'HEAD', '--at')`).
- `counted-input-offbranch`: `HEAD:scripts/selftest-measurement-binding.mjs` = worktree blob
  `23e9fe59…` ≠ `master:` `4a255857…`; binding fails `counted_input_changed` with
  `paths=scripts/selftest-measurement-binding.mjs` (committed blob at REV:
  `scripts/check-measurement-binding.mjs:505-507` `diffNames(measured, atRev, diffInputs)` →
  `REASON.countedInputChanged`), while the contract gate still prints clean — a "clean" that
  certifies a tree on no branch.

## Reproducibility / non-interference

- Two identical runs: `verdict` identical (`reads_jj_head=true`, `round_contract=true`,
  `measurement_binding=true`, `clean_on_offbranch_head=true` for both gates, `expectation.matched=true`);
  only the jj commit hashes differ.
- LANE untouched: `git rev-parse HEAD` and `refs/heads/master` stayed `5859243183c4…`; the
  `git status --porcelain` listing was byte-identical before and after the run (6 entries: the four
  sibling-modified gate files, `?? corpus/evidence/round-17/`, `?? .ufo/waves/round-17/`). No jj
  invocation with cwd in LANE; a runtime guard rejects any jj cwd outside the sandbox realpath.
- 100 recorded steps, 0 `errors[]` in both successful runs.
- Byte provenance: the probe clones committed history (`git clone --no-hardlinks LANE`), so every
  sandbox runs the gate bytes committed at REV, never a seat's uncommitted working-tree edits. At
  report time other wave seats had uncommitted edits in exactly the gate files under test
  (`git status`: `M scripts/check-round-contract.mjs`, `M scripts/check-user-round-contract.mjs`,
  `M scripts/check-measurement-binding.mjs`, `M scripts/selftest-measurement-binding.mjs`;
  `git diff --stat` = 283 insertions, 90 deletions). The line citations above were therefore taken
  from `git show 5859243:<path>`, not from the working tree.

## Risks / handoff (for L1 + C1Counter, not defects in this artifact)

1. `check-round-contract` production prints **no revision field**, so an off-branch HEAD whose tree
   equals master (the real `jj new` state) is indistinguishable from the attached-tip state by output
   comparison alone. A counter arm built only on A/B output equality must poison the worktree tree
   (as PLAN.md's commit-tree P does); self-tests should additionally assert the *resolved anchor*,
   e.g. via a printed revision or `check-measurement-binding --json at`, or the empty-HEAD case is
   invisible.
2. The probe depends on jj 0.45.1 colocation export behavior (`jj new` leaves git HEAD at the prior
   empty `@`); the run records `tools.jj.version` and full `jj log` per state so a future jj version
   change is visible rather than silent.
3. Gate stdout/stderr split is load-bearing: `check-round-contract` writes its failing verdict to
   stderr. Parse both streams (the probe does).

Files written:
- `.ufo/waves/round-17/probes/jj-real-probe.mjs`
- `.ufo/waves/round-17/w1/C1JjRealProbe.md`
