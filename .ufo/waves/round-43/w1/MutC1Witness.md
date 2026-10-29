# MutC1Witness — mutation: make `witnessAttestationVerified` constant true (skip `crypto.verify` of the attestation)

Seat: `MutC1Witness` · lane: tabi · round 43, attempt 1 · axis: calibration
Scope: challenge one claimed invariant of **C1** (coverage capability — round-43 signature-authenticated Playwright Firefox loopback chain) by mutating the witness-attestation clause of the frozen counter
`.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`, and re-run the relevant committed control/fixture against the mutated copy.

**VERDICT load-bearing: YES** — the mutated copy GREENS the forged-witness fixture that the frozen bytes refuse.

---

## 1. The clause under test

Frozen counter bytes (`sha256 6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`, unchanged in the lane; verified before and after — see §7).

`c1-signature-bound-v5.mjs:136-150` (frozen):

```js
  let witnessAttestationVerified = false;
  ...
    const a = witness.attestation || {};
    try {
      const signed = canonical({ rootPid: witness.rootPid, nonce: witness.nonce, startedTicks: witness.startedTicks, endedTicks: witness.endedTicks, samples: witness.samples });
      if (sha256(Buffer.from(signed, 'utf8')) === a.over
        && crypto.verify(null, Buffer.from(signed, 'utf8'), crypto.createPublicKey(a.publicKey), Buffer.from(a.value, 'hex'))) {
        witnessAttestationVerified = true;
      } else findings.push('witness-attestation-invalid');
    } catch { findings.push('witness-attestation-invalid'); }
```

The counter's final predicate gate (`:271`) folds the flag in:

```js
out.predicate = out.predicate && challengeVerified && out.measureSignatureVerified === true && out.witnessAttestationVerified === true;
```

So the clause "the witness attestation verifies under the witness's own Ed25519 key" is what makes `witnessAttestationVerified` true and, absent any other finding, what makes the whole predicate true.

## 2. Mutation applied (exact)

Primary mutant `c1-mutated.mjs` — `witnessAttestationVerified` is constant true **and** `crypto.verify` of the attestation is skipped. Full diff: `MutC1Witness/mutation-primary.diff`.

```diff
-  let witnessAttestationVerified = false;
+  let witnessAttestationVerified = true;
@@
-      if (sha256(Buffer.from(signed, 'utf8')) === a.over
-        && crypto.verify(null, Buffer.from(signed, 'utf8'), crypto.createPublicKey(a.publicKey), Buffer.from(a.value, 'hex'))) {
+      if (sha256(Buffer.from(signed, 'utf8')) === a.over) {
         witnessAttestationVerified = true;
       } else findings.push('witness-attestation-invalid');
```

Mutant sha256 `0cfabf57f6536e796f3ea9a6afdd105ccc70654e7a4cc741aaf79e959a54a4e9`.

Two auxiliary scratch copies, both recorded as diffs and kept clearly secondary:

| file | sha256 | purpose |
|---|---|---|
| `c1-mutated-flagonly.mjs` | `8c352d15…f490` | flag constant true, `crypto.verify` **kept** — isolates the flag from the verify call (`mutation-flagonly-control.diff`) |
| `c1-mutated-composite.mjs` | `648be565…d29eb` | primary mutation **plus** a harness-only relaxation of the counter's *own* digest pin (`mutation-composite-harness.diff`) |

The composite relaxation is *not* part of the claimed mutation; it exists only because the mutated counter no longer hashes to the pinned digest of the frozen counter file, which would otherwise add an unrelated `digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` finding and mask the clause under test. The composite copy relaxes exactly two lines, both keyed on `k.endsWith('counters/c1-signature-bound-v5.mjs')` — the counter's self-pin and the measure-record digest cross-check of that same key. All other pins (driver, wrapper, firefox binary, node) remain enforced.

**Rationale for the composite:** the primary mutant alone already answers the question — it loses `witness-attestation-invalid` on the forged fixture (§5). The composite exists to show the mutated copy *GREENS* the forged fixture end-to-end rather than merely trading one finding for another. Both readings are reported.

## 3. Fixtures built (scratch only)

