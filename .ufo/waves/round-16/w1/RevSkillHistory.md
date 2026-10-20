# RevSkillHistory — round-16 SKILL append rules and WebMCP-contradicted text

Seat: `TabiR16.RevSkillHistory-5`. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scope: SKILL.md append-only conventions (no edits above, errata blocks, registry overrides),
exact rules for the round-16 append, and every SKILL/README/corpus line the planned WebMCP
note would contradict. Author-side advice; no gate, selftest, counter, harness or browser was
run by this seat. No file written except this report. No tool installed or upgraded.

## 0. Baseline observed this session (2026-10-20, lane root)

| Fact | Command | Observed |
|---|---|---|
| HEAD | `git rev-parse HEAD` | `e38d2599a922cb729186353830fff8e159b4fef0` |
| SKILL worktree identity | `sha256sum SKILL.md`; `git cat-file -p HEAD:SKILL.md \| sha256sum` | both `c5ed309e7342e503689ceddd1c21c7fe50afa0961081a9cf68ec93be7b41724f`; blob `fdc17e44d5ec2afd48bad6f0e47ce1b5f0b20137` |
| SKILL size | `wc -l SKILL.md`; `grep -c '' SKILL.md` | `1828` / `1829` (EOF unterminated) |
| EOF byte | `tail -c 1 SKILL.md \| od -An -c` | `.` — the last line “Round15 command receipts record the exact minimal environment policy.” has **no** trailing newline |
| Worktree | `git status --porcelain` | only `?? .ufo/waves/round-16/`, `?? corpus/evidence/round-16/`; SKILL.md clean |
| Host chromium | `/usr/bin/chromium --version`; `file /usr/bin/chromium`; `sha256sum /usr/bin/chromium`; `pacman -Qo /usr/bin/chromium` | `Chromium 154.0.8037.97 Arch Linux`; ELF 64-bit PIE (not a wrapper script); `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`; owned by `chromium 154.0.8037.97-1` |
| Node | `node --version` | `v24.21.0` (SKILL:103 minimum ≥21 holds) |

## 1. What mechanically enforces “no edits above”

`scripts/check-freshness.mjs` is the only gate that checks SKILL.md, and it enforces a
byte-prefix append, not a line-range convention:

- `scripts/check-freshness.mjs:94-101`: `original` = SKILL blob at the pinned baseline;
  `bytes = current.subarray(0, original.length)`; `if (!bytes.equals(original)) fail('content_drift')`;
  `if (target === 'SKILL.md' && current.length <= original.length) fail('witness_append', 'Dated SKILL append absent')`.
- Pin row `corpus/evidence/fleet-round-1-freshness/pins.tsv:32`:
  `MATCH  SKILL.md  f4d9cf5b1aa5711948a4f86cf111b0560b39f4df76ed504cbe4559e7e4c9acfe  1458  f4d9cf5b1aa5  c24eaea14dfc0c4a3848742d31673db5675f9183:SCORECARD.md:15-15  …  pre-append@c24eaea14dfc0c4a3848742d31673db5675f9183`.
- Consequence: the first `original.length` bytes of SKILL.md must stay byte-identical to the
  `c24eaea14dfc` blob, and the file must be strictly longer. Adding one `\n` at byte offset
  `original.length` is allowed because it lies outside the compared prefix; editing any
  earlier byte fails `content_drift`.
- Registered entry: `SKILL.md:1559` (freshness gate registry) — `--worktree` is “candidate
  only”; `--witness REV` is the authoritative post-commit mode.

Measured history agrees. Every SKILL change since round 12 is exactly one hunk ending at EOF:

| Commit | Hunk header | Removed lines |
|---|---|---|
| `0d82098` round 12 | `@@ -1626,4 +1626,38 @@` | 1 |
| `2f4bfa1` round 13 | `@@ -1660,4 +1660,27 @@` | 1 |
| `837b33a` round 13 | `@@ -1683,4 +1683,33 @@` | 1 |
| `4a300f6` round 14 | `@@ -1712,4 +1712,51 @@` | 1 |
| `b7cf044` round 15 | `@@ -1759,4 +1759,71 @@` | 1 |

The single removed line in each is the file's former last line, re-added with a terminator.
`b7cf044` shows it literally: `-runner belongs in an isolated checkout, with this defect
qualification kept.` / `\ No newline at end of file` / `+runner belongs … kept.` / `+`.
This is the historical form of the “only non-addition is the former final line gaining a
line break” caveat recorded at `SKILL.md:830`.

## 2. Errata / registry conventions actually in force (two eras)

