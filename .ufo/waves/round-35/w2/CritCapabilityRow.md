# w2 CritCapabilityRow — attack on the intended C2 capability row

Seat: CritCapabilityRow (leaf). Wave: w2 (FALSIFY), round 35, item = the capability row the L1 intends to enter for C2.
Attacked: the draft repertoire row `webdriver-bidi-runtime-firefox` (below) against `AXES.md` §Capabilities, QUALITY
84 (corpus/QUALITY.md:508-511), and the round-32 precedent row (SCORECARD.md:1663). Findings only; nothing repaired.
No browser/driver launched; no clone made; no tool installed; no scratch created (static evidence review).

Draft row under attack:

```
| webdriver-bidi-runtime-firefox | Drive a WebDriver BiDi session on Firefox 158.0.1 through geckodriver 0.37.1 on this host
(classic webSocketUrl handshake, headless, throwaway profile, free websocket port, DNS-off loopback-only prefs,
127.0.0.1 fixtures only) and record per-surface runtime evidence for the sixteen matrix §2 rows that have a BiDi command,
two cold runs bound by identical first-screenshot bytes | scripts/bidi-firefox-loopback-round35.mjs;
corpus/evidence/round-35/bidi-firefox/receipt.json; corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md;
demonstration = the round report's measured C2 run | 35 |
```

## Verdict

**HOLDS as a new capability, with two low-severity wording/evidence-pointer corrections.** It is **not** the round-32
row with a parameter changed: the round-32 row claims Chromium specifically and its driver script has zero Firefox
machinery (0 refs to DNS prefs / `--websocket-port` / 9222), Firefox was absent from the host census until this round, and
the operation (geckodriver launch flags, Marionette-brokered BiDi socket, UUID identity grammar, DNS-off prefs) was not
runnable before this round — so a separate row, not an edit of the 1663 row, is the right entry mechanism and matches
precedent (separate rows per distinct operation). The row names an operation, never a gate/counter (QUALITY 84 holds).
Every clause is demonstrated by committed evidence **except one imprecise phrase**: "DNS-off loopback-only prefs"
conflates a pref mechanism with a socket outcome — there is no "loopback-only" pref; loopback-only is a measured result
(QUALITY 100), and the only committed artifact explicitly cited for the integration sample,
`measure/driver-egress-sample.txt`, is **0 bytes** at the integration rev, so the sentence as drafted would be
unsubstantiated by its own citation. The substance exists (w1 SentinelFirefoxEgress measured 0 non-loopback sockets with
`network.dns.disabled=true`), so this is a wording/pointer fix, not a blocked capability.

## Evidence

### 1. New capability vs parameter-changed round-32 row — NEW capability

- `SCORECARD.md:1663`: round-32 row scope is engine-literal: "Drive a WebDriver BiDi session on this host (chromium and
  chromedriver 154.0.8037.97, classic `webSocketUrl: true` handshake, headless, throwaway profile, `127.0.0.1` fixtures
  only)". No Firefox row existed; `SCORECARD.md:1665` limits the row to that transport operation.
- `git show 083c5c6:scripts/bidi-loopback-round32.mjs | grep -cE 'trr|dns\.disabled|websocket-port|9222'` → `0`
  (exit 0): the round-32 driver performs none of the new operation's machinery.
- Counter header `c2-firefox-bidi.mjs:5-10` frames the gap: "the lane's WebDriver BiDi runtime evidence (round 32) is
  Chromium-only … On a second engine (Firefox through geckodriver), …".
- Host census: Firefox absent at round start; installed this round from Mozilla releases — `ScribeSrcMozRelease/gate.md`:
  `cmp extract/geckodriver /home/vgpnk/.local/bin/geckodriver` exit 0, and the installed binary sha256
  `f831b7e6…51f6e39f` equals the GitHub-published digest (S141); Firefox `firefox-bin` sha256 `46e2c204…6e7294` (S140,
  ScoutFirefoxCensus). So the operation was not previously runnable: new repertoire entry, not parameter reuse.

### 2. QUALITY 84 — row names an operation, not a gate/counter

- The row's evidence pointers are a client script, a receipt, a knowledge entry, and the round report's measured run — no
  gate (`scripts/check-bidi-runtime.mjs`) and no counter (`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`) appears in
  the row. Round-32 precedent identical (`SCORECARD.md:1663`).

### 3. Clause-by-clause demonstration (all committed at 083c5c6 unless noted)

