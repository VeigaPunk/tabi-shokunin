# MutC2Blob — mutation: remove the `requireBlob` type gate (treat any existing object as blob)

Seat: `MutC2Blob` · Round 43, attempt 1, wave 1 · Lane: `tabi-shokunin`
Target clause: **C2 (calibration)** — the round-43 routed-defects checker's r1 blob-type gate
(`git cat-file -t`, S151) as materialized by `requireBlob()`.
Judged axis: calibration.

## 1. Method

Frozen bytes were **copied** to scratch and mutated there. No lane byte was edited.

```
S=/fast/scratch/hyaku/tabi-r43/MutC2Blob
mkdir -p $S/work
cp .ufo/waves/round-43/counters/check-routed-defects-round43.mjs $S/checker-pristine.mjs
cp .ufo/waves/round-43/counters/check-routed-defects-round43.mjs $S/checker-mutated.mjs
cp .ufo/waves/round-43/fixtures/tree-vs-blob.mjs               $S/tree-vs-blob.mjs
```

Pre-mutation digests (identical copies):

```
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  $S/checker-pristine.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  $S/checker-mutated.mjs
7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  $S/tree-vs-blob.mjs
```

### Mutation (exactly one behavior-bearing edit)

`$S/checker-mutated.mjs`, function `requireBlob` — the object-type check is deleted so that any
object that exists at the path (tree, commit/gitlink, …) is treated as a blob. The existence check
(`t === null` → `-absent`) is deliberately kept, so the mutation isolates the *type* gate only.

```diff
--- checker-pristine.mjs
+++ checker-mutated.mjs
@@ -76,7 +76,8 @@
 function requireBlob(id, p) {
   const t = gitObjectType(p);
   if (t === null) { add(`${id}-absent`, `${p} not committed at REV`); return false; }
-  if (t !== 'blob') { add(`${id}-not-a-blob`, `${p} resolves to object type '${t}', frozen sentence requires blob`); return false; }
+  // MUTATION (MutC2Blob): the object-type gate is removed — any existing
+  // object (tree, commit, ...) is treated as a blob.
   return true;
 }
```

Full diff: `evidence/mutation.diff` (sha256 `7bf83afc1b4d411b5288f711b6f782473bd9db211b4176eeae69a7669e8dc3c5`).
Mutated copy digest: `6b9b9833d0dcaaa1dacb6a3774998df0b79e168378365d1b9afece27e466b8e0`.

## 2. Probe A — the committed tree fixture (the seat's specified control)

The committed fixture `.ufo/waves/round-43/fixtures/tree-vs-blob.mjs` was run unmodified from scratch
(it builds the tree-object fixture repo and invokes the checker bytes).

```
cd /fast/scratch/hyaku/tabi-r43/MutC2Blob
node tree-vs-blob.mjs --out $S/fixture-pristine.json --work $S/work
```

```
exit=0
{"schema":"tabi-r43-c2-tree-fixture","fixtureRev":"482e439ba837182a9fae92a084acdd7f02a4f507",
 "typeViolationNamed":true,
 "v2":{"exit":1,"findingIds":["r1-measure-blob-pin-mismatch","r1a-not-a-blob","r1b-too-small",
      "r2-sources-absent","r3-baseline-absent","r4-slice-absent","r5-claims-absent","r6-probe-absent"]},
 "r42":{"exit":1,"findingIds":["r1a-unparseable","r1b-too-small","r2-sources-absent",
      "r3-baseline-file-absent","r4-slice-absent","r4-quarantine-absent"]}}
```

Fixture repo toplevel verified before use:

```
$ git -C $S/work/tree-blob-fixture rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r43/MutC2Blob/work/tree-blob-fixture
$ git -C $S/work/tree-blob-fixture cat-file -t 482e439ba837182a9fae92a084acdd7f02a4f507:corpus/evidence/round41/playwright-egress/receipt.json
tree
```

Both checkers were then run **by hand against that same fixture rev**, from scratch:

```
node $S/checker-pristine.mjs --rev 482e439ba837182a9fae92a084acdd7f02a4f507 \
     --repo $S/work/tree-blob-fixture --json   →  exit=1
node $S/checker-mutated.mjs  --rev 482e439ba837182a9fae92a084acdd7f02a4f507 \
     --repo $S/work/tree-blob-fixture --json   →  exit=1
```

Findings (ids + details verbatim from the JSON output):

| | frozen bytes | mutated bytes |
|---|---|---|
| predicate | false | false |
| findingCount | 8 | 8 |
| `r1a` finding | **`r1a-not-a-blob` :: "…resolves to object type 'tree', frozen sentence requires blob"** | **`r1a-unparseable` :: "…does not parse as JSON"** |
| other ids | r1-measure-blob-pin-mismatch, r1b-too-small, r2-sources-absent, r3-baseline-absent, r4-slice-absent, r5-claims-absent, r6-probe-absent | same seven, unchanged |

**The named finding `r1a-not-a-blob` disappears under the mutation.** The type violation is no longer
named as a type violation; it is re-reported as a generic JSON-parse failure — exactly the r42
behaviour the r43 gate was added to close (the r42 row of the same fixture shows exactly
`r1a-unparseable`).

To make the fixture's own assertion observable end-to-end, a scratch copy of the committed fixture
was made with **only** the `R43CHECKER` path constant pointed at the mutated checker (fixture logic
otherwise untouched):

```
sed "s#const R43CHECKER = path.join(LANE, '.ufo/waves/round-43/counters/check-routed-defects-round43.mjs');#\
     const R43CHECKER = '$S/checker-mutated.mjs';#" $S/tree-vs-blob.mjs > $S/tree-vs-blob-mutated.mjs
node $S/tree-vs-blob-mutated.mjs --out $S/fixture-mutated.json --work $S/work-mut
```

```
exit=1
{"schema":"tabi-r43-c2-tree-fixture","fixtureRev":"daa9b58718f24014a8c21837cb03dfa23b4dc31f",
 "typeViolationNamed":false,          <-- was true with the frozen checker
 "v2":{"exit":1,"findingIds":["r1-measure-blob-pin-mismatch","r1a-unparseable","r1b-too-small", …]}}
```

So the committed control receipt `controls/c2-tree-fixture.json` (whose frozen
`"typeViolationNamed": true` is bound by claims.json r5) **cannot be reproduced** by the mutated
checker: the fixture's own exit code flips 0 → 1.

## 3. Probe B — the decisive kill: mutated copy GREENS where frozen bytes refuse

The mutation's severity is not that it renames a finding — it is that the type gate is the *only*
thing standing between a non-blob object at a checked path and a full green. Demonstrated with a
fixture built from the lane's own HEAD tree (exported read-only via `git archive`; the lane was
never cloned, mutated or committed to), with **one** r4 evidence path replaced by a tree object:

```
D=$(mktemp -d $S/green-XXXXXX)
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin archive HEAD | tar -x -C "$D"
git -C "$D" init -q
git -C "$D" rev-parse --show-toplevel     # → /fast/scratch/…/green-7vpOGv  (== $D, asserted)
git -C "$D" config user.email probe@fixture.local ; git -C "$D" config user.name Probe
EV=.ufo/waves/round-42/w1/QuarR4201/evidence-S102.txt
rm -f "$D/$EV" ; mkdir -p "$D/$EV"
for i in $(seq 1 12); do printf 'x%.0s' $(seq 1 40) > "$D/$EV/part-$i"; done
git -C "$D" add -A ; git -C "$D" commit -q -m "r4 evidence path replaced by a tree object"
```

```
rev=856ca7ff8c049f99d246763e316178490931ba17
type at .ufo/waves/round-42/w1/QuarR4201/evidence-S102.txt: tree  size=411
```

Checker runs against that rev:

```
node $S/checker-pristine.mjs --rev 856ca7ff… --repo "$D" --json   →  exit=1
node $S/checker-mutated.mjs  --rev 856ca7ff… --repo "$D" --json   →  exit=0
```

