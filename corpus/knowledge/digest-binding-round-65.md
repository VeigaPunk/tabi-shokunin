source: S170 (NIST FIPS 180-4, Secure Hash Standard, SHA-256 digest semantics; https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf, PDF sha256 0455b406d89648d20cbde375561e19c245b9815e894164c2670772e3d54deb82, fetched 2026-11-05)
verified-at: 4a3481048cb3afd0d6068fdbc1421dfec4f06084
recheck: bash .ufo/waves/round-65/counters/run-controls-r65.sh --rev <REV> --out <ABS> (C2-A exit 1 with three matrix-input findings; C2-B exit 0; the FIPS 180-4 quote is re-checked against the PDF on release)

# Digest binding: what a sha256 equality proves (round 65)

Claim C2 (`.ufo/waves/round-65/claims.json`, frozen at 03f35fe7) binds each matrix's
named input to a file whose sha256 equals the pinned digest. The digest definition
is S170. Located quotes (fetched 2026-11-05; the extraction carries the sentence
across a page break at PDF lines 1095–1096):

- §6.2.2, printed p. 23: "the resulting 256-bit message digest of the message, M, is"
- §6.2, printed p. 21: "SHA-256 may be used to hash a message, M, having a length of l bits, where 0 <= l < 2^64."

## What a digest equality proves

- The named input resolves to a file and that file's bytes hash to the pinned value.
  S170 defines SHA-256 as a function from a bit string of length under 2^64 to a
  256-bit digest. The same bytes give the same digest, so a pinned digest and a
  recomputed digest agree on the bytes that were hashed.
- A mismatch means the bytes at the path differ from the pinned bytes. This is the
  `input digest mismatch` finding. Observed: `c1-fab/matrix-fab2.json` pins a wrong digest
  and is refused with that finding at 4a348104.
- That equal digests identify the bytes depends on SHA-256 being collision-resistant.
  S170's quoted sentences define the computation and the output length; they do not
  state collision resistance. That reading is `[INFERENCE]`.

## What a digest equality does not prove

- Authorship. Byte identity is proved; who produced the bytes is not. S170's scope
  is "byte identity, not provenance", and the quoted sentences define only the
  computation.
- Execution. Observed: v2 over `controls/c1-fab/` reports only `matrix-input` findings
  (3), so the twelve invented command receipts pass the receipt checks. Those receipts
  describe runs that never happened and carry self-consistent digests. The round-64
  reviewer built the same population (`.ufo/waves/round-64/w1/R64Reviewer.md` H5, E6c).
  This is a declared residual of C2, not a finding the gate can refuse.
- A pin written by the same producer as the matrix. The pinned digest is
  producer-declared (QUALITY 118), so a forger who writes both the matrix and its pin
  passes.

## Reading the gate

v2 adds one fact to v1: a matrix cannot name an absent input or carry a wrong pin.
It measures byte binding of matrix inputs. It does not measure that the named runs
executed, and it does not measure who wrote the pin.

## Recheck

`run-controls-r65.sh` at the scored revision: C2-A exit 1 with exactly three
`matrix-input` findings; C2-B (round-64 scored population) exit 0 with two matrices
checked; C2-C (honest fixture) exit 0.
