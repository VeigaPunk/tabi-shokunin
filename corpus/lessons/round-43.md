author: tabi L1 (TabiR43), round 43

# Round 43 — lesson (fresh-start; signature-authenticated C1 chain, hardened routed-defect checker)

Frozen claims: `.ufo/waves/round-43/claims.json` at baseline
`ab592825cd195599822ca227f7768914df208201`; freeze `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`.
Fresh-start reading done first: r39–r42 reports + the r40/r41/r42 non-author verifier spot-checks.

## Gate

Round decisions this round (admit/reject with quotes; every new row opened this round by the L1):

| Id | Decision | Source (opened 2026-10-29) | Located quote (flat bytes of the staged copy) | Reason |
|---|---|---|---|---|
| S150 | admit | node:crypto docs, https://nodejs.org/docs/latest-v24.x/api/crypto.html — staged copy `.ufo/waves/round-43/sources/crypto.html` (HTTP 200, 681,625 B, sha256 `4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af`) | `createPrivateKey, createPublicKey, generateKeyPair, sign, verify,` (API index line; 7 words) | the primitives the C1 signing chain is built on (generateKeyPairSync + sign/verify); cited by the round's sourced claim carrier `corpus/knowledge/receipt-authenticity-signing-round-43.md` |
| S151 | admit | git-cat-file manual, https://git-scm.com/docs/git-cat-file — staged copy `.ufo/waves/round-43/sources/git-cat-file.html` (HTTP 200, 79,360 B, sha256 `624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7`) | `Instead of the content, show the object type identified by` (§-t option; 11 words; ends before the `<object>` placeholder span) | the blob-vs-tree type discipline behind C2 rule r1, the fix surface for the r42 CritPredicateSentence P-A defect |

Registry old→new this round: rows 149 → 151 (S150, S151 appended, tier A, mined, on-release);
used-by updates land at integration (entry + this lesson). Census start: exit 0, `tabi ok`,
21 W04 warnings (receipt `.ufo/waves/round-43/measure/census-start.*`).

## Executed disposition (recorded from settled wave data)

## Executed disposition (recorded from settled wave data)

Wave w1 (one policy-v2 wave): 64/64 seats settled, 0 dead, 0 empty outputs; verdicts bound on
seat-written report files: **34 ok / 30 finding** (`.ufo/waves/round-43/w1-results.json`,
`w1-parse-summary.json`). The L1 held the canonical planner seat; the planning/overlap work rode
the four connector items.

