# RevQuarCross — quarantine verdict cross-sample (round 42, wave 1)

Seat: `RevQuarCross`. Lane `tabi`. Milestone: quarantine cross-sample, judged on discernment.
Access date 2026-10-28. Leaf only — no subagents, no dispatch, no git/jj mutation, no commits.
Read-only over `/home/vgpnk/Projects/shokuknow`, the production tree and sibling repos.
No tool installed; pacman not run (see §6). Scratch `/fast/scratch/hyaku/tabi-r42/RevQuarCross/`
created and deleted before yield; receipts preserved at
`.ufo/waves/round-42/w1/RevQuarCross/receipts.md`.

**Axes named.** (a) fetch existence — did the seat open the registered source itself;
(b) letter derivability — does the enum letter follow from bytes I can re-fetch;
(c) evidence internal consistency — id/URL/status/bytes/sha256/justification present and mutually
coherent; (d) delta honesty — is a claimed round-40-vs-today difference a real temporal change or an
artefact of per-request server variance; (e) cross-seat uniformity — same evidentiary signal must
produce the same letter.

**Sampled seats (all four reports existed; none could-not-evaluate).** Polls at 12:38, 12:39 (two
present), 12:42 (three), and 12:44 after a 90 s wait (`QuarR4219/report.md`,
`PRESENT QuarR4219 2026-10-28 12:42:04`).

| seat | ids | seat letters | my re-derived letters | agreement |
|---|---|---|---|---|
| QuarR4201 | S102, S106 | misbound, misbound | misbound, misbound | agree, agree |
| QuarR4208 | S134, S135 | misbound, **absent** | misbound, **misbound** | agree, **disagree** |
| QuarR4214 | S153, S154 | misbound, misbound | misbound, misbound | agree, agree |
| QuarR4219 | S176, S171 | misbound, unreachable | misbound, unreachable | agree, agree |

7 of 8 letters agree. Every seat fetched; no verdict is asserted without a live GET. The one
disagreement is S135, and it is a classification-standard disagreement, not a fabrication.

---

## QuarR4201 — S102, S106

Report `.ufo/waves/round-42/w1/QuarR4201/report.md`, evidence `evidence-S102.txt` (4307 B),
`evidence-S106.txt` (4292 B).

### S102 → misbound — **agree**

My fetch of the registered URL:

```
curl -sSL --max-time 60 -o s102.body -w 'STATUS %{http_code} URL %{url_effective} BYTES %{size_download}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md'
STATUS 200 URL https://chromium.googlesource.com/…/README.md BYTES 25431
a11c1f185464e10a96a3e7335a494372ad98d1566951928839372a17caf90c61  s102.body
```

The gitiles blob, which is the document rather than the HTML shell:

```
curl … '…/README.md?format=TEXT'   → STATUS 200 BYTES 18492
ff07a74e83b412fa581ed22782dc7b6dab972d07572e118c4e27657b22e02a61  s102.raw      (base64)
07f83a2c0f5ab37155b70568a6ab30dad3b033d32aa91ce0d24cedc0f931df9d  s102.raw.txt  (13868 B decoded)
```

Absence, independently:

```
python3 loc.py x/s102.raw.txt 'Last updated 2026-10-05 UTC'
{"quote": "...", "exact": false, "normalized": false, "all_tokens": false,
 "missing": ["last", "updated", "2026-10-05", "utc"]}
```

and in the decoded markdown `Last updated`=0, `2026-10-05`=0, `UTC`=0, `2026`=0, 291 newlines,
first line `# Chrome DevTools Protocol Contributor guidelines` → first line exactly
`# Chrome DevTools Protocol contribution guidelines`. The seat's `07f83a2c…` and `13868` are
reproduced byte for byte.

Presence on the quoted-elsewhere source, independently:

```
curl … 'https://developer.chrome.com/docs/extensions/reference/api/debugger'
BYTES 192126   sha256 808613268c52db4754f65881dc173aa36e20d31004d52475facd4ed37f62c47f
b.find('Last updated 2026-10-05 UTC') → 173886   count 2
tag-strip context: '… Java is a registered trademark of Oracle and/or its affiliates. Last updated 2026-10-05 UTC.'
```

