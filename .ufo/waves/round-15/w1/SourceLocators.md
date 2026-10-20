# SourceLocators — S023 §Locate by role; accessibility-audit implication rejected

- Seat: `TabiR15.SourceLocators` (scout, leaf). Wave `tabi-round-15-w1`. Date 2026-10-20.
- Target: open https://playwright.dev/docs/locators §Locate by role and reject the accessibility-audit implication. Return anchors and defects to TabiR15.
- Mode: read-only. I ran no gate, counter, test, suite or browser, and edited no source. My only write is this report.
- Revision: rewritten after TabiR15's correction on three points: the word count, the tree-projection wording, and "No tests." Where the earlier draft of this file or my earlier IRC to TabiR15 says something different, it is retracted (see D1).
- This is an author-side report, not non-author verification. Tools installed or updated: none.

## Axes

- **Calibration:** quotes are faithful. Every excerpt below was found in the served HTML, and its token count was measured, not estimated.
- **Freshness:** S023 was re-fetched and hashed in this session.
- **Adjacency:** audit and conformance claims stay outside this lane's evidence ladder.
- **Operability:** read-only fetch and grep only. I ran each L1 command in §7 once; the output shown is what I observed.

## 1. Source access — measured 2026-10-20 08:09:35 GMT (server `date`)

| Item | Observed |
|---|---|
| Method | `curl -sL` piped to `sha256sum` and `wc -c`; `curl -sSL -D - -o /dev/null` for headers; a Python `urllib` GET as an independent second fetch |
| Response | `HTTP/2 200`; `server: GitHub.com`; `content-type: text/html; charset=utf-8`; no `content-encoding` |
| `last-modified` / `etag` | `Mon, 19 Oct 2026 16:28:55 GMT` / `"6ad64547-41737"` |
| Body | 268087 bytes; sha256 `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` on both fetches |
| Committed records | Matches `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:13` (sha, bytes, headers) and `corpus/lessons/kaika-fleet-round-1.md:66` (sha). `corpus/SOURCES.md:37` is the S023 row and carries no digest. |

Byte equality supports only one claim: the served documentation bytes are the same. It pins no Playwright package or browser runtime.

## 2. Located excerpts

How an excerpt counts as located:
1. Split the served HTML at the `id`s of the content headings.
2. In each slice, strip tags, unescape entities, drop U+200B and collapse whitespace.
3. The excerpt is located if it occurs in the slice for its heading.

Tokens are whitespace-separated words, counted with `str.split`.

| # | S023 section (heading id) | Excerpt | Tokens |
|---|---|---|---|
| L1 | Locate by role (`locate-by-role`) | "role locators do not replace accessibility audits and conformance tests" | 10 |
| L2 | Locate by role | "but rather give early feedback about the ARIA guidelines" | 9 |
| L3 | Quick Guide (`quick-guide`) | "page.getByRole() to locate by explicit and implicit accessibility attributes." | 9 |
| L4 | Locate by role | "follow W3C specifications for ARIA role, ARIA attributes and accessible name" | 11 |
| L5 | Locate by role | "have an implicitly defined role that is recognized by the role locator" | 12 |
| L6 | Locate by role | "The page.getByRole() locator reflects how users and assistive technology perceive the page, for example whether some element is a button or a checkbox." | 23 |
| L7 | Locate by role | "When locating by role, you should usually pass the accessible name as well, so that the locator pinpoints the exact element." | 21 |

L1 and L2 are parts of one sentence. In the raw HTML it reads `<p>Note that role locators <strong>do not replace</strong> accessibility audits ...`.

Counts for that sentence:
- The whole sentence is 21 tokens (`str.split`).
- Cross-check: `wc -w` over the sentence, L1 and L2 together gives 40, which is 21 + 10 + 9.
- My earlier figure of 19 was wrong.

I followed TabiR15's suggestion and anchored the boundary on L1 alone. L1 measures 10 tokens, not 11; `corpus/lessons/round-13-verifier-spotcheck.md:115` also records 10.

Term counts over the whole served text (case-insensitive):

| Term | Count |
|---|---|
| "accessibility tree" | 0 |
| "accessibility-tree" | 0 |
| "accessibility audit" | 1 (the L1 sentence) |
| "WCAG" | 0 |
| "screen reader" | 0 |
| "keyboard" | 0 |

## 3. Rejection, limited to what S023 says

1. **The boundary [observation].** Role locators "do not replace accessibility audits and conformance tests" (L1). The positive scope the source gives them is "early feedback about the ARIA guidelines" (L2).
2. **What S023 says `getByRole` does [observation].** It:
   - locates "by explicit and implicit accessibility attributes" (L3);
   - follows W3C specifications for ARIA role, ARIA attributes and accessible name (L4);
   - recognizes implicit roles (L5);
   - reflects how users and assistive technology perceive the page (L6);
   - pinpoints the exact element when given a name (L7).
3. **What S023 does not provide [observation].** It has no "accessibility tree" wording and no audit criteria or procedure (see the counts in §2). This report therefore makes no claim that the role query is an accessibility-tree projection. It describes the query only with the qualifiers in L3–L7.
4. **Rejection [inference from 1–3].** A resolved role+name locator supports a target-selection statement under L3–L7, plus early feedback against the ARIA guidelines. It does not support "accessible", "conformant" or "audited".
   - Calibration: the source says role locators "do not replace" audits. It does not say they are irrelevant to accessibility. The rejection must not erase L2.
