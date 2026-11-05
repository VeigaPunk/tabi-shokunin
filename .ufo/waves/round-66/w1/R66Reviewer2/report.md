# R66Reviewer2 — machine report (attack of R66Executor2's output: v3 gate, counters/ + c2/)

Date: 2026-11-05. Read-only on all target files; all scratch under /fast/scratch/hyaku/tabi-r66/R66Reviewer2 (first runs 05:56, final battery and probes re-runs at 06:02-06:03). No file written outside `waves/round-66/w1/R66Reviewer2*`. No tools installed or upgraded (none needed). No git mutation anywhere.

## 1. Diff v2 → v3

```
$ diff -u .ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs
@@ -159,6 +159,8 @@
     { id: 'matrix-input-absent', name: 'matrix-neg3.json', ... },
     { id: 'matrix-input-digest', name: 'matrix-neg4.json', ... },
     { id: 'matrix-input-bound', name: 'matrix-bound.json', ... },
+    { id: 'matrix-input-relative-repo-base', name: 'matrix-rel-repo.json', matrix: { input: { path: 'instruments/a.mjs', sha256: aSha } }, want: (f) => f.check === 'matrix-input', negate: true },
+    { id: 'matrix-input-relative-dir-base', name: 'matrix-rel-dir.json', matrix: { input: { path: 'good.command.json', sha256: goodReceiptSha } }, want: (f) => f.check === 'matrix-input', negate: true },
   ]) {
```

One hunk of exactly two selftest-only case lines. **No change to `readAt`, `checkReceipt`, `checkMatrix` or `evaluate`** — verified twice: first diff at 05:56 (exit 0, EMPTY — v3 was then byte-identical to v2, sha `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4` == frozen v2 sha; cached in R66Reviewer2.diff and shared by peer R66MutTester1 at the same minute); second diff at 06:03 (exit 1, the single hunk above with the 2 added case lines).

v3 sha timeline (all observed directly, `sha256sum`, three separate invocations):
- 05:56 `81c8a5ec…84aea4` (== frozen v2, empty diff)
- 05:59 through 06:03 `b683039e5eb373ffc0fecbfca7888c05dd6ebe32203e332382f3777b49f0ca30` (the 2 added case lines, nothing else; matches MutTester1's own recorded sha for the file)

## 2. The two new cases and their bases (verbatim, v3:162-163)

```
line 162: { id: 'matrix-input-relative-repo-base', name: 'matrix-rel-repo.json', matrix: { input: { path: 'instruments/a.mjs', sha256: aSha } }, want: (f) => f.check === 'matrix-input', negate: true },
line 163: { id: 'matrix-input-relative-dir-base', name: 'matrix-rel-dir.json', matrix: { input: { path: 'good.command.json', sha256: goodReceiptSha } }, want: (f) => f.check === 'matrix-input', negate: true },
```

- **Repo base only** (line 162): `instruments/a.mjs` exists only under the fake repo root (v3:121-122: `fs.mkdirSync(path.join(repo, 'instruments'), …)`, `fs.writeFileSync(path.join(repo, 'instruments', 'a.mjs'), …)`). The controls dir contains no `instruments` entry during this case.
- **Matrix-dir base only** (line 163): `good.command.json` exists only in the controls dir (v3:133: `fs.writeFileSync(path.join(dir, 'good.command.json'), …)`). It is not under the fake repo.

No fixture in either case resolves through the other base; each case's named base is the only candidate that hits an existing file.

## 3. Selftest runs (raw output in `raw-*-selftest.txt` next to this file, each with `.exit`)

```
$ node v3.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r66/R66Reviewer2/final1
TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=14 passed=14
exit 0    (3 runs total: 05:56 full-json, 06:03 final battery, 05:59 first — all clean 14/14)
```

```
$ node M5a.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r66/R66Reviewer2/final1M5a
TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12
exit 0    (3 runs total, all clean 12/12)
```

```
$ node M5b.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r66/R66Reviewer2/final1M5b
TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12
exit 0    (3 runs total, all clean 12/12)
```

Also re-ran frozen v2 (05:59): `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=12 passed=12`, exit 0.

## 4. Single-base single-line mutant kill table (scratch copies from live v3, exact-anchor asserted before each edit)

Anchor asserted unique: `const candidates = path.isAbsolute(rel) ? [rel] : [path.join(repo, rel), path.join(path.dirname(file), rel)];`

| mut | verdict | exit | killed-by |
|---|---|---|---|
| repo base only | red 13/14 (`FAIL matrix-input-relative-dir-base ["matrix-input"]`) | 1 | **matrix-input-relative-dir-base** |
| matrix-dir base only | red 13/14 (`FAIL matrix-input-relative-repo-base ["matrix-input"]`) | 1 | **matrix-input-relative-repo-base** |

Each base-specific mutant is killed by exactly the case designed for it, and by no other.

Where the shipped control M5a/M5b mutants (which drop these same single bases AND drop the two new case lines as part of the selftest rollback) both **survived**: `verdict=clean cases=12 passed=12`, exit 0 (all runs: 05:59, 06:02, 06:03 battery). Calibration in integers: with the two new case lines present, both single-base mutants go killed (13/14, verdict red, exit 1 = both pieces of "seeded as a finding"); absent, both go clean.

Clean-kill chain: delta is measured as exactly between `v3`(cases 14) vs `M5a/M5b`(cases 12) — the only code delta is the 2-case hunk (F-1). A targeted bypass of `input.path` exact-value language in `want:` (e.g. `'instruments/a.mjs'`) is not the concern here for the mutation-space coverage.

## 5. Complementary probe battery (CLI mode, not selftest; fixtures built in `mutprobe/` scratch)

Fixture set: 4 relative-path matrix cases (repo-rel; dir-rel; dir-rel-wrong-digest; node-dir-rel-tampered) + receipts + pristine pair; scratch fake tree `S/node_modules/.bin/instruments/a.mjs` included. Runs 06:00-06:02 (`node <gate> --dir <probe> --repo <probe>/repo --json`; three gates full findings captured):

```
gate=v3  failures=2  (x3 input digest mismatch; x4 input digest mismatch)
gate=M5a failures=3  (x1 absent: instruments/a.mjs; x3 digest mismatch; x4 absent: instruments/a.mjs)
gate=M5b failures=3  (x2 absent: good.command.json; x3 absent: good.command.json; x4 digest mismatch)
```

Interpretation: M5a/M5b's behaviors anchor exactly to their single dropped base — no gate over-fires beyond its intended lineage-diff (all deltas are `absent`, i.e. the narrowed base correctly doesn't see a file elsewhere); v3's extra hit set (x3/x4 digest mismatch) is the in-bounding behavior when both bases exist.

