# tabi — round 22 (hyaku run 6, landing attempt)

**Stale-lane:** none — respawn-per-round driver; no other mission of this lane is
open. This attempt landed round 22 only; rounds 23+ were not started.

**Declared claim (1, unchanged from the declaration):**
**C1 — operability** (a lowest non-retired axis, tie at 8): absent → **12 explicit,
failure-capable semantically checked lifecycle rows** over the *same* 12 retained
round-21 observations. Metric `c1_semantically_checked_lifecycle_rows`; target
0→12; population 12→12; scalar operability 8→8. No second claim was declared, and
the frontier/assimilation work below rides inside that cap as the §2b step, not as
claims.

## Work performed

- **Re-verified the inherited round-22 work before touching it.** The round had been
  dispatched three times (watchdog launches 2026-10-21, 2026-10-23, 2026-10-25; the
  first two left no report). This attempt inherited W1 (64 seats, 64/64 reports),
  the never-spawned W2 (64 validated seats, 0 spawned, 23 whole-payload
  `Background job limit reached (100)` receipts, then loss of the host session) and
  the post-crash W2b replacement (65 seats spawned, 58 reports, 7 dead). Every
  counting command, both selftests, both pin digests, the serial cohort and the
  preserved round-21 bytes were re-run at the inherited tip `e3cf4e0` before any
  edit — evidence `.ufo/waves/round-22/checks-at-e3cf4e0.json`,
  `.ufo/waves/round-22/w1-event-history.json`, `w2b/spawn-result`, `w2b/` reports.
- **Measured C1**: baseline `5f585773…` → `0`/`baseline`; checkpoint `47bfb5f7…` →
  `12`/`clean`, no findings. Log: `LOG.md` §“Round22 landing — C1 met at 12…”
  (appended, `fbee618`).
- **Repaired the high-severity falsifier rather than keeping a fitted 12.** W2b
  `CriticRepairFitting` §F1 showed the landing branch read a pinned literal
  backwards (pin `[]` meaning “no recorder”; an observation equal to the pin failed,
  an unobservable dimension passed), while `CriticAuthority` §A1/§A4 and
  `CriticTrend` §F2 showed the repair record mislabelled the lane's own W2b seats as
  “non-author” and claimed unchanged pinned expectations. Fix: pin the field as
  `null` (the same convention the stage already uses for a missing submit recorder),
  replace the id-guarded branch with a uniform null-means-absent rule, bind the
  encoding in `expectationShape`, re-pin the digest. Receipt
  `.ufo/waves/round-22/expectation-revision.json`; note errata appended at
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` §Errata. Value neutrality
  is measured, not asserted: **12 at the pre-revision oracle `e3cf4e0`, 12 at the
  post-revision oracle `47bfb5f`**.
- **Hardened the selftest** (W2b `ReviewExpectationsPin` §F1): new case
  `expectations-bytes-unpinned` appends one byte to the pinned expectations, keeps
  the JSON schema valid and requires `input_shape`; it is the only case that isolates
  the `EXPECTATIONS_SHA256` guard. 44→45 cases, all passing
  (`node .ufo/waves/round-22/selftest-c1.mjs` → clean 45/45).
- **Corrected provenance**: `post-crash-repair.json` now records W2b as author-side,
  points at the encoding revision, and asserts no non-author judgment. No non-author
  agreement exists anywhere in this round.
- **Serial cohort at the landing tip**: `python3 .ufo/waves/round-22/run-checks.py
  fbee618b… .ufo/waves/round-22/checks-final.json` → **35/35 expected outcomes**, and
  preservation clean (0 frozen-file mismatches, 0 changed-path scope errors, 0 source
  errors, every mutable doc a pure byte-prefix extension of the baseline).
  Intermediate checkpoint receipt: `checks-at-47bfb5f.json` (35/35).
- **Wave-4 quarantine-first assimilation (`corpus-expansion-1`)**: the lane's
  absent-defect-register slice was re-derived from its data rows (the register's
  header and `## By lane` summary are stale) and hand-checked row by row after
  re-fetching each cited source: **38 rows → 37 refused** (not one registered quote
  locatable in its cited source) and **1 unverifiable** (S171 `chromestatus.com`
  prose-class unreachable row; `unreachable` is not fabrication). Four matcher
  controls (three known-present strings found, one known-absent string not found)
  gate the run and fail it at exit 3 if they disagree. Adoption is **closed**: no
  campaign file written, no staged row appended, no id renumbering. Evidence
  `.ufo/waves/round-22/assimilation/{hand-check.mjs,quarantine-verdicts.json,
  quarantine-verdicts.tsv}`, register sha256 `5afe1810…`.
- **Sources census** before and after, same command both times:
  `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` →
  **exit 0 / exit 0** (16 duplicate-URL warnings, unchanged set).
- **Misroot sweep**: `git -C /home/vgpnk/Projects/shokunin status --porcelain` run
  before the report. No file written by this lane or its seats sits in the fleet
  root (the untracked fleet-root files — `live.html`, `bm.json`, `s395.txt`,
  `unblob.log`, `.ufo/waves/round-35/`, `scripts/hyaku/*.bak` — predate this attempt
  and belong to other lanes/operator sweeps; left untouched). Nothing copied back,
  nothing deleted.
