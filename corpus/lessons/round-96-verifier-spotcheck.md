# tabi round 96 — verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Round 96 of lane tabi, base `b16b3aa1a90ea0ec734d9834dc49b0615b6ab950`, lane HEAD
`e62077ce2315d9b6cd1a4dd4a9d3c4d443c7b840`. Report `.ufo/reports/round-96/tabi.md` (fleet repo). The
driver log lines, copied from the mutable `.ufo/watchdog.log`:

    2026-11-08T23:26:51-03:00 launch tabi round=96 pgid=295908 driver=hyaku-inline attempt=1
    2026-11-09T00:06:10-03:00 complete tabi round=96; hyaku-inline attempt=1

I did not author this round. I checked the round and closed it; I did not change any lane-authored file.

## 1. Conformance (PROTOCOL §Round-robin closure step 1)

| check | command | observed | result |
|---|---|---|---|
| report committed by the lane identity | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-96/tabi.md` | `tabi-shokunin tabi@shokunin.local 6ad48efb… 2026-11-09 00:05:08 -0300` (after the last lane commit, 00:04:19) | pass |
| `SHONEN` heading, one line per box | read the report, lines 109-114 | 4 lines, all `[~]`, each with a pointer | pass |
| every cited commit exists and is an ancestor of `master` | `git merge-base --is-ancestor <full> master` for b16b3aa1, ba611b22, 75fe36dc, 3f0e422a, e62077ce | all `ancestor-ok` | pass |
| lane pushed, nothing left uncommitted | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain` | `ahead=0 behind=0 head=detached tracked=0 untracked=0`, local=remote=`e62077ce…`; porcelain empty | pass |
| dispatched prompt carries the template contract | `diff` of lines 1-140 of `templates/round-prompt.md` against `.ufo/prompts/tabi-round-96.md` | only `{{LANE}}`/`{{ROUND}}`/`{{FLEET_ROOT}}`/`{{AXES}}` substitutions differ; §6 hyaku addendum and §8 (Amendment 59) follow | pass |
| evidence timestamps not after the commit that ships them | `jq .generatedAt` on the receipt | `2026-11-09T02:48:24Z` (23:48:24 -03) ≤ commit `75fe36dc` 23:48:31; tip receipt 23:53:41 shipped in `e62077ce` 00:04:19 | pass |
| gate registered at its registry home | `grep -n '## Round 96 gate registry' -A12 SKILL.md` | the counter (gate), the driver (probe) and the battery (gate, self-test) each have a full row at SKILL.md:3417-3419 | pass |

The round filed a real report with commits. It is not a marker report. Step 1 found no conformance defect.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 96` →
`PREFILE-FALSIFICATION: pass claims=1 rows=13 attack_seats=7 findings=0`, exit 0.

The ledger `.ufo/waves/round-96/claim-falsification.tsv` has 13 rows. Two rows are `falsifies-wording`:
R96Scribe (the prose "never resolves", the phrase "chooser opened", and the S230 citation) and R96Sentinel
(library identity is bound through three pinned fields only). Both rows name `plans/round-96.md` as their
narrowing. I read §Post-wave amendment A1 (plans/round-96.md:153 onward):

- Items 1-3 limit the prose to the 6 measured cross-site Puppeteer legs at 3000 ms. They also say that
  only PPW proves the chooser opened, and that S230's located quote is `_handleFrameTree`, not the
  listener.
- Item 4 limits the library subject to "the `--deps` tree whose pinned fields match".

The counter and driver bytes are unchanged, so the receipt numbers do not move. I also searched the r96
note, README, SKILL, LOG and SCORECARD for the wider wording (`never resolves|never sees`). The only hit is
in the round-95 SCORECARD Planned paragraph (SCORECARD.md:4546). It is pre-round text labelled as a lead
and is not filed as an r96 claim.

Both rows are real, and the amendment reconciles both. Neither row blocks C1.

## 3. Claims

C1 is a coverage claim and a capability acquisition: `client-oopif-filechooser-linux`, sourced S236. It
rests on a lane-owned gate, the counter `scripts/check-client-oopif-chooser-round96.mjs`. Under PROTOCOL
§Gate standard (Closure consequence) I did **not** run it. I verified its committed evidence and
re-measured everything I could reach with plain commands over committed bytes.

| what | command (run by me at closure) | observed | vs report |
|---|---|---|---|
| before: the counter is absent at base | `git cat-file -e b16b3aa1…:scripts/check-client-oopif-chooser-round96.mjs` | rc 128 | matches |
| instrument bytes equal the frozen pins | `git show e62077ce:<f> \| sha256sum` ×3 | `4020e57ef865…`, `778d429fe090…`, `950c3ca2e557…`, the same as `claims.json`; `git diff --stat ba611b22 e62077ce -- scripts/` is empty | matches |
| scored run verdict | `cat scored/c1-live.rc`; `jq '{checkCount,findings:(.findings\|length),revision,nonce}' scored/c1-live.json` | rc 0; 165 checks; 0 findings; revision `ba611b22…`; nonce `tabi-r96-live-c1225d318ea6` | matches |
| tip re-run | same jq on `scored/c1-live-tip.json` | rc 0; 165; 0; revision `3f0e422a…` | matches |
| committed receipt is the scored receipt | `sha256sum corpus/evidence/round96/client-oopif-filechooser/receipt.json`; `cmp` with `scored/live-receipt.json` | `aad4611df158…`, byte-identical, and equal to `receiptSha256` in `c1-live.json` | matches |
| leg-level predicate | `jq -r '.legs[] \| [.leg,.lib,.cross,.outcome,.errName,.errMessage,.childFiles,.witnessEvents]'` on the receipt | PPX-1..3 and PPW-1..3: `timeout`, `TimeoutError`, "Waiting for \`FileChooser\` failed: 3000ms exceeded", childFiles `[]`; PPW-1..3 witnessEvents have exactly 1 `selectSingle` event each; PPS-1..3, PWX-1..3 and PWS-1..3: `chooser`, child filled `tabi-r96-answer.txt` (22 B); `failures: []`; Chromium 155.0.8059.84; lib pins equal `claims.json` | matches the predicate as narrowed by A1 |
| self-test (battery) | `jq` over `controls/battery.json` | `ok: 63`, `failed: []` (63/63) | matches |
| do-nothing controls | `controls/rc.txt` | no-work base rc 128, r95 receipt rc 1, wrong-site rc 1, wrong-library rc 1, 8 setup refusals rc 2, 0 Chromium processes left | matches |
| owned axes not harmed | `git diff b16b3aa1 e62077ce -- SCORECARD.md` | additions only: a `## Round 96` section, one capability row, no scalar lowered; every modified corpus/knowledge file is appended to (`git diff --numstat`: 0 deletions) | no harm |

