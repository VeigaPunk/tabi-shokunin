# Exec14 — C1/C2 frozen-predicate audit (tabi r28 w1, seat 14)

Seat: UFO-FSD fleet executor (leaf). Scope: audit only; **no production code edited,
no repo mutation, no installs** (RULES.md read; node pre-existing; PACMAN untouched).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (HEAD `eb23c0b` == frozen baseline).

## 1. Frozen claims read

- `.ufo/waves/round-28/claims.json:11` — C1 (depth): `s106_gate_revision_binding_cases`;
  countingCommand `node scripts/check-s106-evidence.mjs --selftest`; before **5 cases at baseline
  eb23c0b…**; after **≥7 cases with revision mismatch rejected and correct revision** accepted.
- `.ufo/waves/round-28/claims.json:12` — C2 (calibration): `selfassessment_mismatches_and_cases`;
  countingCommand `node scripts/check-selfassessment.mjs --rev <REV> --json`; before: false-clear of
  `LOG.md:221` per `corpus/lessons/round-27-verifier-spotcheck.md:15`; after: `LOG.md:221` appears as a
  mismatch unless an exact-line correction cites it; selftest includes red unrelated-citation + positive
  exact-citation controls.
- Prior defect evidence read: `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47` (C1 false-clear;
  C2 not provable because measurement-revision binding absent from receipt/claim).

## 2. C1 audit — scripts/check-s106-evidence.mjs

### How the receipt source is read (code observation)

- `check-s106-evidence.mjs:108-118`: `evaluate()` resolves `rev` → `readBlob(repo, rev, RECEIPT_PATH)`
  reads the receipt blob **at the evaluated revision** (`corpus/evidence/round-26/sources/s106.json`,
  `RECEIPT_PATH` line 45) → `parseReceipt` → `readBlob(repo, rev, receipt.bytes_path)` reads the committed
  decoded bytes **at the same revision**.
- `check-s106-evidence.mjs:127`: `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch`.
- Receipt content observed (`corpus/evidence/round-26/sources/s106.json:1-25`): `url`, `fetched_at`,
  `encoded_bytes/_sha256`, `bytes_path`, `decoded_bytes/_sha256`, `anchor{line,text,comment,occurrences}`,
  `verification{command,exit,result}`, `status`. **No `revision` field anywhere; `evaluate()` never
  compares any declared revision to `rev`.**

### Measured baseline (observation, commands run in lane root)

