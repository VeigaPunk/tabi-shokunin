# SrcDivergence — staged CSRF entry, sentence-level support census (round 23, w1)

VERDICT: 5 of 16 units are supported by a verbatim located quote; 4 are documented-but-unquoted;
5 are this-lane inference; 2 are unverifiable in lane bytes. The entry is NOT admissible as staged:
one quote is not verbatim, both OWASP anchors name the wrong section (one names a section that does
not exist), and both `source:` ids are unregistered.

Sources re-opened by this lane (one GET each, 2026-10-25):
- rfc6265bis-13: HTTP 200, 146976 B, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`
- OWASP CSRF sheet: HTTP 200, 157809 B, sha256 `6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312`

## Census (Lnn = staged line; S = supported-by-a-quote, D = documented-but-unquoted, I = this-lane-inference, U = unverifiable)

| # | L | unit | label | located span |
|---|---|---|---|---|
| 1 | 2 | title "What SameSite does and does not defend, and how a defense is observable" | I | "does defend" half is delegated, never quoted here |
| 2 | 4 | `source: S145 … §8.8.1 … fetched 2026-10-23` | U (identity) | URL/§ resolve; **S145 is not a registered row** |
| 3 | 5 | `source: S146 … §"Common CSRF weaknesses …", §"Limitations of SameSite"` | U (anchor) | first named section has 0 hits; `§"Limitations"` does not hold either quote |
| 4 | 6 | `verified-at: 2026-10-23` | U (stale) | re-open date is 2026-10-25 |
| 5 | 7 | `recheck: 180d … (not run in this round)` | I | honest self-label, keep |
| 6 | 8 | `ground: … the CSRF boundary a submit receipt can actually observe` | I | no path:line; "can actually observe" is not in either source |
| 7 | 10 | "**Documented upstream, not measured here.**" | S | self-describing provenance label, keep |
| 8 | 10-12 | "Wave 2 supplied the cookie mechanics (default enforcement, Strict vs Lax, and the cross-site top-level-navigation rule)." | U | no lane SameSite note, no lane SOURCES row, w2/ empty |
| 9 | 12-13 | "This round supplies the *limit* and the *observability*, which is what a journey receipt needs." | D (limit) / I (observability) | limit quoted below; "observability" nowhere in either source |
| 10 | 15-19 | the limit chain + three quotes | D | see C1: quote 1 **not verbatim** (`offers` ≠ source `offer`) |
| 11 | 19-20 | "SameSite is defense-in-depth, never the whole defense." | D | §8.8.2:2833 "provides robust defense in depth"; OWASP 5706; absolute "never" unquoted |
| 12 | 22-26 | "leaves a **shape** on the wire, and the shapes are enumerable — a synchronizer token, a double-submit cookie, or a **custom request header**" | I | "on the wire" 0 hits, "enumerab" 0 hits; sheet lists ≥6 shapes |
| 13 | 24-26 | "A user-friendly defense … No token is needed for this approach" | S (21+7 w) | OWASP:5599, under `Employing Custom Request Headers for AJAX/API`, not the cited section |
| 14 | 26-29 | "The sheet also names the hole in the cookie defense: 'web browsers will include cookies …'" | D (quote S) | sentence is OWASP:5630 under `Dealing with Client-Side CSRF Attacks (IMPORTANT)`; "hole in the cookie defense" widens its scope |
| 15 | 31 | "the lane's rule marks CSRF-checked submits untested by rule" | D | resolves in lane corpus, but entry cites no anchor |
| 16 | 32-35 | "classify … by the defense's shape (a token field, a paired cookie, or a non-simple header) … not a receipt" | I | "non-simple header" is CORS vocabulary; sheet says "to be preflighted" |

## Must be cut or re-labelled before this lane admits the entry

1. **L15-16 quote — re-label as paraphrase or fix**: source reads `"SameSite" cookies offer a robust
   defense against CSRF attack when deployed in strict mode, and when supported by the client`
   (`offer`, not `offers`). Also restore the dropped condition "and when supported by the client":
   dropping it turns a client-enforcement claim into an unconditional one.
2. **L5 anchor — cut the section name** `§"Common CSRF weaknesses and protection mechanisms"`: zero
   hits in the fetched bytes. Re-point to `§"Employing Custom Request Headers for AJAX/API"` and
   `§"Dealing with Client-Side CSRF Attacks (IMPORTANT)"` for the two quotes it actually uses.
3. **L19-20 — cut "never the whole defense"** or replace with the quotable OWASP line
   ("SameSite is useful as a defense-in-depth control but it does not replace a proper CSRF defense in
   most deployments"); the draft sentence supports "defense in depth", not an absolute.
4. **L22-23 — cut "leaves a shape on the wire … enumerable"**; both fragments have no source
   occurrence and the closed triple omits the sheet's Fetch Metadata, Origin/Referer and
   user-interaction defences. Keep only the three named patterns as an open list.
5. **L26-29 — re-label scope**: the JS-cookie bypass is documented for client-side CSRF, not as a
   general "hole in the cookie defense"; name that section when quoting it.
6. **L10-12 — re-label**: "Wave 2 supplied the cookie mechanics" is upstream-program provenance
   (staged `cookie-samesite-semantics.md`, upstream row S125), not lane-held ground; name that path
   or cut the sentence.
7. **L4-5, L6 — re-point and re-date**: `S145`/`S146` are unregistered (registry is S001–S101,
   contiguous); the admitted file's first `source:` line must be `source: S102 ` (draft) or
   `source: S103 ` (sheet) for C2's counter, with `verified-at: 2026-10-25`.

## Two SOURCES-row blockers (for ScribeSources)

- The custom-header span is **28 words** and returns 0 hits against raw fetched bytes (inline markup);
  the row needs a ≤25-word sub-span (e.g. 21 words to `…custom request header.`) plus the recorded
  extraction method (tag-strip + whitespace normalise).
- `circumventing the SameSite cookie policies` and the Limitations gloss likewise have 0 raw-byte
  hits; a raw-byte quote-presence gate would refuse them unless a markup-free span is chosen.

## Findings (each with its command)

1. Quote not verbatim: `grep -c -F 'offers a robust defense' rfc6265bis-13.txt` → 0; `…'offer a robust defense'` → 2.
2. §8.8.1 located: `grep -n 'Defense in depth' rfc6265bis-13.txt` → `2813:8.8.1.  Defense in depth`.
3. Cited OWASP section absent: tag-stripped text count of `Common CSRF weaknesses and protection mechanisms` → 0.
4. Custom-header quote location: `sed -n '5598,5599p' owasp-csrf.html` → heading id `employing-custom-request-headers-for-ajaxapi` then the quoted sentence.
5. JS-cookie quote location: `grep -n 'circumventing the' owasp-csrf.html` → 5630, inside `Dealing with Client-Side CSRF Attacks (IMPORTANT)`.
6. "enumerable"/"on the wire" unsupported: counts in tag-stripped OWASP text → 0 and 0.
7. Registry has no S145/S146: `grep -cE '^\| S[0-9]{3} ' corpus/SOURCES.md` → 101, ids S001–S101, no gaps.
8. C2 counter does not match staged bytes: `grep -cE '^source: S10[23] ' csrf-defense-boundary.md` → 0.
9. Entry quote length: 28 words → exceeds the ≤25-word row bound.
10. No lane SameSite ground: `ls corpus/knowledge | grep -ci samesite` → 0; `grep -ci samesite corpus/SOURCES.md` → 0.
11. PROVINCE names no CSRF item: `grep -ci csrf PROVINCE.md` → 0 (the phrase resolves only in `corpus/knowledge/packet-readiness-r7.md:64`, `multi-step-journey.md:287`, `arc-synthesis.md:125`).
12. This round's wave 2 is empty: `ls .ufo/waves/round-23/w2 | wc -l` → 0.
