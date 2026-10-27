# MutC2a — C2 v3 counter mutation probe (tabi round 37, wave w1)

Mutants were applied to scratch copies only (`/fast/scratch/hyaku/tabi-r37/w1/MutC2a/counter/`); the canonical counter was never modified. Every run below was executed by this seat. No tools were installed (existing node v24.21.0, git 2.56.0).

## Frozen bytes and hashes

- Canonical before: `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019` (`claims.json` frozenDigests.c2 — verified at read time), pristine scratch copy identical.
- Canonical after (re-verified post-battery): `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019` — unchanged; restoration is trivially exact because mutants lived only in scratch copies (hashes below), destroyed with the scratch at cleanup.
- Mutant hashes: m1 `5b6c4fa44553fbf9a181dc69fbe89edfe18d2a7e7f77eb8b9facd8e78793983f`, m2 `3a2ee8e8dbda380bee969a5c137efd2eba95874789f4cce0b79dc0c1b849fa7b`, m3 `37cb2de90027a0e6c2e7e5af133068fba907844a11d845d18428f5f5b5024467`, m4 `d922b1471690fcd786855b7bcb8218e2f436e65e1f98c5937670847301d10f47`, m5 `b843593318185ca4c39a7af12b89cf71e4feeb0aecc1522360bad81662e8ccb1`.

Fixtures per run-controls.sh recipes: D = honest tree + `refs/replace/88f73cf28e07795427af90edc7e671981d0384a7` → forged blob `fb56bef37226736b28077c0bd8d7851c917ddba5`, measured at RD=`ed8ccfc…` (same fixtureRev as frozen J1); C = observed-decoration tamper commit `01abe6db70427d8b8e529d0d7ad550771e3652e7` (frozen J2 used `192cda5c…`, same recipe, my commit timestamp); honest = lane repo at `ed8ccfc…`, read-only. Plant technique: watcher `exec -a <session-scratch-dir> sleep 240` planted once the counter's live-leg mkdtemp appeared, surviving SIGTERM teardown; the counter's own SIGKILL path removes it.

## Pristine ground truth (before-state reproduced)

| run | bytes | fixture | exit | predicate | key fields |
|---|---|---|---|---|---|
| p1-d | pristine | D graft | 2 | null | Refusal `refs/replace present in measured clone (refs/replace/88f73cf…); refusing` — matches frozen J1-v3 receipt |
| p2-c | pristine | C tamper | 1 | false | receiptFinding `run1: observed captureScreenshot.sha256 != transcript first screenshot` — matches frozen J2-v3 |
| p3-h | pristine | honest | 0 | true | admitted 16/17, survivors 0, egress `{samples:2, nonLoopback:0, pids:9}` — matches frozen J3-v3 |
| p3-plant | pristine | honest + planted survivor | 1 | false | survivors 1 — detector counts a real survivor at frozen bytes (validates the plant technique) |

(Note: the first batch ran the C fixture at the honest rev by mistake; those three runs were re-executed at the tamper commit — the corrected receipts are the ones cited.)

## Mutant results

