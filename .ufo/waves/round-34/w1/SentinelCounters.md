# SentinelCounters — round 34 w1 (C2 milestone): security review of the two frozen counters, `measure.sh`, `baseline/controls.mjs`, and the gate self-test sandbox

Verdict: the two counters are *not* equivalent in trust. C1 holds: its only executed lane code is `scripts/check-adjacency.mjs`, hash-pinned to `4e2c…4aac` (verified equal at freeze 59f1b47, baseline 15dfaccb and HEAD), written into a fresh `mkdtemp`, and every sibling path it feeds to `git show` is refused by git when it tries to leave the tree. C2 does not hold: by design it executes the gate *from REV*, and it does so as the invoking user with `HOME=/home/vgpnk`, `PATH` and an unconfined filesystem — so its header claim "Write scope: the scratch dir only. Never writes the lane" (`c2-gate-mutants.mjs:36-37`) is false for a hostile REV, and there is a cheaper variant that needs no JavaScript at all: REV commits `scripts/check-bidi-runtime.mjs` as a symlink (mode 120000) and the counter's own `writeFileSync` follows it, overwriting any absolute path with the gate blob (reproduced end-to-end, §F1). Around that, `measure.sh` has two fail-open paths that can make a *missing* or *hostile* gate read green (§F4, §F5), the counters misclassify their own crashes as "predicate not met" (§F7), and a spawned-child process tree survives the run (§F3). None of these is a judgement on the claim; they are defects in the instruments, and F1/F2 must be closed or explicitly disclosed before any C2 number from a hostile-rev measurement is taken as evidence.

## Findings

### F1 — HIGH — C2 writes the gate through a symlink committed at REV (arbitrary absolute-path overwrite)

Evidence: `counters/c2-gate-mutants.mjs:193` `writeFileSync(join(clone, GATE), text)` (and the restore at `:227`), after `:213-216` `git clone --shared --no-checkout` + `git checkout --detach REV` materialises a `120000` blob as a real symlink.

Reproduction (my scratch clone, no lane write):

```
git -C clone ls-tree 4ce9b29717d7da79b04f3509d9f64e586340d9d0 scripts/check-bidi-runtime.mjs
120000 blob da1d721a1217aea06b057406f3ee3db077d04c99	scripts/check-bidi-runtime.mjs
victim.txt before: ORIGINAL-VICTIM-CONTENT
node …/c2-gate-mutants.mjs --rev 4ce9b297… --repo <my clone> --json   -> exit=1
victim.txt after : /fast/scratch/hyaku/tabi-r34/SentinelCounters/victim.txt      (0 trailing newline)
```

Exploit path: hostile REV commits one file whose *mode* is `120000` and whose blob text is a target path (`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency.tsv`, `…/SKILL.md`, `~/.bashrc`, `~/.local/share/…`, or `$OUT/c1-at-*.json`). Whoever measures that REV with `--repo <clone-of-REV>` — which is exactly what `measure.sh:27` does — truncates and overwrites the target with the gate blob. No JavaScript is executed; the symlink is followed on the pristine run, before the first `selftest` spawn. Impact: the instrument violates the round's own write boundary and can rewrite the map/screen/declaration the round is being scored against, or plant shell startup content.

Smallest remediation: before both writes, refuse or remove the link —

```js
const target = join(clone, GATE);
if (lstatSync(target).isSymbolicLink()) throw new Refusal(`gate path is a symlink at ${REV}`);
rmSync(target, { force: true });
writeFileSync(target, text);
```

plus an assertion that `realpathSync(dirname(target))` starts with `realpathSync(clone)`.

### F2 — HIGH — C2 runs REV code with the user's full rights (HOME, PATH, unconfined write scope)

