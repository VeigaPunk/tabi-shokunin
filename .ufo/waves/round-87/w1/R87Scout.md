# R87Scout — re-opened WHATWG sources for the r87 `accept`-token-grammar law

Seat: `R87Scout` (scout, read-only leaf; no subagent dispatch).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · round 87 · wave `w1` · base `24765dd9` · D `3dd4b0802d67` · nonce `tabi-r87-l1-3dd4b0802d67`.
Axis judged: **coverage**. Milestone: *source re-opening*.

This report is findings only. It proposes **no** change to any predicate, counter, pin, prior,
threshold or kill rule, and it adds/edits **no** `SOURCES.md` row (the registry is untouched:
`corpus/SOURCES.md` was read, never written). Nothing in `corpus/evidence/round87` was written.

---

## 0. The fetch — staged bytes vs. live bytes: **BYTE-IDENTICAL**

| field | value |
|---|---|
| URL | `https://html.spec.whatwg.org/multipage/input.html` |
| Access date | **2026-11-08** (fetch header `date: Sun, 08 Nov 2026 10:15:01 GMT`; local `date -u` = `2026-11-08T10:15:01Z`) |
| Fetch status | **HTTP/2 200**, `content-type: text/html; charset=utf-8`, no redirect (`url_effective` == requested) |
| Bytes | **687515** (header `content-length: 687515`; `size_download=687515`) |
| Live sha256 | **`b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`** |
| `last-modified` / `etag` | `Fri, 06 Nov 2026 22:04:01 GMT` / `"6aee4ed1-a7d9b"` |
| Page self-identifies as | `Living Standard — Last Updated 6 November 2026` (physical line 16) |
| **Staged copy** | `.ufo/waves/round-87/sources/whatwg-input.html` — 687515 B, sha256 **`b0202de1c0b4…f0fcd16`** |
| **Byte-identical?** | **YES.** `cmp <live> <staged>` → identical (`cmp` exit 0); same size, same sha256. The staged bytes are byte-identical to the live fetch. |
| Also identical to | `.ufo/waves/round-86/sources/whatwg-input.html` and `.ufo/waves/round-81/sources/whatwg-input.html` — same digest `b0202de1c0b4…f0fcd16` (the r87 staging is a re-stage of the same bytes, not a new revision). |

**Digest-vs-line-number note (important for the existing registry rows).** The lane's *older*
retained body `corpus/evidence/round-19/sources/input.html.gz` decodes to
sha256 `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` — a **different
digest at the same byte length (687515)**. A full diff of the two decoded bodies shows **exactly
one changed line**, line 16, and only in the publication date (`20 October 2026` → `6 November
2026`; both strings are 15 characters, hence the identical length). **Every physical line number
quoted in this report is therefore identical under both digests** — verified by locating each
quote in both decoded bodies. Rows S216 / S219 / S223 (which cite this URL at lines
4066–4068 and 5832–5840) keep their line locators under the r87 digest; only the digest string
in their provenance column differs between the r19 body and the r87-staged body.

All quotes below were machine-verified as exact substrings of the **tag-stripped,
entity-decoded, whitespace-collapsed** page text (rendered text of the staged bytes), not read off
by eye. Word counts are `wc -w` of the exact quoted string.

---

## 1. (a) The `accept` attribute's own hint sentence — §4.10.5.1.17

**Quote A1 — 20 words (`wc -w`):**

> The accept attribute may be specified to provide user agents with a hint of what file types will be accepted.

* **Locator:** WHATWG HTML **§4.10.5.1.17 “File Upload state (`type=file`)”**, the paragraph that
  defines the `accept` content attribute (`<dfn … id="attr-input-accept">`).
  Page anchor `https://html.spec.whatwg.org/multipage/input.html#file-upload-state-(type=file)`;
  attribute dfn `#attr-input-accept`.
  **Local lines 4066–4068** of the staged bytes (4066 = `<p>The <dfn …>accept</code></dfn>`;
  4067 = “attribute may be specified to provide user agents with a hint of what file types will be”;
  4068 = “accepted.</p>”).
* **Verbatim check:** exact substring of the rendered page — **True**.

**Three supporting sentences, same section, same digest:**

| # | words | quote | lines |
|---|---:|---|---|
| A2 | 21 | `User agents may use the value of this attribute to display a more appropriate user interface than a generic file picker.` | 4080–4084 |
| A3 | 20 | `User agents should prevent the user from selecting files that are not accepted by one (or more) of these tokens.` | 4088–4089 |
| A4 | 19 | `data received from a client should be treated with caution, as it may not be in an expected format` | 4119–4121 |

