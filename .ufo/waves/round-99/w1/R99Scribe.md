# R99Scribe — round 99 knowledge note draft (seat: scribe; axes: coverage, quality)

Milestone: Knowledge note draft. Deliverable: `.ufo/waves/round-99/w1/R99Scribe-note.md` (the L1
integrates it into `corpus/knowledge/`; I did not write there).

## What I did

Read `plans/round-99.md` §Claim and §Declared limits 1-8 in full, the r98 note
(`corpus/knowledge/client-oopif-uploadmodes-round-98.md`, the shape I modelled), the frozen
`claims.json`, the frozen counter/driver bytes, and the staged sources with their fetch log.

Every factual sentence in the draft was re-derived from the scored live receipt by a script I wrote
(`.ufo/waves/round-99/w1/R99Scribe-facts.py`, output `R99Scribe-facts.json`): **43 assertions, 43
passed, 0 failed** (exit 0). Each assertion names the receipt leg ids that carry it. Then I
re-checked the committed receipt with the frozen counter and read the source rows back.

## Checks run (exact commands and exit codes)

```
$ python3 .ufo/waves/round-99/w1/R99Scribe-facts.py > .ufo/waves/round-99/w1/R99Scribe-facts.json
rc=0     # jq '{passed,total,failed:(.failed|length)}' → {passed:43,total:43,failed:0}
```

```
$ node scripts/check-client-oopif-uploadsets-round99.mjs \
    --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
    --expect-driver-sha256 98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8 \
    --receipt corpus/evidence/round99/client-oopif-uploadsets/receipt.json \
    --expect-nonce tabi-r99-live-6d2a1508cbc1 --json
rc=0     # verdict clean, checkCount 278, findings 0
```

Receipt mode, not `--live`: it re-checks the committed receipt but is forgeable (plan limit 6); the
claim's counting command is `--live`, which the L1 already ran (scored `.ufo/waves/round-99/scored/c1-live.json`,
rc 0, verdict `clean`, 282 checks, 0 findings, nonce `tabi-r99-live-6d2a1508cbc1`, revision `27685238`).
282 − 278 = the 4 `--live`-only checks (`driver-exit`, `ports-bound`, `missing-bound`, `tmpdir-bound`).

```
$ sha256sum .ufo/waves/round-99/scored/live-receipt.json corpus/evidence/round99/client-oopif-uploadsets/receipt.json
ed4b21299a42bd0689b7123799a4908566cbbeeeb30b9a8cda353c49deb845e3  .ufo/waves/round-99/scored/live-receipt.json
ed4b21299a42bd0689b7123799a4908566cbbeeeb30b9a8cda353c49deb845e3  corpus/evidence/round99/client-oopif-uploadsets/receipt.json
$ sha256sum scripts/client-oopif-uploadsets-round99.mjs scripts/check-client-oopif-uploadsets-round99.mjs
98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8  scripts/client-oopif-uploadsets-round99.mjs   # = the pin
1a0f25293771f1c4d9307b5ccd65cdf4c80696bd2e5756447ca2ea1a0689a720  scripts/check-client-oopif-uploadsets-round99.mjs  # = claims.json
```

jq reads of `.ufo/waves/round-99/scored/live-receipt.json` (all rc 0): leg count 24; arms ×3 each;
per-leg `outcome`/`errName`/`errMessage`/`files`/`events`/`reads` (24 rows printed in full);
distinct `browserId` count 24; `browserVersion` = `Chrome/155.0.8059.84` on all 24; `iframeTargets`
length 1 on all 24; `frames` length 2 on all 24; `parentFiles` = `[]` on all 24; click events 0;
events on a non-target input 0; `ports` {32901, 32902, 32903}; `missingExists` false;
`tmpdirAtLoad` = `…/driver/t`; `libs` versions 25.16.0 / 1.65.0.

Source rows read back in the staged copies (`.ufo/waves/round-99/sources/`), sha256 matching
`sources/fetch-log.txt`:
- S237 `pp-ElementHandle.ts:113-116` — `assert(files.length <= 1 || isMultiple, 'Multiple file uploads only work with <input type=file multiple>')`.
- S244 `pp-assert.ts:19` — `throw new Error(message);`.
- S238 `pw-fileUploadUtils.ts:80` — `mimeType: payload.mimeType || mime.getType(payload.name) || 'application/octet-stream'`.
- S240 `pw-dom.ts:757` — `throw injected.createStacklessError('Non-multiple file input can only accept single file')`.
- S245 `fileapi.html:2827` — the NotFoundError row, "could not be found at the time the read was processed".
- S246 `mime-standard.ts:283` — `'image/png': ['png'],`; `pw-root-package.json:144` pins `"mime": "4.1.0"`.
- S247 `mime-Mime.ts:87` — `return this.#extensionToType.get(ext) ?? null;`.

S241 (Blink `file_error.cc`, the NotFound message text) is a **round-98** registry row, not one of this
round's seven sourced rows (S237, S238, S240, S244-S247), so the draft does not cite it: the message
text is asserted as a receipt fact (PUAM-1..3) and S245 carries the failure reason.

