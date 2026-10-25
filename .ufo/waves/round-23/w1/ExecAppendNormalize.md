# ExecAppendNormalize — S102/S103 SOURCES normalization (round 23, w1)

VERDICT: PASS — both staged rows normalize to 11 columns / NF=13 with zero `|` (literal or escaped) inside any cell, all seven frozen census checks pass on the scratch block, and every quoted span in the block is present in the fetched bytes. Rows S102/S103 are already landed at `corpus/SOURCES.md:116-117` (they landed while this seat ran); the diff against my block is one cadence (S103 recheck 90d vs staged 180d) that the L1 must reconcile.

## Rows I would append (scratch file `.ufo/waves/round-23/scratch/ExecAppendNormalize/SOURCES.block.md`, verbatim)

| S102 | SameSite Cookie Attributes — draft-ietf-httpbis-rfc6265bis-13 — https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt | spec | A | The draft's own stated limit on what a SameSite cookie defends: strict mode is defense in depth, never the whole CSRF defense | §8.8.1 "Defense in depth", heading line 2813 and body lines 2815-2828 of the fetched text; draft-13 dated 15 November 2023, fetched 2026-10-25, retained-bytes sha256 062239316659673b… | A strict-mode SameSite cookie offers "a robust defense against CSRF attack" but is "not the extent of a site's defense against CSRF", so server-side defenses stay required | mined | 2026-10-25 | 180d | corpus/knowledge/csrf-defense-shape-boundary.md |
| S103 | Cross Site Request Forgery Prevention Cheat Sheet — OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html | docs | B | The observable shapes a CSRF defense leaves on the wire — the vocabulary a lane classifies an observed submit by | §"Disallowing simple requests" → §"Employing Custom Request Headers for AJAX/API" (fetched page line 5598) and §"Defense In Depth Techniques" → §"Limitations of SameSite" (line 5688); fetched 2026-10-25, retained-bytes sha256 6f32bfbf96bda9fc… | A custom request header is "particularly well suited for AJAX or API endpoints" and needs no token, while browsers still send cookies on same-site JavaScript requests | mined | 2026-10-25 | 180d | corpus/knowledge/csrf-defense-shape-boundary.md |

## Cells rewritten, old → new (staged `SOURCES.append.md` lines 50-51 → lane ids)

1. S145 `id` → S102; S146 `id` → S103. Reason: lane registry tip was S101 (`awk ... | sort | tail -1 corpus/SOURCES.md` → `S101`); staging ids S145/S146 collide with different staged sources, and C2's countingCommand greps `^source: S10[23] `.
2. S145 `scope`: "The draft's own limit on what SameSite can do — the defense-in-depth rule wave 2 did not quote" → "The draft's own stated limit on what a SameSite cookie defends: strict mode is defense in depth, never the whole CSRF defense". Reason: drops round-relative "wave 2"; scope states the topic, not which wave missed it.
3. S145 `anchor`: `§8.8.1 ("Defense in depth"), draft-13` → `§8.8.1 "Defense in depth", heading line 2813 and body lines 2815-2828; draft-13 dated 15 November 2023, fetched 2026-10-25, sha256 062239316659673b…`. Reason: contract requires anchor = section + line + revision. Ground: `grep -n '8.8.1.  Defense in depth' SrcS102/rfc6265bis-13.txt` → 2813; `awk 'NR==2830'` → `8.8.2.  Top-level Navigations`; `grep -n '15 November 2023'` → line 10.
4. S145 `teaches`: `SameSite in strict mode is a robust CSRF defense but "is not the extent of a site's defense against CSRF", and server-side defenses are still required` → exact spans `"a robust defense against CSRF attack"` / `"not the extent of a site's defense against CSRF"` / server-side defenses stay required. Reason: "is a robust CSRF defense" is not the draft's wording; grep-verified span is "offer a robust defense against CSRF attack".
5. S145 `opened`: 2026-10-23 → 2026-10-25. Reason: this round's access date; `stat -c '%y' SrcS102/rfc6265bis-13.txt` → 2026-10-25 04:11:50 -0300.
6. S145 `recheck`: `180d (draft revision moves)` → `180d`. Prose stripped: ` (draft revision moves)`.
7. S145 `used-by`: `corpus/knowledge/csrf-defense-boundary.md` → `corpus/knowledge/csrf-defense-shape-boundary.md`. Re-pointed by document (the admitted entry path).
8. S146 `scope`: "...takes on the wire — which is what a lane can classify a submit by" → "...leaves on the wire — the vocabulary a lane classifies an observed submit by".
9. S146 `anchor`: `§"Common CSRF weaknesses and protection mechanisms" (custom request header), §"Limitations of SameSite"` → `§"Disallowing simple requests" → §"Employing Custom Request Headers for AJAX/API" (page line 5598) and §"Defense In Depth Techniques" → §"Limitations of SameSite" (line 5688); fetched 2026-10-25, sha256 6f32bfbf96bda9fc…`. Reason: staged section name does not exist — `grep -c 'Common CSRF weaknesses' SrcS103/owasp-csrf.html SrcS103/owasp-csrf.txt` → `0` and `0` (exit 1); the quote's real home is h3 "Employing Custom Request Headers for AJAX/API" (html 5598) under h2 "Disallowing simple requests" (5590).
10. S146 `teaches`: `A custom request header is a no-token defense suited to AJAX/API endpoints, and SameSite does not protect same-site requests started by JavaScript` → `A custom request header is "particularly well suited for AJAX or API endpoints" and needs no token, while browsers still send cookies on same-site JavaScript requests`. Reason: first clause now an exact span; second clause keeps the sourced fact ("web browsers will include cookies in same-site request contexts initiated by JavaScript programs", flat line 316).
11. S146 `opened`: 2026-10-23 → 2026-10-25 (`stat` → 2026-10-25 04:11:51 -0300).
12. S146 `recheck`: `180d (the sheet is revised on a rolling basis)` → `180d`. Prose stripped: ` (the sheet is revised on a rolling basis)`.
13. S146 `used-by`: same re-point as item 7.
Unchanged: `source`, `kind` (spec/docs), `tier` (A/B — B for OWASP, so no A+community inflation), `status` (mined, forced).

