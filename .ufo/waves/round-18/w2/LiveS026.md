VERDICT: PASS

# LiveS026 — C1 receipt S026 (re-fetch + teaches/freshness attack), with S029 own-work cross-check

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, measured revision
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (tip = `refs/heads/master` at probe time; baseline B =
`2bff864fdfee684ddbcd066cc8e735adaba2735c`). Read-only production: no lane edit, no jj/git write; probes wrote
only `/tmp/tabi-r18-s026-69GY/` and `/tmp/tabi-r18-s029-blob.json`. No tool installs were needed
(node v24.21.0, curl, python3 already present). No producer run: `recheck-fetch.mjs` was imported for its
exported `decodeBody`/`normalize` only (its `main()` is guarded by `process.argv[1]` and did not run).

## 1. What was checked

- Receipt `corpus/evidence/round-18/source-recheck/S026.json` and `S026.excerpt.txt` at REV.
- Registry row `corpus/SOURCES.md:40` at REV via `git show 530f40a9:corpus/SOURCES.md`.
- Original quote source `corpus/lessons/kaika-fleet-round-1.md:69` (exact line confirmed by `grep -n`).
- Committed note `corpus/knowledge/source-recheck-round-18.md:11-44,76` and lesson
  `corpus/lessons/round-18.md:12-14`.
- Own live re-fetch of the receipt's `url`, plus both HTML identities for the same answer.
- S029 cross-check from the pinned git object only (no network), as instructed.

## 2. Live re-fetch (S026)

