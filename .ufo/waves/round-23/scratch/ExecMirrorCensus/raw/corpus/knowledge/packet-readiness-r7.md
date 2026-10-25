<!-- corpus entry — tabi-shokunin round 7 (2026-10-14), lane B7-3 (plan: plans/round-7.plan.md; assignment: the readiness note — the approval packet's evidence classes audited against the current corpus; every claim class checked for an actual landed note; gaps named). Method (read-only; values re-derived 2026-10-14T18:20–18:27Z; post-write re-check E1): the packet read whole; `sha256sum` over `corpus/knowledge/*.md` (14), `SKILL.md`, the substrate trio, the packet; `git show <rev>:<path> | sha256sum` for the pin history (`282fc6d`, `bc4b7d5`, HEAD); per-class claim markers grep-verified against the current revisions; archive spot re-hash (`sha256sum -c MANIFEST.txt` ×3 groups); host reads (`chromium --version`, `pacman -Q chromium`, `ss -ltn`, `pgrep -x kimi-webbridge`, `ls -la ~/.kimi-webbridge/` — shape-only), and a read-only `.ufo/l0-questions.md` read. No browser launched; no external site; no scratch dir written (every command's value is recorded in-place); `identity.json` never content-read. Write scope: this file only — LOG entry (AGENTS.md:3), corpus/README coverage row and the commit are the integrating round's. Audited document: `corpus/handoffs/operator-approval-request.md` — an audit of an anchor document, never of the notes it cites; nothing anywhere was edited. -->

# Packet readiness — the approval packet's evidence classes vs. the corpus at round 7 (B7-3)

## 0. The item under audit, as of this write

| Quantity | Measured @ 18:20–18:25Z | Note |
|---|---|---|
| packet `corpus/handoffs/operator-approval-request.md` | 121 `wc -l` / 122 logical (last line unterminated) / 13,103 B / sha256 `94dc63f5fb9e…` | **byte-identical to its filing** (17:05Z) and to the L0 line's named sha — the packet has never been amended |
| `grep -c '/tmp/'` over the packet | **0** (exit 1) | its §8 scratch check still passes |
| `.ufo/l0-questions.md` (read-only) | 25 lines / 21,539 B / `02c53ec6…` / mtime 14:05:52 -03 / **1** `tabi` region (`:25`, the round-5 filing line, cites the same packet sha) | no answer, no denial, no edit — default-deny holds; ask-count 1 |
| HEAD | `c0467a6` "probation round 6 (training r5)"; `git status --short` → empty | round-6 commit landed 9 files incl. 2 new notes |

**The one-line verdict.** Every claim class the packet's §4 table names is **actually backed by a landed, committed note** — 9/9 classes, each with its claimed capability present in the note at the current revision (markers re-verified below). What is **not** currently backed is the packet's *anchor layer*: **9/9 note pins it cites no longer resolve**, and its own cold-read falsifier (§6) has still never been executed. The class→note binding is intact; the pin→bytes binding has lapsed; name both, repair neither here.

## 1. The class table — audited against the corpus at HEAD `c0467a6`

Claim markers re-verified by grep at the current revision; pins are sha256 first-12.

