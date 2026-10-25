# Exec08 — C1 frozen-predicate audit: receipt source read path, smallest revision binding, failure modes

Report path: `.ufo/waves/round-28/w1/Exec08.md` (relative to lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`).
Frozen claims read at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (id C1, line 11; frozen before data, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`).
Seat: Exec08 (wave w1, item 8). Lane bounds honored: read-only git, no tracked edits, no subagents, no builds/tests/formatters run (parent owns gate execution). No tool installs (nothing needed; RULES.md read).

## 1. Frozen C1 predicate (claims.json:11)

Declared (quote): "Repair the prior round's measurement-revision binding omission in scripts/check-s106-evidence.mjs: receipt must bind the measurement revision and the gate must verify the committed receipt at that revision. Preserve fetch-failure as could-not-evaluate."
Target: "gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid."
Control: "A receipt revision mismatch fixture must fail while matching revision fixture passes."
KillRule: "If adding revision binding causes the matching committed receipt to fail or the mismatch fixture to pass, claim misses; do not relax the predicate. Missing source fetch remains could-not-evaluate."
Prior defect evidence (round-27 verifier spot-check, `corpus/lessons/round-27-verifier-spotcheck.md`): line 16 — "Frozen inherited measurement-revision binding and fetch-failure requirements are absent from the round-27 claim/receipt, so counter evidence does not establish the whole claim." Line 47 — "Tabi next round: preserve inherited C2 fetch-failure and measurement-revision binding; put revision identity in receipt/evaluation and test it against the measured commit."

## 2. How the current receipt source is read (observation, code)

All in `scripts/check-s106-evidence.mjs` at baseline HEAD `eb23c0b`:

- `RECEIPT_PATH = "corpus/evidence/round-26/sources/s106.json"` (line 45).
- `readBlob(repo, rev, path)` (lines 68-72) shells `git -C <repo> show <rev>:<path>` via `spawnSync`; nonzero status → `null`. Env isolation: `GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` set to `/dev/null` (line 62).
- `resolveRev(repo, rev)` (lines 74-79) validates the arg with regex `^[A-Za-z0-9][A-Za-z0-9._\/-]*$`, then `git rev-parse --verify --quiet <rev>^{commit}`; failure → Refusal (exit 2).
- `evaluate(repo, revArg)` (lines 107-144):
  1. `rev = resolveRev(...)` (108);
  2. receipt blob read **at that revision**: `const receiptText = readBlob(repo, rev, RECEIPT_PATH)` (109); null → Refusal "receipt absent at {rev}" (110-112);
  3. `parseReceipt` (87-105): JSON parse, schema `tabi-s106-evidence-v1` required, then required keys `url`, `decoded_sha256`, `bytes_path` (strings), `decoded_bytes` (number), `anchor.line` (number) + `anchor.text` (string). Unknown keys tolerated;
  4. bytes blob read at the same revision: `readBlob(repo, rev, receipt.bytes_path)` (114); null → Refusal "decoded bytes absent at {rev}" (115-118);
  5. checks: `shaMatch = observedSha === receipt.decoded_sha256` (120); anchor line lookup `lines[receipt.anchor.line - 1]` with `trim()` equality (121-123); `anchorUnique` = exactly one matching line (124-125); `byteCountMatch` via `Buffer.byteLength` (126); `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch` (127).
- Verdicts: 0 valid, 1 invalid (present but disagree), 2 could-not-evaluate (Refusal path in `main()` lines 322-329; missing receipt/bytes, unreadable revision, malformed receipt). Missing-source CNE is retained by both the "missing-bytes" and "missing-receipt" selftest cases.
- Selftest: `CASES` array (lines 175-213) has exactly **5** entries: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate. Fixtures build a `mktemp` git repo (lines 215-250), commit receipt+bytes, then call `evaluate` on the fixture repo.

Receipt byte-level identity (observation): `./ corpus/evidence/round-26/sources/s106.json` field set = `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status`. **No commit/revision field exists.**

## 3. Audit finding: the binding omission is real at both layers

