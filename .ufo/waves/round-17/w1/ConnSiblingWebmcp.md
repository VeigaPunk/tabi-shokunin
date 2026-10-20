VERDICT: PASS

# ConnSiblingWebmcp — does any sibling hold or plan WebMCP / tool invocation? (read-only)

Seat: TabiR17.ConnSiblingWebmcp-2. Scope: sibling lanes only; nothing in LANE edited, nothing absorbed.

## Method

Reads + `grep -rIn` (no shell expansion into writes) over `kaidoku`, `kumitate`, `kake`, `chousa`,
`revenger`, `tameshi`, plus a sweep of `kagi`/`kasegi` as the named profile/secret neighbours; all
21 `*-shokunin/PROVINCE.md` scanned for `browser|cdp|chrom`. Sibling quotes were resolved with
`git -C <lane> show <40-hex>:<path>` and byte-compared to the worktree
(`git -C <lane> diff --quiet <commit> -- PROVINCE.md` → clean) so every `sibling_ref` cites committed bytes,
not an in-flight draft. Heads used: kaidoku `9011581d84527ba34c675f9cf912e54d2e72d470`,
kake `7c61c8cc791bde36dd5e3688bdfea2678d90146c`, revenger `cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97`,
kagi `c2cab35bc92e57e39e5489bac3386db078345b3f`, tabi baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`.

## 1. Direct answer: no sibling holds or plans WebMCP *invocation*

- Fleet-wide (excluding `tabi-shokunin/`, `.git/`, `node_modules/`) for `invokeTool`, `toolInvoked`,
  `toolResponded`, `invocationId`, `WebMCP.` → **0 hits** (`grep -rIn` over `*.md,*.mjs,*.js,*.json`).
  C2's `webmcp-cdp-invocation` ground has no competing claim anywhere in the fleet.
- The only sibling WebMCP content is kaidoku's **passive discovery** verb: `discover-webmcp-tools`
  (`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:180` "`tools:{total:0,items:[]}`",
  committed at `9011581`; also `2026-10-13-r4-16-frontier-rescan.md:597,:608`; `corpus/README.md:55`).
  That is REA's own verb over CDP, exercised on a page registering zero tools — discovery, never invocation.
- Live sibling rounds carry no C2 term: `grep -i 'webmcp|invoketool'` over
  `kaidoku/.ufo/waves/round-17|round-18`, `tameshi/.ufo/waves/round-17`, `kake/.ufo/waves/round-21`
  → empty. kumitate/chousa/revenger/tameshi `PROVINCE.md`/`SKILL.md` carry no browser-surface claim.
- `tools/call` / `callTool` hits exist only in kaidoku MCP-client receipts (agent-side REA plane), not
  a page-tool surface. kumitate's plane is likewise agent-side (`kumitate-shokunin/PROVINCE.md:20`, `:26`).

## 2. The real overlap is CDP page observation, and it is ruled — but only on tabi's side

- Ruled surface: `kaidoku-shokunin/PROVINCE.md:53` "Runtime observation (CDP)" (self-launched
  `chromium --headless --remote-debugging-port=9222`, `list_browser_targets`, `inspect-web-page`,
  `capture-browser-scenario`) plus `:128` "Runtime observation verbs" (`observe-web-session`,
  `observe-web-execution`, `observe-javascript-runtime`, `reconcile-javascript-runtime`).
- Ruling: `corpus/lessons/round-16-verifier-spotcheck.md:141` "owns live browser/CDP page observation,
  including the WebMCP page-tool surface"; `:142` "keeps CDP only as an REA provider surface for
  shipped-artifact analysis" + "It cites tabi for browser-side mechanics."
- tabi's r16 note still says the opposite of settled:
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md:133-136` "this overlap is **contested scope
  awaiting an integrator ruling**". That clause is now stale.
