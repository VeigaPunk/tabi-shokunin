# R99Exec1 — C1 cold reproduction (w1)

## Axes
Coverage, operability. Coldly reproduce frozen predicate `C1-CLIENT-OOPIF-UPLOADSETS-R99` twice
with a fresh npm install; battery the first receipt.

## Tooling recorded
Official-channel npm (npm 11.19.0, node v24.21.0) into seat scratch:
`npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0`
→ installed `25.16.0` / `1.65.0`, 26 packages, exit 0. No pacman (paused host-wide per spec);
no sudo; no uv/npx needed. Host `Chromium 155.0.8059.84 Arch Linux` (`/usr/bin/chromium --version`).

## Commands run (exact, exit codes)
1. Deps install above — exit 0. Fresh install's pinned libs confirmed by the counter's `libs` check
   (both runs clean; receipt `libraries` match claims.json: pp integrity `sha512-VA5Pf54N…`,
   file `162b7199…`, tree 927/`968a85e8…`; pw integrity `sha512-vNSKgH6…`, file `4ef83305…`,
   tree 116/`24584693…`).
2. Run1:
   `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-uploadsets-round99.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8 --live --deps /fast/scratch/hyaku/tabi-r99/R99Exec1/deps --scratch /fast/scratch/hyaku/tabi-r99/R99Exec1/r1 --ports 34611,34612,34613 --json` — exit 0.
3. Run2: same with `--scratch …/r2` — exit 0.
4. Battery:
   `node …/scripts/negatives-client-oopif-uploadsets-round99.mjs --lane … --receipt …/w1/R99Exec1-run1-receipt.json --expect-nonce tabi-r99-live-b4063b0bdd64 --expect-driver-sha256 98efdc1293… --scratch …/bat --json` — exit 0.

## Results
- Run1: `verdict clean`, `checkCount 282`, `findings []`, `driverRun.status 0` (`legs 24, failures 0,
  launchFailures 0`), `revision ff978cb40a04b77d6bbc6ade2fe2a71d3c13ef55`, receipt sha256
  `f0fe9010…27962b5`. Outcomes: trustedMulti PLLP/PUCM ×3, untrustedPayload PLBX/PLBM ×3,
  refusedMultiple PLBN/PUCN ×3, enoent PLAM ×3, phantomUnreadable PUAM ×3.
- Run2: `verdict clean`, `checkCount 282`, `findings []`, `driverRun.status 0`, receipt sha256
  `2c8bd675…a41a70f510751`. Identical outcome lists and leg order.
- Run1 receipt internals: `reps 3`, 24 legs in frozen order PUAM,PLAM,PLBX,PLBM,PLBN,PLLP,PUCM,PUCN
  ×3 with per-rep outcomes resolved/error as the predicate states; `failures []`;
  `missingExists false`; `tmpdirAtLoad = <r1>/driver/t` (basename `t`, under the counter scratch =
  limit-8 `tmpdir-bound`); `ports {34611,34612,34613}`; `chromium "Chromium 155.0.8059.84 Arch Linux"`.
- Battery: 109 cases, `ok 109`, `failed []`; positive clean rc 0 / verdict `clean` / ids `[]`;
  every negative gave its expected finding id at rc 1, verdict `findings` (ids seen verbatim in
  the JSON). No finding id other than expected.
- Stderr on runs/battery: empty (`r1-stderr.txt`, `bat-stderr.txt`). Post-run
  `pgrep -f "remote-debugging-port=34613"` empty — no chromium left. Seat scratch
  `/fast/scratch/hyaku/tabi-r99/R99Exec1` removed (`rm -rf`) after copying receipts.

## Artifacts (lane-relative)
- `.ufo/waves/round-99/w1/R99Exec1-run1.json`, `R99Exec1-run2.json` (counter outputs)
- `.ufo/waves/round-99/w1/R99Exec1-run1-receipt.json`, `R99Exec1-run2-receipt.json` (receipt copies)
- `.ufo/waves/round-99/w1/R99Exec1-battery.json` (109/109)
- `.ufo/waves/round-99/w1/R99Exec1.md` (this report; nonces `tabi-r99-live-b4063b0bdd64`,
  `tabi-r99-live-5d3f396bbf16` link run outputs to receipts)

## Findings / risks / blockers
No leg-level statement falsified on either `--live` pinned-driver run; controls battery agrees with
the frozen expectations. Ports 34611–34613 were free at both runs (no `setup` outcome); the
scratch paths were short (~50 bytes) so chromium started. Nothing blocked. No sibling-file or
git/jj mutation performed; only the six files listed (plus this report) were written.

VERDICT C1: neutral
