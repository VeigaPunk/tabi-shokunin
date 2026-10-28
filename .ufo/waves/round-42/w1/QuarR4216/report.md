# QuarR4216 — quarantine re-adjudication S164, S165

Seat: QuarR4216. Lane: tabi. Access: 2026-10-28 15:37:08–09 GMT. Read-only register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` (lines 208–209). No write under shokuknow, no git/jj mutation, no install. `~/.omp/agent/RULES.md` read; pacman not used; nothing installed.

Axes used: quote fidelity (exact, then whitespace-normalized, raw and tag-stripped), fetch integrity (status, redirects, bytes, sha256), verdict class (present / absent / misbound / partial / unreachable), delta versus the round-40 label only where the class or the live bytes differ.

## Commands

Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4216` (removed before yield).

```
curl -sSL -D s164.hdr -o s164.body -w 'url_effective=%{url_effective}\nhttp_code=%{http_code}\nsize_download=%{size_download}\nredirect_url=%{redirect_url}\nnum_redirects=%{num_redirects}\ncontent_type=%{content_type}\n' --max-redirs 10 --max-time 60 'https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn'
curl -sSL -D s165.hdr -o s165.body -w '...' --max-redirs 10 --max-time 60 'https://googlechromelabs.github.io/webmcp-tools/demos/explainer/'
sha256sum s164.body s165.body
```

Observed curl metadata:

```
S164 url_effective=https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn
     http_code=200 size_download=136347 redirect_url= num_redirects=0
     content_type=text/html; charset=utf-8
     sha256=a3b9de7547d118e2cafc62aa37c61acd0517a2617bdd57748e615a76f6636324
S165 url_effective=https://googlechromelabs.github.io/webmcp-tools/demos/explainer/
     http_code=200 size_download=19717 redirect_url= num_redirects=0
     content_type=text/html; charset=utf-8
     sha256=ac970a532407b7ce4b142f1d2ebd5b2aab60172d2185a5183d3a891309a32bc0
     etag="6ad79e73-4d05" last-modified=Tue, 20 Oct 2026 17:01:39 GMT
```

Search was exact, then whitespace-normalized, on the raw bytes and on tag-stripped unescaped text. Neither URL 404'd, so no alternate URL was substituted.

## S164 — misbound

Register line 208: lane `tabi`, round `round4`, class `payload-absent`, no anchor column.

- Cited source: `https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn`
- Staged quote, exact: `With the extension, you can:`

The cited page is the zh-CN article 「何时使用 WebMCP 和 MCP」. The quote is not in it (0 hits raw and stripped, including the no-colon form). The only "extension" strings are nav labels "Extensions".

The same quote is verbatim on the S165 registered source (explainer), static HTML at raw offset 6114:

`<p>With the extension, you can:</p>` followed by bullets beginning "See which tools are registered on a page, by monitoring the document.modelContext API."

That is a different registered source, opened in this same pass (200, 19717 bytes). The row bound S165's sentence to S164's URL.

Delta versus round 40: the round-40 seat report already classed this as misbound and recorded the quote absent from a 132978-byte fetch of the same URL. The brief's shorthand "present as staged" is not what that report said, and it is not what today's body shows. Live change on the cited URL: 132978 → 136347 bytes. The English quote is still absent. Article drift that does not add it: today's ephemeral-tool sentence is 「重要的是，WebMCP 工具是临时性的。它们仅在您的页面打开时存在。」 The longer sentence and the session-data/Cookie sentence recorded as present on 2026-10-27 are not in today's body. The explainer side is unchanged versus that day's fetch (19717 bytes, etag `"6ad79e73-4d05"`), so the sentence was not newly added there today; this seat is the one that opened that URL and found it.

A round-39 seat reported a match for this quote on a 132978-byte download of the zh-CN URL. The round-40 seat, at that same size, reported no match. Today's larger body also has no match. This seat does not re-adjudicate the missing 132978-byte file.

Evidence: `w1/QuarR4216/evidence-S164.txt`.

## S165 — absent

Register line 209: lane `tabi`, round `round4`, class `payload-absent`, no anchor column.

- Cited source: `https://googlechromelabs.github.io/webmcp-tools/demos/explainer/`
- Staged quote, exact: `(the verification environment and the flag note) and the closing paragraph on two tools with the same description; §`

Source opened (200, 19717 bytes, no redirect). Full quote absent. Fragments `verification environment`, `flag note`, `same description`, `two tools`, `closing paragraph`, and the single tokens `verification`, `flag`, `closing`, `paragraph`, `environment` are absent. `description` occurs only in schema prose ("name, description, and JSON schema"), which is not a partial of this span. The page's own close is the DevTools / Lighthouse-audit note and the Sarah Drasner credit, plus a link list (best practices, use cases, spec repo, demos, Chrome Status). The string is editorial locator prose (parentheses, "the closing paragraph on…", dangling `§`), not a sentence from the explainer.

Not upgraded to misbound: the locator text is not on either URL this seat was allowed to fetch. Other rows were not opened.

Delta versus round 40: class unchanged (absent, editorial summary). Live source unchanged: 19717 bytes, last-modified Tue, 20 Oct 2026 17:01:39 GMT, etag `"6ad79e73-4d05"`, matching the 2026-10-27 report. sha256 now `ac970a532407b7ce4b142f1d2ebd5b2aab60172d2185a5183d3a891309a32bc0`.

Evidence: `w1/QuarR4216/evidence-S165.txt`.

## Limitations

- One GET per assigned URL, default curl, no browser. S164 is server-rendered devsite HTML (the article text is in the body). S165's prose, including the extension block and the closing lines, is in the static HTML; `app.js` was not fetched.
- No URL besides the two registered ones was fetched. A misbind of the S165 locator onto some third registered page is therefore not ruled in or out.
- Register bytes were not modified. Scratch was deleted after the evidence files were written.

VERDICT finding S164 misbound (quote verbatim on the S165 explainer, absent from the cited zh-CN URL, 200/136347); S165 absent (editorial locator not in the explainer, 200/19717, etag unchanged vs r40)
