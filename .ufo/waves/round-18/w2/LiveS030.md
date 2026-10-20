VERDICT: PASS

# C1 receipt S030 — falsification (TabiR18.LiveS030-2)

Attack axes: (1) receipt integrity/contract, (2) live source identity and anchor, (3) whether the
quote supports the row's `teaches`, (4) whether the C1 claim confuses immutable availability with live
product freshness. S029 own-work pin checked from git, no network. Lane read-only; producer not run;
network GET only; all scratch under `/tmp/tabi-s030-$$`.

PASS means: C1 receipt S030 is contract-valid, live-reproduced byte-for-byte, and correctly counted.
The two claim-wording caveats in §7 (F1, F2) do not falsify the receipt or the committed C1 scope.

## 1. Independent re-fetch

Command (exact, in a private `/tmp` dir; `$$` expanded at run time):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code} %{url_effective} %{size_download} %{time_total}\n' \
  'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/README.md'
```

Observed (exit 0):

```
200 https://raw.githubusercontent.com/webmachinelearning/webmcp/main/README.md 13477 0.267089
```

```
body bytes 37575
body sha256 184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6
```

Receipt (`corpus/evidence/round-18/source-recheck/S030.json`):
`httpStatus 200`, `bytes 37575`, `sha256 184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6`.
Bytes and full digest are identical; this is not merely quote presence.

Transfer-size note: `%{size_download}` is 13477 because the content is gzip-compressed
(`content-length: 13477`, `content-type: text/plain; charset=utf-8`). The receipt's `bytes`/`sha256`
are the decoded file, which is what the producer hashes (`recheck-fetch.mjs:99-100` reads the decoded
`-o` file). Two representations of the same body, for the record:

```
raw gzip body sha256 b5af7da8853e1afd4aead258f1d48405802d25ca4de296da1be6bd3c7e170083 (13477 B)
ETag                     W/"0d49f5df8565209a7d3072f67262bbbc197969b8f0bf5a357b28230f75e2cd94"
```

Neither equals the body digest `184c519a…fc7d6`, so an ETag-vs-`sha256` or transfer-byte-vs-`bytes`
comparison would falsely report drift. `gzip -dc body.gz | cmp - body` → equal.

Quote location (fresh body):

```
quote            "but it is not part of the specification at this time."
raw occurrences  1
raw byte offset  18797
raw line         319   (README.md:319; section heading "### Future Exploration: Declarative API" at 315)
quoteWords       11    (matches receipt 11)
normalized offset 18011 (matches receipt quoteOffset 18011)
normalized length 36621
normalized sha256 cd548295cdcae17e452d3cec162e85fdf6e901554ebc34b648d0aa250524a62f
```

Excerpt: recomputed from the fresh body with the producer's window
`text.slice(max(0,at-600), at+len+600)` (`recheck-fetch.mjs:106-107`):

```
bytes 1254
sha256 30c9187b611b6bcdd6ad86ddd64bcdbe67dcff5d1ce935f2118fac0d9542f73a
receipt excerptSha256 30c9187b611b6bcdd6ad86ddd64bcdbe67dcff5d1ce935f2118fac0d9542f73a
byte-identical: yes (committed S030.excerpt.txt equals derived bytes)
```

Quote source: `corpus/lessons/round-16.md:40`. At both B (`2bff864f…`) and REV (`530f40a9…`) that
line is the S030 table row containing this quote and "README.md:319 at `cb3d1696`". The frozen lesson
file is byte-identical at B and REV: sha256
`9d9197e58d3091dc883a785402e1baf30a8ec218b540e6b289c2fa3bef2f3496`.

Receipt commit state: `git show REV:corpus/evidence/round-18/source-recheck/S030.json` sha256
`6ed3b395a4e247f9b43ec21c53ea09f2d8aa655f1c2010c061f58dfe2f84e7fc`, identical to the working file.
Receipt `fetchedAt 2026-10-20T19:05:42.099Z` matches file mtime `2026-10-20 16:05:42.099 -0300`
(= 19:05:42.099Z), so the timestamp is corroborated by the working-tree mtime (mtime itself is not a
git-recorded attribute; the committed bytes of the receipt are the durable record).

## 2. Identity and anchor

Live repository pointers:

```
git ls-remote https://github.com/webmachinelearning/webmcp.git HEAD refs/heads/main
51ed75653aaa7f174f8dbe05d1bc327359bbc57c	HEAD
51ed75653aaa7f174f8dbe05d1bc327359bbc57c	refs/heads/main
exit 0
```

GitHub API compare `cb3d16964ab3e92cfd5f09901ed0504373a906e8...51ed75653aaa7f174f8dbe05d1bc327359bbc57c`
(HTTP 200):

```
status ahead, ahead_by 1, behind_by 0, total_commits 1
commit 51ed75653aaa  2026-10-20T14:57:14Z
       "Discuss general agent ecosystem risks and link to agent security guidance (#334)"
