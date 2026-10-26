# ScribeSrcGeckodriver — C2 sources (S134-S137) — round 35, wave w1

**Verdict.** The geckodriver/Firefox source rows are opened, receipts taken and structurally validated, so C2's
claim has a registry footing instead of folklore: two Mozilla docs pages (`Flags.html` — the page that states the
BiDi WebSocket port "Defaults to 9222", which is the operator's leased CDP port in this fleet — and
`Capabilities.html`) plus the two tag-pinned source files the item's escape hatch required, because
`Capabilities.html` documents neither `webSocketUrl` nor `moz:geckodriverVersion` (byte sweeps 0 and 0). Four
rows are drafted, not three: `S134`, `S135` and then `S136` (`capabilities.rs:510-523`, the `webSocketUrl` read
that flips `use_websocket`) and `S137` (`marionette.rs:767`, the `moz:geckodriverVersion` insert) — the last two
sit outside the item's literal `S134-S135` range and are flagged for L1's disposition rather than slipped in.
`corpus/SOURCES.md` was appended only inside the scratch clone; `sources-census.sh validate` returns **exit 1**
with exactly **4 × E11** (all four rows, all the same path: `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`,
the C2 deliverable that does not exist yet) and **20 × W04** (pre-existing, `S058`-`S123`, none on this batch);
with that path temporarily present inside the clone the same validation returns **exit 0 with no E-codes**, so the
rows are structure-clean and the single open item is the knowledge entry another wave owes.

## Evidence (commands, exit codes, byte-level locations)

### Clone and pin

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
$ git -C "$S/clone" rev-parse --show-toplevel   → /fast/scratch/hyaku/tabi-r35/ScribeSrcGeckodriver/clone
$ git -C "$S/clone" rev-parse HEAD              → a4bfef0f75027c915e715649950b1d46dcb33d83      (exit 0)
```

### Fetches — every one recorded (URL, UTC start/end, status, bytes, sha256)

| URL | UTC | status | bytes | sha256 (full) |
|---|---|---|---|---|
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | 2026-10-26T21:12:29Z | 200 | 41404 | `2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc` |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26T21:12:29Z | 200 | 31324 | `e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842` |
| https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/capabilities.rs | 2026-10-26T21:12:29Z-21:12:30Z | 200 | 54316 | `d3e65953dca6b6e1653326fbeae49d4c6cd1abfba8df47de9f9d9ca2ac870359` |
| https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs | 2026-10-26T21:13:19Z | 200 | 66012 | `757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3` |
| https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/Cargo.toml | 2026-10-26T21:14:56Z | 200 | 1656 | `7d44e4c4c402b042120071bbd870d1adb284cbab5c548bc53065b7d1a21b8543` |
| https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/build.rs | 2026-10-26T21:14:56Z | 200 | 1184 | `69379ffa7946fbd01f116f83182ff8341504d86eae2e1dcc7d1dccf9ee028c25` |

`Cargo.toml` and `build.rs` were fetched twice; both re-fetches are byte-identical to the first (same sha256), and
the later fetch is the one timestamped in `fetches/fetch-receipt.tsv`. Raw receipt: `fetches/fetch-receipt.tsv`.

Not a fetch: `https://hg.mozilla.org/mozilla-central/raw-file/v0.37.1/testing/geckodriver/src/capabilities.rs`
answered **HTTP 302, 0 bytes** (`curl -o /dev/null -w '%{http_code} %{size_download}'` → `302 0`), so the
mozilla-central path was not opened and is not a row. The three other candidate paths (`file/v0.37.1/…` on
hg.mozilla.org, `marionette.rs`, `browser.rs` there) were not pursued once the `mozilla/geckodriver` mirror at
tag `v0.37.1` answered 200 with `Cargo.toml:4 version = "0.37.1"`.

### Located quotes (greps pasted in `gate.md`)

```
$ grep -n -F 'Port to use to connect to WebDriver BiDi' Flags.html
496:<p>Port to use to connect to WebDriver BiDi. Defaults to 9222.</p>
$ grep -n -F 'Path to the directory to use when creating temporary profiles' Flags.html
480:<p>Path to the directory to use when creating temporary profiles. By
$ grep -n -F 'documented on MDN' Capabilities.html
293:Most of these <a class="reference external" href="…/Capabilities/firefoxOptions">are documented on MDN</a>.</p>
$ grep -n -F 'moz:geckodriverVersion' marionette-0.37.1.rs
767:                capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());
$ sed -n '510,523p' capabilities-0.37.1.rs   → has_web_socket_url = matched.get("webSocketUrl")… ; if … { rv.use_websocket = true; }
$ grep -n 'impl From<BuildInfo>\|BuildInfo::version()' build-0.37.1.rs
40:        Value::String(BuildInfo::version().to_string())
```

### Pin corroboration

```
$ /home/vgpnk/.local/bin/geckodriver --version
geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)          (exit 0)
```

