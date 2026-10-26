# Round 33 — the sibling-overlap sweep and the receipt-forgery gate v2 (2026-10-26)

Baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd`; counters and controls landed and frozen before data in
`e6b0a9074d434ccc307badd312ae7379d1193fea` (`.ufo/waves/round-33/claims.json`; receipts
`.ufo/waves/round-33/baseline/`). Waves: w1 build + first falsifiers (`.ufo/waves/round-33/w1/`, 36 seats in
`.ufo/waves/round-33/w1-spec.json`, R7), w2 falsify. Drafted inside w1 (ScribeLesson) and integrated by the L1 (TabiR33,
canonical planner seat); after-measurements are in the round report and `.ufo/waves/round-33/measure/`.

Both frozen claims are red at that baseline, from the committed receipts:

- **C1 (adjacency).** `baseline/measure-at-baseline/c1-at-b7d16fb.json` reads `predicate false, candidates 52,
  mapped 5, screened 0, unaccounted 47, newMapped 0`, map `clean` at 10 rows / 10 verified (R5). The 52 candidates
  are 42 kake, 4 kagi, 2 kaidoku and one each of tsukuroi, revenger, kotoba, kengaku (`baseline/c1-candidates.tsv`,
  52 lines, R4). The target is `unaccounted 0` and `newMapped >= 4`.
- **C2 (operability).** `baseline/measure-at-baseline/c2-at-b7d16fb.json` reads `predicate false, forgeriesAccepted
  8` of 8, `honest {H0: true, H1: true, H2: true}`, gate `--selftest` exit 0 with
  `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27`, `digestLiterals []` (R5). The target is
  `forgeriesAccepted 0` with H0/H1/H2 admitted at 16.

The five frozen digests in `claims.json` equal the blobs at the freeze commit — both counters, `baseline/controls.mjs`,
`measure.sh`, and `scripts/check-adjacency.mjs` (R1). All 7 controls in `baseline/controls-summary.json` exit 1 with
`predicate false` (R2).

## Gate

New registry rows S127–S129 (status `mined`, `recheck 90d` — not `on-release`, which would put a Chromium tag pin into
`scripts/check-release-pins.mjs`'s population, round-32 M10; used-by `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`).
Each is opened by a lane seat's own read-only HTTPS GET this round and pinned to the measured build: Chromium tag
`154.0.8037.97` for S127 and S129, and the Arch package `154.0.8037.97-1` (pinned by commit) for S128.
`corpus/SOURCES.md` holds 126 rows at the baseline (R6), so none of the three exists yet.

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S129 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/sandbox/linux/README.md | 2026-10-26T18:22:17Z (ScribeSrcSandbox; HTTP 200, 5,348 B raw `?format=TEXT`, sha256 `5a1ddc20bcfde734007c3b93200ce7e18c40a6f89c9a60683ec25649b208c2be`; decoded 4,009 B, sha256 `01c033462774302a7d8be970e8846e5d690e9b6afd3bf971e3de66863cccf9a2`) | §Overall Design lines 21-22: "We also generally use multiple layers of sandboxing, to achieve both confinement for the process and reduction of the exposed kernel attack surface"; no doc at this tag states the switch scope, so `sandbox/policy/switches.cc:42-43` (2026-10-26T18:22:54Z, HTTP 200, 4,268 B raw, sha256 `a614c36721de60e7ba883903b11f82f621e4eaa07d1224522e27b581c950b81a`; decoded 3,200 B, sha256 `b30542ce1440a6e226df07a37398adb5ee6dc38d475778d23b4a2acf27e39043`): "Disables the sandbox for all process types that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only." |
| S127 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc | 2026-10-26T18:24:21Z (ScribeSrcSession; `?format=TEXT` HTTP 200, 26,200 B, raw sha256 `e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4`, decoded 19,648 B, sha256 `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b`; the human page URL itself 267,504 B at 18:24:22Z) | `util.cc:42`, inside `GenerateId()` at 39-43: `return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb);` (8 tokens); call site `commands.cc:96`: `std::string new_id = GenerateId();` |
| S128 | https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD and https://raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c | 2026-10-26T18:26:26Z and 2026-10-26T18:23:50Z (ScribeSrcLauncher; both HTTP 200; PKGBUILD 18,285 B sha256 `a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be`, launcher.c 3,546 B sha256 `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624`; launcher.c bytes at tag `v8` identical to the commit fetch) | `launcher.c:26`: "path = g_build_filename(home, \".config\", CHROMIUM_NAME \"-flags.conf\", NULL);" (9 words); `launcher.c:124`: "return execv(CHROMIUM_BINARY, exec_args);" with `Makefile:5`: "CHROMIUM_BINARY  = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)" |

The L1 landed the three rows in the same revision as `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`, which
carries the literal tokens `S127`, `S128` and `S129` (`node scripts/check-sources.mjs` → `verdict=clean rows=129`);
without the note `check-sources.mjs` refuses with `used_by_missing` (E11). The S127 seat measured both states in its scratch clone at `e6b0a90` (lane untouched):
`FINDING id=used_by_missing … row=S127 detail=path_missing`, exit 1 (`check-sources-without-stub.txt`), and
`SOURCES_GATE verdict=clean rows=127 … findings=0`, exit 0 (`check-sources-with-stub.txt`).

**Admitted: S127, S128, S129.**

- **S127** — seat `ScribeSrcSession`, row `S127-row-and-gate.md:15`, Gate line `:26`: `GenerateId()` in
  `chrome/test/chromedriver/util.cc:39-43` formats two `base::RandUint64()` values as `%016` lowercase hex, so a
  classic session id is 32 `[0-9a-f]` characters; the id is consumed at `session_commands.cc:288-289` (`webSocketUrl`)
  and `:372` (`sessionId`). Scope excludes id uniqueness, the BiDi mapper's own `sessionId`, and any captured id (none
  was observed).
- **S128** — seat `ScribeSrcLauncher`, row `row-S128.md:7`, Gate line `:50`: the Arch package at ref `154.0.8037.97-1`
  (commit `871c2ad9…`) builds chromium-launcher v8 and execs `/usr/lib/chromium/chromium`; `launcher.c:26` reads
  `$HOME/.config` `chromium-flags.conf` (the `/etc/chromium-flags.conf` file is read too and is absent on this host) and
  `:124` execs the binary with the merged argv. Host cross-check: `pacman -Qo /usr/bin/chromium` → package
  `154.0.8037.97-1`; the installed 14,424 B ELF carries the launcher's literals and sha256 `eaed39c3…a172b`; the host
  flags file exists (212 B, 5 lines, mode 644) and holds no `--no-sandbox` (0 matches), but it is a user-writable flag
  vector the live leg must not inherit. Scope excludes flag semantics and other distros.
- **S129** — seat `ScribeSrcSandbox`, row `source-row-S129.md:41`, Gate line `:63`: `sandbox/linux/README.md:21-22`
  names the layered Linux sandbox, and `sandbox/policy/switches.cc:42-44` scopes `--no-sandbox` to "all process types
  that are normally sandboxed". Admission condition the seat records: keep `kind` `docs` with the `switches.cc`
  sentence as corroboration; relabelling the row `code` would misdescribe its primary URL.

**Rejected** (each opened by the S129 seat at the same tag; `source-row-S129.md` §Rejected candidates, `receipts.tsv`):

- **`docs/linux/suid_sandbox_development.md`** (HTTP 200, 4,228 B raw, sha256 `bd1562ce…59b3`): self-declared
  out-of-date — "The Linux SUID sandbox is almost but not completely removed … This page is mostly out-of-date"
  (lines 3-5) — and scoped to building/installing the `chrome_sandbox` helper. It states no layer composition and never
  mentions `--no-sandbox`. Flip: the lane must explain a missing or wrongly-versioned setuid helper, or the
  `CHROME_DEVEL_SANDBOX=""` ≡ `--disable-setuid-sandbox` equivalence (page lines 61-62).
- **`docs/design/sandbox.md`** (HTTP 200, 37,776 B raw, sha256 `6d4a3b0c…9b61`): its only `--no-sandbox` sentence sits
  at lines 88-89 under `## Sandbox Windows architecture`; citing it for a Linux launch-flag claim imports the wrong
  scope. Flip: a Linux-section statement of the same switch.
