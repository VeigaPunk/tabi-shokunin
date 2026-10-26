# C1 attack — `check-gate-mutants.mjs` + `scripts/gate-mutants.json`

Seat `CritC1Counter` (critic, attack). Frozen inputs: counter `02945f882ea9…`, catalogue `cd1c27a2a971…`
(`.ufo/waves/round-30/claims.json:frozenDigests`), measured in a clean shared clone of
`061e62024c0523d3c6c7e819506a773ff2cd7d75`. Receipts: `.ufo/waves/round-30/w1/CritC1Counter/RECEIPTS.md`
(commands, exit codes, shas, measured revs) and the JSON/diff artifacts beside it.

## 1. Verdict

C1's predicate as frozen is satisfiable without making any self-test case exercise a catalogued check.
Three attacks reach `fault_total 27, fault_survivors 0, benign_total 13, benign_killed 0, exit 0` with the
counter and catalogue byte-identical to `frozenDigests`: the cheapest is **one added line per gate** that
tests `process.cwd()`, because the counter places every mutant copy at `<work>/mutant-<catalogue index>` and
executes it there, i.e. it tells the code under test both that it is a mutant and which one; a second needs
only the gate's own bytes (a fragment-count table, no environment and no git); a third reads the pristine blob
and the catalogue through `/proc/<ppid>/cwd` and `/proc/<ppid>/cmdline`. All three are visible in the counter's
own `--json` output: for every one of the 14 previously surviving faults the kill comes from exactly one added
non-behavioural case id, and no benign mutant fails any case — so the fraud is detectable by reading
`failing_cases`, but no part of the frozen kill rule reads it. The benign class also cannot be engineered to
close the hole: by construction its members are behaviour-preserving rewrites of the *same* sites while the
faults change behaviour, so a text function that separates the two sets always exists (see §4). C1 therefore
needs a reading rule about *which* case killed each fault, not just the two counts.

## 2. Cheapest counterexample (Z) — `process.cwd()` alone

`scripts/check-gate-mutants.mjs:142,148,152,203,215`:

```
142:  const dir = join(work, runId);
148:    cwd: dir,
152:    env: { ...process.env, TMPDIR: tmp, TMP: tmp, TEMP: tmp },
203:    const res = runSelftestOf(work, `pristine-${gates.length}`, …);
215:    const res = runSelftestOf(work, `mutant-${i}`, basename(m.script), mutated);
```

The run directory name carries the role and the catalogue index; `cwd` is that directory; the child inherits
the whole parent environment. One line in each gate's `runSelftest` (inside `results.push` before the tally)
is enough — `Z-minimal-cwd.diff`, 2 added lines, no import changes, no fixture:

```js
results.push({ id: "z", ok: !(/mutant-(\d+)$/.test(process.cwd()) && Number(process.cwd().match(/mutant-(\d+)$/)[1]) < 9) });   // s106
results.push({ id: "z", ok: !(/mutant-(\d+)$/.test(process.cwd()) && Number(process.cwd().match(/mutant-(\d+)$/)[1]) >= 15 && Number(process.cwd().match(/mutant-(\d+)$/)[1]) <= 32) });   // release-pins
```

`node scripts/check-gate-mutants.mjs --rev <Z> --json` → exit 0, `fault_survivors 0`, `benign_killed 0`,
`clean true`, `counter_sha256_at_rev 02945f88…`, `catalogue_sha256 cd1c27a2…` (`Z.exact.json`). Baseline in the
same clone, same command: exit 1, `fault_survivors 14`, `benign_killed 0` (`base.json`). The same channel works
with `--repo`/`--work` (`A.json`, `A-cwd-leak.diff`, 6 added lines), i.e. it is not an artifact of my invocation.

`failing_cases` proves what the gate did: all 14 previously surviving faults now fail exactly `["z"]`; the 13
benign mutants fail nothing. Nothing in the gate exercised `evaluate()` on a fixture that the mutation touches.

## 3. Two further channels

**B2 — no environment leak at all (`B2-inventory.diff`, 2 long table lines).** A fragment-count table evaluated
against the gate's own bytes: `readFileSync(fileURLToPath(import.meta.url))` and, per catalogued site, one
substring whose count changes in any fault rewrite and is invariant under every benign rewrite
(e.g. `shaMatch` 4, `anchorUnique` 4, `occurrences` 5, `row.tags.includes(f.old_tag)` 2, `refs/tags/${stable}/` 2,
`r.recheck === "on-release"` 1; full table and the per-mutant simulation are in the artifact). Measured:
exit 0, `fs 0`, `bk 0`, clean (`B2.exact.json`). This attack uses no `cwd`, no `/proc`, no `git`, no env — no
isolation of the child can stop it. It also directly falsifies the counter's header claim (lines 40-44) that a
killed benign mutant catches "a case that hashes or greps the gate's own bytes": the table *is* that junk and
passes 13/13 benigns, because the benign rows only rewrite the *whole find line*, leaving every coarser invariant
intact.

