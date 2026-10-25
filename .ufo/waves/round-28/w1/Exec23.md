# Exec23 — Round 28 do-nothing controls (C1 selftest count / target gate validity; C2 false-clear reproduction)

Seat: Exec23 (leaf, Godspeed). Assignment: check do-nothing controls at baseline before claim implementation; record exact commands/output; cite frozen claims. No production code touched; no tracked changes made; no tools installed.

## Baseline state

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (equals frozen baseline in `.ufo/waves/round-28/claims.json` line 7).
- `git status --porcelain` → only `?? .ufo/waves/round-28/` (untracked wave scratch); zero modified tracked files.

## Frozen claims

- `claims.json` line 11 (C1): "Target: gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid." Control: "Do-nothing control: unchanged gate selftest is 5, below target. A receipt revision mismatch fixture must fail while matching revision fixture passes."
- `claims.json` line 12 (C2): "Target: self-assessment mismatch count at tip is nonzero for the known LOG.md:221 false-clear … LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest contains both red false-clear and green exact citation cases." Control: "Do-nothing control reproduces the known false-clear at LOG.md:221."
- Prior defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md` line 15 (C1 calibration false-clear; "that paragraph does not cite line 221") and lines 46-47 (routed defects: "repair C1's supersession matcher so it enforces citation to the superseded line" / "put revision identity in receipt/evaluation and test it against the measured commit").

## C1 control

Command (cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`):

```
node scripts/check-s106-evidence.mjs --selftest; echo EXIT=$?
```

Output (verbatim, case lines abbreviated to id/exit/valid):

```
CASE id=clean-fixture-valid expected_exit=0 exit=0 valid=true PASS
CASE id=sha-mismatch-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=anchor-off-by-one-invalid expected_exit=1 exit=1 valid=false PASS
CASE id=missing-bytes-could-not-evaluate expected_exit=2 exit=2 valid=n/a PASS
CASE id=missing-receipt-could-not-evaluate expected_exit=2 exit=2 valid=n/a PASS
S106_SELFTEST verdict=clean cases=5 passed=5
EXIT=0
```

Observation: baseline selftest is 5/5, exit 0 → matches C1 `before` ("5 cases at baseline"); unchanged gate is below the ≥7 target. The 5 case ids include no revision-mismatch / matching-revision cases (observed from `CASES` at script lines 175-213; receipts carry no revision field, see below).

Runtime gate at baseline tip (counting command as frozen):

```
node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json; echo EXIT=$?
```

Output (abridged): `rev=eb23c0b…`, `present=true`, `decoded_bytes=73952`, `decoded_sha256_claimed` = `decoded_sha256_observed` = `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`, `sha_match=true`, `anchor={line:187, text:"BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);", occurrences:1}`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`, `valid=true`, `EXIT=0`.

Observation: runtime gate is valid at its committed target receipt at baseline tip (target-gate validity control passes).

Revision-binding ground truth: committed receipt `corpus/evidence/round-26/sources/s106.json` (git show eb23c0b:…) contains keys `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status` — **no revision/measured-rev key** (observation). Therefore the receipt cannot bind a measurement revision today; selftest has no revision-binding fixture. Inference: the C1 revision-binding change is not present at baseline, consistent with `before`.

## C2 control

Command:

```
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json; echo EXIT=$?
```

Output (summary fields; extraction via node one-liner over the JSON):

```
mismatches=1 clean=false superseded=10 couldNotEvaluate=92
counted: [{"class":"m3-unlanded-paths","doc":"SCORECARD.md","line":null,"claimed":"landed","observed":40}]
SUPERSEDED LOG.md:221 claimed=8 observed=12 script=scripts/check-freshness.mjs
```

Observation: at tip, LOG.md:221 (claimed 8, observed 12) **still** has `superseded=true` → the known false-clear is reproduced (line 221 does not appear as a mismatch). The single counted mismatch is `m3-unlanded-paths` (SCORECARD.md, observed 40), unrelated to the m1 false-clear; `clean=false` derives from that m3 count, not from m1. Exits 1. This matches C2 `before` ("tip presently reports a false-clear of LOG.md:221 per … round-27-verifier-spotcheck.md:15").

Prose at the evidence lines (git show eb23c0b:LOG.md):
- line 221: "exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,"
- line 254 (later paragraph): "pairs persisted. `FRESHNESS_SELFTEST verdict=clean cases=12`, exit 0;"
- line ~1931 (committed falsification note): "It therefore marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221"

Matcher root cause (observation of `scripts/check-selfassessment.mjs` lines 319-327): LOG supersession requires (a) same script name, (b) `/supersed|correct/i`, (c) `/:\d+/` — any colon-number token, not the stale line — and (d) oracle number present. Condition (c) is the loose citation check the round-27 spot-check flagged. No later paragraph cites `:221` as an exact correction of the tally (the line-1931 mention is the falsification note itself; sweep `grep -n ':221' LOG.md` at baseline returns only line 1931).

Selftest control:

```
node scripts/check-selfassessment.mjs --selftest; echo EXIT=$?
```

Output: `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`, `EXIT=0`; 15 fixture cases + 2 refusal cases all PASS. m1 LOG cases present: `m1-log-stale-tally` (red), `m1-log-stale-then-corrected` (green, exact citation "supersedes LOG.md:6" — positive exact-citation control), `m1-log-wrong-number-correction` (red, cites :6 but wrong number), `m1-log-ambiguous-section-not-counted` (green). Inference: **no red unrelated-citation case exists** — no fixture asserts that an otherwise-correct correction citing a different line must retain the stale mismatch. C2 selftest target (red false-clear + green exact citation) is not met by the unchanged matcher.

## Install record

None (no tools installed/updated; pacman untouched).

## Risks / notes

- C2 "nonzero mismatch at tip" is currently satisfied by m3 (SCORECARD unlanded paths), not by LOG.md:221; the claim's failureCapable requires LOG.md:221 itself to surface once the loose supersession is tightened.
- A strict fix must keep `m1-log-stale-then-corrected` green (exact `:6` citation) and make the line-1931 note / line-254 paragraph insufficient to clear line 221.
- C1 fix must add revision field to receipt + red/green revision fixtures without breaking existing 5 cases or the current valid=true runtime verdict (control above).
