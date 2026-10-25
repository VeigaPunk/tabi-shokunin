# ReviewRevisionInput — CLI revision handling of the round-22 C1 counter

**Scope (my named item only).** How `.ufo/waves/round-22/measure-c1.mjs` handles the revision
argument at the CLI: short/abbreviated/ref names, missing objects, worktree-vs-revision reads
(`filesAt`), and whether the oracle code itself is read from the worktree or from the revision —
and the consequence for measurement reproducibility.

**Reviewed revision.** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (landed, pushed). Production
read only via `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0…:PATH`.
Parent / first integrated checkpoint: `0f24164be77e72ba359fe4befdc42d96bc343034`.

**Counter bytes (sha256 of the file, verified):**

| revision | `.ufo/waves/round-22/measure-c1.mjs` sha256 |
|---|---|
| `0f24164…` (pre-repair) | `76b47edd9eb30ff64554ef0238ffcea70312059318f9c86cc64231fea7acc447` |
| `e3cf4e0…` (post-repair, reviewed) | `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c` |

**Execution environment.** Node `v24.21.0`
(`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`). All measurements ran in
my private throwaway clone `/tmp/tabi-r22-w2b-ReviewRevisionInput`
(`git clone --no-hardlinks` of the lane, `git checkout --detach e3cf4e0…`), which I deleted at the end.
No browser, no installs, no lane mutation, no VCS write in the lane/fleet, no delegation, no seat
messaging. No tool was installed or upgraded (none was needed).

---

## Findings by severity

### F1 — MEDIUM — The oracle's own bytes are worktree-sourced and are not bound to (nor reported with) the measured revision, so one command line yields two different numbers for the same revision.

**Where.** `e3cf4e0…:.ufo/waves/round-22/measure-c1.mjs`

* `:11-12` — `SELF = fileURLToPath(import.meta.url)`; `ROOT = resolve(dirname(SELF),'../../..')`.
  The **code that runs is whatever bytes sit in the worktree**.
* `:38-41` — `INPUT_PATHS` = expectations, note, producer, receipt, execution record, 24 round-21
  case artifacts. **The oracle's own path is not among them.**
* `:507-521` — `filesAt(revision)` reads *only* `INPUT_PATHS` from the revision's tree
  (`:514` `git ls-tree -r -z <rev> -- …INPUT_PATHS`, `:518` `git cat-file blob <oid>`).
  The revision's own copy of `measure-c1.mjs` is never read, and never compared to the running file.
* `:527-538` — the CLI branch runs `evaluate(filesAt(revision))` and stamps only
  `output.revision = revision` (`:536`). **The output carries no oracle identity.**

**Smallest counterexample (measured, same target revision, two worktrees).**

```
worktree @ e3cf4e0 (oracle sha 47176aed):
  node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
  → exit 0  verdict=clean   value=12  findings=[]

worktree @ 0f24164 (oracle sha 76b47edd), SAME target:
  node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
  → exit 1  verdict=failed  value=0
     findings=[semantic_error na-native-submit:post:page-errors,
               semantic_navigation na-native-submit:post:url]
```

The two JSON lines differ, but the `revision` field is byte-identical in both, and neither names the
oracle that produced it. The *measured revision's* inputs are identical in the two runs (the repair
diff `e3cf4e0…` touches only `measure-c1.mjs`, `selftest-c1.mjs` and `fixtures/expected.json`), so
the entire 12-vs-0 difference is the oracle's own logic.

**Why this is a live, in-wave consequence (not hypothetical).**

* `.ufo/waves/round-22/checks-pre-w2-0f24164.json` (committed at `e3cf4e0…`) records
  `c1-after` = exit 1, `value 0`, `verdict failed` for revision `0f24164…` with
  `producerSha256 76b47edd…` (the pre-repair oracle).
* Re-running the **documented recheck command today** against that same revision gives the opposite
  number: `node .ufo/waves/round-22/measure-c1.mjs 0f24164…` from any worktree at/after the repair
  → exit 0, `verdict clean`, `value 12` (measured; the wave itself records this in
  `.ufo/waves/round-22/post-crash-repair.json` → `sandbox.measureAt0f24164WithRepairedOracle:
  "value12 clean exit0"`).
