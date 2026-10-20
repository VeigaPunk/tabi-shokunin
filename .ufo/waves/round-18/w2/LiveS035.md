VERDICT: ISSUES

# LiveS035 — C1 receipt S035: independent re-fetch, teaches support, binding limits

Scope: `.ufo/waves/round-18/w2/LiveS035.md` only. Attacked `corpus/evidence/round-18/source-recheck/S035.json`
at REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`, row `corpus/SOURCES.md:49`, original quote
`corpus/lessons/round-16.md:45`, and the round note `corpus/knowledge/source-recheck-round-18.md`.
No production file, fleet file, sibling report, git index or jj state was edited. No `jj` command and no
git write was run. The producer was executed only as an unmodified `/tmp` copy with `--normalize-only`,
which writes nothing; it was never run into the receipt directory.

Summary: the S035 receipt is **genuine**, the source **identity held**, the quote **is present**, and the
row's `teaches` still holds **in to-day's body**. But the receipt's 3-word quote witnesses only **1 of 4**
`teaches` clauses, the committed excerpt witnesses **none of the three operative clauses**, and the C1
counter accepts an HTTP receipt without binding its `sha256`/`bytes`/`quoteOffset` to the body or to the
row anchor. A one-line semantic mutation of the enable/toolsAdded teaching still passes the receipt's
quote test at the identical offset. Two evidentiary defects (F1, F2) and one scoped limitation (F3)
follow. Severity is over-credit in the C1 artifact, not source drift and not forged bytes.

## 1. Independent fetch — observed

```
$ cd /tmp/tabi-r18-liveS035
$ curl -sSL --compressed --max-time 90 \
    -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' -o body \
    -w 'http_code=%{http_code} size=%{size_download} url=%{url_effective}\n' \
    'https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl'
http_code=200 size=1412 url=https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl
curl_exit=0
$ sha256sum body
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  body
$ wc -c body
4126 body
```

Full fetched-body SHA256 `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f`,
4126 bytes, HTTP 200, decode `none`. The transfer size (1412) is the compressed wire size; the stored body
is 4126 bytes. This equals receipt `S035.json:9-10` exactly.

Quote location, with the single shared normalizer:

```
normalizedLength=3624  offset=234  occurrences=1
raw byte offset of quote start = 235   line = 7   line text = "experimental domain WebMCP"
```

The 1-byte difference between raw 235 and normalized 234 is the raw blank line (`\n\n`, two bytes) versus
the normalizer's single space. The quote occurs exactly once. It is 3 words (`S035.json:13-14`).

Receipt/file binding, observed:

| Item | Observed | Receipt/REV |
|---|---|---|
| receipt blob at REV | `be80f55ef27a9c7a37d4e2aa78869dae6201cbe0820bc0c64b5f9ce7e4f3bcc5` | on-disk file byte-identical (`cmp` exit 0) |
| producer at REV | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` | `S035.json:24` equal |
| excerpt | 861 bytes, `1538792635294ec9fc5c1039f41c035fc450b286b55e20f2cd4ad07001dc38ca` | `S035.json:19` equal |
| excerpt derivation | `normalize(body)[0 .. 860]` + `\n` reproduces the committed excerpt byte-for-byte | `reconstructed_sha256 == excerptSha256`, `byte_equal_committed_file=true` |
| curl command | receipt command string equals the counter's `expectedCurlCommand` | true |
| rowUrl in row source cell | row `S035` source cell contains the URL verbatim | `corpus/SOURCES.md:49` |

So the excerpt is a real slice of the fetched body, not a fabricated quote carrier. `quoteOffset`,
`bytes`, `sha256` and `excerptSha256` all match the body fetched in this seat.

Cross-host identity (public GET only):

- `https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT`
  → HTTP 200, 2241 base64 bytes → decoded 4126 bytes,
  `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f`; `cmp` with the GitHub-raw body is
  identical. The GitHub mirror and upstream Gitiles agree to-day.
- The 154 tag (`refs/tags/154.0.8037.97`, same path, `?format=TEXT`) → HTTP 200, decoded 3969 bytes,
  `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`, which equals the S041 anchor's
  `26e62f29…37ff`. Main differs from 154 by exactly the added two-line annotation:

```
+      # If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.
+      optional boolean debugging
```

Consequence: main's line 47-48 (`backendNodeId`) and 53-54 (`enable`/`toolsAdded`) are **main-only line
numbers**; at 154 the backendNodeId pair is 45-46 and the enable comment is 50-51. This is consistent with
the row's scope ("at Chromium main") and with the knowledge note's separate 154 receipt, but it means the
row anchor cannot be reused as a build-scoped witness.