The seat reported exactly `raw index 173886`, the same sentence, and the census binding — my
independent fetch lands on the same index inside a shell whose length differs by 4 B. That is
strong corroboration, not a copy: the index is a position they could not have guessed.

`quote-lint-full-v5.json` records the S102 `ABSENT` quote with `line` beginning
`| S103 | \`chrome.debugger\` API reference — https://developer.chrome.com/docs/extensions/…`,
i.e. the quote was carried from S103's row. `misbound` follows.

### S106 → misbound — **agree**

```
curl … 'https://www.rfc-editor.org/rfc/rfc9309.txt' → STATUS 200 BYTES 25265
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207   (identical to the seat's)
607 lines
```

Both staged spans absent (exact, normalized, all-tokens). Non-ASCII code points: exactly 3 —
`U+FEFF` at offset 0 and `U+00FC` at 24946 and 25213, both inside `CH-8002 Zürich`, exactly as the
seat states. Its RFC citations check out at the lines it names:

```
sed -n '100p'   → '   These rules are not a form of access authorization.'
sed -n '395,396p' → 'unavailable to the crawler, then the crawler MAY access any resources' / 'on the server.'
sed -n '402p'   → '   MUST assume complete disallow.  For example, in the context of HTTP,'
```

Presence on S107 (`…/devtools/agents/webmcp-debugging?hl=zh-tw`, 200, 176236 B): both headings
count 2 each. Census `line` cell begins `| S107 | 使用 AI 代理偵錯 WebMCP 工具…`. `misbound` follows.

Evidence fields: id, URL, final URL, status, bytes, sha256, verdict, justification — all present.

### Note on this seat's delta language (non-material)

It writes that the HTML shell hash "moved (`f4f00ae2…` → `a6da248f…`) at the same 25431 bytes" and
presents that as a round-40-vs-today observation. The gitiles shell embeds four per-response CSP
nonces; two of my consecutive fetches of the same URL differ in the nonce lines only:

```
- <script nonce="gp//dqYg3MbaXElzgKMQhj1ugZx8HS">
+ <script nonce="rQ39wWRQITDI9/lkjK7sEKSI6+bZIo">
```

So the shell digest is fetch-specific and its "movement" is not evidence of anything. This does not
touch the verdict — the seat's load-bearing claim is the *decoded blob* digest, which is stable and
which I reproduced. Flagged only because a later audit that reads "hash moved" as change would be
misled.

## QuarR4208 — S134, S135

Report `.ufo/waves/round-42/w1/QuarR4208/report.md`, evidence `evidence-S134.txt` (3081 B),
`evidence-S135.txt` (2599 B). No bodies retained.

### S134 → misbound — **agree**

