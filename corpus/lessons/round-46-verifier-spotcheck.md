author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# tabi round 46 — verifier spot-check (non-author closure)

Lane repo: `C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/fleet/tabi-shokunin`
(branch `master`), HEAD `9de5a79b31a9a164f7907763ed5ed7576d43e608` at closure.
Baseline `fe16cf6631e44ad0962cecf4c7c099b8d72efde5` → cited measured revision
`e2d59f729615e1c671ce44d1f4bed28e51f78a4f` → tip `9de5a79b31a9a164f7907763ed5ed7576d43e608`.
Report: `C:/Users/jpvei/.zcode/workspace/95b1ba4d-5089-47a4-9fd8-54adebbce2ae/shokunin-clone/shokunin/.ufo/reports/round-46/tabi.md`.
This file is written by the non-author closure judge; the orchestrator commits it. No lane-authored
file was edited; no `[x]` was written into `SHONEN.md`.

## 1. Step-1 conformance

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an <%ae> %H' -1 -- .ufo/reports/round-46/tabi.md` | `tabi-shokunin <tabi@shokunin.local> 5ae8d009be6cfe8f9a7770fad93ad5a9d31b7c88` | pass |
| `SHONEN` heading | read report | `## SHONEN` with four `[~]` lines + pointers | pass |
| Cited lane commits exist + are ancestors | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> refs/heads/master` for fe16cf66, 79b297f1, 951f70d3, 3b8a68dc, fd44a1b3, e2d59f72, 1eb1eb3f, 9de5a79b | all 8 exist, all `OK ancestor` | pass |
| Branch tip pushed | `git ls-remote origin refs/heads/master` vs `git rev-parse refs/heads/master` | both `9de5a79b31a9a164f7907763ed5ed7576d43e608` | pass |
| Dispatch/complete digest | grep `.ufo/watchdog.log` | `2026-10-31T22:44:35-07:00 launch tabi round=46 base=fe16cf6631e4 (zcode run14)` / `2026-11-01T00:07:38-07:00 complete tabi round=46 head=9de5a79b31a9 pushed=True` — matches the closure contract's digest | pass |
| Round work reachable | range fe16cf66..9de5a79b contains all cited commits | yes | pass |
| Report is not a marker | report carries work, evidence pointers, landed-changes table, measurements, commit hashes | real report | pass |

Prompt-fidelity note: the dispatched prompt `.ufo/prompts/tabi-round-46.md` embeds the claim rules,
frontier step, report contract, commit/push/L0 duties, and the FRESH-START binding (§7). Prompt-file
commit fidelity in the fleet repo was not separately diffed this round (host index constraint); the
rendered prompt the lane worked from satisfies the contract.

## 2. Claim re-checks

Method note per the gate standard: the lane's counter/meter/selftests were **evidence-verified**
(committed receipts, tallies, frozen digests, revision named) — never executed by the closure.
C1 additionally got a **live re-measurement** run by the closure itself (the committed runner, one
throwaway-profile full run) — the closure's own instruments, not the lane's gate.

### C1 — operability: the r45 teardown-orphan repair (sourced S155) — VERIFIED (re-measured live + evidence-verified)

Before (re-derived by closure):
- `git grep -c Win32_Process fe16cf6631e4… -- scripts` → no matches (exit 1, count 0). Observed.
- `git ls-tree fe16cf6631e4… -- corpus/evidence/round46 | wc -l` → `0`. Observed.

Freeze integrity (re-derived by closure): all six instruments named in the frozen `claims.json`
hash to exactly the frozen digests at the cited revision and are blob-identical
freeze → cited revision → tip (e.g. runner `557a3f06…bb9a4`, counter `acd1e9e3…c6ec`, meter
`e3d074e3…6aaa`). Independently reproduces the committed receipt
`.ufo/waves/round-46/measure/c1-committed-bytes-at-cited-rev.txt`.

Committed evidence (read, not executed):
- Live red `measure/c1-legacy-edge.json`: Edge `Edg/156.0.4314.50`, `preLaunchSweepCount: 0`,
  legacy teardown → `legacyTreeKill` exit **128** ("ERROR: The process \"25632\" not found."),
  `orphansAfterLegacyTeardown.count: **16**` (15 `msedge.exe` + 1 `identity_helper.exe`, all
  carrying the launch token), keyed recovery killed all 16 pids → `finalSweepCount: 0`. Matches
  the report's red limb.
- Mechanism fixture `measure/c1-mech-redgreen.json`: real OS processes (main + 2 helpers), main
  SIGKILLed, legacy tree-kill replica exit 128 no-op, `survivorsAfterLegacyTeardown.count: 1`,
  keyed kill → `postKeyedKillSweepCount: 0`, `mechanismRed: true`, `mechanismGreen: true`, `ok: true`.
- Repaired full runs: edge `corpus/evidence/round46/edge-cdp/receipt.json` (pre-launch 0, mid-run
  census **16**, `chromeTerminated: true`, `postKillSweepCount: 0`); chrome
  `corpus/evidence/round46/chrome-cdp/receipt.json` (mid-run **10**, sweep 0); edge repro
  `measure/c1-edge-repro-receipt.json` (fresh key `edge-profile-a8a4ad8890b4`, mid-run 16, sweep 0).
  Screenshot sha256 `4e2c50b4a9b96e290cc054cd33ade32c528a3070d53dc989bc2aa1b609ed579c`, PNG 8,229 B
  — recomputed by closure from the committed PNG; edge and edge-repro receipts both pin it
  (byte-identical screenshot as claimed).
- Counter receipts: `predicate: true, findingCount: 0` on all three committed receipt byte sets;
  cross-refusal `controls/c1-counter-refuses-r45-receipt.json` → `predicate: false`,
  `findingCount: 8` on the r45 receipt; selftest `measure/c1-counter-selftest.json` →
  `verdict=clean cases=18 passed=18`.

Closure's own live re-run (this host, 2026-11-01, throwaway profile, committed runner bytes
extracted by hash to scratch):

```
node chrome-cdp-loopback-round46.mjs --browser edge --out <scratch>/verifier-rerun-receipt.json \
  --shot <scratch>/verifier-rerun-shot.png --scratch <scratch>/scratch
