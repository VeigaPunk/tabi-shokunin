<!-- ScribeEntry, round 23 w1. Draft only — no corpus file was written. Paste the block between PASTE markers into corpus/knowledge/csrf-defense-shape-boundary.md; the L1 owns that write. -->
<!-- Support census applied: SrcDivergence.md (w1) marks S the "documented upstream" label and the two custom-header quotes; D-with-quote the S102 limit chain, the JS-cookie sentence and the OWASP SameSite-limitation lines; I the receipt-classification block and the frontier reading (labelled below). Absent as staged: registry ids S145/S146, the phantom section, the closed "enumerable / on the wire" triple, and the "Wave 2 supplied…" sentence. -->
<!-- PASTE START -->
# CSRF defence patterns a submit receipt can classify — and what SameSite does not settle

source: S102 — Cookies: HTTP State Management Mechanism, draft-ietf-httpbis-rfc6265bis-13 — https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt — §8.8.1 "Defense in depth" (heading-derived; body lines 2815-2828, p. 51) and §5.5.7.1 "Strict" and "Lax" enforcement (lines 1784-1786, p. 32)
source: S103 — Cross-Site Request Forgery Prevention Cheat Sheet — OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html — §Employing Custom Request Headers for AJAX/API (#employing-custom-request-headers-for-ajaxapi); §Dealing with Client-Side CSRF Attacks (IMPORTANT) (#dealing-with-client-side-csrf-attacks-important); §Limitations of SameSite (#limitations-of-samesite)
verified-at: 2026-10-25 (this lane fetched both documents with two independent read-only GETs that agreed byte-for-byte — draft 146,976 B sha256 062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf; sheet 157,809 B sha256 6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312 — and every quote below was re-grepped in those bytes)
recheck: 180d for S102, 90d for S103 — `curl -sS <url> | sha256sum`, then `grep -c -F '<span>'` for each quote; on a changed digest re-read before reuse. OWASP spans are matched on tag-stripped, whitespace-collapsed text (the sheet wraps phrases in inline markup, so a raw-byte match can miss a genuine span).

**Documented upstream, not measured here.** No request, browser or server was
exercised to produce this note; both documents were read.

## The limit, from the draft (S102)

§8.8.1 reads: "SameSite" cookies "offer a robust defense against CSRF attack when
deployed in strict mode, and when supported by the client" (18 words, l.2815-2816) —
two conditions, strict deployment and client enforcement. The same section adds:
"It is, however, prudent to ensure that this designation is not the extent of a site's
defense against CSRF" (19 words, l.2816-2818), "as same-site navigations and submissions
can certainly be executed in conjunction with other attack vectors such as cross-site
scripting" (18 words, l.2818-2820), and points readers at server-side work:
"Developers are strongly encouraged to deploy the usual server-side defenses (CSRF
tokens, ensuring that "safe" HTTP methods are idempotent, etc)" (20 words, l.2822-2824).
§5.5.7.1 states the Lax case: Lax "does not offer a robust defense against CSRF as a
general category of attack" (14 words, l.1784-1786), while Lax does provide "reasonable
defense in depth against CSRF attacks that rely on unsafe HTTP methods (like POST)"
(15 words, l.1784-1786).

So a `SameSite` attribute on a session cookie is one defence layer, and its presence is
not evidence that a submit is CSRF-checked.

## Patterns the sheet documents (S103)

| pattern | what a client-side record could see [inference, see next section] | section |
|---|---|---|
| synchronizer token | a page- or server-issued token repeated in a request: "the server can include the token in the page" (9 words); "one of the most popular and recommended methods to mitigate CSRF" (16 words) | §synchronizer-token-pattern, §transmitting-csrf-tokens-in-synchronized-patterns |
| double-submit cookie | a cookie the client can read, echoed in a parameter or header: "The token cookie must be readable by the client, while the authentication cookie should remain HttpOnly" (16 words) | §signed-double-submit-cookie-recommended |
| custom request header | "A user-friendly defense that is particularly well suited for AJAX or API endpoints is the use of a custom request header" (21 words); "No token is needed for this approach" (7 words); framework names X-CSRF-Token, X-XSRF-Token, CSRF-Token, X-CSRFToken | §employing-custom-request-headers-for-ajaxapi |

