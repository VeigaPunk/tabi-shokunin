<!-- corpus entry — tabi-shokunin round 3 (2026-10-14), lane TABI-R3-2 (probation-completing; assignment: the approval table finalized; plan: plans/round-3.plan.md:2-13). Method: read-only synthesis over the lane's corpus notes (pins re-derived this round), first-hand re-reads of the kimi-webbridge substrate SKILL.md / references/operations.md, spot-check commands re-run; transcripts staged at /tmp/tabi-r3-2-spot/ (volatile — archive obligation cdp-evidence-patterns.md:92 stands); one live-state read (`ss -ltnp`, 2026-10-14T14:41:28Z → daemon pid 3934817 on 127.0.0.1:10086). NO external site was contacted — round-3 anti-claim held (plans/round-3.plan.md:8). Reconciles with the integrating seat's SKILL.md distillation, which landed concurrently while this note was written (SKILL.md 243 → 432 lines within the hour; see §1a). This lane's write scope was this file only; coverage row / LOG append / SKILL distillation are the integrating round's. -->
# Interaction approval table — every interaction class → disposition (operator-asleep round)

Scope: the lane's interaction surface (`PROVINCE.md:9-19`). This is the round-3 calibration
deliverable: each interaction class the lane might face, mapped to one of three dispositions
— **autonomous-now / operator-asleep-blocked / operator-approval-required** — with the deciding
evidence on the three axes the lane judges by: **rights** (whose permission the act needs),
**rate** (what request budget is actually known), **consequence** (what the act can change).
Falsifiable claims carry measured anchors; observation / inference / unknown stay separate
(`QUALITY.md:3-6`). Where the corpus holds no datum, the row says so instead of inventing one.

