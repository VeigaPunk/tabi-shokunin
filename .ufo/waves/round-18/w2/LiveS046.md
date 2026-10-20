VERDICT: ISSUES

# LiveS046 — C1 receipt S046 attacked by independent re-fetch

LANE `/home/vgpnk/Projects/shokunin/tabi-shokunin`; B `2bff864fdfee684ddbcd066cc8e735adaba2735c`;
measured REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. Row S046
(`corpus/SOURCES.md:60` at REV; header `corpus/SOURCES.md:13`:
`id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`).
Receipt `corpus/evidence/round-18/source-recheck/S046.json`; excerpt `S046.excerpt.txt`;
quote source `corpus/lessons/round-17.md:58`; producer `.ufo/waves/round-18/recheck-fetch.mjs`
(git blob at REV `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, absent at B).
Read-only on lane production and fleet; all probes in one private sandbox, deleted at the end.
The producer was never executed: I imported only its exported `normalize` from a `/tmp` script,
and its `main()` guard compares `process.argv[1]` with the module path, so no receipt was written
anywhere (`recheck-fetch.mjs:140`).

## 1. Re-fetch and observed bytes

Exact command (curl exit 0, HTTP 200):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -D headers.txt -o body \
  -w 'http=%{http_code} size=%{size_download} time=%{time_total}\n' \
  'https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md'
-> http=200 size=13477 time=0.247459
```

- `sha256sum body` = `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6`
  (receipt `sha256`, identical), `wc -c body` = `37575` (receipt `bytes`).
  `size_download` 13477 is the gzip transfer size; `--compressed` decoded it to 37575 B, which is
  what the producer records.
- Response headers: `HTTP/2 200`, `date: Tue, 20 Oct 2026 20:02:16 GMT`,
  `etag: W/"0d49f5df8565209a7d3072f67262bbbc197969b8f0bf5a357b28230f75e2cd94"`,
  `content-length: 13477`.
- Identity binding to the pinned commit: `git hash-object body` =
  `e28d86f7e18d43946ba5340d87edee8cd46b77ea`; the GitHub contents API for
  `README.md?ref=51ed7565…` returned `sha` = same 40-hex and `size` = 37575, and its base64
  content decoded to 37575 B with `sha256 184c519a…` (second endpoint, same bytes). So the served
  bytes are the blob recorded in the tree of the commit named by the URL, not a later file.
- Row URL cross-check: the GitHub blob page for
  `.../blob/51ed7565…/README.md` returned HTTP 200, 556461 B HTML, sha256
  `93bb2c33c471e346b0c02235a6f51037c6f4ffd57dcaf1767a1c5d7daf60a0a5`, and contains the quote
  3 times across its embedded payload and rendered HTML (escaped
  `\u003ccode\u003eexecute\u003c/code\u003e` form and plain backtick form).
- Decode `none`, as declared. The quote occurs exactly once in the decoded body.

## 2. Receipt fields reproduced

Reproduced by importing the producer's `normalize` and replaying its own slice rule
(`recheck-fetch.mjs:48-53, 106-107, 126-128`); exit 0:

| Field | Receipt | Observed | Result |
|---|---|---|---|
| `quote` | `The browser mediates the call, invokes the tool's \`execute\` callback with the provided arguments` | present once, raw byte offset 18101; `README.md:312` | match |
| `quoteWords` | 14 | 14 whitespace tokens | match |
| `quoteOffset` | 17302 | 17302 in normalized text (see F3) | match to producer semantics |
| `quoteFound` | true | true | match |
| `httpStatus` / `bytes` / `sha256` | 200 / 37575 / `184c519a…` | 200 / 37575 / `184c519a…` | match |
| `excerptSha256` | `f9cb8f1b6ead0440b9b2a51a5f61b9460ac1fbcfa6f7ff9796612c8e2a28a89b` | same | match |
| excerpt derivation | 600 chars each side of the quote | excerpt is byte-exact `${normalize(body).slice(16702,17998)}\n` (1296 chars + newline = 1297 B) | match |
| `normalize(quote)` in `normalize(excerpt)` | required | true | match |
| `producerSha256` | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` | equals `git show REV:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum`; path absent at B | match |
| `anchorObserved` | "commit 51ed7565 resolves; raw README 37575 B sha256 …; quote at README.md:312" | commit metadata 2026-10-20T14:57:14Z; bytes/sha/line all true | match |
| `teachesVerdict` | `held` | row-level held; see F2 for coverage | partial (F2) |
| `fetchedAt` | 2026-10-20T19:09:39.264Z | 2026-10-20 | match |

Anchor ranges checked against the pinned files: `README.md` §Lifecycle of a Tool Call heading line
308, quote line 312, response line 313; `#### Discovering and running tools: getTools() and
executeTool()` heading line 352, body through line 375 (row's "§executeTool ll. 352-375" is a
shorthand for that heading). Sibling references in the receipt `note` are exact:
`declarative-api-explainer.md:117` (§Getting the form response) and `:155` (§Events);
`continuations-explainer.md:220` (token sentence under §Document Lifecycle Considerations, heading
218); `security-privacy-questionnaire.md:57` (Q12) and `:93` (Q19).

Row identity: the S046 row bytes are identical at B and REV
(`aba707ff5966afbff36b336a06c17336b714d2b2c2ecb0bde4a31ae76800679c` both), status `mined`,
tier `A`, opened 2026-10-20, recheck `on-release`; no row's `teaches` starts `supersedes S046`.
`quoteSource` `corpus/lessons/round-17.md:58` is the same quote, same line 312.

## 3. Findings

### F1 — ISSUES: C1's "live source" wording and the counter's `--live` path conflate pinned availability with live freshness (12 of 51 counted rows, S046 among them)

- `.ufo/waves/round-18/PLAN.md:15-16` says "Source rows re-verified against their live source with a
  committed recheck receipt"; `.ufo/waves/round-18/PLAN.md:21` offers `--live` as the live check.
- The counter classifies rows by URL (`measure-c1.mjs:247-260`). Applied to the 51 receipt rows at
  REV, the mix is **12 `immutable_pinned`, 38 `living_live`, 1 own-work** (S029; its source cell has
  no HTTP URL, so `urlClass` returns `unclassified` but `kind` is `own-work`). Pinned rows:
  S033 S034 S036 S037 S041 S042 S043 S044 S045 **S046** S055 S056.
- S046's `receipt.url` is commit-pinned. Re-fetching it can only confirm that an immutable object is
  still served; it cannot observe README drift. Finite demonstration: the README is byte-identical
  (`184c519a…`, 37575 B) at `f14762e6` (2026-10-16T16:30:24Z), `cb3d1696`
  (2026-10-20T09:53:18Z), `51ed7565` (2026-10-20T14:57:14Z, current default-branch HEAD) and at
  `main`. This recheck ran at 19:09:39Z, 4 h 12 min after the pinned commit, on the day the row was
  opened, so there was zero opportunity for README drift inside the citation, and no drift exists
  after it yet. A later README change in `main` would leave this receipt `held` unchanged, because
  the URL names `51ed7565`, not `main`.
- The counter's `--live` does not repair this: `evaluateReceipt` sets `fetchUrl = mapping.canonical`
  (`measure-c1.mjs:358`), which for a `github.com/.../blob/<40hex>/…` row URL is the
  `raw.githubusercontent.com/<40hex>/…` form (`measure-c1.mjs:189`), and `liveCheck` re-fetches
  `item.fetchUrl` (`measure-c1.mjs:399`) and increments `live_held` for it
  (`measure-c1.mjs:432`). For the 12 pinned rows `live_held` therefore measures reachability, not
  liveness. (Observed from code, not from a full `--live` run; see §5.)
- Already-carried qualifiers: `corpus/lessons/round-18.md:12-13` ("C1 counts round-specific
  integrity-checked recheck receipts, not overdue rows or current product support");
  `corpus/knowledge/source-recheck-round-18.md:110` (pinned class) and `:141` (receipts say nothing
  about product behaviour); `LOG.md` round-18 says "own-work/pinned/live classes kept distinct".
  So the record partly discloses the distinction; the PLAN claim line and the counter's output do
  not.
- Impact is bounded: `c1_rows_rechecked` 51 is correct for the declared receipt contract and no
  count is inflated; 0 → 51 movement stands. What the count does not establish for S046 (and the
  other 11 pinned rows) is *live* freshness. Minimal repair: reword PLAN C1 to "re-verified against
  their cited revision or live page", and report `pinned_still_available` separately from
  `live_held` (or exclude pinned rows from `live_held`).

### F2 — ISSUES: the receipt's quote/excerpt supports only part of the `teaches` cell; the rest rests on unfetched sibling files and free-text `note`

- Registry `teaches` (`corpus/SOURCES.md:60`, cell 7): "Grounds which invocation outcomes a receipt
  may claim: execute arguments and returned response, not a navigation response or user consent".
  `scope` (cell 5) additionally claims "its declarative and continuation response paths".
- The 96-char quote at `README.md:312` supports only the **execute-arguments** half
  ("invokes the tool's `execute` callback with the provided arguments").
- The **returned-response** half is `README.md:313`, normalized offset 17461: inside the 1296-char
  excerpt (window 16702-17998), outside the quote.
- **Not a navigation response**: supported by `continuations-explainer.md:15-20` (a navigating server
  request ends the original tool request and the agent receives no success signal or output) and by
  `declarative-api-explainer.md:119` ("This topic is currently under debate"). Neither file is
  fetched by the receipt.
- **Not user consent**: case-insensitive `consent` has **0 occurrences** in the README,
  `declarative-api-explainer.md`, `continuations-explainer.md` and
  `security-privacy-questionnaire.md`. The clause is an admissibility limit, not source content;
  read as a source proposition it is unsupported. (SPQ:63 speaks of a "confirmation step", not
  consent.)
- The **declarative and continuation response paths** named in `scope` live only in the siblings
  (`declarative-api-explainer.md:117-133`, `:155-201`; `continuations-explainer.md:15-25`,
  `:218-220`). I verified them at the pin, so the row-level `teaches` is not false; but the receipt
  itself does not fetch them.
- Downstream use: `corpus/knowledge/webmcp-invocation-round-17.md:77` cites S046 for "declarative
  tools are outside the spec". The verbatim sentence "not part of the specification" is at
  normalized offset 18021 — **23 chars past the excerpt end (17998)**. The excerpt does contain
  "is what the specification defines" (17744) and "is being explored separately" (17891), so the
  claim is broadly covered; the exact sentence is not.
- Enforcement gap: `measure-c1.mjs:337` accepts `teachesVerdict` as free text (`held` or `drift`) and
  never tests quote→`teaches` coverage. `held` here is producer-asserted. This is not a violation of
  the declared C1 contract (quote presence, excerpt integrity, URL/producer binding), all of which
  hold; it is a mismatch between what the receipt proves and what the `teaches` cell implies.

### F3 — NOTE: `quoteOffset` is a normalized-character offset, not a raw byte offset; the schema does not say so

- Producer: `text = normalize(...)`; `at = text.indexOf(q)` (`recheck-fetch.mjs:104-106`);
  `quoteOffset: at` (`:126`). For S046, normalized offset 17302, raw byte offset 18101 (799 apart;
  raw 37575 B, normalized 36621 chars). The counter recomputes and checks this field only for S029
  (`measure-c1.mjs:370-374`), and does so in the same normalized space, so nothing fails. External
  consumers comparing `quoteOffset` to `grep -abo` will see a mismatch; the receipt's own
  `anchorObserved` correctly uses the line number instead.

### What held

- Source identity: HELD (HTTP 200; bytes/sha match; blob sha1 equals the commit tree's blob; a
  second endpoint and the row's rendered blob URL agree).
- Anchor: HELD (`README.md:312`; §Lifecycle ll. 308-313; §executeTool heading 352-375; all sibling
  lines exact).
- Teaches: HELD at row level after independent sibling verification; receipt-level coverage partial
  (F2). No drift, no unreachable, no superseding row needed.
- Receipt integrity: every declared field reproduces; excerpt is the producer's exact slice;
  producer sha is the REV blob; row bytes unchanged B→REV; counter accepts with zero rejections.

## 4. Counter acceptance (observed)

`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` → exit 0, stderr
empty, output 550 B sha256 `8cd3fd8c84279852cc291bfb3eacee0e35540ead1612ce8028674b76c5b1adf3`:

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

At B the same counter reports `c1_rows_rechecked 0`, `eligible_rows 51`,
`url {immutable_pinned 14, living_live 42, own_work 1}` — matching
`corpus/knowledge/source-recheck-round-18.md:110`/§2. No S046 rejection; S046 contributes one of the
50 `held` (own-work S029 is excluded from `held`).

## 5. Not run, and finite limits

- No full `--live` invocation over 51 receipts (that would be 51 external GETs). I read the
  `--live` code path and re-fetched S046's canonical URL myself; the `live_held` claim in F1 is
  code-observed and is labelled as such, not measured.
- One re-fetch per URL; no repeated-fetch stability test (the page is commit-pinned, not dynamic).
  No alternative rendering was needed because the quote was present in the primary raw fetch; the
  contents API and the rendered blob page were still used as independent identity cross-checks.
- No product, browser or runtime claim; no Chromium invocation; S046 is `docs` tier A.
- No full `--self-test` run of `measure-c1.mjs`; the counter's acceptance of S046 (no rejection) is
  the slice under attack.
- Unauthenticated GitHub API quota reached 60/60 (HTTP 403,
  `x-ratelimit-remaining: 0`) after my metadata probes; the last call (commit file list) failed and
  is not used. Commit dates/messages already captured from earlier calls are cited above; the
  README-identity conclusion rests on raw/endpoint bytes, not on the API quota.
- Read-only compliance: no lane production, fleet, sibling report, jj or Git index write; no `jj`
  or Git write anywhere. Sandbox `/tmp/tabi-r18-s046-AGtN` deleted after this report.
- Tool installs/upgrades: none (no package, release or npm/uv change was needed).

## 6. Reproduction

```
SB=$(mktemp -d /tmp/tabi-r18-s046-XXXX); cd "$SB"
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -D headers.txt -o body -w 'http=%{http_code} size=%{size_download}\n' \
  'https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md'
sha256sum body; wc -c body; git hash-object body
LC_ALL=C grep -aboF "The browser mediates the call, invokes the tool's \`execute\` callback with the provided arguments" body
LC_ALL=C grep -nF "The browser mediates the call" body
# second endpoint identity
curl -sSL -H 'Accept: application/vnd.github+json' \
  'https://api.github.com/repos/webmachinelearning/webmcp/contents/README.md?ref=51ed75653aaa7f174f8dbe05d1bc327359bbc57c'
# siblings at the pin
for f in declarative-api-explainer.md continuations-explainer.md security-privacy-questionnaire.md; do
  curl -sSL --compressed -o "$f" "https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/$f"; done
# excerpt/offset reproduction (imports producer normalize only; main() not triggered)
node check.mjs   # reports at=17302, offsetMatches=true, excerptMatchesFile=true, quoteInExcerpt=true
# counter at B and REV (lane cwd)
node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Digests observed in the sandbox:
`body`/`main`/`cb3d1696`/`f14762e6` README all
`184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` (37575 B);
`declarative-api-explainer.md` `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28`
(10417 B); `continuations-explainer.md`
`009b04ae31ffdb0c3ca211572d49f3a6d68cf85f66e0be541bfb8a3ac9fe9de8` (10512 B);
`security-privacy-questionnaire.md`
`76e65774f109f3f0b8ce296dda8116cb919ed616ddb00cb46841b9b5f75141c0` (9229 B);
rendered blob page `93bb2c33c471e346b0c02235a6f51037c6f4ffd57dcaf1767a1c5d7daf60a0a5` (556461 B);
fetched body blob sha1 `e28d86f7e18d43946ba5340d87edee8cd46b77ea` = contents-API `sha` at
`ref=51ed7565…`.

Files written: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS046.md`
