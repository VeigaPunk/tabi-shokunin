# RevFrozenDigests — round 36 wave 2

At landing `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`, all eight paths listed in `claims.json` `frozenDigests` hash to their expected SHA-256 values, including both annotated gate-script paths resolved to bare paths. The S125/S142 landing did not alter these frozen bytes.

## Finding — predicate sentence identity

The required verbatim three-way identity fails for C1 and C2:

- **C1:** `claims.json` predicate is not the frozen counter header sentence. The counter header specifies extra conditions (stale-row redisposition, delta total/accounting, and frozen-head resolution) and uses distinct wording for completeness/drift metrics.
- **C2:** the claim predicate matches the counter's `predicate` field, but the counter header line ends with a period and the next header-comment text begins `Write scope:`; taken as a sentence, the header is not verbatim-identical to the claim/field sentence.

Smallest correction: align each claim, counter header, and predicate field verbatim, preserving any intended predicate conditions consistently.

VERDICT finding — C1 and C2 predicate-sentence identities drift; all 8 frozen digests match.