Evidence: `counters/c2-gate-mutants.mjs:178` (`ENV` carries `HOME`, `PATH`, `TMPDIR`), `:194` (`spawnSync(process.execPath, [GATE, '--selftest'], { cwd: clone, env: ENV, timeout: TIMEOUT_MS })`). Probe gate committed at `e07e207` and measured by the frozen counter; the child wrote this outside both the clone and the counter's `mkdtemp`:

```json
{ "cwd": "…/tabi-r33-c2-YO2eJK/clone", "home": "/home/vgpnk", "path_len": 595,
  "tmp": "/fast/scratch/hyaku/tabi-r34/SentinelCounters", "ssh_dir_exists": true,
  "env_keys": ["GIT_CONFIG_GLOBAL","GIT_CONFIG_NOSYSTEM","GIT_NO_REPLACE_OBJECTS","HOME","LC_ALL","PATH","TMPDIR"],
  "argv": ["…/clone/scripts/check-bidi-runtime.mjs","--selftest"] }
```

Impact: the gate under test can read `$HOME` (the probe only checked existence of `~/.ssh`, no content was read or exfiltrated), rewrite the lane working tree, rewrite the stage receipts `$OUT/*.json` written earlier by `measure.sh:26-28`, and rewrite the frozen counter copies in `$S/k/*.mjs` (`measure.sh:17`). `[INFERENCE]` for the receipt/`$S/k` rewrite (not exercised); structural and proven for write scope and `HOME`. Stated positively: `ENV` *is* an allowlist, so ambient `GIT_DIR`/`GIT_ASKPASS`/credential material is dropped — the hole is the child, not the git helper.

Smallest remediation: point the child's `HOME` and `TMPDIR` at the counter's own `mkdtemp` dir (this also fixes F8), filter `PATH` to absolute entries as `check-adjacency.mjs:295 minimalEnv()` already does, and make `measure.sh` record a lane-tree hash (or `git -C "$LANE" status --porcelain` and `git -C "$LANE" rev-parse HEAD`) immediately before and after the C2 run, so a dirty lane is visible rather than assumed. True isolation needs a namespace or a read-only bind of the lane; that is out of a node script's reach and should be written down as an accepted residual if adopted.

### F3 — MEDIUM — orphaned child process trees survive every run

Evidence: `c2-gate-mutants.mjs:194` + `:230`. `spawnSync` with `timeout` signals only the direct child; nothing reaps descendants. Probe gate (commit `d88d7598…`) spawning `sleep 240` detached: after the counter exited (`counter_exit=1`), `pgrep -fc '^sleep 240$'` = **20** survivors; required an explicit `pkill`. A hostile REV can leave a daemon, a reverse shell, or a miner behind every measurement.

Smallest remediation: spawn each child with `detached: true` on POSIX and, in a `finally`, `process.kill(-child.pid, 'SIGKILL')`; the same for the battery run.

### F4 — MEDIUM — `measure.sh` records `exit=0` for counters that never ran

Evidence: `measure.sh:17` creates `$S/k/c1.mjs`, `c2.mjs`, `r33c1.mjs` by shell redirection *before* `git show` can fail; `set -u -o pipefail` without `-e` (`:4`); `:26-28` then run `node` on whatever file exists.

```
git show 0000…0:.ufo/…/c1-adjacency-sweep-v2.mjs > sim-c1.mjs   -> show_exit=128, sim_bytes=0
node sim-c1.mjs --rev … --json > sim-out.json                   -> exit=0, json_bytes=0
```

So a typo'd `FREEZE`, or a freeze commit that lacks a counter path, yields provenance lines `c1 exit=0`, `c2 exit=0`, `r33-c1 (no-harm…) exit=0` with three empty receipts. Only the `sha256 … (freeze)` line (`:22-23`) would show `e3b0c442…` (sha of empty), which no reader inspects mechanically. This is the round's fabricated-green shape and is one typo away.

Smallest remediation: `git -C "$LANE" show "$FREEZE:$C1" > "$S/k/c1.mjs" || { echo "freeze blob missing: $C1" >> "$P"; exit 9; }` for each of the three, and `[ -s "$OUT/c1-at-$short.json" ]` before appending the exit line.