* A4's full sentence continues “…even if the user is not hostile and the user agent fully obeyed
  the accept attribute’s requirements.” (lines 4120–4121). Verbatim: **True**.
* A3 is a **SHOULD** whose object is *“the user from selecting”* — it constrains the **picker UI**,
  not the `input` element’s file list.

**What it grounds (r87 C1).** `accept` is addressed *to the user agent as a hint for the picker UI*;
the normative obligation the spec attaches to it (A2) is a UI duty. This is the normative hinge
for the r87 law “accept is **not** a validator on a programmatic answer”: there is no normative
sentence anywhere in this section that makes a delivered file’s type or bytes contingent on the
token list. A4 makes the same point from the server side — a server must not assume the received
bytes match the `accept` tokens even when the user agent fully obeyed them.

**What it does NOT ground (one thing).** It does not ground that a **human** picking a disallowed
file in a real OS dialog would be refused (A3 is a SHOULD about the *picker’s user-selection
surface*). The page contains **0** occurrences of `setFileInputFiles`, **0** of `fileChooserOpened`
and **0** of `DOM.setFileInputFiles` (grep over the staged bytes) — so no sentence on this page can
entail the CDP answer path or the file-chooser metric; the spec can only *license* the wording,
never prove the measurement.

---

## 2. (b) The Color-state exemption for `showPicker()`

**Quote B1 — 16 words (`wc -w`):**

> this's type attribute is not in the File Upload state or Color state, then throw a

* **Locator:** WHATWG HTML **§4.10.5.4 “Common `input` element APIs”**, the
  `HTMLInputElement.showPicker()` / `HTMLSelectElement.showPicker()` method steps (dfn
  `id="dom-input-showpicker"` at line 5827), **step 2** — the cross-origin guard.
  Page anchor `https://html.spec.whatwg.org/multipage/input.html#dom-input-showpicker`.
  **Local lines 5832–5836**: 5832–5834 carry the origin condition (“…origin is not same origin
  with… top-level origin, and… this is a select element, or”), **5835** carries the
  File-Upload/Color exemption clause quoted above, 5836 the `"SecurityError" DOMException`.
* **Verbatim check:** **True** (the continuation `a "SecurityError" DOMException.` immediately
  follows on line 5836; the full 18-word form is also verbatim, quoted in the r86 record).

**Quote B2 — 12 words (`wc -w`), the non-normative note on the same step:**

> File and Color inputs are exempted from this check for historical reason

* **Locator:** the `<p class=note>` immediately after that step, **lines 5838–5840** (the note
  continues: “…their input activation behavior also shows their pickers, and has never been guarded
  by an origin check.”). Verbatim: **True**.

**Quote B3 — 21 words (`wc -w`), the IDL description of the same rule:**

> Throws a "SecurityError" DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or Color states.

* **Locator:** §4.10.5.4, the `input.showPicker()` IDL `<dd>` block, **lines 5608–5610**.
  Verbatim: **True**.

**Two adjacent sentences of the same IDL block, for the exception order (same lines 5596–5606):**

| # | words | quote | lines | verbatim |
|---|---:|---|---|---|
| B4 | 9 | `Throws an "InvalidStateError" DOMException if input is not mutable.` | 5602–5603 | True |
| B5 | 10 | `Throws a "NotAllowedError" DOMException if called without transient user activation.` | 5605–5606 | True |
| B6 | 15 | `Shows any applicable picker UI for input, so that the user can select a value.` | 5597 | True |
| B7 | 11 | `If input does not support a picker, this method does nothing.` | 5599–5600 | True |

**What it grounds (r87 C1).** The exemption is a **two-state** exemption — File Upload **and**
Color — from the cross-origin `SecurityError`; the r87 receipt exercises the Color half
(`sp84-cross-origin-color`) and the File-Upload half is exercised only through the same-origin
file legs. Note B1 is the *step* text (normative); B2 is a *note* (non-normative) and B3 is the
*IDL description* (normative-in-the-IDL-block, but a summary). **B1 is the one to cite.**

**What it does NOT ground (one thing).** It does not ground that a picker **opened**. The step
governs a refusal condition only; it says nothing about pickers, CDP events or activation
consumption. It is also *silent* on the `accept` attribute — the exemption and the token grammar
are independent clauses of the same page.

---

## 3. (c) How the attribute value is parsed (commas / whitespace)

### 3.1 On the staged page itself (`input.html`)

**Quote C1 — 21 words (`wc -w`), the value’s required shape:**