### Registry validation (clone only)

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/clone/corpus/SOURCES.md"
exit=1   → 4 × E11 (S134-S137 → corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md), 20 × W04 (S058-S123, pre-existing)
$ (placeholder created at that path inside the clone, then removed)
$ … validate --file … → exit=0, 0 × E-codes, last line `file	ok	…/corpus/SOURCES.md`
$ grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md → 137      (133 at the freeze)
$ awk … NF!=13 → 0 ; duplicate ids → no output
```

Duplicate-URL pre-check against the frozen lane registry: `grep -c -F` on each host/path prefix → 0 for all six
prefixes (`firefox-source-docs…Flags.html`, `…Capabilities.html`, `raw.githubusercontent.com/mozilla/geckodriver`,
`github.com/mozilla/geckodriver`, `mozilla-central`, `geckodriver/src`), so none of these is a re-registration.

## Findings the lane should carry (not row content)

1. **The documented BiDi port default collides with the fleet's lease.** `Flags.html:496` — "Port to use to
   connect to WebDriver BiDi. Defaults to 9222." — and `127.0.0.1:9222` is the operator's musketeer CDP lease
   port that the seat contract forbids binding or probing. `Flags.html:497-498` documents the supported way out
   ("bind to 0 to get the system to atomically assign a free port"), and the same trick exists for `--port`
   (474-476). A C2 driver that omits `--websocket-port` and then reads the default is not merely impolite, it is
   wrong by the lane's own contract.
2. **`moz:geckodriverVersion` carries the version string only.** `marionette.rs:767` inserts
   `build::build_info()` into the New Session capabilities, and `build.rs:38-41`
   (`impl From<BuildInfo> for Value`) yields `BuildInfo::version()` — so the capability is `"0.37.1"`, not the
   banner's `0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`. A receipt that wants the commit hash must read it
   from the binary banner, never from the session capabilities. This is a concrete trap for the C2 entry
   (`webdriver-bidi-firefox-runtime-round-35.md`) when it records build identity.
3. **`Capabilities.html` cannot ground the BiDi opt-in.** The page's own headings are exactly
   `moz:debuggerAddress` and `moz:webdriverClick` (`grep -c '<h2>'` → 2); `webSocketUrl` and
   `moz:geckodriverVersion` occur zero times in its bytes. It explicitly defers ("Most of these are documented
   on MDN", line 293) to an MDN `firefoxOptions` page **this seat did not open** — so that MDN URL is not a
   source here and no row claims it.
4. **`--profile-root` is a write-permission fact, not an isolation guarantee** (`Flags.html:481-482`: "Both
   geckodriver and Firefox must have read-write access to this path"). Pointing it at a read-only scratch yields
   a launch failure, not a silent fallback.
5. **Scope ceiling on the code rows.** `mozilla/geckodriver` is a tag mirror; the installed driver's own banner
   names `testing/geckodriver` in `hg.mozilla.org/mozilla-central` as canonical. The rows claim what 0.37.1 does
   and nothing about 0.38+, hence `recheck: on-release` on both code rows and `90d` on the two living doc pages.

## Touched surfaces

- Written: this report; `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/` (`rows.md`, `gate.md`,
  `census-check.txt`, `census-validate-{1,2,final}.txt`, `fetches/` = 6 fetched files + `fetch-receipt.tsv`);
  scratch `/fast/scratch/hyaku/tabi-r35/ScribeSrcGeckodriver/` (deleted at the end of this seat).
- Not written: any lane tracked file (`corpus/SOURCES.md` edits exist **only** in the scratch clone), the lane
  git index or jj state, the fleet repo, sibling lanes, `/home/vgpnk/Projects/shokuknow`, `~/.local/bin`.
  No commit was made anywhere; no `git add` ran.

## Out of scope / not done (deliberately)

- No browser or driver launched; no port bound or probed — C2's live session belongs to `Exec*` seats.
- The knowledge entry `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` and the driver
  `scripts/bidi-firefox-loopback-round35.mjs` were not authored here; that is why E11 is open.
- No tool was installed or upgraded this round (nothing needed: `curl`, `sha256sum`, `gawk`, `bash` were
  sufficient; geckodriver 0.37.1 was already in place from the C2 install).
- No `## Gate` section was written into `corpus/lessons/round-35.md` — `gate.md` is the ready-to-paste block, so
  L1 owns the lesson file as the contract requires.

## Deliverable paths (all under `/home/vgpnk/Projects/shokunin/tabi-shokunin/`)

- `.ufo/waves/round-35/w1/ScribeSrcGeckodriver.md` — this report
- `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/rows.md` — the four registry rows, insertion point, L1 notes
- `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/gate.md` — `## Gate` table rows + every grep and receipt
- `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/census-check.txt` — duplicate sweep, validate runs, manual census
- `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/census-validate-1.txt`, `census-validate-2.txt`, `census-validate-final.txt`
- `.ufo/waves/round-35/w1/ScribeSrcGeckodriver/fetches/` — `Flags.html`, `Capabilities.html`,
  `capabilities-0.37.1.rs`, `marionette-0.37.1.rs`, `Cargo.toml`, `build-0.37.1.rs`, `fetch-receipt.tsv`
