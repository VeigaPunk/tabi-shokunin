# ExecNoHarm — no-harm gate sweep at the round-43 freeze

**Seat:** ExecNoHarm (executor) · **Round:** 43, wave 1 · **Axis:** freshness · **Milestone:** no-harm gate sweep at the freeze
**Date:** 2026-10-29 · **Mode:** read-only; no commits, no pushes, no writes outside my seat dir and my scratch root.

---

## 1. Method

Two clean clones of `/home/vgpnk/Projects/shokunin/tabi-shokunin` were created in my scratch root
`/fast/scratch/hyaku/tabi-r43/ExecNoHarm/` with `git clone --shared --no-checkout` + `git checkout --detach <rev>`:

| clone | revision | `git rev-parse --show-toplevel` | worktree state |
|---|---|---|---|
| `freeze` | `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` | `/fast/scratch/hyaku/tabi-r43/ExecNoHarm/freeze` | clean (`git status --porcelain` empty) |
| `baseline` | `ab592825cd195599822ca227f7768914df208201` | `/fast/scratch/hyaku/tabi-r43/ExecNoHarm/baseline` | clean (`git status --porcelain` empty) |

Both revisions were confirmed present as commits in the source repo before cloning
(`git cat-file -t <rev>` → `commit` for both). The baseline is the **direct parent** of the freeze
(`git rev-parse 7ca6f018^` → `ab592825cd195599822ca227f7768914df208201`), so the freeze is the
single commit that separates the two measurement points.

Every command was run with `cwd` = the clone, `TMPDIR` = `/fast/scratch/hyaku/tabi-r43/ExecNoHarm/tmp`
(explicitly set; never an inherited TMPDIR), and the exact stdout/stderr + exit code captured to a
per-command log under `evidence/`. Runner scripts: `evidence/run-sweep.sh` (the six named commands)
and `evidence/run-supplementary.sh` (argument-correct forms + usage-contract probes).

Environment: `node v24.21.0`, `git 2.56.0`. **No tools were installed or upgraded** — every check
needed only the Node runtime already present, so no `uv tool install` / official-binary / `npm -g`
channel was needed and **no pacman transaction was attempted** (pacman is host-paused by the
operator guard).

---

## 2. Receipt table — the six named commands, freeze vs baseline

`freeze` = `7ca6f018…`, `baseline` = `ab592825…`.

| # | command | freeze exit | baseline exit | delta |
|---|---|---|---|---|
| 1 | `node scripts/check-sources.mjs` | **1** | **0** | **NEW RED at freeze** (§3) |
| 2 | `node scripts/check-selfassessment.mjs` | 2 | 2 | identical (usage error, both) |
| 3 | `node scripts/check-freshness.mjs --self-test` | 0 | 0 | identical, byte-identical log |
| 4 | `node scripts/check-freshness.mjs --worktree` | 0 | 0 | identical, byte-identical log |
| 5 | `node scripts/check-frontier-admission.mjs` | 2 | 2 | identical (usage error, both) |
| 6 | `node scripts/check-c2-knowledge-round41.mjs --root <clone>` | 1 | 1 | identical — pre-existing red, same two findings |

Machine-readable copy: `evidence/receipts.tsv`.

### 2.1 Verbatim outputs

**(1) `check-sources` — RED at freeze, clean at baseline.**

```
### CMD: node scripts/check-sources.mjs
### CWD: /fast/scratch/hyaku/tabi-r43/ExecNoHarm/freeze
### REV: 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
FINDING id=used_by_missing fleet=E11 row=S150 detail=path_missing
FINDING id=used_by_missing fleet=E11 row=S151 detail=path_missing
SOURCES_GATE verdict=failed rows=151 tiers=A:135,B:7,C:9 status=queued:15,mined:126,rejected:10 findings=2 file=corpus/SOURCES.md
### EXIT: 1
```
```
### CMD: node scripts/check-sources.mjs
### CWD: /fast/scratch/hyaku/tabi-r43/ExecNoHarm/baseline
### REV: ab592825cd195599822ca227f7768914df208201
SOURCES_GATE verdict=clean rows=149 tiers=A:133,B:7,C:9 status=queued:15,mined:124,rejected:10 findings=0 file=corpus/SOURCES.md
### EXIT: 0
```
The row-count delta (149 → 151) is exactly the two rows the freeze appended: S150 and S151, both
`mined` (mined count 124 → 126).

