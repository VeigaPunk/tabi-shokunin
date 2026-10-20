VERDICT: BREAKS

Attacked: laneTip + git child env of scripts/check-round-contract.mjs, check-user-round-contract.mjs,
check-measurement-binding.mjs, check-adjacency.mjs AT M=6c97851034e9d8f58b135d28ff969f1f28fa2f7d (sha256 prefixes
1579a794 / 568c0421 / 388c2b49 / 5a7ea9a2; git 2.56.0). I re-ran the wave-1 probes (w1/SentinelAnchor.md E1–E7) and
added new ones (N1–N10, grep/attributes, a full-gate hostile includeIf run). Sandbox: /tmp/tabi-r17w2-SentinelAnchorAfter-CyZr (clone, detached at M).
The probes pull each gate's own `git()`/`laneTip()`/`resolveRepo()` text out of the M bytes. Fixture repos go under the sandbox only.
Repro: `PROBE_LANE=$D/lane PROBE_FX=$D/fx node $D/probe.mjs`, `PROBE_D=$D node $D/probe2.mjs`, `PROBE_D=$D node $D/c3graph.mjs`.
I did not touch the lane repo: no jj, no git writes.

## Wave-1 findings re-probed at M (4 gates each)
| id | attack | round | user | binding | adjacency |
|---|---|---|---|---|---|
| E1/F3 | lane `.git/HEAD`=`ref: HEAD` → walks up to the parent repo | refused | refused | refused | refused |
| E2/F4 | malformed HEAD (`refs/heads/x^{tree}`) | refused | refused | refused | refused |
| E3/F5 | detached, master → symref to refs/remotes/o/evil | refused | refused | refused | refused |
| E4/F1 | `git replace TIP P` | reads good | good | good | good |
| E5/F2 | inherited GIT_DIR/WORK_TREE/COMMON_DIR/OBJECT_DIRECTORY/ALTERNATE_*/REPLACE_REF_BASE/NAMESPACE/CONFIG_COUNT/CONFIG_PARAMETERS/CONFIG_GLOBAL/SYSTEM/XDG_CONFIG_HOME/CEILING (N1) | real tip | real tip | real tip | real tip |
| E7/F13 | HEAD → `refs/heads/master@{1}` | refused | refused | refused | refused |
| E6/F6 | attached off-lane branch `scratch` | certifies scratch | same | same | same |
F1–F5 and F13 are closed in all four gates. F6 is still open (declined per PLAN §C1; L1's decision). In the C1 gates, `git()` now builds its env
from scratch, with no inherited GIT_* (round :66-87, user :126-146, binding minimalEnv :186-205, adjacency :276-293).

## New: B1 HIGH — a forged commit-graph defeats the F7 ancestry guard (C3, demonstrated end-to-end)
Exploit, using exactly the F7 attacker's capability (same uid, writes to the sibling's `.git/objects`):
1. Write a dangling commit F into kaidoku (`hash-object -w` + `mktree` + `commit-tree`). No ref moves.
2. `git commit-graph write --stdin-commits` with {master, F}.
3. Binary-patch master's CDAT parent1 to point at F's index, set topo level 2, and recompute the trailing SHA-1.
The `git()` env in all four gates does not disable the commit-graph (GIT_PREFIX at binding :156 and adjacency :254 pins only fsmonitor/quotepath).
`merge-base --is-ancestor` therefore trusts the forged parent list.
Evidence (c3graph.mjs, real check-adjacency.mjs from M, fixture fleet, split-declared row citing `kaidoku-shokunin@F:PROVINCE.md:1`):
```
control (no graph):  exit=1 ... reason=sibling_unresolved ... c66bfbff… is not reachable from lane tip 1d123da2…
kaidoku git log master (graph): 1d123da c | c66bfbf forged |   (core.commitGraph=false): 1d123da c |
forged commit-graph: exit=0 ADJACENCY verdict=clean rows=1 verified=1
```
The same primitive reaches every ancestry check through each gate's own `git()` (probe N9: gate rc=0, rc=1 with commitGraph=false).
Affected sites: check-adjacency isAncestor :359 (sibling pin :690, fleet/self ruling :838, :860), round :306 and :578,
user :393, :409 and :615, binding :413. measure-c3 shares the F7 guard [INFERENCE: its git env was not probed].
Detection: `git commit-graph verify` rc=1, and `git fsck` rc=16 ("commit-graph parent list for commit … ").
Repair (smallest, verified): add `'-c', 'core.commitGraph=false'` to GIT_PREFIX in check-adjacency.mjs and check-measurement-binding.mjs.
For round/user `git()`, add `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.commitGraph GIT_CONFIG_VALUE_0=false` to the env.
Gate-env + that config gives is-ancestor rc=1 (probe "remedy N9").
Patching only GIT_PREFIX in the sandbox copy of check-adjacency.mjs turned the exploit into `exit=1 sibling_unresolved … not reachable`,
and `--self-test` stayed `ADJACENCY_SELFTEST verdict=clean cases=51` (sandbox file restored afterwards).

