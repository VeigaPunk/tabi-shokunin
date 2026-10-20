# ConnectAdjacency — round-16 wave 2 (FALSIFY): note adjacency + SOURCES S037

Seat: `TabiR16.ConnectAdjacency` (connector, leaf). Author-side report; this is not a
non-author certification. Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3`.
Lane writes: only this file. All mutation probes were run in
`/tmp/tabi-r16-adj-sBmD` (clone kept); the lane tree was not modified. No tool was
installed or upgraded.

## Verdict: **BREAKS**

The note's §Adjacency names all five sibling lanes (kasegi and kagi in one clause) but **absorbs kaidoku's Core
`Runtime observation (CDP)` surface** into tabi's ownership sentence, and it presents a
split its own draft called contested as if settled, with no integrator ruling. Separately,
the note uses **SOURCES S037** (MCP 2026-07-28) as the basis of a decision-table claim while
S037 is `queued`, `used-by: —`, and outside the C2 counter's `source:` binding. No sibling's
evidence *bytes* were copied; the defect is **declared surface and source reporting**.

## Attack item

Question: does `corpus/knowledge/webmcp-chromium-loopback-round-16.md` §Adjacency
(lines 118–124) plus SOURCES S037 report adjacent ground rather than absorb it?

Method: each clause read against the five named sibling `PROVINCE.md` files
(`kaidoku`, `kumitate`, `kake`, `kasegi`, `kagi`); S037 traced from the note header
(lines 1–8) through the registry row (`corpus/SOURCES.md:51`) into the C2 counter
(`.ufo/waves/round-16/measure.mjs:204`).

## Clause-by-clause

| Note clause (line) | Sibling anchor | Observation | Verdict |
|---|---|---|---|
| `120` "Observing page-registered tools over CDP is tabi's browser craft." | tabi `PROVINCE.md:9-13` owns CDP session discipline — true for tabi. kaidoku `PROVINCE.md:53` Core row **"Runtime observation (CDP)"** (self-launched `chromium --headless --remote-debugging-port=9222`; `list_browser_targets`, `inspect-web-page`, `capture-browser-scenario`); `:128` "Runtime observation verbs" (`observe-web-session`, `observe-web-execution`). | The note's only kaidoku carve-out is line 121's single `discover_webmcp_tools` verb. The generic CDP runtime-observation surface kaidoku declares is not named. The note's harness performs that surface (`--remote-debugging-port=0`, `newCDPSession`). | **Absorbed / contest unreported** |
| `121` "The REA `discover_webmcp_tools` verb and MCP server registration are kaidoku's surface." | kaidoku `PROVINCE.md:44` REA MCP server; `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:608` exercised `discover-webmcp-tools` → `tools:{total:0}` (`ev_82dbdf0e…`); kumitate `corpus/knowledge/kimi-mcp-plane.md:67-68` agrees: "the `rea` MCP server registration itself is kaidoku's surface". | Consistent with kaidoku's Core rows and corpus, and with kumitate's own boundary. | Reported |
| `121-122` "the agent-side MCP plane is kumitate's" | kumitate `PROVINCE.md:20` frontier: "MCP protocol revisions as they bear on orchestration — `corpus/SOURCES.md` rows, queued"; `:14` is the K1–K5 block, and `SCORECARD.md:138` / `scripts/kimi-census.mjs:112` name the K2 member `plugins/managed/kimi-webbridge`; `:26` routes MCP/OAuth security to kasegi/kagi. | The note's Limits (115–116) reads `~/.kimi-code/plugins/managed/kimi-webbridge/` for a negative capability fact but does not name that the directory is a kumitate K2 member and tabi substrate (`tabi PROVINCE.md:6-7`). | Lane named; shared directory under-reported |
| `122` "authoring WebMCP tools for published properties is kake's" | kake `PROVINCE.md:3` scopes ds4cc.com, kimi.page/pro mirrors, Pages deploys; `:31` "kake owns publisher-side placement". Draft `DraftAdjacency.md` C-B: "kake covers its own properties … Third-party sites: no owner." | The note drops "own properties only" and "third-party unclaimed". | Over-broad; not a sibling claim |
| `122-123` "trust of page-declared metadata … is kasegi/kagi ground" | kasegi `PROVINCE.md:3` security research; `:40-49` adjacency list, no prompt-injection claim. kagi `PROVINCE.md:3` secrets & vault ops; `:63` adjacency list, no injection claim. kumitate `PROVINCE.md:26` is the only route: "MCP/OAuth security practice … → kasegi / kagi". | The note promotes kumitate's routing line to ownership; neither sibling `PROVINCE.md` claims it. The draft said "kagi (routed by kumitate)"; the note drops the qualifier. | Unclaimed assignment |
| `94` "Page tools are MCP tools" → "no: shared vocabulary only … S037 queued as adjacency" | S037 `corpus/SOURCES.md:51`: status `queued`, `used-by` `—`; note `source:` header lines 1–8 omits S037. | The note's MCP field/lifecycle comparison uses S037, but the row is recorded unused and the C2 counter never sees it. | **Unbound source use** |

## Counterexample 1 (main): kaidoku's CDP runtime surface is absorbed, not reported

Exact commands and observed output at the lane root:

```
$ sed -n '53p;128p' kaidoku-shokunin/PROVINCE.md
| Runtime observation (CDP) | self-launched targets: `chromium --headless --remote-debugging-port=9222`, `xvfb-run electron --remote-debugging-port=9223`; `list_browser_targets`, `inspect-web-page`, `list_electron_targets`, `inspect-electron-page`, `capture-browser-scenario` | `list-browser-targets http://127.0.0.1:9222` on own instance | both legs held r3 (05): CDP enumerate+inspect verified, connect-mode scenario capture ran |
| Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe); `node --inspect` needs a real file target (bare `file://` → `unsupported_location`) | `observe-web-session`, `observe-web-execution`, `observe-javascript-runtime`, `reconcile-javascript-runtime` | all held r4-08; `capture-electron-scenario` remains typed refusal (Playwright handshake, not app launch) |