| # | Class (packet §4) | Note it cites | Landed + committed? | Claim marker, re-verified at current revision | Packet pin → current pin |
|---|---|---|---|---|---|
| 1 | static bytes | `cdp-evidence-patterns.md` | yes (r1, HEAD) | §5's 9 re-verifiability rules present, `:84-92`; class ids E1–E11 all occur | `8de2ee008c9c` → **`337ff64579e8`** |
| 2 | dynamic pair | `live-dynamic-capture.md` | yes (r2, HEAD) | byte-identical methodology + det-before pin `c08947dc…802dc1` (`:1`, `:145`); host-scoping limit item 3 (`:207`) | `f97c10238907` → **`01266495b761`** |
| 3 | multi-step journey | `multi-step-journey.md` | yes (r3, HEAD) | real clicks + `insertText` (`:34`); per-step triplets (`:237`); history-witness rule; GET-submit boundary (`:224`) | `8925ce6c46c7` → **`e0367890f1cf`** |
| 4 | network rung | `network-evidence-rung.md` | yes (r4, HEAD) | surface model `:16-24` ("four correlated surfaces plus a file-side third party" — the packet's "five" counts the file-side source in); D1–D8 (`:244`–`:320`); closure rule (`:188`); fixture+server embedded §11 (`:438`) | `4889ccf073a8` → **`d1564f38dc14`** |
| 5 | async pair | `async-step-evidence.md` | yes (r4, HEAD) | request held at the protocol layer (CDP Fetch) (`:1`, `:64-68`); settle-wait discipline (`:132-147`) | `577af06bd9a8` → **`05dcda5e60b9`** |
| 6 | approval taxonomy | `interaction-approval-table.md` | yes (r3, HEAD) | 6 `C`-rows + 12 `A`-rows (`grep -c` → 6 / 12); U1 still the rate absence (`:191`) | `d6ad567a610c` → **`b5e29a9a2adf`** |
| 7 | no-oral-context sufficiency | `executor-test-sufficiency.md` | yes (r3, HEAD) | verdict **SUFFICIENT** with per-step table (`:57` ff.) | `5f04f6877e1e` → **`32772e343848`** |
| 8 | hygiene / closure | `hygiene-sweep-r4.md` | yes (r4, HEAD) | closure rows (`:55`), SC4 (`:176`), closure-coverage gap closed E3 (`:195`) | `4ddc67151b98` → **`87155e12021d`** |
| 9 | runtime + substrate pins | `browser-surface-census.md` + substrate | yes (r1, HEAD) + substrate present | chromium row `:19`; **chromium re-measured now**: `chromium --version` → `152.0.7977.82`, `pacman -Q` → `152.0.7977.82-1` — holds; substrate trio re-derived: `e70aff5c40ff` / `84a8e69d04c5` (158) / `b811d9c23dfd` (34) — **all 3 hold** | census `a4bbb39edb12` → **`a33c22644d64`**; substrate 3/3 **HOLD** |

All 14 notes under `corpus/knowledge/` are tracked at HEAD (`git ls-files` → 14/14; `git status` clean). Every class's capture bytes are in the archive (mapping in §3). **Verdict: 9/9 classes SUPPORTED; 9/9 note pins STALE; 3/3 substrate pins HOLD.**

## 2. Pin provenance — why every cited note pin moved, and what resolves now

[observation] The packet's nine note pins equal the **r4-commit (`282fc6d`) blob values** — re-derived here by `git show 282fc6d:corpus/knowledge/<note>.md | sha256sum` for all nine: 9/9 match. They were therefore correct at filing (17:05Z).

[observation] The round-5 pin-refresh wave (SKILL.md:775 records it: derivation 17:01–17:06Z, note appends 17:07–17:10Z; pre-append SKILL hash `1e2f87caddff`) appended to all 11 notes **two to five minutes after the packet was filed**; the current bytes are the post-append state (git blob at `bc4b7d5`+ = working tree = my re-derivation, 11/11 equal to the SKILL.md:778-794 list).

[observation] The packet points at `SKILL.md:37-66` for "full values and the §Pins table" — that pointer resolves to the main §Pins block, **which is stale the same way** (it still carries the pre-append values). The refreshed authority is the `## Errata — §Pins refresh` block at `SKILL.md:773-795` (naturally: SKILL.md itself is now 795 `wc -l` / `a8ba10b86138…`, not the 765-line revision the round-7 plan froze at 17:41:44Z).

[inference] Nothing here is a defect in the notes (each moved by declared append-only errata) nor a mis-spelling at filing — the packet cites what was true when it was written. But as a *self-verifying document* it is now stale on the note rows: the packet's §8 check "`sha256sum corpus/knowledge/*.md | cut -c1-12` → the §4 pins" resolves for **0 of 9** note rows today (substrate 3/3 still resolve). [inference] Before a grant acts on this packet, its pin block wants an append-only erratum (or a re-filed revision, which per the packet's own §6 takes a new hash and a new L0 line) — a decision for the owning record, not taken here.

**Re-bound pins (the values to cite as of this write; all 14 re-derived, 14/14):** `archive-receipt-r5` `b41c2f6fb5a4` · `async-step-evidence` `05dcda5e60b9` · `browser-surface-census` `a33c22644d64` · `cdp-evidence-patterns` `337ff64579e8` · `executor-test-sufficiency` `32772e343848` · `external-class-fixture-v2` `4aa604f1788b` · `hygiene-sweep-r4` `87155e12021d` · `interaction-approval-table` `b5e29a9a2adf` · `live-dynamic-capture` `01266495b761` · `multi-step-journey` `e0367890f1cf` · `network-evidence-rung` `d1564f38dc14` · `webbridge-daemon-disposition` `fd5f6861aa3b` · `webbridge-plugin-anatomy` `8d1488ab763e` · `webbridge-revival-assessment` `a07c8aedc161`.

