# ScribeLesson — round 33 w1 (frontier)

**Verdict.** The round-33 lesson draft is complete at
`.ufo/waves/round-33/w1/ScribeLesson/round-33.md` (222 lines, sha256 `783842f7583feae5d3bf07a8cec5dd4a15174ef1b9809c41c63d91d6054ee67e`):
the header names baseline `b7d16fb8` and freeze `e6b0a90`; `## Gate` carries all three source rows (S127, S128, S129 — every
source seat published before this report, so no slot is pending) with received quotes, the admitted list with each row's
stated scope and limits, the S129-seat's three rejections with flip conditions, and the spot-check owed to the closure;
`### Assimilation (§10)` records "none" from `claims.json` `notClaimed` and the absent `considerthese/`; `### Status /
recheck / used-by changes` records no in-place change and the open round-32 curation items; `## Mistakes` carries three
rows with the four cells each — M1 `vacuous` (round-32 C1 `feasibilityDisclosed` asserted an unreachability nobody
tested, fixed by this round's pre-freeze forgery battery and its failing controls), M2 `survivor` (the decorated `yes
(live)` cell left the population silently, fixed by frozen construction F7), M3 `provenance` (control receipts name
scratch-clone revisions the lane repo does not hold, partially fixed by the byte-frozen `controls.mjs`, residual
recorded) — and `## Receipts` binds every stated count to a command. Nothing in this seat ran a lane counter, gate or
browser, and no number in the draft is an unrun check presented as passed.

## Evidence (commands, exit codes, file:line)

All commands read-only; cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin` unless stated.

1. Frozen digests equal the blobs at the freeze commit — exit 0:
   `for p in .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs .ufo/waves/round-33/baseline/controls.mjs .ufo/waves/round-33/measure.sh scripts/check-adjacency.mjs; do printf '%s  %s\n' "$(git show e6b0a9074d434ccc307badd312ae7379d1193fea:$p | sha256sum | cut -d' ' -f1)" "$p"; done`
   → `da59d157…c6380`, `51ace65f…e812b`, `2d0cf841…451e`, `ca6b830e…84c7e`, `4e2c2a64…24aac`; each equals
   `claims.json` `frozenDigests`. `git rev-parse e6b0a90^{tree}` → `f6da5a36…` (exit 0).
2. C1 baseline receipt — exit 0:
   `jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}' .ufo/waves/round-33/baseline/measure-at-baseline/c1-at-b7d16fb.json`
   → `{"predicate":false,"candidates":52,"mapped":5,"screened":0,"unaccounted":47,"newMapped":0,"adjacency":{"verdict":"clean","rows":10,"verified":10,"findings":0}}`.
3. C2 baseline receipt — exit 0:
   `jq -c '{predicate,honest,forgeriesAccepted,selftest,digestLiterals}' .ufo/waves/round-33/baseline/measure-at-baseline/c2-at-b7d16fb.json`
   → `{"predicate":false,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":8,"selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27"},"digestLiterals":[]}`.
4. Controls: `jq -c 'length' .ufo/waves/round-33/baseline/controls-summary.json` → `7`;
   `jq -c '[.[]|.predicate]|unique'` → `[false]`; `jq -c '[.[]|.exit]|unique'` → `[1]` (all exit 0).
   `jq -c '.[] | select(.name=="c2-J3-whitelist") | .summary'` → `forgeriesAccepted 0`, `honest true`,
   `digestLiterals` 5 (`8aa97463c238`, `9918a716da71`, `92bd413caab0`, `b9dab912f0af`, `55dbef88ed4b`), `selftest` 3 (exit 0).
5. Candidates: `wc -l .ufo/waves/round-33/baseline/c1-candidates.tsv` → `52`; per-sibling
   `awk -F'\t' '{print $1}' … | cut -d@ -f1 | sort | uniq -c | sort -rn` → 42 kake, 4 kagi, 2 kaidoku, 1 each of
   tsukuroi, revenger, kotoba, kengaku (exit 0).
6. `grep -c '^| S[0-9]' corpus/SOURCES.md` → `126` (exit 0; last registry row S126 at `corpus/SOURCES.md:140`).
7. `jq '.items|length' .ufo/waves/round-33/w1-spec.json` → `36` (exit 0).
8. `grep -o '^[0-9]\{1,3\}\.' corpus/QUALITY.md | tail -3` → `84.`, `85.`, `86.` (exit 0) — highest criterion at the
   baseline is 86, so criteria 87+ are this round's frontier step and are marked owed, not written.
