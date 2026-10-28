# QuarR4206 — tabi quarantine re-adjudication S126, S130

Axes: exact-then-whitespace match on the registered body; neighbor fetch only to test belonging (never substituted as the registered URL); one enum token per row; r40 delta only from bytes observed today.

No tools installed. Pacman not used. Nothing written under `/home/vgpnk/Projects/shokuknow`. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4206/` was created for the fetches and removed on shell EXIT (`trap 'rm -rf -- "$S"' EXIT`).

Lane cell is `tabi` (register also has souji and tameshi S126 rows; those were not adjudicated). Both tabi rows are class `payload-absent` in `absent-defect-register.md` lines 188 and 189.

## Commands

Registered URLs, read-only GET, UA `QuarR4206-readonly/1.0`:

```
curl -sS -L --max-redirs 10 --max-time 60 -A 'QuarR4206-readonly/1.0' \
  -D "$S/s126.headers" -o "$S/s126.body" \
  -w 'http_code=%{http_code} url_effective=%{url_effective} size_download=%{size_download} num_redirects=%{num_redirects}' \
  'https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api'
curl -sS -L --max-redirs 10 --max-time 60 -A 'QuarR4206-readonly/1.0' \
  -D "$S/s130.headers" -o "$S/s130.body" \
  -w 'http_code=%{http_code} url_effective=%{url_effective} size_download=%{size_download} num_redirects=%{num_redirects}' \
  'https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/f08dbe152502d66e75fa07fb2588dc0feb42bc20/tests/tools/webmcp.test.ts'
sha256sum "$S/s126.body" "$S/s130.body"
```

Observed:

- S126: `http_code=200` `url_effective` unchanged `size_download=337811` `num_redirects=0` `content-type: text/html; charset=utf-8` `date: Wed, 28 Oct 2026 15:37:07 GMT` sha256 `4c14562d807f13203572167ef8c06a2a3469b512de81ec41b2c9f6fa3c9c2195`
- S130: `http_code=200` `url_effective` unchanged `size_download=6541` `num_redirects=0` `content-type: text/plain; charset=utf-8` `date: Wed, 28 Oct 2026 15:37:08 GMT` etag `"f97f5283aaeb481ea0a5ad4341973ee61e4c7a6826a39f810654f333340d43bc"` sha256 `2ba8a64378597db7d65b13f2cf63fe692270cd8394852237d08174dc627bd29b`

Quote search (exact, then whitespace-collapsed) on those bodies: all three S126 spans false; the S130 Japanese sentence false. S126 raw counts of `Native` and `messaging` are 0. S130 CJK count is 0. The whole S130 file was read; it is `describe('webmcp')` TypeScript.

Classification-only GETs, same curl flags, after the registered bodies missed:

- S127 `https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging` → 200, 0 redirects, 159055 bytes, sha256 `08e7d3a77525de2db74e02cbba0e336afa3a4b2a7fd7aca306b75370c1496f10`. Exact `Native messaging` true (title). Exact `Extension side` false. Exact `Native messaging host side` false. Headings include `Native messaging host`, not `Native messaging host side`.
- S131 `https://developer.chrome.com/blog/ai-webmcp-origin-trial?hl=ja` → 200, 0 redirects, 102818 bytes, sha256 `37c46af5333f74e537b97a2b4b2296406294b39736856969b7d23f7c7e676cf3`, `last-modified: Tue, 09 Jun 2026 07:00:00 GMT`. Raw and whitespace-collapsed miss because the sentence is `<p>Chrome 149 では、<a href="https://developer.chrome.com/origintrials/?hl=ja#/register_trial/4163014905550602241">WebMCP オリジン トライアルに登録できます</a>。`. Tag-deleted text contains the staged quote exactly, then `。`.

## S126 — absent

Register quote cells: `Native messaging`, `Extension side`, `Native messaging host side`. Cited page is the rate-limits article and contains its own sentences, including "No more than 900 points per minute are allowed for REST API endpoints, and no more than 2,000 points per minute are allowed for the GraphQL API endpoint." The staged spans are not in it. They were sliced from the S127 anchor cell (census `binding: id`, line text starts `| S127 | Native messaging — Chrome Extensions docs`), but two of the three are not in S127's live document, so the row is not misbound onto that source and not partial on the GitHub page.

r40 delta: verdict unchanged (absent). Live HTML grew from 337116 bytes (2026-10-27) to 337811. The three quotes are still absent. Round-40 did not record a sha256; the round-27 hash `050be21125226425bdc0f81da2fddfa139201c446a5a45407cce38232d6be769` is not today's hash. The 695-byte difference was not byte-diffed against a retained r40 body.

Evidence: `.ufo/waves/round-42/w1/QuarR4206/evidence-S126.txt`

## S130 — misbound

The pinned test file does not contain the sentence. S131's registered blog URL does, as the anchor-split sentence above. Census line for this quote is `| S131 | WebMCP オリジン トライアルに参加する — … origin-trial?hl=ja`.

r40 delta: cited file unchanged (same 6541 bytes and same sha256 `2ba8a64378597db7d65b13f2cf63fe692270cd8394852237d08174dc627bd29b` as ScoutQuarantine130). r40 recorded absent and did not fetch the blog. The label changes because that other registered source was fetched today, not because the test file gained the sentence. S131 is 102818 bytes today versus 102822 in the round-40 S131 seat report; the sentence is still present after tag deletion.

Evidence: `.ufo/waves/round-42/w1/QuarR4206/evidence-S130.txt`

## Limitations

Neighbor fetches are classification only. Tag deletion was used only on S131, where an `<a>` splits one sentence; it was not used to declare a hit on a registered URL. No JS rendering. GitHub Docs article text is in the HTML (the 900-points sentence is present). Saved bodies: `s126.body`, `s130.body`, `s127.body`, `s131.body` in this seat directory.

VERDICT finding S126 absent (GitHub 200/337811, three quotes missing); S130 misbound (same 6541-byte test file as r40; sentence is on registered source S131)
