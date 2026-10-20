VERDICT: ISSUES

# S058 falsification — WebMCP Model Context Tool Inspector listing

Seat `TabiR18.NewS058-2` (leaf; no delegation). Lane HEAD
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`; baseline B
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. No production edits. All probes in
`/tmp/s058probe`; LANE commands were reads only (`git rev-parse`, `git diff`,
`node scripts/check-sources.mjs`, `grep`, `read`). No jj invocation.

Core result: **the publisher correction is substantively true** — the served
`Developer` card names Google Ireland, Ltd. with `fbeaufort@google.com`, while
`Offered by` is François Beaufort. But the Gate quotation is not raw-verbatim
(it is an HTML-text-normalized flattening that crosses `<br>`/newline boundaries),
the committed row's flip has drifted from the dossier (the Chrome 150 floor branch
was dropped), and the row's scope overstates a "workflow" the copy does not contain.

## 0. What was opened

- `corpus/SOURCES.md:72` (S058); `:67` (S053); `:71` (S057); `:73-78` (S059–S064).
- `corpus/lessons/round-18.md:39` (S058 Gate entry), `:62-65` (Corrections),
  `:83` (stale-premise Mistakes row).
- `.ufo/waves/round-18/sources/S058Listing.md` (all 97 lines; §1 fetch ledger,
  §2 F1–F11, §3 draft row, §4 Gate entry, §5 mention sweep, §6 unknowns).
- `corpus/knowledge/source-recheck-round-18.md:102`, `:136`, `:146`.
- `corpus/knowledge/harness-hardening-round-18.md:1-8` (S059–S064 source header).
- `corpus/evidence/round-18/source-recheck/S057.json` and `S057.excerpt.txt`.
- `corpus/README.md:379-380`; `corpus/QUALITY.md:141`.
- `scripts/check-sources.mjs`; `measure-c3.mjs` d4 logic inspected, not executed.

## 1. Live re-open — three GETs, 2026-10-20

Command per fetch (safe public GET only; unique private profiles not needed because
no browser/page JavaScript was used):

```
curl -sS -L --compressed -D headers-f1.txt \
  -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36' \
  -o body-f1.html -w 'http=%{http_code} size=%{size_download} url_effective=%{url_effective}\n' \
  'https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd'
