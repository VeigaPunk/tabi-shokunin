# R62Sentinel — source landing and freeze discipline

Scope: Tabi round 62, w1 only; calibration. Axes: frozen-byte integrity, input refusal, receipt provenance, process isolation, write discipline, source calibration. This is lane-authored advice, not outside admission or a judgment of either claim.

## Exercised checks

Machine-readable commands, working directories, exits, stdout/stderr, input pins and frozen hashes: [checks.json](checks.json). All launched checks used absolute paths and own scratch cwd. No browser was launched by this seat; no credential/profile reads, installations, fixture/VCS writes, model overrides or instrument edits were performed.

1. **Six frozen pins match both working files and committed FREEZE** `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`. `git -C <lane> show FREEZE:<path>` exited 0 for each; SHA-256 comparison passed 6/6 before the executable checks. The expected/exact hashes are:

| Frozen path | SHA-256 |
|---|---|
| scripts/gen-adjacency-snapshot-r62.mjs | 5c4a93e1ace85aaaf8f106b6201c304cb5b5b92405c5cb8a1bc492281ae776ca |
| scripts/chrome-cdp-loopback-round62.mjs | 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 |
| .ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs | b845973c0f16433b05080829cf66641df303cffa09a9dc291d1773b9b9c8afa6 |
| .ufo/waves/round-62/counters/rebind-r62.mjs | b627cc8be99b4813b1d2578179b5b4eb80bfe20f2dab775edd530c264374f14f |
| .ufo/waves/round-62/counters/chromium-receipt-r62.mjs | 971c84f602f6d79b9aa12f9872eba57463a938b425546f793c4b5df72bd5a006 |
| .ufo/waves/round-62/c1/snapshot-r62.tsv | 1e47eb02b0387393f87c501d16a196a2802ed6d75d8906d23b36970f23dedae4 |

2. **Current header accepted, old malformed header refused.** The current first line is exactly `lane<TAB>head`. The recorded exact v21 `--list-observed --fleet /home/vgpnk/Projects/shokunin --snapshot <r62 snapshot>` command exited **0**; r61 snapshot exited **1**, `snapshot header must be lane TAB head`. Because list mode reads `corpus/adjacency.tsv` relative to cwd (v21:359), I copied that input byte-for-byte into my own scratch and recorded its SHA-256, rather than start a tool inside the lane. No scoring source was copied or changed.

3. **Full downstream CLI distinguishes valid input from claim success.** Ran pinned v21 with `--repo <lane> --rev FREEZE --fleet <fleet> --snapshot <r62> --json`: exit **1**, predicate **false**, **206 findings**, including both missing r62 audit/delta ledgers at FREEZE. This proves the header is accepted, NOT that C1 passes at the freeze revision. Same full CLI with r61 snapshot: exit **2**, explicit header rejection. A later committed data revision is still required for C1's actual after-pass; no header-green receipt may substitute for it.

4. **r61 S153 payload pointer resolves at FREEZE.** `git -C <lane> show FREEZE:.ufo/waves/round-61/sources/s153-browser-protocol.json` exit **0**: **1,423,170 bytes**, SHA-256 **d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7**. Both match `s153-quotes.json` and its anchor pins. At baseline `57b29bade4b05b03cdb8fa151daec90ac9b1a29c`, path resolution failed; the freeze commit explicitly lands this previously missing payload. This is payload availability, not retroactive validation of r61's rejected claims.

5. **Actual post-dispatch C2 receipt inspected and independently checked.** Input `.ufo/waves/round-62/w1/R62Exec2/smoke/receipt.json`, launch command beside it: recorded driver exit **0**, own Exec2 scratch/profile, HTTP/CDP ports **19511/19512**. Its receipt has pinned driver digest, loopback origin, disabled extensions, no failures, pre/mid/post process counts **0/13/0**, no survivors, both port probes closed and curl **7/7**. I invoked the frozen counter CLI with that receipt, pinned driver and its PNG directory: exit **0**, predicate true, findingCount **0**. Independent `/usr/bin/curl --noproxy '*' --silent --show-error --max-time 2 http://127.0.0.1:<port>/` exited **7** for each port. These are point-in-time closure observations, not a fresh browser replay or proof of historical egress absence. Candidate pre-freeze `controls/smoke/receipt.json` is separately identified, never substituted for this live receipt.

6. **S165 reopened.** Read staged HTML raw lines **2014–2016**: `Right Mouse, Pen barrel button`, `2`, `2`. Independently reopened [MDN Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events), section *Determining button states*: same right-mouse row and button/buttons columns. This establishes the 2/2 mapping, not contextmenu timing. The reader response is a rendered representation, not a byte-identical transport/hash claim. Initial fetch command records curl exit 0 but does not retain HTTP status/final URL/redirect metadata; transport provenance is correspondingly limited.

## Findings and smallest remediation (no changes applied)

### F1 — Medium: process-enumeration errors can masquerade as zero survivors