files  index.bs  modified  55 changes
```

Contents API `README.md` at both refs: git blob `e28d86f7e18d43946ba5340d87edee8cd46b77ea`, size 37575.
Raw fetch at both refs: HTTP 200, 37575 B, sha256 `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6`
— byte-identical to `main` and to the receipt. So the one-commit anchor delta does not touch README.

Receipt `anchorObserved` says: HEAD `51ed7565…` (2026-10-20T14:57:14Z); row anchor `cb3d1696` is one
commit behind and that commit touches only `index.bs`. Every element reproduced exactly.

Finding: source identity **held** (same git blob/bytes at row anchor and live HEAD). The anchor
*pointer* in `corpus/SOURCES.md:44` ("repo HEAD `cb3d16964ab3e92cfd5f09901ed0504373a906e8`
(2026-10-20)") is one commit behind the live HEAD; this is the moving-anchor case the round note
declares not-drift (`corpus/knowledge/source-recheck-round-18.md:127`), and the receipt records it.
No superseding row is required on this evidence.

## 3. Does the quote support `teaches`?

`corpus/SOURCES.md:44` teaches cell:

> The declarative form API is explicitly outside the specification, so declarative observations are
> implementation evidence, never spec citations

README at the fetched revision, same section:

- 315 `### Future Exploration: Declarative API`
- 317 "WebMCP is currently focused on the imperative `document.modelContext.registerTool()` API
  described above, which is what the specification defines."
- 319 "A declarative counterpart … is being explored separately. Early ideas are captured in the
  [Declarative API Explainer](./declarative-api-explainer.md), but it is not part of the specification
  at this time."
- 321 "Even if a declarative API is added, it would complement rather than replace the imperative API."

