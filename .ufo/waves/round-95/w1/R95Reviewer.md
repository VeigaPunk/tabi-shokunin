# R95Reviewer — r95 freeze discipline (freeze before data, pins, records)

Seat: R95Reviewer. Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Base 7b3912bb.
Freeze 1ecbca38, scored 360d7cc9 (master tip at review time).

## (1) Order: freeze -> scored -> wave — CONFIRMED

| artifact | timestamp |
|---|---|
| claims.json `frozenAt` | 2026-11-08T22:59:07-03:00 |
| plans/round-95.md mtime | 22:58:53-03:00 |
| freeze 1ecbca38 committer cI | 22:59:12-03:00 (author 22:42:01) |
| scored/started-at.txt | 22:59:19-03:00 |
| scored/c1-live.json mtime | 23:00:28 |
| scored 360d7cc9 cI | 23:00:44 |
| w1.ready mtime | 23:02:12 |
| w1.ready.dispatched mtime | 23:02:44 |

Chain: frozenAt (22:59:07) < freeze committer (22:59:12) < scored start (22:59:19) < scored commit (23:00:44) < w1.ready (23:02:12). Freeze precedes data; scored precedes wave dispatch and this review. `git show 1ecbca38` contains plans/round-95.md, claims.json, all instruments, all controls/*, all probes/*, sources/* — no scored/ dir (git ls-tree shows scored/ only at 360d7cc9). Controls were therefore committed before the scored run, not retro-fitted.

## (2) Instrument pins — all match at 1ecbca38, 360d7cc9, and master

`git show <rev>:<path> | sha256sum` for each of the three scripts:

| instrument | claims.json pin | 1ecbca38 | master (=360d7cc9) |
|---|---|---|---|
| chrome-cdp-backendnode-misdelivery-round95.mjs | 24947b00…e2ee82 | 24947b00…e2ee82 | 24947b00…e2ee82 |
| check-backendnode-misdelivery-round95.mjs | b7b464da…d2775 | b7b464da…d2775 | b7b464da…d2775 |
| negatives-backendnode-misdelivery-round95.mjs | 1a670da5…5075abf0 | 1a670da5…5075abf0 | 1a670da5…5075abf0 |

Full hashes also match controls/instrument-sha256.txt exactly. `scored/c1-live.json` pins `driverSha256: 24947b00…` and `revision: 1ecbca38…` (freeze, not scored commit — correctly separates measured revision from shipping commit).

Counter code read in full (scripts/check-backendnode-misdelivery-round95.mjs, 263 lines). Wording vs code: dead-on. `sameNode` (nodeName/nodeType/attributes/backendNodeId) implements "equals T"; `parentFileInputId` requires INPUT+type[file]+id in #p0..#p5 else collision ("any other node") else miss — no narrower property enforced. `parent-files` requires exactly the T input filled and no other; `child-files-after-cross` requires exactly [] on cross legs, `same-site` requires null cross fields on S. Ports/browsers/fixture/session per bullet all present. Counter is not narrower than the frozen sentence.

## (3) Scored legs vs predicate — no false clause read

Receipt: .ufo/waves/round-95/scored/live-receipt.json (18 legs, epoch order P286-1..S-3). Independently re-ran the counter in --receipt mode against this bytes copy: verdict clean, 336 checks, 0 findings (exit 0), branches identical to c1-live.json. `jq` walk of every predicate bullet (commands below):

**Every leg:** all 18 legs have exactly 1 chooser on iframe session (P/Z) or page session (S) with B>0; `describeChooser` is INPUT type=file id=s backendNodeId B on the chooser session; snapshot root `#document` with documentURL = parent URL; `atB.length <= 1` and every atB entry carries B; parentInputs exactly [p0..p5] in order with 6 distinct integer ids; `describePage` equals T on all four fields when T exists (15/15 verified true on nodeName/nodeType/attributes/backendNodeId), else exactly `No node found for given backend id` (Z-1..3); `answer` on chooser session no error and childFiles exactly [["tabi-r95-answer.txt",22]]; childClicks exactly one trusted click on s; browserVersion `Chrome/155.0.8059.84` on all 18; 18 distinct UUID-shaped browserIds (verified).

**P/Z legs:** exactly 1 attached + 1 listed iframe target, same targetId = childFrameId, listed URL = childUrl, snapshot inputS = 0 — verified 15/15. Cross outcomes:
- P286-1: T = INPUT#file id=p3 → crossAnswer error null, parentFilesAfterCross exactly p3=[["tabi-r95-answer.txt",22]] others [], filesAfterCross [] → misdelivery. ✓
- 11 collision legs (P287-1, P288-1, P289-1, P286-2, P287-2, P288-2, P289-2, P286-3, P287-3, P288-3, P289-3): T = #text or shadow INPUT type=button id=file-upload-button → error exactly `Node is not a file input element`, all parent inputs [] and filesAfterCross []. ✓ (P289 legs carrying the shadow button are correctly counted collision, not misdelivery — "any other node".)
- Z-1..3: no T, crossAnswer exactly `No node found for given backend id`, all empty. ✓

**Z legs:** no T on all 3; maxBackendNodeId 59 < B 302 on all 3. ✓

**S legs:** 0 attached + 0 listed iframe targets on all 3; T = INPUT#file id=s (B 617), describePage identical, crossAnswer/parentFilesAfterCross/filesAfterCross all null, inputS = 1. ✓

**Leg set:** 1 misdelivery P leg (P286-1) + 11 collision P legs (≥1 each required). ✓

**Receipt identity:** schema `tabi-chrome-cdp-backendnode-misdelivery-r95`, nonce `tabi-r95-live-36ad06703d0b`, driverSha256 pin, chromium `Chromium 155.0.8059.84 Arch Linux`, reps 3, pad 300, qs [286,287,288,289], zq 0, sq 288, k 6, crossHost `localhost`, ports {31991,31992,31993} distinct in range, failures [] with no leg error — all verified. B echoed identically on chooser/snapshot/describe/cross/answer records on every leg. URLs http: on named hosts without userinfo/fragment.

No leg was read false against any clause. (Note: scored misdelivery rate 1/12 P legs vs positive control 4/12 — declared limit 3 explicitly disclaims which P leg misdelivers; "at least one" held on both runs.)

## (4) Controls table vs committed cells — all observed cells match

Re-ran the counter on the committed control receipts + inspected rc.txt and every counter-*.json:

| control | expected (plan) | committed evidence | verdict |
|---|---|---|---|
| no-work base | absent rc128 | rc.txt `no-work-base rc=128`; re-ran `git cat-file -e`: fatal/rc128 ✓ | OK |
| no-work r94 receipt | rc1, ids incl. schema, describe-page, snapshot, parent-inputs, branch-* | counter-donothing-r94.json re-run: rc1, 35 findings, ids = schema nonce driver-pin fixture answer leg-set leg-arm parent-url snapshot parent-inputs describe-page same-site child-files branch-misdelivery branch-collision. Plan's "15 ids incl. …" is a representative subset; actual ids superset it. The cell phrases ids as "incl." so this is consistent, not a mismatch. | OK |
| parent never reaches B | rc1 incl. branch-misdelivery, branch-collision | counter-noreach.json: rc1, findings fixture leg-set leg-arm branch-misdelivery branch-collision (+ shown) ✓ | OK |
| wrong-site live | rc1 with behaviour ids | counter-wrongsite.json: rc1, ids cross-host child-host child-url iframe-targets chooser describe-chooser snapshot cross-answer parent-files child-files-after-cross answer z-miss branch-misdelivery ✓ | OK |
| positive | rc0, 336; misdelivery P286-2 P289-2 P286-3 P289-3; collision 8 P legs (P286-1 P287-1 P288-1 P289-1 P287-2 P288-2 P287-3 P288-3); miss Z-1..3 | counter-positive.json re-run: clean 336, identical branches ✓ | OK |
| battery | 77/77 | battery.json cases 77 ok 77 failed [] ✓ | OK |
| setup busyport / sigterm / driverkill / receiptdir / launchfail | rc2 setup each, with driverRun + 0 chromium left | 5x counter-setup-*.json all carry verdict setup + driverRun; rc.txt shows leftover 0. driverkill detail "signal SIGKILL, 12 swept" matches plan cell; sigterm `interruptedBy SIGTERM` matches. ✓ | OK |

Every `observed` cell in plans/round-95.md §Controls is supported by the committed artifact; run-controls.sh reproduces the exact commands inline (driver `--qs 0,1,2,3`, `--cross-host 127.0.0.1 --reps 1`, busy-port 31971, SIGTERM/SIGKILL at 8s, receipt-is-dir, 90+-byte TMPDIR).

## (5) Record receiptSha256 — matches both copies

sha256 of .ufo/waves/round-95/scored/live-receipt.json = e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404.
sha256 of corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json = same. Both equal `c1-live.record.json: receiptSha256` and `c1-live.json: receiptSha256` (e5d13b76…). `c1-live.record.json` lists both committed paths under `receiptCommitted`; `measuredRevision` = 1ecbca38 with an explicit note naming the shipping commit separately (D1/D3 record work respected). Nonce and checkCount 336 agree across record, c1-live.json, and receipt.

## Residual risk / gaps

- None blocking. Counter `--receipt` re-run against scored bytes reproduced 336 clean — counting is independent of the original --live invocation.
- Did not re-execute a --live run (no ports assigned to this seat; review is read-only on committed bytes). Wording-vs-counter comparison was line-level, not a full symbol audit.
- Working-tree state at review time: untracked w1 dirs + scripts/check-scored-receipts-round95.mjs + mined/ and modified corpus/SOURCES.md present, but these are post-freeze artifacts (w1 dispatch at 23:02) and do not affect freeze bytes, which were verified at the named commits.

## Commands exercised (exit codes)

- `git -C $R log -1 --format=%cI 1ecbca38` / 360d7cc9 / 7b3912bb (0)
- `git show <rev>:<path> | sha256sum` ×9 (0/0/0 per rev; vs claims.json pins + instrument-sha256.txt)
- `sha256sum $W/scored/live-receipt.json corpus/.../receipt.json` (0, identical e5d13b76…)
- `jq` full-leg walks over scored/live-receipt.json (all 18 legs, every predicate bullet; 0 findings)
- `node scripts/check-backendnode-misdelivery-round95.mjs --receipt $W/scored/live-receipt.json --expect-nonce tabi-r95-live-36ad06703d0b --json` → clean, 336, exit 0
- Same counter on receipt-positive.json → clean 336; on r94 receipt → rc 1, 15 ids (incl. the 6 named in plan); `git cat-file -e 7b3912bb:…` → rc 128
- No chromium processes spawned by this seat; scratch /fast/scratch/hyaku/tabi-r95/R95Reviewer left empty.

VERDICT C1: neutral
