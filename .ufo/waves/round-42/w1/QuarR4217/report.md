# QuarR4217 — quarantine re-adjudication S166, S167

Seat: QuarR4217. Lane: tabi. Round-42 wave-1, fresh check (round-40 dispositions used only as a delta, not copied). Register read-only: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 210–211. No writes under shokuknow, no commits, no pacman. No tools installed (curl and python3 already present; `~/.omp/agent/RULES.md` read). Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4217/` held the bodies and was removed after these receipts.

Axes checked: registered quote text, live GET evidence, location (exact then whitespace-normalized), verdict enum `{present, absent, misbound, partial, unreachable}`.

## S166

Register row (line 210): lane `tabi`, round `round4`, id `S166`, class `payload-absent`, cited source `https://weel.co.jp/media/tech/webmcp/`, quote `` `evaluate_webmcp` ``. No anchor column. Note claims the quote is in none of the cited source, companions, or local artifacts.

Fetch (2026-10-28T15:37:16Z Date header):

```
curl -sS -L --max-redirs 10 --max-time 45 \
  -A "Mozilla/5.0 (compatible; tabi-quarantine-read/1.0; +research)" \
  -D s166.hdr -o s166.body \
  -w 'http_code=%{http_code} size=%{size_download} url_effective=%{url_effective} redirects=%{num_redirects} content_type=%{content_type}\n' \
  'https://weel.co.jp/media/tech/webmcp/'
```

```
S166 http_code=200 size=299170 url_effective=https://weel.co.jp/media/tech/webmcp/ redirects=0 content_type=text/html; charset=UTF-8
93890e6d3d19edc99f42f09279b69ad0ca66e359ccdfd9f939a799950864eb42
```

`evaluate_webmcp` and `evaluate` are 0 in the raw body and in tag-stripped text. The same token is verbatim in the S167 body fetched below (4 raw hits / 2 tag-stripped). Surrounding sentence: 「HTTPS URL を 1 つ指定して evaluate_webmcp を呼び出すと、ページの目的、機能、登録済みツール、推奨ツール、および公開禁止リスト（チェックアウト、注文確定、カード情報取得は対象外）が返されます。」 `quote-lint-full-v5.json` records this ABSENT quote with `binding: "id"` and `line` equal to the S167 SOURCES row, URL equal to the WEEL page.

The four S166 gate quotes in `lanes/tabi/round4/SOURCES-PROPOSED.md` lines 81–84 are still in the WEEL body (the flags sentence only after tag-strip). That is the basis of the round-40 "present as staged" label, and it still holds. It is not the registered quote.

Verdict: **misbound**.

Delta vs round-40 ("present as staged"): the WEEL byte count is still 299170; sha256 changed from `a55a48cbf0deaaf005c3c9d4fb8016a63c5ecf7ca5d89817d3aa1f036fd331ea` to `93890e6d3d19edc99f42f09279b69ad0ca66e359ccdfd9f939a799950864eb42`. `evaluate_webmcp` is still absent on WEEL and the four gate quotes are still present, so the live page did not gain or lose the registered token. The label changes because this round's `present` requires that registered quote verbatim in the registered source, and the token belongs to the S167 page.

## S167

Register row (line 211): lane `tabi`, round `round4`, id `S167`, class `payload-absent`, cited source `https://claude.com/ja/marketplace/connectors/webmcp-evaluator`, quotes `` `エージェント対応のウェブサイトを監査、改善、デバッグする` `` and `` `予測可能で機械可読なシグナル` ``. No anchor column. (A kotoba S167 row at line 108 is a different source and was not classified.)

Fetch (2026-10-28T15:37:19Z Date header):

```
curl -sS -L --max-redirs 10 --max-time 45 \
  -A "Mozilla/5.0 (compatible; tabi-quarantine-read/1.0; +research)" \
  -D s167.hdr -o s167.body \
  -w 'http_code=%{http_code} size=%{size_download} url_effective=%{url_effective} redirects=%{num_redirects} content_type=%{content_type}\n' \
  'https://claude.com/ja/marketplace/connectors/webmcp-evaluator'
```

```
S167 http_code=200 size=381413 url_effective=https://claude.com/ja/marketplace/connectors/webmcp-evaluator redirects=0 content_type=text/html; charset=utf-8
542b4778b27ca62d3b3604c49533e788a1130326f4fd58bb0ce2bcd5589d103a
```

Both quotes: 0 raw, 0 NFKC, 0 whitespace-stripped. Nearby but not the quotes: 「シートごとの予測可能な使用量」 and 「監査ログ」. The page's own description is 「公開ページのエージェント対応状況を確認できます。検出済みのツール、追加すべきツール、公開してはならない情報を明示します。」

Classification-only GET of the URL named by the lint `line` field (S168), not used as a substitute registered URL:

```
curl -sS -L --max-redirs 10 --max-time 45 \
  -A "Mozilla/5.0 (compatible; tabi-quarantine-read/1.0; +research)" \
  -D s168.hdr -o s168.body \
  -w 'http_code=%{http_code} size=%{size_download} url_effective=%{url_effective} redirects=%{num_redirects} content_type=%{content_type}\n' \
  'https://developer.chrome.com/blog/agent-ready-toolkit?hl=ja'
```

```
S168 http_code=200 size=119257 url_effective=https://developer.chrome.com/blog/agent-ready-toolkit?hl=ja redirects=0 content_type=text/html; charset=utf-8
1aa486a405b3cc290e41c7071c926f32d980d637b178bbeb1364ed780175d1ce
```

Both quotes are verbatim there. Heading, then the next sentence: 「エージェント対応のウェブサイトを監査、改善、デバッグする」 / 「AI エージェントがサイトで予約や注文などのフローを確実に完了するには、予測可能で機械可読なシグナルが必要です。」 `quote-lint-full-v5.json` binds both S167 ABSENT records with `binding: "id"` and `line` equal to the S168 SOURCES row.

Verdict: **misbound**.

Delta vs round-40 ("absent"): the Claude URL still does not contain either quote, so the absence on the registered page did not flip. Byte count is still 381413; sha256 changed from `23894fcff3dc9150df5fc47099407ae4366ff5a3083b3a2fc1eefb6448badbe4` to `542b4778b27ca62d3b3604c49533e788a1130326f4fd58bb0ce2bcd5589d103a`. The label changes from absent to misbound because both strings were found verbatim on the different registered source S168. Round-40 did not fetch that URL.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4217/evidence-S166.txt` (3751 bytes)
- `.ufo/waves/round-42/w1/QuarR4217/evidence-S167.txt` (4633 bytes)

## Limitations

Single GET per registered URL plus one classification GET of the S168 URL the lint line already names. Server HTML/RSC payload, not a browser DOM. Hash deltas at identical lengths were not byte-diffed against the round-40 bodies (those bodies were not retained). No install.

VERDICT finding S166 misbound (`evaluate_webmcp` is on the S167 Claude page, 0 hits on WEEL); S167 misbound (both registered quotes are on the S168 Chrome ja blog, 0 hits on the Claude connector page)
