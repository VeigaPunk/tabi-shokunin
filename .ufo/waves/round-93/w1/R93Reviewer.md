# R93Reviewer — freeze & evidence-order review (round 93, w1)

Seat: R93Reviewer (leaf reviewer). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Base 192535d7ea519439ce42ec09b45038ed6756c709; freeze 7a7f39f3f5be5acc43c66d13f4e018c268855df4;
scored bf0bd62299c2c317eea9337c5dddc8a46dba1233. Claim C1, predicate C1-CROSS-SESSION-ANSWER-R93.
Read-only review: every command run with its output noted; no files edited except this report.
No chromium launched; counter re-run below is `--receipt` (file-only, no browser).

## Verdicts on the seven assigned items

### (1) frozenAt vs. the commit that added claims.json — PASS
- `jq -r .frozenAt .ufo/waves/round-93/claims.json` → `2026-11-08T20:47:56-03:00`.
- `git log --diff-filter=A --format='%H %cI' -- .ufo/waves/round-93/claims.json` →
  `7a7f39f3f5be5acc43c66d13f4e018c268855df4 2026-11-08T20:48:00-03:00` (cI). frozenAt (20:47:56)
  is 4 s *before* the committer time (20:48:00). **Not** future-dated (r92 defect not repeated).
- Note: the **author** time is `20:39:05-03:00`, i.e. mutable/back-datable; the **committer**
  time (not mutable by `git commit --date`) is the audited stamp and it does not fire the gate.
  The gate's `check-freeze-stamp-round93.mjs` checks committer time; author time is out of scope.
- Also: the plan itself (L8-9) states the discipline, and `claims.json.frozenIn` says the
  stamp was made before the commit. Both consistent with the timestamps above.

### (2) Instrument sha256 = claims.json = controls/instrument-sha256.txt = freeze bytes = master — PASS
All three pins hit identically at `7a7f39f3f5be`, `master`, disk, claims.json, and the txt file:
- driver `a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0`
- counter `3c721b668e553050ed6450d7b2e1881a864d191ef243ce410c37d5f04e36f1e3`
- battery `c8c15cc7368025201c949af2defd23fb048a8d17c4ba20a49659d46f3d88f6f5`
- claims.json sha: `62dc9fa7152c...`, plan sha: `aa9de1b9cbe8...` — equal at freeze and master.
- `grep -o a0deddda` in plan/claims.json/instrument-sha256.txt → same hex in all 3. PASS.

### (3) No frozen byte changed after freeze — PASS
- `git diff --stat 7a7f39f3f5be master -- plans/round-93.md .ufo/waves/round-93/claims.json
  scripts/chrome-cdp-cross-session-answer-round93.mjs scripts/check-cross-session-answer-round93.mjs
  scripts/negatives-cross-session-answer-round93.mjs .ufo/waves/round-93/controls/` → empty, rc=0.
- Full `git diff --name-only 7a7f39f3f5be master` shows only the 4 scored files
  (`scored/c1-live.json`, `c1-live.rc`, `live-receipt.json`, `started-at.txt`); no frozen path.
- Whole-file hashes (claims.json, plan) equal at freeze and master (item 2). PASS.

### (4) Controls committed with the freeze precede the scored run — PASS
- `git show --name-only 7a7f39f3f5be` lists all 10 controls files (battery, 3 counters,
  attempt1, setup-busyport, pin txt, rc.txt, 2 receipts). Freeze tree contains them.
- Timing (all `-03:00`): freeze committer `20:48:00` → `scored/started-at.txt` `20:48:07` →
  scored commit `20:48:33`; receipt `generatedAt` `2026-11-08T23:48:30.316Z` ≡ `20:48:30-03:00`.
  So freeze (20:48:00) < scored start (20:48:07) < scored generatedAt (20:48:30) < scored
  commit (20:48:33). Controls' receipts are even older: receipt-wrongsite `23:45:56Z`,
  receipt-positive `23:46:19Z` (= `20:45:56` / `20:46:19` local). Ordering is strict and
  the gaps are positive in the intended direction. PASS.

### (5) Plan §Controls rows match committed files — PASS with a minor table imprecision (F1)
`jq`/`cat` of committed files vs. plan L95-102:
- no-work (base): plan says "absent rc 128"; `rc.txt` line 2 records exactly that. PASS.
- no-work (r92 receipt): file verdict `findings`, checkCount 101, 35 findings; uniq ids =
  `schema, nonce, driver-pin, describe-chooser, describe-page, pierce-input, cross-answer,
  answer, child-files, fresh-browser` — exactly the plan's list (L98). PASS.
