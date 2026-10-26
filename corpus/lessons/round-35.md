# Round 35 — lesson (tabi, 2026-10-26)

Claims (frozen in `a4bfef0f75027c915e715649950b1d46dcb33d83` before data, `.ufo/waves/round-35/claims.json`): **C1 adjacency** — the 383 sibling
lines on browser ground that do not name tabi are each mapped or screened, and at least two new map rows survive
attack; **C2 coverage + capability (sourced)** — the sixteen matrix §2 rows with a BiDi command hold on Firefox
158.0.1 / geckodriver 0.37.1 by the unchanged gate predicates over two committed runs and the counter's live session.

## Gate

Source rows opened this round (every row re-fetched by its seat; quotes located by grep in the fetched bytes; seat
receipts under `.ufo/waves/round-35/w1/ScribeSrc*/`). Decision: admit (registered `mined`, used-by the C2 entry).

| id | url | accessed (UTC) | status | bytes | sha256 | quote (<= 25 words) | location |
|---|---|---|---|---|---|---|---|
| S134 | https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html | 2026-10-26T21:12:29Z | 200 | 41404 | 2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc | Port to use to connect to WebDriver BiDi. Defaults to 9222. | §`--websocket-port PORT`, Flags.html:496 |
| S135 | https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26T21:12:29Z | 200 | 31324 | e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842 | Most of these are documented on MDN. | §Firefox capabilities, Capabilities.html:293 (absence sweep below) |
| S136 | https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/capabilities.rs | 2026-10-26T21:12:29Z-21:12:30Z | 200 | 54316 | d3e65953dca6b6e1653326fbeae49d4c6cd1abfba8df47de9f9d9ca2ac870359 | `if has_web_socket_url ¦¦ has_debugger_address {` then `rv.use_websocket = true;` | capabilities.rs:522-523 (flag read from `matched.get("webSocketUrl")` at 510-513) |
| S137 | https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs | 2026-10-26T21:13:19Z | 200 | 66012 | 757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3 | `capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());` | marionette.rs:767 (inside the `NewSession` arm, 757-770) |
| S138 | https://firefox-source-docs.mozilla.org/remote/Prefs.html | 2026-10-26T21:13:03Z | 200 | 31971 | 72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1 | "With the end of the CDP support, WebDriver BiDi is the only available protocol, and the preference was removed in Firefox 141." | body lines 296-298, under `<section id="remote-active-protocols">` / h3 `remote.active-protocols` (lines 292-293) |
| S139 | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes | 2026-10-26T21:13:04Z | 200 | 186783 | 721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48 | "finds the nodes in a context that match a locator, which specifies the search criteria" | body line 1506, §`browsingContext.locateNodes` command paragraph |
| S140 | https://ftp.mozilla.org/pub/firefox/releases/158.0.1/ | 2026-10-26T21:11:51Z | HTTP 200 | 7,927 | bb07ee85635b5743f1c5a619de44059ef3a3e71ad34cb2324597bb4602c14563 | `dce45470139242cf294eb6ada3d192a9bb334696842b02b71ade448a139eb41a  linux-x86_64/en-US/firefox-158.0.1.tar.xz` | SHA256SUMS:235 of 4,921 lines (sibling fetches: SHA256SUMS 551,210 B sha256 6e1f529f…a94b38; SHA256SUMS.asc 833 B sha256 f1d73209…20584b; KEY 31,916 B sha256 b0c538f0…5b798) |
| S141 | https://github.com/mozilla/geckodriver/releases/tag/v0.37.1 | 2026-10-26T21:11:51Z | HTTP 200 | 200,220 | 419fc73f6e687d87795426aaaf0fba6f812a020cb5070e6e1a45e0ba033d0fd2 | `<span class="text-bold">geckodriver-v0.37.1-linux64.tar.gz.asc</span>` | expanded_assets/v0.37.1:92 (its tarball sibling at :65); the tag page states the release line at :164 |

Additional located quotes: | S138 | "Defines if WebDriver BiDi experimental commands and events are available for usage. Defaults to true in Nightly builds, and false otherwise." (21 words) | body lines 310-311, under h3 `remote.experimental.enabled` (line 309) | ; | S139 | "An object that specifies one of five criteria to find nodes, using a combination of type and value fields." (19 words) | body line 1596, §Parameters → `locator` | ; | S139 | "For type: "css", value is a string that contains the CSS selector to evaluate" (15 words) | body line 1637, §Parameters → `locator.value` |

