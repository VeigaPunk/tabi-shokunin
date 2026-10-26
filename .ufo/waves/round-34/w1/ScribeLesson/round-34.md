# Round 34 — sibling ground outside `PROVINCE.md`, and the gate's own kill cases (2026-10-26)

Baseline `15dfaccb34601c2d221c78501e2befd8998d600c`; claims, both frozen counters and the nine control
receipts landed and frozen before data in `59f1b47aae277e1670e4a824173da8cde7e388ee`
(`.ufo/waves/round-34/claims.json`; receipts `.ufo/waves/round-34/baseline/`). Waves: w1 build + first
falsifiers (`.ufo/waves/round-34/w1/`, 37 seats in `.ufo/waves/round-34/w1-spec.json`), w2 falsify
`<L1: w2 seat count and attack list>`. Drafted inside w1 (ScribeLesson) and integrated by the L1
(`<L1: canonical L1 seat name>`); after-measurements are in the round report and
`.ufo/waves/round-34/measure/`.

Both frozen claims are red at that baseline, from the committed receipts:

- **C1 (adjacency).** `baseline/measure-at-baseline/c1-at-15dfacc.json` reads `predicate false, candidates
  67 (set A 38, set B 29), mapped 1, screened 0, unaccounted 66, newMapped 0`, gate `clean` at 13 rows /
  13 verified (`findings 0`), `adjGateSha256 4e2c2a64…24aac`. Per lane: kake 13, kotoba 13, kaidoku 9,
  mori 8, kumitate 5, tameshi 5, kagi 4, kama 4, kasegi 3, tsukuroi 2, chousa 1. The one mapped candidate
  is row 59, `kama corpus/knowledge/listener-census.md:355` (map surface `cdp-live-target-census`,
  contested-open, file line 11). The target is `unaccounted 0` and `newMapped >= 3`.
- **C2 (operability).** `baseline/measure-at-baseline/c2-at-15dfacc.json` reads `predicate false, killed
  8 of 20, survivors M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19, unappliable []`, pristine / neutral
  / decoy all exit 0 (`BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44`), twins failing `[]`, and
  the round-33 battery `predicate true` (`honest {H0,H1,H2} true`, `forgeriesAccepted 0`). The target is
  survivors 0 of 20 with every probe still exiting 0 and the battery still met.

The nine frozen controls in `baseline/controls-summary.json` all read `predicate false`, `exit 1`:
`c1-J1-do-nothing`, `c1-J2-screen-all`, `c1-J3-junk-noncandidate`, `c1-J4-existing-tabi-lines`,
`c1-J5-unnamed-sibling-side`, `c2-J1-do-nothing`, `c2-J2-selfhash`, `c2-J3-find-sniff`, `c2-J4-reject-all`.

The six frozen digests equal the blobs at the freeze commit (see §Receipts R1): both counters
(`0dba816c…8781e`, `3cf5eb69…25b82`), `baseline/controls.mjs` (`18c95d67…f035e`), `measure.sh`
(`0a11973d…8602c`), `scripts/check-adjacency.mjs` (`4e2c2a64…24aac`, also pinned inside C1) and the
round-33 battery (`51ace65f…e812b`, pinned inside C2). `check-selfassessment` reads `mismatches 0` at the
baseline (`baseline/measure-at-baseline/selfassessment-at-15dfacc.json`).

## Gate

New registry rows **S130+** — `<L1: exact ids the scouts opened>`. `corpus/SOURCES.md` holds 129 rows at
the baseline (last row S129), so S130 is the next free id. Each row is opened by a lane seat's own
read-only HTTPS GET this round (contract: a row is a claim, §Rules 1), carries a ≤25-word located quote,
and enters as `mined` / `90d` / used-by `corpus/knowledge/bidi-gate-selftest-round-34.md` — not
`on-release`, which would put a Chromium tag pin into `scripts/check-release-pins.mjs`'s population
(round-32 M10). The literal tokens must appear in that note or `check-sources.mjs` refuses with
`used_by_missing` (E11).

