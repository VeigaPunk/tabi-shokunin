# CritCapabilityRow — the round-32 capability row, criterion 84, and the nudge window

**Verdict.** The row `SCORECARD.md:1663` **holds as a capability row** — it names an operation the shokunin
runs (drive a BiDi session), not the gate that checks it — and its one quantified sentence ("sixteen of the
seventeen matrix §2 rows … two cold runs bound by identical first-screenshot bytes") does **not** overreach the
receipt: the matrix has exactly 17 data rows (`corpus/knowledge/webdriver-bidi-capability-matrix.md:60-76`), the
entry's R1–R17 map to them in order with R16 = "Stop loading / nav-cancel", the frozen gate at REV reads
population 16 / admitted 16 / failing 0 exit 0, and I re-derived the distinctness the gate cannot prove — two
transcript digests, two distinct BiDi context ids, one screenshot sha256 across both runs. The **window
semantics are also correct and now proven in both directions**: with the row present, rounds 33/34/35 derive
`nudge inactive` and 36 derives `active` (matching the states I wrote), and with the row deleted rounds 33–35
flip to `active` — so entry at 32 suppresses the nudge for exactly rounds 33–35 under `window 3`
(`rounds N-3..N-1`), and round 32's own `active` statement at `:1643` reads claimed=active/observed=active with
no fourth m4 finding. What fails is (i) the row's **demonstration provenance**: its evidence pointer names no
path, and the only committed live C1 run records revision `c8ec438690e641cb044e7eff1dc8423d0b7530cc`, which
**does not exist as a git object in the lane** and carries no `.provenance` tree digest (unlike
`baseline/*.provenance`), so `AXES.md:62` ("evidence pointer (command or path)") and `AXES.md:63-65` ("a
capability without a passing demonstration in the round report is pre-claiming") are unmet at REV; (ii)
**criterion 84's operative rule is contradicted by the only instrument that reads the table**: a
capability-table row naming a gate with last cell `36` makes round 37 derive `inactive` (probe B2) — exactly the
bookkeeping reset 84 forbids — and no gate anywhere reads capability-row identity; (iii) 84's grandfathering is
**not inert**: round 27's standing statement `SCORECARD.md:1382` ("nudge inactive") is true *only because* the
round-24/25 gate rows count (control C: neutralise those two prose tokens and round 27 derives `active`), a
dependence the round-32 disclosure at `:1632-1633` does not state. None of this falsifies C1 or C2 as frozen;
it is 1 pointer correction plus 3 append-only disclosures and 1 missing contract field.

## Axes this touches

- **calibration** — F2, F3, F4, F7 (an added criterion the instrument cannot enforce; a standing statement held
  by the grandfathering; a nudge input set wider than the declared entries; a missing `planned` block).
- **coverage** — F6 holds, so `claims.json` `notClaimed`'s adjacency waiver and C1's coverage axis are intact.
- depth, operability, freshness, adjacency: no effect found (nothing else reads the capability table —
  `grep -rn 'First-working' scripts/*.mjs` returns only `scripts/check-selfassessment.mjs`).

## Findings

| # | Verdict | Severity | Evidence | Smallest safe (append-only) fix |
|---|---|---|---|---|
| F1 | **defect** — the row's demonstration is not resolvable at REV | medium | `SCORECARD.md:1663` evidence pointer ends "demonstration = the round report's measured C1 run" (no path, no command); `AXES.md:62` requires a command or path. The only committed live C1 run is `.ufo/waves/round-32/w1/ExecDriver/live.json` (`"live": true, "population": 16, "admitted": 16, "rev": "c8ec438690e641cb044e7eff1dc8423d0b7530cc"`); `git cat-file -t c8ec438…` → `fatal: Not a valid commit name` (exit 128), i.e. a seat clone commit with no `clone_tree` record, while `baseline/c1-J1-do-nothing.provenance` shows the required shape (`clone_head` + `clone_tree`). Offline at REV reproduces (exit 0, 16/16) but the claim's `killRule`/`measurementRule` speak about the named revision. | One line in the round-32 disposition (and the lesson `## Gate`): the `--live` command at REV with its committed receipt path (e.g. `.ufo/waves/round-32/measure/c1-live-at-b234a58.json`) and the tree digest of the demo tree, plus a note that `w1/ExecDriver/live.json`'s rev is a clone commit. Until that lands, treat the row as pre-claiming under `AXES.md:63-65`. |
| F2 | **defect** — criterion 84's identity rule has no enforcing line and the one reader contradicts it | medium | `corpus/QUALITY.md:508-512`; `scripts/check-selfassessment.mjs:445-462` counts **any** first integer in the last cell of a row under a `First-working round` header. Probe B2 (round-32 row + a row "`fake-gate` \| A gate/counter, not an operation \| `scripts/check-bidi-runtime.mjs` \| 36"): round 37 claimed `active` → `observed inactive` (mismatch, exit 1, `probeB2-gaterow.json`). So a gate row *does* reset the window by bookkeeping today, with no red state anywhere; criterion 82's doctrine ("a criterion clause no line enforces is stated as a limit, not as a rule (criterion 73)") applies to 84's first sentence. | Append-only amendment in the next round's `corpus/QUALITY.md` additions: 84's identity clause is a hand-read limit (no instrument distinguishes a gate row from an operation row; `capabilityRounds` counts any numeric last cell), red state = probe B2, and the named fix is a counter v4 that rejects a row whose "what it can now do" is a gate analysis. |
| F3 | **defect (disclosure)** — 84's grandfathering silently underpins a standing statement | low | `SCORECARD.md:1382` (round 27: "Saturation 8 / window 3; nudge inactive"). Control C — the two `First-working round: 24` / `: 25` prose tokens in `SCORECARD.md:1243,1249,1306,1314` neutralised, nothing else changed: round 27 `claimed inactive / observed active` (mismatch, exit 1, `probeC-no-gaterows.json`); rounds 23, 24, 25, 26 stay `inactive` (their windows also contain 22/23). The round-32 disclosure `:1632-1633` accounts for rounds 29–31 only. | One sentence in the same correction block: "`SCORECARD.md:1382` reads `inactive` only because criterion 84 keeps the round-24/25 gate rows counted; under the operative rule from round 32 it would derive `active`." |
| F4 | **defect (instrument input)** — the nudge's entry set is wider than the declared entries | low | `capabilityRounds` over the delivered bytes returns `[1,13,16,17,22,23,24,25,32]`: the `1` comes from `SCORECARD.md:426`'s last cell `kaika-fleet-round-1` (a fleet round label, not a capability round) — table-scan trace `header@424 row@426 -> 1`. No window for rounds ≥ 5 can reach it, and rounds 33–35 are unaffected, but the input is not "the entry rounds". | Disclose beside 83/84 as a limit: "the nudge input also counts a non-round last cell that starts with a digit; no derived state for rounds ≥ 5 depends on it (`caps = [1,13,16,17,22,23,24,25,32]`)". Do not patch the frozen counter. |
| F5 | **holds** — operation, not gate; wording inside the receipt | — | Row text names driving a session and recording per-surface evidence; the gate (`scripts/check-bidi-runtime.mjs`, sha256 `2f25af5a…c393`) is not the named capability, the driver is (`scripts/bidi-loopback-round32.mjs`, sha256 `55dbef88…070a` = receipt `driverSha256`). Row count exact: matrix §2 = 17 rows `:60-76`, entry R1–R17 in the same order, R16 = "Stop loading / nav-cancel" with `no — no BiDi command`; gate at REV: `population 16, admitted 16, failing 0`, exit 0. Independent distinctness (what criterion 86 asks the round to record): run1 transcript `8aa97463…`, run2 `9918a716…`; BiDi context ids `31B8FE9C…` vs `0E62B928…`; subscription ids differ; first screenshot in both runs = 6,626-byte PNG sha256 `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`. So "two cold runs bound by identical first-screenshot bytes" is literal. | none — except that the identical-bytes binding is splice-shaped (a copied run reproduces it); the distinctness lives in the two digests and two context ids, so the disposition should cite `measure/c1-distinct-red-green.txt` beside the gate's reading (criterion 86). |
| F6 | **holds** — window semantics | — | Present: entry 32 ⇒ rounds 33/34/35 `inactive`, 36 `active` (all four claimed states matched, `probe-33-36.json`, exit 0; round 32's own `:1643` claimed=active/observed=active, no fourth m4). Absent: row deleted from the table (`b307d0fa`) ⇒ 33/34/35 `observed active` (exit 1, `probeA-no-row.json`). Grammar: `c >= round - window && c <= round - 1` (`scripts/check-selfassessment.mjs:497`), window parsed from the group's own `Saturation 8 / window 3`. | none |
| F7 | **defect (contract field)** | low | The round-32 declared-claims group (`SCORECARD.md:1637-1665`) has no `planned` block; `AXES.md` SCORECARD contract lists `planned` as a required field and round 31 carried one (`:1595-1601`). Consequently nothing in the round states the derived consequence "capability entered round 32 ⇒ nudge waived for rounds 33–35", which is the only forward fact the row changes. | Append `### Planned / saturation / retired — round 32`: next round's 1–3 intended claims, `capabilities: webdriver-bidi-runtime entered at 32`, `saturation 8 / window 3`, and the sentence "the nudge derives inactive for rounds 33–35 and active from 36". |

## Commands and exit codes

Scratch clone: `git clone --shared …/tabi-shokunin $S/clone`; `git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b` → 0; `git rev-parse --show-toplevel` = `$S/clone`; every commit `-C "$S/clone" -c user.name=CritCapabilityRow -c user.email=CritCapabilityRow@scratch.local`.

Import harness (the counter calls `main()` at load, so `capabilityRounds` is not importable from the frozen file):
`sed 's/^main();$/\/\/ main();/' scripts/check-selfassessment.mjs > $S/ss-importable.mjs` → 0; source sha256
`77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9` (= `claims.json` `frozenDigests`), derivative
sha256 `e523faa692a7d0bee3620a1f9acc4c1b9cba2c19df60f097696eb24eadb779f7`.

| # | command (in `$S/clone` unless noted) | exit | reading |
|---|---|---|---|
| 1 | `node -e` table scan over `SCORECARD.md` (header/row trace) | 0 | `header@424 row@426 -> 1`; `header@1661 row@1663 -> 32` (the round-32 cell parses; the kaika cell parses as 1) |
| 2 | import `capabilityRounds` on the delivered blob `b234a589:SCORECARD.md` | 0 | `[1,13,16,17,22,23,24,25,32]` (`caps-entries.txt`) |
| 3 | `node scripts/check-bidi-runtime.mjs --rev b234a589… --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json` | 0 | `population 16, admitted 16, failing 0, live false, clean true` (`c1-offline.json`) |
| 4 | synthetic rounds 33–36 (claiming inactive/inactive/inactive/active), commit `3bf56e9c`, `node scripts/check-selfassessment.mjs --rev 3bf56e9c --json` | 0 | 33/34/35 `inactive/inactive`, 36 `active/active`, `mismatches 0`; existing 23–26 `inactive/inactive`, 28 cne, 29–31 superseded (`probe-33-36.json`) |
| 5 | control A — round-32 capability row deleted, commit `b307d0fa`, same counter | 1 | 33/34/35 `claimed inactive / observed active`; 36 `active/active`; `:1643` still `active/active` (`probeA-no-row.json`) |
| 6 | probe B (first attempt) — row insertion was a no-op because the anchor row was already deleted in 5 | 1 | discarded: round 37 `active/active` proves nothing (no fake row present) |
| 7 | probe B2 — row restored from the b234a589 blob + row "`fake-gate` … \| 36" inserted + round 37 claiming `active`, commit `be1d3ee8`, same counter | 1 | round 37 `claimed active / observed inactive` — a gate row resets the window (`probeB2-gaterow.json`) |
| 8 | control C — `First-working round: 24`/`: 25` prose tokens neutralised (4 occurrences), commit `adca833b`, same counter | 1 | round 27 `claimed inactive / observed active`; 23–26 unchanged `inactive`; 29–31 superseded; 32 `active/active` (`probeC-no-gaterows.json`) |
| 9 | `git cat-file -t c8ec438690e641cb044e7eff1dc8423d0b7530cc` (lane, read-only) | 128 | `fatal: Not a valid commit name` — the demonstration's recorded revision does not resolve |
| 10 | `grep -rn 'First-working' scripts/*.mjs` (lane, read-only) | 0 | only `scripts/check-selfassessment.mjs:435-450,591`; no other gate reads the capability table |
| 11 | `pgrep -fa 'chromedriver\|chromium'` | 0 | one line, `/usr/bin/earlyoom … --prefer (…\|chromium\|…)`; **no** chromedriver/chromium process of mine (0 matching `CritCapabilityRow`) |

## Receipts (output dir `.ufo/waves/round-32/w2/CritCapabilityRow/`)

| File | sha256 | Reading |
|---|---|---|
| `probe-33-36.json` | `b3355c3ff08ce70d725f5512c09a1ed3b8aa7f593f904611fe67f3d84fc16b48` | entry 32 present ⇒ 33–35 inactive, 36 active, 0 mismatches |
| `probeA-no-row.json` | `a7e22e7115acb46f01f924011096b2f2b6d216a0210118489230c079855b044e` | entry 32 removed ⇒ 33–35 active |
| `probeB2-gaterow.json` | `a48ed318256d0077743911113377684d7b9864a9c6c806ff240e29785f083d8f` | gate row at 36 counted ⇒ round 37 inactive |
| `probeC-no-gaterows.json` | `57274902791d4747c349699f9fdd48bcccd6e313ae562b8858baf165b9eb4e96` | 24/25 gate rows not counted ⇒ round 27 flips |
| `c1-offline.json` | `364e1228c400b1518d9570fb81b09e5594aa016a5189d8b34edbb712e8379cdd` | gate at REV: 16/16, exit 0 |
| `c1-offline.err` | `e3b0c442…b855` (empty) | no stderr |
| `caps-entries.txt` | `2892ca8e2c2d4bd73537b937d4e9bb313ac33ac48fc3c2dd6d113c78fe2da95f` | entry sets, delivered vs control C |

The `rev` fields inside the four probe JSONs name scratch-clone commits that were deleted with the scratch (the
same class as F1); each mutation is spelled out in the commands table — row deleted (5), a row
"`fake-gate` \| A gate/counter, not an operation \| `scripts/check-bidi-runtime.mjs` \| 36" inserted after the
round-32 row (7), four `First-working round: 24`/`: 25` tokens reworded to `First-working round (gate row) 24`/`25` (8) — so
any reader can rebuild the document from the `b234a589` blob and re-run the counter.

## Perimeter

No `--live` run performed (gate legs 3, 4, 5, 7, 8 are `--json` only); no chromedriver or chromium started; no
network fetch; no tool installed or upgraded; no pacman transaction; no lane tracked file, lane index or jj state
touched — the only lane writes are this report and the output dir `w2/CritCapabilityRow/`. Scratch `$S=/fast/scratch/hyaku/tabi-r32/CritCapabilityRow` deleted after copying
the receipts above.
