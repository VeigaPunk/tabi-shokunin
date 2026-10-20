VERDICT: PASS

# S020 C1 receipt — independent falsification (round 18, wave 2)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; HEAD = `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (== measured
REV; `git log -1` 2026-10-20T15:35:44-03:00 "round-18: source rechecks, guarded harness, routed correction
evidence and build wave"). Baseline B = `2bff864fdfee684ddbcd066cc8e735adaba2735c`. No lane writes; no git
writes; producer not run in production (only its exported `decodeBody`/`normalize` were imported by a `/tmp`
probe, and `main()` did not run because `process.argv[1]` was the probe path). Scratch sandbox
`/tmp/tabi-r18-lives020` was removed after extraction; every command and digest below is reproducible.

## 1. Independent re-fetch of `receipt.url`

Exact command:

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabi-r18-lives020/body \
  -w 'http=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  'https://webmachinelearning.github.io/webmcp/'
```

Observed, exit 0:

```
http=200 size=77377 url=https://webmachinelearning.github.io/webmcp/
511987 bytes 2026-10-20 17:02:11.453430009 -0300
5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40  body
```

- `size_download=77377` is compressed transfer bytes; `--compressed` decodes to the 511987-byte body the
  receipt hashes. This explains the two numbers; they are not contradictory.
- Receipt `bytes` 511987 and `sha256` `5627596668946732…63ca40` match the fetched body **byte for byte**
  (`corpus/evidence/round-18/source-recheck/S020.json:9-10`). No dynamic-page caveat is needed for this row
  within the tested interval: the receipt was fetched `2026-10-20T19:05:54.125Z` (`S020.json:6`), mine at
  ~`20:02:11Z`; identical digest.

## 2. Decode, quote location, excerpt integrity

Receipt `decode` is `html-text` (`S020.json:11`). Using the producer's exported `decodeBody`/`normalize`
(`.ufo/waves/round-18/recheck-fetch.mjs:21,48`) on the fetched body:

- Normalized text length 77792; quote index **586**, exactly `S020.json:17` (`quoteOffset`); occurrence count 1.
- Quote word count 13, equal to `S020.json:14` (`quoteWords`); the quote is ≤25 words.
- In the raw HTML the sentence is contiguous (not tag-joined by tag stripping) at char 28790 / byte 28801,
  inside `<h2 id="abstract">…<p>The WebMCP API enables web applications to provide JavaScript-based tools to
  AI agents.</p>`.
- Derived excerpt `text.slice(max(0,586-600), 586+88+600) + "\n"` = 1275 bytes,
  sha256 `0826db261d9729cdbb6fdc50e8740e1eb0455bc4c386028740c35e45adf6557a`; byte-identical to the committed
  `corpus/evidence/round-18/source-recheck/S020.excerpt.txt` (1275 bytes, same sha). `S020.json:19`
  (`excerptSha256`) matches. So the committed excerpt is exactly the producer's derivation from the body the
  receipt names, not an independently edited file.
- `producerSha256` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (`S020.json:24`) equals
  `git show 530f40a9….ufo/waves/round-18/recheck-fetch.mjs | sha256sum` and the working-tree file; blob id
  `7d9c314e4fc84b672cb024f400101127033552ec`. `git status --porcelain` for the receipt, excerpt, producer and
  `corpus/SOURCES.md` is empty.

## 3. Does the quote actually support `teaches`?

Row S020 at REV is `corpus/SOURCES.md:34`:

> teaches: Grounds the native-WebMCP frontier: pages expose JavaScript tools to agents; a CG draft, not a W3C Standard

- Clause 1 ("pages expose JavaScript tools to agents"): directly supported by the quoted Abstract sentence
  ("web applications … provide JavaScript-based tools to AI agents"). Held.
- Clause 2 ("a CG draft, not a W3C Standard"): the 13-word quote alone does **not** carry this. The same fetched
  body's status paragraph does: "This specification was published by the Web Machine Learning Community Group .
  It is not a W3C Standard nor is it on the W3C Standards Track." (raw char 29200). The committed excerpt
  contains both strings (`grep -c` = 1 for the abstract, 1 for the status clause), and `index.bs` at both
  revisions has `Status: CG-DRAFT` (line 5). The receipt note names this split ("Abstract, status section",
  `S020.json:22`). So the receipt's overall evidence supports `teaches`; the single machine-checked `quote`
  supports only clause 1. This is a nuance, not a false receipt.
- `quoteSource` `corpus/lessons/kaika-fleet-round-1.md:63` is the S020 row and carries the same sentence
  (verified at REV; lesson file sha `a3b5b04ee4685defe971bd5904acf490c26be21214a2bd16189e152a1b3dafb4`).
- `anchorObserved` is factually exact: raw `<meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c"
  name="revision">`; raw `<time class="dt-updated" datetime="2026-10-20">20 October 2026`; `Status: CG-DRAFT`
  in `index.bs`; and the row anchor cell does record `CG-DRAFT 2026-10-16, revision f14762e6`.

## 4. Source identity / anchor / teaches — held, drifted, unreachable

| Dimension | Result | Evidence |
|---|---|---|
| Source identity | **held** | Same URL, HTTP 200, `<title>WebMCP</title>`, "Draft Community Group Report", Abstract unchanged. |
| Anchor at the live URL | **drifted** (disclosed) | Served revision `51ed7565` (commit `2026-10-20T14:57:14Z`) and `dt-updated 2026-10-20` vs row cell `f14762e6` (commit `2026-10-16T16:30:24Z`). `grep -c f14762e6 body` = 0; `grep -c 51ed7565 body` = 1. Receipt records this in `anchorObserved` (`S020.json:20`); knowledge note §4 line 118 and §5 line 127 disclose it; no superseding row (round policy: moving anchors are not drift). |
| Anchor revision itself | **held in the repository** | `GET raw.githubusercontent.com/webmachinelearning/webmcp/f14762e6/index.bs` → HTTP 200, 23319 B, sha `eab56a31bc3b3934308f449587929809d04d2d47d3c10a165d3a0a197258c23e`; line 12 is the exact Abstract sentence, line 5 `Status: CG-DRAFT`. `GET …/51ed7565/index.bs` → HTTP 200, 24247 B, sha `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`; line 13 same sentence, line 5 `Status: CG-DRAFT`. |
| Teaches | **held** | Abstract + status text in the fetched body and in the committed excerpt; `Status: CG-DRAFT` at the anchored and live source revisions. |
| Unreachable | **none observed** | 200 for the page URL (both fetches), the API commit lookups, and both raw `index.bs` revisions. |

### Immutable availability vs live product freshness

The C1 claim does **not** conflate them as written. `corpus/lessons/round-18.md:12-15` says C1 "counts
round-specific integrity-checked recheck receipts, not overdue rows or current product support" and that
S029 is "hygiene, not live freshness". `corpus/knowledge/source-recheck-round-18.md` §6 limits the receipts to
what the cited documents contain and says the 51 rows "are not a statement of current live product support".
`measure-c1.mjs:471` reports `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable
freshness due-date gate"`. The receipt itself claims only `teachesVerdict: held` for the teaches cell and puts
the revision roll in `anchorObserved`.

