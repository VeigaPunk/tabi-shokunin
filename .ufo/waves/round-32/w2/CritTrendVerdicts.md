# CritTrendVerdicts — round 32 w2: pre-falsifying the three trend verdicts

**Verdict (one paragraph).** As the revision under attack (`b234a58920134424e0d104f137311ff54a16d26b`) stands the
three trends are writable as **expansion: improved (narrowed), quality: harmed, discernment: unproven** — and
`improved` expansion with `harmed` quality is exactly the trade `LEARNING.md` forbids admitting ("reported as a
trade, never admitted"). The expansion claim survives an outside re-fetch: all four admitted rows reproduce
byte-for-byte at 17:17Z (S123 25,265 B `f633…207`, S124 4,235,856 B `dc10…d4d4`, S125 raw 90,944 B → decoded
68,207 B `7b40…abb5`, S126 1,882,653 B `929f…919e`), the Chrome-docs reject reproduces (`webSocketUrl` occurs
exactly twice on `/docs/chromedriver/downloads`, both the 2023 issue title), the coverage map moved append-only
(`corpus/README.md:191` keeps its bytes, `:718-735` records runtime-held), the knowledge count rose 50→51 with one
`A` entry (`corpus/knowledge/webdriver-bidi-runtime-round-32.md`) whose three cited rows S124/S125/S126 are all
`mined`, and the capability row `SCORECARD.md:1663` names an operation rather than a gate (criterion 84). But
quality is harmed by the round's own wave-1 evidence: the admitted entry says the collector size limit and
total-storage behaviour are **"unmeasured"** (`…runtime-round-32.md:103`) when w1 `ExecCollectorTiming` measured
them (`runs/out9`–`out12`: a 20,000-byte body returned in full at `maxEncodedDataSize: 200`; the threshold tracks
the response header block; `maxTotalCollectedSize` moved nothing), and the matrix's operational clause
(`…capability-matrix.md:71` "`maxEncodedDataSize` limits each item"; `:157-161` "with the body within that
collector's `max encoded item size`") is contradicted on this build while **nothing in the corpus records the
contradiction** (`grep -n -i 'collector\|maxEncoded' corpus/lessons/round-32.md` → exit 1). That is `LEARNING.md`'s
quality-harm condition verbatim ("an entry is found false or stale and left unmarked"). Discernment cannot be
written `improved` from anything the lane produced this round: the lesson records the mandated spot-check as
**owed** (`corpus/lessons/round-32.md:39`), and my own re-fetch — like every w1/w2 seat — is lane-dispatched
("a subagent the lane dispatched is still the lane"). The gap is closable append-only, with no frozen-script
change: one errata line under the entry's `:103`, one bullet at the matrix correction's `:249`, one `## Mistakes`
row, and an outside spot-check before the verdicts are written.

## What I attacked

(a) each trend's `improved`/`harmed` condition against the revision's actual bytes; (b) whether the new entry
stands on coverage-map ground the map did not hold, with every `source:` citing a `mined` row opened this round
(S123 vs S119 included); (c) whether any admitted entry fails a re-check — specifically the matrix's 2026-10-20
collector correction against w1 `ExecCollectorTiming` case 3 and its sweeps; (d) the Gate's four admits, two
document rejects and the R16 refusal, by independent HTTPS re-fetch of the cited bytes; (e) whether M1–M5 each
carry a criterion or a fix and whether the table is complete; (f) whether either claim's own counting predicate
survives at REV without a browser. I edited no lane file, ran no lane script, and did not run the `--live` leg.

## Commands and exit codes

All lane-script runs were in `$S/clone` = `/fast/scratch/hyaku/tabi-r32/CritTrendVerdicts/clone`
(`git rev-parse --show-toplevel` → that path; `git status --porcelain` → empty), checked out detached at
`b234a58…`. `TMPDIR=/fast/scratch/hyaku/tabi-r32/CritTrendVerdicts` throughout.

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `git clone --shared …/tabi-shokunin "$S/clone"` + `git -C "$S/clone" checkout -q --detach b234a58…` | 0 | `head=b234a58920134424e0d104f137311ff54a16d26b`, `status=[]` |
| 2 | `sha256sum clone/scripts/check-{bidi-runtime,selfassessment}.mjs` | 0 | `2f25af5a…c393`, `77b5c8ed…6a9` = `claims.json.frozenDigests` |
| 3 | `git -C "$S/clone" diff --name-only 4181fff b234a58 -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs` | 0 | empty (counters unchanged after the freeze) |
| 4 | `node scripts/check-bidi-runtime.mjs --rev b234a58… --baseline d805d1d… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json` (no `--live`) | 0 | `population 16, admitted 16, failing 0, binding null` (`bidi-offline.json`) — the **offline** leg only; `--live` unrun by me |
| 5 | `node scripts/check-selfassessment.mjs --rev b234a58… --json` | 0 | `mismatches 0`, `clean true`, `counted []`, `findings 202` (115 `m1-selftest-tally`, 77 `m2-receipt-exit`, 10 `m4-nudge-state`) |
| 6 | `node -e` over that JSON: m4 findings | 0 | 10 rows; `:1473`, `:1515`, `:1576` → `claimed inactive / observed active / superseded true`; `:1643` (round 32's own group) → `active/active`; six earlier rounds `inactive/inactive` |
| 7 | `node scripts/check-selfassessment.mjs --selftest` | 0 | last line verbatim `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41`; 41 `CASE` lines |
| 8 | `git diff --numstat 4181fff b234a58 -- SKILL.md corpus/README.md SCORECARD.md LOG.md` | 0 | `106/0`, `62/0`, `135/0`, `41/0` — zero deletions |
| 9 | `ls corpus/knowledge/*.md \| wc -l`; `git ls-tree --name-only 4181fff corpus/knowledge/ \| grep -c '\.md$'` | 0 | 51 at REV, 50 at the freeze |
| 10 | `git diff --name-status 4181fff b234a58 -- corpus/knowledge/ corpus/lessons/` | 0 | `M rate-signal-decision-table.md`, `M webdriver-bidi-capability-matrix.md`, `A webdriver-bidi-runtime-round-32.md`, `A lessons/round-32.md` |
| 11 | `node -e` over `corpus/evidence/round-32/bidi/receipt.json` re-hashing each named file | 0 | 2 runs; run1 `8aa97463…` and run2 `9918a716…` both match their declared digests and differ; driver `55dbef88…` matches, ≠ gate `2f25af5a…` |
| 12 | `curl -q -sS --proto =https` ×4 (+ gitiles `?format=TEXT`, base64 -d) | 0 | all HTTP 200 — digests in `.ufo/waves/round-32/w2/CritTrendVerdicts/refetch-receipts.md`; S123 = `f633…`, S126 = `929f…`, S124 = `dc10…`; S125 decoded sha = `7b40…` |
| 13 | `grep -n "September 2022" rfc9309.txt`; `grep -n "June 2022"` | 0 | `11: September 2022`; June 2022 only at `554`, `559` (the RFC 9110/9111 reference entries) |
| 14 | `sed -n '11306,11308p;1976,1980p' webdriver2.html`; `grep -o -i websocket \| wc -l` | 0 | `"<code>ignore</code>"` + "All simple dialogs encountered should be left to the user to handle."; "Defaults to `dismiss and notify`"; case-insensitive `websocket` count **0** |
| 15 | `grep -o -i '.\{0,120\}websocketurl.\{0,120\}' chromedriver-downloads.html` | 0 | exactly 2 hits, both `Resolved issue 4295: ChromeDriver with "webSocketUrl": true is racy` |
| 16 | `sed -n '285,290p;405,410p' session_commands.cc` (S125, decoded) | 0 | `if (session->web_socket_url) { caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id); }` at 287-289; "Create a hidden target for running  BiDi-CDP mapper in it." at 407 |
| 17 | `grep -n -i "collector\|maxEncoded" corpus/lessons/round-32.md` | **1** | no match — the round's lesson does not record the collector finding at all |
| 18 | `grep -rn "maxEncodedDataSize\|max encoded item size\|maxTotalCollectedSize" corpus/knowledge/ corpus/lessons/round-32.md SCORECARD.md SKILL.md corpus/README.md` | 0 | matrix `:71`, `:159`; runtime entry `:103`; `SKILL.md:2664`, `:2693` (no third corpus statement) |
| 19 | `sed -n '52,60p' corpus/lessons/round-32.md`; `sed -n '39p'` | 0 | Mistakes rows M1–M5; the spot-check line reads "owed to the round's non-author closure; seats this lane dispatched are the lane" |
| 20 | `sed -n '514,520p' corpus/QUALITY.md` | 0 | criterion 85's source line: "(source: corpus/lessons/round-31.md M11; corpus/lessons/round-32.md M4)" |

## Trend 1 — expansion: propose `improved`, narrowed

Observable met: net new admitted entry on ground the map did not hold, each `source:` citing a `mined` row.

- One new admitted entry, count 50→51 (`corpus/knowledge/webdriver-bidi-runtime-round-32.md`, `A` in #10), indexed
  at `corpus/README.md:716`.
- Its `source:` line cites S124, S125 **and** S126; all three are `mined` at `corpus/SOURCES.md:138-140`, and each
  was opened this round — S124 as a re-open whose bytes are identical to S005's (`:138`, "byte-identical to S005's
  2026-10-19 fetch"), S125/S126 as new rows. My fetch #12 reproduces all three digests independently.
- The ground was **not held**: `corpus/README.md:191` (round 1) read "WebDriver BiDi | docs-held — spec map only;
  no BiDi session measured", and `…capability-matrix.md:10`, `:56` and every row's last column read `no`. The
  round appends the restatement at `corpus/README.md:718-735` and a dated matrix correction at `:168-261` without
  editing a byte above (`numstat` `95 0` per sibling `CritMatrixAddendum`; my #8 confirms no deletions in the four
  claimed documents).
- One genuinely **new surface**: R17 dialogs. `…capability-matrix.md:76` recorded "not currently a tabi surface (no
  anchor — honest lane-coverage gap)"; at REV the lane has a measured row (`entry:87`), a SKILL routing row
  (`SKILL.md:2669`), a recipe step (`:2712-2713`) and an error signature (`:2723-2726`).
- A capability enters: `SCORECARD.md:1663`, `First-working round: 32`, naming a transport **operation** ("Drive a
  WebDriver BiDi session on this host…") rather than a gate, with the operative rule at `:1633-1635` — criterion 84
  satisfied.

**Strongest counter-evidence (two, one of them a closure condition).**

1. *Sixteen of the seventeen rows are a filled column on ground the matrix already mapped.* `entry:4` says it
   itself: "It does not re-litigate the matrix's gap analysis; it fills the 'measured' column." The only
   surface that was not already mapped is R17, plus the transport capability. A verdict written as "seventeen
   surfaces measured" or "the matrix is now runtime-held" overstates: `entry:190-193` and
   `…capability-matrix.md:246-254` keep wire-truth, DOMSnapshot columns, the history-entry list, `insertText` and
   retroactive retrieval unmatched, i.e. five of the sixteen `yes` rows are explicitly *not* contract-equivalent.
2. *The capability row's demonstration does not exist at REV.* `SCORECARD.md:1663`'s evidence pointer ends
   "demonstration = the round report's measured C1 run". `AXES.md` §Capabilities: "a capability without a passing
   demonstration in the round report is pre-claiming and does not enter the table". At `b234a58` the capability is
   already in the table and the report is not written, so the row is pre-claiming **until** the closed round's
   report carries the run (the pointer's other three targets — script, receipt, entry — do resolve).

Smallest safe correction: none to existing bytes. (i) Write expansion as "one new surface (R17 dialogs) + one
capability + sixteen rows of depth on mapped ground"; (ii) make the round report carry the C1 run so `:1663`'s
pointer resolves, or the capability row is pre-claiming.

## Trend 2 — quality: propose `harmed` at REV; `improved` only after one append-only correction lands

What improved and holds under independent check:

- **S123 supersedes S119 — holds.** `corpus/SOURCES.md:137` carries `supersedes S119 —`; my fetch #13 puts the
  publication month at header line 11 (`September 2022`) and `June 2022` only inside the two reference entries
  (554, 559); the byte count and digest equal S119's own receipt (`f633…`, 25,265 B). S119 keeps `mined`
  (`SOURCES.md:133`, recheck `365d`), which is the registry's immutability convention already exercised by
  S082/S095/S096, and the decision table states the correction append-only (`rate-signal-decision-table.md:210-231`,
  errata block at `:214`). A weaker row was superseded by a stronger one with no threshold moved.
- **Four rows re-verified same-day.** My re-fetch (#12) at 17:17Z reproduces S123, S124, S125 (decoded) and S126
  byte-identically to the registry anchors — freshness holds for this round's ground without trusting the seat
  receipts.
- **C2's calibration leg — holds.** `mismatches 0` (#5), the three named m4 lines are `superseded: true` (#6), and
  the four corrected documents lose zero lines (#8). The correction's quoted oracle line is verbatim true (#7).

**The counterexample (medium).** Two corpus statements that the round's own w1 evidence contradicts, left unmarked:

- `corpus/knowledge/webdriver-bidi-runtime-round-32.md:103` — "`maxEncodedDataSize` and total-storage behaviour,
  stream collectors and retrieval cost (U4) are unmeasured". Measured by w1 `ExecCollectorTiming` in the same
  round: `.ufo/waves/round-32/w1/ExecCollectorTiming/runs/out10/summary.json` case `b20000-l200` (20,000 B returned
  in full at limit 200), `out11` (first success at 198 B with a default header block; 320 with +100 B header; 820
  with +600; 1450 with +1200), `out12` (`maxTotalCollectedSize` 200 still returns 20,000 B; 190 still fails).
  Only "stream collectors" is genuinely unmeasured.
- `corpus/knowledge/webdriver-bidi-capability-matrix.md:71` ("`maxEncodedDataSize` limits each item and total
  storage is implementation-defined") and `:157-161` ("with the body within that collector's `max encoded item
  size`"). The round's own correction block cites the 2026-10-20 correction as R12's authority (`:247-249`) while
  leaving both clauses standing; case 3 of `ExecCollectorTiming` and the sweeps show the *implementation* never
  gates on the body. The actionable harm: the lane's live path passes `65536` (`SKILL.md:2693`, both transcripts
  `transcript.jsonl:8`), which clears the threshold, but a later script that lowers the limit toward the body size
  gets **silence plus a misleading `no such network data`**, not a truncated body.
- Completeness: the lesson's `## Mistakes` (`corpus/lessons/round-32.md:52-60`) has no row for this, and
  `grep -n -i 'collector\|maxEncoded'` on the lesson exits **1** (#17) — the round's own w1 measurement is unmined,
  against `LEARNING.md` §3 ("Mistakes are mined too").

`LEARNING.md` quality `harmed` = "an entry is found false or stale and left unmarked". Both findings are the same
kind: a statement a reader would act on, contradicted by evidence the round itself produced, with no superseding
text. That is why the round cannot be admitted at `b234a58` on the "expansion improved" line: `LEARNING.md` §The
three trends — "Growth without quality is not learning: `expansion: improved` with `quality: harmed` is a trade,
reported as a trade, never admitted."

Smallest safe correction (append-only; no frozen script touched; sibling `CritMatrixAddendum` F1 drafts the matrix
half, my entry-side line is the missing other half):

1. One bullet appended at `…capability-matrix.md:249` naming `:71` **and** `:157-161` as superseded on this build:
   the limit does not cap the body, a limit below the response's header-block size makes the record vanish
   (`no such network data`, never `unavailable network data`), `maxTotalCollectedSize` had no effect; evidence
   `ExecCollectorTiming` `runs/out9`–`out12`; the committed `65536` is above that threshold.
2. One errata line under `entry:103` stating the limit and total-storage behaviour **were** measured in w1, with the
   same pointer, and keeping "stream collectors" and "retrieval cost (U4)" as the unmeasured remainder.
3. One `## Mistakes` row (M6, class `unrecorded-measurement`): a w1 measurement that contradicts an admitted
   entry's limits table and the matrix's operational clause, recorded nowhere; fix = items 1 and 2 plus a criterion
   if the lane judges a class criterion owed (see discernment below).

## Trend 3 — discernment: `unchanged`/unproven at REV; cannot be `improved` from lane-internal evidence

**Gate decisions survive an outside re-fetch.** Admit S123 ✔ (`September 2022` at header line 11; `June 2022` only
at 554/559; digest and byte count identical), S124 ✔ (4,235,856 B, `dc10…`, byte-identical to S005's revision — a
re-open, correctly not recorded as a supersession), S125 ✔ (decoded `7b40…`; `:287-289` and `:407` exactly as the
row's anchor says), S126 ✔ (0 case-insensitive `websocket`; `"ignore"` handler at 11306-11307 with the quoted
sentence; §7 default `dismiss and notify` at 1976-1980). Reject *Chrome-docs page* ✔ (two occurrences of
`webSocketUrl`, both the 2023 issue title — "an issue title is not an enabling instruction", and the flip is a
Chrome-owned page). Reject *editor's draft* ✔ (the same two claims, undated; an undated duplicate adds no ground
and the lane's practice is dated bytes). Refuse *R16 measured* ✔ (the gate's population is 16 at REV, #4: R16 is
not admittable, so `x2-no-counterpart` is load-bearing, not decorative). I found **no disagreement** with a gate
decision.

**But the verdict cannot be written.** `corpus/lessons/round-32.md:39` states the spot-check is **owed**:
"Spot-check (`LEARNING.md` §Discernment): owed to the round's non-author closure; seats this lane dispatched are
the lane." `LEARNING.md` §Discernment is explicit that a dispatched subagent does not count, so neither the w1/w2
seats nor this report discharge it, and `discernment: improved` written without it is self-attestation; the only
sanctioned route for an unprovable improvement (exploratory claim + named non-author reviewer) is not used this
round. **Strongest counter-evidence to any `improved`:** the spot-check text is still the promise, not the result,
and the round's own `## Mistakes` cites no outside reviewer.

Two low defects in the round's discernment artifacts:

- **D1 (low) — `corpus/QUALITY.md:514-520` (criterion 85) cites `corpus/lessons/round-32.md M4` as a source.**
  M4 (`lesson:59`) is `number-drift` in the drafted nudge corrections — the m4 class's citation/state-word
  blindness — not the failed-oracle-refusal class criterion 85 states. The supporting lesson is round-31 M11; the
  round-32 ground is the artifact `measure/c2-refusal-mutant.txt` (39/41, exit 3), which the criterion already
  names. A criterion citing a lesson that does not support it is the "criterion with no lesson behind it" hazard in
  reverse. Fix: one corrective line (lesson errata or criterion 87) naming M11 plus the artifact as the sources and
  withdrawing the M4 pointer.
- **D2 (low) — M5 has a fix but no criterion, and no criterion covers its class.** M5 (`lesson:60`, class
  `provider`) was caught by the claims rule ("build the cheapest control before freezing") and fixed in
  `5ad1fcbf` before the freeze; the row has no criterion, and nothing in `QUALITY.md` says a live leg must be run
  under the *final* environment before the freeze — which is precisely what would have caught it as a rule rather
  than as luck. `LEARNING.md` §3: a mistake "when no criterion caught it" gets a `QUALITY.md` criterion citing the
  lesson. Fix: criterion 87 quoting M5 ("a live control leg is scored under the exact environment the freeze will
  use; a control that fails for an environment reason is disclosed, not silently retried") — the same criterion
  also carries D1's correction. M1→83, M2→86, M4→83/84 land with lesson pointers and red states (I re-ran both
  red-state files' claims where cheap: c2-J1 red is recorded, `measure/c2-refusal-mutant.txt` is cited, and
  `measure/c1-distinct-red-green.txt` shows 3 reds/1 green). M3 was caught by `CORPUS.md`'s quote-location rule, so
  nothing is owed.

## Impacted axes

| axis | effect of the findings |
|---|---|
| coverage | holds, **narrowed**: 1 new surface (R17) + capability; do not write "seventeen" |
| depth | **harmed** at `entry:103` and `matrix:71`/`:157-161`; repaired by the two appended bullets |
| freshness | holds: four rows re-verified byte-identically by an outside fetch the same day |
| calibration | holds: `mismatches 0`, 3/3 m4 lines superseded, 0 deleted lines, selftest `cases=41 passed=41` |
| operability | holds, with one gap: `SKILL.md:2693` uses `65536` with no warning that lowering it yields silence — the matrix bullet in quality-fix 1 covers the recipe's readers |
| adjacency | untouched; no contested scope in C1/C2 |

## What the L1 must not write at closure

- "seventeen of seventeen" / "the matrix is runtime-held" without the five unmatched contracts named
  (`matrix:246-254`).
- `quality: improved` while `entry:103` and `matrix:71`/`:157-161` stand uncorrected — the round is then a trade,
  not an improvement.
- `discernment: improved` without a non-author (not lane-dispatched) spot-check recorded with `agree`/`disagree`,
  a reason, and at least one admit and one reject.
- `C1 admitted` on the offline reading: my #4 is the offline leg only. The `--live` leg is somebody else's receipt,
  and `claims.json` C1 says the offline reading alone does not verify (control J3).

## Hygiene and authorizations

- Scratch `/fast/scratch/hyaku/tabi-r32/CritTrendVerdicts` removed after copying receipts into
  `.ufo/waves/round-32/w2/CritTrendVerdicts/` (`bidi-offline.json`, `c2.json`, `selftest.txt`,
  `refetch-receipts.md`); `TMPDIR` was that scratch for every run.
- No browser was started by this seat; `pgrep -fa 'chromedriver|chromium'` after my work shows no line of mine
  (recorded at the end of this run: only the pre-existing `earlyoom` line whose `--prefer` text contains
  "chromium").
- No tool installed or upgraded (`pacman` untouched); only `curl`, `node`, `git`, `sha256sum`, `base64`, `grep`,
  `sed` from the host.
- Wrote only this report and `.ufo/waves/round-32/w2/CritTrendVerdicts/`; no lane tracked file, lane git index, jj
  state, fleet repo or sibling lane touched; all git in the lane was read-only and commits were created nowhere.
