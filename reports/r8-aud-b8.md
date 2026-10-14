# AUD-B8 — round-8 audit: the stateful fixture (one visit-pair re-run; cleanup) + the two debt-closure claims

Lane AUD-B8, 2026-10-14. Write scope: **this file only** — nothing else in
tabi-shokunin was written by this lane; every audited artifact was read-only
(or copied to scratch and run there, never edited). Scratch: `/tmp/w8-aud-b8/`
(fixture copy, run logs, check outputs; volatile). Task: audit the stateful
fixture (re-run one visit pair; cleanup) and the debt-closure claims (2 checked).
Verdict table; do NOT edit. Method: read + re-hash + re-run the fixture's visit
pair on loopback + re-derive the closure claims' numbers from disk. No external
site; substrates read-only; secrets shape-only; the fixture's own cookie values
are treated shape-only in every artifact quoted here.

**Audited revisions (the tree was moving during the audit — recorded, not
smoothed).** Audit window 19:14–19:26Z (16:14–16:26 -03); HEAD `b377007`
("probation round 7 (training r6): see LOG", committed 19:06:31Z); `git status
--short` shows only other lanes' untracked files (at close: the two round-8
knowledge notes, two lessons files, two plans drafts). Bindings:

| artifact | revision bound | size | note |
|---|---|---|---|
| `corpus/knowledge/stateful-fixture-evidence.md` (B8-1) | sha256 first-16 **`e89bc89bff38dc7a`** | 773 `wc -l` / 45,705 B / mtime 16:25:39 -03 | moved mid-audit: `5066d17d1f89f597` (768 L / 45,436 B, 16:23) → current; the one count phrase this audit first read ("30 run dirs") was corrected by the lane to 32 in the current revision; U10 added |
| `corpus/knowledge/archive-receipt-r8.md` (ARCH-TRANCHE-R8) | `0587605db9138631` | 191 `wc -l` / 15,810 B / 16:05:24 | committed in `b377007` |
| `corpus/knowledge/carried-debt-closure-r8.md` (B8-2) | `48dc8db69c57a4a4` | 149 `wc -l` / 14,746 B / 16:16:11 | revision chain on record in its own E1: `e3b24db30479d0d2` (144 L) → `8c6b0a38d7005e6d` (144 L, 4 line refs corrected) → current (E1 appended) |
| fixture `server.py` (`/tmp/w8-tabi-b81/server.py`) | `ac0013e03288ed28bd79…` | 12,311 B / 277 `wc -l` (278 logical) | one revision across all runs (both matrix rounds) |

## 1. Verdict table

