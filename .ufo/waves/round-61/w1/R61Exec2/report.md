# R61Exec2 — C2 pointer-domain runner

## Scope and axes
Coverage: page-side PointerEvent delivery on Chromium 155 Linux. Operability: explicit loopback CLI, isolated profile, keyed teardown. Calibration: invocation-bound nonce, verbatim DOM logs and retained red-receipt path. Claims authority read first and unchanged. No commits, package installs, other lane-tree edits, delegation or counter execution.

## Deliverable / CLI
Created `scripts/chrome-cdp-loopback-round61.mjs` (standalone Node built-ins; no npm dependencies).

`node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round61.mjs --scratch <ABS dir> --out <ABS receipt.json> --nonce <tabi-r61-lowercase/digits/hyphens> --http-port <1024..65535> --cdp-port <1024..65535>`

All five arguments required. Ports must differ; both bind-prechecked on 127.0.0.1 before browser launch. Existing receipt path is refused. Scratch is write-probed and realpath-validated against the default profile. Own 0700 profile, throwaway HOME/XDG_CONFIG_HOME and --disable-extensions. Browser group killed by discovered child PID, followed by token/profile/crash-database /proc sweep; both socket probes and actual curl statuses embedded. Exit 0 full journey/closure; 1 retained red receipt; 2 precondition refusal.

Inline fixture saved to scratch at launch; field2 focusin tracking proves the control was never focused. Per-character keyDown/keyUp mapping follows r52/r59, with value read after each pair. No Enter or submission. Press/release logs, active element, timestamps, PNGs, keydown-only top-level keylog window, full page keylog, plainTrace, journey.form, steps/stepsExtended and teardown are retained in the r59 envelope style. No unrelated r59 CapsLock/chord/swallow/submission legs are replayed or claimed.

## Probe and smoke (only browser executions)
No labrat seat spawned: the read-only hypothesis probe was run directly in owned scratch before authoring the full runner. Retained source ` .ufo/waves/round-61/w1/R61Exec2/probe.mjs`; receipt `.ufo/waves/round-61/w1/R61Exec2/probe-receipt.json`; output `probe-stdout.json`; fixture `probe-fixture.html`; PNG `a-pointer-press.png` under the same report directory.

Probe CONFIRMED: pointerdown pointerType mouse, pointerId 1 (number), isTrusted true, button 0, buttons 1; focused field. Complete observed order pointermove, pointerdown, mousedown, pointerup, mouseup, click. Pre/mid/post sweep 0/13/0; survivors []; both ports closed; both post-kill curls 7.

Smoke receipt `.ufo/waves/round-61/w1/R61Exec2/smoke/receipt.json`; output `smoke/stdout.json`; fixture `smoke/fixture.html`; PNGs `smoke/a-pointer-press.png` (11454 bytes) and `smoke/b-typed.png` (13670 bytes). Chromium 155.0.8059.84 Arch Linux. Nonce `tabi-r61-smoke-ccf4a47bf6bc`: all 27 prefix readbacks matched; 27 keydowns and 54 full key events; final field value exact nonce; field2 empty, field2Focused false; focus stayed field; failures []; predicate true. Pre/mid/post sweep 0/13/0; survivors []; fixture/devtools closed; curl fixture/devtools 7/7.

**Not every ptrlog entry carries pointerType mouse:** mousedown and mouseup are legacy MouseEvents and have undefined pointerType/pointerId, omitted by JSON serialization. Their isTrusted is true. All three pointer* entries carry mouse, numeric pointerId 1 and isTrusted true; click also carries these fields. The array is copied verbatim, never filled with fabricated mouse fields. All six events are trusted. Press timestamp 22.80000001192093; release 79.20000000298023 (page timeStamp, not driver clock).

## SHA256 pins (sha256sum exit 0)
| Artifact (lane-relative) | SHA256 |
|---|---|
| scripts/chrome-cdp-loopback-round61.mjs | ed712fb8148b9d41f95c239e25b7821c9d8cb46fb03f0de06a8b2129349388d8 |
| scripts/chrome-cdp-loopback-round59.mjs | b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 |
| corpus/evidence/round59/chromium-capslock-boundary/receipt.json | 72514ff700cab2211b6507f8e423716ffe60e02affd5161f7d704486b483a083 |
| .ufo/waves/round-61/claims.json | d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e |
| .ufo/waves/round-61/w1/R61Exec2/probe.mjs | 1542c2b0be7fb0d531d4f2bf5c16fbe42531a8538322c8598e2f5e9fd7862925 |
| .ufo/waves/round-61/w1/R61Exec2/probe-receipt.json | a51698b494581f8f6814bcc901ec02d6fcd51060814cf1eed498d9b4cd08ce5b |
| .ufo/waves/round-61/w1/R61Exec2/a-pointer-press.png | e8e86b1b3eaf64cc4409c386f49d255bd8efca3c191d5a8cce739b219a9726fb |
| .ufo/waves/round-61/w1/R61Exec2/smoke/receipt.json | 3ad62723cf7e16b9bd6bbefa8a9f3c00e41d36b61413c4c85c834c8441088e0b |
| .ufo/waves/round-61/w1/R61Exec2/smoke/a-pointer-press.png | 7082df0711fccd5dab7398b36eb031942019189d66afc34a8b9b8893401e00d4 |
| .ufo/waves/round-61/w1/R61Exec2/smoke/b-typed.png | bacbbb0cf7efb72ec4844fa1fce0a1b27e9cf7c556f1aca1fc8c976c8599e98a |