| row | URL | accessed (UTC) | receipt: status · bytes · sha256 · located quote (≤25 words) | seat | admission |
|---|---|---|---|---|---|
| S130 | `<L1: BiDi browsingContext id shape source URL (chromium-bidi mapper / Chromium base token) at an exact tag>` | `<L1: ISO time>` | `<L1: HTTP status · raw bytes · sha256 · quote + line>` | ScoutContextIdSource | `<L1: admitted / rejected>` |
| S131 | `<L1: session.new / WebSocket-URL source (chromium.googlesource.com or w3c.github.io/webdriver-bidi)>` | `<L1: ISO time>` | `<L1: …>` | ScoutSessionBinding | `<L1: …>` |
| S132 | `<L1: optional second corroborating row; or `—`>` | `<L1: …>` | `<L1: …>` | `<L1: seat>` | `<L1: …>` |
| S13X (supersedes S128) | `<L1: PKGBUILD + launcher.c locators from ScribeErrataS128>` | `<L1: ISO time>` | `<L1: …>` | ScribeErrataS128 | `<L1: …>` |

Row limits recorded by the seats, not hidden here: `<L1: scope each seat excluded — id uniqueness, the
BiDi mapper's own sessionId, any captured id, other distros, launcher flag semantics>`.

**Admitted: `<L1: ids>`.** Per row, one bullet in the round-33 shape — seat, row file and line, Gate line,
what the row grounds for C2, scope exclusions: `<L1: …>`.

**Rejected** (each opened and refused, with the flip that would change the verdict): `<L1: id or URL ·
status/bytes/sha256 · why it teaches nothing for the kill-case rule · the flip>`. A 404 is recorded by its
body text, never by its sha (round-33 spot-check routed defect 5; ScribeQuality criterion `<L1: number>` — 404 by body text).

**Status / recheck / used-by changes** (append-only in place, each logged old→new): `<L1: none, or
row · cell · old → new · reason>`. S125 cadence: `<L1: verdict from ScribeS125Cadence — identical at
156.0.8078.47 and therefore `90d` with a discriminating reason, or draft-3 landed after a second seat's
fetch>`.

### Assimilation (§10)

`<L1: from w1 ScoutAssimilation — theme list, whether any touches (a) sibling-overlap/adjacency of browser
ground or (b) BiDi/WebDriver gate self-tests or id shapes, and the one-line verdict `Assimilation: none` or
`one theme: <path>`. Confirm `considerthese/` still absent.>`

Spot-check (`LEARNING.md` §Discernment): `<L1: owed to the round's non-author closure; seats this lane
dispatched are the lane>`.

## C1 gate decisions — sibling lines outside `PROVINCE.md`

The frozen candidate set is 67 lines (`.ufo/waves/round-34/baseline/c1-candidates.tsv`; set A 38 = lines of
sibling `SKILL.md` / `corpus/knowledge/**/*.md` at the frozen pins matching `/\btabi\b/i`, set B 29 = the
round-33 w1 ConnSiblingScan leads, de-duplicated on `(lane, path, trimmed text)`, A first). Each candidate
is **either** mapped by a verified `corpus/adjacency.tsv` row whose cited sibling line (same path, same
pin) carries the candidate text, **or** screened in the new `corpus/adjacency-screen-skill.tsv` with header
exactly `sibling_ref	reason	surface	quote	note` — `sibling_ref` the candidate key verbatim, `reason` one
of `not-browser-sense | same-surface | third-lane-report | no-claim-declared`, `surface` a verified map
surface of the SAME sibling for `same-surface` (else `-`), `quote` a verbatim 4–25-word (≥20 non-space
char) substring of the candidate line. The counter's closed screen findings (`screen-header`,
`screen-columns`, `screen-not-a-candidate`, `screen-reason-unknown`, `screen-quote`,
`screen-surface-unmapped`, `screen-surface-not-dash`, `screen-duplicate`) are the gate; a screen row that
trips one accounts for nothing.