**Evidence:** frozen driver `scripts/chrome-cdp-loopback-round62.mjs:110–134`: `sweepOnce()` returns `{pids:[], error:...}` on failed `ps`; `sweepToZero()` breaks on `last.error` but returns only counts/survivors. Teardown lines **214–222** never propagate that error; counter lines **38–40** trust the resulting zero-survivor fields.

**Failure path / impact [INFERENCE]:** if the final `ps` invocation fails while a token-keyed process remains, an empty list can certify closure; closed listener ports do not rule out a surviving crash handler/helper. Actual inspected receipts were green; this conditional failure was not injected or operationalized.

**Smallest remediation:** in a separately frozen future generation, carry enumeration errors into teardown and fail closure explicitly; test a failed final enumeration. Do not patch these frozen bytes.

### F2 — Medium, conditional: lexical scratch/profile guards do not enforce filesystem containment

**Evidence:** driver **41–69** uses `path.resolve`/prefix tests; `validateScratch` calls recursive mkdir before checking default-profile exclusion; `validateOut` accepts any absolute `.json` path. Profile writes and PNG output follow ordinary filesystem links.

**Exploit path / impact [INFERENCE]:** an operator-supplied symlinked scratch/output ancestor could redirect writes outside the declared scratch/profile/output boundary, including into an existing profile location. This requires hostile/misconfigured caller-controlled paths; no such redirection was observed in Exec2's declared paths, and no symlink exploit was executed.

**Smallest remediation:** future generation resolves and checks real ancestors before creation and confines outputs to authorized roots; refuse symlink redirection. Scope enforcement currently depends on trusted caller discipline.

### F3 — Low: receipt validation is consistency checking, not independent live provenance

**Evidence:** counter **17** checks three argv flags, not HOME/XDG/profile isolation; driver **230/233** sets throwaway HOME/XDG_CONFIG_HOME/TMPDIR but inherits the rest of `process.env`. Receipts do not record the effective HOME/XDG configuration. Counter consumes caller-supplied JSON and PNG digests.

**Failure path / impact [INFERENCE]:** a consistent locally fabricated receipt is not cryptographically distinguished from a real run; inherited settings or environment could weaken isolation without appearing in the receipt. This is a residual assurance boundary, not evidence that the observed run was fabricated or read credentials.

**Smallest remediation:** retain independently attributable launch evidence and explicit effective isolation settings; future driver can narrowly allowlist environment variables. Do not claim network sandboxing: loopback targets and background-network flags are not a kernel egress policy.

## Write, dispatch and freeze discipline

- Observed HEAD equaled FREEZE; baseline was its parent. Frozen bytes all matched. No pin transfer or scoring-predicate override was observed.
- Read-only git status/diff showed post-freeze integration additions to `SKILL.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`, `corpus/lessons/round-62.md`, and `scripts/check-secondary-round62.mjs`. **TabiR62 explicitly attested these five paths are L1-owned integration edits, not seat writes.** Filesystem evidence alone cannot identify the writer. The wrapper pins the frozen driver/counter, invokes their CLI, writes only its supplied scratch probes and removes its temp directory in finally. It is supplementary certification, not a third claim or substitute instrument.
- Dispatch names exactly 11 seats, all spawn and zero resumes; no `model` override field was found in inspected plan/dispatch/spec records. No other agent runtime was invoked by this seat. `resume_continuity_v1` rejection testing is outside this assignment: no resume requests exist in this wave; it was not exercised.
- Initial marker mtimes: ready **12:13:21 -0300**, dispatched **12:13:58 -0300**, plan/dispatch **12:13:18 -0300**. Ready names the dispatch and L1; dispatch marker names the 11 seats. No ready rewrite observed; mtimes/content snapshots are not a historical write audit.
- I wrote only my seat artifact directory, its separately authorized report trailer, and my exact scratch. No fleet writes, production writes, VCS mutations or process kills were performed by this seat. Concurrent fleet-wide/historical write absence cannot be certified from this bounded inspection.
- No overlap ruling made: uncertain kaidoku splits remain contested-open; unanswered keyup/kaidoku L0s remain unanswered. No selftest, mutation battery, F-probe battery or admission check is represented as exercised here.

## Calibration and handoff

No repairs made. Findings are prospective remediation targets, not post-score rescue. Full C1 at FREEZE is **red** despite valid header; C2 receipt counter and point-in-time port closure are **green** for the inspected live receipt only. Durable argv/exits and hashes are in `checks.json`. Initial exploration also encountered nonexistent scratch and two mistaken lookup paths; those failed lookups were corrected and never counted as passing checks.

Self-evaluation (1–5): accuracy **4** (conditional findings statically established, not injected); completeness **4** (bounded write/history and environment assurance limits explicitly retained); clarity **4** (separates input acceptance from admission); actionability **4** (small future-generation fixes identified); conciseness **4** (full pins/argv retained for reproducibility). Overall **4.0**. Highest-impact improvement is fail-closed enumeration in a future freeze; no change to this round's pins is authorized.
