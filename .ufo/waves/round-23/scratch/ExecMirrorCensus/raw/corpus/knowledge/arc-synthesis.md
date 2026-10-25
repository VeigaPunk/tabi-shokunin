<!-- corpus entry — tabi-shokunin round 10 (2026-10-14), lane B10-1 (assignment B10-1: the 10-round synthesis — tabi's arc: the evidence ladder as built (4 rungs with the measured boundaries), the approval discipline, the archive as infrastructure, the loopback-only constraint as the honest perimeter — re-derivable from cited notes; that file path is the assignment's output). Method: read-only synthesis over the lane's ten-round records (corpus/knowledge/*.md, LOG.md, SCORECARD.md, corpus/lessons/, reports/, plans/, git) plus re-derivations at the write stamp (counts by command, source pins, manifest spot re-hashes, the L0 read-back). Zero browser launches, zero fixture runs, zero network acts. Every row carries its source anchor (path:line); every count carries its command and its read time; rows that assemble beyond one source are marked [synthesis]. Write scope: this file only — the LOG append (AGENTS.md:3), the corpus/README row, the SKILL distillation and the commit are the integrating round's (r2–r9 pattern). Anti-claim: no external site; no browser; session material shape-only (never content-read); substrates read-only. Scratch: /tmp/w10-b101-arc/ (verify.log, pins.txt; volatile per namespace rule). -->

# Arc synthesis — tabi's ten rounds: the ladder, the approval, the archive, the perimeter

source: this note is a synthesis of the lane's own in-repo records only (corpus/knowledge/*.md, LOG.md, SCORECARD.md, corpus/lessons/round-{1..8}.md, reports/r4-aud-tab1.md … r9-aud-b9.md, plans/*, git history); no external source, no substrate content beyond the pins other notes already carry.
verified-at: 2026-10-14T20:54Z (write stamp; §0's counts and §6's pins were re-derived 20:52–20:54Z; the evidence tree moved inside the write window — §0 and §3.3 record it rather than smoothing it).
recheck: re-derive §0's counts with the commands shown, re-run §6's manifest spot (`sha256sum -c MANIFEST.txt`), and re-read the §1/§2/§4 anchors against the cited notes; this note is written to be re-readable by a cold reader without its author.

## 0. As-of state (observed at the write stamp; command per row)

| Quantity | Value (read) | Command / source |
|---|---|---|
| HEAD | `ad735dd` — "probation round 9 (training r8): see LOG", 2026-10-14T17:47:30-03 | `git log --format='%h %cI' -1` |
| worktree | 1 untracked entry at the count: `?? corpus/evidence/w9-tabi-b91/` (a sibling round-10 archive seat in flight — §3.3); this note's own file is the second untracked entry, by construction | `git status --short` |
| knowledge | 20 notes / 6,438 lines | `ls corpus/knowledge/*.md \| wc -l`; `wc -l corpus/knowledge/*.md \| tail -1` |
| lessons | 8 files (`round-1..8.md`; round-9/10 owed at write) | `ls -A corpus/lessons \| wc -l` |
| reports | 6 (r4–r9) | `ls reports/*.md \| wc -l` |
| evidence tree | 36 groups / 1,721 files / 10,318,947 B / 36 `MANIFEST.txt` at 20:53Z — **was** 35 / 1,451 / 9,222,920 B at 20:53:05Z, minutes before B10-2's `w9-tabi-b91` landed (§3.3) | `ls -d corpus/evidence/*/ \| wc -l`; `find corpus/evidence -type f \| wc -l`; `du -sb corpus/evidence` |
| L0 read-back | sha256 `02c53ec60acf…` / 25 lines / 21,539 B / mtime `2026-10-14 14:05:52.482908587 -0300` / exactly 1 `tabi` line (`:25`) / budget `2−1=1` | `sha256sum`, `wc -l`, `wc -c`, `stat -c %y`, `grep -c tabi` on `.ufo/l0-questions.md` |
| packet | `94dc63f5fb9e…` / 121 lines / 13,103 B / **0** `/tmp` references | `sha256sum`, `wc -l`, `wc -c`, `grep -c '/tmp'` on `corpus/handoffs/operator-approval-request.md` |
| date | `date -u +%F` → 2026-10-14 (clause (c) state — §4.4) | `date -u +%F` |
| silence span | filing mtime 2026-10-14T17:05:52Z → L0 read 20:53:05Z = **3 h 47 m 13 s** [arithmetic] | values from the two rows above |