| | frozen bytes | mutated bytes |
|---|---|---|
| exit | **1** | **0** |
| predicate | false | **true** |
| findingCount | 1 | **0** |
| findings | `r4-ev-S102-not-a-blob :: "…resolves to object type 'tree', frozen sentence requires blob"` | *(none)* |

The mutated checker **passes** a revision in which a required r4 evidence path is a directory (tree)
rather than the committed blob. `git cat-file -s` on a tree returns the tree object's own byte size
(411 ≥ 200), so the size floor is satisfied and nothing else in the checker objects. The frozen
checker refuses the same revision. This is a full green-vs-red divergence on the same bytes.

For reference, the round-42 checker bytes on the same fixture also exit 0 / predicate true — the
mutated r43 checker reproduces the r42 hole class exactly.

## 4. Probe C — a second non-blob object type (gitlink / commit)

A second fixture put a **commit** object (mode `160000` gitlink) at the r1a receipt path:

```
type at receipt path: commit
```

| | frozen bytes | mutated bytes |
|---|---|---|
| r1a finding | `r1a-not-a-blob :: "…resolves to object type 'commit', frozen sentence requires blob"` | `r1a-too-small :: "…committed blob is 160 bytes (<1000)"` |
| exit | 1 | 1 |

Same pattern: the type violation goes unnamed and is re-reported under an unrelated finding id. Here
the size floor happens to still catch it, so the mutated copy does not green on this fixture — Probe B
is the case where it does.

## 5. Control runs on the real lane repo (mutated vs frozen, no fixture)

```
rev = ab592825cd195599822ca227f7768914df208201   (the frozen baseline)
  pristine → exit=1  predicate=false count=2  r5-claims-absent, r6-probe-absent
  mutated  → exit=1  predicate=false count=2  r5-claims-absent, r6-probe-absent      (identical)

rev = ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c   (lane HEAD, all controls committed)
  pristine → exit=0  predicate=true count=0
  mutated  → exit=0  predicate=true count=0                                          (identical)
```

The mutation is **invisible** on the lane's own history (every checked path there really is a blob);
it is visible only against a crafted revision. This is expected for a type-discipline clause and
confirms the mutation is targeted, not a general behaviour change.

## 6. Verdict

**Clause load-bearing: YES.**

Justification against the stated rule — *"the clause is load-bearing iff the mutated copy GREENS (or
loses the named finding on) input the frozen bytes refuse"* — **both** branches hold:

1. **Loses the named finding.** On the committed tree fixture (Probe A) the frozen bytes report
   `r1a-not-a-blob`; the mutated bytes do not — the finding becomes `r1a-unparseable`. The committed
   control `controls/c2-tree-fixture.json` (`"typeViolationNamed": true`, bound by claims.json r5)
   is not reproducible: the fixture's own exit code flips 0 → 1 and `typeViolationNamed` flips
   true → false.
2. **Greens.** On the HEAD-derived fixture with one r4 evidence path replaced by a tree (Probe B),
   the mutated copy exits **0** with `predicate: true` and zero findings, while the frozen bytes
   exit **1** with `r4-ev-S102-not-a-blob`.

The r1 blob-type gate is therefore the sole load-bearing defence against a non-blob object at a
checked path, and removing it restores the r42 defect class (a type violation reported as an
unrelated content complaint) and, in the r4-evidence position, admits a fully green false pass.

Scope note: this is a **mutation result**, not a request to change the contract. The frozen bytes are
correct as written; the finding is that the clause is load-bearing and therefore must not be
relaxed. No amendment to the frozen counter, claims or controls is proposed.

## 7. Limitations / things not established

- The mutation was applied only to the **copied** checker in scratch. The lane copy at
  `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` was never edited; its digest is
  unchanged at `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743` before and after
  (verified after all probes).
- The green in Probe B is demonstrated at the **r4 evidence** position. At the r1a receipt position
  the type gate's removal does not green by itself, because the JSON-parse and digest checks fire
  first (Probe A/C). Probe B is therefore the *strongest* witness of the clause's load-bearing role,
  not the only one; Probe A independently shows the named-finding loss.
