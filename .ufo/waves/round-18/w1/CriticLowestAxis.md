VERDICT: ISSUES

# CriticLowestAxis — is the round-18 axis choice honest?

Attack target: PLAN.md:9-11 names the four-way lowest tie (depth / operability /
freshness / adjacency, all 8) and then works freshness (C1), operability (C2) and
calibration-9 (C3). Depth and adjacency are skipped. The cap-3 choice itself is
rule-legal; the *pattern* behind it is the defect.

## Finding 1 — Depth is the only lowest-tied axis never claimed in the hyaku chain

Depth's last scalar move is `LOG.md:431` (`user-20261015-r05`, 2026-10-15: depth
7→8, a bounded example.com GET receipt). Since then, every recorded round has
held depth at 8→8 "unchanged" while naming it in the lowest tie:

- Round 12 (`SCORECARD.md:463-473`): tie named "depth, operability, freshness,
  adjacency (8)" — C1 works **freshness**, C2 coverage.
- Round 13 (`SCORECARD.md:531-546`): operability tie claimed; depth "unchanged;
  no broad protocol/browser-support certification".
- Round 14 (`SCORECARD.md:594-603`): "operability 8, a lowest non-retired tie";
  depth unchanged.
- Round 15 (`SCORECARD.md:663-676`): same — operability claimed, depth unchanged.
- Round 16 (`SCORECARD.md:735-742`): operability claimed (tie explicitly lists
  depth); depth unchanged.
- Round 17 (`SCORECARD.md:779-787`): "operability 8 and C3 adjacency 8 (lowest
  non-retired tie with depth/freshness)" — **adjacency gets its turn; depth does
  not.**
- Round 18 (PLAN.md:15-45): freshness + operability + calibration. With round 17
  having worked adjacency, **every member of the four-way tie has now been
  claimed at least once except depth** — the axis tied-lowest the longest.

"Lowest non-retired tie" is functioning as a rotating justification that never
rotates onto depth. Six consecutive SCORECARD sections (12–17) plus this plan
give the skip no stated reason, and no `planned:` depth item has appeared since
the training chain (r12–r17 planned sections: sources/frontier/operability/
adjacency items only — `SCORECARD.md:770-772, 811-815` carry operability-9 and
adjacency-9 recipes, nothing for depth-9). Under the godspeed reading: the
frontier is not walking on this axis; it is being steered around.

## Finding 2 — The skip is not forced by the cap, and a depth claim was feasible

- Cap legality: `AXES.md:25-29` ("a round is 1–3 claims") and the lowest-axis
  minimum are satisfied by C1/C2; C3 is a routed-defect obligation from
  round-17 outside review (`SCORECARD.md:809-815` names the harness-hardening
  debt and self-test debt C3/C2 close). Discharging routed defects over a free
  third claim is defensible.
- But the axis-selection rule (`AXES.md:18-23`) says "pick the round's axis from
  the trend furthest behind" — quality trend = depth + freshness + operability.
  C1 and C2 both sit inside the *same* trend as depth; the rule does not
  discriminate among them, so choosing freshness+operability over depth is a
  free choice, not a derived one.
- Feasibility counter: the depth ceiling note (`SCORECARD.md:95`) names two open
  moves — real-site classes (approval-gated) and byte-identity
  (environment-scoped). The second is **not** approval-gated and directly fits
  this wave: the r3/r8/r9 evidence-ladder byte-identity claims were measured on
  the old substrate; the lane now runs Chromium 154.0.8037.97 / Node v24.21.0
  (PLAN.md:5-6). A depth claim could have been "evidence-ladder rungs
  re-executed on the current substrate under the hazard-closed round-18 harness:
  N/N steps byte-identical, or named drift signatures recorded" — same loopback
  perimeter, same new `scripts/webmcp-invoke-round18.mjs`, named error
  signatures (run_aborted vs fail) and real thresholds (the 6 s SIGTERM
  deadline, single `--enable-features` token) that are exactly what the depth
  axis rewards (`AXES.md:11`: "decision tables with real thresholds, named
  error signatures"). C2's own deliverable is depth-shaped work filed under
  operability; a depth claim riding the same artifact cost no extra browser
  privilege. The small-receipt precedent exists: depth 7→8 was earned by a
  single bounded GET receipt (`LOG.md:431-438`).

So "depth couldn't be honestly claimed" is false; "depth wasn't chosen" is the
honest statement, and the plan never says it.

## Finding 3 — Where the honesty line actually sits

Not guilty: the plan does not *falsely* claim to work depth; the tie is named
accurately and claims stay inside the cap. Guilty-by-omission: for the seventh
straight round the scorecard/plan presents a four-way tie, picks from it, and
leaves depth unexplained — a reader cannot distinguish "deliberately deferred
because routed defects + recheck debt outrank it" from "systematically avoided
because depth claims are the hardest to fake". Calibration (the axis that
judges exactly this kind of self-assessment honesty) is the impacted axis, plus
depth itself (starved) and scorecard freshness (the tie narrative is stale:
round 17 already called it "lowest ... tie with depth/freshness" without
crediting depth).

## Smallest safe correction (proposed, not applied)

1. In the round-18 SCORECARD section / lesson, one sentence under depth's row:
   "unchanged; tied-lowest and deferred <N>th consecutive round — reason:
   routed-defect discharge and source-recheck debt took the three slots;
   candidate depth claim = byte-identity re-verification of the r3/r8/r9
   ladder on the Chromium-154/Node-24 substrate." That converts the silent
   skip into a recorded deferral with a next move.
2. If any wave-2 slot frees (a claim lands early), the cheapest depth move is
   the substrate re-run above — it reuses `webmcp-invoke-round18.mjs` and the
   C1 recheck machinery verbatim.

## Counterexample summary

Strongest available: round 17 proves the tie is not a queue (adjacency, picked
once, got worked while depth never has); the ceiling note proves depth has a
non-approval-gated open move; the r05 scalar bump proves small bounded
receipts count as depth. Skipping depth this round is rule-legal; never naming
why, across seven rounds, is the defect the canonical judge should weigh.

Evidence pointers: `SCORECARD.md:95` (depth ceiling), `:431` area of `LOG.md`
(depth 7→8 move), `SCORECARD.md:463-473,531-546,594-606,663-676,735-747,
779-790` (six consecutive 8→8 depth rows inside named lowest ties),
`.ufo/waves/round-18/PLAN.md:9-45` (round-18 claim set), `AXES.md:11,18-29`
(axis definition, trend mapping, 1–3 claim cap).

No tools installed (none needed). No files written outside this report.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/CriticLowestAxis.md
