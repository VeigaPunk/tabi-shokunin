# D4 — `c4-stale-attempts` ground truth for round-22

**Verdict: TRIPS.** Round-22 committed bytes hold two actuator identities (`TabiR22`, `TabiR22-2`) and one 85.3 h window with zero commits; its committed claim surfaces hold **0** per-attempt `Stale-lane` grades. Round-21 (one identity, no window) has **no requirement** and must stay green.

## 1. Derived facts (observation; every figure re-derived here)

- **F1 — dispatches = 3, provable only from the watchdog.** `grep -nE "(launch|complete) tabi round=22 " /home/vgpnk/Projects/shokunin/.ufo/watchdog.log` → `:609` 2026-10-21T11:47:45-03, `:1087` 2026-10-23T20:41:38-03, `:1257` 2026-10-25T03:23:44-03, `:1263` complete 2026-10-25T03:40:22. All four lines carry `attempt=1` (per-launch counter): the log has **no cumulative attempt index**, so 3 is `grep -c "launch tabi round=22 "`, not that field.
- **F2 — committed round-22 commits = 6, two epochs.** `git log --format='%h %ad' --date=iso-strict 5f58577..a89f193` → `0f24164` 10-21T11:51:39-03, `e3cf4e0` 10-21T13:38:27-03, `47bfb5f` 10-25T03:31:37-03, `fbee618` 03:36:54, `be271a2` 03:38:49, `a89f193` 03:50:10 (that last one postdates the completion line by 9 min 48 s — closure work).
- **F3 — the second dispatch left nothing committed.** `git log --format=%h --since=2026-10-23T20:41:38-03:00 --until=2026-10-25T03:23:44-03:00 a89f193` → empty (exit 0, no output). No receipts either: F4 lineage stops at 2026-10-21T17:14:05Z, F2 commits resume 2026-10-25T06:31:37Z ⇒ **85.3 h, 0 commits, 0 receipts**. Dispatch 2 is therefore *invisible in committed bytes* — that absence is the defect, not a wrong word.
- **F4 — committed attempt artifacts** (`git ls-tree -r --name-only a89f193 -- .ufo/waves/round-22`): `w2-cap-refusal-{01..09,11..14}.json` = 13 (`attempt` 1–9, 11–14), `w2-attempt{02..09,11}-result.json` = 9, `w2-spawn-result.json` (attempt-1 refusal, no `attempt` key), `w2-retry-slots.json` 7 entries attempts `[3..9]`, `w2-capacity-events.json` 1 event 15:38:07Z; `w2b-cap-refusal-{01..11}.json` = 11, `w2b-spawn-result.json` `attempt: 12`; `w1-record.json` `createdAt 2026-10-21T14:50:08.565Z`. Attempt-shaped receipts total 33 (22 `w2-*` + 11 `w2b-*`).
- **F5 — actuator identities.** `grep -rlE "replacement L1|session-[0-9]" .ufo/waves/round-2{1,2}/ | wc -l` → **0** (r21) / **7** (r22). Committed names: `w2-cap-refusal-11.json:16` "attempt 10 by dead **TabiR22**"; `w2-attempt11-result.json:4` `"TabiR22-2 (session-3 replacement)"`; `post-crash-repair.json:4` `"TabiR22-2 (session-3 replacement L1)"`. Normalized sets: `{TabiR22, TabiR22-2}` vs `{TabiR21}`.
- **F6 — zero graded lines in committed claim surfaces** (`python3 .ufo/waves/round-23/scratch/L1Tabi23.D4StaleAttempts/grade-scan.py`): round-22 surfaces resolve to `[LOG.md round section, corpus/lessons/round-22.md]`, graded tokens `[]`; round-21 likewise `[]`. The uncommitted fleet paragraph `.ufo/reports/round-22/tabi.md:3-4` (`**Stale-lane:** none — …`) also yields `[]`, while the same file `:16-18` names "dispatched three times … 2026-10-21, 2026-10-23, 2026-10-25" — one global grade against three-dispatch prose.
- **F7 — the report is not in the round's committed bytes.** `git ls-tree -r --name-only a89f193 | grep -c ufo/reports` → `1` (only `fleet-round-1-attempt-20261015`). Committed-only detection may say "no per-attempt grade exists", never "this sentence is wrong".

## 2. Minimal deterministic rule (committed bytes only)

