# RevC1Catalogue — review of `scripts/gate-mutants.json` against round-29 evidence (round-30 w1, C1)

Seat: RevC1Catalogue (leaf reviewer) · 2026-10-26 · Lane read-only; all measurement in scratch clone at the freeze commit.

**Verdict.** The C1 catalogue is sound and reproduces the round-29 evidence: all 40 rows' `find` strings occur exactly once in the gate sources at the freeze commit `061e62024c0523d3c6c7e819506a773ff2cd7d75` (programmatic check, 0 defects); the 27 fault ids are exactly MutC1Baseline §5 M1–M4 in both forms plus the disclosed `anchor_located` row, and MutC3 #1–#18; the 13 benign rows are all semantically equivalent rewrites at their sites in context (per-row reasoning below); the committed before-reading `c1-before-at-freeze.json` matches round 29's survivor lists exactly, and my own fresh counter run at the freeze commit reproduces it per-mutant, 40/40 identical (exit 1, fault_survivors 14, benign_killed 0). Three textual observations, none a defect: (a) `pins-notfound-body`'s replace is `404 === f.new_status` where MutC3 #16 wrote `f.new_status === 404` — the same drop-the-body-conjunct mutant, operand order flipped, verdict unaffected; (b) MutC3 #12's find is abbreviated in the report (`const confirmed = rf && …f.new_sha256);`) and the catalogue's full expansion matches the source bytes exactly; (c) `s106-anchor-located-true` is an extra fault row not run at round 29 — its note discloses this and my run confirms it is killed. No row blocks the C1 claim; the catalogue may be used as frozen.

## 0. Method and pinning

- Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75`; `rev-parse HEAD` = `061e6202…`; `status --porcelain` empty. `S=/fast/scratch/hyaku/tabi-r30/RevC1Catalogue` (removed after receipts were copied to the output dir).
- Digests at the freeze commit (sha256sum, exit 0):

| file | sha256 | matches |
|---|---|---|
| `scripts/gate-mutants.json` | `cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833` | claims.json frozenDigests ✓ |
| `scripts/check-gate-mutants.mjs` | `02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55` | claims.json frozenDigests ✓ |
| `scripts/check-s106-evidence.mjs` | `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3` | MutC1Baseline `tip.mjs` (§0) and before-JSON `gates[0].sha256` ✓ |
| `scripts/check-release-pins.mjs` | `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770` | MutC3 pristine (§Baseline) and before-JSON `gates[1].sha256` ✓ |

  The round-29 mutation verdicts were therefore measured on byte-identical gate sources to the ones the catalogue freezes — the transfer needs no re-derivation, and I re-ran it anyway (§3).
- No `lsp` device is available in this seat's tool inventory (no language server route mounted); all checks below are text-exact and execution-based, per the reviewer fallback protocol.
- Tooling record: no tool installed or updated (operator authorization 2026-10-19 read; nothing needed). Pre-existing `node v24.21.0`, git 2.56.0. No pacman transactions, no network use.

## 1. Fault rows vs round-29 evidence (27 rows)

### 1a. s106 rows (9) vs MutC1Baseline §5

MutC1Baseline §5 defines, per term, two forms: **drop** = "term removed from the `valid` conjunction (field stays honestly computed)" and **force-true** = the quoted replacement. Catalogue reproduction, verified programmatically (§3 checker: every find occurs exactly once in the source; every force-true replace string is present verbatim in MutC1Baseline.md; every drop replace is exactly the find minus the named term, field line untouched):

| catalogue id | round-29 form | find = source bytes | replace vs §5 | verdict |
|---|---|---|---|---|
| `s106-sha-drop` | M1 drop | `const valid = revisionMatch && shaMatch && anchorLocated && anchorUnique && byteCountMatch;` (:128) | removes `shaMatch && ` — matches "term removed, field stays computed" (shaMatch still computed at :121) | **OK** |
| `s106-sha-true` | M1b force-true | `const shaMatch = observedSha === receipt.decoded_sha256;` (:121) | `const shaMatch = true;` — verbatim in §5 table | **OK** |
| `s106-anchor-unique-drop` | M2 drop | valid line (:128) | removes `anchorUnique && ` | **OK** |
| `s106-anchor-unique-true` | M2b force-true | `const anchorUnique = occurrences === 1;` (:126) | `const anchorUnique = true;` — verbatim | **OK** |
| `s106-byte-count-drop` | M3 drop | valid line (:128) | removes ` && byteCountMatch` | **OK** |
| `s106-byte-count-true` | M3b force-true | `const byteCountMatch = Buffer.byteLength(bytesText) === receipt.decoded_bytes;` (:127) | `const byteCountMatch = true;` — verbatim | **OK** |
| `s106-revision-drop` | M4 drop | valid line (:128) | removes `revisionMatch && ` | **OK** |
| `s106-revision-true` | M4b force-true | two-line find `const revisionMatch = measuredBytes !== null &&\n    sha256(measuredBytes) === receipt.decoded_sha256;` (:116–117) | `const revisionMatch = true;` — verbatim | **OK** |
| `s106-anchor-located-true` | extra (not a §5 run) | `const anchorLocated = recorded !== undefined && recorded.trim() === receipt.anchor.text.trim();` (:124) | `const anchorLocated = true;` | **OK, disclosed extra** — note says "covered at round 29 by anchor-off-by-one-invalid"; that is case-coverage inference from MutC1Baseline §6.3 (round 29 never ran an anchorLocated mutant), and my counter run confirms the kill at the freeze commit (§3) |

Line references are the clone's worktree bytes at the freeze commit; the `valid` line sits at :128 exactly where §5 says "valid line at tip:128".

### 1b. pins rows (18) vs MutC3 table #1–#18

Programmatic cross-check of every find/replace string against MutC3.md (raw and pipe-escaped variants, since the md table escapes `|` as `\|`): all 18 finds present (17 raw/escaped, #12 abbreviated in the md), all 18 replaces present except the one noted below. Verdict column cross-checked against MutC3's Verdict column and the claim's before-list:

| # | catalogue id | find/replace vs MutC3 | MutC3 verdict | before-list | verdict |
|---|---|---|---|---|---|
| 1 | `pins-f1-old-tag` | identical (raw) | SURVIVED | yes | **OK** |
| 2 | `pins-f2-path-binding` | identical (raw) | killed (path-not-bound-unresolved) | no | **OK** |
| 3 | `pins-f2-path-traversal` | identical (raw) | SURVIVED | yes | **OK** |
| 4 | `pins-f3-bytes-path` | identical (escaped `\|\|`) | killed (new-bytes-under-old-tag-unresolved) | no | **OK** |
| 5 | `pins-f3-bytes-sha` | identical (escaped) | killed (sha-mismatch-unresolved) | no | **OK** |
| 6 | `pins-f3-bytes-absent` | identical (escaped) | SURVIVED | yes | **OK** |
| 7 | `pins-f4-range-bounds` | identical (escaped) | SURVIVED | yes | **OK** |
| 8 | `pins-f4-anchor-token` | identical (escaped) | SURVIVED | yes | **OK** |
| 9 | `pins-f5-digest` | identical (raw) | killed (digest-binding-mismatch-unresolved) | no | **OK** |
| 10 | `pins-f6-refetch-seat` | identical (raw) | killed (refetch-same-seat-unresolved) | no | **OK** |
| 11 | `pins-f6-refetch-sha` | identical (raw) | killed (copied-old-as-new-caught-by-refetch) | no | **OK** |
| 12 | `pins-f6-refetch-all` | find **abbreviated in MutC3** (`const confirmed = rf && …f.new_sha256);`); catalogue's full two-line expansion matches the source at :218–219 byte-exactly (occurrence = 1); replace `const confirmed = true;` present in md | killed (3 cases listed) | no | **OK, md-abbreviation note** |
| 13 | `pins-s1-supersession-prefix` | identical (raw; replace = removal) | SURVIVED | yes | **OK** |
| 14 | `pins-s1-supersession-tag` | identical (raw; replace = removal) | SURVIVED | yes | **OK** |
| 15 | `pins-notfound-status` | identical (raw) | SURVIVED | yes | **OK** |
| 16 | `pins-notfound-body` | find identical (raw); **replace deviates**: catalogue `404 === f.new_status` vs MutC3 `f.new_status === 404` | SURVIVED | yes | **OK, deviation noted** (see below) |
| 17 | `pins-population-on-release` | identical (raw; replace = removal) | killed (not-on-release-not-counted) | no | **OK** |
| 18 | `pins-population-tag-compare` | identical (raw) | killed (pinned-at-stable / empty-population / drift-with-supersession) | no | **OK** |

**Deviation detail — #16 `pins-notfound-body`.** MutC3 #16's replacement text is `f.new_status === 404`; the catalogue freezes `404 === f.new_status`. Both replace the whole find `f.new_status === 404 && nb.toString("utf8").includes("NOT_FOUND")` (:223) with a bare status comparison, i.e. the identical semantic mutant: the NOT_FOUND body conjunct is dropped, the status conjunct kept. The mutant's observable behavior (survived at round 29; survivor in the before-list) is the same either way, and the find line — the part the C1 predicate requires to stay byte-identical — is unaffected. Cosmetic transcription difference, not a defect; recorded here so the L1 does not "fix" it and break the frozen digest.

## 2. Benign rows (13) — semantic equivalence in context

All 13 verified equivalent at their sites in the freeze-commit sources. Context facts used: s106 :115–128 are plain `const` bindings with pure initializers (`readBlob`, `sha256`, `split`, `filter().length`, `Buffer.byteLength` — no side effects); `bytesText` is non-null at :118+ (a null blob `throw`s at :119, before any of these lines); pins :204 proves `f.path` is a non-empty string before the traversal test in the same short-circuit chain; pins :214 (`if (ob === null || nb === null) { reasons.push(…); continue; }`) proves `ob`/`nb` non-null from :215 onward, including the 404 branch at :223 and `oldLines = ob.toString("utf8").split("\n")` at :231.

| id | replace | equivalence reasoning | verdict |
|---|---|---|---|
| `s106-valid-reorder` | `(byteCountMatch && anchorUnique && anchorLocated && shaMatch && revisionMatch)` | reorder of five already-computed `const` booleans; no operand has side effects or can throw; `&&` associativity makes the parenthesisation a no-op | **equivalent** |
| `s106-sha-eq-swap` | `(receipt.decoded_sha256 === observedSha)` | `===` on two strings (sha256 returns hex string; receipt field string); symmetric | **equivalent** |
| `s106-anchor-unique-eq-swap` | `(1 === occurrences)` | `===` on two numbers (`filter().length`); symmetric; NaN impossible here | **equivalent** |
| `s106-byte-count-eq-swap` | `(receipt.decoded_bytes === Buffer.byteLength(bytesText))` | `===` on two numbers; `Buffer.byteLength` pure and `bytesText` non-null (:119 throw precedes); symmetric incl. NaN (false both ways) | **equivalent** |
| `s106-revision-eq-swap` | `(measuredBytes !== null && receipt.decoded_sha256 === sha256(measuredBytes))` | null-guard kept leftmost, so `sha256` is still only called on non-null input (same evaluation set as the original); `===` on two strings, symmetric | **equivalent** |
| `s106-anchor-located-eq` | `(recorded !== undefined && receipt.anchor.text.trim() === recorded.trim())` | undefined-guard kept leftmost; both `.trim()` calls pure; if `receipt.anchor.text` were undefined, original and mutant throw the same uncaught TypeError at the same statement (order of the two `.trim()` evaluations inside one expression is unobservable); string `===` symmetric | **equivalent** |
| `pins-f1-old-tag-eq` | `if (row.tags.includes(f.old_tag) === false)` | `Array.includes` returns a boolean; `b === false` ≡ `!b` | **equivalent** |
| `pins-f2-path-traversal-eq` | `f.path.indexOf("..") !== -1` | same guard chain proves `typeof f.path === "string"` before this disjunct evaluates (short-circuit), so both are String methods; `indexOf(x) !== -1` ≡ `includes(x)` | **equivalent** |
| `pins-f3-bytes-absent-eq` | `if ((nb === null || ob === null))` | swap of two pure `=== null` comparisons; neither can throw or side-effect; disjunct order unobservable | **equivalent** |
| `pins-f4-eq-reorder` | `(b > oldLines.length || a < 1 || b < a || !anchorHasRange(row.anchor, a, b))` | `b > oldLines.length` moved first: `oldLines` is `ob.toString("utf8").split("\n")` (:231) and `ob` is proven non-null by the :214 `continue` guard, so no new throw path; NaN `a`/`b` still short-circuit on the untouched `!Number.isInteger` disjuncts before any comparison; `anchorHasRange` stays last; all operands pure | **equivalent** |
| `pins-s1-prefix-eq` | `sup.teaches.indexOf(`supersedes ${row.id} —`) === 0` | `sup &&` guard unchanged; `sup.teaches` a string; `indexOf(x) === 0` ≡ `startsWith(x)` | **equivalent** |
| `pins-s1-tag-eq` | `sup.source.indexOf(`refs/tags/${stable}/`) >= 0` | same guard; string; `indexOf(x) >= 0` ≡ `includes(x)` | **equivalent** |
| `pins-notfound-eq-reorder` | `(nb.toString("utf8").includes("NOT_FOUND") && f.new_status === 404)` | conjunct reorder: `nb` proven non-null by :214, `Buffer.toString` pure, so evaluating it unconditionally is safe; `===` pure; no observable order change | **equivalent** |

Catalogue-header design intent also holds: every benign replace differs from its find in both text and file length (parenthesisation, operand swaps, method rewrites), so a self-test keyed on source text or file size false-kills — consistent with the J2/J3/J4 control design in claims.json.

## 3. Before-reading vs round 29, and my own counter run

Committed before-reading `.ufo/waves/round-30/measure/c1-before-at-freeze.json` (schema `tabi-gate-mutants-v1`, rev = freeze commit, both digests matching frozenDigests): fault_total 27, fault_killed 13, fault_survivors 14, benign_total 13, benign_killed 0, both gates pristine-clean (s106 7/7 exit 0; pins 20/20 exit 0).

- **s106 survivors** in the before-JSON: `s106-sha-drop, s106-anchor-unique-drop, s106-anchor-unique-true, s106-byte-count-drop, s106-byte-count-true` — exactly MutC1Baseline §5's tip survivors M1, M2, M2b, M3, M3b. Killed per §5: M1b (sha-mismatch-invalid field assertion), M4 and M4b (measured-revision-bytes-mismatch) — all three killed in the before-JSON. ✓
- **pins survivors** in the before-JSON: `pins-f1-old-tag, pins-f2-path-traversal, pins-f3-bytes-absent, pins-f4-range-bounds, pins-f4-anchor-token, pins-s1-supersession-prefix, pins-s1-supersession-tag, pins-notfound-status, pins-notfound-body` — exactly MutC3's nine SURVIVED rows (#1, 3, 6, 7, 8, 13, 14, 15, 16). MutC3's nine killed rows (#2, 4, 5, 9, 10, 11, 12, 17, 18) are all killed in the before-JSON. ✓
- **13th kill** = `s106-anchor-located-true`, the catalogue's disclosed extra row — consistent with its note and with MutC1Baseline §6.3's case-coverage statement.

My independent run (clean shared clone at the freeze commit, frozen counter and catalogue bytes):

```
TMPDIR="$S/tmp" node "$S/clone/scripts/check-gate-mutants.mjs" --rev HEAD --repo "$S/clone" --work "$S/work" --json
  → COUNTER_EXIT=1   (13.0 s)
  fault_total=27 fault_killed=13 fault_survivors=14 benign_total=13 benign_killed=0 clean=false
  survivors = the 14 ids above, in the same order as the before-JSON
