<!-- corpus entry — tabi-shokunin round 11 (the final round; training r10), lane B11-1 — THE CLOSEOUT. Assignment B11-1 (verbatim scope): "the closeout — the arc (the evidence ladder as built, the archive as infrastructure, the loopback-only perimeter as the honest boundary), the standing asks (the l0 packet awaiting the operator; the daemon revival), the named debts." Method: read-only synthesis over the lane's eleven rounds of in-repo records (LOG.md, SCORECARD.md, corpus/README.md, corpus/knowledge/*.md, corpus/lessons/*.md, corpus/handoffs/*, reports/*, plans/*, git) plus re-derivations at the write stamp — counts by command, source pins by sha256, archive manifest spot re-hashes, the L0 read-back, the daemon/port read, the fleet counters. Zero browser launches, zero fixture runs, zero network acts; no external site. Write scope: this file only — the LOG append (AGENTS.md:3), the README/SCORECARD refresh, the lessons and the commit are this round's record seats'. Anti-claim: substrates read-only; session material shape-only (`identity.json` / daemon logs never content-read — sizes/modes only); the packet stays filed and is not re-sent; the loopback discipline was not exercised (nothing to trip). Scratch: /tmp/w11-b11-1-{measure,final,fleet,last}.txt (volatile). -->

# Round-11 closeout — tabi-shokunin (the final round)

source: this note synthesizes the lane's own in-repo records only (paths cited per row); nothing external; no substrate content beyond the pins other notes carry.
verified-at: 2026-10-14, measurements 21:31–21:35Z (write stamp). Every count carries its command and its read time; values that move are re-derived, never inherited.
recheck: re-run §5's commands (manifest spot `sha256sum -c MANIFEST.txt` × 3 groups; the L0 read; the daemon read; the census commands); re-read §1–§3's anchors against the cited notes; the note is written for a cold reader without its author.

## 0. What this closes, and the state it closes from

### 0.1 The chain end (measured)

[observation] The fleet ledger `MANIFEST.json` (fleet root, 2,237 `wc -l`) carries nine `lane: "tabi"` train entries at rounds 2–10, each written as `training rN (lane round N+1)` — read at 21:35Z by a read-only JSON scan (e.g. round 10: `"training r9 (lane r10): arc synthesis; r9 archive; rung-1 CONFIRMED by archived-byte re-hash."`). The fleet closeout commits count training rounds: `494d32a` "training wave-10 closeout: round 10 — the syntheses land with cell-for-cell verifier confirmations; **all lanes 9/10, one round remains**" (2026-10-14T18:28:23-03 = 21:28:23Z), preceded by `b5a9723` "… all lanes 8/10" (`git log --oneline`).

[inference, strong] This wave is lane round 11 = training r10 = the **last** round; the round-11 design plan reached the same mapping from the same counters (`plans/round-11.plan.md:11-30`). Nothing in this note presumes a round 12; if the fleet continues, the note stands as-of its stamps.

### 0.2 What this file is — and is not

The round-11 closeout under assignment B11-1: the arc, the standing asks, and the terminal debt ledger, each row re-derivable from the records it cites. It is not the round's full round-by-round index (the record seats own the LOG/SCORECARD/README/lessons refresh), and it re-scores no axes — where the refreshed `SCORECARD.md` axes table lands, its rows and this note's named recorded values must agree cell-for-cell; a disagreement is a finding, not a silent pick (`plans/round-11.plan.md:505-509`).

### 0.3 As-of state at the write stamp (command per row)