* The note advertises exactly that recheck: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:3`
  (`recheck: node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV; …`) and `:56`. A reader who
  follows it for a historical revision gets a number that contradicts the retained receipt, with no
  diagnostic in the output telling them which oracle they just ran.

**Preserving positive (this must not regress).** When the running oracle *is* the revision's oracle
blob, everything is stable and the wave's headline claim is reproducible end-to-end — and it is,
because `run-checks.py` clones the lane at the revision (`:63`) and records the counter digest
(`:148` `producerSha256 = digest(lane / gate['producerPath'])`):

```
BASE 5f585773258b33d2d514b00cd0b0775333578db6 → exit 0  verdict=baseline value=0
e3cf4e0d30bb835532ff44b118c5ad52e09eb76d       → exit 0  verdict=clean    value=12
```

So the wave's own receipts *do* bind the oracle bytes; the defect is that the **CLI result is not
self-describing**, and the CLI happily measures a revision whose oracle differs from the running one
without saying so. The wave's headline 0→12 is **not** falsified by this finding.

**Smallest fix (keeps every recorded positive).** In the CLI branch (`:532-538`), identify the
oracle and compare it with the revision:

1. add `oracle: { path: '.ufo/waves/round-22/measure-c1.mjs', sha256: sha256(readFileSync(SELF)) }`
   to the emitted JSON (one field; makes every future measurement attributable); and
2. read the revision's own blob for that path (`git rev-parse <rev>:.ufo/waves/round-22/measure-c1.mjs`
   → `cat-file`) and, **when the revision contains that path and the digests differ**, exit 2 with
   detail `revision_input:oracle-bytes-differ-from-revision`; skip the check when the revision lacks
   the path (the legitimate `c1-before` run at BASE `5f58577…`, where `.ufo/waves/round-22/` does not
   exist yet — this keeps the `baseline` verdict and exit 0 unchanged).
   An explicit `--foreign-oracle` escape hatch keeps historical one-off re-measurements possible.

---

### F2 — LOW — The rejection path drops the attempted revision, so a failed recheck cannot be attributed.

**Where.** `e3cf4e0…:.ufo/waves/round-22/measure-c1.mjs:536` (revision stamped only on success),
`:539-544` (catch → `cliError`), `:523-525` (`cliError` builds a result with no `revision` field).

**Smallest counterexample (measured).**

```
node .ufo/waves/round-22/measure-c1.mjs deadbeef
→ exit 2  {"…","verdict":"could-not-evaluate","findings":[{"id":"revision_input",
           "detail":"revision_input:full-40-hex-commit-required"}]}
