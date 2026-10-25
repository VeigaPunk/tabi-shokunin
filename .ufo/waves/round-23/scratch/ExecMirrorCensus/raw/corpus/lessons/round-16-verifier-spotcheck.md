author: hyaku closure (non-author integrator, @m_opus)

# tabi round 16 — measurement binding and native WebMCP on Chromium 154

## Decision and authority

**CLOSURE tabi r16 status=ok admitted=true.** C1 operability (enforced measurement-binding contracts 0→1) and C2 coverage + capability `webmcp-cdp-observation` (native-WebMCP held entries 0→1) verify in their declared, bounded senses. No axis is harmed. Baseline `e38d2599a922cb729186353830fff8e159b4fef0`; measured revision `3254740c694e4fc7851ca9d88b39230db3042ba6`; delivered lane HEAD `1205d261776a349af99a5a205c7c2467fbabae16`. Neither claim is exploratory. The hyaku orchestrator dispatched this closure, not the lane, and this closure did not author round 16.

Counts, digests, JSON propositions and history were re-measured over committed bytes with `git show`/`ls-tree`/`diff`/`cat-file`, `jq`, `sha256sum`, `awk` and `wc`. Gate, selftest, counter, liar-probe and harness outcomes are **evidence-verified** (PROTOCOL §Gate standard, Closure consequence), not re-executed. This closure ran no lane script: not `measure.mjs`, `check-measurement-binding.mjs`, its selftest, `webmcp-loopback-round16.mjs`, nor any browser launch. It did run:
- the mandated fleet census validator;
- read-only host probes `chromium --version` and `sha256sum /usr/lib/chromium/chromium`;
- `curl`/`git clone --filter=blob:none` re-opens of public sources into `/tmp` scratch, deleted afterwards.

Tools installed/updated: none. Reviewer seats dispatched: none.

Dispatch/completion digest, copied from the closure assignment (`.ufo/watchdog.log` is mutable; its line numbers are not evidence):

```text
2026-10-20T10:51:16-03:00 launch tabi round=16 pgid=2431273 driver=hyaku-inline attempt=1
2026-10-20T12:24:02-03:00 complete tabi round=16; hyaku-inline attempt=1
```

## Step-1 conformance

```sh
git -C /home/vgpnk/Projects/shokunin log --format='%an <%ae> %H %aI' -- .ufo/reports/round-16/tabi.md
/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh state /home/vgpnk/Projects/shokunin/tabi-shokunin
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-remote origin refs/heads/master
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --format='%h %an <%ae> / %cn <%ce> %cI' e38d2599a922..refs/heads/master
for h in $(grep -oE '\b[0-9a-f]{7,40}\b' .ufo/reports/round-16/tabi.md | sort -u); do git cat-file -t $h; git merge-base --is-ancestor $h refs/heads/master; done
```

| Check | Observed result |
|---|---|
| Real, landed report | `tabi-shokunin <tabi@shokunin.local> 5830720cd3cd1f52816ac9bf1d86c152dd6e7707 2026-10-20T12:23:36-03:00`. It has work performed, evidence pointers, a LOG-linked commit table, Sources & frontier, Trend verdicts and SHONEN, so it is not a marker. |
| Lane HEAD and push | `state branch=master local=1205d261… remote=1205d261… ahead=0 behind=0 head=attached tracked=0 untracked=0`; `ls-remote` → `1205d261776a349af99a5a205c7c2467fbabae16 refs/heads/master` |
| Clean lane | `status --porcelain` was empty before this artifact was written |
| Ordering and attribution | Five round commits `8f7feb3`, `b444ca8`, `3254740`, `6c8e0ff`, `1205d26`, all author/committer `tabi-shokunin <tabi@shokunin.local>`. The last is at `12:22:40-03:00`, before the report commit at `12:23:36` and the `complete` line at `12:24:02`. |
| Cited hashes | All 10 lane-commit strings (`e38d259`, `8f7feb3`, `b444ca8`, `3254740`, `6c8e0ff`, `1205d26`, in full and short forms) are commits and pass `merge-base --is-ancestor … refs/heads/master`. The 4 other hex strings are not lane commits and are labelled as such in the report: `4eb82895` is the round-16 counter's sha256 prefix at `8f7feb3` (re-measured: `4eb828956cfa…`); `f14762e6`, `cb3d1696` and `51ed7565` are WebMCP spec-repo revisions (`git ls-remote https://github.com/webmachinelearning/webmcp HEAD` → `51ed75653aaa…`). |
| SHONEN | Heading present with four `[~]` lines and pointers; no `[x]`. `SHONEN.md` is byte-unchanged e38d259→1205d26. |
| Prompt fidelity | Python loaded committed `templates/round-prompt.md` (`c030d1f`) and `.ufo/prompts/tabi-round-16.md` (committed by `tabi-shokunin` in `aa70582`). It substituted `{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}` (= `coverage + calibration (browser and web-interaction craft)`) and `<tabi-repo>`→`tabi-shokunin`. `prompt.startswith(rendered.rstrip())` → `True`. The remainder is the 146-line hyaku addendum §6. |
| History pin | `sha256(json.dumps(rounds[:48], sort_keys=True, separators=(',',':')))` is `ce97497e…` at both `ae19fca` and fleet HEAD, equal to `.ufo/history-pin.json`. `ae19fca` is an ancestor of fleet HEAD. |
| Evidence timestamps | Every ISO timestamp in the 14 non-fixture files under `corpus/evidence/round-16/` (3 timestamps) is at or before the commit that last ships that file. Receipt `generatedAt 2026-10-20T15:17:45Z` < `3254740` at `15:19:27Z`; first-run receipt `14:46:36Z` < `8f7feb3` at `14:54:43Z`. |

