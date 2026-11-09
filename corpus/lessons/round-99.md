# tabi — round 99

L1 `TabiR99`. Base `9eaa5cbe` (lane tip at round start; rounds 93-98 closed admitted). ONE claim — C1
coverage, the new capability `client-oopif-uploadsets-linux` (on file inputs inside a cross-site iframe,
puppeteer-core 25.16.0 and playwright-core 1.65.0 both refuse two files on an input without `multiple` with a
plain `Error` and set nothing; two files on a `multiple` input land in order, trusted from paths and
untrusted from payloads; an untyped payload's type follows its name; binary bytes survive `arrayBuffer()` and
`FileReader`; the absent path on client-launched browsers behaves per client) — worded as the conjunction of
its counter's checks with the process facts named as driver-pin facts, frozen with its executed controls in
commit `27685238` (`claims.json.frozenAt` 02:11:46 -03:00) before the scored run (`ff978cb4`) and before the
wave `.ready` was written (02:12:45).

## Gate

### Sources — opened this round

- **S244** (admit, tier A, `mined`) — Puppeteer `packages/puppeteer-core/src/util/assert.ts` at tag
  `puppeteer-v25.16.0`, https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/packages/puppeteer-core/src/util/assert.ts
  (accessed 2026-11-09 02:04 -03:00 by the L1, HTTP 200, 434 B, sha256 `d0094a44bf9d`, staged
  `.ufo/waves/round-99/sources/pp-assert.ts`). Line 19: "throw new Error(message);" (4 words). It teaches why
  PUCN's `errName` is `Error`.
- **S245** (admit, tier A, `mined`) — W3C File API Editor's Draft, https://w3c.github.io/FileAPI/ (accessed
  2026-11-09 02:04 -03:00, HTTP 200, 566,152 B, sha256 `0034ebf43031`, staged `fileapi.html`, line 2827):
  "If the File or Blob resource could not be found at the time the read was processed, this is the NotFound
  failure reason" (23 words). It teaches that both read APIs failing `NotFoundError` on PUAM is specified.
- **S246** (admit, tier A, `mined`) — mime v4.1.0 `types/standard.ts`,
  https://raw.githubusercontent.com/broofa/mime/v4.1.0/types/standard.ts (accessed 02:04, HTTP 200, 12,238 B,
  sha256 `6cd8a657c4aa`, staged `mime-standard.ts`). Line 283: "'image/png': ['png']," (2 words). The version
  pin is Playwright v1.65.0's root `package.json` line 144 `"mime": "4.1.0",` (staged `pw-root-package.json`,
  sha256 `bffb91e4e110`).
- **S247** (admit, tier A, `mined`) — mime v4.1.0 `src/Mime.ts`,
  https://raw.githubusercontent.com/broofa/mime/v4.1.0/src/Mime.ts (accessed 02:04, HTTP 200, 3,907 B, sha256
  `510d955cd708`, staged `mime-Mime.ts`). Line 87: "return this.#extensionToType.get(ext) ?? null;" (5
  words). It teaches the `application/octet-stream` fall-through for `.tabi99`.
- Re-opened unchanged (byte-identical sha256 to their rows; no cell changed, so no `status`/`recheck`/
  `used-by` change is logged): **S237** `ElementHandle.ts` (`c86ed958566f`; lines 113-116 the `multiple`
  assert), **S238** `fileUploadUtils.ts` (`96dd5ef0713d`; line 80 the mimeType fallback), **S240** `dom.ts`
  (`65cb43c91893`; lines 756-757 the Non-multiple refusal). The r99 note cites all three.

### Rejected as rows (reasons; flip conditions)

- Playwright v1.65.0 root `package.json` (https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/package.json,
  HTTP 200, 7,319 B) — reject as its own row: it bears only as the version pin for mime and is quoted inside
  S246's anchor. Flip: a claim that rests on another dependency pin in the same file.
- `packages/playwright-core/bundles/utils/package.json` at v1.65.0 — HTTP 404 (no such path at the tag);
  unverifiable, not fabrication. Flip: none needed (the pin was found in the root manifest).

### Census

Start (`.ufo/waves/round-99/census-start.txt`): `tabi ok`, exit 0. Registry 243 → 247 rows (S244-S247).

### Assimilation / considerthese

Assimilation: none (the lane's package adoption is not this round's claim). considerthese: no
`considerthese/` directory exists in this lane.

## Mistakes

1. **class: environment set after the module that reads it (r98 mistake 3, carried and fixed).**
   Evidence: `.ufo/waves/round-99/controls/tmpdir-strace-r98.txt` — the r98 driver, run under `strace -f -e
   trace=mkdir,mkdirat`, makes 4 `mkdir("/tmp/playwright-artifacts-…")` in one `--reps 1` run because
   playwright-core computes `ARTIFACTS_FOLDER` from `os.tmpdir()` at module load (installed `coreBundle.js`
   lines 40647/44899/45997) and the r98 driver set `TMPDIR` after the require. Captured-by: §7 item 4 of the
   round prompt (no hard-coded `/tmp` in committed tools) — but only by a seat (R98Sentinel), not by any
   lane gate. Fix: the r99 driver sets `TMPDIR` before loading either client and records `tmpdirAtLoad`
   (counter `tmpdir-bound`, killer K-tmpdir). **Shown able to fail:** the same strace control on the r99 driver
   gives 0 under `/tmp` and 5 under its own scratch `t/`, against 4 under `/tmp` for the r98 driver
   (`controls/rc.txt` line `tmpdir-strace r98-under-tmp=4 r99-under-tmp=0 r99-under-scratch=5`).
