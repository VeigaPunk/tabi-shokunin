# R90Scout — source re-opening (round 90, w1)

Seat: `R90Scout` (scout, leaf member). Milestone: source re-opening. Lane:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `a9f1da08`. Read-only seat: no lane file was
edited by this seat; the only file written is this report. No subagent dispatch, no background
jobs, no git/jj mutation.

## 1. Fetch and staging (live vs staged, byte-identity)

Fetched live on 2026-11-08 with `curl -sS -o <file> <url>` into
`/fast/scratch/hyaku/tabi-r90/R90Scout/` (created with `mkdir -p`, passed explicitly, deleted
before this yield — see §7). Two independent fetches of each URL (a second pass was made to
confirm stability); the two passes per URL are byte-identical to each other.

| URL | HTTP | Content-Length | sha256 (live = staged) | expected pin |
|---|---|---|---|---|
| `https://html.spec.whatwg.org/multipage/input.html` | 200 | 687,515 B | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` | `b0202de1c0b4…` ✔ |
| `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html` | 200 | 121,595 B | `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666` | `2e9e2cbbe1ed…` ✔ |

Both live digests match the pins named in the round brief and in the SOURCES rows
(S223/S219 anchor cells `687,515 B, sha256 b0202de1c0b4`; S224 anchor cell `121,595 B, sha256
2e9e2cbbe1ed`). Response headers: `last-modified: Fri, 06 Nov 2026 22:04:01 GMT` for both,
`etag "6aee4ed1-a7d9b"` (input.html) and `etag "6aee4ed1-1dafb"` (common-microsyntaxes.html).

**Staging is byte-identical to live.** The lane's staged copies under
`.ufo/waves/round-90/sources/` hash exactly to the live digests:

```
b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16  .ufo/waves/round-90/sources/whatwg-input.html
2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666  .ufo/waves/round-90/sources/common-microsyntaxes.html
```

The two earlier rounds' staged copies are also still identical to live
(`.ufo/waves/round-88/sources/whatwg-input.html` → `b0202de1c0b4…`,
`.ufo/waves/round-89/sources/common-microsyntaxes.html` → `2e9e2cbbe1ed…`), so the pages have not
drifted since r88/r89. My scratch copies hashed identically to all of the above.

## 2. (a) The `accept` attribute's "hint" sentence

**Located quote (exact, tag-stripped):**

> "The accept attribute may be specified to provide user agents with a hint of what file types will
> be accepted."

* **wc -w = 20** (the whole sentence including the leading "The" and the `accept` term).
* Locator: `input.html` §4.10.5.1.17 "File Upload state (`type=file`)" (the `<h6 id="file-upload-state-(type=file)">`
  heading is at line 4004), the `accept` attribute paragraph, **lines 4066–4068**;
  the `<dfn data-dfn-for=input id=attr-input-accept>` opens at **byte 424205** and the paragraph
  closes at **byte 424416**; the literal `id=attr-input-accept` is at **byte 424236**.
* The sentence is unique in the document: `grep -c "provide user agents with a hint"` = 1 in
  `input.html`, 0 in `common-microsyntaxes.html`.
* The lane's r88 quote for S223 is the same sentence with the leading "The accept" dropped
  (`corpus/lessons/round-88.md:30–31`: "attribute may be specified to provide user agents with a
  hint of what file types will be accepted.") — **wc -w = 18**. It is verbatim in the tag-stripped
  text; it is not byte-contiguous in the raw HTML because the spec wraps `accept` in a `<dfn>`
  element (`<dfn …><code>accept</code></dfn>`), i.e. the raw bytes are
  `The <dfn …><code>accept</code></dfn>\n  attribute may be specified …`. Both readings are
  reported so no consumer has to guess.

Neighbouring sentences in the same paragraph block (useful anchors, all in §4.10.5.1.17):

| text | wc -w | line / byte |
|---|---|---|
| "If specified, the attribute must consist of a set of comma-separated tokens, each of which must be an ASCII case-insensitive match for one of the following:" | 26 | lines 4070–4071; bytes 424420–424881; `ASCII case-insensitive` at byte 424819 |
| "The tokens must not be ASCII case-insensitive matches for any of the other tokens (i.e. duplicates are not allowed)." | 19 | lines 4075–4076; bytes 425607–425893; second `ASCII case-insensitive` at byte 425794 |
| "To obtain the list of tokens from the attribute, the user agent must split the attribute value on commas." | 19 | lines 4076–4078; `split the attribute value on` at byte 426121 |
| "User agents should prevent the user from selecting files that are not accepted by one (or more) of these tokens." | 20 | lines 4088–4089; bytes 426621–426742 |
| "User agents may use the value of this attribute to display a more appropriate user interface than a generic file picker." | 18 (first sentence) | lines 4080–4085 |

## 3. (b) The `set of comma-separated tokens` dfn

**Located quote (exact, tag-stripped) — the whole dfn paragraph:**

> "A set of comma-separated tokens is a string containing zero or more tokens each separated from
> the next by a single U+002C COMMA character (,), where tokens consist of any string of zero or
> more characters, neither beginning nor ending with ASCII whitespace, nor containing any U+002C
> COMMA characters (,), and optionally surrounded by ASCII whitespace."

* **wc -w = 56** for the full dfn paragraph (including the leading "A" and the dfn term).
* The definitional clause alone (everything after the dfn term) is **wc -w = 51**:
  "is a string containing zero or more tokens each separated from the next by a single U+002C COMMA
  character (,), where tokens consist of any string of zero or more characters, neither beginning
  nor ending with ASCII whitespace, nor containing any U+002C COMMA characters (,), and optionally
  surrounded by ASCII whitespace."
* The dfn term itself, "set of comma-separated tokens", is **wc -w = 4**.
* Locator: `common-microsyntaxes.html` §2.3.8 "Comma-separated tokens"
  (`<h4 id=comma-separated-tokens>` at line 1335, byte 116107), dfn paragraph at **lines 1338–1342**;
  `id=set-of-comma-separated-tokens` at **byte 116287**; the paragraph spans bytes 116277–116963.
* The dfn phrase occurs exactly once as a dfn (`grep -c 'id=set-of-comma-separated-tokens'` = 1 in
  the dfn element; the phrase itself appears twice, the second at line 1349 as a cross-reference
  link "Sets of comma-separated tokens").
* Worked example immediately after (lines 1344–1346): the string `" a ,b,,d d "` consists of four
  tokens — `"a"`, `"b"`, the empty string, and `"d d"`; leading/trailing whitespace does not count
  as part of the token and the empty string can be a token.

**Sub-quotes that are verbatim substrings of that paragraph** (each verified by exact substring
test against the tag-stripped paragraph, not by eye):

| candidate quote | wc -w | verbatim at the dfn |
|---|---|---|
| "tokens consist of any string of zero or more characters, neither beginning nor ending with ASCII whitespace" (the r89/r90 quote) | 17 | **yes** |
| "neither beginning nor ending with ASCII whitespace, nor containing any U+002C COMMA characters (,)" | 14 | yes |
| "nor containing any U+002C COMMA characters (,)" | 7 | yes |
| "tokens each separated from the next by a single U+002C COMMA character (,), where tokens consist of any string of zero or more characters, neither beginning nor ending with ASCII whitespace" (the r89 §Gate quote) | 31 | yes **only with the trailing period dropped**; with the period it is not a substring (the spec continues "…, nor containing any U+002C COMMA characters (,)…", so the period is the lesson's, not the spec's) |

## 4. The r89 lesson's Gate quote (17 words) — verbatim check

The 17-word quote the round carries
(`corpus/lessons/round-89.md:103–104`, and `corpus/lessons/round-90.md:25–26`):

> "tokens consist of any string of zero or more characters, neither beginning nor ending with ASCII
> whitespace"

* **wc -w = 17** (measured by `printf '%s\n' … | wc -w`; the drift gate's own word-count
  expression in `scripts/check-record-drift-round90.mjs:98–101` independently yields **17** on the
  same string, so the gate's arithmetic and `wc -w` agree).
* **Verbatim at the dfn: yes.** Exact-substring test against the tag-stripped §2.3.8 dfn paragraph
  returns True, and the substring is contiguous (no elision, no reordering, no substitution). The
  clause ends at the spec's own comma boundary ("…neither beginning nor ending with ASCII
  whitespace, nor containing …").
* One caveat worth stating precisely, because it is the only place the raw bytes differ: in the
  served HTML the words `ASCII whitespace` are wrapped in an anchor
  (`<a id="comma-separated-tokens:space-characters" href=…#ascii-whitespace>ASCII whitespace</a>`)
  and the paragraph is hard-wrapped across lines 1339–1340. So the quote is verbatim in the
  rendered/text reading of the dfn, but it is **not** a byte-contiguous substring of the raw HTML
  file (`raw.count(q17)` = 0). Same property holds for the 31-word r89 §Gate quote and for the
  18-word S223 hint fragment — it is the nature of the source, not a defect in the quote.
