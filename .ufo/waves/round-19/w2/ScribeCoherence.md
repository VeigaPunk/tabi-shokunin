# ScribeCoherence — round 19 W2 prose falsification

## Behavior, axes, and verdict

Advisory prose audit only; judgment axis: **calibration**. Audit axes: claim/evidence alignment, exact provenance, source-status consistency, and preservation of scope. Inspected immutable checkpoint **R = d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47**, relative to **B = 66251bfc1aef393e4aec599e950a8deb867736bb**. No product edits, runtime invocation, counter execution, test run, judgment, commit, or delegation.

**Findings: 13 scoped errata groups.** The strongest are an unsupported 27-admission measurement, two source-contradicted universal input rules, a false non-enforcement rule for email/URL, an already-completed wave-2 snapshot assertion without retained evidence, and registry write-scope omissions. These are documentary findings, not a replacement execution verdict at R.

All path:line references below are **LANE-relative at R**, not current working-copy coordinates. Recommended corrections are append-only errata for the append-only surfaces; only L1 may integrate them.

## Concise errata list

### E01 — Candidate population promoted to measured admissions

- **Locations:** `SKILL.md:2092`; `corpus/lessons/round-19.md:12-16`; `corpus/knowledge/webmcp-declarative-validation-round-19.md:29-31`.
- **Conflict verbatim:** `Measured counts: 66 cases, 27 decisions`; `Admitted: 27 decisions.`
- **Evidence:** `corpus/evidence/round-19/measurements/c1-ea170da3.json:5-12` records revision `ea170da3d39089566f080a3095d2b7bb5c7002b7`, exit 0, **24** `c1_validation_decisions`. Its stdout rejects DV-07 (`probe_family_mismatch`) and DV-11/DV-22 (`manifest_case_outcome_mismatch`). The other retained C1 measurement, `c1-1f453819.json:7-11`, exits 2 `producer_blob_missing`. Neither is a measurement at R. In contrast, `validation/receipt.json:4841-4845` really does record **66 cases / 66 passed / 0 failed**: case-pass and decision-admission counts must not be conflated.
- **Corrected text:** “The manifest contains 27 candidate decisions. The retained case receipt reports 66/66 matches. The most recent retained C1 measurement reports 24 admitted decisions at ea170da3d39089566f080a3095d2b7bb5c7002b7; no C1 execution at R is asserted here.” Do not call R's count 24 either: that execution was not performed by this seat.

### E02 — Unqualified ‘predeclared’ masks the timing of selection

- **Locations:** `LOG.md:1089-1090`; `SKILL.md:2043`; `corpus/README.md:405`; `corpus/lessons/round-19.md:12`.
- **Evidence:** canonical `PLAN.md:139-146` explicitly says the families were fixed before probing but the 27 decisions were extracted **after** observed behavior and before counting. The knowledge note's `:29-30` already uses the narrower “declared before counting.”
- **Corrected text:** “15 predeclared families; 27 candidate decisions selected from their observed probe behavior and declared before counting, not before probing.” Apply this timing qualification wherever ‘predeclared decisions/manifest’ appears; this does not invalidate the family population.

### E03 — Single-checkbox ‘booleans only’ overclaims the tested strings

- **Locations:** `SKILL.md:2074` (DV-15); `corpus/knowledge/webmcp-declarative-validation-round-19.md:57-58`.
- **Conflict verbatim:** `single checkboxes take booleans only`; `Checkbox (single): booleans only`.
- **Evidence:** retained S077 implementation `form_mcp_schema.cc:337-342` calls `ToBoolean`; `:71-88` accepts booleans, integers, and case-insensitive true/false strings plus "1"/"0". Cases `checkbox.json:63-145` test only the strings `checkbox-choice`, `on`, and `unrelated`. Their rejection does not establish rejection of all strings or integers. The original source scout also discloses these coercions (`w1/SrcFormSchemaTests.md:30-38`).
- **Corrected text:** “The tested strings ‘on’, ‘checkbox-choice’, and ‘unrelated’ are rejected. Use JSON booleans as the schema-shaped input. Source S077 also permits integer and true/false/1/0 string coercion for a single checkbox; those additional accepted shapes were not runtime-probed by this seat.”

