# c1-refusal-arithmetic — derived ground truth, round 22 @ a89f1935f523a64b00991d792fca6a8c0d321948

**Verdict:** the filed `23` matches no defensible derivation — narrow W2 scope derives **13**, the W2+W2b umbrella **24**, a second committed surface asserts **14**; round 22 trips under every reading, and a green fixture stays green only if scope is pinned.

## 1. Derived figures (lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`)

```
R=a89f1935f523a64b00991d792fca6a8c0d321948
git ls-tree -r --name-only $R -- .ufo/waves/round-22 | grep -cE '^\.ufo/waves/round-22/w2-cap-refusal-'     # 13
git ls-tree -r --name-only $R -- .ufo/waves/round-22 | grep -cE '^\.ufo/waves/round-22/w2b-cap-refusal-'    # 11
git ls-tree -r --name-only $R -- .ufo/waves/round-22 | grep -cE '^\.ufo/waves/round-22/w2[ab]?-cap-refusal-' # 24
git ls-tree -r --name-only $R -- .ufo/waves/round-22|grep -E 'w2-cap-refusal-' |grep -oE 'refusal-[0-9]+'|grep -oE '[0-9]+'|sort -n
#   -> 01 02 03 04 05 06 07 08 09 11 12 13 14      13 receipts; attempt 10 absent
git ls-tree -r --name-only $R -- .ufo/waves/round-22|grep -E 'w2b-cap-refusal-'|grep -oE 'refusal-[0-9]+'|grep -oE '[0-9]+'|sort -n
#   -> 01 02 03 04 05 06 07 08 09 10 11            11 receipts, contiguous
for f in $(git ls-tree -r --name-only $R -- .ufo/waves/round-22|grep -E 'w2-cap-refusal-'); do git show $R:$f \
  | grep -oE 'TabiR22[^:]*: Background'|sed 's/: Background//'|sort -u|wc -l; done|sort -u                # 64/receipt
#   w2b variant: 'w2b-cap-refusal-' + 'TabiR22-2[^:]*: Background'                                          # 65/receipt
git show $R:.ufo/waves/round-22/w2b-spawn-result.json | grep -o '"attempt": [0-9]*'                       # "attempt": 12
git grep -o 'Background job limit reached (100)' $R -- .ufo/waves/round-22 | wc -l                        # 2191
git ls-tree -r --name-only $R -- .ufo/waves/round-21 | grep -ci 'cap-refusal'                             # 0
```

Figures: **13** W2 receipts (832 clauses = 13×64) + **11** W2b (715 = 11×65) = **24** derived refusals, each refusing all 64 / 65 seats; W2 attempt 10 absent, documented only in `w2-cap-refusal-11.json` key `note`; one payload digest per wave (`070e13cd…` W2, `d81e11a1…` W2b).
Prose: `grep -c '23 whole-payload' SCORECARD.md corpus/lessons/round-22.md LOG.md` → `1`,`1`,`1` (`SCORECARD.md:1111`, `corpus/lessons/round-22.md:130`, `LOG.md:1584`; no committed round-22 report md exists at the rev).
Contradicting figure: `grep -rn '14 whole-payload\|14 cap refusals' .ufo/waves/round-22` → 16 line-occurrences in 9 files (`w2b-spec.json:3`, `w2b-validation.json` taskCall context, `w2b-spawn-result.json`, 3 `w2b/*.md`).

## 2. Minimal deterministic detection rule (committed bytes only)

```
RECEIPT := /^\.ufo\/waves\/round-<N>\/(w2[a-z]?)-cap-refusal-(\d{2})\.json$/
for each wave series w in the round dir:
  att := sorted attempts; assert parse(receipt).attempt == filename index
  assert |distinct taskPayloadSha256 in w| == 1 ; assert all spawnedSeats == 0
  seats := distinctSeatNames(first receipt)                   # 64 / 65
  assert distinctSeatNames(r) == seats for every r            # whole-payload, not partial
  for g in [1..max(att)] \ att: assert a receipt note names g # gap must be documented in bytes
derived[w] := |att_w| ; derived_total := Σ_w derived[w]
for p in [SCORECARD.md, corpus/lessons/round-<N>.md, LOG.md]:
  for m in matches(/(\d+)\s+whole-payload/, p):
    scope  := wave token in same sentence ("W2b"→w2b, "W2"→w2 series, "total"→umbrella)
    expect := derived_total if umbrella else derived[scope]
    if m.n != expect: finding{c1, cited:"<p>:<line>", derived:expect,
                              evidence:{asserted:m.n, receipts, seats}}
```
Fail-closed: a prose site naming a wave with zero receipts under it is a finding, not a skip.

## 3. Fixtures (case objects the script builds; it never reads an expectation file)

- **RED** — `maxLanes:3`; `w2-cap-refusal-01/02/03.json`, each `{attempt:n, spawnedSeats:0, taskPayloadSha256:"A"*64, result.text:"<3 seat names, suffixed -n>: Background job limit reached (100)…"}`; prose `"W2 3 validated, 0 spawned (2 whole-payload cap refusals)"` → derived 3 ≠ 2 → trips. Variant, prose `3`: receipt 02 lists only 2 seat names → whole-payload invariant fails → trips, proving the class is not prose-only.
- **GREEN** — same three receipts, each naming 3 seats, one sha, `spawnedSeats:0`, no gap; prose
  `"W2 3 validated, 0 spawned (3 whole-payload cap refusals)"` → clears.

## 4. Brittleness, named rather than smoothed

1. **Scope carries the ambiguity** — `23` is −10 against the narrow scope (13; the glob the lesson itself cites, `w2-*`, does not match `w2b-*`) and −1 against the umbrella (24). Both trip, so round 22 is robust; a green fixture is not unless "same-sentence wave token" is normative.
2. **Content counting explodes** — 2191 message occurrences over 35 files, and `w2-capacity-events.json` carries one for a **slot-acquire** refusal (15:38:07Z), not a payload: any `grep -l` rule overcounts.
3. **Wrapper duplication defeats hash dedup** — 34 files hold 24 distinct `text` payloads; `w2-spawn-result.json` is itself a refusal envelope without `attempt`, and the nine `w2-attemptNN-result.json` files repeat `w2-cap-refusal-NN.json` verbatim (`text` sha `a973cdd2591d95…` both ways for attempt 2; `5c3dbd37ce405a…` spawn-result vs refusal-01). All 34 file blobs differ, so dedup must be by (wave, attempt) or seat-name set. `13 + 9 + 1 = 23` is exactly the W2-line file-family sum — the likeliest provenance of the filed figure **[INFERENCE, unproven]**; it double-counts attempt 11.
4. **`grep -c` counts lines, not refusals** — 1 per receipt only because each `text` is one line; pretty-printing a receipt silently changes the derived number.
5. **Seat names are attempt-suffixed** (`TabiR22-2.Outcome01-2`), so cross-receipt name dedup undercounts.
6. **The gap is out-of-band** — attempt 10 survives only as a `note` string: gap-blind rules miss the 14-vs-13 overstatement, gap-strict rules flag round 22 for the wrong reason.
7. **Attempt namespaces restart** — W2b receipts restart at 1 while its spawn-result records 12; a global namespace double-counts or invents gaps.
8. **Assertion echoes inflate findings** — the `w2b` spec `context` sentence is echoed into seat prompts and report quotes (16 line-occurrences / 9 files); dedup findings by normalized sentence.
