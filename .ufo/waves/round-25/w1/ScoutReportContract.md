# ScoutReportContract — round-25 report-contract pre-flight (tabi, hyaku run 6)

Seat: `L1Tabi25.ScoutReportContract` (scout, read-only, lane-dispatched — NOT a non-author verifier).
Scope: list the report contract and the SHONEN boxes as a tickable checklist. The report itself is not written here.
Installs: none.

## Sources read (observed)

- `/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-25.md` (495 lines; `wc -l`). The `Read` tool refused every range of this file, so it was read with `awk 'NR>=A && NR<=B {print NR": "$0}'`:
  - §4 Report contract at `:99-129`
  - §2b Frontier step at `:42-78`
  - §6 Campaign addendum at `:141-495`, including report obligations at `:165-166`, `:172-175`, `:184`, `:198-200`, `:220-226`, `:233-234`, `:276-280`, `:338-342`, `:343-351`, `:353-354`, `:364-366`, `:404-405`, `:441-442`, `:477-478`, `:488-489`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/SHONEN.md` exists (12 lines; `cat -n`).
- The precedent report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-24/tabi.md` uses these headings in order (`grep -n '^#'`): Work performed `:8`, Landed changes `:88`, Before → after measurements `:105`, Sources & frontier `:127`, Trend verdicts `:159`, SHONEN `:179`. Two extra sections follow: `:186` and `:195`. The Stale-lane line sits at `:197`.

## A. Required sections, in order (§4 `:101-119`)

Report path: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-25/tabi.md`. It is a fleet-repo file, committed only via `fleet-commit.sh --as tabi`, and it lands last (`:335-342`).

1. [ ] **Work performed** (`:104-106`)
   - [ ] Opens by naming the declared claims, C1 (depth) and C2 (freshness), with their target axes or capability.
   - [ ] Has one bullet per work item.
   - [ ] Each bullet carries an evidence pointer: path:line, command output, or commit hash.
2. [ ] **Landed changes** (`:107-108`)
   - [ ] Every change is tied to a LOG.md entry.
   - [ ] Every change is tied to the commit hash that carries it. Cite only a `jj-lane.sh` `landed <hash>` line; a `rewritten <old> -> <new>` line is not citable (`:294-295`).
3. [ ] **Before → after measurements** (`:109-110`)
   - [ ] One measurement per claim (two here).
   - [ ] Each names the exact counting command:
     - C1: `scripts/check-bfcache-receipt.mjs --rev <REV> --json` (target `restores>=1`, `valid=true`).
     - C2: `scripts/check-source-reopen-receipt.mjs --rev <REV> --json` (target `reopened=6`, `unresolved=0`).
   - [ ] Each names the commit it was measured against. Use the branch tip, never bare `HEAD` (`:328-329`).
   - [ ] Each matches the frozen `countingCommand` / `counterField` / `killRule` / `after` fields in `claims.json`. Do not narrow the target after landing; a miss is an honest stop (`:375`, `:381-384`).
4. [ ] **Sources & frontier** (`:111-115`). This is a conformance item, not a marker predicate.
   - [ ] `SOURCES.md` row count before→after, with the counting command.
   - [ ] Rows added, broken down by tier.
   - [ ] Rows touched, old→new: status, recheck, and used-by.
   - [ ] Frontier rows advanced.
   - [ ] The `SOURCES: unchanged —` line does NOT apply: tabi has `corpus/` writes this round.
   - [ ] Census before→after, both outputs plus exit codes (§2b `:54-66`). Exit 0 is required at round end. Command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`.
   - [ ] The assimilation outcome is stated in this section (`:404-405`): either one adopted theme, or `Assimilation: none` with the reason. If any adoption is attempted, also paste both id lists (`reg-ids`, `staged-ids`), the collision count, and the renumber map (`:441-442`). Also paste the quarantine verdicts (`:477-478`).
   - [ ] Add the considerthese line (`:488-489`): no `considerthese/` dir in tabi. Verified: `ls -d /home/vgpnk/Projects/shokunin/tabi-shokunin/considerthese` → "No such file or directory".
   - [ ] Point to the mined mistake in `corpus/lessons/round-25.md` `## Mistakes`: class · evidence pointer · captured-by · fix. If none was found, paste the sweep (`:68-72`).
   - [ ] Name the sourced claim: C1 rests on S106, opened this round (`:73-74`).
5. [ ] **Trend verdicts** (`:116-117`; also §6 `:350`)
   - [ ] Give exactly one verdict each for `expansion`, `quality`, and `discernment`.
   - [ ] Each verdict is one of `improved`, `harmed`, `unchanged`, `unprovable-but-better`, verbatim.
   - [ ] Each verdict has evidence.
   - [ ] No scalar anywhere: no numeric score or promotion on a number.
6. [ ] **SHONEN** (`:118-119`)
   - [ ] One line per box of `SHONEN.md` (four lines; see C).
   - [ ] `[x]` only with a named non-author verifier.
   - [ ] `[~]` with a resolvable evidence pointer.
   - [ ] `[ ]` if untouched.

## B. Marker rule (§4 `:121-129`)

- [ ] The round counts as **failed**, and the driver relaunches it, if the report is contentless. Contentless means any of:
  - placeholder text;
  - a missing required section other than Sources & frontier and Trend verdicts;
  - no evidence pointers.
