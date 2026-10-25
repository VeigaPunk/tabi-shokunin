# ScribeSources — draft SOURCES rows S102/S103 + append log lines (round 23, C2)

Verdict: both rows are draftable and quote-verified against this round's own fetched bytes (two ids free, no `|` in any cell, teaches 23 and 24 words). Append is OWED to the L1, not performed: registry still 101 rows (`S101` is the last id).

Scope of this file: drafts only. No tracked file was edited, no git/jj write, no fetch performed by this seat (bytes read were already on disk under `.ufo/waves/round-23/scratch/`).

## Adopted document pair (re-pointed by document)

Staged entry `corpus/knowledge/csrf-defense-boundary.md` (`/home/vgpnk/Projects/shokuknow/lanes/tabi/round3/KNOWLEDGE-PROPOSED.md:157-192`) cites staged `S145` (cookie draft §8.8.1) and `S146` (OWASP sheet). Those two documents are the pair drafted here as `S102` / `S103`, re-pointed to the entry the claim names.

## Rows (exact 11-column lane schema; append verbatim after S101)

```markdown
| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S102 | Cookies: HTTP State Management Mechanism — draft-ietf-httpbis-rfc6265bis-13 — https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt | spec | A | The draft's own limit on SameSite as a CSRF defense plus its server-side-defense encouragement; not user-agent enforcement | §8.8.1 "Defense in depth" (line 2813); draft-13 dated 15 November 2023, expires 18 May 2024; fetched 2026-10-25; body sha256 06223931…d85fbf | SameSite strict mode is a robust CSRF defense only with client support, and the draft still encourages server-side tokens and idempotent safe methods | mined | 2026-10-25 | 180d (draft revision moves) | corpus/knowledge/csrf-defense-shape-boundary.md |
| S103 | Cross-Site Request Forgery Prevention — OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html | docs | B | The sheet's enumerable CSRF defense shapes and its stated SameSite gaps; not normative protocol text or measured behaviour | §Employing Custom Request Headers for AJAX/API (text line 291), §Limitations of SameSite (line 365), §Dealing with Client-Side CSRF Attacks (line 316); rolling page, no date marker; fetched 2026-10-25; html sha256 6f32bfbf…872312 identical in two independent fetches | A custom request header is a no-token CSRF defense for AJAX or API endpoints; SameSite is defense-in-depth and does not replace a proper defense | mined | 2026-10-25 | 180d (the sheet is revised on a rolling basis) | corpus/knowledge/csrf-defense-shape-boundary.md |
```

Tier is inherited, not upgraded: staged `S146` was `B`, so `S103` stays `B`; staged `S145`/`S102` is `A` (normative draft text). `kind` follows the registry vocabulary (`spec`, `docs`).

## Located quotes for the lesson §Gate (each found once, byte-exact in this round's bytes)

- S102, §8.8.1 lines 2815–2816 (20 words): `"SameSite" cookies offer a robust defense against CSRF attack when deployed in strict mode, and when supported by the client.`
- S103, §Employing Custom Request Headers for AJAX/API line 292 (21 words): `A user-friendly defense that is particularly well suited for AJAX or API endpoints is the use of a custom request header.`
- S103, §Limitations of SameSite line 366 (19 words): `SameSite is useful as a defense-in-depth control but it does not replace a proper CSRF defense in most deployments.`
- Survival check of the staged entry's own quote: `web browsers will include cookies in same-site request contexts initiated by JavaScript programs, circumventing the SameSite cookie policies` is present at line 316, i.e. in §Dealing with Client-Side CSRF Attacks, not in the section the staged `source:` line names.

## Re-pointed entry header lines (what `^source: S10[23] ` must match)

```markdown
source: S102 — https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt — §8.8.1 ("Defense in depth"), draft-ietf-httpbis-rfc6265bis-13 (15 November 2023) — fetched 2026-10-25, sha256 06223931…d85fbf
source: S103 — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html — §"Employing Custom Request Headers for AJAX/API", §"Limitations of SameSite" — fetched 2026-10-25
verified-at: 2026-10-25
```

## Log entries (one line each, in LOG.md's observed grammar)

