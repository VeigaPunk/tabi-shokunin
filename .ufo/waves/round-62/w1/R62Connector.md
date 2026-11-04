# R62Connector — independent adjudication-semantics audit (round 62, wave w1)

Seat: R62Connector (leaf, connector). Independently derived; no files shared with Exec1 (comparison is Main's job). No instrument, snapshot, pin, production file, or sibling file was read-modified; all git reads were read-only with `-C`. No subagents, no `agent://all`.

## Inputs (all read FIRST, as required)

- `.ufo/waves/round-62/claims.json` — C1 adjacency rebind, C2 coverage capability. Certification work treated as evidence support only; no third claim raised.
- `.ufo/waves/round-62/instrument-pins.json` — 6 pins.
- `.ufo/waves/round-62/controls/no-work/unresolved.json` — 119 rows, schema `tabi-adjacency-r62-rebind-unresolved`, `carriedRows: 31`, `explicitRows: 0`.
- `.ufo/waves/round-61/c1/adjudications-r61.json` — 110 rows (kagi 4, kaidoku 37, kake 64, kama 5); dispositions: contested-open 7, no-tabi-ground 61, overlap-declared 42.
- `.ufo/waves/round-62/c1/snapshot-r62.tsv` — 20 lanes/heads (frozen snapshot).

## Pin and freeze integrity (evidence at pinned heads)

Commands (all exit 0): `git -C <lane> cat-file -t <rev>` for freeze `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4` (commit) and baseline `57b29bade4b05b03cdb8fa151daec90ac9b1a29c` (commit); `git -C <lane> status --porcelain=v1 -- <six pinned paths>` → 0 lines (worktree clean); node script `verify.js` hashing worktree + `git cat-file -p <freeze>:<path>` for each pin.

Result: **all 6 pins equal both the worktree bytes and the freeze-commit blob** (`pinsOK: true` in `w1/R62Connector/verification-receipt.json`). No instrument or snapshot byte moved; nothing was edited to make a pass.

## Quote verification at pinned heads

Per row: `git -C <fleet>/<lane> cat-file -p <snapshot-head>:<path>`, line-by-line compare against each `unresolved.json` quote.

Result: **119/119 quotes exact** at the pinned heads (`quoteVerdict: exact-at-pinned-head` per row in the map). 0 lane-head-missing, 0 file-absent, 0 out-of-range, 0 mismatch.

## Independent screen reproduction (adjudication surface)

I re-derived the browser-ground screen myself (BG_WORDS lowercase substring matcher, duplicated from the frozen instrument text; surface = 19 roster sibling lanes × (PROVINCE.md + every `corpus/adjacency.tsv@1ec5eb3f` map-referenced file)):

- screened files: 62; derived hit lines: **149**
- unresolved.json: **119**; resolved by r58 carry: **30**; stale carry keys: **1**
- identity: `149 == 119 + 30` — **exact**. 0 missing, 0 extra. unresolved.json is complete and honest over the PROVINCE + map-referenced surface.

Carry semantics observed (F3): rebind keys carried dispositions by `(lane, path, whole-line-quote)` — line-number-insensitive. 30 of 31 `corpus/adjacency-host-delta-r58.tsv@1ec5eb3f` line rows resolved a current hit; the one stale key (kengaku "**Reported out:** `headless-terminal` and `nginx-request-logging` …", text changed at the r62 head) is why kengaku PROVINCE.md:990/1085 appear as NEW unresolved rows this round. A moved identical line silently inherits its old disposition — instrument-declared behavior, reported as an observation.

## Ruling map (119 rows)

Artifact: `w1/R62Connector/adjudication-map-r62.json` (sha256 `8339a685239da53f66e5c771dbcbec7b1b449e410f62ef14e5f16695088f9e32`), schema `tabi-adjacency-r62-connector-adjudication-map`; every row: lane, path, line, exact quote, disposition (frozen vocabulary `no-tabi-ground | overlap-declared | contested-open`), basis, note, evidence head. Counts:

| disposition | rows |
|---|---|
| contested-open | 45 |
| no-tabi-ground | 69 |
| overlap-declared | 5 |

By lane: kagi 4, kaidoku 37, kake 70, kama 5, kengaku 2, mado 1.

Ruling semantics (reusing r61's vocabulary and basis labels; conservative where r62 evidence diverges):

- **kaidoku 37 → contested-open** (basis `lane default`). Both queue-ops files are the known kaidoku split surfaces (self-launched loopback chromium/playwright/CDP). r61 recorded `overlap-declared`; per the r62 contract the split-declared/uncertain lines **stay contested-open pending the unanswered keyup/kaidoku overlap L0 — overlap is NOT asserted settled** (F2). No closure of that question is claimed anywhere in this map.
- **kama 5 → contested-open** (as r61). Census lines on the live `127.0.0.1:9222` chrome-devtools listener; kama is a report-only observer; the listener's lease/profile ownership is contested (kagi PROVINCE.md:64). Sibling ground reported, never absorbed.
- **kagi 4**: :64 and :83 contested-open (the line itself declares the 9222 lease/profile contested with kake; the lane reports the question to the integrator, never adjudicates it); :41 and :91 no-tabi-ground (CLI-inventory token and knowledge-file name only). Same as r61; :91's quote drifted since r61 and was re-verified at the r62 head.
- **kake 70**: the 5 explicit tabi-boundary lines (PROVINCE.md 40/310/329/344, SKILL.md 697) → overlap-declared (reported, not absorbed); publisher-side robots/sitemap/crawl-declaration knowledge and gate-table lines (64) → no-tabi-ground; **SKILL.md:161 → contested-open, diverging from r61's no-tabi-ground** (F1 below). New-this-round rows 582/584/590/598/608 and SKILL 1473 are X-Robots-Tag/declaration-audit refusal lines ("no crawler behaviour is judged") → no-tabi-ground.
- **kengaku 2 → no-tabi-ground** (honest label): `headless-terminal` is a blocked terminal-app candidate (absent `vim` / candidate-library-required), not a browser; keyword false positive on `headless`.
- **mado 1 → no-tabi-ground** (honest label): refusal list ("No config edit, … screenshot, service mutation or sibling-method ownership follows") — no browser operation, no overlap declared.

## Findings

- **F1 (finding, integrator-bound).** kake `SKILL.md:161` instructs driving the *shared burner chrome* (`the-musketeer` profile, CDP `127.0.0.1:9222`, "serializes the whole kimi fleet — one op at a time, machine-wide"). kagi `PROVINCE.md:64` declares that exact lease/profile **contested with kake** (ownership unresolved; kagi pins presence-only), and kama `listener-census.md:56/355` records the live listener ("Any local process can drive a logged-in browser", "Report-only"). r61 labeled the kake row `no-tabi-ground` while its two sibling witnesses on the same surface are `contested-open`. I rule the row `contested-open` for cluster consistency. Ownership is **not settled here**; nothing is absorbed; consistent with kagi :83's discipline (reported to the integrator, never adjudicated by a lane).
- **F2 (r61 divergence).** All 37 kaidoku rows: r61 `overlap-declared` → r62 `contested-open`, per contract (split-declared kaidoku stays contested-open pending the unanswered keyup/kaidoku overlap L0).
- **F3 (observation).** Quote-based, line-number-insensitive carry: 30 applied, 1 stale (kengaku) — the mechanism that produced the two new kengaku rows; moved identical lines inherit old dispositions.
- **F4 (observation).** Screen reproduction identity exact: 149 = 119 + 30, 0 missing/extra.
- **F5 (honest labels).** No-tabi-ground labels listed per lane above; overlapping sibling operations (CDP 9222 cluster; kaidoku loopback self-launch family) reported, never absorbed.

Contradictions stated, not smoothed: kake:40 declares "tabi drives browsers …; kake owns publisher-side placement" while kake SKILL.md:161 has kake driving a shared browser via CDP — the boundary line and the runbook line coexist in one lane at the same pinned head; the map marks the runbook row contested-open and leaves the boundary question to the ground owners.

## Boundary discipline

- No kaidoku overlap L0 was assumed answered; those 37 rows carry no closure claim.
- No sibling ground absorbed anywhere; contested rows assert no ownership either way.
- No instrument/pin edits; no post-score transfer; certification content (C1/C2 statements) untouched — this seat produced evidence support only.
- Exec1's files were not read or written; this map is independently derived for Main's comparison.

## Artifacts

- `.ufo/waves/round-62/w1/R62Connector.md` — this report (Report trailer path: `.ufo/waves/round-62/w1/R62Connector.md`).
- `.ufo/waves/round-62/w1/R62Connector/adjudication-map-r62.json` — 119-row ruling map (sha256 `8339a685239da53f66e5c771dbcbec7b1b449e410f62ef14e5f16695088f9e32`).
- `.ufo/waves/round-62/w1/R62Connector/verification-receipt.json` — pin integrity, 119/119 quote verdicts, context pulls at pinned heads (sha256 `3318c785bf7b4f7c0bab75627468ff1dd23b75fb8682f200b6430d97829711e5`).
- `.ufo/waves/round-62/w1/R62Connector/verify-run-receipt.json` — verification run summary (sha256 `c2bc716c477bdb3de06d2bc30d365cd013b6be30a9c8c90dcc65d41aaedb969a`).

Scratch `/fast/scratch/hyaku/tabi-r62/R62Connector/` deleted after receipt copy. All commands exit 0 (recorded above; per-invocation outputs in the receipts).

Report trailer: `.ufo/waves/round-62/w1/R62Connector.md`
