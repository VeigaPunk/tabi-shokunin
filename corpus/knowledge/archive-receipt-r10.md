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