# R99Critic1 — C1 wording vs instrument map (predicate C1-CLIENT-OOPIF-UPLOADSETS-R99)

Scope: plans/round-99.md §Claim C1 (Surface moved, driver-pin paragraph, every-leg bullet, eight arm
bullets, parenthetical, receipt-level paragraph, before/after) and §Declared limits 1-8, mapped to
scripts/check-client-oopif-uploadsets-round99.mjs (counter, "C:" lines) and
scripts/client-oopif-uploadsets-round99.mjs (driver, "D:" lines) at the frozen bytes.

## Evidence run (no live chromium; see Process)

- Counter sha256 1a0f2529…a689a720; driver sha256 98efdc12…6b89f8 (= claims.json pin); negatives 854f4fef…; livekillers 03aae028… — all equal claims.json and controls/instrument-sha256.txt.
- Committed receipt re-scored in receipt mode:
  `node scripts/check-client-oopif-uploadsets-round99.mjs --lane <lane> --expect-driver-sha256 98efdc…6b89f8 --receipt corpus/evidence/round99/client-oopif-uploadsets/receipt.json --expect-nonce tabi-r99-live-6d2a1508cbc1 --json` → rc=0, verdict clean, checkCount 278, findings [], receiptSha256 ed4b21299a42bd0689b7123799a4908566cbbeeeb30b9a8cda353c49deb845e3 (identical to scored/c1-live.json receiptSha256).
- Re-derived check count: 14 receipt-level checks (schema, nonce, driver-pin, chromium, reps, libs, files, payloads, missing, tmpdir, ports, leg-set, failures, fresh-browser) + 11 per leg × 24 legs = 278; live adds driver-exit, ports-bound, missing-bound, tmpdir-bound = 282 = scored checkCount. **Numbers agree.**
- Constant shas recomputed independently (python hashlib): fileA 7712697e…cfff (22 B), fileB 6f834164…ef84d (30 B), P1 fa9aa1b5…7978 (27 B), P2 bb2e3f91…1edb2 (36 B), BIN (bytes 0..255) 40aff2e9…944880 (256 B). All equal the counter constants (lines 66-70) and the receipt descriptors.
- Surface grep, re-run: `git grep -nE 'multiple|readAsArrayBuffer|arrayBuffer\(\)' 9eaa5cbe -- 'scripts/client-oopif-*round9[5-8].mjs'` → no output, rc=1 (matches plan).
- Broader lane grep at 9eaa5cbe (see finding W1): `scripts/chrome-cdp-filechooser-round77.mjs:182` and `round78.mjs:185` call `f.arrayBuffer()`; round77.mjs:217 `pick-multiple` puts two files (`tabi-a.txt`, `tabi-b.bin`) into `<input multiple>` via the chooser.
- Source spot checks (staged copies): S240 pw-dom.ts L756-757 ✔; S238 pw-fileUploadUtils.ts L80 ✔; S237 pp-ElementHandle.ts L113-116 ✔; S244 pp-assert.ts L19 ✔; S246 mime-standard.ts L283 `'image/png': ['png']` ✔; S247 mime-Mime.ts L87 ✔.
- Round-98 facts for the "Surface moved" sentence (9eaa5cbe): r98 plan L117-120 (one file per call; `FileReader`, `arrayBuffer()` unmeasured; absent-path legs and the quoted "not legs this round"); r98 driver L289 (single input per call), L310 (`.text()` once per file), L338 (payload mimeType text/plain). Consistent with the sentence.

## Sentence map

Key: E = enforced by counter (line); D = driver-pin fact (declared in claim); L = declared limit; N = not enforced, not declared.

### Surface moved / history
- S-1 "r98 measured one file per call ... every payload typed text/plain, every read one Blob.text()" — N (history). Checked against r98 driver/plan: holds.
- S-2 "declared limits left unmeasured ... (limit 4) ... (limit 3) ... absent path ... (limit 4: 'Puppeteer launch with an absent path, Playwright launch with an absent path … are not legs this round')" — N (history). Holds; the ellipsis elides "and Puppeteer's clear path (r97 PUC)", which is harmless.
- S-3 "No lane instrument has ever put two files into one input, called setInputFiles with an untyped payload, or read an upload with arrayBuffer()/FileReader" — N, and **FALSE as worded** (finding W1 below).
- S-4 the parenthetical git grep and "no hit" — the command as written returns no hit (verified). Its scope is only `client-oopif-*round9[5-8].mjs`; the "r96 counter/battery hits" it mentions are in `check-`/`negatives-` files that the pathspec does not match, so the command cannot show them. Accurate for its scope only.
- S-5 "R98Exec3 leads a-e ... this round makes them counted" — N (history); not verifiable from the instruments; not counter-relevant.

