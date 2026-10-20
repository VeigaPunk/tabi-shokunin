VERDICT: ISSUES

Frontier step 3 — mistakes sweep for `corpus/lessons/round-18.md` `## Mistakes`. Read-only: `git show`/`log`/
`diff`/`ls-tree`/`ls-files`/`cat-file`, `grep`, `awk`, `python3 json`, `jq`-free JSON parse. No lane script was
run, no gate/counter/harness/self-test was executed by me, no installs, no writes outside this report. LANE
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; tip `2bff864fdfee684ddbcd066cc8e735adaba2735c`; round-17 measured
M17 `93bfead1f5f25f584353df3152a60209bbd89a2e`; wave-1 product M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`.
Paths below are LANE-relative. Every "observed" line is a command I ran in this session; `[INFERENCE]` marks the rest.

## Candidate rows

Class vocabulary: `CORPUS.md` §Rules added from the kaika campaign (`.ufo/waves/kaika-w1/mistakes.md` §5).

| # | Class | Evidence pointer | Captured-by | Fix (red case named) |
|---|---|---|---|---|
| R1 | survivor | 14 gate self-test survivors: `w2/MutRoundLaneTip.md:24,25,26,27,28` (M2 no-`--no-recurse`, M3 status-128, M5 nested-parent discovery, M6 inherited Git env, M7 resolve-per-read); `w2/MutUserLaneTip.md:5,21-27` (6 of 8); `w2/MutBindLaneTip.md:3,22,25,26` (3 of 8) | none (QUALITY 25 governs counters, 27 prose about probes) | Add one self-test case per survivor with expected exit/finding. Red case: mutant M3 (`sym.status === 1 \|\| sym.status === 128`) makes `check-round-contract.mjs --self-test` exit **0** today (`MutRoundLaneTip.md:25` "Mutant exit 0"); after the fix the same mutant must exit 1 with `lane_tip_symbolic_ref_status128 FAIL` while pristine stays 0. Same shape for M2/M5/M6/M7 and the user/bind sets. |
| R2 | reference-drift | Counter repairs witnessed only by wave-report lines and removed `/tmp` objects: `w1/C2Counter.md:87-91` ("all 23 forge commits 0", `rerun-c2counter-w2.json`), `w1/C1Counter.md:128-145` (mutant commit `fb85203b896bc2898aece3be007463d52cee8f7f`) | 28 (added this round) | Commit the forge rerun JSON and the mutant patch/generator under `corpus/evidence/round-18/routed/`, or add a counter-owned probe that builds the mutant in-sandbox. Red case: `git cat-file -t fb85203b…` → `fatal: git cat-file: could not get object info`; `git ls-files \| grep 'rerun-c2\|forge-results'` → empty (both observed). |
| R3 | reference-drift | D5: seven harness reruns recorded as 8-hex prefixes from a removed `/tmp` sandbox — `w2/ReRunHarness.md:28-33` (`0cfaeb7e…`, `302cf584…`, …), spot-check `:163` | 28 (`abbreviated digest`), drafted QUALITY 36 | Re-run 7× at `93bfead` with `--out` into `corpus/evidence/round-18/routed/harness-reruns/` and record full 64-hex + producer digest. Red case: `grep -r 302cf584` resolves only to the report line; no committed object carries those bytes, so the digest cannot be checked. |
| R4 | stale-premise | S053 keeps the falsified premise in two cells (anchor and teaches) and no correction pointer reaches it: `corpus/SOURCES.md:67`; S057 supersedes S053 but itself carried the premise until `93bfead` (`corpus/SOURCES.md:71`); routed at `corpus/lessons/round-17-verifier-spotcheck.md:162` | 4 (append-only errata; no sweep clause), drafted QUALITY 33 | S058 plus an append-only `corpus/README.md` index row naming `S053 → S058`, and extend C3 `d4` (`PLAN.md:99`) to the sweep. Red case: `grep -c 'individual publisher' corpus/SOURCES.md` = 2 today and README has no S053/S057 row (`grep -n 'S053\|S057' corpus/README.md` → only `:368`), so `d4` as specified passes while S053 still asserts the false premise. |
| R5 | number-drift | `corpus/lessons/round-17.md:116` "Map: 10 rows, 7 siblings"; fleet report `:35`; spot-check `:159` | none at B, drafted QUALITY 34 | Corrections line recomputing the count. Red case: `git show 93bfead:corpus/adjacency.tsv \| awk -F'\t' 'NR>1{print $2}' \| sort -u \| wc -l` → `6` (also 6 at tip), against the written `7`. |
| R6 | landing | Harm set measured at the wave-1 product, not the measured revision: `w2/HarmAfter.md:3,20` (M stated as `6c97851`, "20/20 exits equal"); spot-check `:160` | none (26 makes the receipt name its own revision; no criterion binds the verdict to the measured revision), drafted QUALITY 35 | Receipt at `93bfead` naming all 20 gates of `.ufo/waves/round-17/harm-baseline.json` (observed `len(gates)=20`). Red case: `corpus/evidence/round-18/routed/harm-at-93bfead.json` absent at B; the only harm artifact says `6c97851`. |
| R7 | landing | Adjacency self-test evidenced only by a wave line: `w1/C3Checker.md:103` (`ADJACENCY_SELFTEST verdict=clean cases=57 …`); spot-check `:161` | 26 (a run claim needs argv/exit/producer receipt), drafted QUALITY 37 | Receipt under `corpus/evidence/` with argv, exit, stdout, producer sha256 = blob at `93bfead`. Red case: `git ls-tree -r --name-only 93bfead corpus/evidence/round-17` lists 21 files, none named `adjacency*`; the only `selftest.json` in round-16/17 evidence is the binding gate's (`corpus/evidence/round-16/binding/selftest.json`), so no adjacency argv/exit exists in the category. |
| R8 | scope | The wave-2 harness audit's remaining findings are inside neither the round-18 claim nor any durable ledger: `w2/SentinelHarnessAfter.md:77` (S3 argv allowlist absent), `:82` (S2 `loopbackOnly:true` / unconditional `webSockets`), `:92` (S6 unbounded CDP `output`/`exception`, 64 KiB ledger cap only), `:100` (S8 `NODE_PATH` search, package.json-only version, no entry-module sha); note's debt list `corpus/knowledge/webmcp-invocation-round-17.md:99-107`; SCORECARD debt `:813-815`; C2 hazards `PLAN.md:30-36` | 27 closest (a probe description must end with the shapes left untested), not met | One durable line per hazard id (note limits, SCORECARD planned block, or a routed row). Red case: `grep -rIl 'argv allowlist\|NODE_PATH\|loopbackOnly\|routeWebSocket\|cap each field' LOG.md SCORECARD.md SKILL.md corpus/QUALITY.md corpus/lessons/round-17.md corpus/knowledge/webmcp-invocation-round-17.md` → empty for every pattern (observed). |
| R9 | vacuous | QUALITY 29's printed-anchor clause names output two gates never emit: `corpus/QUALITY.md:117-121` ("printed as the 40-hex in `code_revision=`/`codeRevision=`"); `scripts/check-measurement-binding.mjs:752` prints `MEASUREMENT_BINDING verdict=… claims=… bound=…` with no revision and the blob contains 0 occurrences of `codeRevision`; `scripts/check-round-contract.mjs:683` clean line has no revision (anchor only as `measured-against=` per round, `code_revision=` only in `--count-witness` at `:1200`); `scripts/check-user-round-contract.mjs:717` same | none (2 governs claims, not criterion output fidelity). CriticQualityDraft `:6` fixed only the `measuredRevision` half | Narrow 29 to the witness subcommands, or print the anchor on each production verdict line. Red case: `git show refs/heads/master:scripts/check-measurement-binding.mjs \| grep -c codeRevision` → `0`; production stdout of all three gates carries no 40-hex of the anchor (observed). |
| R10 | reference-drift | Frozen note cites fields that do not carry the fact: `corpus/knowledge/webmcp-invocation-round-17.md:40` (Origin row) cites `.loopback`/`.flags.browserArgsAll` for "`HOME`/`XDG_CONFIG_HOME` redirected"; receipt `.loopback` = `{externalRequestsBlocked, externalRequestCount}`, `.flags.browserArgsAll` = 2 entries with no HOME/XDG/user-data arg, and the fact lives in `.safety.minimalEnv` (unfixed `w2/RevNoteVsReceipt.md:106-112` F11a) | 28 (pointer must resolve as the bytes it supports) | Append-only index row or erratum naming `.safety.minimalEnv`; the pin stays untouched (QUALITY 31). Red case: a counter that requires each cell's cited receipt subtree to contain the cell's fact fails — observed: `HOME`/`XDG` appear only under `.safety.minimalEnv`. |
| R11 | reference-drift | S043's anchor cell does not cover the note's cites: `corpus/SOURCES.md:57` anchor = "§4.2 executeTool lines 1023-1185, §3 error table lines 260-301", while the note cites `:555-560` and `:639-643` (`w2/RevNoteVsReceipt.md:106-114` F11c, "widen the anchor append-only"); anchor unchanged at tip | 28 with 12 | Widen S043's anchor append-only (old→new logged) or add an errata row. Red case: parse the note's `S043` cites and the row's anchor ranges; two cites fall outside both ranges at `93bfead` and at tip (observed). |
| R12 | scope | Misroot claim scoped to a tree that git cannot see: `w2/ScoutMisroot.md:3` ("Fleet status cannot see the lane trees at all", `.gitignore:1` `*-shokunin/`), while fleet report `:125` phrases it as a sweep | none | State "fleet-root only" in the report/lesson and require a lane-local status check for any future no-misroot claim. Red case: a file written under `kaidoku-shokunin/` leaves `git -C /home/vgpnk/Projects/shokunin status --porcelain` clean — the sweep's own finding (`.gitignore:1`, observed). |
| R13 | landing | Protocol/operator debt carried ≥3 rounds with no pin, owner or closing surface: `corpus/lessons/round-15-verifier-spotcheck.md:123` item 4 (`:40` disclosure), `corpus/lessons/round-16-verifier-spotcheck.md:153` item 6 (`:46`), `corpus/lessons/round-16.md:109` item 4, fleet report `:132` | none (8 pins verified *rejects* after 3 rounds; debt has no counterpart) | Pin it once with owner, evidence and closing round. Red case: a ledger rule "an item in three consecutive routed lists must have a pin row" exits 1 at B — observed: the same item appears in the round-15, round-16 and round-17 lists with no pin row. |
| R14 | vacuous | "all 86 reported" (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-17/tabi.md:110`) while 3 of 86 reports are header-only: `w2/ScoutSeatTally.md` tally row "first-line report verdicts: 53 PASS, 30 ISSUES, 3 header-only" | none | Count delivered separately from files present. Red case: a tally that requires first-line `VERDICT:` in `{PASS, ISSUES, BLOCKED}` exits 1 at B with 3 header-only. Quoted from the seat's tally; I did not re-count. |

