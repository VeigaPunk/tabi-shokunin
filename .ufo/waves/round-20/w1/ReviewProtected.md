# ReviewProtected — tabi round-20 wave 1

Seat: TabiR20.ReviewProtected (leaf reviewer, no dispatch). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Baseline: c49929430d996b016dde2e3a3a5be380f3433fdb = HEAD (detached; `refs/heads/master` identical; baseline is an ancestor).
Scope: frozen USER-gate protected paths; files that may safely append; round-20 lesson write-once rule; primary paths SKILL.md, corpus/README.md, corpus/QUALITY.md, corpus/evidence/round-20/sources/html_form_element.cc.

Method: read-only. `git --no-optional-locks` (log, show, ls-tree, cat-file, diff, status), sha256sum, cmp, stat, base64, od, one GET to chromium.googlesource.com (HTTP 200, 91040 B; temp file removed). No gate, selftest, build, or formatter was run; verification is reserved to main. No production edits. Tool installs/updates: none.

Tree state: `git diff --name-only HEAD` → 0 lines; `git diff --cached --name-only` → 0 lines. Untracked: `.ufo/waves/round-20/**` plus `corpus/evidence/round-20/sources/html_form_element.cc`, the only untracked path outside the wave directory.

## Verdict

1. **Frozen — never change (gate-enforced):** the 56 census rows (`corpus/evidence/pstack-20261015/baseline-census.tsv`, sha256 b9c8dc35…), `corpus/lessons/round-1..10.md`, `corpus/lessons/round-12..19.md` (write-once), `scripts/check-freshness.mjs`, `scripts/check-round-contract.mjs` (accepted sha via USER pstackDrift), `SHONEN.md` (canonical shape only), `PROVINCE.md` (census-frozen despite APPEND_ONLY). `scripts/check-user-round-contract.mjs` is not gate-enforced on itself; it is SKILL-pinned (SKILL.md:1938) and must not change in round 20.
2. **May append (EOF only; prefix must hold):** `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md`, `LOG.md`, `SCORECARD.md`.
3. **New round lesson `corpus/lessons/round-20.md`:** create in exactly one commit with final content. No later commit may touch it.
4. **Live problem (static reading; F1):** round-18.md and round-19.md already break write-once under the USER gate. Round 20 must not add to it.

## Findings

### F1 (high; static, gate not run) — USER gate already refuses round-18/19 lesson edits
- Mechanism: `lessonDrift` (check-user-round-contract.mjs:333-342). For a lesson absent at baseline with status `A`, drift = any `MDRT` commit in `92d700d6..HEAD` touching it. `pstackDrift` routes `^corpus/lessons/round-N.md$` there (:347). `PSTACK_PATHS` includes `corpus/lessons` (:79). `checkHistory` fails with `Pstack bytes changed: <first>` (:416-418). `check()` calls `checkHistory` (:690) before `round_count` (:692).
- Git (read-only):
  - round-18.md created 530f40a; MDRT after pin: c0aff23, 01531da.
  - round-19.md created 08e8173; MDRT after pin: d5cf4d7, bf466e3, 3a93382.
  - round-12..17.md: 0 MDRT each (write-once kept).
- Predicted first refusal: `history_rewritten: Pstack bytes changed: corpus/lessons/round-18.md`. [INFERENCE from code order; not executed.]
- Record conflict: SKILL.md:1678 names the inherited USER failure as `round_count 6/10`. round-19.md:157 (NH1) records the frozen lessonDrift refusal as "irrecoverable historical M event; no rewrite/rebase/frozen-gate relaxation".
- Action for main: run `node scripts/check-user-round-contract.mjs` once at delivered HEAD and once at c4992943. Compare finding token and first path. Exit equality is not a no-harm proof (round-19.md:157).

