# RevC1Controls — C1 controls reproduction, round 34 w1

## Verdict

**REPRODUCES.** All five C1 control receipts (`c1-J1-do-nothing` … `c1-J5-unnamed-sibling-side`) reproduce against the committed freeze receipts with zero substantive differences: every JSON field deep-equal (candidates 67 (A 38, B 29), mapped/screened/unaccounted/newMapped, adjacency clean 13/13, `unaccountedKeys`, `leadsReanchored`, `perLane`), every content tree byte-identical, all exits 1 with predicate false as committed, stderr byte-identical (empty). The candidate list rebuilds byte-identically three independent ways (committed = controls-run output = independent `--list-candidates` against my seat clone; sha256 `85e9cbd611b1611724bc29028cb0b3a7ae16b8e422e835d9e785b098945b388a`). Provenance checks pass: each receipt names a clone rev and tree; counter bytes equal `frozenDigests`; sibling pins come from the frozen pins table with no branch-head reads. One operational finding (not a defect in the committed receipts): `controls.mjs:65` reads `corpus/adjacency.tsv` from the **live lane worktree** when scaffolding J2–J5, so a rerun that overlaps L1 integration diverges on J3–J5 — observed and documented below.

## Setup

- Scratch `S=/fast/scratch/hyaku/tabi-r34/RevC1Controls` (TMPDIR under it, per contract); output dir `.ufo/waves/round-34/w1/RevC1Controls/`.
- `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; toplevel asserted equal to `$S/clone`; `git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee` (exit 0). Lane HEAD at run time: `59f1b47aae277e1670e4a824173da8cde7e388ee` (no drift).
- Frozen bytes extracted from the freeze commit via `git show` into the copy tree `$S/ctl/.ufo/waves/round-34/{baseline,counters}/` (relative layout preserved so `HERE`-relative reads of `c1-pins.json` / `c2-mutant-finds.json` and `C1`/`C2` paths work unedited):
  - `controls.mjs` sha256 `18c95d673c55f3d3521dd08d418b8ef894dc5c8f89233e57417565576bcf035e` = `frozenDigests`
  - `c1-adjacency-sweep-v2.mjs` sha256 `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e` = `frozenDigests`
  - `c2-gate-mutants.mjs` sha256 `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82` = `frozenDigests`
  - all six extracted files `cmp`-identical to the lane worktree files.

## Deviation from the item spec (2-line edit, documented)

The item says "edit only the receipt output dir". No receipt-dir edit was needed — receipts are written beside the copy (`writeFileSync(join(HERE, …))`, controls.mjs:34-37,61,138), i.e. into scratch, then copied to the output dir. But `LANE`/`FLEET` are layout-derived (`resolve(HERE,'../../../..')`, controls.mjs:12-13) and cannot resolve correctly from any writable scratch location, so those two constants were repointed. Full diff (`controls-edit.diff` in the output dir):

```diff
--- controls.mjs.pristine
+++ controls.mjs (scratch copy)
-const LANE = resolve(HERE, '../../../..');
-const FLEET = resolve(LANE, '..');
+const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';   (run 3: '…/tabi-r34/RevC1Controls/clone', see race below)
+const FLEET = '/home/vgpnk/Projects/shokunin';
```

Nothing else differs; the pristine copy (sha `18c95d67…`, = frozen digest) is in the output dir.

## Runs

| run | LANE | lane worktree | outcome |
|---|---|---|---|
| 1 | real lane | clean at freeze | **all 5 C1 receipts MATCH**, trees identical; process killed mid-C2-leg by sandbox teardown (C1 receipts complete) |
| 2 | real lane | L1 integration landed mid-run | J1/J2 MATCH; **J3/J4/J5 diverge** (see finding) |
| 3 | seat clone at freeze (clean) | frozen | **exit 0, stderr 0 bytes, all 9 controls scored, all 5 C1 receipts MATCH** — final artifact set |

Run 3 commands (exit codes pasted):

```
TMPDIR=$S/tmp node $S/ctl/.ufo/waves/round-34/baseline/controls.mjs   # run3.exit: exit=0, run3.stderr: 0 bytes
node cmp-c1.mjs $S/ref $B                                             # exit=0 — "ALL 5 C1 RECEIPTS MATCH (minus masked rev fields)"
cmp $S/ref/c1-candidates.tsv $B/c1-candidates.tsv                     # IDENTICAL
node …/c1-adjacency-sweep-v2.mjs --list-candidates --repo $S/clone --fleet /home/vgpnk/Projects/shokunin
                                                                      # exit=0; IDENTICAL to committed (sha 85e9cbd6…)