- **Second-order constraint (observed, not inferred):** that note is a round-16 `countedInputs` entry
  (`corpus/evidence/round-16/measurement-binding.json:56`), so it MUST NOT be amended. Probe in
  `/tmp/tabi-r17-ConnSiblingWebmcp-ZgnS` (clone of LF at `5859243`, committed as a probe commit):
  baseline `check-measurement-binding --check corpus/evidence/round-16/measurement-binding.json` →
  `verdict=clean` exit 0; after appending one comment line to that note →
  `verdict=failed … reason=counted_input_changed detail=paths=corpus/knowledge/webmcp-chromium-loopback-round-16.md`,
  exit 1. Supersession therefore lives in the NEW r17 note and the adjacency row, never in the r16 bytes.

## 3. Contradiction to record (do not smooth it)

`kaidoku-shokunin/.ufo/waves/round-17/w1/ConnSiblingOverlap.md:16` (committed at `9011581`) reads
`| tabi | ../tabi-shokunin/PROVINCE.md:15 | "reverse engineering as forensics (→ revenger/kaidoku)" | ambiguous pair, no arbiter |`.
Two facts:
1. That scan's declared search terms are Go/Ghidra/log-retention only (`:5-6`), so kaidoku never searched
   CDP/WebMCP this round; the tabi row is incidental, not a considered claim.
2. "no arbiter" is accurate for the pair it anchors (tabi `PROVINCE.md:15` RE-as-forensics → revenger/kaidoku)
   but false as a general statement about tabi↔kaidoku: the CDP pair is ruled at `:141-142`.
Also `grep '\btabi\b' kaidoku-shokunin/PROVINCE.md` → **0 hits**: the ruling's second half ("kaidoku …
cites tabi for browser-side mechanics") is unexecuted at `9011581`. tabi's row can only assert the tabi-side
half; the counterpart citation is kaidoku's lane-side follow-up, still open.

## 4. Rows that are admissible in `corpus/adjacency.tsv` (quotes resolved at the cited lines)

Exactly two pass the closed disposition vocabulary. Padding with the rest would go red.

```
cdp-runtime-observation	kaidoku	kaidoku-shokunin@9011581d84527ba34c675f9cf912e54d2e72d470:PROVINCE.md:53	Runtime observation (CDP)	PROVINCE.md	CDP session discipline (endpoints, targets, screenshot/DOM evidence	ruled	tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:141	owns live browser/CDP page observation, including the WebMCP page-tool surface.
browser-driving-vs-publishing	kake	kake-shokunin@7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md:30	`tabi` drives browsers and owns client-side crawler discipline; kake owns	PROVINCE.md	web *publishing* (→ kake)	split-declared	-	-
```
Alternate `sibling_quote` for row 1 if `Runtime observation (CDP)` is judged too short:
``self-launched targets: `chromium --headless --remote-debugging-port=9222` `` (5 words, same line, no TAB).
`tabi_quote` for row 1 wraps at `PROVINCE.md:10`; the quoted fragment ends exactly at `:9` and is verbatim.
For row 2 the kake line names both lanes (`tabi … ; kake owns`) and tabi `:16` names the routed side, so the
pair jointly states the split — C3Checker should accept `-`/`-` for `split-declared`/`refused-route`.

## 5. Overlaps that are NOT admissible this round (report, do not encode)

- **revenger** `PROVINCE.md:5` "browser/Electron runtime evidence — using the REA skill and its toolset"
  (committed `cf02419`). Genuine overlap with tabi's live-page surface, but the ruling names only tabi/kaidoku,
  revenger states no split, and tabi has no line naming revenger for browsers. No `ruled`, no
  `split-declared`, no tabi L0 line ⇒ no admissible row. Route to the integrator; do not cite revenger's
  in-flight round files.