**Citation convention:** stable sources are cited by path:line (corpus notes, substrate files,
plans — all hash-pinned in §6). `SKILL.md` (this lane's playbook) was under concurrent edit by
the integrating seat while this note was written, so it is cited **by section name + quoted
string + sha pin**, never by line number; the captured inspection is sha256
`ea7122d92d7b…` (432 lines, 2026-10-14T14:48:05Z). If SKILL.md's sha moved, re-locate the
quoted strings before reusing those refs.

Status: **finalized**, 6 required classes + 12 adjacent measured gates (§4). Counts are
mechanical (§6).

## 1. Dispositions — definitions (first record of this taxonomy)

| Disposition | Means | Turns on |
|---|---|---|
| **autonomous-now** | The lane may execute the class without any operator event. | No third-party rights touched · rate lane-owned or doc-bounded · consequence local/reversible · a measured precedent exists. |
| **operator-asleep-blocked** | Admissible in principle, but its gate is an operator event the asleep state cannot supply (a go-ahead naming scope; a budget; a handoff). Blocked now; unblocks only with that recorded event. | Rights (permission not yet given) and/or rate (budget unmeasured / ungranted). |
| **operator-approval-required** | Never lane-executed on the lane's own initiative: a recorded, explicit, per-action operator decision is required. For the acts on the never-set (§1a) the approval does **not** delegate execution to the lane — the operator acts, the lane at most observes/reports. | Consequence (irreversibility / real-world effect), session material, operator-owned operations. A wake-up alone does not move a class out of this bin. |

**Two tenses, one gate.** `operator-asleep-blocked` and `operator-approval-required` are not
different permissions — they are the same approval gate in two tenses: a class needing operator
permission is *operator-approval-required* in durable form and *operator-asleep-blocked* while
the operator cannot supply the event. The SKILL.md distillation states the same duality
("External-site interaction … **operator-approval-required** — with the operator asleep:
**operator-asleep-blocked**", SKILL.md §Approval table, sha `ea7122d92d7b…`). Rows below carry
the **current-round** disposition (operator asleep, `plans/round-2.plan.md:8-9`;
`plans/round-3.plan.md:8`); each row's gate names the durable form.

## 1a. Relation to the SKILL.md distilled table

The integrating seat landed an approval table in SKILL.md while this note was being written
(§Approval table, rows: loopback capture / task-started browser reads / daemon start / `/status`
/ driving the user's browser → autonomous-now; external-site interaction → approval-required
(awake) = asleep-blocked (now); trusted input via `cdp`, daemon `stop`/`restart`/`uninstall`,
return-to-baseline → approval-required; reuse of daemon state → autonomous-now after recheck).
Its never-set — "not movable by any approval — never": consequential external actions;
session-material content-reads; out-of-province work — is reproduced in this table as C4, A9,
A10. **The two tables agree in bin semantics**; this note is the detailed form (the six classes
the round plan names: operator's own sites, third-party read-only, login-required and
rate-limited have no SKILL.md row yet), and it adds the three deciding axes + falsifiers per
class. Divergence would be recorded as errata here, not silently reconciled.

## 2. The table

| ID | Interaction class | Disposition (this round) | Deciding evidence (rights · rate · consequence) | Gate / unblock |
|---|---|---|---|---|
| **C1** | **Loopback fixture** — agent-launched browser + agent-authored/`data:` pages on 127.0.0.1 | **autonomous-now** | rights: none of a third party's (fixture authored per lane; the only non-fixture request was the browser's own `/favicon.ico` probe → 404 — `live-dynamic-capture.md:13-17`) · rate: lane-owned (0.85–1.1 s per probe, runs under `timeout 45–180` — SKILL.md §Bounded runs, sha `ea7122d92d7b…`) · consequence: local/reversible, cleanup proven per run (`live-dynamic-capture.md:175-188`; `cdp-evidence-patterns.md:94-105`) | none — the warrant includes a cleanup proof per session (pre-kill listener line, post-kill refusal, kill by PID) |
| **C2** | **Operator's own sites** — pages/properties the operator controls | **operator-asleep-blocked** (durable: operator-approval-required) | rights: the operator's (ownership is an operator assertion — the lane has no verification surface [U3]; admissible form = "observation + operator-approved interaction" — `PROVINCE.md:17-19`; `MINT.md:19-20`) · rate: unmeasured for real sites → the bounded-runs floor applies, never a self-granted budget (SKILL.md §Bounded runs) · consequence: reads low, but any state change on a live property is consequential → never lane-run (`PROVINCE.md:17-18`; SKILL.md never-set) | operator wakes and records a go-ahead naming **the site + scope** (a category-level "my sites" grant is not a scope); reads/interaction then proceed under C3's terms |
| **C3** | **Third-party read-only** — reading pages the lane does not control | **operator-asleep-blocked** (durable: operator-approval-required) | rights: the third party's; ToS/robots surface **unmeasured** (no datum in the corpus; "do not assert one; record it when measured" — SKILL.md §Bounded runs) → default-deny · rate: unmeasured (same rule) · consequence: no state changed, but the visit is visible to the site (their logs; browser egress is real — "loopback ≠ no-egress", `cdp-evidence-patterns.md:36`) | operator go-ahead naming site + scope; then observation only, under the bounded-runs floor; this is the class the round anti-claim blocks (SKILL.md §Approval table row "External-site interaction"; `plans/round-2.plan.md:8-9`) |
| **C4** | **Third-party consequential** — purchases, posts, deletions, submissions on a site the lane does not control | **never lane-executed** (nearest label: operator-approval-required — the approval routes the act to the operator, never to the lane) | rights: the third party's; no grant channel to the lane exists (`PROVINCE.md:15-19`: "Never performs consequential actions on external sites (purchases, posts, deletions); observation and operator-approved interaction only") · rate: n/a (never run) · consequence: real-world and irreversible | a wake-up does not lift it; the operator executes by hand; the lane at most observes/reports under C3 terms after the fact; SKILL.md never-set, item 1 |
| **C5** | **Login-required** — any page whose content/action sits behind the operator's session | **operator-approval-required** | rights: the operator's session + third-party account terms; session material is **shape-only, never content-read** (`PROVINCE.md:16-17`; `browser-surface-census.md:3-8,52-57`; `webbridge-plugin-anatomy.md:154-159`) · rate: n/a · consequence: authenticated acts can change state, and the session itself is secret material | per-site/per-session operator approval **and an operator action** where authentication is missing (the lane cannot complete a login and must not touch session stores); `isTrusted`-checking sites hand the page back to the user (SKILL.md §Webbridge, "a stop, not a puzzle"); trusted input via `cdp` = advanced + explicit approval (SKILL.md §Approval table row "Trusted input … `cdp`") |
| **C6** | **Rate-limited** — third-party (or operator) surfaces with request budgets, 429s, ToS rate terms | **operator-asleep-blocked** (durable: operator-approval-required) | rights: usually the third party's (or the operator's property) · rate: **the deciding axis — and it is unmeasured here**; "No measured live-site rate limit or ToS surface exists in the probation notes — do not assert one; record it when measured" (SKILL.md §Bounded runs; `corpus/README.md:30`) → the lane can never self-assign a budget · consequence: over-requesting harms a third party's resources and can trip countermeasures | the go-ahead must carry a budget (volume + cadence); run only under it; on the first measured rate/ToS datum: **stop and report** — never retry through; the datum lands in the corpus (see U1) |

