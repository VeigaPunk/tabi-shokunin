# Round 7 lessons — tabi-shokunin (2026-10-14)

Training round 7 (fleet "training r6"), 32-lane wave (3 lanes rerouted
alibaba→hyper) — seats PREP-B7 (design), B7-1 (layer-routing synthesis), B7-2
(archive), B7-3 (packet readiness), B7-4 (SKILL distillation), AUD-B7, SCR-B7;
VER-B7 named as verifier in the LOG (no artifact). Axis move: **calibration +
freshness** (`SCORECARD.md:86`). The claim: one axis-move — the next unheld
evidence class, in exactly one branch: G (real-site under a recorded grant) /
D (bridge path, only under a recorded approval) / L (the **state-changing
step** — POST body, redirect-after-POST 303 vs 307, a CSRF-shaped token, the
non-idempotent replay contract), with round-6's L1 matrix as the mechanical
carried-debt check (L0) and L2 instrument reuse (`plans/round-7.plan.md`, 343
`wc -l`, sha256 `fa1394967c74…`). Evidence: commit `b377007` ("probation round
7 (training r6): see LOG", 2026-10-14 16:06:31 -03; 425 files, +44,864/−1);
`LOG.md:134`; the verification table `plans/round-7-record-draft.md` (349
`wc -l`); `reports/r7-aud-b7.md` (260 `wc -l`).

## The gate — how the branch was read (measured)

Three whole-file reads of `.ufo/l0-questions.md` across 18:20:26–18:26:57Z
were byte-identical — 25 lines / 21,539 B / `02c53ec6…` / mtime unchanged
(2026-10-14 14:05:52 -03) / one `tabi` region (`:25`). The lane's bounded poll
then held it byte-identical for 30/30 iterations (18:29:14–18:39:15Z,
`POLL-END`; log still present at this write, volatile). **No diff / no answer
→ Branch L**; nothing filed anywhere; ask-count 1; no re-ask (a verbatim
repeat is banned). `date -u +%F` → 2026-10-14; clause (c) carried again.

## What was claimed, and how each clause verified

| Clause | How verified (measured) | Outcome at round 7 |
|---|---|---|
| L0 — round-6's L1 matrix executed first if unlanded | no matrix note among the 15 notes; the fixture note itself names the matrix "a separate seat's" (`external-class-fixture-v2.md:564-565`); SCR-B7 §2 b-L records NOT LANDED | **CARRIED again** (becomes round-8's own L0) |
| L1a–L1e — the state-changing step | no note, no cells, no per-cell layer-decision records; the SKILL r7 distillation's own routing-usage block states "no measured case exists for a **state-changing** step (POST body, redirect-after-POST 303/307, token consumption — the corpus's own named gap)" | **NOT LANDED** (carried) |
| L2 — instruments | 2 of 3 item classes landed by round 6 (redirect chain + rate/ToS shapes); E3 third-party-JS-shaped async still carried | **PARTIAL (reuse + carry)** |
| L3 — guards | round-6 provenance: closure per run with `closure.txt`; round-7's own matrix runs did not happen | **PARTIAL** |
| L4 — boundary | lane-authored fixtures only; no mirrored real-site artifact | **HOLDS** |
| FR — freshness rider | 18/18 §Pins values re-derived same-day + 5/5 history pins; strictly-later-date **CARRIED** | **CARRIED (values matched)** |
| M1 — note + coverage row + SKILL distillation | the synthesis note and the readiness note landed; SKILL `+151/−1` → `8874306672b6…` (945 `wc -l` / 78,977 B); the coverage row did **not** land (`corpus/README.md` untouched by the commit) | **PARTIAL — row DEBT** |
| M2 — lessons count | re-derived **5** (`round-1..5.md`, one `## Gate` each); the plan's frozen "→ 4" predates round-6's landing of `round-5.md` | **PASS (count asserted 5)** |
| M3 — LOG + commit | `b377007`: 9 non-evidence files + 416 evidence lines | **PASS** |
| M4 — standing Brave reject | `NativeMessagingHosts` only → agree; count asserted **7th**, with the drift lineage printed | **PASS** |
| M5 — read-back precedes any act | the gate record precedes all branch work; ask-count 1 | **PASS (as far as measurable)** |
| AC — anti-claim | L0 unchanged; the round's artifacts are loopback fixtures/notes; no browser run against any external site | **HOLDS** |
| FL — fleet | tabi still absent from the watchdog `LANES` roster; reported | **REPORTED** |

