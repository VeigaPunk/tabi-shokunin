VERDICT: PASS

# C1 receipt S011 — independent live recheck (no counter-invalidating defect; four bounded limits)

## Bottom line

Every contract-checked receipt field reproduces or is satisfied from the committed bytes (the recorded raw
`sha256` is one dynamic response and is not a reproducible page identity), and
`measure-c1.mjs` accepts S011 (`c1_rows_rechecked: 51`, `rejected: []`). The page is a dynamic
developer.chrome.com response: raw-body SHA-256 differs on every fetch, but the decoded body text is
byte-identical across three independent fetches and matches the producer's own normalized hash. The quote
is present at the recorded offset. Source identity, the `last updated` anchor and the `§CDP support in the
future` anchor hold. Four limits are recorded below; none changes the receipt count, and all four are
consistent with limits already declared by the round's own note or by the producer's wave-1 report.

## Environment and method

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c`;
  measured REV = `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (verified with
  `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && git rev-parse --verify refs/heads/master`, exit 0,
  stdout the full 40-hex REV).
- Date/host: 2026-10-20, Linux x86_64; host clock at probe time `Tue 20 Oct 2026 08:04:17 PM UTC`.
- Sandbox: `/tmp/tabi-r18-s011-scout` (private; no lane worktree, no clone needed because all probes are
  reads or `/tmp` writes). No production, fleet, sibling, Git index, or jj state was written. No browser,
  no credential/session content, no `pacman`/`uv`/npm install (tooling installs: none).
- The only lane write is this report. The receipt and excerpt were verified identical between REV and the
  worktree:
  - `git show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/evidence/round-18/source-recheck/S011.json | sha256sum`
    → `8ef74ed6c844e31b6cbf2eaf427de35dd10d53aa2f645d48ef6daaaf50f64da2`; worktree file same digest.
  - `git show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/evidence/round-18/source-recheck/S011.excerpt.txt | sha256sum`
    → `b5de9c737e679a9b7881b14e0ab848320ab80e8e7489164aba065efab590d5da`; worktree file same digest.

## Independent fetch

Exact command for fetch 1 (fetch 2 and 3 are identical except the output path):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabi-r18-s011-scout/body.html \
  -w 'http=%{http_code} size_download=%{size_download} url_effective=%{url_effective}\n' \
  'https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi'
```

Exit 0; stdout `http=200 size_download=19948 url_effective=https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi`.
`size_download` is the compressed transfer size; the on-disk (decompressed) body is 109287 bytes.

| Fetch | HTTP | on-disk bytes | SHA-256 of fetched body (full) |
|---|---|---|---|
| 1 | 200 | 109287 | `a41fbd721d34d22a0e36fd8c710c8206081e821c19354d4ed98f26a2c6f8800c` |
| 2 | 200 | 109287 | `4d0a2e5a4255fc6a708e0732efd61a5e10ee1e5be7f2ae1b3d102048900228e0` |
| 3 | 200 | 109283 | `b12ac6749ac380af094cbca92ddcb02e96bfe06844f0f42eb05e55939156a3a0` |

Receipt recorded body: 109287 bytes,
`8eb1093e53dc813812347b2509ef225a1e9b557071d9be70f6412923a6d328e6` (one response; not reproduced, and
not required to be — see the dynamic-page evidence below).

## Decode, normalize and locate the quote

Independent re-implementation of the producer's `html-text` decode and `normalize()` (Node v24.21.0, no
producer invocation; script `/tmp/tabi-r18-s011-scout/qcheck.mjs`) over each fetched body:

```
body.html  len 7429 found true offset 2332
body2.html len 7429 found true offset 2332
body3.html len 7429 found true offset 2332
excerpt normalized len 1285 quote found true offset 600
```

- Normalized decoded-body text SHA-256 is identical for all three fetches:
  `51fbc23bb9f322fa2cb7936608c1f270d6fb510017c20173ef0607d42ca0de66` (len 7429). The producer's own
  wave-1 measurement reports the same normalized hash and length
  (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck05.md:84`).
- Quote: `Firefox 129 and Puppeteer 23 each getting production-ready support for WebDriver BiDi!`
  — found exactly once, normalized offset **2332**, 12/12 words (receipt `quoteOffset: 2332`,
  `quoteWords: 12`).
- Excerpt: `corpus/evidence/round-18/source-recheck/S011.excerpt.txt` is 1287 bytes, SHA-256
  `b5de9c737e679a9b7881b14e0ab848320ab80e8e7489164aba065efab590d5da` (equals receipt `excerptSha256`);
  normalized excerpt contains the quote at offset 600, exactly the start of the producer's 600-char
  pre-window.

## Receipt field reproduction

