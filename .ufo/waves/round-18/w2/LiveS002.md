VERDICT: PASS

# LiveS002 — C1 receipt attack: S002 (CDP support posture / `/json/*`)

Lane `TabiR18.LiveS002-2`, 2026-10-20. Read-only attack on the round-18 C1 receipt
`corpus/evidence/round-18/source-recheck/S002.json` at REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (measured candidate; lane tip observed
`530f40a`). No production file, Git index, jj state, or fleet file was written. Every
network probe was a GET into `/tmp/tabi-r18-lives002`. No tool was installed.

## 1. What was attacked

- Claim C1 (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/PLAN.md:15-21,69-81`):
  source rows re-verified against their live source, receipt-counted; `--live` is a
  separate report and does not change the count.
- Registry row `corpus/SOURCES.md:16` (S002, docs/A, opened 2026-10-19, recheck 90d) and
  the same row at baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c` (byte-identical: no
  supersession; S002 is not in the six-row superseded set).
- Receipt `corpus/evidence/round-18/source-recheck/S002.json:5-24` and excerpt
  `corpus/evidence/round-18/source-recheck/S002.excerpt.txt`.
- Original quote source `corpus/lessons/kaika-fleet-round-1.md:45` (round-1 S002 row).
- Recheck record `corpus/knowledge/source-recheck-round-18.md:2,7,11,25,27,53`.
- Counter `node .ufo/waves/round-18/measure-c1.mjs REV` and its non-S029 validation path
  (`.ufo/waves/round-18/measure-c1.mjs:329-374,380-430`).

## 2. Independent fetch (receipt.url re-fetched)

Workdir `/tmp/tabi-r18-lives002`. Exact argv, same shape as the receipt's recorded
`command` (`S002.json:7`):

```
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -o body -w '%{http_code}\n' 'https://chromedevtools.github.io/devtools-protocol/'
```

Observed: `200`, exit 0. `wc -c < body` = `35462`.
Full digest: `sha256 ba8018bb02f360686cbff23304da8b6e21923a2e012ade273e3f9a2ce1e2fd64`.

Second fetch with response headers and effective URL:

```
curl -sSL --compressed --max-time 90 -A "<same UA>" -D headers.txt -o body2 \
  -w 'code=%{http_code} effective=%{url_effective} redirects=%{num_redirects} size=%{size_download}\n' \
  'https://chromedevtools.github.io/devtools-protocol/'
```

Observed: `code=200 effective=https://chromedevtools.github.io/devtools-protocol/ redirects=0 size=8887`
(`size_download` is the gzip wire size; the decoded body is 35462 B). `body2` digest
identical: `ba8018bb…e2fd64`. Headers:
`content-type: text/html; charset=utf-8`, `content-encoding: gzip`,
`last-modified: Mon, 19 Oct 2026 04:39:57 GMT`, `etag: W/"6ad59f1d-8a86"`,
`cache-control: max-age=600`, server `date: Tue, 20 Oct 2026 20:03:05 GMT`.

Third fetch with identity encoding (no `--compressed`): `code=200 size=35462`, digest
`ba8018bb…e2fd64`. Five independent observations therefore agree on one body: the round-1
seat fetch recorded at `corpus/lessons/kaika-fleet-round-1.md:45`
(`ba8018bb02f360686cbff23304da8b6e21923a2e012ade273e3f9a2ce1e2fd64`), the receipt
(`S002.json:10`, fetched 2026-10-20T19:05:36.085Z), and my three fetches at ~20:00-20:05Z.

Decode per `receipt.decode` = `html-text`, using the producer's decoder and normalizer
(`.ufo/waves/round-18/recheck-fetch.mjs:21-46,48-55`):
normalized length `14677`; quote located at normalized offset `760`; quote word count `17`.
Recomputed excerpt (`quote` ± 600 chars, plus trailing `\n`):
`sha256 e890020b3eadb74a78ca5107477286b2d9c0c29cc112d7586a268d5aebacf710`, exactly the
receipt's `excerptSha256` (`S002.json:19`) and the committed excerpt file's digest.
Quote in raw HTML is split by a line break between "guarantee" and "backwards"
(raw offset 4120), so raw-body substring search without the html-text decode returns 0 hits;
the decoded/normalized form is contiguous at offset 760. That is the documented normalizer,
not a divergence.

## 3. Receipt field audit (observed vs receipt)

| Field (`S002.json` line) | Receipt | Independently observed | Verdict |
|---|---|---|---|
| `url`:5 | `https://chromedevtools.github.io/devtools-protocol/` | same, HTTP 200, 0 redirects | match |
| `fetchedAt`:6 | `2026-10-20T19:05:36.085Z` | UTC day 2026-10-20; my fetch 20:03-20:05Z | match |
| `command`:7 | canonical curl | byte-for-byte equals `expectedCurlCommand` construction (`measure-c1.mjs:233-237`) | match |
| `httpStatus`:8 | `200` | `200` | match |
| `bytes`:9 | `35462` | `35462` decompressed (and identity fetch) | match |
| `sha256`:10 | `ba8018bb…e2fd64` | same full 64-hex | match |
| `quote`:13 | 17-word sentence | present at normalized 760 | match |
| `quoteWords`:14 | `17` | 17 by split | match |
| `quoteSource`:15 | `corpus/lessons/kaika-fleet-round-1.md:45` | line 45 is the S002 row with the identical quote and the same body hash | match |
| `quoteFound`:16 / `quoteOffset`:17 | `true` / `760` | `true` / `760` | match |
| `excerpt`:18 / `excerptSha256`:19 | `S002.excerpt.txt` / `e890020b…` | file exists, 1299 B, digest matches recomputed window | match |
| `anchorObserved`:20 | no in-body date; sections present | body text has 0 `YYYY-MM-DD` matches; `<h3 id="scope-and-support">Scope and support` (raw 3890) and `<h3 id="endpoints">HTTP endpoints` (raw 16390) both present | match |
| `teachesVerdict`:21 | `held` | see §4 | held |
| `producerSha256`:24 | `f2ba0033…eaa360` | `git show REV:.ufo/waves/round-18/recheck-fetch.mjs` hashes to the same | match |

Receipt JSON blob at REV equals the worktree file:
`07e8d481e9d86e971684373b19aee19d5d991e2b08156f4d1662a1ac744ab2d8` (both).
`git ls-tree` at REV: 102 files in the receipt dir = 51 `.json` + 51 `.excerpt.txt`.

## 4. Does the quote support the registry teaches?

Registry teaches (`corpus/SOURCES.md:16`): "CDP is unsupported for third parties with no
backward-compatibility promise, so every recorded protocol shape is build-scoped;
`/json/new` now requires PUT". Clause-by-clause against the fetched body:

1. **Unsupported for third parties.** Quote: "CDP is not a public or supported API for
   Chrome…". Same paragraph continues, raw offset 4377: "Direct use of CDP by third-party
   applications is unsupported. We only support official Chrome products built on CDP: …".
   The receipt's ±600-char excerpt includes this third-party sentence (verified by
   `grep -c` = 1). Held.
