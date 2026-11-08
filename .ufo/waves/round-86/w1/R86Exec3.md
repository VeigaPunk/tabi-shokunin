# R86Exec3 — C2 operability (witness families) + do-nothing controls

Seat: R86Exec3 (leaf, godspeed). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Scope: witness families before/after, both do-nothing controls re-run, one hand-reproduced
C2 before-state cell (narrow-tel-childseq). No commits; scratch removed before yield.
No tool installs (node 24.21.0 used as-is).

## 0. Axes / pins

Axes: (1) operability — before/after survivor counts; (2) calibration — control fidelity.
Instrument pins re-verified with sha256sum, all 7 match `.ufo/waves/round-86/freeze.txt` exactly:
driver 5a435da6…313d, counter a41fab46…70a, battery b7ddaf7b…aec, kill-power ddc4102d…1d2,
selftest b53423bf…0ba3, drift 2aecdf99…c1c3, witnesses 5471404b…5dae9.

## 1. Witness families (assignment 1)

Command: `node scripts/witness-families-r86.mjs --lane <lane> --work /fast/scratch/hyaku/tabi-r86/R86Exec3/w --json`
→ exit 0. Full JSON saved to scratch before cleanup (scratch removed at end; the scored
copy should come from this stdout if TabiR86 wants it). Measured:

- **before: 12 families, survivors = [narrow-tel-crossaccess, narrow-tel-childseq,
  narrow-tel-childact-before] (3), killed 9, crashed [], unapplied [].**
- **after: survivors = [] (0), killed 12, crashed [], unapplied [].**

Per-generation outcomes (family / generation / outcome / failed / firstFailure):

| family | before | after |
|---|---|---|
| cross-message-unpinned | killed 2 (cross-origin-tel-message) | killed 4 (cross-origin-tel-message) |
| cross-childlate-dropped | killed 2 (cross-origin-text-late) | killed 4 (cross-origin-text-late) |
| cross-access-dropped | killed 1 (cross-tel-crossaccess) | killed 3 (cross-tel-crossaccess) |
| cross-childseq-dropped | killed 1 (cross-tel-childseq) | killed 3 (cross-tel-childseq) |
| cross-childact-after-dropped | killed 2 (cross-origin-search-activation) | killed 4 (cross-origin-search-activation) |
| cross-childact-before-dropped | killed 1 (cross-tel-childact-before) | killed 3 (cross-tel-childact-before) |
| narrow-tel-message | killed 8 (cross-origin-number-law) | killed 10 (cross-origin-number-law) |
| narrow-tel-childlate | killed 1 (cross-origin-text-late) | killed 3 (cross-origin-text-late) |
| narrow-tel-crossaccess | SURVIVED (175 cases, 0 failed) | killed 2 (cross-search-crossaccess-dropped) |
| narrow-tel-childseq | SURVIVED (175 cases, 0 failed) | killed 2 (cross-search-childseq-dropped) |
| narrow-tel-childact-after | killed 1 (cross-origin-search-activation) | killed 3 (cross-origin-search-activation) |
| narrow-tel-childact-before | SURVIVED (175 cases, 0 failed) | killed 2 (cross-search-childact-before-dropped) |

This matches the frozen C2 predicate exactly: before.survivors = 3 (the frozen names),
after.survivors = 0, and the exit-0 rule `after.survivors==0 && before.survivors>=1` holds
(before.survivors is exactly 3, the frozen kill-rule value).

