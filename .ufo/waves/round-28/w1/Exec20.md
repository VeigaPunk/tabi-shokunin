# Exec20 — C1 audit: S106 receipt revision binding (round 28, wave 1)

Seat: Exec20 (leaf, audit-only). No production edits; no tracked changes made.
No tool installs (node/git preinstalled; PACMAN untouched).

## 1. Frozen predicate (C1)

Source: `.ufo/waves/round-28/claims.json` line 11 (full record at `:raw:11`).
Declared: "receipt must bind the measurement revision and the gate must verify the
committed receipt at that revision. Preserve fetch-failure as could-not-evaluate.
Target: gate selftest cases increase from 5 to at least 7, with red controls for
revision mismatch and correct revision; runtime gate at its committed target
receipt remains valid."  KillRule: "A receipt revision mismatch fixture must fail
while matching revision fixture passes. Missing source fetch remains
could-not-evaluate." FailureCapable: "selftest must exercise matching and
mismatching revision fixtures and assert exact verdicts."

The motivating omission is documented in round-27 lesson, quote (14 words): "the
S106 receipt has no revision field, so that inherited requirement is not proven."
(`corpus/lessons/round-27.md:21`). Prior verifier evidence: `corpus/lessons/round-27-verifier-spotcheck.md:16`
(round-27 C2 depth counter evidence) and `:46-47` (next-round repair directions).

## 2. How the current receipt source is read

`scripts/check-s106-evidence.mjs` `evaluate()` (:107-144):
1. `resolveRev(repo, revArg)` → canonical commit (line 108).
2. `readBlob(repo, rev, RECEIPT_PATH)` with `RECEIPT_PATH = "corpus/evidence/round-26/sources/s106.json"`
   (:45, :109); null → `Refusal` → CLI exit 2 could-not-evaluate (:110-112, :326-328).
3. `parseReceipt()` (:87-105): JSON parse; `schema === "tabi-s106-evidence-v1"`;
   requires `url`, `decoded_sha256`, `bytes_path` (strings), `decoded_bytes` (number),
   `anchor.line` (number), `anchor.text` (string). No revision field is required or read.
4. Bytes blob read at the SAME rev (:114); null → Refusal → exit 2.
5. Checks: sha256(bytes) vs `decoded_sha256`; anchor line equals `anchor.text`,
   occurrences == 1; byte count. `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch` (:119-127).

Committed receipt `corpus/evidence/round-26/sources/s106.json` (observed, lines 1-25):
top-level keys `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256,
bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status`
— no revision field. Receipt introduced at `0c666adc217685e1ece2af8596b732b303a3b15c`
(`git log --format='%H %s' --diff-filter=A -- corpus/evidence/round-26/sources/s106.json`
→ sole commit); identical at baseline (`git diff --stat 0c666ad eb23c0b -- <receipt>` empty).
Baseline == current tip == `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`
(`git rev-parse eb23c0b^{commit}`; `git log --oneline -5` head).

Measured at baseline/tip (commands, cwd lane root):
- `node scripts/check-s106-evidence.mjs --selftest --json` → `cases: 5, passed: 5`
  (ids: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid,
  missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate).
- `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`
  → `valid: true`, `present: true`, `sha_match: true`, `anchor_located: true`,
  `anchor_unique: true`, `byte_count_match: true`, exit 0.

Working tree: only untracked `.ufo/waves/round-28/` (`git status --porcelain=v1`, observation).

## 3. Smallest source revision-binding implementation (recommendation; not applied)

1. `parseReceipt()`: require new key `rev` (40-hex commit). Missing → `Refusal`
   ("receipt missing rev") → CNE exit 2 (mirrors existing missing-key path, :96-98).
   Additive; keep `RECEIPT_SCHEMA` constant.
2. `evaluate()`: after `parseReceipt`, resolve BOTH `receipt.rev` and the evaluated
   `rev` via `resolveRev` and compare canonical 40-hex. Mismatch → designated verdict
   (decision below). Adds ~6 lines.
3. Selftest: `fixtureReceipt()` gains `rev`; add two CASES — revision-match (green,
   exit 0, valid=true) and revision-mismatch (red). Mismatch fixture needs two
   commits (bytes committed; receipt committed naming a different rev; evaluate at
   the commit where receipt+bytes both exist). Total cases 5 + 2 = 7 ≥ target.
4. Committed `s106.json` must gain `rev` = its measurement revision (0c666ad* or the
   settle commit); otherwise the runtime gate flips valid → CNE at tip (F1). After
   that edit, re-run the gate at that rev: sha/anchor/data unchanged, so valid stays.

Exit-code decision (unresolved by frozen text): kill rule says mismatch must "fail";
failureCapable demands exact verdicts. Existing taxonomy: 0 valid, 1 invalid ("receipt
present but committed bytes disagree"), 2 CNE. Recommend invalid (exit 1, valid=false,
reason `rev_mismatch`) — receipt is present and parseable, mirrors the
`sha-mismatch-invalid` precedent (CASES expects exit 1). Alternative CNE (exit 2) is
also defensible; must be locked before landing.

## 4. Failure modes

- F1 legacy/no-rev receipts → CNE. All 5 current fixtures must add rev; committed
  `s106.json` MUST be updated or runtime valid→CNE regression at tip.
- F2 alias/short-hash comparison pitfall: never raw-string compare; resolve both sides
  and compare canonical hashes. Malformed rev must be Refusal → CNE, not invalid.
- F3 mismatch exit-class ambiguity (1 vs 2) — see §3 decision.
- F4 self-referential binding: `rev` is declared, not derived; a relabeled receipt
  with matching sha/anchor passes. Richer provenance (manifest style of
  `scripts/check-measurement-binding.mjs`) is heavier than this claim needs; state as limitation.
- F5 identical-bytes commits produce conservative reds: binding is to commit identity,
  not bytes.
- F6 no sibling receipt pattern to reuse: `check-bfcache-receipt.mjs` and
  `check-source-reopen-receipt.mjs` bind dates/digests, not a receipt-level rev;
  `check-measurement-binding.mjs` has full provenance but far more machinery.

## 5. Risks

- Reading receipt and bytes at the same rev keeps the read-only git contract; no
  fetch added (fetch-failure CNE retained).
- Evaluation at pre-binding historical revs will yield CNE for un-backfilled receipts (acceptable).
