author: hyaku closure (non-author integrator, @m_strong)

# tabi round 14 — non-shell counters and qualified historical metadata

## Decision and authority

**CLOSURE tabi r14 status=ok admitted=true.** C1 operability and C2 calibration verify in their declared bounded senses. No axis is harmed. Baseline: `bebe2efc4565bb068efd905e9ef78011bb6b4efd`; reviewed delivery: `5c7710d7393112f2163dd7efcaa38fccf534dfc2`. Neither claim is exploratory. This review was dispatched by the orchestrator, not the author lane.

Counts, JSON propositions, source identities and history were independently re-measured over committed bytes. Gate/selftest/runtime outcomes were **evidence-verified**, not re-executed. Neither this closure nor its read-only reviewers executed a lane gate, selftest, `measure.mjs`, browser runner, or browser. The explicitly mandated fleet source-census validator was executed. Review slices: CounterEvidence, MetadataEvidence, Conformance. No tools were installed or updated by this closure or its reviewers; concurrent host activity is not attributed to tabi.

Dispatch/completion digest copied from the closure assignment (mutable watchdog line numbers are not evidence):

```text
2026-10-20T03:42:36-03:00 launch tabi round=14 pgid=2153599 driver=hyaku-inline attempt=1
2026-10-20T04:25:36-03:00 complete tabi round=14; hyaku-inline attempt=1
```

## Step-1 conformance

Commands exercised directly or by the read-only conformance reviewer:

```sh
git -C /home/vgpnk/Projects/shokunin log --format='%an <%ae> %H %aI %s' -- .ufo/reports/round-14/tabi.md
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-list --count '@{u}..HEAD'
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-remote origin refs/heads/master
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff bebe2efc4565bb068efd905e9ef78011bb6b4efd 5c7710d7393112f2163dd7efcaa38fccf534dfc2 -- SCORECARD.md
```

| Check | Observed result |
|---|---|
| Real, landed report | `tabi-shokunin <tabi@shokunin.local> fcf97cba8f173d8cfca7af6363c009e32af5dc13 2026-10-20T04:25:13-03:00 round-14: tabi report`; all required sections, actual work, LOG linkage and resolvable commits: not a marker |
| Lane HEAD and push | HEAD and remote master both `5c7710d7393112f2163dd7efcaa38fccf534dfc2`; ahead count `0` |
| Clean lane | `status --porcelain` output empty before creating this verifier artifact; ignored runtime/cache directories are not uncommitted round work |
| Ordering and attribution | Delivered commit timestamp `2026-10-20T04:22:58-03:00`, before report commit; all nine round-work commits carry tabi author/committer identity |
| SHONEN assessment | Required heading and four `[~]` report lines, each with pointers; unchanged SHONEN.md; no self-certified `[x]` |
| Prompt fidelity | Python loaded committed template and dispatch with `git show HEAD:PATH`, substituted LANE, ROUND, FLEET_ROOT, AXES and `<tabi-repo>`; `prompt.startswith(rendered.rstrip())` returned `True` |
| Wave evidence | 32 dispatch tasks; executor4/scout7/connector4/reviewer7/critic4/sentinel2/revenger2/scribe2; L1 planner per explicit campaign ruling; no per-task model parameter; 32 report files |

All 17 word-bounded abbreviated/full commit strings in the report resolve and pass `git merge-base --is-ancestor HASH 5c7710d7393112f2163dd7efcaa38fccf534dfc2`: `0c5567e`, `0c5567e8a2b57fc64d5526f830941e2304cd2c35`, `20b72b9`, `20b72b9bdad30578ad1ef438527642c46dc79c68`, `4844f6c`, `4a300f6`, `4a300f676e4f9731402d85f409895fb1123aee4a`, `5c7710d7393112f2163dd7efcaa38fccf534dfc2`, `6be0990`, `6be099015ca347eab36c62f30551eab919c2ce5c`, `837b33a3988ebeea7f6b4ef5c04698da88909a73`, `bebe2ef`, `bebe2efc4565bb068efd905e9ef78011bb6b4efd`, `e570380`, `e570380d77180ab394256dd6187cac0c5eaf62ec`, `ed69b15`, `f942c62`.

