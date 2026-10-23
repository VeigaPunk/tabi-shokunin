# CriticAuthority — author-side vs non-author verification boundary (round22 w2b)

Reviewed revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`. All production bytes were read with `git -C tabi-shokunin show e3cf4e0…:PATH`. This is author-side falsification by a w2b seat. The seat was dispatched by `TabiR22-2`, the same L1 that authored the repair. It is not non-author admission.

Axes: **authority labeling** (who verified what), **expectation independence** (whether expectations and oracle were written by different authors), **pinned-authority fidelity** (whether the pinned file or the code decides the verdict), **canonical disclosure** (whether LOG and SCORECARD describe the actual provenance).

## Authority map at e3cf4e0

| Verification | Actor | Class | Evidence |
|---|---|---|---|
| W1 64 seats (builders, critics, scouts, and connectors, including CriticClaim, CriticScope, and ConnPlanner) | Dispatched by TabiR22 L1 | author-side | `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:113` ("All author-dispatched reviewers remain author-side") |
| BuildOracle, BuildSelftest, and BuildDebt private writers | W1 seats; L1 imported and edited their output | author-side; writer separation only | `.ufo/waves/round-22/writer-imports.json` |
| Integration edits to oracle, selftest, chronology gate, and expectations | TabiR22 L1 | author-side | `.ufo/waves/round-22/integration-changes.json:1-37` |
| Serial cohort at 0f24164 (33/35) and at e3cf4e0 (35/35); sandbox selftest 44/44 | TabiR22-2 replacement L1 | author-side | `post-crash-repair.json:4,7-12,46-50`; `checks-pre-w2-0f24164.json`; `checks-at-e3cf4e0.json` is untracked and is not in e3cf4e0 |
| Repair D1, D2, D3 | TabiR22-2, authored after seeing the failing positive | author-side, disclosed fitting risk | `post-crash-repair.json:4,67` |
| W2 | Never spawned (14 cap refusals) | none | `w2-cap-refusal-*.json` |
| w2b (this wave) | Dispatched by TabiR22-2 | **author-side** | w2b-spec context: "This is author-side falsification, not non-author admission." |
| Classification ruling | Main orchestrator message | scoped ruling, not admission | `classification-ruling.json:5` ("classification only, not final admission or outside verification") |
| Round21 closure `MANIFEST rounds[417]` | CloseTabi21 | **non-author** (historical round21 only) | `round21-closure.json` `verification.reviewer` |
| Round22 non-author closure | — | **not yet performed** | `review-snapshot.json:227` |

Correct text that preserves the boundary:
- `knowledge/...oracle-round-22.md:113-114`
- `review-snapshot.json:227` ("fresh non-author closure, not retroactive W2 credit")
- `classification-ruling.json:5`
- `SCORECARD.md:1061-1063`, which says "independently checked semantic depth credit in round21". This matches round21-closure claim scope "independently checked raw semantics" by a non-author closure.
- `knowledge:9-12,66,95` and `LOG.md:1498`, which use "admitted" only for round21.

No round22 text in SCORECARD, SKILL, README, or QUALITY claims round22 admission, a non-author verdict, or a measured value. `SCORECARD.md` ends at line 1069 with the pre-measurement axis correction. No `.ufo/reports/round-22` exists.

## Findings

### A1 — The repair record labels this author-side wave as "non-author review" (actual defect, high)

- **Where:** `e3cf4e0:.ufo/waves/round-22/post-crash-repair.json:67`, which reads: "Non-author review of this repair is the fresh post-crash wave and the closure."
- **Counterexample:**
  - The "fresh post-crash wave" is w2b. Its own committed-to-dispatch context says it is author-side.
  - Its seats are children of the repair author (`post-crash-repair.json:4` `"author": "TabiR22-2 …"`; this seat is `TabiR22-2.CriticAuthority-16`).
  - `knowledge:113` makes every author-dispatched reviewer author-side.
  - If someone cites line 67, w2b's 65 reports become "non-author review of D1–D3". That is outside admission manufactured by the author's own dispatch.
- **Preserving positive:** "and the closure" is correct. A fleet-dispatched non-author closure, like CloseTabi21 for round21, is the actual non-author step. The same sentence's "no author-side W2 seat ever reviewed 0f24164" is also correct.
- **Impacted axes:** authority labeling, discernment trend, false provenance.
- **Smallest fix:** Append-only correction record (do not rewrite e3cf4e0 bytes): "Author-side falsification of this repair is the fresh post-crash w2b wave; non-author review is only the later closure." Cite it from the next LOG entry.

### A2 — "expected.json is independent of the oracle" is false for three rows at e3cf4e0 (actual defect, medium)

- **Where:**
  - `e3cf4e0:.ufo/waves/round-22/selftest-c1.mjs:2` ("expected.json is independent of the oracle")
  - `measure-c1.mjs:2-3` ("the independent round-22 oracle")
  - `knowledge:23-27`
  - `LOG.md:1561-1562` ("Independent CLI expectations were authored for42 semantic controls…")
- **Counterexample (exercised, read-only):** I made a JSON semantic diff of the BuildSelftest seat blob `159925654e…`, fetched from `history/BuildSelftest.bundle` into a shared bare clone in `/dev/shm` (now removed), against 0f24164 and e3cf4e0.
  - Seat to 0f24164: one row added by L1, `receipt-time-array` (`fixtures/expected.json:466`). The same L1 changed the oracle in that same integration (`integration-changes.json:31-35`).
  - 0f24164 to e3cf4e0: `native-submits-empty` (`expected.json:274-283`) changed `finding` from `semantic_navigation` (the seat's value) to `semantic_status`. The reason given is "oracle emits exactly [semantic_status]" (`post-crash-repair.json:35-40`). The expectation was copied from oracle output by the oracle's repairer.
  - 0f24164 to e3cf4e0: `native-landing-errors` and `native-landing-wrong-query` (`expected.json:285-305`) were added by the same author, in the same commit as oracle lines 115-140.
  - So 41 of 44 rows are writer-separated from BuildOracle. 3 rows share an author with the oracle code they test, and 1 row was derived from that code's output.
  - The knowledge note itself admits the risk at line 26-27 ("not … a guarantee against an author changing both the evidence and the independent expectations"). e3cf4e0 is that case for the expectations side.
- **Preserving positive:** The 41 seat-authored rows, including `positive` value 12, are writer-separated. The pinned file `corpus/evidence/round-22/semantic-expectations.json` is byte-unchanged (sha `4a693dce…`).
- **Impacted axes:** expectation independence, quality trend.
- **Smallest fix:** In the next append-only LOG/SKILL entry, and in a new selftest header comment if the file is edited later, scope the claim: "41 rows writer-separated (BuildSelftest); `receipt-time-array`, `native-landing-errors`, `native-landing-wrong-query` and the `native-submits-empty` finding are L1-authored alongside oracle changes." The closure should re-derive those rows independently.

### A3 — Chronology "independent" expectations share a writer with the classifier (actual defect, low–medium)

- **Where:** `LOG.md:1561-1562` ("Independent CLI expectations were authored for … 17 chronology/history controls") and `integration-changes.json:27` ("three independent missing/inverted/in-progress controls added").
- **Counterexample:** `writer-imports.json`, BuildDebt entry: one seat was assigned and changed both `check-review-chronology.mjs` and `debt-expectations.json` (commit `854d5eab…`). L1 then edited both the gate rule and the three controls together. There is no writer separation at any step.
- **Preserving positive:** `check-review-chronology.mjs:207` correctly says "not independently authenticated" for supplied records, and SKILL `:2438-2439` disclaims authentication.
- **Impacted axes:** expectation independence.
- **Smallest fix:** Replace "Independent" with "pre-registered, same-writer" for the 17 chronology controls in the next append-only entry. Reserve "independent" for writer-separated or non-author expectations.

### A4 — "Pinned expectations unchanged" while the code overrides the pinned value for one row (authority-fidelity defect, medium)

- **Where:**
  - `post-crash-repair.json:61-62,67` ("pinned expectations are unchanged")
  - `measure-c1.mjs:115-130`
  - pinned `semantic-expectations.json:80`: na-native-submit `post.errors: []`
- **Counterexample:**
  - At e3cf4e0, `landing ? Object.hasOwn(actual,'errors') || !equal(expected.errors, [])` means the pinned `[]` is no longer compared with the observation.
  - An observation whose `errors` equals the pinned value exactly (`[]`) now fails with `semantic_error`. The new selftest row `native-landing-errors` (`selftest-c1.mjs:217-223`, `expected.json:285-294`) requires exactly that failure.
  - The decision authority for this row moved from the pinned file to oracle code. Meanwhile the record says the pinned authority is unchanged, and the note says expectations are "independent of the evaluated receipt" (`knowledge:23-25`).
  - It also reads against the note's own refusal of collapsing unavailable and empty states (`knowledge:40`, SKILL `:2419`). Here pinned "empty" is treated as satisfied by "unavailable".
  - Whether D1 is semantically right is for the RepairLandingErrors reviewers. This finding is about authority wording.
- **Preserving positive:** The actual retained observation, with the key absent, passes. The bytes of the pinned file and the target and metric are genuinely unchanged.
- **Impacted axes:** pinned-authority fidelity, calibration.
- **Smallest fix:** Either (a) state the override precisely: "pinned bytes unchanged; oracle reinterprets na-native-submit `post.errors: []` as absent-key on the landing document". Or (b) for a non-author closure decision, pin `post.errors: null` as unavailable, matching `submitCount: null`, under a new disclosed digest, and drop the code special-case.

### A5 — The canonical LOG at e3cf4e0 still describes pre-repair provenance (disclosure gap, low)

- **Where:** e3cf4e0 changed no LOG, SCORECARD, or SKILL bytes (commit stat). `LOG.md:1561-1562` still says 42 independent semantic controls, "not yet exercised".
- **Counterexample:** A closure reading only canonical docs sees 42 independent rows. It does not see 44 rows with L1-authored or derived rows, or the 0f24164 measurement of 0 and its author repair. That history exists only in wave JSON (`post-crash-repair.json`).
- **Preserving positive:** No canonical doc claims a round22 measured value or admission. Nothing false is asserted beyond the "independent" wording covered in A2 and A3.
- **Smallest fix:** Append a LOG entry that labels the repair as post-crash and author-side, measured 0 at 0f24164, and lists D1–D3 with their author. Cite A1–A4 wording. Do not edit existing LOG bytes.

### A6 — SKILL slash-join can read the author-side witness as non-author (wording, low)

- **Where:** `SKILL.md:2429`: "its separate semantic witness/non-author admission remain valid history."
- **Counterexample:** `.ufo/waves/round-21/final/semantic-contrast-witness.json:4` self-labels `"TabiR21 L1; author-side, not independent closure"`. The slash lets "non-author" attach to the witness.
- **Preserving positive:** `knowledge:11` says "separate semantic witness and non-author closure", which keeps them distinct.
- **Smallest fix:** In the next append, use "its author-side semantic witness and the separate non-author round21 admission".

## Out of scope or tradeoffs (not defects here)

- Git author strings are not actor authentication, and an author could forge evidence and expectations together. This is malicious-author authenticity, already bounded by W1 CriticAuth F2/F5 and `knowledge:26-27,108-114`.
- `LOG.md:1525` "W1 … independently identified" uses "independently" to mean seats acting separately. Main's scoped ruling then holds the classification, so this does not imply outside admission. Wording could be clearer, but it is not a defect.
- The SCORECARD round22 section has no explicit "non-author closure unasserted" line, unlike round21 `:1027`. Nothing in it implies admission, so add the line when the measurement is appended.

## Exercised commands

All were read-only. No lane scripts were run, nothing was installed, and nothing was written to the lane except this report.

- `git -C tabi-shokunin show --stat e3cf4e0…`, `log`, `ls-tree`, `git grep` (authority terms), `git diff 0f24164 e3cf4e0 -- measure-c1.mjs selftest-c1.mjs fixtures/expected.json`: exit 0.
- `git show e3cf4e0:{post-crash-repair,review-snapshot,claim-classification,classification-ruling,integration-changes,writer-imports,round21-closure,…}.json`, plus the SCORECARD, LOG, SKILL, README, QUALITY, and knowledge sections: exit 0.
- `git clone` to `/tmp`: exit 128, because `/tmp` is full ("No space left on device"; root filesystem 100%). I used the tmpfs instead: `git clone --bare --shared` to `/dev/shm/critauth-r22.git`, then `git fetch` of `history/BuildSelftest.bundle` HEAD, exit 0. Then a Python JSON case diff of seat, 0f24164, and e3cf4e0 expected.json, exit 0. The throwaway clone was removed afterwards.

Not run: selftests, measure-c1, run-checks.py, and every other gate. No claim here depends on their output.
