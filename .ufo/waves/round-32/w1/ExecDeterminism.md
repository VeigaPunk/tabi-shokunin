# ExecDeterminism — C1 assumption probe: is the t3 binding byte-deterministic?

Seat: ExecDeterminism (leaf, wave w1, milestone C1). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Clone at
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`, counter bytes
`sha256(scripts/check-bidi-runtime.mjs) = 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`
(= `claims.json:frozenDigests`, verified in the clone before the first run).

## Verdict

**The t3 binding lands on a false binary: it is byte-deterministic inside one
environment triple and not across triples.** 6/6 cold `liveRecord` sessions on this host build
(chromium/chromedriver 154.0.8037.97, `--headless=new`, `setViewport 640x480` DPR 1, `LANG=en_US.UTF-8`)
produced the same first-screenshot sha256 `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`
(6626 bytes, 640x480, a real render: 317 distinct colours, 1232 near-black text pixels). The binding is
**insensitive** to headless mode spelling (`--headless` is an alias on 154), to `--user-data-dir` path
length, to the TMPDIR the browser is launched under, and to concurrent load (4 sessions in parallel at
load ≈ 12–14, all identical). It is **sensitive** to two things an independent receipt-driver can
easily vary: `--force-device-scale-factor=2` (3/3 runs `cf70457a…`, 6671 B, 2332 pixels = 0.76 % differ)
and the ambient locale (3/3 runs under `LANG=ja_JP.UTF-8` give `30b254cb…`, 7284 B, 6010 pixels = 1.96 %
differ), and to how the viewport is pinned (`--window-size=640,480` instead of BiDi `setViewport` gives
640×337 and `6e2b0729…`). In those cases every one of the 16 admittable rows fails with `t3-binding`
→ **t3 false-reds and C1 reads 0/16, not because the runs are synthetic but because the driver's
environment differed**. Conversely t3 **false-greens** against a transcript that no browser produced:
the frozen counter's own `evaluate()` with `--live` admitted 2/2 rows, `binding: null`, for a
two-run synthetic transcript (`goldenLines`) whose only real content was the authentic screenshot bytes
and the authentic `chromedriverVersion` string — both obtainable in one 10-second `liveRecord()` call.
So t3 binds the receipt to **this host build**, not to an executed browser; its anti-forgery strength
rests on the driver blob's reviewability, not on the screenshot comparison. None of this contradicts
C1's target (14 of 16), but the receipt driver MUST reproduce the counter's argv and locale, and the
entry/lesson MUST NOT claim that t3 proves a browser ran.

## Method

Probe harness `probe.mjs` (in this directory) imports `liveRecord` from a counter module, runs one
session, and reports the exact quantity t3 compares — `sha256(base64decode(first captureScreenshot.data))`
— plus `browserVersion`, `chromedriverVersion`, PNG byte length and IHDR dimensions. Variants are byte
copies of the frozen counter with one line changed (full diffs in `v-*.diff`); the untouched counter is
used for every run that is not a variant. Each probe invocation is its own node process, and each
`liveRecord()` call starts a fresh chromedriver and a fresh chromium with a throwaway profile → every
run is a cold session, 31 recorded probe sessions in total (plus 2 extra PNG captures and 3 live legs
inside the forgery probe).

```
S=/fast/scratch/hyaku/tabi-r32/ExecDeterminism
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"            # exit 0
git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6     # exit 0
sha256sum clone/scripts/check-bidi-runtime.mjs   # 2f25af5a… (matches claims.json frozenDigests)
TMPDIR=$S/tmp node $S/probe.mjs $S/clone/scripts/check-bidi-runtime.mjs <label>     # baseline / variants
```
Every probe process exited 0 (loops above print `rc[label]=0`); stderr capture files are empty
(`v1.err`, `v2.err`, `parallel.err`, `tmpshort.err` are 0 bytes).

## Results

| Condition (one factor changed) | Runs | Distinct hashes | First-screenshot sha256 | Bytes | IHDR |
|---|---|---|---|---|---|
| baseline (frozen counter, no change) | 6 | 1 | `ee0edeba…d51eca5` | 6626 | 640×480 |
| (a) `--headless` instead of `--headless=new` | 3 | 1 | `ee0edeba…d51eca5` (same) | 6626 | 640×480 |
| (b) `--force-device-scale-factor=2` | 3 | 1 | `cf70457a…fb4093b1` (**differs**) | 6671 | 640×480 |
| (c) `--user-data-dir` longer by 73 chars | 3 | 1 | `ee0edeba…d51eca5` (same) | 6626 | 640×480 |
| (c) `--user-data-dir` shorter (base/sp/profile) | 2 | 1 | `ee0edeba…d51eca5` (same) | 6626 | 640×480 |
| (c′) probe TMPDIR short (`/tmp`), chrome TMPDIR = scratch | 2 | 1 | `ee0edeba…d51eca5` (same) | 6626 | 640×480 |
| (d) `LANG=C LC_ALL=C` | 3 | 1 | `ee0edeba…d51eca5` (same) | 6626 | 640×480 |
| (d) `LANG=ja_JP.UTF-8 LC_ALL=ja_JP.UTF-8` | 3 | 1 | `30b254cb…7f6e4a1c` (**differs**) | 7284 | 640×480 |
| (e) 4 sessions in parallel (load 12.16) | 4 | 1 | `ee0edeba…d51eca5` (same) | 6626 | 640×480 |
| extra: viewport via `--window-size=640,480`, no BiDi `setViewport` | 2 | 1 | `6e2b0729…bfed039` (**differs**) | 6039 | **640×337** |

Pixel-level cause of the two differing cases (PNG decoded, unfiltered, compared with the baseline
capture; decoder in the evidence chain): dsf2 differs on 2332/307200 px (0.76 %) inside bbox
(8,28)–(227,118); ja_JP differs on 6010/307200 px (1.96 %) inside bbox (8,28)–(248,134). Both boxes are
the heading/input/button text block, i.e. glyph rasterisation and fallback, not layout timing — no
animation, caret, scrollbar or clock pixels appear in any differ. The baseline capture itself is not
blank (317 distinct colours, 1232 px darker than 100), so determinism is not the trivial
"identical white image" case.

Host/load context: load average 10.84–14.47 during all runs (other fleet seats active), i.e. the
determinism result was obtained under real contention, not an idle box.

## Under which conditions does t3 false-red?

A false red is any condition where a genuine browser rendered FIXTURE but the receipt runs and the
counter's live leg disagree. Measured candidates, in order of risk for C1's independent-driver receipt:

1. **Locale.** The counter's live leg inherits the counter process environment; the receipt driver
   inherits its own. `ja_JP.UTF-8` vs `en_US.UTF-8` changes the bytes with 3/3 reproducibility.
   Note `ja_JP.UTF-8` is **not** a generated locale here (`locale -a` lists only `C`, `C.utf8`), yet the
   render changed — so this is fontconfig's language-driven family/hinting choice, not message
   translation. Any `LC_ALL`/`LANG`/`FONTCONFIG_FILE` difference between driver and counter is a t3 red.
2. **Device scale factor.** `--force-device-scale-factor=2` changes the bytes at unchanged 640×480.
   Likewise a driver that lets the viewport DPR float instead of `setViewport { devicePixelRatio: 1 }`.
3. **Viewport pinning method.** `--window-size=640,480` yields a 640×337 capture; a driver that pins
   the viewport that way fails t3 (and R4) deterministically.
4. **Browser build.** By design; not measured here (single host). [INFERENCE] A receipt recorded on a
   different chromium revision will not match; the claim already scopes this to one host build.

Not a false-red on this build: headless mode spelling (Chromium ≥132 made `--headless` an alias of the
new implementation, so (a) is not an independent factor), profile directory path length, TMPDIR
location, and load up to 4 concurrent sessions.

## Under which conditions does t3 false-green?

Measured, one run: `forge.mjs` builds a throwaway git repo whose receipt points at a stub driver and
two **synthetic** transcripts (`goldenLines`, the counter's own fixture generator) whose
`captureScreenshot` payload was replaced by the authentic baseline PNG and whose `chromedriverVersion`
was set to the authentic string; `evaluate(repo, …, live: true)` — i.e. the real counter predicate with
a real live session — returned:

```
population 2, admitted 2, failing 0, binding null, entryFinding null
rows: [["R2",true,null,null],["R15",true,null,null]]
```

So a transcript that never touched a browser passes t3's live comparison once it carries two values
that any seat can produce in one live run (the screenshot bytes and the driver-version string, the
latter also printed by `/usr/bin/chromedriver --version`). What t3 still rejects is a forgery that
*invents* those values — exactly the J3 control (`shotTag`-filled PNG, `"154.0.8037.97 (fixture)"`).
The bound property is therefore "the receipt contains bytes/version this host build produces", not
"a browser executed these runs". A per-run nonce cannot fix this without destroying the determinism
t3 depends on (a nonce in the fixture would change the screenshot between the receipt runs and the
live leg). The honest options are to state the limit in the entry and to keep the anti-forgery weight
on the committed driver blob, or to bind an additional, non-copyable artefact (e.g. the driver's own
source hash plus its run-time log) — that is an L1 design call, not something this seat repairs.

## Advisory notes for the L1 (no repair performed)

- Before recording the receipt with the independent driver: pin `LANG`/`LC_ALL`, pass
  `--headless=new --no-sandbox --no-first-run --disable-gpu` with no `--window-size` and no
  `--force-device-scale-factor`, use `browsingContext.setViewport {640,480}` with `devicePixelRatio: 1`,
  and capture the screenshot only after `window.__ready` settles.
- The evidence directory below contains `smoke.png`, whose bytes are exactly the authentic first
  capture. Committing it does not weaken the gate materially (the same bytes are one 10-second
  `liveRecord()` away) but it should not be presented as proof that a browser ran.
- The frozen counter's own TMPDIR guard relocates the browser's TMPDIR to `$XDG_RUNTIME_DIR`
  (`/run/user/1000/tabi-bidi-*`) whenever `mkdtemp` under the caller's TMPDIR exceeds 60 bytes — my
  scratch path did (67 bytes), so all runs used that path; the counter removes those dirs in `finally`
  and I verified none remain. This is expected frozen behaviour, not a leak.

## Evidence in this directory

| File | sha256 |
|---|---|
| `baseline.jsonl` (6 runs) | `81cb794d9af03d310433a7e5ad22744f1532762486cfd336b07358fa1de6c887` |
| `variants1.jsonl` (old-headless ×3, dsf2 ×3, longpath ×3) | `a13955ea60b7fdd29284f29dbd0edec41fd0f92685e1a4abd28e1197cfdc87b6` |
| `variants2.jsonl` (shortpath ×2, LANG=C ×3, LANG=ja ×3) | `b705f9e7ba511ab033c95c40e1b1b75ad955315e1a6ccc1877d6716095c890f7` |
| `parallel.jsonl` (4 concurrent) | `7abd90e17d05ec5f4aa6ad8fe2c699b523b93a6f4cc12f010e6eef65f2b2cf60` |
| `tmpdir-short.jsonl` (short TMPDIR ×2) | `8665a1f953ebffec9a800055fc089219a13c0a53699177256a48f8b1b3699186` |
| `winsize.jsonl` (window-size viewport ×2) | `521a5ab76cf9491491ee6222b1a86f73d83ee0eecabf8417bf8be570ce13dabf` |
| `forge.txt` (t3 false-green transcript + verdict) | `7928eb5e3ea1832417a7616d3358049aa49ede4753980e7037b2b0464bc511d2` |
| `smoke.png` (authentic baseline capture) | `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5` |
| `dsf2.png` (dsf=2 capture) | `cf70457a96aa06de5339cab68b78f26914654dc52175dbaea661cb0dfb4093b1` |
| `langja.png` (ja_JP capture) | `30b254cb4e8ed6cc4c4bf972f9f1b1538eedfafbfb48b92164c74ac57f6e4a1c` |
| `probe.mjs` | `81bfc32686002ecb5bd3e10e31e53367ef5b4b6f7946a96351fbaa98b3acc161` |
| `forge.mjs` | `880fccc9fedbfc753a08965f67740ced989483ae45b62d5c91973e7325dd10ed` |
| `v-{oldheadless,dsf2,longpath,shortpath,winsize}.diff` | one-line-each diffs against the frozen counter |

`FIXTURE_SHA256` of the frozen counter (imported, not recomputed by hand):
`343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`.

## Tooling and cleanup

No tools installed or upgraded this wave (nothing beyond `node` v24.21.0, `/usr/bin/chromium`
154.0.8037.97, `/usr/bin/chromedriver` 154.0.8037.97 already on the host). No network fetch was made:
the probe measures the loopback FIXTURE only. Every chromedriver/chromium this seat started was
terminated by `liveRecord`'s `finally`; final checks after the last run: `pgrep -fa ExecDeterminism`
→ no output (no process of mine remains), `ls -d /run/user/1000/tabi-bidi-*` → no output. The
`chromedriver`/`chromium` lines that `pgrep -fa 'chromedriver|chromium'` does print carry
`--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…` and belong to the sibling seat
`ExecInterceptPhases`; they are not mine and were left alone. Scratch
`/fast/scratch/hyaku/tabi-r32/ExecDeterminism` (clone + variant copies + probe harness) is deleted
after these receipts were copied here. No lane tracked file, index, jj state or fleet path was written.