## Red-case transcripts (what makes each fix falsifiable)

- R1: `w2/MutRoundLaneTip.md:25` row `M3 / kdvfqzvo … Mutant exit 0 | SURVIVED`; the report also records that the
  existing `lane_tip_invalid_head` case still PASSed under M3, so the gap is not self-detected.
- R2: (a) `git cat-file -t fb85203b896bc2898aece3be007463d52cee8f7f` → `fatal: git cat-file: could not get object
  info`; (b) `git ls-files | grep -i 'rerun-c2\|forge-results'` → no output (exit 1); (c) the round-17 evidence tree
  at `93bfead` holds 21 files (11 under `routed/{binding-hardened,liar}`, 10 invocation incl. 7 fixtures) and no
  forge/rerun artifact; tip holds 27, the 6 added being the round-end `binding/` receipts and the measurement files.
- R3: `w2/ReRunHarness.md:28-33` lists `committed 0cfaeb7e…, r1 302cf584…, … r9 a2f8462f…`; the sandbox
  `/tmp/tabi-r17w2-ReRunHarness-3092` is recorded removed at `:117-118`.
- R4: `grep -rn 'individual publisher' --include=*.md --include=*.tsv .` → `corpus/SOURCES.md:67` and `:71` only;
  `git show refs/heads/master:corpus/README.md | grep -n 'S053\|S057'` → only `:368` (the round-17 note row).