The template retains MISSION's canonical advisory role buckets; campaign §6 explicitly supplies operator host aliases and planner handling. Actual host alias configuration was not independently inspected, and no routing certification is inferred merely from task records. The frozen step-1/step-4 checker certification for these current closure inputs remains absent, as already disclosed by the lane: **status-neutral protocol/operator conformance debt**, not a fabricated pass. Manual history-pin inspection is not that missing checker run.

History-pin check: Python loaded committed `.ufo/history-pin.json` and each `MANIFEST.json` at `ae19fca` and fleet HEAD, then computed `sha256(json.dumps(rounds[:48], sort_keys=True, separators=(',',':')).encode())`. Both produced `ce97497ed699a8f0939be062d042cf4d6e3e7531116fbe4681593991d67f0a8e`, equal to the pin. `ae19fca` is an ancestor of fleet HEAD. Closed-prefix integrity therefore matches by plain inspection.

## Independent measurements

The following operations were exercised in Python Eval using `subprocess` and committed Git blobs, not by invoking lane-authored counters. `B` and `A` denote the full baseline/delivery hashes above; `R` is the absolute lane path.

```python
import subprocess, json, hashlib, re, collections
def blob(rev, path):
    return subprocess.check_output(['git', '-C', R, 'show', rev+':'+path])
def obj(rev, path):
    return json.loads(blob(rev, path))
paths = ['scripts/check-round-contract.mjs',
         'scripts/check-user-round-contract.mjs']
for rev in [B, A]:
    non_shell = []
    for path in paths:
        text = blob(rev, path).decode()
        start = text.index('function runCount(')
        stop = text.find('\nfunction ', start+1)
        body = text[start:stop if stop >= 0 else None]
        non_shell.append(not bool(re.search(
            r"(?:spawnSync|execSync|execFileSync)\s*\(\s*['\"](?:bash|sh)['\"]", body)))
    print(rev, sum(non_shell))
gates = obj(A, 'corpus/evidence/round-14/gates.json')
for gate in gates['gates']:
    lines = gate['selfTest']['stdout'].splitlines()
    print(gate['path'],
          hashlib.sha256(blob(A, gate['path'])).hexdigest() == gate['sha256'],
          sum(line.startswith('SELFTEST name=') for line in lines),
          sum('result=FAIL' in line for line in lines))
c = obj(A, 'corpus/evidence/round-14/aria-metadata/corrected.json')
r = obj(A, c['original']['receipt']['path'])
print(all(hashlib.sha256(blob(A, v['path'])).hexdigest() == v['sha256']
          for v in c['original'].values()))
print(len(r['cleanup']['server']['perWorker']),
      r['cleanup']['server']['listeningAfter'],
      any(w['listeningAfter'] for w in r['cleanup']['server']['perWorker']))
```

This static absence test alone is not a security proof; parser/source review and digest-bound execution receipts below supply the behavioral part of C1. For C2, `git cat-file -e REV:PATH` finds no round14 corrected sidecar at baseline. At delivery it finds one, whose original receipt/pin hashes match; nonempty worker evidence derives the same false listening state, `qualified=true`, `browserExecuted=false`, `exactMatch=false`. This independently counts the qualified pair 0→1.

| Measurement | Baseline | Delivered | Report comparison |
|---|---|---|---|
| C1 non-shell runCount paths | 0 | 2 | agrees; behavioral evidence verified separately |
| C2 digest-bound qualified receipt/pin correction | 0 | 1 | agrees; no new browser execution |
| SOURCES rows | 28 | 29 | agrees |
| Tiers | A22/B4/C2 | A23/B4/C2 | agrees |
| Statuses | mined23/queued3/rejected2 | mined24/queued3/rejected2 | agrees |
| Knowledge notes / mapped / missing | 32/32/0 | 32/32/0 | agrees; no expansion claim |
| Newly added source IDs | — | S029 only | agrees; original rows unchanged |

