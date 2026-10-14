# AUD-B10 — round-10 audit: the arc synthesis (3 claims re-derived) + the r9 archive tranche (manifest equality)

Lane AUD-B10, 2026-10-14. Write scope: **this file only** — every audited
artifact stayed read-only; nothing else in `tabi-shokunin/` was written by this
lane. Task (verbatim): "audit the arc synthesis (3 claims re-derived) + the r9
archive tranche (manifest equality). Verdict table; do NOT edit." Method:
mechanical re-derivation from disk — source↔archive hash-list diffs,
`sha256sum -c`, owning-note pin re-hash, citation resolution, and a read-only
patched-verifier re-run against the archived copy (scratch
`/tmp/w10-aud-b10-work/`, volatile). No browser, no fixture run, no external
site; session material shape-only — the two one-time token values surfaced by
the shape-diff check are **not** reproduced here. Both author artifacts were
written concurrently with this audit; the bindings below are the revisions the
audit closed on (arc synthesis stable from 20:56:19Z, receipt from 21:00:01Z,
manifest from 20:52:46Z — no movement across the close re-hash).

**Audited revisions.** Audit window 20:52–21:05Z; close stamp 21:05Z.

| artifact | revision bound | size | note |
|---|---|---|---|
| `corpus/knowledge/arc-synthesis.md` (B10-1) | sha256 **`f42428bd9af738c5dc0ec5361edd56e667acf84b6c96d23459bc5d46ab0a9269`** | 183 `wc -l` / 184 logical / 25,125 B / mtime 20:56:19Z | final revision; moved twice during the write window (poll saw `9ca2b6fd…`/183, a transient 184-line state) — the audit bound the settled revision |
| `corpus/evidence/w9-tabi-b91/` (B10-2) | `MANIFEST.txt` sha256 **`55273bdeaa5e3f4d029d0f284dda4325bcc39e226a4360142ef8f2772c8cd641`** | 274 lines (5 header + 269) / 30,103 B | 269 evidence files / 1,065,924 B; untracked at close |
| `/tmp/w9-tabi-b91/` (source) | read-only; source file list + hashes re-derived | 2,665 files total / 269 non-profile | quiescent across the audit (top-level mtimes 16:59–17:07 -03; no drift) |
| `corpus/knowledge/archive-receipt-r10.md` (B10-2) | **`c6f4445ebd0358f8fa64ef2742a64768e644d55da6ee324054513b0fa05eb74a`** | 203 `wc -l` / 15,197 B / mtime 21:00:01Z | first write `a73cd2d9…`/197 L observed at 20:59:53Z; final revision stable |
| `corpus/knowledge/state-changing-matrix-r9.md` (owning note) | `ec540be07ed5a06ce0da…` / 388 `wc -l` | unchanged since B10-1's pins read | pin source for §T7 |
| `corpus/handoffs/operator-approval-request.md` | `94dc63f5fb9e3d98…` / 121 / 13,103 B | unchanged | C2 source |
| `.ufo/l0-questions.md` | `02c53ec60acfda48…` / 25 / 21,539 B / mtime 14:05:52.482908587 -03 | unchanged | C2 source |

## 1. Verdict table