- **`docs/linux/sandboxing.md`**, the seat item's own named path: HTTP 404, 233 B, sha256 `b52a956c…5198`, gitiles body
  "NOT_FOUND: Requested entity was not found". Nothing can be located in it. Flip: the file exists at a later tag.
- Five further pages were opened and found silent on both questions, and are not cited: `docs/linux/sandbox_ipc.md`,
  `docs/linux/zygote.md`, `docs/design/sandbox_faq.md`, `sandbox/README.md`, `docs/linux/pid_namespace_support.md`;
  `chrome/common/chrome_switches.cc` answered 404 (233 B, sha256 `d2e40ab5…852e3a`).

The S127 and S128 seats recorded no rejected candidate; the extra files they opened are corroboration for their
anchors (`commands.cc`, `session_commands.cc`, `devtools_http_client.cc`, `web_view_info.cc`, `web_view_impl.cc`,
`util.h`; `host-crosscheck.md`, `fetch-receipts.tsv`).

**Row limits recorded by the seats, not hidden here.** S128's launcher tarball sha256 (`213e50f4…4483a`, PKGBUILD
`:110`) is pinned by the recipe and was not re-downloaded — `codeload.github.com` is outside that seat's allowed hosts;
three packaging commits carry `pkgver=154.0.8037.97` and the mechanism claim is invariant across them, and the installed
package's build stamp is not matched to a commit. S127 observed no session id (the 32-hex shape is a reading of the
format string) and does not ground the BiDi mapper's own `sessionId`. S129 reads the switch's own comment, not a
per-layer code path.

The three rows ground C2's gate v2: S127 the session id (the session-provenance rule), S128 the launcher's flags file
(the live leg must not inherit it), S129 the scope of `--no-sandbox` (the live leg must not pass it).

### C1 gate decisions — sibling-overlap admits and rejects

The sweep's 52 candidates (`.ufo/waves/round-33/baseline/c1-candidates.tsv`) are gate decisions of their own: a map
row admits an overlap, a screen row rejects one. Drafted by w1 AdjKagi, AdjKaidoku, AdjKakeA, AdjKakeB, AdjKakeC,
AdjOthers (`.ufo/waves/round-33/w1/Adj*/`); integrated by the L1, who overrode the drafts where they disagreed.

