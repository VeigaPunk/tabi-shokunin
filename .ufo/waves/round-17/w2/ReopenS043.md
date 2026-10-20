VERDICT: HOLDS

Attacked: SOURCES row S043 at M (`corpus/SOURCES.md:57`, commit 6c97851034e9d8f58b135d28ff969f1f28fa2f7d) —
re-fetched its pinned source (`webmachinelearning/webmcp@51ed7565…:index.bs`) and the rendered page,
resolved the URL, verified commit identity, both recorded sha256s, the §3/§4.2 line anchors, the wave-1
Gate quote, tier/scope/teaches honesty, and status/used-by consistency; ran the SOURCES gate over an
`git archive` of the M tree.

Observed evidence (all commands run 2026-10-20):

URL + revision
- `curl -o /dev/null -w '%{http_code}'` on the row's exact blob URL → `200`; commit API → `200`.
- Raw fetch of the pinned blob → `HTTP 200`, 91001 bytes, 2053 lines, sha256
  `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004` — byte-identical to the
  dossier's recorded hash (`.ufo/waves/round-17/sources/SpecExecute.md` §1).
- Commit `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`: committer date `2026-10-20T14:57:14Z`
  (= 10:57 -0400, matching the dossier), message "Discuss general agent ecosystem risks and link to
  agent security guidance (#334)", parent `cb3d16964ab3`, only file `index.bs` `+55/-0`. Repo
  `branches/main` head is the same 40-hex at check time, so the row pins today's main.
- Rendered page `https://webmachinelearning.github.io/webmcp/` → `HTTP 200`, 511987 bytes, sha256
  `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` (exact dossier value), meta
  `revision` = `51ed7565…`; page and blob agree.

Anchors (line numbers at the pinned blob)
- Rendered section numbers confirm the row's § labels: `supporting-concepts` renders `3.`,
  `model-context-container` renders `4.2.`, `observations` renders `5.2.`.
- `executeTool`: `<div algorithm>` at `index.bs:1023`, dfn at 1024, last step at 1183, block closes
  1185, `<h4 id="model-context-tool">` at 1187 → the row's "§4.2 executeTool lines 1023-1185" is exact.
- Error table unit: dfn lead-in 260-262, `<table dfn-for="tool execution error">` 264-291, exception-name
  note 293-301 → "§3 error table lines 260-301" covers the whole unit (table proper 264-291) and the
  note that yields the DOMException mapping the row's teaches relies on.

Gate quote (dossier §9)
- Quote: "Despite the name of this API (i.e., WebMCP), this specification does not prescribe the format
  in which tools are exposed to the browser agent." = 24 words.
- Exact substring of the rendered page's stripped text (`html.unescape(re.sub('<[^>]+>',''))` → `exact
  match: True`). Raw `index.bs:1570-1572` carries the same sentence with `Web*MCP*` and
  `[=browser agent=]` markup; the entry states "verbatim from the rendered page's text", so the claim
  is correctly scoped. The note sits in §5.2, which is explicitly marked non-normative at 1480-1482.

Absence claims backing `teaches`
- `grep -c 'ModelContextClient\|requestUserInteraction' index.bs` → `0`; `grep -ci declarative` → `0`.
- No `CDP`/`DevTools`/`invokeTool` token anywhere; only MCP bibliography/prose mentions. The spec
  prescribes no agent-side invocation format.
- Removal commits named in the dossier resolve on GitHub: `067a1c9…` (`Remove ModelContextClient`, 2026-06-11)
  and `14ae813…` (`Remove declarative API from the spec for now (#338)`, 2026-10-08).

Tier / scope / teaches
- kind `spec`, tier `A`, scope "normative WebMCP tool execution, execution-error mapping and
  ToolAnnotations at one commit": the algorithms are normative Bikeshed `<div algorithm>` text, the
  error table and `ToolAnnotations` IDL/prose (1203-1208, 1256-1269) are in normative sections; tier A
  scoped to that text is within SOURCES contract v1.
- teaches' operative claim — agent-side invocation not specified, receipt build-scoped — is exactly what
  the §5.2 note and the whole-file absence show. No inflation.

Status / used-by
- Row parses NF=13 (11 cells); enums valid (`spec`/`A`/`mined`), `opened` 2026-10-20 (today),
  `recheck` `on-release` (allowed cadence), `used-by` = `corpus/knowledge/webmcp-invocation-round-17.md`.
- That note exists at M (10883 bytes), header `source: S043` plus 6 further `S043` citations; its four
  S043 anchors verified: `:555-560` (JSON-parse + is-Object, no schema check), `:639-643`
  (unregister does not cancel), `:260-301` (exception names), `:1570-1572` (no agent-side format).
  `inputSchema` never occurs inside 1023-1185 or 547-621 (grep 0), so "schema not validated by the
  algorithm" is sound.
- Registry §Paths line for `webmcp-invocation` includes S043 and ends at the citing note.
- Gate run on `git archive 6c978510… corpus scripts`: `SOURCES_GATE verdict=clean rows=53
  tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`, exit 0; `--self-test` 26/26 PASS.
  No `used_by_missing` / `used_by_uncited` / `bare_anchor` / `tier_inflation` finding for S043.

Nits (non-blocking, no row edit required)
1. Gate location `index.bs:1570-1572` over-includes line 1572, which opens the *next* sentence
   ("Browsers are free to distill …"); the quoted sentence ends on 1571. A tighter citation is
   1570-1571.
2. The dossier's markup parenthetical names only `[=browser agent=]`; the raw line also carries
   `Web*MCP*`. Rendered text (what the entry claims to quote) is still exact, so this is an incomplete
   note, not a false quote.
3. `teaches` says the draft "fixes only in-page executeTool and its DOMException names"; the page-side
   contract also fixes `toolactivated`/`toolcancel`, the JSON-string success result and the `tools`
   permissions policy. The contrast with the unspecified agent side is correct; a fuller phrasing would
   read "only the page-side executeTool contract". No downstream citation depends on the omission.

Repair: none — the row's claims survive re-fetch, re-anchor and gate.

Cleanup: sandbox `/tmp/tabi-r17w2-ReopenS043-3092` (index.bs, page.html, M-extracted corpus+scripts)
removed after the run. No tool installs or upgrades. No browser launched.

Files written: .ufo/waves/round-17/w2/ReopenS043.md
