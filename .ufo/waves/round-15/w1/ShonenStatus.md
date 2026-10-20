# ShonenStatus — round-15 w1 read-only SHONEN and outside-author audit

Seat: TabiR15.ShonenStatus (leaf reviewer, author-side advisory).
This report is NOT a non-author verification, NOT a SHONEN attestation, NOT a discernment spot-check, and NOT a promotion act. No box is upgraded.

Scope and method:
- Read-only source and document reading under /home/vgpnk/Projects/shokunin/tabi-shokunin.
- Read-only git queries only (`rev-parse`, `ls-tree`, `hash-object`, `status`) for blob identity and pointer commit status.
- No gate, self-test, counter, test, suite, build, or browser was executed. No source, SHONEN.md, LOG, SCORECARD, lesson, or README was edited.
- Tools installed or updated: none.

Observed identities (HEAD `7054a5e`):
- `SHONEN.md` blob `9dcb2687d3083f696b57032389eed7349e03893e`, equal to HEAD and to the value named in `.ufo/waves/round-12/w1/GateDebt.txt`.
- Historical census/baseline blob `5e055b8c60d606d202029eddabb8a45e13203b06` (`corpus/evidence/pstack-20261015/baseline-census.tsv:25`, HARD_BASELINE `7f506aff…`).
- Worktree: only untracked `.ufo/waves/round-15/` is present.

## 1. The four asserted lines (SHONEN.md:5,7,9,11)

All four marks are `[~]`. None is `[x]`. The current state is the only state the outside record supports.

| Box | Mark | Pointer(s) cited | Pointer check (observed) | Assessment |
|---|---|---|---|---|
| 1. SKILL decision tables / error patterns / checklists / sources | `[~]` | `SKILL.md` §Approval table `:697`; `:1598-1617` kaika rows | `SKILL.md:697` is `## Approval table — finalized`; `:1598` is the kaika errata heading; table rows `:1604-1608`; sources-gate registry `:1610-1617`. Blob `8a3e0b4b`. | Pointers resolve. The table proves that decision rows exist. It does not prove every row was executed. Prose on the evidence line is a deviation from the external canon (see §4). `[~]` is correct. |
| 2. End-to-end domain task executed and logged | `[~]` | `corpus/knowledge/multi-step-journey.md` §1–§2, §7; LOG round-3 entry | §1 `:12`, §2 `:71`, §7 `:252` exist. The note states loopback-only scope at `:4-5`. Archive `corpus/evidence/tabi-r3-1-journey/` is committed (64 tree entries incl. MANIFEST.txt; `archive-receipt-r5.md:43`). | The "end-to-end domain task" is a 4-page loopback fixture. It is not a real site. The `/tmp` volatility warning in `corpus/README.md:18` is stale (see §3). Re-derivation is same-day only; round-5 plan clause (c) is still open (`multi-step-journey.md:350`). `[~]` is correct. |
| 3. Instructions executable without oral context | `[~]` | `corpus/knowledge/executor-test-sufficiency.md` §0, §4 | §0 `:20`; §4 `:175`; verdict text `:177-186`; gaps G1–G5 `:188-209`; unknown 1 `:211-215` (no other executor reproduced). Archive `corpus/evidence/tabi-r3-4-work/` committed (91 entries; `archive-receipt-r5.md:47`). | The test was run by same-lane seat TABI-R3-4 (LOG round-3, SHONEN prose). The verdict is author-side, scoped to the loopback runbook, and carries open gaps. `[~]` is correct. |
| 4. No cross-domain bleed (PROVINCE accurate) | `[~]` | `PROVINCE.md:3-19`; `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` | PROVINCE domain `:3-4`, owns `:6-13`, refuses `:15-19`, out-of-province rule `:21`. Receipt is 4 lines `present <name>-shokunin`, produced by a directory-existence test (`corpus/evidence/user-20261015-r02/slices.json:130`). | **Wording overreach.** The evidence line says refusal routes are "held". The receipt tests only directory presence. Its own lesson says "Presence is not absorption" (`corpus/lessons/user-20261015-r02.md:12`). No routing or refusal behavior was exercised. `[~]` is correct. The phrase "held" should be routed to L0 or an append-only correction. |

Canon note: the external canon, as quoted by lane reviews, says the evidence line carries "no other prose" (kimi-shokunin PROTOCOL.md:432, cited in `.ufo/waves/round-13/w1/AttackClaims.txt` F3 and `.ufo/waves/round-12/w1/ReviewShonen.txt` F5). The gate allows prose on `[~]` (`scripts/check-round-contract.mjs:107-110`). Boxes 1 and 3 carry prose. This is a canon-versus-gate conflict, already routed. It is not a gate failure.

