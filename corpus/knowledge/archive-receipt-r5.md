<!-- corpus entry — tabi-shokunin round 5 (2026-10-14), lane B5-1 (plan: plans/round-5.plan.md:1-11; clause (a) at :3-4 — "every /tmp evidence group archived into the corpus with a MANIFEST.txt whose hashes equal the owning notes' pins"; anti-claim :8-10). Method: read-only copy of the pinned tabi /tmp evidence groups (rounds 1-4) into `corpus/evidence/<group>/`, one MANIFEST.txt per group (sha256 of the archived copy), then three mechanical checks — manifest self-check (`sha256sum -c`), source-vs-archive hash-list equality, and a corpus-wide pin scan (every hex token of >=12 chars in `corpus/knowledge/*.md` + `reports/*.md` + `SKILL.md` against the archived hash set). Snapshot boundary: source measurement 2026-10-14T17:02:44Z, copy 17:03:00Z, manifests ~17:03Z, verification 17:04:17Z and re-run 17:07:07Z. Write scope: `corpus/evidence/**` + this file only — LOG.md append (AGENTS.md:3), the corpus/README coverage row, and the commit are left to the integrating round (r2/r3/r4 pattern). Anti-claim: no external site was contacted; /tmp was read-only (no byte written, moved or deleted there); no substrate was touched; profile/session bytes were never read or copied (excluded by path, never opened). Scratch: /tmp/w5-b5-1-archive/ (copy.log, manifests.log, verify.log, scripts; volatile per namespace rule). -->

# Archive receipt — pinned `/tmp` evidence → `corpus/evidence/` (round 5, B5-1)

## 1. What now exists (observation)

- **25 groups, 1,010 files, 6,780,293 bytes** under `corpus/evidence/`; each
  group carries a `MANIFEST.txt` (comment header + `sha256␠␠path` lines; check
  with `cd corpus/evidence/<group> && sha256sum -c MANIFEST.txt`).
- **5,668 files / 313,772,976 bytes excluded** — every path component starting
  with `profile` (chromium user-data trees: `profile`, `profile-run1/2`,
  `run1/profile`, `cdp/profile`, …). Exclusion counts are shape-only; no
  excluded byte was read.
- **Exclusion-rule deviation, for cause.** The assignment's literal rule is
  `*/profile/*`; that would have missed `/tmp/tabi-r3-4-work/profile-run1/` and
  `profile-run2/`, which hold chromium session material
  (`Cookies`, `Login Data`, `Login Data For Account`, `Trust Tokens` — names
  listed, never content-read). Rule widened to `*profile*` (338→636 files
  excluded in that group alone). PROVINCE.md:16-19 (session material is
  shape-only) is the authority for the widening.
- **Group `tabi-r2-2-state` is an aggregation**: the six loose
  `/tmp/tabi-r2-2-*.txt|log` state files (no directory of their own), named in
  `corpus/README.md:51` and pinned in `webbridge-daemon-disposition.md` §8.
- Evidence is not knowledge: the tree holds bytes only; the sole
  knowledge-side file from this lane is this receipt. No note was moved.
- The archive is a **timestamped snapshot**: round-5 peer lanes were writing
  elsewhere in /tmp during the copy (finding F3).

## 2. Per-group inventory (observed; archive-side counts)