```

| fetch | HTTP | wire B | disk B | full sha256 |
|---|---|---|---|---|
| f1 | 200 | 102381 | 649153 | `e93f321241f8a878f05a98ede0b8c1f494d301225e5d4c4c3f6fa6580e180c79` |
| f2 | 200 | 102396 | 649152 | `c61f8462d738b68985c555dd1197ce51d6ad11bcad53d623c9436b6271a5211e` |
| f3 | 200 | 102387 | 649152 | `73a27a0c54f096ce29a33f0fed45f298a851704f8b67a99efd0cf78a2d364cee` |

`url_effective` was the requested URL (no redirect). f1 headers: `date: Tue, 20 Oct
2026 20:02:28 GMT`, `content-type: text/html; charset=utf-8`, `cache-control:
no-cache, no-store, max-age=0, must-revalidate`, `content-encoding: gzip`,
`server: ESF`; no `Last-Modified`, no `ETag`.

Recorded revision markers (f2/f3): `<title>WebMCP - Model Context Tool Inspector -
Chrome Web Store</title>`; `Version` `1.9.19`; `Updated` `October 5, 2026`;
manifest JSON `"version": "1.9.19", "minimum_chrome_version": "150.0.7861.0"`.
The Gate entry's recorded-body digest
`fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2` (649152 B,
fetch #4) did **not** reproduce in any of these three fetches; two of them have the
same 649152-byte length and the same quote offsets, with different digests. This
matches the dossier's declared rotation, not byte-drift in the quoted claim.

## 2. Exact quote and location

Gate quote (12 words): `Google Ireland, Ltd. Gordon House Barrow Street Dublin 4
D04 E5W5 IE`.

- Raw served value (f2/f3, bytes 523625–523695, 71 bytes):
  `Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE`
  — `<br>` at byte 523645; literal newlines at 523675 and 523693.
- The flat 12-word string is **not** present in any of the three raw bodies:
  `body.find("Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE")`
  returned `-1` for f1, f2 and f3.
- Under the round's `html-text` decoder plus `normalize()` it is found:
  `{"found":true,"offset":936,"normalizedLength":5997}` (f2 and f1 alike).
- Section: `Details` list, `<li class="MqICNe yyjN4">` Developer card,
  `<div class="mdSapd">`, immediately after `Version 1.9.19` / `Updated October 5,
  2026`.
- The exact flat quote is also present in the committed normalized excerpt
  `corpus/evidence/round-18/source-recheck/S057.excerpt.txt` (1068 B, sha256
  `2e730a9a453d7ae1b3ed68c38b9c3e15f50123e9fd6cf9e5b33b592ca09e52ae`; receipt body
  695881 B, sha256 `361a9a0f2ec2ebb424c9263eb18d29f10c08e6a83ab1ed6d80bc109b2a18ac2c`).
  So the quote is grounded in committed normalized bytes, not raw bytes.

Offset corroboration (f2/f3; f1 shifts +1 for most fields): meta tag 490797 / value
490825; `Offered by` text 523264 / name 523285; Developer `<div>` 523546 / value text
523625; trader sentence 525256; `Version` text 522888 / value 522921; `Updated` text
522984 / value 523002. These match the dossier's §1/§2 recorded offsets for
649152-byte bodies.

## 3. Findings

### F1 — MEDIUM — "verbatim" quote is a normalized flattening; contiguity claim is false

The Gate table header says "Located quote (verbatim, ≤25 words)" and the dossier §4
says the value is "one `br`-broken text node, contiguous up to the first `<br>`".
Both are inaccurate for this quote:

- a raw byte search for the quoted string returns `-1`; only the tag-stripping,
  whitespace-collapsing `html-text` normalizer finds it;
- the quoted span crosses the first `<br>` at 523645 and two literal newlines
  (523675, 523693); only `Google Ireland, Ltd.` is contiguous up to the first
  `<br>`. The value is not one contiguous text node.
- The dossier's own §2 row calls the value "flattened", so the dossier contradicts
  its §4 location sentence.

Fix: label it "verbatim after the SOURCES html-text normalizer" and say the span
crosses one `<br>` and two newlines, or quote only `Google Ireland, Ltd.` if a raw
contiguous span is required. This is not a false claim about the listing's content.

### F2 — MEDIUM — flip drift: the committed row drops the Chrome 150 floor branch

Dossier §6 says: "The floor is the author's listing claim (F3), still not
corroborated by a Chrome-owned page; that is exactly S058's flip condition."
The committed `corpus/SOURCES.md:72` flip is: "flip: listing or extension source
publishes a concrete invocation API contract" — no floor branch. The dossier §3
draft row had: "flip: a Chrome-owned page or the extension's own published source
stating that floor or publishing an invocation API contract". The final row dropped
the "stating that floor" branch. S057's historical `teaches` still cites the
Chrome 150.0.7861.0 floor (S053 calls it "unverified"), but the successor row can no
longer flip on a
Chrome-owned page that states the floor. Either the dossier §6 or the committed row
is wrong; the registry is the operative text. This is also the "unsupported premise
left in another cell" answer: the floor claim survives in S057's historical rejection
and in the new recheck note `:136`, while the committed S058 flip no longer covers it.

### F3 — LOW — scope overclaims a "workflow" and omits the "with Gemini" mode

`corpus/SOURCES.md:72` scope: "Listing prerequisites and manual execution workflow,
not an invocation API". The served copy says only:
`Inspect, monitor, and execute WebMCP tools manually or with Gemini`, followed by the
Prerequisites paragraph and the security warning. There is no step-by-step workflow;
the sentence is a capability statement. The S057 C1 receipt already records:
"scope wording workflow is looser than the copy"
(`corpus/evidence/round-18/source-recheck/S057.json:22`). The scope also names only
the manual mode while the copy names "or with Gemini"; that second mode is omitted
from the row. The teaches cell's "not an invocation API" is supported (see §4).

### F4 — LOW — source title and kind differ from the served/superseded row

Served `<title>` / `og:title`: `WebMCP - Model Context Tool Inspector - Chrome Web
Store`. S058's `source` cell says `WebMCP Inspector listing`; the dossier's draft row
used the exact title. The SOURCES contract says `source` is "title — canonical URL".
Kind also changed `tool` (S053/S057) → `docs` (S058) without a note; the dossier's
draft already used `docs`, so this is an unforced reclassification of the same
storefront page, not required by the publisher correction. Neither is a factual
claim about the listing, but both are cell-level drift a consumer can see.

### F5 — LOW — label/value offsets use mixed conventions

Gate entry `corpus/lessons/round-18.md:39`: "label byte 523546, value byte 523625".
In the 649152-byte bodies, 523546 is the start of
`<div class="QDHp8e">Developer</div>` (the label element); the label text
`Developer` begins at 523566 (f2/f3) / 523567 (f1). 523625 is the start of the value text, not of
its `<div class="mdSapd">` (523605). The dossier's F6 uses the label text offset
(523264) for `Offered by`, so the two cards use different conventions. The Gate's
"offsets shift; locate by quote" caveat is correct, but the raw quote cannot be
located by exact search (F1); it needs the html-text normalizer.

### F6 — LOW — non-reproducible digest is not caveated in the Gate entry

The Gate entry records `fbc214…c4d2` as the "sha256 (full)" of fetch #4
(649152 B). Three fresh 2026-10-20 fetches produced three different digests; two
were also 649152 B. The dossier §4 says "sha NOT reproducible" and §6 says no
digest should be cited as a verification handle; the lesson Gate entry does not
carry that caveat (it says "recorded fetch #4" and "Offsets shift per fetch", which
is close but not explicit). A reader could mistake the 64-hex value for a stable
page identity. The correct handle is the normalized quote plus the `Version 1.9.19`
/ `Updated October 5, 2026` markers.

### F7 — OBSERVATION — the publisher premise remains only in superseded/labeled cells

- `corpus/SOURCES.md:67` (S053) still has "(individual publisher)" in the anchor and
  "individual-publisher" in the teaches; it is superseded by S057's teaches
  (`:71`), which S058 in turn supersedes.
- `corpus/SOURCES.md:71` (S057) still has "(individual publisher)" in the anchor; it
  is explicitly superseded by S058.
- `corpus/knowledge/source-recheck-round-18.md:102` reproduces the S057 anchor with
  "(individual publisher)"; `:48` says anchor cells are reproduced from SOURCES and
  `:136` says the correction is outside the note. This is a labeled historical
  reproduction, not a current claim, but the literal is still in a new non-frozen
  note. The lesson's "the new note quotes S057's old anchor as historical text" is
  defensible only via those labels; a mechanical scan still finds it.
- The lesson's "S058 sweeps all falsified cells" is true only transitively
  (S053 → S057 → S058). S053's own row carries no inline pointer to S058. No
  production rewrite is appropriate (append-only), but the correction index at
  `corpus/README.md:379-380` names S057, not S053; a two-link chain is required to
  reach S053.

## 4. Checks that hold (not generic praise)

- `corpus/SOURCES.md:72`: exactly one S058 row, 11 cells; `teaches` starts
  `supersedes S057 —`; no cell matches `individual publisher` case-insensitively;
  `teaches` matches `developer\s+Google Ireland, Ltd\.`; anchor contains
  `.ufo/waves/round-18/sources/S058Listing.md`; opened `2026-10-20`; status
  `rejected` with both `REJECTED:` and `flip:`.
- `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md`,
  `exit=0`.
- Tier C is scoped: lead-only, `used-by` is `—`, and no admitted entry cites S058;
  the `check-sources` run reports no `used_by`/tier findings.
- S059–S064: `corpus/knowledge/harness-hardening-round-18.md:1-6` cites each row;
  rows 73–78 each have `used-by: corpus/knowledge/harness-hardening-round-18.md`;
  the note exists (18423 B) and the structural check reports no
  `used_by_missing`/`used_by_uncited`.
- Correction substance: the served Developer card is Google Ireland, Ltd. with
  `fbeaufort@google.com`; `Offered by` is François Beaufort; the EU trader
  disclosure is present. `invokeTool`, `executeTool`, `invocationId`, `invoke`,
  `Invoke`, `toolInvoked` and `toolResponded` each count **0** in the 649152-byte
  body (raw count), so the "no invocation contract" rejection is supported.
- No quoted code, comments or backticks are involved; the only rendering difference
  is `<br>`/newline vs spaces, covered in F1.

## 5. Finite limits

- Only three live fetches; the page is live and may change after 2026-10-20.
- No browser/page-JavaScript hydration and no extension runtime were probed; the
  "Developer"/"Offered by" fields are the server-rendered bytes.
- The recorded fetch #4 body is not committed; its digest did not reproduce. The
  S057 excerpt is a normalized excerpt, not a raw body.
- The C3 counter was inspected, not executed; this report makes no C3 admission
  claim.
- `grep -rn "individual publisher"` over LANE at 2026-10-20 returned 28 files,
  including frozen round-17 artifacts and sibling wave reports; the production
  hits are `corpus/SOURCES.md:67`, `:71` and
  `corpus/knowledge/source-recheck-round-18.md:102` and `:136`, all discussed in F7.

## 6. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS058.md`
  (this report).
- Probe artifacts only under `/tmp/s058probe/` (`body-f1.html`, `body-f2.html`,
  `body-f3.html`, `headers-f1.txt`); not committed.

No production, fleet, sibling, jj or Git-index writes were made.
