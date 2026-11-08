# R89Scout — source re-opening (WHATWG `accept` / comma-separated tokens)

- **Seat**: `R89Scout` (UFO-FSD scout; leaf member — no subagent dispatch).
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (base `5a901163`, digests commit D `7bde5e6c2f2d`).
- **Judged on**: coverage, freshness. **Milestone**: source re-opening.
- **Posture**: read-only. No commits, no pushes, no lane-record edits, no scored/evidence writes, no sibling-lane or fleet-repo contact. The only file written is this report.
- **Scratch**: `/fast/scratch/hyaku/tabi-r89/R89Scout/` (created for the staging, **removed before yield** — verified absent at hand-off).
- **Tools**: `curl 8.23.0 (OpenSSL 3.6.5)`, `sha256sum`, `cmp`, `python3 3` — all pre-installed; **no installs or upgrades performed**, so no tool/channel/version/reason record is owed beyond "nothing installed".

---

## 1. Verdict summary

- **Both cited pages re-open live at the expected bytes.** `input.html` = HTTP 200, 687,515 B, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` (matches the expected `b0202de1c0b4…`); `common-microsyntaxes.html` = HTTP 200, 121,595 B, sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666` (matches the expected `2e9e2cbbe1ed…`). Both were re-fetched a second time into separate files and `cmp`-identical to the staged copies.
- **(a) The `accept` attribute sentence is located** at `input.html#attr-input-accept`, 20 words — "The accept attribute may be specified to provide user agents with a hint of what file types will be accepted." The word "hint", not "validate", is load-bearing for the carried r81–r88 law, and it is present in the current bytes.
- **(b) The `set of comma-separated tokens` dfn is located** at `common-microsyntaxes.html#set-of-comma-separated-tokens` (§2.3.8 "Comma-separated tokens"), 56 words for the full dfn paragraph; the comma-split clause alone is 25 words and the ASCII-whitespace clause 20 words. The dfn text is byte-for-byte the wording the r89 registry row S224 already carries, so **S224 is confirmed in place, not superseded**.
- **(c) Neither of the two cited pages assigns a case rule to accept matching.** §2.3.8 contains **zero** occurrences of "case", "lowercase", or "uppercase" — it is a pure comma/whitespace grammar. The case rule that *does* exist lives one level up, on the `accept` attribute paragraph in `input.html` (§4.10.5.1.17): each token "must be an **ASCII case-insensitive** match for one of the following", plus "The tokens must not be ASCII case-insensitive matches for any of the other tokens". The definition of that case rule is in Infra (`infra.spec.whatwg.org/#ascii-case-insensitive`), located and quoted below (24 words). So the ASCII-lowercasing the fixture performs is **the lane's own normalization**, matching what claims.json and S224 already disclose; the spec's own case rule is a *matching* rule (ASCII case-insensitive comparison), not a *tokenization* rule.
- **Freshness**: both pages carry `Last-Modified: Fri, 06 Nov 2026 22:04:01 GMT` and the in-page stamp "Last Updated 6 November 2026" — the same revision the lane's r88/r89 rows were opened against. The live bytes are identical to the lane's staged `.ufo/waves/round-89/sources/common-microsyntaxes.html` and `.ufo/waves/round-88/sources/whatwg-input.html` (`cmp` IDENTICAL for both), so **no source drift occurred during round 89** and the round-88 and round-89 re-openings are mutually consistent.
- **One scope observation for the L1** (a note, not an amendment proposal): the fixture's token parser uses JavaScript `String.prototype.trim()` and `toLowerCase()`, which are **Unicode** operations, whereas the spec's rules are **ASCII**-scoped (ASCII whitespace = TAB/LF/FF/CR/SPACE; ASCII lowercase = A–Z only). For the four r89 legs' actual accept strings the two agree exactly (all inputs are ASCII), so **no measured value is affected** — but the *word* "ASCII" in the counter's normalization comment is broader in the code than in the spec. Also, the spec explicitly permits an **empty token** (§2.3.8 worked example: "the empty string can be a token"), which the fixture's parser drops. Neither divergence touches any of the four frozen legs' token lists.