## What landed

- `corpus/knowledge/layer-routing-synthesis.md` (B7-1; 254 `wc -l` at commit /
  `7725ee4217…`): a 10-layer inventory and 18 routing rows, each anchored to
  rounds 4–6's measured disagreement cases (RT2's 3-vs-1 count delta, RT3's
  wire-304/client-200-or-304 split, RT6's cross-origin `redirectCount` 0-vs-3,
  RT9's ~114–115 B `transferSize`↔`finEnc` offset); rows assembled by the note
  are marked `[synthesis]`; §5 keeps eight unknowns; its own "do not route by
  this table" caveat names the uncovered classes (state-changing step,
  real-site, bridge surfaces, the L1 matrix).
- `corpus/knowledge/packet-readiness-r7.md` (B7-3; 122 `wc -l`): the approval
  packet audited against the corpus — **9/9 claim classes backed by landed
  notes; 9/9 note pins stale** (they equal the r4-commit blobs; the r5 refresh
  appended 2–5 min after filing); substrate 3/3 hold; the packet's own
  cold-read falsifier still unexecuted; POST/CSRF/replay **narrowed** but open.
- The archive, completed: B7-2's three round-6 groups (18:24:53Z:
  `w6-tabi-b61`, `w6-aud-b6-scratch`, `w6-ver-b6`) and the seven tranche groups
  (41 evidence files / 207,889 B; snapshot 19:01:16Z, copy 19:01:44Z; receipt
  `archive-receipt-r8.md`, 191 `wc -l`) — the tree moves 25 → 28 → **35 group
  dirs / 35 `MANIFEST.txt` / 1,451 files / 9,222,920 B**; the receipt's check A
  41/41 OK, check B 0 diff lines per group, check C seven sub-checks; F1 kept.
- SKILL.md `+151/−1` → `8874306672b6…` (945 `wc -l`): the harness-archive
  discipline section (census **28** groups / 1,375 non-manifest files /
  8,861,433 B at its write time), the layer-routing usage section with its
  do-not-route caveat, and B7-4's append-only round-7 errata block.
- `reports/r7-aud-b7.md` (AUD-B7; 260 `wc -l`): 423 manifest lines re-checked
  (`sha256sum -c` exit 0 in each of 3 groups), 48 in-group pin lines, 55
  owning-note pin comparisons — all MATCH; the round-5 receipt's 1,010-file
  totals re-derive digit-for-digit; routing rows RT2 and RT3 re-derived from
  the archived bytes (+ half of RT1).

## Method lessons

- **The planned class can fail to land twice running.** Round 6's matrix was
  carried; round 7's own POST/redirect/token/replay matrix did not land
  either. What landed — the routing synthesis and the archive — is real work on
  the same branch, but the claimed class stayed empty for a second round, and
  round 8's plan now owns it. Keep the gap visible: the SKILL's own usage block
  says "no measured case exists for a state-changing step", which is what stops
  a reader routing by a table with a hole in it.
- **A carried-debt check can itself be carried.** L0 said: execute round-6's
  matrix first if unlanded. It was read, recorded unlanded, and not executed;
  the round closed with it still owing. Two consecutive rounds naming the same
  class as debt is data about capacity, not about the class.
- **A synthesis measures nothing, and says so.** The routing table re-states
  anchored measurements; assembled rows are marked `[synthesis]`; AUD-B7
  re-derived 2 of 18 rows in full plus a half-row (U5) — a distillation is
  bounded by its audit's sample, and the unknowns stay in §5 instead of being
  averaged away.
- **Print the count with its read time.** The census moved 25 → 28 → 35 inside
  one round; the LOG's "archive completed (35 groups, 41 new files)" and its
  "SKILL census 28 groups" are both measured and both true at different
  instants — and AUD-B7's finding is the general form: the archive outgrew the
  round-6 record's predicate mid-audit. An un-stamped count is the bug.
- **Anchors age by other rounds' appends.** 9/9 packet note pins no longer
  resolve (they equal the r4-commit blobs; the r5 append pass moved the files
  minutes after filing); class→note binding intact, pin→bytes binding lapsed. A
  self-verifying packet needs its pin block refreshed by append-only erratum,
  or the packet re-filed (new hash + new L0 line) — the path is named in the
  readiness note; the decision is the record's (not taken here).