## 2. What held — observed

- Source reachable: HTTP 200, identical bytes on two hosts.
- Identity: held for the dated digest. `S035.json:20` says "no in-body revision marker … body sha256 …
  equals the row identity digest f386bcfd...f99f". The body has no revision marker (line 1 is the Chromium
  copyright); the row anchor's digest prefix matches the full digest; the round-16 lesson's stored prefix
  `f386bcfd…f99f` (`corpus/lessons/round-16.md:45`) also matches.
- Anchor: held as "main fetched 2026-10-20, line 7 and lines 47-54, sha256 f386bcfd…f99f"
  (`corpus/SOURCES.md:49`). All named lines exist and have the expected content in to-day's body.
  There is **no commit anchor**: the URL names `main`, and the response ETag is a CDN weak ETag
  (`W/"808db853cb3fbf46a74f2354ca2f840288ff9bbdc0c95db4d7f31a612e35d279"`), not a git blob id.
- Teaches at body level: held to-day. Body line 7 is the experimental domain declaration; lines 47-48 are
  `# Optional node ID for declarative tools.` / `optional DOM.BackendNodeId backendNodeId`; lines 53-54 are
  the enable/toolsAdded comment; `command enable` and `command invokeTool` exist.
- Row membership: S035 is not in the superseded set (`measure-c1.mjs:15`), has one receipt, and the
  counter accepts it: at REV the counter reports `c1_rows_rechecked=51, held=50, own_work=1,
  drift_superseded=0, rejected=[]`.

## 3. F1 — ISSUES (witness scope): the quote supports 1 of 4 `teaches` clauses; the excerpt supports none of the operative ones

Confidence: high (direct observation and a constructed-but-producer-identical mutant).

Row `teaches` (`corpus/SOURCES.md:49`, cell 6) has four clauses:

1. "The domain is experimental"
2. "enable replays toolsAdded for registered tools"
3. "backendNodeId marks declarative tools"
4. "the 154 build's own /json/protocol is the build authority"

Receipt quote `experimental domain WebMCP` (`S035.json:13`) supports clause 1 only. Clause 4 is a
build-authority caution, not an assertion of this source, so the source-derived clauses are 1-3.

The committed excerpt is `normalize(body)[0..860]` (861 bytes with newline), because the quote offset 234
put the ±600 window's start at 0 and its end at 234+26+600 = 860. The witnesses for clauses 2 and 3 lie
outside it:

| Witness | Normalized offset | In excerpt? |
|---|---|
| `Optional node ID for declarative tools` (line 47) | 1465 | no |
| `Enabling the domain will trigger a toolsAdded event` (line 53) | 1693 | no |
| `command invokeTool` (line 60) | 1873 | no |

The excerpt therefore contains the header, the `Annotation` type and its hint fields only — no command and
no declarative-tool node id. The seat's `note` (`S035.json:22`) asserts body-level support at lines 47-48
and 53-54; that assertion is **true of to-day's body** (I verified it), but it is prose, not a property the
committed quote/excerpt demonstrates, and the counter never reads it.

Finite counterexamples, run with an unmodified copy of the producer (`sha256
f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`) and `--normalize-only` (writes nothing):

```
# minimal semantic mutation: the row's clause 2 becomes false, header untouched
$ sed 's/Enabling the domain will trigger a toolsAdded event for/Enabling the domain will trigger no event whatsoever for/' body > mutant_enable_semantics.pdl
$ node producer.mjs --normalize-only --decode none --body mutant_enable_semantics.pdl --quote 'experimental domain WebMCP'
{"found":true,"offset":234,"normalizedLength":3625,...}          exit 0
$ node producer.mjs --normalize-only --decode none --body mutant_enable_semantics.pdl \
    --quote 'Enabling the domain will trigger a toolsAdded event for all currently registered tools.'
{"found":false,"offset":-1,"normalizedLength":3625,"window":null} exit 1
```

The receipt's own quote passes at the **identical offset 234** on a body where the enable/toolsAdded
teaching is false; the original round-16 lesson quote would have caught that mutation (exit 1). Additional
mutants:

- delete lines 47-58 (backendNodeId, stackTrace, enable and disable, including the enable comment):
  3708 bytes, `{"found":true,"offset":234,...}`, exit 0 — same offset as the receipt.
- header/annotation-only stub (`sed -n '7,60p' body`): 1852 bytes, `{"found":true,"offset":0,...}`, exit 0.
- positive control: replace line 7 with `stable domain WebMCP`: 3618 normalized chars,
  `{"found":false,"offset":-1,...}`, exit 1. So the quote is a valid witness for clause 1, and only that.

