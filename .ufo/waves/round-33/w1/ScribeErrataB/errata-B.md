# Errata B — CritEntry's precision/provenance defects in `corpus/knowledge/webdriver-bidi-runtime-round-32.md`, re-checked at `e6b0a90`

Seat: ScribeErrataB (leaf; no dispatch). Input: `.ufo/waves/round-32/w2/CritEntry.md`, carried by
`corpus/lessons/round-32.md:179-187` ("ten precision/provenance defects in the entry, among them §8's
'four constructions' where w1 CritC1Forgery rates a fifth"). Re-checked against the frozen bytes at
`e6b0a9074d434ccc307badd312ae7379d1193fea` (clean shared clone). Nothing in the lane, the fleet repo or a
sibling repo was written.

**Counting note.** "Ten" resolves as `D4–D13`; `D3` is the separately named item and `n1` is CritEntry's nit.
All eleven of `D3–D13` plus `n1` are dispositioned below, so no CritEntry defect is dropped under either reading.

## Verdict

Nine of the items are real and unlanded at `e6b0a90` and get append-only correction text (`D3`, `D4`, `D6`,
`D7`, `D8`, `D9`, `D10`, `D11`, `D13`, plus `n1` — ten lines in total). Two are **closed-already** and need no
text: `D5` is superseded by the round-32 wave-2 correction at `:196-200` (the binding "does not prove that the
receipt's runs were executed"), and `D12` stopped being true before the freeze — `.ufo/waves/round-32/measure/`
now holds `c1-distinct-at-0808688.json` with `ok:true` and the same four counts, added in `8fa57d2` (an
ancestor of `e6b0a90`), so the entry's citation of that directory resolves to a revision-stamped green run.
Nothing is refused. Every landed line is re-derived from bytes I read at the frozen revision or from one
read-only spec fetch whose digest equals S124's recorded digest; none rests on re-running CritEntry's probes.
Two items are flagged out of this seat's scope: `D1` (material, still open at `e6b0a90`) and `D2` (material,
already closed by the wave-2 correction at `:201-206`).

## Ledger

| id | CritEntry sev | stale line at `e6b0a90` | disposition | evidence (this intake) |
|---|---|---|---|---|
| D3 | Low–Med | `:183` "admit four constructions" | **land** | `CritC1Forgery.md:91/104/113/122` = the four listed; `:132` D5 fabricated `mined` registry row = fifth; `:142` D6 no minimum population |
| D4 | Low | `:39-40` "Every response carries … `cache-control: no-store`" | **land** | gate `:131` 404 branch omits `cache-control`; `:132` 200 branch sets it; gate comment `:125` repeats the overstatement |
| D5 | Low | `:47-49`, `:157-159` | **closed-already** | entry `:196-200` (round-32 wave 2) already reads the binding as tying a receipt to this host build's rendering, not to execution; `:157-159` only states the binding's requirement, which is accurate |
| D6 | Low | `:163` "Arch launcher script" | **land** | `file /usr/bin/chromium` → ELF 64-bit LSB pie executable, 14,424 B, BuildID `b60b9805a567483207ed7c08dc10d69a2b00aee4`; `SentinelPerimeter.md:77` itself says "(ELF, …)" |
| D7 | Low | `:165-167` flag list | **land** | `~/.config/chromium-flags.conf` has **five** lines incl. `--ozone-platform-hint=wayland`; `SentinelPerimeter.md:89-92` executed argv puts it second |
| D8 | Low | `:6` verified-at pointer | **land** | `grep -n session_commands …/ScribeEntry/fetch-receipts.md` → no match, exit 1; S125's receipt is `corpus/SOURCES.md:139` (decoded sha `7b40e94c…`) |
| D9 | Low | `:5` "§7.3–§7.9" | **land** | fetched WD 20261008 byte-identical to S124 (`dc1077db…`): `data-level="7.1.3.4" id="command-session-subscribe"` "The session.subscribe Command" |
| D10 | Low | `:99` R8 "one element" | **land** | run1 seq 24 `#t`→`…e.1`, seq 26 `#b`→`…e.6`, seq 27 and 33 two element-origin `performActions`; identical sharedIds in run2 |
| D11 | Low | `:92` R1 "reachability outside the driver is untested" | **land** | every BiDi frame is sent by `scripts/bidi-loopback-round32.mjs:108` (`ws = new WebSocket(caps.webSocketUrl)`) over loopback, i.e. by a non-driver process |
| D12 | Low | `:189-190` "recorded with the round's measurement" | **closed-already** | `measure/c1-distinct-at-0808688.json` `{"ok":true,"rowsMarkedYes":16,"distinctRowIds":16,"distinctTranscriptDigests":2,"driverEqualsGate":false,"driverNames":[],"driverReexports":false}`, added in `8fa57d2` (ancestor of `e6b0a90`) |
| D13 | Low | `:117-118` U2 "only `ResponseData` status and serialized header fields" | **land** | run1 seq 12 response also has `statusText:"OK"`, `protocol:"http/1.1"`, `headersSize:198`, `bodySize:703`, `bytesReceived:703`, `mimeType:"text/html"`, `fromCache:false`, `content` |
| n1 | nit | `:94` R3 "awaited DOM predicate" | **land** | run1 seq 15-16: `script.evaluate` of `window.__ready` with `awaitPromise:true` → `"settled"` |

## Ready-to-append correction text

Append verbatim at the end of `corpus/knowledge/webdriver-bidi-runtime-round-32.md` (after line 211). Append-only:
no earlier line is edited.

```markdown
## Corrections — round 33 errata intake (append-only; the text above keeps its bytes)

- §8, "The gate's frozen bytes admit four constructions" (`:183`): five. The cited report's D5
  (`.ufo/waves/round-32/w1/CritC1Forgery.md:132-140`) adds a fabricated registry row — `s1` requires only an `S-id`
  present at REV, absent at baseline, status `mined`, and used-by naming the entry — and its D6 (`:142`) records that
  `clean` has no minimum population. None of the four counts listed at `:190-192` reads `s1`; the round-33 C2 battery
  is required to refuse that construction (F8, junk mined source row).
- §1 "Fixture", "Every response carries `x-tabi-fixture: r32` and `cache-control: no-store`" (`:39-40`): every **200**
  response does. The 404 branch (`scripts/check-bidi-runtime.mjs:131`) sends `content-type` and the fixture header
  only; `cache-control` is set on the 200 branch alone (`:132`). The gate's own comment at `:125` carries the same
  overstatement.
- §7 "Host launcher flags", "`/usr/bin/chromium` is the Arch launcher script" (`:163`): it is the Arch launcher, a
  14,424-byte ELF (`file`: pie executable, BuildID `b60b9805a567483207ed7c08dc10d69a2b00aee4`), not a shell script;
  its strings carry `chromium-flags.conf`, `XDG_CONFIG_HOME` and `/usr/lib/chromium/chromium`.
- §7 flag list (`:165-167`): five flags, not four — `--ozone-platform-hint=wayland` is omitted. This host's
  `~/.config/chromium-flags.conf` is exactly `--ozone-platform=wayland`, `--ozone-platform-hint=wayland`,
  `--enable-features=TouchpadOverscrollHistoryNavigation`,
  `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`, `--disable-features=Vulkan`; the
  executed argv (`.ufo/waves/round-32/w1/SentinelPerimeter.md:89-92`) puts `--ozone-platform-hint=wayland` second.
- front-matter "verified-at" (`:6`): the per-fetch table at `.ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md`
  has no `session_commands.cc` row (`grep -n session_commands` → no match). S125's receipt is `corpus/SOURCES.md:139`
  (decoded blob sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`); S124's and S126's are in
  both places.
