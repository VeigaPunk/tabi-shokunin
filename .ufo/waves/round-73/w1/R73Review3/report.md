HOLDS

Read-only conformance review of round 73 C1 (capability re-claim chromium-synth-pinch-gesture-linux, generation r73). All five assigned checks executed; every claim below carries the command and its observed exit code.

## 1. Ordering — HOLDS

`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --format='%H %ci %s' d7ff9f19..HEAD -- .ufo/waves/round-73 scripts corpus SCORECARD.md` gives four commits, in order:

- ae2628afdfb2d8bfcffa9dd0c247f3868d67d757 2026-11-06 22:18:07 -0300 — pre-freeze controls (parent of claims; matches claims.json `preFreezeControlsCommit`)
- d7387fb30b513fec0cf61193f275484aed750b45 2026-11-06 22:18:15 -0300 — claims.json freeze
- 3409ab53b905d12d0866c6c93373e1c9887eda10 2026-11-06 22:18:22 -0300 — freeze.txt digests commit D
- c44fcf6f11fe549e8585e073e1cfad66dc2e2cbb 2026-11-06 22:23:41 -0300 — scored run (leg a) + battery + kill power

Parent chain verified: `git show --format='%P' --no-patch` on each gives ae2628af→d7387fb3→3409ab53→c44fcf6f linearly. Pre-freeze controls commit precedes claims.json, which precedes D, which precedes the scored receipt commit. Timestamps are strictly increasing. No commit outside this chain touched `.ufo/waves/round-73`, `scripts`, `corpus`, or `SCORECARD.md` between base d7ff9f19 and HEAD.

## 2. Pins — HOLDS

`freeze.txt` names six files. For each, `git show <rev>:<path> | sha256sum` was run at rev=3409ab53 (D) and rev=HEAD (c44fcf6f). All twelve digests equal the recorded values:

- scripts/chrome-cdp-synthpinch-round73.mjs: 3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4 at both
- scripts/check-synthpinch-r73.mjs: 3104101a9ac8b0cd09337a870139653f7a64cfb7eb65067daf389119ce20d4d1 at both
- scripts/negatives-synthpinch-r73.mjs: 0a738780090a8483eda8290f513b7d88ba41dd221120b14950dd6649609b88af at both
- .ufo/waves/round-73/controls/c1/kill-power-r73.mjs: 5e4a8255f84b61a75da6643fba1ca4f8a4a64b52d1c02280cea2f92b0ee0a8fe at both
- .ufo/waves/round-73/claims.json: ef289314454ef4182ea40aa48404cf66fb4f08892df1c83cfd9c9003429f8d94 at both
- .ufo/waves/round-73/run-scored.sh: 8288728dad48a6a983c4d09d404158a6ff8328f1dbc070043f15f2fe3b971071 at both

No instrument byte changed between D and the scored commit.

## 3. Nonce — HOLDS

- D's first 12 hex: `3409ab53b905` → expected nonce `tabi-r73-l1-3409ab53b905`.
- Scored receipt `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json` field `/nonce` = `tabi-r73-l1-3409ab53b905` (verified by JSON walk; also echoed in `nonceOnPage`, `cdpSendLog[4]`, `serverLog[0].run`). Receipt sha256 = a3b9070bca0db67000d58eb34a990d05e8191a34b2882ec30a9316472d703ea8, matching scored/c1-counter-a.json and status-at-dispatch.txt.
- `git grep -l 'tabi-r73-l1-3409ab53b905' <rev>` returns empty at base d7ff9f19, at pre-freeze ae2628af, at claims d7387fb3, and at D 3409ab53 (exit 1, no matches). First appearance is c44fcf6f in exactly the four scored artifacts: `.ufo/waves/round-73/scored/c1-a.args.txt`, `c1-counter-a.json`, `status-at-dispatch.txt`, and the receipt itself. No PRE receipt or pre-D file contains the string.

## 4. Before→after — HOLDS

Before commands re-run at base d7ff9f19 (worktree `/fast/scratch/hyaku/tabi-r73/R73Review3/base`; the r73 counter does not exist at base, so the frozen instrument `scripts/check-synthpinch-r73.mjs` was extracted from ae2628af into scratch and invoked by absolute path — the same bytes pinned in freeze.txt):

