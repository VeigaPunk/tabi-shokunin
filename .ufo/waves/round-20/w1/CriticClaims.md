# CriticClaims — tabi round 20, C1 depth claim

Seat: CriticClaims (critic, leaf, no dispatch). Subject: `.ufo/waves/round-20/design.json` C1, `c1_lifecycle_decisions` 0→12, source-only, Chromium 154.0.8037.97. Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` equals lane HEAD. Shared tree read-only; this file is the only write. Draft inspected: `.ufo/waves/round-20/clones/ScribeLifecycle/` (read-only).

## Verdict

The source reading is accurate. The claim is not admissible as written: four blockers are pointer, registry and attribution defects, not reading errors. Lowest-axis and distinct-axis checks pass as declared. Source-only operational value is partial.

| Check | Verdict |
|---|---|
| Lowest-axis obligation | PASS, with a verdict-wording caveat |
| Distinct-axis cap | PASS as declared; conditional on bookkeeping not being credited as axis moves |
| Causality | FAIL until B1–B4 are fixed |
| Source-only operational value | PARTIAL |

## 1. Lowest-axis obligation — PASS (caveat)

- `design.json:6-11`: axis depth, target 12, before 0; scope says "Depth8 is tied-lowest; no scalar promotion."
- `SCORECARD.md:886-893` (round-19 After table): depth 8, operability 8, freshness 8, adjacency 8 are the lowest non-retired ties; coverage 9, calibration 9. Depth qualifies under `AXES.md:33`.
- Caveat A: the move is a sub-metric count with the scalar held at 8→8. `AXES.md:79` defines the axes field as a 0–10 score; the held-scalar reading is the round-19 convention (`SCORECARD.md:888`), not an AXES rule. The SCORECARD verdict must say "sub-metric improved, scalar held", never imply a score change.
- Caveat B: round 19 admitted depth decisions only with observed probe receipts plus a source token (`lessons/round-19.md:12-15`) and rejected the framing "decisions = rows" (`lessons/round-19.md:19-20`). Round 20 counts source rows with the source token only. The metric name `c1_lifecycle_decisions` reuses the rejected term. Rename it (for example `c1_lifecycle_source_rows`) or state the admission bar in `design.json`, so the rejected framing is not carried over silently.

## 2. Distinct-axis cap — PASS as declared; conditional

- One claim on one axis (`design.json:5-12`) is within `AXES.md:27-33` (1–3 claims, distinct axes, causally separable). The spec's 64-seat roster declares no other C-claim.
- Conditional: bookkeeping the draft's own steps create must not be credited as axis moves unless declared:
  - the counter `measure-c1.mjs` is a runnable script (operability signal, `AXES.md:13`);
  - the README coverage row required by QUALITY criterion 11 (`corpus/QUALITY.md:27-28`) reads as a coverage move;
  - the S096/S100 re-fetch and registry rows read as freshness moves.
  Record these as bookkeeping in SCORECARD/LOG, or add them to the design claims before landing. Otherwise `AXES.md:31-33` fails.

## 3. Causality — FAIL until blockers are fixed

Verified, no action needed:
- All 12 declared spans equal the source spans (line numbers checked by reading the file): LC01 181–186, LC02 189–210, LC03 249–258, LC04 212–218, LC05 218–221, LC06 224–229, LC07 261–275, LC08 290–298, LC09 298–319, LC10 320–327, LC11 787–815, LC12 818–830.
- All 12 manifest quotes are literal substrings of one in-span line: 182, 197, 253, 214, 219, 228, 266, 295, 311, 326, 807, 827 (ScribeLifecycle `decisions.json`).
- Upstream: one bounded fetch of the pinned googlesource URL, base64-decoded, gives sha256 `8c8d6796…6916`, 68,278 bytes, matching `SOURCES.md:110` and the lane file. The tag `154.0.8037.97` resolves to commit `b510e9d7…5f78d` (googlesource JSON).
- The draft's out-of-span line cites (note lines 46–48: 391–394, 449–451, 834–843, 1102–1104) match the source text.

Blockers:
- B1 — LC11 span is not registered. `SOURCES.md:110` (S096) anchors `174-328,729-758,818-842`; its predecessor S078 (`SOURCES.md:92`) anchored `174-328, 635-842`. The superseding row silently dropped 635–728 and 759–817, and LC11's 787–815 sits in the drop. The draft's fix (S100: 174-328, 635-842) is not in the registry (no S100 match; registry ends at S099). Smallest correction: admit S100 in the same commit (tier A, same URL and sha, anchors 174-328,635-842), and cite LC11 as `S100:787-815` in the table; the draft's table currently cites `S096:787-815`, an unregistered range. If the counter enforces the round-19 rule (an opened SOURCES row), LC11 does not resolve and the count is 11 until S100 lands.
- B2 — Out-of-span source claims have no registered anchor. Note lines 46–48 assert that a running tool is cancelled with kToolCancelled at `S096:391-394`, `449-451` and `1102-1104`, and cite `834-843` (one line past the registered 842). None is in S078, S096 or S100. Smallest correction: either register the ranges, or reduce these lines to "other CallDoneCallback sites at 393, 451, 1104 — not analysed this round".
- B3 — The retained body is untracked. `corpus/evidence/round-20/sources/html_form_element.cc` is untracked (`git ls-files --others` lists it; the shared-tree status is `??`). It is the only retained body for S096/S100; QUALITY criterion 28 (`corpus/QUALITY.md:112-116`) requires committed bytes. Commit it with the note and manifest.
- B4 — Attribution against round 19 is not separated. Substance is already admitted: S096 was quoted in round 19 ("Return a null string", comment 827, `lessons/round-19.md:131`); the navigation-sentinel correction is already in the round-19 note (`knowledge/webmcp-declarative-validation-round-19.md:129-131`); and S078's `teaches` cell already states the autosubmit-versus-default split and respondWith settlement through the callback (`SOURCES.md:92`). LC12 is the clearest restatement; LC01, LC04, LC05 and LC08–LC10 restate banked prose at row granularity. "before 0" is only the manifest count. The SCORECARD must say which rows add new source detail (spans, named error codes) and which restate round 19, or the increment is not causally separable from round 19 (`AXES.md:31`).

Should-fix:
- S1 — LC12 runtime output is held but not cited. Checklist item 9 (note line 64) says the CDP value is "outside this excerpt". It is runtime-held: `corpus/evidence/round-17/webmcp-invoke/receipt.json:8364-8370` expects `Completed` with the landing document's application/ld+json array; `receipt.stdout.txt:14` passes; the probe (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:78-80`) shows `output:[]` for a no-handler navigating form. Put the observed output in item 9 and label LC12 "callback value source-settled; CDP output runtime-held (r17); mechanism open". Do not use the registry's S097 summary ("null-String empty-dictionary handling", `SOURCES.md:111`) as the bridge; it predicts a dictionary, not an array.
- S2 — The LC12 bridge may already be registered. The draft says the bridge is "outside the retained excerpt". The registry already anchors `model_context.cc:528-580` (S042, `SOURCES.md:56`), and `model_context.cc:528-580,695-745`, `frame.mojom:1112-1119`, `local_frame_mojo_handler.cc:987-1005` (S080, `SOURCES.md:94`). The round-19 dossier maps declarative pending-execution correlation and WebMCPToolResponded emission at `model_context.cc:562-565, 695-745` (`.ufo/waves/round-19/w1/SrcChromeDeclDocs.md:86`). [INFERENCE — not read by me.] Reading those registered ranges may close or sharpen the gap without a new fetch.
- S3 — Count rule. LC01 is a predicate feeding LC04/LC05. LC04 and LC05 are complementary branches of one `if`. LC07 is "not a failure class" by the draft's own text (note line 66). LC08 and LC09 share line 298. Only five rows name an error code (LC03 kMissingRequiredSubmitButton, LC06 kToolCancelled, LC09/LC10/LC11 kToolInvocationFailed). Fix the counting rule before the counter runs (QUALITY 22/34/43).
- S4 — Preconditions. Declarative paths are CHECK-guarded by `RuntimeEnabledFeatures::WebMCPEnabled` (`html_form_element.cc:411, 770, 826, 840`). Name the flag in the conditions, and state that a violated CHECK aborts; it is not a tool error. The same applies to LC06's `CHECK(is_currently_running_)` (line 225).
- S5 — Scope cell. S096's scope ("post-fill autosubmit, validation callbacks and navigation sentinel", `SOURCES.md:110`) does not name cancel, done-callback bookkeeping, late-response discard, serialization or rejection, or preventDefault-without-respondWith. Widen S100's scope cell to match QUALITY 12 ("for its scope").
- S6 — Registry and wording hygiene. S098/S099 carry "not an independent source" (`SOURCES.md:112-113`); S096 does not. Add that clause to S096/S100 and add the round-20 note to used-by when it lands. The note's first line `source:S096+S100` lacks the space used by round-19 notes (`source: S077 — …`). The note's title is H1 while the design declares H3. LC06's outcome says CallDoneCallback "runs with kToolCancelled"; it runs the callback only when one is pending (`html_form_element.cc:263-265`).