5. **Where this sits in the lane [observation].**
   - A locator is "methodology, not evidence", and "a selector is not a state witness" (`corpus/knowledge/playwright-accessible-locators-and-snapshots.md:93`).
   - For the claim "the page is accessible / conformant", the same note gives "no rung in this ladder" and "out of scope" (`:98`).
   - The SKILL boundary cell says "A role match is not an accessibility conformance result" (`SKILL.md:1635`).

## 4. In-lane consistency

This was a literal search. No LSP device was available in this seat's tool set.

These lane statements are consistent with L1, and none implies that role locators are audits:
- `SKILL.md:1635`
- knowledge note `:24` (exact L1), `:83` (full sentence, labelled [inference]) and `:108`
- `corpus/knowledge/aria-loopback-round-13.md:45` ("It is not an accessibility audit, keyboard/screen-reader test, WCAG certificate…") and `:47`
- lessons `corpus/lessons/round-12.md:44`, `corpus/lessons/round-13.md:25`, `corpus/lessons/round-14.md:21`
- verifier rows `corpus/lessons/round-12-verifier-spotcheck.md:151`, `corpus/lessons/round-13-verifier-spotcheck.md:115`, `corpus/lessons/round-14-verifier-spotcheck.md:141`

Other searches:
- **Tree co-occurrence.** I grepped `SKILL.md` and `corpus/` for getByRole, role locator or role match on the same line as "accessibility tree". There were 0 matches. This shows only that the literal pattern is absent; it is not semantic proof.
- **`PROVINCE.md`.** A case-insensitive grep for accessib, WCAG and conformance found 0 hits. That another lane owns conformance is reported only second-hand, at `.ufo/waves/round-12/w1/ClaimAttack.txt:106` (citing kake-shokunin/PROVINCE.md:24-25, which I did not re-open).
- **Owned scripts.** A case-insensitive grep for `getbyrole|locator|accessib|audit` found 0 matches in `scripts/check-aria-metadata.mjs` and `scripts/check-user-round-contract.mjs`. Nothing here is code-related, so I sent no message to MetadataEnforce or CounterDiagnostics.

## 5. Defects

**D1 — this seat, uncommitted, corrected in this revision.** The earlier draft and my IRC contained these errors, all now removed or replaced:
- Wrong token counts:
  - full sentence 19, measured 21;
  - L6 24, measured 23;
  - L7 22, measured 21;
  - the Strictness sentence "all operations…" 21, measured 20.
- An unsourced description of the role query as an accessibility-tree projection or query (S023 count: 0).
- Unsourced claims about WCAG criteria, assistive technology and hidden elements, with no opened source row behind them.
- The statement "role locators evaluate State claims", which contradicts note `:93`.
- Headers and sha copied from earlier records before I had measured them. They are now measured, and the values did not change.
- Proposed tests.

**D2 — carried in an immutable registry cell; no action.**
- `corpus/SOURCES.md:37` teaches "explicitly not an accessibility audit", which is stronger than L1+L2.
- It was already flagged at `.ufo/waves/round-12/w1/ReviewC2.txt:5` and `.ufo/waves/round-12/w1/ReviewSources.txt:20`.
- Debt in immutable cells is carried forward under the ruling at `.ufo/waves/round-14/w1/ReviewSourceUse.md:19`.
- Per TabiR15, no new registry row.

**D3 — low severity, historical note; no edit proposed.** Note `:98` paraphrases "role locators are not audits" without an [inference] label. Note `:83` quotes the source sentence directly, which offsets this.

**D4 — historical wave reports, immutable; input for the round's lesson on measured counts.** Nothing was edited.
- `.ufo/waves/round-13/w1/LocatorSource.txt`:
  - `:43` claims 24, measured 23;
  - `:54` claims 22, measured 21;
  - `:88` claims 21, measured 20.
- `.ufo/waves/round-14/w1/PlaywrightSource.md:77` claims 22, measured 21.
- `.ufo/waves/round-14/w1/PlaywrightSource.md:82-83` quotes "They are not recommended…". That text occurs 0 times in the served page. The served sentence is "These methods are not recommended because when your page changes, Playwright may click on an element you did not intend." It is 20 tokens and sits under the h4 `works-fine-with-multiple-elements` in §Strictness.

## 6. Tests

None proposed and none run. TabiR15's "No tests." replaces the original "defects/proposed tests" clause.

## 7. Commands for L1

These are read-only. I ran each once; the output below is what I observed.

```sh
curl -sL https://playwright.dev/docs/locators | sha256sum
# 234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6  -
curl -sL https://playwright.dev/docs/locators | wc -c
# 268087
curl -sL https://playwright.dev/docs/locators | python3 -c '
import sys,re,html
s=sys.stdin.read()
a=re.search(r"id=[\"\x27]?locate-by-role\b",s).start(); b=re.search(r"id=[\"\x27]?locate-by-label\b",s).start()
t=lambda x: re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>","",x)).replace("\u200b",""))
sec, whole = t(s[a:b]), t(s)
for q in ("role locators do not replace accessibility audits and conformance tests","but rather give early feedback about the ARIA guidelines"):
    print(len(q.split()), q in sec, q)
print("accessibility tree:", whole.lower().count("accessibility tree"))'
# 10 True role locators do not replace accessibility audits and conformance tests
# 9 True but rather give early feedback about the ARIA guidelines
# accessibility tree: 0
```
