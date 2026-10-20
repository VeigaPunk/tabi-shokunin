# AttackC2Forge — round-16 wave 2 (author-side critic report, not certification)

Attacks: C2 counter `.ufo/waves/round-16/measure.mjs` `countC2` (lines 193–254) at snapshot `b444ca8e024f386124418169e8e400221524bba3`.

**Verdict: BREAKS.** The five named forgeries each count 0 in their naive form. Each one also has a variant that stays self-consistent and still counts 1. The counter checks that the committed bytes agree with each other. It does not check that a harness run produced them.

## Method
- Clone: `git clone -q /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/attackc2forge-6mir8x64/repo`, then `git checkout --detach b444ca8e…`.
- For each variant, the driver resets to b444ca8, applies one mutation, and runs `git -c user.name=forge -c user.email=f@x commit -m <variant>`. It then runs the clone's own counter at HEAD: `node .ufo/waves/round-16/measure.mjs HEAD --claim C2`. ROOT resolves from the script path, so the counter reads the clone.
- Receipt edits round-trip through `json.loads`/`json.dumps(indent=2)`. That rewrites formatting but not field values the counter reads.
- The lane was not written to except for this report. `git status --short` at the lane shows only `?? .ufo/waves/round-16/w2/` and `?? corpus/evidence/round-16/measurement-binding.json`. The second file is not mine; it appeared during the wave.

## Results (all runs exited 0; output is `c2_webmcp_held` followed by `failures`)

| Variant | Clone commit | Held | Failures |
|---|---|---|---|
| F0 baseline (a marker file is the only change) | 8014ca9 | **1** | [] |
| F1a `declarative-form-tool` status `fail`, verdict still `pass` | 5de2e9c | 0 | `case declarative-form-tool status fail` |
| F1b summary.caseSet passed=10 failed=1, caseSetOk true, all case statuses pass | 14700ca | **1** | [] |
| F2a producerSha256 stale (`0`×64) | e656f8e | 0 | `producerSha256 != harness blob` |
| F2b harness appended with `process.exit(0);` and producerSha256 recomputed to the new blob | a2fa0a0 | **1** | [] |
| F3a note's `source:` lines replaced by `source: S021` only (S021 is queued) | 9d545f2 | 0 | `S021 status queued`, `S021 used-by lacks note` |
| F3b `source: S020` plus queued citations written as `- source: S021` and `Source: S037` | eeb1876 | **1** | [] |
| F4a every README line naming the note removed | 192d315 | 0 | `README does not map the note` |
| F4b README row removed, `<!-- withdrawn: knowledge/webmcp-chromium-loopback-round-16.md -->` appended | 867e873 | **1** | [] |
| F5a `declarative-form-tool` fixtureFile `plain.html`, fixtureSha256 left stale | 5222f99 | 0 | `case declarative-form-tool fixture digest` |
| F5b same, fixtureSha256 recomputed to sha256(plain.html) | 1df34b4 | **1** | [] |
| F5c all 11 cases fixtureFile `README.md` (fixtures/README.md) with recomputed digest | 6ef1e60 | **1** | [] |
| F5d `toolname="…"` stripped from declarative-form.html, its case digests recomputed | 783b076 | **1** | [] |
| F7 receipt-first-run-failed.json (verdict fail, 8/11) flipped: verdict/status=pass, producerSha256 recomputed | 58420aa | **1** | [] |

## Counterexamples and evidence

1. **Fixture identity (F5b, F5c).** In F5b the positive control `declarative-form-tool` points at `plain.html`. That file has no tools: `grep -c 'toolname\|registerTool\|modelContext' fixtures/plain.html` → `0`. Its retained `toolsAdded` is still non-empty and the case counts 1. The counter never compares `fixtureFile` to the case's own `fixture` label (`corpus/evidence/round-16/webmcp/fixtures/declarative-form.html`). It also has no expected case→fixture map. F5c shows any regular file under `fixtures/`, including non-HTML, is accepted.
2. **Producer/fixture digest is recomputable (F2b, F5d, F7).** `producerSha256` and `fixtureSha256` are compared with blobs at the same REV, and both sides are committed by the author. The digests prove the receipt is consistent with itself, not that a run produced it. F7 is the strongest case: the retained failing first-run receipt has `"verdict": "fail"` and caseSet `passed 8 failed 3`. Its own producerSha256 is `cedccdf9…`, while the current harness is `961874e4…`. Hand-flipping its fields gives held 1 with no harness run.
3. **README mapping is substring-only (F4b).** `includes('knowledge/webmcp-chromium-loopback-round-16.md')` (line 218) is satisfied by an HTML comment that says "withdrawn".
4. **Citation parse is strict-form-only (F3b).** Only `^source: S\d{3,}` lines are checked (line 204). Queued or rejected rows cited in other forms (`- source:`, `Source:`) are invisible. This does not inflate on its own, because at least one parsed mined external row is still required. It is low severity and a tradeoff, not a defect.
5. **Summary not cross-checked (F1b).** `caseSetOk` means the case set is complete, not that the cases passed. The first-run failed receipt also has `caseSetOk: true` with failed 3. `passed`/`failed` are never compared with the per-case statuses. This is low severity: per-case `status` is still enforced, as F1a shows.

## Impacted axes
- C2 coverage/capability credibility. A count of 1 does not separate a produced receipt from an authored one (F2b/F5d/F7), and fixture identity is unbound (F5b/F5c).
- Provenance. `fixture` and `fixtureFile` can disagree silently. A README "mapping" can be a withdrawal comment.
- C1 is not attacked here.

## Smallest safe corrections (countC2 only)
- **Fixture identity (F5b, F5c):** add a counter-owned `EXPECTED_FIXTURE` map of case id → file for all 11 ids. Require `c.fixtureFile === EXPECTED_FIXTURE[c.id]`. For non-`data:` cases, also require `c.fixture === 'corpus/evidence/round-16/webmcp/fixtures/' + c.fixtureFile`. For `data-url-declarative`, require `c.fixture === 'data: (' + c.fixtureFile + ' bytes)'`.
- **README (F4b):** use an anchored table-row test, `/^\| `knowledge\/webmcp-chromium-loopback-round-16\.md` \|/m`.
- **Summary (F1b):** require `summary.caseSet.passed === cases.length`, `failed === 0` and `ran === cases.length`.
- **Production (F2b, F5d, F7):** the counter cannot fix this by itself. A digest can only bind a receipt to bytes the same author commits. Two options:
  - Require that the harness and fixtures are unchanged between the commit that last touched the receipt (`git log -1 --format=%H -- <receipt>`) and REV. This blocks F2b and F5d when they land in a later commit, but not a single-commit forgery like F7.
  - Have a non-author reproduce the run: `node scripts/webmcp-loopback-round16.mjs --out /tmp/<x>.json`, then compare case ids, statuses and `toolsAdded`.

  Until then, the capability claim `webmcp-cdp-observation` rests on the receipt being authored honestly. A count of 1 does not show it. This is a tradeoff the canonical judge should weigh, not something the counter can fix.

## Not run
- I did not re-run the harness, so production of the lane receipt was not reproduced.
- Sources were not re-opened (out of scope).
- No tools were installed.

Scratch clone: `/tmp/attackc2forge-6mir8x64/repo` (forge commits are on detached HEADs; IDs above).
