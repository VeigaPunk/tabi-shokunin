# ScoutReverifyRfc — independent re-open of the C3 source (RFC 9110 / entry S107)

Seat: ScoutReverifyRfc · round 27, wave 1 (hyaku run 7) · read-only reporter
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Target: the C3 claim's re-grounded entry `corpus/knowledge/redirect-and-retry-after-semantics.md`
and its source bytes `.ufo/waves/round-27/assimilation/rfc9110.txt`.
Tools installed: none (no pacman/uv/npm/cargo transaction was needed; no tool was
installed or upgraded this run — the only tool used was the pre-installed
`curl`/`python3`/`git`).

---

## 1. Fresh fetch of the source — PASS (byte-identical)

Command (the one documented GET named by my item):

```
curl -sSL -o .ufo/waves/round-27/scratch/ScoutReverifyRfc/rfc9110.txt \
  -w 'http_code=%{http_code} size_download=%{size_download} url=%{url_effective}\n' \
  https://www.rfc-editor.org/rfc/rfc9110.txt
```

| fact | value |
|---|---|
| HTTP status | `200` |
| bytes downloaded | `502941` (`size_download=502941`) |
| effective URL | `https://www.rfc-editor.org/rfc/rfc9110.txt` |
| sha256 of fresh fetch | `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` |
| sha256 of committed bytes | `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` |
| byte count committed | `502941` |
| `cmp` of the two files | `IDENTICAL` (exit 0) |

Commands: `sha256sum`, `wc -c`, `cmp` (both paths as named above).

**Observation.** The fresh upstream bytes and the bytes committed at
`.ufo/waves/round-27/assimilation/rfc9110.txt` are the same file. The entry's
`source:` header claims `502941 bytes, sha256 21c1cdce…` — that is exactly
what the upstream server returned today. No drift, no transcription error in the
digest. The committed file is tracked (`git ls-files .ufo/waves/round-27/assimilation/`
lists `rfc9110.txt`), and the fetch left no residue in the lane.

Line-count for the record: `wc -l rfc9110.txt` → `10785`; `grep -c $'\r'` → `0`
(LF only, so line numbers are stable across the fetch and the commit).

---

## 2. Quote re-location — every cited quote verified present

Method: for each cited range I printed the raw RFC lines and, independently,
ran a whitespace-normalised containment test of the entry's quoted string
against exactly that line span (RFC body text is indented 3 spaces and note
blocks carry a `|  ` gutter plus a `*Note:*` marker, so the comparison strips
the gutter and marker before matching). **All 11 cited ranges matched.**

| # | cited range | quoted text (≤25 words) | located? | byte offset of quote |
|---|---|---|---|---|
| 1 | 7413 (HEAD) / 7413-7414 (worktree) | "The 303 (See Other) status code indicates that the server is redirecting the user agent to a different resource" | ✅ | 348218 |
| 2 | 7416-7418 | "can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" | ✅ | 348468 (spans a line break in the file; the quote is contiguous only after whitespace normalisation) |
| 3 | 7423 | "This status code is applicable to any HTTP method." | ✅ | 348792 |
| 4 | 7384-7387 (§15.4.2 note) | "For historical reasons, a user agent MAY change the request method from POST to GET for the subsequent request." | ✅ | 346948 |
| 5 | 7406-7409 (§15.4.3 note) | same wording, pointing at **307** | ✅ | 347957 |
| 6 | 7493-7495 (§15.4.8) | "the user agent MUST NOT change the request method if it performs an automatic redirection to that URI" | ✅ | 352198 |
| 7 | 7507-7523 (§15.4.9 body) | "The 308 (Permanent Redirect) status code indicates that the target resource has been assigned a new permanent URI" | ✅ | 352779 (start of the quoted sentence; the phrase "has been assigned a new permanent URI" itself is at 352858, line 7508) |
| 8 | 7306-7307 (§15.4 step 4) | "Change the request method according to the redirecting status code's semantics, if applicable." | ✅ | 342834 |
| 9 | 4805-4807 (§10.2.3) | "When sent with any 3xx (Redirection) response, Retry-After indicates the minimum time that the user agent is asked to wait" | ✅ | 227609 |
| 10 | 4803-4804 (§10.2.3) | "sent with a 503 (Service Unavailable) response, Retry-After indicates how long the service is expected to be unavailable" | ✅ | 227467 |
| 11 | 4809-4813 (§10.2.3) | "The Retry-After field value can be either an HTTP-date or a number of seconds to delay after receiving the response." | ✅ | 227781 |
| 12 | 7260-7264 (§15.4 historical note — **working-tree version only**, not in the committed tip) | "were later added to unambiguously indicate method-preserving redirects" | ✅ | 340823 (phrase begins line 7262) |