## 1. The evidence ladder as built — four rungs, each closed by a measured boundary

The ladder is the arc's instrument: it orders how strong the evidence under a claim is, and its own first rule forbids presenting a lower rung as support for a higher one (`SKILL.md:361-367`). Rounds 2–3 distilled rungs 1–3 (`SCORECARD.md:69-70`); round 4 added rung 4 (`plans/round-4.plan.md:3`; `network-evidence-rung.md:35-42`); rounds 5–9 extended rung 4's measured corners without adding a fifth rung (§1.1). Each rung's boundary below is the *measured* place where it stops being authoritative.

| Rung | Supports | The measured anchor | The measured boundary (what it cannot do) |
|---|---|---|---|
| 1 — **static bytes** | "the page renders X" when the content is frozen | det-before PNG byte-identical within a run (350 ms apart) and across two independent server+browser processes; a third fresh server+browser pair reproduced both fixed-state shas (`SKILL.md:371`; `live-dynamic-capture.md:66-67,107-110`; `cdp-evidence-patterns.md:151-157`; `executor-test-sufficiency.md` §2) | static content only; byte identity is **environment-scoped** — this host, browser build, font stack; do not generalize to real pages or other builds (`network-evidence-rung.md:435-436`; `SKILL.md:401`) |
| 2 — **dynamic capture** | action-effect claims — "clicking X changed Y"; JS-produced states | det-after PNG byte-identical across runs when the resulting state is fixed, even after JS-driven DOM mutation + real input; DOM-shape delta 55→65 nodes (+5/click) fully accounted (`SKILL.md:372`; `live-dynamic-capture.md:68,96-101,113-114`) | identity holds only while the resulting state is fixed; the volatile class must be captured too — and the differing pair kept (`live-dynamic-capture.md:124-127`; `SKILL.md:376-382`) |
| 3 — **multi-signal** | claims where a single channel alone could be wrong or stale | two or more independent signals agree (visual read-back + DOM shape + protocol metadata), across two full independent runs; shape *struct* survives liveness while shape *text* does not (`SKILL.md:373`; `live-dynamic-capture.md:60-73,91-94`) | signals can disagree — disagreement is itself evidence (usually staleness, not contradiction); no single channel is the claim (`cdp-evidence-patterns.md:89`) |
| 4 — **network (wire capture)** | "the page fetched X / got Y / got nothing", plus the DOM/screenshot disagreements the wire arbitrates: abandoned requests, failed subresources, redirects, cache-served repeats with no wire line, wire-304 vs client-200, async races | D1–D8 disagreement cases; three cold runs byte-identical (`compare.tsv` 150 rows — 127 IDENTICAL / 23 accounted DIFFER); closure `finEnc − last-hop header text − body = 0` on all 7 wire resources; timing classes: loopback 0.6–3.3 ms · server-think 401.3–401.7 ms · cache hit ~4 ms · client abort 60.2–60.3 ms (`SKILL.md:374`; `network-evidence-rung.md` §3–§6, §9) | **cannot prove rendering** (a 200 body says nothing about the pixels); not a HAR (typed netlog refusal, `SKILL.md:405-407`); the wire path of a repeated resource is per-run measured, never a stable count (`multi-step-journey.md` §5 + errata; `reports/r4-aud-tab1.md` §2); statuses are surface-split and never substituted; counts compared, not set membership; timing only at ≥1 ms class granularity (38 recorded sub-ms pairs are noise) |