- front-matter "source:", "the §7.3–§7.9 command/event definitions named in each row below" (`:5`): the rows span
  §7.1–§7.9 — R10's `session.subscribe` is §7.1.3.4 (`#command-session-subscribe`, "The session.subscribe Command",
  in the WD 20261008 bytes whose sha256 equals S124's recorded `dc1077db…`).
- §3 R1 (`:92`): "reachability outside the driver is untested" — it is exercised. Every BiDi frame in both committed
  transcripts is sent by the Node client in `scripts/bidi-loopback-round32.mjs`
  (`ws = new WebSocket(caps.webSocketUrl)`, `:108`) over loopback, not by chromedriver. What is untested is stability
  across launches, ports, hosts and driver versions.
- §3 R3 (`:94`): "an awaited DOM predicate" — the settle predicate is the page's own promise `window.__ready`, awaited
  with `awaitPromise: true` (seq 15-16) after `browsingContext.load`: an awaited page promise, not a DOM read.
- §3 R8 (`:99`): "one mouse pointer on one element" — two element-origin clicks on one mouse pointer source, `#t`
  (sharedId `…e.1`, seq 27) and `#b` (`…e.6`, seq 33), the second firing the handler; the same in both committed runs.
- §4 U2 (`:117-118`): "`ResponseData` status and serialized header fields" — the response object also carries
  `statusText` (`OK`), `protocol` (`http/1.1`), `headersSize` (198), `bodySize` (703), `bytesReceived` (703),
  `mimeType` (`text/html`), `fromCache` (false) and `content`; none is raw header-block or status-line bytes, so U2
  stays open.
