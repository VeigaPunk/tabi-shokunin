# C1 attack, w2 — environment leak in the kill measurement (seat CritC1EnvLeak)

## Verdict

I attacked C1's kill measurement at the tip `072af95fe2822f0785a6ff88a578e2142dd258e5`, always in scratch, with
counter bytes `02945f88…` and catalogue `cd1c27a2…` (both re-verified inside every reading). **Holds: the tip's
committed self-test kill set does not depend on any environment read** — neither gate reads cwd, `process.env`,
`/proc`, `import.meta.url` or its own bytes anywhere in a case assertion (static sweep), and both gates stay
10/10 and 29/29 clean when copied into a directory named `mutant-7` with `TMPDIR` inside it, with per-case `ok`
identical to the tip run; the whole 27/0 reading is byte-identical from a different cwd/TMPDIR and under a
neutralised counter. **Defect (high, in the frozen predicate, not in the tip's numbers): the measurement still
leaks the role and the catalogue index through the run directory, so the target is reachable with junk** — I
reproduced wave-1's two-line-per-gate `process.cwd()` attack *at the tip* (27/0, exit 0, frozen bytes) and three
grep-evading variants: own script path via `import.meta.url`, `process.env.TMPDIR`, and `/proc/self/<concat cwd>`
built from `String.fromCharCode` (its diff contains no `cwd` literal). The `PWD` control shows counts alone cannot
tell a leak from an inert added case (0 z-kills, still 27/0), so C1 needs attribution, not more counting. Testing
the proposed remedy: **neutral run names + env whitelist alone are not sufficient** — a `/proc/<ppid>` provenance
attack (`cmdline`/`cwd` → `git show <rev>:scripts/…` + catalogue `kind`) still reaches 27/0 at baseline with
neutral names (`prov` kills 27); adding a PID+mount namespace closes it (`prov` kills 0, 14 survivors at baseline)
while leaving the tip reading at 27/0. The machine "killer attribution" I built is **vacuous** — the junk is in the
pristine copy too, so id-set comparison flags only the one crash kill — so attribution must stay a reading rule
with a diff-scope check.

## 1. What the tip's own self-tests touch

Sweep of both gates (whole file, `$S/clone` at the tip; `$S = /fast/scratch/hyaku/tabi-r30/CritC1EnvLeak`):

```
$ grep -nE "process\.(cwd|env|ppid|pid|argv|platform|getuid|umask)|readlink|/proc/|import\.meta|tmpdir|homedir|hostname|userInfo|realpath|Date\.now|Math\.random|performance\.now|randomBytes|USER|HOME" scripts/check-s106-evidence.mjs scripts/check-release-pins.mjs
check-s106-evidence.mjs:39,48,63,294,393     check-release-pins.mjs:61,62,73,439,446,524
```

Every hit is outside a case assertion: `import.meta.url` → `LANE` at line 48 / 73 is used only as the CLI
`--repo` default (`opts = parseArgs` at 377 / 506); `tmpdir()` at 294 / 439 makes the fixture root
(`mkdtempSync(join(tmpdir(), "tabi-s106-"))`); `process.env` is spread into the *fixture git* spawn at
`check-s106-evidence.mjs:63`; `realpathSync` at `check-release-pins.mjs:446` compares the fixture's
`rev-parse --show-toplevel` with the fixture root; `process.argv` is CLI parsing.

The self-test bodies alone (s106 340-374, pins 473-503) have **zero** matches (`grep … ; exit=1`). Behavioural
confirmation: gates copied to `$S/tmp1/mutant-7/` and run with `TMPDIR=$S/tmp1/mutant-7/tmp`
(`s106-identitynamed.json`, `pins-identitynamed.json`) → exit 0/0, 10/10 and 29/29, per-case `ok` lists identical
to the tip run. Counter-level: the pristine tip reading is byte-identical from `/tmp/critc1-alt` with a different
TMPDIR (`tip-altcwd.json` sha256 `0392fc10…` = `tip-baseline.json`), and the neutralised counter reproduces the
same per-mutant `killed_by` map (`tip-v2counter.json`, comparison `True`, no diffs).

## 2. The leak, reproduced at the tip (`scripts/check-gate-mutants.mjs` lines as frozen)

```
141:function runSelftestOf(work, runId, name, bytes) {
142:  const dir = join(work, runId);
148:    cwd: dir,
152:    env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp },
203:    const res = runSelftestOf(work, `pristine-${gates.length}`, …);
215:    const res = runSelftestOf(work, `mutant-${i}`, basename(m.script), mutated);
```

`cwd` is `<work>/mutant-<i>` and `TMPDIR` is `<work>/mutant-<i>/tmp`; the whole parent environment is inherited.
Each variant is a single `results.push` added at the top of each gate's `runSelftest` (patches in this directory):

| variant | read | diff contains `cwd`? | tip reading | baseline reading |
|---|---|---|---|---|
| V1 `process.cwd()` | cwd | yes | fs 0 bk 0 exit 0 | **fs 14 → 0** (`base-attack-frozen.json`) |
| V2 `fileURLToPath(import.meta.url)` | own path | no | fs 0 bk 0 exit 0 | — |
| V3 `process.env.TMPDIR` (fallback TMP) | env | no | fs 0 bk 0 exit 0 | — |
| V4 `readlinkSync("/proc/self/"+String.fromCharCode(99,119,100))` | `/proc` | **no** (only the commit message) | fs 0 bk 0 exit 0 | — |
| V0 `process.env.PWD` | env | no | fs 0 bk 0, **z-kills 0** | negative control |

V1 on the tip: `fault_total 27, fault_survivors 0, benign_total 13, benign_killed 0, clean true, exit 0`
(`V1-cwd.json`). The identical 4-line patch on baseline gates + frozen counter: `fs 14 → 0`, exit 0
(`base-attack-frozen.json`), reproducing wave-1 §2 independently. **Important:** at the tip the junk is *redundant*
— without it the same rev reads 27/0 (`tip-baseline.json`), and in `V1-cwd.json` every fault except
`pins-f3-bytes-absent` also fails a genuine named case. So the hole is in the rule, not in the tip's numbers.
`V0` proves the counting rule cannot separate leak from noise: 0 z-kills and still 27/0.

## 3. Attribution at the tip, and why the id-set check is vacuous

`tip-baseline.json`: 22 of 27 faults are killed by exactly one named case, 33 named kills in total, e.g.
`s106-sha-drop → ["same-length-tamper-invalid"]`, `s106-anchor-unique-true → ["duplicate-anchor-invalid"]`,
`pins-notfound-body → ["absence-404-body-lacks-marker-unresolved"]`. The 27th, `pins-f3-bytes-absent`
(`if (ob === null || nb === null)` → `if (false)`), kills by crash: exit 1, empty stdout,
`TypeError [ERR_INVALID_ARG_TYPE] … Hash.update … sha256 (…:96)` — a reachable path, but not a case assertion.

The attribution I implemented in the neutral counter compares each mutant report's `case_ids` to the pristine
report's. **Measured defect of my own proposal:** at `base-attack-v2counter.json` and
`tip-attack-v2counter.json` the junk case is present in the *pristine* copy as well, so `ids_match_pristine` is
`True` for all 40 and the check flags only `["pins-f3-bytes-absent"]` (the crash kill). It catches nothing.

## 4. Neutral names + env whitelist are not enough (V5)

V5 (baseline, `/proc/<ppid>/cmdline` → `--repo`/`--rev`, `/proc/<ppid>/cwd` → repo, then
`git show <rev>:scripts/<me>` + `git show <rev>:scripts/gate-mutants.json`, classify by catalogue `kind`):
frozen counter `fs 0`, `prov` kills 27 (`V5-frozen.json`); under my neutral counter (random 32-hex run dir under
`<work>/runs/`, independent random `TMPDIR` under `<work>/t/`, env `{PATH, HOME, TMPDIR, TMP, TEMP}`) still
`fs 0`, `prov` kills 27 (`V5-v2counter.json`). Adding `unshare -pfr --mount-proc node <file> --selftest --json`
(v3 counter) gives `fs 14`, `prov` kills 0 (`V5-v3.json`), while the tip stays `fs 0 bk 0 exit 0` (`tip-v3.json`)
and the Z attack stays `fs 14` (`Z-v3.json`). Feasibility measured unprivileged: inside the namespace the child
sees `ppid 0` and `/proc/<ppid>/cmdline` is ENOENT, both gates' self-tests still run clean (10/10, 29/29,
`*-nsprobe.json`), and `mount -t tmpfs none <repo>` makes the pristine bytes ENOENT inside the same namespace.

