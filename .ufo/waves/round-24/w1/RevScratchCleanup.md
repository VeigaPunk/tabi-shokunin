# RevScratchCleanup — M5 cleanup plan review (round-23 over-commit)

Reviewer: L1Tabi24.RevScratchCleanup. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Read-only review of the round-23 M5 cleanup plan promised in `corpus/lessons/round-23.md:188-207`
and re-confirmed in `corpus/lessons/round-23-verifier-spotcheck.md:94-99`.

Observed state at review time (all commands run from lane root):

- `git ls-tree -r --name-only HEAD -- .ufo/waves/round-23/scratch | wc -l` → **1034** committed scratch paths
  (matches the lesson's tip figure; the lesson's earlier 868 is superseded).
- `git ls-tree -r -l HEAD -- .ufo/waves/round-23/scratch | awk '{s+=$4} END{print s}'` → **26,999,535 B**
  committed.
- `git ls-tree -r -l HEAD -- .ufo/waves/round-23/scratch | awk '{print $4}' | sort -n | tail -1` → max
  committed blob **627,078 B** (612 KiB).
- `find .ufo/waves/round-23/scratch -type f | wc -l` → **17,620** files on disk (vs 1,034 committed);
  `find .ufo/waves/round-23/scratch -name .git` → 13 nested clone `.git` entries on disk, while
  `git ls-tree -r --name-only HEAD -- .ufo/waves/round-23/scratch | grep -c '/\.git'` → **0** committed.
- `git status --porcelain -- .ufo/waves/round-23/assimilation .ufo/waves/round-23/scratch` → only `??`
  entries (both trees wholly untracked).

---

## (a) Committed documents that cite a scratch path

Sweep: `git grep -cE '\.ufo/waves/round-23/scratch' HEAD -- ':(exclude).ufo/waves/round-23/scratch/**'`
(scratch tree itself excluded). **45 committed, non-scratch files** cite round-23 scratch paths
(102 citing lines total):

- `corpus/lessons/round-23.md` (3) — lines 86-87 (`scratch/ExecCollisionGuard/.`), 191-206 (M5
  evidence pointers / counts / check). `corpus/lessons/round-23-verifier-spotcheck.md` (1) — line 97.
- Wave-1 docs (17): `w1/CritControl.md` (2), `D4StaleAttempts.md` (2), `ExecAppendNormalize.md` (1),
  `ExecBlobReader.md` (2), `ExecCliContract.md` (1), `ExecCollisionGuard.md` (1), `ExecNoHarmGuard.md` (2),
  `ExecRecheckDates.md` (3), `MutClassFalsifiers.md` (3), `RevCoverageGround.md` (1),
  `RevMinWaveIntegrity.md` (2), `RevRenumber.md` (1), `ScribeGate.md` (4), `ScribeScorecard.md` (1),
  `ScribeSources.md` (5), `SrcS102.md` (1), `SrcS103.md` (1).
- Wave-2 docs (21): `w2/W2C2Counter.md` (1), `W2Cheat.md` (2), `W2Cls1.md` (2), `W2Cls4.md` (2),
  `W2Cls5.md` (2), `W2Cls6.md` (2), `W2CorrAttempts.md` (1), `W2CounterShape.md` (1),
  `W2Determinism.md` (1), `W2EntryBar.md` (2), `W2EvRepair.md` (3), `W2InMemory.md` (8),
  `W2Mistakes.md` (5), `W2Prune.md` (1), `W2QuoteB.md` (2), `W2Report.md` (1), `W2Revenger2.md` (1),
  `W2ScoutEntry.md` (4), `W2SelfAudit.md` (2), `W2Separability.md` (1), `W2Simplifier.md` (1).
- Dispatch/spec artifacts (5): `gen-w1.mjs` (6), `w1-dispatch.json` (6), `w1-spec.json` (6),
  `w2-dispatch.json` (1), `w2-spec.json` (1) — these contain the template string
  `.ufo/waves/round-23/scratch/<YourName>/` plus per-seat concrete paths.