- `git archive` was used to materialise the HEAD tree into the fixture; this is a read-only export
  of committed lane bytes, and the fixture repo is a fresh `git init` under scratch whose toplevel
  was asserted equal to the fixture dir before its only commit. A throwaway local identity
  (`probe@fixture.local`) was used, scoped to that fixture repo only.
- I did not attempt a mutation of the *other* frozen clauses (measure blob pin r1, r5 freeze
  bindings, r6 V0 refusal); those are out of this seat's scope.
- The working tree of the lane shows a pre-existing unstaged modification to `corpus/README.md`
  (a round-43 knowledge row). It was **not** produced by this seat — this seat writes only under
  `.ufo/waves/round-43/w1/MutC2Blob/` and its scratch root. Flagged for the record only.
- No tool was installed or upgraded: the seat needed only `node v24.21.0` and `git 2.56.0`, both
  already present. Per the PACMAN GUARD, no `pacman` transaction was run.

## 8. Evidence index (all under this seat dir)

| file | sha256 |
|---|---|
| `evidence/mutation.diff` | 7bf83afc1b4d411b5288f711b6f782473bd9db211b4176eeae69a7669e8dc3c5 |
| `evidence/checker-pristine.mjs` | 2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743 |
| `evidence/checker-mutated.mjs` | 6b9b9833d0dcaaa1dacb6a3774998df0b79e168378365d1b9afece27e466b8e0 |
| `evidence/tree-vs-blob-pristine-fixture.mjs` | 7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d |
| `evidence/tree-vs-blob-mutated-checker-fixture.mjs` | 67c666716e553400755db439f478a9992aa8e50120f2af6272d91683545ec3d0 |
| `evidence/fixture-pristine.stdout` | 55c888743d75f3be1171ad697d0793ae6d313a63d22e60363622f7fbeba852bb |
| `evidence/fixture-mutated.stdout` | 580cecaa1b284d085215f66ed24dde308d5c9bc921fb65259090040d70a740c1 |
| `evidence/fixture-tree-pristine.json` | 151dbb1ef028613927d1bc3f544c9370cce03caa616b5c0667bbe0d82d88d8d5 |
| `evidence/fixture-tree-mutated.json` | 2ad607a6ec63ce842085764d73b69224a96a3e93b81b016d2569266ba06f5d27 |
| `evidence/out-pristine-tree-fixture.json` | 4749a797881fdec010ed5541a272923865e4d0f8842e237b881d01046c4f0c75 |
| `evidence/out-mutated-tree-fixture.json` | c71087f9871fc6110bd0012e8b19982c2527936027392dbd2c122dad2324f39f |
| `evidence/green-probe-pristine.json` | bc3b92f5aa91c81016d54efe16e5d327329c777642428420486f666d013969de |
| `evidence/green-probe-mutated.json` | 80e20439c406267ee0be5e4fe2789f9b60e0e0609468448b7fefd9a00e194e79 |
| `evidence/green-probe-r42.json` | 013407220f000a1d6dfc006ad527f568879d8f8298e97f035697951e779b1421 |
| `evidence/gitlink-probe-pristine.json` | 63a983cb3e8e27dd1dd0c52b8ce196491879742c6d0c68f89b8ff1b13502c919 |
| `evidence/gitlink-probe-mutated.json` | 4f26aff98a7fe17e50e3bd3bff6c58fe81d59e1631861170d1f71516214ad6f4 |
| `evidence/SHA256SUMS` | (index of the above) |

Scratch root `/fast/scratch/hyaku/tabi-r43/MutC2Blob/` was deleted before this report was finalised.

VERDICT ok load-bearing: removing the requireBlob type gate deletes the named r1a-not-a-blob finding on the committed tree fixture (control receipt not reproducible, fixture exit 0→1) and makes the checker exit 0 with predicate true on a HEAD-derived fixture whose r4 evidence path is a tree, where the frozen bytes exit 1 with r4-ev-S102-not-a-blob.
