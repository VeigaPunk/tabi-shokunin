VERDICT: PASS

# S045 C1 receipt — independent falsification (round 18, wave 2)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline B =
`2bff864fdfee684ddbcd066cc8e735adaba2735c` (`git show -s` 2026-10-20 15:35:44 -0300). Measured candidate
REV = `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git rev-parse --verify refs/heads/master` = same; `git
show -s` 2026-10-20 16:58:00 -0300 "round-18: source rechecks, guarded harness, routed correction evidence
and build wave"). Read-only in LANE: no production/fleet/sibling/jj/index writes; no git writes (only
`git show`, `rev-parse`, `log`); no subagent dispatch; no browser; no tool installs. The producer
`.ufo/waves/round-18/recheck-fetch.mjs` was not run; its logic was re-implemented in a private `/tmp`
probe (Python) so that `normalize()`/excerpt derivation could be compared byte-for-byte. Sandbox
`/tmp/tabi-r18-s045` was removed after evidence extraction; every command below recreates it.

**Result in one sentence:** every reproducible field of `S045.json` holds exactly — body digest, byte
count, HTTP status, quote offset/line/word count, excerpt digest and bytes, tag→commit anchor, producer
digest, and the four-file `teaches` composite — so this receipt is *not* falsified. The only substantive
bound is construct-level: S045 is an immutable pinned tag, so its recheck proves availability + identity
+ quote presence, never upstream recency; that bound is explicitly disclaimed by the round's own Gate
and note, and 13 of the 51 baseline rows (12 pinned + 1 own-work) share it.

---

## 1. Independent fetch of `receipt.url`

Exact command (user agent quoted as one argv element, matching the producer's argv; see O3 for the
receipt's lossy rendering):

```
mkdir -p /tmp/tabi-r18-s045
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabi-r18-s045/body \
  -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html?format=TEXT'
```

Observed, exit 0, at 2026-10-20 20:02:22Z (`stat` mtime `2026-10-20 17:02:22.206233389 -0300`):

```
HTTP=200 SIZE=3564 URL=https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html?format=TEXT
10684 /tmp/tabi-r18-s045/body
b1300c0657f169b40c1be61c58daa3320d50d22b553e13b7f514a2c7be567968  body
```

`SIZE=3564` is compressed transfer bytes; `--compressed` restores the 10684-byte body the receipt
hashes. Receipt `fetchedAt` is `2026-10-20T19:09:41.018Z` (`S045.json:6`); my fetch is ~52m41s later,
same day. **Raw-body equality held exactly** (not merely quote presence):

| Field | Receipt (`S045.json`) | Observed 2026-10-20T20:02:22Z | Match |
|---|---|---|---|
| `httpStatus` | 200 (`:8`) | 200 | yes |
| `bytes` | 10684 (`:9`) | 10684 | yes |
| `sha256` (as served) | `b1300c0657f169b40c1be61c58daa3320d50d22b553e13b7f514a2c7be567968` (`:10`) | same | yes |
| `decode` | `base64` (`:11`) | base64 decode succeeds | yes |

## 2. Decode, quote location, excerpt integrity

`S045.json` stores `decode: base64` (`:11`). Decoding the body:

```
decoded bytes = 8013
decoded sha256 = faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e
content lines (wc -l semantics) = 205   (Python split('\n') = 206 entries: trailing newline)
```

The decoded digest `faf6e488…92c8e` matches the round-17 dossier's pinned `sha256 (decoded raw bytes)`
(`.ufo/waves/round-17/w1/SrcWebTests.md:35`) and the dossier's "8013 bytes, 205 lines" (`:33`). Re-
implementing the producer's `normalize()` (NFC; `‘’`→`'`, `“”`→`"`, `–—`→`-`, NBSP→space; all
whitespace runs→one space; trim; `recheck-fetch.mjs:48`) and its inline excerpt derivation
(`recheck-fetch.mjs:107-108`; the counter's equivalent `sourceExcerpt()` is `measure-c1.mjs:238-245`):

- quote whitespace-token count = **7** = `quoteWords` (`:14`);
- normalized offset = **2867**, exactly `quoteOffset` (`:17`), occurrence count **1**;
- decoded line **87** = `anchorObserved`'s "quote at line 87" (`:20`);
- rebuilt excerpt = `text.slice(max(0, 2867-600), 2867+len(q)+600) + "\n"` = **1318 B**, sha256
  `fbddb04afc7778d6129ab5958c291eaa7c4d6f0a7a3c52edf55335e30a218af7`, byte-identical to
  `corpus/evidence/round-18/source-recheck/S045.excerpt.txt` and equal to `excerptSha256` (`:19`).

The quoted line is the exact decoded line 87:

```
assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);
```

`quoteSource` `corpus/lessons/round-17.md:57` (`:15`) was checked: line 57 of that byte-frozen lesson is
the S045 table row and contains the quote verbatim. `quoteFound: true` (`:16`) is correct.

## 3. Source identity and anchor

- `rowUrl` (`S045.json:4`) occurs verbatim once in the S045 row's `source` cell at REV
  (`corpus/SOURCES.md:59`); the row is not in the superseded set (`measure-c1.mjs:15`), is `mined`, and
  its cadence cell is `on-release`.
- `url` (`:5`) is the Gitiles `?format=TEXT` variant the counter allows for `googlesource.com/+/`
  (`measure-c1.mjs:197-207`).
- Tag→commit anchor observed, not merely asserted: GET
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON` → HTTP 200,
  body prefix `)]}'`, `"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"` — exactly the commit in
  `anchorObserved` (`:20`) and in the SOURCES `anchor` cell.