---

## 2. Staging and byte-identity (`cmp`)

Fetched live with `curl -sS -L` into `/fast/scratch/hyaku/tabi-r89/R89Scout/`, then fetched a second time into `live-*.html` for an independent comparison.

| page | URL | HTTP | bytes | sha256 (staged) | sha256 (2nd fetch) | `cmp` staged vs live |
|---|---|---|---|---|---|---|
| HTML input | https://html.spec.whatwg.org/multipage/input.html | 200 | 687,515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` | identical | **IDENTICAL** |
| HTML common microsyntaxes | https://html.spec.whatwg.org/multipage/common-microsyntaxes.html | 200 | 121,595 | `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666` | identical | **IDENTICAL** |

Cross-check against the lane's own staged copies (read-only `cmp`, no writes):

| lane staged copy | vs my fresh fetch | result |
|---|---|---|
| `.ufo/waves/round-89/sources/common-microsyntaxes.html` | fresh `common-microsyntaxes.html` | **IDENTICAL** |
| `.ufo/waves/round-88/sources/whatwg-input.html` | fresh `input.html` | **IDENTICAL** |
| `.ufo/waves/round-86/sources/whatwg-input.html` | fresh `input.html` | **IDENTICAL** |

**Access date**: 2026-11-08 (UTC). Header values at fetch time: `date: Sun, 08 Nov 2026 12:42:10 GMT`, `last-modified: Fri, 06 Nov 2026 22:04:01 GMT`, `etag: "6aee4ed1-a7d9b"` (input) / `"6aee4ed1-1dafb"` (microsyntaxes), `content-length` equal to the received byte counts above. In-page stamp on both: "Last Updated 6 November 2026".

**Byte offsets** below are offsets into the staged copy (byte 0 = first byte of the file), i.e. they are directly reproducible against the lane's own staged files.

---

## 3. The located quotes

Word counts are whitespace-token counts of the quoted text as rendered (HTML tags stripped), each ≤ 25 words as required.

### 3.1 `input.html` — the `accept` attribute (§4.10.5.1.17 File Upload state)

Anchor for all four: `https://html.spec.whatwg.org/multipage/input.html#attr-input-accept` (`id=attr-input-accept`, 1 occurrence in the file).

**A-1 — the `accept` attribute sentence (the "hint, not validator" sentence)** — 20 words
> The accept attribute may be specified to provide user agents with a hint of what file types will be accepted.

bytes `424205-424416` (the whole `<p>` element), section heading `<h6 id="file-upload-state-(type=file)"><span class=secno>4.10.5.1.17</span>` at byte 4004-area. This is the sentence S223 (round-81 row) already carries; it re-opens unchanged in the current bytes.

**A-2 — the token-list requirement, including the case rule** — 24 words
> the attribute must consist of a set of comma-separated tokens, each of which must be an ASCII case-insensitive match for one of the following:

bytes `424420-424881` (the whole `<p>`). The `set of comma-separated tokens` link in this paragraph points at `common-microsyntaxes.html#set-of-comma-separated-tokens` — the direct HTML→microsyntaxes cross-reference that makes (b) the definitional source for the `accept` grammar.

**A-3 — the duplicate rule** — 19 words
> The tokens must not be ASCII case-insensitive matches for any of the other tokens (i.e. duplicates are not allowed).

bytes `425607-426167` (the `<p>` element).

**A-4 — the split rule (the "must split the attribute value on commas" sentence)** — 19 words
> To obtain the list of tokens from the attribute, the user agent must split the attribute value on commas.

bytes `425894-426163` (the sentence inside the A-3 paragraph). The linked target is Infra `#split-on-commas`.

**A-5 — the "should prevent" sentence (a *user-agent UI* rule, not a validation rule)** — 20 words
> User agents should prevent the user from selecting files that are not accepted by one (or more) of these tokens.

