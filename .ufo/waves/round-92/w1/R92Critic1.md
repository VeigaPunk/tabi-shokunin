# R92Critic1 — C1 wording vs counter (round 92, w1)

Axes: wording-truthfulness (X), binding-strength (Y), forgery-closure in --live (Z).
Seat: R92Critic1. No chromium run. Scratch /fast/scratch/hyaku/tabi-r92/R92Critic1 (removed before yield).

## Wording clauses vs counter lines (counter check-iframe-chooser-round92.mjs, 141 lines)

| # | Stated wording (round-92.md §Claim + claims.json statement) | Enforced by | Verdict |
|---|---|---|---|
| 1 | Chromium 155.0.8059.84, `--headless=new`, Linux | L93: `chromium.includes('155.0.8059.84')`; driver spawn L122 hardcodes `--headless=new`; no OS/build check in counter. Substring match only (forgery G). `--live` safety rests on driver bytes, not counter check. | Partial |
| 2 | `--live` runs pinned driver (sha before run) | L65-67 pin gate + L73 spawn of pinned path + nonce L69 `tabi-r92-live-<6B hex>` + receiptPath L70. Yes in live. | Enforced (live) |
| 3 | 3 reps × 2 arms, fresh browser+profile per leg | Counter: `reps===opt` L95, leg-set L102. Freshness: NO receipt field; only driver spawns new profile per leg L119-122. Counter never reads profile/process fields. | Partial (receipt-blind) |
| 4 | Parent 127.0.0.1:port/parent.html, one iframe, child holds file input #s | L115 parent-url (hostname/port/pathname only); iframe existence inferred via targets not DOM. `#s` existence never checked — only file readback + click target naming. | Partial |
| 5 | X: exactly 1 attached `iframe` via page-session flatten auto-attach | L121 count==1 (filtered type==iframe, so extra non-iframe survives — forgery C). flatten/autoAttach params never recorded/checked. | Partial |
| 6 | X: exactly 1 `iframe` in getTargets, same targetId, URL==childUrl | L121-122 (browser-iframe-targets also checks). URL equality yes. | Enforced |
| 7 | X: targetId == child frame id (getFrameTree root) | L125 yes. | Enforced |
| 8 | S: zero attached + zero listed `iframe` targets | L127-128 yes. | Enforced |
| 9 | Both: left click pressed+released on PAGE session at #s centre | `leg.click{x,y}` exists but L104-137 NEVER reads it (forgery B). Session/button/corner cases unverified. Only child-side `isTrusted` via L136. | UNENFORCED (receipt) |
| 10 | Exactly 1 `Page.fileChooserOpened` within 1500ms across all sessions | L130 count==1 yes. 1500ms/timing: no field, never checked (no forgery needed — field absent). | Partial |
| 11 | frameId == childFrameId | L133 yes. | Enforced |
| 12 | Arrives on iframe session (X) / page session (S) | L132 session string vs expected yes. | Enforced |
| 13 | `DOM.setFileInputFiles` with backendNodeId on same session, no error | L134 checks `answer.error===null` + session; `backendNodeId` NEVER read (forgery A: null/missing/999999 pass); actual CDP call unverified. | Partial |
| 14 | Child input reads exactly `[["tabi-r92-answer.txt",22]]` | L135 yes (whole array eq). | Enforced |
| 15 | Child recorded exactly 1 `click`, isTrusted, target `#s` | L136 eq `[{target:'s',isTrusted:true}]` yes. | Enforced |
| 16 | Receipt schema/nonce/pin/chromium/crossHost/reps/answer/failures/leg-set/per-leg error/ports | L90-97, L102, L110-115 yes (ports: child/http vs URLs; cdp port unchecked — forgery F tests collision via consistent edit, though battery lacks this case). Chromium substring (G); answer exact eq; leg-error null typed. | Mostly enforced; gaps noted |

Declared limits 1-6 are respected in text; limit 6 explicitly discloses --receipt forgery — so receipt-mode gaps alone do not falsify the stated (live) claim.

## Forgery receipts (receipt mode, exit 0, 93 checks — 7 envelopes in w1/)

