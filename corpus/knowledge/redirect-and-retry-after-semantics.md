# Redirect and Retry-After semantics for a journey driver

source: S107 — https://www.rfc-editor.org/rfc/rfc9110.txt — §15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3 — RFC 9110, June 2022; fresh plain-text fetch this round (2026-10-25, 502941 bytes, sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a)
verified-at: 2026-10-25
recheck: 730d — standards-track RFCs change by errata only; re-read §15.4 and §10.2.3
ground: documented-upstream redirect semantics — extends existing loopback 303/307 observations with RFC 9110's 301/302 POST→GET possibility and Retry-After on 3xx

**Documented upstream, not measured here.** RFC 9110 fixes the redirect
semantics a journey driver will meet. Every sentence below is anchored in the
bytes fetched this round; where the spec's wording is weaker than common
folklore the entry says so.

- **303 See Other** — "The 303 (See Other) status code indicates that the server
  is redirecting the user agent to a different resource" (§15.4.4, lines
  7413-7414); the user agent "can perform a retrieval request targeting that URI
  (a GET or HEAD request if using HTTP)" (lines 7416-7418). Applicable to any HTTP
  method (line 7423).

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
  (step 4, lines 7306-7307). RFC 9110's historical note says 307 and 308 were
  added "to unambiguously indicate method-preserving redirects" (§15.4, lines
  7260-7264), but §15.4.9 does not restate that as a normative MUST-NOT.
  **INFERENCE, not a located normative sentence**: this history note supports
  the preserving interpretation, while the status-specific clause remains an
  open re-anchor for any claim that needs it.
- **`Retry-After` may accompany a redirect** — "When sent with any 3xx
  (Redirection) response, Retry-After indicates the minimum time that the user
  agent is asked to wait before issuing the redirected request." (§10.2.3,
  lines 4805-4807); with 503 it bounds the service outage (lines 4803-4804).
  Value = HTTP-date or delay-seconds (lines 4809-4813).

Why this matters: the lane has measured loopback redirects, including 303→GET
and 307 method/body preservation, but real-site journeys remain untested by
rule. Its existing observations do not include the RFC's 301/302 POST→GET
possibility or Retry-After with a 3xx, and the approval table has no vocabulary
for a redirect that changes method. This entry adds those documented-upstream
distinctions without claiming new runtime behavior.

**Unknowns (kept separate):** whether the shipped driver/browser chain actually
honors these semantics on a live redirect — no runtime capture this round; the
entry is spec-ground only. The 308 method-preservation is an inference in this
document, recorded for re-anchoring against RFC 7538.