```
derive(rev, N):
  files = git ls-tree -r --name-only rev -- .ufo/waves/round-N
  for f in files endswith .json:                       # commit bytes, never worktree
      s = git show rev:f
      acts   ∪= { normalize(id) for /\bTabiR(\d+)(?:-(\d+))?\b/g in json(s) if \1 == N }
      stamps ∪= { s.at, s.createdAt, s.openedAt, s.updatedAt }        # recursive walk
  commits = git log --format=%ct <round-base>..rev                  # committer time
  timeline = sort(commits + stamps)
  gaps = { (t0,t1) adjacent : t1-t0 >= 12h and 0 commits strictly inside }
  if len(acts) <= 1 and not gaps: need_all, need_silent = 0, 0       # single actuator => vacuous
  else:                           need_all, need_silent = max(len(acts),1), len(gaps)
  tokens = { (attempt, grade) : paragraph of a committed surface contains
             /Stale-lane\b[^\n]*\battempt=(\S+?)\b/ AND /\b(progressing|silent|stalled)\b/ }
  surfaces = .ufo/waves/round-N/{report.md,stale-lane.md}, LOG.md round-N section,
             corpus/lessons/round-N.md          # paragraph scope, so 80-col wrapping is safe
  finding iff |distinct(tokens.attempt)| < need_all
           or |{t : t.grade in {silent,stalled}}| < need_silent
```
Measured: round-22 `acts={TabiR22,TabiR22-2}`, `gaps=[85.3 h, 0 commits]` ⇒ need 2/1, tokens 0 ⇒ **finding**. Round-21 `acts={TabiR21}`, `gaps=[]` ⇒ need 0/0, tokens 0 ⇒ **clean**. A bare global `Stale-lane: none` neither satisfies nor is required: it is discarded as ungraded when need > 0. Regex check: `grade-scan.py` prints `green_fixture_tokens=[('1','progressing'),('2','silent'),('3','progressing')]` and `real_report_paragraph_tokens=[]`.

## 3. Fixtures

- **RED** = `a89f193`, round 22, **no mutation**: expect `{class:"c4-stale-attempts", cited:{graded_tokens:0,
  surfaces:["LOG.md#round-22","corpus/lessons/round-22.md"]}, derived:{acts:["TabiR22","TabiR22-2"],
  silent_gap:"2026-10-21T17:14:05Z→2026-10-25T06:31:37Z 85.3 h 0 commits", need_all:2, need_silent:1}}`.
- **GREEN** = same rev + one commit adding `.ufo/waves/round-22/stale-lane.md` with three graded paragraphs (attempt=1 progressing / attempt=2 silent / attempt=3 progressing); validated copy already at `.ufo/waves/round-23/scratch/L1Tabi23.D4StaleAttempts/green-stale-lane.md`. Expect 0 findings.
- **GREEN-mutant tightness**: delete the `attempt=2 … silent` paragraph → 2 tokens, 0 silent ⇒ the class re-trips (`need_silent=1`). The green fixture is minimal, not merely longer.

## 4. Brittleness named

- **B1 "attempt" is three namespaces.** Wave spawn attempts collide — `attempt: 12` exists in both `w2-cap-refusal-12.json` and `w2b-spawn-result.json`, and the budget is per-wave (W2b restarts at 1 while its spawn record says 12). A global distinct-`attempt` count gives 26–27, not 3. c4 binds the **actuator/dispatch** namespace; wave spawn arithmetic is `c1`.
- **B2 identity normalization.** Four raw strings (`TabiR22-2`, `TabiR22-2 (session-3 replacement)`, `… replacement L1`, `TabiR22-2 …`) collapse to one id, and `TabiR21 L1; author-side…` appears inside round-22 bytes as quoted text: filter `\bTabiR(\d+)` by `\1 == N` or `A` inflates to 3–4.
- **B3 absence alone is not the defect.** Both rounds have 0 graded tokens; only multiplicity/gap separates them. Requiring ≥1 graded line unconditionally turns the round-21 control red — the vacuous single-actuator branch must be explicit.
- **B4 window threshold.** 12 h is chosen; round-22's gap is 85.3 h, round-21's largest is < 6 h (`git log --format=%ct e7cf11a..5f58577`). Receipts reset the clock (F4 lineage covers the shared window), so a research-only round must **explain** a quiet window with `silent`, not omit it.
- **B5 time source.** Use committer `%ct` and half-open `--since/--until`: the attempt-2 window is `…20:41:38-03` → `…03:23:44-03`, and `47bfb5f` (06:31:37Z) sits 7 min 53 s after it — an inclusive bound hides the silence.
- **B6 why a single-dispatch round must not trip.** With one actuator there is nothing to distinguish, so one line is a complete grade; `need_all=0` makes the check vacuous there. Accepted cost: c4 is blind to a *wrong* single line (a binding class, not this one).
- **B7 cite-ability.** Round 22's graded line lives only in the fleet report (F7), so the auditor emits "no committed per-attempt grading" without quoting it. Round 23 should commit `report.md` or `stale-lane.md` under its wave dir so the clean path is the normal path.

## 5. Unknowns

Attempt-3's session identity is unbound: no committed field links `47bfb5f`/`fbee618`/`be271a2` to `TabiR22-2`, so grades are keyed by attempt window, never by identity. Whether dispatch 2 was a host stall or an operator stop is derivable from neither committed bytes nor the watchdog (no status line between `:1087` and `:1257`).
