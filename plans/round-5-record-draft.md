# tabi-shokunin — round 5 record — DRAFT (scribe prep)

**Status: DRAFT, not the record.** This file is the four-clause claim's
**verification table** — written 2026-10-14T17:05Z (14:05 -03) by lane **SCR-B5**
(round-5 scribe-prep). Write scope: this file only. The round-5 record itself
(LOG entry, SCORECARD verdicts + move log + axes, README coverage rows) is
assembled later by the round-5 scribe from the seats' landed files plus this
table. Everything here is measured read-only (`/tmp` sources, plugin substrate,
`corpus/`, `.ufo/l0-questions.md`); nothing outside this file was written.
Discipline: observation / inference / unknown separated (`corpus/QUALITY.md:1-7`);
secrets shape-only; no external site; as-of stamps UTC unless marked. All
commands were run from the lane root unless a `cd` is shown.

## 1. Plan reference — two versions, both real (measured)

| Form | Where | Lines | sha256 (first 12) | Git state |
|---|---|---|---|---|
| Digest (operative) | `plans/round-5.plan.md` (worktree) | 11 | `4880ff80d5e7` | ` M` vs HEAD; mtime 2026-10-14 13:59:15 -03 |
| Design (committed) | `git show HEAD:plans/round-5.plan.md` | 334 | blob `d6694c2` | committed in `282fc6d` |

The 334-line design text (lane PREP-B5) is the authoritative statement of the
claim and the source of every expected value in §2; the 11-line worktree file
is its digest. Where they differ, this table follows the design text and says so.

Claim, verbatim from the design text (its line 23):

> (a) every archived evidence group carries a `MANIFEST.txt` (path · sha256 ·
> bytes) and, for the files an owning note pins, the archived hash equals the
> note's pin — equality asserted mechanically, one mismatch fails the clause;
> (b) `corpus/lessons/round-{1,2,3,4}.md` exist, each with a `## Gate` section
> (candidates / admitted / rejected with reasons / spot-check result) —
> `ls -A corpus/lessons | wc -l` → 4; round 4 is assembled from
> `plans/round-4-record-draft.md`, not re-derived from scratch;
> (c) every value in `SKILL.md` §Pins is re-derived **on a date strictly later
> than 2026-10-14** and the re-derivation is recorded with that date — the
> current ceiling is explicitly "same-day-later" (`SCORECARD.md:60`);
> (d) the approval-request packet exists at
> `corpus/handoffs/operator-approval-request.md`, contains **zero `/tmp`-only
> citations** (`grep -c '/tmp/'` → 0), and exactly one line is appended to
> `.ufo/l0-questions.md` naming the packet + its sha256.

Anti-claim (design text): NO external site is contacted; filing the packet is a
request, not a grant; a grant is acted on only inside its stated scope and only
after the read-back (line + sha) is recorded.

Seat map (design §6): TABI-R5-1 archive · TABI-R5-2 lessons · TABI-R5-3 packet +
L0 line + cold-read · TABI-R5-4 fixture v2 (stop-rule-gated) · TABI-R5-5
verification + outside spot-check · scribe (record). Axis move: **freshness**;
riders: calibration (packet), depth (deferred by stop rule).

Stop rule (design §4): the interim fixture starts only after (i) the packet is
filed and (ii) the archive verifies; if either slips, it defers named to round 6.

## 2. The verification table (the deliverable)

Status vocabulary: **PASS** (artifact landed and verified by this lane) ·
**IN FLIGHT** (seat working; partial artifacts observed) · **NOT LANDED** (no
artifact exists) · **TIME-GATED** (cannot pass on 2026-10-14 by construction).