Anchor headings confirmed at their own offsets: `10.2.3. Retry-After` @227301 (line 4799),
`15.4.2. 301` @345929 (7365), `15.4.3. 302` @347354 (7393), `15.4.4. 303` @348191 (7411),
`15.4.8. 307` @352019 (7490), `15.4.9. 308` @352743 (7505).

**Observation — the 301/302 note pairing is exact and non-trivial.** The entry
says the §15.4.2 note points at **308** and the §15.4.3 note points at **307**.
Confirmed: line 7386 reads `this behavior is undesired, the 308 (Permanent Redirect) status`
and line 7408 reads `this behavior is undesired, the 307 (Temporary Redirect) status`.
The two notes are byte-identical except for that status number — a subtle detail
the entry gets right.

---

## 3. The INFERENCE label — VERIFIED

Requirement: show §15.4.9 contains **no** "MUST NOT change the request method"
clause, and that the entry calls the 308 reading an inference.

Grep window over the §15.4.9 body (`awk 'NR>=7505 && NR<=7531' … | grep 'MUST NOT change the request method'`)
→ **NO MATCH**. The whole section was printed (lines 7505-7531): it carries the
permanent-assignment paragraph, the `Location`/MAY-automatic-redirection
paragraph, the heuristically-cacheable sentence, and the *Note* pointing at
RFC7538 §4 — **no method-rewrite clause**. (For completeness: the word
"method" occurs exactly once inside 7505-7531, at line 7525, and it is
cacheability language — `unless otherwise indicated by the method definition or
explicit cache controls` — not a request-method clause.)

Stronger sweep: the phrase `MUST NOT change the request method` occurs exactly
**once** in the entire 502941-byte document, at line **7494** — 307's clause.
`awk 'NR>=7230 && NR<=7535 && /MUST NOT/'` over the whole §15.4 span returns
that single line. Document-wide `grep -c 'MUST NOT'` = 72, none of which is a
method-rewrite clause. So the entry's parenthetical "the only MUST-NOT in the
redirect sections is 307's at line 7494" is **true**.

Both the committed entry (HEAD `848c0321…`) and the working-tree version label
the 308 reading as an inference explicitly:

- HEAD: `**INFERENCE, not a located normative sentence**: the exact clause for 308 lives in RFC 7538, not in these bytes.`
- worktree: `**INFERENCE, not a located normative sentence**: this history note supports the preserving interpretation, while the status-specific clause remains an open re-anchor …`

**Observation.** RFC 9110 itself points at the same place the entry names:
line 10101-10103 says `Status code 308 (previously defined in [RFC7538]) has been added so that it's defined closer to status codes 301, 302, and 307`, and the §15.4.9 *Note* (lines 7528-7530) cites `[RFC7538]` §4. The entry's re-anchor target is the RFC the spec itself names. The working-tree revision additionally cites the §15.4 historical note (lines 7260-7264), whose text `were later added to unambiguously indicate method-preserving redirects` is located and verified in the bytes (offset 340823). That note is a stronger in-bytes anchor than HEAD's step-4-plus-notes argument, and the worktree uses it.

