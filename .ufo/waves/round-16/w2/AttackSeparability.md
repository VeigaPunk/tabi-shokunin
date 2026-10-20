# AttackSeparability — C1/C2 causal separability at b444ca8

Author: TabiR16.AttackSeparability (leaf, wave 2 = FALSIFY)
Target: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair)
Date: 2026-10-20. All lane reads; all mutations in throwaway `/tmp` clones.

## Verdict

**HOLDS** for the assigned test: at `b444ca8`, C1 and C2 read disjoint committed
surfaces; reverting every C2 file leaves C1 = 1 (output byte-identical to baseline
modulo the revision field); reverting every C1 file leaves C2 = 1 (byte-identical).
The only actually-shared read is the counter file itself, and swapping the two
counter versions moves C2 only.

Two scoped couplings are recorded below (S1, S2). Neither fails the assigned
reversion test, but both bound how strong the word "causally separable" may be
used in the wave report.

Axes attacked (cheap-first, parallel):
A1 counter-reported `inputsRead` overlap; A2 C2-revert → C1; A3 C1-revert → C2;
A4 shared-instrument (counter) sensitivity; A5 worktree-leak independence;
A6 the round-15 record both claims touch.

## Method

- Baseline counters run in the lane itself (read-only): `node .ufo/waves/round-16/measure.mjs b444ca8… --claim C1|C2`.
- Each mutation arm: `mktemp -d /tmp/<arm>` → `git clone --no-hardlinks <lane> repo`
  → `git checkout b444ca8…` → mutate → `git -c user.name=probe -c user.email=p@local commit`
  (commits exist only in the throwaway clone) → run the **clone's** counter
  (`node .ufo/waves/round-16/measure.mjs HEAD --claim C1|C2`, so `ROOT` = clone).
- In every arm `.ufo/waves/round-16/measure.mjs` stayed at its `b444ca8` blob
  (`sha256 bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9`);
  only in the matrix probe (E5) was the counter swapped to A's blob.

## Evidence

### E1 — baseline at b444ca8 (lane)

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8…","c1_binding_contracts":1,"gateSha256":"5150611c…d6fb",
 "selftestSha256":"8c5426f2…f2ae",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],
                                "C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70…"},
 "failures":[],"counterBlobAtRevisionSha256":"bda4e18e…",
 "inputsRead":["corpus/evidence/round-15/measurements.json","scripts/check-measurement-binding.mjs","scripts/selftest-measurement-binding.mjs"]}

$ node .ufo/waves/round-16/measure.mjs b444ca8… --claim C2
{"revision":"b444ca8…","c2_webmcp_held":1,
 "cited":["S020","S030","S031","S032","S033","S034","S035","S036"],
 "caseIds":["flags-off-negative-control","devtools-domain-disabled","declarative-form-tool","imperative-model-context","lifecycle-removal","navigation-clears-tools","declarative-missing-name","model-context-location","frame-tools","opaque-sandboxed-iframe","data-url-declarative"],
 "failures":[],"counterBlobAtRevisionSha256":"bda4e18e…",
 "inputsRead":["corpus/README.md","corpus/SOURCES.md",
  "corpus/evidence/round-16/webmcp/fixtures/declarative-form.html",
  "corpus/evidence/round-16/webmcp/fixtures/declarative-missing-name.html",
  "corpus/evidence/round-16/webmcp/fixtures/frame-parent.html",
  "corpus/evidence/round-16/webmcp/fixtures/imperative.html",
  "corpus/evidence/round-16/webmcp/fixtures/lifecycle.html",
  "corpus/evidence/round-16/webmcp/fixtures/plain.html",
  "corpus/evidence/round-16/webmcp/receipt.json",
  "corpus/knowledge/webmcp-chromium-loopback-round-16.md",
  "scripts/webmcp-loopback-round16.mjs"]}
