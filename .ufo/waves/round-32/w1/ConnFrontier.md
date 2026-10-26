# ConnFrontier — round 32 w1, frontier pattern scan (planning data-walk for the L1)

## Verdict

A working BiDi capability on this host (chromium 154.0.8037.97 + chromedriver
154.0.8037.97, `webSocketUrl: true`, loopback only — verified below) moves the
frontier map at exactly two of the six named Frontier items and leaves the other
four unchanged **in effect**: it (1) unlocks the first plausible instrument for
the **Extension↔daemon link** — BiDi's `webExtension` module (WD §7.10) is the
standardized extension-install path CDP lacks, aimed at the lane's oldest
never-observed state (`extension_connected:false` in every `/status` sample on
record), and (2) gives the **rate half of Rate/ToS** a second, standards-based
loopback instrument (network events / intercepts / data collectors, matrix rows
R10–R13) to exercise the `RateLimit` / `X-RateLimit-*` fields that no run has
recorded. **Native WebMCP** has no BiDi module and stays CDP-anchored; **Real-site
journeys** are policy-gated (loopback-only perimeter), not transport-gated;
**bfcache** stays CDP-held with only a narrower BiDi witness surface available;
the **Chromium 156 runtime** is blocked on build availability plus a
version-coupled chromedriver, not on protocol support. Of round-31's seven routed
defects the round-32 plan closes #3, #5, #7 by curation/process, closes #1 only
in part (M11 refusal + m4 class claimed; word-numeral / `<name>_cases=` tallies
and the merged-bullet survivor carried), carries #2 and #6 as declared
`notClaimed`, and routes #4 to w1 scribe curation — where the file's own
denominator is E1–E43 = 43 items (21 bold-carried / 8 corrected-here / 4
no-action), so the routed "27" needs a stated derivation. One bounded move falls
out for the L1's next-round planning: a BiDi `webExtension.install` loopback
handshake probe (round-33 candidate), which works **adjacency** (lowest
non-retired axis, 8) and **coverage** without touching any other axis.

## Table A — Frontier item → BiDi effect → evidence path

Effect vocabulary: **unlocks** = BiDi provides an instrument the item needs that
CDP lacks; **changes-instrument** = BiDi provides a second, standardized way to
measure something already held; **no effect** = the item's blocker is policy,
version, or a missing module, not transport.

