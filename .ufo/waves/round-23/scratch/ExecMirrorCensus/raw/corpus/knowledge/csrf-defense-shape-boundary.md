
# What SameSite does and does not defend, and how a defense is observable

source: S145 — https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt — §8.8.1 ("Defense in depth") — draft-13 fetched 2026-10-23
source: S146 — https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html — §"Common CSRF weaknesses and protection mechanisms", §"Limitations of SameSite" — fetched 2026-10-23
verified-at: 2026-10-23
recheck: 180d for both (the draft revision moves; the OWASP sheet is revised on a rolling basis) (not run in this round)
ground: multi-step journey execution semantics — the CSRF boundary a submit receipt can actually observe

**Documented upstream, not measured here.** Wave 2 supplied the cookie
mechanics (default enforcement, Strict vs Lax, and the cross-site
top-level-navigation rule). This round supplies the *limit* and the
*observability*, which is what a journey receipt needs.

The limit, from the draft itself: SameSite in strict mode "offers a robust
defense against CSRF attack", but "it is, however, prudent to ensure that this
designation is not the extent of a site's defense against CSRF" — developers
are "strongly encouraged to deploy the usual server-side defenses (CSRF tokens,
ensuring that \"safe\" HTTP methods are idempotent, etc)". SameSite is
defense-in-depth, never the whole defense.

The observability, from the OWASP sheet: the defense a site uses leaves a
**shape** on the wire, and the shapes are enumerable — a synchronizer token, a
double-submit cookie, or a **custom request header** ("A user-friendly defense
that is particularly well suited for AJAX or API endpoints is the use of a
custom request header. No token is needed for this approach"). The sheet also
names the hole in the cookie defense: "web browsers will include cookies in
same-site request contexts initiated by JavaScript programs, circumventing the
SameSite cookie policies".

Why this matters: the lane's rule marks CSRF-checked submits untested by rule.
This entry gives the lane a way to *classify* a submit it does observe — by
the defense's shape (a token field, a paired cookie, or a non-simple header) —
and gives it the reason not to treat a SameSite cookie as a CSRF defense on its
own. It remains a classification vocabulary, not a receipt.

---