Residual, not closed by the above: the child can walk up from its run directory (`ls ../../../..` from
`$S/work/probe/runs/abc` lists `attack base clone out tmp1`) or scan the filesystem for another copy of
`scripts/gate-mutants.json`; the work root must not have the repo above it, and a broad scan is only bounded by
permissions (different uid) or by obscuring every readable copy of the measured rev.

## 5. Exact counter-v2 rule

R1 **Neutral run identity** (measured: closes V1-V4; tip reading unchanged). `<work>` = `mkdtemp` under a scratch
parent that contains no repo; per run `dir = <work>/runs/<randomBytes(16).hex>`, `tmp = <work>/t/<randomBytes(16).hex>`;
`spawnSync(execPath, [file, "--selftest", "--json"], { cwd: dir, env: { PATH, HOME, TMPDIR: tmp, TMP: tmp, TEMP: tmp } })`;
file name stays `basename(gate)` (identical for pristine and mutants); `rmSync` both dirs after the run.

R2 **Provenance isolation** (measured necessary and sufficient against V5). Spawn through
`unshare -pfr --mount-proc node <file> --selftest --json`, and in the same namespace `mount -t tmpfs none <repo>`
(and any sibling copy reachable from `<work>`) before exec. Verified: V5 27 kills → 0; tip 27/0 preserved.

