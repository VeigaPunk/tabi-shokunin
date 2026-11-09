# R95Critic1 — C1 wording vs counter, clause by clause (receipt-mode; no --live run)

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Scope: falsify C1 wording against `scripts/check-backendnode-misdelivery-round95.mjs` (counter) and `scripts/chrome-cdp-backendnode-misdelivery-round95.mjs` (driver). No `--live` run (no ports assigned to this seat; no Chromium launched by me). No commits, no git/jj mutation, no subagents.

## 0. Instrument bytes (verified first)
```
sha256sum scripts/chrome-cdp-backendnode-misdelivery-round95.mjs  -> 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82  (pin OK)
sha256sum scripts/check-backendnode-misdelivery-round95.mjs       -> b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775  (pin OK)
sha256sum scripts/negatives-backendnode-misdelivery-round95.mjs   -> 1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0  (pin OK)
sha256sum .ufo/waves/round-95/scored/live-receipt.json            -> e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404  (matches c1-live.json receiptSha256)
```
Copy of the cited receipt: `w1/R95Critic1-scored-live-receipt.json` (same sha).

## 1. Re-derivation on the scored receipt (receipt mode, pinned driver sha, nonce tabi-r95-live-36ad06703d0b)
- `node scripts/check-backendnode-misdelivery-round95.mjs --lane <lane> --expect-driver-sha256 <pin> --receipt <copy> --expect-nonce <nonce> --json` → rc 0, verdict clean, checkCount 336, findings [].
- Branches re-derived: misdelivery [P286-1]; collision 11 P legs (P287-1..P289-1, P286-2..P289-2, P286-3..P289-3); miss [Z-1,Z-2,Z-3]. Matches `c1-live.json`.
- Counts I did NOT verify: the pre-freeze "positive" row in plans/round-95.md §Controls (misdelivery P286-2/P289-2/P286-3/P289-3, collision 8) describes a different receipt; not in my inputs. The scored receipt's counts are the ones above.
- Battery on the scored receipt: `node scripts/negatives-backendnode-misdelivery-round95.mjs --lane <lane> --receipt <scored> --expect-nonce <nonce> --expect-driver-sha256 <pin> --scratch /fast/scratch/hyaku/tabi-r95/R95Critic1/battery --json` → rc 0, cases 77, ok 77, failed []. Output: `w1/R95Critic1-battery.json`.

## 2. Clause-by-clause map (frozen sentence → check() id → exact condition)
Line refs are counter lines. "driver" = enforced only by pinned driver bytes, not by the counter.