- Commit identity cross-check: fetching the same file at
  `+/b510e9d7cd3a2fbd78d0ddc42234103206c5f78d/…?format=TEXT` returned HTTP 200, 10684 bytes, sha256
  `b1300c…7968` — identical to the tag fetch. The tag resolves to that commit and serves that blob.
- Producer binding: sha256 of `.ufo/waves/round-18/recheck-fetch.mjs` at REV =
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` = `producerSha256` (`:24`).

**Identity/anchor verdict:** held. **Drift:** none at the pinned identity. **Unreachable:** no. The quote
was present in the first fetch, so no alternative rendering/raw endpoint was needed; the `?format=TEXT`
endpoint *is* the raw endpoint (Gitiles serves the blob base64).

## 4. Does the quote support `teaches`? (composite, not single-line)

The row's `teaches` cell (`corpus/SOURCES.md:59`) has four clauses. The single quoted line supports only
the event ordering, including `toolcancel`; it does not contain the reason string or the unregister or
`invocationId` claims. All cited anchors were fetched at the same tag and decoded:

| Clause | Anchor | Observed | Verdict |
|---|---|---|---|
| abort rejects with the caller's reason | `executeTool-abort.https.html:88` | `assert_equals(executionRejectionValue, 'custom cancellation reason');` | supported |
| same, already-aborted case | `:113` | `assert_equals(executionRejectionValue, 'already aborted');` | supported |
| event array fires `toolcancel` | `:87` (the quote) + listener `:69-73` | `events.push('toolcancel')`; quote includes it | supported |
| unregister mid-execution still resolves | `unregister-during-executeTool.https.html:85,:121` (decoded 4930 B, sha256 `2515eb0320970296ffab58d51850f65bc7538263f8acaa7ab54ad7ecd4b4793d`) | `:85` `assert_equals(result, 'delayed_result', 'Pending execution Promise should resolve to tool result even if tool was unregistered mid-execution')`; `:121` same for `same_doc_result` | supported |
| CDP `invokeTool` returns an `invocationId` that `toolResponded` echoes | `inspector-protocol/webmcp/invoke-tool.js:38-51` (2782 B, sha256 `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c`); `WebMCP.pdl:66-69,110-113` (3969 B, sha256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`) | `invoke-tool.js:38` `let response = await dp.WebMCP.invokeTool({`; `:48` `if (params.invocationId && params.invocationId === response.result.invocationId)`; PDL `:68` returns `string invocationId` with "Response is sent before tool events"; `:110-113` `event toolResponded` parameters `invocationId` | supported |

So `teachesVerdict: held` (`:21`) is substantively true. It is a **composite of four files**: the
receipt's single quote is not sufficient by itself, and the counter's receipt check only proves the quote
is in the excerpt/source — it does not machine-check the other three files (`measure-c1.mjs:315-378`).
Here the receipt's `note` (`:22`) cites them, and I verified them. The SOURCES row's anchor cites
`WebMCP.pdl:68` but not `:110-113`; the receipt note supplies `:110-113`, so the row+receipt together
bind the clause. No overclaim in the receipt; a reader who treats the lone quote as the whole teaches
would under-read it, not over-read it.

## 5. Immutable availability vs live product freshness — the explicit question

