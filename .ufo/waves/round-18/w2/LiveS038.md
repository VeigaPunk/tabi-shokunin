VERDICT: PASS

# LiveS038 — C1 receipt S038 falsification attempt

Seat: LiveS038-2 (leaf, no dispatch). Date 2026-10-20. LANE
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, candidate REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`, baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. All reads below are of committed
bytes at REV unless a path:line is named; worktree `git status --porcelain` was
`?? .ufo/waves/round-18/w2/` only, and the two S038 blobs I read are byte-equal
between worktree and REV (§4). No lane, fleet, sibling, jj or Git-index write was
made; no producer run; no network write.

## 1. Inputs read

- `corpus/evidence/round-18/source-recheck/S038.json` (receipt).
- `corpus/evidence/round-18/source-recheck/S038.excerpt.txt` (1268 B, one line).
- `corpus/SOURCES.md:52` at REV (S038 row), via `git show
  530f40a9:corpus/SOURCES.md`.
- `corpus/lessons/round-16.md:48` at REV (quote source; byte-frozen at B).
- `.ufo/waves/round-16/drafts/DraftSources.md:59,91` and
  `.ufo/waves/round-16/w2/ReopenS038.md:28-34` (round-16 full-digest record).
- `corpus/knowledge/source-recheck-round-18.md` at REV (sha256
  `f66801cb16ef9ef2c353fb02158bd11bdd052703723db1bb1383191643e13540`; lines 44,
  88, 111-112, 140, 147 read); identical bytes to
  `.ufo/waves/round-18/drafts/source-recheck-round-18.md`.
- `.ufo/waves/round-18/PLAN.md:15-23`, `corpus/lessons/round-18.md:12-14`,
  `LOG.md:1042-1062`, `.ufo/waves/round-18/measure-c1.mjs`,
  `.ufo/waves/round-18/recheck-fetch.mjs` (read only).
- `.ufo/waves/round-18/w1/Recheck19.md` (producer seat's own report).

The S038 row at REV is exactly (cells split on `|`, 11 cells):
`S038 | webmcp-fork CHROMIUM_FLAGS.md — https://github.com/Sgr57/webmcp-fork/blob/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md | community | C | Flag recipe and readiness check for native WebMCP in Chromium | fetched 2026-10-20, §Verification Method 2 line 140 | REJECTED: ... | rejected | 2026-10-20 | on-release | —`.
`rowUrl` occurs verbatim in the row's source cell; status `rejected`; tier `C`;
the row is not in the C1 superseded set (`S004/S039/S047/S049/S050/S053`,
`measure-c1.mjs:23`).

## 2. Independent re-fetch (exact command and observed output)