| # | Frozen clause (plans/round-95.md §Claim) | Enforced by | Exact condition | Match |
|---|---|---|---|---|
| a | exactly one `Page.fileChooserOpened` within 1500 ms, child frame, integer B>0, iframe session (P/Z) / page session (S) | `chooser` (L221) for count=1, session, frameId=childFrameId, B int>0. The **1500 ms window: not in counter** (receipt has no timestamps); driver L251 sleeps OPEN_WAIT_MS=1500 and filters events after it (L253). | count/session/frame/B: counter. window: **driver only** (limit 5 names the window). |
| b | `describeNode(B)` on that session is `INPUT type=file id=s`, backendNodeId B | `describe-chooser` (L223) | dc.error null, isInputS, session, dc.B===B, dc.backendNodeId===B | match |
| c | snapshot root `#document`, documentURL = parent URL | `snapshot` (L225-226) | rootNodeName '#document', rootDocumentURL===parentUrl | match |
| d | at most one snapshot node carries B | `snapshot` (L226) | atB.length<=1 and every atB.backendNodeId===B | match |
| e | snapshot lists exactly #p0..#p5 in order, 6 distinct integer ids | `parent-inputs` (L228) | ids eq PIDS in order; every id isPosInt; 6 distinct | match |
| f | page `describeNode(B)` = T on nodeName, nodeType, attributes, backendNodeId (T present) | `describe-page` (L231) via `sameNode` (L172) | dp.session=page, dp.B===B, dp.error null, nodeName===T.nodeName, nodeType===T.nodeType, attributes deep-eq, backendNodeId===T.backendNodeId | **match** (sameNode excludes documentURL, exactly as the sentence lists four fields; forgery E clean is therefore consistent with the wording) |
| g | page `describeNode(B)` errors exactly `No node found for given backend id` (T absent) | `describe-page` (L232) | dp.error===NO_NODE **and dp.nodeName===null** | **counter narrower/partial** (see §3 item W2) |
| h | T is `#pN` → page `setFileInputFiles` no error; `#pN` and no other parent input = `[[answer,22]]`; child `#s` = [] | `cross-answer` (L241), `parent-files` (L242), `child-files-after-cross` (L248) | ca.session=page, B echo, error null; filled (entries whose files!==[]) eq [target]; that entry eq [ANSWER]; filesAfterCross eq [] | match ("no other parent input" is enforced: any other non-empty input appears in `filled`) |
| i | T other node → error exactly `Node is not a file input element`; all six parent + child [] | `cross-answer` (L245), `parent-files` (L246) | error === NOT_FILE_INPUT when T present and not #pN; filled eq [] | match |
| j | no T → error exactly `No node found for given backend id`; six + child [] | `cross-answer` (L245), `parent-files` (L246), `child-files-after-cross` (L248) | error === NO_NODE; filled eq []; filesAfterCross eq [] | match |
| k | Z: no T and every snapshot backendNodeId below B | `z-miss` (L252) | snOk && T===null && isPosInt(B) && **maxBackendNodeId < B** | **counter aggregate only** (see W3) |
| l | S: T and page describe are child `INPUT#s`, 1 INPUT#s in snapshot, no cross answer sent | `same-site` (L250), `snapshot` (L226: inputS===1) | isInputS(T), T.backendNodeId===B, dp.error null, isInputS(dp), **ca===null && pf===null && filesAfterCross===null** | **counter stricter than "no cross answer is sent"** (see N1) |
| m | P/Z iframe: exactly one attached and one listed iframe target, same targetId, URL=child URL, = childFrameId; 0 INPUT#s | `iframe-targets` (L215) | attached filtered to type 'iframe' length 1; browser iframe targets length 1; targetIds equal; bit.url===childUrl; attached.targetId===childFrameId; snapshot.inputS===0 (L226) | match on iframe criteria; **non-iframe attached targets are ignored** (see W4) |
| n | S: zero attached and zero listed iframe targets | `iframe-targets` (L216) | both length 0 | match |
| o | every leg: DOM ids/fresh browsers: 18 distinct UUID-shaped browser ids | `fresh-browser` (L193) | regex UUID, all distinct | match |
| p | Chromium `/json/version` Browser = Chrome/155.0.8059.84 | `browser-version` (L207) and `chromium` (L177, includes '155.0.8059.84') | per-leg eq BROWSER | match |
| q | child recorded exactly one trusted click on #s | `child-click` (L255) | childClicks eq [{target:'s', isTrusted:true}] | match |
| r | answer on chooser session no error; child files = [[answer,22]] | `answer` (L253), `child-files` (L254) | answer.session, B echo, error null; childFiles eq [ANSWER] | match |
| s | leg set: ≥1 P leg misdelivers, ≥1 P leg collides | `branch-misdelivery` (L258), `branch-collision` (L259) | P-prefixed branch lists length ≥1 | match (Z legs cannot enter branches via pBranch filter) |
| t | driver order: chooser-session describe → snapshot → page describe → cross answer; T taken after chooser and before any page describeNode | **driver only** (driver L261 describeChooser on chooser session, L262 getDocument, L264 page describeNode). Counter has **no** ordering or timestamp check. | — | **driver-byte enforcement** (see W1) |
| u | parent-side mapping: "T is the node at B after that serialization" | driver only (L262 walk) — limit 3 | — | disclosed (limit 3) |
| v | receipt schema/nonce/driver pin/chromium/crossHost/reps/pad/qs/zq/sq/k/answer/ports/failures/per-leg labels/B echoes/http URLs | counter L174-L212, L253-L259 | as listed in §67-72 | match; extra constraints noted in N2 |

