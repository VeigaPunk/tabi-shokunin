# ScoutAssimilation — round 33 w1, frontier recon (read-only)

**Verdict.** The tabi quarantine slice re-derives to 38 rows (37 `payload-absent`, 1 unreachable-shaped row S171), byte-identical to the round-31 slice (sha256 `79ea7557…9d3772`); the register is unchanged (sha256 `5afe1810…d833`, same as rounds 27/30/31). MERGE-REPORT lists 86 proposed knowledge entries / 148 staged rows. **No theme touches the adjacency map or the BiDi runtime gate**: no entry or row mentions BiDi/chromedriver/WebDriver, and the only "adjacent/sibling/overlap" hits are cookie-domain and WebMCP-availability prose, not sibling-lane overlap. `considerthese/` is absent. The quarantine-first hand-check was run in round 22 (full per-row verdicts) and re-run on all 38 rows in round 27; rounds 23–31 only carried the verdicts. Recommendation: keep adoption closed in round 33 (claims.json: Assimilation none); a future round that wants any package value should adopt only via the WebMCP/cookie/redirect rows that the register does NOT list, after a fresh re-ground, and never touch the 38 listed rows — see the final paragraph.

## Caveat on the awk
The round prompt §10 awk text was not in my assignment, and I did not receive it. I wrote an equivalent awk (below) and also compared with the round-31 committed `derive.sh` grep|sed derivation; the outputs are identical (`cmp` exit 0). If §10's awk differs in cell formatting the row set (38) will still agree.

## Evidence
Commands (all exit 0):
```
awk -F'|' '$2 ~ /^ *`tabi` *$/ && $4 ~ /S[0-9][0-9][0-9]/ {id=$4; cls=$5; gsub(/^ +| +$/,"",id); gsub(/^ +| +$/,"",cls); printf " %s   %s \n", id, cls; n++} END{print n+0 > "/dev/stderr"}' absent-defect-register.md   # prints 38
cmp <output> .ufo/waves/round-31/w1/ExecAssimGuard/quarantine-slice   # identical
sha256sum absent-defect-register.md  # 5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833
```
- Register rows: `## Rows` lines 178–~230 (tabi rows, round1..), `## By lane` line 236 `| tabi | 37 |`, `## Rows whose quotes were NEVER CHECKED` line 256 with tabi S171 at line 362. Row 38's id cell is `S171` with a stray backtick and its class cell is the prose "the cited source could not be fetched, so no quote was checked" (the register row is shifted); count by class cell: 37 `payload-absent`, 1 non-class (S171 → unreachable). Same as round 22 (37 refused + 1 unverifiable).
- MERGE-REPORT.md (sha256 `b7e6a279…ed726`): 148 rows accepted, 86 entries (`grep -c '^| \`corpus/knowledge'` = 86; 86 files under knowledge/corpus/knowledge). Lane registry "101 rows", first staged S102 (stale — lane now holds 115+ per round-30 lesson). Themes by entry count (my filename bucketing, `themes.txt`): WebMCP 47 (page tools, CDP/DevTools surfaces, origin trial, declarative form, schema/argument contract); CDP/extension/agent-surface & approval 11; Cookie/SameSite/CSRF 10; Redirect/Retry-After 7; Rate-limit/robots 7; Journey driver / agent eval 3; Eastern-language measurement 1. Sum 86.
- Adjacency/BiDi: `grep -rIn -i -E '\bbidi\b|bi-directional|chromedriver|webdriver'` over merge/tabi → no hits. `grep ... 'adjacen|overlap|sibling'` over knowledge → 3 hits: cookie-prefix-origin-shape-r21.md:36 and :46 (CookieDomainAsHost, "sibling host" = DNS sibling), webmcp-devtools-agent-surface-r25.md:29 ("availability conditions overlap" = internal). None concerns another lane's PROVINCE or a BiDi receipt gate. The staged "journey-driver" entries (r18/r19, 3 files) concern the lane's own WebDriver-ish driver but name no BiDi gate.
- `ls -d considerthese` → exit 2 (absent). Matches LOG.md:1624, round-22.md:73, round-30.md:73.
- Quarantine-first history (`grep -n -i quarantine corpus/lessons/*.md LOG.md`, exit 0): round 22 ran it (LOG.md:1579–1630; round-22.md:45–64: 38-row hand-check, 37 absent→refused, 1 unreachable, 4 matcher controls; verdicts `.ufo/waves/round-22/assimilation/quarantine-verdicts.{tsv,json}`); round 27 re-opened all 38 (round-27.md:30–40, `.ufo/waves/round-27/quarantine/Quarantine{A,B,C,D}.md`: 35 absent, S171 unverifiable, S114/S140 present but not appended; L0 question routed, round-27-verifier-spotcheck.md:48); round 30 carried (round-30.md:61–64,71–73, RevQuarantineCarry re-fetched 5 URLs HTTP 200, quotes still absent); round 31 re-derived (round-31.md:54–56). Rounds 23–26 carried only (round-24.md:29, round-25.md:51, round-26.md:31).

## Deliverables
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ScoutAssimilation/quarantine-slice` (38 lines, sha256 `79ea7557572ff6ff81c9c70fc582ae39ce35d35f437e44ec5d901b98d9fd3772`)
- `.../ScoutAssimilation/themes.txt`
- this report.

## Recommendation for a future round
Open the S114/S140 present-row question first: round 27 left two slice rows whose quotes were found present but unadopted because frozen C3 admitted only one entry, and the §10 "present→adopt" directive vs. frozen-claim conflict was routed to L0 and (per round-27 spotcheck line 48) still needs an operator ruling. A future round that carries an adoption claim should freeze it explicitly ("admit S114 and S140, N entries"), re-open those two rows' sources fresh, and use the unchanged-register sha check (`5afe1810…d833`) plus the round-31 `derive.sh` guard (0–3-space row pattern) to prove the slice has not moved. The 86-entry package is dominated by WebMCP (47) whose rows predate the lane's own later WebMCP rounds, so lean toward rejecting duplicates rather than ever adopting wholesale; none of it bears on the adjacency or BiDi frontier, so a round-33-style adjacency/gate lane should keep `Assimilation: none`.

Scratch: none created. Browser processes: none started.
