# QuarR4208 — quarantine re-adjudication S134, S135

Axes: quote-location fidelity, fetch integrity (status, final URL, bytes, sha256), enum letter (present/absent/misbound/partial/unreachable) against the registered quote, delta honesty versus round 40. No tools installed. `/home/vgpnk/.omp/agent/RULES.md` was read; pacman was not run; curl and python3 were already on the host.

Access date: 2026-10-28. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4208/` (deleted after these receipts were written). Register is read-only. Assigned rows are the `tabi` `round2` rows, not the `tameshi` `S134`` never-checked row.

## Register rows

`absent-defect-register.md` header columns: lane, round, id, class, cited source, quote(s), note. No anchor column.

- Line 192: `| tabi | round2 | S134 | payload-absent | https://developer.chrome.com/docs/agents/security | 評估測試和偵錯 | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`
- Line 193: `| tabi | round2 | S135 | payload-absent | https://developer.chrome.google.cn/docs/ai/webmcp/best-practices?hl=zh-tw | tools/list | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |`

## Commands and observed output

```
curl -sS -L --max-redirs 10 --max-time 60 \
  -A "QuarR4208-readonly/1.0 (quarantine re-adjudication; read-only GET)" \
  -D s134.headers -o s134.body -w '...' \
  'https://developer.chrome.com/docs/agents/security'
```

```
name=s134
http_code=200
url_effective=https://developer.chrome.com/docs/agents/security
size_download=111895
num_redirects=0
content_type=text/html; charset=utf-8
sha256 7bc04d06215db17505b0a265a903a21a78508c43c257e4b9d9fcc6aad29371f5
last-modified: Tue, 09 Jun 2026 07:00:00 GMT
date: Wed, 28 Oct 2026 15:36:57 GMT
```

```
curl -sS -L --max-redirs 10 --max-time 60 \
  -A "QuarR4208-readonly/1.0 (quarantine re-adjudication; read-only GET)" \
  -D s135.headers -o s135.body -w '...' \
  'https://developer.chrome.google.cn/docs/ai/webmcp/best-practices?hl=zh-tw'
```

```
name=s135
http_code=200
url_effective=https://developer.chrome.google.cn/docs/ai/webmcp/best-practices?hl=zh-tw
size_download=129355
num_redirects=0
content_type=text/html; charset=utf-8
sha256 952174641f04665f46292168a2933bf90d0a5a0f079a9e0aca488bed20d220e3
last-modified: Mon, 18 May 2026 07:00:00 GMT
date: Wed, 28 Oct 2026 15:36:58 GMT
```

Python then counted exact, HTML-unescaped, and whitespace-normalized hits in both bodies.

## S134 — misbound

Registered quote `評估測試和偵錯`: 0 hits on the cited English page (raw, unescaped, whitespace-normalized). Substrings 評估 / 偵錯 / 測試 are also absent. Title is "Agent security considerations for WebMCP". Headings are English, including "Evaluate your agent's vulnerabilities", which is a different sentence, not a one-token typo of the registered quote.

The quote is verbatim on S135's registered URL (fetched this same run): two hits, the `data-text` attribute and the element text of `<h2 data-text="評估測試和偵錯" id="eval_testing_and_debugging">評估測試和偵錯</h2>`. The next sentence is `建立評估測試，並提供偵錯工具。與確定性單元測試不同，評估無法硬式編碼，因為輸出內容可能採取無法預期的形式。`

Letter is misbound: the registered string belongs to a different registered source that opened today. It is not present on the cited URL, and it is not unreachable.

Delta versus r40 "present as staged": r40's report (2026-10-27) already said this register quote was absent from the S134 URL and was S135's anchor, and used "present" for the gate's own English sentences in `lanes/tabi/round2/SOURCES-PROPOSED.md` (Malicious manifests…; the host_permission note). Those two sentences are still in today's tag-stripped S134 text (`host_permission` is inside `<code>`, so the backtick spelling is not raw). Last-Modified is still Tue, 09 Jun 2026. Content-length moved 111899 (r40) to 111895 (today). That 4-byte gap was not an appearance of `評估測試和偵錯` (still 0 hits). The live location of the register quote did not change. This round's required letter for that quote is misbound, not present.

## S135 — absent

Registered quote `tools/list`: 0 hits on the cited zh-TW page (raw, unescaped, whitespace-normalized, casefold). Also 0 hits on the S134 body. Title "WebMCP 最佳做法", lang `zh-TW-x-mtfrom-en`. Separate substrings "tools", "list", and 工具 occur; they are not the token `tools/list`. No surrounding sentence, because the quote is not in the body.

Letter is absent. Not partial (one token, not a typo). Not unreachable (HTTP 200, final URL equals the registered URL). Not misbound on in-hand fetches: the other assigned source does not contain it. The local gate file attributes a `tools/list` section to S136's URL; that URL was not fetched (this row did not 404, and S136 was not assigned), so it is not used as a misbind proof.

Delta versus r40 "absent": unchanged. r40 recorded HTTP 200 and 129355 bytes on 2026-10-27 with the quote absent. Today the body is still 129355 bytes and Last-Modified is still Mon, 18 May 2026. No live-source change for this quote.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4208/evidence-S134.txt`
- `.ufo/waves/round-42/w1/QuarR4208/evidence-S135.txt`

## Limitations

Static HTML of one GET each. Both pages are server-rendered article HTML (headings and paragraphs are in the body), not an empty client shell. Per-response CSP nonces make sha256 fetch-specific; Last-Modified is the document stamp used for the r40 delta. No companion locale was fetched, because neither URL 404'd. No write under shokuknow. Scratch removed after the evidence files were copied here.

VERDICT finding S134 misbound (register quote is S135's h2, absent from the cited English page; 4-byte size delta did not add it) and S135 absent (tools/list still missing; 129355 bytes and Last-Modified unchanged versus r40)
