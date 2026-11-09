# R97Sentinel — C1 library-identity trust boundary (--deps tree hash)

Leaf seat, no dispatch. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base 607c8b02, freeze 4a4e15e3, scored be9487f6.
Scratch `/fast/scratch/hyaku/tabi-r97/R97Sentinel/` removed before yield. Copies cited below are in this directory.

## Tooling and installs (recorded)
- node v24.21.0, npm 11.19.0 (pre-existing, unchanged).
- Client deps, npm default registry, channel `npm`, in my scratch only:
  `npm init -y && npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` → 26 packages
  (puppeteer-core 25.16.0, playwright-core 1.65.0, transitive ws 8.22.2 etc.). Reason: client deps for `--deps`.
- No pacman, sudo, PATH or global installs. Chromium 155.0.8059.84 is the host `/usr/bin/chromium` (not touched).

## Pins re-derived on my clean install (before any edit)
- Lock integrity equals registry `npm view <pkg>@<ver> dist.integrity` for both packages (`sha512-VA5Pf54N…IJw==`, `sha512-vNSKgH6Y…+lA==`).
- Tree (counter algorithm, regular files + symlink targets): puppeteer-core 927 files / `968a85e8…d1e180`; playwright-core 116 / `24584693…f5cd641`.
- `ElementHandle.js` sha `162b7199…9b7c96`, `coreBundle.js` sha `4ef83305…63f7f1`: match.
- Lock has 26 non-root entries = 2 pinned + 24 transitive (matches declared limit 2).
- Not pinned by any counter check: root `deps/package.json`, root `deps/package-lock.json` (only the two top-level `integrity` strings are read), `node_modules/.package-lock.json`, `node_modules/.bin`.

## Live runs (`--live`, counting command exactly as frozen, `--expect-driver-sha256 09f0c2fe…`, 3 reps, 24 legs each)
| run | ports | change (scratch copy) | verdict | checks | findings |
|---|---|---|---|---|---|
| baseline | 32761-3 | none | clean | 232 | 0 |
| baseline-rerun | 32761-3 | none | clean | 232 | 0 |
| ws-comment-only | 32764-6 | comment line appended to transitive `ws/lib/websocket.js` | clean | 232 | 0 |
| ws-strip-files | 32761-3 | transitive `ws` `send()`: `DOM.setFileInputFiles` → `files: []` | findings | 232 | 21 (`child-files`, `child-events` on PUX, PUS, PUC, PUM) |
| ws-multifile-only | 32761-3 | transitive `ws` `send()`: keep only first file of a multi-file `DOM.setFileInputFiles` | clean | 232 | 0 |
| lock-transitive-edit | 32764-6 | `package-lock.json`: `node_modules/ws` integrity forged, `resolved` → invalid host | clean | 232 | 0 |
| pp-extra-file | 32764-6 | new file `puppeteer-core/lib/tabi-r97-extra.txt` | findings | 232 | 1 `libs` (928 files) |
| pp-empty-dir | 32764-6 | empty dir `puppeteer-core/tabi-r97-empty-dir` | clean | 232 | 0 (tree still 927 / `968a85e8`) |
| pp-symlink | 32764-6 | symlink `puppeteer-core/lib/tabi-r97-link.json → ../package.json` | findings | 232 | 1 `libs` (928 files, tree `f4360cba`) |
| pw-comment-only | 32764-6 | comment line appended to `playwright-core/lib/coreBundle.js` | findings | 232 | 1 `libs` (tree `b32bf788`; coreBundle sha → `2864056b…`) |

Every `libs` finding is the only finding in its run; no leg-level finding was produced by a tree-only change.
Receipts: `R97Sentinel-receipt-<run>.json`; counter JSON: `R97Sentinel-<run>.json`; diffs: `R97Sentinel-*.diff`, `R97Sentinel-v-lock-transitive.diff`.

### (a) transitive dependency (`ws`, Puppeteer's only transport dependency)
- Behaviour-changing patch (strip `files`): **caught** by leg checks (21 findings). Top-level `libs` clean: the counter catches it through observed behaviour, not through the identity pins.
- Behaviour-preserving patch (comment): **passes**. Transitive bytes are not bound.
- Behaviour-changing patch on a path the counter never exercises (multi-file call drops the 2nd file): **passes**. Standalone check (`R97Sentinel-multifile-check.txt`, cdp 32763): pristine deps → `[["f1.txt",4],["f2.txt",4]]`; patched → `[["f1.txt",4]]`. The counter sends one file per call (declared limit 5), so the change is invisible to it.
- Forged transitive lock entry (integrity + resolved): **passes**. Transitive lock entries are never read.

