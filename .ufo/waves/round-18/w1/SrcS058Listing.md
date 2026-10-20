VERDICT: PASS

# SrcS058Listing — C3 routed defect 4: S058 supersedes S057 (round 18, wave 1)

Seat `TabiR18.SrcS058Listing` (leaf; no delegation, no background jobs). Access date **2026-10-20**.
Method: one URL, direct `curl` GET (`-L --compressed`, Chromium 154 UA), four fetches; no browser
launched, no page JavaScript executed, no REA device, no counter or gate run. Owned paths only:
`.ufo/waves/round-18/sources/S058Listing.md` (draft row + Gate entry) and this report.

**Defect under repair.** `corpus/SOURCES.md:71` (S057, the row written to correct S053) still reads, in its
anchor cell, `Offered by François Beaufort (individual publisher)` — the publisher-class premise the
round-17 re-open had already falsified. The registry is append-only for `teaches`/`anchor`, so the repair
is a new row S058 whose cells carry no such claim.

## 1. Live reopen — recorded fetch and its variance

Recorded fetch (#4), 2026-10-20T19:07:21Z:

```
$ curl -sS -L --compressed -D headers.txt -A '…Chrome/154.0.0.0…' -o body.html \
    'https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd'
http_code=200 downloaded=102381
$ wc -c body.html      → 649152 body.html
$ sha256sum body.html  → fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2
headers: HTTP/2 200 · content-type: text/html; charset=utf-8 ·
         cache-control: no-cache, no-store, max-age=0, must-revalidate ·
         date: Tue, 20 Oct 2026 19:07:21 GMT · content-encoding: gzip ·
         no Last-Modified, no ETag
```

Four same-day fetches, three lengths, four digests:

| # | bytes | sha256 |
|---|---|---|
| 1 | 649152 | `fb4160be3eceef84e47580d42b30306760537c4e33cde4ebd33dcaece4a1cdd2` |
| 2 | 649160 | `3fe69e95da97fb410ea7b236595d3390463e6ae9c4af5bca275cf33d8d10a84c` |
| 3 | 649153 | `fb70527f1e129a2d23b4cc9875de7f2fa356738ab139e7466f585007cd212aa5` |
| 4 (recorded) | 649152 | `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2` |

S057's recorded handle (`649153 B`, sha256 `085c40b7d1bae1b3012c3bcf3dc74c1762f8c096136c0b6fa22e302069848a4c`)
did not reproduce in any of the four fetches; fetch #3 matched the byte count with a different digest. The
serialization rotates per response (a CSP nonce shifts everything after it, observed +8 B in #2), so a
digest is a snapshot, not a handle, and a byte offset identifies only the body it was taken from.

## 2. What the recorded body serves (offsets in fetch #4)

| Fact | offset | verbatim |
|---|---|---|
| meta description | tag 490797, value **490825** | "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words) |
| listing summary | 517454 | repeats the description, then Prerequisites and a security warning |
| Prerequisites | **517534** | "Prerequisites: You must enable the &quot;WebMCP for testing&quot; flag in chrome://flags to turn it on in Chrome 150.0.7861.0 or higher." (136 contiguous bytes; entities are `&quot;` in the bytes) |
| Updated | 522984 | "October 5, 2026" |
| `Offered by` | label 523264, value **523285** | "François Beaufort" (2 words) |
| `Developer` | label 523546, value **523625** | "Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE" → flattened "Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE" (12 words) |
| Developer email / phone | 524320 / 525145 | "fbeaufort@google.com" · "+1 650-253-0000" |
| Trader disclosure | **525256** | "This developer has identified itself as a trader per the definition from the European Union and committed to only offer products or services that comply with EU laws." (15 words) |
| Size / users | 523375 / 515280 | "231KiB" · "20,000 users" |

So the served publisher fields are exactly three: an `Offered by` person, a company `Developer`
(Google Ireland, Ltd.), and an EU **trader** self-identification attached to that developer. No publisher
class of any other kind is stated, and the literal `individual publisher` occurs **0** times in the body
(`python3` exact-byte count over all 649152 B, including inline JSON).

Token census on the same body (case-sensitive exact-byte counts): `invokeTool` **0**, `executeTool` **0**,
`invocationId` **0**, `invoke` **0**, `Invoke` **0**, `toolInvoked` **0**, `toolResponded` **0**. The only
verb of that family is the generic "execute" in the meta description. The listing therefore states a
flag-gated manual inspector workflow and a Chrome 150.0.7861.0 floor, and nothing about an invocation
contract, an invocation id, or a result channel — which is the premise S058 rejects on.

## 3. Draft row + Gate entry (path, shape, validation receipt)

- Draft: `.ufo/waves/round-18/sources/S058Listing.md` — registry row on **line 56**, Gate entry in §4
  (heading line 67, table row line 71), fetch ledger §1, fact table §2, unknowns §6.
- Row shape: 11 cells / 13 pipe fields; `id S058`; `kind docs`; `tier C`; `status rejected`;
  `opened 2026-10-20`; `recheck on-release`; `used-by —`; `scope` identical to S057's; `teaches` opens
  `supersedes S057 —` and contains both `REJECTED:` and `flip:`; no cell contains `individual publisher`.
- Placement for the L1: append **between `corpus/SOURCES.md:71` (last registry row, S057) and
  `corpus/SOURCES.md:73` (`## Paths`)**.

Structural receipt, run by this seat against a sandbox copy (lane not written; `/tmp` root only):

```
$ cp -r LANE/corpus /tmp/s058check/corpus ; cp LANE/{SKILL,LOG,SCORECARD,README}.md /tmp/s058check/
$ <insert the drafted row at the end of ## Registry>
$ node LANE/scripts/check-sources.mjs --root /tmp/s058check --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=58 tiers=A:46,B:4,C:8 status=queued:8,mined:42,rejected:8 findings=0
exit=0
```

(The first attempt appended the row after `## Leads (unopened)` and produced
`row_outside_registry row=S058 detail=section_leads_unopened_` plus `used_by_missing` noise from the
missing `corpus/knowledge/**`; inserting at the Registry boundary removed both classes. This checker is
structure-only: it cannot see whether a source was opened.)

## 4. Mention sweep — every other occurrence of `individual publisher`

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ date -u +%FT%TZ  → 2026-10-20T19:09:30Z
$ grep -rn "individual publisher" --exclude-dir=.git .
→ 25 lines across 15 files
```

| path:line (lane-relative) | status |
|---|---|
| `corpus/SOURCES.md:67` | append-only registry, S053 row — the premise's origin; not editable in place, corrected by S057 then S058 |
| `corpus/SOURCES.md:71` | append-only registry, S057 row — **the defect**; likewise uncorrectable in place, corrected by S058 |
| `corpus/lessons/round-17-verifier-spotcheck.md:162` | **frozen** (round-17 lesson artifact) — listed, not edited |
| `.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md:57` | **frozen** (round-≤17 wave file) — listed, not edited |
| `.ufo/waves/round-17/w2/ReopenS053.md:39`, `:42` | **frozen** (round-≤17 wave file) — listed, not edited |
| `corpus/evidence/round-18/source-recheck/S057.json:22` | round-18 C1 recheck receipt, written by `recheck-fetch.mjs`; owned by the C1 producer, not this seat |
| `.ufo/waves/round-18/PLAN.md:43`, `:99` | L1 plan text (the C3 d4 rule itself); planner-owned |
| `.ufo/waves/round-18/w1/spec.json:205`, `:225` | orchestrator dispatch spec (carries this seat's prompt) |
| `.ufo/waves/round-18/w1/validation.json:657`, `:677` | orchestrator validation artifact |
| `.ufo/waves/round-18/w1/dispatch-result.txt:1` | orchestrator dispatch log (line-truncated copy of `spec.json`) |
| `.ufo/waves/round-18/w1/DraftLesson.md:13` | sibling seat's report — not mine |
| `.ufo/waves/round-18/w1/Recheck26.md:11`, `:79`, `:81` | sibling seat's report — not mine |
| `.ufo/waves/round-18/w1/CriticClaims.md:134`, `:136` | sibling seat's report — not mine |
| `.ufo/waves/round-18/w1/ConnFrontier.md:43`, `:84` | sibling seat's report — not mine |
| `.ufo/waves/round-18/drafts/quality-append.md:1` | scribe draft, L1-integrated — not mine |
| `.ufo/waves/round-18/drafts/lesson-round-18.md:35`, `:106` | scribe draft, L1-integrated — not mine |

Two qualifications the L1 needs. (a) The sweep is a moving snapshot: during this seat's work the same
command returned 14 lines in 9 files, then 21 in 13, then 26 in 16 at 19:09:13Z (one of those, line 78,
was a temporary line in this seat's own draft, since removed), and 25 in 15 at 19:09:30Z — the table above
is that 19:09:30Z state. (b) After S058
lands, the literal **remains** at `SOURCES.md:67` and `:71` by design — the registry corrects by
superseding, and the C3 d4 rule constrains only S058's cells. Nothing in the frozen set was edited by
this seat; the draft file itself contains no copy of the literal (`grep -c` → 0), so the report is its only
carrier.

## 5. Findings and qualifications

1. **Publisher class as served (observed).** `Developer` = Google Ireland, Ltd., with email
   fbeaufort@google.com, phone +1 650-253-0000 and an EU trader self-identification; `Offered by` =
   François Beaufort. The phrase S057 carries is absent from the page (0 hits), so S057's anchor is
   falsified by the page's own fields, not merely re-worded.
2. **No invocation vocabulary (observed).** `invokeTool`, `executeTool`, `invocationId` — and even the bare
   token `invoke` — are absent from the whole 649152-byte body.
3. **S057's digest handle was already stale (observed).** Round 17 recorded the non-reproducibility
   (`corpus/lessons/round-17.md:65` "sha NOT reproducible (dynamic listing, note 1)"; digest note at
   `:67`), yet S057's anchor still cites `649153 B, sha256 085c40b7…` as if it identified the page. S058
   carries the quote plus the offset of its own fetch and states the rotation instead.
4. **The draft is structure-clean (observed).** `check-sources.mjs` on a sandbox registry with S058
   appended: `verdict=clean … findings=0`, exit 0 (§3).
5. **Unobserved.** Only the unrendered HTTP body was read. [INFERENCE] A hydrated DOM would not add
   strings the server already served — the listing copy, developer card and trader block are
   server-rendered — but no browser was launched to prove it, and the packaged extension's runtime
   behaviour was not probed. The Chrome 150.0.7861.0 floor remains the author's claim, which is exactly
   S058's flip condition.

## 6. Tooling

No installs or upgrades (nothing was needed; no `pacman`, no `uv`, no `npx`). Tools used as found:
`curl`, `python3`, `node` (v24.21.0), `grep`, `sha256sum`.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/S058Listing.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcS058Listing.md`
