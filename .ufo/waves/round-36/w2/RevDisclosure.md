# RevDisclosure — round 36 attempt 2, wave w2

Scope: verify each sentence in both frozen `feasibilityDisclosed` blocks against committed receipts (freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`). Claims read first from `.ufo/waves/round-36/claims.json`.

## C1

1. **“The ledger's statuses are re-derived by the frozen counter from sibling git objects” — SUPPORTED.** `claims.json` C1 surface/predicate describe the derivation; w1 `CritC1/report.md` lines 38–40 documents the counter's derived status and relocation checks against pin heads; its baseline run is in `CritC1/evidence/run-honest-freeze.json`.
2. **“a forged ledger survives only where it equals the honest derivation” — SUPPORTED, with the distinct pinned-head caveat below.** `w1/CritC1/report.md` lines 98–127 records malformed/duplicate/wrong-relocation attacks refused and explicitly surfaces the pins-substitution defect; `w1/MutC1/report.md` lines 15, 26–30 supports J2/J3/J4 refusal. This sentence does not establish that the derivation is anchored to the frozen pins.
3. **“c1-J2 … fails with exactly the 3 moved rows reported as status mismatches” — SUPPORTED.** `.ufo/waves/round-36/baseline/c1-J2-all-unchanged.json`; corroborated by `w1/MutC1/report.md` lines 11, 15.
4. **“c1-J3 … fails with 3 wrong-relocation findings” — SUPPORTED.** `baseline/c1-J3-wrong-relocation.json`; corroborated by `w1/MutC1/report.md` lines 12, 15.
5. **“c1-J4 … fails” — SUPPORTED.** `baseline/c1-J4-delta-screen-junk.json`; `w1/MutC1/report.md` lines 13,15,28.
6. **“c1-J5 … passes, so the predicate is reachable” — SUPPORTED.** `baseline/c1-J5-honest-floor.json`; `w1/CritC1/report.md` lines 16–23 independently records exit 0/predicate true.
7. **Disclosed limit: a forger running the same derivation needs no lane work; claim work is derivation, verification sampling and landed ledger; w2 attacks statuses and moved rows by hand — SUPPORTED as stated, but does not cure F1.** `w1/CritC1/report.md` lines 77–83, 130–144 acknowledges the regenerated-ledger requirement and says F1 removes frozen-head assurance, not that work. `w1/MutC1/report.md` lines 8–16 records derivation and probes. **Separate actionable finding F1:** `w1/CritC1/report.md` lines 25–40 and 42–66 proves the counter reads delta pins from REV without digest binding; T8 yielded predicate true while all three moved rows were mis-audited against substituted heads. Smallest correction: bind the pins bytes to the frozen digest (as CritC1 lines 85–96 proposes). The disclosure's “survives only” wording is too broad absent that correction; specifically, substitution lets an altered derivation survive without matching the frozen derivation. Finding remains open.

## C2

1. **“c2-J1 … admits 16/16, failing 0, binding null, egress 0 with DNS-off prefs” — SUPPORTED.** `baseline/c2-J1-regression.json`; `w1/MutC2/report.md` line 32; independent honest driver `w1/CritC2/report.md` lines 19–31.
2. **“c2-J3 binds the threshold one below target” — SUPPORTED.** `baseline/c2-J3-boundary-15.json`; `w1/MutC2/report.md` line 33 and `w1/ExecC2Repro/report.md` lines 58–59. It reports admitted 15/16 and predicate false.
3. **“c2-J6 reads 8 non-loopback sockets across 3 samples … A5 is an observation” — SUPPORTED as the frozen receipt's exact reading, not as a fixed/required count.** `baseline/c2-J6-egress-instrument.json` and `.provenance` record 8/3. The binding claim is the qualitative lower bound: instrument reads **>=1** egress with DNS-off prefs dropped. This is supported by all committed J6-family observations located: frozen J6 receipt 8; `w1/ExecC2Repro` 7 across 3 samples; `w1/MutC2` pristine B5 6 (3 samples, as receipt `B5-pristine-J6-egress-instrument.json`); MutC2 m4 DNS-on/predicate-dropped control 9 (not the exact J6 instrument but corroborative). `w1/ExecC2Repro/report.md` lines 61–86 explicitly calls 8 vs 7 volatile and confirms both >=1. Thus the sentence's numeric 8 is a frozen-receipt description, not a universal count; no finding.
4. **“rewritten-id transcript clones stay a recorded limit … A6 refuses identical-id clones only” — SUPPORTED.** `w1/CritC2/report.md` lines 33–56 demonstrates a fully rewritten-ID clone admitted and the identical/shared-context contrast refused; `w1/MutC2/report.md` lines 37,44,67–69 demonstrates identical browsing-context IDs refused by A6 and the corresponding A6 mutant admits them. This accurately describes the boundary.

## Residual risk and verification gaps

C1's frozen-head integrity is not certified: F1 above. C2 J6 counts vary with sampling; the robust supported assertion is >=1 under the prefs-dropped instrument, not exactly eight in every run. No additional J6-family counts found beyond 8, 7, 6, and the distinct DNS-on m4 count 9. No tools installed.

VERDICT finding — C1 disclosure's forged-ledger guarantee is undermined by F1: substituted delta pins permit a predicate-true ledger that mis-audits all three moved rows; bind the pins file to its frozen digest. Other requested disclosure sentences are supported, including C2 J6's qualitative >=1 observation (counts 8/7/6; separate DNS-on m4=9) and rewritten-id limit.
