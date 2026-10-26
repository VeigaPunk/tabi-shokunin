# MeasureC1Clean — C1 kill attribution and stability, measured clean

Seat `MeasureC1Clean` (w2, attack/measure). Target: C1 operability predicate of
`.ufo/waves/round-30/claims.json` at `072af95fe2822f0785a6ff88a578e2142dd258e5`.
Clone: `/fast/scratch/hyaku/tabi-r30/MeasureC1Clean/clone` (`git clone --shared`, detached at the
named rev, `git status --porcelain` empty). Output dir:
`.ufo/waves/round-30/w2/MeasureC1Clean/`. Measured with node v24.21.0; no tool installed or upgraded.

## Verdict

**Holds** — with one low-severity attribution defect. In a clean shared clone at
`072af95f…` the counter and catalogue hash byte-identical to `frozenDigests`
(`02945f88…3a55`, `cd1c27a2…3833`), the counter exits 0 and reports
`fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0, clean true`,
with both pristine self-tests clean (s106 10/10, release-pins 29/29, both exit 0). The claim's literal
counting command (no `--work`) reproduces the same output. Four full runs (two `--work` dirs, one default
`mkdtemp` under `TMPDIR`, one launched from `/tmp` with explicit `--repo`) are **byte-identical**
(sha256 `0392fc1005dc52bd95e9d1e934cdaeba1a224357c41723b87ac2a5fcda4122e2`), so the reading is stable
and path-independent. Because wave 1 showed the counter hands the mutant its own identity
(`<work>/mutant-<i>` as `cwd`, full parent env — `.ufo/waves/round-30/w1/CritC1Counter.md` §2), I did not
take 27/27 on trust: every kill was attributed to a named case, and every fault mutant was re-run outside
the counter, in a neutral directory with a neutral file name (`gate.mjs`) and a stripped environment
`{PATH, TMPDIR, TMP, TEMP}`. All 27 reproduced with identical exit codes and identical failing-case sets
(`neutral-sweep.txt`), so no kill in the frozen kill set is an artifact of the leak channel. All 13 benign
mutants re-run the same way stay clean (10/10 and 29/29), i.e. no false kill. **Defect (low):**
`pins-f3-bytes-absent` is killed by a *crash*, not by a failing case — its `failing_cases` is empty and
its mutant run emits no JSON (exit 1, `TypeError … Received null` at `check-release-pins.mjs:215`), so a
reading rule of the form "a fault counts as killed only if `failing_cases` names a case" would not credit
it; the underlying fixture (`f3-old-bytes-never-committed-unresolved`, which deletes `_old`) does reach
that guard, so the kill is genuine but unattributed. Everything else in C1's predicate is measured, not
inferred.

## Evidence

### 1. Frozen bytes at the measured rev

```
$ git clone --shared /home/vgpnk/.../tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 072af95f…   # exit 0
rev: 072af95fe2822f0785a6ff88a578e2142dd258e5
porcelain:[]                                                                    # clean checkout

$ sha256sum "$S/clone/scripts/check-gate-mutants.mjs" "$S/clone/scripts/gate-mutants.json"   # exit 0
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
```
Both equal `claims.json:frozenDigests`. The same two files in the lane worktree hash identically
(`sha256sum` in `/home/vgpnk/Projects/shokunin/tabi-shokunin`, exit 0), so the KAT is not sensitive to the
lane having advanced: lane `HEAD` is `af0664ed039af98a5d8c460cf99c71d726dd41af` (the wave-1 evidence
commit, 776 files of reports) while the assigned tip is `072af95f…`; I measured only the assigned rev. The
counter also self-reports `counter_sha256_at_rev` and `counter_sha256_running`, both
`02945f88…3a55` — the bytes it read from the rev are the bytes it ran.

### 2. Run 1 — the assigned command