### (b) extra file, symlink, empty directory in `node_modules/puppeteer-core`
- Extra regular file: **caught** (`libs`, 928 files).
- Symlink: **caught** (`libs`; symlinks are recorded by target, so they count as an entry).
- Empty directory: **not caught**. Directories are recursed but never recorded, so the tree sha256 is unchanged and the run is clean.

### (c) comment-only edit in `node_modules/playwright-core`
- **Caught** by `libs`: tree sha changes (`b32bf788`), and `coreBundle.js` sha changes from `4ef83305…` to `2864056b…`. The `integrity` string is unchanged, so only the hash checks bind.

## What a clean `--live` verdict binds after r97
Binds:
1. The driver file: sha256 `09f0c2fe…` checked before the run; receipt `driverSha256` equal.
2. For each top-level package dir `node_modules/puppeteer-core` and `node_modules/playwright-core`: its version, and the set of (relative path, sha256) for every regular file plus symlink targets (927 and 116 entries). Empty directories, file modes and anything outside `node_modules/<pkg>` are not bound.
3. One file per package (`ElementHandle.js`, `coreBundle.js`), redundant with 2.
4. The top-level `integrity` string as read from `--deps/package-lock.json`, compared with the constant. This is a self-report: the instrument does not check it against the installed tree or the registry. (I confirmed the constant equals the registry value today; the counter does not.)
5. The observed behaviour of 24 one-file legs on this Chromium, with whatever transitive code those legs executed.

Does not bind: transitive packages (ws and 22 others, incl. devtools-protocol, chromium-bidi, @puppeteer/browsers, zod, yargs); root `package.json` and `package-lock.json` (except the two integrity strings); `node_modules/.package-lock.json`; empty dirs and file modes; Node runtime (version not in the receipt); environment (`NODE_OPTIONS` etc. inherited by the driver, same-UID trust, declared limit 7); the chromium binary itself (only the `/json/version` string); any multi-file or non-one-file behaviour.

So a clean verdict says: "the two top-level packages as installed match these digests, and 24 one-file legs behaved as observed". It does not say "the puppeteer-core 25.16.0 dependency closure behaves as shipped": (a) shows a transitive edit that changes an unmeasured path and still gets a clean verdict.

## Wording gate
- Frozen sentence (plans/round-97.md §Claim, "Identity is pinned on … a sha256 over the whole installed package tree"). Instrument (driver lines 96-107): regular files plus symlink targets only; directories are recursed and not recorded. Run `pp-empty-dir` is clean with an added empty directory. The instrument enforces a narrower property (regular files) than "whole installed package tree". The plan's own parenthetical defines it as "every regular file", but the frozen identity sentence says "whole". Leg-level statements and counts are unaffected.
- Calibration (not a falsification): "pinned … lockfile integrity" is a string comparison against a self-reported field of the `--deps` lock. The sentence does not claim tree-to-lock verification, but "identity" overstates it. The tree hashes are what bind.
- Smallest remediation (not applied; lane is not mine): either reword to "every regular file and symlink under node_modules/<pkg>" and state that empty directories and the root lock are unbound, or hash all entries under node_modules (dirs as entries, modes) plus `sha256(package-lock.json)`, `sha256(package.json)` and `node --version` in the receipt. Transitive-tree hashing would also close (a)/(lock) but is declared out of scope in limit 2.

## Caveats on my own work (disclosed)
- My first `ws` hook landed in `ping()` (anchor matched the first `data.toString()` occurrence), so the first strip and multi runs were unpatched and clean. I found it (no trace file) and redid both after anchoring to `send()`. The invalid JSON was not kept in this directory.
- A nohup background chain died after 2 runs (baseline and ws-comment-only completed, full JSON). The rest were run in the foreground.
- I accidentally started a second counter run on ports 32764-6 concurrently (its output discarded). The pw-comment run then returned `setup` (rc 2, port collision); it was re-run alone, rc 1 `libs`. Its `setup` JSON was overwritten.
- `pgrep -fa "remote-debugging-port=3276[1-6]"` was empty after every run; no background jobs remain.

## Files (this directory)
`R97Sentinel.md`; `R97Sentinel-<run>.json` (baseline, baseline-rerun, ws-comment-only, ws-strip-files, ws-multifile-only, lock-transitive-edit, pp-extra-file, pp-empty-dir, pp-symlink, pw-comment-only); `R97Sentinel-receipt-<run>.json` for each; `R97Sentinel-*.diff` (ws-strip-send, ws-multifile-send, ws-comment-only, pp-extra-file, pp-empty-dir, pp-symlink, pw-comment-only); `R97Sentinel-v-lock-transitive.diff`; `R97Sentinel-multifile-check.txt`.

VERDICT C1: falsifies-wording
