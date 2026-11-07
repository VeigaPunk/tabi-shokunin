HOLDS

Seat R78Exec1 — Tabi round 78, wave w1. Legs assigned: digest pin check, predicate (b) cold driver run + counter, independent re-run of leg (c) (battery + kill power). All paths below are absolute under the lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` unless noted. All JSON artifacts live ONLY in `.ufo/waves/round-78-seats/R78Exec1/` (SEAT-OUTPUT RULE respected; nothing was written under `.ufo/waves/round-78/` or `corpus/evidence/round78/`). No git/jj mutations; read-only `git show`/`log`/`status` only.

## 1. Pinned digests (dispatch freeze)

Command: `cd lane && sha256sum -c .ufo/waves/round-78/freeze.txt` → **14/14 OK, rc=0**. Driver `scripts/chrome-cdp-filechooser-round78.mjs` = `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`, matching the pinned `--expect-driver-sha256`.

The L1 re-pinned twice during the wave; re-verified each time against the then-current freeze: 15:24:41 freeze → 14/14 OK rc=0 (kill-power script re-pinned `494002e5…`); 15:48:51 freeze → **14/14 OK rc=0** (final; evidence `freeze-check-final.txt`, `FREEZE_RC=0`, 12→later 14 OK lines recorded per check). One intermediate check at ~15:37 was 12/14 (`negatives-filechooser-r78.mjs` + `kill-power-r78.mjs` edited after that pin, before the 15:48:51 re-pin) — mid-flight instrument churn, see Finding F2.

## 2. Leg (b) — cold driver run (once, no re-run; rc was 0, not 2)

Command (verbatim from the dispatch): `S=/fast/scratch/hyaku/tabi-r78/R78Exec1; TMPDIR=$S/d node scripts/chrome-cdp-filechooser-round78.mjs --scratch $S/d --out .ufo/waves/round-78-seats/R78Exec1/receipt.json --nonce tabi-r78-exec1-d59ca0270c2a --http-port 39123 --cdp-port 39124` → **`DRIVER_RC=0`** on the next line. Ports 39123/39124 were verified free by bind-probe before launch. Receipt written once, never edited.

Receipt facts (`receipt.json`): `predicate: true`, `chooserHypothesis: "CONFIRMED"`, `degenerate: null`, `failures: []`, 15 legs in frozen order; `startedAt 2026-11-07T18:15:58.282Z`, `finishedAt 18:16:07.462Z` (~9.2 s, inside the 6–600 s run window). Teardown: `postKillSweepCount 0`, `survivors: []`, `portProbes fixture/devtools "closed"`, `postKillCurl 7/7`.

**nodeReport ids** (backendNodeId per chooser opening; driver stdout + counter.json `nodeReport`): pick-single `[5]`, pick-multiple `[7]`, pick-same `[5]`, pick-first-only `[5]`, pick-missing `[5]`, pick-empty `[5]`, dir-mode `[14]`, accept-ignored `[18]`, forward-click `[5]`, intercept-cancel `[5]`. Structural law holds: every `DOM.setFileInputFiles` targeted the id opened in the same leg; **one id per input element** (`#s`→5 on every leg that opens it, `#m`→7, `#d`→14, `#k`→18 — distinct inputs, distinct ids, stable within the run). Legs with no chooser opening (script-click, intercept-off, start/intercept-on) have no set. The scored run's pick-multiple id 10 vs my 7 is per-run browser assignment — the accepted-by-design drift.

**frameTree**: `{"mainFrameId":"61A9D6869138AD7F7B3CEF133DC0BCCA","mainFrameParentId":null,"mainFrameUrl":"about:blank"}` — single main frame, no parent; all frame-binding checks anchor against it.