| Quantity | Value (read 21:31–21:35Z) | Command |
|---|---|---|
| HEAD | `d24b98d` "probation round 10 (training r9): see LOG", 2026-10-14T18:28:23-03 (21:28:23Z) | `git log --format='%h %cI %s' -1` |
| worktree | clean — `git status --short` → 0 entries | `git status --short` |
| knowledge | 22 notes / 6,824 lines | `ls corpus/knowledge/*.md \| wc -l`; `wc -l corpus/knowledge/*.md \| tail -1` |
| lessons | 9 (`round-1..9.md`) | `ls -A corpus/lessons \| wc -l` |
| reports | 7 (r4–r10) | `ls reports/*.md \| wc -l` |
| evidence | 36 groups / 36 `MANIFEST.txt` / 1,721 files / 10,318,947 B (`du -sb`); evidence files excl. manifests 1,685 / 10,135,246 B | `ls -d corpus/evidence/*/ \| wc -l`; `find corpus/evidence -name MANIFEST.txt \| wc -l`; `find corpus/evidence -type f \| wc -l`; `du -sb corpus/evidence` |
| `SKILL.md` | sha256 first-12 `453ed25a07f6` / 1,320 lines | `sha256sum SKILL.md`; `wc -l SKILL.md` |
| L0 | `02c53ec60acf…` / 25 lines / 21,539 B / mtime `2026-10-14 14:05:52.482908587 -03` / **1** `tabi` line (`:25`) | `sha256sum`; `wc -lc`; `stat -c %y`; `grep -c tabi` on `.ufo/l0-questions.md` |
| packet | `94dc63f5fb9e…` / 121 lines / 13,103 B / **0** `/tmp` refs (grep rc 1) | `sha256sum`; `wc -l`; `grep -c '/tmp'` on `corpus/handoffs/operator-approval-request.md` |
| daemon | **down**: `ss -ltnp \| grep 10086` → no listener; `pgrep -af webbridge` → none (the only matches were the measuring shell itself); pointers stale (`daemon.pid` 8 B, `daemon.addr` 16 B, mtime Oct 14 10:46); binary present, first16 `71067480bd99c2ba…`; `logs/daemon.log` 3,591 B, `daemon.log.prev` 19,532 B — sizes only, contents never read | `ss -ltnp`; `pgrep`; `ls -la ~/.kimi-webbridge/`; `sha256sum ~/.kimi-webbridge/bin/kimi-webbridge` |
| browser census | `pgrep -c chromium` → 0; `pgrep -c brave` → 0 (process census only) | `pgrep -c` |
| Brave sweep | `ls -A ~/.config/BraveSoftware/Brave-Browser/` → `NativeMessagingHosts` only — agree; per the record lineage this is the 11th consecutive reading (r10's record asserted the 10th; `plans/round-11.plan.md:101-104`) | `ls -A` |
| date / clause (c) | `date -u +%F` → 2026-10-14; no witness commit with instant ≥ 2026-10-15T00:00Z (newest commit instant 21:28:23Z) | `date -u`; `git log --format='%h %cI %ct'` |
| silence span | filing mtime 17:05:52Z → gate read 21:32:48Z = **4 h 26 m 56 s** (16,016 s) [arithmetic] | the two rows above |

## 1. The arc

### 1.1 The evidence ladder as built — four rungs, each closed by a measured boundary

The ladder orders how strong the evidence under a page-claim is; its first rule forbids presenting a lower rung as support for a higher one (`SKILL.md:361-367`). Rungs 1–3 were distilled in rounds 2–3; round 4 added rung 4; rounds 5–9 extended rung 4's measured corners without adding a fifth rung (`arc-synthesis.md:24-42`; `reports/r10-aud-b10.md` C1 re-derived "four rungs … no rung-5 construction anywhere" and PASSed it).

| Rung | Supports | The measured anchor | The measured boundary (what it cannot do) |
|---|---|---|---|
| 1 — static bytes | "the page renders X" when the content is frozen | det-before PNG byte-identical within a run and across two independent server+browser processes; a third fresh pair reproduced both fixed-state shas (`SKILL.md:371`; `live-dynamic-capture.md:66-67,107-110`; `cdp-evidence-patterns.md:151-157`; `executor-test-sufficiency.md` §2) | static content only; byte identity is **environment-scoped** — this host, browser build, font stack (`network-evidence-rung.md:435-436`; `SKILL.md:401`) |
| 2 — dynamic capture | action-effect claims — "clicking X changed Y"; JS-produced states | det-after PNG byte-identical across runs when the resulting state is fixed, even after JS mutation + real input; DOM-shape delta 55→65 nodes (+5/click) fully accounted (`SKILL.md:372`; `live-dynamic-capture.md:68,96-101,113-114`) | identity holds only while the resulting state is fixed; the volatile class must be captured too, and the differing pair kept (`live-dynamic-capture.md:124-127`; `SKILL.md:376-382`) |
| 3 — multi-signal | claims where a single channel alone could be wrong or stale | two or more independent signals agree (visual read-back + DOM shape + protocol metadata) across two full independent runs; shape *struct* survives liveness while shape *text* does not (`SKILL.md:373`; `live-dynamic-capture.md:60-73,91-94`) | signals can disagree — disagreement is itself evidence (usually staleness); no single channel is the claim (`cdp-evidence-patterns.md:89`) |
| 4 — network (wire capture) | "the page fetched X / got Y / got nothing"; the DOM/screenshot disagreements the wire arbitrates (abandoned requests, failed subresources, redirects, cache-served repeats, wire-304 vs client-200, async races) | D1–D8 disagreement cases; three cold runs byte-identical (150 compare rows — 127 IDENTICAL / 23 accounted DIFFER); closure `finEnc − last-hop header text − body = 0` on all 7 wire resources; timing classes at ≥1 ms granularity (`SKILL.md:374`; `network-evidence-rung.md` §3–§6, §9) | **cannot prove rendering**; not a HAR; the wire path of a repeated resource is per-run measured, never a stable count; statuses are surface-split and never substituted (`multi-step-journey.md` §5 + errata; `reports/r4-aud-tab1.md` §2) |

**Boundary extensions inside rung 4 (rounds 5–9; no fifth rung was built):** async — the pre-settle state becomes a stable class by holding at the protocol layer (`async-step-evidence.md` §3, §5, §7; `layer-routing-synthesis.md:82` RT12); cache + trip classes — revalidation staging measured, four trip instruments (robots-disallow before issuing, 429 with `Retry-After` shape, 403, a 200 whose body trips), a trip is recorded/proved/never retried through (`external-class-fixture-v2.md` §2, §5, §8); stateful — session/cookie-shaped state, multi-visit, non-idempotent steps, with an independent verifier re-run (7/7 runs exact) (`stateful-fixture-evidence.md` §12 E1; `LOG.md:135`); state-changing — the replay half of the matrix for the loopback class (`state-changing-matrix-r9.md:1,12-21`; `LOG.md:136`). **Correction carried [from the r10 audit, F3]:** the synthesis's closing line reads "4 rungs + 5 measured extensions" while its §1.1 lists four bullets; the fifth exists only by splitting the r6 bullet (cache-staging + trip-instruments) — an under-specified aggregate, not a false statement (`reports/r10-aud-b10.md` §5 F3; the synthesis's own §7 erratum is owed — ledger §3).

### 1.2 The archive as infrastructure