- No r73 receipt: `node check-synthpinch-r73.mjs --receipt corpus/evidence/round73/.../receipt.json --expect-driver-sha256 3f0f... --expect-nonce tabi-r73-l1-3409ab53b905 --prior <smoke1>` → exit 2, verdict `unreadable`, finding `receipt-unreadable` (ENOENT). Matches claims.json before.counter.
- r72 scored receipt under r73 counter: same command with `--receipt corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json` and all 12 PRE priors → exit 1, verdict `findings`, checkCount 98, findings exactly `[schema, nonce-shape, nonce-expected, driver-pin]` — all four false, every other check true. Matches claims.json before.counter verbatim. (Note: the counter requires ≥1 `--prior`; without it the call exits 2 usage, which is itself the declared doNothingControl `donothing-no-flags` behavior.)
- Capability row: `git show d7ff9f19:SCORECARD.md | grep -c '^| \`chromium-synth-pinch-gesture-linux\` |'` → 0. Matches before.capabilityRow.

After counting command at tip c44fcf6f, run verbatim per claims.json countingCommand (receipt path, `--expect-driver-sha256 3f0f...`, `--expect-nonce tabi-r73-l1-3409ab53b905`, all 12 PRE receipts as `--prior`, `--json`): exit 0, verdict `clean`, checkCount 98, findings `[]`, all 98 checks true. Matches predicate leg (a).

Committed scored artifacts corroborate: c1-driver-a.exit=0, c1-counter-a.exit=0, c1-negatives-a.exit=0 (allOk true, passed 228, refuseCases 216, mustAcceptCases 9, launderedCases 3, coverageGap []), c1-kill-power-a.exit=0 (holds true, unmutatedExit 0, forceTrue 98/98, semantic 19/19, survivors []).

## 5. Measurability of claims — HOLDS with one noted limit

Every predicate leg is a single command over committed bytes:

- (a) countingCommand → exit 0 clean, 98 checks, on the committed receipt. Measurable.
- (b) same counter on R73Exec1's receipt with 13 priors. Measurable once leg (b) lands; currently pending (leg (b) awaits R73Exec1 per status-at-dispatch.txt — not a defect of the claim, a pending leg).
- (c) negatives battery + kill-power scripts, both pinned in freeze.txt, exit-0 and holds:true conditions. Measurable.
- (d) `grep -c '^| \`chromium-synth-pinch-gesture-linux\` |' SCORECARD.md` 0→1 plus existence of the knowledge note with a `source:` line citing S180–S183. Measurable. Note file exists at tip (`git ls-tree HEAD corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md` → blob d30438db) and its line 1 cites S180–S183; the SCORECARD capability row is NOT yet present at tip (grep count still 0) — consistent with status-at-dispatch: leg (d) is written only after (a)–(c) hold and leg (b) completes, so this is pending, not violated.

Non-measurable residue (declared, not hidden): the counter reads a receipt; it is not an execution oracle. The declared limit — a forger who rewrites nonce, launch token, DevTools browser id, and every event ts of a prior receipt is not refused (controls-summary.json `limit-full-identifier-rewrite` exit 0) — is stated verbatim in claims.json `limit` and is an honest bound, not a falsification. Legs (a)–(d) themselves remain fully command-measurable; nothing in the predicate asserts an unmeasurable runtime property beyond what the receipt records.

## Residual risk / verification gaps

- Leg (b) and leg (d) are unexecuted at this review's snapshot; this review certifies the freeze ordering, pins, nonce derivation, and before→after reproduction only. Leg (b)'s cold-run independence cannot be checked until R73Exec1's receipt exists.
- The before-reproduction used the counter extracted from ae2628af rather than a worktree checkout of that commit's scripts/ (the file did not exist at base d7ff9f19). Digests are identical to freeze.txt, so the bytes tested are the pinned bytes.
- Three sibling commits (c4cb9cf, e446b2f, 31137833, 6edb6991) share timestamp 22:23:41 with c44fcf6f and parent 3409ab53; c4cb9cf and e446b2f are alternate landings of the same scored payload (identical trees modulo the scored/* files split), 31137833 and 6edb6991 are empty. HEAD is detached at c44fcf6f; none of this affects the ordering claim, which is satisfied on the committed chain.

No actionable defect found in the assigned scope.
