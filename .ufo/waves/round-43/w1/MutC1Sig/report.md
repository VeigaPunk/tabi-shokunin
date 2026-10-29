# MutC1Sig — mutation probe: make `measureSignatureVerified` constant true (skip the signature verify)

Seat: `MutC1Sig` (wave w1, round 43) · axis: calibration · lane: tabi
Scratch root (created, used, deleted): `/fast/scratch/hyaku/tabi-r43/MutC1Sig/`
Seat evidence dir: `.ufo/waves/round-43/w1/MutC1Sig/` (report.md + `evidence/`)

Everything below was executed; no command is reported that was not run. Lane bytes were never
written (the frozen counter's sha256 is unchanged, §6). No tooling was installed (§7).

---

## 1. Assigned mutation

Target (frozen, read-only): `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`
sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`
— identical to the blob at the freeze commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
(`git cat-file -p 7ca6f018…:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs | sha256sum`
→ same value) and to the pin in `.ufo/waves/round-43/claims.json → frozenDigests`.

Copy made into scratch, then mutated **in scratch only**:

```
cp -p .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs $S/counter-mut.mjs
cp -p .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs $S/counter-pathctl.mjs   # byte-identical control
```

Mutation (exactly the assigned one; the Ed25519 wrapper-signature verification is skipped and
`measureSignatureVerified` is forced to `true`):

```diff
--- frozen  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
+++ scratch /fast/scratch/hyaku/tabi-r43/MutC1Sig/counter-mut.mjs
@@ -211,8 +211,9 @@
       const { signature, ...rest } = m;
       try {
         const unsigned = canonical(rest);
-        if (signature && signature.scheme === 'ed25519' && sha256(Buffer.from(unsigned, 'utf8')) === signature.over
-          && crypto.verify(null, Buffer.from(unsigned, 'utf8'), crypto.createPublicKey(m.pubkeys?.wrapper), Buffer.from(signature.value, 'hex'))) {
+        // MUTATION (MutC1Sig): the Ed25519 wrapper-signature verification is
+        // skipped entirely; measureSignatureVerified is forced to true.
+        if (true) {
           measureSignatureVerified = true;
         } else findings.push('measure-signature-invalid');
       } catch { findings.push('measure-signature-invalid'); }
```

Full diff: `evidence/mutant.diff`.
Hashes: `counter-mut.mjs` `44b78956be9eae1eab5ff6223335236eef405969ab7f87fe66cd139415397290`,
`counter-pathctl.mjs` `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` (identical to frozen).

`measureSignatureVerified` is now **constant true**: the `catch` branch that could still push
`measure-signature-invalid` is unreachable for a JSON-parsed measure document (`canonical()` cannot
throw on a JSON value — no cycles, `JSON.stringify` of strings/numbers cannot fail), so every
reachable input yields `measureSignatureVerified === true`. Measured confirmation in §4 (the
no-signature input yields `measureSignatureVerified: true` on the mutant and `false` on the frozen
bytes).

Two **diagnostic-only** copies (clearly *not* the assigned mutant) exist to separate the mutation's
effect from an artifact of running a copy from scratch:

* `counter-diag-pathctl.mjs` (`aa354f59…`) — unmutated, plus one neutralizer line:
  `const selfPath = ROOT + '/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';`
  (the counter hashes *itself* and compares that digest with the frozen pin, so any byte change —
  including the mutation — trips `digest-mismatch:…c1-signature-bound-v5.mjs`).
* `counter-diag-mut.mjs` (`f9afc84d…`) — the assigned mutation **plus** the same neutralizer.

The neutralizer only redirects the self-digest probe at the committed frozen counter; it changes no
evidence rule. It exists because the assigned mutant can never exit 0 on its own (see §5).

## 2. Probe inputs (synthetic pair builder)

`evidence/build-synthetic.mjs` (scratch, `6221da1a…`) fabricates a **self-signed** pair in scratch:
`receipt.json`, `receipt.witness.json`, `measure.json`, plus the attacker's key pair. It

* launches **no** browser and **no** child process of any kind — it only writes JSON files;
* signs the measure record with an **attacker-generated** Ed25519 key and publishes that same
  attacker's public key in `measure.pubkeys.wrapper`;
* signs the witness attestation with a second, independent attacker key published in
  `measure.pubkeys.witness` and in `witness.attestation.publicKey`;
* fills the receipt with self-reported "browser evidence" (8 samples/run, 2 runs, `ss`/`proc`
  surfaces with positive ticks and zero non-loopback counts, identity-bound tree pids with the
  pinned firefox exe path, `owned.roots`, `finalSweep`, `sockets` summaries, `firstShotSha256`,
  `portClosed`, `survivors: 0`, `envCheck`), all internally consistent so that the counter's
  structural checks pass.

Three variants were built:

| id | measure record | frozen bytes expect |
|---|---|---|
| `SYN-SELF` | self-signed, signature valid under the attacker's own key | `measureSignatureVerified: true` (nothing to refuse on the signature clause) |
| `SYN-TAMPERED` | one field (`createdAt`) changed after signing, signature not renewed | `measure-signature-invalid` |
| `SYN-NOSIG` | `signature` block removed entirely | `measure-signature-invalid` |

`SYN-TAMPERED` mirrors the frozen control `c1-relabel-refused.json` ("same synthetic pair with one
tampered field in the measure record (signature not renewed)").

`evidence/run-counter.mjs` (`d3eb6d88…`) invokes a counter the way the committed wrapper does
(`cwd` = lane root, scrubbed env, `stdio: ['ignore','pipe','pipe','pipe','pipe']`, strict argv
`<receipt.json> --measure <measure.json>`) and can either

* **answer** the counter's in-invocation fd3 challenge on fd4 with the attacker's own private key
  (the forgery path; the fd3/fd4 protocol is public in the committed wrapper,
  `scripts/measure-c1-round43.mjs:290-308`), or
* leave the channel open unanswered, or
* run with **no** channel at all (`--nochan`, the "direct invocation" of the frozen controls).

While the counter runs, the runner samples `/proc/<counter>/task/<counter>/children` (12–21 samples
per cell) to record whether the counter spawned anything at all.

## 3. Commands (exact)

```
S=/fast/scratch/hyaku/tabi-r43/MutC1Sig
FROZEN=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs

node $S/build-synthetic.mjs --dir $S/syn-self      --mode selfsigned --counter $FROZEN
node $S/build-synthetic.mjs --dir $S/syn-tampered  --mode tampered   --counter $FROZEN
node $S/build-synthetic.mjs --dir $S/syn-nosig     --mode nosig      --counter $FROZEN
node $S/matrix.mjs                      # 30 cells = 2 inputs x 3 new inputs x 5 counter copies x 3 channel modes

# headline cell, run directly:
node $S/run-counter.mjs --counter $FROZEN \
  --receipt $S/syn-self/receipt.json --measure $S/syn-self/measure.json \
  --answer $S/syn-self/attacker-private.pem --label green-census
```

## 4. Results — full matrix

`exit` = counter exit code; `findings` = the counter's finding list; `challenge` = the counter's
`challengeVerified`; all cells were produced by `evidence/matrix.mjs`, raw JSON per cell in
`evidence/results/`, aggregate in `evidence/matrix.json`, table in `evidence/matrix-table.txt`.

| input | counter copy | channel | exit | predicate | challenge | findings |
|---|---|---|---|---|---|---|
| SYN-SELF | FROZEN-inplace | answered | **0** | **true** | true | `[]` |
| SYN-SELF | FROZEN-inplace | unanswered | 1 | false | false | `[]` |
| SYN-SELF | FROZEN-inplace | nochan | 1 | false | false | `[]` |
| SYN-SELF | PATHCTL-scratch | answered | **0** | **true** | true | `[]` |
| SYN-SELF | MUT-scratch | answered | 1 | false | true | `digest-mismatch:…v5.mjs`, `measure-digest-mismatch:…v5.mjs` |
| SYN-SELF | DIAG-PATHCTL-scratch | answered | **0** | **true** | true | `[]` |
| SYN-SELF | DIAG-MUT-scratch | answered | **0** | **true** | true | `[]` |
| SYN-TAMPERED | FROZEN-inplace | answered | 1 | false | true | **`measure-signature-invalid`** |
| SYN-TAMPERED | FROZEN-inplace | unanswered | 1 | false | false | **`measure-signature-invalid`** |
| SYN-TAMPERED | FROZEN-inplace | nochan | 1 | false | false | **`measure-signature-invalid`** |
| SYN-TAMPERED | PATHCTL-scratch | answered | 1 | false | true | **`measure-signature-invalid`** |
| SYN-TAMPERED | MUT-scratch | answered | 1 | false | true | `digest-mismatch:…v5.mjs`, `measure-digest-mismatch:…v5.mjs` |
| SYN-TAMPERED | DIAG-PATHCTL-scratch | answered | 1 | false | true | **`measure-signature-invalid`** |
| SYN-TAMPERED | DIAG-MUT-scratch | answered | **0** | **true** | true | `[]` |
| SYN-TAMPERED | DIAG-MUT-scratch | unanswered | 1 | false | false | `[]` |
| SYN-TAMPERED | DIAG-MUT-scratch | nochan | 1 | false | false | `[]` |

No-signature input (`SYN-NOSIG`, channel answered):

| counter copy | exit | predicate | measureSignatureVerified | findings |
|---|---|---|---|---|
| FROZEN-inplace | 1 | false | **false** | `measure-signature-invalid` |
| PATHCTL-scratch | 1 | false | **false** | `measure-signature-invalid` |
| MUT-scratch (assigned mutant) | 1 | false | **true** | `digest-mismatch:…v5.mjs`, `measure-digest-mismatch:…v5.mjs` — **named finding lost** |

Raw: `evidence/nosig-frozen.json`, `evidence/nosig-pathctl.json`, `evidence/nosig-mut.json`.

## 5. Assigned-mutant verdict — the signature clause IS load-bearing

Definition used (seat spec): the clause is load-bearing iff the mutated copy **greens** *or* **loses
the named finding** on an input the frozen bytes refuse.

* On `SYN-TAMPERED` the frozen bytes refuse with the named finding `measure-signature-invalid`;
  the mutated copy's finding list no longer contains it (`MUT-scratch` row above; the only remaining
  findings are the self-digest artifacts of a changed counter copy). ⇒ **the named finding is lost
  on an input the frozen bytes refuse ⇒ load-bearing = YES.**
* On `SYN-NOSIG` the same holds, with `measureSignatureVerified` flipped from `false` to the
  constant `true` — the mutation is exactly what was assigned.
* **Was the signature clause the only wall on that input?** Yes on the evidence path. The two
  findings that remain on the mutant are purely the self-digest pin (`digest-mismatch` +
  `measure-digest-mismatch` on the counter's own key): they are produced by *any* byte change to the
  counter, not by the input, and the byte-identical scratch copy `PATHCTL-scratch` shows them
  absent. The diagnostic copies remove exactly that artifact and settle it:
  `DIAG-PATHCTL-scratch` **refuses** `SYN-TAMPERED` (`measure-signature-invalid`, exit 1) while
  `DIAG-MUT-scratch` **greens** the same input (`findings: []`, exit 0, predicate true).
  So with the artifact neutralized the mutated counter reaches exit 0 on an input the unmutated
  counter refuses — the signature clause was the only wall.
* **Instrument caveat (honest):** the assigned mutant as written can never itself exit 0, because
  the counter hashes *itself* and compares that digest with the frozen pin — any mutated copy
  trips `digest-mismatch:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`, which forces
  `predicate: false`. The mutation is therefore observable on the **finding set** (named finding
  lost) but not on the raw exit code of the mutated copy; the two diagnostic copies exist solely to
  expose the exit-code effect that the self-digest pin masks.
* On `SYN-SELF` the mutant is indistinguishable from the unmutated copy apart from the same
  artifact (there the measure signature was already valid, so there is nothing for the clause to
  refuse). The mutant **survives** on that input — reported as a coverage fact, not as a licence
  to change the contract.

**Mutation verdict: load-bearing = YES** (`measure-signature-invalid` is lost on
`SYN-TAMPERED`/`SYN-NOSIG`; with the self-digest artifact neutralized the mutant greens where the
unmutated copy refuses).

## 6. Routed finding — the frozen counter admits a self-authored pair with zero browser runs

**This is an observation with evidence, not a claim verdict; I do not judge, admit or reject C1.**

The headline cell, run directly against the **committed, unmutated** counter at its committed path:

```
node $S/run-counter.mjs --counter $FROZEN \
  --receipt $S/syn-self/receipt.json --measure $S/syn-self/measure.json \
  --answer $S/syn-self/attacker-private.pem --label green-census
```
```
{ "label": "green-census",
  "counter": { "predicate": true, "findings": [],
               "measureSignatureVerified": true, "witnessAttestationVerified": true,
               "challengeVerified": true, "challengeError": null },
  "exit": 0,
  "challengeBytesSeen": 32,
  "descendantCensus": { "samples": 12, "maxChildren": 0, "childExes": [] } }
```
(`evidence/green-cell-census.json`; the same cell in the matrix: `evidence/results/SYN-SELF__FROZEN-inplace__answered.json`.)

**exit 0, predicate true, zero findings — with no browser run.** Evidence that no browser ran:

* descendant census of the counter process during the run: 12 samples, `maxChildren: 0`,
  `childExes: []` — the counter spawned nothing;
* the frozen counter contains **no** process-spawning code at all
  (`grep -nE "spawn|execFile|exec\(|child_process|fork\(" c1-signature-bound-v5.mjs` → no match;
  no `child_process` import);
* the receipt's "browser evidence" is fabricated and provably so: the pids it claims
  (`4242` node, `4243` firefox) do not exist on this host (`/proc/4242`, `/proc/4243` absent);
* the only real artefact the counter reads is the pinned firefox **binary file**, hashed for the
  digest pin — it is read, never executed.

Why the chain does not stop it (all in the committed counter bytes):

* the challenge is verified against `measureDoc.pubkeys.wrapper`
  (`c1-signature-bound-v5.mjs:262`) — the public key **inside the measure record**, which the
  forger authors. A forger who mints their own Ed25519 key and publishes it there can sign the
  counter's own fresh challenge, so `challengeVerified` proves only "the author of the measure
  record holds *a* private key", not "the wrapper process held the per-invocation key";
* the witness attestation is verified under `witness.attestation.publicKey`
  (`c1-signature-bound-v5.mjs:146-150`) — the key **inside the witness file**, which the forger
  also authors; the "independent witness" is independent only of the wrapper, not of the author of
  the files;
* every browser-side fact (sample count, monotonic timestamps, ≥1000 ms span, `ss`/`proc`
  observations, identity-bound tree pids with a firefox exe, `owned.roots`, `finalSweep`,
  `firstShotSha256`, `portClosed`, `survivors`) is a **self-report** in the receipt; nothing binds
  it to a live process.

Consequences that are facts of the committed bytes:

1. The committed control `.ufo/waves/round-43/controls/c1-synthetic-refused.json` refuses the
   synthetic pair only because it was invoked **without** the fd3/fd4 channel
   (`challengeError: EINVAL`). With the channel — the wrapper's own protocol, published in
   `scripts/measure-c1-round43.mjs:290-308` — the very same class of pair is accepted with
   `findings: []` and exit 0. The control's stated refusal layer ("challenge-response: no run
   private half → challengeVerified false") therefore evidences the *absence of the channel*, not
   the authenticity of the pair.
2. The frozen counter can only be green inside a wrapper invocation (a direct invocation of the
   committed receipt gets `challengeError` and refuses), so the committed receipt/measure pair
   cannot even be re-scored green by a closure-time direct invocation — the one green path is
   emulatable by a forger as shown here.
3. Under the declared residual model (`claims.json → claims[0].residualModel`: (i) harvesting a
   per-invocation private half requires a prior honest run; (ii) process-memory/kernel attacks out
   of scope; (iii) on-disk tampering of committed pins out of model) this reach uses **none** of
   the out-of-model capabilities: no memory scraping, no kernel attack, no committed byte touched,
   all inputs local files under scratch, loopback only. The forger never held a per-invocation
   half; it minted its own key. So the reach is **in-model**.
4. C1's kill rule (`claims.json → claims[0].killRule`: "If any settled seat demonstrates an
   in-model do-nothing reach … the claim is not admitted: no capability row enters the SCORECARD
   table, coverage holds its score, and the finding is routed to round 44") is therefore met by
   this seat's probe: an exit-0 reach without a browser run. I report the observation and the
   evidence; the admission decision is not mine to make.
5. The residual model as written ("harvesting a per-invocation private half requires a prior
   honest run") does not describe the actual attack surface: no harvesting is needed at all.

Route: to the wave's integrator/Main as a C1 calibration finding for round 44. Possible directions
(not applied by me, and not to be applied to frozen bytes): bind the counter's expected wrapper
public key to something the counter cannot take from the forger (e.g. the wrapper writes the
measure record to a descriptor the counter reads over an inherited fd, or the counter derives the
expected key from the challenge channel's peer credentials), and make the witness attestation
verifiable against a key the forger cannot mint (e.g. the witness's key handed to the counter
through the same privileged channel, not inside the witness file).

## 7. Tooling

No tool was installed or upgraded: the seat needed only `node` (v24.21.0, already present, the
lane's pinned interpreter — `sha256(process.execPath)` =
`7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c`, equal to the pin in
`claims.json → producerPins.nodeSha256`), plus coreutils `sha256sum`/`diff`/`grep`. No pacman
transaction was run (pacman is paused host-wide). Nothing was written to `~/.local/bin` or any
PATH directory. Channel/why: none — no installation was needed or planned.

## 8. Lane hygiene

* The frozen counter file was never written: `sha256sum` of the committed path before and after
  the probe = `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` (equal to the
  freeze blob and to the `claims.json` pin).
* All mutated/diagnostic copies, the synthetic pairs and the runner live under the scratch root
  `/fast/scratch/hyaku/tabi-r43/MutC1Sig/`, which was **deleted** before this report was written
  (`rm -rf -- $S`).
* Writes outside scratch: only `.ufo/waves/round-43/w1/MutC1Sig.md` (the seat's `Report:` trailer
  path) and `.ufo/waves/round-43/w1/MutC1Sig/` (this seat's report + evidence dir, as the wave
  scope requires). No git/jj command mutated anything; `git status` was read only.
* No subagent was dispatched (leaf member).

## 9. Evidence index (all under `.ufo/waves/round-43/w1/MutC1Sig/evidence/`)

| file | content |
|---|---|
| `mutant.diff` | the assigned mutation, frozen → `counter-mut.mjs` |
| `counter-mut.mjs` | assigned mutant (`44b78956…`) |
| `counter-pathctl.mjs` | byte-identical scratch control (`6b8c875…`) |
| `counter-diag-mut.mjs`, `counter-diag-pathctl.mjs` | diagnostic-only copies (mutant / unmutated + self-digest neutralizer) |
| `build-synthetic.mjs`, `run-counter.mjs`, `matrix.mjs` | probe harness (builder, runner with descendant census, matrix driver) |
| `matrix.json`, `matrix-table.txt`, `results/*.json` | all 30 matrix cells, raw per cell |
| `green-cell-census.json`, `tampered-frozen-census.json`, `nosig-{frozen,pathctl,mut}.json` | headline cells incl. the descendant census |
| `synthetic/{syn-self,syn-tampered,syn-nosig}/` | the fabricated receipt / witness / measure bytes (the attacker's **public** key stays inside `measure.json`; the matching private PEMs were **removed** from the seat dir — see §8a) |
| `syn-*-build.json` | builder manifests (paths, nonce, receipt/witness sha256) |
| `SHA256SUMS.txt` | sha256 of every evidence file above |

## 10. Remediation after the secrets/scratch audit flag (`SentSecrets`)

The seat's evidence dir originally carried three Ed25519 **private**-key PEMs
(`evidence/synthetic/{syn-self,syn-tampered,syn-nosig}/attacker-private.pem`), flagged by the
wave's secrets/scratch audit because PEM private material in a wave dir would be committed
wholesale at wave close and would sit in git history. They were **deleted** from the seat dir
(`rm -f`, verified: `grep -rl "PRIVATE KEY" <seat dir>` → no match) and `evidence/SHA256SUMS.txt`
was regenerated (58 files). Nothing else was touched.

Nothing is lost for reproduction: those keys were synthetic, never protected anything, and are not
needed to re-run the probe. `evidence/build-synthetic.mjs` mints a **fresh** key pair on every run
and re-signs the measure record (and, in the `answered` mode, the counter's challenge) with it, so
the exact key bytes were not what made the cells reproduce — the code path is. The forged
`measure.json` files kept in `evidence/synthetic/` still show the self-signing structure
(`pubkeys.wrapper` = the author's own public key), which is the property the finding rests on.

## 11. Limitations

* The synthetic receipt's browser-side data are fabricated by construction; the counter never
  verifies liveness, which is the finding of §6, not a shortcut taken by the probe. A green run of
  the frozen counter therefore proves *the counter cannot distinguish a fabricated receipt from a
  real one* — it does not claim the real driver would not have produced different bytes.
* The probe never ran the real wrapper or Playwright/Firefox, by design (the point is the
  do-nothing reach).
* The mutant's own exit code is pinned by the counter's self-digest rule; the exit-code effect of
  the mutation is therefore demonstrated through the clearly-labelled diagnostic copies, not
  through the assigned mutant file itself (§5).
* `SYN-SELF` greens the frozen counter only when the fd3/fd4 channel is answered; unanswered and
  no-channel runs refuse with `challengeError` (`challenge-signature-invalid` / `EINVAL`) — the
  channel is the only wall in that path.
* I did not test the real wrapper's own refusal paths, the `--battery` mode, or the round-42
  replay control; those are other seats' scope.

VERDICT finding — the assigned mutation is load-bearing (the mutant loses `measure-signature-invalid` on `SYN-TAMPERED`/`SYN-NOSIG` and, with the self-digest artifact neutralized, greens where the unmutated copy refuses), and the committed frozen counter admits a self-authored, self-signed synthetic pair with exit 0 / predicate true and zero browser runs once the forger answers the fd3/fd4 challenge with their own key — an in-model do-nothing reach that fires C1's kill rule and routes to round 44.