### Predicate header
- P-1 "On this host's Chromium 155.0.8059.84 (/usr/bin/chromium, Linux)" — tag E (C:CHROMIUM_TAG L61, chromium check L219); path D (driver L68).
- P-2 "--live runs the pinned driver (sha256 checked before it runs; nonce in its environment; receipt written inside fresh mkdtemp)" — E (C:L117, L136-149, L153 env). Nonce in environment: E (L153).
- P-3 "for 3 repetitions of PUAM, PLAM, PLBX, PLBM, PLBN, PLLP, PUCM, PUCN in that order (24 legs)" — E (C:L230-232 leg-set exact; ARMS order L80, leg order driver L355-357).

### Driver-pin facts paragraph
- D-1 "TMPDIR set to <driver scratch>/t before either client module is loaded" — D (driver L118-121 before createRequire L141/L157). Counter sees only tmpdirAtLoad string (C:L226) and tmpdir-bound in --live (C:L214). Declared as driver-pin (limit 7). ✔
- D-2 "PUAM launch({executablePath, headless:true, userDataDir}) ... PLAM chromium.launch(...), both with --remote-debugging-port in args" — D (driver L277-280). Counter sees only the outcome; ✔ declared.
- D-3 "other legs started by the driver with --headless=new and attached by connectOverCDP(url) / (url,{isLocal:true}) / Puppeteer connect" — D (driver L283, L292, L296). Counter sees lib/mode/isLocal fields (C:L251). ✔
- D-4 "parent page ... one file input #pp and one iframe; child ... #s (no multiple), #m (multiple), listeners record [inputId,type,isTrusted] in one list" — D (driver L197-205). Counter sees the consequences: parentFiles [] (C:L257), frames (C:L254), events exact (C:L266). Note: the listeners are not counter-visible; events compared exactly is the only consequence. ✔ declared.
- D-5 "the call runs on the child frame ... x is the absolute path <driver scratch>/tabi-r99-missing.txt which does not exist (PUAM, PLAM, #s) ..., one payload {name,buffer} no mimeType (PLBX), two payloads ... (PLBM #m, PLBN #s) or paths a/b (PLLP, PUCM #m; PUCN #s)" — D (driver L256-260, L307-315). Counter sees the resulting file descriptors and missingExists (C:L225). Whether "does not exist" held at call time: counter sees missingExists false in receipt (driver L374), not the call-time state (D). ✔
- D-6 "a one-element x passed unwrapped" — D (driver L314). ✔
- D-7 "after a 400 ms settle ... reads both inputs' files as [name,size,type] ... and parent #pp files" — D (driver L70, L322-341). Settle time: not counter-visible (D). ✔
- D-8 "WebCrypto SHA-256 in the child page" — D (driver L327). Counter compares digest strings (C:L77). ✔

### Every-leg bullet
- E-1 "/json/version Browser is Chrome/155.0.8059.84" — E (C:L253 browser, from driver L288).
- E-2 "client's own browser version: Chrome/155... (Puppeteer) / 155.0.8059.84 (Playwright)" — E (C:L253: BROWSER for puppeteer, CHROMIUM_TAG for playwright). Exact equality, matches sentence.
- E-3 "lib, mode, isLocal, input, target match the arm" — E (C:L251, arm table L82-90).
- E-4 "exact parent and child URLs match the arm" — E (C:L252).
- E-5 "client lists exactly the frames [parent URL, child URL]" — E (C:L254, exact array equality, main frame first).
- E-6 "recorded browser-level iframe-target list holds exactly one target, with url = child URL" — E (C:L255-256: length 1, url equal, targetId non-empty string). The sentence doesn't say "non-empty targetId"; the counter additionally requires it — narrower sentence, stronger check, harmless.
- E-7 "parent's #pp holds []" — E (C:L257).