The frozen step-1/step-4 closure-checker certification for current inputs is still absent (carried by the lane, report line 140). It is **status-neutral protocol/operator debt**, not a pass, and the manual checks above do not substitute for it.

## Independent measurements

The counter blob is unchanged from the measured revision to the delivered HEAD, and so is every declared counted input. Commands:
- `git show REV:.ufo/waves/round-16/measure.mjs | sha256sum`
- `git --literal-pathspecs diff --name-only 3254740 1205d26 -- <all 9 countedInputs of both claims> .ufo/waves/round-16/measure.mjs`

| Revision | Counter sha256 |
|---|---|
| e38d259 | absent |
| 8f7feb3 | `4eb82895…` |
| 3254740 | `c8b4100a9f60dcd530ae752074e04d05074b4938cc05c6f19214add05e2594cb` |
| 1205d26 | `c8b4100a9f60dcd530ae752074e04d05074b4938cc05c6f19214add05e2594cb` |

The 3254740 and 1205d26 values equal both manifest `counter.sha256` entries and `measurements.json` `counterSha256AtMeasured`. The `diff` command printed nothing. `3254740..1205d26` touches only `LOG.md`, `SCORECARD.md`, `SKILL.md`, `QUALITY.md`, the lesson, `binding/check.json`, `c1-liar-probes.json`, `measurement-binding.json` and `measurements.json`. The counts therefore hold at `1205d26`.

### C1 operability — enforced measurement-binding contracts 0→1 (re-measured presence/identity, evidence-verified gate)

| Command (committed bytes) | Observed | Matches report |
|---|---|---|
| `git cat-file -e REV:scripts/{check-measurement-binding,selftest-measurement-binding}.mjs` | e38d259 absent, 1205d26 present. Gate sha256 `5150611c…` at 8f7feb3/b444ca8 → `1f84fb54…` at 3254740 = 1205d26; selftest `8c5426f2…` → `481eefae…` | yes (hardened at 3254740) |
| `jq '.C1' measurements.json` | before: exit 0, `c1_binding_contracts:0`, "gate or selftest absent at revision", counter blob at e38d259 = empty-file digest `e3b0c442…`. after (3254740): exit 0, `:1`, gate `1f84fb54…`/selftest `481eefae…` (equal to the blobs above), `selftest … verdict=clean cases=59 reasons=13`, `bad:0`, `missingVocab:[]`. The stub gate gives exit 1 with `verdict=failed cases=59`. The legacy `real-at-delivered` variation (at `36240c7`) has C1 `{counted_inputs_undeclared, counter_changed_since_measurement, counter_digest_unrecorded}` and C2 `{counted_inputs_undeclared, counter_digest_mismatch}` | yes |
| `jq measurement-binding.json` | 2 claims. Each has counter path + sha256 `c8b4100a…`, argv `{REV}`, a countField, non-empty `countedInputs` (C1 3, C2 6) and `measuredRevision 3254740`, with before e38d259 0 → after 3254740 1 | yes |
| `jq binding/check.json` | argv `--check corpus/evidence/round-16/measurement-binding.json --at 6c8e0ff9… --reproduce`, exit 0, `MEASUREMENT_BINDING verdict=clean claims=2 bound=2` | yes at 6c8e0ff; holds at 1205d26 by the empty counted-input/counter diff above |
| `jq binding/legacy-r15.json` | `--legacy corpus/evidence/round-15/measurements.json --at 36240c7` → exit 1, `verdict=failed claims=2 bound=0`, with the 5 findings named in the report. This closes round-15 routed defects 1/2 as machine-detectable. | yes (receipt is from the pre-hardening gate `5150611c…`; see routed 2) |
| `jq binding/selftest.json` | exit 0, 43 PASS / 0 FAIL, `verdict=clean cases=43 reasons=13` for gate `5150611c…` | history only. The 59-case run at the measured gate lives in the counter stdout above (routed 2). |
| `jq -c '.runs[]' measure/c1-liar-probes.json` | three liar revisions count 0 (`9ecfcc9`, `0754e44`, `7b497d1`); honest `b444ca8` counts 1; counter `c8b4100a…` | the counts match, but the pointer is unrooted: `git cat-file -t 9ecfcc9` → not a valid object, and the clone is `/tmp/tabi-r16-c1liar-93NO` (routed 1) |
| Registry home | `SKILL.md` round-16 section has a `measurement-binding` row with entry, verdict map `0 clean, 1 findings, 2 could-not-evaluate`, `--self-test` spelling, pinned/checked values and write scope; wave-2 correction rows are appended | yes |