---

## 4. Findings

### F1 — HIGH (already fixed in the working tree, NOT in the committed tip): the committed entry mis-states the lane's own redirect history

The **committed** entry (HEAD `848c0321…`, commit `6ca3b89`) carries:

- `ground: multi-step journey execution semantics — the redirect rules the lane's driver has never asserted`
- `Why this matters: the lane's journey notes flag redirects as untested …`

Both are false against the lane's own corpus:

- `corpus/knowledge/state-changing-matrix-r9.md:252` — `3. **Redirect code shapes the replay**: 303 turns the follow-up into a GET (terminus replay-stable); 307 preserves POST + body (replay yields the same result and no state).`
- `corpus/knowledge/state-changing-matrix-r9.md:135` / `:146-147` — wire log `POST /submit HTTP/1.1" 303 -` followed by `GET /result HTTP/1.1" 200 -`.
- `corpus/knowledge/external-class-fixture-v2.md:487` — `R3 — 307 preserves method and body end-to-end. POST /m/307 → POST /m/echo at the wire`.
- `corpus/knowledge/packet-readiness-r7.md:64` — `**NARROWED at round 6.** Redirects-with-bodies are now measured on loopback: 302→303→307 chain … plus a POST arm (/m/307), all three layers reconciled`.

`multi-step-journey.md:287` does list "redirects" among untested *real-site* journeys, so the committed phrasing is defensible only if read as "real-site journeys", which it does not say — it says the driver "has never asserted" the rules, and the driver did assert them (303→GET and 307 preservation, both at the wire).

**Status:** the working tree already carries a corrected `ground:` line and a
corrected "Why this matters" paragraph (`d5878a83…` at 14:38 local; the
committed tip still has the false version). The correction is *uncommitted and
unlanded* — it is a working-tree modification to a tracked file, visible in
`git diff`. If the L1 lands only the committed tree, the false claim ships.

**Recommendation (not applied — read-only seat):** the `ground:`/`Why this
matters` correction must be committed, not left in the working tree.

### F2 — MEDIUM: committed entry's §15.4.4 citation under-states the quoted span

HEAD cites `(§15.4.4, line 7413)` for a two-line sentence. Line 7413 ends
mid-sentence (`…indicates that the server is`) and the quoted words continue on
**7414** (`redirecting the user agent to a different resource`). A reader who
opens only line 7413 will not find the quoted text. The working tree already
corrects this to `lines 7413-7414`. Uncommitted.

Registry row `corpus/SOURCES.md:121` still carries the same under-citation:
`§15.4.4 303 at line 7413 with GET-or-HEAD at 7416-7418`. It is a row-cell
summary rather than a verbatim quote, so the risk is lower, but the same
one-line-short range is there.

### F3 — LOW: the registry row's §15.4.9 range (7507-7523) includes a blank line

