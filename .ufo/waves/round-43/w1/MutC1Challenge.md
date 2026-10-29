# MutC1Challenge — mutation probe: is the challenge clause load-bearing?

**Axis:** calibration (C1 counter instrumentation).
**Scope:** read-only on the lane tree; all mutated bytes and all executions live in scratch.

## Question

`c1-signature-bound-v5.mjs` ends its predicate with
`out.predicate = out.predicate && challengeVerified && measureSignatureVerified === true && witnessAttestationVerified === true;`
(`c1-signature-bound-v5.mjs:271`). The frozen bytes compute `challengeVerified` from a
fresh 32-byte challenge written to fd3 and an Ed25519 signature read back from fd4
(`:247–263`). The seat asks: **is that challenge clause load-bearing** — i.e. if
`challengeVerified` were a constant `true`, would the counter still refuse input the
frozen bytes refuse?

The committed control `.ufo/waves/round-43/controls/c1-synthetic-refused.json` records the
baseline claim: a self-signed synthetic pair is **refused** by a direct (no-channel)
invocation, and the recorded refusal layers are
`"challenge-response: no run private half -> challengeVerified false"` plus
`"tampered measure record -> measure-signature-invalid + receipt-binding-mismatch"`.
That control's `challengeVerified: false` is the named finding the mutation must test.

## Mutation (exactly one behavioural change)

Applied to a scratch copy of the frozen counter. `evidence/mutant.diff`:

```diff
-let challengeVerified = false, challengeError = null;
+const challengeVerified = true; let challengeError = null;
@@
-    challengeVerified = crypto.verify(null, challenge, crypto.createPublicKey(m.pubkeys?.wrapper), Buffer.from(hex.slice(0, 128), 'hex'));
+    crypto.verify(null, challenge, crypto.createPublicKey(m.pubkeys?.wrapper), Buffer.from(hex.slice(0, 128), 'hex'));
```

Two coordinated hunks are required for "constant true": the declaration becomes a `const`
initialised to `true`, and the sole reassignment site is neutralised (the `crypto.verify`
call is kept so the argument evaluation and any throw inside it are unchanged — only its
result stops being stored). One hunk alone is **not** constant: `let challengeVerified = true`
is still overwritten by the reassignment whenever fd4 yields a well-formed 128-hex string,
so a wrong-but-well-formed signature flips it back to `false` — observed in arms
A14/A18/A19 below.

Hashes: pristine `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`
(= the frozen pin) → mutant `67318f742c4d859db1454a5b5a3b39680076f5f848053694e02747f1d3807305`.
The one-hunk control (`let … = true` only) is `03f1e4228b6e4fe7d91037e02b2d3ddcdbf9fc1b455ebe3ac876351b51f3f6fa`.
`node --check` passes on the mutant.

## Method

Every invocation is a **direct** counter invocation — the wrapper is never run, so the
fd3/fd4 challenge channel exists only when a driver explicitly provides it. The counter
under test is executed inside a `bwrap` sandbox whose ROOT
(`/home/vgpnk/Projects/shokunin/tabi-shokunin`) is a **scratch shadow tree**, so the lane
tree is never written and the mutated bytes are what actually run.

Two shadows are needed because the counter checks its own digest against the claims pin
(`:181–185`) and the measure record's `digests` map against the same pin (`:222`):

* `shadow-pristine` — pristine counter bytes, claims byte-identical to the lane claims.
* `shadow-mutant` — mutant counter bytes, claims copy whose `frozenDigests` entry for the
  counter is re-pointed at the mutant digest, and a matching mutant-digest measure record.
* `shadow-mutant-frozen` — mutant counter bytes under the **unmodified frozen claims**, to
  show what the frozen pin alone does to a mutated instrument.
* `shadow-initonly` — the one-hunk control.

