# Exec09 — C2 audit: LOG.md:221 false-clear and required citation behavior

Seat: Exec09 (leaf, item 9). Date: 2026-10-25. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline/tip measured: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (HEAD; `git rev-parse HEAD`).
Mode: audit-only. Files changed: none. Installs: none. No tooling channel used.

## 1. Frozen claim source

C2 text lives in `.ufo/waves/round-28/claims.json` line 12 (`:raw:11-12`; id `C2`, axis calibration, type counter accuracy correction).
Precise requirements extracted from that record:

- declared: repair `scripts/check-selfassessment.mjs` m1 supersession so **a correction only clears the exact stale tally it cites, not an unrelated later line/paragraph**.
- after: **LOG.md:221 appears as a mismatch unless an exact-line correction cites it**; selftest contains both red false-clear and green exact-citation cases.
- control: do-nothing control reproduces the known false-clear at LOG.md:221.
- killRule: if any unrelated correction still clears LOG.md:221, claim misses; **do not alter historical LOG prose or weaken existing matching rules**.
- failureCapable: selftest fixture with a correction citing another line must retain mismatch; exact-citation fixture must supersede.

Motivating defect evidence (independent): `corpus/lessons/round-27-verifier-spotcheck.md:15` — "its own finding at `LOG.md:221` says claimed 8, observed 12" (11 words) with `superseded=true`, while the counter reported `mismatches=0`, `clean=true`, `superseded=10`.

## 2. Defect reproduced at tip (observation)

Commands (run from lane root; rev = HEAD = frozen baseline):

```
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
```
→ `mismatches=1`, `clean=false`, `superseded=10`, `couldNotEvaluate=92`. The one counted mismatch is `m3-unlanded-paths` (observed 8; see §6). The LOG.md:221 finding is present and **false-cleared**:

```
class=m1-selftest-tally doc=LOG.md line=221 script=scripts/check-freshness.mjs
claimed=8 observed=12 superseded=true
lineText="  exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,"
```

Oracle check (observation): `node scripts/check-freshness.mjs --self-test` → `FRESHNESS_SELFTEST verdict=clean cases=12`, exit 0. So LOG.md:221 claims 8, oracle is 12 — a genuine stale tally that the current matcher clears via an unrelated citation.

## 3. Mechanism (code evidence)

`m1LogFindings` supersession predicate, `scripts/check-selfassessment.mjs:319-327`:

- (a) later paragraph names the same script (`SCRIPT_IN_TEXT`),
- (b) paragraph contains `/supersed|correct/i`,
- (c) paragraph contains `/:\d+/` — **any colon-number token, not the superseded line**,
- (d) `statedTallyNumbers(text).includes(f.observed)` (oracle-correct number in a tally shape).

The bug is (c): it never compares the cited line to `f.line`. The clearing paragraph at `LOG.md:1904-1925` (one paragraph; bullet block under `### C1 corrections`) names `scripts/check-freshness.mjs`, carries marker "Correction (supersedes", states `cases: 12`, and cites `:335` / `:391` — never `:221`. Quote (14 words): "Correction (supersedes LOG.md:335): the four-case figure quoted at :335 is not a `scripts/check-freshness.mjs` tally". It therefore clears the :221 finding as collateral.

The repo already records this exact defect (round-27 falsification): `LOG.md:1930-1931` — "the paragraph-level matcher accepts any colon-number token as the cited superseded line" (13 words); and `LOG.md:1931-1934` — "It therefore marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221 … so C1 is recorded failed, not met".

## 4. Required citation behavior (what the frozen claim demands)

The m1 LOG window spec in the checker header (`scripts/check-selfassessment.mjs:43-49`) already states the intended rule: a later paragraph clears an earlier stale mention only when it (a) names the same script, (b) carries a correction marker, (c) **cites the superseded line (:/LINE/)**, and (d) states the oracle-correct number via a tally shape. The implementation must make (c) exact:

