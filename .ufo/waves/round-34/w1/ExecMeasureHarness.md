# ExecMeasureHarness — round-34 measurement-harness check (w1)

## Verdict

The harness **reproduces**: running `measure.sh 15dfacc… <out> 59f1b47…` against a clean
`--shared` clone reproduced **8 of 9 committed baseline artifacts byte-for-byte**
(`c1-at`, `c1.stderr`, `c2-at`, `c2.stderr`, `r33c1-at`, `r33c1.stderr`,
`selfassessment-at`, `provenance`), and the ninth (`noharm-at`) differs in exactly one line —
the `sources-census.sh` echo of the scratch clone path, which necessarily differs because the
seat was instructed to run under its own `HYAKU_SCRATCH`; after normalising the two clone paths
the files hash identically (`83c5c91f…`). Scratch discipline is **clean**: no hardcoded `/tmp`
anywhere (the only `/tmp` substring in the three files is `measure.sh:9`'s `"$S/tmp"`), both
counters build their scratch under `TMPDIR` (`c1:98/184`, `c2:177/210`) and remove it in a
`finally` (`c1:193`, `c2:243`), `measure.sh` exports `TMPDIR` inside its scratch and traps
`rm -rf` on EXIT (`measure.sh:9-10`); empirically both dedicated `TMPDIR`s were empty after
direct counter runs, `$S/tabi-r34/L1/m` was gone after every invocation, and `/tmp` contained
zero `tabi-r34` entries. Three **harness-honesty defects** were found off the critical path
(none changes this run's receipts): D1 `measure.sh` never asserts that the detached checkout
succeeded / that `HEAD == REV` and always exits 0 — demonstrated by a run with an absent
40-hex rev that silently measured the lane's default-branch tip `59f1b47` and exited 0;
D2 both counters exit **1** ("evaluated, predicate not met") when the scratch dir cannot be
created, instead of 2 ("could not evaluate"); D3 a wrong `FREEZE` yields 0-byte counter scripts,
`node` exits 0 on them, and the receipts become 0-byte files recorded as `c1 exit=0`
(mechanism demonstrated directly; not exercised end-to-end). The measured baseline counts also
match the frozen claim: C1 candidates 67 (A 38 / B 29), mapped 1, screened 0, **unaccounted 66**,
newMapped 0; C2 8/20 killed with survivors exactly `M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18
M19`, pristine/neutral/decoy 0, twinsFailing `[]`, battery predicate true; r33c1 unaccounted 0 /
newMapped 3.

## Evidence

All commands run 2026-10-26, times UTC. Seat scratch
`S=/fast/scratch/hyaku/tabi-r34/ExecMeasureHarness`, `HYAKU_SCRATCH=$S/hs` (⇒ script scratch
`$S/hs/tabi-r34/L1/m`, isolated from the L1's `/fast/scratch/hyaku/tabi-r34/L1/m`).

### 1. Primary run

```
cd $S && HYAKU_SCRATCH=$S/hs bash \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-34/measure.sh \
  15dfaccb34601c2d221c78501e2befd8998d600c $S/out 59f1b47aae277e1670e4a824173da8cde7e388ee
exit=0        # MEASURE_EXIT=0, wall 142.85 s, receipts 19:47:08Z–19:49:28Z
stderr: fatal: path '.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs' does not exist in 'HEAD'
        fatal: path '.ufo/waves/round-34/counters/c2-gate-mutants.mjs' does not exist in 'HEAD'
        measured 15dfacc
```
Both fatal lines are **expected and benign**: they come from `measure.sh:22-23`'s
`git -C "$d" show HEAD:$C1|$C2` for the `at-rev` column, and the counters were introduced at the
freeze, not at the measured rev — `provenance-15dfacc.txt` records
`at-rev e3b0c442…` (sha256 of empty) exactly as the baseline receipt does.

### 2. Per-file comparison vs `baseline/measure-at-baseline/`

`comparison.tsv` (in this dir):

| file | status |
|---|---|
| c1-at-15dfacc.json | identical (8d7537e2…) |
| c1-at-15dfacc.stderr | identical (empty, e3b0c442…) |
| c2-at-15dfacc.json | identical (cd53be75…) |
| c2-at-15dfacc.stderr | identical (empty) |
| r33c1-at-15dfacc.json | identical (39a9e91b…) |
| r33c1-at-15dfacc.stderr | identical (empty) |
| selfassessment-at-15dfacc.json | identical (6b3bd85a…) |
| provenance-15dfacc.txt | identical (a1dc81d4…) |
| noharm-at-15dfacc.txt | DIFFERS (1 hunk, scratch path only) |

`noharm.diff` (in this dir) is the whole difference: the `sources-census.sh validate --file
…/c/corpus/SOURCES.md :: exit=0` line echoes the clone path
(`$B` = baseline):

```
-/…/scripts/sources-census.sh validate --file /fast/scratch/hyaku/tabi-r34/L1/m/c/corpus/SOURCES.md :: exit=0 :: file ok /fast/scratch/hyaku/tabi-r34/L1/m/c/corpus/SOURCES.md
+/…/scripts/sources-census.sh validate --file /fast/scratch/hyaku/tabi-r34/ExecMeasureHarness/hs/tabi-r34/L1/m/c/corpus/SOURCES.md :: exit=0 :: file ok /fast/scratch/hyaku/tabi-r34/ExecMeasureHarness/hs/tabi-r34/L1/m/c/corpus/SOURCES.md
```

Normalised equality (`sed` both paths → `<CLONE>`): both `83c5c91fdaa51563459c66ff1ffbc53857de1b9c6f05c38087fd082284d288bd`.
28 lines each, all check exit codes and verdict lines equal (`diff | grep -c '^@@'` = 1).

Cross-consistency: the committed `c1-J1-do-nothing.json` / `c2-J1-do-nothing.json` are themselves
byte-identical to the `measure-at-baseline` `c1-at`/`c2-at` receipts (same shas), so this
reproduction also reproduces the J1 do-nothing controls.

### 3. Scratch discipline — direct counter probes

Frozen counters extracted from the freeze and hash-checked against the baseline provenance
(`0dba816c…` c1, `3cf5eb69…` c2 — match). Dedicated clone at `15dfacc`
(`git -C $S/probe/clone rev-parse --show-toplevel` = the probe dir, `HEAD=15dfacc…`).

```
TMPDIR=$S/probe/tmp1 node $S/k/c1.mjs --rev 15dfacc… --repo $S/probe/clone --fleet /home/vgpnk/Projects/shokunin --json
exit=1 ; c1 JSON sha256 8d7537e2… (== baseline) ; stderr 0 B ; tmp1 leftovers [] ; clone porcelain 0
TMPDIR=$S/probe/tmp2 node $S/k/c2.mjs --rev 15dfacc… --repo $S/probe/clone --json
exit=1 ; c2 JSON sha256 cd53be75… (== baseline) ; stderr 0 B ; tmp2 leftovers [] ; clone porcelain 0
```
Strict `TMPDIR` honouring (no silent `/tmp` fallback):

```
TMPDIR=/nonexistent/tabi-probe node $S/k/c1.mjs … → exit=1 ; "ENOENT … mkdtemp '/nonexistent/tabi-probe/tabi-r34-c1-XXXXXX'" ; /tmp tabi-r34-c1 count 0
TMPDIR=/nonexistent/tabi-probe node $S/k/c2.mjs … → exit=1 ; "ENOENT … mkdtemp '/nonexistent/tabi-probe/tabi-r34-c2-XXXXXX'"
```
(Stderr captured as `c1-badtmpdir.stderr`, `c2-badtmpdir.stderr`.)

After all runs: `hs/tabi-r34/L1/m removed`, `hs3/tabi-r34/L1/m removed`, `probe/tmp1`/`tmp2`
empty, `ls -A /tmp | grep -c 'tabi-r34'` = 0, no `tabi-r34-*` entries. **Leftover list: none.**
(`/tmp/r39c1-entry.md` exists but matches no counter prefix and was not produced by this seat.)

### 4. Defects found

**D1 — no checkout assertion, unconditional success (moderate, harness honesty).**
`measure.sh:11` chains `git clone … && git -C "$d" checkout -q --detach "$REV"` but line 4 is
`set -u -o pipefail` without `-e`; line 12 only checks the *toplevel*, never that `checkout`
succeeded or `HEAD == REV`; the script ends with `echo "measured $short"` and no exit assertion.
Demonstrated with an absent 40-hex rev:

```
HYAKU_SCRATCH=$S/hs3 bash measure.sh 1111111111111111111111111111111111111111 $S/out-fakerev 59f1b47…
exit=0
stderr: fatal: unable to read tree (1111111111111111111111111111111111111111)
        measured 59f1b47
provenance-59f1b47.txt: rev=59f1b47aae277e1670e4a824173da8cde7e388ee freeze=59f1b47…
```
i.e. a requested-rev typo measures the lane's git default-branch tip (`59f1b47`, the freeze) and
reports success under a *different* filename prefix. All receipts for that run are preserved under
`fake-rev-probe/`. Mitigation available to the L1 with no script change: provenance always prints
`rev=` — compare it to the requested rev. (Fix, when the lane owns it: `|| exit 9` after the
checkout, plus `[ "$(git -C "$d" rev-parse HEAD)" = "$REV" ]`.)

**D2 — counters exit 1 when they could not evaluate (low).** Both counters document
`2 = could not evaluate` (`c1:13`, `c2:12`), but a scratch failure escapes the `Refusal` path:
`c1:184`/`c2:210` `mkdtempSync` throws a plain `Error`, so `catch (e) { if (!(e instanceof
Refusal)) throw e; }` (`c1:318`, `c2:261`) rethrows and node exits **1** — the code that means
"evaluated, predicate not met". Observed above with `TMPDIR=/nonexistent/…` (exit 1 on both).
Consequence: a consumer that treats exit 1 as a measured unmet target cannot distinguish it from
a broken environment; `measure.sh`'s provenance records only `c1 exit=1`. (Fix belongs to the
freeze owner, not this round's counters: wrap `mkdtempSync` in a `Refusal`, or pre-check the dir.)

**D3 — bogus `FREEZE` yields empty receipts recorded as success (low–moderate).** `measure.sh:17`
does not test that `git show "$FREEZE:$C1"` succeeded; the shell creates a 0-byte file, `node`
on an empty script exits 0, and the receipt files become 0 bytes with `c1 exit=0` in provenance.
Mechanism demonstrated standalone (exact commands of line 17 + the counter invocation):

```
git -C <lane> show 1111…:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs > c1.mjs
exit=128 ; c1.mjs bytes=0 ; fatal: path '…c1-adjacency-sweep-v2.mjs' exists on disk, but not in '1111…'
node c1.mjs --json ; exit=0 ; out bytes=0
```
Receipts under `freeze-mechanism/`. Under the correct freeze this cannot fire; it is a
silent-empty-measurement hazard, not an observed failure this run.

**Hazards (not defects) worth the L1's note:** `measure.sh:8-9` derives a fixed scratch path from
`HYAKU_SCRATCH` and starts with `rm -rf -- "$S"`, so two concurrent invocations sharing a
`HYAKU_SCRATCH` destroy each other's clone (symptom: the two `fatal:` lines plus a failed run —
which is why this seat was told to use its own parent); and `OUT` placed *inside* `$S` would be
deleted by the EXIT trap at line 10.

## What was measured (baseline counts, for the L1)

- C1 (`c1-at-15dfacc.json`): candidates 67 (set A 38, B 29), mapped 1, screened 0, **unaccounted
  66**, newMapped 0, `predicate=false`, exit 1 — the frozen C1 starting state. `adjacency`:
  verdict clean, 13 rows, 13 verified, 0 findings. One lead re-anchored:
  `corpus/knowledge/mirror-pitfalls.md:39@0440485… -> 40`; leadsUnresolved `[]`.
- C2 (`c2-at-15dfacc.json`): gate sha `eded1be0…`, mutantsTotal 20, killed 8, survivors
  `M01,M03,M04,M05,M06,M07,M08,M09,M10,M16,M18,M19` (exactly the ticket's frozen survivor set),
  pristine/neutral/decoy exit 0, twinsFailing `[]`, unappliable `[]`, battery predicate true
  (forgeriesAccepted 0, honest H0/H1/H2 true), `predicate=false`, exit 1.
- r33c1 (`r33c1-at-15dfacc.json`): candidates 52, mapped 8, screened 44, **unaccounted 0**,
  newMapped 3, `predicate=false` because round-33's own target is 4 (`round-33/counters/c1-adjacency-sweep.mjs:64`).
  So the no-harm clause (**unaccounted stays 0**) holds; exit 1 there is the older target, not a
  regression.
- Self-assessment: identical to baseline (exit 0, `could_not_evaluate=115`, `superseded=42`).

## Deliverable paths

- `.ufo/waves/round-34/w1/ExecMeasureHarness.md` — this report.
- `.ufo/waves/round-34/w1/ExecMeasureHarness/` — my run's receipts: `c1-at-15dfacc.json`,
  `c1-at-15dfacc.stderr`, `c2-at-15dfacc.json`, `c2-at-15dfacc.stderr`,
  `r33c1-at-15dfacc.json`, `r33c1-at-15dfacc.stderr`, `selfassessment-at-15dfacc.json`,
  `noharm-at-15dfacc.txt`, `provenance-15dfacc.txt`, plus `comparison.tsv`, `noharm.diff`.
- Probe evidence: `c1-direct.json`, `c2-direct.json`, `c1-direct.stderr`, `c2-direct.stderr`,
  `c1-badtmpdir.stderr`, `c2-badtmpdir.stderr`, `freeze-mechanism/`
  (`c1.mjs` 0 B, `out.json` 0 B, `show.stderr`, `node.stderr`), `fake-rev-probe/`
  (D1 receipts incl. `provenance-59f1b47.txt`).

No lane file was edited; no browser was launched; no tool installed; no network fetch made.
Scratch `/fast/scratch/hyaku/tabi-r34/ExecMeasureHarness` deleted after copying receipts.