Registered URL 200; `評估測試和偵錯` absent in **12** independent body samples of mine (8 variants
plus 3 under the seat's own UA plus the first), and `評估` / `偵錯` / `測試` each 0. Page
`lang="en"`, h2 set English (`Build safer agents` … `Evaluate your agent's vulnerabilities` …),
matching the seat's heading list.

Presence on the neighbour's registered URL (S135, `…/best-practices?hl=zh-tw`):
`評估測試和偵錯` = **2** — the `data-text` attribute and the element text, exactly as the seat
described:

```
<h2 data-text="評估測試和偵錯" id="eval_testing_and_debugging" tabindex="-1">評估測試和偵錯</h2>
```

Census `line` for the S134 ABSENT record begins `| S135 | WebMCP 最佳做法 …`. `misbound` follows,
and the seat's delta reasoning ("r40's 'present' meant the gate's own English sentences, not the
register quote") is the right reading of `.ufo/waves/round-40/w1/ScoutQuarantine134/report.md`.

### S135 → seat says **absent**; I derive **misbound** — **disagree**

What the seat got right, verified by me: the registered URL opens (200, `lang="zh-TW-x-mtfrom-en"`,
title `WebMCP 最佳做法`), and `tools/list` is absent under raw, HTML-unescaped, tag-stripped and
casefold search in 5 of my samples of both size variants:

```
c1 bytes=129351 hits=0 … c4 bytes=129355 hits=0 c5 bytes=129355 hits=0
```

`工具` 45, `tools` 14 raw / 17 casefold, `list` 18 raw / 23 casefold — the seat's "(17) and (23)"
are the casefold counts, consistent.

Where I part company is the letter. The seat itself records the decisive signal and then declines
it:

> "The local gate file attributes a `tools/list` section to S136's URL; that URL was not fetched
> (this row did not 404, and S136 was not assigned), so it is not used as a misbind proof."

That signal is not merely local: the census record for the S135 ABSENT quote has `line` beginning

```
| S136 | WebMCPとは｜Chrome 149・Edge 150で始まった仕様 — ai-heartland.com — https://ai-heartland.com/explain/webmcp/ …
```

and `merge/tabi/SOURCES.append.md:41` registers S136 with anchor `§"検証環境" and §"tools/list"
sections`. I fetched it (read-only GET, allowed as a classification fetch and named as such):

```
curl … 'https://ai-heartland.com/explain/webmcp/'
STATUS 200 URL https://ai-heartland.com/explain/webmcp/ BYTES 173587
5dca27349ecdec7214b53838b7083bba8451714d396c80faf859b9f5fda4dd31
tools/list → 5 occurrences   検証環境 → 2 occurrences
```

Under the enumeration the wave uses — "misbound (the quote/text belongs to a different registered
source)" — the registered span `tools/list` belongs to S136's registered row: it is S136's own
declared anchor and appears 5× there. Seven sibling rows were classified misbound on precisely
this evidence shape: S102→`| S103 |`, S106→`| S107 |`, S134→`| S135 |`, S153→`| S154 |`,
S154→`| S156 |`, S176→`| S177 |`; each of those seats fetched the neighbour and reported
*quote present there*. S135→`| S136 |` is the eighth instance of the same census artefact, and the
only one labelled absent. My S136 fetch closes the gap the seat left open.

Procedural fairness: the assignment's own step 3 authorises a corrected-location fetch only "if the
exact URL 404s", so the seat's restraint was defensible *under a literal reading of that clause*.
But `absent` is a claim about the register's binding, and the register's own `line` cell already
names S136; declining to look does not make the binding absent. The consequence is not cosmetic:
`build-quarantine-tsv.mjs` copies the evidence `verdict:` field into
`.ufo/waves/round-42/quarantine/re-adjudication.tsv`, which the frozen C2 checker reads at r4. A
`absent` in that cell records a mis-binding as a genuine payload absence, which is exactly the D4
class this round is supposed to close.

### Delta language (non-material, but same flaw as the others)

The report states "Content-length moved 111899 (r40) to 111895 (today)". The page is **bimodal
within a single minute**; my eight fetches gave 111899 six times and 111895 twice, all with distinct
digests, and the 4-byte delta is devsite experiment-flag churn inside the bootstrap script, not
article text:

```
A: …["MiscFeatureFlags__remove_cross_domain_tracking_params","Profiles__enable_completeco…
B: …["DevPro__enable_code_assist","Cloud__enable_cloudx_experiment_ids…
```

The seat's conclusion (quote still absent) survives, and its limitation note about per-response
nonces is honest, but "moved … to …" attributes sampling noise to time. Same for S135's
"content-length is still 129355": 129355 and 129351 both occur at this moment.

## QuarR4214 — S153, S154

Report `.ufo/waves/round-42/w1/QuarR4214/report.md`, evidence `evidence-S153.txt` (3425 B),
`evidence-S154.txt` (2986 B), **and retained bodies** `s153.body/.hdr`, `s154.body/.hdr`,
`s156.body/.hdr`.

### S153 → misbound — **agree**

```
curl … '…/guides/webmcp/agentic-javascript-tools/guide.md'
STATUS 200 BYTES 22859  sha256 7a62b973f06d1dbae03051afc6279717232e38e7342b9e249e51ef2a70cb507f
CJK characters: 0
Chrome versions present: 154 ×2, 155 ×2, 156 ×2 — the literal string '153' occurs 0 times
```

The seat's sha256, byte count and "CJK 0 / no Chrome 153" statement are exact. Its nearest English
sentence is present (`retrieve an array of` = 1). Its cross-reference to round 27 is accurate:
`.ufo/waves/round-27/quarantine/QuarantineC.md:27` carries the identical
`7a62b973f06d1dbae03051afc6279717232e38e7342b9e249e51ef2a70cb507f`.

Both Chinese spans are the *next* registered source's own gate quotes, and I found them there:

```
S154 page, tag-stripped: '使用 document.modelContext.getTools() 检索可用工具。此异步方法会返回…'   (idx 8216)
S154 page, raw:          '从 Chrome 153 开始，您可以取消注册工具，而无需取消和中断正在进行的执行。'  (count 1)
```

and `lanes/tabi/round3/SOURCES-PROPOSED.md` "Gate — S154" lists exactly those two lines. Census
`line` for both S153 ABSENT records begins `| S154 | 命令式 API`. `misbound` follows.

### S154 → misbound — **agree**

```
curl … '…/imperative-api?hl=zh-cn' → 200, 180605 or 180609 (bimodal)
in BOTH variants: Error = 0, NotSupported = 0, WebMCPNotSupportedError = 0
从 Chrome 153 开始 = 1
```

The zh-CN page is the right document for S154's own Chinese anchors and is not an error shell; the
registered identifier is simply not in it.

Presence on the neighbour:

```
curl … 'https://www.zapstudio.dev/webmcp/errors'
STATUS 301 → https://www.zapstudio.dev/docs/webmcp/errors, REDIR 1, STATUS 200 BYTES 98299
d6fbbfda79e91ee989eab12928920971b258fdd159bd9e39a05f583f7b695d1b
WebMCPNotSupportedError → 11 occurrences, first at byte offset 6320 (meta description)
tag-stripped: 'registerTool rejects with WebMCPNotSupportedError when called in a browser without WebMCP support:'
```

Every figure matches the seat's evidence, including the redirect code 301/`location:
/docs/webmcp/errors` and the offset 6320. Census `line` begins `| S156 | Errors — Zap Studio
WebMCP`. `misbound` follows.

### Evidence hygiene — best of the four

Its three retained bodies hash exactly to its stated digests and sizes:

```
22859 s153.body  7a62b973…   |  180609 s154.body  08589ac1…  |  98299 s156.body  d6fbbfda…
```

Because the bodies are kept, its claims can be re-checked after the fact. This is the only sampled
seat for which that is true, and it is what makes a volatile-page digest auditable at all (see
Finding 3).

Minor: `s156.hdr` records `content-length: 0` (chunked) while the body is 98299 B — an artefact of
the redirect chain, not an error in the claim, which cites the body size.

## QuarR4219 — S176, S171

Report `.ufo/waves/round-42/w1/QuarR4219/report.md`, evidence `evidence-S176.txt` (4185 B),
`evidence-S171.txt` (4691 B). No bodies retained.

### S176 → misbound — **agree**

```
curl … 'https://web-mcp.net/security-guide' → 200, 385056 B, 0 redirects
x-matched-path: /security-guide   x-vercel-cache: HIT   x-nextjs-prerender: 1
origin trial / Understand origin trials / Third-party origin trials → 0 / 0 / 0
token 'trial' (any case, whole 385056-byte body incl. inline scripts/RSC payload) → 0
requestUserInteraction → 16
```

The seat's hardest claim — that the token `trial` does not occur anywhere in the body — is exactly
right, and it is the claim that makes absence robust rather than incidental.

Presence on S177 (`…/docs/web-platform/origin-trials`, 200, 138233 B):

```
'Understand origin trials'          raw 1
'Third-party origin trials'         raw 4  (case-insensitive 5)
'origin trial' not followed by 's'  16
```

The seat reported 1, 4 and 16 — matching the raw counts. Body sentence present: "You can register
for an origin trial to enable a feature for all users on your origin , without requiring them to
toggle any flags…". Census `line` begins `| S177 | Get started with origin trials`. `misbound`
follows.

### S171 → unreachable — **agree**

```
registered URL https://chromestatus.com/features/5117755740913664
STATUS 404 BYTES 207 sha256 e9639e3c4681ce85f852fbac48e2eeee5ba51296dbfec57c200d59b76237ab80
```

Identical to the seat's digest and size, and to round 27's prefix
(`.ufo/waves/round-27/quarantine/QuarantineD.md:24` — `404 | 207 | e9639e3c4681ce85`).

Corrected spelling `/feature/…`: 200, 3710 B, and `WebMCP` / `Proposed` / `origintrial` /
`5117755740913664` each **0** — so the shell is not evidence either way, exactly as the seat says.

Gate-named JSON: 200, 21011 B, `82bdbe63bed5326c00cc4b268af41f4d5c3910f333b3e1317a7bb16d617ad191`,
**byte-stable across 3 fetches**. Q2 and Q3 exact; Q1 exact through `paths in their UI.` then
continues `With WebMCP, agent-service interaction…` — a trailing-quote truncation, as the seat says.
`origintrial` is JSON `false`, not `{}`; `updated.when` 2026-09-28 — again matching.

Letter: the register places this row in the *never-checked / unreachable* block with no quote and a
malformed id cell (`S171` plus trailing backtick, verified verbatim). The registered source still
cannot be fetched, and the record is only reachable at a URL that is not the registered one.
`unreachable` is the correct letter, and the seat is to be credited for refusing to upgrade it to
`present` or `misbound` on the strength of a substitute URL — the opposite failure mode to the S135
case.

Minor: the shell digest `c9cc294b…` reported for `/feature/` is not reproducible (I got
`bd2e0cff…`, `30b859eb…`, `7d844680…`, `00658dee…` at 3710 B on four fetches); the body is an SPA
shell that varies per request. The conclusion (0 occurrences of the record's fields) held in every
one of my samples, so nothing turns on it.

---

## Findings

**Finding 1 — S135 is lettered `absent` where the wave's own enumeration and its own census record
demand `misbound` (QuarR4208).** Severity: medium; it propagates.
Evidence: `evidence-S135.txt:27` `verdict: absent`; the same file names S136's attribution and
declines to verify it; `quote-lint-full-v5.json` (tabi, S135, `ABSENT`, `tools/list`) carries a
`line` cell beginning `| S136 | WebMCPとは…`; `merge/tabi/SOURCES.append.md:41` gives S136's anchor
as `§"検証環境" and §"tools/list"`; my GET of that page returns `tools/list` **5×** and
`検証環境` 2×. Seven sibling rows with the identical evidence shape were lettered `misbound`;
S135 is the outlier. The `verdict:` field is consumed verbatim by
`quarantine/build-quarantine-tsv.mjs` into the TSV that the frozen C2 checker validates at r4, so
this cell will record a mis-binding as a payload absence. Recommend the L1 correct the cell to
`misbound` on the strength of the S136 fetch (reproduce:
`curl -sSL https://ai-heartland.com/explain/webmcp/ | grep -c 'tools/list'` → 5) rather than
re-run the seat. If instead the wave intends `absent` for any row whose neighbour was not fetched,
that standard must be stated, because 7 other rows did not follow it.

