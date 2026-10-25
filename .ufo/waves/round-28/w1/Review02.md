# Review02 — C1 claim review at committed baseline (seat 42)

Review of frozen round-28 claim C1 (`routed S106 evidence gate correction`) fit, gates,
binding and counter at baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`
(HEAD; working tree clean except untracked `.ufo/waves/round-28/`). Read-only;
no repo, fleet, sibling, or shokuknow writes. No tools installed.

## 1. Baseline control measurements (recorded before any implementation)

| # | Command (cwd = lane root) | Result | Evidence |
|---|---|---|---|
| 1 | `node scripts/check-s106-evidence.mjs --selftest` | `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0 | run above; matches claim `before: "5 cases at baseline eb23c0b..."` |
| 2 | `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | `present=true`, `sha_match=true`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`, `valid=true`, exit 0 | run above |
| 3 | `node scripts/check-gate-registry.mjs --rev eb23c0b... --json` | `nonconformant=0`, `clean=true`; s106-evidence row at SKILL.md:2514 | run above |
| 4 | `git status --porcelain` | only `?? .ufo/waves/round-28/` | run above |

Do-nothing control (claims.json control: "unchanged gate selftest is 5, below target")
reproduces exactly: selftest 5/5 at baseline. Baseline C1 target not reached.

## 2. Premise check — measurement-revision binding is absent (confirmed)

- Committed receipt `corpus/evidence/round-26/sources/s106.json` keys (baseline): `schema, row,
  url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes,
  decoded_lines, decoded_sha256, anchor, verification, status` — **no revision / measured_rev
  field**. Same at the original round-26 commit `0c666ad` (`git show 0c666ad:...s106.json`).
- `check-s106-evidence.mjs` `evaluate()` resolves only the *invocation* rev
  (`resolveRev`) and reads bytes/receipt at it; it never compares against any receipt-recorded
  revision (none exists). `parseReceipt` does not require a revision key.
- Conclusion: C1's motivating defect is real at baseline — the receipt is not bound to a
  measurement revision and the gate cannot verify "the committed receipt at that revision".

## 3. Gates

- Verdict map 0/1/2 (valid / invalid / could-not-evaluate) and exit codes verified by
  selftest cases (clean=0, sha-mismatch=1, anchor-off-by-one=1, missing-bytes=2,
  missing-receipt=2).
- Missing-source CNE is preserved today: `missing-bytes-could-not-evaluate` and
  `missing-receipt-could-not-evaluate` both exit 2, never valid (selftest run above).
- `check-gate-registry` validates only structural fields (presence of 0/1/2 verdict map,
  `--selftest` flag, pinned path, scope, owner) — it does **not** compare the row's
  `(cases=5, passed=5)` text against the script's actual case count. Implementers must update
  SKILL.md:2514's Self-test cell when cases grow to >=7; nothing enforces that update
  (staleness gap, not a gate failure).

## 4. Counter

- `countingCommand` `node scripts/check-s106-evidence.mjs --selftest` is deterministic at
  baseline: prints `cases=5 passed=5`, exit 0. Target >=7 requires exactly the two revision
  cases described (red revision-mismatch + green matching-revision) on top of the existing 5;
  the claim's metric is the selftest `cases` count (text line / `--json` `cases` field).

## 5. Unprovable conditions (claim underdetermination)

1. **Binding semantics not defined.** "receipt must bind the measurement revision and the gate
   must verify the committed receipt at that revision" admits at least three non-equivalent
   implementations: (a) strict equality between receipt-named rev and evaluated rev
   (impossible for any receipt committed at an ancestor and evaluated later — gate would go
   invalid at every later tip, making "runtime gate ... remains valid" satisfiable only at the
   exact receipt commit); (b) ancestor-or-equal of evaluated rev with bytes verified at the
   named rev (mirrors `check-measurement-binding`'s `measured_revision_not_ancestor` reason);
   (c) canonical verification at the receipt-named rev regardless of evaluated rev. Neither the
   `declared` text, `control`, nor `killRule` disambiguates. Only a ruling (or the chosen
   implementation read against a fixed definition) can decide conformance.
2. **Revision-mismatch verdict class unspecified.** Whether a mismatched-revision receipt must
   read *invalid* (exit 1) or *could-not-evaluate* (exit 2) is not stated; `failureCapable`
   only demands "assert exact verdicts". The two classes are distinct in the gate's model.
3. **Legacy-receipt handling unspecified.** The committed receipt has no revision field.
   If the new gate hard-requires one, the baseline receipt becomes could-not-evaluate and
   "runtime gate at its committed target receipt remains valid" holds only for the *rewritten*
   receipt, not the baseline one. The claim doesn't say whether the receipt (data) is in the
   repair scope or whether revision-optional backward compatibility is required
   (claim text literally names only `scripts/check-s106-evidence.mjs`).
4. **"Preserve fetch-failure as could-not-evaluate" has no gate-side referent.** The gate never
   fetches (reads committed blobs only; verified in source header + `git()` implementation).
   Fetch failure occurs at evidence-production time; its gate-side carrier is the existing
   missing-bytes/missing-receipt CNE paths (already covered by 2 cases). As a *distinct* gate
   behavior the clause is unprovable/undefined.

## 6. Residual risk & verification gaps

- Fixture mechanics: the selftest builds single-commit temp repos; a revision-mismatch case
  needs a multi-commit fixture (or an explicit rev differing from the receipt commit) to be
  distinguishable from `revision does not resolve` refusal (which would read as exit 2 CNE,
  collapsing the red case into the CNE class). Implementers must place the mismatch fixture so
  both revs resolve.
- No production caller imports `check-s106-evidence` (`git grep` finds only wave-plan docs and
  the SKILL.md row); binding changes have no internal consumers beyond reports.
- Gate-registry row staleness (row text `cases=5`) after the case bump is unenforced.

## 7. Verdict

C1 premise (missing measurement-revision binding) is **confirmed at baseline**; control
measurements reproduce the claim's `before` (5 cases) and current runtime validity
(`valid=true`). The claim's after-state is **underdetermined** on binding semantics, mismatch
verdict class, and legacy-receipt handling — those three need explicit definition/ruling before
an implementation can be judged conformant; with them fixed, the claim is mechanical
(>=7 selftest cases, red mismatch + green match fixtures, receipt gains a revision binding,
runtime gate valid at its committed target receipt).
