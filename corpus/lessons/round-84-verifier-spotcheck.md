---
author: hyaku closure (non-author integrator, @m_zfl)
---

# tabi round 84 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author). Lane base `a5d6ffbf`,
round commit `0837866a7525a38bc669fcc2a0e0625b0b610741`, D2 `31fc14c29f84`
(D1 `a5bdb15ec9a7` superseded by the battery repair, recorded above).

Dispatch digest (`.ufo/watchdog.log`, copied at closure):
`2026-11-08T03:23:06-03:00 launch tabi round=84 pgid=605235 driver=hyaku-inline attempt=1`
`2026-11-08T04:13:21-03:00 complete tabi round=84; hyaku-inline attempt=1`

## Step-1 conformance

| Check | Result | Evidence |
|---|---|---|
| report committed by lane identity in fleet repo | yes | `git log --format='%an %H' -- .ufo/reports/round-84/tabi.md` → `tabi-shokunin 7223006d…` (latest) then `e1b51de7…` |
| `SHONEN` heading + one line per box | yes | `grep -c '^## SHONEN'` → 1; four `[~]` lines with evidence pointers |
| cited commit exists & ancestor of branch | yes | `git merge-base --is-ancestor a5d6ffbf… 0837866a…` and `…,0837866a…` both hold (branch `master`, HEAD detached at `0837866a`) |
| lane repo clean, pushed | yes | `jj-lane.sh state` → `ahead=0 behind=0 head=detached tracked=0 untracked=0 local=remote=0837866a`; `status --porcelain` empty |
| prompt template contract | yes | §1 mission/axes, §3 "at least 8 L2", §4 report contract incl. SHONEN heading, §5 commit-push/L0, §2b frontier step present; §6 hyaku addendum with addenda to Amendment 63 |
| marker vs report | real report | report carries work performed, evidence pointers, landed changes with LOG entries, a checkable round commit — not a marker |
| stale-lane row | conformant | report §Round extras: "respawn-per-round driver; no other mission of this lane is open" |

Fleet-root `status --porcelain` shows only non-lane scratch (`run15-state.json`,
`l0-questions.md`, `closure-tabi-r83-entry.json`, an untracked mado report) — the
lane's own misroot sweep (`git -C fleet status`, `.ufo/reports/round-84/tabi.md`
§Round extras) is consistent with that; no lane-written stray at the root.

## Per-claim re-check

Both claims rest on lane-owned gates. Per PROTOCOL §Gate standard (Closure
consequence) I verify the **committed evidence** (self-test tally, frozen-run
verdict, revision measured) and do not execute the sibling's gate. The one piece
of fresh re-measurement I ran myself is the record-drift counter below (a
read-only node script).

### C1 — coverage / capability `chromium-showpicker-linux` generation r84

- Receipt: `corpus/evidence/round84/chromium-showpicker/receipt.json` at
  `0837866a`: `nonce = tabi-r84-l1-31fc14c29f84`, 18 legs; legs 12–14 carry
  `childResult = {ok:false, name:'SecurityError', message:"…showPicker() called
  from cross-origin iframe."}`, `parentCrossAccess.contentDocument === null`
  (I re-read each leg's `childResult`/`parentCrossAccess`; legs are keyed
  positionally, leg ids are not stored — `legs[12..14]` per the note).
- Frozen counter run (committed evidence): `scored/counter-a.json` →
  `verdict clean, checkCount 80, findings []` at D2.
- Battery/kill power/self-test (committed evidence, not re-run):
  `scored/battery-a.json` → 162 cases / 0 failed / coverage 80-80;
  `scored/killpower-a.json` → 50 mutants / 50 killed / 0 survivors / 0 crashed;
  `scored/selftest.out` → 9 gates, all `ok: true`
  (pins-match-freeze, counter-clean, battery, kill-power, nowork-control,
  tree-exempt-path-refused, tree-exempt-unmatched-refused, record-drift,
  capability-status).
- Two independent cold runs: `w1/R84Exec1.md` — Cold1 and Cold2 both exit 0,
  `verdict clean`, `checkCount 80`, `findings []`, with the content-bound
  exemption actually resolved.
- My re-run (read-only counter on an extracted tree of `0837866a`): the `lane`
  check fires because the tree's directory name differs from `tabi-shokunin`
  (`lane tabi-shokunin expected tabi-r84-H5xvWl`) — it is a directory-name pin,
  not a signal, and confirms the counter does re-check the lane. No other finding.
- Narrowing (honest): R84Review1's census shows the three new legs share one
  distinct `childResult`, one `parentCrossAccess`, one `childLate` across all 11
  cross-origin legs — the instrument measures the same origin gate, not three
  code paths. The note (§measured laws, law 3) says exactly this; the plan's
  narrowing is carried into the report.

**C1 verifies** (evidence-verified; counter/battery/kill-power/self-test are
committed-evidence grades, not my re-execution; receipt fields re-read by me).

### C2 — calibration / record drift (the eight r83 routed defects)

- Counter I re-ran myself:
  `node scripts/check-record-drift-r84.mjs --lane <lane> --json` →
  `claims=10, mismatches=0, failed=[]` (exit 0). Before/after/control evidence
  (committed): `w1/c2-before.json` 8 mismatches on the clean mirror;
  `w1/R84Exec2.md` AFTER leg 0 mismatches; `w1/c2-control.json` 1 mismatch on
  `r83-accept-correction`. All read and consistent.