Also note the causal detail: if the receipt had used the original lesson quote (offset 1693), its ±600
excerpt window would have started at 1093 and covered both 1465 and 1693. The choice of the line-7 anchor
is what excluded the operative witnesses from the committed artifact.

Disposition: the receipt is not false. `teachesVerdict: "held"` is a body-level author judgment recorded in
`note`, not an artifact-verified fact. The C1 claim's "valid quote/excerpt/producer binding"
(`corpus/lessons/round-18.md:15`) holds in the self-consistency sense but not as "the quote witnesses the
`teaches`".

## 4. F2 — ISSUES (binding): the C1 counter does not bind an HTTP receipt's body identity

Confidence: high (code read plus the accepted REV run).

`measure-c1.mjs` `evaluateReceipt` accepts an HTTP receipt on these body-related checks and no others:

- `measure-c1.mjs:330`: `sha256` is 64-hex. It is never compared to the row anchor or to a stored body.
- `measure-c1.mjs:362-369`: excerpt filename, `excerptSha256` versus excerpt file bytes, and
  `normalize(excerpt).includes(normalize(quote))`. The excerpt is bound to itself, not to the body.
- `measure-c1.mjs:328-329`: only `row.source.includes(rowUrl)`; the row anchor cell's digest is never
  parsed. It is also printed with an ellipsis (`f386bcfd…f99f`), so it cannot be compared as a full digest.
- `measure-c1.mjs:421-432` (`--live`): re-fetches and checks only `normalize(body).includes(normalize(quote))`.
  Digest, byte count and `quoteOffset` are not compared.
- `measure-c1.mjs:337-340`: `teachesVerdict` is accepted as `held` with no witness condition.

By contrast, the S029 own-work path is stricter: `measure-c1.mjs:371-376` recomputes the excerpt from the
pinned blob and compares offset and bytes exactly. The HTTP path has no equivalent.

Finite consequence: absent `--live`, a receipt whose `sha256` is any 64-hex string and whose excerpt is any
text containing the quote is accepted for S035. With `--live`, a body that retained line 7 and lost every
operative command (the 3708-byte deletion mutant above) would still report `live_held`. S035's receipt is
honest — I reconstructed its excerpt byte-for-byte from the fresh body — but the mechanism cannot
distinguish it from a thinner or fabricated one. This is a contract-level gap in C1, not a defect peculiar
to S035 and not evidence that this receipt is forged.

[INFERENCE] The counter's `sha256` check is described in the PLAN contract (`PLAN.md:69-76`) as "`sha256`
is 64-hex", so this is by design; the finding is that "integrity-checked" in the lesson Gate
(`corpus/lessons/round-18.md:12`) overstates what a non-`--live` run checks for HTTP rows.

## 5. F3 — limitation, not a false claim: availability-at-date vs live freshness

Confidence: high for the facts; medium for the over-read risk.

- S035's row `opened` cell is 2026-10-20 (`corpus/SOURCES.md:49`; `opened` is the column before `recheck`
  in the header at `corpus/SOURCES.md:13`); the receipt `fetchedAt` is
  `2026-10-20T19:06:11.024Z` (`S035.json:6`); the round-16 lesson is dated 2026-10-20
  (`corpus/lessons/round-16.md:3`). The recheck interval for this row is **0 days**.
- The URL is a moving ref (`main`); there is no commit anchor, and the ETag is a CDN weak ETag. My second
  fetch was served `x-cache: HIT`, `x-cache-hits: 1`, `source-age: 97`, `cache-control: max-age=300`,
  `content-length: 1412`; body2 was byte-identical. Identical digests across two fetches minutes apart are
  therefore not independent origin evidence.
- Of the 51 rechecked rows, **38 are `living_live`, 12 are `immutable_pinned`, 1 is `own_work`** (computed
  with the counter's own `urlClass` regexes, `measure-c1.mjs:247-259`, over the 51 receipt row ids and the
  SOURCES source cells at REV).
- The round's own binding text does **not** claim durability: `PLAN.md:15` says "re-verified against their
  live source"; the Gate says C1 "counts round-specific integrity-checked recheck receipts, not overdue
  rows or current product support" (`corpus/lessons/round-18.md:12`); the note classifies S035 as live and
  says "These can change between fetches; the 2026-10-20 digest pins one response only"
  (`corpus/knowledge/source-recheck-round-18.md:111`), and explicitly says receipts "cannot show which
  commit the `main` URL served" (line 119). The counter emits `freshness_scope: 'round-18 receipt date
  2026-10-20 only; not a reusable freshness due-date gate'` (`measure-c1.mjs:471`).

