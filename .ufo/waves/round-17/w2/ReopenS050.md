VERDICT: ISSUES

Attacked: S050 `Jujutsu CHANGELOG (v0.45.1)` — row at
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d:corpus/SOURCES.md:64` (status `queued`, used-by `—`), against
its wave-1 Gate record
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d:.ufo/waves/round-17/sources/JjColocation.md:36-51,93-95`
(row 2). Re-fetched the source at the row URL and at the pinned commit, resolved the tag, checked the
recorded lines/subsections, the Gate quote (verbatim, ≤25 words), the recorded sha256, tier/scope/teaches,
status/used-by, the structural gate at M, and ran a live jj 0.45.1 probe of the bookmark clause. Nothing
below is taken from wave-1 prose without re-fetching it.

Evidence (M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d)

URL resolves; bytes/hash match the recorded fetch — HOLDS
- `curl https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md` → `HTTP/2 200`, no redirect,
  **212175** bytes, sha256 **05c34fb8d81f4de624c4f6754f6e31abdee14942ce3f32cc6925b7775b393c76** — equal to
  `JjColocation.md:43` and its fetch ledger `:149`. Response `date: Tue, 20 Oct 2026 17:10:38 GMT`; row
  `opened 2026-10-20`.
- Same path at the commit hash (`.../7c41cdeb16b6b321c64e789a966b6adf723816a5/CHANGELOG.md`) → same size,
  same sha256, `cmp` → identical.

Anchor revision exists; the tag is the commit named — HOLDS
- `git ls-remote https://github.com/jj-vcs/jj 'refs/tags/v0.45.1*'` →
  `7c41cdeb16b6b321c64e789a966b6adf723816a5 refs/tags/v0.45.1` (no `^{}` line).
- `api.github.com/repos/jj-vcs/jj/git/ref/tags/v0.45.1` → 200, object `7c41cdeb…`, type `commit`
  (lightweight tag, nothing to peel), so the anchor cell's `v0.45.1 (tag 7c41cdeb…)` is exact.

Anchor lines exist and the named subsections are correct — HOLDS
- `CHANGELOG.md:36` = `## [0.45.0] - 2026-09-02`; `:57` `### New features`, `:78` `### Fixed bugs`, `:114`
  `### Contributors`. So `:68-71` ∈ New features and `:96-97` ∈ Fixed bugs, exactly as the anchor cell says.
- `:68` = `* Git HEAD state is now tracked per worktree internally. This prepares`; `:96-97` = the
  update-stale sentence quoted below.

Wave-1 Gate quote verbatim, 20 words — HOLDS
- Dossier (`JjColocation.md:48-49`) declares "markdown code spans flattened" at `CHANGELOG.md:96-97`.
  Fetched text: `In colocated workspaces, \`jj workspace update-stale\` now correctly resets the Git HEAD to
  the parent of the fresh working-copy commit.` → flattened equals the dossier's 20-word quote (≤25); the
  raw fragment `resets the\n  Git HEAD to the parent of the fresh working-copy commit.` is a direct
  substring.
- Supporting quotes exact too: `Git HEAD state is now tracked per worktree internally.` (`:68`, 9 words);
  `jj git import in non-colocated repositories no longer imports commits from a detached Git HEAD branch.`
  (`:50-51`, 16 words).

Recorded sha256 — HOLDS
- The registry row records no digest; the dossier does (`:43`). One live re-fetch equals it, and the same
  bytes are served at the pinned commit, so the digest is re-derivable, not a one-response snapshot.

Tier / scope / status — HOLDS, one scope note
- Tier `A`, kind `docs`: the upstream project's own release changelog for the tool under test, scoped to
  `jj 0.45.0/0.45.1 git-HEAD behaviour in colocated workspaces`.
- The `0.45.1` section (`:21-35`) has no HEAD entry (crate publishing plus a SHA-256 `gpgsig-sha256`
  header), so every HEAD anchor is 0.45.0; the anchor cell says exactly that. [INFERENCE] `0.45.1` in the
  scope is a version-range label, not a claimed anchor — acceptable, noted for the next recheck.