### Arm bullets
- A-1 PUAM resolves (C:L258-259) ✔; #s exact (C:L265) ✔; #m [] (C:L265) ✔; events exact (C:L266) ✔; both reads ["err","NotFoundError", msg] exact (C:L267 via ARM reads [[NF,NF]], L72 literal message) ✔. "trusted input/change" = events trusted=true ✔.
- A-2 PLAM error Error with exact ENOENT message including missingPath (C:L261; missingPath from receipt, bound by missing-bound L213 in --live) ✔; "nothing set, no event, no read" = files {s:[],m:[]} (C:L265), events [] (C:L266), reads [] (C:L267) ✔.
- A-3 PLBX resolves ✔; #s exact [bin,256,"image/png"] (C:L265 with ARM L85) ✔; events untrusted (C:L266) ✔; reads ok/256/sha (C:L267; sha from counter constant L70, not receipt) ✔. "image/png" is the observed File.type; "Playwright inference" is the source account (L5 limit) — see W3.
- A-4 PLBM resolves ✔; #m exact two entries (C:L265) ✔; #s [] ✔; events untrusted ✔; both reads of both files (C:L267, constants L68-69) ✔.
- A-5 PLBN error exact (C:L263; message literal L87) ✔; inputs [] ✔; no event ✔; no read ✔. "refused before any file is set" is read from outcome only (limit 5) — L.
- A-6 PLLP/PUCM resolve ✔; #m exact [a,22,text/plain],[b,30,text/plain] ✔; #s [] ✔; events trusted ✔; both reads both files ✔.
- A-7 PUCN error exact (C:L263; literal L90) ✔; inputs [] ✔; no event ✔; no read ✔.

### Parenthetical
- Q-1 "every events list compared exactly, so no leg may record a click" — E (C:L266 eq on whole list; EV has input/change only L79). ✔
- Q-2 "an event on the input that was not the target is a finding" — E (C:L266 exact compare). ✔

### Receipt-level paragraph
- R-1 schema, nonce, driver pin — E (C:L216-218). ✔
- R-2 chromium string contains 155.0.8059.84 — E (C:L219). ✔
- R-3 reps 3 — E (C:L220; reps from --reps default 3, L104). ✔
- R-4 two libraries pinned "exactly as in r98 (version, lock integrity, upload-bearing file sha256, package-directory entry count and sha256)" — E as equality to counter constants LIBS (C:L221, L74-75). The receipt values come from the driver reading --deps (D); the counter cannot see the installed tree. Transitive packages not bound — L2 (declared). ✔ with L.
- R-5 descriptors fileA, fileB, payload1 (text/plain), payload2 and bin (mimeType exactly null) with names, sizes, sha256s — E (C:L222-223, full-object eq, mimeType:null present). ✔
- R-6 missingPath absolute, basename tabi-r99-missing.txt, missingExists exactly false — E (C:L225). ✔
- R-7 tmpdirAtLoad absolute, basename t — E (C:L226); "set before load" is D (L7). ✔
- R-8 three distinct integer ports 1024..65535 — E (C:L228). ✔
- R-9 exact leg list — E (C:L230-232). ✔
- R-10 empty failures, no leg error — E (C:L233-234; `l.error !== null`, so an absent error key also fails). ✔
- R-11 24 distinct UUID-shaped browser ids — E (C:L238-239) over lawLegs; equal to all legs in any clean run (partial runs excluded by L8, declared). ✔
- R-12 --live: driver-exit status 0, ports-bound, missing-bound, tmpdir-bound — E (C:L210-214). ✔

### Before → after
- B-1 base 9eaa5cbe: counting command absent, rc 128 — verified (`git cat-file -e 9eaa5cbe:scripts/check-…` → fatal, rc=128). ✔
- B-2 r98 receipt scored by frozen counter → rc 1 — verified (controls/rc.txt line 2 = `no-work-r98-receipt rc=1`). ✔
- B-3 "--live exit 0, verdict clean, 0 findings over 24 legs (scored run recorded in .ufo/waves/round-99/scored/)" — the scored JSON shows verdict clean, findings [], 24 legs, checkCount 282, driverRun status 0, launchFailed []. Its c1-live.rc was not read by me; the live exit code is taken from the JSON verdict plus status 0. ✔ (with that caveat).