## 3. Findings
### Narrower than the sentence (counter enforces MORE than the frozen words state) — these make the wording false as written
- **N1 (S legs, `same-site`, L250).** The sentence says "no cross answer is sent". The counter requires `crossAnswer === null AND parentFilesAfterCross === null AND filesAfterCross === null`. A leg that only *reads* parent/child files after no answer is a non-answer, yet the counter rejects it. Reproduced: `w1/R95Critic1-forgery-B-s-read.json` (S-1 filesAfterCross=[]) → rc 1, ids [same-site]; `w1/R95Critic1-forgery-C-s-pfiles.json` (S-2 parentFilesAfterCross all []) → rc 1, ids [same-site]. Live driver never produces this shape (it sets nulls at L264-L270 only for cross legs), so no `--live` leg-level statement is falsified; the mismatch is receipt-mode and in wording-vs-counter, which is what this seat was asked for.
- **N2 (snapshot integer, L225-226).** The counter requires `Number.isInteger(sn.maxBackendNodeId)` and `Number.isInteger(sn.inputS)` on **every** leg. The sentence never requires a max on P/S legs (only Z uses "below B"). Reproduced: `w1/R95Critic1-forgery-I-missing-max.json` (P286-1 max deleted) → rc 1, ids [branch-misdelivery, cross-answer, describe-page, parent-files, parent-inputs, snapshot]. Narrower; the driver always writes the integer.
- **N3 (describe-page absent branch, L232).** The counter demands `dp.nodeName === null` on the T-absent branch but not `nodeType`, `attributes`, `backendNodeId`, or `documentURL`. The sentence says "returns exactly the error", which the counter enforces only partly. Reproduced: `w1/R95Critic1-forgery-D-z-desc-fields.json` (Z-3 describe with error NO_NODE, nodeType 8, attributes [id,x], backendNodeId 999, documentURL set) → **rc 0, clean**. So the counter is stricter on one field and looser on three. The wording needs to say which.

### Broader than the counter (sentence states it, counter does not enforce it in receipt mode)
- **W1 (ordering, clause t).** "taken after the chooser, before any page-session describeNode" is not checked by the counter. Only pinned driver bytes order the calls (driver L261→L262→L264). The receipt has no per-call timestamps. Live mode is covered by the sha pin; receipt mode is not. Limit 6 covers receipt-mode T as "the driver's own record" but does not name ordering. Recommend naming it as driver-enforced.
- **W2 (1500 ms window, clause a).** Counter cannot see time. Only the driver's sleep and slice (L251, L253) enforce it. Limit 5 mentions the window; the sentence's "within 1500 ms" is driver-only.
- **W3 (Z "every backendNodeId below B").** The receipt carries only `maxBackendNodeId`, so the counter enforces the aggregate `max < B`, not per-id. Reproduced: `w1/R95Critic1-forgery-F-z-max.json` (Z-1 max=1e9) → rc 1 z-miss (the aggregate check fires in the right direction). A receipt cannot reveal an above-B id beyond the max, so the aggregate is equivalent for honest receipts; the driver computes max over the full walk (L163).
- **W4 (iframe attached targets, clause m).** The counter filters `attached` to `type === 'iframe'`. An extra non-iframe attached target passes. Reproduced: `w1/R95Critic1-forgery-H-extra-attached.json` (P286-1 attached + a `page` target) → rc 0, clean. The sentence says "exactly one attached … iframe target", which reads the same way, so the wording should say "attached iframe targets" explicitly.
- **W5 (parent input ↔ T binding).** Nothing binds the `parentInputs` entry for `#pN` to T's backendNodeId. Reproduced: `w1/R95Critic1-forgery-G-pinputs-bind.json` (P286-1: T is p3 at 302, parentInputs says p3=999) → rc 0, clean. The sentence says T "is one of the parent's file inputs #pN" and lists the six inputs with distinct ids, but never says the listed id for #pN equals T's id. Live driver derives both from one walk (L168), so live runs are consistent.
- **W6 (chooser mode, describeChooser.documentURL).** Not in the sentence; counter does not check them. `w1/R95Critic1-forgery-J-mode.json` (S-1 mode selectMultiple) → rc 0; `w1/R95Critic1-forgery-M-dc-docurl.json` → rc 0. Harmless to the claim (no sentence depends on them), noted for completeness.