### F2 (medium) — PROVINCE.md is APPEND_ONLY but census-frozen
- APPEND_ONLY lists it in both gates (check-round-contract.mjs:25; check-user-round-contract.mjs:76).
- Round gate census loop (check-round-contract.mjs:322-336): every census row's blob at rev must equal its recorded blob. Row `corpus/evidence/pstack-20261015/baseline-census.tsv:24` = `c2222b16… PROVINCE.md`; HEAD blob is c2222b16 (1020 B). Any append → `Census blob drifted`.
- The census is itself pinned: check-round-contract.mjs:30 `CENSUS_SHA256`; file sha256 matches (b9c8dc35…). It cannot be edited to accommodate.
- Corroboration: corpus/README.md:354-355 ("census-frozen row"); round-17.md:102 (planned PROVINCE.md append refused by the census loop in sandbox).
- The USER gate does not census-check PROVINCE.md (its protectedPath lacks it), but the round gate runs in production and refuses.
- Verdict: do not append PROVINCE.md.

### F3 (medium) — round-20 lesson write-once is enforced only by USER lessonDrift
- Round gate's protected loop (check-round-contract.mjs:308-314) iterates files present at HARD_BASELINE 7f506af. round-20.md is absent there, and production pins that baseline (:299-300), so the round gate never sees it.
- Only USER `lessonDrift` (F1 mechanism) and QUALITY 13 protect it.
- Regex is anchored: `^corpus\/lessons\/round-\d+\.md$` (check-round-contract.mjs:169; check-user-round-contract.mjs:60). Not matched: training-round-11.md, kaika-fleet-round-1.md, `round-N-verifier-spotcheck.md`, `user-20261015-rNN.md`.
- Derived constraints [INFERENCE from the code and QUALITY 22/26/29]:
  - (a) one creating commit;
  - (b) no later commit touches round-20.md, including LOG/SCORECARD/README entries;
  - (c) corrections go to an unprotected new file (e.g., `corpus/lessons/round-20-verifier-spotcheck.md`) or to an append block in README/SKILL;
  - (d) the lesson cannot cite its own commit; receipts bind to a revision preceding that commit.

### F4 (medium) — S096 source: bytes verified; transform and duplication under-stated
- design.json:17-19 pins URL `…html_form_element.cc?format=TEXT` and sha256 `8c8d6796…`.
- Fetched bytes (GET, 91040 B) begin `LyoKICogQ29weXJpZ2h0` = base64 of "/*\n * Copyright". base64-decoded sha256 = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to the design pin, the lane file, and the four clone copies (ExecCounter, ExecFixtures, ExecFrozen, ScribeLifecycle).
- The design does not name the transform. SOURCES.md:110 (S096, tier A, code) says "decoded sha256"; it does not name base64. Recommend naming "base64-decoded (Gitiles ?format=TEXT)" in the registry and manifest.
- Duplication: SOURCES.md:92 S078 has the same URL and the same decoded sha256; S096 says "supersedes S078". Same bytes, not a new source identity (QUALITY 38; round-19.md:158 NH2 precedent). The gate's `duplicate_url` exemption applies via `supersedes` (check-sources.mjs:296-297). `.ufo/waves/round-20/census-before.json:11` already lists the URL as duplicate across scopes.
- Lane-root copy: `corpus/evidence/round-20/sources/html_form_element.cc` is C++ (Chromium license header), 1740 lines (spans in design go to 830). mtime 09:49:12Z precedes `before.json` capturedAt 09:50:49Z, and `before.json:5` already lists it as `??`. It was placed before dispatch, not by a seat clone.
- Requirement: it must be `git add`-ed in the integration commit before any note or lesson cites it (QUALITY 28), with bytes unchanged.

### F5 (info) — SHONEN.md: one census divergence, canonical
- HEAD blob 9dcb2687 ≠ census :25 `5e055b8c`. The other 55 census rows match HEAD. The exception is check-user-round-contract.mjs:398 and check-round-contract.mjs:312, :328-333.
- Recomputed normalized seed sha256 = `b45c2ac3…bdab67` = SHONEN_SEED_SHA256 (user :50; round :36).
- Evidence pointers resolve at HEAD (100644 blobs): SKILL.md; corpus/knowledge/multi-step-journey.md; corpus/knowledge/executor-test-sufficiency.md; PROVINCE.md; corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt.
- Do not touch in round 20. Promotion stays `[~]`; `[x]` has no verifier allowlist (check-round-contract.mjs:225).

