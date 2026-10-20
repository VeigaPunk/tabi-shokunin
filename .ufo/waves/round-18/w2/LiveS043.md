VERDICT: ISSUES

# S043 C1 receipt — independent re-fetch, identity, and teaches attack

Scope: one receipt, `corpus/evidence/round-18/source-recheck/S043.json` + `S043.excerpt.txt`, at
measured candidate REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (lane `refs/heads/master` equals that
revision; `git rev-parse` output below). Read-only against the lane: no production, fleet, sibling, Git
index, or jj write. All network probes were public GETs into a private `/tmp` directory; no browser was
launched; no credential or session content was used. The round-18 producer's `main` was not executed;
its exported `normalize()` function was imported read-only for verification.

## 0. Result at a glance

| Facet | Result |
|---|---|
| Receipt internal integrity (schema, row, URL, quote, excerpt, producer) | **held** — every checked field matches an independent observation |
| Fetched body vs receipt (`sha256`, `bytes`, HTTP) | **held** — exact equality, including full 64-hex digest |
| Source identity (commit-pinned raw blob) | **held** — GitHub contents API Git blob `5bdc8558…` equals `git hash-object` of the fetched body |
| Anchor (commit date, line ranges, `ToolAnnotations`) | **held** — commit dated 2026-10-20; `executeTool` div 1023–1185; error table 260–301 |
| Quote present at cited location | **held** — raw `index.bs:1570–1571`, Note 1570–1573, normalized offset 63321 |
| Does the quote support `teaches`? | **held, qualified** — quote is about agent-side *exposure*, from a non-normative section; the "only in-page executeTool" half is supported by the row anchor, not the quote |
| Live source freshness | **held today only by an extra check** — live `main` HEAD = `51ed7565`, live raw body byte-identical; the receipt itself does not establish this |
| `quoteSource: "new"` | **FALSIFIED** — the same 24-word sentence is the round-17 gate quote at `corpus/lessons/round-17.md:55`; the seat's own dossier calls it a re-quote |
| C1 counter | **51 accepted, 0 rejected**; S043 is accepted. `eligible_rows` at REV is 58 (already reported by `w2/ReRunC1.md`; not re-claimed here) |

The receipt is evidentially valid under the declared C1 contract and contributes to
`c1_rows_rechecked: 51`. The issues below are provenance and claim-scope defects, not a forged fetch or a
missing quote.

## 1. Exact re-fetch

Working directory `/tmp/tabi-r18-s043-recheck` (private). Command:

```sh
mkdir -p /tmp/tabi-r18-s043-recheck && cd /tmp/tabi-r18-s043-recheck && \
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP=%{http_code} BYTES=%{size_download} URL=%{url_effective}\n' \
  'https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs'
```

Observed (exit 0):

```text
HTTP=200 BYTES=24247 URL=https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs
76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004  body
91001 body
```

`%{size_download}` 24247 is the compressed wire size because of `--compressed`; the decoded body written
to disk is 91001 bytes. The receipt records `bytes: 91001` and `sha256:
76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`, i.e. the decoded body, which is
correct for `decode: "none"` after curl decompression. Receipt `httpStatus: 200` matches.

Quote located with the committed producer's own normalizer (imported, not executed):

```sh
node --input-type=module -e "
import {readFileSync} from 'node:fs';
import {normalize} from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs';
const r=JSON.parse(readFileSync('corpus/evidence/round-18/source-recheck/S043.json','utf8'));
const text=normalize(readFileSync('/tmp/tabi-r18-s043-recheck/body','utf8'));
const q=normalize(r.quote); const at=text.indexOf(q);
const ex=readFileSync('corpus/evidence/round-18/source-recheck/S043.excerpt.txt','utf8');
console.log({normalized_len:text.length,quote_at:at,receipt_offset:r.quoteOffset,match:at===r.quoteOffset});
console.log({q_words:q.split(/\s+/).length,receipt_words:r.quoteWords});
console.log({quote_in_excerpt_at:ex.indexOf(q),excerpt_len:ex.length});
console.log({excerpt_reconstructs:(text.slice(Math.max(0,at-600),at+q.length+600)+'\n')===ex});
console.log({occurrences_in_body:text.split(q).length-1});
"
```