## 3. Evidence detail per class (anchored; falsifier named)

**C1 — loopback fixture (autonomous-now).**
- Precedents: round-1 `data:` URL through a self-launched headless chromium on 127.0.0.1:19333,
  screenshot + DOM evidence, closure verified (`cdp-evidence-patterns.md:20-34,62-77,94-103`);
  round-2 `http.server` fixture on 127.0.0.1:19411 with CDP before/after capture, run twice with
  sha-pinned methodology and a pinned viewport (`live-dynamic-capture.md:12-56,60-73`).
- Byte-determinism is environment-scoped and is **not** part of this warrant
  (`live-dynamic-capture.md:140-149`); C1's autonomy rests on rights/rate/consequence.
- Falsifier: a run that leaves a listener alive, a surviving process, or any state change
  outside the lane's scratch → the class loses autonomous-now until cleanup is proven again.
- Caveat [O]: loopback ≠ zero egress — the browser logged GCM attempts under both flag sets
  (`live-dynamic-capture.md:190-200`); C1 is about *interaction*, never a no-network claim.

**C2 — operator's own sites (operator-asleep-blocked).**
- Not autonomous because no standing authorization exists for *any* external surface: the
  SKILL.md table row "External-site interaction (navigate/click/fill on real sites)" reads
  "operator-approval-required — with the operator asleep: operator-asleep-blocked".
- The recorded instances: round 2 recorded approval absent (`plans/round-2.plan.md:8-9`); round 3
  repeats the anti-claim (`plans/round-3.plan.md:8`).
- Consequential acts on an operator-owned property are still external to the lane → the
  `PROVINCE.md:17-18` refusal applies; "own site" narrows nothing.
- Falsifier: a recorded, scoped standing grant for an operator-owned surface would move the
  read part out of asleep-blocked; nothing of the kind exists in the corpus [U3].

**C3 — third-party read-only (operator-asleep-blocked).**
- The lane's approval table already carries the umbrella row (SKILL.md §Approval table), and the
  round-2 note records the anti-claim inside itself (`live-dynamic-capture.md:5-7,216-217`).
- Rights evidence is an absence, not a grant: the corpus holds no measured ToS/robots datum,
  and asserting one is forbidden (SKILL.md §Bounded runs). Default-deny follows.
- Falsifier: a measured, recorded operator go-ahead naming the site + scope converts this class
  to an approved observation task; absent that, it stays blocked.

**C4 — third-party consequential (never lane-executed).**
- The refusal is a province boundary, not a rate/approval gap: `PROVINCE.md:15-19`;
  `MINT.md:19-20`. Refuse-and-route neighbors: RE forensics → revenger/kaidoku; publishing →
  kake; secrets → kagi (`PROVINCE.md:15-17`; SKILL.md §Approval table never-set).
- Falsifier: none that keeps the act inside this lane — a round plan cannot authorize it
  either; only a province amendment (an operator act) changes the boundary.

**C5 — login-required (operator-approval-required).**
- Session-material discipline: cookies / tokens / login state reported shape-only (kind, mode,
  size, mtime); `identity.json` 36 B mode 600 never read; `Cookies` / `Login Data` by size only;
  daemon logs by name/size/mtime only (`browser-surface-census.md:3-8,52-57,140-141`;
  `webbridge-plugin-anatomy.md:154-159`; SKILL.md §Session-material discipline).
- The bridge drives the operator's **real** browser with their login sessions (plugin
  `SKILL.md:4,11`); `find_tab active:true` borrows the operator's viewed tab visibly
  (`borrowed:true`, not moved) (plugin `SKILL.md:38`; `webbridge-plugin-anatomy.md:91-96`;
  SKILL.md §Session-material discipline).
- Where synthetic input is rejected: sites checking `event.isTrusted` ignore `click`/`fill`
  → hand the page back to the user; trusted input exists only via the `cdp` protocol escape
  hatch, which the substrate calls "advanced" (plugin `SKILL.md:146`; SKILL.md §Webbridge,
  §Approval table).
- Falsifier: a page needing neither session material nor authenticated state is C3, not C5 —
  reclassify rather than let C5 absorb all browser work.

