VERDICT: ISSUES

# LiveS007 — C1 receipt S007 (MDN "Create a WebDriver BiDi connection")

The receipt's counted contract fields all verify against an independent 2026-10-20 fetch and the
committed bytes: the fetched body is **byte-identical** to the receipt (full sha256 match), the quote
is present exactly once at the recorded normalized offset, a from-scratch excerpt rebuild is
byte-identical to the committed excerpt, producer digest and row binding match, and the row's
`teaches` is genuinely supported by the fetched body. `held` is the correct verdict; there is no
drift and no unreachable case.

The ISSUES verdict is **one reference-drift inside the receipt's free-text `note`** (Finding 1: two
section attributions point at sections that do not contain the cited sentences), plus two adjacent
documentation items (Findings 2–3). None changes any counted field, `c1_rows_rechecked`, or the
existence of the receipt. Severity is documentation/calibration, not a count failure.

## Scope and execution context

- LANE `/home/vgpnk/Projects/shokunin/tabi-shokunin`, measured REV
  `530f40a9bc3f10436161a2af1ca0fe9bffffc004`, baseline B
  `2bff864fdfee684ddbcd066cc8e735adaba2735c`.
- Read-only sandbox clone: `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-liveS007-scout`
  (exit 0). In the clone, `git rev-parse --verify refs/heads/master` → `530f40a9bc3f10436161a2af1ca0fe9bffffc004`;
  the live lane `refs/heads/master` also reads `530f40a9…c004` (read-only `git -C LANE rev-parse`). Lane
  `git status --porcelain` showed only `?? .ufo/waves/round-18/w2/`; no lane Git/jj write was made.
- Fetch workspace `/tmp/tabi-r18-liveS007-fetch` (private `/tmp`, extra-LANE). No producer main() was run;
  the producer's exported `decodeBody()`/`normalize()` were imported from a `/tmp` copy only.
- Host tools used as found: `node v24.21.0`, `curl 8.23.0 (x86_64-pc-linux-gnu) libcurl/8.23.0 …`.
  No install or upgrade; no pacman transaction.

## Attacked artifact at REV

- Receipt `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S007.json`;
  committed blob and working-tree bytes both `27cc6fca21b420ff2ae962f08fa6b1dd1866b7a03330664c922d90b957ad4c36`
  (`git show REV:… | sha256sum` vs `sha256sum`; identical).
- Excerpt `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S007.excerpt.txt`;
  sha256 `63a490f0784b5cbb11205abe4462b4579e218c11610464698c06b4e1966bce51`, 1302 bytes
  (= receipt `excerptSha256`; committed blob identical).
- SOURCES row at REV:
  `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md:21` —
  `| S007 | Create a WebDriver BiDi connection — MDN — https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection | docs | B | WebSocket bootstrap paths and engine-specific launch guidance | MDN content commit f83c12ab, §Launching the browser, §Getting the WebSocket URL | How a client obtains a BiDi WebSocket and why direct Chromium launches need an extra BiDi layer | mined | 2026-10-19 | 90d | corpus/knowledge/webdriver-bidi-capability-matrix.md |`.
  `rowUrl` occurs verbatim in the `source` cell; the row is not in the superseded set; no row at REV has
  `teaches` starting `supersedes S007 —` (`grep -c` → `0`).
- Original quote source `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/kaika-fleet-round-1.md:50`:
  `"The client and the browser communicate using the WebDriver BiDi protocol over a WebSocket connection." — introduction | 0a3b26cf…e2d4`.
  The quote string is exact and the recorded location "introduction" matches the fetched page (first body
  paragraph after the H1).
- Producer `.ufo/waves/round-18/recheck-fetch.mjs` at REV and on disk:
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (= receipt `producerSha256`).

## Independent fetch (exact argv, observed output)

Primary, identical to receipt's canonical argv
(`/tmp/tabi-r18-liveS007-fetch`; 2026-10-20 after 20:00Z):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code} %{size_download} %{url_effective}\n' \
  'https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to_Create_BiDi_connection'
