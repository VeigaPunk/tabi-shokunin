VERDICT: ISSUES

# Routed defect 1 — liar-probe rebuild independence (round 17, wave 2)

Seat TabiR17.ReRunLiar (leaf). Attacked M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`.
Routed artifact: `corpus/evidence/round-17/routed/liar/**` (README, generate.mjs, blobs/, originals.bundle, receipt.json).
The routed claim itself (rebuild byte-exact, no `/tmp/tabi-r16-c1liar-93NO` dependency, counts equal the r16 file)
**holds**. Two provenance/label defects remain in the artifact (D1, D2 below) — hence ISSUES, not HOLDS.

## Attacked

1. Documented run at M, from a sandbox clone, not the lane:
   `git clone --no-hardlinks <lane> <sb>/lane && git -C <sb>/lane checkout --detach 6c97851…`,
   then `node corpus/evidence/round-17/routed/liar/generate.mjs --lane <sb>/lane --out <sb>/receipt.json`.
2. Identity reproduction: rebuilt commit/tree ids vs the hardcoded originals **and** vs `originals.bundle`
   (independent restore path, not the generator's own assertion).
3. `/tmp` independence: full file-syscall trace of the run, plus code read.
4. Count equality: hardened runs vs `corpus/evidence/round-16/measure/c1-liar-probes.json`, including
   failure strings, compared independently with `jq` (not the receipt's boolean).
5. Mutation controls: corrupted liar blob, deleted bundle.
6. Writes: whether the run touches the lane (trace + `git status`), and whether the sandbox self-cleans.

## Evidence

- Run: exit 0, `verdict=pass`, 30.5 s, stdout identical to the committed `run.stdout.txt`:
  HARDENED 1/0/0/0, PREHARDENING 1/1/0/1; temp repo `/tmp/tabi-r17-liar-HzBkdS`, `sandbox.removed: true`,
  no `/tmp/tabi-r17-liar-*` survives.
- Fresh receipt vs committed receipt, normalized by `del(.generatedAt,.laneRoot,.sandbox)`: **IDENTICAL**
  (`diff` empty). So the committed receipt is a genuine run output, not hand-edited.
- Identity: `9ecfcc91…`/tree `53332fd0…`, `0754e448…`/tree `b7d9ac92…`, `7b497d15…`/tree `e96352b6…`;
  `commitReproduced`/`treeReproduced` true for all three. Independently, `git bundle list-heads` yields
  exactly those three commits under `refs/heads/v1-full-liar`, `v2-liar-gate-real-selftest`,
  `v3-liar-selftest-real-gate`; `git bundle verify` = okay, requires `b444ca8e…`; every ref's parent is
  `b444ca8e…`; per-path blob OIDs are `0332de67…` (gate) and `ec8a1d1f…` (selftest), equal to
  `git hash-object blobs/gate.mjs blobs/selftest.mjs`. Author/committer `liar <liar@invalid>`,
  epochs 1792508273/4/5 `-0300`, messages as recorded. Commit-id equality therefore pins the *bytes* at
  both paths and every other path to BASE — byte-exact, not shape-similar.
- No `/tmp` dependency: `strace -f -e trace=%file` over the whole run (632 540 trace lines) contains
  **0** occurrences of `tabi-r16-c1liar` and **0** of the real lane root. The clone
  `/tmp/tabi-r16-c1liar-93NO` still exists (contents: `liar/`, `repo/`, `r15*.json`, `real-gate.mjs`),
  so its absence from the trace is a real independence result, not a missing-file accident. Code read
  agrees: the only references are comments (`generate.mjs:5,8`); no path string is ever opened.
- Counts equal the r16 file exactly (`jq` comparison of `exit`, `count`, and the ordered `failures` arrays):
  `b444ca8e…` exit 0/count 1/[]; `9ecfcc9` 0/4 failures; `0754e44` 0/7; `7b497d1` 0/1 — all true.
  Pre-hardening column 1/1/0/1 equals AttackC1Liar.md's table.
- Controls (checks are load-bearing, not vacuous): appending one byte to `blobs/gate.mjs` in a copy gives
  exit 1, issue `blobs/gate.mjs sha256 a1abeb20… != recorded fa1e12e1…`, plus v1/v2 commit+tree mismatches
  (`f3bea1b2…` vs `9ecfcc91…`, etc.); deleting `originals.bundle` in a copy gives exit 1,
  `originals.bundle absent`, `identityReproduced: false`.
- Lane safety: the traced run performed no `O_WRONLY`/`unlink`/`rename` under the lane clone outside
  `.git/` (all such calls land in the generator's own mkdtemp repo); `git -C <sb>/lane status --porcelain`
  empty afterwards. The three liar commits are absent objects in the lane (`git cat-file -e` → absent) and
  no `*liar*` ref exists, so the rebuild genuinely creates them.

## Defects (concrete repairs)

**D1 — `receipt.counters.preHardening.path` names a path that has never existed.**
`generate.mjs:45` sets `path: '.ufo/waves/round-16/measure-pre.mjs'`, but `generate.mjs:219` reads
`${spec.sourceRevision}:${COUNTER.path}`, i.e. `.ufo/waves/round-16/measure.mjs` at `b444ca8e`.
`git cat-file -p b444ca8e…:.ufo/waves/round-16/measure-pre.mjs` → `fatal: path ... does not exist`;
`git log --all -- .ufo/waves/round-16/measure-pre.mjs` and `git rev-list --all --objects | grep measure-pre`
are empty; the r16 clone does not contain it either. The digest is right
(`measure.mjs@b444ca8` = `bda4e18e…`, matching `AttackC1Liar.md:4`), so only the label lies — but a verifier
following the receipt's `{path, sourceRevision, sha256}` triple cannot resolve it.
Repair: record `preHardening.path = '.ufo/waves/round-16/measure.mjs'` and add
`materializedAs: '.ufo/waves/round-16/measure-pre.mjs'` (the alternate name exists only to avoid colliding
with the hardened counter in the same sandbox worktree), or keep `path` and add `sourcePath`.

**D2 — README's "no lane writes" is false for the documented invocation.**
`README.md:11-12` says `node generate.mjs` writes `receipt.json` but makes "no lane writes"; the default
`OUT` is `join(HERE, 'receipt.json')` (`generate.mjs:35`), inside the lane. Running the documented command in
a lane clone left `M corpus/evidence/round-17/routed/liar/receipt.json` (3 lines: `generatedAt`, `laneRoot`,
`sandbox.path`; in-lane only `generatedAt` + `sandbox.path` change). The w1 report
(`.ufo/waves/round-17/w1/RoutedLiar.md:30`) runs exactly that command.
Repair: word it "rewrites its own `receipt.json` in place; writes nothing else in the lane", or default
`OUT` into the generated sandbox and require an explicit `--out` to update the committed receipt.

## Notes (not defects)

- The receipt is not byte-stable by construction (`generatedAt`, sandbox path). Nothing in the repo pins its
  bytes, so no gate breaks today; a future byte pin would.
- The counter still executes revision scripts unsandboxed (documented limit, unchanged by this artifact).
- Pre-hardening runs report `counterBlobAtRevisionSha256: bda4e18e…` because the measured revisions sit on
  `b444ca8`; the receipt records the judging counter separately — correct, and worth keeping.
- I did not run the lane's round-17 gates (out of this seat's scope).

Files written: `.ufo/waves/round-17/w2/ReRunLiar.md` (this report). No tool installs; no
jj/git writes in the lane; sandbox `/tmp/tabi-r17w2-ReRunLiar-ExXm` removed after the run.
