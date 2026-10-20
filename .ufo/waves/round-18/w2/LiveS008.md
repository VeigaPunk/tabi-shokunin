VERDICT: ISSUES

# C1 receipt attack — S008 (Selenium "WebDriver BiDi" docs)

Seat: `TabiR18.LiveS008-2`. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; no git
or file writes in LANE). Baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured candidate
REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git log -1` → "round-18: source rechecks, guarded
harness, routed correction evidence and build wave"; `git rev-parse refs/heads/master` = same).
Probe workspace `/tmp/tabi-s008-3092` (private, removed after this report; all commands below are
reproducible from scratch).

Scope: one receipt, `corpus/evidence/round-18/source-recheck/S008.json` + `S008.excerpt.txt`, against
the live source and against the S008 row of `corpus/SOURCES.md` at REV. I did not re-run
`recheck-fetch.mjs` in receipt-writing mode; I only used its documented `--normalize-only` probe
branch (writes nothing — `.ufo/waves/round-18/recheck-fetch.mjs:10,72-77`).

## 1. Commands and observed outputs

```
$ git -C LANE cat-file -t 530f40a9bc3f10436161a2af1ca0fe9bffffc004
commit
$ git -C LANE show 530f40a...:corpus/SOURCES.md | grep -n 'S008'
22:| S008 | WebDriver BiDi — Selenium — https://www.selenium.dev/documentation/webdriver/bidi/ | docs | A | Selenium's own BiDi activation and API scope | last modified 2026-08-15, §Enabling BiDi in Selenium | Selenium exposes BiDi through a WebSocket capability and low-level domains; binding support is a per-API fact | mined | 2026-10-19 | 90d | corpus/knowledge/webdriver-bidi-capability-matrix.md |
```

Independent fetch (same URL, same curl shape and user agent as the producer's canonical argv,
`measure-c1.mjs:19,234`; body decompressed by `--compressed`):

```
$ cd /tmp/tabi-s008-3092
$ curl -sSL --compressed --max-time 90 \
    -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" -o body \
    -w 'http=%{http_code} bytes=%{size_download} url=%{url_effective}\n' \
    'https://www.selenium.dev/documentation/webdriver/bidi/'