| Field | Receipt | Observed |
|---|---|---|
| `schema` | `tabi-source-recheck-v1` | matches |
| `row` | `S011` | exactly one `| S011 |` row at REV (`git show REV:corpus/SOURCES.md:25`); no `supersedes S011` row |
| `rowUrl` | `https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi` | occurs verbatim in that row's `source` cell (cell 3) |
| `url` | same URL | HTTP 200; final URL same |
| `httpStatus` | 200 | my three fetches: 200/200/200 |
| `bytes` | 109287 | fetch 1 and 2: 109287; fetch 3: 109283 |
| `sha256` | `8eb1093e…28e6` | not reproduced (one dynamic response); no raw-body equality is claimed or required |
| `decode` | `html-text` | independent decode reproduces the producer's normalized text hash |
| `quote` | exact sentence | present once at offset 2332 |
| `quoteWords` | 12 | 12 |
| `quoteSource` | `corpus/lessons/kaika-fleet-round-1.md:54` | line 54 contains exactly this row and quote (`grep -n` confirms) |
| `quoteFound` | true | true |
| `quoteOffset` | 2332 | 2332 |
| `excerpt` | `S011.excerpt.txt` | present at REV; hash matches |
| `excerptSha256` | `b5de9c73…d5da` | matches file bytes |
| `fetchedAt` | `2026-10-20T19:05:38.589Z` | file mtime `2026-10-20 16:05:38.589660446 -0300` = `19:05:38.589Z`; exact to the millisecond |
| `producerSha256` | `f2ba0033…a360` | `git show REV:.ufo/waves/round-18/recheck-fetch.mjs | sha256sum` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` |
| `teachesVerdict` | `held` | see limits 1 and 2 |
| `command` | `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 …` | equals the counter's canonical display form; the UA contains spaces and is not shell-quoted, so a shell replay needs the argv form used by the producer/counter, not a literal paste |

Counter run from the lane (read-only counter; it writes only its own `/tmp` fixtures, none invoked here):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```
Exit 0:
`{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}`

S011 is inside the counted 51; `rejected` is empty. The `eligible_rows:58` denominator question is
ReRunC1's scope and is not re-evaluated here.

## Source identity, anchor and teaches

Identity held. The fetched page's `<title>`, `<link rel="canonical">`, `og:url` and `og:title` all name
`WebDriver BiDi production-ready in Firefox, Chrome and Puppeteer` at the row URL; `<meta name="description">`
reads "Puppeteer 23 introduces stable support for Firefox 129 and up, offering a unified API for Chrome and
Firefox automation, based on WebDriver BiDi." The body shows `Last updated 2024-08-07 UTC`
(`/tmp/tabi-r18-s011-scout/body.html:2985`). The article's only update marker is 2024; no revision identity
is asserted beyond that.

Anchor, cell by cell (`corpus/SOURCES.md:25`, REV):

- `last updated 2024-08-07` — held (line 2985).
- `§CDP support in the future` — held literally: `<h2 id="cdp_support_in_the_future" …>CDP support in the
  future</h2>` (`body.html:2948`).
- `§Firefox support` — **not a literal heading**. The body's first section heading is
  `<h2 id="firefox_cdp_and_puppeteer" data-text="Firefox, CDP, and Puppeteer" …>Firefox, CDP, and
  Puppeteer</h2>` (`body.html:2884`; other headings at `:2909` and `:2948`). The normalized body contains
  0 occurrences of `Firefox support` and 0 `id="firefox-support"` / `id="firefox_support"` attributes.
  This is a paraphrase, not a heading. The producer already recorded exactly this in
  `.ufo/waves/round-18/w1/Recheck05.md:55` ("a paraphrase of that first heading, not a literal heading …
  not drift"); no evidence the heading changed after 2024-08-07. The receipt's `anchorObserved` line 20
  names only `Last updated`, the intro, and `§CDP support in the future`, so the receipt itself does not
  assert the literal `§Firefox support` heading; a receipt-only reader does not get the wave-1 caveat.

Teaches, clause by clause:

Row cell (`corpus/SOURCES.md:25`, REV): "Puppeteer reached Firefox through BiDi while Chrome automation
keeps CDP as default; protocol choice stays per-feature".

- "Puppeteer reached Firefox through BiDi" — held by the body: "Puppeteer, from version 23, offers stable
  support for Firefox through WebDriver BiDi" (`body.html:2878-2881`; normalized offsets 2747/2873).
- "Chrome automation keeps CDP as default" — held by `§CDP support in the future`: "for Chrome, Puppeteer
  will keep defaulting to CDP—to not break existing automations, but also to keep supporting automations
  specialized to Chrome's features" (`body.html:2952`; normalized offset 5640). Note the source's future
  "will keep defaulting" from 2024, not a 2026 present-tense measurement; see limit 3.
- "protocol choice stays per-feature" — **inference, not a source sentence**. The normalized decoded-body text
  contains 0 occurrences of `per-feature`; the only `features` occurrence is "Chrome's features" in the
  CDP-default rationale above. The page's protocol selection is per launch (`browser`/`protocol` keys;
  `body.html:2926-2945`) and the Tip points to an external per-API support matrix ("Learn more about
  Puppeteer APIs supported with Chrome, Firefox, CDP, and WebDriver BiDi in Puppeteer's documentation",
  `body.html:2955`, normalized offset 5821); that external document was not fetched by this receipt.

