# R99Exec3 — limit-4 frontier probes (round 99, C1 uploadsets)

Seat: R99Exec3 (leaf executor). Ad-hoc probe, not the pinned driver; not a counted leg.
Script: `.ufo/waves/round-99/w1/R99Exec3-probe.mjs` (runs as-is with `node`; expects deps at
`/fast/scratch/hyaku/tabi-r99/R99Exec3/deps`). Raw: `.ufo/waves/round-99/w1/R99Exec3-out.json`.
Ports 34631/34632/34633 only. TMPDIR set to `<scratch>/t` before the clients load. Fixture shape
copied from the pinned driver: cross-site child `localhost` under parent `127.0.0.1`.
Probe-only additions: a `webkitdirectory` input `#d` in the child page (for probe g); the child
has `#s` (no multiple), `#m` (multiple), `#d` (webkitdirectory); listeners record `[id,type,isTrusted]`.

Client install (npm registry, channel `npm`, no OS or uv tool installs):
`npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` → added 26
packages; puppeteer-core 25.16.0, playwright-core 1.65.0; `/usr/bin/chromium --version` =
`Chromium 155.0.8059.84 Arch Linux`.

Commands run (exit codes):
- `npm install ...` → 0
- `timeout 600 node R99Exec3-probe.mjs` (first run; (g) errored, see below) → 0
- `timeout 600 node R99Exec3-probe.mjs > run2.log` (after fixing (g)) → exit 0, `no chromium left`
  (pgrep on port 34633 empty after the run)

Reps: 3 each, each rep in a fresh chromium (own profile).

## Observations (3/3 consistent unless noted; every leg `error=null` in the receipt)

- **(a) three payloads, two named `dup.txt`, on #m (Playwright connectOverCDP, no isLocal)** — 3/3.
  Resolves. Three files land in order `[dup.txt 21 text/plain, dup.txt 22 text/plain, other.txt 11
  text/plain]`. No dedupe or rename. Events `[m,input,false],[m,change,false]` (untrusted). Both reads
  of each file equal (ab == fr), digests distinct per file (first `bb6d8edc…`, second `7fb4cba7…`,
  third `1a1308a9…`).
- **(b1) 0-byte payload `tabi-r99-empty.txt` (no mimeType given, typed text/plain) on #m** — 3/3.
  Resolves. Lands `[tabi-r99-empty.txt, 0, text/plain]`. Untrusted events. Both reads ok, size 0,
  sha256 `e3b0c442…b855` (the empty-string sha256).
- **(b2) 0-byte file path `probe-empty.txt` on #m (connectOverCDP isLocal)** — 3/3.
  Resolves. Lands `[probe-empty.txt, 0, text/plain]`. Events `[m,input,true],[m,change,true]`
  (TRUSTED). Both reads ok, size 0, sha256 `e3b0c442…b855`.
