# Attack — appended `## Round 16` block in `corpus/README.md`

Seat: `TabiR16.AttackReadmeBlock` (leaf, read-only lane; no commits, no subagents).
Snapshot: `b444ca8e024f386124418169e8e400221524bba3`; base `e38d2599a922cb729186353830fff8e159b4fef0`.
Scope: the 20-line EOF append only. All paths lane-relative unless shown absolute.

## Verdict

| Sub-claim attacked | Verdict |
|---|---|
| A1 append-only (pure EOF addition, `numstat 20/0`) | **HOLDS** |
| A2 map row correctness (counts, source range, each enumerated "Holds" item, receipt binding) | **HOLDS** |
| A3 frontier supersession wording (correct supersession set and truth of the wording) | **BREAKS** — incomplete supersession enumeration; three earlier frontier statements are falsified by the round's landed state (S020 mined; 154 held) and never named by the append. |

Overall item verdict: **BREAKS** on A3 only. The substantive capability claim ("held for Chromium 154
only, flag-enabled, loopback, 11/11 receipt cases") is **not** falsified; every enumerated measurement
traces to the receipt. The required repair is an append-only wording amendment naming the rows the
append supersedes — no evidence remand.

## A1 — append-only: HOLDS

```
$ git diff --stat e38d259 b444ca8 -- corpus/README.md
 corpus/README.md | 20 ++++++++++++++++++++
 1 file changed, 20 insertions(+)
$ git diff --numstat e38d259 b444ca8 -- corpus/README.md
20	0	corpus/README.md
$ git diff -U0 e38d259 b444ca8 -- corpus/README.md | head -4
@@ -285,0 +286,20 @@ metadata-fixture count is counted as expansion.
+
+## Round 16 — native WebMCP held on Chromium 154 loopback (2026-10-20)
$ git show e38d259:corpus/README.md | wc -l   → 285
$ git show b444ca8:corpus/README.md | wc -l   → 305
$ git diff --check e38d259 b444ca8 -- corpus/README.md; echo $?   → 0
$ tail -c 1 corpus/README.md | xxd              → 0a
$ git diff --numstat 8f7feb3 b444ca8 -- corpus/README.md   → (empty)
```

Zero deletions and the hunk starts at the old EOF (`-285,0`): the preceding 285 lines are byte-identical.
The README was not touched by the counter-repair commit `b444ca8`; the append landed in `8f7feb3`.

## A2 — map row: HOLDS

### Counts

```
$ ls corpus/knowledge | wc -l                                   → 33
$ git ls-tree --name-only e38d259 corpus/knowledge/ | wc -l     → 32
$ diff <(ls corpus/knowledge | sort) \
       <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||' | sort -u)
                                                                → exit 0, no output
$ diff <(git ls-tree --name-only e38d259 corpus/knowledge/ | sed 's|.*/||' | sort) \
       <(git show e38d259:corpus/README.md | grep -o 'knowledge/[a-z0-9-]*\.md' | sed 's|knowledge/||' | sort -u)
                                                                → exit 0, no output
$ grep -cE '^\| `knowledge/' corpus/README.md                   → 33
$ grep -E '^\| `knowledge/' corpus/README.md | awk '{print gsub(/knowledge\//,"x")}' | sort | uniq -c
  33 1
```

"33 notes; the 32 earlier rows are unchanged" is exact: 33 notes, 33 map rows, one path per row, 32 rows
before this append, no unmapped note. `measure.mjs --histogram` independently reports `knowledge_notes: 33`.

### Source range

```
$ grep -nE '^source: S' corpus/knowledge/webmcp-chromium-loopback-round-16.md
1:source: S020 … 8:source: S036      (exactly S020, S030–S036)
$ node -e '…' corpus/SOURCES.md S030..S036                     → all tier A, status mined, used-by = the note
$ S020 row at b444ca8                                          → status mined, used-by = the note
```

S037 is queued with used-by `—` and appears only as table adjacency in the note; S038/S039 are `rejected`
with used-by `—`. The row's `S020, S030–S036` matches the note header exactly.

### Each enumerated "Holds" item, from `corpus/evidence/round-16/webmcp/receipt.json`

```
$ node -e 'const r=require(".../receipt.json"); console.log(JSON.stringify(r.summary))'
{"cases":11,"passed":11,"failed":0,"missing":0,"caseSet":{"expected":11,"ran":11,"passed":11,
 "failed":0,"missing":0,"duplicates":[],"caseSetOk":true}}
```

- `document.modelContext` — case `model-context-location`: `documentModelContextTypeof:"object"`,
  `navigatorHasModelContext:false`.
- declarative + imperative tools over `toolsAdded`/`toolsRemoved` — `declarative-form-tool` and
  `imperative-model-context` observe `toolsAdded`; `lifecycle-removal` observes `toolsRemoved` for
  `transient` (form/declarative, action `removeForm`) **and** `volatile` (imperative, action
  `abortRegistration`): `actual.toolsRemoved = ["transient","volatile"]`.
- flag-off control — `flags-off-negative-control`: `toolsAdded:0`,
  `documentModelContext:"undefined"`.
- domain-disabled control — `devtools-domain-disabled`: `WebMCP.enable` fails
  `"…'WebMCP.enable' wasn't found"`, page API still `object`.
- permissions-policy denial — `opaque-sandboxed-iframe`:
  `NotAllowedError: Access to the feature "tools" is disallowed by permissions policy.`,
  `toolsAddedFromSandbox:0`.
- `data:` divergence — `data-url-declarative`: `divergence:true`, `documentModelContext:"undefined"`,
  `isSecureContext:false`, and a `search` tool still fires in `toolsAdded`.
- spec-versus-build table — note lines 75–82 (Entry point / declarative / CDP / lifecycle columns).

### Receipt binding and runtime identity

```
$ sha256sum scripts/webmcp-loopback-round16.mjs
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1
$ node -e '…r.producerSha256'          → same digest
$ for f in corpus/evidence/round-16/webmcp/fixtures/*.html; do sha256sum "$f"; done
```

All seven fixture digests equal the `fixtureSha256` values in the cases; `runtime.observed.chromium.product`
= `Chrome/154.0.8037.97`; `runtime-pin.json` records `/usr/bin/chromium --version` →
`Chromium 154.0.8037.97 Arch Linux` and pacman `154.0.8037.97-1`; `loopback.externalRequestCount` = 0.
First run retained: `receipt-first-run-failed.json` = `{"cases":11,"passed":8,"failed":3}`, producer
`cedccdf9…` (a different, earlier harness digest) — the retained negative is genuine and unchanged.

### Live source re-open (S020 §4.1)

Opened `https://webmachinelearning.github.io/webmcp/` myself 2026-10-20. §4.1 "Extensions to Document":
`partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }`.
The block's "the current spec (S020 §4.1) … put[s] `modelContext` on `Document`" is true as of access.

### Counter context (the block is a counted input, not prose)

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e… --claim C2
{"revision":"b444ca8e…","c2_webmcp_held":1,"cited":["S020","S030",…,"S036"],"caseIds":[11 ids],"failures":[],
 "inputsRead":["corpus/README.md","corpus/SOURCES.md", …],"counterBlobAtRevisionSha256":"bda4e18e…"}
$ node .ufo/waves/round-16/measure.mjs e38d2599… --claim C2
{"revision":"e38d2599…","c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"], …}
```

`corpus/README.md` is in `inputsRead` and `measure.mjs:218` requires it to contain the note path, so the
appended row is load-bearing for C2. C1 at `b444ca8`: `c1_binding_contracts:1` (`inputsRead` = r15
measurements, gate, selftest); at `e38d259`: `0` with "gate or selftest absent". Both counters reproduce.

## A3 — frontier supersession wording: BREAKS

### S2-1 (primary) — the append falsifies three earlier frontier statements and names none of them

The block says the round-3 bullet `:35` and the kaika row `:181` "keep their historical wording", and its
own "Still open" list drops native WebMCP and WebMCP spec mining. But three earlier statements that assert
those items are **open** are neither edited (append-only, fine) nor named as superseded, and are now false
(the new state, not the added text, falsifies them; the append is the integration point that must name them):

```
$ sed -n '194p;216p' corpus/README.md
| WebMCP spec | open — S020 opened and queued (CG draft 2026-10-16); native WebMCP in chromium 152 still unprobed | `corpus/SOURCES.md` S020; …
| Other open frontier ground | unchanged — extension↔daemon handshake, native WebMCP host probe, rate/rights real-site records, real-site journeys, WebMCP spec mining | historical frontier rows :180–183 and :194 |
$ awk 'NR>=282 && NR<=285{printf "%d:%s\n",NR,$0}' corpus/README.md
282:dates and original pinned bytes stay fixed. Extension↔daemon handshake,
283:native WebMCP, real-site rate/rights,
284:real-site journeys and WebMCP spec mining remain open; no source-row or
285:metadata-fixture count is counted as expansion.
$ git show b444ca8:corpus/SOURCES.md | grep '^| S020 |' | cut -d'|' -f9,10,12
 mined | 2026-10-19 | corpus/knowledge/webmcp-chromium-loopback-round-16.md
```

So at the measured revision `:194` still says "open — S020 opened and queued" while S020 is `mined` and
used by the round-16 note; `:216` still says "unchanged … native WebMCP host probe … WebMCP spec mining";
round-15 `:282-285` still says "native WebMCP … WebMCP spec mining remain open". The append's "Still open"
list omits spec mining and native WebMCP, so the document now contradicts itself in three places.

This is not my invention of a requirement: the round's own wave-1 map says these anchors must be dispositioned.
`.ufo/waves/round-16/w1/ConnFrontierRows.md` §3 opens with "| `:194` WebMCP spec | queued → mined, if the note
opens with the S020 `source:` line |" and "| `:216` … narrows to closed **for S020 only**; not reworded in
place |"; `.ufo/waves/round-16/w1/DraftReadme.md` findings say "keep `:35`, `:181`, `:194` unedited" — i.e.
`:194` was in the round's disposition set — and `.ufo/waves/round-16/w1/CriticScalars.md:16` assumes "C2
lands both WebMCP rows (`corpus/README.md:181,194`)". The landed block names only `:35` and `:181`.

Precedent for naming superseded rows is already in this file: round-12's append says "This append supersedes
the queued/no-note accessible-selector row at :193 only." The round-16 append should do the same for
`:194`, `:216`, and round-15 `:282-285`.

Counter-consideration, stated: round-12's own line calls `:180–183` and `:194` "historical frontier rows",
so a reader who knows the convention may still read them as historical. That does not remove the defect —
the round-16 append is what changes `:194`'s content from true to false (S020 `queued`→`mined`) and it is the
first place that could say so; it doesn't.

Fix (append-only, no rewrite): add one sentence to the round-16 block naming the three anchors, e.g.
"Superseded as historical by this append: `:194` (S020 queued→mined), `:216` (WebMCP spec mining closed for
S020; native WebMCP host probe split into the 154 rows and the default-profile row), and the round-15
restatement at `:282-285`."

### S3-1 — half the superseded quotation is actually confirmed, not superseded

Block text: `The kaika row's "not navigator.modelContext, and no flag carries it" is superseded`.

`no flag carries it` is indeed falsified (probe `blink-WebMCP` alone → `modelContextInDocument:true`).
But `not navigator.modelContext` is **confirmed** at 154 by the receipt:
`model-context-location.actual.navigatorHasModelContext:false`, `navigatorModelContextTypeof:"undefined"`
(the case's own expected field is `navigatorModelContext:"absent"`). The block's explanation correctly says
`modelContext` moved to `Document`, but as written it labels the navigator-absence clause superseded when the
round's own evidence corroborates it. `ConnFrontierRows.md` §3 states this precisely: clause (b) is "partly
false … `document.modelContext` observed … `navigator.modelContext` measured absent".
Fix: split the quotation — supersede "the only surface … is a CDP tool" and "no flag carries it"; state
"`navigator.modelContext` remains absent; the page API is `document.modelContext`".

### S3-2 — "33 notes" is true but unbound

The number reproduces (commands under A2) and `measure.mjs --histogram` returns `knowledge_notes: 33`, but
the block cites no round-16 measurement artifact for it, unlike rounds 12–14 which each name a committed
`measurements.json` (`corpus/evidence/round-12|13|14/measurements.json`). The C2 counter checks only that
README maps the note (`.ufo/waves/round-16/measure.mjs:218`), not the count. Traceability gap, not a false
claim; cheapest repair is to cite the histogram command/revision in the block or land the count in a
round-16 measurement file.

### Residual risks (no verdict impact)

- "loopback fixtures only": the receipt includes the `data:` case, which is an opaque-origin URL, not
  loopback. The row discloses "the `data:` divergence" in the same sentence, so the scope wording is
  defensible but not literal.
- "11/11 receipt cases" is true of the final receipt; the append does not disclose that two expectations and
  one probe mechanic were repaired to reach it (`receipt-first-run-failed.json`, 8/11; note §Corrections).
  The note carries the repair trail honestly; the map row does not.
- Adjacent lane state (outside this verdict): `corpus/evidence/round-16/measurement-binding.json` exists in
  the worktree but is **untracked and absent from the b444 tree** —
  `git cat-file -e b444ca8:corpus/evidence/round-16/measurement-binding.json` → `fatal: … exists on disk, but
  not in 'b444ca8'` (exit 128); mtime `2026-10-20 11:57:18`, after the `11:55:15` commit. The C1 counter's
  `inputsRead` is only `corpus/evidence/round-15/measurements.json`, `scripts/check-measurement-binding.mjs`,
  `scripts/selftest-measurement-binding.mjs`, so no counter depends on it and it is not part of the reviewed
  snapshot. Flagged for the measurement-binding reviewers; it is not a defect of this README block.
- Out of this block's scope: `corpus/SOURCES.md` S020's recorded revision `f14762e6` does not occur in the
  live spec page (access 2026-10-20), which carries `cb3d1696` (matching the note line 77). A source-registry
  inconsistency for the SOURCES reviewers, not a defect of the README block.

## Commands run (read-only)

`git show/diff/log/numstat/ls-tree`; `ls`/`diff`/`grep`/`sed`/`awk`/`wc`; `sha256sum`; `file`/`tail`/`xxd`;
`node` JSON reads of `receipt.json`, `receipt-first-run-failed.json`, `runtime-pin.json`,
`measurement-binding.json`, `.ufo/waves/round-16/probes/WebmcpProbeFlags.json`;
`node .ufo/waves/round-16/measure.mjs <rev> --claim C1|C2|--histogram`; one `curl -sS` of
`https://webmachinelearning.github.io/webmcp/` into `/tmp`. No browser launched; no harness run; no file in
the lane modified except this report; no tool installed or upgraded.
