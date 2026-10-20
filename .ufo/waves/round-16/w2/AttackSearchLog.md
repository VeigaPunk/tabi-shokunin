# AttackSearchLog — round-16 Search log line and `native-webmcp` Path

Seat: `TabiR16.AttackSearchLog` (leaf, read-only). Date: 2026-10-20.
Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` (HEAD; commit A
`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair `b444ca8`).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

Scope: `corpus/SOURCES.md:76` (the round-16 search-log line), the `native-webmcp`
Path at `corpus/SOURCES.md:61`, and the question "is the withdrawn Fastly rejection
justified?" against `.ufo/waves/round-16/w1/` and the live sources.

Read-only method: `git show/cat-file/rev-parse`, `node scripts/check-sources.mjs`,
`curl` into `/tmp/attack-src/`. No browser, harness, counter, gate self-test or
lane mutation was run. No tool was installed or upgraded; pacman was not invoked.
This is author-side review, not non-author certification.

## Verdict

**BREAKS** — the line's per-row evidence binding is dangling at the measured
revision, and the named S020 re-open has no contract-required old→new record.
The named exclusion/inclusion mapping otherwise matches the w1 reports, and the
withdrawn Fastly rejection is **justified**.

| Sub-question | Verdict | Anchor |
|---|---|---|
| 10 new rows `S030–S039`, counts `7 mined / 1 queued / 2 rejected` | **HOLDS** | status count and row digests below |
| 15-seat roster | **HOLDS** | 13 `Src*` + `RevengeDevtoolsFrontend` + `DraftSources` in `w1/spec.json` |
| Named exclusions (main-branch IDL/flags, viewer shell, S021, WPT/web_tests, two navigator guides, 403/rate limits) | **HOLDS** | w1 evidence below; two residual gaps |
| `plus the S020 re-open` | **BREAKS** (record) | row says `f14762e6`; w1 live says `cb3d1696`; note cites `cb3d1696`; live now `51ed7565`; no lesson/supersedes row |
| `L1 re-fetched S020, S033, S034 and S036 itself` | **UNPROVEN** | no retained record; the cited lesson is absent |
| Per-row evidence pointer `corpus/lessons/round-16.md §Gate` | **BREAKS** | file does not exist at `b444ca8`; contract rules 1–2 |
| Fastly rejection withdrawn because chromestatus confirms 149–156 | **HOLDS** | chromestatus stage 150 `149 / 156`; Fastly sha256 and quote match |
| `native-webmcp` Path chain and "runtime-held ... flags only" | **HOLDS** | note header + receipt |

## Findings

### F1 (HIGH) — the line's per-row evidence home does not exist

The line ends: *"Per-row URL, date and located quotes:
`corpus/lessons/round-16.md` §Gate."*

At the measured revision that file is absent:

```
$ git rev-parse HEAD
b444ca8e024f386124418169e8e400221524bba3
$ git cat-file -e b444ca8:corpus/lessons/round-16.md
fatal: path 'corpus/lessons/round-16.md' does not exist in 'b444ca8'
catfile_exit=128
$ git ls-tree -r --name-only b444ca8 corpus/lessons | grep -c 'round-16'
0
$ ls corpus/lessons/round-16.md
ls: cannot access 'corpus/lessons/round-16.md': No such file or directory
```

The only round-16 lesson artifacts are drafts, not the lesson:

```
$ git ls-tree -r --name-only b444ca8 | grep 'DraftLesson'
.ufo/waves/round-16/drafts/DraftLesson.md
.ufo/waves/round-16/w1/DraftLesson.md
```

`DraftLesson.md` says its target is `corpus/lessons/round-16.md` but contains only
the `## Mistakes` draft, not a `## Gate` table. `PLAN.md:112` lists
`corpus/lessons/round-16.md` as an L1-only deliverable. `SourcesStaging.md`
(risks section) also says the opening evidence "belongs to ... the round-16
lesson Gate."

The w1 seats do carry per-row URL/date/quotes (`w1/DraftSources.md` §B;
`w1/SrcChromeDocs.md` §8), so the content exists — but the contract-mandated
location does not, and the line points only at the latter.

The fleet contract the registry cites (`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:45-51`,
read-only) is explicit:

> 1. **A row is a claim.** Write it only after opening the source in the round that
> writes the row. The round lesson's `## Gate` records, for every new row, the URL,
> the access date, and a ≤25-word quote with its location grounding `teaches`.
> 2. **Append-only.** Only `status`, `recheck` and `used-by` change in place, and
> each change is logged old→new in the round lesson.

So the missing lesson is not cosmetic: it is the contract-mandated record for
every one of S030–S039, and for the S020 `queued→mined` and `used-by —→note`
changes. The line's own pointer is false at this revision.

The structural gate cannot see this:

```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
gate_exit=0
```

Remediation: promote `w1/DraftSources.md` §B (the quote/digest table) into
`corpus/lessons/round-16.md` §Gate, log the S020 old→new values there, or change
the line to say the lesson is pending — do not point at a nonexistent path.

### F2 (HIGH) — the S020 re-open has no registry-visible revision record

The registry row still records the pre-reopen revision:

```
$ sed -n '34p' corpus/SOURCES.md
| S020 | WebMCP — https://webmachinelearning.github.io/webmcp/ | spec | A | ... | CG-DRAFT 2026-10-16, revision f14762e6 | ... | mined | 2026-10-19 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

The registry row and the note disagree; the w1 seat says the row's anchor is stale:

```
$ sed -n '29p' .ufo/waves/round-16/w1/DraftSources.md
1. S020's recorded anchor is stale. The live spec is "Draft Community Group Report,
20 October 2026", meta revision `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, which
equals the webmcp repo HEAD at fetch time. The recorded `f14762e6` (2026-10-16) is
not in the page. The C2 contract should cite cb3d1696.

$ sed -n '34,38p' .ufo/waves/round-16/w1/SrcSpecCore.md
- Live revision: **`cb3d1696`**, dated **2026-10-20** ...
- Recorded S020 revision was **`f14762e6`** ... i.e. the recorded revision is **superseded**

$ sed -n '77p' corpus/knowledge/webmcp-chromium-loopback-round-16.md
| Entry point | `partial interface Document { ... }` (§4.1, rev `cb3d1696`) | ...
```

My own same-day fetch is a third identity:

```
$ curl -sS -L https://webmachinelearning.github.io/webmcp/ -o /tmp/attack-src/spec.html
http=200 bytes=511987
$ grep -n 'name="revision"' /tmp/attack-src/spec.html
11:  <meta content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision">
$ grep -n '20 October 2026' /tmp/attack-src/spec.html
844:    <time class="dt-updated" datetime="2026-10-20">20 October 2026</time></p>
$ printf 'f14762e6=%s cb3d1696=%s 51ed7565=%s\n' ... 
f14762e6=0 cb3d1696=0 51ed7565=1
```

The page is a moving CG draft (both recorded revisions are gone from the live
bytes). That is not itself a contradiction — the row anchor is a snapshot — but
the line claims an S020 re-open and the contract-mandated old→new record of the
`queued→mined` / `used-by —→note` change is missing. The note cites `cb3d1696`;
the row cites `f14762e6`; the URL
now serves `51ed7565`. No registry-side artifact reconciles them (the w1 reports
document the live move; the registry does not), and no `supersedes S020 —` row
exists:

```
$ grep -n 'supersedes S020' corpus/SOURCES.md
(no output)
```

Remediation: add the lesson old→new entry with the exact revision L1 re-fetched
(cb3d1696 at the seats' fetch, or 51ed7565 at a later fetch), and either a
`supersedes S020 —` row or an explicit line-level statement of the delta.

### F3 (MEDIUM, adjacent) — the registry preamble still claims every row was opened 2026-10-19

```
$ sed -n '3,8p' corpus/SOURCES.md
Every row below was opened in kaika fleet round-1 (2026-10-19) by the seat named in
`corpus/lessons/kaika-fleet-round-1.md` §Gate, which carries each row's URL, access
date, ≤25-word quote with location, and raw-fetch sha256.
```

The only qualification is:

```
$ grep -n 'Registry preamble qualification' corpus/SOURCES.md
73:- Registry preamble qualification (round14): "Every row below" above describes
original S001–S028 only. S029 was opened in round14; ...
```

S030–S039 were opened 2026-10-20 (`opened` cells), and S030–S036 are `mined`;
the round-16 line adds no preamble qualification. The fleet contract requires the
evidence in the round lesson, which is F1. This is a literal falsehood in the
same file, caused by the 10-row inclusion, even though it is outside the named
line.

### F4 (LOW) — the S021 row anchor left behind by the exclusion is stale

The log's S021 exclusion is accurate for its named claim: `SrcAgentsDocs.md:25`
(F1) finds zero WebMCP text and `:75` (F4) decides "S021 stays `queued`"; the row
is still `queued`. But the same seat's F2 (`:57-62`) found a machine-readable date
marker:

> HTTP header: `last-modified: Sun, 22 Mar 2026 00:00:00 GMT`. In-document ...
> `"dateModified": "2026-03-22"` ... No visible "Last updated" line.

The row still says `rolling docs, no revision marker, read 2026-10-19`
(`SOURCES.md:35`). The log does not repeat that false cell, so this is a residual
row-quality defect, not a contradiction of the named exclusion.

### F5 (LOW) — a two-seat row recommendation is absent from both registry and enumerated exclusions

`SrcAgentsDocs.md:93-123` (F5) and `SrcChromeDocs.md:216` (item 10) both recommend
`https://developer.chrome.com/docs/devtools/agents/webmcp-debugging` as a row,
with an explicit "emit one row only" note. It is in neither the registry nor the
note:

