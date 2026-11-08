# tabi — round 83 report

## Work performed

**Declared claims (frozen before scoring, `.ufo/waves/round-83/claims.json`, D `b6496e6f5d4f`):**

- **C1 — coverage, capability `chromium-showpicker-linux` generation r83** (sourced: S219/S220
  re-opened). Predicate `C1-SHOWPICKER-R83`. Fifteen legs: cross-origin `type=number` and `type=range`
  SecurityError; a `multiple` file input answered opens `selectMultiple` and accepts the answer
  (closing the r82 `mode-single-only` gap); a real PNG into `accept=".png"` accepted with its bytes;
  the second chooser (same `backendNodeId` as the first) answerable by its delivered bytes. The r82
  seven laws are carried. Counter `scripts/check-showpicker-r83.mjs`, 74 checks.
- **C2 — calibration, record drift on the r82 spotcheck routed defects** plus the anchored
  direction-bound counter and the r83 identity/numbers legs. Predicate `C2-RECORDDRIFT-R83`.
  Counter `scripts/check-record-drift-r83.mjs`, 7 claims. Before 4 mismatches, after 0.

**Work items**

- Built the r83 instrument family from the r82 bytes (`chrome-cdp-showpicker-round83.mjs`,
  `check-showpicker-r83.mjs`, `negatives-showpicker-r83.mjs`, `kill-power-r83.mjs`,
  `selftest-r83-gates.mjs`, `check-record-drift-r83.mjs`); 15-leg driver with two new cross-origin
  inputs, a `multiple` leg, a MIME-accept leg and a second-chooser answer leg
  (`scripts/chrome-cdp-showpicker-round83.mjs:166-186`).
- Pre-freeze probe: 15 legs, 0 failures, scored clean 72 checks at the pre-freeze counter; the probe
  receipt is the committed prior (`.../controls/c1/probes/prior1.json`).
- Scored run at the frozen nonce: 15 legs, 0 failures, counter exit 0 **74 checks clean**
  (`corpus/evidence/round83/chromium-showpicker/receipt.json`).
- Battery 153 cases / 0 failed with coverage 74/74 (the 84 r83 cases plus 69 imported R82Mut1 witnesses); kill power 50/50 on the frozen list (`.../scored/battery-a.json`); kill power 50
  mutants / 50 killed / 0 survived / 0 crashed (`.../scored/killpower-a.json`); selftest 9/9
  (`.../scored/selftest.out`).
- Pre-freeze repairs fixed by measurement, not by widening: a missing `clickAt` in the counter PLAN
  crashed `plan-calls`; `LEG_KEYS` required the two chooser-id fields on every leg but only the
  second-chooser leg set them (driver now initialises them); the redundant
  `secondChooserBackendNodeId === opens[1]` conjunct survived its own mutant and was removed
  (QUALITY 156: a rule is owned by one check — `plan-calls`' answer binding and the `first === second`
  conjunct already force it).
- C2: `check-record-drift-r83.mjs` anchors the quote-count direction on the correction cell
  (`23 -> 20`), re-executes the reversed control on a scratch mirror (exit 1, refused), corrects the
  frozen r82 lesson's `7 -> 4` mismatch count, and files the census start/end the r82 spotcheck
  found missing (`.../census/start.txt`, `end.txt`).

## Landed changes

| Change | LOG entry | Commit |
|---|---|---|
| freeze + claims + prior set | round-83 | `4cdf4def` |
| freeze amendment (redundant mutant removed, prior set repaired, number/range laws registered) | round-83 | `27d5451b` |
| generation r83 + calibration drift, note, SCORECARD, SKILL registry, LOG | round-83 | `5d6c34f0` |
| final pins (selftest path repair) + wave spec/evidence | round-83 | see report footer |

## Before → after measurements

- **C1** — command: `node scripts/check-showpicker-r83.mjs --lane <ABS lane> --receipt
  corpus/evidence/round83/chromium-showpicker/receipt.json --expect-driver-sha256
  70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce --expect-nonce
  tabi-r83-l1-c016710129da --expect-fixture-sha256
  e86ceb4261607f02b762a4b70f2f3ff6451e8758953526f2b8340586eb84eb37 --prior-set
  .ufo/waves/round-83/controls/c1/prior-set.txt --json`
  Before: no r83 receipt → exit 2 `receipt-unreadable`; the r82 receipt under the r83 counter →
  exit 1 with `schema` among the findings (`.../scored/` no-work control). After: exit 0,
  `verdict clean`, `checkCount 74`, `findings []` measured at `5d6c34f0`.
- **C2** — command: `node scripts/check-record-drift-r83.mjs --lane <ABS lane> --json`.
  Before: exit 1, 4 mismatches (`direction-bound`, `census-artifacts`, `r83-identity`,
  `r83-numbers`) in `.../lesson-proof/c2-before.json`. After: exit 0, 0 mismatches
  (`.../lesson-proof/c2-after.json`), measured at the same commit.
- **Controls**: the reversed-correction control (`23 -> 20` → `20 -> 23` on a scratch mirror of HEAD
  bytes) exits 1 with `direction-bound` failed — committed in `.../lesson-proof/c2-controls.json`
  with the observed exit and failed-id list.

## Sources & frontier

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
/home/vgpnk/Projects/shokunin tabi` — start exit 0 with 223 rows
(`.../round-83/census/start.txt`), end exit 0, 223 rows, 37 W04 duplicate-URL warnings
(`.../round-83/census/end.txt`). Rows before → after: **223 → 223** (no new rows this round;
generation r83 measures the r82 note's named frontier on carried sources). Rows added by tier: none.
Rows touched old→new: S219/S220 `status` unchanged, `opened` date carried (re-fetched 2026-11-08,
byte-identical sha256 `b0202de1c0b4…`/`…`). Frontier rows advanced: `type=number`/`range` (frontier →
core), `multiple` mode (frontier → core), accept MIME answer (frontier → core), second-chooser byte
attribution (measured limit → core).

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

## Trend verdicts

- expansion: **improved** — knowledge 94 → 95, four frontier legs moved into core with receipt field
  paths, registry held byte-identical.
- quality: **improved** — 74-check counter clean, battery 153/153 with full coverage, kill power 50/50,
  selftest 9/9; a survivor was removed as a redundant rule rather than papered over.
- discernment: **improved** — the r82 spotcheck's routed defects are corrected of record with
  re-executed controls (not presence greps); rejected generalisations carry flip conditions.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — `SKILL.md`
  §Approval table, §Evidence ladder, §Runbook, `## Round 83 gate registry`.
- [~] At least one end-to-end domain task executed and logged in LOG.md —
  `corpus/knowledge/multi-step-journey.md` §1–§2, §7; LOG.md round-83.
- [~] Instructions executable by an agent without oral context —
  `corpus/knowledge/executor-test-sufficiency.md` §0, §4.
- [~] No cross-domain bleed (PROVINCE.md still accurate) — `PROVINCE.md:3-19`; refusal routes held.

Stale-lane: respawn-per-round driver; no other mission of this lane is open.
Tool installs: none this round (node v24.21.0, Chromium 155.0.8059.84 already present; pacman paused
per the addendum guard).