```

Per-mutant comparison of my run's `mutants` array against the committed before-JSON: **40/40 rows identical** (id, kind, status), programmatic diff exit 0. Receipt: `counter-run.json` in this output dir (sha256 `b46f4e34ac425895f98f61273741b29b6c4ae4e9256531ff377bdb1572671df6`).

## 4. Commands and exit codes

```
git clone --quiet --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75   → exit 0
git -C "$S/clone" rev-parse HEAD / status --porcelain / sha256sum (4 files)                                    → exit 0 (clean tree, digests §0)
S="$S" node "$S/check.mjs"                                                                                     → EXIT=0  (occurrence bad=0; id sets 27/13 exact; md cross-check §1)
TMPDIR="$S/tmp" node "$S/clone/scripts/check-gate-mutants.mjs" --rev HEAD --repo "$S/clone" --work "$S/work" --json  → COUNTER_EXIT=1 (expected before-state; §3)
node -e "…per-mutant diff vs c1-before-at-freeze.json…"                                                        → DIFF_EXIT=0 (identical: true; killed(13) list §3)
node --version                                                                                                 → v24.21.0
rm -rf -- "$S"                                                                                                 → scratch removed after receipts copied
```

Checker output committed as `catalogue-check.out` (sha256 `74b5f30a4faa2c96b5a15f050721f04e6a5f9f160e30327bbca8eb2d476f484c`); checker source `check.mjs` (sha256 `72c399ab6b85809035f2be5cea1f7212ebad83e01733e8166831406b545536b9`). No lane tracked file, index, or jj state touched; no commits anywhere; no network use.

## 5. Residual risk and verification gaps

1. **`pins-f6-refetch-all` find text is not recoverable from round-29 artifacts** (MutC3 abbreviates it; the harness was removed). The catalogue's expansion matches the source byte-exactly and the mutant's killed status matches MutC3's three-killer list, so it is behaviorally corroborated; textual exactness vs MutC3's original string is unverifiable. Low risk: the frozen find is what the counter enforces, and it is source-exact.
2. **`s106-anchor-located-true`'s "covered at round 29" note** rests on MutC1Baseline §6.3 case-coverage reasoning, not on a round-29 mutant run. My run confirms the kill at the freeze commit, so the before-reading is unaffected.
3. **`pins-notfound-body` replace-text deviation** (`404 === f.new_status`) is frozen as-is; any L1 "cleanup" of it would change the catalogue digest and void the C1 predicate. Leave it.
4. The counter's own mutant-aware-literal and self-test-integrity machinery (J3/J4 controls) was not re-audited here — out of this item's scope; the J-control receipts are in the round-30 baseline README.

**Bottom line: catalogue approved as frozen; no findings requiring repair; the three observations above are documentation-level notes for the L1.**