**C6 — rate-limited (operator-asleep-blocked).**
- Rate-evidence inventory: the only rate numbers in the corpus are the lane's own method bounds
  (0.85–1.1 s per probe under `timeout 45–180`, SKILL.md §Bounded runs) — not a site rate. Every
  other rate reference is an explicit prohibition to assert (SKILL.md §Bounded runs;
  `corpus/README.md:30`).
- The round plan's anti-claim plus this rule leave no room for a self-assigned budget
  (`plans/round-3.plan.md:8`).
- Falsifier [I, medium]: if a later round measures a third-party rate surface and the operator
  delegates a standing budget, C6's gate collapses into C3's approval; until a datum exists the
  budget stays per-run. A measured 429/`Retry-After` shape is [U1] — never observed on this host.

## 4. Adjacent measured gates (authority at the edges of C1–C6)

| ID | Gate | Disposition | Anchor |
|---|---|---|---|
| **A1** | Daemon `start` when connection-refused | **autonomous-now (doc-authorized self-service)** — executed under a round plan in round 2 | `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md:11-13`; `webbridge-daemon-disposition.md:89-96` |
| **A2** | Daemon `stop` / `restart` / `uninstall` | **operator-approval-required — and the agent never runs it regardless** (approval does not delegate) | `operations.md:26`; plugin `SKILL.md:151`; `webbridge-daemon-disposition.md:161` (D2) |
| **A3** | `/status` probe of a daemon | **autonomous-now (iff)** — only a daemon this task itself started; 8-field shape; an empty `extension_id` is no-value-present, never session material | `webbridge-daemon-disposition.md:122-139` |
| **A4** | Returning an agent-started daemon to baseline | **operator-approval-required** (docs define no TTL/cleanup/scratch mode); the round-2 daemon is still listening today | `webbridge-daemon-disposition.md:56-58,165-169`; live read 2026-10-14T14:41:28Z (`/tmp/tabi-r3-2-spot/spot4-6-state.txt`) |
| **A5** | Trusted input via the `cdp` escape hatch (isTrusted sites) | **operator-approval-required** ("advanced") | plugin `SKILL.md:146`; SKILL.md §Approval table |
| **A6** | Borrowing the operator's viewed tab (`find_tab active:true`) | operator-visible action; borrowed in place, not moved; part of C5 | plugin `SKILL.md:38`; `webbridge-plugin-anatomy.md:91-96` |
| **A7** | Extension/daemon version mismatch | **tell the user, never reconcile** | plugin `SKILL.md:155`; `webbridge-plugin-anatomy.md:124-127`; SKILL.md §Webbridge |
| **A8** | Content in cross-origin iframes | tools act on the top frame only → navigate to the iframe URL instead | plugin `SKILL.md:147`; `webbridge-plugin-anatomy.md:120-122` |
| **A9** | Session-material stores (`Cookies` / `Login Data` / `identity.json` / daemon logs) | **never content-read; shape-only** (kind/mode/size/mtime) — SKILL.md never-set, item 2 | `PROVINCE.md:16-17`; `browser-surface-census.md:3-8,52-57`; `webbridge-plugin-anatomy.md:154-159` |
| **A10** | Out-of-province work (RE forensics / publishing / secrets) | **refuse-and-route** (revenger+kaidoku / kake / kagi) — SKILL.md never-set, item 3 | `PROVINCE.md:15-17`; `MINT.md:19-20` |
| **A11** | Request bodies on Windows | uniquely-named temp file via `curl.exe --data-binary`, deleted after return; never inline/heredoc | plugin `SKILL.md:58-67`; `webbridge-plugin-anatomy.md:97-100` |
| **A12** | Closing tabs / sessions | **user-initiated only** | plugin `SKILL.md:87`; `webbridge-plugin-anatomy.md:101-105` |

## 5. Current state (as recorded / measured 2026-10-14)

- **Operator: asleep** — recorded by the round plans, not probed (`plans/round-2.plan.md:8-9`;
  `plans/round-3.plan.md:8`). No wake-state measurement surface exists, and none is attempted [U2].
- **Round-3 anti-claim in force:** NO external sites — loopback only (`plans/round-3.plan.md:8`).
  Of the six classes, only **C1** is executable this round; C2/C3/C6 hold as blocked; C4/C5 hold
  as operator-gated / never.
