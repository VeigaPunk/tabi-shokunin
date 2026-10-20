VERDICT: ISSUES

# C1 receipt S033 — independent re-verify, and the C1 measure boundary

Date 2026-10-20. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; measured candidate
REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git rev-parse --verify refs/heads/master` → same
at probe time). Read-only in LANE: `git status --porcelain -- corpus/evidence/round-18/source-recheck
corpus/SOURCES.md corpus/knowledge/source-recheck-round-18.md` → empty, exit 0. All writing probes
ran in a private clone `/tmp/tabi-r18-s033` (`git clone --no-hardlinks LANE /tmp/tabi-r18-s033`) and
`/tmp/s033-r18`; both removed after the digests below were recorded.

## 0. Bottom line

- **Receipt S033 itself is genuine.** Independent re-fetch reproduces the served body byte-for-byte
  (sha256 `9c0d58…cf373`, 520 B), decodes to the receipt's anchor digest (`50dd33…f906364`), and the
  decoded blob hashes to the Gitiles tree entry at tag `154.0.8037.97` (`c95451…0d48c`); tag→commit
  is `b510e9d7…6c5f78d`. Quote found at line 11 / normalized offset 303; excerpt is the producer's
  normalized body plus newline (380 B, sha `d95ce1…ba12d1`); producer digest matches REV. **Held, not
  drifted, not unreachable.**
- **The C1 claim has issues at measure scope.** (1) 12 of the 51 receipted rows are immutable-pinned
  and 1 is own-work, so 13/51 cannot exhibit source drift; only 38/51 are living sources. S033 is one
  of the 12. (2) `measure-c1.mjs` admits a *forged/synthetic* HTTP receipt because it never re-derives
  an HTTP excerpt from a body — demonstrated in the sandbox, including a receipt whose quote
  contradicts the row's `teaches`. (3) The committed note's present-tense "57 rows" is false at REV
  (64 rows), and the counter's REV denominator is 58 while the note only records the B run (51/0).
  (4) The receipt's `command` string is not shell-replayable (unquoted UA; bash exit 2).

## 1. Inputs read

| Input | Path:line at REV | Observation |
|---|---|---|
| Receipt | `corpus/evidence/round-18/source-recheck/S033.json` (committed blob sha256 `fddc2a09d60d5b5300a24e9ee6c4cbd912c2f34f0da571fbf6347d9bc9f4d056`; worktree file identical) | schema/row/url/bytes/sha/quote/excerpt/producer fields below |
| Excerpt | `corpus/evidence/round-18/source-recheck/S033.excerpt.txt` (380 B, sha256 `d95ce1e40c850ea033f4fdfa249e7c7f46e27877b8e2901633f4143d57ba12d1`) | `normalize(decoded) + "\n"`; committed blob size 380 |
| Registry row | `corpus/SOURCES.md:47` | rowUrl occurs verbatim in the `source` cell; status `mined`, tier `A` |
| Original quote source | `corpus/lessons/round-16.md:43` | identical quote; "line 11; L1 fetch sha256 `50dd337d…6364`" |
| Recheck note | `corpus/knowledge/source-recheck-round-18.md:83` (S033 row); scope `:11`; pinned/live `:110-111`; limits `:140-141`, `:150` | see F3 |
| Claim | `.ufo/waves/round-18/PLAN.md:15-21` | C1 freshness, target 51 |
| Counter | `.ufo/waves/round-18/measure-c1.mjs:315` (`evaluateReceipt`), `:380` (`liveCheck`) | see F2 |
| Producer | `.ufo/waves/round-18/recheck-fetch.mjs:95-98`, `:106-109` | argv at `:95`, rendered command at `:98`, excerpt at `:106-109` |

## 2. Independent fetch and decode (observed)

Command actually run (UA quoted as one argv; see F4 for why):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'http=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT'
```

Observed: `curl_exit=0`, `http=200`, wire `size=409`, written body **520 B**, sha256
`9c0d5822fbae41ec86cf407e8040d86ea3ace4d213d7845f2c436b72620cf373` — identical to receipt
`bytes` (520) and `sha256`. A second fetch wrote `body2`; `cmp -s body body2` → 0 (byte-identical).

Decode `base64` → 389 B; sha256
`50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` (matches receipt
`anchorObserved`). `git hash-object --stdin` on the decoded bytes →
`c954510d188abb6fb21542e7a60127608650d48c`, which is exactly the `model_context_supplement.idl`
entry in the Gitiles directory JSON for the tag.

Content (389 B, 12 content lines + trailing blank; `wc -l` = 13):

```
// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// https://webmachinelearning.github.io/webmcp/#document-extension

[
  RuntimeEnabled=WebMCP,
  ImplementedAs=ModelContextSupplement
] partial interface Document {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};
```

Identity chain (all HTTP 200):

- `…/+/refs/tags/154.0.8037.97?format=JSON` (1085 wire / 2334 B written, sha256
  `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`) → `"commit":
  "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"`, root tree `e096b085…`; matches the receipt's
  `anchorObserved`.
