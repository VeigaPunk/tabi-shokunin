VERDICT: PASS

# LiveS016 — independent re-fetch of C1 receipt S016 (Playwright Assertions)

Date 2026-10-20 (host local -03; UTC 2026-10-20). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
read-only. REV/measured candidate `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`refs/heads/master`
and `HEAD` both resolve to it; `git rev-parse` observed). No lane production, fleet, sibling, jj,
Git-index or Git-history writes. No tool installs or updates. No `recheck-fetch.mjs` producer run
to create receipts. `S029` is own-work and was not in this seat's URL scope; no network request was
made for any own-work row.

## Inputs read

- Receipt `corpus/evidence/round-18/source-recheck/S016.json` (1563 B, sha256
  `1ef6ff4c1260a3036078df029ce1108ed86b0053a8106e4117f2f4c89d1c3a3d`), committed blob
  `8f48cd8cfc15261f3df9910b0fc03c48f3d56454`.
- Excerpt `corpus/evidence/round-18/source-recheck/S016.excerpt.txt` (1309 B, sha256
  `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01`), committed blob
  `2d66dc4a3e2cb6473f3a30277ab5bd4068acce0b`.
- Working-tree bytes equal the REV blobs for both files (`git hash-object` = `git rev-parse
  REV:path` for each).
- Registry row at REV: `corpus/SOURCES.md:30` (row `S016`, status `mined`, tier `A`, source cell
  contains `https://playwright.dev/docs/test-assertions` verbatim, anchor `stable docs served
  2026-10-19, §Auto-retrying assertions`, teaches `Web-first assertions wait for the expected
  state; generic value assertions do not retry`). No row at REV says `supersedes S016`.
- Quote origin `corpus/lessons/kaika-fleet-round-1.md:59`; lesson file at REV sha256
  `a3b5b04ee4685defe971bd5904acf490c26be21214a2bd16189e152a1b3dafb4` (working tree identical),
  header dated `2026-10-19`.
- Note `corpus/knowledge/source-recheck-round-18.md` (S016 row at line 66).
- Producer `.ufo/waves/round-18/recheck-fetch.mjs`, sha256
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` at REV and in the worktree;
  equals receipt `producerSha256` (`S016.json:24`).
- Receipt contract: `corpus/knowledge/source-recheck-round-18.md:20-58`; gate: round-18 `PLAN.md`
  C1; counter `.ufo/waves/round-18/measure-c1.mjs`.

## 1. Receipt binding observed

- `schema=tabi-source-recheck-v1`, `row=S016`, `rowUrl`=`url`=`https://playwright.dev/docs/test-assertions`
  (`S016.json:3-5`); `httpStatus=200`, `bytes=159543`, `sha256=1bb8afe8…a2c` (`:8-10`);
  `decode=html-text`, `quoteWords=15`, `quoteFound=true`, `quoteOffset=1402` (`:11-17`);
  `excerptSha256` (`:19`), `teachesVerdict=held` (`:21`), `seat=Recheck08` (`:23`).
- `quoteWords` equals the actual 15-word count of the quote.
- Commit chronology: REV author date `2026-10-20T15:35:44-03:00`, committer date
  `2026-10-20T16:58:00-03:00`; receipt `fetchedAt=2026-10-20T19:05:48.990Z` and file mtime
  `2026-10-20 16:05:48.990 -0300` are the same instant; commit follows the fetch. No chronology
  contradiction.
- Counter contract: `measure-c1.mjs` accepts S016 (see §8); it rejects duplicate rows, wrong
  schema, row URL absent from the row cell, non-64-hex sha, bad quote words, wrong fetchedAt day,
  wrong producer sha, missing/mismatched excerpt, and quote absent from excerpt. All bind.

## 2. Independent fetch (not the producer)

Exact command (receipt argv, with headers captured; the receipt's `<tmp>/body` and
`-w %{http_code}` fields reproduced):

```sh
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -D headers.txt -o body \
  -w 'status=%{http_code}\nbytes=%{size_download}\nurl_effective=%{url_effective}\ncontent_type=%{content_type}\n' \
  "https://playwright.dev/docs/test-assertions"
```

Observed fetch #1: `curl_exit=0`, `status=200`, `bytes=15225` (that is gzip transfer size),
`url_effective=https://playwright.dev/docs/test-assertions`, `content_type=text/html; charset=utf-8`.
On-disk decompressed body: **159543 bytes**, sha256
`1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c`.

Observed fetch #2 (same argv without `-D`): `status2=200`, `bytes2=15225`, sha256 identical
`1bb8afe8…a2c`. Two independent fetches, no body difference.

Key response headers: `HTTP/2 200`, `server: GitHub.com`, `last-modified: Tue, 20 Oct 2026
16:46:38 GMT`, `etag: W/"6ad79aee-26f37"`, `cache-control: max-age=600`, `content-encoding:
gzip`, `age: 0`, `date: Tue, 20 Oct 2026 20:02:35 GMT`, `content-length: 15225`, `vary:
Accept-Encoding`, `x-origin-cache: HIT`, `x-cache: HIT`.

