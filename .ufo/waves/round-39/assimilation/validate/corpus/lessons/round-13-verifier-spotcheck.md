author: hyaku closure (non-author integrator, @m_strong)

# tabi round 13 — committed-policy and real Playwright evidence closure

## Decision and boundary

**CLOSURE tabi r13 status=ok admitted=true.** C1 operability and C2 coverage verify in their declared bounded senses; no owned axis is harmed. This is an independent orchestrator-dispatched closure, not an author-side seat judgment. Reviewed delivery: `c70228678b5be4af23474d7c927035de54e3a885`; before: `75e7836b6c3090180aee2754e20a5d3cfb186e74`. Neither claim is exploratory.

Counts and committed identities were independently re-measured. Runtime/gate outcomes were **evidence-verified**, not rerun: no sibling gate, self-test, lane counting script, browser runner, or browser was executed. The mandated fleet source-census validator was the only gate-like validation executed. Read-only review seats: CloseTabiR13.C1GateEvidence, CloseTabiR13.C2CapabilityEvidence, CloseTabiR13.DiscernmentSources. No tools installed or updated by this closure or its reviewers.

Dispatch/complete digest copied from the closure dispatch (mutable watchdog line numbers are not evidence):

```text
2026-10-20T02:05:17-03:00 launch tabi round=13 pgid=1485308 driver=hyaku-inline attempt=1
2026-10-20T02:55:28-03:00 complete tabi round=13; hyaku-inline attempt=1
```

## Step-1 conformance

Commands actually exercised:

```sh
git -C /home/vgpnk/Projects/shokunin log --format='%an <%ae> %H %aI %s' -- .ufo/reports/round-13/tabi.md
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-list --count '@{u}..HEAD'
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff 75e7836b6c3090180aee2754e20a5d3cfb186e74 c70228678b5be4af23474d7c927035de54e3a885 -- SCORECARD.md
```

Observed report commit: `tabi-shokunin <tabi@shokunin.local> b5de366c58363536b535eb0351be1e8c58619793 2026-10-20T02:55:11-03:00 round-13: tabi report`. Lane status output was empty, ahead count `0`, HEAD exactly the delivered revision. Its timestamp is `2026-10-20T02:53:12-03:00`, before the report commit. The real report contains all required sections, LOG round-13 linkage and four `[~]` SHONEN assessment lines; it is not a marker.

The report's 12 distinct abbreviated/full hash strings all resolve to lane commits and pass `merge-base --is-ancestor HASH HEAD`: `06e6ada`, `06e6adace1946bc46c0e081c1dcba3730d451183`, `1199150`, `1212207`, `1cf82b8`, `2f4bfa1`, `3d6e51f`, `75e7836b6c3090180aee2754e20a5d3cfb186e74`, `837b33a3988ebeea7f6b4ef5c04698da88909a73`, `9c547dd`, `b6d67c1fb0fbba1a572263ae68c7eb75b0f130ed`, `c70228678b5be4af23474d7c927035de54e3a885`. Report commit itself is an ancestor of fleet HEAD. The dispatched prompt is committed in `73f91dc00d715646761abb2c2f58dd19c318290e`.

Python Eval loaded committed template/dispatch bytes using `git show HEAD:PATH`, substituted LANE=tabi, ROUND=13, FLEET_ROOT=/home/vgpnk/Projects/shokunin, AXES=coverage + calibration (browser and web-interaction craft), and `<tabi-repo>`=tabi-shokunin. `dispatch.startswith(rendered.rstrip())` returned **True**: the full canonical template precedes campaign §6. Its canonical role buckets match MISSION; §6 explicitly adds operator host routing and L1 planner handling.

Independent JSON inspection of committed `w1/spec.json`, `dispatch.json` and `swarm-registry.json`: **32 declared items, 32 taskCall tasks, 32 registered members, 0 per-task model parameters**. Role counts: executor7/scout6/connector4/reviewer7/critic4/sentinel2/revenger1/scribe1; L1 holds planner as the explicit campaign ruling requires. This inspects durable dispatch evidence; it does not claim to have replayed dispatch.

