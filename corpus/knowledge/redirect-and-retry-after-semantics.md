# Redirect and Retry-After semantics for a journey driver

source: S107 — https://www.rfc-editor.org/rfc/rfc9110.txt — §15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3 — RFC 9110, June 2022; fresh plain-text fetch this round (2026-10-25, 502941 bytes, sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a)
verified-at: 2026-10-25
recheck: 730d — standards-track RFCs change by errata only; re-read §15.4 and §10.2.3
ground: multi-step journey execution semantics — the redirect rules the lane's driver has never asserted

**Documented upstream, not measured here.** RFC 9110 fixes the redirect
semantics a journey driver will meet. Every sentence below is anchored in the
bytes fetched this round; where the spec's wording is weaker than common
folklore the entry says so.

- **303 See Other** — "The 303 (See Other) status code indicates that the server
  is redirecting the user agent to a different resource" (§15.4.4, line 7413);
  the user agent "can perform a retrieval request targeting that URI (a GET or
  HEAD request if using HTTP)" (lines 7416-7418). Applicable to any HTTP method
  (line 7423).
- **301 / 302 may rewrite the method** — the normative body of §15.4.2/§15.4.3
  describes the new-URI assignment; the method rewrite lives in a *Note*: "For
  historical reasons, a user agent MAY change the request method from POST to
  GET for the subsequent request. If this behavior is undesired, the 308
  (Permanent Redirect) status code can be used instead." (§15.4.2 note, lines
  7384-7387; identical note in §15.4.3 at lines 7406-7409, pointing at 307). A
  journey that asserts "the form was POSTed" can therefore be silently converted
  by a 301/302.
- **307 MUST NOT change the request method** — "the user agent MUST NOT change
  the request method if it performs an automatic redirection to that URI"
  (§15.4.8, lines 7493-7495).
- **308** — its own §15.4.9 body does NOT repeat the MUST-NOT clause (located:
  §15.4.9 carries the permanent-assignment text, lines 7507-7523; the only
  MUST-NOT in the redirect sections is 307's at line 7494). The preserving
  reading is *inferred*: the §15.4 rewrite procedure says "Change the request
  method according to the redirecting status code's semantics, if applicable"
  (step 4, lines 7306-7307), and the 301/302 notes point at 307/308 as the
  alternatives "if this behavior is undesired" (lines 7386-7387, 7408-7409) —
  which is only coherent if 307/308 do not permit the rewrite. **INFERENCE, not
  a located normative sentence**: the exact clause for 308 lives in RFC 7538,
  not in these bytes.
- **`Retry-After` may accompany a redirect** — "When sent with any 3xx
  (Redirection) response, Retry-After indicates the minimum time that the user
  agent is asked to wait before issuing the redirected request." (§10.2.3,
  lines 4805-4807); with 503 it bounds the service outage (lines 4803-4804).
  Value = HTTP-date or delay-seconds (lines 4809-4813).

Why this matters: the lane's journey notes flag redirects as untested and its
approval table has no vocabulary for a redirect that changes the method. This
entry supplies the classification vocabulary — a measured redirect can be
classified (method rewritten or preserved, wait instructed or not) instead of
recorded as "a redirect happened" — and names the 308-inference explicitly so a
later round can re-anchor it in RFC 7538 if a claim needs the direct sentence.

**Unknowns (kept separate):** whether the shipped driver/browser chain actually
honors these semantics on a live redirect — no runtime capture this round; the
entry is spec-ground only. The 308 method-preservation is an inference in this
document, recorded for re-anchoring against RFC 7538.