A **newMapped** row must key a `(surface, sibling)` pair absent at the baseline, map ≥1 candidate, and
carry a NEW tabi-side declaration line — absent from that tabi file at the baseline, i.e. the lines this
round adds under `## Round 34 — sibling-overlap declarations (outside PROVINCE)` in `SKILL.md` — whose
`tabi_quote` names the sibling lane token; disposition `ruled` / `contested-open` / `refused-route`, or
`split-declared` with a `sibling_quote` containing `tabi`. A `contested-open` row needs a fleet L0 line
`tabi | round-34 | …` naming the sibling: seats DRAFT such lines, only the L1 files them. `ruled` needs a
non-author spot-check line naming the sibling (fleet venue outside `.ufo/`, or a tabi
`corpus/lessons/*-verifier-spotcheck.md` line authored by someone other than this lane). Counting rule
(criterion 91 / routed defect 1): count **boundaries, not surface strings** — a restatement of an already
mapped boundary is `same-surface`, and never a row; never map a line that is not an overlap, never screen a
real overlap; every integrator reversal of a seat's decision is recorded with its ground.

Existing map surfaces at the baseline (13 verified rows) — the vocabulary a `same-surface` screen must
name:

| row | surface | sibling | disposition |
|---|---|---|---|
| 1 | `cdp-runtime-observation` | kaidoku | ruled |
| 2 | `reverse-engineering-of-shipped-artifacts` | kaidoku | refused-route |
| 3 | `reverse-engineering-of-shipped-artifacts` | revenger | refused-route |
| 4 | `rea-browser-runtime-evidence` | revenger | contested-open |
| 5 | `crawler-discipline-vs-publishing` | kake | split-declared |
| 6 | `musketeer-cdp-9222-profile-lease` | kake | contested-open |
| 7 | `musketeer-cdp-9222-profile-lease` | kagi | contested-open |
| 8 | `secrets-vault-ops` | kagi | refused-route |
| 9 | `kimi-webbridge-plugin-internals` | kumitate | split-declared |
| 10 | `cdp-live-target-census` | kama | contested-open |
| 11 | `js-rendering-browser-execution` | kake | split-declared |
| 12 | `robots-txt-publisher-audit-vs-client-obedience` | kake | split-declared |
| 13 | `accessibility-browser-at-execution` | kake | split-declared |

Table numbering is data-row order; the file line in `corpus/adjacency.tsv` is one more (so candidate 59's
row is file line 11).

Candidate allocation (frozen row numbers; drafts by the Adj* seats, integrated by the L1):

| seat | candidate rows | sibling | decision summary |
|---|---|---|---|
| AdjKakeDelegations | 1, 2, 3, 5, 52, 53 (kake `SKILL.md:408, 559, 697, 161, 560`; `field-performance-cwv.md:153`) | kake | `<L1: per row — new row / screen+reason>` |
| AdjKakeKnowledge | 4, 6, 7, 54, 55, 56, 57 (`accessibility-review-packet.md:121, :122`, `accessibility-review-cards.json:8`, `js-rendering-queue.md:77`, `static-canonical-preflight.md:134`, `mirror-pitfalls.md:40`, `fire-journal-codes.md:27`) | kake | `<L1: …>` |
| AdjKotoba49 | 8–12, 66 (`sibling-overlap-census-round49.md:86, :171, :172, :173, :175`; `fleet-skill-audit-round5.md:45`) | kotoba | `<L1: …>` |
| AdjKotoba74 | 13–18, 65 (`sibling-overlap-census-round74.md:70, :101, :126, :150, :151, :152`; `sibling-description-rewrites-round8.md:136`) | kotoba | `<L1: …>` |
| AdjKumitate | 19–23 (`kimi-skills-plugins.md:250, :278, :320, :321, :324`) | kumitate | `<L1: …>` |
| AdjMori | 24–31 (`roster-truth-r12.md:9, :10`; `wave-settlement-r20.md:33, :50, :52, :69, :90, :106`) | mori | `<L1: …>` |
| AdjTameshiTsukuroiChousa | 32–38, 67 (`fleet-kill-rate-ledger.md:128`; `fleet-suite-census.md:306, :621, :622, :646`; `adjacency-anchors-r19.md:187, :188`; `archived-export-intake.md:20`) | tameshi, tsukuroi, chousa | `<L1: …>` |
| AdjKaidoku | 39–47 (`SKILL.md:55`; `2026-10-13-r3-runtime-observation.md:17, :50, :99`; `2026-10-13-r2-skill-references-deep.md:72`; `2026-10-14-r10-01-queue-ops.md:151`; `2026-10-13-r4-16-frontier-rescan.md:184`; `2026-10-14-r10-02-queue-ops-2.md:117`; `2026-10-14-r11-01-queue-ops.md:305`) | kaidoku | `<L1: …>` |
| AdjKagiKama | 48–51, 58, 60, 61 (`kagi SKILL.md:450, :488`; `cdp-bridge-1password.md:70, :77`; `kama listener-census.md:56`; `consumer-registry.md:9, :235`); row 59 already mapped | kagi, kama | `<L1: …>` |
| AdjKasegi | 62–64 (`SKILL.md:267`; `mission-control.md:119`; `ufo-workspaces.md:272`) | kasegi | `<L1: …>` |

