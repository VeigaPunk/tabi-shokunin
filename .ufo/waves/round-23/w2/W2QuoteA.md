# W2QuoteA — S102 quote audit (round 23, wave 2)

Target `corpus/knowledge/csrf-defense-shape-boundary.md`: working tree 8978 B, sha256 `28cb1bbd01278bc7bfa395ed0c82c33d33264bfe11b91d22784f9c46f0b79f0e` (git status `M`; HEAD `03c1b4d9…` carries the same three S102 spans at 25/28/31). Source: one GET, HTTP 200, 146976 B, 3696 lines, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf` — byte-identical to the front-matter and SOURCES anchors. §8.8.1 = heading 2813, body 2815–2828, next heading 2830.
Method: the draft wraps at 72 columns and double-spaces after periods, so spans were located as whitespace-normalised substrings (`re.sub(r'\s+',' ',text).find(q)`), stricter than text grep and immune to the wrapping that makes a plain grep of a wrapped phrase return 0. Reproduce: `curl -sS -o s102.txt <url>; sha256sum s102.txt; python3 verify.py`.

## Span ledger

| # | entry lines | source | words | §8.8.1 lines | verdict |
|---|---|---|---|---|---|
| 1 | 26–27 | S102 | 20 (21 incl. `…`) | 2815–2816 | MATCH, elision marked |
| 2 | 29–30 | S102 | 19 | 2816–2818 | MATCH, elision unmarked |
| 3 | 32–33 | S102 | 20 | 2822–2824 | MATCH, elision unmarked |
| 4 | 104 | S102 | 4 (`offer a robust defense`) | 2815 **and** 1786 | MATCH, not unique |
| 5 | 71–72 | S103 | 18 | absent from S102 | correctly attributed to S103 |

All three S102 blockquotes are verbatim (byte-identical apart from collapsed whitespace), 20/19/20 words against the ≤25 cap (`corpus/SOURCES.md:5-6`, `scripts/check-adjacency.mjs:70`), each inside §8.8.1. The claim's kill rule ("any cited quote absent → refuse the row") does not fire.

## Findings

**H1 — the C2 control arithmetic undercounts the entry's spans.** `claims.json` revision `C2.control / failureCapable` records "every quoted span is located … (2/2 for S102, 2/2 for S103)". The entry has **three** S102 spans at both revisions (HEAD and working tree), and four S103 quoted sentences (md55–56 21w, md57 7w, md71–72 18w, md75 16w). A gate built to that spec checks two and passes with the third unchecked. Command: `git show HEAD:corpus/knowledge/csrf-defense-shape-boundary.md | grep -c '^>'` → 8 lines / 4 spans, 3 of them S102.

**M1 — two locators for one quote set, and the wider one is not a paragraph.** Body md24 says "lines 2815–2828 … in the same paragraph"; `corpus/SOURCES.md:116` says "lines 2815-2824" for the same quotes. 2815–2828 is the whole subsection body: guarantee+limit are ¶2815–2820, span 3 is ¶2822–2824, and ¶2826–2828 is neither quoted nor referenced. The row's range is the accurate one (`awk 'NR>=2810&&NR<=2832' s102.txt`).

**M2 — span 2 cuts mid-clause with no ellipsis.** Omitted: ", as same-site navigations and submissions can certainly be executed in conjunction with other attack vectors such as cross-site scripting." The retained words keep their meaning and the span is a verbatim substring under the lane's rule, so no fabrication — but the dropped clause is the draft's own statement of residual same-site risk, the point §3 argues and grounds only in S103.

**M3 — span 3 cuts with no ellipsis.** Omitted: " to mitigate the risk more fully." Purpose clause dropped; retained meaning unchanged.

**L1 — the E1 fragment is not unique.** `offer a robust defense` occurs at §5.5.7.1 line 1786 ("does not offer … as a general category of attack", form due to the auxiliary) and §8.8.1 line 2815 ("cookies offer", plural). E1's "(plural verb)" rationale holds only for 2815; the fragment should name the line. Command: `grep -n 'offer a robust defense' s102.txt` → 1786, 2815.

**L2 — the third "must not draw" is an untagged inference.** md37 concludes a `SameSite=None; Secure` cookie is not a defence; §8.8.1 says nothing about None. Nearest support is §8.8.3 lines 2871–2873 ("marked with SameSite=None to allow access in cross-site contexts") plus the Secure-required-for-None rule at 3448. Not marked `[INFERENCE]` although QUALITY #3 separates observation from inference (`corpus/QUALITY.md:1-4`).

## Staged bytes re-checked

Staged entry is at `…/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md` (2351 B, sha256 `3d709e7d94ec8ff8d55333ac16362c8bef6d3c80e396c36ac44047959803dfe5`); the entry's `merge/tabi/` locator is the package root, not the entry path. E1 true: staged carries "offers a robust defense against CSRF attack" (flat-find offset 1009; line-wrapped, so a plain grep misses it), and `grep -c 'offers a robust defense' s102.txt` → 0. E3 true: the staged two-sentence join is exactly 28 words. E2 unverifiable here — see residual.

## Residual risk and gaps

- S103 spans (4) were not re-opened: this item authorises one GET, to S102. The round-3 cache `shokuknow/lanes/tabi/round3/.work/owasp-csrf.txt` (52148 B, sha256 `45133237…a094`) is a different serialisation (0 Markdown headings, no "Common CSRF weaknesses" string) and cannot certify E2's "0 of 34 headings".
- The target file is modified in the working tree and was edited during this pass; every line number binds to sha256 `28cb1bbd…f0e`, unchanged across the verification run.
- Front-matter recheck reproduces: `grep -c 'not the extent of'` → 1; `Expires: 18 May 2024` at line 9; quoted heading equals line 2813 exactly.
