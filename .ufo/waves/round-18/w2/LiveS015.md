VERDICT: PASS

# LiveS015 — C1 receipt S015 falsification (round 18, wave 2)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`;
measured candidate REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (verified via
`git rev-parse --verify 530f40a9…^{commit}` → `530f40a9bc3f10436161a2af1ca0fe9bffffc004`).
Attack surface: C1 freshness, one docs row (S015), receipt authenticity + live source identity/anchor/teaches,
plus the S029 own-work path by `git show` (no network). No production edit, no git write in LANE.

## 1. Inputs read

| Input | Path at REV |
|---|---|
| receipt | `corpus/evidence/round-18/source-recheck/S015.json` (REV blob sha `615401ef4d73bac9c10e2011741e72833371b9d5debf844c0a889aebec4b354f`, identical to worktree) |
| excerpt | `corpus/evidence/round-18/source-recheck/S015.excerpt.txt` (REV sha `7e3087d046e63e90eb3496b6dec4874c43924072fb7051a8b8f7a9a6738f6245`, 1297 B) |
| row | `corpus/SOURCES.md:29` at REV |
| quote source | `corpus/lessons/kaika-fleet-round-1.md:58` (exact quote; lesson says `sha256 31075410…fe8d`) |
| round note | `corpus/knowledge/source-recheck-round-18.md` (REV sha `f66801cb16ef9ef2c353fb02158bd11bdd052703723db1bb1383191643e13540`; byte-identical to `.ufo/waves/round-18/drafts/source-recheck-round-18.md`) |
| producer | `.ufo/waves/round-18/recheck-fetch.mjs` (REV and worktree sha `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`) |
| contract | `.ufo/waves/round-18/PLAN.md:15-17,65-77`; `corpus/lessons/round-18.md:12-14`; `corpus/QUALITY.md` not needed for this row |
| consumer | `corpus/knowledge/web-flake-retry-evidence.md:76-80` |

Row cell at REV (`corpus/SOURCES.md:29`) is unchanged B→REV (`git diff B REV -- corpus/SOURCES.md | grep S015`
→ no S015 diff); the recheck is evidence-directory-only, which the PLAN permits.

## 2. Independent live fetch

Private sandbox `/tmp/tabi-r18-lives015-3092`, deleted after this report. Exact command:

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -D headers -o body -w 'http=%{http_code} bytes=%{size_download} url=%{url_effective}\n' \
  'https://playwright.dev/docs/actionability'
```

Observed (exit 0): `http=200 bytes=8533 url=https://playwright.dev/docs/actionability`.
Second identical GET to `body2`; `cmp -s body body2` → identical.
On-disk decoded body: `47845` bytes, `sha256 = 31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d`
— byte-for-byte the receipt's `sha256` (line 10) and the 2026-10-19 seat sha at
`corpus/lessons/kaika-fleet-round-1.md:58`.

Response headers (`headers` file, same GET):

```
HTTP/2 200
server: GitHub.com
last-modified: Tue, 20 Oct 2026 16:46:38 GMT
etag: W/"6ad79aee-bae5"
content-encoding: gzip
content-length: 8533
cache-control: max-age=600
date: Tue, 20 Oct 2026 20:02:53 GMT
age: 50
x-cache: HIT
expires: Tue, 20 Oct 2026 19:15:39 GMT
```

`content-length` 8533 is the gzip wire size; the receipt's `bytes` 47845 is the decoded file size, which is
what the producer records (`bytes = readFileSync(body).length`). `expires` is exactly
`2026-10-20T19:05:39Z` + 600 s, i.e. the receipt's `fetchedAt` (`19:05:39.645Z`) + `max-age=600`; this
corroborates that the receipt's fetch is a real served response, not a fabricated digest [INFERENCE from
the cache-header arithmetic; the body is independently reproduced]. The 20:02:53 GET was a CDN cache HIT,
so it proves the served identity and bytes, not origin-internal state.