## 2. Outside-author distinction

### 2a. Record of checks that touched SHONEN

| Record | Who | Outside? | SHONEN outcome recorded |
|---|---|---|---|
| `corpus/lessons/kaika-fleet-round-1.md:102-104` (M-2); `LOG.md:519-525` | Orchestrator post-review | Correction, not outside check | Four `[x]` withdrawn to `[~]`; "L0 promotion premise is withdrawn". |
| `corpus/lessons/round-1-verifier-spotcheck.md` (integrator-written, fresh orchestrator-dispatched verifiers) | Fresh verifiers, orchestrator-dispatched | Yes, for round-1 notes | Admit and reject rows only (`:8-13`). No SHONEN box certified. |
| `corpus/lessons/round-12-verifier-spotcheck.md:5-7, 225-227` | CloseTabiR12, non-author integrator | Yes | "not all four boxes were independently adjudicated … No `[x]` or promotion is granted." |
| `corpus/lessons/round-13-verifier-spotcheck.md:1-3, 167` | Hyaku closure, non-author integrator | Yes | "not all four boxes are certified. No `[x]`, promotion, mint…" |
| `corpus/lessons/round-14-verifier-spotcheck.md:5-9, 192` | Hyaku closure, non-author integrator | Yes | "not all four boxes are certified. No `[x]`, promotion…" |

Conclusion: every outside review on record declines SHONEN certification. Four `[~]` is the only supported state. No current round-15 seat is an outside reviewer.

### 2b. Same-lane and historical contradictions (not edited; historical)

- `corpus/lessons/round-1.md:46` says "Spot-check (non-author — the scribe lane)". The same file at `:111-113` says "Outside spot-check: not performed". `SCORECARD.md:38` and `:50, :65` treat the scribe lane as a non-author discernment basis. The scribe is a lane seat, so these are same-lane advisory evidence. Protected history; an append-only errata would be the only lawful route (L1 decision).
- `corpus/lessons/kaika-fleet-round-1.md:88` says "6/6 spot-checks agree". The in-repo lesson holds two rows (`round-1-verifier-spotcheck.md:8-13`). The per-item basis is out of repo (`.ufo/waves/round-12/w1/ReviewMistakes.txt` item 1b). Not reproducible in-repo.
- Round-15 spec context says "Independent claims". This means the two claims are independent of each other. It does not mean independently verified. Keep that distinction in any round-15 report and lesson (the same wording risk was flagged in `.ufo/waves/round-12/w1/ReviewShonen.txt` F6).

### 2c. Gate-level distinction (source-observed)