### Forgery questions asked by the assignment
1. **Is "equals T on nodeName, nodeType, attributes and backendNodeId" what sameNode does?** Yes, exactly (L172). documentURL is excluded, and the sentence excludes it too. Forgery E (P289-1 describe documentURL forged) → rc 0, consistent with the wording.
2. **Is "no other parent input" enforced?** Yes. `filled` (L237) collects every parent input whose file list is non-empty, and it must equal `[target]` (L242). Any second filled input is caught; the battery's mis-two-inputs-filled case covers it.
3. **Is "every backendNodeId in the snapshot is below B" for Z enforced?** Only as `maxBackendNodeId < B` (L252) from the driver's walk; see W3.
4. **Is "taken after the chooser, before any page-session describeNode" enforced by the counter, or only by driver bytes?** Driver bytes only (see W1). Limit 6 does not name it; limit 3 covers "after that serialization" but not "after the chooser, before the page describe".
5. **Can T be forged to make a non-file collision look like a misdelivery in --receipt mode, and is that inside limit 6?** Yes. `w1/R95Critic1-forgery-A-full-relabel.json`: P287-1 (collision, T=#text at 302) is rewritten to `INPUT type=file id=p4` at 302, with describePage matched, crossAnswer.error null, parentFilesAfterCross p4 = [[answer,22]], filesAfterCross []. Result: **rc 0, clean, 336 checks**; misdelivery branch becomes [P286-1, P287-1]. This is inside limit 6 ("a forger who writes a whole consistent receipt passes that mode, and T is the driver's own record of the snapshot"). Inside `--live`, the driver writes T and the answer result, so the forgery requires modifying driver output, which the pin rules out. Battery gap: the existing `col-relabel-as-file-input` case (snapshot+describe only) is killed by parent-files; no battery case covers a fully consistent relabel, so the 77/77 is not evidence against this class.
6. **B-shift.** `w1/R95Critic1-forgery-Q-bshift.json` (P286-1 B 302→304 across choosers, describes, snapshot, cross, answer) → rc 0, clean. The counter has no independent anchor for B other than the chooser record, which the forger also controls. Limit 6 class.
7. **Forged no-T describe.** Forgery N (Z-2 cross NOT_FILE_INPUT) → rc 1, cross-answer (killed). Forgery P (sole misdelivery P286-1 converted to miss) → rc 1, branch-misdelivery (killed). Both behave as the wording says.

## 4. Verdict basis
- Forgeries run: 16 receipt-mode mutations (A–Q as named in §3; each `R95Critic1-forgery-*.json`), plus the 77-case battery. Results in `w1/R95Critic1-receipt-mode-results.json`.
- Commands and rc: all counter runs above rc 0 or 1 as listed; battery rc 0.
- Tools installed: none. No pacman, no uv, no npm. Node was already present.
- Chromium: none launched by this seat. The host has other seats' Chromium on port 32023 (R95Exec2); I did not touch it.
- Scratch: /fast/scratch/hyaku/tabi-r95/R95Critic1 (removed before yield).

The wording claims the conjunction of counter checks "and nothing more" (plans/round-95.md line 6). Three clauses (N1, N2, N3) make the counter enforce a narrower property than the sentence states. N1 is the cleanest: "no cross answer is sent" is enforced as "no file reads either." Items W1–W5 are broader-than-counter clauses that rest on pinned driver bytes or on receipt-mode disclosure (limits 3, 5, 6). The numeric record (336 checks; branches 1/11/3; battery 77/77) re-derives on the scored receipt.

VERDICT C1: falsifies-wording