### E04 — Hidden-control finding drops the description precondition

- **Locations:** `SKILL.md:2064` (DV-05), `:2089-2090`; knowledge note `:45-47`.
- **Evidence:** the fixture's hidden input has **no** `toolparamdescription` (`validation/fixtures/disabled-hidden.html:9`). S077 `form_mcp_schema.cc:1270-1281` classifies a hidden input as text when that description is nonempty, routing it through text validation. Therefore “no validator branch for hidden” and blanket “hidden controls ... unsettable” are false as general source claims.
- **Corrected text:** “The tested hidden input, without a nonempty toolparamdescription, is absent from inputSchema and rejected as an invalid value. Hidden inputs with a nonempty toolparamdescription take the source's text-control path; their runtime behavior is outside this fixture.” Keep disabled/readonly controls distinct from hidden controls in the agent rule.

### E05 — Missing schema `format` is not absence of email/URL enforcement

- **Location:** knowledge note `:73-75`.
- **Conflict verbatim:** `minlength`/`maxlength`/`format` are not enforced for agents at all.
- **Evidence:** the same note `:55-56`, SKILL DV-20, and `validation/cases/email-url.json:8-39,76-107` say malformed email/URL values are rejected at autosubmit. `format` is absent from the generated schema; native type constraints are nevertheless enforced.
- **Corrected text:** “The tested minlength/maxlength limits do not block script/agent fills. The email/URL schemas omit format, but native email/URL validity is checked at autosubmit and rejects the malformed tested values.”

### E06 — Selected disabled option is not submitted as FormData

- **Locations:** `SKILL.md:2072` (DV-13); knowledge note `:59-60`.
- **Conflict verbatim:** `Accepted, selected and submitted`.
- **Evidence:** `validation/receipt.json:3572-3625` records Completed, submitCount 1, and post-invoke `choice: disabled-code`, but **toolResponded.output.fields is `{}`** (`:3583-3589`). The fixture uses `Object.fromEntries(new FormData(event.target))` (`fixtures/select-enum.html:18-26`). Selection, submit-event execution, and successful-control serialization are different surfaces.
- **Corrected text:** “Accepted and selected; one submit event completes. The selected disabled option is omitted from this fixture's FormData output (`fields: {}`), even though the post-invoke select value is ‘disabled-code’.”

### E07 — Planned snapshot written as completed historical evidence

- **Location:** `corpus/lessons/round-19.md:84`.
- **Conflict verbatim:** `wave-2 snapshot taken at return before any import`.
- **Evidence:** R's changed-path inventory retains only wave-1 isolation snapshots, including `isolation/lane-status-uall-0425.txt`; `PLAN.md:153-156` states wave 2 **will take** an actual snapshot. `isolation/ledger.json:4-8` explicitly labels wave-1 after-state and tracked-diff evidence **RECONSTRUCTED**. A promised future seat operation is not observed execution evidence.
- **Corrected text:** “Wave-1 after-state is RECONSTRUCTED, not a direct return-time snapshot. PLAN requires an actual wave-2 return snapshot before integration; no completed wave-2 snapshot is evidenced at R.” Also qualify `LOG.md:1100-1101`: “checker clean on 23 ledger entries; lane after-state reconstructed.” A clean checker does not convert that reconstruction into a direct snapshot.

### E08 — S087 is consumed while still queued and uncredited in the index

- **Locations:** `corpus/SOURCES.md:101`; knowledge note `:17-18`; `corpus/README.md:405`; `LOG.md:1107`; lesson `:53-54`.
- **Evidence:** the note explicitly uses S087's pinned-spec proposition, but the registry row is `queued`, used-by `—`, and the README sources column omits S087. The six-mined/eleven-queued totals describe the existing row cells but conceal the seventh source actually consumed by the note.
- **Corrected text/cells:** S087 `status: queued → mined`; `used-by: — → corpus/knowledge/webmcp-declarative-validation-round-19.md`; add S087 to the README source list. Record that transition, and change the S077–S093 status summary to **7 mined / 10 queued** after the transition. Leave S094 separately rejected. Do not claim these corrected totals already held at R.

