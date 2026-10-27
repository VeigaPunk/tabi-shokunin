# MutD7Variants — round-39 w1 seat summary (mutation: v2 d7 sentence-mutant refusal)

Ran the frozen `c2-routed-defects-v2.mjs` (sha `eefc8997…`, = frozenDigests + blob at REV `1ace2fde`) on claims fixtures in isolated scratch clone at `--rev 1ace2fde --repo <scratch clone>`:

- **m1-punct** (`stale-line-present`→`stale_line_present`, one hyphen→underscore): `FINDING d7-sentence-mismatch`, exit 1.
- **m2-ws** (one inserted space in `hash present  and ancestor`): `FINDING d7-sentence-mismatch`, exit 1.
- **m3-case** (`AND`→`aND`, one letter): `FINDING d7-sentence-mismatch`, exit 1.
- **m4-num** (`seats == 34`→`== 35`, one numeral): `FINDING d7-sentence-mismatch`, exit 1.
- Controls: pristine claims (`ed88855a…`) → no d7 finding, `d7=true`; restored post-run pristine byte-identical (`ed88855a…`), same clean result. Pristine exit 1 is from unrelated `d5-receipt`/`d6-file` (round-39 receipts absent at this tip REV), identical across all legs — d7 is the only discriminating leg, so mutants are killed, not inconclusive.
- Supplementary: single-point mutation in claims[0] (C1 predicate) does not trip d7 — D7 binds `claims[1].predicate` only (no index confusion / no bypass in that direction).

All mutants differ from pristine by exactly one asserted-unique substitution; fixture + output evidence retained in `.ufo/waves/round-39/w1/MutD7Variants/{fixtures,out,run.log,hashes.txt}`; scratch deleted.

VERDICT ok — all four enumerated mutants (punctuation, whitespace, case, numeral) refused by the frozen v2 counter with d7-sentence-mismatch and nonzero exit; pristine/restored controls clean on the d7 leg
