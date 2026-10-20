VERDICT: PASS

# LiveS010 — C1 receipt attack: S010 (`WebDriver BiDi: 2023 status update`)

Lane `TabiR18.LiveS010-2`, 2026-10-20. Read-only attack on the round-18 C1 receipt
`corpus/evidence/round-18/source-recheck/S010.json` at REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (observed as `refs/heads/master`; no `jj`/git
write, no index change; `git status --porcelain` before and after = only
`?? .ufo/waves/round-18/w2/`). Network probes were two GETs and one HEAD into a private
`/tmp/tabi-s010-3092`. No tool was installed. The producer was not run.

## 1. What was attacked

- Claim C1 (`corpus/lessons/round-18.md:12-16`; `.ufo/waves/round-18/PLAN.md:15-21`):
  rows re-verified by committed, integrity-checked receipts; `fetchedAt` on 2026-10-20;
  counter `node .ufo/waves/round-18/measure-c1.mjs REV`.
- Registry row `corpus/SOURCES.md:24` at REV: S010, docs/A, `mined`, `recheck 90d`,
  anchor `last updated 2023-05-09, §Where are we now?`, teaches
  `Historical baseline of which browsers first shipped BiDi; background only, not a current support matrix`.
  S010 is not in the superseded set (S004/S039/S047/S049/S050/S053).
- Receipt `corpus/evidence/round-18/source-recheck/S010.json:1-24` (disk sha256
  `0360a21541f32d6cfd530321f43cb0b1fe9773bc0254c12838976dc024438456`, identical at REV)
  and excerpt `S010.excerpt.txt` (sha256
  `04f6f7d13661a9a857d9c1ba9c6fdf8176ea5b4043d13bc3ef89749774afeebe`, identical at REV).
- Original quote source `corpus/lessons/kaika-fleet-round-1.md:53`; file sha256
  `a3b5b04ee4685defe971bd5904acf490c26be21214a2bd16189e152a1b3dafb4` at B and REV;
  line 53 contains the quote verbatim (normalized substring test = true).
- Recheck record `corpus/knowledge/source-recheck-round-18.md:2,7,60,110-114,140,147`.
- Producer `.ufo/waves/round-18/recheck-fetch.mjs`, sha256
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` at REV = receipt
  `producerSha256` (`S010.json:24`).

## 2. Independent fetch (receipt.url re-fetched)

Workdir `/tmp/tabi-s010-3092`. Exact command 1, same shape as the producer argv
(`.ufo/waves/round-18/recheck-fetch.mjs:95`):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code} %{size_download} %{url_effective}\n' \
  'https://developer.chrome.com/blog/webdriver-bidi-2023'
```

Observed: `200 19756 https://developer.chrome.com/blog/webdriver-bidi-2023`, exit 0.
Decoded file: `112335` B, sha256
`05138857e4d0a44c5353f55f9981deca03d064282ee275d77cabc8fe338d10da`
(`%{size_download}` is the compressed wire size; the file is the `--compressed` decoded body).

Command 2, identical except output `body2`: `200 19753`, same `112335` B, sha256
`59f7d42f655576ee29cf4b18914b3f75b8e6b8722f81ea4f0c7fac7dec080ebc`. So the raw body is
per-request variable at fixed decoded length.

- `cmp body body2` → `body body2 differ: char 105802, line 3415`; `cmp -l | wc -l` = `3207`
  differing bytes, all in zero-based range `[105801, 110977]`. The differing text is the
  devsite script block: CSP nonce `GKWtaCd4oRlelhsPw3FnKGqT+xuuyA` vs
  `e16WP6vQfJyNp3BlC6qjLlP9szX4kt` plus embedded per-request JSON. Bytes before 105802
  are identical, and the article quote begins at raw offset 77791 — the article region is
  byte-identical across the two fetches.
- `HEAD` (same UA): `HTTP/2 200`; `content-length: 112335`;
  `last-modified: Tue, 09 May 2023 07:00:00 GMT`;
  `cache-control: no-cache, must-revalidate`;
  `date: Tue, 20 Oct 2026 20:03:01 GMT`; `server: Google Frontend`.
- Decode per `receipt.decode` = `html-text` with the producer's decoder + normalizer
  (`recheck-fetch.mjs:29-41,48-55`): normalized length `7816` chars in both fetches; sha256
  of the normalized text `cea5029e89d5b487e67ae3ec30c1aa7b63d88c11bfec879fcd51936f44bc3fa1`
  for both, and equal to the producer's own noted `normSha`/`len 7816`
  (`.ufo/waves/round-18/w1/Recheck05.md:82`).
- Quote found exactly once, normalized offset `3222` (identical to `S010.json:17`),
  15/15 words by `split(/\s+/)` (the counter's own `wordCount`,
  `measure-c1.mjs:276-278`). Raw markup at 2026-10-20 (line-wrapped for display; content
  verbatim):

