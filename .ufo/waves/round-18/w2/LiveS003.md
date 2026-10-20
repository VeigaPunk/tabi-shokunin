VERDICT: ISSUES

# LiveS003 — C1 receipt S003 (Chrome for Testing)

Bounded falsification of one C1 receipt: quote, source identity, anchor, teaches, and the
availability-vs-product-freshness question. Read-only; no lane production, fleet, sibling or jj
changes. Lane `refs/heads/master` observed `530f40a9bc3f10436161a2af1ca0fe9bffffc004`; working tree
clean except the untracked wave-2 directory. No tool installs/upgrades were made (`node` v24.21.0,
`curl` and `git` already present).

## 1. Own fetch ledger (2026-10-20)

| fetch | URL (as issued) | observed result | body bytes | sha256 (full) |
|---|---|---|---|---|
| A | `https://developer.chrome.com/blog/chrome-for-testing` (`curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18'`) | pre-redirect `HTTP/2 301`, `location: /docs/automation-and-testing/chrome-for-testing`; after `-L` `HTTP=200`, effective URL `https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing` | 107908 | `83281d4d86d221567372084082b561b9cc0175936e6af591d5de1af464197e9a` |
| B | `https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing` (same argv, no redirect) | `HTTP=200` | 107908 | `03f8c76de7a731a74eed13292090d32ee816361b1f452c3c827529b8e17d6c1f` |
| R | receipt (`S003.json`) | `httpStatus: 200`, `bytes: 107908` | 107908 | `6091506bf107b8066c3e5d1e3a914edd7d6212f5de1dbef878f8239f1b3bc53b` |

- A-vs-B raw difference: 178 runs, 3203 bytes, all inside `<script>` material — first at raw offset
  101377 (`<script nonce="…">`), the rest in the embedded feature-flag array. `curl -w %{size_download}`
  reported 19668/19686 compressed transfer bytes; the decoded body is 107908 bytes in both cases.
- Producer-normalized `html-text` of A and B is byte-identical: length 7892,
  sha256 `352cbe795ddf3850ed1416340bb59c2ef1600b9c7b8719e86671324ca0a20269`; the receipt quote is at
  offset `5639` in both, exactly the receipt's `quoteOffset`. Raw-body equality is therefore not
  expected on this page, and the receipt's different raw digest is consistent with the page's CSP nonce.
- Quote reproduced verbatim (18 words): "a dedicated flavor of Chrome targeting the testing use case,
  without auto-update, integrated into the Chrome release process". `quoteWords` 18 matches.
- Page static markers still present: `Last updated 2023-06-12 UTC.` (count 2, first raw offset 89656)
  and `"dateModified": "2023-06-12"` (count 1, raw offset 9676). The receipt's `anchorObserved`
  (`S003.json:20`) is correct.

## 2. Findings

### F1 — ISSUE (anchor): the receipt's `note` asserts a body section that does not exist
`corpus/evidence/round-18/source-recheck/S003.json:22` says:

> "Held: body §Discover a dedicated Chrome flavor for testing still calls Chrome for Testing a
> versioned, non-auto-updating flavor of Chrome for the testing use case, separate from regular Chrome."

There is no such section in the fetched document:

- The phrase occurs exactly **once** in the raw body, at raw offset **55571**, inside the left docs
  navigation: `<li class="devsite-nav-item"><a href="/docs/automation-and-testing/chrome-for-testing"
  class="devsite-nav-title"><span class="devsite-nav-text" tooltip>Discover a dedicated Chrome flavor
  for testing</span></a></li>`.
