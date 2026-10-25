# MutC1Counter — mutation matrix for the C1 counter (`check-bfcache-receipt.mjs`)

Seat: L1Tabi25.MutC1Counter (mutation-tester, wave 1, round 25). Lane HEAD `c8ef3084c6363f265b9d23285296ab3547654f57`.
Scratch: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/MutC1Counter/`. No lane file was edited.

## TL;DR

- I built a matrix of 13 mutants plus one valid receipt. Each mutant is a one-hunk byte change to one pristine receipt, and each has a **required finding id**. The reference oracle (`oracle.mjs`) gives the valid receipt exit 0 with no findings, and every mutant exit 1 with its required id. So the matrix is satisfiable and each mutant can be told apart from the valid receipt.
- I ran the same files against the only C1 counter that exists, ExecCounterC1Proto's prototype (sha256 `1e199ffa…`, unchanged before and after the run). **It kills 8 of 13 mutants. 5 survive, meaning the prototype scores them `valid=true` (exit 0).** These are coverage findings:
  - **m5:** a duplicated, byte-identical restore event, with `summary.restores` raised to 2 and the digest recomputed. The prototype reports `restores=2, valid=true`. This is the requested mutant (5). It passes the frozen C1 target (`restores>=1, valid=true`) with only one real goBack.
  - **m5b:** the restore event replayed with `tMs` changed by 1. The prototype also reports `restores=2, valid=true`.
  - **m5c:** a duplicated, byte-identical `Navigation` event pair. Valid in the prototype.
  - **m7b:** the flag `--disable-features=BackForwardCache` added. Valid in the prototype. The claim that this disables bfcache is `[INFERENCE]`.
  - **m9:** the goBack step records a failed CDP call (`Page.goBack` returning -32601). Valid in the prototype.
- Load-bearing observation from the sibling ExecBfcacheDiagnostics capture: **on this host's Chrome/154.0.8037.97, `Page.goBack` returns `{"code":-32601,"message":"'Page.goBack' wasn't found"}`**. The real history step is `Page.navigateToHistoryEntry {"entryId":13}`. A receipt whose goBack step only records the method name is therefore unbacked. Mutant m9 covers this case.
- Missing receipt: both the prototype and the oracle exit 2 (could-not-evaluate) and never report 0. Live at HEAD, the prototype run with `--rev HEAD` gives exit 2 with `receipt absent at c8ef3084…`.

## Axes (godspeed)

1. **Separation:** every invalid mutant is non-clean, and the valid receipt is clean.
2. **Isolation:** each mutant changes one thing, so a counter that misses one check misses exactly one row.
3. **Real-ground fidelity:** the pristine events are real CDP bytes, not hand-crafted.

Moves kept:
- I recomputed the digest on every events edit except m6, so the digest check can't mask the other checks. This improves isolation.
- I built the pristine receipt from observed events. This improves fidelity.
- I added m5a, m5b, m5c, m7b, m9 and m10 beyond the 8 requested rows. These improve separation without harming anything, because the 8 requested rows are unchanged.

## Provenance (observation)

- The pristine events are the three `Page.frameNavigated` messages, copied verbatim, at `events[15]`, `events[44]` and `events[65]` of `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/ExecBfcacheDiagnostics/runs/v1-goback/capture.json`, sha256 `0a23ff90330a660c9f10cdf056f24d552076e91678d07c283ba665da0be73636`. That is the sibling seat's run; I launched no browser. Their types are `Navigation`, `Navigation` and `BackForwardCacheRestore`.
- The restore event reuses the loaderId of the first navigation to A, `8DFC0ECCFCED3BB7BE3BF2671ECE9056`, and has no per-event unique id. So event identity can't tell a replayed restore from a real second restore at the same history entry. Only byte-identity or a count bound can. This is why m5b exists.
- The goBack evidence is the capture's `steps[]`:
  - `{"label":"Page.goBack","method":"Page.goBack","response":{"id":9,"error":{"code":-32601,"message":"'Page.goBack' wasn't found"}}}`
  - then `{"label":"navigateToHistoryEntry","method":"Page.navigateToHistoryEntry","params":{"entryId":13},"response":{"id":10,"result":{}}}`
  - `Page.getNavigationHistory` shows `currentIndex` 2 before and 1 after.
- The flags are `argv.txt` from the same run, minus the binary name and `about:blank`. They do **not** contain `--disable-back-forward-cache`.
- The schema and digest follow the prototype: `"schema":"tabi-bfcache-journey-v1"` and `digest = "sha256:" + hex(sha256(JSON.stringify(events)))`, with the recipe at `ExecCounterC1Proto/check-bfcache-receipt.mjs:9` and `:49`.
- The pristine receipt is `receipts/m8-valid-pristine.json`, sha256 `d8bc8e6f70a57b747cd9ed7c640dc35c4f709b7a9bbe26c5125679002de780f2`. Its events digest is `sha256:8f77d9d7c893ee9aaef46744ba431818d11bf96ef6a283880204620b868b0fca`.
- The goBack step carries the history-step evidence, a schema extension I propose:
  - `"cdp":{"method":"Page.navigateToHistoryEntry","params":{"entryId":13},"result":{}}`
  - `"history":{"before":2,"after":1}`

Pristine layout, used for the line numbers below:
- Line 7 is `run.flags`.
- Lines 9–11 are the steps: navigate A, navigate B, then goBack A at line 11.
- Lines 15–17 are the events: Navigation A at line 15, Navigation B at line 16, BackForwardCacheRestore A at line 17.
- Line 19 is the summary, `{"restores":1,"navigations":3,"goBacks":1}`.
- Line 20 is the digest.

## Matrix

Byte changes are relative to the pristine receipt. The full unified diffs are in `out/<id>.diff`.

"Required id" is the finding the production counter MUST emit. Ids marked NEW are absent from the prototype's vocabulary. The other ids each column lists co-fire and are allowed.

| # | Mutant | Exact byte change | Required id | Prototype (exit, findings) | Oracle (exit, findings) | Verdict vs prototype |
|---|---|---|---|---|---|---|
| 1 | m1-events-emptied | Lines 14–18 become `  "events": [],`. Line 20 digest becomes `sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` (recomputed over `[]`). | `events-empty` | 1, events-empty, restore-unbacked | 1, events-empty, restore-unbacked, navigation-count-mismatch | killed |
| 2 | m2-summary-restores-2 | Line 19 `"restores":1` becomes `"restores":2`. That is one byte, `1` to `2`. | `restore-unbacked` | 1, restore-unbacked | 1, restore-unbacked | killed |
| 3 | m3-no-goback-step | Line 11 (the goBack step) is deleted, and the trailing `,` is removed from line 10. Events are untouched, so the restore event stays. | `no-history-step` | 1, no-history-step, restore-target-mismatch | 1, no-history-step, restore-target-mismatch, restores-exceed-history-steps | killed |
| 4 | m4-no-events-key | Lines 14–18 (the whole `"events"` member) are deleted. The goBack step stays, and the digest is left as is. | `events-empty` | 1, events-empty, restore-unbacked, digest-mismatch | 1, events-empty, restore-unbacked, navigation-count-mismatch, digest-mismatch | killed |
| 5 | m5-duplicate-restore-pair | Line 17 is duplicated verbatim after itself, with `,` appended to the original. Line 19 becomes `{"restores":2,"navigations":4,"goBacks":1}`. Line 20 digest becomes `sha256:cd8158bf5a903e18103021c72b7b6fe076b4c4f6706be2b5036a1023772ecb6f`. | `duplicate-event` (NEW) | **0, valid=true, restores=2** | 1, duplicate-event, restore-unbacked, navigation-count-mismatch | **SURVIVED** |
| 5a | m5a-duplicate-restore-summary-untouched | Line 17 is duplicated as in m5, and the digest becomes `cd8158bf…` as in m5. The summary is untouched. | `duplicate-event` (NEW) | 1, restore-unbacked (reports restores=2) | 1, duplicate-event | killed, but for the wrong reason (the prototype counts 2 restores) |
| 5b | m5b-replayed-restore-new-tMs | A copy of line 17 is appended with `"tMs":857` changed to `"tMs":858`. That is one byte, `7` to `8`. Line 19 becomes `{"restores":2,"navigations":4,"goBacks":1}`. Line 20 digest becomes `sha256:6be61f765fe50849b72e96511eadf1c630f241dae043c834803cd5b88052cb73`. | `restores-exceed-history-steps` (NEW) | **0, valid=true, restores=2** | 1, restores-exceed-history-steps | **SURVIVED** |
| 5c | m5c-duplicate-navigation-pair | Line 15 (Navigation A) is duplicated verbatim after itself. Line 20 digest becomes `sha256:6b51470a4b35636af2119d016b04018a564c7c305f14a5670e25eb52e3eea6a5`. The summary is untouched, so `navigations` is still 3. | `duplicate-event` (NEW) | **0, valid=true** | 1, duplicate-event | **SURVIVED** |
| 6 | m6-event-edited-digest-stale | Line 16 loaderId `623A3878FA9FC694401A074FE4BDA52F` becomes `…4BDA52E`. That is one byte, `F` to `E`. The digest is not recomputed. | `digest-mismatch` | 1, digest-mismatch | 1, digest-mismatch | killed |
| 7 | m7-flag-disable-bfcache | Line 7: `,"--disable-back-forward-cache"` is appended before the closing `]` of `flags`. | `bfcache-disabled` | 1, bfcache-disabled | 1, bfcache-disabled | killed |
| 7b | m7b-flag-disable-features-bfcache | Line 7: `,"--disable-features=BackForwardCache"` is appended to `flags`. | `bfcache-disabled` | **0, valid=true** | 1, bfcache-disabled | **SURVIVED** (equivalence is `[INFERENCE]`, see below) |
| 8 | m8-valid-pristine | None (sha256 `d8bc8e6f…`). | none (clean) | 0, restores=1, valid=true | 0, restores=1, valid=true | clean on both |
| 9 | m9-goback-cdp-error | Line 11 `cdp` becomes `{"method":"Page.goBack","error":{"code":-32601,"message":"'Page.goBack' wasn't found"}}`, and `"history"` becomes `{"before":2,"after":2}`. | `history-step-failed` (NEW) | **0, valid=true** | 1, history-step-failed | **SURVIVED** |
| 10 | m10-restore-url-not-goback-target | Line 17 `"url":"http://127.0.0.1:19521/a.html"` becomes `…/b.html`. Line 20 digest becomes `sha256:002c545e58436ac8f084e3182f5f8521d9de5e97d0dd38ef3a5750ab3d88f8cf`. | `restore-target-mismatch` | 1, restore-target-mismatch | 1, restore-target-mismatch | killed |
| — | control-fake-receipt (lane `control/fake-receipt-bfcache.json`, sha256 `578a466a…`) | Not a mutant. This is the frozen skip-work control. | `events-empty` | 1, events-empty, restore-unbacked, digest-missing | 1, history-step-failed, events-empty, restore-unbacked, navigation-count-mismatch, digest-missing | FAIL validity on both, as the claim requires |
| — | missing-receipt (`receipts/does-not-exist.json`) | No file. | could-not-evaluate (exit 2) | 2, could-not-evaluate | 2, could-not-evaluate | exit 2 on both, never 0 |

Totals, from `cut -f1,3,5 out/run.log` (36 lines, log sha256 `074f866799e29ccbcf600442583fc20ab5dc63ad40ce8270ad0c4ae279718b0f`):
- **Prototype:** 13 mutants, 8 killed (m1, m2, m3, m4, m5a, m6, m7, m10) and 5 survived (m5, m5b, m5c, m7b, m9). The valid receipt scored clean.
- **Oracle:** 13 of 13 killed, and the valid receipt scored clean.

## Coverage findings against the prototype (code shapes that are vacuous)

These are findings about the prototype, not changes to the contract. The minimal check that kills each one is what the production counter MUST add.

1. **Replay inflation (m5, m5b).**
   - **Cause:** at `check-bfcache-receipt.mjs:84`, `restoreEvents = evs.filter(type===RESTORE …)` counts every element. At `:90`, the only bound is `claimed !== restoreEvents.length`. So a forger who duplicates the restore line and bumps `summary.restores` passes, and the digest is no defence because the forger recomputes it. That is m5: `restores=2, valid=true` against one real goBack.
   - **Kill:** (a) dedupe byte-identical events and emit `duplicate-event`. (b) Require counted restores to be at most the number of goBack steps, emitting `restores-exceed-history-steps`.
   - **Why (b) is needed:** m5b changes one byte (`tMs`), so byte dedupe misses it. The restore event shares the original loaderId, so loaderId dedupe would misfire on genuine multi-trip runs. The count bound kills m5b.
2. **Navigation duplication (m5c).** The prototype never reads `summary.navigations`. The requested invariant "count must match unique navigations" therefore needs `duplicate-event`, plus a `navigation-count-mismatch` check when `summary.navigations` is present.
3. **Flag-equivalent disablement (m7b).** At `:61`, the prototype only matches `startsWith("--disable-back-forward-cache")`. Adding the check `--disable-features=` list contains `BackForwardCache` kills m7b. `[INFERENCE]`: I have not verified that `--disable-features=BackForwardCache` disables bfcache in Chrome/154. The frozen killRule names only `--disable-back-forward-cache`, so m7b is RECOMMENDED, not required by the claim text.
4. **Unexecuted history step (m9).**
   - **Cause:** the prototype treats `{"action":"goBack"}` as proof that a history step happened (`:64–65`, `:70–72`). The frozen killRule says the run "must have executed a history step (goBack) with a matching before/after target". The observed `Page.goBack` -32601 on this host shows a recorded method name is not execution.
   - **Kill:** require the goBack step to carry the CDP call (method in {`Page.navigateToHistoryEntry`, `Page.goBack`}, no `error`, `result` present) and `history.after === history.before - 1`. Otherwise emit `history-step-failed`.
   - **Consequence:** the harness receipt (ExecHarnessC1) must record `steps[].cdp` and `steps[].history` for this check to be evaluable. With that check, the oracle also flags the frozen control, whose steps carry no CDP record.
5. **m5a is killed for the wrong reason.** The prototype reports `restores=2` (`restore-unbacked`), because it counts the duplicate as a second restore. The production counter SHOULD report `restores=1` with `duplicate-event`.

## Claim-text tension (observation, then inference)

- **Observation:** C1's declared text says "via CDP Page.goBack". On this host that method does not exist; the -32601 response quoted in Provenance shows it.
- `[INFERENCE]`: the honest receipt records the history step as `Page.navigateToHistoryEntry` to the previous entry. That is still a real history step, not a synthetic shortcut, and the killRule's "history step (goBack)" reads as the action, not the wire method. Whether to record a claims revision is the integrator's call. I assert no judgment.

## Proposed finding vocabulary (production counter)

- **Existing in the prototype:** `events-empty`, `event-not-raw`, `restore-unbacked`, `no-history-step`, `goback-target-mismatch`, `restore-target-mismatch`, `digest-missing`, `digest-mismatch`, `bfcache-disabled`, `schema-mismatch`, `receipt-unparseable`. Exit 2 means could-not-evaluate.
- **NEW:** `duplicate-event`, `restores-exceed-history-steps`, `navigation-count-mismatch`, `history-step-failed`.

## Restoration and cleanup evidence

- **Pristine receipt:** sha256 before `d8bc8e6f70a57b747cd9ed7c640dc35c4f709b7a9bbe26c5125679002de780f2`, and the same after. The `pristine-before` and `pristine-after` rows both score exit 0 on both detectors.
- **Mutants:** each is a separate copy generated from the pristine receipt, so nothing needed restoring.
- **Prototype:** `ExecCounterC1Proto/check-bfcache-receipt.mjs` sha256 before `1e199ffa8c9c925cd0fc1a75acf1a715c34e1ad07146a085c2c5cc10487a2046`, and the same after. I only ran it, never edited it.
- **Processes:** I launched no browser or server. `pgrep -u "$USER" -fa MutC1Counter` printed `no-processes`.
- **Lane tree:** untouched. I used only read-only git: `ls-tree`, `rev-parse`, and the prototype's own `cat-file`/`show`.
- **Negative sweep:** `git ls-tree -r --name-only HEAD -- scripts corpus/evidence | grep -i bfcache` gives one line, `corpus/evidence/round-24/sources/bfcache.html`. So no production counter and no round-25 receipt are committed at `c8ef3084`.
- **Tools installed or updated:** none (node from the host; `node --version` was not recorded).

## Reproduce

Scratch file hashes:
- `gen.mjs`: `d1c48fd871052a3fbae1741b8d42859bb32e9913ca43ccae3fbc8e5df27ce1e6`
- `oracle.mjs`: `c1d9ac94faad520e762e08d39174a7b9770a9dc73e00128d9e97adb4d06591d9`
- `run.sh`: `7b4b6622062aefaaa638e9305b5fbfed831b76c0e7a2f1ea86bb896321bada25`

```bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/MutC1Counter
bash run.sh > out/run.log 2>&1        # regenerates receipts/, scores proto + oracle, writes out/*.diff
cut -f1,3,5 out/run.log               # per-row exit codes
```

To retarget the matrix at the production counter once it lands, change `PROTO=` in `run.sh` to `$LANE/scripts/check-bfcache-receipt.mjs`. If the production digest recipe differs from `"sha256:"+hex(sha256(JSON.stringify(events)))`, also update `digestOf` in `gen.mjs` and `oracle.mjs`. Acceptance: every row's required id is present, and the valid receipt and missing receipt give exit codes 0 and 2.