9. `grep -c 'SURVIVED' .ufo/waves/round-32/w1/MutC1.md` → `9` (exit 0; round-32 M7's 9/20).
10. Provenance resolution: `git cat-file -e a6b709d16ad48340f3a53a9c7b648923270f62d1^{commit}` →
    `fatal: Not a valid object name`, exit 128; same exit 128 for `3f77d79b…` and round-32's five mutated hashes
    (`21c48a93`, `51b5c583`, `de1d7ae0`, `4b873bef`, `f1dc6fea`). `git cat-file -t c7999ee70b633f0f54a639069816bce53326e4b7`
    → `tree`, exit 0; equals `b7d16fb8^{tree}`.
11. Source-seat outputs: `ls -d .ufo/waves/round-33/w1/ScribeSrc*` → `ScribeSrcLauncher`, `ScribeSrcSandbox`,
    `ScribeSrcSession` (exit 0). Rows and Gate lines pasted into the draft from
    `ScribeSrcSession/S127-row-and-gate.md:15,26`, `ScribeSrcLauncher/row-S128.md:7,50`,
    `ScribeSrcSandbox/source-row-S129.md:41,63`; the S127 landing check from
    `ScribeSrcSession/check-sources-{with,without}-stub.txt` (exit 0 / exit 1); host facts from
    `ScribeSrcLauncher/host-crosscheck.md` (`pacman -Qo /usr/bin/chromium` → `154.0.8037.97-1`; `/usr/bin/chromium`
    sha256 `eaed39c3…a172b`; `~/.config/chromium-flags.conf` 212 B / 5 lines / `--no-sandbox` 0 matches).
12. `ls corpus/adjacency-screen.tsv corpus/knowledge/bidi-runtime-gate-v2-round-33.md` → both absent, exit 2. Neither
    C1's ledger nor C2's note exists yet; the draft says so rather than assuming them.
13. Scratch and browsers: `ls -d /fast/scratch/hyaku/tabi-r33/ScribeLesson` → absent, exit 2 (no scratch was created;
    nothing to delete). `pgrep -fa 'chromedriver|chromium'` shows host/other-seat processes (e.g. pid 2007044
    `/usr/lib/chromium/chromium --ozone-platform=wayland … --load-extension`, headless zygotes with
    `--user-data-dir=/run/user/…`); **none are mine** — this seat started no browser and no chromedriver, so there is
    nothing of mine to kill.

## Touched surfaces

- Created: `.ufo/waves/round-33/w1/ScribeLesson/round-33.md` (the lesson draft) and this report.
- Read-only: `.ufo/waves/round-33/{claims.json,baseline/**,w1-spec.json}`, `corpus/{SOURCES.md,QUALITY.md}`,
  `scripts/check-adjacency.mjs` (digest only), `.ufo/waves/round-32/{claims.json,w1/CritC1Forgery.md,w1/MutC1.md,w2/MutC1Entry.md,w2/RerunNoHarm.md}`,
  `corpus/lessons/{round-32.md,round-32-verifier-spotcheck.md}`, the w1 seat outputs named above; read-only git
  (`show`, `cat-file`, `rev-parse`) in the lane.
- Not written: no lane tracked file, no lane git index or jj state, no fleet file, no sibling repo, no
  `~/.local/bin`, no scratch dir; no packages installed or upgraded (so no tooling row to record).

## Out of scope / not done

- Did not run the frozen C1/C2 counters, `measure.sh`, any lane gate, self-test or formatter; the draft reports the
  committed baseline receipts and says no after-measurement exists.
- Did not land S127–S129 in `corpus/SOURCES.md`, did not write `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`,
  did not write criteria 87+ (marked owed with their evidence ground), and did not add a wave-2 section.
- Did not decide the round-32 routed items carried at S125/S124/S126 (recorded as open in the lesson).
- No browser run, no live leg, no network fetch of my own: every URL/digest in the Gate table is the source seat's
  receipt, quoted with its seat and access time.

## Findings (for the L1)

1. **All three Gate rows are seat drafts, not landed rows.** Landing S127–S129 requires the note in the same revision;
   S127's seat measured both `used_by_missing` (exit 1) and clean-at-127-rows (exit 0) states in its scratch clone.
2. **Residual provenance defect (M3) is live in this round's own receipts**, not repaired: the J2/J3 mutated-control
   `rev` and `tree` cells name objects absent from the lane repo; the frozen `controls.mjs` is what makes them
   reproducible. If the L1 wants them diffable, the fixture trees must be committed.
3. **S129's item-named path is a 404** (`docs/linux/sandboxing.md`, 233 B); the admitted row rests on
   `sandbox/linux/README.md` plus `sandbox/policy/switches.cc:42-44` at the same tag. Two Googlesource-side facts the
   row's Gate line carries are already in the seat receipt.
4. **S128's launcher tarball sha256 is pinned by the PKGBUILD, not re-downloaded** (`codeload.github.com` outside that
   seat's host list); the three packaging commits carrying `pkgver=154.0.8037.97` make the mechanism claim invariant,
   and the installed package's build stamp is not matched to a commit.
5. **S127/S128 published no rejected candidate**; only S129 did (three, with flips). If the Gate section is expected to
   carry a rejection per row, those two are empty rather than missing.
