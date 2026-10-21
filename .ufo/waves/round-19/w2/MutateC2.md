# MutateC2 — C2 counter/harness falsification

## Result

**Two mutants killed; one counter-aware no-invocation mutant survived.** The surviving mutant received `c2_h4_properties=2`, with both `h4a.closed=true` and `h4b.closed=true`, despite zero download-tool CDP invoke requests, zero tool responses, zero page execute calls, and zero genuine download events in that case. This is an advisory operability coverage finding, not an integration or scoring decision.

Axes: operability discrimination; evidence of the current invocation rather than nonce comparison alone; isolated mutation and exact byte restoration. No contract changes or production fixes were made.

## Method and retained evidence

- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; original baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Used a private `git clone --no-hardlinks` at `/fast/scratch/tabi-r19/fx-MutateC2`. Each mutant was a single contiguous behavior-bearing change to `scripts/webmcp-invoke-round19.mjs`, with all earlier mutation bytes restored first. The counter itself was never modified.
- Executed the actual CLI, not a replacement predicate or a synthetic self-test: executable `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, argv `["/fast/scratch/tabi-r19/fx-MutateC2/.ufo/waves/round-19/measure-c2.mjs", "<revision below>"]`, cwd `/fast/scratch/tabi-r19/fx-MutateC2`, with that Node installation's `bin` first in PATH.
- The CLI made its own B/revision sandbox clones, performed its normal/UUID/replay measurements, and also ran its built-in informational H1/F6 probes. No build, lint, formatter, unrelated test suite, or additional runtime was invoked. Calls were foreground and sequential; no background jobs, subagents, or host services were started.
- All seven measurements observed Chromium `154.0.8037.97`, Playwright `1.64.0`, Node `24.21.0`. Chromium real executable SHA-256: `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`.
- Full actual stdout, stderr, exit status, UTC timestamps, parsed counter output, mutant hashes, and restoration records: `.ufo/waves/round-19/w2/MutateC2.results.json`. SHA-256: `c8de8622398a59b78f68341e1fe456e19ae853cb8770caf51684db737e4be7ce`.
- JSON paths below use zero-based `runs[i]` in that artifact. Every CLI call exited 0, reported `evaluationStatus=complete`, and had empty baseline/revision `probeErrors`. Exit 0 indicates completed measurement, not acceptance of every property.

## Actual pristine / mutated / restored measurements

| Evidence | Revision | State | C2 count | H4a closed | H4b closed |
|---|---|---|---:|---|---|
| `runs[0]` | `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` | Pristine A | 1 | true | false |
| `runs[1]` | `5cd4f08c3eb9989713f28c102cce199c8ba2eb9b` | Mutant A | 1 | false | true |
| `runs[2]` | `b9b99819d92aa4c906179c55554e86de22a6114f` | Restored A / pristine B | 2 | true | true |
| `runs[3]` | `4d859b1c300e63324d309ffe1ce5d82b5fcc0298` | Mutant B | 0 | false | false |
| `runs[4]` | `6eac444f202227d835ff081d150ffb7ef088f19d` | Restored B / pristine C | 2 | true | true |
| `runs[5]` | `92b5742186d6e94e381e282739e2cbc33f028d21` | Mutant C | 2 | true | true |
| `runs[6]` | `48ad84f5bd385d255dce8154fac9b79462af74cc` | Restored C | 2 | true | true |

Measurements ran from `2026-10-21T08:41:19.277Z` through `2026-10-21T08:56:01.630Z`; each individual CLI call took approximately 95–99 seconds.

**Initial-baseline qualification:** `runs[0]` did not establish H4b: its replay-source receipt's download case had status `fail`, so `originalRecordPass=false`, although the current clean run passed. The counter did not retain the underlying failed source receipt, so its cause is unknown. That initial H4b arm is **inconclusive**, not a killed mutant. The valid B and C comparisons instead use the immediately preceding exact-byte-restored pristine runs, both of which established H4b. A is judged on its target H4a sequence `true → false → true`, not on the noisy aggregate count.

## Mutant A — miss the exact artifact-root prefix

- Locus at R: `scripts/webmcp-invoke-round19.mjs:824`.
- Smallest defect: change the recognized prefix from `playwright-artifacts-` to `playwright-artifact-` (delete one `s`). This makes the scanner omit the documented Playwright artifact roots.
- Expected detector: the counter's random UUID-file injection must no longer earn H4a closure when the harness fails to notice it.
- The unchanged counter creates a random `playwright-artifacts-<UUID>` directory directly under the harness's exact `processTmpDir`, writes a separate random UUID filename after the before-snapshot, and uses non-marker content. Its construction is at counter lines 187–209; the content prefix differs from the fixture download marker and does not contain those marker bytes.
- Actual mutated plant: `playwright-artifacts-27a5c656-7c04-41fb-9004-5942b2d2c7c9/d2d17736-e83f-438d-8934-b0a39e019783`; content SHA-256 `7252f649673e7c7e0c59414ab65e6e500549626b464e2cd8719c3dbb1789de16`.
- Actual `runs[1].output.h4.h4a.revision.harnessScan`: `scanComplete=true`, `scanListed=false`, `caseStatus=pass`, `receiptVerdict=pass`. H4a was not credited. Both pristine and restored scanners listed their independently generated UUID plants under a `playwrightArtifacts` root while the browser was alive and failed the case/receipt.
- **Verdict: killed on H4a.** H4a closure sequence: `true → false → true`.

## Mutant B — paste a genuine prior download record with the wrong nonce

- Locus at R: `scripts/webmcp-invoke-round19.mjs:2855`.
- One-statement defect: replace the page-read download record with the exact prior `{tool, nonce}` record obtained from the real-browser replay source in `runs[2]`. The rest of the harness, including the current real browser and actual invocation, remains live and unchanged.
- Prior source receipt SHA-256: `c61a7f0742080ac0d4d9cca501655c64d76965d08a65c025a2ed2e6a0aac6208`; `realBrowserObserved=true`, `originalRecordPass=true`. Its nonce was `10c66c572b7677838f2d6ff17fe7e7bd`.
- Scope precision: the sandbox mutation pastes the prior **page download record**, not an entire replacement producer receipt. Separately, the unchanged counter evaluates the entire earlier real-browser receipt against the new nonce in its built-in replay predicate.
- Expected detector: neither a live current browser nor otherwise valid invocation fields may rescue a stale-nonce record; H4b must not be credited.
- Actual `runs[3]`: counter-supplied current nonce `775a08fd50abd6f5f93295755c0e8ebe`; pasted nonce `10c66c572b7677838f2d6ff17fe7e7bd`; `nonceEchoed=false`, `invocationObserved=true`, `responseObserved=true`, `refusalObserved=true`, `browserObserved=true`. Three live run-owned Chromium identities were observed during the current run. The harness exited 1 with `verdict=fail`, and both closure properties were false because the clean-run gate failed.
- **Verdict: killed on H4b.** H4b closure sequence: `true → false → true`.

## Mutant C — echo the counter nonce without invoking the page tool

- One contiguous replacement at R's `scripts/webmcp-invoke-round19.mjs:2849–2855`; mutant locus `2849–2873`.
- Replace the download-case call/wait/page-read block with Node-generated invocation/response records, one fabricated refused-download event, and a download record whose nonce is copied directly from `args.nonce`. Preserve the real browser, registered loopback fixture, private profile, scanner, and cleanup. Do not call `cdpInvoke` or fabricate entries in the raw CDP recorder.
- The mutant also embeds contemporaneous diagnostic observations in `pageDownloadRecord.mutantEvidence`: the real page's execute-call array, counts of raw outgoing invokes and incoming responses, and the genuine download-event count before adding the fake event. These diagnostics are not required by the detector and do not alter its comparisons.
- Expected detector: the purported current-invocation proof is missing, so H4b must not be credited; under the assigned fake-harness criterion neither H4 property should receive credit from this fake clean run.
- **Actual:** `runs[5]` returned `c2_h4_properties=2`, `h4a.closed=true`, `h4b.closed=true`. The fake clean receipt exited 0 with `verdict=pass`, `producerPass=true`, and `browserObserved=true`; its receipt SHA-256 was `196a43f07877e91b292db219c8993dc9c700f515be9ae4871aad5f345a383ddf`.
- Actual accepted current page record:

```json
{
  "tool": "download-blob",
  "nonce": "a8381d12cd2fee96c9e8c0abf316a482",
  "mutantEvidence": {
    "pageCalls": [],
    "invokeRequests": 0,
    "respondedEvents": 0,
    "realDownloadEventsBeforeForgery": 0,
    "echoOrigin": "Node args.nonce, not page execute"
  }
}
```

- Nevertheless, the counter reported `nonceEchoed=true`, `invocationObserved=true`, `responseObserved=true`, and `refusalObserved=true` for that record. Three actual run-owned Chromium identities were observed, so this was not an idle receipt-only fake with no browser.
- Its earlier fake receipt also passed with its own nonce `6890ceedc90aa18a64287359e04a0180`. Comparing that receipt with the current nonce produced `replayRejected=true`, `originalRecordPass=true`, and `replay.pass=true`, even though that earlier record also carried all four zero-invocation diagnostics.
- The UUID injection still appeared in the real scan and failed the mutant's UUID run. That scanner behavior is valid; H4a's fake clean-run gate is what remained accepted. This finding does not claim the any-new-file scan itself missed that plant.
- **Verdict: survived.** Both closure properties remained `true → true → true` across pristine C, mutant C, and restored C.

### What the nonce comparison does and does not establish

At R, `measure-c2.mjs:462–491` accepts invocation and response fields from the harness receipt. It does not cross-check the download case's raw CDP command/event log or obtain independent page-execution evidence. `normalH4Shape` at lines 964–987 adds the receipt producer hash, scan result, exit/verdict, and observed browser ownership; those are insufficient to bind this particular tool execution.

`replayPriorShape` at lines 540–555 evaluates the same prior receipt twice with two expected nonce values. It establishes rejection of an unchanged old-nonce record. It is not a replay submitted through a new browser invocation and does not establish that a counter-aware producer invoked the current page tool. Mutant C demonstrates that difference at runtime: comparison-only inequality remains green while the supposedly current invocation never happened.

These are local code anchors, accessed 2026-10-21; counter decoded-file SHA-256 is `a8003530f0a7b95ef830f3eeb6fa6d9d9b420855396beea8911ac02ea1ec53a1`. Canonical local source URL: `file:///fast/scratch/tabi-r19/fx-MutateC2/.ufo/waves/round-19/measure-c2.mjs#L462-L555`. No external source was fetched or quoted.