- `status queued`, used-by `—` per `PLAN.md:217-218` ("Sources S049–S052 (jj/git) stay `queued` this round
  (the lesson that cites them lands after the measured revision; used-by cannot point at it earlier)").
  `git grep -E 'S049|S050|S051|S052'` at M outside `corpus/SOURCES.md` hits only `PLAN.md:217`; no used-by
  path exists to validate (vacuous pass).
- Family index `SOURCES.md:77` names the chain's endpoints (round-17 lesson; SKILL round-17 anchor rule).
  At M `corpus/lessons/round-17.md` is absent and `SKILL.md` has no `round-17|lane-tip|symbolic-ref` line.
  That is the same post-M landing the amendment describes, but `:77` is forward-looking, not landed state.

Structural gate at M — HOLDS
- Throwaway clone, `git checkout --detach M`, `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`,
  rc 0.
- Row splits into 13 fields (11 cells); the teaches cell at `SOURCES.md:64` is string-identical to the
  dossier row at `JjColocation.md:39` after `S0??`→`S050` (all 11 cells equal, checked cell by cell), so
  the landed row is the reviewed draft. URL unique in SOURCES (the other jj URL is the S049 docs page).

Teaches — ISSUES: clause 3 is unsupported and false in a common state
- `teaches`: "jj 0.45 resets the Git HEAD to the parent of the working-copy commit and tracks Git HEAD per
  worktree, so HEAD equals a bookmark only by coincidence".
- Clauses 1–2 are grounded: `:96-97` states the HEAD=@- reset, `:68-71` the per-worktree tracking. Note the
  anchor sentence is command-scoped (`jj workspace update-stale`); the generalized claim is observed true
  (S049 `git-compatibility.md:208`; probe below), but `:96-97` does not say it without that subject.
- Clause 3 "so HEAD equals a bookmark only by coincidence" is in neither anchor line — no cited line
  mentions bookmarks — and an ordinary state contradicts it. Probe on the host
  (`jj 0.45.1-7c41cdeb…`), temp clone of LANE at M:
  `jj git init --colocate`; `jj new master`
  → `git rev-parse HEAD` = `6c978510…` = `git rev-parse refs/heads/master`; `git symbolic-ref -q HEAD` →
  `refs/heads/master`, rc 0. HEAD is attached to the master bookmark and equal to it by construction
  (HEAD = @- = master), not by coincidence. One command later, `jj new`: HEAD = `0c5b5829…` (empty,
  unbookmarked), master still `6c978510…`, `symbolic-ref -q HEAD` rc 1, `git branch --contains HEAD` →
  `* (no branch)`.
- That parity/divergence pair is the dossier's own warning at `JjColocation.md:133-135`: the trial "ran when
  HEAD, `refs/heads/master` and `origin/master` all equalled `5859243` — exactly the state in which reading
  HEAD is invisible", and "`Usually detached` is not `always unequal to the tip`". "Only by coincidence"
  asserts the opposite of that reachable, deterministic equality. The operational rule the row supports
  (resolve the branch ref, never HEAD) is unaffected.

Repair (append-only; SOURCES contract v1 rule 2: only `status`/`recheck`/`used-by` change in place; a
correction is a new row whose teaches opens `supersedes S0NN —`)
1. Add **S054** (last id S053), same URL and anchor, teaches e.g.:
   `supersedes S050 — in 0.45.0 \`jj workspace update-stale\` now correctly resets Git HEAD to the parent of
   the fresh working-copy commit and Git HEAD is tracked per worktree; HEAD names @-, not a bookmark
   pointer, so its equality with a bookmark is a state of @-, not a guarantee (S049)`.
   Keep `queued`, used-by `—` until the round-17 lesson cites it.
2. If L1 keeps S050 alone, the lesson must quote `:96-97` with its `jj workspace update-stale` subject and
   must not repeat "only by coincidence".
3. Do not rewrite S050's cells in place.

Remaining unknowns
- Whether wave 1's fetched body existed exactly as recorded: no body retained; equal sha256 at tag and
  commit today plus raw.githubusercontent's content-addressing make drift implausible. [INFERENCE]
- Whether the wave-3 lesson will repeat the clause-3 wording: `corpus/lessons/round-17.md` is absent at M,
  so it cannot be checked yet.

Tooling: no installs/upgrades — curl, git 2.56.0, node v24.21.0, python3 3.14.8, host
jj 0.45.1-7c41cdeb… . No pacman, no REA/npx. Temporary fetch dir, clone and jj probe deleted.

Files written: .ufo/waves/round-17/w2/ReopenS050.md
