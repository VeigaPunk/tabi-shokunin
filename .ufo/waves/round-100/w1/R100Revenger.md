# R100Revenger — protocol-level hypothesis probe (C1 r100)

## Hypothesis tested
MIXED fails in the Playwright client before any protocol: the `DEBUG=pw:protocol` log for MIXED shows no
`DOM.setFileInputFiles` and no injected `setInputFiles` evaluation, while DUP3 shows injected-script payload
delivery with no `DOM.setFileInputFiles`, LAUNCH2PU/LAUNCH2PL show exactly one `DOM.setFileInputFiles`
carrying two files on the iframe session, and DIR shows `setInputFilePaths` (or equivalent directory walk)
with the two files on the iframe session and trusted events.

## Setup (exact commands)
- Deps (npm registry; no pacman — host-wide PAUSED; no sudo): `mkdir -p /fast/scratch/hyaku/tabi-r100/R100Revenger/deps … && npm init -y && npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` → exit 0; installed versions confirmed `25.16.0 1.65.0`.
- Own script `R100Revenger-probe.mjs` (copied to `w1/`): mirrors the frozen driver fixture (parent `127.0.0.1:34151`, cross-site child `localhost:34152`, inputs `#s`/`#m`/`#d`, listeners recording `[id,type,isTrusted]`); `TMPDIR=/fast/scratch/hyaku/tabi-r100/R100Revenger/t` set before the requires; one rep per arm; ports 34151/34152/34153 only.
- Runs (all exit 0):
  - Playwright arms: `TMPDIR=… DEBUG=pw:protocol,puppeteer:protocol:* node probe.mjs <ARM> > logs/<ARM>.json 2> logs/<ARM>.log`
  - LAUNCH2PU rerun: `TMPDIR=… NODE_DEBUG='puppeteer:protocol:*' node probe.mjs LAUNCH2PU` (see note).

## Results — hypothesis CONFIRMED on all six arms (full counts in `R100Revenger-results.json`; logs `R100Revenger-<ARM>.log`)

| arm | DOM.setFileInputFiles SEND | injected `setInputFiles` eval | outcome / events |
|---|---|---|---|
| DUP3 | 0 | 1 — one `Runtime.callFunctionOn` carrying all three payloads (dup.txt 21B `c2FtZS1uYW1l…`, dup.txt 22B, other.txt 11B) | resolved; untrusted |
| EMPTY1 | 0 | 1 — one eval carrying one 0-byte payload (`buffer:""`) | resolved; untrusted |
| MIXED | 0 | 0 (only 2 `Runtime.callFunctionOn` total vs 9–12 elsewhere; no FC/setInputFilePaths) | error `File paths cannot be mixed with buffers`; nothing set, no events |
| LAUNCH2PL | 1 | 0 | resolved; trusted; files `[a.txt,b.txt]` on session `C54438DB…` |
| LAUNCH2PU | 1 | 0 | resolved; trusted; files `[a.txt,b.txt]` on session `2CB658E6…` |
| DIR | 1 | 0 | resolved; trusted; `DOM.setFileInputFiles` with the single directory path `probe-dir` on session `DE7B4FFD…`; browser walks recursively (`one.txt`, `sub/two.txt`, `webkitRelativePath`) |

- **MIXED killer check:** no file-setting command of any kind was sent — `DOM.setFileInputFiles` ×0,
  injected `setInputFiles` ×0, `FileChooser` ×0. The refusal happens client-side before the protocol.
  This contradicts nothing in C1: declared limit 5 explicitly reads "refused before any file is set" from
  outcome (all inputs `[]`, no event), which this arm also satisfies.
- **DIR refinement:** the hypothesis guessed `setInputFilePaths` (or equivalent). The actual mechanism is
  `DOM.setFileInputFiles` with `[directoryPath]` and the recursive walk is browser-side — no enumerated
  file list ever crosses the wire. The predicate bullet (recursive, `webkitRelativePath`, trusted events)
  still holds exactly.
- **LAUNCH2PU logging note:** `DEBUG=puppeteer:*` and `DEBUG=puppeteer:protocol:*` both produce a 0-byte log.
  puppeteer-core 25.16.0 `common/Debug.js` uses Node `util.debuglog` (the `NODE_DEBUG` env), not the
  `debug` package, so `NODE_DEBUG='puppeteer:protocol:*'` is required. (Logged as a finding for anyone
  repeating this probe; it does not affect C1 — the frozen counter never reads a protocol trace.)

## No contradiction
No protocol fact contradicts a predicate bullet: payload arms deliver via injected script with untrusted
events; path arms send exactly one `DOM.setFileInputFiles` with trusted events; MIXED sends nothing;
DIR walks recursively browser-side with trusted events. All six arms also reproduce the leg-level outcome
(files/events/error) the predicate states.

## Cleanup
`pgrep -f "remote-debugging-port=34153"` empty; no processes carry the scratch path. Scratch
`/fast/scratch/hyaku/tabi-r100/R100Revenger/` rm -rf'd after copying evidence into `w1/`.

VERDICT C1: neutral