| group | files | bytes | excl. files | excl. bytes | owning pin source (note refs) |
|---|---|---|---|---|---|
| `tabi3-cdp` | 5 | 23,742 | 197 | 48,281,731 | cdp-evidence-patterns.md (E1–E11, :84-105) |
| `tabi-audit2-cdp` | 5 | 27,689 | 355 | 150,722,397 | cdp-evidence-patterns.md:134-135 |
| `tabi-a1-r2b-capture` | 46 | 341,384 | 366 | 7,692,199 | hygiene-sweep-r4.md:59 |
| `tabi-a2-r2b-evidence` | 3 | 3,761 | 0 | 0 | hygiene-sweep-r4.md:146; pin file `01-docs-pins.txt` |
| `tabi-b1-r3b-journey` | 83 | 459,293 | 329 | 7,375,114 | hygiene-sweep-r4.md:60; in-group `methodology-sha.txt` (see F1) |
| `tabi-b1-r3b-scratch` | 0 | 0 | 0 | 0 | hygiene-sweep-r4.md sweep list; measured empty |
| `tabi-r2-1-capture` | 48 | 339,456 | 366 | 7,696,307 | live-dynamic-capture.md §1–§3 |
| `tabi-r2-2-state` | 6 | 7,736 | 0 | 0 | webbridge-daemon-disposition.md §8 |
| `tabi-r2-3-verify` | 7 | 40,972 | 0 | 0 | r1 notes' round-2 errata (pre-append proofs) |
| `tabi-r2-4-poll` | 2 | 3,754 | 0 | 0 | SKILL.md:441-442 |
| `tabi-r3-1-journey` | 63 | 360,661 | 310 | 7,338,666 | multi-step-journey.md §1–§2 |
| `tabi-r3-2-spot` | 11 | 19,802 | 0 | 0 | interaction-approval-table.md:181 |
| `tabi-r3-3-anchors` | 3 | 6,173 | 0 | 0 | hygiene-sweep-r4.md:150 |
| `tabi-r3-3-smoke` | 16 | 103,748 | 149 | 3,611,495 | SKILL.md:100,733; executor-test-sufficiency.md:68-69 |
| `tabi-r3-4-work` | 90 | 393,892 | 636 | 14,470,927 | executor-test-sufficiency.md §2, §8 |
| `tabi-r4-1-network` | 122 | 879,642 | 490 | 11,099,587 | network-evidence-rung.md (first dispatch) |
| `tabi-r4-2-async` | 101 | 639,072 | 471 | 11,029,432 | async-step-evidence.md (first dispatch) |
| `tabi-r4-3-sweep` | 9 | 14,063 | 0 | 0 | hygiene-sweep-r4.md:163-165,215 |
| `w4-t41-network` | 200 | 1,992,742 | 1,188 | 25,982,841 | network-evidence-rung.md §2, §11 |
| `w4-t4-2-async` | 101 | 634,907 | 471 | 11,033,546 | async-step-evidence.md (re-verification) |
| `w4-t4-3-sweep` | 11 | 51,921 | 0 | 0 | hygiene-sweep-r4.md §8 (:201-213) |
| `w4-t4-4-tabi` | 6 | 13,610 | 0 | 0 | SKILL.md:40,446,500; round-4 record draft §2.4 |
| `w4-aud-tab1` | 40 | 188,527 | 340 | 7,438,734 | reports/r4-aud-tab1.md; cdp-evidence-patterns.md:209-226; multi-step-journey.md:341-345 |
| `w4-erb-b-sweep` | 19 | 30,509 | 0 | 0 | errata blocks of the 8 round-4 notes; webbridge-daemon-disposition.md:267 |
| `w4-erb-b-append-proof` | 13 | 203,237 | 0 | 0 | errata blocks (pre-append copies + `append-proof.txt`) |
| **total** | **1,010** | **6,780,293** | **5,668** | **313,772,976** | |

## 3. Verification (mechanical, re-runnable)

- **A — manifest self-check.** `sha256sum -c MANIFEST.txt` in all 25 groups:
  **1,010/1,010 lines OK, 0 FAILED** (17:04:17Z; re-run 17:07:07Z identical).
- **B — copy fidelity.** Per group, the source-side hash list
  (`cd /tmp/<group> && find . -type f -not -path '*/profile*/*' -printf '%P\0' |
  sort -z | xargs -0 sha256sum`) was diffed against the manifest's hash list:
  **0 diff lines for all 25 groups** — every archived byte equals its /tmp
  source byte as of the snapshot.