**§1.1 — boundary extensions inside rung 4 (rounds 5–9; no fifth rung was built):**

- **async (r5):** the pre-settle state becomes a stable class by holding at the protocol layer (`Fetch.enable`, Request stage); pair separability is certified by the network slice, not by the predicate's success (`async-step-evidence.md` §3, §5, §7; `layer-routing-synthesis.md:82` RT12).
- **cache + trip classes (r6):** revalidation staging measured (a `Cache-Control: no-cache` response did not force revalidation; the in-session prepass did); four trip instruments — robots-disallow stops **before issuing**, 429 with `Retry-After` shape, 403, and an interstitial that trips at status 200 on a body-shape marker; a trip is recorded, proved, never retried through; a loopback instrument is never a C6 datum (`external-class-fixture-v2.md` §2, §5, §8; `layer-routing-synthesis.md:85-86` RT15–RT16).
- **stateful (r8):** session/cookie-shaped state, multi-visit, non-idempotent steps; an independent verifier re-run appended (7/7 runs exact; 3 of 14 cells) (`LOG.md:135`; `corpus/lessons/round-8.md:44,66,224`; `stateful-fixture-evidence.md` §12 E1).
- **state-changing (r9):** the replay half of the state-changing matrix — per-token-state replay probes, 409/replay cells, redirect-code replay behaviour, the cross-client replay contract — landed **for the loopback class** (`state-changing-matrix-r9.md:1,12-21`; `LOG.md:136`).

The ladder at the arc's end: 4 rungs + 5 measured extensions, all loopback, all re-derivable from archived bytes — subject to §3.4's open debts.

## 2. The approval discipline — from a daemon table to a filed packet

### 2.1 The arc by round

| Round | What it fixed | Anchor |
|---|---|---|
| 1 | no daemon-lifecycle rules; start-authority reading unresolved | `SCORECARD.md:69` (before-cell) |
| 2 | daemon `start` executed as doc-authorized self-service; pid 3934817 left listening as a recorded state change, operator stop owed (D2) | `SCORECARD.md:69` (after-cell); `webbridge-daemon-disposition.md`; `references/operations.md:11-13` |
| 3 | taxonomy finalized: three dispositions, "two tenses, one gate", C1–C6 + A1–A12 each with rights·rate·consequence, a gate and a falsifier; the never-set reproduced as C4/A9/A10 | `interaction-approval-table.md:19-20,26-37,53-62,131-144`; `SCORECARD.md:71` |
| 4 | daemon found OOM-dead (session-cycle event); the D2 stop debt is moot; the stale pid pointer recorded | `hygiene-sweep-r4.md:23-28` |
| 5 | the four-clause claim stated; the operator packet filed at `corpus/handoffs/` + exactly one L0 line | `plans/round-5.plan.md:3-8`; `operator-approval-request.md:9`; `LOG.md:132` |
| 6 | revival assessed, **no revival act** — operator-owned; a third reading of the A1 tension refused | `webbridge-revival-assessment.md` §4 :169-172; `LOG.md:133` |
| 7–10 | no answer → the loopback branch held; the revival decision carried-unasked; the filing never repeated or paraphrased | `plans/round-10.plan.md:130-156,157-171`; `plans/round-9-record-draft.md:22-49` |

### 2.2 The discipline, as rules (each cited)