**C5 — provenance from the parent process (`C5-rev-provenance.diff`, 29 added lines).** `readlinkSync(/proc/<ppid>/cwd)`
gives the repo the counter was launched in, `/proc/<ppid>/cmdline` gives `--rev`; the copy then reads
`git show <rev>:scripts/<me>` (the pristine bytes) and `git show <rev>:scripts/gate-mutants.json`, computes which
catalogue row maps pristine→self, and fails when that row's `kind` is `fault`. Measured at a rev that is **not**
`HEAD`: exit 0, `fs 0`, `bk 0` (`C5.exact.json`). `C4` (25 lines, `HEAD`-keyed, not `--rev`-keyed) shows the
channel is rev-sensitive: `fs 14`, exit 1 when `HEAD` ≠ measured rev (`C4.exact.json`) — a defect of that attack,
not of the hole. `C` (23 lines, identification by "find absent + replace present") is the negative control that
matters: it yields `bk 5` (exit 1) because short replacement texts occur elsewhere in the file, i.e. the counter's
benign class does bite naive provenance attacks, but not the byte-exact one.

**Not run (inference, marked as such):** a `Function.prototype.toString`/AST-normalised digest was not built. It
is strictly costlier than B2, needs no additional channel, and by the argument in §4 adds nothing new.

## 4. Why the catalogue cannot close this class

For a benign set *B* and fault set *F* disjoint in text, any function over the gate's own bytes that is constant
on *B* and separates *F* is a valid fingerprint — and one always exists, because "is my source exactly pristine
with the rewrite of some benign row applied" is such a function (§3's B2 is its cheap cousin). Closing the class
would require *B*'s equivalence closure to contain *F*, which is impossible: benign rows preserve behaviour at
the same site, fault rows disable a check. Measured support: adding same-length, same-identifier-multiset fault
decoys to a scratch catalogue (`s106-anchor-unique-bound` `=== 1`→`!== 0`, `pins-f4-lower-bound` `a < 1`→`a < 0`;
catalogue bytes deliberately differ from the frozen digest, so these are experiments, not predicate readings)
leaves `fs 2` against Z and `fs 1` against B2, both exit 1 (`decoy-bdfcafd.json`, `decoy-dcd3c69.json`). A decoy
that breaks behaviour on a covered path (`s106-sha-flip`, `===`→`!==`) is killed by an existing *behavioural*
case (`decoy-flip.json`, exit 0) — which is the shape of a real kill, and exactly what none of §2-§3 produces.
Decoys raise the attacker's cost; they do not remove the fingerprint family.

## 5. Additional finding — the 14 survivors are fixable behaviourally, and nothing in the frozen rule checks that they were

While measuring, the s106 fixture gaps behind the 5 s106 survivors are arithmetic, not judgement calls:

- `sha-mismatch-invalid` writes `FIXTURE_BYTES.replace("// tail","// tampered")`, 2614 → 2618 bytes, so
  `byteCountMatch` is already false in that fixture and `valid` stays false when `shaMatch` is deleted from it —
  `s106-sha-drop` (the `valid`-conjunct drop) survives a fixture that was supposed to see the sha term.
- No case makes the anchor text occur more than once (occurrences = 1 in every fixture), so
  `s106-anchor-unique-drop` and `s106-anchor-unique-true` are invisible.
- `s106-byte-count-drop` / `s106-byte-count-true` need a fixture whose committed bytes hash to the claimed sha
  while `decoded_bytes` disagrees; none exists.

An implementer can therefore satisfy C1 by adding these three fixtures — or by §2's line. The frozen predicate
cannot tell the two apart. This is the honest work C1 asks for; §2 is the cheapest way to fake it.

## 6. Impacted axes

| axis | effect |
|---|---|
| **operability (C1)** | target as frozen is gameable; a 10 recorded on these two counts alone is unearned. The 14 survivors are real and fixable (§5). |
| **calibration** | the counter header states a property it does not have (benign class catches source-keyed cases). Round 30+ reports will cite that sentence; it is false provenance inside a frozen gate. |
| depth / coverage / freshness / adjacency | untouched; no corpus, no knowledge entry, no source row is read by either counter. |
| C2 (coverage) | untouched — I read and ran nothing of the frontier counter. |
| separability | confirmed for these attacks: both gates' self-tests are independent of every C2 file. |

## 7. Smallest safe correction

1. **Load-bearing (reading rule, no code change, usable this round):** a fault is killed only if the
   `failing_cases` entry names a case that calls `evaluate()` on a fixture and fails; and the diff must contain
   no added self-test result that reads `import.meta.url`, `process.cwd()`, `process.ppid`,
   `process.env`, or a git blob. The counter already emits `failing_cases` per mutant (line 220 of the frozen
   counter, `failing_cases: res.failing_cases`); the frozen kill rule simply does not read it. Under this rule §2, §3 all fail (single case id
   on all 14 kills) and §5's fixtures pass.
2. **Round 31 counter (defence in depth, ~15 lines):** opaque run ids (never `pristine-`/`mutant-<i>`), one fresh
   neutral directory per run, and spawn the copy through a launcher whose `cwd` is a temp dir and whose `env` is
   `{PATH, TMPDIR}` only, so `/proc/<ppid>/{cwd,cmdline}` and `PWD` reveal neither the repo, the rev, nor the role.
   This kills §2 and §3/C5; it does not touch §3/B2.
3. **Catalogue:** add the same-length, same-token fault decoys from §4 (one per gate) — measured to raise the
   price of §2 and §3/B2 and to be invisible to the existing benign class. Not sufficient alone.

I did not build any of these in the lane; as an attack seat I report only. Attack patches in the output directory
are attack artifacts and must not be integrated.
