# ConnSiblings — sibling-overlap scan (tabi round 16, wave 1)

Seat `TabiR16.ConnSiblings-5`. Read-only leaf: no delegation, no commits, no gates/selftests/counters, no browser, no installs.
Anchors are fleet-root-relative (`<lane>-shokunin/...`). Everything below was opened this session.

## 1. Coverage and method (exact commands, observed output)

- Fleet lanes: `ls -d /home/vgpnk/Projects/shokunin/*-shokunin/` → **21** directories.
- **All 21 `PROVINCE.md` read in full** (audio, chousa, game-dev-2d, game-dev-3d, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, kotodama, kumitate, lore, mado, mori, revenger, souji, tabi, tameshi, tsukuroi).
- `SKILL.md` exists in **18/21**. Absent in `audio-shokunin`, `game-dev-2d-shokunin`, `revenger-shokunin`; for those, `ls -1 <lane> | grep -iE '^(SKILL|MINT|PROVINCE|AGENTS)'` returns `PROVINCE.md` only, so the province is the sole instruction surface and was read.
- Assignment keyword grep over lane instruction surfaces (case-insensitive):

```
cd /home/vgpnk/Projects/shokunin
grep -rIlniE 'webmcp|modelcontext|measurement[-_ ]binding|counter[_ -]digest|delivered head' \
  --include='SKILL.md' --include='PROVINCE.md' .
```
Observed: exactly one hit —
`./tabi-shokunin/corpus/evidence/round-13/aria/node_modules/playwright-core/lib/tools/skills/playwright-cli/SKILL.md`.
That is a **vendored Playwright CLI skill inside tabi's frozen round-13 evidence tree**, not a lane instruction surface.

- Per-lane counts (`grep -ciE 'webmcp|modelcontext'`): **`skill=0 province=0` for all 21 lanes**, tabi included. The binding terms are likewise zero in every lane's `PROVINCE.md`/`SKILL.md`.
- Wider instruction-bearing files (`MINT.md`, lane `corpus/README.md`, `README.md`): only tabi's own rows and the two false positives in §2.
- Existing binding-gate implementations fleet-wide:

```
grep -rIlE 'measurement[-_]binding|counter_digest|check-measurement-binding' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.ufo .
→ (no output)
ls -1 tabi-shokunin/scripts/ | grep -i measurement  → rc=1 (not built yet)
```
The only `measurement-binding`/`counter_digest` hits anywhere are tabi round-16 planning files (`.ufo/waves/round-16/PLAN.md`, `w1/*`, `drafts/*`). **No sibling lane owns or implements this mechanism.**

## 2. Literal result: no sibling keyword claim; three collisions are false positives

| Hit | Why it is not overlap |
|---|---|
| `game-dev-3d-shokunin/corpus/knowledge/unreal-mcp/upstream/README.md:17-18,62,70-76` | Unreal Engine's **`ModelContextProtocol`** plugin (MCP server in the editor). Substring collision on case-insensitive `modelcontext`; not WebMCP, not a browser. |
| `kama-shokunin/.ufo/waves/round-16/sources/llama.cpp-704366d/README.md:392` | Vendored upstream llama.cpp README linking `modelcontextprotocol.io`. Evidence copy, not lane scope. |
| `tabi-shokunin/corpus/evidence/round-13/aria/node_modules/.../playwright-cli/SKILL.md` | Vendored node_modules inside tabi's own frozen evidence. |

Tabi-owned positives (for completeness): `tabi-shokunin/corpus/README.md:35,181,194,216,283-284` (WebMCP frontier rows, all "open/unprobed", naming chromium **152**) and `tabi-shokunin/MINT.md:10-12` (kaidoku r10-11 brushed WebMCP discovery through REA CDP; "web-interaction craft absorbed piecemeal by the wrong province").

**Load-bearing inference:** absence of the words is *not* absence of ownership. Thirteen lanes appear in §3–§4 as semantic neighbours without a single literal keyword hit. A claim like "no sibling claims WebMCP" that rests on this grep would be false; it must be sourced to province semantics, as `w1/DraftAdjacency.md:35-51` (C-A…C-I) already does for C2.

