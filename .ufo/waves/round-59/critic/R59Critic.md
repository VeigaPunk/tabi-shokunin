# R59Critic — claim-design falsification verdict (tabi round 59, wave w1)

Seat: R59Critic (critic). Scope: attack C1/C2 SIZING and design, pre-data, against the frozen
claims.json (read first; freeze commit dd337bb3 + the L1's preDataCorrection of 2026-11-03).
No data pass has run; nothing here is a post-data amendment. All findings below are
instrument-freeze pins or pre-data disclosures routed to the L1 (agent://TabiR59, delivered
2026-11-03). Leaf seat: no subagents, no background jobs beyond one timed-out grep (bg_3668,
completed, output used). Full command ledger and sha256 receipts: `w1/R59Critic.md`.

## Verdict

**C1: WORKABLE after the L1's pre-data correction — conditional on three instrument-freeze
pins (P1–P3 below).** The corrected counts {roster 20, mapRows 16, auditRows 16, deltaLanes
20, bgScreenSiblings 20} are command-derivable and the trio's D8 ground is real at today's
heads. But as the declared change set (d)/(e) is literally worded, a MIXED forgery — real
rows for real hits PLUS junk rows quoting non-hit lines of screened files — greens with
findingCount 0 and satisfies all three greps. The gap closes only if the meter generalizes
v18's FULL row-validation body to all 20 lanes and the selftest proves it for a newly
screened lane.

**C2: SOUND except one kill-rule clause — the synthetic-green clause is unbounded and, as
written, fires on a property no byte-verifying counter can satisfy.** It needs a pre-data
scoping (forgery-probe shape list or rewording to the enumerated defended classes, residual
disclosed). This is a kill-rule text change: per the freeze rule it must land pre-data as a
disclosed correction (the preDataCorrection precedent), not post-data.

**Kill-rule hygiene (both claims):** one decoration clause (C1 "only path to green"), one
self-attested clause (C1 diff audit), one unpinned mapping (C1 M1..M5 ↔ routed defects), one
non-byte-observable wording (C2 "driver-side state"). Details in §3.

## 1. One-command derivability of the after-states

- C1 primary value (exit 0 / predicate true / findingCount 0 / counts): ONE node command over
  committed bytes at the data revision — derivable. The corrected counts are consistent with
  the live round-open receipt (`controls/c1-meter-v18-at-round-open.json`: roster 20,
  mapRows 16, auditRows 16, deltaLanes 16 at r58; v19's declared changes move deltaLanes to
  20 and add bgScreenSiblings).
- **bgScreenSiblings is command-derivable but its DEFINITION is unpinned, and the two
  candidate definitions diverge empirically.** Read as lanes-SCREENED (structural) the honest
  value is 20 == counts.roster. Read as lanes-with-≥1-enumerated-hit the honest value TODAY
  is **12**, and it is content-dependent on sibling repos the tabi lane does not own. Pin the
  structural definition at instrument freeze (P1), else the frozen constant is either
  unfirable (20 unreachable) or wrong (12 ≠ 20).
- **"At least one line row per lane" — row existing ≠ row RIGHT, and findingCount 0 closes
  the gap ONLY under the generalized check set.** v18's delta loop already validates BOTH
  directions for its delta lanes: hits→rows (`delta-line-missing`), quote == whole hit line
  (`delta-quote-not-whole-line`), disposition in the frozen vocabulary
  (`delta-disposition`), rows→hits (`delta-line-invented`), and sha/lines/bgHits/head
  equality. The frozen (d)/(e) text names ONLY hits→rows (`bg-hit-unadjudicated`) plus
  orphan/unscreened-file. Under the literal reading, a junk row quoting a non-hit line of a
  screened file passes (e) (lane has a lane row; relPath was screened) and passes (d) (every
  real hit still has its row), so it greens while the grep counts it as the D8 proof. L1's
  irc answer ("a vacuous row alone cannot green") is correct for the all-junk case — real
  hits demand real rows — but the MIXED case is the live hole. Tightening (P2): run the full
  validation body for all 20 lanes; selftest gains invented-row + quote-whole-line + head
  cases for a NEWLY screened lane, kama-shaped (map-referenced file, not PROVINCE.md).
- Selftest floor: v18 carries exactly 20 cases (counted: 20 `{ name: '` entries); the frozen
  ">= 28: v18's 20 carried + declared new cases" with the exact count pinned at instrument
  freeze is sound.
- C2: each sub-value is one command over committed bytes (ls-tree | wc -l; counter --json;
  two cross-refusal commands). The PNG-count pin rides the driver path-selftest at freeze —
  inside the freezeRule's pinned-at-freeze allowance. No defect.

## 2. Do-nothing controls vs the cheapest skipping controls

- **C1 — cheapest skip: rebind-only.** Re-bind the r58 ledgers at fresh heads and keep v18:
  v18 goes green (the four moved-head findings re-bind away) with NO v19, NO selftest
  extension, NO D8 rows. The frozen do-nothing control (v18 red at round open, 4 findings)
  does NOT block this path — it only witnesses the before-red. What blocks rebind-only is the
  after-state's own identity: the command names the v19 generation, counts demand
  bgScreenSiblings and deltaLanes 20, and the three greps demand trio rows. Second skip:
  "v19" as v18 + hardcoded counts and no new checks — blocked only by the selftest floor, the
  M-kill receipts, and the diff audit, the last of which is SELF-ATTESTED (authored by the
  meter seat; no seat is assigned an independent v18→v19 re-diff). Routed: consider
  R59Reviewer for the independent re-diff.
- **C2 — cheapest skip: offline forgery.** Write receipt.json + PNGs without launching a
  browser. The frozen control (r58 counter refuses an ABSENT receipt) proves refusal of a
  missing file only; it does not touch forgery. The implementing checks raise the bar
  materially — the r58 counter already re-derives pageKeylog from the nonce entry-by-entry,
  and r59 adds D1 blocks-vs-keylog by value, D2 steps-vs-declared-list, the sha pin,
  single-submission counts, and schema cross-refusals — but every ground is receipt-internal
  or public-algorithm. A fully-informed, fully-consistent forgery therefore greens ANY
  byte-verifying counter. The kill clause converts that residual into a claim-death condition
  ("a forged-but-consistent receipt that still greens is a kill"), which is unbounded:
  any under-defended deviation a mutation seat finds kills C2. Fix pre-data (P3 in the L1
  message): pin the forgery-probe shape list with kill receipts (C1's M-receipt pattern), or
  reword to the enumerated defended classes and disclose the residual — a byte-perfect
  replica of a genuine receipt is indistinguishable by construction; genuineness rests on the
  L1 live pass and committed provenance.

## 3. Kill-rule asymmetry audit (R58-S1 class = a clause that cannot fire on any instrument behavior)

C1:
- "v19 selftest does not all-pass" — fires on a failing case. LIVE.
- "any kill receipt shows a surviving mutant" — fires on a SURVIVED verdict. LIVE.
- "diff audit names a differing logic line outside (a)-(e)" — fires only if the author's own
  audit discloses it; an incomplete audit never fires it. SELF-ATTESTED, weak as an
  instrument check; compensate with an independent re-diff.
- "meter stays red after 2 correction cycles" — fires live. LIVE.
- "the only path to green is editing a ledger row to match bytes not at the snapshot head" —
  names a hypothetical path, not an observable event; no instrument output can fire it.
  DECORATION (R58-S1 class) in the instrument sense — it binds the L1's behavior only. Its
  observable sibling is the next clause.
- "a newly screened lane's line row cites bytes not at the snapshot head" — fires via the
  generalized head-equality check (v18 `lane-screen-head-mismatch`), PROVIDED the selftest
  carries the case for a new lane (part of P2). LIVE once generalized.
- "a findings-term drop survives the harness guard (N1)"/"an orphan or unscreened-file line
  row passes (N4)" — fire via mutant-meter receipts. LIVE, but the M1..M5 ↔ routed-defect
  mapping is unpinned in the frozen text; pin it at instrument freeze and include a
  SCREEN-WEAKENING mutant (BG_WORDS gutted or screen scope shrunk): D8's strength rests
  entirely on the screen's enumerating power and no current clause covers vocabulary shrink.

C2:
- "counter green on anything but the committed receipt (…forged-but-consistent…)" —
  UNBOUNDED; fires on any under-defended forgery; unsatisfiable against a perfect replica.
  Needs the pre-data scoping of §2.
- "driver sha does not match the freeze pin" — fires via --expect-driver-sha256. LIVE.
- "witness rests on driver-side state instead of page/server state" — not byte-observable as
  stated (both keylog and blocks are receipt bytes; there is no independent page channel in
  committed bytes). Its enforceable form is the parenthetical mutant test (a forged/stripped
  keylog must trip). Reword to the mutant-receipt firing path.
- "keylog lacks the latch sequence" — fires via the sequence check. LIVE.
- "more than one submission reaches either form's endpoint" — fires via per-endpoint count
  checks (receipt must carry them). LIVE once implemented.
- "D4 positive control absent" — fires via the required /echo2 witness. LIVE.

## 4. The D8 new-surface bar

**The bar is genuine — not vacuously passable — but only under P2.** Empirical ground,
re-derived independently by me at the CURRENT sibling heads (matching R58Reviewer A4/N3's
live numbers): kagi PROVINCE.md 3 BG hits; kake PROVINCE.md 45 + SKILL.md 19; kama
corpus/knowledge/listener-census.md 5 (kama PROVINCE.md 0 — kama's D8 row MUST cite the
map-referenced file, so the rebind screen must include map-referenced files exactly as (d)
says). The before-grep is true (baseline r58 delta: 0 rows naming the trio, 16 lane rows) and
the trio were previously map-covered WITHOUT any BG screen — a verifier-scope novelty, which
is what the r58 D8 defect demands.

**The landmine the correction introduced:** EIGHT of 20 siblings are zero-hit across their
whole v19 screened set — chousa, kasegi, kotodama, kumitate (province 0 AND SCORECARD.md 0),
lore, mori, souji, tameshi. An honest rebind gives them lane rows with bgHits=0 and ZERO line
rows; ANY line row there fires `delta-line-invented` and reds the meter toward the
2-correction-cycle kill. The L1's irc derivation "every sibling holds >= 1 line row under
(d)" is FALSE for these 8 lanes; deltaLanes 20 survives because it counts LANE rows (and the
clause that actually forces lane rows for all 20 is P2 roster coverage — the map covers only
6 lanes: kaidoku, revenger, kake, kagi, kumitate, kama — not (e), which mandates lane rows
only for lanes holding line rows). Routed to the L1 so R59Rebind's plan does not pad.

## Disposition

All findings delivered pre-data to agent://TabiR59 (2026-11-03). No claim text amended by
this seat; no instruments edited; no data produced. Required pre-data actions, all on the
L1's authority: the P1–P3 instrument-freeze pins (§1/§3), the C2 synthetic-green scoping
(§2), and the rebind no-padding instruction (§4). Do-not-commit honored: this seat writes
only .ufo/waves/round-59/critic/ + w1/ + scratch.

---

# ADDENDUM (2026-11-03, still pre-data): verdict on the RESTATED C2

Pre-final sha of this file before this addendum:
ffb066e38ad8dcb66e652bd05adfa2a0cc3848f090b3f320bd32fc0b5e245f29. Trigger: the L1's message
— all four pins applied (a40822d9 + 03f64a39), and C2 restated as the measured-negative
delivery-boundary claim after R59Runner's live probe (CDP delivers CapsLock events —
cancelable true, keyCode 20 — but the caps bit never sets; S162: CDP's GetEventModifiers
maps bits 1/2/4/8; Blink's kCapsLockOn = 1<<9). Re-read: claims.json C2 + killRules.C2 +
preDataCorrection.{c2Restatement,criticPins,ground} in full.

## Verdict on the restated C2: SOUND — better sized than the original

The original after-state (latch sequence false→true→held→false) was UNREACHABLE on the
declared surface; letting it die at data (option B) would have destroyed the knowledge the
r57 residual was after. The restatement converts it into the honest closure: the boundary is
measured from BOTH sides (delivered-shape witnesses prove the events DO deliver; the
persistent absence witness proves the latch flag does NOT set), the mechanism is two-sided
(S162 for the CDP side; Blink side — see R4), option (C) (Xvfb/uinput) is correctly deferred
as a new surface = a new claim. The kill-rule set is now fully firable: f1–f8 each name an
instrument-observable deviation with a kill-receipt firing path; the byte-perfect-replica
residual is disclosed IN the frozen rule; the driver-side-state clause fires through its
mutant receipt. NO decoration clause remains in C2 — my overbreadth finding is resolved by
the enumeration + disclosure. The latch-sequence attack line from my main report is moot by
design.

## The two questions the L1 posed, answered

**Is the absence witness forgeable?** Only at the perfect-replica level (disclosed residual —
same epistemic status as every committed-bytes claim). But the restatement introduced an
UNdisclosed indistinguishability: "caps false everywhere" is also exactly what a
BROKEN or UNWIRED recorder produces (constant-false readback, wrong argument, recorder never
running while the driver fabricates entries). The r58-carried nonce derivation binds entry
SEQUENCE/shape, not the recorded getModifierState VALUES; f4 (D1 by value) binds blocks vs
keylog, both receipt-internal; the D4 /form2 submission witness proves chord DELIVERY, not
getModifierState wiring (submission can succeed with the method never consulted). The
all-false pattern is the EASIEST to fabricate or to produce accidentally — the check set
currently requires NO flag to read true anywhere in the run.

**Is 'delivered shape' complete?** Nearly. The CapsLock tuple (key, code, keyCode 20,
cancelable true, defaultPrevented false) is well-chosen — defaultPrevented false
self-protects against an accidentally-on swallower. Two gaps: the event `type` is not in the
tuple (keyDown+keyUp TWICE = 4 events; without type, 4 downs pass f6), and the letters leg
lost its independent delivery witness (the original claim's DOM field-value readback after
EVERY keystroke is gone from the restatement — the letters are now witnessed only by the
receipt's own recorder, self-referential; no server-side channel exists for them).

## Remaining pre-data asks (instrument-freeze pins; routed to the L1)

- **R1 (load-bearing): MANDATORY DETECTOR-POSITIVE.** Add a Shift leg whose page-recorded
  events MUST read getModifierState('Shift') == true — CDP's own ground (S162) maps bit 8,
  so the surface can flip a modifier the method reads; the counter asserts it (finding if
  false) and a kill receipt (call it f9) proves a constant-false recorder FAILS. The
  differential — bit 8 flips, 1<<9 does not, same method, same modifier state word — is what
  makes "CapsLock false" a measured boundary instead of a dead recorder.
- **R2:** add `type` (keydown/keyup) to the delivered-shape tuple and the f6 check.
- **R3:** restore the DOM field-value readback after every letter keystroke (driver +
  counter check), or disclose the letters leg as receipt-internal-only.
- **R4:** the Blink half of the mechanism (kCapsLockOn = 1<<9; getModifierState('CapsLock')
  tests it) carries no S-anchor — S162 covers only CDP's GetEventModifiers. Extend the
  source (WebInputEvent.h key-state table) or mark that half as the probe's interpretation.
  With R1 in place the measurement stands regardless of the mechanism text.
- **R5 (note, no change):** the probe receipt is committed but the probe script is
  scratch-ephemeral; the re-derivable instrument for the negative is the committed 18-step
  driver at data time. Round report should mark probe-capslock.json as corroborating
  pre-data evidence, not the primary ground.
- **R6 (note, no change):** f5 as the falsifier is correct as designed — an environment
  caps-leak would honestly kill the claim; that is the kill rule working.
