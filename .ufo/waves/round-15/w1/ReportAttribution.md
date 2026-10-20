# tabi round-15 w1 — ReportAttribution (read-only audit)

**Provenance label: author-side.** Written by `TabiR15.ReportAttribution` (lane-dispatched leaf reviewer). This file is same-lane advisory evidence. It is NOT a non-author certification, discernment spot-check, judge verdict, SHONEN attestation, or promotion act.

Scope: lane identity on commits, commit-before-report ordering, push state, helper-fleet dispatch serialization, and author-side vs outside labeling. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Fleet root (read-only, cited for report landing): `/home/vgpnk/Projects/shokunin`.

## Run record

- Executed: read-only inspection only. `git log`, `git show`, `git status`, `git branch --contains`, `git cat-file -t`, `git config --get/--list`, and read/grep/glob over the wave artifacts, lane docs, lesson, LOG, SCORECARD, and scripts.
- NOT executed: any gate, selftest, counter, `measure.mjs`, test, build, lint, formatter, smoke run, or browser. No `fetch`/`pull`/network git. No commits, no edits to tracked files, no pushes.
- Tools installed or updated by this seat: **none**.
- Only file written: this report.

## Verified-as-observed facts (anchors)

| # | Fact | Anchor |
|---|---|---|
| O1 | Lane HEAD `7054a5e`, branch `master`, `## master...origin/master`, `ahead:0 behind:0`. Only untracked item is `.ufo/waves/round-15/`. | `git status -sb` in lane |
| O2 | Lane repo identity: `user.name=tabi-shokunin`, `user.email=tabi@shokunin.local` (repo-local). Global `~/.config/git/config` is `ci` / `ci@local`. Lane commits inherit tabi identity unless overridden. | `.git/config`; `git config --list --show-origin` |
| O3 | Last nine round-14 tabi commits (`ed69b15`…`5c7710d`) have author and committer `tabi-shokunin <tabi@shokunin.local>`; the outside verdict commit `7054a5e` is `protocol-shokunin <protocol@shokunin.local>` for both author and committer. | `git log --format='%h %an <%ae> | %cn <%ce>' bebe2ef..HEAD` |
| O4 | Round-14 report commit `fcf97cb` (`tabi-shokunin <tabi@shokunin.local>`, 2026-10-20T04:25:13-03:00, `round-14: tabi report`) is in the **fleet** repo, touching only `.ufo/reports/round-14/tabi.md` (113 insertions). It is not reachable from the lane repo (`git -C lane cat-file -t fcf97cb` → not found). It is in fleet `origin/master`. | `git -C /home/vgpnk/Projects/shokunin show --stat fcf97cb`; `git branch -r --contains` |
| O5 | Work-before-report ordering holds for round 14: lane delivery `5c7710d` 04:22:58 precedes report `fcf97cb` 04:25:13. Report states "Pushed lane HEAD: `5c7710d`… git status --short was empty before this report". Lane `origin/master` contains `5c7710d`. | `git log`; fleet `.ufo/reports/round-14/tabi.md:7,35` |
| O6 | Round-14 lesson `corpus/lessons/round-14-verifier-spotcheck.md` header reads `author: hyaku closure (non-author integrator, @m_strong)` while the committing identity is `protocol-shokunin`. | lesson line 1; `7054a5e` author |
| O7 | At HEAD, `SCORECARD.md:648-649` (round-14 discernment trend) still says "Current outside admit/reject agreement remains pending". The lesson committed at `7054a5e` (04:37:18) states agreement for one admit and one reject. No LOG.md entry references `7054a5e` or the round-14 verifier lesson; LOG tail ends at the author round-14 entry. | `SCORECARD.md:648-649`; `grep -n 7054a5e LOG.md SCORECARD.md` → none; `AGENTS.md:3` |
| O8 | Round-15 wave dir `.ufo/waves/round-15/w1/` is untracked (`??`). Prior waves (`round-12`, `round-13`, `round-14`) are tracked in lane history. | `git status`; `git ls-files .ufo/waves` |
| O9 | Round-15 dispatch shape: 64 items in `spec.json` (`items` 6–327), 64 `kind: spawn` members in `swarm-registry.json` each with `agentId` `TabiR15.<name>` (ReportAttribution at `swarm-registry.json:386-390`), one `taskCall` with 64 tasks (`validation.json:420-744`), `resumeSends: []`. Role totals sum to 64 (connector 6, critic 9, executor 3, revenger 5, reviewer 18, scout 11, scribe 8, sentinel 4). | `validation.json:12-13, 420-746`; `spec.json` role counts |
| O10 | Runtime ramp: `rampBatchSize: 5`, `rampIntervalMs: 700` → 13 batches with 12 gaps ≈ 8.4 s, inside the single batched dispatch. Protocol requires one batched call per wave (`validation.json:746` note; `PROTOCOL.md` child-lane list). | `validation.json:12-13, 746`; `PROTOCOL.md:98-99` (kimi-shokunin protocol) |
| O11 | Fleet working tree is dirty outside this lane: tracked `M .ufo/l0-questions.md`, `M .ufo/watchdog.log`; untracked `.ufo/state/*.report-baseline`. | `git -C /home/vgpnk/Projects/shokunin status --short` (read-only) |
| O12 | Round-15 `spec.json:3` context uses "Independent claims" as a claim descriptor; several item targets say "independently recomputed" / "independent per-case expectations". Round-12 already corrected this exact pattern as same-lane overclaim. | `spec.json:3,` items MetadataEnforce, CountProduction, CountHistory, MirrorQualification; precedent `.ufo/waves/round-12/w1/Safety.txt:15-18`, `ClaimAttack.txt:39-45`, `ReviewC1.txt:39-41`, `PlanningWalk.txt:61-62` |
| O13 | Lane's round-14 parser for outside verdicts expects a single line `- spot-check: non-author <id> agree|disagree — …`. The round-14 lesson uses a table, not that line form. | `scripts/check-round-contract.mjs:279-282`; `scripts/check-user-round-contract.mjs:329-332`; lesson lines 137-143 |

