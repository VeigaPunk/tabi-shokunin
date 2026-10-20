# ReconGatePatterns — reusable gate conventions for C1 (BindCore / BindSelftest)

Seat: `TabiR16.ReconGatePatterns-5` (scout). Read-only slice. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`;
all paths below are relative to it. Sources opened this session (2026-10-20): `scripts/check-user-round-contract.mjs`
(1328 lines), `scripts/check-aria-metadata.mjs` (3460 lines), plus comparator reads of `scripts/check-freshness.mjs`
and `scripts/check-round-contract.mjs`. Line anchors were resolved with `grep -n` plus range reads, not from memory.

Extracted for `TabiR16.BindCore-5` (`scripts/check-measurement-binding.mjs`) and `TabiR16.BindSelftest-5`
(`scripts/selftest-measurement-binding.mjs`). Nothing here is a certification; it is precedent plus the gaps the
precedent leaves. Every claim is anchored; inference is marked `[INFERENCE]`.

## 1. Minimal env construction

**Observed precedent (the only one in `scripts/`).** `scripts/check-aria-metadata.mjs:2254-2262` replaces the child
environment wholesale rather than spreading it:

```js
function spawnChecker(scriptPath, args, cwd) {
  const child = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd, encoding: 'utf8', timeout: 30000, maxBuffer: 16 * 1024 * 1024,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, TZ: 'UTC' },
  });
```

**Observed gap.** `grep -rn "GIT_CONFIG_NOSYSTEM|GIT_CONFIG_GLOBAL|GIT_OPTIONAL_LOCKS|GIT_NO_REPLACE_OBJECTS" scripts/`
returns **zero** hits. No gate in `scripts/` sets any of them. The two `git()` helpers inherit the full host env
(`check-user-round-contract.mjs:116-118`, `check-round-contract.mjs:58-61`), which is exactly the debt round 15
recorded: `.ufo/waves/round-15/w1/PriorDebt.md:80-83` (quote: "one `gitEnv()` helper (scrubbed: `GIT_NO_REPLACE_OBJECTS=1`,
`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, unset `GIT_DIR`, …)"), and
`.ufo/waves/round-15/w2/AttackInputSafety.md:130,142` (the `env -i PATH=… TZ=UTC GIT_CONFIG_NOSYSTEM=1 …` shape).

**Only fixed-date precedent.** `scripts/check-freshness.mjs:126-131`:

```js
env: { ...process.env, GIT_AUTHOR_DATE: `${epoch} +0000`, GIT_COMMITTER_DATE: `${epoch} +0000` },
```

This spreads `process.env`, so it is *not* the C1 shape; it only shows the two date variables.

**Recommended shape for BindCore** `[INFERENCE, derived from PLAN.md:37-38 + PriorDebt:83]` — build from scratch so
inherited `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`/`GIT_CONFIG_COUNT` cannot leak in:

```js
const BASE_ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TZ: 'UTC' };
const GIT_ENV = {
  ...BASE_ENV,
  GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_NO_REPLACE_OBJECTS: '1',
};
```

Use it for every `spawnSync('git', …)` **and** for the `--reproduce` child, otherwise the reproduction runs with a
different environment than the measurement it is reproducing.

## 2. runGit helper

`scripts/check-user-round-contract.mjs:116-142` — one throwing wrapper plus three non-throwing readers:

```js
function git(root, args, binary = false) {
  return spawnSync('git', args, { cwd: root, encoding: binary ? undefined : 'utf8' });
}
function gitOk(root, args, binary = false) {
  const result = git(root, args, binary);
  if (result.error || result.status !== 0) fail('could_not_evaluate', `git ${args[0]} failed`, 2);
  return binary ? result.stdout : result.stdout.trimEnd();
}
function blob(root, rev, path) {
  const result = git(root, ['rev-parse', '--verify', `${rev}:${path}`]);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}
function show(root, rev, path) { /* git show rev:path, null on non-zero */ }
function list(root, rev, prefix) { /* git ls-tree -r --name-only, [] on non-zero */ }
```