→ exit 0
{"ok":true,"declaredSurface":"edge",…,"invocationBound":true,
 "screenshotSha256":"4e2c50b4a9b96e290cc054cd33ade32c528a3070d53dc989bc2aa1b609ed579c",
 "pngByteLength":8229,"browser":"Edg/156.0.4314.50","wsHost":"127.0.0.1:64769",
 "launchKey":"edge-profile-a3bcb9a230f2","midRunSweepCount":16,
 "postKillSweepCount":0,"legacyTreeKillExit":0}
```

Receipt fields: `preLaunchSweepCount: 0`, `midRunSweep.count: 16`, `invocationBound: true`,
`markerFound: true`, `chromeTerminated: true`, `postKillSweepCount: 0` (2 keyed sweep rounds);
fixture and DevTools endpoints both 127.0.0.1. The re-run's screenshot hash is byte-identical to
the committed one (deterministic loopback fixture), exactly the repro property the lane claimed.

Closure's own independent process sweep for the run's token (PowerShell `Get-CimInstance
Win32_Process` filtered on `edge-profile-a3bcb9a230f2`): 3 matches, all `bash.exe` of this
verification session embedding the token string in their own command lines (the same artifact class
the lane's round-close hygiene receipt discloses); excluding shell/interpreter images →
`nonShellCount=0`, and `msedge` processes referencing the verifier profile path → `0`. No orphan
survived the repaired teardown. **`postKillSweepCount: 0` confirmed by a fresh full run plus an
independent sweep.**

C1 verdict: **improved** (repair landed in committed bytes with live red and green; operability
holds 9 → 9 under the no-rubric rule; predicate (a)–(d) all observed true).

### C2 — adjacency: drifted ledger rows re-pinned, meter v6 git-at-snapshot-head — VERIFIED (evidence-verified + closure re-derived samples)

Before (re-derived by closure):
- `git show 0360b069…:corpus/adjacency-host-audit-r45.tsv` status histogram → `9 stale`,
  `1 moved`, `6 sibling-absent` (+1 header). Observed.
- Committed red control `controls/c2-meter-red-at-baseline.json`: `rev: fe16cf66…`,
  `predicate: false`, `findingCount: 28` — 16 `audit-missing` + 12 `roster-lane-uncovered`.

After:
- `git show 9de5a79b…:corpus/adjacency-host-audit-r46.tsv | grep -c '^stale'` → `0`;
  `grep -c '^moved'` → `0`; the ledger reads 10 `unchanged` (re-pinned) + 6 `sibling-absent`.
- Green receipt `measure/c2-meter-green-at-measured.json`: `rev: e2d59f72…`, `predicate: true`,
  `findingCount: 0`, counts `{roster:16, mapRows:16, auditRows:16, deltaLanes:12}`; its
  `headSnapshot` records all 16 sibling heads, and every re-pinned map row's `sibling_ref` head
  equals the snapshot head for its lane (kake `1772f82c`, kagi `bc2f3fd6`, kumitate `89cbd998`,
  kama `22b9c16d` — each cross-checked by closure).
- Meter selftest receipt `measure/c2-meter-selftest.json`: `allPass: true, cases: 16, pass: 16`.
- Delta ledger: 12 `lane` rows + 14 `line` rows at the snapshot.

Re-pin sample (6 of 10 re-pinned rows re-derived by closure with plain
`git -C <sibling> show <head>:<path>` and line-exact comparison against the map's `sibling_quote`):

| Row | Ref | Result |
|---|---|---|
| crawler-discipline-vs-publishing | kake `1772f82c`:PROVINCE.md:40 | MATCH (line-exact) |
| musketeer-cdp-9222-profile-lease | kagi `bc2f3fd6`:PROVINCE.md:64 | MATCH (full long line) |
| kimi-webbridge-plugin-internals | kumitate `89cbd998`:SCORECARD.md:1723 | MATCH |
| cdp-live-target-census | kama `22b9c16d`:corpus/knowledge/listener-census.md:355 | MATCH |
| lab-performance-tool-runs | kake `1772f82c`:SKILL.md:697 | MATCH |
| accessibility-browser-at-execution (the row r45 recorded as moved :79 → :85) | kake `1772f82c`:PROVINCE.md:85 | MATCH |

The 6 sibling-absent rows (kaidoku ×4, revenger ×2) honestly stay absent with the roster-probe
note; their refs pin the last-known heads, which is the recorded disposition, not a smoothing.

Two mid-measurement move catches (re-derived from the correction diffs; instruments untouched —
the diffs touch only `corpus/adjacency.tsv` and the two r46 ledgers):
- Correction 1 `3b8a68dc`: delta row `shokunin-reverse-engineering` re-bound
  `90f3a9b9…` → `79421b75…` (province bytes hash unchanged `50b6c259…`), the head the v6
  `lane-screen-head-mismatch` binding caught; `79421b75` equals the final snapshot head and exists
  in the sibling (`git cat-file -e` OK).
- Correction 3 `e2d59f72`: kama map ref re-bound `8b6ed3b6…` → `22b9c16d…` (pinned line unmoved —
  "pin holds at the snapshot head"); chousa `02d9b9ab…` → `1db6babf…` and kasegi
  `d9710d21…` → `586cdda4…` delta re-binds; both equal the final snapshot heads and exist.

C2 verdict: **improved** (the 10 drifted rows re-pinned at recorded snapshot heads with full-line
quotes; drift 9 stale + 1 moved → 0 + 0; the v6 head binding demonstrably caught two real sibling
races and the frozen data-correction flow resolved them; adjacency holds 8 → 8 under the no-rubric
rule).

## 3. No-harm check

- `git diff-tree -r --stat fe16cf66 9de5a79b -- SCORECARD.md` → **+56 / −0** (purely additive
  round-46 block; the teardown repair is listed explicitly as the C1 row). No axis score edited;
  spot reads of the block confirm operability 9 → 9, adjacency 8 → 8.
- Round diff scope `fe16cf66..9de5a79b`: only lane-repo paths under the lane's write scope
  (`.ufo/waves/round-46/`, `corpus/`, `scripts/chrome-cdp-loopback-round46.mjs`, `LOG.md`,
  `SCORECARD.md`). `PROVINCE.md`, `SHONEN.md`, `SKILL.md` untouched; no `[x]` written into
  `SHONEN.md` (all four boxes remain `[~]`); `LOG.md` diff has **0 deletions** (append-only holds;
  `## Round 46 — 2026-10-31 …` appended).