Admitted (four new rows in `corpus/adjacency.tsv`, all `split-declared` against kake at pin `04404859…`; the tabi side
of each is a line written this round in `SKILL.md` §"Round 33 — sibling-overlap declarations, tabi side"):

| surface | kake line | why it is an overlap | tabi evidence |
|---|---|---|---|
| `js-rendering-browser-execution` | `PROVINCE.md:61` "browser execution stays tabi's" | kake holds canonical/JS-rendering knowledge and leaves executing the page to tabi | dynamic-page capture, `corpus/knowledge/live-dynamic-capture.md` |
| `robots-txt-publisher-audit-vs-client-obedience` | `PROVINCE.md:304` (robots/sitemap placement vs client-side crawler discipline, names tabi) | both lanes hold RFC 9309 robots rules: kake's offline robots audit, tabi's client obedience | decision table D1–D5 (`corpus/knowledge/rate-signal-decision-table.md:49-53`); `SKILL.md:327` probe-robots |
| `accessibility-browser-at-execution` | `PROVINCE.md:79` "Browser/assistive-technology" execution left as adjacent work | kake's own `SKILL.md:559-560` hands "authorized browser/AT evaluation" to tabi | `corpus/knowledge/aria-loopback-round-13.md`, `playwright-accessible-locators-and-snapshots.md` |
| `crawl-budget-vs-client-crawl-thresholds` | `PROVINCE.md:347` crawl-rate backoff across a hostname | both lanes hold crawl-rate facts: kake the publisher consequence, tabi the client thresholds | decision table D1–D13 |

