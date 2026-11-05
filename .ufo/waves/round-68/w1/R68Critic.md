# R68Critic — pre-freeze claim-design falsification, tabi round 68 w1 (2026-11-05)

Lane /home/vgpnk/Projects/shokunin/tabi-shokunin, base 1746c53d. Method: read r65–r67
closures (LOG.md 3659–3686), both gate sources, generator, controls, receipts; ran the
two assigned selftests plus 5 own read-only probes (full receipts:
`.ufo/waves/round-68/w1/R68Critic/receipts/probes-r68-critic.md`). No git mutations, no
installs, scratch deleted.

## Verdicts

| Claim | Verdict | One-line reason |
|---|---|---|
| C1 worksheet (49 pending) + adjacency gate | **change-required** | seat-adjudicator forgery goes GREEN on the current patched gate; axis is readiness, not an adjacency move |
| C2 instrument registry repair (7 r67 instruments) | **acceptable with changes** | repair is real and refuses do-nothing, but the gate proves worktree bytes, not the "committed blob" its header claims |
| C3 S173 docs-held synthesizeScrollGesture | **design acceptable; integration change-required** | counter is genuinely source-bound (not count-only), but the live S173 registry row is red (E04+E11) |

## C1 — worksheet + check-adjacency-adjudication-r68

Holds, verified independently:
- Enumeration is ledger-derived, not asserted: 49 `contested-open` rows in the committed
  r66 ledger (b1ecd665; census of col 8: 95 no-tabi-ground / 49 contested-open / 25 — /
  5 overlap-declared). Gate refuses missing/extra/duplicate keys; do-nothing control red
  (`worksheet-missing`), header-only red (`missing-key:49`).
- The r[5]→r[6] quote-column correction is confirmed: my own generator run (P4) is
  byte-identical (a6028e70…) to the production worksheet and to 5 other seats' regens.
- Hardening landed: line-bound quotes (`quote-off-line`, p7-postfix red), degenerate
  quotes (pdeg red), verdict polarity, `tabi`/`tabi-shokunin` adjudicator red
  (p5-postfix), pending rows must keep `—` cells, `--json` now parses (Sentinel F3 fixed).

Falsified / still open:
1. **Seat-identity adjudicator hole (my probe P5)**: one row flipped to
   `adjudicated-agree` with adjudicator `TabiR68a2` → rc 0, `ok:true, pending:48,
   adjudicated:1`. `isLaneIdentity` matches only `tabi`, `tabi-shokunin`, `/^tabi[\s<@]/`,
   `tabi@` — the planner seat alias (`tabir68a2` lowercased) and every `R68*`/`L1 …`
   alias pass. This falsifies the header promise "the lane itself can never be the
   adjudicator of record" and the candidate's "pending-non-author" guarantee: a lane
   seat can adjudicate its own rows and stay green. **Smallest fix**: closed author
   allowlist (lane + every seat id + `L1 …` forms) or a pinned `--outside-roster` file;
   add selftest cases for `TabiR68`, `TabiR68a2`, `R68Exec1`.
2. **Sentinel F1/F2 still open in the current gate** (grep: no `GIT_*` env stripping, no
   mkdtemp; `rmSync(scratch)` uncontained). Selftest-only paths, but this becomes a
   frozen instrument; patch or disclose both as claim limits.
3. **Axis governance**: the worksheet changes 0 dispositions (49 stay contested-open at
   pinned heads). It is a readiness/polarity meter, not an adjacency move. r65 C1
   ("axis mis-assigned" per R65Critic), r66 C1 (axis contested), r67 C1 (withdrawn) all
   await the same unanswered L0 ruling. Freeze C1 as a state claim with score held —
   "49 pending-non-author, 0 adjudications, evidence line-bound at pinned r66 heads;
   gate refuses forged adjudications" — never "adjacency improved". The bound "never
   pretend pending rows are actual non-author adjudications" is currently honored by
   the artifact (clean `—` cells, adjudicated:0); keep it honored by the claim wording.
4. **Pin authenticity**: argv sha pins are integrity-only; ledger and snapshot are
   committed (b1ecd665 / 4bea87d5, worktree clean, P3 shas). claims.json must pin the
   committed blobs, and any ledger swap re-pinned by the runner is only caught by
   resolving quotes at real sibling heads — disclose that.
5. **Selftest count drift**: milestone says 15-case; the gate now runs 19 (hardening
   added cases). Pin the actual count at freeze (this exact drift class was mined in r66).

## C2 — check-instrument-registry-r68 + SKILL.md section