1. **Read-back before act.** The classification of the operator status enters the round record — line, sha, before/after counts, mtime — *before* any external request or daemon act (`plans/round-10.plan.md:119-120`; `plans/round-9-record-draft.md:22-49`).
2. **One measurement surface.** Operator status has exactly one surface: `.ufo/l0-questions.md` content; operator presence is never itself a grant channel (r10 plan :132-134; `MISSION.md:84-88` cited there).
3. **A scope or nothing.** A bare approval is ANSWERED-SCOPE-LESS — recorded as not-a-grant; nothing executes until a scope is named, and inference never supplies one (r10 plan :140).
4. **Default-deny on everything unnamed.** A granted branch executes exactly the named set (r10 plan :139, :282-283).
5. **The never-set is not movable** — consequential external acts, session-material content-reads, out-of-province work — and for never-set acts the approval does **not** delegate execution to the lane: the operator acts, the lane at most observes/reports (`PROVINCE.md:15-19`; `interaction-approval-table.md:28,46-48`; `operator-approval-request.md:66`).
6. **One pass per name; executed-then-verify.** A second run needs a new name; a recorded prior execution converts a branch to verify-only (`plans/round-10.plan.md:239-244,279-284`).
7. **No self-assigned budget.** C6's deciding axis is a measured absence, so the lane may never assign itself a rate budget; the default budget in the packet applies only if R1 is granted without R3 (`interaction-approval-table.md:62,128-129`; `operator-approval-request.md:41`).
8. **Silence is neither denial nor consent.** Carried-unasked is a recorded state; the ask is not re-sent; a rejection is kept as calibration (r10 plan :144, :271-272; `operator-approval-request.md:106`).
9. **One line, budgeted.** The line budget is `2 − (tabi-line count)`, floor 0; the round-10 permitted class is the bridge/A4 decision the round-5 filing itself deferred — never a re-send or paraphrase of R1/R2/R3 (r10 plan :157-171; `operator-approval-request.md:63-65`).

### 2.3 The operator arc, measured

- **The packet:** `94dc63f5fb9e…` / 121 lines / 13,103 B / 0 `/tmp` references, `filed: 2026-10-14T17:05Z (round 5)`, seat B5-4 (`operator-approval-request.md:9`; commands in §0).
- **The asks:** R1 — C3 read-only, harness-only, one named public page, three-rung capture; budget default 1 page · 1 cold run · ≤20 HTTP requests · ≤60 s · ≥1 s between navigations; first request `/robots.txt`; stop-and-report on the first 429/403/interstitial/ToS gate. R2 — same terms for an operator-named property. R3 — a number (C6 budget). Not asked: C4 (never), C5 (deliberately un-asked), A5 (belongs to an interaction grant) (`operator-approval-request.md:38-66`).
- **The L0:** exactly one `tabi` line (`:25`, the round-5 filing, ending "Filing seat B5-4"); ask-count 1; sha `02c53ec60acf…` byte-identical at every recorded read since the filing (r6/r7/r8/r9 + this read); silence span at this note's read: **3 h 47 m 13 s** (§0).
- **Carried:** the packet's own cold-read falsifier status is still `[unknown]` (`operator-approval-request.md:100`), and its note-pin block is 9/9 stale (`packet-readiness-r7.md` §2) — both named, neither repaired here.

## 3. The archive as infrastructure

### 3.1 The rule

> "**Archive or it didn't happen.** Hashes over `/tmp` artifacts are only verifiable while `/tmp` lives. … a claim graduating past staging must copy bytes into durable corpus storage." — `cdp-evidence-patterns.md:92` (verbatim)

Every note that stages bytes restates the consequence in its own header: "every hash below is provisional until the archive keeps pace" (`network-evidence-rung.md:1`; `stateful-fixture-evidence.md:1`; `state-changing-matrix-r9.md:1`).

### 3.2 The mechanism (the receipt pattern)