`7523` is empty; the last prose line of §15.4.9's body is 7522 (`hyperlink to
the new URI(s).`). The claim "§15.4.9 carries the permanent-assignment text,
lines 7507-7523" is true but the range's tail is a blank line. Cosmetic;
no quoted text depends on 7523.

### F4 — LOW (label check passes, but the framing is self-limiting in the committed tip)

HEAD's inference rests on step 4 + the 301/302 notes and states the clause
"lives in RFC 7538, not in these bytes". Both halves are literally true, but
RFC 9110 *does* contain an in-bytes sentence directly on point —
`were later added to unambiguously indicate method-preserving redirects`
(lines 7262-7263, offset 340823) — which the committed entry does not cite.
The working tree adds it. Note the entry's own label is correct in both
versions: the history note is explanatory prose, not a status-specific
normative clause, so **INFERENCE remains the right label**.

### F5 — INFORMATIONAL: no "Retry-After with 3xx" observation exists in the lane corpus

Grep over `corpus/` for `Retry-After` outside the new entry returns only the
429 instrument (`external-class-fixture-v2.md:419` — `429, Retry-After: 7`,
authored by the lane, "never acted on") and the approval table's `[U1]`
(`interaction-approval-table.md:129`). No 3xx-with-Retry-After was ever
measured. The entry claims no such thing, but a later round could mistake the
entry for a source of measured 3xx Retry-After behaviour. The entry's own
"Documented upstream, not measured here" banner and its Unknowns block cover
this correctly.

### F6 — INFORMATIONAL: the approval-table gap claim is accurate

`interaction-approval-table.md` contains no redirect vocabulary at all —
`grep -i 'redirect|303|307'` over it returns nothing (the only `Retry-After`
hits, lines 129 and 192, are the 429 cell). The entry's claim that "the
approval table has no vocabulary for a redirect that changes the method" is
**true**.

### F7 — INFORMATIONAL: the C3 counter re-run, and the census numbers

Frozen counter `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l`:

| REV | count |
|---|---|
| `6ca3b89` (the C3 commit) | **1** |
| `5198e28` (HEAD, the tip) | **1** |

Registry row count: `grep -cE '^\| S[0-9]+ \|' corpus/SOURCES.md` → **107**;
same command on `6ca3b89^` → 106, on `6ca3b89` → 107. The 106→107 census
transition reproduces. `git show 6ca3b89:corpus/SOURCES.md | grep -cE '^\| S107 \|'` → 1
(exactly one S107 row). The RFC-9110 URL appears in exactly one registry row
(`grep -n 'rfc-editor' corpus/SOURCES.md` → line 121 only), and
`grep -oE 'https?://[^ |]+' corpus/SOURCES.md | sort | uniq -d` does **not**
list the RFC-9110 URL — no duplicate-URL collision for S107.

---

## 5. Re-verification of the *other* C3 artifacts that reference the source bytes

Not in my item's scope (other seats own these), but recorded because they
carry the same line numbers and would inherit F2/F3:

- `corpus/SOURCES.md:121` (S107 anchor cell) — lists `§15.4.4 303 at line 7413`,
  `§15.4.2 and §15.4.3 notes at 7384-7387 and 7406-7409`,
  `§15.4.8 307 MUST-NOT at 7493-7495`, `§15.4.9 308 at 7507-7523`,
  `§15.4 rewrite step 4 at 7306-7307`, `§10.2.3 Retry-After at 4805-4813`.
  All of these ranges locate their content correctly (per §2 above), except the
  7413 vs 7413-7414 under-citation.
- `corpus/README.md:599` and `corpus/lessons/round-27.md:26` — quote the
  §10.2.3 anchor `4805-4807`; verified present.
- The lesson's quoted sentence `Retry-After indicates the minimum time that the
  user agent is asked to wait before issuing the redirected request.` is at
  lines 4805-4807. ✅

---

## 6. Observation: the tracked entry is dirty in the working tree

`git status --porcelain` shows two modified tracked files —
`corpus/knowledge/redirect-and-retry-after-semantics.md` and
`corpus/QUALITY.md` — plus untracked wave artifacts. The entry's working-tree
sha256 is `d5878a837a8f1c0a3257e357751e876940b18eb673ebab459b69cac39284c7d7`
vs the committed `848c032117d199904fed6da98d38a9fe55d8ca93562d890dbf1971511c532e22`.
The working-tree version is *better* on the substance (F1 and F2 are corrected
there). It is **not committed**, so the committed tip still carries the
overclaim. The diff shown above also contains a transient editing artifact —
at one point the 303 bullet ended with a duplicated `method (line 7423). /
(line 7423).` — which is resolved in the current working tree
(`grep -c '(line 7423)'` → 1). No action taken by me; flagged for the L1.

---

## 7. Summary

- **Fetch: PASS.** HTTP 200, 502941 bytes, sha256 `21c1cdce…`, byte-identical
  (`cmp` exit 0) to the committed `.ufo/waves/round-27/assimilation/rfc9110.txt`.
- **Quote re-location: PASS.** All 11 cited ranges in the admitted entry
  contain their quoted text; offsets recorded above. No quote is absent.
- **INFERENCE label: PASS.** §15.4.9 (7505-7531) contains no
  "MUST NOT change the request method" clause; the phrase occurs exactly once
  in the whole document, at 7494 (307). The entry labels the 308 reading as an
  inference in both versions.
- **One HIGH finding (F1)** in the *committed* tip: the entry claims the lane's
  driver "has never asserted" redirect rules and that the journey notes flag
  redirects as untested; the lane's own r9 note (`:252`, wire log `:135`/`:146`)
  and the round-6 fixture (`:487`) record measured 303→GET and 307
  method/body preservation. Corrected in the working tree, **not committed**.
- **One MEDIUM finding (F2)**: committed entry cites `line 7413` for a
  sentence that ends on 7414. Corrected in the working tree, not committed.
- **Two LOW findings (F3, F4)** and three informational observations.
- Counter re-run: `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l`
  = **1** at both `6ca3b89` and HEAD `5198e28`; registry rows 106 → 107.

No tracked file was edited by this seat. The only file written is this report.

---

# ADDENDUM — second independent pass over the same item

A concurrent instance of this seat (`ScoutReverifyRfc`) wrote the body of this
file at 14:45:16 local. I re-ran the whole item independently rather than
overwrite it. **Everything below is a second, independent re-verification**;
where I disagree with the body above I say so explicitly.

## A1. Independent re-run of the body above — every headline claim CONFIRMED

| body claim | my independent command | my result |
|---|---|---|
| fetch: 200 / 502941 B / sha256 `21c1cdce…` | `curl -sSL -w 'http_status=%{http_code} size_download=%{size_download}'` | 200 / 502941 / `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` — matches |
| committed bytes identical to fresh | `cmp` + `git cat-file blob HEAD:…/rfc9110.txt \| sha256sum` | `cmp` → IDENTICAL BYTES; HEAD blob sha256 = same `21c1cdce…`, size 502941 — matches |
| all 11 cited ranges contain their quote | whitespace-normalised containment test per range | all 11 hit — matches |
| `MUST NOT change the request method` occurs exactly once document-wide | `grep -n 'MUST NOT change the request method'` | exactly one hit, **line 7494** — matches |
| document-wide `grep -c 'MUST NOT'` = 72 | same | 72 — matches |
| §15.4.9 window 7505–7531 has no method clause | `awk 'NR>=7505 && NR<=7531 && /MUST/'` | no output — matches |
| the 15 byte offsets in the §2 table land on the quoted text | Python `d[off:off+60]` at each offset | all 15 land exactly on the quoted string's start — matches |
| F1 (HIGH): committed `ground:` contradicts the lane's own corpus | `grep` of `state-changing-matrix-r9.md`, `external-class-fixture-v2.md`, `packet-readiness-r7.md`, `multi-step-journey.md` | confirmed — r9:135/144/146 are `POST /submit HTTP/1.1" 303 -` wire lines; r9:252 reads "303 turns the follow-up into a GET … 307 preserves POST + body"; fixture-v2:487 "**R3 — 307 preserves method and body end-to-end.**"; r7:64 "Redirects-with-bodies are now measured on loopback"; journey:287 lists redirects under *real-site* journeys only. The committed `ground:` ("has never asserted") and "journey notes flag redirects as untested" are false as written. — matches |
| F3 (LOW): 7523 is a blank line | `awk 'NR>=7518 && NR<=7524'` | 7522 is the last prose line, 7523 empty — matches |

