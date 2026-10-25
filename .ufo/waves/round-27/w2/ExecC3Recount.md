# ExecC3Recount — C3 recount (round 27, wave 2)

Seat: leaf executor/reporter, read-only. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Assignment: re-derive the four C3 counting commands, reopen the sources, test the frozen kill rules, verify the
entry/row and the report-contract utility. Only this report plus throwaway fixtures under
`.ufo/waves/round-27/scratch/ExecC3Recount/` were written. No tracked file edited, no build/lint/gate on the lane,
no tools installed (operator 2026-10-19 rule: nothing needed).

Measurement state: `git rev-parse HEAD` → `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (post-w1 landing).
The S107 row is now identical at HEAD and in the worktree — the w1 F1 mutation (RevSourcesS107) has landed; the
v1/v2 divergence is closed. Entry and row are also HEAD==worktree identical.

## 1. Counter re-derivation (all four, executed fresh)

| # | Command | Expected | Observed | Verdict |
|---|---|---|---|---|
| 1 | `git -C <lane> grep -lE '^source: S107 ' master -- corpus/knowledge \| wc -l` | 1 | **1** | PASS |
| 2 | `grep -cE '^\|[[:space:]]*S10[0-7] ' <lane>/corpus/SOURCES.md` | 8 | **8** | PASS |
| 3 | `grep -cE '^\|[[:space:]]*S[0-9]{3,}' <lane>/corpus/SOURCES.md` | 107 | **107** | PASS |
| 4 | `<fleet>/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | exit 0 | **exit 0** | PASS |

Details:

- Command 1 range check: `f185b4e7ab10cd9e8925e8ec614c9c111772357d` → **0**, `HEAD` → **1**. The 0→1
  transition the claim asserts is reproduced.
- Command 2 enumerates exactly rows `S100 S101 S102 S103 S104 S105 S106 S107` (8 rows, contiguous).
- Command 3: 107 rows; highest row is `S107`; id contiguity consistent with w1 sweep.
- Command 4 prints 16 `W04 duplicate url … across scopes` warnings for pre-existing rows (S058, S065-S077, S095-S100)
  before the final `tabi ok …/corpus/SOURCES.md` line; exit still 0. No W04 on S107. Observation: the gate is
  warning-tolerating on W04; exit-0 contract holds as claimed.

## 2. Entry/row state at measurement

- `corpus/SOURCES.md:121` row: sha256 of line unchanged between HEAD and worktree (both are the v2 text with the
  §15.4 historical-note locator at 7260-7264).
- Entry `corpus/knowledge/redirect-and-retry-after-semantics.md`: `diff` HEAD vs worktree → IDENTICAL.
- `grep -cE '^source: S107 '` in entry → 1; `S107` token appears exactly once in the entry and once in
  `SOURCES.md` (bidirectional cite intact).
- Used-by path exists and cites the row → the E03/E04-style coupling (`check-sources.mjs` path+token) holds.

## 3. Anchor honesty — every locator re-located against the committed fresh bytes

Bytes checked: `.ufo/waves/round-27/assimilation/rfc9110.txt`. Worktree and HEAD blob identical: 502941 bytes,
sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.

| Row/entry anchor claim | Verified against bytes |
|---|---|
| §15.4 historical note 7260-7264 "307/308 … added to unambiguously indicate method-preserving redirects" | ✓ phrase at 7262-7263 within the span |
| §15.4.4 303 at 7413-7414 | ✓ "The 303 (See Other) status code indicates that the server is / redirecting the user agent to a different resource" (7413-7414) |
| GET-or-HEAD at 7416-7418 | ✓ "…can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" (7416-7418) |
| "Applicable to any HTTP method" at 7423 | ✓ "This status code is applicable to any HTTP method." (7423) |
| §15.4.2 note 7384-7387 (MAY rewrite POST→GET, 308 alternative) | ✓ full note text present (with `\|` table markers, hard-wrapped) |
| §15.4.3 note 7406-7409 (identical, pointing at 307) | ✓ full note text present, 307 alternative |
| §15.4.8 307 MUST-NOT at 7493-7495 | ✓ "…the user agent MUST NOT change the request method if it performs an automatic redirection to that URI" (7493-7495; MUST-NOT at 7494) |
| §15.4.9 308 at 7507-7523, no status-specific MUST-NOT | ✓ body 7507-7522 contains only SHOULD/MAY; sweep `awk 'NR>=7230&&NR<=7531 && /MUST NOT/'` → exactly **7494** (the one 307 line), so "no status-specific MUST-NOT clause in these bytes" is true |
| §15.4 rewrite step 4 at 7306-7307 | ✓ "4. Change the request method according to the redirecting status code's semantics, if applicable." (7306-7307) |
| §10.2.3 Retry-After at 4805-4813 | ✓ heading at 4799; "When sent with any 3xx (Redirection) response…" 4805-4807; value forms (HTTP-date / delay-seconds) 4809-4813 |

