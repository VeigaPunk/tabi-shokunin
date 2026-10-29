# Round 43 — verifier spot-check (hyaku closure, non-author)

author: hyaku closure (non-author integrator, @m_zfl)
round: tabi 43 · lane tip `3bf87b608a10dfb1ce78bfad5c272c5a7658450d` · baseline `ab592825cd195599822ca227f7768914df208201` · freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
method: committed bytes only — git/jq/grep/sha256sum re-derivations plus two read-only reviewer re-check seats; no lane gate was executed, no live browser run, no mutation.

## 1. Conformance (step 1)

| Check | Observed | Verdict |
|---|---|---|
| Report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-43/tabi.md` → `tabi-shokunin <tabi@shokunin.local> d60a4aa5` | pass |
| Report timing | filed 2026-10-29T19:15:41-03:00, after dispatch 17:09:56-03:00, before `complete` 19:16:25-03:00 | pass |
| `SHONEN` heading, one line per box | 4 boxes, 4 `[~]` lines with pointers; no `[x]` written (closure never writes marks) | pass |
| Cited lane commits exist + ancestor of branch | 7 hashes (`ab592825`, `7ca6f018`, `ba433c94`, `b77e84a0`, `db5b2940`, `991b2842`, `3bf87b60`): all `git cat-file -e` + `git merge-base --is-ancestor <h> master` hold (branch ref, not `@{u}`) | pass |
| No uncommitted round work | `jj-lane.sh state` → `ahead=0 behind=0 local=remote=3bf87b60`; `status --porcelain` → only the two disclosed nested-git fixture dirs (`CritC2Blob/{annotated-tag-entry-fixture-repo,commit-gitlink-fixture-repo}/`, receipts committed, rebuildable) | pass |
| Prompt carries the template contract | `.ufo/prompts/tabi-round-43.md` renders `templates/round-prompt.md` verbatim (§1–§5) + hyaku addendum §6; L2 floor "at least 8" matches `MISSION.md` §L2 concurrency | pass |
| Report minimum substance | Work performed / Landed changes / Before → after / Sources & frontier / Trend verdicts / SHONEN, in order, with evidence pointers | pass |

Dispatch digest (copied per closure duty): `2026-10-29T17:09:56-03:00 launch tabi round=43 pgid=3367615 driver=hyaku-inline attempt=1` / `2026-10-29T19:16:25-03:00 complete tabi round=43; hyaku-inline attempt=1`.

## 2. Claim C1 — coverage capability (re-measured from committed bytes)

- **Before**: `git ls-tree -r --name-only ab592825… -- corpus/evidence/round43 | wc -l` → `0` (matches `controls/c1-baseline-tree-count.txt`).
- **After**: receipt+witness committed as explicit files at `ba433c94` (verified `--diff-filter=A`), 1,182,481 / 1,195,319 B; measure record committed at tip, sha256 `c67a1096e5cc32b0…97b258` recomputed = claimed `c67a1096…97b258`; nonce `d2c85f6e…aa266e5c` = receipt `runNonce`; `driverExit: 0`; spans re-derived from committed receipt samples: run1 18,588 ms, run2 25,649 ms (132 samples each, matches `w1/ScribeErrata42/ev-10-receipt-span-recompute.txt`); top-level `egressNonLoopback: 0`, `survivors: 0`. Nuance (disclosed by the lane's own `CritC1ReachReplay`): the signed record carries `driverExit` but no `predicate`/`counterExit` field — exit 0/predicate true live in LOG/SCORECARD/`SentEgressAudit.md` prose.
- **Live-run refusal class confirmed**: `measure/failed-run-1/` committed at tip; `grep -oE 'run[12]-sample[0-9]+-(ss|proc)-egress' measure.stdout | wc -l` → 46; aggregate `nonLoopback: 23` on run-1 samples; remotes not recorded (pre-hardening), matching the LOG disclosure.
- **Freeze integrity**: all 8 instrument digests recompute exactly (6 `frozenDigests` + 2 `producerPins`); 8 `controlBindings` each carry path + sha256 + verbatim quote line (r42 conformance defect 1 closed at the freeze layer, as reported).
- **Kill rule re-verified (not executed — evidence-verified)**: `w1/CritC1ReachSynth/attack-summary.json` — self-authored receipt+witness+self-signed record → `paired-key-direct` and `second-process-pipe` counterExit 0 / predicate true with no wrapper/browser; `precomputed-zero-challenge` refused (`challenge-signature-invalid`) — the wall is not vacuous. `CritC1ReachDirect` (exit 0 exact-argv, exit 1 fds-closed), `CritC1Witness` (post-run substitution refused; fully self-issued set reaches exit 0), `CritC1ReachReplay` (r39–r42 pairs refused), `CritResidualModel` (`counter-self-signed-reach.json`: copied counter, exit 0, `wrapperInvoked:false`). Mechanism confirmed at `counters/c1-signature-bound-v5.mjs:214-215,262`: signature and fresh challenge both verify under `m.pubkeys?.wrapper` — a key the candidate record itself supplies. The reported reasoning ("authenticates key-possession against the record's self-selected pubkey, not chain provenance") is mechanically correct.
- **Axis**: SCORECARD diff `ab592825→3bf87b60` is additive only; coverage held 9 → 9; no capability row entered. **Claim not admitted — kill rule fired: CONFIRMED.**

## 3. Claim C2 — calibration (re-measured + evidence-verified)

- **Before** (`controls/c2-baseline-red-r43.json`, committed): exit 1, `findingIds ["r5-claims-absent","r6-probe-absent"]` at `ab592825`. Independently re-derived: `.ufo/waves/round-43/claims.json` absent at baseline (`git show` → fatal), present at freeze and db5b2940 (sentence grep hits both); the r6 probe path `controls/c2-v0-probe.json` absent at baseline, present at db5b2940.
- **After** (`controls/c2-final-r43.json`): predicate true, findingCount 0 at `db5b2940` (exit 0 implied by the counter's `process.exit(predicate ? 0 : 1)`; receipt carries no explicit exit field — nuance, not a defect).
- **r42 holes closed, load-bearing**: 8/8 control-binding sha256 pins match committed bytes; `c2-v0-probe.json` `refused:true` finding `r1-measure-blob-pin-mismatch` while the r42 checker bytes green the same fabrication (exit 0); tree fixture named `r1a-not-a-blob` where r42 named no type violation; `MutC2Pin`/`MutC2Blob`/`MutC2Bind` all "load-bearing: YES"; `CritC2Blob` adds commit/tag refusals.
- **Kill rule re-verified (source read + seat evidence)**: `counters/check-routed-defects-round43.mjs:194` — `else if (binds.length < 5) add('r5-freeze-bindings-thin', …)` floors at 5 over the 8 named controls; `:201` — `!raw.toString('utf8').includes(b.quote)` with only a ≥8-char guard accepts quote fragments (observed frozen quotes 16–19 chars). `CritFreezeBindings` demonstrated both false-greens (5-of-8 fixture → exit 0/predicate true; 19-char fragment → exit 0/zero findings); `CritFreezeAudit` — beforeState-to-bindings completeness unenforced; `CritPredC2` — r4 omits the 38-row guard, r5 unpinned freeze/no line equality, r6 accepts any digest-shaped generator id. **Claim not met as worded — kill rule fired: CONFIRMED**; calibration held 9 → 9; exit 0 is an instrument pass, not admission.

Re-measured vs evidence-verified: C1 before/after counts, digest pins, receipt spans/egress/nonce/sha256, SCORECARD axis state = re-measured; the live browser run and the kill-rule seat attacks = evidence-verified from committed receipts/reports (Gate standard: no sibling gate executed). C2 before/after facts = re-measured over committed bytes; counter runs = evidence-verified from committed control receipts.

## 4. Discernment spot-check (LEARNING.md)

Census (run by closure): `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → **exit 0**, `tabi ok`, 21 W04 duplicate-URL warnings (pre-existing, same set the round disclosed).

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S150 (node:crypto docs) | admit (Gate) | https://nodejs.org/docs/latest-v24.x/api/crypto.html — live fetch HTTP 200, 681,625 B, sha256 `4b7024df…c50c42af` byte-identical to the committed staged copy | **agree** | Quote `createPrivateKey, createPublicKey, generateKeyPair, sign, verify,` located in the live bytes (1 hit); tier A docs, scope receipt-authenticity instrument, genuinely teaches the C1 signing primitives; cited by the round's sourced entry |
| S151 (git-cat-file manual) | admit (Gate) | https://git-scm.com/docs/git-cat-file — live fetch HTTP 200, 79,360 B, sha256 `624464ef…5165048d7` byte-identical | **agree** | Quote `Instead of the content, show the object type identified by` located (§-t option); grounds the blob-type discipline behind C2 rule r1; tier A appropriate |
| C1 refusal (coverage capability) | reject under frozen kill rule | 4 reach seats + copied-counter reach, counter source lines 214-215/262 | **agree** | The do-nothing reach is real, in-model, and pre-declared as the kill condition; refusing admission is the only verdict the frozen sentence permits |
| C2 refusal-as-worded (calibration) | reject under frozen kill rule | checker lines 194/201 + CritFreezeBindings exact-case evidence | **agree** | r5 demonstrably accepts what its sentence denies; "exit 0 = instrument pass, not admission" is the honest reading |

