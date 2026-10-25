# Scout — independent re-open of S104 (web.dev bfcache)

Target: lane tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08`, row `corpus/SOURCES.md:119`
(S104), its anchor cell (column 7), and the quotes it underwrites in
`corpus/knowledge/navigation-history-bfcache-evidence.md` and `corpus/lessons/round-24.md:15`.

**One GET, as scoped.** No other external request was made. No browser, no node gate, no
service, no tool install. Everything below is read-only.

## 0. The fetch

```
cd .ufo/waves/round-24/scratch/ScoutReopenS104
curl -sS -L --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) … Chrome/154.0.0.0 …' \
     -o bfcache-reopen.html -w 'HTTP_STATUS=%{http_code}\nSIZE=%{size_download}\n…' \
     https://web.dev/articles/bfcache
```

| observed | value |
|---|---|
| HTTP status | **200** |
| `size_download` | **157663** |
| `url_effective` | `https://web.dev/articles/bfcache` (no redirect) |
| `content_type` | `text/html; charset=utf-8` |
| saved at | `.ufo/waves/round-24/scratch/ScoutReopenS104/bfcache-reopen.html` |
| sha256 | **`df5cc1003548976dfcb584d0d9f862eed55e2bee73ab1b3dc72fd3bad7a2ee2a`** |
| lines | 3428 |

`sha256sum bfcache-reopen.html`; `wc -c` → `157663`; file ends `</html>` (tail inspected, not
truncated).

## 1. Does the S104 anchor cell match?

The anchor cell (`corpus/SOURCES.md:119`, column 7) reads:

> page fetched 2026-10-25, 157667 bytes, sha256 `0dd45292df5288f84748b4d5087ed1c69b0b98eb27dc46eaf7c50c9ffaf28e07`; comparison-table cell at line 2531 …; NotRestoredReasons sentence at line 2893; all major browsers ship a bfcache at line 2511

Two different questions, two different answers:

| question | answer | command |
|---|---|---|
| does the digest match the **committed** bytes? | **YES, exact** — 157667 B, `0dd45292…8e07` | `sha256sum corpus/evidence/round-24/sources/bfcache.html`; `wc -c` |
| does the digest match a **fresh GET of the URL**? | **NO** — 157663 B, `df5cc100…ee2a`; 4 bytes shorter, different digest | the fetch above |

So the anchor cell is a faithful digest of the committed artifact and a **non-reproducible**
description of the URL. A verifier who re-opens the URL and compares `sha256` gets a mismatch
every time; a verifier who compares against `corpus/evidence/round-24/sources/bfcache.html` gets a
match every time. The row's own recheck cadence (`90d`) is what licenses the first reading.

### Exactly how the page changed (localised, not hand-waved)

`diff -u committed.html bfcache-reopen.html` (committed copy staged into scratch as
`committed.html`) → exit 1, 17 diff lines, **2 differing lines out of 3428**:

| line | what differs | size effect |
|---|---|---|
| 3418 | devsite bootstrap `<script nonce="…">` — per-response nonce (`8fA22kouTLidfhiy2qSKd4/378a1Hx` → `Uoq6xmcrJWCNy3TVQV6ZNzxGoS6auc`), same length | 0 B |
| 3423 | devsite `GoogleDevelopersObject` bootstrap: experiment-id integer list (`6,117,118,…` → `7,118,120,…`) and the feature-flag name array (`Profiles__enable_awarding_url`, `Concierge__enable_pushui`, … vs `TpcFeatures__enable_unmirrored_page_left_nav`, `MiscFeatureFlags__enable_view_transitions`, …) | **−4 B** |

Both are inside the trailing devsite app-loader script; the prod build hash
`v5a0f9ff8b593048661361a49e11ab98a8b1ac025e19e60e6189f2b56796f8a43` is identical in both copies.
Per-line byte comparison: **4595 differing bytes** (30 on 3418, 4565 on 3423) = 2.9 % of the
file. (`cmp -l` reports 4677 because positional comparison desynchronises after the 4-byte shift;
the per-line count is the correct one.)

**Article body is byte-identical.** Lines 1–3417 and 3424–3428 compare equal in both files, and
the body-only digest (both bootstrap lines removed, 151268 B) is
`e5ec7b2e081d099e2b1e9456738037451c64d82f6e8b75f54afbf039217bb908` for **both** copies.

### Every cited line still resolves, at the same number

Because the change is same-line-count, line citations survive this particular drift:

- `2511` → `<p>All major browsers include a bfcache, including Chrome since version 96, <a …>Firefox</a> and <a …>Safari</a>.</p>` ✓ (row's "all major browsers ship a bfcache")
- `2531` → the `With bfcache enabled` table cell (see §2) ✓
- `2893` → the `NotRestoredReasons` paragraph ✓
- table container `2519`–`2536`, nearest heading `2513`

## 2. Is the quoted sentence present verbatim?

The entry's blockquote (`navigation-history-bfcache-evidence.md:21-23`) and the lessons row
(`lessons/round-24.md:15`) quote:

> Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all.

Against the **fresh** bytes, line 2531:

- rendered text (tags stripped, entities decoded, whitespace collapsed) → **exact string match**,
  `EXACT_MATCH_RENDERED: True`, 25 words.
- raw bytes carry inline emphasis: `Loading the previous page is <em>essentially instant</em>,
  because the entire page can be restored from memory, without having to go to the network at
  all.`
- `grep -c '<plain sentence>'` on the raw file → **0**; `grep -c '<em>essentially instant</em>'` → **1**.

So: **verbatim as rendered text; not verbatim as raw HTML** (two `<em>` tags interposed). This is
the normal way a rendered sentence is quoted and it does not misstate the source, but it does mean
no digest/`grep` of the raw bytes can ever confirm the quote as written. Same shape at line 2893:
the entry quotes `The Chrome team has added the NotRestoredReasons API to help expose the reasons
why pages don't use bfcache`, which is the rendered prefix of that paragraph — the raw bytes carry
`<a>`/`<code>` inside it and `don&#39;t`, and the sentence continues `, so developers can improve
their bfcache hit rates.` The entry truncates without an ellipsis (prose nit; the span it names,
line 2893, is correct).

## 3. Does the row's dated wording survive the change?

**The prose survives; the digest does not.** Split by what the row actually asserts:

| row assertion | verdict against the fresh fetch |
|---|---|
| URL is the source, opened 2026-10-25 | survives — 200, same URL, same day |
| "157667 bytes, sha256 `0dd45292…`" | **does not survive re-fetch** — 157663 B / `df5cc100…`; true only of the committed artifact |
| comparison-table cell at 2531 quotes the restore path | survives — same line, same cell, same rendered sentence |
| NotRestoredReasons sentence at 2893 | survives — same line, same rendered prefix |
| all major browsers ship a bfcache at 2511 | survives — same line |
| tier B / `docs` / `mined` / `90d` | survives — the body is unchanged, so the tier is still earned by the same prose |

The lane already knew the page is byte-unstable: the entry's **U4** and `lessons/round-24.md:32`
record two same-round copies of **157667 bytes with different sha256** (`4535f93b…` vs
`0dd45292…`). My third fetch **breaks the "same size, different bytes" pattern**: the size moved
too. Therefore:

- "same size" is a coincidence of those two fetches, **not** a property of the drift;
- a change-detector may not use size equality as a stability signal, nor size inequality as
  evidence that prose changed (here the prose did not change at all while the size did);
- the only stable invariant observed across three same-day fetches is the **body region**
  (identical bytes, `e5ec7b2e…` between the committed copy and mine), which is the thing a
  re-verification should compare.

**Cheapest fix if a verifier is ever wired to re-fetch S104:** compare the body-only digest (or the
line-resolved quoted spans) rather than the whole-file `sha256`, and record the drift class in the
row ("whole-file digest is per-response: nonce + devsite experiment assignment"). As written, a
whole-file digest check on S104 is a permanent false mismatch — the same failure shape the round's
M1 mistake names for counters that infer an association.

## 4. A grounded citation error found while locating the quote

The entry's front-matter source line (line 3) names the span
**§"What is the back/forward cache?" comparison table**. No such section exists:

- `grep -c -i "What is the back/forward cache" corpus/evidence/round-24/sources/bfcache.html` → **0**
  (also 0 in the fresh copy).
- The page's h2 set is: `browser-compatibility` (2509), **`basics` — "bfcache basics" (2513)**,
  `optimize` (2613), `analytics` (2837), `additional_resources` (2925). The cited comparison table
  (2519–2536) sits under **§"bfcache basics"**; the h1 is `Back/forward cache` (2289).

Observation, not inference: the section name is wrong; the line number and the quoted cell are
right. Cost to a reader who follows the citation to the page: they look for a heading that is not
there. The row's own anchor cell is careful here (it says "comparison-table cell at line 2531",
with no section name), so the error is confined to the entry's front matter.

## 5. Observation / inference / unknown

**Observed (commands above):** HTTP 200; 157663 B; `df5cc100…`; committed bytes 157667 B /
`0dd45292…`; 2 differing lines (3418 nonce, 3423 devsite flags/experiment list); body digest
`e5ec7b2e…` equal in both; lines 2511/2531/2893 resolve identically in both; quote is an exact
rendered match, absent as raw text, present with `<em>` markup; §"What is the back/forward cache?"
count 0.

**Inference (labelled):**
- The drift is per-response server-side variation — nonce plus experiment/flag assignment in
  devsite's bootstrap — rather than a content edit. Grounds: the diff is confined to those two
  bootstrap lines, the prod build hash is unchanged, and the body is byte-identical. Not proven by
  a repeat fetch, because this ticket allows one GET.
- The 4-byte shrink comes from the flag/experiment array contents, not from any prose removal:
  the body digest is identical and the file length delta equals the array delta on line 3423
  (6148 → 6144).

**Unknown:**
- Response headers were not captured (single GET, no `-D`), so `Content-Length` / `ETag` /
  `Cache-Control` / `Vary` behaviour is unobserved. Whether a conditional GET would return 304, or
  whether an `ETag` would even be stable across the nonce, is untested.
- Whether the drift is stable per request (two fetches always differ) or periodic (devsite A/B
  buckets) is untested — one sample.
- Whether a differently-geolocated/`?hl=` variant (the page carries hreflang alternates, e.g.
  `web.developers.google.cn/articles/bfcache?hl=vi`, at line 76) yields a different body is
  untested; both copies here share the same body digest, so both are the same variant.
- Whether S104's 90-day recheck will find a *prose* change is unknown; nothing here shows one.

## 6. Bottom line

The row is honest about the bytes it committed and wrong about nothing it says about the article's
content: **every cited line and the quoted sentence still resolve in a fresh GET**, and the body is
byte-identical. What does **not** survive re-opening is the anchor cell's identity claim — the
whole-file `sha256`/byte count is a per-response artifact of devsite's bootstrap, so an independent
re-open can never confirm it and will always report a mismatch. The one prose defect found is the
entry's section title (§"What is the back/forward cache?" → the table is under §"bfcache basics"),
plus U4's "same size, different bytes" framing, which this third fetch falsifies as a general rule.
