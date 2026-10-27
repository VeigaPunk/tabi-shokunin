# ExecPinsBinding — B1 binding-depth receipt (tabi round 37, wave w1)

seat: `ExecPinsBinding` · role: executor · milestone: claims · axes: adjacency, operability
lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
freeze commit (frozen bytes): `99437d29de036415a9f2d0524343617a3b19988a`
measured REV (lane master): `f76da094f0ff0ad9856d2232858241e3f7841379`
node: `v24.21.0` · git: `2.56.0` · date: 2026-10-27

**Question.** (1) Does the frozen v5 delta-pins digest check read the blob **AT REV**, or the
worktree file? (2) Is v3's `refs/replace` refusal about the clone's **STATE**, or about a
tree change?

**Answer.** (1) The blob **AT REV** — proven in both directions: a worktree-only rewrite is
invisible (byte-identical output), and a committed rewrite is refused with the *commit's*
digest even when the worktree holds the frozen bytes. (2) The clone **STATE** — v3 refuses a
clone whose only change is a ref in its git dir; tree oid, `ls-tree -r` digest, HEAD and
worktree status are all byte-identical before and after.

**Verdict: ok.** Both frozen binding claims hold; nothing in this seat's measurements
contradicts C1's or C2's targets, and no instrument byte was touched.

---

## Files in this seat

