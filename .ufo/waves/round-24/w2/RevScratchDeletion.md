# RevScratchDeletion — M5 (round-23 scratch over-commit) falsification, wave 2

Lane tip under review: `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (== `master`, verified
`git rev-parse master HEAD` → identical). Baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`.
Method: re-run, re-read, clone-level experiments in `.ufo/waves/round-24/scratch/RevScratchDeletion/`.
No tracked repo file touched; read-only git only on the lane (`log/show/ls-tree/grep/cat-file/rev-parse/merge-base`).

## Verdict: PARTIAL — the closure is real but overstated

0 committed round-23 scratch paths at tip **confirmed**; every *committed* citation still resolves
**confirmed**; the ignore rule causally prevents the *observed* over-commit shape **confirmed** —
but the deletion commit is not "only D records for that prefix" (one undisclosed out-of-prefix
deletion) and the blanket claim "every round-23 document that cites a scratch path still resolves
via `git show 573c99e:<path>`" (LOG.md:1770-1771; corpus/lessons/round-24.md:74) is falsified by
four paths that were never in git at `573c99e` at all.

## Confirmed (the claim's core holds)

1. **Tip count.** `git -C <lane> ls-tree -r master .ufo/waves/round-23/scratch | wc -l` → `0`.
   All-rounds sweep: `git ls-tree -r --name-only master .ufo/waves | grep -c '/scratch/'` → `0`
   (no other round still carries committed scratch).
2. **Deletion commit.** `9e52cb23bb28b2cef172429b1452367f41ae27fc`, parent `2d76938`, subject
   "round-24: remove the round-23 scratch over-commit (M5, routed defect 3): 1,034 committed
   scratch paths deleted; bytes stay readable at 573c99e". `git show --name-status` → 1035 records,
   all `D`; 1034 under `.ufo/waves/round-23/scratch/`; parent set `2d76938` and baseline set
   `573c99e` are byte-identical (`diff` of the two `ls-tree -r --name-only` listings → no output).
   Sum of deleted blob sizes: 26,999,535 B = 25.75 MiB (matches "25.7 MB"; the extra file is 0 B).
3. **Ignore rule lands before deletion.** `.gitignore:5` `.ufo/waves/*/scratch/` added in `2d76938`
   ("round-24: ignore seat scratch structurally (M5 captured-by)"), i.e. before the cleanup commit.
4. **Counterfactual (the strong one).** Fresh clone `scratch/RevScratchDeletion/clone2`, checked
   out at `a89f1935` (parent of `03c1b4d`, the first scratch-adding commit), tip `.gitignore`
   copied in, all 1,034 baseline scratch blobs materialized via `git archive 573c99e
   .ufo/waves/round-23/scratch | tar -x`. `find` → 1034 files; `git add -A` → **0 paths staged
   under the prefix** (only `.gitignore` itself). The rule would have prevented the exact
   over-commit shape that occurred.
5. **Discovery vectors at tip.** In the clone at `ad125e8`: files at
   `.ufo/waves/round-24/scratch/Probe/a.txt` and `.ufo/waves/round-23/scratch/Probe/b.txt` are
   ignored by `.gitignore:5` (`git check-ignore -v`); `git status --porcelain` silent for them;
   explicit `git add <ignored path>` refuses (rc 1, "Use -f"). `git add -A` stages neither.
6. **Citation resolution — sample of 12 exact paths** (task asked ≥8), all `git show
   573c99e:<path>` readable, sizes and first-16-sha256 recorded:
   `SrcS102/rfc6265bis-13.txt` 146,976 B `06223931…`; `SrcS103/owasp-csrf.html` 157,809 B
   `6f32bfbf…`; `SrcS103/owasp-csrf.txt` 50,111 B `59ea36d6…`; `W2InMemory/pristine.mjs` 41,513 B
   **`6eeaeda730b32214…`** (matches the auditor sha `6eeaeda7…` cited verbatim in
   `w2/W2InMemory.md:46` — content-identical recovery, not just path presence); `W2InMemory/mutA.mjs`
   41,504 B `8690e24a…`; `W2Cls6/m4-bogus.md` 14,893 B `7ce60c24…`; `W2EvRepair/report-c6-bogus.md`
   15,014 B `6d7aaa4c…`; `MutClassFalsifiers/audit.mjs` 8,640 B `0759d481…`;
   `ExecBlobReader/read-at-rev.mjs` 2,621 B `6c6aab6c…`; `CritControl/skipwork-roundkeyed.mjs`
   1,050 B `78ca6c03…`; `ScribeGate/audit-round22.json` 5,335 B `425d0c3f…`;
   `W2Simplifier/simplified-3.mjs` 46,404 B `b1e1b0d0…`. Content spot-check: rfc6265bis-13.txt is
   3,696 lines and `sed -n '2813,2828p'` reproduces exactly the §8.8.1 "Defense in depth" window
   `W2Cheat.md:46` describes (quote ends 2824, 2825-2828 the uncited paragraph).