- R5: awk/sort -u count = 6 at `93bfead` and at tip; written value 7.
- R6: `git show 93bfead:.ufo/waves/round-17/harm-baseline.json` parsed: `gates` length 20; `w2/HarmAfter.md:3`
  names `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`.
- R7: no `adjacency*` path in `corpus/evidence/round-17` (`git ls-tree -r`); the only `selftest.json` in round-16/17
  evidence is `corpus/evidence/round-16/binding/selftest.json` (binding gate); the only statement of the 57 adjacency
  cases is `w1/C3Checker.md:103` plus `SKILL.md:1940`.
- R8: the five durable-file greps return no filename for `argv allowlist`, `NODE_PATH`, `loopbackOnly`,
  `routeWebSocket`, `cap each field`; `receipt_differs` and `S4b` are likewise absent from the same six files.
- R9: `grep -c codeRevision` over `check-measurement-binding.mjs` = 0; clean lines at `check-round-contract.mjs:683`
  and `check-user-round-contract.mjs:717` carry `rounds=`/`consequential=` only.
- R10: receipt parse: `safety.minimalEnv` = `"HOME/XDG_CONFIG_HOME redirected to temp dir (isolates Arch
  chromium-flags.conf)"`; `loopback` keys = `["externalRequestsBlocked","externalRequestCount"]`;
  `flags.browserArgsAll` length 2, no HOME/XDG/user-data entry.
