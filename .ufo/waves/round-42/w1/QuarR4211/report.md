# QuarR4211 — quarantine re-adjudication S143, S144

Axes used: registered-URL identity (final URL after redirects, status, bytes, sha256), quote location (exact, then whitespace-normalized), verdict class (present / absent / misbound / partial / unreachable), delta versus the round-40 disposition on the live bytes.

Lane cell `tabi`, round cell `round3`, ids S143 and S144. Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 198-199. No anchor cells; the quote cells are the only staged text. Other lanes' S143/S144 rows were not adjudicated.

No tools installed. curl, python3, and sha256sum were already on the host. Pacman is paused; nothing was installed.

Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4211/` held the response bodies and was removed after these evidence files were written.

## Commands

```
curl -sSL --max-redirs 10 -A "QuarR4211-readonly/1.0" -D hdr -o body -w "http_code=%{http_code} size_download=%{size_download} url_effective=%{url_effective} num_redirects=%{num_redirects}" <registered URL>
sha256sum body
```

Observed:

- S143 registered URL `https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts` → HTTP/2 200, 0 redirects, final URL identical, content-type text/plain; charset=utf-8, content-length 10681, bytes 10681, sha256 `ee7b6fd89e0080754ad1d17b288a4c2a806728761908fd79291a778524f979f5`, etag `24417a1899b63c1a52629736f18f76674c0b6648279c48fe82c40d392cd9efa2`, date Wed, 28 Oct 2026 15:37:04 GMT.
- S144 registered URL `https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/api/Page.ts` → HTTP/2 200, 0 redirects, final URL identical, content-type text/plain; charset=utf-8, content-length 111019, bytes 111019, sha256 `b446b70c6543026e66bc6da7c1abdefbd1c6a0b12bceb8b44d2e479ece9863bf`, etag `8367afa09d2d3832a0d1b9ffd4d4211f59ee305957463a965fd3a999738da83f`, date Wed, 28 Oct 2026 15:37:05 GMT.

Classification fetch, not a substitute for either registered URL (the URL named in the S144 census `line` field, which is also tabi round3 S145's registered source):

- `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` → HTTP/2 200, 0 redirects, final URL identical, bytes 146976, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`, date Wed, 28 Oct 2026 15:38:00 GMT.

Python exact and whitespace-normalized `str.find` on the full UTF-8 bodies:

- WebMCP.ts: S143 quote exact -1, whitespace-normalized -1. Tokens `151`, `enable-features`, `Requires Chrome` all count 0.
- Page.ts: S143 quote exact index 26680 (line 1085). Both S144 quotes exact -1 and whitespace-normalized -1. Tokens `Defense`, `CSRF`, `SameSite`, `extent of a site` all count 0.
- draft-13: `Defense in depth` exact at newline lines 164 and 2813. `is not the extent of a site's defense against CSRF` exact -1, whitespace-normalized hit (wrap between lines 2817 and 2818).

## S143 — misbound

Registered quote: `Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled`

Not in WebMCP.ts. Verbatim on one line of Page.ts, which is tabi round3 S144's registered source:

```
1084|   * Experimental API for {@link https://github.com/webmachinelearning/webmcp| WebMCP}.
1085|   * Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled.
1089|  abstract get webmcp(): WebMCP;
```

The period after `enabled` is outside the registered quote. quote-lint-full-v5.json records this absent quote with `"binding": "id"` and a `line` that is the Page.ts source-table row, not the WebMCP.ts row.

Delta vs round-40 (absent): the registered WebMCP.ts bytes did not change. Round-40 report `.ufo/waves/round-40/w1/ScoutQuarantine143/report.md` recorded the same 10681 bytes, the same sha256, and the same etag on 2026-10-27, and stated it did not open other puppeteer files. Page.ts is also byte-identical to that day's S144 fetch, so the sentence was already there. What changed is the class: absent → misbound, because this pass located the quote in the other registered source.

## S144 — misbound

Registered quotes: `Defense in depth` and `is not the extent of a site's defense against CSRF`.

Neither is in Page.ts. Both are in draft-ietf-httpbis-rfc6265bis-13, tabi round3 S145's registered source, §8.8.1:

```
2813|8.8.1.  Defense in depth
2815|   "SameSite" cookies offer a robust defense against CSRF attack when
2816|   deployed in strict mode, and when supported by the client.  It is,
2817|   however, prudent to ensure that this designation is not the extent of
2818|   a site's defense against CSRF, as same-site navigations and
2819|   submissions can certainly be executed in conjunction with other
2820|   attack vectors such as cross-site scripting.
```

Whitespace-joined sentence: It is, however, prudent to ensure that this designation is not the extent of a site's defense against CSRF, as same-site navigations and submissions can certainly be executed in conjunction with other attack vectors such as cross-site scripting.

The second registered quote is that sentence with the line break and the three indent spaces removed. It is not a one-token typo and it is not partially present in Page.ts. quote-lint-full-v5.json records both S144 quotes with `"binding": "id"` and a `line` that is the draft-13 source-table row.

Delta vs round-40 (absent): the registered Page.ts bytes did not change. Round-40 report `.ufo/waves/round-40/w1/ScoutQuarantine144/report.md` recorded the same 111019 bytes and the same sha256 on 2026-10-27, and did not fetch the draft. What changed is the class: absent → misbound, after the draft fetch above. No text was added to or removed from Page.ts.

## Limitations

- `main` on the puppeteer raw URLs is unpinned. Today's bytes match the 2026-10-27 fetches; an older revision was not retrieved.
- The draft fetch classifies where the S144 quotes live. It is not the registered URL for S144, and it is not treated as one.
- shokuknow was not written. No git or jj mutation.

Evidence: `.ufo/waves/round-42/w1/QuarR4211/evidence-S143.txt`, `.ufo/waves/round-42/w1/QuarR4211/evidence-S144.txt`.

VERDICT finding S143 misbound, S144 misbound — registered bodies unchanged since r40 and still lack the quotes; quotes are in Page.ts and draft-13 respectively