2. **No backward-compatibility promise.** Quote itself: "…and it does not guarantee
   backwards compatibility." Held.
3. **Build-scoped shapes.** Raw offset 4223: "Syntax and semantics may change without
   notice based on Chromium's requirements and Chrome's product needs." The page is the
   tip-of-tree viewer (version selector "Tip-of-Tree (latest)" raw 2781; "…(tip-of-tree)
   protocol. Tracks the [Chromium HEAD log]" raw 5472). Held.
4. **`/json/new` requires PUT.** §HTTP endpoints, raw offset 23592: "Method requirement:
   This endpoint strictly requires the PUT method. Calling it with GET, POST, or any other
   verb fails with 405 Method Not Allowed." Table at raw 17658 gives `/json/new?{url}` →
   `PUT`, "strictly requires PUT". Held.

So the receipt's `teachesVerdict: held` is true of the live source, not just of its own
quote. The receipt `note` (`S002.json:22`) is accurate on both clauses.

**Finite artifact gap (non-blocking):** clause 4 is *not* inside the excerpt window. The
excerpt is normalized chars 160-1458 (1298 chars + trailing newline); `/json/new` is at normalized
offset 7284, and `grep -c 'json/new' S002.excerpt.txt` = 0. The receipt therefore binds
clauses 1-3 to committed excerpt bytes, and clause 4 only to the free-text `note` plus the
body digest. Under the PLAN contract (`PLAN.md:69-76`: quote in excerpt + `teachesVerdict`)
this passes; it would fail only under a stricter rule "the excerpt must prove every teaches
clause". If that stronger rule is intended, S002 is one finite counterexample; the source
itself still teaches clause 4, so this is an evidence-scope gap, not a false receipt.
I did not replace or regenerate evidence.

## 5. Immutable availability vs live product freshness

For S002 there is no conflation:

- The receipt is a live HTTP 200 fetch, not a read of a cached/committed copy. The
  `--body` branch of the producer would have recorded `httpStatus: null`
  (`recheck-fetch.mjs:88-111`); S002 records `200`, so it took the curl branch.
- The living page served the same 35462 bytes to me ~1 h after the receipt, and the
  response `last-modified: Mon, 19 Oct 2026 04:39:57 GMT` plus identical round-1 hash show
  the content had not changed since the row was opened.
- The declared claim does not assert current product support. `corpus/lessons/round-18.md:12`
  says "C1 counts round-specific integrity-checked recheck receipts, not overdue rows or
  current product support"; the counter emits
  `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable freshness
  due-date gate"`. The knowledge note (`corpus/knowledge/source-recheck-round-18.md:7`)
  says it records quote presence "in the bytes fetched on 2026-10-20" and "does not make
  any knowledge entry true". So the main claim's "re-verified against their live source"
  means at `fetchedAt`; it is not a claim that the Chrome product still behaves the same.
- Residual limit: `c1_rows_rechecked` without `--live` counts committed author-side
  receipts (`measure-c1.mjs:437-491`); `--live` would only add a separate `live_held`
  report. For S002 I closed that gap by re-fetching; the count itself does not prove a
  live fetch for any row.

## 6. Counter run at REV

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```
Exit 0, one JSON line:
`c1_rows_rechecked: 51`, `eligible_rows: 58`, `held: 50`, `drift_superseded: 0`,
`own_work: 1`, `rejected: []`,
`counterSha256: df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`.
S002 is among the accepted receipts (no rejections). `eligible_rows` is 58 at REV because
the seven new rows S058-S064 exist by then; the claim target is 51 = rows not superseded
at B, and 51 receipts were accepted.

**Counter boundary (non-blocking, affects C1 generally, not S002's truth):** in the
committed path the counter checks `sha256` only as 64-hex (`measure-c1.mjs:330`) and never
compares `bytes`/`sha256`/`quoteOffset` to a fetched body for non-S029 (`bytes`,
`quoteOffset` are used only in the S029 branch, lines 347-350,374). A receipt with a
correct excerpt and quote but an arbitrary 64-hex `sha256`/`bytes` would be accepted at
REV; `--live` (lines 380-430) checks only quote presence, not digest equality. S002 is
verified true by §2, so this does not falsify this receipt, but `c1_rows_rechecked` is not
by itself proof that each recorded body digest belongs to a real fetch.

## 7. S029 own-work secondary check (`git show`, no network)

```
git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json
```
97073 B, `sha256 b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` —
matches `S029.json` `sha256`/`bytes`. Re-derived quote offset `74695` matches
`quoteOffset`; re-derived excerpt digest
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` matches
`excerptSha256`. `quoteSource` is the literal string `"new"`, not a path:line; the counter
does not validate that field, so it is a cosmetic provenance gap only.

## 8. Finite limits

- Quote/source identity, anchor sections, and all four teaches clauses held; the receipt is
  byte-reproducible on this static-served living page. No drift, no unreachable case, so no
  alternative rendering/raw endpoint was needed or substituted.
- The excerpt does not cover the `/json/new` clause (§4) and the counter cannot check the
  note that carries it; this is the only artifact-scope gap found.
- Live freshness is a snapshot; a later change to the page would not retroactively
  invalidate the receipt's `fetchedAt` claim, but it would make the row stale. That is
  disclosed, not hidden, by the counter's `freshness_scope` and the knowledge note.
- No finding here licenses editing the receipt, the excerpt, the producer, or any lane file.

## 9. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS002.md` (this report)
- Sandbox only (not evidence): `/tmp/tabi-r18-lives002/body`, `body2`, `body3`, `headers.txt`,
  `excerpt_recomputed.txt`, `s029.json`.
