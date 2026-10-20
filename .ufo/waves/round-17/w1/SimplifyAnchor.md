VERDICT: PASS

# C1 lane-tip anchor — exact code + per-gate call sites (read-only)
Line numbers are master `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` blobs. The worktree has diverged on
both gate files (sibling seats own them: `git diff --stat master` → 191/118 lines), so do not reuse
worktree lines. Prototyped/executed in `git clone --no-hardlinks -b master LANE /tmp/tabi-r17-
SimplifyAnchor-2*` clones (attached; round-gate blob sha256 `8a573b4e…`); clones deleted. No LANE writes.

## 1. Resolver — identical in check-round-contract.mjs and check-user-round-contract.mjs
Insert after `gitOk` (round L68, user L124), before `blob`:
```js
// jj-colocated lanes detach git HEAD (it may name an unlanded or empty commit),
// so gates certify the lane branch tip, never HEAD. Attached HEAD (plain git,
// fixtures) resolves to its own branch; detached HEAD resolves refs/heads/master.
const LANE_BRANCH = /^refs\/heads\/[A-Za-z0-9._/-]+$/;
let TIP = null;
function laneTip(root) {
  const sym = git(root, ['symbolic-ref', '-q', 'HEAD']);
  const ref = sym.status === 0 ? sym.stdout.trim() : 'refs/heads/master';
  const note = sym.status === 0 ? '' : ' (HEAD is detached)';
  if (!LANE_BRANCH.test(ref) || ref.split('/').some(part => part === '' || part === '.' || part === '..')) {
    fail('could_not_evaluate', `HEAD is not a lane branch${note}: ${ref.slice(0, 120)}`, 2);
  }
  const tip = git(root, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]);
  if (tip.error || tip.status !== 0 || !/^[a-f0-9]{40}$/.test(tip.stdout.trim())) {
    fail('could_not_evaluate', `Lane anchor ${ref} does not resolve to a commit${note}`, 2);
  }
  return tip.stdout.trim();
}
```
`TIP` is written once per evaluated root: `check()` (round L575, user L598) and user `selfTest()` (L1070,
which calls `roundIds(defaultRoot)`). Witness modes use `codeRevision = laneTip(defaultRoot)` (§3), so
`--self-test` resolves once per arm it drives (same value); every former `'HEAD'` rev becomes `TIP`.

## 2. check-round-contract.mjs (18 hunks, +64/−21)
| line | edit |
|---|---|
| 119,170,173,177 | `ls-tree`/`blob`/`show` in `regularBlob`,`checkShonen`,`censusEntries` → `TIP` |
| 231 | `checkHistory` `head = gitOk(…rev-parse HEAD)` → `head = TIP` (threads 233,242,246,253,255) |
| 266 | `roundIds` `list` → `TIP` |
| 466,487,500,504 | `checkSwarm` aggregate+seat, `checkReport` `show` + `merge-base measured HEAD` → `TIP` |
| 517,520,538,540 | `scanConsequential` + `sameTree` `list`/`show`/`blob` → `TIP` |
| 548,565 | `checkPublic` capture + screenshot/dom `show` → `TIP` |
| 584,585,587 | `check()` SCORECARD/LOG/lesson `show` → `TIP` |
| 575 | add `TIP = laneTip(root);` after `const root = options.repo;` |
| 1007 | `countWitness` `codeRevision` → `laneTip(defaultRoot)` |
Unchanged: L614 `commit()`, L990/996/1000 fixture `rev-parse HEAD`, L532 HTTP literal.
Self-test (same file): helper after `commit()` (L615), case before `];` L876, runner after L886:
```js
// jj-like detached HEAD: the checked-out branch keeps the evaluated tip while
// HEAD names an unlanded child whose SHONEN tree differs. A gate that reads
// HEAD certifies the poison; a gate that reads the lane tip does not.
function detachAtPoisonChild(root) {
  const branch = gitOk(root, ['symbolic-ref', 'HEAD']);
  const tip = gitOk(root, ['rev-parse', 'HEAD']);
  writeFileSync(join(root, SHONEN_PATH), 'poisoned shonen\n');
  gitOk(root, ['add', '--', '.']);
  const poison = commit(root, 'poison');
  gitOk(root, ['update-ref', branch, tip]);
  gitOk(root, ['update-ref', 'refs/heads/master', tip]);
  gitOk(root, ['update-ref', '--no-deref', 'HEAD', poison]);
  return tip;
}
```
```js
    { name: 'detached_head_reads_lane_tip', detach: true, mutate: root => {
      mkdirSync(join(root, 'corpus/lessons'), { recursive: true });
      writeFileSync(join(root, 'corpus/lessons/round-2.md'), 'future lesson\n');
    }, exit: 0, finding: 'clean' },
```
`if (test.detach) detachAtPoisonChild(root);`

