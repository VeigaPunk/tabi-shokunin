# RevC2Gate — C2 gate review: `scripts/check-s106-evidence.mjs` vs frozen C2

Item: review the gate against frozen C2 = `.ufo/waves/round-26/claims.json` claims[1] (frozen 2026-10-25).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Reviewed revs: landing `5577d1b6fe2dc298486e354b5416d38acafeffaa`, wave baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`, current master/HEAD `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (`git rev-parse HEAD master`).

Method: full read of the landed script (worktree == HEAD except comment-only edits, see I6); non-author re-run of the counter and selftest; 8 adversarial scratch fixtures (`mktemp -d` + `git init -C D`, `rev-parse --show-toplevel == D` verified) run via `node scripts/check-s106-evidence.mjs --repo "$D" --rev HEAD --json`. No lsp device is mounted in this session — all checks are text + execution, no semantic-server proof claimed. Fixtures lived in `/tmp` and were removed; nothing tracked was touched.

## Findings by severity

### MEDIUM

**M1 — Gate never pins the frozen anchor content or URL; a self-consistent fabricated pair reaches `valid=true`.**
`parseReceipt` (scripts/check-s106-evidence.mjs:87-102) accepts any non-empty `url` string and any non-empty `anchor.text`; `evaluate` checks only receipt-vs-bytes internal consistency (lines 119-127). The frozen predicate names the specific content: "requires the anchor text 'BASE_FEATURE(kBackForwardCache' at the recorded line with the FEATURE_ENABLED_BY_DEFAULT marker" (r26 claims[1].declared). Empirical P7: fixture with `url=https://example.invalid/?format=TEXT`, bytes `hello anchor world\n`, matching sha, anchor at line 1 — `exit=0 valid=True anchor_unique=True`. No marker, no real URL, fully valid. The skip-work protection is only that the fabricator must also commit matching bytes; provenance to the googlesource transfer is unenforced at gate time (consistent with the frozen counter wording, but it is the one avenue that lets wrong evidence read `valid`). Cheap hardening: require `url ===` the frozen googlesource URL (or prefix) and `anchor.text` to contain both `BASE_FEATURE(kBackForwardCache` and `FEATURE_ENABLED_BY_DEFAULT` as constants. The real receipt passes both checks today (verified: url byte-exact; line 187 contains both markers; trimmed-text occurrences=1), so the hardening cannot regress the tip.

### LOW

**L1 — Measurement-binding kill rule is unenforceable as written; compensated, but the r27 record silently dropped the sentence.**
r26 claims[1].killRule: "the receipt's recorded revision must equal the report's cited measurement revision". The committed receipt has no revision field (`git show <rev>:corpus/evidence/round-26/sources/s106.json` keys: anchor, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, encoded_bytes, encoded_sha256, fetched_at, row, schema, status, transfer, url, verification — no rev-like key). The gate compensates structurally: receipt and bytes are read only at the resolved rev (`readBlob(repo, rev, …)`, lines 108/116), and the output echoes the resolved full hash (JSON `rev`, text `rev=`), so an honest citation is externally checkable. I would flag the schema gap: either enforce an optional `measured_revision` receipt field or record that binding is by same-tree reads. Related: round-27 claims.json C2.killRule replaced the binding + fetch-failure sentences with the naive-control note, while the dispatch asserted "kill rules unchanged" — wording drift worth a revisions[] entry (r27 `revisions` has 1 entry, C3-only).