- **`considerthese/`**: this lane has no such directory, so no operator proposal was
  mined (one report line, per the addendum).

## Landed changes

All lane changes are in `tabi-shokunin`; the report is the only fleet-repo change.

| Change | LOG.md entry | Commit |
|---|---|---|
| Inherited round-22 build: oracle, pinned expectations, selftest, W1 evidence, chronology checker | `LOG.md` §Round22 (pre-measurement/boundary entries, `:1496–1580`) | `0f24164` (inherited), `e3cf4e0` (inherited) |
| Landing-stage encoding revision (`errors: []`→`null`), uniform absence rule, re-pin `d00aed4c…`, shape binding, new `expectations-bytes-unpinned` case (45/45) | `LOG.md` §Round22 landing item 1 and 3 | `47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e` |
| Author-side provenance correction of `post-crash-repair.json`; `expectation-revision.json` receipt | `LOG.md` §Round22 landing item 2 | `47bfb5f` (record), `fbee618` (receipt) |
| Lesson `corpus/lessons/round-22.md` (Gate, Mistakes M1/M2, waves, bounds); SCORECARD round-22 disposition + appended capability row; README round-22 landing errata; QUALITY criteria 59–60; SKILL round-22 errata; note errata | `LOG.md` §Round22 landing | `fbee618b3ca313b6387192950083ef0ff47ee145` |
| Quarantine verdicts, hand-check harness, W2b spec/registry/reports/refusals, `checks-at-e3cf4e0.json`, `checks-at-47bfb5f.json` | `LOG.md` §Round22 landing (frontier + waves) | `fbee618` |
| Final serial cohort receipt at the landing tip | `LOG.md` §Round22 landing (serial cohort) | `be271a2d98f3e2f6ec3e179c8e17f50f80698571` |

Lane tip after landing: **`be271a2d98f3e2f6ec3e179c8e17f50f80698571`**
(`jj-lane.sh state` ahead=0 at the time of writing).

## Before → after measurements

**C1 (operability), counting command and field as declared:**

```sh
node .ufo/waves/round-22/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6
node .ufo/waves/round-22/measure-c1.mjs 47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e
node .ufo/waves/round-22/measure-c1.mjs fbee618b3ca313b6387192950083ef0ff47ee145
```

| | Revision | Value | Verdict | Exit |
|---|---|---|---|---|
| before | `5f585773…` (round-21 tip) | 0 | `baseline` | 0 |
| after | `47bfb5f7…` | 12 | `clean`, findings none, 12 counted rows | 0 |
| after | `fbee618b…` (landing tip before the cohort receipt) | 12 | `clean` | 0 |

Supporting: `selftest-c1.mjs` → clean 45/45 (44 before this attempt);
`run-checks.py fbee618b…` → 35/35, preservation clean
(`.ufo/waves/round-22/checks-final.json`).

**Frontier-step counters (not claims):** register slice rows **38 → 38 verified**
(37 refused + 1 unverifiable, 0 adopted); matcher controls **4/4 passing**;
SOURCES rows **101 → 101** (mined 73→73); census **exit 0 → exit 0**.

## Sources & frontier

- `corpus/SOURCES.md` rows: **101 → 101**; tiers **A88 / B4 / C9 → unchanged**;
  statuses **mined 73 / queued 19 / rejected 9 → unchanged**; **0 rows added**.
  Counting command: `scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin tabi` (exit 0 before and after); row counts
  cross-checked with `node .ufo/waves/round-20/counts.mjs <REV>` inside the serial
  cohort (`curation-before`/`curation-after`, both 101 rows, knowledge 40→41).
