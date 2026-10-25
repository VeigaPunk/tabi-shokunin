# Review06 — round 28 C1 claim review (S106 revision-binding gate)

Seat: Review06 (reviewer, leaf). Baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (= HEAD; tracked worktree clean, only untracked `.ufo/waves/round-28/`). Read-only; no tools installed (node `v26.12.0`-era runtime already present; no pacman/uv/cargo/npm action). All evidence below is at committed baseline bytes unless stated.

## 1. C1 claim fit (positive)

- Routed-defect match: `corpus/lessons/round-27-verifier-spotcheck.md:47` — "put revision identity in receipt/evaluation and test it against the measured commit" — is exactly what C1 declares. Same source also records round-27 C2 as unprovable for this omission (`:16`, `:24`). Fit: direct.
- Axis: C1 declares `depth`; `axisScoresAtRoundStart` lowest non-retired tie = 8 includes depth. C1 works the lowest-tying axis. Fit: OK.
- `before` verified empirically: `node scripts/check-s106-evidence.mjs --selftest` → `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0 (cases: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate). Matches claim `before: 5 cases at baseline eb23c0b…`.
- Runtime counter at baseline: `node scripts/check-s106-evidence.mjs --rev eb23c0b… --json` → `valid=true`, exit 0 (sha_match/anchor_located/anchor_unique/byte_count_match all true). Same shape at round-27 final HEAD `ef8aa4a…` (valid=true, exit 0). No revision field is emitted or required today.
- CNE preservation: the script has no network path; source absence maps to refusal → exit 2 (missing receipt/missing bytes). `killRule`'s "Missing source fetch remains could-not-evaluate" is satisfiable without new machinery (observation: no fetch exists; inference: preserved by keeping absent-blob → exit 2).

## 2. HIGH — binding semantics: literal reading is unsatisfiable at committed bytes

At baseline the receipt (`corpus/evidence/round-26/sources/s106.json`) has **no revision field**; `parseReceipt` requires only schema/url/decoded_sha256/bytes_path/decoded_bytes/anchor, and `evaluate()` reads both receipt and bytes blobs at the `--rev` argument (`scripts/check-s106-evidence.mjs` ~:109-126).

Inference (from code + git semantics): if the repair is read as "receipt blob at revision R must contain `revision: R`", then the receipt blob would have to embed the hash of the commit that contains it — a hash self-reference that cannot be constructed for any committed blob, and equally cannot be built in the selftest fixture (the fixture writes the receipt before `d.commit()` returns the hash; the future hash is unknowable at write time). Under that reading the "matching revision accepted" control and the production "target receipt valid at its named revision" are both unbuildable, and the killRule would always fire.

Satisfiable semantics (consistent with the declared wording): gate reads the receipt at the measured rev and requires a `revision` field naming a revision; it then verifies the receipt's expectations against the committed bytes at that named revision (resolve `receipt.revision`, read `bytes_path` blob there, recompute sha/anchor/byte-count). Then "receipt must bind the measurement revision" = the receipt names the revision at which the source bytes were measured, and "gate must verify the committed receipt at that revision" = expectations are checked at that named revision. This is buildable in fixtures (two-commit: bytes commit, then receipt commit naming it) and lets the production receipt name an existing bytes commit.

Required: the executor must implement the ancestor-naming semantics and say so; a self-naming implementation is provably unbuildable. The frozen claim is ambiguous between the two — this is the central unprovable condition.

## 3. MEDIUM — counting command does not measure the runtime-validity clause

Claim `countingCommand` is `--selftest` only; its `after` also asserts "target receipt valid at its named revision", which requires a runtime `--rev <named> --json` run against the updated receipt. The declared counter cannot falsify that clause alone. Control/measurement should pair:
`node scripts/check-s106-evidence.mjs --selftest` (≥7, red mismatch + green match) **and** `node scripts/check-s106-evidence.mjs --rev <named-revision> --json` (valid=true, exit 0) recorded with the named revision.

## 4. MEDIUM — post-fix receipt hazard: old committed receipt becomes refusal/CNE

A strict new schema (required `revision`) makes the **existing** committed receipt a "receipt missing revision" refusal at every revision presenting that blob — including `eb23c0b…`. Therefore "the matching committed receipt" in the killRule can only mean the round's **updated** receipt; the claim must not be judged against the baseline blob. The after-state is unverifiable at baseline by construction (claims frozen before data; nothing committed yet). Confirm the updated receipt names a revision and passes at that revision before claim success.

## 5. LOW — registry prose drift

`SKILL.md:2514` s106-evidence row states "(cases=5, passed=5)"; after repair this prose must move to ≥7 (or be updated). `scripts/check-gate-registry.mjs` validates row shape/flag names only, not case counts, so no registry gate breakage is expected (observation of validator fields; no count parsing).

## 6. Negative-claim sweep

- No sibling caller of the receipt/schema/gate inside the lane: repo-wide grep for `tabi-s106-evidence-v1|s106\.json|check-s106-evidence` matched only the gate script, history under `.ufo/waves/round-26|round-27`, `corpus/lessons/round-27…`, evidence JSONs, and `SKILL.md` prose. No consumer would break on a new required field other than the gate itself.
- Baseline is byte-identical to the frozen claim baseline (HEAD = `eb23c0b…`; tracked diff empty).

## 7. Unprovable conditions (to record with the claim)

1. Which revision the production receipt should name is not determinable from the frozen text; it depends on the landing commit topology (executor must record it).
2. The runtime-validity clause is not measurable by the declared `countingCommand`; needs the paired `--rev` run.
3. No committed receipt currently carries a revision; the whole after-state is unprovable at baseline by construction (expected for before-data freeze).
4. Binding semantics ambiguity (Section 2) — the only reading that is provably buildable is ancestor-naming.

Verification gaps (mine): no fixture builds/mutations were run (not this seat); feasibility statements are code-grounded inference, not empirical fixture runs.
