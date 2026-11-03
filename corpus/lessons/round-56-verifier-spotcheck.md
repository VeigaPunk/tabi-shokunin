# round-56 verifier spot-check — tabi (non-author closure)

author: hyaku closure (non-author integrator, @m_zfl)

Round: tabi 56, closed 2026-11-03. Baseline `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8` → lane tip
`43d9e0f6f4523059d5ae87139baeba03281c6ffa` (master == origin, `jj-lane.sh state` ahead=0). This
verifier did not author any round byte; every gate/selftest below was **evidence-verified from
committed bytes** (PROTOCOL §Gate standard), never executed; plain counts are the verifier's own.

## Step-1 conformance

- Report `.ufo/reports/round-56/tabi.md` committed in the fleet repo by the lane identity
  `tabi-shokunin <tabi@shokunin.local>` (fleet commit `ad6694518f67cb174e4d9b8a1b076932d449182a`,
  contained in origin/main and origin/master). `## SHONEN` heading count 1; 4 `[~]` lines ==
  SHONEN.md's 4 boxes; no `[x]` written by the lane.
- All seven cited lane commits exist and are ancestors of `master`:
  faee4cb2, 43d9e0f6, ad3e2afdd447094b82eee714544203fb3dce3e32, 3b3c5d77bfb6ac0f5ac3d39e232cda2729f4c0c6,
  909b3892f7f66a55ca9ddc3ad5c93ec069ac1c91, c2aa84479a953ca715945f50fffcaddd5ff30141,
  da151b263a047042749624d9cc4ae2e4026b2b3a (`git merge-base --is-ancestor <hash> master` — branch ref, not `@{u}`).
- Working copy clean (`git status --porcelain` empty); `jj-lane.sh state`: branch=master,
  local=remote=43d9e0f6, ahead=0 behind=0, tracked=0 untracked=0.
- Dispatch evidence matches the digest: watchdog.log:2063 `2026-11-03T14:53:59-03:00 launch tabi
  round=56 pgid=1997866 driver=hyaku-inline attempt=1`; :2068 `2026-11-03T15:41:51-03:00 complete
  tabi round=56; hyaku-inline attempt=1`. No `lane-dead-no-report` line for round 56.
- Prompt fidelity: `.ufo/prompts/tabi-round-56.md` is the canonical `templates/round-prompt.md`
  rendering (lane=tabi, round=56, axes "coverage + calibration (browser and web-interaction
  craft)" — matches `shokunin.conf:58` and the MISSION.md axes framework) plus hyaku addendum
  §6/§7; all five child-lane items and the five round-level contract items are present verbatim.
- Report contract: required sections present in order (Work performed / Landed changes /
  Before → after measurements / Sources & frontier / Trend verdicts / SHONEN); LOG.md round-56
  entry at LOG.md:3554+; LOG.md diff faee4cb2..master is 12 insertions, 0 deletions (append-only).
- Wave shape: w1-results.json declares 12 seats, 12 results, none dead; roles scout1 /
  executor5 / scribe1 / connector1 / reviewer1 / critic1 / mutation-tester1 / sentinel1;
  attack share 3/12 = 25% ≥ 25%; 1 connector ≤ 2. Claims frozen pre-wave: claims.json present at
  the freeze commit ad3e2afd with 2 measured claims (C1 adjacency, C2 coverage-capability), no
  exploratory claim, C1 on the lowest non-retired axis (adjacency 8; nudge inactive — r55
  capability row restarts the window at position 1).

## Per-claim re-check

### C1 — adjacency (VERIFIED → improved)

Evidence-verified from committed bytes (the meter is a lane-owned gate; not executed):