**Finding 2 — three seats report per-request byte/digest variance as a round-40-vs-today change.**
Severity: low (no letter changes); affects auditability of the delta notes.
QuarR4201 "the HTML shell hash moved … at the same 25431 bytes"; QuarR4208 "Content-length moved
111899 (r40) to 111895 (today)" and "content-length is still 129355"; QuarR4214 "Size today is
180609 versus that seat's 180605". Measured: S134 serves 111899 ×6 and 111895 ×2 **within one
minute**; S135 serves 129355 ×6 and 129351 ×2; S154 serves 180609 ×6 and 180605 ×4; S102's shell
differs only in four CSP nonces; S176's 385056-byte body differs only in Cloudflare
`data-cfemail` obfuscation tokens; the `/feature/` S171 shell is a different 3710-byte body every
request. So the "r40 value" is not a prior state of the document — it is one draw from the same
distribution. The correct statement is "bimodal; r40 and now both sampled the same distribution".
All four seats' substantive conclusions survive, and QuarR4214's limitation note already names the
nonce problem; the point is that sampling variance must not be narrated as temporal change.

**Finding 3 — a sha256 on these pages is unverifiable unless the body is retained.**
Severity: low, forward-looking.
Deterministic sources reproduce exactly (rfc9309.txt, the S153 raw guide, zapstudio
`/docs/webmcp/errors`, chromestatus `api/v0` — each identical over 2–3 fetches, matching the seats'
digests). Every Chrome-for-Developers / gitiles / Next.js-fronted source does not: S102, S134,
S135, S154, S176, S177, S171-shell all yielded distinct digests per request at constant or bimodal
length. Three of the four sampled seats retained no body, so their digests cannot be re-checked by
any later reviewer; QuarR4214's retained bodies (hash-verified against its own claims) are the
model. Recommend the wave require the fetched body beside the evidence file for any source whose
GET is not byte-stable, or require the evidence to state the digest is fetch-specific.