Run in a private `/tmp` directory; no production path was written.

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'http=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  'https://raw.githubusercontent.com/Sgr57/webmcp-fork/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md'
```

Observed (exit 0):

```
http=200 size=4343 url=https://raw.githubusercontent.com/Sgr57/webmcp-fork/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md
13006 body            # wc -c; 511 lines
351c02db5b16e283b9e59f1a2575c012cda96c51a60467051a1236fe15c7555a  body
```

`size_download` 4343 is the compressed transfer size under `--compressed`; the
written body is 13006 B. A second identical fetch at 2026-10-20T~20:03Z produced
`cmp -s body body2` → `IDENTICAL` and the same sha256, so the receipt's
`sha256`/`bytes` are reproduced across two independent live fetches, not just
once.

Receipt fields compared: `httpStatus` 200 = observed 200; `bytes` 13006 =
observed 13006; `sha256` = observed full 64-hex digest above; `decode` `none`;
`command` matches the counter's canonical argv
(`measure-c1.mjs:356`, `expectedCurlCommand`) apart from the `-o` path, which
the receipt records as `<tmp>/body`.

## 3. Quote location and excerpt reproduction

- Quote: `console.log('modelContext available:', !!navigator.modelContext);` —
  3 words (`trim().split(/\s+/)`), ≤25, equals `quoteWords: 3`.
- Raw body: line 140 exactly; raw byte offset 3005; exactly 1 occurrence.
- Normalized body (NFC, curly quotes/dashes folded, whitespace collapsed; same
  `normalize()` as `recheck-fetch.mjs:42-48` and `measure-c1.mjs:68-74`):
  length 11948, first occurrence offset **2914**, exactly equal to the receipt's
  `quoteOffset`.
- Receipt `quoteSource` `corpus/lessons/round-16.md:48` contains the identical
  quoted string in its Gate row; the quote is not paraphrased.
- Excerpt: I recomputed the producer's window
  `normalized.slice(offset-600, offset+quote.length+600) + "\n"` from my fresh
  body using the producer's same normalizer; the 1268-byte result is
  byte-identical to the committed excerpt. `sha256sum S038.excerpt.txt` →
  `03902da9ceabf6c7ddb08b98308d9eaa752694fe3a026a9b2242f43c3b176a9b` =
  `excerptSha256`; `quoteFound: true`; quote occurs in the normalized excerpt.

This is stronger than the counter requires: `measure-c1.mjs` only checks
excerpt-sha and quote-in-excerpt for HTTP rows (lines 366-369); the derivability
of the excerpt from the fetched body holds here byte-for-byte.

## 4. Binding to the revision

- `git show 530f40a9:corpus/evidence/round-18/source-recheck/S038.json` sha256
  `58ff1a252c6329544224520532bb0e5d8afb5b4cfe044618e6c929526251d010`, identical
  to the worktree file.
- Excerpt at REV sha256 `03902da9…176a9b`, identical to worktree.
- `.ufo/waves/round-18/recheck-fetch.mjs` at REV sha256
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` =
  receipt `producerSha256`.
- `node .ufo/waves/round-18/measure-c1.mjs 530f40a9…` exit 0, `rejected: []`,
  `c1_rows_rechecked: 51` — S038 is accepted by the committed counter, so it is
  one of the 51 counted receipts.
- At baseline `2bff864f…` the same counter reports `c1_rows_rechecked: 0`,
  `eligible_rows: 51`.

Full counter outputs observed:

REV:
`{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}`

B:
`{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c",...,"c1_rows_rechecked":0,"eligible_rows":51,"held":0,"drift_superseded":0,"own_work":0,"row_classes":{...,"url":{"immutable_pinned":14,"living_live":42,"own_work":1}},"rejected":[],"live":null,...}`

All-receipt audit (read of the 51 JSONs): 102 files = 51 `.json` + 51
`.excerpt.txt`; decode `{html-text:32, pdf-text:1, none:13, base64:5}`;
`httpStatus {200:50, null:1}`; `teachesVerdict {held:51}`; `quoteFound
{true:51}`; max `quoteWords` 24; all `fetchedAt` on `2026-10-20`; a single
`producerSha256`. Joined to REV SOURCES: status among the 51 `mined 40 / queued
6 / rejected 5`; tier `A 42 / B 4 / C 5`. Each equals the note's §2 counts
(lines 82-93). S038's own row is in the C-tier/rejected group.

## 5. Source identity, anchor and drift

- Raw identity: `blob/main` URL resolves to the same file content as the raw
  endpoint. The blob page (GET, HTTP 200, 442688 B decompressed, sha256
  `cf5d7fb5c5a0f392bc7d83837f475cb3adf7c5c75e84dbc48cb718bef06665d6`) embeds
  `"currentOid":"36a8196a182e101ecdbb7be560d6645132c0b7f0"` and contains the
  quote.
- GitHub API (GET, unauthenticated, no credentials): `commits/main` HTTP 200,
  sha `36a8196a182e101ecdbb7be560d6645132c0b7f0`, committer date
  `2026-05-08T00:11:49Z`; `contents/…CHROMIUM_FLAGS.md?ref=main` HTTP 200, git
  blob sha `fce84d1e947b7c40775d1aae94b6476d5d684809`, size 13006. My fetched
  body's `git hash-object` is the same `fce84d1e…4809`, so the fetched bytes
  are exactly the file at commit `36a8196a…`.
