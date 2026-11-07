# R81Critic — falsification, tabi round 81 w1

Observed state: lane HEAD `2f4b03ed` (D `a2183a93`, digests `5233f510`); scored receipt
`corpus/evidence/round81/chromium-showpicker/receipt.json` (nonce `tabi-r81-l1-a2183a933622`,
23:14:22–54Z); scored outputs `counter-a/battery-a/killpower-a`; `freeze.txt` at HEAD `a97a10fc`
(post-D rewrite). All runs below are read-only; the receipts are in
`.ufo/waves/round-81-seats/R81Critic/`.

## 1. C1 limit — the escape minimum is 17, and 17 escapes totally

The counter's `limit` block on the scored receipt prints, per prior,
`{priorEvents: 32, absNeed: 16, escapeEvents: 17}` (probe1 and probe2). The exact escape minimum is
**17 moved events** (32 − 16 + 1), not `absNeed = 16`.

Boundary test — probe1 with its identity rewritten to the scored values (nonce replaced everywhere:
send-log expressions, nav URLs, frameNavigated URLs, server logs; fresh driver sha, fixture sha, six
launch tokens, six devtools browser ids, six argv profile dirs):

- 16 events moved (`ts + 1000 ms`) → exit 1, only `replay-event-timeline`, `absMatched 16 >= absNeed 16`.
  `forged2-16.json` / `out2-16.json`.
- 17 events moved → exit 0, verdict clean, 56/56 checks, `absMatched 15 < absNeed 16`.
  `forged2-17.json` / `out2-17.json`.

The frozen limit sentence's first clause — "moves at least `absNeed(prior)` = ceil(0.5 * the prior's
own page-event count) event times of a prior escapes the replay rule" — is **off by one**: moving
`absNeed` = 16 is refused; the second clause (`N_p - absNeed + 1`) is correct and matches the printed
`escapeEvents`. The committed forgery control (identity fields only) fails **six** checks, not one:
`send-log-allowlist` and `cdp-event-log-closed` catch the un-rewritten nonce inside the send-log
expressions and nav URLs, `replay-launch-token` and `replay-devtools-url` catch the repeated
tokens/ids, `prior-set-complete` catches the walked-tree stray. The freeze note's "exits 1 on
`replay-event-timeline`" understates the counter's reach; the limit sentence's "rewrites the identity
fields" understates the rewrite surface (the nonce is embedded in every send-log expression, nav URL,
frameNavigated URL and server-log entry).

