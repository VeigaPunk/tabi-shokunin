# Wave-2 attack-item inventory — tabi round 34 (ConnRound data-walk)

Scope: attack items wave 2 should run against wave-1 outputs. One item per new
map row, per screen-reason group per sibling, per kill case, per new source row,
per gate/counter. 46 items (required >= 32). Each item names what it attacks and
the artifact it targets; verdicts reported as holds / defect (severity, line
evidence).

Legend: P1 = C1 predicate (unaccounted 0, newMapped >= 3, adjacency clean);
P2 = C2 predicate (20/20 killed, pristine/neutral/decoy/twins 0, battery true).

---

## 1. New map rows — one attack per row (target 3; feasibility names ~5)

These attack the semantics the counter cannot see (claims.json feasibilityDisclosed):
a new declaration passing the letter checks may still be a restatement (same-surface),
a route mention, or an invented overlap.

- **W-R1 — attack new row on kake SKILL.md:697** (lab score/Lighthouse/DevTools →
  tabi). Check: the declaration is a real overlap, not a route sentence; surface is
  not a restatement of an existing kake surface (accessibility/crawler/lease); the
  new tabi line is not a reworded roster string; quote verbatim on the cited line at
  pin 044048597d; disposition fits evidence (refused-route needs no sibling-side naming
  — attacker verifies the refusal is real, not a dodge).
- **W-R2 — attack new row on kake corpus/knowledge/field-performance-cwv.md:153**
  (CrUX API key custody routed to tabi). Check: overlap substance vs pure delegation;
  the tabi-side declaration names kake; line is genuinely new (absent at baseline in
  the target tabi file); sibling quote verbatim.
- **W-R3 — attack new row on kake SKILL.md:408** (route browser work to tabi,
  publishing/account to operator). Check: same questions; specifically verify the
  sibling line is the 408 sentence at the pin, not the neighbouring 409/410; confirm
  disposition claim (split-declared requires sibling_quote containing `tabi`).
- **W-R4 — attack new row on kasegi corpus/knowledge/mission-control.md:119**
  (authenticated burnerchrome at CDP 9222). Check: this is a real overlap with tabi's
  CDP session discipline, NOT same-surface under kama's cdp-live-target-census or
  kagi/kake's musketeer-cdp-9222-profile-lease (kasegi has no mapped surface — a
  same-surface screen for it must fail the counter anyway); verify the declaration
  line and quote; verify the kasegi pin (d65d823e) carries the line.
- **W-R5 — attack new row on kotoba census round-49:171-175** (open agent-facing-text
  split ad). Check: the split is real and current, not a stale round-16 draft that
  never landed (kotoba itself says it "never reached tabi's scope"); the declaration
  paragraph quotes the sibling; the 4-line span is on sibling lines at the kotoba pin
  (65a5c7a6); disposition is honest (contested-open needs an l0 DRAFT line; seats
  DRAFT, L1 files — verify the draft exists at write time).
