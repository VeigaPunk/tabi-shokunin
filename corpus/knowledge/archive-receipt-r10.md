<!-- corpus entry — tabi-shokunin round 10 (2026-10-14), lane B10-2 (assignment: "the round-9 archive tranche: /tmp/w9-tabi-b91 (2,665 files, profile-excluded per the discipline) archived with MANIFEST into corpus/evidence/; the receipt"). Method: read-only copy of the round-9 lane's scratch (the state-changing-matrix wave's own harness + 20 run dirs under `/tmp/w9-tabi-b91/`) into `corpus/evidence/w9-tabi-b91/` with `*profile*` excluded by path (session material — shape-only, never read or copied), one `MANIFEST.txt` (comment header + `sha256␠␠path` lines, sha256 of the archived copy), then the r5/r8 checks — A manifest self-check, B source-vs-archive hash-list equality, C owning-note pin equality plus the §2-fence cross-artifact extraction, D corpus-wide pin scan with classification — plus named spot-checks SC1–SC7. Owning pins: `corpus/knowledge/state-changing-matrix-r9.md` §0 :26-38 and §11 :345-355; census `SKILL.md:1166-1174`. Snapshot boundary: source measurement 2026-10-14T20:52:16Z, copy 20:52:46Z, manifest 20:52:47Z, verification 20:52:47–20:57Z, source drift re-check 20:57:23Z (no drift). Write scope: `corpus/evidence/w9-tabi-b91/**` (new group) + this file only — the `LOG.md` append (AGENTS.md:3), the corpus/README coverage row, the SKILL §Harness-archive count update, SCORECARD and the commit are the integrating round's (r2–r8 pattern). Anti-claim: no external site was contacted; `/tmp` was read-only (no byte written, moved or deleted there — drift re-check 0 diff); no substrate content was read (the three webbridge plugin files were re-hashed read-only only); session material was excluded by path and never opened (2,396 files / 58,072,105 B, counts shape-only); the archived capture bytes contain the fixture's own one-time token values by construction (note §8.4) and no such value is reproduced in this receipt; scratch `/tmp/w10-tabi-b10-2/` (copy/verify scripts + logs; volatile per namespace rule). -->

# Archive receipt — the round-9 `/tmp` tranche → `corpus/evidence/` (round 10, B10-2)

## 1. What now exists (observation)

- **One new group: 269 evidence files, 1,065,924 B** under
  `corpus/evidence/w9-tabi-b91/`, plus `MANIFEST.txt` (5 header lines + 269
  `sha256␠␠path` lines / 30,103 B); check with
  `cd corpus/evidence/w9-tabi-b91 && sha256sum -c MANIFEST.txt`.
- **Tree counts move 35 → 36 group dirs, 1,451 → 1,721 files, `du -sb`
  9,222,920 → 10,318,947 B**; evidence files excluding the 36 manifests:
  1,416 / 9,069,322 B → **1,685 / 10,135,246 B**.
- **2,396 files / 58,072,105 B excluded** under `*profile*` paths —
  component-exact `profile` dirs `runs/<cell>/rep<N>/profile/**` (chromium
  user-data trees; session material is shape-only, PROVINCE.md:15-19). No file
  whose name contains `profile` exists outside such a component: the awk check
  over the full path list partitions 2,665 = 269 selected + 2,396 excluded.
  **No excluded byte was read.**
- **The source was quiescent during the pass**: its file list and hash list
  re-derived at 20:57:23Z against the 20:52 snapshot → **no drift**.
- The archive is a **timestamped snapshot** — the manifest says what was copied
  at 20:52:46Z, never what `/tmp` holds now (U1).
- Evidence is not knowledge: the sole knowledge-side file from this seat is this
  receipt. No existing group or manifest was modified.

## 2. Inventory (observed; archive-side counts)

| area | files | bytes | what |
|---|---|---|---|
| top-level harness | 12 | 142,106 | `server.py` 12,311 · `journey.mjs` 27,536 · `driver.sh` 4,850 · `curl-replay.sh` 3,385 · `curl-control.sh` 2,405 · `verify.py` 4,619 · `compare.mjs` 3,340 · `run-all-replay.sh` 713 · `run-all.log` 78,130 · `matrix.tsv` 491 · `compare-out.txt` 491 · `verify-out.txt` 3,835 |
| `__pycache__/` | 1 | 7,527 | `verify.cpython-314.pyc` (first `.pyc` in the tree — F2) |
| `runs/` | 256 | 916,291 | 9 cell dirs / 20 rep dirs (below) |
| `MANIFEST.txt` | — | 30,103 | 274 lines |
| **total** | **269** | **1,065,924** | |