Line-numbering sanity: the file has **0 CR bytes, 10785 LF bytes**
(`d.count(b'\r')` → 0), so `grep -n`, `awk` and Python byte-splitting all agree on
line identity. One self-correction for the record: an early scripted sweep of
mine reported the 307 clause at 7495; `grep -n` and a byte-level split both say
**7494**. That 7495 was an off-by-one in my own enumeration, not a data
discrepancy. The body above has 7494, which is right.

## A2. CORRECTION — the "301/302 notes point at 307/308" inversion is NOT a finding

My first draft of this seat's report raised a MEDIUM/LOW finding that the
committed entry's phrase "the 301/302 notes point at 307/308 as the alternatives"
(line 34) inverts the mapping (301's note → 308, 302's note → 307). **I withdraw
that finding as a false positive.** The phrase is a *set* reference — {301,302}
notes point at {307,308} — and the entry's first bullet states the pairing
explicitly and correctly: "(§15.4.2 note, lines 7384-7387; identical note in
§15.4.3 at lines 7406-7409, pointing at 307)" with the 308-pointing note quoted
in full. The body above's §2 observation ("The entry says the §15.4.2 note
points at 308 and the §15.4.3 note points at 307. Confirmed") is the correct
reading. No edit to the entry is warranted on this ground.

