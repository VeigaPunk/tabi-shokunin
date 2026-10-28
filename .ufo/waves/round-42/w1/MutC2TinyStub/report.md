# r42 C2 r3 stub mutation — MutC2TinyStub (leaf)

Wave item: mutate the frozen C2 checker's r3 "baseline noop records the ls-tree counting
command" clause, run the mutant against a fixture the pristine checker refuses, and record
whether the mutant greens it (clause load-bearing) or also refuses (clause unobservable).

Frozen counter (read-only, never edited):
`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`
sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` (9467 bytes),
clean at `git rev-parse HEAD` = `0081bfdb93b6bd1bf2853bb128996f1a976b7218`.
Lane bytes re-hashed after every run: unchanged.

## Mutation M (exactly one behavior-bearing line, r3)

```diff
   else if (size < 10) add('r3-baseline-file-empty', `${BASELINE_OUT} committed blob is ${size} bytes`);
   else {
     const raw = gitShow(BASELINE_OUT).toString('utf8');
-    if (!/ls-tree/.test(raw)) add('r3-command-not-recorded', 'baseline control does not record its ls-tree counting command');
+    // MUTATED(M): r3 ls-tree-command-mentioned requirement dropped; nonempty+digit retained
     if (!/(^|[^0-9])0([^0-9]|$)/m.test(raw)) add('r3-zero-not-recorded', 'baseline control does not record the digit 0');
```
The `size < 10` gate and the digit-0 test are retained verbatim (nonempty+digit kept).
Scratch copy only: `/fast/scratch/hyaku/tabi-r42/MutC2TinyStub/check-mutant.mjs`.
sha256 pre-mutation `b1d05df1…c76b4a8` (= lane) → post-mutation `1e7b38142e7dba5df8282b825d2b5205b1292696ef47db84037ea736c1b71653` (9433 bytes) → restored `b1d05df1…c76b4a8` (= lane).

## Fixtures (scratch git repos)

Each: `git init -q` in `/fast/scratch/hyaku/tabi-r42/MutC2TinyStub/fixtures/<name>`, then
`git -C "$D" rev-parse --show-toplevel` asserted `== "$D"` **before** any commit, then a
single commit; the checker was invoked as
`node <checker> --rev <40-hex> --repo <D> --json`.

| fixture | contents | rev |
|---|---|---|
| `A_minimal_zero_only` | **exactly as assigned**: `.ufo/waves/round-41/controls/c1-baseline-noop.out` = `0\n` (2 bytes), nothing else | `0cec3f7a5fe25777846136aeb5816e3a4cbd1814` |
| `B_zero_no_lstree_ge10` | same file only, 28 bytes: `wc -l records.csv\ncounted\t0\n` (0 recorded, no `ls-tree`) | `b37974cfee39713b563c8581f1d49f2446e73d59` |
| `C_fullmin_red_r3only` | full tree with r1/r2/r4 satisfied (receipt+witness ≥1000 B bound by sha256 to the committed measure record, S146 `rejected` + S148 `supersedes S146 — …` verbatim in the committed staged HTML, 38 slice ids + 38-row TSV with committed ≥200-byte evidence), baseline = same 28-byte no-`ls-tree` file ⇒ **only** r3 red | `d4fa6cdcf0e0d643618b6c93aaa0e2c5b7580fd0` |
| `D_fullmin_green_control` | identical to C except baseline = `git ls-tree -r HEAD | wc -l\ncounted\t0\n` (38 bytes) ⇒ fully green | `e061ffd7ecfae81aaa253441f082a662a0562434` |

B and C are auxiliary isolating fixtures beyond the assigned one; they exist because the
assigned fixture cannot reach the dropped line (see A).

## Red/green table

| fixture | pristine exit | pristine findings | mutant exit | mutant findings | reading |
|---|---|---|---|---|---|
| A `0\n` (assigned) | 1 | `r1-measure-absent, r1a-receipt-absent, r1b-witness-absent, r2-sources-absent, r3-baseline-file-empty, r4-slice-absent, r4-quarantine-absent` | 1 | **identical set** | mutant **survived** — the 2-byte blob is rejected by the retained `size < 10` gate, so the dropped clause is never reached; A cannot discriminate M |
| B 28 B, `0`, no `ls-tree`, minimal tree | 1 | `…, r3-command-not-recorded, …` | 1 | `…, r4-quarantine-absent` (no `r3-command-not-recorded`) | clause **observed** at finding level: exit code unchanged only because r1/r2/r4 are legitimately absent |
| C 28 B, `0`, no `ls-tree`, full tree | 1 | `r3-command-not-recorded` **only** | **0** | **`[]`, `predicate: true`, `findingCount: 0`** | mutant **greens** a fixture the pristine checker refuses ⇒ the dropped clause is **load-bearing** |
| D 38 B, `ls-tree` + `0`, full tree | 0 | `[]` | 0 | `[]` | positive control: C's refusal is caused solely by the missing `ls-tree` token, not by any other fixture defect |

Exact mutant output on C (stdout, verbatim):

```json
{"schema": "tabi-r42-routed-defects", "rev": "d4fa6cdcf0e0d643618b6c93aaa0e2c5b7580fd0",
 "predicate": true, "findingCount": 0, "findings": []}
```
Pristine on the same rev:
```json
{"schema": "tabi-r42-routed-defects", "rev": "d4fa6cdcf0e0d643618b6c93aaa0e2c5b7580fd0",
 "predicate": false, "findingCount": 1,
 "findings": [{"id": "r3-command-not-recorded","detail": "baseline control does not record its ls-tree counting command"}]}
```

## Verdict on the mutation

**Killed.** Dropping `if (!/ls-tree/.test(raw))` makes the frozen counter return
`predicate: true` (exit 0) on committed bytes that commit a baseline control recording only
`wc -l records.csv / counted 0` — the exact do-nothing-shaped evidence r3 exists to exclude.
The clause is load-bearing for the r3 sentence "nonempty, **recording the ls-tree counting
command** and the digit 0"; the mutant survives only when a fixture also violates the
independent `size < 10` gate.

Calibration consequence (finding, not an amendment — counter bytes are frozen): r3 is a
three-term conjunction whose first term (`size < 10`) *masks* the second (`ls-tree`). Any r3
evidence scoring that relies on a baseline blob under 10 bytes reports
`r3-baseline-file-empty` and can never demonstrate the command-recording term. A 1-line
fixture cannot calibrate that term; only a ≥10-byte blob containing `0` but no `ls-tree`
exercises it. The pristine checker does refuse such bytes (fixture C/B), so the term is
detected — but seats scoring r3 must use the 28-byte-shaped control, not a bare `0`.

## Restoration evidence

```
sw_sha_pre  b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  (scratch copy == lane)
sw_sha_post 1e7b38142e7dba5df8282b825d2b5205b1292696ef47db84037ea736c1b71653  (mutant, 9433 B)
restored    b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  (== lane)
lane        b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8
```
`cp -- <lane> <scratch-copy>` then re-run on fixture C ⇒ exit 1 with
`r3-command-not-recorded` again (byte-identical behavior restored). The lane file was only
ever opened for read; `git status --porcelain -- <lane>` is empty.

## Evidence

- `evidence/transcript.txt` — every exact command line, exit code and verbatim stdout/stderr for all 8 runs (4 fixtures × pristine/mutant) plus the restoration run.
- `evidence/mutation.diff` — unified diff of M.
- `evidence/results.json` — machine-readable per-fixture pristine/mutant exit + finding ids + predicate.
- `evidence/matrix.txt` — condensed matrix.
- `evidence/restore-run.json` — restored-copy run.
- `evidence/fixtures/<name>/` — fixture working trees as committed (`.git` omitted; revs above).
- `hashes.txt` — all hashes above.

## Limitations

- Fixtures B/C/D are synthetic minimal witnesses built to satisfy the checker's structural
  conditions; they say nothing about the real round-41 control bytes beyond r3.
- A's non-discrimination is a property of gate ordering, not of the assignment's intent; both
  readings are reported rather than choosing one.
- No tool installs or upgrades were performed (`node v24.21.0`, `git 2.56.0` already present);
  pacman was not invoked. No commits/pushes/git-or-jj mutation in any shared tree; the only
  git repositories created were under the scratch root, which was deleted.
- Scratch root `/fast/scratch/hyaku/tabi-r42/MutC2TinyStub` deleted after evidence copy.

VERDICT ok|finding — `finding`: M is killed (mutant greens fixture C, exit 0 / `predicate:true`, where the pristine checker refuses with `r3-command-not-recorded`), so the dropped ls-tree clause is load-bearing; the assigned 2-byte `0`-only fixture is dominated by r3's `size < 10` gate and cannot reach it (mutant survived there with an identical 7-finding set), so r3 seats must use a ≥10-byte zero-without-`ls-tree` control.