> If specified, the attribute must consist of a set of comma-separated tokens, each of which must be an ASCII case-insensitive match

* **Locator:** §4.10.5.1.17, immediately after the hint sentence. **Local lines 4070–4071**
  (4070 carries the `<a id="file-upload-state-(type=file):set-of-comma-separated-tokens">` link;
  4071 the “ASCII case-insensitive” link). Verbatim: **True**.

**Quote C2 — 19 words (`wc -w`), the parse instruction:**

> To obtain the list of tokens from the attribute, the user agent must split the attribute value on commas.

* **Locator:** §4.10.5.1.17, **local lines 4076–4078** (4077–4078 carry the
  `<a href="https://infra.spec.whatwg.org/#split-on-commas">split the attribute value on
  commas</a>` link). Verbatim: **True**.

**Quote C3 — 10 words (`wc -w`), the link target’s own wording inside the sentence:**

> the user agent must split the attribute value on commas

* Same locus, lines 4077–4078, rendered without the anchor. Verbatim: **True**.

**The permitted token forms (same section, line 4073) — the enumerated list:**

* `The string "audio/*"` / `The string "video/*"` / `The string "image/*"` — the three wildcard
  forms, verbatim at line 4073;
* `A valid MIME type string with no parameters` (line 4073, linking to
  `mimesniff.spec.whatwg.org/#valid-mime-type-with-no-parameters`);
* `A string whose first character is a U+002E FULL STOP character (.)` (line 4073) — the
  extension form;
* plus the duplicate prohibition (lines 4075–4076): tokens must not be ASCII case-insensitive
  matches for one another.

### 3.2 The whitespace rule is **NOT on the staged page** — it lives on two linked pages

**This is the one substantive finding of this seat, and it bears directly on the r87 whitespace
leg (`accept="  image/png ,  .txt  "`).** `input.html` contains **no** sentence about whitespace in
the `accept` value: grep for `ASCII whitespace` in the staged bytes returns lines 1966, 2115 and
2152 only (url/email sanitization) — **0 hits in lines 4060–4135**, i.e. none in the accept
section. The whitespace semantics are imported by the two links that C1 and C2 point at, both on
**other** URLs. Both were fetched live for this seat (HTTP 200 each):

**(i) `https://html.spec.whatwg.org/multipage/common-microsyntaxes.html`** — HTTP 200,
121595 B, sha256 `2e9e2cbbe1ede8d637464fdd4d7bb899b4bfe8c90131538fe925f55b85268666`
(§2.3.8 “Comma-separated tokens”; dfn `id="set-of-comma-separated-tokens"` at line 1338):

| # | words | quote | lines |
|---|---:|---|---|
| D1 | 24 | `A set of comma-separated tokens is a string containing zero or more tokens each separated from the next by a single U+002C COMMA character` | 1338–1339 |
| D2 | 18 | `where tokens consist of any string of zero or more characters, neither beginning nor ending with ASCII whitespace` | 1339–1340 |
| D3 | 22 | `Leading and trailing whitespace around each token doesn't count as part of the token, and the empty string can be a token.` | 1346–1347 |

(D2’s clause continues “…nor containing any U+002C COMMA characters (,), and optionally surrounded
by ASCII whitespace.” — lines 1340–1342. The worked example at lines 1345–1347: the string
`" a ,b,,d d "` is four tokens, `“a”`, `“b”`, the empty string and `“d d”`.)

**(ii) `https://infra.spec.whatwg.org/`** — HTTP 200, 383472 B, sha256
`8d43350a0a36ebf7682cfe4146dcd7afb8d9f94da0d80677dcc0da16e43590d7`
(§4.7 “split a string `input` on commas”, dfn `id="split-on-commas"` at line 2090):

| # | words | quote | lines |
|---|---:|---|---|
| E1 | 8 | `Strip leading and trailing ASCII whitespace from token.` | 2116 |
| E2 | 20 | `Let token be the result of collecting a sequence of code points that are not U+002C (,) from input, given position.` | 2110–2111 |

(plus the loop step “While position is not past the end of input:” at line 2105 and
“Append token to tokens.” at line 2120.)

**(iii) `https://mimesniff.spec.whatwg.org/`** — HTTP 200, 245766 B, sha256
`39dade0e50e7c8c72f0a35feb721eca88aec3ec9c1633618727ee577f1c0ff5c` (§4.3 “MIME type writing”):

| # | words | quote | lines |
|---|---:|---|---|
| F1 | 20 | `A valid MIME type string with no parameters is a valid MIME type string that does not contain U+003B (;).` | 504–505 |