Properties worth copying: `binary = true` returns the raw `Buffer` (needed for sha256 of a counted-input blob);
`gitOk` trims only the trailing newline; `gitOk` failure is exit 2 with a `git <verb> failed` detail, never a bare
throw. `check-round-contract.mjs:58-61` adds `maxBuffer: 16 * 1024 * 1024` to the same shape — adopt that too,
because `--reproduce` child stdout is bounded but `show` of a large blob is not.

Path safety precedent: `check-user-round-contract.mjs:165-173` rejects `..`, absolute paths and `*?[` before any
pathspec query, then uses `--literal-pathspecs`. C1's `countedInputs` are caller-declared strings, so BindCore needs
the same guard before `git diff --name-only measuredRevision REV -- <inputs>`; `[INFERENCE]` an unguarded
`-- <input>` can glob a `.` path into the whole tree.

`check-aria-metadata.mjs` has **no** git helper at all (it never shells git); its counterpart is `spawnChecker`
(§4). That is why the C1 gate has no in-repo template for `--repo` defaulting: `grep -rn "show-toplevel" scripts/`
returns nothing. `[INFERENCE]` BindCore must add `spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })`
in `process.cwd()` and map a non-zero status to `could_not_evaluate`/`git_failed` (exit 2), not to a default.

## 3. `could_not_evaluate` / exit 2 handling

Two distinct models in-repo. They are composable, not alternatives.

**Model A — thrown refusal, single top-level catch** (`scripts/check-user-round-contract.mjs:101-106` and
`:1316-1327`). The refusal object carries `finding`, `exit`, `reason`; one catch publishes it:

```js
function fail(finding, detail, exit = 1, reason = null) {
  if (reason !== null && !COUNT_REASONS.has(reason)) {          // closed vocabulary, :92-99
    throw Object.assign(new Error(`Unknown refusal reason: ${reason}`),
      { finding: 'could_not_evaluate', exit: 2 });
  }
  throw Object.assign(new Error(detail), { finding, exit, reason });
}
…
} catch (error) {
  const exit = error.exit ?? 2;
  const reason = error.reason ? ` reason=${error.reason}` : '';
  console.error(`USER_ROUND_CONTRACT verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'}${reason} detail=${error.message}`);
  process.exitCode = exit;
}
```

Copy these four properties: (i) unknown reason id is a *construction-time* failure downgraded to exit 2, so a typo
cannot silently become a passing finding; (ii) exit 2 still publishes a `finding=` token (`could_not_evaluate`)
instead of a bare stack; (iii) failures go to **stderr**, clean records to **stdout** — the selftest parser relies on
that split (`receiptOf`, `:759-778`, reads the failure line from stderr and the clean line from stdout);
(iv) `process.exitCode = exit`, never `process.exit()`.

**Model B — classified result printed on stdout** (`scripts/check-aria-metadata.mjs:3411-3421`):

```js
if (result.exit === EXIT.couldNotEvaluate) {
  const reason = result.classification?.reason ?? 'could_not_evaluate';
  console.log(`ARIA_METADATA check verdict=could-not-evaluate classification=could_not_evaluate ` +
    `reason=${reason} finding=${reason} exit=${result.exit} …`);
  console.log(`ARIA_METADATA_JSON ${JSON.stringify(payload)}`);
  return result.exit;
}
```

Here the reason is duplicated into `finding=` so one parser field works for evaluated and unevaluable runs. Fatal
errors use the same vocabulary (`:3436-3460`): `ARIA_METADATA fatal verdict=could-not-evaluate … reason=fatal exit=2
error=…`, plus a `_JSON` payload with `exit: 2`. Exit codes are a frozen table: `EXIT = { clean: 0, semantic: 1,
couldNotEvaluate: 2 }` (`:93`).

**Contract conflict BindCore/BindSelftest must settle once.** `PLAN.md:59` specifies
`verdict=clean|failed|could_not_evaluate` (underscore), while **both** precedents publish `verdict=could-not-evaluate`
(hyphen; `check-user-round-contract.mjs:1326`, `check-aria-metadata.mjs:3415,3443`) and reserve underscores for
`finding=`/`reason=` values only. Recommendation: follow PLAN literally for `MEASUREMENT_BINDING` (it parses its own
receipt and the counter reads committed receipts), keep `finding=`/`reason=` snake_case, and have the selftest assert
the same literal so a hyphenated variant fails. `[INFERENCE]` L1 should record the choice in the note because the
round-15 legacy adapter output will otherwise look inconsistent with the new gate.

## 4. Selftest child-CLI driver

**Driver A — same script as child, isolated fixture per case** (`scripts/check-user-round-contract.mjs:1208-1247`):

```js
for (const test of cases) {
  const root = mkdtempSync(join('/var/tmp', 'tabi-user-round-contract-'));
  try {
    const { baseline, pin } = writeGoodFixture(root);
    test.mutate(root);
    if (test.name !== 'clean') { gitOk(root, ['add', '--', '.']); commit(root, 'mutation'); }
    if (test.after) { test.after(root); gitOk(root, ['add', '--', '.']); commit(root, 'mutation-2'); }
    const result = spawnSync(process.execPath, [script, '--repo', root, …], { encoding: 'utf8' });
    const observed = receiptOf(result);
    const match = receiptMatches(test, observed) && !leaked;
    console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${observed.exit} expected_finding=${test.finding}${reasonField} reason=${observed.reason ?? 'none'} … result=${match ? 'PASS' : 'FAIL'}`);
    if (!match) fail('selftest_failure', `${observed.stdout}${observed.stderr}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
```

`receiptOf` (`:759-778`) parses **one anchored line**, never a substring of combined output. Its comment at `:753-758`
states why: the progress line echoes lesson prose that a fixture could make look like a finding. `receiptMatches`
(`:781-786`) asserts exit + finding + optional reason + optional detail independently.

**Driver B — separate selftest file spawning the gate** (`scripts/check-aria-metadata.mjs:2254-2274, 2758-2788`):
`spawnChecker(SCRIPT, args, ROOT)` with `cwd` set to the fixture root, then per-case `problems[]` collection and
`evaluateOutput`. Fixture tokens are mapped to generated absolute paths by `pathFor` (`:2554-2563`); unknown token is a
hard throw, so a case cannot silently run on a missing fixture.

**Weak driver to not copy.** `scripts/check-freshness.mjs:191-197` matches `output.includes('finding=x')` on
`stdout+stderr`. That accepts prose containment; `check-user-round-contract.mjs` replaced it with the anchored
`receiptOf`. BindSelftest should use the anchored form.

**Assertion discipline to copy:**
- exact exit **and** exact reason, not finding-only (`:1242-1243` comment at `:1238-1241`).
- one *negative control on the reason itself* (`:1249-1266`): a decoy copying the observed exit/finding/detail with a
  wrong reason must **not** match, the reasonless form must match, and the real reason must match.
- side-effect proof for injection cases: `appliesMarker` + `noMarker` path, checked with `existsSync` after the child
  run (`:1227-1231`, constants at `:841-843`, witness use at `:897-901`). For C1's `{REV}` injection case (`;`/`$()`)
  this is the exact technique: declare a marker path the payload would create, assert absent after the child exits.
- print `marker_applicable=0 marker_outcome=not-applicable` for cases where the marker cannot exist, so "not
  applicable" is never read as "absent" (`:1224-1237` comment).

For BindSelftest specifically: `PLAN.md:67-70` puts the driver in `scripts/selftest-measurement-binding.mjs` spawned
by `--self-test`, and that child drives the gate as a **grandchild**. Resolve both paths from `import.meta.url`
(pattern: `check-user-round-contract.mjs:10-11`, `const script = fileURLToPath(import.meta.url); const defaultRoot =
resolve(dirname(script), '..');`), never from `process.cwd()`, because every case changes cwd to a temp repo.

## 5. Output line grammar

Shape: `TAG key=value key=value …` on one line, unquoted single-token values; free text only in a final `detail=`
(which swallows everything to end of line). Multiline values are JSON-encoded inline instead
(`check-user-round-contract.mjs:827-829` uses `JSON.stringify(...)` for stdout/stderr capture fields).

Observed canonical lines:

| Kind | Line | Anchor |
|---|---|---|
| clean verdict | `USER_ROUND_CONTRACT verdict=clean rounds=N consequential=0` | `check-user-round-contract.mjs:627` |
| failure verdict | `USER_ROUND_CONTRACT verdict=<failed\|could-not-evaluate> finding=<id> [reason=<id>] detail=<text>` | `:1326`; parser regex `:764` |
| per-case selftest | `SELFTEST name=… expected_exit=… actual_exit=… expected_finding=… [expected_reason=…] reason=… … result=PASS\|FAIL` | `:1242` |
| selftest summary | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=N fixtures=M …` | `:1313` |
| aria check verdict | `ARIA_METADATA check verdict=clean\|red findings=N failed=M accepted=<bool> sidecar=…` | `check-aria-metadata.mjs:3424-3429` |
| aria unevaluable | `ARIA_METADATA check verdict=could-not-evaluate classification=could_not_evaluate reason=… finding=… exit=2` | `:3414-3418` |
| aria selftest summary | `ARIA_METADATA_SELFTEST verdict=clean\|blocked cli_cases=N helpers=M` | `:2983-2986` |
| aria per-case | `ARIA_METADATA_SELFTEST result=PASS\|FAIL case=<id> … expected_exit=… actual_exit=… problems=a\|b` | `:2994-3002` |
| machine payload | `ARIA_METADATA_JSON {json}` — one line, last | `:2985-3006`, `:3420`, `:3452`; parsed `:2263-2271` |

Ordering divergence to respect: aria prints the summary **first** and the JSON payload **last** (`:2984` before
`:3006`). `PLAN.md:70-71` requires the C1 summary to be the **last stdout line**. So if BindSelftest emits any JSON,
it must go before the summary — the inverse of aria. Simplest compliant option: emit no JSON in `--self-test`; PLAN
only constrains the summary line and per-case assertions. `[INFERENCE]`

Token conventions: `verdict=` values are hyphenated kebab (`could-not-evaluate`) except the C1 literal from PLAN;
`finding=`/`reason=` are `[a-z_]` snake_case (parser regexes hard-code this: `:764` `[a-z_]+`); booleans are `0|1`
(`no_marker=0|1`) or `yes|no` (`committed=yes|no`), never `true|false` in user-contract; aria uses `true|false`.
PLAN's `MEASUREMENT_BINDING` summary carries only integers (`claims=N bound=M`) and `cases=/reasons=` in the
selftest, so no boolean style is forced.

## 6. Temp-repo fixture building

`scripts/check-user-round-contract.mjs:636-723` (shape), `:630-635` (commit helper):

```js
function commit(root, subject) {
  const result = spawnSync('git', ['-c', 'user.name=tabi-selftest', '-c', 'user.email=tabi-selftest@local',
    'commit', '-qm', subject], { cwd: root });
  if (result.status !== 0) fail('could_not_evaluate', 'Fixture commit failed', 2);
  return gitOk(root, ['rev-parse', 'HEAD']);
}
…
const put = (path, value) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), value);
};
gitOk(root, ['init', '-q']);
put('LOG.md', 'baseline-log\n'); … 
gitOk(root, ['add', '--', '.']);
const baseline = commit(root, 'baseline');
```

Gaps this fixture leaves that C1 must close (`PLAN.md:69`: mkdtemp, minimal env, fixed author/committer dates):
- no `-c commit.gpgsign=false` (round-15 asks for it: `.ufo/waves/round-15/w1/ToolsSafety.md:44`);
- no env at all on the commit/init spawns — inherited config decides `commit.gpgsign`, `grep.patternType`, hooks;
- dates come from the wall clock, so commits are non-reproducible; add `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE`
  (freshness precedent above) plus `GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_NAME`/`GIT_COMMITTER_EMAIL`
  instead of `-c user.name=…` so `-c` cannot be shadowed `[INFERENCE]`.
- `git init -q` branch name depends on `init.defaultBranch`; harmless because fixtures are addressed by 40-hex rev,
  but with `GIT_CONFIG_GLOBAL=/dev/null` git prints the default-branch hint on stderr — do not parse stderr.

Fixture root choice: `mkdtempSync(join('/var/tmp', '<tag>-'))` in both user/round gates
(`check-user-round-contract.mjs:1209`, `check-round-contract.mjs:878`), `mkdtempSync(join(tmpdir(), '<tag>-'))` in
aria/freshness (`check-aria-metadata.mjs:2357`, `check-freshness.mjs:118`). PLAN only says `mkdtemp`; either is
compliant. Temp roots are always removed in `finally` in every precedent (`:1244-1246`, aria `:3013`, freshness
`:200-202`).

Byte-stable JSON fixtures: `check-aria-metadata.mjs:2171-2176` writes via `stableStringify` (sorted keys, 2-space
indent, trailing LF, `:214-230`) and returns `{ name, bytes, sha256 }`. Use the same if BindCore commits receipts
whose bytes are digested anywhere.

## 7. Pointers for the two owners

- **BindCore-5** — adopt: env-from-scratch (§1), `git()` + `gitOk` + non-throwing `blob/show/list` (§2), thrown
  `fail(finding, detail, exit, reason)` with a closed reason set and one catch publishing `finding=could_not_evaluate`
  at exit 2 (§3), grammar `TAG verdict=… key=… detail=…` with `process.exitCode` (§5). Supply what precedent lacks:
  `--repo` default via `rev-parse --show-toplevel` (exit 2 on failure), pathspec guard on `countedInputs`, and the
  `--json` mode — **no in-repo `--json` precedent exists** (grep over `scripts/*.mjs` returns none; aria always emits
  a human line plus a `_JSON` line). Decide explicitly whether `--json` suppresses the human verdict line.
- **BindSelftest-5** — adopt: per-case `mkdtemp` + fixture build + mutate + `add`/commit, child `spawnSync` with
  `process.execPath`, anchored receipt parsing, exact exit+reason matching, a wrong-reason decoy control, and a
  `no_marker`/`marker_applicable` side-effect proof for the `{REV}` injection case (§4). Summary line must be last
  (§5). The selftest must pass `--repo <temp>` and a minimal `--at`/manifest arrangement so no case reads the lane
  repo's own history.

## 8. Remaining unknowns / decisions for L1

1. `verdict=...could_not_evaluate` underscore (PLAN) vs `could-not-evaluate` (both precedents). BindCore and
   BindSelftest must use one literal; recommendation: PLAN's underscore.
2. `--json` semantics (suppress human lines or append after them) — no precedent; PLAN implies a single object.
3. Whether the selftest prints a JSON payload at all; PLAN constrains only the last summary line.
4. `--repo` default resolution has no precedent in `scripts/`; error mapping for a non-repo cwd is unstated.
5. Node version for `spawnSync` `maxBuffer` behaviour is host-dependent; both precedents pin 16 MiB, which PLAN does
   not mention — harmless to include.

## 9. Tooling record

No installs or upgrades were performed for this slice (read-only recon; system `grep`/`sed` via the shell tool only).
No browser, gate, selftest or counter was run.