- Host-bound shared gate honestly recorded, not patched:
  `measure/c2-check-adjacency-hostbound.json` — `scripts/check-adjacency.mjs` exits 2
  `could_not_evaluate` (`git_failed`, status=spawn) because `minimalEnv()` rebuilds PATH the Linux
  way; the quote-at-pinned-rev duty for every changed row is carried by the v6 meter's full-line
  equality at the snapshot head (strictly stronger); repair routed. Agreed — this is the correct
  disposition (frozen bytes not amended post-data).
- check-selfassessment disclosure: `measure/selfassessment-precommit.txt` carries both readings;
  candidate verdict honestly `failed` with `mismatches=1` = `m3-unlanded-paths` (pre-commit
  artifact, expected), and the baseline comparison note asserts the finding set is pre-existing.
  See defect V3 below on the note's "five readings" wording.

## 4. Discernment spot-check (outside, non-author)

Census (run by closure at round close):
`bash <fleet>/scripts/sources-census.sh validate --root <fleet> tabi` → **exit 0**, final line
`tabi ok …/corpus/SOURCES.md` (21 W04 duplicate-URL warnings — the same pre-existing set the
committed `census-start.txt` / `census-end.txt` receipts disclose). Agrees.

New SOURCES row re-opened: **S155 — Win32_Process class**
(https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process).
- Staged copy `.ufo/waves/round-46/sources/win32-process.html` sha256 recomputed →
  `317f30f2b10c2dc7fbfc3e42a76b1cc914189c41e78362682061b85e1558d253` — equals the row's recorded
  digest; quote "Command line used to start a specific process, if applicable." → 1 hit in the raw
  bytes.