R3 **Killer attribution as a reading + diff-scope rule** (the machine id-set variant is measured inert). The
counter must emit `fault_killed_by` (it already emits `failing_cases`); the reading rule: a fault counts as killed
only if its evidence is (a) a case id that appears in the gate's `CASES` table and whose `build(fx)` →
`evaluate(fx.root, …)` path the implementer's diff touches, or (b) an exit ≠ 0 with an empty report whose reachable
path is named (`pins-f3-bytes-absent` is of this shape). Diff-scope: `runSelftest` may change only inside `CASES`
and the per-case `ok` expression — a new `results.push` before or outside the `for (const c of CASES)` loop is
rejected on sight (that is exactly V1-V4 and V5). Note the scope of this check: it is a textual/heuristic rule,
evadable by inlining the read into a case's `ok` (V4 shows greps for `cwd` are worthless), which is why R2 is the
load-bearing part.

R4 **Unlabelled decoys** (cost, not closure). Extra fault/benign mutants whose `kind` exists only in the counter's
memory, never in the repo, argv or work tree; require 0 survivors and 0 false kills over them too, so a
self-classifying gate either kills benign decoys or misses fault decoys. Consistent with wave-1 §4: decoys raise
the price, they do not remove the family.

**Junk it catches:** the two-line-per-gate `process.cwd()` patch (V1) — 14 → 0 for the frozen counter at baseline,
`fs 14` under R1/R2, and rejected by the R3 diff-scope rule; the same for V2/V3/V4 and for V5 (R2). Junk it does
**not** catch: an inert added case at the tip (counts already honest; only a diff review sees it), and the
self-bytes inventory family (wave-1 B2), which is outside C1-env.

## 6. Impacted axes

| axis | effect |
|---|---|
| operability (C1) | tip reading verified honest by attribution (27/0, 22 single-case kills, 1 crash kill); the frozen predicate is forgeable with 4 added lines — the 10 is earned by the cases, not by the rule. |
| calibration | the frozen kill rule's header claim that the benign class catches source-keyed cases stays false for the identity channel; additionally the machine id-set attribution is inert (measured), so only R2 + reading closes it. |
| depth / coverage / freshness / adjacency | untouched: no corpus, knowledge or source row read by either counter. |
| C2 | untouched — frontier counter not read or run. |

## 7. Smallest safe correction

1. This round, no code change is needed for C1 to hold at the tip: read `failing_cases` (and the one crash kill)
   and require each fault's named case to be a `CASES` fixture that exercises the catalogued line; reject an
   implementer diff that adds any statement to `runSelftest` outside `CASES`/the per-case `ok`.
2. Round 31 counter: R1 + R2 in the frozen counter (`runSelftestOf` lines 141-158 and the two call sites 203/215),
   emitting `fault_killed_by`; keep R3 as the reading rule; add R4 decoys.
3. Round 31 catalogue: nothing — decoys come from the counter, not the frozen catalogue (a catalogue decoy is
   visible to the child and classifiable).

Attack patches and counters in this directory are attack artifacts; none of them may be integrated.

## 8. Receipts

`RECEIPTS.md` beside this file: every command, exit code, artifact sha256 and UTC time; frozen-digest check per
reading; commit map for both scratch fixture repos. No network fetch, no tool install, no lane write.
