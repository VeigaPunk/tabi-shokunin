# Round 59 — Corrections of record (DRAFT for the L1 to land in `corpus/lessons/round-59.md`)

Seat R59Scribe, round 59 wave w1, 2026-11-03. **DRAFT ONLY — this seat wrote nothing in
`corpus/`.** The L1 integrates.

Placement: the r58 lesson closes with a `## Corrections of record (r57-closure carry-ins;
append-only — the r56 bytes are not edited)` section whose items are numbered and each
begin with `**Routed defect N …**`. The round-59 lesson's corrections section should use the
same heading shape, the same numbering discipline, and the same "append-only — the r58 bytes
are not edited" clause (the r58 lesson is the byte store; **no in-place edit of
`corpus/lessons/round-58.md` is permitted or requested**).

Two of the ten routed defects are corrections *of record* (they correct wording or a
citation, not an instrument): **D3** and **D6**. The other eight (D1, D2, D4, D5, D7, D8, D9,
D10) land as instrument work, a QUALITY criterion, a SCORECARD statement, or seat evidence —
they belong to their own seats' sections, and this draft does not restate them.

---

## D3 — the absent-receipt refusal shape (the frozen do-nothing text, corrected)

**Text for the round-59 lesson (append as a new numbered item; the r58 bytes are not
edited):**

> **Routed defect 3 (D3, correction of record) — the absent-receipt refusal shape, corrected
> of record this round.** The r58 spot-check recorded the frozen do-nothing text as: the r58
> counter on an absent receipt "exits 1 with a could-not-evaluate class", and reported the
> emitted shape as a finding `receipt-missing` with `couldNotEvaluate []`
> (`.ufo/waves/round-58/reviewer/receipts/r58-counter-absent-receipt.json`). That emitted
> shape is **not** the shape the counter emits. Re-measured on the committed r58 counter bytes
> (`.ufo/waves/round-58/counters/chromium-receipt-r58.mjs`, sha256 `632e62e4…`, unchanged at
> the round-59 baseline `4e7fb89d`), the counter on an absent receipt emits **exit 1,
> `predicate: false`, `findingCount: 1`, `findings: [{id: "receipt-missing", …}]` and a
> NON-EMPTY `couldNotEvaluate: [{check: "receipt-load", code: "receipt-absent", detail: "no
> receipt bytes at …"}]`** — the `receipt-absent` entry is pushed at
> `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs:717`, on the same branch that
> pushes the `receipt-missing` finding at line 716. The divergence is a **counter-snapshot
> artifact, not a class difference**: the r58 reviewer's own record shows it measured the
> counter at sha256 `7ff9846f…` — an *untracked* working-copy snapshot, changed twice during
> the review (`.ufo/waves/round-58/reviewer/R58Reviewer.md:13`) — and the *frozen* counter at
> `632e62e4…` is the one the r58 lesson and the r58 freeze pin. Evidence, both re-derived this
> round: the round-open control at
> `.ufo/waves/round-59/controls/c2-counter-absent-receipt.json` (sha256 `9d154896…`, absent
> path `corpus/evidence/round59/nonexistent/receipt.json`) and the independent re-run on a
> *different*, never-existing scratch path
> (`.ufo/waves/round-59/probes/d3-absent-receipt-shape.json`, sha256
> `dc3a177f…` for the raw stdout) — **byte-identical shape apart from the paths**. The
> frozen r59 claim text already carries the corrected wording
> (`.ufo/waves/round-59/claims.json` → `claims[C2].before.counterRefusal`: "observed at round
> open: findings [receipt-missing], couldNotEvaluate [check receipt-load, code
> receipt-absent]"); the correction is recorded **here** as the lesson's corrections-of-record
> entry, and the r58 bytes are left unedited.

**Ground pointers (all committed, all re-derivable):**

| Pointer | What it carries |
|---|---|
| `.ufo/waves/round-59/controls/c2-counter-absent-receipt.json` | the round-open control, emitted shape, `couldNotEvaluate` non-empty |
| `.ufo/waves/round-59/probes/d3-absent-receipt-shape.json` | the independent re-run on a scratch path; `shapeIdenticalApartFromPaths: true`; the verbatim `emitted` block |
| `.ufo/waves/round-58/reviewer/receipts/r58-counter-absent-receipt.json` | the r58 receipt whose `couldNotEvaluate: []` is the wording being corrected (and the snapshot sha `7ff9846f…` that produced it) |
| `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs:716-717` | the two pushes that make the shape non-empty at the frozen sha |

**Standing rule this correction installs (one sentence, for the lesson):** *a refusal shape is
recorded against the **frozen** instrument bytes, never against a working-copy snapshot; when a
counter's bytes move between the measurement and the freeze, the refusal shape is re-measured
at the frozen sha and the earlier shape is corrected of record rather than smoothed.*

---

## D6 — the forged-copy citation re-pointed at committed bytes, with the six keys named

**Text for the round-59 lesson (append as a new numbered item; the r58 bytes are not
edited):**

> **Routed defect 6 (D6, correction of record) — the one-off forged-copy check now cites
> committed bytes; the six entries behind "6 block entries → 6 page entries" are named; the
> match is an existence match.** The r58 lesson's Measurements block cites the forged-copy
> check's scratch path `/fast/scratch/hyaku/tabi-r58/L1/forge`
> (`corpus/lessons/round-58.md:60`) — a reaper-deletable scratch path, which is not citable
> evidence. The check is re-pointed, of record, at **committed bytes**: the sentinel's
> committed attack file `.ufo/waves/round-58/sentinel/evidence/page-vs-recorded-attack.json`
> (1,059 B, sha256 `2419d1476cd8b24dc22f3bd89d6cbf313853d3e57d86f0f5d689de089ce77342`,
> schema `r58sentinel-page-vs-recorded-attack-v1`) and the round-59 re-derivation
> `.ufo/waves/round-59/probes/d6-six-entries.json`. **The six swallow-block keylog entries**
> behind the "6 block entries → 6 page entries" phrase are: the control digit **7**
> (`control.keylog[0]`), the control digit **5** (`control.keylog[1]`), the swallowed
> **Backspace**, the swallowed digit **b**, the **Control** modifier, and the **Enter** of the
> Ctrl+Enter chord. Their triples are, in that order, `(7, cancelable true, defaultPrevented
> false)`, `(5, true, false)`, `(Backspace, true, true)`, `(b, true, true)`, `(Control, true,
> false)`, `(Enter, true, true)`. **The match is an EXISTENCE match by value** — each block
> entry's `(key, cancelable, defaultPrevented)` triple must be *present* somewhere in
> `journey.form.pageKeylog` — **not a positional match**: the page keylog interleaves
> keyDown/keyUp pairs (138 entries, 69 keydowns) while the swallow block occupies indices
> 126–137, so a positional matcher would sit one off-by-pair away from a silent pass. All six
> match: **6/6**. The **uniqueness caveat is disclosed, not smoothed**: the value triple is
> **not** unique for the three non-unique entries — the control digit 7 matches 6 page
> entries, the control digit 5 matches 14, and the Control modifier matches 4 — while only
> the swallowed **Backspace** (page index 130), the swallowed **b** (132) and the **Enter**
> (135) carry a unique triple, because their keyDowns alone carry `defaultPrevented: true`.
> A per-entry existence check therefore detects a forge on a swallow entry but can be masked
> by a surviving equal-valued twin on the non-unique control entries; this is why the r59
> counter generation's D1 cross-check is a *value* cross-check and why the D2 step-plan check
> exists alongside it. **The maskability is now MEASURED, not merely reasoned**: a six-case
> emulation of the D1-style rule over in-memory clones of the committed receipt (no lane
> bytes mutated) shows the rule **catching a contradicted swallow** — forging the swallowed
> **Backspace** (page index 130) or the **Enter** (135) to `defaultPrevented: false` turns the
> rule **red** (`misses: backspace-swallow`, `misses: ctrl-enter-enter`) — while a forge on
> any of the three **non-unique** entries (control digit 7 at index 126, control digit 5 at
> index 12, Control modifier at index 134) leaves the rule **green**, because an equal-valued
> twin survives. The honest consequence for the r59 counter generation: the D1 check as
> specified protects **exactly the entries the claim's witness rests on** (the swallowed
> keys) and cannot, by itself, assert the non-swallow control entries' flags; a counter that
> also matched per-window occurrence counts, or matched the keyDown only, would be strictly
> stronger. The r58 sentinel evidence file **exists and parses** (confirmed this
> round), and its **F1** leg — the page keylog forged to say the swallowed Backspace was *not*
> prevented — exited **0 with `predicate: true`**: the live proof that the r58 counter read
> the driver's recorded block and not the page. That is the routed **D1** defect, closed by
> the r59 counter generation.

