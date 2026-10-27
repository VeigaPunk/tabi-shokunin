# W1-03 — adversarial review (Reviewer03)

## Findings

### High — D6's endpoint check proves mentions, not the measured diff window

`.ufo/waves/round-38/counters/c1-routed-defects.mjs:213-222` selects only `names[0]`, then treats the presence of the baseline full hash or first 12 characters anywhere in the receipt and the first 8 REV characters anywhere as proof of `baseline..REV`. It never parses a command/header or compares endpoint order, nor verifies the `git diff --numstat` invocation/data. A receipt for an unrelated range can pass by carrying both strings in commentary. This makes D6's “window endpoints == baseline..REV” predicate falsifiable by a receipt whose actual diff endpoints differ but whose prose mentions both expected hashes. Counterexample probe: edit the selected receipt's actual command/header to `git diff <other-base>..<other-rev>` while retaining the expected hashes in a note; lines 220-222 still admit. A fix/evidence that falsifies this finding is an endpoint parser tied to the actual command and a red control changing either endpoint while leaving annotations intact.

### Medium — D3 freeze-landing validation is substring-based and not tied to the landing assertion

`.ufo/waves/round-38/counters/c1-routed-defects.mjs:153-154` defines `freezeLandingStated` as “`34ed508c` occurs somewhere in the Round-38 LOG slice” and no one of two narrow phrase orderings matches `99437d29`. It does not require that the LOG's freeze-entry landing field actually equals `34ed508c`; the hash can occur in unrelated prose while the landing remains misstated in different wording. Mutant falsification: retain a valid unrelated `34ed508c` citation in the section and change the freeze-entry assertion to `99437d29` using wording not matching the negative regex; this check remains true. The D3 per-commit tests do check the six pinned full hashes for presence/type/ancestry (lines 145-152), but do not cure this freeze-landing false acceptance.

### Medium — C2 driver cannot substantiate the absolute zero-egress claim from its sampling implementation

`scripts/playwright-firefox-loopback-round38.mjs:74-83` identifies browser PIDs by a command-line substring and samples `ss -tnp` only every 400 ms; `egress.samples` is incremented only inside the timer, and neither the driver nor its emitted summary requires samples > 0. `:164-167` reports the accumulated non-loopback samples as `egress`, which is readily zero if no sample ran or if a socket existed wholly between samples. Thus `egressNonLoopback === 0` supports only “no matching non-loopback socket was observed at sample instants,” not “zero non-loopback egress.” Falsification control: create a short-lived non-loopback established socket between 400-ms ticks (or make the run finish before the first tick); the receipt can still claim zero. Continuous/event-based socket observation or an explicit narrower claim plus a required positive sample count would falsify this review finding.

## Evidence and verification limits

- Frozen claim artifact and frozen instrument pins were checked: claims digest at commit and worktree is `90290008aee738cc0362801bb71f96adb44d6434030582716a1e53ff5587185b`; each of the five `frozenDigests` in `claims.json` matched `sha256sum` at the frozen worktree.
- Lane HEAD was exactly `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`.
- Bounded execution of the frozen C1 counter at that REV returned exit 1 (predicate false, expected before round-38 corrections); output showed D1 stale line present, no correction yet, and D2 recomputed 23/11 across 34 reports while no corrected LOG tally was yet stated. This is not evidence of post-fix C1 acceptance.
- At freeze there was no committed round-38 measure/receipt or C2 runtime receipt in the listed wave tree; therefore I did not claim a runtime result. The Firefox driver was inspected, not executed.
- No LSP device was available in the mounted tool inventory, so caller/definition/diagnostics checks were unavailable; findings cite direct source lines, not semantic grep claims.
- No tools installed. Scratch `/fast/scratch/hyaku/tabi-r38/Reviewer03/` was removed before filing.