Rejected (kept as decisions, not rows):
- Firefox 158.0.1 release notes (`https://www.mozilla.org/en-US/firefox/158.0.1/releasenotes/`, drafted as S140 by w1
  ScribeSrcMozRelease, 2026-10-26T21:11:58Z, 200 after a 301 to www.firefox.com, 104,555 B, sha256
  `6a6b86ea147a8da7af13b47492d94be3d3f35491f51be715d38cc264b20023d5`) — refused: the entry cites no fact it teaches
  that S140 (the release directory and its signed SHA256SUMS) does not already pin (CORPUS.md rule 4). Flip: a later
  claim that depends on a fix listed in the notes.
- geckodriver `Support.html`, `remote/index.html` and MDN `firefoxOptions` (fetched by w1 ScribeFirefoxEntry,
  receipts in its `fetch-receipts.md`) — not registered; the entry marks each citation `unregistered page fetched this
  round`. Flip: register when a claim rests on them.
- Seat-proposed ids were renumbered by document (URL first, id follows): ScribeSrcFirefoxRemote S136→S138 (Prefs.html),
  S137→S139 (MDN locateNodes); ScribeSrcMozRelease S138→S140 (ftp release dir), S139→S141 (geckodriver release).
  ScribeSrcGeckodriver S134–S137 kept.

Registry log (contract: every status / recheck / used-by change old→new):
- S134–S141: new rows, status `mined`, used-by `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`.
- S125 recheck: `90d` → `90d` (unchanged). w1 ScribeS125Cadence re-opened S125 (same 68,207-byte decoded blob, sha256
  `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`) and showed `on-release` is the right cadence,
  but the cell change is gate-green only with four companion evidence files under
  `corpus/evidence/round-29/release-pins/` (receipt row, two decoded tag blobs, a refetch record); the seat's scratch
  shows the cell alone turns `check-release-pins` red (exit 1, `r1-entry missing or no files`) — a no-harm breach this
  round's freeze forbids — and the two decoded blobs were not retained in the seat dir. Routed (round-34 routed defect 5,
  second carry): land the cell together with the four companions in one commit
  (`.ufo/waves/round-35/w1/ScribeS125Cadence/s125.md`).

Assimilation: none (w1 ScoutAssimilation: no `merge/tabi/` theme touches Firefox/BiDi or sibling adjacency). Id
collision check run anyway (`.ufo/waves/round-35/assimilation/`): registry ids 133, staged ids 148, collisions 32 —
nothing appended, so nothing renumbered; quarantine slice re-derived (38 rows), verdicts stand from rounds 22–23. No
`considerthese/` dir in this lane.

## C1 gate decisions — wave 1

- 27 chunk scribes dispositioned all 383 lines: 382 screens (same-surface 225, not-browser-sense 119,
  third-lane-report 30, no-claim-declared 8) and one map row (AdjKagi1: `cdp-bridge-vault-dom-refusal`, kagi
  `SKILL.md:40`, split-declared). One seat ledger carried a header line as a data row (AdjKotoba1); dropped at merge.
- w1 ConnBoundaries scanned the same 383 lines independently, without the seats' drafts: 238 same-surface / 66
  not-browser-sense / 51 no-claim-declared / 28 third-lane-report by its count, and "no new row in this pool that I
  would defend against wave 2"; its three new-surface signals (kake `ops-automation.md:78`, kumitate
  `kimi-skills-plugins.md:486`, kama `listener-census.md:356`) carry no side statement and were screened same-surface by
  the chunk seats as well. The integrator made no reversal (QUALITY 91): every seat decision is landed as drafted, and
  the single row goes to wave 2 for attack.
- Reading the frozen target honestly: newMapped >= 2 needs a second row the integrator would defend; there is none.
  The sweep's finding is the result: the browser ground siblings write without naming tabi is, with one possible
  exception, already answered by the existing sixteen rows.

## C2 gate decisions — wave 1

- Driver: w1 ExecFirefoxDriver's `bidi-firefox-loopback-round35.mjs`, with one L1 change after w1
  SentinelFirefoxEgress: `moz:firefoxOptions.prefs` `network.dns.disabled: true`, `network.trr.mode: 5` (the seat
  measured three outbound TLS connections to Mozilla CDN hosts per launch without them, 0 with them). The two committed
  runs were re-recorded by the L1 with the changed driver (`corpus/evidence/round-35/bidi-firefox/`; first screenshots
  both `7a3ae6a9…`; `.ufo/waves/round-35/measure/driver-egress-sample.txt` 0 non-loopback sockets).
