author: hyaku closure (non-author integrator, @m_zfl)
round: 64 · lane: tabi · lane tip reviewed: e23037304ac72e07c664fb0cf2bb57f9f441c241
report: .ufo/reports/round-64/tabi.md (fleet 102603924809125facc9f431a388072534488f77)
reviewed: 2026-11-05 (UTC) — I did not author this round and did not improve it.

# Round 64 — non-author verifier spot-check

Verdict: **not admitted — honest stop**. C1 (coverage capability) verifies on its
committed evidence; C2 (calibration) is an honest miss: its frozen target is reached
by a population of never-executed receipts and the round froze no do-nothing control
for it. No axis is harmed. Status `ok`: the report is a real report (17,954 B, seven
cited lane commits, `SHONEN` heading, trend verdicts, sources census).

Method boundary: per PROTOCOL §Gate standard (Closure consequence) I did not execute
the lane's verifier, counter, control battery or receipt gate. I re-hashed the frozen
inputs against the declared pins and read the committed run outputs, so C1's verdict is
**evidence-verified**; C2's before/after is **re-derived from committed stdout**.

## 1. Step-1 conformance

| Check | Command | Observed |
|---|---|---|
| Report at the contract path, committed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-64/tabi.md` | `tabi-shokunin 9b02211d…` (00:22:50) then `tabi-shokunin 10260392…` (00:23:24); both `tabi@shokunin.local`. |
| Report lands after the cited lane commit | lane `e2303730` 00:23:12, report correction 00:23:24 | order holds; the first report commit cited the pre-`e2303730` tip and the correction is a new commit, not an amendment. |
| `SHONEN` heading, one line per box | `grep -c '^## SHONEN' report` → 1; `grep -cE '^- \[(x\|~\| )\]' report` → 4; `git show e2303730:SHONEN.md \| grep -c '^- \['` → 4 | 4 boxes, all `[~]` with pointers; no `[x]` written by the lane. |
| Cited lane commits exist and are ancestors | `git merge-base --is-ancestor <h> master` for each of `32726b8d 0fc68043 70f52f6a e3f52156 382e83b1 5dd531af e2303730` | 7/7 exist, 7/7 `anc`. |
| Lane repo clean and pushed | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain` | `ahead=0 behind=0 tracked=0 untracked=0`, local = remote = `e2303730`; porcelain empty. |
| Prompt carries the template contract | `.ufo/prompts/tabi-round-64.md` (92,227 B) | §1 MISSION/AXES binding (`:3`), §2 claims 1–3 (`:12`), §2b frontier step (`:45`), §3 L2 floor "at least 8 L2 subagents in ONE batched AgentSwarm call" (`:82`) = `MISSION.md` §L2 concurrency, §4 report contract with report path (`:101`), commit-then-report ordering (`:518`), `SHONEN` heading rule (`:521`), hash-citation rule (`:518`, `:739`), write scope (`:448`), §5 push scope + L0 side channel (`:131`). All five round-level and five child-lane items present; no model alias or L2 route map is pinned, so the MISSION bucket check is vacuous rather than wrong. |
| Not a marker | report content | work performed, evidence pointers, seven commits each tied to the round-64 `LOG.md` entry, checkable hashes. |

Conformance defects (status-neutral, routed in §5): D1 phantom residual wave w2, D2
seat-report count, D3 `Mistakes` row count plus a Markdown table break, D4 SCORECARD
mutation-count conflation, D5 assembled S169 quote.

## 2. Claims

### C1 — coverage, capability `chromium-wheel-scroll-domain-linux`

Counted over committed bytes at `e2303730`:

- before (`6c19979f`): `git cat-file -e 6c19979f:scripts/chrome-cdp-loopback-round64.mjs`
  → `fatal: path … not in '6c19979f'` (exit 128);
  `git ls-tree -r --name-only 6c19979f -- corpus/evidence/round64/ | wc -l` → `0`.
  Matches the reported before.
- pins: re-hashed all ten `claims.json` paths from `git show e2303730:<path>` → **10/10
  OK** (driver `1ff560cc…b92db5`, counter `5cc3c8dd…`, png `3f6a75de…`, negatives
  `848be4b0…`, mutants `11366f63…`, verifier `87a1a7c3…`, gate `947a595d…`, battery
  `ffabf4f0…`, smoke receipt `7dc5a247…`, pre-freeze summary `b20951e9…`).
- evidence: `sha256(corpus/evidence/round64/chromium-wheel-scroll/receipt.json)` =
  `4e3a95c1834fbaf19ccbb58267d413a81d1d947df90c0bfcea48041d0af0a86f` — the reported value;
  `MANIFEST.txt` names all seven files.
- `controls/scored/counter-smoke.stdout`: `predicate true, findingCount 0, checks 29`.
- `controls/scored/live-verify.stdout`: `predicate true, findings [], runs a/b exit 0,
  counterExit 0/0, agreement.crossRun true, agreement.evidence true, driverSha256
  1ff560cc…b92db5`.