- The document's headings are H1 `Chrome for Testing`; H2 `Background`, `Auto-update: great for users,
  painful for developers`, `Versioned browser binaries`, `The solution: Chrome for Testing`
  (`id="the_solution_chrome_for_testing"`, raw offset 87270). No `h1`/`h2`/`h3` and no `id` contains
  `discover`. The quote at normalized 5639 sits under `The solution: Chrome for Testing` (normalized
  5550), not under the claimed section.
- The row repeats the mislabel: `corpus/SOURCES.md:17` at `530f40a9…` — anchor cell
  `blog last updated 2023-06-12, §Discover a dedicated Chrome flavor for testing`; the original
  quote source `corpus/lessons/kaika-fleet-round-1.md:46` uses the same `§` label.
- The seat report claims the caveat was recorded: `.ufo/waves/round-18/w1/Recheck02.md:32` says the
  nav-versus-prose discrepancy is "recorded in the receipt `note`". It is not. `S003.json:22` contains
  no nav/prose caveat and instead asserts `body §…`.
- The C1 counter does not inspect either field, so this passes: `measure-c1.mjs` parses the registry
  anchor at line 144 and special-cases only S020's `answer` anchor at line 219; it never compares
  `anchorObserved` or `note`. `node .ufo/waves/round-18/measure-c1.mjs 530f40a9…` exits 0 with
  `c1_rows_rechecked:51`, and S003 is one of the 50 `held` rows. The false note therefore does not
  change the count, but it is a false statement inside committed evidence.

Classification: **anchor drifted/misattributed** (the quote is on the named page, but not under the
named section); **quote presence and teaches held** (F4). A repair could be a corrected note/limit or
a registry label such as "page: Chrome for Testing (docs nav title; article section is 'The solution:
Chrome for Testing')". No superseding SOURCES row is required by the round's drift rule unless the
teaches cell changed; the note's `§5` rule at `corpus/knowledge/source-recheck-round-18.md:127` already
says moving anchors are not drift.

### F2 — ISSUE (source identity): the row URL now 301s from blog to docs, and the receipt records only the pre-redirect URL
Observed without `-L`:

```
HTTP/2 301
location: /docs/automation-and-testing/chrome-for-testing
cache-control: private, max-age=2592000
date: Tue, 20 Oct 2026 20:02:28 GMT
```

The receipt's `url` and `rowUrl` (`S003.json:4-5`) are `https://developer.chrome.com/blog/chrome-for-testing`;
`httpStatus` 200 is curl's final status after `-L`; `sha256`/`bytes` are the post-redirect docs page.
The served page's `<title>` is `Chrome for Testing | Automation and testing | Chrome for Developers`,
not a blog title. Content identity held (same article, same `Last updated`), but URL identity and the
"blog" label in the anchor cell drifted. The round-18 note acknowledges redirects generically at
`corpus/knowledge/source-recheck-round-18.md:145` ("`httpStatus` is curl's final status after
redirects") but the per-receipt record has no `url_effective`, so a future verifier cannot see the
301 from the receipt alone. The counter's canonical command (`measure-c1.mjs:233-236`) includes
`-sSL` and does not record the effective URL.

### F3 — BOUNDARY, not a defect: availability of a 2023 page is not product freshness
The main C1 claim is explicitly source-document re-verification, not current product support:

- `PLAN.md:15-16`: "Source rows re-verified against their live source with a committed recheck receipt".
- `corpus/lessons/round-18.md:12-13`: "C1 counts round-specific integrity-checked recheck receipts,
  not overdue rows or current product support."
- `corpus/knowledge/source-recheck-round-18.md:140-141`: quote presence "does not show that the row's
  `teaches` claim is correct … The receipts say what the cited documents and source files contain …
  the 51 rows are not a statement of current live product support."
- Counter output at 530f40: `"freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable
  freshness due-date gate"`.

S003's evidence is an unchanged document with `Last updated 2023-06-12` / `dateModified 2023-06-12`.
Re-fetching it establishes availability and unchanged text; it cannot distinguish a live product from
an archived page. An independent live check of a *different* URL —
`https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json`
(HTTP 200, 703 bytes, sha256 `1f3994e22dee98d21961a669c2be8e115b101d2b7073cd9a5d77caa6c293a7d4`)
— reports Stable `155.0.8059.84`, revision `1697595`, timestamp `2026-10-20T10:18:26.692Z`, and three
download keys. That shows the existential claim happens to hold today, but it is **not** in the
receipt and is not what the row cites. Answer to the attack question: the main claim as written and
gated does **not** conflate immutable availability with live product freshness; if the SCORECARD
reports C1 as "freshness improved" without that qualifier, it would overstate, and S003 contributes
zero product-freshness evidence. `w1/ReconRecheckDue.md:200` separately records "CfT flavor still
current (stable 155.0.8059.84)", which is a recon note, not the receipt.

### F4 — Teaches: supported at the document's authored date (held), with a quote-scope nuance
The 18-word quote itself covers "dedicated flavor … testing use case", "without auto-update",
"integrated into the Chrome release process". The `teaches` cell's remaining words are supplied by the
adjacent body, not by the quote alone:

- "made available for every Chrome release" — producer-normalized offset 5765.
- "A versioned binary that's as close to regular Chrome as possible without negatively affecting the
  testing use case." — producer-normalized offset 5806.
- "you may not want to use your regular Chrome installation for automated testing. This is the
  fundamental mismatch between what's good for regular browser users versus what's good for
  developers doing automated testing." — producer-normalized offsets 4190 and 4282.

So "A versioned, non-auto-updating Chrome flavor exists for automation, separating test browsers from
the user's browser" is supported by the page as a document; `teachesVerdict: held` is defensible at
document level and is not an overstatement. It is not evidence that the flavor exists in 2026; that
is F3's scope limit, not a quote or teaches failure.

## 3. Receipt mechanics that were checked and held

- `rowUrl` occurs verbatim in the S003 row at `corpus/SOURCES.md:17` (read via
  `git show 530f40a9…:corpus/SOURCES.md`).
- `quoteWords` = 18 = actual word count; `quoteFound` true; `quoteOffset` 5639 reproduced exactly.
- `excerptSha256` `36c9ce9261d40bbd48bc88eb73de0873195c48ba7571515ada70051a732c40b2` matches the
  committed excerpt bytes; the excerpt contains the quote.
- `producerSha256` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` matches
  `.ufo/waves/round-18/recheck-fetch.mjs` at 530f40.
- `S003.json` working-tree bytes equal the committed blob; full-file sha256
  `83cb0970655e01479b162399de3611ae0c7e6149b6520a08ae955e870a0adc79`.
- `fetchedAt` `2026-10-20T19:05:46.020Z` is on the required date; `httpStatus` 200 is the final status
  after the observed 301; `teachesVerdict` `held`.
- Receipt source quote binding: `corpus/lessons/kaika-fleet-round-1.md:46` (blob
  `635388cb21613a95bdd37b523e1e4428a4ebf848`) contains the same 18-word quote and the same
  `§Discover…` label; the recheck propagated the label rather than correcting it.

## 4. Remaining unknowns / finite limits

- The receipt's original raw body was not committed; only its digest and excerpt exist. F1–F4 rest on
  independently fetched bodies plus the producer-normalized equality of two fresh fetches, not on
  recovering the producer's exact bytes. This is the round's stated dynamic-page rule.
- The 301 was observed from this host at `2026-10-20T20:02Z`; a locale/cookie variant could serve
  different markup, though the two fetches' normalized text is identical.
- The CfT JSON check is a different public source, not a registry row and not part of C1; it is a
  bounded cross-check, not a replacement for S003's evidence.
- No `recheck-fetch.mjs` production run, no `measure-c1.mjs --live`, no lane or git write.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS003.md