- R11: `corpus/SOURCES.md:57` anchor ranges `1023-1185`, `260-301`; note cites `:555-560`, `:639-643`.
- R12: `/home/vgpnk/Projects/shokunin/.gitignore:1` = `*-shokunin/`.
- R13: the four citations above, all containing "carried"/"still absent".
- R14: `w2/ScoutSeatTally.md` tally row (quoted, not re-run).

## Which round-17 wave-2 findings remain open and unrecorded

Explicit answer to the named four, plus the rest of the same audit:

| Finding | Status at tip | Where it is (not) recorded |
|---|---|---|
| S3 argv allowlist (`SentinelHarnessAfter.md:77`) | **open** — no `load-extension`/`proxy-server`/`no-sandbox` rejection in `effectiveArgv` | nowhere durable (R8) |
| S2 overclaims (`:82`) | **open in bytes** — `safety.loopbackOnly:true` and the unconditional `webSockets` string are in the frozen receipt; the note's page-level scope (`note:94`) mitigates the reading, not the fields | fields named in no durable file (R8) |
| S6 uncapped fields (`:92`) | **open** — CDP frames/`output`/`exception` verbatim and unbounded; ledger POST cap 64 KiB with no POST count | nowhere durable (R8) |
| S8 `NODE_PATH` (`:100`) | **open (LOW)** — `NODE_PATH` search at harness `:187-188`, version from package.json only, no entry-module sha | nowhere durable (R8) |
| S4b uncleared per-case timer (`:103`) | open, not reproduced | nowhere |
| ReRunHarness limit 2, default `--out` re-run always exits 2 `receipt_differs` (`w2/ReRunHarness.md:105-107`, harness `:2101`) | open — a rechecker can misread a refusal as `could_not_evaluate` | nowhere (`grep receipt_differs` in the six durable files → empty) |
| 14 gate self-test survivors | open; gates byte-identical `6c97851 → tip` (`check-round-contract` `8272d03f6ce188de1a83b40bd01029e235e9259f`, user `9ebe31193325eb690e968ff09ef324400ae51fdb`, binding `57d0aa5a74beffb313451ae0fed7934cbac6a418` at both) | only as four shapes at `SCORECARD.md:814-815`; 10 of 14 survivors unnamed and uncounted |
| C2 23-forge rerun, C1 range mutant | repairs landed (`measure-c2.mjs` `079dcc39…`; `measure-c1.mjs` `47185c8c07bdd065b7e6cd4d1e3e3d57f07507b414c0f8bc3bb905d63a322d9f` at `6c97851` → `1bb9804acd6b1a52eb356efdb325c7eb835eb7ecc610357944bcfd30bd87f4d2` at tip; `measure-c1` diff `6c97851→93bfead` = +93/−13) | red-before evidence unrooted (R2) |

Closed or claimed, so not candidates: S7 (no `toolCalled` subscription), H1–H4 and S1 (round-18 C2 hazards,
`PLAN.md:30-36`), ReRunHarness limit 3 (now counter-pinned: `measure-c2.mjs:429-435,557-564`), `measure-c3` F7
(`SELF_LANE` at `:1233,1312`), note F1–F10 (corrections diff `6c97851→93bfead`, 34+/20-, except F11a/F11c = R10/R11).

## Relation to already-drafted criteria (avoid duplicate rows)

A round-18 scribe has drafted `corpus/QUALITY.md` 33–38 at `.ufo/waves/round-18/drafts/quality-append.md:1-6`:
33 premise sweep (R4), 34 prose count (R5), 35 harm revision (R6), 36 full digest (R3), 37 self-test receipt (R7),
38 recheck receipt (spot-check item 4). **Not covered by any drafted criterion:** R1, R2, R8, R9, R10, R11, R12,
R13, R14. `PLAN.md` C3 `d4` checks only S058's own cells, so it does not see R4's residual; `d3` cannot see R2's
unrooted forge rerun.

## Remaining unknowns

- [INFERENCE] The round-18 harness (`scripts/webmcp-invoke-round18.mjs`, new file) will inherit S3/S6/S8 unless the
  fixes are copied; the C2 claim does not name them, and the round-17 harness stays byte-frozen, so S2/S3/S6/S8 on
  the 17 harness will never close in code — only by ledger line plus supersession.
- R14's "3 header-only" is the seat's count, not mine.
- I did not attempt to fetch `rerun-c2counter-w2.json` or the C1 mutant from any surviving `/tmp` (no such file in
  LANE; the reports state the sandboxes were removed), so R2 is absence-of-committed-root, not proof the run was
  never executed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReconMistakes.md