## Frozen census (CORPUS.md, run from lane root; `corpus/SOURCES.md` substituted with the scratch block)

- rows: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' <block>` → `2`
- malformed (NF!=13): `awk -F'|' ... NF!=13` → `0`
- tier histogram → `A=1 B=1 `
- status histogram → `mined=2 `
- duplicate ids → nothing (`| wc -l` → 0)
- enum/tier-inflation → nothing (`| wc -l` → 0)
- mined rows whose used-by path is missing → nothing (`| wc -l` → 0; entry `corpus/knowledge/csrf-defense-shape-boundary.md` exists, 7195 B, mtime 04:15)
- field count per row: `[13, 13]`; escaped pipes: `grep -c '\\|' <block>` → 0
- quote-in-cell check (all quoted spans, whitespace-collapsed against fetched bytes): 8/8 located, ABSENT_TOTAL 0, longest span 9 words (`python` regex over block vs `SrcS102/rfc6265bis-13.txt`, `SrcS103/owasp-csrf.txt`, `SrcS103/owasp-csrf.html`)
- live-registry control (unchanged file, same commands on `corpus/SOURCES.md`): `101` rows / `0` malformed / `0` dups before the append, `103` / `0` / `0` after.

## Landed-state delta (for reconciliation, not a defect I may fix)

- Landed S102 matches my row on source, kind, tier, status, opened, recheck (180d), used-by, and its anchor `2815-2828` is the exact 8.8.1 body (heading 2813, next heading 2830) — tighter than my earlier `2813-2823`.
- Landed S103 `recheck` = `90d`, staged S146 prose = `180d`, my block = `180d`. Both are schema-legal cadences; per contract rule 2 the choice must be logged old→new in the round lesson with a reason, otherwise staged stays 180d.
- Landed S103 anchor adds `last-modified 2026-10-25T06:56:47Z`; that header is not in retained evidence (only the body bytes were kept, sha256 6f32bfbf…, 157809 B) — unverifiable from what this seat holds, and it is the only landed S103 cell I cannot ground.
- Both landed rows use single-quoted section names; schema-neutral.

## Risks / blockers

- No blocker. The `used-by` target appeared mid-wave, so no dangling path remains; if the entry is renamed again, all three rows/entry frontmatter move together.
- S103 cadence disagreement (90d vs 180d) is the one unresolved item above.
- No tools installed or upgraded; no network fetch by this seat (it reused the round's retained fetch bytes); no tracked file, git/jj write, spawn or message issued.