- **W-R6 — attack the "newMapped >= 3" breadth floor**: with target 3, verify the 3+
  rows are distinct surfaces/siblings (the counter folds (surface,sibling) keys, so
  duplicate-surface rows don't double-count; attacker checks the counter's folded-key
  math and that the rows aren't one real overlap triple-counted under reworded quotes).

## 2. Screen-reason groups — one attack per (sibling, reason) group

Each group is attacked on: reason correctness (a real overlap must never be screened;
a non-overlap must never be mapped), quote verbatimness, surface validity for
same-surface (must name a verified row of the SAME sibling), and the exact candidate
key (sibling_ref must equal the frozen candidate key — see W-G2).

- **W-S1 — kake same-surface** (candidates: SKILL.md:161/:560, mirror-pitfalls.md:40,
  accessibility-review-packet.md:122, accessibility-review-cards.json:8,
  js-rendering-queue.md:77, static-canonical-preflight.md:134): each restatement of a
  mapped kake boundary (musketeer-cdp-9222-profile-lease / accessibility-browser-at-
  execution / crawler/js-rendering / rendered-dom) must cite a VERIFIED kake surface;
  a restatement under a NEW surface name is a defect (re-keying).
- **W-S2 — kake third-lane-report** (delegation cluster SKILL.md:408/:559/:697,
  field-performance-cwv.md:153, accessibility-review-packet.md:121): these are route
  clauses, not overlap claims — verify they carry no overlap assertion; if any is
  mapped instead of screened, that is a defect.
- **W-S3 — kake no-claim-declared** (fire-journal-codes.md:27): operational CDP
  preflight usage, no ownership claim — verify the screen quote is verbatim and the
  reason matches the candidate.
- **W-S4 — kotoba third-lane-report** (census round-49:86 / round-74:70/:101/:126/
  :150/:151/:152, sibling-description-rewrites-round8.md:136, fleet-skill-audit-
  round5.md:45): census/audit rows that quote PROVINCE.md:3 or describe kagi/kake
  arbitration — verify none is a real tabi overlap (the PROVINCE quote is the *map's*
  own sentence, not a claim by kotoba).
- **W-S5 — kotoba no-claim-declared** (any census row naming tabi only as a roster/
  table entry): verify each screen's reason and quote; a table cell quoting
  PROVINCE.md:3 is a citation, not a claim.
- **W-S6 — kumitate same-surface** (kimi-skills-plugins.md:250/:278/:320/:321/:324):
  every one restates the kimi-webbridge-plugin-internals boundary — verify each cites
  the verified surface; the 278 row cites tabi SKILL.md:1421-1424 (host-probe
  records) — check the quote is exact.
- **W-S7 — mori third-lane-report** (wave-settlement-r20.md:33/:50/:52/:69/:90/:106):
  seat-behavior reports about tabi r12/r13 trailer mechanics — no browser-craft
  overlap; verify reason and quotes.
- **W-S8 — mori no-claim-declared** (roster-truth-r12.md:9/:10): config tables
  listing tabi as an ID — verify no claim is declared.
- **W-S9 — tameshi third-lane-report** (fleet-kill-rate-ledger.md:128,
  fleet-suite-census.md:306/:621/:622/:646): census observations about tabi's repo
  (tools/ absent) — verify none claims browser overlap.
- **W-S10 — tsukuroi third-lane-report** (adjacency-anchors-r19.md:187/:188):
  historical IN-092/093 anchor rows citing drafti drafts/PROVINCE — verify the screen
  reason covers "historical resolution record, not a present-tense overlap claim".
- **W-S11 — kaidoku same-surface** (SKILL.md:55, 2026-10-13-r3:17/:50/:99,
  2026-10-14-r11-01:305): CDP self-launch/loopback/profile/observation recipes —
  verify each cites the verified kaidoku surface (cdp-runtime-observation or
  reverse-engineering-of-shipped-artifacts); a new surface name on a restatement is a
  re-keying defect.
- **W-S12 — kaidoku no-claim-declared / third-lane-report** (2026-10-13-r2:72,
  2026-10-14-r10-01:151, 2026-10-14-r10-02:117, r4-16:184): kaidoku's own evidence
  discipline statements (HAR, screenshots) that name no tabi ground — verify the
  reason fits and no real overlap (screenshot/DOM evidence discipline is tabi ground,
  so a `no-claim-declared` reason here is suspect — attack the boundary).
- **W-S13 — kagi same-surface** (SKILL.md:450/:488, cdp-bridge-1password.md:70/:77):
  CDP 9222 + musketeer profile lease restatements — verify each cites the verified
  musketeer-cdp-9222-profile-lease surface.
- **W-S14 — kama same-surface** (listener-census.md:56, consumer-registry.md:9/:235):
  restatements of cdp-live-target-census (row 11 already maps :355) — verify surfaces.
- **W-S15 — kasegi third-lane-report** (ufo-workspaces.md:272): corroboration of a
  submitter's verified submission — verify reason; if instead mapped, attack as a
  non-overlap map (W-R class).
- **W-S16 — chousa no-claim-declared** (archived-export-intake.md:20): explicit
  browser/CDP denial (anti-claim) — verify the screen quote is the denial sentence.
- **W-S17 — every screen row's quote integrity**: quote must be a verbatim substring
  (4-25 words, >= 20 non-space) of the candidate line; a trimmed/paraphrased quote is
  a defect (the counter flags it, but wave 2 must re-read the sibling line at the pin).
- **W-S18 — per-sibling screen completeness**: for each sibling with candidates, every
  candidate must be either mapped or screened; a candidate left unaccounted is a P1
  failure; a candidate screened twice is a defect (screen-duplicate).

## 3. Per kill case — one attack per surviving mutant (12)

Each attacks the new self-test case that must kill the mutant, plus that the case
genuinely exercises the rule (exit 3 + a `CASE ... FAIL` line, against P2's probes).

- **W-M01 — M01 x3 duplicate-id threshold (>1 → >2)**: require a fixture with EXACTLY
  2 duplicated ids (v2-f2 uses 16, which the mutant still flags). Attack: pristine
  fails (exit 1, x3-duplicate-id), M01 passes under the case, case fails only on the
  threshold boundary, not on a side effect.
- **W-M03 — M03 verdict case-folding (m[1].toLowerCase() dropped)**: require an
  all-uppercase `Measured`/`YES` cell in a golden-like receipt (needs a fixture the
  selftest does not build today). Attack: pristine admits (exit 0), M03 refuses.
- **W-M04 — M04 transcript path distinctness (check → if(false))**: attack the case's
  very existence: at one git rev one path is one blob, so same-path ⇒ same-bytes ⇒
  same-sha; the required isolation (path check only) is constructibly infeasible.
  Verdict expected: target missed, not narrowed — report the construction attempted
  and why no case can isolate it, or find a receipt shape (e.g., tampered
  transcriptSha256 field vs path) that does.
- **W-M05 — M05 transcript sha distinctness (check removed)**: a kill case is
  constructible: two DIFFERENT transcript paths with byte-identical content (distinct
  paths, equal shas) — pristine passes, M05 flags. Attack: verify the case does not
  also trip M04 (paths distinct) nor the sessionId check (sids distinct), so the fail
  is attributable to the sha rule.
- **W-M06 — M06 sessionId regex accepts uppercase ([0-9a-f] → [0-9a-fA-F])**:
  require a case with an uppercase-hex 32-char sessionId. Sourcing: must rest on
  registry rows opened this round (SOURCES S130+; S127 documents the lowercase shape).
  Attack: pristine refuses, M06 accepts; case fails on shape, not on length/format.
- **W-M07 — M07 webSocketUrl↔sessionId binding removed**: require a loopback receipt
  whose ws URL names a DIFFERENT valid session id (currently every golden binds url to
  sid and off-loopback fails earlier). Attack: pristine fails on the binding, M07
  passes; no other rule (WS_LOOPBACK/SESSION_ID) fires first.
- **W-M08 — M08 context-id regex accepts lowercase**: require a case with a
  lowercase-hex 32-char context id. Sourcing: id-shape case must rest on S130+
  (browsingContext id shape row: upper-case 32 hex per spec/implementation). Attack:
  pristine refuses, M08 accepts.
- **W-M09 — M09 DRIVER_ALLOW widened (ROWS added)**: require an otherwise-honest
  driver that imports a non-allow-listed symbol (e.g., ROWS) with the selftest's
  fixture-builder option to author driver imports. Attack: pristine refuses (driver
  finding), M09 passes; driver is otherwise clean (no other finding).
- **W-M10 — M10 DRIVER_ALLOW drops serveFixture**: require a driver that imports
  serveFixture (selftest driver is import-free today). Attack: pristine passes, M10
  refuses; the driver is otherwise honest.
- **W-M16 — M16 s1 Gate-row sha256 requirement dropped**: require a source row that
  has a gate row with an https URL but NO 64-hex sha (battery F8 gives no Gate row at
  all — the new case must give a row with URL but no sha). Attack: pristine flags
  s1-source-row, M16 passes; no other s1 rule fires first.
- **W-M18 — M18 clean guard admitted >= 1 → >= 0**: require an entry whose rows are
  ALL `no` (all unmeasured, no findings, population >= 1): pristine exit 1 (not
  clean, admitted 0), M18 exit 0. Attack: verify no finding is synthesized to make
  the case pass trivially.
- **W-M19 — M19 sessionId pairwise distinctness dropped**: require two runs with
  distinct paths, distinct bytes (cosmetic perturbation) and ONE shared well-shaped
  sessionId. Attack: pristine flags, M19 passes; no path/sha check fires first.
- **W-M0 — cross-case hygiene (all 12)**: every new case must keep the 44 existing
  selftest cases passing (pristine), keep neutral/decoy/twin exits 0, add no reworded
  mutant find text (rule lines byte-identical to baseline; only new cases and
  fixture-builder options), and the round-33 forgery battery must stay met.

## 4. New source rows — one attack per row opened this round (SOURCES S130+)

None existed at freeze (registry max S129 at 59f1b47). Wave 1 opens S130+; each row
opened gets one attack. Required shapes (per claims C2 sourcing):

- **W-N1 — browsingContext id-shape row (S130+)** (upper-case 32 hex): attack the
  fetch record (URL, UTC time, HTTP status, byte count, sha256; 404 by body text),
  scope/anchor accuracy, the teaches claim (that the shape is the shipped BiDi
  browsingContext id), and its used-by linkage to the M08 kill case.
- **W-N2 — session id-shape row (S130+)** (lower-case 32 hex; complements S127):
  same attacks; verify it does not duplicate/contradict S127 and that the M06 case
  cites it.
- **W-N3 — every other S130+ row**: one item per row actually opened (unknown count
  at write time): fetch integrity, scope/teaches accuracy, cadence syntax, and the
  used-by claim in the round lesson's `## Gate`.

## 5. Per gate/counter — one attack per gate/counter

- **W-G1 — C1 counter itself** (c1-adjacency-sweep-v2.mjs): frozen bytes must equal
  digest 0dba816c…; exit-2 refusal paths (unparseable leads, adj-gate sha mismatch,
  check-adjacency non-evaluation); verify the counter never reads the worktree
  (blobs only) and never writes the lane.
- **W-G2 — C1 candidate/screen key edge**: screen rows must use the EXACT frozen
  candidate key (lane@pin:path:line), including set-B leads anchored at their own
  lead commits (which differ from round-34 pins for kaidoku/kaasegi); a screen row on
  a deduped twin's key is a screen-not-a-candidate defect; a candidate covered only by
  an A-twin mapping must not leave the B line unaccounted.
- **W-G3 — screen-ledger parser edges**: header must be exactly the frozen 5-column
  header; columns trimmed; duplicates flagged; same-surface must reference a VERIFIED
  row of the same sibling (surface check uses verifiedRows); non-same-surface must
  carry `-`.
- **W-G4 — C2 counter itself** (c2-gate-mutants.mjs): frozen bytes = 3cf5eb69…;
  the apply-once assertion (`find` occurs EXACTLY once in G); twin = first-space
  doubling of find_i (and find_i must contain a space); crash/timeout is NOT a kill
  (only exit 3 with a `CASE ... FAIL` line); TMPDIR cleanup; never writes the lane.
- **W-G5 — the gate's own --selftest runner** (runSelftest exit-3 contract): a case
  that throws (crash) must not masquerade as a kill; a case that fails on state
  unrelated to the mutated rule (global artifact) must be caught by the pairwise
  attribution attack in §3.
- **W-G6 — round-33 forgery battery**: bytes from e6b0a907 must equal 51ace65f… and
  predicate must stay met at REV (honest H0/H1/H2 admitted, forgeries 0/8).
- **W-G7 — measure.sh noharm leg + check-selfassessment**: at REV every offline
  gate/self-test that exits 0 at baseline still exits 0; check-selfassessment
  mismatches 0; census exit 0; round-33 C1 counter keeps unaccounted 0 over the 52
  PROVINCE candidates; prior-round prose of SKILL.md/SCORECARD.md/LOG.md/corpus
  README/QUALITY/SOURCES/adjacency.tsv append-only (git diff --numstat deleted 0).
- **W-G8 — pinned digests**: scripts/check-adjacency.mjs at REV must equal
  4e2c2a64… (C1); the v2 gate's 20 mutant find strings must be byte-identical to the
  baseline gate (no reworded rule line — C2). Attack both with direct byte diffs.

---

## Coverage ledger

- New map rows: 6 (W-R1..W-R6)
- Screen-reason groups per sibling: 18 (W-S1..W-S18)
- Kill cases: 13 (W-M01..W-M19, W-M0)
- New source rows: 3 slots (W-N1..W-N3; N3 = one per row actually opened)
- Gate/counter: 8 (W-G1..W-G8)
- **Total: 48 items (>= 32 required).**
