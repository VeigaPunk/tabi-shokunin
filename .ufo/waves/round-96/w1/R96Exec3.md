# R96Exec3 — limit probes 2 & 4 (launch mode, longer wait, uploadFile)

Seat `R96Exec3`, wave `w1`, round 96. Probes declared-limits 2 and 4 of
`plans/round-96.md` only; no lane files touched; script
`.ufo/waves/round-96/w1/R96Exec3-probe.mjs`, raw output
`.ufo/waves/round-96/w1/R96Exec3-out.json` (12 cross-site legs, 3 reps each).

Tooling: `npm install puppeteer-core@25.16.0 playwright-core@1.65.0` into
`/fast/scratch/hyaku/tabi-r96/R96Exec3/deps` (npm registry channel; versions
verified via package.json). Chromium 155.0.8059.84 `/usr/bin/chromium`,
Node v24.21.0. Ports 32631/32632/32633 only; scratch under
`/fast/scratch/hyaku/tabi-r96/R96Exec3`. No pacman/sudo (host guard in
assignment supersedes operator directive for this seat).

## Setup

```
mkdir -p /fast/scratch/hyaku/tabi-r96/R96Exec3/deps
cd /fast/scratch/hyaku/tabi-r96/R96Exec3/deps && npm init -y
npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0
```
exit 0; `pp 25.16.0 pw 1.65.0`.

## Run

```
cd /fast/scratch/hyaku/tabi-r96/R96Exec3 && TMPDIR=/fast/scratch/hyaku/tabi-r96/R96Exec3 \
  node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-96/w1/R96Exec3-probe.mjs \
  /fast/scratch/hyaku/tabi-r96/R96Exec3/out.json
```
exit 0, `{"out":...,"legs":12}`, 74.92s. Cleanup check:
`pgrep -f "remote-debugging-port=32633"` empty.

## Results (all cross-site: child `localhost`, parent `127.0.0.1`, browser
`Chrome/155.0.8059.84`; 3/3 reps unanimous per mode)

- **(a)** `puppeteer.launch({executablePath:'/usr/bin/chromium',headless:true})`
  + `waitForFileChooser({timeout:3000})`: **3/3 `timeout`**,
  `TimeoutError: Waiting for 'FileChooser' failed: 3000ms exceeded`,
  `childFiles: []`, one trusted click on `#s`, `parentFiles: []`.
  Launch mode does **not** rescue Puppeteer.
- **(b)** `puppeteer.connect` + `waitForFileChooser({timeout:15000})`:
  **3/3 `timeout`**, message `...15000ms exceeded`, `childFiles: []`,
  one trusted click. The failure is not a 3s race; no chooser ever reaches
  the primary session even with 15s.
- **(c)** `puppeteer.connect` + `(await frame.$('#s')).uploadFile(answer)`:
  **3/3 `uploaded`**, `childFiles: [["tabi-r96-answer.txt",22]]`,
  `parentFiles: []`, no click (no chooser involved, as documented S213).
  Puppeteer's workaround exists across the OOPIF boundary.
- **(d)** `playwright chromium.launch({executablePath:'/usr/bin/chromium'})`
  + `waitForEvent('filechooser',{timeout:3000})`: **3/3 `chooser`**,
  `chooserMultiple: false`, `chooserElementId: "s"`,
  `childFiles: [["tabi-r96-answer.txt",22]]`, one trusted click.
  Launch mode preserves Playwright's cross-site success.

## Contradiction with frozen C1?

None. Every observation sits **inside** the declared exclusions the frozen
sentence disclaims: limit 2 ("`puppeteer.launch` / `chromium.launch` are
unmeasured") covers (a)/(d); limit 4 ("a longer wait … `ElementHandle.
uploadFile` … are not measured") covers (b)/(c). The frozen predicate pins
`timeoutMs 3000` and `connect`/`connectOverCDP`, so launch-mode and 15s
behaviour cannot falsify it. The instrument's narrower property (connect
mode, 3s) is the property the sentence states — no wording gap.

## Next round (not claimed here)

Round 97 could claim from (a)+(b): "Puppeteer `waitForFileChooser` fails
for cross-site OOPIF choosers in both connect **and** launch mode, at 3s
and 15s" (closes limit 2/4 apiece); from (d): the symmetric Playwright
launch claim; from (c): a positive capability — "`ElementHandle.uploadFile`
fills a cross-site OOPIF `#s` with the exact answer" — which is the
documented Puppeteer remedy and the natural mitigation half of the story.

VERDICT C1: neutral
