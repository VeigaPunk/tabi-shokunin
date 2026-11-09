---
author: hyaku closure (non-author integrator, @m_zfl)
---

# tabi — round 99 verifier spot-check

Non-author closure integrator. Lane repo `/home/vgpnk/Projects/shokunin/tabi-shokunin`, branch `master`.
Base `9eaa5cbe3eb817a8aa70a6e612beddc7ffdfb449`, after `63b9c9a7527cd2c3c0ba9a60a6eff19e3abe4ad3`.

## 1. Step-1 conformance

- Report committed in the fleet repo by the lane identity:
  `git log --format='%an %H' -- .ufo/reports/round-99/tabi.md` → `tabi-shokunin 658c6c74d6ec...` (2026-11-09). Pass.
- `SHONEN` heading with one line per box: report `## SHONEN` at line 212, four `[~]` lines with evidence pointers (SKILL.md registry, LOG.md scored run, R99Exec1/2 reproductions, PROVINCE unchanged + R99Connector). Pass. Not a marker: names real committed work with five cited hashes and a counting command.
- Cited lane commits exist and are ancestors of `63b9c9a7`: `27685238`, `ff978cb4`, `75a8a6f7`, `2259688a`, `63b9c9a7` all `git cat-file -e` OK; `git merge-base --is-ancestor 9eaa5cbe 63b9c9a7` → ancestor OK.
- Lane repo clean and pushed: `git -C tabi-shokunin status --porcelain` → empty; `jj-lane.sh state` → `branch=master local=63b9c9a7... remote=63b9c9a7... ahead=0 behind=0`. Pass.
- Prompt carries the template contract: `.ufo/prompts/tabi-round-99.md` has MISSION/AXES binding (§1), 1–3 claims + capability acquisition (§2), frontier step (§2b with census command + mined mistake + sourced claim), L2 floor batched swarm (§3), report contract incl. SHONEN/Sources&frontier/Trend verdicts (§4), commit/push scope + L0 (§5), hyaku addendum §6. Pass. (Note: prompt §6 caps waves at 8–16 seats / ≥25% attack; the lane's 12-seat wave with 33% attack satisfies both the prompt and the run-15 band.)
- Dispatch/complete digest (copied from `.ufo/watchdog.log` and the closure prompt; both lines verified present):
  - `2026-11-09T01:54:33-03:00 launch tabi round=99 pgid=2125951 driver=hyaku-inline attempt=1`
  - `2026-11-09T03:00:00-03:00 complete tabi round=99; hyaku-inline attempt=1`

Defects here: none (status-neutral). The `## SHONEN` section marks all four boxes `[~]` with no non-author verifier; that is author assertion, not a conformance defect at closure.

## 2b. Pre-file falsification ledger (addendum §8, Amendment 59)

Ran `python3 /home/vgpnk/Projects/shokunin/scripts/hyaku/prefile-falsification.py --lane tabi --round 99`
→ `PREFILE-FALSIFICATION: pass claims=1 rows=12 attack_seats=7 findings=0`, exit **0**.

- Covers every claim in `claims.json` (C1 only) and reads every attack-role seat artifact (12 rows: 11 `neutral`, 1 `falsifies-wording` from R99Critic1).
- The one `falsifies-wording` row (R99Critic1 W1/W2) names its narrowing: `plans/round-99.md` §Amendment A1 items 1–2, which the ledger row cites verbatim and which the plan carries as a narrowed restatement of the frozen "Surface moved" sentence and limit-8 clause (predicate, counter, kill rule, target unchanged). The claim's falsifiable numbered content is untouched.
- No failing rows to adjudicate. The ledger lives at `.ufo/waves/round-99/claim-falsification.tsv` in the lane commit `63b9c9a7`.

## 2. Claims — per-claim re-check

This round declares **one** claim: **C1, coverage, capability acquisition `client-oopif-uploadsets-linux`** (sourced from S244–S247 new + S237/S238/S240 re-opened). At r98 the lane already sat at all six axes at 9, and the r99 SCORECARD records C1 as working coverage (a lowest tie at 9) per the stagnation-nudge path; the capability row is the measurable delta.

### Gate-standard binding

C1 rests on a lane-owned gate (the counter `scripts/check-client-oopif-uploadsets-round99.mjs` + committed receipt; PROTOCOL §Gate standard, Closure consequence). Per that standard I verify its **committed evidence** — self-test tally, frozen-run verdict, revision measured — and do not execute the gate. Re-measured below are the plain committed-byte facts (git/grep/jq counts); the gate's verdict itself is **evidence-verified**, not re-executed.

| Claim | Procedure (command at HEAD `63b9c9a7`) | Observed | Reported | Verdict |
|---|---|---|---|---|
| C1 coverage (capability) | `git cat-file -e 9eaa5cbe:scripts/check-client-oopif-uploadsets-round99.mjs` (before control) | rc 128 (absent at base) | rc 128 | agree |
| C1 after | `git show ff978cb4:.ufo/waves/round-99/scored/c1-live.json \| jq` | `verdict: clean`, `checkCount: 282`, `findings: []`, `revision: 27685238...` (master tip at counter run), outcomes `trustedMulti 6, untrustedPayload 6, refusedMultiple 6, enoent 3, phantomUnreadable 3` | rc 0, clean, 282, 0 findings, nonce `tabi-r99-live-6d2a1508cbc1` | agree |
| C1 receipt | `git show 63b9c9a7:.../receipt.json \| python3` (legs/arms/nonce/driverSha) | 24 legs, 8 arms × 3 reps (PUAM/PLAM/PLBX/PLBM/PLBN/PLLP/PUCM/PUCN), `failures: []`, nonce `tabi-r99-live-6d2a1508cbc1`, driverSha `98efdc1293cc...` (matches frozen pin); sha256 prefix `ed4b2129` matches `c1-live.json` `receiptSha256` | 8×3=24 legs, nonce, driver pin, receipt sha `ed4b2129` | agree |
| C1 do-nothing controls | `git show 27685238:.ufo/waves/round-99/controls/rc.txt` | `no-work-base rc=128`, `no-work-r98-receipt rc=1`; wrong-lib/tampered/pin rc 1; battery rc 0; livekillers rc 0; positive rc 0 (278 receipt-mode checks) | same table | agree |
| C1 axes harmed? | `git diff 9eaa5cbe 63b9c9a7 -- SCORECARD.md` | only change is the new r99 section: capability row added, coverage 9→9 scalar unchanged ("the lane re-pins no scalar per round"), no other axis touched | no axis harmed | agree |
| supporting census | `grep -cE '^\| S[0-9]' corpus/SOURCES.md` at both ends; `git ls-tree .../corpus/knowledge/` | 243 → 247 rows; 111 → 112 knowledge notes | 243→247, 111→112 | agree |

No claim is exploratory in the AXES.md sense (this is a capability acquisition with a counting command); the exploratory-claim rule does not apply.

## 3. Discernment spot-check (LEARNING.md — checked from outside)

From `corpus/lessons/round-99.md` `## Gate` plus sources-census validate:

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S244 (Puppeteer `util/assert.ts` line 19 `throw new Error(message);`) | admit, tier A, mined | `https://raw.githubusercontent.com/puppeteer/puppeteer/puppeteer-v25.16.0/.../util/assert.ts` (fetched live; the `if (!value) { throw new Error(message); }` block confirmed) | **agree** | Primary code at the pinned tag; it grounds exactly the PUCN `errName: Error` claim. Quote (4 words) matches the byte position. |
| S245 (W3C File API NotFound failure reason) | admit, tier A, mined | `https://w3c.github.io/FileAPI/` (fetched live; the `td` text "If the File or Blob resource could not be found at the time the read was processed, this is the NotFound failure reason" confirmed near the cited line) | **agree** | Authoritative spec text for the PUAM dual-API `NotFoundError`. 23-word quote within the ≤25-word cap and carries the location. |
| Playwright root `package.json` | **reject** as a row | `https://raw.githubusercontent.com/microsoft/playwright/v1.65.0/package.json` (HTTP 200; line 144 `"mime": "4.1.0",` confirmed) | **agree** | Correct call: the file's only r99 relevance is the mime version pin, already cited inside S246's anchor. A rejection with reason and flip condition is evidence of taste, not wasted work. |
| `packages/playwright-core/bundles/utils/package.json` | **reject** as a row | Same v1.65.0 tag (HTTP **404**) | **agree** | Unverifiable, not fabrication; the admit/reject split and its flip condition are both on record. |

New `corpus/SOURCES.md` rows re-opened (≤25-word quote check): **S246** (`'image/png': ['png'],` — fetched live at line 283, confirmed) and **S247** (`return this.#extensionToType.get(ext) ?? null;` — fetched live at line 87, confirmed). The re-opened S237–S240 passages were also re-checked live: S238 line 80 (`mimeType: payload.mimeType || mime.getType(payload.name) || 'application/octet-stream'`) and S240 lines 756–757 (the `'Non-multiple file input can only accept single file'` throw) confirmed byte-for-byte; S237's passage confirmed at `packages/puppeteer-core/src/cdp/ElementHandle.ts` lines 113–116 (the `files.length <= 1 || isMultiple` assert with message `'Multiple file uploads only work with <input type=file multiple>'`).

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok`, exit **0** (W04 duplicate-url warnings on older rows only; no new-row warnings). Counts re-derived: 243→247 rows; all four new rows tier A, status `mined`, `90d`, used-by the r99 knowledge note — matches the census contract.

## 4. Per-axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| coverage | **improved** | New capability `client-oopif-uploadsets-linux` with a frozen predicate, committed clean `--live` receipt (282 checks, 8 arms × 3 reps), on multi-file sets, `multiple`-input refusal, untyped-payload name→type, dual read APIs, and absent-path behaviour. Knowledge 111→112; frontier ground advanced on chrome client surfaces. |
| calibration | **unprovable-but-better** | r98 spot-check D1–D4 answered in-round: D1 appended README correction, D2 TMPDIR fix shown by the strace control (4 → 0 under `/tmp`), D3 exit-3 fix shown by live killers K-partial/K-launchonly, D4 survivor classes now battery cases. All four are lane-authored records with the fixes shown able to fail — but no non-author re-ran the lane's own controls to confirm them, so this stays at `unprovable-but-better` for the closure judge. |
| depth | **unchanged** | The r99 knowledge note deepens the provenance trio and sequences the S237/S238/S240/S244–S247 citation chain; no prior entry is superseded or widened. |
| operability | **unchanged** | The frozen counter/driver are fully runnable (R99Exec1/2 reproduced cold from the plan text, receipt is re-derivable), but the round shipped no new operator-hand script. |
| freshness | **unchanged** | r98 D1 and the r77 "first path" practice bullet were corrected append-only this round (freshness is maintained), with no stale entry found or left unmarked. |
| adjacency | **unchanged** | R99Connector found no sibling overlap; the lane reported no cross-domain evidence and absorbed none. PROVINCE unchanged. |

## 5. Trend verdicts with evidence

- **expansion: improved** — Knowledge notes 111→112 on uncovered ground (multi-file client uploads, OOPIF inputs, refusal/timing semantics previously only touched raw-chooser-side in r77/r78). Four new SOURCES rows (S244–S247), all tier A and `mined`, each cited by the r99 knowledge note. New capability row entered in `SCORECARD.md` with the committed receipt as its evidence pointer.
- **quality: improved** — r98 D1–D4 all resolved in-round with controls shown able to fail (strace 4→0; K-partial frozen-counter rc 1 vs r98 mapping rc 2; battery covers R98Mut survivors). Two append-only corrections (README r97 coverage summary; r77 "first path" practice bullet). No admitted entry failed its re-check (this spot-check re-opened S237/S238/S240/S244–S247 byte-for-byte, agreeing).
- **discernment: unprovable-but-better** — The wave's adversarial seats caught two over-wide frozen-text sentences (W1 history negative; W2 limit-8 clause) and the lane narrowed them under addendum §8 choice (i) before filing, rather than filing the wider wording. The ledger's single `falsifies-wording` row is resolved. Two candidate rows were rejected with reasons. The lane self-scores this `unprovable-but-better` because the sentence was its own and no non-author has yet judged it; as the non-author closure reviewer I concur with its own downgrade rather than upgrading it to `improved` — the narrowing is genuine evidence of externally-checked taste, but an L1 self-narrowing of its own overclaim is not the same epistemic achievement as a gate deciding correctly unaided.

## 6. Routed defects (lane must fix next round)

- **E1 (process, routed):** r77/r78 precedent — two-file raw-chooser landings and `arrayBuffer()` reads existed in lane history before r99. The plan's initial "Surface moved" claim scoped its grep to `scripts/client-oopif-*round9[5-8].mjs` only. The whole-`scripts/` grep the lesson prescribes is the fix; ensure the next freeze's history sentences run it. (No claim admitted on the false sentence; this is hygiene for future probes.)
- **E2 (process, routed):** R99Mut 98 mutants, 68 killed, 30 survived — routed to r100. No survivor affects the scored receipt, but the battery coverage gap belongs in the next round's battery seats.
- **E3 (provenance, routed):** The r99 knowledge note cites S240/S238/S246/S247/S237 with provenance trio (source, verified-at, recheck). Keep the trio on every new knowledge entry; the scorer-note relation/scope append-only correction in `2259688a` is the right pattern — maintain append-only discipline for any future correction.

Nothing here bars admission.