Source histograms were computed by matching `^\|\s*S\d{3,}\s*\|`, splitting table cells and counting tier/status. Knowledge files came from `git ls-tree -r --name-only REV -- corpus/knowledge`; mapped names from `re.findall(r'knowledge/([A-Za-z0-9._-]+\.md)', blob(REV,'corpus/README.md').decode())`. Missing set was empty at both revisions.

### C1 operability — improved

Both baseline runCount implementations invoke `bash -c`; delivered paths validate their limited grammar and read Git by argv. ROUND preserves filtered tree paths, including two BRE filters; USER preserves its historical tree/content forms and no-match zero. Unsupported grammar and missing revisions fail closed. The reviewer's plain historical Git/count measurements on all 16 committed SCORECARD rows matched retained values. No gate was run to obtain those counts.

Both delivered source SHA256 values match `gates.json` and are byte-identical at cited code revision `f942c62580b1af7268645414bab102e6e7dff8d6` and delivery:

- ROUND: `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`.
- USER: `bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3`.

Committed `gates.json` selftest stdout equals the corresponding execution receipts. ROUND has **34 PASS records =32 fixtures+1 production-alias check+1 count-witness comparison**; USER has **37 PASS records =29 fixtures+1 alias+6 committed-row count controls+1 count-witness comparison**. Both top-level exits are 0; zero FAIL lines. Differential receipts show old clean/exit0/marker1 versus new `score_mismatch`/exit1/marker0 over the same isolated command/tree. The separate history-policy witnesses also have top-level exit0; they are not the malicious-count differential.

Final production evidence, `corpus/evidence/round-14/final-production.json`, names input `20b72b9bdad30578ad1ef438527642c46dc79c68`: ROUND exit0/10 rounds; USER exit1 `round_count`, “Found 6 user rounds, expected 10”. USER stops before production counting. Its counter evidence is isolated CLI and committed-row controls, not a green production run. Delivery adds that receipt and LOG; the relevant code is unchanged. The author's C1 measurement at `6be0990` is not misrepresented as a new HEAD run; this closure independently re-measured delivered artifacts and checked byte equivalence.

USER's exact history chain is deliberately revised for the new ROUND bytes: HEAD permits PRIOR/CURRENT; intermediate history permits explicit archived digests plus CURRENT, while a rollback-to-cutover fixture expects `history_rewritten`. This is disclosed in the report's Landed changes discussion. It is not a blanket exemption or demonstrated axis harm. Broader shell/environment/trust and legacy survivor-replay debts remain uncredited.

### C2 calibration — improved

Re-opened original receipt at its S029 anchor `837b33a3988ebeea7f6b4ef5c04698da88909a73` and delivery. Its one worker says `listeningAfter=false`, `closed=true`, `refusedAfterClose=true`; aggregate says true. The complete one-worker set and worker-local eight-case set agree with manifest/config. Thus any-worker-listening is false. The source pair, producer and runtime knowledge note are byte-unchanged across this round.

Independent committed-byte results:

