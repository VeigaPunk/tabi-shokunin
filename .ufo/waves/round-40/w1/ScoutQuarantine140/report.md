# ScoutQuarantine140 — quarantine hand-check S140

## Row identification
Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` has two data rows with id S140 (grep `S140`, lines 196 and 226). The wave slice (`assimilation/quarantine-slice`, line 19) lists only `S140 payload-absent`, with no lane. Neighbouring staged IDs S138/S142/S143/S144 match the `tabi` lane rows, so the primary row is the tabi row. The tameshi row is covered under "Secondary row" below.

Primary row (line 196):
- lane `tabi`, round2, id S140, class `payload-absent`
- URL: https://docs.copilotkit.ai/webmcp
- quote: ``The `tools` permissions policy defaults to `self` ; cross-origin iframes also need `allow=\"tools\"` .``
- register note: "cited source, companion URLs and local artifacts were all checked; the quote is in none of them"

## Fetch
- Access date: 2026-10-27 (UTC 19:33).
- Command: `curl -sSL -m 60 -A "Mozilla/5.0" -D h.txt -o copilot.html -w "%{http_code} %{size_download} %{url_effective}\n" https://docs.copilotkit.ai/webmcp`
- Output: `200 227008 https://docs.copilotkit.ai/webmcp`. HTTP/2 200, `content-type: text/html; charset=utf-8`, Next.js app. The file was fetched into scratch, `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine140/copilot.html`, 227008 bytes.
- The page text was extracted by stripping `<script>` blocks and HTML tags, unescaping entities and collapsing whitespace.

## Result: PRESENT (the register's payload-absent class is a false positive for this row)
- Section: "Test the complete path" (page headings: Overview, Start with your coding agent, Do I need an agent?, How CopilotKit connects WebMCP, Add WebMCP manually, React frontend tool, WebMCP only with no agent, Design tools agents can use reliably, Test the complete path, Related).
- The extracted visible text reads: `The tools permissions policy defaults to self ; cross-origin iframes also need allow="tools" . Confirm that document.mod…`
- The raw HTML/RSC payload carries the same text split across `<code>` elements: `" permissions policy defaults to "`, `<code>self</code>`, `"; cross-origin iframes also need "`, `<code>allow="tools"</code>`, `"."`
- Located quote (<=25 words): "The tools permissions policy defaults to self ; cross-origin iframes also need allow="tools" ."
- Why the checker likely missed it: the page is a client-rendered Next.js document, and each inline `<code>` span splits the sentence into separate DOM nodes. The register quote is the markdown rendering of that sentence, with backticks and a space before `;` and `.`. The text is the same once tags are removed.
- Wording, not meaning, differs from the register only by markdown backtick markup and the escaped `\"` inside the register string.

## Secondary row (tameshi round5 S140, line 226)
- URL: https://github.com/VeigaPunk/tameshi-shokunin; quote: `ENVDIFF: classified=5/6 out=/tmp/r5-env-diff.json`.
- I fetched only the cited repo landing page (HTTP 200, 263302 bytes, 0 matches for `ENVDIFF`). I did not look in repo files, because the cited URL is the landing page and not a file. The quote is therefore not found on the cited page.
- Classification: partial/unverifiable. This is not a fabrication verdict, because the underlying artifact the quote came from was not opened. The slice does not identify which row is staged, so this is recorded for completeness only.

## Limitations
- Live page content on 2026-10-27 may differ from the content the original checker saw.
- This hand-check relies on the extracted text and the raw RSC payload, not a rendered browser view.
- No tools installed; no writes outside scratch and this report; the source repo and lane corpus were not touched.

VERDICT ok S140 (tabi, https://docs.copilotkit.ai/webmcp) classification=present; section "Test the complete path"; 227008 bytes HTTP 200; tameshi same-ID row not resolved (landing page only) = partial/unverifiable