- Round-16 anchor: my full digest `351c02db…c7555a` equals the full digest
  recorded at `.ufo/waves/round-16/drafts/DraftSources.md:91` and re-derived at
  `.ufo/waves/round-16/w2/ReopenS038.md:31`; that re-open also recorded 511
  lines (`:33`). The file has therefore not changed between the round-16 fetch
  and 2026-10-20T~20:03Z. The Gate table cell `corpus/lessons/round-16.md:48`
  carries only the 8-hex prefix `351c02db…`.
- Body anchor: the receipt's `anchorObserved` "no date/revision marker in body;
  line 140 still matches" is true: no date-like string exists in the 511-line
  body, no HTML comment, no revision token. The only version-like token is the
  *product* recommendation "Version 120+ is recommended" at body line 487,
  which is not a document anchor. Line 140 still holds.
- Verdict on identity/anchor: **held** (live fetch; content unchanged since
  2026-05-08 commit `36a8196a…`; no drift; no superseding row needed). The row
  URL is a branch (`main`), so this is genuinely a living-live row, and the
  counter classifies it `living_live` (`row_classes.url`; `isPinnedUrl` at
  `measure-c1.mjs:285-292` does not match a branch name). Nothing in this
  receipt is an immutable-availability check.

## 6. Does the quote support `teaches`, and is the rejection premise intact?

`teaches` = "Flag recipe and readiness check for native WebMCP in Chromium".

- The quote alone supports the readiness-check half: it is the document's
  "#### Method 2: JavaScript Console" check under "### Verify Flag is Active"
  (body lines 137-145), and it is the exact line the row rejects.
- The committed excerpt also contains both flags, so the receipt artifact itself
  supports the flag-recipe half: `--enable-experimental-web-platform-features`
  once and `--enable-features=WebModelContext` once (both inside the
  `launchOptions` test-config snippet that begins the 1200-char window), plus
  `#### Method 2` and the quote. The full body additionally carries the
  "Primary Flag" and "Optional Feature-Specific Flag" sections at lines 9-27.
  So `teachesVerdict: held` is not an over-read of the excerpt.
- Rejection premise: the body still asserts `navigator.modelContext` as the API
  location (lines 19, 140, 186, 323, 332, 376, 386, 389) and still recommends
  "Version 120+" (line 487); there is no `document.modelContext` /
  `document.modelContext` occurrence. This round's own S020 receipt records
  `meta name=revision 51ed75653aaa7f174f8dbe05d1bc327359bbc57c`, `dt-updated
  2026-10-20`; S033's records gitiles tag `refs/tags/154.0.8037.97`, decoded
  sha256 `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364`.
  Both are `held`. The contradiction that justifies the row's rejection is
  therefore still supported from this round's own receipts; the receipt's
  "rejection premise unchanged" is correct.

## 7. Main claim: live product freshness vs integrity/availability