```

Reported read sets intersect in **zero** paths (C1: 3 paths; C2: 11 paths).

### E2 — A2: revert all C2 files → C1 unchanged at 1

Clone `/tmp/arm-c2rev.KjdF7S/repo`, commit `08fbd18`:
`git checkout e38d259… -- corpus/README.md corpus/SOURCES.md`;
`git rm -r corpus/knowledge/webmcp-chromium-loopback-round-16.md scripts/webmcp-loopback-round16.mjs corpus/evidence/round-16/webmcp corpus/evidence/round-16/measure`.

```
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C1
{"revision":"08fbd18…","c1_binding_contracts":1,"gateSha256":"5150611c…d6fb","selftestSha256":"8c5426f2…f2ae",
 "selftest":{"exit":0,"cases":43,"summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],"C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70…"},
 "failures":[],"counterBlobAtRevisionSha256":"bda4e18e…","inputsRead":[r15 measurements, gate, selftest]}
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C2
{"revision":"08fbd18…","c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"], …}
```

Strict comparison: `diff <(norm baseline.C1) <(norm arm.C1)` → **IDENTICAL**
(normalisation = `s/"revision":"[0-9a-f]{40}"/"revision":"REV"/`). So C1 does not
change one byte when every C2 deliverable and its evidence are removed.

### E3 — A3: revert all C1 files → C2 unchanged at 1

Clone `/tmp/arm-c1rev.f3Ij58/repo`, commit `d1da969`:
`git rm scripts/check-measurement-binding.mjs scripts/selftest-measurement-binding.mjs`;
`git rm -r corpus/evidence/round-16/binding`.

```
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C1
{"revision":"d1da969…","c1_binding_contracts":0,"gateSha256":null,"selftestSha256":null,
 "failures":["gate or selftest absent at revision"], …}
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C2
{"revision":"d1da969…","c2_webmcp_held":1,"cited":[8 sources],"caseIds":[11],"failures":[], …}
```

`diff` of C2 baseline vs this arm → **IDENTICAL** modulo revision.

### E4 — controls

| control | C1 | C2 |
|---|---|---|
| no-op empty commit on b444ca8 | 1 | 1 |
| `e38d2599…` (pre-round-16), b444ca8 counter | 0 (`gate or selftest absent at revision`) | 0 (`note, receipt or harness absent at revision`) |
| delete only `corpus/evidence/round-15/measurements.json` | 0 (`round-15 measurements absent at revision`) | 1 |
| dirty worktree at b444ca8: note `GARBAGE`, gate/selftest/harness/receipt deleted on disk, no commit | 1 | 1 |

The dirty-worktree row is the important control for a concurrently edited lane:
both counters are functions of the commit tree (`git ls-tree`/`cat-file`), not of
the worktree, so sibling work-in-progress cannot move a count. The C1 child is
materialised from blobs into `mkdtemp` and the gate's `--legacy` arm is
object-only (`git merge-base`, `cat-file`; no worktree read).

### E5 — A4: shared instrument matrix (executed counter × revision)

| executed counter | rev A | rev b444ca8 |
|---|---|---|
| A blob `4eb82895…` | C1=1, C2=0 (`case data-url-declarative fixture digest`) | C1=1, C2=0 (same single failure) |
| b444ca8 blob `bda4e18e…` | C1=1, C2=1 | C1=1, C2=1 |

C1 is constant 1 in all four cells. The b444ca8 repair — whose diff is confined
to `countC2`'s `fixture`→`fixtureFile` read — moves C2 only. A-counter at rev A
byte-reproduces the retained receipt
`corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json`
(`c2_webmcp_held:0`, same failure, `counterBlobAtRevisionSha256 4eb82895…`).

### E6 — A6: the one cross-claim coupling that exists

C1's legacy oracle asserts an exact finding set for **both** claims
(`LEGACY_EXPECTED` in `.ufo/waves/round-16/measure.mjs:70-73`), including
C2's `counter_digest_mismatch` — a round-15 C2 fact read from
`corpus/evidence/round-15/measurements.json` (C1's own third input,
`C2.counterSha256 dd9c8675…` = blob at `9fd8bca`, vs blob at measured `b7cf044`
=`3ee59de0…`).

Clone `/tmp/probe-r15c2.*`, commit `27d9817`: set **only** `C2.counterSha256`
in that file to `3ee59de0…` (removing the historical defect), nothing else:

```
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C1
{"c1_binding_contracts":0, "legacy":{"findings":{"C1":[…3…],"C2":["counted_inputs_undeclared"]}},
 "failures":["legacy C2 reasons counted_inputs_undeclared != counted_inputs_undeclared,counter_digest_mismatch"], …}
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C2
{"c2_webmcp_held":1,"failures":[], …}
```

So a C2-domain record can flip C1 to 0 while C2 stays 1. Direction of coupling is
one-way (C2's counter never reads the r15 file), and the record is immutable
round-15 history that predates the wave, not a round-16 C2 deliverable.

## Findings by severity

No blocking (P0/P1) findings within scope.

**S1 — shared-instrument read is hidden from `inputsRead` (P3, honesty of the
declared input set).** Both claims actually read `.ufo/waves/round-16/measure.mjs`
at REV; `main()` hashes it then executes
`inputsRead.delete('.ufo/waves/round-16/measure.mjs')` (`measure.mjs:285-286`).
The reported sets are therefore disjoint by construction, while the true read
sets share one path. `counterBlobAtRevisionSha256` (`bda4e18e…` in both runs)
proves the read. Consequence: the counter version is an undeclared shared input
of both counts — visible operationally in E5, invisible in `inputsRead`. Not a
false count; the field is named `inputsRead` and the omission is deliberate, but
a reader who treats `inputsRead` as the full dependence set will over-read
separability.

**S2 — C1's oracle encodes a C2-domain historical fact (P3, one-way).** E6.
C1 = 1 at any revision today depends on the round-15 record keeping its defect
(`counter_digest_mismatch`). This is the intended behaviour of an independent
oracle on real history (the C1 doc comment states the round-15 defects 1/2 are
its target), but it means C1's count is not a function of C1's round-16 files
alone; it is a function of (gate, selftest, r15 measurements — including its C2
section).

**Observation — b444ca8 does not cause C1's 1.** C1 = 1 already at A with either
counter (E5), and the b444ca8 counter diff touches only `countC2` (`measure.mjs`
diff, `8f7feb3..b444ca8`: 11 insertions/2 deletions, all inside `countC2`). The
revision pair stated in the claim (`0 at e38d259 → 1 at b444ca8`) is true, but
attribution is: C1's transition happens at **A**; b444ca8 inherits it and moves
C2 only. Consistent with separability, worth one sentence in the wave report so
"0 → 1 at b444ca8" is not read as the delivery commit producing both.

## Residual risk

- `inputsRead` covers only the counter's own `blob()` calls. C1's child surface
  (selftest → gate → `git`) is not enumerated there; I bounded it by source read:
  the selftest reads/writes only `mkdtemp` repos, and `--legacy` reads the
  materialised r15 JSON plus git objects. No C2 path appears in either.
- C2's internal coupling (receipt `producerSha256` ↔ harness blob, per-case
  `fixtureSha256` ↔ fixture blobs) is claim-internal and intended; I did not test
  whether those bindings can be satisfied by stale receipt/fixture pairs from a
  different revision (not a separability question).
- The C1 legacy arm pins `--at 36240c70…`, a constant, so C1's oracle result is
  revision-invariant; this is by design but means C1's "operability" evidence at
  any later REV is the same fixed oracle plus two blob digests.

## Verification gaps (unrun = unrun)

- Did not run `scripts/webmcp-loopback-round16.mjs` (receipt/runtime attack is
  not this item; a sibling harness process was live during the run).
- Did not use `lsp`: no `lsp` tool/device was mounted in this session, so caller
  and definition checks were done by direct source reading
  (`measure.mjs:63-101,255-292`, `check-measurement-binding.mjs:290-700`,
  `selftest-measurement-binding.mjs:19-60`) plus behavioural probes E1–E6, which
  are stronger than textual reference search for this question.
- No REA MCP used (disabled for the lane). No tool installs or upgrades were
  needed; nothing recorded under the tooling directive.

## Reproduce

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2

D=$(mktemp -d); git clone --no-hardlinks . "$D/r"; cd "$D/r"
git checkout b444ca8e024f386124418169e8e400221524bba3
git checkout e38d2599a922cb729186353830fff8e159b4fef0 -- corpus/README.md corpus/SOURCES.md
git rm -r corpus/knowledge/webmcp-chromium-loopback-round-16.md scripts/webmcp-loopback-round16.mjs corpus/evidence/round-16/webmcp corpus/evidence/round-16/measure
git -c user.name=p -c user.email=p@l commit -qm c2rev
node .ufo/waves/round-16/measure.mjs HEAD --claim C1   # 1
node .ufo/waves/round-16/measure.mjs HEAD --claim C2   # 0
```
