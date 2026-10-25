# ScoutRfcIndependent — independent re-grounding of RFC 9110 redirect semantics (round 27, wave 2)

Seat: TabiR27.ScoutRfcIndependent · read-only reporter · lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`
Item: fully independent re-grounding of the C3 entry
`corpus/knowledge/redirect-and-retry-after-semantics.md` (source S107) against a fresh
RFC 9110 fetch — 303 method semantics, 301/302 method rewrite, 307 MUST-NOT, 308 status,
Retry-After-with-3xx.
Tools: no tool installed or upgraded this run (curl, git, grep, awk ship with the host;
recorded per operator 2026-10-19 rule). Read-only: no tracked file edited; the only file
written is this report.

## 1. Independence protocol

Before reading the committed entry, I wrote my own located quotes from my own fetch at
`.ufo/waves/round-27/scratch/ScoutRfcIndependent/independent-quotes.md` (quotes A1–E2)
for the five clusters, then read the committed entry. All entry wording was compared
against those independently located byte spans, not against prior summaries.

## 2. Fresh fetch — PASS, byte-identical

```
curl -sSL -o <scratch>/ScoutRfcIndependent/rfc9110.txt -w 'HTTP_STATUS:%{http_code}\nBYTES:%{size_download}\n' https://www.rfc-editor.org/rfc/rfc9110.txt
HTTP_STATUS:200
BYTES:502941
sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a
```

Re-confirmed today: `curl -sSL -o /dev/null -w 'http_code=%{http_code} bytes=%{size_download}\n'` → `http_code=200 bytes=502941`.
`diff -q` vs the committed `.ufo/waves/round-27/assimilation/rfc9110.txt` → identical; both match the entry's `source:` line and S107 row (502941 B, sha256 `21c1cdce…`). LF-only (no CR), so line numbers are stable.

## 3. Cluster-by-cluster comparison (entry quote ↔ located bytes)

| Cluster | Committed entry wording | Located bytes | Verdict |
|---|---|---|---|
| 303 semantics | "indicates that the server is redirecting the user agent to a different resource" (7413-7414); "can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" (7416-7418); "Applicable to any HTTP method" (7423) | 7413-7414, 7416-7418, 7423 exact | ALL LOCATED, word-accurate. Entry correctly preserves "can perform" (RFC 9110 says *can*, not MAY/MUST) and does not over-claim a method restriction |
| 301/302 rewrite | "For historical reasons, a user agent MAY change the request method from POST to GET for the subsequent request. If this behavior is undesired, the 308 (Permanent Redirect) status code can be used instead." (§15.4.2 note, 7384-7387); identical note in §15.4.3 pointing at 307 (7406-7409) | 7384-7387 and 7406-7409 exact | ALL LOCATED. Both notes are MAY-level, scoped to POST→GET "for the subsequent request"; the two notes differ only in the suggested alternative (308 vs 307) — the entry states this pairing accurately |
| 307 MUST-NOT | "the user agent MUST NOT change the request method if it performs an automatic redirection to that URI" (§15.4.8, 7493-7495) | 7493-7495; MUST-NOT at 7494 | LOCATED exact |
| 308 status | own §15.4.9 body does NOT repeat the MUST-NOT clause; permanent-assignment text at 7507-7523; "the only MUST-NOT in the redirect sections is 307's at line 7494" | §15.4.9 body 7507-7522 (prose), 7523 blank, cacheable sentence 7524-7526, note 7528-7530 → RFC7538 §4 | LOCATED. Sweeps confirm: `grep -n 'MUST NOT change the request method'` → exactly one hit document-wide, line 7494; §15.4 sweep (7230-7535) → only 7494; window 7505-7531 has zero MUST lines. The claim is true |
| Retry-After | "When sent with any 3xx (Redirection) response, Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request." (§10.2.3, 4805-4807); 503 at 4803-4804; value form at 4809-4813 | 4805-4807, 4803-4804, 4809-4813 (ABNF `Retry-After = HTTP-date / delay-seconds` at 4812) | ALL LOCATED. Entry does not over-claim: RFC's 3xx wording is "is *asked* to wait" (sender request, not user-agent obligation) — the entry mirrors it |
| 308 inference support | historical note "to unambiguously indicate method-preserving redirects" (§15.4, 7260-7264); step 4 "Change the request method according to the redirecting status code's semantics, if applicable" (7306-7307) | phrase at 7262-7263 inside 7260-7264; step 4 at 7306-7307 exact | LOCATED |

**Result: all quoted spans from the admitted entry locate exactly in the fresh bytes; no quote is absent; no quote contradicts the RFC wording.**

## 4. Cross-checks

- Section numbering: 307 is §15.4.8 (heading line 7490), 308 is §15.4.9 (heading 7505). The staged S124 row's "§15.4.7 (307)" was wrong; the transformed S107 row correctly uses §15.4.8 / §15.4.9. 306 (Unused) is §15.4.7 at 7485.
- INFERENCE label: honestly present and correctly bounded. The location is explanatory prose, not a status-specific normative clause, so the label is right in both committed and working-tree versions.
- Registry/obsolete context (in-hand bytes): row 501 of the obsoleted-specifications table maps 308 → [RFC7538] | B.7; B.7 (lines 10158-10160) reads "Changes from RFC 7538: None." RFC 9110 folds RFC 7538 in (changelog 10101-10103: 308 "has been added so that it's defined closer to status codes 301, 302, and 307"). §15.4.9's own note points only at RFC 7538 §4 (deployment considerations), not at a semantic clause.

## 5. Frozen C3 counters re-run (at HEAD bceb17d)

```
git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l     → 1
git show HEAD:corpus/SOURCES.md | grep -cE '^\| S[0-9]+ \|'          → 107
git show HEAD:corpus/SOURCES.md | grep -cE '^\| S107 \|'             → 1
grep -c 'S107' corpus/knowledge/redirect-and-retry-after-semantics.md → 1
node scripts/check-sources.mjs  → SOURCES_GATE verdict=clean rows=107 findings=0, exit 0
```

Census transition 106→107 reproduces (rows at HEAD = 107; clean exit 0). Kill-rule evidence: staged S124 failed E09 (`recheck=730d (errata only)` — prose suffix) in `staged-census.txt`; the transformed S107 row (recheck=`730d` alone) passes, and `xform-census.txt` shows the `file ok … SOURCES.md` line with no E09/E03/E04 for S107.

## 6. Folded wave-1 findings — status at current HEAD

- F1 (HIGH, w1: committed `ground:`/`Why this matters` overclaimed the lane's driver "has never asserted" redirect rules): **RESOLVED in the committed tip** — HEAD entry has `ground: documented-upstream redirect semantics — extends existing loopback 303/307 observations …` (verified via `git show HEAD:…` line 6); the false wording is absent.
- F2 (MEDIUM, w1: §15.4.4 citation `line 7413` under-stated a two-line span): **RESOLVED** — committed tip cites `7413-7414`; the SOURCES S107 row also reads "at lines 7413-7414".
- F3 (LOW): §15.4.9 range tail 7523 is a blank line (last prose line is 7522). Still true; cosmetic only, no quoted text depends on 7523.
- F8 (MEDIUM, [INFERENCE]): the committed wording "the exact clause for 308 lives in RFC 7538" is doubtful — B.7 = "None" plus §15.4.9's clause-free relocated definition imply RFC 7538 had no such clause either; the better in-bytes anchor is the history note (7260-7264), which the current entry cites. **Open**: confirmation requires fetching RFC 7538, not authorized by my item (which names only rfc9110.txt). Flagged for an authorized round.

## 7. My findings (this pass)

- **None blocking.** All entry quotes locate; no wording contradiction; INFERENCE label correct; counters reproduce.
- INFO: the 301/302 bullet's "normative body … describes the new-URI assignment" is a slight gloss for 302, whose body says the target "resides temporarily under a different URI" (line 7395-7396); the quoted notes themselves are accurate. Non-blocking.
- INFO: w1 F1/F2 are now landed in the committed tip (HEAD bceb17d), so re-review of the committed entry sees the corrected text.

## 8. Open items

- RFC 7538 §3 content (F8): unverified by design; next authorized round should fetch `https://www.rfc-editor.org/rfc/rfc7538.txt` and grep for a request-method clause.
- No runtime claim: entry remains spec-ground only (matches its own Unknowns block).