| # | check | scope / method | result | verdict |
|---|---|---|---|---|
| C1 | ladder claim (synthesis :26,:35,:42) — "Four rungs since round 4; rung 4 added by round 4; rounds 5–9 extended rung 4 without adding a fifth rung" | re-read `SKILL.md:361-367`; `plans/round-4.plan.md:3`; `network-evidence-rung.md:35-42`; full-repo sweep for a fifth rung | SKILL "Four rungs since round 4" verbatim; r4 plan claims "the evidence ladder gains its network rung"; rung-4 placement verbatim in the rung note; sweep finds no rung-5 construction anywhere (only the synthesis's own two statements) | **PASS** (finding F3 noted) |
| C2 | approval claim (synthesis :72-75) — packet `94dc63f5fb9e…` / 121 L / 13,103 B / 0 `/tmp` refs; L0 exactly one `tabi` line `:25`, sha `02c53ec6…`, 25 L / 21,539 B, byte-identical at every recorded read; silence span 3 h 47 m 13 s | `sha256sum`/`wc`/`grep -c` on both files; span arithmetic; historical reads r6–r9 re-read | packet sha/line/byte counts exact; `grep -c '/tmp'` → **0**; L0 sha `02c53ec60acf…`, 25 L / 21,539 B / mtime exact; `grep -c tabi` → 1 (`:25`); 17:05:52Z→20:53:05Z = 13,613 s = **3 h 47 m 13 s**; r6/r7/r8 drafts + r9 draft §0 all carry `02c53ec6…` byte-identical | **PASS** |
| C3 | archive claim (synthesis :18,:89,:96-98) — tree 36/36/1,721/10,318,947 at read time; tranches r5 (25/1,010/6,780,293), r7 (…→35), round-10 (35→36); exclusion 2,396 / 58,072,105; seed rule `cdp-evidence-patterns.md:92` | census by command; receipt r5 §1 + :176-180; receipt r8 §1 :12; w9 manifest header; my own source/archive measuring | census exact (36 / 1,721 / 10,318,947 / 36 manifests); r5 row exact; round-10 row exact; exclusion counts exact; seed quote verbatim at `:92`; **but the r7-row group column reads "25 → 35" while its own citation (`archive-receipt-r8.md:7-14`) says "28 → 35"** (finding F1); §0's pre-state stamp "35 … at 20:53:05Z" is unsupported (finding F2) | **PASS (2 findings: F1, F2)** |
| T1 | manifest self-check | `cd corpus/evidence/w9-tabi-b91 && sha256sum -c MANIFEST.txt` | **269/269 OK, 0 FAILED, rc 0** (three runs across the window incl. close) | **PASS** |
| T2 | copy fidelity (source↔archive) | per-file sha256 list of `/tmp/w9-tabi-b91` minus `*profile*` vs the archived group (manifest excluded), `sort`+`diff` | **269 vs 269 lines, 0 diff lines** — every archived byte equals its source byte | **PASS** |
| T3 | path-list equality | manifest path list vs on-disk path list | **269 vs 269, 0 diff lines** | **PASS** |
| T4 | composition | count areas under the group | 12 top-level + 1 `__pycache__` pyc + 256 `runs/` = **269**; 9 cell dirs / **20 rep dirs** (9×2 + rep3 on the two central cells); matches manifest header and matrix note §0 "256 non-profile run-artifact files" | **PASS** |
| T5 | exclusion arithmetic | `find` partitioning of the source; group scan | 2,665 total = 269 selected + **2,396** excluded; excluded bytes **58,072,105**; **0** `*profile*` paths in the group; manifest header's excluded counts equal | **PASS** |
| T6 | byte sums | archived files vs source non-profile files | **1,065,924 B = 1,065,924 B**; `du -sb` group 1,096,027 B (manifest + dir entries) | **PASS** |
| T7 | owning-note pin battery | 7 harness pins re-hashed from the archived bytes vs `state-changing-matrix-r9.md` §0 :26-38; plus the §2-fence cross-artifact extraction | **7/7 MATCH** — `server.py` `ac0013e03288ed28…` · `journey.mjs` `cecf3373bceaabdc…` · `driver.sh` `de31bea55f1aae9c…` · `curl-replay.sh` `f1763acb73a6f345…` · `verify.py` `67883a80d19fcbe9…` · `compare.mjs` `764fec22578c6827…` · `curl-control.sh` `8737d42b8c9ac176…`; fence lines 92-369 → 12,312 B / `836169c55b3a54fc…`, minus final newline → **12,311 B / `ac0013e03288ed28…` = archived `server.py`** | **PASS** |
| T8 | census movement | pre-landing state re-read from the r9 draft (§5 :299) vs my census | **35 / 1,451 / 9,222,920 → 36 / 1,721 / 10,318,947** (`du -sb`), manifests 35 → 36 | **PASS** |
| R1 | receipt §1 counts | re-derive every number | 269 / 1,065,924 B; manifest 5 header + 269 lines / 30,103 B; tree figures exact; evidence files excl. manifests **1,685 / 10,135,246 B**; source-quiescence claim (drift re-check 20:57:23Z) consistent with my own reads | **PASS** |
| R2 | receipt §2 inventory | per-area and per-cell re-count | top-level 12 / 142,106 · pycache 1 / 7,527 · runs 256 / 916,291; per-cell 9/9 exact (`replay-guard-skip` 3/45/173,845 · `replay-consumed-pre` 3/45/164,051 · `double-apply-fresh-token` 2/24/128,826 · `replay-terminus` 2/24/122,215 · `replay-consumed-post` 2/30/109,582 · `replay-307` 2/24/109,472 · `replay-unknown-token` 2/24/80,916 · `xclient-consume` 2/20/14,194 · `xclient-sessions` 2/20/13,190) | **PASS** |
| R3 | receipt §3 A/B | as T1/T2 (same commands) | 269/269 OK rc 0; 0 diff lines | **PASS** |
| R4 | receipt §3 C/D | pins 7/7 as T7; corpus-wide scan aggregates + classification examples | 7/7 MATCH; **1,020 unique hashes across 1,685 files** re-derived; spot classifications re-derived in git: `0587605db9138631` = `archive-receipt-r8.md` @ `b377007`, `3b79ed2dea6c` = `SKILL.md` @ `6a8861c`, `8874306672b6` = `SKILL.md` @ `b377007`; the malformed-pin case (F1 below) confirmed (37-chars, `git cat-file` rc ≠ 0). **Scope note: the full 170-token partition is the receipt's own measurement — this lane re-derived the aggregate and 3 classifications, not all 170** | **PASS (spot)** |
| R5 | receipt §3 SC3–SC7 + §4 F1–F5 | re-run: patched `verify.py` (scratch copy, ROOT → archive, reps 1–3), blind byte comparisons, greps | rep3 digest **= rep1/rep2**: `ec26a525bc7c6537` (guard-skip) / `ab95cdd4b0b002a7` (consumed-pre), both IDENTICAL; `ledger-after.json` byte-equal across 3 reps (`5d0884813ccb…` / `50956809aa55…`); PNGs/facts/ledger byte-equal rep1=rep2=rep3; shape 754 B with exactly one changed line (the hidden token `value`; values not reproduced); F3 matrix.tsv = compare-out.txt = `3ed234264cd990af…` / 491 B; F5 `verify.py:13` `ROOT = '/tmp/w9-tabi-b91/runs'`; SC7 `http.log` 303 → `== ABORTED response write` → 409; F1 malformed 37-char pin present once (correct full sha in `round-8-record-draft.md:235` / `round-9.plan.md:10`); F2 first `.pyc` in the tree confirmed (1 total) | **PASS** |
| R6 | receipt §7 post-write re-check | re-derive the residuals | 269/269 OK rc 0; source list vs snapshot 0 diff; 36 groups / 36 manifests / 1,721 files / 10,318,947 B; first-write sha `a73cd2d9…`/197 L matches my poll observation at 20:59:53Z | **PASS** |
| A1 | audit did not edit | `git status` at close; audited artifacts re-hashed at close | repo entries at close: ` M SKILL.md` (lane B10-4), `?? corpus/evidence/w9-tabi-b91/`, `?? corpus/knowledge/arc-synthesis.md`, `?? corpus/knowledge/archive-receipt-r10.md`, `?? corpus/lessons/round-9.md`, `?? plans/round-10-record-draft.md`, `?? plans/round-11.plan.md`, `?? reports/r10-aud-b10.md` (this file). All audited revisions re-hash equal to their bindings; no browser/fixture process of mine (no browser was launched) | **PASS** |

Aggregate: **the r9 archive tranche passes the manifest-equality battery in
full (self-check, source↔archive bytes, path lists, composition, exclusion
arithmetic, pin battery), and the arc synthesis's three audited claims
re-derive — with three findings recorded against the synthesis's citation
discipline (F1: a group-count cell contradicts its own citation; F2: an
unsupported pre-state stamp; F3: an un-enumerated aggregate count). No
artifact was edited; the findings are append-only.**

## 2. The three claims re-derived (method → result)

### C1 — the ladder (:26, :35, :42)

- "Four rungs since round 4": `SKILL.md:363-365` reads *"Four rungs since
  round 4 — climb to the rung the claim needs"* — verbatim match.
- "round 4 added rung 4": `plans/round-4.plan.md:2-3` *"Axis move: depth
  (network-claim evidence class) … the evidence ladder gains its network
  rung"*; `network-evidence-rung.md:35` *"Ladder placement (rung 4)"*.
- "without adding a fifth rung": sweep of `corpus/knowledge/`, `SKILL.md`,
  `plans/`, `reports/` for rung-5 constructions → zero hits outside the
  synthesis's own two statements.
- Rung-boundary anchors spot-read against `SKILL.md:371-374` (the ladder
  table): det-before PNG byte-identity, the 55→65-node delta, the
  multi-signal pair, and the wire-capture surfaces all match the synthesis's
  rows.
- **Finding F3** (below): the closing line's "4 rungs + 5 measured
  extensions" — §1.1 lists four extension bullets; the fifth exists only by
  splitting the r6 bullet into cache-staging + trip-instruments. Under-specified
  aggregate, not a false statement.

### C2 — the approval discipline (:72-75)

- Packet: `sha256sum corpus/handoffs/operator-approval-request.md` →
  `94dc63f5fb9e…`; `wc -l` 121; `wc -c` 13,103; `grep -c '/tmp'` → **0**;
  `:9` carries `filed: 2026-10-14T17:05Z (round 5) · lane: tabi-shokunin ·
  filed by seat B5-4`.
- L0: `02c53ec60acf…` / 25 lines / 21,539 B / mtime
  `2026-10-14 14:05:52.482908587 -0300`; exactly one `tabi`-matching line
  (`:25`), ending "Filing seat B5-4."
- Silence span at the synthesis's read: 17:05:52Z → 20:53:05Z = 13,613 s =
  **3 h 47 m 13 s** (arithmetic re-derived).
- "Byte-identical at every recorded read": the r6 draft (`:27`, `:280`,
  `:308`, `:348`), r7 draft (`:28`, `:90`, `:311`, `:337`), r8 and r9 drafts'
  §0 tables all carry the same sha/line/byte/mtime — the claim's chain is
  findable, not just asserted.

### C3 — the archive as infrastructure (:18, :89, :96-98)

- Rule quote: `cdp-evidence-patterns.md:92` *"**Archive or it didn't
  happen.** Hashes over `/tmp` artifacts are only verifiable while `/tmp`
  lives…"* — verbatim.
- Tranche rows: r5 row (`25` groups / `1,010` files / `6,780,293 B` /
  post-write `1,035` incl. 25 manifests) = `archive-receipt-r5.md:7-9,176-180`
  exactly; round-10 row (`35 → 36`, `1,451 → 1,721`, `9,222,920 →
  10,318,947`, manifest 20:52:46Z) = measured exactly.
- **Finding F1** (below): the r7-row's group column reads `25 → 35`; its
  citation `archive-receipt-r8.md:7-14` says `28 → 35` — and the row's own
  file column (`1,403 → 1,451`) belongs to the 28-group tree (the 25-group
  state held 1,010 evidence files). The count is wrong against its own
  citation; the correct pre-value is **28**.
- **Finding F2** (below): §0's *"was 35 / 1,451 / 9,222,920 B at
  20:53:05Z"* — B10-1's own scratch (`/tmp/w10-b101-arc/verify.log`, the sole
  block stamped 20:53:05Z) reads **36 / 1,721 / 10,318,947**; the 35-state is
  the r9-close census (pre-20:52:46Z landing). Counts right, stamp
  unsupported.

