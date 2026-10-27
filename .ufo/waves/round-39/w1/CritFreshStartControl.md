# CritFreshStartControl scoped findings

Detailed evidence and review are in `.ufo/waves/round-39/w1/CritFreshStartControl/report.md`.

The C1 design explicitly differs from round-38's rejected receipt: owned nonempty process tree, dual-surface sampling duration/count, final sweep, session-derived version, and explicit v1 refusal. C2 explicitly adds mutation-run provenance, source census re-derivation, and exact REV numstat re-derivation. Those are relevant discriminators, not mere claims of larger counts.

Remaining falsification risk: copying a plausible v2 receipt or count-only evidence could appear successful if assertions are trusted rather than independently tied to live session observations; similarly a C2 receipt repeating tally/window text is not proof absent actual counter invocation against mutated claims and independent diff/census. The frozen contracts specify controls but this seat did not execute them, so do not treat this review as observed refusal evidence. Run-10's relevant practice is exact command/revision/output/read time, byte-based re-derivation, and verifier artifact provenance; its historical wave-size rule does not alter round-39 frozen seat count.

VERDICT finding — round-38 failure class is explicitly addressed by frozen terms, but counter refusals against replay/count-only mutants remain unobserved in this review.