| Frontier item (current status) | BiDi effect | Evidence path |
|---|---|---|
| Extension↔daemon link (open; handshake never observed up; daemon currently down) | **Unlocks** (round-33 candidate, not a C1 consequence): BiDi `webExtension` module (WD §§7.1–7.10) is the standardized extension-install command CDP lacks; a throwaway-profile BiDi session could install the kimi-webbridge extension and sample loopback `/status` for `extension_connected:true` — the first instrument that can close this gap without user action | `corpus/knowledge/webdriver-bidi-capability-matrix.md` §1 (ten modules incl. `webExtension`, §7.10); `corpus/knowledge/webbridge-revival-assessment.md:182-200` ("handshake has never been observed up"; docs route to user); `corpus/knowledge/webbridge-daemon-disposition.md:128-134`; `corpus/README.md` kaika frontier row (open); live check this seat: `ss -ltn \| grep :10086` → not listening (exit 0). Limits: R1–R17 and the frozen FIXTURE do not exercise webExtension; a fixture-daemon positive would discharge the instrument question, not prove a real-daemon handshake |
| Native WebMCP (held, Chromium 154 loopback, CDP `WebMCP.*`) | **No effect** — BiDi defines no WebMCP module; held ground stays CDP-anchored. `script.evaluate` (R6) is transport substitution, not a new surface | `corpus/knowledge/webmcp-chromium-loopback-round-16.md`; `corpus/knowledge/webmcp-invocation-round-17.md`; matrix §2 R6; `corpus/README.md` rounds 16–18 frontier restatements (real-site WebMCP etc. still open) |
| Rate/ToS surface (rate half docs-held w/ decision table D1–D13; ToS half open; runtime open) | **Changes-instrument on the rate half only**: BiDi network module (R10 events, R11 `ResponseData`, R12 collector-gated bodies, R13 intercepts) is a standards-based second instrument to record rate-shaped responses (429, `RateLimit` / `X-RateLimit-*`) on loopback — the round-30 restatement says the CDP fixture's stop-and-report predicate does not record those fields and no run has exercised them. C3/C6 approval gates unchanged; **ToS half untouched** | matrix §2 R10–R13; `corpus/knowledge/rate-limit-policy-fields.md`; `corpus/knowledge/rate-signal-decision-table.md` (D1–D13); `corpus/README.md` round-30/31 frontier rows + a2w1 correction (rate half only, no ToS doc mined); `corpus/knowledge/external-class-fixture-v2.md` §4–§5 |
| Real-site journeys (open by rule) | **No effect** — the blocker is the loopback-only approval perimeter, not the driver transport; BiDi standardizes the driver, grants no approval. Round-23 CSRF and round-27 redirect vocabulary remain "documented, not measured" | `corpus/README.md` round-23/round-27 restatements; `corpus/knowledge/interaction-approval-table.md` C2–C6; claims.json C1 ("loopback fixture only"); matrix §3 (loopback-first perimeter) |
| bfcache (runtime-held round 25, CDP `Page.frameNavigated type=BackForwardCacheRestore`) | **Changes-instrument with a narrower witness surface**: A→B→A can be replayed over BiDi `browsingContext.traverseHistory` (R14, delta-based) and "zero requests back to A" witnessed via BiDi network events (R10); but the restore-type discriminator has no WD-defined BiDi counterpart — only page-side witnesses (`pageshow.persisted` via `script.evaluate`, R6). A BiDi arm would be a parity probe, not an upgrade of the held claim | `corpus/knowledge/bfcache-runtime-observed-round-25.md` §What-is-observed; `corpus/knowledge/navigation-history-bfcache-evidence.md` §2–§5; matrix §2 R14, R10, R6 |
| Chromium 156 runtime (open; no 156 build on this host) | **No effect now; cheaper future recheck.** The capability is 154-pinned (verified both binaries 154.0.8037.97 below); the frozen receipt contract (`tabi-bidi-receipt-v1`, t3-binding pins `chromedriverVersion`) re-runs against any future build. The real gate for a 156 runtime is a matching 156 chromedriver, not protocol support | `corpus/knowledge/chromium-156-release-pin-recheck.md` §Limits; `corpus/README.md` round-29 frontier row; `scripts/check-bidi-runtime.mjs:1-75` (t3-binding); `/usr/bin/chromium --version` + `/usr/bin/chromedriver --version` (this seat, exit 0 both) |

Cross-cutting note for the L1: matrix **R16 (stop-loading / nav-cancel) has no BiDi
command** (`x2-no-counterpart` in the frozen counter) — C1 does not repair the
lane's weak CDP stop behavior (matrix row 16: "Lane's CDP stop behavior was weak
(0/8 abort-marked)"). Carried as a known gap after C1; do not let a green C1 read
as nav-cancel coverage.

## Table B — round-31 routed defects 1–7 → round-32 plan disposition

