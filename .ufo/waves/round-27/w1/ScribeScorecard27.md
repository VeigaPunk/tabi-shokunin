# ScribeScorecard27 — round-27 SCORECARD blocks (report-only draft, v2)

Seat: `TabiR27.ScribeScorecard27` (leaf, read-only reporter). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.

- Round baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; C1 counter baseline
  `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`.
- Lane HEAD at drafting: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (two
  correction commits landed over the `336d5d1` state my v1 measured; see §11).
- Working tree at drafting (17:46 UTC): eight modified tracked paths (`LOG.md`,
  `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`,
  the S107 entry, `corpus/lessons/round-27.md`, `scripts/check-s106-evidence.mjs`)
  plus untracked wave artifacts and `scripts/report-contract.mjs`. Those edits
  belong to other seats/the L1; this seat wrote only this report and its scratch.

**v1 → v2.** v1 was written against `336d5d1` and recorded C1 as “met on the
frozen window”. Two wave-1 adversarial reports landed after v1's sweep
(`CritC1Supersession.md`, `ExecC1Attacks.md`), the C2 gate was corrected in two
commits, and the L1 has edited the disposition in the working tree. v2 carries
those measured facts: **C1 is failed**, **C2 is met after correction**. Nothing
in v1 was a guess, but v1's C1 verdict is superseded by evidence it had not yet
been able to read.

---

## 0. What the L1 has already applied, and what is still owed

Already applied (working tree, uncommitted at drafting):

