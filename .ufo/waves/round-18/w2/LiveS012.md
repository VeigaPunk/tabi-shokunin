VERDICT: ISSUES

# LiveS012 — C1 receipt attack: S012 (live) and S029 (own-work)

Read-only attack. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` at
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (lane tip `refs/heads/master` = HEAD = REV;
`git status --porcelain` showed only untracked `.ufo/waves/round-18/w2/`). No lane production,
fleet, sibling, jj, or Git-index write; no git write anywhere. All fetch/temporary work was in
private `/tmp` directories, removed after the checks.

**Summary.** S012's receipt satisfies every C1 counter rule, and its quote, anchor and teaches all
hold. One free-text clause is false: the receipt calls the README's "source was moved to Chromium"
note **"new"**, but the identical note is present at least at commit `5d59739467e4`
(2026-09-23), at `679687462a07` (2026-10-06), and at the row's own anchor commit `1c6f4363`
(2026-10-14). It therefore predates the row's 2026-10-19 opening by >=26 days and the 2026-10-20
receipt by >=27 days. This does not change `teachesVerdict=held` or `c1_rows_rechecked=51`, and no
superseding row is required by the stated gate; but the receipt must not be read as recording a
newly discovered move or a fresh source-identity event. S029 holds with no issue.

## 1. S012 independent live refetch

```
D=$(mktemp -d /tmp/tabi-r18-lives012-XXXXXX)
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o "$D/body" -w 'http_code=%{http_code} size_download=%{size_download}\n' \
  'https://github.com/GoogleChromeLabs/chromium-bidi'
```

Observed: `http_code=200 size_download=69746`, curl exit 0. (size_download is the compressed wire
size; on-disk body is 527572 B.) Full on-disk digest:

```
38798c9e9905db6b0c87e392683aaedcbef168bcd29a49c4eb3fed4eb97bd979  527572 B
```

Decode per receipt `decode: html-text`. A private Node script replicated `decodeBody()`/`normalize()`
from `.ufo/waves/round-18/recheck-fetch.mjs` (HTML script/style removal, tag removal, fixed entity
table, NFC, curly-quote/dash folding, whitespace collapse), and the result was cross-checked with the
producer's write-nothing probe:

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text \
  --body "$D/body" \
  --quote 'implemented as a JavaScript layer translating between BiDi and CDP, running inside a Chrome tab'
```

Both observed:

```
{"found":true,"offset":4098,"normalizedLength":23667}
```

Quote word count: 15, equals `quoteWords`. The located window begins:

> Note If you are viewing this on GitHub, the source was moved to Chromium . Please contribute there
> and file issues on crbug.com . WebDriver BiDi for Chromium This is an implementation of the
> WebDriver BiDi protocol with some extensions ( BiDi+ ) for Chromium, implemented as a JavaScript
> layer translating between BiDi and CDP, running inside a Chrome tab. Current status can be checked
> at WPT WebDriver BiDi status .

Receipt comparison (dynamic page, so raw-body equality is not required; see `PLAN.md:69-75` and
`corpus/knowledge/source-recheck-round-18.md:143`):

| Field | Receipt `S012.json` | Independent fetch |
|---|---|---|
| HTTP | 200 | 200 |
| bytes | 527500 | 527572 |
| sha256 | `b1b0c3dacda9418a61a68be19cabd6eb97e846945d5909eab979a75c06c09a63` | `38798c9e9905db6b0c87e392683aaedcbef168bcd29a49c4eb3fed4eb97bd979` |
| decode | html-text | html-text |
| quote found | true, offset 4098 | true, offset 4098 |

The 72-byte byte-count delta and digest delta are one-response chrome/CSP/asset variation on a live
GitHub page; content-level identity (quote at the same normalized offset) holds. The receipt's own
note (`source-recheck-round-18.md:143`) says a `sha256` "must not be compared across runs or used as
a page identity", and the plan explicitly does not require raw-body equality on dynamic pages.

## 2. Anchor and quote verification

The row's location cell (`corpus/SOURCES.md:26` at REV) names "README §WebDriver BiDi for Chromium
and §BiDi+, commit 1c6f4363"; the receipt's `anchorObserved` additionally claims that the README at
that commit is byte-identical to main and has sha256 `f3a626db...`.