## 3. C1 (measurement identity) — semantic overlaps and verdicts

| Lane | Anchor (opened) | What it actually owns | Overlap with C1 | tabi verdict |
|---|---|---|---|---|
| tameshi | `tameshi-shokunin/PROVINCE.md:14-17`; `SKILL.md:1545-1546` | Verification-fixture **craft**; "every lane's gate remains its own"; a pattern is admitted only from evidence in **two** lanes; "A non-author closure verifies committed receipts and their measured revision." | Method and receipt-reading discipline, not tabi's gate | **Report** (candidate pattern; one lane cannot claim it general). Never edit or invoke a sibling gate. |
| kengaku | `kengaku-shokunin/PROVINCE.md:87-89`; `:135` | A "closeout carry-over gate should require commit + LOG + SCORECARD + index parity" — explicitly **referred to protocol/aggregator, "not imposed"** | Same defect class as r15 routed defect 2 (report measured `b7cf044`, delivered `36240c7`) | **Report** via the protocol/aggregator route. Do not absorb; do not become that gate. |
| souji | `souji-shokunin/PROVINCE.md:24,78-80`; `corpus/README.md:124` | `pushed` receipt checks; "Evidence-integrity checking is limited to souji's own receipt/certification fragments; it does not become fleet orchestration or an independent promotion authority"; reproduce old counting commands at their cited measured revision | Receipt identity, but self-scoped | **Report**; C1 must never be framed as a fleet certifier. |
| kama | `corpus/lessons/round-13-verifier-spotcheck.md:27-31`; `round-14-verifier-spotcheck.md:20-23`; `.ufo/waves/round-14/advice/EvidenceScribe.md:136-138` | Three-part revision vocabulary: round start / author-delivered HEAD / author measurement revision, and "record `start_commit`, `measured_commit` and any later `verifier_commit` separately"; "All round comparisons below end at the author-delivered revision, not at the later verifier commit." | Prior art for exactly the C1 receipt fields | **Report** (vocabulary alignment, no ownership transfer). |
| kaidoku | `kaidoku-shokunin/SKILL.md:285` | "Land the dependency set in one commit, then rerun the named acceptance check against that commit and record the measured revision." | Same convention, lane-local | **Report** (agreeing precedent). |
| kotoba | `kotoba-shokunin/SKILL.md:481-482`; `.ufo/round-21/scouts/G5.md:282-284`; `.ufo/round-20/acceptance-results.json:9,21,36,51` | Records `measuredRevision` per acceptance command; rejected a check designed as "revision pins: digests are not commits"; classifies measured-revision-behind-HEAD as **"a scope note, not a defect"** | Directly adjacent and **normatively contradictory** — §5 | **Report**; do not absorb or overrule. |
| mori | `mori-shokunin/PROVINCE.md:55,73` | "counter" = cumulative kernel/PSI counters ("cumulative stall time", `memory.events`); FR9 requires a reproducible generator + digest for replay claims | Word collision only; different object | **Report** as a wording hazard: C1's "counter" is a count field, not a runtime metric. |
| chousa | `chousa-shokunin/PROVINCE.md:5-8` | Research method: question framing, source hierarchy, citation chaining, claim-vs-source | The C1 lesson's source rows apply this method | **Apply, never restate** (souji's `PROVINCE.md:65-66` precedent). |
| fleet ledger | `MANIFEST.json:8177`; precedent `MANIFEST.json:7122` | The routed r15 defects themselves ("record per-claim counter digest … measure at or diff to delivered HEAD") and kama's "Author delivered HEAD … report committed by kama at …" | Source of the requirement | **Report evidence only**; no MANIFEST edit. |

## 4. C2 (native WebMCP) — semantic overlaps and verdicts