Command (same argv shape as the receipt's `command`, private `/tmp`):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o "$d/api.json" -w 'http=%{http_code} bytes=%{size_download} url=%{url_effective}\n' \
  'https://api.stackexchange.com/2.3/answers/74926242?site=stackoverflow&filter=withbody'
```

Observed: `http=200 bytes=435 url=https://api.stackexchange.com/2.3/answers/74926242?site=stackoverflow&filter=withbody`,
exit 0. Transfer 435 B is gzip; the on-disk decompressed body is **608 B**,
sha256 `68f0a6a8277d1687779061b1642060914dd8c3f557cffd22f7c9822ff929576a`.

Receipt: `httpStatus` 200, `bytes` 608, sha256
`92326bb935ccc7a19f7f4b10593d8f3aec9e7481ceab4ca110275bdc4a973675`, `fetchedAt`
`2026-10-20T19:06:38.522Z`. The digest differs, and the cause is fully explained: the only byte
difference is the dynamic API counter. Diff of the normalized decode (producer `normalize()` over
`decodeBody(..., 'html-text')`):

```
liveLen 578, exLen 578, firstDiff 576
live tail: "quota_remaining":276}
excerpt tail: "quota_remaining":279}
```

Substituting only `"quota_remaining":276` → `"quota_remaining":279` in the live 608-byte body yields
sha256 `92326bb935ccc7a19f7f4b10593d8f3aec9e7481ceab4ca110275bdc4a973675` — **exact receipt digest,
608 B**. So the committed raw body was this same answer record at a moment when the quota counter read
279; nothing in the answer body, owner, score, dates or question id differs. (Raw-body equality is
neither possible nor required for a live counter-bearing page; the reconstruction is the stronger check.)

Quote location: the quote
`await new Promise(resolve => setTimeout(resolve, 5000));`
is found after `html-text` decoding at normalized offset **458** in both the live body and the
committed excerpt (`S026.excerpt.txt`, 579 B, sha256
`6fa03f6d6168309be5b927a426648a588eb08044b05dee869a425cbae6cd6570`, quote at byte 458). The excerpt
is the whole normalized body plus a trailing newline (window 600+quote+600 exceeded the 578-char body);
it therefore also contains the dynamic quota field, which is why its digest is tied to 279.

## 3. Alternative renderings / identity

- `https://stackoverflow.com/questions/74920905/...` (the row's `rowUrl`): **HTTP 403**, 5,889 B
  decompressed (3,347 B transfer), sha256
  `9f3545937a3711adf8a49570f0964b10ca5724418cdd84d942ad047e720fad6d`, `<title>Just a moment...</title>`
  (Cloudflare challenge); `This is 5 sec timeout` occurrences: 0.
- `https://stackoverflow.com/a/74926242` (answer permalink): **HTTP 403**, 5,491 B decompressed
  (3,189 B transfer), sha256
  `027831e6947afb37e055abf9900c8c99e4ab2ab6ab248c43fd920dab135cf32c`, `<title>Just a moment...</title>`;
  quote occurrences: 0. (`74926242` appears once in the challenge bytes, not as answer text.)
- API answer record (HTTP 200): `answer_id` 74926242, `question_id` **74920905** — exactly the question
  id in the row URL; owner `Ketan Pardeshi`; `creation_date` 1672121925 =
  `2022-12-27T06:18:45Z`; `last_activity_date` equal to creation; `is_accepted` false; body
  `<p>This is 5 sec timeout</p><pre><code>await new Promise(resolve =&gt; setTimeout(resolve, 5000));\n</code></pre>`.

So source identity and anchor **held**: the answer id in the row anchor and the question id in the row
URL both match the live record, and the API route is the one the row anchor itself names (“re-read via
Stack Exchange API 2026-10-19”). The question page is unreachable to plain curl (403 challenge) today,
reproducing the receipt's `anchorObserved`; the answer permalink is also challenged. No replacement
evidence was needed or used: the quote is present in the live API body.

## 4. Does the quote support `teaches`?

`corpus/SOURCES.md:40` (columns per header `corpus/SOURCES.md:13`): `scope` = “Post-action readiness in
browser automation”; **`teaches` = “REJECTED: a bare 5-second sleep records no state transition and is
not readiness evidence; flip: an explicitly time-based behavior test that keeps the state predicate as
separate evidence”**; `status` rejected; `used-by` `—`.

The quoted line is a bare `setTimeout(resolve, 5000)` under the caption “This is 5 sec timeout” — no
predicate, no state transition. It is the exact object the `teaches` cell describes and rejects. The
quote therefore supports the rejection wording. It does **not** support a positive readiness method,
and the cell does not claim one; the “flip” clause is tabi's remedy, not a source statement. The
receipt's `teachesVerdict: held` is correct under that reading, and the note makes the same rule
explicit at `corpus/knowledge/source-recheck-round-18.md:44`: a rejected row's receipt supports the
rejection's wording, not any product claim it makes.

One wording imprecision, non-contract, non-falsifying: the receipt `note` calls the `teaches` cell “the
fixed-wait approach to post-action readiness”. That phrase is the row's *scope*, not its `teaches`
cell; the verdict is still supported by the actual cell. Not a reason to reject the receipt.

## 5. Contract comparison (S026, at REV)

| Rule (PLAN.md:59-77) | Observed | Result |
|---|---|---|
| schema `tabi-source-recheck-v1` | exact | pass |
| row present at REV, not in superseded set | S026 at `corpus/SOURCES.md:40`; not S004/S039/S047/S049/S050/S053 | pass |
| `rowUrl` verbatim in row `source` cell | exact URL at line 40 | pass |
| `sha256` 64-hex | `92326b…a973675`, 64 hex | pass |
| `quoteWords` ≤25 and equals quote word count | 6 = split count | pass |
| `normalize(quote)` in `normalize(excerpt)` | quote at 458 in 579-B excerpt | pass |
| `excerptSha256` = sha of excerpt bytes | `6fa03f…cd6570` = `sha256sum` | pass |
| `quoteFound` true | true; live offset 458 | pass |
| `fetchedAt` on 2026-10-20 | `2026-10-20T19:06:38.522Z`; file mtime 19:06:38.520Z; REV commit 19:58:00Z | pass (fetch precedes commit by ~51 min) |
| `teachesVerdict` held (or drift + superseder) | held; no superseder needed | pass |
| `httpStatus` 200 for HTTP source | 200 | pass (see §6 for URL scope) |
| `producerSha256` = sha of producer at REV | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` at REV and working tree | pass |
| one receipt per row | counter accepted 51 with no duplicates | pass |
| S029 special case | see §7 | pass |

Committed bytes are the working bytes: `S026.json` sha256
`7ffb9e974b8ff7c5768dcca328bd62912555f49094da04360d84ed80d33bce7b` (blob `de019f00…`),
`S026.excerpt.txt` sha256 `6fa03f6d…` (blob `8f67b2b5…`), `git diff --exit-code 530f40a9 -- <both>` → 0.

Counter at REV: `node .ufo/waves/round-18/measure-c1.mjs 530f40a9…` → exit 0,
`c1_rows_rechecked: 51`, `eligible_rows: 58`, `held: 50`, `own_work: 1`, `rejected: []`; at B the same
command → `c1_rows_rechecked: 0`, `eligible_rows: 51`. The counter's own S026 canonical-target branch
(`measure-c1.mjs:217-227`) derives `answers/74926242?site=stackoverflow&filter=withbody` from the row
URL's question id plus the anchor's answer id, and its self-test passes all 24 cases
(`--self-test` → `allPass: true`, including the `allowed URL transformations` case that contains S026).

## 6. Freshness vs availability (the main-claim question)

The C1 claim (`PLAN.md:15-20`) is: “Source rows re-verified against their live source with a committed
recheck receipt: 0 → N (target 51 = every row not superseded at B).” The committed admission text
narrows what this means: `corpus/lessons/round-18.md:12-13` says C1 “counts round-specific
integrity-checked recheck receipts, not overdue rows or current product support”; `LOG.md:1049` says
“51 current-at-baseline rows reopened”; `corpus/knowledge/source-recheck-round-18.md:7` records that
the note “does not make any knowledge entry true”; the counter emits
`freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate"`.

For S026 specifically, the receipt proves only that a 2022 community answer's text is still available
and unchanged; it has **zero sensitivity to the Playwright product**. [INFERENCE] The receipt would be
produced identically before and after any Playwright release, because the body is a static Q&A record
(`last_activity_date == creation_date`). That is availability, not product freshness. The claim does
not overstate this: the row is `rejected`, `used-by` is `—`, and the gate explicitly excludes product
support. No confusion in the committed claim; the finite limitation is that this receipt cannot
support any statement about current Playwright behavior, and none is made.

Boundary numbers worth recording, none of which falsify the receipt:

- At REV the registry has **64** rows; `eligible_rows` is **58** (64 minus the still-fixed six
  baseline supersessions: S004/S039/S047/S049/S050/S053), while the C1 target remains the 51 rows
  not superseded **at B**. The seven new rows S058–S064 (opened this round: S058 supersedes S057;
  S059–S064 source C2) have no C1 receipts by design. `corpus/knowledge/source-recheck-round-18.md:11`
  says “57 rows”, which is the baseline count, not the REV count; the same paragraph immediately
  scopes to “baseline B”. This is a present-tense wording nit, not a missing receipt.
- S057 is superseded at REV by S058 (`corpus/SOURCES.md:71-72`, lesson Corrections), but it is still
  in the fixed 51 because it was not superseded at B. The C1 contract's superseded set is the six
  fixed baseline pairs, so its receipt is correctly accepted under the declared rule.
- The receipt's `httpStatus: 200` is the API fetch, not the row URL, which is 403 today. The row's
  anchor names the API route, and `corpus/knowledge/source-recheck-round-18.md:145` explicitly covers
  challenge pages and the round-12 Stack Exchange precedent. The counter's canonical-target branch
  authorizes exactly this substitution; no hidden URL swap.

## 7. S029 own-work cross-check (no network)

`git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
→ **97,073 B**, sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (identical at
B `2bff864f…` and REV `530f40a9…`). The receipt's `bytes`/`sha256` match. Re-deriving the excerpt with
the producer rule (normalize, quote at offset, slice −600/+600, trailing `\n`) gives offset **74,695**
and 1,382 B sha256 `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` — exactly the
receipt's `excerptSha256`, and equal to the committed `S029.excerpt.txt`. `httpStatus` is null and no
request was made. This confirms `corpus/lessons/round-18.md:14` (“Own-work S029 is explicitly hygiene,
not live freshness”) rather than adding a live-product claim.

## 8. Unresolved / limits

- The Stack Exchange API exposes no revision history. `last_activity_date == creation_date` means no
  post-2022 edit is recorded, but a silent in-place edit before the prior 2026-10-19 reading cannot be
  excluded by the API alone. The quote is present today; that is the bounded claim.
- The question page and answer permalink are both behind a Cloudflare challenge for plain curl; the
  direct HTML rendering cannot be checked, and the API record is the only same-identity route available
  at probe time. This matches the receipt's `anchorObserved`; it is a route limitation, not drift.
- The live API counter (`quota_remaining`) is volatile; the raw-body digest is not reproducible without
  substituting the recorded value 279. With that single substitution it reproduces exactly, so the
  difference is fully accounted for.
- No browser was used; no loopback fixture page was involved in this item. No production file outside
  this report was written.

Files written (absolute):
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS026.md