**Ground pointers (all committed, all re-derivable):**

| Pointer | What it carries |
|---|---|
| `.ufo/waves/round-59/probes/d6-six-entries.json` (sha256 `e4e5d885b56943b363edb95c112553f296b1c55949ec716805ca25d4f8a660e9`, 10,876 B) | the six entries, the existence match (`sixOfSix: 6`), the match indices, the uniqueness caveat, the sentinel cross-check, and the six-case `maskabilityTest` (the measured red/green split) |
| `.ufo/waves/round-58/sentinel/evidence/page-vs-recorded-attack.json` | the committed attack file (the citable replacement for the scratch path); F1 green = D1's live proof |
| `corpus/lessons/round-58.md:60` | the stale scratch citation being re-pointed (left in place; the r58 bytes are not edited) |
| `corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json` | the committed r58 receipt the six entries are extracted from (70,689 B, sha256 `1d0c1389…`, nonce `tabi-r58-75b513ebbf9f`) |

**Standing rule this correction installs (one sentence, for the lesson):** *a cited check must
resolve to committed bytes at the citing revision — a scratch path is never citable; where a
check's input set is summarized ("6 entries"), the entries are named and the match's nature
(existence vs positional) is stated.*

---

## Notes for the L1 (not lesson text)

1. **Both corrections are append-only.** `corpus/lessons/round-58.md` and
   `corpus/knowledge/chromium-preventdefault-swallow-round-58.md` are NOT edited by this
   round. The D6 wording re-points the *citation* in the round-59 lesson's own Measurements
   block; the r58 line stays as history.
2. **The D3 correction does not change the frozen claim.** `claims.json`'s
   `claims[C2].before.counterRefusal` already carries the corrected shape
   (`couldNotEvaluate [check receipt-load, code receipt-absent]`) and the L1's
   `preDataCorrection` field (2026-11-03) records that the correction was made pre-data.
   The lesson entry records it as the **correction of record**; no claim is amended.
3. **The D6 correction does not weaken D1.** The six-entry existence match is what the r58
   counter did *not* check (R58-S1); the r59 counter generation closes that gap. This draft
   must not be read as the D1 defect being already closed — it names the defect's live proof
   and points at the generation that closes it.
4. **Both drafts cite the r58 spot-check's D-numbers verbatim** (D3, D6) so the round-59
   lesson's corrections section is traceable to
   `corpus/lessons/round-58-verifier-spotcheck.md` §5.
