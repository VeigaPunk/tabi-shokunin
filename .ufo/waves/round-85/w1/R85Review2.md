# R85Review2 — C2 family-case audit (r85 battery witnesses)

Seat R85Review2, round 85, wave w1. Read-only; nothing committed. All measurements below were
taken against the **frozen** lane state: counter `check-showpicker-r85.mjs` sha256
`6239abdf…d318a`, battery `negatives-showpicker-r85.mjs` sha256 `b58b90c9…03496` (both match
`freeze.txt`), receipt `corpus/evidence/round85/chromium-showpicker/receipt.json` nonce
`tabi-r85-l1-dbecb1a18905` (the 07:31 run, recovered from scratch after the live lane file was
overwritten, see §5). Runs were done via a scratch mirror of the lane under
`/fast/scratch/hyaku/tabi-r85/R85Review2` (deleted at seat end) so the counter's prior-set walk
did not trip on sibling-seat artifacts.

## 1. Per-case counter findings (measured)

For each of the six `cross-tel-*` cases I rebuilt the exact receipt mutation from
`negatives-showpicker-r85.mjs:238-243` on the frozen receipt and ran the frozen counter by path
with the frozen pins. **Every case produces exactly one finding id — the named law id — and no
other id.** `alsoAllowed` on all six is empty (declared at the `add(...)` call, no fourth-arg
list), so nothing is hidden by declaration either.

| case | mutation (tel leg `sp84-cross-origin-tel`) | counter finding-id list | exit |
|---|---|---|---|
| `cross-tel-message-unpinned` | `childResult.message = 'SecurityError'` | `["sp84-cross-origin-tel-law"]` | 1 |
| `cross-tel-childlate` | `childLate = 1` | `["sp84-cross-origin-tel-law"]` | 1 |
| `cross-tel-crossaccess` | `parentCrossAccess = {contentDocument:'object', windowDocument:'SecurityError'}` | `["sp84-cross-origin-tel-law"]` | 1 |
| `cross-tel-childseq` | `childEvents[0].target = 'go13'` | `["sp84-cross-origin-tel-law"]` | 1 |
| `cross-tel-childact-after` | `childActivationAfter = {isActive:false,hasBeenActive:true}` | `["sp84-cross-origin-tel-law"]` | 1 |
| `cross-tel-childact-before` | `childActivationBefore = {isActive:true,hasBeenActive:true}` | `["sp84-cross-origin-tel-law"]` | 1 |

Baseline (unmutated frozen receipt): exit 0, `verdict clean`, `checkCount 87`, no findings.
Identity no-op control (`mutate(r)=>{}`): exit 0, clean — confirms the recovery receipt and pins
were sound, so none of the six is a vacuous no-op.

## 2. Collateral check (load-bearing id)

For one case in full — `cross-tel-childseq` — the complete false-check list from the counter
output is exactly `["sp84-cross-origin-tel-law"]`; `leg-sp84-cross-origin-tel`, `leg-marks` and
`no-selection-law` all remain `true`. The same three hold for all other five. **No case passes
because of a collateral check; each fails for its named law id, which is also the sole failing
check.** The two pre-existing duplicates were re-run the same way and likewise produce only
their own law id (`cross-origin-tel-message` → `sp84-cross-origin-tel-law`;
`cross-origin-text-late` → `sp84-cross-origin-text-law`;
`cross-origin-search-activation` → `sp84-cross-origin-search-law`).

**One case "cannot fail for its stated reason" as a uniqueness claim:** `cross-tel-message-unpinned`
is byte-for-byte the same receipt mutation as the pre-existing `cross-origin-tel-message` case
(`negatives-showpicker-r85.mjs:174` — same field, same value; I diffed the two produced
receipts, identical). The new case is a *duplicate witness*, not an independent trigger. It
still kills its family (see §3), but the r85 battery had already covered that exact mutation
before this round; the honest novelty for the message family is nil as a case, only as a label.

## 3. Causal test: weakened counter vs full battery vs battery-minus-six

I applied each of the six C2 family weakenings (from `witness-families-r85.mjs:42-47`, strings
verified to each occur exactly once in the frozen r85 counter) to a scratch copy of the frozen
counter, then ran (a) the full frozen battery (175 cases) and (b) the same battery with exactly
the six `cross-tel-*` add-lines deleted (169 cases). Controls: pristine counter exits 0 on both
(full: 175 cases, 0 failed, coverage 87/87; trimmed: 169 cases, 0 failed, 87/87).

| family | full battery (mutant counter) | failing cases | trimmed battery (mutant counter) | trimmed exit |
|---|---|---|---|---|
| `cross-message-unpinned` | exit 1, 175 cases, 2 failed | `cross-tel-message-unpinned`, `cross-origin-tel-message` | exit 1, 169 cases, 1 failed | **killed without the six** |
| `cross-childlate-dropped` | exit 1, 175 cases, 2 failed | `cross-tel-childlate`, `cross-origin-text-late` | exit 1, 169 cases, 1 failed | **killed** |
| `cross-access-dropped` | exit 1, 175 cases, 1 failed | `cross-tel-crossaccess` only | exit 0, 169 cases, 0 failed | **survives without the six** |
| `cross-childseq-dropped` | exit 1, 175 cases, 1 failed | `cross-tel-childseq` only | exit 0, 169 cases, 0 failed | **survives** |
| `cross-childact-after-dropped` | exit 1, 175 cases, 2 failed | `cross-tel-childact-after`, `cross-origin-search-activation` | exit 1, 169 cases, 1 failed | **killed** |
| `cross-childact-before-dropped` | exit 1, 175 cases, 1 failed | `cross-tel-childact-before` only | exit 0, 169 cases, 0 failed | **survives** |