http=200 bytes=15184 url=https://www.selenium.dev/documentation/webdriver/bidi/
exit=0
$ ls -l body            # 92317 bytes (decompressed body on disk)
$ sha256sum body
c919558a0ec5e42fb7b33560d633f508dd6f30dfb39f4821270cdfe0b3a9c97b  body
$ date -u +%FT%TZ
2026-10-20T20:02:04Z
```

`bytes=15184` is the compressed transfer size; `--compressed` leaves 92317 B on disk, which is the
receipt's `bytes` value. Corroboration: `HEAD` returned `HTTP/2 200`, `content-type: text/html`,
`etag: "6ad73d6a-1689d"`; `0x1689d` = 92317, the same body length.

Producer-normalizer probe over the fresh body (the exact decode+normalize pair the receipt names):

```
$ node LANE/.ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text \
    --body /tmp/tabi-s008-3092/body \
    --quote 'The low-level BiDi domains will be accessible in the code to the end user'
{"found":true,"offset":4770,"normalizedLength":6412,"window":" ... The low-level BiDi domains will be accessible in the code to the end user, but the goal is to provide high-level APIs ... As such, the low-level components will not be documented, and this section will focus only on the ..."}
exit=0
```

Excerpt reproducibility — the producer's own excerpt algorithm
(`text.slice(offset-600, offset+quoteLen+600) + "\n"`, `recheck-fetch.mjs:106-107`) applied to my
fresh body reproduces the committed excerpt byte-for-byte:

```
fresh_excerpt_sha256     9005e2117b109d0c036cd7c658ae70bd85c3e9578e5d15a5718c6476a4841122
committed_excerpt_sha256 9005e2117b109d0c036cd7c658ae70bd85c3e9578e5d15a5718c6476a4841122 (1274 B)
byte_equal true
```

Producer and receipt blobs:

```
$ sha256sum LANE/.ufo/waves/round-18/recheck-fetch.mjs
f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360   (receipt producerSha256: same)
$ sha256sum <(git show 530f40a...:.ufo/waves/round-18/recheck-fetch.mjs)
f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360
$ sha256sum LANE/corpus/evidence/round-18/source-recheck/S008.json
e9fc23be944670e4572bf8c89ca73114848f04b967d3da8e8108b7a6438b91ee   (= sha256 of the REV blob content)
$ sha256sum LANE/corpus/evidence/round-18/source-recheck/S008.excerpt.txt
9005e2117b109d0c036cd7c658ae70bd85c3e9578e5d15a5718c6476a4841122   (= sha256 of the REV blob content)
```

Counter (committed-input counterpart, read-only over git objects):

```
$ node LANE/.ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
exit=0
{"rev":"530f40a...","c1_rows_rechecked":51,"eligible_rows":58,"held":50,
 "drift_superseded":0,"own_work":1,"rejected":[],
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`quoteSource` lineage: `corpus/lessons/kaika-fleet-round-1.md:51` is the S008 table row, quote verbatim
and raw-fetch sha256 `c919558a…` identical to the receipt's. So the round-18 quote is the same text
and the same bytes as the 2026-10-19 opening fetch.

## 2. Receipt fields vs observation

| Field | Receipt | Observed 2026-10-20T20:02Z | Match |
|---|---|---|---|
| `schema`/`row`/`url`/`rowUrl` | `tabi-source-recheck-v1`, S008, docs URL | row S008 exists at REV (`SOURCES.md:22`), URL occurs verbatim in its `source` cell | yes |
| `fetchedAt` | `2026-10-20T19:05:41.182Z` | my fetch 20:02Z, same day | yes |
| `httpStatus` | 200 | 200, no redirect (`url_effective` unchanged) | yes |
| `bytes` | 92317 | 92317 on disk after `--compressed`; ETag suffix `0x1689d`=92317 | yes |
| `sha256` | `c919558a…a9c97b` | `c919558a…a9c97b` (full digest above) | **exact** |
| `decode`/`normalizer` | `html-text`, one normalizer | producer probe found the quote with the same function | yes |
| `quote`/`quoteWords` | sentence, 14 words | exact string, 14 words, 1 occurrence in 6412-char normalized text | yes |
| `quoteOffset` | 4770 | 4770 | **exact** |
| location | §Enabling BiDi in Selenium | heading at normalized offset 3966; next section heading at 5202; quote 4770 sits inside | yes |
| `excerptSha256` | `9005e211…1122` | fresh body reproduces the excerpt byte-for-byte | **exact** |
| `anchorObserved` | footer "Last modified August 15, 2026"; section present | footer at 6095–6124, commit `7a6516d1648` (full `7a6516d16481aec8f6c60c442140b37ab468c3ba` appears once in raw body) | yes |
| `producerSha256` | `f2ba0033…a360` | equals worktree and REV blob | yes |
| `teachesVerdict` | `held` | **partial** — see F1 | **no (F1)** |

Source identity: **held** (same URL, same serving identity; three independent fetches — kaika
2026-10-19, receipt 2026-10-20T19:05Z, mine 20:02Z — produced the same 92317.B / `c919558a…` body).
No drift and no unreachable condition. Raw-body equality is observed here but, per
`corpus/knowledge/source-recheck-round-18.md` §6, a one-response digest is not a page identity; the
finding below does not depend on that equality.

## 3. F1 — ISSUES: `held` endorses a teaches clause the fetched page does not state

The S008 row asserts: "Selenium exposes BiDi through a WebSocket capability and low-level domains;
**binding support is a per-API fact**" (`corpus/SOURCES.md:22` at REV). The receipt's
`teachesVerdict: "held"` (`S008.json:21`) and note (`S008.json:22`, "…so binding differences are
per-API — teaches holds at that anchor") certify that relation for the whole cell.

Clause 1 is supported by the page:

- activation sentence at 4024: "In order to use WebDriver BiDi, setting the capability in the
  browser options will enable the required functionality", followed by Java/Python/CSharp/Ruby/
  JavaScript/Kotlin snippets (`setCapability("webSocketUrl", true)`, `enable_bidi`, `UseWebSocketUrl`,
  `web_socket_url`, `enableBidi`);
- the quoted sentence at 4770, plus 4946: "As such, the low-level components will not be documented".

Finite counterexample for clause 2 — clause 2 has no lexical support anywhere on the page:

- normalized text length 6412; case-sensitive `binding` = **0 hits**;
- case-insensitive `binding` = 2 hits, both legacy sidebar nav labels at 2016 and 2030
  ("Python Bindings", "Ruby Bindings", raw ids `m-documentationlegacyselenium_3python_bindings`,
  `…_ruby_bindings`) — no prose sentence;
- `supported` = **0 hits**; `not supported` = 0 hits;
- the only lowercase `support` in the page (offset 5724) is "CDP **support** is temporary until
  WebDriver BiDi has been implemented." — a statement about CDP, not about bindings.

A charitable reading ("the binding API spelling is per binding") is also not a *support* claim, and
the page's six snippets show every listed binding with an activation path, so the page cannot by
itself evidence differing binding support. The provisional per-API fact that the row wants is actually
carried by S009 ("The Python intercept API is marked provisional, so 'BiDi supported' must be scoped
per binding, release and command", `SOURCES.md:23`), and the knowledge note already attributes it
that way: `corpus/knowledge/webdriver-bidi-capability-matrix.md:49-51` (S008 = capability + doc scope)
and `:72` (S009 = binding coverage varies). The registry cell, not the knowledge note, is the
overbroad carrier; the round-18 receipt re-verifies only the S008 half and then asserts the whole.

Two smaller tense/derivation defects in the same field:

- the quoted sentence is future-tense ("**will be** accessible", "**will not** be documented"); the
  note renders it present-tense ("are accessible but undocumented"), and the row reads "exposes …
  low-level domains" in the present;
- "so binding differences are per-API" does not follow from "the low-level components will not be
  documented"; it is the S009 fact imported without its source.

Why this is real but narrow: the C1 counter cannot see it. `measure-c1.mjs:337` accepts
`teachesVerdict` on the string alone (`held`/`drift`), and the live path only re-tests quote presence
(`measure-c1.mjs:427-429`, "live quote not found"). So `c1_rows_rechecked=51` is unchanged by this
finding; the defect is the receipt's semantic verdict/note, not the count or any digest. The round's
own limits section pre-discloses the general form of this gap (`source-recheck-round-18.md` §6:
"`quoteFound` shows the normalized quote occurs … It does not show that the row's `teaches` claim is
correct"), so nothing is concealed — but the S008 receipt's note does not carry that caveat and
instead states the inference as established.

Severity: low; no measurement change; repair is text-level. Do **not** edit the S008 `teaches` cell in
place — SOURCES is append-only except status/recheck/used-by (PLAN byte-frozen/append-only rules). If
the registry cell itself is to be corrected, it needs a superseding row (new id, teaches starting
`supersedes S008 — …`); otherwise amend the receipt note to state that the quote supports the
capability/low-level-domains clause and that the per-API support clause rests on S009.

## 4. F2 — observation, not a defect: the anchor date is a metadata-fix date

The footer reads: "Last modified August 15, 2026: Fix metadata on Selenium Manager and WebDriver BiDi
pages (#2769) (7a6516d1648)" (normalized 6095–6178). That date/commit records a metadata commit, so
it does not date the quoted paragraph's content; the receipt's `anchorObserved` reports the page's own
marker truthfully and does not claim otherwise. The HTTP `last-modified: Tue, 20 Oct 2026 10:07:38
GMT` differs from the footer and is a build/serve artifact — the body bytes did not change across the
three fetches. Cross-fetch digests, not either date, are the stability witness here.

## 5. F3 — context, outside this receipt's scope: 51 vs 58 denominator

At REV, `eligible_rows=58` = 64 rows minus the six B-time supersessions
(`measure-c1.mjs:15`), while the claim target is 51 = rows not superseded at B. The 7 new rows
S058–S064 have no receipts by design and `rejected=[]`, so `c1_rows_rechecked=51` meets the plan's
stated target. Recorded only so the pair is not misread as seven missing receipts.

## 6. Claim-level test: availability vs live product freshness

PLAN C1 says "Source rows re-verified against their live source with a committed recheck receipt",
counted by `c1_rows_rechecked`. The artifacts and prose scope that to document-level re-verification,
not product state:

- `measure-c1.mjs:471` emits `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable
  freshness due-date gate"`;
- `corpus/lessons/round-18.md` §Gate: "C1 counts round-specific integrity-checked recheck receipts, not
  overdue rows or current product support"; §Limits: "Source-only; no runtime … not a statement of
  current live product support";
- the S008 page itself says the product is transitional: "CDP support is temporary until WebDriver
  BiDi has been implemented." (5720) and "This functionality is currently available in a limited
  fashion with the [Chrome DevTools Protocol] (CDP)" (3333).

So the main claim does **not** confuse immutable availability with live product freshness at the
claim/counter level; that conflation exists only inside `S008.json:21-22`, in miniature (a document
sentence treated as a support statement). The freshness axis was already moved by bounded source
re-verification in round 12 (`SCORECARD.md` round-12 block: "improved bounded source re-verification:
0→3 exact target reviews"), so a source-recheck-based freshness move is precedented and on-axis.

## 7. Limits — checks not run

- I did not run `measure-c1.mjs --live`; it re-fetches all 51 receipts. I re-fetched S008 only, with
  the same URL/user-agent/curl shape, i.e. the row-specific live test.
- No browser, no BiDi endpoint, no Selenium install was contacted; no product-state claim is made.
- No alternative rendering/raw endpoint was needed: the quote is present in the served page at the
  recorded offset under the producer's own decoder. Nothing was substituted for evidence.
- I did not write receipts or run the producer into the production receipt directory; the
  `--normalize-only` branch writes nothing (`recheck-fetch.mjs:72-77`).
- No git writes anywhere; no sandbox clone was needed (read-only network + git objects). The `/tmp`
  probe directory is removed; the commands and digests above are the retained reproduction.

## 8. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS008.md` (this report)
- `/tmp/tabi-s008-3092/{body,decoded.txt,decode.cjs,c1.json,c1.err}` — private probe files, removed
  after writing this report; contents and digests are recorded above.

No tool installs or upgrades were performed.
