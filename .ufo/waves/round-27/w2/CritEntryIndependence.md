# CritEntryIndependence — independent claim check of S107

Target: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/redirect-and-retry-after-semantics.md` against retained bytes `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/assimilation/rfc9110.txt`. Read-only review; report is the only persistent output.

Wave-1 finding folded in: `w1/ScoutReverifyRfc.md` F1 says the committed entry's `ground:` and “Why this matters” overstated absence of measured redirect behavior; that review records loopback 303→GET and 307 method/body preservation. The requested current entry instead says these observations exist and that real-site journeys remain untested (entry lines 47-52). This corrects the cited overreach, so F1 does not recur in the present text. The same wave-1 report found its committed one-line 303 cite short; current entry cites 7413-7414 (lines 13-16).

## Re-opened source identity

`wc -c /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/assimilation/rfc9110.txt` → 502941 bytes. `sha256sum` on that file → `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`, matching entry line 3.

## Assertions

(a) 303, entry lines 13-17: RFC lines 7416-7418 say: “A user agent can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP), which might also be redirected”. The cited line span and assertion are accurate; RFC line 7423 also says it applies to any HTTP method.

(b) 301/302, entry lines 19-26: RFC §15.4.2 *Note* lines 7384-7387 says “a user agent MAY change the request method from POST to GET for the subsequent request”; §15.4.3 *Note* lines 7406-7409 repeats this and points to 307 if undesired. Entry correctly distinguishes this from normative body wording and identifies POST→GET as possible, not required.

(c) 307, entry lines 27-29: RFC §15.4.8 lines 7493-7495: “MUST NOT change the request method if it performs an automatic redirection to that URI”. Accurate.

(d) 308, entry lines 30-40: required negative sweeps:
- `sed -n '7505,7530p' .../rfc9110.txt | grep -n 'MUST'` → no output (exit 1): no MUST in §15.4.9 window.
- `sed -n '7320,7530p' .../rfc9110.txt | grep -n 'MUST'` → relative line 137 (absolute 7456, 304 cache rule) and relative line 175 (absolute 7494, 307 clause); no 308 clause.
- `grep -n 'MUST NOT change the request method' .../rfc9110.txt` → exactly one line, 7494.
Thus the entry's specific observation that §15.4.9 does not repeat the MUST-NOT is supported. The wider historical note at lines 7260-7264 supports the interpretation that 307/308 indicate method-preserving redirects, but remains distinct from a 308-specific MUST-NOT sentence. Entry labels the preserving reading INFERENCE and leaves a status-specific re-anchor open; honest boundary.

(e) Retry-After, entry lines 41-45: RFC §10.2.3 lines 4801-4807 states 503 indicates expected unavailability and “When sent with any 3xx (Redirection) response” it indicates the minimum wait before the redirected request. Lines 4809-4812 define HTTP-date or delay-seconds. Accurate.

(f) INFERENCE boundary: one further claim warrants inference framing: RFC 9110's 307 and 308 method-preserving semantics do not by themselves establish that the shipped journey driver/browser chain actually follows them. Entry correctly confines that to the Unknowns at lines 54-57 (“no runtime capture this round; the entry is spec-ground only”). Its line 48-52 contrast with measured loopback behavior and untested real-site journeys should not be read as a guarantee for every browser/site; wording does not claim such guarantee. No additional unmarked behavioral inference found in the reviewed assertions. This is about the entry's epistemic boundary, not a new source finding.

## Verdict

**Entry honest.** All requested source assertions locate and match; the 308 statement is a bounded absence claim supported by the specified sweeps, and the preserving interpretation is explicitly labeled INFERENCE. Wave-1's substantive ground-line overreach is corrected in this entry. Impacted axes: source fidelity, provenance/epistemic honesty, claim-to-citation traceability. Smallest safe correction: none required for the requested claims. Preserve the current explicit separation between documented RFC semantics and runtime unknowns.

No tools installed or updated.
