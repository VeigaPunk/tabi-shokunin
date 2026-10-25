# Scribe06 — round-28 w1 claim-evidence matrix (C1 depth, C2 calibration)

Seat: Scribe06 (leaf scribe, item 30). Report path: `.ufo/waves/round-28/w1/Scribe06.md` (relative to lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`). All commands run from lane root unless noted; all paths absolute in this file. No lane tracked file edited; read-only git; no installs; PACMAN PAUSED untouched.

## Baseline identity
| # | Number/claim | Kind | Command/observation |
|---|---|---|---|
| B1 | HEAD = `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (== frozen baseline) | observation | `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` |
| B2 | no tracked modifications; only untracked `.ufo/waves/round-28/` | observation (negative, swept) | `git -C … status --porcelain` (single `??` entry) |
| B3 | node v24.21.0 | observation | `node --version` |
| B4 | claims frozen before data: schema tabi-round-claims-v1, frozenAt 2026-10-25, baseline eb23c0b… | observation | read `…/.ufo/waves/round-28/claims.json` (C1 line 11, C2 line 12 via :raw) |

## C1 — S106 receipt revision binding (depth)
Frozen (claims.json:11): "receipt must bind the measurement revision and the gate must verify the committed receipt at that revision"; target "selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision"; kill rule: "matching committed receipt … fail or the mismatch fixture to pass ⇒ claim misses"; "Missing source fetch remains could-not-evaluate."

| # | Value | Kind | Command / evidence |
|---|---|---|---|
| C1-1 | selftest cases=5, passed=5, exit 0 (below target 7) | observation | `node scripts/check-s106-evidence.mjs --selftest` → `S106_SELFTEST verdict=clean cases=5 passed=5`; cases: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate (exit 2), missing-receipt-could-not-evaluate (exit 2). Matches claim "before" (5 cases). |
| C1-2 | runtime gate at committed receipt, tip rev: valid=true, exit 0 | observation | `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` → present=true, sha_match=true, anchor_located=true, anchor_unique=true, byte_count_match=true, valid=true; decoded bytes 73952; sha256 claimed==observed `9b93fe64…` |
| C1-3 | receipt has NO revision identity field | observation | `git -C … show eb23c0b…:corpus/evidence/round-26/sources/s106.json` — top-level keys: `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status`; `fetched_at` is a date, not a git revision |
| C1-4 | gate never compares receipt-stated revision vs evaluated rev | observation (code read) | `scripts/check-s106-evidence.mjs` evaluate() (:107-144): reads receipt and bytes at resolved `--rev` (`git show <rev>:<path>`); `valid = sha_match && anchor_located && anchor_unique && byte_count_match`; no revision comparison; parseReceipt (:87-105) requires only schema/url/decoded_sha256/bytes_path/decoded_bytes/anchor |
| C1-5 | mismatch fixture accepted: red control is green today | observation (peer-executed, w1 report) | Crit06: receipt clone + `"revision":"0000…"` evaluated at its own HEAD `9838d897…` → exit 0, valid=true; same fixture with `revision`=HEAD passes. Crit08: `measured_rev=928a5b5…`, gate at `7d150c8…` → valid=true, exit 0; matching control valid=true. Fixtures under `.ufo/waves/round-28/scratch/{crit06,Crit08}/` |
| C1-6 | one revision-less receipt valid at two distinct commits | observation (peer-executed) | Crit06: gate at `ef8aa4a…` → valid=true, exit 0, receipt/bytes blobs identical to baseline (`git diff --quiet`). Exec01: blob ids identical at `0c666adc…` and `eb23c0b…` (`git rev-parse <rev>:<path>`) |
| C1-7 | missing-source CNE retained (2 cases, exit 2) | observation | same selftest run as C1-1 |
| C1-8 | target receipt re-stamp needed or kill rule fires | inference | Crit06 constraint 1 / Exec08 BM4 / Exec20 F1: a strictly required revision field makes current committed receipt fail parse → CNE at every rev unless `s106.json` gains the field (additive tracked-data change, not code-only). Exit-class for mismatch (1 vs 2) unresolved by frozen text (Exec20 §3) |

## C2 — selfassessment m1 citation association (calibration)
Frozen (claims.json:12): "a correction only clears the exact stale tally it cites, not an unrelated later line/paragraph"; after: "LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest contains both red false-clear and green exact citation cases"; before quote: "tip presently reports a false-clear of LOG.md:221 per corpus/lessons/round-27-verifier-spotcheck.md:15".

| # | Value | Kind | Command / evidence |
|---|---|---|---|
| C2-1 | counter at tip: mismatches=1, clean=false, superseded=10, couldNotEvaluate=92, exit 1 | observation | `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` |
| C2-2 | the one counted mismatch is m3-unlanded-paths (SCORECARD.md round-27 "landed" vs live untracked paths), not m1 | observation | same JSON: counted=[{class:m3-unlanded-paths, claimed:"landed", observed:13}]; m3 reads live `git status --porcelain --untracked-files=all` (code :379-389). Count is live-state dependent: 15 untracked paths at write time (`git status --porcelain --untracked-files=all | wc -l`), 13 during the counter run |
| C2-3 | LOG.md:221 finding: claimed 8, observed 12, superseded=true → false-clear persists at tip (line 221 NOT a mismatch) | observation | same JSON finding object: `{"class":"m1-selftest-tally","doc":"LOG.md","line":221,"script":"scripts/check-freshness.mjs","claimed":8,"observed":12,"superseded":true}` |
| C2-4 | no exact-line correction cites LOG.md:221 | observation (negative, swept) | grep `LOG\.md:221|line 221` over LOG.md/SCORECARD.md/corpus → only round-27 falsification prose (LOG.md:1930-1934; SCORECARD.md:1397; lesson spotcheck:15) and no correction marker; LOG.md:215-225 contains no correction text; superseding paragraph LOG.md:265-284 contains script name, "Corrected", timestamp `2026-10-15T05:16:28Z`, and "12-case self-invocation" but no `LOG.md:221` citation |
| C2-5 | matcher defect locus: paragraph-level `/:\d+/` syntax check, not cited-line identity | observation (code read) | `scripts/check-selfassessment.mjs:319-327`: clears if later paragraph (a) names same script, (b) `/supersed|correct/i`, (c) `/:\d+/` anywhere, (d) `statedTallyNumbers(text).includes(observed)`; no comparison to `f.line`. Timestamp `:16` satisfies (c). Mirrors committed description LOG.md:1930-1934: "marks the real `LOG.md:221` … superseded by a later 183-line paragraph that does not cite line 221" |
| C2-6 | selftest = 17 cases, 17 passed, exit 0 | observation | `node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`; m1-log cases: m1-log-stale-tally (red), m1-log-stale-then-corrected (green; cites `LOG.md:6`), m1-log-wrong-number-correction (red; cites `LOG.md:6`, wrong number), m1-log-ambiguous-section-not-counted |
| C2-7 | no red unrelated-citation case nor separate green exact-citation case exists at baseline | observation (case inventory) | CASES array (:443-597) has no fixture where a correction cites a different line (e.g. `LOG.md:99`) and must retain the target mismatch; claim's after (C2-6 shape) unmet at baseline |
| C2-8 | claim "before" wording vs current aggregate | conflict, reported verbatim | spotcheck:15 (round-27 verifier, at intermediate rev `ef8aa4a…`): "returned `mismatches=0`, `clean=true`, `superseded=10`; nevertheless its own finding at `LOG.md:221` … `superseded=true`". At tip the m1 false-clear is still present (C2-3) but the aggregate is no longer clean for an unrelated reason (m3, C2-2); number "mismatches=1" at tip ≠ "0" from that verifier run — different rev and live-tree state, not matcher change |

## Unresolved claims
| Claim | Status | Evidence |
|---|---|---|
| C1 (depth) | NOT implemented; targets unmet at baseline/tip | no tracked change (B2); selftest 5 < 7 (C1-1); no revision fixtures (C1-4/-5); receipt unbound (C1-3). Implementation constraints pending: receipt re-stamp (C1-8), exit-class decision. |
| C2 (calibration) | NOT implemented; targets unmet at baseline/tip | LOG.md:221 still superseded=true → not a mismatch (C2-3); matcher cleared `/:\d+/` defect present (C2-5); selftest lacks red unrelated-citation/green exact-citation controls (C2-7). |

## Tooling
No tools installed or updated. `~/.omp/agent/RULES.md` read; no pacman/uv/cargo/npm action; PACMAN PAUSED untouched. Node pre-existing v24.21.0.

## Known limits
- C1-5/C1-6 are peer-executed (Crit06/Crit08) — cited from their w1 reports, not re-run here; my independent runs cover C1-1/-2/-3/-4.
- C2 m3 count varies with live untracked paths (13 vs 15) — record rev + run time for reproducibility.
- No post-implementation state exists (nothing landed); all "after" targets are unknowns.
