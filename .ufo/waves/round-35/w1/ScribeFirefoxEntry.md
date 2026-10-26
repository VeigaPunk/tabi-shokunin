# ScribeFirefoxEntry — C2 entry draft (round 35, wave w1)

**Verdict.** The C2 knowledge entry exists as a wave-1 draft at
`.ufo/waves/round-35/w1/ScribeFirefoxEntry/entry.md`, modelled on the round-32 entry: provenance
comment, `source:` / `verified-at:` / `recheck:` front matter, prose, then the machine-read table
`Row | Surface | BiDi method | Measured | Evidence` with R1–R17 in matrix order, `yes` on the
sixteen rows that have a BiDi command and `no — no BiDi command in the draft (§7.3.3)` on R16, plus
the four required sections (what a second engine adds, launch discipline on this host, the
engine-choice decision table, the `## Engine differences` placeholder for the L1) and a limits
section. It is **not publishable as it stands** and it does not claim to be: the `source:` ids are
`S13x` placeholders (the counter reads `[]` S-ids from that line, so the entry would fail
`s1-source-row`), and the `yes` cells are admitted by the counter at the measured revision, not by
this text. What this seat *did* verify is written down: seven source pages fetched, hashed and
quoted this round (plus six 404 probes recorded without digests), both host binaries pinned, the
draft's table re-parsed with the frozen gate's own `parseTable` (17 rows, population 17, zero
findings, zero surface drift), and the C2 executor's two landed transcripts re-digested and
re-evaluated against all sixteen gate predicates (0 failures; both first screenshots
`7a3ae6a9b0d65497…`). No browser was launched and no lane file was touched.

## Evidence (commands, exit codes, file:line)

### 1. Source fetches (read-only HTTPS GETs, 2026-10-26 UTC)

```
S=/fast/scratch/hyaku/tabi-r35/ScribeFirefoxEntry
curl -q -sS --proto =https -o <name>.html -w '%{http_code} %{size_download}' <url>   # logged to fetch-log.tsv
```
`fetch-log.tsv` (exit 0 per curl; 11 rows): geckodriver Flags `200 41404 sha256 2b023afe…`;
geckodriver Capabilities `200 31324 e596eee2…`; geckodriver Support `200 30061 48dfddea…`;
remote/index `200 28453 4b009a43…`; MDN Create_BiDi_connection `200 158205 fcda3e13…`;
geckodriver usage `200 36447 34641c5e…`; `src/capabilities.rs`@v0.37.1 `200 54316 d3e65953…`;
`src/marionette.rs`@v0.37.1 `200 66012` (digest computed at seat close:
`757e3955…`); MDN firefoxOptions `200 169055 c36e3c5a…`; W3C WD-20261008 `200 4235856
dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` — equal to the round-32
registry row's digest, so the spec bytes are unchanged and §7.x anchors carry.
404s (status + bytes only, bodies not retained): `remote/RemoteAgent.html` 404/378,
`WebDriverCapabilities.html` 404/401, `remote/RemoteAgent/index.html` 404/364,
`remote/webdriver-bidi/` 404/367, `remote/WebDriverBiDi.html` 404/380,
`remote/RemoteProtocolPrefs.html` 404/386. Consequence: no claim about `remote.active-protocols`
is made anywhere in the entry. Per-fetch table with line-located quotes:
`.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md` §1.

### 2. Host binaries (exit 0 both)

```
/home/vgpnk/.local/bin/geckodriver --version  → geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)
/home/vgpnk/.local/opt/firefox-158.0.1/firefox --version → Mozilla Firefox 158.0.1
sha256: geckodriver f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f (6029440 B);
        firefox a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789 (5520 B ELF launcher)
```

### 3. Draft validated with the frozen gate's own parser (scratch clone at the freeze)

```
git clone -q --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
git -C "$S/clone" rev-parse HEAD → a4bfef0f75027c915e715649950b1d46dcb33d83   (toplevel = $S/clone)
node check-entry.mjs .../ScribeFirefoxEntry/entry.md  → exit 0
  rows 17, first row line 100, population 17, problems 0, missing-ids -
  R16 verdict=no cell="no — no BiDi command in the draft (§7.3.3)"; every other row verdict=yes,
  evidenceCites=true for all 17 rows (both transcript paths + the counter path)
node -e 'parseTable + ROWS + source-line regex' → surface mismatches 0; cited S-ids [] (§Finding 2)
```
The table is the first table the gate's `parseTable` lands on
(`scripts/check-bidi-runtime.mjs:490-506`, header `:143`), so no prose table can shadow it.

### 4. Landed C2 artifacts re-checked (read-only; nothing re-run)