**Verdict: operability improved.** The 0→1 is re-derived: a registered gate with its selftest is absent at baseline and present at HEAD. A digest-bound manifest is clean at the delivered HEAD by evidence plus the drift diff. The real round-15 file fails as expected. The C1 count does not rest on the liar probes, because the counter's own stub-gate and legacy-variation probes are in the committed counter. The author summary's word "unforgeable" overstates this: the probes defeat the three tested liar shapes, and the counter still runs revision code unsandboxed, as disclosed.

### C2 coverage + capability `webmcp-cdp-observation` — native-WebMCP held entries 0→1 (re-measured)

| Command (committed bytes / host) | Observed | Matches report |
|---|---|---|
| `git ls-tree --name-only REV corpus/knowledge/ \| grep -c '\.md$'` | 32 → 33; `webmcp-chromium-loopback-round-16.md` absent → present; the only knowledge diff is that added file (+156) | yes |
| `git show REV:corpus/README.md \| grep -c webmcp-chromium-loopback-round-16` | 0 → 1 map row (`:293`); frontier supersession text appended at `:295-317` | yes |
| note header | `source:` S020, S030–S037; `verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97, loopback only)`; `recheck:` present | yes |
| `awk` over `git show 1205d26:corpus/SOURCES.md`, rows S020/S030–S037 | all 9 are tier A, `mined`, with the note in `used-by` | yes |
| `jq '.summary,.verdict,.producerSha256' receipt.json` | `cases 11 passed 11 failed 0 missing 0 caseSetOk true`, `pass`. Producer `0adbbe0e…` = `git show 3254740:scripts/webmcp-loopback-round16.mjs \| sha256sum` | yes |
| `jq '.runs[]'` | 3 runs with real pids (4157146/4157284/4157547, each `gone:true`). The flagged run has `--enable-features=WebMCP,…` and `--enable-blink-features=…`. The flag-off run's only `webmcp` argv token is its `--user-data-dir=/tmp/tabi-r16-webmcp-…` profile path (`webmcpArgvTokens:[]`). Domain-disabled has `--disable-features=DevToolsWebMCPSupport`. `loopback.externalRequestCount 0` | yes |
| cases | `model-context-location`: `[object ModelContext]` on `document`, navigator false. `flags-off-negative-control`: `WebMCP.enable` → `{}` with `documentModelContext undefined`. `navigation-clears-tools`: `toolsRemoved:[]` | yes; matches SKILL decision rows |
| host: `chromium --version`; `sha256sum /usr/lib/chromium/chromium` | `Chromium 154.0.8037.97 Arch Linux`; `95b17db7…` = receipt `runtime.observed.chromium.realExecutableSha256` | yes (same build still installed) |
| `jq receipt-first-run-failed.json` | `passed 8 failed 3`, `fail`, `14:46:36Z` | yes (kept, disclosed) |
| `jq measure/count-after-c2-first-counter-defect.json` | `8f7feb3` with the counter blob of that commit → `c2_webmcp_held:0` | yes (history kept) |
| SCORECARD capabilities | `webmcp-cdp-observation`, first-working round16, evidence = harness command + committed receipt 11/11 | yes; the demonstration is in-round |