- wrong-site: file verdict `findings`, checkCount 101, 28 findings; uniq ids =
  `cross-host, child-host, child-url, iframe-targets, chooser, describe-chooser, describe-page,
  pierce-input, cross-answer, answer` — plan's list (L99). PASS.
- positive: file `clean`, checkCount 101, findings 0. Matches L100. PASS.
- setup (busy port): `counter-setup-busyport.json` is `{"verdict":"setup"}`, detail
  `driver refused (exit 2): ... free-port precheck: port 19352 busy`. rc.txt L9-11 documents
  the rc=0 attempt1 (no holder) as superseded, and attempt2 rc=2. Matches L101. PASS.
- forgery battery: `battery.json` → `cases:65, ok:65, nfailed:0`, first case `positive` rc 0;
  matches L102. PASS.

### (6) Plan §Claim predicate vs. counter — spot-checked 10 clauses, MATCH (detail in F3)
1. X target identity: plan L34-36 vs `check-cross-session-answer-round93.mjs:146`. Match.
2. Chooser one/exactly one, session iframe, B int >0, frame-bound: L36-37 vs `:151`. Match.
3. iframe describeNode INPUT type=file id=s: L37-38 vs `:106,152`. Match.
4. PAGE describeNode no error + `#document`: L38-39 vs `:155`. Match.
5. Pierced page getDocument 0 INPUT#s: L39-40 vs `:156`. Match.
6. Page setFileInputFiles exact error + files [] after: L40-42 vs `:157` (CROSS_ERROR exact
   string `Node is not a file input element`, `filesAfterCross` eq `[]`). Match.
7. Iframe answer no error: L42-43 vs `:163`. Match.
8. S zero targets: L44-45 vs `:148`. Match.
9. S page describe INPUT (same helper) + pierced exactly 1 + no cross answer:
   L46-48 vs `:159-161`. Match.
10. Both-arms files exactly `[[tabi-r93-answer.txt,22]]` + one trusted click on #s +
    browserVersion + 6 distinct browserIds: L50-53 vs `:164-165,135,124`. Match.
Receipt-identity block (L55-59: schema/nonce/pin/chromium/cross-host/reps/answer/ports/
failures/leg-shape/URL) = counter `:108-124` (11 receipt checks). Match. PASS.

### (7) checkCount 101 = 11 + 15x6 — PASS (verified twice)
- Receipt-level: 11 `check(...)` at counter `:108,109,110,111,112,113,114,116,120,122,124`
  (schema, nonce, driver-pin, chromium, cross-host, reps, answer, ports, leg-set,
  failures, fresh-browser) = 11.
- Per-leg: 15 from the loop `:131,134,135,136,139,140,146/148,151,152,155/159,156/160,
  157/161,163,164,165` = 15 (one arm-branch check per line-pair counts once; X 15, S 15).
- 11 + 15*6 = 101. Matches c1-live.json (101), counter-positive.json (101),
  donothing/wrongsite (101), supplied `--live` receipt (101). PASS.

## Cross-check against the supplied scored evidence (adversarial pass)
- Re-ran receipt mode against the committed scored receipt:
  `node scripts/check-cross-session-answer-round93.mjs --lane <lane> --expect-driver-sha256
  a0deddda... --receipt .ufo/waves/round-93/scored/live-receipt.json
  --expect-nonce tabi-r93-live-b39038e077b0 --json` → verdict `clean`, checkCount 101,
  findings [], rc 0. Matches scored/c1-live.json (`clean`, 101, 0 findings, nonce
  `tabi-r93-live-b39038e077b0`). NOTE: receipt mode is not the claim's counting command
  (`--live`); it does not re-prove the browser run, it re-proves the committed receipt
  against the frozen counter, including the driver byte-pin.
- Receipt legs in order X-1,S-1,X-2,S-2,X-3,S-3 (counter `want` `:118-120`).
  6 browserIds all distinct (jq uniq -c: six 1s). X legs: `childFrameId == attached[0].targetId
  == browserIframeTargets[0].targetId`, `browserIframeTargets.url == childUrl`.
  All 6 legs: `browserVersion "Chrome/155.0.8059.84"`, `childFiles [["tabi-r93-answer.txt",22]]`,
  `childClicks [{"target":"s","isTrusted":true}]`.
- Live-receipt fields: `schema tabi-chrome-cdp-cross-session-answer-r93`,
  `chromium "Chromium 155.0.8059.84 Arch Linux"` (contains 155.0.8059.84 — counter `:111` uses
  substring, matching plan L55), ports {19361,19362,19363}, crossHost localhost, reps 3,
  answer {tabi-r93-answer.txt,22}, failures [].
- Driver confirmed `--headless=new` (driver `:154`), binary `/usr/bin/chromium` (`:41`),
  version string surfaced in receipt as `Chromium 155.0.8059.84` from `--version` (`:122`).