- `controls/scored/negatives-matrix.json`: `negatives 29, refused 29, forgedGreen 0`.
- `controls/scored/mutants-matrix.json`: `rows 16, surviving 0, redundant 0`.
- `counter-selftest.stdout` `verdict=clean cases=31 passed=31`;
  `gate-selftest.stdout` `verdict=clean cases=9 passed=9`.
- `controls/scored/summary.json`: `controls 12, passed 12, failed []`; red-before rows
  exit 1/1/1/1 for one-by-one, borrowed-shots, no-shots, r63-receipt, and the disclosed
  synthetic-rendering row exit 0.
- ordering: `0fc68043` adds only `.ufo/waves/round-64/claims.json` (99 insertions) to its
  parent `32726b8d`, which already carries the 14/14 pre-freeze control summary — the
  "controls before data" rule holds.

**Verdict: verified** on its frozen predicate, evidence-verified. Carried limit, not a
new finding: the verifier hashes whatever `--driver` it is handed (w1 `R64Reviewer` H1,
`QUALITY.md` 118), so "frozen" is enforced by the after-command's literal argv, not by
the instrument.

### C2 — calibration, receipt provenance

- before (`controls/gate-before.stdout`, rev `6c19979f`): `checked 11, failures 34,
  byCheck {argv-real 1, inputs-bound 11, schema 11, stdout-bound 11}` — matches.
- after (`controls/scored/gate-after.stdout`, rev `e3f52156`): `requireCommitted true,
  checked 15, matrices 0, failures 0, byCheck {}, ok true` — matches.
- reachable without work: `w1/R64Reviewer.md:94–109` (receipt `E6c`) built 12 receipts
  for runs that never happened, with invented stdout and matching digests, plus two
  matrices → `checked=14 matrices=2 failures=0 ok=true`. `claims.json`
  `controlsCommittedBeforeFreeze` carries no no-work control for this gate (only
  `gateBefore`, and `live-no-run` belongs to C1), so the run-15 §9 do-nothing rule is
  unmet.

**Verdict: unprovable** — the after-state is real and re-derived, but the target does
not witness the claimed property; the lane reports the same conclusion itself
("measured, NOT admitted") and routes the repair.

### Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | unchanged | no cross-domain absorption; connector scan committed (`w1/R64Connector.md`). |
| coverage | improved | capability row `chromium-wheel-scroll-domain-linux` entered with a re-runnable demonstration; score held at 9 per D10, so the move is the repertoire, not the number. |
| depth | unchanged | one SKILL decision row added; no depth claim. |
| operability | unchanged | run commands exercised by L1 and seats; no new class of runnable artifact claimed. |
| freshness | unchanged | ten pins re-hashed, S153 re-opened in place; no freshness claim. |
| calibration | unprovable | C2 measured, not admitted (above). |

No axis harmed: `git diff 40095308 e2303730 -- SCORECARD.md` is +50/−0; `SKILL.md` +8/−0;
`corpus/QUALITY.md` +19/−0; `LOG.md` +15/−0; `corpus/SOURCES.md` +10/−2 and the two
deletions are in-place edits of `used-by` cells, which CORPUS rule 2 permits.

## 3. Discernment spot-check

Census (run by me, not copied):
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ exit 0, `169` rows (my `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` = 169 at
`e2303730`, 167 at `40095308`), 22 `W04` duplicate-URL warnings, all on pre-existing ids.

| # | Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|---|
| 1 | S168 — Chromium 155.0.8059.84 `Input.pdl`, mouseWheel delta units | admit, tier A / `code`, build-scoped | `.ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl` at `e2303730`: 14,431 B, sha256 `5bbc6e23…c66e3d`; line 202 reads `# Y delta in CSS pixels for mouse wheel event (default: 0).` | agree | The 11-word quote is verbatim at the cited line and does ground the unit claim; the scope cell refuses behaviour claims (distance, cancelation, determinism), which is the honest boundary. |
| 2 | S169 — Chromium 155.0.8059.84 `Browser.pdl`, `getVersion` response | admit, tier A / `code`, build-scoped | `…/s171-chromium155-Browser.pdl`: 12,079 B, sha256 `5e1faf7d…70da`; lines 208–219 list `command getVersion` → `protocolVersion, product, revision, userAgent, jsVersion` | agree (quote form noted, D5) | The five fields are present as stated, so the identity binding is real; the "quote" is assembled across the block rather than contiguous, which is a form defect, not a false admit. |
| 3 | A new row for the moving `@master` `browser_protocol.json` | reject (duplicate URL) | registry at `e2303730`: `grep -c 'devtools-protocol/master/json/browser_protocol.json'` → `1` (S153); census rerun exit 0 | agree | One URL, one row; re-opening S153 in place is exactly CORPUS rule 2's requirement, and the duplicate append would reproduce the `W04` the census exists to catch. |
| 4 | The CSSOM View re-fetch as a new row | reject (duplicate URL, quoted text unchanged) | `…/sources/s169-cssom-view-refetch.html`, 1,084,848 B, sha256 `e8f4fbda…f4a6`, diffed against the r63 staged copy: 4 diff lines, the only change is `<meta content="a3e7fce3…"` → `"909869d6…" name="revision"` | agree | The getter text the row quotes is byte-identical, so the held row stays true; recording the moving-artifact drift as a freshness datum instead of a second row is the correct call. |
| 5 | A synthesized rendering as evidence that the surface ran | reject | `controls/scored/summary.json` row `red-synthetic-rendering` → `exit 0, expect 0, ok true` | agree | The committed control proves a 1280×900 synthesis satisfies the counter, so the counter cannot be the capability's demonstration; naming the live verifier instead is right. |
| 6 | S168/S169 as support for scroll behaviour (distance, cancelation, determinism) | reject | the two PDLs above | agree | They define parameter units and response fields only; no normative scroll arithmetic or determinism there. |

