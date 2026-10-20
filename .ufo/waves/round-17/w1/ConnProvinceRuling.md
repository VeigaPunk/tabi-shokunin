VERDICT: ISSUES

# PROVINCE ruling append — draft, accuracy check, and a gate contradiction

Axes named: adjacency 8 (ruling unrecorded), operability 8 (gate anchor/census semantics),
coverage 9 and calibration (no change). Round HEAD 5859243 (jj-colocated; C1 seats have
uncommitted gate edits in the worktree — anchors below give both).

## Finding 1 (blocking): the plan's PROVINCE append cannot land

`PROVINCE.md` is declared append-only — `scripts/check-round-contract.mjs:25`,
`scripts/check-user-round-contract.mjs:72` (both baseline and worktree) — but it is also a
census row: `corpus/evidence/pstack-20261015/baseline-census.tsv:24`
=`c2222b16b3b18ce2c2058fb3a50d690c6e5735ae PROVINCE.md` (sha256 of the file 16c27b12…).
The census loop requires exact blob equality for every non-SHONEN row:
`check-round-contract.mjs:261` (baseline) / `:281` (worktree). PROVINCE.md is the **only**
census-pinned member of the six append-only files (grep counts against the census: PROVINCE 1;
LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md, corpus/README.md 0), so the contradiction is
specific to this one file.

Probes (sandbox clone `git clone --no-hardlinks`, append committed, gate run):
- baseline gate @5859243, exact draft appended+committed →
  `ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Census blob drifted: PROVINCE.md`
- in-flight C1 gate (worktree copies of the four scripts copied in, HEAD 5a24595) → same failure.
- the user gate does **not** refuse the PROVINCE append itself: appended+committed, it reports only
  the pre-existing `round_count` failure (6 user rounds, expected 10), no `history_rewritten` —
  its APPEND_ONLY prefix check (worktree `:344`) passes a suffix append, and neither its
  `protectedPath` (`:144-153`) nor `pstackDrift` (`:283/:287`) names PROVINCE.md. The refusal is
  the round contract's census loop alone.
- making room by editing the census *is* refused: `pstackDrift` worktree `:283/:287`
  (baseline `:260/:264`), reached from the PSTACK diff loop `:350` (baseline `:327`); probe →
  `Pstack bytes changed: M corpus/evidence/pstack-20261015/baseline-census.tsv`, and the round
  gate adds `Census identity changed` (`:205` worktree / `:184` baseline; `CENSUS_SHA256` `:30`).

Consequence: PROVINCE.md is frozen at the round-0 mint blob and any append turns the delivered
round gate red. The only non-SKILL escape is a one-line PROVINCE carve-out in that census loop
mirroring SHONEN's (`:258`/`:274` worktree; `:238`/`:254` baseline) plus the
`ROUND_SCRIPT_CURRENT_SHA256` re-pin — a second gate change for zero axis gain this round, so it
is deferred, not a C3 rider. Routed defect 5
(`corpus/lessons/round-16-verifier-spotcheck.md:152`) authorises "PROVINCE/SKILL append", so the
executable carrier is SKILL.md.

## Deliverable 1 — exact PROVINCE.md append (10 lines; use only if the census is ever re-pinned)

```markdown
## Scope ruling — browser/CDP boundary (round-16 integrator)

Round-17 append recording `corpus/lessons/round-16-verifier-spotcheck.md:138-142`:
- tabi owns live browser/CDP page observation, including the WebMCP page-tool surface —
  bounded by the refusal and consequential-action limits above (invocation is an action).
- kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis
  (`kaidoku-shokunin/PROVINCE.md:53`, "Runtime observation (CDP)"); it cites tabi for browser-side mechanics.

Overlaps and dispositions: `corpus/adjacency.tsv`, checked by `scripts/check-adjacency.mjs`.
No sibling scope is absorbed; the refusal routes above stand.
```

Byte facts: pure suffix (`cmp` of the 1109-byte prefix identical); draft sha256
`16bb87cd389cb41b2cf7e36f04f956e1c62a6ebae5f18a2139680895300624f2`; resulting file sha256
`46d9e933ebbf7f4afcc33626b8f529f1ef7be8c10760b7f8298dc6e27d4e7ccd`; 10 lines ≤ 12.

## Deliverable 2 — exact SKILL.md append (landable this round; verified clean)

```markdown

## Round 17 — browser/CDP scope ruling and checked adjacency (2026-10-20)

- Integrator ruling `corpus/lessons/round-16-verifier-spotcheck.md:138-142`: tabi owns live
  browser/CDP page observation including the WebMCP page-tool surface; kaidoku keeps CDP only as
  an REA provider surface for shipped-artifact analysis and cites tabi for browser-side mechanics.
- Bounded by `PROVINCE.md:3-19`: invocation is an action, so the refusal and consequential-action
  limits still apply; no sibling scope is absorbed.
- Overlap rows and dispositions: `corpus/adjacency.tsv`; checker `scripts/check-adjacency.mjs`.
- `PROVINCE.md` stays byte-frozen by the census (`corpus/evidence/pstack-20261015/baseline-census.tsv:24`),
  so this append, not a PROVINCE append, is the citable carrier this round.
```