```markdown
- Sources S102–S103 appended 2026-10-25 (2 mined, 0 queued): S145→S102 (§8.8.1 "Defense in depth") and S146→S103 (§Employing Custom Request Headers, §Limitations of SameSite), re-pointed by document to `corpus/knowledge/csrf-defense-shape-boundary.md`; tier inherited A/B, ids renumbered, no other cell carried over from staging.
- Frontier step: SOURCES registry 101→103 rows, mined73→75, A88/B4/C9→A89/B5/C9; knowledge 41→42 entries — the admitted CSRF entry is documented-upstream only, citing two rows first opened this round; C2 counter `admitted_entries_citing_row_first_opened_this_round` 0→1.
```

## Findings (command attached to each)

1. Adopted pair is unambiguous: the CSRF entry's two staged rows are `S145` (cookie draft) and `S146` (OWASP sheet). — `sed -n '157,166p' /home/vgpnk/Projects/shokuknow/lanes/tabi/round3/KNOWLEDGE-PROPOSED.md`
2. Ids S102/S103 are free; registry ends at S101. — `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && grep -c '^| S' corpus/SOURCES.md` → 101; `awk -F'|' '/^\| S[0-9]+ \|/{print $2}' corpus/SOURCES.md | tail -1` → ` S101 `
3. Tier/status baseline for the log line: A88/B4/C9, mined73/queued19/rejected9. — `awk -F'|' '/^\| S[0-9]+ \|/{t=$5;gsub(/ /,"",t);c[t]++;s=$9;gsub(/ /,"",s);st[s]++} END{for(k in c)print "tier",k,c[k];for(k in st)print "status",k,st[k]}' corpus/SOURCES.md`
4. Knowledge-entry count for the log line: 41 files now. — `ls /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/*.md | wc -l`
5. Name divergence, must be decided before append: the claim and this item name `corpus/knowledge/csrf-defense-shape-boundary.md`; staging names `csrf-defense-boundary.md`, and neither exists in the lane. — `ls corpus/knowledge/ | grep -ci csrf` → 0; `grep -n 'csrf-defense' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` → `csrf-defense-boundary.md`; claims.json → `csrf-defense-shape-boundary.md`
6. Quotes verified byte-exact (one hit each). — `grep -cF 'cookies offer a robust defense against CSRF attack when' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt` → 1; same for the two S103 strings in `scratch/SrcS103/owasp-csrf.txt` → 1 and 1
7. Two independent fetches of the OWASP page agree byte-for-byte, so its digest is a usable provenance anchor. — `sha256sum .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.html .ufo/waves/round-23/scratch/SrcDivergence/owasp-csrf.html` → `6f32bfbf…872312` twice; the draft text likewise `06223931…d85fbf` twice
8. The draft carries a real revision date, the OWASP sheet does not (no date marker in the HTML), so `recheck` differs by source rather than being copied. — `sed -n '1,16p' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt` (15 November 2023); `grep -c 'md-source-file\|git-revision-date' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.html` → 0
9. Staged attributions would not survive as written: the sheet quote the entry uses sits in §Dealing with Client-Side CSRF Attacks, and the entry's "Limitations of SameSite" reading is now stated as "does not replace a proper CSRF defense in most deployments" — the anchor cells above name the sections actually opened, not the staged ones. — `grep -n 'circumventing the SameSite\|Limitations of SameSite' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.txt` → 316, 365
10. Counting-command precondition satisfied by the drafted header: both `source:` lines begin `source: S102 ` / `source: S103 `, so `git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge` can reach 1 file. — regex read from `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23/claims.json` (C2.countingCommand)
11. No stale-reference hazard on the staging ids: `S145`/`S146` appear nowhere in the lane registry, so nothing needs superseding. — `grep -c 'S14[56]' corpus/SOURCES.md` → 0

Out of scope here: no fetch, no append, no entry write, no QUALITY/SCORECARD change, no gate run (`node scripts/check-sources.mjs` and the auditor's `--selftest` belong to the L1). No axis promoted; both rows are lane-dispatched, so nothing here is a non-author judgment.