- Staged sources: `sources/sha256.txt` hashes present for dom_node_ids.cc/.h and
  inspector_dom_agent.cc; freeze commit includes the three files. (Not re-hashed here; listed for L1.)

## Findings (severity-ranked; no severity above "note" found)

F1 (note — table wording): plan §Controls L98 row says "`counter-donothing-r92.json` ... rc 1
observed list (10 ids)". The committed file's `checkCount` is 101 with 35 findings whose
*unique ids* are exactly the 10 listed. The row is a set of ids, not a count of findings;
a reader could misread "10 ids" as 10 findings. No number is falsified; the rc and ids match.
Severity: wording only.

F2 (note — controls revision): `counter-donothing-r92.json`, `counter-wrongsite.json`,
`counter-positive.json` all carry `revision: 192535...` (base), because the counter stamps
`git rev-parse master` at run time (`:60`) and the controls were executed before the freeze
commit advanced master. This is the correct reading (pre-freeze controls at base revision,
scored run at `7a7f39f3f5be`), not a mismatch. Battery has no `revision` field. No impact.

F3 (note — coverage of wording, adversarial): the counter does **not** directly check
`--headless=new` or `/usr/bin/chromium` or Linux. It checks the receipt's `chromium` string
contains `155.0.8059.84` (`:111`) and per-leg `browserVersion == Chrome/155.0.8059.84` (`:135`).
Headless-ness and launch binary are properties of the pinned driver source (verified by me
at driver `:41,154` and by the driver's sha pin), not of the counter's receipt checks. This
is the plan's own design (L55 says the receipt's `chromium` string contains the tag; L25
says the *driver* uses `--headless=new`). The kill rule covers it via the frozen driver byte-pin.
No falsification; c. note for calibration.

F4 (note — `frozenIn` wording): claims.json `frozenIn` reads "frozenAt stamped before the
freeze commit was created". True for committer time (20:47:56 < 20:48:00). The author time
(20:39:05) is earlier and was written when the draft existed. If L1 audits author time, r92's
error would recur in a subtler form; the audited `frozenAt` is the committer time. Not a
falsification of the stated 4-second ordering on the field's own terms.

F5 (observation, not a finding — stamp gate exists only as untracked file):
`scripts/check-freeze-stamp-round93.mjs` exists on disk (20:51) but is **untracked**
(`git status --porcelain` → `??`) and absent from the freeze commit and master.
The plan's §Record work L116-118 lists it as the r92 gate that "is shown able to fail on r92
and passing on r93" — that is Record work (not claimed), and `claims.json.instruments` excludes
it. Do not cite it as an instrument. No freeze-order impact: the stamp is verified directly by
git `log` (item 1).

F6 (verify gap, recorded): I did **not** re-run `--live` (no chromium launched, no ports used).
Evidence ordering for (4) therefore rests on committed timestamps, not on my own reproduction.
The receipt-mode re-run (adversarial pass) does not substitute for the `--live` kill rule;
L1 (or a w1 executor) must confirm the `--live` exit-0 claim against the pinned driver.
This gap is inherent to leaf-reviewer scope (no chromium, no ports assigned to this seat).

## Residual risk / uncertainty
- Freeze-order verification depends on git committer timestamps being honest; the 4-second gasp
  between frozenAt and commit means a forger could have stamped `frozenAt` just-in-time.
  The artifact evidence (controls' receipt generatedAts 23:45/23:46Z, freeze push at 20:48)
  still orders controls strictly before the scored run. Author-time backdating remains possible
  in principle; committer time is what the gate audits (see F4).
- The `chromium` receipt string contains `155.0.8059.84` as a substring; an adversary who can
  inject a custom `--version` output (e.g. a wrapper binary named chromium printing the tag)
  could pass the receipt-mode counter. Defeated in `--live` mode by the driver pin's
  `/usr/bin/chromium` spawn and the sha256 pre-run check (`:73-75`), but receipt mode alone
  is forgeable (the counter itself says so at `:20-21` and plan L86).

## Verification gaps (unrun, not passed)
- G1: `--live` not re-run by this seat (see F6). Required for a kill-rule affirmation.
- G2: wrong-site and done-battery controls are quoted from committed JSON, not re-executed.
- G3: Blink source files (`sources/*.cc`) not re-hashed or diffed against 155.0.8059.84 tag;
  only their `sha256.txt` presence is recorded.
- G4: the r92-failure behaviour of the stamp gate is quoted from the plan, not re-executed
  (untracked script, see F5).

VERDICT C1: neutral
Artifact: .ufo/waves/round-93/w1/R93Reviewer.md