The fixture is a **synthetic self-signed pair** built in scratch (`evidence/fixtures/`):
a receipt and witness whose every structural clause satisfies the counter, plus a
measure record signed under a scratch-generated Ed25519 key (so the measure-signature and
witness-attestation clauses both pass). It is deliberately built to satisfy everything
**except** the challenge, so that the challenge clause is isolated as the only possible
refuser. `evidence/gen-hashes.json` records the digests of every fixture, of the pinned
Firefox binary (`1f637a7c…`), and of the pinned Node (`7fde7b8a…`).

Three challenge-channel conditions were exercised:

| condition | fd3/fd4 |
|---|---|
| `nofd` | `exec 3>&- 4>&-` — no channel at all. Verified separately: `writeSync(3)` and `readSync(4)` both throw `EINVAL`, so the counter's `challengeError` is `EINVAL` and the challenge bytes never reach a signer. |
| `answered` | fd3/fd4 are pipes; a driver reads the fresh 32-byte challenge and answers with a signature made by the **synthetic self-signed** key (`evidence/driver-answered.mjs`). |
| `garbage` | fd3/fd4 are pipes; the challenge is answered with a **well-formed but wrong** 128-hex signature (`evidence/driver-garbage.mjs`) — the counter reaches its `crypto.verify` and the result is `false`. |

The counting command for every arm (run from the sandbox, `cwd` = scratch):

```
bwrap --ro-bind / / --dev /dev --proc /proc --bind <shadow> <LANE_ROOT> --chdir <scratch> \
  /bin/bash -c "<fd setup>; exec $NODE <LANE_ROOT>/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
               <receipt> --measure <measure-record>"
```

## Observed results

`evidence/arms-matrix.json` and `evidence/arms/*.verdict.json` hold the raw outputs.
`findings` is the counter's own array; `challengeVerified` is its own field.

| arm | counter under test | channel | exit | predicate | challengeVerified | findings |
|---|---|---|---:|---|---|---|
| A1 | pristine | nofd | 1 | false | **false** | `[]` |
| A2 | **mutant** | nofd | **0** | **true** | **true** | `[]` |
| A3 | mutant, frozen claims | nofd | 1 | false | true | `digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` |
| A4 | pristine | answered (synthetic key) | 0 | true | true | `[]` |
| A5 | mutant | answered (synthetic key) | 0 | true | true | `[]` |
| A6 | pristine | nofd, tampered record | 1 | false | false | `measure-signature-invalid`, `receipt-binding-mismatch` |
| A7 | mutant | nofd, tampered record | 1 | false | true | `measure-signature-invalid`, `receipt-binding-mismatch` |
| A8 | pristine | nofd, committed r42 receipt + committed r41 measure | 1 | false | false | `schema`, `measure-nonce-shape`, `run-nonce-mismatch`, `witness-unreadable`, `measure-schema`, `measure-signature-invalid`, `receipt-binding-mismatch`, `witness-binding-mismatch` |
| A9 | mutant | nofd, same | 1 | false | true | identical to A8 |
| A10 | mutant, measure record binds pristine digest | nofd | 1 | false | true | `measure-digest-mismatch:…c1-signature-bound-v5.mjs` |
| A11 | pristine | nofd, **genuine committed r43 pair** | 1 | false | false | `[]` |
| A12 | mutant | nofd, genuine committed r43 pair | 1 | false | true | `measure-digest-mismatch:…c1-signature-bound-v5.mjs` |
| A14 | pristine | garbage answer | 1 | false | **false** (`challenge-signature-invalid`) | `[]` |
| A15 | **mutant** | garbage answer | **0** | **true** | true | `[]` |
| A16 | pristine | garbage answer, genuine pair | 1 | false | false | `[]` |
| A17 | mutant | garbage answer, genuine pair | 1 | false | true | `measure-digest-mismatch:…` |
| A18 | init-only control | nofd | 0 | true | true | `[]` |
| A19 | init-only control | garbage answer | 1 | false | **false** | `[]` |
| R1 | **restored bytes** (pristine re-copied) | nofd | 1 | false | false | `[]` |

