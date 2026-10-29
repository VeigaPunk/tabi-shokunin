# MutC1Nonce — mutation probe: remove the nonce triple-match (receipt/runs/witness vs measure nonce)

Seat: `MutC1Nonce` (wave w1, round 43) · axis: calibration · lane: tabi
Scratch root (created, used, deleted): `/fast/scratch/hyaku/tabi-r43/MutC1Nonce/`
Seat evidence dir: `.ufo/waves/round-43/w1/MutC1Nonce/` (report.md + `evidence/`)

Everything below was executed; no command is reported that was not run. Lane bytes were never
written — the frozen counter's sha256 is unchanged before and after (§7), and the frozen blob at
the freeze commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` hashes to the same value.

---

## 1. Assigned mutation

Target (frozen, read-only): `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`
sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`
— identical to the blob at the freeze commit:

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin cat-file -p \
  7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs | sha256sum
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  -
```

Copy made into scratch, then mutated **in scratch only**. The mutation removes the nonce
triple-match: the receipt/run-nonce-vs-measure-nonce comparison and the witness-nonce-vs-measure-nonce
comparison. Both clauses are named in the frozen predicate sentence ("the fresh 64-hex nonce is
carried by the receipt, both runs, the witness and the Ed25519-signed measure record"), so both
are in scope for the assigned "triple-match" removal.

```diff
--- scratch/frozen/c1-signature-bound-v5.mjs        (pristine copy of the frozen counter)
+++ scratch/mutant/c1-signature-bound-v5.mjs        (mutated copy)
@@ -52,7 +52,6 @@

   if (receipt.schema !== SCHEMA) findings.push('schema');
   if (!/^[0-9a-f]{64}$/.test(nonce || '')) findings.push('measure-nonce-shape');
-  if (receipt.runNonce !== nonce || runs.some((r) => r.runNonce !== nonce)) findings.push('run-nonce-mismatch');
   if (receipt.refused !== false || runs.length !== 2) findings.push('run-set');