```
$ grep -c 'webmcp-debugging' corpus/SOURCES.md corpus/knowledge/webmcp-chromium-loopback-round-16.md
corpus/SOURCES.md:0
corpus/knowledge/webmcp-chromium-loopback-round-16.md:0
```

The log's enumerated exclusions do not mention it. The line explicitly disclaims
identified/screened totals ("fifteen seats searched independently and their
per-seat counts were not normalised"), so this is an enumeration/decision gap, not
a false statement. It is the one w1 row recommendation with no recorded decision.

## Named mapping (line 76 and Paths §native-webmcp vs w1)

| Named item | w1 evidence (path:line) | Verdict |
|---|---|---|
| Seat roster: 15 names | `w1/spec.json` source items: 13 `Src*` + `RevengeDevtoolsFrontend` + `DraftSources`; all have reports; `SourcesStaging` is a separate non-search staging seat | **HOLDS** |
| `Included 10 new rows (S030–S039: 7 mined, 1 queued, 2 rejected)` | `git show 8f7feb3:corpus/SOURCES.md` status count: S030–S036 `mined`, S037 `queued`, S038/S039 `rejected`; rows exist; S033/S034/S035/S036 digests match my fetches | **HOLDS** |
| `plus the S020 re-open` | `SrcSpecCore.md:34-38`, `DraftSources.md:29`: live `cb3d1696` supersedes `f14762e6`; row `34` still `f14762e6`; note `77` cites `cb3d1696`; no lesson/supersedes row | **BREAKS** (record) |
| `L1 re-fetched S020, S033, S034 and S036 itself` | S033/S034/S036 row digests match upstream; no artifact records L1's fetch; the lesson that would hold it is absent | **UNPROVEN** |
| Excluded: main-branch copies of IDL/flags superseded by 154-tag rows | `SrcChromiumIdl.md:22` — main is `158.0.8115.0`, "4 versions ahead of host; do not attribute main-only members to 154"; `SrcChromiumFlags.md:39,55` — `WebMCPTesting` `ABSENT` at main, `present only at 154` | **HOLDS** |
| Excluded: the CDP viewer redirect shell | `SrcCdpTot.md:10` — `The page exists (HTTP 200) but is not prose: it is a 1,555-byte generated redirect shim` | **HOLDS** |
| Excluded: S021 (re-opened; no WebMCP text, stays queued) | `SrcAgentsDocs.md:25` (zero WebMCP), `:75` (stays queued); registry `S021` is `queued` | **HOLDS** (anchor F4) |
| Excluded: WPT `webmcp/` and Chromium web_tests (leads, not cited) | `SrcWpt.md:232` — `## 3. What the test surfaces establish for C2 (lead quality)`; note has 0 WPT/web_tests mentions | **HOLDS** |
| Excluded: Fastly post whose 149–156 window chromestatus confirms (drafted rejection withdrawn) | Fastly sha256/quote match; chromestatus stage 150 `149/156`; draft flip condition met (below) | **HOLDS** |
| Excluded: two further `navigator.modelContext` guides (redundant with S038/S039) | `SrcRejects.md` R2/R3: both opened, both assert `navigator.modelContext`; neither tabled; R3 additionally asserts `provideContext()`/`.well-known` | **HOLDS** as characterization; R3 extras are a residual |
| Excluded: pages behind 403/rate limits | `SrcRejects.md:166` Medium HTTP 403; `:186` Firecrawl 403/bot walls; `DraftSources.md:14` GitHub API rate limit; `SrcChromiumPdl.md:216-217` gitiles `403: Forbidden` | **HOLDS** |
| Path chain `S020 → S030 → … → S036` and "Ends at knowledge/...; runtime-held ... flags only" | note header `1-8` lists exactly S020, S030–S036; note line 12 `Locally measured: yes, for one build, flag-enabled, loopback fixtures only`; rows' `teaches` match the path descriptors | **HOLDS** |
| Stop: "every receipt case and divergence row in the note traces to an opened primary source or to the lane's own receipt" | receipt 11/11 and first-run 8/11; S034/S035/S036 citations; `features.cc:571` read by `SrcChromiumFlags.md:67` | **HOLDS** |

Row digests verified independently (all four match the SOURCES anchor cells):

```
S033 model_context_supplement.idl @ tag 154.0.8037.97  sha256 50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364
S034 runtime_enabled_features.json5 @ tag 154.0.8037.97 sha256 99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b
S035 WebMCP.pdl @ chromium main                      sha256 f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f
S036 WebMCPModel.ts @ devtools-frontend 66df492      sha256 c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632
```

Status count:

```
$ git show 8f7feb3:corpus/SOURCES.md | awk -F'|' '/^\| S03[0-9] / {gsub(/^ +| +$/,"",$2); gsub(/^ +| +$/,"",$9); print $2, $9}'
S030 mined
S031 mined
S032 mined
S033 mined
S034 mined
S035 mined
S036 mined
S037 queued
S038 rejected
S039 rejected
```

## Fastly question — the withdrawal is justified

The drafted rejection (`drafts/DraftSources.md:22`) rejected the Fastly post *as a
source for the trial's end milestone*, with flip condition: "Chrome's origin-trial
registration page or the chromestatus entry states an end milestone."

The Fastly bytes and claim match the draft:

```
$ curl -sS -L 'https://www.fastly.com/blog/instantly-ai-agent-ready-webmcp-on-demand' -o fastly.html
http=200 bytes=162484
$ sha256sum fastly.html
1de89d7830956dcf0e6e68fb3d8a5d7b8e802d287c8c77bf599563d7871ee3d6  fastly.html
$ grep -o -i '.\{0,160\}149 through 156.\{0,100\}' fastly.html
... it&#39;s now in a <a ...> <u>public origin trial</u></a> running from Chrome 149 through 156,
with a local dev flag <code>(chrome://flags/#enable-webmcp-testing)</code> ...
```

(The sha256 is identical to `drafts/DraftSources.md` §C's `1de89d78…d3`.)

Chromestatus confirms the base window and the trial identity:

```
$ curl -sS -L 'https://chromestatus.com/api/v0/features/5117755740913664' | tail -n +2 | jq ...
$ jq -r '.stages[] | select(.stage_type==150) | [.desktop_first,.desktop_last,.origin_trial_id,.ot_chromium_trial_name] | @tsv'
149	156	4163014905550602241	WebMCP
$ jq -r '.stages[] | select(.stage_type==150) | .extensions[] | [.stage_type,.desktop_last] | @tsv'
151	162
```

The `origin_trial_id` matches the Fastly link's
`register_trial/4163014905550602241`. The post has **0** `modelContext`
occurrences, so it carries no hidden `navigator` API claim; it is a trial-window
claim only. The flip condition is met, so the withdrawal is justified and the
log's wording "whose 149–156 trial window chromestatus confirms" is accurate.

Residual: chromestatus also has OT extension stage 151 with `desktop_last 162`.
The Fastly post's "through 156" is the base stage, not the final extension end; a
reader could infer the trial ends at 156. The line calls it a "trial window", not
"the final end", so this is a qualification risk, not a contradiction. The post's
exclusion from the registry (rather than admission) is editorial and separate from
the rejection withdrawal.

## Path §native-webmcp — HOLDS

The note exists and its header lists exactly the path sources:

```
$ sed -n '1,12p' corpus/knowledge/webmcp-chromium-loopback-round-16.md
source: S020
source: S030
...
source: S036
verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97, loopback only)
recheck: on chromium package change; S020/S032 on-release
...
**Locally measured: yes, for one build, flag-enabled, loopback fixtures only.**
```

The Path's descriptors map to the rows' `teaches` cells (README declarative
exclusion → S030; explainer loose version → S031; Chrome trial/flag → S032;
154-tag IDL/flags → S033/S034; CDP domain → S035; DevTools consumer → S036). The
"runtime-held ... with flags only" clause matches the note's flag-enabled,
loopback-only scope and the receipt's flag list. The receipt retention is honest:

```
$ jq -r '{total:(.cases|length),passed:([.cases[]|select(.status=="pass")]|length),failed:([.cases[]|select(.status!="pass")]|length)}' corpus/evidence/round-16/webmcp/receipt-first-run-failed.json
{"total":11,"passed":8,"failed":3}
$ jq -r '.summary' corpus/evidence/round-16/webmcp/receipt.json
{"cases":11,"passed":11,"failed":0,"missing":0,...}
```

S036's "removal is inferred on navigation" matches `RevengeDevtoolsFrontend.md`'s
`executionContextDestroyed` finding and the fetched `WebMCPModel.ts:192-203`
(`this.#tools.delete(executionContext.frameId)` + `TOOLS_REMOVED`). The path's
first source is the revision-churn risk in F2; the Path text itself names no
revision, so it does not repeat the row/note mismatch.

## Exact commands and observations (summary)

```
git rev-parse HEAD                                          -> b444ca8e024f386124418169e8e400221524bba3
git cat-file -e b444ca8:corpus/lessons/round-16.md          -> fatal: path ... does not exist (exit 128)
git ls-tree -r --name-only b444ca8 corpus/lessons | grep -c 'round-16' -> 0
git show 8f7feb3:corpus/SOURCES.md | grep -c 'corpus/lessons/round-16.md' -> 1
node scripts/check-sources.mjs                              -> SOURCES_GATE verdict=clean rows=39 ... (exit 0)
git diff 8f7feb3 b444ca8 -- corpus/SOURCES.md               -> empty (line unchanged by commit B)
curl https://webmachinelearning.github.io/webmcp/           -> 200, 511987 bytes; meta revision 51ed7565...; 20 October 2026
grep counts in fetched spec                                 -> f14762e6=0, cb3d1696=0, 51ed7565=1
curl fastly.com/... (raw)                                    -> 200, 162484 bytes; sha256 1de89d78...; quote at "149 through 156"
curl chromestatus api v0/features/5117755740913664          -> stage 150 desktop_first=149 desktop_last=156 origin_trial_id=4163014905550602241
tag-154 IDL / flags / main PDL / devtools-frontend blobs     -> S033 50dd337d..., S034 99b92e67..., S035 f386bcfd..., S036 c23d575e... (all match rows)
```

## Residual risks and verification gaps

- **Spec churn.** The spec is rebuilt on push; my fetch (51ed7565) is later than
  the seats' (cb3d1696), and the row's anchor (f14762e6) is older than both. The
  line should record which revision L1 actually re-fetched. This is F2, not a
  claim that the IDL changed: the live page still exposes the `Document`
  `modelContext` attribute (the IDL is markup-split, so literal greps for
  `interface Document` fail; `modelContext=29`, `partial=3`).
- **Fastly extension.** Stage 151 `desktop_last 162` is not in the line; the base
  window is confirmed. If the lane later uses "the trial ends at 156" as a fact,
  it needs the extension qualification.
- **S021 anchor.** `SOURCES.md:35` still says "no revision marker"; F4.
- **Unrecorded candidate.** `webmcp-debugging` is recommended by two seats and
  absent from registry, note and enumerated exclusions; F5.
- **Preamble.** The "Every row below was opened ... (2026-10-19)" preamble still
  has no round-16 qualification; F3.
- **Not re-run:** C1/C2 counters, the WebMCP harness and the browser. Runtime
  statements here are read from the committed receipt and note, not re-observed.
  No non-author certification is implied.
- **Tooling:** none installed or upgraded; no pacman transaction attempted. All
  curl output was written under `/tmp/attack-src/`; the only lane write is this
  report.
