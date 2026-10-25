<!-- corpus entry — tabi-shokunin round 8 (2026-10-14), lane B8-2 (assignment B8-2: the carried-debt closure — (a) the F1 stale-pin erratum for the archived group `tabi-b1-r3b-journey`, landed without changing that group's file list; (b) the round-6 L1 wire-class/cache-revalidation matrix debt, checked against the round-6/7 record drafts and the landed record. This file is the assignment's named output). Method: read-only re-derivation at HEAD `b377007` — manifest and in-group pin self-checks inside the archived group (hashing only; no byte written, moved or deleted there), `diff` of the two stale files against the round-3 source group, and a repo-wide presence scan for the L1 matrix (grep over the notes + the round-7 commit's path list + the LOG entry). Snapshot boundary: every value measured 2026-10-14T19:09–19:13Z unless stamped. Write scope: this file only — the `LOG.md` append (AGENTS.md:3), the corpus/README coverage row, the SKILL distillation and the commit are the integrating round's (r2–r8 pattern; `archive-receipt-r8.md` §6 :171-173 states the same for the peer lane). Anti-claim: no external site; this lane ran no browser and no server (loopback discipline not exercised — nothing to trip); substrates untouched; session material never read and never needed; the archived groups were read-only. Scratch: `/tmp/w8-b82-manifest.log` (volatile). -->

# Carried-debt closure — round 8 (B8-2)

Baseline for every value below: HEAD `b377007877be2d104cc9e3da56cf81a24ab0d` — *"probation round 7
(training r6): see LOG"*, committed 2026-10-14T16:06:31-03 (19:06:31Z); `git status --short` → 0 entries
at 19:09:53Z (so every cited file is the committed revision; a later write by any lane moves the tree and
the re-derivation commands below are the check).

## 0. What this closes (claim)

Two carried items; each status is a measurement, not a reading of the drafts:

| # | Item | Status at this stamp | Close surface |
|---|---|---|---|
| a | **F1** — `tabi-b1-r3b-journey/methodology-sha.txt` stale against its own bytes | **CLOSED by erratum** (§1; the erratum is one line; the group's file list is unchanged) | `archive-receipt-r5.md` §6 :170-172 (owed since round 5); `archive-receipt-r8.md` §6 :174-176 (left to an owning lane) |
| b | **Round-6 L1 matrix** — the wire-class/cache-revalidation decision for repeated same-URL subresources, as a controlled single-factor matrix note | **STILL OPEN** (§2; unlanded at round-6 close and at round-7 close) | execution is the round's L0 seat's (`plans/round-8.plan.md` §L0 :219-231); this lane records the status only |

## 1. Item (a) — ER-F1, the one-line F1 erratum

### 1.1 The erratum (one line; copy-ready — nothing else in this note needs copying)

**ER-F1** — In `corpus/evidence/tabi-b1-r3b-journey/`, `methodology-sha.txt` (sha256 `04997cf58c00e61c…`) pins `driver.sh` `9509c07f49f92113487d906b8c3137486d11a931559bbec850124e064af74b13` and `compare.mjs` `ecce1c73dc56475034c185e1fac1b5b7d8dcaaae71f19ea6153a54c9f2cd3215`, but the archived bytes hash `68ceef09e4bfe032e789a16a8ba95afe65f6c9772c9f98fe3f92a1b3d58681c3` (`driver.sh`) and `cc89210e9fd216e34ad7aa052a8748f277801888acdfacd4e41e2d71451adc7e` (`compare.mjs`) — the replay edit's `ROOT` path, `HTTP_PORT` 19421→19481 and `CDP_PORT` 19422→19482 in `driver.sh`, and the `root` constant in `compare.mjs`; `MANIFEST.txt` (83/83 `sha256sum -c OK` at 19:11Z) and the owning note's pins (`multi-step-journey.md:26-27`, binding the `tabi-r3-1-journey` source group) are the authority, no owning-note pin is affected, and no byte inside the group was changed by this erratum.

### 1.2 Landing site (why the erratum is here and not in the receipt or the group)

- The group is untouchable: adding a file inside `tabi-b1-r3b-journey/` would change a published group's
  file list after its manifest was published — the archiver's own constraint, stated twice
  (`archive-receipt-r5.md` §6 :170-172 "without touching archived bytes"; `archive-receipt-r8.md` §6
  :174-176 "deliberately left to the owning lane, because adding a file inside `tabi-b1-r3b-journey/`
  would change a published group's file list").
- The receipt is a peer lane's committed file (`archive-receipt-r8.md` `0587605db9138631`, 191 lines,
  committed in `b377007`), and this lane's write scope is this file only — so the erratum lands here as
  the "errata note" the constraint permits. If the integrating round prefers the receipt's §7 block
  (:179-191), ER-F1 above is copy-ready.

### 1.3 Evidence for the erratum (re-runnable)

1. **Group manifest intact** — `cd corpus/evidence/tabi-b1-r3b-journey && sha256sum -c MANIFEST.txt`:
   **83/83 OK, 0 FAILED, exit 0** (19:11Z; log `/tmp/w8-b82-manifest.log`).
2. **The stale pair, re-derived** — inside the same group, `sha256sum -c methodology-sha.txt`:
   **7 OK, 2 FAILED, exit 1** — only `driver.sh` and `compare.mjs` fail; the 6 `site/` files and
   `journey.mjs` (`b52074a33876…`) verify.
3. **The delta, measured here** — `diff corpus/evidence/tabi-r3-1-journey/<f> corpus/evidence/tabi-b1-r3b-journey/<f>`:
   `driver.sh` `9509c07f49f9…` → `68ceef09e4bf…`, 3 changed lines (6 `<`/`>` lines): `:6` `ROOT`, `:8`
   `HTTP_PORT` 19421→19481, `:9` `CDP_PORT` 19422→19482; `compare.mjs` `ecce1c73dc56…` → `cc89210e9fd2…`,
   1 changed line: `:3` `const root`.
4. **No owning-note pin is affected** — the owning note's pins (`multi-step-journey.md:26-27`) bind the
   `tabi-r3-1-journey` source group, which verifies (`archive-receipt-r8.md` SC2 :107 re-derived
   `driver.sh` `9509c07f49f9` / `compare.mjs` `ecce1c73dc56` as MATCH there). The archive table row
   (`SKILL.md:338`) lists `tabi-b1-r3b-journey` as a **replay copy** with the source group's pins, and the
   F1 caveat that makes that reading safe is already in force (`SKILL.md:342`: "F1 stands … the manifest
   and the owning note's pins are the authority, the in-group pin file a convenience").

### 1.4 Finding — the "4-line" shorthand does not re-derive [observation]

The recorded descriptor of the `driver.sh` delta is "the 4-line `ROOT`/port edit" (`archive-receipt-r5.md`
F1 :110-111: "`ROOT` + `HTTP_PORT` + `CDP_PORT` (4 lines)"; `archive-receipt-r8.md` F1 :119-120;
`SKILL.md:342` "the 4-line run-driver"). The measurement above is **3 changed lines / 6 diff lines**.
Nothing is harmonized (append-only); the erratum line states the delta's content, not the count. Which
pair or which counting convention produced "4" is unmeasured (U3).

## 2. Item (b) — the round-6 L1 matrix: still open

**Verdict at `b377007`: the round-6 L1 matrix is unlanded.** The predicate it must satisfy is on record
(`plans/round-6.plan.md` §L1 :124-134; `plans/round-6-record-draft.md` L1a :110): a note in
`corpus/knowledge/` carrying a measured rule + a filled falsifier + a per-cell record of which of
{wire-304, no-wire re-serve, client-status} obtained and which layer decided, from a controlled
single-factor matrix (cache headers / mtime age / repeat count / per-run fresh profile; N ≥ 2 cold runs
per cell). The evidence chain:

| Where | What it says | Status there |
|---|---|---|
| `plans/round-6-record-draft.md` §3 L1a :110, L1b :111 | matrix seat in flight; no note; `/tmp/w6-tabi-b61/` fixture only | IN FLIGHT @ 17:42Z |
| `plans/round-6-record-draft.md` E3 :358-360 (18:02Z) | "**L1 matrix: still not landed**" + the check `ls corpus/knowledge/ \| grep -i 'matrix\|cache\|reval'` → none | NOT LANDED at round-6 close |
| `plans/round-7-record-draft.md` §2 b-L :93; §3 L0 :118 | carried as the round-7 L0 obligation; no matrix note among the then-15 notes | CARRIED / NOT LANDED |
| `plans/round-7.plan.md` §Branch L L0 :225-230 | makes the round-6 matrix round 7's carried-debt check, to execute first | obligation recorded |
| **Landed round-7 record** — `LOG.md:134`; commit `b377007` | deliverables: layer-routing synthesis, the harness archive (35 groups / 41 files / manifest equality), SKILL census; **no matrix note**; the commit adds 3 knowledge notes (`archive-receipt-r8.md`, `layer-routing-synthesis.md`, `packet-readiness-r7.md`) — none is the matrix | still unlanded at round-7 close |
| `corpus/knowledge/layer-routing-synthesis.md` §4 :136-140 | "**The L1 mechanism matrix** … is still unlanded and carried into round 7"; if it lands, its cells append there (append-only errata) | open, with a landing site named |
| `corpus/knowledge/packet-readiness-r7.md:64` | "the round-6 L1 matrix … did not land" | open |
| `SKILL.md:889` | "the L1 mechanism matrix (wire-class / cache-revalidation, still unlanded at this revision)" | open at the round-7 SKILL revision |
| `corpus/knowledge/external-class-fixture-v2.md:564-566` | the matrix "is a separate seat's; this note supplies the fixture and the stop predicate only" | scope boundary as landed |

**Re-derivation performed here (19:11-19:12Z):** `grep -ril "L1 mechanism matrix\|L1 matrix"
corpus/knowledge/` → exactly 3 notes (`external-class-fixture-v2.md`, `layer-routing-synthesis.md`,
`packet-readiness-r7.md`), each naming the matrix as another seat's / unlanded — **no note carries cells**;
`git show --name-status b377007` → 425 paths, the three new knowledge notes above, no matrix note.

**What does exist** (so the debt is precise, not vague): the bytes the matrix would consume are archived —
`corpus/evidence/w6-tabi-b61/` (140 files: `chain-run1/2/3`, `compare-chain.tsv` 13 rows, the
`probe-{robots,429,429b,429h,403,403h,captcha}/` sets, `server.py`, `v2-driver.sh`, `v2-journey.mjs`;
manifest committed), plus `w6-ver-b6/` and `w6-aud-b6-scratch/`. The matrix *mechanism* also has landed
partial anchors (`multi-step-journey.md` §5; `async-step-evidence.md` §5 :192-217; `network-evidence-rung.md`
§6 D7 :304-318; `layer-routing-synthesis.md` RT4 :74 and RT10 :80). The missing deliverable is the
controlled single-factor matrix note itself — the rule + filled falsifier + per-cell layer-decision record.

**Adjacent item, named not absorbed** (same debt line, round-8 §L0 item 2 :224-225): round-7's own Branch L
L1 — the state-changing step (POST body, redirect-after-POST 303/307, CSRF-shaped token, non-idempotent
replay contract; `plans/round-7.plan.md` :231-251) — also did not land (`plans/round-7-record-draft.md`
§3 L1a-L1e :119-123 all NOT LANDED; `LOG.md:134` lists no such note; `layer-routing-synthesis.md`
§4 :143-146 names the class as not covered). Both items ride the round-8 L0 seat per
`plans/round-8.plan.md` :219-231.

**Label drift, recorded append-only [observation]:** `packet-readiness-r7.md:64` names the round-6 L1 matrix
as "(the state-changing step)". On the round-6 record the matrix's subject is the wire-class /
cache-revalidation decision; the state-changing step is round-7's L1. The record is not edited here; the
distinction is kept in this note's §0 table.

## 3. Spot-checks (this lane, non-author of everything checked)

- **SC-1 — F1 group integrity:** `sha256sum -c MANIFEST.txt` in `corpus/evidence/tabi-b1-r3b-journey/`
  → 83/83 OK, 0 FAILED, exit 0 (19:11Z).
- **SC-2 — F1 surface, both directions:** the in-group pin file fails exactly on `driver.sh`/`compare.mjs`
  (7 OK / 2 FAILED, exit 1) and the `diff` against the round-3 source group reproduces the replay edit
  (3 changed lines / 1 changed line) — stale pin file, intact bytes.
- **SC-3 — matrix absence, three surfaces:** the knowledge-directory grep (3 mentions, all "unlanded"),
  the round-7 commit's 425-path name-status list (no matrix note), and `LOG.md:134` (round-7 record lists
  no matrix) — agree.
- **SC-4 — citation integrity:** the shas of the files this note cites were re-derived at 19:12:26Z:
  `archive-receipt-r8.md` `0587605db9138631` (191), `archive-receipt-r5.md` `b41c2f6fb5a43483` (180),
  `layer-routing-synthesis.md` `7725ee4217168710` (254), `packet-readiness-r7.md` `7185642c2e41c92b` (122),
  `plans/round-8.plan.md` `3ad58f64c82681c0` (388), `plans/round-6-record-draft.md` `7ca4ab3d90f6c133` (370),
  `plans/round-7-record-draft.md` `8aac0ae242161a4f` (349), `SKILL.md` `8874306672b65d8d` (945),
  `LOG.md` `f3b7bc3864ee3197` (134), `multi-step-journey.md` `e0367890f1cfc910` (349),
  `methodology-sha.txt` `04997cf58c00e61c` (9).

## 4. Unknowns

- **U1 — round-8 L0 execution.** Whether the round-8 L0 seat lands the matrix this round is unmeasured
  here (in flight at this stamp); §2's verdict is as-of 2026-10-14T19:12Z. Re-derive with §2's commands.
- **U2 — F1's mechanism** (the pin file written from the upstream copies and never re-stamped) remains
  inference, unchanged from `archive-receipt-r5.md` U3 :154-155 / `archive-receipt-r8.md` U3 :159-160; the
  group's author lane is the only witness.
- **U3 — the "4-line" descriptor** (§1.4): no pair or convention reproducing "4" has been identified; the
  discrepancy is recorded, never harmonized.
- **U4 — erratum mirroring.** Whether the integrating round copies ER-F1 into `archive-receipt-r8.md` §7 or
  references it from the SKILL §Harness-archive block is that round's call; this note is the durable
  pointer of record either way.
- **U5 — landing site if the matrix lands.** `layer-routing-synthesis.md` §4 :139 invites its cells as
  append-only errata there; whether the executing seat takes that site or opens a note of its own is
  unmeasured.

## 5. Errata (append-only)

*(none at write — corrections append below with date + evidence.)*
E1 — 2026-10-14T19:16Z, by B8-2 (revision stamp; the "none at write" line above is superseded here, not rewritten)

- **Two revisions of this note are on record.** First write (19:13Z): 144 `wc -l` / 13,519 B / first16 `e3b24db30479d0d2`. A post-write citation audit then changed **four line refs only** — no claim, no status, no sha value amended: `archive-receipt-r8.md` §6 owed bullet → `:171-173`; `plans/round-6.plan.md` §L1 → `:124-134`; `plans/round-8.plan.md` §L0 item 2 → `:224-225`; `layer-routing-synthesis.md` §4 → `:139` and `:143-146`. Pre-append fingerprint of the corrected revision: 144 `wc -l` / 13,515 B / first16 `8c6b0a38d7005e6d` — any append, this one included, moves the hash by construction; re-derive with `sha256sum`.
- **Revision-binding note for the round record.** `plans/round-8-record-draft.md:364` (SCR-B8, read 19:14:55Z) cites the pre-edit revision (`e3b24db30479d0d2` / 13,519 B); both values stand as recorded (append-only). The claim table there (§0 of this note) is the same in both revisions.
- All 35 line refs cited in this note were re-verified at 19:15Z (each `sed -n '<n>p' <file>` matched its quoted content); the group manifest re-checked 83/83 OK the same minute.