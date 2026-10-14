# Round 5 lessons — tabi-shokunin (2026-10-14)

Training round 5 (fleet "training r4"), 32-lane wave — the design seat map
(TABI-R5-1 archive · R5-2 lessons · R5-3 packet + L0 + cold-read · R5-4 fixture
· R5-5 verification, draft §1), landed under the B5-x scheme: **B5-1** archive
(`archive-receipt-r5.md`), **B5-3** pins refresh, **B5-4** packet filing (the
packet's own seat id), plus **AUD-B5** audit and **SCR-B5** scribe-prep table;
the fixture seat stayed behind the stop rule. Axis move: **freshness** (the lane's
lowest, per SCORECARD). The round's whole content is one four-clause claim
(`plans/round-5.plan.md:3-9`; design text 334 lines, blob `d6694c2`, committed
in `282fc6d`; the commit froze the 11-line digest as HEAD). Evidence: commit
`bc4b7d5` ("probation round 5 (training r4)", 1,065 files = 1,035 evidence +
30 others); `LOG.md:132` (one-line entry); `SCORECARD.md:84` (move-log row);
the verification table `plans/round-5-record-draft.md` (334 lines, incl. its
own errata E1); `reports/r5-aud-b5.md` (171 lines).

## What was claimed, and how each clause verified

The claim, verbatim from the design text: **(a)** every `/tmp` evidence group
archived with a `MANIFEST.txt` (path · sha256 · bytes) whose hashes equal the
owning notes' pins; **(b)** `corpus/lessons/round-{1,2,3,4}.md` exist, each
with a `## Gate`; **(c)** every `SKILL.md` §Pins value re-derived **on a date
strictly later than 2026-10-14**; **(d)** the approval packet at
`corpus/handoffs/operator-approval-request.md` with zero `/tmp` citations and
exactly one line appended to `.ufo/l0-questions.md`. Anti-claim: no external
site; the packet is a request, not a grant (`plans/round-5.plan.md:8-10`).

| Clause | How verified (measured) | Outcome at round 5 |
|---|---|---|
| (a) archive | 25 groups / 25 `MANIFEST.txt` / 1,035 files / 6,889,272 B under `corpus/evidence/`; receipt `corpus/knowledge/archive-receipt-r5.md` (`b41c2f6fb5a4`, 180 lines) reports 1,010 evidence files / 6,780,293 B + 25 manifests, and 5,668 files / 313,772,976 B excluded as profile trees, shape-only. Self-check `sha256sum -c` → 1,010/1,010 OK (receipt §3A); AUD-B5 re-hashed 269 files across 3 sets → 269/269 OK, 0 FAILED. Pin equality: AUD-B5 52/52 pin instances MATCH; receipt §3C 107/109 in-group pin lines OK, the 2 failures = F1. Schema is two-field (`sha256  path`), not the clause's three fields | **LANDED**, schema departure recorded (draft a3 OPEN) |
| (b) lessons | 4 files landed mid-check (draft E1): `wc -l` 59/60/69/87 (60/61/70/88 numbered), one `## Gate` each, round-4 assembled from `plans/round-4-record-draft.md`; shas `bdd46c85b349d37d` / `a862d69cb0b90d6e` / `153a1b9831bb3ed1` / `cde3960eb1a93366` (re-checked today, match AUD-B5 §7) | **LANDED** (b1/b2/b3) |
| (c) pins later-date | Values re-derive **same-day** 15/15 (draft §5) and 16/16 (round-6 §4) — but 2026-10-14 is the current date, so *any* derivation today fails the clause by construction; same-day-later is the exact ceiling the clause exists to break (`SCORECARD.md:60`) | **TIME-GATED** — carried, not failed (earliest 2026-10-15) |
| (d) packet + L0 | Packet 121 lines / 13,103 B / `94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa`; `grep -c '/tmp/'` → 0 (exit 1). L0: 24 → 25 lines, 20,653 → 21,539 B, one `tabi` line at `:25` naming the packet + its full sha256; purity proven by byte-prefix (`head -c 20653` → `0a86973bd17c37f7` = pre-state; post `02c53ec60acfda48`) | **LANDED** (d1–d3); **d4 cold-read verdict NOT LANDED** (DEBT) |

Anti-claim held by construction: zero `tabi` L0 lines before the filing means no
grant could exist; no external site was contacted, no browser ran.

## What landed

- The archive: 25 groups / 1,035 files / 6,889,272 B, one `MANIFEST.txt` each
  (`corpus/evidence/`), with the receipt as the owning note — 5,668 profile-tree
  files excluded by a widened `*profile*` rule, declared with sizes, never
  content-read (receipt §1).
- The four lesson files (`corpus/lessons/round-1..4.md`) — the carried debt of
  rounds 1–4 discharged.
- The packet `corpus/handoffs/operator-approval-request.md` + exactly one L0
  line; SKILL.md +25/−1 → `dcc33f1bf531` (765 lines) with the §Pins errata block
  the refresh lane appended.
- The audit `reports/r5-aud-b5.md`: all three audited clauses PASS, 52/52 pin
  instances, 269 files re-hashed, 0 discrepancies — on 3 of 25 archive sets.

## Method lessons

- A freshness claim that mixes mechanical clauses with a calendar gate cannot
  be "passed" in its own round. (c) was impossible on 2026-10-14 by
  construction, so the honest outcome is "three clauses landed, (c) carried" —
  and round 6 re-checked it and carried it again (`plans/round-6-record-draft.md:95`).
  Name the gate; do not launder it into a same-day "pass".
- Verify against the archive, not the source. Pin equality means hashing the
  **archived** copy (`sha256sum corpus/evidence/...`), and the archive is a
  timestamped snapshot: peer lanes were mid-write during the copy (F3), so the
  snapshot boundary is stated and re-checked by re-running the copy-fidelity
  diff (receipt §3B: 0 diff lines on all 25 groups).
- A definition is itself a claim. "Every `/tmp` evidence group" resolved to 25,
  while the carried-debt lines said "thirteen" (r3) and "18" (r4) — the drift
  was recorded, not silently harmonized (draft E1; `corpus/README.md:48` still
  says thirteen).
- A clause's literal schema vs what landed: (a) says "path · sha256 · bytes";
  the manifests are two-field. The departure was recorded as OPEN at round 5
  and closed later by the receipt's per-group byte totals — not by rewriting the
  manifests (round-6 §2 a4).
- Keep the odd cells as measured: an empty group archived empty with a manifest
  saying 0 files (F5), and a stale in-group pin file kept as finding F1 with no
  owning-note pin affected — never quietly repaired.
- Mechanical extraction has its own failure mode. AUD-B5's first extractor
  (first hex on the matching line) flagged three rows plus set C's harness
  names; the corrected name-adjacent, newline-tolerant extraction matched every
  one. Record the extraction artifact as an artifact (audit §2).
- `wc -l` is not the line-count witness after a no-trailing-newline append: the
  first L0 write ended unterminated (21,538 B, `wc -l` still 24) and a newline
  followed 46 s later. The byte-prefix proof is the witness — the corpus's
  recurring no-trailing-newline class, met again (audit §4).
- A verification lane's cap is a boundary, not a pass. AUD-B5 audited 3 of 25
  sets; the residual risk is U1, recorded, not absorbed into "all clauses PASS"
  (audit §6). The audit's own line-count slip for `round-3.md` (68 vs 69, same
  sha) is kept as-is, append-only.
