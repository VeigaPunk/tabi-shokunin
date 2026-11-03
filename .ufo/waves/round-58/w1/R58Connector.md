# R58Connector — round 58, wave w1 (seat report)

Seat: `R58Connector` (connector; read-only; leaf member, no subagent dispatch).
Round: 58 (hyaku run 15). Lane base revision: `051f433dd49880d652407f1c02f8a15646602bbe`.
Authority: `.ufo/waves/round-58/claims.json` (FROZEN; read first, never amended by this seat).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · Fleet root (READ-ONLY): `/home/vgpnk/Projects/shokunin`.

Deliverables written by this seat (nothing else in the tree was touched):

- `.ufo/waves/round-58/connector/heads-r58.tsv` — the head-movement table.
- `.ufo/waves/round-58/connector/r58-connector-receipts.json` — machine receipt backing every table
  cell and every re-derivation below (parses; `python3 -c "import json;json.load(open(...))"` exit 0).

Scratch (removed on exit): `/fast/scratch/hyaku/tabi-r58/R58Connector/`.

---

## 1. Head-movement table

**Method (read-only).** `git -C <lane> rev-parse HEAD`, one pass over the roster the meter itself
derives (`rosterScan` in `c1-adjacency-host-v17.mjs:332`): non-dot entries at the fleet root that
are real directories (symlinks followed) and carry `.git` or `HEAD`, minus `tabi-shokunin`. That
yields **20 lanes** — identical to the r57 snapshot's `rosterCount: 20` and to the round-open
control's `counts.roster: 20`. The non-lane directories `research/`, `scripts/`, `templates/`,
`tools/` and the typo directory `kumitate-shokinin/` carry neither `.git` nor `HEAD` and are
correctly excluded; `kumitate-shokunin` (the real lane) is on the roster.

Three heads are compared per lane:

- **r57-snapshot-head** — `.ufo/waves/round-57/adj/rebind-snapshot.json` (`heads`, 20 entries).
- **round-open-head** — the meter's own `headSnapshot` inside `.ufo/waves/round-58/controls/c1-meter-v17-at-round-open.json`
  (the v17 meter's per-run snapshot at round open, 17:02:50 −03:00).
- **live-head** — this seat's own pass (17:10:57 −03:00).

Table: `.ufo/waves/round-58/connector/heads-r58.tsv` (6 columns, 21 rows + header:
20 roster lanes + one `(fleet-root)` row).

### Movement summary

| lane | r57-snapshot | round-open | live | moved vs r57 | moved vs round-open |
|---|---|---|---|---|---|
| kagi-shokunin | `2d46e5759c02` | `91f7752ba551` | `91f7752ba551` | **YES** | no |
| kengaku-shokunin | `21b13dc70fae` | `12a6255170bc` | `b5032ff8391d` | **YES** | **YES** |
| souji-shokunin | `1a53bcabc91d` | `1a53bcabc91d` | `fd854c7c57f4` | **YES** | **YES** |
| `(fleet-root)` | — (not a roster lane) | — | `35c7e64ebe92` | n/a | n/a |
| other 17 roster lanes | unchanged | unchanged | unchanged | no | no |

### The lane the round-open red flag names — confirmed, plus one it does not

The round-open control (`.ufo/waves/round-58/controls/c1-meter-v17-at-round-open.json`) declares
`predicate: false`, `findingCount: 1`, and the single finding
`{"id": "lane-screen-head-mismatch", "detail": "kengaku-shokunin"}`. The frozen claim's `before`
block names the expected lane as `kengaku-shokunin`. **This seat confirms that attribution
independently**: kengaku's live head `b5032ff8391d` differs from the r57 snapshot head
`21b13dc70fae`, and it moved a *second* time after the round-open control was taken
(`12a6255170bc` → `b5032ff8391d`, the round-65 freeze commit at 17:04:37 −03:00).

**`souji-shokunin` is movement the round-open control did not see** — it had not moved yet at
17:02:50 and moved to `fd854c7c57f4` at 17:09:27 −03:00, i.e. **during this seat's own scan**.
The r57 delta ledger binds souji at `1a53bcabc91d`, so souji now carries the same
`lane-screen-head-mismatch` class the round-open control attributed to kengaku alone. The
round-open control's `findingCount: 1` was true at 17:02:50; it is not a stable statement about
the fleet. This is the movement-over-time context the L1 needs, and it is **not** the rebind
input (the L1 takes its own fresh snapshot).

### Movement is concentrated, and it is live

Commits per lane in the 60 minutes to 17:10:57 −03:00: `tabi 9`, `souji 7`, `kagi 6`,
`tsukuroi 5`, `kake 4`, `kengaku 4`, all others `0`. Souji alone produced **four commits between
17:06:42 and 17:09:27**. Three of the four moving lanes (kagi, souji, kengaku) are delta-covered
lanes in the r57 ledger whose `head` column is therefore a hard predicate input, not decoration.

### The fleet root moved too

The fleet repo is not a roster lane (it is the parent of the roster, and its `.git` admin dir is a
dot-entry, excluded by the meter's own scan), but the map rows pin **fleet-root** bytes:
`fleet@ebeb396f7db4:.ufo/l0-questions.md:62` and `fleet@b6b3b5e4204:.ufo/l0-questions.md:65`.
Both pinned lines are **byte-identical at the live fleet head `35c7e64ebe92`** as at their pinned
revs (sha256 of the extracted line: `84feeea47ee8d1d9` and `66b0faf15dfe79d8` respectively, each
equal across pinned and live). The fleet root's own commits in this window
(`round-58: tabi dispatch evidence`, `rounds ledger: tabi r57 closure (admitted)`, the r57 and
r64 closure dispatches) touched `.ufo/l0-questions.md` but not the two pinned lines.

---

## 2. Sibling round-58 overlap scan

Read-only. For each lane carrying a `.ufo/waves/round-58/` directory: spec/claims filenames plus a
one-line what-it-claims, taken **only** from `claims.json` / `contract.json` / spec headers /
commit subjects — no deep reading of seat reports.

| lane | round-58 spec/claims files | one-line what-it-claims |
|---|---|---|
| chousa-shokunin | `w1-spec.json`, `w1-results.json` | C1 build-spans hazard hardening + C2 S101 carrier-alphabet entry; axes operability/depth/calibration; 74 seats |
| kaidoku-shokunin | `claims.json` (+ `l1/`) | r57-closure routed carry-in (file-count precision, orphaned-evidence hygiene sweep, W04 supersedes probe) + registry-drift census repair; S258 sourced claim |
| kake-shokunin | `w1-spec.json`, `w1-results.json`, `contract.json`, `measured.json` | C1 calibration: receipt-rewrite truthfulness counter (0 undisclosed/phantom/malformed/wrong-kind/unpointed); C2 operability: id_resolver case suite; C3 freshness: quote-truth over S423/S424 |
| kama-shokunin | `w1-spec.json`, `w1-results.json` | local model serving + endpoint health; axes operability/calibration; 72 seats; no planner role |
| kengaku-shokunin | (no spec/claims file; `fix/ recon/ waveR/ wavec/ wavec-tip/ wavep/`) | r58 work is the registry/ledger argv alignment + close-receipt wave; its live round is r65 (freeze committed 17:04:37) |
| kotoba-shokunin | `build-spec.json`, `falsify-spec.json` | C1 SKILL.md "Custom command files by client" + S089–S095 rows; C2 withdrawn pre-data (`CtlC2SourceGrep` met its frozen predicate) |
| kotodama-shokunin | `build-spec.json` (+ `gen-build-spec.py`) | linguistics/toponymy place-names claim C; S500–S543 (44 rows) opened this round; kind-enum correction R58-M6 |
| kumitate-shokunin | `w1-spec.json` | C1 operability capability acquisition receipt-evidence + readme-map v2 (ATTEST58); C2 sourced durable-… ; 64 seats |
| mado-shokunin | (no spec file; `receipts/`) | host-portable checker scratch policy (`--scratch-root`, M57-1) + per-monitor DPI join (S402–S404); r57 ERROR-path receipt gap closed |
| mori-shokunin | `w1-spec.json`, `w1-results.json` | frozen contract + C1/C2 counters and controls; source-grounded parser entry + wave evidence; 64 seats |
| tameshi-shokunin | `spec-w1.json`, `spec-w2.json`, `w1-results.json`, `w2-results.json`, `adjudications.json`, `ledger-candidate.json` | settled 40-seat falsification wave; S288 bind with 10/10 negative + 1/2 positive controls; honest admission stop; 67 seats in w1 |
| tsukuroi-shokunin | (no spec file; `before/ after/ receipts/ eventlog-probes/`) | Windows eventlog plane C1 (S272/S273) + recheck 22-row C2 + W-plane dated cadence C3 |
| tabi-shokunin | `claims.json`, `w1-spec.json` (this lane) | C1 adjacency v18 meter generation; C2 coverage capability chromium-keyevent-preventdefault-swallow-linux |

Lanes with **no** `.ufo/waves/round-58/` directory: audio, game-dev-2d, game-dev-3d, kagi, kasegi,
lore, revenger. (`kagi` has a live round — but it is round 31, not 58.)

### Browser / CDP / web-interaction ground — flag only, never absorb

**No sibling's round-58 work touches browser/CDP/web-interaction ground.** Searched every sibling
`.ufo/waves/round-58/` tree for `cdp|chromium|playwright|puppeteer|selenium|browser|keydown|
keyevent|preventdefault|webview|devtools|remote-debugging`, then read each hit's context. Every hit
is a **false positive**, categorised:

| lane | hit | why it is not browser ground |
|---|---|---|
| kama-shokunin | `w1/out/X04ScratchHygiene/tmp-c1-after.txt`, `tmp-c2-after.txt` | a **directory listing** of `/tmp` names (`nw_browser.txt`, `playwright-artifacts-*`, `.org.chromium.Chromium.*`) captured by the scratch-hygiene seat — filenames, not a browser run |
| kumitate-shokunin | `build/ScoutS122/fetched.html`, `build/RevEntryMapping/fetch-s122.stdout.html` | a **fetched web page's own HTML** (`onkeydown="switchTab(event)"` in the site's markup) — read source, not interaction |
| tsukuroi-shokunin | `receipts/raw-t1t23/t4-raw.txt` | **Windows service names** `CDPSvc` / `CDPUserSvc_fbe42` (Connected Devices Platform) — a name collision, not Chrome DevTools Protocol |
| tameshi-shokunin | `w1/T58W1ConnSib-receipts/sweep.json` | 8 hits, all inside **quoted tabi corpus text** the seat read ("…launching no browser…", "…zero browser runs…") — a sibling reading tabi's records, not doing browser work |
| chousa-shokunin | `w1/R58ConnectorSiblingScope.md:47` | the token `remote-debugging` appears inside a **count of Chrome remote-debugging switches across sibling SKILL.md files** — an inventory line naming tabi's switches |

Corroborating negative: **no sibling round-58 tree contains a script that launches a browser** —
a search for `chromium`/`chrome --`/`--remote-debugging-port`/`headless=new` across every
`*.mjs|*.js|*.py|*.sh` in the sibling round-58 trees returns nothing.

Two siblings *name tabi* in their round-58 reports, and both are **scope-reporting, not
absorb-and-fix**:

- `chousa-shokunin/.ufo/waves/round-58/w1/R58ConnectorSiblingScope.md:94,110` — tabi's
  PROVINCE.md:9-13 "dynamic-page evidence patterns" overlaps chousa's capture discipline, with no
  boundary sentence; the verdict is that the ownership overlap is FALSIFIED and the missing
  boundary sentence is *reported*, not resolved.
- `kake-shokunin/.ufo/waves/round-58/w1/ConnSiblingOverlap.md:23,29,37` — the declared split
  ("tabi drives browsers and owns client-side crawler discipline; kake owns publisher-side
  placement") is one-sided (only kake declares it; tabi's PROVINCE has no "crawler" token), and the
  reverse/forward-DNS half of crawler identification has **no declared owner anywhere** — kake
  explicitly reports that to the L1 rather than taking it.

Both are consistent with tabi's PROVINCE.md ("Out of province → report, never absorb") and with the
claim boundary. Nothing to absorb; nothing to contest.

---

## 3. Sibling `corpus/lessons/round-58*.md` naming tabi

`grep -l tabi` over every sibling lane's `corpus/lessons/round-58*.md` — **paths only, as asked**:

```
kake-shokunin/corpus/lessons/round-58.md
kengaku-shokunin/corpus/lessons/round-58-verifier-spotcheck.md
tsukuroi-shokunin/corpus/lessons/round-58-verifier-spotcheck.md
```

All three are **committed** (each appears in its lane's `git ls-files corpus/lessons/`).

Character of each hit (a word-boundary check separates real mentions from substring noise):

- `kake-shokunin/corpus/lessons/round-58.md:147` — the **only genuine word-boundary mention** of
  tabi across all siblings' round-58 lessons. It is an adjacency note, not a defect routing:
  *"no sibling owns the three surfaces; tabi splits crawler material and the DNS half is unowned."*
  It **names tabi as the adjacent-lane context** and explicitly leaves the DNS half unowned.
- `kengaku-shokunin/corpus/lessons/round-58-verifier-spotcheck.md` — **not a mention of tabi**;
  the three `grep -oi` hits are the substring inside "s**tabi**lity".
- `tsukuroi-shokunin/corpus/lessons/round-58-verifier-spotcheck.md` — **not a mention of tabi**;
  the single hit is the substring inside "s**tabi**lity".

**Finding: no sibling has committed a round-58 lesson naming tabi as a routed-defect target.** The
one real reference (kake) is a sibling-overlap observation with tabi in the adjacent role, and it
routes the unowned DNS half *away* from itself rather than to tabi. The routed-defect channel into
tabi is therefore empty for round 58 — there is no inbound route for the L1 to adjudicate, and
nothing in a sibling's lesson file pre-empts tabi's own adjacency ledger.

---

## 4. Re-derivation at live heads (evidence for the L1's rebind)

To make the movement table actionable rather than merely descriptive, this seat re-derived the r57
meter's two ledger-bearing predicates against the **live** heads, using the meter's own rules
read from `c1-adjacency-host-v17.mjs` (`observedStatus` at :214, the P3 delta screen at :265-300,
`BG_WORDS` at :174, `DISPOSITIONS` at :175). Method and per-lane detail are in
`r58-connector-receipts.json` (`p1FindingsAtLiveHeads`, `p3FindingsAtLiveHeads`).

- **P1 (ruled map + audit rows): 0 findings at live heads.** All 16 map rows re-derive to their
  claimed status, including every map-covered lane that moved: `kagi` (map-covered, head moved
  `2d46e5759c02` → `91f7752ba551`) re-derives `unchanged` on both its rows — its `PROVINCE.md`
  bytes are identical at the r57 head and the live head; `kumitate`'s `moved` row still resolves
  to `:1736`; `kaidoku`/`revenger` still `stale`.
- **P3 (delta screen): 2 findings at live heads, both `lane-screen-head-mismatch`** —
  `kengaku-shokunin` (ledger `21b13dc70fae` vs live `b5032ff8391d`) and `souji-shokunin` (ledger
  `1a53bcabc91d` vs live `fd854c7c57f4`). **Every other P3 check is green at the live heads**: for
  all 16 delta lanes the `provinceSha256`, the line count, and the BG-word hit count re-derive
  exactly, every BG-hit line has a `line` row whose quote is the verbatim whole line, every
  disposition is in the frozen vocabulary, and no `line` row names a non-hit line.

The consequence for the L1's rebind is sharp and worth stating plainly: **at the live fleet, the
r57 ledgers are one cell stale on two lanes and correct everywhere else.** A rebind that updates
those two `head` cells (and the corresponding `head` column of the two `line`-bearing lanes'
records) and nothing else satisfies both P1 and P3 as of this scan. It does **not** — and this is
the risk to name — stay satisfied if either lane moves again before the L1's snapshot.

---

## 5. Risks and second-order effects (for the L1)

1. **The window between the L1's rebind snapshot and the meter's run is the whole risk.** The
   meter re-derives sibling heads **per run** (`headSnapshots`, v17 meter :312-321) and compares
   them to the `head` cell the ledger carries (`lane-screen-head-mismatch`, :298). A ledger
   rebound to a snapshot taken at T is red at T+ε if a delta-covered lane committed in between.
   Souji committed 4× in 3 minutes during this scan; kengaku and kagi are each mid-wave. The
   rebind and the meter run must be adjacent in time, or the ledger must be regenerated against
   the meter's own emitted `headSnapshot` — the v17 meter prints its snapshot into the receipt
   (`headSnapshot`, :372-374), which is what the round-open control's `headSnapshot` block is.
   *This table is context, not the rebind input, exactly as the seat spec says; the L1's fresh
   snapshot governs.*
2. **`souji` is a second-order cost the frozen `before` block does not anticipate.** The claim's
   `before` expects `findingCount >= 1` with kengaku named; the round-open control observed
   exactly 1. If the L1's rebind is done against a snapshot that predates souji's 17:09:27 commit,
   souji will be a *second* head-mismatch finding; if taken after, souji's cell must also be
   rebound. Either way the after-state receipt must show `findingCount 0`, and the rebind must
   touch exactly the cells that the L1's own snapshot shows as stale — no more.
3. **Do not read this seat's `findingCount 2` as a counter-claim.** It is a live-head
   re-derivation of the **r57** ledger, produced before any v18 bytes exist. The frozen `before`
   control is the authority for the before-state, and it is already on record and correct for its
   own timestamp. This seat's re-derivation is a **movement-risk input to the rebind**, and it is
   timestamped (`writtenAt` in the receipt) precisely so it cannot be mistaken for a later state.
4. **Kagi's movement is benign and should not be over-corrected.** Kagi moved
   (`2d46e5759c02` → `91f7752ba551`) but is **map-covered, not delta-covered** — it has no
   `head` cell in the r57 delta ledger — and its `PROVINCE.md` bytes are unchanged. It contributes
   **nothing** to the rebind and must not be given a delta row.
5. **The frozen kill rule "the only path to green is editing a ledger row to match bytes not at
   the rebind snapshot head"** is the live hazard here: every byte the meter reads comes from
   `git cat-file -p <head>:<path>` at the snapshot head, never the working tree. The rebind must
   therefore write the head the L1's snapshot names, and the ledgers must carry the **same** head
   value that the meter's own run re-derives. Editing a ledger `head` cell to a value the meter's
   snapshot does not reproduce is the forbidden path, and it is easy to walk into by hand-copying
   a head from a *different* snapshot (mine, or the round-open control's) into the r58 ledger.
6. **Dirty worktrees are not a signal.** 7 lanes have uncommitted changes (kagi 27, tsukuroi 15,
   kasegi 14, souji 11, kengaku 6, kake 5, tabi 1), but the meter reads **only** committed bytes at
   the snapshot head, so working-tree dirt changes nothing. Conversely, a lane that commits
   *unrelated* work still moves its head and still breaks a stale `head` cell — souji's four
   commits this window are round-53 measurement/ledger work, entirely unrelated to tabi.

---

## 6. Verification actually performed

All commands run read-only; no mutating git anywhere; no network fetch; no browser launched; no
file written outside `.ufo/waves/round-58/connector/` and this seat's scratch.

- `git -C <lane> rev-parse HEAD` over all 20 roster lanes + the fleet root → `heads-r58.tsv`.
- Roster derived with the meter's own rule → 20 lanes, matching the r57 snapshot `rosterCount`
  and the round-open control `counts.roster`.
- P1 re-derivation (16 map rows, `observedStatus` rule) → **0 findings** at live heads.
- P3 re-derivation (16 delta lanes: sha256, line count, BG-hit count, whole-line quote,
  disposition, non-hit-line detection, head comparison) → **2 findings**, both
  `lane-screen-head-mismatch` (kengaku, souji).
- `git cat-file -p` byte comparisons for the two fleet-root ruling pins and for the map-covered
  lanes' pinned files → identical at pinned and live heads.
- Browser-ground sweep of every sibling round-58 tree + a script-level sweep for browser
  launchers → **zero** sibling browser work.
- `grep -l tabi` over sibling `corpus/lessons/round-58*.md` → 3 paths; word-boundary
  discrimination → 1 real mention (kake, adjacency context), 2 substring artifacts.
- `r58-connector-receipts.json` parses (json.load exit 0); `heads-r58.tsv` written and re-read.

**Not performed (out of seat scope / forbidden here):** the live data pass, any browser run, any
`git` write, any corpus edit, any v18 authoring, any adjudication, integration or shipping.

## 7. Recommended next action for the L1 (TabiR58)

Coordinate by id, never by broadcast. Concretely: take the rebind snapshot and the meter run
adjacently in time; rebind the `head` cells of exactly the delta lanes whose heads differ from
that snapshot (kengaku and souji as of this scan, and re-derive — do not copy my values); leave
kagi and the map-covered lanes alone; and re-run the live-head re-derivation from this seat's
`r58-connector-receipts.json` method before committing the ledgers, so the rebind is against the
L1's snapshot and not against mine.