## Independent counting method and observed results

Measurements ran in Python Eval with `subprocess.run(['git','-C',repo,...], capture_output=True)` over committed blobs. The following are the exercised operations, not execution of the lane's `measure.mjs`:

```python
# lane='/home/vgpnk/Projects/shokunin/tabi-shokunin'
# before='75e7836b6c3090180aee2754e20a5d3cfb186e74'
# after='c70228678b5be4af23474d7c927035de54e3a885'
def git(repo, *args):
    p = subprocess.run(['git', '-C', repo, *args], capture_output=True)
    return p.returncode, p.stdout, p.stderr
def blob(rev, path):
    c, o, e = git(lane, 'show', f'{rev}:{path}')
    if c: raise ValueError((rev, path, e.decode()))
    return o
# Source rows: re.match(r'^\s*\|\s*S\d{3,}\s*\|', line),
# then line.split('|')[1:-1], strip cells and Counter tier/status.
# Knowledge: git ls-tree -r --name-only REV -- corpus/knowledge;
# map: set('corpus/'+p for p in re.findall(
#     r'knowledge/[A-Za-z0-9._-]+\.md', blob(REV,'corpus/README.md').decode())).
gates = json.loads(blob(after, 'corpus/evidence/round-13/gates.json'))
for g in gates['gates']:
    print(g['path'], hashlib.sha256(blob(after,g['path'])).hexdigest()==g['sha256'],
          len(re.findall(r'^SELFTEST name=.* result=PASS$',g['selfTest']['stdout'],re.M)),
          g['selfTest']['exit'],
          [g['witness'][x]['exit'] for x in ['before','after']],g['production']['exit'])
receipt = json.loads(blob(after,'corpus/evidence/round-13/aria/receipt.json'))
manifest = json.loads(blob(after,'corpus/evidence/round-13/aria/manifest.json'))
print(len(manifest['cases']), receipt['summary'], receipt['verdict'])
```

Observed before→delivered results:

| Measurement | Before | Delivered | Comparison with report |
|---|---|---|---|
| Round-13 compatibility receipt/policies represented | absent / 0 | present / 2 | agrees: new fixture-covered policies, not previously zero functioning gates |
| Round-13 real ARIA receipt/demonstration | absent / 0 | present / 1 | agrees: one bounded demonstrated capability |
| Source rows | 28 | 28 | agrees |
| Tier histogram | A22/B4/C2 | A22/B4/C2 | agrees |
| Status histogram | mined23/queued3/rejected2 | mined23/queued3/rejected2 | agrees |
| Knowledge notes / mapped / missing | 31/31/0 | 32/32/0 | agrees with reported final32/32/0 |
| Newly created source IDs | — | 0 | no new-row sample exists; touched existing rows sampled below |
| Changed source cells | — | S023/S024/S025 column11 (`used-by`) only | agrees; no immutable source cells changed |

### C1 — operability: improved

Both committed script SHA256 values match `gates.json`: ROUND `8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d`; USER `690661217f4ba3fb47a416611d7e45bfcb2440fc093123a25efb97ab63f32171`. Both scripts are byte-identical between cited code revision `9c547dd2de33f4f5f8e7a1da57023b5bf690c22c`, runtime revision `06e6adace1946bc46c0e081c1dcba3730d451183`, measured evidence revision `837b33a3988ebeea7f6b4ef5c04698da88909a73` and delivered HEAD.

Independent parsing observed ROUND **27 passing SELFTEST records =26 fixture cases+1 production-alias control**, exit0; USER **21 passing controls =20 fixture cases+1 alias**, exit0. Each witness records old child exit1 `history_rewritten` → repaired child exit0 `clean`. The containing witness command exits0; before/after fields are child outcomes, not two separate top-level process exits. Static witness-source inspection confirms identical legacy-supported argv against one scratch fixture and the pinned old script blob, not different before/after fixtures.