bytes `426621-426742`. Read with A-1, this is the spec's whole position on `accept`: it constrains what the **picker offers/prevents**, and the "should" is on the user agent — it never says the selected file set is validated. That is the textual ground for the carried law "accept is not a validator on a programmatic answer".

### 3.2 `common-microsyntaxes.html` — §2.3.8 Comma-separated tokens

Section heading at byte 115920: `<h4 id=comma-separated-tokens><span class=secno>2.3.8</span> Comma-separated tokens`. The dfn element is `<dfn id=set-of-comma-separated-tokens>` at byte `116282` (1 occurrence).

**B-1 — the comma-split clause of the dfn** — 25 words
> A set of comma-separated tokens is a string containing zero or more tokens each separated from the next by a single U+002C COMMA character (,)

bytes `116277-116468` (start of the `<p>` through the end of the comma clause). Anchor `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#set-of-comma-separated-tokens`.

**B-2 — the ASCII-whitespace clause of the dfn** — 20 words
> neither beginning nor ending with ASCII whitespace, nor containing any U+002C COMMA characters (,), and optionally surrounded by ASCII whitespace.

bytes `116535-116963` (to the end of the `<p>`). Together B-1 + B-2 are the whole dfn paragraph (the full paragraph renders to 56 words); the two clauses are quoted separately here to keep each quote ≤ 25 words.

**B-3 — the worked example (comma-split + empty token)** — 21 words
> For instance, the string " a ,b,,d d " consists of four tokens: "a", "b", the empty string, and "d d".

bytes `116976-117244` (the `<p class=example>` element). Anchor `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#comma-separated-tokens`. Note the source bytes spell the example with U+00A0 NO-BREAK SPACE inside the `<code>` element (raw `"\xa0a\xa0,b,,d\xa0d\xa0"`); the rendered text above is the same characters.

**B-4 — the whitespace-does-not-count sentence** — 22 words
> Leading and trailing whitespace around each token doesn't count as part of the token, and the empty string can be a token.