```

Observed: `200 17133 https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to_Create_BiDi_connection`,
curl exit `0`. `%{size_download}` is the compressed transfer size; `--compressed` writes the decoded body,
and the saved body is **158088 bytes**,
sha256 `b7a0850e730f3e6ce82942b8f90338169e79621aaadd1f4255df95af7672b038` — **exactly** the receipt's
`bytes` (158088) and `sha256`. No redirect (`url_effective` = requested URL).

Alternate fetch mode (the round-1 Gate method, `corpus/lessons/kaika-fleet-round-1.md:39`:
`curl -sL --max-time 30 '<url>' | sha256sum`) returned the same
`b7a0850e730f3e6ce82942b8f90338169e79621aaadd1f4255df95af7672b038` (exit 0). Two responses with
different UA/Accept-Encoding argv on 2026-10-20 are byte-identical, so this page did not vary per request
on the measurement day.

Decode per receipt `html-text`, using the producer's exact decoder/normalizer (imported from a `/tmp`
copy): normalized length `6747`; quote at offset `1983`, occurrence count `1` (receipt `quoteOffset` 1983).
Excerpt rebuilt with the producer's exact slice rule (`at-600 … at+len+600`, plus trailing `\n`): window
`1383..2684`, 1302 bytes, `cmp` against the committed excerpt → **byte-identical**.

## Field-by-field comparison (receipt vs independent fetch/committed bytes)

| Field | Receipt | Independent observation | Result |
|---|---|---|---|
| `schema` | `tabi-source-recheck-v1` | parsed | held |
| `row` | `S007` | present in SOURCES at REV, not superseded, one receipt | held |
| `rowUrl` / `url` | MDN page URL | occurs verbatim in row `source` cell; fetched URL identical | held |
| `httpStatus` | `200` | `200`, curl exit 0 | held |
| `bytes` | `158088` | decompressed body `158088` (`%{size_download}` 17133 compressed) | held |
| `sha256` | `b7a0850e…2b038` | same full digest | held (byte-identical, stronger than required) |
| `quoteWords` / `quote` | 15 / 15 words | producer `wordCount` equivalent 15; ≤25 | held |
| `quoteFound` / `quoteOffset` | true / 1983 | found once at 1983 | held |
| `fetchedAt` | `2026-10-20T19:06:14.208Z` | on 2026-10-20 (UTC); page re-fetch stable same day | held |
| `excerptSha256` | `63a490f0…ce51` | rebuilt excerpt sha256 identical, 1302 B | held |
| `producerSha256` | `f2ba0033…a360` | REV blob and on-disk file identical | held |
| `anchorObserved` | commit `f83c12ab…`, modified `2026-03-24`, two sections present | all four facts present in fetched bytes (below) | held |
| `teachesVerdict` | `held` | `teaches` supported by fetched body; see below | held, note has misattributions |

Committed-input counter at REV (`/tmp/tabi-r18-liveS007-scout`; exit 0):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

S007 is among the 51 accepted receipts (`rejected: []`).

## Source identity and anchor: held

- Raw body byte `115575` contains `f83c12ab41865e0e195dd36ad9cdcad511a36957`; the same page-report
  metadata carries `Document last modified: 2026-03-24T19:54:02.000Z` at byte `114285` (percent-encoded
  `Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2Ff83c12ab…` in the RSC payload).
  The anchor cell's `f83c12ab` and the observed `2026-03-24` are therefore both grounded in the fetched
  bytes, not inferred.
- Normalized section headings: `Launching the browser` at `2805`; `Getting the WebSocket URL` at `3394`;
  `Connecting to the WebSocket endpoint` at `3839`. No drift, no unreachable; no superseding row needed.

## Teaches: what the quote alone proves, and what the body proves

The 15-word quote is the article's transport premise. It supports "the client and browser communicate
over a WebSocket", **not** the second half of the row's `teaches` ("why direct Chromium launches need an
extra BiDi layer"). The fetched body does support both halves:

- normalized `2232`: "the WebDriver client sets the webSocketUrl capability to true …" (bootstrap path 1);
- normalized `2470-2620`: "In the other method, the WebDriver client starts the browser from the command
  line by passing the required flag and the desired port. This method works with Firefox directly;
  however, **Chromium-based browsers require the additional Chromium BiDi wrapper package.**" (bootstrap
  path 2 + the Chromium extra layer);
- normalized `2914` (`§Launching the browser`): `--remote-debugging-port` flag/port guidance;
- normalized `3468` (`§Getting the WebSocket URL`): `ws://127.0.0.1:PORT/session`.

