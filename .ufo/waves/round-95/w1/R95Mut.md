# R95Mut — counter mutation sweep (round 95 C1)

Seat `R95Mut`. Mutation-test of the FROZEN counter
`scripts/check-backendnode-misdelivery-round95.mjs` only (lane untouched).

Pinned bytes verified before any mutation (exit 0):
- counter sha256 `b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775` ✓ matches assignment.
- driver sha256 `24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82` ✓.
- battery sha256 `1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0` ✓.

## Method

- Sandbox lane at `/fast/scratch/hyaku/tabi-r95/R95Mut/lane` holding copies of the counter, driver,
  negatives battery, and the r94 collision receipt at the relative path the battery resolves
  (`corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json`).
- Baseline (pristine counter), exact command:
  `node lane/scripts/negatives-backendnode-misdelivery-round95.mjs --lane /fast/scratch/hyaku/tabi-r95/R95Mut/lane --receipt /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json --expect-nonce tabi-r95-live-36ad06703d0b --expect-driver-sha256 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82 --scratch /fast/scratch/hyaku/tabi-r95/R95Mut/bat-base`
  → exit 0, `{"cases":77,"ok":77,"failed":[]}`. Baseline clean, so every mutant result below is conclusive.
- 63 single-point textual mutants `M01..M63` (sweep script `/fast/scratch/hyaku/tabi-r95/R95Mut/sweep.mjs`).
  Each mutant is written into the sandbox counter only, the battery is run with a fresh
  `--scratch /fast/scratch/hyaku/tabi-r95/R95Mut/bat-<n>`, then the pristine bytes are restored and
  the sha256 re-verified after every mutant (`restored=true` for all). A mutant is **killed** iff the
  battery exits 1 (per the assignment rule; note this is broader than the battery's own expected-finding-id
  kill — none of the kills below depended on that difference: each failing battery case names the case whose
  mutation the mutant failed to catch).
- One mutant skipped: `M62` (`attr(shape, 'type') === 'file'` occurs twice — in `isInputS` and in
  `parentFileInputId`; deleting both is a two-point change, out of scope for a single-point mutant).

## Results: 45 killed, 17 survived, 1 skipped

Full per-mutant table (id, mutation, verdict, battery fallout for kills) is in `R95Mut-results.json`
(this directory). Killed mutants (45): M01–M17, M20, M22, M27–M31, M33, M36, M38–M40, M42, M43, M46–M51,
M53–M55, M57–M61. Each kill cites the battery case(s) the mutant let through in the JSON.

## Survivors — all 17 analysed against the frozen wording (plans/round-95.md §Claim)

| id | mutation | survivor analysis |
|---|---|---|
| M18 | collision threshold `>=1` → `>=2` (stricter) | Battery `positive` still passes (scored receipt has 11 collision P legs); no battery case has exactly 1 collision leg. **Stricter, not a gap.** |
| M19 | per-leg `l.error === null` removed | Widening. No battery case sets a leg `error` while also accepting it elsewhere; `leg-error-failures-empty` (sets `error` on S-2) is still killed by the global `failures` check, which requires `errLegs.length === 0`. A receipt could carry a leg `error` field only if accompanied by a `failures` entry — but that entry then trips `failures.length === 0`. Net: the leg-level `error` wording is enforced only transitively through `failures`. Minor redundancy gap; no receipt can exploit it alone. |
| M21 | child-url hostname check removed | Widening. Battery has no case with a wrong child hostname; `child-url-userinfo` still kills the userinfo clause. A receipt with a wrong-host `childUrl` would pass this clause (it must still match `ports.child` and `/child.html?leg=&pad=300`). Not a leg-level *behaviour* violation (the CDP behaviour is unchanged); stated URL wording not enforced. |
| M23 | child-url fragment removed | Widening. Same shape as M21; no battery case sets a fragment. The frozen sentence says "without userinfo or fragment". Unenforced fragment clause. |
| M24 | parent-url hostname removed | Widening. No battery case with a wrong parent hostname (`parent-url-other-leg` changes the query, not the host). Same URL-shape gap as M21. |
| M25 | parent-url userinfo/fragment removed | Widening. No battery case sets parent userinfo or fragment. Same URL-shape gap. |
| M26 | cross `attachedIframes.length === 1` → `>= 0` | Cross-target count no longer enforced, but `bit[0]`-vs-`attachedIframes[0]` identity and `childFrameId` still bind the *listed* target; `iframe-target-missing` still kills. With 0 attached iframes the check would read `attachedIframes[0].targetId` → undefined ≠ `l.childFrameId`, so it still fails. **Effectively equivalent** given the other clauses; count wording partially unenforced. |
| M32 | `describe-chooser` error removed | Widening. `dc.error` stays bound indirectly: the same-chapter `chooser` check and `answer` check pin the session/B, but a `dc.error !== null` with all identity fields correct would now pass. No battery case sets `describeChooser.error` non-null. Minor gap. |
| M34 | `describe-chooser` session removed | Widening. No battery case changes `describeChooser.session`; chooser-session and answer-session clauses still bind the *other* records. Minor gap. |
| M35 | snapshot error removed | Widening. Battery `id-snapshot-error` replaces the whole snapshot with `{error:'x'}` and is still killed (B/root/atB checks fail). But a snapshot with `error` non-null *and* all identity fields intact would pass. **Real gap** — a receipt defect class (errored snapshot) is not detected. |
| M37 | snapshot root `#document` removed | Widening. No battery case changes `rootNodeName`. Snapshot URL + B + atB still pin the snapshot's identity, but the `#document` root wording is unenforced. Gap. |
| M41 | parent-inputs id list (`#p0..#p5` in order) removed | Widening. Battery `id-parent-inputs-short`/`-dup-id` still killed via the distinct-ids and length clauses. But a *renamed* input (e.g. `p9` in place of `p5`) with distinct ids would pass. Frozen wording requires exactly `#p0..#p5` in order — gap. |
| M44 | describe-page miss error string removed | Widening. No battery case sets the miss-branch `describePage.error` to a non-`NO_NODE` value while `nodeName` is null. Gap. |
| M45 | describe-page miss `nodeName === null` removed | Widening. Same — no battery case. Gap. |
| M52 | S `isInputS(T) && T.backendNodeId === B` removed | Widening. `s-describe-parent-input` mutates `describePage` (still killed by `isInputS(dp)` in the same check). But a snapshot node at B that is *not* `INPUT#s` with a correct `describePage` would pass. **Real gap**: the frozen "T and the page describeNode(B) are the child INPUT#s" binds only via `describePage`, not the snapshot node. |
| M56 | answer session removed | Widening. No battery case changes `answer.session`. Answer B + error still bind. Minor gap. |
| M63 | `parentFileInputId` requires id in PIDS removed | Widening. An `INPUT type=file id=p9` at B (not `#p0..#p5`) would be classified *misdelivery* instead of *collision*; `parent-files` would then require `p9` filled, which a forged receipt could satisfy. Frozen wording: misdelivery = "T is one of the parent's file inputs #pN". **Real gap** — branch misclassification. |