@@ -136,7 +135,6 @@
   let witnessAttestationVerified = false;
   if (!witness || witness.schema !== WITNESS_SCHEMA) findings.push('witness-unreadable');
   else {
-    if (witness.nonce !== nonce) findings.push('witness-nonce-mismatch');
     const wenv = Array.isArray(witness.environ) ? witness.environ : [];
```

Full diff: `evidence/mutant.diff`. **2 lines removed, 0 added.** Nothing else in the file changed.

Hashes (scratch):

| file | sha256 |
|---|---|
| `frozen/c1-signature-bound-v5.mjs` (pristine copy) | `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` |
| `mutant/c1-signature-bound-v5.mjs` (mutated, pre-restore) | `bccee53c5d707473f87becc4642803a039c12736a333d4debe3bc384512f46d8` |

The mutated copy was restored to pristine bytes at the end of the probe (§4), so its pre-restore
hash was re-derived deterministically from the pristine bytes by removing exactly the two assigned
lines, and cross-verified two ways: the reconstruction with the self-digest array entry removed is
**byte-identical** to the independently derived `mutant-nopin2` copy, and the reconstruction diff's
changed lines are md5-identical to `evidence/mutant.diff`'s changed lines. Full verification in
`evidence/mutant-hash-verification.txt`.

The `measure-nonce-shape` clause (the measure record's nonce must be 64-hex) was **not** touched —
it is a shape check on one artifact, not the cross-artifact triple-match. §5 verifies it still fires.

---

## 2. Detector and expected outcome

The seat's detector: *a relabeled-nonce copy of a refused receipt must lose the `run-nonce-mismatch`
finding under the mutated copy; the clause is load-bearing iff the relabel loses its wall.*

Concretely: for any input where the frozen counter refuses with `run-nonce-mismatch`, the mutated
copy must no longer produce that finding. If the mutated copy still refuses for **other** reasons
only, the finding is gone (the clause is load-bearing for that finding) but the input is still
refused (the wall survives elsewhere). If the mutated copy greens the input outright, the clause
was the *only* barrier.

Three input families were used, all built in scratch from committed bytes:

| family | what is relabeled | other artifacts |
|---|---|---|
| `relabel-receipt` | `receipt.runNonce` + both `runs[].runNonce` | witness + measure untouched |
| `relabel-measure` | measure record's `nonce` field only (signature NOT renewed) | receipt + witness untouched |
| `relabel-witness` | `witness.nonce` only | receipt + measure untouched |

Relabeling was done by textual substitution of the 64-hex nonce string, so every other byte of the
committed artifact is preserved verbatim (`evidence/mkvariants.mjs`, `evidence/fixture-manifest.json`).

---

## 3. Result A — the named finding is lost (primary detector)

Command shape (scratch copies, direct invocation):

```
cd /fast/scratch/hyaku/tabi-r43/MutC1Nonce/<frozen|mutant> &&
node c1-signature-bound-v5.mjs <fixture>/receipt.json --measure <fixture>/measure.json 3<measure
```

`fd3` was opened read-only, so the counter's challenge write fails (`challengeError: "EBADF"`) — the
direct-invocation shape used by the committed controls
`.ufo/waves/round-43/controls/c1-relabel-refused.json` and `c1-replay-r42-refused.json`.

Observed (full JSON in `evidence/probe-matrix.json`; transcripts in `evidence/probe-matrix.txt`
and `evidence/probe2-inplace.txt`):

| fixture | copy | exit | `run-nonce-mismatch` | `witness-nonce-mismatch` | all findings |
|---|---|---:|---|---|---|
| relabel-receipt | frozen | 1 | **true** | false | `["run-nonce-mismatch","receipt-binding-mismatch"]` |
| relabel-receipt | **mutant** | 1 | **false** | false | `["digest-mismatch:…counter","receipt-binding-mismatch","measure-digest-mismatch:…counter"]` |
| relabel-measure | frozen | 1 | **true** | **true** | `["run-nonce-mismatch","witness-nonce-mismatch","measure-signature-invalid"]` |
| relabel-measure | **mutant** | 1 | **false** | **false** | `["digest-mismatch:…counter","measure-signature-invalid","measure-digest-mismatch:…counter"]` |
| relabel-witness | frozen | 1 | false | **true** | `["witness-nonce-mismatch","witness-attestation-invalid","witness-binding-mismatch"]` |
| relabel-witness | **mutant** | 1 | false | **false** | `["witness-attestation-invalid","digest-mismatch:…counter","witness-binding-mismatch","measure-digest-mismatch:…counter"]` |
| replay42 (committed control) | frozen | 1 | **true** | false | `["schema","measure-nonce-shape","run-nonce-mismatch","witness-unreadable","measure-schema","measure-signature-invalid","receipt-binding-mismatch","witness-binding-mismatch"]` |
| replay42 (committed control) | **mutant** | 1 | **false** | false | same list **minus** `run-nonce-mismatch` |

Two orthogonal artefacts appear in every mutant row: `digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`
and `measure-digest-mismatch:…counter`. These are **not** caused by the mutation. The counter
hashes its own running file (`fileURLToPath(import.meta.url)`) against the pin in `claims.json`, so
*any* copy run from scratch trips it, mutated or not. Control: the pristine scratch copy on the
same base fixture reports `findings: []` with no digest findings, while the mutated copy reports
exactly the two digest findings — i.e. the digest pair is the scratch-copy artefact and the
nonce findings are the mutation.

To remove that confound entirely, §4 runs two additional copies in which the self-digest array
entry is removed **identically** in both, so `diff(frozen-nopin2, mutant-nopin2)` is still exactly
the assigned 2-line mutation.

**Verdict A: the nonce triple-match clause is load-bearing for the `run-nonce-mismatch` and
`witness-nonce-mismatch` findings.** The mutated copy loses exactly those findings on every
relabeled input tested, and keeps every other finding unchanged. The clause is not decorative: it
is the *only* thing that refuses a relabeled-nonce pair whose other artifacts are self-consistent.

---

## 4. Result B — isolation: with everything else held constant, the mutated copy GREENS

This is the decisive measurement. A synthetic pair was built in scratch (no browser run, no lane
byte written) that is internally fully self-consistent — measure record signed with a scratch
Ed25519 key, witness attestation signed with a second scratch key, receipt/witness sha256 bindings
correct — with the **only** defect being that the measure record's nonce was relabeled and then
**re-signed** so that `measure-signature-invalid` does *not* fire either.

Sanity check on the pair (from `evidence/harness3.txt`):

```
measure sig over-match: true
measure sig verify: true
receiptSha256 binding ok: true
witnessSha256 binding ok: true
measure.nonce: dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
receipt.runNonce: cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
witness.nonce: f649d0cb67c9bf728db39ba0f258fff74373e67984cc8d9f09c53b9d90c4ae4c
```

Observed with the self-digest entry removed identically from both copies (`evidence/nopin2.diff`
is again exactly the assigned 2-line mutation):

| copy | exit | findings | `predicate` | `challengeVerified` | `measureSignatureVerified` | `witnessAttestationVerified` |
|---|---:|---|---:|---:|---:|---:|
| frozen-nopin2 | **1** | `["run-nonce-mismatch","witness-nonce-mismatch"]` | false | true | true | true |
| **mutant-nopin2** | **0** | **`[]`** | **true** | true | true | true |

The mutated counter **greens** (exit 0, `predicate: true`, `findings: []`) an input that the frozen
bytes refuse, and the frozen bytes' refusal on that input consists of nothing but the two nonce
findings. Every other layer — the Ed25519 measure signature, the witness attestation, both sha256
bindings, and the fd3/fd4 challenge — passes on both copies.

The same pair under the **unmodified pinned** counter (`resigned-frozen`) also refuses with the
two nonce findings plus only the scratch-copy digest artefact.

**Verdict B: on a nonce-mismatched but otherwise fully authenticated pair, the nonce triple-match
is the sole barrier, and the mutated counter admits it.**

### Restored-bytes control

After the mutation runs, the mutated scratch copy was overwritten with the exact pristine frozen
bytes and re-run on the same detector:

```
cp -p frozen/c1-signature-bound-v5.mjs mutant/c1-signature-bound-v5.mjs
sha256sum mutant/c1-signature-bound-v5.mjs frozen/c1-signature-bound-v5.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  mutant/c1-signature-bound-v5.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  frozen/c1-signature-bound-v5.mjs
cmp -s mutant/… frozen/…  ->  YES (byte-identical)

restore-nonceonly: exit 1  findings ["run-nonce-mismatch"]  predicate false  challengeVerified true
   (identical to the pristine frozen run on the same input)
```

The restored copy reproduces the pristine refusal exactly. The baseline is therefore not a
baseline failure: the frozen bytes refuse, the mutated bytes green, the restored bytes refuse
again.

---

## 5. Completeness checks — the mutation was exact

* The `measure-nonce-shape` clause survives: a measure record whose nonce is `"zz"` is still
  refused with `measure-nonce-shape` by the mutated copy (`evidence/probe3-completeness.txt`).
* A receipt with `runNonce` **absent** is still refused — with `receipt-binding-mismatch` — by the
  mutated copy.
* A witness with `nonce` **absent** is still refused — with `witness-attestation-invalid` and
  `witness-binding-mismatch` — by the mutated copy.
* The mutated copy does not weaken the honest path: on the committed r43 receipt/witness/measure
  triple, the mutated and frozen copies (both with the self-digest entry removed so the
  scratch-copy artefact is excluded) report identical findings — `[]` for both, exit 1 with
  `challengeError: "EBADF"` under direct invocation — `evidence/restore.txt` §3.
* On the committed r42 replay control the mutated copy refuses with the frozen copy's exact
  finding set **minus** `run-nonce-mismatch` — `evidence/restore.txt` §4.

---

## 6. Scope note — an in-model do-nothing reach this seat did NOT originate

While building the isolation harness, the harness's *consistent* synthetic pair — internally
self-consistent, self-signed with scratch keys, no browser launched — was scored by the
**unmodified, committed** counter and **greened**:

```
consistent-v2-LANE-counter:
  exit 0  findings []  predicate true  challengeVerified true
```

This is the same defect already reported by sibling seats `CritC1ReachSynth` and
`CritC1ReachDirect` (see `.ufo/waves/round-43/w1/CritC1ReachSynth.md` and `CritC1ReachDirect.md`),
who filed it as a C1 coverage finding against the frozen counter. This seat reproduces it
independently and confirms it; it is **not** a new finding and it is **not** attributable to the
mutation — it holds on the frozen bytes. It is recorded here only because it changes how the
mutation result should be read:

> The nonce triple-match clause is load-bearing **as a finding and as the sole barrier on a
> nonce-mismatched pair** (§3, §4), but it is **not** the layer that defends C1 against a
> do-nothing reach. A forger who chooses a *self-consistent* nonce never trips it, and the frozen
> counter admits that pair outright. The mutation therefore cannot be read as "removing the clause
> would have exposed a reach that the clause was closing" — the clause was never the thing closing
> it.

The mutation verdict below stands on its own and is independent of that sibling finding.

---

## 7. Lane and file discipline

* **No lane byte was written.** The frozen counter's sha256 is `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`
  before and after the probe, equal to the blob at the freeze commit `7ca6f018…` and to
  `claims.json → frozenDigests`. All mutated copies lived under the scratch root.
* **No commits, no pushes, no git/jj mutation.** No fixture repo was needed: every fixture was a
  plain directory of JSON files. `git status --porcelain` in `tabi-shokunin` shows only
  pre-existing entries (`corpus/README.md` modified, `corpus/lessons/round-43.md`,
  `corpus/knowledge/receipt-authenticity-signing-round-43.md`,
  `.ufo/waves/round-43/measure/failed-run-1/`, `.ufo/waves/round-43/w1.ready.dispatched`,
  `.ufo/waves/round-43/w1/`) — none of them written by this seat; this seat wrote only
  `.ufo/waves/round-43/w1/MutC1Nonce.md` and `.ufo/waves/round-43/w1/MutC1Nonce/`.
* **Scratch deleted.** `/fast/scratch/hyaku/tabi-r43/MutC1Nonce/` was removed at the end
  (`shutil.rmtree` in a `finally` block) — see `evidence/scratch-cleanup.txt`.
* **No tool was installed or upgraded.** Everything ran on the pre-existing Node v24.21.0 at
  `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, whose sha256
  `7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c` matches the frozen Node pin.
  No `pacman` transaction was run (the host-wide pacman pause was respected); no `uv tool`, no
  release binary, no `cargo`/`npm -g` install was needed or performed. Channel, version, reason:
  *not applicable — no install*.
* **Only loopback and local files** were used. No HTTP request of any kind was made by this seat.

---

## 8. Evidence index

All under `.ufo/waves/round-43/w1/MutC1Nonce/evidence/`:

| file | content |
|---|---|
| `mutant.diff` | the assigned 2-line mutation diff (frozen → mutant) |
| `nopin2.diff` | diff of the two self-digest-neutralized copies — still exactly the 2-line mutation |
| `mutant.sha256.txt` | sha256 of every scratch counter copy, before and after restore |
| `mkvariants.mjs` | fixture builder (textual nonce substitution over committed bytes) |
| `build-nonceonly.mjs` | synthetic-pair builder (scratch keys, no browser, `--consistent` / `--relabel-measure-resigned`) |
| `mini-wrapper.mjs` | scratch fd3/fd4 challenge responder |
| `probe.sh`, `probe2.sh`, `probe3.sh`, `harness.sh`, `harness2.sh`, `harness3.sh`, `restore.sh` | the exact driver scripts, run as written |
| `probe-matrix.txt`, `probe2-inplace.txt`, `probe3-completeness.txt` | raw transcripts of the fixture matrix, the in-place frozen baseline, and the completeness checks |
| `harness.txt`, `harness2.txt`, `harness3.txt` | raw transcripts of the isolation harness (v1 with the no-op pin-neutralisation bug noted inline, v2 corrected, v3 re-signed isolation) |
| `restore.txt` | restoration, honest-path, and r42-replay controls |
| `probe-matrix.json`, `harness-results.json` | machine-readable findings/exit/predicate/challenge tables |
| `fixture-manifest.json` | sha256 of every fixture artifact, per variant |
| `lane-hashes.txt` | frozen counter hash before/after + freeze-commit blob hash |
| `scratch-cleanup.txt` | scratch removal confirmation |

---

## 9. Verdict

**Clause load-bearing: YES.** Under the mutated copy the `run-nonce-mismatch` and
`witness-nonce-mismatch` findings disappear on every relabeled input tested, and on a pair whose
only defect is the relabeled nonce the mutated copy **greens** (exit 0, `predicate: true`,
`findings: []`) where the frozen bytes refuse with exactly those two findings. The restored
pristine bytes refuse again. The `measure-nonce-shape` clause and every other layer are unchanged.

**Residual caveat (calibration, not a defect in this seat's verdict):** the clause is not the
layer that protects C1 against a do-nothing reach — a self-consistent synthetic pair greens the
*frozen* counter too, as sibling seats `CritC1ReachSynth` / `CritC1ReachDirect` have already
filed. Removing the nonce triple-match is therefore not a repair path for C1; the frozen bytes are
left untouched and the sibling coverage finding stands on its own.

VERDICT finding — nonce triple-match clause is load-bearing: the mutated counter loses `run-nonce-mismatch`/`witness-nonce-mismatch` on every relabeled input and greens the nonce-only-defect pair the frozen bytes refuse (exit 0, `predicate: true`, `findings: []`); the same probe independently confirms the sibling-filed C1 do-nothing reach on the unmodified counter, which this clause does not defend.
