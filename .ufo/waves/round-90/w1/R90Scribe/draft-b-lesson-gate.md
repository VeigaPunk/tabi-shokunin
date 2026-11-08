# Draft B — round-90 lesson Gate source rows (located quotes + word counts)

**Status: DRAFT for L1 integration. Not written to the lane.**

Every quote below was located by me in the STAGED bytes, not copied from a registry cell.
Staged bytes verified by me at 11:39:

- `.ufo/waves/round-90/sources/whatwg-input.html` — 687,515 B,
  sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`
  (byte-identical to the round-88/86/87 staged copies).
- `.ufo/waves/round-90/sources/common-microsyntaxes.html` — 121,595 B,
  sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666`
  (byte-identical to the round-89 staged copy).

## Gate rows

- **S224** — WHATWG HTML §2.3.8, `dfn id=set-of-comma-separated-tokens`. Located quote (17
  words): "tokens consist of any string of zero or more characters, neither beginning nor ending
  with ASCII whitespace". Located in the staged `common-microsyntaxes.html` at the dfn's
  following sentence; the full normative sentence at that dfn continues "…, nor containing any
  U+002C COMMA characters (,), and optionally surrounded by ASCII whitespace".
  This is the ground for the DOM-parsed token list's delimiters: split on commas; surrounding
  ASCII whitespace is not part of the token. The lane's lowercasing is the FIXTURE's
  normalization, not the spec's, and stays disclosed as such.

- **S223** — WHATWG HTML, the file-upload state's `accept` paragraph. Located quote (20 words):
  "The accept attribute may be specified to provide user agents with a hint of what file types
  will be accepted." Located in the staged `whatwg-input.html`. This is the ground for
  "acceptance is not filtering": `accept` is a HINT to the user agent, so a programmatic answer
  through `DOM.setFileInputFiles` is not filtered by it. The dialog the user would see is
  unmeasured.

- **S219** — WHATWG HTML, the `showPicker()` steps. Located quote (21 words): "Throws a
  \"SecurityError\" DOMException if input is inside a cross-origin iframe, unless input is in the
  File Upload or Color states." Located in the staged `whatwg-input.html`. This is the ground for
  the cross-origin arms and for the same-origin `type=color` arm's exemption. The spec's own
  exemption is why a cross-origin `type=file` picker opens; the `type=color` popup itself stays
  unmeasured (zero `Page.fileChooserOpened` events say nothing about a colour popup).

### Counts

Identified 3 / screened 3 / included 0 NEW rows / excluded 0 for NEW rows — all three rows were
RE-OPENED IN PLACE (S224, S223, S219 stay `mined`, none superseded). The registry stays at 224
rows (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 224; the r90
census-start row is `tabi ok`, exit 0).

## Note for the L1 — two things I measured that the live lesson text does not yet say

1. **The live `corpus/lessons/round-90.md` Gate block lists only ONE of the three located
   quotes with its word count** — S224 gets the 17-word quote; S223 and S219 are described in
   prose ("the attribute is a hint, not a validator"; "the `showPicker()` steps' cross-origin
   SecurityError and the File/Color exemption") with NO located quote and NO word count. The
   r89 lesson's convention was to give a located quote; the round-89 spot-check's §5 defect 3
   was exactly "the S224 Gate quote … exceeds the ≤25-word cap". The r90 Gate block should carry
   all three quotes with their counts (17 / 20 / 21), all three ≤25.

2. **The live `corpus/SOURCES.md` round-90 search-log entry (line 317) carries NO located
   quote at all** — it names the three rows and the two fetched URLs and the two sha256s, but
   no quoted sentence. The round-89 search-log entry DID carry a located quote, and the r89
   spot-check §5 defect 3 was "the search-log r89 quote is a paraphrase inside quotes"
   ("nor containing any commas" against the spec's "nor containing any U+002C COMMA characters
   (,)"). The r90 entry's own wording — "the three located quotes are the sentences the r89/r90
   laws cite" — promises quotes it does not contain. This is the same defect class the r90 drift
   gate was supposed to sweep (`r89-census-attribution` checks the r89 correction's own
   annotation, `words=17 annot=17 annotOk=true`, and the census's row count — but neither reads
   the round-90 search-log entry's quotes).

### Word-count arithmetic for the record

- S224 quote as written in the r89 correction block: 17 words (`tokens consist of any string of
  zero or more characters, neither beginning nor ending with ASCII whitespace`). The r89
  correction block's inline label was `(19 words)` when I read it at 11:26 and reads `(17 words)`
  now (the file was edited at 11:36); the drift gate's `r89-census-attribution` statement
  reports `words=17 annot=17 annotOk=true`. The lane repaired it mid-wave.
- The r89 lesson's OWN `## Gate` section (line 29–31) still carries the 31-WORD quote ("tokens
  each separated from the next by a single U+002C COMMA character (,), where tokens consist of
  any string of zero or more characters, neither beginning nor ending with ASCII whitespace.").
  That is the ≤25-word-cap violation the r89 spot-check routed; the ≤25-word version now lives
  only in the appended `## Corrections carried by round 90` block, not in the Gate section. The
  r90 drift gate reads the appended block, so the Gate section's own over-cap quote is
  unswept. Worth naming in the r90 lesson's correction block as the residual.
- The r89 `corpus/SOURCES.md` search-log quote is 39 words and is a paraphrase inside quotation
  marks (verified by word-level diff against the staged bytes: it drops the `U+002C COMMA
  characters (,)` clause to "nor containing any commas", drops the "(,)," after "COMMA
  character", and drops the "and" before "optionally"). The r89 correction block asserts "the
  search-log quote is verbatim"; against the staged bytes it is not. The r90 drift gate does not
  read that line either.