### E09 — Recheck cadence and ‘tag-pinned’ scope disagree

- **Location:** knowledge note `:9`; comparison `corpus/SOURCES.md:96-97`.
- **Conflict verbatim:** `S077–S083 on-release (tag-pinned); S082/S083 Living Standard 180d`.
- **Evidence:** S082/S083 are living WHATWG pages, not Chromium-tag files, and their registry cadence at R is `on-release`, not `180d`.
- **Corrected text:** “S077–S079 and S091: on-release. S082/S083: on-release per SOURCES; their retained bodies are dated Living Standard snapshots, not Chromium-tag-pinned sources.” A deliberate cadence change to 180d instead requires the two registry transitions to be logged; do not silently carry both policies.

### E10 — Registry's claimed write scopes omit real self-test writes

- **Locations:** `SKILL.md:2098-2101`.
- **Evidence:** C1 writes `selftests/c1.json` in its repository (`measure-c1.mjs:1285-1297`); C2 atomically replaces `selftests/c2.json` (`measure-c2.mjs:1423-1427`); C3 writes `selftests/c3.json` (`measure-c3.mjs:588-590`); isolation writes `selftests/isolation.json` (`isolation/check-isolation.mjs:545-546,630-631`). The registry advertises temp/stdout or read-only scopes while offering these self-tests. Running the documented self-tests from LANE would therefore write production evidence there.
- **Corrected text:** “Normal mode: [existing normal-mode scope]. Self-test additionally creates/replaces corpus/evidence/round-19/selftests/<c1|c2|c3|isolation>.json in the executing repository, plus owned fixture repositories. Run self-tests only in an assigned private clone; they are not read-only lane commands.” No such command was executed in this audit.

### E11 — Registry exit maps conflate evaluation with success

- **Locations:** `SKILL.md:2098-2099`.
- **Evidence:** retained C1 execution exits 0 with only 24/27 decisions admitted (E01). C1 code defaults an evaluated summary to exit 0 (`measure-c1.mjs:716-726`) even when individual decisions carry rejection reasons. C2 normal mode returns 0 for `evaluationStatus: complete` and 2 otherwise; a failing self-test also returns **2**, not advertised 1 (`measure-c2.mjs:1435-1446`).
- **Corrected text:** C1: “0 evaluated count, not all decisions admitted; inspect c1_validation_decisions and reasons. Self-test: 0 all pass / 1 failure; unavailable measurement: 2.” C2: “0 evaluation complete, regardless of c2_h4_properties; 2 unavailable/usage/self-test failure. No exit-1 branch is implemented.” Keep C3's distinct 0=all-four-closed map.

### E12 — QUALITY retains superseded premises and null-agent scope

- **Locations:** `corpus/QUALITY.md:172-173` (40); `:197-200` (44).
- **Evidence:** criterion 40 repeats the historical “suggested-filename scan” explanation without the correction already present in `LOG.md:1112-1114` and lesson `:68-71`: the old scan matched marker bytes. Criterion 44 says null agentId is untested/not claimed, but the revised PLAN `:153-155`, lesson `:80`, and `measure-c3.mjs:280-318` include nonempty agentId checks in both registries and post-record records.
- **Corrected text:** 40 attribution: “round-18 H4 marker-byte scan missed GUID artifacts and replayed records; the spot-check's suggested-filename explanation was corrected.” 44 scope: “Nonempty agentId is also checked in registries and post-record records by C3 d3; validation snapshots are not substituted for post-record execution records.” Do not assert a new run or a null-agent mutant pass from code inspection alone.

### E13 — Nine integration failures are not nine checkbox failures; ‘every branch runtime-verified’ is excessive

