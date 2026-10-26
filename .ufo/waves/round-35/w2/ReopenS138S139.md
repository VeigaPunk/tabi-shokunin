# ReopenS138S139 — re-open SOURCES rows S138, S139 (round 35, attempt 1, w2)

**Verdict.** S138 **holds**. S139 **holds on the core checks, with two minor cell-level defects**:
the `anchor` cell has no page revision although the page exposes one (sibling MDN rows S006/S007 carry a content commit), and the
`teaches` clause "returns node references reusable in later commands" is grounded at body line 1744 (`sharedId`), outside the cited anchor lines
(1506, 1596-1640) and with no Gate quote. Neither changes tier or admissibility; both should be fixed by a superseding row or logged anchor note (SOURCES is append-only; `anchor`
is not a mutable cell). No URL duplicates. Both re-fetched byte-identical to the Gate (size and sha256 equal).

## Re-fetch (curl -q -sS --proto =https; exit 0 both)
| row | URL | UTC | HTTP | bytes | sha256 | vs Gate |
|---|---|---|---|---|---|---|
| S138 | https://firefox-source-docs.mozilla.org/remote/Prefs.html | 2026-10-26T21:40:28Z | 200 | 31971 | 72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1 | identical |
| S139 | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes | 2026-10-26T21:40:28Z | 200 | 186783 | 721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48 | identical |

## Gate quotes located (body line = raw-HTML file line, `grep -n`/`awk NR`)
- S138 Gate quote "With the end of the CDP support, WebDriver BiDi is the only available protocol, and the preference was removed in Firefox 141." — lines 296-298 (wrapped over 3 lines); `<section id="remote-active-protocols">` at 292, h3 `remote.active-protocols` 293, section closes 299. Stated "296-298 / 292-293" exact.
- S138 extra quote "Defines if WebDriver BiDi experimental commands and events are available for usage. Defaults to true in Nightly builds, and false otherwise." — lines 310-311, h3 309, section 308-312. Exact; 21 words confirmed.
- S139 Gate quote "finds the nodes in a context that match a locator, which specifies the search criteria" — line 1506 (`<h1>` at 1500). Raw grep for the literal fails only because inline `<a>` tags interrupt it (…`context</a> that match`); tag-stripped plain text count = 1. 15 words. Meta description at line 62 repeats it.
- S139 extra quotes: "An object that specifies one of five criteria to find nodes, using a combination of type and value fields." line 1596 (19 words ✓); `For type: "css", value is a string that contains the CSS selector to evaluate` line 1637. Gate says 15 words; I count 14 (minor miscount, still <=25; not a defect of the row).
- Row range claims: S138 "292-299" and "308-312" ✓; S139 "1596-1640" (locator type/value entries 1594-1640) ✓.

## 11 cells (awk on `|`: 11 cells each)
| cell | S138 | S139 |
|---|---|---|
| id | S138 (next unused after S137) ✓ | S139 ✓ |
| source | title + canonical URL ✓ | ✓ |
| kind | docs ✓ | docs ✓ |
| tier | A — Firefox's own docs on Firefox's own prefs, scope-limited ✓ | B — MDN secondary to W3C (S005/S124), consistent with S006/S007 B ✓ |
| scope | bounded; excludes coverage matrix/other engine ✓ | bounded; excludes browser support ✓ |
| anchor | heading ids + lines + fetch date + size + sha. No revision available on page (Sphinx page carries no version/date; same "living page fetched" form as S002) ✓ | **defect (minor):** only "fetched 2026-10-26"; page states "last modified 2026-10-19T17:18:50Z" (line 2207) and a source link `mdn/content … locatenodes/index.md` (2211); S006/S007 anchor an MDN content commit. Revision omitted. |
| teaches | grounded in 296-298, 310-311. "exposed only when … is set" is a mild strengthening of "Defines if … available for usage" (note, not defect) ✓ | **defect (minor):** "css takes a selector string" grounded (1637). "returns node references reusable in later commands" grounded only at line 1744 (`sharedId`: "ID for referencing this node in later commands") and 1734 — outside cited anchor/Gate lines. |
| status | mined; entry cites both on its `source:` line (webdriver-bidi-firefox-runtime-round-35.md:5) and body line 109 uses locateNodes css `#h` ✓ | ✓ |
| opened | 2026-10-26 (fetch 21:13Z in Gate) ✓ | ✓ |
| recheck | 90d — matches siblings S134/S135 (Firefox docs) and S006/S007 (MDN). Note: prefs are release-keyed so `on-release` would also fit; not a defect | 90d ✓ |
| used-by | corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md ✓ | ✓ |

## URL uniqueness
`grep -n -i 'firefox-source-docs.mozilla.org/remote\|locateNodes' corpus/SOURCES.md` → only lines 152 (S138) and 153 (S139) own these URLs; line 138 (S124) matched only on the word locateNodes in its scope text, URL is the W3C draft. No other id registers either URL. Lesson round-35.md:35-36 records the renumber S136→S138, S137→S139 (document-first rule).

## Commands
curl x2 (exit 0, see table); `grep -n`/`awk` on the saved bodies in scratch; `awk -F'|'` on SOURCES.md:152-153 (11 cells each); python tag-strip phrase counts. No browser launched, no lane file touched.
Record: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/ReopenS138S139/fetch-record.txt