Generator `gen-fixture.mjs` builds a fully self-consistent receipt + witness + Ed25519-signed measure record that satisfies every other counter clause (schema, nonce binding, 2 runs × 10 samples, ≥8 samples with strictly increasing timestamps and ≥1000 ms span, positive ss/proc ticks, zero non-loopback egress, identity-bound owned tree with firefox-binary root executables, `survivors===0`, `portClosed`, shot-hash agreement, summary cross-checks, producer digests, env gate, `elapsedMs` ≥ span+500, receipt/witness hash bindings). `run-counter.mjs` answers the counter's fresh fd3 challenge on fd4 exactly as the real wrapper does (`scripts/measure-c1-round43.mjs:293-306`): the counter's 32 random bytes are signed with the fixture's wrapper (run) private key.

Fixture variants and the single defect each carries:

| fixture | defect injected | purpose |
|---|---|---|
| `fx-honest` | none | positive control: frozen counter must green |
| `fx-forged` | witness attestation **signed by a different key** (K2) while the declared public key is K1 | the specified forged-witness fixture |
| `fx-selfsigned` | witness signed by its *own* declared key K2, measure record names K2 | probes whether the clause is anchored to anything |
| `fx-mismatchkey` | witness signed+declared K2, measure record still names K1 | `witness-pubkey-mismatch` wall |
| `fx-badattestation` | `attestation.value` replaced with garbage hex | signature-shape wall |
| `fx-badover` | `attestation.over` corrupted | content-binding wall |
| `fx-noattest` | `attestation` key deleted | missing-attestation wall |
| `fx-realforged` | **genuine** wrapper-produced witness re-signed by an attacker key, measure record untouched | real-bytes probe |
| `fx-replay42` | committed round-42 receipt + round-41 measure record | committed control replay |

The measure record's `pubkeys.witness` is set to the witness's declared public key in every fixture except `fx-mismatchkey`, so the `witness-pubkey-mismatch` wall is not what is under test.

## 4. Baseline: the frozen bytes refuse the forged witness

```
$ node run-counter.mjs <frozen> fx-forged
```
counter stdout (selected fields):
```json
 "measureSignatureVerified": true,
 "witnessAttestationVerified": false,
 "predicate": false,
 "findings": [
  "witness-attestation-invalid"
 ],
 "challengeVerified": true,
```
counter exit 1. The **only** finding is `witness-attestation-invalid` — every other clause passes, so the witness attestation clause is the sole wall standing between this pair and a green verdict.

## 5. The mutated copy loses the wall

```
$ node run-counter.mjs <c1-mutated> fx-forged
```
```json
 "witnessAttestationVerified": true,     <-- was false
 "predicate": false,
 "findings": [
  "digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs",
  "measure-digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs"
 ],
```
`witness-attestation-invalid` is **gone**. The two remaining findings are the counter's own pinned-digest mismatch, an artifact of running a mutated copy from scratch — not a residual of the witness clause.

With the harness-only self-pin relaxation applied (`c1-mutated-composite`):

```
$ node run-counter.mjs <c1-mutated-composite> fx-forged
```
```json
 "measureSignatureVerified": true,
 "witnessAttestationVerified": true,
 "predicate": true,
 "findings": [],
 "challengeVerified": true,
```
**counter exit 0 — the forged-witness fixture GREENS under the mutated copy and is REFUSED under the frozen bytes.**

## 6. Full matrix (evidence file: `MutC1Witness/matrix.json`)

`exit` = counter exit code; `pred` = counter `predicate`; `wAtt` = `witnessAttestationVerified`.