| Lane | Anchor (opened) | What it owns | Overlap with C2 | tabi verdict |
|---|---|---|---|---|
| tabi (own) | `tabi-shokunin/PROVINCE.md:6-13`; `:15-19` | CDP session discipline, browser inventory/profiles, dynamic-page evidence patterns; refuses RE-as-forensics and publishing | The observing question | **Absorb** — the only lane that owns it. |
| kaidoku | `kaidoku-shokunin/PROVINCE.md:53` | REA "Runtime observation (CDP)" Core row (`inspect-web-page`, `observe-web-session`, `observe-web-execution`, `capture-browser-scenario`); the REA catalog already has `discover_webmcp_tools` (exercised `tools:{total:0}` per `w1/DraftAdjacency.md:21` citing kaidoku corpus `:608`) | Same CDP surface, different purpose (shipped-artifact RE) | **Report** the split: tabi owns the protocol-level method + its own receipt; kaidoku owns the REA verb. Do not absorb; do not use REA MCP this round. |
| revenger | `revenger-shokunin/PROVINCE.md:3-7` ("browser/Electron runtime evidence") | RE of shipped artifacts | Browser-runtime evidence class | **Report** boundary; no absorb. |
| kumitate | `kumitate-shokunin/PROVINCE.md:20` (MCP revisions "as they bear on orchestration — queued"); `:26` (MCP/OAuth → kasegi/kagi); `:8-15` Core block, `:14` Kimi substrate K1–K5 | Orchestration semantics and the `~/.kimi-code/` census | WebMCP is MCP-family; agent-side consumption is orchestration | **Report**; tabi makes no orchestration or MCP-conformance claim. |
| kake | `kake-shokunin/PROVINCE.md:3,30-31,34-35` | "tabi drives browsers and owns client-side crawler discipline; kake owns publisher-side placement"; own properties only; musketeer profile/CDP 9222 contested | Declarative `toolname` forms are **publisher-authored** markup | **Report**; C2's loopback fixtures are not web properties; keep temp profile on `127.0.0.1:0`. |
| kasegi | `kasegi-shokunin/PROVINCE.md:3` | Bounty/security research incl. prompt injection; live-target testing refused | Trust of page-declared tool metadata | **Report**; tabi records provenance ("page-declared, untrusted") only, no security verdict. |
| chousa | `chousa-shokunin/PROVINCE.md:5-8` | Source hierarchy and claim-vs-source | S020/S002/new primary rows | **Apply** the method; rows stay tabi's. |
| tsukuroi | `tsukuroi-shokunin/PROVINCE.md:8-14,27` | pacman/package state; never installs/upgrades | Chromium version pin (152 in README vs 154 on host) | **Report** the version-pin drift to L1 (already drafted at `w1/DraftLesson.md:13`); no package action. |
| tameshi | `tameshi-shokunin/PROVINCE.md:14-17` | Harness method | C2 harness craft | **Report**; no transfer. |
| game-dev-3d | `corpus/knowledge/unreal-mcp/...` | Unreal MCP plugin | None (false positive) | **Ignore**; never cite as WebMCP overlap. |

## 5. Contradictions (stated, not smoothed)

1. **Behind-HEAD is a defect in tabi, a scope note in kotoba.** `tabi-shokunin/corpus/lessons/round-15-verifier-spotcheck.md:121` routes "report measured at `b7cf044`, not delivered `36240c7`" as a defect; `kotoba-shokunin/.ufo/round-21/scouts/G5.md:282-284` records the same class as "a scope note, not a defect". Both are lane-local norms. Neither is a fleet rule, and tabi's gate must not silently become one.
2. **Digest vs commit.** kotoba rejected a check designed as "revision pins: digests are not commits" (`SKILL.md:482`). Tabi's manifest records a blob digest **and** a measured revision, plus ancestry. Compatible only if the digest never substitutes for a revision — the C1 note must say so explicitly, or it repeats the rejected shape under a new name.
3. **No lane owns a fleet measurement/closeout gate.** kengaku referred it to protocol/aggregator and did not impose it (`PROVINCE.md:87-89,135`); souji limits evidence integrity to its own fragments (`:78-80`); tameshi refuses sibling gates and requires two-lane evidence to generalize (`:14-17`). Therefore C1 is a **tabi-local contract**; any fleet claim needs a protocol/operator ruling.
4. **Keyword scan ≠ ownership.** Zero literal hits in 21 provinces and 18 skills, yet thirteen semantic neighbours appear in §3–§4. The method caveat is load-bearing for any "no overlap" sentence in the round note.

