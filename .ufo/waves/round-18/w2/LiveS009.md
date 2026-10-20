VERDICT: ISSUES

# LiveS009 — C1 receipt S009 (+ S029 own-work) falsification

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`,
measured candidate REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. Read-only in LANE (no edits, no jj/git
writes). All probes ran in `/tmp/tabi-r18-lives009-KsChnb` (a private directory, not a clone; removed
after this report). No tools installed or updated.

Inputs read: `corpus/evidence/round-18/source-recheck/S009.json` and `S009.excerpt.txt`;
`corpus/SOURCES.md:23` at REV; `corpus/lessons/kaika-fleet-round-1.md:52`; the C1 note
`corpus/knowledge/source-recheck-round-18.md` (line 11 scope, line 59 S009 row); producer
`.ufo/waves/round-18/recheck-fetch.mjs` at REV; counter `.ufo/waves/round-18/measure-c1.mjs` at REV;
S029 from `git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
(not network). Revision claims below use `git show REV:…`, not the working tree.

## 1. Live re-fetch — identity reproduced exactly

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' -o body \
  -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://www.selenium.dev/documentation/webdriver/bidi/w3c/network/'
HTTP=200 SIZE=108626 URL=https://www.selenium.dev/documentation/webdriver/bidi/w3c/network/
sha256sum body
84a9db7fa1063664af92b6a2b353c5849d81836ddb0ce9a098bdca241b30187d  body
stat -c '%s bytes' body  ->  1274369 bytes
```

`SIZE=108626` is curl's compressed transfer count; the stored/decompressed body is 1,274,369 bytes and its
SHA-256 equals `receipt.sha256` and `receipt.bytes` exactly. The receipt is therefore a genuine live fetch
of the row URL, not a copy of an archived body. `rowUrl` occurs verbatim in the S009 source cell
(`corpus/SOURCES.md:23`), `httpStatus` 200, `fetchedAt` `2026-10-20T19:05:41.195Z` (19:05Z = 16:05 local,
host TZ -03; matches the excerpt file mtime).

Producer normalizer, run from a sandbox copy of the REV blob (`--normalize-only` writes nothing):

```
node recheck-fetch.mjs --normalize-only --decode html-text --body body \
  --quote 'This will be updated when a public API is stabilized.'
{"found":true,"offset":2042,"normalizedLength":164389,"window":"… Selenium v4.32 @pytest…"}
EXIT=0
```

Offset 2042 and the 10-word count match the receipt. The committed excerpt is exactly the producer's
600-before/600-after window of the live body: derived excerpt SHA-256
`7de943cf0ffcde31587df40ace66d94e22af2ae6c542f771d879ff60263a300e`, committed file SHA-256 identical,
byte-equal `true`, 1,254 bytes both. The quote source `corpus/lessons/kaika-fleet-round-1.md:52` is the
S009 row and carries the same body digest `84a9db7f…` — consistent, not a reuse artefact (my independent
fetch reproduces the digest).

## 2. FINDING F1 (ISSUES) — located occurrence is `<head>` metadata, not the anchored section

The quote occurs 17 times in the decoded text:
`offsets [2042, 3372, 11796, 13126, 21550, 22880, 31304, 32634, 46414, 47764, 60647, 74043, 87699,
100771, 113798, 124905, 160088]`. The receipt took the first one. That first one is in `<head>`:

```
raw.indexOf(quote)          = 5119
raw.indexOf('</head>')      = 52681
raw.indexOf('<body')        = 52688      -> quote is inside <head>
raw.indexOf("<meta name=description content='") = 793
first '>' after 793         = 3094       -> inside Java lambda `responseDetails -> network.continueWithAuth(`
next '<' after 3094         = 13005      -> a 9,911-character text run, quote at 5119 inside it
```

The page's `<meta name=description>` embeds the whole rendered article as its `content` attribute. The
producer's decoder strips tags with `/<[^>]+>/g` (`recheck-fetch.mjs:28` at REV; same regex at
`measure-c1.mjs:34`), and the `>` in the lambda arrow terminates that tag early, so the rest of the meta
value leaks into the "text" as loose bytes. The excerpt is that compact, unhighlighted copy (first raw
"View Complete Code View on GitHub /examples/python/tests/bidi/test_network_commands.py" at 1108, also
inside the meta).

The quote does exist in the visible article and at the anchored section:

```
<h3 id=add-network-intercept>   raw 122359, normalized 41887
next section "Remove network intercept"  normalized 54731
quote occurrence in article     normalized 46414 (exact match, token-spaced rendering)
"Last modified July 23, 2026"   raw 1265906 (body footer, after <body 52688)
"Selenium v4.32"                present 10x
```

Impact and finite bound: `quoteFound=true` is correct and the receipt is admissible under the C1 contract
(quote ∈ excerpt, excerpt sha, digests). But `quoteOffset`/excerpt are evidence of a `<head>` SEO copy,
not of "§Add network intercept" that the row's anchor cell names and that the receipt's `anchorObserved`
asserts as present. The counter cannot detect this: it checks only `normalize(quote) ∈ normalize(excerpt)`
(`measure-c1.mjs:243`) and never `quoteOffset` against a body region. The note's §6 limits list does not
name the `>`-inside-attribute tag-splitting behaviour. This is a precision/evidence-quality defect, not a
false quote, and it must not be repaired by replacing the receipt — the quote is genuinely at the anchor
(offset 46414) and in the fetched bytes.

Recommendation for main: strip `<head>…</head>` before the quote search (or select the occurrence after
`<body`), and add the tag-splitting limit to note §6. Same class may affect other early-offset receipts
(lowest observed ratios: S005 876/4,235,856; S057 394/695,881; S020 586/511,987; S009 2,042/1,274,369;
S017 3,891/1,002,533), but only S009 was proven here.

## 3. Does the quote support `teaches`, and is freshness conflated with product currency?

`teaches` (SOURCES.md:23): "The Python intercept API is marked provisional, so 'BiDi supported' must be
scoped per binding, release and command." Quote plus its two adjacent context lines
(`# _add_intercept is currently the available Python API …`, tab label `Selenium v4.32`):