## A3. NEW FINDING (F8, MEDIUM) — the "clause for 308 lives in RFC 7538" pointer is likely wrong, and this can be argued from the in-hand bytes alone

The committed entry states: "**INFERENCE, not a located normative sentence**: the
exact clause for 308 lives in RFC 7538, not in these bytes." The body above
(A4 in its §3, and F4) treats that pointer as *corroborated* by RFC 9110's own
references to RFC 7538. **I read it the other way**, on evidence inside the same
502941 bytes:

```
10101:   Status code 308 (previously defined in [RFC7538]) has been added so
10102:   that it's defined closer to status codes 301, 302, and 307.
10103:   (Section 15.4.9)

10158: B.7.  Changes from RFC 7538
10160:   None.
```

and the obsoleted-specifications table:

```
  501:   | HTTP Status Code 308 (Permanent Redirect)  | [RFC7538] | B.7 |
```

**The argument.** RFC 9110 folds RFC 7538 into itself: §1.4 lists RFC 7538 among
the specifications obsoleted by RFC 9110, with "B.7" as the changes section, and
**B.7 says "Changes from RFC 7538: None."** Meanwhile §15.4.9 is RFC 7538's 308
definition *relocated* (changelog 10101–10103), and §15.4.9's own trailing note
points only at RFC 7538 §4 for *deployment considerations* (7528–7530) — i.e. at
the non-normative part of the other document, not at a semantic clause.