Decode used my own `/tmp/tabi-r18-lives015-decode.mjs`, a line-for-line replica of
`recheck-fetch.mjs` `decodeBody(...,'html-text')` + `normalize()`. Fidelity is demonstrated, not assumed:
the replica's ±600-char excerpt candidate hashes to `7e3087d046e63e90eb3496b6dec4874c43924072fb7051a8b8f7a9a6738f6245`,
exactly the committed excerpt and receipt field 19.

- Normalized text: 6232 chars; quote index **1230**, occurrence count **1** — exactly receipt `quoteOffset` 1230.
- Raw HTML: quote index **26885**, one occurrence, inside `<p>` under
  `<h2 … id=…>Introduction … Direct link to Introduction</h2>`, between
  "Playwright performs a range of actionability checks on the elements before making actions to ensure these
  actions behave as expected." and "If the required checks do not pass within the given `<code>timeout</code>`,
  action fails with the `<code>TimeoutError</code>`." — visible §Introduction prose, not metadata, not script
  (the decoder strips `<script>`/`<style>` and the quote survives).

## 3. Receipt fields vs observation

| # | Field | Receipt value | Observed now | Verdict |
|---|---|---|---|---|
| 2 | schema | `tabi-source-recheck-v1` | same | match |
| 3 | row | `S015` | `S015` row exists at `SOURCES.md:29` | match |
| 4 | rowUrl | `https://playwright.dev/docs/actionability` | occurs verbatim in row `source` cell `SOURCES.md:29` | match |
| 5 | url | same URL | effective URL same, no redirect | match |
| 6 | fetchedAt | `2026-10-20T19:05:39.645Z` | 2026-10-20; independent fetch 20:02:53Z | match (same day) |
| 7 | command | canonical curl argv | counter accepted; my rerun with same flags/UA reproduces bytes | match |
| 8 | httpStatus | 200 | 200 | match |
| 9 | bytes | 47845 | 47845 decoded (8533 gzip wire) | match |
| 10 | sha256 | `31075410…fe8d` | `31075410…fe8d` | match |
| 11 | decode | `html-text` | HTML page; replica reproduces excerpt | match |
| 12 | normalizer | NFC/quotes/dashes/whitespace | replica reproduces excerpt sha exactly | match |
| 13 | quote | 16-word §Introduction sentence | present once, index 1230 | match |
| 14 | quoteWords | 16 | 16 whitespace tokens | match |
| 15 | quoteSource | `corpus/lessons/kaika-fleet-round-1.md:58` | line 58 carries the exact quote | match |
| 16 | quoteFound | true | true | match |
| 17 | quoteOffset | 1230 | 1230 | match |
| 18 | excerpt | `S015.excerpt.txt` | exists at REV | match |
| 19 | excerptSha256 | `7e3087d0…f6245` | excerpt bytes hash to same | match |
| 20 | anchorObserved | `docsearch:version=stable, no date marker; body sha256 identical to … kaika …:58` | stable meta present; no body date marker; sha identical | held (see O1) |
| 21 | teachesVerdict | `held` | page-level held; quote-alone partial (F1) | held |
| 22 | note | pre-action gate + TimeoutError inference | page text confirms both | held |
| 23 | seat | `Recheck07` | not independently attributable beyond receipt | not verifiable, not claimed |
| 24 | producerSha256 | `f2ba0033…aa360` | REV blob and worktree both `f2ba0033…aa360` | match |

Counter accepts S015 and counts it: `node .ufo/waves/round-18/measure-c1.mjs 530f40a9…` →
`c1_rows_rechecked:51, eligible_rows:58, held:50, drift_superseded:0, own_work:1, rejected:[], live:null`, exit 0.
Baseline: `node .ufo/waves/round-18/measure-c1.mjs 2bff864…` → `c1_rows_rechecked:0, eligible_rows:51,
held:0, own_work:0, live:null`, exit 0. Evidence dir at REV is exactly 102 files = 51 `.json` + 51 `.excerpt.txt`.

## 4. Source identity and anchor

- Identity: `https://playwright.dev/docs/actionability` served HTTP 200 from GitHub Pages/Fastly; no redirect;
  stable-docs marker present.