```
curl -sSL --compressed --max-time 90 -o anchor.md \
  'https://raw.githubusercontent.com/GoogleChromeLabs/chromium-bidi/1c6f4363b532258da7f4732deba2656a1a4fea45/README.md'
curl -sSL --compressed --max-time 90 -o main.md \
  'https://raw.githubusercontent.com/GoogleChromeLabs/chromium-bidi/main/README.md'
```

Observed for both: HTTP 200, 22873 B on disk, sha256
`f3a626db446bda23866afbeab6e5d0f6a60de10f30b0ea7de821ceda356af401`; `cmp` printed nothing
(identical). The receipt's claimed anchor digest is exactly the digest of both raw READMEs.

The quote is present in the anchor raw README at normalized offset 570 and in main; raw Markdown
lines 9-10 carry the sentence across a source line break:

```
9: for Chromium, implemented as a JavaScript layer translating between BiDi and CDP,
10: running inside a Chrome tab.
```

Commit metadata (`api.github.com`, GET, HTTP 200):

* anchor `1c6f4363b532258da7f4732deba2656a1a4fea45`: committer 2026-10-14T09:59:14Z, message
  "[chromium-bidi] Document the npm publishing process in README".
* `compare/1c6f4363...main`: `status:"ahead"`, `ahead_by:16`, `behind_by:0`, base and merge base
  both `1c6f4363...` — the anchor is an ancestor of main.
* current main `7037906ac49e2690868c4db0ec88b61b99b94d15`: 2026-10-20T15:31:11Z; the live HTML body
  from §1 contains that 40-hex oid twice.

Conclusion: **anchor held** — the receipt's digest, date, ancestry and HEAD observation are all
reproduced.

## 3. Does the quote support the teaches cell?

Row teaches (`corpus/SOURCES.md:26`): "Chromium BiDi is a JavaScript layer translating BiDi to CDP
inside a tab, plus Chromium-only `goog:cdp.*` BiDi+ extensions that are not standard BiDi; the
statement proves no individual command."

* Clause 1 is the quote verbatim.
* Clause 2 is supported by the same README's §BiDi+ (raw anchor README lines 24-94): line 26 says
  BiDi+ is "an extension of the WebDriver BiDi protocol. In addition to WebDriver BiDi it has:";
  commands are listed at line 28 (`goog:cdp.sendCommand`), line 52 (`goog:cdp.getSession`), line 71
  (`goog:cdp.resolveRealm`), events at line 90 (`goog:cdp.<CDP Event Name>`). The committed excerpt
  extends 600 normalized characters past the quote and ends at "iDi it has: Command
  goog:cdp.sendCommand", so it contains the BiDi+ heading and the first extension command; the live
  body from §1 contains 34 `goog:cdp.` occurrences.
* Clause 3 ("the statement proves no individual command") is a scope caveat, neither asserted by the
  quote nor contradicted by it; the enumerated commands are BiDi+ extensions, not standard BiDi
  commands. It does not overclaim.

**Teaches held**, matching the receipt. Note that the single quote supports clause 1 only; clauses 2-3
are supported by the README's adjacent §BiDi+ section, which the row's location cell also cites and
which the receipt's `note` describes. That is a bounded synthesis, not quote-verbatim proof.

## 4. Finding F1 (the ISSUES item) — "new README note" is false

Receipt `corpus/evidence/round-18/source-recheck/S012.json:22` says:

> "Held: body section WebDriver BiDi for Chromium still carries the layer sentence and BiDi+ lists
> goog:cdp.sendCommand/getSession/resolveRealm as protocol extensions, so the teaches cell stands;
> **new README note** says source moved to chromium/src third_party/chromium-bidi (hosting only, text
> unchanged)"

The note is not new. Finite counterexample — the identical line-2 note is present in the raw README
at older commits:

| Commit | Date (committer) | README bytes | README sha256 | line 2 | quote present |
|---|---|---|---|---|---|
| `5d59739467e4` | 2026-09-23T12:25:09Z | 6619 | `62c579d59e261c1c63fd69e18c73956f3e14cbe9aa105136737f6a1077f72edd` | `> If you are viewing this on GitHub, the source was moved to [Chromium](https://chromium.googlesource.com/chromium/src/+/main/third_party/chromium-bidi). Please` | `grep -c` = 1 |
| `679687462a07` | 2026-10-06T11:19:04Z | 7136 | `68876613399fc8cd636f52271e646c3ed299812ba4b1291333dee650e6ee3b84` | same note | `grep -c` = 1 |
| `1c6f4363` (row anchor) | 2026-10-14T09:59:14Z | 22873 | `f3a626db446bda23866afbeab6e5d0f6a60de10f30b0ea7de821ceda356af401` | same note | `grep -c` = 1 |

Full line-2 bytes are byte-identical across all three commits:
sha256 `1499a819257808936a8be3e9442654a8ede598675d01614f3dcbedb682d6f52c`; pairwise `diff` of
line 2 printed nothing.

Neither candidate commit added the note: the `1c6f4363` README patch is `+7 -1` with one hunk at
`README.md:482` (npm-publishing section), and the `679687462a07` README patch is `+10 -8` with hunks
starting at `README.md:486` (Copybara section). Both patches leave line 2 untouched. The note
therefore existed by 2026-09-23, i.e. >=26 days before the row's 2026-10-19 opening and >=27 days
before the receipt's 2026-10-20 `fetchedAt`.

The receipt's own `anchorObserved` makes the contradiction internal: it says the README at anchor
`1c6f4363` is byte-identical to main with digest `f3a626db...`; that same README contains the note at
line 2, so a recheck of the anchor cannot discover the note as new. If "new" was meant as "newly
noticed by this seat", it is still not a property of the source and cannot support any freshness
signal.

**Impact and required repair (main-owned).**
* `teachesVerdict=held` remains correct: the quoted sentence and the BiDi+ section are unchanged.
* The C1 counter does not read `note`; `c1_rows_rechecked` remains 51 at REV and all 51 receipts
  remain accepted (§7). No superseding row is required by the stated gate because the teaches claim
  did not drift.
* Correct `S012.json`'s note (and, if desired, add a one-line qualification to the knowledge note)
  so it says the move note is present at the anchor and predates the row — not new. This wording
  occurs only at `corpus/evidence/round-18/source-recheck/S012.json:22` (grep over `corpus/` and
  `.ufo/waves/round-18/`, excluding `w2/`); the knowledge note does not repeat it.
* Because receipts are committed bytes at the measured REV, editing the receipt changes the measured
  revision; whether to correct before or after measurement is the L1's decision, not this seat's.

## 5. Immutable availability vs live product freshness

No conflation at the claim/note level:

* `corpus/lessons/round-18.md:12` — "C1 counts round-specific integrity-checked recheck receipts, not
  overdue rows or current product support."
* `corpus/knowledge/source-recheck-round-18.md:141` — "the 51 rows are not a statement of current live
  product support."
* The receipt records quote presence in one 2026-10-20 response, not product behavior.

The quote itself is durable, not fresh: it is present in READMEs at 2026-09-23, 2026-10-06,
2026-10-14 and main today; the anchor README is byte-identical to main. So the S012 recheck is
correctly an integrity/availability re-verification of a stable statement, not evidence that the
product changed or that support is current. The only place a reader could mistake it for a fresh
source-identity event is the false "new" clause in §4; removing that clause keeps the separation
clean.

## 6. S029 (own-work; `git show` at the pinned commit, no network)

```
git cat-file -t 837b33a3988ebeea7f6b4ef5c04698da88909a73              -> commit
git show 837b33a...:corpus/evidence/round-13/aria/receipt.json | sha256sum
  -> b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  (97073 B)
git show 2bff864...:corpus/evidence/round-13/aria/receipt.json | sha256sum
  -> b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  (97073 B)
git show 530f40a9...:corpus/evidence/round-13/aria/receipt.json | sha256sum
  -> b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  (97073 B)
```

The blob is identical at the pinned commit, at baseline B, and at REV; `837b33a` is an ancestor of
REV (commit object: "round-13: admit real loopback evidence and retained failure lessons").

Quote location in the pinned blob, using the same replicated normalizer:

```
{"found":true,"offset":74695,"normalizedLength":76376,"quoteWords":17}
```

