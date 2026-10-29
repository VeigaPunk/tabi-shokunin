---
source: S150 — Node.js Crypto documentation, https://nodejs.org/docs/latest-v24.x/api/crypto.html
  (also S151 — git-cat-file manual, for the committed-bytes type gate this entry's sibling checker
  enforces; S145 — proc_pid_net(5), for the observed surface)
verified-at: 2026-10-29 — opened copies sha256 4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af
  (.ufo/waves/round-43/sources/crypto.html, HTTP 200, 681,625 bytes) and
  624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7
  (.ufo/waves/round-43/sources/git-cat-file.html, HTTP 200, 79,360 bytes)
recheck: on-release or on nodejs.org / git-scm.com doc revision — re-open both pages, re-verify the
  sha256s, and re-run the r43 refusal controls (battery, replay, synthetic, tamper) and the C2
  baseline red
---

# Receipt authenticity by per-invocation signing (round 43)

## Claim

A counter that scores a measurement receipt from committed bytes authenticates nothing by
itself: the round-42 wave demonstrated three zero-browser reaches of its C1 predicate (nonce
relabels of honest bytes, a hand-written receipt naming pid 1, a 6.7 KB synthetic
receipt+witness pair) and an unpinned `--pins` hole (QUALITY criterion 104). The closing
instrument shape is signature binding: the wrapper generates an Ed25519 keypair per invocation
(node:crypto `generateKeyPairSync`; the API index line "createPrivateKey, createPublicKey,
generateKeyPair, sign, verify," locates the primitives — S150), the private half never
persists, an independent witness child attests under its OWN per-invocation key, a signed
measure record binds the receipt and witness bytes, and the counter — invoked only inside the
wrapper's invocation — verifies the wrapper signature, the witness attestation, and a fresh
challenge it generated itself.

## Decision table — what refuses which forgery

| Forgery | Refusal layer | Committed control |
|---|---|---|
| nonce relabel of honest receipt bytes | wrapper signature covers the measure record's receiptSha256 binding; a relabeled receipt no longer hashes to the signed binding | `controls/c1-relabel-refused.json` (`measure-signature-invalid` + `receipt-binding-mismatch`) |
| fully synthetic self-signed pair (own keys) | the counter's fresh in-invocation challenge cannot be answered without the run private half, which never persisted | `controls/c1-synthetic-refused.json` (`challengeVerified: false`) |
| scoring old committed receipts (r39–r42) | schema/measure-record mismatch plus the challenge wall on direct invocation | `controls/c1-replay-r42-refused.json` (exit 1) |
| tampered measure record (field flipped, signature stale) | Ed25519 verification over the canonical unsigned form fails | `controls/c1-relabel-refused.json` |
| loader/environment injection before the browser spawns | kernel `/proc` environ gate + pinned producer digests (r40/r41 chain, unchanged) | `controls/c1-battery-r43.json` (7/7) |
| self-authored measure record in a committed-bytes checker (C2 side) | the record's git blob id is pinned to the immutable r41 object `8ff64d691f5c09569a50f2a5a038bb23774c3d35` (`git cat-file` "Instead of the content, show the object type identified by" — S151 — for the blob/tree discipline) | `controls/c2-v0-probe.json` (v2 refuses; r42 checker bytes green the same fixture) |
| tree object scored where the sentence says blob | `git cat-file -t` blob gate before any size floor | `controls/c2-tree-fixture.json` (`r1a-not-a-blob`) |

## Rules distilled (each falsifiable by the cited control)

1. A receipt-carrying claim's predicate names its authentication layers and a DECLARED residual
   model before data: key harvest requires a prior honest run (not do-nothing); process-memory
   and kernel-level attacks stay out of scope; on-disk pin tampering is caught by committed-byte
   re-derivation at closure.
2. The counter is not a general CLI: strict argv (no `--pins`, no `--nonce`), no offline scoring
   mode, and a challenge-response that only a real invocation's key can answer.
3. An independent witness signs its own samples with its own per-invocation key; the wrapper
   learns only the public half, so wrapper collusion cannot forge the attestation it records.
4. Every control the freeze names is bound by sha256 plus a verbatim quote line from the control
   bytes (r42 closure conformance defect 1), so a freeze cannot drift from the controls it cites.
5. Evidence files over 1 MiB are committed as explicitly named files — the lane helper skips
   larger new files inside a named directory (r41 defect D1; walked into again and caught by
   `git ls-tree` at the freeze this round before any citation).

## Falsification

Counter v5 (`.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`) refuses the committed r42
receipt (exit 1), self-signed synthetic pairs (challenge wall), tampered measure records
(`measure-signature-invalid`), and strict-argv violations (exit 2). The live chain measured
clean on 2026-10-29 (exit 0, predicate true, spans 18,588/25,649 ms, egress 0). A first live
attempt the same day was refused by the round's own counter with 46 real `*-egress` findings —
one non-loopback owned socket late in run 1, absent by run 2 — after which the driver/counter
were hardened pre-freeze to record `nonLoopbackRemotes`; the predicate was not loosened.

## Limitations

- A hostile invoker who harvests a per-invocation private half during an honest run can sign
  fabrications of that run; the model declares this residual because the harvest itself requires
  the browser run the capability claims.
- Rescoring a genuine prior pair inside a new invocation re-proves that honest run only; the
  claim predicate's commitment clause (receipt committed at the measured revision) is what binds
  evidence to this round.
- JS cannot zero a KeyObject; "never persisted" is a code-path property (no write path carries
  key bytes), not a memory-hygiene guarantee.
- The egress-count clause remains honest-run-observable: a lying driver zeroing counts produces
  internally consistent receipts (round-37 planned blind class, re-classified by the round-43
  wave's MutDriverEgress item).