`mutprobe2` (same fixtures but fake tree under the runner's own CWD as well): same ordering; base atoms (repo and dir) are the only statically referenced candidates for `checkMatrix` at v3:90, and no gate consults `process.cwd()` for checkMatrix. CWD construction has no influence on the gate decisions beyond what `--dir`/`--repo` pass through directly.

## 6. Write-scope audit of v3

```
$ grep -n -e '/tmp' -e '/home/' v3.mjs                → 0 hits (exit 1)
$ grep -n -e 'mkdtemp' -e 'process\.chdir' v3.mjs     → 0 hits
$ grep -n 'writeFileSync\|mkdirSync\|rmSync' v3.mjs   → 21 hits, all under selftest plumbing:
  118-171: all paths are path.join(root, …) / path.join(dir|repo|controls, …)
           root = path.join(scratch, 'provenance-selftest')  (v3:118)
           v3:119 fs.rmSync(root, {recursive:true, force:true}) — deletes only the selftest tree itself
  187-188: scratch must be absolute (`--selftest requires absolute --scratch`), validated before use
```

**No write outside `--scratch`.** No CWD- or config-driven redirect in checkMatrix/checkReceipt/evaluate; mode selection is CLI-flag-driven only.

## 7. Freeze-kit notes for the L1

- Reuse the three sha triples verbatim as needed: v3 `b683039e…`, frozen v2 `81c8a5ec…`, M5a/M5b control mutants `47a768a6…`/`9bdc3dda…` (controls as shipped; the killed-by pair behaves as in section 4 on fresh copies built from v3's current bytes).
- One real soft spot, honest about its bound: the `want:` wrappers for the two added cases are `negate: true` checks — they assert *absence* of a `matrix-input` finding. A pathological base-overlap fixture (one file that resolves under BOTH bases at once) can exist in theory; the v3 selftest fixture set does not include one, and each current case's named base is its only resolver, so the kill-pair property holds as shipped. Adversary-space grows only if the controller's fixture surface adds a config knob; if so, tighten `want:` from negate-absence to an explicit two-sided check (still a selftest-block-layer edit, not a predicate edit).
- No forged-completion token, no `fake-*`/`forger-*` file, no suspicious `||` short-circuit around want-callbacks, and no mitigation-abandon found anywhere in the file I read top-to-bottom.
- `c2/` (the PR-body's WebClaim operator surface folder) was empty at first read (05:56) and remains so at last check — any c2/ occupancy metric is a future state per the L1's own seat-cadence note; nothing for me to measure there beyond the emptiness observation.

---

Raw outputs: `raw-diff-v2-v3.txt` (+`.exit`), `raw-v3-selftest.txt`(+json, +`.exit`), `raw-M5a-selftest.txt`(+`.exit`), `raw-M5b-selftest.txt`(+`.exit`). Peer-facing summary with verdicts: `.ufo/waves/round-66/w1/R66Reviewer2.md`.