## Evidence appendix (commands)

```
curl -sSL -o <scratch>/ScoutRfcIndependent/rfc9110.txt -w 'HTTP_STATUS:%{http_code}\nBYTES:%{size_download}\n' https://www.rfc-editor.org/rfc/rfc9110.txt
curl -sSL -o /dev/null -w 'http_code=%{http_code} bytes=%{size_download}\n' https://www.rfc-editor.org/rfc/rfc9110.txt
sha256sum <scratch>/…/rfc9110.txt · sha256sum .ufo/waves/round-27/assimilation/rfc9110.txt → both 21c1cdce…
diff -q <scratch>/…/rfc9110.txt .ufo/waves/round-27/assimilation/rfc9110.txt → identical
grep -n "MUST NOT change the request method" rfc9110.txt → 7494 only
awk 'NR>=7230 && NR<=7535 && /MUST NOT/' rfc9110.txt → 7494 only
awk 'NR>=7505 && NR<=7531 && /MUST/' rfc9110.txt → (empty)
awk 'NR>=10155 && NR<=10162' rfc9110.txt → B.7 "None."
awk 'NR>=495 && NR<=505' rfc9110.txt → row 501: 308 | [RFC7538] | B.7
git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l → 1
node scripts/check-sources.mjs → clean, rows=107, findings=0, exit 0
```
