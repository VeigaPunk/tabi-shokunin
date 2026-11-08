# R91Scout — source re-opening (postMessage proxy, activation duration, showPicker exceptions)

Seat: scout (leaf). Lane `tabi-shokunin`, round 91, wave w1. Reports only; no lane edits.
Fetched 2026-11-08 (UTC dates in the header block). Scratch: `/fast/scratch/hyaku/tabi-r91/R91Scout`
(deleted before yield).

## Method

1. `curl` each live page to scratch, record HTTP status / `Content-Length` / `Last-Modified` /
   `ETag`, and sha256 the bytes.
2. sha256 the committed staged copies `.ufo/waves/round-91/sources/*.html` and compare.
3. Tag-strip the raw HTML, normalise whitespace, and locate each committed quote as a **contiguous
   substring**; record the raw line numbers and the enclosing heading (`<h4>/<h5>` id and secno).
4. Count words as whitespace tokens after dropping only the detached punctuation the committed
   quoting convention introduces (standalone `"` around exception names, the detached `,` after
   `iframe`); attached punctuation and the inline `(*)` keyword count as part of their word. This
   rule is the one under which every committed count reproduces (see the rule check below).

## 1. Staging is byte-identical to live

| source | HTTP | bytes | live sha256 | staged sha256 (`.ufo/waves/round-91/sources/`) | identical |
|---|---|---|---|---|---|
| `web-messaging.html` | 200 | 132,045 | `26fe488d443702224de6bc961770a1ea395feb74f4c5107e557d52eef259fbba` | same | yes |
| `interaction.html` | 200 | 454,117 | `7499db18f2b3429c24ca315b7df4b779132b88c7c79bbfb6eef0b383a035f8c9` | same | yes |
| `input.html` | 200 | 687,515 | `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16` | same | yes |

Response headers (2026-11-08): all `HTTP/2 200`; `last-modified: Fri, 06 Nov 2026 22:04:02/01 GMT`;
`etag: "6aee4ed2-203cd"`, `"6aee4ed1-6ede5"`, `"6aee4ed1-a7d9b"`; page `pubdate` `6 November 2026`.
Live bytes today hash to the committed snapshot ids (`26fe488d4437`, `7499db18f2b3`,
`b0202de1c0b4`) at the committed sizes, so the rows' snapshot identifiers are current.

## 2. Anchor + word-count verification

| id | anchor (raw line) | committed quote | words | verdict |
|---|---|---|---|---|
| S225 | §9.3.2.1 Authors, `h5 id=authors` L94; sentence L111-113 | `Authors should not use the wildcard keyword (*) in the targetOrigin argument in messages that contain any confidential information` | 19 | **true** — verbatim contiguous fragment |
| S226 | §6.4.1 Data model, `h4 id=user-activation-data-model` L507; sentence L519-520 | `a transient activation duration, which is a constant number indicating how long a user activation is available for certain user activation-gated APIs` | 22 | **true** — verbatim contiguous fragment |
| S219-NA | §4.10.5.4 Common input element APIs, `h5 id=common-input-element-apis` L5552; `showPicker()` exception list L5605-5606 | `Throws a " NotAllowedError " DOMException if called without transient user activation` | 10 | **true** — complete sentence |
| S219-SEC | same section, exception list L5608-5610 | `Throws a " SecurityError " DOMException if input is inside a cross-origin iframe , unless input is in the File Upload or Color states` | 21 | **true** — complete sentence; the exemption is the `unless …` clause inside it |
| S219-NOTE (r80 spot-check, supporting) | `showPicker()` algorithm note, L5838-5840 | `File and Color inputs are exempted from this check for historical reason` | 12 | **true** — verbatim prefix of the note sentence |

Full spec sentences, for fragment boundaries (same counting rule):

- S225 sentence L111-113 is **41 words**: the committed 19-word quote is a prefix; the sentence
  continues `, as otherwise there is no way to guarantee that the message is only delivered to the
  recipient to which it was intended.`