`S045` is `immutable_pinned` by the counter's own URL rule (`measure-c1.mjs:247-252`: `+/refs/tags/…`):
its URL names tag `154.0.8037.97`, and the tag served the identical 10684/8013 bytes on two fetches
(receipt 19:09Z, mine 20:02Z). Re-fetching that URL can detect **removal or re-tagging**, and (only if
the seat actually checks it) a tag move; it cannot detect content evolution at a fixed tag. That is what
the receipt records.

A finite counterexample to any recency reading, on the same path:

```
curl … 'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html?format=TEXT'
HTTP 200
as served: 15872 B, sha256 08e277a278687bed47d76c9d0e10c3ce8731eb452a01fd435ab14e59ae612e31
decoded:   11904 B, 289 lines, sha256 b1bcab1eea55b6891e4e67df07a69ba5b5fe969bec90ea9e0a9cb0feba0faa82
quoted assertion on main: line 109 (not 87)
```

So upstream `main` has already grown from 205 to 289 lines while the pinned-tag recheck would still
report `held`. The row's scope is "build-scoped" at tag 154.0.8037.97 (`corpus/SOURCES.md:59`), so this
is expected for the row, not drift: the row claims what that tag asserts, and the tag still asserts it.

The count-level bound, measured from the registry at B (same commit, `corpus/SOURCES.md` at B):

- 51 baseline-eligible rows = **38 `living_live` + 12 `immutable_pinned` + 1 `own_work`** (S029).
- The 12 pinned: S033, S034, S036, S037, S041, S042, S043, S044, **S045**, S046, S055, S056.
- Therefore **13/51 = 25.5%** of the C1 count (`c1_rows_rechecked: 51`, observed below) is
  availability/identity/quote-presence for an immutable or own-work source; those rows cannot detect a
  content change at the named identity. The 38 living rows can detect a change in the *quoted* text, but
  not every kind of drift (the quote can survive a page rewrite; note §6 says so).

Does the **main claim** confuse the two? As committed, no: the claim is a receipt count, and the round
states the bound explicitly in three places:

- `corpus/lessons/round-18.md:12`: "C1 counts round-specific integrity-checked recheck receipts, not
  overdue rows or current product support."
- `corpus/knowledge/source-recheck-round-18.md:114`: baseline class histogram 14/42/1 and "That
  classification is the counter's own, from the row URL; it is not a property the receipts establish."
- `corpus/knowledge/source-recheck-round-18.md:140-141`: "Quote presence is not claim truth… It does not
  show that the row's `teaches` claim is correct, that the quote supports it… the 51 rows are not a
  statement of current live product support." Own-work is separately called hygiene at `:147`;
  `LOG.md:1049` says "51 current-at-baseline rows reopened, own-work/pinned/live classes kept distinct."

The residual risk is presentation, not falsity: the scalar is named `freshness` and the headline is
`c1_rows_rechecked=51`; a reader who equates that with "51 sources current" would over-read it by the
13/51 bound above. The committed text does not make that equation. My independent re-fetch of S045
confirms the receipt's factual content; it does not turn a pinned tag into evidence of upstream
recency, and I do not claim it does.

## 6. Counter and companion receipt

Read-only counter run (no `--live`; no writes):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed, exit 0 (single JSON line):

```
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},
 "status":{"mined":48,"queued":8,"rejected":8},
 "url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

- `c1_rows_rechecked: 51` = all 51 baseline receipts accepted, `rejected: []`.
- `held: 50` is the counter's non-own-work held count (`measure-c1.mjs:467`); the note's §2 "held 51"
  counts the `teachesVerdict` field on all 51 receipts, including S029. Both are true of different
  quantities; they should not be quoted interchangeably.
- `eligible_rows: 58` is the REV denominator: 64 REV rows minus the six superseded (`:465`). The seven
  new S058–S064 are outside the baseline-51 target; this is not a missing S045 receipt. The note's §2
  table reports the B counter (`51 / 0`), not the REV `58 / 51`; see O2.

Companion S029 (own-work, per assignment checked with `git show`, not network):

```
git -C LANE show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json
```

Observed: 97073 B, sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (matches
`S029.json:10` and `measure-c1.mjs:18`); same sha at B and at REV (byte-identical). Normalized quote
offset **74695** = `quoteOffset` (`S029.json:17`); rebuilt excerpt sha256
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` = `excerptSha256` (`:19`) and
byte-identical. Parsed fields: `cleanup.server.listeningAfter` = true, `perWorker[0].listeningAfter` =
false, `runtime.node` = 26.12.0, `pin.node.recorded` = 24.21.0, `minimumMajor` = 20. Mechanical fields
held. The semantic `held` of S029 is contested elsewhere: `.ufo/waves/round-18/w2/LiveS029.md` F1/F2
records the routed inverted cleanup-summary proposition. I did not re-argue that here and do not count
it twice; the mechanical values above are all I assert for S029.