1. Extract all `:\d+` tokens from the candidate paragraph (e.g. `/:\s*(\d+)/g`, stripped of `:`).
2. Clear finding `f` **only if** its line number `f.line` is among those cited tokens.
3. Keep (a), (b), (d) unchanged; keep "plain later claims never clear anything"; do not weaken any other matching rule; do not edit LOG prose.
4. Multiple citations in one paragraph are fine: each cited line may be cleared individually (e.g. `:1138`, `:1139`, `:1151` in one bullet).

## 5. Impact of tightening (prediction, inference from predicates + measured findings)

Current `superseded=10` findings, individually checked against every later paragraph's citations (observation via full JSON findings + LOG reads):

| Finding | Cleared by (citing) | Exact citation? |
|---|---|---|
| SCORECARD.md:410 (check-sources 25→26) | LOG/SC line 1192 `:410` | yes |
| SCORECARD.md:1138/1139/1151 (audit 12→13) | line 1193 `:1138`,`:1139`,`:1151` | yes |
| LOG.md:335 (freshness 4→12) | LOG 1904-1907 `:335` | yes |
| LOG.md:391 (freshness 4→12) | LOG 1908-1911 `:391` | yes |
| LOG.md:1090 (check-sources 66→26) | LOG 1912-1915 `:1090` | yes |
| LOG.md:1103 (check-sources 66→26) | LOG 1916-1919 `:1103` | yes |
| LOG.md:1664 (audit 12→13) | LOG 1853-1856 `:1664` | yes |
| **LOG.md:221 (freshness 8→12)** | LOG 1904-1925 `:335`,`:391` | **no — stays a mismatch** |

Expected post-fix state (inference): `superseded=9`, LOG.md:221 `superseded=false`, `mismatches=2` (m3 unlanded + LOG.md:221), `clean=false`. Exactly the claim's "after".

Negative sweep (observation): `grep` for `:\s*221\b|LOG\.md:\s*221|at\s+`?:\s*221` across the whole LOG.md yields only line 1931 (prose inside the falsification paragraph 1927-1938, which names no gate script and states no tally — cannot clear under any variant of the rule). No correction paragraph anywhere cites `:221`.

## 6. Selftest gap (claim target)

Current selftest (observation): `node scripts/check-selfassessment.mjs --selftest --json` → `cases=17`, `passed=17`, `ok=true`, exit 0.

Existing relevant cases in `CASES` (`scripts/check-selfassessment.mjs:443-597`):
- green exact citation: `m1-log-stale-then-corrected` — correction cites `LOG.md:6` and finding line is 6 (positive control already present);
- red wrong number: `m1-log-wrong-number-correction` — correction cites `LOG.md:6` but states 12 instead of oracle 13.

Missing (claim failureCapable): **red unrelated-citation case** — correction names same script, carries marker, states the oracle-correct number, but cites a different line (e.g. `LOG.md:99` while the finding is at line 6): must exit 1 with class `m1-selftest-tally` (retain mismatch). Adding this one case brings selftest to 18 and requires updating the header comment (`:8-9` says 17). No green case needs adding; the existing exact-citation control already covers it.

## 7. Notes / risks

- The SCORECARD window predicate (`m1Findings`, `:233-239`) also uses loose `/:\d+/`, but its shape differs (requires a *later correct finding line* with marker+citation). All four current scorecard clearances cite their own lines, so an exact-line tightening there would not flip any green; the frozen claim's target is the LOG window. Minimum change: `m1LogFindings` only.
- The m3-unlanded-path mismatch is incidental (untracked `.ufo/waves/round-28/` dispatch artifacts) and orthogonal to C2; the claim only requires LOG.md:221 to appear as a mismatch.
- Do not touch LOG.md history; verify the tightened rule still passes the existing 17 cases plus the new red case.

## 8. Handoff (verification for main agent)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-selfassessment.mjs --selftest --json        # >=18 cases, all pass
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
# expect: LOG.md line 221 superseded=false, mismatches=2, superseded=9
```