- **C — in-group pin files.** 15 pin files, **109 pin lines: 107 OK, 2 FAILED**.
  Verified OK: `tabi-r2-1-capture` (4), `tabi-r3-1-journey` (9),
  `tabi-r4-1-network` (12) + `r3-fixture-pins.txt` (6),
  `tabi-r4-2-async` (11), `w4-t41-network` (13), `w4-t4-2-async` (11),
  `tabi-r4-3-sweep/PINS.txt` (8), `w4-t4-3-sweep/PINS.txt` (10 in-group lines;
  its 11th line is the corpus-note pre-append pin, excluded by design),
  `tabi-r3-4-work` evidence + evidence-runbook methodology files (4+4, absolute
  paths rewritten), `w4-erb-b-append-proof/pre-manifest.txt` (8, size-column
  form). The 2 failures are F1.
- **D — corpus-wide pin scan.** 587 unique archived hashes vs 179 distinct
  ≥12-char hex tokens in the notes/reports/SKILL: **141 match an archived file
  hash; 38 do not** — and all 38 are classified: 17 pin repo files (corpus
  notes / SKILL.md / reports revisions), 5 pin substrate files (webbridge
  plugin package + daemon binary), 16 are internal values (DOM-struct shas, one
  BuildID, UUID fragments, the PNG magic) recorded inside archived artifacts.
  Every one of the 38 appears as a substring in ≥1 archived file (min 1, max
  26). **No unmatched token names a file inside the archived groups.**
- **Spot-checks (named).**
  - **SC1** — live-dynamic-capture.md pin `c08947dc…802dc1`:
    `sha256sum corpus/evidence/tabi-r2-1-capture/run1/det-before.png` →
    `c08947dc1e02f0ea551b3beb42b4a3eb9641347d6d5ae65bebcbba01c0802dc1` = the
    manifest line = the note pin.
  - **SC2** — multi-step-journey.md pin `b52074a33876`:
    `journey.mjs` in `tabi-r3-1-journey` and `tabi-b1-r3b-journey` (and
    `w4-aud-tab1/harness/`) all hash to
    `b52074a3387622538f27bc02fc6cec9e0919f5ddf941b935575a996459d5ddbc` — the
    pin survives across three independent seats.
  - **SC3** — hygiene-sweep-r4.md SC1 pin `2a76e40f855c…9748`:
    `tabi-r4-3-sweep/PINS.txt` hashes to
    `2a76e40f855c00968f9593b7d1081b930d2f650e96049ccf739a918193970748`.
  - **SC4** — async-step-evidence.md pin `97ed8bfd06af`: `site/confirm.html`
    hashes to `97ed8bfd06af…258a19` in **both** async groups (first dispatch
    and re-verification) — the R4-2 fixture revision pin holds across the OOM
    dispatch boundary.

## 4. Findings (observation; inference separated)

- **F1 — one group's own pin file is stale w.r.t. its bytes (kept).**
  `tabi-b1-r3b-journey/methodology-sha.txt` lists round-3 pins for `driver.sh`
  (`9509c07f49f9…`) and `compare.mjs` (`ecce1c73dc56…`); the archived bytes
  hash to `68ceef09e4bf…` and `cc89210e9fd2…`. Measured cause surface: the
  diffs vs the round-3 files are exactly the replay edit — driver.sh: `ROOT`
  + `HTTP_PORT` + `CDP_PORT` (4 lines), compare.mjs: the `root` constant
  (1 line). *Inference (not measured):* the pin file was written from the
  upstream copies and never re-stamped after the edit; the analogous AUD-TAB1
  replay did re-stamp and documented its delta next to the pin
  (multi-step-journey.md:341-345, `c7eddbfce6ac…` = pinned driver + 3-line
  port delta). No owning-note pin is affected: hygiene-sweep-r4.md:60 cites
  this group's `final-sweep.sh` PASS line and its port row, both of which
  verify, and its 7 other pin lines all verify.
- **F2 — two groups' only in-tree references to profile bytes are exclusions
  (observed):** the Singleton* symlink triples (`SingletonCookie`,
  `SingletonLock`, `SingletonSocket`) exist only under `*/profile*` dirs — no
  symlink survives outside the excluded set (checked per group).