7. **Full sweep.** A scripted sweep (`.ufo/waves/round-24/scratch/RevScratchDeletion/resolve.mjs`,
   `bare.mjs`) over every committed document citing the prefix — round-23 `w1/`, `w2/`, wave
   dispatch/spec JSON, round-24 `w1/` reports, LOG.md, corpus/lessons — found 55 prefixed tokens
   (33 blobs + 20 trees + 2 missing) and 43 bare `scratch/…` tokens (24 blobs + 11 trees + 8
   missing). Every resolved blob and tree is present at `573c99e`. **Zero deletion-induced
   breakage**: no cited path was lost by `9e52cb2` that existed at `573c99e` — the deleted set is
   exactly the baseline set.

## Findings

**F1 (medium) — the deletion commit is not clean-as-claimed.** `git show --name-status --format=
9e52cb2 | awk '$1!="D"'` → empty (all D), but `awk '$2 !~ /^\.ufo\/waves\/round-23\/scratch\//'`
→ `D .ufo/waves/round-23/w2-record.err` (0 B at both `2d76938` and `573c99e`). So the commit
contains 1,035 deletions, one outside the declared prefix, and neither the commit message
("1,034 committed scratch paths deleted"), LOG.md:1770 ("1,034 committed scratch paths deleted in
one commit"), nor corpus/lessons/round-24.md:75 discloses it. The file is a committed 0-byte
stderr capture cited in `w2/W2CorrRegistry.md:19` ("`w1-record.err`/`w2-record.err` both 0 B") —
a citation that still resolves at `573c99e`, so the recovery route covers it — and `CritNoHarm.md`
called the `.err` captures "throwaway", so the deletion is substantively defensible; the defect is
that it is *out of the stated scope and uncounted*, and the wave-1 plan (DistillW1.md:67) scoped
the commit to "delete the remaining ~976 paths" / exclude non-scratch material. Classification:
observation (undisclosed out-of-prefix deletion, byte-neutral).

**F2 (medium) — the blanket resolution claim is falsified as stated.** "every round-23 document
that cites a scratch path still resolves — the bytes are readable at `573c99e`"
(corpus/lessons/round-24.md:73-75; LOG.md:1770-1771) fails for these cited paths, none of which
exist in *any* commit on `master` (`git log --all --diff-filter=A -- <path>` → empty; `git
cat-file -t 573c99e:<path>` → fatal):

| Cited path | Citer | Why unresolvable |
|---|---|---|
| `.ufo/waves/round-23/scratch/W2C2Counter/{repo2..repo5}` (dir + `repo2`, `repo5`) | `w2/W2C2Counter.md:23,70`; `w2/W2Prune.md` | working-tree clone fixtures, deliberately never committed (self-disclosed "`git ls-files …` → empty") |
| `.ufo/waves/round-23/scratch/W2Determinism/clone` (+ `clone/scripts/check-sources.mjs`) | `w2/W2Determinism.md:7,26-28`; `w2/W2Secrets.md`; `w2/W2Prune.md` | live scratch clone with embedded `.git`; never committed |
| `.ufo/waves/round-23/scratch/W2Prune/manifest.tsv` | `w2/W2LandedCites.md:32` | exists only in the **off-master** jj working copy `1dfff43` (`merge-base --is-ancestor` rc=1); resolves there, never in master's history |
| `.ufo/waves/round-23/scratch/ExecNoHarmGuard/empty` | `w1/ExecNoHarmGuard.md:49` | an empty directory (git cannot store it) used as a `--root` value; trivially recreatable |

The failure is **pre-existing and self-disclosed** in the round-23 reports — it is not damage from
the deletion. But the round-24 claim is stated absolutely ("every round-23 document that cites a
scratch path"), and it is wrong: those documents' citations were never `git show`-resolvable, so
"still resolve" describes a state that never existed for them. An honest wording would have been
"every cited path that was committed still resolves at 573c99e" — which is what I verified to hold.
Inference: the wave-1 census (ExecScratchCensus) counted only committed cited files ("58
exact-cited files"), so the claim was calibrated to the committed set but written universally.

**F3 (low) — the guard is one level deep and discovery-only.** `.ufo/waves/*/scratch/` matches
`<wave>/scratch/` exactly one path level. Verified in the clone: a file at
`.ufo/waves/round-24/w2/scratch/Probe/c.txt` is **not ignored** (`git check-ignore` rc=1) and was
**staged by `git add -A`** — the same over-commit shape recurs if any seat uses a scratch dir at
any deeper nesting (e.g. per-wave-subdir `w2/scratch/`, or `scratch/` nested under a fixture
tree). A regular *file* at `.ufo/waves/<round>/scratch` also escapes (trailing `/` matches
directories only; `git check-ignore` rc=1). And `.gitignore` cannot prevent re-add at all:
`git checkout 573c99e -- .ufo/waves/round-23/scratch` in the clone staged **all 1,034** deleted
paths into the index in one command (rc 0, `git diff --cached --name-only | wc -l` → 1034), and
`git add -f` bypasses trivially. The commit message's "this rule does" [prevent recurrence] is
true for the observed class (untracked one-level-deep seat dirs discovered by bulk add) and
silently false for explicit restore, force-add, deeper nesting, or a bare `scratch` file. Residual
risk: a seat that documents a scratch fixture under `w2/` or restores the tree via rev-checkout
re-creates M5 with the guard green. Suggested tightening (report only): `.ufo/waves/**/scratch/`
plus a tracked-commit gate check, or accept the residual in the lesson's open items.

**F4 (low, pre-existing) — executable citations are dead pointers.** `gen-w1.mjs`/`gen-w2.mjs`
(mode 100755, still executable) and the wave dispatch/spec JSON embed `.ufo/waves/round-23/scratch/`
paths that no longer exist at tip; running them or re-running verbatim commands from the w1/w2
reports fails on absent working-tree paths. `RevScratchCleanup.md` anticipated this ("deleting the
artifact … still strands the verbatim command") — the lesson's chosen answer is `git show
573c99e`, which recovers bytes but not executability. No claim was made that commands remain
runnable; noted so the honest scope of "resolves" is bytes-only.

## Non-findings (checked, hold)

- The 868 figure in `corpus/lessons/round-23.md:191` is explicitly superseded by 1,034 in the same
  paragraph — not a defect.
- The round-23 rule "`git show --name-only … | grep -c '^\.ufo/waves/round-23/scratch/'` must be 0"
  would fail on the cleanup commit itself — known trap, already flagged by DistillW1.md:67.
- "25.7 MB" checks out (26,999,535 B); "1,034" is the correct scratch count (the 1,035th is F1).
- `.ufo/interactive-sessions/` ignore predates and is untouched; the rule is anchored,
  non-negated, last-match (no earlier rule resurrects scratch).
- Two truncation artifacts in the bare sweep (`scratch/CritDeterminism/proof` ← `proof.sh`;
  `scratch/W2InMemory/mut` ← `mutA.mjs`) resolve once the regex boundary is expanded; the brace
  expansion `probe-c3{,-b,-c}.mjs` resolves to three real blobs. No additional unresolvable
  citations beyond F2's table.
- TMPDIR was not needed for the git experiments; clone work used
  `.ufo/waves/round-24/scratch/RevScratchDeletion/{clone,clone2}` (lane read-only, clones are
  throwaway fixtures). `export TMPDIR=/home/vgpnk/tmp-tabi24` was set for all node/git runs.

## Residual risk / verification gaps

- Untested: whether jj working-copy metadata (`1dfff43`, off-master) or the fleet repo keeps the
  deleted blobs referenced — jj objects exist in the repo (`git cat-file -t 1dfff43` → commit) but
  are not ancestors of master; a `git gc` on this repo would prune them and the manifest pointer.
- Untested: the 13 untracked embedded `.git` clone dirs the wave-1 plan excluded — they live
  only in working trees; the ignore rule now also hides them from `git status` (ignored, not
  shown), so an embedded credential in a seat clone would now be *invisible* to status sweeps —
  a minor observability trade-off the guard introduces. W2Secrets' host-mutation rg sweep covered
  them when they were visible.
- The m3-class counters and gate rows are other seats' scopes; nothing here conflicts.

**Report:** `.ufo/waves/round-24/w2/RevScratchDeletion.md`