### F6 (info) — gate script identities (frozen code)
- `scripts/check-round-contract.mjs` sha256 `1579a794…91828` = ROUND_SCRIPT_CURRENT (check-user-round-contract.mjs:35). Any change → USER `pstackDrift` (:345).
- `scripts/check-user-round-contract.mjs` sha256 `568c0421…5f273` matches SKILL.md:1938.
- `scripts/check-freshness.mjs` sha256 `93d19637…`; blob `987c3267` = census :57 (SAME).

### F7 (info) — naming and counts
- No `round-11.md`; `training-round-11.md` names round 11 (LOG.md:497). Not gate-frozen (anchored regex). QUALITY 10 satisfied by naming [INFERENCE].
- QUALITY.md last criterion is 49 (:224-228). Next = 50.
- corpus/README.md: `diff <(ls corpus/knowledge|sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md|sed 's|knowledge/||'|sort -u)` → empty. All 37 notes are named. The new round-20 note needs its own row in the same commit (QUALITY 11), with counts re-derived (QUALITY 34/43).

## Exact protected sets

**USER gate `protectedPath`** (check-user-round-contract.mjs:226-235): `LEGACY_LESSON` (`^corpus/lessons/round-N.md$`); `corpus/evidence/fleet-round-1-freshness/`; `.ufo/rounds/fleet-round-1-interactive-20261015/`; `.ufo/reports/fleet-round-1-attempt-20261015/`; `.ufo/plans/fleet-round-1-interactive-20261015` (prefix); `.ufo/continuation/fleet-round-1-interactive-20261015` (prefix); `scripts/check-freshness.mjs`; `SHONEN.md`. Checked at HEAD vs 7f506af: all 56 census rows equal except SHONEN (canonical).

**USER gate `pstackDrift`** (:344-355, from PSTACK_PIN `92d700d6` :13): `corpus/evidence/pstack-20261015*` (only baseline-census.tsv exists); `corpus/lessons/pstack-20261015-rNN.md` (r01–r10); `reports/pstack-20261015-rNN.md` (r01–r10); `scripts/pstack-seat.mjs`; `scripts/pstack-aggregate.mjs`; `scripts/check-freshness.mjs`; `SHONEN.md`; `scripts/check-round-contract.mjs` (accepted sha); LEGACY_LESSON files (lessonDrift). `user-20261015-rNN.md` is NOT matched here.

**USER gate APPEND_ONLY prefix** (:401-406, from 7f506af): LOG.md, SCORECARD.md, SKILL.md, PROVINCE.md, corpus/QUALITY.md, corpus/README.md — all PREFIX_OK (cmp -n against 7f506af and c4992943).

**Round gate** (check-round-contract.mjs): `protectedPath` :168-177 (same classes plus SHONEN.md, without pstack drift); APPEND_ONLY :25; census path :27, sha :30, census loop :322-336 (includes PROVINCE.md and SHONEN.md with policy).

## Append-safety table