- Rows touched old→new: **S101 only** — its mutable `used-by` cell gains
  `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`; no immutable cell changed
  (the cohort's `sourceErrors` is empty). No row was retired or re-statused.
- **Sourced claim:** C1 cites **S101** (own-work receipt/raw), reopened this round:
  accessed 2026-10-25, located quote from the `na-reset` raw
  (`WebMCP.toolResponded` `params.errorText`): “Tool execution cancelled by a form
  reset” (8 words), raw sha256 `097b8833…`; full opening record
  `.ufo/waves/round-22/source-opening.json`.
- Frontier rows advanced: **none claimed**. C1 runs on held round-21 ground
  (population 12→12, QUALITY 56 keeps reused observations at their old count), so
  no frontier row moved into core. The quarantine verdicts close 38 candidate rows
  that never entered the registry: 37 refused (quote absent from the re-fetched
  cited source), 1 unverifiable.
- **Assimilation: quarantine-first, adoption closed** — 0 knowledge entries and 0
  SOURCES rows taken from `merge/tabi/` this round; the hand-check and its controls
  are the round's assimilation deliverable, with per-row verdicts in
  `.ufo/waves/round-22/assimilation/quarantine-verdicts.tsv`.
- **considerThese:** `tabi-shokunin/considerthese/` does not exist — no operator
  proposal mined this round.

## Trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | **unchanged** | No new domain surface, source row or observation population: SOURCES 101→101, knowledge 40→41 with the *same* twelve observations (population 12→12), 0 register rows adopted. The one note is the round's held-ground instrument, not new coverage (QUALITY 56). |
| quality | **improved (bounded)** | The 12 rows are now checked by a failure-capable oracle rather than a structural positive: 45 isolated CLI cases (44 before, incl. the new expectations-pin mutant), 12 counted rows, atomic blocking on any finding, the landing encoding made consistent in the pinned file itself, and the digest pins verified at both revisions. 35/35 serial cohort with preservation clean; both no-harm lifecycle arms still 12/clean. Bound: retained-evidence replay only — no new browser run, real site or other build. |
| discernment | **unchanged** | The round caught and repaired its own high-severity falsifier (measured value-neutral, disclosed) and refused 37 unlocatable register rows instead of adopting them — but every seat involved, W1 included, was dispatched by this lane, so there is **no non-author spot-check** this round and no outside agreement is claimed. Outside agreement remains owed to the closure. |

## SHONEN

- `[~]` SKILL.md contains real decision tables, error patterns, checklists, cited sources
  — resolvable: `SKILL.md` §Approval table, §Evidence ladder, §Runbook, and the new
  round-22 errata section appended by `fbee618` (axis restated as operability, not depth).
- `[~]` At least one end-to-end domain task executed and logged in LOG.md
  — resolvable: `corpus/knowledge/multi-step-journey.md` §1–§2/§7 plus this round's
  `LOG.md` §Round22 landing entry (measured 0→12 with its replicas).
- `[~]` Instructions executable by an agent without oral context
  — resolvable: `corpus/knowledge/executor-test-sufficiency.md` §0/§4 and this
  round's executable counters/selftest (`measure-c1.mjs`, `selftest-c1.mjs`,
  `run-checks.py`), which run from committed bytes alone.
- `[~]` No cross-domain bleed (PROVINCE.md still accurate)
  — resolvable: `PROVINCE.md:3-19`; this round stayed on loopback/retained-evidence
  browser craft and refused the campaign rows rather than absorbing another domain.

No box moves to `[x]`: that needs a named non-author verifier, and none exists in
this round.

## Round shape, seats, refusals

- Shape: **two v1 waves** (policy `scripts/hyaku/ufo-wave-policy.json`), both
  dispatched in earlier attempts of this same round and re-verified here.
- **W1 (build) 64 seats**: executor 3, connector 3, scribe 3, scout 19, reviewer 24,
  critic 8, revenger 4 → 64/64 reports, 0 dead, 0 replacements.
- **W2 (falsify) 64 validated seats, 0 spawned**: reviewer 32, scout 18, critic 8,
  connector 2, mutation-tester 4 — 23 whole-payload refusals (“Background job limit
  reached (100)”), then the host session died; no seat ever ran.
- **W2b (post-crash falsify replacement) 65 seats**: reviewer 31, scout 19, critic 9,
  connector 2, mutation-tester 4 → spawned, **58/65 reports**, 7 seats dead with no
  report (`RowOutcome10`, `RepairLandingErrors`, `RepairMaskedFixture`,
  `ReviewIncludesMatching`, `ReviewPositiveControl`, `ReviewSourceHeader`,
  `ReviewEvidenceBinding`); none replaced. Its registry has member names only, not
  agent ids — a conformance defect of the earlier attempt, named here rather than
  backfilled.
- Residual checks: none dispatched this attempt; the repair verification is
  the committed selftest (45/45) and the serial cohort (35/35).
- **Round total: 129 seats** (64 + 0 + 65) — one over the ≤128 two-wave cap because
  the 65-seat replacement was validated after W2's 64-seat payload had already been
  authorized. Reported, not hidden; no third wave was dispatched this attempt.
- Planner: the validator rejects a `planner` seat, so the L1 holds the canonical
  planner seat; the bounded planning data-walk rode scout/connector items.
- Routing: every seat went through the host route table (`task.agentModelOverrides`,
  all roles `@m_flash`); no model was passed in any payload; the route table was
  read, never modified.

## Tooling, capacity, open questions

- **Tooling:** none installed or updated this round (no pacman/uv/cargo/npm
  transaction). Host pacman transactions remain paused per the orchestrator ruling.
- **Capacity refusal recorded:** one async cohort dispatch was refused at the session
  job limit (“Background job limit reached (100). Wait for running jobs to finish or
  cancel one.”); the same cohort was then run to completion in the foreground
  (76.9 s, exit 0).
- **L0:** one line appended for the operator — the target-decision question on
  whether a disclosed, measured-value-neutral expectation-encoding revision is
  admissible under the §9 “a rule changed after any seat has scored is not the
  claim's rule” clause (this round treats it as admissible *because* the value is
  identical before and after and nothing was narrowed), plus the 129-seat overage.
  The round did not block on it.