```

The emitted line contains no trace of the argument that was attempted (the success path echoes it at
`:536`). Every other rejection (`HEAD`, `master`, `refs/heads/master`, uppercase hex, missing
object, blob sha, tree sha, tag sha, missing blob) is equally unattributable.

**Preserving positive.** The rejection *causes* are distinguished by distinct detail strings
(`full-40-hex-commit-required`, `commit-identity-mismatch`, `git-object-unavailable`,
`non-regular-or-unlisted-blob`, `usage`), and the success path already stamps `revision`.

**Smallest fix.** In the catch, set `output.revision = process.argv[2] ?? null` (or pass the raw
argument into `cliError(message, revision)`); one line, no behaviour change for any recorded receipt.

---

### F3 — LOW — A symlinked invocation exits 0 with **empty stdout**: a silent "success" for any exit-code-only harness.

**Where.** `e3cf4e0…:.ufo/waves/round-22/measure-c1.mjs:527`
`if (process.argv[1] && resolve(process.argv[1]) === SELF) {`.
Node resolves the *entry point* symlink to its realpath, so `import.meta.url` (and therefore `SELF`)
is the realpath while `resolve(process.argv[1])` is the symlink path — the equality fails, the whole
CLI block (including the `--selftest` branch) is skipped, and the module just exports and exits 0.

**Smallest counterexample (measured).**

```
ln -s <clone>/.ufo/waves/round-22/measure-c1.mjs /tmp/m.mjs
node /tmp/m.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d
→ exit 0   stdout=''   stderr=''
```

The same command through the real path prints one JSON line and exits 0/1/2. A harness that reads
only the exit code scores the symlinked run as a pass with no measurement at all. (The lane's own
runner is unaffected: `run-checks.py:150` invokes an absolute path inside the sandbox clone, and the
selftest's `runCli` (`selftest-c1.mjs:357-369`) uses `join(cwd, path)` — both real paths.)

**Preserving positive.** Direct invocation is unaffected and remains the documented usage
(`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:3`, `:56`); the guard's *purpose* (do not run
the CLI when the module is imported) is legitimate and must be kept.

**Smallest fix.** Compare realpaths instead of raw paths — e.g.
`resolve(realpathSync(process.argv[1])) === realpathSync(SELF)` — or invert the test to
`import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href`, keeping the "imported as a
library ⇒ no CLI" property.

---

### F4 — LOW (attribution, not detection) — `--selftest` is worktree-anchored: it certifies the worktree's oracle, expectations and round-21 artifacts, not any revision's.

**Where.** `e3cf4e0…:.ufo/waves/round-22/selftest-c1.mjs`

* `:26` — expected fixture read from `HOME` (the worktree's wave directory).
* `:49-50` — the oracle note and `semantic-expectations.json` read from `ROOT` (worktree).
* `:52` — **the counter under test** read from `HOME` (worktree wave dir).
* `:56-59` — round-21 receipt / execution record / producer / 24 case artifacts read from `ROOT`.
* `measure-c1.mjs:529` — the `--selftest` branch resolves the selftest from `ROOT` as well.

So every byte the selftest consumes comes from the **worktree**, while `<REV>` mode reads the
**revision**. The selftest's verdict is therefore a function of the worktree, not of a revision: a
worktree holding the pre-repair counter blob fails the positive case even though the revision under
review is untouched, and doctored round-21 artifacts in the worktree change the verdict without any
revision change.

**Preserving positive.** In the wave's own cohort the anchoring *is* correct: `run-checks.py:63`
clones the lane at the revision and runs the selftest there (`:115-121`), so
`checks-at-e3cf4e0.json` → `oracle22-selftest` exit 0 with `producerSha256 47176aed…` is a
revision-anchored result. I reproduced it: `node .ufo/waves/round-22/measure-c1.mjs --selftest` in
my clone at `e3cf4e0…` → exit 0, `verdict clean`, `cases 44`, `passed 44`.

**Smallest fix.** Have `loadBase()` source its base bytes from the revision under test (via
`filesAt`) instead of `ROOT`, or at minimum emit the sha256 of every base file the selftest loaded
in its JSON result, so a selftest receipt is attributable.

---

### F5 — INFORMATIONAL (verified positives; no action required, recorded so the next reviewer does not re-litigate)

1. **Short / abbreviated / ref / uppercase names are rejected, never silently mis-measured.**
   Measured at `e3cf4e0…`: `e3cf4e0` (short), `HEAD`, `master`, `refs/heads/master`, uppercase
   40-hex → all exit 2, `verdict could-not-evaluate`, detail
   `revision_input:full-40-hex-commit-required` (gate at `measure-c1.mjs:508-509`).
   This matches the documented usage `FULL40HEXREV`
   (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:3`, `:56`) and the lane's round-21
   precedent (`.ufo/waves/round-21/measure-c1.mjs` also requires a full 40-hex). **Not a defect.**
2. **Missing objects fail closed, never as a false 0/1.** Nonexistent 40-hex → exit 2
   `git-object-unavailable`; a *blob* sha and a *tree* sha as target → exit 2
   `git-object-unavailable`; an annotated-tag object sha → exit 2 `commit-identity-mismatch`
   (`:511`); **a commit whose input blob object was deleted** → exit 2 `git-object-unavailable`
   (not a false `baseline`). No false 0/1 in any case.
3. **Non-regular inputs fail closed.** The expectations path stored as mode `120000` (symlink) →
   exit 2 `non-regular-or-unlisted-blob` (`:517`).
4. **The measured inputs really are revision-pinned.** Dirtying the worktree's
   `corpus/evidence/round-22/semantic-expectations.json` and
   `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` did **not** change the result
   (exit 0 / clean / 12 in both cases). The only worktree dependence in the whole counter is the
   oracle's own bytes (F1).
5. **The input side is strongly pinned and fails closed.** A substituted expectations blob →
   exit 1, findings `semantic-expectations-digest` + `semantic-expectations-schema` (digest pins at
   `:22`/`:392-393`); a doctored counter pin (`EXPECTATIONS_SHA256` flipped in the worktree) →
   exit 1 `semantic-expectations-digest`. Producer pin at `:23`/`:414`; receipt/artifact digests at
   `:430-436`, `:471-472`.
6. **`git replace` poisoning is defeated.** With a `refs/replace/*` ref mapping `e3cf4e0…` to a
   doctored commit (expectations altered), the measurement stayed exit 0 / clean / 12 —
   `GIT_NO_REPLACE_OBJECTS: '1'` (`:495`) works as intended.
