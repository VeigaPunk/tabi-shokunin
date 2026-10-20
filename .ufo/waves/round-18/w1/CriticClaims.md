VERDICT: ISSUES

CriticClaims — falsification review of the round-18 declared claims in
`.ufo/waves/round-18/PLAN.md` before they land. Each claim gets accept | accept-if | reject
with the strongest counter-argument, what it does to the axes, and the smallest safe
correction. Local evidence only; nothing was executed (critic seat, read-only).

Axes (from `/home/vgpnk/Projects/shokunin/AXES.md`): depth, coverage, operability,
freshness, calibration, adjacency. Scalars at B (SCORECARD.md:783-790): depth 8,
coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. The lowest
non-retired tie is {depth, operability, freshness, adjacency} at 8; C1 (freshness)
and C2 (operability) each name a tied-lowest axis, C3 names calibration (9). Three
claims, three distinct axes — the AXES.md distinct-axes rule is satisfied. At least
one lowest-axis claim is present; no waiver needed (round 18 is window position 1
after the round-17 capability, PLAN.md:11).

## C1 — freshness, source rechecks 0 → 51 — **accept-if**

**Strongest "padding" argument (this is the claim's real vulnerability):** nothing is
due. Every SOURCES row was opened 2026-10-19 or 2026-10-20 (column `opened`,
corpus/SOURCES.md:15-71); every `recheck` cell is a forward interval
(`on-release`/`90d`/`180d`/`365d`), and `check-sources.mjs:315-322` validates only the
cell's format — no gate computes or enforces a due date. The SCORECARD.md:770 line
"re-verify S001–S019 90d/on-release rows due" described intent, not an enforceable
overdue state. A 51-row sweep 1–2 days after opening is early-by-construction
hygiene, not drift response.

**Vacuous-receipt subset (the count's soft underbelly):** a large minority of the 51
receipts verify things that cannot drift:

- ~15+ rows pin immutable anchors — git tags (`refs/tags/154.0.8037.97` in S033,
  S034, S041, S042, S044, S045; tag `v0.45.1` in S049/S055, S050/S056; tag `2.56.0`
  in S051, S052) or commit-pinned blobs (S036, S043, S046). `held` is structurally
  guaranteed modulo URL availability; the receipt proves the fetch tool works and the
  link is not rotten — weak but real signal, not zero.
- S029 is `own-work` (a committed receipt, hash-pinned; contract special-cases its
  `rowUrl` as a repo path). Re-fetching a committed file for "freshness" is vacuous:
  it verifies working-tree integrity, which git already guarantees.
- ~8 non-mined rows teach nothing currently relied on: `queued` S021, S022, S051,
  S052, S055, S056 and `rejected` S026, S027, S038, S040 (plus S057, rejected and
  itself superseded by C3's D4 in the same round — see cross-claim note). Their
  receipts check registry hygiene, not skill-claim freshness.

So roughly 20 of 51 receipts (the living-page rows: S001, S002, S005–S017, S020,
S025, S028 main-branch, S030–S032, S035 main, S037, S047/S048 docs, S054, S057)
carry the real freshness load. The claim is *not* mis-axed — AXES.md:14 defines
freshness exactly as "skill claims re-verified against live surfaces," and the
receipt contract (PLAN.md:67-77: verbatim rowUrl, quote-containment after
normalization, producer-pinned `recheck-fetch.mjs`, `held`/`drift` verdicts with
mandatory supersession rows, `--live` second-fetch) is a rigorous instrument —
lane precedent exists (corpus/knowledge/source-recheck-round-12.md, same-day
rechecks of S028/S011/S013/S017). For `on-release` rows the sweep is the only
mechanism that would catch a silent upstream release.

**Accept if:** (a) the SCORECARD row records scalar **8→8** — the count measures
sweep volume, not detected drift, and early-by-construction rechecks should not move
the scalar on their own; (b) the round report or counter output breaks the 51 down
by row class (living vs pinned vs queued/rejected vs own-work) so a judge can weight
them; (c) `drift` verdicts actually produce superseding rows per the contract.
Reject only if the claim tries to move the scalar on receipt count alone.

**Smallest safe correction:** exclude S029 (vacuous by construction) and mark
queued/rejected rows as hygiene receipts in the counter output — keeps the count
honest without shrinking the sweep.

## C2 — operability, harness/witness hazards 0 → 6 — **accept-if**

**Strongest "mis-axed" argument:** a new harness file looks like coverage (round 17
scored `webmcp-invoke-round17.mjs` under coverage, SCORECARD.md:786), and F6 is a
freshness-gate repair. Counter: the hazards are correctness-of-run defects, not new
surface — H1 makes the script emit a `verdict=fail` receipt for an *external* abort
(SentinelHarnessAfter.md:17-27: SIGTERM at 5 s produced failed cases, a post-signal
browser launch, and a fail receipt), which is precisely operability's "runs and
produces the *stated* outcome" (AXES.md:13). F6 is a runnable wrapper that makes the
frozen `check-freshness.mjs` safe to invoke (it refuses `HEAD`/symbolic refs) —
operability of the freshness gate, not a freshness-surface move. Axis choice is
defensible; the alternative homes (calibration for verdict honesty) would
double-count the same fixes.

**Padding risk is low but present:** the "6" bundles two distinct defect classes —
harness robustness (H1–H4, S1) and the F6 anchor-hazard — counted under one scalar.
That is honest only because each is independently red-at-B/green-at-REV by a
counter-owned behavioural probe (PLAN.md:79-89); if any probe is demonstrated only
at REV it does not count.

**Hidden-regression check (the real acceptance gate):** H3 replaces the TCP DevTools
port with Playwright's pipe (`context.newCDPSession`), and S1 merges feature
switches — both change the invocation transport/flags under which the round-17
receipt was earned. The sentinel's own probe (`SentinelHarnessAfter.md:50-51`) got
`WebMCP.invokeTool` working over the pipe, so feasibility has non-author evidence.
But if `webmcp-invoke-round18.mjs` lands with fewer passing cases/controls than the
11/11 + 4 of the round-17 receipt, the live capability regresses while the committed
receipt stays green — a trade, which AXES.md:34-35 forbids.

**Also flag (harm risk, not claim defect):** H4's download fixture and H2/H3 probes
must stay inside the seat rules — loopback fixture only, temp profiles, never port
9222, never the user profile. The contract's probes (fresh TMPDIR per run, argv and
DevToolsActivePort scans) are consistent with that.

**Accept if:** (a) the new harness reproduces ≥11/11 cases + 4 controls under the
new transport — the retained-coverage floor; (b) every one of the six probes is red
on the B artifact and green at REV (the plan's sandbox-at-both-revisions design does
this — keep it); (c) round-17 harness stays byte-frozen as declared (PLAN.md:33-34,
byte-frozen list :55).

**Smallest safe correction:** add a counter assertion `cases_passed >= 11 &&
controls_passed >= 4` on the REV receipt so the coverage floor is checked by the
same command that scores the claim, not by reviewer vigilance.

## C3 — calibration, routed defects 0 → 5 — **accept**

This is the strongest claim. All five defects were filed by the non-author round-17
spot-check (round-17-verifier-spotcheck.md:157-165) with "status-neutral; lane fixes
next round" — closing them *is* the routed-defect contract, and calibration (AXES.md:15:
"self-assessment quality … overreach caught") is the correct axis for corrections to
the lane's own records. Verified against local state:

- **D1 real:** adjacency.tsv has exactly 6 distinct `sibling` values (kaidoku,
  revenger, kake, kagi, kumitate, kama — counted above), vs "7 siblings" in the
  round-17 report/lesson. The counter independently re-counts rather than trusting
  the correction (PLAN.md:93-95). Correct placement: the round-17 lesson is
  byte-frozen; `## Corrections` in the round-18 lesson is the only available
  mechanism.
- **D2 real:** the 20-gate harm set exists at `harm-baseline.json` (20 gate entries
  confirmed; spot-check: 19×0, 1×1 USER round_count) and was measured at `6c97851`,
  not the measured `93bfead`. A receipt at the exact measured revision closes a real
  evidence gap — it is a *measurement* repair, not a knowledge repair, which is why
  it is the weakest of the five, but the defect was filed, so closing it counts.
- **D3 real:** `check-adjacency.mjs --self-test` exists (script :1128-1130,
  :1298-1310 prints `ADJACENCY_SELFTEST verdict=… cases=…`) and its only prior
  evidence was a wave-report line. Producer-sha pinning to the blob at 93bfead is
  correct.
- **D4 real:** S057's *anchor* cell still carries "Offered by François Beaufort
  (individual publisher)" (SOURCES.md:71); its teaches cell already says "developer
  Google Ireland, Ltd." — so the falsified premise is confined to the anchor, and a
  superseding S058 with no "individual publisher" in any cell is the established
  append-only correction mechanism (S054–S057 precedent).
- **D5 real but ironic:** re-running the round-17 harness 7× to get full digests
  re-executes the artifact C2 exists to declare hazardous (open DevTools port, no
  download refusal). That is not a contradiction — D5 preserves evidence of the old
  artifact, C2 builds the new one — but the reruns MUST stay loopback/temp-profile
  per seat rules, and their receipts will legitimately record the hazardous argv.

**Weakest argument for rejection:** calibration is already the lane's highest axis
(9), and closing defects the lane was *told* to fix is follow-through rather than
improved self-assessment — arguably operability-adjacent chore work. Rejected: the
spot-check explicitly routes these as defects for next-round repair, and honest
correction of the lane's own committed record is the canonical calibration signal.
Scalar stays 9→9.

**Accept if:** counter pins hold exactly as written (producer sha256s, full 64-hex
digests, receipt-bytes match for D5) — the contract already requires this; no
correction needed.

## Cross-claim findings

1. **Double-handling of S057 (minor inefficiency, not a defect):** C1's 51 includes
   S057 (superseded set is at-B only), while C3's D4 supersedes it in-round. The
   contracts are consistent (C1 checks at-B supersession, C3 adds an at-REV row),
   but a recheck receipt for a row being superseded the same round is ceremonial.
   Tolerable; a judge may discount it.
2. **Separability holds.** C1 writes `corpus/evidence/round-18/source-recheck/**` +
   drift-supersession rows; C2 writes two new scripts + new S059+ rows; C3 writes
   `routed/**`, S058, lesson corrections. Disjoint path sets, distinct axes — each
   verifiable without the others (AXES.md:30-32). One latent ordering: if C1 lands
   `drift` on a row C3 also touches, supersession text must not collide in
   SOURCES.md — append-only integration by L1 handles it.
3. **Claim-type check:** no exploratory claim; all three are counted with named
   counters. The "0 → N" framings are honest since every counted input is absent at
   B (verified: no `corpus/evidence/round-18/`, no `webmcp-invoke-round18.mjs`, no
   `freshness-witness.mjs` in `scripts/` at the lane tip `2bff864`).
4. **Axes harmed?** None on the plan face. The two real cross-axis risks are C2's
   coverage floor (above) and C1's fetch load (51 live GETs — public, read-only,
   consistent with seat rules).

## Summary table

| Claim | Axis | Verdict | Key condition |
|---|---|---|---|
| C1 source-recheck 0→51 | freshness | accept-if | scalar 8→8; count broken down by row class; S029 vacuous |
| C2 hazards 0→6 | operability | accept-if | ≥11/11+4 controls retained on new transport; red-at-B per probe |
| C3 routed 0→5 | calibration | accept | contract pins as written |

No installs or upgrades were performed (none needed; pacman transactions paused per
guard). No lane writes outside this report; no git writes; only read-only git
(`log`, file reads) used. Lane tip observed: `2bff864fdfee684ddbcd066cc8e735adaba2735c` = B.

Files written:
- .ufo/waves/round-18/w1/CriticClaims.md