## Byte restoration and process evidence

Pristine harness SHA-256, also observed after **each** restoration:
`953d209352976ce540764764c9ea4570d07e4d8e7649dc9b5c0ac2d56ebe77b9`.

| Mutant | Mutated harness SHA-256 |
|---|---|
| A | `a3806a19107ad311b3617449e259668f23d697c9a19f1fe8dd2d3f27749c873a` |
| B | `b00002b01deabf694a3eeb5fdbba275bfbabc2755144b2a78021804b9eb94ddf` |
| C | `b5b5270a4cdad228e78a43ea1bb15ed528740fe4e1fcbbd583a740b68c8b3a09` |

Counter SHA-256 remained `a8003530f0a7b95ef830f3eeb6fa6d9d9b420855396beea8911ac02ea1ec53a1`. R and the final restoration commit have identical Git tree IDs: `052098c1dab594e127d29ede189f07f6462f0ed0`.

Every counter child was awaited to completion. After all measurements, the 72 distinct PID/starttime/executable identities retained in counter output were checked against `/proc`; **zero matching live identities remained**. This check covers retained identities, not unretained intermediate child PIDs. The counter's own run/signal cleanup was exercised, and no owned process required an additional post-probe kill.

Tools installed or updated: **none**. No package transactions, host configuration changes, profile-content reads, real-site actions, or TCP DevTools listeners were used.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-MutateC2`
- Branch: `r19/fx-MutateC2`
- Base for this falsification sandbox: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, as required by the falsification override; not original B).
- Mutant commits: A `5cd4f08c3eb9989713f28c102cce199c8ba2eb9b`; B `4d859b1c300e63324d309ffe1ce5d82b5fcc0298`; C `92b5742186d6e94e381e282739e2cbc33f028d21`.
- Restoration commits: A `b9b99819d92aa4c906179c55554e86de22a6114f`; B `6eac444f202227d835ff081d150ffb7ef088f19d`; final C `48ad84f5bd385d255dce8154fac9b79462af74cc`.
- Changed paths during probe: only `scripts/webmcp-invoke-round19.mjs` in the private clone. Final changed paths versus R: none (identical Git trees).
- Direct LANE writes: only `.ufo/waves/round-19/w2/MutateC2.md` and `.ufo/waves/round-19/w2/MutateC2.results.json`. No LANE Git writes or production edits; no sibling or domain source tree was modified.