node pins-check.mjs <c1-pins.json> <c1 counter>                       # exit=0 — "PINS IDENTICAL, 20 lanes"
```

Per-receipt comparison (comparator-final.txt): J1 rev+tree identical (`15dfaccb…` / `21383e5765310e438f699f87e5eb911dd786c6eb`); J2–J5 trees identical (`c6b370c7…`, `8f25da2e…`, `583416ce…`, `02250027…`), exits 1.

## Volatile fields masked (exact list)

1. JSON field `rev` and provenance token `rev=` for **J2–J5 only**: the sha of a control commit created seconds earlier inside a `mkdtemp` clone (author/committer timestamp ⇒ nondeterministic by construction). Verified fresh 40-hex ≠ baseline on every rerun; the **content tree** (`tree=`) is deterministic and matched exactly every time.
2. Provenance token `counter=` path prefix: written as `counter.slice(LANE.length + 1)` (controls.mjs:37), so the path string is layout-derived; the bytes are pinned by `counter_sha256` on the same line, compared exactly (`0dba816c…` everywhere). Basename compared.
3. Nothing else: all other JSON fields, `tree=`, `repo=`, `exit=`, `counter_sha256=`, and stderr bytes compared exactly. J1 (scores the untouched baseline) had **no** masked fields — rev and tree both matched.

## Provenance / pins checks (item requirements)

- **Each `.provenance` names a clone rev and tree**: yes — J1 `rev=15dfaccb…` (baseline, repo=lane), J2–J5 `rev=<fresh control commit> tree=<deterministic> repo=scratch-clone-of-15dfaccb…`, `exit=` recorded. Files in output dir.
- **Sibling pins come from `c1-pins.json`, no branch-head reads (round-33 M3 residual)**:
  - The C1 counter embeds its own frozen `PINS` table (c1-adjacency-sweep-v2.mjs:51-72) and only ever resolves 40-hex revs (`resolveCommit` rejects anything else, :97-101); all sibling reads are `git show <pin>:<path>` / `ls-tree <pin>` — git objects, no `HEAD`/branch resolution anywhere in the counter.
  - `c1-pins.json` is byte-identical to the counter's embedded table (programmatic check, 20 lanes, exit 0; `pins-check.mjs` in output dir).
  - The one branch-head reader in controls.mjs (`pinOf`, :76, `git show -s --format=%H HEAD`) is defined then explicitly disabled (`void pinOf`, :77) — dead code, never invoked.

## Finding: live-worktree read in controls.mjs (reproducibility hazard, not a committed-receipt defect)

`controls.mjs:65` — `const map = readFileSync(join(LANE, 'corpus/adjacency.tsv'), 'utf8')` — builds the J2–J5 scaffolding maps from the **live lane worktree**, not from a git object of the scored rev. During run 2 the L1's concurrent integration landed in the worktree between the J2 and J3 scores (`corpus/adjacency.tsv` 13→17 rows: the four new C1 rows kake `live-delivery-observation`, kake `lab-performance-tool-runs`, kotoba `agent-facing-tool-text-craft`, kasegi `authenticated-consequential-driving`; also `SKILL.md`, `corpus/SOURCES.md`, `corpus/adjacency-screen.tsv`, `scripts/check-bidi-runtime.mjs` modified — all uncommitted, lane HEAD unchanged at the freeze). Consequence, exactly as the worktree-read predicts: J3 `adjacency.rows` 17→21 and `findings` 1→5; J4 `verdict` clean→failed, `findings` 0→6, `mapped` 5→3, `unaccounted` 0→2 (two of its four constructed candidates are now mapped by the new L1 rows); J5 `verdict` clean→failed, `findings` 0→4; J2 matched because it scored before the map changed. Run-2 divergent receipts preserved under `run2-divergent/` in the output dir.

Assessment: the committed receipts are sound (produced at the freeze with a clean worktree — reproduced exactly by runs 1 and 3); the hazard only bites future reruns inside an integration window. The lane worktree changes are the L1's expected round activity; my runs wrote nothing to the lane (controls.mjs writes only to `HERE` in scratch and to its own `mkdtemp` clone; `check-adjacency.mjs` writes only under `mkdtemp` scratch dirs — verified in its source, writeFileSync/mkdtemp targets are all fixture/scratch paths). Lane HEAD unchanged (`59f1b47a…`) before and after all runs.

## Residual risk / verification gaps

- The C2 legs of the controls run are outside my scope: their receipts exist in my output dir (`controls-summary.json`, `run3.stdout`) but were **not** diffed against the committed `c2-*` receipts — the C2 seats own that comparison.
- J2–J5 `rev` nondeterminism is inherent to commit creation; tree equality is the deterministic anchor. A future tool could pin control commits via a fixed committer date, but that would mean editing the frozen script — not done.
- No network fetches were made; no tools installed (none needed; node v24.21.0 already present).

## Deliverable paths (relative to tabi-shokunin)

- Report: `.ufo/waves/round-34/w1/RevC1Controls.md` (this file)
- Receipts (run 3, matching): `.ufo/waves/round-34/w1/RevC1Controls/c1-J{1..5}-*.json|.provenance|.stderr`
- Candidate lists: `…/RevC1Controls/c1-candidates.tsv` (run output), `…/RevC1Controls/list-from-seat-clone.tsv` (independent rerun) — both sha `85e9cbd6…`, identical to committed
- Summary + run logs: `…/RevC1Controls/controls-summary.json`, `run3.stdout`, `run3.exit`, `run3.stderr`
- Reproduction tooling: `controls.mjs.pristine` (= frozen digest), `controls-edit.diff`, `cmp-c1.mjs`, `comparator-final.txt`, `pins-check.mjs`, `sha256sums.txt`
- Race evidence: `…/RevC1Controls/run2-divergent/` (J3/J4/J5 receipts from the run that overlapped L1 integration)

Scratch `/fast/scratch/hyaku/tabi-r34/RevC1Controls` deleted after artifact copy.