- C1 verdict changed from “met” to “failed”, for the paragraph-matcher and
  live-porcelain reasons (matches this seat's measurements, §2).
- C2 verdict changed to “met after correction” at `5ed6484`, selftest 5/5.
- C3 rationale rewritten; the staged-S125/S142 refusal reasons now read
  W04/E09/E11 rather than E04.
- `LOG.md` gained the “C1 counter falsification” and “C2 correction” sections;
  `corpus/lessons/round-27.md` gained M4 (novelty overclaim), the C1/C2
  dispositions, and the corrected refusal reasons.

Still owed: the waves-and-seats block (placeholder cells), the capability row,
the “re-dispatched verbatim” wording (false — §6 D11), and the two provenance
citations (D8, D9).

---

## 1. Draft block A — `## Round 27 — declared claims`

```markdown
## Round 27 — declared claims (re-dispatch of round-26 frozen claims)

Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; claims record
`.ufo/waves/round-27/claims.json` (`resumedFrom` the round-26 record). Axes at
round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9,
adjacency 8. Lowest non-retired axis: **tie at 8** (depth, operability,
freshness, adjacency); C2 works depth (tie), C1 calibration 9, C3 coverage 9.
Saturation 8 / window 3 retained; stagnation nudge inactive (capabilities
entered at rounds 22–25). No axis retired.

The C1 before-value is measured at the counter's own baseline `4ad4c77…`, not at
the round baseline. The re-dispatch record is **not** byte-identical to the
round-26 record: eight C1 fields differ (see §6 D11), including the control arm
“or lacks the line citation”, which the round-27 record drops. The declared rule
sentence itself is unchanged.

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | calibration — counter-window extension | extended `check-selfassessment.mjs` m1 window to LOG.md round entries: 6 mismatches at `4ad4c77` (5 `m1-selftest-tally` LOG findings at LOG.md:335/:391/:1090/:1103/:1664 + 1 m3) → frozen target 0 at tip; selftest 13 → ≥15 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) |
| C2 | depth — routed source-evidence admission | 0 gate → `valid=true` at tip | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) |
| C3 | coverage — assimilation admission (addendum §10), documented-upstream | 0 entries cite S107 → ≥1 (entry re-grounded on fresh RFC 9110 bytes) | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` |
```

---

## 2. Draft block B — `## Round 27 — executed disposition`

Measured C1 chain (`mismatches`, and the counted classes):

| rev | `mismatches` | counted classes | receipt |
|---|---|---|---|
| `4ad4c77` | 6 | 5 × `m1-selftest-tally` (LOG.md:335, :391, :1090, :1103, :1664) + 1 × `m3-unlanded-paths` | `.ufo/waves/round-27/selfassess-baseline-raw.json` |
| `f185b4e` | 5 | 4 × m1 (:1664 already superseded by the round-26 correction) + m3 | `.ufo/waves/round-27/selfassess-tip-raw.json` |
| `fd722a7` | 1 | m3 only | `.ufo/waves/round-27/measure-c1-fd722a7.json` |
| `5a0178c` | 1 | m3 only (porcelain 4) | `.ufo/waves/round-27/scratch/ExecC1Tip/arm1-5a0178c.json` |
| `336d5d1` | 1 | m3 only (porcelain 9) | reporter-run, `.ufo/waves/round-27/scratch/ScribeScorecard27/c1-tip-336d5d1.json` |
| `5ed6484` (HEAD) | 1 | m3 only (porcelain 46) | reporter-run, `.ufo/waves/round-27/scratch/ScribeScorecard27/c1-tip-5ed6484.json` |

The apparent zero is produced *inside* this counter by treating a paragraph as a
citation. It is not a verified result:

- Selftest counts are measured (receipts written by another seat into this
  seat's scratch dir at 17:48 UTC, labelled as such):
  `tabi-selfassessment-selftest-v1` `{cases: 17, passed: 17, ok: true}` and
  `tabi-s106-evidence-selftest-v1` `{cases: 5, passed: 5, ok: true}`.

- `scripts/check-selfassessment.mjs:316-327` marks a finding superseded when a
  later blank-line paragraph names the script, carries a correction marker, and
  contains **any** `:<digits>` token — never comparing that token to the
  superseded line. `<REV>:<path>` is not excluded.
- On the shipped bytes this clears a real stale tally at `LOG.md:221`
  (`FRESHNESS_SELFTEST … cases=8`) using a paragraph whose only colon numbers are
  a timestamp (`:16`, `:28`) and a loopback port (`:18751`)
  (`CritC1Supersession.md`, verdict (a)).
- The unit is a paragraph, not the frozen “correction line”; the round-27
  correction block has zero blank lines, so all four still-counted findings are
  cleared by the same bullet list (`LOG.md:1904-1925`).
- `m3-unlanded-paths` reads live `git status --porcelain`, not the pinned
  `--rev`, so its count is a property of the measurement instant.

```markdown
## Round 27 — executed disposition

Measurements are tied to the named revisions. C1 is recorded **failed**: the
counter's apparent zero is not a verified result, and the frozen predicate is
not met by the shipped matcher.

| Claim / axis | Before → after (measured) | Verdict |
|---|---|---|
| C1 calibration | counter baseline `4ad4c77` = 6 (5 LOG-window `m1-selftest-tally` findings + 1 m3) → `f185b4e` = 5 → `fd722a7` = 1, `5a0178c` = 1, `336d5d1` = 1, `5ed6484` = 1 (every tip value is the m3 class alone; porcelain 4/9/46 respectively). The zero appears only by counting a paragraph that cites no matching line as a citation: the live `LOG.md:221` stale `cases=8` tally is cleared by a paragraph citing `:16`, `:28`, `:18751`. `m3` reads live porcelain, not `--rev`. Selftest 13 → 17 (`m1-log-stale-tally`, `m1-log-stale-then-corrected`, `m1-log-wrong-number-correction`, `m1-log-ambiguous-section-not-counted`) | **failed** — the frozen line-citation rule is not enforced (`CritC1Supersession.md` verdicts (a)/(b); `ExecC1Attacks.md`). No post-data predicate change; the matcher and the m3 revision binding are next-round claims |
| C2 depth | 0 gate → first landed gate (`5577d1b`) returned `valid=true` on the clean case but classified a **missing receipt** as invalid/exit 1, contradicting the frozen kill rule (CNE/exit 2); corrected at `5198e28` (absent receipt throws `Refusal`) and `5ed6484` (allow-empty fixture commit), CASES = 5; at HEAD `5ed6484` the gate reports `valid=true`, `present`, `sha_match`, `anchor_located` (line 187, 1 occurrence), `anchor_unique`, `byte_count_match` | **met after correction** — `scripts/check-s106-evidence.mjs`; receipt `.ufo/waves/round-27/measure-c2-5577d1b.json`; tip re-measurement `.ufo/waves/round-27/scratch/ScribeScorecard27/c2-tip-5ed6484.json` (exit 0) |
| C3 coverage | 0 entries cite S107 at `f185b4e` → 1 at `6ca3b89ad2a7b480984859834b3d28f1e75a9a26` and at HEAD; registry 106 → 107 rows | **met** — transformed (not byte-exact) staged row; census E09 rejects the byte-exact staged S124 recheck cell; fresh bytes 502941 B, sha256 `21c1cdce…`; quotes re-located at §10.2.3 lines 4805–4807 and §15.4.4 line 7413. Refusals: staged S125 (not re-opened this round; census W04/E09/E11, not E04), staged S142 (same-document §15.4 overlap; W04, not E04) |
| operability | 8 → 8; gate row at `SKILL.md:2514` (eight fields, `cases=5`); `check-gate-registry.mjs` reading is a scratch receipt at `5a0178c` (`rows: 27`, `nonconformant: 0`) | held — improved in substance, no scalar move; the L1's own tip run is owed |
| freshness, adjacency | unchanged | no claim; every prior-round byte added this round is an append |
```

---

## 3. Draft block C — `## Round 27 — waves and seats`

Measured at 17:46 UTC. `PENDING(L1)` marks cells only the L1 can close.

```markdown
## Round 27 — waves and seats

W1 (attack/verify; the three claims were landed by the L1 before the wave):
32 seats at 32 lanes — 3 scout, 9 executor, 5 scribe, 2 simplifier, 4 reviewer,
3 critic, 2 mutation-tester, 2 connector, 1 sentinel, 1 revenger. Spec
`.ufo/waves/round-27/w1-spec.json`; dispatch `.ufo/waves/round-27/w1-dispatch.json`
(spawn 32, resume 0; `w1.ready` + `w1.ready.dispatched` present). Reports landed:
PENDING(L1) — 31 `.md` reports at 17:46 UTC. Dead seats: PENDING(L1) — the
registry (`.ufo/waves/round-27/w1/swarm-registry.json`) lists 32 members with
`agentId: null` throughout, so seats must be counted from reports.

W2: 36 seats at 36 lanes specced and dispatched at 17:44:01 UTC
(`w2-dispatch.json`: spawn 36, resume 0; validator `w2-validate.err` empty;
`w2/swarm-registry.json` created 17:44:01 with 36 members). Reports landed:
PENDING(L1) — 0 at 17:46 UTC. Dead seats: PENDING(L1).

Round total at drafting: 68 seats dispatched across two waves (32 + 36);
dead seats PENDING(L1) in both waves.

No model-routing line is claimed: no `model` field exists in either dispatch
payload or spec, so an m_flash-majority count is not derivable from the
artifacts. The §3 planner seat is held by the L1; the validated W1 spec meets the
L2 floor inside the wave (32 ≥ 16).
```

Correction vs the landed `336d5d1` text: W2 is **36** seats, not 32 (the landed
“32 + 32 = 64” is wrong by four), and the dead-seat cell is still a literal
placeholder.

---

## 4. Draft capability row — `scripts/check-s106-evidence.mjs`

```markdown
Decoded-source-evidence admission gate — at a named revision it reads the
committed S106 receipt and its committed decoded `?format=TEXT` bytes,
recomputes the sha256 over those bytes, requires the receipt's anchor text at
its recorded line and requires that anchor to be unique; `valid` is true only
when presence, hash, anchor line, anchor uniqueness and byte count all agree.
A missing receipt or missing referenced bytes is could-not-evaluate (exit 2),
never `valid`. Evidence: `scripts/check-s106-evidence.mjs` (corrected at
`5ed6484`), `--selftest` (5 cases: clean fixture, sha mismatch, anchor
off-by-one, missing bytes, missing receipt → exit 2),
`.ufo/waves/round-27/measure-c2-5577d1b.json`. First-working round: 27.
```

Table-row form:

```markdown
| source-evidence admission gate (`check-s106-evidence.mjs`) | Recomputes the decoded sha256 over committed `?format=TEXT` bytes, binds the receipt's anchor to its recorded line uniquely, and returns `valid` only on agreement; missing receipt/bytes → exit 2, never valid | `scripts/check-s106-evidence.mjs --selftest` (cases=5); `.ufo/waves/round-27/measure-c2-5577d1b.json` | 27 |
```

Note the committed header comment at `5ed6484` still says “4 isolated cases”
while `CASES` holds five ids; the in-flight working-tree edit corrects it. The
registered `SKILL.md:2514` row already carries `cases=5`. The landed
“no capability-table promotion … a gate (counter)” sentence (`SCORECARD.md:1402`)
conflicts with rounds 24–25, where counters and receipt gates entered as
capability rows (`:1243`, `:1249`, `:1306`, `:1314`).

---

## 5. Draft block D — `### Planned` (next round)

```markdown
### Planned / saturation / retired — round 27

- planned (calibration, tie at 8) — enforce the frozen citation rule in
  `check-selfassessment.mjs` m1: a correction may supersede only when it cites
  the superseded line number (or carries an explicit `supersedes LOG.md:N`
  token), and the unit is the line/sentence, never the blank-line paragraph.
  Before: the live `LOG.md:221` stale `cases=8` tally is cleared by a paragraph
  citing `:16`/`:28`/`:18751` (reproduced in `CritC1Supersession.md` case (a)).
  After: `:221` stays a finding unless a bullet cites `:221`; the six eligible
  findings must all remain counted under the line unit. Cases to add: wrong line
  number, sibling line in the same paragraph, timestamp/port colon numbers, and
  the live `:221` case. Kill rule: if `:221` is still cleared, the matcher is
  wrong. Counting command unchanged.
- planned (calibration/operability) — bind `m3-unlanded-paths` to `--rev`: report
  the porcelain count only when the measured rev is the working tree's HEAD, and
  state the rev and tree state in the finding, so a mid-wave reading is not
  mistaken for a claim value.
- planned (operability) — land `scripts/report-contract.mjs` as a lane utility
  (not a gate; no gate-registry row) from the wave artifact, then run it over
  this round's reports: exit 0 conformant, exit 1 on wrong-path and
  missing-SHONEN fixtures.
- planned (freshness) — re-verify S104–S106's on-release sources at the next
  browser-tag bump.
- planned (coverage) — the two staged refusals' flip conditions only: S125 only
  after re-opening the source for a lane claim and merging/superseding S102;
  S142 only if S107's row scope is narrowed so per-status ground is separable.
- planned (adjacency) — record the PROVINCE boundary line for the redirect
  semantics entry against the web-properties lane.
- housekeeping (not claims): fill the waves/seats cells; append the capability
  row; correct “32 + 32” to 36 W2 seats; replace the verbatim-re-dispatch
  wording with the measured eight-field divergence; reconcile the S125/S142
  refusal reasons against the frozen `claims.json` text as a dated erratum.
- saturation 8 / window 3; no axis retired or waived.
```

---

## 6. Deltas against the landed/working blocks (findings)

| # | Landed text (line) | Measured | Status |
|---|---|---|---|
| D1 | “W2 dispatched after W1 findings landed” (`:1413`) | was false when written; W2 dispatch payload + registry now exist (17:44:01 UTC, 36 members) and 0 reports are in | partly closed — replace with the in-flight fact and the final seat count |
| D2 | “Two v1 waves (32 + 32 = 64 seats” (`:1407`) | W1 = 32, W2 = **36** → 68 dispatched | open |
| D3 | m_flash “16 of 32 in wave 1” (`:1408-1410`) | no `model` field in either spec or dispatch payload | open (unverifiable) |
| D4 | “Dead seats: `<recorded>`” (`:1413`) | literal placeholder; both registries have `agentId: null` for every member | open |
| D5 | “tip `mismatches=0` under a clean tree” (`:1396`) | no receipt ever reads 0; tips read 1 (m3-only) at `fd722a7`, `5a0178c`, `336d5d1`, `5ed6484`; the zero is an artefact of the non-citation matcher | closed by the L1's C1→failed edit; the deeper cause is D11 |
| D6 | “No capability-table promotion … gate (counter)” (`:1402-1403`) | rounds 24–25 entered counters and receipt gates as capability rows | open |
| D7 | “`report-contract.mjs` … lands as a lane script … (built this round, committed as wave evidence)” (`:1420-1421`) | built at scratch (140 lines, sha256 `b1e296bf…`); now also present untracked at `scripts/report-contract.mjs` (not in `git ls-files`); not committed evidence | open — wording; landing in flight |
| D8 | “census exit 0 (`census-after-c3.txt`)” (`:1397`) | the file holds output lines ending `tabi ok …`; it records no exit code | open (low) |
| D9 | “`check-gate-registry.mjs` clean” (`:1398`) | only reading is scratch at `5a0178c` (`rows 27`, `nonconformant 0`) | open (low) |
| D10 | “baseline `4ad4c77`” (`:1396`) | correct as the counter baseline but unlabelled against round baseline `f185b4e` | open (low) |
| **D11** | “re-dispatched verbatim (predicate, counter, kill rule, target unchanged)” (`:1375-1377`, `claims.json` `resumeNote`, LOG §27) | **false**: eight C1 fields differ between `.ufo/waves/round-26/claims.json` and `.ufo/waves/round-27/claims.json` — `declared` (trailing “Before: …” clause dropped), `before`, `after`, `counterField`, `control`, `failureCapable`, `killRule`, `type`. The control dropped the frozen arm “or lacks the line citation”; the record also says “correction **paragraph**” where round-26 said “correction **line**”. The *declared rule sentence* is identical. This is the clause the shipped matcher violates | **open, high** |
| **D12** | C3 refusal reasons (working tree `SCORECARD.md:1397`, `corpus/lessons/round-27.md` §Gate) | the lesson **as committed at `336d5d1`** said S125's document “already stands in this registry as **S102**; appending it must trip census E04 (duplicate URL+scope)”; the corrected lesson says it “was not re-opened this round” and the census reports “W04 … E09 … and E11 …, not E04”. `claims.json` never names S125/S142 (0 hits), so the frozen record is silent on both | **open** — record the reversal as a dated post-data erratum with the measured census codes; do not overwrite the earlier reasoning silently |

---

## 7. Measurement log

| # | Command | Output |
|---|---|---|
| M0 | `git rev-parse HEAD` (early) | `336d5d1…`; HEAD has since advanced to `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` |
| M1 | `node scripts/check-selfassessment.mjs --rev 336d5d1… --json` | exit 1; `mismatches: 1`; counted `m3-unlanded-paths` (9) |
| M1b | same at `5ed6484…` | exit 1; `mismatches: 1`; counted `m3-unlanded-paths` (46) |
| M2 | `node scripts/check-s106-evidence.mjs --rev 336d5d1… --json` | exit 0; `valid: true`, all five checks true, anchor line 187 |
| M2b | same at `5ed6484…` | exit 0; `valid: true` (`scratch/ScribeScorecard27/c2-tip-5ed6484.json`) |
| M3 | `git grep -lE '^source: S107 ' 336d5d1 -- corpus/knowledge \| wc -l` | 1 |
| M4 | row count `git show <rev>:corpus/SOURCES.md \| grep -cE '^\| ?S[0-9]{3}'` | `f185b4e` 106; `336d5d1` 107 |
| M5 | `git cat-file -s 6ca3b89:.ufo/waves/round-27/assimilation/rfc9110.txt`; `sha256sum` | 502941; `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` |
| M6 | `grep -n "Retry-After indicates" rfc9110.txt`; lines 7410–7416 | quote at 4805–4807; §15.4.4 heading 7411, 303 sentence 7413 |
| M7 | script hashes per rev (`git show <rev>:… \| sha256sum`) | s106: `336d5d1` `a339ec31…`, `5198e28` `9b99f4eb…`, `5ed6484` `fce4d4e2…` (worktree at draft `ef12a6fb…`, header-comment only); selfassessment `5ed6484` `de5d6676…` (= worktree) |
| M8 | `git status --porcelain` | 8 modified tracked paths + untracked wave artifacts + `scripts/report-contract.mjs` |
| M9 | C1/C2 claim-object diff, round-26 vs round-27 | 8 fields differ (D11) |
| M10 | `python3` over `w2/swarm-registry.json`, `w2-dispatch.json` | 36 members, `createdAt 2026-10-25T17:44:01.547Z`, 0 non-null `agentId`; `counts.spawn 36`; `w2-validate.err` 0 bytes |
| M11 | loopback citations named by lesson M4 | `external-class-fixture-v2.md:373` = “## 4. E1 measured — the redirect chain across three layers”; `state-changing-matrix-r9.md:162` = “## 4. Measured — the redirect half” |
| M12 | selftest receipts in `scratch/ScribeScorecard27/` (written by another seat, 17:48 UTC) | `c1-selftest.json` → `{cases: 17, passed: 17, ok: true}`; `c2-selftest.json` → `{cases: 5, passed: 5, ok: true}` |

Sweeps behind negative claims:

- **SW1** no `mismatches=0` receipt at a round-27 rev: parsed all **7,314** JSON
  files under `.ufo/waves/round-27/` for `mismatches==0` with `rev` in
  {`fd722a7`, `5577d1b`, `6ca3b89`, `5a0178c`, `336d5d1`} → 0 hits. The 38 files
  matching `"mismatches": 0` anywhere are C1 attack/mutation fixtures and
  historical round-24/round-1 evidence inside scratch mirrors.
- **SW2** W2 state: `w2-dispatch.json` present (spawn 36), `w2/swarm-registry.json`
  36 members, `w2/*.md` count 0 at 17:46 UTC; `w2.ready` absent.
- **SW3** W1 reports: 31 `.md` files at 17:46 UTC (`w1/`), dispatch markers
  `w1.ready` + `w1.ready.dispatched` present.
- **SW4** no routing field: `grep -o '"model"[^,]*'` over both specs and both
  dispatch payloads → no output.
- **SW5** row arithmetic: rows S105/S106/S107 present; count 107 (§M4).
- **SW6** `scripts/report-contract.mjs` not a lane script at HEAD:
  `git ls-files scripts/report-contract.mjs` → 0 lines; untracked working-tree
  copy present, sha256 `b1e296bf…` (equals the wave artifact).
- **SW7** C1 selftest ids: `grep -oE 'id: "[a-z0-9-]+"' scripts/check-selfassessment.mjs`
  overlapped by the gate's declared 17 cases and the four `m1-log-*` ids.

### 7.1 One unreproduced observation

The first C2 invocation of this seat returned exit 2 with
`S106_EVIDENCE verdict=could-not-evaluate detail=receipt absent at 336d5d1…`.
**23 subsequent identical invocations returned exit 0, `valid: true`** (three
manual including the exact redirection form, then a 20-iteration loop with empty
stderr). At that moment a sibling report recorded the working tree as carrying
`M scripts/check-s106-evidence.mjs`, i.e. the gate was being rewritten under the
measurement; the two correction commits (`5198e28`, `5ed6484`) landed within the
same window. Cause **[INFERENCE]**; the committed gate is stable in 23/23 runs.
Retained so the L1 can decide whether a determinism case belongs in the selftest.

---

## 8. Ordered asks for the L1

1. Keep the C1 verdict at **failed** and name both defects (non-citation
   matcher, live-porcelain m3). Do not restore `mismatches=0` anywhere —
   `LOG.md` §C1, `corpus/lessons/round-27.md` and the v1-era SCORECARD sentence
   all carried it.
2. Fix D11: the re-dispatch is not verbatim. Either restore the dropped control
   arm in the round-27 record with a dated note, or state the divergence and why
   it was invisible at freeze time. Do not let “unchanged” stand.
3. Fix D12 as a dated erratum: the S125 reasoning as committed at `336d5d1`
   (E04, duplicate of S102) versus the measured census codes (W04/E09/E11) and
   “not re-opened this round”.
4. Close D2/D4 from the two registries and report counts at wave end; never ship
   `Dead seats: <recorded>`.
5. Append the capability row (§4) and drop or justify the “no capability-table
   promotion” sentence.
6. Correct D7's wording; if `scripts/report-contract.mjs` lands, cite the commit.
7. Cite or re-run for D8/D9 at the tip.
8. Decide §7.1 (selftest determinism case or environmental record).

---

## 9. Tooling

None installed, upgraded or removed. `node` was the host binary; the C1/C2 gates
are the claims' own counters, run read-only against committed blobs.

## 10. Files written by this seat

- `.ufo/waves/round-27/w1/ScribeScorecard27.md` (this report)
- `.ufo/waves/round-27/scratch/ScribeScorecard27/`: `c1-tip-336d5d1.json`,
  `c1-tip-5ed6484.json`, `c2-tip-336d5d1.json`, `c2-tip-5ed6484.json`,
  `c2-tip.err`, `c2-loop.err` (scratch, gitignored)

## 11. Why v2 exists

Between v1's measurements and v2's, lane HEAD advanced
`336d5d1 → 5198e28 → 5ed6484`: the C2 gate was corrected (missing receipt now
CNE/exit 2, plus the empty-fixture commit fix), `SKILL.md` row updated to
`cases=5`, and `corpus/lessons/round-27.md` gained M3/M4 and the corrected
refusal reasons. Wave-1 adversarial reports (`CritC1Supersession.md`,
`ExecC1Attacks.md`) demonstrated that the C1 zero is an artefact; the L1 has
since edited the disposition to “failed”. W2 was dispatched at 17:44:01 UTC
(36 seats, 0 reports at drafting). The L1's working-tree edits are in progress,
so every number in this report is quoted at a named revision, never at the
dirty tree.
