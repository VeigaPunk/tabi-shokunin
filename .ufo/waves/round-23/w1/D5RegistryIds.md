# D5 — c5-registry-identities ground truth (W2b)

**Verdict:** CONFIRMED at `a89f1935f523a64b00991d792fca6a8c0d321948` — W2b declares 65 spawn members, **65/65 with
`agentId: null`**, **7 dead seats named without ids**. The red discriminator is "declares spawn seats AND ran seats",
not `null` alone: round-22/w2 is 64/64 null yet legitimately clean; round-21 is 0/64 null.

## 1. Registry shape (observed, rev `a89f193`)

Record union over all 21 wave registries = exactly `{kind, agentId, role, item}`; W2b rows are `{"kind":"spawn","agentId":null,"role":"reviewer","item":null}`.

- **members 65**, `kinds={"spawn":65}`, `roles={"reviewer":31,"scout":19,"critic":9,"connector":2,"mutation-tester":4}`, `nullItem=65` — `git show a89f193:.ufo/waves/round-22/w2b/swarm-registry.json | node -e '…accum kinds/roles/items'`.
- **`agentId: null` = 65/65** — same rev, `Object.keys(m).filter(x=>m[x].agentId==null).length` → `65`.
- **report artifacts = 58** — `git ls-tree -r --name-only a89f193 -- .ufo/waves/round-22/w2b | grep -c '\.md$'` → `58`.
- **dead seats (null id ∧ no `<Name>.md`) = 7**: `RepairLandingErrors, RepairMaskedFixture, ReviewEvidenceBinding, ReviewIncludesMatching, ReviewPositiveControl, ReviewSourceHeader, RowOutcome10`; `seatedWithoutId=58` — rev registry ∩ stems under `j.reportDir` → `memberCount 65, nullCount 65, reportMd 58, dead[7], seatedWithoutId 58`.
- **all 7 dispatched**: `w2b-spec.json` 65 items, `w2b-spawn-result.json` names each → `true true true` ×7 (`node -e '…console.log(d, sr.includes(d), d in reg.members, items.includes(d))'`).
- **did spawn**: `attempt 12`, `at 2026-10-21T17:14:05.171768+00:00`, `Spawned 65 background agents…`; registry `createdAt == updatedAt == 2026-10-21T16:40:54.992Z` ⇒ written **33m10s pre-spawn**, never updated.
- **controls, same rev**: `round-21/w1 0/64`, `round-21/w2 0/64`, `round-22/w1 0/64`; unspawned `round-22/w2 64/64` null, `0` `.md`, spawn-result `Failed to start background task jobs: … Background job limit reached (100)` with no `Spawned N`. [INFERENCE] registry is written pre-spawn; only a post-spawn rewrite populates ids.

## 2. Minimal deterministic rule (pseudocode)

```
for waveDir in revTree(".ufo/waves/round-<N>") matching /\/w[A-Za-z0-9-]+\/swarm-registry\.json$/:
  reg = json(rev:waveDir/swarm-registry.json)      # unparseable -> exit 2 (IO refusal), never a finding
  spawn = { n:m for n,m in (reg.members ?? {}) if m.kind == "spawn" }
  if spawn is empty: continue                      # LEGIT empty/unspawned declaration
  nullIds = [ n for n,m in spawn if typeof m.agentId != "string" or m.agentId.trim() == "" ]
  if nullIds is empty: continue                    # CLEAN identified wave (r21 w1/w2, r22 w1)
  reports = { stem(p) for p in revTree(reg.reportDir) if p endsWith ".md" }
  seated  = [ n for n in nullIds if n in reports ]   # ran, no identity
  dead    = [ n for n in nullIds if n not in reports ]  # dispatched, never reported
  spawned = int(match(/^Spawned (\d+) background agents/m, rev:"<round>/<wave>-spawn-result.json") or 0)
  if seated is empty and spawned == 0: continue     # LEGIT declared-only, never ran (r22 w2)
  emit "c5-registry-identities",
    cited=f"{len(nullIds)}/{len(spawn)} members with agentId null",
    derived={nullIds, seatedWithoutId, deadWithoutId, dead:sort(dead)},
    evidence=[registry path, f"reportDir {len(reports)} .md", f"Spawned {spawned}"]
```