## New: B2 MEDIUM — object substitution under the printed tip (all four gates)
Overwriting the loose object file for the tip's blob (N7) or its root tree (N7b) keeps the same OID but changes the bytes.
laneTip prints the true tip, and every gate reads POISON through both `cat-file blob` and `show` (`tip==real:true cat-file=POISON show=POISON`).
Substituting the commit object (N7c) is refused: parse_object hash-checks commits.
This is the same class as F1 (bytes differ while the tip OID matches; invisible to `git log`/jj), but it needs raw `.git/objects` tampering.
Detection: `git fsck --no-dangling --no-progress <tip>` rc=3 "hash-path mismatch" for N7/N7b. On the sandbox lane at M: rc=0 in 0.084 s.
Repair: run `git fsck --no-dangling --no-progress <rev>` (constructed env) once per evaluated repo/rev before reading; non-zero → could_not_evaluate.
That also catches B1 (rc=16). The cheaper alternative is to recompute the SHA-1 of each object on the read path (commit→trees→blob) in JS.

## New: B3 LOW (latent) — `git grep` counts depend on uncommitted local state (round :507, user :508)
- With the repo config `grep.patternType=fixed` (set via includeIf), `grep -h -e '^command: git ls-tree' M -- SCORECARD.md` goes 16 lines → 0, rc=1 (the user gate masks rc 1 to "0").
- `.git/info/attributes` `SCORECARD.md binary` → 1 line ("Binary file … matches").
- `$HOME/.config/git/attributes` `-diff` → 1 line; HOME is passed through (round :79, user :139, binding :203, adjacency :291).
- All four `git()` helpers are affected, but only round/user run `git grep`.
- Latent: no SCORECARD counting row at M uses `git grep` (all 16 `command:` rows are `git ls-tree`, SCORECARD.md:242-377).
Repair (verified): pass `-G -a` in both grep argv lists (16 lines again under the hostile config + attributes), and drop HOME from the
constructed env (no-HOME → 16).

## New: B4 LOW — lane gitfile / linked worktree certify a different gitdir (all four)
- N3: replace lane `.git` with `gitdir: /other/.git` → all four return other's master (toplevel==root still holds).
- N4: `git worktree add wt scratch`, then `--repo wt` → certifies scratch (an E6 variant).
- Needs write access to the lane root, which is the same capability as moving master.
- The sibling check already refuses this shape (repoIdentity :524 requires absolute-git-dir == <dir>/.git); the lane check does not.
Repair: apply that same absolute-git-dir identity check to the lane root in all four gates (production mode).

## New: B5 LOW — check-adjacency resolveRepo still falls through when the lane has no `.git` (E1b)
- With the lane's `.git` deleted, adjacency resolveRepo (:461) runs discovery with no ceiling.
- Its walk only refuses when a `.git` entry exists, so it returns the fleet and certifies the fleet's tip.
- round/user/binding refuse because they require toplevel == root.
- Impact is a non-colocated or broken lane; the map is then read from the fleet (absent there), so no false-clean was observed.
Repair: require realTop === realTarget, like binding resolveRepo :334.

## Held (new probes)
- N5 `core.worktree` in repo config → all refuse (toplevel ≠ root).
- N6 alternates file: object served from the alternate store, content unchanged (content-addressed; tip and bytes good).
- N10 lane owned by `nobody` (sudo chown, fixture): all four refuse with "dubious ownership". `safe.directory` cannot be injected because
  GIT_CONFIG_GLOBAL=/dev/null and GIT_CONFIG_NOSYSTEM=1, and repo config ignores it.
- Full gates on the sandbox clone with a hostile includeIf were unchanged: round `verdict=clean rounds=10`; user `failed round_count 6/10` (same as baseline);
  binding output byte-identical (`cmp`); adjacency `clean rows=9 verified=9`. The includeIf set core.fsmonitor, core.hooksPath (7 hooks),
  core.pager, diff.external, gpg.program+log.showSignature, core.useReplaceRefs=true and safe.directory=*.
- The marker script never ran during the gate runs or the per-helper diff/log/grep calls.
  diff runs `--name-status`, log runs `--no-show-signature`, no index-refresh verbs are used, and GIT_NO_REPLACE_OBJECTS beats core.useReplaceRefs.
- Children: binding runs its children under minimalEnv. Round/user spawn `node <gate>` with an inherited env, but every child rebuilds its env in `git()` (N1).
- Side note: GIT_GRAFT_FILE=/dev/null makes every call emit the `info/grafts is deprecated` hint on stderr (cosmetic; it leaks into gitError details).

## Must-fix (smallest)
1. B1: core.commitGraph=false in all four gates' git invocation (and measure-c3 if it shares the F7 guard).
2. B2: one `git fsck --no-dangling` per evaluated repo/rev before reading (also closes B1 by detection).
3. B3–B5: `-G -a` on grep and drop HOME; lane absolute-git-dir identity; adjacency toplevel equality.

Tooling: nothing installed or updated (git 2.56.0, node v24.21.0 as found). sudo was used only for chown/rm of the fixture under /tmp.
Sandbox kept for repro: /tmp/tabi-r17w2-SentinelAnchorAfter-CyZr (clone at M, probe.mjs, probe2.mjs, c3graph.mjs). Fixtures removed.

Files written:
- .ufo/waves/round-17/w2/SentinelAnchorAfter.md