* The r89 §Gate (lines 29–31) still carries the older 31-word version of this quote. It is
  verbatim-modulo-the-trailing-period (see §3 table), and it exceeds the ≤25-word CORPUS/SOURCES
  rule-1 cap — the defect the r89 spot-check routed as D3 and that the round-90 correction block
  answers at `corpus/lessons/round-89.md:102–104`. The append-only correction does not rewrite the
  r89 §Gate text; the r89 lesson's own Gate therefore still shows 31 words while the correction
  block carries the ≤25-word replacement. That is the intended append-only shape, but any consumer
  that reads only `corpus/lessons/round-89.md` §Gate (and not the `## Corrections carried by round
  90` block) still sees the 31-word quote.

## 5. (c) Does either page assign a case rule to accept matching?

**Yes — but only on the `input.html` side, and not in §2.3.8.**

* `common-microsyntaxes.html` §2.3.8 assigns **no** case rule to the comma-separated-token set.
  The dfn paragraph (§3) says nothing about case; the only per-set case statement on that page is
  for the *space*-separated set, in a `class=note` at **lines 1330–1331** (bytes 115854–116101):
  "How tokens in a set of space-separated tokens are to be compared (e.g. case-sensitively or not)
  is defined on a per-set basis." — **wc -w = 22**. There is no analogous note for comma-separated
  tokens.