## 4. Source-only operational value — PARTIAL

| Row | Runtime neighbour on this build | What an agent can predict |
|---|---|---|
| LC01 | none (counter only) | predicate, not an outcome |
| LC02 | none | fill error returns at once; no running state |
| LC03 | none | missing submit button refused before fill |
| LC04 | probe `:71`: no toolResponded for 2500 ms | pending until the page submits |
| LC05 | receipt `invoke-declarative-form` (partial) | submits immediately |
| LC06 | declarative: none; the only cancel control is imperative (`receipt.stdout.txt:13`) | would map to `Canceled` via S079, not stated in the draft |
| LC07 | none | internal bookkeeping |
| LC08 | none | late settlement ignored |
| LC09 | none | non-serializable object → `Error` (S079 mapping) |
| LC10 | none | rejected respondWith → `Error` |
| LC11 | probe `:37-39`: `Error`, no output | `Error`, no output |
| LC12 | receipt `receipt.json:8364-8370`: `Completed`, landing-document array | callback value settled; output runtime-held; mechanism open |

- Predictions an agent could act on now: LC02, LC03, LC04 and LC11 (LC04 and LC11 have probe neighbours; LC02 and LC03 do not).
- Missing link to the agent-visible contract: the rows end at `ScriptToolErrorCode`, while the agent reads the CDP `status`. The emitter mapping is registered (`SOURCES.md:93`: kToolCancelled → Canceled; other ScriptToolErrors → Error; success → Completed). Add a status column citing S079, or one mapping table.
- Evidence-class discipline is right: source-scoped labels, probes marked as non-receipts, and "not a runtime claim" stated (note lines 9-11). QUALITY 14 is satisfied. Keep that sentence in the SKILL rendering (`design.json:133`).

