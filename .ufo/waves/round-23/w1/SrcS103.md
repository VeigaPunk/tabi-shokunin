# SrcS103 — S146 re-open (OWASP CSRF Prevention Cheat Sheet)

**Verdict:** S146 fetched live (HTTP 200, 157 809 B, sha256 `6f32bfbf…872312`); BOTH staged quotes are
character-exact verbatim from the page, but BOTH section citations in the staged entry misplace them —
"S146 §Common CSRF weaknesses and protection mechanisms" does not exist in the document at all, and
"§Limitations of SameSite" exists but does not contain the JavaScript-same-site-cookie sentence.
Quotes verified; citations NOT verified. Admit only with the two section paths corrected.

## Source receipt
- URL: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
  (`curl -sS -L --max-time 60 -o owasp-csrf.html -w 'HTTP=%{http_code} SIZE=%{size_download}' <url>` → `HTTP=200 SIZE=157809`)
- Bytes / digest: `157809` and `6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312`
  (`wc -c < owasp-csrf.html`; `sha256sum owasp-csrf.html`)
- Response headers: `last-modified: Sun, 25 Oct 2026 06:56:47 GMT`, `content-type: text/html; charset=utf-8`,
  `x-origin-cache: HIT`, `date: Sun, 25 Oct 2026 07:13:36 GMT` (`curl -sSI <url> | sed -n '1,12p'`)
- Access date for the SOURCES row: **2026-10-25**. Artifact kept at
  `.ufo/waves/round-23/scratch/SrcS103/owasp-csrf.html`; text extraction is tag-strip + whitespace-collapse,
  quotes matched against that collapsed text (punctuation adjacency preserved, since tags were removed
  without inserting a space).

## Located span A — custom request header (21 words)
- Heading it sits under: **Employing Custom Request Headers for AJAX/API** (`id="employing-custom-request-headers-for-ajaxapi"`, body text offset 27735; sentence at 28008).
- Exact span: "A user-friendly defense that is particularly well suited for AJAX or API endpoints is the use of a custom request header"
- The source sentence then continues in a second sentence: "No token is needed for this approach." The staged
  entry runs the two together — that concatenation is 28 words, i.e. it breaches the ≤25-word quote cap even
  though every word is the sheet's.
- Raw HTML confirms the period binds directly: `the use of a <strong>custom request header</strong>. No token is needed for this approach.`

## Located span B — JavaScript-included cookies (18 words)
- Heading it sits under: **Dealing with Client-Side CSRF Attacks (IMPORTANT)** (body text offset 30660;
  sentence at 31408; the "Client-side CSRF Example" subheading starts at 32443, i.e. after it).
- Exact span: "web browsers will include cookies in same-site request contexts initiated by JavaScript programs, circumventing the SameSite cookie policies"
- Raw HTML: `circumventing the <a href="…same-site-wiki…">SameSite cookie policies</a>.`

## The section the staged entry attributes span B to (and what is actually there)
- **Limitations of SameSite** exists (`id="limitations-of-samesite"`; body text 36702–39124). Span B (31408)
  is OUTSIDE that range; the section contains neither of the two staged quotes.
- It does carry the same claim in different words, sited correctly (16 words): "Client-side CSRF is unaffected. SameSite operates on cross-site requests. It does not protect against client-side CSRF"

## Verbatim determination, per quote
- Span A: verbatim, 1 occurrence, character-exact (`n.count(q1)` = 1). Note the 28-word over-cap noted above.
- Span B: verbatim, 1 occurrence, character-exact (`n.count(q2)` = 1).
- Citation layer: **not** verbatim. `grep -i weakness` and `grep -i 'protection mechanisms'` over the raw
  157 809-byte page both return 0 hits; all 34 `<h1>`–`<h4>` headings were enumerated and none matches
  "Common CSRF weaknesses and protection mechanisms". The nearest real home of span A is
  "Employing Custom Request Headers for AJAX/API".
- Sweep for the negative claim: full-page regex `(?i)weakness` → 0, `(?i)protection mechanisms` → 0 on the raw
  HTML, plus heading enumeration (`re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>')` → 34 headings, filter for
  `weakness|protection mechanisms|common csrf` → empty). No partial-match omission.

## What this changes for C2 (re-pointing the SOURCES row, not a coverage credit)
- Cite S146 by document, with: "§Employing Custom Request Headers for AJAX/API" for span A and
  "§Dealing with Client-Side CSRF Attacks (IMPORTANT)" for span B; optionally add
  "§Limitations of SameSite" for the 16-word span above. Keep each quoted span ≤25 words by stopping at the
  sentence break in span A.
- No measured credit; documented-upstream only. Tool installs in this seat: none (curl/python3/sha256sum already present).
- Unknowns kept open: whether an older revision of the sheet carried a "Common CSRF weaknesses and protection
  mechanisms" heading (not probed — one GET only, and the page's `last-modified` is 2026-10-25); the sheet is
  revised on a rolling basis, so the digest above is the only reproducibility anchor.