## 3. The archive tranche — manifest equality battery (detail)

- **Self-check:** `sha256sum -c MANIFEST.txt` → `269: OK`, 0 `FAILED`,
  rc 0 (run at ~20:53Z, 20:59Z, 21:05Z — identical).
- **Source↔archive:** `cd /tmp/w9-tabi-b91 && find . -type f -not -path
  '*profile*' … sha256sum | sort` vs the same over the group (manifest
  excluded) → two 269-line lists, `diff` = **0 lines**; re-run at close,
  still 0.
- **Manifest paths = disk paths:** 269 = 269, 0 diff lines (the 270th file is
  `MANIFEST.txt` itself).
- **Exclusion:** 2,665 = 269 + 2,396; excluded bytes 58,072,105 (matches the
  manifest header's `2396 files / 58072105 bytes`); zero `*profile*` path
  components in the group.
- **Composition:** 12 + 1 + 256 = 269; 9 cell dirs, 20 rep dirs.
- **Owning pins:** 7/7 harness pins equal the matrix note's §0 values; the
  §2-fence extraction reproduces the archived `server.py` (12,311 B /
  `ac0013e03288ed28…`) after stripping the fence's trailing newline.
- Pre-landing census (35 / 1,451 / 9,222,920) and post-landing census (36 /
  1,721 / 10,318,947) both re-derived.

## 4. The receipt (B10-2, `c6f4445e…`) — claims re-derived

All §1/§2/§3/§7 numerals re-derived above (R1–R6), including the per-cell
inventory (9/9), the exclusion partition, the post-write re-check, and the
receipt's own revision history (first write `a73cd2d9…`/197 L, observed live
at 20:59:53Z; final `c6f4445e…`/203 L). SC3's rep3 claim — not visible in the
archived `verify-out.txt` — was re-derived independently by patching a scratch
copy of the archived `verify.py` (ROOT → the archive; reps 1,2,3): the rep3
digest equals rep1/rep2 in both central cells, and the three reps'
`ledger-after.json` are byte-identical. **Scope note (R4):** the §3 D
corpus-wide scan (390 tokens → 220 match / 170 classified) was spot-checked —
aggregate (1,020 unique hashes) and three classification examples re-derived
in git — not re-partitioned in full by this lane. F1 (malformed 37-char HEAD
pin in `carried-debt-closure-r8.md:5`), F3 (matrix.tsv = compare-out.txt),
F5 (`verify.py` ROOT hard-coded) all confirmed.

