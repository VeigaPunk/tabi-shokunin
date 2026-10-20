# R16-W1 RevC1Design — does the C1 manifest + `--check`/`--reproduce`/`--legacy` design close r15 outside defects 1 and 2?

Seat: TabiR16.RevC1Design-5 (reviewer, leaf). Read-only on the lane; no lane gate, counter,
selftest, census or browser was executed. Evidence below is either (a) read-only `git` plumbing
against the lane repo or (b) purpose-built probes run in throwaway `/tmp` repos to establish
Git semantics the design depends on. No tool installed or upgraded. Report is author-side advice,
not certification.

Scope: PLAN.md §C1 only (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/PLAN.md:34-77`),
against `corpus/lessons/round-15-verifier-spotcheck.md:120-121`.

## Verdict

| Question | Verdict |
|---|---|
| Defect 1 (counter identity) closed? | **Partially.** The per-claim blob digest + argv + `countField` + reproduction close the *file-level* identity gap, but the counter's execution identity (transitive imports, worktree bytes, replace/attr view) and its *declared read-set* are unpinned. See R2, R6, R7. |
| Defect 2 (measured vs delivered) closed? | **No.** The design has no drift assertion or drift report at all, and `measuredRevision == delivered HEAD` is structurally impossible for a manifest that records it. `counted_input_changed` compares only manifest-declared paths, so a manifest can be clean while the delivery differs. See R1. |
| Legacy demo honest? | **No.** The plan's expected reason set is factually wrong for r15 C2 and would ship a false diagnostic in the C1 receipt. See R3. |

Findings are ordered by severity. Every "observed" line is a command I actually ran; paths are
lane-relative unless under `/tmp`.

## R1 (blocker) — defect 2 is not addressed; drift is unverifiable and structurally unavoidable

PLAN.md:53-57 defines seven per-claim reasons, none of which compares the delivery revision to
`measuredRevision` except `counted_input_changed`, which reads only the manifest's own
`countedInputs` list (PLAN.md:57). PLAN.md:61's verdict line carries `claims=N bound=M` and no
drift number. Nothing in `--json` reports what changed between `measuredRevision` and `REV`.
That is the exact shape of defect 2 (`round-15-verifier-spotcheck.md:121`: "measure at, or
explicitly diff to, the delivered HEAD"): a manifest may pass with `measuredRevision` three
commits behind delivery as long as the author declined to declare the changed paths, and a
report can again quote a count taken before the delivered evidence landed.

The key structural fact the plan misses: **`measuredRevision` can never be the commit that
contains the manifest.** A commit id is a function of the tree that contains the manifest, and
the manifest would contain that id; that is a fixed-point/preimage equation. So at delivery,
`measuredRevision < manifestCommit <= REV` always, and `git diff measuredRevision REV` is
non-empty by definition (it at least contains the manifest and the receipts committed with it).
"Measure at delivered HEAD" is unreachable for this manifest schema; only an explicit drift
mechanism can close defect 2.

Observed (`git diff --name-only HEAD HEAD | wc -l` → `0`): the comparison is empty only when the
two revisions are identical, i.e. the case that cannot occur for the manifest's own commit.

Concrete fix (all in `scripts/check-measurement-binding.mjs`):
1. Always compute a full-tree drift record `drift = git -c core.quotepath=false diff --no-renames
   --no-ext-diff --no-textconv --name-status -z <measuredRevision> <REV>` and emit
   `drift_files=<n> drift_sha256=<hex>` in the verdict line and a `drift:{files,sha256,paths}`
   object under `--json`. This is the machine-checkable form of "explicitly diff to the delivered
   HEAD".
2. Manifest gains an optional/late-bound `drift: { head: "<40-hex or REV>", files: <n>,
   sha256: "<64-hex>", allow: ["<exact path>", ...] }`. Gate recomputes and reports
   `drift_digest_mismatch` (declared digest ≠ computed) and `drift_unexpected` (a changed path not
   in `allow`). `allow` MUST be disjoint from `counter.path` and every declared read (those are
   strict, see R2/R4); otherwise the drift declaration silently exempts the gate from its own
   binding. The manifest path itself is a legitimate `allow` entry (it is the subject, see R5).
3. Drop `after.revision` (PLAN.md:50) or enforce `after.revision === measuredRevision`
   (`after_revision_mismatch`). As written it is decorative: `--reproduce` compares against `REV`
   and `after.count`, never against `after.revision`.
4. Check `before.revision` is a 40-hex commit, an ancestor of `measuredRevision`, and
   `before.revision !== after.revision` (`before_revision_not_ancestor`,
   `before_revision_equal_after`). Today `before.revision` is unchecked (PLAN.md:49).
5. `baseline` (PLAN.md:40) is otherwise dead weight: either require
   `baseline === before.revision`, or delete it and keep the per-claim `before.revision`.

## R2 (blocker) — "counter digest" binds one file, not the counter that actually ran

PLAN.md:55-56 pins `counter.sha256` as "blob at measuredRevision" and "blob at REV"; PLAN.md:59
re-runs `argv` in the worktree. Three gaps remain:

1. **Transitive imports.** Only `counter.path` is digested. If `.ufo/waves/round-16/measure.mjs`
   imports a relative module (or `createRequire`s one), changing that module changes the count
   while every digest still matches. The r15 counter is self-contained
   (`.ufo/waves/round-15/measure.mjs` imports only `node:crypto`, `node:child_process`,
   `node:path`, `node:url`), but nothing in the r16 contract requires it.
2. **Worktree binding.** Reproduction executes `<cwd>/counter.path`, not the blob at
   `measuredRevision` or `REV`. With a dirty worktree the reproduced 1 says nothing about the
   pinned bytes. (Note the house idiom for this is already in the lane:
   `scripts/check-freshness.mjs:26-36` `regularBytes()` refuses symlinks via
   `realpathSync` + `O_NOFOLLOW` + `fstatSync().isFile()`; r15's `fileAt`
   at `.ufo/waves/round-15/measure.mjs:262-264` refuses any tree mode other than 100644/100755,
   which the r16 gate must also do for `counter.path` — otherwise a mode-120000 symlink blob
   digest is the *target string*, while `node <path>` follows the link.)
3. **Replace-object rewriting, demonstrated.** The plan's env list (PLAN.md:37-38) includes
   `GIT_NO_REPLACE_OBJECTS=1`; that is correct and necessary, but only if it reaches *every* git
   invocation, including the counter child. If the child env is the `{PATH,HOME,TZ}` pattern from
   `scripts/check-aria-metadata.mjs:2260`, the counter's own `git show` runs with replacements
   active while the gate's do not, and the two sides read different bytes.

Observed in `/tmp/gitr3` (blob `GEN_OID=8f9f8b5d…`, forged blob `7b50f0bd…`, `git replace` of the
genuine blob):
```
git show $R:ev.json                      -> FORGED
GIT_NO_REPLACE_OBJECTS=1 git show $R:ev.json -> GENUINE
git cat-file blob $GEN_OID               -> FORGED
GIT_NO_REPLACE_OBJECTS=1 git cat-file blob $GEN_OID -> GENUINE
git diff -p $R $R2                       -> "+FORGED"   (an unchanged file's content!)
GIT_NO_REPLACE_OBJECTS=1 git diff -p $R $R2 -> "+GENUINE"
```
So a `refs/replace/*` ref can rewrite the bytes the gate hashes *and* the bytes the counter reads,
making a forged evidence blob look authentic end-to-end. `git ls-tree` still prints the original
blob oid, and `git rev-parse REV:path` returns it too — but `cat-file blob <that oid>` returns the
forged content, so the digest computation itself is replace-subject.

Concrete fix:
1. Counter MUST be single-file: a static scan of `counter.path` at `measuredRevision` rejects any
   value/`import()`/`require()` specifier that is not `node:`-prefixed (`counter_import_unsupported`).
   If a multi-file counter is wanted instead, manifest declares `counter.reads` as
   `path -> sha256` and gate checks each at `measuredRevision` (`counter_input_missing`,
   `counter_input_digest_mismatch`) and at `REV` (`counter_input_changed`), plus
   `counter_input_uncovered` for any declared read not covered by `countedInputs`.
2. Before reproducing, require `sha256(regularBytes(repo/counter.path)) === counter.sha256`
   (`counter_worktree_mismatch`, exit 2 — cannot reproduce what is not on disk), and that
   `git ls-tree -r <REV> -- counter.path` resolves to mode 100644/100755
   (`counter_path_not_regular`). Do not use `git hash-object` for this: it is SHA-1 and is not the
   recorded digest (`git hash-object -- new.json` → `b6802534…` vs `sha256sum` → `c865f6c5…`,
   observed).
3. Pass one frozen env object to both sides, adding `--no-replace-objects` as git's first argument
   in addition to `GIT_NO_REPLACE_OBJECTS=1` (belt and braces; both were observed to work).
4. Record `runtime: {node: process.version, platform, arch}` and `git --version` in the manifest
   and require equality when `--reproduce` runs (`runtime_mismatch`).

## R3 (high, honesty) — the legacy expectations are factually wrong for r15 C2

PLAN.md:64-67 says the legacy adapter adapts "claims C1/C2 with `counterCodeRevision`,
`measuredRevision`, no digest/inputs" and reports `counter_digest_unrecorded`; PLAN.md:76-77 then
requires the committed `legacy-r15.json` to have "exit 1 with `counter_digest_unrecorded` for both
r15 claims". The real file contradicts both statements.

Observed (`corpus/evidence/round-15/measurements.json:4,5,65,131-132`):
```
measuredRevision     = b7cf0446a31014a81b4882857c90c565ebc14210   (top-level, not per-claim)
executedCodeRevision = 27dfd98bd6bbd85fe77fb028d531691ce066031a   (top-level)
C1.counterCodeRevision = 27dfd98…   C1.counterSha256 = null
C2.counterCodeRevision = 9fd8bca…   C2.counterSha256 = dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
```
and, for `.ufo/waves/round-15/measure.mjs`:
```
27dfd98: 3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384
9fd8bca: dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
b7cf044: 3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384
HEAD   : dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
```
`git merge-base --is-ancestor 9fd8bca b7cf044` → exit 1 ("9fd8bca ancestor of b7cf044: NO"),
`git merge-base --is-ancestor 27dfd98 b7cf044` → 0.

Consequences for the legacy mode:
- C1: recorded counter revision 27dfd98 hashes to the same bytes as at `measuredRevision`
  b7cf044 (3ee59de0), and differs at REV (dd9c8675). So
  `counter_digest_unrecorded` (true, field absent) + `counted_inputs_undeclared` (true) +
  `counter_changed_since_measurement` (true) is the honest set.
- C2: `counter_digest_unrecorded` is **false** (a digest is recorded);
  `counter_changed_since_measurement` at REV is **false** (REV blob == dd9c8675 == recorded);
  and `counted_inputs_undeclared` is true. The real defect is different and sharper:
  `counter_digest_mismatch` (recorded dd9c8675 ≠ blob at `measuredRevision` 3ee59de0) and
  `counter_revision_not_ancestor_of_measured` (9fd8bca is a *descendant* of b7cf044 — the repaired
  counter postdates the revision it was said to measure, exactly the r15 complaint).

Shipping "`counter_digest_unrecorded` for both" would put a false reason in the round-16 C1
receipt and would let the C2 defect pass unnamed. The plan's legacy schema description is also
wrong on shape: `measuredRevision` is top-level (`measurements.json:4`), and C2 carries a digest.

Concrete fix: the legacy adapter should only *normalise shape* (top-level `measuredRevision`,
per-claim `counterCodeRevision`, optional `counterSha256`) and then run the same per-claim v1
identity checks. Expected real-file reason sets:
`C1 = {counter_digest_unrecorded, counted_inputs_undeclared, counter_changed_since_measurement}`,
`C2 = {counted_inputs_undeclared, counter_digest_mismatch, counter_revision_not_ancestor_of_measured}`.
Pin those exact sets in the selftest, and have the C1 counter require the receipt to carry them.

## R4 (high) — `countedInputs` has no safe pathspec semantics; entries can silently disable the check

PLAN.md:57 feeds manifest strings straight into `git diff --name-only measuredRevision REV --
<countedInputs + counter.path>`. Git pathspecs reinterpret those strings, and every variant below
was observed to *silently* change the answer with exit 0 (probe repo `/tmp/gitsem`, two commits
touching `counter.mjs` and `corpus/evidence/round-16/in.json`):

```
git diff --name-only $A $B -- corpus/evidence/round-16                -> in.json
git diff --name-only $A $B -- ':(exclude)corpus/evidence/round-16'    -> counter.mjs   (prefix excluded)
git diff --name-only $A $B -- ':!corpus/evidence/round-16'            -> counter.mjs   (prefix excluded)
git diff --name-only $A $B -- '!corpus/evidence'                      -> (empty, exit 0)  (bare ! excludes)
git diff --name-only $A $B -- ':(icase)CORPUS/evidence'               -> (empty, exit 0)
git diff --name-only $A $B -- ':foo'                                  -> (empty, exit 0)
git diff --name-only $A $B -- '::'                                    -> every changed path
git diff --name-only $A $B -- corpus/nope                             -> (empty, exit 0)  (typo = disabled)
```
Two failure modes follow:
- **Injection**: a manifest entry beginning `:`, `:(`, or `!` converts a declared input into an
  exclusion; `counted_input_changed` then never fires for that input. The manifest is L1-owned but
  the gate's whole purpose is that a manifest cannot self-certify by omission or reinterpretation.
- **Typo/prefix drift**: a prefix that matches no tracked path is accepted and silently checks
  nothing. And the prefix granularity is the wrong tool anyway: `git diff` reports *additions* under
  a prefix too (observed: `A corpus/evidence/round-16/new.json`), so any broad prefix makes the
  gate red for later waves' evidence while any narrow prefix misses siblings of the real inputs.
  Related string drift: default `core.quotepath` quotes non-ASCII names
  (`"corpus/evidence/round-16/na\303\257ve-\303\251.json"` vs raw under
  `-c core.quotepath=false`), and repo-local `diff.relative=true` rewrites paths when cwd is a
  subdirectory (`evidence/round-16/...` observed) — both break a string comparison to a manifest
  entry.

Concrete fix:
1. Never pass manifest strings as pathspecs. Run `git -c core.quotepath=false diff --no-renames
   --no-ext-diff --no-textconv --name-status -z <measuredRevision> <REV>` with no `--`, split on
   NUL, and filter in JS against normalised literal paths (`entry === p || p.startsWith(entry + '/')`).
   `-z` was observed to emit raw UTF-8 regardless of `core.quotepath`, so this also fixes quoting.
2. Validate every `countedInputs` entry (`counted_input_unsupported`): non-empty, repo-relative, no
   leading `/` or `./`, no `:` (first char), no `!` (first char), no `..` segment, no `*?[\\`, no
   control characters, no trailing spaces; de-duplicate. Require at least one entry to resolve to
   a tracked path/file at `measuredRevision` (`counted_input_unresolved`).
3. Require exact files for strict inputs, or split the concept: `countedInputs` = exact paths
   (strict, `counted_input_changed`) and `evidenceScope` = prefixes (informational, folded into the
   R1 drift report). Do not let a prefix be the only declaration.
4. Ensure `counter.path` is included in the strict comparison even if the manifest omits it (R2).

## R5 (high) — nothing binds the actual round-16 manifest; C1 can be 1 with no manifest at all

PLAN.md:74-77: the C1 counter counts 1 when the gate blob exists, `binding/selftest.json` is
clean, and `binding/legacy-r15.json` shows the legacy demos. No receipt of a `--check`/
`--reproduce` run against `corpus/evidence/round-16/measurement-binding.json` is required. So the
counter can report `c1_binding_contracts=1` while the round's manifest is missing, unreadable, or
red — the counted object is the gate's *demonstration rig*, not the binding of this round's claims.
That is a direct repetition of the r15 pattern (counter measures the machinery, report asserts the
machinery's meaning).

Concrete fix: add `corpus/evidence/round-16/binding/check.json` = the `--check --reproduce
--json` output on the real manifest, and require the counter to check: `verdict=clean`,
`claims=2`, every claim `bound`, `mode=reproduce`, `reproduced` counts for before/measured/REV
(R6), and `manifestSha256` equal to `sha256(manifest at REV)`. No cycle: the manifest contains
`counter.sha256`, not `check.json`'s digest; `check.json` may live in the same commit as the
manifest. Sequence that makes the 0→1 honest: commit counter+gate+selftest+legacy at `R`
(= `measuredRevision`), then manifest+`check.json` at `M`, then L1 docs at `D`. Reproduce at `R`
(0), `M`/`REV` (1); `counted_input_changed` over `R..REV` sees no changes for the gate/receipts/
counter, and the manifest is the declared subject, not a counted input.

## R6 (high) — reproduction protocol conflates the counter's honest red with a crash, and never checks the revision echo

PLAN.md:59-60: "`counter_failed` (exit ≠0 or unparsable) / `count_not_reproduced` (field ≠
after.count)". The r15 counter's own contract exits **1** for malformed evidence and **2** for
usage/could-not-evaluate (`.ufo/waves/round-15/measure.mjs` header and `emit()`/`run()`), so
"exit ≠0 = failed" misclassifies the counter's cause-exact diagnostics as a crash. Further:
- No `revisionField` check. If the counter ignores `{REV}` and prints its constant field, the
  reproduction passes for every revision. The r15 output carries `"revision": "<sha>"`; the
  manifest must name `revisionField` and the gate must require `output[revisionField] === REV`
  (`counter_revision_mismatch`, exit 2).
- No stdout shape contract: require exactly one stdout line (trailing newline allowed), parse it,
  reject extra lines (`counter_stdout_not_single_json`); require `countField` present and an
  integer ≥ 0 (`counter_count_missing`, `counter_count_not_integer`).
- No timeout/overflow reasons: `counter_timed_out` and `counter_output_overflow` (both exit 2 with
  `counter_failed`-style detail), and no protection against the counter mutating the tree it is
  certifying: snapshot `git status --porcelain -z` before/after and emit
  `counter_mutated_worktree` (finding) if it changes. The r15 counter is read-only by construction;
  the r16 counter is not yet written.
- `--reproduce` runs only at `REV`. The claim is a delta (PLAN.md:49-50), so the **before arm is
  never reproduced** — the "0" is asserted, not executed. That is the cheapest possible forgery
  surface (a constant-1 counter passes): run the same argv template at `before.revision`,
  `measuredRevision`, and `REV`, requiring `before.count`, `after.count`, `after.count`
  (`before_count_not_reproduced` / `count_not_reproduced`). The r16 counter contract's
  "missing → 0" (PLAN.md:77) must be explicit that missing evidence exits 0, not 1, or the before
  arm cannot pass.
- Make reproduction mandatory for a clean verdict: default `--check` should emit
  `mode=reproduce`; a static-only run may exist for debugging but must be labelled
  `verdict=static_only` (non-binding) so no report can quote a non-executed pass. Record `mode` in
  `check.json` (R5).
- `{REV}` token rule should be a standalone token (`token === '{REV}'`), not "exactly one
  occurrence": `--at={REV}` changes the counter's argv shape silently.

## R7 (medium) — environment drift beyond the listed keys

The plan's env allowlist (PLAN.md:37-38) is a real improvement over the lane's existing
`{PATH,HOME,TZ}` spawn env (`scripts/check-aria-metadata.mjs:2254-2262`) and should be adopted —
but pin the following or the reproduction is host-shaped:
- `HOME` is passed; global Git *attributes* (`$HOME/.config/git/attributes`,
  `$XDG_CONFIG_HOME/git/attributes`) are **not** disabled by `GIT_CONFIG_NOSYSTEM`/
  `GIT_CONFIG_GLOBAL`. Set `GIT_ATTR_NOSYSTEM=1` and a scratch `HOME` for both gate and child.
  (Attribute-driven `textconv` does not change `--name-status` — observed with
  `diff.external=/bin/false` — but `--no-ext-diff --no-textconv` costs nothing and removes doubt.)
- `diff.renames` changes the record shape of the R1 drift digest: default renames emit
  `R100 old new`, `--no-renames` emits `D old` + `A new` (both observed). Pin `-c diff.renames=false`
  + `--no-renames` so the digest is git-version stable.
- Pin `-c diff.relative=false` and run every git call with `cwd = resolved repo root`; otherwise a
  repo-local `diff.relative=true` rewrites paths (observed) and a `--repo` that is a subdirectory
  breaks literal matching. Verify `git -C <repo> rev-parse --show-toplevel` equals `realpath(repo)`
  (`repo_not_toplevel`).
- Refuse shallow repositories (`repository_shallow`, exit 2): ancestry over a shallow boundary is
  meaningless for defect 1/2. The lane is not shallow today
  (`git rev-parse --is-shallow-repository` → `false`), but the gate must not assume it.
- `git merge-base --is-ancestor <bogus> HEAD` exits **128**, not 1 (observed). Do not copy
  `scripts/check-freshness.mjs:68`'s `status !== 0 → baseline_ancestry` pattern; map 128 to
  `git_failed`/`revision_unresolved` (exit 2) and 1 only to `measured_revision_not_ancestor`.
- Run with `LC_ALL=C` (or avoid `localeCompare`); r15's `sortErrors` used `localeCompare`, a
  locale-sensitive comparator, and the plan asks for sorted finding lines.
- Use `process.execPath` rather than PATH-resolved `node` for the counter and for `--self-test`
  (house idiom: `scripts/check-user-round-contract.mjs:900`, `scripts/check-aria-metadata.mjs:2255`);
  argv[0] may stay the literal `node` in the manifest, but the executed binary must be the gate's
  own Node.

## R8 (medium) — selftest vocabulary and the `cases ≥ 12` threshold are inconsistent

PLAN.md:71 requires "each reason above at least once with a same-shape positive control", and
PLAN.md:75 requires `cases ≥ 12` plus "every reason in the vocabulary above exercised". Counting
the vocabulary actually defined in PLAN.md:54-60 and 61: 7 static per-claim reasons
(`measured_revision_not_ancestor`, `counter_digest_unrecorded`, `counter_digest_mismatch`,
`counter_changed_since_measurement`, `counted_inputs_undeclared`, `counted_input_changed`,
`argv_unsupported`), 2 reproduction reasons (`counter_failed`, `count_not_reproduced`), 4
could-not-evaluate reasons (`manifest_unreadable`, `manifest_schema_invalid`,
`revision_unresolved`, `git_failed`) = 13 distinct ids. With a paired control per reason plus the
two clean cases, legacy and injection cases, the minimum is ≥ 28, not 12. Either the threshold or
the coverage rule is wrong, and neither is machine-checkable today: `reasons=<k>` (PLAN.md:72) has
no defined comparison, and the counter (PLAN.md:75-76) must hardcode a vocabulary that lives in a
different file owned by a different seat — guaranteed drift.

Concrete fix: the gate exports its vocabulary (`REASONS` array, `--reasons --json`); the selftest
summary is `cases=<n> reasons=<k>` with `k === REASONS.length`; each negative case names
`control=<case-name>` and every control must resolve to a PASS case (machine-checked
"same-shape positive control"); the receipt embeds the vocabulary with `gateSha256`; the counter
requires `cases >= 2 * vocabulary.length + 2`, `vocabulary` ⊆ exercised ids, and no case id outside
`vocabulary` (`reason_vocabulary_drift`). Also require an explicit selftest case for each R1/R2/R4
addition (`drift_unexpected`, `drift_digest_mismatch`, `counter_worktree_mismatch`,
`counter_import_unsupported`, `counted_input_unsupported`, `counted_input_unresolved`,
`counter_revision_mismatch`, `counter_mutated_worktree`, `counter_timed_out`, and the two
pathspec-injection forms `:(exclude)…` / `!…` proven to yield a finding rather than an empty diff).

## R9 (low) — schema/exit-code gaps worth fixing before code

- `round` (PLAN.md:40) is not tied to the manifest path; a round-15 manifest could be checked and
  pass. Add `manifest_round_mismatch` (`round` must equal the `round-<N>` path segment).
- `bound=M` (PLAN.md:61) is undefined. Define it (e.g. claims whose every check passed and whose
  reproduced counts matched in all arms) or the selftest cannot assert the verdict line.
- Exit precedence is unspecified when both findings and could-not-evaluate occur: define
  `2 > 1 > 0` (any CNE makes the run uncertifiable) and state it in the stdout contract.
- `--json` must be exactly one stdout line (not verdict+JSON) and should carry:
  `{verdict, claims, bound, drift, manifest_sha256, findings[], claims:[]}` with findings sorted.
  `manifest_sha256` in the verdict line lets the report pin the exact bytes that were checked
  (there is no self-digest possibility otherwise).
- Duplicate claim ids (`claim_duplicate`); duplicate/ambiguous JSON keys (a duplicate `"sha256"`
  silently keeps the last under `JSON.parse` — either reject via a canonical-form check or accept
  and document, but do not leave it unstated).
- `axis` (PLAN.md:41) is unused by every check; either validate against the lane's axis vocabulary
  or delete it (dead field in a schema that is meant to be minimal).
- Paths in the manifest should be normalised once (`./` stripped, `\` rejected); r15's `repoPath`
  did this and the r16 design does not mention it.

## Does it close the two routed defects?

- **Defect 1** (`round-15-verifier-spotcheck.md:120`): the digest-at-measuredRevision +
  digest-at-REV + argv + `countField` + per-claim receipt is a genuine improvement and, with R2's
  three bindings (single-file/imports, worktree bytes, replace-free view) and R6's revision echo,
  it closes the specific failure "re-running the cited C1 argv at HEAD runs a different counter".
  As written it does not yet bind *what ran*, only *which file was named*.
- **Defect 2** (`round-15-verifier-spotcheck.md:121`): **not closed**. There is no drift assertion
  and no drift artifact; and because a manifest cannot name its own commit, `measuredRevision`
  always precedes delivery, so `counted_input_changed` alone can be green while the delivery
  differs. R1's drift record + declared allowlist, plus R5's `check.json` bound to the manifest at
  REV, are the minimum that makes "explicitly diff to the delivered HEAD" machine-checkable.

## Residual risk / verification gaps

- No lane gate, counter, selftest, census or browser was run (seat contract); `/tmp` probes and
  read-only `git` plumbing only. `scripts/check-measurement-binding.mjs`,
  `scripts/selftest-measurement-binding.mjs` and `.ufo/waves/round-16/measure.mjs` do not exist yet
  (`.ufo/waves/round-16/` is untracked), so all findings are design-level and none is a code
  defect claim.
- The replace-object demonstration used a blob replacement; I did not separately demonstrate a
  replaced *commit* rewriting the `--name-only` path set (the `-p` content rewrite was
  demonstrated). The mitigation (`--no-replace-objects` + env) covers both.
- `GIT_ATTR_NOSYSTEM`/scratch-`HOME` behaviour was not exercised; it is hardening, not a
  demonstrated lane hole.
- Cost of the proposed three-arm reproduction was not measured; the r15 counter is revision-pure
  (reads blobs via `git show`, never checks out) so three runs should be a few seconds each, but
  that is inference, not observation.