Deterministic: two consecutive runs at each clone gave the same exit code (freeze 1/1, baseline 0/0).

**(2) `check-selfassessment` (no args) — usage refusal at both.**
```
SELFASSESSMENT verdict=could-not-evaluate detail=usage: --rev <REV> or --selftest
### EXIT: 2   (freeze and baseline, byte-identical)
```

**(3) `check-freshness --self-test` — clean at both.**
```
SELFTEST name=worktree_clean expected_exit=0 actual_exit=0 expected_finding=freshness_worktree result=PASS
… 12 cases, all PASS …
FRESHNESS_SELFTEST verdict=clean cases=12
### EXIT: 0
```
`diff` of the two logs (header lines stripped) → **IDENTICAL**.

**(4) `check-freshness --worktree` — clean at both.**
```
… 34 × PIN_MATCH …
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
### EXIT: 0
```
`diff` of the two logs (header lines stripped) → **IDENTICAL** (same 34 pinned targets, same
`baseline=c24eaea1…`, same `lane=31 public=3`).

**(5) `check-frontier-admission` (no args) — usage refusal at both.**
```
FRONTIER_ADMISSION verdict=could-not-evaluate detail=usage: --rev <REV> --frontier <slug> --since YYYY-MM-DD, or --selftest
### EXIT: 2   (freeze and baseline, byte-identical)
```

**(6) `check-c2-knowledge-round41 --root <clone>` — RED at both, identical findings.**
```
{"schema":"tabi-r41-c2-knowledge","predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}
### EXIT: 1
```
Byte-identical at freeze and baseline → this is a **pre-existing red that reproduces identically**,
not a new regression. (The round-43 C2 checker at the freeze revision is green —
`findingCount: 0`, `predicate: true`, exit 0 — so this r41 script's red is the known, separately
tracked S146-rejected/S148-supersedes state, not a round-43 harm.)

---

## 3. FINDING — `check-sources` is RED at the freeze commit where it was clean at baseline

**Severity:** medium. **Class:** no-harm regression introduced *by the freeze commit itself*, on the
lane's own registry gate. It is a *lane-integrity* red, not a C1/C2 claim-validity red (see §5).

### 3.1 Exact observation

`node scripts/check-sources.mjs` in a clean clone of `7ca6f018…`:

```
FINDING id=used_by_missing fleet=E11 row=S150 detail=path_missing
FINDING id=used_by_missing fleet=E11 row=S151 detail=path_missing
SOURCES_GATE verdict=failed … findings=2 file=corpus/SOURCES.md
exit 1
```
The same command in a clean clone of `ab592825…` (the freeze's direct parent): `verdict=clean …
findings=0`, exit 0.

### 3.2 Root cause — verified, not inferred

The freeze commit added exactly two rows to `corpus/SOURCES.md` (`git diff --numstat ab592825
7ca6f018 -- corpus/SOURCES.md` → `2 0`, both additions) and both name a **used-by path that is not
committed at that revision**:

```
| S150 | … | mined | 2026-10-29 | on-release | corpus/knowledge/receipt-authenticity-signing-round-43.md |
| S151 | … | mined | 2026-10-29 | on-release | corpus/knowledge/receipt-authenticity-signing-round-43.md |
```

```
$ git cat-file -e 7ca6f018:corpus/knowledge/receipt-authenticity-signing-round-43.md
fatal: path 'corpus/knowledge/receipt-authenticity-signing-round-43.md' exists on disk, but not in '7ca6f018'
$ git ls-tree -r --name-only 7ca6f018 -- corpus/knowledge/receipt-authenticity-signing-round-43.md | wc -l
0
$ git log --all --oneline -- corpus/knowledge/receipt-authenticity-signing-round-43.md
(empty — the file has never been committed at any revision)
```

The gate's rule is `inspectUsedBy` → `path_missing` → `used_by_missing` (fleet code **E11**,
`scripts/check-sources.mjs:336-338`, `inspectUsedBy` at `:203-233`): every `used-by` path of a
`mined` row must resolve to an existing regular file inside the repo root, and that file must cite
the row id. The file exists **only as an untracked working-tree file** in the live lane
(`git status --porcelain` → `?? corpus/knowledge/receipt-authenticity-signing-round-43.md`,
6,183 B, mtime Oct 29 17:51) — it was never committed, and it is still absent from the tip commit
`ba433c94` too (`git cat-file -e ba433c94:corpus/knowledge/receipt-authenticity-signing-round-43.md`
→ absent).

**Isolation experiment (causal proof, run in scratch only):** in a *separate* scratch clone at the
freeze, copying that one untracked file into the worktree turns the gate green:

```
$ cp <lane>/corpus/knowledge/receipt-authenticity-signing-round-43.md $S/fix/corpus/knowledge/
$ (cd $S/fix && node scripts/check-sources.mjs)
SOURCES_GATE verdict=clean rows=151 … findings=0 file=corpus/SOURCES.md
exit 0
```
and a scratch clone at the **tip** `ba433c94` (which does not contain the file) is red with the
same two E11 findings. So the red is caused *solely* by the committed bytes at the freeze, not by
the clone, the gate, or the environment.

**Note on the live lane tree:** `node scripts/check-sources.mjs` run directly in
`/home/vgpnk/Projects/shokunin/tabi-shokunin` currently exits **0 / clean**, because the untracked
file is present on disk there. The red is therefore *invisible in the live working tree* and only
appears in a clean checkout of the committed revision — which is precisely the committed-bytes
discipline the round's own C2 claim is about. This is the same class as the r41 D1 defect (files
that exist on disk but not in the commit), and it survives the freeze into the tip commit.

**Corroborating contract:** `corpus/README.md:9` states "A row is written when its file exists,
never before (CORPUS.md:45-47)". The freeze wrote the rows before the file existed in the tree.

### 3.3 Why this matters for the round (and what it does *not* touch)

- The lane's own sources gate is red **at the revision the claims are frozen against**. The round-43
  freeze `SCORECARD.md`/`LOG.md` sections claim a clean pre-dispatch state; the committed bytes at
  `7ca6f018…` do not satisfy the lane's registry gate in a clean checkout.
- **C1 and C2 predicates are unaffected.** The C2 checker (`check-routed-defects-round43.mjs`) reads
  only `corpus/SOURCES.md` rows **S146/S148** (rule r2) plus the round-41 evidence; it exits 0 with
  `findingCount: 0` at the freeze revision. Neither counter inspects `used-by` paths, so this red
  neither admits nor refutes either claim.
- **Remedy is on the wave's own critical path and needs no frozen-byte amendment:** commit
  `corpus/knowledge/receipt-authenticity-signing-round-43.md` (the wave already has seat
  `ScribeEntryAuth` drafting exactly this entry, and the file already exists untracked in the lane
  tree), or land the S150/S151 `used-by` cells in the same commit as the file they name. The
  counter and claims bytes stay frozen; nothing in `.ufo/waves/round-43/counters/` or
  `claims.json` needs to change.
- **This seat does not commit and did not touch the production tree.** The finding is routed, not
  fixed.

### 3.4 Scope check — is this pre-existing?

No. Baseline `ab592825…` is clean (exit 0, 0 findings) and is the direct parent of the freeze; the
only commit in between is `7ca6f018…` itself, and the only change to `corpus/SOURCES.md` in that
commit is the two appended rows. The red is introduced **by the freeze commit**, and it is still
present at the tip `ba433c94`.

---

## 4. Argument-correct forms and usage contracts

The two gates that refuse on no arguments (#2, #5) were re-run in their argument-correct form so
the comparison is not a pair of usage refusals.

| command | freeze | baseline | reading |
|---|---|---|---|
| `node scripts/check-selfassessment.mjs --rev <rev>` | **exit 0**, `verdict=clean mismatches=0 could_not_evaluate=117 superseded=48` | **exit 0**, `verdict=clean mismatches=0 could_not_evaluate=117 superseded=48` | identical except the echoed rev; `diff` shows one differing line (the rev), all 233 FINDING lines identical |
| `node scripts/check-frontier-admission.mjs --rev <rev> --frontier rate-tos-signal --since 2026-10-26 --json` | **exit 0**, `population: 2, admitted: 2, failing: 0, clean: true` | **exit 0**, `population: 2, admitted: 2, failing: 0, clean: true` | identical; same two entries (`host-published-rate-limit-headers.md`/S117, `rate-limit-policy-fields.md`/S116) |
| `node scripts/check-sources.mjs --root <clone>` | exit 1 (same 2× E11) | exit 0 | identical to the no-arg form — the root is the only input |
| `node scripts/check-freshness.mjs --witness <rev>` | exit 0, `verdict=clean finding=freshness_witness matched=34 …` | exit 0, `verdict=clean finding=freshness_witness matched=34 …` | identical except the echoed revision |
| `node scripts/check-sources.mjs --self-test` | exit 0, `SOURCES_SELFTEST verdict=clean cases=26` (26/26 PASS) | exit 0, `SOURCES_SELFTEST verdict=clean cases=26` (26/26 PASS) | identical (the sources gate's own self-test is green at both) |

### 4.1 `check-freshness --worktree` usage contract (as required by the item)

- Mode selection is **exactly one of** `--worktree | --witness REV | --self-test`; zero or two+
  modes → `FRESHNESS_GATE verdict=could-not-evaluate finding=usage detail=Choose exactly one mode`,
  **exit 2** (observed: `node scripts/check-freshness.mjs` with no args → exit 2).
- Accepted flags: `--repo PATH`, `--expected PATH`, `--witness REV`, `--self-test`, `--worktree`.
  Any other flag → `finding=usage`, exit 2.
- **The descriptor path is fixed by profile, not by the caller**: for the production root
  (`root === defaultRoot`) it must be
  `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`; for an isolated fixture
  root it must be `expected.json`. Passing a mismatched `--expected` →
  `finding=descriptor_allowlist`, exit 2. Observed: `node scripts/check-freshness.mjs --worktree
  --repo <baseline clone>` from the freeze clone → `verdict=could-not-evaluate
  finding=descriptor_allowlist detail=Descriptor path is fixed for production or isolated fixtures`,
  exit 2. **Consequence for cross-revision comparison:** `--worktree` cannot be pointed at another
  checkout; a second clone must be measured by running *its own* copy of the script, which is what
  this seat did (each clone runs `scripts/check-freshness.mjs` from inside itself).
- `--worktree` measures the **working tree** of `--repo`; `--witness REV` measures the **committed
  bytes** at `REV`. In a clean clone the two coincide, so `--worktree` in the clone is equivalent to
  a committed-byte measurement of that revision.
- The `publicTargets` allowlist is fixed to three absolute paths under
  `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/` and is read live from the host
  (`public=3` in both runs) — a host-state dependency outside the repo, identical for both
  revisions.
- The pin table path is also fixed by profile (`corpus/evidence/fleet-round-1-freshness/pins.tsv`
  in production, `pins.tsv` in a fixture); redirecting it → `finding=table_allowlist`, exit 2.
- Verdict/exit contract: **0 clean**, **1 failed** (a named finding: `content_drift`,
  `duplicate_target`, `target_set`, `source_pin`, `baseline_pin`, `public_allowlist`,
  `table_allowlist`, `witness_too_early`, `baseline_ancestry`, …), **2 could-not-evaluate**
  (usage / allowlist / unreadable revision). Any nonzero code other than 1/2 is undeclared and reads
  as could-not-evaluate.
- `--self-test` is hermetic: it builds 12 temporary fixture repositories under the OS temp dir,
  asserts exit code **and** finding id for each, and removes them (`FRESHNESS_SELFTEST
  verdict=clean cases=12`). It creates no repo files and touches no lane path.

### 4.2 Other usage contracts observed

- `check-selfassessment`: `--rev <REV>` or `--selftest` (the flag is `--selftest`, one hyphen), plus
  `--json` and `--repo <dir>`; `--help` prints the usage line and exits **0**. No `--rev` →
  `verdict=could-not-evaluate detail=usage: --rev <REV> or --selftest`, exit 2. Verdict contract:
  0 clean, 1 failed (mismatch), 2 could-not-evaluate, 3 self-test failure.
- `check-frontier-admission`: requires `--rev <REV> --frontier <slug> --since YYYY-MM-DD`
  (plus optional `--receipts`, `--lesson`, `--live`, `--json`), or `--selftest`. `--help` exits 0.
  No args → exit 2 with the usage detail quoted above. `--live` performs read-only HTTP GETs of the
  receipt URLs; **this seat did not use `--live`** (the item's command list has no `--live`), so
  both revisions were compared on committed bytes only. `--since` gates on the registry row's
  `opened` date; `rate-tos-signal` / `2026-10-26` are the parameters this lane's round-30 claim and
  the wave spec use, which is why they were chosen for the argument-correct comparison.
- `check-sources`: `--root PATH`, `--file PATH`, `--since YYYY-MM-DD`, `--self-test`. An unknown flag
  → `FINDING id=could_not_evaluate … detail=bad_arguments`, exit 2 (observed with `--nope`).
  **It reads the working tree, not a revision** — it has no `--rev`; it is `path`-shaped, so the
  only way to measure a revision is to check that revision out in a clone and run the gate there.
- `check-c2-knowledge-round41`: `--root <lane root>`, default
  `/home/vgpnk/Projects/shokunin/tabi-shokunin`. It reads the **working tree** of that root
  (`corpus/knowledge/environment-injection-measurement-integrity-round-41.md`,
  `corpus/README.md`, `corpus/SOURCES.md`), so pointing `--root` at a clean clone is what makes the
  comparison revision-scoped. It exits 1 whenever `predicate` is false.

---

## 5. No-harm verdict per gate

| gate | pre-existing red at baseline? | reproduces identically at freeze? | new red at freeze? |
|---|---|---|---|
| `check-sources` | no (baseline clean, exit 0) | n/a | **YES — exit 1, 2× E11 (S150, S151)** |
| `check-selfassessment` (no args) | usage refusal (exit 2) | yes, byte-identical | no |
| `check-selfassessment --rev` | no (clean) | yes (identical counts) | no |
| `check-freshness --self-test` | no (clean, 12/12) | yes, byte-identical | no |
| `check-freshness --worktree` | no (clean, 34/34) | yes, byte-identical | no |
| `check-freshness --witness` | no (clean, 34/34) | yes, identical | no |
| `check-frontier-admission` (no args) | usage refusal (exit 2) | yes, byte-identical | no |
| `check-frontier-admission` (full args) | no (exit 0, 2/2 admitted) | yes, identical | no |
| `check-c2-knowledge-round41` | **yes** (exit 1, `registry-status:S146:rejected`, `registry-usedby:S146`) | yes, byte-identical | no |
| `check-sources --self-test` | no (clean, 26/26) | yes, identical | no |

**One new red: `check-sources` at the freeze.** Every other measured gate either holds its baseline
state exactly or reproduces a pre-existing red byte-for-byte. The two refusal exits (#2, #5) are
*usage* errors, not reds — the seat item's command list names them without their required
arguments, and I re-ran both in argument-correct form to give a real comparison (§4).

**Effect on the two frozen claims:** none observed. C1's counter (`c1-signature-bound-v5.mjs`) and
C2's checker (`check-routed-defects-round43.mjs`) do not read `used-by` paths; the C2 checker exits
0 with `findingCount: 0` at the freeze revision. The `check-sources` red is a lane-integrity
finding against the freeze commit's own committed bytes, and it is remediable by committing the
S150/S151 target file — no frozen byte needs to move.

---

## 6. Limitations and what was not run

- **Not run:** `check-freshness --worktree` was not run with `--live` (the gate has no `--live`; the
  `--live` flag belongs to `check-frontier-admission` and performs network GETs — deliberately not
  used here, since the item's command list does not name it and read-only network re-fetching is
  outside this seat's lane).
- **Not run:** no build, lint, test, or formatter. No browser, no Playwright, no measure script, no
  counter scoring — this seat's scope is the gate sweep only.
- **Not run:** `check-frontier-admission --selftest` and `check-selfassessment --selftest` were not
  exercised (not in the item's list); the freshness and sources self-tests were, because they
  establish the gates' own integrity at both revisions.
- **Network:** none. All checks are local-file/git operations.
- **The freshness gate depends on three live host files** under
  `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/` (read-only, outside the repo). They
  matched their pins at both revisions, so they are not a confound here — but they are host state,
  not committed bytes, and a host change would move this gate independently of the repo.
- **The `check-c2-knowledge-round41` red** is reproduced identically at both revisions, so it is
  carried, not caused. It is the known S146-rejected/S148-supersedes state. I did not adjudicate
  whether it should now be retired — out of this seat's scope.
- **One scope caveat on the C2 checker cross-check:** I ran
  `check-routed-defects-round43.mjs --rev 7ca6f018… --repo <freeze clone> --json` from the scratch
  clone purely as a read-only cross-check that the freeze's own C2 instrument is green at the freeze.
  Its exit 0 / `findingCount: 0` is reported as context for §5; it is **not** a claim verdict, and
  the claim verdict belongs to the L1 and the closure.
- **Clone choice:** `git clone --shared` (alternates pointing at the source object store) rather than
  `git worktree`. A shared clone has no `.git` file of its own and no separate object store; it was
  sufficient here because every command is read-only, both clones' worktrees are clean, and the
  `git rev-parse --show-toplevel` assertion was checked per clone. It does mean the clones are not
  byte-independent of the source repo's object database — no measurement here depends on object
  independence (all checks read the checked-out worktree or `git show`/`ls-tree` of specific
  revisions, whose bytes were independently verified by sha256/ls-tree in the logs).

---

## 7. Evidence index

All under `.ufo/waves/round-43/w1/ExecNoHarm/evidence/`:

| file | content |
|---|---|
| `receipts.tsv` | machine-readable exit/finding table for the six named commands |
| `SHA256SUMS.txt` | sha256 of every evidence file in this directory |
| `run-sweep.sh`, `run-supplementary.sh` | the exact runners used (cwd, TMPDIR, logging, exit capture) |
| `freeze.check-sources.log`, `baseline.check-sources.log` | finding #1 (the new red) |
| `freeze.sources-explicit-root.log`, `baseline.sources-explicit-root.log` | finding #1 with `--root` |
| `freeze.check-sources-selftest.log`, `baseline.check-sources-selftest.log` | sources gate self-test, 26/26 both |
| `freeze.check-selfassessment.log`, `baseline.check-selfassessment.log` | finding #2 (usage refusal, both) |
| `freeze.selfassessment-rev.log`, `baseline.selfassessment-rev.log` | finding #2 in argument-correct form (clean, both) |
| `freeze.check-freshness-selftest.log`, `baseline.check-freshness-selftest.log` | finding #3 (12/12, byte-identical) |
| `freeze.check-freshness-worktree.log`, `baseline.check-freshness-worktree.log` | finding #4 (34/34, byte-identical) |
| `freeze.freshness-witness-rev.log`, `baseline.freshness-witness-rev.log` | finding #4 via `--witness` |
| `freeze.check-frontier-admission.log`, `baseline.check-frontier-admission.log` | finding #5 (usage refusal, both) |
| `freeze.frontier-full-args.log`, `baseline.frontier-full-args.log` | finding #5 in argument-correct form (2/2 admitted, both) |
| `freeze.check-c2-knowledge.log`, `baseline.check-c2-knowledge.log` | finding #6 (pre-existing red, byte-identical) |
| `probe.freshness-no-mode.log`, `probe.freshness-cross-repo.log`, `probe.sources-bad-flag.log`, `probe.selfassessment-help.log`, `probe.frontier-help.log` | usage-contract probes (§4) |
| `causal-isolation.log` | the causal experiment of §3.2 — tip clone red (exit 1, 2× E11), freeze clone + the one uncommitted file clean (exit 0) |

---

## 8. Final

The sweep is complete: six named commands × two revisions, plus argument-correct forms, usage
probes, a self-test pair, and a causal isolation experiment for the one divergence found.
Exactly one new red exists at the freeze — `check-sources` exits 1 with two `used_by_missing` (E11)
findings on S150/S151 because the freeze committed registry rows whose `used-by` target file
`corpus/knowledge/receipt-authenticity-signing-round-43.md` is not in the committed tree — it is
present only as an untracked working-tree file, and is absent from the tip commit too. Every other
gate holds its baseline state exactly or reproduces a pre-existing red byte-for-byte. No frozen
counter or claim byte is affected; the remedy is to commit the entry (or land the rows with their
file), which is the wave's own path and needs no amendment. No commits, no pushes, no writes outside
this seat directory and my scratch root; the scratch root was removed before yielding.

VERDICT finding one new red at the freeze: `node scripts/check-sources.mjs` exits 1 (2× E11 used_by_missing on S150/S151 — committed rows name an uncommitted file) where the baseline exits 0; all other measured gates hold their baseline state byte-identically.