```
<h2 id="where_are_we_now" data-text="Where are we now?" tabindex="-1">Where are we now?</h2>
<p>In 2022, both <a href="https://crbug.com/chromedriver/4016">Chrome/ChromeDriver 106</a>
and <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1753997">Firefox 102</a> shipped
support for the WebDriver BiDi standard.</p>
```

- Recomputed excerpt (quote ± 600 chars + trailing `\n`): `1303` B, sha256
  `04f6f7d13661a9a857d9c1ba9c6fdf8176ea5b4043d13bc3ef89749774afeebe`; `diff` against the
  committed excerpt is empty and it equals `S010.json:19` exactly.
- Anchor: body marker `Last updated 2023-05-09 UTC.` at normalized offset `6913`;
  `§Where are we now?` heading at normalized offset `3204`; raw anchor id
  `where_are_we_now`. The HTTP `last-modified` date agrees with the body marker.

No alternative rendering was needed: the quote was found on the first fetch, so no
`?hl=`/raw/AMP substitution was made and no evidence was replaced.

## 3. Receipt field audit (observed vs receipt)

| Field (`S010.json` line) | Receipt | Independently observed | Verdict |
|---|---|---|---|
| `schema`:2 | `tabi-source-recheck-v1` | matches | match |
| `row`:3 | `S010` | present at `corpus/SOURCES.md:24`; not superseded | match |
| `rowUrl`:4 / `url`:5 | `https://developer.chrome.com/blog/webdriver-bidi-2023` | verbatim in row source cell; HTTP 200, 0 redirects | match |
| `fetchedAt`:6 | `2026-10-20T19:05:38.731Z` | UTC day 2026-10-20; my fetches 20:03Z | match |
| `command`:7 | canonical curl | equals `expectedCurlCommand(url)` construction (`measure-c1.mjs:233-237`, checked at `:356`), which the counter requires | match (see §5 note) |
| `httpStatus`:8 | `200` | `200` | match |
| `bytes`:9 | `112335` | `112335` decoded; `content-length` 112335 | match |
| `sha256`:10 | `691ce80f…2fbe2` | not reproducible by any re-fetch (per-request body); see §4 | explained, not drift |
| `decode`:11 | `html-text` | reproduces quote/excerpt exactly | match |
| `normalizer`:12 | producer normalize() | my independent replication reproduces the excerpt | match |
| `quote`:13 | 15-word sentence | present verbatim at normalized 3222 | match |
| `quoteWords`:14 | `15` | 15/15 | match |
| `quoteSource`:15 | `kaika-fleet-round-1.md:53` | line 53 at REV contains the quote; file frozen B=REV | match |
| `quoteFound`:16 | `true` | true | match |
| `quoteOffset`:17 | `3222` | `3222` | match |
| `excerpt`:18 / `excerptSha256`:19 | `S010.excerpt.txt` / `04f6f7d1…` | recomputation is byte-identical and same digest | match |
| `anchorObserved`:20 | `Last updated 2023-05-09 UTC; §Where are we now? …` | body marker + `Last-Modified` header + section id all present | match |
| `teachesVerdict`:21 | `held` | substantive historical baseline holds; one qualifier caveat, §6 | held |
| `note`:22 | `historical 2023 baseline` | page is a 2023 status update, not a current matrix | match |
| `seat`:23 | `Recheck05` | producer record `.ufo/waves/round-18/w1/Recheck05.md:24-37` | match |
| `producerSha256`:24 | `f2ba0033…` | `git show REV:.ufo/waves/round-18/recheck-fetch.mjs` hashes to the same | match |

## 4. Why the raw `sha256` does not match a re-fetch (not drift)

The receipt's body digest
`691ce80ffcc67eff9852ab7936560d9b25d9b3a78a4b8caebf60aa4c7632fbe2` pins one response; a
live re-fetch cannot reproduce it. Evidence that this is per-request rendering, not content
change:

- My two fetches: `05138857…` and `59f7d42f…`, both `112335` B, differing only in bytes
  `105801-110977` (script nonce + embedded devsite JSON); article bytes identical.
- The producer's own A/B probe recorded
  `910e5d6363ea4e0a41a6fcd1b70c6464d72c7d95a1670f1317a337ab79746f5c` and
  `9dedb90d2aa4a17e304ac647b0a8a96fd16e9f12f6df3c8ddf8ba8410b96dbac`, with
  `normalizedEqual=true`, `normSha cea5029e…`, `len 7816`
  (`.ufo/waves/round-18/w1/Recheck05.md:73-90`). My normalized sha equals their `cea5029e…`.
- Therefore four retained raw digests (the producer's A/B and my two GETs) all normalize
  to the same 7816-char article text, and the committed excerpt is byte-identical to a
  fresh recomputation. The receipt's own fifth digest has no retained body (the producer
  removes it), but its `quoteOffset` 3222 and excerpt digest match my recomputation
  exactly. This is the "do not require raw-body equality on dynamic pages" case; no
  content drift and no superseding row are indicated.

## 5. Minor reproducibility note (Low, non-falsifying)