**The rule** (quoted, location named): "**Archive or it didn't happen.** Hashes over `/tmp` artifacts are only verifiable while `/tmp` lives. … a claim graduating past staging must copy bytes into durable corpus storage." — `cdp-evidence-patterns.md:92` (verbatim; re-read by the r10 audit C3). Every note that stages bytes restates the consequence in its own header ("every hash below is provisional until the archive keeps pace" — `network-evidence-rung.md:1`, `stateful-fixture-evidence.md:1`, `state-changing-matrix-r9.md:1`).

**The mechanism (the receipt pattern).** Read-only copy of each pinned `/tmp` group into `corpus/evidence/<group>/`, one `MANIFEST.txt` per group (comment header + `sha256␠␠path` lines); check with `cd corpus/evidence/<group> && sha256sum -c MANIFEST.txt` (`archive-receipt-r5.md:7-9`). Four checks, re-runnable per tranche: A manifest self-check; B copy fidelity (source hash list vs manifest, 0 diff lines); C in-group / owning-note pin equality; D corpus-wide pin scan with every unmatched token classified (`archive-receipt-r5.md` §3; `archive-receipt-r8.md` §3; `archive-receipt-r10.md` §3). The **exclusion rule** — every path component matching `profile` — widened from `*/profile/*` for cause; session material is excluded by path and never read (`archive-receipt-r5.md:13-22`; r10 exercised it at scale: 2,396 files / 58,072,105 B excluded, counts shape-only). Findings are **kept, not repaired in place**: the F1 stale in-group pin stayed in its group and was closed by erratum *outside* it (`archive-receipt-r8.md:174-176`; `carried-debt-closure-r8.md` §1.2). The archive is a **timestamped snapshot** — the manifests say what was copied, never what `/tmp` holds now (`archive-receipt-r10.md` §1, U1). Counts are written with their read time: the census moved 25 → 28 → 35 → 36 inside single rounds, and an un-stamped count is the bug (`corpus/lessons/round-7.md:95-96`).

**The tranches (each re-derived; pre-count of the r7/r8 tranche corrected to 28 per `reports/r10-aud-b10.md` F1):**

| Tranche | Groups | Files | Bytes | Receipt |
|---|---|---|---|---|
| rounds 1–4 groups (r5) | 25 | 1,010 evidence (+25 manifests → 1,035) | 6,780,293 | `archive-receipt-r5.md:7-9,176-180` |
| round-6/7 tranche (r8) | 28 → 35 | 1,403 → 1,451 | 9,007,188 → 9,222,920 | `archive-receipt-r8.md:7-14` |
| round-9 tranche (r10) | 35 → 36 | 1,451 → 1,721 (1,685 evidence) | 9,222,920 → 10,318,947 | `archive-receipt-r10.md:11-13` |

**Open archive debts (named, not absorbed):** `/tmp/w8-tabi-b81/` — 5,105 files / 16 run dirs at this read (`find /tmp/w8-tabi-b81 -type f | wc -l`; `ls runs | wc -l`) — and `/tmp/w8-ver-b81/` — 980 files / 4 run dirs — are still unarchived; survival is an unknown, never an assumption (`archive-receipt-r10.md` U2; `SKILL.md:1175`). One revision **cannot be restored** — the earlier r8 runner `e22a967ed69e9f6e…` survives only as a sha in `driver.log`s (bytes rewritten in place); any receipt must name it (`stateful-fixture-evidence.md:737-739`; receipt-r10 check D classified it "named unrecoverable"). The r9 audit/scribe/verifier scratch is not named as archive debt by any owning note (`archive-receipt-r10.md` U2).

**Corrections carried against the r10 synthesis (append-only; its own §7 erratum is owed):** F1 — the synthesis's r7-tranche row reads "25 → 35" while its citation says "28 → 35"; correct pre-count **28** (`reports/r10-aud-b10.md` §5 F1). F2 — the synthesis §0 pairs "36 … at 20:53Z" with a "was 35 … at 20:53:05Z" pre-state stamp that its own verification log does not support; counts fine, stamp misattributed (§5 F2). F3 — above, §1.1.

### 1.3 The loopback-only perimeter as the honest boundary

**The three fences.** (1) *The never-set* — consequential external acts; session-material content-reads; out-of-province work — "not movable by any grant" (`PROVINCE.md:15-19`; `interaction-approval-table.md:46-48`). (2) *The operator gate* — C2/C3/C6 operator-asleep-blocked (durable form: approval-required); C4 never lane-executed; C5 approval-gated; the unblock is a recorded go-ahead naming site + scope (+ a budget for C6) (`interaction-approval-table.md:57-62`). (3) *The technical loop* — lane-authored fixtures on `127.0.0.1`, closure proven per run: kill by PID from the process table, port probe, `curl` exit 7; an unverified kill is an unknown, not a cleanup (`cdp-evidence-patterns.md:94-105`; `layer-routing-synthesis.md:88` RT18).

**What the perimeter honestly is — and is not.** Loopback ≠ no egress, *measured*: the browser logged `google_apis/gcm` attempts despite `--disable-background-networking` — 3× in each of r2's 2 runs; 3 lines in 1 of 7 r4 runs; 0 in r6's 10/10. "No external contact" claims are **log/URL-level and as-of-capture — no packet witness exists** (`live-dynamic-capture.md` §6 :190-200; `layer-routing-synthesis.md:87` RT17). Zero real-site datum — the R1 note `real-site-observation-<host>.md` does not exist: `ls corpus/knowledge/ | grep -c real-site` → **0** (this note, rc 1). Rate/ToS U1 is an *absence* — C6's deciding evidence, to be recorded when first measured, never asserted (`interaction-approval-table.md:191-193`). The extension↔daemon handshake has never been verified up — `extension_connected:false` throughout; the bridge path never exercised (`webbridge-daemon-disposition.md` §5; `webbridge-revival-assessment.md` §5). Real-site classes untested by rule: third-party JS, POST forms, redirects with bodies, CSRF-checked submits (`network-evidence-rung.md:435-436`; `layer-routing-synthesis.md:148-149`); r8/r9's state-changing classes are loopback-closed and real-site-open. Byte-identity is environment-scoped (§1.1).