- **Local substrate, live read** (this lane, 2026-10-14T14:41:28Z = 11:41:28 -03:00):
  `ss -ltnp` → `LISTEN 127.0.0.1:10086 users:(("kimi-webbridge",pid=3934817,fd=5))` — the
  round-2 state change persists (`webbridge-daemon-disposition.md:165-169`); no chromium process
  observed at that scan; the extension handshake remains unverified (round-2 `/status` said
  `extension_connected:false` — `webbridge-daemon-disposition.md:129-134`).
- Nothing in this table *grants* anything. It records dispositions so the next lane/round starts
  from rights, rate, and consequence rather than from habit.

## 6. Counting (the plan's measure) + source pins

```
grep -c '^| \*\*C' corpus/knowledge/interaction-approval-table.md   → 6   (required classes)
grep -c '^| \*\*A' corpus/knowledge/interaction-approval-table.md   → 12  (adjacent gates)
```

Source pins re-derived from disk this round (`sha256sum`, 2026-10-14): five notes first-12 —
`webbridge-plugin-anatomy.md` `5e0fbe35feea` · `browser-surface-census.md` `70d1d455ee18` ·
`cdp-evidence-patterns.md` `599e7d323c48` · `live-dynamic-capture.md` `56224aa88430` ·
`webbridge-daemon-disposition.md` `9240f1d66a8c` — all match the SKILL.md pin block (§Pins).
Substrate pins unchanged: plugin `SKILL.md` `84a8e69d04c5` (158 lines),
`references/operations.md` `b811d9c23dfd` (34 lines), manifest `e70aff5c40ff`. `SKILL.md`
(the lane playbook, not the plugin file) is pinned in the header (`ea7122d92d7b…`, 432 lines,
2026-10-14T14:48:05Z) — it was mid-edit; a hash change means the §-name refs above must be
re-located by their quoted strings. A hash change in any note means the citations are stale —
re-verify against the note before reuse.

Scratch transcripts (`/tmp/tabi-r3-2-spot/`, 306 lines at write time): `spot1-corpus-pins.txt`
`fd67e6f1c2df…` · `spot2-3-policy-substrate.txt` `b56c3cca998f…` · `spot4-6-state.txt`
`61d6ba4fc904…` · `spot7-anchors.txt` `21c62217ce1a…` · `spot8-final.txt` `2796fddd37c4…` ·
`spot9-verify.txt` `3566c49a0658…` · `spot10-skill-drift.txt` `dfea2da99414…` ·
`spot11-readrift.txt` `686df89a0d5d…` · `spot12-skill-anchors2.txt` `2553320c401a…` ·
`spot13-final-verify.txt` `faa022563df6…` · `spot14-checks.txt` `f1794f41fb17…` (volatile —
archive obligation stands, `cdp-evidence-patterns.md:92`).

## 7. Unknowns (falsifiable — do not convert to claims)

- **U1.** Real third-party rate/ToS surface — C6's deciding evidence is an absence. The first
  measured datum (status-code family, `Retry-After`, robots/ToS text) re-anchors C6 and lands in
  the corpus (SKILL.md §Bounded runs, "record it when measured").
- **U2.** Operator wake-state — not measurable from inside the lane; the asleep record is
  plan-sourced and governs this round.
- **U3.** Ownership verification for C2 — no surface exists in the corpus; a grant must name the
  site, because the lane cannot verify "own".
- **U4.** Whether A5's trusted-input path can be inside this province at all, and under what
  record — unresolved; the substrate calls it advanced; this table sets the approval, not the
  procedure.
- **U5.** Whether operator-owned *local* services belong in C2 or in the A1–A4 specials (the
  daemon is the measured case: local, operator-owned, with a doc-level grant for `start` only) —
  split out here as measured.
- **U6.** Daemon start-authority reading tension (agent-authorized under a round plan vs
  operator-scoped) remains on record unreconciled (`webbridge-plugin-anatomy.md:261-265`;
  `webbridge-daemon-disposition.md:62-68`); it would move A1's bin if the operator-scoped
  reading wins.
- **U7.** Whether a loopback fixture *mirroring a third party's page* (saved HTML of a real site)
  keeps C1's autonomy — the mirror carries the third party's content/rights question; unmeasured,
  so default-deny places such a mirror at C3 until recorded otherwise.
- **U8.** Whether the SKILL.md distillation's final bytes (post-edit) keep the bin assignments
  reproduced in §1a — the file was mid-edit at this note's write time; the §1a reading is pinned
  to sha `ea7122d92d7b…` and must be re-checked against the scribe's committed SKILL.md.

## 8. Errata (append-only — never edit above blocks)

*(none yet)*