- Anchor: raw body contains `<meta data-rh=true name=docsearch:version content=stable />`; body has no
  "Last updated"/date marker. The row's anchor cell (`SOURCES.md:29`) says
  "stable docs served 2026-10-19, §Introduction"; the body sha equals that 2026-10-19 fetch sha, so the
  anchor held across the recheck.
- O1 (precision, not failure): receipt field 20's literal `docsearch:version=stable` is a compressed
  rendering; the byte sequence `docsearch:version=stable` does not occur in the body (`rawContains=false`).
  The served form is `name=docsearch:version content=stable`. Semantically the anchor held; literally the
  field is a paraphrase. This field is free text, not counter-checked.

## 5. Does the quote actually support `teaches`?

Row `teaches` (`corpus/SOURCES.md:29`): "Actionability checks gate the action, not the test's post-action
state predicate; the two waits are distinct evidence".

- The 16-word quote proves the first clause's positive half: checks pass, **then** the action is performed.
  Token check: the quote contains none of `test`, `post-action`, `state predicate`, `assertion`.
- The same page supplies the contrast at normalized offset **2763** (§Assertions):
  "Playwright includes auto-retrying assertions that remove flakiness by waiting until the condition is met,
  similarly to auto-waiting before actions." That is the separate test-level wait the row calls "the two
  waits"; the page's `expect(locator).toBe*` table follows at 2933+.
- Receipt note (line 22) says the gate is on the action, "not a post-action state predicate". That is the
  correct bounded reading: actionability is pre-action and does not establish the application's post-action
  state. The consuming note uses exactly that form (`web-flake-retry-evidence.md:76-80`):
  "actions wait for their applicable checks; that does not prove the application's post-action state
  predicate held."
- F1 (scope finding, not a falsification): the quoted span alone supports only the pre-action gate; the
  second clause is supported by unquoted text on the same page (offset 2763) and by S016. `held` is
  defensible at page level; it would be wrong to claim the 16-word quote alone proves the full cell.
  The round's own note states this limit (`source-recheck-round-18.md:140`): "It does not show that the
  row's `teaches` claim is correct, that the quote supports it…". No contradiction was found.

## 6. Main claim — immutable receipt vs live product freshness

The C1 wording (`PLAN.md:15-17`) is "Source rows re-verified against their live source with a committed
recheck receipt"; `PLAN.md:76-77` says `--live` re-fetches and "does not change the count". The counter's own
output (`measure-c1.mjs:471-472`) labels the measure: `freshness_scope` = "round-18 receipt date 2026-10-20
only; not a reusable freshness due-date gate". The lesson (`corpus/lessons/round-18.md:12-14`) says C1 counts
"integrity-checked recheck receipts, not overdue rows or current product support", and the note
(`source-recheck-round-18.md:141`) says the 51 rows "are not a statement of current live product support".

Was the conflation instantiated for S015? No. The receipt's attestation is independently true: the body is
byte-identical and the quote is at the recorded offset on a fresh 2026-10-20 fetch. Was the claim overbroad?
Not in its landed words: it claims same-day re-opens with committed receipts, and explicitly disclaims
product support and reusable freshness. The correct reading of `c1_rows_rechecked:51` is "51 same-day
attested re-opens", not "51 sources live or product-current at measurement".

O3 (measure limit): without `--live`, acceptance is attestation + URL provenance, not a fresh fetch. In
`measure-c1.mjs`, `sha256` is only checked as 64-hex (`:330`), the excerpt is checked against its own
committed hash (`:368`), and the quote against that excerpt (`:369`); no body is stored or re-derived for
HTTP rows. So the counter cannot, by itself, distinguish a genuine fetch from a fabricated but
self-consistent receipt. S015 is one row where an independent live fetch closes that gap; the pass here
does not extend the proof to the other 50 rows, which I did not re-fetch.

## 7. S029 own-work cross-check (git, no network)