**Why this is the honest perimeter** [synthesis]: row by row, the eleven rounds' claims are exactly co-extensive with what loopback plus lane-authored fixtures can falsify; the outer boundary is *stated* (the never-set plus the C-classes) rather than silently crossed; the one external ask is filed and unanswered, and nothing was routed around it. The cost is named in the same breath — zero real-site datum, the U1 absence, no POST/CSRF/redirect classes; the value is that every corpus claim is falsifiable from archived bytes without external dependence, subject to §3's open debts.

## 2. The standing asks

### 2.1 The L0 packet awaiting the operator

**The filing.** Round 5, seat B5-4: `corpus/handoffs/operator-approval-request.md` — `94dc63f5fb9e…` / 121 lines / 13,103 B / 0 `/tmp` references — filed `2026-10-14T17:05Z`, announced to the operator by exactly one line appended to `.ufo/l0-questions.md` (line `:25`, byte-identical at every recorded read since; this note's read, §0.3). The three asks (`operator-approval-request.md:38-66`): **R1** — C3 third-party read-only, harness-only: load **one** named public non-authenticated page in the lane's own cold-profile chromium; no click/fill/submit/login; capture at the existing rungs (screenshot + raw DOMSnapshot; CDP Network slice; URL/navigation history); **default budget** 1 page · 1 cold run · ≤20 HTTP requests · ≤60 s wall · ≥1 s between navigations; first request `/robots.txt`; stop-and-report on the first 429/403/CAPTCHA-or-interstitial/ToS gate, never retry through; output `corpus/knowledge/real-site-observation-<host>.md` (a refusal is a datum too). **R2** — the same read-only terms for a property the operator names. **R3** — a number: max requests + cadence, per-host or per-run (the lane may never self-assign a rate budget; if unanswered, R1's default applies). Not asked, edges stated: C4 never; C5/A5 deferred to a later packet; A4 closed moot at filing (`:60-66`). Answer by ID via in-place edit; the answer template is at `:56-58`.

**The only line this lane ever filed (verbatim; `grep -n tabi .ufo/l0-questions.md` → `:25`, read whole this session):**

```
tabi | round-5 | Operator approval requested — filed: tabi-shokunin/corpus/handoffs/operator-approval-request.md sha256 94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa (121 lines; harness-only, no session, no operator tab). Answer by ID: R1 (C3 third-party read-only: one named public non-authenticated URL, 1 cold run, ≤20 requests / ≤60 s, robots-first, observation only — no click/fill/submit/login), R2 (C2 operator's own site, same read-only terms; operator names the property), R3 (C6 budget: max requests + cadence, per-host or per-run; if unanswered, R1's hard-coded default applies). Not asked: C4 (never, province boundary), C5/A5 (separate later packet), A4 (daemon gone, moot). Loopback-only anti-claim holds until an answer naming site+scope(+budget) is read back from this file; a denial is also a decision and will be recorded. Filing seat B5-4.
```

**The read-back arc (as of this write).** Classification: **SILENT** — no diff vs the filing (sha, line count, byte count, mtime byte-identical; read back at every gate r6–r11, plus r6–r10's record drafts' §0 tables). Ask-count **1**; no re-ask; a verbatim repeat of R1/R2/R3 stays banned. Revival-decision disposition: **carried-unasked**. Line budget: `2 − 1 = 1`; the one permitted class is the bridge/A4 decision the filing itself deferred (`:63-65`) — **not filed** as of this read. Silence span at this gate read: **4 h 26 m 56 s** (§0.3). Terminal state of the ask, plainly: **unanswered** — silence is not a denial; the packet stays filed; a late answer remains executable (the grant is not wasted by the chain's end — `plans/round-11.plan.md:199-212`, :246-249).

**The two readiness gaps carried with it:** (a) the packet's own cold-read falsifier (§6, `:92-100`) has **never been executed** — its status line still reads `[unknown]`, and a sweep for a verdict artifact found only mentions (`packet-readiness-r7.md` §5); per the packet's own rule a follow-up question is a recorded gap requiring amendment *before* the L0 hash is treated as final. (b) its note-pin block is **9/9 stale** — re-bound values supplied in `packet-readiness-r7.md` §2; its `SKILL.md:37-66` pointer resolves to a superseded block. Both named, neither repaired here (ledger §3).

### 2.2 The daemon revival

**History, measured.** Round 2: the daemon `start` was executed as doc-authorized self-service; pid 3934817 left listening on `127.0.0.1:10086`; `stop`/`restart`/`uninstall` are agent-forbidden → the daemon was left running as a recorded state change with the operator stop owed (D2) (`webbridge-daemon-disposition.md`; `LOG.md:29-75`). Round 4: found **dead** inside the user session's OOM-teardown window (environment-level event; per-process victim attribution never measured); the D2 stop debt became moot; the stale pid pointer is the known post-shutdown pattern (`hygiene-sweep-r4.md:23-28`; `LOG.md:131`). Round 5: the packet closed A4 ("daemon return-to-baseline") as moot — daemon gone (`operator-approval-request.md:65`) — but the revival question stayed open. Round 6: the assessment — restart mechanics are local and doc-specified (binary present, port free, no config/unit needed; command `~/.kimi-webbridge/bin/kimi-webbridge start`, **never** `restart`; effects: pid/addr rewrite, log rotation; a revived daemon recreates the A4 stop debt; no OOM durability without a unit); the extension↔daemon handshake is **not doc-authorizable operator-free** (the docs route every extension-side failure to user actions; the handshake has never been observed up); **no revival act was performed** — revival is operator-owned as a scope decision (`webbridge-revival-assessment.md` §4, §5; `LOG.md:133`). Rounds 7–11: carried-unasked; the revival decision is the later packet the round-5 filing itself deferred (`operator-approval-request.md:63-65`), and the one permitted new L0 line class (`plans/round-11.plan.md:214-232`).

**Current state at this write (§0.3 rows):** daemon down — no listener, no process; pointers stale; binary present and pinned (`71067480bd99c2ba…`); browser census 0 (so the decisive experiment's browser half is absent anyway).

**The decisive experiment, if a revival is ever granted** (`webbridge-revival-assessment.md` §5; `plans/round-11.plan.md:326-334`): `start` while the browser runs; sample `/status` at t≈0 / +30 s / +5 min. Falsifier, verbatim: `extension_connected:false` at +5 min with the browser running ⇒ auto-attach is false for this configuration (re-check `version` at revive time). A positive discharges U1 and is the frontier's first handshake datum; a negative stops there (no workaround; the docs' user paths are the only named route).

**Disposition (as of this read):** operator-owned, **carried-unasked**; nothing will be revived without a recorded BRIDGE-NAMING read-back; a still-open A4 stop debt would become a named post-training operator obligation. No daemon/A4 obligation is current (no revived instance).

**The invariant no ask can move:** the never-set — consequential external acts, session-material content-reads, out-of-province work (`PROVINCE.md:15-19`). Held all eleven rounds: no consequential act; session material shape-only throughout (`identity.json` / daemon logs never content-read — this note read sizes and modes only); no real-site note exists (§1.3's sweep).

## 3. The named debts — the terminal ledger

Status vocabulary per the round plan (`plans/round-11.plan.md:510-513`): closed-by-landing · closed-by-erratum · open-now · retired-as-residue. Every row carries its closing surface; the open-now set is what a post-training reader must either execute or knowingly accept.

**Closed (recorded so the residue is precise):**

| # | Item | Status | Closing surface / citation |
|---|---|---|---|
| C1 | rounds 1–4 evidence groups archived (25 groups) | closed-by-landing | `archive-receipt-r5.md:7-9,176-180` |
| C2 | round-6/7 tranche archived (7 groups; tree 28 → 35) | closed-by-landing | `archive-receipt-r8.md:7-14`; spot re-verified this note (`w6-tabi-b61` 139/139) |
| C3 | round-9 tranche archived + receipt (tree 35 → 36) | closed-by-landing | `archive-receipt-r10.md:7-25`; spot re-verified this note (`w9-tabi-b91` 269/269) |
| C4 | ER-F1 — stale in-group pin in `tabi-b1-r3b-journey/methodology-sha.txt` | closed-by-erratum (erratum outside the group; file list unchanged) | `carried-debt-closure-r8.md` §1; group re-verified 83/83 this note |
| C5 | r9 note "untracked, moving" caveat discharged (committed revision = pinned value) | closed-by-landing | `plans/round-10-record-draft.md` F-3 |
| C6 | lessons rounds 1–9 landed (one `## Gate` each) | closed-by-landing | `ls -A corpus/lessons` → 9; round-9 committed in `d24b98d` |

**Open now (each with the surface that can close it):**

| # | Item | Status | Closing surface | Citation |
|---|---|---|---|---|
| O1 | **Clause (c) — the strictly-later-date freshness pass.** At this write: **IN FORCE** — `date -u +%F` → 2026-10-14; no witness commit with instant ≥ 2026-10-15T00:00Z (newest instant 21:28:23Z). The round-5 four-clause claim stands **3/4** until a dated block + commit ≥ the flip; never claimed closed on a same-day witness | open-now (time-blocked) | this round's clause-C move seat, or the post-training pass: re-derive the set, append the dated block to `SKILL.md`, commit, record the commit instant + match count (`plans/round-11.plan.md:453-459`) | `SKILL.md:829,:1058`; `plans/round-10.plan.md:417-437`; `plans/round-11.plan.md:422-465` |
| O2 | **Round-8 archive tranche** — `/tmp/w8-tabi-b81/` (5,105 files / 16 run dirs) + `/tmp/w8-ver-b81/` (980 files / 4 run dirs) unarchived; survival unknown (two+ waves old); name the unrecoverable runner revision in any receipt | open-now | archive seat + receipt in the r5/r8 pattern | `archive-receipt-r10.md` U2; `SKILL.md:1175`; `stateful-fixture-evidence.md:730-739` |
| O3 | **`corpus/README.md` refresh** — header `:5-9` still "Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0" vs 22 / 6,824 / 9 now; coverage rows stop at round 3; Frontier `:48` counts "thirteen `/tmp` evidence groups" vs 36 grouped | open-now | record-debt seat (rows 4–11) | `corpus/README.md` (measured `e156bb99af2c` / 59) |
| O4 | **`SCORECARD.md` refresh** — primary-verdict tables r1–r3 only (`:18/:26/:38`); axes table r1-pinned (`:53-62`: depth 7 / coverage 5 / operability 5 / freshness 3 / calibration 6 / adjacency 5); move-log rows 4–10 sit under "## Planned / retired" (`:73`; rows `:83-89`). The r4–r11 verdicts + axes refresh + placement are owed | open-now | record-debt seat; must agree cell-for-cell with this note's named values | `SCORECARD.md` (measured `106377d15dc8` / 89); `plans/round-11.plan.md:505-509` |
| O5 | **Lessons `round-10.md` + `round-11.md`** owed (the lane's own Gates, not deferred) | open-now | this round's own seats | `plans/round-11.plan.md:551-553`; `ls -A corpus/lessons` → 9 |
| O6 | **Packet cold-read verdict** — `[unknown]` since r5; the §6 falsifier has never been executed | open-now | a non-author seat executes it; a follow-up question is a recorded gap requiring amendment | `operator-approval-request.md:100`; `packet-readiness-r7.md` §5 |
| O7 | **Packet note-pin block** — 9/9 stale; `SKILL.md:37-66` pointer resolves to a superseded block | open-now | append-only erratum or re-filed revision (decision recorded); re-bound values exist | `packet-readiness-r7.md` §2 |
| O8 | **SKILL declared-stale pins** — `:963`/`:1024` pin `archive-receipt-r8.md` at `0587605db913`/191 vs current `de45b805e5a4`/218; `:961`/`:971` stateful-note pin `e89bc89bff38`/773 vs current `f04e2e473cf9`/855 (declared supersession) | open-now | final §Pins refresh / erratum (clause C names re-binding) | `plans/round-11.plan.md:60-75`; `reports/r10-aud-b10.md` F-1/F-2 |
| O9 | **r9 non-author re-run owed** — no independent seat has re-run the r9 matrix cells (the receipt audit re-derived claims, not the cells) | open-now | independent re-run (r8 VER-B8-1 / AUD-B8 pattern) | `state-changing-matrix-r9.md` §10 SC-2; `plans/round-11.plan.md:400-406` |
| O10 | **Round-6 L1 matrix** (wire-class / cache-revalidation decision for repeated same-URL subresources) — still unlanded; its bytes are archived (`w6-tabi-b61`, 139/139 this note) | open-now | L0 seat or named residue; landing site invited in `layer-routing-synthesis.md` §4 | `carried-debt-closure-r8.md` §2; `SKILL.md:1146-1148` |
| O11 | **r9 L1a/L1c cells + §11 U1–U9** — cookie lifecycle across a browser restart; cache × cookie freshness scope; token-table growth; cross-client replay race; the guard race — cells ride as residue with falsifiers, never as a widened claim | open-now (residue with falsifiers) | named residue / future loopback seat | `state-changing-matrix-r9.md` §11; `plans/round-11.plan.md:399-406` |
| O12 | **Arc-synthesis errata** — F1 (r7-row pre-count 25 → **28**), F2 (§0 pre-state stamp misattributed), F3 ("5 extensions" under-enumerated) | open-now | the author lane's append-only §7 block (the synthesis's §7 is still "none yet") | `reports/r10-aud-b10.md` §5; `arc-synthesis.md:182-184` |
| O13 | **Malformed HEAD pin** at `carried-debt-closure-r8.md:5` — 37 hex chars, not a resolvable prefix; correct full sha `b377007877be2d104cc9e3a73de56cf81a24ab0d` | open-now | one-line append-only erratum | `archive-receipt-r10.md` §4 F1, §6 |
| O14 | **Fleet-level: tabi absent from the watchdog `LANES` roster** — `scripts/shokunin-watchdog.sh:14` reads `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"` | open-now (reported, never absorbed — carried from r5) | fleet protocol lane (not this lane) | watchdog `:14`; `LOG.md:132`; `plans/round-11.plan.md:547-549` |
| O15 | **Recorded drifts, kept append-only** — the "8-field `/status`" shorthand vs the 9 keys mechanically counted; the "4-line `ROOT`/port edit" vs the measured 3 changed lines | open-now (annotation level; nothing harmonized) | owning editors' errata or named residue | `webbridge-revival-assessment.md` §6; `carried-debt-closure-r8.md` §1.4 |
| O16 | **Daemon/A4 obligations** — none current (daemon down; no revived instance); any revival recreates the operator-only stop debt | state, not debt | as §2.2 | `webbridge-revival-assessment.md` §4; §0.3 rows |

**Residue (retired with reasons):**

| # | Item | Status | Reason / citation |
|---|---|---|---|
| R1 | The unrecoverable r8 runner revision `e22a967ed69e9f6e…` | retired-as-residue | no bytes anywhere in the swept trees; survives only as a sha in `driver.log`s; any future receipt must name it — `stateful-fixture-evidence.md:737-739`; `archive-receipt-r10.md` check D |
| R2 | r9 audit/scribe/verifier scratch and the r8 archive seat's own scratch (`/tmp/w9-aud-b9-*`, `/tmp/w9-scrb9`, `/tmp/w9-ver-b9-work`, `/tmp/w8-arch-tranche`) | retired-as-residue | not named as archive debt by any owning note; scratch is volatile by the namespace rule — `archive-receipt-r10.md` U2 |
| R3 | Zero real-site datum; U1 rate/ToS absence; real-site POST/redirect/CSRF classes; the handshake — | retired-as-residue (by construction, not failure) | all are approval-gated or measurement-gated; each named with its unblock condition in §1.3/§2 — `operator-approval-request.md` §5-§6; `interaction-approval-table.md:191-193` |

## 4. Unknowns (falsifiable; do not convert to claims without a new probe)

1. What the round-11 seats land **after this write stamp** — clause C's final state (closed / executable-executed / in force), the README/SCORECARD/lessons refresh, any L0 line, any archive seat. This note's statuses are as-of 21:31–21:35Z; the record re-derives.
2. Whether the operator answers at all — and in which shape (site + scope; budget). Silence is not a denial; the packet stays filed (`operator-approval-request.md:102-110`).
3. Whether clause (c) crosses the flip (2026-10-15T00:00Z = 21:00 -03) inside this wave's window; if not, it hands off with the recipe (O1) — never claimed closed.
4. Whether the r8 `/tmp` bytes survive to an archive seat; whether `e22a967ed69e9f6e…` stays the only unrecoverable revision.
5. Whether the packet's cold-read test passes first try; whether its pin block is re-bound or the decision recorded.
6. Whether the r6 L1 matrix and the r9 L1a/L1c cells land or ride as named residue; whether any non-author re-runs the r9 cells.
7. Whether the chain is genuinely ten training rounds as the counters read, or the fleet extends again — this note stands as-of either way (`plans/round-11.plan.md:640-643`).
8. Mechanism unknowns carried from the notes and not reopened here: the perf `transferSize` vs `finEnc` offset, the within-session cache-path selector, the abort race (`layer-routing-synthesis.md` §5 items 1–8).

## 5. Provenance — pins and counts re-derived at the write stamp

All values re-derived 21:31–21:35Z from disk (scratch `/tmp/w11-b11-1-*.txt`, volatile). sha256 first-12; `wc -l`:

| Source | sha256-12 | lines |
|---|---|---|
| `SKILL.md` | `453ed25a07f6` | 1,320 |
| `LOG.md` | `0e35e9855e79` | 137 |
| `SCORECARD.md` | `106377d15dc8` | 89 |
| `corpus/README.md` | `e156bb99af2c` | 59 |
| `corpus/knowledge/arc-synthesis.md` | `f42428bd9af7` | 183 |
| `corpus/knowledge/archive-receipt-r10.md` | `c6f4445ebd03` | 203 |
| `corpus/knowledge/archive-receipt-r8.md` | `de45b805e5a4` | 218 |
| `corpus/knowledge/archive-receipt-r5.md` | `b41c2f6fb5a4` | 180 |
| `corpus/knowledge/state-changing-matrix-r9.md` | `ec540be07ed5` | 388 |
| `corpus/knowledge/stateful-fixture-evidence.md` | `f04e2e473cf9` | 855 |
| `corpus/knowledge/carried-debt-closure-r8.md` | `48dc8db69c57` | 149 |
| `corpus/knowledge/packet-readiness-r7.md` | `7185642c2e41` | 122 |
| `corpus/knowledge/webbridge-revival-assessment.md` | `a07c8aedc161` | 322 |
| `corpus/knowledge/interaction-approval-table.md` | `b5e29a9a2adf` | 246 |
| `corpus/knowledge/network-evidence-rung.md` | `d1564f38dc14` | 609 |
| `corpus/knowledge/layer-routing-synthesis.md` | `7725ee421716` | 254 |
| `corpus/knowledge/live-dynamic-capture.md` | `01266495b761` | 245 |
| `corpus/knowledge/cdp-evidence-patterns.md` | `337ff64579e8` | 234 |
| `corpus/knowledge/async-step-evidence.md` | `05dcda5e60b9` | 282 |
| `corpus/knowledge/external-class-fixture-v2.md` | `4aa604f1788b` | 569 |
| `corpus/knowledge/hygiene-sweep-r4.md` | `87155e12021d` | 258 |
| `corpus/knowledge/webbridge-daemon-disposition.md` | `fd5f6861aa3b` | 274 |
| `corpus/knowledge/webbridge-plugin-anatomy.md` | `8d1488ab763e` | 290 |
| `corpus/knowledge/browser-surface-census.md` | `a33c22644d64` | 265 |
| `corpus/knowledge/executor-test-sufficiency.md` | `32772e343848` | 329 |
| `corpus/handoffs/operator-approval-request.md` | `94dc63f5fb9e` | 121 |
| `.ufo/l0-questions.md` (fleet root) | `02c53ec60acf` | 25 |
| `reports/r4-aud-tab1.md` | `5f44b0f94483` | 167 |
| `reports/r5-aud-b5.md` | `d09f1712cbcf` | 170 |
| `reports/r6-aud-b6.md` | `9428ddec52b9` | 178 |
| `reports/r7-aud-b7.md` | `ea4b16a4a844` | 260 |
| `reports/r8-aud-b8.md` | `a191832be152` | 181 |
| `reports/r9-aud-b9.md` | `df34bf6c63e1` | 174 |
| `reports/r10-aud-b10.md` | `11dd09350de7` | 211 |
| `corpus/lessons/round-9.md` | `07c3039ea5bd` | 277 |
| `plans/round-11.plan.md` | `21317a8ad672` | 716 |
| `plans/round-10-record-draft.md` | `66b3a868848e` | 545 |
| substrate `kimi.plugin.json` / plugin `SKILL.md` / `references/operations.md` | `e70aff5c40ff` / `84a8e69d04c5` / `b811d9c23dfd` | 3/3 match |
| daemon binary `~/.kimi-webbridge/bin/kimi-webbridge` | `71067480bd99c2ba` (first16) | matches r2/r6 pins |

**Spot-checks run for this note (re-runnable):**

1. **Manifest equality (3 groups):** `sha256sum -c MANIFEST.txt` → `w9-tabi-b91` **269/269 OK**, `tabi-b1-r3b-journey` **83/83 OK**, `w6-tabi-b61` **139/139 OK** — **491/491 OK, 0 FAILED**, rc 0 each (21:33Z).
2. **L0 read-back:** `02c53ec60acf…` / 25 / 21,539 B / mtime unchanged / exactly 1 `tabi` line (`:25`); span arithmetic printed (§0.3); negative control — no second line, no edit.
3. **Daemon + substrate:** no listener on 10086, no webbridge process, stale pointers (sizes/mtimes), binary pin re-hashed; browser census 0; substrate trio 3/3.
4. **Census re-derivation:** knowledge 22 / 6,824; lessons 9; reports 7; evidence 36 / 36 / 1,721 / 10,318,947 B; evidence excl. manifests 1,685 / 10,135,246 B.
5. **Negative sweeps:** `ls corpus/knowledge/ | grep -c real-site` → **0** (rc 1); packet `/tmp` count → **0** (rc 1); Brave dir → `NativeMessagingHosts` only.
6. **Fleet counters:** `MANIFEST.json` tabi train entries rounds 2–10 (JSON scan, read-only); closeout commits `b5a9723` / `494d32a` (`git log`); watchdog roster line (`scripts/shokunin-watchdog.sh:14`).

## 6. Admission self-check and handoff hooks

Against `corpus/QUALITY.md:1-8` and `CORPUS.md:33-46`: every claim is falsifiable or marked opinion — **yes**; every claim carries a measured anchor — **yes** (path:line / command per row); observation / inference / unknown separated — **yes** (§0.1, §4, inline markers); errata append-only — **yes** (§7); a rejection is kept — **n/a** (no rejection in this note). Corpus-contract rules: counts carry their commands **and read times** (every §0.3/§5 value); negative claims carry their sweeps (§1.3, §5.5); quotes name their location (the one verbatim rule quote is `cdp-evidence-patterns.md:92`); index rows exist only for files that exist — this note indexes none beyond landed artifacts; no credential material (shape-only throughout); corrections are new entries, not rewrites — the r10 audit's F1/F2/F3 are carried here as a new entry and the synthesis's own §7 erratum stays owed (O12). **Admission decision (seat's, per `plans/round-11.plan.md:467-481`): admitted** — subject to the round's non-author verification (`LEARNING.md:37-43`), which is not this lane's; a verifier's disagreement lands as append-only errata here or in the round record.

Handoff hooks for a post-training reader (the detailed command block is the round record's; the essentials): (i) re-read `.ufo/l0-questions.md` whole and classify against the six-state table (`plans/round-11.plan.md:182-197`); (ii) if clause (c) is still in force, run the pass (`plans/round-11.plan.md:453-459`); (iii) spot-verify the archive (`cd corpus/evidence/<g> && sha256sum -c MANIFEST.txt`); (iv) re-run the Brave reject (`ls -A ~/.config/BraveSoftware/Brave-Browser/` → expect `NativeMessagingHosts` only); (v) work the open-now set in §3 in order.

## 7. Errata (append-only — never edit above blocks; corrections append below)

*(none yet at write — corrections append with date + evidence, per `QUALITY.md:4`.)*
E1 — 2026-10-14T21:39Z, by B11-1 (post-write re-check; §7's "none yet" is superseded here, not rewritten)

- **This note's fingerprint immediately before this block:** 226 `wc -l` / 38,944 B / sha256 first16 `580cf761e27817bc` (read 21:37Z). Any append (this one included) moves the hash by construction — re-derive with `sha256sum`.
- **Concurrent round-11 landings inside the post-write window** (32-lane wave; read-only observation, shapes only): ` M SKILL.md` — a round-11 distillation seat's append; current revision sha256 first16 `f4d9cf5b1aa5` / **1,458** `wc -l` / mtime `2026-10-14 18:34:39 -03` vs this note's as-of pin `453ed25a07f6` / 1,320 (§0.3, §5) — superseded; re-derive before citing. The cited SKILL line anchors (`:361-367`, `:961`, `:963`, `:971`, `:1024`, `:1146-1148`) were re-read in the new revision at 21:38Z and still resolve (the append went after them; the pin *values* are what moved). `?? plans/completion-evidence.md` — another round-11 lane's artifact (13,925 B / mtime `18:36:16 -03`; contents not read). `?? corpus/knowledge/closeout-r11.md` — this note (untracked at the stamp).
- **§0.3's "worktree clean" row is as-of 21:31Z exactly** — it was clean at that read; a later read sees the three entries above, all concurrent lanes' or this note's own.
- **Census row note:** §0.3's "22 notes" was as-of 21:31Z, before this file existed; a post-write re-run reads **23** notes including this one (`ls corpus/knowledge/*.md | wc -l` → 23, 21:39Z). The rest of §0.3 re-checked unchanged at 21:39Z: evidence 36 groups / 36 manifests / 1,721 files / 10,318,947 B; L0 `02c53ec60acf…` / 25 / 21,539 B / mtime unchanged; daemon still down (no listener on 10086).
- **Value check re-run for O13:** `git rev-parse b377007` → `b377007877be2d104cc9e3a73de56cf81a24ab0d`; the malformed 37-char string at `carried-debt-closure-r8.md:5` fails `git cat-file -t` (rc 128). O13 stands as written.
- **Discipline restated:** this lane wrote only this file; the `SKILL.md` append and `plans/completion-evidence.md` are other lanes'. §5's pin table remains this note's own 21:31–21:35Z authority; values that moved after it are flagged here, append-only.