Remaining limit: the counter never hashes the driver or fixture bytes. `driverSha256` and
`fixture.sha256` are receipt fields compared to caller-supplied values (the fixture hash is circular —
the caller passes the receipt's own value). The only byte binding is `freeze.txt`, which no counter
reads and which was rewritten post-D (§5).

## 2. Axis — coverage, decided by the coverage row's "edge classes"

AXES.md, coverage row: **"Fraction of the domain's real surfaces the skill governs (repo paths,
tools, edge classes)"**. The five new legs are edge classes the skill did not govern: the non-exempt
cross-origin `SecurityError` (r80 measured the File/Color exemption), the origin-before-mutability
order (r80's disabled cross-origin leg was a *file* input throwing `InvalidStateError`), the
`webkitdirectory` answer expansion (r80 measured the trigger's `selectSingle`), the accept answer
non-filter (same), the click-while-open second chooser (r80 measured the programmatic double-open).
The learning-path sentence maps it: **"Expansion ↔ `coverage` + `adjacency`; quality ↔ `depth` +
`freshness` + `operability`."**

It is not quality work on the r80 instrument: the r81 receipt re-runs **no** r80 leg (the r80 receipt
is used only as the no-work control). A quality move would re-verify the same surfaces under a
tightened instrument; this adds surfaces. The r80 note's own "Frontier (named, not held)" names
exactly these five, and the stagnation nudge calls moving frontier ground into core a
frontier/capability move.

Strongest counterargument: the round's deliverable is a new driver/counter/battery/kill-power/selftest,
which is operability/depth work. But AXES.md's capability section says the axes measure what the skill
*knows*, not what it can *do*; a capability acquisition "still lands a per-axis verdict", and the
verdict here is coverage because the counted content is the new edge classes. The naming holds.

## 3. No-work control — right reasons plus one artifact; zero legs pass

`nowork.json`: exit 1, 57 checks, 30 findings, 27 passes. The 30 failures are 29 substantive
(`schema`, `nonce-shape`, `nonce-expected`, `driver-pin`, `fixture-hash`, `plan-frozen`, `leg-order`,
`leg-records`, `context-binding`, `send-log-allowlist`, `plan-calls`, `cdp-event-log-closed`, the
seven `leg-sp80-*` checks, `gesture-law`, `activation-law`, `cross-origin-nonfile-law`, `order-law`,
`webkitdirectory-answer-law`, `accept-answer-law`, `click-while-open-law`, `no-selection-law`,
`intercept-law`, `fixture-descriptors`) and **one artifact**: `prior-set-complete`, which names a stray
r81 receipt in the walked tree — probe2 at freeze time, the scored receipt now. The artifact would
fail even for a perfect r81 receipt (the forgery control shows the same finding), so the control's
exit 1 is over-determined.

A do-nothing round passes **zero legs**: all seven `leg-sp80-*` checks fail, and the six sp81 leg
checks are never created (57 checks instead of 56). The 27 passes are instrument-generic (lane, host,
ports, frame tree, marks, event shape/quantum/window, seq, mode/cancel/dismiss/trust, argv, devtools,
teardown, server logs, run window, replay launch/devtools, prior-set exempt/unparsable); none is a leg
or a law.

Smallest safe correction: run the control with the scored receipt as `--prior` (or
`--tree-exempt-sha256`) so `prior-set-complete` is not the artifact; the substantive count is 29, and
the frozen "30 findings" number is bound to the freeze-time tree, not to the control's subject.

## 4. C2 — the counter counts the claim for 8 of 12; 4 are direction-blind

Live lane: exit 0, 12 claims, 0 mismatches; the scratch copy reproduces 0. Stale-removal is caught:
removing `DOM.setInputFiles` from SCORECARD → exit 1 (`capability-typo`); removing "five self claims"
from the lesson → exit 1 (`control-count`).

Reversed corrections pass (exit 0, 0 mismatches):

- `gate-quote-counts`: lesson says S220 is 7 words and S221 is 14 — false, passes (`drift-v1.json`).
- `capability-typo`: lesson says the stale was `DOM.setFileInputFiles` and the correction is
  `DOM.setInputFiles` — backwards, passes (`drift-v2.json`).
- `control-count`: lesson says the true count is five — contradicts the six, passes (`drift-v6.json`).
- `landed-d10`: lesson says D10 was not landed — false, passes (`drift-v4.json`).
- `d9-nonce-sweep`: the "named" requirement is satisfied by the four bare words "scorecard log skill
  note" (the fallback is `lesson.includes(recordName)`), so the correction table need not name the
  record (`drift-v5.json`).

Truth-bound claims (8 of 12): `end-census-green` (exit codes), `dead-c1-nowork` (findings),
`dead-cold-runs` (path existence), `claims-annotation` (r80 battery/killpower numbers),
`battery-binding` (receipt sha), `r81-identity` (claims.json nonce/D), `r81-numbers` (scored outputs).
The counter reads the **working tree**, not the committed bytes; an uncommitted edit satisfies it. It
does not read `freeze.txt`, so the post-D freeze rewrite is invisible to C2.

The identity leg's second half is dead code: `corrected` is computed and never used in the claim;
`wrong.length === 0` means any superseded citation in the records fails outright, so "every superseded
citation is named in the lesson's correction table" has no path to green.

C2 completeness: the 12 claims do not cover the r81 frozen claims' own consistency. Two frozen-claim
defects are uncorrected and uncounted: (a) leg (c) says "run with the frozen arguments of
`run-scored-r81.sh`" — `scripts/run-scored-r81.sh` does not exist; (b) leg (c) requires
"`coverage.unknown []`" — the committed `battery-a.json` has
`unknown = ["order-law-message","activation-before","cross-nonfile-chooser","cross-nonfile-result"]`.
The assignment's predicate (c) states only `uncovered []`, so (b) is a claims-vs-assignment mismatch
the L1 must rule on; (a) is a dead pointer of the r80 spot-check's own class.

## 5. Freeze integrity — the freeze was rewritten post-D

Commits `86cd811a` and `2f4b03ed` re-pin the freeze: prior-set `1275fa1f` → `5f8becd3` (probe2
added), battery `6964de6f` → `f7c423c1` (mirror-path fix), `freeze.txt` rewritten (HEAD `a97a10fc`)
with a repair note. The lesson records both repairs; the R81Exec1 ledger records the file changing
under the wave (MISMATCH line 17). The frozen claims were not edited after the digests commit
(`git diff 5233f510 HEAD -- claims.json` is empty).

- The D-frozen prior set (probe1 only) makes the scored receipt fail `prior-set-complete` on probe2
  (`scored-D.json`: exit 1, only that finding). The R81Exec1 ledger line 55 already shows the frozen
  one-line set + `--prior probe2` is clean 56, so the smallest safe correction is to keep the D bytes
  and pass `--prior probe2` (the assignment's counting command template allows it), not to amend the
  prior set and rewrite the freeze.
- The battery repair happened **after** the scored receipt (receipt 23:14:22–54Z; battery script
  23:15:25; battery output 23:15:28). The frozen claims' kill rule: "any of (a)-(d) false as frozen ->
  C1 NOT verified (honest stop); no leg is re-scoped after a scored run". The frozen battery
  (`6964de6f`) does not pass the mirror cases; the scored battery is the repaired instrument's. The
  lesson records the repair, but the frozen kill rule's condition is met; the L1 must rule whether a
  harness bug fix is a re-scope.
- The selftest's `pins-match-freeze` gate passes on HEAD because it reads the rewritten `freeze.txt`;
  it cannot detect a post-D instrument change. The only anchor is the committed bytes at D
  (`git show a2183a93:...`), which no gate reads. The C2 counter does not read `freeze.txt` at all.
- Cold-run binding: `scored/cold-runs.txt` lists counter outputs, not receipts; the score files do
  not record the receipt nonce (the mapping is in the R81Exec1 ledger). The four cold receipts
  (`cold1..4.json`, nonces `tabi-r81-cold1..4-a2183a933622`) exist and score clean, but the index
  alone cannot prove "with that receipt's own nonce".

## Impacted axes

- **C1 coverage**: (a) clean only under the amended prior set; (c) false as frozen on
  `coverage.unknown []`; the battery is the repaired instrument's; the limit sentence is off by one.
  The coverage move itself is real — the new edge classes are measured.
- **C2 calibration**: 5 of 12 claims are direction-blind; the freeze rewrite and the two frozen-claim
  defects are uncounted. The C2 number (0 mismatches) is true and insufficient.
- The axis naming (coverage) is correct; no axis is harmed by the naming.

## Smallest safe corrections

1. Record the limit sentence's off-by-one as an erratum (the printed `escapeEvents 17` is right; the
   prose first clause says 16); do not edit the frozen claim.
2. Revert `prior-set.txt` / `freeze.txt` to D and pass `--prior probe2` for the scored and cold counts
   (proven clean in the R81Exec1 ledger); or have the operator rule on the freeze rewrite.
3. Commit the frozen battery's output on the (a) receipt (even if failing) and record the mirror-path
   failure, or have the operator rule that the harness fix is not a re-scope. Re-pinning the freeze to
   the repaired script makes the pin self-referential.
4. Make the four direction-blind C2 claims directional (assert the stale and corrected values in their
   columns, not token presence), require the d9 record name adjacent to its citation, bind the counter
   to the committed bytes at D and to `freeze.txt`, and add the two uncounted frozen-claim checks
   (`run-scored-r81.sh` exists; battery `coverage.unknown` matches the claim).
5. Run the no-work control with the scored receipt as `--prior` so `prior-set-complete` is not the
   artifact; the substantive count is 29, zero legs.
