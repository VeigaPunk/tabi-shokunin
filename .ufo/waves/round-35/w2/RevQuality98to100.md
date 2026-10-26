# RevQuality98to100 — review of QUALITY criteria 98-100 (round-35 w2, frontier)

Seat: RevQuality98to100 (leaf, findings only). Pin under review: w1 integration `083c5c643be7aa5965a5de3458a32ed0d289ead3`
(lane worktree HEAD equals this pin; `git status --porcelain` over every file read below is empty, so all line numbers are
pin-accurate). Freeze cited by the red states: `a4bfef0f75027c915e715649950b1d46dcb33d83`.

## Verdict

**Holds.** All three criteria pass all four checks. Each is a checkable bar, not prose advice: 98 names two mechanically
checkable clauses (a boundary control one step short of each declared numeric predicate that must exit 1, and a
threshold-constant-vs-declared-sentence readback before the freeze lands), 99 names the concrete records and comparison
(path, `--version`, sha256 per launched binary, equal to the registered install receipt), 100 names the observation and
the citation duty (socket sample during the run, cited by whatever asserts loopback). Every red-state citation opens to
real bytes at the pin — counter `:54`/`:77`/`:57-58`, `claims.json` C2 predicate and its five controls, w1
RevClaimsFreeze F1-F2, w1 MutC2Counter m11, w1 CritC2Counter E3, w1 SentinelFirefoxEgress, entry §5 D11, SOURCES
S140/S141, lesson M1/M3/M4 — and each criterion's lesson source is named and bidirectional (the lesson's Fix line names
the criterion back). No duplication of or contradiction with criteria 83-97: 96 (constructions the *previous* lesson
names), 89 (admission populations), 86 (row-count semantics and driver-vs-gate identity) and 85/95 (selftest oracle,
mutation-kill cases) are adjacent regimes, none governs threshold proximity, binary provenance, or egress. Two advisory
notes, neither unseating a criterion: 98's boundary-control clause also indicts C1's own freeze (its red state names
only C2), and 99's "install receipt" equality is ambiguous between artifact-level and binary-level digests. Both are
fixable by an append-only clarification; neither is a defect in the criteria as bars.

## Criterion 98 — holds (two advisory notes)

**Checkable bar.** Two clauses, both checkable: (a) the freeze's control set must contain, per declared numeric
predicate, a construction scoring one step short of the target whose run exits 1; (b) the counter's threshold constant
must equal the declared sentence's number at freeze time. The check is demonstrated executable:
`.ufo/waves/round-35/measure/c2-M1-boundary-15.json` (committed at the pin) is exactly such a boundary construction —
`"admitted":15, "failing":0, "unmeasured":2`, exit 0 on the stale counter, i.e. exit 1 under the declared 16.

**Red state cites real bytes — all verified.**
- `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:54` = `//   admitted >= 14.` (frozen predicate sentence) and `:77`
  = `const TARGET = 14;`; `:462` computes the printed predicate from TARGET. Verified by grep at the pin.
- `.ufo/waves/round-35/claims.json` C2 `predicate`: `"no entry finding AND no binding finding AND failing == 0 AND
  admitted >= 16"`; `target`: "admitted 16 of the 16 matrix rows…". Verified.
- "all five C2 controls score admitted 0": `claims.json` C2 `controls` c2-J1…c2-J5 each carry `"admitted": 0`
  (J2-J5 also `failing 16`); w1 RevClaimsFreeze F2 states the same consequence (any TARGET ≤ 16 leaves every control's
  exit unchanged). Verified.
- "w1 MutC2Counter m11 (`TARGET 14→1`) survives them": `.ufo/waves/round-35/w1/MutC2Counter.md:74` =
  `| m11 | TARGET 14→1 (:77) | 7cc7…→b98ba5… | SAME | SAME | SAME | SAME | SAME | **survived** |`. Verified.

**No duplication/contradiction with 83-97.** 96 requires the control set to include constructions the *previous
round's lesson* names — 98 adds a threshold-proximity control and a constant readback, a different failure mode (96's
red state is a missed named construction; 98's is a threshold no control can see). 89's three populations govern what
an admitted count is read against, not where the threshold sits. No criterion in 83-97 mentions thresholds, boundary
controls, or constant-vs-sentence readback. No contradiction: both 96 and 98 are pre-data control duties and can bind
the same freeze simultaneously.

