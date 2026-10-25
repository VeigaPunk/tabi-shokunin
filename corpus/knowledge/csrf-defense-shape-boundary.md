# The CSRF defence shapes a submit can carry, and why SameSite is only one of them

source: S102 — https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt — §8.8.1 "Defense in depth", fetched 2026-10-25, 146976 bytes, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`
source: S103 — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html — §"Employing Custom Request Headers for AJAX/API" and §"Dealing with Client-Side CSRF Attacks (IMPORTANT)", fetched 2026-10-25, last-modified 2026-10-25T06:56:47Z, 157809 bytes, sha256 `6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312`
verified-at: 2026-10-25
recheck: on-release for S102 (a draft only changes when a new revision is published; -13 has Expires 18 May 2024), 90d for S103 (rolling revision): `curl -fsSL https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt | grep -c 'not the extent of'` → must be ≥1
tier: documented upstream, not measured in this lane

**Nothing in this entry was run, captured or observed in a browser by this round** — the one earlier capture it names (§6, the round-9 fixture) was made by the lane in an earlier round and is here only as a classification target. It is the
vocabulary a journey receipt needs in order to *classify* a submit it actually
observes. The measurement — a loopback submit carrying one of these shapes,
captured through CDP — has not been made, and the lane's bounded-runs rule
(`PROVINCE.md` — external sites and consequential actions) still gates any real site.

## 1. What the draft says, and what a receipt may not conclude from it

Boundary first: this entry records **what the sources say and how to observe it**.
Whether a defence is adequate is a security judgment and belongs to kasegi (the
fleet roster's bounty/security-research lane); This lane's own scope line records provenance, not
security verdicts (`corpus/knowledge/stateful-fixture-evidence.md:79`; the interaction
classes live in `interaction-approval-table.md:58-62`). Nothing below is this lane's
verdict on a site.

The draft states the guarantee and its own limit in one subsection body (S102
§8.8.1, lines 2815–2828; the quoted spans sit at 2815–2824):

> "SameSite" cookies offer a robust defense against CSRF attack when deployed in
> strict mode, and when supported by the client …

> It is, however, prudent to ensure that this designation is not the extent of
> a site's defense against CSRF

> Developers are strongly encouraged to deploy the usual server-side defenses
> (CSRF tokens, ensuring that "safe" HTTP methods are idempotent, etc)

Three conclusions a receipt must therefore not draw: that a `SameSite=Lax` or
`Strict` cookie *is* the site's CSRF defence; that a submit succeeding cross-site
proves the site has none; that a `SameSite=None; Secure` cookie is a defence at
all — [INFERENCE] that attribute pairing is a delivery requirement (draft §8.8.3,
lines 2871–2873), not a statement about a site's CSRF defence. The clause is a demand for a second layer, which is why the second layer is
observable — and observability is this lane's ground.

## 2. The second layer is listed by the sheet, not enumerated by it

The sheet (S103) lists several server-side defences. Several of them leave something a capture
can hold; the list is **open** — besides the three tabulated below, the sheet names Fetch
Metadata (`Sec-Fetch-Site`), `Origin`/`Referer` checking and user-interaction
verification, and this entry does not claim those are all of them. Fetch Metadata is
itself a captured request header, which is why §4 carries a slot for it:

| Defence class (the sheet's own naming) | What a lane inference says a receipt could hold | Note |
|---|---|---|
| synchronizer token | a token value that appears both in the document and in the submitted body or a header | [INFERENCE] the paired-occurrence test is this lane's, not the sheet's wording |
| double-submit cookie | a cookie value repeated in the body or a header | [INFERENCE] same test, cookie side |
| custom request header | a non-simple header on an AJAX/API request; the sheet states the mechanism, and a cross-origin form cannot set one |

The custom-header case has a mechanical consequence for a journey driver: the
sheet's sentence is "A user-friendly defense that is particularly well suited for
AJAX or API endpoints is the use of a custom request header", and the adjacent
sentence adds "No token is needed for this approach." A driver that replays a
request without that header is not testing the same request the page made.

The observation column ("what a lane inference says a receipt could hold") is
inference throughout, not a claim that the sheet says it: the sheet says which
defences exist, not what they look like in a capture. Rows whose mechanism is
documented are not tagged `[INFERENCE]` individually; the ones that add a lane test
carry the tag inline. Nothing in this table was captured except the round-8 fixture
instance named in §6.

## 3. SameSite does not cover the JavaScript-originated case

S103 §"Dealing with Client-Side CSRF Attacks (IMPORTANT)":

> web browsers will include cookies in same-site request contexts initiated by
> JavaScript programs, circumventing the SameSite cookie policies

and the sheet's own §"Limitations of SameSite" says the same thing in its own
words: "Client-side CSRF is unaffected. SameSite operates on cross-site requests.
It does not protect against client-side CSRF".

For this lane that is the difference between two receipts that look alike: a
same-site navigation the browser initiated (SameSite applies) and a same-site
request a page script issued (SameSite does not). The invocation record already
distinguishes them — the navigation-history witness classifies `typed` / `link` /
`form_submit` (`multi-step-journey.md` §2 and §6) — so the classification uses an
existing witness, and the *classification* of a real submit against this vocabulary
is not yet measured (see §6).

## 4. What a receipt should record

1. The defence shape observed — one of the three tabulated in §2, or `fetch-metadata`
   (`Sec-Fetch-Site` on the request), or `none-observed` — with the artefact that shows
   it (form body, request headers, cookie pair).
2. Whether the submit was browser-initiated or script-initiated.
3. What the SameSite attributes were, and whether they were *load-bearing* for
   this request shape — not whether they "protect against CSRF".
4. `none-observed` is a finding, never a conclusion that the site is undefended:
   the shapes above are the sheet's enumeration, not the space of all defences.

## 5. Errata — how this entry differs from the staged material it came from

Adopted from the shokuknow `corpus-expansion-1` package (`merge/tabi/`, entry
`csrf-defense-boundary.md`) and re-grounded under this lane's bar
(`QUALITY.md` 1–10, 61–63). Three material defects in the staged bytes were corrected here,
each found by re-opening the source rather than by reading the package:

- **E1 — a quote that was a paraphrase.** The staged entry quotes "offers a robust
  defense"; the draft says "offer a robust defense" (plural verb). The quote is
  corrected, not kept with a note (`grep -c 'offers a robust defense'` → 0 on the
  fetched bytes). E2's heading count uses the page's `<h1>`–`<h4>` headings (34 of 39
  heading tags); none matches the staged section.
- **E2 — two misplaced section citations.** The staged entry cites
  "§Common CSRF weaknesses and protection mechanisms", which does not exist in the
  sheet (0 headings of 34 match); the custom-header sentence lives under
  §"Employing Custom Request Headers for AJAX/API", and the JavaScript sentence
  under §"Dealing with Client-Side CSRF Attacks (IMPORTANT)", not under
  §"Limitations of SameSite".
- **E3 — an over-cap concatenation.** The staged entry joins the custom-header
  sentence and "No token is needed for this approach." into one 28-word quote,
  above this lane's ≤25-word Gate cap; they are two sentences and are cited as two.

None of the three is a fabrication: every span quoted *in this entry* is present in
the fetched bytes; what failed was the staged entry's citation layer. They are citation-layer defects, which is exactly what a re-grounding pass
exists to catch — a staged entry whose quotes are right and whose locators are
wrong still fails the Gate.

## 6. Open

- **Partly measured, not classified:** this lane's round-9 loopback fixture did
  submit a form carrying a hidden `token` input whose value also appeared in the
  captured POST, and the retained artefacts record it
  (`corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/facts.json` records
  `tokenShape`; the co-occurrence of value and POST is written up at
  `stateful-fixture-evidence.md:516`, and the `submit-refused token-consumed` ledger
  entry is at seq 9 of the same run). That is one
  captured instance of the token-shaped row — on the lane's own fixture, not on a
  site, and it was never classified by this vocabulary. What remains unmeasured: a
  site's defence shape, the double-submit and custom-header rows, and the
  cross-origin behaviour of any of them.
- **Not claimed:** that these three classes exhaust the sheet's list (they do not —
  see §2) or that a SameSite cookie's presence says anything about a site's
  CSRF posture.
- **Unknown:** whether a real site's defence shape can be read from a single
  request without a differential (a token field absent on page 1 and present on
  page 2 is more informative than either alone).
- **Unknown:** whether the sheet carried "§Common CSRF weaknesses and protection
  mechanisms" in an earlier revision; one GET was made, `last-modified` is
  2026-10-25, and the digest above is the only reproducibility anchor.