ETag arithmetic: `0x6ad79aee` = 1792514798 = `2026-10-20T16:46:38Z` (equals `last-modified`);
`0x26f37` = 159543 (equals the decompressed body length). ETag, Last-Modified, and body length
agree with each other.

Comparison to receipt: HTTP status, URL, decompressed byte count, and full sha256 all match the
receipt exactly. No raw-body equality concession was needed; the receipt's body is byte-identical
to today's live response.

## 3. Decode and quote location

Decode was performed with the producer's **exported** `decodeBody`/`normalize` functions imported
from a `/tmp` copy of `.ufo/waves/round-18/recheck-fetch.mjs` (the CLI was not invoked; no receipt
or excerpt was written). Observed:

- `normalized_len=15006`
- `quote_count=1`
- `quote_offsets=[1402]`; receipt `quoteOffset=1402` (`S016.json:17`) — exact.
- Quote context: `… There are many generic matchers like toEqual, toContain, toBeTruthy that can
  be used to assert any conditions. … Playwright also includes web-specific async matchers that
  will wait until the expected condition is met. Consider the following example: await expect (
  page . getByTestId ( 'status' ) ) . toHaveText ( 'Submitted' ) ; Playwright will be re-testing
  the element with the test id of status until the fetched element has the "Submitted" text …`
- Excerpt formula: producer formula `text.slice(max(0, offset-600), offset+len(quote)+600) + "\n"`
  equals the committed excerpt exactly (`excerpt_formula_equal=true`); excerpt is 1305 characters
  / 1309 bytes; sha256 `809411872b896d6cfe0bc5c469a8992cea3acb75fcd2ea02dfb208ffb2ca9a01` equals
  receipt `excerptSha256`; the normalized quote is present in the excerpt.

## 4. Source identity and anchor

- Canonical: `<link rel=canonical href=https://playwright.dev/docs/test-assertions>`; effective
  URL is the same; no redirect or mirror.
- Title: `<title data-rh=true>Assertions | Playwright`.
- Version/channel metas observed in the served HTML: `name=docsearch:version content=stable`,
  `name=docusaurus_version content=stable`, `name=docsearch:docusaurus_tag
  content=docs-default-stable`.
- Footer: `Copyright © 2026 Microsoft`.
- Sections: `Auto-retrying assertions` present (4 raw-HTML occurrences; normalized first at
  offset 2059) and `Non-retrying assertions` present (normalized offset 4232).
- Verdict on identity/anchor: **held**. The receipt's `anchorObserved` (`S016.json:20`) is
  accurate for all four recorded observations, including the byte-identity claim to the
  2026-10-19 Gate digest.

## 5. Does the quote support the teaches?

Registry teaches (`corpus/SOURCES.md:30`): "Web-first assertions wait for the expected state;
generic value assertions do not retry".

- The 15-word quote directly supports the first clause: "web-specific async matchers that will
  wait until the expected condition is met."
- The quote does **not** itself contain the second clause. The fetched body does, in the same
  normalized text: at offset 2116, "The following assertions will retry until the assertion
  passes, or the assertion timeout is reached. Note that retrying assertions are async, so you
  must await them."; at offset 4316, "These assertions allow to test any conditions, but do not
  auto-retry."; at offset 4437, "… using non-retrying assertions can lead to a flaky test.
  Prefer auto-retrying assertions whenever possible."
- The receipt's note (`S016.json:22`) explicitly cites both sections for exactly this split, so
  the `held` verdict is not overclaimed: the quote witnesses the retrying half, and the
  non-retrying section of the same fetched body witnesses the generic half. Result: **teaches
  held**, with the quote alone partial by design.
- Non-blocking lexical observation: the literal tokens `Web-first`/`web-first` occur **0** times
  in the fetched body. The page uses "web-specific async matchers", "auto-retrying assertions"
  and "non-retrying assertions". This is a label/terminology difference, not a behavioral
  contradiction; the behavior in the teaches cell is stated verbatim in the body. No superseding
  SOURCES row is warranted on this evidence.

## 6. Alternative rendering / same identity

Fetched the docs source at tags `main`, `v1.64.0`, `v1.64.1`:
`https://raw.githubusercontent.com/microsoft/playwright/<tag>/docs/src/test-assertions-js.md`.
Each returned HTTP 200, 17472 bytes, sha256
`579674fc269a3a452e9988dea6909feb2217c330e2feb3bb410c593dc733a828` (all three identical).
Lines 14-15 contain the sentence with a Markdown link around "async matchers"; lines 64-66
contain "These assertions allow to test any conditions, but do not auto-retry. … can lead to a
flaky test." The raw-source rendering corroborates the same sentence and the same non-retry
clause. It was used only as corroboration, not as a replacement for the receipt URL.

## 7. "sha256 identical to 2026-10-19 Gate fetch" provenance