## Findings (ordered by severity)

### F1 — MEDIUM — outside verdict landed without LOG entry; SCORECARD still says pending
- Evidence: O6, O7. The lesson at `7054a5e` is a lane-repo change; `AGENTS.md:3` requires every change to append a `LOG.md` entry with motivating evidence. None exists for `7054a5e`. `SCORECARD.md:648-649` still reads "pending" after the verdict was committed.
- Impact: a reader of SCORECARD and LOG cannot see that the round-14 outside admit/reject agreement now exists, and cannot tie the verdict to a committed record. Outside-label truth is stored only in the lesson.
- Proposed fix (L1 owns LOG/SCORECARD; append-only, no in-place rewrite of round-14 rows): add a round-15 LOG entry citing `7054a5e` and `corpus/lessons/round-14-verifier-spotcheck.md`, naming the identity used (`protocol-shokunin`, integrator), and append a correction line to SCORECARD round-14 discernment that the outside verdict is recorded at `7054a5e` as non-author integrator material. Do not describe any author-side seat as non-author.

### F2 — MEDIUM — round-15 landing order is not yet satisfiable; no lane round commit exists
- Evidence: O1, O8. Lane HEAD is `7054a5e`, a round-14 commit. Nothing in round-15 is committed. Landed means committed (`PROTOCOL.md:119-122`): the cited hash must be the lane HEAD when the report is written and must be an ancestor of it. The fleet report path `.ufo/reports/round-15/tabi.md` does not exist yet.
- Proposed ordering for L1 (no shortcut):
  1. Commit lane work under the existing tabi repo identity, path-limited, with explicit paths (no `commit -a` / `add -A`). Wave artifacts under `.ufo/waves/round-15/w1/` are in scope as their own commit.
  2. Push lane `master` to `origin`; confirm `git -C lane status --porcelain` empty.
  3. Write the fleet report `.ufo/reports/round-15/tabi.md` citing the lane HEAD from step 1 as "Pushed lane HEAD".
  4. Commit only that path in the fleet repo, forcing the lane identity: `git -c user.name=tabi-shokunin -c user.email=tabi@shokunin.local commit -- .ufo/reports/round-15/tabi.md`. Check the staged set first (see P4).
- Precedent: `fcf97cb` in fleet used tabi identity and touched one path (O4).

### F3 — MEDIUM — fleet working tree has foreign dirty state; path-less commits would sweep it
- Evidence: O11. `.ufo/l0-questions.md` and `.ufo/watchdog.log` are tracked and modified; `.ufo/state/*.report-baseline` are untracked. None belong to this lane.
- Impact: a round-15 fleet landing using `commit -a`, `add -A`, or a directory pathspec would sweep these under tabi identity. Protocol treats a swept report as landed but attributes the defect (`PROTOCOL.md:127-129`; `PROTOCOL-APPENDIX.md:10-11`).
- Proposed: path-limited commit only (`git commit -- <path>`), and assert `git diff --cached --name-only` equals the report path before commit (P4).

### F4 — LOW–MEDIUM — "independent" wording in round-15 wave prompts repeats the round-12 mislabel
- Evidence: O12. Round-12 recorded the same wording as an overclaim: fresh author-side seats were described as "independent" re-verification (`.ufo/waves/round-12/w1/Safety.txt:15-18`; `ClaimAttack.txt:39-45`; `ReviewC1.txt:39-41`; `PlanningWalk.txt:61-62`). Protocol: non-author review requires a named non-author on record (`LEARNING.md:42-50`; `AXES.md:47-49`).
- Proposed: in round-15 LOG/SCORECARD/lesson text, replace "independent" with "same-lane author-side re-check against committed bytes" wherever it describes a seat from this wave. Reserve "non-author" for named outside verdicts (F1). Do not edit `spec.json` in place from this seat.