| Command | Result |
|---|---|
| `node scripts/check-s106-evidence.mjs --selftest --json` | `cases=5 passed=5 ok=true` |
| `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | `valid=true`, exit 0 |
| `node scripts/check-s106-evidence.mjs --rev ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 --json` | `valid=true`, exit 0 |

### Defect

The receipt binds no measurement revision: the gate validates any committed receipt/bytes pair at any
revision, so stale/foreign evidence cannot be distinguished by revision, and the 5-case suite has no
matching/mismatching revision control. C1's "after" target is unreachable without change.

### Smallest source revision-binding implementation (proposal — NOT applied)

1. **Receipt schema**: add required `"revision": "<40-hex>"` = the commit where the S106 evidence landed.
   Observed via `git log --oneline -- corpus/evidence/round-26/sources/` → `0c666adc217685e1ece2af8596b732b303a3b15c`
   (round-26 "routed S106 decoded evidence" commit). `parseReceipt` (line 96-103 pattern): require string,
   else `Refusal` → could-not-evaluate (exit 2), same as existing malformed-field handling.
2. **evaluate()**: after parse, `revDeclared = resolveRev(repo, receipt.revision)`; compute
   `revisionMatch = (revDeclared === rev) || isAncestor(repo, revDeclared, rev)` — declared revision must
   resolve and be the evaluated commit or an ancestor (evaluation at-or-after measurement). Mismatch →
   present-but-wrong → exit 1, `valid=false`, new output field `revision_match`. `resolveRev` already
   rejects bad syntax (line 75).
   - Equality-only alternative creates fixture circularity (a receipt cannot declare the exact commit it is
     being committed into); ancestor-or-equal avoids it and satisfies "verify the committed receipt at that
     revision".
3. **Selftest**: existing 5 cases each write receipt after a first `d.commit()` so `revision` resolves;
   add (a) `revision-match-valid` (green, exit 0), (b) `revision-mismatch-invalid` (red, exit 1): write a
   commit on a side branch, return to master, write receipt declaring that side commit → not an ancestor.
   Total 7 ≥ 7. Keep `missing-bytes-could-not-evaluate` / `missing-receipt-could-not-evaluate` (exit 2) —
   missing-source CNE retained.
4. **Target receipt**: add `"revision": "0c666adc217685e1ece2af8596b732b303a3b15c"` to
   `corpus/evidence/round-26/sources/s106.json`; runtime gate at the round target stays `valid`
   (observed sha/anchor/byte facts unchanged; declared revision is ancestor of tip).

### Failure modes

- Old receipts lacking `revision` become CNE (exit 2) — behavior change; document for pre-r28 revisions.
- Unresolvable declared revision → CNE (Refusal), never silently ignored.
- Ref-typed declared revision can move (branch); production must store a pinned 40-hex.
- Ancestor semantics allow evaluating at descendants; tightening to strict equality later is possible but
  would invalidate runs at any later tip.
- Revision alone never re-fetches; `sha_match`/`byte_count_match` still carry byte-drift detection.

## 3. C2 audit — scripts/check-selfassessment.mjs m1 supersession

### Measured baseline (observation)

| Command | Result |
|---|---|
| `node scripts/check-selfassessment.mjs --selftest --json` | `cases=17 passed=17 ok=true` |
| `node scripts/check-selfassessment.mjs --rev HEAD --json` | `mismatches=1`, `superseded=10`, `clean=false`; finding `LOG.md:221` `claimed=8 observed=12 superseded=TRUE` (false-clear) |

Note: the single *counted* mismatch is `m3-unlanded-paths` (7 untracked paths), caused by the untracked
`.ufo/waves/round-28/` wave scaffolding — environmental, not the C2 target.

### False-clear mechanism (code observation)

- `check-selfassessment.mjs:319-327`: a later paragraph clears a stale mention iff it (a) names the same
  script, (b) matches `/supersed|correct/i`, (c) matches **`/:\d+/` — ANY colon-number token**, (d)
  `statedTallyNumbers(text).includes(f.observed)`.
- Clause (c) does not require the *specific* stale line. Observed clearing paragraph: `LOG.md:1904-1907`
  "Correction (supersedes LOG.md:335) … `scripts/check-freshness.mjs` … measured `cases: 12`" satisfies all
  four loose clauses for `f.line=221` (same script, marker, `:335`, number 12).
- Negative sweep: `grep ':221' LOG.md` returns only the meta-admission at `LOG.md:1931`
  ("`LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221")
  — that paragraph names no script and states no tally, so **no paragraph in LOG.md satisfies the exact rule
  for line 221**. Defect was already admitted in-repo at `LOG.md:1929-1938` (round-26 wrap-up).
- Therefore `LOG.md:221` must remain a mismatch under the frozen rule; today it is wrongly cleared.

### Smallest fix (proposal — NOT applied)

- Replace `/:\d+/` with an exact-line citation test: `new RegExp(":" + f.line + "(?![0-9])")` (digit
  boundary guards `:6` vs `:61`).
- Cases: keep green `m1-log-stale-then-corrected` (exact `:6` citation — already exists); add red
  `m1-log-unrelated-line-citation` (correction cites `:99`, states `cases: 13`, stale `:6` must stay a
  mismatch → exit 1). Keep red `m1-log-wrong-number-correction`. Suite 17 → 18.
- After fix, tip run: `LOG.md:221` moves into counted mismatches (claimed 8 ≠ observed 12, superseded=false)
  → `mismatches` nonzero from m1 alone.

### Failure modes

- Adjacent/multi-digit line numbers need the digit-boundary lookahead.
- Citation forms outside `:LINE` (e.g., plain "line 221") will not clear — frozen rule demands `:/LINE/`.
- Range citations ("LOG.md:221-225") still match via `:221` — acceptable.
- SCORECARD m1 matcher (`check-selfassessment.mjs:231-240`) shares the loose `/:\d+/` (with a different
  "later clean line" shape) — adjacent latent relaxation, outside C2 scope; flag for a follow-up.

## 4. Evidence register

- Observations: all four gate runs and `git status --porcelain` (only `?? .ufo/waves/round-28/`),
  `git log` for evidence commit, file reads as cited above.
- Inference: identification of the clearing paragraph (1904-1907) — derived from code clauses + text; not
  instrumented.
- Negative claim with sweep: no exact `:221` correction citation exists (grep sweep above).
- Unknown: none blocking. No installs; no real-site interaction; no credentials touched.

## 5. Risks / blockers

- None. Report-only per contract; production code untouched; no scenarios hidden.
- Suggested main-agent checks: after implementation, rerun both `--selftest` (S106 ≥7, selfassessment ≥18)
  and `--rev <target> --json` for both gates.