| Draft clause | Evidence |
|---|---|
| Firefox 158.0.1 through geckodriver 0.37.1 on this host | receipt.json `browserVersion 158.0.1`, `geckodriverVersion 0.37.1`, `binaries` paths + version lines; binaries verified against signed release digests (S140/S141; `cmp` exit 0; GPG verify). Entry line 6 pins both sha256. |
| classic webSocketUrl handshake | driver `bidi-firefox-loopback-round35.mjs:144-166` (`POST /session`, `webSocketUrl: true`); run1.jsonl seq1 returns `webSocketUrl` `ws://127.0.0.1:<port>/session/<uuid>`; driver refuses non-loopback ws URLs (`:186`). |
| headless | driver `:128` `MOZ_HEADLESS=1`, `:155` args `["-headless"]`; run1.jsonl seq1 caps `moz:headless: true`. |
| throwaway profile | driver `:96-131` fresh per-run scratch (`--profile-root`, HOME, XDG_*); run1.jsonl seq1 `moz:profile` inside `/fast/scratch/hyaku/tabi-r35/L1/int/tmp/fx-…`; driver `:378` `rmSync(runDir)` in finally; sentinel Check 2 HOLDS (home files byte-identical). |
| free websocket port | driver `:72-81` `freePort()`, `:116` refuses 9222, `:132` `--port`/`--websocket-port` both free; never the 9222 default (S134 documents 9222 default); sentinel Check 4: listeners loopback-only, no 9222. |
| DNS-off loopback-only prefs | **Partial wording defect.** The prefs exist and are set: driver `:155` `network.dns.disabled: true` + `network.trr.mode: 5`. But "loopback-only prefs" names no pref — loopback-only is a measured outcome (QUALITY 100), evidenced by w1 SentinelFirefoxEgress fixE: `network.dns.disabled=true` → 0 non-loopback connects on any port, 0 Mozilla lookups (`.ufo/waves/round-35/w1/SentinelFirefoxEgress.md:132,23`). The committed integration citation `measure/driver-egress-sample.txt` is **0 bytes** at 083c5c6 (`git cat-file -s` → 0; introduced in 083c5c6) — it substantiates nothing by itself (no method, cadence, pid scope, counts). |
| 127.0.0.1 fixtures only | gate `serveFixture` binds `127.0.0.1` (`check-bidi-runtime.mjs:186-199`); run1.jsonl all request URLs `http://127.0.0.1:<port>/…`; driver fixture base is the gate's; entry §2 line 90. |
| sixteen matrix §2 rows with a BiDi command | matrix §2 has 17 rows; R16 has no command (`webdriver-bidi-capability-matrix.md:75`), so 16 = R1–R15+R17. Transcripts contain all 28 recipe commands spanning the 16 rows; counter at 083c5c6 read admitted 16, failing 0, binding null. Caveat (frozen, not new): M1 threshold `TARGET=14` vs declared `admitted >= 16` — the measured run's actual admission was 16, matching the row's "sixteen"; the declared sentence must be the bar. |
| two cold runs bound by identical first-screenshot bytes | driver runs `run1`/`run2` as separate cold launches (`:397-402`; fresh geckodriver+profile each); receipt `runs[].transcriptSha256` distinct (`0ef2e7e5…`, `6754ec2d…`), session ids distinct (`bc272ba1-…`/`08b0adaa-…` in entry; UUIDs in transcripts); main enforces screenshot equality (`:407-408`); receipt `firstScreenshotSha256` `7a3ae6a9…cbfd02` identical; entry line 53: five independent sessions same digest. |
| demonstration = the round report's measured C2 run | matches round-32 precedent (`SCORECARD.md:1663` "demonstration = the round report's measured C1 run"); row enters only after the round demonstrates it (AXES.md:62-64). Not yet present — normal at w2; not a defect. |

### 4. Commands run (exact, exit codes)

- `wc -c .ufo/waves/round-35/measure/driver-egress-sample.txt` → `0` (exit 0).
- `git cat-file -s 083c5c6:.ufo/waves/round-35/measure/driver-egress-sample.txt` → `0` (exit 0).
- `git show 083c5c6:scripts/bidi-firefox-loopback-round35.mjs | sha256sum` →
  `fb8c5fdfeb4350948dc7b62c26883b657efe5d0190274dbd8c0ea8716320ba9b  -` — equals receipt `driverSha256` (receipt is
  self-consistent with the committed driver).
- `git show 083c5c6:scripts/bidi-loopback-round32.mjs | grep -cE 'trr|dns\.disabled|websocket-port|9222'` → `0` (exit
  0; confirms round-32 driver lacks the new operation's machinery).

## Findings

| # | severity | finding |
|---|---|---|
| 1 | low | Wording: "DNS-off loopback-only prefs" conflates the pref mechanism with the socket outcome; the pref-set is `network.dns.disabled` + `network.trr.mode` 5, loopback-only is the measured 0-socket result (QUALITY 100). |
| 2 | low | Evidence pointer: the drafted clause's natural citation, `measure/driver-egress-sample.txt`, is 0 bytes at the integration rev — it cannot carry the "0 non-loopback sockets" claim; the substantiating measurement is w1 SentinelFirefoxEgress (fixE). |

## Proposed wording fixes (smallest safe corrections)

1. Replace "DNS-off loopback-only prefs" with: "DNS-off prefs (`network.dns.disabled`, `network.trr.mode` 5) and a
   127.0.0.1 IP-literal fixture only (loopback egress sampled 0 non-loopback sockets; w1 SentinelFirefoxEgress)".
2. Keep "sixteen matrix §2 rows that have a BiDi command" (accurate; R16 has no command; the 16 declared rows were
   admitted in the measured run — record the strict `admitted 16, failing 0` sentence in the round report per M1, since
   the frozen counter's 14-threshold alone would not prove "sixteen").
3. Everything else in the row stands as drafted; no gate/counter naming; evidence pointers complete.

## Deliverables

- Report: `.ufo/waves/round-35/w2/CritCapabilityRow.md` (this file).
- Output dir: `.ufo/waves/round-35/w2/CritCapabilityRow/` (created; no scratch created; no processes started).