**Verdict: coverage improved; capability admitted.** The note sits on ground that the frontier row "Native WebMCP in chromium 152 — unprobed (census U3)" did not hold. It is scoped honestly to one build, flags and loopback. Chromium 152, real-site WebMCP, agent-side consumption and invocation-as-evidence stay open. Withholding coverage 9→10 is warranted.

### Harm check

`git diff e38d259 1205d26 -- SCORECARD.md` is +44/−0 and appends `## Round 16`. Scalars stay depth 8→8, coverage 9→9, operability 8→8, freshness 8→8, calibration 9→9 and adjacency 8→8; none is lowered.

A Python byte-prefix check (baseline bytes == HEAD prefix) holds for:
- `SKILL.md` (the baseline lacked a final newline; the only `−` line is re-added identically);
- `LOG.md`, `SCORECARD.md`, `corpus/QUALITY.md` and `corpus/README.md`;
- `PROVINCE.md` and `SHONEN.md`, which are byte-unchanged.

The only in-place `corpus/SOURCES.md` change is the S020 `status` queued→mined and `used-by` —→note cells. CORPUS.md §SOURCES rule 2 permits these, and the lesson logs them old→new. No existing knowledge note or report changed. The lane's no-harm gate runs are lane evidence (`.ufo/waves/round-16/harm-baseline.json`, `w2/AttackHarmGates.md`) and were not re-executed here. USER 6/10 stays red, as it already was at baseline (not a regression).

## Discernment and source spot-check

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`. `census` → rows 40, A31/B4/C5, mined33/queued2/rejected5. The baseline, from `awk` over `git show e38d259:corpus/SOURCES.md` (columns 5/9), is rows 29, A23/B4/C2, mined24/queued3/rejected2. Both match the report.

| Item (`corpus/lessons/round-16.md` `## Gate`) | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| C1 (`:16-22`) | admit | `measurements.json` `.C1.after`, `binding/check.json`, `binding/legacy-r15.json`, blob digests | agree | 59-case selftest clean at the measured gate; the stub gate turns it red; the legacy finding sets are exact; `--check --reproduce` clean, claims=2 bound=2, with no counted-input drift to HEAD |
| C2 (`:23-27`) | admit | `receipt.json`, harness blob digest, host chromium binary | agree | 11/11 with producer = committed harness; real pids/argv; the flag-off control carries no WebMCP switch; cited rows are mined A with the note in used-by; README row present; host executable digest equals the receipt's |
| S033 row (`:43`) | admit | `curl …/model_context_supplement.idl?format=TEXT \| base64 -d` | agree | sha256 prefix `50dd337d` = lesson; line 11 verbatim `[SecureContext, SameObject] readonly attribute ModelContext modelContext;` inside `partial interface Document` with `RuntimeEnabled=WebMCP` (6-word quote) |
| S030 row (`:40`) | admit | `raw.githubusercontent.com/webmachinelearning/webmcp/main/README.md` | agree | `:319` "…but it is not part of the specification at this time." is verbatim at main (`51ed7565`) |
| S038 (`:48`, `:28-33`) | reject | `raw.githubusercontent.com/Sgr57/webmcp-fork/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md` | agree | sha256 prefix `351c02db` = lesson; `:140` `!!navigator.modelContext` contradicts S033 (Document only) and the receipt's `navigatorHasModelContext:false` |
| S039 → S040 (`:49`, `:65-67`) | reject (superseded) | `bug0.com/blog/webmcp-chrome-146-guide`; `git clone --filter=blob:none webmcp` → `git show c7b5c70` | agree | `datePublished 2026-02-11T06:06:40Z`, and "The API lives at `navigator.modelContext`" is present. Spec commit `c7b5c7023f6e` (2026-05-27, "Move the `modelContext` getter to `Document` (#184)") changes `partial interface Navigator`→`Document`, so the post was stale later rather than false when written. S040's correction is sound. |
| coverage 9→10 / operability 8→9 (`:28-30`) | reject | receipt scope; SCORECARD round-16 table | agree | one build, flags, loopback only; USER 6/10 red; real-site ground open |

Source row re-opened: **S032**, written this round. Its lesson quote "Open Chrome and navigate to chrome://flags/#enable-webmcp-testing" is 6 words (≤25). The live page contains `chrome://flags/#enable-webmcp-testing`, `"dateModified": "2026-10-07"` and "Last updated 2026-10-07 UTC", which match the row's identity cell "page last updated 2026-10-07". Agree.

