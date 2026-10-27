# MutC2a — C2 v3 mutation probe (summary)

Full matrix, hashes, and raw-receipt pointers: `.ufo/waves/round-37/w1/MutC2a/report.md`; raw run outputs: `.ufo/waves/round-37/w1/MutC2a/evidence/` (57 files).

- Pristine ground truth reproduced: graft clone exit 2 (Refusal `refs/replace/88f73cf…`), observed-tamper exit 1 (`run1: observed captureScreenshot.sha256 != transcript first screenshot`), honest exit 0 predicate true (admitted 16, survivors 0, egress 0, samples 2/pids 9) — all matching the frozen c2r37-J1/J2/J3-v3 receipts; plus a planted-survivor control (exit 1, survivors 1) validating the plant technique.
- m1 (drop replaceRefs enumeration): KILLED — graft clone flips exit 2 → 0/predicate true; with the env pin retained it admits on honest bytes (receiptFinding null), whereas frozen v2 semantics admit the forged decoration read through the graft.
- m2 (GIT_NO_REPLACE_OBJECTS removed, enumeration kept): SURVIVED — refusal byte-identical on every fixture; enumeration alone suffices for the static battery; the env pin is depth against post-enumeration grafting (TOCTOU) only. No kill-rule breach (no admit, no read-through).
- m3 (rec.survivors = 0 unconditional): KILLED via end-to-end survivor plant (exit 0/survivors 0 while a plant existed vs pristine plant exit 1/survivors 1). Gap classified precisely: `scratchSurvivors` is module-internal and the `liveRunner` seam bypasses `liveRecordFirefox`, so only a planted real survivor reaches the mutation.
- m4 (observed binder session-only): KILLED — tamper flips exit 1 → 0; the captureScreenshot term is the sole catcher of that decoration tamper.
- m5 (predicate drops survivors term): KILLED via plant (receipt records survivors 1 with predicate true) — but NO frozen control catches it: honest-run-observable only.
- Restoration exact: canonical counter sha256 before = after = `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019`; mutants were scratch copies, destroyed with scratch. No probe processes remain. No tools installed.

Coverage findings for the L1: (1) the frozen battery has no survivor-positive control, so B2's term and the survivors assignment are guarded only by live observation — a planted-survivor control would close it; (2) m2 documents the env pin as redundant-with-enumeration for static grafts.

VERDICT finding m2 survived (enumeration-only defense sufficient for frozen battery; env pin is TOCTOU-only depth) and no frozen control covers survivor-positive states (m3/m5 catchable only by live plant) — all other mutants killed with restoration exact.