- The gate binds the **reading revision** (everything is read via `git show <rev>:<path>` at the resolved rev) but the **receipt is unbound to any measured commit**: it carries no revision field and the gate never compares the evaluated `rev` against anything in the receipt. Running at any later rev with unchanged bytes silently re-validates the same receipt; with changed bytes the verdict flips to invalid(1) with no way to tell source drift from receipt drift.
- The committed receipt `s106.json` (round-26 evidence-of-record; its `status` says the counter was not built that round) has no revision identity. The round-27 verifier already recorded the gate returning `present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true valid=true` at `ef8aa4a` (spotcheck:16) yet flagged the claim unprovable precisely for missing revision/fetch binding.
- Baseline state: `git rev-parse HEAD` = `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. Between spotcheck rev `ef8aa4a` and baseline, the only changed path is `corpus/lessons/round-27-verifier-spotcheck.md`; the script blob (`45138be8395d837c2338b21911de7c47689144ba`), receipt blob (`e2cc93298c4df00cbac614b6d8ebebff705ddbfb`), and bytes blob (`1ec86eaac948e8c295def4a70273bd7e75e01446`) are identical at both revisions (commands: `git rev-parse <rev>:<path>` for each). Therefore the verifier's `valid=true` observation at `ef8aa4a` maps onto the baseline blobs (inference chain, not re-run).

## 4. Smallest source revision-binding implementation (design, report-only)

Delta to `check-s106-evidence.mjs` + receipt, keeping all existing semantics:

1. **Schema**: add one required field `source_rev` (string; 40-hex commit) to the receipt; extend `parseReceipt`'s required-key loop (currently line 96) with a strict check `typeof doc.source_rev === "string" && /^[0-9a-f]{40}$/.test(doc.source_rev)`.
2. **Evaluation**: after `parseReceipt` (line 113), compare `rev` (resolved, line 108) with `receipt.source_rev`; on inequality throw `Refusal("receipt revision mismatch: receipt=… rev=…")` → exit 2 CNE, consistent with "cannot evaluate the claim at this revision". This satisfies the red control (mismatch fails) and keeps the green path (matching rev) untouched.
3. **Receipt stamping**: the receipt must record the commit at which decode/hash/anchor were measured — i.e. stamp `source_rev` **after** the measurement commit exists (commit-first ordering), and the target receipt at wave close must carry the final wave commit hash so `node scripts/check-s106-evidence.mjs --rev <tip> --json` returns `valid=true`.
4. **Selftest**: extend `fixtureReceipt` default with `source_rev`; because the rev is only known after `d.commit()`, each case builder must obtain `fx.rev()` before writing the receipt. Add two cases → **7 total**:
   - `revision-mismatch-refused`: receipt `source_rev` = a valid 40-hex ≠ fixture rev → expected exit 2, `valid:null`;
   - `revision-match-valid`: receipt `source_rev` = fixture rev → expected exit 0, `valid:true`.
   Existing 5 cases get `source_rev` stamped so they stay green; missing-source CNE cases remain unchanged (requirement "retain missing-source CNE").
5. **Docs**: update the header comment (lines 3-17) and the "Frozen by" note (lines 11-13) to reference round-28 claim C1; `SCHEMA` may stay `tabi-s106-evidence-v1` with the new required field (bump would orphan the legacy receipt — see BM4).

Predicate after change: `valid = present && source_rev_matches && sha_match && anchor_located && anchor_unique && byte_count_match`; CNE covers missing receipt/bytes, malformed receipt, bad revision, and revision mismatch.

## 5. Failure modes

Pre-existing (current gate, before binding):
- FM1 **No measurement-revision identity** (the defect): receipt unbound to a measured commit; later revisions with unchanged bytes silently pass; changed bytes yield invalid(1) indistinguishable from source drift vs receipt drift.
- FM2 **Working-tree invisibility**: only committed blobs at `rev` are read; uncommitted local measurements can never be validated, a dirty tree is invisible to the gate.
- FM3 **Moving refs**: `resolveRev` accepts branch/tag names; a moving ref silently changes the evaluated target between runs. Pinning to 40-hex (as usage doc suggests) is required for stable evidence.
- FM4 **Schema elasticity**: `parseReceipt` tolerates unknown keys; a misspelled future binding field would be silently ignored (no strict extra-key rejection).
- FM5 **Anchor/bytes-path trust**: `bytes_path` comes from the receipt and can name any repo path; the hash check prevents false positives unless a collision is crafted (read-only, low risk). Anchor compare uses `trim()` + `split("\n")`; single-line anchors only (CRLF tolerated via trim).
- FM6 **Shallow/partial clones** yield CNE on missing objects (safe direction).

Introduced by the proposed binding:
- BM1 **Ordering hazard**: `source_rev` is only known post-commit; the receipt must be written after the commit (fixture builder must stamp after `fx.rev()`), otherwise the binding field is wrong or absent.
- BM2 **History rewrite**: if the recorded `source_rev` becomes unreachable (rebase/GC), `resolveRev` of it fails → CNE until the receipt is re-stamped. Re-stamp policy should be documented.
- BM3 **Hash-form normalization**: compare both sides as full 40-hex (normalize the receipt's value through `resolveRev` if short forms are allowed); otherwise equivalent abbreviations false-mismatch.
- BM4 **Legacy receipt**: the committed `s106.json` lacks `source_rev`; with a strictly required field it would fail parse → CNE at every revision including baseline. The wave must re-stamp the receipt at its target commit (data change outside this seat; coordination needed) or make the field required-but-flagged and treat absence as CNE.
- BM5 **Verdict pinning**: mismatch must be asserted as exactly one of exit 2 (recommended: cannot evaluate at that revision) or exit 1 in the selftest; the red control and the kill rule only require nonzero failure, so the choice must be pinned and asserted.
- BM6 **Gate-at-tip expectation**: after binding, running at any rev other than the receipt's recorded rev fails by design; the "runtime gate at its committed target receipt remains valid" therefore requires the final receipt to record the final wave commit (coordinated re-stamp; not implicit).

## 6. Evidence log

| # | Claim | Kind | Command / location |
|---|---|---|---|
| E1 | Baseline HEAD = `eb23c0b…` | observation | `git rev-parse HEAD` |
| E2 | Selftest has 5 cases at baseline | observation | `CASES` array, `scripts/check-s106-evidence.mjs:175-213`; corroborated by spotcheck:16 "self-test 5/5" |
| E3 | Receipt read via `git show <rev>:<path>` at resolved rev | observation | script lines 68-72, 108-118 |
| E4 | Receipt has no revision field | observation | `corpus/evidence/round-26/sources/s106.json` full read (field set listed in §2) |
| E5 | Script/receipt/bytes blobs identical at `ef8aa4a` vs baseline | observation | `git rev-parse <rev>:<path>`: `45138be…`, `e2cc932…`, `1ec86ea…` identical; `git diff --name-only` shows only `round-27-verifier-spotcheck.md` |
| E6 | Gate `valid=true` at `ef8aa4a` | observation (prior) | spotcheck:16 recorded command `node scripts/check-s106-evidence.mjs --rev ef8aa4a… --json` |
| E7 | That validity maps to baseline blobs | inference | chained from E5+E6; not re-run (parent owns gate execution) |
| E8 | No builds/tests/linters run this seat | negative claim | no tool invocation of node/git-build; only `git rev-parse/rev -C` read-only queries listed above |

Frozen claim file: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (lines 11-12; schema `tabi-round-claims-v1`, frozenAt 2026-10-25, frozenBeforeData true).

## 7. Notes / risk

- Sibling seats overlap on C1 (w1-spec items 1/7/13/19 feasibility, 33-40 falsifiers, 41-48 reviewers, 49-56 mutation-testers, 57-60 connectors, 61-64 scouts); findings here are scoped to the audit requested in item 8.
- No tracked files were edited; no scratch was created; no tool installs performed.