Concrete file-level citations (evidence pointers, several with inline sha256) concentrate in: `SrcS102/rfc6265bis-13.txt`
(`W2ScoutEntry.md:5`, `W2QuoteB.md:7`, `ScribeSources.md:51-53`, `ScribeGate.md:41`, sha `06223931…d85fbf`),
`SrcS103/owasp-csrf.html` and `owasp-csrf.txt` (`W2ScoutEntry.md:5,23,32`, `ScribeSources.md:51-54`,
`ExecRecheckDates.md:12-15`, `ScribeGate.md:42`, sha `6f32bfbf…872312`), `SrcDivergence/owasp-csrf.html`
(`ScribeSources.md:52`), `L1Tabi23.D4StaleAttempts/grade-scan.py` + `green-stale-lane.md` (`D4StaleAttempts.md:12,43`),
`RevMinWaveIntegrity/policy-loose.json` (`RevMinWaveIntegrity.md:21`, sha `c2023638…`),
`ScribeGate/audit-round22.json` (+ `audit-round21-tip.json`, `selftest.json`, `src-flat.txt`, `entry-flat.txt`)
(`ScribeGate.md:3,12`), `W2InMemory/mutA..G.mjs` + `pristine.mjs` (`W2InMemory.md:21-46`, sha `6eeaeda7…`),
`W2Mistakes/probe-c6-c2.mjs`, `mut-roundarm4.mjs`, `mut-c6escape4.mjs` (`W2Mistakes.md:33-49`),
`W2SelfAudit/audit-compare.mjs` (`W2SelfAudit.md:14`), `W2EvRepair/report-c6-bogus.md` (`W2EvRepair.md:23`),
`W2Simplifier/simplified-3.mjs` (`W2Simplifier.md:7`), `ExecBlobReader/read-at-rev.mjs` (`ExecBlobReader.md:5`),
`MutClassFalsifiers/audit.mjs` (`MutClassFalsifiers.md:6,9`), `CritControl/report-attempt-word.md`,
`skipwork-roundkeyed.mjs` (`CritControl.md`), `ExecAppendNormalize/SOURCES.block.md` (`ExecAppendNormalize.md`),
`W2Cls1/c1-mutants.mjs`, `W2Cls5/probe.mjs`, `W2Cls6/m4-bogus.md`, `W2CorrAttempts/false-grades.md`,
`W2CounterShape/report-mut.md`, plus directory-level pointers `W2Cheat/faketree/`, `W2C2Counter/{repo2..repo5}`,
`ExecCollisionGuard/fx`.

The remaining ~1,000 committed scratch paths are **not** cited by any preserved document.

## (b) Does moving cited bytes to `corpus/evidence/round-23/` preserve the citation honestly?

**Bytes: yes, if byte-identical.** Every inline digest above already pins the cited bytes
(rfc6265bis-13.txt, owasp-csrf.{html,txt}, policy-loose.json, pristine.mjs, auditor hashes), so a
byte-identical move to `corpus/evidence/round-23/` keeps each digest checkable and honest. The
moved copies remain verifiable against the citing text verbatim.

**Citations: no, unless the 45 citing files are updated in the same cleanup.** A move alone strands
every citation: each of the 102 citing lines names a path under `.ufo/waves/round-23/scratch/**`
that will no longer exist after the deletion commit (git ls-tree on the tip would return nothing for
those paths). Two sub-cases:

1. *Pointer citations* (evidence pointers, digest lines) — honest only if the documenting doc is
   edited to the new `corpus/evidence/round-23/` path in the same change set. That is an edit to 44
   `w1/`/`w2/`/spec files plus the two corpus lessons (corpus edits are tracked repo edits, so the
   cleanup must land them by the contract).
2. *Command citations* (e.g. `W2EvRepair.md:23` runs the auditor `--report .ufo/waves/round-23/scratch/W2EvRepair/report-c6-bogus.md`; `W2Mistakes.md:35,49` write sed-derived mutants into scratch paths; `W2SelfAudit.md:14` runs `node .ufo/waves/round-23/scratch/W2SelfAudit/audit-compare.mjs`). These are historical run records; rewriting them changes what was executed. The honest preservation is: keep the record verbatim **and** keep the cited artifact somewhere in the repo (the `corpus/evidence/round-23/` move) so the command's input remains re-verifiable; deleting the artifact from the repo entirely (even with . copy at a new path) still strands the verbatim command unless the command text is amended or a mapping note is added.