Per-cell run dirs (non-profile artifacts): `replay-guard-skip` 3 reps / 45
files / 173,845 B · `replay-consumed-pre` 3 / 45 / 164,051 ·
`double-apply-fresh-token` 2 / 24 / 128,826 · `replay-terminus` 2 / 24 / 122,215 ·
`replay-consumed-post` 2 / 30 / 109,582 · `replay-307` 2 / 24 / 109,472 ·
`replay-unknown-token` 2 / 24 / 80,916 · `xclient-consume` 2 / 20 / 14,194 ·
`xclient-sessions` 2 / 20 / 13,190. The note's "256 non-profile run-artifact
files" counts exactly the `runs/` set; 256 + 12 + 1 = 269 closes the
`SKILL.md:1168` census.

Owning pin source: the round-9 note (`state-changing-matrix-r9.md` §0 :26-38
harness pins; §11 :345-355 archive debt) and the SKILL census block (:1166-1174).

## 3. Verification (mechanical, re-runnable)

- **A — manifest self-check.** `sha256sum -c MANIFEST.txt` → **269/269 lines
  OK, 0 FAILED, exit 0** (20:52:47Z).
- **B — copy fidelity.** Source hash list (`cd /tmp/w9-tabi-b91 && xargs -d '\n'
  -a select.list sha256sum`, the select list = every file with no `profile`
  component) vs the manifest's list: **269 lines each, 0 diff lines** — every
  archived byte equals its `/tmp` source byte as of the snapshot; re-run at
  20:57:23Z: still 0 diff.
- **C — pin equality against the owning note (7/7 MATCH):**
  - `server.py` `ac0013e03288ed28bd79519d9fbfd45814c97824f76dae9b6546c27d6b3ea0cc` (= :26)
  - `journey.mjs` `cecf3373bceaabdc8807801b6992abd5a30a009df90f7e68c2c193553f63c86a` (= :34)
  - `driver.sh` `de31bea55f1aae9caf4c3001795e72019c5ed6aeac4c3dd91ac929732f028141` (= :35)
  - `curl-replay.sh` `f1763acb73a6f34504c5030278023f8d37a68c35cbe0a303ff86d0f31317c6f8` (= :36)
  - `verify.py` `67883a80d19fcbe9…` (= :38; archived full
    `67883a80d19fcbe960503121a5b82b1760969cfa9a568574dbd6d88d222ab0e6`)
  - `compare.mjs` `764fec22578c6827…` (= :38; full
    `764fec22578c6827e37204c96e1a587dd8f5347d5172a6d674ddd7b6eda33d99`)
  - `curl-control.sh` `8737d42b8c9ac176…` (= :37; full
    `8737d42b8c9ac1761e599a69069eac042ec0d0e2b2dd43102ca55d838eae3a00`)
  - **cross-artifact (the §2 python fence of `stateful-fixture-evidence.md`,
    lines 92-369):** extracted → 12,312 B /
    `836169c55b3a54fc775d980bbc42e72081d83cf285dd41101512d28cebaf217d`; minus
    the fence's final newline → **12,311 B / `ac0013e03288ed28…` = the archived
    `server.py`** — the r9 note's SC-1 (:318-324) re-derives on the archived copy.
