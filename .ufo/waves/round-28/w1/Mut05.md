# Mut05 — C2 matcher mutation test (round-28 wave 1)

- Seat: Mut05 / item 53 (godspeed).
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (HEAD `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`, `git rev-parse HEAD` on 2026-10-25).
- Frozen claims: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (C2: "LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest contains both red false-clear and green exact citation cases").
- Scratch: `.ufo/waves/round-28/scratch/mut05/` (isolated copy of `scripts/check-selfassessment.mjs`); report trailer: `.ufo/waves/round-28/w1/Mut05.md` (relative to lane root).
- Fixtures: mktemp git repos `/tmp/mut05-fixture-8XVx` and `/tmp/mut05-fx2-*` (scratch; created by this tester, verified root before commit).

## Target of mutation

`scripts/check-selfassessment.mjs` `m1LogFindings` LOG.md supersession predicate (lines 319-327 at baseline):

```
f.superseded = paras.some((p) => {
  if (p.start <= f.line) return false;
  const text = p.lines.join("\n");
  const namesScript = [...text.matchAll(SCRIPT_IN_TEXT)].some((m) => m[1].replace(/^\.\//, "") === f.script);
  return namesScript &&
    /supersed|correct/i.test(text) &&
    /:\d+/.test(text) &&
    statedTallyNumbers(text).includes(f.observed);
});
```

The citation test is line 325: `/:\d+/.test(text)`. It accepts **any** `:<digit>` token in the correction paragraph, not the exact stale line. This is the known defect: `corpus/lessons/round-27-verifier-spotcheck.md:15` — "that paragraph does not cite line 221, violating frozen supersession rule. **Claim failed; calibration harmed** (the claimed result is a false clear)." Quotes above are ≤25 words and located.

## Detectors

1. Shipped gate selftest: `node check-selfassessment.mjs --selftest` (17 isolated cases; clean = exit 0, 17/17 passed).
2. Discriminating fixture (mktemp repo `/tmp/mut05-fixture-8XVx`): stale LOG.md tally at line 6 (`claimed=12`, observed 13 → mismatch) followed by paragraph 8: `Correction (supersedes LOG.md:99): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip.` — a correction citing an **unrelated** line (LOG.md:99, not 6). Detector: `node check-selfassessment.mjs --repo <fix> --rev HEAD [--json]`.
3. Positive control fixture (`/tmp/mut05-fx2-*`): same stale tally but correction cites the exact line (`supersedes LOG.md:6`).

Expected (C2 contract): detector 2 must report `mismatches=1`, `superseded=0`, exit 1 (unrelated citation must NOT clear). Detector 3 must stay clean (exact citation clears). Detector 1 must contain a red unrelated-citation case; it does not today.

## Runs (before → mutated → restored)

| Bytes | sha256 | Detector | Output | Verdict |
|---|---|---|---|---|
| Pristine (baseline copy) | `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` | selftest | `verdict=clean cases=17 passed=17` exit 0 | baseline |
| Pristine | same | unrelated-citation fixture | `FINDING class=m1-selftest-tally doc=LOG.md line=6 claimed=12 observed=13 superseded`; `verdict=clean mismatches=0 superseded=1` exit 0 | **surviving defect (false-clear) on pristine bytes** |
| Pristine | same | exact-citation control | `verdict=clean mismatches=0 superseded=1` exit 0 | control passes |
| **Mutant A** — citation requirement deleted (line 325 removed), hash `42b1e46a6828ce7b215f00c0546c60bc9c72226bae428fc94e2fc25a6f7cf74a` | selftest | `verdict=clean cases=17 passed=17` exit 0 | **survived** (no red unrelated case) |
| Mutant A | same | unrelated-citation fixture | `verdict=clean mismatches=0 superseded=1` exit 0 | wrong (clears unrelated) |
| **Mutant B** — citation broadened to any digit (`/\d+/.test(text)`), hash `f0775c6c1b51f1c230e02d86b035ca671a0767d2a49010618c02024631e94ec7` | selftest | `verdict=clean cases=17 passed=17` exit 0 | **survived** |
| Mutant B | same | unrelated-citation fixture | `verdict=clean mismatches=0 superseded=1` exit 0 | wrong (clears unrelated) |
| Mutant B | same | exact-citation control | `verdict=clean mismatches=0 superseded=1` exit 0 | control still green |
| Restored | `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` | `diff -q` vs lane copy | identical | restored |

## Findings

- **Observation:** pristine matcher false-clears a stale LOG.md tally on an unrelated-line citation: `LOG.md:99` satisfied `/:\d+/` and marked `LOG.md:6` `superseded` → `mismatches=0`, exit 0. This reproduces the round-27 spot-check defect at `corpus/lessons/round-27-verifier-spotcheck.md:15-17`.
- **Observation:** both mutants (citation optional; any-digit citation) survive the shipped selftest — `verdict=clean cases=17 passed=17`, exit 0. The suite contains no red unrelated-citation case (negative claim swept: all 17 case ids listed in output; none named unrelated-citation; `grep` names in CASES at lines 443-597).
- **Observation:** both mutants still false-clear on the unrelated-citation fixture; exact-citation control stays green under both (matcher regression surface is invisible to the suite).
- **Inference:** `--selftest` as shipped is not a killing test for C2 matcher mutations removing or broadening the citation requirement. The C2 selftest target ("red unrelated-citation case") is not yet present at baseline.
- **Unknown:** none for the mutation probes; full `--rev` runtime behavior at lane tip under `ef8aa4...` was not re-run (not needed for this probe).

## Restoration evidence

Scratch copy restored to exact pristine bytes: final `sha256sum` `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab` equals baseline; `diff -q` reports identical to `scripts/check-selfassessment.mjs`. Lane git status after all work: only untracked `.ufo/waves/round-28/`; `NO_CHANGES_OUTSIDE_WAVE_DIR` (sweep of `git status --porcelain`). No tracked lane files touched; no installs performed (PACMAN PAUSED, none needed).

## Verdict

- Mutant A (citation optional): **survived** selftest; **killed** only by the discriminating fixture (which the suite lacks). Demonstrates the C2 defect class.
- Mutant B (accept unrelated line / any digit): **survived** selftest; wrong on fixture. Underlines that the shipped suite cannot tell apart a correct exact-citation matcher from one accepting arbitrary numbers.
- Coverage finding: the selftest set lacks any red case where a correction cites a line other than the stale one; the C2 "red unrelated-citation case" is exactly the missing mutation-killing test.

Quotes and numbers above are each backed by the commands recorded in this report; observations vs inference labeled.