| # | Predicate (pass condition) | Verify command | Expected | Observed @ 17:04Z | Status | Owner · falsifier |
|---|---|---|---|---|---|---|
| a1 | every archived group has a `MANIFEST.txt` | `find corpus/evidence -mindepth 1 -maxdepth 1 -type d \| wc -l` and `find corpus/evidence -name MANIFEST.txt \| wc -l` | equal numbers | 25 dirs / 25 manifests | **IN FLIGHT** (well-formed) | R5-1 · one group without a manifest fails |
| a2 | manifest hashes match the archived bytes | `for m in corpus/evidence/*/MANIFEST.txt; do (cd "$(dirname "$m")" && sha256sum -c MANIFEST.txt) \|\| echo "FAIL $m"; done` | all OK | 24/24 non-empty groups clean; 25th (`tabi-b1-r3b-scratch`) is an **empty group** (0 files; `sha256sum -c` has nothing to consume — documented, not a mismatch) | **IN FLIGHT** | R5-1 · any FAIL line; the empty-group case must stay documented, not silently dropped |
| a3 | manifest schema is (path · sha256 · bytes) | `head -8 corpus/evidence/<g>/MANIFEST.txt` | a bytes field per file, or an explicit ruling that the two-column `sha256sum` format satisfies the clause | **bytes column absent** — entries are `<sha256>  <path>`; the header quotes excluded-file bytes but not per-file bytes | **OPEN (schema)** | R5-1 / scribe · clause (a) is read by this lane as requiring the third field; if the final record accepts two columns it must say so and quote the design text it is departing from |
| a4 | for files an owning note pins, archived hash = note pin (one mismatch fails) | see §3 pin-equality recipe; spot set run by this lane | all MATCH | **MATCH on every file checked**: r2-1 archived `det-before.png` `c08947dc…802dc1` / `det-after.png` `7488d544…4b42c7` (= `live-dynamic-capture.md:78-79`), r2-1 harness `d37d36dd92d0`/`8105bed02840`/`e558bd547c58`/`21e27aa6619a`, r3-1 harness `b52074a33876`/`9509c07f49f9`/`ecce1c73dc56` (= journey §1), r4-2 runner `06fa6e5ce5bf` | **IN FLIGHT** (spot-verified; full sweep pending) | R5-5 · one mismatch fails the clause and is recorded as a freshness finding against the note, never quietly repaired (design §7) |
| a5 | the archive is named/indexed | `ls corpus/knowledge/evidence-archive-index.md`, `find corpus -name 'archive-receipt-r5.md'` | index note exists (design §6) | neither file in the tree yet, though every manifest header **cites** `archive-receipt-r5.md` | **IN FLIGHT** | R5-1 · a manifest that cites a receipt that never lands |
| b1 | 4 lesson files exist | `ls -A corpus/lessons \| wc -l` | 4 | **0** (dir exists, empty since 09:47) | **NOT LANDED** | R5-2 · any count ≠ 4 |
| b2 | each carries `## Gate` with candidates / admitted / rejected+reasons / spot-check | `grep -c '^## Gate' corpus/lessons/round-{1,2,3,4}.md` | 1 per file; content sub-checks readable | n/a | **NOT LANDED** | R5-2 · a lessons file with no rejected candidates is not a gate record (`LEARNING.md:61-62`) |
| b3 | round 4 assembled from the draft, not re-derived | `grep -n 'round-4-record-draft' corpus/lessons/round-4.md` | cites the draft | n/a | **NOT LANDED** | R5-2 · round-4.md that contradicts the draft without an errata note |
| c1 | every §Pins value re-derived, all match | `sha256sum` over the 15 sources in §5 vs `SKILL.md:44-66` | 15 matches | **15/15 MATCH today** (2026-10-14 17:0xZ) | values **PASS**, clause **TIME-GATED** | R5-5 · a later-date stamp whose values don't match fails; see c2 |
| c2 | re-derived **on a date strictly later than 2026-10-14**, recorded with that date | witness = the recorded date + command output (and, durably, the commit date of the block carrying it) | derivation date ≥ 2026-10-15 | today's re-derivation (incl. B5-3's `/tmp/w5-tabi-b53/repo-pins.txt` at 17:0xZ) is stamped **2026-10-14** — the "same-day-later" ceiling the clause exists to break (`SCORECARD.md:60`) | **TIME-GATED** (earliest 2026-10-15) | R5-5 / scribe · a derivation stamped 2026-10-14 (even 23:59) does not satisfy the clause; a stamp without a witness is unprovable |
| d1 | packet exists | `test -f corpus/handoffs/operator-approval-request.md` | file exists | `corpus/handoffs/` **does not exist** | **NOT LANDED** | R5-3 · file lands without the L0 line, or the line without the file |
| d2 | zero `/tmp` citations | `grep -c '/tmp/' corpus/handoffs/operator-approval-request.md` | 0 (exit 1) | n/a | **NOT LANDED** | R5-3 · any `/tmp/` citation the packet rests on; evidence tables must cite archived paths (design §3.4) |
| d3 | exactly one L0 line naming the packet + its sha256 | `grep -c '^tabi' .ufo/l0-questions.md` and `wc -l` before/after | 0 → 1; 24 → 25 lines; the line names packet + sha256 | **0 tabi lines**; file = 24 lines / 20,653 B / sha256-16 `0a86973bd17c37f7`; last byte `0a` | **NOT LANDED** | R5-3 / scribe · two lines, a line without the sha256, or an append that is not a pure byte-suffix |
| d4 | cold-read falsifier (packet's own, design §3.5) | a fresh document-only reader completes the grant/deny form (site, scope, budget, allowed, forbidden, produced) with zero follow-up questions | zero follow-ups; any follow-up amends the packet before filing and the gap is recorded | n/a | **NOT LANDED** | R5-5 · a filed packet with an unrecorded follow-up question |
| AC | anti-claim: no external site; a grant is acted on only after read-back | packet + record + `interaction-approval-table.md` never-set; any post-grant action cites the read-back line + sha | no external contact; no grant connected | **holds by construction today**: 0 tabi L0 lines → no grant can exist; this lane ran no browser | **HOLDS** (restate in record) | scribe · any external-site evidence in the round's artifacts |

L0 baseline for d3 (byte-prefix proof recipe): record `sha256sum
.ufo/l0-questions.md` and `wc -l` **before** the append, then `cmp` the old file
against the new file's first N bytes (`dd` or `cmp -n`), exactly as the round-2
errata lane did (`/tmp/tabi-r2-3-verify/append-proof.txt`, archived).

## 3. Clause (a) detail — the 25-group inventory and the owning-note map

Source `/tmp` counts measured 17:01Z; archived counts measured 17:04Z in
`corpus/evidence/`. "owning note" = a corpus artifact whose text cites the group
(measured by `grep -h -o '/tmp/…' corpus/knowledge/*.md reports/*.md`), so the
pin-equality requirement in a4 has an owner for each row where a note exists.

| Group (source → `corpus/evidence/<g>/`) | /tmp files (all) | archived | Owning note (measured citation) |
|---|---|---|---|
| `tabi3-cdp` | 202 | 5 | `cdp-evidence-patterns.md` (18 refs), `browser-surface-census.md`, `reports/r4-aud-tab1.md` |
| `tabi-audit2-cdp` | 360 | 5 | `cdp-evidence-patterns.md` (audit probe + summary) |
| `tabi-a1-r2b-capture` | 412 | 46 | `hygiene-sweep-r4.md` |
| `tabi-a2-r2b-evidence` | 3 | 3 | `hygiene-sweep-r4.md:146` (sweep inventory row) |
| `tabi-b1-r3b-journey` | 412 | 83 | `hygiene-sweep-r4.md:146`; `browser-surface-census.md` (`tabi-b1-r3b-*`) |
| `tabi-b1-r3b-scratch` | 0 | 0 | manifest documents the empty group |
| `tabi-r2-1-capture` | 414 | 48 | `live-dynamic-capture.md` (8 refs) — **pins matched, a4** |
| `tabi-r2-2-*` (loose) → `tabi-r2-2-state` | 6 | 6 | `webbridge-daemon-disposition.md` (baseline/poststart/status/cli-help/final-state/start.log) |
| `tabi-r2-3-verify` | 7 | 7 | `webbridge-plugin-anatomy.md`, `cdp-evidence-patterns.md`, `browser-surface-census.md` (append proofs) |
| `tabi-r2-4-poll` | 2 | 2 | round-2 LOG entry (corroboration) |
| `tabi-r3-1-journey` | 373 | 63 | `multi-step-journey.md` (4 refs) — **harness pins matched, a4** |
| `tabi-r3-2-spot` | 11 | 11 | `interaction-approval-table.md` (3 refs) |
| `tabi-r3-3-anchors` | 3 | 3 | `hygiene-sweep-r4.md:150` (sweep inventory row) |
| `tabi-r3-3-smoke` | 165 | 16 | `hygiene-sweep-r4.md` |
| `tabi-r3-4-work` | 726 | 90 | `executor-test-sufficiency.md` (10 refs) |
| `tabi-r4-1-network` | 612 | 122 | `network-evidence-rung.md` (4 refs) + journey/census |
| `tabi-r4-2-async` | 572 | 101 | `async-step-evidence.md` (2 refs) |
| `tabi-r4-3-sweep` | 9 | 9 | `hygiene-sweep-r4.md` (4 refs) |
| `w4-t41-network` | 1388 | 200 | `network-evidence-rung.md` head ("Scratch: /tmp/w4-t41-network/") |
| `w4-t4-2-async` | 572 | 101 | `async-step-evidence.md` (re-verification runs) |
| `w4-t4-3-sweep` | 11 | 11 | `hygiene-sweep-r4.md` |
| `w4-t4-4-tabi` | 6 | 6 | `SKILL.md` §Pins scratch line |
| `w4-aud-tab1` | 380 | 40 | `reports/r4-aud-tab1.md` (13 refs) |
| `w4-erb-b-sweep` | 19 | 19 | errata blocks in 8 notes (13 refs) |
| `w4-erb-b-append-proof` | 13 | 13 | errata byte-prefix proofs (12 refs) |

Archive rule (design §6) observed in the manifests' headers: pinned artifacts
only; `*/profile/*` excluded and the exclusion is **declared with its size**
(e.g. `tabi3-cdp`: "excluded: 197 files / 48281731 bytes"). Row-level totals:
25 groups, 1035 archived files (incl. 25 manifests), 6,889,272 bytes (≈6.6 MiB)
at 17:04Z; the excluded bulk is browser profiles (e.g. `tabi-audit2-cdp` alone is
151 MB in `/tmp`, 5 files archived).

**Boundary question for the final record (unknown, §9 U-c):** "every /tmp
evidence group" is read here as *every directory under `/tmp` holding this
lane's evidence* (25 archived) plus the loose `tabi-r2-2-*` state files
(archived as one group). Loose `/tmp`-root files cited only by the round-4
draft (`w4-scrb-pins-recheck.txt`, `w4-scrb-poll.log`) are **not** archived as
of 17:05Z; they are lane scratch, not note-owned evidence, but the record should
say which reading it adopts.

Pin-equality recipe (a4, runnable):

```sh
# 1. extract the note's pinned value(s) and the file they name, e.g.
grep -n 'c08947dc\|7488d544' corpus/knowledge/live-dynamic-capture.md
# 2. hash the ARCHIVED copy (not the /tmp source) and compare
sha256sum corpus/evidence/tabi-r2-1-capture/run1/det-before.png
# 3. a mismatch is a freshness finding against the note (append-only errata), never a silent repair
```

## 4. Clause (b) detail — what a `## Gate` must contain

Required content is quoted from the fleet contract: "`corpus/lessons/round-<N>.md`
— carries a `## Gate` section: candidates considered, admitted, rejected (with
reasons), and the spot-check result" (`LEARNING.md:61-62`, read 17:02Z). Design
§6 adds: round 4 is assembled from `plans/round-4-record-draft.md` (the 420-line
draft in this repo), not re-derived from scratch.

Current state: `corpus/lessons/` exists (mtime 09:47) and is empty —
`ls -A corpus/lessons | wc -l` → 0. `corpus/README.md:5-6` still states
"Held at round 3 … Lessons: 0"; no round-4 row landed.

## 5. Clause (c) detail — the 15 §Pins values, re-derived 2026-10-14 17:0xZ

Source: `SKILL.md:37-66` (pin block re-derived at 16:39Z today per its own
header). All 15 values were re-derived by this lane against the working tree
(`sha256sum`, first 12 shown) and **all match**:

| # | Source | Pin (SKILL.md) | Re-derived 2026-10-14 | Match |
|---|---|---|---|---|
| 1 | `corpus/knowledge/webbridge-plugin-anatomy.md` | `6ce6fdd018a7` | `6ce6fdd018a7` | ✔ |
| 2 | `corpus/knowledge/browser-surface-census.md` | `a4bbb39edb12` | `a4bbb39edb12` | ✔ |
| 3 | `corpus/knowledge/cdp-evidence-patterns.md` | `8de2ee008c9c` | `8de2ee008c9c` | ✔ |
| 4 | `corpus/knowledge/live-dynamic-capture.md` | `f97c10238907` | `f97c10238907` | ✔ |
| 5 | `corpus/knowledge/webbridge-daemon-disposition.md` | `03af1fb0693e` | `03af1fb0693e` | ✔ |
| 6 | `corpus/knowledge/interaction-approval-table.md` | `d6ad567a610c` | `d6ad567a610c` | ✔ |
| 7 | `corpus/knowledge/executor-test-sufficiency.md` | `5f04f6877e1e` | `5f04f6877e1e` | ✔ |
| 8 | `corpus/knowledge/multi-step-journey.md` | `8925ce6c46c7` | `8925ce6c46c7` | ✔ |
| 9 | `corpus/knowledge/network-evidence-rung.md` | `4889ccf073a8` | `4889ccf073a8` | ✔ |
| 10 | `corpus/knowledge/async-step-evidence.md` | `577af06bd9a8` | `577af06bd9a8` | ✔ |
| 11 | `corpus/knowledge/hygiene-sweep-r4.md` | `4ddc67151b98` | `4ddc67151b98` | ✔ |
| 12 | `reports/r4-aud-tab1.md` (report, not a note) | `5f44b0f94483` | `5f44b0f94483` | ✔ |
| 13 | plugin `kimi.plugin.json` | `e70aff5c40ff` | `e70aff5c40ff` | ✔ |
| 14 | plugin `skills/kimi-webbridge/SKILL.md` (158 lines) | `84a8e69d04c5` | `84a8e69d04c5` | ✔ |
| 15 | plugin `skills/kimi-webbridge/references/operations.md` (34 lines) | `b811d9c23dfd` | `b811d9c23dfd` | ✔ |

Path note (observation): the substrate files resolve **only** at the nested
`skills/kimi-webbridge/` paths; the §Pins line abbreviates the root as
`~/.kimi-code/plugins/managed/kimi-webbridge/`. No drift: values match at the
nested paths; the plugin dir mtime is 2026-10-03.

Date-gate mechanics for the record: clause (c) is **time-gated** — today is
2026-10-14, so *any* derivation performed today fails it. The final scribe needs
a decision (not this lane's to take): either (i) record round 5 with the values
verified and clause (c) as an open, dated obligation moving to the next round,
or (ii) hold the record until a dated re-derivation lands (earliest 2026-10-15)
and cite it. Whichever is chosen, the durable witness should be a dated block
in-repo whose commit date is ≥ 2026-10-15, plus the command and values.

## 6. Clause (d) detail — packet contract and L0 append mechanics

Packet contract (design §3, §3.4, §3.5): file at
`corpus/handoffs/operator-approval-request.md`; contains `filed:` date,
`round: 5`, a `recheck:` line, the R1/R2/R3 ask rows with budgets, the
not-asked edges, and the evidence-class table **citing archived paths** (which
is why d2's zero-`/tmp` check is meaningful: before clause (a) lands, those
citations would be `/tmp` and the packet could not pass). The packet must also
state the honest gaps (zero real-site datum; rate/ToS unmeasured; daemon down
for the bridge path).

L0 line mechanics: exactly one line, format `<lane> | round-<N> | <question>`
(`MISSION.md:84-88` quoted in design §2), appending to
`.ufo/l0-questions.md`. Baseline at 17:05Z: 24 lines, 20,653 bytes, sha256-16
`0a86973bd17c37f7`, ends `0a`, `grep -c '^tabi'` → 0 (exit 1). Post-append the
record must show: 25 lines, one tabi line, a byte-prefix proof, and the line
verbatim **including the packet's sha256**.

## 7. Baseline anchors (repo state @ 17:05Z)

- HEAD `282fc6d`; `git status --short` → ` M plans/round-5.plan.md`,
  `?? corpus/evidence/` (the archive lane's in-flight work).
- Knowledge: 11 notes, `wc -l` total **3336**; SKILL.md 741 lines / `1e2f87caddff`;
  `corpus/README.md` still at round-3 counts ("8 knowledge notes, 1944 lines",
  lessons 0) — the round-4 integration debt design §5 names.
- Lessons 0; `corpus/handoffs/` absent; L0 24 lines (above).
- Round-4 record status (relevant because clause (b) assembles round 4 and
  design §5 makes this Step 0): LOG.md carries a one-line round-4 entry
  (`LOG.md:131`); SCORECARD.md has the round-4 move-log row appended after the
  "Planned / retired" list (`SCORECARD.md:83`, orphan row) but no round-4
  primary-verdicts table and no axes update to round 4; README counts not moved.
  The final scribe should land these before or with the round-5 record.
- Standing Brave reject re-run: `ls -A ~/.config/BraveSoftware/Brave-Browser/`
  → `NativeMessagingHosts` only (agrees with rounds 1–4; fifth consecutive).

## 8. In-flight sibling state + pending inputs

| Input | Expected from | Observed state @ 17:05Z |
|---|---|---|
| `corpus/evidence/` (25 groups) | R5-1 | landed, manifests present; index note + receipt absent |
| pin re-derivation scratch | B5-3 (`/tmp/w5-tabi-b53/repo-pins.txt`, 2,277 B) | present, same-day (2026-10-14) |
| audit scratch | AUD-B5 (`/tmp/w5-aud-b5-work`, `/tmp/w5-aud-b5-evidence`) | observed, empty at 17:04Z |
| `corpus/lessons/round-{1..4}.md` | R5-2 | **no scratch or artifact observed** |
| `corpus/handoffs/operator-approval-request.md` + L0 line | R5-3 | **no artifact observed** |
| fixture v2 (§4, stop-rule-gated) | R5-4 | not started — stop rule conditions unmet |

Poll plan for the final scribe: no cap is named in this lane's assignment; this
draft's as-of stamps stand, and every value that moves (pins, counts, L0 line,
manifests) must be **re-derived at record time** — the round-4 record's own
lesson (`plans/round-4-record-draft.md` §9 E1/E2, moving pins).

## 9. Unknowns (explicit)

- U-a: whether `archive-receipt-r5.md` lands, and whether the index note is
  `corpus/knowledge/evidence-archive-index.md` as designed.
- U-b: whether the two-column manifest format satisfies clause (a)'s
  "(path · sha256 · bytes)" or must be amended (§2 a3).
- U-c: the exact boundary of "every /tmp evidence group" (loose `/tmp`-root
  scratch cited only by the round-4 draft — see §3).
- U-d: seat identity and landing time for R5-2/R5-3; no scratch observed.
- U-e: whether an operator answer ever arrives, and in which round (design §7).
- U-f: where the clause-(c) later-date stamp will live (in-repo block vs a
  commit date only), and who runs it.
- U-g: whether R5-4's fixture runs at all this round (stop rule depends on a5+b1).

## 10. Spot-checks performed by this lane (non-author of every checked artifact)

- **SC-1 — §Pins re-derivation:** all 15 values (`SKILL.md:44-66`) re-derived by
  `sha256sum` against the working tree at 17:0xZ → 15/15 MATCH (§5). This is a
  *same-day* match and is recorded as such; it does not satisfy clause (c).
- **SC-2 — archive pin equality:** archived copies of pinned artifacts re-hashed:
  r2-1 PNGs `c08947dc…802dc1` / `7488d544…4b42c7` and harness
  `d37d36dd92d0` / `8105bed02840` / `e558bd547c58` / `21e27aa6619a`; r3-1 harness
  `b52074a33876` / `9509c07f49f9` / `ecce1c73dc56`; r4-2 runner `06fa6e5ce5bf` —
  all equal the owning notes' pins and the `/tmp` sources.
- **SC-3 — manifest self-consistency:** `sha256sum -c` per group → 24/24
  non-empty groups clean; the 25th group is empty and its manifest documents
  that (`tabi-b1-r3b-scratch`, `/tmp` source also empty).
- **SC-4 — clause (b)/(d) negative controls:** `ls -A corpus/lessons | wc -l` →
  0; `corpus/handoffs` absent; `.ufo/l0-questions.md` 24 lines / 0 tabi lines /
  sha256-16 `0a86973bd17c37f7`.
- **SC-5 — substrate:** 3/3 pins match at the nested `skills/kimi-webbridge/`
  paths (plugin dir mtime 2026-10-03, unchanged).

## 11. Errata — append-only

- (none yet; corrections append below with date + evidence. The final record
  supersedes this file, not the other way around.)

### E1 — 2026-10-14T17:06Z, by SCR-B5. Clauses (b) and (d) LANDED during the check; statuses in §2 updated here, not rewritten there.

Measured 17:05:30–17:06:38Z, minutes after this draft's 17:04–17:05Z baseline.
Nothing above is rewritten; §2's status column for b/d rows is superseded by
this block.

- **b1/b2/b3 → LANDED.** `ls -A corpus/lessons | wc -l` → **4**;
  `corpus/lessons/round-{1,2,3,4}.md` = 59 / 60 / 69 / 87 lines; each has
  exactly one `## Gate` (`grep -c '^## Gate'` → 1 per file); round-4's Gate
  carries candidates / admitted / rejected-with-reasons / spot-check (SC-A…
  SC-D of this draft cited) and cites `plans/round-4-record-draft.md:8,42`
  (b3 passes). Count observation for the record: the lessons' carried-debt
  lines say "thirteen" (round 3) and "18" (round 4) `/tmp` evidence groups
  while the archive grouped the same material into **25** — definitional
  drift (loose files grouped, audit groups included); the record should state
  which count it asserts.
- **d1 → LANDED.** `corpus/handoffs/operator-approval-request.md`: 121 lines,
  13,103 B, sha256 `94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa`.
  Header carries `filed: 2026-10-14T17:05Z`, `round: 5`, a `recheck:` line.
  Naming observation: the file self-identifies as filed by **seat B5-4**,
  while design §6 assigned the packet to TABI-R5-3 — the round's lane naming
  moved to the B5-x scheme; the record should use the file's own seat id.
- **d2 → LANDED.** `grep -c '/tmp' corpus/handoffs/operator-approval-request.md`
  → **0** (checked with and without the trailing slash; the claim's literal
  command is `grep -c '/tmp/'` → exit 1, count 0).
- **d3 → LANDED, pure-append proven.** `.ufo/l0-questions.md`: 24 → **25**
  lines, 20,653 → 21,539 B (appended suffix = 886 bytes); `grep -c '^tabi'` →
  1; the line (now `:25`) names the packet path **and** its full sha256. Proof
  of purity: this draft's pre-append measurement at 17:05:08Z recorded the
  whole 20,653-B file as sha256-16 `0a86973bd17c37f7`; at 17:06Z
  `head -c 20653 .ufo/l0-questions.md | sha256sum` → `0a86973bd17c37f7` —
  the old file is a byte-identical prefix of the new one. (Full post-file
  sha256-16: `02c53ec60acfda48`.) No other lane wrote the file in the window.
- **d4 → still NOT LANDED.** The packet's §6 defines and self-contains the
  cold-reader grant/deny form, but no cold-read *verdict* artifact exists yet
  (no file in `reports/` or `corpus/handoffs/` newer than the packet; the
  verification seat's result is pending). Clause (d) is therefore landed on
  d1–d3 and open on d4.
- **a5 → still OPEN / a3 → still OPEN.** No `corpus/knowledge/evidence-archive-index.md`
  and no `archive-receipt-r5.md` in the tree (`find corpus -iname '*archive*'`
  → empty, 17:06Z), though every manifest header cites the receipt. Manifest
  entries remain two-field (`sha256  path`) — the bytes-column question (a3)
  is unresolved and now belongs to the archive lane's own receipt/index.
- **Corroborating artifact (independent of this lane):** `plans/round-6.plan.md`
  appeared (design lane PREP-B6, state frozen 17:04:57Z) and its §state read
  matches this draft's baseline — 25 evidence groups / 25 manifests, the
  packet at 13,103 B, the 11-line operative plan with the 334-line design in
  `282fc6d`. Two lanes, independently, same measurements.
- **c1/c2 unchanged:** §Pins 15/15 still MATCH as re-derivable today; clause
  (c) remains TIME-GATED (earliest date 2026-10-15).
- **SC-4 correction (append-only):** §10 SC-4's 0-lessons / absent-handoffs /
  24-line values are exact for 17:05:08Z and are superseded by E1; the SC-4
  measurements stand as the *negative controls* that make the landings
  datable.