## 5. Findings (append-only; observed by this lane; **not repaired** — no edit permitted)

- **F1 — the r7-tranche row's group count contradicts its citation
  (synthesis :97).** Row: "… | 25 → 35 | 1,403 → 1,451 …" citing
  `archive-receipt-r8.md:7-14`; that receipt reads *"Tree counts move **28 →
  35** group dirs, 1,403 → 1,451 files, 9,007,188 → 9,222,920 B"*. The 25
  value is the r5-tranche end state (25 groups held 1,010 evidence files /
  1,035 incl. manifests); the row's own file baseline (1,403) belongs to the
  28-group tree. Correct pre-count: **28**. An append-only erratum in the
  synthesis's §7 closes it (the author lane owns that).
- **F2 — §0's pre-state stamp is unsupported (synthesis :18).** The row pairs
  `36 … at 20:53Z` with `was 35 / 1,451 / 9,222,920 B at 20:53:05Z`; the
  lane's own verification block (the only 20:53:05Z read, `verify.log`) shows
  **36 / 1,721 / 10,318,947**, and the group's manifest is stamped
  20:52:46Z. The 35-state predates the landing; the stamp does not
  re-derive. Counts fine; stamp misattributed.
- **F3 — "5 measured extensions" is not enumerated (synthesis :42).** §1.1
  lists four bullets (async · cache+trip · stateful · state-changing); the
  aggregate five is countable only by splitting the r6 bullet (cache
  revalidation staging + the four trip instruments). Either spell the split
  or write "4 bullets / 5 classes" — noted, low materiality.
