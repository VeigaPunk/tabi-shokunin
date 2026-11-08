---
author: hyaku closure (non-author integrator, @m_zfl)
round: 91
lane: tabi
measured_at: 2026-11-08T22:50:31Z
lane_head: 878bc9125b858653615516c804769ef292bb4b4f
base: b1d8f07b0d5895ffdd5bf9a143d2b591414fabea
---

# tabi round 91 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this
file. Nothing below amends a lane-authored file; defects are routed for the lane's next round.

Driver digest (copied from `.ufo/watchdog.log`): launch r91 attempt 1 12:28:52 → lane-dead-no-report
13:22:38; attempt 2 launch 13:22:42 → lane-dead-no-report 13:23:19; attempt 3 launch 13:23:24 →
complete 13:38:14 (all -03:00, driver hyaku-inline).

## 1. Step-1 conformance

- **Report landed by the lane.** `git log --format='%an %H' -- .ufo/reports/round-91/tabi.md` →
  three commits, all `tabi-shokunin`: `cb1f2d35` (13:33:24, first filing), `49c70103` (13:35:15),
  `2beeaeb2` (13:41:39). 21,494 B; `## SHONEN` heading with one line per box (4 boxes, all `[~]`).
- **Defect (filed-record rewrite).** `49c70103` and `2beeaeb2` rewrite the filed report's bytes in
  place (lane tip, seat counts "twelve → thirteen", dead seats "1 → 0", ledger "22 rows → 18 data
  rows"); PROTOCOL §Round-robin: a filed report is corrected by an erratum appended after the filed
  bytes, never a rewrite. `2beeaeb2` also lands after the driver's `complete` line (13:38:14).
- **Defect (lands last).** Lane commit `878bc912` (the orchestrator's `w1-results.json` + LOG note,
  written 13:36) postdates the first filing; the report was then rewritten to cite it rather than
  carrying an appended addendum only. Disclosed in the report's addendum; status-neutral.
- **Cited commits.** `249b7d0c 21e14593 df4ef1fc a60d2f75 7c59b264 f3f11579 878bc912` all exist and
  are the seven commits of `git log b1d8f07b..878bc912`; `git branch -a --contains 878bc912` →
  `master`, `origin/master`.
- **Lane state.** `jj-lane.sh state` → `branch=master local=878bc912… remote=878bc912… ahead=0
  behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty.
- **Prompt contract.** `.ufo/prompts/tabi-round-91.md` (142,087 B) carries SHONEN (5 hits), the
  report path (3), "commit … inside your lane repo, then push" (`:133`), push scope (2), write
  scope, hash citation, L0 (15), AgentSwarm, `MISSION.md`/`AXES.md`, and the hyaku addendum.
- **Not a marker:** real report with checkable commits → status `ok`.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 91` →
`PREFILE-FALSIFICATION: pass claims=2 rows=18 attack_seats=6 findings=0`, exit 0. Ledger
`.ufo/waves/round-91/claim-falsification.tsv`: 18 data rows over 13 seats; every
`falsifies-wording` row (Sentinel C1/C2, Critic C1/C2, Simplifier C2) names a narrowing. The
falsifying rows are real and unreconciled at the claim level: the lane itself grades both claims
NOT VERIFIED as written, and the re-checks below confirm the counterexamples. The R91Connector row
(`neutral`; same-site 127.0.0.1-other-port, not OOPIF) is not spurious: the claim says
"cross-origin", which a different port is; the narrowing binds the capability row, not the claim.

## 3. Per-claim re-checks (plain measurement on committed bytes at `878bc912`; no sibling gate executed)

**C1 — coverage, `chromium-showpicker-proxy-linux` (evidence-verified + re-measured).**
- `jq '{nonce, legs:(.legs|length), failures}' corpus/evidence/round91/chromium-showpicker-proxy/receipt.json`
  → `tabi-r91-l1-1d073adc0b8d`, 15 legs, `failures: []` (matches report).
- `sha256sum` of all nine `claims.json` C1 pins (driver, counter, battery, kill power, gate runner,
  drift gate, probe4, probe5, prior-set) → 9/9 equal (`343eb0f2…`, `f2f052f2…`, `6475f056…`,
  `570cffbf…`, `988c18e5…`, `e2e51c6b…`, `12b5ae6f…`, `2d76b87d…`, `78ffc632…`).
- Committed gate evidence `scored/selftest.json`: counter-selftest exit 0; counter exit 0
  `checkCount 30`; battery exit 0 44 cases; kill power exit 0 32; drift-selftest 8 cases — matches
  the report; **`revision: null`** (the gate-run verdict does not name the revision it measured —
  §Gate standard "Two evidences" defect). `w1/R91Exec2-killpower.json` → 32/32/0/0/0.
- Controls: `scored/control-noreceipt.json` → `receipt-unreadable`; `control-proxy-flip.json` →
  `law, prior-set, proxy-law`; `control-post-removed.json` → `plan-calls, send-log-allowlist`;
  `control-r90-under-r91.json` → findings incl. `schema`. Matches.
- **Counterexample re-derived:** `grep -n hasBeenActive scripts/check-showpicker-proxy-round91.mjs`
  → one hit (`:137`, the driver-side expression string); the `activation-law` block (`:363-373`)
  compares only `.isActive`. `w1/R91Critic-c1-hasbeen.json` → `verdict clean, checkCount 30` with
  `hasBeenActive=false` on the parent-click arms. The C1 sentence is wider than what the counter
  binds. **C1 does not verify as written** (agree with the lane).

**C2 — calibration, six lane-measurable r90 routed defects (re-measured by plain grep).**
- `scored/drift-before.json` → `checkCount 8`, 8 findings; `scored/drift-a.json` → `checkCount 8`,
  0 findings, `revision 21e14593fd4a…`. Matches report.
- Plain re-derivation at `878bc912` of the r90 spot-check §8 items: (1) `grep -c
  'plan-calls.\{0,40\}forbids'` → 0 in the r90 note, `LOG.md`, `corpus/QUALITY.md`; note `:22` now
  names `send-log-allowlist`; (2) `plans/round-90.md:107-108` carries 225 preflight / 226 final;
  (3) `corpus/lessons/round-89.md` +23 lines appended, `QUALITY.md:1064` row 164 supersedes 161;
  (5)/(7) `corpus/lessons/round-90.md:85,91` names the D4 worktree and §Wave corrections;
  (8) `round-89.md:134-139` marks the 31-word S224 quote. The record bytes are repaired 6/6.
- **But the counting instrument fails as a meter:** `scripts/check-record-drift-round91.mjs:55-68`
  statement 1 tests only the presence of `send-log-allowlist` and one regex, so a retained false
  attribution beside it passes; `w1/R91Critic-c2-tautology.json` → `verdict clean, checkCount 8`
  over four injected violations; R91Mut1: `--selftest` kills 4/13 clause mutants. Item 6's
  lane-writable half stays uncorrected (`corpus/lessons/round-89.md:117` "(the committer time)").
- **Append-only defect in the repair itself:** items 1–2 were repaired by rewriting `LOG.md:4079-4086`
  (the r90 entry) and `QUALITY.md` row 163 in place (`git diff -U0 b1d8f07b 878bc912 -- LOG.md
  corpus/QUALITY.md`), while row 164 added the same round says a criterion is "never rewritten in
  place". The r90 spot-check's "mark or rewrite" wording licensed it, but PROTOCOL §Round-robin
  (append-only `LOG.md`) and LEARNING (QUALITY rows superseded, never rewritten) outrank it.
  **C2 does not verify as written** (agree with the lane).

## 4. No-harm check

`git diff b1d8f07b 878bc912 -- SCORECARD.md` → additions only (0 deleted lines); no axis score
lowered; 161 files changed, 14 deletions total, all in the record repairs above
(`LOG.md` 3, `README.md` 4, `QUALITY.md` 1, `SOURCES.md` 1 = S219 `used-by` re-open,
r90 note 4, `plans/round-90.md` 1). No previously green instrument went red. The in-place record
rewrites are a conformance defect, not an axis harm.

## 5. Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| coverage | unchanged | C1 NOT VERIFIED: receipt real (15 legs, 0 failures, 9/9 pins, reproduced twice by R91Exec1) but the stated capability is wider than the counter binds (`hasBeenActive` unread, same-origin colour never proxied, law-2 proxy arm has no leg) and the cross-origin arm is same-site, not OOPIF |
| calibration | unprovable-but-better | named non-author ruling: plain grep shows 6/6 routed record defects repaired at `878bc912`, so the records are better; but the claimed meter accepts four injected violations and its selftest kills 4/13, items 1–2 were repaired by in-place rewrites of append-only records, and item 6's lane half is uncorrected — the claimed measured move is not established |
| depth | unchanged | one new knowledge note (103 → 104) over the held showpicker surface; no new decision table verified |
| operability | unchanged | new instruments and a five-gate runner, green on committed evidence, but not a claimed axis move and the runner's verdict carries `revision: null` |
| freshness | unchanged | S219 re-opened in place (`used-by` only, recheck unchanged); S225/S226 are new rows, not re-verified stale ones |
| adjacency | unchanged | R91Connector: 20/20 sibling lanes, nothing contested, nothing absorbed |

## 6. Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S225 (`corpus/SOURCES.md:240`), WHATWG HTML §9.3.2.1 quote | admit | live `https://html.spec.whatwg.org/multipage/web-messaging.html` (132,045 B, same size as staged), tags stripped | agree | "Authors should not use the wildcard keyword (*) in the targetOrigin argument in messages that contain any confidential information" found verbatim; 19 words (≤25); tier A spec, the row's `teaches` matches the child proxy's origin check |
| S226 (`corpus/SOURCES.md:241`), WHATWG HTML §6.4.1 quote | admit | live `https://html.spec.whatwg.org/multipage/interaction.html` (454,117 B, same size as staged) | agree | the 22-word "transient activation duration…" quote found verbatim; supports the measured post-call `isActive` transition |
| "A parent click activates the cross-origin iframe" | reject | `receipt.json` leg `sp91-xo-proxy-file-parentact` | agree | `childActivationAfter {isActive:false, hasBeenActive:false}` while parent `activationAfter.isActive:true`; the leg's only error string is `NotAllowedError`; 0 choosers — measured false, flip condition correctly named |

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
`tabi ok`, W04 cross-scope duplicate-URL warnings only (pre-existing). Row count
`grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md` → 224 at `b1d8f07b`, 226 at tip.

## 7. Trend verdicts

- **expansion: improved** — SOURCES 224 → 226 (S225, S226 tier A, quotes verified live);
  knowledge 103 → 104 (`git ls-tree -r --name-only <rev> corpus/knowledge/ | wc -l`); a new
  15-leg proxy receipt on new ground (iframe `postMessage` showPicker), reproduced twice, even
  though its claim wording is narrower than stated.
- **quality: unchanged** — instruments green and reproduced (30 / 44 / 32 / 8 → 0), but both
  claimed meters are shown not to bind their stated laws (counter clause coverage 13/40, drift
  selftest 4/13), and the record repairs introduced in-place rewrites of append-only files.
- **discernment: improved** — five attack seats executed counterexamples that falsified both
  claims; the lane reported NOT VERIFIED rather than re-scoping; the pre-file ledger passes with
  narrowings named; the outside spot-check agrees with both admits and the reject.

## 8. Routed defects for tabi r92 (durable queue)

1. **Filed report rewritten in place** (`49c70103`, `2beeaeb2`, the latter after `complete`):
   future corrections land as an appended erratum naming the superseded text; write the report
   only after the last lane commit (here `878bc912` landed after first filing).
2. **Append-only repairs:** `LOG.md:4079-4086` (r90 entry) and `QUALITY.md` row 163 were rewritten
   in place; append a named correction entry in `LOG.md` and a superseding QUALITY row recording
   that 163 was edited in place (row 164 states the rule it broke).
3. **C1 binding gaps:** bind `hasBeenActive` in `activation-law` or narrow the law-2 sentence; add
   a same-origin colour proxy leg or narrow "all three shapes in both frames"; add the law-2
   proxy-arm leg; make `prior-set` identity-level (duplicate probe scores clean 30/30).
4. **Capability row scope:** the cross-origin arm is same-site (127.0.0.1, other port), not OOPIF;
   the driver binds the first `type=page` target without `Target.*` enumeration — narrow the
   `SCORECARD.md` capability row.
5. **C2 meter strength:** make the drift statements refuse retained false text (not presence-only),
   implement `--revision` instead of echoing it, stop statement 7 reading the runner's own output,
   and raise selftest kill power beyond 4/13 with the critic's tautology fixture as the red case.
6. **§8 item 6 lane half:** correct `corpus/lessons/round-89.md:117` "(the committer time)" by an
   appended correction.
7. **Gate-run revision:** `scored/selftest.json` carries `revision: null`; record the revision measured.
8. **Post-data claim edits:** the C1 sentence narrowing (13:19:45) and the D1 → D3 pin-map swap
   landed after scoring; freeze claims text before dispatch.

## 9. Verdict

`status=ok admitted=false` — rejected-honest-stop: both claims are NOT VERIFIED as written (lane and
closure agree), no axis harmed; SHONEN boxes remain `[~]` and are not yet fully checkable by a
non-author while both round claims fail as written.