Why SKILL works: it has no census row (56 data rows; grep shows none), and
`scripts/check-freshness.mjs:97-101` *requires* an SKILL append (`witness_append`) as the dated
round-record surface, comparing only the baseline prefix. Probes: exact append committed →
`ROUND_CONTRACT verdict=clean` (exit 0) and `FRESHNESS_GATE verdict=clean … profile=production`
before and after. Draft sha256 `0ebee83261f5a409f5d2ff13a8b53afffcd942f2ccfc6c04ba02c23d9dac6527`;
append it after `SKILL.md:1892` (last heading `## Round 16 — …`, `:1831`). 10 content lines ≤ 12.

## Accuracy check — SHONEN box 4 (`SHONEN.md:11-12`)

- Current PROVINCE `:3-19` stays true: `:6-13` already owns "CDP session discipline (endpoints,
  targets, screenshot/DOM evidence capture)"; the ruling only names the WebMCP page-tool surface
  and bounds it, adding no contradiction. It does not currently name WebMCP, so without the SKILL
  append the box-4 claim is true-but-incomplete.
- The box's pointer `PROVINCE.md:3-19` stays valid: `evidencePointers` strips `:3-19`
  (`check-round-contract.mjs` SHONEN policy, baseline `:110-140`) and requires a committed regular
  blob, which PROVINCE.md is. A suffix append would not shift lines 3-19 either. No SHONEN edit is
  needed or permitted beyond canonical policy prose.
- Invocation is an action: `PROVINCE.md:17-19` forbids consequential actions on external sites.
  Both drafts carry that bound explicitly; an unqualified "owns the WebMCP tool surface" would
  overstate the province.

## Kaidoku absorption check — none

- Drafts restate the split verbatim from `round-16-verifier-spotcheck.md:141-142`; tabi
  `PROVINCE.md:15` already routes forensics to kaidoku, so no new scope is created.
- C2's harness surface is `/usr/bin/chromium` on loopback (PLAN.md C2), not kaidoku's REA provider;
  nothing in this append reaches `capture-browser-scenario` or REA tools.
- Residual tension for the C3 `kaidoku` row: `kaidoku-shokunin/PROVINCE.md:53` lists
  "self-launched targets: `chromium --headless --remote-debugging-port=9222`", broader than the
  ruling's "REA provider surface for shipped-artifact analysis". Record it as `ruled` with the
  ruling quote plus this nuance (Chromium rendering a shipped artifact = kaidoku; a web page = tabi).

## Side finding for C1 (not mine to fix, but gate-relevant)

Clean clone of 5859243: round gate exit 0; user gate **baseline-red** —
`USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`
(only `corpus/lessons/user-20261015-r01..r06` exist). C1's user-contract entry must compare arm
A/B exit+stdout, never require exit 0.

## Cross-check with RevKaidokuRuling-2 (same wave)

That seat independently reproduced the census failure and the `:25` vs `:281` contradiction, and
corrected one attribution: the user gate is not a refusal point for the PROVINCE append. Re-verified
here by probe and by reading `protectedPath`/`pstackDrift`; this report now states it that way.
Its kaidoku-side claim also re-verified: `git -C kaidoku-shokunin diff --stat b563c799 da64646 --
PROVINCE.md` → 1 insertion/1 deletion, only `:52`, so the kaidoku half of routed defect 5 is
feasible; only tabi's copy is census-frozen.
- `DraftProvince`'s sibling quotes re-verified here (kake `PROVINCE.md:30`/`:35-36`, kagi `PROVINCE.md:12-13`/`:43`, kake `SKILL.md:159-162`, kagi `corpus/adjacency.tsv:82`); its 7-line (`wc`) `drafts/province.md` is content-correct — only its carrier is wrong, so L1 can retarget it to SKILL.

## Risks

1. Appending PROVINCE anyway = red round gate at delivery (`history_rewritten`), harming
   operability/quality; the census cannot be edited to compensate (proved above).
2. Leaving the ruling only in `corpus/adjacency.tsv` under-serves defect 5's "PROVINCE/SKILL append";
   the SKILL append closes that while keeping the box-4 pointer live.
3. Keep the SKILL append a pure suffix with the dated heading; do not touch `scripts/check-freshness.mjs`
   (byte-frozen) and do not reorder existing bytes.
4. If L1 later wants PROVINCE editable, the viable declaration is a PROVINCE carve-out inside the
   round gate's census loop (mirroring the SHONEN branch) plus the `ROUND_SCRIPT_CURRENT_SHA256`
   re-pin; removing the census row itself is not viable — the user gate refuses that edit.

## Verification (all run)

- `git -C LANE rev-parse HEAD` → 5859243183c4d7ac5429dfdb8a73ce0d9a43d583; worktree gates modified.
- `sha256sum PROVINCE.md` → 16c27b12…; `git cat-file -p c2222b16…` → same bytes.
- All sandbox probes listed above; sandboxes removed. No tool installs were needed (none performed).

Proposed move (one): record the ruling in the Round-17 SKILL append (dated, exact text above)
plus one `ruled` adjacency row; leave PROVINCE.md byte-frozen. Improves adjacency (ruling citable,
checked) and operability (no gate turn-red); harms none.

Files written: .ufo/waves/round-17/w1/ConnProvinceRuling.md
