VERDICT: ISSUES
# LiveS017 — C1 receipt S017 re-open, and the live-vs-immutable claim boundary

Read-only on lane `530f40a9bc3f10436161a2af1ca0fe9bffffc004`; baseline B
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. No lane production, fleet, sibling, jj or Git-index
write. No tool installed or upgraded (curl 8.23.0, node v24.21.0, git 2.56.0 already present).
Probe sandbox `/tmp/fsd-s017-private` was created by me and is deleted after this report; every
result below is reproducible from the commands shown.

**Result in one line.** The S017 receipt reproduces end-to-end: HTTP 200, 1,002,533-byte body,
sha256 `ce461e5be73bd602d24395e4628c62ded8293b088a085c82f5436960241952c5`, quote at normalized
offset 3891, excerpt byte-identical, producer digest matched; source identity, anchor and teaches
all **held**. Two C1 note/claim-scope defects (F1, F2) are reported below; neither changes the
counter's `c1_rows_rechecked=51`.

## 1. S017 fetch (live URL, not a cached/immutable copy)

Receipt URL == row URL == fetched URL: `https://playwright.dev/docs/release-notes`
(`corpus/evidence/round-18/source-recheck/S017.json:4`; row `corpus/SOURCES.md:31` at REV contains
that URL verbatim).

Commands and observed output:

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code} %{size_download} %{url_effective}\n' 'https://playwright.dev/docs/release-notes'
200 99752 https://playwright.dev/docs/release-notes
sha256sum body
ce461e5be73bd602d24395e4628c62ded8293b088a085c82f5436960241952c5  body
wc -c body
1002533 body
```

A second fetch with `-D headers` at `2026-10-20T20:05:09Z` produced the same decoded body
(`sha256 ce461e5b…52c5`, 1,002,533 bytes; `code=200`, `%{size_download}=99752` = gzip transfer
size). Response headers: `HTTP/2 200`, `server: GitHub.com`,
`content-type: text/html; charset=utf-8`, `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`,
`etag: W/"6ad79aee-f4c25"`, `cache-control: max-age=600`, `content-encoding: gzip`, `age: 189`.
The receipt's `bytes` and `sha256` (`S017.json:10`) are exactly the decoded body, not the
compressed transfer size, and its `fetchedAt` `2026-10-20T19:05:48.991Z` is 24 h after the
row's recorded `2026-10-19` fetch. The row is byte-identical at B and at REV: `corpus/SOURCES.md:31`
carries the same `ce461e…` digest and `served 2026-10-19` anchor in both revisions, so the
receipt's `anchorObserved` claim "sha256 identical to 2026-10-19 Gate fetch" is record-consistent
(I did not re-fetch a 2026-10-19 body; see Limits).

## 2. Decode, quote location, excerpt

Producer's own normalizer (same file at REV, `producerSha256`
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`), probe form that writes
nothing:

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text \
  --body /tmp/fsd-s017-private/body \
  --quote 'New --shuffle command line option schedules tests in a random order'
{"found":true,"offset":3891,"normalizedLength":134434,"window":"… npx playwright test --project = \"*\" # runs all three, for example on CI New --shuffle command line option schedules tests in a random order, which helps to find tests that accidentally depend on each other."}
exit 0
```

- Quote is 11 words; receipt `quoteWords` = 11 (`S017.json:13`); raw HTML contains the sentence
  once, inside `<li><p>` under `<h3 id=-test-runner>🎯 Test runner`, immediately after the opening
  `<h2 id=version-164>Version 1.64`.
- Body support for the *full* teaches is at normalized offsets 4092 (`shuffle seed 271828182`) and
  4123 (`Pass the seed to reproduce the same order. npx playwright test --shuffle 271828182`).
  This matches the receipt `note` (`S017.json:22`).
- Regenerating the producer's excerpt from my body gives byte-identical bytes:
  `same_bytes true`, 1,268 bytes, sha256
  `36197d5a3142f7aa2ae9cd12d2f66338331a3262e62d56136955caa68ddcb586` = `excerptSha256`
  (`S017.json`), = committed `S017.excerpt.txt`.
- Committed artifact digests: `S017.json` = `5561fc07cc275c2e6adc0462c91c08b0314e967ac467681797ed48d459d62981`;
  `S017.excerpt.txt` = `36197d5a…b586`; producer at REV = `f2ba0033…a360`.

Identity/anchor checks on the raw body: `<h1>Release notes</h1>`; the first content heading is
`<h2 … id=version-164>Version 1.64`; the right-hand TOC's first link is `#version-164`; the
`meta name=description` and `og:description` both say `Version 1.64`; the string `Version 1.65`
does not occur. Live release check: `https://registry.npmjs.org/playwright` → `dist-tags.latest`
= `1.64.1` (published `2026-10-14T11:54:49.998Z`), next = `1.65.0-alpha-2026-10-20`; no stable
1.65. The row's `on-release` recheck trigger has not fired. Anchor **held**.

