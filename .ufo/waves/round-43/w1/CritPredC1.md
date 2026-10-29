# CritPredC1 — C1 sentence identity at three sites

**Axis:** calibration. **Counterexample:** none found for this sentence-identity check.

## Commands and observed evidence

Executed from `/fast/scratch/hyaku/tabi-r43/CritPredC1`:

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritPredC1/extract-sentence-identity.mjs
```

The script extracted the three C1 sites and three C2 sites, unescaped `\'` in each JavaScript `PREDICATE` literal, SHA-256 hashed each UTF-8 sentence, and compared the bytes pairwise. Its complete stdout is preserved verbatim in `.ufo/waves/round-43/w1/CritPredC1/extraction-output.json` (the script writes the same rendered JSON to that file and stdout). Results:

| Sentence | Sites | UTF-8 bytes | SHA-256 at each site | Pairwise byte diff |
|---|---:|---:|---|---|
| C1 `claims[0].counterPredicate` / counter header / unescaped constant | 3 | 1,343 | `9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598` | all identical; each `firstByteDifference` is `null` |
| C2 `claims[1].predicate` / checker header / unescaped constant | 3 | 1,314 | `49f7a1e787fd226157c0b9aed72b5d6936dc750392b2f72f4839bb79160cb969` | all identical; each `firstByteDifference` is `null` |

C1 composition also passed: `claims[0].predicate` starts with the exact bytes of `counterPredicate` (SHA-256 `9bc9545343000b4806cd9628d97ba63e390fdda64104da62a250a8ea2fe75598`); its exact appended remainder starts ` THE CLAIM:` and concatenating prefix plus remainder reconstructs `predicate` byte-for-byte. The `predicate` SHA-256 is `a618794009af6b528b6698db91a2a9372ff8b22f65dcffc25694d77369f22205`. The full suffix is in the extraction JSON.

Evidence script SHA-256: `e50bb2f660149596a63a6c37519ab165ce7bd832d096c519a128bba5b9df4609`.
Extraction JSON SHA-256: `a67c5846a557ff228ca7a1144c1af26659fd1ff073ec9e8a5656f00206007c91`.

The C1 and C2 counter files' actual SHA-256 values matched their `claims.json` `frozenDigests` values. Read-only committed-blob cross-check:

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/claims.json | sha256sum && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs | sha256sum && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/counters/check-routed-defects-round43.mjs | sha256sum
```

Observed stdout, in order:

```text
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  -
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  -
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  -
```

These equal the corresponding working-file hashes recorded in the extraction output; the C1/C2 source hashes also equal the freeze's expected digests. No files outside this report and `.ufo/waves/round-43/w1/CritPredC1/` evidence were written. No tools were installed.

## Impact and smallest safe correction

Calibration sentence-identity milestone: no discrepancy to route and no correction needed. Frozen bytes were not changed. This check does not evaluate browser execution, counter behavior, battery results, or either claim's operational predicate.

VERDICT ok C1 and C2 sentences match byte-for-byte at all three sites; C1 claim suffix composition matches.