- **kagi/kake the-musketeer profile + CDP 9222**: `kagi-shokunin/PROVINCE.md:43` "contested with kake"
  (presence-only partition row in kagi's own `corpus/adjacency.tsv`), `kake-shokunin/PROVINCE.md:35`
  "The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)". tabi is named as a party,
  the pair is unresolved, and no `tabi | round-17 |` line exists in `.ufo/l0-questions.md` (tabi lines are
  rounds 1 and 5 only) ⇒ `contested-open` is unavailable to this leaf (fleet repo is not writable here).
  tabi's own refusal stands independently: `corpus/SOURCES.md:41` S027 rejected ("attaches port 9222 to the
  user's everyday browser profile"), and C2's harness must keep the ephemeral-port + `--user-data-dir` form.
- **kaidoku r17 scan `:16`** (above) must not be used as the `sibling_quote` for the ruled row: a quote saying
  "no arbiter" beside a `ruling_ref` asserting a ruling is an internal contradiction the checker will not catch.

## 6. How tabi should cite/route (per the integrator ruling)

1. **C2 note** (`corpus/knowledge/webmcp-invocation-round-17.md`): claim the invocation surface as tabi's under
   `:141`, carve out the REA discovery verb and MCP registration as kaidoku's under `:142`, and state the
   supersession of r16 `:133-136` by reference (cannot edit pinned/counted bytes). Do not reuse the phrase
   "awaiting an integrator ruling".
2. **PROVINCE append (L1 only)**: record the ruling with both line anchors, and note kaidoku's counterpart
   citation is unexecuted at `9011581` (defect 5 is one-sided so far).
3. **`corpus/adjacency.tsv`**: exactly rows 1–2 of §4. The three §5 overlaps stay in this report and go to the
   integrator/L0, not into the TSV — an unverifiable row would break `check-adjacency` and pad the count.
4. **Naming collision to guard**: `kagi-shokunin/corpus/adjacency.tsv` already exists with a different
   schema (`# kagi-shokunin ownership partition — v1`; row columns `path|owner|status|claim|basis|token|note`,
   plus separate 2-field `# own <path>` directive lines).
   tabi's new 9-column file shares the basename in a different repo; the checker must require the exact tabi
   header and must never fall back to kagi's file, and a reviewer must not diff the two as one ledger.

## 7. Predicted cross-claim effect (observed in the sandbox, for L1/C1Counter)

Round 17's mandatory appends to `corpus/SOURCES.md` (S041+) and `corpus/README.md` (defect-4 index row)
are themselves round-16 `countedInputs` (`measurement-binding.json:52-53`). Probe at `5859243` + both appends
committed: `check-measurement-binding --check corpus/evidence/round-16/measurement-binding.json` →
`verdict=failed … reason=counted_input_changed detail=paths=corpus/README.md,corpus/SOURCES.md`, exit 1.
`--legacy` on this manifest is a typed could-not-evaluate (exit 2, `manifest_schema_invalid`), so it is not an
escape hatch. Consequence: the C1 entry that runs this gate **without `--at`** will exit 1 at the r17 tip in both
arms A and B. That is a historical binding, not a live invariant — either re-anchor that entry at
`3254740c694e4fc7851ca9d88b39230db3042ba6` with a recorded reason, or expect exactly this finding; do NOT
"fix" it by editing the r16 note or by dropping the append-only rows.

## Risks

- The row-1 `tabi_quote` depends on tabi `PROVINCE.md:9` staying put; PROVINCE is append-only, so line 9 is
  stable through r17 — but an L1 pre-line insert would silently invalidate it (checker catches it, count drops).
- `sibling_ref` cites kaidoku `9011581`; kaidoku may land a later commit this round. Re-resolve the line at that
  commit at check time, not HEAD (C3 already forbids HEAD).
- If revenger's or kagi/kake's contested scope is later ruled, tabi's count must grow by admission, not by
  retro-fitting these rows to a disposition they cannot support today.

## Verification performed

- Fleet greps for `invokeTool|toolInvoked|toolResponded|invocationId|WebMCP.` excluding tabi: 0 hits.
- All eleven `sibling_quote`/`tabi_quote`/`ruling_quote` fragments resolved byte-exactly against
  `git show <commit>:<path>` at the cited line (scripted check, 11/11 OK, ≤11 words each, no TABs).
- Sandbox probes: `git clone --no-hardlinks LF /tmp/tabi-r17-ConnSiblingWebmcp-ZgnS`, detached at `5859243`;
  three runs of the committed gate blob (clean → note edit red → index appends red). Sandbox removed.
- Not run (not this seat's): `measure-c1/c2/c3.mjs`, `check-adjacency.mjs`, the C2 harness. Nothing was
  verified there and nothing is claimed.
- No tools installed or upgraded.

Files written: `.ufo/waves/round-17/w1/ConnSiblingWebmcp.md`