```
$ cd "$S/clone" && TMPDIR="$S/tmp" node scripts/check-gate-mutants.mjs \
    --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --work "$S/work" --json > run1.json   # exit 0, real 19.4s
```
Kept verbatim at `.ufo/waves/round-30/w2/MeasureC1Clean/check-gate-mutants-072af95-run1.json`
(sha256 `0392fc10…22e2`).

| field | value |
|---|---|
| `rev` | `072af95fe2822f0785a6ff88a578e2142dd258e5` |
| `catalogue_sha256` | `cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833` (= frozen) |
| `counter_sha256_at_rev` / `_running` | `02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55` (= frozen, both) |
| `fault_total` | **27** |
| `fault_killed` | **27** |
| `fault_survivors` | **0** (`survivors: []`) |
| `benign_total` | **13** |
| `benign_killed` | **0** (`benign_killed_ids: []`) |
| `clean` | `true` |

Pristine gate tallies (`gates[]`, both `pristine_clean: true`, neither timed out):

| gate | sha256 at rev | cases | passed | exit |
|---|---|---|---|---|
| `scripts/check-s106-evidence.mjs` | `85dfd5e0cb9d5a99f311a8f94728df31e9308a2fd7e63853ed11a4f3b5e95467` | 10 | 10 | 0 |
| `scripts/check-release-pins.mjs` | `915a6bba21223a4871c7f4ebbf27c5b4295137910c9ddec11bd5c31e2f55a648` | 29 | 29 | 0 |

Against the claim: target `fault_survivors 0 / benign_killed 0` (before 14) → **met**;
`fault_total 27 / benign_total 13` → **met**; exit 0 → **met**; bytes = `frozenDigests` → **met**.

### 3. Per-fault kill attribution (`failing_cases`, from the counter's own JSON)

`exit` is the mutant gate's self-test exit; `cases/passed` its test counts. Every case id resolves to a
real case in that gate's `CASES` table (checked programmatically: 0 unresolved ids across 39 cases).

| fault id | exit | cases/passed | killing case(s) |
|---|---|---|---|
| `s106-sha-drop` | 3 | 10/9 | `same-length-tamper-invalid` |
| `s106-sha-true` | 3 | 10/8 | `sha-mismatch-invalid`, `same-length-tamper-invalid` |
| `s106-anchor-unique-drop` | 3 | 10/9 | `duplicate-anchor-invalid` |
| `s106-anchor-unique-true` | 3 | 10/9 | `duplicate-anchor-invalid` |
| `s106-byte-count-drop` | 3 | 10/9 | `receipt-byte-count-mismatch-invalid` |
| `s106-byte-count-true` | 3 | 10/9 | `receipt-byte-count-mismatch-invalid` |
| `s106-revision-drop` | 3 | 10/9 | `measured-revision-bytes-mismatch` |
| `s106-revision-true` | 3 | 10/9 | `measured-revision-bytes-mismatch` |
| `s106-anchor-located-true` | 3 | 10/9 | `anchor-off-by-one-invalid` |
| `pins-f1-old-tag` | 3 | 29/28 | `f1-old-tag-not-carried-by-row-unresolved` |
| `pins-f2-path-binding` | 3 | 29/28 | `path-not-bound-unresolved` |
| `pins-f2-path-traversal` | 3 | 29/28 | `f2-dotdot-inside-filename-unresolved` |
| `pins-f3-bytes-path` | 3 | 29/28 | `new-bytes-under-old-tag-unresolved` |
| `pins-f3-bytes-sha` | 3 | 29/28 | `sha-mismatch-unresolved` |
| `pins-f3-bytes-absent` | 1 | –/– (**no JSON printed**) | **none — crash-kill** (see §6) |
| `pins-f4-range-bounds` | 3 | 29/28 | `f4-range-past-last-old-line-unresolved` |
| `pins-f4-anchor-token` | 3 | 29/28 | `f4-anchor-lacks-range-token-unresolved` |
| `pins-f5-digest` | 3 | 29/28 | `digest-binding-mismatch-unresolved` |
| `pins-f6-refetch-seat` | 3 | 29/28 | `refetch-same-seat-unresolved` |
| `pins-f6-refetch-sha` | 3 | 29/28 | `copied-old-as-new-caught-by-refetch` |
| `pins-f6-refetch-all` | 3 | 29/26 | `refetch-missing-unresolved`, `refetch-same-seat-unresolved`, `copied-old-as-new-caught-by-refetch` |
| `pins-s1-supersession-prefix` | 3 | 29/28 | `drift-superseder-teaches-without-prefix-unresolved` |
| `pins-s1-supersession-tag` | 3 | 29/28 | `drift-superseder-not-at-stable-tag-unresolved` |
| `pins-notfound-status` | 3 | 29/28 | `absence-404-present-with-marker-unresolved` |
| `pins-notfound-body` | 3 | 29/28 | `absence-404-body-lacks-marker-unresolved` |
| `pins-population-on-release` | 3 | 29/27 | `not-on-release-not-counted`, `drift-superseder-not-at-stable-tag-unresolved` |
| `pins-population-tag-compare` | 3 | 29/25 | `pinned-at-stable-not-counted`, `empty-population-could-not-evaluate`, `drift-with-supersession-resolved`, `drift-superseder-teaches-without-prefix-unresolved` |