- Read-only copy of each pinned `/tmp` group into `corpus/evidence/<group>/`, one `MANIFEST.txt` per group (comment header + `sha256␠␠path` lines); check: `cd corpus/evidence/<group> && sha256sum -c MANIFEST.txt` (`archive-receipt-r5.md:7-9`).
- **Four checks, re-runnable:** A manifest self-check (r5: 1,010/1,010 lines OK, re-run identical); B copy fidelity — source hash list vs manifest, 0 diff lines per group; C in-group / owning-note pin equality (r5: 109 pin lines, 107 OK, 2 FAILED — kept as F1); D corpus-wide pin scan with every unmatched token classified (r5: 587 archived hashes vs 179 note tokens — 141 match / 38 classified / 0 unmatched naming an archived file; r8: 835 vs 318 — 200 match / 118 classified / 0) (`archive-receipt-r5.md` §3; `archive-receipt-r8.md` §3).
- **The exclusion rule:** every path component matching `*profile*` — widened from `*/profile/*` for cause (`profile-run1/2` hold `Cookies`, `Login Data` — names listed, never content-read; `PROVINCE.md:16-19` is the authority). r5 excluded 5,668 files / 313,772,976 B; the r8 tranche 0 (rule carried, not exercised); the w9 group 2,396 files / 58,072,105 B (`archive-receipt-r5.md:13-22`; `archive-receipt-r8.md:15-17`; `corpus/evidence/w9-tabi-b91/MANIFEST.txt` header).
- **Findings are kept, not repaired in place.** F1 (a stale in-group pin file) stayed in its group and was closed by erratum *outside* it — adding a file inside a published group would change its file list (`archive-receipt-r8.md:174-176,192-218`).

### 3.3 The tranches (read times stamped)

| Tranche | When | Groups after | Files after | Bytes after | Source |
|---|---|---|---|---|---|
| r5 tranche (rounds 1–4 groups) | verification 17:03–17:07Z; post-write re-check → 1,035 files incl. 25 manifests | 25 | 1,010 evidence files | 6,780,293 | `archive-receipt-r5.md:7-9,176-180` |
| r7 tranche (receipt added in `b377007` at 191 lines, appended in `ad735dd`) | copy 19:01:44Z; check A+B re-run 19:06Z | 25 → 35 | 1,403 → 1,451 (all files incl. manifests; 1,416 evidence at the check) | 9,007,188 → 9,222,920 | `archive-receipt-r8.md:7-14,181-186`; `git log --oneline -- corpus/knowledge/archive-receipt-r8.md` → `ad735dd`, `b377007` |
| round-10 wave (in flight at this write) — lane B10-2's `w9-tabi-b91` | manifest 20:52:46Z | 35 → **36** | 1,451 → **1,721** | 9,222,920 → **10,318,947** | `corpus/evidence/w9-tabi-b91/MANIFEST.txt` header; untracked at write (`git status --short`) |

### 3.4 Open archive debts (the infrastructure is honest about its lag)

- `/tmp/w8-tabi-b81/` — the r8 stateful fixture + 32 run dirs, still `/tmp`-only: measured present at this write (`ls /tmp/w8-tabi-b81` → 12 entries; read-only). The archive seat must copy it with a `MANIFEST.txt`; every hash in the r8 note is provisional until then (`stateful-fixture-evidence.md:730-739`).
- **One revision cannot be restored:** the earlier runner `e22a967ed69e9f6e…` survives only as a sha in `driver.log`s — its bytes were rewritten in place (`stateful-fixture-evidence.md:737-739`).
- r9's scratch (`w9-tabi-b91`) was `/tmp`-only until this wave's archive seat landed it (§3.3).
- The archive is a **timestamped snapshot** — the manifests say what was copied, never what `/tmp` holds now (`archive-receipt-r8.md:31-32`).

### 3.5 The count-with-its-read-time rule

The census moved 25 → 28 → 35 inside one round; the LOG's "archive completed (35 groups, 41 new files)" and its "SKILL census 28 groups" are both measured and both true at different instants — an un-stamped count is the bug (`corpus/lessons/round-7.md:95-96`). This note stamps every count with its read time (§0, §3.3) — including the tree moving under it.

## 4. The loopback-only constraint as the honest perimeter

### 4.1 The three fences