**m1 — drop the replaceRefs enumeration call (GIT_NO_REPLACE_OBJECTS retained). KILLED.**
- m1-d (graft): **exit 0, predicate true, receiptFinding null** — flips the J1 control from exit 2 to evaluated; the grafted clone is admitted. Because the env pin is retained, `git show` disarms the graft and the counter reads the honest receipt (receiptFinding null; the forged decoration was never read — a read of the forged blob would have reproduced p2-c's captureScreenshot finding).
- v2-semantics record (item question): frozen `c2r37-J1-replace-ref-v2.json` shows v2 over the same clone = exit 0, predicate true, "honours the graft and, ignoring observed decoration, admits" — v2 admits *the forged decoration read through the graft*; m1 admits the same clone state *on honest bytes*. Both lose the loud clone-level refusal; only v2 launders the forgery itself.
- m1-c: exit 1 (tamper still caught, unchanged); m1-h: exit 0 (honest floor intact). Survivor accounting untouched (edit site is in `evaluate()`, disjoint from `liveRecordFirefox`; not re-planted).

**m2 — GIT_NO_REPLACE_OBJECTS removed from the git env, enumeration kept. SURVIVED (classified).**
- m2-d (graft): **exit 2, same Refusal as pristine** — enumeration alone refuses before any read; the mutant is indistinguishable on every frozen fixture (m2-c exit 1, m2-h exit 0 unchanged).
- Classification: for this battery (static graft present at enumeration time, read-only counter) enumeration alone suffices; the env pin is defense-in-depth against a replace ref materializing between `for-each-ref` and a later `git show` (concurrent-writer TOCTOU), which m1's admit shows is the only residual hole when enumeration is absent. Not a kill-rule breach: m2 neither admits the graft nor reads through any refs/replace.

**m3 — survivor block writes rec.survivors = 0 unconditionally. KILLED (via end-to-end survivor plant).**
- m3-plant: **exit 0, receipt survivors 0, predicate true** while a planted survivor existed (pristine plant control: exit 1, survivors 1) — the mutant masks a real teardown survivor.
- Frozen controls cannot see it: m3-c exit 1, m3-d exit 2 (both unchanged; those paths never carry survivors).
- Test-gap classification: `scratchSurvivors` is module-internal (exports are only `evaluate`, `liveRecordFirefox`, `sessionOf`, `firstShot`), so no direct injection seam exists; the `evaluate({liveRunner})` seam bypasses `liveRecordFirefox` entirely, so a fake runner can feed the *predicate term* but can never exercise m3's assignment site. Only an end-to-end planted survivor (delivered here) reaches the mutation.

**m4 — observed binder reduced to session-only. KILLED.**
- m4-c (tamper): **exit 0, predicate true, receiptFinding null** — the J2 control flips from exit 1 to admitted. Coverage finding: the `captureScreenshot.sha256` term was the *sole* catcher of that decoration tamper; getTree/setViewport terms are additional but this fixture is caught only by the screenshot binding.
- m4-d exit 2 (enumeration refusal precedes the observed binder), m4-h exit 0 — both unchanged.

**m5 — predicate drops the survivors term. KILLED (plant); no frozen control catches it — honest-run-observable only.**
- m5-plant: **exit 0, predicate true, and the receipt itself records `survivors: 1`** — the divergence is inside the emitted JSON (survivors ≥ 1 with predicate true on an honest live run).
- Frozen controls: m5-c exit 1 and m5-d exit 2 are decided by receiptFinding/Refusal before the predicate line is read; J3-honest has survivors 0 so the term is vacuous. No control in the frozen battery exercises a survivor-positive state — the term is observable only on a live run that produces survivors (demonstrated).

## Summary

| mutant | honest | control (J1 graft / J2 tamper) | survivor verdict | verdict |
|---|---|---|---|---|
| m1 | exit 0 (floor intact) | J1: 2 → 0 admit | term untouched | killed |
| m2 | exit 0 (floor intact) | J1: exit 2 unchanged | term untouched | survived (defense-in-depth residual; no kill-rule breach) |
| m3 | exit 0 (floor intact) | J1/J2 unchanged | masks real survivor (1→0) | killed (plant); module-internal gap, end-to-end plant required |
| m4 | exit 0 (floor intact) | J2: 1 → 0 admit | term untouched | killed |
| m5 | exit 0 (floor intact) | J1/J2 unchanged (predicate-independent) | predicate admits survivors=1 | killed (plant); no frozen control — honest-run-observable only |

Coverage findings (not contract changes): (1) no frozen control exercises survivor-positive behavior, so the B2 predicate term and the survivors assignment are guarded only by live observation — a survivor-plant control would close this; (2) m2's survival documents that the env pin is redundant with enumeration for the static battery and load-bearing only against post-enumeration grafting.

## Restoration evidence

Canonical `c2-firefox-bidi-v3.mjs` sha256 after the battery = `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019` (before = after; scratch copies deleted with the scratch root). Fixture integrity at handoff: D still carries `refs/replace/88f73cf…`, C HEAD `01abe6d`. No probe processes remain (the `tabi-r36-c2-live` processes observed at cleanup belong to sibling seat ExecEgressLive's scratch, untouched). Raw run receipts (`.json`/`.rc`/`.err`, 57 files) preserved at `.ufo/waves/round-37/w1/MutC2a/evidence/`.

VERDICT finding m2 survived (enumeration-only defense sufficient for frozen battery; env pin is TOCTOU-only depth) and no frozen control covers survivor-positive states (m3/m5 catchable only by live plant) — all other mutants killed with restoration exact.