- **(c) one path + one payload in one Playwright call on #m (isLocal)** — 3/3.
  Errors: name `Error`, message exactly `File paths cannot be mixed with buffers`. Nothing set (#s,
  #m, #d all `[]`), no event, no read. Mixed path+payload is refused before any file is set.
- **(d) Playwright `chromium.launch` with two paths on #m** — 3/3.
  Resolves. Lands `[probe-a.txt 22 text/plain, probe-b.txt 30 text/plain]`. Events TRUSTED
  (`[m,input,true],[m,change,true]`). Both reads ok with the same digests as the isLocal arm
  (`7712697e…cfff` for a, `6f834164…84` for b).
- **(e) Playwright connectOverCDP isLocal, two paths on #s** — 3/3.
  Errors `Error`, message exactly `locator.setInputFiles: Error: Non-multiple file input can only accept
  single file`. Identical to the PLBN message the frozen PLBN leg asserts. Nothing set, no event, no read.
- **(f) Puppeteer `launch` with two paths on #m** — 3/3.
  Resolves. Same two files as (d), TRUSTED events, both reads ok with the same digests.
- **(g) `webkitdirectory` input #d, Playwright isLocal, directory path** — 3/3 (after a correction).
  First attempt passed `setInputFiles({ localDirectory: dirPath })` and errored with
  `locator.setInputFiles: payloads[0].name: expected string, got undefined` — the object form is
  read as a payload, not as a directory; that first run is a probe-authoring error, not a finding.
  Corrected call `setInputFiles(dirPath)` (string) resolves 3/3. Lands two files, in order:
  `[one.txt 13 text/plain, webkitRelativePath probe-dir/one.txt]` and
  `[two.txt 13 text/plain, webkitRelativePath probe-dir/sub/two.txt]`. Recursive: the nested file is
  included, and `webkitRelativePath` keeps the directory name prefix and the subdirectory. Events
  TRUSTED on #d (`[d,input,true],[d,change,true]`). Both reads ok, digests
  `d23bc5bb…a5d9` (one.txt) and `c40815e6…09a8` (two.txt). #s and #m stay `[]`.
- **(h) 256-byte binary payload, untyped name `tabi-r99-bytes.png`, on #s** — 3/3.
  Lands `[tabi-r99-bytes.png, 256, image/png]` (the claimed PLBX arm, re-observed). Untrusted events.
  `arrayBuffer` and FileReader both `ok 256 40aff2e9…944880`. Extra reads:
  - `slice(1,3).arrayBuffer()` → `ok 2 a12871fee210fb8619291eaea194581cbd2531e4b23759d225f6806923f63222`
    (sha256 of bytes 0x01 0x02; the value is the standard one for that 2-byte input).
  - `text()` → `ok` with string length 256 (UTF-16 units). The printed prefix is the ASCII bytes
    0x00..0x7F then U+FFFD replacement characters (the exact per-byte mapping was not checked
    byte-by-byte).

## Contradictions with frozen-claim sentences (falsifiers)

None. Checked against each sentence the frozen claim makes about these arms:
- PLBX/PLBM/PLBN untrusted, PLLP/PUCM trusted: re-observed as stated; (b2), (d), (f) match the
  trusted-paths sentence, (a), (b1), (h) match the untrusted-payloads sentence.
- PLBN message `locator.setInputFiles: Error: Non-multiple file input can only accept single file`:
  matches (e), on a path call rather than a payload call; same string.
- PUCN's Puppeteer message is not probed here (f is the launch variant on #m).
- PUAM/PLAM, read errors, PLBX sha256: not probed here (outside limit-4 probe scope).

Everything above is a lead for r100, not a counted fact.

## Leads (frontier, uncounted)

1. Playwright accepts duplicate names and keeps them (a): a payload-level counter would need
   `dup.txt` ×2 with distinct digests to distinguish a rename from a drop.
2. Playwright refuses path+payload mixing with a plain `Error` `File paths cannot be mixed with buffers`
   (c), before the non-multiple gate (no #s/#m input was involved in the refusal).
3. Directory input (g): events are TRUSTED on #d, the directory is walked recursively, and
   `webkitRelativePath` carries the subdirectory. Directories are declared unmeasured (limit 4);
   this is the first observation of the shape, not a counted leg.
4. Zero-byte files (b1/b2) resolve and read; `text/plain` for a 0-byte `.txt` payload with an explicit
   mimeType.
5. `text()` on a non-UTF-8 payload is lossy (U+FFFD); the claim's reads are the digest-level reads,
   so this does not contradict it, but any future `text()` arm must compare decoded strings, not bytes.

## Cleanup

- Scratch `/fast/scratch/hyaku/tabi-r99/R99Exec3` removed after the run (see final command).
- No chromium left on 34633 after both runs.
- No commits, no git/jj calls, no files written outside this seat's report paths
  (`R99Exec3-probe.mjs`, `R99Exec3-out.json`, `R99Exec3.md`).

VERDICT C1: neutral