$ nl -ba tabi-shokunin/scripts/webmcp-loopback-round16.mjs | sed -n '423p;623,624p'
   423	  const session = await context.newCDPSession(page);
   623	      '--remote-debugging-address=127.0.0.1',
   624	      '--remote-debugging-port=0',
```

The note's draft itself called this scope contested (excerpt; `…` marks omitted text and
line breaks were added for readability):

```
$ grep -n "C-A\|Ruling needed" .ufo/waves/round-16/w1/DraftAdjacency.md \
    .ufo/waves/round-16/drafts/DraftAdjacency.md
.ufo/waves/round-16/w1/DraftAdjacency.md:28:- **C-A** page-side tool observation via CDP — tabi vs kaidoku/REA
  (`discover_webmcp_tools` already in REA catalog) vs revenger. Proposed: tabi owns
  protocol-level method and its receipt; kaidoku owns the REA verb.
.ufo/waves/round-16/drafts/DraftAdjacency.md:35:**C-A — page-side tool observation via CDP.**
  Claimants: tabi … kaidoku … revenger. Overlap is real: the same CDP domain, the same
  loopback-endpoint discipline. … Proposed split for the integrator: tabi owns the
  protocol-level observation method and its receipt; kaidoku owns REA's verb and catalog.
  … Ruling needed …
```

No ruling is recorded in round 16; the only `C-A` references outside the w2 tree are the
drafts' own "Ruling needed" asks plus one ConnSiblings cross-reference (`w1/ConnSiblings.md:44`)
that points back to the draft. None is an integrator ruling. The note's final §Adjacency states the proposed split as
fact and drops revenger entirely. The fleet rule is explicit:

```
$ sed -n '457,461p' PROTOCOL.md
- One domain per shokunin; a domain belongs to one shokunin. Contested scope — evidence or work
  is reported in the lane report; the integrator arbitrates by refining `PROVINCE.md` and records
  the ruling in the round notes. A contested-scope report left unruled by the next completed round
  is re-flagged in the lane report, the round notes, and an open aggregator-ledger row;
  silence is not a ruling and must never default scope to whichever lane wrote first.