### F5 — LOW — round-14 lesson cites the report commit without its repo
- Evidence: O4, lesson line 33. The table row "Real, landed report | `tabi-shokunin <tabi@…> fcf97cb…`" omits that `fcf97cb` lives in the fleet repo. The command list at lesson line 23 does use the fleet path.
- Impact: a reader running `git -C tabi-shokunin cat-file -t fcf97cb` gets "not found" and may take the citation as broken.
- Proposed: round-15 LOG correction (lesson is frozen; do not edit it): "`fcf97cb` resolves in `/home/vgpnk/Projects/shokunin`, not in the lane repo."

### F6 — LOW — identity label mismatch on the round-14 outside verdict
- Evidence: O3, O6. Commit identity is `protocol-shokunin <protocol@shokunin.local>`; lesson header says `hyaku`. Integrator-identity non-author commits into the lane repo have precedent (`bebe2ef`, round-13; `7054a5e`, round-14), so this is **not** a lane-identity violation by itself.
- Proposed: the round-15 correction entry (F1) should name the committing identity and the header label together, so the attribution is not inferred from a free-text header.

### F7 — INFO (conformant) — helper-fleet dispatch serialization
- Evidence: O9, O10. One `taskCall` with 64 tasks; registry 64 spawn members with agent ids; ramp 5 per 700 ms inside that single call; no `resumeSends`. This matches the protocol rule that a wave is dispatched in one batched call and not split (`validation.json:746`; `PROTOCOL.md:98-99`).
- No defect found. Recheck after integration: the registry `agentId` count must stay at 64 and no second `task` call may appear in the round-15 record (P7).

### F8 — INFO (conformant) — round-14 report landing and push
- Evidence: O3, O4, O5. Work before report by 2m15s; all nine round-14 tabi commits carry tabi identity; report commit path-limited to one file; lane `5c7710d` and fleet `fcf97cb` both reachable from their remotes' `master` (`git branch -r --contains`).
- Not re-run: the lesson's 17-hash ancestry table (lesson line 41). Not verified by this seat.

## Routing

- No code-related defect found in this slice. Nothing routed to `MetadataEnforce` or `CounterDiagnostics`. Findings F1–F6 are documentation, LOG/SCORECARD, and landing-procedure items for L1.
- Pointer message to `TabiR15` (L1) sent with this report path.

## Proposed checks for L1 after integration (NOT executed by this seat)

- P1 — identity: `git -C <lane> log --format='%h %an <%ae> | %cn <%ce>' 7054a5e..HEAD`. Every round-15 commit must be `tabi-shokunin <tabi@shokunin.local>` on both lines; any other identity must be a named integrator commit.
- P2 — ordering: `git -C <lane> status --porcelain` empty at report time; `git -C <lane> merge-base --is-ancestor <cited-hash> HEAD` exits 0 for the cited round-15 commit.
- P3 — fleet report commit: `git -C /home/vgpnk/Projects/shokunin show --name-only --format='%h %an <%ae>' <report-commit>` lists only `.ufo/reports/round-15/tabi.md`, with tabi identity.
- P4 — staged set before fleet commit: `git -C /home/vgpnk/Projects/shokunin diff --cached --name-only` equals `.ufo/reports/round-15/tabi.md` exactly.
- P5 — label sweep: `git -C <lane> grep -n -i -E 'non-author|independent' -- LOG.md SCORECARD.md corpus/lessons .ufo/waves/round-15`; every hit that names a round-15 seat must be negated or qualified as same-lane author-side.
- P6 — outside verdict is recorded: `git -C <lane> grep -n 7054a5e -- LOG.md SCORECARD.md` non-empty after the round-15 correction; SCORECARD line for round-14 discernment no longer says "pending" without a dated correction line below it.
- P7 — dispatch count: `grep -c '"kind": "spawn"' .ufo/waves/round-15/w1/swarm-registry.json` equals 64 and `grep -c '"agentId": null'` equals 0 at integration.

## Residual risk and verification gaps

- The fleet repo's own `user.name` was not read by this seat (only the global `ci` identity was observed). P3 must confirm the commit identity actually used.
- The round-14 lesson's 17-hash ancestry claim and gate outcomes were not re-run (out of scope; no checks).
- Whether the protocol-shokunin integrator identity is acceptable for outside verdicts in the lane repo is a fleet-level rule (`PROTOCOL.md` / `MISSION.md`); this seat relied on the round-13 precedent only.