Holds: do-nothing refused (`registry-section-missing`, baseline receipt rc 1, donothing
control red); 7-case selftest clean (P2); all 7 EXPECTED paths exist; entry/verdicts/
scope/owner/selftest cells enforced; SKILL.md section present (grep 1, uncommitted M).

Falsified / required changes:
1. **Provenance overclaim**: header says "recorded sha256 equals the committed blob" but
   `check()` hashes the worktree file (`sha256File(abs)`); Sentinel's F6 probe (registry
   pinning uncommitted content) is green (`c2-after-worktree.json`). Today it is benign —
   my crosscheck P6: all 7 paths git-clean and worktree sha == blob sha at r67 freezeRev
   e0fc04c2, 7/7, driver b7cd3b1d… matches scored-summary.json — but the gate does not
   enforce it. **Smallest fix**: require `git status --porcelain` clean per path or
   compare against `git show <pin>:<path>`; add the uncommitted-edit selftest case; or
   correct the header/claim to "worktree bytes, cross-checked vs e0fc04c2 (receipt)".
2. **Symlink hole (F7)**: no `lstat`; a symlinked instrument's out-of-repo sha passes.
   Close (lstat isFile + realpath under repoRoot) or disclose.
3. **Axis**: registering the r67 generation is bookkeeping-with-teeth; as "calibration"
   it is defensible only once (1) lands — otherwise the lane grades its own paperwork
   against lane-chosen bytes (self-assessment, the exact thing the milestone says to
   falsify). Minor: `selftest-unstated` accepts any `—`-prefixed cell as "explicitly no
   selftest" — weak vocabulary, disclose.

## C3 — S173 docs-held knowledge + check-c3-synthscroll-r68

Design acceptable — this is NOT a count-only sourceless fake:
- The counter binds entry ↔ staged bytes: digest equality with the staged Input.pdl
  (5bbc6e23…), byte-identical r64 corroboration copy (P3), line-addressed quotes/facts
  (I verified lines 286/287/294/296/303/304/306/309/311 against the staged bytes), S-id,
  URL, anchor range, required qualifier "runtime unmeasured", forbidden capability
  phrases. On-evidence receipt: exit 0, all 8 checks true.
- Do-nothing discrimination is right-shaped: count-only artifacts (no S-id/URL/digest)
  get exit 2 no-work — neither certified nor refuted (`c3-donothing.json`, empty-entry
  sha e3b0c442…); presence-only and empty fixtures expect 2; forgeries (quote forgery,
  stale digest, wrong URL, runtime-drift) expect 1 with correct tokens.

Integration change-required (freeze blockers):
1. **Live S173 row (SOURCES.md:187, uncommitted M) is red on the lane's own registry**:
   E04 duplicate_url — it reuses S168's URL and its teaches cell begins "scroll
   gestures…", so the `/^supersedes\s+S[0-9]{3,}\b/` exemption (check-sources.mjs:293)
   does not fire; E11 used_by_missing — cites corpus/lessons/round-68.md, which does not
   exist (verified absent). **Smallest fix**: rewrite teaches to begin
   `supersedes S168 …` (re-scope, keep S168 as predecessor — R68Exec3's variant already
   drafts this) and create the round-68 lesson or repoint used-by. Do not freeze C3 with
   a red registry row.
2. Pre-existing, outside this candidate but blocking a green freeze census: E04 also
   fires on S171/S172 (canonical-URL repeats of S157/S167). L1 must decide their fate;
   C3's claim should not assert a clean census it does not have.
3. Keep the row's scope sentences ("at this tag only", "runtime unmeasured", denies
   trackpad phase traces / smooth rendering) verbatim in the frozen row; they are what
   makes the coverage claim honest.

## Do the claims deserve their axes?

- C1: as an improvement, no — it is a readiness state + forgery refusal on the
  adjudication channel. Score-held, axisDeclared adjacency, pending the operator ruling
  that has been outstanding since r65.
- C2: calibration only after the committed-blob/cleanliness fix; otherwise it is
  self-assessment bookkeeping (still a legitimate repair, but not calibration proof).
- C3: coverage, yes — new located docs-held ground with runtime explicitly unmeasured.

## Bounds

Writes confined to `.ufo/waves/round-68/w1/R68Critic{,.md,/receipts/}` and scratch
`/fast/scratch/hyaku/tabi-r68/R68Critic/` (deleted after persist). No production or
sibling writes; no git/jj mutations; read-only git only; no tool installs (RULES.md
read; pacman untouched).