- [ ] Hard marker predicates: Work performed, Landed changes, Before → after measurements, and SHONEN must each be present and non-placeholder, and evidence pointers must be present.
- [ ] Skipping Sources & frontier or Trend verdicts while naming real committed work gives `ok` plus a minimum-content conformance defect. Neither is a marker predicate, but both are still required.
- [ ] The watchdog logs the Sources & frontier marker and applies the source-census gate. It does not check trend verdicts or claim admission.
- [ ] Driver completion is not admission. Independent non-author verification is still required, so the report MUST NOT assert any non-author judgment (`:129`; wave Goal: "every seat is lane-dispatched").

## C. SHONEN.md boxes (file exists; `cat -n /home/vgpnk/Projects/shokunin/tabi-shokunin/SHONEN.md`)

| Line | Box | State at baseline | Pointer held |
|---|---|---|---|
| `:5` | SKILL.md contains real decision tables, error patterns, checklists, cited sources | `[~]` | `SKILL.md` §Approval table `:697`, `:1598-1617`; the earlier `[x]` was downgraded (lane-dispatched, not non-author) |
| `:7` | At least one end-to-end domain task executed and logged in LOG.md | `[~]` | `corpus/knowledge/multi-step-journey.md` §1–§2, §7; LOG.md round-3 entry |
| `:9` | Instructions executable by an agent without oral context | `[~]` | `corpus/knowledge/executor-test-sufficiency.md` §0, §4 |
| `:11` | No cross-domain bleed (PROVINCE.md still accurate) | `[~]` | `PROVINCE.md:3-19`; `corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt` |

- [ ] None of the four may be reported `[x]` this round: every seat is lane-dispatched, so there is no named non-author verifier.
- [ ] Each `[~]` pointer must still resolve at the round-25 tip. Re-check `SKILL.md:697` and `:1598-1617` if SKILL.md moves this round. [INFERENCE] C1 adds journey or bfcache evidence that may strengthen box `:7`; cite it only if committed.

## D. §6 report extras the L1 must also carry

- [ ] Return summary of ≤12 lines, separate from the report (`:165-166`): claims with verdicts, lane HEAD, report commit, round shape, wave sizes and seat-role mix, round total, dead seats, open L0 questions.
- [ ] Earlier attempts (`:172-175`): `grep -c 'lane-dead-no-report tabi round=25' /home/vgpnk/Projects/shokunin/.ufo/watchdog.log` → `0`. No inherited attempt was observed at scout time; the L1 should re-check before writing.
- [ ] Round shape (`:184`, `:220-221`):
  - [ ] Name the shape: two v1 waves or one v2 wave.
  - [ ] For each wave: seat count, role mix, and dead seats with their last error text (`:233-234`).
  - [ ] Any residual `task` call of ≤8 seats (`:198-200`).
  - [ ] Round total (≤128).
- [ ] Planner mapping (`:224-226`): the L1 holds the §3 planner seat. Record any planning data-walk riding a scout, connector, or revenger item.
- [ ] Record a seat's actual answering model where a claim depends on it (`:233`).
- [ ] Misroot sweep result (`:276-280`): `git -C /home/vgpnk/Projects/shokunin status --porcelain`. Any misroot found goes under `## Mistakes`.
- [ ] Pre-report gate (`:339-342`): `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-remote origin refs/heads/master` must print the final lane hash. The report cites that pushed lane hash.
- [ ] Inherited state (`:343-349`):
  - [ ] Name any leftovers and files the L1 did not author.
  - [ ] `corpus/lessons/round-24-verifier-spotcheck.md` EXISTS (`ls corpus/lessons/`). Turn every disagreement or routed defect into a lesson-backed QUALITY.md criterion or fix, or say in the report why not.
  - [ ] `ls corpus/lessons/ | grep operator-` → no matches, so there are no operator lessons to honor.
- [ ] `Stale-lane` line (`:350-351`). The round-24 precedent is `Stale-lane: none — attempt 1 …` (`reports/round-24/tabi.md:197`).
- [ ] Tool installs (`:351`, `:353-354`): tool, version, channel, and reason, or "none".
- [ ] Honesty (`:364-366`): an unrun check has not passed. Report harmed or unprovable claims as such. List any L0 questions appended.

## E. Observed risks for the L1

1. **The round-start census exit code is not in the committed file.** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/census-before.txt` is 17 lines (`wc -l`) and ends with `tabi	ok	…/corpus/SOURCES.md`, plus W04 duplicate-url warnings for S058, S065, S066, S096, S098, S099, S100. `grep -n -i exit` on it → no match. `git show -s c8ef308` → no census or exit text. The "exit 0 recorded at round start" claim appears only in the wave context prose of `w1-spec.json`. §2b `:55` requires pasting "both outputs and their exit codes", so the L1 should state the round-start exit code with its provenance. [INFERENCE] The `ok` line implies exit 0, but the exit code itself was not observed by this seat.
2. **The lane tip moved past the stated baseline.** `git rev-parse master` → `c8ef3084c6363f265b9d23285296ab3547654f57`. `git log --oneline -3 master` shows `c8ef308 round-25: freeze claims, controls, census-before, wave-1 spec` on top of the baseline `9e13666`, and `claims.json` `baseline` = `9e13666…`. Before → after measurements should name `9e13666` for "before" and the final pushed tip for "after".
3. **`claims.json` holds the frozen fields** `countingCommand`, `counterField`, `killRule`, `before`, `after`, `control`, and `failureCapable` for C1 and C2 (`python3 -c 'json.load…'`). The report's measurement section should quote those fields verbatim (one predicate, one sentence; `:383-384`).