| # | check | scope / method | result | verdict |
|---|---|---|---|---|
| F1 | fixture revision binding | `sha256sum` of the `/tmp` fixture vs the note's §0/§2 pin; copy re-hashed in scratch | `ac0013e03288ed28…` / 12,311 B matches the pin; the scratch copy is byte-identical | **PASS** |
| F2 | note §2 embed vs the pinned bytes | extracted the §2 python fence (12,312 B) and `diff`ed against the on-disk fixture | textually identical except the fence's final newline (embed 12,312 B vs disk 12,311 B); no content diff | **PASS** (embed nit, 5.3) |
| F3 | the visit pair, re-run (visit 1 cold + visit 2 same jar) | my own copy of the pinned `server.py`, two independent runs (ports 19931/19932), `curl` pair + `/__ledger` | visit 1: `200` + `Set-Cookie` (mint) + `data-visits="1"`; visit 2: `200` + `data-visits="2"`; ledger `sessions [{s1, visits: 2}]`; event pair `visit cookie=absent visits=1` → `cookie=present visits=2`; `ledger-after.json` byte-identical across both runs (`45c1c4d13f12431921b7eab94f6a3e33`) | **PASS** |
| F4 | cleanup — the audit's own runs | kill by PID; `ss -ltn`; `curl` | pid gone ≤ 200 ms; port not listening; `curl` rc 7; no residual process — both runs | **PASS** |
| F5 | cleanup — the lane's 32 run dirs | aggregate of every `closure.txt` + live port/process check | 32/32 closure files carry the ports-not-listening + `curl cdp exit=7` + `curl http exit=7` lines; at audit time ports 19681/19682 free, no fixture process alive | **PASS** |
| F6 | note revision/hygiene facts | re-hash + the note's revision map vs every `driver.log` pin | `server.py` one revision; `journey.mjs` two revisions (`e22a967ed69e9f6e…` round 1's cells, `282511320499f1f5…` the hop/stop/supersede cells) — disclosed per-run and in §3; the earlier runner bytes are gone (the note records this as its own hygiene finding); the note moved mid-audit (header count corrected; U10 added) | **PASS** (recorded) |
| F7 | the note's own scope boundary | read §9/§11 | the lane states its `verify.py`/`compare.mjs` runs are mechanical self-checks and a non-author pass is owed; this audit covers the visit-pair core + cleanup, not the 14 cells' full verdicts | **noted** (scope, 6.1) |
| D1 | archive receipt — §1/§2 counts | `du -sb`; `find \| wc -l`; per-group file/byte sums | 35 group dirs; 1,451 files; **9,222,920 B**; 41 evidence files / **207,889 B** in the 7 new groups — digit-exact | **PASS** |
| D2 | archive receipt — check A | `sha256sum -c MANIFEST.txt` in all 7 new groups | **41/41 OK, 0 FAILED, rc 0** in every group | **PASS** |
| D3 | archive receipt — check B | source-vs-manifest hash-list `diff` (6 groups' `/tmp` sources still present) + the 3 loose `.check` files | **0 diff lines** for all 6 groups; the 3 loose files byte-equal the aggregated group | **PASS** |
| D4 | archive receipt — checks C1/C2/C4/C5/C6 | re-hash pin files vs archived bytes / live substrate | C1 5/5; C2 `methodology-r5.txt` **25/25**, `rung-recheck.txt` 11/11; C4 3/3 substrate files; **C5 1,057/1,057** listed lines across the 9 logs resolve to correct manifest hashes (0 bad, 0 missing); C6 10/10 | **PASS** |
| D5 | archive receipt — check C3 (the delta pair) | `final-lines.txt` vs today; post→final deltas | final-lines = today's `wc -l` **12/12**; deltas are **11× +2 and 1× +3** (`archive-receipt-r5.md` 177 → 180) — the receipt says "12/12 differ by exactly +2 lines" | **PASS with count erratum** (5.1) |
| D6 | archive receipt — check D | unique archived hashes; distinct ≥12-hex tokens; prefix-match count | **835** unique archived hashes; **318** tokens / **200** matched / **118** unmatched — exact when the scan set is rebuilt without the two notes that landed after it; today's set is **340** (those notes add 22) | **PASS** (scope note, 5.2) |
| D7 | archive receipt — F1 | `tabi-b1-r3b-journey/methodology-sha.txt` vs its own bytes | lists `9509c07f49f9…`/`ecce1c73dc56…`; bytes hash `68ceef09e4bf…`/`cc89210e9fd2…` — staleness reproduced exactly | **PASS** |
| D8 | archive receipt — F5 + named SPs | the three pre-archived groups | `w4-t41-network`, `tabi-r3-1-journey`, `w6-tabi-b61` present; SC2 (`net-journey.mjs` `46c81f99decf`, `server.py` `a5ceef29fae5`) and SC3 (v2 fixture pins) re-derive MATCH | **PASS** |
| E1 | carried-debt closure — F1 erratum | group manifest; in-group pin file; `diff` replay vs source | `MANIFEST.txt` **83/83 OK**; `sha256sum -c methodology-sha.txt` → **7 OK / 2 FAILED** (`driver.sh`, `compare.mjs`); driver.sh **3 changed lines / 6 diff lines** (`ROOT`, `HTTP_PORT` 19421→19481, `CDP_PORT` 19422→19482), compare.mjs **1 changed line** (`const root`); pin file `04997cf58c00e61c` / 9 lines | **PASS** |
| E2 | carried-debt closure — "matrix still open" | knowledge-dir grep; commit path list; LOG | no matrix-cells note; every match names the matrix as unlanded; `git diff-tree --name-only b377007` → **425** paths with no matrix note; the note's "exactly 3 notes" is 4 today because the closure note itself matches | **PASS** |
| E3 | carried-debt closure — citation integrity | re-hash the 11 cited files | all 11 first-16 values + line counts re-derive exactly (incl. `archive-receipt-r8.md` `0587605db913`, `SKILL.md` `8874306672b65d8d`/945, `LOG.md` `f3b7bc3864ee3197`/134) | **PASS** |
| E4 | the "4-line" finding | `diff` the replay pair | measured 3 changed lines, not 4 — the note's §1.4 finding holds; the "4-line" descriptor stands in `archive-receipt-r5.md:110-111`, `archive-receipt-r8.md:119-120`, `SKILL.md:342` | **PASS** |
| — | audit did not edit | `git status` at close; audited artifacts re-hashed after reading | this report is this lane's only tree entry; the three audited notes and the fixture are unmodified by this lane | **PASS** |

Aggregate: **the fixture's visit-pair claim and its cleanup claim re-derive on
an independent run; both debt-closure claims are substantiated — one with a
one-row count erratum (D5), one with a scope note (D6).** The residual risk is
scope: the 14 browser cells were not re-run by this audit (6.1), and the round-8
records were still moving while this audit was measured (6.5).

## 2. The visit-pair re-run (method → result)

Fixture copied from `/tmp/w8-tabi-b81/server.py` (`ac0013e03288ed28…`, also
byte-comparable to the note's §2 embed). Two runs, ports 19931 and 19932, each a
fresh server process on an empty state root:

1. `/__ready` → `204` (quiet probe, never logged).
2. **Visit 1** — `curl -c jar http://127.0.0.1:<port>/` → `200`,
   `Set-Cookie: tabi_sid=<16 lower-hex>; Path=/; HttpOnly; SameSite=Lax` (value
   redacted shape-only), body `data-visits="1"`.
3. **Visit 2** — `curl -b jar -c jar …/` → `200`, body `data-visits="2"`, no
   second `Set-Cookie`.
4. `/__ledger` after: `{"counter": 0, "tokens": {…0}, "sessions":
   [{"ordinal": "s1", "visits": 2}], "events": [session-mint cookie=absent,
   visit s1 cookie=absent visits=1, write-ok /, visit s1 cookie=present
   visits=2, write-ok /]}`.
5. **Cleanup** — `kill <pid>` (pid taken from the process table, never by
   pattern); process gone within 200 ms; `ss -ltn` shows the port closed;
   `curl` to the dead port rc 7; no residual `server.py` process.

The two runs' `ledger-after.json` are byte-identical (`45c1c4d13f124319…`),
which is the visit-pair core of the note's §4 claim ("visit count 1 → 2 same
profile", "server state; identity carried by the cookie"). The note's own
browser arm records the same ledger plus one extra event (`write-ok
/favicon.ico`) from the browser's favicon fetch — that difference is the client
footprint, not a state difference. The wire/client surfaces (cookie-shape
census, `requestWillBeSentExtraInfo` fields) were not re-measured — they need
CDP, and this audit ran the curl arm only (6.1).

## 3. The two debt-closure claims (method → result)

- **Claim 1 — the round-6/7 archive tranche closed** (`archive-receipt-r8.md`,
  ARCH-TRANCHE-R8). Re-derived: §2's per-group table (files/bytes) sums to 41 /
  207,889 B; A/B/C1/C2/C4/C5/C6 all re-derive as tabulated (D1–D4, D7–D8); the
  receipt is committed in `b377007`. Two count notes: D5 and D6 (below).
- **Claim 2 — F1 closed by erratum; the round-6 L1 matrix still open**
  (`carried-debt-closure-r8.md`, B8-2). Re-derived: the erratum's every number
  (E1), the "still open" verdict (E2), the citation block (E3), and its own
  "4-line does not re-derive" finding (E4). The note's own revision chain is on
  record (E1 stamp); claims unchanged across the revisions.

## 4. Spot-checks (this lane, non-author of everything checked)

- **SC-1 — an independent visit pair.** Two cold server processes, two `curl`
  pairs, byte-identical ledgers; cleanup proven both times (§2). This is the
  audit's own reproduction, not a re-read of the lane's artifacts.
- **SC-2 — C5 re-derivation (the largest archive check).** All 1,057 `: OK`
  lines across the 9 audit logs were resolved against the archived groups'
  `MANIFEST.txt` entries and re-hashed: 0 bad, 0 missing (commands in
  `/tmp/w8-aud-b8/checks/C5-full.txt`). This exceeds the receipt's own stated
  spot-check depth for C5 (it reported the count; the audit re-ran it whole).
- **SC-3 — the F1 staleness, both directions.** `sha256sum -c MANIFEST.txt`
  passes 83/83 while `sha256sum -c methodology-sha.txt` fails exactly 2 lines;
  the `diff` against the round-3 source group shows exactly the replay edit (3
  changed lines / 1 changed line). Stale pin file, intact bytes — as the
  erratum states.

## 5. Findings (observation; inference separated)

- **5.1 — C3's "+2 × 12" does not re-derive on one row [observation].** The
  receipt's C3 (`archive-receipt-r8.md` §3 C3) says `postappend-lines.txt` vs
  `final-lines.txt` differ "by exactly +2 lines" for 12/12 files. Measured:
  `final-lines.txt` equals today's `wc -l` 12/12, and the deltas are +2 for 11
  files but **+3** for `archive-receipt-r5.md` (177 → 180; the receipt's own §7
  errata block is the third line). Nothing else in C3 (the pre-append/repo
  comparison; the F3 conclusion) is affected. Erratum only; no harmonization
  here.
- **5.2 — the D-scan's file set no longer exists [observation].** 318 distinct
  ≥12-hex tokens is exact for `corpus/knowledge/*.md + reports/*.md + SKILL.md`
  *without* `archive-receipt-r8.md` and `carried-debt-closure-r8.md` (both
  landed after the scan at 19:02–19:04Z; their own shas are among the new
  tokens). Today: 340 tokens; the 22 new ones are unclassified by the receipt
  (it could not have seen them). [inference] The receipt's stamped values were
  correct at their stamp; a re-run must extend the classification, not edit it.
- **5.3 — the §2 embed vs the pinned bytes [observation].** The extracted fence
  hashes to `836169c55b3a54fc` (12,312 B) vs the pin `ac0013e03288ed28…`
  (12,311 B): the only difference is the final newline (the fence represents it
  as the line break before the closing marker). "Embedded verbatim" holds
  textually; a byte-for-byte replay from the markdown must add the newline
  convention. The note's "278 lines" is the logical count (`wc -l` → 277,
  no trailing newline) — a convention the note does not state at that pin.
- **5.4 — the runner moved between matrix rounds [observation, recorded by the
  lane].** `journey.mjs` pins are `e22a967ed69e9f6e…` for the first ten browser
  cells and `282511320499f1f5…` for the hop/stop/supersede cells; every
  `driver.log` prints its run's pin, and the note's §3 revision map states the
  change. The earlier revision's bytes were overwritten in place — the note
  records this as a hygiene finding for the archive seat. [inference] Per-cell
  rep-vs-rep comparisons are unaffected (each cell's reps share one pin); any
  cross-round digest comparison would not be revision-homogeneous.
- **5.5 — the visit-pair state shape vs the browser ledger [observation].** The
  audit's curl ledger and the note's browser ledger agree on every state event
  and differ only by the browser's favicon event — the state surface is
  client-independent, which is the strongest form of the note's "server state"
  reading.
- **5.6 — the round-8 records are moving [observation].** The stateful note
  moved during the audit window (`5066d17d…` → `e89bc89b…`), including a
  header-count correction (30 → 32 run dirs — the audit's own count: 16 cell
  dirs × 2 reps = 32) and a new U10. The bound revision above is the close-time
  one; a later revision is not covered.

## 6. Unknowns

- **6.1 — the 14 cells beyond the visit pair.** This audit re-ran the visit
  pair and the cleanup, not the interrupt/hop/nav/dup-submit cells; their
  per-cell claims rest on the lane's own `verify.py`/`compare.mjs` runs (the
  note names the non-author pass as owed, §9/§11). Re-derive with the lane's
  harness if needed.
- **6.2 — the browser-only surfaces.** The cookie-shape census and the
  CDP `requestWillBeSentExtraInfo` columns were not re-measured (needs CDP; the
  audit ran the curl arm).
- **6.3 — the 22 new D-scan tokens** (5.2) are unclassified; whether the
  integrating round extends the scan is its call.
- **6.4 — the receipt's owed items** (LOG/README/SKILL/SCORECARD rows for the
  tranche) are outside this audit's scope; at close, the receipt is committed
  and the round-7 LOG entry quotes the tranche's numbers, while
  `corpus/README.md` is still the round-3 header (not re-audited for this
  verdict).
- **6.5 — later revisions.** All three audited notes can move after this
  window; the verdicts bind the revisions in the binding table only.
- **6.6 — `/tmp` volatility.** The 6 source groups used in D3 still exist now;
  the archive receipt's U1 (later `/tmp` writes) stands, and this audit's
  fixture copy lives at `/tmp/w8-aud-b8/fixture/server.py` (volatile).

## 7. Errata (append-only)

*(none at write — corrections append below with date + evidence.)*