All clones of controls/receipt-positive.json (nonce tabi-r92-ctl-pos, pin 0feca9…), run via:
`node scripts/check-iframe-chooser-round92.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 0feca9… --receipt <scratch> --expect-nonce tabi-r92-ctl-pos --json` → rc 0, verdict clean, 93 checks.
- `R92Critic1-A-null-backendNodeId.json` — backendNodeId null (violates cl.13 wording).
- `R92Critic1-B-wrong-click-coords.json` — click at (1,1) (violates cl.9).
- `R92Critic1-C-extra-noniframe-attached.json` — extra `device` target (violates cl.5 "exactly one … target").
- `R92Critic1-D-aux-fields-garbage.json` — parentFrameId/rep/browserVersion/generatedAt garbage.
- `R92Critic1-E-userinfo-https.json` — userinfo + https scheme on URLs (violates cl.4 `http://…`).
- `R92Critic1-F-port-collision.json` — childport==httpport consistently (violates cl.3/4 distinct ports; battery has no such case).
- `R92Critic1-G-substring-extra.json` — `chromium:'x155.0.8059.84y'`, mode selectMultiple, extraneous fields (violates cl.1/16 by substring/extra-field looseness).
Plus probes (scratch-only, same method): short targetId/frameId `'SHORT'` rc0; wrong `?leg=` query rc0; 8/16-hex frameIds rc0; extra top/leg fields rc0. No stage shows counter-vs-wording contradiction in live-bearing clauses (6,7,8,11,12,14,15,16-core).

## Does --live close forgery? (the Z axis)

Structurally yes for whole-receipt replacement, with a narrow TOCTOU caveat:
- Pin gate L65-67 runs before spawn; L73 passes pinned `driverPath` + random 48-bit live nonce L69 + `--cross-host localhost` hardcoded; receiptPath is counter-chosen `scratch/live-receipt.json` (L70), `rmSync` pre-delete L72. A --receipt-mode forger cannot replay a prewritten receipt: nonce mismatch (L91) + attacker would need to write the exact file the driver wrote.
- BUT: counter does NOT hash the receipt it reads: driver writes `--out` then counter `readFileSync(receiptPath)` (L79). The file lives in caller-supplied `--scratch` (world-writable if perms allow). Between driver's `writeFileSync` (driver L227) and counter's read, ANY local actor (or racing process) who can write `scratch/live-receipt.json` can swap it. The window is small but the scratch dir is also where the driver works; attacker with write access to the scratch tree wins trivially. Standard mitigation would be: open/verify by holding an fd, or re-hash — absent. This is a genuine --live weakness, yet it requires local write access to the operator's own scratch, and the plan's threat model (receipt forgery) is remote/prerecorded receipts, not concurrent local race.
- A second --live gap: `ports` validation (L64) accepts any digits (e.g., '1,1,1'); driver's own checks (driver L59-67) reject duplicates/<1024, and spawnSync passes them through. A bad-port invocation surfaces as driver error + leg errors → findings. Not a forgery bypass.

## Calibration for judge

- Receipt-mode gaps are REAL but DECLARED (limit 6). They earn no falsification of the stated live claim: VERDICT must stay neutral on wording unless a live-bearing clause fails.
- Strongest live-relevant candidates: cl.9 (click on PAGE session at #s centre), cl.13 (backendNodeId), cl.5 (flatten params). In --live these are guaranteed BY THE PINNED DRIVER BYTES — driver L140 (flatten auto-attach), L185-186 (pressed+released on `ps`), L194 (first chooser, DOM.setFileInputFiles with its backendNodeId on `sid`), L187 (1500ms await). Only a driver change — caught by pin L65 — can break them. So they do NOT falsify the stated wording under the counting command. They DO mean the counter alone (without pin) underbinds vs wording — a known, disclosed design (counter header L15-17 mirrors limit 6).
- cl.1 substring, cl.4 userinfo/scheme, cl.5 extra-non-iframe: wording (`http://…`, "exactly one … target") is strictly wider than counter. Forgery E (userinfo `http://evil@127.0.0.1…` — hostname still 127.0.0.1) shows `http://` prefix literality unenforced in receipt mode; in live mode driver always writes `http://` without userinfo (driver L116-117 fixed template), so live honors wording by driver construction. Neutral under counting command; flag as wording-precision debt only.
- Proof burden note: every envelope above claims counter exit 0 — verified (commands + exits above). Battery (negatives script) covers 31 cases but MISSES: backendNodeId, click coords, scheme/userinfo, parentFrameId, rep, browserVersion, port collision, chromium substring. Battery `1cec…` should add these as kills.

VERDICT C1: neutral
