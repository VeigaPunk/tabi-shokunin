# Round-86 lesson proof — evidence status

The round-86 lesson's `## Mistakes` rows 1 (`witness-polarity`) and 2 (`guard-inversion`) cited
"`scored/witness-a.json` first two runs" as their evidence. That citation is wrong about the
committed bytes: `scored/witness-a.json` is the FINAL run of the twelve conjunct-scoped families
(before 3 survivors / after 0), and the two earlier wrong-generation transcripts were never
committed. The round-86 non-author spot-check routed this as defect 4; round 87 repointed both
cells here.

What is retained and verifiable (no reconstruction claimed):

- `corpus/lessons/round-86.md` §Mistakes fixes: the families are `extra !== 'sp84-cross-origin-tel' || <conjunct>`
  (conjunct-scoped), committed in `scripts/witness-families-r86.mjs`.
- `.ufo/waves/round-86/scored/witness-a.json`: the final split — BEFORE (r85 battery) **3**
  survivors, AFTER (r86 battery) **0**; the before-value is the fail-able proof that the frozen
  battery's reach changed with the fix.
- Git history of `scripts/witness-families-r86.mjs` carries the family definitions as committed.

Not retained: the transcripts of the two wrong family generations ("whole law skipped" and the
inverted guard). They are recorded in the lesson as mistakes, not as verified observations; this
note exists so no reader treats an absent artifact as committed evidence.