No disagreement in the sample. Every sampled decision is backed by a resolvable committed
byte, and the lane's own Gate records the rejection reasons with flips.

## 4. Trend verdicts

- **expansion — improved.** Capability `chromium-wheel-scroll-domain-linux` entered the
  `SCORECARD.md` capabilities table with a re-runnable demonstration; registry 167 → 169
  (S168/S169, tier A, `mined`, `used-by` the new note and this lesson) and
  `corpus/knowledge/chromium-wheel-scroll-round-64.md` cites S153/S166–S169. Evidence:
  `SCORECARD.md` §"Capabilities — round 64"; `corpus/SOURCES.md` rows S168/S169.
- **quality — improved.** The r63 generation, whose receipt was hand-written with four
  1×1 PNGs, is superseded by instruments that refuse that class at the scored revision:
  four red-before classes exit 1, counter selftest 31/31, 29/29 declared negatives,
  16/16 frozen mutants killed. The ceiling is named, not hidden: 26/30 independent
  loosenings survive the declared negatives and the driver pin is unenforced. Evidence:
  `controls/scored/{summary,negatives-matrix,mutants-matrix}.json`.
- **discernment — improved.** This outside sample agrees with the Gate on two admits and
  four rejects; the round also caught its own design-smoke-as-scored-evidence defect and
  replaced the receipt before the after-pass, mined eleven mistake rows, and refused its
  own met C2 target rather than banking it. The lane's report said `unchanged`; the
  LEARNING observable (spot-check agreement) makes it `improved`.

Growth is not bought by a quality trade here; the rejection is a claim-admission miss,
not a regression.

## 5. Routed defects (lane must fix in round 65)

1. **D1 — phantom residual wave.** `corpus/lessons/round-64.md` §"Wave and measured
   disposition" says the round "closed with a residual wave w2 of 4 seats … re-attacking
   the SCORED population"; no w2 bytes exist
   (`git ls-tree -r --name-only e2303730 -- .ufo/waves/round-64/` → only `w1/`) and the
   report says "Residual call: **none** … Round total: 12 seats". Append a correction
   naming the superseded sentence.
2. **D2 — seat count.** The same paragraph says "eleven of twelve seats left a report
   and receipts"; committed seat reports are ten (`ls .ufo/waves/round-64/w1/*.md` → 10,
   `R64MutDriver` has no report, `R64Sentinel` neither file nor directory), which matches
   the report's "Ten seats left a report plus receipts".
3. **D3 — `Mistakes` count and table break.** The report says "seven rows in
   `corpus/lessons/round-64.md` ## Mistakes"; the table carries eleven data rows
   (`awk` over the section → 12 `| ` lines = header + 11), and a blank line between the
   fifth and sixth rows splits it into two tables, so the Markdown does not render as
   one.
4. **D4 — SCORECARD mutation count.** `SCORECARD.md` routed defect (c) says "18 of 30
   independent counter loosenings survive the declared negatives"; `R64MutCounter` totals
   are 26 of 30 surviving, 18 of those 26 accepting their targeted forgery. The report
   states it correctly; the SCORECARD row conflates the two numbers.
5. **D5 — assembled quote.** S169's Gate quote is a response shape assembled across
   lines 208–219 (comment lines interleaved), not a contiguous quote. Either quote one
   contiguous span or mark it explicitly as a field list; the substance is verified.
6. Carried, already routed by the lane and re-confirmed here: (a) the live verifier does
   not pin the driver it runs (H1, `QUALITY.md` 118) — a substitute driver exits 0 in
   561 ms with zero browser executions; (b) C2 needs a no-work control frozen before
   data; (c) 26/30 independent counter loosenings survive; (d) the battery's 600 s cap
   can truncate the verifier's 960 s retry budget.

Promotion note for the operator (not mine to decide): the `SHONEN` boxes are still all
`[~]`; boxes 1–3 now have evidence a non-author could check mechanically (SKILL decision
tables, an executed end-to-end run re-executable from the report, run commands exercised
by seats), but writing `[x]` is a verifier act nobody has performed, and promotion stays
operator-owned.