- Naming note (not a finding): the synthesis labels the round-8 receipt's
  tranche "r7 tranche"; the receipt's own title is "the round-6/7 `/tmp`
  tranche (round 8, ARCH-TRANCHE-R8)". The parenthetical site (r7 genesis) is
  right; the label is loose.

## 6. Unknowns

- **U1 — later `/tmp` writes.** The snapshot semantics hold only as of
  20:52:46Z; the source was quiescent through 20:57:23Z (receipt re-check) and
  through this audit's reads. Re-run check B to detect drift (r5/r8 U1,
  unchanged).
- **U2 — the synthesis's SKILL pins are as-of-write anchors.** `SKILL.md`
  moved after the synthesis's write stamp (1,189 → 1,320 `wc -l`, lane B10-4's
  append) — the synthesis's §6 table binds the 20:52–20:54Z revision for its
  own claims; whether the integrating record re-binds is the record's call.
- **U3 — the receipt's full D partition** (170 classified tokens) is spot-only
  by this lane (R4); the receipt's own classification claims stand on its
  scratch (`/tmp/w10-tabi-b10-2/dscan*`).
- **U4 — session material beyond the `*profile*` rule.** Whether any
  non-`profile` path in the source holds session material is unmeasured by
  design (kagi's province; receipt U3; r5 U2).
- **U5 — what the round-10 record lands** (scribes/integrator in flight at
  close: `round-10-record-draft.md`, `round-11.plan.md`, lessons, SKILL append
  all untracked; no commit by any round-10 lane yet at 21:05Z).

## 7. Spot-checks (3, re-runnable)

1. **Manifest equality (T1–T3):** `cd corpus/evidence/w9-tabi-b91 &&
   sha256sum -c MANIFEST.txt` → **269/269 OK, rc 0**; source↔archive hash
   lists → **0 diff lines**; manifest paths = disk paths (269 = 269).
2. **Owning-pin battery (T7):** the seven harness shas re-hashed from the
   archived bytes all equal `state-changing-matrix-r9.md` §0 :26-38; the §2
   fence of `stateful-fixture-evidence.md` (lines 92-369) → 12,312 B /
   `836169c55b3a54fc…` → minus final newline **12,311 B / `ac0013e03288ed28…`**
   = the archived `server.py`.
3. **rep3 digest re-derivation (receipt SC3):** scratch-patched archived
   `verify.py` (ROOT → the archive, reps 1–3) → `replay-guard-skip` rep3 =
   `ec26a525bc7c6537`, `replay-consumed-pre` rep3 = `ab95cdd4b0b002a7`, both
   equal to rep1/rep2; `ledger-after.json` byte-equal across all three reps.