- Corrections land in `corpus/lessons/round-84.md` §Corrections (8 rows) **and**
  the append-only `## Erratum` on the r83 note (I read it: accept token, 8-byte
  PNG signature `89 50 4e 47 0d 0a 1a 0a` + `tabi-r83-png\n`, law-count sentence).
  Knowledge entries `96 → 97` (I counted `ls-tree -r` at base and at head:
  96 and 97).

**C2 verifies** (re-measured: my own counter run reproduces 0 mismatches; the
before/control legs are committed-evidence grades).

### Axis harm check

`git diff a5d6ffbf..0837866a -- SCORECARD.md` touches only the round-84 section;
no axis score moved (all six held at 9). No owned axis harmed.

## Pre-file falsification ledger

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 84` →
`PREFILE-FALSIFICATION: pass claims=2 rows=14 attack_seats=5 findings=0`, exit 0.
The ledger `.ufo/waves/round-84/claim-falsification.tsv` covers C1 and C2 with
all five attack seats (R84Review1, R84Review2, R84Critic, R84Mut1, R84Connector)
plus Scout and Exec seats — no `falsifies-wording` rows, no narrowing owed.
Not edited.

## Discernment spot-check (LEARNING.md)

Lesson `corpus/lessons/round-84.md` `## Gate`: no new rows (identified 3 /
screened 3 / included 0 / excluded 3 — all carried rows S219/S220/S223 re-opened
by R84Scout), one admit (the r84 knowledge note, cites S219–S223), three rejects
with flip conditions.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| knowledge note `chromium-showpicker-runtime-round-84.md` (admit) | admitted | WHATWG html.spec.whatwg.org/multipage/input.html `showPicker()` step 2 (fetched this session): "origin is not same origin with … top-level origin, and this is a select element, or this's type attribute is not in the File Upload state or Color state, then throw a SecurityError" — and "File and Color inputs are exempted from this check for historical reason". Chromium gitiles `155.0.8059.84` `html_input_element.cc` (base64-decoded): the same origin check (`FormControlType() != kInputFile && != kInputColor` → `frame->IsSameOrigin()` → `ThrowSecurityError`) runs *before* the mutability and gesture checks. legs[12..14] | agree | the note's laws match both sources and the receipt fields the note cites; law 3 correctly declines to claim three distinct code paths |
| "The tel/search/text SecurityError proves the origin gate is type-agnostic for every input type" (reject) | rejected | same two sources; the spec condition exempts File Upload / Color states only | agree | the reject is rightly scoped: nine non-file types measured, the remaining types not in the fixture — the flip condition (a leg per remaining type) is precise |
| "The counter distinguishes the three new legs from `type=date`" (reject) | rejected | `w1/R84Review1.md` §5; receipt `legs[12..14]` vs the date legs | agree | one distinct `childResult`, one `parentCrossAccess`, one `childLate` across all 11 cross legs — the counter compares the descriptor/law tables, not a Chromium branch; the reject protects against an over-claim the note originally made |

No newly written `corpus/SOURCES.md` rows (SOURCES diff base→head is 0 lines;
census 223 rows both ends, which I re-ran: `sources-census.sh validate` exit 0,
`tabi ok …/corpus/SOURCES.md`). The scout's fetched bytes live in scratch and
were removed; the durable quote→byte-offset table in `w1/R84Scout.md` §4 is my
re-opened source of record, and the quoted step text resolves verbatim against
the live spec page today.

## Trend verdicts

- **expansion: improved** — knowledge 96 → 97, and three new measured legs move
  the r83 note's named frontier (`type=tel/search/text`) into measured core;
  capability row adds generation r84.
- **quality: improved** — the r83 note's overstated clauses (accept token, real
  PNG, law count) are corrected in an append-only erratum the drift counter
  reads; battery 162/162 after the D1 156/74-80 gap was caught and re-frozen.
- **discernment: improved** — the round's own wave falsified three wordings
  (leg distinctness, kill-power reach, case coupling) and the narrowings are
  recorded in `plans/round-84.md` *before* filing; the D1 freeze gap was caught
  by two independent seats and fixed by a recorded re-freeze, not hidden.

| axis | verdict |
|---|---|
| coverage | improved |
| calibration | improved |
| depth | unchanged |
| operability | unchanged |
| freshness | unchanged |
| adjacency | unchanged |

## Routed defects (next round)

1. (r85, planned in `plans/round-84.md`) Battery witnesses for R84Mut1's 51
   case-level survivors (`childResult.message` unpinned, `childLate`, child
   event seq, `parentCrossAccess`, the three new legs deleted from the loop).
2. The `accept` MIME-token and `image/*` grammar legs (S223) — frontier.
3. A same-origin `tel`/`search`/`text` contrast leg — the four-leg rule.
4. A counter generation whose limit sentence prints the constant-offset escape.
5. C2's predicate does not reconcile the r83 spot-check's Gate `0/0/0/0` vs
   `5/5` prose, and `claim-count-stable` is vacuous (R84Critic/R84Exec2) —
   accepted narrowing; a fuller reconciliation belongs to a future drift counter.

## Honesty notes

- The report's `stale-lane` line ("no other mission of this lane is open") is a
  self-attestation; I verified the absence of other live tabu-side lanes from
  the roster output only.
- D1 was a freeze before the battery repair; the D1 receipt was re-executed at
  the D2 nonce and superseded, never edited. Driver and picker counter are
  byte-identical D1→D2, so the leg evidence is one generation.
- No claim is exploratory; neither axis verdict depends on reviewer judgment.