- Live page re-opened (fresh fetch at closure): the sentence appears verbatim as the description of
  the **CommandLine** property — the exact surface the keyed sweep matches. Quote ≤25 words,
  located (property section). Tier A (official docs) is right for this scope.
- Defect V1 (below) is the only disagreement, and it is numeric, not substantive.

Gate sample (lesson `corpus/lessons/round-46.md` `## Gate`):

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S155 Win32_Process class | admit | live MS Learn URL + committed staged copy (hash + 1-quote hit) | agree | quote verbatim at the CommandLine property; load-bearing and correctly tiered; see V1 for the byte-count slip |
| Teardown repair demonstration (C1) | admit | lane receipts + closure's own live re-run and independent sweep | agree | red limb reproduced live (16 orphans, no-op tree kill), green limb re-derived by a fresh full run at sweep 0 with no orphans |
| Adjacency re-pin (C2) | admit | closure's own `git show` line-exact re-derivations at pinned heads | agree | 6/10 re-pins re-derived exactly; 0 stale / 0 moved in committed bytes; meter receipts consistent |
| First counter selftest run (1/18: `Array.isArray(td.keyedSweep \|\| {}).rounds` always falsy) | reject (fixed pre-freeze) | committed counter line 81 now `!td.keyedSweep \|\| !Array.isArray(td.keyedSweep.rounds)`; selftest 18/18 | agree | the described bug is real (boolean `.rounds` is undefined) and the committed fix matches the lesson's account |
| First meter run at `951f70d3` (`lane-screen-head-mismatch`, shokunin-reverse-engineering) | reject (data correction) | correction-1 diff `951f70d3..3b8a68dc` re-binds that lane's head to the snapshot | agree | the head binding demonstrably fired; the frozen correction flow was followed, instruments untouched |