- binding scope — directly supported (`_add_intercept`, Python-only private API, "will be updated when a
  public API is stabilized");
- release scope — supported by the example's `Selenium v4.32` label in the same excerpt, not by the
  quoted sentence alone;
- command scope — the page is the add-intercept command page; the quote itself says "a public API" in
  general. This third scope is the row's methodological extension, sound but not sentence-backed.

`held` is defensible. `corpus/knowledge/webdriver-bidi-capability-matrix.md:51,72` uses S009 exactly at
that strength ("binding-specific documentation statement, not a spec-wide support claim"). The note's
own §6 already states that quote presence is not claim truth.

Freshness vs immutable availability: this S009 receipt is a live re-fetch whose live body is
byte-identical, so on this path there is no confusion of an archived copy with a live source. The
product-currency confusion is also expressly blocked: lesson Gate "C1 counts … not overdue rows or
current product support" (`corpus/lessons/round-18.md`), note §6 "Source-only; no runtime … the 51 rows
are not a statement of current live product support", and `measure-c1.mjs:471`
`freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"`. The
S009 `teaches` is a scoping rule, which survives product change; no overclaim observed. Residual risk is
the excerpt's misleading location (F1), not the freshness wording.

## 4. FINDING F2 (ISSUES) — C1 note's registry count is false at REV

`corpus/knowledge/source-recheck-round-18.md:11` says "`corpus/SOURCES.md` has 57 rows (S001–S057)".
At REV:

```
git show REV:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3,} '   ->  64   (57 at B)
new rows: S058, S059, S060, S061, S062, S063, S064
```

The note's per-receipt counts are otherwise exact: 102 files = 51 `.json` + 51 `.excerpt.txt`; status of
receipt rows 40 mined / 6 queued / 5 rejected; tier 42 A / 4 B / 5 C — all match note §2. The C1 claim's
own target ("51 = every row not superseded at B") is met. The defect is the unqualified total, plus the
counter's REV denominator: `c1_rows_rechecked=51` with `eligible_rows=58` (64 − 6 superseded), because
`eligibleRows` is computed over the REV registry (`measure-c1.mjs:465`). Anyone reading only the counter
at REV sees 51/58 while the claim says 51/51. Fix the sentence to say "at baseline B" (and/or record the
REV state), not the counter.

## 5. FINDING F3 (minor) — S029 quote covers one of two `teaches` clauses

`git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`:
97,073 bytes, SHA-256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (matches receipt);
producer `--normalize-only --decode none` → `found=true, offset 74695, normalizedLength 76376`, EXIT 0.
Values in the pinned blob: `cleanup.server.listeningAfter=true`, `perWorker[0].listeningAfter=false`
(quote shows both, 17 whitespace tokens), `runtime.node="26.12.0"`, `pin.node={"recorded":"24.21.0",
"minimumMajor":20}`.

The quote evidences the listeningAfter clause only. The committed excerpt (1,382 bytes) contains neither
`26.12.0` nor `24.21.0` (checked: false/false), so the second clause ("observed Node26.12.0 differs from
descriptive recorded24.21.0") is asserted in `note`/`anchorObserved`, not in the quoted evidence, while
the row anchor names `runtime.node` and `pin.node`. The assertion itself is true of the pinned blob, and
S029 is own-work hygiene, not live freshness (lesson Gate). Single-quote coverage gap, no false statement.

## 6. FINDING F4 (minor) — `receipt.command` is not shell-replayable

```
bash cmd.sh          # cmd.sh = receipt.command verbatim
BASH_EXIT=2
cmd.sh: line 1: syntax error near unexpected token `('
cmd.sh: line 1: `curl … -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body …'
```

The producer renders argv with an unquoted user agent and a `<tmp>/body` placeholder
(`recheck-fetch.mjs` command assembly); the actual fetch uses `spawnSync` with one UA element, and the
counter compares to the same canonical string (`expectedCurlCommand`), so neither receipt validity nor
the counter is affected. It is a reproducibility/display defect. Quote the UA (producer and counter
together) if the field is to be replayed.

## 7. Counter and coverage checks (observed)

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004 --lane LANE
-> c1_rows_rechecked=51  eligible_rows=58  held=50  drift_superseded=0  own_work=1  rejected=[]  EXIT=0
node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c --lane LANE
-> c1_rows_rechecked=0   eligible_rows=51                                          EXIT=0
sha256 of REV `.ufo/waves/round-18/recheck-fetch.mjs` = f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360 (= every receipt's producerSha256)
```

Red-before at B (0/51) and green count at REV (51) hold; S009 is not in the superseded set. So the C1
claim's count is reproducible — the ISSUES above are the receipt's location evidence (F1) and the note's
denominator wording (F2), not a lost receipt.

## 8. Finite limits

- One live fetch (HTTP 200, 1,274,369 B) at ~2026-10-20T20:05Z; a 200 can later change. This page is
  byte-stable across the round-1 lesson fetch (2026-10-19), the receipt (2026-10-20T19:05Z) and mine.
- `quoteOffset` is a normalized character offset, not a byte offset; the receipt does not record
  `normalizedLength`.
- I did not run `measure-c1 --live` (it would re-fetch all 50 HTTP receipts); only S009 was re-fetched.
- I did not run the producer to write receipts; only `--normalize-only` in `/tmp`.
- Nothing here tests Selenium runtime behaviour; the receipt says only what the cited docs contain.
- No alternative raw endpoint was needed: the quote was present in the live body; the same identity also
  carries it in the article at normalized 46414.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS009.md`