**Verdict:** the plan as written ("cited evidence preserved, the rest deleted") preserves the *bytes* but not the *citations*. It is honest only with a second, coordinated step: add `corpus/evidence/round-23/` copies byte-identical to the cited set **and** update every citing path in the 45 files (or add an explicit pointer map in the cleanup commit). Verified the deletion commit alone (the lesson's own check `git show --name-only --format='' <commit> | grep -c '^\.ufo/waves/round-23/scratch/'` → 0 is a *name-only* check and therefore counts deleted paths too: a deletion commit fails it by design — the check detects additions, and the cleanup commit is expected to be the one honest exception; the check stays valid for all future non-cleanup commits).

## (c) jj helper deletion guard — exact refusal conditions for a bulk deletion of 1,000+ paths

Read: `scripts/hyaku/jj-lane.sh` — `cmd_commit` (598-727), `validate_change_scope` (522-572),
`repo_path_allowed` (506-517). There is **no count or size limit on deletions**: `--allow-large`
(line 638) applies only to *named files* over 10 MiB (max committed blob here is 612 KiB; and the
cat-file branch for deleted paths has no size check). A 1,034-path deletion is structurally fine.
The conditions that can refuse the whole commit (all-or-nothing; first failure breaks the loop, rc=1):

1. **D-against-disk (line 560-564)** — the only deletion-specific guard: if any path with diff status
   `D` still exists on disk or as a symlink at validation time (`[ -e "$cpath" ] || [ -L "$cpath" ]`),
   it refuses: *"commit would delete $cpath but it exists on disk (nested repo?)"*. With 1,034 paths,
   a single leftover (one file that survived the working-copy deletion, a recreated path, or a
   snapshot/diff mismatch between commit creation and validation) blocks the entire commit. Practical
   trigger: the commit must be created from a working copy where the deletions have actually happened;
   a `jj commit` run while the files still exist on disk is a no-op ("nothing to commit"), not a
   refusal — the deletion must precede the commit.
2. **Path outside request (line 551-559)** — every changed path must match a requested pathspec
   (exact or prefix). The cleanup commit may change ONLY the named subtree(s). If the same commit also
   touches the 89 unlanded paths, the round-24 report, or `.ufo/waves/round-23/assimilation/`, every
   such path must be in the request, else refusal: *"commit changed a path outside the request"*.
3. **repo_path_allowed blacklist (506-517)** — refuses `.git`/`.git/*`, `.jj`/`.jj/*`, `.ufo`,
   `.ufo/state`/`.ufo/state/*`, `.ufo/watchdog.log`, and paths escaping the root. `.ufo/waves/round-23/scratch/*`
   is **not** blacklisted, so normal scratch paths pass; the blacklist only bites if the snapshot drags
   in `.ufo/state` etc.
4. **Candidate guards (574-596)** — single-parent child of branch tip, conflict-free, identity matches
   `--as <id>` (or `protocol`). Unaffected by size.
5. **Hard failures** — `git diff-tree` failure (527), malformed NUL stream (540-544), unexpected status
   other than A/M/D/T (545-548), and empty change set (566-569).

So: the guard does not refuse "1,000+ paths" as such; it refuses when any single deleted path still
exists on disk (condition 1), when the commit scope escapes the requested pathspecs (condition 2), or
when a blacklisted root is touched (condition 3). The realistic failure for this cleanup is condition 1
(one leftover file in the 1,034) or condition 2 if the cleanup is bundled with the 89 unlanded-path
resolution without naming all paths.

## (d) Untracked `.ufo/waves/round-23/assimilation/` — confirm it must NOT be committed

Confirmed from the bytes:

- `git ls-tree -r --name-only HEAD -- .ufo/waves/round-23/assimilation | wc -l` → **0** (nothing
  committed; the tree is wholly untracked, `git status` shows `??` only).
- Tree is `assimilation/validate/corpus/` with **91** files. All 91 have a committed counterpart
  (`git cat-file -e HEAD:corpus/<rel>` true for each); **89 are byte-identical** to committed corpus
  blobs (`cmp -s`), and **2 differ**:
  - `corpus/SOURCES.md` — mirror rows 116-117 (S102/S103) contradict committed rows 116-117: different
    titles, different quote spans (mirror "line 2813" vs committed "lines 2815-2828"), different
    retention (mirror "180d" vs committed "on-release"/"90d"), different fetched/body fields. Committing
    the mirror would put a second, contradictory S102/S103 pair in the single authoritative
    `corpus/SOURCES.md`.
  - `corpus/knowledge/csrf-defense-shape-boundary.md` — mirror is an earlier/shorter draft (diff shows
    the committed version's front matter and §1-3 absent from the mirror; the mirror also lacks the
    S102/S103 source lines the committed entry carries).
- Therefore the lesson's directive (round-23.md:201-203) is byte-confirmed: committing
  `assimilation/validate/` would duplicate 89 files verbatim and inject a contradictory S102/S103 pair
  via the 2 differing files. It must remain uncommitted. (Minor deviation from the lesson's wording:
  the lesson says "single differing file"; the bytes show two differing files, both part of the same
  S102/S103 contradiction.)

## Residual risk / verification gaps

- The cleanup commit's own name-only check counts deleted paths, so the L1 must not apply the naive
  "must be 0" rule to the cleanup commit itself; the check is for future non-cleanup commits.
- The move to `corpus/evidence/round-23/` is unverifiable until the byte-identical copies exist and
  the 45 citing files' paths are updated; a deletion-only commit with unupdated citations strands 102
  citing lines.
- The 17,620 on-disk scratch files include 13 nested clone `.git` dirs (untracked); they are not part
  of the commit but will remain on disk after the cleanup unless removed, leaving the on-disk tree
  larger than the committed tree.