`corpus/evidence/round-18/source-recheck/S029.json`: row/url `corpus/evidence/round-13/aria/receipt.json`,
`httpStatus:null`, bytes 97073, sha `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`.
At pinned commit `837b33a3988ebeea7f6b4ef5c04698da88909a73`, `git show` blob is 97073 B with the same sha
(also identical at lane tip B). Recomputing the producer's normalized quote index from that blob gives
**74695**, exactly receipt `quoteOffset`; the derived excerpt hashes to
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`, exactly the committed excerpt.
Own-work is excluded from the held count by the counter (`measure-c1.mjs:467`, `kind !== 'own-work'`), as the
lesson requires. Held.

## 8. Findings

- **F1** (scope, not failure): quote-alone supports clause 1 of `teaches`; clause 2 rests on the same page's
  §Assertions at normalized 2763 (and S016). Page-level `held` is defensible; the receipt's own note §6
  disclaims quote-to-teaches proof. Path: `corpus/SOURCES.md:29`, `S015.json:22`,
  `source-recheck-round-18.md:140`.
- **O1** (precision): anchor literal `docsearch:version=stable` absent; served
  `<meta data-rh=true name=docsearch:version content=stable />` present. Held semantically.
- **O2** (unit): `bytes:47845` is the decoded body; wire `content-length` is 8533 gzip. Consistent with the
  producer's file-size semantics, not a mismatch.
- **O3** (measure limit): `measure-c1` without `--live` cannot observe the live source; acceptance is
  attestation + URL provenance + self-consistent excerpt. S015 independently closed; the other 50 rows were
  not re-fetched by this seat.
- **O4** (wording risk, low): `source-recheck-round-18.md:11` says `corpus/SOURCES.md` "has 57 rows" while the
  file at REV has 64 rows (`S058`–`S064` opened this round). The paragraph is baseline-scoped ("superseded
  at baseline B"; source line `:1` names S001–S057), so it is a present-tense wording risk, not a false
  baseline count. No counter depends on it.
- **O5** (cache boundary): the 20:02:53 fetch was a Fastly `x-cache: HIT`; `expires` = receipt `fetchedAt`
  + 600 s. It proves the served identity/bytes, not origin-internal state.
- **No falsified field**: no quote absence, no drift, no unreachable, no wrong source URL, no producer or
  excerpt digest mismatch, no teaches contradiction.

## 9. Finite limits

One URL, one live fetch at `2026-10-20T20:02:53Z`, one host/time; no full 51-row `--live` run; no browser or
product runtime was exercised; no production file, fleet file, jj state, or Git index was written. The
teaches judgment is semantic, page-level, and bounded by the quoted span. Sandbox `/tmp/tabi-r18-lives015-3092`
and its path marker were deleted after the report; reproducibility rests on the command, digests, and offsets
above. No tool install/update was performed.

## 10. Commands and exits

| Command | Observed |
|---|---|
| `curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' -D headers -o body -w ... URL` | `http=200 bytes=8533`, exit 0; sha `31075410…fe8d`, 47845 B |
| identical second GET → `body2`; `cmp -s body body2` | identical, exit 0 |
| `node /tmp/tabi-r18-lives015-decode.mjs body '<quote>'` | `index=1230`, count 1, excerpt candidate sha `7e3087d0…f6245` |
| `sha256sum corpus/evidence/round-18/source-recheck/S015.excerpt.txt` | `7e3087d0…f6245`, exit 0 |
| `git show 530f40a9…:corpus/evidence/round-18/source-recheck/S015.json \| sha256sum` | `615401ef…b354f`, exit 0 |
| `git show 530f40a9…:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` | `f2ba0033…aa360`, exit 0 |
| `node .ufo/waves/round-18/measure-c1.mjs 2bff864…` | `c1_rows_rechecked:0`, exit 0 |
| `node .ufo/waves/round-18/measure-c1.mjs 530f40a9…` | `c1_rows_rechecked:51`, exit 0 |
| `git show 837b33a…:corpus/evidence/round-13/aria/receipt.json \| sha256sum` | `b458b351…989b7`, 97073 B, exit 0 |
| S029 offset/excerpt recomputation | `index 74695`, excerpt sha `80b5de21…3796ff`, exit 0 |

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS015.md`
