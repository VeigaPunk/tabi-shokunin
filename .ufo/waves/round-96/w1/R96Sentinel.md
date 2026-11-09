# R96Sentinel — C1 library-identity trust boundary (`--deps` substitution)

Scope: declared limit 2 of C1 (puppeteer-core 25.16.0 / playwright-core 1.65.0 pinned by lockfile integrity
plus one file sha256 per package; rest of tree trusted). Leaf seat, no lane files edited, no commits, no git
mutation (only `rev-parse`, `log`, `show`, `diff` reads). Ports used: 32681,32682,32683 only, sequentially.
Evidence: `.ufo/waves/round-96/w1/R96Sentinel-*.json|.diff`; receipts `R96Sentinel-receipt-*.json`.

## Tooling record
- `npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` into scratch deps dir
  (channel: npm registry; node v24.21.0, npm 11.19.0; "added 26 packages"). Reason: client deps for the
  counter. No other installs; no pacman; no sudo.
- Installed: puppeteer-core 25.16.0 (lock integrity `sha512-VA5Pf54N…IJw==`, matches frozen value),
  playwright-core 1.65.0. Page.js sha256 `31a522df…07e7a0` and coreBundle.js `4ef83305…63f7f1` match the pins.
- Host chromium: `/usr/bin/chromium` 155.0.8059.84 (Arch).

## What the pins bind (read from the code, driver and counter)
- Driver (`scripts/client-oopif-chooser-round96.mjs`, sha256 4020e57e… matches the counting command) computes
  `libs` from `--deps` itself: `node_modules/<name>/package.json` `version`; the `package-lock.json` entry's
  `integrity` **string** (echoed, never compared with the installed tree); sha256 of ONE file per package.
- Counter (`scripts/check-client-oopif-chooser-round96.mjs`) compares that receipt object to constants (`libs`
  check). Nothing hashes the rest of `node_modules`; nothing verifies the lock against the tree.
- Counter file itself is NOT pinned by the counting command (only the driver is). Its sha256 is
  778d429f… at both 75fe36dc and 3f0e422a (checked with `git show`), so no drift in this round.
- Resolution path checked: puppeteer `main`/`exports` → `lib/puppeteer/puppeteer-core.js` → `cdp/Page.js`
  (the pinned file IS on the executed path); playwright `index.js` → `lib/coreBundle.js` (also on path).

## Substitution variants and runs (all `--live --ports 32681,32682,32683 --reps 3` default)
| run | deps variant | rc | verdict | checks | findings |
|---|---|---|---|---|---|
| baseline | unpatched install | 0 | clean | 165 | 0 (`R96Sentinel-baseline.json`) |
| A: patched Connection.js | Connection.js edited; Page.js, package.json, package-lock.json byte-identical | 1 | findings | 165 | 12: `pp-timeout` + `child-files` on PPX-1..3, PPW-1..3; `libs` silent; `driver-exit` 0 (`R96Sentinel-patched-connection.json`) |
| A repeat (4th attempt) | same bytes as A | 1 | findings | 165 | same 12 (`R96Sentinel-patched-connection-rep.json`) |
| B: lock integrity only | `puppeteer-core` integrity in package-lock.json replaced by `sha512-AAAA…`, rest identical | 1 | findings | 165 | 1: `libs` (`R96Sentinel-lockedit-integrity.json`) |
| C: benign | comment-only line added to `lib/puppeteer/cdp/CdpSession.js`; all pins identical | 0 | clean | 165 | 0 (`R96Sentinel-benign-commentonly.json`) |

Patch A (scratch only, `R96Sentinel-patch-connection.diff`): in `Connection.js` only, enable `Page.enable` +
`Page.setInterceptFileChooserDialog` on every `iframe` OOPIF session at attach, and re-emit
`Page.fileChooserOpened` from a child session on its parent session (the primary session that
`Page.js:273-289` listens on). Puppeteer then resolves `waitForFileChooser` on PPX/PPW legs; the answer fills
the child (`child-files` = `[["tabi-r96-answer.txt",22]]`). PPS/PWX/PWS unchanged. Witness check on PPW still
passes (one `selectSingle` event on the iframe target), so the patch is consistent with the witness leg too.