- Original receipt: `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, 97073 bytes.
- Original pin: `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`, 1154 bytes.
- Corrected sidecar: `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`.
- Metadata checker: `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6`, matching verification.json and unchanged between executed `e570380d77180ab394256dd6187cac0c5eaf62ec` and delivery.

`aria-metadata/verification.json` records 16 passing selftest cases: **15 expectation-file CLI cases plus one in-process deterministic-derive comparison**, not 16 independent CLI fixtures. Eight fixture-file digests are persisted; the generated sidecar variants are not separately digest-pinned. The deterministic helper's literal expected exit/finding are committed in source, but its pass condition compares outputs of the same derivation: it is determinism evidence, not independent content correctness.

At the same repaired checker revision, original `--check` has exit1/18 findings/one failure `R14-ARIA-CLEANUP-LISTENING-AFTER-01`; corrected `--check` has exit0/27 findings/no failures/accepted=true. The retained `--witness` comparison exits0 with red→clean and original_unchanged=true. `--derive` reports wrote=false/identical=true. Initial failed executions at `f942c62` remain committed; the real-schema and Node-property repair did not alter the expected truths or original inputs.

Observed Node is 26.12.0; the descriptive recorded value is 24.21.0; minimumMajor is 20; exactMatch=false. **The retrospective metadata checker enforces that minimum; the historical producer does not read pin.node.** The producer's runtime pin match therefore cannot certify Node equality or historical minimum enforcement. “Descriptive” is the lane's qualified interpretation, not a new runtime observation.

Digest-bound here means the checked original receipt/pin/worker proof identities plus the exact sidecar hash retained in verification/counter evidence. It does **not** mean `--check` compares the sidecar's own complete bytes to that recorded hash or validates every duplicate descriptive field. Its core correction is recomputed and bound; unchecked mirrors are routed below. The current committed mirrors agree with the proofs, so this limitation does not falsify the one qualified correction.

## Discernment and source spot-check

All items were independently re-opened on 2026-10-20. Gate decisions are from the round14 lesson's Gate and execution addendum.

| Item | Author decision | Re-opened source | Outside judgment | Reason |
|---|---|---|---|---|
| C1 bounded non-shell historical counters | admit | Both committed gate scripts; gates.json; executions/roundSelfTest.json and userSelfTest.json | agree | Actual supported/refusal/differential controls and unchanged source digests support two counter cutovers, not whole-repo safety |
| C2 qualified historical correction / S029 | admit | round13 aria/receipt.json and runtime-pin.json; round14 aria-metadata/corrected.json and verification.json | agree | Complete nonempty worker evidence supports false listening state; original sources stay immutable and the correction is checked, without a browser refresh |
| Treat sidecar as new browser run, new coverage or audit | reject | Corrected sidecar execution/provenance fields; metadata checker source; https://playwright.dev/docs/locators §Locate by role | agree | Static historical derivation is not new execution; official docs explicitly say role locators do not replace accessibility audits and conformance tests |
| Treat recorded24.21.0 as enforced exact Node equality | reject | Original receipt runtime.node/pin.node; historical producer runtime pin matching; corrected sidecar node fields | agree | Observed26.12.0 differs; historical producer excludes Node from pin matching; current checker evaluates only minimum20 plus metadata distinctions |
| Arbitrary SCORECARD command as executable count authority | reject | Delivered parsers, malicious-count receipts and scoped historical supported grammar | agree | Closed counting forms preserve actual historical counts; interpreting arbitrary authored shell would exceed evidence and authority |

New row S029 re-open: `corpus/SOURCES.md:43` points to `corpus/evidence/round-13/aria/receipt.json` at `837b33a3988ebeea7f6b4ef5c04698da88909a73`, `cleanup.server.perWorker[0].listeningAfter`. Located quote **`"listeningAfter": false`**, **2 whitespace-separated words** (`len('"listeningAfter": false'.split())`), within the ≤25-word contract. It exactly supports the row's narrowly scoped worker-versus-summary discrepancy. Tier A is own-work authority for these recorded fields, not independent confirmation of browser behavior.

Also re-opened https://playwright.dev/docs/aria-snapshots §Aria snapshots: “A template is a constraint, not necessarily a complete serialization of the accessibility tree.” This agrees with the retained scope boundary. S029 is cited in the admitted lesson and its explanatory SKILL decision table; machine-evidence files do not themselves name S029, a traceability improvement routed below rather than a fabricated machine citation.

Executed required census:

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

Observed exit0, stdout:

```text
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

## Per-axis verdicts and trends

The required baseline→delivery SCORECARD diff contains 70 insertions and zero deletions, appending the round14 record. New scalar-before values match round13; no existing measurement is rewritten. Source/knowledge/province spot reads found no demonstrated harm.