Registry: 151 rows (`grep -cE '^\|\s*S[0-9]{3,}\s*\|' corpus/SOURCES.md`), 149 → 151 with S150/S151 tier A mined, used-by carrying the new entry + lesson; knowledge notes 59 → 60; `corpus/knowledge/receipt-authenticity-signing-round-43.md` opens with the provenance trio and cites S150+S151. `## Mistakes` carries 4 rows (class · evidence · captured-by · fix). The Gate table holds no source rejections this round; the reject-side sample is the two claim refusals, both verified above.

## 5. Per-axis verdicts and trend verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| coverage | unchanged | C1 refused by kill rule; SCORECARD diff additive; 9 → 9; no capability row |
| calibration | unchanged | C2 refused as worded (r5 false-greens); 9 → 9; exit 0 = instrument pass |
| depth / freshness / operability / adjacency | unchanged | No owned-axis score moved; additive corpus/QUALITY/SCORECARD sections only; PROVINCE untouched; sibling findings routed, not absorbed |

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New admitted note on uncovered ground (receipt-authenticity instrument class) citing newly opened mined S150/S151; knowledge 59 → 60 (`ls corpus/knowledge/*.md \| wc -l`); registry 149 → 151; README coverage row — all re-counted by closure |
| quality | improved | r42 routed defects closed red→green (V0 fabrication refused via the pinned blob id while the r42 checker bytes still green it; tree objects named `r1a-not-a-blob`; freeze binds all 8 controls by sha256+quote), each closure mutation-proven load-bearing; QUALITY criteria 106–107 exist at `corpus/QUALITY.md:743,751`; no admitted entry failed a re-check |
| discernment | improved | This closure's outside spot-check agrees with the gate on both admits (sources re-opened byte-identical) and on both reject-side refusals (kill rules verified mechanically correct); refusals recorded, not smoothed |

