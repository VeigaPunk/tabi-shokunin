# ExecRegistryProto — baseline parser evidence

Axes: operability (registry completeness); parser correctness (ambiguity accounting); reproducibility (revision-pinned bytes).

## Result

Command: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 573c99e4885382db38babc3a6fc90e77afeb42a6:SKILL.md` (read-only; bytes consumed by throwaway Node parser). Resulting prototype JSON:

```json
{
  "rev": "573c99e4885382db38babc3a6fc90e77afeb42a6",
  "nonconformant": 0,
  "gates": [],
  "ambiguities": []
}
```

The empty result is a parser defect, not evidence of conformance. The cheap prototype selected only headings beginning `Registry`, then incorrectly used a fixed slice of four registry sections and expected a `.mjs` token in the name cell. Baseline's runnable-gate registries instead have headings `Round-21 runnable artifacts registry` and `Round22 runnable artifacts registry`, with columns `Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner`. Their rows name scripts in entry-command cells. The prototype thus missed all four gate rows. Exact baseline table locations (from `git show` line enumeration): 2388-2391 and 2433-2436.

## Predicate ambiguity / resolution

The eight-field list is specified semantically, while the existing table has separate `Name` and `Kind` cells, yielding eight columns including `Owner`; the first field is therefore represented by the name cell and the gate|probe discriminator by `Kind`. For prototype review, required-field presence should mean nonempty corresponding cell, with the `Kind` cell constrained to exactly `gate` or `probe`; entry command and self-test are required as text, not a particular filename extension. Verdict-map semantics need parseable mappings for codes 0, 1, and 2 (the baseline rows express these). A later row supersedes an earlier row for the same normalized gate name, in document order. These resolution choices are explicit prototype design judgments, not fully validated field grammar.

Observed rows were single physical lines; no multi-line rows occurred in the two runnable-artifact tables. Prose-like values occur in verdict-map, pinned-value, and write-scope cells and should be treated as cell text, not mistaken for additional columns. The entry commands name wave scripts outside `scripts/` (for example `.ufo/waves/round-21/measure-c1.mjs`): path location is not a conformance predicate; derive script identity from command text and resolve against revision blobs. Ambiguity sweep: the two tables only, at lines 2388-2391 and 2433-2436 of the baseline `SKILL.md` from the command above.

## Prototype implementation note

A throwaway <=150-line Node prototype was exercised in-memory against `git show` output; no tracked files were changed and no tool was installed. Its emitted empty JSON above demonstrates the false-clean risk directly. Production gate must discover the actual runnable registry headings/table headers rather than infer them from a literal `Registry` heading or `.mjs` in the name column, and must fail closed when no eligible registry rows are parsed.