```

The note defaults the scope to the first writer (tabi) and narrows kaidoku to one verb. That
is the absorption: kaidoku's **generic** Core CDP runtime-observation row is not reported,
and the `discover_webmcp_tools` carve-out does not cover it.

## Counterexample 2: S037 is used but queued, unbound, and counter-invisible

Exact commands and observed output:

```
$ grep -n '^| S037 ' tabi-shokunin/corpus/SOURCES.md
51:| S037 | Model Context Protocol — Tools (2026-07-28) — https://modelcontextprotocol.io/specification/2026-07-28/server/tools | spec | A | MCP tool definition fields and tools/list, as adjacency context only | revision 2026-07-28, tools.md line 290 and line 62 | MCP tools share name, description and inputSchema vocabulary with WebMCP but are listed and called differently; adjacency, not equivalence | queued | 2026-10-20 | on-release | — |

$ nl -ba tabi-shokunin/corpus/knowledge/webmcp-chromium-loopback-round-16.md | sed -n '1,9p;94p'
     (excerpt: lines 3–7 omitted, marked `…`)
     1	source: S020
     2	source: S030
     …
     8	source: S036
     9	verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97, loopback only)
    94	| "Page tools are MCP tools" | — | **no**: shared vocabulary only (`name`, `description`, `inputSchema`; S037 queued as adjacency); result shapes and lifecycles differ |

$ sed -n '204p' .ufo/waves/round-16/measure.mjs
  const cited = [...noteText.matchAll(/^source: (S\d{3,})\b/gm)].map((m) => m[1]);

$ node .ufo/waves/round-16/measure.mjs b444ca8 --claim C2 | python3 -c \
    'import json,sys;d=json.load(sys.stdin);print(d["c2_webmcp_held"], d["cited"])'
1 ['S020', 'S030', 'S031', 'S032', 'S033', 'S034', 'S035', 'S036']
```

S037 is cited at line 94 but is not a `source:` header line, so the C2 counter's `cited`
list excludes it. The row's `used-by: —` is therefore false under the SOURCES contract
(`mined` = cited by ≥1 path in `used-by`; `used-by` = knowledge entries citing the row).
The note's own phrase "S037 queued as adjacency" describes the registry state; it does not
bind the citation, and the registry is what the gate and a later reader consult.

Controlled mutation in `/tmp/tabi-r16-adj-sBmD/repo` (clone of the lane at `b444ca8`;
JSON prefixes shown, `…` marks omitted array members):

```
# 1) add `source: S037` to the note header, commit
$ git commit -m "probe: bind S037 in note header"   # HEAD 4514431012c6a849c1c28e83146ffa7cec555e5e
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C2
  "c2_webmcp_held":0,"cited":["S020",…,"S037"],"failures":["S037 status queued","S037 used-by lacks note"]

# 2) additionally set S037 status mined and used-by the note, commit
$ sed -i '/^| S037 |/ s/| queued | 2026-10-20 | on-release | — |/| mined | 2026-10-20 | on-release | corpus\/knowledge\/webmcp-chromium-loopback-round-16.md |/' corpus/SOURCES.md
$ git commit -m "probe: mine S037 and add used-by"   # HEAD e2bb5f3d56d61ddc070b246c92b55c7007f17267
$ node .ufo/waves/round-16/measure.mjs HEAD --claim C2
  "c2_webmcp_held":1,"cited":["S020",…,"S037"],"failures":[]