25 distinct cases are load-bearing; 14 are never a killing case (informational, not a defect):
s106 `clean-fixture-valid`, `measured-revision-bytes-match`, `missing-bytes-could-not-evaluate`,
`missing-receipt-could-not-evaluate`; pins `absent-receipt-all-unresolved`,
`valid-holds-with-shifted-lines`, `indented-row-counted`, `range-not-in-anchor-unresolved`,
`drift-without-supersession-unresolved`, `absence-404-holds`, `absence-404-now-present-drifts`,
`receipt-stable-mismatch-could-not-evaluate`, `bad-rev-could-not-evaluate`,
`f3-old-bytes-never-committed-unresolved`. The last one is the missing attribution of §6.

### 4. Reading the fixtures: the kills are behavioural, not identity-driven

I read the case bodies that the table names, in `scripts/check-s106-evidence.mjs` and
`scripts/check-release-pins.mjs`, to confirm each killing case builds a fixture in which the mutated term
is the term that decides the verdict:

- s106 fixtures (`:153-166`): `FIXTURE_TAMPERED_BYTES = FIXTURE_BYTES.replace("// tail","// tgil")` is
  declared as the same byte length, different sha — the fixture that can see the `shaMatch` term while
  `byteCountMatch` still agrees; `FIXTURE_BYTES_DUPLICATE_ANCHOR` puts the anchor line twice so
  `anchorLocated` holds while `anchorUnique` fails; `receipt-byte-count-mismatch-invalid` (`:267-278`)
  keeps the true sha and sets `decoded_bytes + 7`; `anchor-off-by-one-invalid` (`:221-232`) moves the
  anchor to line 188; `measured-revision-bytes-mismatch` (`:199-211`) commits different bytes at the
  measured rev. Each is exactly the fixture wave-1 §5 said was missing at baseline, and each is the sole
  or primary kill of the corresponding term.
- pins cases (`:359-433`) are named for the check they carry (`f1-old-tag`, `f2-dotdot`,
  `f3-old-bytes-never-committed`, `f4-range-past-last-old-line`, `f4-anchor-lacks-range-token`,
  `s1-drift-unsuperseded`, `absence-404-…`) and assert `exit` plus `unresolved` plus, for the per-check
  rows, a `reasons` list (`reasons: ["f3-bytes absent"]` etc.).