Controls read: `controls/rc.txt` (all expected rcs, `done leftover-chromium-all=0`);
`controls/tmpdir-strace-r98.txt` has 4 `mkdir("/tmp/playwright-artifacts-…")`, `tmpdir-strace-r99.txt`
has 0 under `/tmp` and 5 under its own scratch `t/` — matching the `rc.txt` line
`tmpdir-strace r98-under-tmp=4 r99-under-tmp=0 r99-under-scratch=5`. Driver byte order confirms the
fix: `process.env.TMPDIR = tmpDir;` at line 121 of the r99 driver, before the client loads at lines
158-160 (the r98 driver set it at line 164, after its imports at lines 138-140).

Independently re-derived the binary digest: `sha256(bytes(range(256)))` =
`40aff2e9d2d8922e47afd4648e6967497158785fbd1da870e7110266bf944880`, equal to the receipt's `bin.sha256`
and to what PLBX-1..3 read back.

## Findings

1. **Every leg-level statement of the frozen predicate C1 holds in the scored receipt** — all 24 legs,
   each arm ×3, including the four refusal arms (PLBN, PUCN), the ENOENT arm (PLAM) and the phantom
   arm (PUAM). No count re-derived differently (24 legs, 24 browser ids, 8 arms × 3, `reps` 3, 282
   live checks, 278 in receipt mode).
2. **Three wording precisions my draft makes, all inside the declared limits:**
   - The refusal's *delivered* string differs by client. Playwright's is
     `locator.setInputFiles: Error: Non-multiple file input can only accept single file` (PLBN-1..3),
     Puppeteer's is the bare `Multiple file uploads only work with <input type=file multiple>`
     (PUCN-1..3). The round's source rows (S237/S244) explain Puppeteer's plain `Error`; no staged
     source covers where Playwright's `locator.setInputFiles: ` prefix is added, so the draft asserts
     only the delivered string and cites the leg ids, per limit 5.
   - The phantom's `File.type` (`text/plain`) and the two path files' `File.type` (`text/plain`) are
     recorded by the receipt but no source row explains the browser-side name→type step for those arms
     (S238/S246/S247 cover the *Playwright payload* path only). The draft marks them as recorded, not
     explained, and does not carry the claim's own `image/png` / `application/octet-stream` rule past
     the payload arms it was measured on.
   - S241 (Blink `file_error.cc`, the NotFound message text) is a round-98 registry row, outside this
     round's sourced set (S237, S238, S240, S244-S247), so the draft does not cite it; the message text
     is a receipt fact and S245 carries the failure reason. The lane's committed r99 note does cite S241;
     the L1 may prefer to keep that, since S241 is a registered row — but the drafted note keeps to the
     round's own sourced set.
3. **Note-vs-committed-note difference (for the L1):** the already-committed
   `corpus/knowledge/client-oopif-uploadsets-round-99.md` (commit 75a8a6f7, records) and my draft
   agree on every law, every leg id, every count and every limit. The differences are presentational:
   my draft adds a `legs` column naming each leg range, states the refusal-string difference
   explicitly, and marks the two `File.type` values that no source row explains. No sentence of mine
   contradicts the committed note.
4. **The r98-D2 TMPDIR fact is now behavioural, not only a driver pin**: the pre-freeze strace control
   shows the r99 driver creating 0 `/tmp/playwright-artifacts-*` and 5 under its own scratch `t/`, while
   the r98 driver created 4 under `/tmp` in the same `--reps 1` shape. The draft cites both files and
   the `rc.txt` counts, and still calls the *ordering* a driver-pin fact (limit 7).

## Out of scope (not done by me, not claimed)

- I did **not** run `--live` (no port triple was assigned to this seat; the L1's scored run is the
  `--live` evidence). The receipt-mode recheck above is not a law finding by itself (plan limit 6).
- I did not re-run the forgery battery, the live killers, the mutants or the other controls; those are
  the controls' own committed artifacts and other seats' work.
- I did not touch `corpus/knowledge/`, `corpus/README.md`, `corpus/SOURCES.md`, the lane's git/jj state
  or any file outside `.ufo/waves/round-99/w1/`. No commits. No subagents. I ran no chromium at all, so
  there were no chromium processes of mine to reap (`pgrep -af "R99Scribe"` → empty; the ports 32901-32903
  of the L1's scored run are likewise empty). My scratch dir `/fast/scratch/hyaku/tabi-r99/R99Scribe` was
  removed.

## Artifacts

- `.ufo/waves/round-99/w1/R99Scribe-note.md` — the knowledge-note draft (122 lines).
- `.ufo/waves/round-99/w1/R99Scribe-facts.py` — the fact re-derivation script (43 assertions).
- `.ufo/waves/round-99/w1/R99Scribe-facts.json` — its output: 43/43 pass, 0 fail.
- `.ufo/waves/round-99/w1/R99Scribe-recheck.json` — the frozen counter's receipt-mode recheck output.

Evidence carried by: `corpus/evidence/round99/client-oopif-uploadsets/receipt.json` (sha256
`ed4b2129…`, byte-identical to `.ufo/waves/round-99/scored/live-receipt.json`), the scored run
`.ufo/waves/round-99/scored/c1-live.json` (rc 0, `clean`, 282 checks, 0 findings), the pre-freeze
controls `.ufo/waves/round-99/controls/` and the staged sources `.ufo/waves/round-99/sources/`.

No falsification found: no re-derived count differs from the frozen claim, the committed instrument
checks every leg-level statement the frozen sentence states, and the source rows are read back
verbatim from the staged copies. No tool install was needed; none was made.

VERDICT C1: neutral
