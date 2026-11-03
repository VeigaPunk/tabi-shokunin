# QUALITY.md criterion 112 — draft (R60Scribe, pre-data)

Target: `corpus/QUALITY.md`, appended AFTER criterion 111 (the `## Round 59 additions` block ends at 111). Append-only: the L1 adds the heading below at the end of the file and never edits criteria 1–111.

Pre-data status: this is a draft of the criterion text. No round-60 result is stated or implied.

---

## Round 60 additions (append-only; never edit above)

112. The forgery-probe and mutant coverage rule: a counter that enforces a frozen kill rule
    carries (a) one selftest case per enumerated forgery probe named in the frozen rule, and
    (b) one kill per named mutant in the frozen mutant list; and its selftest exercises the
    PRODUCTION call path (the entry point the live gate invokes on a receipt), not only the
    leaf functions the rule's clauses are built from. A frozen probe with no selftest case,
    or a named mutant with no killing case, is a coverage gap, and the criterion's counter
    is not green until the gap is closed or the rule's wording is changed as a new claim.
    Red state: the round-59 chromium receipt counter enforced the frozen f6 rule for
    presence and value of the non-`cancelable` fields, but its 91-case selftest had no case
    for the `cancelable` path. Probe A (first CapsLock keydownEntry `cancelable: false`) and
    probe B (the same entry with `cancelable` deleted) both exited 0 with `findings []` on
    the canonical counter, and mutant C6 (remove the cancelable presence and value checks)
    SURVIVED with 91/91 still green (`corpus/lessons/round-59.md` Mistakes 1). A second red
    state is the same lesson's Mistakes 3: the counter crashed on every receipt
    (`add is not a function`, a 7-parameter function called with 6 arguments) while the
    91-case selftest passed, because the selftest drove the leaf functions and not the call
    site the live gate uses. The criterion requires the call path to be driven: a selftest
    case that invokes the counter's production entry point on a fixture receipt and asserts
    the finding it must produce. (source: `corpus/lessons/round-59.md` Mistakes 1 and 3)

---

## Notes for the L1 (not part of the criterion text)

- The criterion is written as a counting rule, so a reviewer can check it with the counter's own selftest listing: count the forged-probe case ids against the frozen probe set, count the mutant kill receipts against the frozen mutant set, and confirm one selftest case invokes the entry point the live gate calls.
- Evidence pointer is limited to the two round-59 Mistakes the rule names. It does not cite the round-60 result, which is measured after the instrument freeze and is not known at drafting.
- Criterion 112 has no red-state receipt of its own in this draft. The two red states above are cited from the round-59 lesson, which is committed, so the citation is checkable at `corpus/lessons/round-59.md`.
- Prefer the full evidence path form if any citation is added in the final text, to satisfy criterion 110.