**What this grounds for the r87 token forms.** Read together, the three pages give the r87
whitespace variant its normative meaning: the value `  image/png ,  .txt  ` is a **conforming**
*set of comma-separated tokens* (D2: tokens are “optionally surrounded by ASCII whitespace”, and
the surrounding whitespace does not count as part of the token, D3), whose token list after the
split is exactly `image/png` and `.txt` (E1 strips the surrounding ASCII whitespace per token).
Both of those tokens are permitted `accept` tokens on the staged page: `image/png` is a *valid MIME
type string with no parameters* (F1), and `.txt` is *“a string whose first character is a U+002E
FULL STOP character (.)”* (line 4073). The r87 multi-MIME leg `image/png,application/pdf` is a
two-token set of the same permitted kind (both are valid MIME type strings with no parameters);
the r87 `audio/*` and `video/*` legs are two of the three wildcard strings enumerated verbatim at
line 4073.

**What it does NOT ground (one thing).** None of these sentences constrains what the *file list of
an `input` element* may contain — they constrain the *user agent’s* tokenisation of a hint, and
they are all addressed to “the user agent”. They license the r87 law’s wording (“accept is a hint,
not a validator on a programmatic answer”); they do not entail the measurement, and they say
nothing about the dialog itself, which the r87 law explicitly leaves unmeasured.

---

## 4. The “raw attribute is read from the page” clause — where it is grounded

The r87 law states the raw `accept` attribute is read back from the page. That is a **driver/fixture**
fact, and it is confirmed in the lane’s own pinned instruments (read-only inspection):

* `scripts/chrome-cdp-filechooser-round78.mjs:196` — the fixture's `window.__inputs()` reads
  `accept: e.getAttribute('accept')` — the **raw content-attribute string**, not a parsed token
  list, not the IDL property.
* `scripts/chrome-cdp-showpicker-round87.mjs:140` — `PATCH_INPUTS_TO` extends the id list to
  `[… 'aw','am','ap','cos','aa','av','a2','aws']`, so the four r87 inputs are included in that
  read-back.
* `scripts/chrome-cdp-showpicker-round87.mjs:108` — `PATCH_BODY` carries the four new attributes
  verbatim: `id="aa" accept="audio/*"`, `id="av" accept="video/*"`,
  `id="a2" accept="image/png,application/pdf"`, `id="aws" accept="  image/png ,  .txt  "`.

**Observed in the scored r87 receipt** (`corpus/evidence/round87/chromium-showpicker/receipt.json`,
read-only): `fixtureInputs` reports the raw strings —
`aa → 'audio/*'`, `av → 'video/*'`, `a2 → 'image/png,application/pdf'`,
`aws → '  image/png ,  .txt  '` — i.e. the **whitespace survives into the read-back verbatim**,
which is consistent with “the raw attribute is read from the page” and consistent with the
measured `stateAfter` (the delivered file lands with its own bytes/type regardless of the token).

**Spec-side corroboration (new, not previously recorded in the lane):** the `accept` content
attribute is exposed as a plain reflected `DOMString` —
`[ CEReactions , Reflect ] attribute DOMString accept ;` at **staged line 80** (dfn
`id="dom-input-accept"`), and the DOM Standard’s reflection getter is
`Return the result of running get an attribute value given this and name.`
(`https://dom.spec.whatwg.org/`, §4.9 “Interface Element”, line 10448 of the fetched page; HTTP
200, 2718377 B, sha256 `397c2a438720089741483e3e155e3ad3fec25fc78751ca75cb25589454976a32`).
So the DOM `input.accept` property is the **untrimmed attribute value** — which is why the
whitespace variant is observable as a raw string at all. (The driver reads `getAttribute`, so this
is corroboration of the shape, not the mechanism.)

---

## 5. Coverage notes for L1 (observations only — no instrument change proposed)

1. **The r87 law's source anchor already exists and is unchanged.** The accept-as-hint sentence
   (A1, lines 4066–4068) and the Color/File exemption (B1, lines 5832–5836) are the same two
   sentences already cited by registry rows **S223** and **S219/S216** — re-opened in place at the
   same digest `b0202de1c0b4…f0fcd16`, no new row required for either. The r87 law adds **token
   forms**, not a new spec proposition.
