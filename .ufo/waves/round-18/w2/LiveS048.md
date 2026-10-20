VERDICT: ISSUES

# LiveS048 — C1 receipt S048, wave-2 falsification

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; B `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured candidate REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git cat-file -t` → `commit`; `refs/heads/master` = REV). Read-only: no LANE writes, no git writes, no subagents, no installs (`node v24.21.0`, `curl 8.23.0` already present). All probe bytes went to `/tmp/tabi-r18-s048-MsBX8F`.

## Bottom line

- **The S048 receipt holds every declared C1 rule.** The counter at REV accepts it (`rejected: []`, `c1_rows_rechecked: 51`); the counter's `--live` path re-fetches and holds it (`live_held: 51/51`, no S048 failure).
- **Source identity / anchor / quote / teaches held.** Same URL with no redirect, canonical link matches, HTTP 200, `last-modified` and in-page footer both 2026-05-12, both cited ids present, quote at the same normalized offset (8241) and same raw fragment byte (167237), and the live-derived excerpt is byte-identical to the committed excerpt.
- **Raw-body digest drifted, as expected for this page.** Four distinct digests at the same 191224-byte length were observed on 2026-10-20; the article text is stable while the CSP nonce and feature JSON vary per response. The C1 contract correctly does not require raw equality here.
- **No conflation of source availability with live product support** in the C1 claim: the lesson Gate, the note §6, and the counter's own `freshness_scope` all disclaim current product support.
- **Two concrete, low-severity defects found** (F1 recorded `command` is not shell-reproducible; F2 the note's present-tense row count is stale at REV and the counter denominator is revision-relative). **Neither changes the count.** F3/F4 are precision / carried-limitation notes.

## 1. Fetch evidence

Command (first fetch; refetches use the same argv with a different `-o`):

```
curl -sSL --compressed --max-time 90 -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -o /tmp/tabi-r18-s048-MsBX8F/body \
  -w 'HTTP=%{http_code} SIZE=%{size_download} TIME=%{time_total}\n' \
  'https://developer.chrome.com/docs/devtools/application/webmcp'
```

Observed: `HTTP=200 SIZE=25978 TIME=0.378243`; on-disk body **191228 B**. `SIZE` is the compressed wire size under `--compressed`; the table below is the decompressed on-disk size.

| fetch | on-disk bytes | sha256 |
|---|---|---|
| receipt (fetchedAt 2026-10-20T19:06:13.648Z) | 191224 | `b4a79911f2da4d67355d50b954c84fed70cd22064de66d41a214b07a4a3f6c1f` |
| my `body` | 191228 | `c527bc2ebd7ac2d61bf079889eec82284b4934625ff491b39417037778591a06` |
| my `b1` | 191228 | `aaca8b1c85326c784eec41af0e16ebcddf47171d0dbdf81819dbe24f3c0ac4cf` |
| my `b2` | 191224 | `d300b1fa7380d6120e0441a1fa30c881ef5609126fc0922f189810e86369048f` |
| my `b3` | 191228 | `5b02f0eb0a146ec32b6ceb90ae4b4c2a089c38f428f8666411fd4e4c7ead504c` |

The seat note `.ufo/waves/round-18/w1/Recheck23.md:33-37` additionally records three same-day 191224 B digests: `ab0646408cb30bbf9cb91406fc342b25cf6d44061282ac0d4fc38691a7be7694`, `6b1293e29d06e3c8975c801062babe373ff8a645e267853f8284ffb1f7c35c76`, and the receipt's `b4a79911…6c1f`, plus round-17's `9bd94f41…87e5` (the row anchor). So at least **four distinct 191224 B bodies** exist on 2026-10-20; byte length is not an identity either.

Headers (HEAD, same UA): `HTTP/2 200`, `last-modified: Tue, 12 May 2026 07:00:00 GMT`, `content-length: 191228`; CSP header carries `'nonce-hGfm…'`, body carries `nonce="kHkd…"`. Redirect probe: `code=200 effective=https://developer.chrome.com/docs/devtools/application/webmcp redirects=0`. Canonical: `<link rel="canonical" href="https://developer.chrome.com/docs/devtools/application/webmcp">`.

## 2. Quote location and excerpt

Using the producer's own `decodeBody(..., 'html-text')` and `normalize()` (imported read-only from `.ufo/waves/round-18/recheck-fetch.mjs`; no receipt written):

- normalized text length 12187; `indexOf(quote)` = **8241**, equal to `corpus/evidence/round-18/source-recheck/S048.json:17`.
- raw fragment `The result of the invocation` = byte **167237**, equal to the round-17 dossier R2 byte (`.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md:68`).
- the full quote is **not raw-contiguous**: the served HTML has `In Progress,\nor Error.` (newline at byte 167300). It becomes contiguous only under the declared whitespace normalizer. `quoteWords` = 11 (≤25), equal to `S048.json:14`.
- live-derived excerpt (`text.slice(at-600, at+q.length+600) + "\n"`) sha256 = `be6a9469e8e4b879cac0ff5ebc63c04833e2763078096267cec7617cab248159`, byte-identical to `corpus/evidence/round-18/source-recheck/S048.excerpt.txt` (1275 B; `diff` empty). `S048.json:19` equals this digest.

## 3. Does the quote actually support `teaches`?

Row `teaches` (`corpus/SOURCES.md:62`): "DevTools invokes a chosen tool manually with edited parameters and logs a status of Completed, Canceled, In Progress or Error, so invocation is a documented client operation that leaves a record".

- The quote itself — "The result of the invocation (Completed, Canceled, In Progress, or Error.)" — states the **Status field vocabulary**. In context it sits under "The Invoked tools log provides a persistent record of tool interactions", so it also supports "leaves a record".
- The quote alone does **not** state manual invocation or edited parameters. The same page's §Test tools manually does, verified in the live body: "enter or adjust parameters in the input fields. Click Run tool ." and "if you select an invoked tool, the manual test area opens with the parameters from that session already pre-populated."
- `S048.json:22` (the receipt `note`) cites exactly these two sections; the row anchor names both ids; both `id="test-tools"` and `id="invoked-tools"` are present in the live body.
- The counter never evaluates `note` or the truth of `teaches`; `teachesVerdict` is author-declared. The note says this explicitly at `corpus/knowledge/source-recheck-round-18.md:140` ("It does not show … that the quote supports it"). On my read, `held` is correct, but it rests on page text adjacent to the quote, not on the quoted sentence alone.

## 4. Availability vs live product freshness

- PLAN C1: "Source rows re-verified against their live source with a committed recheck receipt: 0 → N (target 51 = every row not superseded at B)."
- `corpus/lessons/round-18.md:12`: "C1 counts round-specific integrity-checked recheck receipts, not overdue rows or current product support."
- `corpus/knowledge/source-recheck-round-18.md:141`: "the 51 rows are not a statement of current live product support."
- The counter output carries `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"`.
- The only product-behaviour use of S048 is `corpus/knowledge/webmcp-invocation-round-17.md:89` ("DevTools UI adds 'In Progress' (S048)") versus the protocol enum; that is a UI-vocabulary contrast, not a product-support claim, and C1 does not extend it.
- The note also records the page as `living_live` and says it "can change between fetches; the 2026-10-20 digest pins one response only" (`source-recheck-round-18.md:111`).

Conclusion: **no conflation** in the declared claim. The receipt is a one-day source-content check; it is not, and does not claim to be, a statement that the documented DevTools feature is present in the current build.

## 5. Findings

### F1 [low, producer-wide] The recorded `command` is not shell-reproducible

- `corpus/evidence/round-18/source-recheck/S048.json:7` records `-A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18` with no quoting.
- The field is built at `.ufo/waves/round-18/recheck-fetch.mjs:98` by space-joining the argv; the actual `spawnSync` argv at `:95` carries the UA as a single element.
- `measure-c1.mjs:233-234` reconstructs the same string and `:356` **requires exact equality**, so the counter enforces the unquoted rendering rather than a runnable command.
- Finite counterexample: running the exact field under `/bin/bash` → **exit 2**, `bash: -c: line 1: syntax error near unexpected token '('`.
- Effect: a human re-verifier cannot replay the recorded command as written. The counter's `--live` path rebuilds the correct argv itself (`measure-c1.mjs:399`) and observed 51/51 live-held, so the count is unaffected.
- Repair (round 19): shell-quote the UA element, or emit `argv` as a JSON array; changing the producer digest requires re-emitting receipts, so this is not a round-18 in-place edit.

### F2 [low] The note's present-tense row count is stale at REV; the counter's denominator is revision-relative

- `corpus/knowledge/source-recheck-round-18.md:11` says: "`corpus/SOURCES.md` has 57 rows (S001–S057)."
- At REV: `git show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} '` → **64**; at B → **57**. `git diff B REV -- corpus/SOURCES.md` adds exactly S058–S064 (7 rows).
- Counter at REV: `c1_rows_rechecked: 51`, `eligible_rows: 58` (`measure-c1.mjs:465`), `held: 50`, `own_work: 1`. At B: `0 / 51`.
- The note's §2 table (`:42`) reports only the B-side `51 / 0`; the 51-of-51 target is stated in the PLAN and `round-18.md:12`, not in the sentence at `:11`.
- Effect: at the revision carrying the note, the sentence is false and the counter's own ratio reads 51/58. The count is not wrong; the reporting is ambiguous. Separately, the counter's `held: 50` excludes own-work (`measure-c1.mjs:467-468`), while the note's "`teachesVerdict` = held | 51" counts all receipts; both are correct but the split is not explained.
- Repair: scope the sentence to B ("at baseline B, 57 rows") and/or expose a `target_at_B` / explain `held` vs `own_work` in the counter output.

### F3 [informational] `quoteOffset` unit is unlabelled

- `S048.json:17` → 8241 is a **normalized-text character offset**, not a byte offset; the raw fragment byte is 167237 and the full quote is split by a newline at byte 167300.
- `measure-c1.mjs:374` checks `quoteOffset` only for S029; for S048 it is unvalidated free data.
- Effect: a re-verifier seeking byte 8241 lands in the HTML head. No count effect.
- Repair: rename to `quoteOffsetNormalized` or add `quoteByteOffsetFragment`.

### F4 [carried, disclosed] Row anchor digest and receipt digest differ at the same 191224 B

- `corpus/SOURCES.md:62` anchor: `sha256 9bd94f4182619b9eb7bc83c127d58a4de41da691e25ca867ffa3f419d83a87e5` (191224 B).
- `S048.json:9-10`: 191224 B, `sha256 b4a79911…`.
- Today: four distinct 191224 B digests (seat note `ab064640…`, `6b1293e2…`, `b4a799…`; my `d300b1fa…`) plus 191228 B bodies (`c527bc2e…`, `aaca8b1c…`, `5b02f0eb…`). The quote sits at normalized 8241 / raw fragment 167237 in every fetch.
- Disclosed at `source-recheck-round-18.md:143` and `corpus/lessons/round-17.md:67` ("digests bind one snapshot only"). The C1 contract does not require raw equality, and the receipt is valid. Residual: the row's anchor cell still presents the digest without an inline "single response" label; carried from round 17, not repaired by C1.
- No repair is required by the declared C1 contract; if desired, label the row digest as a single-response snapshot in a future append-only row.

## 6. Counter outputs (exact)

```
$ node .ufo/waves/round-18/measure-c1.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin 530f40a9bc3f10436161a2af1ca0fe9bffffc004
c1_rows_rechecked 51  eligible_rows 58  held 50  drift_superseded 0  own_work 1
rejected []
row_classes.url {"immutable_pinned":17,"living_live":46,"own_work":1}
freshness_scope "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"
counterSha256 df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234
```

```
$ node .ufo/waves/round-18/measure-c1.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --live 530f40a9bc3f10436161a2af1ca0fe9bffffc004
c1_rows_rechecked 51  eligible 58  live_checked 51  live_held 51  failures 0  not_http []
```

```
$ node .ufo/waves/round-18/measure-c1.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin 2bff864fdfee684ddbcd066cc8e735adaba2735c
c1_rows_rechecked 0  eligible_rows 51  rejected []
```

Aggregate receipt claims re-derived independently (not copied from the note): 51 JSON files; one `producerSha256` (`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equal to `git show REV:.ufo/waves/round-18/recheck-fetch.mjs | sha256sum`); `teachesVerdict` all `held`; `quoteFound` all true; decode `{html-text:32, none:13, base64:5, pdf-text:1}`; HTTP `{200:50, null:1}`; max `quoteWords` 24; excerpt sha 51/51; `fetchedAt` all on 2026-10-20; status over the 51 rows `{mined:40, queued:6, rejected:5}`; tier `{A:42, B:4, C:5}`; rejected rows S026,S027,S038,S040,S057; `quoteSource: new` 4. All match note §2/§3.

## 7. S029 (secondary; `git show`, no network)

`git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json` → **97073 B**, sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, equal to `S029.json:10` and `bytes` 97073. The receipt's quote is present; the counter accepted it, including its `quoteOffset` and excerpt derivation (`measure-c1.mjs:370-375`). This is own-work hygiene, not live freshness, as `source-recheck-round-18.md:147` says.

## 8. Limits

- No body from the 19:06:13Z fetch was retained; I cannot prove that exact body existed. Corroboration: the live-derived excerpt is byte-identical, the normalized offset is identical, 191224 B is reachable today, and four distinct 191224 B digests exist. `[INFERENCE]` the receipt's body was a same-article response with a different nonce/feature array.
- One host, one UA, one day; no browser launched, no WebMCP tool invoked, no product behaviour tested.
- `--compressed` means curl's `SIZE` is wire size; on-disk sizes above are decompressed.
- No installs/upgrades; `node v24.21.0`, `curl 8.23.0`.
- I did not run `recheck-fetch.mjs` into production; only the counter (read-only, tmp dirs) and direct `curl` into `/tmp`.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS048.md`
