# Gate — S136, S137 (tabi round 35, wave w1, seat ScribeSrcFirefoxRemote)

Target file at integration: `corpus/lessons/round-35.md` §Gate. The table below is the row shape
the item asked for: `| S1xx | <URL> | <UTC> | <status> | <bytes> | <sha256> | <quote> | <location> |`.
Both rows also satisfy the C2 counter's provenance predicate: the `## Gate` row carries an https
URL whose host equals the registry row's source-URL host (`firefox-source-docs.mozilla.org`,
`developer.mozilla.org`) and a 64-hex sha256.

## Fetch commands and receipts

Scratch dir `/fast/scratch/hyaku/tabi-r35/ScribeSrcFirefoxRemote`, canonical receipt bytes kept
under `receipt/` and copied to `fetches/`. Read-only GETs, no credentials, no cookies.

```sh
curl -q -sS --proto =https -o receipt/<file> -w '%{http_code} %{size_download}' <URL>
sha256sum receipt/<file>
date -u +%Y-%m-%dT%H:%M:%SZ   # recorded immediately before each fetch
```

| fetch | UTC (pre-request) | status | bytes | sha256 (of the body written to disk) |
|---|---|---|---|---|
| https://firefox-source-docs.mozilla.org/remote/Prefs.html | 2026-10-26T21:13:03Z | 200 | 31971 | 72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1 |
| https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes | 2026-10-26T21:13:04Z | 200 | 186783 | 721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48 |

Raw log line-for-line (`fetches/fetches.log`):

```
2026-10-26T21:13:03Z|https://firefox-source-docs.mozilla.org/remote/Prefs.html|200 31971|72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1
2026-10-26T21:13:04Z|https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes|200 186783|721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48
```

Re-fetch stability, measured this seat:

- `Prefs.html`: the probe body and the canonical receipt are byte-identical, both sha256
  `72cd6162…44f1` (`sha256sum` of the two files), 31,971 B each.
- `locateNodes`: three independent GETs (the receipt plus two refetches 200/186,783 each) all
  hash to `721e6f0c…af48`; the body carries no per-response nonce, so the digest is stable and
  the quote sits at body line 1506 in every copy.

## Gate rows

| row | URL | accessed | status | bytes | sha256 | quote (≤25 words, located) | location |
|---|---|---|---|---|---|---|---|
| S136 | https://firefox-source-docs.mozilla.org/remote/Prefs.html | 2026-10-26T21:13:03Z | 200 | 31971 | 72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1 | "With the end of the CDP support, WebDriver BiDi is the only available protocol, and the preference was removed in Firefox 141." | body lines 296-298, under `<section id="remote-active-protocols">` / h3 `remote.active-protocols` (lines 292-293) |
| S137 | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes | 2026-10-26T21:13:04Z | 200 | 186783 | 721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48 | "finds the nodes in a context that match a locator, which specifies the search criteria" | body line 1506, §`browsingContext.locateNodes` command paragraph |

Supporting quotes (same bytes, same rows):

| row | quote | location |
|---|---|---|
| S136 | "Defines if WebDriver BiDi experimental commands and events are available for usage. Defaults to true in Nightly builds, and false otherwise." (21 words) | body lines 310-311, under h3 `remote.experimental.enabled` (line 309) |
| S137 | "An object that specifies one of five criteria to find nodes, using a combination of type and value fields." (19 words) | body line 1596, §Parameters → `locator` |
| S137 | "For type: "css", value is a string that contains the CSS selector to evaluate" (15 words) | body line 1637, §Parameters → `locator.value` |

Tags are interleaved in the raw HTML (`<code>`, `<a>`); each quote above is the rendered text at
that line, not a single contiguous byte run in the file — which is why the greps below target the
distinctive word sequence rather than the quoted sentence.

## Greps that located each quote in the fetched bytes

```console
$ grep -n 'of the CDP support, WebDriver BiDi is the only available protocol' fetches/Prefs.html
297:of the CDP support, WebDriver BiDi is the only available protocol, and the
$ echo "exit=$?"
exit=0

$ grep -n 'remote.experimental.enabled\|Defaults to' fetches/Prefs.html
308:<section id="remote-experimental-enabled">
309:<h3><code class="docutils literal notranslate"><span class="pre">remote.experimental.enabled</span></code>…
311:Defaults to <code class="docutils literal notranslate"><span class="pre">true</span></code> in Nightly builds, and <code class="docutils…
$ echo "exit=$?"
exit=0

$ grep -n 'finds the nodes in a' fetches/mdn-browsingContext.locateNodes.html
1506:    <p>The <code>browsingContext.locateNodes</code> … module finds the nodes in a <a …>context</a> that match a locator, which specifies the search criteria.</p>
$ echo "exit=$?"
exit=0

$ grep -n 'An object that specifies one of five criteria\|For <code>type: "css"</code>' fetches/mdn-browsingContext.locateNodes.html
1596:<p>An object that specifies one of five criteria to find nodes, using a combination of <code>type</code> and <code>value</code> fields.
1637:<li>For <code>type: "css"</code>, <code>value</code> is a string that contains the <a href="/en-US/docs/Web/CSS/Reference/Selectors">CSS selector</a> to evaluate, such as <code>"li:nth-child(2)"</code>.</li>
$ echo "exit=$?"
exit=0
```

## Fetches recorded but not registered

| URL | UTC | status | bytes | reason |
|---|---|---|---|---|
| https://firefox-source-docs.mozilla.org/remote/index.html | 2026-10-26 (probe) | 200 | 28453 | index only; links the preferences page, no per-command text |
| https://firefox-source-docs.mozilla.org/remote/RemoteAgent.html | 2026-10-26 (probe) | 404 | 358 | guessed path; body is the docs 404 page |
| https://firefox-source-docs.mozilla.org/remote/WebDriverBidi.html | 2026-10-26 (probe) | 404 | 360 | guessed path |
| https://firefox-source-docs.mozilla.org/remote/SupportedClients.html | 2026-10-26 (probe) | 404 | 363 | guessed path |
| https://firefox-source-docs.mozilla.org/remote/Security.html | 2026-10-26 (probe) | 200 | 32928 | grounds the loopback-only restriction and the 9222 default; not registered — the item allotted two rows and S136's preference facts are the ones the C2 row verdicts need. Suggested for a later round's row if the entry cites loopback from Firefox's side |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26 (probe) | 200 | 31324 | no `webSocketUrl` and no `moz:geckodriverVersion` (grep count 0), so it cannot ground R1 |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | 2026-10-26 (probe) | 200 | 41404 | no `headless` string; not needed |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Usage.html | 2026-10-26 (probe) | 200 | 36447 | not needed |
| https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/network/addDataCollector | 2026-10-26 (probe) | 404 | 88379 | MDN has no addDataCollector page; the locateNodes page covers the other command the C2 recipe uses |
| https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/network | 2026-10-26 (probe) | 200 | 155224 | module index; not needed once locateNodes carried the grounding |

Probe fetches were recorded with status and byte count only; QUALITY 93 exempts a 404's body from
the sha requirement, and the 200 probe bodies are not cited by any row, so their digests are not in
the table above. None of these pages is in `corpus/SOURCES.md` (duplicate check in `rows.md`).