2. **One genuinely new source surface this round: the token/parsing rules.** The r87 law adds
   `audio/*`, `video/*`, a multi-MIME list, and a **whitespace variant**. The whitespace variant's
   normative meaning is *not* on the staged page — it comes from `common-microsyntaxes.html`
   (D1–D3) and `infra.spec.whatwg.org` (E1–E2), plus `mimesniff.spec.whatwg.org` (F1) for the
   “valid MIME type string with no parameters” leg. If L1 wants the whitespace leg to be
   *source-grounded* rather than merely *measured*, these three pages are the sentences it needs;
   none of them currently has a row in `corpus/SOURCES.md` (grep for
   `common-microsyntaxes` / `infra.spec.whatwg.org` / `mimesniff` → **0 hits**). **I have not
   added or proposed editing any row** — that is the registry owner's call, and the rows are
   FROZEN-adjacent in the sense that this seat must not write them.
3. **The token list in the spec is exactly the grammar the r87 legs walk.** Line 4073 enumerates
   the three wildcard strings (`audio/*`, `video/*`, `image/*`), the valid-MIME-type form, and the
   `.ext` form — i.e. the r86+r87 legs now cover *seven* distinct token forms across those
   enumerations (wildcard ×3, mixed list, non-matching MIME token, multi-MIME list, extension
   token). The spec's own list is the natural boundary of the r87 law's “seven token forms, not
   the full grammar” limit: MIME *parameters* and case variants are outside line 4073's list
   (parameters are excluded by F1), so the frontier the claim names is consistent with the spec's
   own enumeration.
4. **Two scope limits the sources re-confirm, unchanged from r86.** (i) The `accept` page says
   nothing about CDP, `DOM.setFileInputFiles` or `Page.fileChooserOpened` (0 hits each) — the
   spec can only license the law's wording, never entail the measurement; the measurement lives
   in the frozen receipt. (ii) `Page.fileChooserOpened` is a **file**-chooser metric; the spec's
   own picker-support note (line 1470, and the sentence at lines 1498–1499, 19 words: *“the input
   activation behavior only shows pickers for the special historical cases of the File Upload and
   Color states.”*) lists Color among the states for which implementations show picker UI — so a
   zero file-chooser count cannot be read as “no UI appeared”. Both limits are already stated in the
   r86 record and are unchanged here.
5. **Byte-identity is confirmed and the staged copy is trustworthy for citation.** The staged
   `.ufo/waves/round-87/sources/whatwg-input.html` is byte-identical to the live fetch
   (`cmp` clean, sha256 `b0202de1c0b4…f0fcd16`, 687515 B) and is also the identical file staged
   for r81 and r86 — the same Living Standard build (“Last Updated 6 November 2026”) throughout
   those three rounds.

---

## 6. Tools and provenance

| tool | version | channel | reason |
|---|---|---|---|
| `curl` | pre-installed (OpenSSL 3.6.5) — **no install, no update performed** | — | fetching the WHATWG / Infra / Mimesniff / DOM pages into scratch |
| `python3` | 3.14 (pre-installed) | — | tag-stripping + entity-decoding the pages for verbatim-substring checks; rendering the receipt read-only |
| `jq`-style inspection | `python3` `json` module | — | reading `corpus/evidence/round87/chromium-showpicker/receipt.json` read-only |
| `cmp`, `sha256sum`, `wc -w`, `grep` | coreutils / GNU grep (pre-installed) | — | byte-identity, digests, quote word counts, locator search |

**No package was installed or upgraded in this seat** — no `pacman`, no `uv tool`, no `npm -g`, no
binary download. The operator update-safety gate was therefore not engaged (no transaction was
needed). The host-wide pacman pause was respected: nothing was installed by any channel.

**Commands run (all read-only; nothing in the lane tree, `corpus/`, `.ufo/state` or a sibling lane
was modified):** `curl -o` on five public spec URLs (scratch only), `curl -I` on the WHATWG URL,
`sha256sum`/`cmp` on the fetched copy vs. the staged lane copy and vs. the r19 retained body,
`diff` between the two decoded bodies, `wc -w` on the quote files, a python3 verbatim-substring
check of every quoted sentence against the rendered page text, `grep` locator searches, and
read-only inspection of the lane's own receipt, drivers and `corpus/SOURCES.md`.

**No git/jj command of any kind was run**; no fixture repo was created; no sibling lane or the
fleet repo was touched; `agent://all` was not messaged.

**Scratch:** `/fast/scratch/hyaku/tabi-r87/R87Scout/` (the five fetched pages, the rendered-text
file and the quote files) — **removed before yield**, per the lane bounds. The digests that
identify the sources are recorded in §0 and §3.2 above, so nothing is lost by the removal and no
fetched copy was written into the lane's corpus.