### Declared limits 1-8
- L1 (one Chromium build, headless, one child relation) — L; counter sees only the tag and cross-site URLs. ✔
- L2 (two client versions; launch vs connect is a driver-pin fact; Playwright bundled browsers etc. unmeasured; top-level dirs only) — L + D. ✔
- L3 (trusted = isTrusted on #s/#m; reads = arrayBuffer then FileReader once, after events; text()/stream()/slice()/form/fetch unmeasured; digest in page; counter recomputes expected sha from own constants) — L. The "counter recomputes from its own constants" claim is TRUE: C:L65 (S helper), L66-70 (literal bytes, BIN from Array 0..255), used by ok()/both() (L77-78). The receipt descriptors are compared against the same constants (L222-223), so the receipt cannot supply the expected digest. ✔
- L4 (two files per multi-file call, one order; 3+ files, duplicates, empty, directories, 50 MB, mixed unmeasured; MIME inference for two names only: .png→image/png and .tabi99→application/octet-stream; absent path on arms named) — L. Enforced: MIME expectations are literal (C:L79, L85, L86); ARM table has exactly 8 arms (C:L80-91); no 3-file arm. ✔
- L5 (mechanism is the sources' account; counter checks behaviour; refused-before-set read from outcome) — L. Verified: no counter code path reads a protocol trace. ✔
- L6 (receipt mode forgeable; --live is the counting command; reps≠3 measures other legs) — L. ✔
- L7 (tmpdirAtLoad recorded value; TMPDIR-before-load is a driver-pin fact; ~60-byte scratch limit) — L + D. ✔
- L8 (exit 3 handling) — see W2.

## Findings

### W1 — falsifies-wording: "Surface moved" overclaims the lane's history
Frozen sentence (plans/round-99.md L22-24): "No lane instrument has ever put two files into one input, called `setInputFiles` with an untyped payload, or read an upload with `arrayBuffer()`/`FileReader` (`git grep -nE 'multiple|readAsArrayBuffer|arrayBuffer\(\)' 9eaa5cbe -- 'scripts/client-oopif-*round9[5-8].mjs'`: no hit …)."
- Counter enforcement: none (history sentence; not a counter property). Not a declared limit or driver-pin fact.
- Evidence it is false as worded: `git show 9eaa5cbe:scripts/chrome-cdp-filechooser-round77.mjs` line 182 and `…round78.mjs` line 185 call `f.arrayBuffer()` on uploaded files; round77 line 217 puts two files (`tabi-a.txt`, `tabi-b.bin`) into `<input type=file multiple>` (`pick-multiple`), reads back via arrayBuffer (round77 ~L440 scored output shows both files landed in #m).
- What is true: within the grep's scope (client-oopif r95–r98 drivers), no driver puts two files into one input, uses a payload object in setInputFiles without mimeType, or uses arrayBuffer()/FileReader. The "untyped payload" half was not checked against non-client-oopif scripts.
- Narrowest true restatement: "Within the client-oopif r95–r98 drivers (`client-oopif-*round9[5-8].mjs`), no call puts two files into one input, no payload is untyped, and no upload is read with arrayBuffer()/FileReader. The lane's chrome-cdp-filechooser-round77/78 instruments do read uploads with arrayBuffer() and put two files into a multiple input through the file chooser, not through setInputFiles."
- Impact on the predicate: none — the predicate's legs are measured by the counter independently of this sentence. Impact on the claim's novelty framing: the "first measured" argument is overstated for the chooser path; the r77/r78 instruments already measured arrayBuffer() reads of chooser-set files on a same-origin page.

### W2 — wording gap in Declared limit 8 (first clause broader than the code; declared override)
Limit 8 (plans L149-151): "the counter still checks the receipt, skips the per-leg checks of the launch-failed legs and reports `findings` (rc 1) when any other check fails (`driver-exit` and `failures` excepted), else `setup` (rc 2); every leg launch-failed is `setup`."
Code: C:L237 `if (partialLaunch && !lawLegs.length) refuse(...)` runs BEFORE the per-leg loop and BEFORE the verdict at L275. So when every leg is launch-failed, the counter returns setup even if receipt-level checks (L216-234: libs, files, payloads, nonce, schema, pin, ports, leg-set, tmpdir, missing) found law failures. Those findings are computed (C:L216-234) and then discarded by the refuse.
- Is it a declared limit? The second sentence ("every leg launch-failed is setup") declares the override; the first sentence ("reports findings … when any other check fails") does not, and is false for this branch.
- Reachability: requires the pinned driver to exit 3 with every leg labelled `chromium never came up…` while a receipt-level field is wrong. Labelling is a driver-pin fact (limit 8, last sentence), so an honest driver cannot reach it. A pinned driver that does would be laundering, which the limit already names.
- Narrowest true restatement: "When at least one leg is not launch-failed, a law failure on any check other than `driver-exit`/`failures` gives `findings` (rc 1); when every leg is launch-failed the counter gives `setup` (rc 2) whatever the receipt-level checks say."
- Answers to the specific questions:
  - Can a law failure on a non-launch-failed leg end `setup`? **No.** Such a failure is in `law` (L272) → the refuse at L273 is skipped → L275 gives findings, rc 1. (Confirmed by K-partial: frozen rc 1 with `child-files`.)
  - Can a clean run with one launch-failed leg end rc 0? **No.** Live: status 3 fails `driver-exit` (L211). Any mode: the launch-failed leg has `error !== null`, so `failures` (L234) fails. findings non-empty → rc ≠ 0. (Confirmed by K-launchonly rc 2 and K-partial rc 1.)

### W3 — Playwright inference vs browser sniff (limit 5) — declared, no finding
Claim line "PLBX … lands [...,'image/png']" is a File.type observation (C:L85, L265). The counter cannot tell whether Playwright's `mime.getType` (S238/S246) or the browser set it. Limit 5 declares that the mechanism is the sources' account and the counter checks behaviour. Predicate-level wording does not say "browser sniff"; only the Surface-moved sentence and the claim's `statement` field say "Playwright inference" / "image/png" without the sniff question. No finding; noted so the wording is not read as a browser-sniff claim.

### W4 — "bytes intact": counter's expected sha is not copied from receipt — confirmed, no finding
C:L65 defines S() over literal strings (L66-69), BIN from `Array.from({length:256}, (_, i) => i)` (L70). `ok()` (L77) uses these constants. Receipt descriptors (L222-223) are compared to the same constants. The page digest is compared to the constants, so bytes-intact is anchored to the counter, not the receipt.

### Other checks — no finding
- Exit-3 counting: K-partial (frozen rc 1 `child-files`, neutral rc 2) and K-launchonly (rc 2 `setup`) in controls/livekillers.json (6/6 ok) confirm the mapping.
- Counter vs predicate on the per-leg checks: no statement in the bullets that the counter does not check beyond what is listed above. The only "narrower-than-sentence" items are cosmetic (E-6: the counter also requires a non-empty targetId).
- Numbers: 278 receipt-mode / 282 live, both re-derived; ports 3 distinct; 24 legs. No falsifies-number.

## Process
- No subagents, no commits, no git/jj mutation. Read-only git (`cat-file`, `grep`, `show`, `ls-tree`) against 9eaa5cbe and 27685238.
- No live chromium run: this seat was not assigned a port triple, and the contract forbids unassigned ports. The live predicate statements are therefore checked by reading the driver and counter and by the committed live-run JSON, not re-executed. No chromium process started by me (`pgrep -fa remote-debugging-port` empty).
- Scratch: none created. One stray `/tmp/g1.txt` created during grep was deleted (`rm -f`).
- Tool installs: none.
- Commands run and rc: `git cat-file -e 9eaa5cbe:scripts/check-client-oopif-uploadsets-round99.mjs` → 128; `git grep … 9eaa5cbe -- 'scripts/client-oopif-*round9[5-8].mjs'` → 1 (no hit); `node scripts/check-client-oopif-uploadsets-round99.mjs … --receipt … --json` → 0 (clean, 278); `sha256sum` on four instruments → matches claims.json; python hashlib constant shas → match.

## Verdict basis
The predicate's leg-level statements (PUAM, PLAM, PLBX, PLBM, PLBN, PLLP, PUCM, PUCN, every-leg, receipt-level) are each enforced by a specific counter line; the driver-pin facts and limits 1-7 are declared. The frozen Surface-moved prose (W1) states a repo-history property that the instrument does not enforce and that is false as worded. Limit 8's first clause overstates the all-launch-failed branch (W2).

VERDICT C1: falsifies-wording
