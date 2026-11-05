---
source: S170
verified-at: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162
recheck: node .ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs --dir .ufo/waves/round-65/controls/c1-fab --repo . --rev <FREEZE> --require-committed --min-receipts 12 --json
---

# Digest binding: what a sha256 equality proves (round 65)

Claim C2 (`.ufo/waves/round-65/claims-draft.md`, frozen after the wave): "v2 admits
a receipt directory at REV iff every receipt passes the v1 checks AND every matrix's
named input resolves to a file whose sha256 equals the matrix's pinned sha256."

The source for the digest definition is S170 (NIST FIPS 180-4, August 2015, `spec`,
tier A, scope "SHA-256 digest semantics (byte identity, not provenance)"). Located
quotes, fetched 2026-11-05 (PDF sha256 `0455b406…deb82`):

- §6.2.2, printed p. 23: "the resulting 256-bit message digest of the message, M, is"
- §6.2, printed p. 21: "SHA-256 may be used to hash a message, M, having a length of l bits, where 0 <= l < 2^64."

## What a digest equality proves

- The named input resolves to a file, and that file's bytes hash to the pinned
  value. The standard defines SHA-256 as a map from a bit string of length under
  2^64 to a 256-bit digest (S170, §6.2 and §6.2.2). The same bytes give the same
  digest, so a pinned digest and a recomputed digest agree on the bytes that were
  hashed.
- A mismatch means the bytes at the path are not the pinned bytes. This is the
  `input digest mismatch` finding.
- Equal digests identify the bytes only under the assumption that SHA-256 is
  collision-resistant. The quoted sentences define the computation and the output
  length; they do not state collision resistance, so that reading is `[INFERENCE]`.

## What a digest equality does not prove

- Authorship. Who produced the bytes is outside the predicate. Byte identity: yes.
  Authorship: no. S170's scope says so ("byte identity, not provenance"), and the
  quoted sentences define only the digest computation.
- Execution. A receipt whose digests agree with each other can describe a run that
  never happened. Observed: the round-64 reviewer built 12 receipts for runs that
  never happened, with invented stdout and matching digests, and v1 passed them
  (`checked=14 matrices=2 failures=0 ok=true`; `.ufo/waves/round-64/w1/R64Reviewer.md`
  H5 and E6c). The round-65 claim declares those 12 as a residual, not a finding
  (`claims-draft.md` C2; fixture `.ufo/waves/round-65/controls/c1-fab/`).
- That v2 refuses the fabricated population. This is not observed. It is the frozen
  target of the round-65 run. `[INFERENCE]`: v2 also passes the 12 receipts, since
  v2 adds only the matrix-input check and leaves the v1 receipt checks unchanged.

## Reading the gate

A fabricated receipt with self-consistent digests passes v1 and v2. What v2 adds is
that a matrix cannot name an absent input or carry a wrong pin. The gate measures
byte binding of matrix inputs. It does not measure that the named runs executed.

## Recheck

The command in the front matter should exit 1 with exactly the two `matrix-input`
findings (the absent path and the wrong pin), with the 12 invented receipts adding no
failure. `<FREEZE>` is filled with the frozen revision when the L1 lands this entry.