## 3. The durability clause (§4) — landed since filing

[observation] The packet says the classes' artifact groups were "being archived this round" and that "at filing … no per-group manifest had landed yet". Superseded: `corpus/evidence/` now holds **25 group dirs / 25 `MANIFEST.txt` / 1,035 files**; the authoritative index is the now-landed `archive-receipt-r5.md` (`b41c2f6fb5a4`; 1,010 evidence files / 6,780,293 B + 25 manifests).

[observation] **Spot re-hash (3/25 groups, same three as AUD-B5/r6 for comparability):** `sha256sum -c MANIFEST.txt` in `tabi-r2-2-state` → 6/6 OK; `tabi-r3-1-journey` → 63/63 OK; `w4-t41-network` → 200/200 OK — **269/269 OK, 0 FAILED, exit 0 each** (the shell's closing exit 1 was the `grep -c FAILED` finding zero lines, not a hash failure).

[observation] Every class row in §1 maps onto archived groups: static bytes → `tabi3-cdp`, `tabi-audit2-cdp`, `w4-aud-tab1`; dynamic pair → `tabi-r2-1-capture`; journey → `tabi-r3-1-journey`, `tabi-b1-r3b-journey`; rung → `tabi-r4-1-network`, `w4-t41-network`; async → `tabi-r4-2-async`, `w4-t4-2-async`; approval → `tabi-r3-2-spot`; executor → `tabi-r3-4-work`, `tabi-r3-3-smoke`; hygiene → `tabi-r4-3-sweep`, `w4-t4-3-sweep`, `w4-erb-b-sweep`.

[observation] Carried, unarchived: F1 (the stale in-group `methodology-sha.txt`, kept) and F3 (round-5 peer groups) from the receipt; **round-6 bytes are `/tmp`-only** — `/tmp/w6-tabi-b61` (37 MB), `/tmp/w6-tabi-b62`, `/tmp/w6-aud-b6-scratch`, `/tmp/w5-tabi-b53` all still exist today, so `external-class-fixture-v2.md` and `webbridge-revival-assessment.md` hashes remain provisional (`cdp-evidence-patterns.md:92`). [inference, medium] A next archive pass is the precondition for the two round-6 notes' pins to graduate from provisional.

## 4. The packet's own "honest gaps" (§4, last paragraph) — re-measured

| Gap as filed | Status @ 18:2xZ | Evidence |
|---|---|---|
| **zero real-site datum** | **STANDS** — and it is the *only* class in §4/§5 with no landing: `ls corpus/knowledge/ \| grep -i 'real\|observation'` → no match (rc=1). By construction (default-deny; no grant) | §1 above |
| **rate/ToS unmeasured (U1)** | **STANDS for real surfaces; the loopback half is new.** Round 6 landed `external-class-fixture-v2.md` (four rate/ToS-shaped instruments: robots-shaped body, 429+`Retry-After`, 403, CAPTCHA-shaped 200) and wrote the boundary in: "a loopback 429 is an instrument, never a C6 datum" (§8); AUD-B6 re-ran one 429 interaction with PASS. U1 itself (`interaction-approval-table.md:191`) is still an absence | v2 §5, §8; `reports/r6-aud-b6.md` §1 |
| **extension↔daemon handshake never verified** | **STANDS** — still never observed up. Four `/status` samples on record, all `extension_connected:false` (`webbridge-revival-assessment.md` §5, citing disposition `:128-134` + hygiene `:97-99`); the enabling state (operator chromium + extension `2.0.23`, daemon down) is measured; the decisive experiment (t≈0/+30 s/+5 min) is named and deferred | revival assessment §5 |
| **byte-identity is environment-scoped** | **STANDS** as written (`live-dynamic-capture.md` §7 item 3 `:207`; `network-evidence-rung.md` §10 item 8 `:434`) | notes |
| **POST forms, redirects with bodies, CSRF-checked submits untested by rule** | **NARROWED at round 6.** Redirects-with-bodies are now measured on loopback: 302→303→307 chain incl. cross-path hop and origin change `127.0.0.1:19541`→`19543`, plus a POST arm (`/m/307`), all three layers reconciled (`external-class-fixture-v2.md` §4). **Still open:** POST form submit with a request body, a CSRF-shaped token minted/consumed once, and the non-idempotent replay contract — the round-6 L1 matrix (the state-changing step) did not land (round-6 record draft §3 L1a, E3), and round-7's plan makes it its carried debt | v2 §4; plan r7 §Branch L; round-6 draft |

[observation] The packet's §1 bridge read ("not even currently executable") still holds: `ss -ltn` → 0 listeners on 10086; `pgrep -x kimi-webbridge` → none; `~/.kimi-webbridge/` shape: `daemon.pid` 8 B, `daemon.addr` 16 B, mtime 10:46 — the recorded post-shutdown pattern (`webbridge-daemon-disposition.md` §10).

## 5. The packet's own falsifier (§6 cold reader) — still unexecuted

[observation] No cold-read verdict artifact exists anywhere in the lane at HEAD. Measured: `grep -rn -i 'cold.read\|cold reader' --include='*.md'` over the lane (minus `.git`) → **16 hits in 6 files** once this note's own mentions are excluded (`… | grep -v packet-readiness-r7 | wc -l` → 16), none of them a verdict — the packet's own 5 (its §4 row `:80`, §5 product `:90`, §6 heading and body `:92-100`, unknowns `:120`); `corpus/lessons/round-5.md` `:4`, `:33`, `:101` ("DEBT carried into round 6"), `:134`; `plans/round-5-record-draft.md` `:47`, `:75` (d4, **NOT LANDED**), `:315` ("no cold-read *verdict* artifact exists yet"); `plans/round-6.plan.md` `:78`, `:196` (unknown); `plans/round-6-record-draft.md:99` (DEBT); `LOG.md:132`. `grep … reports/` → 0 hits. A `/tmp` sweep (`/tmp/w5-* /tmp/w6-*`) found only the round-5 design copy, not a verdict.

[observation] Consequences, both mechanical: (1) the packet's status line "[unknown — not yet executed at filing time; scheduled on this round's non-author verification seat]" is still literally true two rounds later — the scheduled seat never produced the artifact; (2) per the packet's own §6 rule, a follow-up question from a cold reader is a recorded gap requiring amendment *before* the L0 hash is treated as final — but the test has never run, so the packet's hash `94dc63f5…` has never been through its own gate. **This is the sharpest readiness gap: the packet is filed but never falsified by cold read.** Carried into round 7; not acted on here (write scope).

