# CritScopeProvince — C1 axis fit (PROVINCE domain vs meta-tooling)

Verdict: **in scope as a lane capability — but the frozen C1 wording over-claims its own input.**
The auditor belongs to tabi's *operability* axis, not another lane; admissible only if its cited side is
an explicit pinned pointer and it never writes. As declared ("`--rev`/`--round` only, six classes from a
round's committed wave bytes") it cannot resolve c4, c6, or c2's thresholds from lane-committed bytes.

## 1. Axis fit — not meta-tooling that belongs elsewhere

- PROVINCE.md scopes *owns* as **surfaces**, and the lane already owns committed-byte instruments over
  them: `scripts/check-round-contract.mjs:2` ("Reads committed tabi round files only. A miss exits
  non-zero") plus `check-sources`, `check-freshness`, `check-adjacency`, `check-measurement-binding`.
- Operability is credited exactly this way round after round: `SCORECARD.md` rows read "enforced
  measurement-binding contract 0→1", "jj-anchor-safe behaviour-bearing gate entries 0→4", "six finite
  hazards 0→6". An instrument detecting the lane's own defect classes is the axis's established currency.
- No browser claim, so it cannot inflate depth/freshness; C1 claims no scalar move.

## 2. What makes it admissible anyway

- It binds **this lane's own acquisition evidence**: all six classes are tabi round-22 defects already
  routed in lane bytes (`corpus/lessons/round-22-verifier-spotcheck.md` §Routed defects). It replaces a
  human spot-check of the lane's own work, which QUALITY 6 (lane-owned gate, pinned inputs, self-tested
  refusals) and 60 (known-present/known-absent controls before an all-negative verdict) demand.
- Precedent for the shape exists: a gate that reads only at a revision and exits non-zero on a miss.
- It stays falsifiable on frozen bytes: c1 and c5 are fully derivable (§4), so a partial miss is reportable.

## 3. Overreach, with the boundary

- **Other lanes / fleet rounds** — needs a committed `corpus/adjacency.tsv` row; present rows cover only
  cdp, RE, publishing, profile lease, secrets, plugin internals, census. Absent a row: report, never
  absorb (PROVINCE.md "Out of province → report, never absorb").
- **Owning wave policy** — 64/128 are fleet-authored. `.ufo/prompts/` is untracked and absent
  (`git ls-tree -r --name-only a89f193 -- .ufo/prompts | wc -l` → `0`; `ls .ufo/prompts` → nothing), so a
  hard-coded 64/128 is a *second* authority; reading `spec.maxLanes` as the limit is circular — the spec
  is the object under check. Caps must be declared, pinned, echoed inputs.
- **Judging seats** — shapes and arithmetic only; a gate verdict is not non-author judgment (QUALITY
  57/58; claims `notClaimed`).
- **Repairing findings** — a `--fix` would delete its own future control and mint evidence; refused.

## 4. Derivable at baseline `a89f1935f523a64b00991d792fca6a8c0d321948`

| Class | cited side | derived side | reachable at `--rev` in lane? |
|---|---|---|---|
| c1 refusal arithmetic | `SCORECARD.md:1111` "23 whole-payload"; `corpus/lessons/round-22.md:130` "23" | `git ls-tree -r --name-only a89f193 -- .ufo/waves/round-22 \| grep -c cap-refusal` → 24 (13 w2 @64 + 11 w2b @65) | **yes** |
| c2 caps | needs 64/128 | `w2b-spec.json` `maxLanes:65`; spec sum 64+64+65 = **193**, not the cited 129 | **no** — policy untracked; seats must come from spawn/validated counts, never specs |
| c3 Gate row | `corpus/lessons/round-22.md:13` `## Gate`, lines 13–30 without a spot-check line | section lacks `/spot-check\|owed to closure/` | **shape yes / rule no** — `git cat-file -e a89f193:LEARNING.md` → fatal, absent |
| c4 stale attempts | report's single `Stale-lane: none` | per-attempt commits | **no** — `w2-attempt02-result.json` is only cap-failure `text`, no stamp; `git grep -n "Stale-lane" a89f193 -- .` hits only round-12 |
| c5 registry ids | (self-evidencing) | `git show a89f193:.ufo/waves/round-22/w2b/swarm-registry.json \| grep -c '"agentId": null'` → 65; round-21 registries → 0 | **yes** |
| c6 landed-log | report's landed row citing `47bfb5f` | `git show --name-only 47bfb5f \| grep -c '^LOG.md$'` → 0 | **no** — lane `reports/` only `user-*`; `.ufo/reports` tracked = 1 unrelated |

Smallest safe correction: keep the frozen 0→6 target, add **optional** pinned read-only inputs
`--report <repo>@<40hex>:<path>` and `--policy <repo>@<40hex>:<path>` (QUALITY 28 sanctions that form;
`adjacency.tsv` uses `fleet@b6b3b5e…`), echo both pins in `--json`, and emit `c4-unverifiable` /
`c6-unverifiable` **as findings** when a pointer is absent — never a silent 0 (QUALITY 60). Without it the
honest result is 4/6 + two unverifiable, and C1 must report the miss under its kill rule.

## 5. Output-contract defects to fix before the L1 writes it

- `classes:6` must be **derived** (classes actually evaluated) with a per-class status array; a literal 6
  is the skip-work surface `claims.json` forbids.
- `--selftest`'s 12 class cases omit the revision-refusal grammar (QUALITY 6 + 42): `HEAD`, `@`, `master`,
  a 7–12-hex short hash, a full hash off the declared branch each need a red case with exit 2 and the
  shape-correct reason token, or the claim names them untested (27).
- Fixture independence: the six expectations are authored *from* the round-22 spot-check lesson, so only
  the clean fixture + round-21 control are independent — and round-21 clears c2/c5 only (0 null
  `agentId`; `maxLanes` 64/64 = 128). Mutants must perturb *inputs* (a report digit, a registry id, a
  commit's LOG presence), never a precomputed answer table.

## 6. May it write? No — and that is load-bearing

Audit path read-only: stdout/`--json` only, nothing under `.ufo/waves/**`, `corpus/**` or the scanned
tree; `--selftest` fixtures in memory or a temp dir (as `check-round-contract.mjs` already does). Why:
(a) a findings file inside the scanned tree becomes a citable receipt, so a later run can "find" its own
output — self-authenticating evidence, excluded by QUALITY 30/60; (b) the 0-findings control must be an
*input*, not a product; (c) write churn would force the L1's no-harm surface to diff a tree the auditor
touched, voiding criterion 45; (d) fixing erases the defect class for later rounds. No tool install or
upgrade was needed (no pacman/uv/npm/cargo transaction; host pacman remains paused).
