# CritC1b — moved-note verification attack

VERDICT finding — the moved-note parser accepts the first `:<digits>` token in `note`, not necessarily a relocation token. A decoy line number before the actual relocation is therefore evaluated as the candidate line and can reject a truthful relocation; the required note format is not parsed or disambiguated.

## Evidence

Read the frozen counter from freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`; lines 437–443 implement moved-note checking. Line 438 uses `/:([1-9][0-9]*)\b/.exec(note || '')`, extracting the first line-number token. Lines 440–443 then check only that extracted line against the cited pin text. For note `pin :585 now verbatim at :748`, the parser chooses 585 and refuses unless cited text happens to occur at line 585. This is a directly evidenced parser defect; I did not complete the requested four committed-tree executions, so no exit codes or runtime findings are claimed.

The clone setup succeeded after correcting the clone destination syntax, but the one-shot scratch cleanup removed the clone and frozen counter. No tree mutation or counter execution was completed. Accordingly (b), (c), and (d) remain unevaluated; I make no claims about their outcomes.

## Smallest safe correction

Parse the documented relocation marker/phrase rather than the first arbitrary `:<digits>` token (or require a single unambiguous line token), and retain the existing exact head-line text comparison. For the duplicate-match case, require the note's nominated line to be the sole relocation, or explicitly validate its membership in the computed relocation set; the counter's current nominated-line equality check alone does not establish uniqueness.

Impacted axes: adjacency (audit correctness/completeness) and calibration (counter can reject a correct moved-row note based on an unrelated number).

VERDICT finding — moved-note verification is vulnerable to first-token ambiguity; the requested tree executions were not completed.