**fixture-descriptors: HOLDS.** Page-measured `fixtureInputs`: `#s` input[type=file] rect 100,100 120×40 (commanded 160,120 inside); `#m` multiple rect 300,100 (360,120 inside); `#d` webkitdirectory rect 500,100 (560,120 inside); `#k` accept=.png rect 700,100 (760,120 inside); `#f` button[type=submit] rect 100,300 120×40 (forward-click commanded 160,320 inside). Counter confirms under check `fixture-descriptors` (verdict clean below).

## 3. Counter on my receipt — refusal, isolation, repair

**Attempt 1 (pinned command, ~15:2x):** rc=1, `verdict "findings"`, `checkCount 186`, **exactly one finding**: `prior-set-unparsable` naming `.ufo/waves/round-78/scored/selftest-r78-gates.out`. priorSet 12 (11-line prior-set.txt + scored via `--prior`). Preserved: `counter-attempt1-poisoned.json`.

Root cause (code + bytes): the counter's prior-set walk covers trees `['.ufo/waves/round-78','corpus/evidence/round78']` (`scripts/check-filechooser-r78.mjs:605`) and refuses any file that is named `*.json` or whose first 64 bytes start with `[`/`{` but does not parse (`:307`); `prior-set-unparsable` has no exemption path (`--tree-exempt` feeds only the `outside` check, `:294`). The file was the L1's selftest capture: leading `{`, trailing prose `clean=true cases=15 failed=none` — JSON-looking, unparsable. It was created 15:14:07, AFTER the L1's 15:07 scored-gate runs and cold1, and committed at HEAD `8384256d` — which is why dispatch-time claims were clean and every fresh run refused. E2's no-schema-byte-gate rule worked exactly as designed ("refused, not skipped").

**Isolation experiment (single-cause proof):** copied both walked trees + `scripts/` + the r77 prior to scratch, deleted ONLY that file, re-ran the pinned counter with `--lane <copy>` → **rc=0, verdict clean, 186 checks, 0 findings, priorSet 12** (`counter-isolated.json`).

**Attempt 2 (after the L1 moved the file to `.ufo/waves/round-78-seats/L1-selftest/`, outside the walked trees):** same pinned command → **rc=0, verdict clean, 186 checks, 0 findings, priorSet 12**. Limit block (E4, per-prior needs): 12 rows, `refused` 0; **max absMatched 0 / need 40** (deg priors 19/18), **max gapMatched 4 / need 9** (deg-swap-files row); all other rows ≤3/9. Same receipt, never edited. Predicate (b) holds for this seat on the repaired lane.

## 4. Leg (c) — independent re-run on the scored receipt

The scored receipt was re-scored by the L1 four times during the wave (nonces `…d59ca0270c2a` → `…d986c2735b6b` 15:25:30 → `…a4d628c8ef49` 15:33:44 → `…4920e0790fa9` ~15:48). I measured against three states; every number below carries its state.

**Battery A (scored receipt as `--real`):**
- Dispatch-era bytes (nonce d59ca…, extracted byte-exact via `git show 8384256d:corpus/evidence/round78/chromium-file-chooser/receipt.json` → seat copy `scored-at-dispatch.receipt.json`, nonce verified): rc=0, **allOk true, 397/397 passed, coverageGap [], positiveOk true** (`negatives-a.json`). (First repaired-era run on the then-current tree bytes measured 398/398; the 1-case delta is one duplicate instantiation of `witness-leg-records-error-code-float`, case-name sets identical — per-receipt witness count, not a coverage gap.)
- Settled state (4920e… pin, newest battery binary): rc=0, **allOk true, 400/400, coverageGap [], positiveOk true** (`negatives-a-settled.json`).
- Poisoned era (for the record): rc=1, allOk false, 5/398, and ALL 393 failed results carried ONLY the extra `prior-set-unparsable` (zero other anomalies) — pure environment cascade. Preserved `negatives-a-poisoned.json`.

**Battery B (MY receipt as `--real`):** rc=0, **allOk true, 397/397, coverageGap [], positiveOk true** (`negatives-b.json`).