`S010.json:7` is a display string built by `argv.join(' ')` without shell quoting
(`recheck-fetch.mjs:98`). Its `-A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18`
and `<tmp>/body` are not shell-runnable as printed (parentheses, spaces, placeholder).
The actual invocation is an argv array with the UA as one element
(`recheck-fetch.mjs:95`), and the counter requires this same display form
(`measure-c1.mjs:233-237`), so the receipt is contract-canonical; my quoted-UA command
reproduced the page. This does not affect quote, anchor, or teaches.

## 6. Source identity / anchor / teaches

- **Identity: held.** Final URL identical (no redirect), HTTP 200, page title
  `WebDriver BiDi: 2023 status update | Blog | Chrome for Developers`, article body and
  `id="where_are_we_now"` section present.
- **Anchor: held.** `Last updated 2023-05-09 UTC.` in the body (normalized 6913);
  HTTP `Last-Modified: Tue, 09 May 2023 07:00:00 GMT`; the named section exists.
- **Teaches: held for the historical baseline; one qualifier is a paraphrase, not source text.**
  The quote supports "Chrome/ChromeDriver 106 and Firefox 102 shipped support for the
  WebDriver BiDi standard" in 2022, which is the historical baseline the row claims, and
  the row explicitly says "background only, not a current support matrix" (pair
  `corpus/SOURCES.md:24`; knowledge use `corpus/knowledge/webdriver-bidi-capability-matrix.md:44-45`
  calls it a "historical statement").
  Counterexample to the exact wording: the row's teaches says "first shipped", but the
  page's visible text contains **0** occurrences of `first` and **0** of `initial`
  (the only raw hits are non-article attributes: byte 427 OAuth scope
  `…devprofiles.full_control.firstparty`, byte 728 `initial-scale=1`), and its only
  shipping sentence asserts shipment, not ordering. So "first" is an author paraphrase.
  Classification: Low, pre-existing SOURCES-cell wording (kaika round 1), not a receipt
  fabrication and not source drift; the receipt's `held` is substantively correct for the
  quoted historical baseline. No in-place SOURCES edit is proposed (round-18 SOURCES is
  append-only for status/recheck/used-by; a wording change would need a superseding row).

## 7. Immutable availability vs live product freshness

The S010 page is frozen at 2023-05-09 (`Last-Modified` = body marker) and cannot show
current BiDi product support. A 2026 re-fetch therefore establishes availability, anchor
survival and quote presence — not product freshness. The artifacts do not conflate the two:

- row teaches: "background only, not a current support matrix" (`corpus/SOURCES.md:24`);
- receipt note: "historical 2023 baseline" (`S010.json:22`);
- recheck note: "It does not make any knowledge entry true" (`corpus/knowledge/source-recheck-round-18.md:7`);
- gate: C1 counts receipts, "not overdue rows or current product support"
  (`corpus/lessons/round-18.md:12-13`);
- counter output (my run) carries
  `"freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"`.

Residual lexical risk only: the axis is named "freshness" and the PLAN phrase "live source"
can be read as product freshness; operationally it is point-in-time anchor integrity. That
scope is already stated in the cited artifacts, so no S010 receipt change is required.

## 8. S029 own-work boundary (secondary check, per instruction)

No network was used. `git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
→ `97073` B, sha256
`b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, equal to
`S029.json:10`, and byte-identical at B `2bff864`, REV `530f40a`, and the pinned commit.
The 17-token quote is unique at normalized offset `74695` (receipt `S029.json:17`);
recomputed excerpt is `1382` B, sha256
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`, byte-identical to
the committed excerpt. Teaches support observed in the blob:
`cleanup.server.listeningAfter=true`, `perWorker[0].listeningAfter=false`,
`runtime.node=26.12.0` vs `pin.node.recorded=24.21.0`, `minimumMajor=20`. Counter excludes
own-work from `held` (`measure-c1.mjs:466-468`) and reports `own_work:1`. Held; no
freshness claim (as the gate says at `corpus/lessons/round-18.md:14`).

## 9. Counter observation

`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` →
exit 0, output:

```
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

S010 is inside the 50 `held`; `rejected` is empty. The counter checks the quote/excerpt/
row-URL/command/hex/date/verdict fields (`measure-c1.mjs:320-380`) but not whether the quote
supports the teaches; that limit is stated at `corpus/knowledge/source-recheck-round-18.md:140`.

## 10. Limits / not run

- Producer `.ufo/waves/round-18/recheck-fetch.mjs` was not executed (contract forbids
  production use); `--live` was not run over all 51 rows.
- Receipt raw `sha256` is not reproducible by design; the producer deletes its temp body
  (`recheck-fetch.mjs:101`), so no receipt-fetch bytes remain to hash. The reproducible
  bindings are the fixed decoded length, quote offset, excerpt bytes and normalized text.
- Only one host was contacted, two GETs plus one HEAD; no browser, no fixture page, no
  download, no credential/session content; no installs.
- The "first" qualifier is judgment-scoped: high confidence it is absent from the page's
  visible text; classifying it as non-falsifying relies on the row's historical scope.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS010.md`