- **A commit is the tree's state, not a wave's.** `b377007` carries a lane that
  self-identifies as round 8 (ARCH-TRANCHE-R8 — the tranche groups and
  `archive-receipt-r8.md`, snapshot 19:01:16Z, scratch `/tmp/w8-arch-tranche/`)
  plus `plans/round-8.plan.md`, all swept in by the round-7 scribe's commit at
  16:06:31 -03. The LOG's "archive completed" counts the committed tree — true
  as a measurement of the tree, and needing the attribution note as a
  measurement of the round. [observation + inference]
- **A named verifier without an artifact is a finding.** `VER-B7` appears once
  — in the LOG line — and nowhere else in the tree; the verification surface is
  AUD-B7's report plus the scribe's table. Attribution is not evidence.
- **Hashes bind bytes; counts are transcriptions.** The round-7 draft records
  the round-6 SKILL revision as 795 `wc -l` / 70,687 B; the committed blob
  re-derives to `a8ba10b86138…` / 795 / **64,401 B** (the round-6 draft's own
  figure). Hash and line count agree; the byte figure is a slip — keep the
  value, re-derive before citing.

## Gate

- Candidates: the layer-routing synthesis; the packet-readiness note; the
  archive receipt + the 10 evidence groups; the SKILL r7 revision; AUD-B7; the
  SCR-B7 verification table as the record's machinery.
- Admitted: the synthesis, the readiness note, the receipt, the 10 evidence
  groups (416 files), the SKILL revision, AUD-B7 — all in `b377007` (425
  files, +44,864/−1), together with the round-7 record draft and the two
  round-8 artifacts named above.
- Rejected / deferred, with reasons: round-6's L1 matrix (still not landed);
  round-7's state-changing step (not landed — carried to round 8); the E3
  async cells (carried); the `README.md` coverage rows (untouched by the
  commit); SCORECARD r4–r6 verdict tables + axes refresh (owed; row 7 again
  appended after "Planned / retired"); the packet's cold-read verdict
  (unexecuted since filing); the packet's lapsed pin block (finding named,
  repair not taken); the daemon change point and the bridge path (no approval —
  D0 unmet by construction).
- Spot-check (non-author — AUD-B7, author of no round-7 artifact): 3 groups
  re-hashed — 423/423 manifest lines OK, exit 0 each; 48 in-group pin lines and
  55 owning-note pin comparisons MATCH; file↔manifest completeness checked
  across all 28 groups then in the tree; RT2 (client `/style.css` hops 3 vs
  server lines 1) and RT3 (wire 304; client 200 or 304; cache flags false on
  every response; server histogram `10×304, 8×200, 2×302, 3×404`) re-derived
  from archived bytes; all four cited anchor regions present at the cited
  lines; no file written by the audit. SCR-B7 §8 SC-1–SC-8: 18/18 pins + 5/5
  history pins same-day, 269/269 archive spot + 3/3 note-pin instances, L0
  three byte-identical reads + poll, lessons 5 with one `## Gate` each, daemon
  and substrate re-reads matching, cross-lane corroboration with B7-3, and the
  plan's fingerprint delta kept (331-line mid-write vs 342-line final — both
  values on record).
- Falsifier: a routing row whose cited anchor does not carry the text; a
  manifest line failing `sha256sum -c`; a synthesis row unmarked where no
  single source holds it; an archive count cited without its read time; a
  commit cited as a wave's own when it carries another wave's artifacts; a
  lesson file without a `## Gate`.
- Re-run commands (from the lane root; `.ufo/` is the fleet root):
  ```sh
  find corpus/evidence -mindepth 1 -maxdepth 1 -type d | wc -l     # 35
  find corpus/evidence -name MANIFEST.txt | wc -l                   # 35
  cd corpus/evidence/w6-tabi-b61 && sha256sum -c MANIFEST.txt       # 139/139 OK
  grep -c '"GET /style.css HTTP/1.1" 200' \
    corpus/evidence/w4-t41-network/run1/http.log                    # 1
  ls -A corpus/lessons | wc -l                                      # 5 (round 8 lands 6/7)
  date -u +%F                                                       # 2026-10-14 → (c) carried
  ```
- Carried debt out of this round: round-6's L1 matrix and round-7's
  state-changing step (both named again in `plans/round-8.plan.md` as branch-L
  obligations); the E3 async cells; `README.md` coverage rows; SCORECARD r4–r6
  verdict tables and the axes refresh; the packet's cold-read verdict and its
  lapsed pin block; the daemon change point; the round-6 lesson
  (`round-6.md` did not exist at round-7 close — the file pair here closes it;
  the pattern is lessons landing one wave late).