New rows written this round (`corpus/adjacency.tsv`, 9 TAB columns; `newMapped >= 3` is the target):

| surface | sibling | sibling_ref (pin:path:line) | sibling_quote | tabi_ref (`SKILL.md` round-34 declaration line) | tabi_quote (names the sibling) | disposition |
|---|---|---|---|---|---|---|
| `<L1>` | `<L1>` | `<L1>` | `<L1: verbatim, contains `tabi` for split-declared>` | `<L1: path:line>` | `<L1>` | `<L1>` |
| `<L1>` | `<L1>` | `<L1>` | `<L1>` | `<L1>` | `<L1>` | `<L1>` |
| `<L1>` | `<L1>` | `<L1>` | `<L1>` | `<L1>` | `<L1>` | `<L1>` |

Why each is an overlap, in one line with both sides' evidence: `<L1: row by row — the sibling side's own
words and tabi's own surface that meets it>`.

Screen ledger summary (`corpus/adjacency-screen-skill.tsv`, new file, 66 rows expected if every
unmapped candidate is screened — `<L1: final count>`):

| reason | count | siblings | notes |
|---|---|---|---|
| `not-browser-sense` | `<L1>` | `<L1>` | `<L1: e.g. roster/census mentions of tabi, lane-inventory lines>` |
| `same-surface` | `<L1>` | `<L1: which mapped surfaces by sibling>` | `<L1>` |
| `third-lane-report` | `<L1>` | `<L1>` | `<L1: e.g. tsukuroi/kotoba reporting another lane's record>` |
| `no-claim-declared` | `<L1>` | `<L1>` | `<L1: lines that state no observation or claim>` |

Carried relabels from round 33 (routed defect 5) land in `corpus/adjacency-screen.tsv`, which may change
only for this: kake `PROVINCE.md:396/:422/:440` `no-claim-declared` → `same-surface` (naming
`crawler-discipline-vs-publishing`) and the kake:411 note — as drafted by ScribeScreenRelabel and verified
in a scratch clone against the round-33 frozen counter: `<L1: replacement rows + counter reading before and
after>`.

Overrides of seat drafts, each a judgement on the record (criterion 91): `<L1: seat → decision → L1
decision → ground on the sibling's own bytes>`. Contested-open rows: `<L1: none, or the drafted fleet L0
line `tabi | round-34 | …` naming the sibling, plus the row that cites it>`.

Not in the sweep (`## Search log`, below): `<L1: any leads found beyond the frozen set, not counted>`.

## C2 kill cases — the 20 frozen mutants against the gate's own `--selftest`

