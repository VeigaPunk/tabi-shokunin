# Round 65 — lesson

Round 65 builds two instruments for two claims that freeze after the wave: C1
(adjacency: the v22 meter refuses a delta ledger that gives one lane, path and
line two different dispositions) and C2 (calibration: the v2 receipt gate binds
each matrix's named input by sha256). Base `58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`.
This lesson records the Gate and the two mistakes the round-64 review routed to
this round. It records no verdict on either claim.

## Gate

Opened 2026-11-05. Located evidence is named per row.

| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S170 NIST FIPS 180-4, Secure Hash Standard, SHA-256 digest semantics | Admit as tier A `spec`, scope "SHA-256 digest semantics (byte identity, not provenance)" | Located evidence: `.ufo/waves/round-65/w1/R65Scout/fips-quote.txt` §4. The PDF at https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf (fetched 2026-11-05, 833,315 B, sha256 `0455b406…deb82`) carries "the resulting 256-bit message digest of the message, M, is" (§6.2.2, printed p. 23) and "SHA-256 may be used to hash a message, M, having a length of l bits, where 0 <= l < 2^64" (§6.2, printed p. 21). Both quotes were confirmed by two independent extractions. Flip: the row grounds the digest computation and its output length; it does not ground authorship, execution or the honesty of a receipt. |
| S140 Firefox 158.0.1 release directory, published SHA256SUMS | Reject | Published digest and detached signature for one Firefox artifact; its scope excludes digest semantics. Flip: a claim that one specific Firefox tarball is the published one would cite S140 for that scope. |
| S141 geckodriver v0.37.1 release assets and digests | Reject | Published digests for one tool's release assets; S141's own scope excludes everything but the asset list and the signature subkey. Flip: as S140. |
| S150 Node.js Crypto documentation (sign, verify; held since round 43) | Reject as a new citation | Signatures bind a key holder; C2's predicate is a digest equality with no key. The held row keeps its round-43 scope unchanged. Flip: a claim that a receipt was authored by a named key. |
| S142 git-show `<rev>:<path>` object read (held) | Reject for this round | Addresses committed blobs by revision. C2's predicate resolves a path, hashes its bytes and names no git object read. Flip: a claim that a matrix input is the committed blob at REV. |
| Any secondary SHA-256 explainer (no URL opened) | Reject | An unopened source cannot ground a predicate. QUALITY criterion 15 keeps the opened A/B requirement and the tier-C prohibition. |
| An external source for C1 (adjacency delta dispositions) | No row | The C1 predicate is own-work: the v21 selftests and the round-62 committed ledgers. No external claim is made. |

Registry: S170 is a new id. No existing row cites FIPS or NIST
(`grep -ciE 'fips|nist' corpus/SOURCES.md` → `0` at the base), so no URL is
appended twice. The row's `status` is `queued` and its `used-by` is `—` until a
landed knowledge entry cites it (`corpus/knowledge/digest-binding-round-65.md`,
landed by the L1), at which point the row becomes `mined`.

Spot-check: pending (non-author)

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `vacuous` | Round-64 C2's frozen target (0 failures, at least 12 receipts, each naming a committed revision) was reached by a population of never-executed receipts with invented stdout and matching digests. `corpus/lessons/round-64-verifier-spotcheck.md` §2 C2 ("reachable without work", and the unmet §9 do-nothing rule); `.ufo/waves/round-64/w1/R64Reviewer.md` H5 and E6c (12 receipts plus two matrices gave `checked=14 matrices=2 failures=0 ok=true`). | none | This round freezes C2's do-nothing control before data: v1 over the fabricated directory exits 0 with failures 0, and the kill rule refuses v2 unless it reports exactly the two `matrix-input` findings (`.ufo/waves/round-65/claims-draft.md` C2). |
| `number-drift` | Round-64 lesson `## Wave and measured disposition` says the round "closed with a residual wave w2 of 4 seats" (`corpus/lessons/round-64.md` lines 95–96). No w2 bytes exist: the round-64 tree lists only `w1` at `58ed8c7a`, and at `40095308` (cited by the assignment; the run-15 wrap-up snapshot, not the landed lesson). The phantom wave is routed as D1 in `corpus/lessons/round-64-verifier-spotcheck.md` §5. | none | An erratum in the round-65 wave, `.ufo/waves/round-65/w1/R65Scribe2/`, naming the superseded sentence, plus the sweep below. |

Sweep (run from the lane; expected output in the comment):

```sh
git -C <LANE> ls-tree -r --name-only 58ed8c7a -- .ufo/waves/round-64/ | cut -d/ -f4 | grep -E '^w[0-9]+$' | sort -u   # expect: w1
git -C <LANE> grep -n 'w2 of 4 seats' 58ed8c7a -- corpus/lessons/round-64.md   # expect: line 96 until the erratum names it
```

Failability: the first command prints `w2` if a residual wave ever lands;
the second prints a hit with no erratum naming it when the defect is still
unrouted.