2. **class: refusal that masks findings (r98 D3, R98Reviewer).** Evidence: r98 counter
   `if (status === 3) refuse(...)` before any check. Captured-by: R98Reviewer should-fix. Fix: on exit 3 the
   r99 counter checks the receipt and skips only launch-failed legs (limit 8). **Shown able to fail:** live
   killer K-partial — a driver mutant with one launch failure and a renamed binary payload gives the frozen
   counter rc 1 `child-files`, and the counter with the r98 mapping restored gives rc 2 `setup`
   (`controls/livekillers.json`); K-launchonly keeps a pure launch failure at rc 2.
3. **class: source ids assigned before the registry was read.** Evidence: the first driver draft's header
   (before the freeze; not in any commit) cited "S244 dom.ts, S245 fileUploadUtils.ts, S246
   ElementHandle.ts" — but those three documents were already rows S240, S238, S237. The L1 caught it when it
   read the registry before writing rows, and rewrote the header before the probe that the freeze pins
   (driver sha changed `8521b447…` → `98efdc12…`; the probe and every control ran on the final bytes).
   Captured-by: none (no gate reads citations in instrument comments). Fix: rows are numbered only after
   `grep -n '<url>' corpus/SOURCES.md` for every fetched URL; not yet shown able to fail by a gate, so it is
   recorded as a practice, not a fix.
4. **class: universal negative backed by a narrower search (frozen-text overclaim).** Evidence: the frozen
   "Surface moved" sentence (`plans/round-99.md`, "No lane instrument has ever put two files into one input …
   or read an upload with `arrayBuffer()`/`FileReader`") rested on a grep scoped to
   `scripts/client-oopif-*round9[5-8].mjs`; `scripts/chrome-cdp-filechooser-round77.mjs:182` and
   `…round78.mjs:185` read uploads with `arrayBuffer()` and r77 `pick-multiple` landed two files in a
   `multiple` input. Captured-by: the wave — R99Critic1 W1 and R99Connector H1, both independently; no lane
   gate reads history sentences. Fix: plan §Amendment A1 item 1 narrows the sentence (addendum §8 choice i);
   rule for the next freeze — a "no lane instrument has ever" sentence runs its grep over `scripts/` whole,
   not a glob. **Shown able to fail:** `git grep -lE 'arrayBuffer\(\)|readAsArrayBuffer' 9eaa5cbe --
   scripts/` lists `chrome-cdp-filechooser-round77.mjs` and `…round78.mjs` (2 hits) where the frozen glob
   lists none.
5. **class: a refusal clause wider than its branch (limit 8).** R99Critic1 W2: the every-leg launch-failed
   refusal discards receipt-level findings that limit 8's first clause says are reported. Captured-by: the
   wave (R99Critic1). Fix: §Amendment A1 item 2 narrows the clause; unreachable with the pinned driver (it
   labels only real launch failures) and absent from the scored run (0 launch failures).

## Leads (not rows, not claims this round; R99Exec3 ad-hoc probe, 3/3 each, `.ufo/waves/round-99/w1/R99Exec3.md`)

- Three payloads with two equal names on `#m` land all three in order, no dedupe or rename (untrusted).
- A 0-byte payload lands `[name, 0, text/plain]`; a 0-byte path lands the same with trusted events
  (`isLocal`); both read as the empty-string sha256.
- One path + one payload in one Playwright call: `Error` "File paths cannot be mixed with buffers", nothing
  set.
- Playwright `chromium.launch` and Puppeteer `launch` with two paths on `#m`: trusted, intact (the launch
  analogues of PLLP/PUCM).
- `isLocal` with two paths on `#s`: the same Non-multiple message as PLBN.
- `webkitdirectory` + Playwright `setInputFiles(<dir path>)` on `isLocal`: recursive, `webkitRelativePath`
  keeps the directory prefix, trusted events; `{localDirectory: …}` is read as a payload object and refused.
- On the binary payload, `slice(1,3).arrayBuffer()` gives the 2-byte digest; `text()` gives 256 UTF-16 units
  with U+FFFD for bytes ≥ 0x80 (not checked byte by byte).

Each is a candidate counted leg for round 100 (r99 limit 4).

## Wave w1 (12 seats; every seat filed; artifacts in `.ufo/waves/round-99/w1/`; `w1-results.json`)

Roles: executor ×3, critic ×2, mutation-tester, revenger, reviewer, sentinel, scout, scribe, connector;
attack share (reviewer + critic + mutation-tester) 4/12 = 33 %. 0 dead seats. Verdicts: 11 `neutral`, 1
`falsifies-wording` (R99Critic1 W1/W2, narrowed by plan §Amendment A1; R99Connector H1 the same item).
Reproductions of the frozen `--live` command: R99Exec1 ×2 clean 282; R99Exec2 `--reps 10` clean 898 and
default clean, live killers 6/6; R99Sentinel strace run clean with 0 writes under `/tmp`/`/var/tmp`.
R99Mut 98 mutants / 68 killed / 30 survived (11 receipt-mode battery gaps, 19 live-only; none exhibited by
the scored receipt) — routed to r100. R99Sentinel's hardened-counter and copy-then-execute diffs are
recommendations against limit 6/8 classes, not integrated (frozen bytes stay frozen); routed to r100.
R99Scout's opened sources (WHATWG `files` setter, Puppeteer/Playwright issues) are held as leads, not rows.
Corrections integrated: r77 note first-path bullet scoped to raw CDP (R99Connector H2); r99 note relation and
scope appended (H1/H5).
