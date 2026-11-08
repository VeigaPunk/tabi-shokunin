# R88Scout — source re-opening (WHATWG HTML `accept` grammar + `showPicker()` SecurityError)

seat: `R88Scout` · lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · round 88 · wave `w1`
milestone: source re-opening · mode: read-only findings (no registry rows added, no lane records edited)

## 0. Staging and freshness (verified)

| Source | URL | HTTP | bytes | sha256 | staged under | `cmp` vs live |
|---|---|---|---|---|---|---|
| HTML Standard — input element | `https://html.spec.whatwg.org/multipage/input.html` | 200 | 687,515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` | `/fast/scratch/hyaku/tabi-r88/R88Scout/input.html` | **identical** (second live fetch) |
| MIME Sniffing | `https://mimesniff.spec.whatwg.org/` | 200 | 245,766 | `39dade0e50e7c8c72f0a35feb721eca88aec3ec9c1633618727ee577f1c0ff5c` | `…/mimesniff.spec.whatwg.org` | **identical** |
| Infra Standard | `https://infra.spec.whatwg.org/` | 200 | 383,472 | `8d43350a0a36ebf7682cfe4146dcd7afb8d9f94da0d80677dcc0da16e43590d7` | `…/infra.spec.whatwg.org` | **identical** |
| Common microsyntaxes | `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html` | 200 | 121,595 | `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666` | `…/common-microsyntaxes.html` | **identical** |
| HTTP Semantics (RFC 9110) | `https://www.rfc-editor.org/rfc/rfc9110.txt` | 200 | 502,941 | `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` | `…/rfc9110.txt` | fetched once (plain text, not re-`cmp`ed) |

- Access date for every row above: **2026-11-08** (HTTP `date:` header `Sun, 08 Nov 2026 11:51:04 GMT`).
- `input.html` response headers also carry `last-modified: Fri, 06 Nov 2026 22:04:01 GMT`, `etag: "6aee4ed1-a7d9b"`, `content-length: 687515`; the page's own pubdate reads "Living Standard — Last Updated 6 November 2026".
- Byte offsets below are offsets into the staged `input.html` (and into each staged page for the
  linked pages). The staged `input.html` is byte-identical to the lane's own staged copy
  `.ufo/waves/round-88/sources/whatwg-input.html` (`cmp` → identical, same sha256), so offsets are
  valid against that file too.
- **Freshness verdict:** the sha256 `b0202de1c0b4…` is the same value the lane recorded for this
  page in rounds 78–81 (`corpus/SOURCES.md` rows S216/S219/S223, `.ufo/waves/round-78/w1/R78Scout.md`,
  `.ufo/waves/round-79-seats/R79Scribe/sources-rows.md`). The page has not drifted since round 78;
  the r88 citations rest on unchanged bytes.

Tooling: no tool was installed or upgraded for this seat (no pacman / uv / cargo / npm action).
`/home/vgpn/.omp/agent/RULES.md` was not present on this host (path does not exist), so no
update-safety gate was needed — nothing was installed.

## 1. (a) The `accept` attribute sentence

**Quote** — 20 words — `input.html` byte **424208**, line 4066, in §4.10.5.1.17 *File Upload state
(`type=file`)*, anchor `#attr-input-accept` (the `<dfn id=attr-input-accept>` is at byte 423588):

> The accept attribute may be specified to provide user agents with a hint of what file types will be accepted.

**Grounding:** yes — this is the exact sentence the r88 knowledge note quotes for the C1 law
("The spec's own word for the attribute is 'hint'"). It grounds the *limit* of claims.json C1
("the dialog itself is unmeasured"), not the law's positive half: it says the attribute is a hint to
user agents, which is consistent with, but does not itself prove, "accept is not a validator on a
programmatic answer". The normative sentence that does the limiting work is §1.4 below.

## 2. (a′) The `accept` token grammar (the part the three new legs sit on)

All four are in the same §4.10.5.1.17 File Upload state block, immediately after §1.

**Quote** — 26 words in full; excerpt 13 words — byte **424423**, line 4070:

> each of which must be an ASCII case-insensitive match for one of the following

