# QuarR4216 — S164, S165

Full write-up and commands: `.ufo/waves/round-42/w1/QuarR4216/report.md`. Evidence: `evidence-S164.txt`, `evidence-S165.txt` in that directory.

Register (read-only) `absent-defect-register.md` lines 208–209, lane `tabi`, round `round4`, class `payload-absent`, no anchor column.

## S164 — misbound

- Quote: `With the extension, you can:`
- Registered URL: `https://developer.chrome.com/docs/ai/webmcp/compare-mcp?hl=zh-cn`
- Fetch 2026-10-28 15:37:08 GMT: HTTP 200, 0 redirects, final URL unchanged, 136347 bytes, sha256 `a3b9de7547d118e2cafc62aa37c61acd0517a2617bdd57748e615a76f6636324`, last-modified Wed, 11 Mar 2026 07:00:00 GMT.
- Quote absent from that body (exact and whitespace-normalized, raw and tag-stripped). Only "extension" hits are nav labels "Extensions".
- Same quote is verbatim on the S165 explainer at raw offset 6114: `<p>With the extension, you can:</p>` then the `document.modelContext` bullets.
- Delta: r40 seat already said misbound on a 132978-byte body. Brief label "present as staged" is not supported. Cited page grew to 136347 bytes; the English quote is still absent. Explainer size/etag match the 2026-10-27 fetch, so the sentence was not added there today.

## S165 — absent

- Quote: `(the verification environment and the flag note) and the closing paragraph on two tools with the same description; §`
- Registered URL: `https://googlechromelabs.github.io/webmcp-tools/demos/explainer/`
- Fetch 2026-10-28 15:37:09 GMT: HTTP 200, 0 redirects, final URL unchanged, 19717 bytes, sha256 `ac970a532407b7ce4b142f1d2ebd5b2aab60172d2185a5183d3a891309a32bc0`, etag `"6ad79e73-4d05"`, last-modified Tue, 20 Oct 2026 17:01:39 GMT.
- Full quote and the fragments `verification environment`, `flag note`, `same description`, `two tools`, `closing paragraph` are absent. Not partial. The string is editorial locator prose. Page close is the DevTools/Lighthouse note, not that locator.
- Delta versus r40: class unchanged (absent, editorial summary). Live bytes unchanged (19717, same etag and last-modified). Not called misbound: the locator is not on either URL this seat fetched, and no other URL was fetched.

No tools installed. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4216` deleted.

VERDICT finding S164 misbound (quote verbatim on the S165 explainer, absent from the cited zh-CN URL, 200/136347); S165 absent (editorial locator not in the explainer, 200/19717, etag unchanged vs r40)