* `input.html` §4.10.5.1.17 **does** assign the case rule to accept matching, in the accept
  paragraph itself: "each of which must be an ASCII case-insensitive match for one of the
  following" (line 4071; `ASCII case-insensitive` at byte 424819) and "The tokens must not be ASCII
  case-insensitive matches for any of the other tokens (i.e. duplicates are not allowed)" (line
  4075; byte 425794). The §2.3.8 dfn is referenced from the same paragraph ("must consist of a
  set of comma-separated tokens", line 4070, `id="file-upload-state-(type=file):set-of-comma-separated-tokens"`).
* Consequence for the round's own disclosure wording, stated as an observation only: the S224
  registry scope cell says "lowercasing is this lane's fixture normalization, not the spec's"
  (`corpus/SOURCES.md:239`) and the r89 knowledge note says the same
  (`corpus/knowledge/chromium-showpicker-runtime-round-89.md:55–58`). That remains true of
  §2.3.8 alone (the dfn prescribes no case folding), but the spec *does* require accept tokens to
  be matched ASCII case-insensitively, so the fixture's `toLowerCase()` is congruent with the
  spec's matching rule for `accept` rather than being an invention. The r88 knowledge entry already
  records this ("ASCII case-insensitive match", `corpus/knowledge/chromium-showpicker-runtime-round-88.md:50–51`);
  the r89/r90 entries do not carry it. **Not a claim change — the round-90 knowledge note's
  "parser normalization stays the fixture's" sentence is scoped to the token-list shape and remains
  true; this is only a sourcing-coverage observation the L1 may want.**

## 6. Other located quotes (for the L1's record use)

`input.html` §4.10.5.4 "Common input element APIs" — the `showPicker()` method steps and the
File/Color exemption (S219's anchor):

* The DOMException description that the r88 lesson quotes (21 words there) is at **lines 5608–5611**
  (bytes 632402–633185), section §4.10.5.4 (heading at line 5552):
  "Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless input is
  in the File Upload or Color states." — **wc -w = 21**. The page's own quotation marks are straight
  double quotes; the r88 lesson renders the inner name with single quotes and discloses that
  substitution (`corpus/lessons/round-88.md:36–37`). With the page's straight quotes the string is
  an exact substring of the tag-stripped text; with the lesson's single quotes it is not.
* The method-steps version of the same rule is the second list item under
  `<dfn id=dom-input-showpicker>` (line 5827), at **lines 5830–5832** (bytes 658439–659056): the
  origin check plus "and this's type attribute is not in the File Upload state or Color state, then
  throw a "SecurityError" DOMException"; the File/Color exemption clause
  (`File Upload</a> or <a href="#color-state-(type=color)"`) is at **byte 633052**, followed by the
  note "File and Color inputs are exempted from this check for historical reason…".

## 7. Notes, hygiene, unresolved gaps

* **Tooling**: none installed. `/home/vgpnk/.omp/agent/RULES.md` was read first; no pacman/uv/npm
  transaction was needed or performed, so there is nothing to record for the update-safety gate.
* **Scratch**: `/fast/scratch/hyaku/tabi-r90/R90Scout/` was created with `mkdir -p`, used for the
  two staged fetches, and **deleted** before this yield (per the round contract). Nothing was
  written under `/tmp`. The lane's own staged copies under `.ufo/waves/round-90/sources/` are the
  durable artifacts and are byte-identical to live.
* **No lane edits** by this seat. The only file written is this report.
* **Unresolved / not answered by me**:
  1. The r89 lesson's `## Gate` block still carries the 31-word S224 quote while the round-90
     correction block carries the 17-word one (§4). Whether that satisfies D3 "reduce the S224
     Gate quote to ≤25 words" is a record-judgement call for the L1 — the drift gate
     (`r89-census-attribution`) checks the correction block's quote and word count only.
  2. The committed r89 search-log quote in `corpus/SOURCES.md:305` is **39 words** and is **not**
     verbatim at the dfn: it drops the parenthetical `U+002C COMMA character (,)` → "U+002C COMMA
     character", renders "nor containing any U+002C COMMA characters (,)" as "nor containing any
     commas", and drops the "and" before "optionally surrounded". The r89 correction block asserts
     "the search-log quote is verbatim" (`corpus/lessons/round-89.md:101`); the r90 search-log
     entry added at `corpus/SOURCES.md:317` contains **no** located quote at all (0 double-quote
     characters in the entry), so the assertion is not yet carried by a corrected search-log quote
     in the registry. The drift gate's `r89-census-attribution` statement does not read
     `corpus/SOURCES.md`, so a green drift gate does not witness this.
  3. Count wording differs between the two r90 records: `corpus/lessons/round-90.md:30` says
     "Identified 3 / screened 3 / included 0 NEW rows / excluded 0", while the search-log entry at
     `corpus/SOURCES.md:317` says "identified 3 / screened 3 / included 0 / excluded 3 for NEW
     rows". Same round, same three re-opens, two different excluded-counts.
  4. `used-by` cells are stale for all three re-opened rows: `corpus/knowledge/chromium-showpicker-runtime-round-90.md`
     cites S224, S223 and S219, but S224's `used-by` lists only the r89 note, S223's only the r81
     note, and S219's only the r80/r81 notes. SOURCES.md rule 2 makes `used-by` an in-place field
     whose change must be logged old→new in the round lesson; no such log entry is present in
     `corpus/lessons/round-90.md` §Gate as written.

## 8. Confidence

* Fetch digests, sizes, HTTP status, byte offsets, line numbers, `wc -w` counts: **measured
  directly**, reproducible from the staged bytes — high confidence.
* "Verbatim at the dfn" for the 17-word quote: exact-substring test against the tag-stripped dfn
  paragraph — high confidence for the text reading; the raw-byte caveat (§4) is stated explicitly
  so the reading is not silently chosen.
* "No case rule on the microsyntaxes page / a case rule on the input page": read from the §2.3.8
  paragraph and the §4.10.5.1.17 accept paragraph, with the §2.3.7 space-separated note quoted as
  the contrast case — high confidence.
* Items in §7.1–§7.4 are **observations for the L1 to adjudicate**, not defects I have proven
  against a frozen predicate; I am not proposing to amend any predicate, counter, pin, prior,
  threshold or kill rule.