## 3. check-user-round-contract.mjs (25 hunks, +75/−32)
| line | edit |
|---|---|
| 167,230,237 | `committedBlob`; `acceptedRoundScript` `show` + `pin..HEAD` → `TIP` |
| 252,254,255,262 | `lessonDrift` `blob`×2 + `log pin..HEAD`; `pstackDrift` SHONEN `show` → `TIP` |
| 308 | `checkHistory` `head = rev-parse HEAD` → `head = TIP` (threads 310,318,322,326) |
| 338 | `roundIds` `list` → `TIP` |
| 443,474,493,512 | `checkSpec` spec+dispatch, `checkSwarm` aggregate+seat `show` → `TIP` |
| 525,529 | `checkReport` `show` + `merge-base` → `TIP` |
| 539,541,559,561,569,586 | `scanConsequential`, `sameTree`, `checkPublic` → `TIP` |
| 607,608,610 | `check()` SCORECARD/LOG/lesson `show` → `TIP` |
| 599 | add `TIP = laneTip(root);` after `const root = options.repo;` |
| 790,794 | `witness` `codeRevision` → `laneTip(defaultRoot)`; `headBlob` rev → `codeRevision` |
| 874,878 | `runCountWitness` same two (JjAudit F3: worktree blob vs tip blob) |
| 953,955 | `runDiagnosticWitness` reorder: `codeRevision` first, `headBlob` uses it |
| 1070,1268 | `selfTest` `TIP = laneTip(defaultRoot);`; committed SCORECARD → `TIP` |
Unchanged: L633 `commit()`, L1114 fixture `rev-list`, L553/591 HTTP literals. `ROUND_SCRIPT_*` untouched.
Self-test: same helper before `writeGoodFixture` (L636, `'SHONEN.md'` literal), same case before `];`
L1206 (mutate writes `'future lesson bytes\n'`), runner after the `if (test.after)` block (L1221).

## 4. check-measurement-binding.mjs + selftest-measurement-binding.mjs (2 hunks, +16/−2)
After `resolveCommit` (L237), before the `resolveRepo` comment:
```js
// jj-colocated lanes detach git HEAD (it may name an unlanded or empty commit),
// so --at defaults to the lane branch tip, never HEAD. Attached HEAD (plain git,
// fixtures) resolves to its own branch; detached HEAD resolves refs/heads/master.
const LANE_BRANCH = /^refs\/heads\/[A-Za-z0-9._/-]+$/;
function laneTip(repo) {
  const sym = git(repo, ['symbolic-ref', '-q', 'HEAD']);
  const ref = sym.status === 0 ? sym.stdout.trim() : 'refs/heads/master';
  const note = sym.status === 0 ? '' : ' (HEAD is detached)';
  if (!LANE_BRANCH.test(ref) || ref.split('/').some(part => part === '' || part === '.' || part === '..')) {
    refuse(FAILURE_REASON.revisionUnresolved, `lane anchor HEAD is not a branch${note}: ${cleanDetail(ref)}`);
  }
  return resolveCommit(repo, ref, '--at (lane tip)');
}
```
L833 → `atRev = options.at === null ? laneTip(repo) : resolveCommit(repo, options.at, '--at');`
(`options.at` default `null` at L758; explicit `--at` unchanged). Master alias required: fixtures use
`init -b main`; the detached fallback is refs/heads/master. selftest after L218:
```js
positive('detached_head_reads_lane_tip', () => {
  const built = cleanShape();
  const tip = git(built.root, ['rev-parse', 'HEAD']);
  put(built.root, 'counted/input.txt', 'poison input\n');
  const poison = commitAll(built.root, 'poison child');
  git(built.root, ['update-ref', 'refs/heads/main', tip]);
  git(built.root, ['update-ref', 'refs/heads/master', tip]);
  git(built.root, ['update-ref', '--no-deref', 'HEAD', poison]);
  return built;
});
```

## 5. Evidence (sandbox only)
- Attached equality vs pristine: round `RC_IDENTICAL_FINAL`; user `UC_IDENTICAL_FINAL` (both red at master:
  `round_count … 6 user rounds, expected 10`, unchanged behavior); binding both `verdict=clean bound=2`.
- Arm B (poison child of tip changing SHONEN; master reset to tip, `--no-deref HEAD poison`): patched round
  exit 0 and `RC_ARM_B_EQ_ARM_A`; baseline `finding=shonen_policy`.
- User witness under detached HEAD: patched `codeRevision=5859243… result=PASS`; baseline
  `codeRevision=47cfb9… committed=yes` (= poison).
- Binding, poison in counted input `corpus/README.md`: baseline `reason=counted_input_changed`, patched clean.
- `--self-test` final bytes: cases 33/43/60, all `verdict=clean`, new case PASS in all three.
- Falsifier vs BASELINE bytes (case+helper only): round `finding=shonen_policy`; user
  `finding=history_rewritten detail=Protected bytes changed: SHONEN.md`; binding `reason=counted_input_changed`
  at `actual_exit=1`. User proof needs a pristine round gate in the copy (`round_script_cutover` aborts first).

## 6. Integration order / consequences (L1)
1. Land `scripts/check-round-contract.mjs`; move old `ROUND_SCRIPT_CURRENT_SHA256` (`8a573b4e…`) into
   `ROUND_SCRIPT_ARCHIVED_SHA256` and set the landed sha as current. Until then the user gate has one red
   self-test case (`round_script_cutover`) and production reports `history_rewritten` on the new tip.
2. r16 `measurement-binding.json` declares both binding scripts as C1 counted inputs; once these bytes change
   at a later tip the r16 check correctly reports `counted_input_changed` (gate working; r17's own manifest is
   the tip receipt). C1 counter A/B equality is unaffected.
3. `TIP` is module-scope; every reader is reachable only after `check()`/user `selfTest` assigns it
   (exercised above); a future mode adding a reader must resolve first. No pacman/uv/npm, no network, no
   REA; all git writes confined to /tmp clones.

Files written: `.ufo/waves/round-17/w1/SimplifyAnchor.md`