Both halves of the teaches claim are inside the **committed excerpt window 1383..2684**: the
`webSocketUrl` sentence and the Chromium-wrapper sentence occur in `S007.excerpt.txt` (counts 1 each).
So `teachesVerdict: held` is substantively correct and checkable from committed bytes. The quote alone is
insufficient, but the excerpt is not.

### Finding 1 — S007.json:22 `note` misattributes two sentences to sections that do not contain them

Receipt text (`corpus/evidence/round-18/source-recheck/S007.json:22`):

> "Held: §Launching the browser gives --remote-debugging-port and states Chromium-based browsers require
> the additional Chromium BiDi wrapper; §Getting the WebSocket URL gives ws://127.0.0.1:PORT/session and
> the webSocketUrl-capability path, so both halves of the row teaches are still grounded."

Finite counterexamples in the same fetched body that the receipt hashes:

1. `§Launching the browser` body is normalized `2805..3394`. It gives the flag ("launching it with the
   `--remote-debugging-port` flag", port 9222/0, `firefox --remote-debugging-port 9222` examples) but it
   contains **no "Chromium" token**. The wrapper sentence is in the introduction at normalized `2591`
   (`Chromium BiDi wrapper` token appears only at `2591` as a statement and at `4285` as a See-also link).
2. `§Getting the WebSocket URL` body is normalized `3394..3839`. It gives `ws://127.0.0.1:PORT/session`
   (normalized `3468`) but contains **no `webSocketUrl` token**; that token occurs once, at `2232`, in the
   introduction.

Effect: the receipt's counted fields and `teachesVerdict: held` remain correct — both cited facts are in
the fetched body and in the committed excerpt — but the `note`'s section map is wrong in both clauses. An
auditor who trusts the note would look in the wrong sections, and a reader of the excerpt alone cannot
recover the `--remote-debugging-port`/`ws://` literals because both lie outside the excerpt window.
Recommended repair: do **not** rewrite the committed receipt bytes (evidence integrity); add a correction
line (round-18 Corrections or the C1 note's limits) stating that the two paths and the Chromium-wrapper
requirement are in the **introduction**, `§Launching the browser` supplies the launch flag, and
`§Getting the WebSocket URL` supplies the `ws://` endpoint. Severity: reference/documentation; no count
change.

## Main claim: live freshness vs immutable availability

- **S007 is a live source, not an immutable-availability substitute.** It is a rolling `developer.mozilla.org`
  page (`url` = `rowUrl`, no commit/tag in the URL). The independent 2026-10-20 fetch returned HTTP 200 with
  a body byte-identical to the receipt, and the page's own commit metadata still names `f83c12ab…`.
  The live recheck therefore supports both the text claim and the identity claim on its measurement date.
- **The digest is a content snapshot, not a freshness clock.** `sha256` reproduces today but cannot certify
  future availability or the fetch time; the counter itself labels its scope
  `"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"` (output above), and the
  note's §6 limits say quote presence is not claim truth and a digest pins one response
  (`corpus/knowledge/source-recheck-round-18.md:140` and `:143`). For S007 the live fetch was actually
  repeated, so this is not a merely-immutable "availability" claim.
- **Aggregate wording edge (not an S007 failure).** The headline 51 is `held:50` + `own_work:1`; the own-work
  row is S029 (git blob at `837b33a…`; cross-check below). The round-18 lesson already qualifies it:
  `corpus/lessons/round-18.md:14` — "Own-work S029 is explicitly hygiene, not live freshness." The PLAN
  sentence `.ufo/waves/round-18/PLAN.md:15-16` says "Source rows re-verified against their live source …
  target 51", which is literally true for 50/51 and qualified for S029. Recommendation for the final
  SCORECARD/claim text: "51 rows rechecked (50 live-HTTP + 1 own-work git blob)". No confusion exists for
  S007 itself.
- **Own-work cross-check via git, not network** (as required for S029):
  `git cat-file -t 837b33a3988ebeea7f6b4ef5c04698da88909a73` → `commit`;
  `git show 837b33a…:corpus/evidence/round-13/aria/receipt.json | sha256sum` →
  `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, equal to `S029.json.sha256`
  (bytes `97073`, `httpStatus: null`, `quoteFound: true`). This seat did not fetch S029 over the network
  and did not attack the S029 receipt's quote/teaches fields.

## Finding 2 (adjacent, not the receipt): C1 note's registry count is stale at REV

`corpus/knowledge/source-recheck-round-18.md:11` says "`corpus/SOURCES.md` has 57 rows (S001–S057)".
At REV the registry has **64** rows: `grep -o '^| S[0-9]\{3\}' corpus/SOURCES.md | sort -u | wc -l` → `64`
(S001–S064). S058–S064 sit at `corpus/SOURCES.md:72-78`, i.e. inside `## Registry` (starts `:11`, next
heading `## Paths` at `:80`). The sentence is true only when read as "at baseline B"; it is false as a
present-tense statement about the file in the same commit. The counter's `eligible_rows:58` = 64 − 6
superseded, versus the cited `c1_rows_rechecked:51`; this denominator divergence is already reported from
the counter side in `.ufo/waves/round-18/w2/ReRunC1.md` (it did not quote the note line). Recommended
repair: qualify the note sentence with "at baseline B" (or update it to 64 rows / 58 non-superseded /
51 receipts). Severity: documentation count; no receipt or count change.

## Original quote source and the 2026-10-19 digest: verifiable text, unverifiable bytes

- Quote text and location verify: `corpus/lessons/kaika-fleet-round-1.md:50` carries the exact quote and
  "introduction"; today's body has it once at normalized offset 1983, in the first body paragraph.
- The lesson's recorded raw-fetch digest `0a3b26cf…e2d4` (method at `:39`: `curl -sL --max-time 30 '<url>' | sha256sum`)
  is **not reproducible** from the current page: running that exact method today prints
  `b7a0850e730f3e6ce82942b8f90338169e79621aaadd1f4255df95af7672b038`. The round-1 raw body was not retained
  (`grep -rn '0a3b26cf'` in the lane matches only the lesson row `:50` and the w1 seat report `:61`), so the
  2026-10-19 bytes cannot be checked. This is expected for a live page and is **not** a receipt defect; the
  receipt does not assert the round-1 digest.
- Observation on the w1 seat's explanation: `.ufo/waves/round-18/w1/Recheck03.md:61-66` says "MDN serves
  per-request build chrome, so the Gate sha is not reproducible from a fresh GET." That directive is
  broader than the evidence: two fetches today with different argv (different UA / Accept-Encoding) returned
  identical bytes, so the delta is not observed per-request variation on 2026-10-20. [INFERENCE] the delta
  is a deploy/served-bytes change between 2026-10-19 and 2026-10-20 (or a different fetch variant then).
  The next sentence in that report already labels the byte-delta attribution `[INFERENCE]`; this note
  narrows that inference, it does not change the receipt.

## Limits and unrun checks

- Counter `--live` was not run across the 51 receipts; instead this seat performed the stronger per-row live
  fetch for S007 itself (exact argv, full digest, quote location). No claim is made here about the other 50
  receipts.
- No browser, no fixture-owned loopback, no page tool, no public-source access beyond the one GET above; no
  credentials/sessions. No S029 network fetch (git object read only).
- No lane production, fleet, sibling, Git index or jj write. Only the private `/tmp` clone/workspace and this
  report were written. No producer `main()` execution and no receipt generation.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS007.md`