## 5. Counterexamples (strongest local)

- C-a: LC11's span 787–815 is in no registered S096 range (`SOURCES.md:110`), and S100 is not registered. Passes the source check, fails the registry check.
- C-b: LC12's source chain (callback null String, emitter summary "empty-dictionary", `SOURCES.md:111`) predicts a shape that the runtime does not show (landing-document array, `receipt.json:8370`). A row whose agent-visible output its own span does not determine.
- C-c: "decisions = rows". LC04/LC05 are complementary branches and LC01 predicates both. Under the round-19 admission bar (runtime-verified, `lessons/round-19.md:12-15`) the count would be lower.

## 6. Untested / not exercised

- No counter, test, build or formatter was run (not assigned; `measure-c1.mjs` is absent from the shared tree and from the ScribeLifecycle clone).
- S097 body not re-read: `.ufo/waves/round-19/w2/SourceS079.inspector.body.gz` returned an empty archive view through `read`. S097 statements come from registry text, not re-verified.
- `model_context.cc` and `frame.mojom` bodies not read; S2 is an inference from registered anchors.
- Round-17 probe checked only at the cited lines.
- Quote and span checks were manual line reads, not the counter.

## 7. Actions taken (record)

- Tools installed or updated: none.
- Network: three bounded read-only GETs to `chromium.googlesource.com` (pinned source file ×1, tag JSON ×2). No other network.
- Git: read-only. One `git status --porcelain=v1 -uall` at the lane root ran without `--no-optional-locks` (it may refresh the index stat cache); later calls used `--no-optional-locks` or `ls-files`. No lane-index writes intended.
- Scratch files created in `/tmp` were removed.

## 8. Smallest safe correction set (ordered)

1. Admit S100 (tier A, same URL and sha, anchors 174-328,635-842, widened scope); cite LC11 as `S100:787-815`.
2. Register the `391-394, 449-451, 834-843, 1102-1104` ranges, or reduce those lines to "not analysed" pointers.
3. Commit `corpus/evidence/round-20/sources/html_form_element.cc` with the note and manifest; add the README row and S096/S100 used-by.
4. SCORECARD: depth 8→8 "source-scoped rows; N of 12 restate round-19 registry prose"; record bookkeeping as not credited to other axes.
5. Rename the metric and state the counting rule; name the WebMCPEnabled precondition; mark LC12 as mechanism-open with its runtime output cited; add the emitter status column.

Report: .ufo/waves/round-20/w1/CriticClaims.md