| fixture | frozen | mutated (primary) | mutated-composite | mutated-flagonly |
|---|---|---|---|---|
| `fx-honest` | exit 0, pred T, wAtt T | exit 1 (self-pin), wAtt T | **exit 0, pred T** | exit 1 (self-pin), wAtt T |
| `fx-forged` | **exit 1, pred F, `witness-attestation-invalid`** | exit 1 (self-pin only), **wAtt T, no attestation finding** | **exit 0, pred T, findings []** | exit 1, `witness-attestation-invalid` still present |
| `fx-selfsigned` | **exit 0, pred T** | exit 1 (self-pin) | exit 0, pred T | exit 1 (self-pin) |
| `fx-mismatchkey` | exit 1, `witness-pubkey-mismatch` | exit 1, `witness-pubkey-mismatch` | exit 1, `witness-pubkey-mismatch` | exit 1, `witness-pubkey-mismatch` |
| `fx-badattestation` | exit 1, `witness-attestation-invalid` | exit 1 (self-pin only) | **exit 0, pred T** | exit 1, `witness-attestation-invalid` present |
| `fx-badover` | exit 1, `witness-attestation-invalid` | exit 1, `witness-attestation-invalid` | exit 1, `witness-attestation-invalid` | exit 1, `witness-attestation-invalid` |
| `fx-noattest` | exit 1, `witness-attestation-invalid` + `witness-binding-mismatch` | exit 1, `witness-attestation-invalid` + binding | exit 1, `witness-attestation-invalid` + binding | exit 1, both |
| `fx-realforged` (genuine bytes re-signed) | exit 1, `witness-attestation-invalid` + `witness-binding-mismatch` | exit 1, `witness-binding-mismatch` only | exit 1, `witness-binding-mismatch` only | exit 1, both |
| `fx-replay42` (committed control) | exit 1, 8 findings incl. `measure-signature-invalid` | exit 1, same 8 + self-pin | exit 1, same 8 | exit 1, same 8 + self-pin |

Reading of the matrix:

- **The clause is load-bearing.** Frozen bytes refuse `fx-forged` and `fx-badattestation` on `witness-attestation-invalid` alone; the mutated copy accepts both (composite: exit 0, `findings: []`).
- **The load-bearing element is `crypto.verify`, not the flag.** `c1-mutated-flagonly` (flag constant true, verify kept) still reports `witness-attestation-invalid` on both forged fixtures. Making the flag constant true alone buys nothing; removing the `crypto.verify` conjunct is what opens the wall. This is the cleanest isolation of the mutation's behaviour-bearing point.
- **Residual walls that survive the mutation** (i.e. the mutation does not remove them): `witness-pubkey-mismatch` (measure record must name the witness's declared key), `witness-binding-mismatch` (measure record binds the exact witness bytes), `witness-attestation-invalid` via the `attestation.over` content hash (`fx-badover` still refused), and the whole challenge/measure-signature layer.
- **The clause is not anchored to a browser run.** `fx-selfsigned` (witness signed by its own declared key, measure record naming that key) is **accepted by the frozen bytes** — `predicate: true`, exit 0, no wrapper invocation and no browser run (`MutC1Witness/selfsigned-reach.json`: `wrapperInvoked:false, browserRun:false, priorHonestRun:false, committedArtifacts:false`). The frozen clause checks that the attestation is internally well-formed and that the measure record agrees with the declared key; it does not tie the witness to anything the wrapper observed. This is a pre-existing property of the frozen bytes, reproduced independently here; it is **not** caused by this mutation and the mutation does not change it (frozen and composite both green it). Peers `CritC1ReachSynth` and `CritResidualModel` independently report the same self-signed reach on the frozen counter — this seat's finding is the *mutation-level* attribution, and it does not dispute or extend their reach claim.
- **Real bytes behave like synthetic bytes.** On `fx-realforged` (a genuine wrapper-produced witness document whose `attestation.value` was re-signed with an attacker key, `attestation.publicKey` and `attestation.over` untouched), the frozen bytes refuse with `witness-attestation-invalid`; the composite mutant drops that finding and is left holding only `witness-binding-mismatch`. The clause is load-bearing on genuine bytes too, not only on synthetic ones.
- **Committed controls still refuse under the mutation.** The round-42 replay control shape (committed r42 receipt + r41 measure record) is refused with the same 8 findings by every variant, including `measure-signature-invalid` and `witness-binding-mismatch`. The mutation is narrowly scoped to the attestation clause and does not loosen the replay/relabel/synthetic walls.
- **Determinism.** The decisive pair was repeated 3× with identical results (frozen: `exit=1 pred=False findings=witness-attestation-invalid wAtt=False`; composite mutant: `exit=0 pred=True findings=- wAtt=True`) — `MutC1Witness/determinism.json`.

## 7. Restoration and integrity evidence

- Lane bytes never modified: `sha256` of `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` is `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` **before and after** the probe, equal to the frozen pin in `claims.json.frozenDigests` (`MutC1Witness/hashes.json`).
- `git status --porcelain .ufo/waves/round-43/counters/ .ufo/waves/round-43/claims.json scripts/` → empty. No commits, no pushes, no git/jj mutation, no spawned agents.
- All mutated copies ran from `/fast/scratch/hyaku/tabi-r43/MutC1Witness/`; the scratch root is deleted on yield (`shutil.rmtree`).
- Reports/evidence written only under `.ufo/waves/round-43/w1/MutC1Witness/`. No writes to the fleet root, sibling `*-shokunin` repos, or `shokuknow`.

## 8. Limitations

- The forged fixtures are synthetic by construction. They are built to satisfy every clause *except* the one under test, but they are not browser-produced bytes. The `fx-realforged` probe partially closes this gap by mutating genuine wrapper-produced witness bytes, but the `fx-realforged` case is refused by `witness-binding-mismatch` as well, so the mutation's effect there is "one fewer finding", not "greened".
- The composite mutant relaxes the counter's own digest pin. It is reported as a harness device, not as part of the claimed mutation; the primary mutant's own result (finding `witness-attestation-invalid` disappears) is the mutation-level fact.
- The `fx-selfsigned` observation (frozen bytes green a self-consistent witness pair with no browser run) is a property of the frozen bytes and is a **coverage observation, not a mutation result** — the mutation neither causes nor cures it. It is reported here because it bounds what the clause is worth; the reach question itself belongs to the reach seats.
- The fd3/fd4 challenge channel was reproduced faithfully from `scripts/measure-c1-round43.mjs`, but the fixture's wrapper private key was minted by the generator, not produced by the real wrapper. The real end-to-end path was exercised separately (§9) and behaves as expected.

## 9. Sanity: real end-to-end chain still works

```
$ node scripts/measure-c1-round43.mjs --out <scratch>/real/receipt.json \
      --measure-out <scratch>/real/measure.json --scratch <scratch>/real/scratch
```
wrapper exit 0, counter exit 0, `predicate: true`, `findings: []`, `challengeVerified: true`, `witnessAttestationVerified: true`, `nonceMatches: true`, real Playwright Firefox runs. Scoring those genuine bytes directly (no channel) gives `challengeError: "EINVAL"` and `predicate: false` under the frozen bytes — the challenge layer behaves as declared.

## 10. Evidence files

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/MutC1Witness/`:

| file | contents |
|---|---|
| `matrix.json` | full probe matrix (every counter stdout, exit code, findings) |
| `hashes.json` | lane counter sha256 before/after, scratch copy digests, node/firefox pins |
| `mutation-primary.diff` | the exact mutation (`witnessAttestationVerified` constant true + `crypto.verify` skipped) |
| `mutation-flagonly-control.diff` | control: flag constant true, verify kept |
| `mutation-composite-harness.diff` | harness-only self-pin relaxation used to show the green |
| `selfsigned-reach.json` | frozen-bytes self-signed reach reproduction (§6), with explicit no-wrapper / no-browser / no-prior-run assertions |
| `determinism.json` | 3 repeats of the decisive pair — stable, no flakiness |
| `gen-fixture.mjs`, `run-counter.mjs`, `run-direct.mjs`, `resign-witness.mjs` | the fixture generator, the fd3/fd4 challenge-answering runner, the direct (no-channel) runner, and the genuine-witness re-signer |

Scratch (deleted on yield): `gen-fixture.mjs`, `run-counter.mjs`, `run-direct.mjs`, `resign-witness.mjs`, the four counter copies, nine fixture directories, and the real wrapper run.

## 11. Tooling

No installs were performed; no package manager was invoked (PACMAN GUARD respected — `pacman` never run). Tooling used was already present: Node.js v24.21.0 (fnm-managed, `sha256 7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c`, matching the frozen `producerPins.nodeSha256`) and Python 3.14 for JSON assembly. Playwright Firefox `1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb` (matching `producerPins.firefoxBinSha256`).

---

VERDICT ok mutation killed the clause: the mutated counter greens the forged-witness fixture (exit 0, predicate true) that the frozen bytes refuse with `witness-attestation-invalid` alone — the witness attestation clause is load-bearing; residual walls (`witness-pubkey-mismatch`, `witness-binding-mismatch`, `attestation.over` content hash, challenge/measure-signature layer) all survive the mutation.
