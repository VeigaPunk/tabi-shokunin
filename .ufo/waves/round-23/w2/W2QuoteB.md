# W2QuoteB — S103 reopened, every quoted span audited (tabi round 23, wave 2)

Verdict: **PASS-WITH-FINDINGS** — all 7 source spans in the entry are verbatim, ≤25 words, and under the heading the entry names; the sheet's list is demonstrably OPEN (6 defence classes the entry never tabulates); the entry's byte identity for S103 reproduces exactly. Two medium defects sit outside the quote layer (§2's closed "three", and the committed §6 false negative about this lane's own evidence), four low.

## Bytes read (`L=/home/vgpnk/Projects/shokunin/tabi-shokunin`, `S=$L/.ufo/waves/round-23/scratch/W2QuoteB`)
- One GET (the item's single authorised URL), run in `$S`: `curl -fsSL -D headers.txt -o s103.html https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html` → `157809` bytes, sha256 `6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312`, `last-modified: Sun, 25 Oct 2026 06:56:47 GMT`. Entry line 4 and `corpus/SOURCES.md:117` state the same three values.
- S102 was **not** re-fetched (one GET only): verified against `$L/.ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt`, `146976` bytes, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf` — the identity the entry itself claims.
- Entry under review exists twice: committed `03c1b4d` = 8135 B sha256 `2bbedf0b77fd6f81c623c9de2cb6f2ec864d3d2d971d1883d9b6ca96b3d5b55f`; worktree = 9135 B sha256 `2915dfc3f0f7c2764e66cef667ab2dd63e5bf55ce8e940d2a11c2629ebde0ded`. `HEAD` moved from `a89f193` to `03c1b4d` while this seat ran.

## Quote verdict — `node $S/probe.mjs 03c1b4d`
| span (entry §) | words | located | enclosing heading |
|---|---|---|---|
| `"SameSite" cookies offer a robust defense … supported by the client …` §1 | 21 | S102 line 2815 | §8.8.1 (heading line 2813; body 2815–2828 — entry's range exact) |
| `It is, however, prudent … not the extent of a site's defense against CSRF` §1 | 19 | S102 line 2816 | §8.8.1 |
| `Developers are strongly encouraged … "safe" HTTP methods are idempotent, etc)` §1 | 20 | S102 line 2822 | §8.8.1 |
| `A user-friendly defense … use of a custom request header` §2 | 21 | VERBATIM | `Employing Custom Request Headers for AJAX/API` |
| `No token is needed for this approach.` §2 | 7 | VERBATIM, immediately after the former | `Employing Custom Request Headers for AJAX/API` |
| `web browsers will include cookies … circumventing the SameSite cookie policies` §3 | 18 | VERBATIM | `Dealing with Client-Side CSRF Attacks (IMPORTANT)` |
| `Client-side CSRF is unaffected. … It does not protect against client-side CSRF` §3 | 16 | VERBATIM | `Limitations of SameSite` |

Cap: `MAX_QUOTE_WORDS = 25`, `MIN_QUOTE_WORDS = 4` (`$L/scripts/check-adjacency.mjs:184-186`); every span is 7–21 words, ≥20 non-space chars. Both entry versions carry the same spans (probe prints `== committed ==` and `== worktree ==`).

## Checks with commands (cwd `$L`)
- `grep -c '<h[1-4]' $S/s103.html` → `34`; `grep -c '<h[1-6]' $S/s103.html` → `39`; `grep -ci 'common csrf weaknesses and protection mechanisms' $S/s103.html` → `0` — errata E2's "0 headings" reproduces.
- `grep -c 'offers a robust defense'` on both source bytes → `0`; the draft says `offer` at lines 1786 and 2815 — E1 reproduces.
- OPEN claim, per-term absence from the entry: `for t in 'Disallowing simple' 'simple content type' 'Host Prefix' '__Host-' 'Login Form' 'Built-In Or Existing'; do grep -ciF "$t" $L/corpus/knowledge/csrf-defense-shape-boundary.md; done` → `0` for all six; the sheet carries each as a heading (`Disallowing simple requests` h2, `Disallowing simple content types` h3, `Using Cookies with Host Prefixes to Identify Origins` h4, `Possible CSRF Vulnerabilities in Login Forms` h2, `Built-In Or Existing CSRF Implementations` h3).
- C2 arms: `git grep -lE '^source: S10[23] ' a89f193 -- corpus/knowledge | wc -l` → `0`; same at `03c1b4d` → `1`. E3's arithmetic on the staged bytes (28 words > 25) reproduces at `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md:24-27`.

## Findings
1. **medium** — §2 closes an enumeration the sheet leaves open, in the same paragraph that calls it open: "Three of them leave something a capture can hold", then §4.1 admits only "one of the three above, or `none-observed`". Fetch Metadata is a *request*-header capture: the sheet says "Fetch Metadata request headers provide extra information about the context from which an HTTP request was made" and "The Fetch Metadata request headers are: Sec-Fetch-Site — the primary signal for CSRF protection" (`grep -c 'Sec-Fetch-Site' $S/s103.html` → `12`). A receipt observing a Sec-Fetch-gated submit therefore has no slot and must record `none-observed`, which §4.4 forbids as a conclusion.
2. **medium** — committed §6 "Unmeasured" bullet is false about this lane's own retained artefact: it says the round 6–8 loopback POST "had no token field". `corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/after-abort.domsnapshot.json` holds `"INPUT","type","hidden","token","name","value","c9e4cf41a1aa0a66"`, and `ledger-after.json` event 9 is `{"kind":"submit-refused","reason":"token-consumed","bodyBytes":53}` — a token field was present and presented. The worktree revision repairs exactly this sentence, so the landed rev `03c1b4d` is the defective one. (`grep -o '.\{60\}token.\{60\}' $L/corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/after-abort.domsnapshot.json`)
3. **low** — §3's Limitations quote stops mid-sentence with no ellipsis, unlike the entry's own §1 practice: source is `…does not protect against client-side CSRF (see the earlier section on Dealing with Client-Side CSRF Attacks) where malicious input causes same-origin JavaScript…`, entry ends `…client-side CSRF"`. Still a verbatim substring (passes the gate), but presents a truncated sentence as complete while S102's quote marks its cut with `…`. (`grep -o 'Client-side CSRF is unaffected.</strong>[^<]*<code>SameSite</code>[^<]*' $S/s103.html`)
4. **low** — `claims.json` C2.failureCapable asserts "every quoted span is located … (2/2 for S102, 2/2 for S103)"; the entry carries 3 S102 spans and 4 S103 spans (probe table). A gate built to that count leaves one S102 and two S103 spans unchecked while reporting 2/2.
5. **low** — worktree §6 cites `facts.json` `tokenShape` as what records the token's appearance in the POST; `tokenShape` is `{"len": 16, "cls": "lower-hex"}` — shape only. The co-occurrence is recorded by `ledger-after.json` seq 9; the value `c9e4cf41a1aa0a66` occurs in page snapshots only (`grep -rl c9e4cf41a1aa0a66 $L/corpus/evidence/w9-tabi-b91` → 4 DOM/shape files, no request artefact), so "appeared in the captured POST" rests on a server-side refusal, not a captured body.
6. **low** — E2's denominator "0 headings of 34 match" is the `<h1-4>` count; the page has 39 heading elements (5 are `<h5>`). The zero holds for the whole file, so the claim survives, but 34 is not reproducible without guessing the level filter.
7. **info** — the front-matter `recheck:` line carries one command and it checks S102 only (`grep -c 'not the extent of'`); S103's declared `90d` recheck has no command. `scripts/check-sources.mjs:322` validates only the SOURCES cell's format (`on-release`, `90d`), so nothing gate-fails, but S103's freshness is unauditable as written.

## Residual risk
- S102 verdicts rest on a sibling's cached copy, bound by digest to the entry's own claimed identity; a fresh GET was not spent and is the only way to make that independent.
- "Verbatim" is asserted on tag-stripped, typography-normalised text (headings, `<code>`, `<strong>` insert markup at every span boundary); it is character-exact at that level, not at raw-HTML byte level.
- The sheet is a rolling revision: every S103 verdict binds `last-modified 2026-10-25T06:56:47Z` and nothing later.
- Lane gates were not executed (contract); `MAX_QUOTE_WORDS` was read, not run. The entry is mid-edit in the worktree — any receipt must pin the rev it graded (this one graded `03c1b4d` and the 9135-B worktree snapshot).