## 6. Report vs absorb — one-line verdicts

- **Absorb:** only the browser-observation method itself (`tabi-shokunin/PROVINCE.md:6-13`); C2 harness + receipt; C1 gate as tabi's own contract.
- **Report:** C2 boundary split (kaidoku / revenger / kumitate / kake / kasegi), source method (chousa), Chromium package pin (tsukuroi); C1 prior art and revision vocabulary (kama / kaidoku / kotoba), craft admission (tameshi), fleet closeout route (kengaku → protocol/aggregator).
- **Never:** claim a fleet measurement gate; invoke REA MCP; treat Unreal's `ModelContextProtocol` as WebMCP; restate chousa's method as tabi's.

## 7. One bounded proposal (connector)

**Axes named:** A1 adjacency (declared scalar), A2 operability (C1), A3 quality/discernment. Coverage (C2) untouched; no scalar is re-scored.

**Evidence.** The drafted C1 rule is absolute: "A revision-only pin or a measurement taken at an older revision is not admissible" (`w1/DraftQuality.md:2-4`). Read fleet-wide, it contradicts kotoba's recorded classification of the identical situation (`G5.md:282-284`) and implicitly takes the closeout gate that kengaku routed to protocol/aggregator and explicitly did not impose (`PROVINCE.md:87-89,135`). Tameshi's admission rule (two independent lanes) forbids calling a one-lane pattern general (`PROVINCE.md:14-16`).

**Move (one).** Add a single boundary clause to the C1 note/lesson and to QUALITY criterion 22: the binding rule is **tabi-lane-local**; measured-behind-HEAD remains a `counted_input_changed` finding only when counted inputs or the counter blob actually differ; fleet closeout parity is **referred, not owned** (cite kengaku `:87-89,135`), and the digest is always paired with a revision, never a substitute (cite kotoba `SKILL.md:482`). Keep every hard failure inside tabi unchanged (`counter_digest_mismatch`, `counter_changed_since_measurement`, `counted_input_changed`, `count_not_reproduced`).

**Why non-obvious.** It is a synthesis of four sibling surfaces that no current wave draft joins: tabi's gate, kotoba's contradictory norm, kengaku's referred-not-imposed route, and tameshi's two-lane admission. It prevents an implicit fleet claim without weakening C1's own falsifiers.

**Risks.** (i) Prose bloat — bound it to one clause + one decision-table row. (ii) Could be misread as weakening C1 — the gate's failure set is unchanged; only the *scope* sentence changes. (iii) If L1 wants a fleet-wide rule, this move forces an explicit L0/protocol route instead of an implicit one; that is a cost only if L1 intended the wider claim, which no evidence supports.

**Verification (unrun by this seat; owner/L1 or BindCore):**

```
grep -n 'lane-local' tabi-shokunin/corpus/QUALITY.md tabi-shokunin/corpus/knowledge/*round-16*.md
grep -n 'not admissible' tabi-shokunin/corpus/QUALITY.md        # qualifier present for tabi claims
grep -rn 'fleet' tabi-shokunin/corpus/QUALITY.md                # no fleet-wide enforcement phrase
node .ufo/waves/round-16/measure.mjs <REV> --claim C1           # unchanged by prose
```
Expected: qualifier present; no fleet-enforcement phrase; C1 count still depends only on committed `binding/selftest.json` + `binding/legacy-r15.json` + `gateSha256` (PLAN C1 counter), so a documentation-only edit cannot move the count.

## 8. Limits

- Ran no gate, selftest, counter or browser (not authorized for this seat); no URL opened; no source row created.
- `PROVINCE.md`/`SKILL.md` are declarations, not live behavior; a lane can act outside them.
- Three lanes have no `SKILL.md`; their province is the only instruction surface read.
- The scan greps instruction surfaces, not every corpus file; wider greps are quoted where used and are not exhaustive of hidden evidence trees (node_modules excluded).
- Matching is case-insensitive substring; `modelcontext` collides with Unreal's `ModelContextProtocol`.
- Nothing installed or upgraded (tooling directive: not needed).