| Claim / axis | Counting command (frozen) | Observed | Verdict |
|---|---|---|---|
| C1 coverage capability | `node scripts/measure-c1-round43.mjs --out corpus/evidence/round43/playwright-egress/receipt.json --measure-out .ufo/waves/round-43/measure/c1-measure-r43.json --scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run2` | live run 2026-10-29: exit 0, v5 predicate true, spans 18,588/25,649 ms, egress 0, signature/attestation/challenge verified — then **four seats demonstrated in-model do-nothing reaches with zero browser runs**: `CritC1ReachSynth` (self-signed pair answers the fresh challenge from the pair's own key, incl. a second-process relay), `CritC1ReachDirect` (direct self-signed challenge), `CritC1Witness` (self-issued fake receipt+witness), `CritC1ReachReplay` (same class); `CritResidualModel` added the copied-counter reach | **not admitted — kill rule fired** (5th honest stop on this capability). Coverage holds 9 → 9; no capability row; the challenge wall authenticates key-possession against the record's own pubkey, not chain provenance |
| C2 calibration | `node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` | exit 0 / findingCount 0 at the freeze `7ca6f018` (re-derived by `ExecC2FreezeRev` with all six branches independently re-derived; baseline red control reproduces exactly); the r42 holes are closed and mutation-proven load-bearing (`MutC2Pin`, `MutC2Blob`, `MutC2Bind`, `CritC2Blob`, `ExecC2V0Probe`, `ExecC2TreeFixture`) — but **`CritFreezeBindings` + `CritFreezeAudit` + `CritPredC2` demonstrated r5 accepts what its sentence denies**: a freeze binding only 5 of the 8 controls its beforeState names greens (length floor, not set equality), a 19-char quote fragment greens (substring, not whole-line), and the freeze document itself is not pinned against later revision | **not met as worded — kill rule fired** on the forged-control-binding + quote-line limbs. Calibration holds 9 → 9; exit 0 recorded as instrument pass, not admission |

Routed to r44 (from the seats' own smallest-safe-correction sections): (1) C1 authenticity needs
a trust anchor NOT selected by the candidate measure record and evidence tied to supervised
pinned-wrapper/driver execution; the synthetic control must be re-cut to the challenge-answering
class. (2) The egress-count clause is honest-run-observable only (r37 class, re-demonstrated
live by `MutDriverEgress`: in a real host-egress window the pristine receipt was refused with 45
findings while a lying-driver receipt through the same genuine chain was admitted) — closable
with two deterministic browser-free egress controls (plant non-zero → refuse; zeroed twin →
currently greens). (3) C2 r5: binding set must equal the named-control set derived from the
freeze text, quotes compared as complete lines, claims.json blob pinned, `b.path` type-checked.
(4) Simplifier's six dead code paths + unused ENV_ALLOW entries and RevC1Wrapper's degenerate
refuse() exit codes — next-round amendment material, frozen bytes untouched.


## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| refusal-control coverage (weak-wall class) | my `controls/c1-synthetic-refused.json` refused the synthetic pair via the channel-absent variant only; `w1/CritC1ReachSynth` answered the counter's fresh challenge from the pair's own key (three variants, incl. a second-process relay) and reached exit 0 / predicate true with no browser run — an in-model do-nothing reach | QUALITY criterion 104 named the authencity route but no criterion required controls to exercise the strongest attack in their class; none | C1 kill rule fired (5th honest stop on this capability); route to r44 verbatim from the seat: an authenticity source NOT selected by the candidate measure record, plus evidence tied to supervised pinned-wrapper/driver execution; re-cut the synthetic control to the challenge-answering class. QUALITY criterion 106 added. No post-data amendment. |
| rule-narrower-than-sentence (r5) | `w1/CritFreezeBindings`: r5 greens a freeze that binds only 5 of the 8 controls its beforeState names (checker floors at `binds.length < 5`), and accepts a 19-char quote FRAGMENT (`includes`, not whole-line) — both false-greens against the frozen sentence "binds every control it names ... a verbatim quote line"; all five required negative mutations still refused (rule not vacuous) | the three-site sentence discipline caught sentence/code drift for C1/C2 core clauses in-round, but no check compared r5's binding SET against the set of controls the freeze names | C2 kill rule fired ("a forged control binding" class demonstrated); route to r44: binding set must equal the named-control set derived from the freeze text, quotes compared to complete committed lines, claims.json blob pinned so a later revision cannot silently omit bindings, `b.path` type-checked before use. QUALITY criterion 107 added. No post-data amendment. |
| >1 MiB directory-commit skip (r41 D1 class, recurred) | the freeze commit `7ca6f018` committed `corpus/evidence/round43` as a directory; both receipt files (1.18/1.20 MiB) were silently skipped and `git ls-tree` at the freeze listed zero files under the path; re-committed as explicit files at `ba433c94` | the r42 knowledge entry documents the rule (rule 5), but nothing in my pre-commit flow ran the ls-tree check BEFORE citing; caught this time at the freeze, before any report citation | the pre-report/citation gate is: `git ls-tree -r --name-only <rev> -- <cited path>` before any evidence pointer lands; recorded here as the standard; no admission impact (caught pre-wave) |
| instrument-hardening-before-freeze (disclosed, not a violation) | first live attempt refused by the round's own counter (46 real `*-egress` findings, one non-loopback owned socket, run-1 samples 111–133, gone by run 2); driver/counter hardened pre-freeze to record `nonLoopbackRemotes`; archived at `.ufo/waves/round-43/measure/failed-run-1/` | the frozen predicate itself (the counter refused its own chain's first output) | disclosed pre-data in LOG/SCORECARD; predicate not loosened; second run clean (spans 18,588/25,649 ms) |

## Census

- Start (2026-10-29, pre-edit): exit 0, `tabi ok`, 21 W04 warnings —
  `.ufo/waves/round-43/measure/census-start.{out,err,exit}`.
- End (post-registry edits): command
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
  → run at integration; receipt `.ufo/waves/round-43/measure/census-end.*`; receipt `.ufo/waves/round-43/measure/census-end.*`.
- Row count: 149 → 151 (S150, S151); tiers A133→A135; status mined 124→126, rejected 10,
  queued 15. `check-sources.mjs`: clean, 0 findings (verified pre-wave).

## Assimilation

None. The r42 fresh re-adjudication (misbound 25 / absent 6 of 38) keeps package adoption
closed; no `merge/tabi/` row or knowledge entry was appended from the package.
`considerthese/` is absent (no such directory in this lane).
