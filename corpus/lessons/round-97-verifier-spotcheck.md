# tabi round 97 — verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Round 97 of lane tabi, base `607c8b022b74440d673976ca94175a0ebf005413`, lane HEAD
`7b9f5ecbc3cc7e1041c43b40d5cac4ea62a0930d`. Report `.ufo/reports/round-97/tabi.md` (fleet repo). The
driver log lines, copied from the mutable `.ufo/watchdog.log`:

    2026-11-09T00:09:48-03:00 launch tabi round=97 pgid=1057005 driver=hyaku-inline attempt=1
    2026-11-09T00:59:30-03:00 complete tabi round=97; hyaku-inline attempt=1

I did not author this round. I checked the round and closed it; I did not change any lane-authored file.

## 1. Conformance (PROTOCOL §Round-robin closure step 1)

| check | command | observed | result |
|---|---|---|---|
| report committed by the lane identity | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-97/tabi.md` | `tabi-shokunin tabi@shokunin.local e6f7399b… 2026-11-09 00:58:43 -0300` (after the last lane commit, 00:57:52) | pass |
| `SHONEN` heading, one line per box | read the report, lines 156-161 | 4 lines, all `[~]`, each with a pointer (LOG.md:4369 `## Round 97`; SKILL.md:3421; `w1/R97Exec1.md`; `w1/R97Connector.md` §3 at line 71) | pass |
| every cited commit exists and is an ancestor of `master` | `git rev-parse <h>^{commit}`; `git merge-base --is-ancestor <h> master` for 607c8b02, 4a4e15e3, be9487f6, decbcdfb, 7b9f5ecb | all resolve to full hashes, all rc 0; `git log 607c8b02..master` is exactly the 4 round commits, all `tabi-shokunin` | pass |
| lane pushed, nothing left uncommitted | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `ahead=0 behind=0 head=detached tracked=0 untracked=0`, local=remote=`7b9f5ecb…`; porcelain empty | pass |
| dispatched prompt carries the template contract | `sed` the 4 placeholders into `templates/round-prompt.md` (140 lines), `diff` against lines 1-140 of `.ufo/prompts/tabi-round-97.md` | only line 1 (`<tabi-repo>` → `tabi-shokunin`) and line 6 (`{{AXES}}` → `coverage + calibration (browser and web-interaction craft)`) differ; §6 hyaku addendum, §7 and §8 (Amendment 59, line 953) follow | pass |
| evidence timestamps not after the commit that ships them | `jq .generatedAt` on the receipt; `git log --format='%h %ci'` | receipt `2026-11-09T03:25:30.038Z` (00:25:30 -03) ≤ `be9487f6` committed 00:25:36; `claims.json` frozenAt 00:24:35 ≤ `4a4e15e3` committed 00:24:41 (its author date 00:08:59 is the jj change-creation stamp, before launch; the committer date is after launch) | pass |
| gate registered at its registry home | `grep -n -A8 '## Round 97 gate registry' SKILL.md` | counter (gate), driver (probe), battery (gate, the counter's self-test) each have a row at SKILL.md:3426-3428 | pass |

This is a real report with commits, not a marker report. Step 1 found no conformance defect.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 97` →
`PREFILE-FALSIFICATION: pass claims=1 rows=13 attack_seats=7 findings=0`, exit 0.

The ledger `.ufo/waves/round-97/claim-falsification.tsv` has 13 rows, one per w1 seat artifact (12 seats plus
the R97Critic3 trust-probe output). Two rows are `falsifies-wording`, both naming `plans/round-97.md`:

- R97Scribe F1: "fresh browser and profile" and "getTargets after load, before the call" are driver-pin
  facts the counter does not record. A1 item 1 (plans/round-97.md:185-195) reads them as performed by the
  sha-pinned driver; the counter enforces their consequences (24 distinct browser ids, frames, iframe
  targets, leg-arm fields).
- R97Sentinel: the identity sentence is wider than the instrument (empty dirs, transitive packages, root
  lock unbound; lock integrity a self-reported string). A1 items 4 and 6 (plans/round-97.md:203-222)
  narrow it to the two top-level package dirs' version, one file sha256 and the regular-file/symlink set.

Counter, driver and battery bytes are unchanged after A1 (`git diff --stat 4a4e15e3 7b9f5ecb -- scripts/`
is empty), so no number moves. Sweep for the wide wording at the tip
(`grep -n -i -E 'fresh browser and profile|whole installed package tree|lockfile integrity|lock integrity'`
over the r97 note, README, SKILL, LOG, SCORECARD and lesson): the r97 note (line 79) carries the narrowed
form; SKILL and LOG carry none; **corpus/README.md:1276-1277** still says "pinned on version, lockfile
integrity, one upload-bearing file and a whole-tree sha256" without the A1 qualification (it does list
"transitive-package identity" as frontier). That is a correction-sweep defect in a record file, not a
widening of the frozen claim: routed as D1 below. Both ledger rows are real and the amendment reconciles
both for the claim. Neither row blocks C1.

## 3. Claims

C1 is a coverage claim and a capability acquisition, `client-oopif-uploadfile-linux`, sourced S237 and
S238. It rests on a lane-owned gate, the counter `scripts/check-client-oopif-uploadfile-round97.mjs`.
Under PROTOCOL §Gate standard (Closure consequence) I did **not** run it. I verified its committed evidence
and re-measured everything reachable with plain commands over committed bytes.

| what | command (run by me at closure) | observed | vs report |
|---|---|---|---|
| before: the instruments are absent at base | `git cat-file -e 607c8b02:<f>` for driver, counter, battery | rc 128 ×3 | matches |
| instrument bytes equal the frozen pins | `git show 7b9f5ecb:<f> \| sha256sum` ×3 | `09f0c2fe2895…`, `8571f6b9971b…`, `22b63727b75c…`, equal to `claims.json` `instruments` and `controls/instrument-sha256.txt` | matches |
| scored run verdict | `cat scored/c1-live.rc`; `jq '{verdict,checkCount,findings:(.findings\|length),revision,nonce,receiptSha256}' scored/c1-live.json` | rc 0; `clean`; 232; 0; revision `4a4e15e3…`; nonce `tabi-r97-live-152ce8256675`; receiptSha256 `6c9481318388…` | matches |
| committed receipt is the scored receipt | `sha256sum` + `cmp` of `corpus/evidence/round97/client-oopif-uploadfile/receipt.json` and `scored/live-receipt.json` | both `6c9481318388…`, byte-identical | matches |
| leg-level predicate | `jq -r '.legs[] \| [.leg,.outcome,.childFiles,(.childEvents\|map(type:T/U)),.parentFiles,(.iframeTargets\|length),.errName,.errMessage]'` on the receipt | 24 legs (reps 3 × 8 arms). PUX, PUS: `[["tabi-r97-answer.txt",22]]`, `input:T,change:T`. PLX, PLS: same file, `input:U,change:U`. PLL: same file, `T,T`. PUC: `[]`, `T,T,U,U`. PUM: `[["tabi-r97-missing.txt",0]]`, `T,T`. PLM: `error`, `Error` "ENOENT: no such file or directory, stat '…/tabi-r97-missing.txt'", files `[]`, no events. Every `parentFiles` `[]`; cross-site legs 1 iframe target, same-site 0; `failures: []`; Chromium 155.0.8059.84; lib pins incl. `treeSha256` equal the counter constants (check.mjs:53-54) | matches |
| self-test (battery) | `jq` over `controls/battery.json` | `ok: 70`, `failed: []` (70/70) | matches |
| do-nothing / wrong controls | `controls/rc.txt`; `jq '{verdict,checkCount,findings[].id}'` on each control JSON | no-work base rc 128; r96 receipt rc 1 (`schema`,`nonce`,`driver-pin`,`libs`); positive rc 0 clean 229; wrong-site rc 1 (`cross-host`,`leg-arm`,`frames`,`iframe-targets`); wrong-library rc 1 (`libs`); tampered-tree rc 1 (`libs`, observed `treeSha256` `e3110042…` ≠ pinned `968a85e8…`); driver-pin rc 1; 7 setup refusals rc 2; `leftover-chromium-all=0` | matches |
| independent reproductions | `grep checkCount w1/R97Exec2-*.json` | default 232, `--reps 10` 736 | matches |
| owned axes not harmed | `git diff --numstat 607c8b02 7b9f5ecb -- SCORECARD.md SKILL.md LOG.md corpus/README.md corpus/SOURCES.md` and `--diff-filter=M -- corpus/knowledge corpus/lessons` | additions only (SCORECARD +36/-0: a `## Round 97` section, one capability row, scalar coverage 9 → 9, no scalar lowered); r96 note +12/-0, r96 lesson +8/-0; PROVINCE.md, SHONEN.md, QUALITY.md untouched | no harm |

So C1 was partly re-measured (before-state, instrument digests, receipt identity and the full leg table,
control verdict files, SOURCES and knowledge counts) and partly verified from evidence (the `--live`
verdict, the battery tally; the gate was not executed). C1 verifies. No exploratory claim was declared.

Per-axis verdicts:

| axis | verdict |
|---|---|
| coverage | improved: new capability row `client-oopif-uploadfile-linux`, verified as above |
| depth | unchanged |
| operability | unchanged |
| freshness | unchanged |
| calibration | unchanged: r96 D1 appended corrections and the D3 tree binding are record/instrument work, not claimed as an axis move |
| adjacency | unchanged |

## 4. Discernment spot-check (LEARNING.md §Discernment is checked from outside)

Re-opened with `curl -sS -w '%{http_code}'` at closure; each fetch was then `cmp`'d against the staged copy
under `.ufo/waves/round-97/sources/`.

| item | decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S237, Puppeteer `ElementHandle.ts` @ puppeteer-v25.16.0 | admit, tier A, `mined` | https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/ElementHandle.ts → HTTP 200, 6,124 B, sha256 `c86ed958566f`, byte-identical to staged | agree | Line 158 `await this.client.send('DOM.setFileInputFiles', {`, 159 `objectId: this.id,`, 160 `files,` match the row exactly. Lines 138-150 are the zero-files branch: script-built `DataTransfer` plus `new Event('input'/'change')` under the "XXX: These events should converted to trusted events" comment, which grounds PUC's trailing `U,U`. Line 118's comment "confirm that they exist" is followed by no existence check, consistent with PUM. Pinned-tag source is tier A for this scope. |
| S238, Playwright `fileUploadUtils.ts` @ v1.65.0 | admit, tier A, `mined` | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/fileUploadUtils.ts → HTTP 200, 3,437 B, sha256 `96dd5ef0713d`, byte-identical to staged | agree | Line 62 is `if (!frame._page.browserContext._browser._isBrowserCollocatedWithServer) {` as quoted, and line 63 "read files into buffers" grounds the payload path. Together with `chromium.ts` 162-163 it explains PLX/PLS (untrusted) against PLL (trusted). |
| `chromium.ts` v1.65.0 as its own row | reject (folded into S238's anchor) | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/chromium/chromium.ts → HTTP 200, 24,127 B, sha256 `59286d443f29`, byte-identical to staged | agree | Lines 162-163 `if (!options.isLocal)` / `browser._isBrowserCollocatedWithServer = false;` are exactly what S238's anchor quotes. A separate row would add no claim-bearing content, and the recorded flip (a later claim on another part of the file) is concrete. |
| `crPage.ts` v1.65.0 as a second row | reject (duplicates S230's URL) | https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/chromium/crPage.ts → HTTP 200, 59,431 B, sha256 `918f0f9beed3` (same size as r96's S230 re-open) | agree | Lines 343-351 (`setInputFilePaths` → `DOM.setFileInputFiles` on the frame's session) and 445 (the `Page.fileChooserOpened` listener) are as described. A second scope on S230's URL would be a W04 duplicate, and the r96 D1 correction now grounds the listener on these lines without a row. |

`corpus/SOURCES.md` row checked: S239 (SOURCES.md:254), newly written post-wave. Re-fetch of
https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/injected/src/injectedScript.ts →
HTTP 200, 85,112 B, sha256 `ff78c2368acf`, byte-identical to staged. Line 1027 `input.files = dt.files;` and
line 1028 `input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));` match the ≤25-word
quote and its location; `change` follows at 1029. Also checked S237's and S238's rows (SOURCES.md:252-253):
anchors and digests are exact (above).

`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit 0, with
W04 duplicate-URL-across-scopes warnings only on older rows (through S223). None is on S237-S239.

## 5. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | knowledge 109 → 110 (`git ls-tree --name-only <rev> corpus/knowledge/ \| wc -l`); SOURCES 236 → 239 (`git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'`); new capability row (client direct-set upload and event trust, beyond r96's chooser path). |
| quality | improved | r96 D1 answered by appended corrections (r96 note +12/-0, r96 lesson +8/-0; the listener is now grounded on crPage.ts:445, which I re-opened). r96 D3 answered in the instrument: whole-tree sha256 per client, shown to fail on a comment-only edit (`controls/counter-tampered-tree-live.json`, `libs`). The misanchored-edit class got a mined check shown to fail (`mined/positive-committed.txt` rc 0 vs `mined/positive-mutant.txt` rc 1, 4 failures), while `node --check` was shown not to catch it (`mined/syntax-mutant.txt` rc 0). One residual: README wording not swept (D1). |
| discernment | improved | The spot-check agrees with the gate on both admits and both rejects. Both `falsifies-wording` rows were narrowed before filing. R97Scout's opened sources were held as leads, not rows. |

## 6. Routed defects (owner: tabi; due next round)

- **D1**: `corpus/README.md` lines 1276-1277 (`## Round 97 coverage`) still say the clients are "pinned on
  version, lockfile integrity, one upload-bearing file and a whole-tree sha256". A1 items 4 and 6 and the
  r97 note's Limits narrow this: lockfile integrity is a self-reported string, and the tree sha covers
  only the two top-level package directories' regular files and symlinks (transitive packages and the
  root lock are unbound). Append a narrowing correction to the README; do not rewrite it.
- **D2** (carried from the lane's SCORECARD Planned r98): add battery cases for the R97Mut survivors M40,
  M42 and M66, and live killers for M75-M77 (`driver-exit`/`ports-bound`/`missing-bound`). These are the
  same class as the r96 survivors M20/M51/M52/M54/M65/M67, which are still open.
- **D3** (carried): transitive-package identity (R97Sentinel: a comment-only `ws` edit scores clean); r95
  D1-D3 and the R95Mut survivors stay open.

Operator note: the four SHONEN boxes (all `[~]`) carry pointers a non-author can check: LOG `## Round 97`
(LOG.md:4369), SKILL `## Round 97 gate registry`, the cold reproductions R97Exec1 and R97Exec2 (232 and
736 checks), and R97Connector §3. Promotion is operator-owned; nothing is written to SHONEN.md here.