## 7. Observations (non-blocking; none changes `c1_rows_rechecked`)

**O1 — digest convention: transport vs decoded.** For `decode: base64` rows, `S045.json:10`'s `sha256`
`b1300c…` is the **as-served base64 transport** digest, not the decoded test-file digest
`faf6e488…`. `anchorObserved` (`:20`) records the decoded size (8013 B) but not the decoded digest. The
round-17 dossier pins `faf6e488…` (`w1/SrcWebTests.md:35`); the receipt does not carry it, and the
counter for HTTP rows checks only 64-hex plus quote-in-excerpt (`measure-c1.mjs:315-378`), not equality
to a committed content digest (`:347` does that only for S029). Bridging `b1300c…` to `faf6e488…`
therefore requires an independent re-fetch + decode, which I did. Note §4 ("the receipt records bytes
only, not the commit served", `:110`) is consistent but does not spell out the transport-vs-
decoded convention. This is an auditability limit, not a false field.

**O2 — note scope line is stale at REV.** `corpus/knowledge/source-recheck-round-18.md:11` says
"`corpus/SOURCES.md` has 57 rows (S001–S057)". At REV, SOURCES has **64** rows (S058–S064 exist; same
commit `530f40a9` as the note). The sentence is baseline-scoped by the note's front matter (line 1 lists
S001–S057 as "the 51 rows … not superseded at baseline B") and §3's table, and the 51-receipt count is
correct; but the present-tense "has 57 rows" is not true of the file at the measured revision. The
counter's REV `eligible_rows: 58` is the corresponding number. Non-blocking presentation drift; no count
error.

**O3 — `command` field is not shell-parseable (shared defect, already reported).** Replaying
`S045.json:7` literally:

```
bash -n -c "$(python3 -c "import json;print(json.load(open('corpus/evidence/round-18/source-recheck/S045.json'))['command'])")"
bash: -c: line 1: syntax error near unexpected token `('
exit 2
```

The unquoted user agent `-A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18` causes it. The
producer actually passes the UA as one argv element (`recheck-fetch.mjs:95`), and my fetch used that
argv form, so the measurement is unaffected; only literal replay of the recorded string fails. The same
defect was found independently for S020 in `.ufo/waves/round-18/w2/LiveS020.md`; I record it here for
S045's field but do not claim it as a new wave-2 finding or double-count it.

**O4 — round-17 dossier word count.** `w1/SrcWebTests.md:34` says the quote is "(6 words)"; whitespace
tokenization gives **7** (the phrase `'tool started'` is two tokens). The round-18 receipt's
`quoteWords: 7` (`:14`) is correct under the counter's `wordCount()` (`measure-c1.mjs:276-279`). The
dossier is a protected round-17 artifact; this is a cross-artifact note, not an S045 defect.

## 8. What I did not run / finite limits

- Did not run `measure-c1.mjs --live`: it would re-fetch all 50 HTTP receipts, not just S045. My own
  S045 fetch is stronger for this row because it compared the **complete body digest** (as-served and
  decoded), not only quote presence.
- Did not launch a browser, CDP session, or WebMCP tool; no credential/session content. Only public GETs
  (chromium.googlesource.com Gitiles) and read-only `git show`/`rev-parse`/`log`.
- Did not run `.ufo/waves/round-18/recheck-fetch.mjs` at all; its normalizer/excerpt logic was
  re-implemented in Python and matched the committed excerpt byte-for-byte.
- Did not independently review the other 50 receipts' content; I read all 51 JSONs only for the aggregate
  counts in §6, which match the note exactly (decode 13 `none` / 32 `html-text` / 5 `base64` / 1
  `pdf-text`; HTTP 50×200 + 1 null; `teachesVerdict` 51 held; `quoteFound` 51 true; max `quoteWords`
  24; one producer digest; S029 pinned digest). S045 is the receipt attacked here.
- The main-branch GET is a **counterexample illustration**, not a substitute for the pinned evidence and
  not a claim that the row should track `main`.
- Sandbox `/tmp/tabi-r18-s045` was removed after evidence extraction; the commands and digests above reproduce it.

Files written (absolute):

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS045.md`