This is an open list of the sheet's patterns, not its whole set: it also documents Fetch
Metadata (§fetch-metadata-headers), Origin/Referer verification
(§using-standard-headers-to-verify-origin) and user-interaction defences
(§user-interaction-based-csrf-defense). Those three leave no client-attestable mark — the
server performs the check — which is why the table above holds only the first three.

Two scope limits the sheet states:
- Under client-side CSRF, not as a general cookie caveat: "web browsers will include
  cookies in same-site request contexts initiated by JavaScript programs, circumventing
  the SameSite cookie policies" (18 words, §dealing-with-client-side-csrf-attacks-important).
- §Limitations of SameSite: "SameSite is useful as a defense-in-depth control but it does
  not replace a proper CSRF defense in most deployments" (19 words); "Lax only blocks
  unsafe methods" (5 words); "SameSite is scoped to the registrable domain, not the
  origin" (10 words); "Client-side CSRF is unaffected. SameSite operates on cross-site
  requests. It does not protect against client-side CSRF" (16 words).

## Why this binds here

The class stays open in this lane's own frontier text: "POST forms, CSRF-checked submits
untested by rule" (`corpus/README.md:43`, repeated at `:183`), and
`knowledge/multi-step-journey.md:287` lists third-party JS, redirects, POST forms and
CSRF-checked submits under the same anti-claim. No note in `corpus/knowledge/` owns
SameSite semantics — `grep -rli samesite corpus/knowledge/` returns only two fixture notes
that set `SameSite=Lax` on a cookie while leaving browser behaviour untested
(`stateful-fixture-evidence.md:763` U7; `state-changing-matrix-r9.md:374` U7). This note
does not lift the rule and claims no coverage: it supplies a vocabulary.

## Observability consequence for a journey receipt [inference — this lane, not either source]

A receipt that would classify a submit must record, per action: the request headers, the
request-time cookie names and flags (HttpOnly visible via
`Network.requestWillBeSentExtraInfo` plus the cookie store), and the body fields. Then:
1. X-CSRF-Token / X-XSRF-Token / CSRF-Token / X-CSRFToken present → custom-header shape.
2. a client-readable cookie value equal to a body or header value → double-submit shape.
3. a token field with neither of the above → synchronizer-token shape.
4. none of the three → unknown, not "unprotected": a server-side check (Origin/Referer,
   Fetch Metadata) leaves no client-side mark.

Classification is not testing: a shape shows the mechanism, never that the check rejects a
forged request; the header shape is also conditional on the server's CORS policy
(§custom-headers-and-cors).

## Not measured here

- No browser run, no HTTP request, no form submit, no POST; both documents were read only.
- No CSRF token, cookie or header was observed in any tabi receipt. Points 1-4 above are
  inference from S103's text and are labelled so.
- Real-site POST/redirect/CSRF classes stay untested by rule (`corpus/README.md:183`); no
  coverage credit is claimed — documented-upstream ground only.
- The sheet is revised on a rolling basis: only `last-modified 2026-10-25` and the digest
  were retained, so an earlier revision's headings were not examined.
<!-- PASTE END -->
<!-- SOURCES alignment: rows S102/S103 already exist in the working-tree corpus/SOURCES.md (uncommitted at baseline a89f1935; `git show HEAD:corpus/SOURCES.md | grep -cE '^\| S10[23] '` → 0) and are owned by another seat — this seat wrote none. This draft is consistent with them: S102's scope sentence covers the §5.5.7.1 Lax span cited above; S103's recheck is 90d there and here. One wording risk: S103's teaches cell says "names the JavaScript cookie hole SameSite leaves" — the sentence sits under client-side CSRF, so "names the JavaScript cookie caveat for client-side CSRF" is the narrower, verbatim-scoped form. Their used-by points at corpus/knowledge/csrf-defense-shape-boundary.md, which another seat created at 04:15 and was still rewriting while this seat read it (`stat -c '%s %y'` → 7195 B 04:15, 7648 B 04:19; 116 → 122 lines), so no byte-identical snapshot of it was achievable and this seat wrote none of it. Delta observed in the 122-line version: §2 still reads "enumerates the server-side defences as wire-observable shapes" with a closed three-row table — SrcDivergence must-cut 4 (the sheet also documents Fetch Metadata, Origin/Referer and user-interaction defences), and the file exceeds the ≤90-line budget in this ticket. This draft is the narrower alternative; if the L1 keeps the sibling file, that section needs the open-list wording below. -->