```
node check-receipt.mjs → exit 0
run1.jsonl sha256 b916c5df2245b856… sid=bc272ba1-5207-4ac5-abe5-3b55b9ac708f bv=158.0.1 gdv=0.37.1
  cmds=28 events=20 shot=7a3ae6a9b0d65497… shotBytes=9451 predicateFailures=[]
run2.jsonl sha256 af84675fc57f1c7c… sid=08b0adaa-2476-439d-a46c-8db47f3baf6f bv=158.0.1 gdv=0.37.1
  cmds=28 events=20 shot=7a3ae6a9b0d65497… shotBytes=9451 predicateFailures=[]
sha256sum bidi-firefox-loopback-round35.mjs → f95dac5e696ce56f… (equals receipt.driverSha256)
```
Both digests equal `receipt.json`'s `transcriptSha256`; the first-screenshot digest equals the
pre-freeze instrument check (`baseline/c2-instrument-check.json`) and the delta session
(`w1/ExecFirefoxDelta/firefox-raw.jsonl`) — five Firefox sessions, one digest.

### 5. Tooling

Nothing installed, upgraded or removed. `pacman` untouched. Scratch only.

## Findings for the L1 (verbatim, no repair attempted)

1. **The frozen counter's admission bar is 14, the claim says 16.** `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:77` `const TARGET = 14;`, comment `:54` "`//   admitted >= 14.`", predicate `:462` `… out.failing === 0 && out.admitted >= TARGET;` — while `.ufo/waves/round-35/claims.json:162` says `"predicate": "no entry finding AND no binding finding AND failing == 0 AND admitted >= 16"` and `:163` "admitted 16 of the 16 matrix rows". As frozen, the instrument would pass with two rows missing. The executor's own reading is 16/0/1 (`w1/ExecFirefoxDriver/counter-check.json`), so the discrepancy does not bite this round's data — it bites the instrument. Attack seats own the verdict; this is the citation.
2. **My draft's `source:` line is not counter-admissible yet, by construction.** The counter extracts cited ids with `/\bS\d{3,}\b/g` from the line matching `/^source:/i` (`c2-firefox-bidi.mjs:365-367`); `S13x` matches nothing (verified: extraction returned `[]`), so the entry would carry `entryFinding: s1-source-row`, detail "no S-id on the source: line". Substitution must be per URL, not one id for the whole line. The only row already landed is **S134 = the geckodriver Flags page** (`w1/ExecFirefoxDriver/sources-row-S134.txt`: `mined`, `used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`, with a `## Gate` row whose digest `2b023afe…` equals my fetch of the same bytes) — one id is enough for s1, but the Support page, MDN firefoxOptions and `marionette.rs` have no dispatched slot, and the W3C WD id (S124) exists at baseline so it can never be the s1 witness (`parseRegistry` + `regThen.has(id)` refusal, `:371`). Cheapest edit: keep S134 on the line for the Flags citations and let the prose carry the other URLs, or open the missing rows.
3. **Two entry drafts for the same path now exist.** Mine at `w1/ScribeFirefoxEntry/entry.md`; the executor's at `w1/ExecFirefoxDriver/entry-webdriver-bidi-firefox-runtime-round-35.md`, which is the text its counter run at rev `245c4c61…` actually admitted (its `source:` cites S134 and it ships its own S134 row + `lesson-round-35-gate-only.md` fragment). The L1 has to publish one. Difference that matters: the executor's draft had its admission measured; mine has its table shape measured and its receipts re-checked by a second seat, and it carries the engine-choice decision table and the launch-discipline section my item required. If the L1 takes mine, the S134 row and its `## Gate` row from the executor's output are exactly what it needs to substitute.
4. **The binding proves rendering, not run provenance — and the digest is cheap.** The same first-screenshot sha256 (`7a3ae6a9…`) was produced by five sessions from three different seats' recorders (instrument check ×2, delta ×1, receipt ×2). Anyone able to run Firefox headless once obtains it. The entry says so in §6; do not let any report upgrade the binding into proof that the two runs happened.
5. **Counter paths to watch.** `ENTRY` (`:72`), `RECEIPT` (`:73`), `LESSON` (`:74`) are exactly the paths my entry's front matter and Evidence cells name. If the L1 renames anything, the entry's citations go stale in the same edit.

## Out of scope / not done here

No browser or driver launched (the counter's live leg is the executor's and the counter's own); no
counter, gate, controls or lane file executed or edited; no lane tracked file touched; no commit
anywhere; no subagents. `entry.md` and `fetch-receipts.md` are drafts in this seat's output dir,
not claims about the measured revision.

## Deliverable paths

- `.ufo/waves/round-35/w1/ScribeFirefoxEntry/entry.md` — the C2 entry draft (27,144 B, sha256 06121d7efcc36b5b508e9c33ff56083a9d33f0bb96e92fda777781da419b70bd).
- `.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md` — per-fetch receipts, 404 probes,
  binary pins, registry-slot map for the L1, and the artifacts this seat re-verified.
- This report: `.ufo/waves/round-35/w1/ScribeFirefoxEntry.md`.
- Scratch `/fast/scratch/hyaku/tabi-r35/ScribeFirefoxEntry` (clone + fetched bytes + checkers) is
  deleted before this seat yields.