## 6. Routed defects (lane must address next round; status-neutral this round)

1. **C1 authenticity trust anchor** (from the round's own routing, confirmed): a trust anchor NOT selected by the candidate measure record, plus evidence tied to supervised pinned-wrapper/driver execution; re-cut the synthetic control to the challenge-answering class (current `c1-synthetic-refused.json` exercises only the channel-absent variant).
2. **C1 egress clause honest-run-observable only**: two deterministic browser-free egress controls (plant non-zero → refuse; zeroed twin currently greens) per the `MutDriverEgress` class.
3. **C2 r5 hardening**: binding set must equal the named-control set derived from the freeze text; quotes compared as complete lines, not `includes` substrings; claims.json blob pinned; `b.path` type-checked (counter lines 194/201).
4. **Cosmetic number drift in the lesson Gate rows**: S150 quote annotated "7 words" (observed 5), S151 "11 words" (observed 10) — both within the ≤25-word contract; correct in a new entry, never a rewrite.
5. **Lesson formatting**: `## Executed disposition` heading duplicated (lines 22/24) and the census-end receipt line repeated — cosmetic; avoid in the next lesson.

## 7. Operator notes

- All four SHONEN boxes look checkable by a non-author reviewer on the committed evidence (SKILL decision tables with cited sources; end-to-end signature-authenticated runs logged in LOG.md; byte-faithful cold rebuilds by seats; PROVINCE accurate, findings routed). Promotion is operator-owned; closure writes no `[x]`.
- Both claims were refused by their pre-declared kill rules: 5th consecutive honest stop. The refusals are committed, re-derivable demonstrations, and the round's instruments, repairs, sourced entry, and controls are all landed and measured — admission false, status ok.
- Freeze-time catch of the >1 MiB directory-commit skip (receipts re-landed as explicit files at `ba433c94` before any citation) closed the r41 D1 class at the freeze layer.