The quote itself supports only the version-scoped announcement. The body supplies the Firefox-through-BiDi
and CDP-default clauses; the third clause is a chain-level paraphrase. The excerpt's 600-char window on
each side of the quote covers full-body normalized offsets 1732–3018 and includes the announcement and the
"Puppeteer's support for Chrome DevTools Protocol (CDP) remains unchanged" sentence (`body.html:2881`), but
it ends before `§CDP support in the future` (offset 5450) and therefore does not itself carry the "keep
defaulting" sentence or the external-matrix pointer. This is consistent with the contract, which requires
only the quote to occur in the excerpt, and with the note's explicit limit.

## Dynamic-page evidence

Raw bodies vary per response; decoded body text does not.

- Raw digests: `a41fbd72…`, `4d0a2e5a…`, `b12ac674…`; on-disk lengths 109287, 109287, 109283; all HTTP 200.
- The first raw difference is the per-response CSP nonce (`<script nonce="…">`, `body.html:3428`, byte
  102757); further differences sit in the devsite config JSON after byte 103943 (feature-flag list order
  and integer arrays). No difference appears in the decoded body text: the normalized hash is
  identical for all three fetches and equals the producer's wave-1 hash (`w1/Recheck05.md:84`).
- Consequence: the receipt's `sha256` pins one dynamic response and is not reproducible by design; it is
  not a page identity. This is the same class of limit the round note records for dynamic pages
  (`corpus/knowledge/source-recheck-round-18.md:143`) and the note's general statement that a quote's
  presence in one response is what was checked (`:140`). No content drift was observed.

## Availability vs live product freshness

The main C1 claim does not conflate the two at the gate level. `corpus/lessons/round-18.md:12-13` says C1
counts "round-specific integrity-checked recheck receipts, not overdue rows or current product support";
the note says it "does not make any knowledge entry true" and that quote presence does not show the row's
`teaches` is correct (`corpus/knowledge/source-recheck-round-18.md:7,140`). S011's receipt is therefore
evidence that the 2024 page is still served with the quoted text, not that Firefox 129, Puppeteer 23 or a
CDP default are current in 2026.

The residual risk is in the row, not the measured claim: the row's teaches uses present tense ("keeps CDP
as default") while the page's only update marker is 2024-08-07 and its sentence is future ("will keep
defaulting"). The knowledge matrix already limits its use to a "version-scoped announcement"
(`corpus/knowledge/webdriver-bidi-capability-matrix.md:46-47`). If the freshness score were read as live
product freshness, S011 would be a counterexample; as specified, it is not.

## Non-blocking limits found

1. **`teachesVerdict: held` is broader than the quote.** The quote supports the announcement only; the
   body supports the first two clauses; "protocol choice stays per-feature" is an inference from the
   "Chrome's features" rationale plus an unfetched external support matrix. The receipt note
   (`S011.json:22`) checks the announcement and the CDP default, not the third clause. This does not
   invalidate the counter (which binds quote, excerpt, producer and row URL, not semantic coverage), and
   the note's §6 disclaimer already says quote presence is not claim truth.
2. **Row anchor "§Firefox support" is a paraphrase, not a heading.** Actual heading: "Firefox, CDP, and
   Puppeteer" (`id="firefox_cdp_and_puppeteer"`); no literal `Firefox support` heading or id. The
   producer recorded this at `w1/Recheck05.md:55` as minor wording, not drift. The receipt's
   `anchorObserved` does not repeat the caveat, but it also does not assert the literal heading.
3. **Present-tense row claim vs 2024 page.** "Keeps CDP as default" is a time-shift from the page's 2024
   future statement; a 2026 HTTP 200 cannot establish current product behavior. The gate disclaims product
   support; the knowledge matrix versions the claim. Downstream use should keep the version scope.
4. **Raw digest non-reproducibility.** The recorded `sha256` is one dynamic response; all independent
   fetches differ raw but agree on the decoded body text. No raw-body equality was required, and none
   was observed.

## Limits

One row (S011) only; three GETs; no S029 check (not this row); no browser, no runtime product probe, no
external Puppeteer docs fetch, no full `--live` sweep of the other 50 receipts. The raw body behind the
receipt was not retained, so its exact digest cannot be recomputed; the quote, excerpt, offset and
normalized-text identity are the reproducible bindings. HTML line numbers above refer to
`/tmp/tabi-r18-s011-scout/body.html` from one fetch and can shift with the dynamic script tail; the
normalized offsets and receipt numbers are the durable citations. No lane production, fleet, sibling,
Git index or jj state was written; no tool install/update was performed.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS011.md