bytes `116976-117244` (same example paragraph). This is the exact sentence that answers the r89 question "`  image/png ,  .txt  ` — one token or two?": **two** tokens, `image/png` and `.txt`, because the surrounding whitespace does not count as part of a token. It also states that the empty string *can* be a token (B-3's third token is empty).

**D-1 — the restriction clause** — 12 words
> the tokens must all fit within those restrictions; other values are non-conforming.

bytes `117248-117649` (the `<p>` following the dfn). This is what makes A-2's "each … must be an ASCII case-insensitive match for one of the following" a *conformance* requirement on the tokens, and it is the sentence that makes `image/png;q=0.9` (the `amc` fixture) a non-conforming accept value — the same narrowing the r88 legs already record.

### 3.3 The case rule's own definition (Infra — the third page the two cited pages point at)

Neither cited page contains the case rule's *definition*; both link it to Infra. It was fetched and staged for completeness (`infra.spec.whatwg.org`, HTTP 200, 383,472 B, sha256 `8d43350a0a36ebf7682cfe4146dcd7afb8d9f94da0d80677dcc0da16e43590d7`, `Last-Modified: Mon, 19 Oct 2026 12:00:03 GMT`).

**C-1 — "ASCII case-insensitive match", the rule that would assign case** — 24 words
> A string A is an ASCII case-insensitive match for a string B, if the ASCII lowercase of A is the ASCII lowercase of B.

bytes `112001-112566` (the `<p>`), anchor `https://infra.spec.whatwg.org/#ascii-case-insensitive` (`id="ascii-case-insensitive"`, 1 occurrence). This is the located quote that assigns the case rule: the comparison is defined *by* ASCII-lowercasing both sides.

**C-2 — the split-on-commas algorithm's whitespace step** — 8 words
> Strip leading and trailing ASCII whitespace from token.

bytes `125661-125731`, anchor `https://infra.spec.whatwg.org/#split-on-commas` (`id="split-on-commas"`, 1 occurrence; §4.7 Strings). This is the algorithmic counterpart of B-2/B-4: the *UA's* token-list production strips ASCII whitespace per token.

**C-3 — "ASCII whitespace"** — 14 words
> ASCII whitespace is U+0009 TAB, U+000A LF, U+000C FF, U+000D CR, or U+0020 SPACE.

bytes `79786-79961`, anchor `https://infra.spec.whatwg.org/#ascii-whitespace` (`id="ascii-whitespace"`, 1 occurrence; §4.6 Code points). This is the exact five-character set the spec means by "ASCII whitespace" — the set the fixture's trim is supposed to implement.

---

## 4. Answer to (c) — does either page assign a case rule to accept matching?

**No, not §2.3.8; yes, but on the `input` page, and it is a matching rule rather than a tokenization rule.** Measured on the staged bytes:

| question | measurement | result |
|---|---|---|
| Does §2.3.8 (`common-microsyntaxes.html` bytes 116277–117649) mention case at all? | case-insensitive regex over the whole §2.3.8 section | **0 hits** for "case", "lowercase", "uppercase" |
| Does the microsyntaxes page assign a case rule anywhere relevant? | page-wide counts | 20 "case-insensitive" hits — **all** in §2.3.2 boolean attributes / §2.3.3 keywords / §2.3.6 legacy colors; **0 "lowercase" on the entire page** |
| Does the `accept` attribute paragraph assign a case rule? | `input.html` bytes 424205–426742 | **2** "ASCII case-insensitive" occurrences: A-2 (each token must be an ASCII case-insensitive match for one of the allowed forms) and A-3 (no ASCII-case-insensitive duplicates) |
| Where is that rule defined? | Infra | C-1: "A string A is an ASCII case-insensitive match for a string B, if the ASCII lowercase of A is the ASCII lowercase of B." |

**Consequence for the r89 law as stated.** The r89 counter binds "the DOM-parsed token list from WHATWG §2.3.8 (split on commas, trim ASCII whitespace) plus ASCII lowercasing". The source re-opening confirms:

1. **Comma-split** — B-1 (spec, §2.3.8) + A-4 (the `accept` UA must split the attribute value on commas) + C-2 (the algorithm's per-token strip). Grounded.
2. **Trim ASCII whitespace** — B-2/B-4 (whitespace around a token does not count as part of the token) + C-2/C-3 (the algorithm strips ASCII whitespace; ASCII whitespace is exactly TAB/LF/FF/CR/SPACE). Grounded, and `"  image/png ,  .txt  "` → two tokens is exactly what the spec says.
3. **ASCII lowercasing** — **not** a §2.3.8 rule (that section is case-free) and **not** a *tokenization* rule at all. The spec's case rule is that a token must be an *ASCII case-insensitive match* for one of the allowed forms (A-2/A-3), and the match is defined via ASCII lowercasing (C-1). So lowercasing the token list is the fixture's own normalization — **exactly what claims.json's C1 `limit` field and the S224 registry row already disclose** ("lowercasing is this lane's fixture normalization, not the spec's"). The re-opening **corroborates** the lane's disclosed limit rather than contradicting it.

### 4.1 Two scope observations for the integration owner (observations only — no predicate, counter, pin, prior, threshold or kill rule is proposed for amendment)

Both are recorded because they are true of the current bytes and neither affects any frozen r89 measurement:

- **Unicode vs ASCII in the fixture's parser.** `scripts/chrome-cdp-showpicker-round89.mjs:142` parses tokens with `p.trim().toLowerCase()`. JavaScript's `trim()` strips all Unicode whitespace (it removes U+00A0 NO-BREAK SPACE and U+FEFF, which C-3's ASCII set does not contain), and `toLowerCase()` is Unicode-aware (U+212A KELVIN SIGN folds to `k`; U+0130 folds to a two-code-point `i̇`), whereas the spec's ASCII lowercase (C-1) touches only A–Z. Every accept string in the r89 fixture set is pure ASCII, so **all four new legs' token lists are identical under the spec rule and the code rule** — verified in the scored receipt, where `am`→`["image/png", ".txt"]`, `a2`→`["image/png", "application/pdf"]`, `aws`→`["image/png", ".txt"]`, `aw`→`["image/*"]`. The observation is about the *word* "ASCII" in the comment, not about a wrong value.
- **Empty tokens.** B-3/B-4 say the empty string *can* be a token; the fixture's parser drops empty segments (`if (t) o.push(t)`). No r89 accept string contains an empty segment, so no leg is affected.

---

## 5. Coverage check against what the round-89 law cites

| element the law names | located? | where |
|---|---|---|
| `accept` attribute sentence | yes | A-1, `input.html#attr-input-accept`, 20 words, bytes 424205-424416 |
| WHATWG §2.3.8 `set of comma-separated tokens` dfn | yes | B-1 (comma split, 25 w) + B-2 (ASCII whitespace, 20 w), `common-microsyntaxes.html#set-of-comma-separated-tokens`, bytes 116277-116963 |
| comma-split rule for `accept` | yes | A-4 (HTML) + C-2 (Infra algorithm) |
| case rule | yes — but on the `input` page, defined in Infra | A-2, A-3 (HTML) + C-1 (Infra); **absent from §2.3.8** |
| "accept is not a validator" ground | yes | A-1 ("hint") + A-5 ("User agents should prevent the user from selecting files…") |
| conformance of tokens to the allowed forms | yes | A-2 + D-1 |
| ASCII whitespace definition | yes | C-3, Infra `#ascii-whitespace` |
| token-duplicate rule | yes | A-3 |

**Round-89 source row S224 (`corpus/SOURCES.md`)** was re-checked against the live page: its quoted dfn wording, its §2.3.8 anchor, its byte count (121,595 B) and its sha256 prefix (`2e9e2cbbe1ed…`) all still hold, and its "used-by" target `corpus/knowledge/chromium-showpicker-runtime-round-89.md` does **not yet exist** in the lane (knowledge dir currently holds 101 files, the newest showPicker note is `…-round-88.md`) — i.e. the row points at a note the integration owner still has to write. That is the single open coverage gap this seat can see from outside the L1's seat; the note's content is the L1's to write.

---

## 6. Confidence and remaining unknowns

**High confidence** (direct measurement on byte-verified live copies, quotes reproduced by re-extracting the quoted byte ranges and confirming containment, word counts computed mechanically): A-1…A-5, B-1…B-4, D-1, C-1…C-3; the §2.3.8-has-no-case-rule finding (0 regex hits over the section, 0 "lowercase" page-wide); the `cmp` byte-identity of both pages; the freshness metadata.

**Remaining unknowns / not claimed**:
- Whether Chromium's own internal `accept` tokenization matches the spec grammar — this is *not* source-answerable and is not claimed; claims.json already records the token list as the fixture's normalization rather than Chromium's internal tokenization. The scored receipt's `domRead.acceptTokens` values are the fixture's `__inputs()` output, read on the page at settle.
- Whether the four legs' token lists would survive a Unicode-shaped accept string — out of scope for round 89 (no such string in the fixture), recorded in §4.1 as an observation only.
- Whether the r89 knowledge note (the S224 used-by target) will cite the same dfn wording — the L1's to write; this seat supplies the located quotes for it.

**Scratch hygiene**: `/fast/scratch/hyaku/tabi-r89/R89Scout/` was created for staging and is removed before this report is handed off; nothing under `/fast/scratch/hyaku/tabi-r89/` is left behind. No file in `corpus/`, `scripts/`, `plans/`, `corpus/evidence/round89/` or `.ufo/waves/round-89/scored/` was written or modified; the only write is this report at `.ufo/waves/round-89/w1/R89Scout.md`.