1. **The never-set** — not movable by any grant (`PROVINCE.md:15-19`; `interaction-approval-table.md:46-48`; `operator-approval-request.md:66`).
2. **The operator gate** — C2/C3/C6 are operator-asleep-blocked (durable form: approval-required); C4 never lane-executed; C5 approval-gated; the unblock is a recorded go-ahead naming site + scope (+ a budget for C6) (`interaction-approval-table.md:57-62`).
3. **The technical loop** — lane-authored fixtures on 127.0.0.1 in the lane's own cold profile; closure proven per run: kill by PID from the process table, port probe, `curl` exit 7; "an unverified kill is an unknown, not a cleanup" (`cdp-evidence-patterns.md:94-105`; `layer-routing-synthesis.md:88` RT18).

### 4.2 What the perimeter honestly is — and is not

- **Loopback ≠ no egress, measured.** The browser logged `google_apis/gcm` attempts despite `--disable-background-networking`: 3× in each of r2's 2 runs; 3 lines in 1 of 7 r4 runs; 0 in r6's 10/10. "No external contact" claims route to the browser log + URL/peer census and are **log/URL-level and as-of-capture — no packet witness exists** (`live-dynamic-capture.md` §6 :190-200; `layer-routing-synthesis.md:87` RT17; `external-class-fixture-v2.md` U6 :553).
- **Zero real-site datum.** The R1 note `real-site-observation-<host>.md` does not exist — `ls corpus/knowledge | grep -c real-site` → 0 (this note's sweep, 20:54Z).
- **Rate/ToS U1 is an absence** — C6's deciding evidence, to be recorded when first measured, never asserted (`interaction-approval-table.md:191-193`).
- **The extension↔daemon handshake has never been verified** — `extension_connected:false` throughout; the bridge path never exercised; the daemon itself is down with a stale pointer (`webbridge-daemon-disposition.md` §5; `layer-routing-synthesis.md:150-154`).
- **Real-site classes untested by rule:** third-party JS, POST forms, redirects with bodies, CSRF-checked submits (`network-evidence-rung.md:435-436`; `layer-routing-synthesis.md:148-149`). r8/r9's state-changing classes are loopback-closed and real-site-open (`stateful-fixture-evidence.md` §11; `state-changing-matrix-r9.md:12-21`).

### 4.3 Why this is the honest perimeter [synthesis]

Row by row, the ten rounds' claims are exactly co-extensive with what loopback plus lane-authored fixtures can falsify; the outer boundary is *stated* (never-set + the C-classes) rather than silently crossed; the one external ask is filed and unanswered, and nothing was routed around it. The cost is named in the same breath — zero real-site datum, the U1 absence, no POST/CSRF/redirect classes; the value is that every corpus claim is falsifiable from archived bytes without external dependence, subject only to §3.4's debts.

### 4.4 The gate's final state (as of this write)

- **Classification:** SILENT — no diff vs the round-5 filing (sha + line count + mtime byte-identical at this read, §0) → the loopback branch; **revival-decision disposition: carried-unasked** (`plans/round-9-record-draft.md:47-56`).
- **Line budget:** `2 − 1 = 1`; the only permitted class is the bridge/A4 decision the round-5 filing itself deferred (`operator-approval-request.md:63-65`); not filed by this lane (write scope — the gate seat owns the material-change test).
- **Clause (c) of the round-5 four-clause claim is IN FORCE at this write:** `date -u +%F` → 2026-10-14 and the newest commit in-repo is 2026-10-14T17:47:30-03 (`git log --format=%cI | sort | tail -1`), so no witness dated ≥ 2026-10-15 exists. The pass unblocks with a dated in-repo re-derivation block + a commit ≥ 2026-10-15 (the UTC date flips at 2026-10-15T00:00Z = 21:00 -03). Until then the four-clause claim stands **3/4** with clause (c) named as time-blocked — never claimed closed on a same-day witness (`plans/round-10.plan.md:417-437`; `plans/round-5.plan.md:3-8`).

## 5. Unknowns (do not convert to claims without a new probe)

1. What the round-10 record lands after this note's write stamp — sibling lanes are in flight (the w9 archive group is untracked at write).
2. Whether the operator answers at all, and in which shape (site + scope; budget) — nothing executes absent a read-back.
3. Whether clause (c) closes inside the training window (§4.4).
4. Whether the `/tmp/w8-tabi-b81` bytes survive to their archive seat.
5. Whether a second revival name ever arrives (one pass per name; a second pass needs a new name).
6. The mechanism unknowns carried from the notes — the perf `transferSize` vs `finEnc` offset, the within-session cache-path selector, the abort race: `layer-routing-synthesis.md` §5 items 1–8, not re-opened here.

## 6. Provenance — source pins re-derived at write time (20:52–20:54Z)

`sha256sum | cut -c1-12` + `wc -l`, read from disk (scratch `/tmp/w10-b101-arc/pins.txt`, volatile):

| Source | sha256-12 | `wc -l` |
|---|---|---|
| `SKILL.md` | `c07d29c3e8d1` | 1189 |
| `LOG.md` | `bb58f8afc29c` | 136 |
| `SCORECARD.md` | `2a7b02743265` | 88 |
| `knowledge/cdp-evidence-patterns.md` | `337ff64579e8` | 234 |
| `knowledge/live-dynamic-capture.md` | `01266495b761` | 245 |
| `knowledge/multi-step-journey.md` | `e0367890f1cf` | 349 |
| `knowledge/network-evidence-rung.md` | `d1564f38dc14` | 609 |
| `knowledge/async-step-evidence.md` | `05dcda5e60b9` | 282 |
| `knowledge/external-class-fixture-v2.md` | `4aa604f1788b` | 569 |
| `knowledge/interaction-approval-table.md` | `b5e29a9a2adf` | 246 |
| `knowledge/layer-routing-synthesis.md` | `7725ee421716` | 254 |
| `knowledge/archive-receipt-r5.md` | `b41c2f6fb5a4` | 180 |
| `knowledge/archive-receipt-r8.md` | `de45b805e5a4` | 218 |
| `knowledge/stateful-fixture-evidence.md` | `f04e2e473cf9` | 855 |
| `knowledge/state-changing-matrix-r9.md` | `ec540be07ed5` | 388 |
| `reports/r4-aud-tab1.md` | `5f44b0f94483` | 167 |
| `reports/r5-aud-b5.md` | `d09f1712cbcf` | 170 |
| `reports/r6-aud-b6.md` | `9428ddec52b9` | 178 |
| `reports/r7-aud-b7.md` | `ea4b16a4a844` | 260 |
| `reports/r8-aud-b8.md` | `a191832be152` | 181 |
| `reports/r9-aud-b9.md` | `df34bf6c63e1` | 174 |
| `corpus/QUALITY.md` | `1923c94f4978` | 8 |
| `corpus/README.md` | `e156bb99af2c` | 59 |

**Spot-checks this lane ran on this note (mechanical, re-runnable):**

1. **Counts re-derived** — every §0 row by the command shown; the evidence tree's movement inside the write window is recorded (§0, §3.3), not smoothed.
2. **Manifest spot re-hash** — four named groups fully re-checked: `tabi-r3-1-journey` 63/63 OK, `w5-tabi-b53` 9/9 OK, `w6-tabi-b61` 139/139 OK, `w7-aud-b7-scratch` 7/7 OK; plus all 36 groups' FAILED count summed → **0** (20:53Z). (`for g in corpus/evidence/*/; do (cd "$g" && sha256sum -c MANIFEST.txt | grep -c FAILED); done`.)
3. **Anchor re-read** — the four rung rows re-read at `SKILL.md:364,371-374`; `cdp-evidence-patterns.md:92`; `network-evidence-rung.md:35-42`; `interaction-approval-table.md:191-193`; the L0 line read whole; the packet's `filed:` stamp, its `/tmp`-free count and its answer-discipline block re-read.

## 7. Errata (append-only — never edit above blocks)

*(none yet; corrections append below)*