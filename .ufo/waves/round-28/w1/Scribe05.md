# Scribe05 — Round 28 source gate audit

## Scope and frozen claim

Read frozen claims first: `.ufo/waves/round-28/claims.json`; observed `frozenBeforeData: true`, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, and `notClaimed` expressly says no source admission unless an already-open source is explicitly reopened and cited. This is an audit recommendation, not a claim implementation or admission decision.

## Feasible source

**S106 is the feasible source to reopen and cite**: the existing registry row is Chromium 154 `content_features.cc`, with the exact versioned Gitiles URL and a narrowly scoped feature-default claim. `.ufo/waves/round-25/w1/ScoutOpenS106.md` records source bytes and quote at decoded lines 186–187, with provenance: fetch command, HTTP 200, transfer and decoded sizes/digests, and the quoted source lines. That is an already-open S-row, rather than a new candidate. The recorded quote is 7 words, under the 25-word limit. Reopening the same tagged source from the exact URL, retaining fresh bytes/digest and locating the same anchor, is feasible without real-site interaction.

This is evidence of a prior opening, **not evidence that this round has reopened it**. To satisfy a per-round opened-S-row gate, the round-28 record must name S106 and include this round's actual opening command/result, anchor/quote check and artifact path. Do not present the round-25 opening as round-28 execution. Frozen claims explicitly disclaim admission; absent an explicit reopen-and-cite path in round-28 claims, this report does not recommend changing that scope.

A reject candidate is not established by the source evidence inspected here. The round-27 independent report records a prior reject decision for S125, supported by a round-27 quarantine re-open record, but that is neither a round-28 fresh rejection nor proof of this round's per-round opening. Do not count it as the required reject for this round without a round-28 re-open and source-specific judgment.

## Evidence and limits

Commands/evidence observed in the cited source-opening report: `curl -sSL ... 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT'` returned HTTP 200 and 98604 transfer bytes; `base64 -d` produced decoded source; `grep -n 'BackForwardCache' content_features.cc` located lines 186–187; `sed -n '186,187p' | wc -w` returned 7. These are historical observations documented in the round-25 artifact, not commands run during this assignment.

Read-only repo observation: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` returned the frozen baseline. `git status --porcelain=v1` showed only untracked `.ufo/waves/round-28/` at inspection; no tracked edit was made. Read tooling authorization at `/home/vgpnk/.omp/agent/RULES.md`; no installs/updates performed.

Prior independent defect evidence, `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`, recommends exact-line citation enforcement and preserving measurement-revision/fetch-failure requirements. This report does not rerun those gates or verify executor changes.

## Finding

A prior S106 opening supplies one concrete, exact, feasible source to reopen for a per-round opened-S-row record; the round-27 S125 rejection is historical only. **No current-round admitted-plus-rejected pair is evidenced by this audit.** The correct gate status from available evidence is incomplete/unknown, not pass. A negative claim about all possible reject candidates would be unsupported; only the inspected artifacts are covered.

## Artifact paths

- Report: `.ufo/waves/round-28/w1/Scribe05.md`
- Prior opening: `.ufo/waves/round-25/w1/ScoutOpenS106.md`
- Frozen claims: `.ufo/waves/round-28/claims.json`
- Prior defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md`
