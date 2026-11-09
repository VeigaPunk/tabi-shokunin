# tabi round 98 — verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Round 98 of lane tabi, base `020ce05fc5d695a295103f53c25c6199210f3050`, lane HEAD
`b17415833feccd74fb53c7379eacdee0b2b1d05c`. Report `.ufo/reports/round-98/tabi.md` (fleet repo). The
driver log lines, copied from the mutable `.ufo/watchdog.log` (lines 3448 and 3451):

    2026-11-09T01:03:36-03:00 launch tabi round=98 pgid=226737 driver=hyaku-inline attempt=1
    2026-11-09T01:50:27-03:00 complete tabi round=98; hyaku-inline attempt=1

I did not author this round. I checked the round and closed it; I did not change any lane-authored file.

## 1. Conformance (PROTOCOL §Round-robin closure step 1)

| check | command | observed | result |
|---|---|---|---|
| report committed by the lane identity | `git log --format='%an <%ae> %H %ci' -- .ufo/reports/round-98/tabi.md` | `tabi-shokunin <tabi@shokunin.local> 815a9d68… 2026-11-09 01:50:07 -0300` (after the last lane commit, 01:49:14) | pass |
| `SHONEN` heading, one line per box | read the report, lines 176-181 | 4 lines, all `[~]`, each with a pointer (LOG `## Round 98`, LOG.md:4401; SKILL `## Round 98 gate registry`, SKILL.md:3430; `w1/R98Exec1.md`, `R98Exec2.md`; `w1/R98Connector.md` §2-3) | pass |
| every cited commit exists and is an ancestor of `master` | `git rev-parse --verify <h>^{commit}`; `git merge-base --is-ancestor <h> master` for 020ce05f, b92b161d, 172bc0a1, acd1e847, b1741583 | all resolve to full hashes, all ancestors; `git log 020ce05f..master` is exactly the 4 round commits, all `tabi-shokunin` | pass |
| lane pushed, nothing left uncommitted | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `branch=master ahead=0 behind=0 head=detached tracked=0 untracked=0`, local=remote=`b1741583…`; porcelain empty | pass |
| dispatched prompt carries the template contract | every non-placeholder, non-blank line of `templates/round-prompt.md` (116) searched verbatim in `.ufo/prompts/tabi-round-98.md` (1002 lines) | 0 missing; §6 hyaku addendum, §7 scratch discipline and §8 Amendment 59 (line 953) follow | pass |
| evidence timestamps not after the commit that ships them | `jq .generatedAt` on the receipt; `git log --format='%h author=%ai committer=%ci'` | receipt `2026-11-09T04:21:31.865Z` (01:21:31 -03) ≤ `172bc0a1` committed 01:21:36; `claims.json` frozenAt 01:20:48 = `b92b161d` committer date 01:20:48 (its author date 01:02:45 is the jj change-creation stamp, before launch) | pass |
| gate registered at its registry home | read SKILL.md `## Round 98 gate registry` | counter (gate), driver (probe), battery (gate, the counter's self-test), live-killer harness (gate, live-only self-test) each have a row at SKILL.md:3430-3438 | pass |
| fleet-root leftovers | `git -C /home/vgpnk/Projects/shokunin status --porcelain` | only orchestrator-owned `.scratch/` entries | pass |

This is a real report with commits, not a marker report. Step 1 found no conformance defect.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 98` →
`PREFILE-FALSIFICATION: pass claims=1 rows=12 attack_seats=7 findings=0`, exit 0.

The ledger `.ufo/waves/round-98/claim-falsification.tsv` has 12 rows, one per w1 seat artifact, all
`neutral`; no `falsifies-wording` row. The closest attack is R98Sentinel's mode laundering (a connect run
labelled `launch` passes only with `isLocal`; a Playwright-remote laundering fails `child-events`). That is
exactly declared limit 2, frozen before the scored run: `git show b92b161d:plans/round-98.md` lines 108-112
("'launch' vs 'connect' is a driver-pin fact: the counter sees the recorded `mode` field, the per-leg browser
id and the outcomes, not the process tree"), and `git diff --stat b92b161d b1741583 -- plans/round-98.md` is
empty. The r98 note (line 88) and README `## Round 98 coverage` carry the same sentence. I rule the row
correctly `neutral`.

## 3. Claims

C1 is a coverage claim and a capability acquisition, `client-oopif-uploadmodes-linux`, sourced S240, S241,
S242. It rests on a lane-owned gate, `scripts/check-client-oopif-uploadmodes-round98.mjs`. Under PROTOCOL
§Gate standard (Closure consequence) I did **not** run it; I verified its committed evidence and re-measured
everything reachable with plain commands over committed bytes.

| what | command (run by me at closure) | observed | vs report |
|---|---|---|---|
| before: the instruments are absent at base | `git cat-file -e 020ce05f:<f>` for driver, counter, battery, live-killer harness | rc 128 ×4 | matches |
| instrument bytes equal the frozen pins | `git show b1741583:<f> \| sha256sum` and the same at `b92b161d` | `f8e95a982ac0…`, `e55581ea758f…`, `9475fd902375…`, `940712bd324a…` at both revisions, equal to `claims.json` `instruments`; `git diff --stat b92b161d b1741583 -- scripts/` empty | matches |
| scored run verdict | `cat scored/c1-live.rc`; `jq` over `scored/c1-live.json` | rc 0; `clean`; `checkCount` 256; findings 0; revision `b92b161d…`; nonce `tabi-r98-live-044424c8b981`; outcome classes trustedPath 9, untrustedPayload 9, enoent 3, phantomUnreadable 3 | matches |
| committed receipt is the scored receipt | `sha256sum corpus/evidence/round98/client-oopif-uploadmodes/receipt.json`; `cmp` with `scored/live-receipt.json` | `f69c571935fa…` = `receiptSha256` in `c1-live.json`; byte-identical | matches |
| leg-level predicate | `jq -r '.legs\|group_by(.arm)[]\|[arm,n,outcomes,childFiles,childEvents,childRead,errMessage,childUrl,parentUrl]'` on the receipt | 24 legs (3 reps × 8 arms), `failures: []`, Chromium 155.0.8059.84, libs 25.16.0 / 1.65.0. PUA, PLA, PLL: resolved, `[["tabi-r98-answer.txt",22,"text/plain"]]`, `[["input",true],["change",true]]`, read `ok` "tabi round 98 answer.\n". PLAB, PLB, PLLB: resolved, `[["tabi-r98-payload.txt",29,"text/plain"]]`, `[["input",false],["change",false]]`, read `ok` "tabi round 98 payload bytes.\n". PLLM: error `ENOENT: no such file or directory, stat '…/tabi-r98-missing.txt'`, `[]` files, no events, no read. PUR: resolved, `[["tabi-r98-missing.txt",0,"text/plain"]]`, trusted input/change, read `["err","NotFoundError","A requested file or directory could not be found at the time an operation was processed."]`. Child `http://localhost:31902/child.h…` under parent `http://127.0.0.1:31901/parent.…` on every leg | matches |
| self-tests | `jq` over `controls/battery.json` and `controls/livekillers.json` | battery `cases 87, ok 87, failed 0`; live killers `killers 3, ok 3`, both pinned to the frozen counter/driver sha | matches |
| do-nothing / wrong controls | `controls/rc.txt`; `jq` on `controls/counter-donothing-r97.json` | no-work base rc 128; r97 receipt rc 1 (`schema`, `nonce`, `driver-pin`, `answer`, `payload`, `missing`, `leg-set`, …); wrong-library and tampered-tree `--live` rc 1; driver-pin mismatch rc 1; eight setup refusals rc 2; leftover chromium 0 | matches |
| independent reproductions | `jq '[.verdict,.checkCount,.revision,(.findings\|length)]'` on seat JSONs | R98Exec1 ×2 clean 256; R98Exec2 default clean 256, `--reps 10` clean 816; R98Reviewer `--reps 1` clean 96; R98Scribe clean 256; R98Sentinel clean 256 (revisions 172bc0a1/acd1e847, instrument bytes unchanged since the freeze) | matches |
| mutation seat | `jq '{total,killed,survived}' w1/R98Mut-results.json` | 86 / 76 / 10 | matches |
| owned axes not harmed | `git diff --numstat 020ce05f b1741583 -- LOG.md SCORECARD.md SKILL.md corpus/README.md corpus/SOURCES.md corpus/knowledge/*round-77.md corpus/knowledge/*round-97.md`; `git diff --name-status` | additions only (LOG +31, SCORECARD +38, SKILL +10, README +30, SOURCES +6, r77 note +7, r97 note +18, all `-0`); the other 122 changed paths are `A`; SCORECARD diff is one `## Round 98` section with the capability row | matches |

So C1 was partly re-measured (before-state, instrument digests, receipt identity and the full leg table,
control verdict files, SOURCES and knowledge counts) and partly verified from evidence (the `--live`
verdict, battery and live-killer tallies; the gate was not executed). C1 verifies. No exploratory claim
was declared.

Per-axis verdicts:

| axis | verdict |
|---|---|
| coverage | improved: new capability row `client-oopif-uploadmodes-linux`, verified as above |
| depth | unchanged |
| operability | unchanged |
| freshness | unchanged |
| calibration | unchanged: r97 D1/D2 answers and the appended r97/r77 note corrections are record/instrument work, not claimed as an axis move |
| adjacency | unchanged |

## 4. Discernment spot-check (LEARNING.md §Discernment is checked from outside)

Re-opened with `curl -sS -w '%{http_code} %{size_download}'` at closure and hashed with `sha256sum`.

| item | decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S241, Blink `file_error.cc` @ 155.0.8059.84 | admit, tier A, `mined` | https://raw.githubusercontent.com/chromium/chromium/155.0.8059.84/third_party/blink/renderer/core/fileapi/file_error.cc → HTTP 200, 12,165 B, sha256 `2b5ea5565093` (equal to the lesson's digest) | agree | lines 55-57 are `kNotFoundErrorMessage` with exactly the text PUR's `Blob.text()` rejects with in all 3 PUR legs; version-pinned to the host build; it grounds a claim-bearing statement |
| S242, Puppeteer `ChromeLauncher.ts` @ puppeteer-v25.16.0 | admit, tier A, `mined` | https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/node/ChromeLauncher.ts → HTTP 200, 10,415 B, sha256 `ba077ef522e7` | agree | lines 90-93 (`argument.startsWith('--remote-debugging-')`) and 278-280 (`headless === 'shell' ? '--headless' : '--headless=new'`) are as quoted; they explain the PUA leg's DevTools port and headless mode |
| Puppeteer `BrowserLauncher.ts` @ puppeteer-v25.16.0 | reject as a row | https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/node/BrowserLauncher.ts → HTTP 200, 20,531 B, sha256 `4b83ff9c9bba` | agree | its only `headless === 'shell'` use (line 641) picks the installed-browser executable inside `resolveExecutablePath`, not a Chrome argument; `--remote-debugging-pipe` (line 187) is the pipe flow the legs do not use. No line bears on C1, so the rejection with a flip condition is right |

`corpus/SOURCES.md` rows checked: S241 (SOURCES.md:256) — the quote "A requested file or directory could not
be found at the time an operation was processed." is 16 words (`wc -w`), at lines 55-57 of the re-opened file.
S243 (SOURCES.md:258, newly written post-wave) — https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/packages/playwright-core/src/server/browser.ts
→ HTTP 200, 10,247 B, sha256 `8b48913bf967` (equal to the row); line 86 is
`_isBrowserCollocatedWithServer: boolean = true;` as quoted. S240 re-fetch: HTTP 200, 49,422 B, sha256
`65cb43c91893`, line 779 as quoted.

`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit 0, with W04
duplicate-URL-across-scopes warnings only on older rows (S222, S223). None is on S240-S243.

## 5. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | knowledge 110 → 111 (`git ls-tree --name-only <rev> corpus/knowledge/ \| grep -c '\.md$'`); SOURCES 239 → 243 (`git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'`); new capability row (client-launched browsers, payload objects, `isLocal` + absent path, file bytes/types, phantom read), the note citing `mined` rows S240-S243 and S238 |
| quality | improved | r97 D1 answered by an appended README correction (README.md:1291); r97 note +18/-0 scopes the `isLocal` trust rule to paths and moves the ENOENT to the client side (R98Scribe F2 captured stack); r77 note +7/-0 adds the trusted `input` to `pick-missing`; R97Mut classes now killed for this round's counter (battery 87/87, live killers 3/3); no admitted entry failed its re-check |
| discernment | improved | The spot-check agrees with the gate on both admits and the reject. The launch/connect blind spot was declared before freeze (limit 2) and the attack confirmed it rather than falsifying wording; R98Scout's opened sources were held as leads; R98Reviewer's sweep nit was refuted with R98Sentinel's sampling |

## 6. Routed defects (owner: tabi; due next round)

- **D1** (correction sweep): `corpus/README.md` lines 1279-1280 (`## Round 97 coverage`) still say the events
  are "trusted … for Playwright with `connectOverCDP(url, {isLocal: true})`" without the path scoping the
  round-98 correction appended to the r97 note (an `isLocal` payload object is untrusted). The r98 coverage
  section states the scoped fact, but the r97 sentence itself has no appended pointer. Append a one-line
  README correction; do not rewrite it.
- **D2** (lesson mistake 3, R98Sentinel): the driver sets `TMPDIR` after `require('playwright-core')`, so
  `connectOverCDP` legs write transient `/tmp/playwright-artifacts-*` dirs (one leaks on a killed run).
  Set `TMPDIR` before the client loads in the next round's driver and show it with a `/tmp` watcher.
- **D3** (R98Reviewer should-fix): the counter's exit-3 → `setup` mapping can mask law findings when one
  launch fails mid-run; add a case that shows a partial-failure run still reports its law findings.
- **D4** (R98Mut): battery cases for the 10 survivors (parentUrl, port bounds 1023/65536/fractional,
  empty-legs `fresh-browser`, the `verdict` string); carried with r97 D3 (transitive-package identity), r95
  D1-D3 and the R95Mut/r96 survivors.

Operator note: the four SHONEN boxes (all `[~]`) carry pointers a non-author can check: LOG `## Round 98`
(LOG.md:4401), SKILL `## Round 98 gate registry` (SKILL.md:3430), the cold reproductions R98Exec1 and
R98Exec2 (256 and 816 checks), and R98Connector §2-3. Promotion is operator-owned; nothing is written to
SHONEN.md here.