**Lesson source named.** `corpus/lessons/round-35.md` M1 ("freeze-consistency (counter threshold ≠ declared predicate)")
exists and matches byte for byte (cites claims.json C2 `admitted >= 16`, counter `:54`/`TARGET = 14`, RevClaimsFreeze
F1, the all-controls-admitted-0 capture gap, and m11), and its Fix line names QUALITY 98 back ("a freeze carries, for
each numeric predicate, a boundary control one step short of the target that must exit 1"). Source line also cites w1
RevClaimsFreeze F1-F2, both present and matching.

**Advisory 1 (low, completeness of the red state).** The boundary-control clause indicts C1's freeze too, and the red
state does not say so. C1's declared predicate (`claims.json`: "adjacency verdict clean AND unaccounted == 0 AND
newMapped >= 2") is numeric; one step short is `newMapped 1` with `unaccounted 0`; the frozen C1 controls J1-J8
(`claims.json` C1 `controls`) sit at newMapped 0 (J1-J7) or 2 (J8, predicate true) — no control at 1. The boundary
state is exercised only later, by the integration candidate itself (wave fact: counter at `083c5c6` reads `unaccounted
0, newMapped 1, predicate false`), not by any frozen control. The readback clause, by contrast, correctly indicts only
C2: the C1 counter's own readback holds (`c1-adjacency-sweep-v3.mjs:62` `//   newMapped >= 2.`, `:80`
`const NEW_TARGET = 2;`, `:307` code — 2 == 2). A reader applying 98 to round 35 should flag both freezes; the red
state names one.

**Advisory 2 (low, wording).** "One step short of the target" is unambiguous for a single `>= N` clause (the
demonstrated C2 case: admitted 15) but C1's predicate is compound (`unaccounted == 0 AND newMapped >= 2`) and the
criterion does not say which clause steps or whether both must. The demonstrated example disambiguates in practice;
an append-only clause ("for a compound predicate, one step short on each numeric clause") would remove the ambiguity.

## Criterion 99 — holds (one advisory note)