- Before (round-open red control, at `faee4cb2`, committed at freeze ad3e2afd):
  `controls/c1-meter-v15-red-at-round-open.json` → `predicate: false, findingCount: 19`,
  counts {roster 20, mapRows 16, auditRows 16, deltaLanes 12}. Matches the report (19; the
  lane's own critic note that later re-runs drift to 20–21 is disclosed in the lesson).
- Second control `controls/c1-meter-v16-before-rebind.json` → `findingCount: 30` at faee4cb2
  (auditRows 0 / deltaLanes 0 — the not-yet-rebound ledgers), matching the lesson.
- Correction-cycle red: `measure/c1-meter-red-at-correction0.json` → predicate false, **16**
  findings at rev `3b3c5d77` (all 16 delta rows refused by the meter's own sha check), counts
  {16/16/16/16} — matches "cycle 1 of 2, red receipt kept".
- After: `measure/c1-meter-green-at-correction1.json` → `predicate: true, findingCount: 0`,
  counts {roster 20, mapRows 16, auditRows 16, deltaLanes 16}, rev `909b3892f7f6…` — exactly
  the reported green.
- Verifier's own counts over committed bytes at 909b3892:
  `git show 909b3892:corpus/adjacency-host-audit-r56.tsv | grep -c .` → 17 (header + **16 rows**);
  `git show 909b3892:corpus/adjacency-host-delta-r56.tsv | grep -c .` → 47 (header + **16 lane
  rows + 30 line rows**). Both match the report.
- Relabel claim re-derived by the verifier (`difflib` over the two committed meter files):
  v15 logic lines 277, v16 logic lines 277; the only differing non-comment lines are the
  declared rebind set (`AUDIT_REL`/`DELTA_REL` → `-r56`, schema strings `v15`→`v16`, usage
  lines, predicate sentence). "277 logic lines byte-equal on both sides" holds literally;
  committed diff `counters/v15-v16-meter.diff` present at ad3e2afd (8,387 B).
- Self-test evidence: `adj/v16-selftest.json` → schema tabi-adjacency-host-v16-selftest, 16/16.

### C2 — coverage, capability `chromium-keyevent-control-keys-linux` (VERIFIED → improved)

Verifier's own plain measurements:

- Before/after tree: `git ls-tree -r --name-only faee4cb2 -- corpus/evidence/round56 | wc -l`
  → **0**; same at `c2aa8447` → **7**; same at master (43d9e0f6) → **7**. Matches 0 → 7.
- Driver digest pin recomputed: `git show c2aa8447:scripts/chrome-cdp-loopback-round56.mjs`
  sha256 → `26da87bbfcc2eb7034f6815fd48430ce6bd8a12bf5ba21ae766950a840893b7d` == the
  `--expect-driver-sha256` pin in the frozen claims.json target. MATCH.
- Committed receipt `corpus/evidence/round56/chromium-control-keys/receipt.json`: nonce
  `tabi-r56-189d4fd6ffafb77a` (invocation-bound shape), teardown `postKillSweepCount: 0,
  survivors: []`, keys include controlDomain/keylog/plainTrace/serverLog/steps.

Evidence-verified from committed receipts (the counter is a lane-owned gate; not executed):

- `measure/c2-counter-green-at-data.json` → predicate true, findings [] (0).
- Cross-refusals symmetric: `measure/c2-r55counter-refuses-r56.json` → 18 findings;
  `measure/c2-r56counter-refuses-r55.json` → 13 findings. Both match the report.
- Self-tests at the frozen bytes: counter 39/39 (`measure/c2-counter-selftest-at-freeze.json`),
  runner `--path-selftest` 6/6 (`measure/c2-path-selftest-at-freeze.json`).
- Do-nothing control: `w1/R56Counter/do-nothing-absent-receipt.json` (counter refuses an absent
  receipt — the red-before class).

### Axis-harm sweep

`git diff faee4cb2..43d9e0f6 -- SCORECARD.md`: no axis score moved (adjacency stays 8; coverage/
depth/operability/freshness/calibration stay 9); one capability row added
(`chromium-keyevent-control-keys-linux`, first-working 56); planned/saturation blocks updated.
No owned axis harmed. Axes at round start per SCORECARD block match the report (8/9/9/9/9/9).

## Discernment spot-check (LEARNING.md)

Sampled from `corpus/lessons/round-56.md` `## Gate`: 2 admits + 1 reject-class decision; all
three SOURCES rows the round touched were re-opened live by this verifier (fresh curls,
2026-11-03 ~18:40 UTC):

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S083 re-open (drift disclosed, kept as C2's Enter-leg ground) | ADMIT | https://html.spec.whatwg.org/multipage/form-control-infrastructure.html | **agree** | fresh fetch is 466,321 B, sha256 `2e70de25…` == the row's r56 anchor digest (and == r55's byte count while differing from r55's `dc7c3088…` — the drift disclosure is accurate, not fudged); "hitting the \"enter\" key while a text control is … focused … implicitly submits" greps exactly 1 hit at line 2589 in the fresh bytes |
| S153 re-open (`@master` moved, re-verified, kept as transport contract) | ADMIT | https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json | **agree** | fresh fetch is 1,423,170 B, sha256 `d6737c31…` == the row's r56 anchor digest (moved from `f60f0c02…` at 1,421,620 B — sizes/digests match the disclosure); the modifiers description "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8" sits verbatim on `Input.dispatchKeyEvent.modifiers` (verified by JSON parse; 5 file-wide hits, exactly one inside the dispatchKeyEvent command entry — the "1 hit scoped to the command block" phrasing is accurate) |
| S161 re-open (byte-identical) + row digest check | ADMIT | https://www.w3.org/TR/uievents/ | **agree** (one precision nit) | fresh fetch is 920,762 B, sha256 `8ded5eaf…` == the registered anchor digest — byte-identical claim confirmed; line 3264 reads "`<code>true</code>` if the `<code class="keycap">Control</code>` (control) key modifier", so the located line grounds the quote — but the Gate quote elides the `keycap` markup, so it is not a byte-exact substring (routed nit below) |
| audio-shokunin `no-tabi-ground` (one of the five previously-uncovered lanes screened without a delta lane row) | REJECT (coverage adjudication) | `audio-shokunin/PROVINCE.md` at recorded head `f9da7ee9…` | **agree** | province bytes at that head sha256 to `20d881a6…` == the delta row's provinceSha256, 53 lines as claimed, and the three quoted lines (L4 soundtrack, L25 deliverable-is-audio-content, L41 SFX/stem battery) match verbatim; the province owns SFX/soundtrack production — no browser/web-interaction surface, so "no tabi ground" holds and declining a lane row is the correct taste call |

No disagreement found in the sample; nothing left unlearned. Note: the round's `## Gate` records
no fresh-row REJECT because it added no new SOURCES row (three re-opens only); the reject sample
was taken from the delta ledger's coverage adjudications, which are the round's rejection-class
gate decisions. Registry census re-run by this verifier:
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
`tabi ok`, the same 22 pre-existing W04 duplicate-URL warnings (unchanged since r47).

## Per-axis verdicts (closure)

| axis | verdict | evidence |
|---|---|---|
| adjacency | **improved** | meter red 19 → green 0 at the bound revision via the rebind (16 audit rows / 16+30 delta rows verified by the verifier's own counts); meter core byte-identical relabel (277==277); correction cycle honestly consumed with the red receipt kept |
| coverage | **improved** | capability acquisition on a second host class: evidence tree 0 → 7 at c2aa8447, counter green over committed bytes with a recomputed driver digest pin, symmetric cross-refusals 18/13, selftests 39/39 + 6/6 |
| depth | unchanged | no score move; no rubric authorizes one (SCORECARD block) |
| operability | unchanged | instrument selftests stand (16/16, 39/39, 6/6) but no new score-bearing operability move declared |
| freshness | unchanged | S161 re-opened byte-identical; S083/S153 moved and re-verified verbatim — re-checks passed but the freshness score was not moved |
| calibration | unchanged | self-assessments match observed state everywhere this verifier probed (SCORECARD block, SHONEN `[~]` with resolvable pointers); no calibration claim declared |

No axis harmed; every declared claim verifies → **admitted**.

## Trend verdicts (closure, agreeing with the report)

- **expansion: improved** — the key-event control domain now holds on a second host class
  (Linux Chromium 155): evidence tree 0 → 7 verified by the verifier's own ls-tree; capability
  row enters the table first-working 56; knowledge note 71 → 72 whose `source:` cites three
  `mined` rows re-opened this round (S083+S153+S161, all verified live by this verifier).
- **quality: improved** — one correction cycle absorbed a full host change and 16 sibling-head
  movements; red-before receipts kept at every step (19 → 30 → 16 → 0 chain all committed and
  re-read); the v16 generation bump is byte-identical on its 277 logic lines; the N1 class fix
  is an instrument proven red at the r55 close revision (`gate/red-at-545b251d.txt`); no
  admitted entry failed its re-check (S161 byte-identical; S083/S153 drift disclosed and the
  located ground re-verified by this verifier).
- **discernment: improved** — every after-state is an instrument output at a named revision
  (909b3892 / c2aa8442 lineage pinned in receipts); the cross-refusal expectation was corrected
  pre-data and both refusals measured; the meter's OR-mutant survivor (m4) and the cited-receipt
  gate's relative-form gap are disclosed as next-round instrument work rather than smoothed; the
  lane did not self-check its SHONEN boxes. This verifier's outside sample (2 admits + 1 reject
  + 3 live re-opens) agrees with every sampled gate decision.

## Routed defects (the lane fixes these next round)

1. **Meter selftest must assert the emitted `predicate`** (R56Mutant m4 survivor: AND→OR
   undetectable at all-red/all-green states) — the lane already routed this; v16 stays frozen,
   the v17 generation ships the asserting selftest case.
2. **Cited-receipts gate widening to relative-form citations** (R56Gate-F1: SCORECARD:3145 and
   lesson:67 receipts are invisible to the full-prefix rule) — explicit next-generation
   instrument decision, never a silent edit.
3. **Wave-4 quarantine-first duty OWED** — hand-check all 39 tabi data rows in
   `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
   (verdict per row) BEFORE any `merge/tabi/` adoption; adoption stays closed until then. Named
   by the lane as the next round's opening item; this closure holds it open.
4. **L0 `tabi | round-44`** (the L2-floor/AgentSwarm question) stays OPEN — routed around via
   the inline spawn handoff (12 seats in one batched wave). Never treated as answered.
5. **SOURCES.md N4 pattern** (in-place anchor-cell digest appends ride outside the strict v1
   columns) — disclosed by the lane; the operator/aggregator superseding-row ruling remains
   pending and is carried, not newly raised.
6. **Report prose nit (status-neutral):** the report says "executor×4 (one is the labrat-class
   probe)" but w1-results.json records **5 executor seats** (R56LabProbe, R56Runner, R56Counter,
   R56Adj, R56Gate); totals (12), attack share (3/12) and dead seats (0) are unaffected.
7. **Quote-precision nit (status-neutral):** quote located lines byte-exactly, including inline
   markup (`<code class="keycap">`), so a re-open can grep the quote as a literal substring.

## Operator note (promotion is operator-owned)

All four SHONEN boxes are asserted `[~]` with resolvable pointers, and this verifier exercised
box-2/3/4 evidence directly (end-to-end C2 receipt + counter green; agent-runnable selftests
6/6 and 39/39 over committed bytes; PROVINCE accuracy re-checked via the overlap dispositions;
SKILL.md carries the §Runbook / §Evidence ladder / decision aids). The boxes look checkable by
a non-author reviewer under the promotion gate; per protocol that `[x]` writing is a
non-author promotion review, operator-owned — flagged here for the operator.
