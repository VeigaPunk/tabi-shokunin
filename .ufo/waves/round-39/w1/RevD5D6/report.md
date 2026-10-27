# RevD5D6 — C2 D5/D6 attack

Axes: coverage (parser and filename/window edge cases); calibration (whether receipts prove the claimed measurement).

## Evidence and observations

- Read frozen claims at round 39: C2 requires D5 census counts matching the counter parse and D6 a receipt naming baseline `3f42a5c7cc19` and REV, whose data body byte-matches `git diff --numstat BASELINE..REV` excluding the receipt. Frozen counter is `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` (sha listed by claims: `eefc8997…`); working tree HEAD observed `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`, not the requested frozen commit. No counter execution was performed.
- D5 implementation lines 184–207 parses only rows matching `^ {0,3}\|\s*S\d{3,}\s*\|`; columns are extracted with `split('|')`, tier is cell index 4 and status index 8. This covers the stated 0–3 leading ASCII spaces and census-start command’s same row regex. It excludes 4+ spaces, tabs before the pipe, IDs shorter than three digits, and other pipe/table row shapes. Histogram equality does not validate per-row semantics or receipt provenance/freshness; receipt is read from the worktree at the path, while source is read from REV.
- D6 chooses exactly `numstat-at-${REV.slice(0,8)}.txt`, checks baseline and full REV by substring presence, then compares the body (nonblank, non-`#` lines) to the expected diff. That exact body comparison makes filename selection arbitrary receipt text insufficient to green the body, but filename/header inclusion is not a strict parsed binding. More importantly, the receipt is itself included in the requested REV tree while it must name REV and represent baseline..REV excluding itself: adding/changing the receipt changes the containing commit ID. Existing `measure/c2-self-reference-probe.txt` records a concrete observed attempt: candidate `03322e9d…` with no receipt refused (`d5-receipt`, `d6-file`); adding the candidate-named receipt produced carrier `5c13c846…`, which expected `numstat-at-5c13c846.txt` and refused (`d5-receipt`, `d6-file`). This is a design-level false-negative / unattainable predicate for ordinary committed receipt-at-REV construction, not a false green.
- D5 receipt `measure/census-end.txt` and D6 `numstat-at-<REV>.txt` are absent from the observed worktree listing, so freshness/content cannot be assessed from actual receipts. The census-start receipt is explicitly measured at round-start baseline, not a substitute for census-end.

## Concrete false-green fixture

For D5, construct a committed clean-clone fixture where REV `corpus/SOURCES.md` has the normal table counts, but its `census-end.txt` is copied verbatim from a prior revision with identical row/tier/status histograms (or deliberately fabricated those counts). Counter currently accepts because equality is solely histogram equality and does not bind receipt to REV, source hash, or measurement command. Also test changing an eligible status spelling/shape while preserving aggregate histogram: the counter only observes field histograms, not census parsing provenance. For D6, make a fixture with exact expected diff body but header containing baseline and REV as incidental substrings in unrelated text; `includes()` accepts the header flags. These isolate the weak freshness/header checks; exact numstat body remains independently enforced.

## Commands / output

- `cat /home/vgpnk/.omp/agent/RULES.md` → read; no installation performed.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`.
- `git -C ... status --short` → pre-existing untracked `measure/c2-self-reference-probe.txt` and `w1.ready.partial`; left untouched.
- Read commands via repository reader: claims.json, c2 counter lines 64–265, census-start-counts.txt; globbed round-39 directory. No files outside assigned report/scratch modified; scratch removed on exit.

VERDICT finding — D5 receipt freshness is unbound; D6 receipt-at-REV self-reference prevents a coherent ordinary committed receipt, and header binding is substring-only. Exact expected numstat body check is present.