Fixture hashes and per-PNG hashes additionally reside in the corresponding receipts; source pins above were measured, not inferred.

## Commands and exit codes
All shell invocations used explicit cwd and absolute file arguments. Read/write/eval tool calls are recorded in the seat transcript, not shell commands with exit codes.

1. Environment command: `wc -l /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-61/claims.json /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round59.mjs; node --version; /usr/bin/chromium --version 2>/dev/null | head -1; mkdir -p /fast/scratch/hyaku/tabi-r61/R61Exec2 && echo scratch-ok` — supervised completion exit 0. This mistakenly used a named service tool call (see deviations), completed without intervention; not a browser run.
2. `node /fast/scratch/hyaku/tabi-r61/R61Exec2/probe.mjs --scratch /fast/scratch/hyaku/tabi-r61/R61Exec2/probe --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-61/w1/R61Exec2/probe-receipt.json --nonce tabi-r61-probe-a391bc --http-port 46361 --cdp-port 46362` — exit 0.
3. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round61.mjs --scratch /fast/scratch/hyaku/tabi-r61/R61Exec2/smoke --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-61/w1/R61Exec2/smoke/receipt.json --nonce tabi-r61-smoke-ccf4a47bf6bc --http-port 46361 --cdp-port 46362` — exit 0.
4. `sha256sum` with the ten absolute artifact paths listed in the SHA256 table, in table order — exit 0 (exact arguments are the lane root plus each table path).
5. `rm -rf -- /fast/scratch/hyaku/tabi-r61/R61Exec2` — exit 0; scratch removed after all retained evidence copied.

Runner-internal subprocess results in each receipt: Chromium version exit 0 (required to proceed); post-kill curl commands `/usr/bin/curl --noproxy '*' --silent --show-error --max-time 2 http://127.0.0.1:46361/` and the same on 46362: exit 7 each. Browser is deliberately SIGKILLed, not claimed to exit normally.

## Deviations, frozen-claim/instrument findings, risks
- No subagent runtime available/used; optional probe executed directly. Probe result retained before final source authoring.
- Assignment says CDP mousePressed button 0. CDP takes enum 'left'; numeric 0 is the DOM witness. Used 'left' and measured button 0, not a synthetic event.
- Frozen claim calls the receipt a schema superset of r59/r60 while the direct runner assignment says no Enter/submission and only two inputs. Implemented the requested pointer-only journey and retained shared envelope shapes, not unrelated legacy values or dummy legs. Integration must ensure the r61 counter accepts this disclosed shape; no legacy green inferred. Frozen predicates untouched.
- Broad wording 'every ptrlog entry' cannot require PointerEvent-only fields on legacy MouseEvents; exact observed exception documented above. Frozen C2 statement itself correctly scopes mouse/type/id requirements to pointermove/down/up.
- r59 teardown did not embed post-kill curls; this runner adds postKillCurl to satisfy the explicit frozen C2 closure proof. r59 process-group/sweep and port-probe mechanics retained.
- Inherited /proc sweep assumes readable /proc cmdlines; port probe classifies socket errors as closed like r59. No hostile-host guarantee claimed.
- First environment invocation mistakenly set tool service name `probe-env`, causing supervised execution despite the no-background posture; it exited 0 immediately. It also used head/redirection for one version line. No persistent service remains; all subsequent tool shell invocations were unnamed, finite and foreground.
- LSP unavailable: no LSP tool mounted in this seat. Used source reads, no symbol refactor performed.
- No tool installs/updates. No build/lint/test/formatter/counter/selftest gates run; only explicitly assigned hypothesis and smoke browser executions. Parent owns instrument freeze, committed data pass, r61-counter acceptance, forged receipts, cross-refusal and full admission. Smoke is not the committed live receipt and does not establish claim admission.

Report: .ufo/waves/round-61/w1/R61Exec2/report.md