### Replication of the committed control's own "synthetic" case

The committed control `c1-synthetic-refused.json` records, for its *synthetic* case, the
finding set `["run-set","witness-driver-unseen","witness-no-owned-firefox",
"witness-no-overlap","digest-mismatch:scripts/playwright-firefox-egress-round43.mjs",
"digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs","firefox-bin-unbound"]`
with `challengeVerified:false`, exit 1. I rebuilt that case's shape
(`evidence/gen-ctrl-replica.mjs`, fixture in `evidence/fixtures/ctrl-*`) and ran it against
both instruments:

| arm | counter | exit | challengeVerified | findings |
|---|---|---:|---|---|
| C1 | pristine | 1 | false | `run-set`, `witness-driver-unseen`, `witness-no-owned-firefox`, `witness-no-overlap`, `firefox-bin-unbound` |
| C2 | mutant | 1 | **true** | identical to C1 |

The replica reproduces the committed control's finding set **exactly except the two
`digest-mismatch:` entries**. Those two are the stale entries already reported by the
sibling seat `ExecReplayAll.md:260` ("the frozen control `c1-replay-r42-refused.json` is
not re-derivable (2 stale digest-mismatch findings)"); they are byte-state artefacts of
the control's recording environment and are not produced by the frozen tree at the freeze
pin. This confirms the control's *refusal* and its `challengeVerified:false` reproduce, and
that the mutation changes exactly one thing on that case: `challengeVerified` flips
false→true while every other finding is untouched (C2). Note the control's synthetic case
is refused by several clauses at once, so it is **not** by itself an isolation of the
challenge clause — the isolating case is A1 below, whose finding set is empty.

### Proof that the intended bytes executed

`evidence/shadow-probe.jsonl` runs inside each sandbox and reports the resolved counter
path's own sha256, the claims pin it was compared against, and whether the file contains
`const challengeVerified = true`:

| shadow | counter file sha256 | claims pin for the counter | contains the mutation |
|---|---|---|---|
| shadow-pristine | `6b8c8750…` | `6b8c8750…` | no |
| shadow-mutant | `67318f74…` | `67318f74…` | yes |
| shadow-mutant-frozen | `67318f74…` | `6b8c8750…` (frozen) | yes |
| shadow-initonly | `03f1e422…` | `03f1e422…` | no (initializer only) |

So each arm really executed the bytes it is labelled with, and `shadow-mutant-frozen`
really did run a mutated counter under the *unmodified* frozen claims pin.

Two further arms run the **frozen counter at its real lane path** against the real lane
claims, as a harness cross-check that the shadow tree does not change the verdict
(`evidence/arms/D1-*`, `D2-*`):

* D1 (committed r42 receipt + committed r41 measure): exit 1, `challengeVerified:false`,
  findings `schema`, `measure-nonce-shape`, `run-nonce-mismatch`, `witness-unreadable`,
  `measure-schema`, `measure-signature-invalid`, `receipt-binding-mismatch`,
  `witness-binding-mismatch` — byte-for-byte the same finding set as A8.
* D2 (genuine committed r43 receipt + witness + measure record): exit 1,
  `challengeVerified:false`, findings `[]`.

## Verdict on load-bearingness

**The challenge clause is load-bearing — yes.**

### Seat requirement → arm

| seat requirement | arm(s) | observed |
|---|---|---|
| "the synthetic self-signed pair must then be refused ONLY by the signature/attestation clauses" (mutated copy, tampered record) | A6 (pristine) → A7 (mutant) | A7's findings are exactly `measure-signature-invalid`, `receipt-binding-mismatch` — signature/attestation clauses only; `challengeVerified` flips false→true, so the challenge contributes no refusal |
| "isolate that the challenge clause is what refuses a direct offline invocation (test with no fds at all)" | A1 (and A11 on the genuine committed pair) | A1: exit 1, `challengeVerified:false`, `findings:[]` — no other clause fires |
| "load-bearing iff the mutated copy GREENS … input the frozen bytes refuse" | A1 → A2 | A2: exit 0, `predicate:true`, `challengeVerified:true`, `findings:[]` |
| "or loses the named finding on" (the control's `challengeVerified:false` refusal layer) | C1 → C2 | C2: same findings as C1 but `challengeVerified:true` — the named finding is lost |
| mutation is exactly "challengeVerified constant true" | A18/A19 one-hunk control | a one-hunk `let … = true` is **not** constant (A19 refuses the garbage answer); the two-hunk `const` form is |

The evidence is the A1→A2 pair. A1 is the **isolation** arm: a self-signed synthetic pair in
which every other clause is satisfied, invoked directly with no channel at all →
**exit 1, `predicate:false`, `challengeVerified:false`, `findings:[]`**. The refusal is
carried by the challenge clause and by nothing else. A2 applies the mutation to the same
bytes and the same invocation → **exit 0, `predicate:true`, `challengeVerified:true`,
`findings:[]`**. The mutated copy **greens** input the frozen bytes refuse, which is the
seat's load-bearing criterion, and it does so with the frozen bytes' own `findings` array
empty — the refusal genuinely was the challenge clause.

A15 corroborates from the other side: with a well-formed but *wrong* signature on fd4
(A14) the frozen counter refuses (`challenge-signature-invalid`) and the mutant still
greens. So the clause is not merely "absent when no channel exists" — it is the element
that converts an unverified fd4 answer into a refusal.

A19 shows the mutation had to be the two-hunk form: the one-hunk control
(`let challengeVerified = true`) refuses the garbage answer exactly as the frozen bytes do,
because the reassignment overwrites the initialiser. A18 shows that on the no-channel path
the one-hunk control already greens — so a one-token edit would have produced the same
"load-bearing" answer on A1 but would have been a weaker mutation than the one specified.

A7/A9/A12/C2 isolate the clause against the other refusers. With the mutation applied,
the signature/attestation clauses still refuse exactly as before (A7 = A6's findings;
A9 = A8's findings; C2 = C1's findings). The challenge clause is the **only** conjunct
whose satisfaction the mutation changes: in every arm the mutated copy's finding set is
identical to the pristine copy's except where the digest clause independently fires because
the *measure record* still binds the pristine counter digest (A10, A12, A17). That is the
expected consequence of the commitment chain: the measure record's `digests` map pins the
counter's own bytes, so a mutated counter is separately caught by the measure-digest clause
whenever the record was signed against the pristine instrument.

**Scope limit on the verdict.** The mutation makes the *challenge* conjunct vacuous; it
does not make the counter accept anything at all in the frozen configuration. Against the
**committed** frozen claims the mutated instrument is refused outright by the self-digest
clause (A3: `digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`) —
a mutated counter cannot be substituted in place without also editing the claims pin. The
load-bearing demonstration therefore had to re-point the shadow claims pin and supply a
matching measure record (A2), which is precisely why A3 and A10 are reported separately.
The honest statement is: **the challenge clause is the sole barrier that the frozen bytes
erect between "a self-signed pair with no live challenge channel" and `exit 0`**, and it is
load-bearing for the predicate's exit code; it is not the only clause standing between the
counter and a self-signed pair.

## Relationship to the committed controls (no amendment proposed)

The committed control `c1-synthetic-refused.json` records `challengeVerified: false` and
the refusal layer `"challenge-response: no run private half -> challengeVerified false"`.
That named finding is reproduced exactly by the control-case replication (C1: same exit 1,
same `challengeVerified:false`, and the same finding set except the two stale
`digest-mismatch:` entries already reported by `ExecReplayAll.md:260`), and the isolation
arm A1 shows the same named finding arising with an otherwise-empty `findings` array. A2
demonstrates that the named finding is exactly what the mutation removes. **No amendment to
the frozen claims, counter, or control bytes is proposed or applied.** The observation that
the challenge clause alone accounts for the control's `refused:true` is a calibration fact
about the existing instrument, not a defect in the C1 predicate sentence.

One related calibration observation, reported as a finding rather than a fix: A14/A16 show
the frozen counter refusing a *well-formed but wrong* fd4 signature with
`challengeError: "challenge-signature-invalid"`, while a *missing* channel yields
`challengeError: "EINVAL"` (A1). Both are refusals, so the committed control's recorded
`challengeError` value is an artefact of how the control was invoked rather than a
distinguishing signal; a control that pins `challengeError:"EINVAL"` would not be
reproduced by a channel-present-but-wrong invocation. The committed control as written
records `"challengeError": "EINVAL"` for its direct invocation, which matches A1, so it is
reproduced — but the value is invocation-shape-dependent and should not be read as
evidence that a channel was absent.

## Limitations

* The synthetic pair is my own construction, not a committed fixture. It is designed to
  satisfy every non-challenge clause (confirmed by A1's empty `findings` array) so that the
  challenge clause is isolated; it is not evidence about any browser run.
* The mutated instrument could only be exercised inside a scratch shadow with the claims
  counter-pin re-pointed. A mutated counter dropped into the frozen tree at its committed
  path is caught by the self-digest clause (A3), so the frozen tree's own behaviour is
  unchanged by this mutation. The load-bearing claim is about the clause's role in the
  predicate, established by the A1→A2 contrast, not about a deployable mutant.
* The `answered`/`garbage` arms answer with a scratch-generated self-signed key, so they
  exercise the fd3/fd4 plumbing and the `crypto.verify` call site. They do not test
  whether the *real* wrapper's per-invocation key could be obtained; that is out of scope
  here and is the subject of sibling seats.
* The genuine committed r43 pair (A11, A12, A16, A17) is the honest run's bytes. A11
  reproduces the committed-control shape on it (`findings:[]`, `challengeVerified:false`),
  confirming the shadow harness does not manufacture findings. The mutant's refusal there
  (A12) is the measure-digest clause, not the challenge.
* `fd3`/`fd4` availability was verified by probe (`writeSync(3)`/`readSync(4)` both throw
  `EINVAL` under `exec 3>&- 4>&-`); the `EINVAL` `challengeError` in the `nofd` arms is
  that probe's result reaching the counter.

## Scope and tooling

* Lane tree read-only: the counter, claims, wrapper, driver, measure record and receipts
  were only read. `evidence/SHA256SUMS.txt` records the lane digests after the run; the
  counter still hashes to the frozen pin `6b8c8750…` and claims to `290c87d5…`.
  `git status --porcelain` shows no modification to any file I touched — the only
  pre-existing tracked modification (`corpus/README.md`) and the untracked
  `.ufo/waves/round-43/w1/` entries predate this seat and are not mine.
* No commits, no pushes, no git/jj mutation, no agents spawned, no browser launched, no
  network access, no consequential actions.
* Writes confined to this seat directory
  (`.ufo/waves/round-43/w1/MutC1Challenge/`) and to the scratch root
  `/fast/scratch/hyaku/tabi-r43/MutC1Challenge/`, which was deleted before reporting.
* Tooling: `/home/vgpnk/.omp/agent/RULES.md` was read first. **No installation or
  upgrade was needed or performed** — Node v24.21.0 (fnm-managed, the pinned
  `7fde7b8a…` build), `bwrap` (system, `/usr/bin/bwrap`), `git`, `sha256sum`, `diff` and
  `python3`/`node` from the host were sufficient. No pacman transaction was run (the
  pacman guard is paused host-wide); no `uv tool install`, no release binary, no
  `cargo`/`npm -g` install.
* Every `Report:`-style path in this seat resolves under
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/`.

VERDICT ok Challenge clause is load-bearing: A1 (pristine, direct no-channel invocation of a self-signed synthetic pair) refuses with exit 1, challengeVerified false, findings [], and the same input against the mutant (challengeVerified constant true) exits 0 with predicate true.