- Neither gate's self-test reads its own bytes or the environment as evidence: `grep -n
  'readFileSync|import.meta.url|process.cwd|process.env|ppid|execSync|spawnSync'` over both gates hits
  only `LANE` path resolution, `git` invocations for the synthetic fixture repos, and receipt JSON reads
  (`check-s106-evidence.mjs:37,38,48,60,296,326`; `check-release-pins.mjs:60,73,81,441`). The
  selftest harness runs the gate as a child on a fixture tree and compares its JSON
  (`check-s106-evidence.mjs:360-371`: exit, `valid`, plus the declared `field`/`fieldValue`).

### 5. Identity-leak independence (the wave-1 channel) and benign false kills

For every fault mutant I applied the catalogue's single `find→replace` to a fresh copy of the pristine
gate, wrote it as `<neutral-dir>/gate.mjs` (no `mutant-<i>`, no `pristine-N`), ran it with `cwd` = that
neutral dir and `env = {PATH, TMPDIR, TMP, TEMP}` only, and compared exit code and failing case ids with
the counter's report:

```
$ node … (sweep script, exit 0, 9.5 s)
s106-sha-drop -> exit=3 failed=same-length-tamper-invalid              MATCH
… (27 rows, full list in neutral-sweep.txt)
pins-population-tag-compare -> exit=3 failed=pinned-at-stable-not-counted,
    empty-population-could-not-evaluate, drift-with-supersession-resolved,
    drift-superseder-teaches-without-prefix-unresolved                 MATCH
mismatches=0
```
All 13 benign mutants re-run the same way: exit 0, 10/10 and 29/29, no failing case →
`benign_false_kills=0`. Conclusion: the frozen kill set is invariant under removal of the run-directory
identity and of the inherited environment, so the 27/27 reading is not produced by the leak channel wave 1
demonstrated; the leak remains a real hole in the *counter* (a gate could be written to exploit it) but it
did not inflate this round's measurement.

### 6. Defect: one kill has no case to name (low severity)

`pins-f3-bytes-absent` (`find: "if (ob === null || nb === null)"` → `"if (false)"`) is recorded by the
counter as `killed`, `exit: 1`, `cases: null`, `passed: null`, `failing_cases: []`. Reproduced directly:

```
$ node "$S/pins-f3-bytes-absent.mjs" --selftest --json > f3.out 2> f3.err   # exit 1
f3.out: 0 bytes                       (no JSON, so the counter parses report=null)
f3.err: TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string or an instance of
        Buffer, TypedArray, or DataView. Received null
    at Hash.update (node:internal/crypto/hash:154:11)
    at sha256 (…/check-release-pins.mjs:96:46)
    at evaluate (…/check-release-pins.mjs:215:11)
    at runSelftest (…/check-release-pins.mjs:483:15)
```
So the kill is a crash: with the absent-bytes guard removed, `evaluate()` hashes `null` while running the
fixture of `f3-old-bytes-never-committed-unresolved` (`check-release-pins.mjs:377-385` deletes `f._old`),
and the self-test dies before any case can record. Consequences, stated precisely:

- The predicate as frozen is still met (`killed` is `!clean`, and a crash is not clean) — no overclaim.
- The kill *is* behaviourally motivated: a dedicated fixture reaches the mutated guard, and the same crash
  occurs for any weakening of that guard that leaves `sha256(null)` reachable (I did not need to build
  such a decoy: the catalogue's single fault row is enough to show the fixture is on the path).
- But a reading rule of the form wave-1 §7.1 proposed — "a fault counts as killed only if
  `failing_cases` names a case" — would score this mutant *not verified*, even though C1's target is really
  met. The rule needs the parenthetical "…or the mutant run deviates from pristine with a fixture that
  reaches the site (crash/unparseable counts as deviation, reported as `cases: null`)".
- This is the only such mutant: 26 of 27 kills name at least one case, and every named id resolves.

### 7. Stability and path independence

| run | invocation | exit | JSON sha256 |
|---|---|---|---|
| 1 | `--rev … --work $S/work --json`, cwd = clone | 0 | `0392fc1005dc52bd95e9d1e934cdaeba1a224357c41723b87ac2a5fcda4122e2` |
| 2 | same command, `--work $S/work2` | 0 | `0392fc10…22e2` (`diff -u run1 run2` empty) |
| 3 | `--repo "$S/clone" … --work $S/work3 --json`, cwd = `/tmp` | 0 | `0392fc10…22e2` |
| claim-literal | `node scripts/check-gate-mutants.mjs --rev 072af95f… --json` (no `--work`; default `mkdtemp` under `TMPDIR`) | 0 | `0392fc10…22e2` |

Runtimes 19.4 s / 21.2 s / 25.3 s / 21.6 s; stderr 0 bytes on runs 2-4. All three `--work` directories
were left empty (the counter removes its `gate-mutants-*` subdirectory), and `git -C $S/clone status
--porcelain` stayed empty after every run — the counter does not mutate the checkout it measures. The
claim's literal counting command therefore reproduces the frozen numbers, which matters because the claim
text omits `--work`.

## Commands run (with exit codes)

```
git clone --shared … ; git -C "$S/clone" checkout -q 072af95f…                          exit 0
sha256sum clone/scripts/check-gate-mutants.mjs clone/scripts/gate-mutants.json           exit 0 (both = frozen)
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev 072af95f… --work $S/work --json exit 0 (19.4 s)
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev 072af95f… --work $S/work2 --json exit 0 (21.2 s)
diff -u run1.json run2.json                                                             exit 0 (identical)
cd /tmp; node <clone>/scripts/check-gate-mutants.mjs --repo "$S/clone" --rev 072af95f… --work $S/work3 --json
                                                                                        exit 0 (25.3 s, identical)