- **Locations:** `corpus/QUALITY.md:211-213`; lesson `:54`.
- **Evidence:** first integration receipt has five failing checkbox cases and four failing disabled-hidden cases (all four include the omitted unnamed-control observation), then summary 55/64 (`integration/receipt-1.json:101,162,220,278,336,811,883,955,1034,4427-4430`). The lesson's broader S077 label says `every validator branch, runtime-verified`, while SKILL `:2047` and the note `:19-20` expressly exclude custom elements/files and lesson `:18` excludes malformed month.
- **Corrected text:** QUALITY 46 example: “The first run failed 9/64: five checkbox field-encoding mismatches and four disabled-hidden field-reader mismatches involving the unnamed control; both contracts were corrected and the full corpus rerun.” Lesson S077 description: “source coverage extended beyond S071's single anchor; runtime verification is limited to the tested decision cases, not every validator branch.”

## Gates and outcomes retained, not rerun

- C1 at ea170da3: exit 0, 24 decisions, rejected IDs/reasons quoted in E01. At 1f453819: exit 2, missing producer. No assertion of a fresh C1 count at R.
- C2 at ea170da3: retained `measurements/c2-ea170da3.json:7-10` records exit 0, `c2_h4_properties: 2`, evaluation complete. This is historical evidence at that revision, not this seat's execution.
- C3 at ea170da3: retained `measurements/c3-ea170da3.json:7-12` records exit 0, `c3_routed_closed: 4`, checker clean 23 entries. Its d4 still relies on the explicitly reconstructed lane after-state.
- SCORECARD round19 `:866-868` correctly says its claim block is **not measurements**; no fake axis promotion was observed there. The five-substring/one-nonempty correction is consistent with the retained C3 result.
- The baseline signal reports disclose nonempty pre-signal PID populations and all three tested signals. No new signal-operability credit is warranted or claimed by the revised PLAN.
- The inspected production prose uses the revised decision/property concepts, not an observed stale `c1_validation_rows` or `c2_gaps_closed` output key. Registry success semantics, rather than those old key names, are the drift found here.

## Provenance and commands actually exercised

All shell commands used cwd `/home/vgpnk/Projects/shokunin`; only Git object reads, a scratch archive extraction, decompression, and SHA-256 calculation were performed. `read`/`grep` inspected the absolute scratch paths below. No live source was fetched; source access dates below are the retained dossiers' dates, not a new access claim.

1. `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --name-only 66251bfc1aef393e4aec599e950a8deb867736bb d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` → 251 changed paths (tool spill `artifact://33291`).
2. `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --unified=3 66251bfc1aef393e4aec599e950a8deb867736bb d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47 -- LOG.md SCORECARD.md SKILL.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md` → six files, 191 insertions, zero deletions (spill `artifact://33292`).
3. `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47:SKILL.md`, and the same exact `show` command with `:corpus/knowledge/webmcp-declarative-validation-round-19.md` and `:corpus/lessons/round-19.md` → immutable prose; SKILL spill `artifact://33319`.
4. `mkdir -p /tmp/tabi-r19-ScribeCoherence-R && git -C /home/vgpnk/Projects/shokunin/tabi-shokunin archive d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47 LOG.md SCORECARD.md SKILL.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md corpus/knowledge/webmcp-declarative-validation-round-19.md corpus/lessons/round-19.md corpus/evidence/round-19 .ufo/waves/round-19 scripts/webmcp-invoke-round19.mjs scripts/webmcp-validation-round19.mjs | tar -x -C /tmp/tabi-r19-ScribeCoherence-R` → exit 0, no output. This is a nonexecuted content snapshot, not a runtime sandbox clone.
5. `gzip -dk -- /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/form_mcp_schema.cc.gz /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/html_form_element.cc.gz /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/WebMCP.pdl.gz /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/input.html.gz /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/form-control-infrastructure.html.gz /tmp/tabi-r19-ScribeCoherence-R/.ufo/waves/round-19/w1/TabiR19-2.SrcWebmcpSpecDecl-4.body.gz /tmp/tabi-r19-ScribeCoherence-R/.ufo/waves/round-19/w1/SrcSignalsChild.gate.json.gz` → exit **1** for the erroneous final filename (`No such file or directory`); the preceding six decoded files were produced and subsequently read. No retry or claim about that nonexistent file.
6. `sha256sum /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/form_mcp_schema.cc /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/html_form_element.cc /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/WebMCP.pdl /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/input.html /tmp/tabi-r19-ScribeCoherence-R/corpus/evidence/round-19/sources/form-control-infrastructure.html /tmp/tabi-r19-ScribeCoherence-R/.ufo/waves/round-19/w1/TabiR19-2.SrcWebmcpSpecDecl-4.body` → six digests matching the retained source identities below.