Rejected as new rows (screened in the new `corpus/adjacency-screen.tsv`, 43 rows): 36 restate a surface already mapped
for that sibling (`same-surface`: kake 21 on `crawler-discipline-vs-publishing`, 4 each on the robots and crawl-budget
rows, 3 on js-rendering; kagi 3 on the musketeer lease; kaidoku 1 on `cdp-runtime-observation`); 4 declare no observation or claim (`no-claim-declared`: kake 396, 422, 440, which say no crawl was observed, and
kotoba:73, kotoba's own map row stating no claim on tabi ground); 2 are not browser-sense (kengaku:54 "scraper outages" of a journal feed; kake:72 local-state note);
1 reports a third lane (tsukuroi:150 restating revenger's declaration). Overrides of the drafts, each a judgement on the
record: AdjKakeB screened kake 340–364 `not-browser-sense`; the L1 re-screened them `same-surface` (crawl budget,
canonical selection, crawler identity are publisher-side crawl knowledge on the mapped split), and kake 302/303/322/323
onto the new robots row; AdjKakeA's coined surface `a-js-rendered-canonical-vs-browser-execution` was renamed
`js-rendering-browser-execution`, and its row's tabi side moved from `PROVINCE.md:12` to the round-33 declaration line.
AdjKakeA screened kake:79 `no-claim-declared`; the L1 mapped it instead, because kake's `SKILL.md:559-560` names tabi as
the receiver — a real overlap is never screened (`SKILL.md` §Round 33 decision rule, step 5).

Contested-open rows: none new. w1 ConnFleetRulings found no ruling since round 17 on any contested surface (fleet
`.ufo/l0-questions.md:62` and `:65` still open), so the existing contested rows stay as they are and no row was promoted
to `ruled`.

Not in the sweep (search log, below): w1 ConnSiblingScan read sibling `SKILL.md` and `corpus/knowledge/*.md` and found
34 real overlaps outside the frozen PROVINCE regex (kasegi's CDP 9222 burnerchrome, kumitate's webbridge routing, kama's
CDP pins, kaidoku's Playwright and accessibility-tree capture) — leads for a later round, not counted
(`.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv`).

Spot-check (`LEARNING.md` §Discernment): owed to the round's non-author closure; seats this lane dispatched are the lane.

### Assimilation (§10)

Assimilation: none. No `merge/tabi/` theme touches the adjacency map or the BiDi gate (w1 ScoutAssimilation: 86
proposed entries, 148 staged rows, no BiDi/chromedriver/WebDriver mention; the quarantine slice re-derives to 38 rows,
byte-identical to round 31's). This lane has no `considerthese/` directory. `claims.json` `notClaimed` gives a false
reason — see M4.

### Status / recheck / used-by changes

S127–S129 enter new as `mined` / `90d` / used-by `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`. No existing row
changes status, recheck or used-by this round.

Routed defect 3 (S125 cadence): kept at `90d`, with this reason on record. S125 pins immutable bytes at a tag
(`session_commands.cc` at 154.0.8037.97, decoded sha256 `7b40e94c…abb5`, re-fetched this round and equal); the
build-bound re-run duty lives in the runtime entry's own `recheck` ("re-run on a new ChromeDriver build",
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:7`), which is where a new build triggers work. w1
ScribeRoutedDefects drafted the alternative — a release-pin receipt entry plus `on-release`, verified in scratch
(`check-release-pins.mjs` population 24, resolved 24, S125 `holds` at 156.0.8078.47) — but its second fetch came from
the same seat, and the gate's f6 refetch independence is name-based; it is carried with that draft
(`.ufo/waves/round-33/w1/ScribeRoutedDefects/drafts/draft-3-s125.md`) until a second seat fetches the 156 blob.

### Routed round-32 defects — dispositions

1 → C2 (gate v2; the driver import allow-list is stated in the gate header). 2 → not claimed (calibration counter v4
carried). 3 → above. 4 → named correction appended to `SCORECARD.md` and `LOG.md` (round 33 corrections), mined as M1.
5 → errata intake below. 6 → M9 closed (table below). 7 → six of the seven round-33 control captures rebuild
byte-exactly from `baseline/controls.mjs`; `c1-J3-junk-rows` does not, because the builder reads sibling branch heads
at run time (`controls.mjs:64`) and the C2 controls read the worktree, not the baseline blob
(`.ufo/waves/round-33/w1/ScribeRoutedDefects/drafts/draft-7-controls.md`) — M3's residual.

## Mistakes

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `vacuous` | round-32 `.ufo/waves/round-32/claims.json` C1 `feasibilityDisclosed`; `.ufo/waves/round-32/w1/CritC1Forgery.md` v1–v4 (four constructions admitted 16, exit 0); `corpus/lessons/round-32-verifier-spotcheck.md` §C1 disclosed hole | none — no gate reads a feasibility sentence; criterion 86 counts distinct surfaces, it does not test reachability | this round's pre-freeze forgery controls and frozen battery, shown able to fail: `baseline/c2-J1-do-nothing.json` `forgeriesAccepted 8` is the red state, and J2/J3 each fail the predicate too (R2, R3); battery bytes frozen at `51ace65f…` (R1) |
| M2 | `survivor` | `.ufo/waves/round-32/w2/MutC1Entry.md` mutant A (`:29`, `:40`): a `yes (live)` Measured cell shrinks population 16→15 and the gate exits 0 `clean=true`; round-32 lesson M7 carried it to gate v2 | none — the v1 self-test has no decorated-cell case, and `measure/c1-distinct.mjs` applies the same `=== "yes"` rule | F7 in the frozen battery: a decorated first `yes` row must be refused; predicate frozen at `51ace65f…`, red at the baseline control (R1, R2) |
| M3 | `reference-drift` | round-32 closure routed defect 7; live again in this round's receipts — `baseline/c1-J2-screen-all.provenance` `rev=a6b709d1…`, `baseline/c2-J3-whitelist.provenance` `rev=3f77d79b…`, both absent from the lane repo (R10) | the closure spot-check only (no lane gate reads a provenance rev) | `baseline/controls.mjs` is byte-frozen in `claims.json` `frozenDigests` (`2d0cf841…`), the alternative the closure allowed; six of the seven captures rebuild byte-exactly from it, `c1-J3-junk-rows` does not (the builder reads sibling branch heads at run time, `controls.mjs:64`; w1 ScribeRoutedDefects draft-7); residual: the recorded rev/tree cells still do not resolve in the lane repo |
| M4 | `stale-premise` | `.ufo/waves/round-33/claims.json` `notClaimed[2]` ("the lane's quarantine-first round … has not run"), L1-authored and frozen; the slice was hand-checked in round 22 and all 38 rows re-opened in round 27 (`corpus/lessons/round-27.md:30-39`, fleet `.ufo/l0-questions.md:165`) | none (no instrument reads `notClaimed`); caught by w1 ScoutAssimilation and the L1's own L0 read | correction in this lesson, `SCORECARD.md` and `LOG.md`; the frozen file is not edited. Fix shown able to fail: `grep -n quarantine corpus/lessons/round-27.md` prints the hand-check lines the sentence denies |
| M5 | `vacuous` | `.ufo/waves/round-33/claims.json` C1 `feasibilityDisclosed` names one construction (four named-quote rows); w1 CritC1Counter (`D.json`: three `refused-route` rows reusing `PROVINCE.md:16` as the only naming quote; `A.json`: contested-open rows citing a round-17 L0 line the candidate never mentions) and CritC1Axis (four cosmetic renames of the mapped kake split) reach predicate true more cheaply | criterion 90 (written this round) | the M1 class recurring one round later: the sentence is bounded to the attacks run before the freeze. Criterion 88 records that naming is necessary, not sufficient; every new row is attacked in w2 and the closure samples them |
| M9 (round 32, closed) | `stale-premise` | `.ufo/waves/round-32/w1/ExecCollectorTiming.md` case 3 contradicted the matrix's round-13 collector correction | the round-32 wave-2 integration | **landed** — `corpus/knowledge/webdriver-bidi-capability-matrix.md:263` §Dated correction 2026-10-26 (round 32 wave 2) supersedes the clause at `:157-161`; committed at the round-33 baseline `b7d16fb8` |

### M1 — a feasibility sentence asserted an unreachability nobody tested

`claims.json` C1 `feasibilityDisclosed` says the target "is not reachable without a committed receipt of two real runs
from a driver other than the counter (controls J3/J4)". `.ufo/waves/round-32/w1/CritC1Forgery.md` then admitted four
constructions at `admitted: 16, failing: 0, exit 0`: golden synthetic transcripts with one real CDP screenshot spliced in
(v1), one row id listed sixteen times (v2), one real run cited as both runs (v3), and the counter's own bytes as the
driver (v4). The closure spot-check confirmed the sentence is false as written and disclosed the hole. The class is
`vacuous`: a negative reachability claim with no control behind it, stated at a point where the claims rule asks the
round to disclose feasibility *before* freezing.

The fix is this round's shape, not a sentence. C2's predicate is a frozen battery whose controls are scored before the
freeze: `baseline/c2-J1-do-nothing.json` carries the red state (`forgeriesAccepted 8` of 8, R5), `c2-J2-reject-all.json`
kills the trivial gate (`forgeriesAccepted 0` but `honest {H0: false, H1: false, H2: false}`), and
`c2-J3-whitelist.json` kills the digest-whitelist gate (`forgeriesAccepted 0`, `honest true`, but `digestLiterals` 5 and
`selftest` exit 3) — all three `predicate false` (R2, R3). The battery therefore can fail, and did, before any row was
written.

### M2 — a decorated cell left the population instead of failing

`.ufo/waves/round-32/w2/MutC1Entry.md` mutant A changed R2's Measured cell from `yes` to `yes (live)`. The gate's
`evaluate()` filters `(r.cells[3] || "").toLowerCase() === "yes"`, so the row left the population entirely:
`population=15 admitted=15 failing=0 clean=true`, exit 0, with nothing in the JSON naming R2. Severity high for the
receipt leg, because a row that is silently dropped is indistinguishable from a row that was never claimed; the plain
distinct counts did not close it, since `c1-distinct.mjs` applies the same rule (mutant A prints `rowsMarkedYes=15`).

This round's fixed construction is F7 — the first `yes` row reads `yes (live)` — and the predicate requires the v2 gate
to refuse it (frozen battery `counters/c2-bidi-forgery-battery.mjs`, sha256 `51ace65f…` at the freeze, R1). The red
state is the J1 control: the v1 gate accepts all eight constructions (R5).

### M3 — control provenance names revisions no repository holds

The round-32 closure's routed defect 7: five mutated-control `clone_tree` digests (`21c48a93`, `51b5c583`, `de1d7ae0`,
`4b873bef`, `f1dc6fea`) do not resolve in the lane repo. The same shape is in this round's receipts: the mutated controls
record `rev=a6b709d16ad48340f3a53a9c7b648923270f62d1 tree=28208038…` (C1 J2) and
`rev=3f77d79b6533779b1e85b08d3d3358a1e2b77980 tree=9811384d…` (C2 J3), and both commits are absent from the lane repo
(R10). Only the round-32 closure's spot-check checked those casts; no lane gate reads a provenance rev.

The partial fix already exists in the frozen bytes: `baseline/controls.mjs` is byte-pinned in `claims.json`
`frozenDigests` (`2d0cf841…`, equal at `e6b0a90`, R1), one of the two remedies the closure allowed, so the mutated
fixtures rebuild from committed bytes. The residual is recorded rather than repaired: the `rev`/`tree` cells still name
scratch-clone objects, and a reader without the builder cannot diff a mutated control.

## Errata intake (round-32 wave-2 precision defects, routed defect 5)

- Intake A (w1 ScribeErrataA: CritNewNumbers D1–D5, RevLesson F1–F5): five land and one lands strengthened, appended to
  `corpus/lessons/round-32.md` and `LOG.md`; one closed-already; four refused (RevLesson F2–F5: no statement false,
  each fix would edit a committed receipt). The S124 `scope` correction is carried to a superseding registry row
  (contract rule 2), not landed as prose in `SOURCES.md`.
- Intake B (w1 ScribeErrataB: CritEntry D3–D13, n1): ten correction bullets appended to
  `corpus/knowledge/webdriver-bidi-runtime-round-32.md`; D5 and D12 closed-already; none refused. The entry's table is
  unchanged, so the BiDi gate's population cannot move; a re-run of `baseline/controls.mjs`'s whitelist control now
  reads a different worktree entry digest (M3 residual).
- Intake C (w1 ScribeErrataC: ConnRoutedLedger 19, CritReadmeLog 5): text below and the README/LOG appends.

## Errata intake C — round-32 w1 findings without a landing line (append-only)

Re-checked at `e6b0a9074d434ccc307badd312ae7379d1193fea` against `.ufo/waves/round-32/w2/ConnRoutedLedger.md`
(19 medium-or-higher w1 findings) and `.ufo/waves/round-32/w2/CritReadmeLog.md` (F1–F5); the ledger is
`.ufo/waves/round-33/w1/ScribeErrataC/errata-C.md`. Named by a landing line at that revision: A.3 and A.4 (lesson
round-32 M7), A.10–A.12 (M6); closed by this round's claim: A.8 (C2, forgery F8). The rest are recorded here.

- **C1 gate v1 live leg: the deadline closes the websocket only (RevCounters HIGH-1).**
  `scripts/check-bidi-runtime.mjs:394` — `const deadline = setTimeout(() => { try { ws && ws.close(); } catch {} }, timeoutMs);`
  — settles no pending or later `send()`: the client's send on a closed socket is a no-op, so a wedged session hangs the
  counter with chromedriver, chromium, the fixture server and the scratch dir leaked and the CLI never exiting
  (`.ufo/waves/round-32/w1/RevCounters.md`, HIGH-1). C2's frozen predicate is the receipt leg (`claims.json` C2 killRule:
  "The `--live` leg is not part of this predicate"); the v2 live-leg change (real binary, no `--no-sandbox`) does not
  touch this arm. Flip: the live leg rejects every pending send on the deadline and a control shows the counter exiting
  after a wedged session.
- **A refused oracle removes its mismatches (RevCounters MEDIUM-1, consequence).** Criterion 85 landed the mechanism;
  the claim-level consequence is recorded here: at REV, breaking an *unfrozen* gate's self-test silently removes that
  gate's mismatches, so a zero mismatch count is reachable without honest corrections for any tally naming an unfrozen
  gate; only protocol guards the unfrozen gates (`.ufo/waves/round-32/w1/RevCounters.md`, MEDIUM-1).
- **C1 gate v1 selftest gaps M04, M18 and M17.** M7 names `driverSha256` equality and error-frame `ok()` as the worst of
  nine surviving mutants; these three are the unnamed rest: cross-run `chromedriverVersion` equality is unenforced (M04),
  R4's PNG width/height equality is unexercised because the failing case supplies non-PNG bytes (M18), and no case ships
  a non-loopback `webSocketUrl`, so the loopback-only contract has no R1 detector in the suite (M17). Each survived the
  27-case selftest at 27/27 PASS, exit 0; each names its killing case in `.ufo/waves/round-32/w1/MutC1.md`. Flip: one
  selftest case per survivor, red on the mutant and green on the lane receipt.
- **The gate never reads the entry's Surface, BiDi-method or Evidence cells (CritC1Predicates defect 3).**
  `scripts/check-bidi-runtime.mjs:508` selects rows by `(r.cells[3] || "").toLowerCase() === "yes"` and `:560` reads
  `r.cells[0]`; a row whose Surface cell is arbitrary text and whose BiDi-method cell names a CDP command admits clean
  (`.ufo/waves/round-32/w1/CritC1Predicates.md`, E13; severity medium). Row-label fidelity is hand-review only; v2's
  stated rules narrow the `Measured` cell but do not read the other cells. Flip: a gate check that the method cell names
  the row's BiDi method, or a per-round hand-review line for every `yes` row.
- **m4 supersession grammar (CritC2Counter D4–D10).** D1–D3 are named in M6; these seven are not. D4: a correction placed
  *before* the statement never clears it, though the lane's own `## Round N — corrections` convention puts corrections
  above the claims block. D5: the finding's line is the line holding `nudge` (`SCORECARD.md:1473`), not the state word
  (`:1474`), so a correction citing `:1474` alone does not clear. D6: the correction's own round is never checked, so a
  "round 30" correction clears round 29's statement. D7: a range citation clears every round in the range
  (`:1470-1580` clears 29, 30 and 31 with one sentence). D8: phrasing blind spots — `nudge is not active`,
  `does not use the nudge`, `nudge waived`, `nudge fires`, `nudge remains inactive`, `no stagnation nudge`,
  `nudge state: inactive`, `nudge = inactive`, `nudge is dormant` and a `| nudge | inactive |` table cell are invisible.
  D9: inputs must sit in the same round group although `AXES.md` records the saturation line and window once in
  `SCORECARD.md`; round 28's `:1456` is could-not-evaluate because its axes sit at `:1432`, and the `depth: 9` colon
  form, a >240-char tail, table-form axes and `Saturation line8 and window3` are unparsed. D10: capability-cell blind
  spots — prose `first-working13`, `First-working: 3`, `first working round 3`, a header outside the last cell and word
  numerals are unseen, while a name cell is read as a round (`kaika-fleet-round-1` ⇒ 1). All seven are medium
  (`.ufo/waves/round-32/w1/CritC2Counter.md`). Counter v4 is not claimed this round (`claims.json` notClaimed); flip:
  v4 carries each as a case with a fixture, per `SCORECARD.md:1692`.

## Search log

- Question: which sibling province lines claim browser-domain ground this lane must answer for? Where: the twenty
  sibling `PROVINCE.md` files at the frozen pins (`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` `PINS`), one
  frozen regex. Date 2026-10-26. Identified 52, screened 52, included as new map rows 4, screened out 43, already
  mapped 5. Stop rule: the frozen candidate set.
- Beyond the sweep (w1 ConnSiblingScan, sibling `SKILL.md` and `corpus/knowledge/*.md` at lane tips): 41 leads, 34 real
  overlaps, 8 caught by the sweep; regex blind spots `screenshot`, `profile`, `headless`, `remote-debugging-port`,
  `accessibility`, `har`; noise `devtools` (Arch package), `chrome` in paths. Not counted; a later round's sweep.

## Receipts (commands run at drafting; all read-only)

R1 — frozen digests equal the blobs at the freeze commit (exit 0):

```
for p in .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
         .ufo/waves/round-33/baseline/controls.mjs .ufo/waves/round-33/measure.sh scripts/check-adjacency.mjs; do
  printf '%s  %s\n' "$(git show e6b0a9074d434ccc307badd312ae7379d1193fea:$p | sha256sum | cut -d' ' -f1)" "$p"; done
# da59d157…c6380  c1-adjacency-sweep.mjs          [claims.json frozenDigests: da59d157…c6380]
# 51ace65f…e812b  c2-bidi-forgery-battery.mjs     [51ace65f…e812b]
# 2d0cf841…451e   baseline/controls.mjs           [2d0cf841…451e]
# ca6b830e…84c7e  measure.sh                      [ca6b830e…84c7e]
# 4e2c2a64…24aac  scripts/check-adjacency.mjs     [4e2c2a64…24aac]
```

R2 — controls: `jq -c 'length' .ufo/waves/round-33/baseline/controls-summary.json` → `7`;
`jq -c '[.[]|.predicate]|unique'` → `[false]`; `jq -c '[.[]|.exit]|unique'` → `[1]`.

R3 — `jq -c '.[] | select(.name=="c2-J3-whitelist") | .summary' .ufo/waves/round-33/baseline/controls-summary.json` →
`{"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":0,"digestLiterals":["8aa97463c238","9918a716da71","92bd413caab0","b9dab912f0af","55dbef88ed4b"],"selftest":3}`.

R4 — `wc -l .ufo/waves/round-33/baseline/c1-candidates.tsv` → `52`;
`awk -F'\t' '{print $1}' … | cut -d@ -f1 | sort | uniq -c | sort -rn` → `42 kake-shokunin, 4 kagi-shokunin,
2 kaidoku-shokunin, 1 tsukuroi-shokunin, 1 revenger-shokunin, 1 kotoba-shokunin, 1 kengaku-shokunin`.

R5 — committed counter readings:
`jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}' .ufo/waves/round-33/baseline/measure-at-baseline/c1-at-b7d16fb.json`
→ `{"predicate":false,"candidates":52,"mapped":5,"screened":0,"unaccounted":47,"newMapped":0,"adjacency":{"verdict":"clean","rows":10,"verified":10,"findings":0}}`;
`jq -c '{predicate,honest,forgeriesAccepted,selftest,digestLiterals}' …/c2-at-b7d16fb.json`
→ `{"predicate":false,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":8,"selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27"},"digestLiterals":[]}`.

R6 — `grep -c '^| S[0-9]' corpus/SOURCES.md` → `126` (S126 is the last row; no S127–S129).

R7 — `jq '.items|length' .ufo/waves/round-33/w1-spec.json` → `36`.

R8 — `grep -o '^[0-9]\{1,3\}\.' corpus/QUALITY.md | tail -3` → `84.`, `85.`, `86.` (highest criterion at the baseline
is 86; 87+ is this round's frontier step, drafted above as owed).

R9 — `grep -c 'SURVIVED' .ufo/waves/round-32/w1/MutC1.md` → `9` (of the 20 mutants; round-32 M7's "9 of 20").

R10 — provenance resolution, from the lane repo (cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`):
`git cat-file -e a6b709d16ad48340f3a53a9c7b648923270f62d1^{commit}` →
`fatal: Not a valid object name`, exit 128; the same (exit 128) for `3f77d79b6533779b1e85b08d3d3358a1e2b77980` and for
round-32's five mutated trees `21c48a93`, `51b5c583`, `de1d7ae0`, `4b873bef`, `f1dc6fea`.
`git cat-file -t c7999ee70b633f0f54a639069816bce53326e4b7` → `tree`, exit 0, and it equals
`b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd^{tree}`, so the lane-side rows of the provenance files do resolve.

R11 — seat outputs at drafting: `ls -d .ufo/waves/round-33/w1/ScribeSrc*` → `ScribeSrcLauncher`, `ScribeSrcSandbox`,
`ScribeSrcSession` (all three published by the end of drafting). `ScribeSrcSession/` holds `S127-row-and-gate.md`,
`check-sources-with-stub.txt` (`SOURCES_GATE verdict=clean rows=127 … findings=0`, exit 0) and
`check-sources-without-stub.txt` (`FINDING id=used_by_missing … row=S127`, exit 1); `ScribeSrcLauncher/` holds
`row-S128.md`, `fetch-receipts.tsv`, `host-crosscheck.md`; `ScribeSrcSandbox/` holds `source-row-S129.md`,
`receipts.tsv`.
`ls corpus/adjacency-screen.tsv corpus/knowledge/bidi-runtime-gate-v2-round-33.md` → both absent.

## Wave 2 — falsify (append-only)

38 seats attacked the integration `042d6d9abf97d567d495652a85eabc851b81adc1` (`.ufo/waves/round-33/w2/`). Held: both
frozen counters re-run independently (RerunC1, RerunC2: byte-identical readings, predicate true at `042d6d9a`), the
census 126 → 129 (RerunCensus), the no-harm sweep 28/28 (RerunNoHarm), S127 and S129 re-opened byte-identical
(ReopenS127, ReopenS129), the row `js-rendering-browser-execution` (CritRowJS), the 21 crawler-split screens
(CritScreenCrawlerSplit, one low precision note at kake:411), the 11 new-surface screens (CritScreenRobotsCrawl), the
four row mutants and nine mutation classes (MutC1Rows), no sibling ground absorbed (CritAdjacencyHarm), no lead
contradicting a screen (ConnSiblingLeads), no sibling drift since the pins (ScoutSiblingDrift), the five round-32 MutC1
survivors refused at the receipt level (CritMutC1Survivors), session-provenance forgeries with real-shaped ids refused
(CritForgeV2A), causal separability and the frozen predicates as worded (CritClaimsAxes).

Defects and their dispositions (each landed append-only in the integration that follows `042d6d9a`):

| finding | severity | disposition |
|---|---|---|
| CritRowCrawlBudget, CritC1Overrides: row `crawl-budget-vs-client-crawl-thresholds` (kake:347) is a re-key of map row 6 — the kake line names no lane, w1 AdjKakeB had screened it, and the L1 promoted it | medium | **row withdrawn**; kake:347 and the four crawl-budget screens re-screened `same-surface` on `crawler-discipline-vs-publishing`. C1 then reads newMapped 3: **C1 fails its frozen target** (M6) |
| CritC1Overrides: kake:304 restates the boundary row 6 maps; the screen→row reversals of kake:79 and kake:304 were not recorded | medium | recorded here; rows 13 (robots) and 14 (accessibility) kept — each kake line names or hands off to tabi (kake `PROVINCE.md:304`; kake `SKILL.md:559-560`); CritRowRobots held the robots overlap on substance |
| CritRowA11y, CritDeclarations: the tabi declaration claims assistive-technology execution the lane disclaims; citation spans in bullets 1, 2, 4 | medium / moderate | `SKILL.md` round-33 wave-2 corrections of `:2887-2890` |
| CritRegistryRow: round-33 registry row's clean predicate, verdict map (exit 3) and write scope did not match the code | medium | superseding registry row in `SKILL.md` round-33 wave-2 corrections |
| SentinelLiveV2: live leg reached the real home through `XDG_DATA_HOME` | medium | gate redirects `XDG_DATA_HOME` and `XDG_STATE_HOME`; L1 strace re-run: 0 opens under `~/.pki`, `~/.local/share/pki`, `~/.config/chromium` |
| CritForgeV2B (fabricated second run with fresh ids; allow-listed driver that never ran), CritForgeV2C (same-host junk Gate row passes s1) | limits / medium | recorded in the v2 note §8 as limits; not predicate changes |
| CritV2Note F1, F2: §7 live reading without a receipt; sandbox citation | low | note §8; live receipt `measure/c2-live-at-*.json` committed |
| CritCorrections a–e: freeze-before-data overstated for `measure-at-baseline/`, 44 attributed to the freeze, a census citation, a LOG errata count, a provenance description | medium / low | SCORECARD and LOG round-33 wave-2 corrections |
| CritCorrections: no-harm leg read `check-selfassessment` mismatches 1 at `bf48b81c` | medium | the one-line correction in `042d6d9a`; the final measurement re-reads it at the measured revision |
| CritS125Cadence: the recorded 90d reason does not discriminate S125 from the 30 `on-release` tag rows | moderate | accepted: the reason is withdrawn as a justification; S125 stays `90d` only until a second seat's 156 fetch lets draft-3 land (routed forward) |
| ReopenS128: three locator/stamp precision defects | low | carried to the next registry curation (superseding row) |
| CritScreenOthers: kake 396/422/440 better `same-surface` than `no-claim-declared` | low | carried; label-only, the counter treats both as accounted |
| CritTrendVerdicts | — | read with the round report's verdicts |

### Mistakes found by wave 2

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M6 | `scope` | the L1 reversed three w1 screen decisions (kake:79, :304, :347) during integration; each reversal was load-bearing for newMapped 4, and kake:347's had no sibling-side ground (`.ufo/waves/round-33/w2/CritC1Overrides.md`, `CritRowCrawlBudget.md`) | none — the counter counts surface strings; no rule asked the integrator to record reversals | criterion 91; row 15 withdrawn, so the target is missed rather than met on an aimed row. Shown able to fail: the C1 counter at the integration with row 15 reads predicate true, without it false (`measure/c1-at-bf48b81.json` vs the final measurement) |
| M7 | `vacuous` | the frozen C2 battery accepts a stub gate keyed on the battery's own commit subjects (`.ufo/waves/round-33/w1/CritC2Counter.md`) | none at the freeze; criterion 89 names the populations, not construction tells | next battery randomises variant subjects, paths and ids; this round's C2 reading is read beside v2's per-variant reason ids |
| M8 | `scope` | the live leg's home isolation covered HOME and XDG config/cache but not XDG data/state (`.ufo/waves/round-33/w2/SentinelLiveV2.md`) | none | redirect added; the strace check is the red/green (w2 receipt red, L1 re-run 0 hits) |

Late wave-2 reports (landed after the integration `0aa2281a`): w2 RevGateV2Code holds — v2 refuses each battery variant
for the construction-correct reason and keeps all 27 v1 behaviours, which answers M7 for this gate's bytes; w2 MutGateV2
holds with limits — 9 of 20 mutants killed, 11 survive both the self-test and the battery (`.ufo/waves/round-33/w2/MutGateV2.md`),
carried as cases for the next battery; w2 CritErrataLanded — three low precision items in the errata appends, carried to
the next errata intake (`.ufo/waves/round-33/w2/CritErrataLanded.md`).

## Misroot sweep

`git -C /home/vgpnk/Projects/shokunin status --porcelain` at round end: ` M .scratch/goal-20261026-hyaku-run9.md`
(orchestrator-owned), `?? .ufo/reports/round-33/souji.md` and `?? .ufo/reports/round-48/tameshi.md` (other lanes'
reports). No file written by a tabi seat at the fleet root; nothing moved.