| file | what |
|---|---|
| `.ufo/waves/round-37/w1/ExecPinsBinding/report.md` | this report (identical copy at `.ufo/waves/round-37/w1/ExecPinsBinding.md`) |
| `.ufo/waves/round-37/w1/ExecPinsBinding/counters/` | the two frozen counters, extracted byte-exact from the freeze commit |
| `.ufo/waves/round-37/w1/ExecPinsBinding/evidence/*.out`, `*.exit` | each leg's verbatim stdout+stderr and its exit code |
| `.ufo/waves/round-37/w1/ExecPinsBinding/evidence/all-legs.log` | the full transcript of all legs in order |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-all.sh` | canonical driver: runs every leg, writes the evidence |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-binding-depth.sh` | C1 (v5) legs + C2 (v3) legs |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-v3c-state-vs-tree.sh` | C2 graft-liveness + state-vs-tree proof |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-v5-replace-ref.sh` | C1 graft leg |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-custom-replace-namespace.sh` | non-default `GIT_REPLACE_REF_BASE` falsifier |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-layer-attribution.sh` | which layer defeats a graft; tree-identity measurement |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-config-knob-falsifier.sh` | can a repo-local config move the replace namespace? |
| `.ufo/waves/round-37/w1/ExecPinsBinding/run-clone-inheritance.sh` | does `git clone` inherit `refs/replace/` from its source? |

Counter bytes used (extracted from `99437d29de036415a9f2d0524343617a3b19988a`, digests
match `claims.json.frozenDigests` exactly):

```
9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c  c1-adjacency-sweep-v5.mjs
eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019  c2-firefox-bidi-v3.mjs
```

All fixture clones were `git clone --shared` of the lane under the seat scratch root
`/fast/scratch/hyaku/tabi-r37/w1/ExecPinsBinding/` (removed on exit); each fixture's
`git -C "$D" rev-parse --show-toplevel` was asserted equal to `$D` before its first commit.
The lane and every sibling repo were read-only; no git/jj mutation was run in any repo
outside the scratch root.

---

## 1 — C1 (v5): the digest check reads the blob AT REV

The implementation under test (`c1-adjacency-sweep-v5.mjs`):

```
385:  const pinsBuf = blob(lane, REV, DELTA_PINS_PATH);        // blob() == git show REV:path
388:  const pinsDigest = sha256(pinsBuf);
389:  if (pinsDigest !== DELTA_PINS_SHA256) throw new Refusal(`… at ${REV} sha256 ${pinsDigest} != frozen ${DELTA_PINS_SHA256}`);
```

`DELTA_PINS_SHA256 = 810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655`,
which is the sha256 of the pins blob at `master` (recomputed independently: same value).

### The fixture

The rewrite is the **frozen control's own recipe** (`run-controls.sh:46`:
`json.dumps(dict(sorted(d.items())), indent=1) + '\n'`) — keys sorted, indent 1. It is a
**semantic twin** (parsed JSON equal: verified `orig == rew` → `True`) with **different
bytes** (1109 → 1110 bytes; sha256 `81019362…` → `ef7ca6ac…`). My independently built
fixture produced the *same* digest `ef7ca6ac01605cd9e24116ae948bea7f29ea3ebf4ef78a2149e4bace259f7c4`
that the frozen control receipt `baseline/c1r37-J1-pins-reorder-v5.json` quotes
(`sha256 ef7ca…`) — independent corroboration of the control fixture.

### Legs and results

| leg | state | exit | outcome |
|---|---|---|---|
| **V5-L** | literal `--rev master` | **2** | `revision must be 40-hex: master` (see §5) |
| **V5-0** | clean clone at `master` | **0** | predicate **true**; `deltaPinsSha256 = 81019362…` |
| **V5-1** | **worktree** pins rewritten, **uncommitted** | **0** | predicate **true**; `deltaPinsSha256 = 81019362…`; output **byte-identical to V5-0** (sha256 `8996fd71…`) |
| **V5-2** | same rewrite **committed**; run at the new commit | **2** | digest refusal, quoting `sha256 ef7ca6ac… != frozen 81019362…` |
| **V5-3** | branch tip moved to the rewritten commit; run at the **old** commit | **0** | predicate **true**; output **byte-identical to V5-0** |
| **V5-4** | worktree restored to the **frozen** bytes; run at the rewritten commit | **2** | refusal **still** quotes `sha256 ef7ca6ac…` — i.e. the *commit's* bytes, not the worktree's |
| **V5-E** | replace ref grafting the pins blob (default namespace) | **0** | predicate **true**; `deltaPinsSha256 = 81019362…` (graft inert) |
| **V5-F** | replace ref grafting the pins blob (custom `GIT_REPLACE_REF_BASE`) | **0** | predicate **true**; `deltaPinsSha256 = 81019362…` (graft inert) |

Full predicate fields, identical across V5-0 / V5-1 / V5-3 / V5-E / V5-F:
`adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`;
`completeness.unaccounted 0`; `drift.total 307`, `drift.auditCoverage 307`,
`drift.auditFindings 0`, `drift.staleFindings 0`; `delta.unaccounted 0`,
`delta.screenFindings 0`; `deltaPinsSha256 81019362…`.

### Reading

- **V5-1** — the worktree file's bytes differ from the blob at REV, yet the counter
  measured `81019362…` and produced output byte-identical to the clean run. A worktree-only
  rewrite is **invisible** to the digest check.
- **V5-2** — the same bytes, committed, are **refused** (exit 2). So the check is not
  vacuous: unfrozen pins bytes at REV are caught.
- **V5-3** — with the branch tip on the rewritten commit, running at the *old* commit
  still returns the honest, byte-identical result. The binding is to **the named REV**, not
  to the tip and not to the worktree.
- **V5-4** is the decisive leg: the worktree was put back to the **frozen** bytes
  (`git checkout $M1 -- $PINS`) while the counter was pointed at the **rewritten** commit.
  The refusal still quotes `ef7ca6ac…` — the committed blob's digest. A counter reading the
  worktree would have quoted `81019362…` and passed. It did not. **The digest is computed
  over the blob at REV.**

---

## 2 — C2 (v3): the replace-ref refusal is about the clone STATE

The implementation under test (`c2-firefox-bidi-v3.mjs`):

```
123: function replaceRefs(repo) { … git(repo, ['for-each-ref', '--format=%(refname)', 'refs/replace/']) … }
526: const rrf = replaceRefs(repo);
528: if (rrf.length) throw new Refusal(`refs/replace present in measured clone (${rrf.join(', ')}); refusing`);
```

### Legs and results

| leg | state | exit | outcome |
|---|---|---|---|
| **V3-L** | literal `--rev master` | **2** | `revision must be 40-hex: master` (see §5) |
| **V3-A** | clean clone at `master` | **0** | predicate **true**; admitted 16, failing 0, survivors 0, egress 0, `receiptFinding null`, `binding null`; live Firefox 158.0.1 / geckodriver 0.37.1, `egress.nonLoopback 0` |
| **V3-B** | `refs/replace/88f73cf2…` added to the clone's **git dir only** — no commit, tree unchanged, worktree clean | **2** | `refs/replace present in measured clone (refs/replace/88f73cf28e07795427af90edc7e671981d0384a7); refusing` |
| **V3-C** | graft liveness on the same clone | — | `git show <rev>:<receipt>` → **forged** `e2ee0173…`; `GIT_NO_REPLACE_OBJECTS=1 git show` → **honest** `58d5142c…`; lane's committed receipt blob = `58d5142c…` |
| **V3-D** | same clone, replace ref **removed** | **0** | predicate **true** again; admitted 16, failing 0, survivors 0, egress 0 |
| **V3-F** | replace ref under a custom `GIT_REPLACE_REF_BASE` | **0** | predicate **true**; admitted 16, failing 0, survivors 0, egress 0, `receiptFinding null` |

### The state-vs-tree measurement (V3-C driver, `run-v3c-state-vs-tree.sh`)

Before and after adding `refs/replace/88f73cf2… -> fb56bef3…` to the clone's git dir:

```
tree at master : 0c408589e0b0831dba858aa4419a90cc0e14261f  (identical=YES)
ls-tree -r digest: 46902e04f0e6a7501413642f6698c0b28ade5696c15ce62bb4b2f2a3e734df91  (identical=YES)
HEAD           : f76da094f0ff0ad9856d2232858241e3f7841379  (identical=YES)
worktree status: [] before, [] after
replace refs   : []  ->  [refs/replace/88f73cf28e07795427af90edc7e671981d0384a7]
```

**Only the ref state changed.** No commit, no tree object, no worktree byte.

### Reading

- **V3-C** proves the graft was **live**: an ordinary `git show` in that clone returned the
  forged receipt bytes (`e2ee0173…`) while the committed blob is `58d5142c…`. Under the old
  v2 this graft is exactly the attack that rode through (frozen control
  `baseline/c2r37-J1-replace-ref-v2.json`: exit 0, predicate true).
- **V3-B** — v3 refused that clone (exit 2) even though **no tree object changed** and the
  worktree was clean. The refusal is keyed on the clone's **ref state**, not on a tree
  difference.
- **V3-D** — removing only the ref (nothing else) restores exit 0 / predicate true. So the
  refusal is caused by the ref state *alone*, and it is reversible, i.e. it is a state
  check rather than a content coincidence.

---

## 3 — Falsifiers I ran beyond the assignment

These were cheap and ran against the same frozen bytes; all are in `evidence/all-legs.log`.

**F1 — which layer defeats a graft (`run-layer-attribution.sh`).** With a pins-blob graft:

```
a) default namespace refs/replace/, plain git show            -> df6f895c…  (graft honoured)
b) default namespace, GIT_NO_REPLACE_OBJECTS=1 git show       -> 81019362…  (honest)
c) custom namespace, base=refs/evil-replace/, git show        -> df6f895c…  (graft honoured)
d) custom namespace, base=refs/evil-replace/, GIT_NO_REPLACE_OBJECTS=1 -> 81019362…  (honest)
e) custom namespace, base UNSET (the counter's env)           -> 81019362…  (honest)
```

Both counters build their git env **from scratch** (v5:134, v3:121 —
`PATH/HOME/TMPDIR/GIT_CONFIG_NOSYSTEM/GIT_CONFIG_GLOBAL/LC_ALL` + `GIT_NO_REPLACE_OBJECTS=1`,
never spreading `process.env`), so a caller's `GIT_REPLACE_REF_BASE` cannot reach them, and
`GIT_NO_REPLACE_OBJECTS=1` disables replacement anyway. Two independent layers; either
alone suffices.

**F2 — can a repo-local config move the replace namespace?** (`run-config-knob-falsifier.sh`)
`core.replaceRefs`, `core.replaceRefBase`, `replace.refBase` are **all unset and inert**:
git 2.56.0's own config list exposes only `core.useReplaceRefs`, and setting
`core.replaceRefs=refs/evil-replace` had **no effect** (git read the honest blob
`81019362…`). `GIT_REPLACE_REF_BASE` (env) is the only override git honours.

**F3 — does `git clone` inherit `refs/replace/` from its source?** (`run-clone-inheritance.sh`)
**No**, for both plain and `--shared` clones: the clone's replace-ref list is `[]` and
`git show` returns the honest bytes. A graft planted in the *source* lane therefore cannot
reach the measured clone that `measure.sh` creates.

**F4 — the lane's own gate is replace-proof too.** v5 spawns the adjacency gate with
`env: ENV` (v5:274) and **`ENV` lacks `GIT_NO_REPLACE_OBJECTS`** — but the gate does not
inherit it: `scripts/check-adjacency.mjs:297-301` builds its own `minimalEnv()` containing
`GIT_NO_REPLACE_OBJECTS: '1'`, `GIT_GRAFT_FILE: '/dev/null'`, `GIT_NO_LAZY_FETCH: '1'`,
`GIT_LITERAL_PATHSPECS: '1'`. So the gate's own git reads cannot be laundered either.
*(Static code reading — the empirical probe for a graft reaching the gate was **not run**;
see §6.)*

---

## 4 — Corpus / control cross-checks

- My V5-2/V5-4 fixture reproduces the **frozen control's** fixture byte-for-byte: the
  frozen receipt `baseline/c1r37-J1-pins-reorder-v5.json` quotes `sha256 ef7ca` and my
  independent build produces `ef7ca6ac…`. Same refusal shape, same exit 2.
- My V3-B/V3-C replace-ref fixture reproduces the frozen control
  `baseline/c2r37-J1-replace-ref-v3.json` refusal verbatim in shape:
  `refs/replace present in measured clone (refs/replace/88f73cf2…); refusing` (the frozen
  receipt quotes the same object id `88f73cf2…`).
- V3-A is the honest floor at `master` and matches the shape of the frozen control
  `baseline/c2r37-J3-honest-v3.json` (admitted 16, survivors 0, egress 0) — but note that
  control was measured at `ed8ccfc0…`, whereas V3-A is measured at `master`
  `f76da094…`; the two are independent runs of the same frozen v3.
- `claims.json` frozen digests: `c1 = 9c6289b7…752c` and `c2 = eda339eb…e019` — both match
  the counter bytes I ran.

---

## 5 — Operability note (not a defect): `--rev master` is refused

The assignment's phrasing "run the frozen v5 with `--rev master`" does not execute as
written. Both frozen counters hard-require a **40-hex** revision:

```
v5:142  if (!/^[0-9a-f]{40}$/.test(rev)) throw new Refusal(`revision must be 40-hex: ${rev}`);
v3:129  if (!/^[0-9a-f]{40}$/.test(String(rev))) throw new Refusal(`revision must be 40-hex: ${rev}`);
```

Recorded as measured (V5-L, V3-L): both exit **2** with
`revision must be 40-hex: master`. This is **by design and consistent with the frozen
contract**, not a regression: `claims.json`'s `countingCommand` says `--rev <REV>` and the
frozen harness `measure.sh:23,40-41` resolves `full=$(git -C "$d" rev-parse HEAD)` and
passes that 40-hex. My legs therefore run at the resolved `master` sha
`f76da094f0ff0ad9856d2232858241e3f7841379`, which is what "at master" means operationally.
A reviewer typing the literal string `master` gets a clean exit-2 refusal, not a wrong
measurement.

---

## 6 — Not run (explicit)

- **Empirical probe: a replace graft reaching v5's adjacency-gate subprocess.** I
  established by code reading that the gate builds its own `minimalEnv()` with
  `GIT_NO_REPLACE_OBJECTS=1` (`scripts/check-adjacency.mjs:297-301`), so the gate's git
  reads are replace-proof; but I did **not** build and run the graft fixture for that
  specific path. The claim rests on code reading, not on a measurement.
- **`refs/replace` under `GIT_GRAFT_FILE`** (the legacy grafts file): not probed. The
  gate's `minimalEnv()` sets `GIT_GRAFT_FILE=/dev/null`; the counters do not set it, so
  this remains an untested path for the counters' own reads (their `GIT_NO_REPLACE_OBJECTS=1`
  does not disable grafts). Not exercised, therefore not claimed either way.
- **Round-37 `measure.sh` end-to-end run** — out of scope for this seat (it is the L1's
  integration step) and not run.
- No counter, claim, receipt, harness or control byte was modified by this seat.

---

## 7 — Scope and side effects

- Writes: **only** under `.ufo/waves/round-37/w1/ExecPinsBinding/` (this report, the
  extracted frozen counters, the evidence files, and the driver scripts). The scratch root
  `/fast/scratch/hyaku/tabi-r37/w1/ExecPinsBinding/` was created, used with
  `TMPDIR=$S/tmp`, and removed on exit.
- Read-only against: the lane, every sibling lane, and the fleet root. Fixture mutations
  (the pins rewrite commit, `git replace`, `git update-ref`) happened **only** in scratch
  clones whose toplevel was asserted before the first mutation.
- The lane worktree shows `LOG.md`, `SCORECARD.md` and `corpus/SOURCES.md` as modified and
  several untracked paths under `.ufo/waves/round-37/` — those are **other seats'**
  concurrent writes, not mine; I touched no lane file outside my seat directory, and
  `master`/`HEAD` remain `f76da094f0ff0ad9856d2232858241e3f7841379`.
- Tooling: no package was installed or upgraded for this seat; the environment's existing
  `node v24.21.0`, `git 2.56.0`, and the lane's pinned Firefox 158.0.1 / geckodriver 0.37.1
  (digests `a1947294…`, `46e2c204…`, `f831b7e6…` — matching v3's `PINNED_BINARIES`) were
  used as-is. No `pacman` transaction was run.

VERDICT ok — B1 binding depth confirmed on both instruments. v5's delta-pins digest check
reads the blob AT REV, not the worktree (V5-1 invisible; V5-2 committed → exit 2; V5-3
REV-anchored; V5-4 worktree-frozen/commit-unfrozen still refuses with the commit's digest).
v3's `refs/replace` refusal is keyed on the clone's ref STATE, not on a tree change (V3-B
with tree oid / `ls-tree -r` digest / HEAD / worktree all identical; V3-C graft live;
V3-D removal restores exit 0). No instrument byte was touched; no harm observed.
