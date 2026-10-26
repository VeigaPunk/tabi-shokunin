# RerunLiveV2 — C2 live-leg re-run at 042d6d9 (round-33 w2, falsify)

## Verdict

**Holds for the re-run; two live-leg defects found (one low, one medium-low).** The integrated v2 gate
(`scripts/check-bidi-runtime.mjs`, sha256 `62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75`, identical to the lane blob at
`042d6d9abf97d567d495652a85eabc851b81adc1`) run `--live --json` on the honest entry from a clean clone produced, twice and in fact six
independent times, the same verdict: **exit 0, population 17, admitted 16, failing 0, unmeasured 1, distinct 16, binding null,
clean true**, in 0.95 s (A1 952 ms, A2 950 ms), with empty stderr, no leftover temp dirs, and no browser process of mine surviving.
All six successful runs emitted a byte-identical JSON payload except the `provenance` array (sha256 `1e49aa11d4baeec0be0fd030e6dc891a3231fede2e5af0c51841b85331dd84e4`,
5025 B), and the live session was a real sandboxed render: my process sampler caught `/usr/lib/chromium/chromium` with
`--user-data-dir=<scratch>/…/profile`, `--no-sandbox` **0**, `--load-extension` **0**, `TouchpadOverscrollHistoryNavigation` **0**,
`--disable-features=Vulkan` **0**, `--ozone-platform=wayland` **0**, `/usr/bin/chromium` **0** (the binding `null` also requires the
live run's first 640×480 screenshot and `chromedriverVersion` to equal the committed round-32 transcript's). The two defects are both in
the live leg's *directory handling*, not in the frozen C2 predicate (which is offline by construction): **(D-A, low)** the refusal at
`scripts/check-bidi-runtime.mjs:593` tells the caller to "set a TMPDIR of at most 40 bytes" while the guard at `:591` requires
≤ 38 bytes — TMPDIR of 39 and 40 bytes exit 2 with that very message, 38 exits 0; **(D-B, medium-low)** the `mkdtempSync` inside
`XDG_RUNTIME_DIR` at `:592` is unguarded, so a short-but-unusable runtime dir (absent / regular file / mode 500) throws a non-`Refusal`,
which `:814` converts into `liveError` and `:852` turns into 16 `l1-live` row findings: the gate exits **1 "failed"** with **empty stderr**
instead of 2 "could-not-evaluate", and leaks the `tabi-bidi-live-*` scratch dir created at `:582` (reproduced four times; receipt
`F4-absent-xdg.json` + `leak-after.txt`).

## 1. Setup (clean clone, lane read-only)

```
S=/fast/scratch/hyaku/tabi-r33/RerunLiveV2 ; OUT=<lane>/.ufo/waves/round-33/w2/RerunLiveV2
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"            # exit 0
git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1          # exit 0
git -C "$S/clone" rev-parse --show-toplevel      -> /fast/scratch/hyaku/tabi-r33/RerunLiveV2/clone
git -C "$S/clone" rev-parse HEAD                 -> 042d6d9abf97d567d495652a85eabc851b81adc1
git -C "$S/clone" status --porcelain | wc -l     -> 0
sha256sum "$S/clone/scripts/check-bidi-runtime.mjs" -> 62453b55…f8deac75  (== lane blob at 042d6d9)
```