**Kill power (harness `kill-power-r78.mjs`, `--out kill-power-a.json`):**
- **FINAL, on the settled/re-pinned state (nonce 4920e…, production geometry — `--real` at the tree path): rc=0, `unmutatedExit 0`, `unmutatedLastExit 0` (flake-guard battery clean twice), force-true 186/186 killed (killedPositive 0, all pure), semantic 76/76 (killedPositive 4), `survivors []`, `crashed []`, **`holds: true`**; 870 s full pass.**
- Geometry finding (attack result): with `--real` pointing at a SEAT COPY outside the walked trees, the same harness yields semantic 75/76 with survivor `M-walk-exempt-all` (measured, dispatch-era bytes, unmutated 0/0, force-true 186/186). Root cause with code: the battery always passes `--tree-exempt <realPath>` (`scripts/negatives-filechooser-r78.mjs:547`) and mirrors the lane by SYMLINK (`:456-461`), so the exemption only ever overlaps the walk when the receipt under test itself lives inside a walked tree — the production shape. Outside that geometry the mutant is a logical no-op and falsely survives. Three other runs (poisoned tree, two rewrite races) also returned `holds:false` — each solely via `unmutatedExit 1` with mutation kills still perfect (186/186, 76/76, zero survivors in every raced run). Preserved: `kill-power-a-poisoned.json`, `kill-power-a-raced.json`, `kill-power-a-raced2.json`.

## 5. Current-state cross-checks

- Settled scored receipt under its own pin (`--expect-nonce tabi-r78-l1-4920e0790fa9`): **rc=0, clean, 186 checks, 0 findings** (`counter-scored-settled.json`).
- Tree receipt under the OLD dispatch pin: sole delta is `nonce-expected`, exit 1, no other findings (`counter-currenttree-oldpin.json`) — intermediate states were otherwise fully valid.
- L1-side artifacts observed (not mine to fix): their `scored/negatives-a.exit` recorded 1 at 15:26:07 (raced their own rewrite / stale pin) and `scored/killpower-a.out` (15:34:52) shows a node `rmSync` crash — the pre-forceRm symptom their 15:37 harness edit addresses.

## Findings

- **F1 (resolved mid-flight):** a committed selftest stdout capture inside the walked tree refused every fresh counter run (`prior-set-unparsable`). Counter behavior correct by design; repair was moving the file outside the walked trees. Keep gate/battery/kp outputs under `.ufo/waves/round-78-seats/`.
- **F2 (process risk):** the scored receipt was re-scored 4× and instruments/freeze re-pinned 3× while measurement seats ran; three of my six kill-power/battery passes raced rewrites (each produced spurious `unmutatedExit 1` / nonce-expected cascades, all documented above). Recommend settling instruments before dispatching measurement seats.
- **F3 (documentation nit):** `M-walk-exempt-all` kill requires production geometry (`--real` inside a walked tree); worth a harness comment so a future seat-copy run is not misread as a real survivor.

## Artifacts (all under `.ufo/waves/round-78-seats/R78Exec1/`)

`receipt.json` (driver, final), `counter.json` (clean 186), `counter-attempt1-poisoned.json`, `counter-isolated.json`, `counter-now.json`, `counter-currenttree-oldpin.json`, `counter-currenttree-ownpin.json`, `counter-scored-settled.json`, `negatives-a.json` (dispatch bytes 397/397), `negatives-a-settled.json` (400/400), `negatives-a-poisoned.json`, `negatives-b.json` (397/397), `kill-power-a.json` (FINAL holds:true), `kill-power-a-poisoned.json`, `kill-power-a-raced.json`, `kill-power-a-raced2.json`, `scored-at-dispatch.receipt.json`, `freeze-check-final.txt`.

Scratch `/fast/scratch/hyaku/tabi-r78/R78Exec1` removed at close. No tool installs were needed (record: none).
