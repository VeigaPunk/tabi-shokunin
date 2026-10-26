# ConnBoundaries — round 35 w1 report (C1 independent boundary scan)

## Verdict

Read strictly against the frozen decision rule (SKILL.md:2861-2881) and QUALITY 87-91/97,
all 383 frozen C1 candidates screen (238 same-surface, 66 not-browser-sense, 51 no-claim-
declared, 28 third-lane-report) — **unaccounted 0 is reachable with zero new rows**, and the
two strongest side-stating lines (kake's shared-burner-chrome lease, SKILL.md:160 /
ops-automation.md:79; kaidoku's chromium-as-REA-resolver-stub, 2026-10-14-r11-01-queue-ops.md:63)
are both facts on the sibling's own side of already-mapped splits (musketeer-cdp-9222-profile-lease;
cdp-runtime-observation) and must screen same-surface. The only genuinely new-surface signals —
kake auth-over-CDP (ops-automation.md:78), kumitate WebBridge-drives-Chrome/Edge endpoint route
(kimi-skills-plugins.md:486), kama logged-in-browser drive-ability (listener-census.md:356) —
carry no SIDE token and cannot be mapped this round without L0 contested-open questions; and the
single mechanically n4-eligible line on an unmapped sibling (chousa AP-03) is a refusal that must
screen no-claim-declared and is the cheapest split-forgery vector wave 2 must attack. I found no
new row in this pool that I would defend against wave 2; newMapped>=2 reached honestly requires an
L0-resolved contested-open plus the kaidoku resolver-stub bid (B2 in boundaries.md).

## Evidence

Read (frozen; absolute paths): `.ufo/waves/round-35/claims.json` (C1 definitions, kill rule,
feasibilityDisclosed, frozenDigests), `baseline/controls-summary.json`, `baseline/c1-pins.json`,
`baseline/c1-candidates.tsv` (all 383), `corpus/adjacency.tsv` (16 rows),
`scripts/check-adjacency.mjs:1-170`, `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs`
(lines 1-183; BG/SIDE/THIRD_LANE/PINS), `PROVINCE.md`, `SKILL.md:2861-2881`,
`corpus/QUALITY.md:532-590,670-675`.

Sibling PROVINCE.md at pins (git show, read-only), e.g.:
- `git -C /home/vgpnk/Projects/shokunin/kake-shokunin show 044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md` → exit 0 (`:39` "The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)"; `:61` "browser execution stays tabi's")
- `git -C /home/vgpnk/Projects/shokunin/kagi-shokunin show 69b61db46be4ed955994f6f1d1cba522bc5f4e97:PROVINCE.md` → exit 0 (CDP 9222 + musketeer profile contested with kake; kagi pins only the NMH manifest)
- `git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 49096c7e6f226af0c750c4b003be58883cb6049f:PROVINCE.md` → exit 0 (REA reverse-engineering domain)
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 8d557f85312de4fcc82e09ff735d21436bc3746d:PROVINCE.md` → exit 0 (orchestration; no browser/CDP line)
- plus mado, kotoba, kama, mori, tameshi, tsukuroi, chousa at their pins (exit 0 each).

Analysis runs (scratch `/fast/scratch/hyaku/tabi-r35/ConnBoundaries`):
- parsed all 383 candidates with frozen BG/SIDE/THIRD_LANE (Python 3.11): 59 carry SIDE tokens, 25 live in third-lane paths; per-lane classification sums to 383 (table in boundaries.md §Cluster).
- key identity checks: kake `SKILL.md:160-161` raw read shows the shared burner chrome = (`the-musketeer` profile, CDP `127.0.0.1:9222`) — confirming the same-surface verdict for B1; kumitate `kimi-skills-plugins.md:486` raw read confirms the `→ **kama (endpoints).**` route; kaidoku `r11-01-queue-ops.md:63` raw read confirms the resolver-stub sentence.

No lane files were edited; no browser/driver launched; no network fetches performed.

## Deliverables

- `.ufo/waves/round-35/w1/ConnBoundaries/boundaries.md` — full scan: verdict, method/evidence, cluster table, 6 strongest NEW boundary candidates (with verbatim quotes, PROVINCE surface lines, QUALITY 91 grounds, tabi declaration drafts), wrong-mapping watchlist (6), screen-arithmetic note.
- This report (`.ufo/waves/round-35/w1/ConnBoundaries.md`).