**Checkable bar.** The records exist and the comparison is executable: `.ufo/waves/round-35/measure.sh:29-30` records
each binary's `--version` line and sha256 into the measurement provenance (`firefox … sha256 …`, `geckodriver … sha256
…`), and the round registered the comparison targets — `corpus/SOURCES.md:154` (S140, Firefox 158.0.1 release
directory: SHA256SUMS 551,210 B with the `firefox-158.0.1.tar.xz` line, detached signature, release KEY) and `:155`
(S141, geckodriver v0.37.1 release assets and digests) — plus binary-level pins in the entry
(`corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:6`: "host binaries pinned by `--version` and sha256:
geckodriver 0.37.1 `f831b7e6…`, Firefox 158.0.1 `firefox-bin` `46e2c204…`"). I verified the pins against the real
binaries: `sha256sum` gives geckodriver `f831b7e61454804e…` and `firefox-bin` `46e2c204ab769f1c…` — both match the
entry's prefixes.

**Red state cites real bytes — verified.** `.ufo/waves/round-35/w1/CritC2Counter.md` E3 ("full-synthetic claim
(headline)"): "a scripted fake geckodriver (Node HTTP + WebSocket emulator) and a fake `--version` firefox stub …
passes the counter end-to-end with `admitted 16, failing 0, binding null`, exit 0, with zero real Firefox or
geckodriver processes ever launched", binaries "passed through `--firefox` / `--geckodriver`" whose only preflight is
`spawnSync(b, ['--version'])` exit 0 (counter `:187`). Matches the criterion's red state exactly. S140/S141 exist as
`mined` rows (SOURCES.md:154-155) and are the receipts the criterion points at.

**No duplication/contradiction with 83-97.** 86 governs what an admitted row count means (distinct surfaces, distinct
transcript digests, driver digest ≠ gate's, driver imports) — a counting and identity regime; 99 governs binary
provenance against a registered install receipt — a trust regime. A reading can satisfy 86 and fail 99 (E3 did: the
fake driver was neither gate nor counter, digests were pairwise distinct, and the count was still worthless). No
criterion in 83-97 mentions caller-named binaries, `--version`, or install receipts. No contradiction with the
measurement rule ("binaries recorded in provenance") — 99 is that rule promoted to an admission bar with the equality
duty added.

**Lesson source named.** `corpus/lessons/round-35.md` M4 ("instrument trust (caller-supplied binaries)") exists and
matches (E3's construction, the measure.sh capture, "QUALITY 99 makes that comparison a criterion", counter amendment
routed). Source line cites M4 and S140/S141 — all present.

**Advisory (low, wording).** The equality "those equal the install receipt (signed checksum or release digest) the
round registered" is ambiguous between two digest levels. The registered signed checksums are artifact-level: S140's
quote is the SHA256SUMS line for `firefox-158.0.1.tar.xz` (`dce45470…`), S141's are the geckodriver tarball digests —
a binary's sha256 can never equal its tarball's release digest, so read literally the bar is unsatisfiable. The
satisfiable (and evidently intended) reading is chained: measured binary digest == the binary-level pin the round
registered (entry `:6`), which is anchored to the signed artifact digest (S140/S141). The round holds every piece, but
no single file states the chain (entry `:6` pins the binaries without naming S140/S141; S140/S141 pin the artifacts
without the binary digests). An append-only clarification naming the chain would make the bar's comparison target
unambiguous.

## Criterion 100 — holds

**Checkable bar.** Two duties, both mechanically checkable and both demonstrated this round: the sampling duty
(SentinelFirefoxEgress sampled sockets PID-scoped with `ss` on a 0.2 s loop plus `strace -f -e trace=connect…` during
the run) and the citation duty (the entry, which asserts loopback, cites the sample).

**Red state cites real bytes — verified.**
- `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:57-58`, verbatim: `// The` / `// live leg runs geckodriver with
  --profile-root, HOME, TMPDIR and XDG_* inside that scratch,` / `// a free --websocket-port (never the 9222 default),
  headless, loopback FIXTURE only.` — the "loopback FIXTURE only" claim ends at `:58` exactly as cited.
- "w1 SentinelFirefoxEgress measured three outbound connections per launch": the report's Check 1 shows run 1 with
  three ESTAB `:443` sockets from the Firefox parent (`firefox.settings.services.mozilla.com` /
  `firefox-settings-attachments.cdn.mozilla.net` on Fastly `2a04:4e42:3b::347`, `content-signature-2.cdn.mozilla.net`
  on Google `2600:1901:0:8d82::`) and run 2 under strace with the same three `connect()` calls — "within the ≈2.0 s
  life of every run". Verified.
- The criterion's factual gloss matches the sentinel's measurements word for word: "geckodriver's recommended
  automation prefs" leave the attachments/signature base URL live (`remote.prefs.recommended.applied=true`; only the
  bucket *server* is redirected to `data:`), "`network.dns.disabled` + `network.trr.mode 5` measured 0" (fixE/fixE2:
  0 non-loopback connects on any port, 0 Mozilla lookups), "fixture on an IP literal" (gate `serveFixture` base
  `http://127.0.0.1:${port}`). Verified.

**No duplication/contradiction with 83-97.** No criterion in 83-97 governs egress, sockets, or loopback claims; 92
(integration hygiene) and 93 (404 receipts) are different objects. 100 is new ground and contradicts nothing — it
deliberately contradicts the *counter's frozen header*, which is its red state, not another criterion.

**Lesson source named.** `corpus/lessons/round-35.md` M3 ("overclaim in a frozen instrument (loopback)") exists and
matches (counter `:57-58`, three outbound TLS sockets, DNS-off prefs fix, "QUALITY 100"); the source line also cites
the entry's §5 D11, which exists at `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:271` and matches the
criterion's factual sentences, citing the committed sample `.ufo/waves/round-35/measure/driver-egress-sample.txt`.

**Note (not a finding).** The integrated deliverable already satisfies 100's citation duty: the entry asserts loopback
and cites the sample (D11); the receipt asserts no loopback claim at all (no `loopback`/`egress` string in
`corpus/evidence/round-35/bidi-firefox/receipt.json`). The counter's header remains the recorded limit (frozen bytes;
routed to the counter amendment per M3) — exactly the state 100's red state describes.