```

So the note's MCP comparison can be honestly bound with no loss of C2 count; the current
state instead leaves it outside the machine-checked source set. The row's anchor is sound:
re-opened the row's `tools.md` twin 2026-10-20 (fetch sha256
`09be49a064940ef288b47f8df09e95e6e3dc087c3f94e466acd60ec66dff25c3`), line 62
"Servers that declare the `tools` capability **MUST** respond to `tools/list` requests";
the cited line 290 is `inputSchema`, while `name` and `description` are lines 286/288 in
the same field list (a minor anchor gap: the row's `teaches` names three fields, the
`anchor` cites one line for them). The defect under attack is binding, not the source.

Feasibility note: C2's `countedInputs` include the note and `corpus/SOURCES.md`
(`corpus/evidence/round-16/measurement-binding.json` C2 entry). Any edit to either after
`b444ca8` is a counted-input change:

```
$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at HEAD
MEASUREMENT_BINDING verdict=failed claims=2 bound=1
finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md,corpus/knowledge/webmcp-chromium-loopback-round-16.md
exit=1
```

With the manifest's C2 `measuredRevision`/`after` moved to the new HEAD and the S037
binding in place, the same gate is clean:

```
$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at HEAD --reproduce
MEASUREMENT_BINDING verdict=clean claims=2 bound=2
exit=0
```

So the correction is feasible, but it must re-measure C2 at the delivered revision.

## Impacted axes

- **Adjacency:** the §Adjacency does not name the contested kaidoku CDP scope; it states an
  unruled split. It also broadens kake and promotes kumitate's MCP/OAuth routing to kagi
  ownership. This is the axis the note's section claims to serve.
- **Coverage / C2:** the S037 use is outside the source binding; the C2 count is insensitive
  to it. A `c2_webmcp_held: 1` does not witness the note's MCP comparison source.
- **Quality / freshness:** `corpus/SOURCES.md:51` says S037 is unused while the note cites it;
  `check-sources.mjs` passes because it checks declared `used-by` paths, not the converse.

## Smallest safe correction (proposal; not applied by this seat)

1. In the note §Adjacency, say the kaidoku CDP runtime-observation scope is **contested**
   and pending an integrator ruling, naming kaidoku `PROVINCE.md:53,128` and revenger's
   browser-runtime evidence; keep the `discover_webmcp_tools`/MCP-server split as a
   proposal, not a ruling.
2. Say kake owns authoring **on its own properties only**; third-party authoring is
   unclaimed (draft C-B). Say the trust question is routed to kasegi and, via kumitate
   `PROVINCE.md:26`, to kagi; neither sibling `PROVINCE.md` claims it.
3. Name the shared `~/.kimi-code/plugins/managed/kimi-webbridge/` directory (tabi
   `PROVINCE.md:6-7`; kumitate K2 `PROVINCE.md:14` + `SCORECARD.md:138`), which the
   draft's C-D raised and the final note drops.
4. Bind S037 honestly: add `source: S037`, change its status to `mined` and `used-by` to the
   note, and change line 94 from "S037 queued as adjacency" to the bound wording. The row is
   A-tier and opened, and the anchor was re-opened this session. Alternative: drop the
   S037-specific field/lifecycle claim and keep only S020's page-tools-as-MCP-servers analogy,
   leaving MCP protocol ground to kumitate.
5. Re-measure C2 at the new delivered revision and update the binding manifest (`C2` entry);
   the probe above shows the count stays 1 and the gate is clean.

## Verification for the main agent

```
grep -n "contested\|ruling" tabi-shokunin/corpus/knowledge/webmcp-chromium-loopback-round-16.md
grep -n "^source: S037" tabi-shokunin/corpus/knowledge/webmcp-chromium-loopback-round-16.md
grep -n "^| S037 " tabi-shokunin/corpus/SOURCES.md          # mined + used-by the note, if bound
node tabi-shokunin/scripts/check-sources.mjs                # expect clean
node tabi-shokunin/.ufo/waves/round-16/measure.mjs <newrev> --claim C2   # expect 1, cited includes S037
node tabi-shokunin/scripts/check-measurement-binding.mjs --check \
  tabi-shokunin/corpus/evidence/round-16/measurement-binding.json --at <newrev> --reproduce
node tabi-shokunin/scripts/selftest-measurement-binding.mjs
node tabi-shokunin/scripts/check-round-contract.mjs
```

Expected: the contest wording is present; if bound, S037 is `mined` with the note in
`used-by`; source gate clean; C2 remains 1; binding gate clean at the new measured revision.
If S037 is not bound, the note must not make the field/lifecycle claim from it.

## Limits

- No sibling runtime was probed and no sibling file was edited; the finding is against
  `PROVINCE.md` text and the lane's own registry/counter, not against sibling behavior.
- "Absorbed" here means declared surface (kaidoku's Core CDP row) and source use (S037), not
  copied evidence bytes. The note's own harness output is tabi's.
- S037 was re-opened this session (2026-10-20); the cited lines hold (line 62 `tools/list`,
  line 290 `inputSchema`), with the minor anchor gap noted above. The finding is that the
  note uses the row while the registry and C2 binding do not see it.
- The clone `/tmp/tabi-r16-adj-sBmD` was kept for reproducibility; the lane tree is unchanged.
- Tools installed/upgraded: none.