TMPDIR=$S/tmp node scripts/check-gate-mutants.mjs --rev 072af95f… --json                exit 0 (21.6 s, identical)
node -e '<case-id cross-check>'                                                         exit 0 (0 unresolved ids)
node -e '<neutral-dir fault sweep, 27 mutants>'                                         exit 0 (mismatches=0, 9.5 s)
node -e '<neutral-dir benign sweep, 13 mutants>'                                        exit 0 (false kills 0, 4.1 s)
node "$S/pins-f3-bytes-absent.mjs" --selftest --json                                    exit 1 (no stdout, TypeError on stderr)
sha256sum <lane>/scripts/check-gate-mutants.mjs <lane>/scripts/gate-mutants.json (read-only) exit 0 (= frozen)
git -C <lane> rev-parse HEAD ; git -C <lane> status --porcelain (read-only)              exit 0 (af0664e; only untracked w1/w2 evidence)
```

Artifacts in `.ufo/waves/round-30/w2/MeasureC1Clean/`:
`check-gate-mutants-072af95-run1.json`, `…-run2.json`, `…-run3.json`, `…-claim-literal.json`
(all four sha256 `0392fc10…22e2`), `neutral-sweep.txt` (27 fault rows + 13 benign rows with exit codes
and failing sets), `pins-f3-bytes-absent.stderr`.

## Scope, risks, non-claims

- Attacked: the C1 measurement itself — frozen bytes, tallies, kill attribution, identity-leak
  independence, determinism, path independence, and the claim's literal command form. I did not run the
  C2 counter, the no-harm counters, or any gate in the lane; no lane tracked file, git index, jj state or
  sibling repo was touched. Scratch tree removed after receipts were copied out.
- Network: none (no fetches this seat). Tools: none installed or upgraded.
- Residual risk for the parent: (a) the §6 crash-kill means one of 27 kills is credited without a named
  case, so any verdict that quotes "27/27 with per-case attribution" should say 26/27 attributed + 1
  crash-attributed; (b) the leak channel wave 1 found is still open in the counter (`mutant-<i>` cwd,
  full env inheritance) — it did not affect *this* kill set, but a future gate written to read
  `process.cwd()`/`process.env` would be killed while proving nothing, and the frozen kill rule still
  does not read `failing_cases`; (c) the lane has advanced to `af0664ed…` (wave-1 evidence commit) — the
  counter and catalogue bytes there are unchanged, but a re-measurement after further w2 landings must
  re-check `sha256sum`, not assume.