Two locator nits (both minor, none a mislocation):

- **(i)** `7507-7523` includes a trailing blank line: the §15.4.9 body ends at 7522, 7523 is empty. Off-by-one
  trailing blank in the row's cite.
- **(ii)** The row's §10.2.3 span `4805-4813` excludes `4803-4804`, where the 503 sentence backing the teaches
  clause "Retry-After may accompany any 3xx and 503" actually sits. The entry itself corrects this by citing
  `4803-4804` for the 503 bound; the row under-covers by one pair of lines (w1 F2 restated, verified).

## 4. Frozen kill rule — quote absence and E03/E04

Kill rule (claims.json C3): "If any quote the admitted entry rests on is absent from this round's fresh bytes, the
entry is refused and the claim misses honestly. E03/E04 on the transformed row -> refuse or supersede…".

Quote sweep executed (Python): extract the entry's double-quoted spans (n=8), test each against the committed
bytes under three readings — raw substring, whitespace-collapsed, whitespace-collapsed + RFC note-table `|`
marker stripped:

- 7/8 spans resolve in the fresh bytes under whitespace collapse + `|`-stripping.
- Of those, 5/8 resolve under plain whitespace collapse; 0/8 resolve as raw byte-exact substrings — every quote
  straddles the RFC's hard wraps, and the two note quotes (7384-7387, 7406-7409) additionally carry the table
  `|  *Note:*` prefix.
- The residual span is "the form was POSTed" — the entry's own journey paraphrase ("A journey that asserts 'the
  form was POSTed' can therefore be silently converted…"), not attributed to the RFC; it is not a quote the entry
  rests on.

Verdict: no quote the entry rests on is absent under documented normalization → the kill rule does NOT trigger,
and the claim is not refused on absence grounds. BUT the rule's "absent" is undefined: a raw byte-exact reading
would refuse all eight (0/8), so the rule only coheres if "absent" means "absent under normalization N". This
re-confirms CritC3Junk §1/§6: the decisive 7384-7387 note survives only under marker-stripping normalization, and
the rule never says which.

E03/E04: `grep -o 'https://www.rfc-editor.org/rfc/rfc9110.txt' corpus/SOURCES.md | wc -l` → **1** at worktree
and at HEAD; no duplicate-URL/scope collision on the transformed row → no refuse/supersede obligation triggered.

## 5. Report-contract utility

- Tracked `scripts/report-contract.mjs` is byte-identical to the w1 scratch deliverable (sha256
  `b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`, 140 lines; `diff` → IDENTICAL).
- Smoke runs on the tracked copy:
  - Fleet `…/.ufo/reports/round-26/tabi.md` → `PASS … 6/6 sections in order; SHONEN 4/4 boxes`, exit 0.
  - Scratch fixture under `.ufo/waves/round-27/w2/` → exit 1 with the round-25 defect-class wording
    (`(c) … is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md`), plus a box-count finding
    (fixture carried 1 of 4 boxes).
  - Non-existent report path → exit 2 `ENOENT` (the utility reads the file before evaluating path shape, so the
    round-25 wording only fires for existing files — behavior note, not a defect).
- Utility behavior is as documented at its landed location.

## 6. Findings

- **No blocking findings.** All four C3 counters reproduce exactly (1 / 8 / 107 / exit 0); the baseline 0→1
  transition holds; every anchor locator in the S107 row and the entry resolves against the committed RFC 9110
  bytes; the kill rule does not trigger; E04 URL uniqueness holds.
- **Minor (locator):** (i) trailing-blank line in the 7507-7523 cite; (ii) 4805-4813 under-covers the 503
  sentence's 4803-4804 (entry cites it separately). Both cosmetic/under-coverage, not mislocations.
- **Minor (kill-rule spec):** "absent" is undefined; byte-exact matching would refuse every quote, normalization-
  dependent matching admits all. The rule as frozen is not mechanically executable without an explicit
  normalization (carried from w1, re-measured here).
- **Info:** the fleet census emits 16 W04 duplicate-url warnings on pre-existing rows before the exit-0 `tabi ok`
  line; S107 is not among them.

Observation/inference separation: every count, hash, line range and sweep above is a command output measured this
wave. The judgment that the kill rule's "absent" is under-specified is an assessment of the frozen text, not a
measurement. Unknown: whether a future closure will define the normalization (out of this seat's scope).