Non-firing shapes, explicit: absent `swarm-registry.json`; `members` absent/`{}`; zero `kind=="spawn"` members
(future resume-only wave); all-string ids; null ids with no report artifact **and** no `Spawned N>0` receipt.

## 3. Fixtures

**RED** — `w1/swarm-registry.json` 3 members (`kind:"spawn"`, `agentId:null`, `item:null`), `w1/SeatA.md`,
`w1/SeatB.md`, `w1-spawn-result.json` `"Spawned 3 background agents…"` → expect 1 finding,
`cited="3/3 members with agentId null"`, `derived={nullIds:3, seatedWithoutId:2, deadWithoutId:1, dead:["SeatC"]}`.

**GREEN (composite, one case)** — one round dir, two waves: `w1` = 2 members ids `"R.SeatA"/"R.SeatB"` + both `.md`
+ `Spawned 2`; `w2` = 2 members `agentId:null`, `0` `.md`, spawn-result `"Failed to start background task jobs: …
Background job limit reached (100)"` → expect 0 findings. Use this composite as the selftest green, not identified-only.

## 4. Brittleness

1. **`null` alone is not the signal** — r22/w2 64/64 and r23/w1 44/44 are all-null; two are legitimately unspawned; `any null → fire` yields 3 findings and breaks both controls.
2. **Timestamps are not the signal** — `createdAt == updatedAt` also holds for r18/w1 and r18/w2, both fully identified.
3. **No-report alone is not a defect** — every wave has such members (r12/w1 32, r13/w1 32, r17/w2 26, r21/w1 18, r21/w2 6) with ids present; would fire on the r21 control.
4. **Round 23 is not a clean fixture** — `round-23/w1` is 44/44 null with 4 `.md`, so `--round 23` fires c5 as a true positive.
5. **`kind` gating is load-bearing** — all 21 registries are 100% `kind:"spawn"`; the first `resume` seat without a fresh id looks identical.
6. **Name-exact stem matching** — `RowOutcome10.report.md` or a `reportDir` subdir reclassifies a live seat as dead (today 0 orphans, 0 subdirs).
7. **`item` is null in 100% of members of all 21 registries** — seat→work binding rests entirely on `agentId`; this check must not claim to recover what the registry never carried.
8. **Read at the rev, not the worktree** — an uncommitted local report would mask a dead seat; resolve `reportDir` via `git show <rev>:`.

## 5. Findings (command each)

1. **65/65 null, not "some"** — `git show a89f193:.ufo/waves/round-22/w2b/swarm-registry.json | node -e '…agentId==null'` → `65`.
2. **Exactly 7 dead, named** — rev registry minus `j.reportDir` `.md` stems → the 7 names, `seatedWithoutId=58`.
3. **58 reports = seatedWithoutId** — `git ls-tree -r --name-only a89f193 -- .ufo/waves/round-22/w2b | grep -c '\.md$'` → `58`.
4. **All 7 dispatched** — `w2b-spec.json` 65 items + `w2b-spawn-result.json` names all 7 (`true true true` ×7).
5. **Spawn real, post-dates registry** — `attempt 12 @ 17:14:05.171Z` vs registry `16:40:54.992Z`.
6. **r22/w2 is the false-positive trap** — `null=64/64`, `0` `.md`, spawn-result = cap refusals only.
7. **r21 control clean** — `round-21/w1 0/64`, `round-21/w2 0/64` at the same rev.
8. **Separable from c4-stale-attempts** — reads only `swarm-registry.json`, report stems and `Spawned N`; never attempt numbering, so `attempt: 12` vs restart-at-1 stays c4's finding.
