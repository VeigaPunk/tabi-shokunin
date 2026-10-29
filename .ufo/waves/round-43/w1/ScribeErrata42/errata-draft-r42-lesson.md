# Draft errata — round-42 lesson lines that the round-43 chain supersedes

**Status: DRAFT, NOT APPLIED.** `corpus/lessons/round-42.md` was not edited by this seat
(sha256 `7da6dfebb19ea1a7b645529359c5dcbc6170ab823494bbd7d2c1a8319bf1c3f2`, blob at
`7ca6f01` and at `ba433c94`). Round lessons in this lane are per-round files
(`corpus/lessons/round-42.md` is a historical record of round 42); the text below is drafted
as a **carried-forward paragraph for the round-43 lesson** (`corpus/lessons/round-43.md`,
present in the working tree, not yet committed) rather than as an append to the round-42 file.

Three items in `corpus/lessons/round-42.md` are materially superseded by what the round-43
chain built. Two are discharged routes (the lesson's own words), one is an as-routed /
as-built divergence that the round-43 lesson should state rather than leave implicit.

---

## 1. Route discharged, but not in the routed shape — `corpus/lessons/round-42.md:128`

The round-42 Mistakes table routed the "counter authenticity (vacuous)" class to round 43 as:

> Routed to r43: receipt authenticity (wrapper signs with a per-invocation key, **public half
> pinned in claims**; counter refuses unpinned `--pins`).

What round 43 built is a stricter mechanism than the routed text describes:

- **No public half is pinned in the claims.** `.ufo/waves/round-43/claims.json` has no
  key-related field at all (top-level keys: `schema, lane, round, baseline, declaredAt,
  axesAtRoundStart, saturation, stagnationWindow, lowestAxis, stagnationNudge,
  freshStartNote, causalSeparation, producerPins, frozenDigests, sentenceIdentity, claims,
  controlBindings, controlBindingRule`; `grep -n "pubkey\|publicKey\|ed25519\|key"` over the
  file hits only the C1 prose). A per-invocation public half cannot be pinned in a freeze
  written before any invocation exists; the public half lives in the signed measure record
  instead, and the freeze pins the **producer digests** and the **control sha256 + verbatim
  quote** pairs.
- **There is no `--pins` flag to refuse.** `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs:239`
  reads: `if (args.length !== 3 || args[1] !== '--measure') die('usage: node
  c1-signature-bound-v5.mjs <receipt.json> --measure <measure-record.json> (wrapper-invoked
  only; no --pins/--nonce/--witness)')`. The route's "counter refuses unpinned `--pins`" is
  realized as *the flag does not exist*, plus a fresh 32-byte challenge written to fd3 and
  answered on fd4 (lines 244–265) that only the invocation's private half can sign.

**Carried-forward paragraph (round-43 lesson):** the r42 route is discharged by a
*stronger* mechanism than the route text named — per-invocation Ed25519 wrapper key with the
public half carried in the signed measure record (not pinned in the freeze), a self-attesting
witness under its own key, and a per-invocation challenge wall on a counter whose argv
admits no `--pins`/`--nonce`. The freeze pins what is pinnable before data (producer digests,
control digests, control quotes).

## 2. Route discharged — `corpus/lessons/round-42.md:68`

The round-42 C2 disposition recorded the repair path as "pinned measure blob id
`8ff64d69…` + a verdict-probe scoring 0/38 on V0". Round 43 implements both:

- `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs:27` pins
  `MEASURE_BLOB_PIN = '8ff64d691f5c09569a50f2a5a038bb23774c3d35'`; the pin still resolves at
  HEAD — `git rev-parse HEAD:.ufo/waves/round-41/measure/c1-measure.json` returns exactly that
  object id, and `git cat-file -t` on it returns `blob`.
- The r6 rule requires the committed probe `.ufo/waves/round-43/controls/c2-v0-probe.json` to
  record `refused: true` and to name the finding `r1-measure-blob-pin-mismatch`.

Reproduced 2026-10-29 by running the committed generator
`.ufo/waves/round-43/fixtures/v0-fabrication.mjs` (digest `b8747062…`, equal to the
`generatorDigest` recorded in the committed control) in scratch: round-42 checker bytes →
exit 0, `findingIds: []`; round-43 checker bytes → exit 1 naming
`r1-measure-blob-pin-mismatch`. **Carried-forward paragraph:** the round-42 route for C2 is
discharged; the round-42 checker is now the historical instrument that greened V0.

## 3. Superseded for new chains only — `corpus/lessons/round-42.md` C1 section

Three round-42 findings about the *counter* are superseded **for chains frozen from round 43
on**, and only for those:

| round-42 finding (lesson text) | status after round 43 |
|---|---|
| "the r41-replay control itself is defeated by nonce relabeling" | superseded for new chains: the wrapper signature covers the measure record's receipt binding, so a relabeled receipt no longer hashes to the signed binding (control `.ufo/waves/round-43/controls/c1-relabel-refused.json`, finding `measure-signature-invalid`). The round-42 counter bytes are still defeated by relabeling — that is history, not a live hole. |
| "a hand-written receipt naming pid 1 as firefox" reaches predicate true | superseded for new chains by the same signature layer plus the challenge wall; the counter also checks `browserVersion`, `firstShotSha256` and per-sample socket usability. |
| "the in-process nonce binds only the live wrapper invocation, not scored-over-committed-bytes scoring" | superseded for new chains by the fresh in-invocation challenge (a nonce alone is not enough to score committed bytes; the challenge must be answered under the wrapper public key inside the invocation). |

**Carried-forward paragraph:** the round-42 C1 refusals stand as the round-42 record and are
**not** re-litigated here; what changed is the instrument class that follows them — a receipt
is scored under a signature and a challenge wall, not under a nonce.

**Caveat, stated because the r42 lesson's discipline demands it:** all of the above is a
statement about **instrument bytes**, not a claim verdict. `.ufo/waves/round-43/claims.json`
still carries `"verdict": "pending"` for both C1 and C2; the round-43 admission decision is
the closure's, and this paragraph asserts nothing about it.