**Grounding:** grounds the **case-variant** leg (`accept="IMAGE/PNG"`): the accept grammar is
explicitly ASCII case-insensitive, so the upper-case form is an in-grammar token form, not a
malformed one. This is the sentence that makes the r88 case leg meaningful.

**Quote** — 8 words — byte **425136**, line 4073 (the token list's MIME-type entry):

> A valid MIME type string with no parameters

**Grounding — this is the one that does not support the third new leg.** The accept grammar admits
only five token forms: `"audio/*"`, `"video/*"`, `"image/*"`, *a valid MIME type string **with no
parameters***, or a `U+002E FULL STOP` extension string. `image/png;q=0.9` contains `U+003B (;)`,
so it is **not** one of the admitted token forms — the spec's own grammar excludes MIME parameters
from `accept`. The phrase links to `https://mimesniff.spec.whatwg.org/#valid-mime-type-with-no-parameters`,
whose definition (see §4) says a valid MIME type string with no parameters "does not contain
U+003B (;)". Consequently:
- `accept="audio/*,video/*"` — **in grammar** (a comma-separated token set whose tokens match the
  first two listed forms; §3).
- `accept="IMAGE/PNG"` — **in grammar** (ASCII case-insensitive match; §2 + §4's infra definition).
- `accept="image/png;q=0.9"` — **out of grammar** by the spec's own wording.

This does not falsify the measured law (the law is about the *programmatic answer* path, and the
spec's enforcement sentence is scoped to user selection — §1.4). But claims.json C1's type string
says "MIME parameters, case variants and combined lists measured, **one leg per form**", and the
r88 knowledge note lists `image/png;q=0.9` among "token forms" that were unmeasured until r88. Per
the cited page, one of the three forms is not a form of the `accept` grammar at all; it is a
non-conforming attribute value whose behaviour is unspecified (no token list the UA can match
against). **Context / caveat, not a claim-grounding sentence** — flagged for L1, not a proposed
amendment.

**Quote** — 19 words — byte **425610**, line 4075:

> The tokens must not be ASCII case-insensitive matches for any of the other tokens (i.e. duplicates are not allowed).

**Grounding:** context only — a constraint on the token set; not cited by the r88 laws.

**Quote** — 19 words — byte **425894**, line 4076:

> To obtain the list of tokens from the attribute, the user agent must split the attribute value on commas.

**Grounding:** context only, but it is the page's own pointer to the comma-splitting rule and it
grounds the *combined-list* leg's shape (`audio/*,video/*` is two tokens). The linked definition is
on the microsyntaxes page (§3).

## 3. (a″) The enforcement sentence — the one that actually bounds the law

**Quote** — 20 words — byte **426624**, line 4088:

> User agents should prevent the user from selecting files that are not accepted by one (or more) of these tokens.

**Grounding:** grounds claims.json C1's stated limit ("the dialog itself is unmeasured"). The
enforcement obligation is scoped to **the user selecting files** in the dialog — a "should" on the
user agent's picker UI. It says nothing about a programmatic answer, so it is consistent with the
measured law that a `DOM.setFileInputFiles` answer is not filtered. It does not by itself establish
that accept is inert on the programmatic path (see the two quotes below, which do the work).

**Quote** — 9 words — byte **640924**, line 5714 (§4.10.5.4, `files` IDL attribute setter):

> Replace the element's selected files with the given value.

**Grounding:** grounds the positive half of the C1 law for the IDL-setter path — the setter has no
`accept` step at all; it replaces the selected files unconditionally. Note the r88 driver answers via
CDP `DOM.setFileInputFiles` (`scripts/chrome-cdp-showpicker-round88.mjs`, `DOM.setFileInputFiles`
calls), not via the `files` IDL setter, so this sentence grounds the *spec-level shape* of the law
rather than the exact mechanism measured.

**Quote** — 18 words — byte **419111**, line 4052, and **16 words** — byte **419952**, line 4053
(the "update the file selection for an element" steps, §4.10.5.1.17):

> Fire an event named input at the input element, with the bubbles and composed attributes initialized to true.

> Fire an event named change at the input element, with the bubbles attribute initialized to true.

**Grounding:** partially grounds the law's "fires trusted input+change" clause — the spec requires
`input` and `change` to be fired when the file selection is updated. The spec does **not** use the
word "trusted" here, so "trusted" is not grounded by this page (it is a runtime observation in the
receipt, correctly labelled as such in the knowledge note).

## 4. (b) The `showPicker()` SecurityError sentence and its File/Color exemption

Three sentences, all §4.10.5.4 *Common input element APIs*; the method's `<dfn id=dom-input-showpicker>`
is at byte 657325, and the IDL entry `#dom-input-showpicker-dev` at byte 630296.

**(b1) IDL summary — 21 words** — byte **632409**, line 5608:

> Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or Color states.

**(b2) The algorithm step — 42 words in full; excerpt 18 words** — byte **659063**, line 5832:

> this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

> (full) If this's relevant settings object's origin is not same origin with this's relevant settings object's top-level origin, and this is a select element, or this's type attribute is not in the File Upload state or Color state, then throw a "SecurityError" DOMException.

**(b3) The File/Color exemption — 29 words in full; excerpt 11 words** — byte **661141**, line 5838:

> File and Color inputs are exempted from this check for historical reason

> (full) File and Color inputs are exempted from this check for historical reason: their input activation behavior also shows their pickers, and has never been guarded by an origin check.

**Grounding:** claims.json C1's text is about the `accept` law and does not itself assert a
SecurityError clause, so relative to claims.json these three are **context**; they are however the
normative support for the cross-origin arms carried from r84/r86/r87 and for the r88 knowledge note
§2 ("the cross-origin … `SecurityError`"). They are also exactly what the r88 counter expects:
`scripts/check-showpicker-round88.mjs` line 407 expects `sp84-cross-origin-color` →
`{ ok: true, ret: 'undefined' }` while lines 405–415 expect `SecurityError` for the non-file,
non-color cross-origin legs — i.e. the counter encodes the exemption from (b3)/(b1) as a
discriminator. The exemption is a *spec-side* expectation about cross-origin `showPicker()`; it does
not itself measure anything about `accept`.

## 5. (c) MIME parameter (`;q=`) / case-variant parsing — where it actually lives

**On `input.html`: no sentence states or implies how a `;q=` parameter is parsed, and none states
how a case-variant type is parsed.** The page's only two pointers are:
- "ASCII case-insensitive match" → `https://infra.spec.whatwg.org/#ascii-case-insensitive` (§5.1);
- "A valid MIME type string with no parameters" → `https://mimesniff.spec.whatwg.org/#valid-mime-type-with-no-parameters` (§5.2).

Searched and confirmed absent from the staged `input.html` text: the token `;q=` (0 occurrences),
the word `quality` as a word (0 occurrences), and any `q`-weight grammar. The word "parameter"
occurs twice, once as the MIME-type-with-no-parameters link text and once in an unrelated
`stepDown` sentence.

### 5.1 Infra — the case-variant rule (linked from `input.html`)

URL `https://infra.spec.whatwg.org/` · HTTP 200 · 383,472 B · sha256 `8d43350a…` · accessed 2026-11-08.
Quote — 24 words — byte **112005**, line 1904 (§4 "Primitive data types", ASCII case-insensitive match):

> A string A is an ASCII case-insensitive match for a string B, if the ASCII lowercase of A is the ASCII lowercase of B.

Companion definition — 22 words — byte **110767**, line 1896:

> To ASCII lowercase a string, replace all ASCII upper alphas in the string with their corresponding code point in ASCII lower alpha.

Anchor verified present on the fetched page: `id="ascii-case-insensitive"` at byte 112158;
`id="ascii-lowercase"` at byte 110826; `id="split-on-commas"` at byte 124404.

**Grounding:** grounds the *case-variant* leg. The accept grammar's case-insensitivity is realised
exactly this way, so `IMAGE/PNG` is the same token as `image/png` under the spec's own definition.
The r88 measurement of the case variant therefore exercises an in-grammar token.

### 5.2 MIME Sniffing — parameter parsing (linked from `input.html`)

URL `https://mimesniff.spec.whatwg.org/` · HTTP 200 · 245,766 B · sha256 `39dade0e…` · accessed 2026-11-08.

Quote — 20 words — byte **28618**, line 503 (§4.3 *MIME type writing*, anchor
`#valid-mime-type-with-no-parameters`):

> A valid MIME type string with no parameters is a valid MIME type string that does not contain U+003B (;).

Quote — 14 words — byte **27075**, line 484 (§4.3, anchor `#valid-mime-type`):

> A valid MIME type string is a string that matches the media-type token production.

Quote — 22 words in full; excerpt 15 words — byte **31312**, line 556 (§4.4 *Parsing a MIME type*,
anchor `#parse-a-mime-type`):

> Let mimeType be a new MIME type record whose type is type, in ASCII lowercase

Quote — 7 words — byte **33402**, line 585 (same algorithm):

> Set parameterName to parameterName, in ASCII lowercase.

Anchors verified present on the fetched page: `id="valid-mime-type-with-no-parameters"`,
`id="parse-a-mime-type"`, `id="mime-type-writing"`, `id="parameters"`.

**Grounding:** this is the page that carries the parameter/case parsing, and it establishes the
second-order fact that matters for the `;q=` leg: MIME Sniffing's *parse a MIME type* accepts an
arbitrary `;name=value` parameter list with **no q-weight semantics whatsoever** — `q` is just a
parameter name, lower-cased like any other; there is no "0.9" preference meaning in this algorithm.
And because `input.html`'s accept grammar requires "with no parameters", the accept attribute never
reaches that parser for a `;q=`-bearing value. **Context for the `;q=` leg: the `;q=` weight
concept is not part of the `accept` attribute's grammar at all.**

### 5.3 HTTP Semantics — where `q=` weights actually live (not linked from `input.html`)

URL `https://www.rfc-editor.org/rfc/rfc9110.txt` · HTTP 200 · 502,941 B · sha256 `21c1cdce…` ·
accessed 2026-11-08.

Quote — 6 words — byte **138396**, line 2980 (§8.3.1 *Media Type*):

> media-type = type "/" subtype parameters

Quote — 7 words — byte **138489**, line 2984 (§8.3.1):

> The type and subtype tokens are case-insensitive.

Quote — 7 words — byte **254264**, line 5362 (§12.4.2 *Quality Values*; §12.4.2 heading at byte
253522, line 5346):

> weight = OWS ";" OWS "q=" qvalue

**Grounding:** context, and the reason the `;q=` leg is a non-form. `q=` is a *weight* in the HTTP
`Accept` **header** (§12.4.2), defined by HTTP Semantics; the HTML `accept` **attribute** has no
weight grammar, and the `media-type` production that `input.html`'s MIME-type token refers to is
§8.3.1, whose parameters are generic `name=value`. The r88 leg therefore measures an HTML attribute
value carrying a token borrowed from a different (HTTP header) grammar.

### 5.4 Common microsyntaxes — the comma-split rule (linked from `input.html`)

URL `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html` · HTTP 200 · 121,595 B ·
sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666` · accessed 2026-11-08.

Quote — 21 words — byte **116442**, line 1339 (§2.3.8 *Comma-separated tokens*, anchor
`#set-of-comma-separated-tokens`):

> a string containing zero or more tokens each separated from the next by a single U+002C COMMA character (,)

**Grounding:** context for the combined-list leg — `audio/*,video/*` is a well-formed set of
comma-separated tokens with no surrounding whitespace; it is the in-grammar shape.

## 6. Answers to the three assigned questions, in one line each

1. **`accept` attribute sentence and word count** — §1: "The accept attribute may be specified to
   provide user agents with a hint of what file types will be accepted." — **20 words**, byte
   424208 / line 4066, `#attr-input-accept`, §4.10.5.1.17.
2. **`showPicker()` SecurityError sentence and its File/Color exemption, with word counts** —
   §4: IDL summary **21 words** (byte 632409, line 5608); algorithm step **42 words** (byte 659063,
   line 5832); File/Color exemption **29 words** (byte 661141, line 5838).
3. **MIME-parameter / case-variant parsing sentence on that page** — **none exists**. The
   case-variant rule is on Infra (`#ascii-case-insensitive`, 24-word definition, byte 112005, line
   1904); parameter parsing is on MIME Sniffing (`#parse-a-mime-type`, byte 31312 line 556 and
   byte 33402 line 585; `#valid-mime-type-with-no-parameters`, byte 28618 line 503) — both fetched,
   status/size/sha256 recorded in §0. The `q=` **weight** grammar lives in RFC 9110 §12.4.2
   (byte 254264, line 5362) and belongs to the HTTP `Accept` header, not to the HTML attribute.

## 7. Findings summary (ranked)

| # | Finding | Where | Severity for the round |
|---|---|---|---|
| F1 | The `accept` grammar admits **no** MIME parameters: the MIME-type token form is "a valid MIME type string **with no parameters**" (no `U+003B`), so `accept="image/png;q=0.9"` is a **non-conforming attribute value**, not a third token form. claims.json C1's "one leg per form" and the r88 note's grouping of `;q=0.9` among "token forms" are therefore imprecise about that leg's status. The measured law itself is unaffected (the programmatic path is unfiltered, and the spec's `should prevent` is scoped to user selection). | `input.html` byte 425136 (line 4073) + MIME Sniffing byte 28618 (line 503) | wording precision; not a falsifier |
| F2 | The spec's accept-enforcement sentence ("User agents should prevent the user from selecting files…") is scoped to **user selection**, and the `files` IDL setter contains **no** accept step ("Replace the element's selected files with the given value."). Together these are the spec-side support for "accept is not a validator on a programmatic answer". | bytes 426624, 640924 | supports C1 |
| F3 | "fires trusted input+change" is only half-grounded by the spec: the file-selection update steps require `input` and `change` to be fired, but the word *trusted* does not appear in that passage. Trusted-ness is a runtime observation, correctly scoped in the r88 note. | bytes 419111, 419952 | minor wording |
| F4 | The `q=` weight concept is HTTP-only (RFC 9110 §12.4.2); MIME Sniffing's *parse a MIME type* has no weight semantics (`q` is an ordinary lower-cased parameter name). The r88 `;q=0.9` leg therefore carries a token from a foreign grammar. | MIME Sniffing bytes 31312/33402; RFC 9110 byte 254264 | reinforces F1 |
| F5 | **Freshness: no drift.** `input.html` is byte-identical (sha256 `b0202de1c0b4…`, 687,515 B) to the lane's staged copy `.ufo/waves/round-88/sources/whatwg-input.html` and to the copies recorded for rounds 78–81 in `corpus/SOURCES.md` (S216/S219/S223). The r88 source citations rest on unchanged bytes; `cmp` against a second live fetch is identical. | §0 | supports C1/C2 |

## 8. Remaining unknowns (not resolvable from the sources re-opened here)

- Whether a user agent is required to *reject* an `accept` value it cannot tokenise (the `;q=` form)
  is **unspecified**: `input.html` gives no parsing rule for it and no behaviour for a non-conforming
  value. Not answerable from the spec; only a UA reading (Chromium's `FileInputType`/`accept`
  parsing) or an empirical probe could say. Out of this seat's scope.
- The DOM-side normalisation of the `accept` attribute (how a UA tokenises the raw string) remains
  unmeasured — the r88 note already names this as frontier; nothing on the re-opened pages changes
  that.
- Whether the dialog (as opposed to the programmatic answer) filters on these three token forms is
  unmeasured and, in a headless fixture, unmeasurable; the re-opened sources cannot supply it.

## 9. Reproducibility

Fetch (all HTTP 200): `input.html`, `mimesniff.spec.whatwg.org`, `infra.spec.whatwg.org`,
`common-microsyntaxes.html`, `rfc9110.txt` → staged under
`/fast/scratch/hyaku/tabi-r88/R88Scout/` (scratch tree removed after this report was written).
Byte offsets are into those staged files; each is byte-identical to the live response (`cmp`).
Every quote above was extracted by stripping tags and collapsing whitespace from the staged bytes,
then locating the quote's first byte in the original file; word counts are whitespace-delimited
tokens of the quote as printed (full-sentence counts are given where a ≤25-word excerpt is used).