So C1 was partly re-measured (before-state, instrument digests, receipt identity and leg table, SOURCES
and knowledge counts) and partly verified from evidence (the `--live` verdict and the battery tally; the
gate was not executed). C1 verifies.

Per-axis verdicts:

| axis | verdict |
|---|---|
| coverage | improved: new capability row, verified as above |
| depth | unchanged |
| operability | unchanged |
| freshness | unchanged |
| calibration | unchanged: appended r92/r94 corrections, not claimed as an axis move |
| adjacency | unchanged |

## 4. Discernment spot-check (LEARNING.md §Discernment is checked from outside)

| item | decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S236, Puppeteer `Page.ts` @ puppeteer-v25.16.0 | admit, tier A, `mined` | `curl` https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/cdp/Page.ts → HTTP 200, 43,820 B, sha256 `e7f2f6b8ea8b`, byte-identical to staged `.ufo/waves/round-96/sources/Page.ts` | agree | line 339 `const clientEmitter = new EventEmitter(this.#primaryTargetClient);` and line 361 `clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this));` match exactly, and lines 561-562 send `Page.setInterceptFileChooserDialog` on `#primaryTargetClient`. The ≤25-word quote (10 words) and its location are exact. Source code at the pinned tag is tier A for this scope. |
| a second row for Playwright `crPage.ts` v1.65.0 (the per-session listener) | reject (duplicates S230) | `curl` https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/chromium/crPage.ts → HTTP 200, 59,431 B (the same size as the S230 row); line 445 `eventsHelper.addEventListener(this._client, 'Page.fileChooserOpened', …)`, `_handleFrameTree` at 635 | agree, with reservation | The decision holds: it is the same document as S230, and the listener is real in it. The recorded flip, "none needed — S230 is cited by the note", is too strong. S230's row scope and anchor (SOURCES.md:245) cover frame identity at lines 636-637, not the listener. The r96 note's `source:` line still attributes "one listener per frame session" to S230. The lane admitted this in A1 item 3 but did not fix the row or the note line. Routed as D1 below. |

`corpus/SOURCES.md` row checked: S236 (SOURCES.md:251). The anchor gives lines 339/361 plus the fetch
time, HTTP status, size and digest. The quote is exact (above).

`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit 0, with
W04 duplicate-URL-across-scopes warnings only (S058…S223). None is on an r96 row.

## 5. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | knowledge 108 → 109 (`git ls-tree --name-only <rev> corpus/knowledge/ \| wc -l`). The new note's `source:` cites S236, which is `mined`, on ground the r92-r95 raw-CDP notes did not hold. SOURCES 235 → 236 (`grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'`). New capability row. |
| quality | improved | Two over-general own-lane statements got append-only corrections (r92 note +9 lines, r94 note +10 lines, 0 deletions). The unwritable-scratch hang was mined, fixed, and shown to fail (`controls/rc-firstrun-hung.txt` against rc 2 in `rc.txt`). No admitted entry failed its re-check. |
| discernment | improved | The spot-check agrees with the gate on the admit and on the reject. Both `falsifies-wording` rows were narrowed before filing. The reservation on the reject's flip text is routed as D1; it is not a disagreement with the decision. |

## 6. Routed defects (owner: tabi; due next round)

- **D1**: S230's scope and anchor (frame identity, lines 636-637) do not ground the listener attribution
  in `corpus/knowledge/client-oopif-filechooser-round-96.md` line 2 ("S230 … one `Page.fileChooserOpened`
  listener per frame session"). Fix it with either:
  - an append-only scoped row for crPage.ts v1.65.0 line 445, which an opening this round would support; or
  - an appended correction to the note that cites the pinned-bundle lines (coreBundle.js 39325) as its
    only ground.

  Also correct the lesson's reject flip text, appended rather than rewritten.
- **D2** (carried from the lane's own SCORECARD Planned): add battery cases for the R96Mut survivors
  M20/M51/M52/M54/M65/M67, and live killers for `driver-exit`/`ports-bound`.
- **D3** (carried): verify lockfile integrity against the installed `--deps` tree (R96Sentinel, A1 item 4).
- **D4** (carried): r95 spot-check D1-D3 and the R95Mut survivors stay open.

Operator note: the four SHONEN boxes (all `[~]`) carry pointers a non-author can check: LOG `## Round 96`,
SKILL `## Round 96 gate registry`, and the cold reproductions R96Exec1 and R96Exec2. Promotion is
operator-owned; nothing is written to SHONEN.md here.