## Per-axis verdicts and trends

| Axis | Verdict | Basis |
|---|---|---|
| operability | improved | C1 verified 0→1 above |
| coverage | improved | C2 verified 0→1 above, with capability `webmcp-cdp-observation` |
| depth | unchanged | scalar 8→8; the SKILL decision tables are appends that this closure did not score |
| freshness | unchanged | S020 re-opened with drift logged and its anchor kept; no pin renewal |
| calibration | unchanged | scalar 9→9; QUALITY 22–25 are lesson-backed |
| adjacency | unchanged | kaidoku overlap reported, not absorbed; `PROVINCE.md` byte-unchanged |

- **expansion: improved.** Knowledge notes went 32→33 on frontier ground the map did not hold. Each `source:` cites a mined A row opened this round. The capability entered SCORECARD with an in-round demonstration. Sources went 29→40.
- **quality: improved.** Counts are now digest-bound and reproducible at the delivered HEAD, closing round-15 routed defects 1/2. Failing history is kept: the 8/11 first run, C2's 0 at `8f7feb3`, and the liar falsification. The stale kaika README clause carries an appended supersession, and no admitted entry failed its re-check.
- **discernment: improved.** All 7 sampled gate decisions (4 admit, 3 reject) agree with the re-opened sources. The lane's own S039 over-rejection became S040, mistake row `:94` and QUALITY 23/24, each lesson-cited.

## Integrator ruling — contested scope (tabi report `:136-137`, lesson `:113-116`)

Recorded for the operator and both lanes:
- **tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.
- **kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis (`kaidoku-shokunin/PROVINCE.md:53`, "Runtime observation (CDP)"). It cites tabi for browser-side mechanics.

This closure edits neither lane's PROVINCE. Lane-side follow-ups are routed below.

## Routed defects and retained debt (status-neutral)

1. **tabi: unrooted liar-probe evidence.** `corpus/evidence/round-16/measure/c1-liar-probes.json` and `.ufo/waves/round-16/w2/AttackC1Liar.md` resolve only through the tmpfs clone `/tmp/tabi-r16-c1liar-93NO`. The liar commits `9ecfcc9`/`0754e44`/`7b497d1` are not objects in the lane repo, and the liar gate/selftest blobs are uncommitted. Fix: commit the liar blobs, or a generator plus their digests, under round evidence so a fresh session can rerun the probe. This is not load-bearing for C1.
2. **tabi: gate receipts for the pre-hardening gate.** `binding/selftest.json` (43 cases) and `binding/legacy-r15.json` record gate `5150611c…`/selftest `8c5426f2…`, not the measured-revision gate `1f84fb54…`/`481eefae…` (59 cases). Today the hardened-gate tallies live only inside the counter stdout in `measurements.json`. Fix: commit `--self-test` and `--legacy` receipts at the registered blob, and label the existing two as history.
3. **tabi: report line 69 says `--check --reproduce` was run "again at `1205d26`" without a committed receipt.** This closure confirmed the claim through the empty counter/counted-input diff. Future rounds should commit the delivered-HEAD receipt or say "holds by drift diff".
4. **tabi: census U3 (`corpus/knowledge/browser-surface-census.md:188`) has no in-file pointer to the README `:295-317` supersession.** The map marks it. Next round's append-only note erratum or index row should point readers there.
5. **tabi / kaidoku: record the integrator ruling above.** tabi should cite it in its next PROVINCE/SKILL append. kaidoku should make its `PROVINCE.md:53` CDP row cite tabi for browser-side mechanics. Each lane does this in its own round.
6. **protocol/operator: frozen step-1/step-4 closure-checker certification** for current inputs is still absent; carried.
7. Inherited, unchanged:
   - USER 6/10, r07 survivor replay, user-record freezing, IPv6 origin, Git env, external-validator pin;
   - disclosed limits: the counter runs revision code unsandboxed; confinement is page-level only; the protocol-capture profile leaks a temp dir per run; the 8/11 pre-commit producer `cedccdf9…` was not retained.
   - Six wave-1 executors died on the m_swe rate limit. This is an operational record; the seat tallies (84 + 73) are author-reported and were not re-counted here.

SHONEN: all four boxes remain `[~]` with accessible pointers. This bounded closure did not cold-execute the §Recheck procedure or certify promotion criteria, so the boxes are **not** all non-author-checkable from this review. This closure made no `[x]`, promotion, mint or lane-file edit, and left L0 questions untouched.