7. **The wave's headline C1 claim reproduces**: BASE `5f58577…` → exit 0 `baseline` 0;
   `e3cf4e0…` → exit 0 `clean` 12, using the revision's own counter bytes.
8. **The `baseline` verdict is distinguishable from a pass**: `value 0`, `verdict baseline`, exit 0,
   `findings []` — a reader cannot confuse "instrument absent" with "measured clean" by accident.

---

## Residual risk / verification gaps

* **Not run (host constraint, stated honestly):** partial-clone (`--filter=blob:none`) and
  shallow-clone (`--depth 1`) reproductions. `/tmp` was 100 % full (128 G used, 460 MB free) when I
  tried them — `git clone` failed with `fatal: could not create work tree dir … No space left on
  device`. The *missing-object* behaviour they would exercise is covered instead by the
  deliberately deleted loose blob (F5.2) and by the nonexistent/foreign 40-hex probes. **[INFERENCE]**
  under `GIT_NO_LAZY_FETCH=1` a promisor clone would fail closed with
  `git-object-unavailable`; not measured.
* **Not run:** any browser, credential, REA or service; the round-22/21 harness; the fleet cohort.
  Nothing outside the counter CLI and its own selftest was exercised.
* The `revision-short` / `revision-missing` selftest cases (`fixtures/expected.json`) cover two of
  the seven rejection causes; the ref-name, uppercase, blob/tree, annotated-tag, missing-blob and
  symlink paths are **not** covered by the selftest. Ref names and uppercase share the regex branch
  with the covered short-hash case, so the uncovered value is low; the missing-blob branch (a
  different `git()` call site than the covered missing-commit case) and the symlink path (F3) are
  the two real coverage gaps.
* F1's severity is bounded by the wave's own receipt discipline (`run-checks.py:148` records the
  counter digest), which is why I rate it MEDIUM rather than HIGH: no recorded wave claim is
  falsified by it, but the *documented recheck workflow* is ambiguous for historical revisions.
* I did not audit the semantic correctness of the twelve rows, the expectations content, the
  round-21 evidence, or the author-fitness question — those are other seats' items.

## Commands exercised (all in `/tmp/tabi-r22-w2b-ReviewRevisionInput`, node v24.21.0)

| # | command | exit | observed |
|---|---|---|---|
| A | `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0…` (worktree @ e3cf4e0) | 0 | clean, value 12 |
| B | same, target `0f24164…` (worktree @ e3cf4e0) | 0 | clean, value 12 |
| C1 | same, worktree @ 0f24164, target `0f24164…` | 1 | failed, value 0 (D1/D2 findings) |
| C2 | same, worktree @ 0f24164, target `e3cf4e0…` | 1 | failed, value 0 |
| D1-D4 | target `e3cf4e0` / `HEAD` / `master` / `refs/heads/master` | 2 | `full-40-hex-commit-required` |
| D5 | target `000…0` | 2 | `git-object-unavailable` |
| D6 | target uppercase 40-hex | 2 | `full-40-hex-commit-required` |
| D7/D8 | extra arg / no arg | 2 | `usage` |
| D9/D10 | blob sha / tree sha target | 2 | `git-object-unavailable` |
| E1/E2 | dirty worktree expectations / note, target e3cf4e0 | 0 | clean, 12 (unchanged ⇒ revision-pinned) |
| E3 | dirty counter pin, target e3cf4e0 | 1 | `semantic-expectations-digest` |
| E4 | restored | 0 | clean, 12 |
| F1 | commit with substituted expectations blob | 1 | digest + schema + source-header findings |
| F2 | same commit, blob object deleted | 2 | `git-object-unavailable` |
| F3 | intact revision control | 0 | clean, 12 |
| G1/G2 | annotated-tag object sha / tag sha | 2 | `commit-identity-mismatch` |
| G3 | expectations stored as mode 120000 | 2 | `non-regular-or-unlisted-blob` |
| — | `node .ufo/waves/round-22/measure-c1.mjs --selftest` @ e3cf4e0 | 0 | clean, 44/44 |
| — | symlinked entry point | 0 | **empty stdout** (F3) |
| — | `git replace e3cf4e0 <doctored>` then measure e3cf4e0 | 0 | clean, 12 (replace ignored) |
| — | partial/shallow clone reproductions | — | **not run** — `/tmp` full (`No space left on device`) |

Sandbox removed: `/tmp/tabi-r22-w2b-ReviewRevisionInput` deleted after the runs above; the lane and
fleet were never written to. No tool installed or upgraded.