- G1 — spot-check reviewer is unverifiable. `scripts/check-round-contract.mjs:279` `/^- spot-check: non-author (\S+) (agree|disagree) — (.+)$/gm` accepts any token. `:282` requires exactly one match. `scripts/check-user-round-contract.mjs:329` and `:332` are identical. A lane seat id passes. The fix rule in `.ufo/waves/round-12/w1/ReviewMistakes.txt` (refuse any id present in the round's aggregate or dispatch seats) is not present in either gate.
- G2 — report-level SHONEN accepts `[x]`. `scripts/check-round-contract.mjs:509` `/^- \[[x~ ]\] /` and `scripts/check-user-round-contract.mjs:512` both accept `[x]`. `checkReport` therefore passes a per-round report carrying `- [x] <box>` with no verifier. The SHONEN.md policy (`check-round-contract.mjs:150`) is stricter than the report-level check.
- G3 — SHONEN exemption is shape-only, not blob-pinned. `scripts/check-round-contract.mjs:238` skips the protected-blob comparison for SHONEN entirely. `:254-258` runs `checkShonenPolicy` only when the blob differs from the census row. Any canonical-shape SHONEN passes, including swapped pointers to unrelated committed files. The exact-pin option (`GateDebt.txt` Option A; `.ufo/waves/round-13/w1/AttackClaims.txt` F3 "accept blob 9dcb2687 by exact pin") is not what the code implements. L0/L1 should either pin `9dcb2687…` or record the shape-only rule as the accepted policy.
- G4 — `[x]` is rejected at SHONEN.md (`check-round-contract.mjs:150`; user gate `canonicalShonen` `check-user-round-contract.mjs:187`), so the SHONEN.md path is fail-closed. Only the report path (G2) and the spot-check regex (G1) are open.

## 3. Documentation staleness (L1-owned; append-only)

- `corpus/README.md:18` and `:20` describe `/tmp/tabi-r3-1-journey/` and `/tmp/tabi-r3-4-work/` as "volatile — archive owed". Both are committed under `corpus/evidence/` and recorded in `corpus/knowledge/archive-receipt-r5.md:43, :47`. The README is in the APPEND_ONLY list (`check-round-contract.mjs:25`), so the correction must be an appended line, not an edit.
- `corpus/knowledge/executor-test-sufficiency.md:204-207` (G4 "archive obstructed") is historical. Do not edit; note in an errata if L1 chooses.

## 4. Round-14 routed defects that map to round-15 code claims (code-related; routed to siblings)

These are exact-id routings. I did not verify the full line ranges.

- To `TabiR15.MetadataEnforce`: `corpus/lessons/round-14-verifier-spotcheck.md:185` — `check-aria-metadata.mjs:908-1084` validates core bindings and correction but not all `cleanup.*` mirrors nor `qualification.everyProof{ListensBefore,Closed,RefusedAfterClose}`. Source: `scripts/check-aria-metadata.mjs:1073-1074` checks only `everyProofNotListeningAfter`; `:1275-1279` emits `everyProofListensBefore/Closed/RefusedAfterClose/NotListeningAfter`. Also `:186` — anchor/source mismatch yields exit 1 finding, not `snapshot_tampered` could-not-evaluate. Proposed tests: one negative fixture per unchecked mirror field; one authenticated-snapshot-tamper fixture expecting could-not-evaluate with a distinct finding.
- To `TabiR15.CounterDiagnostics`: `corpus/lessons/round-14-verifier-spotcheck.md:187` — USER malicious fixtures assert `score_mismatch` only; `no_marker=0` conflates not-applicable. Source: `scripts/check-user-round-contract.mjs:86-102` has a refusal-reason vocabulary (`COUNT_REASONS`); `:408-409` emit specific reasons; `:415` and `:425` emit bare `score_mismatch`; `:848-850` witness acceptance checks `newArm.finding === 'score_mismatch' && !newMarker` with no reason check; `:884-886` malicious controls expect `score_mismatch`. Proposed test: each malicious control asserts the intended `reason` plus applicability, and a control must fail if the reason is replaced by bare `score_mismatch`.

## 5. Proposed moves and tests for L1 (no edits made here)

1. Keep SHONEN.md at four `[~]` with pointers. Do not promote. No `[x]` this round.
2. Do not edit SHONEN.md. Route to L0 the box 4 wording "held" (receipt shows presence only) and the prose on boxes 1 and 3 (canon-versus-gate, G3).
3. Gate fixture (both gates): a round report with `- [x] <box>` in the SHONEN section must fail `report_shonen`. Current behavior accepts it (G2).
4. Gate fixture or rule: refuse a spot-check reviewer id equal to any seat in the round's aggregate/dispatch (G1). Until then, the round-15 lesson must not write a `- spot-check: non-author <seat>` line; write the seats-are-author-side form instead (as `round-14.md:15` does).
5. Decide G3: pin `9dcb2687…` in the gate, or document shape-only as the accepted SHONEN policy with a fixture that documents the unrelated-pointer limit.
6. Append-only correction to `corpus/README.md:18, :20` (archive now present; cite `archive-receipt-r5.md:43, :47`).
7. Round-15 report/lesson: describe C1/C2 as same-lane bounded claims. Do not call any round-15 seat a non-author reviewer, SHONEN verifier, or discernment spot-check.
8. Report location: `checkReport` expects a lane-local `reports/<id>.md` with a `lane-commit:` line and `^## SHONEN$` (`check-round-contract.mjs:506`, `:509`). The wave report at `.ufo/waves/round-15/w1/ShonenStatus.md` is outside that path. This is the known location conflict recorded in `.ufo/waves/round-12/w1/ReportEvidence.txt:17`. L1 reconciles.

Checks L1 should run after integration (not run here): the `--self-test` mode of `scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs` (the self-test cases at `check-round-contract.mjs:755-774` already cover SHONEN.md shapes but not report-level `[x]`), plus the production ROUND and USER checks as the SCORECARD commands specify. Expect G2 to pass undetected until fixed.

## 6. Verification gaps

- No gate, self-test, or production check was run; current pass/fail of each gate is unknown from this seat.
- External canon (kimi-shokunin PROTOCOL.md, LEARNING.md, AXES.md) was not opened directly; canon statements are as quoted by lane reviews cited above.
- Whether any reviewer id has an outside dispatch record outside this repo was not checked (out of scope; no `~/.omp` access, as the contract forbids).
- No semantic check of the content of SKILL.md:1598-1617 beyond the heading and table rows was performed.