If RFC 7538 had contained a status-specific MUST NOT-change-the-request-method
clause for 308, then "Changes from RFC 7538: None" plus a relocated copy in
§15.4.9 means that clause **would be present in §15.4.9**. It is not — §15.4.9
carries no method clause of any kind (verified: `awk 'NR>=7505 && NR<=7531 &&
/MUST/'` → empty; the section's only normatives are two SHOULDs and two MAYs).

**Therefore the most probable reading is the reverse of the entry's pointer: RFC
7538 has no such clause either** — 308's method-preservation there, like
301/302's rewrite permission, sat in a *Note*, which is why RFC 9110 could
reproduce the definition unchanged (B.7 = None) while the MUST NOT clause exists
only for 307 (§15.4.8, 7493–7495).

**Consequence for the entry.** The instruction "re-anchor against RFC 7538 if a
claim needs the direct sentence" sends a later round after a sentence that
plausibly does not exist — a re-anchor that would come back empty. The
better-supported in-bytes anchor is the §15.4 history note at 7260–7264
("307 (Temporary Redirect) and 308 (Permanent Redirect) [RFC7538] were later
added to unambiguously indicate method-preserving redirects"), which the
working-tree revision already cites. That is explanatory prose rather than a
status-specific normative clause, so **INFERENCE remains the right label** — the
label is not in question; the *pointer* is.

**Status of this finding: [INFERENCE], not observation.** The decisive check is
to fetch RFC 7538 and grep its §3 for a request-method clause. I did **not**
perform that fetch: my item authorizes exactly one documented GET and names only
`https://www.rfc-editor.org/rfc/rfc9110.txt`, and a second fetch of another
document would exceed that authorization. The B.7 argument above is derived
entirely from bytes already in hand; the confirmation requires a round that is
authorized to fetch RFC 7538. Flagged for the L1 as the one genuinely open
question in the C3 source.

## A4. STATE DRIFT — the HEAD referenced in the body above has moved

The body above cites HEAD as `5198e28`. HEAD has since advanced:

```
$ git rev-parse --short HEAD
5ed6484          # "round-27: permit empty missing-receipt selftest fixture commit"
$ git log --oneline -2
5ed6484 round-27: permit empty missing-receipt selftest fixture commit
5198e28 round-27: classify missing S106 receipt as could-not-evaluate
```

Re-running the frozen C3 counter at the **new** tip:

```
$ git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l
1
$ git grep -lE '^source: S107 ' 6ca3b89 -- corpus/knowledge | wc -l
1
$ git show HEAD:corpus/SOURCES.md | grep -cE '^\| S[0-9]+ \|'
107
$ git cat-file blob HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md | sha256sum
848c032117d199904fed6da98d38a9fe55d8ca93562d890dbf1971511c532e22
```

The C3 commit `6ca3b89` is still the only commit touching the entry, the entry
blob at the current tip is still `848c0321…` (the version carrying F1 and F2),
and the counter is still **1** at both revisions. Nothing about C3 moved.

Working-tree state at the time of this addendum (unchanged from the body
above): `corpus/knowledge/redirect-and-retry-after-semantics.md` is modified
(worktree sha256 `d5878a837a8f1c0a3257e357751e876940b18eb673ebab459b69cac39284c7d7`
vs committed `848c0321…`), i.e. the F1/F2 corrections and the 7260–7264 anchor
exist in the worktree but are **not landed**. `corpus/SOURCES.md:121` also still
carries the one-line-short `§15.4.4 303 at line 7413` range. Both corrections
must be committed, not left in the worktree.

## A5. Net effect on the C3 claim

The claim's **source re-ground is sound** and I confirm it on independent
execution: the fetch is byte-identical to the committed blob and to live
upstream; all cited quote locations resolve correctly; the INFERENCE label is
present and the §15.4.9 clause-absence it asserts is real. The counter is 1 at
both the C3 commit and the current tip, and the registry census is 106 → 107.

The open items are **not** about the source: they are (i) F1 — the committed
entry's `ground:`/`Why this matters` sentences overclaim about the lane's own
redirect history, and (ii) F8 — the RFC 7538 re-anchor pointer, which the
in-hand B.7 = "None" evidence makes doubtful. Both live in the entry's
provenance narrative, not in its quotes.

### Commands for this addendum

```bash
git rev-parse --short HEAD; git log --oneline -2
git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l
git grep -lE '^source: S107 ' 6ca3b89 -- corpus/knowledge | wc -l
git show HEAD:corpus/SOURCES.md | grep -cE '^\| S[0-9]+ \|'
git cat-file blob HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md | sha256sum
sha256sum corpus/knowledge/redirect-and-retry-after-semantics.md
awk 'NR>=10155 && NR<=10162{printf "%d:%s\n",NR,$0}' rfc9110.txt   # B.7
awk 'NR>=495 && NR<=505{printf "%d:%s\n",NR,$0}' rfc9110.txt      # obsoleted-specs table
awk 'NR>=7505 && NR<=7531 && /MUST/{printf "%d:%s\n",NR,$0}' rfc9110.txt   # empty
python3 -c "d=open('rfc9110.txt','rb').read(); print(d.count(b'\r'), d.count(b'\n'))"
```

No tools were installed or upgraded for this pass. No tracked file was edited;
no git write was run. The only file written remains this report.