The residual is on the registry, not the receipt: `corpus/SOURCES.md:34` still displays `f14762e6 / 2026-10-16`
and the live URL no longer serves that revision. A reader who cites the row anchor alone would cite a revision
the URL does not serve; the receipt/note disclose this, and the anchored commit is still retrievable and teaches
the same sentence. The claim must therefore be read as "the quoted sentence is present in the live source on
2026-10-20 and in the anchored commit", not as "the row's anchor is the served identity". That distinction is
disclosed, so it is not a falsification of C1; it is the finite limit the integration seat should keep attached
to S020.

## 5. Contract checks and counter

`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`, exit 0:

```
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,...,"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

At REV the receipt directory has 51 `.json` + 51 `.excerpt.txt` (`git ls-tree -r --name-only` counts). S020 is
accepted: schema, row present and not superseded, `rowUrl` verbatim in the source cell, 64-hex sha, 13-word
quote equal to `quoteWords`, quote in the committed excerpt, excerpt sha, `quoteFound: true`, `fetchedAt` on
2026-10-20, `teachesVerdict: held`, `httpStatus: 200`, producer sha equal to the REV blob. `eligible_rows:58`
counts the seven rows opened this round (S058–S064), which are outside the baseline-51 target; it is not a
missing S020 receipt.

### Finite defect found (non-blocking, documentation only)

`S020.json:7` renders the argv as a string, but that string is not shell-parseable:

```
cmd="curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://webmachinelearning.github.io/webmcp/'"
bash -n -c "$cmd"    # exit 2: syntax error near unexpected token `('
```

The producer's actual call passes the user agent as one argv element (`recheck-fetch.mjs:96`), and
`measure-c1.mjs`'s `--live` uses its own `CURL_USER_AGENT` argv (`liveCheck`, line 380 onward), so the
measurement is unaffected; only literal replay of the `command` field fails. This affects every HTTP receipt
rendered the same way, not S020's evidence uniquely.

## 6. Not done / limits

- I did not run `measure-c1.mjs --live` (it re-fetches 50 URLs); my own fetch is the S020 live check and is
  stronger because it compared the complete body digest, not only quote presence.
- S029 is not in this seat's scope and no network was used for any own-work source. For S020 no alternative
  rendering was needed: the quote is present in the first fetch and in the raw HTML contiguously.
- GitHub API and raw GitHub fetches were GET-only, used for commit dates and anchored `index.bs` identity; no
  credential or session content.
- The registry anchor cell is stale by design (SOURCES append-only); this report does not repair it.

Files written (absolute):

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS020.md`

Transient probe directory `/tmp/tabi-r18-lives020` (body, probe.mjs, two commit JSONs, two `index.bs` files)
was removed after extraction; all digests and commands above reproduce it.
