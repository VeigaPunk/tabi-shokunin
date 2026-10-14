<!-- Handoff artifact — NOT a knowledge note: it does not enter the knowledge
count, the coverage map, or the expansion trend. Precedent for the
corpus/handoffs/ surface: kake-shokunin/corpus/handoffs/cmdProbe-merge-fix.md.
Filed by tabi-shokunin round-5 seat B5-4 per plans/round-5.plan.md clause (d).
Discipline: every claim carries a measured anchor; observation / inference /
unknown stay separate (corpus/QUALITY.md); no volatile scratch path is cited. -->
# Operator approval request — tabi (browser & web-interaction craft)

filed: 2026-10-14T17:05Z (round 5) · lane: `tabi-shokunin` · filed by seat B5-4
round: 5
recheck: this lane re-reads `.ufo/l0-questions.md` at the start of every round and records the read; until an answer naming site + scope (+ budget for a rate surface) is read back, the round's loopback-only anti-claim holds and **no external site is contacted**.

This is a request, not a grant. Nothing in this file authorizes work by itself. The operator answers by ID (R1/R2/R3, §2) by editing `.ufo/l0-questions.md` in place (§7).

## 0. Why this exists (measured)

- The lane's interaction taxonomy is finalized: **C1** loopback fixture = autonomous-now; **C2** operator's own sites / **C3** third-party read-only / **C6** rate-limited = operator-asleep-blocked (durable form: operator-approval-required); **C4** third-party consequential = never lane-executed; **C5** login-required = operator-approval-required (`corpus/knowledge/interaction-approval-table.md`, pin `d6ad567a610c`; `SKILL.md:663-689`).
- The delivery channel exists and is documented — `MISSION.md:84-88`: the operator is reachable via `.ufo/l0-questions.md`; append a line `<lane> | round-<N> | <question or decision needed>`; the operator answers by editing the file in place.
- Measured at filing: `grep -c 'tabi' .ufo/l0-questions.md` → **0** (file is 24 lines). The boundary has been restated in four consecutive round anti-claims, but no artifact has ever named what would unblock it. [observation]
- This packet closes that gap: it turns the blocked classes into three answerable asks with explicit terms, a hard-coded default budget, and stop conditions — so the operator can answer without reading the lane's corpus.
- Round-5 anti-claim (in force): no external site is contacted this round. The packet is filed, not sent anywhere else. A grant is acted on only after the answer is read back from the L0 file, and only inside its stated scope.

## 1. Harness-only — which browser, not just which site

The lane has two interaction surfaces and they carry different rights:

| Surface | What it is | Rights load | Askable now? |
|---|---|---|---|
| The lane's own cold-profile chromium + CDP harness | self-launched browser; lane-authored or public pages; no session, no cookies, no operator tab | the third party's page-visit question only (C3) | **yes — this is the ask** |
| The bridge driving the operator's real browser | kimi-webbridge daemon + extension + the operator's own sessions/tabs | C5 + A6 (borrowed tab) + A9 (session stores) | **no — not requested** |

Filing-time read (loopback, read-only): `ss -ltn | grep -c ':10086'` → 0; `curl -m 1 http://127.0.0.1:10086/status` → exit 7 (no daemon listening) — consistent with the round-4 measured teardown (`corpus/knowledge/hygiene-sweep-r4.md` §4). The bridge path is therefore not even currently executable, and requesting it would load the ask with C5/A6/A9 for no evidentiary gain. [inference from measured state]

The smallest honest grant is therefore **harness-only**: the lane's own browser, cold profile, no session material, no operator tab. Every capture the lane has measured (rounds 1-4) was produced this way.

## 2. The asks — the operator answers by ID

### R1 — C3, read-only, harness-only (the ask that matters)

- **What:** load **one** named public, non-authenticated page in the lane's own cold-profile chromium; no click, no fill, no submit, no login, no scroll beyond load; capture at the three existing rungs — screenshot + raw DOMSnapshot; CDP Network-domain slice; URL/navigation history.
- **Budget (hard-coded default; R3 can replace it):** 1 page · 1 cold run · ≤ 20 HTTP requests · ≤ 60 s wall time · ≥ 1 s between navigations. The first request is `/robots.txt` as the conventional permission probe; a disallow → **stop and report**.
- **Stop-and-report:** on the first 429 / 403 / CAPTCHA-or-interstitial / ToS gate — stop, never retry through; record the datum.
- **Produces:** `corpus/knowledge/real-site-observation-<host>.md` with per-claim anchors (the 9-item record envelope), plus the first measured rate/ToS datum (`interaction-approval-table.md` U1) — recorded either way, including a refusal.
- **Operator must state:** the exact URL and "observation only, no interaction".