Tool anomaly: ranged `read` of `form_mcp_schema.cc.gz:208-335` returned `(empty archive directory)` rather than decoded content; reported through `xd://report_issue` and avoided by ordinary local decompression. No tool installation/update was performed.

### Retained primary-source anchors

Access date for these retained openings: **2026-10-21**. Quotes below are short exact source fragments; line locations refer to the decoded body.

| Source URL | Decoded SHA-256 | Located support |
|---|---|---|
| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `:337-342` invokes `ToBoolean`; accepted coercion branches `:71-88`; hidden-description branch `:1280-1281`: `return !ToolParamDescriptionAttribute(control).empty();` |
| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `:729-751` interactive-validation error path; `:733`: `error_message.Append("Form validation failed: ");` |
| https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | `:66`: `object input`; `:109-123` response fields |
| https://html.spec.whatwg.org/multipage/input.html | `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4` | `:1762-1763` text-input newline stripping; `:3391-3412` range sanitization; `:3667-3678` color parsing/fallback. Does not by itself anchor textarea normalization. |
| https://html.spec.whatwg.org/multipage/form-control-infrastructure.html | `af71cc015c6203cc9d6c04822ec277a7969d6b594205e2ab0e557be4e2295b92` | `:323-327` maxlength user-edit precondition; separate minlength precondition `:368-372`. SKILL DV-19 should cite both ranges, not only the former. |
| https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/index.bs | `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004` | `:753-803` registration/schema serialization; `:276-278` invalid-input table. The source is consumed at note `:17-18`, supporting E08's status finding. |

No fabricated source quotation was established in the inspected exact quote anchors. The stronger findings concern scope/admission overreach rather than a proved invented quote. Other new-source rows were read in full as prose and compared against their retained dossier claims where relevant; no claim of independently re-fetching or authenticating all 18 remote bodies is made.

## Touched surfaces, out of scope, and artifacts

- **Only LANE write:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/ScribeCoherence.md` (this report).
- **Read-only production review:** LOG/SCORECARD round19; SKILL round19 section/table/registry; round19 knowledge note and lesson; QUALITY 40–46; README round19 additions; SOURCES S077–S094/search/lead additions. Supporting code, retained receipts, PLAN, isolation ledger, and wave-1 reports were inspected as data.
- **Scratch evidence:** `/tmp/tabi-r19-ScribeCoherence-R/` holds the extracted R content and six locally decoded bodies; disposable, not a committed deliverable. Durable evidence remains the original files at R and this report's exact coordinates/commands.
- **Out of scope:** fresh browser runs, mutations, whole-suite verification, source re-fetches, canonical Rust judgment, product repairs, source-status application, axis promotion, snapshot creation, integration, and commits. No browser/process/service was started, so no run-owned process cleanup was required.
- Runtime reproduction and final revised-revision counter/binding verification belong to L1; none is marked passed by this report.

## Isolation

- Clone: none; static report-only assignment, no runtime/mutation probe.
- Branch: none.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Audited checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Commit: none (no Git writes anywhere).
- Changed production paths: none.
- Direct LANE path written: `.ufo/waves/round-19/w2/ScribeCoherence.md` only.