**Finding 4 — evidence schema is sound across the sample; the 7-vs-8 letters is a standard
problem, not a discipline problem.** Each of the 8 evidence files carries id, registered URL, final
URL, HTTP status, bytes, sha256, a located/absent section with a surrounding sentence, and a
2–6 sentence justification, and each is ≥ 1777 B (frozen r4 floor is 200 B). All 38 slice ids have
exactly one evidence file, no duplicates, no extras. No seat asserts a verdict without a live GET,
and each reports the response `Date`. Two seats (4201, 4208) reproduce the census `line` cell as
their mis-binding proof; two (4214, 4219) reproduce it and additionally fetched the named neighbour.

## Residual risk

- One-letter change (S135) reaches the r4 ledger unless corrected; C2's calibration verdict reads
  that ledger.
- Three of four seats' digests cannot be re-verified post-hoc; my agreement on those rows rests on
  independent re-fetches of content, not on digest equality.
- The `absent`/`misbound` boundary for a source whose stored body also varies per request (S176
  style) is drawn on token absence, not on a stable digest; a future round could draw it
  differently.
- QuarR4208's S134 delta note and QuarR4214's S154 delta note will read as temporal changes to a
  reviewer who does not re-measure; neither affects the verdict.

## Verification gaps (explicitly not checked)

- Browser-rendered content was not evaluated for any row; all four seats and I compare server HTML.
  For S171 the human page is a client-rendered shell, so this is irreducible without a browser, and
  the seats correctly fell back to the gate-named JSON and said so.
- The remaining 34 quarantine rows were not re-adjudicated by me (other seats' scope); only slice
  completeness and evidence-file hygiene were checked across all 38.
- No attempt to re-run the frozen C2 checker or the C1 chain; out of this seat's scope.

## Scope compliance

Read-only GETs to the registered and classification URLs only; no logins, no forms, no
consequential requests. No writes under `/home/vgpnk/Projects/shokuknow`
(`find … -newermt '2026-10-28 11:00'` → only `.git`), no writes in the production tree outside this
seat's dir, no sibling repos, no commits/pushes/jj, no spawned agents. Scratch deleted; receipts
kept at `.ufo/waves/round-42/w1/RevQuarCross/receipts.md`. No tool installed — `curl` and
`python3` sufficed; pacman not run, and the only host package/tool activity today
(`/home/vgpnk/.local/bin/omp` 10:50, `OpenBot-0.52.1-x86_64.AppImage` 11:42, pacman 11:43)
predates wave dispatch (`claims.json` 12:01, `w1-dispatch.json` 12:20) and is not attributable to
these seats.

**Incident — one write escaped the lane bound and was reverted (disclosed, not hidden).** This
seat's first two `write` calls used cwd-relative paths (`pwd` was `/home/vgpnk/Projects/shokunin`),
so `report.md` and `receipts.md` landed briefly in the read-only fleet repo at
`/home/vgpnk/Projects/shokunin/.ufo/waves/round-42/w1/RevQuarCross/` (that tree did not pre-exist —
`ls .ufo/waves/` shows lane-named waves, no `round-42`). Detected immediately on the follow-up `cp`,
before anything else touched them. Correction: both files were `mv`-ed to this seat's dir in
`tabi-shokunin`, then `rmdir` removed `RevQuarCross`, `w1` and `round-42` in the fleet repo.
Verified clean: `ls -d /home/vgpnk/Projects/shokunin/.ufo/waves/round-42` → `NONE`;
`git status --porcelain | grep -c 'ufo/waves/round-42'` → `0`. No fleet-repo file was modified,
created at any surviving path, or deleted; the three created directories are gone and all later
writes used absolute paths. Recorded here because the boundary is the point, not because content
leaked.

VERDICT finding 7/8 letters independently reproduced (S102, S106, S134, S153, S154, S176 misbound; S171 unreachable); S135 lettered absent must be misbound — its own census line names S136 and that page carries tools/list 5x, matching the standard applied to the seven sibling rows