Host: chromium/chromedriver `154.0.8037.97` (`/usr/lib/chromium/chromium`, `/usr/bin/chromedriver`), node v24.21.0. The lane checkout
was only read (`git status --porcelain` in the lane shows the L1's w2 dispatch files, no seat edit); no browser run touched the lane.

Every invocation was the same command, varying only `TMPDIR` / `XDG_RUNTIME_DIR`:

```
node scripts/check-bidi-runtime.mjs \
  --rev 042d6d9abf97d567d495652a85eabc851b81adc1 \
  --baseline d805d1d6132430118b206a848b85753ab35d1014 \
  --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
```

(`--baseline d805d1d6…` is the revision `measure.sh` uses for this gate; the default receipt
`corpus/evidence/round-32/bidi/receipt.json` was used throughout.)

## 2. The two required honest runs (TMPDIR ≤ 40 B, XDG_RUNTIME_DIR unset)

| run | TMPDIR (len) | exit | elapsed | population | admitted | failing | unmeasured | distinct | binding | clean |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 | `/run/user/1000/t33a1.EZk8h1cUxW` (31) | 0 | 952 ms | 17 | 16 | 0 | 1 | 16 | null | true |
| A2 | `/run/user/1000/t33a2.1z54SHh07J` (31) | 0 | 950 ms | 17 | 16 | 0 | 1 | 16 | null | true |

Both: `entryFinding null`, `fixtureSha256 343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`, stderr 0 B, TMPDIR empty
afterwards (`ls -A` → nothing, `rmdir` succeeded), `pgrep` shows no chromedriver/chromium of mine. The single unmeasured row is **R16**
(`line 82`, verdict `no`, `reason null` — counted in the population, never admitted, by design). `binding null` means the
first-screenshot/chromedriverVersion binding holds for the committed runs **and** against this counter's own live session.
Provenance of the committed runs (both `32`-hex session ids, one `32`-upper-hex context each):
`run1 10abbb479bdcc37a405098c5ea778bf0`, `run2 6b30c7033f4821af5f94d9e75e85b234`.

`A1.json` and `A2.json` are byte-identical, and so are B, B2, B3, B4 and D2 after removing `provenance` — the gate is deterministic on
this host across six launches.

## 3. 100-byte TMPDIR: XDG_RUNTIME_DIR set vs unset

| run | TMPDIR len | XDG_RUNTIME_DIR | exit | elapsed | result |
|---|---|---|---|---|---|
| B | 99 | `/run/user/1000` (14) | 0 | 937 ms | clean true, 17/16/0/1/16, binding null |
| B2 | 100 | `/run/user/1000` | 0 | 1249 ms | clean true, same counters |
| B3 | 100 | `/run/user/1000` | 0 | n/m | clean true, same counters |
| B4 | 100 | `/run/user/1000` | 0 | 946 ms | clean true, same counters |
| C | 100 | **unset** | **2** | 225 ms | `BIDI_RUNTIME verdict=could-not-evaluate detail=no short directory for chromium's singleton socket (TMPDIR 100 bytes, XDG_RUNTIME_DIR unset); set a TMPDIR of at most 40 bytes`; stdout empty; TMPDIR left empty (the refusal branch removes its scratch) |
| E | 100 | `/fast/…/xdglong/ii…` (89) | **2** | 146 ms | same refusal, `XDG_RUNTIME_DIR 89` (the runtime dir must itself be ≤ 40 B); no leftovers in either dir |

With XDG_RUNTIME_DIR set, the 100-byte TMPDIR takes the fallback: B4's sampler observed the throwaway dir `/run/user/1000/tabi-bidi-EYqUrG`
(30 B) existing during the run and **gone** afterwards (`runtime_after=[]`), and the 100-byte TMPDIR was empty. With
XDG_RUNTIME_DIR unset the gate refuses exit 2 (declared could-not-evaluate) and leaves nothing behind. That is exactly the documented
behaviour; the only wrinkle is the 40-byte figure in the message (D-A).

## 4. Defect D-A (low): the refusal message names a TMPDIR limit the guard rejects

`scripts/check-bidi-runtime.mjs:591-593`:

```
591:  if (scratch.length <= 60) chromeTmp = scratch;
592:  else if (runtime && runtime.length <= 40) { chromeTmp = mkdtempSync(join(runtime, "tabi-bidi-")); ownChromeTmp = true; }
593:  else { rmSync(scratch, …); throw new Refusal(`… ; set a TMPDIR of at most 40 bytes`); }
```

`scratch` is `mkdtempSync(join(tmpdir(), "tabi-bidi-live-"))`, i.e. `TMPDIR` + 22 bytes (`/` + 15-char prefix + 6 random), so the
guard's `≤ 60` admits **TMPDIR ≤ 38**, not 40. Measured (XDG_RUNTIME_DIR unset each time):

```
TMPDIR len 38 (/run/user/1000/ffff…, 23×f)  -> exit 0, clean true (D2, 1181 ms)
TMPDIR len 39 (/run/user/1000/gggg…, 24×g)  -> exit 2, "…set a TMPDIR of at most 40 bytes" (D3, 195 ms)
TMPDIR len 40 (/run/user/1000/eeee…, 25×e)  -> exit 2, identical message                (D1, 188 ms)
```

So a caller who follows the message verbatim (40, or 39) is refused, and is told again to use 40. The guard is also stricter than the
host needs: a raw chromedriver session (`probe_socket.mjs`, real binary `/usr/lib/chromium/chromium`, no `--no-sandbox`,
UTC 2026-10-26T18:5x) created a session at `browserVersion 154.0.8037.97` for TMPDIR lengths **38, 39, 40, 41 and 42** — the failing
constraint is the gate's own `≤ 60` scratch cap, not chromium. Severity **low**: the refusal is fail-closed, the exit code is the
declared 2, and the only damage is a wrong remedy that already propagated into this wave's seat briefing ("TMPDIR <= 40 bytes") and would
propagate into operator docs. Fix is one of: message → "38 bytes", or `scratch.length <= 62` (per the probe) with the message kept.

## 5. Defect D-B (medium-low): an unusable XDG_RUNTIME_DIR is scored as 16 capability failures, and leaks the scratch dir

`mkdtempSync(join(runtime, "tabi-bidi-"))` at `:592` has no guard, and it runs **before** the `try { … } finally { … rmSync(scratch) }`
block that starts after the driver spawn, so a throw there skips the scratch removal (the `else` at `:593` is the only refusal branch that
cleans up). The throw is not a `Refusal`, so `evaluate`'s `catch` at `:814`
(`catch (e) { if (e instanceof Refusal) throw e; liveError = String(e && e.message || e); }`) swallows it, and `:852`
(`live session failed: ${liveError}`) attaches it to **every** `yes` row as `l1-live`. Measured with a 100-byte TMPDIR:

| run | XDG_RUNTIME_DIR | exit | admitted | failing | stderr | scratch left in TMPDIR |
|---|---|---|---|---|---|---|
| F1 | `/run/user/1000/nx` (absent) | 1 | 0 | 16 | 0 B | `tabi-bidi-live-XwuR2T` |
| F2 | `/run/user/1000/nxfile` (regular file) | 1 | 0 | 16 | 0 B | `tabi-bidi-live-oZEZOR` |
| F3 | `/run/user/1000/nxro` (mode 500) | 1 | 0 | 16 | 0 B | leaked (same path) |
| F4 | `/run/user/1000/absentdir` | 1 | 0 | 16 | 0 B | `tabi-bidi-live-4uxiCp` (`leak-before.txt` empty → `leak-after.txt` lists it) |

Row detail strings: `live session failed: ENOENT: no such file or directory, mkdtemp '/run/user/1000/nx/tabi-bidi-XXXXXX'`,
`ENOTDIR: not a directory …`, `EACCES: permission denied …`. Two harms, both invisible to a reader of the exit code alone: (i) a host
misconfiguration is reported as a 16-row capability failure (exit 1 = "failed") instead of exit 2 = "could-not-evaluate", so a verifier
sees the population fail for a reason that is not the population's; (ii) the gate leaves the directory it created at `:582` behind, which
contradicts its header claim that it "removes only the dirs it created". Severity **medium-low** — `--live` is outside the frozen C2
predicate (`claims.json` C2 `killRule`: "The --live leg is not part of this predicate"), so no claim is mis-scored by it; the cost is a
misleading verdict class and temp-dir litter on misconfigured hosts. The natural fix is `try { mkdtempSync } catch { rmSync(scratch); throw new Refusal(...) }`,
which would also make the message in D-A correct-by-construction.

## 6. Limits and hygiene

- `--live` is no-harm evidence only; the frozen C2 predicate is the offline battery. My runs do not re-score C1/C2; I did not run the
  frozen counters (other w2 seats hold those attacks).
- The raw argv sampler for run B also captured peer seats' concurrent live runs (`--user-data-dir=/fast/scratch/hyaku/tabi-r33/CritForgeV2A/…`);
  I kept only lines carrying my own TMPDIRs (`B-my-chromium-argv.txt`, 65 unique lines) and no conclusion rests on peer lines.
- D-A's 40-vs-38 finding is about the gate's message and its `≤ 60` cap; I did not try to prove chromium would work at exactly the gate's
  geometry (61-byte `chromeTmp` with a 69-byte profile) — the direct probe used `--user-data-dir=<TMPDIR>/profile`, which is shallower.
  [INFERENCE: the gate's cap can be relaxed to 62; the observable defect is the contradiction, not the cap value.]
- The `--selftest` leg, `--offline` leg and every other gate were out of scope for this seat (parent owns the wave gate).
- Tooling: nothing installed or upgraded; host chromium/chromedriver/node already present. No pacman transaction was run. No network
  fetch was made by this seat (all reads were local git blobs).
- Cleanup: `$HYAKU_SCRATCH/tabi-r33/RerunLiveV2` deleted after the receipts were copied; the short TMPDIRs under `/run/user/1000` and the
  100-byte TMPDIRs were removed; `/run/user/1000/tabi-bidi-*` and `.org.chromium*` are absent; `pgrep -fa 'chromedriver|chromium'` →
  one line, `/usr/bin/earlyoom … --prefer …chromium…` (not a browser of mine), 0 processes with `tabi-bidi-live-` in their argv.

## 7. Deliverables

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/RerunLiveV2/`:

| file | sha256 | contents |
|---|---|---|
| `A1.json` / `A2.json` | `1e49aa11…31dd84e4` (both) | the two required honest `--live --json` runs (identical) |
| `A1.stderr` / `A2.stderr` | empty (`e3b0c442…`) | no stderr |
| `B.json`, `B2.json`, `B3.json`, `B4.json` | `1e49aa11…` | 100-byte TMPDIR with XDG_RUNTIME_DIR set (identical payload) |
| `B4-runtime-dir-sampler.txt` | `761b509f…f0047d6a` | fallback dir `/run/user/1000/tabi-bidi-EYqUrG` seen during the run, gone after |
| `B-my-chromium-argv.txt` | `76519e57…a4ce4da3` | 65 unique argv lines of my runs + forbidden-flag counts all 0 |
| `C.json`/`.stderr` | empty / `19842b89…` | 100-byte TMPDIR, XDG unset: refusal exit 2 |
| `D1`/`D2`/`D3` `.json`/`.stderr` | `bd4156d8…` / `1e49aa11…` / `9b6a2a8c…` | TMPDIR 40 → exit 2, 38 → exit 0 clean, 39 → exit 2 (D-A) |
| `E.json`/`.stderr` | empty / `474eea45…` | 100-byte TMPDIR with an 89-byte XDG_RUNTIME_DIR: refusal exit 2 |
| `F4-absent-xdg.json`/`.stderr` | `4f33d675…` / empty | D-B: exit 1, admitted 0, failing 16, `l1-live` ENOENT |
| `F1.json`, `F2.json`, `F3.json` | `fae2a60a…`, `624f276d…`, `368bcfd5…` | D-B errno variants: ENOENT, ENOTDIR, EACCES |
| `leak-before.txt` / `leak-after.txt` | empty / `d680e862…` | TMPDIR empty before, `tabi-bidi-live-4uxiCp` left after |
| `probe_socket.mjs` | `8844871a…` | chromedriver session at TMPDIR 38-42 (all succeed, 154.0.8037.97) |
| `pgrep-final.txt` | `a5fecb4f…` | final process check (only earlyoom; no browser of mine) |
| `RerunLiveV2.md` | this report | — |