The digest is recorded at `corpus/lessons/kaika-fleet-round-1.md:59` at REV (lesson header dated
2026-10-19; the digest entered that lesson in commit `a4115fa`, author/committer date
`2026-10-19T19:25:29-03:00`). Independently, `.ufo/waves/round-12/w1/FreshRetry.txt:24` and
`:199` record a round-12 re-fetch on `2026-10-20T04:03:36Z` with the same full digest and
"identical" to the round-1 Gate; line 199 also corrects the earlier wire-size cell to the
raw-body 159543. Today's live body matches the same digest. The receipt's provenance phrase is
therefore accurate, not an unsupported assertion.

## 8. Counter at REV (committed inputs only)

Command: `node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`;
exit 0. Observed key fields:

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},
  "status":{"mined":48,"queued":8,"rejected":8},
  "url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

S016 is accepted; `rejected` is empty. This is committed-input acceptance — it checks the
committed receipt/excerpt/row/producer binding, not the live page. The live check above is the
independent one. I did not run `--live`, which would re-fetch all 51 HTTP receipts.

Bookkeeping note for the main agent: `eligible_rows=58` at REV (64 SOURCES rows minus the six
superseded) while `c1_rows_rechecked=51`, because the seven new rows S058–S064 were opened this
round and the plan's C1 target is the 51 baseline rows ("every row not superseded at B"). This is
consistent with the plan wording; 51 must not be read as seven missing baseline receipts.

## 9. Main claim vs immutable availability / live product freshness

For S016, the source is a **living** `playwright.dev` "stable" docs page, and the receipt is a
live re-fetch on 2026-10-20T19:05:48.990Z with HTTP 200 — not an immutable-pin fetch. The fetched
body is byte-identical to the 2026-10-19 Gate digest, which additionally shows no content drift
across the window rather than merely availability.

The claim text does not conflate the two: PLAN C1 says "Source rows re-verified against their
live source with a committed recheck receipt: 0 → N (target 51…)"; the gate says "C1 counts
round-specific integrity-checked recheck receipts, not overdue rows or current product support";
the counter emits `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable
freshness due-date gate"`; and the note says it "does not make any knowledge entry true. It
records that a quoted sentence is present at the cited location in the bytes fetched on
2026-10-20". No immutable-availability/live-freshness confusion was found for S016.

Residual scope, not a defect: "held" is a documentation-content verdict, not a runtime test of
Playwright behavior; the page is mutable "stable" docs, so this receipt is a point-in-time
witness; the row's own `on-release` / 90-day recheck cell is the future control.

## 10. Finite counterexamples attempted and limits

Attempted and observed:

- Source unreachable / non-200: **no** — exit 0, HTTP 200, effective URL unchanged.
- Quote absent or altered: **no** — count 1, exact normalized offset 1402.
- Alternate rendering for the same identity: **confirmed** — raw docs source at v1.64.0/v1.64.1/
  main carries the sentence (modulo Markdown link markup) and the non-retry clause.
- Anchor/identity drift: **no** — canonical URL, title, stable metas, copyright, and both named
  sections present; ETag mtime/size and Last-Modified agree.
- URL/redirect drift: **no** — no redirect, canonical self-reference.
- Raw-body drift: **no** — two live fetches now and the 2026-10-19 digest all match the receipt.
- Fabricated body/excerpt: **no** — full 159543-byte body digest and exact excerpt formula/sha
  match; the body is the live response.
- Timestamp/chronology defect: **no** — fetchedAt = file mtime; committer date follows the fetch.
- Producer/row/excerpt binding: **no defect** — producer sha at REV matches; rowUrl at
  `SOURCES.md:30`; no supersession; excerpt sha matches.

Limits: this seat checked only S016, not the other 50 receipts; no browser/rendered-DOM check
(raw HTTP text is the same decode the receipt uses); no `--live` sweep over all 51; the
2026-10-19 body is not archived as a file (its digest is recorded in the byte-frozen lesson and
the round-12 seat record); the term "Web-first" is a legacy label absent from the current page
(semantics held, recorded above); the report does not claim independent non-author verification
of the round's other claims or C2/C3.

No lane writes outside this report; all fetch/decode artifacts are in `/tmp/tabi-s016-r18`
(private sandbox). No git commands that write, no jj commands, no installs.

## Files written (absolute)

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS016.md
- /tmp/tabi-s016-r18/body (159543 B; sha256 1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c)
- /tmp/tabi-s016-r18/body2 (159543 B; same sha256)
- /tmp/tabi-s016-r18/headers.txt
- /tmp/tabi-s016-r18/fetch-meta.txt
- /tmp/tabi-s016-r18/normalized.txt (15006 chars + newline)
- /tmp/tabi-s016-r18/producer.mjs (copy for exported normalize/decodeBody only)
- /tmp/tabi-s016-r18/gh-v164.md (17472 B; sha256 579674fc269a3a452e9988dea6909feb2217c330e2feb3bb410c593dc733a828)
- /tmp/tabi-s016-r18/gh-main.md (17472 B; same sha256)
- /tmp/tabi-s016-r18/gh-v1.64.0.md (17472 B; same sha256)
- /tmp/tabi-s016-r18/gh-v1.64.1.md (17472 B; same sha256)
