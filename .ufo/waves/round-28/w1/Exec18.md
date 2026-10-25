# Exec18 — C2 do-nothing control (round 28 attempt 1, wave tabi-r28-w1)

Seat: Exec18 / item 18. Role: executor (leaf; no delegation).
Scope: run the current self-assessment counter on baseline and tip; report the LOG.md:221 finding.
No tracked files changed. Read-only git. No installs (no tooling changes to report).

## Frozen claims consulted

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`:
  - line 7: `"baseline":"eb23c0b84668afc48ebab8bd7e4a8a4457407cc4"`.
  - line 12 (C2): `"before":"tip presently reports a false-clear of LOG.md:221 per corpus/lessons/round-27-verifier-spotcheck.md:15"`, `"after":"LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest cont…"`.
  - line 15 (notes): `"Control results must be recorded before any claim implementation."`
- Independent defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md:15` (C1 calibration false-clear) and `:46` (next-round repair directive for the supersession matcher).

## Control runs

Baseline == tip today: `git rev-parse HEAD` and `git rev-parse eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` both return `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (observation). The lane working tree contains only untracked round-28 wave files.

Command (baseline), run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
```

Observed summary: `rev=eb23c0b…`, `mismatches=1`, `clean=false`, `superseded=10`, `couldNotEvaluate=92`, exit code 1. The only counted entry is `m3-unlanded-paths` (`claimed:"landed"`, `observed:7`).

Command (tip), identical output shape:

```
node scripts/check-selfassessment.mjs --rev HEAD --json
```

Observed summary: `rev=eb23c0b…` (same commit), `mismatches=1`, `clean=false`, `superseded=10`, `couldNotEvaluate=92`, exit code 1. Counted: `m3-unlanded-paths` `observed:32` at final run (live porcelain grew as sibling wave reports landed; was 7 at the first baseline run). m3 reads live working-tree porcelain and is not bound to `--rev` (script lines 379-389), so its count is environment-dependent mid-wave and is not a C2 signal.

## LOG.md:221 finding (both baseline and tip runs)

```
{"class":"m1-selftest-tally","doc":"LOG.md","line":221,"script":"scripts/check-freshness.mjs",
 "claimed":8,"observed":12,"superseded":true,
 "lineText":"  exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,"}
```

- The finding claims 8 cases; the freshness gate oracle at the measured revision reports 12. Because `superseded=true`, it is excluded from `counted` → the counter reports **zero mismatches attributable to LOG.md:221** at baseline and tip. This is the declared false-clear: **reproduced** (observation).
- Supersession matcher evidence (script lines 319-327): a later paragraph clears a stale mention when it names the same script, carries a correction marker `/supersed|correct/i`, contains any `/:\d+/` token, and states the oracle-correct number in tally shape. The paragraph that clears :221 starts at LOG.md:265 ("post-commit measurement and handoff, same blocked fleet round-1 attempt") and is one 183-line paragraph (next blank line at :448; no `##` heading inside). It:
  - names `node scripts/check-freshness.mjs --witness c5e252083ede8ee87e3b498e486f0bc238f1d516` at :272,
  - contains "Corrected" at :274,
  - satisfies `/:\d+/` via the ISO timestamp `2026-10-15T05:16:28Z` at :269 (`:16`, `:28`),
  - states 12 via "12-case self-invocation and candidate run" at :275.
  It never cites `:221`. A sweep for the literal `:221` after line 221 finds only LOG.md:1931, inside the round-27 note itself (below), not in an eligible correction paragraph.
- Corroborating committed note, LOG.md:1927-1938 (round-27 C1 falsification): "the paragraph-level matcher accepts any colon-number token as the cited superseded line. It therefore marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221". Quote ≤25 words, located at :1929-1932.

## Interpretation (inference)

- Claim-before state holds at baseline and tip: the counter hides the :221 mismatch via a supersession trigger that requires any colon-number token, not a citation of the superseded line itself. Absent the environmental m3 artifact, the counter would print `mismatches=0`/`clean=true` while still hiding :221 — the "unsound apparent zero" documented at LOG.md:1933.

- The m3 count in these runs is an artifact of running inside the wave (untracked dispatch/report files); at the round-27 measurement site porcelain was empty. It must not be misread as the C2 signal.

## Risks / notes for implementers (observation only; no repair performed here)

- The fix must bind supersession to the superseded finding's own line: a paragraph should clear stale tally *f* only if it cites `:<f.line>` (and matches same-script + correction + oracle-correct tally). Current `/:\d+/` also accepts ISO-timestamp colon-digits (`T05:16:28Z`), which is the concrete mechanism that false-clears :221.
- Existing selftest CASES (script lines 443-597) already include `m1-log-stale-then-corrected` (positive, exact `:6` citation) and `m1-log-wrong-number-correction` (negative, wrong number), but none asserts an unrelated-citation / missing-exact-line negative control; the target "red unrelated-citation case and positive exact-citation control" is therefore unimplemented.
- m3 binding to `--rev` is a separate known limitation (LOG.md:1934-1935), out of C2 scope.

## Files changed

None (report only). This report: `.ufo/waves/round-28/w1/Exec18.md`.

## Final answer

C2 do-nothing control: current counter on baseline eb23c0b and tip (same commit) reports LOG.md:221 m1 finding claimed 8 / observed 12 / superseded=true (false-clear reproduced); mismatches=1 is solely the environmental live-porcelain m3 artifact (7→32 untracked wave files), not a C2 signal. The superseding 183-line paragraph (LOG.md:265-447) never cites `:221`; `/:\d+/` passes via ISO timestamp colons at :269. Committed round-27 note LOG.md:1929-1932 corroborates the same defect. Claim-before state confirmed; no tracked changes made; fixes/reporting left to implementer/critic seats.