```

Line count of the block: 37 non-blank lines (10 bullets: D3, D4, D6, D7, D8, D9, D11, n1, D10, D13 in that order).

## Evidence detail

Frozen state read (clone at the pinned rev; `git status --porcelain` → 0 lines):

```
corpus/knowledge/webdriver-bidi-runtime-round-32.md   c10189069bdf9195bdf8f9b8876e5669e3f9b42382cc16ab795de0133db630c5   211 lines
scripts/check-bidi-runtime.mjs                        2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393
```

`D3` — `CritC1Forgery.md` headings read at the rev: `D1` `:91`, `D2` `:104`, `D3` `:113`, `D4` `:122`, `D5` `:132`,
`D6` `:142`. The entry's four (`:184-187`) are D2 (row id listed more than once), D3 (one transcript as both runs),
D4 (`driver` = gate bytes under another path), D1 (spliced screenshot). D5 is the fifth admitted construction and is
outside all four counts. Not restated as execution evidence: the round-33 C2 refusal is a requirement in the frozen
claim, not a measured gate.

`D4` — gate bytes at the rev: `:120` `FIXTURE_SHA256` over `[k, type, body]` (header excluded, so `D1` of CritEntry
stands — out of scope here), `:121` `FIXTURE_HEADER`, `:125` the comment that copies the overstatement, `:131` the 404
branch (`content-type` + fixture header), `:132` the 200 branch (`cache-control: no-store` added).

`D6`/`D7` — host facts read this session: `file /usr/bin/chromium` (ELF pie, 14,424 B), `strings` hits
`chromium-flags.conf`/`XDG_CONFIG_HOME`/`/usr/lib/chromium/chromium`, `cat -n ~/.config/chromium-flags.conf` → five
lines, exactly the list above. `/etc/chromium-flags.conf` is absent on this host, so the correction does **not** claim
the launcher reads it (CritEntry's proposed `/etc` clause is dropped as unevidenced here); the executed-argv order is
taken from `SentinelPerimeter.md:89-92`, which I read but did not re-run.

`D8` — `.ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md` rows are S124, S126, the README.chromium, the two
developer.chrome.com pages and a 404 sitemap sweep; `session_commands` appears nowhere (grep exit 1). `corpus/SOURCES.md:139`
is the S125 row and carries decoded blob `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`.

`D9` — one read-only fetch, `2026-10-26T18:24:43Z`, HTTP 200, 4,235,856 B, sha256
`dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` = S124's recorded digest, so the section id
read from these bytes is the id of S124's bytes: `<h5 … data-level="7.1.3.4" id="command-session-subscribe">` "The
session.subscribe Command". The row range therefore starts at §7.1, not §7.3.

`D10` — run1: `seq 24` `locateNodes #t` → `…e.1` (`input#t`), `seq 26` `locateNodes #b` → `…e.6` (`button#b` with the
`onclick`), `seq 27` pointer move/down/up with origin element `…e.1`, `seq 29` keys `tabi`, `seq 33` pointer
move/down/up with origin `…e.6`, `seq 36` `#out` reads `clicked:tabi`. run2 carries the same sharedId set
(`e.1`×2, `e.4`, `e.5`, `e.6`×2) and three `input.performActions` sends.

