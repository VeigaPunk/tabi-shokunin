# ScoutAssimilation — round 35 w1 (§10, read-only)

## Recommendation
**Assimilation: none.** No staged theme or entry in `/home/vgpnk/Projects/shokuknow/merge/tabi/` touches Firefox, geckodriver, WebDriver BiDi, a second engine as C2 defines it, or sibling-overlap/adjacency (C1). Adopting an entry this round is not in scope.

## Evidence
- MERGE-REPORT.md: 148 rows (first id S102), 86 entries, 0 refused. `find knowledge -type f | wc -l` = 86. Entry themes: WebMCP (~55), cookie/SameSite/prefix, redirect, rate-limit, CDP/extension/agent-surface, journey-driver.
- Grep `firefox|geckodriver|gecko|bidi|adjacen|sibling.overlap|second engine` over `merge/tabi/` (incl. SOURCES.append.md): no BiDi, geckodriver, adjacency or sibling-overlap hit. Firefox appears only in:

| path:line | claim | lane holds it? | adopt? |
|---|---|---|---|
| `knowledge/corpus/knowledge/cookie-prefix-origin-shape-r21.md:35-37,56-60` | `__Host-` + Domain accepted on an IP literal; cites Chromium comment "We match IE/Firefox in allowing a domain=IPADDR"; the entry itself says Firefox behaviour is "Chromium's claim about Firefox, not an observation" | No `corpus/knowledge/*.md` mentions `__Host-`. Not held. | No. A cookie-prefix claim, not a BiDi/second-engine runtime claim. Its rows are S222 (own-work path under shokuknow `lanes/tabi/...`, not re-openable by this lane) and S223. Firefox cookie behaviour is not a C2 predicate. |
| `knowledge/corpus/knowledge/webmcp-origin-trial-window-r24.md:40-45` | Edge origin trial as "a second engine" for round-13 Q11-01 (other engines' IP-literal exception) | Not held | No. "Second engine" here is Edge, which is Chromium, not Gecko. Round-35 C2 is Firefox/BiDi. |
| `knowledge/corpus/knowledge/webmcp-local-preconditions-and-two-addresses-r25.md:31-33` | "only Chromium-based browsers implement [modelContext]; Firefox and Safari leave it undefined" | Not held | No. A feature-detect note, not BiDi evidence. |

- Lane already holds the BiDi ground: `corpus/knowledge/{webdriver-bidi-capability-matrix,webdriver-bidi-runtime-round-32,bidi-runtime-gate-v2-round-33,bidi-gate-selftest-round-34}.md` (4 BiDi files). No Firefox entry yet (the round-35 deliverable). The lane adjacency ground is `corpus/adjacency*.tsv`. The staged package carries no overlap content.
- `ls /home/vgpnk/Projects/shokunin/tabi-shokunin/considerthese` → "No such file or directory" (exit 2). Lane root listing has no such dir. Matches rounds 22, 27, 33 and 34.
- Precedent: `corpus/lessons/round-33.md:132-137` and `round-34.md:48-52` both recorded "Assimilation: none"; `.ufo/waves/round-35/claims.json:229` already says "none unless w1 ScoutAssimilation finds a theme on these surfaces". None found.

## Quarantine-first status of tabi's register slice
- **Done in round 22.** `corpus/lessons/round-22.md:45-68`: wave-4 quarantine-first; hand-check of 38 slice rows (register sha256 `5afe1810…d833`). Verdicts: 37 `absent-refused` (payload-absent) + 1 `unverifiable-unreachable` (S171). 4 matcher controls, all passing. Adoption closed, no staged row appended.
- Cross-check: `.ufo/waves/round-22/assimilation/quarantine-verdicts.json` summary `{absent-refused:37, unverifiable-unreachable:1}`, `rows:38`, `controlsPassed:true`. The TSV has 38 data rows plus a header, by round1=8, round2=11, round3=9, round4=6, round5=4.
- **Re-opened in round 27.** `corpus/lessons/round-27.md:30-40`: all 38 re-opened. 35 absent/refuse, S171 404 unverifiable, and S114 and S140 text present but no lane entry cites them, so not adopted. One lane row admitted (S107, from staged S124).
- Round 23 (`round-23.md:11-14,56-84`) admitted one staged entry, the CSRF defence shape (lane file `corpus/knowledge/csrf-defense-shape-boundary.md`), via S102/S103 under a lane-side map. The round-23 note that staged S102/S103 are different documents and were not adopted is at lines 80-83.
- Stale-premise watch: round-33 M4 (`round-33.md:169`) corrected a claim that the quarantine round "has not run". The round-35 claims.json `notClaimed` does not repeat it (checked lines 225-229).

## Commands
- `ls` merge/tabi, `find knowledge -type f | sort | wc -l` → 86, exit 0
- `ls -d .../considerthese` → exit 2 (absent)
- grep terms above over merge/tabi; reads of the cited line ranges. No campaign tool run; nothing written under shokuknow.

## Deliverable
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScoutAssimilation/assimilation.md`