**witness-a.json note:** the scored file
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-86/scored/witness-a.json` is
0 bytes right now (empty, created presumably as a placeholder — it is inside the
prior-set-complete walk trees, but carries no schema so the walk ignores it). I did not write
to it (scored/ output is the L1's to fill). To compare, TabiR86 should capture my stdout
above into witness-a.json; the scratch copy was deleted per lane rules.

## 2. Do-nothing controls re-run (assignment 2)

### (a) r85 scored receipt under the r86 counter → frozen `nowork-r85-under-r86.json`

Receipt: `corpus/evidence/round85/chromium-showpicker/receipt.json` (r85 nonce
tabi-r85-l1-620623a43f74, driver 1690c63d…, fixture 0b012937…). Frozen file records
treeExemptSha256 = [] — but with no exemption the tree walk sees the *live* r86 scored
receipt and `prior-set-complete` fires (see mechanism note below). The exact reproduction
is therefore the r85-generation pins plus the r86 receipt exempted by content hash, which is
the honest configuration the frozen file encodes (its findings all pass over that).

| run | pins | exempt | exit | verdict / checkCount / findings |
|---|---|---|---|---|
| mine #1 | r86 gen | none | 1 | findings / 89 / 43 (adds nonce-expected, driver-pin, fixture-hash, prior-set-complete) |
| mine #2 | r85 gen | none | 1 | findings / 89 / 40 (adds prior-set-complete) |
| **mine #3** | **r85 gen** | **r86 receipt sha** | **1** | **findings / 89 / 39 — byte-exact match on checks + finding ids + details** |
| frozen | (r85 gen) | — | 1 | findings / 89 / 39 |

Mine #3 finding ids (39): schema, nonce-shape, plan-frozen, leg-order, leg-records,
plan-calls, then 30 leg-prefixed findings (24 r84/r85 legs as `leg-<name>` plus 6
same-origin activated legs), then the order-law family ids through leg-sp85-*; full list in
the scratch JSON (deleted). Claims' `schema` + `plan-frozen` ids both present. ID set,
details, checkCount (89) and verdict (findings), exit 1 — exact reproduction.

Mechanism note (why mine #1/#2 had 4/1 extra findings): `prior-set-complete`
(check-showpicker-r86.mjs:815) refuses any walked receipt of schema
`tabi-chrome-cdp-showpicker-r86` that is neither the receipt under test, a listed prior, nor
exempted by sha256. The r86 scored receipt exists in the walked trees, so a do-nothing run
without `--tree-exempt-sha256 035ac3f0…` (r86 receipt file sha256) always adds that finding.
The frozen file's `prior-set-complete: true` is only reachable with the live r86 receipt
exempted; mine #3 confirms that's exactly what it encodes. This is not a counter defect —
it's the walk binding the test to the current tree contents — but it means the frozen
control is only byte-reproducible with that exemption. Worth one line in the lesson ledger
so a future re-runner doesn't misread the +1 finding as drift.

### (b) nonexistent receipt → frozen `noreceipt.txt`

Command: r86 counter against `corpus/evidence/round86/chromium-showpicker/nope.json` with
r86 pins → **exit 2**, verdict unreadable, single finding `receipt-unreadable`
("ENOENT: no such file or directory, open '<abs lane>/corpus/evidence/round86/chromium-showpicker/nope.json'").
Diff against frozen: identical except my run carries the extra top-level `"schema"` key
(frozen was captured without `--json` normalisation stripping it — actually the frozen file
omits schema; trivially, my run used --json so the counter stamps it). Same verdict,
same finding id, same detail string, exit 2. Reproduced.

## 3. Independent hand reproduction of narrow-tel-childseq (assignment 3)

What I did (scratch only): copied `scripts/check-showpicker-r85.mjs` to scratch, applied by
hand the exact from→to swap the witness runner uses for `narrow-tel-childseq`
(occurrences verified = 1):
`same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE[extra].seq)`
→ `(extra !== 'sp84-cross-origin-tel' || same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE[extra].seq))`.
Kept the childEvents-seq conjunct for the tel leg, dropped it for every other cross-origin leg,
and scored it with the frozen r85 battery against an unmodified copy of the r85 receipt, using
the r85 counter's own pins (driver 1690c63d…/nonce tabi-r85-l1-620623a43f74/fixture 0b012937…,
r85 prior-set).

**Result: the mutant SURVIVES.** Battery exit 0, 175 cases, 0 failed, coverage complete —
the weakened counter is not noticed anywhere. Expected: yes, confirmed by hand (not just by
trusting the witness runner's stdout).

Why it survives on r85 but dies on r86 (proved by direct runs on the same r85 receipt data):

- r85 battery's only childEvents-seq witness is `cross-tel-childseq` (negatives-showpicker-r85.mjs
  line 241), which corrupts `childEvents[0].target` of the TEL leg — where the narrowed
  counter still checks the conjunct. Externally it's the same case the r86 battery carries
  (`cross-tel-childseq` in both). Every other cross-origin leg's seq conjunct has no battery
  case in 175. The narrowed conjunct aligns perfectly with the witnessed leg → blind.
- r86's battery adds the cross-{search,text}-* block (negatives-showpicker-r86.mjs ~line 272):
  `for (legName of ['search','text']) for (fam of FAMILY_MUT)` including
  `childseq-dropped = (l) => { l.childEvents[0].target = 'go'; }`, expecting
  `sp84-cross-origin-search-law` / `sp84-cross-origin-text-law` (no other allowed ids).
  The narrowed counter accepts those two corruptions silently; battery exits 1, case fails →
  KILLED. This is the whole C2 delta for childseq.
- Direct verification: mutant counter + search-leg `childEvents[0].target='go'` receipt →
  exit 0 clean, `sp84-cross-origin-search-law` TRUE (mutation invisible); pristine r85 counter
  + same receipt → exit 1, law FALSE with the seq detail; mutant counter + tel-leg sabotage →
  exit 1, tel law FALSE. So the mutant is a *clean* tel-only narrowing: the conjunct is real
  on tel, absent on search/text — exactly the R85Mut1 routed defect 3 pattern.

Panacea warning: this kill proves only that the battery notices the seq conjunct on search and
text (two more legs). Per the C2 limit, a battery that is still blind on, say, number/range
would leave the same mutant class alive; conjunct-completeness is not established.

## 4. Limits / risks / blockers

- witness-a.json 0 bytes — needs the runner stdout captured by the integration owner; I didn't
  write scored/ (not my path).
- Control (a): frozen file is byte-reproducible only with the r86-receipt tree exemption;
  without it +1 finding (`prior-set-complete`). Not a defect; documented above for the ledger.
- No git touched (fixtures: none needed — batteries manage their own scratch mirror lanes).
- Scratch `/fast/scratch/hyaku/tabi-r86/R86Exec3/` removed before yield (plus its `w/` and
  `manual/` subtrees and every output file).
- No tool installs/updates were needed; nothing to record.
