# ReviewPriorHistory — round 21 historical boundary

## Scope and verdict

Axes in scope: depth (the round-21 scalar remains 8), calibration, and operational/no-harm integrity of the frozen history gate. This is a first-falsification review of prior-history boundaries, not a runtime/counter verdict.

**No round-21 rewrite or new history-refusal event is established by the inspected candidate artifacts. The implementation is not reviewable yet:** `clones/BuildRuntime/` was empty, and the existing `clones/BuildCounter/` checkout had no `.ufo/waves/round-21/` directory or target counter file when inspected. I did not wait, edit, integrate, run checks, run tests, or invoke a browser. This is not a pass claim.

## Finding — blocking if triggered: do not grow the frozen lesson-history refusal set

The exact historical failure shape is a later `M/D/R/T` commit for a newly added lesson, even if the file is restored byte-for-byte at the current tip. Round 20's helper examines both the final blob and path history: it gathers changed lesson paths at `lesson-history.mjs:12-15`, collects `M/D/R/T` commits after its pin at line 16, and marks a newly added lesson refused when any such later commit exists at line 17. Its declared scope is only `lessonDrift`, not the complete USER gate (`:19`).

The preserved evidence establishes the current inherited set, not a clean gate:

- Round 19's independent falsification found that the unchanged first USER error concealed refusal growth from `{round-18.md}` to `{round-18.md, round-19.md}` (`.ufo/waves/round-19/w2/CriticNoHarm.md:68-83`).
- The orchestrator explicitly ruled that this inherited growth is to be **documented, not fixed**, with the refusal kept at 2 and no frozen-gate/history edit (`.ufo/waves/round-19/final/l0-ruling.txt:1-5`).
- Round 20's retained enumeration at revision `e41ae33c238540a469e4a031fad3ad00ef112616` reports the refused list as exactly `corpus/lessons/round-18.md` and `corpus/lessons/round-19.md`; its `round-20.md` record has no later `M/D/R/T` commit and is not refused (`.ufo/waves/round-20/final/lesson-history.json:5-10`). This is the historical lessonDrift result, not a complete-gate result.
- Round 20 explicitly says not to rewrite prior lesson/gate/report history (`corpus/lessons/round-20.md:7-8`) and says the inherited red USER production gate was deliberately not rerun; its lesson-history predicate must gain no refusal (`:49-51`). Round 19 likewise requires the expanded refusal to remain disclosed even when historical exits match (`corpus/lessons/round-19.md:157,163-164`).
- Round 21's shared contract says “Do not revise prior lessons, especially round18/19/20” (`.ufo/waves/round-21/w1-spec.json:3`).

**Falsifier:** any round-21 commit that modifies, deletes, renames, or re-adds `corpus/lessons/round-18.md`, `round-19.md`, or `round-20.md` violates the stated no-rewrite contract. In particular, a later modification event for the newly added round-20 lesson makes the existing round-20 history helper refuse `round-20.md` too, expanding the known set from 2 to 3; reverting its bytes afterward does not erase the `git log` event used by line 16. Modifying round 18/19 is independently out of scope even though those paths already appear in the inherited refusal set.

**Minimum acceptance condition:** preserve all three existing lesson files unchanged; at the final candidate revision, retain the round-20 helper's lessonDrift result with the known refusal set still exactly `{round-18.md, round-19.md}` and no new refusal for round 20. Treat unchanged first-error text or equal exit codes as insufficient evidence of no-harm. Do not rerun the inherited red production gate as a proxy for enumerating its refusal set.

## Historical semantic boundary relevant to round 21

Round 17 already observed a non-autosubmit invocation with no response during a 2500-ms window, followed by page `requestSubmit()` and a correlated `Completed` response (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:71-73`). Round 20 explicitly retains this as a rejection of the “only human submission can finish a non-autosubmit call” framing, not as a new round-20 experiment (`corpus/lessons/round-20.md:22-28`). This supports the round-21 contract's “Do not call script submission human-only” clause; it does **not** predict round-21 outcomes or establish universal semantics. Round 21 must report its own raw finite observations separately from source inference, as its shared contract requires (`w1-spec.json:3`).

## Review gaps

- No BuildRuntime implementation or BuildCounter round-21 file was present at inspection; no implementation behavior can be signed off from this review.
- The `lsp` device is not mounted in this session (`read xd://lsp` returned “No such tool” and listed available devices without LSP). No LSP status/references/definitions/diagnostics were available; no grep result is presented as semantic proof. The review relies on direct reads of the cited historical artifacts.
- No tools were installed or updated.

Report: `.ufo/waves/round-21/w1/ReviewPriorHistory.md`