| Path (HEAD) | Class | May append? | Evidence |
|---|---|---|---|
| SKILL.md (2197 lines, 194427 B) | APPEND_ONLY both gates | Yes, EOF only | prefix of 7f506af (125194 B) and c4992943; ends LF |
| corpus/README.md (434 lines, 44318 B) | APPEND_ONLY | Yes, EOF; new-note row same commit | prefix of 7f506af (12085 B); 37/37 notes named |
| corpus/QUALITY.md (228 lines, 19855 B) | APPEND_ONLY | Yes, EOF; start at criterion 50 | prefix of 7f506af (329 B); last = 49 |
| LOG.md (1192 lines, 96276 B) | APPEND_ONLY | Yes, EOF; round-20 entry (QUALITY 7) | prefix of 7f506af (27002 B); ends LF |
| SCORECARD.md (922 lines, 75655 B) | APPEND_ONLY | Yes, EOF; re-derived counts (QUALITY 43) | prefix of 7f506af (27469 B); ends LF |
| PROVINCE.md (21 lines, 1020 B) | APPEND_ONLY + census :24 | NO | F2 |
| SHONEN.md (976 B) | protectedPath + census :25 | NO | F5 |
| corpus/SOURCES.md | not in APPEND_ONLY or protectedPath | Gate-unprotected; new rows only via check-sources.mjs | S096 supersedes S078 (:92, :110) |
| corpus/lessons/round-1..10.md | census :47-56 + protectedPath | NO | SAME |
| corpus/lessons/round-12..19.md | protectedPath regex (not at 7f506af) + USER lessonDrift | NO | F1 |
| corpus/lessons/round-20.md (new) | regex once created | Create once; never touch after | F3 |
| training-round-11.md, kaika-fleet-round-1.md, *-verifier-spotcheck.md, user-20261015-rNN.md | not matched by any gate | Not gate-frozen; QUALITY 4 append-only by convention | anchored regex |
| corpus/evidence/pstack-20261015/baseline-census.tsv | census (b9c8dc35) | NO | census loop |
| corpus/evidence/fleet-round-1-freshness/*; .ufo/rounds/fleet-round-1-interactive-20261015/*; .ufo/reports/fleet-round-1-attempt-20261015/*; .ufo/plans/…; .ufo/continuation/… | census + protectedPath | NO | SAME |
| scripts/check-freshness.mjs; scripts/check-round-contract.mjs; scripts/check-user-round-contract.mjs | protected / pinned | NO (round 20) | F6 |
| corpus/evidence/round-20/** (incl. S096 source) | no protected set | New files only; commit in integration | F4 |
| corpus/knowledge/webmcp-completion-lifecycle-round-20.md (new) | no protected set | New file; README row | F7 |
| .ufo/waves/round-20/** | wave directory | Seat outputs only | — |

EOF-only appends are the only edit class that keeps existing `path:line` anchors valid (e.g., SHONEN box 1's `SKILL.md:697`).

## Constraints for the round-20 integrator

1. Append only at EOF of SKILL.md, corpus/README.md, corpus/QUALITY.md (criterion 50+), LOG.md, SCORECARD.md. Do not edit any existing byte.
2. Do not touch PROVINCE.md, SHONEN.md, the census, scripts/check-freshness.mjs, scripts/check-round-contract.mjs, scripts/check-user-round-contract.mjs, corpus/lessons/round-1..19.md, corpus/evidence/pstack-20261015/**, fleet paths, or reports/pstack-*.md.
3. Create corpus/lessons/round-20.md once, in the single integration commit, final content, never amended after. Corrections go elsewhere.
4. `git add` the round-20 evidence, including the S096 source byte-identical to sha `8c8d6796…`, in that same commit. Record "base64-decoded" for the S096 transform.
5. Main runs gates once after integration: ROUND, USER, freshness (invocation per SKILL.md:1919-1921), SOURCES. Record exit and finding tokens. Compare USER against the c4992943 baseline (F1).

## Verification gaps

- No gate, selftest, or build was executed. F1's first-refusal prediction is static (code order plus git history).
- Quotes and line spans in html_form_element.cc were not verified (scout scope). Only byte identity and line count (1740 ≥ 830) were checked.
- SOURCES.md rows S078/S096 were checked for URL and sha only, not for quotes or anchors.
- `census-before.json` was read only at line 11 (S096 duplicate note).
- Git state of the clone directories was not inspected.
- Remote tag 154.0.8037.97 assumed immutable; the fetched decoded sha matched the pin.

## Tooling

No installs or updates. Tools used (pre-existing): git, sha256sum, cmp, stat, base64, od, curl (one GET).