### Pattern among survivors

The 17 survivors are **all battery-coverage gaps, not counter defects in the scored run**: the battery simply
has no case that sets the field the mutant removed (no wrong-host-URL case, no errored-but-otherwise-intact
snapshot, no renamed parent input, no lone collision leg, no `p9` file-input at B in the snapshot). Every
survivor that *widens* acceptance leaves the scored positive receipt clean — they would only matter to a
forger writing a whole consistent receipt, which declared limit 6 already excludes from the claim (the
counting command is `--live`). The only stricter survivor (M18, collision `>=2`) and the effectively-
equivalent one (M26) are not gaps. No survivor falsifies any leg-level *behavioural* statement
(describeNode == T, cross-answer outcomes, misdelivery/collision branches) on the scored receipt, and no
re-derivation of any check count differs from the frozen counter's own numbers.

Note on M62 (skip): `attr(shape,'type')==='file'` appears in both `isInputS` and `parentFileInputId`; a
single occurrence edit is ambiguous, so it is reported as skipped rather than run as a two-point mutant.
Each occurrence is individually exercised by battery cases `describe-chooser-not-s` (via `isInputS`) and the
`branch-no-misdelivery`/`col-relabel-as-file-input` family (via `parentFileInputId`); removing either alone
is killed by those cases in the pristine battery semantics (M63 shows the `parentFileInputId` half widens
branch classification, which is already reported as a survivor — the `type` half of M63's function is the
identical construction).

## Restoration evidence

- Sandbox counter sha256 after the sweep: `b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775` (== pristine; verified after every single mutant, `restored=true` × 62 run mutants).
- Lane (`/home/vgpnk/Projects/shokunin/tabi-shokunin`) never written; no git/jj mutation anywhere; no background jobs left running (sweep ran in the foreground via the tool call and has completed).
- This report records mutant machinery pinned to the frozen counter bytes above; full per-mutant evidence in `R95Mut-results.json`.

Commands run (exit codes):
1. `sha256sum` of the three instruments → all matched pins (exit 0).
2. Sandbox lane construction (`mkdir -p` + `cp` of the four files under `/fast/scratch/hyaku/tabi-r95/R95Mut/lane`) → exit 0.
3. Pristine battery (`--scratch …/bat-base`) → exit 0, 77/77.
4. Sweep (`node sweep.mjs`) → exit 0; 63 generated, 45 killed, 17 survived, 1 skipped; restoration re-hash after each mutant.
5. `sha256sum` re-check of the sandbox counter + copy of `sweep-results.json` into `R95Mut-results.json` → exit 0.

VERDICT C1: neutral