- S226 sentence L519-520 is **31 words**: the committed 22-word quote starts mid-sentence; the
  dropped prefix is `A user agent also defines ` and the dropped tail is
  ` (e.g., for opening popups).`
- S219 note sentence L5838-5840 is **29 words**; the r80-cited 12-word prefix is exact.

Counting-rule check: the rule reproduces all five committed counts (19 / 22 / 10 / 21 / 12) and no
other; under a naive whitespace count the fragments are 20 / 22 / 10 / 22 / 12, which is why the
detached-quote/comma convention has to be stated (`(*)` is one word; the `,` the lesson detaches
after `iframe` is not).

## 3. Row anchors beyond the quoted sentences

- S225 row anchor text: `§9.3.2.1 Authors and §9.3.3 Posting messages` — both present. The wildcard
  sentence is inside §9.3.2.1 (L94-127). §9.3.3 carries the delivery rule at L164-166: `If the
  origin of the target window doesn't match the given target origin, the message is discarded, to
  avoid information leakage.` — this is what the row's claim "a message is delivered only when the
  target origin matches" rests on.
- S225's second half ("the receiver reads `event.origin` and `event.source`") is supported by the
  **preceding** §9.3.2.1 sentence L100-102 (`Authors should check the origin attribute to ensure
  that messages are only accepted from domains that they expect to receive messages from.`,
  22 words), not by the quoted wildcard sentence. The lesson quotes only the wildcard sentence; the
  row's claim spans two sentences of the same subsection. No false count — a scope observation.
- S226 row anchor `§6.4.1 Data model and §6.4.2 Processing model` — both present; §6.4.2 L612-617
  carries `Activation consuming APIs … can consume user activation by performing the following
  steps`, which is the "consuming APIs" half of the row's claim.
- S219 anchors: exception list under the `input.showPicker()` `dt` (L5596-5610) in §4.10.5.4, the
  normative algorithm steps at L5830-5846 (`#dom-input-showpicker`) with the same three refusals in
  algorithm form, and the File/Color exemption note at L5838-5840. The row's sentence pair is the
  prose exception list, not the algorithm list; both are present and consistent.

## 4. Findings

1. **All committed anchors and word counts are true as of the 2026-11-08 live bytes.** No row needs
   a correction for truth; nothing was amended (and no predicate/pin change is proposed).
2. **Precision:** the lesson labels the S225 and S226 quotes "the sentence"; both are fragments of
   longer sentences (19/41 and 22/31). The counts are true of the quoted text. If the record is ever
   re-touched, the honest phrasing is "the wildcard-targetOrigin sentence's first clause" /
   "the duration clause", or quote in full. This is a wording issue in `corpus/lessons/round-91.md`
   §Gate, not an instrument change.
3. **Undocumented counting convention:** the records state counts without the token rule. The rule
   is recoverable (see §2) but a future seat re-counting naively will get 20/22/10/22/12 and flag
   false drift. Recording the convention (drop detached quotes and detached commas; count `(*)`
   and attached punctuation) would make the counts replayable.
4. No source is stale: `Last-Modified` 2026-11-06 22:04Z predates every fetch, and live bytes still
   hash to the committed snapshot ids. S219's row date `2026-11-07` (original mining) and the r91
   lesson's `2026-11-08` re-open are both consistent with unchanged bytes.

## 5. Remaining unknowns

- The WHATWG pages are living; identity holds only for the staged bytes pinned above. Anything
  fetched after 2026-11-08 must be re-hashed, not assumed.
- The word-count rule is inferred (it is the only rule that reproduces all five committed counts);
  no lane document states it.
- S219 supports the File/Color exemption only as a clause inside the SecurityError bullet plus the
  historical-reason note; the spec gives no separate "exemption sentence", so a search for one
  will fail.
- Whether the r91 proxy fixture's own behaviour matches the spec beyond these sentences is the
  measured legs' question, not a source question; this seat does not re-score it.

## Stop

Every committed anchor and word count cited by round 91 for the three pages was located at an exact
subsection/line in bytes identical to the committed staged copies. Two quotes are fragments; counts
are true. No lane edits.