Production receipts: ROUND exit0 with **10 `ROUND` lines**, clean10; USER exit1 with `round_count`, **Found 6 user rounds, expected 10**. The claim does not count USER as production-green or invent four rounds. HARD_BASELINE/PSTACK_PIN remain fixed and the historical census SHA256 remains `b9c8dc35…` on both sides. Registry home `SKILL.md:1665–1686` records commands, owner, verdict map, isolated selftests and pins. C1's 0 is absence of this round's covered-policy evidence, not a census of all previously working compatibility behavior.

Revision labels vary by receipt (9c547dd/06e6ada), and USER witness lacks its own `measuredRevision`; common `codeRevision` plus byte-equivalence supplies the repaired-code binding. The USER scratch baseline hash is run-specific; stable refusal/clean findings, not literal temporary paths or fixture commit IDs, are the reproducible part. These qualifications do not negate the demonstrated two policy repairs.

### C2 — coverage and capability: improved

**The demonstration evidence is committed**, not only a capability-table assertion. `git show c702286:corpus/evidence/round-13/aria-execution-pass.json` records real `node scripts/aria-loopback-round13.mjs`, exit0, `Running 8 tests using 1 worker`, `8 passed (5.5s)`, empty stderr. The full receipt and exact inputs/actual outputs reside in the same delivered tree. Receipt timestamp `2026-10-20T05:42:38.729Z` precedes its shipping commit `837b33a` at `2026-10-20T02:46:58-03:00`.

Independent manifest/receipt counts: **expected8, ran8, passed8, failed0, missing[]; four negative controls; one worker, zero restarts**. All eight case statuses pass and all eight per-case cleanup proofs say contextClosed/profileRemoved/tempRootRemoved/ok=true. Six actual `.aria.yml` files, eight case JSONs and one worker JSON are committed. Reviewer digest checks: **19 input/source/note/pass-file checks, zero mismatches; 25 case/actual/template-reference checks, zero mismatches; six snapshot digests match**. Runtime: Playwright Test/playwright/playwright-core1.64.0; managed Chrome for Testing156.0.8078.4, revision1248, recorded executable SHA256 `377a9fc07b495c3b8d0ab8ec1fdfd153641759f9756fea34d8dfce4de82f5025`. The matching runner/spec/config/manifest bytes survive unchanged from actual runtime revision06e6ada to delivery.

The four negatives are grounded in caught errors and their verified message digests, **not** the literal `actual:'reject'` summary field: ambiguity reports strict-mode violation/two elements; explicit equal rejects the extra child with real ARIA mismatch/diff; the two checked-state controls produce real ARIA mismatches. `captureRejection` at spec702–731 awaits `rejects.toThrow` and validates patterns/tree tokens before appending a negative entry. Initial TypeError and wrong-diagnostic failed attempts remain committed; neither is counted as a desired negative success.

Cleanup qualification: per-worker server proof records `listeningAfter=false`, closed=true and `ECONNREFUSED`; actual admission uses these correct proofs (`serverOk`, runner439–443). The aggregate field **`cleanup.server.listeningAfter=true` is inverted by runner605** and is a routed metadata defect, not evidence of a still-listening server. No packet-level no-egress or sandbox certification follows from page-level exact-origin confinement. Local node_modules/browser binary are external reproduction dependencies, not claimed committed artifacts; lockfile/runtime pin and committed demonstration receipts remain available. Observed Node26.12.0 satisfies enforced minimumMajor20; pin.node.recorded24.21.0 is stale descriptive metadata, not an exact enforced Node pin.

## Outside Gate spot-check and quote verification

Reopened on2026-10-20: the delivered lesson/receipts/source files via committed bytes and official URLs via `read`. These decisions are narrow, not whole-browser mastery:

| Item | Author decision | Re-opened source | Outside result | Reason |
|---|---|---|---|---|
| New `aria-loopback-round-13.md` | admit | committed pass JSON, receipt, exact actual/template files; [Playwright locators](https://playwright.dev/docs/locators), [ARIA snapshots](https://playwright.dev/docs/aria-snapshots) | agree | Actual8/8 and four cause-checked negative controls support the scoped runtime entry; documentation is not substituted for execution. |
| Treat fixture as audit/real-site/pixel/cross-browser/determinism proof | reject | same real fixture receipt; Locators §Locate by role; new note §What this result cannot establish | agree | One author-built fixture and one pinned browser establish none of those broader claim classes; official locator docs expressly exclude audit replacement. |
| Any exception counts as desired negative witness | reject | committed initial/final failed execution receipts; spec702–731; final caught messages | agree | TypeError/wrong diagnostic are retained failures; final assertions require genuine producer rejection signatures and tree tokens. |
| Explicit equal is default / omitted checkbox attribute proves checked | reject | ARIA snapshots §Partial matching and §Strict matching; committed contain/equal/state templates and actuals | agree | Default is contain; omitted checked attribute ignores that state. Positive/opposite-state controls prevent this inference. |

No newly written registry rows exist. Therefore the new-row quotation sample is inapplicable, not fabricated; the three existing rows whose `used-by` changed are reopened instead. Exact located quotations from lesson §Gate were present in the live primary pages and each is ≤25 words (Python `len(quote.split())`):

- **S023**, Locators §Locate by role: “role locators do not replace accessibility audits and conformance tests” — **10 words**.
- **S024**, Snapshot testing §Strict matching: “contain (default): Matches if all specified children are present in order.” — **11 words**, code markup normalized only.
- **S025**, APG home introduction ([W3C APG](https://www.w3.org/WAI/ARIA/apg/)): “This guide describes how to apply accessibility semantics to common design patterns and widgets.” — **14 words**.

Source-review dissent about registry paraphrases is retained: S023's semantic-selector wording and S024's “not pixels” are scoped synthesis, not verbatim quotation; the located text does establish semantic locators and YAML accessibility-tree structure. I retain the prior outside ruling and do not turn those paraphrases into extra runtime or per-widget keyboard authority. S025's homepage establishes general authoring scope only, as the new entry explicitly states. No source row is redated or credited as a newly discovered surface.

Required independently executed census:

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

Observed exit0:

```text
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

## No-harm, axes and learning trends

SCORECARD diff is **66 appended lines, zero deletions**; all six ordinal scalars remain unchanged. Independent prefix comparisons returned true for LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md and corpus/README.md. SHONEN.md/PROVINCE.md diff is empty between before and delivery. The older FreshRetry receipt and two corrected knowledge entries retain their exact prior bytes as prefixes; append-only corrections add79/38/44 lines respectively. Reviewer C1's initial SHONEN-change statement compared a much older baseline and was retracted; it is not a round13 finding.

| Axis | Verdict | Evidence/boundary |
|---|---|---|
| depth | unchanged | 8→8; bounded documentation/cause precision, no broad protocol certification |
| coverage | improved | 9→9; real previously docs-only ARIA/locator experiment0→1, new admitted mapped note |
| operability | improved | 8→8; two newly covered compatibility policies; USER remains failed6/10 |
| freshness | unchanged | 8→8; source reopens/corrections not extra expertise points; committed freshness receipt remains scoped |
| calibration | unchanged | 9→9; failures, explicit limits and author/outside boundary retained; metadata defects routed rather than hidden |
| adjacency | unchanged | 8→8; unchanged province and explicit adjacent-owner refusals; no publishing or external domain operation |

- **expansion: improved** — knowledge31→32, map complete32/32; new entry cites mined S023/S024/S025 and actual bounded runtime evidence on previously documentation-only ground.
- **quality: improved** — preserved genuine failures corrected without redefining success; old source notes/receipt receive qualified append-only precision; QUALITY16/17 cite round13 mistake rows. The remaining summary-field defect does not falsify the admitted browser behaviors or their underlying cleanup proof.
- **discernment: improved** — this outside check agrees on the admit and sampled rejects, and prior outside disagreement is learned in grounded QUALITY16. QUALITY17 is tied to observed manifest/diagnostic/worker aggregation mistakes, not an ungrounded criterion.

History-pin plain digest check (not closure-gate execution): `sha256(json.dumps(rounds[:48],sort_keys=True,separators=(',',':')).encode())` equals committed pin `ce97497ed699a8f0939be062d042cf4d6e3e7531116fbe4681593991d67f0a8e`; the same digest holds at readable ancestor `ae19fca`. This preserves closed history but does not certify a frozen current closure-checker run.

Corpus review verdict: **not conformant** for the retained contradictory cleanup-summary field and stale recorded-Node metadata identified below; the source registry shape/census conforms and the underlying bounded claim outcomes verify. These named metadata defects are status-neutral, not a failed-marker predicate or evidence that the demonstrated behaviors regressed.

## Routed defects and retained debt

Status-neutral, to be addressed by the named owner in a later round; this verifier never edits lane-authored files:

1. **tabi — cleanup summary metadata:** runner605 stores the proposition “all workers not listening” under `listeningAfter`. Correct the field semantics or name in new evidence and preserve this original receipt; keep admission tied to correct per-worker closed/false/refused controls. Add a failure-capable summary consistency check. Evidence: aggregate=true versus sole perWorker=false in committed receipt.
2. **tabi — reproducibility wording:** distinguish observed Node26.12.0 from `runtime-pin.json`'s recorded24.21.0 and minimumMajor20; correct stale recorded metadata through a qualified new artifact, without pretending exact Node equality was enforced.
3. **tabi — gate receipt/registry precision:** document USER's supported `--witness REV` alongside its selftest command in the registry; make repaired-code revision binding explicit in future USER witness receipts (currently common codeRevision plus identical source bytes). Say USER20 fixture cases+alias=21 CLI controls when disaggregating counts. Do not reinterpret historical witness child exits as top-level command exits or claim bit-identical scratch baseline IDs.
4. **tabi — inherited broader gate debt retained:** lane-authored SCORECARD shell execution, r07 survivor replay, user-record freezing, IPv6 origin classification and unpinned external validator remain uncredited. USER6/10 red is a real failed production gate, not a reason to manufacture rounds or relax expected10. Prior legacy-policy issue is repaired only within C1's stated boundary.
5. **operator/protocol — carried closure conformance debt:** this closure supplies committed measurements/spot-check plus the serialized append helper, **not a frozen step-1/step-4 closure-checker run for this hyaku row**. Historical frozen fixtures do not cover this current entry. The predecessor's same tooling debt remains open and status-neutral; no full frozen closure-gate certification is asserted.
6. **protocol/non-author verifier — prior numerical erratum:** round-12-verifier-spotcheck.md:153 says the quote “A template is a constraint, not necessarily a complete serialization of the accessibility tree.” has16 whitespace-separated words. It has14 (`len(quote.split())`); its ≤25-word result is unchanged. This append corrects the old count without editing another verifier's filed lesson.

Prior routed source precision items are dispositioned by appended collector-before-response creation/clone timing, gzip-versus-decoded-byte clarification, and exact Strict matching/report-range errata. No broad support observation is inferred from those edits. No new L0 question is needed for closure; the carried round5 external-action approval remains operator-owned.

SHONEN: the end-to-end runtime evidence is now independently checkable, and instruction/source/province artifacts are durable. This bounded closure did not cold-execute the full instructions or adjudicate every promotion criterion; **not all four boxes are certified**. No `[x]`, promotion, mint, or change to lane-authored files is authorized here.