- The record corrected itself append-only: E1 supersedes §2's status column and
  SC-4, and says so — errata, not rewrites. Corroboration is cheap: round-6's
  independent Step 0 sweep re-derived round-5's counts (25/25, packet 13,103 B,
  the 11-line plan) and agreed lane-for-lane.

## Gate

- Candidates: the archive + receipt (a); the four lesson files (b); the §Pins
  re-derivation (c); the packet + L0 line (d); the AUD-B5 audit; the SCR-B5
  verification table as the record's machinery.
- Admitted: the archive, the receipt, the four lesson files, the packet, the
  L0 line, the audit report — all committed in `bc4b7d5` (1,065 files).
- Rejected / deferred, with reasons: clause (c)'s strictly-later-date stamp
  (impossible on 2026-10-14 by construction — CARRIED, earliest 2026-10-15);
  d4's cold-read verdict (no artifact — DEBT carried into round 6); (a)'s
  three-field manifest schema (two-field landed; departure recorded, later
  closed by the receipt's byte totals); the "every `/tmp` evidence group"
  boundary (loose `/tmp`-root scratch cited only by the round-4 draft is not
  archived — draft §3 U-c); F3's round-5 peer groups (mid-write at snapshot,
  outside "owning notes"); F1's stale in-group pin file (kept); 22 of 25
  archive sets (outside the audit's 3-set cap — U1).
- Spot-check (non-author — AUD-B5, author of no round-5 artifact): re-hashed
  the three sets 269/269 OK, 0 FAILED; 52/52 pin instances MATCH; 4/4 lesson
  files with one `## Gate` each; L0 pure-append proof and line format. SCR-B6
  (round 6) independently re-derived a1–d4 and 16/16 pins same-day; both lanes
  agree with this lesson's counts.
- Falsifier: a manifest line that fails `sha256sum -c`; an archived hash that
  is not the owning note's pin; a lesson file without a `## Gate`; a clause-(c)
  stamp dated 2026-10-14 asserted as satisfying the clause; an L0 append
  without a byte-prefix proof; a packet citing `/tmp/`; an archive group without
  a `MANIFEST.txt`.
- Re-run commands (from the lane root; `.ufo/` is the fleet root):
  ```sh
  find corpus/evidence -mindepth 1 -maxdepth 1 -type d | wc -l      # 25
  find corpus/evidence -name MANIFEST.txt | wc -l                    # 25
  for m in corpus/evidence/*/MANIFEST.txt; do (cd "$(dirname "$m")" \
    && sha256sum -c MANIFEST.txt) || echo "FAIL $m"; done
  sha256sum corpus/evidence/tabi-r2-1-capture/run1/det-before.png     # c08947dc…802dc1
  ls -A corpus/lessons | wc -l                                       # 4 + this file
  grep -c '^## Gate' corpus/lessons/round-{1,2,3,4}.md                # 1 each
  date -u +%F                                                        # 2026-10-14 → (c) impossible
  grep -c '/tmp/' corpus/handoffs/operator-approval-request.md        # 0 (exit 1)
  grep -c '^tabi' .ufo/l0-questions.md                               # 1
  head -c 20653 .ufo/l0-questions.md | sha256sum                     # 0a86973bd17c37f7…
  ```
- Carried debt out of this round: clause (c)'s strictly-later-date §Pins block
  (earliest 2026-10-15; round 6 re-checked and carried it again); d4's
  cold-read verdict; `corpus/README.md` coverage rows and the round-4/5
  primary-verdict + axes rows; F1's re-stamp; F3's round-5 peer groups; the
  round-6 scratch tranche; every new run's bytes still `/tmp`-staged
  (`cdp-evidence-patterns.md:92`). This file also closes round 6's open reading
  U-d (`plans/round-6-record-draft.md:117,243`): `ls -A corpus/lessons` now
  reads 5, not 4.