## 3. C1 contract checks (all pass for S017)

Against `corpus/SOURCES.md` at REV and the committed blobs:

- schema `tabi-source-recheck-v1`; row `S017` present, not in the superseded set; one `S017.json`
  and one `S017.excerpt.txt` only.
- `rowUrl` occurs verbatim in the row's `source` cell; receipt `url` is the same URL.
- `sha256` 64-hex; `bytes` integer; `quoteWords` 11 = actual word count ≤ 25.
- `quoteFound=true`; `quoteOffset` 3891 exactly reproduced from my fetch.
- `excerptSha256` matches committed excerpt; `normalize(quote)` occurs in `normalize(excerpt)`.
- `fetchedAt` is `2026-10-20`; `httpStatus` 200.
- `producerSha256` matches the producer blob at REV.
- Counter `node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`
  exit 0 → `{"c1_rows_rechecked":51,"eligible_rows":58,"held":50,"own_work":1,…}`; the receipt
  set is exactly the 51 rows eligible at B (missing none, extra none; 51 excerpts).

**Quote vs teaches.** The 11-word quote alone asserts only "schedules tests in a random order";
it does not itself state seed printing or replay. The seed/replay clause of the row's teaches is
supplied by the same §Test runner sample, which is inside the committed excerpt and the body
(offsets 4092/4123). The receipt says this in `note` (`S017.json:22`); `teachesVerdict=held`
(`S017.json:21`) is therefore correct, but the quote is a **partial witness**, not the whole
witness. The note itself states this limit at
`corpus/knowledge/source-recheck-round-18.md:140` ("quote presence is not claim truth … does not
show that the quote supports it"). No drift, no unreachable, no alternative-rendering fallback
needed because the quote was found at the first rendering.

## 4. Main claim: "live source" vs immutable availability

Counter outputs (read-only, no network):

- At B: `c1_rows_rechecked=0`, `eligible_rows=51`, `row_classes.url={immutable_pinned:14,
  living_live:42, own_work:1}`, statuses 42/8/7.
- At REV: `c1_rows_rechecked=51`, `eligible_rows=58`, `held=50`, `own_work=1`,
  `row_classes.url={immutable_pinned:17, living_live:46, own_work:1}`, statuses 48/8/8.

Applying the counter's own `isPinnedUrl()` rule to the 51 receipt rows: **38 living_live, 12
immutable_pinned** (`S033 S034 S036 S037 S041 S042 S043 S044 S045 S046 S055 S056`), **1 own_work**
(`S029`). So only 38/51 receipts are live-source rechecks in the strict sense; 12 re-fetch an
immutable tag/commit URL and 1 reads a committed git blob. The PLAN headline says "Source rows
re-verified against their live source" for the 51 (`.ufo/waves/round-18/PLAN.md:15-16`), while the
committed note correctly says "live **or pinned** sources" (`corpus/knowledge/source-recheck-round-18.md:7`)
and the lesson says own-work is "explicitly hygiene, not live freshness"
(`corpus/lessons/round-18.md:14`). The counter's own `freshness_scope` says: "round-18 receipt
date 2026-10-20 only; not a reusable freshness due-date gate". So the evidence is not confused;
the **claim shorthand** is overbroad for 13 of 51 rows, and any final SCORECARD sentence that
credits 51 "live-source rechecks" would be false. The correct statement is 51 registry rows
re-bound to source bytes (38 live HTTP, 12 pinned, 1 own-work).

For S017 specifically the claim is true: it is one of the 38 living URLs, fetched live now with
HTTP 200 and a byte-identical body; it is not an immutable-availability check. It remains a
**document** recheck, not a product/runtime observation: no Playwright runner was executed, and
`corpus/knowledge/source-recheck-round-18.md:141` says the receipts "say nothing about how any
product behaves". `corpus/knowledge/source-recheck-round-12.md:58-60` already scopes S017 to the
"stable documentation served when S017's release-notes head was 1.64", not a version-pinned API
guarantee.

## 5. Findings

### F1 — C1 note states a false present-tense row count at REV (minor, documentation)

`corpus/knowledge/source-recheck-round-18.md:11` says:
"**Scope.** `corpus/SOURCES.md` has 57 rows (S001–S057)."
At REV, the registry has **64** rows and the counter reports `eligible_rows: 58`:

```
git show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/SOURCES.md | grep -c '^| S[0-9]'   → 64
git show 2bff864fdfee684ddbcd066cc8e735adaba2735c:corpus/SOURCES.md | grep -c '^| S[0-9]'   → 57
```

The 7 rows opened this round are `S058`–`S064` (S058 rejected, S059–S064 mined; all are documented
in `corpus/lessons/round-18.md`'s "Sources opened this round" table). None has a recheck receipt:
the receipt set is exactly B's 51. The note's Coverage bullet says "a row with no receipt is absent
from the count, and the 6 superseded rows have none by design"
(`corpus/knowledge/source-recheck-round-18.md:149`); it does not name the 7 new rows or say they are
outside the fixed B selection. Repair: qualify line 11 with "at baseline B" and name the seven
new rows (or their count) as outside the B-relative target; the receipt count itself (51) is
unaffected. This is the same "immutable-at-authoring-time scope vs current registry" failure mode
the C3 routed defects target.

### F2 — "51 live-source rechecks" is 38 live + 12 pinned + 1 own-work (minor, claim wording)

Finite counterexamples: `S033` is
`https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/...` (immutable tag) and
`S029` is `git show 837b33a…:corpus/evidence/round-13/aria/receipt.json` (git blob), yet both are
counted in the 51. The committed note gives only the 57-row class totals at B
(`corpus/knowledge/source-recheck-round-18.md:114`: 14 pinned / 42 live / 1 own-work), not the
receipt-subset split 12/38/1, and the counter at REV gives only all-64 totals (17/46/1). A reader
cannot derive the subset split from committed JSON without re-running `isPinnedUrl()`.
Repair: use the note's "live or pinned" wording (`:7`) in the final measurement and state the
38/12/1 split, or cite it as a computed breakdown with the rule. S017 is in the 38.

## 6. Secondary: S029 own-work receipt (because it is the only non-network receipt)

`git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
→ 97,073 bytes, sha256
`b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (receipt `sha256` and `bytes`
match; same digest at B tip and REV). Producer normalizer locates the 17-word quote at offset
74,695 = receipt `quoteOffset` (`S029.json:17`); the excerpt regenerates byte-identically (sha256
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`). The quoted JSON values
support the teaches: `cleanup.server.listeningAfter=true`,
`cleanup.server.perWorker[0].listeningAfter=false`, `refusedAfterClose=true`, `runtime.node=26.12.0`,
`pin.node.recorded=24.21.0`, `minimumMajor=20`. The counter binds this to the pinned git object
(constants `S029_SOURCE_REV/PATH/SHA256`) and separates it as `own_work`. **Held, but it is not a
live freshness recheck** — exactly as the lesson says. No defect.

## 7. Limits

- Only S017 was re-fetched; S029 was read from git. The other 49 receipts were not re-fetched;
  `measure-c1.mjs` was run without `--live` (no 50-URL live sweep). The receipt-set completeness
  and all contract fields were checked from committed bytes.
- The page is dynamic; byte equality is observed for the receipt's 19:05:48Z fetch and my two
  fetches at 20:02–20:05Z, not guaranteed later. Raw-body equality is not used as page identity;
  the note's §6 dynamic-page limit (`corpus/knowledge/source-recheck-round-18.md:143`) applies.
- The quote-alone underdetermines the teaches; the excerpt/body supplies the missing clause. This
  is a witness-strength boundary, not a drift.
- I did not independently re-fetch a 2026-10-19 body; the receipt's "identical to 2026-10-19 Gate
  fetch" is consistent with the B row's recorded digest/date, not a separate 2026-10-19 artifact.
- The npm registry check is a live GET used only to establish `latest=1.64.1`, published
  2026-10-14, with only `1.65.0-alpha` in `next`; it is not a Playwright runtime observation.
- No browser, credentials, session state, real-site tool call, or lane VCS write was used.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS017.md`