### F5 — MEDIUM — `measure.sh` auto-executes any new `scripts/check-*.mjs` at REV, unpinned, no timeout

Evidence: `measure.sh:44-46` globs `scripts/check-*.mjs scripts/round-evidence-audit.mjs` in the checkout of REV, greps for `--self?test`, and runs `node "$g" "$f"`; the receipt line is the script's own last matching output. Reproduced inside my clone with an added `scripts/check-zzz-r34-probe.mjs`:

```
scripts/check-bidi-runtime.mjs --selftest :: exit=0 :: BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44
scripts/check-zzz-r34-probe.mjs --selftest :: exit=0 :: ZZZ_REAL_GATE_SELFTEST verdict=clean cases=99 passed=99
```

Impact: the no-harm receipt is attacker-writable by adding one file to REV (nothing in it needs to be a real gate), and the same file can hang the measurement forever (no `timeout` on `:46`, unlike the C2 counter's own 180 s/900 s).

Smallest remediation: run the fixed gate list from `:32-41` plus an explicit `--selftest` list, each under `timeout 900`, and record the sha256 of each script actually run.

### F6 — MEDIUM — the disclosed residual is live: a whitespace-normalised find-sniff passes every probe and kills all 20

The counter discloses it (`c2-gate-mutants.mjs:32-35`). The control receipts show the twin probe is the *only* guard: `baseline/controls-summary.json` has `c2-J2-selfhash` and `c2-J3-find-sniff` both at `killed=20, survivors=[], unappliable=[]` and refused only by `twinsFailing` = all 20. The twin is "double the first space inside `find`" (`:220`), i.e. a whitespace-only edit *at the mutant site*; a self-test that whitespace-normalises its own source before looking for `find` sees the twin as present, so all twins pass, neutral/decoy pass, and every mutant fails the sniff → `predicate: met` on a self-test that exercises no rule.

Smallest remediation (one option per mutant, no find text reworded): add a *synonym* twin — a behaviour-preserving reword at the site that changes the find text's words (`(idCounts.get(id) || 0) > 1` → `… >= 2`, `> 2` → `>= 3`) — and require it to pass; a sniff keyed on a normalised find text cannot survive that.

### F7 — LOW — a crash is reported as "predicate not met", not "could not evaluate"

Evidence: `c1-adjacency-sweep-v2.mjs:317-318` and `c2-gate-mutants.mjs:253-254` rethrow anything that is not a `Refusal`, so node exits 1; exit 2 is documented as could-not-evaluate (`c1:14`, `c2:11`). Reproduced with `TMPDIR=/nonexistent-r34`:

```
c1_exit=1   (c1-crash-exit.stderr: node:fs:3134 … binding.mkdtemp)
c2_exit=1   (c2-crash.stderr:   same)
```

`measure.sh` records only the number, so a crashed measurement reads as an evaluated not-met — the opposite direction from F4 but the same class of misreport.

Smallest remediation: `catch (e) { console.error(\`… verdict=could-not-evaluate detail=${e && e.message}\`); process.exit(2); }` at the end of both `main()`s.

### F8 — LOW — the gate's fixtures leak on kill and sit outside the counter's own scratch

Evidence: `scripts/check-bidi-runtime.mjs:1020` `mkdtempSync(join(tmpdir(), 'tabi-bidi-runtime-'))`, cleaned only by `finally` (`:1112`, `:1125`). `tmpdir()` is `TMPDIR`, i.e. the *parent* the caller set, while the C2 counter's own dir is `mkdtempSync(join(TMP,'tabi-r34-c2-'))` (`c2:210`), so the fixtures are siblings that `c2:243 rmSync(dir)` cannot reach. Reproduced 3/3 (baseline gate, kill mid-run):

```
run1 during=1 leftovers_after_SIGKILL=1 dir=tabi-bidi-runtime-fCCoY2
run2 during=1 leftovers_after_SIGKILL=1 dir=tabi-bidi-runtime-UGAUlQ
run3 during=1 leftovers_after_SIGKILL=1 dir=tabi-bidi-runtime-BlQugk
```

`measure.sh`'s `TMPDIR="$S/tmp"` + `trap … EXIT` (`:9-10`) does reclaim them on normal exit *and* on SIGTERM (verified: bash ran the EXIT trap, rc=143), but not on SIGKILL. The same class applies to C1's gate scratch under the ambient `TMPDIR` (`c1:184-193`).

Smallest remediation: give the child a `TMPDIR` inside the counter's `mkdtemp` (F2), and sweep `$TMP/tabi-bidi-runtime-*` / `$TMP/tabi-r34-c1-*` at counter start.

### F9 — LOW — environment-isolation gaps (none currently reachable from REV content alone)

- `baseline/controls.mjs:25` spreads `process.env` instead of an allowlist (only `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_NOSYSTEM` forced), so ambient `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_TEMPLATE_DIR` reach every fixture git call. The clone invariant holds only because of `:55` `rev-parse --show-toplevel`.
- Both counters hand `HOME` to children (`c1:98`, `c2:178`) although every git call is config-isolated — an unnecessary secret surface (F2).
- C1's `ENV` omits `GIT_TERMINAL_PROMPT=0` and `GIT_NO_LAZY_FETCH=1`, which `check-adjacency.mjs:295 minimalEnv()` sets. Checked all 21 fleet repos: none is a partial clone (`remote.origin.promisor`, `partialclonefilter`, `extensions.partialClone` all unset), none has `objects/info/alternates` — so `git show` cannot fetch today; adding a promisor sibling would open a network path with repo-local credential helpers.
- `check-bidi-runtime.mjs:1022` spawns fixture git with *no* `env` object, so a human running `--selftest` directly inherits the global config: `core.hooksPath` or `GIT_TEMPLATE_DIR` hooks run on every fixture commit (`makeFixture`'s `commit` does not pass `--no-verify`). C2 masks this because it passes its own `ENV` (child `env_keys` include `GIT_CONFIG_GLOBAL`). The live path (`:605`) also passes `{...process.env}` to chromedriver; no browser runs this wave.

### F10 — INFO — timeout budget, arg validation

C2: 180 s per selftest (`:51`, `:194`), 900 s battery (`:230`), no aggregate cap — up to 43 runs × 180 s ≈ 2 h 9 m worst case; a stalling REV can hold the measurement while never producing a false pass (fail-closed). C1 has no timeout on git or on the pinned gate (frozen bytes, so bounded by frozen behaviour). `measure.sh` and `controls.mjs` have no timeouts at all. `measure.sh:5` never validates `$REV`/`$FREEZE` as 40-hex, so an operator-supplied `-`-prefixed value reaches `git show`/`git checkout` as an option-shaped argv (argv, never a shell) — operator input only.

## Holds (attacked, did not break)

1. **C1 gate pinning.** `ADJ_GATE_SHA256=4e2c2a64…324aac` equals the sha256 of `scripts/check-adjacency.mjs` at 59f1b47 (freeze), 15dfaccb (baseline) and HEAD; the blob is written into a fresh `mkdtemp` and only then executed (`c1:180-193`) — C1 executes no REV-controlled code.
2. **C2 battery pinning.** Bytes read from `BATTERY_COMMIT` and compared to `BATTERY_SHA256` before execution (`c2:44-45`, `:207-208`).
3. **Path traversal.** `git show <rev>:<path>` with `../../../../etc/passwd`, `/etc/passwd`, `scripts/../../../../../../etc/passwd`, `corpus/../SKILL.md` all exited 128 (`fatal: … is outside repository` / `… exists on disk, but not in <rev>`), so `c1:111 blob()` and `c1:196 citedLineText()` fail closed with exit 2. The path is a single argv element, so `--help` was treated as a path, not an option.
4. **No shell interpolation of map/leads content.** All children use argv arrays; the only regex built from map data strips everything outside `[a-z0-9-]` (`c1:222`).
5. **Counter ENV allowlists** drop ambient `GIT_*`, credential helpers and `GIT_ASKPASS` (`c1:98`, `c2:178`); `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_NO_REPLACE_OBJECTS=1`.
6. **Selftest sandbox: no browser, cleans on success.** 44 cases, exit 0, `TMPDIR` empty afterwards, `pgrep -a chromedriver` = 0 — the selftest injects `liveRunner` (`check-bidi-runtime.mjs:1090-1100`) and never reaches `liveRecord`.
7. **Control set is fail-closed on the cheap cheats.** `c1-J3` junk rows are refused by the adjacency gate itself (`adjacency: failed`); `c2-J2`/`c2-J3` reach `killed=20` but are refused by `twinsFailing=20`; `c2-J4` reject-all is refused by `battery: false`.
8. **`measure.sh` scratch discipline** (`:8-10`) is under `$HYAKU_SCRATCH`, the toplevel assertion at `:12` runs before any counter, and the `EXIT` trap also fires on SIGTERM (verified, rc=143).

## Commands and exit codes (full log: `w1/SentinelCounters/evidence.txt`)

```
git -C clone show <rev>:scripts/check-adjacency.mjs | sha256sum          # 4e2c…4aac at 59f1b47/15dfaccb/HEAD (3/3)
git -C clone ls-tree 4ce9b297… scripts/check-bidi-runtime.mjs            # 120000 blob …            exit 0
node c2-gate-mutants.mjs --rev 4ce9b297… --repo <scratch clone> --json   # exit 1; victim overwritten
node c2-gate-mutants.mjs --rev e07e207…  --repo <scratch clone> --json   # exit 1; escape-proof.json written
node c2-gate-mutants.mjs --rev d88d7598… --repo <scratch clone> --json   # exit 1; 20 orphan sleeps, then pkill
node c1-adjacency-sweep-v2.mjs --rev 15dfaccb… TMPDIR=/nonexistent-r34   # exit 1 (crash, not the documented 2)
node c2-gate-mutants.mjs        --rev e07e207… TMPDIR=/nonexistent-r34   # exit 1 (crash, not the documented 2)
node -e / empty counter file                                             # exit 0  <-- F4
node check-bidi-runtime.mjs --selftest (cwd clone, TMPDIR=fresh)         # exit 0, cases=44 passed=44, leftovers 0
node check-bidi-runtime.mjs --selftest (killed -9 at 0.25 s, 3/3)        # 1 leftover tabi-bidi-runtime-* each time
measure.sh:44-46 loop over a clone with an added scripts/check-zzz…mjs   # receipt line = the added script's output
```

Tool installs/upgrades: none (no network fetches were needed; the only network-capable code paths were inspected, not run).

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w1/SentinelCounters.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/w1/SentinelCounters/` — `evidence.txt`, `c2-symlink-probe.json`, `c2-symlink-probe.stderr`, `symlink-victim-after.txt`, `c2-envprobe.json`, `escape-proof.json`, `c2-orphan.json`, `c2-crash.json`, `c2-crash.stderr`, `c1-crash-exit.json`, `c1-crash-exit.stderr`, `selftest.out`
- No lane file, lane index, fleet file, sibling repo or `~/.local/bin` entry was created or modified; all probe commits live in the scratch clone, which was removed.

Residual on the host, not mine to reap: 5 idle `sleep 240` processes (start 16:50:49–16:51:22, ppid 1494) were still visible after cleanup. My own orphan probe's 20 survivors were killed and verified gone (`after_cleanup=0`) before those timestamps, so these belong to another seat's fixture; killed nothing else.