- **D — corpus-wide pin scan.** 390 distinct ≥12-char hex tokens in
  `corpus/knowledge/*.md` + `reports/*.md` + `SKILL.md` vs **1,020 unique hashes
  across 1,685 archived evidence files** (manifests excluded): **220 match an
  archived hash; 170 do not — and all 170 are classified**:
  **67 pin current repo files** (notes / SKILL / reports / plans / receipts and
  other tree files), **1 is a commit pin** (`6a8861c1385c900b58a69fbefa1cba16c07e1b86`),
  **61 are values internal to archived artifacts** (digests re-derived from the
  bytes — e.g. `ec26a525bc7c6537` / `ab95cdd4b0b002a7` inside `verify-out.txt`;
  `3f5a2716b097eacf` / `4ef20c1444e14656` = the `replay-terminus` PNG / shape
  bytes), **3 are the substrate pins** (webbridge plugin files, re-hashed
  read-only), and **38 are the residue, each classified**: **10 name files or
  values of unarchived sibling scratch** (measured by read-only hash sweep of
  `/tmp/w8-tabi-b81`, `/tmp/w8-ver-b81`, `/tmp/w8-arch-tranche`,
  `/tmp/w9-aud-b9-f1`, `/tmp/w9-aud-b9-harness`, `/tmp/w9-scrb9`,
  `/tmp/w9-ver-b9-work` — e.g. `282511320499f1f5…` / `30466a46045b142e` /
  `435f623823b80b7d` = the r8 harness `journey.mjs` / `verify.py` / `compare.mjs`,
  each present in three unarchived trees), **9 are committed historical
  revisions** of repo files (resolved in git history: `0587605db9138631` =
  `archive-receipt-r8.md` @ b377007/6a8861c; `3b79ed2dea6c…` = `SKILL.md` @
  6a8861c; `8874306672b65d8d…` = `SKILL.md` @ b377007; `dcc33f1bf531…` =
  `SKILL.md` @ bc4b7d5c; `f3b7bc3864ee3197` = `LOG.md` @ b377007; `d2e6895264c6`
  = `SCORECARD.md` @ b377007), **13 are never-committed working-tree revisions**
  (not in git history and not in the swept scratch — e.g. the two
  `layer-routing-synthesis.md` in-wave revisions, the r8 note's mid-audit
  revisions, the `carried-debt-closure-r8.md` revision chain), **4 are
  audit-derived digests** that exist only as script output (the r8/r9 audits'
  normalized `http.log` / byte-identical `ledger-after.json` digests — no stored
  file hashes), **1 is a malformed commit pin** (F1), and **1 is named
  unrecoverable** (`e22a967ed69e9f6e`, the r8 runner revision — no bytes anywhere
  in the swept trees, consistent with the r8 note's own statement).
  **No unmatched token names a file inside the archived groups.**
- **Spot-checks (named).**
  - **SC1** — the §2-fence extraction (C above): the cross-note byte identity
    holds on the archived copy.
  - **SC2** — the harness pin set (C above): 7/7 against the round-9 note's §0.
  - **SC3 — the rep3 claim re-derives.** Note §10 SC-3 ("rep3 … digest sha equals
    rep1/rep2") is not visible in `verify-out.txt` (rep1/rep2 lines only);
    re-derived from the archived `journey.json` with a scratch-patched `verify.py`
    (ROOT → the archive, reps 1,2,3): **rep3 digest sha = rep1/rep2 =
    `ec26a525bc7c6537` (`replay-guard-skip`) / `ab95cdd4b0b002a7`
    (`replay-consumed-pre`), lines 22, ALL_IDENTICAL**. `ledger-after.json` is
    byte-identical rep1/rep2/rep3 in both cells (`5d0884813ccb65da…` /
    `50956809aa556a75…`); rep3 `closure.txt` passes (no chromium, ports not
    listening, `curl` exit 7 both).
  - **SC4** — `matrix.tsv` and `compare-out.txt` are byte-identical
    (`3ed234264cd990af…`, 491 B — F3): 9/9 cells `yes/yes/yes`, `closed/closed`;
    `verify-out.txt` prints `ALL_IDENTICAL` for 7/7 browser cells.
  - **SC5 — determinism classes re-derived** (central cells, rep1 vs rep3): both
    PNGs and `facts.json` / `ledger-before/after.json` are byte-identical; the
    DOM snapshot and shape differ on **exactly one line** — the hidden token
    input's `value` attribute (2 diff lines over a 754-B shape; the values are
    the fixture's one-time tokens and are not reproduced here, shape-only rule)
    — consistent with note §8.4 / M8.
  - **SC6** — the exclusion boundary: 269 selected + 2,396 excluded = 2,665;
    exclusion is component-exact `profile`; nothing else matches `*profile*`
    (awk over the full path list, both directions).
  - **SC7** — the SKILL's two recorded spot-checks (:1183-1189) re-derive on the
    archive: `runs/replay-consumed-post/rep1/http.log` lines 4-6 carry `303` →
    `== ABORTED response write` → replay `409`; the two central-cell digests
    print as quoted.

## 4. Findings (observation; inference separated)

- **F1 — one malformed HEAD pin is in the record.** `carried-debt-closure-r8.md:5`
  cites HEAD `b377007877be2d104cc9e3da56cf81a24ab0d` — 37 hex chars, not a
  resolvable git prefix (`git cat-file -t` → rc 128; `git rev-parse b377007` →
  `b377007877be2d104cc9e3a73de56cf81a24ab0d`). The correct full sha appears in
  `plans/round-8-record-draft.md:235` and `plans/round-9.plan.md:10`; the
  malformed string occurs exactly once in the tree. Recorded, not repaired
  (write scope); an append-only erratum closes it (§6).
- **F2 — the non-profile census closes with a first.** 256 run artifacts + 12
  top-level harness files + 1 `__pycache__/verify.cpython-314.pyc` = 269 (matches
  `SKILL.md:1168` and the note's "256 … run-artifact files"). The `.pyc` is the
  first compiled-artifact byte in `corpus/evidence/`; included because the
  exclusion rule is `*profile*` only and the 269 census counts it (decision
  recorded, not silent).
- **F3 — `matrix.tsv` and `compare-out.txt` are one table under two names**
  (byte-identical, `3ed234264cd990af…`, 491 B). Not a defect; recorded so a
  reader does not treat them as independent digests.
- **F4 — the profile exclusion was exercised at scale this pass** (2,396 files /
  58,072,105 B), unlike r8 (0 files). Counts shape-only; nothing was read.
- **F5 — `verify.py` hard-codes `ROOT = '/tmp/w9-tabi-b91/runs'`.** Run as-is
  after `/tmp` is gone it reads nothing; the SC3 re-derivation used a
  scratch-patched copy (ROOT → the archive path; reps 1,2,3). Recorded so the
  archived verifier stays usable (inference: the constant was its run-time root;
  the archived copy is read-only).

## 5. Unknowns

- **U1 — later `/tmp` writes.** The tranche is frozen as of 20:52:46Z; whether
  `/tmp/w9-tabi-b91` gains bytes later is unmeasured by design (drift re-check
  clean at 20:57:23Z). Re-run check B to detect drift.
- **U2 — sibling scratch outside this tranche.** The round-8 tranche
  (`/tmp/w8-tabi-b81/`, `/tmp/w8-ver-b81/`) is still unarchived (`SKILL.md:1175`;
  its bytes were hash-swept read-only here for check D — the r8 harness
  revisions resolve there). The r9-audit / scribe / verifier scratch
  (`/tmp/w9-aud-b9-*`, `/tmp/w9-scrb9`, `/tmp/w9-ver-b9-work`) is not named as
  archive debt by any owning note. Neither set is in this seat's assignment.
- **U3 — session material elsewhere.** Whether any non-`profile` path in the
  source holds session material is unmeasured by design (kagi's province;
  r5 U2 unchanged).
- **U4 — the `.pyc`'s portability** (cpython-314 bytecode) is not needed for any
  re-derivation; kept as a snapshot byte only.
- **U5 — duplicate-hash structure.** 1,685 archived files hash to 1,020 unique
  values; the tree is consistent with the notes' byte-identity claims, but this
  receipt does not enumerate which groups share bytes (r5 U5 unchanged).
- **U6 — F1's mechanism** (a copy/paste or truncation slip in one file's
  baseline line) is inference; the erratum is the repair path.

## 6. Owed (outside this lane's write scope)

- `LOG.md` append (AGENTS.md:3), the corpus/README coverage row, the `SKILL.md`
  §Harness-archive count update (36 / 1,721 / 10,318,947 B; the round-9 tranche
  now **archived** — the round-8 tranche remains the open one), the SCORECARD
  move-log and the commit — the integrating round's, per the r2–r8 pattern.
- **F1 erratum** — one line pointing at the malformed 37-char HEAD pin in
  `carried-debt-closure-r8.md:5` (correct:
  `b377007877be2d104cc9e3a73de56cf81a24ab0d`); append-only, no byte of any
  archived group is touched.
- The round-8 tranche archive (U2) — named, not absorbed.

## 7. Errata / post-write re-check

- **[2026-10-14T20:59:51Z, post-write]** Full A+B re-run executed after this file
  landed: **269/269 manifest lines OK, 0 FAILED, exit 0**; source-side hash list
  vs the snapshot list → **0 diff lines** (no `/tmp` drift in the window).
  `find corpus/evidence -maxdepth 1 -mindepth 1 -type d | wc -l` → 36;
  manifests → 36; files → 1,721; `du -sb corpus/evidence` → 10,318,947 B. The
  tree did not change after the counts in §1–§2 were taken; no other errata.
  This receipt's own hashes: first write 197 `wc -l` / 14,687 B /
  `a73cd2d9ddfcb558…`; any later append moves the sha by construction.

## 8. Round-11 append — the final archive sweep (round 11, lane B11-3 / training r10)

> Assignment (verbatim): *"B11-3 — the final archive sweep: the round-10/11 scratch tranche
> archived (per the discipline); append the receipt."* Method: read-only copy of the tabi
> round-10/11 `/tmp` groups (the w10 and w11 lane scratches) into `corpus/evidence/` with one
> `MANIFEST.txt` per group (comment header + `sha256␠␠path` lines, sha256 of the archived
> copy), then the r5/r8/r10 checks — A manifest self-check, B source-vs-archive hash-list
> equality, C pin equality (audit hash pair, fence extraction, 5 spot re-runs, two sibling pin
> sets), D corpus-wide pin scan with classification — plus named spot-checks and a
> remaining-`/tmp` census (every remaining tabi group archived or named with its reason).
> **Why this append and not a new file:** the assignment says to append; this receipt's own
> closing line (*"any later append moves the sha by construction"*) anticipates it; and the
> final sweep closes exactly the items its §5 U1/U2 and §6 left owed. Pre-append revision
> `c6f4445ebd0358f8fa64ef2742a64768e644d55da6ee324054513b0fa05eb74a` / 203 `wc -l` /
> 15,197 B (mtime 2026-10-14T21:00:01Z) stands as published; this append moves the sha by
> construction.
> Snapshot boundary: scan ≈21:38–21:39Z, snapshot+copy **21:40:00Z**, manifests **21:40:52Z**,
> verification 21:40:52–21:44:11Z. Write scope: `corpus/evidence/w10-*` and
> `corpus/evidence/w11-*` (9 new groups) + this append only — the `LOG.md` append
> (AGENTS.md:3), the corpus/README coverage row + header counts, the SKILL §Harness-archive
> census update, SCORECARD and the commit are the integrating round's (r2–r10 pattern).
> Anti-claim: no external site contacted; `/tmp` was read-only (no byte written, moved or
> deleted there); session material was excluded by path and never opened — **no `*profile*`
> path component existed in any group copied here** (rule carried, not exercised this pass);
> no substrate was touched except read-only hashing of the three webbridge plugin files;
> scratch `/tmp/w11-b11-3-sweep/` (scripts + logs; volatile per namespace rule).

### 8.1 What now exists (observation)

- **9 new groups, 52 evidence files, 390,702 B** under `corpus/evidence/`, each with a
  `MANIFEST.txt` (9 manifests, 10,403 B — 61 new files / 401,105 B in all); check with
  `cd corpus/evidence/<group> && sha256sum -c MANIFEST.txt`.
- **Tree counts move 36 → 45 group dirs, 1,721 → 1,782 files, `du -sb` 10,318,947 →
  10,720,052 B**; evidence files excluding the manifests: **1,685 → 1,737**; manifests
  36 → 45.
- **0 files / 0 bytes excluded** under `*profile*` components in any group copied here (the
  r5 §1 :13-20 exclusion rule carried, not exercised); no session material was opened, read
  or copied.
- **The archive is a timestamped snapshot** — the manifests say what was copied at
  **21:40:00Z**, never what `/tmp` holds now (§8.6 U1).
- **Duplicate-hash structure (new set):** 52 files hash to 46 unique values; 6 duplicate
  instances in 5 pairs — `w11-b11-4-pins/skill_pins.txt` = `w11-ver-b11-poll/skill_pins_bounded.txt`
  (cross-lane byte identity); `w10-aud-b10-work/source-hashes.txt` = its `archive-hashes.txt`;
  `w11-ver-b11-poll/b114.norm` = `bounded.norm`; `w10-aud-b10-work/disk-paths.txt` =
  `manifest-paths.txt`; and a three-way `w10-scrb10/spot-w9-tabib91.txt` =
  `w10-aud-b10-work/mc-early.txt` = `w11-b11-2-check/manifest-check.txt` (three captures of the
  one 269-OK w9-manifest check output).
- **Group naming:** `/tmp` group basenames preserved; `w11-b11-1` is an aggregation of the five
  loose `/tmp/w11-b11-1-*.txt` files at the `/tmp` root (basenames preserved; the r5 §1 :21-23
  loose-file precedent).
- Evidence is not knowledge: the sole knowledge-side write of this seat is this append.

### 8.2 Inventory (observed; archive-side counts)

| group | files | bytes | manifest | scope (lane scratch) |
|---|---|---|---|---|
| `w10-b101-arc` | 2 | 9,653 | 7 L / 816 B | B10-1 arc-synthesis pre-write pins + verify log |
| `w10-tabi-b104` | 5 | 117,916 | 10 L / 1,094 B | B10-4 poll seat (candidate-path watch; CAP-REACHED) + `pre-SKILL.md` |
| `w10-scrb10` | 7 | 24,453 | 12 L / 1,275 B | SCR-B10 poll + 5 archive-group spot files |
| `w10-aud-b10-work` | 14 | 152,796 | 19 L / 2,098 B | AUD-B10: source/archive hash pair, fence extraction, arc-bound copy |
| `w11-b11-1` | 5 | 16,207 | 10 L / 1,076 B | B11-1 loose-file aggregate (measure/final/fleet/last/verify) |
| `w11-b11-2-check` | 2 | 22,070 | 7 L / 809 B | B11-2: w9-group manifest-check + measure |
| `w11-b11-4-pins` | 1 | 1,932 | 6 L / 688 B | B11-4 pin table |
| `w11-scr-b11-poll` | 2 | 7,012 | 7 L / 747 B | SCR-B11 landing watch |
| `w11-ver-b11-poll` | 14 | 38,663 | 19 L / 1,800 B | VER-B11 live reads (baseline, pins recon, spot sets) |
| **total** | **52** | **390,702** | **97 L / 10,403 B** | 9 groups |

### 8.3 Verification (mechanical, re-runnable)

- **A — manifest self-check.** `sha256sum -c MANIFEST.txt` in all 9 groups: **52/52 lines
  OK, 0 FAILED, exit 0 in every group** (21:40:52Z; per group 2/5/7/14/5/2/1/2/14).
- **B — copy fidelity.** Source snapshot hash list (21:40:00Z, `sha256sum` over the select
  list) vs the manifest's list: **0 diff lines in all 9 groups** — every archived byte equals
  its `/tmp` source byte as of the snapshot. Drift re-check at 21:44:11Z (source now vs the
  snapshot): 7 groups 0; `w11-scr-b11-poll` +2 lines (`poll.log`), `w11-ver-b11-poll` +4 lines
  (`landings.log`, `poll.log`) — the live round-11 lanes were still writing (§8.6 U1).
- **C — pin equality (owning notes and sibling records), all read-only:**
  - **C1** — `w10-aud-b10-work/source-hashes.txt` and `archive-hashes.txt` are content-identical
    to each other and to the **269-line** hash list of the archived `w9-tabi-b91` manifest
    (**0 diff lines** after path-sort) — the r10 audit's copy-fidelity proof re-derives.
  - **C2** — `w10-aud-b10-work/fence.txt` `836169c55b3a54fc…` (12,312 B); `fence-nonl.txt`
    **12,311 B / `ac0013e03288ed28…` = the archived `w9-tabi-b91/server.py`** — the §2-fence
    cross-artifact identity of `stateful-fixture-evidence.md:92-369` re-derives on the archive.
  - **C3** — the five `w10-scrb10/spot-*.txt` files re-run against today's tree; OK counts equal
    in every case: `w5-tabi-b53` 9/9 · `w6-tabi-b61` 139/139 · `w7-b71-synth` 3/3 ·
    `tabi-b1-r3b-journey` 83/83 · `w9-tabi-b91` 269/269.
  - **C4** — `w10-b101-arc/pins.txt` (23 pre-write pins, 20:54:12Z) vs the current repo:
    **20/23 match; 3 moved, each the record's own later write** — `SKILL.md`
    `c07d29c3e8d1`→`f4d9cf5b1aa5` (the r10 close revision 1189 L → r11 live edits; intermediate
    `453ed25a07f6` / 1320 L at 21:31Z), `SCORECARD.md` `2a7b02743265`→`106377d15dc8`,
    `LOG.md` `bb58f8afc29c`→`0e35e9855e79` (both by the r10 integration commit `d24b98d`).
  - **C5** — `w11-ver-b11-poll/pins_recon.txt` spot re-derivation against the live repo:
    `corpus/knowledge/arc-synthesis.md` `f42428bd9af7…` / 183 L ✓ ·
    `state-changing-matrix-r9.md` `ec540be07ed5…` / 388 L ✓.
  - **C6** — `w10-tabi-b104/pre-SKILL.md` = **`c07d29c3e8d1…`** — the r10-era SKILL revision
    (1189 L) held by no committed revision; its bytes are now durable in the archive.
- **D — corpus-wide pin scan.** 444 distinct ≥12-char hex tokens in `corpus/knowledge/*.md` +
  `reports/*.md` + `SKILL.md` vs **1,063 unique hashes across 1,737 archived evidence files**:
  **236 match; 208 do not — and all 208 are classified**: **82 pin current repo files**,
  **12 name values/files of the still-unarchived tabi scratch** (§8.5), **3 are the substrate
  pins** (`e70aff5c40ff` / `84a8e69d04c5` / `b811d9c23dfd`), **90 are values internal to
  archived artifacts**, **7 resolve to committed historical revisions of repo files** (e.g.
  `f3b7bc3864ee3197` = `LOG.md@b377007`; six manifest revisions at `d24b98d`), **1 is a commit
  pin** (`6a8861c1385c9b…`), and **13 are the residue, each classified**: 4 audit-derived
  normalized digests that exist only as script output (`45c1c4d13f124319…`, `4660ead419dc7e8a`,
  `8559c71ae8028e25`, `5d0884813ccb65da` — the r8/r9 audits' and this receipt's §3 SC3
  re-derivations; no stored file hashes them) and 9 strings from 5 documented working-tree
  revisions whose bytes are not preserved (`77c60a5a9d63…`/`dcfd2a4a998a…` = the two in-wave
  layer-routing-synthesis revisions; `95bcdcd40f34f4c1` = the pre-append
  `packet-readiness-r7.md` fingerprint; `e3b24db30479d0d2`/`8c6b0a38d7005e6d` = the
  carried-debt-closure-r8 revision chain; `5066d17d1f89f597` = the stateful note's mid-audit
  revision). **No unmatched token names a file inside the archived groups.** Newly covered by
  this sweep: **3 token families** — `836169c55b3a54fc…` (the §2-fence extraction, now a file),
  `c07d29c3e8d1…` (the r10 SKILL revision, via `pre-SKILL.md`), `f42428bd9af7…` (the synthesis
  bytes, via `w10-aud-b10-work/arc-bound.md`).
- **Spot-checks (named).**
  - **SC1** — C2: the fence / fence-nonl / archived `server.py` byte chain.
  - **SC2** — C1: the 269-line audit pair vs the w9 manifest.
  - **SC3** — `w11-b11-2-check/manifest-check.txt` (269/269 OK) re-run = the SCR-B10 and
    AUD-B10 copies (the three-way byte identity of §8.1).
  - **SC4** — C5: the two VER-B11 pin re-derivations.
  - **SC5** — the live census: groups → 45; manifests → 45; evidence files → 1,737.

### 8.4 Findings (observation; inference separated)

- **F1 — the reserved-name trap recurred (the r8 §4 F4 class).** The first sweep attempt used
  `$GROUPS`, which bash reserves for the caller's group IDs: the loop collapsed to `/tmp/1000`,
  matched no source, and **wrote nothing anywhere** — caught before any byte or manifest; the
  list was renamed. Recorded because the same class bit the r8 lane.
- **F2 — the round-11 groups are live.** Post-snapshot drift (§8.3 B) is exactly the two poll
  seats' logs; the manifests remain the authority for what was copied, never for what `/tmp`
  holds now (U1).
- **F3 — `SKILL.md` moved twice inside the wave window** (1189 → 1320 → 1458 L;
  `c07d29c3e8d1` → `453ed25a07f6` → `f4d9cf5b1aa5`). The r10 pins citing `c07d29c3e8d1` are
  superseded; the r11 plan's clause C pin-refresh is the re-binding surface (not this seat's
  write scope).
- **F4 — duplicate structure in the new set** (§8.1): 5 pairs / 6 instances, including a
  cross-lane byte identity (`skill_pins.txt` shared by B11-4 and VER-B11) and the three-way
  w9-check capture — recorded so a reader does not count them as independent evidence.
- **F5 — the sweep closed three previously-unmatched token families** (§8.3 D): the fence
  extraction, the r10 SKILL revision, and the synthesis-bound copy now have durable bytes.
- **F6 — the remaining-`/tmp` census is named, not absorbed** (§8.5): the r8 tranche (the
  oldest named debt, r10 §5 U2), the w9 audit/scribe/verifier residuals, and the two
  archiver-declared volatile scratches stay on disk, each with its reason; their bytes were
  alive at 21:44:11Z.

### 8.5 Remaining tabi `/tmp` groups (named with reason; read 21:44:11Z)

- **The r8 tranche — the oldest named debt** (r10 §5 U2: still unarchived; the r11 plan:
  *"settled or explicitly handed off"*): `/tmp/w8-tabi-b81` (**5,105 files / 111,930,667 B**) +
  `/tmp/w8-ver-b81` (**980 / 21,992,329 B**) — bytes alive at this read; **not absorbed here**
  (outside this seat's assignment); named so the round's archive or closeout seat can settle it.
  Its one unrecoverable revision: §8.6 U3.
- **w8-era siblings, named only** (no owning-note archive debt): `w8-arch-tranche` 44 / 310,490
  (the r8 archiver's own scratch — declared volatile in the r8 receipt header); `w8-aud-b8`
  26 / 44,363; `w8-scrb8` 4 / 4,329; `w8-ver-b8-work` 19 / 59,441; `w8-tabi-b84-draft` 2 / 4,920;
  `w8-tabi-b84-poll` 5 / 41,481; the loose `/tmp/w8-ver-b8-poll.{sh,log}`, `/tmp/w8-f1-all.txt`,
  `/tmp/w8-f1-man.txt`, `/tmp/w8-b82-manifest.log`, `/tmp/w8-frozen-files.txt`,
  `/tmp/w8-tracked-files.txt` (≈146,000 B together).
- **w9 residuals, named only** (r10 §5 U2: *"not named as archive debt by any owning note"*):
  `w9-aud-b9-f1` 5 / 11,485; `w9-aud-b9-harness` 649 / 13,091,576; `w9-scrb9` 5 / 8,461;
  `w9-ver-b9-work` 30 / 67,715.
- **w7 plan-draft scratch, unarchived by design** (r8 §4 F2): `w7-tabi-b72-archive` 22 / 107,726
  plus nine loose `w7-tabi-b72-*` files (71,789 B together).
- **Archiver-declared volatile scratches:** `/tmp/w10-tabi-b10-2` (30 / 1,628,004 — the r10
  archive seat's copy/verify scripts + logs, declared volatile in this receipt's header) and
  `/tmp/w11-b11-3-sweep` (82 / 92,535 — this seat, namespace-volatile by rule).
- **Cross-lane AUD-X10, named only:** `/tmp/w10-audx10-ev` 7 / 197,196 + the three loose
  `w10-audx10-*.{sh,stop}` (1,742 B) — its verdict declares the record scratch-only; it belongs
  to the cross-lane seat, not this repo.
- **Still on `/tmp` but already archived (not debt):** `w9-tabi-b91` (the r9 group's source) and
  the r2–r7 tabi groups archived by receipts r5/r8 — for these, the archive, not `/tmp`, is the
  authority (r11 plan :623-624).
- **Out of this lane's province (shape only):** the other provinces' scratch — of 39 `/tmp/w10-*`
  entries, 5 tabi groups (archived here) + 4 cross-audit entries, 30 others; of 43 `/tmp/w11-*`
  entries, 10 tabi (5 archived dirs here + 5 loose files), 33 others (mado / tsukuroi / tameshi /
  pack / cross-audit X11 namespaces). Named only; their own repos' archive seats own them.

### 8.6 Unknowns

- **U1 — later `/tmp` writes.** The tranche is frozen as of 21:40:00Z; the drift re-check found
  only the two live poll logs (§8.3 B), but a wave write after 21:44:11Z is unmeasured by design.
  Re-run check B (source list vs manifest) to detect it.
- **U2 — the r8/r9 remnants' fate.** Whether the round's archive/closeout seats absorb them or the
  operator keeps them named is not this seat's call (§8.5); the bytes are alive now.
- **U3 — the r8 note's one unrecoverable revision.** `stateful-fixture-evidence.md` §11 names
  `e22a967ed69e9f6e…` (the r8 runner) as unrestorable; it is not in git, the swept scratch, or the
  archive. Named here with its ownership; the bytes remain unrecoverable as far as this sweep measured.
- **U4 — session material elsewhere.** Carried from r5 U2: whether any non-swept path holds
  session material is unmeasured by design; none existed in the groups copied here (0 `*profile*`).
- **U5 — duplicate-hash structure of the whole tree.** Enumerated for the new set only (§8.1);
  the wider tree's duplicate classes stay as r5 U5 left them.
- **U6 — the D scan's token set is a mid-edit snapshot of `SKILL.md`** (B11-4 live): tokens added
  by a later SKILL revision are not covered by §8.3 D.

### 8.7 Owed (outside this lane's write scope)

- `LOG.md` append (AGENTS.md:3), the corpus/README coverage row + header counts, the SKILL
  §Harness-archive census update (36 → 45 groups; the phase table), the SCORECARD move-log and
  the commit — the integrating round's, per the r2–r10 pattern.
- The r8/r9 census decision (archive or hand off, §8.5) — the round's archive/move/closeout seats.
- The pin re-binds superseded by this append's sha move and by F3 (§8.4).

A post-write A+B + census re-run follows as §8.8 (appended after this write, per the r10 §7
pattern).

### 8.8 Post-write re-check

- **[2026-10-14T21:46:09Z, post-write]** Full A+B re-run executed after this append landed:
  **52/52 manifest lines OK, 0 FAILED, exit 0 in all 9 groups; 0 diff lines on every group**;
  census re-run → **45 groups / 45 manifests / 1,782 files (1,737 evidence) / `du -sb`
  10,720,052 B** — unchanged from §8.1, so the tree did not move after those counts were
  taken. Drift re-check (source now vs the 21:40:00Z snapshot): only the two live poll seats —
  `w11-scr-b11-poll` diff 2 (`poll.log`), `w11-ver-b11-poll` diff 4 (`landings.log`,
  `poll.log`) — as in §8.3 B. The pass-window `find -newermt` scans over `corpus/evidence`
  show every file written in the window inside the 9 new groups, and none outside them after
  this append. This append's own hashes: the pre-append receipt revision (§1–§7, the r10
  revision) 203 `wc -l` / 15,197 B / `c6f4445ebd03…` — published, stands; the §8.1–§8.7
  revision this block extends 409 `wc -l` / 30,817 B / `609c2022350f…`; any later append
  moves the sha by construction — re-derive with `sha256sum corpus/knowledge/archive-receipt-r10.md`.