- `…/third_party/blink/renderer/core/script_tools/?format=JSON` (629 wire / 2128 B, sha256
  `446d3f26…64c75`) → tree `dc56e4dd07f52b7ff10173fd18153e7aaa75394f`; entries
  `model_context_supplement.idl c954510d…`, `model_context.idl 30b1071c…` (3250 B),
  `model_context_tool.idl 9f500315…` (1314 B).

Quote location: decoded line **11**; normalized offset **303** = receipt `quoteOffset`;
`quoteWords` 6 = counter word count. Excerpt: `normalize(decoded)` is 379 B; the committed excerpt is
that string plus `\n` = 380 B, sha256 `d95ce1…ba12d1` = receipt `excerptSha256` and committed blob
size. Producer: sha256 of REV `.ufo/waves/round-18/recheck-fetch.mjs` =
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` = receipt `producerSha256`
(worktree identical). Row binding: the receipt `rowUrl` occurs verbatim in `SOURCES.md:47`; the
receipt `url` is the Gitiles `?format=TEXT` transform the counter's `canonicalFetchTarget` allows
(`measure-c1.mjs:177`).

Counter at REV:

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a…","c1_rows_rechecked":51,"eligible_rows":58,"held":50,
 "drift_superseded":0,"own_work":1,"row_classes":{...,"url":{"immutable_pinned":17,
 "living_live":46,"own_work":1}},"rejected":[],"live":null, ...}
```

At B (`2bff864…`): `c1_rows_rechecked:0`, `eligible_rows:51`, `rejected:[]`. S033 is accepted at
REV. All receipt fields required by the C1 contract pass.

## 3. Does the quote support `teaches`?

Row teaches (`SOURCES.md:47`): “The 154 build declares modelContext on Document, SecureContext,
RuntimeEnabled=WebMCP; there is no Navigator partial”.

- **Quote alone**: `[SecureContext, SameObject] readonly attribute ModelContext modelContext;`
  supports only the member declaration (name, type, and the two extended attributes). It contains
  neither `Document`, `RuntimeEnabled=WebMCP`, nor an absence claim. As a 6-word fragment it is
  **not sufficient by itself** to support the full `teaches` sentence.
- **Excerpt/file**: lines 7–12 contain `[ RuntimeEnabled=WebMCP, ImplementedAs=ModelContextSupplement ]
  partial interface Document { … };`, and the file has zero `Navigator` tokens. So the file supports
  the `teaches` sentence at file scope. The receipt's `note` says exactly this.
- **Build-wide negative**: not established by this receipt. Corroboration only — `model_context.idl`
  (sha256 `66c5a747…35b39`, declares `interface ModelContext : EventTarget`), `model_context_tool.idl`
  (sha256 `981610fc…0def`, dictionaries only), and `core/frame/navigator.idl` (sha256
  `a55936c7…7763c`, 1607 B) at the tag contain no `modelContext` token and no Navigator partial. No
  tree-wide Chromium search was run (finite limit §5).

Verdict on the row's axis: **identity held, anchor held, teaches held at file scope; quote-alone
support is partial; no drift, not unreachable.**

## 4. Findings (each with a finite counterexample)

### F1 — 13/51 receipts cannot exhibit source drift; S033 is one (claim-scope, medium)

Using the counter's own `isPinnedUrl` classification over `SOURCES.md` at REV, restricted to the 51
receipted rows (S001–S057 minus the six superseded):

```
receipted 51  {"living_live":38,"own_work":1,"immutable_pinned":12}
pinned_receipted S033,S034,S036,S037,S041,S042,S043,S044,S045,S046,S055,S056
```

`held:50` at REV therefore contains 12 receipts whose bytes are fixed by a tag/commit URL (S033
among them) and excludes S029 as own-work. Only **38/51** receipts can test source currency. For
S033 specifically, re-fetch proves **availability + byte identity + tag binding**, not freshness: the
same digest is expected on any date while the tag is served. The docs do state the limits (lessons
`:12-14` “not … current product support”, S029 “hygiene”; note `:110-111`, `:140-141`), but PLAN C1
(`:15-21`) and the counter output present one undifferentiated numerator. Recommend reporting
38 live + 12 pinned-availability + 1 hygiene, or explicitly scoping C1 to “receipts”, not
“freshness”.

### F2 — the counter admits a receipt that binds to no body (measure boundary, high)

`measure-c1.mjs` validates the body digest only for shape (`:330`), validates excerpt sha and
“quote ⊆ excerpt” (`:368-369`), and derives/validates the excerpt and offset **only for S029**
(`:372-375`). It never re-derives an HTTP excerpt from a fetched body, so `sha256`, `bytes`,
`quoteOffset`, `quoteSource`, `anchorObserved` and the quote/`teaches` relationship are unverified for
the other 50 rows. Sandbox probes on a `--no-hardlinks` clone at REV:

| Probe commit | Mutation to S033 | Counter result |
|---|---|---|
| `e0017017608cdc36f403dfdb99acdababce0f941` | quote = “Use of this source code is governed by a BSD-style license”; `sha256` = 64 zeros; `bytes` = 1; `quoteOffset` = 0 | **accepted**, `c1_rows_rechecked:51`, `rejected:[]` |
| `1d381ebb26008e2a886e76d3ccfc043b8a0b5086` | excerpt = “Synthetic excerpt for probe: The ModelContext interface is declared on Navigator.”, matching `excerptSha256`; quote contradicts the row's `teaches` (Navigator); zero digest; `bytes` = 1 | **accepted**, `c1_rows_rechecked:51`, `rejected:[]` |
| `e28f2a8271b52d41f104c11214bf41df9c51e5c3` (control) | quote absent from excerpt | rejected `quote not in excerpt`, `c1_rows_rechecked:50` |

The self-test covers `forged S029 sha` (`:714`) but has no forged-HTTP-digest case. Consequence:
`c1_rows_rechecked:51` proves the committed receipts are well-formed and internally consistent, not
that 51 fetches occurred. S033 was independently verified in §2, so its receipt is not affected; the
inference from the count to “source rows re-verified against their live source” rests on author
honesty for the other 50 and is not countersigned by the counter.

### F3 — note scope count and REV denominator (documentation, low)

`corpus/knowledge/source-recheck-round-18.md:11` says, present tense, “`corpus/SOURCES.md` has 57
rows (S001–S057).” At REV:

```
$ git show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/SOURCES.md | grep -c '^| S0'
64
```

(S058–S064 were opened this round.) The note is committed at REV, so the sentence is false as written;
it should say “at baseline B”. Related: the note's §2 (`:42`) records only the B counter run
(`eligible_rows 51 / c1_rows_rechecked 0`). At REV the counter prints `eligible_rows 58` (64 − 6
superseded) against 51 receipts, which is the number a reader will pair with `c1_rows_rechecked:51`.
The PLAN target (“51 = every row not superseded at B”) is still met; the issue is display/denominator
drift, not a missing receipt.

### F4 — receipt `command` is not shell-replayable (fidelity, low)

`S033.json:7` renders the UA unquoted:

```
… -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body …
```

The producer passes the UA as **one argv element** (`recheck-fetch.mjs:95`) and flattens argv with
`join(' ')` (`:98`). Running the same token structure in bash fails:

```
$ bash -c 'printf "ARG[%s]\n" -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18'
bash: -c: line 1: syntax error near unexpected token `('
exit=2
```

Replaying with the UA quoted as one argument reproduces the body exactly (§2). The counter compares
its own `join` (`measure-c1.mjs:233` renders the expected command; `:356` compares it) so it cannot
detect this. Fix: quote the UA in the rendered command or record the argv JSON.

### F5 — alternate rendering (informational, not a defect)

The registry's visible URL (without `?format=TEXT`) returns HTTP 200, 12355 B, sha256
`e2c11b558c557baf2c8e996bf7db6e6a6d77d844351e2d8fe4dcb2cce53b4cfa`. Under the shared `html-text`
decoder the quote is **not found**: producer `--normalize-only` in the sandbox →
`{"found":false,"offset":-1,"normalizedLength":753}`, because Gitiles wraps each token in spans
(`<span class="pun">[</span><span class="typ">SecureContext</span><span class="pun">,</span>…`), and
tag stripping inserts spaces between punctuation. This is a rendering artifact, not absence; the
base64 `?format=TEXT` endpoint is the correct citation for exact-quote matching. No evidence
replacement made.

## 5. Finite limits

- One row (S033), two source-body fetches, one tag JSON, one directory JSON, three sibling-IDL fetches:
  no `--live` sweep of all 51 rows, no tree-wide Chromium search for `modelContext`/Navigator, no
  browser, no runtime, no WebMCP invocation.
- F2 probes ran only in `/tmp/tabi-r18-s033` (clone of LANE at REV) at commits `e001701`, `e28f2a8`,
  `34eb155`, `1d381eb`; `/tmp/s033-r18` held fetched artifacts. Both removed after the digests above;
  the report contains the exact commands and full digests needed to reproduce.
- LANE untouched for the measured paths; lane tip remained `530f40a…`. No tools installed, no pacman
  transaction, no host service restart.

## 6. Recommended follow-up (for L1 integration)

1. In the note, qualify `:11` as baseline-B and record the REV counter output (51/58) next to
   `c1_rows_rechecked`.
2. In the claim/report, split the 51 into 38 live + 12 pinned-availability + 1 own-work, or rename the
   movement to “receipts committed”, keeping the freshness reading on the 38.
3. Either extend the counter to re-derive HTTP excerpts from a body (or at least carry a
   producer-computed body-derived digest checked by `--live`), or add an explicit limit stating that
   the count is not a fetch attestation for non-S029 rows.
4. Quote the UA in the rendered `command` or record argv as JSON.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS033.md`