Rule anchors are the find-text lines of `scripts/check-bidi-runtime.mjs` at the baseline `15dfaccb`
(gate sha256 `eded1be0…61c1`); each find text occurs exactly once there (the counter's `unappliable []`
at the baseline is the witness). Round-33 outcome is from `.ufo/waves/round-33/w2/MutGateV2.md`.
All mutants keep their `find`/`replace` pairs byte-identical this round: the gate may gain CASES entries
(ids prefixed `v3-`) and fixture-builder options only — never a line that contains a mutant find text.

| id | rule (anchor at `15dfacc`) | round-33 selftest | kill case (self-test alone, exit 3 + `CASE … FAIL`) | seat | status |
|---|---|---|---|---|---|
| M01 | duplicate-id threshold `> 1` · `:843` | survived | an id listed exactly twice must fail `x3-duplicate-id` (`goldenLines` twice) | ExecKillsA | `<L1: killed by case id>` |
| M03 | verdict case folding · `:373` (and `:860` lowercase equality) | survived | an upper-case `Yes` Measured cell must be refused, not admitted (`goldenLines({mutate})`) | ExecKillsA | `<L1>` |
| M04 | transcript path distinctness · `:797` | survived | two runs, one path, distinct bytes and distinct session ids | ExecKillsB | `<L1>` |
| M05 | transcript sha256 distinctness · `:798` | survived | two runs, same bytes under two paths, other fields consistent | ExecKillsB | `<L1>` |
| M06 | sessionId shape `[0-9a-f]{32}` · `:145` | survived | an upper-case 32-hex session id must be refused (source: S130+ row for the BiDi/ChromeDriver id shape) | ExecKillsA | `<L1>` |
| M07 | webSocketUrl ↔ sessionId binding · `:388` | survived | a loopback ws url naming a DIFFERENT valid session id must be refused | ExecKillsB | `<L1>` |
| M08 | context-id shape `[0-9A-F]{32}` · `:146` | survived | a lower-case 32-hex context id must be refused (source: the browsingContext id-shape row, S130+) | ExecKillsA | `<L1>` |
| M09 | `DRIVER_ALLOW` widened (`ROWS`) · `:144` | survived | a driver importing a non-allow-listed gate symbol must be refused | ExecKillsA | `<L1>` |
| M10 | `DRIVER_ALLOW` loses `serveFixture` · `:144` | killed by battery only | an honest driver importing `serveFixture` must stay ADMITTED (green side) | ExecKillsA | `<L1>` |
| M16 | s1 Gate-row 64-hex digest requirement · `:750` | survived | a registry/Gate row with an https URL but no sha256 must be refused | ExecKillsB | `<L1>` |
| M18 | clean guard `admitted >= 1` · `:867` | survived | a receipt whose rows are all `no` (no findings) must not read clean | ExecKillsB | `<L1>` |
| M19 | sessionId pairwise distinctness · `:811` | survived | two runs with distinct paths and bytes sharing one well-shaped session id must be refused | ExecKillsB | `<L1>` |
| M01b | duplicate-id check disabled · `:843` | killed | existing case `v2-f2-duplicate-ids` (16 ids) | — | `<L1: still killed>` |
| M02 | decorated Measured cell · `:149` | killed | existing case `v2-f7-decorated-measured` | — | `<L1: still killed>` |
| M11 | re-export resolution inverted · `:434` | killed | existing case `v2-f6-driver-reexports-gate` | — | `<L1: still killed>` |
| M12 | non-named import kinds skipped · `:447` | killed | existing case `v2-f6-driver-reexports-gate` | — | `<L1: still killed>` |
| M13 | gate-sha byte-copy comparison inverted · `:778` | killed | existing case `v2-f5-driver-is-gate-copy` | — | `<L1: still killed>` |
| M14 | s1 Gate-row witness dropped · `:757` | killed | existing case `v2-f8-junk-source-row` | — | `<L1: still killed>` |
| M15 | host equality inverted · `:753` | killed | existing case `golden-two-runs` family (37 cases now fail) | — | `<L1: still killed>` |
| M17 | unmeasured rows admitted · `:860` | killed | existing case `v2-m19-unmeasured-row-counted` | — | `<L1: still killed>` |