**L2 — Post-freeze behavior change not disclosed in claims revisions[].**
At landing 5577d1b, receipt-absent returned `{present:false, …, valid:false}` → exit 1 ("invalid"), contradicting the frozen kill rule "could-not-evaluate (exit 2), never valid". `5198e28` ("classify missing S106 receipt as could-not-evaluate") converted it to `throw new Refusal` (line 111) and added the 5th selftest case; `5ed6484` added `--allow-empty` so the empty fixture commits. Current behavior conforms — but `round-27/claims.json.revisions[]` records neither fix (its single entry is C3's control arm). Disclosure gap, not a behavior defect.

**L3 — Header comment overclaims selftest assertions.**
Line 9: "asserts exit code AND the stable field set". `runSelftest` asserts exit, `valid`, and one designated field per failure case (`c.field`); it never asserts `present`/`sha_match`/`anchor_located` individually. Entailed by `valid=true` in the clean case (and `present` is constant true on the return path), so no behavioral hole — but the comment is not implemented as written.

### INFO

- **I1 — Extra strictness beyond the frozen field set.** `valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch` (line 127) adds two conjuncts (`anchor_unique` occurrences===1; `byte_count_match` vs receipt `decoded_bytes`) not in the frozen `{present, sha_match, anchor_located, valid}`. Purely fail-closed; tip values are `anchor_unique=True byte_count_match=True`, so the frozen target is unaffected. `present` is boolean `true`, claim says `present=1` — cosmetic.
- **I2 — UTF-8 decode hazard, inert today, fail-closed if triggered.** `git()` uses `encoding: "utf8"`; non-UTF-8 committed bytes would be mangled before hashing → sha mismatch → invalid (never false-valid). Real tip bytes re-hashed under strict UTF-8: `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` == receipt `decoded_sha256`.
- **I3 — Non-Refusal crash would exit 1 (reads as "invalid").** `main` rethrows non-Refusal. Audited every production throw site: git spawn errors, bad rev, unresolved rev, all parseReceipt branches, absent receipt/bytes — all `Refusal`. No reachable non-Refusal path found today.
- **I4 — Receipt `status` text is stale r26-era prose** ("The frozen C2 counter … was NOT built this round … recorded failed in SCORECARD.md"), now contradicted by the landed gate. Evidence-hygiene note only.
- **I5 — `readFileSync` imported (line 37), never used.** Dead import; production path reads git blobs only, as the header claims.
- **I6 — Uncommitted comment-only worktree edits on top of 5ed6484** (header: "4 isolated cases"→"5", "implements the predicate…also checks anchor uniqueness and decoded byte count", valid-formula comment updated). Byte counts 12499 (HEAD) vs 12572 (worktree); no behavior delta; landed behavior is what this review verifies.

## Per-question answers

**(a) Frozen fields.** All four emitted, JSON and text: `present`, `sha_match`, `anchor_located`, `valid` (lines 127-141). Slip-to-valid avenues: none via OR-logic (valid is a pure conjunction); the only avenue is M1 (receipt-sourced anchor/URL content is unchecked). `anchor_unique`/`byte_count_match` are additional fail-closed conjuncts (I1).

**(b) Kill-rule exit paths — all verified empirically (scratch fixtures, exact gate invocation above):**
- Receipt absent → exit 2: line 111 `Refusal`; selftest case 5 `missing-receipt-could-not-evaluate` PASS (`receipt absent at c5644134…`). Was exit 1 at 5577d1b (L2), fixed by 5198e28.
- Bytes absent → exit 2: line 117; probe P5 `exit=2 detail=decoded bytes absent at 9dc6931f…: b/cc.cc`; selftest case 4 PASS.
- Malformed receipt → exit 2: P1 truncated JSON → `receipt is not JSON`; P2 `schema:"other"` → `receipt schema mismatch` (line 95); missing/empty `url|decoded_sha256|bytes_path` → line 97; non-number `decoded_bytes` → line 99; missing anchor.line/text → line 102. All `Refusal` → main catch → `process.exit(2)`.
- Usage (`--rev` missing) → 2; unknown arg → 2; bad rev chars → 2 (line 75); unresolvable rev → 2 (line 77). Code-path verified.

**(c) Anchor text at another line.** `anchor_located` (line 123) checks only the recorded line, so a wrong-line record fails unless that line holds the identical trimmed text. If the text occurs at 2+ lines, `anchor_unique` (line 125) fails: P6 (bytes `X\n// tail\nX\n`, anchor line 1) → `exit=1 anchor_located=True anchor_unique=False valid=False`. Single-occurrence wrong-line fails located: P8 off-by-one → `exit=1 valid=False`. So text-present-elsewhere cannot reach `valid` — the residual bypass is content-pinning (M1), not line-shifting.

**(d) Selftest vs frozen failureCapable.** r26 lists 4 cases (sha mismatch, anchor off-by-one, missing bytes, clean); shipped `CASES` has 5 — the extra `missing-receipt-could-not-evaluate` encodes the kill rule's receipt-absent branch. Re-run: `node scripts/check-s106-evidence.mjs --selftest` → `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0. Frozen list fully covered, superseded. Coverage honesty: the "stable field set" assertion is not implemented (L3).

**(e) Revision binding.** Yes, flag it (L1): the receipt has no revision field, so "receipt's recorded revision must equal the cited measurement revision" cannot be enforced as written. The gate compensates: everything is read at `${rev}:path` only (lines 108, 116) — never the worktree — and the resolved full rev is echoed in every output mode, making the measurement citation auditable after the fact. Fetch-failure honesty (r26 kill rule sentence 2) is out of gate scope by design: the gate never fetches; it only recomputes over committed bytes.

## Evidence commands (all run by me, this session)

- `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-s106-evidence.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json` → exit 0, `valid=true present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true` occurrences=1.
- Same with `--rev 5577d1b6fe2dc298486e354b5416d38acafeffaa` → exit 0, all true.
- Same with `--rev f185b4e7ab10cd9e8925e8ec614c9c111772357d` → exit 0 (receipt+bytes predate the gate; `git ls-tree f185b4e… -- scripts/check-s106-evidence.mjs` → ABSENT; gate lands in round 27).
- `node scripts/check-s106-evidence.mjs --selftest` → 5/5 PASS, exit 0.
- `git log --oneline -5 -- scripts/check-s106-evidence.mjs` → `5ed6484`, `5198e28`, `5577d1b`; `git merge-base --is-ancestor` → both `5577d1b…` and `f185b4e…` are ancestors of HEAD.
- Probes P1–P8: `mktemp -d` fixtures, `node scripts/check-s106-evidence.mjs --repo "$D" --rev HEAD --json` (results above).
- Receipt/bytes inspection: `git show <rev>:corpus/evidence/round-26/sources/s106.json` and the committed bytes blob (sha recompute in Python, strict UTF-8).

## Residual risk and verification gaps

- No gate-time provenance check against the live googlesource bytes (by frozen design); M1 is the residual fabrication avenue, mitigated only by commit auditiability. I did not fetch the URL (not named by my item; builder seat owns provenance).
- `SCORECARD.md`/`LOG.md` C2 narration is other seats' scope; I reviewed code + evidence only.
- HEAD may move while wave 1 lands; my counter runs pin `5ed6484da…` and `5577d1b6f…` exactly.
- lsp unavailable (no device mounted); semantic "references/definition" checks not performed — not needed for a 337-line single-file gate read in full.

## Verdict

**Conforms with flags.** The gate satisfies the frozen C2 predicate and counter at the tip (`valid=true`, all frozen fields true, exit 0), every frozen kill-rule path is fail-closed exit 2 and now empirically verified, and the selftest supersedes the frozen 4-case list at 5/5. Flag M1 (content-pinning bypass — recommend the two constant checks; zero regression risk at tip), L1/L2 (spec-wording + disclosure gaps for the claims record), L3 (comment overclaim). No finding blocks C2's admission.