### R2 — C2, operator's own site

- **Same read-only terms as R1.** The operator names the property (the lane has no ownership-verification surface — `interaction-approval-table.md` U3).
- Interaction (navigate/read) only if the operator says so in the same line; consequential acts even on an "own" property stay refused (`PROVINCE.md:15-19`).

### R3 — C6, a budget

- Not a site but a number: **max requests, cadence, and whether the budget stands per-host or per-run.** The budget is C6's deciding axis and the lane may never self-assign one (`interaction-approval-table.md` §3 C6; `SKILL.md:635-638`).
- If R1 is granted with no R3 number, R1's hard-coded default above applies.

**Answer template** (edit in place in `.ufo/l0-questions.md`):

`tabi | round-5 | R1: grant <URL> — observation only / deny · R2: grant <property> / deny · R3: budget <N requests> per <cadence>, <per-host|per-run>`

## 3. Not asked in round 5 — edges stated so the operator sees them

- **C4 third-party consequential** (purchases/posts/deletions/submissions): never — a province boundary, not an approval gap (`PROVINCE.md:15-19`; note §3 C4).
- **C5 login-required:** deliberately un-asked. The lane cannot complete a login, must not touch session stores, and a grant would need the operator present at the browser. Belongs to a later, separate packet.
- **A5 trusted input via the `cdp` escape hatch** ("advanced"): un-asked; it belongs with an interaction grant, not a read grant.
- **A4 daemon return-to-baseline:** closed as moot — the round-2 daemon is gone (measured teardown, `hygiene-sweep-r4.md` §4; `webbridge-daemon-disposition.md` §10); the stale pid file is the known pre-state pattern.
- **Never movable by any approval:** consequential external acts; session-material content-reads (shape-only always); out-of-province work (`SKILL.md:704-711`).

## 4. Evidence classes ready — what a grant would build on

Pins are sha256 first-12, re-derived in-repo at filing (`sha256sum corpus/knowledge/*.md`, 2026-10-14T17:0xZ). Full values and the §Pins table: `SKILL.md:37-66`.

