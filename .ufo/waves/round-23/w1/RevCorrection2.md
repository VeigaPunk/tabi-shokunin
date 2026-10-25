# RevCorrection2 — append-only corrections for round-22 routed defects 3–6

Verdict: **draft-only, not landed** — the block below is text for the L1 to append at EOF of `corpus/lessons/round-22.md`; this seat edited no tracked file, ran no git/jj write, and claims no fix it cannot show.

Re-read: frozen `claims.json`; `corpus/lessons/round-22-verifier-spotcheck.md:212-226`; round-22 wave receipts; `../ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` and `ufo-swarm-registry.mjs`. The fleet report `.ufo/reports/round-22/tabi.md` is outside this seat's scope, so its Stale-lane sentence is quoted through the spot-check, never re-derived.

## Append block (append at EOF of corpus/lessons/round-22.md; rewrite nothing already filed)

### C3 — the Gate spot-check row, closed by round 23

Supersedes spot-check defect 3 (`:212-214`). The spot-check is on record at `corpus/lessons/round-22-verifier-spotcheck.md`, committed `a89f193`, authored by the non-author hyaku closure: 1 admit + 3 refusal rulings + 1 register-input binding, all five `**agree**` (`:154-177`); six defects routed (`:200-226`), none unlearned.

Round 23's lesson Gate carries this row:

> Spot-check: `corpus/lessons/round-22-verifier-spotcheck.md` @ `a89f193` — non-author, 5/5 `agree` (1 admit, 3 refusal rulings, 1 input binding); 6 defects routed, answered by this file's appended `## Corrections`.

Check for whoever lands round 23: extract `## Gate` from `corpus/lessons/round-23.md`, then `grep -c 'spot-check'` on those lines ≥ 1. State now: **not shown** — `corpus/lessons/round-23.md` does not exist (`glob corpus/lessons/round-23.md` → 0 matches), so the row is drafted for the ScribeGate paste, not landed here.

### C4 — Stale-lane graded per landing attempt

Supersedes the report's single `Stale-lane: none` line (spot-check `:215-218`):

| Attempt | Committed window (lane tip `a89f193`) | Grade |
|---|---|---|
| 1 | `0f24164` 2026-10-21 11:51:39 -0300 → `e3cf4e0` 13:38:27 | progressing: 2 commits, oracle repair |
| 2 | dispatched `2026-10-23T20:41:38-03:00` (spot-check `:216`) | **silent**: 0 tabi commits, no receipt names it |
| 3 | `47bfb5f` 03:31:37 → `fbee618` 03:36:54 → `be271a2` 03:38:49 | delivered; report `69449ed` lands last |

`git log --since=2026-10-21T13:40 --until=2026-10-25T03:30 --oneline | wc -l` → `0`: the attempt-2 window. An attempt is graded `silent`, never `none` — it existed and left no byte. Wave counters are per wave and restart at 1: W2 carries attempts `1-9,11-14` (13 receipts; attempt 10 unrecorded), W2b `1-11` then spawn at 12 (`jq -r .attempt .ufo/waves/round-22/w2*-cap-refusal-*.json | sort -n`), so a per-attempt line must name the counter it grades.

### C5 — registry seat identities, and what round 23 records instead

Supersedes "member names only — no agent ids for W2b" (spot-check `:219-222`). State at `a89f193`: `jq '[.members|length,([.members[]|select(.agentId==null)]|length),(.updatedAt==.createdAt)]' .ufo/waves/round-22/w2b/swarm-registry.json` → `[65,65,true]` — `record` never ran (`createdAt` = `updatedAt` = `2026-10-21T16:40:54.992Z`). W1 shows the working shape: `w1-record.json` points at `.ufo/waves/round-22/w1/swarm-registry.json`, `updatedAt` `14:50:56.824Z` > `createdAt` `14:50:08.565Z`, members carry `agentId: "TabiR22.BuildOracle"`.

The handles were recoverable all along: `jq -r '.result.text' .ufo/waves/round-22/w2b-spawn-result.json | grep -oE 'TabiR22-2\.[A-Za-z0-9]+-[0-9]+' | sort -u | wc -l` → `65` (47 `-12`, 18 `-16`), the 7 dead seats included. 58 reports exist (`git ls-tree --name-only be271a2 -- .ufo/waves/round-22/w2b/ | grep -c '\.md$'` → `58`), and `comm -23 <(registry keys) <(report basenames)` names the 7 dead: `RowOutcome10`, `RepairLandingErrors`, `RepairMaskedFixture`, `ReviewIncludesMatching`, `ReviewPositiveControl`, `ReviewSourceHeader`, `ReviewEvidenceBinding`.

**`record` is the mechanism that supplies `agentId`.** `ufo-swarm-wave.mjs:60` (usage `record --registry <path> --assignments <json>`), `:1786-1788` ("once the batched task call returns agent ids, the operator records them"), `:1947` `entry.agentId = agentId;` — the member field is `agentId` on every `ufo-swarm-registry-v1` member (`:68-70`, `:1234`). It answers `unknown_member` (`:1931-1932`), `invalid_agent_id` (`:1934`; grammar `^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$`, `ufo-swarm-registry.mjs:36`), one-handle-two-members (`:1833-1838`, `:1893-1899`) and re-point (`:1941-1945`); the file's contract says it is the only writer of the registry (`:682-684`), so a hand-edit skips the lock and every check above. `--registry` must resolve beneath `UFO_PROJECT_ROOT` (`:129-131` `ROOT`, `:431-440` `gatedRegistryPath`).

Round 23 records, after the batched task call and before grading any seat: every member→handle through `record` (leaving `updatedAt > createdAt` as the receipt); one row per dead seat `{member, agentId, outcome:"no-report"}` in the wave directory instead of an id-less name; and attempt numbering stated once — W2b restarts at 1 (`w2b-cap-refusal-01.json` `attempt:1` @ `16:41:02Z`), so `attempt: 12` (`w2b-spawn-result.json:2`) is W2b-local, not W2's own attempt 12 (@ `16:30:11Z`). State at this draft: **not shown** — the round-23 W1 registry reads `[44,44]` with `createdAt == updatedAt` (`jq '[.members|length,([.members[]|select(.agentId==null)]|length)]' .ufo/waves/round-23/w1/swarm-registry.json`) and `grep -rn 'record --registry' .ufo/waves/round-23/` → no match.

### C6 — landed rows bind to the commit carrying the LOG entry

Supersedes row 2 citing `47bfb5f` (spot-check `:223-226`). `git show --name-only --format='' 47bfb5f | grep -c '^LOG.md$'` → `0`; `… fbee618 …` → `1`, and the entry "## Round22 landing — C1 met at 12, encoding revision, quarantine hand-check (2026-10-25)" is `LOG.md:1579` at `fbee618`. Correct wording: "row 2's change lands in `47bfb5f`; its LOG entry lands in `fbee618`." Rule for round 23: a landed row names one commit carrying both change and entry, or the two commits separately; a baseline/report commit carrying no entry says so.

## Not claimed

No fix is shown for C3–C6: C3 waits on `corpus/lessons/round-23.md`, C5 on a `record` run that moves `updatedAt`. C4 and C6 are wording corrections over committed bytes and need only the append. No tool installed, no network, no service, no other seat contacted; only this file was written.