Disposition vocabulary: **closed-claim** (a claim's predicate covers it),
**closed-curation** (frontier/curation step, no counter), **closed-process** (the
freeze/process itself answers it), **partial** (one sub-part claimed, rest
carried), **carried** (declared `notClaimed`), **routed** (owned by named w1
seats). Source of record: `.ufo/waves/round-32/claims.json` (frozen 4181fff).

| # | Defect (round-31 spotcheck :143-170) | Disposition | Evidence path |
|---|---|---|---|
| 1 | Calibration counter v3: word-numeral and `cli_cases=` tallies; refuse a failed self-test's summary as oracle (M11); kill the merged two-bullet survivor | **Partial** — C2 freezes v3 with the M11 refusal + new m4-nudge-state class (claimed); word-numeral, `<name>_cases=`, and the merged-bullet survivor are `notClaimed` → carried, to be restated in the round-32 SCORECARD planned block | claims.json C2 `type`/`before`/`target`; `notClaimed[0..1]`; `baseline/c2-J1-do-nothing.json` (18 mismatches); frozenDigests sha `77b5c8ed…`; the three m4 lines verified this seat: `SCORECARD.md:1473,1515,1576` all say "nudge inactive" |
| 2 | Decision-table counter v2 (distinct (source, quote) pairs; unit/bound word in quote; M10) | **Carried** — `notClaimed[2]`; no lane file this round | claims.json `notClaimed`; priorClosure (2) |
| 3 | S119 anchor "RFC 9309 (June 2022)" vs bytes "September 2022"; entry `recheck: 180d` vs registry `365d` | **Closed-curation** — S123 (superseding row) planned in the frontier step, written only after opening this round; the recheck half is already ruled at `rate-signal-decision-table.md:180` ("The registry is the operative cadence: read 365d") — verified this seat; S119 row stays immutable, `used-by` reciprocity per QUALITY 75 | claims.json `frontierStep.sources`, priorClosure (3); `corpus/SOURCES.md:133` (S119 mined, recheck 365d); `rate-signal-decision-table.md:180`; w1 roster seat `ScribeS119` (`w1/swarm-registry.json:78`) |
| 4 | 27 carried w1 findings in `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` | **Routed** — priorClosure assigns disposition to wave-1 scribes (`ScribeErrataA/B/C` in the w1 roster); assimilation: none. Denominator finding (verified first-hand this seat, refining sibling ScoutRoutedDefects): the file holds **E1–E43 = 43 items**, with bold dispositions `**Carried**` ×21, `**Corrected here**` ×8, `**No action**` ×4 — the routed "27" is not an item count; its derivation is `[INFERENCE]` (likely a pre-integration count) and the scribes must state it | claims.json priorClosure (4), `assimilation`; `w1/swarm-registry.json:211-228`; `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` (head + grep counts, exit 0); sibling cross-check `.ufo/waves/round-32/w1/ScoutRoutedDefects.md` |
| 5 | Control captures name a resolving revision (or commit tree digest) | **Closed-process** — every round-32 control records the scratch-clone commit AND its tree digest in `baseline/<control>.provenance`; attack/measure seats must copy the pattern for any junk tree | `baseline/README-receipts.md` lines 3-6; claims.json priorClosure (5); the seven `.provenance` files in `.ufo/waves/round-32/baseline/` |
| 6 | Round-30 defects 3–4 (gate-mutants + frontier-admission counter v2; release-pin counter v2) | **Carried** — `notClaimed[3]` ("round-30 routed defects 3-4"); restate in the round-32 SCORECARD planned block | claims.json `notClaimed`; priorClosure (6) |
| 7 | Scratch hygiene (five a2w1 seats left ~145 MB each under `$HYAKU_SCRATCH/tabi-r31/`) | **Closed-process** — every round-32 seat prompt requires deleting its scratch; the L1 removes `$HYAKU_SCRATCH/tabi-r32` after landing | claims.json priorClosure (7); this seat's own contract; this seat created no scratch (nothing to delete, see Hygiene) |

## One bounded proposal (connector move) — round-33 candidate

**Move:** a BiDi `webExtension.install` loopback handshake probe for the
Extension↔daemon frontier item. Install the kimi-webbridge extension into a
throwaway BiDi session profile (chrome-family test profile, loopback only),
serve a `/status`-shaped loopback fixture (or sample the real daemon iff it is up
at run time — GET `/status` only, shape-only, no `/command` POST by rule), and
record `extension_connected` / `extension_id` at t≈0, +30 s, +5 min as a committed
receipt extending the round-32 `tabi-bidi-receipt-v1` discipline.

- **Affected axes:** adjacency (8 — lowest non-retired; links the new BiDi
  capability to the webbridge substrate the lane shares with siblings) and
  coverage (a new evidence-operation class: extension lifecycle over BiDi, which
  no R1–R17 row covers). No other axis touched: loopback-only, throwaway
  profile, `/status` shape-only, no session material, no external site —
  autonomous-now under the round-3 approval table's A-class gates.
- **Why non-obvious:** every prior reading of this item routes it to "user
  action" because no instrument could load the extension into a controlled
  profile; CDP has no extension-install command. The WD's tenth module is
  exactly that instrument, and this round's C1 is what puts it on the host.
- **Risks:** MV3 service-worker attach timing needs a state wait; extension
  install requires the bundle path and the `1.11.3` (manifest/skill) vs `2.0.23`
  (daemon/extension) reconciliation (census U6) may need a named disposition; a
  fixture-daemon positive discharges the instrument question, not a real-daemon
  handshake — the report must name that limit. Falsifier: `extension_connected:false`
  at +5 min with the browser running (mirrors `webbridge-revival-assessment.md:211-217`).
- **Verification:** receipt schema extension with `webExtension.install` frames +
  `/status` samples; counter-side predicate like t3-binding (byte-deterministic
  fixture screenshot) to bind the run to a real rendering.

## Evidence — commands run (all read-only) and exit codes

Lane reads (tool `read`/`grep`, no exit codes to paste): `.ufo/waves/round-32/claims.json`
(lines 1-100), `.ufo/waves/round-32/baseline/README-receipts.md`,
`corpus/README.md` (full), `corpus/knowledge/webdriver-bidi-capability-matrix.md`,
`corpus/lessons/round-31-verifier-spotcheck.md` §Routed defects,
`scripts/check-bidi-runtime.mjs:1-75`, `corpus/knowledge/bfcache-runtime-observed-round-25.md:1-43`,
`corpus/knowledge/webbridge-revival-assessment.md` (handshake §5),
`.ufo/waves/round-32/w1-spec.json`, `.ufo/waves/round-32/w1/ScoutRoutedDefects.md` (sibling cross-check),
`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:1-43`.

Shell commands (cwd = lane root unless noted):

```
$ sed -n '/^## 2\. The matrix/,/^## 3\./p' corpus/knowledge/webdriver-bidi-capability-matrix.md | grep -cE '^\| [^|]+ \| [^|]+ \| [^|]+ \| .* \| no \|$'
17                         # 17 matrix rows, every one 'locally measured: no'  exit=0
$ grep -c 'locally measured' corpus/knowledge/webdriver-bidi-capability-matrix.md
5                          # phrase occurrences (header + §1 note + rows)      exit=0
$ /usr/bin/chromium --version
Chromium 154.0.8037.97 Arch Linux                                         exit=0
$ /usr/bin/chromedriver --version
ChromeDriver 154.0.8037.97 (b510e9d7…-refs/branch-heads/8037@{#1673})     exit=0
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline -3
4181fff round-32: freeze claims C1 … C2 …
5ad1fcb round-32: counter fix before freeze …
2f8535c round-32: freeze counters …                                        exit=0
$ ls corpus/knowledge/ | grep -E 'bfcache|rate|chromium-156|webmcp|webbridge|webdriver-bidi'
(all 16 evidence notes listed in Table A exist)                            exit=0
$ ss -ltn 2>/dev/null | grep ':10086' || echo 'daemon: not listening'
daemon: not listening                                                      exit=0
$ grep -n '365d' corpus/knowledge/rate-signal-decision-table.md | head -1
180:  … The registry is the operative cadence: read 365d.                  exit=0
$ sed -n '1473p;1515p;1576p' SCORECARD.md
(three round-block lines all reading "… nudge inactive …")                 exit=0
$ find /home/vgpnk/Projects/shokunin -maxdepth 4 -name 'AXES.md' -not -path '*/.git/*'
/home/vgpnk/Projects/shokunin/AXES.md   (fleet-level; nudge rule §The stagnation nudge:66-72)  exit=0
$ grep -cE '^- \*\*E[0-9]+' .ufo/waves/round-31/a2w1/ScribeErrata/errata.md
43                                         # E1–E43                                       exit=0
$ grep -oE '\*\*(Carried|Corrected here|No action)\*\*' .ufo/waves/round-31/a2w1/ScribeErrata/errata.md | sort | uniq -c
21 **Carried** / 8 **Corrected here** / 4 **No action**                     exit=0
$ pgrep -fa 'chromedriver|chromium'
1371 /usr/bin/earlyoom -r 3600 … --prefer (^|/)(java|node|chromium|python3?)$
(only the system earlyoom pattern mentions chromium; no browser/driver started by this seat)  exit=0
$ ls -d /fast/scratch/hyaku/tabi-r32/ConnFrontier
no scratch dir created   (no lane scripts run → no clone needed)            exit=0 (|| echo)
```

No lane scripts were run (frontier scan only), so no scratch clone was created;
no browser was launched (`--version` only); no network fetches were made; no
tools were installed. Nothing was written outside this report and
`.ufo/waves/round-32/w1/ConnFrontier/` (its `evidence.txt` mirrors the command
transcript above).

## Unknowns

- Whether a fixture-daemon positive on the webExtension probe would be admitted
  as "handshake observed up" or only "instrument discharged" — a round-33 gate
  question, `[INFERENCE]` from `webbridge-revival-assessment.md:211-217`.
- The derivation of routed defect 4's "27" — not reproducible from
  `errata.md` (43 items; 21 bold-carried); stated as `[INFERENCE]` above.