Offset 74695 equals the receipt's `quoteOffset`; 17 words equals `quoteWords`; the committed excerpt
is 1382 B with sha256
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` (matches `excerptSha256`), and
`normalize(quote)` occurs in `normalize(excerpt)`. The counter's stricter S029 checks (exact
`sourceExcerpt` byte equality and offset) accepted it at REV (§7).

Taught fields read from the pinned blob:

```
cleanup.server.listeningAfter            = true
cleanup.server.perWorker[0].listeningAfter = false
runtime.node                             = "26.12.0"
pin.node.recorded                        = "24.21.0"
pin.node.minimumMajor                    = 20
```

This matches the row teaches (`corpus/SOURCES.md:43`) and the receipt's `note` exactly. `httpStatus:
null`, `rowUrl` = `url` = the repo path, and the `git show` command are the allowed own-work form.
**S029 held; no issue.** The quote supports the listeningAfter half directly; the Node-version half
is supported by other fields of the same pinned blob, as the row anchor states.

## 7. Counter and aggregate checks

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40...","c1_rows_rechecked":51,"eligible_rows":58,"held":50,
 "drift_superseded":0,"own_work":1,"rejected":[]}

node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
{"rev":"2bff864...","c1_rows_rechecked":0,"eligible_rows":51,"held":0,"own_work":0}
```

* Row-set proof: baseline B has 57 rows; 51 receipt files exist; `comm` shows the missing rows are
  exactly the six superseded (`S004 S039 S047 S049 S050 S053`); no receipt exists for a row outside
  B. REV has 64 rows = B's 57 + `S058 S059 S060 S061 S062 S063 S064`; those seven account for
  `eligible_rows=58` at REV and are outside the C1 target ("every row not superseded at B"). Thus
  51/51 is exact, and the 0→51 movement is reproduced.
* Aggregate of the 51 receipts: schema `tabi-source-recheck-v1` 51; `teachesVerdict=held` 51;
  `quoteFound=true` 51; HTTP 200 50 + null 1 (S029); one `producerSha256`
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`; decode html-text 32,
  base64 5, none 13, pdf-text 1; maximum quote 24 words (S043); no `quoteWords` mismatch; no
  missing excerpt. These reproduce `corpus/knowledge/source-recheck-round-18.md` §1-§2.
* Producer at REV hashes to the same `f2ba...` value; the committed receipt and excerpt bytes at REV
  equal the worktree bytes (`S012.json` `2d7a5323...`, `S012.excerpt.txt` `f7c9f1b4...`,
  `S029.json` `d01f6c97...`, `S029.excerpt.txt` `80b5de21...`).
* S012 excerpt window: quote length 95, offset-in-excerpt 600, file 1296 B, normalized 1294 chars;
  this is exactly the producer's `text.slice(at-600, at+len+600) + "\n"` construction, so the
  excerpt is derived from a body in which the quote sits at normalized offset 4098.

## 8. Limits

* The receipt's exact 527500-byte response is not recoverable (GitHub live page); my 527572-byte
  response differs, and the digests differ. Equality is not required by `PLAN.md:69-75` or
  `source-recheck-round-18.md:143`; only content-level identity (quote at offset 4098) is asserted.
* I did not run `measure-c1.mjs --live` over all 51 rows; only S012 was independently refetched.
  S029 was re-read from git, not network.
* Raw textual grep cannot find the quote in the live HTML because it crosses a source line break,
  and cannot find the move note because an `<a>` tag splits it; only normalized text establishes
  presence. The raw Markdown at every cited commit does contain both literally (lines 9-10 and
  line 2 respectively). This is the producer's documented decode rule, not a workaround added here.
* GitHub API was unauthenticated; after several commit fetches one call returned HTTP 403
  (rate limit). All conclusions use the HTTP-200 responses already obtained plus
  `raw.githubusercontent.com` GETs (all HTTP 200). No API-derived claim depends on the 403'd call.
* The finding F1 is a free-text provenance defect; it is not a counter-field failure. No
  non-author judgment beyond this seat is claimed, no runtime/product behavior is claimed, and no
  production artifact was edited.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS012.md`

No sandbox retained; private `/tmp` fetch directories and the private normalizer script were
removed.