Design constraints the kill cases must respect (a case that violates one is not a kill):

- **Assert the rule's outcome, never the gate's source text** (ScribeQuality criterion `<L1: number>`). The
  counter's `neutral`, `decoy` (a comment quoting every replacement) and 20 `twin` (whitespace-doubled at
  each mutant site) probes refuse a self-hash or find-sniff construction: each must exit 0.
- **Exit 3 with ≥1 `CASE … FAIL` line**; a crash, a timeout or any other exit is not a kill.
- **Isolation.** Where another t1 rule would refuse the fixture first (battery v2-f3/v2-f4 trip path+bytes+
  sessionId together), the case must isolate its own rule — e.g. M04 distinct bytes with one path, M05
  same bytes under two paths, M19 distinct paths+bytes with one sessionId.
- **Sourcing.** The id-shape kills (M06, M08) rest on registry rows opened this round (S130+), not on the
  gate's own comment: `<L1: row id → the line the case's fixture shape comes from>`.
- **M03 / M10 equivalence risk** (claims `feasibilityDisclosed`): if a surviving mutant turns out
  equivalent under the gate's other rules, the target is MISSED, not narrowed — record it as a miss with the
  proof.

After-measurement: `<L1: node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev <REV> --json →
predicate, killedCount, survivors, unappliable, twinsFailing, pristine/neutral/decoy exits, battery
predicate; committed under .ufo/waves/round-34/measure/>`.

## Mistakes

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `reference-drift` | round-33 `.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv` row 1st-column `corpus/knowledge/mirror-pitfalls.md:39@044048597d62…` (kake): line 39 is blank and the quoted text (`Lease first: \`webzites lease acquire …\`; release`) is line 40 — confirmed by this seat at the pin; three further leads quote text wrapped over TWO lines, so no single-line verbatim anchor exists — `js-rendering-queue.md:77` (quote spans :76-77), `sibling-overlap-census-round74.md:150` (:150-151), `sibling-description-rewrites-round8.md:136` (:136-137) | none in round 33 — the lead list was a prose appendix and no gate read it | the round-34 C1 counter anchors set-B leads **by quote** (cited line, else nearest within ±2, else a 4-consecutive-word window) and reports `leadsReanchored` / `leadsUnresolved`; at the baseline it reports exactly one move, `corpus/knowledge/mirror-pitfalls.md:39@044048597d62… -> 40`. Fixture that shows the fix able to fail: a leads table with (a) a row citing a blank line whose quote is at +1 → must appear in `leadsReanchored` and the candidate key must be the anchored line, (b) a row whose quote matches nothing within ±2 → must appear in `leadsUnresolved` and be skipped, never trusted to its cited line, (c) a row whose quote partly matches the cited line and fully matches +2 → must anchor on the full match. Red state: the baseline reading above (reanchor list non-empty; round-33's own bytes are the defect); green: `leadsReanchored []` with `leadsUnresolved []` over the same table |
| M2 | `<L1: class from the round-33 vocabulary>` | `<L1: path:line>` | `<L1: criterion or none>` | `<L1: fix + the red-before state that shows it able to fail>` |
| M3 | `<L1>` | `<L1>` | `<L1>` | `<L1>` |

`<L1: prose sections in the round-33 shape — one paragraph per mistake that needs the mechanism told, each
ending in its red/green delta.`>

Sources for M2+: w1 ScribeMistakeSweep (every round-33 wave-2 finding not dispositioned in the round-33
lesson, its SCORECARD corrections or the spot-check routed defects), w2 findings, and the C1/C2 attack
seats (CritC1Counter, MutC1Counter, CritC2Counter, MutC2Counter, CritC1Claim, CritC2Axis).

## Errata intake (round-33 routed defects 1–7)

Source: `corpus/lessons/round-33-verifier-spotcheck.md:153-170`.

| # | routed defect | this round's disposition |
|---|---|---|
| 1 | Adjacency carried claim: re-run the sweep with the regex blind spots fixed and sibling `SKILL.md` / `corpus/knowledge` in scope; count boundaries, not surface strings; record every integrator reversal (criterion 91) | **C1** — the frozen counter's candidate set is exactly that scope (67 lines), the screen ledger closes the vocabulary, and reversals are recorded in `## C1 gate decisions`. `<L1: seat drafts + the reversal list>` |
| 2 | Operability battery v2: randomise subjects/paths/ids (M7); add the 11 MutGateV2 survivors, CritForgeV2B (a)(b), CritForgeV2C as cases | **split** — the 12 baseline survivors are C2's target (ExecKillsA/B); the randomised battery and the B/C constructions stay `notClaimed`. `<L1: what landed, what is carried>` |
| 3 | Calibration counter v4 (still carried since round 32) | **not claimed** (`claims.json` `notClaimed`); v3 stays a no-harm instrument, `mismatches 0` at REV |
| 4 | Integration hygiene: run `check-selfassessment` before each integration commit | **rule + criterion** — `<L1: the L1 rule as practised this round, per-commit readings; criterion number from ScribeQuality>` |
| 5 | Carried precision items | ReopenS128 → ScribeErrataS128 (`<L1: superseding row>`); w2 CritErrataLanded three low items → ScribeCarriedLow (`<L1: corrections>`); CritScreenOthers relabel of kake 396/422/440 → ScribeScreenRelabel (`<L1: rows>`); CritScreenCrawlerSplit kake:411 note → `<L1>`; 404 receipts recorded by body text → `<L1: criterion + the receipt>` |
| 6 | S125 recheck cadence: 90d reason withdrawn | ScribeS125Cadence — `<L1: identical at 156.0.8078.47 with the discriminating reason, or draft-3 landed with the second seat's fetch>` |
| 7 | M3 residual: `c1-J3-junk-rows` reads sibling branch heads at run time and does not rebuild byte-exactly | `<L1: pinned inputs, or the residual recorded in M# with its control>` |

Append-only: every correction cites the stale line in its own document; no prior-round prose byte of
`SKILL.md`, `SCORECARD.md`, `LOG.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`,
`corpus/adjacency.tsv` is deleted (`git diff --numstat BASELINE REV` deleted 0 — the no-harm leg).

## Search log

- **C1.** Question: which sibling lines outside `PROVINCE.md` claim browser ground this lane must answer
  for? Where: 20 sibling `SKILL.md` and `corpus/knowledge/**/*.md` at the frozen pins (C1 counter `PINS`),
  regex `/\btabi\b/i` for set A, plus the round-33 w1 ConnSiblingScan lead list for set B. Date
  2026-10-26. Identified 67 (A 38, B 29), screened 67, included as new map rows `<L1: n>`, screened out
  `<L1: n>`, already mapped 1. Stop rule: the frozen candidate set — no new file family, no new regex this
  round. `<L1: whether the round-33 blind spots (screenshot, profile, headless,
  remote-debugging-port, accessibility, har, loopback, rendered DOM) are in scope of a later sweep>`
- **C2.** Question: what primary source fixes the id shapes the kill cases must not invent? Where:
  `<L1: URLs the scouts opened>`. Date 2026-10-26. Identified `<L1: n>`, opened `<L1: n>`, included
  `<L1: n>` as S130+, excluded `<L1: n>` (`<L1: reasons>`). Stop rule: one primary source per shape rule,
  plus one corroboration for the session binding.
- **Beyond the sweep.** `<L1: leads found but not counted, with why they are out of the frozen set>`.

## Receipts (commands run at drafting; all read-only)

R1 — the frozen digests equal the blobs at the freeze `59f1b47a` (from the lane repo, exit 0):

```
for p in .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
         .ufo/waves/round-34/counters/c2-gate-mutants.mjs \
         .ufo/waves/round-34/baseline/controls.mjs .ufo/waves/round-34/measure.sh; do
  printf '%s  %s\n' "$(git show 59f1b47aae277e1670e4a824173da8cde7e388ee:$p | sha256sum | cut -d' ' -f1)" "$p"; done
# 0dba816c…8781e  c1-adjacency-sweep-v2.mjs      [claims.json frozenDigests: 0dba816c…8781e]
# 3cf5eb69…25b82  c2-gate-mutants.mjs           [3cf5eb69…25b82]
# 18c95d67…f035e  baseline/controls.mjs         [18c95d67…f035e]
# 0a11973d…8602c  measure.sh                    [0a11973d…8602c]
git show 59f1b47a…:scripts/check-adjacency.mjs | sha256sum
# 4e2c2a64…24aac  [claims.json: "scripts/check-adjacency.mjs (pinned inside C1; must stay unchanged)"]
```

R2 — controls: `jq -c 'length' .ufo/waves/round-34/baseline/controls-summary.json` → `9`;
`jq -c '[.[]|.predicate]|unique'` → `[false]`; `jq -c '[.[]|.exit]|unique'` → `[1]`.

R3 — committed counter readings at the baseline:
`jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}' …/c1-at-15dfacc.json` →
`{"predicate":false,"candidates":67,"mapped":1,"screened":0,"unaccounted":66,"newMapped":0,"adjacency":{"verdict":"clean","rows":13,"verified":13,"findings":0}}`;
`jq -c '{predicate,killedCount,survivors,unappliable,twinsFailing,pristine,neutral,decoy,battery}' …/c2-at-15dfacc.json` →
`{"predicate":false,"killedCount":8,"survivors":["M01","M03","M04","M05","M06","M07","M08","M09","M10","M16","M18","M19"],"unappliable":[],"twinsFailing":[],"pristine":{"exit":0,…},"neutral":{"exit":0,…},"decoy":{"exit":0,…},"battery":{"predicate":true,…}}`.

R4 — candidates: `wc -l .ufo/waves/round-34/baseline/c1-candidates.tsv` → `67`;
`jq -c '.candidatesBySet' …/c1-at-15dfacc.json` → `{"A":38,"B":29}`; per-lane counts kake 13, kotoba 13,
kaidoku 9, mori 8, kumitate 5, tameshi 5, kagi 4, kama 4, kasegi 3, tsukuroi 2, chousa 1.

R5 — census: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → `129`; last id S129,
so S130 is next free.

R6 — no-harm leg at the baseline: `jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped}'
…/r33c1-at-15dfacc.json` → `{"predicate":false,"candidates":52,"mapped":8,"screened":44,"unaccounted":0,"newMapped":3}`
(round-33's own target was `newMapped >= 4`; the no-harm reading is `unaccounted 0`);
`jq -c '{mismatches,clean}' …/selfassessment-at-15dfacc.json` → `{"mismatches":0,"clean":true}`.

R7 — ledger state at the baseline: `ls corpus/adjacency-screen-skill.tsv` → absent (new file this round);
`awk 'END{print NR}' corpus/adjacency-screen.tsv` → `45` (header + 44 round-33 rows).

R8 — `grep -n "Round 34" SKILL.md` at the baseline → no match, so every round-34 declaration line is new
by construction; `grep -n '^| tabi | round-34 |' .ufo/l0-questions.md` → no match (a `contested-open` row
needs one the L1 files).

R9 — QUALITY's highest criterion at the baseline is 91 (`grep -nE '^9[0-9]\.' corpus/QUALITY.md` →
`570:90.`, `585:91.`); 92+ is this round's frontier step.

`<L1: after-measurement receipts — measure.sh run, both counter readings at REV, census, no-harm, and the
closing spot-check, each with rev and exit code>`.

## Misroot sweep

`git -C /home/vgpnk/Projects/shokunin status --porcelain` at round end: `<L1: lines and their owner>`.
`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain` at round end: `<L1>`.
No file written by a tabi seat at the fleet root; nothing moved.