Observed (exit 0):

```text
normalized_len 86244 quote_at 63321 receipt_offset 63321 match true
q_words 24 receipt_words 24
quote_in_excerpt_at 600 excerpt_len 1349
excerpt_reconstructs true
occurrences_in_body 1
```

Independent hashes of the committed artifacts at REV:

```text
ce89311a403ae79a3f3ef9ef20cd534aae2200f43eeee3bf340dde755d42182a  S043.json
7f5613874679a0932e94accf121ca930d4ed32418b76f0bda669ad03a158169a  S043.excerpt.txt
f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360  .ufo/waves/round-18/recheck-fetch.mjs
```

`excerptSha256` in the receipt equals the excerpt file digest; `producerSha256` equals the producer blob
digest at REV (also verified with `git show REV:path | sha256sum`); the excerpt is exactly the producer's
600-char-before / 600-char-after slice of the normalized body.

Raw line location (direct read, not grep-only): the quoted sentence starts at `index.bs:1570` and ends
`index.bs:1571`; the enclosing Note runs 1570–1573. This matches the receipt `note` range and is one line
wider than the round-17 lesson's "1570–1571 (dossier cited 1570–1572)" at
`corpus/lessons/round-17.md:55`.

## 2. Source identity and anchor

### 2.1 Commit-pinned blob identity

```sh
git hash-object /tmp/tabi-r18-s043-recheck/body
# 5bdc855828122dacbad7e3787bf56ed958c4593d
curl -sSL --compressed --max-time 90 -H 'Accept: application/vnd.github+json' \
  'https://api.github.com/repos/webmachinelearning/webmcp/contents/index.bs?ref=51ed75653aaa7f174f8dbe05d1bc327359bbc57c'
```

Observed GitHub contents API JSON (HTTP 200):

```json
{
  "sha": "5bdc855828122dacbad7e3787bf56ed958c4593d",
  "size": 91001,
  "encoding": "base64",
  "type": "file",
  "path": "index.bs",
  "download_url": "https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs"
}
```

The Git blob id of the fetched bytes equals the contents API's blob id at the pinned commit, and
`download_url` is exactly the receipt's `url`. This is stronger than the receipt's own
`anchorObserved` free text and establishes that the fetched body is the file at commit `51ed7565`, not a
HTML wrapper or branch tip.

Commit metadata (GitHub commits API, HTTP 200):

```json
{
  "sha": "51ed75653aaa7f174f8dbe05d1bc327359bbc57c",
  "commit": {"author": {"date": "2026-10-20T14:57:14Z"}, "committer": {"date": "2026-10-20T14:57:14Z"}},
  "message": "Discuss general agent ecosystem risks and link to agent security guidance (#334)",
  "parents": ["cb3d16964ab3e92cfd5f09901ed0504373a906e8"]
}
```

The row anchor's "(2026-10-20)" is the commit date, and the commit exists. `cb3d169` is the parent.

### 2.2 Anchor line ranges and content

Direct reads of the fetched body:

- `executeTool`: `<div algorithm>` opens at line 1023, `<dfn method for=ModelContext>executeTool(` at
  1024, `</div>` closes at 1185. Row anchor "§4.2 executeTool lines 1023-1185" holds; `ModelContext
  Interface` is the h3 at 688 under the h2 `API` at 661.
- Error table unit: "A <dfn>tool execution error</dfn>" at 260, table proper 264–291, and the cited
  260–301 span also includes the following Note 293–302 (the note that maps failures to DOMException
  names). Row anchor "§3 error table lines 260-301" holds as a unit; the table element itself closes at
  291.
- `ToolAnnotations` dictionary at 1203 and its use sites 873–882, 1003–1009, 1256–1268; the row's
  "ToolAnnotations at one commit" holds.
- Pre-metadata block: `Status: CG-DRAFT`, `Shortname: webmcp`, no `Date:` field (lines 1–12). Receipt
  `anchorObserved` "no date stamp" holds.

### 2.3 Live source check (outside the receipt)

The receipt URL is commit-pinned, so its fetch cannot by itself show the live source. Separate GETs:

```sh
curl -sSL --compressed --max-time 90 -o main.bs \
  'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/index.bs'
cmp -s body main.bs; echo "cmp_exit=$?"
# cmp_exit=0 ; sha256 76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004
curl -sSL --compressed --max-time 90 -H 'Accept: application/vnd.github+json' \
  'https://api.github.com/repos/webmachinelearning/webmcp/commits/main'
# sha 51ed75653aaa7f174f8dbe05d1bc327359bbc57c, date 2026-10-20T14:57:14Z
```

Published page (`https://webmachinelearning.github.io/webmcp/`, HTTP 200, 511987 bytes on disk,
sha256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`):

```text
<meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision">
<time class="dt-updated" datetime="2026-10-20">20 October 2026</time>
rendered sentence occurrences: 1
```

Rendered form: "Despite the name of this API (i.e., WebMCP), this specification does not prescribe the
format in which tools are exposed to the browser agent. Browsers are free to distill and expose tools
via Model Context Protocol, other proprietary "function calling" methods, or any other way it deems
appropriate." The raw-markup receipt quote does not occur in the rendered page (expected; the receipt
cites the raw `.bs`); the equivalent rendered sentence does, once.

**Live verdict:** held today — live `main` HEAD and the published page revision both equal the pinned
commit `51ed7565`, and the live raw body is byte-identical. No drift, no unreachable source. But see F2:
this equality comes from the extra checks above, not from the receipt or the offline counter.

## 3. Does the quote support `teaches`?

Row `teaches` (`corpus/SOURCES.md:57` at REV): "Agent-side invocation is not specified — the draft fixes
only in-page executeTool and its DOMException names — so an invocation receipt is build-scoped, never
spec-derived."

The quote (raw `index.bs:1570–1571`, Note 1570–1573):

> Despite the name of this API (i.e., Web*MCP*), this specification does not prescribe the format in
> which tools are exposed to the [=browser agent=].

Support found in the same body:

- The only defined invocation algorithm is the page-side `ModelContext.executeTool()` method
  (`index.bs:1023–1185`); its `callerDocument` is derived from `this`'s relevant global object, i.e. page
  script, not an agent-side API.
- `ModelContextTool.execute` is described as "A callback function that is invoked when an [=agent=]
  calls the tool" (`index.bs:1244`), but no agent-side call format, transport, or invocation API is
  defined anywhere in the body. A body-wide scan for "invok"/"invocation" returns only that page-side
  algorithm, the internal "invoke the execute callback" steps, and prose about agents invoking tools.
- The execution-error table maps platform failures to `DOMException` names
  (`index.bs:260–301`), matching the second clause.

Qualification (not drift): the quoted sentence's literal subject is the **format of tool exposure** to
the browser agent, not "invocation". The step immediately before it says exposure is
`[=implementation-defined=]` "in whatever way it accepts" (`index.bs:1566–1568`). The sentence also sits
in a section explicitly marked `<em>This section is non-normative...</em>` (`index.bs:1478–1482`), inside
a `Note` (non-normative by Bikeshed convention). It is the spec's own statement about its scope, but it
is not normative text, and it does not by itself prove the absence of an agent-side API. That absence is
established by reading the API surface (and is consistent with S041's Chromium-only CDP
`WebMCP.invokeTool`). A strict reader should treat `teaches` as held via quote + anchor + absence, not as
entailed by the quoted sentence alone.

No counterexample to `teaches` was found in the body: there is no agent-side invocation definition at
commit `51ed7565`. **Verdict: held (scope-qualified).**

## 4. Findings

### F1 (hard, provenance): `quoteSource: "new"` is false for S043

Evidence:

- `corpus/evidence/round-18/source-recheck/S043.json:15` — `"quoteSource": "new"`.
- `S043.json:22` — "Gate quote was the rendered form — raw carries Web*MCP* and [=browser agent=] markup,
  hence new quote."
- `corpus/knowledge/source-recheck-round-18.md:104` — "for S018, S029, S035 and S043 the receipt's
  `quoteSource` is `new` (the quote was chosen in round 18, not taken from an earlier lesson)."
- `corpus/lessons/round-17.md:55` (byte-frozen, present at REV) already carries the same gate quote:
  `"Despite the name of this API (i.e., WebMCP), this specification does not prescribe the format in
  which tools are exposed to the browser agent." (24 words)`, cites `index.bs:1570-1571 at commit
  51ed7565`, explicitly notes "the raw source carries `Web*MCP*` and `[=browser agent=]` markup; the
  rendered page reads the same words", and records the same raw sha
  `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004` and rendered sha
  `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`.
- `.ufo/waves/round-17/w2/ReopenS043.md:34` repeats the quote, 24 words.
- The round-18 seat's own dossier, `.ufo/waves/round-18/w1/Recheck21.md:23-28`, says: "Quote (24 words,
  `--quote-source new`) … Round-17 already noted the `Web*MCP*` / `[=browser agent=]` markup difference,
  so this is a re-quote of the same sentence, not a body change."

The seat calls it a re-quote; the receipt labels it new; the note defines new as "not taken from an
earlier lesson". Under that definition the label is false. Only the raw-markup spelling of the same
sentence is new, not the quote choice. The C1 counter does not read `quoteSource`
(`measure-c1.mjs:315–378`), so `c1_rows_rechecked` is unaffected. Fix: record `quoteSource` as
`corpus/lessons/round-17.md:55` (or
`.ufo/waves/round-17/w2/ReopenS043.md:34`), or change the note gloss to "raw-markup variant of the
round-17 gate quote". Do not claim it was chosen in round 18.

Finite counterexample: same source lines (1570–1571), same 24 words, same raw and rendered body digests,
already committed at REV before the round-18 receipt. The only difference is `WebMCP` → `Web*MCP*` and
`browser agent` → `[=browser agent=]`.

### F2 (claim scope): C1's "live source" wording counts immutable availability as freshness

Evidence:

- `PLAN.md:15-16` — "Source rows re-verified against their **live** source with a committed recheck
  receipt: 0 → N (target 51 = every row not superseded at B)."
- S043's `rowUrl` is a GitHub blob at commit `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`; the counter
  classifies it `immutable_pinned` (`measure-c1.mjs:247–259`; REV run reports `url:
  {"immutable_pinned":17,"living_live":46,"own_work":1}`).
- The quote-presence test is revision-insensitive. The same sentence occurs at three different
  `index.bs` revisions with three different body digests:

```text
f14762e6 (prior published revision named in S020's anchorObserved): HTTP 200, 23319 B,
  sha256 eab56a31bc3b3934308f449587929809d04d2d47d3c10a165d3a0a197258c23e, quote at normalized 62596
cb3d16964ab3e92cfd5f09901ed0504373a906e8 (parent of 51ed7565): HTTP 200, 23353 B,
  sha256 dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39, quote at normalized 62697
51ed7565 (receipt): HTTP 200, 91001 B,
  sha256 76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004, quote at normalized 63321
```

- A row whose source cell cited either earlier commit (with the same quote) would yield the same
  `held` receipt and count; the counter never compares the pin to the live branch. Therefore
  `quoteFound` cannot show that the cited pin is the live source; only an additional live-tip
  comparison can.
- The round-18 note is careful and already limits this: S043 is listed as pinned at
  `corpus/knowledge/source-recheck-round-18.md:110`; `:140-141` say quote presence is not claim truth
  and receipts "say nothing about how any product behaves, and the 51 rows are not a statement of
  current live product support"; the counter emits `freshness_scope: "round-18 receipt date 2026-10-20
  only; not a reusable freshness due-date gate"` (`measure-c1.mjs:471`).
- For S043 specifically, the separate live checks in §2.3 show live `main` HEAD = the pin and the live
  raw body is byte-identical, so there is **no drift today**. The defect is the claim word "live" and
  the scalar reading, not the pinned bytes.

Recommendation: reword C1 to "re-verified against the cited source (pinned or live)" and, for pinned
rows, record a `liveTipObserved` field (e.g. GitHub default-branch HEAD / blob equality) instead of
counting the pin alone as freshness. S043 would pass that added check today.

Do not read this as a duplicate of `w2/ReRunC1.md`: that report covers the revision-relative
`eligible_rows: 58` denominator (64 rows at REV minus six superseded; `measure-c1.mjs:465,473`). This
finding is about what a pinned-row receipt can establish.

### F3 (low, reproducibility): the recorded `command` is not shell-runnable

`S043.json:7` records:

```text
curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} 'https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs'
```

The producer builds this by space-joining argv (`recheck-fetch.mjs:97`) while executing argv directly
(`:95`), so the fetch did happen. But the rendered command is not shell-safe: the user-agent is one argv
element containing spaces, parentheses and a semicolon, joined without quoting.

```text
bash -n -c '<receipt.command>'  -> exit 2
bash: -c: line 1: syntax error near unexpected token `('
```

The counter requires this exact canonical string (`measure-c1.mjs:233-236,356`), so this is a
schema-wide rendering limit, not an S043-specific fetch error. Impact: a verifier cannot paste the
receipt's command; they must reconstruct the argv (the `--live` path does). Fix: record the argv array,
or shell-quote the user-agent. Severity low; it does not affect the digest, quote, or count.

### Q1 (qualification, not a failure): quote is non-normative and about exposure, not invocation

The quoted Note is inside a section explicitly marked non-normative (`index.bs:1478–1482`) and its
literal subject is the format in which tools are **exposed**. The `teaches` claim's "only in-page
`executeTool` and its `DOMException` names" half is supported by the row anchor (`index.bs:1023–1185`,
`:260–301`), not by the quote. The receipt's `excerpt` (1200 chars around the quote) contains the
exposure step and the Note but not the `executeTool` algorithm or error table. A future receipt for this
row should either quote a normative API sentence or state explicitly that the invocation-absence clause
is an inference from the API surface, as `S043.json:22` does in part. This does not overturn `held`.

Also note: the row anchor cell (`corpus/SOURCES.md:57`) does not name lines 1570–1573 where the receipt
quote lives; the receipt `anchorObserved` only records the metadata block. A reader following only the
row anchor cannot locate the gate quote. The round-18 note does cite 1570–1573, so this is a discovery
gap, not a false anchor.

## 5. Counter observations (read-only)

```sh
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c
```

At REV (exit 0):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

At baseline B (exit 0): `c1_rows_rechecked: 0`, `eligible_rows: 51`, `rejected: []`. S043 is accepted:
`rejected` is empty, 51 receipts exist, and the S043 JSON is one of them. The counter does not validate
`quoteSource` or live-tip identity, consistent with F1/F2. `--live` was not run across all 51 rows; the
S043 single-row re-fetch in §1 is the live check for this seat.

## 6. S029 own-work cross-check (as instructed, not network)

The brief required `git show` at the pinned own-work commit rather than a network fetch. Verified:

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show \
  837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum
# b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
# wc -c -> 97073
```

The receipt's `sha256` and `bytes` match; quote offset 74695 and 17 words match; the excerpt
reconstructs exactly. The same file at lane tip/B has the same digest. S029 is `own-work`, so it is
excluded from the counter's `held` (50) and counted only in `c1_rows_rechecked` (51); it is hygiene, not
live freshness, exactly as the round-18 note says.

## 7. Limits

- GitHub API commit lookups for `f14762e6` and `cb3d169` returned HTTP 403 (unauthenticated rate limit)
  after the earlier successful calls. Raw bodies for both revisions were already fetched and quoted; the
  dates of those two commits were not needed for any finding. No retry was made.
- No `lsp` device/server was available for the Bikeshed `.bs` file in this session; line locations and
  absence claims were verified by direct reads of the fetched body (whole API surface and headings),
  not by grep alone. The one body-wide `invok` scan is corroborating, not the proof.
- No full 51-row `--live` run and no browser probe. The S043 re-fetch is the only network evidence for
  this receipt; the published-page and main-branch checks are extra identity checks.
- `curl -w %{size_download}` reports compressed wire bytes under `--compressed`; on-disk body sizes are
  the `bytes` values above. The receipt records the decoded body, which is correct.
- No production producer run, no lane writes, no Git index or jj writes.

Files written: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS043.md`
