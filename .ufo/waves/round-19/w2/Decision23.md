# DV-23 semantic review

**Verdict: DISAGREE with the decision as currently scoped/cited; agree with the two observed outputs.** The committed receipt records the stated `99 → 10` and `"not-a-number" → 6` results, each as `Completed` with one submit. The defects are the category-wide condition and an incomplete source range/token for the second result, not a contrary runtime observation.

## Axes

Source entailment; receipt/runtime entailment; condition scope and type/coercion; probe/control identity; counter strength.

## Evidence and entailment

- Manifest DV-23 is `decisions.json:575-598`; SKILL duplicates it at `SKILL.md:2082`. It says “out-of-range or non-numeric” generally and cites S082 lines 3391–3412 with token `suffering from an overflow`.
- S082 is the WHATWG Living Standard, `https://html.spec.whatwg.org/multipage/input.html`, fetched **2026-10-21** (updated 2026-10-20). The retained decoded body `corpus/evidence/round-19/sources/input.html.gz` hashes to **9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4**, matching `SOURCES.md:96` and the manifest. Decoded lines 3391–3420 state that an invalid range value is sanitized to its default, define the default from the min/max midpoint, set overflow to max, and round step mismatches to the nearest valid value (ties toward positive infinity). Relevant exact source snippets: “value sanitization algorithm” (3391), “minimum plus half the difference” (3398), “suffering from an overflow” (3410), “suffering from a step mismatch” (3415), “nearest to positive infinity” (3419–3420).
- **Current citation is incomplete for the full answer.** Its token is specifically the overflow branch, which supports 99→10; the selected lines also include invalid-value fallback and the midpoint, but end at 3412 and omit the step-mismatch rule at 3415–3420 that accounts for 5→6. Thus S082 as cited does not entail the `"not-a-number" → 6` detail. Recommended manifest/SKILL source binding: S082 lines **3391–3420**, token **`value sanitization algorithm`** (line 3391), retaining the same body and hash. This is standards semantics, not Chromium implementation evidence: S082's SOURCES scope explicitly says “not Chromium 154 implementation or runtime validation evidence.” The receipt, separately, supplies the pinned-build observation.
- The fixture is `validation/fixtures/range-color.html:5-7`: `type=range`, `min=0`, `max=10`, `step=2`. Receipt records (`receipt.json:2871-2942`, `2945-3017`) show probe 01 input `range: 99`, `toolResponded.status: Completed`, output/state `range: "10"`, `submitCount: 1`, `pass: true`; probe 02 input is the JSON string `"not-a-number"`, with the same status/count and `range: "6"`, `pass: true`. The schema simultaneously declares `range.type: number` (2885–2889, 2959–2964), while the raw `toolInvoked.input` for probe 02 contains the string (2971–2976). That proves acceptance of this exact string, not all type-invalid values. No DV-23 probe covers below-min input, a numeric string, `true`, `null`, array/object, or other coercion paths; none should be inferred from this pair. “Non-numeric” should therefore name the tested JSON string, not be read as null/boolean/any non-number acceptance.
- Control `decl-range-color-03` is in-family and `Completed` with one submit (`receipt.json:3019-3088`). Probe IDs 01 and 02 are distinct. Across all manifest rows, there are 46 probe references and 46 distinct probe IDs (zero duplicate probe IDs). Role reuse exists: case 03 is DV-23's control and DV-24's probe; case 01 is DV-23's probe and DV-24's control. This satisfies the manifest rule (unique **probe** IDs; in-family Completed control), and is not a duplicate-probe violation. It would fail only a stricter rule requiring every probe/control role reference to be globally disjoint, which is not the stated contract.

## Prose consistency and exact correction

`corpus/knowledge/webmcp-declarative-validation-round-19.md:48-51` first groups “Number/range” and says `"not-a-number" and true fail at fill`, then says the range sanitizer defaults and that the tested nonnumeric range input completes as 6. This is internally contradictory for the tested range string. Narrow the first assertion to the `type=number` branch (and keep `true` scoped to the evidence that tested it); distinguish the tested range-string fallback. A suitable replacement is: **“Number controls: `"not-a-number"` and `true` fail at fill. Range controls differ: in the tested min=0/max=10/step=2 fixture, 99 becomes 10 and the JSON string `"not-a-number"` sanitizes to the midpoint then step-rounds to 6.”** Do not extend the `true` result to range controls without a corresponding observation.

Suggested exact DV-23 condition/answer (use in both `decisions.json` and `SKILL.md`):

> **Condition:** In the tested range fixture (`min=0`, `max=10`, `step=2`), the input is JSON number `99` or JSON string `"not-a-number"`.
>
> **Answer:** Both invocations completed and submitted once: `99` produced range `"10"`; `"not-a-number"` produced range `"6"` (midpoint 5 rounded to the valid step toward +∞).

Use the expanded S082 line/token binding above. This states what was observed without implying all out-of-range and nonnumeric inputs, or Chromium-wide behavior, were tested.

## Counter assessment / residual risk

The counter is strong on the case-level runtime contract: `measure-c1.mjs:748-801, 834-879` re-runs the pinned producer in a detached sandbox, checks runtime/producer and case/fixture digests, and uses the fresh receipt; the harness `scripts/webmcp-validation-round19.mjs:1043-1063` compares status, error substring, submit count, expected fields, and schema. The range receipt's three cases are all `pass: true`.

It is **not a semantic entailment check for decision prose**. `measure-c1.mjs:579-610` verifies source row/date/hash/line bounds and mere token presence, not whether the token supports the answer. `:553-560` checks that the SKILL row contains the case IDs and source row, not that its condition/answer matches the manifest or receipt values. `:484-508, 635-703` reduces receipt observations for cross-receipt comparison to status/errorText/submitCount; decision answer/condition and output fields are not compared to the prose. Fresh harness `pass` protects the expected fields for the reproduced cases, but an incorrect prose answer or irrelevant in-range source token could still count. DV-23 happens to state the receipt values correctly; the source citation gap and note contradiction show why the semantic review is necessary. Consider binding answer fields to probe expected/observed fields and requiring an explicitly relevant source claim/range, rather than only a lexical token.

## Verification gaps

No browser, full C1 counter, or runtime reproduction was run, as assigned. No `lsp` device/server is available in the exposed tool inventory, so LSP status/references/definition/diagnostics could not be requested; grep was used only to locate prose, not as semantic proof. The receipt and retained body were read directly; the body SHA-256 was independently computed from its decompressed bytes. No tools were installed.

## Isolation

Report-only review. No production file, clone, branch, or commit was created; the sole lane write is this assigned report.