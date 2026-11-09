# R97Exec3 — limit probes for round 97 C1 (limits 2, 4, 5)

Seat: R97Exec3. Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Target: Tabi round 97, one v1 wave w1, L1 TabiR97 (sole integration owner).
Plan read in full: plans/round-97.md (Claim C1, Declared limits 1-7,
Controls, Counting command). Driver shape taken from
scripts/client-oopif-uploadfile-round97.mjs (parent http://127.0.0.1:<http>/
parent.html with #pp + iframe; child http://localhost:<child>/child.html
with #s and [type,isTrusted] listeners). My own ad-hoc script, not the
pinned driver: .ufo/waves/round-97/w1/R97Exec3-probe.mjs.
Raw 15-leg output: .ufo/waves/round-97/w1/R97Exec3-out.json
(sha256 8fce3d5951609b14f5836abd23fa69771c51a43d1b11195e099597c36a942c32).

## Setup (exact commands and exit codes)
- Deps: `mkdir -p /fast/scratch/hyaku/tabi-r97/R97Exec3/deps && cd .../deps
  && npm init -y >/dev/null 2>&1 && npm install --no-audit --no-fund
  puppeteer-core@25.16.0 playwright-core@1.65.0` -> exit 0; installed
  versions 25.16.0 / 1.65.0 (npm registry, channel npm; pacman paused per
  seat contract, nothing installed host-wide, no sudo, no ~/.local/bin writes).
- Host check: `/usr/bin/chromium --version` -> `Chromium 155.0.8059.84
  Arch Linux`, exit 0. Ports 32731/32732/32733 verified empty before and
  after (pgrep remote-debugging-port=32733 empty at every stage).
- Probe run (two runs; first superseded by B-arm fix, second is the cited
  R97Exec3-out.json): `cd /fast/scratch/hyaku/tabi-r97/R97Exec3 &&
  TMPDIR=/fast/scratch/hyaku/tabi-r97/R97Exec3 timeout 600 node
  .../w1/R97Exec3-probe.mjs --deps .../deps --scratch .../scratch --out
  .../w1/R97Exec3-out.json` -> exit 0, 15 legs, 27 s, no chromium left.
  Cross-site child (localhost) in every leg, 3 reps per arm, fresh browser
  per leg (Playwright launch for A, Puppeteer launch for C, raw-spawn
  chromium + CDP attach for B/D/E), each in its own profile dir.

## Findings (observations OUTSIDE the frozen claim)

(a) Limit 2 — Playwright `chromium.launch({executablePath:
'/usr/bin/chromium'})` + setInputFiles(answer): 3/3 resolved,
#s = [[tabi-r97-answer.txt,22]], events [[input,trusted],[change,trusted]],
parent #pp empty, browser version 155.0.8059.84. Lead: with launch the
events are TRUSTED, unlike default connectOverCDP (PLX untrusted) — the
trusted/untrusted split tracks the transport (collocated launch behaves
like isLocal:true), not launch-vs-attach per se. The frozen claim states
nothing about launch, so this does not contradict any sentence C1 makes;
it is the mechanism note (limit 6) with a measured instance.

(b) Limit 5 — Playwright connectOverCDP(url,{isLocal:true}) +
setInputFiles(absent path): 3/3 error, name Error, message exactly
`ENOENT: no such file or directory, stat
'<scratch>/tabi-r97-missing.txt'` and #s stays [], no events, #pp empty.
Lead: identical error text to PLM (default connectOverCDP missing). This
is consistent with — not contradicting — PLM's stated message; the claim
does not state isLocal-missing behaviour (explicitly unmeasured in limit
5), so no contradiction.

(c) Limit 2 — Puppeteer `puppeteer.launch({executablePath:
'/usr/bin/chromium', headless:true, userDataDir:<scratch>})` +
uploadFile(answer): 3/3 resolved, #s = [[tabi-r97-answer.txt,22]],
events [[input,trusted],[change,trusted]], #pp empty, version
Chrome/155.0.8059.84. Lead: byte-identical leg outcome to PUX (connect
mode) — launch does not change Puppeteer (no collocation concept there).
Again outside the claim (limit 2 leaves launch unmeasured); no
contradiction of any PUX sentence.

(d) Limit 4 — phantom File read after PUM-style uploadFile(missing):
3/3 resolved, #s = [[tabi-r97-missing.txt,0]], events trusted/trusted,
but in-page `f.text()` AND `FileReader.readAsText` both reject with
`A requested file or directory could not be found at the time an
operation was processed.` while f.name/size/type (text/plain)/lastModified
read fine. Lead: the phantom is a dangling reference, not a zero-byte
snapshot — any form submission or read would fail at read time, not send
an empty file. Limit 4 says contents/FileReader are unmeasured; this
measures them and finds a specific failure value. The claim states the
phantom only as name+size 0, so this does not contradict it.

(e) Limit 5 — Playwright payload object {name:'p.txt', mimeType:
'text/plain', buffer:<answer bytes>} over default connectOverCDP: 3/3
resolved, #s = [[p.txt,22]] (type text/plain), events
[[input,untrusted],[change,untrusted]], #pp empty. Lead: payload objects
go through the same script-injection path as default-CDP file paths, so
trust is untrusted exactly like PLX — buffer identity does not change
trust. Limit 5 leaves payload objects unmeasured; no contradiction.

## Coverage / adjacency note
No leg above re-tests a frozen leg. All five arms are outside the
predicate's leg set by construction (limits 2/4/5 name each as
unmeasured). Consistency checks against the claim's neighbours: (c)
matches PUX exactly, (b) matches PLM's error text exactly, (e) matches
PLX's trust pattern, and (d) confirms PUM's name/size/trust while adding
the read-failure detail the claim does not state.

## Risks and blockers
None open. All 15 legs completed deterministically (3/3 per arm);
scratch at /fast/scratch/hyaku/tabi-r97/R97Exec3 to be rm -rf'd before
yield. Chromium processes: none left on ports 32731/32732/32733.

VERDICT C1: neutral