| Class | Note (pin) | What it proves the lane can already do |
|---|---|---|
| static bytes | `cdp-evidence-patterns.md` `8de2ee008c9c` | screenshot + DOM evidence with determinism classes E1–E11; the 9-item record envelope; cleanup proof |
| dynamic pair | `live-dynamic-capture.md` `f97c10238907` | before/after capture on a JS-mutating page, byte-identical across independent runs |
| multi-step journey | `multi-step-journey.md` `8925ce6c46c7` | four-page traversal with real clicks / `insertText` fill / GET submit; per-step triplets; browser-side history witness |
| network rung | `network-evidence-rung.md` `4889ccf073a8` | per-step CDP Network slices, five correlated surfaces, D1–D8 layer-disagreement cases, byte-closure equation; fixture + server embedded in §11 (survives scratch loss) |
| async pair | `async-step-evidence.md` `577af06bd9a8` | held-request pre/post pair across visual/state/network layers; settle-wait discipline |
| approval taxonomy | `interaction-approval-table.md` `d6ad567a610c` | C1–C6 + A1–A12, each with a gate and a falsifier |
| no-oral-context sufficiency | `executor-test-sufficiency.md` `5f04f6877e1e` | a fresh document-only executor ran the runbook verbatim; verdict SUFFICIENT (the packet's own cold-read test, §6, follows this pattern) |
| hygiene / closure | `hygiene-sweep-r4.md` `4ddc67151b98` | port/process/daemon closure proven per run |
| runtime + substrate pins | `browser-surface-census.md` `a4bbb39edb12`; substrate | chromium `152.0.7977.82`; plugin manifest `e70aff5c40ff`, plugin skill `84a8e69d04c5`, `references/operations.md` `b811d9c23dfd` (all three re-derived at filing) |

**Durability.** The artifact groups behind these classes are being archived this round under `corpus/evidence/<group>/` with a per-group `MANIFEST.txt` (round-5 archive seat; the archive index note is authoritative). At filing, the archive root exists with 25 group trees and no per-group manifest had landed yet — so every hash cited in this packet is the in-repo note pin, not a volatile staging value. If an archived hash ever differs from a note pin, it is recorded as a freshness finding (append-only), never repaired.

**Honest gaps, stated in the same breath** (an ask that hides these is not calibration): **zero** real-site datum; rate/ToS unmeasured (U1); the extension↔daemon handshake has never been verified (`extension_connected:false` throughout, daemon now down); byte-identity is environment-scoped (same host/browser/font stack — `live-dynamic-capture.md` §7.3; `network-evidence-rung.md` §10.8); POST forms, redirects with bodies, and CSRF-checked submits are untested by rule (`multi-step-journey.md` §8.6).

## 5. What a granted R1 would produce

One note, `corpus/knowledge/real-site-observation-<host>.md`, containing: the observed URL + read-back form; the three-rung captures with hashes; the wire/client reconciliation; the rate/ToS datum (including "none observed" or a refusal as the datum); the cleanup/closure proof; and per-claim anchors so every sentence is falsifiable by a cold reader. No session material ever; no interaction; a stop-and-report outcome is a successful run.

## 6. The cold-reader falsifier (this packet's own test)

A **non-author cold reader** — a fresh, document-only seat of the round-3 executor shape (`executor-test-sufficiency.md`) — must complete the grant/deny form below from this packet alone, with **zero follow-up questions**:

1. Which site does R1 cover, and who names it? 2. What scope is granted (what may the lane do / not do)? 3. What is the budget if R3 is not answered? 4. Which interaction classes are allowed? 5. Which are forbidden even if R1/R2 are granted? 6. What evidence will the run produce, and where does it land? 7. Under what conditions must the run stop?

One follow-up question is a recorded gap: the packet is amended before the L0 line's hash is treated as final; a re-filed revision gets a new hash and a new L0 line (append-only discipline).

Status: [unknown — not yet executed at filing time; scheduled on this round's non-author verification seat; the result and any gap will be appended below.]

## 7. Answer discipline

- The operator answers by editing `.ufo/l0-questions.md` in place (`MISSION.md:87`), amending or replying to the tabi line.
- The lane re-reads that file at the start of every round and records the read; it never assumes an answer.
- A **denial** is recorded as a calibration datum (a rejection is kept, not dropped — `corpus/QUALITY.md:5`); the lane does not re-ask unless the ask materially changes, and each re-ask records its count.
- A grant is acted on **only after the answer is read back**, and only inside its stated scope. The first measured rate/ToS datum stops the run and is reported — never retried through.

## 8. Filing checks (re-runnable)

- No volatile scratch path is cited in this file; the round-plan check counts the scratch-root string over this file, expected 0 (run at filing; the literal root is deliberately not reproduced here).
- `sha256sum corpus/handoffs/operator-approval-request.md` → the hash named in the L0 line appended to `.ufo/l0-questions.md` (one line, this round's only main-repo write).
- `ls corpus/knowledge/*.md | wc -l` → 11; `sha256sum corpus/knowledge/*.md | cut -c1-12` → the §4 pins.
- Substrate (read-only): `sha256sum` over the plugin's `kimi.plugin.json`, skill `SKILL.md`, `references/operations.md` → `e70aff5c40ff` / `84a8e69d04c5` / `b811d9c23dfd`.
- Loopback daemon recheck before any bridge-path work: `ss -ltnp | grep 10086`; `curl -s http://127.0.0.1:10086/status` (today: no listener, refused).

## 9. Unknowns (falsifiable)

- Whether an operator answer arrives at all, and in which round; the packet does not assume one.
- Whether the cold-read test passes on the first attempt; a follow-up question is a recorded gap, not a failed round.
- Whether the archived manifest hashes will equal the note pins (archive in flight; a mismatch is a freshness finding, not a repair).
- Whether a real-site rate/ToS surface behaves as the loopback-shaped fixtures anticipate — explicitly unmeasured until R1 is answered (U1).