All six weakened counters also score the *honest* receipt clean (exit 0, no findings), so they
are true weakenings, not counter-breaking self-catches.

**Causal counts: 3 of 6 families survive without the six new cases** (`cross-access-dropped`,
`cross-childseq-dropped`, `cross-childact-before-dropped` — survivors 3/6). The other 3 are
killed independently by pre-existing cases that duplicate the same conjunct on a sibling leg:
`cross-message-unpinned` by `cross-origin-tel-message` (the byte-identical old case),
`cross-childlate-dropped` by `cross-origin-text-late` (text leg, `.childLate=1`),
`cross-childact-after-dropped` by `cross-origin-search-activation` (search leg).

## 4. Answers to the assigned questions

1. **Counter finding-id lists / `alsoAllowed` hiding:** all six produce the single id
   `sp84-cross-origin-tel-law`; `alsoAllowed` is declared empty on all six and nothing extra was
   emitted, so no case hides an id that could pass alone.
2. **Collateral vs named law:** no case passes by collateral. Full id list for `cross-tel-childseq`
   (shown in full above): `["sp84-cross-origin-tel-law"]` — the named law is the load-bearing
   (and only) failing check in all six.
3. **No-op:** none. Every case changes the receipt and flips exactly its named check.
4. **Causal:** deleting the six from the battery leaves **3 families surviving**
   (`access`, `childseq`, `childact-before`); the six new witnesses are causally load-bearing for
   exactly those three, redundant-but-consistent for the other three.

## 5. Methodology caveats (load-bearing for the numbers)

- **Frozen receipt recovery.** The live lane path
  `corpus/evidence/round85/chromium-showpicker/receipt.json` was overwritten *during* my
  session (a sibling seat's live run, nonce `tabi-r85-l1-620623a43f74`, `finishedAt: null`,
  unfinished). Every early run I did used the then-present file, whose nonce was the frozen
  `tabi-r85-l1-dbecb1a18905` and which scored clean at 87. I recovered those exact bytes from
  my own scratch `baseline.json` (sha256 `d5b1cb25…`, 373473 bytes, 07:31 timestamps) and
  re-ran the causal matrix against a scratch mirror lane containing only those bytes plus
  `killpower-a.json` removed (a 0-byte live file that would poison `prior-set-unparsable`).
  Controls re-verified clean (175/0/87-87 and 169/0/87-87) before the family runs. Two
  intermediate runs in this seat (one "trimmed LTS" pass, one non-mirrored causal pass) are
  **discarded**: they ran against the live mutated tree and produced whole-battery false
  failures (173/175) caused by the half-written live receipt tripping `prior-set-*` on every
  case, not by the mutants. The numbers in §1–§3 come only from the mirrored reruns.
- **Not in scope / not re-run:** true BEFORE (r84) survivor counts were not re-measured
  (the r84 battery was not re-run by me); the r84 half is statically confirmed — the frozen
  r84 battery has no tel-leg law mutation for `childLate`/`parentCrossAccess`/child-events/
  `childActivationBefore` (only `cross-origin-tel-law` overriding `childResult` and
  `cross-origin-tel-message`), and R84Mut1 §5 lists P4/P5/P6/P8 as survivors with the same
  witness shapes. I did not measure `before=3` myself.
- **Generalisation limit:** a killed family means the battery notices *that one weakened
  conjunct on the tel leg*, not conjunct-completeness across all cross-origin legs (cf. C2
  `limit` in `claims.json`). The r85 battery exercises each of the six conjuncts for tel (new),
  plus message/activation-after/late on sibling legs (old) — there is still no single-leg case
  for `childseq`/`crossaccess`/`childact-before` on any other leg.

## 6. Finding for the integrator (attack on C2's strongest leg)

C2 leg (b) — "the six case ids exist and each kills exactly its family" — is **overstated for
three of the six**. `cross-tel-message-unpinned`, `cross-tel-childlate` and
`cross-tel-childact-after` each kill a family the *frozen* battery already killed without them
(demonstrated causally above: full-vs-trimmed × mutant counter). Their kill attribution is
therefore not "exactly its family" by those new cases alone; the families were already dead
under the old battery via sibling-leg duplicates (one of them a literal byte-duplicate).
Only `cross-tel-crossaccess`, `cross-tel-childseq` and `cross-tel-childact-before` are
solely load-bearing. This does not falsify the C2 predicate's numeric legs (before 3 → after 0
stands on the measured data I took), but any "each new case kills its family" wording is wrong
for half the set and should be narrowed to the three solely-load-bearing witnesses.
