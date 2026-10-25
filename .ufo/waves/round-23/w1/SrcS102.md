# SrcS102 — S145 re-open (RFC 6265bis draft-13 §8.8.1)

**Verdict: REFUSE AS WRITTEN.** Two of three quoted spans are verbatim; the
load-bearing one ("offers a robust defense against CSRF attack") **does not
exist in the document**. The draft says *"SameSite" cookies **offer*** —
plural verb, plural subject. The entry quotes a singular rewrite inside
quotation marks. Absence is a refusal, not a paraphrase licence: the entry
may be admitted only after the quoted span is corrected to the source form
(or de-quoted). Quote 2 also lowercases a sentence-initial capital.

## Fetch

- `curl -sS -o rfc6265bis-13.txt -w 'HTTP_STATUS=%{http_code}\nBYTES=%{size_download}\n' https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`
  → `HTTP_STATUS=200` `BYTES=146976` (one GET, read-only, no other network use).
- `sha256sum rfc6265bis-13.txt` → `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`
- `wc -c` → `146976` (matches `size_download`; not truncated). 3696 lines.
- Identity: head lines 5–10 → `S. Bingler, Ed. / M. West, Ed. / J. Wilander, Ed.`,
  `Expires: 18 May 2024`, `15 November 2023` — the intended draft-13 revision, not a later one.
- `grep -n -E '^\s*[0-9.]+\.\s+Defense in depth'` → 164 (ToC), **2813** (§8.8.1 heading, body page 51). Single such heading.

## Located spans (scratch copy, line numbers exact)

Section body = lines 2815–2828.

1. **`offer a robust defense against CSRF attack`** — line **2815**:
   `"SameSite" cookies offer a robust defense against CSRF attack when`
   (continues l.2816 `deployed in strict mode, and when supported by the client.`)
   → **PASS verbatim, plural form.** `grep -c -F 'offer a robust defense against CSRF attack' flat.txt` → `1`.
2. **`offers a robust defense against CSRF attack`** (what the entry quotes) —
   → **ABSENT.** `grep -n -i 'offers a robust defense' rfc6265bis-13.txt` → exit 1, **0 hits in all 3696 lines**;
   `grep -c -F 'offers a robust defense against CSRF attack' flat.txt` → `0`.
3. **`It is, however, prudent to ensure that this designation is not the extent of a site's defense against CSRF`**
   — lines **2816–2818** (`... It is,` / `however, prudent to ensure that this designation is not the extent of` / `a site's defense against CSRF, as same-site navigations and`)
   → **PASS verbatim, 21 words**, after whitespace-normalising the wraps,
   **except** the entry quotes it as lowercase `"it is, ..."`: `grep -c -F 'it is, however, prudent' flat.txt` → `0`;
   `grep -c -F 'It is, however, prudent' flat.txt` → `1`. Case-fix or mark as silently lowercased.
4. **`strongly encouraged to deploy the usual server-side defenses (CSRF tokens, ensuring that "safe" HTTP methods are idempotent, etc)`**
   — lines **2822–2824** (`Developers are strongly encouraged to deploy the usual server-side` / `defenses (CSRF tokens, ensuring that "safe" HTTP methods are` / `idempotent, etc) to mitigate the risk more fully.`)
   → **PASS verbatim, 20 words**, across two wraps (`are`+`idempotent`).
   `grep -c -F '<span>' flat.txt` → `1`.

## Verbatim status of the entry's paraphrases

- `offers a robust defense` — **NOT verbatim** (only `offer`, l.2815). Refusal.
- `not the extent of a site's defense` — **verbatim** (l.2817–2818), case-adjusted only.
- `strongly encouraged to deploy the usual server-side defenses` — **verbatim** (l.2822–2823).

## Additional fidelity defects (outside quote marks, no refusal but material)

- Entry framing "SameSite **in strict mode**" silently drops the source's second
  condition: l.2816 `and when supported by the client` — a real scope limit on the claim.
- Entry attributes "defense-in-depth" to §8.8.1; the phrase `defense in depth` occurs in
  body text only at **l.1784** (§8.6 Lax) and **l.2833** (§8.8.2), *not* in 2815–2828.
  It is derived from the §8.8.1 **heading** (l.2813). Sound, but label it title-derived.
- Entry omits the source's own caveat (l.2818–2820: `as same-site navigations and submissions can certainly be executed in conjunction with other attack vectors such as cross-site scripting`) and l.2826–2828 (`[app-isolation]`). Not required for ≤25-word quoting; note the omission so the lane does not read the limit as narrower than stated.

## Observations vs inference vs unknown

- **Observed:** HTTP status/bytes/hash; heading line; the four span greps above; the document identity lines.
- **Inference:** the singular `offers` is a subject–verb agreement edit made when the
  entry compressed the source's "cookies offer … when deployed in strict mode" into
  "SameSite in strict mode offers …" — i.e. the compression produced the quote change.
- **Unknown / not checked:** S146 (OWASP sheet) — outside this ticket; its two quotes
  ("custom request header…", "circumventing the SameSite cookie policies") are unverified here.
  The draft's own `[app-isolation]` reference was not fetched (not requested).
- **Not a defect:** S145's cited URL, section number, and revision all resolve correctly.

## Tooling

No installs or upgrades. `curl`, `awk`, `grep`, `sha256sum`, `tr` from base system. No git/jj
writes; no writes outside this report and `.ufo/waves/round-23/scratch/SrcS102/`.
