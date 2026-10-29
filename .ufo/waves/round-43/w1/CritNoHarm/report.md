# CritNoHarm — round 43 integration no-harm gates

## Axes

Primary axis: freshness (the task's no-new-red-at-freeze gate); operationally, the source-registry/operability contract is also affected. This is a gate-selection report, not a claim verdict.

## Run conditions

- Read-only shared clone: `git clone --shared --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/hyaku/tabi-r43/CritNoHarm/fleet/tabi-shokunin`; `git rev-parse --show-toplevel` printed exactly `/fast/scratch/hyaku/tabi-r43/CritNoHarm/fleet/tabi-shokunin` before either checkout. Both requested commits were checked out detached and `git status --porcelain` was empty at each.
- Ran every listed gate at baseline `ab592825cd195599822ca227f7768914df208201` and freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`, inside the cloned lane, except the fleet census which was rooted at a scratch fleet directory containing the same read-only-copied `shokunin.conf` and cloned lane.
- `node --version` → `v26.12.0`. No tools installed or updated; PACMAN was not run. `~/.omp/agent/RULES.md` was read.
- All invocations were local/read-only. No `--live` option or network request was used. The round-43 frontier probe below is therefore committed-byte mode.

## Integration checklist — exact invocations and observed exits

Run in the clean clone at the candidate revision (checkout the candidate first):

1. `node scripts/check-sources.mjs` — baseline **0**, clean (`rows=149`, `findings=0`); freeze **1**, `FINDING id=used_by_missing fleet=E11 row=S150 detail=path_missing` and the same for S151 (`rows=151`, `findings=2`).
2. `node scripts/check-selfassessment.mjs --rev HEAD --json` — baseline **0**, `mismatches=0`; freeze **0**, `mismatches=0`.
3. `node scripts/check-freshness.mjs --worktree` — baseline **0**, freeze **0**; both end with `FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production`.
4. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /fast/scratch/hyaku/tabi-r43/CritNoHarm/fleet tabi` — baseline **0**, 20 existing W04 warnings then `tabi ok`; freeze **1**, same 20 W04 warnings plus E11 for S150 and S151 (full stdout in `evidence/census-outputs.txt`).
5. `node scripts/check-frontier-admission.mjs --rev HEAD --frontier playwright-firefox-loopback-tcp --since 2026-10-29 --json` — baseline **1**, freeze **1**. Both have `population=0`, `admitted=0`, `failing=0`, `entries=[]`, `clean=false`; only `rev` differs. This is the production-mode C1-label/date probe, not `--selftest`; `--live` was intentionally omitted under the no-network bound.
6. `node scripts/check-c2-knowledge-round41.mjs --root /fast/scratch/hyaku/tabi-r43/CritNoHarm/fleet/tabi-shokunin` — baseline **1**, freeze **1**, identical stdout: `{"schema":"tabi-r41-c2-knowledge","predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}`.

For freshness invocation selection: `--worktree` is the documented candidate-only mode, mutually exclusive with `--witness REV` and `--self-test`; it reads the current worktree and local public allowlist, not an arbitrary revision. Running it after checking out each target in the clean clone is the correct production-mode comparison. For a revision witness without checkout, the documented mode is `--witness REV`.

## Finding / strongest counterexample

The freeze introduces a new red relative to baseline in both source-registry gates. The exact census output identifies committed rows S150/S151 as E11 because both `used-by` fields resolve to the absent `corpus/knowledge/receipt-authenticity-signing-round-43.md`. The lane gate independently reports those same two `used_by_missing` findings. This is not one of the declared pre-existing reds: baseline has neither finding and both source gates exit 0 there. The two specified old reds reproduce at both revisions with unchanged predicates/findings.

Impact: freshness no-harm acceptance must not call the frozen snapshot green; the source-registry integrity/operability checks are newly red at freeze. Other tested checklist entries retained their baseline status, including selfassessment and freshness. The frontier and round-41 C2 exits are expected old reds for the chosen production probes, not new regressions.

Smallest safe correction: do not amend frozen claims, counters, or checkers. Route this freeze-time red. Before final integration acceptance, either land the intended note at the exact committed path `corpus/knowledge/receipt-authenticity-signing-round-43.md` (if it is the planned S150/S151 used-by target), or correct the two used-by pointers in an authorized later change if that target is not intended; then rerun checklist items 1 and 4 at the final candidate. Until one of those committed-byte states is observed, keep this as a finding rather than treating it as a pass.

## Evidence and limits

- This report contains the exact commands, exits, and decisive outputs; `evidence/census-outputs.txt` contains complete census stdout for baseline and freeze, including all unchanged W04 warnings and the new E11 lines.
- The source registry and checkers were not edited. No browser run, remote source reopen, HTTP request, self-test mode, or filesystem changes outside this seat directory and deleted scratch were performed.
- Producer-pinned Node is v24.21.0 in the frozen claim; these no-harm gate scripts were exercised with the available Node v26.12.0. The measurement producer was not run, so this does not establish its runtime pin.

VERDICT finding freeze adds E11 used-by-missing for S150/S151; keep the two affected source gates in the integration checklist