| Axis | Verdict | Evidence and boundary |
|---|---|---|
| depth | unchanged | 8→8; bounded grammar/metadata precision, no broader expertise claim |
| coverage | unchanged | 9→9; knowledge/map32/32; no new domain ground or capability |
| operability | improved | 8→8; C1 verified 0→2 counter cutovers with actual controls |
| freshness | unchanged | 8→8; old runtime bytes/date preserved, no execution-date renewal |
| calibration | improved | 9→9; C2 verifies one qualified historical correction, retaining original contradiction and actual failures |
| adjacency | unchanged | 8→8; own-lane browser evidence and counting tools; no publishing, credential or forensic scope absorption |

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | unchanged | No new knowledge note, map row, frontier acquisition or capability; source-row growth alone is not expansion |
| quality | improved | Weaker historical summary is explicitly qualified by checked worker evidence; authored count prose no longer executes as shell; no currently admitted corrected fact was found false |
| discernment | improved | Outside sample agrees on admits and rejects; prior outside findings become lesson-backed QUALITY18/19, and current precision limitations are durably routed rather than hidden |

## Routed defects and retained debt

These are status-neutral conformance/precision items, not evidence that a bounded claim failed. Owners must address them explicitly next round; this non-author review does not edit author artifacts.

1. **tabi — metadata enforcement wording.** Qualify SKILL.md:1744, checker comments and sidecar note to distinguish a checker-enforced retrospective minimum from the historical producer, which never enforces pin.node. Keep recorded/descriptive interpretation separate from observed behavior. Do not rewrite frozen original evidence; append the correction in next-round artifacts.
2. **tabi — checker/mirror and selftest precision.** `check-aria-metadata.mjs:908-1084` validates core bindings/correction, but not all `cleanup.*` mirrors or `qualification.everyProof{ListensBefore,Closed,RefusedAfterClose}` fields. Either validate mirrors or explicitly exclude them from the checked contract. Describe the tally as 15 CLI cases plus one deterministic helper; preserve independent fixture expectations rather than treating same-function equality as content validation. Sidecar byte identity is pinned by verification/counter evidence, not by the checker itself.
3. **tabi — tamper classification.** Anchor/source mismatches currently become exit1 failed findings, rather than a `snapshot_tampered` could-not-evaluate outcome. Reconcile that interface with the Gate standard when certifying these retained snapshots. Exit2 itself is correctly declared in the current SKILL registry; an initial reviewer claim that the registry was absent was rejected after reading the actual row.
4. **tabi — counter receipt diagnostic precision.** USER malicious fixtures assert score_mismatch but not the intended reason, and `no_marker=0` also means not applicable on unrelated controls. Make applicability and reason explicit so future failures cannot be mistaken for the intended refusal. Current malicious controls explicitly report no_marker=1 and passed; no current marker leak was observed.
5. **tabi — source/evidence traceability and falsifier timing.** Add a direct S029 reference to newly authored machine-evidence metadata or its evidence index. At least AttackMetadata's wave report predates the new checker/sidecar; do not call that author-side source attack a review of delivered artifacts. This closure's source/code/evidence inspection supplies the current non-author spot-check, not a claim that all author seats reviewed final bytes.
6. **tabi — preserve honest inherited boundaries.** USER remains red6/10; r07 survivor replay, user-record freezing, IPv6 classification, Git environment/hooks/config trust and external-validator pinning remain uncredited. The unchanged pinned historical producer still contains its summary inversion; replay must retain this qualification, not silently treat old output as repaired.
7. **protocol/operator — current frozen closure certification.** Supply a committed checker selftest/frozen step1/step4 run naming these current inputs and reproducing the recorded statuses. This closure verified the history pin manually and did not run a sibling closure gate. The missing certification remains durable debt; neither lane completion nor this manual review is that certification.

SHONEN pointers are independently accessible, including the historical end-to-end runtime evidence. This bounded closure did not cold-execute the complete instructions or certify all promotion criteria: **not all four boxes are certified**. No `[x]`, promotion, mint, report rewrite, or other lane-authored edit was made. Existing L0 questions remain operator-owned and untouched.