| Era | Header form | Correction mechanics |
|---|---|---|
| Rounds 5–11 and fleet appends | `## Errata — <round> append (…; append-only; never edit above)` — `SKILL.md:807, 930, 948, 1059, 1190, 1321`; same form at `:1461, :1537, :1598` and the nested `### Errata` at `:1619` | “Nothing above is edited.” + pre-append `sha256` of SKILL.md + `wc -l` (`:809`, `:934`, `:953`, `:1063`, `:1324`) |
| Rounds 12–15 (current) | `## Round N — <subject> (2026-10-20)` — `:1631, 1644, 1665, 1688, 1717, 1764` | Scoped supersession sentence + `###` decision table / registry; no pre-append hash, because the freshness gate now proves the prefix (`:1719-1721`: “This section supersedes the round13 trust-boundary statement at :1680 only for SCORECARD's historical counting path…”; `:1766-1777` named correction) |

Registry override rule (`SKILL.md:1792-1796`): overrides exist only for a prior row whose
*selftest/expectation/diagnostic interface* changed; “their historical execution receipts
remain unchanged.” A **new** gate is a new row, not an override. Commands are declared as
run from the lane root (`:1794`), and pointers resolve “by section name + quoted text”
because appends shift line numbers (`:702-706`, `:83-85`).

Adjacent admission rules that bind the same commit: errata are append-only blocks
(`corpus/QUALITY.md:7`); check `protectedPath` before writing a corpus path (`QUALITY:30`;
SKILL.md is **not** in either `scripts/check-round-contract.mjs:94-102` or
`scripts/check-user-round-contract.mjs:144-152` protected set — `corpus/lessons/round-*.md`
is); round aggregate lands in LOG in the same commit (`QUALITY:13-15`); a missing
predecessor lesson blocks admission (`QUALITY:22-25`; `corpus/lessons/round-15.md` exists);
the coverage map must list the new note or state the exact gap in the same commit
(`QUALITY:26-28`; `corpus/README.md:125-131` is the existing append-only reconciliation block).

## 3. Exact rules for the round-16 append

- **R1 — Placement/bytes.** Append at EOF only, after logical line 1829. First new bytes are
  `\n\n## Round 16 — …\n`; the text of line 1829 stays byte-identical. The expected default
  diff is one hunk `@@ -1826,4 +1826,N @@`; the only tolerated removed line is line 1829
  gaining a terminator. Any second hunk, or a hunk not at EOF, is a convention violation.
- **R2 — Header.** `## Round 16 — <subject> (2026-10-20)` (em dash, ISO date). Two themes
  (C1 binding, C2 WebMCP) may be one section with `###` subtables (round-14/15 form) or two
  same-title sections (round-12 form); pick one and do not mix.
- **R3 — No edits above.** Every correction of earlier text is a new sentence naming the
  anchor as `:line` **plus** a verbatim quoted fragment, and scoping the supersession
  (“supersedes only …”). Never rewrite the earlier block; never renumber.
- **R4 — Record the pre-append identity.** Recommended (stronger than rounds 12–15, matching
  rounds 5–11): capture `sha256sum SKILL.md` and `grep -c '' SKILL.md` **before** editing and
  write those values into the new section. If written, they must be the pre-append values,
  never the post-append hash.
- **R5 — C1 registry row.** Use the round-15 six columns exactly: `Name | Kind / owner |
  Entry and verdict map | Self-invocation | Persisted pinned values | Write scope`. Label it
  **new row; supersedes nothing** — do not call it an override (the draft's
  “round-16 override; supersedes nothing” is self-contradictory).
- **R6 — Leave round-15 rows alone.** `measurement-binding` with `--legacy` is a new gate
  behavior; it does not supersede any round-15 registered row, and
  `corpus/evidence/round-15/measurements.json` remains immutable.
- **R7 — No unobserved tokens.** No `PENDING`, `TODO`, or “L1-reported” may survive into
  committed SKILL text. A registry row may declare an entry/verdict map, but every receipt,
  selftest summary line and case count it cites must be committed bytes at the measured
  revision; anything unobserved goes to the note's Unknowns, not SKILL.
- **R8 — Anchor discipline.** Every appended rule needs a measured anchor
  (`SKILL.md:33-35`); WebMCP rows must cite `corpus/evidence/round-16/webmcp/receipt.json`
  and/or the probe JSONs, and keep observation / spec / inference / unknown separate
  (`QUALITY:3-8`; `QUALITY:31-34` forbids upgrading a source reading to observed behavior).
- **R9 — Post-append proof (L1 runs, this seat did not).** `node scripts/check-freshness.mjs
  --witness <REV>` must print `verdict=clean`; `--worktree` is only a candidate check.
- **R10 — Same-commit companions.** `corpus/lessons/round-16.md`, the `corpus/README.md`
  note-index row and the round-16 frontier block, and the LOG entry land in the integration
  commit (`QUALITY:13-15, 22-25, 26-28`).
- **R11 — §Pins untouched.** `SKILL.md:37-85` is the round-4 pin block; its note pins are
  superseded for post-append use by the round-5 block at `:809`. Rounds 12–15 added notes
  without editing §Pins; record the round-16 note identity in its evidence receipts and the
  README index row instead.
- **R12 — Note naming/opening.** `corpus/knowledge/webmcp-chromium-loopback-round-16.md`
  matches `aria-loopback-round-13.md` and `source-recheck-round-12.md`; it opens with
  `source: S0xx` lines (PLAN.md §C2) and cites only rows opened this round.
- **R13 — EOF shape.** Observed convention: the file's last line is unterminated. Preserve
  that (no trailing newline) or deliberately state the change; either passes the freshness
  prefix, but an unstated change alters the byte shape every later append builds on.

## 4. Text the WebMCP note would contradict or must supersede

| Anchor (current line) | Existing text | Why it conflicts / required treatment |
|---|---|---|
| `SKILL.md:104-106` | “`python3 --version` (`cdp-evidence-patterns.md:14-18`; round-2 host: node v24.21.0, chromium 152.0.7977.82, python 3.14.7)” | Observed today: `Chromium 154.0.8037.97 Arch Linux`. Append must supersede the host record: round-2 152 stays historical; round-16 pins 154.0.8037.97 and the resolved ELF sha `eaed39c3…`, not the launcher (`/usr/bin/chromium` is ELF, not a wrapper). |
| `SKILL.md:106-107` | “Host launchers inject flags — what you type is not the effective command” | The harness passes `--enable-features=… --enable-blink-features=…`; the receipt must record the **effective child command line** and full flag set, and the append must restate that rule. The draft does not. |
| `SKILL.md:143` | protocol metadata `Chrome/152.0.7977.82`, `Protocol-Version 1.3` | The round-16 `protocol-domain.json` comes from the browser's own `/json/protocol` at 154. The 152 string/version must not be reused; do not assert a protocol version without reading it from that build. |
| `SKILL.md:625-631` | Determinism boundaries list “protocol metadata (Browser `Chrome/152.0.7977.82`, Protocol-Version `1.3`)” as byte-reproducible; boundary rests on “same chromium build” | A 154 receipt cannot extend the 152 byte-identity claims. State build-scoped determinism and that 152/154 protocol sets differ; never merge the two runs. |
| `SKILL.md:1697` | “This is not system-Chromium152 evidence or a claim about another installed version.” | Round-16 *is* system-Chromium evidence at 154 — not 152, and not round-13's managed Chrome for Testing 156.0.8078.4. Name all three identities and forbid cross-version carryover. |
| `SKILL.md:10`, `:33-35` | “every rule below cites a measured anchor”; “Every claim: measured anchor … Observation / inference / unknown stay separate.” | The draft's `PENDING` and “L1-reported” cells cannot ship. Fill from committed receipts/probe JSONs or move to Unknowns. |
| `SKILL.md:364-441` | Four-rung ladder; claim classes Visual/State/Network; layer-routing table | No row covers “a tool registration was announced for a frame.” Append must extend (as round 12 did for `:402`): `WebMCP.toolsAdded` is a CDP-domain producer fact about what the browser announced — not a rung-1/2/3/4 artifact, not pixels/DOM, not proof any agent consumed or invoked the tool. |
| `SKILL.md:419`, `:441`, `:658` | “a loopback debug endpoint is not a quiet browser … GCM egress …”; “absence is as-of-capture, never a no-egress claim” | PLAN's “aborts every non-loopback request” is not a no-egress proof. The note/append must not claim “no external contact” from request abortion alone; pair with browser-log shape or leave the claim open. |
| `SKILL.md:724` | C1 loopback fixture is autonomous-now, but “Warrant includes a cleanup proof per session; … ‘loopback ≠ zero egress’ holds” | The WebMCP harness is C1-authorized (self-launched browser, lane pages on 127.0.0.1), but the C1 warrant requires a closure proof. |
| `SKILL.md:541-566` | Hygiene: fresh throwaway profile under the run's output dir; kill by explicit PID; ports loud-free + `ss`/`curl` closure; bounded `timeout`; record effective child line; “archive or it didn't happen” | PLAN §C2's receipt schema (`runtime`, `flags`, `producerSha256`, `protocolDomain`, `cases`, `summary`) has **no** profile/port/process-closure fields. Extend the receipt or commit a separate closure artifact; archive any cited `/tmp` browser log before it counts (`SKILL.md:98`); do not claim cleanup without the proof. |
| `corpus/README.md:35`, `:181`, `:194`, `:216`, `:283-284` | “Native WebMCP in chromium 152 — unprobed”; “the only WebMCP surface evidenced on the host is a CDP tool, not `navigator.modelContext`, and no flag carries it”; “WebMCP spec … currently unprobed” | Historical rows stay unedited (README:125-126 append-only reconciliation; `:5` and `:63` mark the map historical). L1 must append a round-16 frontier/status block that supersedes the *status* for the pinned 154 build, plus the note-index row — DraftSkill's “stays unedited” is necessary but not sufficient. |
| `corpus/README.md:181` phrasing | “…not `navigator.modelContext`…” | The spec's own surface is on `Document`: my open of `https://webmachinelearning.github.io/webmcp/` (fetch: `curl -sS --max-time 25 … -o /tmp/revskill-r16-spec.html`; 505,949 B; access 2026-10-20) contains the dfn `#document-associated-modelcontext`, text “associated ModelContext”, in §4.1, and 0 occurrences of `navigator.modelContext`. So the absence of `navigator.modelContext` is **not** evidence of absence of the feature; the round-16 text must say `document.modelContext` is the spec-shaped surface and the declarative `<form toolname>` surface is the Chromium-only part (`tooldescription` 0, `declarative` 0 in the spec HTML; only camelCase `toolName` properties/ids). |
| `corpus/SOURCES.md:34` (S020) | `CG-DRAFT 2026-10-16, revision f14762e6`, status `queued` | The page opened today exposes `<meta content="cb3d16964ab3e92cfd5f09901ed0504373a906e8" name="revision">` and `<time class="dt-updated" datetime="2026-10-20">20 October 2026</time>`. The row's `f14762e6` and `2026-10-16` are therefore stale, and DraftSkill's “S020, CG draft 2026-10-16” is contradicted by the opened document and by DraftNote's fetch. L1 must re-open S020, record the observed revision `cb3d1696…`/date/fetch method (access 2026-10-20), and update the row on admit — not cite 2026-10-16 or `f14762e6` as the opened document's identity. |

## 5. DraftSkill defects (`.ufo/waves/round-16/drafts/DraftSkill.md`)

1. Registry heading “C1 gate registry row (round-16 override; supersedes nothing)” — an
   override that supersedes nothing is the wrong label; use “new row”.
2. `PENDING` survives in a committed-text draft (many cells) — violates `SKILL.md:33-35` and
   the round-14/15 registry precedent, where cited receipts and selftest lines are real.
3. “append-only at SKILL.md end (after line 1829)” is correct logically but underspecified:
   give the byte procedure (R1) and the expected single EOF hunk.
4. Scope limits omit the C1 cleanup/closure proof and the effective-child-line rule
   (`SKILL.md:106-107`, `:724`, `:541-566`) despite PLAN §C2's receipt schema not covering them.
5. “Spec text (S020, CG draft 2026-10-16)” — stale versus the 2026-10-20 page date (row above).
6. The `navigator.modelContext` paragraph is right but incomplete: state that the spec places
   the surface on `Document` (§4.1), so `document.modelContext` is spec-aligned and the
   declarative form surface is the Chromium-only divergence.
7. Routed-defect 3 adoption does not name the pre-existing SKILL texts it adopts:
   `SKILL.md:1744` (round-14 “observed Node differs from pin.node.recorded” row) and
   `SKILL.md:1766-1777` (round-15 named correction). Since both sit above the append point,
   the new section should carry the one-line pointer naming them (matches
   `.ufo/waves/round-16/erratum-anchors.json`).
8. Verified correct in the draft: routed defects 1/2 cite `corpus/lessons/round-15-verifier-spotcheck.md:120-121`
   (grep: `:120` counter identity, `:121` measured revision vs delivered HEAD); defect 3 is
   `:122`; the erratum heading is `:90` and the corrected statement `:101`.
9. Draft correctly leaves README frontier rows and census U3 unedited; it must add that the
   *status* is superseded by an appended block, not by editing those rows.

## 6. Residual risk and unrun items

- The freshness target set is computed from the baseline tree
  (`scripts/check-freshness.mjs:78`: `git ls-tree -r --name-only baseline -- corpus/knowledge reports SKILL.md`),
  so a **new** course note is not covered by any freshness pin; its only map entry is the
  README index row. This is a coverage boundary, not a round-16 defect.
- `--worktree` is registered as candidate-only (`SKILL.md:1559`); only `--witness REV` after
  the integration commit settles the append claim.
- Unrun by this seat: `check-freshness`, `check-measurement-binding`, `--self-test`, the
  WebMCP harness, every probe, and any browser launch. Every version/date fact above is from
  the commands quoted in §0/§4; no gate verdict is asserted.
- No files edited outside this report; no commits; no subagents; no pacman/uv/npm operations.