## 5. Trend verdicts

| Trend | Lane said | Closure verdict | Evidence |
|---|---|---|---|
| expansion | unchanged | **unchanged** (agree) | No new coverage-map ground: the round repairs an owned instrument and re-pins ledger ground already held; the new knowledge note documents the repaired teardown on already-held ground and S155 documents the enumeration surface that repair uses. Registry 154 → 155 and notes 62 → 63 are the repair's own record, not new surface. |
| quality | improved | **improved** (agree) | The r45 carry-in defect closed in committed bytes with live red (16 orphans) and green (sweep 0) receipts; closure re-derived the green with a fresh full run + independent sweep; the v6 snapshot hardening turned two real sibling head races into caught findings; no admitted entry failed a re-check. |
| discernment | improved | **improved** (agree) | The lane's instruments refused its own outputs four times before admission (selftest 1/18; fixture survivors 0 on crashed helpers; two meter reds) with every refusal recorded and fixed; the host-bound legacy gate recorded with cause instead of silently patched; the closure's outside spot-check agrees with all five sampled gate decisions. |

## 6. Axis verdicts (closure)

| Axis | Verdict |
|---|---|
| operability | improved (C1 verified — live re-measured) |
| adjacency | improved (C2 verified — evidence + re-derived samples) |
| depth | unchanged |
| coverage | unchanged |
| freshness | unchanged |
| calibration | unchanged |

No exploratory claim was declared; the `unprovable-but-better` rule was not exercised. All claims
verify and no axis is harmed → admitted.

## 7. Routed defects for round 47 (status-neutral; none bars admission)

- **V1 (number-drift, SOURCES anchor).** The S155 anchor cell and the lesson Gate row record
  "104,251 B" for the fetched page; the committed staged copy is **104,255 B**
  (`git cat-file -s 859d441f…` → 104255). The sha256 recorded in the same cells matches the
  committed bytes, so the bytes are right and the count drifted. Fix per CORPUS.md: erratum/new-row
  correction naming the superseded count; carry the command with the count.
- **V2 (provenance trio missing).** `corpus/knowledge/chrome-cdp-teardown-round-46.md` opens with
  prose and carries **no `source:` / `verified-at:` / `recheck:` lines anywhere** — CORPUS.md
  (kaika rule) requires the trio to come first, and the lane's own recent knowledge notes
  (e.g. `webmcp-lifecycle-oracle-round-22.md`) carry all three. The note does cite its evidence
  inline (r45 lesson Mistake 5, the round-46 receipts), but the machine-readable trio is what the
  freshness sweep reads. Route: append the trio in a round-47 correction (new entry, not rewrite).
- **V3 (minor wording drift, non-claim disclosure).** The selfassessment receipt's baseline
  comparison note says "all five m1-selftest-tally readings are pre-existing"; the receipt's own
  summary reads `mismatches=1` (the `m3-unlanded-paths` pre-commit artifact) and the m1
  claimed≠observed rows marked superseded do not obviously reduce to five. The material assertion
  (nothing introduced by round 46; verdict honestly `failed` and disclosed) stands. Route: tighten
  the wording when this disclosure is next cited.
- **Operator note (SHONEN, duty 6).** All four SHONEN.md boxes remain `[~]` with resolvable
  pointers, and the round's evidence (SKILL decision tables with cited sources; the end-to-end
  launch→drive→teardown task logged in LOG.md with committed evidence; paste-able runner/counter
  usage executed verbatim from the freeze; PROVINCE untouched and accurate) looks fully checkable
  by a non-author. Per the promotion gates, only a non-author may write `[x]` — left to the
  operator; this closure does not write SHONEN.md.

## 8. Verdict

Both declared claims verify (C1 re-measured live by the closure; C2 evidence-verified with
closure re-derivations), no owned axis is harmed, conformance is clean except the status-neutral
defects V1–V3 above. tabi round 46: **ok, admitted**.