- Entry: w1 ScribeFirefoxEntry's draft, `S13x` placeholders resolved to S134–S141 (or to S007/S124, or marked
  unregistered), §5 filled from w1 ExecFirefoxDelta D1–D10 plus D11 (egress).
- Binding risk: w1 ExecFirefoxDeterminism ran 27 cold sessions (sequential, concurrent pairs, odd TMPDIR/LANG/PATH):
  one first-screenshot digest throughout; one session-start failure under a very long PATH (websocket open failed) —
  an attempt event, not a pixel event.

## Mistakes

- **M1 — freeze-consistency (counter threshold ≠ declared predicate).** Evidence: `.ufo/waves/round-35/claims.json`
  C2 predicate `admitted >= 16`; the frozen counter `c2-firefox-bidi.mjs:54` and `const TARGET = 14` (w1
  RevClaimsFreeze F1). The L1 raised the target from 14 to 16 in claims.json, SCORECARD and LOG after the instrument
  check and did not edit the counter. Captured-by: none — every C2 control scores admitted 0, so no control sits at the
  threshold (w1 RevClaimsFreeze F2, w1 MutC2Counter m11: `TARGET 14→1` survives the battery). Disposition this round: the
  frozen bytes are not edited; C2 is judged on the stricter declared sentence (admitted 16, which also satisfies the
  counter's 14), and a reading of 14–15 would be reported as not met whatever the counter prints. Fix: QUALITY 98 — a
  freeze carries, for each numeric predicate, a boundary control one step short of the target that must exit 1.
  Shown able to fail: the boundary construction (the integration candidate with R17 marked `no`) scored on the frozen counter reads admitted 15, unmeasured 2, failing 0, predicate true, exit 0 while the declared predicate is false (`.ufo/waves/round-35/measure/c2-M1-boundary-15.json`) — the control QUALITY 98 requires would have exited 1 under the declared 16. The scratch commit it scored (`86d6df42…`) lives only in the L1's scratch clone; the construction is the one-line change above applied to the entry at `083c5c643be7aa5965a5de3458a32ed0d289ead3`, and w2 CritC2Boundary rebuilt it independently and reproduced admitted 15 / predicate true (`.ufo/waves/round-35/w2/CritC2Boundary/`), and with a TARGET-16 copy of the counter predicate false.
- **M2 — instrument (screen rule unreachable for short lines).** Evidence: the first pre-freeze run of control J2
  (screen-all) left 31 candidates unaccounted with `screen-quote` findings, because the round-34 quote rule demands
  4–25 words and >= 20 non-space chars and 31 candidate lines (bare paths, headings) are shorter. Captured-by: the J2
  control itself (QUALITY 87's screen-all red state) — caught before data; fix landed in the freeze (whole trimmed line
  admitted as the quote when the line is that short). Shown able to fail: J2 31 → 0 findings between the two pre-freeze
  runs — the 31-finding receipts were overwritten by the second pre-freeze run and are committed nowhere (w2
  RevLessonMistakes); the re-derivable red state is w1 MutC1Counter's mutant that removes the short-line clause, which flips
  control J8 (exit 0 → 1) on the frozen controls (`.ufo/waves/round-35/w1/MutC1Counter.md`).
- **M3 — overclaim in a frozen instrument (loopback).** Evidence: `c2-firefox-bidi.mjs:57-58` says the live leg is
  "loopback FIXTURE only"; w1 SentinelFirefoxEgress measured three outbound TLS sockets per launch. Captured-by: none
  (no egress observation in any control). Fix: the lane driver sets the DNS-off prefs and the integration run sampled 0
  non-loopback sockets; the counter's leg is a recorded limit, routed to the next counter amendment. QUALITY 100.
- **M4 — instrument trust (caller-supplied binaries).** Evidence: w1 CritC2Counter reached `admitted 16, failing 0,
  binding null` with a fake geckodriver and a `--version` stub passed through `--firefox` / `--geckodriver` and synthetic
  transcripts from the same emulator. Captured-by: the measurement rule — `measure.sh` passes neither flag and records
  both binaries' `--version` and sha256 in provenance; QUALITY 99 makes that comparison a criterion. Routed: the counter
  amendment pins the binary digests.

## Errata intake (round-34 closure routed defects 1–8)

1. Corrections sweep — landed: `corpus/README.md` EOF block citing `:794`/`:799`.
2. Adjacency carried claim — C1 this round (SIDE floor and third-lane clause frozen before any target; J2–J8 scored);
   the 9 unguarded round-34 C1 counter clauses are superseded by the v3 counter, whose own unguarded clauses w1
   MutC1Counter lists (9 of 13 mutants survive) — routed with the C1 counter amendment.
3. Round-34 C2 counter amendment — not claimed; carried.
4. Round-33 w2 U01–U28 — each has a disposition at `.ufo/waves/round-35/w1/ScribeUDispositionsA/dispositions.md`
   (U01–U14: U08 closed by `b44b964d`; U01–U07 routed to the first round whose freeze leaves the BiDi gate free; the
   prose items routed as corrections) and `.ufo/waves/round-35/w1/ScribeUDispositionsB/dispositions.md` (U15–U28: all
   still hold at the freeze, 36/36 byte checks; routed). Accepted as dispositions, not as fixes.
5. S125 cadence — routed again with reason (§Gate registry log).
6. Precision — landed: `corpus/lessons/round-34.md` EOF corrections (S131 span 244-248; the kake:411 note cell; the
   RFC 4122 refusal basis).
7. Calibration counter v4 — not claimed; carried.
8. Misroot — every w1 seat path was built from the wave id `w1` (context: "the wave id is exactly `w1`"); the misroot
   sweep result is in the round report.

Note on `.ufo/waves/round-35/measure/driver-egress-sample.txt` (cited in §C2 above as "0 non-loopback sockets"): the file
is 0 bytes because the sampler printed only non-loopback lines and saw none; it records neither that the sampler ran
nor how many samples it took (w2 RevLessonMistakes, w2 SentinelDriverEgress). The driver's loopback-only claim rests on
w2 SentinelDriverEgress instead: a clean-clone driver run with `ss -tnpH` sampled every 200 ms, 0 non-loopback
firefox/geckodriver sockets, no write under `~/.mozilla`, `~/.cache/mozilla`, `~/.config/mozilla`, `~/.local/share/mozilla`
(`.ufo/waves/round-35/w2/SentinelDriverEgress/`).

S141 signature status (Gate supplement, w2 ReopenS140S141 D1-D2): the geckodriver v0.37.1 linux64 `.asc` verifies Good
by subkey `09BEED63F3462A2DFFAB3B875ECB6497C1A20256`, which the Mozilla KEY served under S140's directory
(`https://ftp.mozilla.org/pub/firefox/releases/158.0.1/KEY`, 31,916 B, sha256 prefix `b0c538f0`) marks revoked ("We no
longer trust this key.", revocation signed 2026-08-06T11:14:10Z) — a local `gpg --verify` with a scratch GNUPGHOME
(`.ufo/waves/round-35/w1/ScribeSrcMozRelease/verify-gpg.txt`). S141's `scope`/`teaches` were narrowed at the w2
integration to the asset/digest facts its own page grounds; the trust fact is time-varying and recorded here only.
Other w2 row fixes (cells of rows added this round): S135 anchor sweep count `moz:firefoxOptions` 1 → 0 (ReopenS134S135);
S136 anchor rejection lines → `:309-312` (ReopenS136S137); S139 anchor gains the page's last-modified stamp and the
`sharedId` line 1744 (ReopenS138S139). The S136 Gate quote above writes the source's `||` operator as `¦¦` so the
lesson table parses.

## C1 gate decisions — wave 2

- The single new map row was attacked twice and the attackers disagreed: w2 CritRowKagiA — withdraw (kagi's line is its
  own CLI rule, its refusal routes to no lane, the vault-DOM ban is shared; QUALITY 91, 97); w2 CritRowKagiB — holds
  (tabi's side at `SKILL.md:2970` is truthful and the gate verifies the row). The integrator withdrew the row on kagi's
  bytes (QUALITY 91: recorded reversal with its ground): `SKILL.md:40` at pin `69b61db4…` names no lane for the refusal,
  and the w1 independent scan (ConnBoundaries watchlist 3) had already called it same-surface. Screened
  `same-surface secrets-vault-ops`; `SKILL.md` §Round 35 carries an append-only withdrawal note.
- Screens: eight attack seats re-read all 382 screen rows at their pins (CritScreenKaidokuA/B, Kumitate, Kagi, Kake,
  KotobaMixed, MadoTsukuroi, ThirdNoClaim): 0 should-map, every quote verbatim; two low label notes (one kaidoku reason,
  one kagi ledger note) do not change accounting. w2 ConnMissedBoundaries re-hunted all 382 for a defensible new
  boundary and found none.
- Result: unaccounted 0, newMapped 0 — the frozen target (newMapped >= 2) is missed; honest stop.

## Census delta (moved here from `corpus/knowledge/browser-surface-census.md`)

Firefox 158.0.1 is present on this host as a user-local unpack (`~/.local/opt/firefox-158.0.1`, `~/.local/bin/firefox`
symlink; `firefox-bin` sha256 `46e2c204ab769f1cb49fea4918e134c84829d2ab38278fb087a072f77b6e7294`) and geckodriver 0.37.1 at
`~/.local/bin/geckodriver` (sha256 `f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f`); `pacman -Q firefox`
still reports not found; `~/.mozilla` still holds only the 1Password NMH json; Firefox runs created empty shells under
`~/.config/mozilla/firefox/` and `~/.cache/mozilla/firefox/` (w1 ScoutFirefoxCensus, before the DNS-off/driver scrub
was measured). So `corpus/knowledge/browser-surface-census.md:34` and `:95-96` ("Firefox absent", "never profiled") are
capture-scoped history, not live state. The append to the census file itself was withdrawn (M5).

## Mistakes (wave 2)

- **M5 — no-harm blind spot (a pinned file edited by a correction).** Evidence: the w1 integration `083c5c643be7aa5965a5de3458a32ed0d289ead3` appended a
  census correction to `corpus/knowledge/browser-surface-census.md`; `scripts/check-freshness.mjs --worktree` reads
  `clean 34/34` at the baseline and `content_drift` (exit 1) at `083c5c643be7aa5965a5de3458a32ed0d289ead3`, because
  `corpus/evidence/fleet-round-1-freshness/pins.tsv:7` pins that file's bytes (w2 RevCorrections D1). The frozen
  `measure.sh` runs check-freshness only through its `--self-test` loop, so the round's own no-harm sweep was green.
  Captured-by: none in the frozen instrument; w2 RevCorrections caught it. Fix: the append was withdrawn (file bytes
  equal the baseline again; `check-freshness --worktree` → clean 34/34 at the w2 integration) and QUALITY 101 makes the
  production run of every gate with a production mode part of the no-harm reading. Shown able to fail: the
  `083c5c643be7aa5965a5de3458a32ed0d289ead3` reading above (exit 1).

## C2 gate decisions — wave 2

- Re-measurement: w2 RerunC2 ran the frozen counter twice, minutes apart, at the w1 integration — admitted 16, failing
  0, binding null both times; binaries' `--version` and sha256 equal the install receipts (QUALITY 99).
- Holds: w2 CritReceiptTranscripts (receipt and transcripts consistent, two real sessions), w2 RevDriverCode (imports,
  independence, wire order, 9222 refusal, scrub), w2 SentinelDriverEgress (0 non-loopback sockets, no home writes),
  w2 CritEntryClaims (no unsupported sentence; one S007 attribution overreach fixed to S138), w2 CritEntryDifferences
  (D1–D11 present in the committed transcripts; four precision defects fixed in the entry: Chromium request-id shapes,
  getTree key count seven, Chromium's nested `chrome.chromedriverVersion`, the n=1 wall times 2,332 / 1,054 ms),
  w2 CritCapabilityRow (a new capability, not the round-32 row re-parameterised; wording: "loopback-only" is a measured
  outcome, so the row names the prefs and cites the sample), w2 ReopenS134–S141 (all URLs re-fetched byte-identical;
  cell fixes above).
- Limits recorded, routed to the next counter amendment (not fixed: the counter is frozen): w2 MutDriverReceipt M2 —
  run2 replaced by a byte-copy of run1 with the session id and websocket segment rewritten still reads admitted 16
  (the counter binds distinct paths, digests and session ids, not per-run content such as ports or request ids);
  w2 RevDriverCode F1 — the driver's run deadline only closes the socket, so a hang can skip the process-group kill
  (orphan path, not evidence-corrupting) and F2 — the driver header says it never writes the lane tree while its default
  `--out` is the lane's evidence dir (accurate: it writes only `--out` and TMPDIR). The driver bytes are unchanged at the
  w2 integration because the receipt binds `driverSha256`.

## Adjacency: keep, split the meter (planning input)

w2 ConnAdjacencySaturation: the axis is not saturated — the map grew 10 → 13 → 16 rows over rounds 33-34 and every
sweep closed at unaccounted 0 — but the discovery meter on a frozen pool is: newMapped targets missed three rounds
running (4→3, 3→1, 2→0 after this round's withdrawal), yield per candidate 5.8% → 1.5% → 0%. Planned: split the
adjacency claim meter into completeness (every sibling line on the lane's ground accounted, re-swept on sibling drift)
and delta discovery (new rows only from sibling commits after the pins), never again a fixed newMapped quota on a closed
pool.
