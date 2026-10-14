<!-- corpus entry — tabi-shokunin round 8 (2026-10-14), lane ARCH-TRANCHE-R8 (assignment: archive the remaining note-pinned `/tmp` groups of the round-6/7 tranche into `corpus/evidence/<group>/` with a per-group `MANIFEST.txt` whose sha256s equal the owning notes' pins, per the round-5 archive discipline `corpus/knowledge/archive-receipt-r5.md`; receipt owed by `plans/round-8.plan.md` §"Seats + write scopes" (freshness/debt seat: "archive tranche (round-6/7 groups + F1/F3) + receipt") and named as carried debt by `corpus/knowledge/packet-readiness-r7.md:54`). Method: read-only copy of the pinned `/tmp` groups that `corpus/evidence/` did not yet hold into `corpus/evidence/<group>/`, one `MANIFEST.txt` per group (comment header + `sha256␠␠path` lines, sha256 of the archived copy), then the r5 checks — A manifest self-check, B source-vs-archive hash-list equality, C in-group/owning-note pin equality, D corpus-wide pin scan with classification — plus named spot-checks. Snapshot boundary: source measurement 2026-10-14T19:01:16Z, copy 19:01:44Z, manifests 19:01:44Z, verification 19:02–19:04Z. Write scope: `corpus/evidence/**` + this file only — the `LOG.md` append (AGENTS.md:3), the corpus/README coverage row, the `SKILL.md` §Harness-archive count/distillation, the SCORECARD move-log and the commit are the integrating round's (r2/r3/r4/r5 pattern). Anti-claim: no external site contacted; `/tmp` was read-only (no byte written, moved or deleted there); no substrate was touched except read-only hashing of the three webbridge plugin files pinned inside `w5-tabi-b53/substrate-pins.txt`; session material was never read (exclusion by path; no `*profile*` path existed in any group copied here, so the rule was not exercised this pass); scratch `/tmp/w8-arch-tranche/` (copy/manifest/verify scripts + logs; volatile per namespace rule). -->

# Archive receipt — the round-6/7 `/tmp` tranche → `corpus/evidence/` (round 8, ARCH-TRANCHE-R8)

## 1. What now exists (observation)

- **7 new groups, 41 evidence files, 207,889 B** (file bytes) under `corpus/evidence/`:
  `w5-tabi-b53` (9), `w5-aud-b5-work` (6), `w5-aud-b5-evidence` (6), `w6-tabi-b62` (7),
  `w7-b71-synth` (3), `w7-aud-b7-scratch` (7), `w7-aud-b7-checks` (3 — an aggregation,
  see below). Each carries a `MANIFEST.txt`; check with
  `cd corpus/evidence/<group> && sha256sum -c MANIFEST.txt`.
- **Tree counts move 28 → 35 group dirs, 1,403 → 1,451 files,
  9,007,188 → 9,222,920 B** (the byte figure is `du -sb` and includes the 7 manifests
  and directory entries; the 41 evidence files themselves are 207,889 B).
- **0 files / 0 bytes excluded.** No path component containing `profile` exists in any
  group copied here, so the round-5 exclusion rule (`*profile*`, receipt r5 §1 :13-20)
  was carried but not exercised. No session material was opened, read or copied.
- **`w7-aud-b7-checks` is an aggregation.** The three loose `/tmp/w7-aud-b7-*.check`
  logs (`tabi-r4-1-network`, `tabi-r4-2-async`, `w4-t41-network`) sit at the `/tmp`
  root, not inside a group dir of their own; they are the "evidence tree" lines of
  `reports/r7-aud-b7.md:249-252`. Aggregating loose files under one group follows the
  round-5 precedent (`tabi-r2-2-state`, receipt r5 §1 :21-23). Basenames are preserved.
- **The brief's named fixture groups were already archived — verified, not re-copied.**
  The assignment named the round-4 network harness (`/tmp/w4-t41-network`), the journey
  harness (`/tmp/tabi-r3-1-*`) and the round-6 external-class v2 fixture
  (`/tmp/w6-tabi-b61`). All three are already in `corpus/evidence/` (rounds 5 and 7);
  their harness pins still match the owning notes today (§3 spot-checks SC1–SC3). The
  bytes that were still `/tmp`-only are the 7 groups landed here.
- Evidence is not knowledge: the tree holds bytes only; the sole knowledge-side file
  from this lane is this receipt. No note was moved or edited.
- The archive remains a **timestamped snapshot**: the manifests say what was copied at
  19:01:44Z, never what `/tmp` holds now (see U1).

## 2. Per-group inventory (observed; archive-side counts)

| group | files | bytes | excl. | owning pin source (note/report refs) |
|---|---|---|---|---|
| `w5-tabi-b53` | 9 | 11,558 | 0 | round-5 note append blocks (`corpus/knowledge/*.md`, lane B5-3 pin refresh) + `SKILL.md:809`; in-group pin files `methodology-r5.txt`, `repo-pins.txt`, `substrate-pins.txt`, `rung-recheck.txt`, `preflight.txt`, `postappend.txt`, `postappend-lines.txt`, `final-pins.txt`, `final-lines.txt` |
| `w5-aud-b5-work` | 6 | 13,706 | 0 | `reports/r5-aud-b5.md:5` (audit scratch); in-group `audit-sets*.sh`, `poll.sh`, `poll.log`, `poll.out`, `status` |
| `w5-aud-b5-evidence` | 6 | 130,755 | 0 | `reports/r5-aud-b5.md:5,78` (audit set re-hash outputs); `audit-sets.txt`, `audit-sets2.txt`, `richi-*.txt`, `pre-state.txt` |
| `w6-tabi-b62` | 7 | 5,227 | 0 | `corpus/knowledge/webbridge-revival-assessment.md` §8 :267-275 (first-12 pins) + §6; also named unarchived by `packet-readiness-r7.md:54` |
| `w7-b71-synth` | 3 | 1,310 | 0 | `corpus/knowledge/layer-routing-synthesis.md:180,234` (source-pin derivation) |
| `w7-aud-b7-scratch` | 7 | 30,650 | 0 | `reports/r7-aud-b7.md:249-252` (audit scripts, re-derivation logs, in-scratch checks) |
| `w7-aud-b7-checks` | 3 | 14,683 | 0 | `reports/r7-aud-b7.md:252` (loose `/tmp` root `.check` logs; aggregated group) |
| **total** | **41** | **207,889** | **0** | |

## 3. Verification (mechanical, re-runnable)

- **A — manifest self-check.** `sha256sum -c MANIFEST.txt` in all 7 new groups:
  **41/41 lines OK, 0 FAILED, exit 0 in every group** (19:02Z).
- **B — copy fidelity.** Per group, the source-side hash list
  (`cd /tmp/<group> && find . -type f -not -path '*profile*' -printf '%P\0' |
  sort -z | xargs -0 sha256sum`) was diffed against the manifest's hash list:
  **0 diff lines for all 7 groups** — every archived byte equals its `/tmp` source
  byte as of the snapshot. (The aggregation group was diffed against its three loose
  sources the same way: 0 diff lines.)
- **C — pin equality against the owning notes.** Seven sub-checks, all read-only:
  - **C1 — `w6-tabi-b62` vs `webbridge-revival-assessment.md` §8 first-12 pins:
    5/5 OK** (`01-live-state.txt` `188507399110`, `02-substrate-pins.txt`
    `dad32fe7df67`, `03-browser-extension.txt` `3f8607859882`, `04-headroom.txt`
    `8544c63d4d05`, `05-status-count.txt` `20d9f149a08e`).
  - **C2 — `w5-tabi-b53` in-group pins vs the archived tree:** `methodology-r5.txt`
    **25/25 OK, 0 not-archived** (its paths are `/tmp`-relative, so they were resolved
    inside `corpus/evidence/`); `rung-recheck.txt` **11/11 OK vs `w4-t41-network`**.
  - **C3 — repo-relative pin files.** `preflight.txt` (13 lines) and `repo-pins.txt`
    (15 lines) are the r5 **pre-append** pins: 12 lines in each differ from today's
    repo — the 12 files the round-5 lane appended to — and the deltas are exactly those
    appends (`postappend-lines.txt` pre-append counts vs `final-lines.txt` post-append
    counts: **12/12 differ by exactly +2 lines**). The lines that still match are the
    files r5 did not append to (`reports/r4-aud-tab1.md`; plus `corpus/QUALITY.md`,
    `corpus/README.md` in `repo-pins.txt`). `final-pins.txt` (the r5 **post-append**
    pins) is **11/11 current**. The pair reproduces the r5 pin-refresh's own
    before/after record (finding F3).
  - **C4 — substrate pins** (`w5-tabi-b53/substrate-pins.txt`, read-only hashing):
    **3/3 OK** — `kimi.plugin.json`, webbridge `SKILL.md`, `references/operations.md`.
  - **C5 — every `: OK` audit log re-verified against the archived manifests:**
    1,057 listed lines across 9 logs, **0 not-OK-in-manifest** —
    `richi-tabi-r2-2-state` 6, `richi-tabi-r3-1-journey` 63, `richi-w4-t41-network`
    200, `tabi-r4-1-network.check` 122, `tabi-r4-2-async.check` 101,
    `w4-t41-network.check` 200, `w6-tabi-b61.check` 139, `w6-ver-b6.check` 187,
    `w6-aud-b6-scratch.check` 39.
  - **C6 — `w7-b71-synth/source-pins-final.txt` vs the repo: 10/10 current**
    (the round-7 synthesis note's source pins still hold).
  - **C7 — `w5-tabi-b53/final-lines.txt` line counts: 12/12 match** the current repo.
- **D — corpus-wide pin scan.** 835 unique archived hashes vs **318 distinct
  ≥12-char hex tokens** in `corpus/knowledge/*.md` + `reports/*.md` + `SKILL.md`:
  **200 match an archived hash; 118 do not — and all 118 are classified**:
  **51 pin repo files** (current or historical revisions of corpus notes / `SKILL.md` /
  `reports/` / the approval packet), **59 are values internal to archived artifacts**
  (DOM-struct shas, PNG magic, UUID fragments, in-run pins), and the **8 remaining
  are historical revisions named individually** —
  `77c60a5a9d63…`/`dcfd2a4a998a…` = two in-wave revisions of
  `layer-routing-synthesis.md` (`reports/r7-aud-b7.md:232-233`),
  `c0d2629ecbfb…` = the 829-line `SKILL.md` revision (`packet-readiness-r7.md:120`),
  `dcc33f1bf531…` = the pre-round-6 `SKILL.md` sha (`SKILL.md:830`),
  `95bcdcd40f34f4c1` = the pre-append `packet-readiness-r7.md` fingerprint (:118).
  **No unmatched token names a file inside the archived groups** — the same
  conclusion as the round-5 scan (receipt r5 §3 D), re-derived on the enlarged tree.
- **Spot-checks (named).**
  - **SC1** — `multi-step-journey.md` journey-harness pin `b52074a33876`:
    `corpus/evidence/tabi-r3-1-journey/journey.mjs` and
    `corpus/evidence/w4-aud-tab1/harness/journey.mjs` both hash to
    `b52074a3387622538f27bc02fc6cec9e0919f5ddf941b935575a996459d5ddbc` — the pin
    survives across three independent seats.
  - **SC2** — `network-evidence-rung.md` §2 pins in `w4-t41-network`:
    `net-journey.mjs` `46c81f99decf` and `server.py` `a5ceef29fae5` — MATCH;
    `tabi-r3-1-journey/driver.sh` `9509c07f49f9`, `compare.mjs` `ecce1c73dc56` — MATCH.
  - **SC3** — `external-class-fixture-v2.md` fixture pins in `w6-tabi-b61`:
    `server.py` `936f1584bf81decca8cd5e588032c6748ccec70a10ec5ae29c88690efa56b83a`,
    `v2-driver.sh` `ebdf950a5c6a…`, `compare-v2.mjs` `ddd839de8264…`,
    `v2-journey.mjs` `ccc3d83703e6…` — all MATCH the note's §3/§9 values.
  - **SC4** — `w6-tabi-b62` §8 pins: see C1.

## 4. Findings (observation; inference separated)

- **F1 — `tabi-b1-r3b-journey/methodology-sha.txt` is still stale w.r.t. its own bytes
  (carried from round 5, unchanged, kept).** The r5 receipt's F1 stands verbatim:
  the file lists the round-3 pins `9509c07f49f9…` / `ecce1c73dc56…` while the archived
  replay bytes hash `68ceef09e4bf…` / `cc89210e9fd2…` (the 4-line `ROOT`/port edit and
  the 1-line `root` constant). No owning-note pin is affected, and the manifest plus the
  owning note remain the authority. **Not repaired** — see §6: writing an erratum file
  *into* the group would change its file list after its manifest was published.
- **F2 — the group-selection rule this pass used, stated so it can be overridden.**
  Selection = every `/tmp` group referenced by the round-5 **pin universe**
  (`corpus/knowledge/*.md` + `reports/*.md` + `SKILL.md`, the r5 receipt's own §3 D
  criterion) that was absent from `corpus/evidence/`. That set is exactly the 7 groups
  above. **Plan-draft-only lane scratch stays unarchived by design**, and is named here
  so the decision is visible rather than silent: `w6-s61-work`, `w6-scrb6-*`,
  `w6-scr-m6`, `w6-ver-t6`, `w6-tabi-b64`, `w7-scrb7`, `w7-tabi-b72-*`, `w7-ver-b7`
  (referenced only by `plans/round-6-record-draft.md` / `round-7-record-draft.md` /
  `round-8.plan.md`, or not at all; the round-6 record itself calls the fleet siblings
  "out of this lane's province" :221). The round-5 receipt likewise did not archive its
  own lane scratch (`/tmp/w5-b5-1-archive`).
- **F3 — the r5 pin-refresh's internal consistency is now measured, not assumed.**
  `w5-tabi-b53` carries both halves of the round-5 append: every pre-append pin
  (`preflight.txt`, `repo-pins.txt`, `postappend.txt`) differs from today's file, and
  every post-append pin (`final-pins.txt`) equals today's file 11/11; the line-count
  pair differs by exactly the append. This is the first time that pair has been
  re-verified from an archived copy.
- **F4 — process calibration (one line).** The first copy loop used `$GROUPS`, which
  bash reserves for the caller's group IDs: the loop collapsed to one bogus iteration
  (`/tmp/1000`), copied nothing, and created a stray `corpus/evidence/1000`; the loop was
  renamed to `$GLIST` and the stray empty dir removed **before any manifest was written**.
  No evidence byte was affected. Same class as the round-5 F6 — recorded because the
  reserved-name trap recurred.
- **F5 — the brief's named fixture groups needed no second copy.** `w4-t41-network`,
  `tabi-r3-1-journey` (and its replay copies) and `w6-tabi-b61` are already archived;
  SC1–SC3 re-derive their pins as MATCH, so no manifest was overwritten and no duplicate
  group was created.

## 5. Unknowns

- **U1 — later `/tmp` writes.** This archive freezes the tranche as of 19:01:44Z. Whether
  any pinned group gains bytes later, or a new pinned group appears before round close,
  is unmeasured by design; re-run check B to detect drift (r5 receipt U1, unchanged).
- **U2 — F2's excluded scratch.** Whether the round-8 record wants the plan-draft-only
  scratch groups archived as well is a record-owner's call, not this lane's; the list is
  named in F2 so the call can be made without re-deriving it.
- **U3 — F1's mechanism** (pin file written before vs. not updated after the edit) remains
  inference; the group's author lane is the only witness.
- **U4 — count staleness.** `SKILL.md` §"Harness archive" still states "25 groups / 1,010
  files / 6,780,293 B" and "rounds 1–4 groups only". Both are now stale (35 groups;
  1,416 evidence files; the round-6 fixture bytes *are* archived). This receipt supersedes
  the count for citation; updating the SKILL text is the integrating round's (§6).
- **U5 — byte-identity structure.** The tree's duplicate hashes (835 unique across 1,416
  files) are consistent with the notes' byte-identity claims, but this receipt does not
  enumerate which groups share bytes (r5 receipt U5, unchanged).