## 6. Filing checks re-run (§8) — deltas only

| Packet §8 check | At filing | Now |
|---|---|---|
| `ls corpus/knowledge/*.md \| wc -l` | 11 | **14** (receipt + 2 r6 notes) |
| `sha256sum corpus/knowledge/*.md \| cut -c1-12` → §4 pins | matched | **0/9 note rows resolve** (§2); substrate 3/3 resolve |
| substrate trio | `e70aff5c40ff` / `84a8e69d04c5` / `b811d9c23dfd` | **unchanged, 3/3 re-derived** |
| packet sha == L0 line's sha | yes | **yes** (`94dc63f5…`, unchanged) |
| `grep -c '/tmp/'` over packet | 0 | **0** (exit 1) |
| daemon recheck before bridge work | no listener, refused | **no listener; no process; stale pointers** |

## 7. Added since filing — three notes the class table cannot cite

The packet predates (cannot be faulted for, but a revision would want): **`archive-receipt-r5.md`** (the archive authority the Durability clause points at unnamed), **`external-class-fixture-v2.md`** (loopback instruments + the stop-and-report predicate, proved from both sides), **`webbridge-revival-assessment.md`** (the bridge precondition surface + the handshake experiment). Together with the re-binds in §2, a re-issued packet would carry 12 class rows and a five-round pin set. [inference] Re-filing is only owed if the lane wants the packet self-verifying again before an answer arrives; recorded, not acted (write scope; the packet's §7 re-ask rule reserves re-filing for a materially changed ask).

## 8. Readiness statement (what a grant would build on today)

- **Backed:** all nine §4 classes, 9/9 — landed, committed notes; capture bytes archived with 25/25 manifests and a 269/269 spot re-hash; the procedure a granted R1 would run (stop-and-report, three-rung capture, closure) has a rehearsal and an independent audit on loopback.
- **Not backed:** (a) the packet's note-pin block (9/9 stale, re-bound here); (b) the §6 cold-read verdict (never executed, DEBT since round 5); (c) the §5 product note `real-site-observation-<host>.md` — absent by construction until an answer; (d) the POST-body/CSRF/non-idempotent-replay class (round-6 debt carried into round 7).
- **Unmoved:** the daemon/handshake surface; the answer channel (L0 unchanged; ask-count 1; silence is not a denial).

## Spot-checks (all by this lane, read-only; non-author of every artifact checked)

- **SC1 — pin re-derivation:** 14 notes + SKILL.md (`a8ba10b86138…`, 795 lines) + packet + substrate trio, 18:20–18:25Z; all values in §1–§2.
- **SC2 — git provenance:** `git show 282fc6d:<note> | sha256sum` → 9/9 equal the packet's pins; `git show bc4b7d5:<note>` → 9/9 equal the current bytes. The staleness is dated, not asserted.
- **SC3 — archive spot re-hash:** 3 groups, 269/269 OK, 0 FAILED (§3), same groups as AUD-B5/r6.
- **SC4 — class markers:** per-row greps in §1 (E-classes, `insertText`, D1–D8, Fetch hold, 6/12 rows, SUFFICIENT, closure rows, chromium).
- **SC5 — negative controls:** no `real-site-observation-*` note (rc=1); packet `/tmp` count 0; L0 byte-identical to the round-6 record's four-read state and still one `tabi` region.
- **SC6 — host reads:** chromium `152.0.7977.82-1`; no 10086 listener; no webbridge process; `~/.kimi-webbridge/` shape-only.

## Unknowns (falsifiable)

- **U1.** Whether the packet gets an append-only pin erratum or a re-filed revision before an answer arrives (a record/operator decision; this note supplies the re-bound values either way).
- **U2.** Whether the round-6 `/tmp` groups (and the round-5 peers, F3) get archived before the next pin pass; until then their notes' pins are provisional.
- **U3.** Whether a cold-read verdict exists outside this repo's tree (only the lane tree + `/tmp/w5-*/w6-*` were swept; nothing found).
- **U4.** Whether the runtime/daemon state in §1/§4 still holds at answer time — every pin here is point-in-time and must be re-derived before an act.
- **U5.** Whether the packet's `SKILL.md:37-66` pointer is ever repaired; it resolves to the superseded block (§2).

## Errata (append-only — never edit above; append dated blocks below)

- (none yet)

### E1 — 2026-10-14T18:27Z, by B7-3 (post-write re-check; concurrent landings observed inside the write window)

- **Fingerprint immediately before this block:** 113 `wc -l` / 17,988 B / sha256 first-16 `95bcdcd40f34f4c1` (the stamp correction above preceded it; this append moves the hash by construction — re-derive with `sha256sum`).
- **The archive grew mid-check: 25 → 28 groups / 1,035 → 1,403 files.** New: `w6-tabi-b61` (140 files), `w6-aud-b6-scratch` (40), `w6-ver-b6` (188) — each with `MANIFEST.txt` present at read; the smallest re-checked **39/39 OK, 0 FAILED, exit 0** (18:27:24Z). Concurrent round-7 archive seat — treat as in-flight until its receipt lands. This supersedes §3's "round-6 bytes are `/tmp`-only" for the fixture and audit byte sets; `w6-tabi-b62` (revival-assessment scratch) had **no** group at this read, so `webbridge-revival-assessment.md`'s pins stay provisional.
- **SKILL.md moved again while this note was being written:** `a8ba10b86138…` / 795 `wc -l` (the value in §2 and SC1) → **`c0d2629ecbfb…` / 829** (concurrent round-7 distillation). All SKILL line refs in this note are as-of-write; re-derive before citing.
- **A 15th knowledge note landed (untracked):** `layer-routing-synthesis.md` (25,945 B, mtime 15:26). §6's "14" is the HEAD-tracked count; an uncommitted-tree re-run of `ls corpus/knowledge/*.md | wc -l` reads 15.
- **Cold-read re-run moved 16 → 20 hits** — the delta is `plans/round-8.plan.md` (4 hits; a concurrent design lane listing the packet cold-read verdict as still `[unknown]`/owed, not as a verdict). No verdict artifact exists at this read either.
- No §1 class verdict changes: the packet's classes remain backed by the committed notes, and the §2 re-bound pins remain the HEAD-committed values.