Setup attempts on variant A (not law findings): three further invocations with the same bytes ended `setup`
(driver exit 3, "devtools endpoint never answered" on 2,2,1 legs; `R96Sentinel-setup-patched-rep{,2,3}.json`)
while host loadavg was 19–25 with sibling seats running. Baseline, B and C each passed on the first attempt.
The launch timeout is 40×150 ms before any client code runs, so it cannot depend on the patched library.

## Findings
1. **Pins do not bind behaviour, and the counter does.** Variant A keeps all three pinned values identical and
   the counter reports 12 leg-level findings (rc 1), so a behaviour change in the library IS caught at leg level.
   Behaviour is bound only through the 15 legs, not through `libs`.
2. **Pins do not bind identity.** Variant C changes puppeteer-core's bytes and the counter says `clean`, 165 checks,
   identical to the scored run. A clean verdict therefore holds for any tree that carries the three pinned
   values and matches the leg outcomes; it does not establish that the tree is the published 25.16.0 artifact.
3. **Lockfile integrity is echoed, never verified.** Variant B shows the driver ran fine with a bogus integrity
   string and the counter flagged only the echoed value. Conversely, variant A carries the genuine integrity
   string over a tree that differs from the published artifact and passes `libs`. The lock pin binds the text of
   `package-lock.json`, not the installed bytes.
4. **Version and Page.js pins not exercised.** I did not run a version edit or a Page.js edit. From the code
   (`LIBS` compare; `fileSha256` from `lib/puppeteer/cdp/Page.js`), a change to either should fire `libs`.
   [INFERENCE — untested.]
5. **Transitive tree unpinned.** The driver records only the two top-level packages; `ws`, `chromium-bidi`,
   `devtools-protocol` etc. are not hashed. Variant C already shows that any unpinned file can change the
   library's behaviour without a `libs` finding.
6. **Revision drift during the seat (informational).** `revision` in the counter output moved from `75fe36dc`
   (baseline, A) to `3f0e422a` (B, C, A repeats). `git log` shows 3f0e422a is a records-only commit on top of
   75fe36dc; the counter and driver blobs are byte-identical at both revisions. The counter reads `master` at
   run time and that value is not part of any check.
7. Counts re-derived: 165 checks on every completed run (baseline = scored run's 165); 15 legs; 0 driver
   failures on completed runs. No `falsifies-number` evidence.

## Verdict reasoning
The leg-level statements hold on the pinned libraries: the unpatched baseline reproduces the scored run exactly
(165 checks, 0 findings, PPX/PPW timeout, PPS/PWX/PWS chooser). The sentence fails on its subject: "Puppeteer
v25.16.0 never resolves page.waitForFileChooser() for a cross-site iframe" attributes the outcome to the
published package, while the instrument enforces the outcome of whatever tree is at `--deps` plus three
self-reported strings. Variant C is clean and variant A is findings with identical pins, so the counter's
verdict does not track the identity the sentence names. Declared limit 2 admits trust in the rest of the tree,
but the after-state ("`--live` exit 0 → C1 met") and the wording treat the library identity as established.
That is a narrower enforced property than the frozen sentence states.

Smallest remediation (not applied; not in my seat): reword the subject to "the `--deps` tree whose pinned
fields match" in the claim, or hash every file of each package against a committed manifest and verify the lock
integrity against the installed tree (e.g. `npm ci` into a fresh dir and compare trees). Pin the counter's own
sha256 in the counting command as well.

Cleanup: scratch `/fast/scratch/hyaku/tabi-r96/R96Sentinel` removed after this report was written; pgrep for
`remote-debugging-port=3268` empty before yield (checked after every run).

VERDICT C1: falsifies-wording