The C1 claim (PLAN.md:15-23; lessons/round-18.md:12-14; LOG.md:1049) is bounded:
it counts round-specific, integrity-checked recheck receipts; it does not claim
overdue rows, current product support, or that a `held` receipt makes the source
correct. The note repeats this at line 7 ("It does not make any knowledge entry
true"), line 44 (a rejected row's receipt supports rejection wording, not a
product claim) and line 140 ("Quote presence is not claim truth … does not show
that the row's teaches claim is correct, that the quote supports it"). For S038:

- The fetch is live (branch `main`, HTTP 200 at two distinct times), so the
  receipt is not confusing immutable availability with liveness.
- The document's content is itself unchanged since commit `36a8196a…`
  (2026-05-08), so the observed stability is real and not assumed.
- `held` for this row means "the rejected recipe/readiness check is still
  served", not "Chromium 154 exposes `navigator.modelContext`". The row remains
  `rejected`, and the counter's own status histogram (`rejected` 8 at REV)
  keeps it so. No part of the S038 receipt or the note turns this into a live
  product claim.

Residual boundary (finite, not a falsifier): `c1_rows_rechecked: 51` includes
S029, whose `httpStatus` is `null` because it is a git-blob read
(`S029.json`), so live-HTTP rechecks are 50 + 1 own-work. The PLAN
(lessons/round-18.md:14) and note (lines 112, 147) label S029 hygiene, and the
counter reports `own_work: 1` separately; a prose claim of "51 live-source
rechecks" would overcount live HTTP by one. "51 receipts (50 live HTTP + 1
own-work)" is exact.

## 8. Non-falsifying observations

1. `S038.json` `anchorObserved` says the body sha256 "equals the round-16 Gate
   digest". The Gate cell (`corpus/lessons/round-16.md:48`) carries only
   `351c02db…`; the complete digest is recorded at
   `.ufo/waves/round-16/drafts/DraftSources.md:91` and
   `.ufo/waves/round-16/w2/ReopenS038.md:31`. My fetch matches the complete
   digest, so the substance is true; only the record name "Gate digest" is
   imprecise.
2. The receipt records no commit anchor even though the row URL exposes one
   (`currentOid 36a8196a…`, file blob `fce84d1e…`, size 13006). Adding that
   anchor to future living-live receipts would remove the only soft spot:
   `anchorObserved` is body-only and the digest pins one response. Not a
   falsifier for this round.
3. Counter `held: 50` includes the five rejected rows, so it means "quote/
   teaches still present", not "claim current/correct". S038 is the finite
   counterexample: `SOURCES.md:52` status `rejected` while `S038.json`
   `teachesVerdict: held`. The note's lines 44 and 140 state the caveat; the
   bare JSON field name does not.
4. `S038.json` `note` is seat-authored free text, not producer-computed; the
   producer (`recheck-fetch.mjs:129-131`) passes `anchorObserved`,
   `teachesVerdict` and `note` straight through from CLI arguments. The counter
   cannot and does not validate their content beyond the enum/`quote` checks
   (`measure-c1.mjs:329-369`). For S038 I independently verified every free-text
   assertion (digest, line, flags, rejection state), so the trust placed in it
   is discharged here.

No observation contradicts the receipt; none triggers a superseding row or a
`drift` verdict.

## 9. Cross-check required for the own-work row (no network)

Per the ticket's own-work rule, S029 was checked with git rather than network:

```
git cat-file -p 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | wc -c
  → 97073
git cat-file -p 837b33a…:…/receipt.json | sha256sum
  → b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7
```

`S029.json` carries the same sha256, `bytes: 97073`, `httpStatus: null`,
`quoteWords: 17`, `quoteFound: true`, `quoteOffset: 74695`;
`measure-c1.mjs:24-26,336-344` binds this exact constant, so the counter's S029
acceptance is reproducible without egress. No request was made.

## 10. Limits and unrun checks

- I did not run `measure-c1.mjs --live` (it would re-fetch all 51 URLs); the
  S038-equivalent live check is §2 above, including a second fetch.
- I did not run the `recheck-fetch.mjs` producer anywhere; §3 reimplements its
  normalizer and window locally to test derivability.
- The blob page is dynamic HTML; its byte digest is recorded for the fetch but
  was not compared to a canonical form. Its only evidentiary roles are the quote
  presence and the `currentOid`.
- The GitHub API responses are unauthenticated GETs; no credential/session
  content was used. A force-push of the fork's `main` after
  2026-10-20T~20:03Z is outside this observation; at observation time the file
  is pinned by commit `36a8196a…` and blob `fce84d1e…`.
- Unreachable/drift cases were not exercised because the source answered 200 and
  the quote is present; there is no alternative-rendering fallback to report.
- No tool was installed or upgraded; no pacman/uv/npx activity.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS038.md`