`D11` — `scripts/bidi-loopback-round32.mjs:108` `ws = new WebSocket(caps.webSocketUrl);`; `:80` spawns chromedriver.
The client and the driver are separate processes, on loopback, which is exactly the reachability the entry calls
untested.

`D12` — the entry cites `.ufo/waves/round-32/measure/`; that directory at the rev holds `c1-distinct-at-0808688.json`
(stamped at `0808688`, `ok:true`, four counts as listed at `:190-192`), `c1-offline-at-0808688.json`,
`c1-live-at-0808688.json`, `c2-at-0808688.json` and the older `c1-distinct-red-green.txt`, whose first line still
reads `== lane working tree (pre-commit; re-run at the measured revision in measure/)`. The stamped JSON was added by
`8fa57d2` (`git log --diff-filter=A`), which `git merge-base --is-ancestor 8fa57d2 e6b0a90…` confirms is an ancestor
of the frozen rev — i.e. it landed after CritEntry's attacked rev `b234a589` and before the freeze. The defect no
longer describes the tree, so no correction line is proposed.

`D13`/`n1` — run1 `seq 12` response object: the eight fields listed; `seq 15-16` the awaited `window.__ready`
evaluation. Both also present in run2 (not re-quoted; the lane's own gate already requires both transcripts).

`D5` — the wave-2 correction at `:196-200` is scoped to §1 `:47-49`. §6 `:157-159` says the binding requires
byte-identical screenshots across every run and the live session plus a `chromedriverVersion`, and that a single
screenshot alone is not enough — a true statement about the gate, and not a claim that a transcript is authentic.
With `:196-200` in place the entry no longer asserts execution provenance, so no further line is needed.

## Commands and exit codes

| command (cwd = `$S/clone` unless noted) | exit |
|---|---|
| `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` | 0 |
| `git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea` | 0 |
| `git -C "$S/clone" rev-parse HEAD` → `e6b0a907…`; `status --porcelain \| wc -l` → `0` | 0 / 0 |
| `sha256sum corpus/knowledge/webdriver-bidi-runtime-round-32.md scripts/check-bidi-runtime.mjs` | 0 |
| `grep -n 'FIXTURE_SHA256\|FIXTURE_HEADER\|writeHead(404\|writeHead(200\|Every response carries' scripts/check-bidi-runtime.mjs` | 0 |
| `grep -n session_commands .ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md` → no match | **1** |
| `grep -n '^\| S124 \|^\| S125 ' corpus/SOURCES.md` → lines 138, 139 | 0 |
| `jq -c '.…' .ufo/waves/round-32/measure/c1-distinct-at-0808688.json` | 0 |
| `git log --oneline --diff-filter=A -- .ufo/waves/round-32/measure/c1-distinct-at-0808688.json` → `8fa57d2` | 0 |
| `git merge-base --is-ancestor 8fa57d2 e6b0a907…` | 0 |
| `grep -o 'e\.[0-9]*"' corpus/evidence/round-32/bidi/run{1,2}/transcript.jsonl \| sort \| uniq -c` | 0 |
| `sed -n '12p' …/run1/transcript.jsonl \| jq -c '.frame.params.response \| {…}'` | 0 |
| `grep -n 'ws = new WebSocket' scripts/bidi-loopback-round32.mjs` → `:108` | 0 |
| `file /usr/bin/chromium`; `strings /usr/bin/chromium \| grep -E 'chromium-flags.conf\|XDG_CONFIG_HOME\|/usr/lib'` | 0 |
| `cat -n /home/vgpnk/.config/chromium-flags.conf` → 5 lines | 0 |
| `curl -q -sS --proto =https -o spec.html -w 'status=%{http_code} bytes=%{size_download}' https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` → `status=200 bytes=4235856` | 0 |
| `sha256sum spec.html` → `dc1077db…`; `grep -c 'id="command-session-subscribe"' spec.html` → `1` | 0 |
| `grep -n '^\*\*D[0-9]' .ufo/waves/round-32/w1/CritC1Forgery.md` | 0 |
| `git -C lane diff --stat b7d16fb e6b0a90 -- corpus/knowledge/webdriver-bidi-runtime-round-32.md` → empty; `git show b7d16fb:<entry> \| sha256sum` → `c1018906…` | 0 |
| `sed -n '29p;87p;90p' .ufo/waves/round-33/baseline/controls.mjs` (reset to BASELINE, live `entrySha`, pinned compare) | 0 |
| `jq '{results: (.results \| map_values(.accepted))}' baseline/c2-J3-whitelist.json` → H0/H1/H2 `true` | 0 |
| `pgrep -fa 'chromedriver\|chromium'` → one line, `/usr/bin/earlyoom` (not mine) | 0 |

Raw transcript of these runs: `evidence/checks.txt`, `evidence/checks2.txt`, `evidence/checks3.txt`; fetch receipt:
`evidence/fetch-receipts.txt`.

## Landing constraint (affects when the L1 may append)

The round-32 entry is byte-identical at BASELINE `b7d16fb` and at the freeze (`git diff --stat b7d16fb
e6b0a90 -- corpus/knowledge/webdriver-bidi-runtime-round-32.md` → empty; `c1018906…` at both). Two harness facts
follow:

- **The gate's population cannot move.** `scripts/check-bidi-runtime.mjs:341-353` (`parseTable`) reads the first
  table whose header equals `HEADER` and stops at the first non-row line, so a trailing bullet block adds no row;
  the block contains no `|` line at all. The 16-row population is unchanged by construction (not re-run here).
- **A re-run of the frozen controls will differ.** `baseline/controls.mjs:87` pins the **live worktree's**
  entry digest into the C2 J3 whitelist gate, while its clone resets to BASELINE (`:29`) and the pinned digest is
  compared at `:90` (`sha256(entryBuf) === "${entrySha}"`). After an append the pin is the new digest and the clone
  still carries `c1018…`, so the whitelist control would stop accepting H0/H1/H2 — `c2-J3-whitelist.json` would be
  regenerated with `honest.H0/H1/H2 = false` instead of the committed `true` (its `results.*.accepted` all `true`
  today). The control's own predicate (`false`, exit 1) does not flip, but the committed receipt would no longer
  reproduce. Land the corrections when this round's controls are already committed (they are), and record that a
  later regeneration of `c2-J3-whitelist.json` differs for this reason — or hold the append to the next round.

## Out of scope, flagged for the L1

- **`D1` (CritEntry, Medium) — material, still open at `e6b0a90`.** `:41-42` still says `FIXTURE_SHA256` "digests
  exactly these bodies, types and header pair"; the gate preimage at `:120` covers `[key, type, body]` only and
  `FIXTURE_HEADER` is a separate constant at `:121`. I read both lines; I did **not** mutate a gate copy this round,
  so I record the bytes-level contradiction only, not CritEntry's digest-unchanged probe. Not part of the ten.
- **`D2` (CritEntry, Medium) — closed by the landed wave-2 correction.** `:201-206` reads the counts as three of the
  four holes; the fourth (spliced screenshot) is stated to pass them. No further text.
- Not mine: C1 adjacency (`counters/c1-adjacency-sweep.mjs`, `corpus/adjacency-screen.tsv`), C2 BiDi gate v2 and the
  S127+ registry rows, `corpus/lessons/round-33.md`, `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`, QUALITY
  criteria 87+, and the round-33 SOURCES rows. This seat wrote no lane file.
- Observed, not proposed: the landed wave-2 correction cites the §8 counts sentence as `(`:188-190`)` while it sits at
  `:189-192`. Affects no statement; an append-only corrections block cannot edit it, and a second pointer line would
  add noise, so it is recorded here only.

## Scratch

`$HYAKU_SCRATCH/tabi-r33/ScribeErrataB` (`/fast/scratch/hyaku/tabi-r33/ScribeErrataB`): one shared clone at the
pinned rev, one fetched spec page, two captured outputs — all copied into this directory, then the tree removed
(`rm -rf`). No browser, chromedriver or chromium was started; `pgrep -fa 'chromedriver|chromium'` shows only the
host's `earlyoom` line, which is not mine. No tool was installed or upgraded.