## 6. Owed (outside this lane's write scope)

- `LOG.md` append (AGENTS.md:3), the corpus/README coverage row, the `SKILL.md`
  §Harness-archive count/distillation update (U4), the SCORECARD freshness move-log and
  the commit — integrating round's, per the r2/r3/r4/r5 pattern.
- **F1 erratum** — one line pointing at the `driver.sh`/`compare.mjs` diffs would close it
  without touching archived bytes; deliberately left to the owning lane, because adding a
  file inside `tabi-b1-r3b-journey/` would change a published group's file list.
- Decide U2 (F2's plan-draft-only scratch).

## 7. Errata / post-write re-check

- **[2026-10-14T19:06Z, post-write]** Full A+B re-run executed after this file landed:
  **41/41 manifest lines OK, 0 FAILED, exit 0 in all 7 groups; 0 diff lines on every
  group.** `find corpus/evidence -maxdepth 1 -mindepth 1 -type d | wc -l` → 35;
  `find corpus/evidence -type f | wc -l` → 1,451 (1,416 evidence files + 35
  `MANIFEST.txt`). The tree did not change after the counts in §1–§2 were taken; no
  other errata.
- **[2026-10-14T19:06Z, scope note]** This receipt is a **new file**, not an append to
  `archive-receipt-r5.md`, precisely so that the r5 receipt's published sha
  `b41c2f6fb5a4…` (pinned in `plans/round-7-record-draft.md:164`,
  `plans/round-8.plan.md:30`) stays valid. The round-5 receipt's §6 owed items — F3's
  peer groups and F1's erratum pointer — are closed/recorded here instead.
- **[2026-10-14T20:44Z, F1 erratum — ER-F1]** F1 (§4 :116-122) is now **closed by
  erratum**: one line, outside the archived group, so the group's file list is unchanged —
  the archiver's constraint this receipt stated in §6 (:174-176, "adding a file inside
  `tabi-b1-r3b-journey/` would change a published group's file list") and inherited from
  `archive-receipt-r5.md` §6 (:170-172, "a one-line erratum pointing at the driver/compare
  diffs would close it without touching archived bytes"). The erratum is landed as
  `corpus/knowledge/carried-debt-closure-r8.md` §1.1 (lane B8-2); copied verbatim:
  > **ER-F1** — In `corpus/evidence/tabi-b1-r3b-journey/`, `methodology-sha.txt` (sha256
  > `04997cf58c00e61c…`) pins `driver.sh`
  > `9509c07f49f92113487d906b8c3137486d11a931559bbec850124e064af74b13` and `compare.mjs`
  > `ecce1c73dc56475034c185e1fac1b5b7d8dcaaae71f19ea6153a54c9f2cd3215`, but the archived bytes
  > hash `68ceef09e4bfe032e789a16a8ba95afe65f6c9772c9f98fe3f92a1b3d58681c3` (`driver.sh`) and
  > `cc89210e9fd216e34ad7aa052a8748f277801888acdfacd4e41e2d71451adc7e` (`compare.mjs`) — the
  > replay edit's `ROOT` path, `HTTP_PORT` 19421→19481 and `CDP_PORT` 19422→19482 in
  > `driver.sh`, and the `root` constant in `compare.mjs`; `MANIFEST.txt` (83/83
  > `sha256sum -c OK`) and the owning note's pins (`multi-step-journey.md:26-27`, binding the
  > `tabi-r3-1-journey` source group) are the authority, no owning-note pin is affected, and
  > no byte inside the group was changed by this erratum.
  Re-derived at this append (20:44Z): in the group, `sha256sum -c MANIFEST.txt` → **83/83 OK,
  exit 0**; `sha256sum -c methodology-sha.txt` → **7 OK / 2 FAILED, exit 1** (exactly
  `driver.sh`, `compare.mjs`); the group holds **84 files = 83 manifest-listed +
  `MANIFEST.txt`**, unchanged (no file in it newer than this receipt's 16:06 -03 commit).
  Independently audited by `reports/r9-aud-b9.md` (round 9, lane AUD-B9 — F1b and F1d both
  PASS, "it changed nothing inside the group"). Append-only: §6's "deliberately left to the
  owning lane" bullet stands as the record of where the erratum sat at write; this block
  records only that the item is now closed. This append moves the file's sha; the published
  `0587605db9138631` (191 lines, committed `b377007`) stands as the pre-append revision.