**Observation (outside the four checks; for the entry/lesson reviewers and any future tightening of 100).** The sample
the entry cites is a 0-byte file: `wc -c` and `git cat-file -s` on
`.ufo/waves/round-35/measure/driver-egress-sample.txt` at the pin both give 0, and the committed driver
(`scripts/bidi-firefox-loopback-round35.mjs`) contains no sampler (its only egress text is a comment, `:153`, citing
the w1 seat's measurement). So the committed record cannot by itself distinguish "sampled during the run, 0
non-loopback peers found" from "never sampled" — the sampling method and cadence live only in the runner's session,
not in the lane's bytes. This does not touch any of the four checks (100's red state and factual claims are grounded
in w1 SentinelFirefoxEgress's own evidence, which is real and detailed), but it shows 100's citation duty is
satisfiable in form by an empty file; a future tightening could require the sample record to carry the sampler's
method (command, cadence, PIDs sampled) so an empty result is distinguishable from no observation.

## Evidence (commands run, all in the lane checkout read-only; every exit 0)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
git log --oneline -3 && git rev-parse HEAD
  → 083c5c643be7aa5965a5de3458a32ed0d289ead3 (w1 integration; worktree == pin)
git status --porcelain -- corpus/QUALITY.md .ufo/waves/round-35/claims.json \
  .ufo/waves/round-35/counters/c2-firefox-bidi.mjs corpus/lessons/round-35.md corpus/SOURCES.md \
  corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md \
  .ufo/waves/round-35/w1/{RevClaimsFreeze,CritC2Counter,SentinelFirefoxEgress,MutC2Counter}.md \
  .ufo/waves/round-35/measure/
  → (empty) — every byte read is the pin's byte
grep -n "^9[89]\.|^100\." corpus/QUALITY.md
  → 98@681, 99@689, 100@696 (file ends at 702; no trailing corrections block)
grep -n "TARGET\|loopback FIXTURE only\|admitted >=" .ufo/waves/round-35/counters/c2-firefox-bidi.mjs
  → 54://   admitted >= 14. | 58:…loopback FIXTURE only. | 77:const TARGET = 14; | 462:…out.admitted >= TARGET;
grep -n "S140\|S141" corpus/SOURCES.md            → rows at :154, :155
grep -n "D11" corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md → §5 D11 at :271
grep -n "m11\|TARGET" .ufo/waves/round-35/w1/MutC2Counter.md → :74 m11 … **survived**
grep -n "NEW_TARGET\|newMapped >= " .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs
  → 62://   newMapped >= 2. | 80:const NEW_TARGET = 2; | 307:…out.newMapped >= NEW_TARGET;
sha256sum /home/vgpnk/.local/bin/geckodriver /home/vgpnk/.local/opt/firefox-158.0.1/firefox-bin
  → f831b7e61454804e… / 46e2c204ab769f1c… (== entry:6 pins)
grep -n "sha256|dce45470|loopback|egress" corpus/evidence/round-35/bidi-firefox/receipt.json
  → no loopback/egress assertion in the receipt
```

Reads: `corpus/QUALITY.md` (criteria 75-100 in full), `.ufo/waves/round-35/claims.json` (C1+C2 claims, controls),
counter `:1-123` and `:56-58` raw, `corpus/lessons/round-35.md` (full), w1 RevClaimsFreeze.md (full), w1
CritC2Counter.md `:1-93`, w1 SentinelFirefoxEgress.md (full), entry head + `:265-300`, `measure/c2-M1-boundary-15.json`,
`measure/driver-egress-sample.txt` (empty file, 0 bytes — the sample's content lives in the w1 seat's evidence; the
entry cites it as the integration run's sample record).

No tool installed or upgraded; no browser or driver launched; no lane file edited; no network fetch performed.

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-35/w2/RevQuality98to100.md` (this file)
- Output dir: `tabi-shokunin/.ufo/waves/round-35/w2/RevQuality98to100/` (empty — no receipts generated; all evidence
  is quoted above from pin-committed bytes)
- Scratch `/fast/scratch/hyaku/tabi-r35/RevQuality98to100` created and removed before yield.