The quote supports the present-tense exclusion ("not part of the specification") and, with the
explainer/imperative context, the inference "declarative observations are implementation evidence".
It does **not** entail the absolute "never": the source itself says "at this time" and README:321
explicitly contemplates a declarative API being added. The row's "never spec citations" is a corpus
citation policy that is correct while declarative is outside the spec; it is not a permanence claim
derived from the source. The round knowledge note preserves the qualifier where it cites this row
(`corpus/knowledge/webmcp-chromium-loopback-round-16.md:85` quotes "not part of the specification at
this time"; `:100` says "neither is spec text", present tense).

Verdict on `teaches`: **held as of the 2026-10-20 fetch**, with the bounded-wording caveat in §7 F2.
No present counterexample to the exclusion exists in the fetched bytes; the counterexample is to the
word "never", not to the exclusion itself.

## 4. Main claim: receipt count vs immutable availability / live freshness

Counter (read-only, committed inputs):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
exit 0
```

Observed JSON (single line, unabridged):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

All 51 receipts accepted; `rejected` empty. `eligible_rows` is 58 at REV because the seven rows
opened this round (S058–S064) are in `SOURCES.md` at REV; the PLAN's target is the 51 rows not
superseded at B, which is met.

Composition of the 51 rechecked rows, joined receipt→`SOURCES` at REV (my own reduction; the counter's
`row_classes` covers all 64 rows):

```
living_live       38
immutable_pinned  12
own_work           1   (S029)
distinct body digests among the 51 receipts: 50
shared digest: 184c519af9ed728e…fc7d6 -> S030 and S046 (S046 is the same README pinned at 51ed7565)
superseded rows with a receipt: none
B rows without a receipt: none (the only rows without receipts are the new S058–S064)
```

Note aggregate claims cross-checked against committed bytes: 102 files = 51 `.json` + 51
`.excerpt.txt`; all 51 `rowUrl`s occur in their row's source cell; all 51 producerSha256 =
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`; all excerpt sha256 match; all
quotes occur in their excerpts; `fetchedAt` range 2026-10-20T19:05:36.085Z–19:09:41.018Z; status
40 mined / 6 queued / 5 rejected; tier 42 A / 4 B / 5 C; decode 32 html-text / 13 none / 5 base64 /
1 pdf-text; max `quoteWords` 24. All equal the note's §1–§2 claims.

Answer to the framing question: the committed receipt, the knowledge note, and the counter do **not**
confuse immutable availability with live product freshness:

- `S030` is a live/rolling URL; the receipt pins one response and the quote held on re-fetch.
- The note says "early re-verification" (`corpus/lessons/round-18.md:8`), "Quote presence is not claim
  truth" (`corpus/knowledge/source-recheck-round-18.md:140`), and "the 51 rows are not a statement of
  current live product support" (`:141`).
- The lesson Gate says C1 counts receipts, "not overdue rows or current product support"
  (`corpus/lessons/round-18.md:12`), and calls S029 "hygiene, not live freshness" (`:14`).
- The counter emits `freshness_scope` ("round-18 receipt date 2026-10-20 only; not a reusable
  freshness due-date gate") and the `row_classes` composition.

The only overbroad text is the PLAN's C1 one-liner, "Source rows re-verified against their live source"
(`.ufo/waves/round-18/PLAN.md:15`): 12 of the 51 are `immutable_pinned` and 1 is `own_work`. A final
freshness promotion should state "51 receipts: 38 living, 12 pinned, 1 own-work, fetched 2026-10-20"
rather than "51 live sources". This is a wording caution, not a defect in the receipt or the count.

## 5. S029 own-work pin (git only, no network)

```
git -C LANE show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json
```

- bytes 97073; sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`
  (receipt `b458b351…89b7`; equal).
- byte-identical at B `2bff864f…` (same sha); `837b33a` is an ancestor of REV (`git merge-base
  --is-ancestor` exit 0).
- quote found at normalized offset 74695 (receipt 74695), 17 words; recomputed excerpt exact:
  1382 B, sha256 `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` = receipt
  `excerptSha256`; quote in excerpt.
- recorded structure: `cleanup.server.listeningAfter = true`, `.ok = true`,
  `perWorker[0] = {origin "http://127.0.0.1:40983", listeningBefore true, closed true,
  listeningAfter false, refusedAfterClose true}`; `runtime.node = "26.12.0"`;
  `pin.node = {recorded "24.21.0", minimumMajor 20}`.

The quote directly supports the first teaches clause (aggregate `true` vs per-worker `false`). The
second clause (Node 26.12.0 vs recorded 24.21.0) is in the full blob but **outside** the 600-char
excerpt (the excerpt contains neither `26.12.0` nor `24.21.0`), so that clause rests on the
full-blob digest, not the located quote. The counter's S029 branch (`measure-c1.mjs:16-18`,
`sourceExcerpt` at :238) recomputes offset and excerpt from the pinned blob and would reject a
mismatch; it accepted. No defect.

## 6. S030 contract field check (all true)

`commandMatches` (exact canonical string from `measure-c1.mjs:233-236`), `http200`, 64-hex `sha256`,
`quoteWords 11`, `quoteFound true`, date 2026-10-20, `rowUrlInRow`, `excerptSha`, `excerptName`,
`producerSha256`, `verdictHeld`. Receipt and excerpt are committed at REV and identical to the
working tree.

## 7. Findings and limits

- **F1 (non-blocking, registry wording):** `corpus/SOURCES.md:44` anchor cell names repo HEAD
  `cb3d1696…` while live HEAD is `51ed7565…` (child, 2026-10-20T14:57:14Z; only `index.bs` changed;
  README blob `e28d86f7…` identical at both). Content identity held; the cell's HEAD pointer is stale.
  The receipt records the live HEAD; the round note treats moving anchors as not-drift
  (`knowledge/source-recheck-round-18.md:127`). No superseding row on this evidence.
- **F2 (non-blocking, teaches wording):** `SOURCES.md:44` says "explicitly outside … never spec
  citations"; the source says "not part of the specification **at this time**" and README:321
  contemplates addition. The quote supports the present exclusion, not the absolute "never". The
  corpus note retains the qualifier where it cites the row, so no live misreading was found; the cell
  itself is stronger than its evidence.
- **F3 (count composition):** the 51 receipts are 38 living / 12 pinned / 1 own-work, 50 distinct
  bodies; S030 and S046 share `184c519a…fc7d6`. Do not present the count as 51 independent live
  sources. The counter's `row_classes` and note §6 already disclose this.
- **F4 (replay note, not a validity failure):** the receipt's `command` string is a display string,
  not shell-replayable: the user agent contains spaces and is unquoted, so a literal shell replay
  would treat `(X11;`, `Linux`, `x86_64)`, `tabi-shokunin-recheck/18` as extra URLs. The producer
  actually spawns an argv array (`recheck-fetch.mjs:95`), and the counter rebuilds the same
  unquoted string (`measure-c1.mjs:233`), so this cannot affect the accepted bytes; quote the UA if
  replaying manually.
- **Unrun / limits:** `measure-c1.mjs --live` was not run across all 50 HTTP receipts; only S030 was
  independently re-fetched here. No browser was launched and no WebMCP/product behavior was tested
  (C1 is source-only). The re-fetch is one response from a mutable branch; the digest pins that
  response on 2026-10-20, not future availability. `eligible_rows` (58) is a REV-tree denominator and
  is not the PLAN's 51-row baseline target.

## Files written

/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS030.md
