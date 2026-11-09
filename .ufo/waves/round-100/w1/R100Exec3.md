# R100Exec3 — declared limit 4 leads (r101), not counted legs

Seat: R100Exec3 (godspeed). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Probe script: `.ufo/waves/round-100/w1/R100Exec3-probe.mjs`; raw output:
`.ufo/waves/round-100/w1/R100Exec3-out.json` (24 legs, 8 arms x 3 reps, 0 runner failures).
This report is a lead memo for r101; none of its legs are counted toward C1.

## Setup (exact commands and exits)

```
mkdir -p /fast/scratch/hyaku/tabi-r100/R100Exec3/deps /fast/scratch/hyaku/tabi-r100/R100Exec3/t
cd /fast/scratch/hyaku/tabi-r100/R100Exec3/deps && npm init -y >/dev/null 2>&1
npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0   # EXIT:0, 26 packages
node -e "console.log(require('puppeteer-core/package.json').version, require('playwright-core/package.json').version)"
# → 25.16.0 1.65.0
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-100/w1/R100Exec3-probe.mjs   # PROBE_EXIT:0
pgrep -f "remote-debugging-port=34133"  # empty → CHROMIUM_GONE before yielding
```

Client deps: npm registry (official channel), puppeteer-core 25.16.0 / playwright-core 1.65.0,
into scratch (no pacman, no sudo, no PATH mutation; nothing else installed or upgraded).
Host: Chromium 155.0.8059.84 (`Chromium 155.0.8059.84 Arch Linux`), `Chrome/155.0.8059.84`
at DevTools on every leg. Ports 34131/34132/34133; scratch root
/fast/scratch/hyaku/tabi-r100/R100Exec3 (removed after copying receipts here).
TMPDIR set to <scratch>/t before requiring either client; `tmpdirAtLoad` in the JSON records it.

## Fixture (shape copied from the frozen driver)

Parent `http://127.0.0.1:34131/parent.html?leg=<id>` (input #pp + one iframe) over child
`http://localhost:34132/child.html?leg=<id>` (cross-site) holding #s (no multiple), #m (multiple),
#d (webkitdirectory); input/change/click listeners record [inputId, type, isTrusted] in one list.
Every leg: own chromium (`--headless=new`, `--remote-debugging-port=34133`), Playwright
`connectOverCDP` with/without `isLocal`, call on the child frame, 400 ms settle, then files as
[name, size, type, webkitRelativePath] for all three inputs, the event list, arrayBuffer() reads
(WebCrypto SHA-256), plus arm (d) extras. All 24 legs identical across the 3 reps.

## Results per arm (all 3/3 reps agree)

(a) A_DUPPATH — isLocal, two paths both named dup.txt on #m: RESOLVED. #m lands
[["dup.txt",20,"text/plain",""],["dup.txt",28,"text/plain",""]] in order;
events [["m","input",true],["m","change",true]] (trusted path arms); reads ok with sha256
f1fa44ad… (20 B) and e0bc0a5b… (28 B), matching the on-disk fixture bytes. Duplicate path
basenames are kept, not deduped or renamed — mirroring the DUP3 payload behaviour.

(b1) B1_EMPTY_M — isLocal, one 0-byte path on #m: RESOLVED, trusted.
#m [["empty-path.txt",0,"text/plain",""]], events trusted input/change, read ok empty sha256
e3b0c442… — the empty-*path* counterpart of EMPTY1, on the trusted side.

(b2) B2_EMPTY_S — isLocal, one 0-byte path on #s: RESOLVED, trusted.
#s [["empty-path.txt",0,"text/plain",""]], events [["s","input",true],["s","change",true]],
read ok empty sha256. The non-multiple input accepts the single empty path.

(c) C_FOUR — four payloads on #m: RESOLVED, untrusted. All four land in order
(f1..f4.txt, 14/14/16/15 B, text/plain), events [["m","input",false],["m","change",false]],
all reads ok matching the sent bytes. No file-count ceiling at 4.

(d) D_BINREADS — 256-byte binary payload (bytes 0..255, image/png) on #m: RESOLVED, untrusted.
arrayBuffer() read ok 256 B, sha256 40aff2e9… = the sent bytes. Extras (r99Exec3 (h) leads):
`text()` ok — 256 chars, UTF-8-re-encoded sha256 0f1a0d9c… (byteLength 512 on re-encode, i.e.
lossy for non-UTF-8 bytes, no throw); `slice(1,3).arrayBuffer()` ok 2 B,
sha256 a12871fe… = bytes [1,2]. Both reads work on calculator-pattern binary.

(e1) E1_FILE_ON_D — isLocal, one file path on #d: ERROR, name Error, message (first line)
"locator.setInputFiles: Error: [webkitdirectory] input requires passing a path to a directory".
All inputs [], no events. The S240 line 760-761 webkitdirectory refusal, S249 directory check.

(e2) E2_DIR_ON_M — isLocal, one directory path on #m: ERROR, name Error, message
"locator.setInputFiles: Error: File input does not support directories, pass individual files instead".
All inputs [], no events. The S240 line 758 refusal. Both refusals fire before any file is set.

(f) F_DIR_FILE — isLocal, [dirPath, filePath] on #m: ERROR, name Error, message
"File paths must be all files or a single directory" (no "locator.setInputFiles: Error:" prefix —
thrown before the locator call). All inputs [], no events. The S249 directory-vs-files
disjunction (client-side resolvePathsAndDirectoryForInputFiles), distinct from the S248
mixed path+payload message measured by MIXED.

## Kill-rule assessment

None of (a)-(f) contradicts a frozen C1 sentence. Each unmeasured shape behaves exactly as the
declared limits 3/4 describe leaving it (`four or more files`, `duplicate path basenames`,
`a non-directory path on #d`, `a directory path on #m/#s`, the empty-file *path*, and the (h)
`slice`/`text()` reads are all listed as unmeasured); the exact refusal strings are consistent
with the sourced S240/S249 messages, and the trusted/untrusted polarity matches the arms'
isLocal settings. These are frontier leads for r101: A_DUPPATH and B1/B2 fold naturally into
frozen legs (dedup rule for path basenames; trusted empty path), C_FOUR lifts the three-file
cap, D_BINREADS turns the (h) reads into counted legs, and E1/E2/F give three exact error
strings to freeze. Nothing here shows a leg-level statement of predicate
C1-CLIENT-OOPIF-UPLOADSETS-R100 false on a --live run of the pinned driver.

## Artefacts and cleanup

Evidence artefacts (relative to the lane):
- `.ufo/waves/round-100/w1/R100Exec3-probe.mjs` (the ad-hoc probe script)
- `.ufo/waves/round-100/w1/R100Exec3-out.json` (all 24 legs, fixtures, digests)
- `.ufo/waves/round-100/w1/R100Exec3.md` (this report)

Scratch /fast/scratch/hyaku/tabi-r100/R100Exec3 was removed after copying the out.json in
(rm -rf); `pgrep -f "remote-debugging-port=34133"` was empty before yielding. Checks the main
agent may run: none required — no lane files were edited, no commits, no git/jj mutation.

VERDICT C1: neutral