So the main claim does **not** confuse immutable availability with live product freshness: S035 is labelled
live, its anchor is a dated digest, and no commit or immutability is claimed. The residual issue is naming:
a scalar called "freshness" counts a same-day re-fetch of a moving branch as one unit. For S035 the
receipt can show "the branch served these bytes at 2026-10-20T19:06Z"; it cannot show that the teaching
was revalidated since round 16 or that it will survive the next Chromium roll. [INFERENCE] If the scalar is
read as durability rather than an event count, 38 of 51 units are availability-at-date, and S035 is the
weakest kind: zero elapsed interval on a moving `main`.

## 6. The original quote — absent under the shared normalizer, present under an alternative rendering

Confidence: high.

`corpus/lessons/round-16.md:45` quotes "Enabling the domain will trigger a toolsAdded event for all
currently registered tools." at lines 53-54. With the single shared normalizer this string is **not**
found in the fetched body:

```
orig_quote_found_in_normalized_body=false
window="Enabling the domain will trigger a toolsAdded event for # all currently registered tools. command enable ..."
```

Exact reason: line 54 begins `# all currently registered tools.`, so the normalized stream contains
`... event for # all ...`; the `# ` comment prefix breaks the contiguity. This is the reason for
`quoteSource: "new"` (`S035.json:15`), and the receipt's `note` (`S035.json:22`) and the round note
(`corpus/knowledge/source-recheck-round-18.md:104`) both record it.

Alternative rendering of the **same identity** (not a replacement for the evidence): strip leading comment
prefixes per line, then normalize:

```
$ node -e '... raw.split("\n").map(l => l.replace(/^\s*# ?/, "")).join("\n") ...'
comment_prefix_stripped_original_quote_found=true
offset=1651
window="Enabling the domain will trigger a toolsAdded event for all currently registered tools. command enable Disables the WebMCP doma"
```

So the source text has **not** drifted; only the single normalizer cannot join the wrapped comment. The
receipt's substitution is explained, but per F1 the substitute is a much weaker witness. I did not change
the evidence; both renderings are reported.

## 7. S029 own-work cross-check (git show, per assignment)

Confidence: high. No network was used for S029.

```
$ git -C LANE show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
$ ... | wc -c
97073
```

Recomputed with the receipt's own quote and normalizer: `quote_found=true, offset=74695` (receipt
`quoteOffset=74695`); excerpt sha `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` equals
`S029.json`; `httpStatus` null and `url` is the repo path; the blob at lane tip B is identical. The
own-work route is correctly bound and is excluded from the 50 `held` count (`own_work=1`).

## 8. Counter runs (read-only)

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9...","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,
 "own_work":1,"rejected":[],"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234",
 "live":null}
$ node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
{"c1_rows_rechecked":0,"eligible_rows":51,"held":0,"own_work":0,"rejected":[]}
```

At REV the count is 51/51 of the round's target; `eligible_rows` is 58 because S058-S064 (7 new rows) were
added this round (64 rows − 6 superseded). S035 is one of the 50 non-own-work `held` receipts.

## 9. Limits / not done

- `--live` was not run over all 51 receipts; S035 was fetched twice with the exact receipt argv, and the
  quote was located. No claim is made about other rows' live status.
- No browser, no CDP, no port 9222, no real-site page tool, no POST, no credentials, no session content.
- No tool install or upgrade. No pacman, no full-system transaction.
- No git write, no `jj` command, no lane production edit. The only lane write is this report.
- The mutant tests used `--normalize-only` on an unmodified copy of the producer in `/tmp`; no receipt was
  written. The `/tmp/tabi-r18-liveS035` sandbox is deleted after this report; all reproducible commands and
  digests are above.

## 10. Suggested disposition (for the main agent; nothing applied)

- Treat S035's receipt as genuine and source-held, but `teachesVerdict: held` as an author body-level
  judgment, not an artifact-verified property.
- If C1's "integrity-checked" wording is to be strong, the counter would need at least one of: quote(s)
  covering the sentence carrying `teaches`; a second excerpt span for the operative clauses; a comparison
  of receipt `sha256` to a parseable row-anchor digest; deriving the excerpt from the body for HTTP rows as
  already done for S029; and a `--live` digest/bytes comparison for pinned sources.
- F3 is a wording/scope matter only; the round's Gate, note and `freshness_scope` already bound the claim.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS035.md`