- **F3 — round-5 peer groups were live during the snapshot and are NOT in this
  archive.** Measured at 17:06Z: `/tmp/w5-tabi-b53/` (4 files, 14:01–14:04Z
  local), `/tmp/w5-aud-b5-work/` (3 files, 14:03–14:05Z), and
  `/tmp/w5-aud-b5-evidence/` (1 file, 14:03Z) — created by concurrent round-5
  lanes and named in `plans/round-5-record-draft.md:232-233` while still being
  written. They were mid-write, and their pins live in a round-5 draft record,
  not in a corpus note, so they are outside clause (a)'s "owning notes" at
  snapshot time. Archive at round close (§6).
- **F4 — the record draft and this snapshot disagree on one cell (report, not
  adjudicate; out of province, PROVINCE.md:22).** `plans/round-5-record-draft.md:233`
  records `/tmp/w5-aud-b5-work` "empty at 17:04Z"; measured at 17:06Z the dir
  holds `poll.sh` (mtime 14:03 local), `poll.log` (14:05 local, 1,008 B),
  `poll.out` (0 B). The two reading times differ and the draft's method is not
  in view — the conflict is reported, not resolved.
- **F5 — empty group, kept as measured.** `tabi-b1-r3b-scratch/` holds 0 files
  (dir mtime 12:32:54 local); whether it ever held bytes is unknown. It is
  archived as an empty group with a MANIFEST.txt recording 0 files.
- **F6 — process calibration (one line).** The first copy loop used `$GROUPS`,
  which bash reserves for the caller's group IDs: the loop collapsed to one
  bogus iteration (`/tmp/1000`), wrote nothing, and was fixed by renaming to
  `$GLIST`; the stray empty dir was removed. No evidence byte was affected
  (copy.log kept in scratch).

## 5. Unknowns

- U1 — Later /tmp writes: this archive freezes rounds 1–4 as of 17:03Z. Whether
  any pinned group gains bytes later (or a new pinned group appears before
  round close) is unmeasured by design; re-run check B to detect drift.
- U2 — Excluded profile surfaces: file counts and byte totals are recorded,
  content never read (policy). Whether any non-profile path holds session
  material elsewhere in /tmp is out of this lane's scope (kagi's province).
- U3 — F1's mechanism (pin file written before vs. not updated after the edit)
  is inference; the group's own author lane is the only witness.
- U4 — `tabi-b1-r3b-scratch` history (always empty vs. cleaned) unknown.
- U5 — 1,010 files hash to 587 unique values; the duplicate structure is
  consistent with the notes' byte-identity claims (identical artifacts across
  runs) but this receipt does not enumerate which groups share bytes.
- U6 — Round-5 groups (F3) are pinned by a *draft record* at snapshot time;
  whether the round closes with those pins in a corpus note is future state.

## 6. Owed (outside this lane's write scope)

- Archive the round-5 peer groups (F3) at round close, once their pins land in
  a corpus note; include `w5-`-prefixed groups then present.
- `LOG.md` append (AGENTS.md:3), corpus/README coverage row, SCORECARD
  freshness move-log, and the commit — integrating round's, per the r2/r3/r4
  pattern.
- Re-stamp or errata-note `tabi-b1-r3b-journey/methodology-sha.txt`'s two
  entries (F1) — a one-line erratum pointing at the driver/compare diffs would
  close it without touching archived bytes.

## 7. Errata / post-write re-check

- **[2026-10-14T17:07:41Z, post-write]** Full A+B re-run executed after this
  file landed: 1,010/1,010 manifest lines OK; 0 diff lines on every group;
  in-group pin failures unchanged (the 2 F1 entries). `find corpus/evidence
  -type f | wc -l` → 1,035 = 1,010 evidence files + 25 `MANIFEST.txt`. The tree
  did not change after the counts above were taken; no other errata.
